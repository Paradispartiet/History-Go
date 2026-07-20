from __future__ import annotations

from dataclasses import replace
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import pytest

from app.domains.social_meet.abuse_models import (
    RESTRICTED_INVITE_POLICY,
    STANDARD_INVITE_POLICY,
    InviteAbusePolicyTier,
    InviteAbuseSnapshot,
)
from app.domains.social_meet.abuse_service import SocialMeetInviteAbuseService
from app.domains.social_meet.models import ProfileVisibility, SocialMeetProfileRecord
from app.domains.social_meet.service import SUPPORTED_CONSENT_VERSION, SocialMeetDomainError

NOW = datetime(2026, 7, 20, 15, 0, tzinfo=UTC)
_DEFAULT_SNAPSHOT = object()


class FakeIdentityRepository:
    def __init__(
        self,
        sender: SocialMeetProfileRecord,
        recipient: SocialMeetProfileRecord | None,
    ) -> None:
        self.sender = sender
        self.recipient = recipient

    def get_or_create_for_user(self, auth_user_id: UUID) -> SocialMeetProfileRecord:
        assert auth_user_id == self.sender.auth_user_id
        return self.sender

    def get_profile_by_public_id(self, profile_id: UUID) -> SocialMeetProfileRecord | None:
        if self.recipient is not None and self.recipient.profile_id == profile_id:
            return self.recipient
        return None


class FakeAbuseRepository:
    def __init__(self, snapshot: InviteAbuseSnapshot | None) -> None:
        self.snapshot = snapshot
        self.last_context_type: str | None = None
        self.last_context_id: str | None = None

    def get_invite_creation_snapshot(
        self,
        *,
        sender_auth_user_id: UUID,
        sender_profile_id: UUID,
        recipient_auth_user_id: UUID,
        recipient_profile_id: UUID,
        context_type: str,
        context_id: str,
        now: datetime,
    ) -> InviteAbuseSnapshot | None:
        self.last_context_type = context_type
        self.last_context_id = context_id
        return self.snapshot


class FakeInteractionGuard:
    def __init__(self) -> None:
        self.error: SocialMeetDomainError | None = None
        self.calls: list[tuple[UUID, UUID]] = []

    def ensure_interaction_allowed(self, first_profile_id: UUID, second_profile_id: UUID) -> None:
        self.calls.append((first_profile_id, second_profile_id))
        if self.error is not None:
            raise self.error


def test_standard_profile_is_allowed_under_limits() -> None:
    service, repository, guard, sender, recipient = _service()

    allowance = service.ensure_invite_creation_allowed(
        sender.auth_user_id,
        _profile_id(recipient),
        context_type=" Place ",
        context_id=" factory_memory ",
        now=NOW,
    )

    assert allowance.policy_tier is InviteAbusePolicyTier.STANDARD
    assert allowance.checked_at == NOW
    assert repository.last_context_type == "place"
    assert repository.last_context_id == "factory_memory"
    assert guard.calls == [(_profile_id(sender), _profile_id(recipient))]


def test_new_profile_uses_restricted_policy() -> None:
    snapshot = _snapshot(sender_social_meet_started_at=NOW - timedelta(days=2))
    service, _, _, sender, recipient = _service(snapshot=snapshot)

    allowance = service.ensure_invite_creation_allowed(
        sender.auth_user_id,
        _profile_id(recipient),
        context_type="place",
        context_id="history_context",
        now=NOW,
    )

    assert allowance.policy_tier is InviteAbusePolicyTier.RESTRICTED


def test_unresolved_reports_use_restricted_policy() -> None:
    snapshot = _snapshot(unresolved_reports_against_sender=1)
    service, _, _, sender, recipient = _service(snapshot=snapshot)

    allowance = service.ensure_invite_creation_allowed(
        sender.auth_user_id,
        _profile_id(recipient),
        context_type="topic",
        context_id="industrial_history",
        now=NOW,
    )

    assert allowance.policy_tier is InviteAbusePolicyTier.RESTRICTED


