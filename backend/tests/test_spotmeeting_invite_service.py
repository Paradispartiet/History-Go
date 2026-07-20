from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import pytest

from app.domains.social_meet.models import ProfileVisibility, SocialMeetProfileRecord
from app.domains.social_meet.service import SUPPORTED_CONSENT_VERSION, SocialMeetDomainError
from app.domains.social_meet.spotmeeting_models import (
    CreateSpotmeetingInviteRequest,
    SpotmeetingContext,
    SpotmeetingContextType,
    SpotmeetingInviteRecord,
    SpotmeetingInviteState,
    SpotmeetingPresetId,
)
from app.domains.social_meet.spotmeeting_repository import InviteCreateResult
from app.domains.social_meet.spotmeeting_service import SpotmeetingInviteService

NOW = datetime(2026, 7, 20, 16, 0, tzinfo=UTC)


class FakeIdentityRepository:
    def __init__(self, sender: SocialMeetProfileRecord, recipient: SocialMeetProfileRecord) -> None:
        self.sender = sender
        self.recipient = recipient

    def get_or_create_for_user(self, auth_user_id: UUID) -> SocialMeetProfileRecord:
        assert auth_user_id == self.sender.auth_user_id
        return self.sender

    def get_profile_by_public_id(self, profile_id: UUID) -> SocialMeetProfileRecord | None:
        return self.recipient if self.recipient.profile_id == profile_id else None


class FakeInviteRepository:
    def __init__(self, record: SpotmeetingInviteRecord) -> None:
        self.record = record
        self.existing: SpotmeetingInviteRecord | None = None
        self.create_result = InviteCreateResult(record)
        self.transition_returns_none = False
        self.expire_calls = 0
        self.last_transition: tuple[SpotmeetingInviteState, SpotmeetingInviteState] | None = None

    def find_by_idempotency_key(
        self,
        sender_auth_user_id: UUID,
        idempotency_key: str,
    ) -> SpotmeetingInviteRecord | None:
        return self.existing

    def create_invite_atomic(self, **kwargs: object) -> InviteCreateResult:
        return self.create_result

    def expire_stale_for_participant(self, auth_user_id: UUID, now: datetime) -> int:
        self.expire_calls += 1
        return 0

    def list_participant_invites(
        self,
        auth_user_id: UUID,
        *,
        cursor: int,
        limit: int,
        state: SpotmeetingInviteState | None = None,
    ) -> tuple[list[SpotmeetingInviteRecord], bool]:
        if state is not None and self.record.state is not state:
            return [], False
        return [self.record], False

    def get_participant_invite(
        self,
        auth_user_id: UUID,
        invite_id: UUID,
    ) -> SpotmeetingInviteRecord | None:
        return self.record if invite_id == self.record.invite_id else None

    def transition_invite(
        self,
        *,
        auth_user_id: UUID,
        invite_id: UUID,
        current_state: SpotmeetingInviteState,
        next_state: SpotmeetingInviteState,
        expected_version: int,
        now: datetime,
    ) -> SpotmeetingInviteRecord | None:
        self.last_transition = (current_state, next_state)
        if self.transition_returns_none:
            return None
        self.record = _record(
            sender_auth_user_id=self.record.sender_auth_user_id,
            recipient_auth_user_id=self.record.recipient_auth_user_id,
            sender_profile_id=self.record.sender_profile_id,
            recipient_profile_id=self.record.recipient_profile_id,
            invite_id=self.record.invite_id,
            state=next_state,
            version=self.record.version + 1,
            sync_version=self.record.sync_version + 1,
        )
        return self.record


class FakeAbuseService:
    def __init__(self) -> None:
        self.calls = 0
        self.error: SocialMeetDomainError | None = None

    def ensure_invite_creation_allowed(self, *args: object, **kwargs: object) -> object:
        self.calls += 1
        if self.error is not None:
            raise self.error
        return object()


class FakeInteractionGuard:
    def __init__(self) -> None:
        self.calls: list[tuple[UUID, UUID]] = []
        self.error: SocialMeetDomainError | None = None

    def ensure_interaction_allowed(self, first_profile_id: UUID, second_profile_id: UUID) -> None:
        self.calls.append((first_profile_id, second_profile_id))
        if self.error is not None:
            raise self.error


def test_lists_existing_server_presets() -> None:
    presets = SpotmeetingInviteService.list_presets()

    assert [preset.preset_message_id for preset in presets] == list(SpotmeetingPresetId)


def test_create_invite_runs_abuse_preflight_and_returns_public_ids() -> None:
    service, repository, abuse, _, sender, recipient = _service()

    invite = service.create_invite(sender.auth_user_id, _request(_profile_id(recipient)), now=NOW)

    assert abuse.calls == 1
    assert invite.sender_profile_id == _profile_id(sender)
    assert invite.recipient_profile_id == _profile_id(recipient)
    assert invite.state is SpotmeetingInviteState.PENDING
    assert invite.actor_can_act.can_cancel is True
    assert invite.actor_can_act.can_accept is False
    assert repository.record.sender_auth_user_id not in invite.model_dump().values()


