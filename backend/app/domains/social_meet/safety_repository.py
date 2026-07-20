from __future__ import annotations

import json
from datetime import datetime
from typing import Protocol, cast
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import RowMapping

from app.core.database import Database
from app.domains.social_meet.safety_models import (
    BlockScope,
    BlockStatus,
    BlockView,
    CreateBlockRequest,
    CreateReportRequest,
    ExportedInvite,
    ReportDetailCode,
    ReportReasonCode,
    ReportStatus,
    SafetyContextReference,
    SubmittedReportView,
)

_BLOCK_COLUMNS = """
    id,
    blocked_profile_id,
    scope,
    related_invite_id,
    related_context,
    status,
    source_surface,
    created_at,
    updated_at,
    removed_at
"""

_REPORT_COLUMNS = """
    id,
    reported_profile_id,
    related_invite_id,
    related_context,
    reason_code,
    structured_details,
    status,
    source_surface,
    created_at,
    updated_at
"""


class SocialMeetSafetyRepository(Protocol):
    def list_blocks(self, blocker_profile_id: UUID) -> list[BlockView]: ...

    def create_block(self, blocker_profile_id: UUID, request: CreateBlockRequest) -> BlockView: ...

    def remove_block(self, blocker_profile_id: UUID, block_id: UUID) -> BlockView | None: ...

    def interaction_is_blocked(self, first_profile_id: UUID, second_profile_id: UUID) -> bool: ...

    def create_report(
        self, reporter_profile_id: UUID, request: CreateReportRequest
    ) -> SubmittedReportView: ...

    def list_submitted_reports(self, reporter_profile_id: UUID) -> list[SubmittedReportView]: ...

    def get_submitted_report(
        self, reporter_profile_id: UUID, report_id: UUID
    ) -> SubmittedReportView | None: ...

    def list_participant_invites(self, auth_user_id: UUID) -> list[ExportedInvite]: ...

    def get_deleted_at(self, auth_user_id: UUID) -> datetime | None: ...

    def mark_social_meet_deleted(self, auth_user_id: UUID, deleted_at: datetime) -> UUID | None: ...


