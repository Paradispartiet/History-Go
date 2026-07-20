from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import (
    get_current_admin,
    get_current_moderator,
    get_current_user,
    get_social_meet_moderation_service,
)
from app.auth.supabase import AuthPrincipal
from app.domains.social_meet.moderation_models import (
    AppealView,
    CreateAppealRequest,
    DecideAppealRequest,
    ModerationQueueItem,
    ModerationQueueState,
    QueueActionRequest,
    ResolveReportRequest,
    RestrictionView,
    SuspendProfileRequest,
)
from app.domains.social_meet.moderation_service import SocialMeetModerationService
from app.domains.social_meet.service import SocialMeetDomainError

router = APIRouter(prefix="/social-meet", tags=["Social Meet Moderation"])

_ERROR_STATUS = {
    "active_restriction_not_found": status.HTTP_404_NOT_FOUND,
    "appeal_not_found": status.HTTP_404_NOT_FOUND,
    "moderation_action_conflict": status.HTTP_409_CONFLICT,
    "moderation_queue_item_not_found": status.HTTP_404_NOT_FOUND,
    "moderation_reason_required": status.HTTP_422_UNPROCESSABLE_CONTENT,
    "moderation_report_not_found": status.HTTP_404_NOT_FOUND,
    "moderation_subject_unavailable": status.HTTP_404_NOT_FOUND,
    "profile_not_published": status.HTTP_409_CONFLICT,
    "restriction_not_found": status.HTTP_404_NOT_FOUND,
}


@router.get("/moderation/queue", response_model=list[ModerationQueueItem])
def list_moderation_queue(
    state: ModerationQueueState | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    moderator: AuthPrincipal = Depends(get_current_moderator),
    service: SocialMeetModerationService = Depends(get_social_meet_moderation_service),
) -> list[ModerationQueueItem]:
    del moderator
    return service.list_queue(state=state, limit=limit)


@router.get("/moderation/queue/{queue_item_id}", response_model=ModerationQueueItem)
def get_moderation_queue_item(
    queue_item_id: UUID,
    moderator: AuthPrincipal = Depends(get_current_moderator),
    service: SocialMeetModerationService = Depends(get_social_meet_moderation_service),
) -> ModerationQueueItem:
    del moderator
    try:
        return service.get_queue_item(queue_item_id)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.post("/moderation/queue/{queue_item_id}/actions", response_model=ModerationQueueItem)
def act_on_moderation_queue_item(
    queue_item_id: UUID,
    payload: QueueActionRequest,
    moderator: AuthPrincipal = Depends(get_current_moderator),
    service: SocialMeetModerationService = Depends(get_social_meet_moderation_service),
) -> ModerationQueueItem:
    try:
        return service.act_on_queue_item(moderator, queue_item_id, payload.action)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.post("/moderation/reports/{report_id}/resolve", response_model=ModerationQueueItem)
def resolve_moderation_report(
    report_id: UUID,
    payload: ResolveReportRequest,
    moderator: AuthPrincipal = Depends(get_current_moderator),
    service: SocialMeetModerationService = Depends(get_social_meet_moderation_service),
) -> ModerationQueueItem:
    try:
        return service.resolve_report(
            moderator,
            report_id,
            resolution_code=payload.resolution_code,
            reason_code=payload.reason_code,
        )
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.post("/moderation/profiles/{profile_id}/suspend", response_model=RestrictionView)
def suspend_social_meet_profile(
    profile_id: UUID,
    payload: SuspendProfileRequest,
    moderator: AuthPrincipal = Depends(get_current_moderator),
    service: SocialMeetModerationService = Depends(get_social_meet_moderation_service),
) -> RestrictionView:
    try:
        return service.suspend_profile(
            moderator,
            profile_id,
            reason_code=payload.reason_code,
            source_report_id=payload.source_report_id,
        )
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.post("/moderation/profiles/{profile_id}/restore", response_model=RestrictionView)
def restore_social_meet_profile(
    profile_id: UUID,
    admin: AuthPrincipal = Depends(get_current_admin),
    service: SocialMeetModerationService = Depends(get_social_meet_moderation_service),
) -> RestrictionView:
    try:
        return service.restore_profile(admin, profile_id)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.get("/appeals", response_model=list[AppealView])
def list_social_meet_appeals(
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetModerationService = Depends(get_social_meet_moderation_service),
) -> list[AppealView]:
    try:
        return service.list_appeals(current_user.user_id)
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.post("/appeals", response_model=AppealView, status_code=status.HTTP_201_CREATED)
def create_social_meet_appeal(
    payload: CreateAppealRequest,
    current_user: AuthPrincipal = Depends(get_current_user),
    service: SocialMeetModerationService = Depends(get_social_meet_moderation_service),
) -> AppealView:
    try:
        return service.create_appeal(
            current_user.user_id,
            restriction_id=payload.restriction_id,
            reason_code=payload.reason_code,
        )
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


@router.post("/appeals/{appeal_id}/decision", response_model=AppealView)
def decide_social_meet_appeal(
    appeal_id: UUID,
    payload: DecideAppealRequest,
    admin: AuthPrincipal = Depends(get_current_admin),
    service: SocialMeetModerationService = Depends(get_social_meet_moderation_service),
) -> AppealView:
    try:
        return service.decide_appeal(
            admin,
            appeal_id,
            decision=payload.decision,
            reason_code=payload.reason_code,
        )
    except SocialMeetDomainError as exc:
        raise _domain_http_error(exc) from exc


def _domain_http_error(error: SocialMeetDomainError) -> HTTPException:
    return HTTPException(
        status_code=_ERROR_STATUS.get(error.code, status.HTTP_400_BAD_REQUEST),
        detail={"code": error.code, "message": error.detail},
    )
