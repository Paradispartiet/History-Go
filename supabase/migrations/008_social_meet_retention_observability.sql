-- 008_social_meet_retention_observability.sql
-- History Go — private retention holds, aggregate cleanup run records and query support.
--
-- This migration does not enable production Social Meet. It adds only server-owned
-- operational state needed to run privacy-safe retention/cleanup jobs and to prove
-- their health without creating participant tracking, presence or social-graph data.

create table if not exists public.hg_social_meet_retention_holds (
  id                    uuid primary key default gen_random_uuid(),
  entity_type           text not null,
  entity_id             uuid not null,
  reason_code           text not null,
  status                text not null default 'active',
  hold_until            timestamptz,
  created_by_user_id    uuid not null,
  released_by_user_id   uuid,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  released_at           timestamptz,

  constraint hg_social_meet_retention_holds_entity_type_check
    check (entity_type in (
      'invite',
      'block',
      'report',
      'moderation_queue',
      'restriction',
      'appeal',
      'safety_audit'
    )),
  constraint hg_social_meet_retention_holds_reason_check
    check (reason_code in (
      'legal_hold',
      'safety_review',
      'appeal_review',
      'incident_review',
      'manual_policy'
    )),
  constraint hg_social_meet_retention_holds_status_check
    check (status in ('active', 'released')),
  constraint hg_social_meet_retention_holds_release_shape_check
    check (
      (status = 'active' and released_at is null and released_by_user_id is null)
      or
      (status = 'released' and released_at is not null and released_by_user_id is not null)
    )
);

comment on table public.hg_social_meet_retention_holds is
  'Private structured retention/legal-safety holds. Entity ids and staff ids are operational data and are never participant-facing.';
comment on column public.hg_social_meet_retention_holds.hold_until is
  'Optional hold expiry. NULL means indefinite until an authorized admin releases the hold.';

create unique index if not exists hg_social_meet_retention_holds_active_entity_uidx
  on public.hg_social_meet_retention_holds (entity_type, entity_id)
  where status = 'active';
create index if not exists hg_social_meet_retention_holds_active_until_idx
  on public.hg_social_meet_retention_holds (status, hold_until);

alter table public.hg_social_meet_retention_holds enable row level security;
revoke all on table public.hg_social_meet_retention_holds from anon, authenticated;

drop trigger if exists set_hg_social_meet_retention_holds_updated_at
  on public.hg_social_meet_retention_holds;
create trigger set_hg_social_meet_retention_holds_updated_at
  before update on public.hg_social_meet_retention_holds
  for each row execute function public.set_updated_at();

create table if not exists public.hg_social_meet_retention_runs (
  id                    uuid primary key default gen_random_uuid(),
  mode                  text not null,
  policy_version        text not null,
  actor_staff_user_id   uuid not null,
  policy_snapshot       jsonb not null default '{}'::jsonb,
  candidate_counts      jsonb not null default '{}'::jsonb,
  deleted_counts        jsonb not null default '{}'::jsonb,
  status                text not null default 'started',
  error_code            text,
  started_at            timestamptz not null default now(),
  completed_at          timestamptz,

  constraint hg_social_meet_retention_runs_mode_check
    check (mode in ('preview', 'apply')),
  constraint hg_social_meet_retention_runs_status_check
    check (status in ('started', 'completed', 'failed')),
  constraint hg_social_meet_retention_runs_policy_object_check
    check (jsonb_typeof(policy_snapshot) = 'object'),
  constraint hg_social_meet_retention_runs_candidate_counts_object_check
    check (jsonb_typeof(candidate_counts) = 'object'),
  constraint hg_social_meet_retention_runs_deleted_counts_object_check
    check (jsonb_typeof(deleted_counts) = 'object')
);

comment on table public.hg_social_meet_retention_runs is
  'Private aggregate retention-run audit. Stores policy and aggregate counts only; never participant ids, pairs, location, presence or message content.';

create index if not exists hg_social_meet_retention_runs_started_idx
  on public.hg_social_meet_retention_runs (started_at desc);
create index if not exists hg_social_meet_retention_runs_status_idx
  on public.hg_social_meet_retention_runs (status, started_at desc);

alter table public.hg_social_meet_retention_runs enable row level security;
revoke all on table public.hg_social_meet_retention_runs from anon, authenticated;

-- Retention cleanup candidates are always terminal/inactive state. These indexes
-- support bounded maintenance queries without introducing a new participant model.
create index if not exists hg_spotmeeting_invites_retention_terminal_idx
  on public.hg_spotmeeting_invites (updated_at, id)
  where status in ('declined', 'cancelled', 'completed', 'expired', 'reported', 'blocked');

create index if not exists hg_social_meet_blocks_retention_removed_idx
  on public.hg_social_meet_blocks (coalesce(removed_at, updated_at), id)
  where status <> 'active';

create index if not exists hg_social_meet_reports_retention_terminal_idx
  on public.hg_social_meet_reports (updated_at, id)
  where status in ('actioned', 'no_action', 'closed');

create index if not exists hg_social_meet_moderation_queue_retention_terminal_idx
  on public.hg_social_meet_moderation_queue (coalesce(closed_at, updated_at), id)
  where state in ('actioned', 'no_action', 'closed');

create index if not exists hg_social_meet_restrictions_retention_inactive_idx
  on public.hg_social_meet_profile_restrictions (coalesce(lifted_at, updated_at), id)
  where status in ('lifted', 'superseded');

create index if not exists hg_social_meet_appeals_retention_terminal_idx
  on public.hg_social_meet_appeals (coalesce(decided_at, updated_at), id)
  where status in ('upheld', 'modified', 'reversed', 'closed');
