from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.api.dependencies import get_current_admin, get_social_meet_operations_service
from app.auth.authorization import HISTORY_GO_ADMIN_ROLE
from app.auth.supabase import AuthPrincipal
from app.core.config import Settings
from app.domains.social_meet.operations_models import (
    RETENTION_POLICY_VERSION,
    AggregateStatusCounts,
    ApplyRetentionRequest,
    CreateRetentionHoldRequest,
    LastRetentionRun,
    RetentionCounts,
    RetentionEntityType,
    RetentionHoldReason,
    RetentionHoldStatus,
    RetentionHoldView,
    RetentionPolicyView,
    RetentionPreview,
    RetentionRunResult,
    SocialMeetOperationalMetrics,
)
from app.domains.social_meet.service import SocialMeetDomainError
from app.main import create_app

NOW = datetime(2026, 7, 20, 19, 0, tzinfo=UTC)


class StubOperationsService:
    def __init__(self) -> None:
        self.error: SocialMeetDomainError | None = None
        self.hold = _hold()

    def operational_metrics(self) -> SocialMeetOperationalMetrics:
        return SocialMeetOperationalMetrics(
            generated_at=NOW,
            profile_visibility=AggregateStatusCounts(values={"discoverable": 8, "paused": 2}),
            invite_states=AggregateStatusCounts(values={"pending": 3, "completed": 9}),
            report_states=AggregateStatusCounts(values={"submitted": 1, "closed": 4}),
            moderation_queue_states=AggregateStatusCounts(values={"queued": 1, "closed": 4}),
            active_blocks=2,
            active_restrictions=1,
            open_appeals=1,
            active_retention_holds=2,
            retention_candidates=RetentionCounts(terminal_invites=5, closed_reports=2),
            last_retention_run=LastRetentionRun(
                run_id=uuid4(),
                status="completed",
                completed_at=NOW,
                deleted_total=7,
            ),
        )

    def preview_retention(self) -> RetentionPreview:
        return RetentionPreview(
            generated_at=NOW,
            policy_version=RETENTION_POLICY_VERSION,
            policy=_policy(),
            candidate_counts=RetentionCounts(terminal_invites=5),
            active_holds=2,
        )

    def apply_retention(
        self,
        admin: AuthPrincipal,
        request: ApplyRetentionRequest,
    ) -> RetentionRunResult:
        del admin, request
        if self.error is not None:
            raise self.error
        return RetentionRunResult(
            run_id=uuid4(),
            mode="apply",
            policy_version=RETENTION_POLICY_VERSION,
            started_at=NOW,
            completed_at=NOW,
            candidate_counts=RetentionCounts(terminal_invites=5),
            deleted_counts=RetentionCounts(terminal_invites=5),
        )

    def list_retention_holds(
        self,
        *,
        include_released: bool,
        limit: int,
    ) -> list[RetentionHoldView]:
        assert include_released is False
        assert limit == 100
        return [self.hold]

    def create_retention_hold(
        self,
        admin: AuthPrincipal,
        request: CreateRetentionHoldRequest,
    ) -> RetentionHoldView:
        del admin
        if self.error is not None:
            raise self.error
        return RetentionHoldView(
            hold_id=self.hold.hold_id,
            entity_type=request.entity_type,
            entity_id=request.entity_id,
            reason_code=request.reason_code,
            status=RetentionHoldStatus.ACTIVE,
            hold_until=request.hold_until,
            created_at=NOW,
            released_at=None,
        )

    def release_retention_hold(
        self,
        admin: AuthPrincipal,
        hold_id: UUID,
    ) -> RetentionHoldView:
        del admin
        if self.error is not None:
            raise self.error
        assert hold_id == self.hold.hold_id
        return self.hold.model_copy(
            update={"status": RetentionHoldStatus.RELEASED, "released_at": NOW}
        )


