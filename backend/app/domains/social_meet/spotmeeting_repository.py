from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import cast
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import Connection, RowMapping
from sqlalchemy.exc import DBAPIError, IntegrityError

from app.core.database import Database
from app.domains.social_meet.abuse_models import evaluate_invite_abuse_snapshot
from app.domains.social_meet.abuse_repository import PostgresSocialMeetAbuseRepository
from app.domains.social_meet.spotmeeting_models import (
    DEFAULT_INVITE_TTL,
    CreateSpotmeetingInviteRequest,
    SpotmeetingContextType,
    SpotmeetingInviteRecord,
    SpotmeetingInviteState,
    SpotmeetingPresetId,
)

_INVITE_COLUMNS = """
  i.id,
  i.created_by,
  i.target_user_id,
  sender.profile_id as sender_profile_id,
  recipient.profile_id as recipient_profile_id,
  i.context_type,
  i.context_id,
  i.context_title,
  i.context_reason,
  i.source_surface,
  i.preset_message_id,
  i.status,
  i.created_at,
  i.updated_at,
  i.expires_at,
  i.version,
  i.sync_version,
  i.idempotency_key
"""


@dataclass(frozen=True, slots=True)
class InviteCreateResult:
    record: SpotmeetingInviteRecord | None
    failure_code: str | None = None
    replayed: bool = False


