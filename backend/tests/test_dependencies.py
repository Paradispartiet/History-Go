from unittest.mock import MagicMock
from uuid import UUID

import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.api.dependencies import get_current_user
from app.auth.supabase import (
    AuthConfigurationError,
    AuthPrincipal,
    AuthTokenError,
    SupabaseTokenVerifier,
)


def test_current_user_requires_bearer_credentials() -> None:
    verifier = MagicMock(spec=SupabaseTokenVerifier)

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(None, verifier)

    assert exc_info.value.status_code == 401


def test_current_user_maps_auth_configuration_failure_to_503() -> None:
    verifier = MagicMock(spec=SupabaseTokenVerifier)
    verifier.verify.side_effect = AuthConfigurationError("missing")
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(credentials, verifier)

    assert exc_info.value.status_code == 503


def test_current_user_maps_invalid_token_to_401() -> None:
    verifier = MagicMock(spec=SupabaseTokenVerifier)
    verifier.verify.side_effect = AuthTokenError("invalid")
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(credentials, verifier)

    assert exc_info.value.status_code == 401


def test_current_user_returns_verified_principal() -> None:
    principal = AuthPrincipal(user_id=UUID("00000000-0000-0000-0000-000000000001"))
    verifier = MagicMock(spec=SupabaseTokenVerifier)
    verifier.verify.return_value = principal
    credentials = HTTPAuthorizationCredentials(scheme="Bearer", credentials="token")

    assert get_current_user(credentials, verifier) == principal
