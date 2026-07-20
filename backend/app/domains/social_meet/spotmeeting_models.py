from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import StrEnum
from uuid import UUID

from pydantic import Field, field_validator

from app.domains.social_meet.models import ApiModel

DEFAULT_INVITE_TTL = timedelta(days=14)
MAX_CONTEXT_TEXT_LENGTH = 240


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
SPOTMEETING_PRESET_IDS = frozenset(preset.preset_message_id for preset in SPOTMEETING_PRESETS)


class SpotmeetingContext(ApiModel):
    context_type: SpotmeetingContextType
    context_id: str = Field(min_length=1, max_length=180)
    title: str = Field(min_length=1, max_length=MAX_CONTEXT_TEXT_LENGTH)
    reason: str = Field(min_length=1, max_length=MAX_CONTEXT_TEXT_LENGTH)
    source_surface: str = Field(min_length=1, max_length=80)

    @field_validator("context_id", "title", "reason", "source_surface", mode="before")
    @classmethod
    def normalize_context_strings(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        return value.strip()


class CreateSpotmeetingInviteRequest(ApiModel):
    recipient_profile_id: UUID
    context: SpotmeetingContext
    preset_message_id: SpotmeetingPresetId
    idempotency_key: str = Field(min_length=8, max_length=180)

    @field_validator("idempotency_key", mode="before")
    @classmethod
    def normalize_idempotency_key(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        return value.strip()


class InviteTransitionRequest(ApiModel):
    expected_version: int | None = Field(default=None, ge=1)


class SpotmeetingActorActions(ApiModel):
    can_accept: bool = False
    can_decline: bool = False
    can_cancel: bool = False
    can_complete: bool = False
    can_report: bool = False
    can_block: bool = False


class SpotmeetingInviteView(ApiModel):
    invite_id: UUID
    sender_profile_id: UUID
    recipient_profile_id: UUID
    context: SpotmeetingContext
    preset_message_id: SpotmeetingPresetId
    state: SpotmeetingInviteState
    created_at: datetime
    updated_at: datetime
    expires_at: datetime
    version: int
    sync_version: int
    actor_can_act: SpotmeetingActorActions


class SpotmeetingInvitePage(ApiModel):
    invites: list[SpotmeetingInviteView]
    cursor: int
    has_more: bool


@dataclass(frozen=True, slots=True)
class SpotmeetingInviteRecord:
    invite_id: UUID
    sender_auth_user_id: UUID
    recipient_auth_user_id: UUID
    sender_profile_id: UUID
    recipient_profile_id: UUID
    context_type: SpotmeetingContextType
    context_id: str
    context_title: str
    context_reason: str
    source_surface: str
    preset_message_id: SpotmeetingPresetId
    state: SpotmeetingInviteState
    created_at: datetime
    updated_at: datetime
    expires_at: datetime
    version: int
    sync_version: int
    idempotency_key: str | None
