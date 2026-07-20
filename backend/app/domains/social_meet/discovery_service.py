from __future__ import annotations

import hashlib
from datetime import UTC, datetime
from uuid import UUID

from app.core.config import Settings
from app.domains.social_meet.discovery_models import (
    ContextCandidateRequest,
    ContextCandidateResponse,
    DiscoveryCandidate,
    DiscoveryCandidateProfile,
    DiscoveryFeatureGate,
    RankedDiscoveryCandidate,
)
from app.domains.social_meet.discovery_repository import PostgresSocialMeetDiscoveryRepository
from app.domains.social_meet.models import (
    KnowledgeFingerprint,
    ProfileVisibility,
    SocialMeetProfileRecord,
)
from app.domains.social_meet.repository import SocialMeetIdentityRepository
from app.domains.social_meet.service import SUPPORTED_CONSENT_VERSION, SocialMeetDomainError

_ROLLOUT_SALT = b"history-go-spotmeeting-discovery-v1"


class SocialMeetCandidateDiscoveryService:
    def __init__(
        self,
        settings: Settings,
        identity_repository: SocialMeetIdentityRepository,
        discovery_repository: PostgresSocialMeetDiscoveryRepository,
    ) -> None:
        self._settings = settings
        self._identity_repository = identity_repository
        self._discovery_repository = discovery_repository

    def find_context_candidates(
        self,
        auth_user_id: UUID,
        request: ContextCandidateRequest,
        *,
        now: datetime | None = None,
    ) -> ContextCandidateResponse:
        generated_at = now or datetime.now(UTC)
        requester = self._identity_repository.get_or_create_for_user(auth_user_id)
        requester_profile_id = _require_discoverable_requester(requester)

        gate = self._discovery_repository.get_feature_gate()
        if not self._settings.spotmeeting_discovery_enabled or not _gate_allows(
            gate,
            requester_profile_id,
        ):
            raise SocialMeetDomainError(
                code="backend_not_enabled",
                detail="Spotmeeting candidate discovery is not enabled for this profile",
            )

        limit = min(request.limit, self._settings.spotmeeting_discovery_max_candidates)
        ranked = self._discovery_repository.rank_context_candidates(
            requester_profile_id=requester_profile_id,
            context=request.context,
            supported_consent_version=SUPPORTED_CONSENT_VERSION,
            now=generated_at,
            limit=limit,
        )
        return ContextCandidateResponse(
            context_type=request.context.context_type,
            context_id=request.context.context_id,
            generated_at=generated_at,
            stale_after_seconds=self._settings.spotmeeting_discovery_stale_after_seconds,
            candidates=[_to_candidate(item) for item in ranked],
        )


def _require_discoverable_requester(record: SocialMeetProfileRecord) -> UUID:
    if (
        record.profile_id is None
        or record.profile_visibility is not ProfileVisibility.DISCOVERABLE
        or record.consent_version != SUPPORTED_CONSENT_VERSION
    ):
        raise SocialMeetDomainError(
            code="profile_not_published",
            detail="A current discoverable Social Meet profile is required for discovery",
        )
    return record.profile_id


def _gate_allows(gate: DiscoveryFeatureGate, profile_id: UUID) -> bool:
    if not gate.enabled:
        return False
    if profile_id in gate.allowed_profile_ids:
        return True
    if gate.rollout_percent <= 0:
        return False
    if gate.rollout_percent >= 100:
        return True
    digest = hashlib.sha256(_ROLLOUT_SALT + profile_id.bytes).digest()
    bucket = int.from_bytes(digest[:8], "big") % 100
    return bucket < gate.rollout_percent


def _to_candidate(item: RankedDiscoveryCandidate) -> DiscoveryCandidate:
    profile = item.profile
    return DiscoveryCandidate(
        profile=DiscoveryCandidateProfile(
            profile_id=profile.profile_id,
            display_name=profile.display_name,
            avatar_ref=profile.avatar_ref,
            short_bio=profile.short_bio,
            preferred_themes=list(profile.preferred_themes),
            favorite_eras=list(profile.favorite_eras),
            learning_goals=list(profile.learning_goals),
            knowledge_fingerprint_summary=KnowledgeFingerprint.model_validate(
                profile.knowledge_fingerprint_summary
            ),
            profile_updated_at=profile.updated_at,
        ),
        match_reasons=list(item.match_reasons),
    )
