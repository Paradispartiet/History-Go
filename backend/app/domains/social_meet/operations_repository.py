from __future__ import annotations

import json
from datetime import datetime, timedelta
from typing import cast
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import Connection, RowMapping

from app.core.database import Database
from app.domains.social_meet.operations_models import (
    AggregateStatusCounts,
    CreateRetentionHoldRequest,
    LastRetentionRun,
    RetentionCounts,
    RetentionEntityType,
    RetentionHoldReason,
    RetentionHoldStatus,
    RetentionHoldView,
    RetentionPolicyView,
    RetentionRunResult,
    SocialMeetOperationalMetrics,
)

_ENTITY_TABLES: dict[RetentionEntityType, str] = {
    RetentionEntityType.INVITE: "public.hg_spotmeeting_invites",
    RetentionEntityType.BLOCK: "public.hg_social_meet_blocks",
    RetentionEntityType.REPORT: "public.hg_social_meet_reports",
    RetentionEntityType.MODERATION_QUEUE: "public.hg_social_meet_moderation_queue",
    RetentionEntityType.RESTRICTION: "public.hg_social_meet_profile_restrictions",
    RetentionEntityType.APPEAL: "public.hg_social_meet_appeals",
    RetentionEntityType.SAFETY_AUDIT: "public.hg_social_meet_safety_audit",
}

_HOLD_COLUMNS = """
  id,
  entity_type,
  entity_id,
  reason_code,
  status,
  hold_until,
  created_at,
  released_at
"""


def _active_hold(entity_type: str, entity_id_sql: str) -> str:
    return f"""
      exists (
        select 1
        from public.hg_social_meet_retention_holds retention_hold
        where retention_hold.entity_type = '{entity_type}'
          and retention_hold.entity_id = {entity_id_sql}
          and retention_hold.status = 'active'
          and (retention_hold.hold_until is null or retention_hold.hold_until > :now)
      )
    """


_INVITE_PREDICATE = f"""
  invite.status in ('declined', 'cancelled', 'completed', 'expired', 'reported', 'blocked')
  and invite.updated_at < :terminal_invite_cutoff
  and not ({_active_hold('invite', 'invite.id')})
  and not exists (
    select 1
    from public.hg_social_meet_reports report
    where report.related_invite_id = invite.id
      and (
        report.status not in ('actioned', 'no_action', 'closed')
        or report.updated_at >= :closed_report_cutoff
        or {_active_hold('report', 'report.id')}
      )
  )
"""

_BLOCK_PREDICATE = f"""
  block_record.status <> 'active'
  and coalesce(block_record.removed_at, block_record.updated_at) < :removed_block_cutoff
  and not ({_active_hold('block', 'block_record.id')})
"""

_REPORT_PREDICATE = f"""
  report.status in ('actioned', 'no_action', 'closed')
  and report.updated_at < :closed_report_cutoff
  and not ({_active_hold('report', 'report.id')})
  and not exists (
    select 1
    from public.hg_social_meet_moderation_queue queue_item
    where queue_item.report_id = report.id
      and (
        queue_item.state not in ('actioned', 'no_action', 'closed')
        or coalesce(queue_item.closed_at, queue_item.updated_at) >= :closed_moderation_cutoff
        or {_active_hold('moderation_queue', 'queue_item.id')}
      )
  )
"""

_MODERATION_QUEUE_PREDICATE = f"""
  queue_item.state in ('actioned', 'no_action', 'closed')
  and coalesce(queue_item.closed_at, queue_item.updated_at) < :closed_moderation_cutoff
  and not ({_active_hold('moderation_queue', 'queue_item.id')})
  and not ({_active_hold('report', 'queue_item.report_id')})
"""

