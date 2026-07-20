from __future__ import annotations

from datetime import UTC, datetime
from typing import Protocol
from uuid import UUID

from app.domains.social_meet.abuse_service import SocialMeetInviteAbuseService
from app.domains.social_meet.repository import SocialMeetIdentityRepository
from app.domains.social_meet.service import SUPPORTED_CONSENT_VERSION, SocialMeetDomainError
from app.domains.social_meet.spotmeeting_models import (
    SPOTMEETING_PRESETS,
    CreateSpotmeetingInviteRequest,
    SpotmeetingActorActions,
    SpotmeetingContext,
    SpotmeetingInvitePage,
    SpotmeetingInviteRecord,
    SpotmeetingInviteState,
    SpotmeetingInviteView,
    SpotmeetingPreset,
)
from app.domains.social_meet.spotmeeting_repository import PostgresSpotmeetingInviteRepository


class SocialMeetInteractionGuard(Protocol):
    def ensure_interaction_allowed(
        self,
        first_profile_id: UUID,
        second_profile_id: UUID,
    ) -> None: ...


class SpotmeetingInviteService:
    def __init__(
        self,
        identity_repository: SocialMeetIdentityRepository,
        invite_repository: PostgresSpotmeetingInviteRepository,
        abuse_service: SocialMeetInviteAbuseService,
        interaction_guard: SocialMeetInteractionGuard,
    ) -> None:
        self._identity_repository = identity_repository
        self._invite_repository = invite_repository
        self._abuse_service = abuse_service
        self._interaction_guard = interaction_guard

    @staticmethod
    def list_presets() -> list[SpotmeetingPreset]:
        return list(SPOTMEETING_PRESETS)

    def create_invite(
        self,
        auth_user_id: UUID,
        request: CreateSpotmeetingInviteRequest,
        *,
        now: datetime | None = None,
    ) -> SpotmeetingInviteView:
        checked_at = now or datetime.now(UTC)
        existing = self._invite_repository.find_by_idempotency_key(
            auth_user_id,
            request.idempotency_key,
        )
        if existing is not None:
            if not _record_matches_request(existing, request):
                raise SocialMeetDomainError(
                    code="idempotency_conflict",
                    detail="The idempotency key is already bound to another invite request",
                )
            return _to_view(existing, auth_user_id)

        sender = self._identity_repository.get_or_create_for_user(auth_user_id)
        recipient = self._identity_repository.get_profile_by_public_id(request.recipient_profile_id)
        if sender.profile_id is None:
            raise SocialMeetDomainError(
                code="profile_not_published",
                detail="A published Social Meet profile is required to create invitations",
            )
        if recipient is None or recipient.profile_id is None:
            raise _recipient_unavailable()

        self._abuse_service.ensure_invite_creation_allowed(
            auth_user_id,
            request.recipient_profile_id,
            context_type=request.context.context_type.value,
            context_id=request.context.context_id,
            now=checked_at,
        )
        result = self._invite_repository.create_invite_atomic(
            sender_auth_user_id=auth_user_id,
            sender_profile_id=sender.profile_id,
            recipient_auth_user_id=recipient.auth_user_id,
            recipient_profile_id=recipient.profile_id,
            request=request,
            supported_consent_version=SUPPORTED_CONSENT_VERSION,
            now=checked_at,
        )
        if result.record is not None:
            return _to_view(result.record, auth_user_id)
        raise _creation_failure(result.failure_code)

    def list_inbox(
        self,
        auth_user_id: UUID,
        *,
        cursor: int = 0,
        limit: int = 50,
        state: SpotmeetingInviteState | None = None,
        now: datetime | None = None,
    ) -> SpotmeetingInvitePage:
        checked_at = now or datetime.now(UTC)
        self._invite_repository.expire_stale_for_participant(auth_user_id, checked_at)
        records, has_more = self._invite_repository.list_participant_invites(
            auth_user_id,
            cursor=cursor,
            limit=limit,
            state=state,
        )
        next_cursor = records[-1].sync_version if records else cursor
        return SpotmeetingInvitePage(
            invites=[_to_view(record, auth_user_id) for record in records],
            cursor=next_cursor,
            has_more=has_more,
        )

    def sync(
        self,
        auth_user_id: UUID,
        *,
        cursor: int = 0,
        limit: int = 100,
        now: datetime | None = None,
    ) -> SpotmeetingInvitePage:
        return self.list_inbox(
            auth_user_id,
            cursor=cursor,
            limit=limit,
            now=now,
        )

    def accept_invite(
        self,
        auth_user_id: UUID,
        invite_id: UUID,
        *,
        expected_version: int | None = None,
        now: datetime | None = None,
    ) -> SpotmeetingInviteView:
        return self._transition(
            auth_user_id,
            invite_id,
            SpotmeetingInviteState.ACCEPTED,
            expected_version=expected_version,
            now=now,
        )

    def decline_invite(
        self,
        auth_user_id: UUID,
        invite_id: UUID,
        *,
        expected_version: int | None = None,
        now: datetime | None = None,
    ) -> SpotmeetingInviteView:
        return self._transition(
            auth_user_id,
            invite_id,
            SpotmeetingInviteState.DECLINED,
            expected_version=expected_version,
            now=now,
        )

    def cancel_invite(
        self,
        auth_user_id: UUID,
        invite_id: UUID,
        *,
        expected_version: int | None = None,
        now: datetime | None = None,
    ) -> SpotmeetingInviteView:
        return self._transition(
            auth_user_id,
            invite_id,
            SpotmeetingInviteState.CANCELLED,
            expected_version=expected_version,
            now=now,
        )

    def complete_invite(
        self,
        auth_user_id: UUID,
        invite_id: UUID,
        *,
        expected_version: int | None = None,
        now: datetime | None = None,
    ) -> SpotmeetingInviteView:
        return self._transition(
            auth_user_id,
            invite_id,
            SpotmeetingInviteState.COMPLETED,
            expected_version=expected_version,
            now=now,
        )

    def _transition(
        self,
        auth_user_id: UUID,
        invite_id: UUID,
        next_state: SpotmeetingInviteState,
        *,
        expected_version: int | None,
        now: datetime | None,
    ) -> SpotmeetingInviteView:
        checked_at = now or datetime.now(UTC)
        self._invite_repository.expire_stale_for_participant(auth_user_id, checked_at)
        record = self._invite_repository.get_participant_invite(auth_user_id, invite_id)
        if record is None:
            raise SocialMeetDomainError(
                code="unknown_invite",
                detail="The requested Spotmeeting invite is not available",
            )

        if expected_version is not None and expected_version != record.version:
            raise _conflict()
        if record.state is SpotmeetingInviteState.EXPIRED:
            raise SocialMeetDomainError(
                code="invite_expired",
                detail="The Spotmeeting invite has expired",
            )
        if next_state is SpotmeetingInviteState.COMPLETED and record.state is next_state:
            return _to_view(record, auth_user_id)

        is_sender = auth_user_id == record.sender_auth_user_id
        is_recipient = auth_user_id == record.recipient_auth_user_id
        if not _transition_allowed(
            record.state,
            next_state,
            is_sender=is_sender,
            is_recipient=is_recipient,
        ):
            raise SocialMeetDomainError(
                code="invalid_invite_transition",
                detail="The requested Spotmeeting invite transition is not allowed",
            )

        if next_state in {SpotmeetingInviteState.ACCEPTED, SpotmeetingInviteState.COMPLETED}:
            self._interaction_guard.ensure_interaction_allowed(
                record.sender_profile_id,
                record.recipient_profile_id,
            )

        updated = self._invite_repository.transition_invite(
            auth_user_id=auth_user_id,
            invite_id=invite_id,
            current_state=record.state,
            next_state=next_state,
            expected_version=record.version,
            now=checked_at,
        )
        if updated is None:
            raise _conflict()
        return _to_view(updated, auth_user_id)


