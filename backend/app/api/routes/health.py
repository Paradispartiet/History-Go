from __future__ import annotations

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict

from app.api.dependencies import get_database, get_settings, get_token_verifier
from app.auth.supabase import SupabaseTokenVerifier
from app.core.config import Settings
from app.core.database import Database

router = APIRouter(prefix="/health", tags=["health"])


class HealthCheck(BaseModel):
    model_config = ConfigDict(frozen=True)

    status: str
    detail: str


class LivenessResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    status: str
    service: str
    version: str


class ReadinessResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    status: str
    service: str
    version: str
    checks: dict[str, HealthCheck]


@router.get("/live", response_model=LivenessResponse)
def liveness(settings: Settings = Depends(get_settings)) -> LivenessResponse:
    """Process liveness. Does not depend on external infrastructure."""

    return LivenessResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
    )


@router.get("/ready", response_model=ReadinessResponse)
def readiness(
    settings: Settings = Depends(get_settings),
    database: Database = Depends(get_database),
    verifier: SupabaseTokenVerifier = Depends(get_token_verifier),
) -> ReadinessResponse | JSONResponse:
    """Deployment readiness with explicit database/auth dependency status."""

    checks: dict[str, HealthCheck] = {}
    blockers: list[str] = []

    if database.configured:
        database_status = database.ping()
        checks["database"] = HealthCheck(
            status="ok" if database_status.ok else "error",
            detail=database_status.detail,
        )
        if not database_status.ok:
            blockers.append("database")
    elif settings.readiness_require_database:
        checks["database"] = HealthCheck(status="error", detail="required_not_configured")
        blockers.append("database")
    else:
        checks["database"] = HealthCheck(status="skipped", detail="not_configured")

    auth_status = verifier.configuration_status()
    if auth_status.configured:
        checks["auth"] = HealthCheck(
            status="ok" if auth_status.ok else "error",
            detail=auth_status.detail,
        )
        if not auth_status.ok:
            blockers.append("auth")
    elif settings.readiness_require_auth:
        checks["auth"] = HealthCheck(status="error", detail="required_not_configured")
        blockers.append("auth")
    else:
        checks["auth"] = HealthCheck(status="skipped", detail="not_configured")

    response = ReadinessResponse(
        status="error" if blockers else "ok",
        service=settings.app_name,
        version=settings.app_version,
        checks=checks,
    )
    if blockers:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=response.model_dump(mode="json"),
        )
    return response
