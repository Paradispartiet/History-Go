-- 003_social_meet_safety.sql
-- History Go — participant safety, confidential reporting, export and deletion support.
--
-- This migration builds on the existing hg_profiles identity model. Safety edges
-- use opaque public profile_id values; auth.users ids remain private and are not
-- stored in participant-facing block/report records.

alter table public.hg_profiles
  add column if not exists deleted_at timestamptz;

-- A regular UNIQUE constraint is required so safety tables can reference
-- profile_id with foreign keys. PostgreSQL still permits multiple NULL values,
-- so draft rows without a public profile id remain valid.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'hg_profiles_profile_id_unique'
      and conrelid = 'public.hg_profiles'::regclass
  ) then
    alter table public.hg_profiles
      add constraint hg_profiles_profile_id_unique unique (profile_id);
  end if;
end;
$$;

comment on column public.hg_profiles.deleted_at is
  'Private Social Meet deletion tombstone timestamp. Never expose as presence or last-seen metadata.';

create table if not exists public.hg_social_meet_blocks (
  id                   uuid primary key default gen_random_uuid(),
  blocker_profile_id   uuid not null references public.hg_profiles (profile_id) on delete restrict,
  blocked_profile_id   uuid not null references public.hg_profiles (profile_id) on delete restrict,
  scope                text not null default 'social_meet',
  related_invite_id    uuid references public.hg_spotmeeting_invites (id) on delete set null,
  related_context      jsonb not null default '{}'::jsonb,
  status               text not null default 'active',
  source_surface       text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  removed_at           timestamptz,

  constraint hg_social_meet_blocks_not_self_check
    check (blocker_profile_id <> blocked_profile_id),
  constraint hg_social_meet_blocks_scope_check
    check (scope in ('social_meet', 'spotmeeting_invites')),
  constraint hg_social_meet_blocks_status_check
    check (status in (
      'active',
      'removed_by_blocker',
      'expired_by_policy',
      'superseded_by_moderation'
    )),
  constraint hg_social_meet_blocks_context_object_check
    check (jsonb_typeof(related_context) = 'object')
);

comment on table public.hg_social_meet_blocks is
  'Private Social Meet safety relationships. Active blocks suppress interaction in both directions; block existence is never public.';

create unique index if not exists hg_social_meet_blocks_active_pair_uidx
  on public.hg_social_meet_blocks (blocker_profile_id, blocked_profile_id)
  where status = 'active';
create index if not exists hg_social_meet_blocks_blocker_idx
  on public.hg_social_meet_blocks (blocker_profile_id, created_at desc);
create index if not exists hg_social_meet_blocks_blocked_idx
  on public.hg_social_meet_blocks (blocked_profile_id, created_at desc);

create trigger set_hg_social_meet_blocks_updated_at
  before update on public.hg_social_meet_blocks
  for each row execute function public.set_updated_at();

create table if not exists public.hg_social_meet_reports (
  id                    uuid primary key default gen_random_uuid(),
  reporter_profile_id   uuid not null references public.hg_profiles (profile_id) on delete restrict,
  reported_profile_id   uuid not null references public.hg_profiles (profile_id) on delete restrict,
  related_invite_id     uuid references public.hg_spotmeeting_invites (id) on delete set null,
  related_context       jsonb not null default '{}'::jsonb,
  reason_code           text not null,
  structured_details    text[] not null default '{}',
  status                text not null default 'submitted',
  source_surface        text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint hg_social_meet_reports_not_self_check
    check (reporter_profile_id <> reported_profile_id),
  constraint hg_social_meet_reports_reason_code_check
    check (reason_code in (
      'harassment',
      'spam',
      'unsafe_behavior',
      'impersonation',
      'minor_safety',
      'other_policy_violation'
    )),
  constraint hg_social_meet_reports_status_check
    check (status in (
      'submitted',
      'queued',
      'under_review',
      'actioned',
      'no_action',
      'appealed',
      'closed',
      'retained_for_safety'
    )),
  constraint hg_social_meet_reports_context_object_check
    check (jsonb_typeof(related_context) = 'object')
);

comment on table public.hg_social_meet_reports is
  'Confidential Social Meet safety reports. Reporter identity and moderation data are private and must never be exposed to the reported profile.';

create index if not exists hg_social_meet_reports_reporter_idx
  on public.hg_social_meet_reports (reporter_profile_id, created_at desc);
create index if not exists hg_social_meet_reports_reported_idx
  on public.hg_social_meet_reports (reported_profile_id, created_at desc);
create index if not exists hg_social_meet_reports_status_idx
  on public.hg_social_meet_reports (status, created_at asc);

create trigger set_hg_social_meet_reports_updated_at
  before update on public.hg_social_meet_reports
  for each row execute function public.set_updated_at();

-- Safety records are server-owned. The authenticated browser role may read only
-- records that belong to the current reporter/blocker and cannot mutate them
-- directly. FastAPI remains the authoritative write boundary.
alter table public.hg_social_meet_blocks enable row level security;
alter table public.hg_social_meet_reports enable row level security;

create policy hg_social_meet_blocks_select_own
  on public.hg_social_meet_blocks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.hg_profiles p
      where p.profile_id = blocker_profile_id
        and p.user_id = auth.uid()
    )
  );

create policy hg_social_meet_reports_select_submitted_own
  on public.hg_social_meet_reports
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.hg_profiles p
      where p.profile_id = reporter_profile_id
        and p.user_id = auth.uid()
    )
  );

revoke insert, update, delete on table public.hg_social_meet_blocks from authenticated;
revoke insert, update, delete on table public.hg_social_meet_reports from authenticated;
grant select on table public.hg_social_meet_blocks to authenticated;
grant select on table public.hg_social_meet_reports to authenticated;
