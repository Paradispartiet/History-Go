from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import cast
from unittest.mock import MagicMock
from uuid import UUID, uuid4

import pytest
from sqlalchemy.exc import DBAPIError

from app.core.database import Database
from app.domains.social_meet.abuse_models import InviteAbuseSnapshot
from app.domains.social_meet.spotmeeting_models import (
    CreateSpotmeetingInviteRequest,
    SpotmeetingContext,
    SpotmeetingContextType,
    SpotmeetingInviteRecord,
    SpotmeetingInviteState,
    SpotmeetingPresetId,
)
from app.domains.social_meet import spotmeeting_repository as repository_module
from app.domains.social_meet.spotmeeting_repository import PostgresSpotmeetingInviteRepository

NOW = datetime(2026, 7, 20, 17, 0, tzinfo=UTC)


def test_find_by_idempotency_key_maps_public_profile_ids() -> None:
    row = _joined_row()
    database, connection = _database_with_connect_results([_mapped_result(row)])
    repository = PostgresSpotmeetingInviteRepository(database)

    record = repository.find_by_idempotency_key(row["created_by"], "retry-key-0001")

    assert record is not None
    assert record.sender_profile_id == row["sender_profile_id"]
    assert record.recipient_profile_id == row["recipient_profile_id"]
    assert record.sync_version == 9
    statement = str(connection.execute.call_args.args[0])
    assert "hg_profiles sender" in statement
    assert "idempotency_key" in statement


