from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import cast
from unittest.mock import MagicMock
from uuid import uuid4

from app.core.database import Database
from app.domains.social_meet.abuse_models import (
    BLOCK_COOLDOWN,
    CANCELLATION_LOOKBACK,
    DAY_LOOKBACK,
    DECLINE_COOLDOWN,
    HOUR_LOOKBACK,
    MINUTE_LOOKBACK,
    REPORT_COOLDOWN,
)
from app.domains.social_meet.abuse_repository import PostgresSocialMeetAbuseRepository

NOW = datetime(2026, 7, 20, 15, 30, 45, tzinfo=UTC)


def test_repository_maps_canonical_abuse_snapshot() -> None:
    row = _row()
    database, connection = _database_with_row(row)
    repository = PostgresSocialMeetAbuseRepository(database)
    sender_auth_user_id = uuid4()
    sender_profile_id = uuid4()
    recipient_auth_user_id = uuid4()
    recipient_profile_id = uuid4()

    snapshot = repository.get_invite_creation_snapshot(
        sender_auth_user_id=sender_auth_user_id,
        sender_profile_id=sender_profile_id,
        recipient_auth_user_id=recipient_auth_user_id,
        recipient_profile_id=recipient_profile_id,
        context_type="place",
        context_id="factory_memory",
        now=NOW,
    )

    assert snapshot is not None
    assert snapshot.sender_social_meet_started_at == row["sender_social_meet_started_at"]
    assert snapshot.sender_minute_count == 2
    assert snapshot.sender_hour_count == 8
    assert snapshot.sender_day_count == 12
    assert snapshot.pair_day_count == 3
    assert snapshot.recipient_day_count == 20
    assert snapshot.cancellation_day_count == 1
    assert snapshot.duplicate_active_invite is True
    assert snapshot.last_declined_at == row["last_declined_at"]
    assert snapshot.last_recipient_report_at == row["last_recipient_report_at"]
    assert snapshot.last_pair_block_at == row["last_pair_block_at"]
    assert snapshot.unresolved_reports_against_sender == 2

    params = connection.execute.call_args.args[1]
    assert params["sender_auth_user_id"] == sender_auth_user_id
    assert params["sender_profile_id"] == sender_profile_id
    assert params["recipient_auth_user_id"] == recipient_auth_user_id
    assert params["recipient_profile_id"] == recipient_profile_id
    assert params["context_type"] == "place"
    assert params["context_id"] == "factory_memory"


def test_repository_uses_rolling_rate_and_cooldown_windows() -> None:
    database, connection = _database_with_row(_row())
    repository = PostgresSocialMeetAbuseRepository(database)

    repository.get_invite_creation_snapshot(
        sender_auth_user_id=uuid4(),
        sender_profile_id=uuid4(),
        recipient_auth_user_id=uuid4(),
        recipient_profile_id=uuid4(),
        context_type="topic",
        context_id="industrial_history",
        now=NOW,
    )

    params = connection.execute.call_args.args[1]
    assert params["minute_start"] == NOW - MINUTE_LOOKBACK
    assert params["hour_start"] == NOW - HOUR_LOOKBACK
    assert params["day_start"] == NOW - DAY_LOOKBACK
    assert params["decline_start"] == NOW - DECLINE_COOLDOWN
    assert params["report_start"] == NOW - REPORT_COOLDOWN
    assert params["block_start"] == NOW - BLOCK_COOLDOWN
    assert params["cancellation_start"] == NOW - CANCELLATION_LOOKBACK


def test_repository_returns_none_when_sender_profile_is_unavailable() -> None:
    database, _ = _database_with_row(None)
    repository = PostgresSocialMeetAbuseRepository(database)

    snapshot = repository.get_invite_creation_snapshot(
        sender_auth_user_id=uuid4(),
        sender_profile_id=uuid4(),
        recipient_auth_user_id=uuid4(),
        recipient_profile_id=uuid4(),
        context_type="route",
        context_id="route_01",
        now=NOW,
    )

    assert snapshot is None


def test_repository_query_reads_only_existing_social_meet_sources() -> None:
    database, connection = _database_with_row(_row())
    repository = PostgresSocialMeetAbuseRepository(database)

    repository.get_invite_creation_snapshot(
        sender_auth_user_id=uuid4(),
        sender_profile_id=uuid4(),
        recipient_auth_user_id=uuid4(),
        recipient_profile_id=uuid4(),
        context_type="quiz",
        context_id="quiz_01",
        now=NOW,
    )

    statement = str(connection.execute.call_args.args[0])
    assert "hg_spotmeeting_invites" in statement
    assert "hg_social_meet_reports" in statement
    assert "hg_social_meet_blocks" in statement
    assert "hg_profiles" in statement
    assert "hg_social_meet_abuse" not in statement


def _database_with_row(row: dict[str, object] | None) -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.connect.return_value.__enter__.return_value = connection
    result = MagicMock()
    result.mappings.return_value.one_or_none.return_value = row
    connection.execute.return_value = result
    return cast(Database, database), connection


def _row() -> dict[str, object]:
    return {
        "sender_social_meet_started_at": NOW - timedelta(days=30),
        "sender_minute_count": 2,
        "sender_hour_count": 8,
        "sender_day_count": 12,
        "pair_day_count": 3,
        "recipient_day_count": 20,
        "cancellation_day_count": 1,
        "duplicate_active_invite": True,
        "last_declined_at": NOW - timedelta(hours=2),
        "last_recipient_report_at": NOW - timedelta(days=1),
        "last_pair_block_at": NOW - timedelta(days=2),
        "unresolved_reports_against_sender": 2,
    }
