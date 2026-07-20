-- 003_social_meet_safety_core.sql
-- History Go — Social Meet block/report safety core.
--
-- This migration adds server-owned safety persistence around the existing
-- hg_profiles and hg_spotmeeting_invites models. It deliberately introduces no
-- location, presence, nearby, follower/feed or free-chat data.

-- Foreign keys to the nullable public profile id require a non-partial unique
-- index. PostgreSQL unique indexes still permit multiple NULL values.
create unique index if not exists hg_profiles_profile_id_full_uidx
  on public.hg_profiles (profile_id);

-- ---------------------------------------------------------------------------
-- Private user-created blocks
-- ---------------------------------------------------------------------------
create table if not exists public.hg_social_meet_blocks (
  id                   uuid primary key default gen_random_uuid(),
  blocker_profile_id   uuid not null references public.hg_profiles (profile_id) on delete cascade,
  blocked_profile_id   uuid not null references public.hg_profiles (profile_id) on delete cascade,
  scope                text not null default 'social_meet',
  related_invite_id    uuid references public.hg_spotmeeting_invites (id) on delete set null,
  related_context      jsonb,
  status               text not null default 'active',
  source_surface       text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  removed_at           timestamptz,

  constraint hg_social_meet_blocks_distinct_profiles_check
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
  constraint hg_social_meet_blocks_source_surface_length_check
    check (source_surface is null or char_length(source_surface) <= 80)
);

create trigger set_hg_social_meet_blocks_updated_at
  before update on public.hg_social_meet_blocks
  for each row execute function public.set_updated_at();

create unique index if not exists hg_social_meet_blocks_active_pair_uidx
  on public.hg_social_meet_blocks (blocker_profile_id, blocked_profile_id)
  where status = 'active';

create index if not exists hg_social_meet_blocks_blocked_idx
  on public.hg_social_meet_blocks (blocked_profile_id)
  where status = 'active';

create index if not exists hg_social_meet_blocks_blocker_created_idx
  on public.hg_social_meet_blocks (blocker_profile_id, created_at desc);

comment on table public.hg_social_meet_blocks is
  'Private Social Meet safety blocks. Never expose a block as a public profile field or notify the blocked profile with blocker identity.';
comment on column public.hg_social_meet_blocks.related_context is
  'Optional backend-sanitized History Go context. Must never contain GPS, live location, nearby, presence, visit history or free-chat content.';

-- ---------------------------------------------------------------------------
-- Confidential user-submitted reports
-- ---------------------------------------------------------------------------
create table if not exists public.hg_social_meet_reports (
  id                    uuid primary key default gen_random_uuid(),
  reporter_profile_id   uuid not null references public.hg_profiles (profile_id) on delete restrict,
  reported_profile_id   uuid not null references public.hg_profiles (profile_id) on delete restrict,
  related_invite_id     uuid references public.hg_spotmeeting_invites (id) on delete set null,
  related_context       jsonb,
  reason_code           text not null,
  structured_details    text[] not null default '{}',
  source_surface        text,
  status                text not null default 'submitted',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint hg_social_meet_reports_distinct_profiles_check
    check (reporter_profile_id <> reported_profile_id),
  constraint hg_social_meet_reports_reason_check
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
  constraint hg_social_meet_reports_source_surface_length_check
    check (source_surface is null or char_length(source_surface) <= 80)
);

create trigger set_hg_social_meet_reports_updated_at
  before update on public.hg_social_meet_reports
  for each row execute function public.set_updated_at();

create index if not exists hg_social_meet_reports_reporter_created_idx
  on public.hg_social_meet_reports (reporter_profile_id, created_at desc);
create index if not exists hg_social_meet_reports_reported_status_idx
  on public.hg_social_meet_reports (reported_profile_id, status, created_at desc);

comment on table public.hg_social_meet_reports is
  'Confidential Social Meet safety reports. Reporter identity and moderation details must never be returned to the reported profile.';
comment on column public.hg_social_meet_reports.related_context is
  'Optional backend-sanitized History Go context. No location telemetry, presence, visit history or free-chat content.';

