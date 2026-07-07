-- 001_social_meet.sql
-- History Go — Social Meet / Kunnskapsmøte backend schema (first foundation).
--
-- Scope: database contract only. No frontend is wired to this schema yet.
-- See docs/social-meet-backend.md for the product model and the frontend
-- adapter plan.
--
-- Product rules baked into this schema (intentional, non-negotiable):
--   * No chat, no free-text messages, no comment/body fields.
--   * No live position, no GPS, no nearby-users, no distance-to-person.
--   * No feed, no followers, no automatic discovery, no dating logic.
--   * No private home address. `public_home_place_id` is a PUBLIC History Go
--     place id, never a private address.
--   * Everything is participant-scoped and enforced via Row Level Security.
--
-- Only preselected, context-bound meeting proposals are modelled:
--   context = place / quiz / route / observation / topic / circle,
--   and communication is limited to a server-owned `preset_message_id`.

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
-- gen_random_uuid() lives in pgcrypto. Supabase enables this by default, but
-- we request it explicitly so the migration is self-contained.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Shared trigger: keep updated_at current
-- ---------------------------------------------------------------------------
-- Simple, reusable "touch updated_at on UPDATE" helper. If the repo later
-- adopts a shared trigger function, prefer that existing pattern instead of a
-- duplicate. This is the first migration, so we define it here.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. hg_profiles — link a Supabase auth user to a History Go profile
-- ---------------------------------------------------------------------------
create table if not exists public.hg_profiles (
  user_id              uuid primary key references auth.users (id) on delete cascade,
  display_name         text,
  avatar_url           text,
  -- PUBLIC History Go place id (e.g. a landmark the user picks as "home base").
  -- This is NOT a private address and must never be used as one.
  public_home_place_id text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

comment on table public.hg_profiles is
  'Links a Supabase auth user to their History Go profile. public_home_place_id is a public History Go place id, never a private address.';
comment on column public.hg_profiles.public_home_place_id is
  'Optional PUBLIC History Go place id chosen by the user. Never a private home address.';

create trigger set_hg_profiles_updated_at
  before update on public.hg_profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. hg_spotmeeting_invites — core Kunnskapsmøte / Social Meet invite table
-- ---------------------------------------------------------------------------
create table if not exists public.hg_spotmeeting_invites (
  id                uuid primary key default gen_random_uuid(),
  created_by        uuid not null references auth.users (id) on delete cascade,
  target_user_id    uuid not null references auth.users (id) on delete cascade,
  -- Context binds the invite to one History Go object.
  context_type      text not null,
  context_id        text not null,
  context_title     text,
  source_surface    text,
  -- Communication is a server-owned preset id ONLY. There is deliberately no
  -- message / body / chat_text / comment free-text column.
  preset_message_id text not null,
  status            text not null default 'pending',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint hg_spotmeeting_invites_context_type_check
    check (context_type in ('place', 'quiz', 'route', 'observation', 'topic', 'circle')),
  constraint hg_spotmeeting_invites_status_check
    check (status in ('pending', 'accepted', 'declined', 'cancelled', 'completed'))
);

comment on table public.hg_spotmeeting_invites is
  'Preselected, context-bound Kunnskapsmøte/Social Meet invites. No free text: only a server-owned preset_message_id is stored.';
comment on column public.hg_spotmeeting_invites.preset_message_id is
  'Id of a server-owned preset message. Never store user free text here.';

-- Status lifecycle enforcement note:
--   The CHECK constraint above only limits the set of allowed status values.
--   Which participant may move to which status is intentionally NOT encoded in
--   the database. A later backend/edge adapter is responsible for the state
--   machine:
--     * creator (created_by) may cancel a pending/accepted invite;
--     * target (target_user_id) may accept/decline a pending invite;
--     * both participants may later mark an accepted invite completed, if the
--       product allows it.
--   RLS below only guarantees that a non-participant can never read or write
--   the row.

create trigger set_hg_spotmeeting_invites_updated_at
  before update on public.hg_spotmeeting_invites
  for each row execute function public.set_updated_at();

create index if not exists hg_spotmeeting_invites_created_by_idx
  on public.hg_spotmeeting_invites (created_by);
create index if not exists hg_spotmeeting_invites_target_user_id_idx
  on public.hg_spotmeeting_invites (target_user_id);
create index if not exists hg_spotmeeting_invites_status_idx
  on public.hg_spotmeeting_invites (status);
create index if not exists hg_spotmeeting_invites_context_idx
  on public.hg_spotmeeting_invites (context_type, context_id);
create index if not exists hg_spotmeeting_invites_created_at_idx
  on public.hg_spotmeeting_invites (created_at desc);

-- ---------------------------------------------------------------------------
-- 3. hg_learning_circles — small groups for later learning-circle features
-- ---------------------------------------------------------------------------
create table if not exists public.hg_learning_circles (
  id            uuid primary key default gen_random_uuid(),
  created_by    uuid not null references auth.users (id) on delete cascade,
  title         text not null,
  context_type  text,
  context_id    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  -- Nullable, but when present it must be one of the allowed context types.
  constraint hg_learning_circles_context_type_check
    check (
      context_type is null
      or context_type in ('place', 'quiz', 'route', 'observation', 'topic', 'circle')
    )
);

comment on table public.hg_learning_circles is
  'Small learning circles (læringssirkler). Optionally bound to a History Go context. No feed, no public discovery.';

create trigger set_hg_learning_circles_updated_at
  before update on public.hg_learning_circles
  for each row execute function public.set_updated_at();

create index if not exists hg_learning_circles_created_by_idx
  on public.hg_learning_circles (created_by);
create index if not exists hg_learning_circles_context_idx
  on public.hg_learning_circles (context_type, context_id);

-- ---------------------------------------------------------------------------
-- 4. hg_learning_circle_members — membership in learning circles
-- ---------------------------------------------------------------------------
create table if not exists public.hg_learning_circle_members (
  circle_id  uuid not null references public.hg_learning_circles (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null default 'member',
  created_at timestamptz not null default now(),

  primary key (circle_id, user_id),
  constraint hg_learning_circle_members_role_check
    check (role in ('owner', 'member'))
);

comment on table public.hg_learning_circle_members is
  'Explicit membership in a learning circle. role is owner or member.';

-- ---------------------------------------------------------------------------
-- 5. hg_social_activity — read-only per-user history / log
-- ---------------------------------------------------------------------------
create table if not exists public.hg_social_activity (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  activity_type text not null,
  invite_id     uuid references public.hg_spotmeeting_invites (id) on delete set null,
  circle_id     uuid references public.hg_learning_circles (id) on delete set null,
  context_type  text,
  context_id    text,
  created_at    timestamptz not null default now(),

  constraint hg_social_activity_activity_type_check
    check (activity_type in (
      'invite_created',
      'invite_accepted',
      'invite_declined',
      'invite_cancelled',
      'invite_completed',
      'circle_created',
      'circle_joined',
      'circle_left'
    ))
);

comment on table public.hg_social_activity is
  'Read-only per-user social history/log. Clients may read own rows; no client update/delete.';

create index if not exists hg_social_activity_user_created_idx
  on public.hg_social_activity (user_id, created_at desc);

-- ===========================================================================
-- Row Level Security
-- ===========================================================================
alter table public.hg_profiles                enable row level security;
alter table public.hg_spotmeeting_invites     enable row level security;
alter table public.hg_learning_circles        enable row level security;
alter table public.hg_learning_circle_members enable row level security;
alter table public.hg_social_activity         enable row level security;

-- ---------------------------------------------------------------------------
-- RLS: hg_profiles
--   A user may read, create and update ONLY their own profile row.
-- ---------------------------------------------------------------------------
create policy hg_profiles_select_own
  on public.hg_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy hg_profiles_insert_own
  on public.hg_profiles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy hg_profiles_update_own
  on public.hg_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- RLS: hg_spotmeeting_invites
--   Read: either participant.
--   Insert: only as the creator (created_by = auth.uid()).
--   Update: either participant (state-machine rules enforced by the adapter,
--           see the lifecycle note above — the DB only guarantees that a
--           non-participant cannot touch the row).
--   No DELETE policy: invites are not client-deletable.
-- ---------------------------------------------------------------------------
create policy hg_spotmeeting_invites_select_participant
  on public.hg_spotmeeting_invites
  for select
  to authenticated
  using (created_by = auth.uid() or target_user_id = auth.uid());

create policy hg_spotmeeting_invites_insert_creator
  on public.hg_spotmeeting_invites
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy hg_spotmeeting_invites_update_participant
  on public.hg_spotmeeting_invites
  for update
  to authenticated
  using (created_by = auth.uid() or target_user_id = auth.uid())
  with check (created_by = auth.uid() or target_user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS: hg_learning_circles
--   Read: creator, or any member of the circle.
--   Insert: only as the creator.
--   Update: creator only.
--   No DELETE policy in this first cut.
-- ---------------------------------------------------------------------------
create policy hg_learning_circles_select_creator_or_member
  on public.hg_learning_circles
  for select
  to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.hg_learning_circle_members m
      where m.circle_id = hg_learning_circles.id
        and m.user_id = auth.uid()
    )
  );

create policy hg_learning_circles_insert_creator
  on public.hg_learning_circles
  for insert
  to authenticated
  with check (created_by = auth.uid());

create policy hg_learning_circles_update_creator
  on public.hg_learning_circles
  for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS: hg_learning_circle_members
--   Read: own membership rows, or any membership row of a circle you own.
--   Insert: the circle owner may add members; a user may add themselves as a
--           plain 'member' (self-join). Owners are seeded by the circle creator.
--   Delete: a user may remove their own membership (leave); the circle owner
--           may remove members of their circle.
--   No UPDATE policy (role changes are an owner/admin concern for later).
--
--   Helper predicate: "is auth.uid() the owner (created_by) of circle_id?"
--   expressed inline as an EXISTS against hg_learning_circles.
-- ---------------------------------------------------------------------------
create policy hg_learning_circle_members_select_self_or_owner
  on public.hg_learning_circle_members
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.hg_learning_circles c
      where c.id = hg_learning_circle_members.circle_id
        and c.created_by = auth.uid()
    )
  );

