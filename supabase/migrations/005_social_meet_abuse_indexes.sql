-- 005_social_meet_abuse_indexes.sql
-- History Go — query support for server-side Social Meet abuse controls.
--
-- No parallel rate-limit source of truth is introduced here. Invite creation
-- counts, duplicate detection and cooldown evidence are derived from the existing
-- canonical invite/report/profile tables. These indexes keep those server-side
-- checks efficient before durable Spotmeeting invite creation is enabled.

create index if not exists hg_spotmeeting_invites_sender_created_idx
  on public.hg_spotmeeting_invites (created_by, created_at desc);

create index if not exists hg_spotmeeting_invites_recipient_created_idx
  on public.hg_spotmeeting_invites (target_user_id, created_at desc);

create index if not exists hg_spotmeeting_invites_pair_created_idx
  on public.hg_spotmeeting_invites (created_by, target_user_id, created_at desc);

create index if not exists hg_spotmeeting_invites_pair_updated_idx
  on public.hg_spotmeeting_invites (created_by, target_user_id, updated_at desc);

create index if not exists hg_spotmeeting_invites_active_duplicate_idx
  on public.hg_spotmeeting_invites (
    created_by,
    target_user_id,
    context_type,
    context_id,
    status
  )
  where status in ('pending', 'accepted');

create index if not exists hg_social_meet_reports_pair_created_idx
  on public.hg_social_meet_reports (
    reporter_profile_id,
    reported_profile_id,
    created_at desc
  );

create index if not exists hg_social_meet_reports_reported_open_idx
  on public.hg_social_meet_reports (reported_profile_id, status, created_at desc)
  where status in ('submitted', 'queued', 'under_review');
