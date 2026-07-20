from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user, get_social_meet_safety_service
from app.auth.supabase import AuthPrincipal
from app.core.config import Settings
from app.domains.social_meet.models import KnowledgeFingerprint, ProfileVisibility
from app.domains.social_meet.safety_models import (
    BlockScope,
    BlockStatus,
    BlockView,
    CreateBlockRequest,
    CreateReportRequest,
    ExportedInvite,
    OwnSocialMeetProfileExport,
    ReportDetailCode,
    ReportReasonCode,
    ReportReceipt,
    ReportStatus,
    SocialMeetDeletionResult,
    SocialMeetExport,
    SubmittedReportView,
)
from app.domains.social_meet.service import SocialMeetDomainError
from app.main import create_app


class StubSafetyService:
    def __init__(self) -> None:
        self.block = _block()
        self.report = _report()
        self.last_block_request: CreateBlockRequest | None = None
        self.last_report_request: CreateReportRequest | None = None
        self.raise_error: SocialMeetDomainError | None = None

    def list_blocks(self, auth_user_id: UUID) -> list[BlockView]:
        self._raise_if_configured()
        return [self.block]

    def create_block(self, auth_user_id: UUID, request: CreateBlockRequest) -> BlockView:
        self._raise_if_configured()
        self.last_block_request = request
        return self.block.model_copy(update={"blocked_profile_id": request.blocked_profile_id})

    def remove_block(self, auth_user_id: UUID, block_id: UUID) -> BlockView:
        self._raise_if_configured()
        return self.block.model_copy(
            update={
                "block_id": block_id,
                "status": BlockStatus.REMOVED_BY_BLOCKER,
                "removed_at": datetime(2026, 7, 20, 13, 0, tzinfo=UTC),
            }
        )

    def create_report(self, auth_user_id: UUID, request: CreateReportRequest) -> ReportReceipt:
        self._raise_if_configured()
        self.last_report_request = request
        return ReportReceipt(
            report_id=self.report.report_id,
            status=self.report.status,
            created_at=self.report.created_at,
        )

    def list_submitted_reports(self, auth_user_id: UUID) -> list[SubmittedReportView]:
        self._raise_if_configured()
        return [self.report]

    def get_submitted_report(self, auth_user_id: UUID, report_id: UUID) -> SubmittedReportView:
        self._raise_if_configured()
        return self.report.model_copy(update={"report_id": report_id})

    def export_current_user(self, auth_user_id: UUID) -> SocialMeetExport:
        self._raise_if_configured()
        return _export()

    def delete_social_meet_account(self, auth_user_id: UUID) -> SocialMeetDeletionResult:
        self._raise_if_configured()
        return SocialMeetDeletionResult(
            status="deleted",
            profile_id=uuid4(),
            deleted_at=datetime(2026, 7, 20, 15, 0, tzinfo=UTC),
        )

    def _raise_if_configured(self) -> None:
        if self.raise_error is not None:
            raise self.raise_error


def test_blocks_endpoint_returns_private_current_user_records_only() -> None:
    client, _ = _client()

    response = client.get("/api/v1/social-meet/blocks")

    assert response.status_code == 200
    payload = response.json()[0]
    assert payload["status"] == "active"
    assert "blockerProfileId" not in payload


