from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from app.auth.authorization import HISTORY_GO_ADMIN_ROLE, HISTORY_GO_MODERATOR_ROLE
from app.auth.supabase import AuthPrincipal
from app.domains.social_meet.models import ProfileVisibility, SocialMeetProfileRecord
from app.domains.social_meet.moderation_models import (
    AppealDecision,
    AppealDecisionReasonCode,
    AppealReasonCode,
    AppealStatus,
    AppealView,
    ModerationPriority,
    ModerationQueueAction,
    ModerationQueueItem,
    ModerationQueueState,
    ModerationResolutionCode,
    RestrictionReasonCode,
    RestrictionView,
)
from app.domains.social_meet.moderation_service import SocialMeetModerationService
from app.domains.social_meet.safety_models import ReportReasonCode
from app.domains.social_meet.service import SocialMeetDomainError

NOW = datetime(2026, 7, 20, 14, 0, tzinfo=UTC)


class FakeIdentityRepository:
    def __init__(self, profile: SocialMeetProfileRecord) -> None:
        self.profile = profile

    def get_or_create_for_user(self, auth_user_id: UUID) -> SocialMeetProfileRecord:
        assert auth_user_id == self.profile.auth_user_id
        return self.profile


class FakeModerationRepository:
    def __init__(self) -> None:
        self.queue_item = _queue_item()
        self.restriction = _restriction(self.queue_item.subject_profile_id)
        self.appeal = _appeal(self.restriction.restriction_id)
        self.queue_action_returns_none = False
        self.resolve_returns_none = False
        self.suspend_returns_none = False
        self.restore_returns_none = False
        self.appeal_returns_none = False
        self.audit_actions: list[str] = []
        self.last_resolution: ModerationResolutionCode | None = None
        self.last_suspension_reason: RestrictionReasonCode | None = None

    def list_queue(
        self,
        *,
        state: ModerationQueueState | None,
        limit: int,
    ) -> list[ModerationQueueItem]:
        assert limit <= 100
        if state is not None and self.queue_item.state is not state:
            return []
        return [self.queue_item]

    def get_queue_item(self, queue_item_id: UUID) -> ModerationQueueItem | None:
        return self.queue_item if queue_item_id == self.queue_item.queue_item_id else None

    def claim_queue_item(
        self,
        queue_item_id: UUID,
        staff_user_id: UUID,
    ) -> ModerationQueueItem | None:
        if self.queue_action_returns_none:
            return None
        self.queue_item = _queue_item(
            queue_item_id=queue_item_id,
            state=ModerationQueueState.UNDER_REVIEW,
            assigned=True,
        )
        return self.queue_item

    def release_queue_item(
        self,
        queue_item_id: UUID,
        staff_user_id: UUID,
    ) -> ModerationQueueItem | None:
        if self.queue_action_returns_none:
            return None
        self.queue_item = _queue_item(queue_item_id=queue_item_id)
        return self.queue_item

    def escalate_queue_item(self, queue_item_id: UUID) -> ModerationQueueItem | None:
        if self.queue_action_returns_none:
            return None
        self.queue_item = _queue_item(
            queue_item_id=queue_item_id,
            priority=ModerationPriority.HIGH,
            state=ModerationQueueState.TRIAGED,
        )
        return self.queue_item

    def resolve_report(
        self,
        report_id: UUID,
        *,
        resolution_code: ModerationResolutionCode,
        staff_user_id: UUID,
    ) -> ModerationQueueItem | None:
        self.last_resolution = resolution_code
        if self.resolve_returns_none:
            return None
        self.queue_item = _queue_item(
            report_id=report_id,
            state=(
                ModerationQueueState.NO_ACTION
                if resolution_code is ModerationResolutionCode.NO_POLICY_VIOLATION
                else ModerationQueueState.ACTIONED
            ),
            resolution_code=resolution_code,
        )
        return self.queue_item

    def suspend_profile(
        self,
        profile_id: UUID,
        *,
        reason_code: RestrictionReasonCode,
        source_report_id: UUID | None,
        staff_user_id: UUID,
    ) -> RestrictionView | None:
        self.last_suspension_reason = reason_code
        if self.suspend_returns_none:
            return None
        self.restriction = _restriction(
            profile_id,
            reason_code=reason_code,
            source_report_id=source_report_id,
        )
        return self.restriction

    def restore_profile(
        self,
        profile_id: UUID,
        *,
        staff_user_id: UUID,
    ) -> RestrictionView | None:
        if self.restore_returns_none:
            return None
        self.restriction = _restriction(profile_id, status="lifted", lifted_at=NOW)
        return self.restriction

    def list_appeals(self, appellant_profile_id: UUID) -> list[AppealView]:
        return [self.appeal]

    def create_appeal(
        self,
        appellant_profile_id: UUID,
        restriction_id: UUID,
        reason_code: AppealReasonCode,
    ) -> AppealView | None:
        if self.appeal_returns_none:
            return None
        self.appeal = _appeal(restriction_id, reason_code=reason_code)
        return self.appeal

    def decide_appeal(
        self,
        appeal_id: UUID,
        *,
        decision: AppealDecision,
        reason_code: AppealDecisionReasonCode,
        staff_user_id: UUID,
    ) -> AppealView | None:
        if self.appeal_returns_none:
            return None
        status = {
            AppealDecision.UPHOLD: AppealStatus.UPHELD,
            AppealDecision.MODIFY: AppealStatus.MODIFIED,
            AppealDecision.REVERSE: AppealStatus.REVERSED,
        }[decision]
        self.appeal = _appeal(
            self.appeal.restriction_id,
            appeal_id=appeal_id,
            status=status,
            decision_reason_code=reason_code,
        )
        return self.appeal

    def write_audit(self, **kwargs: object) -> None:
        self.audit_actions.append(str(kwargs["action_type"]))


