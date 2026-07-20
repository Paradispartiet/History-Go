from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import StrEnum


class InviteAbusePolicyTier(StrEnum):
    STANDARD = "standard"
    RESTRICTED = "restricted"


@dataclass(frozen=True, slots=True)
class InviteRatePolicy:
    sender_per_minute: int
    sender_per_hour: int
    sender_per_day: int
    pair_per_day: int
    recipient_per_day: int


STANDARD_INVITE_POLICY = InviteRatePolicy(
    sender_per_minute=3,
    sender_per_hour=15,
    sender_per_day=40,
    pair_per_day=5,
    recipient_per_day=80,
)

RESTRICTED_INVITE_POLICY = InviteRatePolicy(
    sender_per_minute=1,
    sender_per_hour=5,
    sender_per_day=12,
    pair_per_day=2,
    recipient_per_day=50,
)

NEW_PROFILE_WINDOW = timedelta(days=7)
DECLINE_COOLDOWN = timedelta(hours=24)
REPORT_COOLDOWN = timedelta(days=7)
CANCELLATION_LOOKBACK = timedelta(hours=24)
REPEATED_CANCELLATION_THRESHOLD = 3


@dataclass(frozen=True, slots=True)
class InviteAbuseSnapshot:
    sender_profile_created_at: datetime
    sender_minute_count: int
    sender_hour_count: int
    sender_day_count: int
    pair_day_count: int
    recipient_day_count: int
    cancellation_day_count: int
    duplicate_active_invite: bool
    last_declined_at: datetime | None
    last_recipient_report_at: datetime | None
    unresolved_reports_against_sender: int


@dataclass(frozen=True, slots=True)
class InviteCreationAllowance:
    policy_tier: InviteAbusePolicyTier
    checked_at: datetime
