from __future__ import annotations

from datetime import UTC, datetime
from typing import Protocol
from uuid import UUID

from app.domains.social_meet.abuse_models import (
    NEW_PROFILE_WINDOW,
    REPEATED_CANCELLATION_THRESHOLD,
    RESTRICTED_INVITE_POLICY,
    STANDARD_INVITE_POLICY,
    InviteAbusePolicyTier,
    InviteAbuseSnapshot,
    InviteCreationAllowance,
    InviteRatePolicy,
)
from app.domains.social_meet.abuse_repository import SocialMeetAbuseRepository
from app.domains.social_meet.models import ProfileVisibility, SocialMeetProfileRecord
from app.domains.social_meet.repository import SocialMeetIdentityRepository
from app.domains.social_meet.service import SUPPORTED_CONSENT_VERSION, SocialMeetDomainError

_ALLOWED_CONTEXT_TYPES = frozenset({"place", "quiz", "route", "observation", "topic", "circle"})


class SocialMeetInteractionGuard(Protocol):
    def ensure_interaction_allowed(self, first_profile_id: UUID, second_profile_id: UUID) -> None: ...


class SocialMeetInviteAbuseService:
    """Preflight abuse policy for future server-owned Spotmeeting invite creation.

    The next invite persistence slice must call this guard immediately before its
    authoritative insert and re-check inside the same creation transaction. Until
    that integration exists, production invite delivery remains disabled.
    """

    def __init__(
        self,
        identity_repository: SocialMeetIdentityRepository,
        abuse_repository: SocialMeetAbuseRepository,
        interaction_guard: SocialMeetInteractionGuard,
    ) -> None:
        self._identity_repository = identity_repository
        self._abuse_repository = abuse_repository
        self._interaction_guard = interaction_guard

    def ensure_invite_creation_allowed(
        self,
        sender_auth_user_id: UUID,
        recipient_profile_id: UUID,
        *,
        context_type: str,
        context_id: str,
        now: datetime | None = None,
    ) -> InviteCreationAllowance:
        checked_at = now or datetime.now(UTC)
        normalized_context_type = context_type.strip().lower()
        normalized_context_id = context_id.strip()
        if (
            normalized_context_type not in _ALLOWED_CONTEXT_TYPES
            or not normalized_context_id
            or len(normalized_context_id) > 180
        ):
            raise SocialMeetDomainError(
                code="invalid_invite_context",
                detail="The supplied Spotmeeting context is not supported",
            )

        sender = self._identity_repository.get_or_create_for_user(sender_auth_user_id)
        sender_profile_id = _require_published_sender(sender)
        recipient = self._identity_repository.get_profile_by_public_id(recipient_profile_id)
        if not _is_invite_eligible_profile(recipient):
            raise _recipient_unavailable()
        assert recipient is not None
        assert recipient.profile_id is not None

        if sender_profile_id == recipient.profile_id:
            raise SocialMeetDomainError(
                code="invalid_invite_target",
                detail="A Social Meet profile cannot invite itself",
            )

        self._interaction_guard.ensure_interaction_allowed(sender_profile_id, recipient.profile_id)
        snapshot = self._abuse_repository.get_invite_creation_snapshot(
            sender_auth_user_id=sender.auth_user_id,
            sender_profile_id=sender_profile_id,
            recipient_auth_user_id=recipient.auth_user_id,
            recipient_profile_id=recipient.profile_id,
            context_type=normalized_context_type,
            context_id=normalized_context_id,
            now=checked_at,
        )
        if snapshot is None:
            raise SocialMeetDomainError(
                code="profile_not_published",
                detail="A published Social Meet profile is required to create invitations",
            )

        if snapshot.duplicate_active_invite:
            raise SocialMeetDomainError(
                code="duplicate_active_invite",
                detail="An active Spotmeeting invite already exists for this context",
            )

        # Reports are intentionally non-enumerating: the sender must not learn that
        # the recipient submitted a report against them.
        if snapshot.last_recipient_report_at is not None:
            raise _recipient_unavailable()

        if (
            snapshot.last_declined_at is not None
            or snapshot.cancellation_day_count >= REPEATED_CANCELLATION_THRESHOLD
        ):
            raise _rate_limited()

        policy_tier, policy = _policy_for_snapshot(snapshot, checked_at)
        if _exceeds_policy(snapshot, policy):
            raise _rate_limited()

        return InviteCreationAllowance(policy_tier=policy_tier, checked_at=checked_at)


def _require_published_sender(record: SocialMeetProfileRecord) -> UUID:
    if not _is_invite_eligible_profile(record) or record.profile_id is None:
        raise SocialMeetDomainError(
            code="profile_not_published",
            detail="A current discoverable Social Meet profile is required to create invitations",
        )
    return record.profile_id


def _is_invite_eligible_profile(record: SocialMeetProfileRecord | None) -> bool:
    return bool(
        record is not None
        and record.profile_id is not None
        and record.profile_visibility is ProfileVisibility.DISCOVERABLE
        and record.consent_version == SUPPORTED_CONSENT_VERSION
    )


def _policy_for_snapshot(
    snapshot: InviteAbuseSnapshot,
    checked_at: datetime,
) -> tuple[InviteAbusePolicyTier, InviteRatePolicy]:
    is_new_profile = checked_at - snapshot.sender_social_meet_started_at < NEW_PROFILE_WINDOW
    is_under_review = snapshot.unresolved_reports_against_sender > 0
    if is_new_profile or is_under_review:
        return InviteAbusePolicyTier.RESTRICTED, RESTRICTED_INVITE_POLICY
    return InviteAbusePolicyTier.STANDARD, STANDARD_INVITE_POLICY


def _exceeds_policy(snapshot: InviteAbuseSnapshot, policy: InviteRatePolicy) -> bool:
    return any(
        (
            snapshot.sender_minute_count >= policy.sender_per_minute,
            snapshot.sender_hour_count >= policy.sender_per_hour,
            snapshot.sender_day_count >= policy.sender_per_day,
            snapshot.pair_day_count >= policy.pair_per_day,
            snapshot.recipient_day_count >= policy.recipient_per_day,
        )
    )


def _rate_limited() -> SocialMeetDomainError:
    return SocialMeetDomainError(
        code="rate_limited",
        detail="The Spotmeeting invite cannot be created at this time",
    )


def _recipient_unavailable() -> SocialMeetDomainError:
    return SocialMeetDomainError(
        code="recipient_unavailable",
        detail="The requested Social Meet recipient is unavailable",
    )
