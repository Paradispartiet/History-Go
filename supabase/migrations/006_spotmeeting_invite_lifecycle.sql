-- 006_spotmeeting_invite_lifecycle.sql
-- History Go — server-authoritative Spotmeeting invite lifecycle.
--
-- Evolves the existing hg_spotmeeting_invites table. No parallel invite model is
-- introduced. FastAPI becomes the authoritative mutation boundary; participant
-- SELECT access may remain transitional while the frontend moves to the API.

create sequence if not exists public.hg_spotmeeting_invite_sync_seq;

alter table public.hg_spotmeeting_invites
  add column if not exists context_reason text,
  add column if not exists idempotency_key text,
  add column if not exists expires_at timestamptz,
  add column if not exists sync_version bigint;

update public.hg_spotmeeting_invites
set expires_at = created_at + interval '14 days'
where expires_at is null;

update public.hg_spotmeeting_invites
set sync_version = nextval('public.hg_spotmeeting_invite_sync_seq')
where sync_version is null;

alter table public.hg_spotmeeting_invites
  alter column expires_at set default (now() + interval '14 days'),
  alter column expires_at set not null,
  alter column sync_version set default nextval('public.hg_spotmeeting_invite_sync_seq'),
  alter column sync_version set not null;

alter table public.hg_spotmeeting_invites
  drop constraint if exists hg_spotmeeting_invites_status_check;

alter table public.hg_spotmeeting_invites
  add constraint hg_spotmeeting_invites_status_check
  check (status in (
    'pending',
    'accepted',
    'declined',
    'cancelled',
    'completed',
    'expired',
    'reported',
    'blocked'
  ));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'hg_spotmeeting_invites_preset_check'
      and conrelid = 'public.hg_spotmeeting_invites'::regclass
  ) then
    alter table public.hg_spotmeeting_invites
      add constraint hg_spotmeeting_invites_preset_check
      check (preset_message_id in (
        'quiz_together',
        'route_one_day',
        'compare_place_learning',
        'shared_observation',
        'meet_topic'
      ));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'hg_spotmeeting_invites_server_fields_length_check'
      and conrelid = 'public.hg_spotmeeting_invites'::regclass
  ) then
    alter table public.hg_spotmeeting_invites
      add constraint hg_spotmeeting_invites_server_fields_length_check
      check (
        char_length(context_id) between 1 and 180
        and (context_title is null or char_length(context_title) <= 240)
        and (context_reason is null or char_length(context_reason) <= 240)
        and (source_surface is null or char_length(source_surface) <= 80)
        and (
          idempotency_key is null
          or char_length(idempotency_key) between 8 and 120
        )
      );
  end if;
end;
$$;

create or replace function public.bump_hg_spotmeeting_invite_sync_version()
returns trigger
language plpgsql
as $$
begin
  new.sync_version = nextval('public.hg_spotmeeting_invite_sync_seq');
  return new;
end;
$$;

create trigger bump_hg_spotmeeting_invite_sync_version
  before update on public.hg_spotmeeting_invites
  for each row execute function public.bump_hg_spotmeeting_invite_sync_version();

create unique index if not exists hg_spotmeeting_invites_idempotency_uidx
  on public.hg_spotmeeting_invites (created_by, idempotency_key)
  where idempotency_key is not null;

-- Migration 005 introduced this as a read-performance index. It now becomes the
-- authoritative concurrent duplicate guard for active pair/context invites.
drop index if exists public.hg_spotmeeting_invites_active_duplicate_idx;
create unique index hg_spotmeeting_invites_active_duplicate_idx
  on public.hg_spotmeeting_invites (
    created_by,
    target_user_id,
    context_type,
    context_id
  )
  where status in ('pending', 'accepted');

create index if not exists hg_spotmeeting_invites_sender_sync_idx
  on public.hg_spotmeeting_invites (created_by, sync_version);
create index if not exists hg_spotmeeting_invites_recipient_sync_idx
  on public.hg_spotmeeting_invites (target_user_id, sync_version);
create index if not exists hg_spotmeeting_invites_expiry_idx
  on public.hg_spotmeeting_invites (expires_at)
  where status in ('pending', 'accepted');

comment on column public.hg_spotmeeting_invites.idempotency_key is
  'Opaque client-generated create key scoped to the sender. Never use location, device or user-private data as this key.';
comment on column public.hg_spotmeeting_invites.sync_version is
  'Server-owned monotonic change cursor for participant-scoped incremental synchronization. Not presence or last-seen metadata.';
comment on column public.hg_spotmeeting_invites.expires_at is
  'Server lifecycle expiry timestamp for pending/accepted invite state. Not user availability or presence.';

-- The original migration allowed direct browser writes as transitional scaffolding.
-- Once FastAPI owns the invite state machine those writes must fail closed.
revoke insert, update, delete on table public.hg_spotmeeting_invites from authenticated;
