from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from app.auth.supabase import AuthPrincipal
from app.core.config import Settings
from app.domains.social_meet.operations_models import (
    RETENTION_POLICY_VERSION,
    ApplyRetentionRequest,
    CreateRetentionHoldRequest,
    RetentionHoldView,
    RetentionPolicyView,
    RetentionPreview,
    RetentionRunResult,
    SocialMeetOperationalMetrics,
)
from app.domains.social_meet.operations_repository import (
    PostgresSocialMeetOperationsRepository,
)
from app.domains.social_meet.service import SocialMeetDomainError


class SocialMeetOperationsService:
    def __init__(
        self,
        settings: Settings,
        repository: PostgresSocialMeetOperationsRepository,
    ) -> None:
        self._settings = settings
        self._repository = repository

    def retention_policy(self) -> RetentionPolicyView:
        return RetentionPolicyView(
            terminal_invite_days=self._settings.social_meet_retention_terminal_invite_days,
            removed_block_days=self._settings.social_meet_retention_removed_block_days,
            closed_report_days=self._settings.social_meet_retention_closed_report_days,
            closed_moderation_days=self._settings.social_meet_retention_closed_moderation_days,
            inactive_restriction_days=(
                self._settings.social_meet_retention_inactive_restriction_days
            ),
            closed_appeal_days=self._settings.social_meet_retention_closed_appeal_days,
            safety_audit_days=self._settings.social_meet_retention_safety_audit_days,
            released_hold_days=self._settings.social_meet_retention_released_hold_days,
        )

    def preview_retention(self, *, now: datetime | None = None) -> RetentionPreview:
        checked_at = now or datetime.now(UTC)
        policy = self.retention_policy()
        return RetentionPreview(
            generated_at=checked_at,
            policy_version=RETENTION_POLICY_VERSION,
            policy=policy,
            candidate_counts=self._repository.preview_retention(policy, now=checked_at),
            active_holds=self._repository.active_hold_count(now=checked_at),
        )

    def apply_retention(
        self,
        admin: AuthPrincipal,
        request: ApplyRetentionRequest,
        *,
        now: datetime | None = None,
    ) -> RetentionRunResult:
        if request.confirm_policy_version != RETENTION_POLICY_VERSION:
            raise SocialMeetDomainError(
                code="retention_policy_confirmation_required",
                detail="The current Social Meet retention policy version must be confirmed",
            )
        if not self._settings.social_meet_retention_apply_allowed():
            raise SocialMeetDomainError(
                code="backend_not_enabled",
                detail="Social Meet retention apply is disabled",
            )
        checked_at = now or datetime.now(UTC)
        return self._repository.apply_retention(
            self.retention_policy(),
            policy_version=RETENTION_POLICY_VERSION,
            admin_user_id=admin.user_id,
            now=checked_at,
        )

    def create_retention_hold(
        self,
        admin: AuthPrincipal,
        request: CreateRetentionHoldRequest,
        *,
        now: datetime | None = None,
    ) -> RetentionHoldView:
        checked_at = now or datetime.now(UTC)
        if request.hold_until is not None and request.hold_until <= checked_at:
            raise SocialMeetDomainError(
                code="invalid_retention_hold",
                detail="A timed retention hold must expire in the future",
            )
        if not self._repository.entity_exists(request.entity_type, request.entity_id):
            raise SocialMeetDomainError(
                code="retention_entity_not_found",
                detail="The requested retention entity is not available",
            )
        return self._repository.create_hold(admin.user_id, request, now=checked_at)

    def list_retention_holds(
        self,
        *,
        include_released: bool,
        limit: int,
    ) -> list[RetentionHoldView]:
        return self._repository.list_holds(
            include_released=include_released,
            limit=limit,
        )

    def release_retention_hold(
        self,
        admin: AuthPrincipal,
        hold_id: UUID,
        *,
        now: datetime | None = None,
    ) -> RetentionHoldView:
        hold = self._repository.release_hold(
            admin.user_id,
            hold_id,
            now=now or datetime.now(UTC),
        )
        if hold is None:
            raise SocialMeetDomainError(
                code="retention_hold_not_found",
                detail="The requested retention hold is not available",
            )
        return hold

    def operational_metrics(
        self,
        *,
        now: datetime | None = None,
    ) -> SocialMeetOperationalMetrics:
        checked_at = now or datetime.now(UTC)
        return self._repository.operational_metrics(
            self.retention_policy(),
            now=checked_at,
        )
