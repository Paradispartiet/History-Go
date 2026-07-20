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

MINUTE_LOOKBACK = timedelta(minutes=1)
HOUR_LOOKBACK = timedelta(hours=1)
DAY_LOOKBACK = timedelta(hours=24)
NEW_PROFILE_WINDOW = timedelta(days=7)
DECLINE_COOLDOWN = timedelta(hours=24)
REPORT_COOLDOWN = timedelta(days=7)
BLOCK_COOLDOWN = timedelta(days=7)
CANCELLATION_LOOKBACK = timedelta(hours=24)
REPEATED_CANCELLATION_THRESHOLD = 3


@dataclass(frozen=True, slots=True)
class InviteAbuseSnapshot:
    sender_social_meet_started_at: datetime
    sender_minute_count: int
    sender_hour_count: int
    sender_day_count: int
    pair_day_count: int
    recipient_day_count: int
    cancellation_day_count: int
    duplicate_active_invite: bool
    last_declined_at: datetime | None
    last_recipient_report_at: datetime | None
    last_pair_block_at: datetime | None
    unresolved_reports_against_sender: int


@dataclass(frozen=True, slots=True)
class InviteAbuseEvaluation:
    policy_tier: InviteAbusePolicyTier
    failure_code: str | None


@dataclass(frozen=True, slots=True)
class InviteCreationAllowance:
    policy_tier: InviteAbusePolicyTier
    checked_at: datetime


def evaluate_invite_abuse_snapshot(
    snapshot: InviteAbuseSnapshot,
    checked_at: datetime,
) -> InviteAbuseEvaluation:
    policy_tier, policy = _policy_for_snapshot(snapshot, checked_at)

    if snapshot.duplicate_active_invite:
        return InviteAbuseEvaluation(policy_tier, "duplicate_active_invite")
    if snapshot.last_recipient_report_at is not None or snapshot.last_pair_block_at is not None:
        return InviteAbuseEvaluation(policy_tier, "recipient_unavailable")
    if (
        snapshot.last_declined_at is not None
        or snapshot.cancellation_day_count >= REPEATED_CANCELLATION_THRESHOLD
        or _exceeds_policy(snapshot, policy)
    ):
        return InviteAbuseEvaluation(policy_tier, "rate_limited")
    return InviteAbuseEvaluation(policy_tier, None)


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
