-- History GO — temporary, user-declared Social Meet place status.
-- The status is attached to the existing canonical hg_profiles row.
-- It stores one canonical public place id plus a hard expiry; no coordinates,
-- distance, passive tracking or visit history are introduced.

alter table public.hg_profiles
  add column if not exists current_place_id text,
  add column if not exists current_place_visible_until timestamptz,
  add column if not exists current_place_consent_version text;

-- The existing hg_profiles updated_at trigger is profile freshness, not presence freshness.
-- Restrict it to profile/account fields so toggling temporary place status cannot
-- leak an activation timestamp through the public profileUpdatedAt field.
drop trigger if exists set_hg_profiles_updated_at on public.hg_profiles;
create trigger set_hg_profiles_updated_at
  before update of
    display_name,
    avatar_url,
    public_home_place_id,
    social_user_id,
    profile_id,
    short_bio,
    preferred_themes,
    favorite_eras,
    interest_places,
    learning_goals,
    knowledge_badges,
    knowledge_fingerprint_summary,
    profile_visibility,
    consent_version,
    consented_at,
    deleted_at
  on public.hg_profiles
  for each row execute function public.set_updated_at();

create index if not exists hg_profiles_current_place_status_idx
  on public.hg_profiles (current_place_id, current_place_visible_until)
  where current_place_id is not null
    and current_place_visible_until is not null
    and profile_visibility = 'discoverable';

comment on column public.hg_profiles.current_place_id is
  'Optional canonical public History GO place id explicitly selected for temporary Social Meet visibility.';
comment on column public.hg_profiles.current_place_visible_until is
  'Hard expiry for the current self-declared place status; expired values are not participant-visible.';
comment on column public.hg_profiles.current_place_consent_version is
  'Versioned explicit consent for temporary current-place visibility.';

insert into public.hg_social_meet_feature_flags (
  feature_key,
  enabled,
  rollout_percent,
  allowed_profile_ids
)
values ('social_meet_place_status', false, 0, '{}')
on conflict (feature_key) do nothing;