def test_idempotent_replay_skips_abuse_preflight() -> None:
    service, repository, abuse, _, sender, recipient = _service()
    repository.existing = repository.record

    invite = service.create_invite(sender.auth_user_id, _request(_profile_id(recipient)), now=NOW)

    assert invite.invite_id == repository.record.invite_id
    assert abuse.calls == 0


def test_idempotency_key_reuse_for_different_payload_is_conflict() -> None:
    service, repository, _, _, sender, recipient = _service()
    repository.existing = repository.record
    request = _request(_profile_id(recipient)).model_copy(
        update={"context": _context(context_id="different_context")}
    )

    with pytest.raises(SocialMeetDomainError) as error:
        service.create_invite(sender.auth_user_id, request, now=NOW)

    assert error.value.code == "idempotency_conflict"


@pytest.mark.parametrize(
    "failure_code",
    [
        "recipient_unavailable",
        "rate_limited",
        "duplicate_active_invite",
        "conflict",
    ],
)
def test_atomic_creation_failures_preserve_stable_codes(failure_code: str) -> None:
    service, repository, _, _, sender, recipient = _service()
    repository.create_result = InviteCreateResult(None, failure_code)

    with pytest.raises(SocialMeetDomainError) as error:
        service.create_invite(sender.auth_user_id, _request(_profile_id(recipient)), now=NOW)

    assert error.value.code == failure_code


def test_inbox_expires_stale_records_and_advances_monotonic_cursor() -> None:
    service, repository, _, _, sender, _ = _service()

    page = service.list_inbox(sender.auth_user_id, cursor=4, limit=20, now=NOW)

    assert repository.expire_calls == 1
    assert page.cursor == repository.record.sync_version
    assert page.has_more is False
    assert page.invites[0].sync_version == repository.record.sync_version


def test_recipient_accepts_pending_invite_and_interaction_is_revalidated() -> None:
    service, repository, _, guard, _, recipient = _service()

    invite = service.accept_invite(recipient.auth_user_id, repository.record.invite_id, now=NOW)

    assert invite.state is SpotmeetingInviteState.ACCEPTED
    assert repository.last_transition == (
        SpotmeetingInviteState.PENDING,
        SpotmeetingInviteState.ACCEPTED,
    )
    assert len(guard.calls) == 1


def test_sender_cannot_accept_or_decline_pending_invite() -> None:
    service, repository, _, _, sender, _ = _service()

    for action in (service.accept_invite, service.decline_invite):
        with pytest.raises(SocialMeetDomainError) as error:
            action(sender.auth_user_id, repository.record.invite_id, now=NOW)
        assert error.value.code == "invalid_invite_transition"


def test_recipient_can_decline_pending_invite() -> None:
    service, repository, _, _, _, recipient = _service()

    invite = service.decline_invite(recipient.auth_user_id, repository.record.invite_id, now=NOW)

    assert invite.state is SpotmeetingInviteState.DECLINED


def test_only_sender_can_cancel_pending_but_either_can_cancel_accepted() -> None:
    service, repository, _, _, sender, recipient = _service()

    with pytest.raises(SocialMeetDomainError) as error:
        service.cancel_invite(recipient.auth_user_id, repository.record.invite_id, now=NOW)
    assert error.value.code == "invalid_invite_transition"

    cancelled = service.cancel_invite(sender.auth_user_id, repository.record.invite_id, now=NOW)
    assert cancelled.state is SpotmeetingInviteState.CANCELLED

    repository.record = _record(
        sender_auth_user_id=sender.auth_user_id,
        recipient_auth_user_id=recipient.auth_user_id,
        sender_profile_id=_profile_id(sender),
        recipient_profile_id=_profile_id(recipient),
        state=SpotmeetingInviteState.ACCEPTED,
    )
    cancelled_by_recipient = service.cancel_invite(
        recipient.auth_user_id,
        repository.record.invite_id,
        now=NOW,
    )
    assert cancelled_by_recipient.state is SpotmeetingInviteState.CANCELLED


def test_either_participant_can_complete_accepted_invite_and_repeat_is_idempotent() -> None:
    service, repository, _, guard, sender, recipient = _service()
    repository.record = _record(
        sender_auth_user_id=sender.auth_user_id,
        recipient_auth_user_id=recipient.auth_user_id,
        sender_profile_id=_profile_id(sender),
        recipient_profile_id=_profile_id(recipient),
        state=SpotmeetingInviteState.ACCEPTED,
    )

    completed = service.complete_invite(sender.auth_user_id, repository.record.invite_id, now=NOW)
    repeated = service.complete_invite(sender.auth_user_id, repository.record.invite_id, now=NOW)

    assert completed.state is SpotmeetingInviteState.COMPLETED
    assert repeated.state is SpotmeetingInviteState.COMPLETED
    assert len(guard.calls) == 1


