from __future__ import annotations

from functools import lru_cache
from typing import Literal
from uuid import UUID

from pydantic import AnyHttpUrl, Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["development", "test", "staging", "production"]


class Settings(BaseSettings):
    """Validated runtime configuration for the History GO backend."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_prefix="HG_BACKEND_",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "History GO Backend"
    app_version: str = "0.1.0"
    environment: Environment = "development"
    api_prefix: str = "/api/v1"
    docs_enabled: bool = True

    database_url: SecretStr | None = None
    readiness_require_database: bool = False

    supabase_url: AnyHttpUrl | None = None
    supabase_publishable_key: SecretStr | None = None
    supabase_jwt_audience: str = "authenticated"
    readiness_require_auth: bool = False

    spotmeeting_invite_writes_enabled: bool = False
    spotmeeting_discovery_enabled: bool = False
    spotmeeting_discovery_cohort_user_ids: str = ""
    spotmeeting_discovery_pool_limit: int = Field(default=200, ge=20, le=1000)
    spotmeeting_discovery_max_candidates: int = Field(default=20, ge=1, le=50)
    spotmeeting_discovery_stale_after_seconds: int = Field(default=300, ge=30, le=3600)

    request_timeout_seconds: float = Field(default=10.0, gt=0.0, le=60.0)

    @field_validator("spotmeeting_discovery_cohort_user_ids", mode="before")
    @classmethod
    def validate_discovery_cohort(cls, value: object) -> object:
        if value is None:
            return ""
        if not isinstance(value, str):
            return value
        normalized: list[str] = []
        for raw_value in value.split(","):
            candidate = raw_value.strip()
            if not candidate:
                continue
            normalized.append(str(UUID(candidate)))
        return ",".join(dict.fromkeys(normalized))

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def openapi_enabled(self) -> bool:
        return self.docs_enabled and not self.is_production

    @property
    def database_configured(self) -> bool:
        return bool(self.database_url and self.database_url.get_secret_value().strip())

    @property
    def auth_configured(self) -> bool:
        return self.supabase_url is not None

    @property
    def supabase_issuer(self) -> str | None:
        if self.supabase_url is None:
            return None
        return f"{str(self.supabase_url).rstrip('/')}/auth/v1"

    @property
    def supabase_jwks_url(self) -> str | None:
        issuer = self.supabase_issuer
        return f"{issuer}/.well-known/jwks.json" if issuer else None

    @property
    def spotmeeting_discovery_cohort(self) -> frozenset[UUID]:
        return frozenset(
            UUID(value)
            for value in self.spotmeeting_discovery_cohort_user_ids.split(",")
            if value
        )

    def spotmeeting_invite_writes_allowed(self) -> bool:
        return not self.is_production or self.spotmeeting_invite_writes_enabled

    def spotmeeting_discovery_allowed_for(self, auth_user_id: UUID) -> bool:
        if not self.spotmeeting_discovery_enabled:
            return False
        cohort = self.spotmeeting_discovery_cohort
        if cohort:
            return auth_user_id in cohort
        return not self.is_production


@lru_cache
def get_settings() -> Settings:
    """Load and cache process configuration once per interpreter."""

    return Settings()
