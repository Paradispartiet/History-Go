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
        candidates: list[DiscoveryProfileRecord],
    ) -> None:
        self.gate = gate
        self.candidates = candidates
        self.pool_limit: int | None = None

    def get_feature_gate(self) -> DiscoveryFeatureGate:
        return self.gate

    def list_candidate_profiles(
        self,
        *,
        requester_profile_id: UUID,
        supported_consent_version: str,
        now: datetime,
        pool_limit: int,
    ) -> list[DiscoveryProfileRecord]:
        self.pool_limit = pool_limit
        return self.candidates


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
    service = _service(requester, gate, [_context_candidate(), _shared_candidate()])

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


def test_candidates_rank_only_by_explicit_context_and_profile_overlap() -> None:
    requester = _requester()
    context_candidate = _context_candidate()
    shared_candidate = _shared_candidate()
    unrelated_candidate = _candidate(
        display_name="Unrelated",
        preferred_themes=("botany",),
        fingerprint={"topicTags": ["plants"]},
    )
    service = _service(
        requester,
        DiscoveryFeatureGate(True, 100, frozenset()),
        [shared_candidate, unrelated_candidate, context_candidate],
    )

    response = service.find_context_candidates(requester.auth_user_id, _request(), now=NOW)

    assert [candidate.profile.display_name for candidate in response.candidates] == [
        "Context match",
        "Shared match",
    ]
    assert DiscoveryMatchReason.CONTEXT_INTEREST_PLACE in response.candidates[0].match_reasons
    assert DiscoveryMatchReason.CONTEXT_THEME in response.candidates[0].match_reasons
    assert DiscoveryMatchReason.SHARED_THEME in response.candidates[1].match_reasons
    serialized = response.model_dump(mode="json", by_alias=True)
    assert "score" not in str(serialized).lower()
    assert "lastSeen" not in str(serialized)
    assert "online" not in str(serialized).lower()


def test_candidate_limit_is_capped_by_server_configuration() -> None:
    requester = _requester()
    candidates = [
        _candidate(
            display_name=f"Candidate {index}",
            preferred_themes=("history",),
        )
        for index in range(5)
    ]
    repository = FakeDiscoveryRepository(
        DiscoveryFeatureGate(True, 100, frozenset()),
        candidates,
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
    assert repository.pool_limit == 50


def _service(
    requester: SocialMeetProfileRecord,
    gate: DiscoveryFeatureGate,
    candidates: list[DiscoveryProfileRecord],
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


def _context_candidate() -> DiscoveryProfileRecord:
    return _candidate(
        display_name="Context match",
        preferred_themes=("history",),
        favorite_eras=("medieval",),
        interest_places=("akershus_festning",),
        learning_goals=("architecture",),
        fingerprint={
            "themeTags": ["history"],
            "eraTags": ["medieval"],
            "topicTags": ["fortifications"],
            "learningGoalTags": ["architecture"],
        },
    )


def _shared_candidate() -> DiscoveryProfileRecord:
    return _candidate(
        display_name="Shared match",
        preferred_themes=("history",),
        favorite_eras=("medieval",),
        learning_goals=("architecture",),
    )


def _candidate(
    *,
    display_name: str,
    preferred_themes: tuple[str, ...] = (),
    favorite_eras: tuple[str, ...] = (),
    interest_places: tuple[str, ...] = (),
    learning_goals: tuple[str, ...] = (),
    fingerprint: dict[str, object] | None = None,
) -> DiscoveryProfileRecord:
    return DiscoveryProfileRecord(
        profile_id=uuid4(),
        display_name=display_name,
        avatar_ref=None,
        short_bio=None,
        preferred_themes=preferred_themes,
        favorite_eras=favorite_eras,
        interest_places=interest_places,
        learning_goals=learning_goals,
        knowledge_fingerprint_summary=fingerprint or {},
        updated_at=NOW,
    )


def _profile_id(record: SocialMeetProfileRecord) -> UUID:
    assert record.profile_id is not None
    return record.profile_id
