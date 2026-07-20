import jwt
import pytest

from app.auth.supabase import (
    AuthConfigurationError,
    AuthTokenError,
    SupabaseTokenVerifier,
)
from app.core.config import Settings


def test_auth_reports_unconfigured_state() -> None:
    verifier = SupabaseTokenVerifier(Settings(environment="test"))

    status = verifier.configuration_status()

    assert status.configured is False
    assert status.ok is False
    assert status.detail == "not_configured"


def test_auth_rejects_unsupported_jwt_algorithm_before_network_access() -> None:
    token = jwt.encode(
        {"sub": "00000000-0000-0000-0000-000000000001"},
        "a-secure-test-secret-that-is-long-enough",
        algorithm="HS384",
    )
    verifier = SupabaseTokenVerifier(
        Settings(
            environment="test",
            supabase_url="https://example.supabase.co",
        )
    )

    with pytest.raises(AuthTokenError, match="Unsupported JWT algorithm"):
        verifier.verify(token)


def test_legacy_hs256_requires_publishable_key_not_jwt_secret() -> None:
    token = jwt.encode(
        {"sub": "00000000-0000-0000-0000-000000000001"},
        "a-secure-test-secret-that-is-long-enough",
        algorithm="HS256",
    )
    verifier = SupabaseTokenVerifier(
        Settings(
            environment="test",
            supabase_url="https://example.supabase.co",
        )
    )

    with pytest.raises(AuthConfigurationError, match="SUPABASE_PUBLISHABLE_KEY"):
        verifier.verify(token)