class PostgresSpotmeetingInviteRepository:
    def __init__(self, database: Database) -> None:
        self._database = database
        self._abuse_repository = PostgresSocialMeetAbuseRepository(database)

    def find_by_idempotency_key(
        self,
        sender_auth_user_id: UUID,
        idempotency_key: str,
    ) -> SpotmeetingInviteRecord | None:
        with self._database.engine.connect() as connection:
            return self._find_by_idempotency_key_on_connection(
                connection,
                sender_auth_user_id,
                idempotency_key,
            )

    def create_invite_atomic(
        self,
        *,
        sender_auth_user_id: UUID,
        sender_profile_id: UUID,
        recipient_auth_user_id: UUID,
        recipient_profile_id: UUID,
        request: CreateSpotmeetingInviteRequest,
        supported_consent_version: str,
        now: datetime,
    ) -> InviteCreateResult:
        try:
            with self._database.engine.connect() as connection:
                with connection.begin():
                    connection.exec_driver_sql("SET TRANSACTION ISOLATION LEVEL SERIALIZABLE")
                    profiles = self._lock_profiles(
                        connection,
                        sender_profile_id=sender_profile_id,
                        recipient_profile_id=recipient_profile_id,
                    )
                    if not _profiles_are_eligible(
                        profiles,
                        sender_auth_user_id=sender_auth_user_id,
                        sender_profile_id=sender_profile_id,
                        recipient_auth_user_id=recipient_auth_user_id,
                        recipient_profile_id=recipient_profile_id,
                        supported_consent_version=supported_consent_version,
                    ):
                        return InviteCreateResult(None, "recipient_unavailable")

                    existing = self._find_by_idempotency_key_on_connection(
                        connection,
                        sender_auth_user_id,
                        request.idempotency_key,
                    )
                    if existing is not None:
                        if _record_matches_request(existing, request):
                            return InviteCreateResult(existing, replayed=True)
                        return InviteCreateResult(None, "idempotency_conflict")

                    if self._active_block_exists(
                        connection,
                        sender_profile_id,
                        recipient_profile_id,
                    ):
                        return InviteCreateResult(None, "recipient_unavailable")

                    snapshot = self._abuse_repository.get_invite_creation_snapshot_on_connection(
                        connection,
                        sender_auth_user_id=sender_auth_user_id,
                        sender_profile_id=sender_profile_id,
                        recipient_auth_user_id=recipient_auth_user_id,
                        recipient_profile_id=recipient_profile_id,
                        context_type=request.context.context_type.value,
                        context_id=request.context.context_id,
                        now=now,
                    )
                    if snapshot is None:
                        return InviteCreateResult(None, "profile_not_published")
                    evaluation = evaluate_invite_abuse_snapshot(snapshot, now)
                    if evaluation.failure_code is not None:
                        return InviteCreateResult(None, evaluation.failure_code)

                    expires_at = now + DEFAULT_INVITE_TTL
                    row = (
                        connection.execute(
                            text(
                                """
                                insert into public.hg_spotmeeting_invites (
                                  created_by,
                                  target_user_id,
                                  context_type,
                                  context_id,
                                  context_title,
                                  context_reason,
                                  source_surface,
                                  preset_message_id,
                                  status,
                                  created_at,
                                  updated_at,
                                  expires_at,
                                  idempotency_key
                                )
                                values (
                                  :created_by,
                                  :target_user_id,
                                  :context_type,
                                  :context_id,
                                  :context_title,
                                  :context_reason,
                                  :source_surface,
                                  :preset_message_id,
                                  'pending',
                                  :now,
                                  :now,
                                  :expires_at,
                                  :idempotency_key
                                )
                                returning
                                  id,
                                  created_by,
                                  target_user_id,
                                  context_type,
                                  context_id,
                                  context_title,
                                  context_reason,
                                  source_surface,
                                  preset_message_id,
                                  status,
                                  created_at,
                                  updated_at,
                                  expires_at,
                                  version,
                                  sync_version,
                                  idempotency_key
                                """
                            ),
                            {
                                "created_by": sender_auth_user_id,
                                "target_user_id": recipient_auth_user_id,
                                "context_type": request.context.context_type.value,
                                "context_id": request.context.context_id,
                                "context_title": request.context.title,
                                "context_reason": request.context.reason,
                                "source_surface": request.context.source_surface,
                                "preset_message_id": request.preset_message_id.value,
                                "now": now,
                                "expires_at": expires_at,
                                "idempotency_key": request.idempotency_key,
                            },
                        )
                        .mappings()
                        .one()
                    )
                    return InviteCreateResult(
                        _map_inserted_record(
                            row,
                            sender_profile_id=sender_profile_id,
                            recipient_profile_id=recipient_profile_id,
                        )
                    )
        except IntegrityError:
            existing = self.find_by_idempotency_key(
                sender_auth_user_id,
                request.idempotency_key,
            )
            if existing is not None and _record_matches_request(existing, request):
                return InviteCreateResult(existing, replayed=True)
            if existing is not None:
                return InviteCreateResult(None, "idempotency_conflict")
            return InviteCreateResult(None, "duplicate_active_invite")
        except DBAPIError as exc:
            if _is_serialization_failure(exc):
                return InviteCreateResult(None, "conflict")
            raise

    def expire_stale_for_participant(self, auth_user_id: UUID, now: datetime) -> int:
        with self._database.engine.begin() as connection:
            result = connection.execute(
                text(
                    """
                    update public.hg_spotmeeting_invites
                    set status = 'expired', updated_at = :now
                    where (created_by = :user_id or target_user_id = :user_id)
                      and status in ('pending', 'accepted')
                      and expires_at <= :now
                    """
                ),
                {"user_id": auth_user_id, "now": now},
            )
        return int(result.rowcount or 0)

    def get_participant_invite(
        self,
        auth_user_id: UUID,
        invite_id: UUID,
    ) -> SpotmeetingInviteRecord | None:
        with self._database.engine.connect() as connection:
            return self._get_participant_invite_on_connection(
                connection,
                auth_user_id,
                invite_id,
            )

    def list_participant_invites(
        self,
        auth_user_id: UUID,
        *,
        cursor: int,
        limit: int,
        state: SpotmeetingInviteState | None = None,
    ) -> tuple[list[SpotmeetingInviteRecord], bool]:
        with self._database.engine.connect() as connection:
            rows = (
                connection.execute(
                    text(
                        f"""
                        select {_INVITE_COLUMNS}
                        from public.hg_spotmeeting_invites i
                        join public.hg_profiles sender on sender.user_id = i.created_by
                        join public.hg_profiles recipient on recipient.user_id = i.target_user_id
                        where (i.created_by = :user_id or i.target_user_id = :user_id)
                          and i.sync_version > :cursor
                          and (:state is null or i.status = :state)
                        order by i.sync_version asc
                        limit :fetch_limit
                        """
                    ),
                    {
                        "user_id": auth_user_id,
                        "cursor": cursor,
                        "state": state.value if state is not None else None,
                        "fetch_limit": limit + 1,
                    },
                )
                .mappings()
                .all()
            )
        has_more = len(rows) > limit
        return [_map_record(row) for row in rows[:limit]], has_more

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
        with self._database.engine.begin() as connection:
            updated_id = connection.execute(
                text(
                    """
                    update public.hg_spotmeeting_invites
                    set status = :next_state, updated_at = :now
                    where id = :invite_id
                      and status = :current_state
                      and version = :expected_version
                      and (created_by = :user_id or target_user_id = :user_id)
                    returning id
                    """
                ),
                {
                    "invite_id": invite_id,
                    "user_id": auth_user_id,
                    "current_state": current_state.value,
                    "next_state": next_state.value,
                    "expected_version": expected_version,
                    "now": now,
                },
            ).scalar_one_or_none()
            if updated_id is None:
                return None
            return self._get_participant_invite_on_connection(
                connection,
                auth_user_id,
                cast(UUID, updated_id),
            )

    def _find_by_idempotency_key_on_connection(
        self,
        connection: Connection,
        sender_auth_user_id: UUID,
        idempotency_key: str,
    ) -> SpotmeetingInviteRecord | None:
        row = (
            connection.execute(
                text(
                    f"""
                    select {_INVITE_COLUMNS}
                    from public.hg_spotmeeting_invites i
                    join public.hg_profiles sender on sender.user_id = i.created_by
                    join public.hg_profiles recipient on recipient.user_id = i.target_user_id
                    where i.created_by = :user_id
                      and i.idempotency_key = :idempotency_key
                    """
                ),
                {"user_id": sender_auth_user_id, "idempotency_key": idempotency_key},
            )
            .mappings()
            .one_or_none()
        )
        return _map_record(row) if row is not None else None

    def _get_participant_invite_on_connection(
        self,
        connection: Connection,
        auth_user_id: UUID,
        invite_id: UUID,
    ) -> SpotmeetingInviteRecord | None:
        row = (
            connection.execute(
                text(
                    f"""
                    select {_INVITE_COLUMNS}
                    from public.hg_spotmeeting_invites i
                    join public.hg_profiles sender on sender.user_id = i.created_by
                    join public.hg_profiles recipient on recipient.user_id = i.target_user_id
                    where i.id = :invite_id
                      and (i.created_by = :user_id or i.target_user_id = :user_id)
                    """
                ),
                {"invite_id": invite_id, "user_id": auth_user_id},
            )
            .mappings()
            .one_or_none()
        )
        return _map_record(row) if row is not None else None

    def _lock_profiles(
        self,
        connection: Connection,
        *,
        sender_profile_id: UUID,
        recipient_profile_id: UUID,
    ) -> list[RowMapping]:
        return list(
            connection.execute(
                text(
                    """
                    select user_id, profile_id, profile_visibility, consent_version, deleted_at
                    from public.hg_profiles
                    where profile_id in (:sender_profile_id, :recipient_profile_id)
                    order by profile_id
                    for update
                    """
                ),
                {
                    "sender_profile_id": sender_profile_id,
                    "recipient_profile_id": recipient_profile_id,
                },
            )
            .mappings()
            .all()
        )

    @staticmethod
    def _active_block_exists(
        connection: Connection,
        sender_profile_id: UUID,
        recipient_profile_id: UUID,
    ) -> bool:
        return bool(
            connection.execute(
                text(
                    """
                    select exists (
                      select 1
                      from public.hg_social_meet_blocks
                      where status = 'active'
                        and (
                          (blocker_profile_id = :sender and blocked_profile_id = :recipient)
                          or
                          (blocker_profile_id = :recipient and blocked_profile_id = :sender)
                        )
                    )
                    """
                ),
                {"sender": sender_profile_id, "recipient": recipient_profile_id},
            ).scalar_one()
        )


