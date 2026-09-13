-- 011_social_meet_backend_role.sql
-- Least-privilege direct PostgreSQL role for the History GO FastAPI Social Meet boundary.
--
-- The migration creates the role as NOLOGIN. Production LOGIN/password is operational state:
-- it is activated only when the credential can be written directly to the deployment secret
-- store. The role is NOT SUPERUSER and does NOT use BYPASSRLS. Instead, explicit role-scoped
-- RLS policies below give the authoritative FastAPI boundary access only to Social Meet state.

do $$
begin
  if not exists (
    select 1
    from pg_roles
    where rolname = 'history_go_backend'
  ) then
    create role history_go_backend
      nologin
      noinherit;
  end if;
end;
$$;

do $$
begin
  execute format(
    'grant connect on database %I to history_go_backend',
    current_database()
  );
end;
$$;

grant usage on schema public to history_go_backend;

grant select, insert, update on table
  public.hg_profiles
to history_go_backend;

grant select, insert, update, delete on table
  public.hg_social_meet_appeals,
  public.hg_social_meet_blocks,
  public.hg_social_meet_moderation_queue,
  public.hg_social_meet_profile_restrictions,
  public.hg_social_meet_reports,
  public.hg_social_meet_retention_holds,
  public.hg_spotmeeting_invites
to history_go_backend;

grant select, insert, update on table
  public.hg_social_meet_retention_runs
to history_go_backend;

grant select, insert, delete on table
  public.hg_social_meet_safety_audit
to history_go_backend;

grant select on table
  public.hg_social_meet_feature_flags
to history_go_backend;

grant usage, select on sequence
  public.hg_spotmeeting_invite_sync_seq
to history_go_backend;

-- Direct browser roles retain their existing participant policies. These policies apply only
-- when the dedicated server login is the database session role.
drop policy if exists hg_profiles_fastapi_server on public.hg_profiles;
create policy hg_profiles_fastapi_server
  on public.hg_profiles
  for all
  to history_go_backend
  using (true)
  with check (true);

drop policy if exists hg_social_meet_appeals_fastapi_server on public.hg_social_meet_appeals;
create policy hg_social_meet_appeals_fastapi_server
  on public.hg_social_meet_appeals
  for all
  to history_go_backend
  using (true)
  with check (true);

drop policy if exists hg_social_meet_blocks_fastapi_server on public.hg_social_meet_blocks;
create policy hg_social_meet_blocks_fastapi_server
  on public.hg_social_meet_blocks
  for all
  to history_go_backend
  using (true)
  with check (true);

drop policy if exists hg_social_meet_moderation_queue_fastapi_server
  on public.hg_social_meet_moderation_queue;
create policy hg_social_meet_moderation_queue_fastapi_server
  on public.hg_social_meet_moderation_queue
  for all
  to history_go_backend
  using (true)
  with check (true);

drop policy if exists hg_social_meet_profile_restrictions_fastapi_server
  on public.hg_social_meet_profile_restrictions;
create policy hg_social_meet_profile_restrictions_fastapi_server
  on public.hg_social_meet_profile_restrictions
  for all
  to history_go_backend
  using (true)
  with check (true);

drop policy if exists hg_social_meet_reports_fastapi_server on public.hg_social_meet_reports;
create policy hg_social_meet_reports_fastapi_server
  on public.hg_social_meet_reports
  for all
  to history_go_backend
  using (true)
  with check (true);

drop policy if exists hg_social_meet_retention_holds_fastapi_server
  on public.hg_social_meet_retention_holds;
create policy hg_social_meet_retention_holds_fastapi_server
  on public.hg_social_meet_retention_holds
  for all
  to history_go_backend
  using (true)
  with check (true);

drop policy if exists hg_social_meet_retention_runs_fastapi_server
  on public.hg_social_meet_retention_runs;
create policy hg_social_meet_retention_runs_fastapi_server
  on public.hg_social_meet_retention_runs
  for all
  to history_go_backend
  using (true)
  with check (true);

drop policy if exists hg_social_meet_safety_audit_fastapi_server
  on public.hg_social_meet_safety_audit;
create policy hg_social_meet_safety_audit_fastapi_server
  on public.hg_social_meet_safety_audit
  for all
  to history_go_backend
  using (true)
  with check (true);

drop policy if exists hg_spotmeeting_invites_fastapi_server
  on public.hg_spotmeeting_invites;
create policy hg_spotmeeting_invites_fastapi_server
  on public.hg_spotmeeting_invites
  for all
  to history_go_backend
  using (true)
  with check (true);

drop policy if exists hg_social_meet_feature_flags_fastapi_server
  on public.hg_social_meet_feature_flags;
create policy hg_social_meet_feature_flags_fastapi_server
  on public.hg_social_meet_feature_flags
  for select
  to history_go_backend
  using (true);

comment on role history_go_backend is
  'NOLOGIN least-privilege FastAPI server role. LOGIN/password is deployment-secret state; browser clients never use this role.';
