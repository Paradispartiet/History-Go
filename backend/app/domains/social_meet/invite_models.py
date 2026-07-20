from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import Field, field_validator

from app.domains.social_meet.models import ApiModel


class SpotmeetingContextType(StrEnum):
    PLACE = "place"
    QUIZ = "quiz"
    ROUTE = "route"
    OBSERVATION = "observation"
    TOPIC = "topic"
    CIRCLE = "circle"


class SpotmeetingInviteState(StrEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    EXPIRED = "expired"
    REPORTED = "reported"
    BLOCKED = "blocked"


class SpotmeetingInviteAction(StrEnum):
    ACCEPT = "accept"
    DECLINE = "decline"
    CANCEL = "cancel"
    COMPLETE = "complete"
    REPORT = "report"


class SpotmeetingPresetId(StrEnum):
    QUIZ_TOGETHER = "quiz_together"
    ROUTE_ONE_DAY = "route_one_day"
    COMPARE_PLACE_LEARNING = "compare_place_learning"
    SHARED_OBSERVATION = "shared_observation"
    MEET_TOPIC = "meet_topic"


class SpotmeetingPreset(ApiModel):
    preset_message_id: SpotmeetingPresetId
    label: str


SPOTMEETING_PRESETS: tuple[SpotmeetingPreset, ...] = (
    SpotmeetingPreset(
        preset_message_id=SpotmeetingPresetId.QUIZ_TOGETHER,
        label="Vil du ta denne quizen sammen?",
    ),
    SpotmeetingPreset(
        preset_message_id=SpotmeetingPresetId.ROUTE_ONE_DAY,
        label="Vil du gå denne ruten en dag?",
    ),
    SpotmeetingPreset(
        preset_message_id=SpotmeetingPresetId.COMPARE_PLACE_LEARNING,
        label="Vil du sammenligne hva vi har lært om dette stedet?",
    ),
    SpotmeetingPreset(
        preset_message_id=SpotmeetingPresetId.SHARED_OBSERVATION,
        label="Vil du gjøre en felles observasjon her?",
    ),
    SpotmeetingPreset(
        preset_message_id=SpotmeetingPresetId.MEET_TOPIC,
        label="Vil du møtes rundt dette temaet?",
    ),
)


class SpotmeetingInviteContext(ApiModel):
    context_type: SpotmeetingContextType
    context_id: str = Field(min_length=1, max_length=180)
    title: str | None = Field(default=None, max_length=240)
    reason: str | None = Field(default=None, max_length=240)
    source_surface: str | None = Field(default=None, max_length=80)

    @field_validator("context_id", "title", "reason", "source_surface", mode="before")
    @classmethod
    def normalize_strings(cls, value: object) -> object:
        if value is None:
            return None
        if not isinstance(value, str):
            return value
        normalized = value.strip()
        return normalized or None


class CreateSpotmeetingInviteRequest(ApiModel):
    recipient_profile_id: UUID
    context: SpotmeetingInviteContext
    preset_message_id: SpotmeetingPresetId
    idempotency_key: str = Field(min_length=8, max_length=120)

    @field_validator("idempotency_key", mode="before")
    @classmethod
    def normalize_idempotency_key(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        return value.strip()


class SpotmeetingInviteView(ApiModel):
    invite_id: UUID
    sender_profile_id: UUID
    recipient_profile_id: UUID
    context: SpotmeetingInviteContext
    preset_message_id: SpotmeetingPresetId
    state: SpotmeetingInviteState
    created_at: datetime
    updated_at: datetime
    expires_at: datetime
    sync_version: int
    allowed_actions: list[SpotmeetingInviteAction]


class SpotmeetingInboxPage(ApiModel):
    invites: list[SpotmeetingInviteView]
    cursor: int
    has_more: bool
