from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import ValidationError

from app.api.dependencies import (
    get_current_user,
    get_social_meet_candidate_discovery_service,
)
from app.auth.supabase import AuthPrincipal
from app.domains.social_meet.discovery_models import (
    ContextCandidateRequest,
    ContextCandidateResponse,
)
from app.domains.social_meet.discovery_service import SocialMeetCandidateDiscoveryService
from app.domains.social_meet.models import PlaceStatusState, PlaceStatusUpdateRequest
from app.domains.social_meet.privacy import find_forbidden_fields
from app.domains.social_meet.service import SocialMeetDomainError

router = APIRouter(prefix="/social-meet/spotmeeting/discovery", tags=["Social Meet Discovery"])

_ERROR_STATUS = {
    "backend_not_enabled": status.HTTP_503_SERVICE_UNAVAILABLE,
    "profile_not_published": status.HTTP_409_CONFLICT,
    "invalid_place_status_context": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "place_status_preview_required": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "unsupported_place_status_consent_version": status.HTTP_422_UNPROCESSABLE_CONTENT,
}


@router.post("/context-candidates", response_model=ContextCandidateResponse)
def discover_context_candidates(
    payload: dict[str, Any] = Body(...),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetCandidateDiscoveryService = Depends(
        get_social_meet_candidate_discovery_service
    ),
) -> ContextCandidateResponse:
    request = _validate_discovery_payload(payload)
    try:
        return service.find_context_candidates(current_user.user_id, request)
    except SocialMeetDomainError as exc:
        raise HTTPException(
            status_code=_ERROR_STATUS.get(exc.code, status.HTTP_400_BAD_REQUEST),
            detail={"code": exc.code, "message": exc.detail},
        ) from exc


@router.put("/place-status", response_model=PlaceStatusState)
def put_place_status(
    payload: dict[str, Any] = Body(...),
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetCandidateDiscoveryService = Depends(
        get_social_meet_candidate_discovery_service
    ),
) -> PlaceStatusState:
    forbidden = find_forbidden_fields(payload)
    if forbidden:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "forbidden_place_status_field",
                "fields": [{"field": item.field, "path": item.path} for item in forbidden],
            },
        )
    try:
        request = PlaceStatusUpdateRequest.model_validate(payload)
        return service.set_place_status(current_user.user_id, request)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_place_status_payload",
                "errors": exc.errors(include_input=False),
            },
        ) from exc
    except SocialMeetDomainError as exc:
        raise HTTPException(
            status_code=_ERROR_STATUS.get(exc.code, status.HTTP_400_BAD_REQUEST),
            detail={"code": exc.code, "message": exc.detail},
        ) from exc


@router.delete("/place-status", response_model=PlaceStatusState)
def delete_place_status(
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetCandidateDiscoveryService = Depends(
        get_social_meet_candidate_discovery_service
    ),
) -> PlaceStatusState:
    return service.clear_place_status(current_user.user_id)


def _validate_discovery_payload(payload: dict[str, Any]) -> ContextCandidateRequest:
    forbidden = find_forbidden_fields(payload)
    if forbidden:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "forbidden_discovery_field",
                "fields": [{"field": item.field, "path": item.path} for item in forbidden],
            },
        )
    try:
        return ContextCandidateRequest.model_validate(payload)
    except ValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail={
                "code": "invalid_discovery_payload",
                "errors": exc.errors(include_input=False),
            },
        ) from exc
