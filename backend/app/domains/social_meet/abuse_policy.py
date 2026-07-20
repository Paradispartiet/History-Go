from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta


@dataclass(frozen=True, slots=True)
class SocialMeetAbusePolicy:
    version: str = "social_meet_abuse_v1"

    report_per_minute: int = 3
    report_per_hour: int = 10
    report_per_day: int = 25
    report_same_target_per_day: int = 3

    invite_per_minute: int = 3
    invite_per_hour: int = 12
    invite_per_day: int = 30
    invite_same_pair_per_hour: int = 2
    invite_same_pair_per_day: int = 5
    recipient_inbound_per_hour: int = 20
    recipient_inbound_per_day: int = 50

    rejected_attempts_per_15_minutes: int = 12
    repeated_cancellations_window: timedelta = timedelta(days=7)
    repeated_cancellations_threshold: int = 3

    report_cooldown: timedelta = timedelta(days=30)
    block_removed_cooldown: timedelta = timedelta(days=7)
    invite_declined_cooldown: timedelta = timedelta(hours=24)
    repeated_cancellation_cooldown: timedelta = timedelta(hours=72)
    moderation_warning_cooldown: timedelta = timedelta(days=7)


DEFAULT_SOCIAL_MEET_ABUSE_POLICY = SocialMeetAbusePolicy()
