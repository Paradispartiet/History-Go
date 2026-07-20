# History GO Social Meet moderation backend

Status: **Implemented server slice. Production Spotmeeting discovery and invite delivery remain disabled.**

Canonical safety requirements remain defined by:

- `docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`

This document records the concrete FastAPI/PostgreSQL implementation boundary for moderation staff and participant appeals.

## Trusted staff authorization

Moderator access is never inferred from email addresses, public profiles, browser state or user-editable metadata.

The Supabase access token verifier reads History GO staff roles only from verified, server-controlled `app_metadata`:

```json
{
  "app_metadata": {
    "history_go_roles": ["history_go_moderator"]
  }
}
```

Supported roles:

- `history_go_moderator`
- `history_go_admin`

`history_go_admin` inherits moderator access.

The backend ignores `user_metadata` for staff authorization. Staff user IDs are private operational identifiers and must never appear in participant/public Social Meet responses.

## Authorization boundary

Moderator or admin:

```text
GET  /api/v1/social-meet/moderation/queue
GET  /api/v1/social-meet/moderation/queue/{queueItemId}
POST /api/v1/social-meet/moderation/queue/{queueItemId}/actions
POST /api/v1/social-meet/moderation/reports/{reportId}/resolve
POST /api/v1/social-meet/moderation/profiles/{profileId}/suspend
```

Admin only:

```text
POST /api/v1/social-meet/moderation/profiles/{profileId}/restore
POST /api/v1/social-meet/appeals/{appealId}/decision
```

Authenticated Social Meet participant:

```text
GET  /api/v1/social-meet/appeals
POST /api/v1/social-meet/appeals
```

A participant can only appeal a restriction attached to their own `profile_id`.

## Moderation persistence

`supabase/migrations/004_social_meet_moderation.sql` adds:

- `hg_social_meet_moderation_queue`
- `hg_social_meet_profile_restrictions`
- `hg_social_meet_appeals`
- `hg_social_meet_safety_audit`

All four tables are server-owned. Direct `anon` and `authenticated` access is revoked.

The moderation queue is reconciled from durable `hg_social_meet_reports` records. This means a previously submitted report can be recovered into the queue if an earlier queue fan-out failed; report durability does not depend on queue availability.

## Moderation decisions

All participant and staff payloads use stable allow-listed codes. This slice does not introduce moderator free-text notes in API contracts.

Queue actions:

- `claim`
- `release`
- `escalate`

Resolution codes:

- `no_policy_violation`
- `warning_or_guidance`
- `profile_suspended`
- `retained_for_safety`

A Social Meet suspension sets the public-profile visibility state to `blocked_or_suspended`. The shared server interaction gate rejects restricted profiles before later discovery/invite operations can proceed.

Restoring a suspension moves the profile to `paused`, not directly back to `discoverable`. The user must explicitly review and republish their profile before becoming discoverable again.

## Appeals

Appeals use structured reason codes only:

- `incorrect_decision`
- `new_context`
- `identity_issue`
- `other_policy_ground`

Appeal decisions are admin-only:

- `uphold`
- `modify`
- `reverse`

A modified or reversed full suspension is lifted and the profile returns to `paused`. Appeals never expose reporter identity or private moderation evidence to the appellant.

## Audit and privacy

The safety audit stores structured moderation decisions and relation IDs only. It must never contain:

- GPS or coordinates
- live location, nearby or distance-to-person
- last-seen, online or presence data
- public visit history or route traces
- follower/feed data
- free-chat content
- raw IP/device identifiers
- participant-visible moderator notes

## Remaining production gate

This slice does **not** enable production Social Meet discovery.

The remaining major prerequisites are:

1. abuse prevention, rate limits, duplicate suppression and cooldowns;
2. durable Spotmeeting invite lifecycle behind FastAPI using the existing invite table;
3. candidate discovery with stale-result revalidation and the server safety gate;
4. cross-device sync;
5. frontend migration away from direct client writes for migrated server-owned operations.
