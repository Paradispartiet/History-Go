from __future__ import annotations

import logging
from dataclasses import dataclass
from uuid import UUID

from app.domains.social_meet.models import ProfileVisibility, SocialMeetProfileRecord
from app.domains.social_meet.repository import SocialMeetIdentityRepository
from app.domains.social_meet.safety_models import (
    BlockCreateRequest,
    ReportCreateRequest,
    ReportReasonCode,
    SafetyContext,
    SocialMeetBlockRecord,
    SocialMeetBlockView,
    SocialMeetReportRecord,
    SubmittedReportView,
)
from app.domains.social_meet.safety_repository import SocialMeetSafetyRepository
from app.domains.social_meet.service import SUPPORTED_CONSENT_VERSION

logger = logging.getLogger(__name__)


@dataclass(frozen=True, slots=True)
class SocialMeetSafetyError(Exception):
    code: str
    detail: str

    def __str__(self) -> str:
        return self.detail


class SocialMeetSafetyService:
    def __init__(
        self,
        identity_repository: SocialMeetIdentityRepository,
        safety_repository: SocialMeetSafetyRepository,
    ) -> None:
        self._identity_repository = identity_repository
        self._safety_repository = safety_repository

    def list_blocks(self, auth_user_id: UUID) -> list[SocialMeetBlockView]:
        actor = self._require_safety_profile(auth_user_id)
        assert actor.profile_id is not None
        return [
            _safe_block(record)
            for record in self._safety_repository.list_active_blocks(actor.profile_id)
        ]

    def block_profile(
        self,
        auth_user_id: UUID,
        request: BlockCreateRequest,
        *,
        request_id: str | None = None,
    ) -> SocialMeetBlockView:
        actor, target = self._resolve_profiles(auth_user_id, request.blocked_profile_id)
        if target.profile_visibility is ProfileVisibility.DELETED:
            raise SocialMeetSafetyError(
                code="recipient_unavailable",
                detail="The requested Social Meet profile is not available",
            )
        self._validate_related_invite(actor, target, request.related_invite_id)

        assert actor.profile_id is not None
        block = self._safety_repository.upsert_block(actor.profile_id, request)
        self._write_audit_best_effort(
            actor_profile_id=actor.profile_id,
            target_profile_id=target.profile_id,
            action_type="block_profile",
            decision="applied",
            related_block_id=block.block_id,
            related_invite_id=request.related_invite_id,
            context_id=_context_id(request.related_context),
            request_id=request_id,
        )
        return _safe_block(block)

    def unblock_profile(
        self,
        auth_user_id: UUID,
        block_id: UUID,
        *,
        request_id: str | None = None,
    ) -> SocialMeetBlockView:
        actor = self._require_safety_profile(auth_user_id)
        assert actor.profile_id is not None
        block = self._safety_repository.remove_block(actor.profile_id, block_id)
        if block is None:
            raise SocialMeetSafetyError(
                code="unknown_block",
                detail="The requested block is not available",
            )
        self._write_audit_best_effort(
            actor_profile_id=actor.profile_id,
            target_profile_id=block.blocked_profile_id,
            action_type="unblock_profile",
            decision="removed",
            related_block_id=block.block_id,
            related_invite_id=block.related_invite_id,
            context_id=_record_context_id(block.related_context),
            request_id=request_id,
        )
        return _safe_block(block)

    def submit_report(
        self,
        auth_user_id: UUID,
        request: ReportCreateRequest,
        *,
        request_id: str | None = None,
    ) -> SubmittedReportView:
        actor, target = self._resolve_profiles(auth_user_id, request.reported_profile_id)
        self._validate_related_invite(actor, target, request.related_invite_id)

        assert actor.profile_id is not None
        report = self._safety_repository.create_report(actor.profile_id, request)
        try:
            self._safety_repository.enqueue_report(
                report,
                priority=_report_priority(report.reason_code),
            )
        except Exception:
            logger.exception(
                "Social Meet report %s is durable but moderation queue fan-out failed",
                report.report_id,
            )

        self._write_audit_best_effort(
            actor_profile_id=actor.profile_id,
            target_profile_id=target.profile_id,
            action_type="submit_report",
            decision="submitted",
            related_report_id=report.report_id,
            related_invite_id=request.related_invite_id,
            context_id=_context_id(request.related_context),
            reason_code=request.reason_code.value,
            request_id=request_id,
        )
        return _safe_report(report)

    def list_submitted_reports(self, auth_user_id: UUID) -> list[SubmittedReportView]:
        actor = self._require_safety_profile(auth_user_id)
        assert actor.profile_id is not None
        return [
            _safe_report(record)
            for record in self._safety_repository.list_submitted_reports(actor.profile_id)
        ]

    def get_submitted_report(
        self,
        auth_user_id: UUID,
        report_id: UUID,
    ) -> SubmittedReportView:
        actor = self._require_safety_profile(auth_user_id)
        assert actor.profile_id is not None
        report = self._safety_repository.get_submitted_report(actor.profile_id, report_id)
        if report is None:
            raise SocialMeetSafetyError(
                code="unknown_report",
                detail="The requested report is not available",
            )
        return _safe_report(report)

    def ensure_interaction_allowed(
        self,
        auth_user_id: UUID,
        target_profile_id: UUID,
    ) -> SocialMeetProfileRecord:
        actor = self._identity_repository.get_or_create_for_user(auth_user_id)
        if (
            actor.profile_id is None
            or actor.consent_version != SUPPORTED_CONSENT_VERSION
            or actor.profile_visibility is not ProfileVisibility.DISCOVERABLE
        ):
            raise SocialMeetSafetyError(
                code="profile_not_published",
                detail="A current discoverable Social Meet profile is required",
            )

        target = self._identity_repository.get_profile_by_public_id(target_profile_id)
        if (
            target is None
            or target.profile_visibility is not ProfileVisibility.DISCOVERABLE
            or target.consent_version != SUPPORTED_CONSENT_VERSION
        ):
            raise SocialMeetSafetyError(
                code="recipient_unavailable",
                detail="The requested Social Meet recipient is not available",
            )
        if actor.profile_id == target_profile_id:
            raise SocialMeetSafetyError(
                code="invalid_safety_target",
                detail="A Social Meet interaction requires another profile",
            )
        if self._safety_repository.interaction_is_blocked(actor.profile_id, target_profile_id):
            raise SocialMeetSafetyError(
                code="interaction_blocked",
                detail="This Social Meet interaction is not available",
            )
        return target

    def _require_safety_profile(self, auth_user_id: UUID) -> SocialMeetProfileRecord:
        actor = self._identity_repository.get_or_create_for_user(auth_user_id)
        if actor.profile_id is None:
            raise SocialMeetSafetyError(
                code="profile_not_published",
                detail="A Social Meet public profile id is required for safety controls",
            )
        if actor.profile_visibility is ProfileVisibility.DELETED:
            raise SocialMeetSafetyError(
                code="profile_unavailable",
                detail="The Social Meet profile is not available",
            )
        return actor

    def _resolve_profiles(
        self,
        auth_user_id: UUID,
        target_profile_id: UUID,
    ) -> tuple[SocialMeetProfileRecord, SocialMeetProfileRecord]:
        actor = self._require_safety_profile(auth_user_id)
        assert actor.profile_id is not None
        if actor.profile_id == target_profile_id:
            raise SocialMeetSafetyError(
                code="invalid_safety_target",
                detail="A profile cannot block or report itself",
            )

        target = self._identity_repository.get_profile_by_public_id(target_profile_id)
        if target is None or target.profile_id is None:
            raise SocialMeetSafetyError(
                code="recipient_unavailable",
                detail="The requested Social Meet profile is not available",
            )
        return actor, target

    def _validate_related_invite(
        self,
        actor: SocialMeetProfileRecord,
        target: SocialMeetProfileRecord,
        related_invite_id: UUID | None,
    ) -> None:
        if related_invite_id is None:
            return
        if not self._safety_repository.invite_links_users(
            related_invite_id,
            actor.auth_user_id,
            target.auth_user_id,
        ):
            raise SocialMeetSafetyError(
                code="unknown_invite",
                detail="The related invite is not available",
            )

    def _write_audit_best_effort(
        self,
        *,
        actor_profile_id: UUID,
        target_profile_id: UUID | None,
        action_type: str,
        decision: str,
        related_block_id: UUID | None = None,
        related_report_id: UUID | None = None,
        related_invite_id: UUID | None = None,
        context_id: str | None = None,
        reason_code: str | None = None,
        request_id: str | None = None,
    ) -> None:
        if target_profile_id is None:
            return
        try:
            self._safety_repository.write_audit(
                actor_profile_id=actor_profile_id,
                target_profile_id=target_profile_id,
                action_type=action_type,
                decision=decision,
                related_block_id=related_block_id,
                related_report_id=related_report_id,
                related_invite_id=related_invite_id,
                context_id=context_id,
                reason_code=reason_code,
                request_id=request_id,
            )
        except Exception:
            logger.exception("Social Meet safety audit write failed for %s", action_type)


