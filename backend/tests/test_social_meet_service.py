from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID, uuid4

import pytest

from app.domains.social_meet.models import (
    ProfileUpsertRequest,
    ProfileVisibility,
    SocialMeetProfileRecord,
)
from app.domains.social_meet.service import (
    SUPPORTED_CONSENT_VERSION,
    SocialMeetDomainError,
    SocialMeetIdentityService,
)


class FakeSocialMeetRepository:
    def __init__(self, record: SocialMeetProfileRecord) -> None:
        self.record = record
        self.public_record: SocialMeetProfileRecord | None = record
        self.last_consented_at: datetime | None = None

    def get_or_create_for_user(self, auth_user_id: UUID) -> SocialMeetProfileRecord:
        assert auth_user_id == self.record.auth_user_id
        return self.record

    def save_profile(
        self,
        auth_user_id: UUID,
        profile: ProfileUpsertRequest,
        *,
        consented_at: datetime | None,
    ) -> SocialMeetProfileRecord:
        assert auth_user_id == self.record.auth_user_id
        self.last_consented_at = consented_at
        self.record = SocialMeetProfileRecord(
            auth_user_id=auth_user_id,
            social_user_id=self.record.social_user_id,
            profile_id=self.record.profile_id or uuid4(),
            display_name=profile.display_name,
            avatar_ref=profile.avatar_ref,
            short_bio=profile.short_bio,
            preferred_themes=tuple(profile.preferred_themes),
            favorite_eras=tuple(profile.favorite_eras),
            interest_places=tuple(profile.interest_places),
            learning_goals=tuple(profile.learning_goals),
            knowledge_badges=self.record.knowledge_badges,
            knowledge_fingerprint_summary=profile.fingerprint_inputs.model_dump(),
            profile_visibility=ProfileVisibility(profile.profile_visibility.value),
            consent_version=profile.consent_version or self.record.consent_version,
            consented_at=consented_at or self.record.consented_at,
            updated_at=datetime(2026, 7, 20, 12, 0, tzinfo=UTC),
        )
        return self.record

    def get_discoverable_profile(self, profile_id: UUID) -> SocialMeetProfileRecord | None:
        if self.public_record is None or self.public_record.profile_id != profile_id:
            return None
        if self.public_record.profile_visibility is not ProfileVisibility.DISCOVERABLE:
            return None
        return self.public_record

    def unpublish(self, auth_user_id: UUID) -> SocialMeetProfileRecord:
        assert auth_user_id == self.record.auth_user_id
        self.record = _record(
            auth_user_id=auth_user_id,
            social_user_id=self.record.social_user_id,
            profile_id=self.record.profile_id,
            visibility=ProfileVisibility.PRIVATE,
            consent_version=self.record.consent_version,
            consented_at=self.record.consented_at,
        )
        return self.record


def test_current_state_exposes_opaque_social_id_not_auth_id() -> None:
    record = _record()
    service = SocialMeetIdentityService(FakeSocialMeetRepository(record))

    state = service.get_current_state(record.auth_user_id)

    assert state.user_id == record.social_user_id
    assert state.user_id != record.auth_user_id
    assert state.profile_visibility is ProfileVisibility.DRAFT
    assert state.can_publish_profile is True


def test_discoverable_profile_requires_current_consent() -> None:
    record = _record()
    service = SocialMeetIdentityService(FakeSocialMeetRepository(record))
    profile = _profile(profile_visibility="discoverable", preview_confirmed=True)

    with pytest.raises(SocialMeetDomainError) as error:
        service.upsert_profile(record.auth_user_id, profile)

    assert error.value.code == "consent_required"


def test_discoverable_profile_requires_confirmed_preview() -> None:
    record = _record()
    service = SocialMeetIdentityService(FakeSocialMeetRepository(record))
    profile = _profile(
        profile_visibility="discoverable",
        consent_version=SUPPORTED_CONSENT_VERSION,
        preview_confirmed=False,
    )

    with pytest.raises(SocialMeetDomainError) as error:
        service.upsert_profile(record.auth_user_id, profile)

    assert error.value.code == "profile_preview_required"


def test_profile_rejects_unknown_consent_version() -> None:
    record = _record()
    service = SocialMeetIdentityService(FakeSocialMeetRepository(record))
    profile = _profile(consent_version="future_consent_v9")

    with pytest.raises(SocialMeetDomainError) as error:
        service.upsert_profile(record.auth_user_id, profile)

    assert error.value.code == "unsupported_consent_version"


def test_publish_records_consent_and_returns_public_safe_profile() -> None:
    record = _record()
    repository = FakeSocialMeetRepository(record)
    service = SocialMeetIdentityService(repository)
    accepted_at = datetime(2026, 7, 20, 11, 30, tzinfo=UTC)

    public_profile = service.upsert_profile(
        record.auth_user_id,
        _profile(
            profile_visibility="discoverable",
            consent_version=SUPPORTED_CONSENT_VERSION,
            preview_confirmed=True,
        ),
        now=accepted_at,
    )

    assert repository.last_consented_at == accepted_at
    assert public_profile.profile_id is not None
    assert public_profile.display_name == "Ada"
    assert public_profile.profile_visibility is ProfileVisibility.DISCOVERABLE
    assert public_profile.knowledge_fingerprint_summary.theme_tags == ["industrial_history"]
    assert not hasattr(public_profile, "auth_user_id")


