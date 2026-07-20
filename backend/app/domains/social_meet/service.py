from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime
from uuid import UUID

from app.domains.social_meet.models import (
    CurrentSocialMeetState,
    KnowledgeFingerprint,
    ProfileUpsertRequest,
    ProfileVisibility,
    PublicSocialMeetProfile,
    SocialMeetProfileRecord,
    WritableProfileVisibility,
)
from app.domains.social_meet.repository import SocialMeetIdentityRepository

SUPPORTED_CONSENT_VERSION = "social_meet_identity_v1"


@dataclass(frozen=True, slots=True)
class SocialMeetDomainError(Exception):
    code: str
    detail: str

    def __str__(self) -> str:
        return self.detail


class SocialMeetIdentityService:
    def __init__(self, repository: SocialMeetIdentityRepository) -> None:
        self._repository = repository

    def get_current_state(self, auth_user_id: UUID) -> CurrentSocialMeetState:
        record = self._repository.get_or_create_for_user(auth_user_id)
        return _current_state(record)

    def upsert_profile(
        self,
        auth_user_id: UUID,
        profile: ProfileUpsertRequest,
        *,
        now: datetime | None = None,
    ) -> PublicSocialMeetProfile:
        current = self._repository.get_or_create_for_user(auth_user_id)
        _ensure_profile_is_user_manageable(current)

        consented_at: datetime | None = None
        if profile.consent_version is not None:
            if profile.consent_version != SUPPORTED_CONSENT_VERSION:
                raise SocialMeetDomainError(
                    code="unsupported_consent_version",
                    detail="The supplied Social Meet consent version is not supported",
                )
            consented_at = now or datetime.now(UTC)

        if profile.profile_visibility is WritableProfileVisibility.DISCOVERABLE:
            if profile.consent_version != SUPPORTED_CONSENT_VERSION:
                raise SocialMeetDomainError(
                    code="consent_required",
                    detail="Discoverable Social Meet profiles require explicit current consent",
                )
            if not profile.preview_confirmed:
                raise SocialMeetDomainError(
                    code="profile_preview_required",
                    detail="The public profile preview must be confirmed before publication",
                )

        saved = self._repository.save_profile(
            auth_user_id,
            profile,
            consented_at=consented_at,
        )
        return _safe_profile(saved)

    def get_public_profile(
        self,
        requester_auth_user_id: UUID,
        profile_id: UUID,
    ) -> PublicSocialMeetProfile:
        requester = self._repository.get_or_create_for_user(requester_auth_user_id)
        if requester.consent_version != SUPPORTED_CONSENT_VERSION:
            raise SocialMeetDomainError(
                code="social_meet_opt_in_required",
                detail="Current Social Meet consent is required to view public profiles",
            )
        _ensure_profile_is_user_manageable(requester)

        record = self._repository.get_discoverable_profile(profile_id)
        if record is None:
            raise SocialMeetDomainError(
                code="profile_not_found",
                detail="The requested Social Meet profile is not available",
            )
        return _safe_profile(record)

    def unpublish(self, auth_user_id: UUID) -> CurrentSocialMeetState:
        current = self._repository.get_or_create_for_user(auth_user_id)
        _ensure_profile_is_user_manageable(current)
        updated = self._repository.unpublish(auth_user_id)
        return _current_state(updated)


def _ensure_profile_is_user_manageable(record: SocialMeetProfileRecord) -> None:
    if record.profile_visibility in {
        ProfileVisibility.BLOCKED_OR_SUSPENDED,
        ProfileVisibility.DELETED,
    }:
        raise SocialMeetDomainError(
            code="profile_unavailable",
            detail="The Social Meet profile cannot be changed in its current state",
        )


def _current_state(record: SocialMeetProfileRecord) -> CurrentSocialMeetState:
    return CurrentSocialMeetState(
        user_id=record.social_user_id,
        profile_id=record.profile_id,
        profile_visibility=record.profile_visibility,
        consent_version=record.consent_version,
        consented_at=record.consented_at,
        can_publish_profile=record.profile_visibility
        not in {ProfileVisibility.BLOCKED_OR_SUSPENDED, ProfileVisibility.DELETED},
    )


def _safe_profile(record: SocialMeetProfileRecord) -> PublicSocialMeetProfile:
    if record.profile_id is None or record.display_name is None:
        raise SocialMeetDomainError(
            code="profile_incomplete",
            detail="The Social Meet profile does not have a publishable public identity",
        )

    fingerprint = KnowledgeFingerprint.model_validate(
        record.knowledge_fingerprint_summary
    )
    return PublicSocialMeetProfile(
        profile_id=record.profile_id,
        display_name=record.display_name,
        avatar_ref=record.avatar_ref,
        short_bio=record.short_bio,
        preferred_themes=list(record.preferred_themes),
        favorite_eras=list(record.favorite_eras),
        interest_places=list(record.interest_places),
        learning_goals=list(record.learning_goals),
        knowledge_badges=list(record.knowledge_badges),
        knowledge_fingerprint_summary=fingerprint,
        profile_visibility=record.profile_visibility,
        profile_updated_at=record.updated_at,
    )
