-- 011_social_meet_backend_role.sql
-- Canonical server-only PostgreSQL role for the History GO FastAPI Social Meet boundary.
--
-- The role is intentionally NOLOGIN in schema migration history. Production credentials
-- are activated separately and written directly to the deployment secret store.
-- BYPASSRLS is required because FastAPI is the authoritative multi-user policy boundary;
-- the role is still restricted to the explicit Social Meet tables below.

do $$
begin
  if not exists (
    select 1
    from pg_roles
    where rolname = 'history_go_backend'
  ) then
    create role history_go_backend
      nologin
      nosuperuser
      nocreatedb
      nocreaterole
      noinherit
      noreplication
      bypassrls;
  end if;
end;
$$;

alter role history_go_backend
  nologin
  nosuperuser
  nocreatedb
  nocreaterole
  noinherit
  noreplication
  bypassrls;

grant connect on database postgres to history_go_backend;
grant usage on schema public to history_go_backend;

grant select, insert, update, delete on table
  public.hg_profiles,
  public.hg_social_meet_appeals,
  public.hg_social_meet_blocks,
  public.hg_social_meet_moderation_queue,
  public.hg_social_meet_profile_restrictions,
  public.hg_social_meet_reports,
  public.hg_social_meet_retention_holds,
  public.hg_social_meet_retention_runs,
  public.hg_social_meet_safety_audit,
  public.hg_spotmeeting_invites
to history_go_backend;

grant select on table
  public.hg_social_meet_feature_flags
to history_go_backend;

grant usage, select on sequence
  public.hg_spotmeeting_invite_sync_seq
to history_go_backend;

comment on role history_go_backend is
  'NOLOGIN canonical FastAPI server role. Activate LOGIN/password only via deployment secret provisioning; never expose to browser clients.';
