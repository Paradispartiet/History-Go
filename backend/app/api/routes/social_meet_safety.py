from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, Request, status
from pydantic import ValidationError

from app.api.dependencies import get_current_user, get_social_meet_safety_service
from app.auth.supabase import AuthPrincipal
from app.domains.social_meet.privacy import find_forbidden_fields
from app.domains.social_meet.safety_models import (
    BlockCreateRequest,
    ReportCreateRequest,
    SocialMeetBlockView,
    SubmittedReportView,
)
from app.domains.social_meet.safety_service import SocialMeetSafetyError, SocialMeetSafetyService

router = APIRouter(prefix="/social-meet", tags=["Social Meet Safety"])

_ERROR_STATUS = {
    "interaction_blocked": status.HTTP_409_CONFLICT,
    "invalid_safety_target": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "moderation_restricted": status.HTTP_403_FORBIDDEN,
    "profile_not_published": status.HTTP_409_CONFLICT,
    "profile_unavailable": status.HTTP_409_CONFLICT,
    "recipient_unavailable": status.HTTP_404_NOT_FOUND,
    "unknown_block": status.HTTP_404_NOT_FOUND,
    "unknown_invite": status.HTTP_404_NOT_FOUND,
    "unknown_report": status.HTTP_404_NOT_FOUND,
}


@router.get("/blocks", response_model=list[SocialMeetBlockView])
def list_social_meet_blocks(
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> list[SocialMeetBlockView]:
    try:
        return service.list_blocks(current_user.user_id)
    except SocialMeetSafetyError as exc:
        raise _safety_http_error(exc) from exc


@router.post(
    "/blocks",
    response_model=SocialMeetBlockView,
    status_code=status.HTTP_201_CREATED,
)
def create_social_meet_block(
    request: Request,
    payload: dict[str, Any] = Body(...),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> SocialMeetBlockView:
    block_request = _parse_block_request(payload)
    try:
        return service.block_profile(
            current_user.user_id,
            block_request,
            request_id=_request_id(request),
        )
    except SocialMeetSafetyError as exc:
        raise _safety_http_error(exc) from exc


@router.delete("/blocks/{block_id}", response_model=SocialMeetBlockView)
def delete_social_meet_block(
    block_id: UUID,
    request: Request,
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> SocialMeetBlockView:
    try:
        return service.unblock_profile(
            current_user.user_id,
            block_id,
            request_id=_request_id(request),
        )
    except SocialMeetSafetyError as exc:
        raise _safety_http_error(exc) from exc


@router.post(
    "/reports",
    response_model=SubmittedReportView,
    status_code=status.HTTP_201_CREATED,
)
def create_social_meet_report(
    request: Request,
    payload: dict[str, Any] = Body(...),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> SubmittedReportView:
    report_request = _parse_report_request(payload)
    try:
        return service.submit_report(
            current_user.user_id,
            report_request,
            request_id=_request_id(request),
        )
    except SocialMeetSafetyError as exc:
        raise _safety_http_error(exc) from exc


@router.get("/reports/submitted", response_model=list[SubmittedReportView])
def list_social_meet_submitted_reports(
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> list[SubmittedReportView]:
    try:
        return service.list_submitted_reports(current_user.user_id)
    except SocialMeetSafetyError as exc:
        raise _safety_http_error(exc) from exc


@router.get("/reports/{report_id}", response_model=SubmittedReportView)
def get_social_meet_submitted_report(
    report_id: UUID,
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetSafetyService = Depends(get_social_meet_safety_service),
) -> SubmittedReportView:
    try:
        return service.get_submitted_report(current_user.user_id, report_id)
    except SocialMeetSafetyError as exc:
        raise _safety_http_error(exc) from exc


def _parse_block_request(payload: dict[str, Any]) -> BlockCreateRequest:
    _reject_forbidden_fields(payload)
    try:
        return BlockCreateRequest.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_block_payload",
                "errors": exc.errors(include_input=False),
            },
        ) from exc


def _parse_report_request(payload: dict[str, Any]) -> ReportCreateRequest:
    _reject_forbidden_fields(payload)
    try:
        return ReportCreateRequest.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_report_payload",
                "errors": exc.errors(include_input=False),
            },
        ) from exc


def _reject_forbidden_fields(payload: dict[str, Any]) -> None:
    forbidden = find_forbidden_fields(payload)
    if not forbidden:
        return
    raise HTTPException(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        detail={
            "code": "forbidden_safety_field",
            "fields": [{"field": item.field, "path": item.path} for item in forbidden],
        },
    )


def _request_id(request: Request) -> str | None:
    raw = getattr(request.state, "request_id", None)
    return str(raw) if raw else None


def _safety_http_error(error: SocialMeetSafetyError) -> HTTPException:
    return HTTPException(
        status_code=_ERROR_STATUS.get(error.code, status.HTTP_400_BAD_REQUEST),
        detail={"code": error.code, "message": error.detail},
    )