_RESTRICTION_PREDICATE = f"""
  restriction.status in ('lifted', 'superseded')
  and coalesce(restriction.lifted_at, restriction.updated_at) < :inactive_restriction_cutoff
  and not ({_active_hold('restriction', 'restriction.id')})
  and not exists (
    select 1
    from public.hg_social_meet_appeals appeal
    where appeal.restriction_id = restriction.id
      and (
        appeal.status in ('submitted', 'under_review')
        or {_active_hold('appeal', 'appeal.id')}
      )
  )
"""

_APPEAL_PREDICATE = f"""
  appeal.status in ('upheld', 'modified', 'reversed', 'closed')
  and coalesce(appeal.decided_at, appeal.updated_at) < :closed_appeal_cutoff
  and not ({_active_hold('appeal', 'appeal.id')})
"""

_SAFETY_AUDIT_PREDICATE = f"""
  audit.created_at < :safety_audit_cutoff
  and not ({_active_hold('safety_audit', 'audit.id')})
  and not (
    audit.related_report_id is not null
    and {_active_hold('report', 'audit.related_report_id')}
  )
  and not (
    audit.related_queue_item_id is not null
    and {_active_hold('moderation_queue', 'audit.related_queue_item_id')}
  )
  and not (
    audit.related_restriction_id is not null
    and {_active_hold('restriction', 'audit.related_restriction_id')}
  )
  and not (
    audit.related_appeal_id is not null
    and {_active_hold('appeal', 'audit.related_appeal_id')}
  )
"""

_RELEASED_HOLD_PREDICATE = """
  retention_hold.status = 'released'
  and retention_hold.released_at < :released_hold_cutoff
"""


