from __future__ import annotations

import logging
from datetime import UTC, datetime, timedelta
from uuid import UUID

from app.domains.social_meet.abuse_models import (
    AbuseActionType,
    CooldownReason,
    EnforcementDecision,
    InviteCreationContext,
)
from app.domains.social_meet.abuse_policy import (
    DEFAULT_SOCIAL_MEET_ABUSE_POLICY,
    SocialMeetAbusePolicy,
)
from app.domains.social_meet.abuse_repository import PostgresSocialMeetAbuseRepository
from app.domains.social_meet.repository import SocialMeetIdentityRepository
from app.domains.social_meet.service import SocialMeetDomainError

logger = logging.getLogger(__name__)


class SocialMeetAbuseService:
    def __init__(
        self,
        identity_repository: SocialMeetIdentityRepository,
        abuse_repository: PostgresSocialMeetAbuseRepository,
        policy: SocialMeetAbusePolicy = DEFAULT_SOCIAL_MEET_ABUSE_POLICY,
    ) -> None:
        self._identity_repository = identity_repository
        self._abuse_repository = abuse_repository
        self._policy = policy

    @property
    def policy(self) -> SocialMeetAbusePolicy:
        return self._policy

    def ensure_report_submission_allowed(
        self,
        reporter_profile_id: UUID,
        reported_profile_id: UUID,
        *,
        now: datetime | None = None,
    ) -> None:
        checked_at = now or datetime.now(UTC)

        if self._too_many_rejected_attempts(reporter_profile_id, checked_at):
            self._reject(
                reporter_profile_id,
                action_type=AbuseActionType.REPORT_CREATE,
                decision=EnforcementDecision.REPEATED_INVALID_ATTEMPTS,
                target_profile_id=reported_profile_id,
            )

        windows = (
            (timedelta(minutes=1), self._policy.report_per_minute),
            (timedelta(hours=1), self._policy.report_per_hour),
            (timedelta(days=1), self._policy.report_per_day),
        )
        for window, limit in windows:
            if (
                self._abuse_repository.count_reports(
                    reporter_profile_id,
                    since=checked_at - window,
                )
                >= limit
            ):
                self._reject(
                    reporter_profile_id,
                    action_type=AbuseActionType.REPORT_CREATE,
                    decision=EnforcementDecision.RATE_LIMITED,
                    target_profile_id=reported_profile_id,
                )

        if (
            self._abuse_repository.count_reports(
                reporter_profile_id,
                reported_profile_id=reported_profile_id,
                since=checked_at - timedelta(days=1),
            )
            >= self._policy.report_same_target_per_day
        ):
            self._reject(
                reporter_profile_id,
                action_type=AbuseActionType.REPORT_CREATE,
                decision=EnforcementDecision.PAIR_PRESSURE,
                target_profile_id=reported_profile_id,
            )

    def ensure_invite_creation_allowed(
        self,
        sender_auth_user_id: UUID,
        recipient_profile_id: UUID,
        context: InviteCreationContext,
        *,
        now: datetime | None = None,
    ) -> None:
        checked_at = now or datetime.now(UTC)
        sender = self._identity_repository.get_or_create_for_user(sender_auth_user_id)
        if sender.profile_id is None:
            raise SocialMeetDomainError(
                code="profile_not_published",
                detail="A Social Meet public profile is required before sending invites",
            )

        recipient = self._identity_repository.get_profile_by_public_id(recipient_profile_id)
        if recipient is None or recipient.profile_id is None:
            raise SocialMeetDomainError(
                code="recipient_unavailable",
                detail="The requested Social Meet recipient is not available",
            )

        sender_profile_id = sender.profile_id
        active_cooldown = self._abuse_repository.get_active_cooldown(
            sender_profile_id,
            recipient_profile_id,
            now=checked_at,
        )
        if active_cooldown is not None:
            self._reject(
                sender_profile_id,
                action_type=AbuseActionType.INVITE_CREATE,
                decision=EnforcementDecision.COOLDOWN_ACTIVE,
                target_profile_id=recipient_profile_id,
                context=context,
            )

        # A recent report by the recipient against this sender is itself the
        # canonical source for a directional post-report contact cooldown.
        if (
            self._abuse_repository.count_reports(
                recipient_profile_id,
                reported_profile_id=sender_profile_id,
                since=checked_at - self._policy.report_cooldown,
            )
            > 0
        ):
            self._reject(
                sender_profile_id,
                action_type=AbuseActionType.INVITE_CREATE,
                decision=EnforcementDecision.COOLDOWN_ACTIVE,
                target_profile_id=recipient_profile_id,
                context=context,
            )

        if self._abuse_repository.has_active_duplicate_invite(
            sender.auth_user_id,
            recipient.auth_user_id,
            context,
        ):
            self._reject(
                sender_profile_id,
                action_type=AbuseActionType.INVITE_CREATE,
                decision=EnforcementDecision.DUPLICATE_ACTIVE_INVITE,
                target_profile_id=recipient_profile_id,
                context=context,
                public_code="duplicate_active_invite",
            )

        if self._too_many_rejected_attempts(sender_profile_id, checked_at):
            self._reject(
                sender_profile_id,
                action_type=AbuseActionType.INVITE_CREATE,
                decision=EnforcementDecision.REPEATED_INVALID_ATTEMPTS,
                target_profile_id=recipient_profile_id,
                context=context,
            )

        sender_windows = (
            (timedelta(minutes=1), self._policy.invite_per_minute),
            (timedelta(hours=1), self._policy.invite_per_hour),
            (timedelta(days=1), self._policy.invite_per_day),
        )
        for window, limit in sender_windows:
            if (
                self._abuse_repository.count_invites_created(
                    sender.auth_user_id,
                    since=checked_at - window,
                )
                >= limit
            ):
                self._reject(
                    sender_profile_id,
                    action_type=AbuseActionType.INVITE_CREATE,
                    decision=EnforcementDecision.RATE_LIMITED,
                    target_profile_id=recipient_profile_id,
                    context=context,
                )

        pair_windows = (
            (timedelta(hours=1), self._policy.invite_same_pair_per_hour),
            (timedelta(days=1), self._policy.invite_same_pair_per_day),
        )
        for window, limit in pair_windows:
            if (
                self._abuse_repository.count_pair_invites(
                    sender.auth_user_id,
                    recipient.auth_user_id,
                    since=checked_at - window,
                )
                >= limit
            ):
                self._reject(
                    sender_profile_id,
                    action_type=AbuseActionType.INVITE_CREATE,
                    decision=EnforcementDecision.PAIR_PRESSURE,
                    target_profile_id=recipient_profile_id,
                    context=context,
                )

        recipient_windows = (
            (timedelta(hours=1), self._policy.recipient_inbound_per_hour),
            (timedelta(days=1), self._policy.recipient_inbound_per_day),
        )
        for window, limit in recipient_windows:
            if (
                self._abuse_repository.count_inbound_invites(
                    recipient.auth_user_id,
                    since=checked_at - window,
                )
                >= limit
            ):
                self._reject(
                    sender_profile_id,
                    action_type=AbuseActionType.INVITE_CREATE,
                    decision=EnforcementDecision.RECIPIENT_PRESSURE,
                    target_profile_id=recipient_profile_id,
                    context=context,
                    public_code="recipient_unavailable",
                )

        cancelled_count = self._abuse_repository.count_pair_cancellations(
            sender.auth_user_id,
            recipient.auth_user_id,
            since=checked_at - self._policy.repeated_cancellations_window,
        )
        if cancelled_count >= self._policy.repeated_cancellations_threshold:
            self._abuse_repository.upsert_cooldown(
                sender_profile_id,
                recipient_profile_id,
                reason_code=CooldownReason.REPEATED_CANCELLATION,
                starts_at=checked_at,
                expires_at=checked_at + self._policy.repeated_cancellation_cooldown,
            )
            self._reject(
                sender_profile_id,
                action_type=AbuseActionType.INVITE_CREATE,
                decision=EnforcementDecision.COOLDOWN_ACTIVE,
                target_profile_id=recipient_profile_id,
                context=context,
            )

    def record_block_removed_cooldown(
        self,
        blocker_profile_id: UUID,
        formerly_blocked_profile_id: UUID,
        *,
        block_id: UUID,
        now: datetime | None = None,
    ) -> None:
        starts_at = now or datetime.now(UTC)
        self._abuse_repository.upsert_cooldown(
            formerly_blocked_profile_id,
            blocker_profile_id,
            reason_code=CooldownReason.BLOCK_REMOVED,
            starts_at=starts_at,
            expires_at=starts_at + self._policy.block_removed_cooldown,
            source_block_id=block_id,
        )

    def record_invite_declined_cooldown(
        self,
        sender_profile_id: UUID,
        recipient_profile_id: UUID,
        *,
        invite_id: UUID,
        now: datetime | None = None,
    ) -> None:
        starts_at = now or datetime.now(UTC)
        self._abuse_repository.upsert_cooldown(
            sender_profile_id,
            recipient_profile_id,
            reason_code=CooldownReason.INVITE_DECLINED,
            starts_at=starts_at,
            expires_at=starts_at + self._policy.invite_declined_cooldown,
            source_invite_id=invite_id,
        )

    def record_invalid_attempt(
        self,
        actor_profile_id: UUID,
        *,
        target_profile_id: UUID | None = None,
        context: InviteCreationContext | None = None,
    ) -> None:
        self._abuse_repository.record_enforcement(
            actor_profile_id,
            action_type=AbuseActionType.INVALID_ATTEMPT,
            decision_code=EnforcementDecision.REPEATED_INVALID_ATTEMPTS,
            target_profile_id=target_profile_id,
            context=context,
        )

    def _too_many_rejected_attempts(self, actor_profile_id: UUID, now: datetime) -> bool:
        return (
            self._abuse_repository.count_recent_enforcement_events(
                actor_profile_id,
                since=now - timedelta(minutes=15),
            )
            >= self._policy.rejected_attempts_per_15_minutes
        )

    def _reject(
        self,
        actor_profile_id: UUID,
        *,
        action_type: AbuseActionType,
        decision: EnforcementDecision,
        target_profile_id: UUID | None = None,
        context: InviteCreationContext | None = None,
        public_code: str = "rate_limited",
    ) -> None:
        self._abuse_repository.record_enforcement(
            actor_profile_id,
            action_type=action_type,
            decision_code=decision,
            target_profile_id=target_profile_id,
            context=context,
        )
        raise SocialMeetDomainError(
            code=public_code,
            detail="The Social Meet action is temporarily unavailable",
        )
