from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import ValidationError

from app.api.dependencies import get_current_user, get_social_meet_identity_service
from app.auth.supabase import AuthPrincipal
from app.domains.social_meet.models import (
    CurrentSocialMeetState,
    ProfileUpsertRequest,
    PublicSocialMeetProfile,
)
from app.domains.social_meet.privacy import find_forbidden_fields
from app.domains.social_meet.service import (
    SocialMeetDomainError,
    SocialMeetIdentityService,
)

router = APIRouter(prefix="/social-meet", tags=["Social Meet"])

_ERROR_STATUS = {
    "consent_required": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "profile_incomplete": status.HTTP_409_CONFLICT,
    "profile_not_found": status.HTTP_404_NOT_FOUND,
    "profile_preview_required": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "profile_unavailable": status.HTTP_409_CONFLICT,
    "social_meet_opt_in_required": status.HTTP_403_FORBIDDEN,
    "unsupported_consent_version": status.HTTP_422_UNPROCESSABLE_CONTENT,
}


@router.get("/me", response_model=CurrentSocialMeetState)
def get_social_meet_me(
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetIdentityService = Depends(get_social_meet_identity_service),
) -> CurrentSocialMeetState:
    return service.get_current_state(current_user.user_id)


@router.put("/profile", response_model=PublicSocialMeetProfile)
def put_social_meet_profile(
    payload: dict[str, Any] = Body(...),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetIdentityService = Depends(get_social_meet_identity_service),
) -> PublicSocialMeetProfile:
    forbidden = find_forbidden_fields(payload)
    if forbidden:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "forbidden_profile_field",
                "fields": [{"field": item.field, "path": item.path} for item in forbidden],
            },
        )

    try:
        profile = ProfileUpsertRequest.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_profile_payload",
                "errors": exc.errors(include_input=False),
            },
        ) from exc

    try:
        return service.upsert_profile(current_user.user_id, profile)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.get("/profiles/{profile_id}", response_model=PublicSocialMeetProfile)
def get_social_meet_public_profile(
    profile_id: UUID,
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetIdentityService = Depends(get_social_meet_identity_service),
) -> PublicSocialMeetProfile:
    try:
        return service.get_public_profile(current_user.user_id, profile_id)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.post("/profile/unpublish", response_model=CurrentSocialMeetState)
def unpublish_social_meet_profile(
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetIdentityService = Depends(get_social_meet_identity_service),
) -> CurrentSocialMeetState:
    try:
        return service.unpublish(current_user.user_id)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


def _domain_http_error(error: SocialMeetDomainError) -> HTTPException:
    return HTTPException(
        status_code=_ERROR_STATUS.get(error.code, status.HTTP_400_BAD_REQUEST),
        detail={"code": error.code, "message": error.detail},
    )