def test_atomic_creation_rechecks_abuse_and_inserts_in_serializable_transaction(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    database, connection = _database_with_connect_results([_mapped_result(_insert_row())])
    repository = PostgresSpotmeetingInviteRepository(database)
    sender_auth = uuid4()
    recipient_auth = uuid4()
    sender_profile = uuid4()
    recipient_profile = uuid4()
    snapshot = _snapshot()

    monkeypatch.setattr(repository, "_lock_profiles", lambda *args, **kwargs: [])
    monkeypatch.setattr(repository_module, "_profiles_are_eligible", lambda *args, **kwargs: True)
    monkeypatch.setattr(
        repository,
        "_find_by_idempotency_key_on_connection",
        lambda *args, **kwargs: None,
    )
    monkeypatch.setattr(repository, "_active_block_exists", lambda *args, **kwargs: False)
    repository._abuse_repository.get_invite_creation_snapshot_on_connection = MagicMock(  # type: ignore[method-assign]
        return_value=snapshot
    )

    result = repository.create_invite_atomic(
        sender_auth_user_id=sender_auth,
        sender_profile_id=sender_profile,
        recipient_auth_user_id=recipient_auth,
        recipient_profile_id=recipient_profile,
        request=_request(recipient_profile),
        supported_consent_version="social_meet_identity_v1",
        now=NOW,
    )

    assert result.record is not None
    assert result.record.sender_profile_id == sender_profile
    assert result.record.recipient_profile_id == recipient_profile
    assert result.record.expires_at == NOW + timedelta(days=14)
    connection.exec_driver_sql.assert_called_once_with(
        "SET TRANSACTION ISOLATION LEVEL SERIALIZABLE"
    )
    repository._abuse_repository.get_invite_creation_snapshot_on_connection.assert_called_once()
    params = connection.execute.call_args.args[1]
    assert params["idempotency_key"] == "retry-key-0001"
    assert params["preset_message_id"] == "compare_place_learning"


def test_atomic_creation_returns_idempotent_replay_before_abuse_recheck(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    database, _ = _database_with_connect_results([])
    repository = PostgresSpotmeetingInviteRepository(database)
    record = _record()

    monkeypatch.setattr(repository, "_lock_profiles", lambda *args, **kwargs: [])
    monkeypatch.setattr(repository_module, "_profiles_are_eligible", lambda *args, **kwargs: True)
    monkeypatch.setattr(
        repository,
        "_find_by_idempotency_key_on_connection",
        lambda *args, **kwargs: record,
    )

    result = repository.create_invite_atomic(
        sender_auth_user_id=record.sender_auth_user_id,
        sender_profile_id=record.sender_profile_id,
        recipient_auth_user_id=record.recipient_auth_user_id,
        recipient_profile_id=record.recipient_profile_id,
        request=_request(record.recipient_profile_id),
        supported_consent_version="social_meet_identity_v1",
        now=NOW,
    )

    assert result.record == record
    assert result.replayed is True


def test_atomic_creation_rejects_idempotency_key_payload_mismatch(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    database, _ = _database_with_connect_results([])
    repository = PostgresSpotmeetingInviteRepository(database)
    record = _record()

    monkeypatch.setattr(repository, "_lock_profiles", lambda *args, **kwargs: [])
    monkeypatch.setattr(repository_module, "_profiles_are_eligible", lambda *args, **kwargs: True)
    monkeypatch.setattr(
        repository,
        "_find_by_idempotency_key_on_connection",
        lambda *args, **kwargs: record,
    )
    request = _request(record.recipient_profile_id).model_copy(
        update={
            "context": SpotmeetingContext(
                context_type=SpotmeetingContextType.PLACE,
                context_id="another_context",
                title="Another",
                reason="Different retry payload",
                source_surface="place_card",
            )
        }
    )

    result = repository.create_invite_atomic(
        sender_auth_user_id=record.sender_auth_user_id,
        sender_profile_id=record.sender_profile_id,
        recipient_auth_user_id=record.recipient_auth_user_id,
        recipient_profile_id=record.recipient_profile_id,
        request=request,
        supported_consent_version="social_meet_identity_v1",
        now=NOW,
    )

    assert result.record is None
    assert result.failure_code == "idempotency_conflict"


def test_atomic_creation_fails_closed_on_profile_block_and_abuse_policy(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    database, _ = _database_with_connect_results([])
    repository = PostgresSpotmeetingInviteRepository(database)
    sender = uuid4()
    recipient = uuid4()

    monkeypatch.setattr(repository, "_lock_profiles", lambda *args, **kwargs: [])
    monkeypatch.setattr(repository_module, "_profiles_are_eligible", lambda *args, **kwargs: False)
    unavailable = repository.create_invite_atomic(
        sender_auth_user_id=uuid4(),
        sender_profile_id=sender,
        recipient_auth_user_id=uuid4(),
        recipient_profile_id=recipient,
        request=_request(recipient),
        supported_consent_version="social_meet_identity_v1",
        now=NOW,
    )
    assert unavailable.failure_code == "recipient_unavailable"

    monkeypatch.setattr(repository_module, "_profiles_are_eligible", lambda *args, **kwargs: True)
    monkeypatch.setattr(
        repository,
        "_find_by_idempotency_key_on_connection",
        lambda *args, **kwargs: None,
    )
    monkeypatch.setattr(repository, "_active_block_exists", lambda *args, **kwargs: True)
    blocked = repository.create_invite_atomic(
        sender_auth_user_id=uuid4(),
        sender_profile_id=sender,
        recipient_auth_user_id=uuid4(),
        recipient_profile_id=recipient,
        request=_request(recipient),
        supported_consent_version="social_meet_identity_v1",
        now=NOW,
    )
    assert blocked.failure_code == "recipient_unavailable"

    monkeypatch.setattr(repository, "_active_block_exists", lambda *args, **kwargs: False)
    repository._abuse_repository.get_invite_creation_snapshot_on_connection = MagicMock(  # type: ignore[method-assign]
        return_value=_snapshot(duplicate_active_invite=True)
    )
    duplicate = repository.create_invite_atomic(
        sender_auth_user_id=uuid4(),
        sender_profile_id=sender,
        recipient_auth_user_id=uuid4(),
        recipient_profile_id=recipient,
        request=_request(recipient),
        supported_consent_version="social_meet_identity_v1",
        now=NOW,
    )
    assert duplicate.failure_code == "duplicate_active_invite"


def test_expiry_update_is_participant_scoped() -> None:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    result = MagicMock(rowcount=3)
    database.engine = engine
    engine.begin.return_value.__enter__.return_value = connection
    connection.execute.return_value = result
    repository = PostgresSpotmeetingInviteRepository(cast(Database, database))
    user_id = uuid4()

    count = repository.expire_stale_for_participant(user_id, NOW)

    assert count == 3
    statement = str(connection.execute.call_args.args[0])
    assert "created_by = :user_id or target_user_id = :user_id" in statement
    assert "expires_at <= :now" in statement


def test_list_participant_invites_uses_monotonic_sync_cursor_and_lookahead() -> None:
    rows = [_joined_row(sync_version=8), _joined_row(sync_version=9)]
    database, connection = _database_with_connect_results([_all_mapped_result(rows)])
    repository = PostgresSpotmeetingInviteRepository(database)

    records, has_more = repository.list_participant_invites(
        uuid4(),
        cursor=4,
        limit=1,
        state=SpotmeetingInviteState.PENDING,
    )

    assert len(records) == 1
    assert records[0].sync_version == 8
    assert has_more is True
    params = connection.execute.call_args.args[1]
    assert params["cursor"] == 4
    assert params["fetch_limit"] == 2
    assert params["state"] == "pending"


def test_get_participant_invite_returns_none_for_missing_record() -> None:
    database, _ = _database_with_connect_results([_mapped_result(None)])
    repository = PostgresSpotmeetingInviteRepository(database)

    assert repository.get_participant_invite(uuid4(), uuid4()) is None


def test_transition_uses_state_and_version_compare_and_swap(monkeypatch: pytest.MonkeyPatch) -> None:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.begin.return_value.__enter__.return_value = connection
    transition_result = MagicMock()
    transition_result.scalar_one_or_none.return_value = uuid4()
    connection.execute.return_value = transition_result
    repository = PostgresSpotmeetingInviteRepository(cast(Database, database))
    updated = _record(state=SpotmeetingInviteState.ACCEPTED, version=2, sync_version=10)
    monkeypatch.setattr(
        repository,
        "_get_participant_invite_on_connection",
        lambda *args, **kwargs: updated,
    )

    record = repository.transition_invite(
        auth_user_id=updated.recipient_auth_user_id,
        invite_id=updated.invite_id,
        current_state=SpotmeetingInviteState.PENDING,
        next_state=SpotmeetingInviteState.ACCEPTED,
        expected_version=1,
        now=NOW,
    )

    assert record == updated
    params = connection.execute.call_args.args[1]
    assert params["current_state"] == "pending"
    assert params["next_state"] == "accepted"
    assert params["expected_version"] == 1


def test_transition_returns_none_after_concurrent_change() -> None:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.begin.return_value.__enter__.return_value = connection
    result = MagicMock()
    result.scalar_one_or_none.return_value = None
    connection.execute.return_value = result
    repository = PostgresSpotmeetingInviteRepository(cast(Database, database))

    record = repository.transition_invite(
        auth_user_id=uuid4(),
        invite_id=uuid4(),
        current_state=SpotmeetingInviteState.PENDING,
        next_state=SpotmeetingInviteState.ACCEPTED,
        expected_version=1,
        now=NOW,
    )

    assert record is None


def test_profile_eligibility_requires_exact_auth_binding_consent_and_visibility() -> None:
    sender_auth = uuid4()
    recipient_auth = uuid4()
    sender_profile = uuid4()
    recipient_profile = uuid4()
    rows = [
        {
            "user_id": sender_auth,
            "profile_id": sender_profile,
            "profile_visibility": "discoverable",
            "consent_version": "social_meet_identity_v1",
            "deleted_at": None,
        },
        {
            "user_id": recipient_auth,
            "profile_id": recipient_profile,
            "profile_visibility": "discoverable",
            "consent_version": "social_meet_identity_v1",
            "deleted_at": None,
        },
    ]

    assert repository_module._profiles_are_eligible(
        rows,  # type: ignore[arg-type]
        sender_auth_user_id=sender_auth,
        sender_profile_id=sender_profile,
        recipient_auth_user_id=recipient_auth,
        recipient_profile_id=recipient_profile,
        supported_consent_version="social_meet_identity_v1",
    )
    rows[1]["profile_visibility"] = "paused"
    assert not repository_module._profiles_are_eligible(
        rows,  # type: ignore[arg-type]
        sender_auth_user_id=sender_auth,
        sender_profile_id=sender_profile,
        recipient_auth_user_id=recipient_auth,
        recipient_profile_id=recipient_profile,
        supported_consent_version="social_meet_identity_v1",
    )


def test_serialization_failure_detection_uses_postgres_sqlstate() -> None:
    original = RuntimeError("serialization")
    original.sqlstate = "40001"  # type: ignore[attr-defined]
    error = DBAPIError.instance("statement", {}, original, RuntimeError)

    assert repository_module._is_serialization_failure(error)


def _database_with_connect_results(results: list[MagicMock]) -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.connect.return_value.__enter__.return_value = connection
    connection.execute.side_effect = results
    return cast(Database, database), connection


def _mapped_result(row: dict[str, object] | None) -> MagicMock:
    result = MagicMock()
    result.mappings.return_value.one_or_none.return_value = row
    return result


def _all_mapped_result(rows: list[dict[str, object]]) -> MagicMock:
    result = MagicMock()
    result.mappings.return_value.all.return_value = rows
    return result


def _request(recipient_profile_id: UUID) -> CreateSpotmeetingInviteRequest:
    return CreateSpotmeetingInviteRequest(
        recipient_profile_id=recipient_profile_id,
        context=SpotmeetingContext(
            context_type=SpotmeetingContextType.PLACE,
            context_id="factory_memory",
            title="Factory Memory",
            reason="Shared learning context",
            source_surface="place_card",
        ),
        preset_message_id=SpotmeetingPresetId.COMPARE_PLACE_LEARNING,
        idempotency_key="retry-key-0001",
    )


def _record(
    *,
    state: SpotmeetingInviteState = SpotmeetingInviteState.PENDING,
    version: int = 1,
    sync_version: int = 9,
) -> SpotmeetingInviteRecord:
    row = _joined_row(state=state.value, version=version, sync_version=sync_version)
    return repository_module._map_record(cast(object, row))  # type: ignore[arg-type]


def _joined_row(
    *,
    state: str = "pending",
    version: int = 1,
    sync_version: int = 9,
) -> dict[str, object]:
    return {
        "id": uuid4(),
        "created_by": uuid4(),
        "target_user_id": uuid4(),
        "sender_profile_id": uuid4(),
        "recipient_profile_id": uuid4(),
        "context_type": "place",
        "context_id": "factory_memory",
        "context_title": "Factory Memory",
        "context_reason": "Shared learning context",
        "source_surface": "place_card",
        "preset_message_id": "compare_place_learning",
        "status": state,
        "created_at": NOW,
        "updated_at": NOW,
        "expires_at": NOW + timedelta(days=14),
        "version": version,
        "sync_version": sync_version,
        "idempotency_key": "retry-key-0001",
    }


def _insert_row() -> dict[str, object]:
    row = _joined_row()
    row.pop("sender_profile_id")
    row.pop("recipient_profile_id")
    return row


def _snapshot(*, duplicate_active_invite: bool = False) -> InviteAbuseSnapshot:
    return InviteAbuseSnapshot(
        sender_social_meet_started_at=NOW - timedelta(days=30),
        sender_minute_count=0,
        sender_hour_count=0,
        sender_day_count=0,
        pair_day_count=0,
        recipient_day_count=0,
        cancellation_day_count=0,
        duplicate_active_invite=duplicate_active_invite,
        last_declined_at=None,
        last_recipient_report_at=None,
        last_pair_block_at=None,
        unresolved_reports_against_sender=0,
    )
