from __future__ import annotations

from datetime import UTC, datetime
from typing import cast
from unittest.mock import MagicMock
from uuid import UUID, uuid4

from app.core.database import Database
from app.domains.social_meet.models import ProfileUpsertRequest, ProfileVisibility
from app.domains.social_meet.repository import PostgresSocialMeetIdentityRepository


def test_get_or_create_maps_existing_hg_profile_identity() -> None:
    row = _row()
    database, connection = _database_with_begin_results(row)
    repository = PostgresSocialMeetIdentityRepository(database)

    record = repository.get_or_create_for_user(cast(UUID, row["user_id"]))

    assert record.auth_user_id == row["user_id"]
    assert record.social_user_id == row["social_user_id"]
    assert record.profile_id == row["profile_id"]
    assert record.profile_visibility is ProfileVisibility.DISCOVERABLE
    assert connection.execute.call_count == 2


def test_save_profile_updates_existing_row_without_new_profile_table() -> None:
    row = _row()
    database, connection = _database_with_begin_results(row)
    repository = PostgresSocialMeetIdentityRepository(database)
    profile = ProfileUpsertRequest.model_validate(
        {
            "displayName": "Ada",
            "profileVisibility": "discoverable",
            "consentVersion": "social_meet_identity_v1",
            "previewConfirmed": True,
            "fingerprintInputs": {"themeTags": ["industrial_history"]},
        }
    )
    consented_at = datetime(2026, 7, 20, 11, 0, tzinfo=UTC)

    record = repository.save_profile(
        cast(UUID, row["user_id"]),
        profile,
        consented_at=consented_at,
    )

    assert record.display_name == "Ada"
    assert record.knowledge_fingerprint_summary == {"themeTags": ["industrial_history"]}
    assert connection.execute.call_count == 2
    update_params = connection.execute.call_args_list[1].args[1]
    assert update_params["consented_at"] == consented_at
    assert update_params["profile_visibility"] == "discoverable"


def test_discoverable_profile_lookup_is_public_profile_id_scoped() -> None:
    row = _row()
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.connect.return_value.__enter__.return_value = connection
    result = MagicMock()
    result.mappings.return_value.one_or_none.return_value = row
    connection.execute.return_value = result
    repository = PostgresSocialMeetIdentityRepository(database)

    record = repository.get_discoverable_profile(cast(UUID, row["profile_id"]))

    assert record is not None
    assert record.profile_id == row["profile_id"]
    params = connection.execute.call_args.args[1]
    assert params == {"profile_id": row["profile_id"]}


def test_discoverable_profile_lookup_returns_none_without_leaking_private_row() -> None:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.connect.return_value.__enter__.return_value = connection
    result = MagicMock()
    result.mappings.return_value.one_or_none.return_value = None
    connection.execute.return_value = result
    repository = PostgresSocialMeetIdentityRepository(database)

    assert repository.get_discoverable_profile(uuid4()) is None


def test_unpublish_only_changes_visibility() -> None:
    row = _row(profile_visibility="private")
    database = MagicMock(spec=Database)
    engine = MagicMock()
    database.engine = engine
    connection = MagicMock()
    engine.begin.return_value.__enter__.return_value = connection
    result = MagicMock()
    result.mappings.return_value.one.return_value = row
    connection.execute.return_value = result
    repository = PostgresSocialMeetIdentityRepository(database)
    repository.get_or_create_for_user = MagicMock(return_value=None)  # type: ignore[method-assign]

    record = repository.unpublish(cast(UUID, row["user_id"]))

    assert record.profile_visibility is ProfileVisibility.PRIVATE
    assert connection.execute.call_count == 1


def test_repository_maps_json_string_fingerprint_from_driver() -> None:
    row = _row(knowledge_fingerprint_summary='{"themeTags":["industry"]}')
    database, _ = _database_with_begin_results(row)
    repository = PostgresSocialMeetIdentityRepository(database)

    record = repository.get_or_create_for_user(cast(UUID, row["user_id"]))

    assert record.knowledge_fingerprint_summary == {"themeTags": ["industry"]}


def _database_with_begin_results(row: dict[str, object]) -> tuple[Database, MagicMock]:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.begin.return_value.__enter__.return_value = connection

    insert_result = MagicMock()
    mapped_result = MagicMock()
    mapped_result.mappings.return_value.one.return_value = row
    connection.execute.side_effect = [insert_result, mapped_result]
    return cast(Database, database), connection


def _row(**overrides: object) -> dict[str, object]:
    row: dict[str, object] = {
        "user_id": uuid4(),
        "social_user_id": uuid4(),
        "profile_id": uuid4(),
        "display_name": "Ada",
        "avatar_url": "avatar_generated_01",
        "short_bio": "Industrial history",
        "preferred_themes": ["industrial_history"],
        "favorite_eras": ["late_1800s"],
        "interest_places": ["factory_towns"],
        "learning_goals": ["compare_sources"],
        "knowledge_badges": [],
        "knowledge_fingerprint_summary": {"themeTags": ["industrial_history"]},
        "profile_visibility": "discoverable",
        "consent_version": "social_meet_identity_v1",
        "consented_at": datetime(2026, 7, 20, 10, 0, tzinfo=UTC),
        "updated_at": datetime(2026, 7, 20, 12, 0, tzinfo=UTC),
    }
    row.update(overrides)
    return row