def _transition_allowed(
    current_state: SpotmeetingInviteState,
    next_state: SpotmeetingInviteState,
    *,
    is_sender: bool,
    is_recipient: bool,
) -> bool:
    if current_state is SpotmeetingInviteState.PENDING:
        if next_state in {SpotmeetingInviteState.ACCEPTED, SpotmeetingInviteState.DECLINED}:
            return is_recipient
        if next_state is SpotmeetingInviteState.CANCELLED:
            return is_sender
        return False
    if current_state is SpotmeetingInviteState.ACCEPTED and next_state in {
        SpotmeetingInviteState.CANCELLED,
        SpotmeetingInviteState.COMPLETED,
    }:
        return is_sender or is_recipient
    return False


def _to_view(record: SpotmeetingInviteRecord, auth_user_id: UUID) -> SpotmeetingInviteView:
    is_sender = auth_user_id == record.sender_auth_user_id
    is_recipient = auth_user_id == record.recipient_auth_user_id
    is_participant = is_sender or is_recipient
    actions = SpotmeetingActorActions(
        can_accept=is_recipient and record.state is SpotmeetingInviteState.PENDING,
        can_decline=is_recipient and record.state is SpotmeetingInviteState.PENDING,
        can_cancel=(
            (is_sender and record.state is SpotmeetingInviteState.PENDING)
            or (is_participant and record.state is SpotmeetingInviteState.ACCEPTED)
        ),
        can_complete=is_participant and record.state is SpotmeetingInviteState.ACCEPTED,
        can_report=is_participant and record.state is not SpotmeetingInviteState.BLOCKED,
        can_block=is_participant and record.state is not SpotmeetingInviteState.BLOCKED,
    )
    return SpotmeetingInviteView(
        invite_id=record.invite_id,
        sender_profile_id=record.sender_profile_id,
        recipient_profile_id=record.recipient_profile_id,
        context=SpotmeetingContext(
            context_type=record.context_type,
            context_id=record.context_id,
            title=record.context_title,
            reason=record.context_reason,
            source_surface=record.source_surface,
        ),
        preset_message_id=record.preset_message_id,
        state=record.state,
        created_at=record.created_at,
        updated_at=record.updated_at,
        expires_at=record.expires_at,
        version=record.version,
        sync_version=record.sync_version,
        actor_can_act=actions,
    )


