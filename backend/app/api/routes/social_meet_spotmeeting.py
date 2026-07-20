from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, Query, status
from pydantic import ValidationError

from app.api.dependencies import get_current_user, get_spotmeeting_invite_service
from app.auth.supabase import AuthPrincipal
from app.domains.social_meet.privacy import find_forbidden_fields
from app.domains.social_meet.service import SocialMeetDomainError
from app.domains.social_meet.spotmeeting_models import (
    CreateSpotmeetingInviteRequest,
    InviteTransitionRequest,
    SpotmeetingInvitePage,
    SpotmeetingInviteState,
    SpotmeetingInviteView,
    SpotmeetingPreset,
)
from app.domains.social_meet.spotmeeting_service import SpotmeetingInviteService

router = APIRouter(prefix="/social-meet/spotmeeting", tags=["Spotmeeting"])

_ERROR_STATUS = {
    "conflict": status.HTTP_409_CONFLICT,
    "duplicate_active_invite": status.HTTP_409_CONFLICT,
    "idempotency_conflict": status.HTTP_409_CONFLICT,
    "invalid_invite_context": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "invalid_invite_target": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "invalid_invite_transition": status.HTTP_409_CONFLICT,
    "invite_expired": status.HTTP_409_CONFLICT,
    "interaction_blocked": status.HTTP_409_CONFLICT,
    "moderation_restricted": status.HTTP_409_CONFLICT,
    "profile_not_published": status.HTTP_409_CONFLICT,
    "rate_limited": status.HTTP_429_TOO_MANY_REQUESTS,
    "recipient_unavailable": status.HTTP_404_NOT_FOUND,
    "unknown_invite": status.HTTP_404_NOT_FOUND,
}


@router.get("/presets", response_model=list[SpotmeetingPreset])
def list_spotmeeting_presets() -> list[SpotmeetingPreset]:
    return SpotmeetingInviteService.list_presets()


@router.post(
    "/invites",
    response_model=SpotmeetingInviteView,
    status_code=status.HTTP_201_CREATED,
)
def create_spotmeeting_invite(
    payload: dict[str, Any] = Body(...),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SpotmeetingInviteService = Depends(get_spotmeeting_invite_service),
) -> SpotmeetingInviteView:
    request = _validate_create_payload(payload)
    try:
        return service.create_invite(current_user.user_id, request)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.get("/inbox", response_model=SpotmeetingInvitePage)
def list_spotmeeting_inbox(
    cursor: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100),
    state: SpotmeetingInviteState | None = Query(default=None),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SpotmeetingInviteService = Depends(get_spotmeeting_invite_service),
) -> SpotmeetingInvitePage:
    return service.list_inbox(
        current_user.user_id,
        cursor=cursor,
        limit=limit,
        state=state,
    )


@router.get("/sync", response_model=SpotmeetingInvitePage)
def sync_spotmeeting_invites(
    cursor: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=200),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SpotmeetingInviteService = Depends(get_spotmeeting_invite_service),
) -> SpotmeetingInvitePage:
    return service.sync(current_user.user_id, cursor=cursor, limit=limit)


@router.post("/invites/{invite_id}/accept", response_model=SpotmeetingInviteView)
def accept_spotmeeting_invite(
    invite_id: UUID,
    payload: InviteTransitionRequest | None = Body(default=None),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SpotmeetingInviteService = Depends(get_spotmeeting_invite_service),
) -> SpotmeetingInviteView:
    return _run_transition(
        lambda: service.accept_invite(
            current_user.user_id,
            invite_id,
            expected_version=_expected_version(payload),
        )
    )


@router.post("/invites/{invite_id}/decline", response_model=SpotmeetingInviteView)
def decline_spotmeeting_invite(
    invite_id: UUID,
    payload: InviteTransitionRequest | None = Body(default=None),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SpotmeetingInviteService = Depends(get_spotmeeting_invite_service),
) -> SpotmeetingInviteView:
    return _run_transition(
        lambda: service.decline_invite(
            current_user.user_id,
            invite_id,
            expected_version=_expected_version(payload),
        )
    )


@router.post("/invites/{invite_id}/cancel", response_model=SpotmeetingInviteView)
def cancel_spotmeeting_invite(
    invite_id: UUID,
    payload: InviteTransitionRequest | None = Body(default=None),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SpotmeetingInviteService = Depends(get_spotmeeting_invite_service),
) -> SpotmeetingInviteView:
    return _run_transition(
        lambda: service.cancel_invite(
            current_user.user_id,
            invite_id,
            expected_version=_expected_version(payload),
        )
    )


@router.post("/invites/{invite_id}/complete", response_model=SpotmeetingInviteView)
def complete_spotmeeting_invite(
    invite_id: UUID,
    payload: InviteTransitionRequest | None = Body(default=None),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SpotmeetingInviteService = Depends(get_spotmeeting_invite_service),
) -> SpotmeetingInviteView:
    return _run_transition(
        lambda: service.complete_invite(
            current_user.user_id,
            invite_id,
            expected_version=_expected_version(payload),
        )
    )


def _validate_create_payload(payload: dict[str, Any]) -> CreateSpotmeetingInviteRequest:
    forbidden = find_forbidden_fields(payload)
    if forbidden:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "forbidden_invite_field",
                "fields": [{"field": item.field, "path": item.path} for item in forbidden],
            },
        )
    try:
        return CreateSpotmeetingInviteRequest.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={"code": "invalid_invite_payload", "errors": exc.errors(include_input=False)},
        ) from exc


def _run_transition(action: Any) -> SpotmeetingInviteView:
    try:
        return action()
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


def _expected_version(payload: InviteTransitionRequest | None) -> int | None:
    return payload.expected_version if payload is not None else None


def _domain_http_error(error: SocialMeetDomainError) -> HTTPException:
    return HTTPException(
        status_code=_ERROR_STATUS.get(error.code, status.HTTP_400_BAD_REQUEST),
        detail={"code": error.code, "message": error.detail},
    )
