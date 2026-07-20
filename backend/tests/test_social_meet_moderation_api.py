from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user, get_social_meet_moderation_service
from app.auth.authorization import HISTORY_GO_ADMIN_ROLE, HISTORY_GO_MODERATOR_ROLE
from app.auth.supabase import AuthPrincipal
from app.core.config import Settings
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
from app.main import create_app

NOW = datetime(2026, 7, 20, 14, 0, tzinfo=UTC)


class StubModerationService:
    def __init__(self) -> None:
        self.queue_item = _queue_item()
        self.restriction = _restriction(self.queue_item.subject_profile_id)
        self.appeal = _appeal(self.restriction.restriction_id)
        self.last_action: ModerationQueueAction | None = None

    def list_queue(
        self,
        *,
        state: ModerationQueueState | None,
        limit: int,
    ) -> list[ModerationQueueItem]:
        return [self.queue_item]

    def get_queue_item(self, queue_item_id: UUID) -> ModerationQueueItem:
        return self.queue_item

    def act_on_queue_item(
        self,
        principal: AuthPrincipal,
        queue_item_id: UUID,
        action: ModerationQueueAction,
    ) -> ModerationQueueItem:
        self.last_action = action
        return self.queue_item

    def resolve_report(
        self,
        principal: AuthPrincipal,
        report_id: UUID,
        *,
        resolution_code: ModerationResolutionCode,
        reason_code: RestrictionReasonCode | None,
    ) -> ModerationQueueItem:
        return self.queue_item

    def suspend_profile(
        self,
        principal: AuthPrincipal,
        profile_id: UUID,
        *,
        reason_code: RestrictionReasonCode,
        source_report_id: UUID | None,
    ) -> RestrictionView:
        return _restriction(profile_id, reason_code=reason_code)

    def restore_profile(self, principal: AuthPrincipal, profile_id: UUID) -> RestrictionView:
        return _restriction(profile_id, status="lifted")

    def list_appeals(self, auth_user_id: UUID) -> list[AppealView]:
        return [self.appeal]

    def create_appeal(
        self,
        auth_user_id: UUID,
        *,
        restriction_id: UUID,
        reason_code: AppealReasonCode,
    ) -> AppealView:
        return _appeal(restriction_id, reason_code=reason_code)

    def decide_appeal(
        self,
        principal: AuthPrincipal,
        appeal_id: UUID,
        *,
        decision: AppealDecision,
        reason_code: AppealDecisionReasonCode,
    ) -> AppealView:
        status = AppealStatus.REVERSED if decision is AppealDecision.REVERSE else AppealStatus.UPHELD
        return _appeal(
            self.restriction.restriction_id,
            appeal_id=appeal_id,
            status=status,
            decision_reason_code=reason_code,
        )


def test_non_staff_user_cannot_read_moderation_queue() -> None:
    client, _ = _client(AuthPrincipal(user_id=uuid4()))

    response = client.get("/api/v1/social-meet/moderation/queue")

    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "moderator_access_required"


def test_moderator_can_read_and_act_on_queue() -> None:
    client, service = _client(_moderator())

    queue_response = client.get("/api/v1/social-meet/moderation/queue?limit=20")
    action_response = client.post(
        f"/api/v1/social-meet/moderation/queue/{service.queue_item.queue_item_id}/actions",
        json={"action": "claim"},
    )

    assert queue_response.status_code == 200
    assert queue_response.json()[0]["reporterProfileId"]
    assert action_response.status_code == 200
    assert service.last_action is ModerationQueueAction.CLAIM
    assert "assignedStaffUserId" not in action_response.json()


def test_moderation_payloads_reject_free_text_and_unknown_fields() -> None:
    client, service = _client(_moderator())

    response = client.post(
        f"/api/v1/social-meet/moderation/reports/{service.queue_item.report_id}/resolve",
        json={
            "resolutionCode": "no_policy_violation",
            "message": "arbitrary moderator note",
        },
    )

    assert response.status_code == 422


