-- 004_social_meet_moderation.sql
-- History Go — private Social Meet moderation queue, restrictions, appeals and audit.
--
-- This migration does not enable production discovery or invite delivery. All
-- tables are server-owned and must be accessed through authenticated FastAPI
-- moderator/admin boundaries.

create table if not exists public.hg_social_meet_moderation_queue (
  id                     uuid primary key default gen_random_uuid(),
  report_id              uuid not null unique references public.hg_social_meet_reports (id) on delete cascade,
  subject_profile_id     uuid not null references public.hg_profiles (profile_id) on delete restrict,
  reporter_profile_id    uuid not null references public.hg_profiles (profile_id) on delete restrict,
  related_invite_id      uuid references public.hg_spotmeeting_invites (id) on delete set null,
  priority               text not null default 'normal',
  category               text not null,
  state                  text not null default 'queued',
  assigned_staff_user_id uuid,
  resolution_code        text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  closed_at              timestamptz,

  constraint hg_social_meet_moderation_queue_priority_check
    check (priority in ('low', 'normal', 'high', 'urgent')),
  constraint hg_social_meet_moderation_queue_state_check
    check (state in (
      'queued',
      'triaged',
      'under_review',
      'actioned',
      'no_action',
      'appealed',
      'closed'
    )),
  constraint hg_social_meet_moderation_queue_resolution_code_check
    check (
      resolution_code is null
      or resolution_code in (
        'no_policy_violation',
        'warning_or_guidance',
        'profile_suspended',
        'retained_for_safety'
      )
    )
);

create trigger set_hg_social_meet_moderation_queue_updated_at
  before update on public.hg_social_meet_moderation_queue
  for each row execute function public.set_updated_at();

create index if not exists hg_social_meet_moderation_queue_state_priority_idx
  on public.hg_social_meet_moderation_queue (state, priority, created_at asc);
create index if not exists hg_social_meet_moderation_queue_subject_idx
  on public.hg_social_meet_moderation_queue (subject_profile_id, created_at desc);

comment on table public.hg_social_meet_moderation_queue is
  'Private moderator/admin work queue. Reporter identity is staff-confidential and never participant-facing.';

create table if not exists public.hg_social_meet_profile_restrictions (
  id                     uuid primary key default gen_random_uuid(),
  profile_id             uuid not null references public.hg_profiles (profile_id) on delete restrict,
  restriction_type       text not null,
  status                 text not null default 'active',
  reason_code            text not null,
  source_report_id       uuid references public.hg_social_meet_reports (id) on delete set null,
  applied_by_user_id     uuid not null,
  lifted_by_user_id      uuid,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  lifted_at              timestamptz,

  constraint hg_social_meet_profile_restrictions_type_check
    check (restriction_type in ('social_meet_suspension')),
  constraint hg_social_meet_profile_restrictions_status_check
    check (status in ('active', 'lifted', 'superseded')),
  constraint hg_social_meet_profile_restrictions_reason_check
    check (reason_code in (
      'harassment',
      'spam',
      'unsafe_behavior',
      'impersonation',
      'minor_safety',
      'other_policy_violation',
      'moderation_policy'
    ))
);

create trigger set_hg_social_meet_profile_restrictions_updated_at
  before update on public.hg_social_meet_profile_restrictions
  for each row execute function public.set_updated_at();

create unique index if not exists hg_social_meet_profile_restrictions_active_suspension_uidx
  on public.hg_social_meet_profile_restrictions (profile_id, restriction_type)
  where status = 'active';
create index if not exists hg_social_meet_profile_restrictions_profile_idx
  on public.hg_social_meet_profile_restrictions (profile_id, status, created_at desc);

comment on table public.hg_social_meet_profile_restrictions is
  'Private server-authoritative Social Meet restrictions. Staff auth user ids are internal and never public.';

create table if not exists public.hg_social_meet_appeals (
  id                     uuid primary key default gen_random_uuid(),
  appellant_profile_id   uuid not null references public.hg_profiles (profile_id) on delete restrict,
  restriction_id         uuid not null references public.hg_social_meet_profile_restrictions (id) on delete restrict,
  reason_code            text not null,
  status                 text not null default 'submitted',
  decided_by_user_id     uuid,
  decision_reason_code   text,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  decided_at             timestamptz,

  constraint hg_social_meet_appeals_reason_code_check
    check (reason_code in (
      'incorrect_decision',
      'new_context',
      'identity_issue',
      'other_policy_ground'
    )),
  constraint hg_social_meet_appeals_status_check
    check (status in (
      'submitted',
      'under_review',
      'upheld',
      'modified',
      'reversed',
      'closed'
    )),
  constraint hg_social_meet_appeals_decision_reason_check
    check (
      decision_reason_code is null
      or decision_reason_code in (
        'restriction_confirmed',
        'restriction_reduced',
        'restriction_reversed',
        'insufficient_new_information'
      )
    )
);

create trigger set_hg_social_meet_appeals_updated_at
  before update on public.hg_social_meet_appeals
  for each row execute function public.set_updated_at();

create unique index if not exists hg_social_meet_appeals_open_restriction_uidx
  on public.hg_social_meet_appeals (appellant_profile_id, restriction_id)
  where status in ('submitted', 'under_review');
create index if not exists hg_social_meet_appeals_status_idx
  on public.hg_social_meet_appeals (status, created_at asc);

comment on table public.hg_social_meet_appeals is
  'Structured Social Meet moderation appeals. No reporter identity, evidence text or moderator notes are participant-facing.';

create table if not exists public.hg_social_meet_safety_audit (
  id                     uuid primary key default gen_random_uuid(),
  actor_type             text not null,
  actor_staff_user_id    uuid,
  target_profile_id      uuid references public.hg_profiles (profile_id) on delete set null,
  action_type            text not null,
  related_report_id      uuid references public.hg_social_meet_reports (id) on delete set null,
  related_queue_item_id  uuid references public.hg_social_meet_moderation_queue (id) on delete set null,
  related_restriction_id uuid references public.hg_social_meet_profile_restrictions (id) on delete set null,
  related_appeal_id      uuid references public.hg_social_meet_appeals (id) on delete set null,
  policy_version         text not null default 'social_meet_moderation_v1',
  decision               text not null,
  reason_code            text,
  created_at             timestamptz not null default now(),

  constraint hg_social_meet_safety_audit_actor_type_check
    check (actor_type in ('moderator', 'admin', 'system'))
);

create index if not exists hg_social_meet_safety_audit_created_idx
  on public.hg_social_meet_safety_audit (created_at desc);
create index if not exists hg_social_meet_safety_audit_target_idx
  on public.hg_social_meet_safety_audit (target_profile_id, created_at desc);

comment on table public.hg_social_meet_safety_audit is
  'Private safety decision audit. Never store GPS, location/presence, public visit history, free chat, raw IP/device identifiers or moderator notes here.';

-- All moderation persistence is server-owned. No direct participant/browser read
-- or write path is granted for queue, restrictions, appeals decisions or audit.
alter table public.hg_social_meet_moderation_queue enable row level security;
alter table public.hg_social_meet_profile_restrictions enable row level security;
alter table public.hg_social_meet_appeals enable row level security;
alter table public.hg_social_meet_safety_audit enable row level security;

revoke all on table public.hg_social_meet_moderation_queue from anon, authenticated;
revoke all on table public.hg_social_meet_profile_restrictions from anon, authenticated;
revoke all on table public.hg_social_meet_appeals from anon, authenticated;
revoke all on table public.hg_social_meet_safety_audit from anon, authenticated;
