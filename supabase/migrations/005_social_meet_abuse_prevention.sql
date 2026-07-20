-- 005_social_meet_abuse_prevention.sql
-- History Go — Social Meet abuse-prevention cooldowns and enforcement ledger.
--
-- Successful reports, blocks and invites remain sourced from their canonical
-- tables. This migration stores only the missing enforcement state:
--   * directional pair cooldowns;
--   * rejected/limited attempt events used for abuse-pressure checks.
--
-- It deliberately stores no IP/device fingerprint, GPS, live location, nearby,
-- presence, visit history, follower/feed data or free-chat content.

create table if not exists public.hg_social_meet_cooldowns (
  id                   uuid primary key default gen_random_uuid(),
  actor_profile_id     uuid not null references public.hg_profiles (profile_id) on delete cascade,
  target_profile_id    uuid not null references public.hg_profiles (profile_id) on delete cascade,
  reason_code          text not null,
  status               text not null default 'active',
  source_report_id     uuid references public.hg_social_meet_reports (id) on delete set null,
  source_block_id      uuid references public.hg_social_meet_blocks (id) on delete set null,
  source_invite_id     uuid references public.hg_spotmeeting_invites (id) on delete set null,
  starts_at            timestamptz not null default now(),
  expires_at           timestamptz not null,
  lifted_at            timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),

  constraint hg_social_meet_cooldowns_distinct_profiles_check
    check (actor_profile_id <> target_profile_id),
  constraint hg_social_meet_cooldowns_reason_check
    check (reason_code in (
      'report_submitted',
      'block_removed',
      'invite_declined',
      'repeated_cancellation',
      'moderation_warning'
    )),
  constraint hg_social_meet_cooldowns_status_check
    check (status in ('active', 'lifted', 'expired', 'superseded')),
  constraint hg_social_meet_cooldowns_time_check
    check (expires_at > starts_at)
);

create trigger set_hg_social_meet_cooldowns_updated_at
  before update on public.hg_social_meet_cooldowns
  for each row execute function public.set_updated_at();

create unique index if not exists hg_social_meet_cooldowns_active_pair_reason_uidx
  on public.hg_social_meet_cooldowns (actor_profile_id, target_profile_id, reason_code)
  where status = 'active';

create index if not exists hg_social_meet_cooldowns_active_actor_target_idx
  on public.hg_social_meet_cooldowns (actor_profile_id, target_profile_id, expires_at)
  where status = 'active';

comment on table public.hg_social_meet_cooldowns is
  'Private directional Social Meet contact cooldowns. Reasons are never exposed to the other participant.';

create table if not exists public.hg_social_meet_abuse_enforcement_events (
  id                   uuid primary key default gen_random_uuid(),
  actor_profile_id     uuid not null references public.hg_profiles (profile_id) on delete cascade,
  target_profile_id    uuid references public.hg_profiles (profile_id) on delete cascade,
  action_type          text not null,
  decision_code        text not null,
  context_type         text,
  context_id           text,
  related_report_id    uuid references public.hg_social_meet_reports (id) on delete set null,
  related_invite_id    uuid references public.hg_spotmeeting_invites (id) on delete set null,
  created_at           timestamptz not null default now(),

  constraint hg_social_meet_abuse_events_action_check
    check (action_type in (
      'report_create',
      'invite_create',
      'candidate_request',
      'invalid_attempt'
    )),
  constraint hg_social_meet_abuse_events_decision_check
    check (decision_code in (
      'rate_limited',
      'cooldown_active',
      'duplicate_active_invite',
      'recipient_pressure',
      'pair_pressure',
      'repeated_invalid_attempts'
    )),
  constraint hg_social_meet_abuse_events_context_type_check
    check (
      context_type is null
      or context_type in ('place', 'quiz', 'route', 'observation', 'topic', 'circle')
    )
);

create index if not exists hg_social_meet_abuse_events_actor_action_created_idx
  on public.hg_social_meet_abuse_enforcement_events (
    actor_profile_id,
    action_type,
    created_at desc
  );

create index if not exists hg_social_meet_abuse_events_pair_created_idx
  on public.hg_social_meet_abuse_enforcement_events (
    actor_profile_id,
    target_profile_id,
    created_at desc
  );

comment on table public.hg_social_meet_abuse_enforcement_events is
  'Private operational enforcement ledger for rejected Social Meet actions. No public trust score or behavioral ranking may be derived from it.';

-- Abuse-prevention persistence is server-owned. The browser must not be able to
-- inspect hidden cooldown reasons or write its own enforcement history.
alter table public.hg_social_meet_cooldowns enable row level security;
alter table public.hg_social_meet_abuse_enforcement_events enable row level security;

revoke all on table public.hg_social_meet_cooldowns from anon, authenticated;
revoke all on table public.hg_social_meet_abuse_enforcement_events from anon, authenticated;
