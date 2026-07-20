from __future__ import annotations

import json
from typing import Any, Protocol, cast
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import RowMapping

from app.core.database import Database
from app.domains.social_meet.safety_models import (
    BlockCreateRequest,
    BlockScope,
    BlockStatus,
    ReportCreateRequest,
    ReportReasonCode,
    ReportStatus,
    SocialMeetBlockRecord,
    SocialMeetReportRecord,
    StructuredReportDetail,
)

_BLOCK_COLUMNS = """
    id,
    blocker_profile_id,
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
    reporter_profile_id,
    reported_profile_id,
    related_invite_id,
    related_context,
    reason_code,
    structured_details,
    source_surface,
    status,
    created_at,
    updated_at
"""


class SocialMeetSafetyRepository(Protocol):
    def list_active_blocks(self, blocker_profile_id: UUID) -> tuple[SocialMeetBlockRecord, ...]: ...

    def upsert_block(
        self,
        blocker_profile_id: UUID,
        request: BlockCreateRequest,
    ) -> SocialMeetBlockRecord: ...

    def remove_block(
        self,
        blocker_profile_id: UUID,
        block_id: UUID,
    ) -> SocialMeetBlockRecord | None: ...

    def create_report(
        self,
        reporter_profile_id: UUID,
        request: ReportCreateRequest,
    ) -> SocialMeetReportRecord: ...

    def list_submitted_reports(
        self,
        reporter_profile_id: UUID,
    ) -> tuple[SocialMeetReportRecord, ...]: ...

    def get_submitted_report(
        self,
        reporter_profile_id: UUID,
        report_id: UUID,
    ) -> SocialMeetReportRecord | None: ...

    def interaction_is_blocked(self, first_profile_id: UUID, second_profile_id: UUID) -> bool: ...

    def invite_links_users(
        self,
        invite_id: UUID,
        first_auth_user_id: UUID,
        second_auth_user_id: UUID,
    ) -> bool: ...

    def enqueue_report(self, report: SocialMeetReportRecord, *, priority: str) -> None: ...

    def write_audit(
        self,
        *,
        actor_profile_id: UUID,
        target_profile_id: UUID,
        action_type: str,
        decision: str,
        related_block_id: UUID | None = None,
        related_report_id: UUID | None = None,
        related_invite_id: UUID | None = None,
        context_id: str | None = None,
        reason_code: str | None = None,
        request_id: str | None = None,
    ) -> None: ...


