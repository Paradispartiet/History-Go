from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import MagicMock
from uuid import UUID, uuid4

from app.core.database import Database
from app.domains.social_meet.safety_models import (
    BlockStatus,
    CreateBlockRequest,
    CreateReportRequest,
    ReportDetailCode,
    ReportReasonCode,
    ReportStatus,
)
from app.domains.social_meet.safety_repository import PostgresSocialMeetSafetyRepository


def test_list_blocks_maps_only_blocker_safe_fields() -> None:
    row = _block_row()
    database, _ = _connect_database(rows=[row])
    repository = PostgresSocialMeetSafetyRepository(database)

    blocks = repository.list_blocks(uuid4())

    assert len(blocks) == 1
    assert blocks[0].block_id == row["id"]
    assert blocks[0].blocked_profile_id == row["blocked_profile_id"]
    assert blocks[0].status is BlockStatus.ACTIVE
    assert not hasattr(blocks[0], "blocker_profile_id")


def test_create_block_uses_active_pair_upsert_and_sanitized_context() -> None:
    row = _block_row()
    database, connection = _begin_database(rows=[row])
    repository = PostgresSocialMeetSafetyRepository(database)
    target_profile_id = UUID(str(row["blocked_profile_id"]))

    block = repository.create_block(
        uuid4(),
        CreateBlockRequest.model_validate(
            {
                "blockedProfileId": str(target_profile_id),
                "relatedContext": {
                    "contextType": "place",
                    "contextId": "factory_memory",
                    "title": "Factory Memory",
                },
            }
        ),
    )

    assert block.blocked_profile_id == target_profile_id
    statement = str(connection.execute.call_args.args[0])
    params = connection.execute.call_args.args[1]
    assert "on conflict (blocker_profile_id, blocked_profile_id)" in statement.lower()
    assert '"contextType": "place"' in str(params["related_context"])


def test_remove_block_is_idempotent_for_already_removed_record() -> None:
    row = _block_row(status="removed_by_blocker", removed_at=datetime(2026, 7, 20, 13, 0, tzinfo=UTC))
    database, connection = _begin_database(rows=[row])
    repository = PostgresSocialMeetSafetyRepository(database)

    block = repository.remove_block(uuid4(), UUID(str(row["id"])))

    assert block is not None
    assert block.status is BlockStatus.REMOVED_BY_BLOCKER
    assert connection.execute.call_count == 1


def test_remove_active_block_updates_status_and_removed_timestamp() -> None:
    existing = _block_row()
    updated = _block_row(
        id=existing["id"],
        status="removed_by_blocker",
        removed_at=datetime(2026, 7, 20, 13, 0, tzinfo=UTC),
    )
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.begin.return_value.__enter__.return_value = connection
    first = MagicMock()
    first.mappings.return_value.one_or_none.return_value = existing
    second = MagicMock()
    second.mappings.return_value.one.return_value = updated
    connection.execute.side_effect = [first, second]
    repository = PostgresSocialMeetSafetyRepository(database)

    block = repository.remove_block(uuid4(), UUID(str(existing["id"])))

    assert block is not None
    assert block.status is BlockStatus.REMOVED_BY_BLOCKER
    assert block.removed_at == updated["removed_at"]
    assert connection.execute.call_count == 2


def test_remove_unknown_block_returns_none() -> None:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.begin.return_value.__enter__.return_value = connection
    result = MagicMock()
    result.mappings.return_value.one_or_none.return_value = None
    connection.execute.return_value = result
    repository = PostgresSocialMeetSafetyRepository(database)

    assert repository.remove_block(uuid4(), uuid4()) is None


def test_interaction_block_check_is_bidirectional() -> None:
    database, connection = _connect_database(scalar=True)
    repository = PostgresSocialMeetSafetyRepository(database)
    first_profile_id = uuid4()
    second_profile_id = uuid4()

    assert repository.interaction_is_blocked(first_profile_id, second_profile_id) is True
    statement = str(connection.execute.call_args.args[0]).lower()
    params = connection.execute.call_args.args[1]
    assert "blocker_profile_id = :first_profile_id" in statement
    assert "blocker_profile_id = :second_profile_id" in statement
    assert params == {
        "first_profile_id": first_profile_id,
        "second_profile_id": second_profile_id,
    }


def test_create_report_stores_only_structured_server_owned_codes() -> None:
    row = _report_row()
    database, connection = _begin_database(rows=[row])
    repository = PostgresSocialMeetSafetyRepository(database)

    report = repository.create_report(
        uuid4(),
        CreateReportRequest.model_validate(
            {
                "reportedProfileId": str(row["reported_profile_id"]),
                "reasonCode": "unsafe_behavior",
                "structuredDetails": ["repeated_unwanted_invites"],
            }
        ),
    )

    params = connection.execute.call_args.args[1]
    assert report.status is ReportStatus.SUBMITTED
    assert report.reason_code is ReportReasonCode.UNSAFE_BEHAVIOR
    assert report.structured_details == [ReportDetailCode.REPEATED_UNWANTED_INVITES]
    assert list(params["structured_details"]) == [ReportDetailCode.REPEATED_UNWANTED_INVITES]


