from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user, get_social_meet_identity_service
from app.auth.supabase import AuthPrincipal
from app.core.config import Settings
from app.domains.social_meet.models import (
    CurrentSocialMeetState,
    KnowledgeFingerprint,
    ProfileUpsertRequest,
    ProfileVisibility,
    PublicSocialMeetProfile,
)
from app.domains.social_meet.service import SocialMeetDomainError
from app.main import create_app


class StubSocialMeetService:
    def __init__(self) -> None:
        self.profile_id = uuid4()
        self.raise_error: SocialMeetDomainError | None = None
        self.last_profile: ProfileUpsertRequest | None = None

    def get_current_state(self, auth_user_id: UUID) -> CurrentSocialMeetState:
        self._raise_if_configured()
        return CurrentSocialMeetState(
            user_id=uuid4(),
            profile_id=self.profile_id,
            profile_visibility=ProfileVisibility.DRAFT,
            consent_version=None,
            consented_at=None,
            can_publish_profile=True,
        )

    def upsert_profile(
        self,
        auth_user_id: UUID,
        profile: ProfileUpsertRequest,
    ) -> PublicSocialMeetProfile:
        self._raise_if_configured()
        self.last_profile = profile
        return _public_profile(self.profile_id)

    def get_public_profile(
        self,
        requester_auth_user_id: UUID,
        profile_id: UUID,
    ) -> PublicSocialMeetProfile:
        self._raise_if_configured()
        return _public_profile(profile_id)

    def unpublish(self, auth_user_id: UUID) -> CurrentSocialMeetState:
        self._raise_if_configured()
        return CurrentSocialMeetState(
            user_id=uuid4(),
            profile_id=self.profile_id,
            profile_visibility=ProfileVisibility.PRIVATE,
            consent_version="social_meet_identity_v1",
            consented_at=datetime(2026, 7, 20, 10, 0, tzinfo=UTC),
            can_publish_profile=True,
        )

    def _raise_if_configured(self) -> None:
        if self.raise_error is not None:
            raise self.raise_error


def test_social_meet_me_returns_private_current_user_state() -> None:
    client, _ = _client()

    response = client.get("/api/v1/social-meet/me")

    assert response.status_code == 200
    payload = response.json()
    assert payload["profileVisibility"] == "draft"
    assert payload["canPublishProfile"] is True
    assert "accountId" not in payload
    assert "authSubject" not in payload


def test_profile_update_rejects_forbidden_nested_privacy_fields_before_service() -> None:
    client, service = _client()

    response = client.put(
        "/api/v1/social-meet/profile",
        json={
            "displayName": "Ada",
            "fingerprintInputs": {
                "themeTags": ["history"],
                "metadata": {"liveLocation": {"lat": 59.9, "lon": 10.7}},
            },
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "forbidden_profile_field"
    assert service.last_profile is None


def test_profile_update_rejects_unknown_non_profile_fields() -> None:
    client, _ = _client()

    response = client.put(
        "/api/v1/social-meet/profile",
        json={"displayName": "Ada", "publicHomePlaceId": "oslo_s"},
    )

    assert response.status_code == 422
    assert response.json()["detail"]["code"] == "invalid_profile_payload"


def test_profile_update_returns_only_public_safe_fields() -> None:
    client, service = _client()

    response = client.put(
        "/api/v1/social-meet/profile",
        json={
            "displayName": "Ada",
            "shortBio": "Industrial history",
            "preferredThemes": ["industrial_history"],
            "fingerprintInputs": {"themeTags": ["industrial_history"]},
            "profileVisibility": "discoverable",
            "consentVersion": "social_meet_identity_v1",
            "previewConfirmed": True,
        },
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["profileId"] == str(service.profile_id)
    assert payload["displayName"] == "Ada"
    assert payload["knowledgeFingerprintSummary"]["themeTags"] == ["industrial_history"]
    assert "userId" not in payload
    assert "email" not in payload
    assert service.last_profile is not None
    assert service.last_profile.preview_confirmed is True


def test_public_profile_endpoint_maps_domain_errors_to_stable_codes() -> None:
    client, service = _client()
    service.raise_error = SocialMeetDomainError(
        code="social_meet_opt_in_required",
        detail="Opt in required",
    )

    response = client.get(f"/api/v1/social-meet/profiles/{uuid4()}")

    assert response.status_code == 403
    assert response.json()["detail"] == {
        "code": "social_meet_opt_in_required",
        "message": "Opt in required",
    }


def test_unpublish_moves_profile_out_of_discovery() -> None:
    client, _ = _client()

    response = client.post("/api/v1/social-meet/profile/unpublish")

    assert response.status_code == 200
    assert response.json()["profileVisibility"] == "private"


def test_social_meet_endpoints_fail_closed_when_database_is_not_configured() -> None:
    app = create_app(Settings(environment="test"))
    principal = AuthPrincipal(user_id=uuid4())
    app.dependency_overrides[get_current_user] = lambda: principal
    client = TestClient(app)

    response = client.get("/api/v1/social-meet/me")

    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "backend_not_enabled"


def _client() -> tuple[TestClient, StubSocialMeetService]:
    app = create_app(Settings(environment="test"))
    service = StubSocialMeetService()
    principal = AuthPrincipal(user_id=uuid4())
    app.dependency_overrides[get_current_user] = lambda: principal
    app.dependency_overrides[get_social_meet_identity_service] = lambda: service
    return TestClient(app), service


def _public_profile(profile_id: UUID) -> PublicSocialMeetProfile:
    return PublicSocialMeetProfile(
        profile_id=profile_id,
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
        profile_updated_at=datetime(2026, 7, 20, 12, 0, tzinfo=UTC),
    )
