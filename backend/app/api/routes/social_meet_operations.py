from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_current_admin, get_social_meet_operations_service
from app.auth.supabase import AuthPrincipal
from app.domains.social_meet.operations_models import (
    ApplyRetentionRequest,
    CreateRetentionHoldRequest,
    RetentionHoldView,
    RetentionPreview,
    RetentionRunResult,
    SocialMeetOperationalMetrics,
)
from app.domains.social_meet.operations_service import SocialMeetOperationsService
from app.domains.social_meet.service import SocialMeetDomainError

router = APIRouter(prefix="/social-meet/operations", tags=["Social Meet Operations"])

_ERROR_STATUS = {
    "backend_not_enabled": status.HTTP_503_SERVICE_UNAVAILABLE,
    "invalid_retention_hold": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "retention_entity_not_found": status.HTTP_404_NOT_FOUND,
    "retention_hold_not_found": status.HTTP_404_NOT_FOUND,
    "retention_policy_confirmation_required": status.HTTP_409_CONFLICT,
}


@router.get("/metrics", response_model=SocialMeetOperationalMetrics)
def get_social_meet_operational_metrics(
    admin: AuthPrincipal = Depends(get_current_admin),
    service: SocialMeetOperationsService = Depends(get_social_meet_operations_service),
) -> SocialMeetOperationalMetrics:
    del admin
    return service.operational_metrics()


@router.get("/retention/preview", response_model=RetentionPreview)
def preview_social_meet_retention(
    admin: AuthPrincipal = Depends(get_current_admin),
    service: SocialMeetOperationsService = Depends(get_social_meet_operations_service),
) -> RetentionPreview:
    del admin
    return service.preview_retention()


@router.post("/retention/run", response_model=RetentionRunResult)
def run_social_meet_retention(
    payload: ApplyRetentionRequest,
    admin: AuthPrincipal = Depends(get_current_admin),
    service: SocialMeetOperationsService = Depends(get_social_meet_operations_service),
) -> RetentionRunResult:
    try:
        return service.apply_retention(admin, payload)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.get("/retention/holds", response_model=list[RetentionHoldView])
def list_social_meet_retention_holds(
    include_released: bool = Query(default=False),
    limit: int = Query(default=100, ge=1, le=500),
    admin: AuthPrincipal = Depends(get_current_admin),
    service: SocialMeetOperationsService = Depends(get_social_meet_operations_service),
) -> list[RetentionHoldView]:
    del admin
    return service.list_retention_holds(
        include_released=include_released,
        limit=limit,
    )


@router.post(
    "/retention/holds",
    response_model=RetentionHoldView,
    status_code=status.HTTP_201_CREATED,
)
def create_social_meet_retention_hold(
    payload: CreateRetentionHoldRequest,
    admin: AuthPrincipal = Depends(get_current_admin),
    service: SocialMeetOperationsService = Depends(get_social_meet_operations_service),
) -> RetentionHoldView:
    try:
        return service.create_retention_hold(admin, payload)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.post("/retention/holds/{hold_id}/release", response_model=RetentionHoldView)
def release_social_meet_retention_hold(
    hold_id: UUID,
    admin: AuthPrincipal = Depends(get_current_admin),
    service: SocialMeetOperationsService = Depends(get_social_meet_operations_service),
) -> RetentionHoldView:
    try:
        return service.release_retention_hold(admin, hold_id)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


def _domain_http_error(error: SocialMeetDomainError) -> HTTPException:
    return HTTPException(
        status_code=_ERROR_STATUS.get(error.code, status.HTTP_400_BAD_REQUEST),
        detail={"code": error.code, "message": error.detail},
    )
