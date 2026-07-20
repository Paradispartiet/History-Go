from __future__ import annotations

import hashlib
from datetime import UTC, datetime
from uuid import UUID

from app.core.config import Settings
from app.domains.social_meet.discovery_models import (
    CandidateDiscoveryResponse,
    CandidateMatchReason,
    ContextCandidateRequest,
    DiscoveryCandidate,
    DiscoveryCandidateProfile,
    DiscoveryFeatureGate,
    DiscoveryMatchReason,
    DiscoveryProfileRecord,
    RankedDiscoveryCandidate,
)
from app.domains.social_meet.discovery_repository import PostgresSocialMeetDiscoveryRepository
from app.domains.social_meet.models import KnowledgeFingerprint, ProfileVisibility, SocialMeetProfileRecord
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
    ) -> CandidateDiscoveryResponse:
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

        pool = self._discovery_repository.list_candidate_profiles(
            requester_profile_id=requester_profile_id,
            supported_consent_version=SUPPORTED_CONSENT_VERSION,
            now=generated_at,
            pool_limit=self._settings.spotmeeting_discovery_pool_limit,
        )
        ranked = _rank_candidates(requester, pool, request)
        limit = min(request.limit, self._settings.spotmeeting_discovery_max_candidates)
        return CandidateDiscoveryResponse(
            context_type=request.context.context_type,
            context_id=request.context.context_id,
            generated_at=generated_at,
            stale_after_seconds=self._settings.spotmeeting_discovery_stale_after_seconds,
            candidates=[_to_candidate(item) for item in ranked[:limit]],
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


def _rank_candidates(
    requester: SocialMeetProfileRecord,
    candidates: list[DiscoveryProfileRecord],
    request: ContextCandidateRequest,
) -> list[RankedDiscoveryCandidate]:
    requester_fingerprint = KnowledgeFingerprint.model_validate(
        requester.knowledge_fingerprint_summary
    )
    ranked: list[RankedDiscoveryCandidate] = []
    for candidate in candidates:
        score, reasons = _score_candidate(
            requester,
            requester_fingerprint,
            candidate,
            request,
        )
        if score <= 0:
            continue
        ranked.append(
            RankedDiscoveryCandidate(
                profile=candidate,
                match_reasons=tuple(reasons),
                score=score,
            )
        )
    ranked.sort(key=lambda item: (-item.score, str(item.profile.profile_id)))
    return ranked


def _score_candidate(
    requester: SocialMeetProfileRecord,
    requester_fingerprint: KnowledgeFingerprint,
    candidate: DiscoveryProfileRecord,
    request: ContextCandidateRequest,
) -> tuple[int, list[DiscoveryMatchReason]]:
    context = request.context
    candidate_fingerprint = KnowledgeFingerprint.model_validate(
        candidate.knowledge_fingerprint_summary
    )
    reasons: list[DiscoveryMatchReason] = []
    score = 0

    if _contains(candidate.interest_places, context.context_id):
        score += 12
        reasons.append(DiscoveryMatchReason.CONTEXT_INTEREST_PLACE)

    score += _context_overlap_score(
        context.theme_tags,
        (*candidate.preferred_themes, *candidate_fingerprint.theme_tags),
        6,
        DiscoveryMatchReason.CONTEXT_THEME,
        reasons,
    )
    score += _context_overlap_score(
        context.era_tags,
        (*candidate.favorite_eras, *candidate_fingerprint.era_tags),
        5,
        DiscoveryMatchReason.CONTEXT_ERA,
        reasons,
    )
    score += _context_overlap_score(
        context.topic_tags,
        candidate_fingerprint.topic_tags,
        7,
        DiscoveryMatchReason.CONTEXT_TOPIC,
        reasons,
    )
    score += _context_overlap_score(
        context.route_category_tags,
        candidate_fingerprint.route_category_tags,
        7,
        DiscoveryMatchReason.CONTEXT_ROUTE_CATEGORY,
        reasons,
    )
    score += _context_overlap_score(
        context.quiz_topic_tags,
        candidate_fingerprint.quiz_topic_tags,
        7,
        DiscoveryMatchReason.CONTEXT_QUIZ_TOPIC,
        reasons,
    )
    score += _context_overlap_score(
        context.learning_goal_tags,
        (*candidate.learning_goals, *candidate_fingerprint.learning_goal_tags),
        5,
        DiscoveryMatchReason.CONTEXT_LEARNING_GOAL,
        reasons,
    )

    score += _shared_score(
        requester.preferred_themes,
        candidate.preferred_themes,
        3,
        DiscoveryMatchReason.SHARED_THEME,
        reasons,
    )
    score += _shared_score(
        requester.favorite_eras,
        candidate.favorite_eras,
        3,
        DiscoveryMatchReason.SHARED_ERA,
        reasons,
    )
    score += _shared_score(
        (*requester.learning_goals, *requester_fingerprint.learning_goal_tags),
        (*candidate.learning_goals, *candidate_fingerprint.learning_goal_tags),
        4,
        DiscoveryMatchReason.SHARED_LEARNING_GOAL,
        reasons,
    )

    # Remaining fingerprint overlap may improve deterministic internal ordering but
    # introduces no new public reason category and never uses behavior/activity data.
    score += _overlap_count(requester_fingerprint.theme_tags, candidate_fingerprint.theme_tags)
    score += _overlap_count(requester_fingerprint.era_tags, candidate_fingerprint.era_tags)
    score += _overlap_count(requester_fingerprint.topic_tags, candidate_fingerprint.topic_tags)
    score += _overlap_count(
        requester_fingerprint.route_category_tags,
        candidate_fingerprint.route_category_tags,
    )
    score += _overlap_count(
        requester_fingerprint.quiz_topic_tags,
        candidate_fingerprint.quiz_topic_tags,
    )

    return score, list(dict.fromkeys(reasons))


def _context_overlap_score(
    context_values: list[str],
    candidate_values: tuple[str, ...] | list[str],
    weight: int,
    reason: DiscoveryMatchReason,
    reasons: list[DiscoveryMatchReason],
) -> int:
    count = _overlap_count(context_values, candidate_values)
    if count:
        reasons.append(reason)
    return count * weight


def _shared_score(
    requester_values: tuple[str, ...] | list[str],
    candidate_values: tuple[str, ...] | list[str],
    weight: int,
    reason: DiscoveryMatchReason,
    reasons: list[DiscoveryMatchReason],
) -> int:
    count = _overlap_count(requester_values, candidate_values)
    if count:
        reasons.append(reason)
    return count * weight


def _overlap_count(first: tuple[str, ...] | list[str], second: tuple[str, ...] | list[str]) -> int:
    return len(_normalized_set(first) & _normalized_set(second))


def _contains(values: tuple[str, ...], expected: str) -> bool:
    return expected.casefold() in _normalized_set(values)


def _normalized_set(values: tuple[str, ...] | list[str]) -> set[str]:
    return {value.strip().casefold() for value in values if value.strip()}


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
