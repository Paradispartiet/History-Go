from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from uuid import UUID


class CooldownReason(StrEnum):
    REPORT_SUBMITTED = "report_submitted"
    BLOCK_REMOVED = "block_removed"
    INVITE_DECLINED = "invite_declined"
    REPEATED_CANCELLATION = "repeated_cancellation"
    MODERATION_WARNING = "moderation_warning"


class AbuseActionType(StrEnum):
    REPORT_CREATE = "report_create"
    INVITE_CREATE = "invite_create"
    CANDIDATE_REQUEST = "candidate_request"
    INVALID_ATTEMPT = "invalid_attempt"


class EnforcementDecision(StrEnum):
    RATE_LIMITED = "rate_limited"
    COOLDOWN_ACTIVE = "cooldown_active"
    DUPLICATE_ACTIVE_INVITE = "duplicate_active_invite"
    RECIPIENT_PRESSURE = "recipient_pressure"
    PAIR_PRESSURE = "pair_pressure"
    REPEATED_INVALID_ATTEMPTS = "repeated_invalid_attempts"


@dataclass(frozen=True, slots=True)
class SocialMeetCooldownRecord:
    cooldown_id: UUID
    actor_profile_id: UUID
    target_profile_id: UUID
    reason_code: CooldownReason
    starts_at: datetime
    expires_at: datetime


@dataclass(frozen=True, slots=True)
class InviteCreationContext:
    context_type: str
    context_id: str
