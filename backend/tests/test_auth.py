import base64
import json
from types import SimpleNamespace
from unittest.mock import MagicMock

import httpx
import jwt
import pytest

from app.auth.supabase import (
    AuthConfigurationError,
    AuthTokenError,
    SupabaseTokenVerifier,
)
from app.core.config import Settings

TEST_USER_ID = "00000000-0000-0000-0000-000000000001"
TEST_HMAC_KEY = "x" * 64


def _token_with_algorithm_header(algorithm: str) -> str:
    def encode(value: dict[str, str]) -> str:
        raw = json.dumps(value, separators=(",", ":")).encode()
        return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()

    return f"{encode({'alg': algorithm, 'typ': 'JWT'})}.{encode({'sub': TEST_USER_ID})}.sig"


def test_auth_reports_unconfigured_state() -> None:
    verifier = SupabaseTokenVerifier(Settings(environment="test"))

    status = verifier.configuration_status()

    assert status.configured is False
    assert status.ok is False
    assert status.detail == "not_configured"


def test_verify_rejects_empty_and_unconfigured_tokens() -> None:
    verifier = SupabaseTokenVerifier(Settings(environment="test"))

    with pytest.raises(AuthTokenError, match="Missing bearer token"):
        verifier.verify("   ")
    with pytest.raises(AuthConfigurationError, match="not configured"):
        verifier.verify("not-a-jwt")


def test_auth_rejects_unsupported_jwt_algorithm_before_network_access() -> None:
    token = jwt.encode(
        {"sub": TEST_USER_ID},
        TEST_HMAC_KEY,
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


def test_asymmetric_token_uses_jwks_and_verified_claims(monkeypatch: pytest.MonkeyPatch) -> None:
    verifier = SupabaseTokenVerifier(
        Settings(
            environment="test",
            supabase_url="https://example.supabase.co",
        )
    )
    jwks_client = MagicMock()
    jwks_client.get_signing_key_from_jwt.return_value = SimpleNamespace(key="public-key")
    verifier._jwks_client = jwks_client
    decode = MagicMock(
        return_value={
            "sub": TEST_USER_ID,
            "role": "authenticated",
            "email": "person@example.com",
        }
    )
    monkeypatch.setattr(jwt, "decode", decode)

    principal = verifier.verify(_token_with_algorithm_header("RS256"))

    assert str(principal.user_id) == TEST_USER_ID
    assert principal.email == "person@example.com"
    jwks_client.get_signing_key_from_jwt.assert_called_once()
    decode.assert_called_once()


def test_legacy_hs256_requires_publishable_key_not_jwt_secret() -> None:
    token = jwt.encode(
        {"sub": TEST_USER_ID},
        TEST_HMAC_KEY,
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


def test_legacy_hs256_verification_returns_minimal_principal() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.headers["apikey"] == "publishable-test-key"
        assert request.headers["authorization"].startswith("Bearer ")
        return httpx.Response(
            200,
            json={
                "id": TEST_USER_ID,
                "email": "person@example.com",
                "role": "authenticated",
            },
        )

    client = httpx.Client(transport=httpx.MockTransport(handler))
    verifier = SupabaseTokenVerifier(
        Settings(
            environment="test",
            supabase_url="https://example.supabase.co",
            supabase_publishable_key="publishable-test-key",
        ),
        http_client=client,
    )
    token = jwt.encode({"sub": TEST_USER_ID}, TEST_HMAC_KEY, algorithm="HS256")

    principal = verifier.verify(token)

    assert str(principal.user_id) == TEST_USER_ID
    assert principal.email == "person@example.com"
    assert principal.role == "authenticated"
    client.close()


def test_legacy_hs256_rejects_auth_server_failure() -> None:
    client = httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(401)))
    verifier = SupabaseTokenVerifier(
        Settings(
            environment="test",
            supabase_url="https://example.supabase.co",
            supabase_publishable_key="publishable-test-key",
        ),
        http_client=client,
    )
    token = jwt.encode({"sub": TEST_USER_ID}, TEST_HMAC_KEY, algorithm="HS256")

    with pytest.raises(AuthTokenError, match="Invalid Supabase access token"):
        verifier.verify(token)
    client.close()


def test_principal_claim_validation_fails_closed() -> None:
    with pytest.raises(AuthTokenError, match="invalid identity claims"):
        SupabaseTokenVerifier._principal_from_claims({"sub": "not-a-uuid"})
