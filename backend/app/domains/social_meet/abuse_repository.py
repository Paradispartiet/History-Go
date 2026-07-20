from __future__ import annotations

from datetime import datetime
from typing import Protocol, cast
from uuid import UUID

from sqlalchemy import text

from app.core.database import Database
from app.domains.social_meet.abuse_models import (
    BLOCK_COOLDOWN,
    CANCELLATION_LOOKBACK,
    DAY_LOOKBACK,
    DECLINE_COOLDOWN,
    HOUR_LOOKBACK,
    MINUTE_LOOKBACK,
    REPORT_COOLDOWN,
    InviteAbuseSnapshot,
)


class SocialMeetAbuseRepository(Protocol):
    def get_invite_creation_snapshot(
        self,
        *,
        sender_auth_user_id: UUID,
        sender_profile_id: UUID,
        recipient_auth_user_id: UUID,
        recipient_profile_id: UUID,
        context_type: str,
        context_id: str,
        now: datetime,
    ) -> InviteAbuseSnapshot | None: ...


class PostgresSocialMeetAbuseRepository:
    """Read canonical Social Meet state required for abuse-policy decisions."""

    def __init__(self, database: Database) -> None:
        self._database = database

    def get_invite_creation_snapshot(
        self,
        *,
        sender_auth_user_id: UUID,
        sender_profile_id: UUID,
        recipient_auth_user_id: UUID,
        recipient_profile_id: UUID,
        context_type: str,
        context_id: str,
        now: datetime,
    ) -> InviteAbuseSnapshot | None:
        params: dict[str, object] = {
            "sender_auth_user_id": sender_auth_user_id,
            "sender_profile_id": sender_profile_id,
            "recipient_auth_user_id": recipient_auth_user_id,
            "recipient_profile_id": recipient_profile_id,
            "context_type": context_type,
            "context_id": context_id,
            "minute_start": now - MINUTE_LOOKBACK,
            "hour_start": now - HOUR_LOOKBACK,
            "day_start": now - DAY_LOOKBACK,
            "decline_start": now - DECLINE_COOLDOWN,
            "report_start": now - REPORT_COOLDOWN,
            "block_start": now - BLOCK_COOLDOWN,
            "cancellation_start": now - CANCELLATION_LOOKBACK,
        }

        with self._database.engine.connect() as connection:
            row = (
                connection.execute(
                    text(
                        """
                        select
                          coalesce(sender.consented_at, sender.created_at)
                            as sender_social_meet_started_at,
                          (
                            select count(*)
                            from public.hg_spotmeeting_invites i
                            where i.created_by = :sender_auth_user_id
                              and i.created_at >= :minute_start
                          ) as sender_minute_count,
                          (
                            select count(*)
                            from public.hg_spotmeeting_invites i
                            where i.created_by = :sender_auth_user_id
                              and i.created_at >= :hour_start
                          ) as sender_hour_count,
                          (
                            select count(*)
                            from public.hg_spotmeeting_invites i
                            where i.created_by = :sender_auth_user_id
                              and i.created_at >= :day_start
                          ) as sender_day_count,
                          (
                            select count(*)
                            from public.hg_spotmeeting_invites i
                            where i.created_by = :sender_auth_user_id
                              and i.target_user_id = :recipient_auth_user_id
                              and i.created_at >= :day_start
                          ) as pair_day_count,
                          (
                            select count(*)
                            from public.hg_spotmeeting_invites i
                            where i.target_user_id = :recipient_auth_user_id
                              and i.created_at >= :day_start
                          ) as recipient_day_count,
                          (
                            select count(*)
                            from public.hg_spotmeeting_invites i
                            where i.created_by = :sender_auth_user_id
                              and i.target_user_id = :recipient_auth_user_id
                              and i.status = 'cancelled'
                              and i.updated_at >= :cancellation_start
                          ) as cancellation_day_count,
                          exists (
                            select 1
                            from public.hg_spotmeeting_invites i
                            where i.created_by = :sender_auth_user_id
                              and i.target_user_id = :recipient_auth_user_id
                              and i.context_type = :context_type
                              and i.context_id = :context_id
                              and i.status in ('pending', 'accepted')
                          ) as duplicate_active_invite,
                          (
                            select max(i.updated_at)
                            from public.hg_spotmeeting_invites i
                            where i.created_by = :sender_auth_user_id
                              and i.target_user_id = :recipient_auth_user_id
                              and i.status = 'declined'
                              and i.updated_at >= :decline_start
                          ) as last_declined_at,
                          (
                            select max(r.created_at)
                            from public.hg_social_meet_reports r
                            where r.reporter_profile_id = :recipient_profile_id
                              and r.reported_profile_id = :sender_profile_id
                              and r.created_at >= :report_start
                          ) as last_recipient_report_at,
                          (
                            select max(coalesce(b.removed_at, b.updated_at, b.created_at))
                            from public.hg_social_meet_blocks b
                            where (
                              (
                                b.blocker_profile_id = :sender_profile_id
                                and b.blocked_profile_id = :recipient_profile_id
                              )
                              or (
                                b.blocker_profile_id = :recipient_profile_id
                                and b.blocked_profile_id = :sender_profile_id
                              )
                            )
                              and coalesce(b.removed_at, b.updated_at, b.created_at) >= :block_start
                          ) as last_pair_block_at,
                          (
                            select count(*)
                            from public.hg_social_meet_reports r
                            where r.reported_profile_id = :sender_profile_id
                              and r.status in ('submitted', 'queued', 'under_review')
                          ) as unresolved_reports_against_sender
                        from public.hg_profiles sender
                        where sender.profile_id = :sender_profile_id
                          and sender.user_id = :sender_auth_user_id
                          and sender.deleted_at is null
                        """
                    ),
                    params,
                )
                .mappings()
                .one_or_none()
            )

        if row is None:
            return None

        return InviteAbuseSnapshot(
            sender_social_meet_started_at=cast(datetime, row["sender_social_meet_started_at"]),
            sender_minute_count=int(row["sender_minute_count"]),
            sender_hour_count=int(row["sender_hour_count"]),
            sender_day_count=int(row["sender_day_count"]),
            pair_day_count=int(row["pair_day_count"]),
            recipient_day_count=int(row["recipient_day_count"]),
            cancellation_day_count=int(row["cancellation_day_count"]),
            duplicate_active_invite=bool(row["duplicate_active_invite"]),
            last_declined_at=cast(datetime | None, row["last_declined_at"]),
            last_recipient_report_at=cast(datetime | None, row["last_recipient_report_at"]),
            last_pair_block_at=cast(datetime | None, row["last_pair_block_at"]),
            unresolved_reports_against_sender=int(row["unresolved_reports_against_sender"]),
        )