-- ---------------------------------------------------------------------------
-- Private moderation queue. No participant-facing API is introduced here.
-- Reports remain durable even if queue fan-out needs to be retried later.
-- ---------------------------------------------------------------------------
create table if not exists public.hg_social_meet_moderation_queue (
  id                    uuid primary key default gen_random_uuid(),
  report_id             uuid unique references public.hg_social_meet_reports (id) on delete cascade,
  subject_profile_id    uuid not null references public.hg_profiles (profile_id) on delete restrict,
  reporter_profile_id   uuid references public.hg_profiles (profile_id) on delete restrict,
  related_invite_id     uuid references public.hg_spotmeeting_invites (id) on delete set null,
  related_context       jsonb,
  priority              text not null default 'normal',
  category              text not null,
  state                 text not null default 'queued',
  assigned_moderator_id text,
  review_notes          text,
  actions_taken         jsonb not null default '[]'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  closed_at             timestamptz,

  constraint hg_social_meet_moderation_priority_check
    check (priority in ('low', 'normal', 'high', 'urgent')),
  constraint hg_social_meet_moderation_state_check
    check (state in (
      'queued',
      'triaged',
      'under_review',
      'needs_more_info',
      'actioned',
      'no_action',
      'appealed',
      'closed'
    ))
);

create trigger set_hg_social_meet_moderation_queue_updated_at
  before update on public.hg_social_meet_moderation_queue
  for each row execute function public.set_updated_at();

create index if not exists hg_social_meet_moderation_queue_state_created_idx
  on public.hg_social_meet_moderation_queue (state, created_at);
create index if not exists hg_social_meet_moderation_queue_subject_idx
  on public.hg_social_meet_moderation_queue (subject_profile_id, state);

comment on table public.hg_social_meet_moderation_queue is
  'Private moderator/admin work queue. Reporter identity, review notes and actions must never appear in participant or public APIs.';

-- ---------------------------------------------------------------------------
-- Safety audit trail: decisions/actions only, never movement or presence data.
-- ---------------------------------------------------------------------------
create table if not exists public.hg_social_meet_safety_audit (
  id                   uuid primary key default gen_random_uuid(),
  actor_type           text not null,
  actor_profile_id     uuid references public.hg_profiles (profile_id) on delete set null,
  target_profile_id    uuid references public.hg_profiles (profile_id) on delete set null,
  action_type          text not null,
  related_block_id     uuid references public.hg_social_meet_blocks (id) on delete set null,
  related_report_id    uuid references public.hg_social_meet_reports (id) on delete set null,
  related_invite_id    uuid references public.hg_spotmeeting_invites (id) on delete set null,
  context_id           text,
  policy_version       text not null default 'social_meet_safety_v1',
  decision             text not null,
  reason_code          text,
  request_id           text,
  created_at           timestamptz not null default now(),

  constraint hg_social_meet_safety_audit_actor_type_check
    check (actor_type in ('user', 'moderator', 'admin', 'system'))
);

create index if not exists hg_social_meet_safety_audit_created_idx
  on public.hg_social_meet_safety_audit (created_at desc);
create index if not exists hg_social_meet_safety_audit_target_idx
  on public.hg_social_meet_safety_audit (target_profile_id, created_at desc);

comment on table public.hg_social_meet_safety_audit is
  'Private safety decision log. Do not store GPS, live location, nearby/distance, presence, visit history, follower/feed or free-chat data.';

-- Safety persistence is server-owned. The browser must not bypass FastAPI by
-- writing these tables directly through the Supabase authenticated role.
alter table public.hg_social_meet_blocks enable row level security;
alter table public.hg_social_meet_reports enable row level security;
alter table public.hg_social_meet_moderation_queue enable row level security;
alter table public.hg_social_meet_safety_audit enable row level security;

revoke all on table public.hg_social_meet_blocks from anon, authenticated;
revoke all on table public.hg_social_meet_reports from anon, authenticated;
revoke all on table public.hg_social_meet_moderation_queue from anon, authenticated;
revoke all on table public.hg_social_meet_safety_audit from anon, authenticated;
