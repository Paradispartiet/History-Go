from __future__ import annotations

from datetime import UTC, datetime
from typing import cast
from unittest.mock import MagicMock
from uuid import UUID, uuid4

import pytest

from app.core.database import Database
from app.domains.social_meet.operations_models import (
    RetentionCounts,
    RetentionEntityType,
    RetentionPolicyView,
)
from app.domains.social_meet.operations_repository import PostgresSocialMeetOperationsRepository

NOW = datetime(2026, 7, 20, 19, 0, tzinfo=UTC)


def test_preview_uses_terminal_state_cutoffs_and_active_hold_suppression() -> None:
    database, connection = _database_for_connect([_mapped_one(_count_row(terminal_invites=3))])
    repository = PostgresSocialMeetOperationsRepository(database)

    counts = repository.preview_retention(_policy(), now=NOW)

    assert counts.terminal_invites == 3
    assert counts.closed_reports == 0

    statement = str(connection.execute.call_args.args[0]).lower()
    assert "hg_spotmeeting_invites" in statement
    assert "hg_social_meet_blocks" in statement
    assert "hg_social_meet_reports" in statement
    assert "hg_social_meet_moderation_queue" in statement
    assert "hg_social_meet_profile_restrictions" in statement
    assert "hg_social_meet_appeals" in statement
    assert "hg_social_meet_safety_audit" in statement
    assert "hg_social_meet_retention_holds" in statement
    assert "retention_hold.status = 'active'" in statement
    assert "retention_hold.hold_until is null or retention_hold.hold_until > :now" in statement
    assert "report.status not in ('actioned', 'no_action', 'closed')" in statement
    assert "queue_item.state not in ('actioned', 'no_action', 'closed')" in statement
    assert "appeal.status in ('submitted', 'under_review')" in statement

    # Operational retention must not grow into participant tracking or social-graph logic.
    assert "last_seen" not in statement
    assert "latitude" not in statement
    assert "longitude" not in statement
    assert "distance" not in statement
    assert "followers" not in statement
    assert "presence" not in statement


def test_apply_runs_in_one_cleanup_transaction_and_deletes_in_fk_safe_order() -> None:
    run_id = uuid4()
    database, connection = _database_for_begin(
        [
            _mapped_one(_count_row(terminal_invites=2, closed_reports=1)),
            _scalar(run_id),
            _rowcount(1),  # appeals
            _rowcount(1),  # restrictions
            _rowcount(1),  # moderation queue
            _rowcount(1),  # reports
            _rowcount(1),  # blocks
            _rowcount(2),  # invites
            _rowcount(1),  # safety audit
            _rowcount(1),  # released holds
            MagicMock(),  # retention run completion update
        ]
    )
    repository = PostgresSocialMeetOperationsRepository(database)

    result = repository.apply_retention(
        _policy(),
        policy_version="social_meet_retention_v1",
        admin_user_id=uuid4(),
        now=NOW,
    )

    assert result.run_id == run_id
    assert result.candidate_counts.terminal_invites == 2
    assert result.deleted_counts.terminal_invites == 2
    assert result.deleted_counts.closed_reports == 1

    statements = [str(call.args[0]).lower() for call in connection.execute.call_args_list]
    delete_statements = [
        statement for statement in statements if statement.lstrip().startswith("delete")
    ]
    assert [_deleted_table(statement) for statement in delete_statements] == [
        "hg_social_meet_appeals",
        "hg_social_meet_profile_restrictions",
        "hg_social_meet_moderation_queue",
        "hg_social_meet_reports",
        "hg_social_meet_blocks",
        "hg_spotmeeting_invites",
        "hg_social_meet_safety_audit",
        "hg_social_meet_retention_holds",
    ]

    insert_call = connection.execute.call_args_list[1]
    insert_statement = str(insert_call.args[0]).lower()
    insert_params = insert_call.args[1]
    assert "hg_social_meet_retention_runs" in insert_statement
    assert "candidate_counts" in insert_params
    assert "policy_snapshot" in insert_params
    assert "profile_id" not in str(insert_params).lower()
    assert "user_id" not in str(insert_params["candidate_counts"]).lower()


@pytest.mark.parametrize(
    ("entity_type", "expected_table"),
    [
        (RetentionEntityType.INVITE, "hg_spotmeeting_invites"),
        (RetentionEntityType.BLOCK, "hg_social_meet_blocks"),
        (RetentionEntityType.REPORT, "hg_social_meet_reports"),
        (RetentionEntityType.MODERATION_QUEUE, "hg_social_meet_moderation_queue"),
        (RetentionEntityType.RESTRICTION, "hg_social_meet_profile_restrictions"),
        (RetentionEntityType.APPEAL, "hg_social_meet_appeals"),
        (RetentionEntityType.SAFETY_AUDIT, "hg_social_meet_safety_audit"),
    ],
)
def test_entity_existence_checks_only_the_canonical_table(
    entity_type: RetentionEntityType,
    expected_table: str,
) -> None:
    database, connection = _database_for_connect([_scalar(True)])
    repository = PostgresSocialMeetOperationsRepository(database)
    entity_id = uuid4()

    assert repository.entity_exists(entity_type, entity_id) is True

    statement = str(connection.execute.call_args.args[0]).lower()
    params = connection.execute.call_args.args[1]
    assert expected_table in statement
    assert params == {"entity_id": entity_id}


def _policy() -> RetentionPolicyView:
    return RetentionPolicyView(
        terminal_invite_days=180,
        removed_block_days=180,
        closed_report_days=730,
        closed_moderation_days=730,
        inactive_restriction_days=730,
        closed_appeal_days=365,
        safety_audit_days=1095,
        released_hold_days=365,
    )


def _count_row(**overrides: int) -> dict[str, int]:
    row = {field: 0 for field in RetentionCounts.model_fields}
    row.update(overrides)
    return row


def _database_for_connect(results: list[MagicMock]) -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.connect.return_value.__enter__.return_value = connection
    connection.execute.side_effect = results
    return cast(Database, database), connection


def _database_for_begin(results: list[MagicMock]) -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.begin.return_value.__enter__.return_value = connection
    connection.execute.side_effect = results
    return cast(Database, database), connection


def _mapped_one(row: dict[str, int]) -> MagicMock:
    result = MagicMock()
    result.mappings.return_value.one.return_value = row
    return result


def _scalar(value: UUID | bool) -> MagicMock:
    result = MagicMock()
    result.scalar_one.return_value = value
    return result


def _rowcount(value: int) -> MagicMock:
    result = MagicMock()
    result.rowcount = value
    return result


def _deleted_table(statement: str) -> str:
    return statement.split("delete from public.", 1)[1].split(" ", 1)[0]