def test_public_profile_reads_require_requester_opt_in() -> None:
    requester = _record(profile_id=uuid4(), visibility=ProfileVisibility.PRIVATE)
    repository = FakeSocialMeetRepository(requester)
    target = _record(
        auth_user_id=requester.auth_user_id,
        social_user_id=requester.social_user_id,
        profile_id=uuid4(),
        visibility=ProfileVisibility.DISCOVERABLE,
        consent_version=SUPPORTED_CONSENT_VERSION,
        consented_at=datetime(2026, 7, 20, 10, 0, tzinfo=UTC),
    )
    repository.public_record = target
    service = SocialMeetIdentityService(repository)

    with pytest.raises(SocialMeetDomainError) as error:
        service.get_public_profile(requester.auth_user_id, target.profile_id or uuid4())

    assert error.value.code == "social_meet_opt_in_required"


def test_opted_in_requester_can_read_discoverable_profile() -> None:
    requester = _record(
        profile_id=uuid4(),
        visibility=ProfileVisibility.PRIVATE,
        consent_version=SUPPORTED_CONSENT_VERSION,
        consented_at=datetime(2026, 7, 20, 10, 0, tzinfo=UTC),
    )
    repository = FakeSocialMeetRepository(requester)
    target = _record(
        auth_user_id=requester.auth_user_id,
        social_user_id=requester.social_user_id,
        profile_id=uuid4(),
        visibility=ProfileVisibility.DISCOVERABLE,
        consent_version=SUPPORTED_CONSENT_VERSION,
        consented_at=datetime(2026, 7, 20, 10, 0, tzinfo=UTC),
    )
    repository.public_record = target
    service = SocialMeetIdentityService(repository)

    profile = service.get_public_profile(requester.auth_user_id, target.profile_id or uuid4())

    assert profile.profile_id == target.profile_id
    assert profile.display_name == "Ada"


def test_missing_public_profile_is_non_enumerating_not_found() -> None:
    requester = _record(
        consent_version=SUPPORTED_CONSENT_VERSION,
        consented_at=datetime(2026, 7, 20, 10, 0, tzinfo=UTC),
    )
    repository = FakeSocialMeetRepository(requester)
    repository.public_record = None
    service = SocialMeetIdentityService(repository)

    with pytest.raises(SocialMeetDomainError) as error:
        service.get_public_profile(requester.auth_user_id, uuid4())

    assert error.value.code == "profile_not_found"


def test_blocked_profile_cannot_self_publish_or_unpublish() -> None:
    record = _record(visibility=ProfileVisibility.BLOCKED_OR_SUSPENDED)
    service = SocialMeetIdentityService(FakeSocialMeetRepository(record))

    with pytest.raises(SocialMeetDomainError, match="current state") as publish_error:
        service.upsert_profile(record.auth_user_id, _profile())
    with pytest.raises(SocialMeetDomainError) as unpublish_error:
        service.unpublish(record.auth_user_id)

    assert publish_error.value.code == "profile_unavailable"
    assert unpublish_error.value.code == "profile_unavailable"


def test_unpublish_removes_profile_from_discovery_state() -> None:
    record = _record(
        profile_id=uuid4(),
        visibility=ProfileVisibility.DISCOVERABLE,
        consent_version=SUPPORTED_CONSENT_VERSION,
        consented_at=datetime(2026, 7, 20, 10, 0, tzinfo=UTC),
    )
    service = SocialMeetIdentityService(FakeSocialMeetRepository(record))

    state = service.unpublish(record.auth_user_id)

    assert state.profile_visibility is ProfileVisibility.PRIVATE
    assert state.consent_version == SUPPORTED_CONSENT_VERSION


def _profile(**overrides: object) -> ProfileUpsertRequest:
    payload: dict[str, object] = {
        "displayName": "Ada",
        "preferredThemes": ["industrial_history"],
        "fingerprintInputs": {"themeTags": ["industrial_history"]},
    }
    payload.update(overrides)
    return ProfileUpsertRequest.model_validate(payload)


def _record(
    *,
    auth_user_id: UUID | None = None,
    social_user_id: UUID | None = None,
    profile_id: UUID | None = None,
    visibility: ProfileVisibility = ProfileVisibility.DRAFT,
    consent_version: str | None = None,
    consented_at: datetime | None = None,
) -> SocialMeetProfileRecord:
    return SocialMeetProfileRecord(
        auth_user_id=auth_user_id or uuid4(),
        social_user_id=social_user_id or uuid4(),
        profile_id=profile_id,
        display_name="Ada" if profile_id else None,
        avatar_ref=None,
        short_bio="Industrial history",
        preferred_themes=("industrial_history",),
        favorite_eras=(),
        interest_places=(),
        learning_goals=(),
        knowledge_badges=(),
        knowledge_fingerprint_summary={"themeTags": ["industrial_history"]},
        profile_visibility=visibility,
        consent_version=consent_version,
        consented_at=consented_at,
        updated_at=datetime(2026, 7, 20, 12, 0, tzinfo=UTC),
    )
