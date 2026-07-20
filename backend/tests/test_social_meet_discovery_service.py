from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from app.core.config import Settings
from app.domains.social_meet.discovery_models import (
    ContextCandidateRequest,
    DiscoveryContextSignals,
    DiscoveryFeatureGate,
    DiscoveryMatchReason,
    DiscoveryProfileRecord,
    RankedDiscoveryCandidate,
)
from app.domains.social_meet.discovery_service import (
    SocialMeetCandidateDiscoveryService,
    _gate_allows,
)
from app.domains.social_meet.models import ProfileVisibility, SocialMeetProfileRecord
from app.domains.social_meet.service import SUPPORTED_CONSENT_VERSION, SocialMeetDomainError
from app.domains.social_meet.spotmeeting_models import SpotmeetingContextType

NOW = datetime(2026, 7, 20, 18, 0, tzinfo=UTC)


class FakeIdentityRepository:
    def __init__(self, requester: SocialMeetProfileRecord) -> None:
        self.requester = requester

    def get_or_create_for_user(self, auth_user_id: UUID) -> SocialMeetProfileRecord:
        assert auth_user_id == self.requester.auth_user_id
        return self.requester


class FakeDiscoveryRepository:
    def __init__(
        self,
        gate: DiscoveryFeatureGate,
        candidates: list[RankedDiscoveryCandidate],
    ) -> None:
        self.gate = gate
        self.candidates = candidates
        self.limit: int | None = None

    def get_feature_gate(self) -> DiscoveryFeatureGate:
        return self.gate

    def rank_context_candidates(
        self,
        *,
        requester_profile_id: UUID,
        context: DiscoveryContextSignals,
        supported_consent_version: str,
        now: datetime,
        limit: int,
    ) -> list[RankedDiscoveryCandidate]:
        self.limit = limit
        return self.candidates[:limit]


def test_discovery_is_fail_closed_when_deployment_kill_switch_is_off() -> None:
    requester = _requester()
    service = _service(
        requester,
        DiscoveryFeatureGate(True, 100, frozenset()),
        [],
        settings=Settings(environment="test", spotmeeting_discovery_enabled=False),
    )

    with pytest.raises(SocialMeetDomainError) as error:
        service.find_context_candidates(requester.auth_user_id, _request(), now=NOW)

    assert error.value.code == "backend_not_enabled"


def test_discovery_is_fail_closed_when_database_flag_is_missing_or_disabled() -> None:
    requester = _requester()
    service = _service(
        requester,
        DiscoveryFeatureGate(False, 100, frozenset({_profile_id(requester)})),
        [],
    )

    with pytest.raises(SocialMeetDomainError) as error:
        service.find_context_candidates(requester.auth_user_id, _request(), now=NOW)

    assert error.value.code == "backend_not_enabled"


def test_explicit_profile_cohort_bypasses_zero_percent_rollout() -> None:
    requester = _requester()
    gate = DiscoveryFeatureGate(True, 0, frozenset({_profile_id(requester)}))
    service = _service(
        requester,
        gate,
        [
            _ranked_candidate("Context match", DiscoveryMatchReason.CONTEXT_THEME, score=12),
            _ranked_candidate("Shared match", DiscoveryMatchReason.SHARED_THEME, score=3),
        ],
    )

    response = service.find_context_candidates(requester.auth_user_id, _request(), now=NOW)

    assert len(response.candidates) == 2
    assert response.stale_after_seconds == 300


def test_rollout_bucket_is_deterministic_and_honors_hard_bounds() -> None:
    profile_id = uuid4()

    assert not _gate_allows(DiscoveryFeatureGate(False, 100, frozenset()), profile_id)
    assert not _gate_allows(DiscoveryFeatureGate(True, 0, frozenset()), profile_id)
    assert _gate_allows(DiscoveryFeatureGate(True, 100, frozenset()), profile_id)
    assert _gate_allows(
        DiscoveryFeatureGate(True, 0, frozenset({profile_id})),
        profile_id,
    )
    assert _gate_allows(
        DiscoveryFeatureGate(True, 50, frozenset()),
        profile_id,
    ) == _gate_allows(
        DiscoveryFeatureGate(True, 50, frozenset()),
        profile_id,
    )


def test_requester_must_remain_discoverable_with_current_consent() -> None:
    for requester in (
        _requester(visibility=ProfileVisibility.PAUSED),
        _requester(consent_version="stale-consent"),
    ):
        service = _service(
            requester,
            DiscoveryFeatureGate(True, 100, frozenset()),
            [],
        )
        with pytest.raises(SocialMeetDomainError) as error:
            service.find_context_candidates(requester.auth_user_id, _request(), now=NOW)
        assert error.value.code == "profile_not_published"