def test_moderator_can_claim_escalate_and_release_queue_item() -> None:
    repository = FakeModerationRepository()
    service = _service(repository)
    moderator = _moderator()

    claimed = service.act_on_queue_item(
        moderator,
        repository.queue_item.queue_item_id,
        ModerationQueueAction.CLAIM,
    )
    escalated = service.act_on_queue_item(
        moderator,
        claimed.queue_item_id,
        ModerationQueueAction.ESCALATE,
    )
    released = service.act_on_queue_item(
        moderator,
        escalated.queue_item_id,
        ModerationQueueAction.RELEASE,
    )

    assert claimed.assigned is True
    assert escalated.priority is ModerationPriority.HIGH
    assert released.state is ModerationQueueState.QUEUED
    assert repository.audit_actions == ["queue_claim", "queue_escalate", "queue_release"]


def test_queue_action_conflict_is_stable() -> None:
    repository = FakeModerationRepository()
    repository.queue_action_returns_none = True
    service = _service(repository)

    with pytest.raises(SocialMeetDomainError) as error:
        service.act_on_queue_item(
            _moderator(),
            uuid4(),
            ModerationQueueAction.CLAIM,
        )

    assert error.value.code == "moderation_action_conflict"


def test_suspension_resolution_requires_structured_reason() -> None:
    repository = FakeModerationRepository()
    service = _service(repository)

    with pytest.raises(SocialMeetDomainError) as error:
        service.resolve_report(
            _moderator(),
            repository.queue_item.report_id,
            resolution_code=ModerationResolutionCode.PROFILE_SUSPENDED,
            reason_code=None,
        )

    assert error.value.code == "moderation_reason_required"


def test_suspension_resolution_applies_profile_restriction() -> None:
    repository = FakeModerationRepository()
    service = _service(repository)

    item = service.resolve_report(
        _moderator(),
        repository.queue_item.report_id,
        resolution_code=ModerationResolutionCode.PROFILE_SUSPENDED,
        reason_code=RestrictionReasonCode.UNSAFE_BEHAVIOR,
    )

    assert item.state is ModerationQueueState.ACTIONED
    assert repository.last_suspension_reason is RestrictionReasonCode.UNSAFE_BEHAVIOR
    assert "resolve_report" in repository.audit_actions


def test_direct_suspend_and_restore_are_audited() -> None:
    repository = FakeModerationRepository()
    service = _service(repository)
    profile_id = uuid4()

    suspended = service.suspend_profile(
        _moderator(),
        profile_id,
        reason_code=RestrictionReasonCode.HARASSMENT,
        source_report_id=None,
    )
    restored = service.restore_profile(_admin(), profile_id)

    assert suspended.status == "active"
    assert restored.status == "lifted"
    assert repository.audit_actions == ["suspend_profile", "restore_profile"]


def test_participant_can_create_and_list_structured_appeal() -> None:
    repository = FakeModerationRepository()
    service = _service(repository)
    profile = service._identity_repository.profile

    created = service.create_appeal(
        profile.auth_user_id,
        restriction_id=repository.restriction.restriction_id,
        reason_code=AppealReasonCode.NEW_CONTEXT,
    )
    listed = service.list_appeals(profile.auth_user_id)

    assert created.reason_code is AppealReasonCode.NEW_CONTEXT
    assert listed == [created]
    assert not hasattr(created, "reporter_profile_id")


