from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import Field

from app.domains.social_meet.models import ApiModel
from app.domains.social_meet.safety_models import ReportReasonCode


class ModerationPriority(StrEnum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class ModerationQueueState(StrEnum):
    QUEUED = "queued"
    TRIAGED = "triaged"
    UNDER_REVIEW = "under_review"
    ACTIONED = "actioned"
    NO_ACTION = "no_action"
    APPEALED = "appealed"
    CLOSED = "closed"


class ModerationResolutionCode(StrEnum):
    NO_POLICY_VIOLATION = "no_policy_violation"
    WARNING_OR_GUIDANCE = "warning_or_guidance"
    PROFILE_SUSPENDED = "profile_suspended"
    RETAINED_FOR_SAFETY = "retained_for_safety"


class ModerationQueueAction(StrEnum):
    CLAIM = "claim"
    RELEASE = "release"
    ESCALATE = "escalate"


class RestrictionReasonCode(StrEnum):
    HARASSMENT = "harassment"
    SPAM = "spam"
    UNSAFE_BEHAVIOR = "unsafe_behavior"
    IMPERSONATION = "impersonation"
    MINOR_SAFETY = "minor_safety"
    OTHER_POLICY_VIOLATION = "other_policy_violation"
    MODERATION_POLICY = "moderation_policy"


class AppealReasonCode(StrEnum):
    INCORRECT_DECISION = "incorrect_decision"
    NEW_CONTEXT = "new_context"
    IDENTITY_ISSUE = "identity_issue"
    OTHER_POLICY_GROUND = "other_policy_ground"


class AppealStatus(StrEnum):
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    UPHELD = "upheld"
    MODIFIED = "modified"
    REVERSED = "reversed"
    CLOSED = "closed"


class AppealDecision(StrEnum):
    UPHOLD = "uphold"
    MODIFY = "modify"
    REVERSE = "reverse"


class AppealDecisionReasonCode(StrEnum):
    RESTRICTION_CONFIRMED = "restriction_confirmed"
    RESTRICTION_REDUCED = "restriction_reduced"
    RESTRICTION_REVERSED = "restriction_reversed"
    INSUFFICIENT_NEW_INFORMATION = "insufficient_new_information"


class ModerationQueueItem(ApiModel):
    queue_item_id: UUID
    report_id: UUID
    subject_profile_id: UUID
    reporter_profile_id: UUID
    related_invite_id: UUID | None
    priority: ModerationPriority
    category: ReportReasonCode
    state: ModerationQueueState
    assigned: bool
    resolution_code: ModerationResolutionCode | None
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None


class QueueActionRequest(ApiModel):
    action: ModerationQueueAction


class ResolveReportRequest(ApiModel):
    resolution_code: ModerationResolutionCode
    reason_code: RestrictionReasonCode | None = None


class SuspendProfileRequest(ApiModel):
    reason_code: RestrictionReasonCode
    source_report_id: UUID | None = None


class RestrictionView(ApiModel):
    restriction_id: UUID
    profile_id: UUID
    restriction_type: str
    status: str
    reason_code: RestrictionReasonCode
    source_report_id: UUID | None
    created_at: datetime
    updated_at: datetime
    lifted_at: datetime | None


class CreateAppealRequest(ApiModel):
    restriction_id: UUID
    reason_code: AppealReasonCode


class AppealView(ApiModel):
    appeal_id: UUID
    restriction_id: UUID
    reason_code: AppealReasonCode
    status: AppealStatus
    decision_reason_code: AppealDecisionReasonCode | None
    created_at: datetime
    updated_at: datetime
    decided_at: datetime | None


class DecideAppealRequest(ApiModel):
    decision: AppealDecision
    reason_code: AppealDecisionReasonCode


class ModerationQueueQuery(ApiModel):
    state: ModerationQueueState | None = None
    limit: int = Field(default=50, ge=1, le=100)
