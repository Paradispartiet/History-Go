from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, Field, SecretStr
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

    request_timeout_seconds: float = Field(default=10.0, gt=0.0, le=60.0)

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


@lru_cache
def get_settings() -> Settings:
    """Load and cache process configuration once per interpreter."""

    return Settings()
