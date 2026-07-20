from __future__ import annotations

from uuid import UUID, uuid4

from fastapi.testclient import TestClient

from app.api.dependencies import get_current_user, get_spotmeeting_invite_service
from app.auth.supabase import AuthPrincipal
from app.core.config import Settings
from app.domains.social_meet.spotmeeting_models import (
    CreateSpotmeetingInviteRequest,
    SpotmeetingInvitePage,
    SpotmeetingInviteState,
    SpotmeetingInviteView,
)
from app.main import create_app


class StubInviteService:
    def __init__(self) -> None:
        self.create_calls = 0

    def create_invite(
        self,
        auth_user_id: UUID,
        request: CreateSpotmeetingInviteRequest,
    ) -> SpotmeetingInviteView:
        self.create_calls += 1
        raise AssertionError("disabled production write must not reach the domain service")

    def list_inbox(
        self,
        auth_user_id: UUID,
        *,
        cursor: int,
        limit: int,
        state: SpotmeetingInviteState | None,
    ) -> SpotmeetingInvitePage:
        return SpotmeetingInvitePage(invites=[], cursor=cursor, has_more=False)


def test_invite_write_switch_is_open_outside_production_and_fail_closed_in_production() -> None:
    assert Settings(environment="test").spotmeeting_invite_writes_allowed()
    assert Settings(environment="staging").spotmeeting_invite_writes_allowed()
    assert not Settings(environment="production").spotmeeting_invite_writes_allowed()
    assert Settings(
        environment="production",
        spotmeeting_invite_writes_enabled=True,
    ).spotmeeting_invite_writes_allowed()


def test_production_write_kill_switch_blocks_mutation_before_domain_service() -> None:
    principal = AuthPrincipal(user_id=uuid4())
    service = StubInviteService()
    app = create_app(
        Settings(
            environment="production",
            spotmeeting_invite_writes_enabled=False,
        )
    )
    app.dependency_overrides[get_current_user] = lambda: principal
    app.dependency_overrides[get_spotmeeting_invite_service] = lambda: service
    client = TestClient(app)

    response = client.post(
        "/api/v1/social-meet/spotmeeting/invites",
        json={
            "recipientProfileId": str(uuid4()),
            "context": {
                "contextType": "place",
                "contextId": "akershus_festning",
                "title": "Akershus festning",
                "reason": "Shared learning context",
                "sourceSurface": "place_card",
            },
            "presetMessageId": "compare_place_learning",
            "idempotencyKey": "retry-key-production-1",
        },
    )

    assert response.status_code == 503
    assert response.json()["detail"]["code"] == "backend_not_enabled"
    assert service.create_calls == 0


def test_production_write_kill_switch_does_not_block_participant_inbox_reads() -> None:
    principal = AuthPrincipal(user_id=uuid4())
    service = StubInviteService()
    app = create_app(
        Settings(
            environment="production",
            spotmeeting_invite_writes_enabled=False,
        )
    )
    app.dependency_overrides[get_current_user] = lambda: principal
    app.dependency_overrides[get_spotmeeting_invite_service] = lambda: service
    client = TestClient(app)

    response = client.get("/api/v1/social-meet/spotmeeting/inbox")

    assert response.status_code == 200
    assert response.json() == {"invites": [], "cursor": 0, "hasMore": False}
