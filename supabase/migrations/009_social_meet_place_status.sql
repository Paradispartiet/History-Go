-- History GO — temporary, user-declared Social Meet place status.
-- The status is attached to the existing canonical hg_profiles row.
-- It stores one canonical public place id plus a hard expiry; no coordinates,
-- distance, passive tracking or visit history are introduced.

alter table public.hg_profiles
  add column if not exists current_place_id text,
  add column if not exists current_place_visible_until timestamptz,
  add column if not exists current_place_consent_version text;

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