create policy hg_learning_circle_members_insert_self_or_owner
  on public.hg_learning_circle_members
  for insert
  to authenticated
  with check (
    -- self-join as a plain member
    (user_id = auth.uid() and role = 'member')
    -- or the circle owner adds someone
    or exists (
      select 1
      from public.hg_learning_circles c
      where c.id = hg_learning_circle_members.circle_id
        and c.created_by = auth.uid()
    )
  );

create policy hg_learning_circle_members_delete_self_or_owner
  on public.hg_learning_circle_members
  for delete
  to authenticated
  using (
    -- leave the circle yourself
    user_id = auth.uid()
    -- or the circle owner removes a member
    or exists (
      select 1
      from public.hg_learning_circles c
      where c.id = hg_learning_circle_members.circle_id
        and c.created_by = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS: hg_social_activity
--   Read: own activity rows only.
--   Insert: allowed only for own rows (user_id = auth.uid()). This is the
--           simplest safe option and keeps the log client-writable for own
--           events. A later server/edge function may take over inserts if we
--           want the log to be fully server-authoritative.
--   No UPDATE and no DELETE policy: history is read-only from the client.
-- ---------------------------------------------------------------------------
create policy hg_social_activity_select_own
  on public.hg_social_activity
  for select
  to authenticated
  using (user_id = auth.uid());

create policy hg_social_activity_insert_own
  on public.hg_social_activity
  for insert
  to authenticated
  with check (user_id = auth.uid());
