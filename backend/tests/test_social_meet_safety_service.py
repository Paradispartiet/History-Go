from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from app.domains.social_meet.models import ProfileVisibility, SocialMeetProfileRecord
from app.domains.social_meet.safety_models import (
    BlockScope,
    BlockStatus,
    BlockView,
    CreateBlockRequest,
    CreateReportRequest,
    ExportedInvite,
    ReportDetailCode,
    ReportReasonCode,
    ReportStatus,
    SubmittedReportView,
)
from app.domains.social_meet.safety_service import SocialMeetSafetyService
from app.domains.social_meet.service import SocialMeetDomainError

_PROFILE_ID_UNSET = object()


class FakeIdentityRepository:
    def __init__(
        self,
        actor: SocialMeetProfileRecord,
        targets: dict[UUID, SocialMeetProfileRecord] | None = None,
    ) -> None:
        self.actor = actor
        self.targets = targets or {}

    def get_or_create_for_user(self, auth_user_id: UUID) -> SocialMeetProfileRecord:
        assert auth_user_id == self.actor.auth_user_id
        return self.actor

    def get_profile_by_public_id(self, profile_id: UUID) -> SocialMeetProfileRecord | None:
        return self.targets.get(profile_id)


class FakeSafetyRepository:
    def __init__(self) -> None:
        self.blocks: list[BlockView] = []
        self.reports: list[SubmittedReportView] = []
        self.invites: list[ExportedInvite] = []
        self.blocked = False
        self.deleted_at: datetime | None = None
        self.deleted_profile_id: UUID | None = None

    def list_blocks(self, blocker_profile_id: UUID) -> list[BlockView]:
        return self.blocks

    def create_block(self, blocker_profile_id: UUID, request: CreateBlockRequest) -> BlockView:
        block = _block(request.blocked_profile_id)
        self.blocks.append(block)
        return block

    def remove_block(self, blocker_profile_id: UUID, block_id: UUID) -> BlockView | None:
        for block in self.blocks:
            if block.block_id == block_id:
                return block.model_copy(
                    update={
                        "status": BlockStatus.REMOVED_BY_BLOCKER,
                        "removed_at": datetime(2026, 7, 20, 13, 0, tzinfo=UTC),
                    }
                )
        return None

    def interaction_is_blocked(self, first_profile_id: UUID, second_profile_id: UUID) -> bool:
        return self.blocked

    def create_report(
        self, reporter_profile_id: UUID, request: CreateReportRequest
    ) -> SubmittedReportView:
        report = _report(request.reported_profile_id)
        self.reports.append(report)
        return report

    def list_submitted_reports(self, reporter_profile_id: UUID) -> list[SubmittedReportView]:
        return self.reports

    def get_submitted_report(
        self, reporter_profile_id: UUID, report_id: UUID
    ) -> SubmittedReportView | None:
        return next((report for report in self.reports if report.report_id == report_id), None)

    def list_participant_invites(self, auth_user_id: UUID) -> list[ExportedInvite]:
        return self.invites

    def get_deleted_at(self, auth_user_id: UUID) -> datetime | None:
        return self.deleted_at

    def mark_social_meet_deleted(self, auth_user_id: UUID, deleted_at: datetime) -> UUID | None:
        self.deleted_at = deleted_at
        return self.deleted_profile_id


def test_safety_controls_require_stable_profile_id() -> None:
    actor = _record(profile_id=None)
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), FakeSafetyRepository())

    with pytest.raises(SocialMeetDomainError) as error:
        service.list_blocks(actor.auth_user_id)

    assert error.value.code == "profile_not_published"


def test_profile_cannot_block_itself() -> None:
    actor = _record()
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), FakeSafetyRepository())

    with pytest.raises(SocialMeetDomainError) as error:
        service.create_block(
            actor.auth_user_id,
            CreateBlockRequest(blocked_profile_id=actor.profile_id),
        )

    assert error.value.code == "invalid_block_target"


