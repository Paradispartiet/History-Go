# History GO Spotmeeting invite backend

Status: **Durable server-owned invite lifecycle implemented. Production candidate discovery remains disabled.**

Canonical requirements remain defined by:

- `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_ABUSE_CONTROLS.md`

This document records the concrete FastAPI/PostgreSQL implementation boundary for durable Spotmeeting invitations.

## Reused canonical data model

The implementation evolves the existing `public.hg_spotmeeting_invites` table. It does **not** create a second invite table or a parallel Social Meet identity model.

Migration:

- `supabase/migrations/006_spotmeeting_invites_server.sql`

The migration adds:

- `context_reason` for bounded product-owned context explanation;
- `expires_at` with a 14-day server default;
- monotonic per-record `version` for compare-and-swap transitions;
- global monotonic `sync_version` for participant incremental sync;
- creator-scoped `idempotency_key`;
- server lifecycle states `expired`, `reported` and `blocked` in addition to the existing states;
- unique active-invite protection for sender/recipient/context;
- unique creator/idempotency-key protection;
- sync and expiry indexes.

Direct authenticated browser insert/update/delete privileges are revoked for `hg_spotmeeting_invites`. Participant reads remain temporarily available during frontend migration, but FastAPI is the authoritative mutation boundary.

## Server-owned presets

The backend preserves the existing product preset IDs:

- `quiz_together`
- `route_one_day`
- `compare_place_learning`
- `shared_observation`
- `meet_topic`

No custom invite message, free chat or user-authored message body is accepted.

API:

```text
GET /api/v1/social-meet/spotmeeting/presets
```

## Invite creation

API:

```text
POST /api/v1/social-meet/spotmeeting/invites
```

The request uses:

- public `recipientProfileId`;
- one explicit History GO context;
- one server-owned preset ID;
- one opaque idempotency key.

Creation is protected in two layers.

### Preflight

The shared abuse-policy service checks:

- current sender/recipient publication and consent;
- shared block/moderation interaction policy;
- duplicate active invites;
- report/block/decline/cancellation cooldowns;
- sender, pair and recipient rolling rate limits.

### Authoritative transaction

Immediately before insert, the repository opens a serializable PostgreSQL transaction, locks sender/recipient profile rows in deterministic order, and revalidates:

- participant identity bindings;
- publication and current consent;
- active bidirectional blocks;
- the canonical abuse snapshot and duplicate policy.

Database unique indexes additionally prevent concurrent active duplicates and idempotency-key reuse.

Serialization failures return stable `conflict` semantics rather than silently bypassing safety policy.

## Idempotency

A repeated request with the same creator-scoped idempotency key and identical payload returns the existing invite.

Reusing the same key for a different recipient, context or preset returns `idempotency_conflict`.

This allows safe network retries without duplicate invitations.

## Lifecycle state machine

Participant lifecycle endpoints:

```text
POST /api/v1/social-meet/spotmeeting/invites/{inviteId}/accept
POST /api/v1/social-meet/spotmeeting/invites/{inviteId}/decline
POST /api/v1/social-meet/spotmeeting/invites/{inviteId}/cancel
POST /api/v1/social-meet/spotmeeting/invites/{inviteId}/complete
```

Rules:

- `pending -> accepted`: recipient only;
- `pending -> declined`: recipient only;
- `pending -> cancelled`: sender only;
- `accepted -> cancelled`: either participant;
- `accepted -> completed`: either participant;
- repeated completion is idempotent;
- expired invites reject ordinary lifecycle transitions;
- accept and complete re-run the shared interaction safety gate;
- invalid transitions return `invalid_invite_transition`;
- stale version/concurrent updates return `conflict`.

Each authoritative update increments both:

- per-record `version`;
- global `sync_version`.

## Expiry

Pending and accepted invites receive a server-owned expiry timestamp. Participant inbox/sync access and lifecycle actions first expire stale participant records.

Expiry timestamps are invite lifecycle metadata only. They must never be used as online status, availability, last-seen or presence.

## Inbox and cross-device sync

API:

```text
GET /api/v1/social-meet/spotmeeting/inbox?cursor=...
GET /api/v1/social-meet/spotmeeting/sync?cursor=...
```

The cursor is a monotonically increasing server change version, not a user activity timestamp.

Responses are participant-scoped and contain:

- public sender/recipient `profileId` values;
- sanitized context;
- preset ID;
- invite state;
- timestamps and expiry;
- per-record version and sync version;
- derived `actorCanAct` capabilities.

Raw Supabase auth IDs are never returned by the invite API.

## Privacy boundary

Raw request payloads are recursively scanned before domain validation. Forbidden fields include location/presence/tracking and open-message equivalents such as:

- GPS, latitude, longitude and coordinates;
- live location, nearby and distance-to-person;
- last-seen, online and presence;
- followers, following and feeds;
- chat, free text and custom message bodies;
- public visit history and check-ins;
- device IDs, IP addresses and private account identifiers.

The invite backend does not add a social feed, public graph, passive tracking or free messaging.

## Existing safety integration

The invite service reuses:

- Social Meet identity/public profiles;
- participant block/report controls;
- moderation restrictions;
- the shared interaction gate;
- the invite abuse-control preflight.

Invite-specific report/block projection can continue through the existing safety APIs while the frontend migration is completed. No duplicate report or block model is introduced here.

## Production enablement remains gated

This slice makes invitation persistence and lifecycle server-owned, but does not automatically enable production candidate discovery.

Remaining major work includes:

1. candidate discovery using explicit coarse knowledge-profile inputs;
2. stale-result revalidation against identity, block, moderation and abuse policy at invite creation time;
3. frontend migration from direct Supabase invite writes to the FastAPI adapter;
4. notification delivery, if introduced, using participant-safe payloads only;
5. retention/expiry jobs and rollout/kill-switch operations for production scale.

Until those gates are complete, local/demo candidate discovery remains the safe product mode.
