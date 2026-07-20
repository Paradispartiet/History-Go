from __future__ import annotations

import json
from datetime import UTC, datetime
from typing import cast
from unittest.mock import MagicMock
from uuid import UUID, uuid4

from app.core.database import Database
from app.domains.social_meet.safety_models import (
    BlockCreateRequest,
    BlockScope,
    BlockStatus,
    ReportCreateRequest,
    ReportReasonCode,
    ReportStatus,
    SafetyContext,
    SocialMeetReportRecord,
    StructuredReportDetail,
)
from app.domains.social_meet.safety_repository import PostgresSocialMeetSafetyRepository

NOW = datetime(2026, 7, 20, 13, 0, tzinfo=UTC)


def test_list_active_blocks_maps_private_rows_to_records() -> None:
    row = _block_row(related_context='{"contextType":"place","contextId":"factory"}')
    database, connection = _database_with_connect_result(all_rows=[row])
    repository = PostgresSocialMeetSafetyRepository(database)

    records = repository.list_active_blocks(cast(UUID, row["blocker_profile_id"]))

    assert len(records) == 1
    assert records[0].block_id == row["id"]
    assert records[0].related_context == {
        "contextType": "place",
        "contextId": "factory",
    }
    params = connection.execute.call_args.args[1]
    assert params == {"blocker_profile_id": row["blocker_profile_id"]}


def test_upsert_block_serializes_sanitized_context_and_public_profile_ids() -> None:
    row = _block_row()
    database, connection = _database_with_begin_result(row)
    repository = PostgresSocialMeetSafetyRepository(database)
    request = BlockCreateRequest(
        blocked_profile_id=cast(UUID, row["blocked_profile_id"]),
        scope=BlockScope.SPOTMEETING_INVITES,
        related_invite_id=cast(UUID, row["related_invite_id"]),
        related_context=SafetyContext(
            context_type="place",
            context_id="factory_memory",
            source_surface="spotmeeting_inbox",
        ),
        source_surface="spotmeeting_inbox",
    )

    record = repository.upsert_block(cast(UUID, row["blocker_profile_id"]), request)

    assert record.status is BlockStatus.ACTIVE
    params = connection.execute.call_args.args[1]
    assert params["blocked_profile_id"] == row["blocked_profile_id"]
    assert params["scope"] == "spotmeeting_invites"
    assert json.loads(cast(str, params["related_context"]))["contextId"] == "factory_memory"


def test_remove_block_is_scoped_to_current_blocker() -> None:
    row = _block_row(status="removed_by_blocker", removed_at=NOW)
    database, connection = _database_with_begin_result(row)
    repository = PostgresSocialMeetSafetyRepository(database)

    record = repository.remove_block(
        cast(UUID, row["blocker_profile_id"]),
        cast(UUID, row["id"]),
    )

    assert record is not None
    assert record.status is BlockStatus.REMOVED_BY_BLOCKER
    params = connection.execute.call_args.args[1]
    assert params["block_id"] == row["id"]
    assert params["blocker_profile_id"] == row["blocker_profile_id"]


def test_remove_block_returns_none_for_unknown_or_unowned_block() -> None:
    database, _ = _database_with_begin_result(None)
    repository = PostgresSocialMeetSafetyRepository(database)

    assert repository.remove_block(uuid4(), uuid4()) is None


def test_create_report_persists_only_structured_report_fields() -> None:
    row = _report_row()
    database, connection = _database_with_begin_result(row)
    repository = PostgresSocialMeetSafetyRepository(database)
    request = ReportCreateRequest(
        reported_profile_id=cast(UUID, row["reported_profile_id"]),
        related_invite_id=cast(UUID, row["related_invite_id"]),
        reason_code=ReportReasonCode.UNSAFE_BEHAVIOR,
        structured_details=[StructuredReportDetail.REPEATED_UNWANTED_INVITES],
        source_surface="spotmeeting_inbox",
    )

    record = repository.create_report(cast(UUID, row["reporter_profile_id"]), request)

    assert record.reason_code is ReportReasonCode.UNSAFE_BEHAVIOR
    params = connection.execute.call_args.args[1]
    assert params["reason_code"] == "unsafe_behavior"
    assert params["structured_details"] == ["repeated_unwanted_invites"]
    assert "message" not in params
    assert "free_text" not in params


def test_report_reads_are_scoped_to_reporter_profile() -> None:
    row = _report_row()
    database, connection = _database_with_connect_result(all_rows=[row])
    repository = PostgresSocialMeetSafetyRepository(database)

    records = repository.list_submitted_reports(cast(UUID, row["reporter_profile_id"]))

    assert records[0].report_id == row["id"]
    params = connection.execute.call_args.args[1]
    assert params == {"reporter_profile_id": row["reporter_profile_id"]}


def test_get_submitted_report_returns_none_without_leaking_other_reporters() -> None:
    database, _ = _database_with_connect_result(one_or_none=None)
    repository = PostgresSocialMeetSafetyRepository(database)

    assert repository.get_submitted_report(uuid4(), uuid4()) is None