class PostgresSocialMeetOperationsRepository:
    def __init__(self, database: Database) -> None:
        self._database = database

    def entity_exists(self, entity_type: RetentionEntityType, entity_id: UUID) -> bool:
        table = _ENTITY_TABLES[entity_type]
        with self._database.engine.connect() as connection:
            value = connection.execute(
                text(f"select exists (select 1 from {table} where id = :entity_id)"),
                {"entity_id": entity_id},
            ).scalar_one()
        return bool(value)

    def create_hold(
        self,
        admin_user_id: UUID,
        request: CreateRetentionHoldRequest,
        *,
        now: datetime,
    ) -> RetentionHoldView:
        with self._database.engine.begin() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                        insert into public.hg_social_meet_retention_holds (
                          entity_type,
                          entity_id,
                          reason_code,
                          status,
                          hold_until,
                          created_by_user_id,
                          created_at,
                          updated_at
                        ) values (
                          :entity_type,
                          :entity_id,
                          :reason_code,
                          'active',
                          :hold_until,
                          :admin_user_id,
                          :now,
                          :now
                        )
                        on conflict (entity_type, entity_id)
                          where status = 'active'
                        do update set
                          reason_code = excluded.reason_code,
                          hold_until = excluded.hold_until,
                          updated_at = excluded.updated_at
                        returning {_HOLD_COLUMNS}
                        """
                    ),
                    {
                        "entity_type": request.entity_type.value,
                        "entity_id": request.entity_id,
                        "reason_code": request.reason_code.value,
                        "hold_until": request.hold_until,
                        "admin_user_id": admin_user_id,
                        "now": now,
                    },
                )
                .mappings()
                .one()
            )
        return _map_hold(row)

    def list_holds(
        self,
        *,
        include_released: bool,
        limit: int,
    ) -> list[RetentionHoldView]:
        with self._database.engine.connect() as connection:
            rows = (
                connection.execute(
                    text(
                        f"""
                        select {_HOLD_COLUMNS}
                        from public.hg_social_meet_retention_holds
                        where (:include_released or status = 'active')
                        order by created_at desc, id desc
                        limit :limit
                        """
                    ),
                    {"include_released": include_released, "limit": limit},
                )
                .mappings()
                .all()
            )
        return [_map_hold(row) for row in rows]

    def release_hold(
        self,
        admin_user_id: UUID,
        hold_id: UUID,
        *,
        now: datetime,
    ) -> RetentionHoldView | None:
        with self._database.engine.begin() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                        update public.hg_social_meet_retention_holds
                        set
                          status = 'released',
                          released_by_user_id = :admin_user_id,
                          released_at = :now,
                          updated_at = :now
                        where id = :hold_id
                          and status = 'active'
                        returning {_HOLD_COLUMNS}
                        """
                    ),
                    {"admin_user_id": admin_user_id, "hold_id": hold_id, "now": now},
                )
                .mappings()
                .one_or_none()
            )
            if row is not None:
                return _map_hold(row)
            existing = (
                connection.execute(
                    text(
                        f"""
                        select {_HOLD_COLUMNS}
                        from public.hg_social_meet_retention_holds
                        where id = :hold_id
                        """
                    ),
                    {"hold_id": hold_id},
                )
                .mappings()
                .one_or_none()
            )
        return _map_hold(existing) if existing is not None else None

    def preview_retention(
        self,
        policy: RetentionPolicyView,
        *,
        now: datetime,
    ) -> RetentionCounts:
        params = _retention_params(policy, now)
        with self._database.engine.connect() as connection:
            return _count_candidates(connection, params)

    def active_hold_count(self, *, now: datetime) -> int:
        with self._database.engine.connect() as connection:
            value = connection.execute(
                text(
                    """
                    select count(*)
                    from public.hg_social_meet_retention_holds
                    where status = 'active'
                      and (hold_until is null or hold_until > :now)
                    """
                ),
                {"now": now},
            ).scalar_one()
        return int(value)

    def apply_retention(
        self,
        policy: RetentionPolicyView,
        *,
        policy_version: str,
        admin_user_id: UUID,
        now: datetime,
    ) -> RetentionRunResult:
        params = _retention_params(policy, now)
        policy_snapshot = json.dumps(policy.model_dump(mode="json", by_alias=True))
        started_at = now

        with self._database.engine.begin() as connection:
            candidate_counts = _count_candidates(connection, params)
            run_id = cast(
                UUID,
                connection.execute(
                    text(
                        """
                        insert into public.hg_social_meet_retention_runs (
                          mode,
                          policy_version,
                          actor_staff_user_id,
                          policy_snapshot,
                          candidate_counts,
                          deleted_counts,
                          status,
                          started_at
                        ) values (
                          'apply',
                          :policy_version,
                          :admin_user_id,
                          cast(:policy_snapshot as jsonb),
                          cast(:candidate_counts as jsonb),
                          '{}'::jsonb,
                          'started',
                          :started_at
                        )
                        returning id
                        """
                    ),
                    {
                        "policy_version": policy_version,
                        "admin_user_id": admin_user_id,
                        "policy_snapshot": policy_snapshot,
                        "candidate_counts": json.dumps(
                            candidate_counts.model_dump(mode="json", by_alias=True)
                        ),
                        "started_at": started_at,
                    },
                ).scalar_one(),
            )

            deleted_counts = _delete_candidates(connection, params)
            completed_at = now
            connection.execute(
                text(
                    """
                    update public.hg_social_meet_retention_runs
                    set
                      deleted_counts = cast(:deleted_counts as jsonb),
                      status = 'completed',
                      completed_at = :completed_at
                    where id = :run_id
                    """
                ),
                {
                    "run_id": run_id,
                    "deleted_counts": json.dumps(
                        deleted_counts.model_dump(mode="json", by_alias=True)
                    ),
                    "completed_at": completed_at,
                },
            )

        return RetentionRunResult(
            run_id=run_id,
            mode="apply",
            policy_version=policy_version,
            started_at=started_at,
            completed_at=completed_at,
            candidate_counts=candidate_counts,
            deleted_counts=deleted_counts,
        )

    def operational_metrics(
        self,
        policy: RetentionPolicyView,
        *,
        now: datetime,
    ) -> SocialMeetOperationalMetrics:
        params = _retention_params(policy, now)
        with self._database.engine.connect() as connection:
            profile_visibility = _status_counts(
                connection,
                "select profile_visibility as status, count(*) as count from public.hg_profiles group by profile_visibility",
            )
            invite_states = _status_counts(
                connection,
                "select status, count(*) as count from public.hg_spotmeeting_invites group by status",
            )
            report_states = _status_counts(
                connection,
                "select status, count(*) as count from public.hg_social_meet_reports group by status",
            )
            moderation_queue_states = _status_counts(
                connection,
                "select state as status, count(*) as count from public.hg_social_meet_moderation_queue group by state",
            )
            active_blocks = _scalar_count(
                connection,
                "select count(*) from public.hg_social_meet_blocks where status = 'active'",
            )
            active_restrictions = _scalar_count(
                connection,
                "select count(*) from public.hg_social_meet_profile_restrictions where status = 'active'",
            )
            open_appeals = _scalar_count(
                connection,
                "select count(*) from public.hg_social_meet_appeals where status in ('submitted', 'under_review')",
            )
            active_retention_holds = int(
                connection.execute(
                    text(
                        """
                        select count(*)
                        from public.hg_social_meet_retention_holds
                        where status = 'active'
                          and (hold_until is null or hold_until > :now)
                        """
                    ),
                    {"now": now},
                ).scalar_one()
            )
            retention_candidates = _count_candidates(connection, params)
            last_retention_run = _last_retention_run(connection)

        return SocialMeetOperationalMetrics(
            generated_at=now,
            profile_visibility=profile_visibility,
            invite_states=invite_states,
            report_states=report_states,
            moderation_queue_states=moderation_queue_states,
            active_blocks=active_blocks,
            active_restrictions=active_restrictions,
            open_appeals=open_appeals,
            active_retention_holds=active_retention_holds,
            retention_candidates=retention_candidates,
            last_retention_run=last_retention_run,
        )


