from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel


class ProfileVisibility(StrEnum):
    DRAFT = "draft"
    PRIVATE = "private"
    DISCOVERABLE = "discoverable"
    PAUSED = "paused"
    BLOCKED_OR_SUSPENDED = "blocked_or_suspended"
    DELETED = "deleted"


class WritableProfileVisibility(StrEnum):
    DRAFT = "draft"
    PRIVATE = "private"
    DISCOVERABLE = "discoverable"
    PAUSED = "paused"


class ApiModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class KnowledgeFingerprint(ApiModel):
    theme_tags: list[str] = Field(default_factory=list, max_length=24)
    era_tags: list[str] = Field(default_factory=list, max_length=24)
    topic_tags: list[str] = Field(default_factory=list, max_length=24)
    route_category_tags: list[str] = Field(default_factory=list, max_length=24)
    quiz_topic_tags: list[str] = Field(default_factory=list, max_length=24)
    learning_goal_tags: list[str] = Field(default_factory=list, max_length=24)

    @field_validator("*", mode="before")
    @classmethod
    def normalize_tag_lists(cls, value: object) -> object:
        if value is None:
            return []
        if not isinstance(value, list):
            return value
        return _normalize_list(value, max_item_length=64)


class ProfileUpsertRequest(ApiModel):
    display_name: str = Field(min_length=1, max_length=80)
    avatar_ref: str | None = Field(default=None, max_length=240)
    short_bio: str | None = Field(default=None, max_length=240)
    preferred_themes: list[str] = Field(default_factory=list, max_length=24)
    favorite_eras: list[str] = Field(default_factory=list, max_length=24)
    interest_places: list[str] = Field(default_factory=list, max_length=24)
    learning_goals: list[str] = Field(default_factory=list, max_length=12)
    fingerprint_inputs: KnowledgeFingerprint = Field(default_factory=KnowledgeFingerprint)
    profile_visibility: WritableProfileVisibility = WritableProfileVisibility.DRAFT
    consent_version: str | None = Field(default=None, max_length=80)
    preview_confirmed: bool = False

    @field_validator("display_name", "avatar_ref", "short_bio", "consent_version", mode="before")
    @classmethod
    def normalize_strings(cls, value: object) -> object:
        if value is None:
            return None
        if not isinstance(value, str):
            return value
        normalized = value.strip()
        return normalized or None

    @field_validator(
        "preferred_themes",
        "favorite_eras",
        "interest_places",
        mode="before",
    )
    @classmethod
    def normalize_tag_fields(cls, value: object) -> object:
        if value is None:
            return []
        if not isinstance(value, list):
            return value
        return _normalize_list(value, max_item_length=64)

    @field_validator("learning_goals", mode="before")
    @classmethod
    def normalize_learning_goals(cls, value: object) -> object:
        if value is None:
            return []
        if not isinstance(value, list):
            return value
        return _normalize_list(value, max_item_length=120)


class CurrentSocialMeetState(ApiModel):
    user_id: UUID
    profile_id: UUID | None
    profile_visibility: ProfileVisibility
    consent_version: str | None
    consented_at: datetime | None
    can_publish_profile: bool


class PublicSocialMeetProfile(ApiModel):
    profile_id: UUID
    display_name: str
    avatar_ref: str | None
    short_bio: str | None
    preferred_themes: list[str]
    favorite_eras: list[str]
    interest_places: list[str]
    learning_goals: list[str]
    knowledge_badges: list[str]
    knowledge_fingerprint_summary: KnowledgeFingerprint
    profile_visibility: ProfileVisibility
    profile_updated_at: datetime


@dataclass(frozen=True, slots=True)
class SocialMeetProfileRecord:
    auth_user_id: UUID
    social_user_id: UUID
    profile_id: UUID | None
    display_name: str | None
    avatar_ref: str | None
    short_bio: str | None
    preferred_themes: tuple[str, ...]
    favorite_eras: tuple[str, ...]
    interest_places: tuple[str, ...]
    learning_goals: tuple[str, ...]
    knowledge_badges: tuple[str, ...]
    knowledge_fingerprint_summary: dict[str, Any]
    profile_visibility: ProfileVisibility
    consent_version: str | None
    consented_at: datetime | None
    updated_at: datetime


def _normalize_list(values: list[object], *, max_item_length: int) -> object:
    normalized: list[str] = []
    seen: set[str] = set()
    for raw_value in values:
        if not isinstance(raw_value, str):
            return values
        value = raw_value.strip()
        if not value or len(value) > max_item_length or value in seen:
            continue
        seen.add(value)
        normalized.append(value)
    return normalized
