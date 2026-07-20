from __future__ import annotations

from datetime import datetime
from typing import cast
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import RowMapping

from app.core.database import Database
from app.domains.social_meet.abuse_models import (
    AbuseActionType,
    CooldownReason,
    EnforcementDecision,
    InviteCreationContext,
    SocialMeetCooldownRecord,
)


class PostgresSocialMeetAbuseRepository:
    def __init__(self, database: Database) -> None:
        self._database = database

    def count_reports(
        self,
        reporter_profile_id: UUID,
        *,
        since: datetime,
        reported_profile_id: UUID | None = None,
    ) -> int:
        with self._database.engine.connect() as connection:
            count = connection.execute(
                text(
                    """
                    select count(*)
                    from public.hg_social_meet_reports
                    where reporter_profile_id = :reporter_profile_id
                      and created_at >= :since
                      and (
                        :reported_profile_id is null
                        or reported_profile_id = :reported_profile_id
                      )
                    """
                ),
                {
                    "reporter_profile_id": reporter_profile_id,
                    "reported_profile_id": reported_profile_id,
                    "since": since,
                },
            ).scalar_one()
        return int(count)

    def count_invites_created(self, auth_user_id: UUID, *, since: datetime) -> int:
        with self._database.engine.connect() as connection:
            count = connection.execute(
                text(
                    """
                    select count(*)
                    from public.hg_spotmeeting_invites
                    where created_by = :auth_user_id
                      and created_at >= :since
                    """
                ),
                {"auth_user_id": auth_user_id, "since": since},
            ).scalar_one()
        return int(count)

    def count_inbound_invites(self, auth_user_id: UUID, *, since: datetime) -> int:
        with self._database.engine.connect() as connection:
            count = connection.execute(
                text(
                    """
                    select count(*)
                    from public.hg_spotmeeting_invites
                    where target_user_id = :auth_user_id
                      and created_at >= :since
                    """
                ),
                {"auth_user_id": auth_user_id, "since": since},
            ).scalar_one()
        return int(count)

    def count_pair_invites(
        self,
        sender_auth_user_id: UUID,
        recipient_auth_user_id: UUID,
        *,
        since: datetime,
    ) -> int:
        with self._database.engine.connect() as connection:
            count = connection.execute(
                text(
                    """
                    select count(*)
                    from public.hg_spotmeeting_invites
                    where created_by = :sender_auth_user_id
                      and target_user_id = :recipient_auth_user_id
                      and created_at >= :since
                    """
                ),
                {
                    "sender_auth_user_id": sender_auth_user_id,
                    "recipient_auth_user_id": recipient_auth_user_id,
                    "since": since,
                },
            ).scalar_one()
        return int(count)

    def count_pair_cancellations(
        self,
        sender_auth_user_id: UUID,
        recipient_auth_user_id: UUID,
        *,
        since: datetime,
    ) -> int:
        with self._database.engine.connect() as connection:
            count = connection.execute(
                text(
                    """
                    select count(*)
                    from public.hg_spotmeeting_invites
                    where created_by = :sender_auth_user_id
                      and target_user_id = :recipient_auth_user_id
                      and status = 'cancelled'
                      and updated_at >= :since
                    """
                ),
                {
                    "sender_auth_user_id": sender_auth_user_id,
                    "recipient_auth_user_id": recipient_auth_user_id,
                    "since": since,
                },
            ).scalar_one()
        return int(count)

    def has_active_duplicate_invite(
        self,
        sender_auth_user_id: UUID,
        recipient_auth_user_id: UUID,
        context: InviteCreationContext,
    ) -> bool:
        with self._database.engine.connect() as connection:
            exists = connection.execute(
                text(
                    """
                    select exists (
                      select 1
                      from public.hg_spotmeeting_invites
                      where created_by = :sender_auth_user_id
                        and target_user_id = :recipient_auth_user_id
                        and context_type = :context_type
                        and context_id = :context_id
                        and status in ('pending', 'accepted')
                    )
                    """
                ),
                {
                    "sender_auth_user_id": sender_auth_user_id,
                    "recipient_auth_user_id": recipient_auth_user_id,
                    "context_type": context.context_type,
                    "context_id": context.context_id,
                },
            ).scalar_one()
        return bool(exists)

    def count_recent_enforcement_events(
        self,
        actor_profile_id: UUID,
        *,
        since: datetime,
    ) -> int:
        with self._database.engine.connect() as connection:
            count = connection.execute(
                text(
                    """
                    select count(*)
                    from public.hg_social_meet_abuse_enforcement_events
                    where actor_profile_id = :actor_profile_id
                      and created_at >= :since
                    """
                ),
                {"actor_profile_id": actor_profile_id, "since": since},
            ).scalar_one()
        return int(count)

    def get_active_cooldown(
        self,
        actor_profile_id: UUID,
        target_profile_id: UUID,
        *,
        now: datetime,
    ) -> SocialMeetCooldownRecord | None:
        with self._database.engine.connect() as connection:
            row = (
                connection.execute(
                    text(
                        """
                        select id, actor_profile_id, target_profile_id, reason_code,
                               starts_at, expires_at
                        from public.hg_social_meet_cooldowns
                        where actor_profile_id = :actor_profile_id
                          and target_profile_id = :target_profile_id
                          and status = 'active'
                          and expires_at > :now
                        order by expires_at desc
                        limit 1
                        """
                    ),
                    {
                        "actor_profile_id": actor_profile_id,
                        "target_profile_id": target_profile_id,
                        "now": now,
                    },
                )
                .mappings()
                .one_or_none()
            )
        return _map_cooldown(row) if row is not None else None

    def upsert_cooldown(
        self,
        actor_profile_id: UUID,
        target_profile_id: UUID,
        *,
        reason_code: CooldownReason,
        starts_at: datetime,
        expires_at: datetime,
        source_report_id: UUID | None = None,
        source_block_id: UUID | None = None,
        source_invite_id: UUID | None = None,
    ) -> SocialMeetCooldownRecord:
        with self._database.engine.begin() as connection:
            row = (
                connection.execute(
                    text(
                        """
                        insert into public.hg_social_meet_cooldowns (
                          actor_profile_id,
                          target_profile_id,
                          reason_code,
                          source_report_id,
                          source_block_id,
                          source_invite_id,
                          starts_at,
                          expires_at
                        )
                        values (
                          :actor_profile_id,
                          :target_profile_id,
                          :reason_code,
                          :source_report_id,
                          :source_block_id,
                          :source_invite_id,
                          :starts_at,
                          :expires_at
                        )
                        on conflict (actor_profile_id, target_profile_id, reason_code)
                          where status = 'active'
                        do update set
                          starts_at = least(
                            public.hg_social_meet_cooldowns.starts_at,
                            excluded.starts_at
                          ),
                          expires_at = greatest(
                            public.hg_social_meet_cooldowns.expires_at,
                            excluded.expires_at
                          ),
                          source_report_id = coalesce(
                            excluded.source_report_id,
                            public.hg_social_meet_cooldowns.source_report_id
                          ),
                          source_block_id = coalesce(
                            excluded.source_block_id,
                            public.hg_social_meet_cooldowns.source_block_id
                          ),
                          source_invite_id = coalesce(
                            excluded.source_invite_id,
                            public.hg_social_meet_cooldowns.source_invite_id
                          ),
                          updated_at = now()
                        returning id, actor_profile_id, target_profile_id, reason_code,
                                  starts_at, expires_at
                        """
                    ),
                    {
                        "actor_profile_id": actor_profile_id,
                        "target_profile_id": target_profile_id,
                        "reason_code": reason_code.value,
                        "source_report_id": source_report_id,
                        "source_block_id": source_block_id,
                        "source_invite_id": source_invite_id,
                        "starts_at": starts_at,
                        "expires_at": expires_at,
                    },
                )
                .mappings()
                .one()
            )
        return _map_cooldown(row)

    def record_enforcement(
        self,
        actor_profile_id: UUID,
        *,
        action_type: AbuseActionType,
        decision_code: EnforcementDecision,
        target_profile_id: UUID | None = None,
        context: InviteCreationContext | None = None,
        related_report_id: UUID | None = None,
        related_invite_id: UUID | None = None,
    ) -> None:
        with self._database.engine.begin() as connection:
            connection.execute(
                text(
                    """
                    insert into public.hg_social_meet_abuse_enforcement_events (
                      actor_profile_id,
                      target_profile_id,
                      action_type,
                      decision_code,
                      context_type,
                      context_id,
                      related_report_id,
                      related_invite_id
                    )
                    values (
                      :actor_profile_id,
                      :target_profile_id,
                      :action_type,
                      :decision_code,
                      :context_type,
                      :context_id,
                      :related_report_id,
                      :related_invite_id
                    )
                    """
                ),
                {
                    "actor_profile_id": actor_profile_id,
                    "target_profile_id": target_profile_id,
                    "action_type": action_type.value,
                    "decision_code": decision_code.value,
                    "context_type": context.context_type if context is not None else None,
                    "context_id": context.context_id if context is not None else None,
                    "related_report_id": related_report_id,
                    "related_invite_id": related_invite_id,
                },
            )


def _map_cooldown(row: RowMapping) -> SocialMeetCooldownRecord:
    return SocialMeetCooldownRecord(
        cooldown_id=cast(UUID, row["id"]),
        actor_profile_id=cast(UUID, row["actor_profile_id"]),
        target_profile_id=cast(UUID, row["target_profile_id"]),
        reason_code=CooldownReason(str(row["reason_code"])),
        starts_at=cast(datetime, row["starts_at"]),
        expires_at=cast(datetime, row["expires_at"]),
    )
