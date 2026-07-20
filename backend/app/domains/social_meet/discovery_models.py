from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import Field, field_validator

from app.domains.social_meet.models import ApiModel, KnowledgeFingerprint
from app.domains.social_meet.spotmeeting_models import SpotmeetingContextType

MAX_DISCOVERY_CANDIDATES = 20
MAX_DISCOVERY_TAGS_PER_GROUP = 16
MAX_DISCOVERY_TAG_LENGTH = 64


class DiscoveryMatchReason(StrEnum):
    CONTEXT_THEME = "context_theme"
    CONTEXT_ERA = "context_era"
    CONTEXT_TOPIC = "context_topic"
    CONTEXT_ROUTE_CATEGORY = "context_route_category"
    CONTEXT_QUIZ_TOPIC = "context_quiz_topic"
    CONTEXT_LEARNING_GOAL = "context_learning_goal"
    SHARED_THEME = "shared_theme"
    SHARED_ERA = "shared_era"
    SHARED_LEARNING_GOAL = "shared_learning_goal"


class DiscoveryContextSignals(ApiModel):
    context_type: SpotmeetingContextType
    context_id: str = Field(min_length=1, max_length=180)
    theme_tags: list[str] = Field(default_factory=list, max_length=MAX_DISCOVERY_TAGS_PER_GROUP)
    era_tags: list[str] = Field(default_factory=list, max_length=MAX_DISCOVERY_TAGS_PER_GROUP)
    topic_tags: list[str] = Field(default_factory=list, max_length=MAX_DISCOVERY_TAGS_PER_GROUP)
    route_category_tags: list[str] = Field(
        default_factory=list,
        max_length=MAX_DISCOVERY_TAGS_PER_GROUP,
    )
    quiz_topic_tags: list[str] = Field(
        default_factory=list,
        max_length=MAX_DISCOVERY_TAGS_PER_GROUP,
    )
    learning_goal_tags: list[str] = Field(
        default_factory=list,
        max_length=MAX_DISCOVERY_TAGS_PER_GROUP,
    )

    @field_validator("context_id", mode="before")
    @classmethod
    def normalize_context_id(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        return value.strip()

    @field_validator(
        "theme_tags",
        "era_tags",
        "topic_tags",
        "route_category_tags",
        "quiz_topic_tags",
        "learning_goal_tags",
        mode="before",
    )
    @classmethod
    def normalize_tag_groups(cls, value: object) -> object:
        if value is None:
            return []
        if not isinstance(value, list):
            return value

        normalized: list[str] = []
        seen: set[str] = set()
        for raw_value in value:
            if not isinstance(raw_value, str):
                return value
            tag = raw_value.strip().lower()
            if not tag or len(tag) > MAX_DISCOVERY_TAG_LENGTH or tag in seen:
                continue
            seen.add(tag)
            normalized.append(tag)
        return normalized


class ContextCandidateRequest(ApiModel):
    context: DiscoveryContextSignals
    limit: int = Field(default=10, ge=1, le=MAX_DISCOVERY_CANDIDATES)


class DiscoveryCandidateProfile(ApiModel):
    profile_id: UUID
    display_name: str
    avatar_ref: str | None
    short_bio: str | None
    preferred_themes: list[str]
    favorite_eras: list[str]
    learning_goals: list[str]
    knowledge_fingerprint_summary: KnowledgeFingerprint
    profile_updated_at: datetime


class DiscoveryCandidate(ApiModel):
    profile: DiscoveryCandidateProfile
    match_reasons: list[DiscoveryMatchReason]


class ContextCandidateResponse(ApiModel):
    context_type: SpotmeetingContextType
    context_id: str
    generated_at: datetime
    candidates: list[DiscoveryCandidate]


@dataclass(frozen=True, slots=True)
class DiscoveryFeatureGate:
    enabled: bool
    rollout_percent: int
    allowed_profile_ids: frozenset[UUID]


@dataclass(frozen=True, slots=True)
class DiscoveryCandidateRecord:
    profile_id: UUID
    display_name: str
    avatar_ref: str | None
    short_bio: str | None
    preferred_themes: tuple[str, ...]
    favorite_eras: tuple[str, ...]
    learning_goals: tuple[str, ...]
    knowledge_fingerprint_summary: dict[str, object]
    updated_at: datetime
    match_reasons: tuple[DiscoveryMatchReason, ...]
    score: int