def test_unknown_block_target_is_non_enumerating_unavailable() -> None:
    actor = _record()
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), FakeSafetyRepository())

    with pytest.raises(SocialMeetDomainError) as error:
        service.create_block(
            actor.auth_user_id,
            CreateBlockRequest(blocked_profile_id=uuid4()),
        )

    assert error.value.code == "recipient_unavailable"


def test_create_and_remove_block_use_private_actor_identity() -> None:
    actor = _record()
    target = _record()
    safety = FakeSafetyRepository()
    service = SocialMeetSafetyService(
        FakeIdentityRepository(actor, {target.profile_id: target}),
        safety,
    )

    block = service.create_block(
        actor.auth_user_id,
        CreateBlockRequest(
            blocked_profile_id=target.profile_id,
            source_surface="spotmeeting_inbox",
        ),
    )
    removed = service.remove_block(actor.auth_user_id, block.block_id)

    assert block.blocked_profile_id == target.profile_id
    assert block.status is BlockStatus.ACTIVE
    assert removed.status is BlockStatus.REMOVED_BY_BLOCKER
    assert not hasattr(block, "blocker_profile_id")


def test_remove_unknown_block_is_non_enumerating_not_found() -> None:
    actor = _record()
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), FakeSafetyRepository())

    with pytest.raises(SocialMeetDomainError) as error:
        service.remove_block(actor.auth_user_id, uuid4())

    assert error.value.code == "block_not_found"


def test_interaction_gate_blocks_either_direction() -> None:
    actor = _record()
    target = _record()
    safety = FakeSafetyRepository()
    safety.blocked = True
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), safety)

    assert service.interaction_is_blocked(actor.profile_id, target.profile_id) is True
    with pytest.raises(SocialMeetDomainError) as error:
        service.ensure_interaction_allowed(actor.profile_id, target.profile_id)

    assert error.value.code == "interaction_blocked"


def test_report_receipt_never_exposes_reporter_identity() -> None:
    actor = _record()
    target = _record()
    service = SocialMeetSafetyService(
        FakeIdentityRepository(actor, {target.profile_id: target}),
        FakeSafetyRepository(),
    )

    receipt = service.create_report(
        actor.auth_user_id,
        CreateReportRequest(
            reported_profile_id=target.profile_id,
            reason_code=ReportReasonCode.UNSAFE_BEHAVIOR,
            structured_details=[ReportDetailCode.REPEATED_UNWANTED_INVITES],
        ),
    )

    assert receipt.status is ReportStatus.SUBMITTED
    assert not hasattr(receipt, "reporter_profile_id")
    assert not hasattr(receipt, "reported_profile_id")


def test_profile_cannot_report_itself() -> None:
    actor = _record()
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), FakeSafetyRepository())

    with pytest.raises(SocialMeetDomainError) as error:
        service.create_report(
            actor.auth_user_id,
            CreateReportRequest(
                reported_profile_id=actor.profile_id,
                reason_code=ReportReasonCode.SPAM,
            ),
        )

    assert error.value.code == "invalid_report_target"


def test_missing_submitted_report_is_not_enumerated() -> None:
    actor = _record()
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), FakeSafetyRepository())

    with pytest.raises(SocialMeetDomainError) as error:
        service.get_submitted_report(actor.auth_user_id, uuid4())

    assert error.value.code == "report_not_found"


def test_export_contains_safe_social_identity_and_participant_records() -> None:
    actor = _record()
    target = _record()
    safety = FakeSafetyRepository()
    safety.blocks = [_block(target.profile_id)]
    safety.reports = [_report(target.profile_id)]
    safety.invites = [_invite(target.profile_id)]
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), safety)
    generated_at = datetime(2026, 7, 20, 14, 0, tzinfo=UTC)

    exported = service.export_current_user(actor.auth_user_id, now=generated_at)
    payload = exported.model_dump(mode="json", by_alias=True)

    assert exported.generated_at == generated_at
    assert exported.profile.user_id == actor.social_user_id
    assert exported.profile.profile_id == actor.profile_id
    assert exported.blocks[0].blocked_profile_id == target.profile_id
    assert exported.reports_submitted[0].reported_profile_id == target.profile_id
    assert exported.participant_invites[0].counterparty_profile_id == target.profile_id
    assert "authUserId" not in str(payload)
    assert "reporterProfileId" not in str(payload)


