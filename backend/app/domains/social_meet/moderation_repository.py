from __future__ import annotations

from datetime import datetime
from typing import cast
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.engine import RowMapping

from app.core.database import Database
from app.domains.social_meet.moderation_models import (
    AppealDecision,
    AppealDecisionReasonCode,
    AppealReasonCode,
    AppealStatus,
    AppealView,
    ModerationPriority,
    ModerationQueueItem,
    ModerationQueueState,
    ModerationResolutionCode,
    RestrictionReasonCode,
    RestrictionView,
)
from app.domains.social_meet.safety_models import ReportReasonCode

_QUEUE_COLUMNS = """
  id, report_id, subject_profile_id, reporter_profile_id, related_invite_id,
  priority, category, state, assigned_staff_user_id, resolution_code,
  created_at, updated_at, closed_at
"""

_RESTRICTION_COLUMNS = """
  id, profile_id, restriction_type, status, reason_code, source_report_id,
  created_at, updated_at, lifted_at
"""

_APPEAL_COLUMNS = """
  id, restriction_id, reason_code, status, decision_reason_code,
  created_at, updated_at, decided_at
"""


class PostgresSocialMeetModerationRepository:
    def __init__(self, database: Database) -> None:
        self._database = database

    def reconcile_queue(self) -> None:
        with self._database.engine.begin() as connection:
            connection.execute(
                text(
                    """
                    insert into public.hg_social_meet_moderation_queue (
                      report_id,
                      subject_profile_id,
                      reporter_profile_id,
                      related_invite_id,
                      priority,
                      category
                    )
                    select
                      r.id,
                      r.reported_profile_id,
                      r.reporter_profile_id,
                      r.related_invite_id,
                      case
                        when r.reason_code = 'minor_safety' then 'urgent'
                        when r.reason_code in ('harassment', 'unsafe_behavior') then 'high'
                        when r.reason_code = 'spam' then 'low'
                        else 'normal'
                      end,
                      r.reason_code
                    from public.hg_social_meet_reports r
                    where r.status in ('submitted', 'queued', 'under_review')
                      and not exists (
                        select 1
                        from public.hg_social_meet_moderation_queue q
                        where q.report_id = r.id
                      )
                    on conflict (report_id) do nothing
                    """
                )
            )

    def list_queue(
        self,
        *,
        state: ModerationQueueState | None,
        limit: int,
    ) -> list[ModerationQueueItem]:
        self.reconcile_queue()
        with self._database.engine.connect() as connection:
            rows = (
                connection.execute(
                    text(
                        f"""
                        select {_QUEUE_COLUMNS}
                        from public.hg_social_meet_moderation_queue
                        where (:state is null or state = :state)
                        order by
                          case priority
                            when 'urgent' then 1
                            when 'high' then 2
                            when 'normal' then 3
                            else 4
                          end,
                          created_at asc
                        limit :limit
                        """
                    ),
                    {"state": state.value if state is not None else None, "limit": limit},
                )
                .mappings()
                .all()
            )
        return [_map_queue_item(row) for row in rows]

    def get_queue_item(self, queue_item_id: UUID) -> ModerationQueueItem | None:
        self.reconcile_queue()
        with self._database.engine.connect() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                        select {_QUEUE_COLUMNS}
                        from public.hg_social_meet_moderation_queue
                        where id = :queue_item_id
                        """
                    ),
                    {"queue_item_id": queue_item_id},
                )
                .mappings()
                .one_or_none()
            )
        return _map_queue_item(row) if row is not None else None

    def claim_queue_item(self, queue_item_id: UUID, staff_user_id: UUID) -> ModerationQueueItem | None:
        with self._database.engine.begin() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                        update public.hg_social_meet_moderation_queue
                        set
                          assigned_staff_user_id = :staff_user_id,
                          state = 'under_review'
                        where id = :queue_item_id
                          and state not in ('actioned', 'no_action', 'closed')
                          and (
                            assigned_staff_user_id is null
                            or assigned_staff_user_id = :staff_user_id
                          )
                        returning {_QUEUE_COLUMNS}
                        """
                    ),
                    {"queue_item_id": queue_item_id, "staff_user_id": staff_user_id},
                )
                .mappings()
                .one_or_none()
            )
        return _map_queue_item(row) if row is not None else None

    def release_queue_item(
        self,
        queue_item_id: UUID,
        staff_user_id: UUID,
    ) -> ModerationQueueItem | None:
        with self._database.engine.begin() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                        update public.hg_social_meet_moderation_queue
                        set assigned_staff_user_id = null, state = 'queued'
                        where id = :queue_item_id
                          and assigned_staff_user_id = :staff_user_id
                          and state not in ('actioned', 'no_action', 'closed')
                        returning {_QUEUE_COLUMNS}
                        """
                    ),
                    {"queue_item_id": queue_item_id, "staff_user_id": staff_user_id},
                )
                .mappings()
                .one_or_none()
            )
        return _map_queue_item(row) if row is not None else None

    def escalate_queue_item(self, queue_item_id: UUID) -> ModerationQueueItem | None:
        with self._database.engine.begin() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                        update public.hg_social_meet_moderation_queue
                        set priority = case
                          when priority = 'low' then 'normal'
                          when priority = 'normal' then 'high'
                          else 'urgent'
                        end,
                        state = case when state = 'queued' then 'triaged' else state end
                        where id = :queue_item_id
                          and state not in ('actioned', 'no_action', 'closed')
                        returning {_QUEUE_COLUMNS}
                        """
                    ),
                    {"queue_item_id": queue_item_id},
                )
                .mappings()
                .one_or_none()
            )
        return _map_queue_item(row) if row is not None else None

    def resolve_report(
        self,
        report_id: UUID,
        *,
        resolution_code: ModerationResolutionCode,
        staff_user_id: UUID,
    ) -> ModerationQueueItem | None:
        report_status = (
            "no_action"
            if resolution_code is ModerationResolutionCode.NO_POLICY_VIOLATION
            else "retained_for_safety"
            if resolution_code is ModerationResolutionCode.RETAINED_FOR_SAFETY
            else "actioned"
        )
        queue_state = "no_action" if report_status == "no_action" else "actioned"
        with self._database.engine.begin() as connection:
            connection.execute(
                text(
                    """
                    update public.hg_social_meet_reports
                    set status = :report_status
                    where id = :report_id
                    """
                ),
                {"report_id": report_id, "report_status": report_status},
            )
            row = (
                connection.execute(
                    text(
                        f"""
                        update public.hg_social_meet_moderation_queue
                        set
                          state = :queue_state,
                          resolution_code = :resolution_code,
                          assigned_staff_user_id = coalesce(
                            assigned_staff_user_id,
                            :staff_user_id
                          ),
                          closed_at = now()
                        where report_id = :report_id
                        returning {_QUEUE_COLUMNS}
                        """
                    ),
                    {
                        "report_id": report_id,
                        "queue_state": queue_state,
                        "resolution_code": resolution_code.value,
                        "staff_user_id": staff_user_id,
                    },
                )
                .mappings()
                .one_or_none()
            )
        return _map_queue_item(row) if row is not None else None

    def suspend_profile(
        self,
        profile_id: UUID,
        *,
        reason_code: RestrictionReasonCode,
        source_report_id: UUID | None,
        staff_user_id: UUID,
    ) -> RestrictionView | None:
        with self._database.engine.begin() as connection:
            profile_exists = connection.execute(
                text(
                    """
                    select exists (
                      select 1
                      from public.hg_profiles
                      where profile_id = :profile_id
                        and deleted_at is null
                    )
                    """
                ),
                {"profile_id": profile_id},
            ).scalar_one()
            if not profile_exists:
                return None

            row = (
                connection.execute(
                    text(
                        f"""
                        insert into public.hg_social_meet_profile_restrictions (
                          profile_id,
                          restriction_type,
                          reason_code,
                          source_report_id,
                          applied_by_user_id
                        )
                        values (
                          :profile_id,
                          'social_meet_suspension',
                          :reason_code,
                          :source_report_id,
                          :staff_user_id
                        )
                        on conflict (profile_id, restriction_type)
                          where status = 'active'
                        do update set
                          reason_code = excluded.reason_code,
                          source_report_id = coalesce(
                            excluded.source_report_id,
                            public.hg_social_meet_profile_restrictions.source_report_id
                          ),
                          updated_at = now()
                        returning {_RESTRICTION_COLUMNS}
                        """
                    ),
                    {
                        "profile_id": profile_id,
                        "reason_code": reason_code.value,
                        "source_report_id": source_report_id,
                        "staff_user_id": staff_user_id,
                    },
                )
                .mappings()
                .one()
            )
            connection.execute(
                text(
                    """
                    update public.hg_profiles
                    set profile_visibility = 'blocked_or_suspended'
                    where profile_id = :profile_id
                    """
                ),
                {"profile_id": profile_id},
            )
        return _map_restriction(row)

    def restore_profile(
        self,
        profile_id: UUID,
        *,
        staff_user_id: UUID,
    ) -> RestrictionView | None:
        with self._database.engine.begin() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                        update public.hg_social_meet_profile_restrictions
                        set
                          status = 'lifted',
                          lifted_by_user_id = :staff_user_id,
                          lifted_at = now()
                        where profile_id = :profile_id
                          and restriction_type = 'social_meet_suspension'
                          and status = 'active'
                        returning {_RESTRICTION_COLUMNS}
                        """
                    ),
                    {"profile_id": profile_id, "staff_user_id": staff_user_id},
                )
                .mappings()
                .one_or_none()
            )
            if row is None:
                return None
            connection.execute(
                text(
                    """
                    update public.hg_profiles
                    set profile_visibility = 'paused'
                    where profile_id = :profile_id
                      and deleted_at is null
                    """
                ),
                {"profile_id": profile_id},
            )
        return _map_restriction(row)

    def list_appeals(self, appellant_profile_id: UUID) -> list[AppealView]:
        with self._database.engine.connect() as connection:
            rows = (
                connection.execute(
                    text(
                        f"""
                        select {_APPEAL_COLUMNS}
                        from public.hg_social_meet_appeals
                        where appellant_profile_id = :appellant_profile_id
                        order by created_at desc
                        """
                    ),
                    {"appellant_profile_id": appellant_profile_id},
                )
                .mappings()
                .all()
            )
        return [_map_appeal(row) for row in rows]

    def create_appeal(
        self,
        appellant_profile_id: UUID,
        restriction_id: UUID,
        reason_code: AppealReasonCode,
    ) -> AppealView | None:
        with self._database.engine.begin() as connection:
            owns_restriction = connection.execute(
                text(
                    """
                    select exists (
                      select 1
                      from public.hg_social_meet_profile_restrictions
                      where id = :restriction_id
                        and profile_id = :appellant_profile_id
                    )
                    """
                ),
                {
                    "restriction_id": restriction_id,
                    "appellant_profile_id": appellant_profile_id,
                },
            ).scalar_one()
            if not owns_restriction:
                return None
            row = (
                connection.execute(
                    text(
                        f"""
                        insert into public.hg_social_meet_appeals (
                          appellant_profile_id,
                          restriction_id,
                          reason_code
                        )
                        values (:appellant_profile_id, :restriction_id, :reason_code)
                        on conflict (appellant_profile_id, restriction_id)
                          where status in ('submitted', 'under_review')
                        do update set updated_at = now()
                        returning {_APPEAL_COLUMNS}
                        """
                    ),
                    {
                        "appellant_profile_id": appellant_profile_id,
                        "restriction_id": restriction_id,
                        "reason_code": reason_code.value,
                    },
                )
                .mappings()
                .one()
            )
        return _map_appeal(row)

    def decide_appeal(
        self,
        appeal_id: UUID,
        *,
        decision: AppealDecision,
        reason_code: AppealDecisionReasonCode,
        staff_user_id: UUID,
    ) -> AppealView | None:
        appeal_status = {
            AppealDecision.UPHOLD: AppealStatus.UPHELD,
            AppealDecision.MODIFY: AppealStatus.MODIFIED,
            AppealDecision.REVERSE: AppealStatus.REVERSED,
        }[decision]
        with self._database.engine.begin() as connection:
            row = (
                connection.execute(
                    text(
                        f"""
                        update public.hg_social_meet_appeals
                        set
                          status = :status,
                          decided_by_user_id = :staff_user_id,
                          decision_reason_code = :reason_code,
                          decided_at = now()
                        where id = :appeal_id
                          and status in ('submitted', 'under_review')
                        returning {_APPEAL_COLUMNS}, appellant_profile_id
                        """
                    ),
                    {
                        "appeal_id": appeal_id,
                        "status": appeal_status.value,
                        "staff_user_id": staff_user_id,
                        "reason_code": reason_code.value,
                    },
                )
                .mappings()
                .one_or_none()
            )
            if row is None:
                return None

            if decision in {AppealDecision.MODIFY, AppealDecision.REVERSE}:
                connection.execute(
                    text(
                        """
                        update public.hg_social_meet_profile_restrictions
                        set
                          status = 'lifted',
                          lifted_by_user_id = :staff_user_id,
                          lifted_at = now()
                        where id = :restriction_id
                          and status = 'active'
                        """
                    ),
                    {
                        "restriction_id": row["restriction_id"],
                        "staff_user_id": staff_user_id,
                    },
                )
                connection.execute(
                    text(
                        """
                        update public.hg_profiles
                        set profile_visibility = 'paused'
                        where profile_id = :profile_id
                          and deleted_at is null
                        """
                    ),
                    {"profile_id": row["appellant_profile_id"]},
                )
        return _map_appeal(row)

    def write_audit(
        self,
        *,
        actor_type: str,
        staff_user_id: UUID,
        target_profile_id: UUID | None,
        action_type: str,
        decision: str,
        reason_code: str | None = None,
        report_id: UUID | None = None,
        queue_item_id: UUID | None = None,
        restriction_id: UUID | None = None,
        appeal_id: UUID | None = None,
    ) -> None:
        with self._database.engine.begin() as connection:
            connection.execute(
                text(
                    """
                    insert into public.hg_social_meet_safety_audit (
                      actor_type,
                      actor_staff_user_id,
                      target_profile_id,
                      action_type,
                      related_report_id,
                      related_queue_item_id,
                      related_restriction_id,
                      related_appeal_id,
                      decision,
                      reason_code
                    )
                    values (
                      :actor_type,
                      :staff_user_id,
                      :target_profile_id,
                      :action_type,
                      :report_id,
                      :queue_item_id,
                      :restriction_id,
                      :appeal_id,
                      :decision,
                      :reason_code
                    )
                    """
                ),
                {
                    "actor_type": actor_type,
                    "staff_user_id": staff_user_id,
                    "target_profile_id": target_profile_id,
                    "action_type": action_type,
                    "report_id": report_id,
                    "queue_item_id": queue_item_id,
                    "restriction_id": restriction_id,
                    "appeal_id": appeal_id,
                    "decision": decision,
                    "reason_code": reason_code,
                },
            )


def _map_queue_item(row: RowMapping) -> ModerationQueueItem:
    return ModerationQueueItem(
        queue_item_id=cast(UUID, row["id"]),
        report_id=cast(UUID, row["report_id"]),
        subject_profile_id=cast(UUID, row["subject_profile_id"]),
        reporter_profile_id=cast(UUID, row["reporter_profile_id"]),
        related_invite_id=cast(UUID | None, row.get("related_invite_id")),
        priority=ModerationPriority(str(row["priority"])),
        category=ReportReasonCode(str(row["category"])),
        state=ModerationQueueState(str(row["state"])),
        assigned=row.get("assigned_staff_user_id") is not None,
        resolution_code=(
            ModerationResolutionCode(str(row["resolution_code"]))
            if row.get("resolution_code") is not None
            else None
        ),
        created_at=cast(datetime, row["created_at"]),
        updated_at=cast(datetime, row["updated_at"]),
        closed_at=cast(datetime | None, row.get("closed_at")),
    )


def _map_restriction(row: RowMapping) -> RestrictionView:
    return RestrictionView(
        restriction_id=cast(UUID, row["id"]),
        profile_id=cast(UUID, row["profile_id"]),
        restriction_type=str(row["restriction_type"]),
        status=str(row["status"]),
        reason_code=RestrictionReasonCode(str(row["reason_code"])),
        source_report_id=cast(UUID | None, row.get("source_report_id")),
        created_at=cast(datetime, row["created_at"]),
        updated_at=cast(datetime, row["updated_at"]),
        lifted_at=cast(datetime | None, row.get("lifted_at")),
    )


def _map_appeal(row: RowMapping) -> AppealView:
    return AppealView(
        appeal_id=cast(UUID, row["id"]),
        restriction_id=cast(UUID, row["restriction_id"]),
        reason_code=AppealReasonCode(str(row["reason_code"])),
        status=AppealStatus(str(row["status"])),
        decision_reason_code=(
            AppealDecisionReasonCode(str(row["decision_reason_code"]))
            if row.get("decision_reason_code") is not None
            else None
        ),
        created_at=cast(datetime, row["created_at"]),
        updated_at=cast(datetime, row["updated_at"]),
        decided_at=cast(datetime | None, row.get("decided_at")),
    )
