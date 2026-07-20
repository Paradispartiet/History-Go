from __future__ import annotations

from typing import cast

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.authorization import require_admin, require_moderator
from app.auth.supabase import (
    AuthConfigurationError,
    AuthPrincipal,
    AuthTokenError,
    SupabaseTokenVerifier,
)
from app.core.config import Settings
from app.core.database import Database
from app.domains.social_meet.abuse_repository import PostgresSocialMeetAbuseRepository
from app.domains.social_meet.abuse_service import SocialMeetInviteAbuseService
from app.domains.social_meet.discovery_repository import PostgresSocialMeetDiscoveryRepository
from app.domains.social_meet.discovery_service import SocialMeetCandidateDiscoveryService
from app.domains.social_meet.moderation_repository import PostgresSocialMeetModerationRepository
from app.domains.social_meet.moderation_service import SocialMeetModerationService
from app.domains.social_meet.operations_repository import PostgresSocialMeetOperationsRepository
from app.domains.social_meet.operations_service import SocialMeetOperationsService
from app.domains.social_meet.repository import PostgresSocialMeetIdentityRepository
from app.domains.social_meet.safety_repository import PostgresSocialMeetSafetyRepository
from app.domains.social_meet.safety_service import SocialMeetSafetyService
from app.domains.social_meet.service import SocialMeetIdentityService
from app.domains.social_meet.spotmeeting_repository import PostgresSpotmeetingInviteRepository
from app.domains.social_meet.spotmeeting_service import SpotmeetingInviteService

_bearer = HTTPBearer(auto_error=False)


def get_settings(request: Request) -> Settings:
    return cast(Settings, request.app.state.settings)


def get_database(request: Request) -> Database:
    return cast(Database, request.app.state.database)


def get_token_verifier(request: Request) -> SupabaseTokenVerifier:
    return cast(SupabaseTokenVerifier, request.app.state.token_verifier)


def _require_database(database: Database) -> None:
    if not database.configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "backend_not_enabled",
                "message": "Database is not configured",
            },
        )


def require_spotmeeting_invite_writes(
    settings: Settings = Depends(get_settings),
) -> None:
    if not settings.spotmeeting_invite_writes_allowed():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "code": "backend_not_enabled",
                "message": "Spotmeeting invite writes are disabled",
            },
        )


def get_social_meet_identity_service(
    database: Database = Depends(get_database),
) -> SocialMeetIdentityService:
    _require_database(database)
    return SocialMeetIdentityService(PostgresSocialMeetIdentityRepository(database))


def get_social_meet_safety_service(
    database: Database = Depends(get_database),
) -> SocialMeetSafetyService:
    _require_database(database)
    return SocialMeetSafetyService(
        PostgresSocialMeetIdentityRepository(database),
        PostgresSocialMeetSafetyRepository(database),
    )


def get_social_meet_moderation_service(
    database: Database = Depends(get_database),
) -> SocialMeetModerationService:
    _require_database(database)
    return SocialMeetModerationService(
        PostgresSocialMeetIdentityRepository(database),
        PostgresSocialMeetModerationRepository(database),
    )


def get_spotmeeting_invite_service(
    database: Database = Depends(get_database),
) -> SpotmeetingInviteService:
    _require_database(database)
    identity_repository = PostgresSocialMeetIdentityRepository(database)
    safety_service = SocialMeetSafetyService(
        identity_repository,
        PostgresSocialMeetSafetyRepository(database),
    )
    abuse_service = SocialMeetInviteAbuseService(
        identity_repository,
        PostgresSocialMeetAbuseRepository(database),
        safety_service,
    )
    return SpotmeetingInviteService(
        identity_repository,
        PostgresSpotmeetingInviteRepository(database),
        abuse_service,
        safety_service,
    )


def get_social_meet_candidate_discovery_service(
    settings: Settings = Depends(get_settings),
    database: Database = Depends(get_database),
) -> SocialMeetCandidateDiscoveryService:
    _require_database(database)
    return SocialMeetCandidateDiscoveryService(
        settings,
        PostgresSocialMeetIdentityRepository(database),
        PostgresSocialMeetDiscoveryRepository(database),
    )


def get_social_meet_operations_service(
    settings: Settings = Depends(get_settings),
    database: Database = Depends(get_database),
) -> SocialMeetOperationsService:
    _require_database(database)
    return SocialMeetOperationsService(
        settings,
        PostgresSocialMeetOperationsRepository(database),
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    verifier: SupabaseTokenVerifier = Depends(get_token_verifier),
) -> AuthPrincipal:
    """Verify a bearer token and return the minimal server identity."""

    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        return verifier.verify(credentials.credentials)
    except AuthConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service is not configured",
        ) from exc
    except AuthTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid bearer token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


def get_current_moderator(
    principal: AuthPrincipal = Depends(get_current_user),
) -> AuthPrincipal:
    return require_moderator(principal)


def get_current_admin(
    principal: AuthPrincipal = Depends(get_current_user),
) -> AuthPrincipal:
    return require_admin(principal)
