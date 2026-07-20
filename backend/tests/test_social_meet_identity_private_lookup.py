from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import MagicMock
from uuid import uuid4

from app.core.database import Database
from app.domains.social_meet.repository import PostgresSocialMeetIdentityRepository


def test_private_profile_lookup_can_resolve_non_discoverable_safety_target() -> None:
    profile_id = uuid4()
    row = {
        "user_id": uuid4(),
        "social_user_id": uuid4(),
        "profile_id": profile_id,
        "display_name": "Ada",
        "avatar_url": None,
        "short_bio": None,
        "preferred_themes": [],
        "favorite_eras": [],
        "interest_places": [],
        "learning_goals": [],
        "knowledge_badges": [],
        "knowledge_fingerprint_summary": {},
        "profile_visibility": "paused",
        "consent_version": "social_meet_identity_v1",
        "consented_at": datetime(2026, 7, 20, 10, 0, tzinfo=UTC),
        "updated_at": datetime(2026, 7, 20, 12, 0, tzinfo=UTC),
    }
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.connect.return_value.__enter__.return_value = connection
    result = MagicMock()
    result.mappings.return_value.one_or_none.return_value = row
    connection.execute.return_value = result
    repository = PostgresSocialMeetIdentityRepository(database)

    record = repository.get_profile_by_public_id(profile_id)

    assert record is not None
    assert record.profile_id == profile_id
    assert record.profile_visibility.value == "paused"
    statement = str(connection.execute.call_args.args[0]).lower()
    assert "profile_visibility = 'discoverable'" not in statement


def test_private_profile_lookup_returns_none_for_unknown_profile() -> None:
    database = MagicMock(spec=Database)
    engine = MagicMock()
    connection = MagicMock()
    database.engine = engine
    engine.connect.return_value.__enter__.return_value = connection
    result = MagicMock()
    result.mappings.return_value.one_or_none.return_value = None
    connection.execute.return_value = result
    repository = PostgresSocialMeetIdentityRepository(database)

    assert repository.get_profile_by_public_id(uuid4()) is None