class PostgresSocialMeetSafetyRepository:
    """Server-owned block/report persistence for Social Meet safety."""

    def __init__(self, database: Database) -> None:
        self._database = database

    def list_active_blocks(self, blocker_profile_id: UUID) -> tuple[SocialMeetBlockRecord, ...]:
        with self._database.engine.connect() as connection:
            rows = (
                connection.execute(
                    text(
                        f"""
                        select {_BLOCK_COLUMNS}
                        from public.hg_social_meet_blocks
                        where blocker_profile_id = :blocker_profile_id
                          and status = 'active'
                        order by created_at desc
                        """
                    ),
                    {"blocker_profile_id": blocker_profile_id},
                )
                .mappings()
                .all()
            )
        return tuple(_map_block(row) for row in rows)

    def upsert_block(
        self,
        blocker_profile_id: UUID,
        request: BlockCreateRequest,
    ) -> SocialMeetBlockRecord:
        related_context = _dump_context(request.related_context)
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
                        )
                        values (
                          :blocker_profile_id,
                          :blocked_profile_id,
                          :scope,
                          :related_invite_id,
                          cast(:related_context as jsonb),
                          :source_surface
                        )
                        on conflict (blocker_profile_id, blocked_profile_id)
                          where status = 'active'
                        do update set
                          scope = excluded.scope,
                          related_invite_id = coalesce(
                            excluded.related_invite_id,
                            public.hg_social_meet_blocks.related_invite_id
                          ),
                          related_context = coalesce(
                            excluded.related_context,
                            public.hg_social_meet_blocks.related_context
                          ),
                          source_surface = coalesce(
                            excluded.source_surface,
                            public.hg_social_meet_blocks.source_surface
                          ),
                          updated_at = now()
                        returning {_BLOCK_COLUMNS}
                        """
                    ),
                    {
                        "blocker_profile_id": blocker_profile_id,
                        "blocked_profile_id": request.blocked_profile_id,
                        "scope": request.scope.value,
                        "related_invite_id": request.related_invite_id,
                        "related_context": related_context,
                        "source_surface": request.source_surface,
                    },
                )
                .mappings()
                .one()
            )
        return _map_block(row)

    def remove_block(
        self,
        blocker_profile_id: UUID,
        block_id: UUID,
    ) -> SocialMeetBlockRecord | None:
        with self._database.engine.begin() as connection:
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
                    {
                        "block_id": block_id,
                        "blocker_profile_id": blocker_profile_id,
                    },
                )
                .mappings()
                .one_or_none()
            )
        return _map_block(row) if row is not None else None

    def create_report(
        self,
        reporter_profile_id: UUID,
        request: ReportCreateRequest,
    ) -> SocialMeetReportRecord:
        related_context = _dump_context(request.related_context)
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
                        )
                        values (
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
                    {
                        "reporter_profile_id": reporter_profile_id,
                        "reported_profile_id": request.reported_profile_id,
                        "related_invite_id": request.related_invite_id,
                        "related_context": related_context,
                        "reason_code": request.reason_code.value,
                        "structured_details": [item.value for item in request.structured_details],
                        "source_surface": request.source_surface,
                    },
                )
                .mappings()
                .one()
            )
        return _map_report(row)

    def list_submitted_reports(
        self,
        reporter_profile_id: UUID,
    ) -> tuple[SocialMeetReportRecord, ...]:
        with self._database.engine.connect() as connection:
            rows = (
                connection.execute(
                    text(
                        f"""
                        select {_REPORT_COLUMNS}
                        from public.hg_social_meet_reports
                        where reporter_profile_id = :reporter_profile_id
                        order by created_at desc
                        """
                    ),
                    {"reporter_profile_id": reporter_profile_id},
                )
                .mappings()
                .all()
            )
        return tuple(_map_report(row) for row in rows)

    def get_submitted_report(
        self,
        reporter_profile_id: UUID,
        report_id: UUID,
    ) -> SocialMeetReportRecord | None:
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
                    {
                        "report_id": report_id,
                        "reporter_profile_id": reporter_profile_id,
                    },
                )
                .mappings()
                .one_or_none()
            )
        return _map_report(row) if row is not None else None

    def interaction_is_blocked(self, first_profile_id: UUID, second_profile_id: UUID) -> bool:
        with self._database.engine.connect() as connection:
            blocked = connection.execute(
                text(
                    """
                    select exists (
                      select 1
                      from public.hg_social_meet_blocks
                      where status = 'active'
                        and (
                          (blocker_profile_id = :first_profile_id and blocked_profile_id = :second_profile_id)
                          or
                          (blocker_profile_id = :second_profile_id and blocked_profile_id = :first_profile_id)
                        )
                    )
                    """
                ),
                {
                    "first_profile_id": first_profile_id,
                    "second_profile_id": second_profile_id,
                },
            ).scalar_one()
        return bool(blocked)

    def invite_links_users(
        self,
        invite_id: UUID,
        first_auth_user_id: UUID,
        second_auth_user_id: UUID,
    ) -> bool:
        with self._database.engine.connect() as connection:
            linked = connection.execute(
                text(
                    """
                    select exists (
                      select 1
                      from public.hg_spotmeeting_invites
                      where id = :invite_id
                        and (
                          (created_by = :first_user_id and target_user_id = :second_user_id)
                          or
                          (created_by = :second_user_id and target_user_id = :first_user_id)
                        )
                    )
                    """
                ),
                {
                    "invite_id": invite_id,
                    "first_user_id": first_auth_user_id,
                    "second_user_id": second_auth_user_id,
                },
            ).scalar_one()
        return bool(linked)

    def enqueue_report(self, report: SocialMeetReportRecord, *, priority: str) -> None:
        with self._database.engine.begin() as connection:
            connection.execute(
                text(
                    """
                    insert into public.hg_social_meet_moderation_queue (
                      report_id,
                      subject_profile_id,
                      reporter_profile_id,
                      related_invite_id,
                      related_context,
                      priority,
                      category
                    )
                    values (
                      :report_id,
                      :subject_profile_id,
                      :reporter_profile_id,
                      :related_invite_id,
                      cast(:related_context as jsonb),
                      :priority,
                      :category
                    )
                    on conflict (report_id) do nothing
                    """
                ),
                {
                    "report_id": report.report_id,
                    "subject_profile_id": report.reported_profile_id,
                    "reporter_profile_id": report.reporter_profile_id,
                    "related_invite_id": report.related_invite_id,
                    "related_context": json.dumps(report.related_context)
                    if report.related_context is not None
                    else None,
                    "priority": priority,
                    "category": report.reason_code.value,
                },
            )

    def write_audit(
        self,
        *,
        actor_profile_id: UUID,
        target_profile_id: UUID,
        action_type: str,
        decision: str,
        related_block_id: UUID | None = None,
        related_report_id: UUID | None = None,
        related_invite_id: UUID | None = None,
        context_id: str | None = None,
        reason_code: str | None = None,
        request_id: str | None = None,
    ) -> None:
        with self._database.engine.begin() as connection:
            connection.execute(
                text(
                    """
                    insert into public.hg_social_meet_safety_audit (
                      actor_type,
                      actor_profile_id,
                      target_profile_id,
                      action_type,
                      related_block_id,
                      related_report_id,
                      related_invite_id,
                      context_id,
                      decision,
                      reason_code,
                      request_id
                    )
                    values (
                      'user',
                      :actor_profile_id,
                      :target_profile_id,
                      :action_type,
                      :related_block_id,
                      :related_report_id,
                      :related_invite_id,
                      :context_id,
                      :decision,
                      :reason_code,
                      :request_id
                    )
                    """
                ),
                {
                    "actor_profile_id": actor_profile_id,
                    "target_profile_id": target_profile_id,
                    "action_type": action_type,
                    "related_block_id": related_block_id,
                    "related_report_id": related_report_id,
                    "related_invite_id": related_invite_id,
                    "context_id": context_id,
                    "decision": decision,
                    "reason_code": reason_code,
                    "request_id": request_id,
                },
            )


def _dump_context(context: object) -> str | None:
    if context is None:
        return None
    model_dump = getattr(context, "model_dump", None)
    if not callable(model_dump):
        return None
    return json.dumps(model_dump(mode="json", by_alias=True))


def _map_block(row: RowMapping) -> SocialMeetBlockRecord:
    return SocialMeetBlockRecord(
        block_id=cast(UUID, row["id"]),
        blocker_profile_id=cast(UUID, row["blocker_profile_id"]),
        blocked_profile_id=cast(UUID, row["blocked_profile_id"]),
        scope=BlockScope(str(row["scope"])),
        related_invite_id=cast(UUID | None, row.get("related_invite_id")),
        related_context=_json_object(row.get("related_context")),
        status=BlockStatus(str(row["status"])),
        source_surface=_optional_string(row.get("source_surface")),
        created_at=cast(Any, row["created_at"]),
        updated_at=cast(Any, row["updated_at"]),
        removed_at=cast(Any, row.get("removed_at")),
    )


def _map_report(row: RowMapping) -> SocialMeetReportRecord:
    return SocialMeetReportRecord(
        report_id=cast(UUID, row["id"]),
        reporter_profile_id=cast(UUID, row["reporter_profile_id"]),
        reported_profile_id=cast(UUID, row["reported_profile_id"]),
        related_invite_id=cast(UUID | None, row.get("related_invite_id")),
        related_context=_json_object(row.get("related_context")),
        reason_code=ReportReasonCode(str(row["reason_code"])),
        structured_details=tuple(
            StructuredReportDetail(str(item)) for item in (row.get("structured_details") or [])
        ),
        source_surface=_optional_string(row.get("source_surface")),
        status=ReportStatus(str(row["status"])),
        created_at=cast(Any, row["created_at"]),
        updated_at=cast(Any, row["updated_at"]),
    )


def _json_object(value: object) -> dict[str, Any] | None:
    if value is None:
        return None
    if isinstance(value, str):
        parsed = json.loads(value)
        return cast(dict[str, Any], parsed)
    return cast(dict[str, Any], value)


def _optional_string(value: object) -> str | None:
    if value is None:
        return None
    normalized = str(value).strip()
    return normalized or None
