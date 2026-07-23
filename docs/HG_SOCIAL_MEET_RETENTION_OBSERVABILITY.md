# Social Meet retention and privacy-safe observability

Status: implemented server-owned operations slice. Production cleanup apply remains fail-closed until explicitly enabled.

## Scope

This slice adds operational retention and service-health visibility for the existing Social Meet domain without creating a second social-history model and without collecting participant tracking data.

It reuses the canonical tables introduced by migrations 001–007 and adds only two private operations tables:

- `hg_social_meet_retention_holds`: structured legal/safety/incident holds for specific existing records;
- `hg_social_meet_retention_runs`: aggregate cleanup-run audit records containing policy snapshots and counts only.

There is no GPS, live location, nearby state, distance, presence, last-seen, follower graph, popularity score, public visit history, free chat or raw device/IP tracking in this operations slice.

## Retention policy v1

The code-level policy identifier is:

```text
social_meet_retention_v1
```

Default operational windows are configurable through validated `HG_BACKEND_*` settings:

| State | Default |
| --- | ---: |
| terminal Spotmeeting invites | 180 days |
| removed/inactive blocks | 180 days |
| closed reports | 730 days |
| closed moderation queue items | 730 days |
| lifted/superseded restrictions | 730 days |
| decided/closed appeals | 365 days |
| safety audit events | 1095 days |
| released retention holds | 365 days |

These defaults are operational inputs, not a legal conclusion. The deployed policy must be reviewed for the actual jurisdiction and product use before production apply is enabled.

## Cleanup safety rules

Retention candidates are terminal or inactive records older than their configured cutoff. Cleanup is suppressed when a relevant active hold exists.

Cross-record safeguards preserve required safety/moderation context:

- an invite is retained while a related report is unresolved, recent or held;
- a report is retained while its moderation queue item is unresolved, recent or held;
- a moderation queue item is retained while the related report is held;
- a restriction is retained while an appeal is open or held;
- safety audit records are retained while they or their related report, queue item, restriction or appeal are held.

Destructive cleanup runs in one database transaction. Child records with restrictive foreign keys are deleted before their parents; audit references use existing `ON DELETE SET NULL` constraints.

Participant profile tombstones are intentionally not physically deleted by this slice. Learning circles and legacy `hg_social_activity` remain transitional domains and are outside this retention policy until a separate server-authoritative decision is made.

## Retention holds

Admin-only structured holds support these entity types:

- invite;
- block;
- report;
- moderation queue item;
- restriction;
- appeal;
- safety audit event.

Allowed reason codes are:

- `legal_hold`;
- `safety_review`;
- `appeal_review`;
- `incident_review`;
- `manual_policy`.

A hold can be indefinite or have `hold_until`. An expired timed hold no longer suppresses cleanup. Hold records remain private operational data and are never participant-facing.

## Admin operations API

All routes require the verified `history_go_admin` role from server-controlled Supabase `app_metadata.history_go_roles`.

```text
GET  /api/v1/social-meet/operations/metrics
GET  /api/v1/social-meet/operations/retention/preview
POST /api/v1/social-meet/operations/retention/run
GET  /api/v1/social-meet/operations/retention/holds
POST /api/v1/social-meet/operations/retention/holds
POST /api/v1/social-meet/operations/retention/holds/{holdId}/release
```

`retention/preview` is read-only and returns only aggregate candidate counts plus the number of currently effective holds.

`retention/run` requires the caller to submit the exact current policy version. Production apply additionally requires:

```text
HG_BACKEND_SOCIAL_MEET_RETENTION_APPLY_ENABLED=true
```

The default is `false`. Non-production environments may run the operation without this production kill switch so the policy can be exercised in controlled test/staging environments.

The endpoint is suitable as the authenticated execution boundary for a scheduler or operator workflow. This slice does not add an application-process cron loop; scheduling belongs to deployment operations so duplicate in-process schedulers are not created across replicas.

## Operational metrics privacy boundary

The metrics endpoint returns aggregate counts only:

- profile visibility states;
- invite lifecycle states;
- report states;
- moderation queue states;
- active block count;
- active restriction count;
- open appeal count;
- effective retention-hold count;
- aggregate current retention-candidate counts;
- aggregate summary of the last retention run.

It does not return participant IDs, user IDs, participant pairs, contexts, locations, timestamps that describe individual participant activity, presence, movement, popularity or social-graph edges.

Retention-run audit rows similarly store policy snapshots and aggregate candidate/deleted counts only. They must never be expanded into per-participant operational telemetry.

## Migration and configuration

Migration:

```text
supabase/migrations/008_social_meet_retention_observability.sql
```

Configuration:

```text
HG_BACKEND_SOCIAL_MEET_RETENTION_APPLY_ENABLED=false
HG_BACKEND_SOCIAL_MEET_RETENTION_TERMINAL_INVITE_DAYS=180
HG_BACKEND_SOCIAL_MEET_RETENTION_REMOVED_BLOCK_DAYS=180
HG_BACKEND_SOCIAL_MEET_RETENTION_CLOSED_REPORT_DAYS=730
HG_BACKEND_SOCIAL_MEET_RETENTION_CLOSED_MODERATION_DAYS=730
HG_BACKEND_SOCIAL_MEET_RETENTION_INACTIVE_RESTRICTION_DAYS=730
HG_BACKEND_SOCIAL_MEET_RETENTION_CLOSED_APPEAL_DAYS=365
HG_BACKEND_SOCIAL_MEET_RETENTION_SAFETY_AUDIT_DAYS=1095
HG_BACKEND_SOCIAL_MEET_RETENTION_RELEASED_HOLD_DAYS=365
```

## Rollout procedure

Before production apply is enabled:

1. apply migrations through 008 in the target environment;
2. confirm admin authentication and database service credentials;
3. review the configured retention windows for the actual jurisdiction and incident-response policy;
4. run `retention/preview` and record aggregate candidate counts;
5. create holds for any records under active legal, safety, appeal or incident review;
6. rehearse the production kill switch and rollback procedure;
7. enable `HG_BACKEND_SOCIAL_MEET_RETENTION_APPLY_ENABLED` only for the controlled maintenance window or approved scheduled runner;
8. run retention with exact policy-version confirmation;
9. verify the aggregate retention-run result and operational metrics;
10. disable apply again if continuous scheduled execution has not been explicitly approved.

Production discovery and invite-write rollout remain separately controlled by their existing kill switches and private discovery rollout gate. Retention enablement does not implicitly enable participant-facing Social Meet features.
