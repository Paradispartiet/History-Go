from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from app.domains.social_meet.models import ProfileVisibility, SocialMeetProfileRecord
from app.domains.social_meet.safety_models import (
    BlockCreateRequest,
    BlockScope,
    BlockStatus,
    ReportCreateRequest,
    ReportReasonCode,
    ReportStatus,
    SocialMeetBlockRecord,
    SocialMeetReportRecord,
    StructuredReportDetail,
)
from app.domains.social_meet.safety_service import SocialMeetSafetyError, SocialMeetSafetyService
from app.domains.social_meet.service import SUPPORTED_CONSENT_VERSION

NOW = datetime(2026, 7, 20, 13, 0, tzinfo=UTC)


class FakeIdentityRepository:
    def __init__(
        self,
        actor: SocialMeetProfileRecord,
        *targets: SocialMeetProfileRecord,
    ) -> None:
        self.actor = actor
        self.targets = {
            target.profile_id: target for target in targets if target.profile_id is not None
        }

    def get_or_create_for_user(self, auth_user_id: UUID) -> SocialMeetProfileRecord:
        assert auth_user_id == self.actor.auth_user_id
        return self.actor

    def get_profile_by_public_id(self, profile_id: UUID) -> SocialMeetProfileRecord | None:
        return self.targets.get(profile_id)


class FakeSafetyRepository:
    def __init__(self) -> None:
        self.blocks: list[SocialMeetBlockRecord] = []
        self.reports: list[SocialMeetReportRecord] = []
        self.interaction_blocked = False
        self.invite_linked = True
        self.queue_raises = False
        self.audit_raises = False
        self.last_priority: str | None = None
        self.audit_actions: list[str] = []

    def list_active_blocks(self, blocker_profile_id: UUID) -> tuple[SocialMeetBlockRecord, ...]:
        return tuple(
            block
            for block in self.blocks
            if block.blocker_profile_id == blocker_profile_id
            and block.status is BlockStatus.ACTIVE
        )

    def upsert_block(
        self,
        blocker_profile_id: UUID,
        request: BlockCreateRequest,
    ) -> SocialMeetBlockRecord:
        block = _block(
            blocker_profile_id=blocker_profile_id,
            blocked_profile_id=request.blocked_profile_id,
            scope=request.scope,
            related_invite_id=request.related_invite_id,
        )
        self.blocks.append(block)
        return block

    def remove_block(
        self,
        blocker_profile_id: UUID,
        block_id: UUID,
    ) -> SocialMeetBlockRecord | None:
        for index, block in enumerate(self.blocks):
            if (
                block.block_id == block_id
                and block.blocker_profile_id == blocker_profile_id
                and block.status is BlockStatus.ACTIVE
            ):
                removed = _block(
                    block_id=block.block_id,
                    blocker_profile_id=block.blocker_profile_id,
                    blocked_profile_id=block.blocked_profile_id,
                    scope=block.scope,
                    related_invite_id=block.related_invite_id,
                    status=BlockStatus.REMOVED_BY_BLOCKER,
                    removed_at=NOW,
                )
                self.blocks[index] = removed
                return removed
        return None

    def create_report(
        self,
        reporter_profile_id: UUID,
        request: ReportCreateRequest,
    ) -> SocialMeetReportRecord:
        report = _report(
            reporter_profile_id=reporter_profile_id,
            reported_profile_id=request.reported_profile_id,
            related_invite_id=request.related_invite_id,
            reason_code=request.reason_code,
            structured_details=tuple(request.structured_details),
        )
        self.reports.append(report)
        return report

    def list_submitted_reports(
        self,
        reporter_profile_id: UUID,
    ) -> tuple[SocialMeetReportRecord, ...]:
        return tuple(
            report for report in self.reports if report.reporter_profile_id == reporter_profile_id
        )

    def get_submitted_report(
        self,
        reporter_profile_id: UUID,
        report_id: UUID,
    ) -> SocialMeetReportRecord | None:
        return next(
            (
                report
                for report in self.reports
                if report.reporter_profile_id == reporter_profile_id
                and report.report_id == report_id
            ),
            None,
        )

    def interaction_is_blocked(self, first_profile_id: UUID, second_profile_id: UUID) -> bool:
        return self.interaction_blocked

    def invite_links_users(
        self,
        invite_id: UUID,
        first_auth_user_id: UUID,
        second_auth_user_id: UUID,
    ) -> bool:
        return self.invite_linked

    def enqueue_report(self, report: SocialMeetReportRecord, *, priority: str) -> None:
        self.last_priority = priority
        if self.queue_raises:
            raise RuntimeError("queue unavailable")

    def write_audit(self, **kwargs: object) -> None:
        self.audit_actions.append(str(kwargs["action_type"]))
        if self.audit_raises:
            raise RuntimeError("audit unavailable")


