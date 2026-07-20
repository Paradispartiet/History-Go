from __future__ import annotations

import json
from datetime import datetime
from typing import cast
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import RowMapping

from app.core.database import Database
from app.domains.social_meet.abuse_models import BLOCK_COOLDOWN, DECLINE_COOLDOWN, REPORT_COOLDOWN
from app.domains.social_meet.discovery_models import (
    DiscoveryContextSignals,
    DiscoveryFeatureGate,
    DiscoveryMatchReason,
    DiscoveryProfileRecord,
    RankedDiscoveryCandidate,
)


class PostgresSocialMeetDiscoveryRepository:
    """Read and rank privacy-safe candidate state from canonical Social Meet tables."""

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

    def rank_context_candidates(
        self,
        *,
        requester_profile_id: UUID,
        context: DiscoveryContextSignals,
        supported_consent_version: str,
        now: datetime,
        limit: int,
    ) -> list[RankedDiscoveryCandidate]:
        params: dict[str, object] = {
            "requester_profile_id": requester_profile_id,
            "context_id": context.context_id,
            "theme_tags": context.theme_tags,
            "era_tags": context.era_tags,
            "topic_tags": context.topic_tags,
            "route_category_tags": context.route_category_tags,
            "quiz_topic_tags": context.quiz_topic_tags,
            "learning_goal_tags": context.learning_goal_tags,
            "consent_version": supported_consent_version,
            "block_start": now - BLOCK_COOLDOWN,
            "report_start": now - REPORT_COOLDOWN,
            "decline_start": now - DECLINE_COOLDOWN,
            "limit": limit,
        }
        with self._database.engine.connect() as connection:
            rows = (
                connection.execute(
                    text(
                        """
                        with requester as (
                          select
                            profile_id,
                            preferred_themes,
                            favorite_eras,
                            learning_goals
                          from public.hg_profiles
                          where profile_id = :requester_profile_id
                            and profile_visibility = 'discoverable'
                            and consent_version = :consent_version
                            and deleted_at is null
                            and not exists (
                              select 1
                              from public.hg_social_meet_profile_restrictions restriction
                              where restriction.profile_id = :requester_profile_id
                                and restriction.status = 'active'
                            )
                        ),
                        compatible as (
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
                            candidate.updated_at,
                            (:context_id = any(candidate.interest_places))
                              as context_interest_place,
                            (
                              candidate.preferred_themes && cast(:theme_tags as text[])
                              or coalesce(
                                candidate.knowledge_fingerprint_summary -> 'theme_tags',
                                candidate.knowledge_fingerprint_summary -> 'themeTags',
                                '[]'::jsonb
                              ) ?| cast(:theme_tags as text[])
                            ) as context_theme,
                            (
                              candidate.favorite_eras && cast(:era_tags as text[])
                              or coalesce(
                                candidate.knowledge_fingerprint_summary -> 'era_tags',
                                candidate.knowledge_fingerprint_summary -> 'eraTags',
                                '[]'::jsonb
                              ) ?| cast(:era_tags as text[])
                            ) as context_era,
                            coalesce(
                              candidate.knowledge_fingerprint_summary -> 'topic_tags',
                              candidate.knowledge_fingerprint_summary -> 'topicTags',
                              '[]'::jsonb
                            ) ?| cast(:topic_tags as text[]) as context_topic,
                            coalesce(
                              candidate.knowledge_fingerprint_summary -> 'route_category_tags',
                              candidate.knowledge_fingerprint_summary -> 'routeCategoryTags',
                              '[]'::jsonb
                            ) ?| cast(:route_category_tags as text[])
                              as context_route_category,
                            coalesce(
                              candidate.knowledge_fingerprint_summary -> 'quiz_topic_tags',
                              candidate.knowledge_fingerprint_summary -> 'quizTopicTags',
                              '[]'::jsonb
                            ) ?| cast(:quiz_topic_tags as text[])
                              as context_quiz_topic,
                            (
                              candidate.learning_goals && cast(:learning_goal_tags as text[])
                              or coalesce(
                                candidate.knowledge_fingerprint_summary -> 'learning_goal_tags',
                                candidate.knowledge_fingerprint_summary -> 'learningGoalTags',
                                '[]'::jsonb
                              ) ?| cast(:learning_goal_tags as text[])
                            ) as context_learning_goal,
                            candidate.preferred_themes && requester.preferred_themes
                              as shared_theme,
                            candidate.favorite_eras && requester.favorite_eras
                              as shared_era,
                            candidate.learning_goals && requester.learning_goals
                              as shared_learning_goal
                          from public.hg_profiles candidate
                          cross join requester
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
                                and (
                                  report.status in ('submitted', 'queued', 'under_review')
                                  or report.created_at >= :report_start
                                )
                            )
                            and not exists (
                              select 1
                              from public.hg_spotmeeting_invites invite
                              join public.hg_profiles sender
                                on sender.user_id = invite.created_by
                              join public.hg_profiles recipient
                                on recipient.user_id = invite.target_user_id
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
                                and (
                                  invite.status in ('pending', 'accepted')
                                  or (
                                    invite.status = 'declined'
                                    and invite.updated_at >= :decline_start
                                  )
                                )
                            )
                        ),
                        scored as (
                          select
                            *,
                            (
                              case when context_interest_place then 12 else 0 end
                              + case when context_theme then 6 else 0 end
                              + case when context_era then 5 else 0 end
                              + case when context_topic then 7 else 0 end
                              + case when context_route_category then 7 else 0 end
                              + case when context_quiz_topic then 7 else 0 end
                              + case when context_learning_goal then 5 else 0 end
                              + case when shared_theme then 3 else 0 end
                              + case when shared_era then 3 else 0 end
                              + case when shared_learning_goal then 4 else 0 end
                            ) as compatibility_score
                          from compatible
                        )
                        select *
                        from scored
                        where compatibility_score > 0
                        order by compatibility_score desc, profile_id asc
                        limit :limit
                        """
                    ),
                    params,
                )
                .mappings()
                .all()
            )
        return [_map_ranked_candidate(row) for row in rows]


def _map_ranked_candidate(row: RowMapping) -> RankedDiscoveryCandidate:
    reasons: list[DiscoveryMatchReason] = []
    reason_columns = (
        ("context_interest_place", DiscoveryMatchReason.CONTEXT_INTEREST_PLACE),
        ("context_theme", DiscoveryMatchReason.CONTEXT_THEME),
        ("context_era", DiscoveryMatchReason.CONTEXT_ERA),
        ("context_topic", DiscoveryMatchReason.CONTEXT_TOPIC),
        ("context_route_category", DiscoveryMatchReason.CONTEXT_ROUTE_CATEGORY),
        ("context_quiz_topic", DiscoveryMatchReason.CONTEXT_QUIZ_TOPIC),
        ("context_learning_goal", DiscoveryMatchReason.CONTEXT_LEARNING_GOAL),
        ("shared_theme", DiscoveryMatchReason.SHARED_THEME),
        ("shared_era", DiscoveryMatchReason.SHARED_ERA),
        ("shared_learning_goal", DiscoveryMatchReason.SHARED_LEARNING_GOAL),
    )
    for column, reason in reason_columns:
        if bool(row[column]):
            reasons.append(reason)

    raw_fingerprint = row.get("knowledge_fingerprint_summary") or {}
    fingerprint = (
        json.loads(raw_fingerprint) if isinstance(raw_fingerprint, str) else raw_fingerprint
    )
    return RankedDiscoveryCandidate(
        profile=DiscoveryProfileRecord(
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
        ),
        match_reasons=tuple(reasons),
        score=int(row["compatibility_score"]),
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
