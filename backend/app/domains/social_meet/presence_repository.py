from __future__ import annotations

import json
from datetime import datetime
from typing import Protocol, cast
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import RowMapping

from app.core.database import Database
from app.domains.social_meet.abuse_models import BLOCK_COOLDOWN, REPORT_COOLDOWN
from app.domains.social_meet.presence_models import PlacePresenceProfileRecord


class SocialMeetPlacePresenceRepository(Protocol):
    def set_presence(
        self,
        profile_id: UUID,
        place_id: str,
        *,
        now: datetime,
        expires_at: datetime,
    ) -> None: ...

    def clear_presence(self, profile_id: UUID) -> None: ...

    def get_presence(
        self,
        profile_id: UUID,
        *,
        now: datetime,
    ) -> tuple[str, datetime] | None: ...

    def list_people(
        self,
        *,
        requester_profile_id: UUID,
        place_id: str,
        supported_consent_version: str,
        now: datetime,
        limit: int,
    ) -> list[PlacePresenceProfileRecord]: ...


class PostgresSocialMeetPlacePresenceRepository:
    """Ephemeral, server-owned manual Place presence.

    The table stores at most one current row per public profile. Expired rows are
    deleted opportunistically and are never exposed as visit history.
    """

    def __init__(self, database: Database) -> None:
        self._database = database

    def set_presence(
        self,
        profile_id: UUID,
        place_id: str,
        *,
        now: datetime,
        expires_at: datetime,
    ) -> None:
        with self._database.engine.begin() as connection:
            connection.execute(
                text(
                    """
                    delete from public.hg_social_meet_place_presence
                    where expires_at <= :now
                    """
                ),
                {"now": now},
            )
            connection.execute(
                text(
                    """
                    insert into public.hg_social_meet_place_presence (
                      profile_id,
                      place_id,
                      expires_at,
                      created_at,
                      updated_at
                    ) values (
                      :profile_id,
                      :place_id,
                      :expires_at,
                      :now,
                      :now
                    )
                    on conflict (profile_id)
                    do update set
                      place_id = excluded.place_id,
                      expires_at = excluded.expires_at,
                      updated_at = excluded.updated_at
                    """
                ),
                {
                    "profile_id": profile_id,
                    "place_id": place_id,
                    "expires_at": expires_at,
                    "now": now,
                },
            )

    def clear_presence(self, profile_id: UUID) -> None:
        with self._database.engine.begin() as connection:
            connection.execute(
                text(
                    """
                    delete from public.hg_social_meet_place_presence
                    where profile_id = :profile_id
                    """
                ),
                {"profile_id": profile_id},
            )

    def get_presence(
        self,
        profile_id: UUID,
        *,
        now: datetime,
    ) -> tuple[str, datetime] | None:
        with self._database.engine.begin() as connection:
            connection.execute(
                text(
                    """
                    delete from public.hg_social_meet_place_presence
                    where expires_at <= :now
                    """
                ),
                {"now": now},
            )
            row = (
                connection.execute(
                    text(
                        """
                        select place_id, expires_at
                        from public.hg_social_meet_place_presence
                        where profile_id = :profile_id
                          and expires_at > :now
                        """
                    ),
                    {"profile_id": profile_id, "now": now},
                )
                .mappings()
                .one_or_none()
            )
        if row is None:
            return None
        return str(row["place_id"]), cast(datetime, row["expires_at"])

    def list_people(
        self,
        *,
        requester_profile_id: UUID,
        place_id: str,
        supported_consent_version: str,
        now: datetime,
        limit: int,
    ) -> list[PlacePresenceProfileRecord]:
        params: dict[str, object] = {
            "requester_profile_id": requester_profile_id,
            "place_id": place_id,
            "consent_version": supported_consent_version,
            "now": now,
            "block_start": now - BLOCK_COOLDOWN,
            "report_start": now - REPORT_COOLDOWN,
            "limit": limit,
        }
        with self._database.engine.begin() as connection:
            connection.execute(
                text(
                    """
                    delete from public.hg_social_meet_place_presence
                    where expires_at <= :now
                    """
                ),
                {"now": now},
            )
            rows = (
                connection.execute(
                    text(
                        """
                        select
                          candidate.profile_id,
                          candidate.display_name,
                          candidate.avatar_url,
                          candidate.short_bio,
                          candidate.preferred_themes,
                          candidate.favorite_eras,
                          candidate.learning_goals,
                          candidate.knowledge_fingerprint_summary
                        from public.hg_social_meet_place_presence presence
                        join public.hg_profiles candidate
                          on candidate.profile_id = presence.profile_id
                        where presence.place_id = :place_id
                          and presence.expires_at > :now
                          and candidate.profile_id <> :requester_profile_id
                          and candidate.profile_visibility = 'discoverable'
                          and candidate.consent_version = :consent_version
                          and candidate.deleted_at is null
                          and candidate.display_name is not null
                          and not exists (
                            select 1
                            from public.hg_social_meet_profile_restrictions restriction
                            where restriction.profile_id = candidate.profile_id
                              and restriction.status = 'active'
                          )
                          and not exists (
                            select 1
                            from public.hg_social_meet_blocks block_record
                            where (
                              (
                                block_record.blocker_profile_id = :requester_profile_id
                                and block_record.blocked_profile_id = candidate.profile_id
                              )
                              or (
                                block_record.blocker_profile_id = candidate.profile_id
                                and block_record.blocked_profile_id = :requester_profile_id
                              )
                            )
                              and (
                                block_record.status = 'active'
                                or coalesce(
                                  block_record.removed_at,
                                  block_record.updated_at,
                                  block_record.created_at
                                ) >= :block_start
                              )
                          )
                          and not exists (
                            select 1
                            from public.hg_social_meet_reports report
                            where (
                              (
                                report.reporter_profile_id = :requester_profile_id
                                and report.reported_profile_id = candidate.profile_id
                              )
                              or (
                                report.reporter_profile_id = candidate.profile_id
                                and report.reported_profile_id = :requester_profile_id
                              )
                            )
                              and (
                                report.status in ('submitted', 'queued', 'under_review')
                                or report.created_at >= :report_start
                              )
                          )
                        order by candidate.profile_id asc
                        limit :limit
                        """
                    ),
                    params,
                )
                .mappings()
                .all()
            )
        return [_map_profile(row) for row in rows]


def _map_profile(row: RowMapping) -> PlacePresenceProfileRecord:
    raw_fingerprint = row.get("knowledge_fingerprint_summary") or {}
    fingerprint = (
        json.loads(raw_fingerprint) if isinstance(raw_fingerprint, str) else raw_fingerprint
    )
    return PlacePresenceProfileRecord(
        profile_id=cast(UUID, row["profile_id"]),
        display_name=str(row["display_name"]),
        avatar_ref=_optional_string(row.get("avatar_url")),
        short_bio=_optional_string(row.get("short_bio")),
        preferred_themes=_string_tuple(row.get("preferred_themes")),
        favorite_eras=_string_tuple(row.get("favorite_eras")),
        learning_goals=_string_tuple(row.get("learning_goals")),
        knowledge_fingerprint_summary=cast(dict[str, object], fingerprint),
    )


def _optional_string(value: object) -> str | None:
    if value is None:
        return None
    normalized = str(value).strip()
    return normalized or None


def _string_tuple(value: object) -> tuple[str, ...]:
    if not isinstance(value, list | tuple):
        return ()
    return tuple(str(item) for item in value if str(item).strip())