class PostgresSocialMeetSafetyRepository:
    def __init__(self, database: Database) -> None:
        self._database = database

    def list_blocks(self, blocker_profile_id: UUID) -> list[BlockView]:
        with self._database.engine.connect() as connection:
            rows = (
                connection.execute(
                    text(
                        f"""
                        select {_BLOCK_COLUMNS}
                        from public.hg_social_meet_blocks
                        where blocker_profile_id = :blocker_profile_id
                        order by created_at desc, id desc
                        """
                    ),
                    {"blocker_profile_id": blocker_profile_id},
                )
                .mappings()
                .all()
            )
        return [_map_block(row) for row in rows]

    def create_block(self, blocker_profile_id: UUID, request: CreateBlockRequest) -> BlockView:
        related_context = _context_json(request.related_context)
        params: dict[str, object] = {
            "blocker_profile_id": blocker_profile_id,
            "blocked_profile_id": request.blocked_profile_id,
            "scope": request.scope.value,
            "related_invite_id": request.related_invite_id,
            "related_context": related_context,
            "source_surface": request.source_surface,
        }
        with self._database.engine.begin() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                        insert into public.hg_social_meet_blocks (
                          blocker_profile_id,
                          blocked_profile_id,
                          scope,
                          related_invite_id,
                          related_context,
                          source_surface
                        ) values (
                          :blocker_profile_id,
                          :blocked_profile_id,
                          :scope,
                          :related_invite_id,
                          cast(:related_context as jsonb),
                          :source_surface
                        )
                        on conflict (blocker_profile_id, blocked_profile_id)
                          where status = 'active'
                        do update set updated_at = public.hg_social_meet_blocks.updated_at
                        returning {_BLOCK_COLUMNS}
                        """
                    ),
                    params,
                )
                .mappings()
                .one()
            )
        return _map_block(row)

    def remove_block(self, blocker_profile_id: UUID, block_id: UUID) -> BlockView | None:
        with self._database.engine.begin() as connection:
            existing = (
                connection.execute(
                    text(
                        f"""
                        select {_BLOCK_COLUMNS}
                        from public.hg_social_meet_blocks
                        where id = :block_id
                          and blocker_profile_id = :blocker_profile_id
                        """
                    ),
                    {"block_id": block_id, "blocker_profile_id": blocker_profile_id},
                )
                .mappings()
                .one_or_none()
            )
            if existing is None:
                return None
            if str(existing["status"]) != BlockStatus.ACTIVE.value:
                return _map_block(existing)

            row = (
                connection.execute(
                    text(
                        f"""
                        update public.hg_social_meet_blocks
                        set
                          status = 'removed_by_blocker',
                          removed_at = now()
                        where id = :block_id
                          and blocker_profile_id = :blocker_profile_id
                          and status = 'active'
                        returning {_BLOCK_COLUMNS}
                        """
                    ),
                    {"block_id": block_id, "blocker_profile_id": blocker_profile_id},
                )
                .mappings()
                .one()
            )
        return _map_block(row)

    def interaction_is_blocked(self, first_profile_id: UUID, second_profile_id: UUID) -> bool:
        with self._database.engine.connect() as connection:
            value = connection.execute(
                text(
                    """
                    select exists (
                      select 1
                      from public.hg_social_meet_blocks
                      where status = 'active'
                        and (
                          (
                            blocker_profile_id = :first_profile_id
                            and blocked_profile_id = :second_profile_id
                          )
                          or
                          (
                            blocker_profile_id = :second_profile_id
                            and blocked_profile_id = :first_profile_id
                          )
                        )
                    )
                    """
                ),
                {
                    "first_profile_id": first_profile_id,
                    "second_profile_id": second_profile_id,
                },
            ).scalar_one()
        return bool(value)

    def create_report(
        self, reporter_profile_id: UUID, request: CreateReportRequest
    ) -> SubmittedReportView:
        params: dict[str, object] = {
            "reporter_profile_id": reporter_profile_id,
            "reported_profile_id": request.reported_profile_id,
            "related_invite_id": request.related_invite_id,
            "related_context": _context_json(request.related_context),
            "reason_code": request.reason_code.value,
            "structured_details": [detail.value for detail in request.structured_details],
            "source_surface": request.source_surface,
        }
        with self._database.engine.begin() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                        insert into public.hg_social_meet_reports (
                          reporter_profile_id,
                          reported_profile_id,
                          related_invite_id,
                          related_context,
                          reason_code,
                          structured_details,
                          source_surface
                        ) values (
                          :reporter_profile_id,
                          :reported_profile_id,
                          :related_invite_id,
                          cast(:related_context as jsonb),
                          :reason_code,
                          :structured_details,
                          :source_surface
                        )
                        returning {_REPORT_COLUMNS}
                        """
                    ),
                    params,
                )
                .mappings()
                .one()
            )
        return _map_report(row)

    def list_submitted_reports(self, reporter_profile_id: UUID) -> list[SubmittedReportView]:
        with self._database.engine.connect() as connection:
            rows = (
                connection.execute(
                    text(
                        f"""
                        select {_REPORT_COLUMNS}
                        from public.hg_social_meet_reports
                        where reporter_profile_id = :reporter_profile_id
                        order by created_at desc, id desc
                        """
                    ),
                    {"reporter_profile_id": reporter_profile_id},
                )
                .mappings()
                .all()
            )
        return [_map_report(row) for row in rows]

    def get_submitted_report(
        self, reporter_profile_id: UUID, report_id: UUID
    ) -> SubmittedReportView | None:
        with self._database.engine.connect() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                        select {_REPORT_COLUMNS}
                        from public.hg_social_meet_reports
                        where id = :report_id
                          and reporter_profile_id = :reporter_profile_id
                        """
                    ),
                    {"report_id": report_id, "reporter_profile_id": reporter_profile_id},
                )
                .mappings()
                .one_or_none()
            )
        return _map_report(row) if row is not None else None

    def list_participant_invites(self, auth_user_id: UUID) -> list[ExportedInvite]:
        with self._database.engine.connect() as connection:
            rows = (
                connection.execute(
                    text(
                        """
                        select
                          i.id,
                          case
                            when i.created_by = :auth_user_id then 'sent'
                            else 'received'
                          end as direction,
                          case
                            when i.created_by = :auth_user_id then target_profile.profile_id
                            else creator_profile.profile_id
                          end as counterparty_profile_id,
                          i.context_type,
                          i.context_id,
                          i.context_title,
                          i.source_surface,
                          i.preset_message_id,
                          i.status,
                          i.created_at,
                          i.updated_at
                        from public.hg_spotmeeting_invites i
                        left join public.hg_profiles creator_profile
                          on creator_profile.user_id = i.created_by
                        left join public.hg_profiles target_profile
                          on target_profile.user_id = i.target_user_id
                        where i.created_by = :auth_user_id
                           or i.target_user_id = :auth_user_id
                        order by i.created_at desc, i.id desc
                        """
                    ),
                    {"auth_user_id": auth_user_id},
                )
                .mappings()
                .all()
            )
        return [_map_invite(row) for row in rows]

    def get_deleted_at(self, auth_user_id: UUID) -> datetime | None:
        with self._database.engine.connect() as connection:
            value = connection.execute(
                text(
                    """
                    select deleted_at
                    from public.hg_profiles
                    where user_id = :auth_user_id
                    """
                ),
                {"auth_user_id": auth_user_id},
            ).scalar_one_or_none()
        return cast(datetime | None, value)

    def mark_social_meet_deleted(self, auth_user_id: UUID, deleted_at: datetime) -> UUID | None:
        with self._database.engine.begin() as connection:
            profile_id = connection.execute(
                text(
                    """
                    update public.hg_profiles
                    set
                      short_bio = null,
                      preferred_themes = '{}',
                      favorite_eras = '{}',
                      interest_places = '{}',
                      learning_goals = '{}',
                      knowledge_badges = '{}',
                      knowledge_fingerprint_summary = '{}'::jsonb,
                      profile_visibility = 'deleted',
                      consent_version = null,
                      consented_at = null,
                      deleted_at = :deleted_at
                    where user_id = :auth_user_id
                    returning profile_id
                    """
                ),
                {"auth_user_id": auth_user_id, "deleted_at": deleted_at},
            ).scalar_one_or_none()
        return cast(UUID | None, profile_id)


def _context_json(context: SafetyContextReference | None) -> str:
    if context is None:
        return "{}"
    return json.dumps(context.model_dump(mode="json", by_alias=True))


def _map_context(value: object) -> SafetyContextReference | None:
    if value in (None, {}, "{}"):
        return None
    payload = json.loads(value) if isinstance(value, str) else value
    return SafetyContextReference.model_validate(payload)


def _map_block(row: RowMapping) -> BlockView:
    return BlockView(
        block_id=cast(UUID, row["id"]),
        blocked_profile_id=cast(UUID, row["blocked_profile_id"]),
        scope=BlockScope(str(row["scope"])),
        related_invite_id=cast(UUID | None, row.get("related_invite_id")),
        related_context=_map_context(row.get("related_context")),
        status=BlockStatus(str(row["status"])),
        source_surface=_optional_string(row.get("source_surface")),
        created_at=cast(datetime, row["created_at"]),
        updated_at=cast(datetime, row["updated_at"]),
        removed_at=cast(datetime | None, row.get("removed_at")),
    )


def _map_report(row: RowMapping) -> SubmittedReportView:
    details = cast(list[object], row.get("structured_details") or [])
    return SubmittedReportView(
        report_id=cast(UUID, row["id"]),
        reported_profile_id=cast(UUID, row["reported_profile_id"]),
        related_invite_id=cast(UUID | None, row.get("related_invite_id")),
        related_context=_map_context(row.get("related_context")),
        reason_code=ReportReasonCode(str(row["reason_code"])),
        structured_details=[ReportDetailCode(str(item)) for item in details],
        status=ReportStatus(str(row["status"])),
        source_surface=_optional_string(row.get("source_surface")),
        created_at=cast(datetime, row["created_at"]),
        updated_at=cast(datetime, row["updated_at"]),
    )


def _map_invite(row: RowMapping) -> ExportedInvite:
    return ExportedInvite(
        invite_id=cast(UUID, row["id"]),
        direction=str(row["direction"]),
        counterparty_profile_id=cast(UUID | None, row.get("counterparty_profile_id")),
        context_type=str(row["context_type"]),
        context_id=str(row["context_id"]),
        context_title=_optional_string(row.get("context_title")),
        source_surface=_optional_string(row.get("source_surface")),
        preset_message_id=str(row["preset_message_id"]),
        status=str(row["status"]),
        created_at=cast(datetime, row["created_at"]),
        updated_at=cast(datetime, row["updated_at"]),
    )


def _optional_string(value: object) -> str | None:
    if value is None:
        return None
    normalized = str(value).strip()
    return normalized or None