def _retention_params(policy: RetentionPolicyView, now: datetime) -> dict[str, object]:
    return {
        "now": now,
        "terminal_invite_cutoff": now - timedelta(days=policy.terminal_invite_days),
        "removed_block_cutoff": now - timedelta(days=policy.removed_block_days),
        "closed_report_cutoff": now - timedelta(days=policy.closed_report_days),
        "closed_moderation_cutoff": now - timedelta(days=policy.closed_moderation_days),
        "inactive_restriction_cutoff": now - timedelta(
            days=policy.inactive_restriction_days
        ),
        "closed_appeal_cutoff": now - timedelta(days=policy.closed_appeal_days),
        "safety_audit_cutoff": now - timedelta(days=policy.safety_audit_days),
        "released_hold_cutoff": now - timedelta(days=policy.released_hold_days),
    }


def _count_candidates(connection: Connection, params: dict[str, object]) -> RetentionCounts:
    row = (
        connection.execute(
            text(
                f"""
                select
                  (select count(*) from public.hg_spotmeeting_invites invite
                    where {_INVITE_PREDICATE}) as terminal_invites,
                  (select count(*) from public.hg_social_meet_blocks block_record
                    where {_BLOCK_PREDICATE}) as removed_blocks,
                  (select count(*) from public.hg_social_meet_reports report
                    where {_REPORT_PREDICATE}) as closed_reports,
                  (select count(*) from public.hg_social_meet_moderation_queue queue_item
                    where {_MODERATION_QUEUE_PREDICATE}) as closed_moderation_queue,
                  (select count(*) from public.hg_social_meet_profile_restrictions restriction
                    where {_RESTRICTION_PREDICATE}) as inactive_restrictions,
                  (select count(*) from public.hg_social_meet_appeals appeal
                    where {_APPEAL_PREDICATE}) as closed_appeals,
                  (select count(*) from public.hg_social_meet_safety_audit audit
                    where {_SAFETY_AUDIT_PREDICATE}) as safety_audit_events,
                  (select count(*) from public.hg_social_meet_retention_holds retention_hold
                    where {_RELEASED_HOLD_PREDICATE}) as released_holds
                """
            ),
            params,
        )
        .mappings()
        .one()
    )
    return RetentionCounts(**{key: int(row[key]) for key in RetentionCounts.model_fields})