def test_service_serializes_ranked_candidates_without_exposing_internal_score() -> None:
    requester = _requester()
    service = _service(
        requester,
        DiscoveryFeatureGate(True, 100, frozenset()),
        [
            _ranked_candidate(
                "Context match",
                DiscoveryMatchReason.CONTEXT_INTEREST_PLACE,
                DiscoveryMatchReason.CONTEXT_THEME,
                score=99,
            )
        ],
    )

    response = service.find_context_candidates(requester.auth_user_id, _request(), now=NOW)

    assert response.candidates[0].profile.display_name == "Context match"
    assert response.candidates[0].match_reasons == [
        DiscoveryMatchReason.CONTEXT_INTEREST_PLACE,
        DiscoveryMatchReason.CONTEXT_THEME,
    ]
    serialized = response.model_dump(mode="json", by_alias=True)
    assert "score" not in str(serialized).lower()
    assert "lastSeen" not in str(serialized)
    assert "online" not in str(serialized).lower()


def test_candidate_limit_is_capped_before_repository_query() -> None:
    requester = _requester()
    repository = FakeDiscoveryRepository(
        DiscoveryFeatureGate(True, 100, frozenset()),
        [
            _ranked_candidate(f"Candidate {index}", DiscoveryMatchReason.SHARED_THEME, score=10)
            for index in range(5)
        ],
    )
    service = SocialMeetCandidateDiscoveryService(
        Settings(
            environment="test",
            spotmeeting_discovery_enabled=True,
            spotmeeting_discovery_max_candidates=2,
            spotmeeting_discovery_pool_limit=50,
        ),
        FakeIdentityRepository(requester),  # type: ignore[arg-type]
        repository,  # type: ignore[arg-type]
    )

    response = service.find_context_candidates(
        requester.auth_user_id,
        _request(limit=20),
        now=NOW,
    )

    assert len(response.candidates) == 2
    assert repository.limit == 2


def _service(
    requester: SocialMeetProfileRecord,
    gate: DiscoveryFeatureGate,
    candidates: list[RankedDiscoveryCandidate],
    *,
    settings: Settings | None = None,
) -> SocialMeetCandidateDiscoveryService:
    return SocialMeetCandidateDiscoveryService(
        settings or Settings(environment="test", spotmeeting_discovery_enabled=True),
        FakeIdentityRepository(requester),  # type: ignore[arg-type]
        FakeDiscoveryRepository(gate, candidates),  # type: ignore[arg-type]
    )


def _request(*, limit: int = 10) -> ContextCandidateRequest:
    return ContextCandidateRequest(
        context=DiscoveryContextSignals(
            context_type=SpotmeetingContextType.PLACE,
            context_id="akershus_festning",
            theme_tags=["history"],
            era_tags=["medieval"],
            topic_tags=["fortifications"],
            learning_goal_tags=["architecture"],
        ),
        limit=limit,
    )


def _requester(
    *,
    visibility: ProfileVisibility = ProfileVisibility.DISCOVERABLE,
    consent_version: str | None = SUPPORTED_CONSENT_VERSION,
) -> SocialMeetProfileRecord:
    return SocialMeetProfileRecord(
        auth_user_id=uuid4(),
        social_user_id=uuid4(),
        profile_id=uuid4(),
        display_name="Requester",
        avatar_ref=None,
        short_bio=None,
        preferred_themes=("history",),
        favorite_eras=("medieval",),
        interest_places=(),
        learning_goals=("architecture",),
        knowledge_badges=(),
        knowledge_fingerprint_summary={
            "themeTags": ["history"],
            "eraTags": ["medieval"],
            "topicTags": ["urban history"],
        },
        profile_visibility=visibility,
        consent_version=consent_version,
        consented_at=NOW,
        updated_at=NOW,
    )


def _ranked_candidate(
    display_name: str,
    *reasons: DiscoveryMatchReason,
    score: int,
) -> RankedDiscoveryCandidate:
    return RankedDiscoveryCandidate(
        profile=DiscoveryProfileRecord(
            profile_id=uuid4(),
            display_name=display_name,
            avatar_ref=None,
            short_bio=None,
            preferred_themes=("history",),
            favorite_eras=("medieval",),
            interest_places=("akershus_festning",),
            learning_goals=("architecture",),
            knowledge_fingerprint_summary={"themeTags": ["history"]},
            updated_at=NOW,
        ),
        match_reasons=reasons,
        score=score,
    )


def _profile_id(record: SocialMeetProfileRecord) -> UUID:
    assert record.profile_id is not None
    return record.profile_id