def _record_matches_request(
    record: SpotmeetingInviteRecord,
    request: CreateSpotmeetingInviteRequest,
) -> bool:
    return bool(
        record.recipient_profile_id == request.recipient_profile_id
        and record.context_type is request.context.context_type
        and record.context_id == request.context.context_id
        and record.context_title == request.context.title
        and record.context_reason == request.context.reason
        and record.source_surface == request.context.source_surface
        and record.preset_message_id is request.preset_message_id
    )


def _creation_failure(code: str | None) -> SocialMeetDomainError:
    messages = {
        "conflict": "Concurrent Spotmeeting state changed; retry with fresh server state",
        "duplicate_active_invite": "An active Spotmeeting invite already exists for this context",
        "idempotency_conflict": "The idempotency key is already bound to another invite request",
        "profile_not_published": (
            "A published Social Meet profile is required to create invitations"
        ),
        "rate_limited": "The Spotmeeting invite cannot be created at this time",
        "recipient_unavailable": "The requested Social Meet recipient is unavailable",
    }
    resolved_code = code or "conflict"
    return SocialMeetDomainError(
        code=resolved_code,
        detail=messages.get(resolved_code, "The Spotmeeting invite could not be created"),
    )


def _recipient_unavailable() -> SocialMeetDomainError:
    return SocialMeetDomainError(
        code="recipient_unavailable",
        detail="The requested Social Meet recipient is unavailable",
    )


def _conflict() -> SocialMeetDomainError:
    return SocialMeetDomainError(
        code="conflict",
        detail="Concurrent Spotmeeting state changed; refetch and retry",
    )
