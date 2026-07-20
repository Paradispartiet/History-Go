from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user, get_spotmeeting_invite_service
from app.auth.supabase import AuthPrincipal
from app.core.config import Settings
from app.domains.social_meet.service import SocialMeetDomainError
from app.domains.social_meet.spotmeeting_models import (
    CreateSpotmeetingInviteRequest,
    SpotmeetingActorActions,
    SpotmeetingContext,
    SpotmeetingContextType,
    SpotmeetingInvitePage,
    SpotmeetingInviteState,
    SpotmeetingInviteView,
    SpotmeetingPreset,
    SpotmeetingPresetId,
)
from app.main import create_app

NOW = datetime(2026, 7, 20, 16, 30, tzinfo=UTC)


class StubSpotmeetingService:
    def __init__(self, user_id: UUID) -> None:
        self.user_id = user_id
        self.invite = _invite()
        self.error: SocialMeetDomainError | None = None

    @staticmethod
    def list_presets() -> list[SpotmeetingPreset]:
        return [
            SpotmeetingPreset(
                preset_message_id=SpotmeetingPresetId.QUIZ_TOGETHER,
                label="Vil du ta denne quizen sammen?",
            )
        ]

    def create_invite(
        self,
        auth_user_id: UUID,
        request: CreateSpotmeetingInviteRequest,
    ) -> SpotmeetingInviteView:
        assert auth_user_id == self.user_id
        if self.error is not None:
            raise self.error
        return self.invite

    def list_inbox(
        self,
        auth_user_id: UUID,
        *,
        cursor: int,
        limit: int,
        state: SpotmeetingInviteState | None,
    ) -> SpotmeetingInvitePage:
        return SpotmeetingInvitePage(invites=[self.invite], cursor=12, has_more=False)

    def sync(
        self,
        auth_user_id: UUID,
        *,
        cursor: int,
        limit: int,
    ) -> SpotmeetingInvitePage:
        return SpotmeetingInvitePage(invites=[self.invite], cursor=12, has_more=False)

    def accept_invite(
        self,
        auth_user_id: UUID,
        invite_id: UUID,
        *,
        expected_version: int | None,
    ) -> SpotmeetingInviteView:
        return self._transition(SpotmeetingInviteState.ACCEPTED)

    def decline_invite(
        self,
        auth_user_id: UUID,
        invite_id: UUID,
        *,
        expected_version: int | None,
    ) -> SpotmeetingInviteView:
        return self._transition(SpotmeetingInviteState.DECLINED)

    def cancel_invite(
        self,
        auth_user_id: UUID,
        invite_id: UUID,
        *,
        expected_version: int | None,
    ) -> SpotmeetingInviteView:
        return self._transition(SpotmeetingInviteState.CANCELLED)

    def complete_invite(
        self,
        auth_user_id: UUID,
        invite_id: UUID,
        *,
        expected_version: int | None,
    ) -> SpotmeetingInviteView:
        return self._transition(SpotmeetingInviteState.COMPLETED)

    def _transition(self, state: SpotmeetingInviteState) -> SpotmeetingInviteView:
        if self.error is not None:
            raise self.error
        return self.invite.model_copy(update={"state": state, "version": 2, "sync_version": 12})


def test_presets_endpoint_is_server_owned() -> None:
    client, _ = _client()

    response = client.get("/api/v1/social-meet/spotmeeting/presets")

    assert response.status_code == 200
    assert response.json()[0]["presetMessageId"] == "quiz_together"


