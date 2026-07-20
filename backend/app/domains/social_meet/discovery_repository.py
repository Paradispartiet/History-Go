from __future__ import annotations

import json
from datetime import datetime
from typing import cast
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import RowMapping

from app.core.database import Database
from app.domains.social_meet.abuse_models import BLOCK_COOLDOWN, DECLINE_COOLDOWN, REPORT_COOLDOWN
from app.domains.social_meet.discovery_models import DiscoveryFeatureGate, DiscoveryProfileRecord


class PostgresSocialMeetDiscoveryRepository:
    """Read privacy-safe candidate state from existing Social Meet tables only."""

    def __init__(self, database: Database) -> None:
        self._database = database

    def get_feature_gate(self) -> DiscoveryFeatureGate:
        with self._database.engine.connect() as connection:
            row = (
                connection.execute(
                    text(
                        """
                        select enabled, rollout_percent, allowed_profile_ids
                        from public.hg_social_meet_feature_flags
                        where feature_key = 'spotmeeting_discovery'
                        """
                    )
                )
                .mappings()
                .one_or_none()
            )
        if row is None:
            return DiscoveryFeatureGate(False, 0, frozenset())
        return DiscoveryFeatureGate(
            enabled=bool(row["enabled"]),
            rollout_percent=int(row["rollout_percent"]),
            allowed_profile_ids=frozenset(
                cast(list[UUID] | tuple[UUID, ...], row.get("allowed_profile_ids") or ())
            ),
        )

    def list_candidate_profiles(
        self,
        *,
        requester_profile_id: UUID,
        supported_consent_version: str,
        now: datetime,
        pool_limit: int,
    ) -> list[DiscoveryProfileRecord]:
        params: dict[str, object] = {
            "requester_profile_id": requester_profile_id,
            "consent_version": supported_consent_version,
            "block_start": now - BLOCK_COOLDOWN,
            "report_start": now - REPORT_COOLDOWN,
            "decline_start": now - DECLINE_COOLDOWN,
            "pool_limit": pool_limit,
        }
        with self._database.engine.connect() as connection:
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
                          candidate.interest_places,
                          candidate.learning_goals,
                          candidate.knowledge_fingerprint_summary,
                          candidate.updated_at
                        from public.hg_profiles candidate
                        where candidate.profile_id is not null
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
                            and report.created_at >= :report_start
                          )
                          and not exists (
                            select 1
                            from public.hg_spotmeeting_invites invite
                            join public.hg_profiles sender on sender.user_id = invite.created_by
                            join public.hg_profiles recipient on recipient.user_id = invite.target_user_id
                            where (
                              (
                                sender.profile_id = :requester_profile_id
                                and recipient.profile_id = candidate.profile_id
                              )
                              or (
                                sender.profile_id = candidate.profile_id
                                and recipient.profile_id = :requester_profile_id
                              )
                            )
                            and invite.status in ('pending', 'accepted')
                          )
                          and not exists (
                            select 1
                            from public.hg_spotmeeting_invites invite
                            join public.hg_profiles sender on sender.user_id = invite.created_by
                            join public.hg_profiles recipient on recipient.user_id = invite.target_user_id
                            where (
                              (
                                sender.profile_id = :requester_profile_id
                                and recipient.profile_id = candidate.profile_id
                              )
                              or (
                                sender.profile_id = candidate.profile_id
                                and recipient.profile_id = :requester_profile_id
                              )
                            )
                            and invite.status = 'declined'
                            and invite.updated_at >= :decline_start
                          )
                        order by candidate.profile_id
                        limit :pool_limit
                        """
                    ),
                    params,
                )
                .mappings()
                .all()
            )
        return [_map_discovery_profile(row) for row in rows]


def _map_discovery_profile(row: RowMapping) -> DiscoveryProfileRecord:
    raw_fingerprint = row.get("knowledge_fingerprint_summary") or {}
    fingerprint = json.loads(raw_fingerprint) if isinstance(raw_fingerprint, str) else raw_fingerprint
    return DiscoveryProfileRecord(
        profile_id=cast(UUID, row["profile_id"]),
        display_name=str(row["display_name"]),
        avatar_ref=_optional_string(row.get("avatar_url")),
        short_bio=_optional_string(row.get("short_bio")),
        preferred_themes=_string_tuple(row.get("preferred_themes")),
        favorite_eras=_string_tuple(row.get("favorite_eras")),
        interest_places=_string_tuple(row.get("interest_places")),
        learning_goals=_string_tuple(row.get("learning_goals")),
        knowledge_fingerprint_summary=cast(dict[str, object], fingerprint),
        updated_at=cast(datetime, row["updated_at"]),
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