def test_block_profile_is_private_and_audited() -> None:
    actor = _profile()
    target = _profile()
    repository = FakeSafetyRepository()
    service = SocialMeetSafetyService(FakeIdentityRepository(actor, target), repository)

    result = service.block_profile(
        actor.auth_user_id,
        BlockCreateRequest(blocked_profile_id=_profile_id(target)),
        request_id="request-123",
    )

    assert result.blocked_profile_id == target.profile_id
    assert result.status is BlockStatus.ACTIVE
    assert repository.audit_actions == ["block_profile"]
    assert not hasattr(result, "blocker_profile_id")


def test_block_and_report_reject_self_target() -> None:
    actor = _profile()
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), FakeSafetyRepository())
    actor_profile_id = _profile_id(actor)

    with pytest.raises(SocialMeetSafetyError) as block_error:
        service.block_profile(
            actor.auth_user_id,
            BlockCreateRequest(blocked_profile_id=actor_profile_id),
        )
    with pytest.raises(SocialMeetSafetyError) as report_error:
        service.submit_report(
            actor.auth_user_id,
            ReportCreateRequest(
                reported_profile_id=actor_profile_id,
                reason_code=ReportReasonCode.SPAM,
            ),
        )

    assert block_error.value.code == "invalid_safety_target"
    assert report_error.value.code == "invalid_safety_target"


def test_related_invite_must_link_both_profiles() -> None:
    actor = _profile()
    target = _profile()
    repository = FakeSafetyRepository()
    repository.invite_linked = False
    service = SocialMeetSafetyService(FakeIdentityRepository(actor, target), repository)

    with pytest.raises(SocialMeetSafetyError) as error:
        service.block_profile(
            actor.auth_user_id,
            BlockCreateRequest(
                blocked_profile_id=_profile_id(target),
                related_invite_id=uuid4(),
            ),
        )

    assert error.value.code == "unknown_invite"
    assert repository.blocks == []


def test_unblock_requires_an_owned_active_block() -> None:
    actor = _profile()
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), FakeSafetyRepository())

    with pytest.raises(SocialMeetSafetyError) as error:
        service.unblock_profile(actor.auth_user_id, uuid4())

    assert error.value.code == "unknown_block"


def test_report_remains_successful_when_queue_fanout_fails() -> None:
    actor = _profile()
    target = _profile()
    repository = FakeSafetyRepository()
    repository.queue_raises = True
    service = SocialMeetSafetyService(FakeIdentityRepository(actor, target), repository)

    result = service.submit_report(
        actor.auth_user_id,
        ReportCreateRequest(
            reported_profile_id=_profile_id(target),
            reason_code=ReportReasonCode.MINOR_SAFETY,
            structured_details=[StructuredReportDetail.MINOR_SAFETY_CONCERN],
        ),
    )

    assert result.status is ReportStatus.SUBMITTED
    assert repository.last_priority == "urgent"
    assert len(repository.reports) == 1
    assert not hasattr(result, "reporter_profile_id")


def test_audit_failure_does_not_undo_a_durable_block() -> None:
    actor = _profile()
    target = _profile()
    repository = FakeSafetyRepository()
    repository.audit_raises = True
    service = SocialMeetSafetyService(FakeIdentityRepository(actor, target), repository)

    result = service.block_profile(
        actor.auth_user_id,
        BlockCreateRequest(blocked_profile_id=_profile_id(target)),
    )

    assert result.status is BlockStatus.ACTIVE
    assert len(repository.blocks) == 1


def test_submitted_report_reads_are_reporter_scoped_and_safe() -> None:
    actor = _profile()
    target = _profile()
    repository = FakeSafetyRepository()
    service = SocialMeetSafetyService(FakeIdentityRepository(actor, target), repository)
    created = service.submit_report(
        actor.auth_user_id,
        ReportCreateRequest(
            reported_profile_id=_profile_id(target),
            reason_code=ReportReasonCode.UNSAFE_BEHAVIOR,
        ),
    )

    listed = service.list_submitted_reports(actor.auth_user_id)
    fetched = service.get_submitted_report(actor.auth_user_id, created.report_id)

    assert listed == [fetched]
    assert fetched.reported_profile_id == target.profile_id
    assert not hasattr(fetched, "reporter_profile_id")


