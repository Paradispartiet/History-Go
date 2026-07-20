from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import Field, field_validator

from app.domains.social_meet.models import ApiModel

RETENTION_POLICY_VERSION = "social_meet_retention_v1"


class RetentionEntityType(StrEnum):
    INVITE = "invite"
    BLOCK = "block"
    REPORT = "report"
    MODERATION_QUEUE = "moderation_queue"
    RESTRICTION = "restriction"
    APPEAL = "appeal"
    SAFETY_AUDIT = "safety_audit"


class RetentionHoldReason(StrEnum):
    LEGAL_HOLD = "legal_hold"
    SAFETY_REVIEW = "safety_review"
    APPEAL_REVIEW = "appeal_review"
    INCIDENT_REVIEW = "incident_review"
    MANUAL_POLICY = "manual_policy"


class RetentionHoldStatus(StrEnum):
    ACTIVE = "active"
    RELEASED = "released"


class RetentionPolicyView(ApiModel):
    terminal_invite_days: int
    removed_block_days: int
    closed_report_days: int
    closed_moderation_days: int
    inactive_restriction_days: int
    closed_appeal_days: int
    safety_audit_days: int
    released_hold_days: int


class RetentionCounts(ApiModel):
    terminal_invites: int = 0
    removed_blocks: int = 0
    closed_reports: int = 0
    closed_moderation_queue: int = 0
    inactive_restrictions: int = 0
    closed_appeals: int = 0
    safety_audit_events: int = 0
    released_holds: int = 0


class RetentionPreview(ApiModel):
    generated_at: datetime
    policy_version: str
    policy: RetentionPolicyView
    candidate_counts: RetentionCounts
    active_holds: int


class ApplyRetentionRequest(ApiModel):
    confirm_policy_version: str = Field(min_length=1, max_length=80)

    @field_validator("confirm_policy_version", mode="before")
    @classmethod
    def normalize_policy_version(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


class RetentionRunResult(ApiModel):
    run_id: UUID
    mode: str
    policy_version: str
    started_at: datetime
    completed_at: datetime
    candidate_counts: RetentionCounts
    deleted_counts: RetentionCounts


class CreateRetentionHoldRequest(ApiModel):
    entity_type: RetentionEntityType
    entity_id: UUID
    reason_code: RetentionHoldReason
    hold_until: datetime | None = None


class RetentionHoldView(ApiModel):
    hold_id: UUID
    entity_type: RetentionEntityType
    entity_id: UUID
    reason_code: RetentionHoldReason
    status: RetentionHoldStatus
    hold_until: datetime | None
    created_at: datetime
    released_at: datetime | None


class AggregateStatusCounts(ApiModel):
    values: dict[str, int] = Field(default_factory=dict)


class LastRetentionRun(ApiModel):
    run_id: UUID
    status: str
    completed_at: datetime | None
    deleted_total: int


class SocialMeetOperationalMetrics(ApiModel):
    generated_at: datetime
    profile_visibility: AggregateStatusCounts
    invite_states: AggregateStatusCounts
    report_states: AggregateStatusCounts
    moderation_queue_states: AggregateStatusCounts
    active_blocks: int
    active_restrictions: int
    open_appeals: int
    active_retention_holds: int
    retention_candidates: RetentionCounts
    last_retention_run: LastRetentionRun | None