def test_expired_invite_rejects_non_safety_transition() -> None:
    service, repository, _, _, _, recipient = _service()
    repository.record = _record(
        sender_auth_user_id=repository.record.sender_auth_user_id,
        recipient_auth_user_id=recipient.auth_user_id,
        sender_profile_id=repository.record.sender_profile_id,
        recipient_profile_id=_profile_id(recipient),
        state=SpotmeetingInviteState.EXPIRED,
    )

    with pytest.raises(SocialMeetDomainError) as error:
        service.accept_invite(recipient.auth_user_id, repository.record.invite_id, now=NOW)

    assert error.value.code == "invite_expired"


def test_expected_version_and_compare_and_swap_conflicts_are_stable() -> None:
    service, repository, _, _, _, recipient = _service()

    with pytest.raises(SocialMeetDomainError) as stale_error:
        service.accept_invite(
            recipient.auth_user_id,
            repository.record.invite_id,
            expected_version=999,
            now=NOW,
        )
    assert stale_error.value.code == "conflict"

    repository.transition_returns_none = True
    with pytest.raises(SocialMeetDomainError) as race_error:
        service.accept_invite(recipient.auth_user_id, repository.record.invite_id, now=NOW)
    assert race_error.value.code == "conflict"


def test_unknown_invite_is_non_enumerating() -> None:
    service, _, _, _, _, recipient = _service()

    with pytest.raises(SocialMeetDomainError) as error:
        service.accept_invite(recipient.auth_user_id, uuid4(), now=NOW)

    assert error.value.code == "unknown_invite"


def _service() -> tuple[
    SpotmeetingInviteService,
    FakeInviteRepository,
    FakeAbuseService,
    FakeInteractionGuard,
    SocialMeetProfileRecord,
    SocialMeetProfileRecord,
]:
    sender = _profile()
    recipient = _profile()
    repository = FakeInviteRepository(
        _record(
            sender_auth_user_id=sender.auth_user_id,
            recipient_auth_user_id=recipient.auth_user_id,
            sender_profile_id=_profile_id(sender),
            recipient_profile_id=_profile_id(recipient),
        )
    )
    abuse = FakeAbuseService()
    guard = FakeInteractionGuard()
    service = SpotmeetingInviteService(
        FakeIdentityRepository(sender, recipient),  # type: ignore[arg-type]
        repository,  # type: ignore[arg-type]
        abuse,  # type: ignore[arg-type]
        guard,
    )
    return service, repository, abuse, guard, sender, recipient


def _profile() -> SocialMeetProfileRecord:
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
        profile_visibility=ProfileVisibility.DISCOVERABLE,
        consent_version=SUPPORTED_CONSENT_VERSION,
        consented_at=NOW - timedelta(days=30),
        updated_at=NOW,
    )


def _request(recipient_profile_id: UUID) -> CreateSpotmeetingInviteRequest:
    return CreateSpotmeetingInviteRequest(
        recipient_profile_id=recipient_profile_id,
        context=_context(),
        preset_message_id=SpotmeetingPresetId.COMPARE_PLACE_LEARNING,
        idempotency_key="retry-key-0001",
    )


def _context(*, context_id: str = "factory_memory") -> SpotmeetingContext:
    return SpotmeetingContext(
        context_type=SpotmeetingContextType.PLACE,
        context_id=context_id,
        title="Factory Memory",
        reason="Shared learning context",
        source_surface="place_card",
    )


def _record(
    *,
    sender_auth_user_id: UUID,
    recipient_auth_user_id: UUID,
    sender_profile_id: UUID,
    recipient_profile_id: UUID,
    invite_id: UUID | None = None,
    state: SpotmeetingInviteState = SpotmeetingInviteState.PENDING,
    version: int = 1,
    sync_version: int = 7,
) -> SpotmeetingInviteRecord:
    return SpotmeetingInviteRecord(
        invite_id=invite_id or uuid4(),
        sender_auth_user_id=sender_auth_user_id,
        recipient_auth_user_id=recipient_auth_user_id,
        sender_profile_id=sender_profile_id,
        recipient_profile_id=recipient_profile_id,
        context_type=SpotmeetingContextType.PLACE,
        context_id="factory_memory",
        context_title="Factory Memory",
        context_reason="Shared learning context",
        source_surface="place_card",
        preset_message_id=SpotmeetingPresetId.COMPARE_PLACE_LEARNING,
        state=state,
        created_at=NOW,
        updated_at=NOW,
        expires_at=NOW + timedelta(days=14),
        version=version,
        sync_version=sync_version,
        idempotency_key="retry-key-0001",
    )


def _profile_id(profile: SocialMeetProfileRecord) -> UUID:
    assert profile.profile_id is not None
    return profile.profile_id