def test_create_invite_rejects_nested_forbidden_fields_before_domain_execution() -> None:
    client, service = _client()
    payload = _payload()
    payload["context"]["metadata"] = {"liveLocation": {"latitude": 59.9}}

    response = client.post("/api/v1/social-meet/spotmeeting/invites", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "forbidden_invite_field"
    assert service.error is None


def test_create_invite_rejects_unknown_preset_and_extra_free_text() -> None:
    client, _ = _client()
    unknown_preset = _payload()
    unknown_preset["presetMessageId"] = "custom_message"

    preset_response = client.post(
        "/api/v1/social-meet/spotmeeting/invites",
        json=unknown_preset,
    )
    free_text_response = client.post(
        "/api/v1/social-meet/spotmeeting/invites",
        json={**_payload(), "customMessage": "Hei, skriv til meg"},
    )

    assert preset_response.status_code == 422
    assert preset_response.json()["detail"]["code"] == "invalid_invite_payload"
    assert free_text_response.status_code == 422


def test_create_invite_response_exposes_only_public_profile_ids() -> None:
    client, service = _client()

    response = client.post("/api/v1/social-meet/spotmeeting/invites", json=_payload())

    assert response.status_code == 201
    body = response.json()
    assert body["senderProfileId"] == str(service.invite.sender_profile_id)
    assert body["recipientProfileId"] == str(service.invite.recipient_profile_id)
    serialized = str(body).lower()
    assert "createdby" not in serialized
    assert "targetuserid" not in serialized
    assert "auth" not in serialized


def test_inbox_and_sync_return_monotonic_cursor_without_presence_fields() -> None:
    client, _ = _client()

    inbox = client.get("/api/v1/social-meet/spotmeeting/inbox?cursor=4&limit=20")
    sync = client.get("/api/v1/social-meet/spotmeeting/sync?cursor=4&limit=20")

    assert inbox.status_code == 200
    assert sync.status_code == 200
    assert inbox.json()["cursor"] == 12
    assert sync.json()["cursor"] == 12
    assert "lastSeen" not in str(inbox.json())
    assert "online" not in str(sync.json())


def test_transition_endpoints_accept_optional_expected_version() -> None:
    client, service = _client()
    invite_id = service.invite.invite_id

    responses = [
        client.post(
            f"/api/v1/social-meet/spotmeeting/invites/{invite_id}/accept",
            json={"expectedVersion": 1},
        ),
        client.post(f"/api/v1/social-meet/spotmeeting/invites/{invite_id}/decline"),
        client.post(f"/api/v1/social-meet/spotmeeting/invites/{invite_id}/cancel"),
        client.post(f"/api/v1/social-meet/spotmeeting/invites/{invite_id}/complete"),
    ]

    assert [response.status_code for response in responses] == [200, 200, 200, 200]
    assert [response.json()["state"] for response in responses] == [
        "accepted",
        "declined",
        "cancelled",
        "completed",
    ]


def test_rate_limit_and_private_recipient_failures_map_to_stable_http_statuses() -> None:
    client, service = _client()
    service.error = SocialMeetDomainError(
        code="rate_limited",
        detail="The Spotmeeting invite cannot be created at this time",
    )

    limited = client.post("/api/v1/social-meet/spotmeeting/invites", json=_payload())
    service.error = SocialMeetDomainError(
        code="recipient_unavailable",
        detail="The requested Social Meet recipient is unavailable",
    )
    unavailable = client.post("/api/v1/social-meet/spotmeeting/invites", json=_payload())

    assert limited.status_code == 429
    assert unavailable.status_code == 404
    assert unavailable.json()["detail"]["code"] == "recipient_unavailable"


def test_transition_conflict_is_non_verbose() -> None:
    client, service = _client()
    service.error = SocialMeetDomainError(
        code="conflict",
        detail="Concurrent Spotmeeting state changed; refetch and retry",
    )

    response = client.post(
        f"/api/v1/social-meet/spotmeeting/invites/{service.invite.invite_id}/accept"
    )

    assert response.status_code == 409
    assert response.json()["detail"]["code"] == "conflict"


def _client() -> tuple[TestClient, StubSpotmeetingService]:
    principal = AuthPrincipal(user_id=uuid4())
    service = StubSpotmeetingService(principal.user_id)
    app = create_app(Settings(environment="test"))
    app.dependency_overrides[get_current_user] = lambda: principal
    app.dependency_overrides[get_spotmeeting_invite_service] = lambda: service
    return TestClient(app), service


def _payload() -> dict[str, object]:
    return {
        "recipientProfileId": str(uuid4()),
        "context": {
            "contextType": "place",
            "contextId": "factory_memory",
            "title": "Factory Memory",
            "reason": "Shared learning context",
            "sourceSurface": "place_card",
        },
        "presetMessageId": "compare_place_learning",
        "idempotencyKey": "retry-key-0001",
    }


def _invite() -> SpotmeetingInviteView:
    return SpotmeetingInviteView(
        invite_id=uuid4(),
        sender_profile_id=uuid4(),
        recipient_profile_id=uuid4(),
        context=SpotmeetingContext(
            context_type=SpotmeetingContextType.PLACE,
            context_id="factory_memory",
            title="Factory Memory",
            reason="Shared learning context",
            source_surface="place_card",
        ),
        preset_message_id=SpotmeetingPresetId.COMPARE_PLACE_LEARNING,
        state=SpotmeetingInviteState.PENDING,
        created_at=NOW,
        updated_at=NOW,
        expires_at=NOW + timedelta(days=14),
        version=1,
        sync_version=11,
        actor_can_act=SpotmeetingActorActions(can_cancel=True, can_report=True, can_block=True),
    )
