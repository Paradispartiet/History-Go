from __future__ import annotations

import json
from collections.abc import Mapping
from datetime import datetime
from typing import Any, Protocol, cast
from uuid import UUID

from sqlalchemy import text

from app.core.database import Database
from app.domains.social_meet.models import (
    ProfileUpsertRequest,
    ProfileVisibility,
    SocialMeetProfileRecord,
)

_PROFILE_COLUMNS = """
    user_id,
    social_user_id,
    profile_id,
    display_name,
    avatar_url,
    short_bio,
    preferred_themes,
    favorite_eras,
    interest_places,
    learning_goals,
    knowledge_badges,
    knowledge_fingerprint_summary,
    profile_visibility,
    consent_version,
    consented_at,
    updated_at
"""


class SocialMeetIdentityRepository(Protocol):
    def get_or_create_for_user(self, auth_user_id: UUID) -> SocialMeetProfileRecord: ...

    def save_profile(
        self,
        auth_user_id: UUID,
        profile: ProfileUpsertRequest,
        *,
        consented_at: datetime | None,
    ) -> SocialMeetProfileRecord: ...

    def get_discoverable_profile(
        self, profile_id: UUID
    ) -> SocialMeetProfileRecord | None: ...

    def unpublish(self, auth_user_id: UUID) -> SocialMeetProfileRecord: ...


class PostgresSocialMeetIdentityRepository:
    """Persistence for Social Meet identity using the existing hg_profiles table."""

    def __init__(self, database: Database) -> None:
        self._database = database

    def get_or_create_for_user(self, auth_user_id: UUID) -> SocialMeetProfileRecord:
        with self._database.engine.begin() as connection:
            connection.execute(
                text(
                    """
                    insert into public.hg_profiles (user_id)
                    values (:user_id)
                    on conflict (user_id) do nothing
                    """
                ),
                {"user_id": auth_user_id},
            )
            row = (
                connection.execute(
                    text(
                        f"""
                    select {_PROFILE_COLUMNS}
                    from public.hg_profiles
                    where user_id = :user_id
                    """
                    ),
                    {"user_id": auth_user_id},
                )
                .mappings()
                .one()
            )
        return _map_record(row)

    def save_profile(
        self,
        auth_user_id: UUID,
        profile: ProfileUpsertRequest,
        *,
        consented_at: datetime | None,
    ) -> SocialMeetProfileRecord:
        fingerprint_json = json.dumps(
            profile.fingerprint_inputs.model_dump(mode="json")
        )
        params: dict[str, object] = {
            "user_id": auth_user_id,
            "display_name": profile.display_name,
            "avatar_url": profile.avatar_ref,
            "short_bio": profile.short_bio,
            "preferred_themes": profile.preferred_themes,
            "favorite_eras": profile.favorite_eras,
            "interest_places": profile.interest_places,
            "learning_goals": profile.learning_goals,
            "fingerprint": fingerprint_json,
            "profile_visibility": profile.profile_visibility.value,
            "consent_version": profile.consent_version,
            "consented_at": consented_at,
        }

        with self._database.engine.begin() as connection:
            connection.execute(
                text(
                    """
                    insert into public.hg_profiles (user_id)
                    values (:user_id)
                    on conflict (user_id) do nothing
                    """
                ),
                {"user_id": auth_user_id},
            )
            row = (
                connection.execute(
                    text(
                        f"""
                    update public.hg_profiles
                    set
                      profile_id = coalesce(profile_id, gen_random_uuid()),
                      display_name = :display_name,
                      avatar_url = :avatar_url,
                      short_bio = :short_bio,
                      preferred_themes = :preferred_themes,
                      favorite_eras = :favorite_eras,
                      interest_places = :interest_places,
                      learning_goals = :learning_goals,
                      knowledge_fingerprint_summary = cast(:fingerprint as jsonb),
                      profile_visibility = :profile_visibility,
                      consent_version = coalesce(:consent_version, consent_version),
                      consented_at = coalesce(:consented_at, consented_at)
                    where user_id = :user_id
                    returning {_PROFILE_COLUMNS}
                    """
                    ),
                    params,
                )
                .mappings()
                .one()
            )
        return _map_record(row)

    def get_discoverable_profile(
        self, profile_id: UUID
    ) -> SocialMeetProfileRecord | None:
        with self._database.engine.connect() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                    select {_PROFILE_COLUMNS}
                    from public.hg_profiles
                    where profile_id = :profile_id
                      and profile_visibility = 'discoverable'
                    """
                    ),
                    {"profile_id": profile_id},
                )
                .mappings()
                .one_or_none()
            )
        return _map_record(row) if row is not None else None

    def unpublish(self, auth_user_id: UUID) -> SocialMeetProfileRecord:
        self.get_or_create_for_user(auth_user_id)
        with self._database.engine.begin() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                    update public.hg_profiles
                    set profile_visibility = 'private'
                    where user_id = :user_id
                    returning {_PROFILE_COLUMNS}
                    """
                    ),
                    {"user_id": auth_user_id},
                )
                .mappings()
                .one()
            )
        return _map_record(row)


def _map_record(row: Mapping[str, Any]) -> SocialMeetProfileRecord:
    raw_fingerprint = row.get("knowledge_fingerprint_summary") or {}
    if isinstance(raw_fingerprint, str):
        parsed_fingerprint = json.loads(raw_fingerprint)
    else:
        parsed_fingerprint = raw_fingerprint

    return SocialMeetProfileRecord(
        auth_user_id=cast(UUID, row["user_id"]),
        social_user_id=cast(UUID, row["social_user_id"]),
        profile_id=cast(UUID | None, row.get("profile_id")),
        display_name=_optional_string(row.get("display_name")),
        avatar_ref=_optional_string(row.get("avatar_url")),
        short_bio=_optional_string(row.get("short_bio")),
        preferred_themes=_string_tuple(row.get("preferred_themes")),
        favorite_eras=_string_tuple(row.get("favorite_eras")),
        interest_places=_string_tuple(row.get("interest_places")),
        learning_goals=_string_tuple(row.get("learning_goals")),
        knowledge_badges=_string_tuple(row.get("knowledge_badges")),
        knowledge_fingerprint_summary=cast(dict[str, Any], parsed_fingerprint),
        profile_visibility=ProfileVisibility(str(row["profile_visibility"])),
        consent_version=_optional_string(row.get("consent_version")),
        consented_at=cast(datetime | None, row.get("consented_at")),
        updated_at=cast(datetime, row["updated_at"]),
    )


def _optional_string(value: object) -> str | None:
    if value is None:
        return None
    normalized = str(value).strip()
    return normalized or None


def _string_tuple(value: object) -> tuple[str, ...]:
    if not isinstance(value, list | tuple):
        return ()
    return tuple(str(item) for item in value if str(item).strip())
