from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from app.domains.social_meet.models import (
    KnowledgeFingerprint,
    ProfileVisibility,
    SocialMeetProfileRecord,
)
from app.domains.social_meet.repository import SocialMeetIdentityRepository
from app.domains.social_meet.safety_models import (
    BlockView,
    CreateBlockRequest,
    CreateReportRequest,
    OwnSocialMeetProfileExport,
    ReportReceipt,
    SocialMeetDeletionResult,
    SocialMeetExport,
    SubmittedReportView,
)
from app.domains.social_meet.safety_repository import SocialMeetSafetyRepository
from app.domains.social_meet.service import SocialMeetDomainError


class SocialMeetSafetyService:
    def __init__(
        self,
        identity_repository: SocialMeetIdentityRepository,
        safety_repository: SocialMeetSafetyRepository,
    ) -> None:
        self._identity_repository = identity_repository
        self._safety_repository = safety_repository

    def list_blocks(self, auth_user_id: UUID) -> list[BlockView]:
        actor = self._actor(auth_user_id)
        actor_profile_id = _require_profile_id(actor)
        return self._safety_repository.list_blocks(actor_profile_id)

    def create_block(self, auth_user_id: UUID, request: CreateBlockRequest) -> BlockView:
        actor = self._actor(auth_user_id)
        actor_profile_id = _require_profile_id(actor)
        self._validate_target(actor_profile_id, request.blocked_profile_id, action="block")
        return self._safety_repository.create_block(actor_profile_id, request)

    def remove_block(self, auth_user_id: UUID, block_id: UUID) -> BlockView:
        actor_profile_id = _require_profile_id(self._actor(auth_user_id))
        block = self._safety_repository.remove_block(actor_profile_id, block_id)
        if block is None:
            raise SocialMeetDomainError(
                code="block_not_found",
                detail="The requested block record is not available",
            )
        return block

    def interaction_is_blocked(self, first_profile_id: UUID, second_profile_id: UUID) -> bool:
        return self._safety_repository.interaction_is_blocked(first_profile_id, second_profile_id)

    def ensure_interaction_allowed(self, first_profile_id: UUID, second_profile_id: UUID) -> None:
        first = self._identity_repository.get_profile_by_public_id(first_profile_id)
        second = self._identity_repository.get_profile_by_public_id(second_profile_id)
        restricted_states = {
            ProfileVisibility.BLOCKED_OR_SUSPENDED,
            ProfileVisibility.DELETED,
        }
        if (
            first is None
            or second is None
            or first.profile_visibility in restricted_states
            or second.profile_visibility in restricted_states
        ):
            raise SocialMeetDomainError(
                code="moderation_restricted",
                detail="The requested Social Meet interaction is unavailable",
            )
        if self.interaction_is_blocked(first_profile_id, second_profile_id):
            raise SocialMeetDomainError(
                code="interaction_blocked",
                detail="The requested Social Meet interaction is unavailable",
            )

    def create_report(self, auth_user_id: UUID, request: CreateReportRequest) -> ReportReceipt:
        actor_profile_id = _require_profile_id(self._actor(auth_user_id))
        self._validate_target(actor_profile_id, request.reported_profile_id, action="report")
        report = self._safety_repository.create_report(actor_profile_id, request)
        return ReportReceipt(
            report_id=report.report_id,
            status=report.status,
            created_at=report.created_at,
        )

    def list_submitted_reports(self, auth_user_id: UUID) -> list[SubmittedReportView]:
        actor_profile_id = _require_profile_id(self._actor(auth_user_id))
        return self._safety_repository.list_submitted_reports(actor_profile_id)

    def get_submitted_report(self, auth_user_id: UUID, report_id: UUID) -> SubmittedReportView:
        actor_profile_id = _require_profile_id(self._actor(auth_user_id))
        report = self._safety_repository.get_submitted_report(actor_profile_id, report_id)
        if report is None:
            raise SocialMeetDomainError(
                code="report_not_found",
                detail="The requested report is not available",
            )
        return report

    def export_current_user(
        self,
        auth_user_id: UUID,
        *,
        now: datetime | None = None,
    ) -> SocialMeetExport:
        actor = self._actor(auth_user_id)
        deleted_at = self._safety_repository.get_deleted_at(auth_user_id)
        fingerprint = KnowledgeFingerprint.model_validate(actor.knowledge_fingerprint_summary)
        profile = OwnSocialMeetProfileExport(
            user_id=actor.social_user_id,
            profile_id=actor.profile_id,
            display_name=actor.display_name,
            avatar_ref=actor.avatar_ref,
            short_bio=actor.short_bio,
            preferred_themes=list(actor.preferred_themes),
            favorite_eras=list(actor.favorite_eras),
            interest_places=list(actor.interest_places),
            learning_goals=list(actor.learning_goals),
            knowledge_badges=list(actor.knowledge_badges),
            knowledge_fingerprint_summary=fingerprint,
            profile_visibility=actor.profile_visibility,
            consent_version=actor.consent_version,
            consented_at=actor.consented_at,
            profile_updated_at=actor.updated_at,
            deleted_at=deleted_at,
        )
        blocks = (
            self._safety_repository.list_blocks(actor.profile_id)
            if actor.profile_id is not None
            else []
        )
        reports = (
            self._safety_repository.list_submitted_reports(actor.profile_id)
            if actor.profile_id is not None
            else []
        )
        return SocialMeetExport(
            generated_at=now or datetime.now(UTC),
            profile=profile,
            blocks=blocks,
            reports_submitted=reports,
            participant_invites=self._safety_repository.list_participant_invites(auth_user_id),
        )

    def delete_social_meet_account(
        self,
        auth_user_id: UUID,
        *,
        now: datetime | None = None,
    ) -> SocialMeetDeletionResult:
        actor = self._actor(auth_user_id)
        existing_deleted_at = self._safety_repository.get_deleted_at(auth_user_id)
        if existing_deleted_at is not None:
            return SocialMeetDeletionResult(
                status="deleted",
                profile_id=actor.profile_id,
                deleted_at=existing_deleted_at,
            )

        deleted_at = now or datetime.now(UTC)
        profile_id = self._safety_repository.mark_social_meet_deleted(auth_user_id, deleted_at)
        return SocialMeetDeletionResult(
            status="deleted",
            profile_id=profile_id,
            deleted_at=deleted_at,
        )

    def _actor(self, auth_user_id: UUID) -> SocialMeetProfileRecord:
        return self._identity_repository.get_or_create_for_user(auth_user_id)

    def _validate_target(
        self,
        actor_profile_id: UUID,
        target_profile_id: UUID,
        *,
        action: str,
    ) -> None:
        if actor_profile_id == target_profile_id:
            raise SocialMeetDomainError(
                code=f"invalid_{action}_target",
                detail=f"A Social Meet profile cannot {action} itself",
            )
        target = self._identity_repository.get_profile_by_public_id(target_profile_id)
        if target is None:
            raise SocialMeetDomainError(
                code="recipient_unavailable",
                detail="The requested Social Meet profile is unavailable",
            )


def _require_profile_id(record: SocialMeetProfileRecord) -> UUID:
    if record.profile_id is None:
        raise SocialMeetDomainError(
            code="profile_not_published",
            detail="A Social Meet profile must be created before using participant safety controls",
        )
    return record.profile_id
