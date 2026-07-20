from __future__ import annotations

from datetime import UTC, datetime
from typing import cast
from unittest.mock import MagicMock
from uuid import UUID, uuid4

from app.core.database import Database
from app.domains.social_meet.moderation_models import (
    AppealDecision,
    AppealDecisionReasonCode,
    AppealReasonCode,
    AppealStatus,
    ModerationPriority,
    ModerationQueueState,
    ModerationResolutionCode,
    RestrictionReasonCode,
)
from app.domains.social_meet.moderation_repository import PostgresSocialMeetModerationRepository

NOW = datetime(2026, 7, 20, 14, 0, tzinfo=UTC)


def test_reconcile_queue_backfills_durable_reports_without_duplicate_queue_rows() -> None:
    database, connection = _database_begin()
    repository = PostgresSocialMeetModerationRepository(database)

    repository.reconcile_queue()

    sql = str(connection.execute.call_args.args[0])
    assert "hg_social_meet_reports" in sql
    assert "not exists" in sql
    assert "on conflict (report_id) do nothing" in sql


def test_list_queue_maps_staff_safe_queue_fields() -> None:
    row = _queue_row()
    database, connection = _database_connect(all_rows=[row])
    repository = PostgresSocialMeetModerationRepository(database)
    repository.reconcile_queue = MagicMock()  # type: ignore[method-assign]

    items = repository.list_queue(state=ModerationQueueState.QUEUED, limit=25)

    assert items[0].queue_item_id == row["id"]
    assert items[0].priority is ModerationPriority.HIGH
    assert items[0].assigned is False
    params = connection.execute.call_args.args[1]
    assert params == {"state": "queued", "limit": 25}


def test_get_queue_item_returns_none_for_unknown_id() -> None:
    database, _ = _database_connect(one_or_none=None)
    repository = PostgresSocialMeetModerationRepository(database)
    repository.reconcile_queue = MagicMock()  # type: ignore[method-assign]

    assert repository.get_queue_item(uuid4()) is None


def test_claim_release_and_escalate_are_server_authoritative_updates() -> None:
    row = _queue_row(state="under_review", assigned_staff_user_id=uuid4())
    database, connection = _database_begin(one_or_none=row)
    repository = PostgresSocialMeetModerationRepository(database)
    staff_user_id = cast(UUID, row["assigned_staff_user_id"])
    queue_item_id = cast(UUID, row["id"])

    claimed = repository.claim_queue_item(queue_item_id, staff_user_id)
    released = repository.release_queue_item(queue_item_id, staff_user_id)
    escalated = repository.escalate_queue_item(queue_item_id)

    assert claimed is not None and claimed.assigned is True
    assert released is not None
    assert escalated is not None
    assert connection.execute.call_count == 3


def test_resolve_report_updates_report_and_queue_in_one_transaction() -> None:
    row = _queue_row(state="actioned", resolution_code="warning_or_guidance", closed_at=NOW)
    database, connection = _database_begin(sequence=[None, row])
    repository = PostgresSocialMeetModerationRepository(database)

    item = repository.resolve_report(
        cast(UUID, row["report_id"]),
        resolution_code=ModerationResolutionCode.WARNING_OR_GUIDANCE,
        staff_user_id=uuid4(),
    )

    assert item is not None
    assert item.state is ModerationQueueState.ACTIONED
    assert item.resolution_code is ModerationResolutionCode.WARNING_OR_GUIDANCE
    assert connection.execute.call_count == 2


def test_suspend_profile_sets_restriction_and_blocks_profile_visibility() -> None:
    restriction_row = _restriction_row()
    database, connection = _database_begin(sequence=[True, restriction_row, None])
    repository = PostgresSocialMeetModerationRepository(database)

    restriction = repository.suspend_profile(
        cast(UUID, restriction_row["profile_id"]),
        reason_code=RestrictionReasonCode.UNSAFE_BEHAVIOR,
        source_report_id=cast(UUID, restriction_row["source_report_id"]),
        staff_user_id=uuid4(),
    )

    assert restriction is not None
    assert restriction.status == "active"
    visibility_sql = str(connection.execute.call_args_list[2].args[0])
    assert "blocked_or_suspended" in visibility_sql


def test_suspend_profile_returns_none_for_deleted_or_unknown_profile() -> None:
    database, _ = _database_begin(sequence=[False])
    repository = PostgresSocialMeetModerationRepository(database)

    assert (
        repository.suspend_profile(
            uuid4(),
            reason_code=RestrictionReasonCode.MODERATION_POLICY,
            source_report_id=None,
            staff_user_id=uuid4(),
        )
        is None
    )