def test_duplicate_active_invite_is_rejected() -> None:
    snapshot = _snapshot(duplicate_active_invite=True)
    service, _, _, sender, recipient = _service(snapshot=snapshot)

    error = _assert_denied(service, sender, recipient)

    assert error.code == "duplicate_active_invite"


def test_recent_recipient_report_is_non_enumerating() -> None:
    snapshot = _snapshot(last_recipient_report_at=NOW - timedelta(hours=1))
    service, _, _, sender, recipient = _service(snapshot=snapshot)

    error = _assert_denied(service, sender, recipient)

    assert error.code == "recipient_unavailable"


def test_recent_pair_block_is_non_enumerating_after_unblock() -> None:
    snapshot = _snapshot(last_pair_block_at=NOW - timedelta(hours=6))
    service, _, _, sender, recipient = _service(snapshot=snapshot)

    error = _assert_denied(service, sender, recipient)

    assert error.code == "recipient_unavailable"


def test_decline_cooldown_is_rate_limited() -> None:
    snapshot = _snapshot(last_declined_at=NOW - timedelta(hours=2))
    service, _, _, sender, recipient = _service(snapshot=snapshot)

    error = _assert_denied(service, sender, recipient)

    assert error.code == "rate_limited"


def test_repeated_cancellations_are_rate_limited() -> None:
    snapshot = _snapshot(cancellation_day_count=3)
    service, _, _, sender, recipient = _service(snapshot=snapshot)

    error = _assert_denied(service, sender, recipient)

    assert error.code == "rate_limited"


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("sender_minute_count", STANDARD_INVITE_POLICY.sender_per_minute),
        ("sender_hour_count", STANDARD_INVITE_POLICY.sender_per_hour),
        ("sender_day_count", STANDARD_INVITE_POLICY.sender_per_day),
        ("pair_day_count", STANDARD_INVITE_POLICY.pair_per_day),
        ("recipient_day_count", STANDARD_INVITE_POLICY.recipient_per_day),
    ],
)
def test_standard_rate_thresholds_fail_closed(field: str, value: int) -> None:
    snapshot = replace(_snapshot(), **{field: value})
    service, _, _, sender, recipient = _service(snapshot=snapshot)

    error = _assert_denied(service, sender, recipient)

    assert error.code == "rate_limited"


def test_restricted_rate_threshold_is_lower() -> None:
    snapshot = _snapshot(
        sender_social_meet_started_at=NOW - timedelta(days=1),
        sender_hour_count=RESTRICTED_INVITE_POLICY.sender_per_hour,
    )
    service, _, _, sender, recipient = _service(snapshot=snapshot)

    error = _assert_denied(service, sender, recipient)

    assert error.code == "rate_limited"


def test_invalid_context_is_rejected_before_repository_lookup() -> None:
    service, repository, _, sender, recipient = _service()

    with pytest.raises(SocialMeetDomainError) as error:
        service.ensure_invite_creation_allowed(
            sender.auth_user_id,
            _profile_id(recipient),
            context_type="gps",
            context_id="precise_location",
            now=NOW,
        )

    assert error.value.code == "invalid_invite_context"
    assert repository.last_context_type is None


def test_sender_must_be_currently_discoverable_and_consented() -> None:
    sender = _profile(visibility=ProfileVisibility.PRIVATE)
    service, _, _, _, recipient = _service(sender=sender)

    with pytest.raises(SocialMeetDomainError) as error:
        service.ensure_invite_creation_allowed(
            sender.auth_user_id,
            _profile_id(recipient),
            context_type="place",
            context_id="museum",
            now=NOW,
        )

    assert error.value.code == "profile_not_published"