def test_block_payload_rejects_forbidden_fields_recursively_before_service() -> None:
    client, service = _client()

    response = client.post(
        "/api/v1/social-meet/blocks",
        json={
            "blockedProfileId": str(uuid4()),
            "relatedContext": {
                "contextType": "place",
                "contextId": "factory_memory",
                "liveLocation": {"lat": 59.9, "lon": 10.7},
            },
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "forbidden_safety_field"
    assert service.last_block_request is None


def test_block_payload_validation_has_stable_error_code() -> None:
    client, _ = _client()

    response = client.post(
        "/api/v1/social-meet/blocks",
        json={"blockedProfileId": "not-a-uuid"},
    )

    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "invalid_block_payload"


def test_create_and_remove_block_routes_return_safe_block_view() -> None:
    client, service = _client()
    target_id = uuid4()

    created = client.post(
        "/api/v1/social-meet/blocks",
        json={
            "blockedProfileId": str(target_id),
            "scope": "social_meet",
            "sourceSurface": "public_profile",
        },
    )
    removed = client.delete(f"/api/v1/social-meet/blocks/{service.block.block_id}")

    assert created.status_code == 201
    assert created.json()["blockedProfileId"] == str(target_id)
    assert service.last_block_request is not None
    assert removed.status_code == 200
    assert removed.json()["status"] == "removed_by_blocker"


def test_block_domain_error_maps_to_non_enumerating_http_error() -> None:
    client, service = _client()
    service.raise_error = SocialMeetDomainError(
        code="recipient_unavailable",
        detail="Profile unavailable",
    )

    response = client.post(
        "/api/v1/social-meet/blocks",
        json={"blockedProfileId": str(uuid4())},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == {
        "code": "recipient_unavailable",
        "message": "Profile unavailable",
    }


def test_report_receipt_omits_reporter_and_reported_profile_identity() -> None:
    client, service = _client()
    target_id = uuid4()

    response = client.post(
        "/api/v1/social-meet/reports",
        json={
            "reportedProfileId": str(target_id),
            "reasonCode": "unsafe_behavior",
            "structuredDetails": ["repeated_unwanted_invites"],
            "sourceSurface": "spotmeeting_inbox",
        },
    )

    assert response.status_code == 201
    payload = response.json()
    assert set(payload) == {"reportId", "status", "createdAt"}
    assert service.last_report_request is not None
    assert service.last_report_request.reported_profile_id == target_id


def test_report_rejects_non_allowlisted_structured_detail() -> None:
    client, service = _client()

    response = client.post(
        "/api/v1/social-meet/reports",
        json={
            "reportedProfileId": str(uuid4()),
            "reasonCode": "spam",
            "structuredDetails": ["this_is_really_free_text_disguised_as_a_code"],
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "invalid_report_payload"
    assert service.last_report_request is None


def test_submitted_report_endpoints_never_return_reporter_identity() -> None:
    client, service = _client()

    listed = client.get("/api/v1/social-meet/reports/submitted")
    detail = client.get(f"/api/v1/social-meet/reports/{service.report.report_id}")

    assert listed.status_code == 200
    assert detail.status_code == 200
    assert "reporterProfileId" not in listed.text
    assert "reporterProfileId" not in detail.text


def test_export_response_omits_auth_and_reporter_private_identifiers() -> None:
    client, _ = _client()

    response = client.get("/api/v1/social-meet/export")

    assert response.status_code == 200
    assert "authUserId" not in response.text
    assert "authSubject" not in response.text
    assert "reporterProfileId" not in response.text
    assert response.json()["participantInvites"][0]["direction"] == "sent"


def test_delete_social_meet_account_returns_tombstone_result() -> None:
    client, _ = _client()

    response = client.delete("/api/v1/social-meet/account")

    assert response.status_code == 200
    assert response.json()["status"] == "deleted"
    assert response.json()["profileId"]


def test_safety_endpoints_fail_closed_without_database_configuration() -> None:
    app = create_app(Settings(environment="test"))
    principal = AuthPrincipal(user_id=uuid4())
    app.dependency_overrides[get_current_user] = lambda: principal
    client = TestClient(app)

    response = client.get("/api/v1/social-meet/blocks")

    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "backend_not_enabled"


def _client() -> tuple[TestClient, StubSafetyService]:
    app = create_app(Settings(environment="test"))
    service = StubSafetyService()
    principal = AuthPrincipal(user_id=uuid4())
    app.dependency_overrides[get_current_user] = lambda: principal
    app.dependency_overrides[get_social_meet_safety_service] = lambda: service
    return TestClient(app), service


def _block() -> BlockView:
    timestamp = datetime(2026, 7, 20, 12, 0, tzinfo=UTC)
    return BlockView(
        block_id=uuid4(),
        blocked_profile_id=uuid4(),
        scope=BlockScope.SOCIAL_MEET,
        related_invite_id=None,
        related_context=None,
        status=BlockStatus.ACTIVE,
        source_surface="public_profile",
        created_at=timestamp,
        updated_at=timestamp,
        removed_at=None,
    )


def _report() -> SubmittedReportView:
    timestamp = datetime(2026, 7, 20, 12, 0, tzinfo=UTC)
    return SubmittedReportView(
        report_id=uuid4(),
        reported_profile_id=uuid4(),
        related_invite_id=None,
        related_context=None,
        reason_code=ReportReasonCode.UNSAFE_BEHAVIOR,
        structured_details=[ReportDetailCode.REPEATED_UNWANTED_INVITES],
        status=ReportStatus.SUBMITTED,
        source_surface="spotmeeting_inbox",
        created_at=timestamp,
        updated_at=timestamp,
    )


def _export() -> SocialMeetExport:
    timestamp = datetime(2026, 7, 20, 12, 0, tzinfo=UTC)
    target_profile_id = uuid4()
    return SocialMeetExport(
        generated_at=timestamp,
        profile=OwnSocialMeetProfileExport(
            user_id=uuid4(),
            profile_id=uuid4(),
            display_name="Ada",
            avatar_ref=None,
            short_bio="Industrial history",
            preferred_themes=["industrial_history"],
            favorite_eras=[],
            interest_places=[],
            learning_goals=[],
            knowledge_badges=[],
            knowledge_fingerprint_summary=KnowledgeFingerprint(theme_tags=["industrial_history"]),
            profile_visibility=ProfileVisibility.DISCOVERABLE,
            consent_version="social_meet_identity_v1",
            consented_at=timestamp,
            profile_updated_at=timestamp,
            deleted_at=None,
        ),
        blocks=[_block().model_copy(update={"blocked_profile_id": target_profile_id})],
        reports_submitted=[_report().model_copy(update={"reported_profile_id": target_profile_id})],
        participant_invites=[
            ExportedInvite(
                invite_id=uuid4(),
                direction="sent",
                counterparty_profile_id=target_profile_id,
                context_type="place",
                context_id="factory_memory",
                context_title="Factory Memory",
                source_surface="place_card",
                preset_message_id="compare_place_learning",
                status="pending",
                created_at=timestamp,
                updated_at=timestamp,
            )
        ],
    )
