-- 010_social_meet_function_search_path.sql
-- Harden canonical Social Meet trigger functions against search_path hijacking.
-- All referenced application objects are schema-qualified; pg_catalog is explicit.

alter function public.set_updated_at()
  set search_path = pg_catalog, public;

alter function public.enforce_hg_spotmeeting_safe_transition()
  set search_path = pg_catalog, public;

alter function public.bump_hg_spotmeeting_invite_versions()
  set search_path = pg_catalog, public;
