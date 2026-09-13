from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from uuid import UUID

from pydantic import Field, field_validator

from app.domains.social_meet.models import ApiModel, KnowledgeFingerprint

MAX_PLACE_ID_LENGTH = 180
MAX_PLACE_PRESENCE_PEOPLE = 24


class PlacePresenceState(ApiModel):
    place_id: str
    active: bool
    expires_at: datetime | None


class PlacePresenceProfile(ApiModel):
    profile_id: UUID
    display_name: str
    avatar_ref: str | None
    short_bio: str | None
    preferred_themes: list[str]
    favorite_eras: list[str]
    learning_goals: list[str]
    knowledge_fingerprint_summary: KnowledgeFingerprint


class PlacePresenceResponse(ApiModel):
    place_id: str
    generated_at: datetime
    self_active: bool
    self_expires_at: datetime | None
    people: list[PlacePresenceProfile]


class PlacePresencePath(ApiModel):
    place_id: str = Field(min_length=1, max_length=MAX_PLACE_ID_LENGTH)

    @field_validator("place_id", mode="before")
    @classmethod
    def normalize_place_id(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        return value.strip()


@dataclass(frozen=True, slots=True)
class PlacePresenceProfileRecord:
    profile_id: UUID
    display_name: str
    avatar_ref: str | None
    short_bio: str | None
    preferred_themes: tuple[str, ...]
    favorite_eras: tuple[str, ...]
    learning_goals: tuple[str, ...]
    knowledge_fingerprint_summary: dict[str, object]
