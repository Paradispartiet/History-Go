from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import Field, field_validator

from app.domains.social_meet.models import ApiModel, KnowledgeFingerprint, ProfileVisibility


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


class ReportStatus(StrEnum):
    SUBMITTED = "submitted"
    QUEUED = "queued"
    UNDER_REVIEW = "under_review"
    ACTIONED = "actioned"
    NO_ACTION = "no_action"
    APPEALED = "appealed"
    CLOSED = "closed"
    RETAINED_FOR_SAFETY = "retained_for_safety"


class SafetyContextReference(ApiModel):
    context_type: str = Field(min_length=1, max_length=40)
    context_id: str = Field(min_length=1, max_length=180)
    title: str | None = Field(default=None, max_length=240)
    reason: str | None = Field(default=None, max_length=240)
    source_surface: str | None = Field(default=None, max_length=80)

    @field_validator("context_type", "context_id", "title", "reason", "source_surface", mode="before")
    @classmethod
    def normalize_strings(cls, value: object) -> object:
        if value is None:
            return None
        if not isinstance(value, str):
            return value
        normalized = value.strip()
        return normalized or None


class CreateBlockRequest(ApiModel):
    blocked_profile_id: UUID
    scope: BlockScope = BlockScope.SOCIAL_MEET
    related_invite_id: UUID | None = None
    related_context: SafetyContextReference | None = None
    source_surface: str | None = Field(default=None, max_length=80)

    @field_validator("source_surface", mode="before")
    @classmethod
    def normalize_source_surface(cls, value: object) -> object:
        if value is None:
            return None
        if not isinstance(value, str):
            return value
        normalized = value.strip()
        return normalized or None


class BlockView(ApiModel):
    block_id: UUID
    blocked_profile_id: UUID
    scope: BlockScope
    related_invite_id: UUID | None
    related_context: SafetyContextReference | None
    status: BlockStatus
    source_surface: str | None
    created_at: datetime
    updated_at: datetime
    removed_at: datetime | None


class CreateReportRequest(ApiModel):
    reported_profile_id: UUID
    related_invite_id: UUID | None = None
    related_context: SafetyContextReference | None = None
    reason_code: ReportReasonCode
    structured_details: list[str] = Field(default_factory=list, max_length=12)
    source_surface: str | None = Field(default=None, max_length=80)

    @field_validator("structured_details", mode="before")
    @classmethod
    def normalize_structured_details(cls, value: object) -> object:
        if value is None:
            return []
        if not isinstance(value, list):
            return value
        normalized: list[str] = []
        seen: set[str] = set()
        for raw_value in value:
            if not isinstance(raw_value, str):
                return value
            detail = raw_value.strip().lower()
            if not detail or len(detail) > 64 or detail in seen:
                continue
            if not detail.replace("_", "").isalnum():
                return value
            seen.add(detail)
            normalized.append(detail)
        return normalized

    @field_validator("source_surface", mode="before")
    @classmethod
    def normalize_report_source_surface(cls, value: object) -> object:
        if value is None:
            return None
        if not isinstance(value, str):
            return value
        normalized = value.strip()
        return normalized or None


class ReportReceipt(ApiModel):
    report_id: UUID
    status: ReportStatus
    created_at: datetime


class SubmittedReportView(ApiModel):
    report_id: UUID
    reported_profile_id: UUID
    related_invite_id: UUID | None
    related_context: SafetyContextReference | None
    reason_code: ReportReasonCode
    structured_details: list[str]
    status: ReportStatus
    source_surface: str | None
    created_at: datetime
    updated_at: datetime


class ExportedInvite(ApiModel):
    invite_id: UUID
    direction: str
    counterparty_profile_id: UUID | None
    context_type: str
    context_id: str
    context_title: str | None
    source_surface: str | None
    preset_message_id: str
    status: str
    created_at: datetime
    updated_at: datetime


class OwnSocialMeetProfileExport(ApiModel):
    user_id: UUID
    profile_id: UUID | None
    display_name: str | None
    avatar_ref: str | None
    short_bio: str | None
    preferred_themes: list[str]
    favorite_eras: list[str]
    interest_places: list[str]
    learning_goals: list[str]
    knowledge_badges: list[str]
    knowledge_fingerprint_summary: KnowledgeFingerprint
    profile_visibility: ProfileVisibility
    consent_version: str | None
    consented_at: datetime | None
    profile_updated_at: datetime
    deleted_at: datetime | None


class SocialMeetExport(ApiModel):
    generated_at: datetime
    profile: OwnSocialMeetProfileExport
    blocks: list[BlockView]
    reports_submitted: list[SubmittedReportView]
    participant_invites: list[ExportedInvite]


class SocialMeetDeletionResult(ApiModel):
    status: str
    profile_id: UUID | None
    deleted_at: datetime
