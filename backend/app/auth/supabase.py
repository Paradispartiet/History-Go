from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

import httpx
import jwt
from jwt import InvalidTokenError, PyJWKClient
from pydantic import BaseModel, ConfigDict

from app.core.config import Settings

ASYMMETRIC_ALGORITHMS = frozenset({"RS256", "ES256"})
LEGACY_ALGORITHM = "HS256"


class AuthError(Exception):
    """Base class for authentication boundary failures."""


class AuthConfigurationError(AuthError):
    """Authentication infrastructure is not configured correctly."""


class AuthTokenError(AuthError):
    """The presented bearer token is invalid or unsupported."""


class AuthPrincipal(BaseModel):
    """Minimal verified identity exposed to backend domain code."""

    model_config = ConfigDict(frozen=True)

    user_id: UUID
    role: str = "authenticated"
    email: str | None = None
    app_roles: frozenset[str] = frozenset()


@dataclass(frozen=True, slots=True)
class AuthConfigurationStatus:
    configured: bool
    ok: bool
    detail: str


class SupabaseTokenVerifier:
    """Verify Supabase access tokens without exposing Supabase details to domains.

    Asymmetric RS256/ES256 tokens are verified locally against the project's JWKS.
    Legacy HS256 tokens are verified through the Supabase Auth `/user` endpoint so
    the backend never needs to possess or trust the legacy JWT signing secret.

    History GO staff authorization is sourced only from server-controlled Supabase
    ``app_metadata.history_go_roles``. User-editable metadata, generic role fields,
    and email addresses are never treated as History GO authorization inputs.
    """

    def __init__(self, settings: Settings, http_client: httpx.Client | None = None) -> None:
        self._settings = settings
        self._http_client = http_client
        self._jwks_client: PyJWKClient | None = None

    @property
    def configured(self) -> bool:
        return self._settings.auth_configured

    def configuration_status(self) -> AuthConfigurationStatus:
        if not self.configured:
            return AuthConfigurationStatus(False, False, "not_configured")
        if not self._settings.supabase_issuer or not self._settings.supabase_jwks_url:
            return AuthConfigurationStatus(True, False, "invalid_supabase_url")
        return AuthConfigurationStatus(True, True, "ok")

    def verify(self, token: str) -> AuthPrincipal:
        if not token.strip():
            raise AuthTokenError("Missing bearer token")
        if not self.configured:
            raise AuthConfigurationError("Supabase Auth is not configured")

        try:
            header = jwt.get_unverified_header(token)
        except InvalidTokenError as exc:
            raise AuthTokenError("Malformed bearer token") from exc

        algorithm = str(header.get("alg") or "").upper()
        if algorithm in ASYMMETRIC_ALGORITHMS:
            return self._verify_asymmetric(token, algorithm)
        if algorithm == LEGACY_ALGORITHM:
            return self._verify_legacy_with_auth_server(token)
        raise AuthTokenError(f"Unsupported JWT algorithm: {algorithm or 'missing'}")

    def _verify_asymmetric(self, token: str, algorithm: str) -> AuthPrincipal:
        issuer = self._settings.supabase_issuer
        jwks_url = self._settings.supabase_jwks_url
        if not issuer or not jwks_url:
            raise AuthConfigurationError("Supabase issuer/JWKS URL is unavailable")

        if self._jwks_client is None:
            self._jwks_client = PyJWKClient(jwks_url)

        try:
            signing_key = self._jwks_client.get_signing_key_from_jwt(token)
            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=[algorithm],
                issuer=issuer,
                audience=self._settings.supabase_jwt_audience,
                options={"require": ["exp", "iss", "sub"]},
            )
        except (InvalidTokenError, ValueError) as exc:
            raise AuthTokenError("Invalid Supabase access token") from exc

        return self._principal_from_claims(claims)

    def _verify_legacy_with_auth_server(self, token: str) -> AuthPrincipal:
        issuer = self._settings.supabase_issuer
        publishable_key = self._settings.supabase_publishable_key
        if not issuer:
            raise AuthConfigurationError("Supabase issuer is unavailable")
        if publishable_key is None or not publishable_key.get_secret_value().strip():
            raise AuthConfigurationError(
                "Legacy HS256 verification requires HG_BACKEND_SUPABASE_PUBLISHABLE_KEY"
            )

        client = self._http_client or httpx.Client(timeout=self._settings.request_timeout_seconds)
        owns_client = self._http_client is None
        try:
            response = client.get(
                f"{issuer}/user",
                headers={
                    "apikey": publishable_key.get_secret_value(),
                    "Authorization": f"Bearer {token}",
                },
            )
            if response.status_code != httpx.codes.OK:
                raise AuthTokenError("Invalid Supabase access token")
            payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise AuthTokenError("Supabase Auth verification failed") from exc
        finally:
            if owns_client:
                client.close()

        try:
            return AuthPrincipal(
                user_id=UUID(str(payload["id"])),
                role=str(payload.get("role") or "authenticated"),
                email=_optional_string(payload.get("email")),
                app_roles=_extract_app_roles(payload.get("app_metadata")),
            )
        except (KeyError, TypeError, ValueError) as exc:
            raise AuthTokenError("Supabase Auth returned an invalid user payload") from exc

    @staticmethod
    def _principal_from_claims(claims: dict[str, Any]) -> AuthPrincipal:
        try:
            return AuthPrincipal(
                user_id=UUID(str(claims["sub"])),
                role=str(claims.get("role") or "authenticated"),
                email=_optional_string(claims.get("email")),
                app_roles=_extract_app_roles(claims.get("app_metadata")),
            )
        except (KeyError, TypeError, ValueError) as exc:
            raise AuthTokenError("Supabase access token has invalid identity claims") from exc


def _extract_app_roles(value: object) -> frozenset[str]:
    if not isinstance(value, dict):
        return frozenset()

    raw_roles = value.get("history_go_roles")
    if isinstance(raw_roles, str):
        candidates: list[object] = [raw_roles]
    elif isinstance(raw_roles, list | tuple | set | frozenset):
        candidates = list(raw_roles)
    else:
        return frozenset()

    normalized = {
        role
        for raw_role in candidates
        if isinstance(raw_role, str) and (role := raw_role.strip().lower())
    }
    return frozenset(normalized)


def _optional_string(value: object) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None