def test_interaction_block_check_is_bidirectional() -> None:
    database, connection = _database_with_scalar(True)
    repository = PostgresSocialMeetSafetyRepository(database)
    first = uuid4()
    second = uuid4()

    assert repository.interaction_is_blocked(first, second) is True
    params = connection.execute.call_args.args[1]
    assert params == {
        "first_profile_id": first,
        "second_profile_id": second,
    }


def test_related_invite_validation_checks_both_auth_user_directions() -> None:
    database, connection = _database_with_scalar(True)
    repository = PostgresSocialMeetSafetyRepository(database)
    invite_id = uuid4()
    first_user_id = uuid4()
    second_user_id = uuid4()

    assert repository.invite_links_users(invite_id, first_user_id, second_user_id) is True
    params = connection.execute.call_args.args[1]
    assert params == {
        "invite_id": invite_id,
        "first_user_id": first_user_id,
        "second_user_id": second_user_id,
    }


def test_enqueue_report_uses_private_queue_metadata() -> None:
    database, connection = _database_with_begin_execute()
    repository = PostgresSocialMeetSafetyRepository(database)
    report = _report_record()

    repository.enqueue_report(report, priority="high")

    params = connection.execute.call_args.args[1]
    assert params["report_id"] == report.report_id
    assert params["subject_profile_id"] == report.reported_profile_id
    assert params["reporter_profile_id"] == report.reporter_profile_id
    assert params["priority"] == "high"
    assert params["category"] == "unsafe_behavior"


def test_safety_audit_stores_decision_ids_without_location_or_content() -> None:
    database, connection = _database_with_begin_execute()
    repository = PostgresSocialMeetSafetyRepository(database)
    actor_profile_id = uuid4()
    target_profile_id = uuid4()
    block_id = uuid4()

    repository.write_audit(
        actor_profile_id=actor_profile_id,
        target_profile_id=target_profile_id,
        action_type="block_profile",
        decision="applied",
        related_block_id=block_id,
        context_id="factory_memory",
        request_id="request-123",
    )

    params = connection.execute.call_args.args[1]
    assert params["actor_profile_id"] == actor_profile_id
    assert params["target_profile_id"] == target_profile_id
    assert params["related_block_id"] == block_id
    assert "latitude" not in params
    assert "longitude" not in params
    assert "message" not in params


def _database_with_begin_result(
    row: dict[str, object] | None,
) -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.begin.return_value.__enter__.return_value = connection
    result = MagicMock()
    result.mappings.return_value.one.return_value = row
    result.mappings.return_value.one_or_none.return_value = row
    connection.execute.return_value = result
    return cast(Database, database), connection


def _database_with_begin_execute() -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.begin.return_value.__enter__.return_value = connection
    return cast(Database, database), connection


def _database_with_connect_result(
    *,
    all_rows: list[dict[str, object]] | None = None,
    one_or_none: dict[str, object] | None = None,
) -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.connect.return_value.__enter__.return_value = connection
    result = MagicMock()
    result.mappings.return_value.all.return_value = all_rows or []
    result.mappings.return_value.one_or_none.return_value = one_or_none
    connection.execute.return_value = result
    return cast(Database, database), connection


def _database_with_scalar(value: bool) -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.connect.return_value.__enter__.return_value = connection
    result = MagicMock()
    result.scalar_one.return_value = value
    connection.execute.return_value = result
    return cast(Database, database), connection


def _block_row(**overrides: object) -> dict[str, object]:
    row: dict[str, object] = {
        "id": uuid4(),
        "blocker_profile_id": uuid4(),
        "blocked_profile_id": uuid4(),
        "scope": "social_meet",
        "related_invite_id": uuid4(),
        "related_context": None,
        "status": "active",
        "source_surface": "public_profile",
        "created_at": NOW,
        "updated_at": NOW,
        "removed_at": None,
    }
    row.update(overrides)
    return row


def _report_row(**overrides: object) -> dict[str, object]:
    row: dict[str, object] = {
        "id": uuid4(),
        "reporter_profile_id": uuid4(),
        "reported_profile_id": uuid4(),
        "related_invite_id": uuid4(),
        "related_context": None,
        "reason_code": "unsafe_behavior",
        "structured_details": ["repeated_unwanted_invites"],
        "source_surface": "spotmeeting_inbox",
        "status": "submitted",
        "created_at": NOW,
        "updated_at": NOW,
    }
    row.update(overrides)
    return row


def _report_record() -> SocialMeetReportRecord:
    return SocialMeetReportRecord(
        report_id=uuid4(),
        reporter_profile_id=uuid4(),
        reported_profile_id=uuid4(),
        related_invite_id=uuid4(),
        related_context={"contextId": "factory_memory"},
        reason_code=ReportReasonCode.UNSAFE_BEHAVIOR,
        structured_details=(StructuredReportDetail.REPEATED_UNWANTED_INVITES,),
        source_surface="spotmeeting_inbox",
        status=ReportStatus.SUBMITTED,
        created_at=NOW,
        updated_at=NOW,
    )
