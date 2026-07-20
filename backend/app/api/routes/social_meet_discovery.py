from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException, status
from pydantic import ValidationError

from app.api.dependencies import (
    get_current_user,
    get_social_meet_candidate_discovery_service,
)
from app.auth.supabase import AuthPrincipal
from app.domains.social_meet.discovery_models import ContextCandidateRequest, ContextCandidateResponse
from app.domains.social_meet.discovery_service import SocialMeetCandidateDiscoveryService
from app.domains.social_meet.privacy import find_forbidden_fields
from app.domains.social_meet.service import SocialMeetDomainError

router = APIRouter(prefix="/social-meet/spotmeeting/discovery", tags=["Social Meet Discovery"])

_ERROR_STATUS = {
    "backend_not_enabled": status.HTTP_503_SERVICE_UNAVAILABLE,
    "profile_not_published": status.HTTP_409_CONFLICT,
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