def _safe_block(record: SocialMeetBlockRecord) -> SocialMeetBlockView:
    context = (
        SafetyContext.model_validate(record.related_context)
        if record.related_context is not None
        else None
    )
    return SocialMeetBlockView(
        block_id=record.block_id,
        blocked_profile_id=record.blocked_profile_id,
        scope=record.scope,
        related_invite_id=record.related_invite_id,
        related_context=context,
        status=record.status,
        created_at=record.created_at,
        updated_at=record.updated_at,
        removed_at=record.removed_at,
    )


def _safe_report(record: SocialMeetReportRecord) -> SubmittedReportView:
    return SubmittedReportView(
        report_id=record.report_id,
        reported_profile_id=record.reported_profile_id,
        reason_code=record.reason_code,
        structured_details=list(record.structured_details),
        status=record.status,
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


def _report_priority(reason_code: ReportReasonCode) -> str:
    if reason_code is ReportReasonCode.MINOR_SAFETY:
        return "urgent"
    if reason_code in {ReportReasonCode.HARASSMENT, ReportReasonCode.UNSAFE_BEHAVIOR}:
        return "high"
    return "normal"


def _context_id(context: SafetyContext | None) -> str | None:
    return context.context_id if context is not None else None


def _record_context_id(context: dict[str, object] | None) -> str | None:
    if context is None:
        return None
    raw = context.get("contextId") or context.get("context_id")
    return str(raw) if raw else None
