from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user, get_social_meet_safety_service
from app.auth.supabase import AuthPrincipal
from app.core.config import Settings
from app.domains.social_meet.safety_models import (
    BlockCreateRequest,
    BlockScope,
    BlockStatus,
    ReportCreateRequest,
    ReportReasonCode,
    ReportStatus,
    SocialMeetBlockView,
    StructuredReportDetail,
    SubmittedReportView,
)
from app.domains.social_meet.safety_service import SocialMeetSafetyError
from app.main import create_app

NOW = datetime(2026, 7, 20, 13, 0, tzinfo=UTC)


class StubSafetyService:
    def __init__(self) -> None:
        self.block_id = uuid4()
        self.target_profile_id = uuid4()
        self.report_id = uuid4()
        self.last_block_request: BlockCreateRequest | None = None
        self.last_report_request: ReportCreateRequest | None = None
        self.last_request_id: str | None = None
        self.raise_error: SocialMeetSafetyError | None = None

    def list_blocks(self, auth_user_id: UUID) -> list[SocialMeetBlockView]:
        self._raise_if_configured()
        return [self._block()]

    def block_profile(
        self,
        auth_user_id: UUID,
        request: BlockCreateRequest,
        *,
        request_id: str | None = None,
    ) -> SocialMeetBlockView:
        self._raise_if_configured()
        self.last_block_request = request
        self.last_request_id = request_id
        return self._block(blocked_profile_id=request.blocked_profile_id)

    def unblock_profile(
        self,
        auth_user_id: UUID,
        block_id: UUID,
        *,
        request_id: str | None = None,
    ) -> SocialMeetBlockView:
        self._raise_if_configured()
        self.last_request_id = request_id
        return self._block(block_id=block_id, status=BlockStatus.REMOVED_BY_BLOCKER)

    def submit_report(
        self,
        auth_user_id: UUID,
        request: ReportCreateRequest,
        *,
        request_id: str | None = None,
    ) -> SubmittedReportView:
        self._raise_if_configured()
        self.last_report_request = request
        self.last_request_id = request_id
        return self._report(reported_profile_id=request.reported_profile_id)

    def list_submitted_reports(self, auth_user_id: UUID) -> list[SubmittedReportView]:
        self._raise_if_configured()
        return [self._report()]

    def get_submitted_report(
        self,
        auth_user_id: UUID,
        report_id: UUID,
    ) -> SubmittedReportView:
        self._raise_if_configured()
        return self._report(report_id=report_id)

    def _raise_if_configured(self) -> None:
        if self.raise_error is not None:
            raise self.raise_error

    def _block(
        self,
        *,
        block_id: UUID | None = None,
        blocked_profile_id: UUID | None = None,
        status: BlockStatus = BlockStatus.ACTIVE,
    ) -> SocialMeetBlockView:
        return SocialMeetBlockView(
            block_id=block_id or self.block_id,
            blocked_profile_id=blocked_profile_id or self.target_profile_id,
            scope=BlockScope.SOCIAL_MEET,
            related_invite_id=None,
            related_context=None,
            status=status,
            created_at=NOW,
            updated_at=NOW,
            removed_at=NOW if status is BlockStatus.REMOVED_BY_BLOCKER else None,
        )

    def _report(
        self,
        *,
        report_id: UUID | None = None,
        reported_profile_id: UUID | None = None,
    ) -> SubmittedReportView:
        return SubmittedReportView(
            report_id=report_id or self.report_id,
            reported_profile_id=reported_profile_id or self.target_profile_id,
            reason_code=ReportReasonCode.UNSAFE_BEHAVIOR,
            structured_details=[StructuredReportDetail.REPEATED_UNWANTED_INVITES],
            status=ReportStatus.SUBMITTED,
            created_at=NOW,
            updated_at=NOW,
        )


def test_block_endpoint_returns_only_blocker_safe_fields() -> None:
    client, service = _client()
    target_profile_id = uuid4()

    response = client.post(
        "/api/v1/social-meet/blocks",
        json={
            "blockedProfileId": str(target_profile_id),
            "sourceSurface": "public_profile",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["blockedProfileId"] == str(target_profile_id)
    assert "blockerProfileId" not in payload
    assert service.last_block_request is not None
    assert service.last_request_id


def test_safety_payload_rejects_forbidden_fields_at_any_depth() -> None:
    client, service = _client()

    response = client.post(
        "/api/v1/social-meet/reports",
        json={
            "reportedProfileId": str(uuid4()),
            "reasonCode": "unsafe_behavior",
            "relatedContext": {
                "contextType": "place",
                "contextId": "factory_memory",
                "metadata": {"liveLocation": {"lat": 59.9, "lon": 10.7}},
            },
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "forbidden_safety_field"
    assert service.last_report_request is None


def test_report_payload_rejects_freeform_reason_and_unknown_details() -> None:
    client, _ = _client()

    response = client.post(
        "/api/v1/social-meet/reports",
        json={
            "reportedProfileId": str(uuid4()),
            "reasonCode": "something_i_wrote",
            "structuredDetails": ["custom_story"],
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "invalid_report_payload"


def test_report_response_never_exposes_reporter_identity() -> None:
    client, _ = _client()
    target_profile_id = uuid4()

    response = client.post(
        "/api/v1/social-meet/reports",
        json={
            "reportedProfileId": str(target_profile_id),
            "reasonCode": "unsafe_behavior",
            "structuredDetails": ["repeated_unwanted_invites"],
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert payload["reportedProfileId"] == str(target_profile_id)
    assert "reporterProfileId" not in payload
    assert "moderationNotes" not in payload
    assert "accountId" not in payload


def test_submitted_reports_route_is_not_captured_as_report_id() -> None:
    client, _ = _client()

    response = client.get("/api/v1/social-meet/reports/submitted")

    assert response.status_code == 200
    assert len(response.json()) == 1


def test_safety_domain_errors_map_to_stable_http_codes() -> None:
    client, service = _client()
    service.raise_error = SocialMeetSafetyError(
        code="unknown_block",
        detail="The requested block is not available",
    )

    response = client.delete(f"/api/v1/social-meet/blocks/{uuid4()}")

    assert response.status_code == 404
    assert response.json()["detail"]["code"] == "unknown_block"


def test_safety_endpoints_fail_closed_without_database_configuration() -> None:
    app = create_app(Settings(environment="test"))
    app.dependency_overrides[get_current_user] = lambda: AuthPrincipal(user_id=uuid4())
    client = TestClient(app)

    response = client.get("/api/v1/social-meet/blocks")

    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "backend_not_enabled"


def _client() -> tuple[TestClient, StubSafetyService]:
    app = create_app(Settings(environment="test"))
    service = StubSafetyService()
    app.dependency_overrides[get_current_user] = lambda: AuthPrincipal(user_id=uuid4())
    app.dependency_overrides[get_social_meet_safety_service] = lambda: service
    return TestClient(app), service