def test_moderator_can_suspend_but_cannot_restore_profile() -> None:
    client, service = _client(_moderator())

    suspend_response = client.post(
        f"/api/v1/social-meet/moderation/profiles/{service.queue_item.subject_profile_id}/suspend",
        json={"reasonCode": "unsafe_behavior"},
    )
    restore_response = client.post(
        f"/api/v1/social-meet/moderation/profiles/{service.queue_item.subject_profile_id}/restore"
    )

    assert suspend_response.status_code == 200
    assert restore_response.status_code == 403
    assert restore_response.json()["detail"]["code"] == "admin_access_required"


def test_admin_can_restore_profile_and_decide_appeal() -> None:
    client, service = _client(_admin())

    restore_response = client.post(
        f"/api/v1/social-meet/moderation/profiles/{service.queue_item.subject_profile_id}/restore"
    )
    decision_response = client.post(
        f"/api/v1/social-meet/appeals/{service.appeal.appeal_id}/decision",
        json={
            "decision": "reverse",
            "reasonCode": "restriction_reversed",
        },
    )

    assert restore_response.status_code == 200
    assert restore_response.json()["status"] == "lifted"
    assert decision_response.status_code == 200
    assert decision_response.json()["status"] == "reversed"


def test_participant_can_create_and_list_appeals_without_staff_role() -> None:
    client, service = _client(AuthPrincipal(user_id=uuid4()))

    create_response = client.post(
        "/api/v1/social-meet/appeals",
        json={
            "restrictionId": str(service.restriction.restriction_id),
            "reasonCode": "new_context",
        },
    )
    list_response = client.get("/api/v1/social-meet/appeals")

    assert create_response.status_code == 201
    assert create_response.json()["reasonCode"] == "new_context"
    assert list_response.status_code == 200
    assert "reporterProfileId" not in create_response.json()
    assert "moderatorNotes" not in create_response.json()


def _client(principal: AuthPrincipal) -> tuple[TestClient, StubModerationService]:
    app = create_app(Settings(environment="test"))
    service = StubModerationService()
    app.dependency_overrides[get_current_user] = lambda: principal
    app.dependency_overrides[get_social_meet_moderation_service] = lambda: service
    return TestClient(app), service


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


def _queue_item() -> ModerationQueueItem:
    return ModerationQueueItem(
        queue_item_id=uuid4(),
        report_id=uuid4(),
        subject_profile_id=uuid4(),
        reporter_profile_id=uuid4(),
        related_invite_id=None,
        priority=ModerationPriority.HIGH,
        category="unsafe_behavior",
        state=ModerationQueueState.QUEUED,
        assigned=False,
        resolution_code=None,
        created_at=NOW,
        updated_at=NOW,
        closed_at=None,
    )


def _restriction(
    profile_id: UUID,
    *,
    reason_code: RestrictionReasonCode = RestrictionReasonCode.UNSAFE_BEHAVIOR,
    status: str = "active",
) -> RestrictionView:
    return RestrictionView(
        restriction_id=uuid4(),
        profile_id=profile_id,
        restriction_type="social_meet_suspension",
        status=status,
        reason_code=reason_code,
        source_report_id=None,
        created_at=NOW,
        updated_at=NOW,
        lifted_at=NOW if status == "lifted" else None,
    )


def _appeal(
    restriction_id: UUID,
    *,
    appeal_id: UUID | None = None,
    reason_code: AppealReasonCode = AppealReasonCode.INCORRECT_DECISION,
    status: AppealStatus = AppealStatus.SUBMITTED,
    decision_reason_code: AppealDecisionReasonCode | None = None,
) -> AppealView:
    return AppealView(
        appeal_id=appeal_id or uuid4(),
        restriction_id=restriction_id,
        reason_code=reason_code,
        status=status,
        decision_reason_code=decision_reason_code,
        created_at=NOW,
        updated_at=NOW,
        decided_at=NOW if status is not AppealStatus.SUBMITTED else None,
    )