def test_export_without_public_profile_still_returns_private_identity_and_invites() -> None:
    actor = _record(profile_id=None)
    safety = FakeSafetyRepository()
    safety.invites = [_invite(None)]
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), safety)

    exported = service.export_current_user(actor.auth_user_id)

    assert exported.profile.profile_id is None
    assert exported.blocks == []
    assert exported.reports_submitted == []
    assert len(exported.participant_invites) == 1


def test_social_meet_delete_creates_tombstone_without_deleting_auth_account() -> None:
    actor = _record()
    safety = FakeSafetyRepository()
    safety.deleted_profile_id = actor.profile_id
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), safety)
    deleted_at = datetime(2026, 7, 20, 15, 0, tzinfo=UTC)

    result = service.delete_social_meet_account(actor.auth_user_id, now=deleted_at)

    assert result.status == "deleted"
    assert result.profile_id == actor.profile_id
    assert result.deleted_at == deleted_at
    assert safety.deleted_at == deleted_at


def _record(profile_id: UUID | None | object = _PROFILE_ID_UNSET) -> SocialMeetProfileRecord:
    if profile_id is _PROFILE_ID_UNSET:
        resolved_profile_id: UUID | None = uuid4()
    elif profile_id is None or isinstance(profile_id, UUID):
        resolved_profile_id = profile_id
    else:
        raise AssertionError("Invalid profile id fixture value")

    return SocialMeetProfileRecord(
        auth_user_id=uuid4(),
        social_user_id=uuid4(),
        profile_id=resolved_profile_id,
        display_name="Ada",
        avatar_ref="avatar_generated_01",
        short_bio="Industrial history",
        preferred_themes=("industrial_history",),
        favorite_eras=("late_1800s",),
        interest_places=("factory_towns",),
        learning_goals=("compare_sources",),
        knowledge_badges=(),
        knowledge_fingerprint_summary={"themeTags": ["industrial_history"]},
        profile_visibility=ProfileVisibility.DISCOVERABLE,
        consent_version="social_meet_identity_v1",
        consented_at=datetime(2026, 7, 20, 10, 0, tzinfo=UTC),
        updated_at=datetime(2026, 7, 20, 12, 0, tzinfo=UTC),
    )


def _block(blocked_profile_id: UUID) -> BlockView:
    timestamp = datetime(2026, 7, 20, 12, 0, tzinfo=UTC)
    return BlockView(
        block_id=uuid4(),
        blocked_profile_id=blocked_profile_id,
        scope=BlockScope.SOCIAL_MEET,
        related_invite_id=None,
        related_context=None,
        status=BlockStatus.ACTIVE,
        source_surface="spotmeeting_inbox",
        created_at=timestamp,
        updated_at=timestamp,
        removed_at=None,
    )


def _report(reported_profile_id: UUID) -> SubmittedReportView:
    timestamp = datetime(2026, 7, 20, 12, 0, tzinfo=UTC)
    return SubmittedReportView(
        report_id=uuid4(),
        reported_profile_id=reported_profile_id,
        related_invite_id=None,
        related_context=None,
        reason_code=ReportReasonCode.UNSAFE_BEHAVIOR,
        structured_details=[ReportDetailCode.REPEATED_UNWANTED_INVITES],
        status=ReportStatus.SUBMITTED,
        source_surface="spotmeeting_inbox",
        created_at=timestamp,
        updated_at=timestamp,
    )


def _invite(counterparty_profile_id: UUID | None) -> ExportedInvite:
    timestamp = datetime(2026, 7, 20, 12, 0, tzinfo=UTC)
    return ExportedInvite(
        invite_id=uuid4(),
        direction="sent",
        counterparty_profile_id=counterparty_profile_id,
        context_type="place",
        context_id="factory_memory",
        context_title="Factory Memory",
        source_surface="place_card",
        preset_message_id="compare_place_learning",
        status="pending",
        created_at=timestamp,
        updated_at=timestamp,
    )
