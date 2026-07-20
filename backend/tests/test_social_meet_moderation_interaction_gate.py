from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from app.domains.social_meet.models import ProfileVisibility, SocialMeetProfileRecord
from app.domains.social_meet.safety_service import SocialMeetSafetyService
from app.domains.social_meet.service import SocialMeetDomainError

NOW = datetime(2026, 7, 20, 14, 0, tzinfo=UTC)


class FakeIdentityRepository:
    def __init__(self, *profiles: SocialMeetProfileRecord) -> None:
        self.profiles = {
            profile.profile_id: profile for profile in profiles if profile.profile_id is not None
        }

    def get_profile_by_public_id(self, profile_id: UUID) -> SocialMeetProfileRecord | None:
        return self.profiles.get(profile_id)


class FakeSafetyRepository:
    def __init__(self, *, blocked: bool = False) -> None:
        self.blocked = blocked

    def interaction_is_blocked(self, first_profile_id: UUID, second_profile_id: UUID) -> bool:
        return self.blocked


def test_suspended_profile_is_rejected_before_block_lookup_result_can_allow_contact() -> None:
    first = _profile(ProfileVisibility.DISCOVERABLE)
    second = _profile(ProfileVisibility.BLOCKED_OR_SUSPENDED)
    service = SocialMeetSafetyService(
        FakeIdentityRepository(first, second),  # type: ignore[arg-type]
        FakeSafetyRepository(blocked=False),  # type: ignore[arg-type]
    )

    with pytest.raises(SocialMeetDomainError) as error:
        service.ensure_interaction_allowed(_profile_id(first), _profile_id(second))

    assert error.value.code == "moderation_restricted"


def test_deleted_or_unknown_profile_is_non_enumerating_moderation_restricted() -> None:
    first = _profile(ProfileVisibility.DISCOVERABLE)
    service = SocialMeetSafetyService(
        FakeIdentityRepository(first),  # type: ignore[arg-type]
        FakeSafetyRepository(),  # type: ignore[arg-type]
    )

    with pytest.raises(SocialMeetDomainError) as error:
        service.ensure_interaction_allowed(_profile_id(first), uuid4())

    assert error.value.code == "moderation_restricted"


def test_valid_profiles_still_obey_bidirectional_block_gate() -> None:
    first = _profile(ProfileVisibility.DISCOVERABLE)
    second = _profile(ProfileVisibility.DISCOVERABLE)
    service = SocialMeetSafetyService(
        FakeIdentityRepository(first, second),  # type: ignore[arg-type]
        FakeSafetyRepository(blocked=True),  # type: ignore[arg-type]
    )

    with pytest.raises(SocialMeetDomainError) as error:
        service.ensure_interaction_allowed(_profile_id(first), _profile_id(second))

    assert error.value.code == "interaction_blocked"


def _profile(visibility: ProfileVisibility) -> SocialMeetProfileRecord:
    return SocialMeetProfileRecord(
        auth_user_id=uuid4(),
        social_user_id=uuid4(),
        profile_id=uuid4(),
        display_name="Ada",
        avatar_ref=None,
        short_bio=None,
        preferred_themes=(),
        favorite_eras=(),
        interest_places=(),
        learning_goals=(),
        knowledge_badges=(),
        knowledge_fingerprint_summary={},
        profile_visibility=visibility,
        consent_version="social_meet_identity_v1",
        consented_at=NOW,
        updated_at=NOW,
    )


def _profile_id(profile: SocialMeetProfileRecord) -> UUID:
    assert profile.profile_id is not None
    return profile.profile_id
