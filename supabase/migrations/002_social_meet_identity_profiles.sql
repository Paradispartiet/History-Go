-- 002_social_meet_identity_profiles.sql
-- History Go — Social Meet authenticated identity and opt-in public profiles.
--
-- Extends the existing hg_profiles table instead of creating a parallel profile
-- store. auth.users.id remains a private authentication binding. social_user_id
-- is the opaque backend/service identity, while profile_id is the only stable id
-- that may be exposed by public Social Meet profile APIs.

alter table public.hg_profiles
  add column if not exists social_user_id uuid not null default gen_random_uuid(),
  add column if not exists profile_id uuid,
  add column if not exists short_bio text,
  add column if not exists preferred_themes text[] not null default '{}',
  add column if not exists favorite_eras text[] not null default '{}',
  add column if not exists interest_places text[] not null default '{}',
  add column if not exists learning_goals text[] not null default '{}',
  add column if not exists knowledge_badges text[] not null default '{}',
  add column if not exists knowledge_fingerprint_summary jsonb not null default '{}'::jsonb,
  add column if not exists profile_visibility text not null default 'draft',
  add column if not exists consent_version text,
  add column if not exists consented_at timestamptz;

create unique index if not exists hg_profiles_social_user_id_uidx
  on public.hg_profiles (social_user_id);

create unique index if not exists hg_profiles_profile_id_uidx
  on public.hg_profiles (profile_id)
  where profile_id is not null;

create index if not exists hg_profiles_discoverable_profile_idx
  on public.hg_profiles (profile_id)
  where profile_visibility = 'discoverable' and profile_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'hg_profiles_visibility_check'
      and conrelid = 'public.hg_profiles'::regclass
  ) then
    alter table public.hg_profiles
      add constraint hg_profiles_visibility_check
      check (profile_visibility in (
        'draft',
        'private',
        'discoverable',
        'paused',
        'blocked_or_suspended',
        'deleted'
      ));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'hg_profiles_display_name_length_check'
      and conrelid = 'public.hg_profiles'::regclass
  ) then
    alter table public.hg_profiles
      add constraint hg_profiles_display_name_length_check
      check (display_name is null or char_length(display_name) between 1 and 80);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'hg_profiles_short_bio_length_check'
      and conrelid = 'public.hg_profiles'::regclass
  ) then
    alter table public.hg_profiles
      add constraint hg_profiles_short_bio_length_check
      check (short_bio is null or char_length(short_bio) <= 240);
  end if;
end;
$$;

comment on column public.hg_profiles.user_id is
  'Private Supabase auth.users binding. Never expose from public Social Meet APIs.';
comment on column public.hg_profiles.social_user_id is
  'Opaque private/service Social Meet user id. Distinct from the auth provider subject.';
comment on column public.hg_profiles.profile_id is
  'Opaque public Social Meet profile id. The only stable user id exposed by public profile/discovery/invite APIs.';
comment on column public.hg_profiles.profile_visibility is
  'Explicit Social Meet profile visibility state. discoverable requires active consent enforced by the backend.';
comment on column public.hg_profiles.consent_version is
  'Version of the Social Meet public-profile consent accepted by the user.';
comment on column public.hg_profiles.consented_at is
  'Timestamp of the latest consent accepted for Social Meet public-profile publication.';

-- The legacy browser adapter still owns the user's basic History Go profile
-- fields during migration, but it must not be able to self-authorize Social Meet
-- publication or write server-owned consent/fingerprint state directly.
revoke insert, update on table public.hg_profiles from authenticated;
grant insert (user_id, display_name, avatar_url, public_home_place_id)
  on table public.hg_profiles to authenticated;
grant update (display_name, avatar_url, public_home_place_id)
  on table public.hg_profiles to authenticated;
