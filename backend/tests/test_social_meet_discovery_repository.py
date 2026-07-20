from __future__ import annotations

from datetime import UTC, datetime
from typing import cast
from unittest.mock import MagicMock
from uuid import uuid4

from app.core.database import Database
from app.domains.social_meet.discovery_models import (
    DiscoveryContextSignals,
    DiscoveryMatchReason,
)
from app.domains.social_meet.discovery_repository import PostgresSocialMeetDiscoveryRepository
from app.domains.social_meet.spotmeeting_models import SpotmeetingContextType

NOW = datetime(2026, 7, 20, 19, 0, tzinfo=UTC)


def test_missing_feature_flag_fails_closed() -> None:
    database, _ = _database_with_results([_mapped_one_or_none(None)])
    repository = PostgresSocialMeetDiscoveryRepository(database)

    gate = repository.get_feature_gate()

    assert gate.enabled is False
    assert gate.rollout_percent == 0
    assert gate.allowed_profile_ids == frozenset()


def test_feature_flag_maps_public_profile_cohort_only() -> None:
    first = uuid4()
    second = uuid4()
    database, _ = _database_with_results(
        [
            _mapped_one_or_none(
                {
                    "enabled": True,
                    "rollout_percent": 25,
                    "allowed_profile_ids": [first, second],
                }
            )
        ]
    )
    repository = PostgresSocialMeetDiscoveryRepository(database)

    gate = repository.get_feature_gate()

    assert gate.enabled is True
    assert gate.rollout_percent == 25
    assert gate.allowed_profile_ids == frozenset({first, second})


def test_rank_query_filters_private_safety_state_before_scoring() -> None:
    candidate_id = uuid4()
    database, connection = _database_with_results(
        [
            _mapped_all(
                [
                    _ranked_row(
                        candidate_id=candidate_id,
                        context_interest_place=True,
                        context_theme=True,
                        context_topic=True,
                        shared_theme=True,
                        compatibility_score=28,
                    )
                ]
            )
        ]
    )
    repository = PostgresSocialMeetDiscoveryRepository(database)

    records = repository.rank_context_candidates(
        requester_profile_id=uuid4(),
        context=_context(),
        supported_consent_version="social_meet_identity_v1",
        now=NOW,
        limit=20,
    )

    assert records[0].profile.profile_id == candidate_id
    assert records[0].score == 28
    assert records[0].match_reasons == (
        DiscoveryMatchReason.CONTEXT_INTEREST_PLACE,
        DiscoveryMatchReason.CONTEXT_THEME,
        DiscoveryMatchReason.CONTEXT_TOPIC,
        DiscoveryMatchReason.SHARED_THEME,
    )

    statement = str(connection.execute.call_args.args[0]).lower()
    assert "profile_visibility = 'discoverable'" in statement
    assert "consent_version = :consent_version" in statement
    assert "hg_social_meet_profile_restrictions" in statement
    assert "hg_social_meet_blocks" in statement
    assert "hg_social_meet_reports" in statement
    assert "hg_spotmeeting_invites" in statement
    assert "status = 'active'" in statement
    assert "status in ('pending', 'accepted')" in statement
    assert "status = 'declined'" in statement
    assert "compatibility_score > 0" in statement
    assert "order by compatibility_score desc, profile_id asc" in statement

    # Discovery must never source location, behavior, presence, popularity or social-graph data.
    assert "public_home_place_id" not in statement
    assert "hg_social_activity" not in statement
    assert "last_seen" not in statement
    assert "online" not in statement
    assert "followers" not in statement
    assert "distance" not in statement
    assert "latitude" not in statement
    assert "longitude" not in statement