def test_unknown_report_is_non_enumerating() -> None:
    actor = _profile()
    service = SocialMeetSafetyService(FakeIdentityRepository(actor), FakeSafetyRepository())

    with pytest.raises(SocialMeetSafetyError) as error:
        service.get_submitted_report(actor.auth_user_id, uuid4())

    assert error.value.code == "unknown_report"


def test_interaction_guard_blocks_either_direction() -> None:
    actor = _profile(visibility=ProfileVisibility.DISCOVERABLE, consented=True)
    target = _profile(visibility=ProfileVisibility.DISCOVERABLE, consented=True)
    repository = FakeSafetyRepository()
    repository.interaction_blocked = True
    service = SocialMeetSafetyService(FakeIdentityRepository(actor, target), repository)

    with pytest.raises(SocialMeetSafetyError) as error:
        service.ensure_interaction_allowed(actor.auth_user_id, _profile_id(target))

    assert error.value.code == "interaction_blocked"


def test_interaction_guard_requires_current_discoverable_profiles() -> None:
    actor = _profile(visibility=ProfileVisibility.PRIVATE, consented=True)
    target = _profile(visibility=ProfileVisibility.DISCOVERABLE, consented=True)
    service = SocialMeetSafetyService(FakeIdentityRepository(actor, target), FakeSafetyRepository())

    with pytest.raises(SocialMeetSafetyError) as error:
        service.ensure_interaction_allowed(actor.auth_user_id, _profile_id(target))

    assert error.value.code == "profile_not_published"


def test_interaction_guard_returns_allowed_target() -> None:
    actor = _profile(visibility=ProfileVisibility.DISCOVERABLE, consented=True)
    target = _profile(visibility=ProfileVisibility.DISCOVERABLE, consented=True)
    service = SocialMeetSafetyService(FakeIdentityRepository(actor, target), FakeSafetyRepository())

    result = service.ensure_interaction_allowed(actor.auth_user_id, _profile_id(target))

    assert result.profile_id == target.profile_id


def _profile(
    *,
    visibility: ProfileVisibility = ProfileVisibility.PRIVATE,
    consented: bool = True,
) -> SocialMeetProfileRecord:
    return SocialMeetProfileRecord(
        auth_user_id=uuid4(),
        social_user_id=uuid4(),
        profile_id=uuid4(),
        display_name="Ada",
        avatar_ref=None,
        short_bio=None,
        preferred_themes=(),
        favorite_eras=(),
        interest_places=(),
        learning_goals=(),
        knowledge_badges=(),
        knowledge_fingerprint_summary={},
        profile_visibility=visibility,
        consent_version=SUPPORTED_CONSENT_VERSION if consented else None,
        consented_at=NOW if consented else None,
        updated_at=NOW,
    )


def _profile_id(profile: SocialMeetProfileRecord) -> UUID:
    assert profile.profile_id is not None
    return profile.profile_id


def _block(
    *,
    blocker_profile_id: UUID,
    blocked_profile_id: UUID,
    block_id: UUID | None = None,
    scope: BlockScope = BlockScope.SOCIAL_MEET,
    related_invite_id: UUID | None = None,
    status: BlockStatus = BlockStatus.ACTIVE,
    removed_at: datetime | None = None,
) -> SocialMeetBlockRecord:
    return SocialMeetBlockRecord(
        block_id=block_id or uuid4(),
        blocker_profile_id=blocker_profile_id,
        blocked_profile_id=blocked_profile_id,
        scope=scope,
        related_invite_id=related_invite_id,
        related_context=None,
        status=status,
        source_surface=None,
        created_at=NOW,
        updated_at=NOW,
        removed_at=removed_at,
    )


def _report(
    *,
    reporter_profile_id: UUID,
    reported_profile_id: UUID,
    related_invite_id: UUID | None,
    reason_code: ReportReasonCode,
    structured_details: tuple[StructuredReportDetail, ...],
) -> SocialMeetReportRecord:
    return SocialMeetReportRecord(
        report_id=uuid4(),
        reporter_profile_id=reporter_profile_id,
        reported_profile_id=reported_profile_id,
        related_invite_id=related_invite_id,
        related_context=None,
        reason_code=reason_code,
        structured_details=structured_details,
        source_surface=None,
        status=ReportStatus.SUBMITTED,
        created_at=NOW,
        updated_at=NOW,
    )
