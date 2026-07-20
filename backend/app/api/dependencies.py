from __future__ import annotations

from typing import cast

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.auth.supabase import (
    AuthConfigurationError,
    AuthPrincipal,
    AuthTokenError,
    SupabaseTokenVerifier,
)
from app.core.config import Settings
from app.core.database import Database
from app.domains.social_meet.repository import PostgresSocialMeetIdentityRepository
from app.domains.social_meet.service import SocialMeetIdentityService

_bearer = HTTPBearer(auto_error=False)


def get_settings(request: Request) -> Settings:
    return cast(Settings, request.app.state.settings)


def get_database(request: Request) -> Database:
    return cast(Database, request.app.state.database)


def get_token_verifier(request: Request) -> SupabaseTokenVerifier:
    return cast(SupabaseTokenVerifier, request.app.state.token_verifier)


def get_social_meet_identity_service(
    database: Database = Depends(get_database),
) -> SocialMeetIdentityService:
    if not database.configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "backend_not_enabled", "message": "Database is not configured"},
        )
    return SocialMeetIdentityService(PostgresSocialMeetIdentityRepository(database))


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