def _delete_candidates(connection: Connection, params: dict[str, object]) -> RetentionCounts:
    deleted: dict[str, int] = {}

    deleted["closed_appeals"] = _delete_count(
        connection,
        f"delete from public.hg_social_meet_appeals as appeal where {_APPEAL_PREDICATE}",
        params,
    )
    deleted["inactive_restrictions"] = _delete_count(
        connection,
        f"delete from public.hg_social_meet_profile_restrictions as restriction where {_RESTRICTION_PREDICATE}",
        params,
    )
    deleted["closed_moderation_queue"] = _delete_count(
        connection,
        f"delete from public.hg_social_meet_moderation_queue as queue_item where {_MODERATION_QUEUE_PREDICATE}",
        params,
    )
    deleted["closed_reports"] = _delete_count(
        connection,
        f"delete from public.hg_social_meet_reports as report where {_REPORT_PREDICATE}",
        params,
    )
    deleted["removed_blocks"] = _delete_count(
        connection,
        f"delete from public.hg_social_meet_blocks as block_record where {_BLOCK_PREDICATE}",
        params,
    )
    deleted["terminal_invites"] = _delete_count(
        connection,
        f"delete from public.hg_spotmeeting_invites as invite where {_INVITE_PREDICATE}",
        params,
    )
    deleted["safety_audit_events"] = _delete_count(
        connection,
        f"delete from public.hg_social_meet_safety_audit as audit where {_SAFETY_AUDIT_PREDICATE}",
        params,
    )
    deleted["released_holds"] = _delete_count(
        connection,
        f"delete from public.hg_social_meet_retention_holds as retention_hold where {_RELEASED_HOLD_PREDICATE}",
        params,
    )

    return RetentionCounts(**deleted)


def _delete_count(
    connection: Connection,
    statement: str,
    params: dict[str, object],
) -> int:
    result = connection.execute(text(statement), params)
    return max(int(result.rowcount or 0), 0)


def _status_counts(connection: Connection, statement: str) -> AggregateStatusCounts:
    rows = connection.execute(text(statement)).mappings().all()
    return AggregateStatusCounts(
        values={str(row["status"]): int(row["count"]) for row in rows}
    )


def _scalar_count(connection: Connection, statement: str) -> int:
    return int(connection.execute(text(statement)).scalar_one())


def _last_retention_run(connection: Connection) -> LastRetentionRun | None:
    row = (
        connection.execute(
            text(
                """
                select id, status, completed_at, deleted_counts
                from public.hg_social_meet_retention_runs
                order by started_at desc, id desc
                limit 1
                """
            )
        )
        .mappings()
        .one_or_none()
    )
    if row is None:
        return None
    raw_counts = row.get("deleted_counts") or {}
    counts = json.loads(raw_counts) if isinstance(raw_counts, str) else raw_counts
    deleted_total = sum(int(value) for value in cast(dict[str, object], counts).values())
    return LastRetentionRun(
        run_id=cast(UUID, row["id"]),
        status=str(row["status"]),
        completed_at=cast(datetime | None, row.get("completed_at")),
        deleted_total=deleted_total,
    )


def _map_hold(row: RowMapping) -> RetentionHoldView:
    return RetentionHoldView(
        hold_id=cast(UUID, row["id"]),
        entity_type=RetentionEntityType(str(row["entity_type"])),
        entity_id=cast(UUID, row["entity_id"]),
        reason_code=RetentionHoldReason(str(row["reason_code"])),
        status=RetentionHoldStatus(str(row["status"])),
        hold_until=cast(datetime | None, row.get("hold_until")),
        created_at=cast(datetime, row["created_at"]),
        released_at=cast(datetime | None, row.get("released_at")),
    )
