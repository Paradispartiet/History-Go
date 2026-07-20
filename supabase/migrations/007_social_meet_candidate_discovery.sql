-- 007_social_meet_candidate_discovery.sql
-- History Go — privacy-safe, server-owned candidate discovery support.
--
-- Discovery is disabled by default. This migration adds only a private rollout
-- gate and query indexes over the existing canonical hg_profiles/safety state.
-- No location, presence, social graph, feed, visit-history or passive behavior
-- source is introduced.

create table if not exists public.hg_social_meet_feature_flags (
  feature_key          text primary key,
  enabled              boolean not null default false,
  rollout_percent      integer not null default 0,
  allowed_profile_ids  uuid[] not null default '{}',
  updated_at           timestamptz not null default now(),

  constraint hg_social_meet_feature_flags_rollout_check
    check (rollout_percent between 0 and 100),
  constraint hg_social_meet_feature_flags_key_length_check
    check (char_length(feature_key) between 1 and 80)
);

create trigger set_hg_social_meet_feature_flags_updated_at
  before update on public.hg_social_meet_feature_flags
  for each row execute function public.set_updated_at();

insert into public.hg_social_meet_feature_flags (
  feature_key,
  enabled,
  rollout_percent,
  allowed_profile_ids
)
values ('spotmeeting_discovery', false, 0, '{}')
on conflict (feature_key) do nothing;

comment on table public.hg_social_meet_feature_flags is
  'Private server rollout controls. Discovery is fail-closed when the flag is missing or disabled.';
comment on column public.hg_social_meet_feature_flags.allowed_profile_ids is
  'Optional public profile-id cohort allowlist. Never store auth/account ids, location, presence or private safety data here.';

alter table public.hg_social_meet_feature_flags enable row level security;
revoke all on table public.hg_social_meet_feature_flags from anon, authenticated;

-- Eligibility and compatibility ranking read only explicit public-profile state.
create index if not exists hg_profiles_discovery_eligible_idx
  on public.hg_profiles (profile_id)
  where profile_visibility = 'discoverable'
    and profile_id is not null
    and deleted_at is null;

create index if not exists hg_profiles_preferred_themes_gin_idx
  on public.hg_profiles using gin (preferred_themes);
create index if not exists hg_profiles_favorite_eras_gin_idx
  on public.hg_profiles using gin (favorite_eras);
create index if not exists hg_profiles_learning_goals_gin_idx
  on public.hg_profiles using gin (learning_goals);
create index if not exists hg_profiles_knowledge_fingerprint_gin_idx
  on public.hg_profiles using gin (knowledge_fingerprint_summary jsonb_path_ops);

-- Candidate suppression needs fast pair checks without exposing the private reason.
create index if not exists hg_social_meet_reports_pair_status_created_idx
  on public.hg_social_meet_reports (
    reporter_profile_id,
    reported_profile_id,
    status,
    created_at desc
  );

create index if not exists hg_social_meet_blocks_pair_status_updated_idx
  on public.hg_social_meet_blocks (
    blocker_profile_id,
    blocked_profile_id,
    status,
    updated_at desc
  );
