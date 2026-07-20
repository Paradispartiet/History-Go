from __future__ import annotations

from datetime import UTC, datetime
from typing import cast
from unittest.mock import MagicMock
from uuid import uuid4

from app.core.database import Database
from app.domains.social_meet.discovery_repository import PostgresSocialMeetDiscoveryRepository

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


def test_candidate_query_enforces_server_side_safety_suppression() -> None:
    candidate_id = uuid4()
    database, connection = _database_with_results(
        [
            _mapped_all(
                [
                    {
                        "profile_id": candidate_id,
                        "display_name": "Ada",
                        "avatar_url": None,
                        "short_bio": "History",
                        "preferred_themes": ["history"],
                        "favorite_eras": ["medieval"],
                        "interest_places": ["akershus_festning"],
                        "learning_goals": ["architecture"],
                        "knowledge_fingerprint_summary": {
                            "themeTags": ["history"],
                        },
                        "updated_at": NOW,
                    }
                ]
            )
        ]
    )
    repository = PostgresSocialMeetDiscoveryRepository(database)

    records = repository.list_candidate_profiles(
        requester_profile_id=uuid4(),
        supported_consent_version="social_meet_identity_v1",
        now=NOW,
        pool_limit=200,
    )

    assert records[0].profile_id == candidate_id
    assert records[0].interest_places == ("akershus_festning",)
    statement = str(connection.execute.call_args.args[0]).lower()
    assert "profile_visibility = 'discoverable'" in statement
    assert "hg_social_meet_profile_restrictions" in statement
    assert "hg_social_meet_blocks" in statement
    assert "hg_social_meet_reports" in statement
    assert "hg_spotmeeting_invites" in statement
    assert "status = 'active'" in statement
    assert "status in ('pending', 'accepted')" in statement
    assert "status = 'declined'" in statement
    assert "public_home_place_id" not in statement
    assert "hg_social_activity" not in statement
    assert "last_seen" not in statement
    assert "followers" not in statement
    assert "distance" not in statement


def test_candidate_query_uses_server_bounded_pool_and_cooldown_windows() -> None:
    database, connection = _database_with_results([_mapped_all([])])
    repository = PostgresSocialMeetDiscoveryRepository(database)

    repository.list_candidate_profiles(
        requester_profile_id=uuid4(),
        supported_consent_version="social_meet_identity_v1",
        now=NOW,
        pool_limit=75,
    )

    params = connection.execute.call_args.args[1]
    assert params["pool_limit"] == 75
    assert params["block_start"] < NOW
    assert params["report_start"] < NOW
    assert params["decline_start"] < NOW


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
