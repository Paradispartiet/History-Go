from __future__ import annotations

import logging
from uuid import UUID

from app.auth.authorization import HISTORY_GO_ADMIN_ROLE
from app.auth.supabase import AuthPrincipal
from app.domains.social_meet.moderation_models import (
    AppealDecision,
    AppealDecisionReasonCode,
    AppealReasonCode,
    AppealView,
    ModerationQueueAction,
    ModerationQueueItem,
    ModerationQueueState,
    ModerationResolutionCode,
    RestrictionReasonCode,
    RestrictionView,
)
from app.domains.social_meet.moderation_repository import PostgresSocialMeetModerationRepository
from app.domains.social_meet.repository import SocialMeetIdentityRepository
from app.domains.social_meet.service import SocialMeetDomainError

logger = logging.getLogger(__name__)


class SocialMeetModerationService:
    def __init__(
        self,
        identity_repository: SocialMeetIdentityRepository,
        moderation_repository: PostgresSocialMeetModerationRepository,
    ) -> None:
        self._identity_repository = identity_repository
        self._moderation_repository = moderation_repository

    def list_queue(
        self,
        *,
        state: ModerationQueueState | None,
        limit: int,
    ) -> list[ModerationQueueItem]:
        return self._moderation_repository.list_queue(state=state, limit=limit)

    def get_queue_item(self, queue_item_id: UUID) -> ModerationQueueItem:
        item = self._moderation_repository.get_queue_item(queue_item_id)
        if item is None:
            raise _not_found("moderation_queue_item_not_found")
        return item

    def act_on_queue_item(
        self,
        principal: AuthPrincipal,
        queue_item_id: UUID,
        action: ModerationQueueAction,
    ) -> ModerationQueueItem:
        if action is ModerationQueueAction.CLAIM:
            item = self._moderation_repository.claim_queue_item(queue_item_id, principal.user_id)
        elif action is ModerationQueueAction.RELEASE:
            item = self._moderation_repository.release_queue_item(queue_item_id, principal.user_id)
        else:
            item = self._moderation_repository.escalate_queue_item(queue_item_id)

        if item is None:
            raise SocialMeetDomainError(
                code="moderation_action_conflict",
                detail="The moderation queue item cannot accept that action",
            )
        self._audit_best_effort(
            principal,
            target_profile_id=item.subject_profile_id,
            action_type=f"queue_{action.value}",
            decision=item.state.value,
            report_id=item.report_id,
            queue_item_id=item.queue_item_id,
        )
        return item

    def resolve_report(
        self,
        principal: AuthPrincipal,
        report_id: UUID,
        *,
        resolution_code: ModerationResolutionCode,
        reason_code: RestrictionReasonCode | None,
    ) -> ModerationQueueItem:
        if (
            resolution_code is ModerationResolutionCode.PROFILE_SUSPENDED
            and reason_code is None
        ):
            raise SocialMeetDomainError(
                code="moderation_reason_required",
                detail="A suspension resolution requires a structured reason code",
            )

        item = self._moderation_repository.resolve_report(
            report_id,
            resolution_code=resolution_code,
            staff_user_id=principal.user_id,
        )
        if item is None:
            raise _not_found("moderation_report_not_found")

        restriction: RestrictionView | None = None
        if resolution_code is ModerationResolutionCode.PROFILE_SUSPENDED:
            assert reason_code is not None
            restriction = self._moderation_repository.suspend_profile(
                item.subject_profile_id,
                reason_code=reason_code,
                source_report_id=item.report_id,
                staff_user_id=principal.user_id,
            )
            if restriction is None:
                raise SocialMeetDomainError(
                    code="moderation_subject_unavailable",
                    detail="The moderation subject is not available for suspension",
                )

        self._audit_best_effort(
            principal,
            target_profile_id=item.subject_profile_id,
            action_type="resolve_report",
            decision=resolution_code.value,
            reason_code=reason_code.value if reason_code is not None else None,
            report_id=item.report_id,
            queue_item_id=item.queue_item_id,
            restriction_id=restriction.restriction_id if restriction is not None else None,
        )
        return item

    def suspend_profile(
        self,
        principal: AuthPrincipal,
        profile_id: UUID,
        *,
        reason_code: RestrictionReasonCode,
        source_report_id: UUID | None,
    ) -> RestrictionView:
        restriction = self._moderation_repository.suspend_profile(
            profile_id,
            reason_code=reason_code,
            source_report_id=source_report_id,
            staff_user_id=principal.user_id,
        )
        if restriction is None:
            raise _not_found("moderation_subject_unavailable")
        self._audit_best_effort(
            principal,
            target_profile_id=profile_id,
            action_type="suspend_profile",
            decision="suspended",
            reason_code=reason_code.value,
            report_id=source_report_id,
            restriction_id=restriction.restriction_id,
        )
        return restriction

    def restore_profile(self, principal: AuthPrincipal, profile_id: UUID) -> RestrictionView:
        restriction = self._moderation_repository.restore_profile(
            profile_id,
            staff_user_id=principal.user_id,
        )
        if restriction is None:
            raise _not_found("active_restriction_not_found")
        self._audit_best_effort(
            principal,
            target_profile_id=profile_id,
            action_type="restore_profile",
            decision="restored_to_paused",
            restriction_id=restriction.restriction_id,
        )
        return restriction

    def list_appeals(self, auth_user_id: UUID) -> list[AppealView]:
        profile_id = self._participant_profile_id(auth_user_id)
        return self._moderation_repository.list_appeals(profile_id)

    def create_appeal(
        self,
        auth_user_id: UUID,
        *,
        restriction_id: UUID,
        reason_code: AppealReasonCode,
    ) -> AppealView:
        profile_id = self._participant_profile_id(auth_user_id)
        appeal = self._moderation_repository.create_appeal(
            profile_id,
            restriction_id,
            reason_code,
        )
        if appeal is None:
            raise _not_found("restriction_not_found")
        return appeal

    def decide_appeal(
        self,
        principal: AuthPrincipal,
        appeal_id: UUID,
        *,
        decision: AppealDecision,
        reason_code: AppealDecisionReasonCode,
    ) -> AppealView:
        appeal = self._moderation_repository.decide_appeal(
            appeal_id,
            decision=decision,
            reason_code=reason_code,
            staff_user_id=principal.user_id,
        )
        if appeal is None:
            raise _not_found("appeal_not_found")
        self._audit_best_effort(
            principal,
            target_profile_id=None,
            action_type="decide_appeal",
            decision=decision.value,
            reason_code=reason_code.value,
            appeal_id=appeal.appeal_id,
            restriction_id=appeal.restriction_id,
        )
        return appeal

    def _participant_profile_id(self, auth_user_id: UUID) -> UUID:
        record = self._identity_repository.get_or_create_for_user(auth_user_id)
        if record.profile_id is None:
            raise SocialMeetDomainError(
                code="profile_not_published",
                detail="A Social Meet profile is required for moderation appeals",
            )
        return record.profile_id

    def _audit_best_effort(
        self,
        principal: AuthPrincipal,
        *,
        target_profile_id: UUID | None,
        action_type: str,
        decision: str,
        reason_code: str | None = None,
        report_id: UUID | None = None,
        queue_item_id: UUID | None = None,
        restriction_id: UUID | None = None,
        appeal_id: UUID | None = None,
    ) -> None:
        try:
            self._moderation_repository.write_audit(
                actor_type=(
                    "admin" if HISTORY_GO_ADMIN_ROLE in principal.app_roles else "moderator"
                ),
                staff_user_id=principal.user_id,
                target_profile_id=target_profile_id,
                action_type=action_type,
                decision=decision,
                reason_code=reason_code,
                report_id=report_id,
                queue_item_id=queue_item_id,
                restriction_id=restriction_id,
                appeal_id=appeal_id,
            )
        except Exception:
            logger.exception("Social Meet moderation audit write failed for %s", action_type)


def _not_found(code: str) -> SocialMeetDomainError:
    return SocialMeetDomainError(
        code=code,
        detail="The requested moderation record is not available",
    )