def test_rank_query_uses_explicit_context_signals_and_server_limit() -> None:
    database, connection = _database_with_results([_mapped_all([])])
    repository = PostgresSocialMeetDiscoveryRepository(database)
    context = _context()

    records = repository.rank_context_candidates(
        requester_profile_id=uuid4(),
        context=context,
        supported_consent_version="social_meet_identity_v1",
        now=NOW,
        limit=17,
    )

    assert records == []
    params = connection.execute.call_args.args[1]
    assert params["context_id"] == "akershus_festning"
    assert params["theme_tags"] == ["history"]
    assert params["era_tags"] == ["medieval"]
    assert params["topic_tags"] == ["fortifications"]
    assert params["route_category_tags"] == ["historic_route"]
    assert params["quiz_topic_tags"] == ["architecture"]
    assert params["learning_goal_tags"] == ["defensive_architecture"]
    assert params["limit"] == 17
    assert params["block_start"] < NOW
    assert params["report_start"] < NOW
    assert params["decline_start"] < NOW


def test_ranked_row_maps_snake_case_fingerprint_and_public_profile_fields() -> None:
    candidate_id = uuid4()
    database, _ = _database_with_results(
        [
            _mapped_all(
                [
                    _ranked_row(
                        candidate_id=candidate_id,
                        fingerprint={"theme_tags": ["history"]},
                        context_theme=True,
                        compatibility_score=6,
                    )
                ]
            )
        ]
    )
    repository = PostgresSocialMeetDiscoveryRepository(database)

    record = repository.rank_context_candidates(
        requester_profile_id=uuid4(),
        context=_context(),
        supported_consent_version="social_meet_identity_v1",
        now=NOW,
        limit=1,
    )[0]

    assert record.profile.profile_id == candidate_id
    assert record.profile.display_name == "Ada"
    assert record.profile.interest_places == ("akershus_festning",)
    assert record.profile.knowledge_fingerprint_summary == {"theme_tags": ["history"]}
    assert record.match_reasons == (DiscoveryMatchReason.CONTEXT_THEME,)


def _context() -> DiscoveryContextSignals:
    return DiscoveryContextSignals(
        context_type=SpotmeetingContextType.PLACE,
        context_id="akershus_festning",
        theme_tags=["history"],
        era_tags=["medieval"],
        topic_tags=["fortifications"],
        route_category_tags=["historic_route"],
        quiz_topic_tags=["architecture"],
        learning_goal_tags=["defensive_architecture"],
    )


def _ranked_row(
    *,
    candidate_id: object,
    fingerprint: dict[str, object] | None = None,
    context_interest_place: bool = False,
    context_theme: bool = False,
    context_era: bool = False,
    context_topic: bool = False,
    context_route_category: bool = False,
    context_quiz_topic: bool = False,
    context_learning_goal: bool = False,
    shared_theme: bool = False,
    shared_era: bool = False,
    shared_learning_goal: bool = False,
    compatibility_score: int,
) -> dict[str, object]:
    return {
        "profile_id": candidate_id,
        "display_name": "Ada",
        "avatar_url": None,
        "short_bio": "History",
        "preferred_themes": ["history"],
        "favorite_eras": ["medieval"],
        "interest_places": ["akershus_festning"],
        "learning_goals": ["architecture"],
        "knowledge_fingerprint_summary": fingerprint or {"themeTags": ["history"]},
        "updated_at": NOW,
        "context_interest_place": context_interest_place,
        "context_theme": context_theme,
        "context_era": context_era,
        "context_topic": context_topic,
        "context_route_category": context_route_category,
        "context_quiz_topic": context_quiz_topic,
        "context_learning_goal": context_learning_goal,
        "shared_theme": shared_theme,
        "shared_era": shared_era,
        "shared_learning_goal": shared_learning_goal,
        "compatibility_score": compatibility_score,
    }


def _database_with_results(results: list[MagicMock]) -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.connect.return_value.__enter__.return_value = connection
    connection.execute.side_effect = results
    return cast(Database, database), connection


def _mapped_one_or_none(row: object) -> MagicMock:
    result = MagicMock()
    result.mappings.return_value.one_or_none.return_value = row
    return result


def _mapped_all(rows: list[dict[str, object]]) -> MagicMock:
    result = MagicMock()
    result.mappings.return_value.all.return_value = rows
    return result