def test_restore_lifts_restriction_and_returns_profile_to_paused() -> None:
    row = _restriction_row(status="lifted", lifted_at=NOW)
    database, connection = _database_begin(sequence=[row, None])
    repository = PostgresSocialMeetModerationRepository(database)

    restriction = repository.restore_profile(cast(UUID, row["profile_id"]), staff_user_id=uuid4())

    assert restriction is not None
    assert restriction.status == "lifted"
    assert "profile_visibility = 'paused'" in str(connection.execute.call_args_list[1].args[0])


def test_create_appeal_requires_restriction_ownership() -> None:
    database, _ = _database_begin(sequence=[False])
    repository = PostgresSocialMeetModerationRepository(database)

    assert (
        repository.create_appeal(
            uuid4(),
            uuid4(),
            AppealReasonCode.INCORRECT_DECISION,
        )
        is None
    )


def test_create_and_list_appeals_are_appellant_scoped() -> None:
    appeal_row = _appeal_row()
    database, _ = _database_begin(sequence=[True, appeal_row])
    repository = PostgresSocialMeetModerationRepository(database)

    created = repository.create_appeal(
        uuid4(),
        cast(UUID, appeal_row["restriction_id"]),
        AppealReasonCode.NEW_CONTEXT,
    )

    assert created is not None
    assert created.status is AppealStatus.SUBMITTED


def test_reverse_appeal_lifts_restriction_and_pauses_profile() -> None:
    appeal_row = _appeal_row(
        status="reversed",
        decision_reason_code="restriction_reversed",
        decided_at=NOW,
        appellant_profile_id=uuid4(),
    )
    database, connection = _database_begin(sequence=[appeal_row, None, None])
    repository = PostgresSocialMeetModerationRepository(database)

    appeal = repository.decide_appeal(
        cast(UUID, appeal_row["id"]),
        decision=AppealDecision.REVERSE,
        reason_code=AppealDecisionReasonCode.RESTRICTION_REVERSED,
        staff_user_id=uuid4(),
    )

    assert appeal is not None
    assert appeal.status is AppealStatus.REVERSED
    assert connection.execute.call_count == 3


def test_audit_contains_only_structured_moderation_decision_fields() -> None:
    database, connection = _database_begin()
    repository = PostgresSocialMeetModerationRepository(database)

    repository.write_audit(
        actor_type="moderator",
        staff_user_id=uuid4(),
        target_profile_id=uuid4(),
        action_type="suspend_profile",
        decision="suspended",
        reason_code="unsafe_behavior",
        report_id=uuid4(),
    )

    params = connection.execute.call_args.args[1]
    assert "latitude" not in params
    assert "longitude" not in params
    assert "message" not in params
    assert "review_notes" not in params


def _database_begin(
    *,
    one_or_none: dict[str, object] | None = None,
    sequence: list[object] | None = None,
) -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.begin.return_value.__enter__.return_value = connection

    if sequence is not None:
        results: list[MagicMock] = []
        for value in sequence:
            result = MagicMock()
            if isinstance(value, bool):
                result.scalar_one.return_value = value
            elif isinstance(value, dict):
                result.mappings.return_value.one.return_value = value
                result.mappings.return_value.one_or_none.return_value = value
            else:
                result.mappings.return_value.one_or_none.return_value = None
            results.append(result)
        connection.execute.side_effect = results
    else:
        result = MagicMock()
        result.mappings.return_value.one_or_none.return_value = one_or_none
        connection.execute.return_value = result

    return cast(Database, database), connection


def _database_connect(
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


def _queue_row(**overrides: object) -> dict[str, object]:
    row: dict[str, object] = {
        "id": uuid4(),
        "report_id": uuid4(),
        "subject_profile_id": uuid4(),
        "reporter_profile_id": uuid4(),
        "related_invite_id": None,
        "priority": "high",
        "category": "unsafe_behavior",
        "state": "queued",
        "assigned_staff_user_id": None,
        "resolution_code": None,
        "created_at": NOW,
        "updated_at": NOW,
        "closed_at": None,
    }
    row.update(overrides)
    return row


def _restriction_row(**overrides: object) -> dict[str, object]:
    row: dict[str, object] = {
        "id": uuid4(),
        "profile_id": uuid4(),
        "restriction_type": "social_meet_suspension",
        "status": "active",
        "reason_code": "unsafe_behavior",
        "source_report_id": uuid4(),
        "created_at": NOW,
        "updated_at": NOW,
        "lifted_at": None,
    }
    row.update(overrides)
    return row


def _appeal_row(**overrides: object) -> dict[str, object]:
    row: dict[str, object] = {
        "id": uuid4(),
        "restriction_id": uuid4(),
        "reason_code": "new_context",
        "status": "submitted",
        "decision_reason_code": None,
        "created_at": NOW,
        "updated_at": NOW,
        "decided_at": None,
    }
    row.update(overrides)
    return row
