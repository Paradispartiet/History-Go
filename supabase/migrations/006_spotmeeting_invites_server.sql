-- 006_spotmeeting_invites_server.sql
-- History Go — server-owned durable Spotmeeting invite lifecycle.
--
-- Reuses public.hg_spotmeeting_invites. No parallel invite table is introduced.
-- Direct authenticated browser writes are revoked; FastAPI becomes authoritative
-- for creation and lifecycle transitions.

create sequence if not exists public.hg_spotmeeting_invite_sync_seq;

alter table public.hg_spotmeeting_invites
  add column if not exists context_reason text,
  add column if not exists expires_at timestamptz,
  add column if not exists version bigint not null default 1,
  add column if not exists sync_version bigint,
  add column if not exists idempotency_key text;

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

alter table public.hg_spotmeeting_invites
  drop constraint if exists hg_spotmeeting_invites_context_reason_length_check,
  add constraint hg_spotmeeting_invites_context_reason_length_check
    check (context_reason is null or char_length(context_reason) <= 240),
  drop constraint if exists hg_spotmeeting_invites_idempotency_key_length_check,
  add constraint hg_spotmeeting_invites_idempotency_key_length_check
    check (
      idempotency_key is null
      or (
        char_length(idempotency_key) between 8 and 180
        and idempotency_key = btrim(idempotency_key)
      )
    ),
  drop constraint if exists hg_spotmeeting_invites_version_positive_check,
  add constraint hg_spotmeeting_invites_version_positive_check
    check (version >= 1),
  drop constraint if exists hg_spotmeeting_invites_server_text_length_check,
  add constraint hg_spotmeeting_invites_server_text_length_check
    check (
      char_length(context_id) between 1 and 180
      and (context_title is null or char_length(context_title) <= 240)
      and (source_surface is null or char_length(source_surface) <= 80)
    );

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

comment on column public.hg_spotmeeting_invites.context_reason is
  'Sanitized product-owned explanation for the selected History Go context. Never free chat.';
comment on column public.hg_spotmeeting_invites.expires_at is
  'Server-owned invite expiry timestamp. Must never be interpreted as presence or availability.';
comment on column public.hg_spotmeeting_invites.version is
  'Monotonic per-record version incremented by authoritative lifecycle transitions.';
comment on column public.hg_spotmeeting_invites.sync_version is
  'Server-owned global monotonic change cursor for participant incremental sync. Not presence or last-seen metadata.';
comment on column public.hg_spotmeeting_invites.idempotency_key is
  'Opaque client-generated retry key scoped to the creator. Never contains user content.';

create or replace function public.bump_hg_spotmeeting_invite_versions()
returns trigger
language plpgsql
as $$
begin
  new.version = old.version + 1;
  new.sync_version = nextval('public.hg_spotmeeting_invite_sync_seq');
  return new;
end;
$$;

create trigger bump_hg_spotmeeting_invite_versions
  before update on public.hg_spotmeeting_invites
  for each row execute function public.bump_hg_spotmeeting_invite_versions();

-- Fail deployment rather than silently rewriting participant data if active
-- duplicates already exist. Resolve such rows explicitly before enabling the
-- authoritative uniqueness contract.
do $$
begin
  if exists (
    select 1
    from public.hg_spotmeeting_invites
    where status in ('pending', 'accepted')
    group by created_by, target_user_id, context_type, context_id
    having count(*) > 1
  ) then
    raise exception
      'Cannot enable server-owned Spotmeeting invites: duplicate active invite rows exist';
  end if;
end;
$$;

drop index if exists public.hg_spotmeeting_invites_active_duplicate_idx;
create unique index if not exists hg_spotmeeting_invites_active_context_uidx
  on public.hg_spotmeeting_invites (
    created_by,
    target_user_id,
    context_type,
    context_id
  )
  where status in ('pending', 'accepted');

create unique index if not exists hg_spotmeeting_invites_creator_idempotency_uidx
  on public.hg_spotmeeting_invites (created_by, idempotency_key)
  where idempotency_key is not null;

create index if not exists hg_spotmeeting_invites_creator_sync_idx
  on public.hg_spotmeeting_invites (created_by, sync_version);
create index if not exists hg_spotmeeting_invites_recipient_sync_idx
  on public.hg_spotmeeting_invites (target_user_id, sync_version);
create index if not exists hg_spotmeeting_invites_expiry_idx
  on public.hg_spotmeeting_invites (expires_at)
  where status in ('pending', 'accepted');

-- The original 001 migration deliberately allowed direct client writes while the
-- product was local/demo-first. Server-owned production invite operations now revoke
-- those mutation paths. Participant reads remain temporarily available for the
-- transitional browser adapter until the frontend switches to FastAPI.
drop policy if exists hg_spotmeeting_invites_insert_creator
  on public.hg_spotmeeting_invites;
drop policy if exists hg_spotmeeting_invites_update_participant
  on public.hg_spotmeeting_invites;

revoke insert, update, delete on table public.hg_spotmeeting_invites from authenticated;
grant select on table public.hg_spotmeeting_invites to authenticated;
