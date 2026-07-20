from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from typing import Any
from uuid import UUID

from pydantic import Field, field_validator

from app.domains.social_meet.models import ApiModel


class SafetyContextType(StrEnum):
    PLACE = "place"
    QUIZ = "quiz"
    ROUTE = "route"
    OBSERVATION = "observation"
    TOPIC = "topic"
    CIRCLE = "circle"


class BlockScope(StrEnum):
    SOCIAL_MEET = "social_meet"
    SPOTMEETING_INVITES = "spotmeeting_invites"


class BlockStatus(StrEnum):
    ACTIVE = "active"
    REMOVED_BY_BLOCKER = "removed_by_blocker"
    EXPIRED_BY_POLICY = "expired_by_policy"
    SUPERSEDED_BY_MODERATION = "superseded_by_moderation"


class ReportReasonCode(StrEnum):
    HARASSMENT = "harassment"
    SPAM = "spam"
    UNSAFE_BEHAVIOR = "unsafe_behavior"
    IMPERSONATION = "impersonation"
    MINOR_SAFETY = "minor_safety"
    OTHER_POLICY_VIOLATION = "other_policy_violation"


class StructuredReportDetail(StrEnum):
    REPEATED_UNWANTED_INVITES = "repeated_unwanted_invites"
    THREATENING_BEHAVIOR = "threatening_behavior"
    IDENTITY_MISREPRESENTATION = "identity_misrepresentation"
    INAPPROPRIATE_PROFILE_CONTENT = "inappropriate_profile_content"
    MINOR_SAFETY_CONCERN = "minor_safety_concern"
    SPAM_PATTERN = "spam_pattern"


class ReportStatus(StrEnum):
    SUBMITTED = "submitted"
    QUEUED = "queued"
    UNDER_REVIEW = "under_review"
    ACTIONED = "actioned"
    NO_ACTION = "no_action"
    APPEALED = "appealed"
    CLOSED = "closed"
    RETAINED_FOR_SAFETY = "retained_for_safety"


class SafetyContext(ApiModel):
    context_type: SafetyContextType
    context_id: str = Field(min_length=1, max_length=160)
    title: str | None = Field(default=None, max_length=160)
    reason: str | None = Field(default=None, max_length=240)
    source_surface: str | None = Field(default=None, max_length=80)

    @field_validator("context_id", "title", "reason", "source_surface", mode="before")
    @classmethod
    def normalize_strings(cls, value: object) -> object:
        if value is None or not isinstance(value, str):
            return value
        normalized = value.strip()
        return normalized or None


class BlockCreateRequest(ApiModel):
    blocked_profile_id: UUID
    scope: BlockScope = BlockScope.SOCIAL_MEET
    related_invite_id: UUID | None = None
    related_context: SafetyContext | None = None
    source_surface: str | None = Field(default=None, max_length=80)

    @field_validator("source_surface", mode="before")
    @classmethod
    def normalize_source_surface(cls, value: object) -> object:
        if value is None or not isinstance(value, str):
            return value
        normalized = value.strip()
        return normalized or None


class ReportCreateRequest(ApiModel):
    reported_profile_id: UUID
    related_invite_id: UUID | None = None
    related_context: SafetyContext | None = None
    reason_code: ReportReasonCode
    structured_details: list[StructuredReportDetail] = Field(default_factory=list, max_length=8)
    source_surface: str | None = Field(default=None, max_length=80)

    @field_validator("source_surface", mode="before")
    @classmethod
    def normalize_source_surface(cls, value: object) -> object:
        if value is None or not isinstance(value, str):
            return value
        normalized = value.strip()
        return normalized or None


class SocialMeetBlockView(ApiModel):
    block_id: UUID
    blocked_profile_id: UUID
    scope: BlockScope
    related_invite_id: UUID | None
    related_context: SafetyContext | None
    status: BlockStatus
    created_at: datetime
    updated_at: datetime
    removed_at: datetime | None


class SubmittedReportView(ApiModel):
    report_id: UUID
    reported_profile_id: UUID
    reason_code: ReportReasonCode
    structured_details: list[StructuredReportDetail]
    status: ReportStatus
    created_at: datetime
    updated_at: datetime


@dataclass(frozen=True, slots=True)
class SocialMeetBlockRecord:
    block_id: UUID
    blocker_profile_id: UUID
    blocked_profile_id: UUID
    scope: BlockScope
    related_invite_id: UUID | None
    related_context: dict[str, Any] | None
    status: BlockStatus
    source_surface: str | None
    created_at: datetime
    updated_at: datetime
    removed_at: datetime | None


@dataclass(frozen=True, slots=True)
class SocialMeetReportRecord:
    report_id: UUID
    reporter_profile_id: UUID
    reported_profile_id: UUID
    related_invite_id: UUID | None
    related_context: dict[str, Any] | None
    reason_code: ReportReasonCode
    structured_details: tuple[StructuredReportDetail, ...]
    source_surface: str | None
    status: ReportStatus
    created_at: datetime
    updated_at: datetime