def test_appeal_cannot_target_another_profiles_restriction() -> None:
    repository = FakeModerationRepository()
    repository.appeal_returns_none = True
    service = _service(repository)
    profile = service._identity_repository.profile

    with pytest.raises(SocialMeetDomainError) as error:
        service.create_appeal(
            profile.auth_user_id,
            restriction_id=uuid4(),
            reason_code=AppealReasonCode.INCORRECT_DECISION,
        )

    assert error.value.code == "restriction_not_found"


def test_admin_appeal_decision_is_audited_without_reporter_identity() -> None:
    repository = FakeModerationRepository()
    service = _service(repository)

    decided = service.decide_appeal(
        _admin(),
        repository.appeal.appeal_id,
        decision=AppealDecision.REVERSE,
        reason_code=AppealDecisionReasonCode.RESTRICTION_REVERSED,
    )

    assert decided.status is AppealStatus.REVERSED
    assert repository.audit_actions == ["decide_appeal"]
    assert not hasattr(decided, "reporter_profile_id")


def _service(repository: FakeModerationRepository) -> SocialMeetModerationService:
    return SocialMeetModerationService(
        FakeIdentityRepository(_profile()),
        repository,  # type: ignore[arg-type]
    )


def _moderator() -> AuthPrincipal:
    return AuthPrincipal(
        user_id=uuid4(),
        app_roles=frozenset({HISTORY_GO_MODERATOR_ROLE}),
    )


def _admin() -> AuthPrincipal:
    return AuthPrincipal(
        user_id=uuid4(),
        app_roles=frozenset({HISTORY_GO_ADMIN_ROLE}),
    )


def _profile() -> SocialMeetProfileRecord:
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
        profile_visibility=ProfileVisibility.BLOCKED_OR_SUSPENDED,
        consent_version="social_meet_identity_v1",
        consented_at=NOW,
        updated_at=NOW,
    )


def _queue_item(
    *,
    queue_item_id: UUID | None = None,
    report_id: UUID | None = None,
    priority: ModerationPriority = ModerationPriority.NORMAL,
    state: ModerationQueueState = ModerationQueueState.QUEUED,
    assigned: bool = False,
    resolution_code: ModerationResolutionCode | None = None,
) -> ModerationQueueItem:
    closed_at = (
        NOW
        if state in {ModerationQueueState.ACTIONED, ModerationQueueState.NO_ACTION}
        else None
    )
    return ModerationQueueItem(
        queue_item_id=queue_item_id or uuid4(),
        report_id=report_id or uuid4(),
        subject_profile_id=uuid4(),
        reporter_profile_id=uuid4(),
        related_invite_id=None,
        priority=priority,
        category=ReportReasonCode.UNSAFE_BEHAVIOR,
        state=state,
        assigned=assigned,
        resolution_code=resolution_code,
        created_at=NOW,
        updated_at=NOW,
        closed_at=closed_at,
    )


def _restriction(
    profile_id: UUID,
    *,
    reason_code: RestrictionReasonCode = RestrictionReasonCode.UNSAFE_BEHAVIOR,
    source_report_id: UUID | None = None,
    status: str = "active",
    lifted_at: datetime | None = None,
) -> RestrictionView:
    return RestrictionView(
        restriction_id=uuid4(),
        profile_id=profile_id,
        restriction_type="social_meet_suspension",
        status=status,
        reason_code=reason_code,
        source_report_id=source_report_id,
        created_at=NOW,
        updated_at=NOW,
        lifted_at=lifted_at,
    )


def _appeal(
    restriction_id: UUID,
    *,
    appeal_id: UUID | None = None,
    reason_code: AppealReasonCode = AppealReasonCode.INCORRECT_DECISION,
    status: AppealStatus = AppealStatus.SUBMITTED,
    decision_reason_code: AppealDecisionReasonCode | None = None,
) -> AppealView:
    decided_at = (
        NOW
        if status in {AppealStatus.UPHELD, AppealStatus.MODIFIED, AppealStatus.REVERSED}
        else None
    )
    return AppealView(
        appeal_id=appeal_id or uuid4(),
        restriction_id=restriction_id,
        reason_code=reason_code,
        status=status,
        decision_reason_code=decision_reason_code,
        created_at=NOW,
        updated_at=NOW,
        decided_at=decided_at,
    )