def test_recipient_unavailability_is_non_enumerating() -> None:
    recipient = _profile(visibility=ProfileVisibility.PAUSED)
    service, _, _, sender, _ = _service(recipient=recipient)

    with pytest.raises(SocialMeetDomainError) as error:
        service.ensure_invite_creation_allowed(
            sender.auth_user_id,
            _profile_id(recipient),
            context_type="place",
            context_id="museum",
            now=NOW,
        )

    assert error.value.code == "recipient_unavailable"


def test_self_invite_is_rejected() -> None:
    sender = _profile()
    service, _, _, _, _ = _service(sender=sender, recipient=sender)

    with pytest.raises(SocialMeetDomainError) as error:
        service.ensure_invite_creation_allowed(
            sender.auth_user_id,
            _profile_id(sender),
            context_type="place",
            context_id="museum",
            now=NOW,
        )

    assert error.value.code == "invalid_invite_target"


def test_interaction_guard_failure_is_preserved() -> None:
    service, _, guard, sender, recipient = _service()
    guard.error = SocialMeetDomainError(
        code="interaction_blocked",
        detail="The requested Social Meet interaction is unavailable",
    )

    error = _assert_denied(service, sender, recipient)

    assert error.code == "interaction_blocked"


def test_missing_abuse_snapshot_fails_closed() -> None:
    service, _, _, sender, recipient = _service(snapshot=None)

    error = _assert_denied(service, sender, recipient)

    assert error.code == "profile_not_published"


def _assert_denied(
    service: SocialMeetInviteAbuseService,
    sender: SocialMeetProfileRecord,
    recipient: SocialMeetProfileRecord,
) -> SocialMeetDomainError:
    with pytest.raises(SocialMeetDomainError) as error:
        service.ensure_invite_creation_allowed(
            sender.auth_user_id,
            _profile_id(recipient),
            context_type="place",
            context_id="factory_memory",
            now=NOW,
        )
    return error.value


def _service(
    *,
    snapshot: InviteAbuseSnapshot | None | object = _DEFAULT_SNAPSHOT,
    sender: SocialMeetProfileRecord | None = None,
    recipient: SocialMeetProfileRecord | None = None,
) -> tuple[
    SocialMeetInviteAbuseService,
    FakeAbuseRepository,
    FakeInteractionGuard,
    SocialMeetProfileRecord,
    SocialMeetProfileRecord,
]:
    sender_record = sender or _profile()
    recipient_record = recipient or _profile()
    resolved_snapshot = _snapshot() if snapshot is _DEFAULT_SNAPSHOT else snapshot
    assert resolved_snapshot is None or isinstance(resolved_snapshot, InviteAbuseSnapshot)
    abuse_repository = FakeAbuseRepository(resolved_snapshot)
    guard = FakeInteractionGuard()
    service = SocialMeetInviteAbuseService(
        FakeIdentityRepository(sender_record, recipient_record),  # type: ignore[arg-type]
        abuse_repository,
        guard,
    )
    return service, abuse_repository, guard, sender_record, recipient_record


def _profile(
    *,
    visibility: ProfileVisibility = ProfileVisibility.DISCOVERABLE,
    consented: bool = True,
) -> SocialMeetProfileRecord:
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
        consent_version=SUPPORTED_CONSENT_VERSION if consented else None,
        consented_at=NOW if consented else None,
        updated_at=NOW,
    )


def _profile_id(profile: SocialMeetProfileRecord) -> UUID:
    assert profile.profile_id is not None
    return profile.profile_id


def _snapshot(**overrides: object) -> InviteAbuseSnapshot:
    snapshot = InviteAbuseSnapshot(
        sender_social_meet_started_at=NOW - timedelta(days=30),
        sender_minute_count=0,
        sender_hour_count=0,
        sender_day_count=0,
        pair_day_count=0,
        recipient_day_count=0,
        cancellation_day_count=0,
        duplicate_active_invite=False,
        last_declined_at=None,
        last_recipient_report_at=None,
        last_pair_block_at=None,
        unresolved_reports_against_sender=0,
    )
    return replace(snapshot, **overrides)
