from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.api.dependencies import (
    get_current_user,
    get_social_meet_candidate_discovery_service,
)
from app.auth.supabase import AuthPrincipal
from app.core.config import Settings
from app.domains.social_meet.discovery_models import (
    ContextCandidateRequest,
    ContextCandidateResponse,
    DiscoveryCandidate,
    DiscoveryCandidateProfile,
    DiscoveryMatchReason,
)
from app.domains.social_meet.models import KnowledgeFingerprint
from app.domains.social_meet.service import SocialMeetDomainError
from app.domains.social_meet.spotmeeting_models import SpotmeetingContextType
from app.main import create_app

NOW = datetime(2026, 7, 20, 18, 30, tzinfo=UTC)


class StubDiscoveryService:
    def __init__(self, user_id: UUID) -> None:
        self.user_id = user_id
        self.calls = 0
        self.error: SocialMeetDomainError | None = None

    def find_context_candidates(
        self,
        auth_user_id: UUID,
        request: ContextCandidateRequest,
    ) -> ContextCandidateResponse:
        assert auth_user_id == self.user_id
        self.calls += 1
        if self.error is not None:
            raise self.error
        return ContextCandidateResponse(
            context_type=request.context.context_type,
            context_id=request.context.context_id,
            generated_at=NOW,
            stale_after_seconds=300,
            candidates=[
                DiscoveryCandidate(
                    profile=DiscoveryCandidateProfile(
                        profile_id=uuid4(),
                        display_name="Ada",
                        avatar_ref=None,
                        short_bio="Historie og arkitektur",
                        preferred_themes=["history"],
                        favorite_eras=["medieval"],
                        learning_goals=["architecture"],
                        knowledge_fingerprint_summary=KnowledgeFingerprint(
                            theme_tags=["history"]
                        ),
                        profile_updated_at=NOW,
                    ),
                    match_reasons=[DiscoveryMatchReason.CONTEXT_THEME],
                )
            ],
        )


def test_context_candidate_endpoint_returns_participant_safe_projection() -> None:
    client, _ = _client()

    response = client.post(
        "/api/v1/social-meet/spotmeeting/discovery/context-candidates",
        json=_payload(),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["contextType"] == "place"
    assert body["staleAfterSeconds"] == 300
    assert body["candidates"][0]["profile"]["displayName"] == "Ada"
    serialized = str(body).lower()
    assert "score" not in serialized
    assert "auth" not in serialized
    assert "userid" not in serialized
    assert "lastseen" not in serialized
    assert "online" not in serialized
    assert "distance" not in serialized


def test_nested_location_presence_and_history_fields_fail_before_domain_execution() -> None:
    for forbidden_field in ("liveLocation", "nearby", "publicVisitHistory", "followers"):
        client, service = _client()
        payload = _payload()
        payload["context"]["metadata"] = {forbidden_field: ["private"]}

        response = client.post(
            "/api/v1/social-meet/spotmeeting/discovery/context-candidates",
            json=payload,
        )

        assert response.status_code == 422
        assert response.json()["detail"]["code"] == "forbidden_discovery_field"
        assert service.calls == 0


def test_unknown_or_free_form_discovery_payload_fields_are_rejected() -> None:
    client, service = _client()
    payload = _payload()
    payload["message"] = "find me people nearby"

    response = client.post(
        "/api/v1/social-meet/spotmeeting/discovery/context-candidates",
        json=payload,
    )

    assert response.status_code == 422
    assert service.calls == 0


def test_disabled_discovery_maps_to_fail_closed_backend_error() -> None:
    client, service = _client()
    service.error = SocialMeetDomainError(
        code="backend_not_enabled",
        detail="Spotmeeting candidate discovery is not enabled for this profile",
    )

    response = client.post(
        "/api/v1/social-meet/spotmeeting/discovery/context-candidates",
        json=_payload(),
    )

    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "backend_not_enabled"


def test_unpublished_requester_maps_to_conflict_without_exposing_private_state() -> None:
    client, service = _client()
    service.error = SocialMeetDomainError(
        code="profile_not_published",
        detail="A current discoverable Social Meet profile is required for discovery",
    )

    response = client.post(
        "/api/v1/social-meet/spotmeeting/discovery/context-candidates",
        json=_payload(),
    )

    assert response.status_code == 409
    assert response.json()["detail"]["code"] == "profile_not_published"


def _client() -> tuple[TestClient, StubDiscoveryService]:
    principal = AuthPrincipal(user_id=uuid4())
    service = StubDiscoveryService(principal.user_id)
    app = create_app(Settings(environment="test", spotmeeting_discovery_enabled=True))
    app.dependency_overrides[get_current_user] = lambda: principal
    app.dependency_overrides[get_social_meet_candidate_discovery_service] = lambda: service
    return TestClient(app), service


def _payload() -> dict[str, object]:
    return {
        "context": {
            "contextType": SpotmeetingContextType.PLACE.value,
            "contextId": "akershus_festning",
            "themeTags": ["history"],
            "eraTags": ["medieval"],
            "topicTags": ["fortifications"],
            "learningGoalTags": ["architecture"],
        },
        "limit": 10,
    }