def test_metrics_endpoint_returns_aggregate_operational_state_only() -> None:
    client, _ = _client()

    response = client.get("/api/v1/social-meet/operations/metrics")

    assert response.status_code == 200
    body = response.json()
    assert body["profileVisibility"]["values"] == {"discoverable": 8, "paused": 2}
    assert body["inviteStates"]["values"]["completed"] == 9
    assert body["retentionCandidates"]["terminalInvites"] == 5
    assert body["lastRetentionRun"]["deletedTotal"] == 7

    serialized = str(body).lower()
    assert "profileid" not in serialized
    assert "userid" not in serialized
    assert "latitude" not in serialized
    assert "longitude" not in serialized
    assert "distance" not in serialized
    assert "lastseen" not in serialized
    assert "presence" not in serialized


def test_retention_preview_and_apply_use_explicit_policy_confirmation() -> None:
    client, service = _client()

    preview = client.get("/api/v1/social-meet/operations/retention/preview")
    assert preview.status_code == 200
    assert preview.json()["policyVersion"] == RETENTION_POLICY_VERSION
    assert preview.json()["activeHolds"] == 2

    service.error = SocialMeetDomainError(
        code="retention_policy_confirmation_required",
        detail="The current Social Meet retention policy version must be confirmed",
    )
    rejected = client.post(
        "/api/v1/social-meet/operations/retention/run",
        json={"confirmPolicyVersion": "stale"},
    )
    assert rejected.status_code == 409
    assert rejected.json()["detail"]["code"] == "retention_policy_confirmation_required"

    service.error = None
    applied = client.post(
        "/api/v1/social-meet/operations/retention/run",
        json={"confirmPolicyVersion": RETENTION_POLICY_VERSION},
    )
    assert applied.status_code == 200
    assert applied.json()["deletedCounts"]["terminalInvites"] == 5


def test_retention_hold_endpoints_are_admin_scoped_and_structured() -> None:
    client, service = _client()

    listed = client.get("/api/v1/social-meet/operations/retention/holds")
    assert listed.status_code == 200
    assert listed.json()[0]["entityType"] == "report"

    entity_id = uuid4()
    created = client.post(
        "/api/v1/social-meet/operations/retention/holds",
        json={
            "entityType": "report",
            "entityId": str(entity_id),
            "reasonCode": "safety_review",
        },
    )
    assert created.status_code == 201
    assert created.json()["entityId"] == str(entity_id)
    assert created.json()["reasonCode"] == "safety_review"

    released = client.post(
        f"/api/v1/social-meet/operations/retention/holds/{service.hold.hold_id}/release"
    )
    assert released.status_code == 200
    assert released.json()["status"] == "released"


def test_operations_domain_errors_are_mapped_without_private_details() -> None:
    client, service = _client()
    service.error = SocialMeetDomainError(
        code="retention_entity_not_found",
        detail="The requested retention entity is not available",
    )

    response = client.post(
        "/api/v1/social-meet/operations/retention/holds",
        json={
            "entityType": "report",
            "entityId": str(uuid4()),
            "reasonCode": "legal_hold",
        },
    )

    assert response.status_code == 404
    assert response.json() == {
        "detail": {
            "code": "retention_entity_not_found",
            "message": "The requested retention entity is not available",
        }
    }


def _client() -> tuple[TestClient, StubOperationsService]:
    principal = AuthPrincipal(
        user_id=uuid4(),
        app_roles=frozenset({HISTORY_GO_ADMIN_ROLE}),
    )
    service = StubOperationsService()
    app = create_app(Settings(environment="test"))
    app.dependency_overrides[get_current_admin] = lambda: principal
    app.dependency_overrides[get_social_meet_operations_service] = lambda: service
    return TestClient(app), service


def _policy() -> RetentionPolicyView:
    return RetentionPolicyView(
        terminal_invite_days=180,
        removed_block_days=180,
        closed_report_days=730,
        closed_moderation_days=730,
        inactive_restriction_days=730,
        closed_appeal_days=365,
        safety_audit_days=1095,
        released_hold_days=365,
    )


def _hold() -> RetentionHoldView:
    return RetentionHoldView(
        hold_id=uuid4(),
        entity_type=RetentionEntityType.REPORT,
        entity_id=uuid4(),
        reason_code=RetentionHoldReason.SAFETY_REVIEW,
        status=RetentionHoldStatus.ACTIVE,
        hold_until=None,
        created_at=NOW,
        released_at=None,
    )