def test_submitted_report_queries_are_reporter_scoped() -> None:
    row = _report_row()
    reporter_profile_id = uuid4()
    database, connection = _connect_database(rows=[row])
    repository = PostgresSocialMeetSafetyRepository(database)

    reports = repository.list_submitted_reports(reporter_profile_id)

    assert reports[0].report_id == row["id"]
    assert connection.execute.call_args.args[1] == {"reporter_profile_id": reporter_profile_id}


def test_get_missing_submitted_report_returns_none() -> None:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.connect.return_value.__enter__.return_value = connection
    result = MagicMock()
    result.mappings.return_value.one_or_none.return_value = None
    connection.execute.return_value = result
    repository = PostgresSocialMeetSafetyRepository(database)

    assert repository.get_submitted_report(uuid4(), uuid4()) is None


def test_participant_invite_export_maps_counterparty_to_public_profile_id() -> None:
    row = _invite_row()
    database, _ = _connect_database(rows=[row])
    repository = PostgresSocialMeetSafetyRepository(database)

    invites = repository.list_participant_invites(uuid4())

    assert invites[0].direction == "sent"
    assert invites[0].counterparty_profile_id == row["counterparty_profile_id"]
    assert not hasattr(invites[0], "created_by")
    assert not hasattr(invites[0], "target_user_id")


def test_deleted_at_read_returns_private_tombstone_timestamp() -> None:
    deleted_at = datetime(2026, 7, 20, 15, 0, tzinfo=UTC)
    database, _ = _connect_database(scalar=deleted_at)
    repository = PostgresSocialMeetSafetyRepository(database)

    assert repository.get_deleted_at(uuid4()) == deleted_at


def test_social_meet_delete_preserves_shared_history_go_profile_fields() -> None:
    profile_id = uuid4()
    database, connection = _begin_database(scalar=profile_id)
    repository = PostgresSocialMeetSafetyRepository(database)
    auth_user_id = uuid4()
    deleted_at = datetime(2026, 7, 20, 15, 0, tzinfo=UTC)

    returned_profile_id = repository.mark_social_meet_deleted(auth_user_id, deleted_at)

    statement = str(connection.execute.call_args.args[0]).lower()
    params = connection.execute.call_args.args[1]
    assert returned_profile_id == profile_id
    assert "profile_visibility = 'deleted'" in statement
    assert "short_bio = null" in statement
    assert "display_name = null" not in statement
    assert "avatar_url = null" not in statement
    assert "public_home_place_id = null" not in statement
    assert params == {"auth_user_id": auth_user_id, "deleted_at": deleted_at}


def _connect_database(
    *,
    rows: list[dict[str, object]] | None = None,
    scalar: object | None = None,
) -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.connect.return_value.__enter__.return_value = connection
    result = MagicMock()
    if rows is not None:
        result.mappings.return_value.all.return_value = rows
    if scalar is not None:
        result.scalar_one.return_value = scalar
        result.scalar_one_or_none.return_value = scalar
    connection.execute.return_value = result
    return database, connection


def _begin_database(
    *,
    rows: list[dict[str, object]] | None = None,
    scalar: object | None = None,
) -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.begin.return_value.__enter__.return_value = connection
    result = MagicMock()
    if rows is not None:
        result.mappings.return_value.one.return_value = rows[0]
        result.mappings.return_value.one_or_none.return_value = rows[0]
    if scalar is not None:
        result.scalar_one_or_none.return_value = scalar
    connection.execute.return_value = result
    return database, connection


def _block_row(**overrides: object) -> dict[str, object]:
    timestamp = datetime(2026, 7, 20, 12, 0, tzinfo=UTC)
    row: dict[str, object] = {
        "id": uuid4(),
        "blocked_profile_id": uuid4(),
        "scope": "social_meet",
        "related_invite_id": None,
        "related_context": {},
        "status": "active",
        "source_surface": "public_profile",
        "created_at": timestamp,
        "updated_at": timestamp,
        "removed_at": None,
    }
    row.update(overrides)
    return row


def _report_row(**overrides: object) -> dict[str, object]:
    timestamp = datetime(2026, 7, 20, 12, 0, tzinfo=UTC)
    row: dict[str, object] = {
        "id": uuid4(),
        "reported_profile_id": uuid4(),
        "related_invite_id": None,
        "related_context": {},
        "reason_code": "unsafe_behavior",
        "structured_details": ["repeated_unwanted_invites"],
        "status": "submitted",
        "source_surface": "spotmeeting_inbox",
        "created_at": timestamp,
        "updated_at": timestamp,
    }
    row.update(overrides)
    return row


def _invite_row(**overrides: object) -> dict[str, object]:
    timestamp = datetime(2026, 7, 20, 12, 0, tzinfo=UTC)
    row: dict[str, object] = {
        "id": uuid4(),
        "direction": "sent",
        "counterparty_profile_id": uuid4(),
        "context_type": "place",
        "context_id": "factory_memory",
        "context_title": "Factory Memory",
        "source_surface": "place_card",
        "preset_message_id": "compare_place_learning",
        "status": "pending",
        "created_at": timestamp,
        "updated_at": timestamp,
    }
    row.update(overrides)
    return row