def _profiles_are_eligible(
    rows: list[RowMapping],
    *,
    sender_auth_user_id: UUID,
    sender_profile_id: UUID,
    recipient_auth_user_id: UUID,
    recipient_profile_id: UUID,
    supported_consent_version: str,
) -> bool:
    if len(rows) != 2:
        return False
    by_profile = {cast(UUID, row["profile_id"]): row for row in rows}
    sender = by_profile.get(sender_profile_id)
    recipient = by_profile.get(recipient_profile_id)
    if sender is None or recipient is None:
        return False
    return bool(
        sender["user_id"] == sender_auth_user_id
        and recipient["user_id"] == recipient_auth_user_id
        and sender["profile_visibility"] == "discoverable"
        and recipient["profile_visibility"] == "discoverable"
        and sender["consent_version"] == supported_consent_version
        and recipient["consent_version"] == supported_consent_version
        and sender["deleted_at"] is None
        and recipient["deleted_at"] is None
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


def _map_record(row: RowMapping) -> SpotmeetingInviteRecord:
    return SpotmeetingInviteRecord(
        invite_id=cast(UUID, row["id"]),
        sender_auth_user_id=cast(UUID, row["created_by"]),
        recipient_auth_user_id=cast(UUID, row["target_user_id"]),
        sender_profile_id=cast(UUID, row["sender_profile_id"]),
        recipient_profile_id=cast(UUID, row["recipient_profile_id"]),
        context_type=SpotmeetingContextType(str(row["context_type"])),
        context_id=str(row["context_id"]),
        context_title=str(row.get("context_title") or ""),
        context_reason=str(row.get("context_reason") or ""),
        source_surface=str(row.get("source_surface") or ""),
        preset_message_id=SpotmeetingPresetId(str(row["preset_message_id"])),
        state=SpotmeetingInviteState(str(row["status"])),
        created_at=cast(datetime, row["created_at"]),
        updated_at=cast(datetime, row["updated_at"]),
        expires_at=cast(datetime, row["expires_at"]),
        version=int(row["version"]),
        sync_version=int(row["sync_version"]),
        idempotency_key=cast(str | None, row.get("idempotency_key")),
    )


def _map_inserted_record(
    row: RowMapping,
    *,
    sender_profile_id: UUID,
    recipient_profile_id: UUID,
) -> SpotmeetingInviteRecord:
    return SpotmeetingInviteRecord(
        invite_id=cast(UUID, row["id"]),
        sender_auth_user_id=cast(UUID, row["created_by"]),
        recipient_auth_user_id=cast(UUID, row["target_user_id"]),
        sender_profile_id=sender_profile_id,
        recipient_profile_id=recipient_profile_id,
        context_type=SpotmeetingContextType(str(row["context_type"])),
        context_id=str(row["context_id"]),
        context_title=str(row.get("context_title") or ""),
        context_reason=str(row.get("context_reason") or ""),
        source_surface=str(row.get("source_surface") or ""),
        preset_message_id=SpotmeetingPresetId(str(row["preset_message_id"])),
        state=SpotmeetingInviteState(str(row["status"])),
        created_at=cast(datetime, row["created_at"]),
        updated_at=cast(datetime, row["updated_at"]),
        expires_at=cast(datetime, row["expires_at"]),
        version=int(row["version"]),
        sync_version=int(row["sync_version"]),
        idempotency_key=cast(str | None, row.get("idempotency_key")),
    )


def _is_serialization_failure(error: DBAPIError) -> bool:
    original = getattr(error, "orig", None)
    sqlstate = getattr(original, "sqlstate", None) or getattr(original, "pgcode", None)
    return sqlstate == "40001"
