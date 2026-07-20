from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import ValidationError

from app.api.dependencies import get_current_user, get_social_meet_safety_service
from app.auth.supabase import AuthPrincipal
from app.domains.social_meet.privacy import find_forbidden_fields
from app.domains.social_meet.safety_models import (
    BlockView,
    CreateBlockRequest,
    CreateReportRequest,
    ReportReceipt,
    SocialMeetDeletionResult,
    SocialMeetExport,
    SubmittedReportView,
)
from app.domains.social_meet.safety_service import SocialMeetSafetyService
from app.domains.social_meet.service import SocialMeetDomainError

router = APIRouter(prefix="/social-meet", tags=["Social Meet Safety"])

_ERROR_STATUS = {
    "block_not_found": status.HTTP_404_NOT_FOUND,
    "interaction_blocked": status.HTTP_409_CONFLICT,
    "invalid_block_target": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "invalid_report_target": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "profile_not_published": status.HTTP_409_CONFLICT,
    "recipient_unavailable": status.HTTP_404_NOT_FOUND,
    "report_not_found": status.HTTP_404_NOT_FOUND,
}


@router.get("/blocks", response_model=list[BlockView])
def list_social_meet_blocks(
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> list[BlockView]:
    return service.list_blocks(current_user.user_id)


@router.post("/blocks", response_model=BlockView, status_code=status.HTTP_201_CREATED)
def create_social_meet_block(
    payload: dict[str, Any] = Body(...),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> BlockView:
    request = _validate_payload(payload, CreateBlockRequest, "invalid_block_payload")
    try:
        return service.create_block(current_user.user_id, request)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.delete("/blocks/{block_id}", response_model=BlockView)
def remove_social_meet_block(
    block_id: UUID,
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> BlockView:
    try:
        return service.remove_block(current_user.user_id, block_id)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.post("/reports", response_model=ReportReceipt, status_code=status.HTTP_201_CREATED)
def create_social_meet_report(
    payload: dict[str, Any] = Body(...),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> ReportReceipt:
    request = _validate_payload(payload, CreateReportRequest, "invalid_report_payload")
    try:
        return service.create_report(current_user.user_id, request)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.get("/reports/submitted", response_model=list[SubmittedReportView])
def list_submitted_social_meet_reports(
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> list[SubmittedReportView]:
    return service.list_submitted_reports(current_user.user_id)


@router.get("/reports/{report_id}", response_model=SubmittedReportView)
def get_submitted_social_meet_report(
    report_id: UUID,
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> SubmittedReportView:
    try:
        return service.get_submitted_report(current_user.user_id, report_id)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.get("/export", response_model=SocialMeetExport)
def export_social_meet_data(
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> SocialMeetExport:
    return service.export_current_user(current_user.user_id)


@router.delete("/account", response_model=SocialMeetDeletionResult)
def delete_social_meet_account(
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> SocialMeetDeletionResult:
    return service.delete_social_meet_account(current_user.user_id)


def _validate_payload[RequestModel](
    payload: dict[str, Any],
    model: type[RequestModel],
    error_code: str,
) -> RequestModel:
    forbidden = find_forbidden_fields(payload)
    if forbidden:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "forbidden_safety_field",
                "fields": [{"field": item.field, "path": item.path} for item in forbidden],
            },
        )

    try:
        return model.model_validate(payload)  # type: ignore[attr-defined, no-any-return]
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={"code": error_code, "errors": exc.errors(include_input=False)},
        ) from exc


def _domain_http_error(error: SocialMeetDomainError) -> HTTPException:
    return HTTPException(
        status_code=_ERROR_STATUS.get(error.code, status.HTTP_400_BAD_REQUEST),
        detail={"code": error.code, "message": error.detail},
    )
