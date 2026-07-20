# History GO Social Meet abuse controls

Status: **Implemented server-side preflight policy. Production Spotmeeting invite creation and delivery remain disabled.**

Canonical product requirements remain defined by:

- `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_MODERATION_BACKEND.md`

This document records the concrete abuse-prevention boundary that the future server-owned Spotmeeting invite service must use.

## Design principle: reuse canonical state

The abuse layer does not create a parallel invite ledger, trust score, reputation system or user-risk profile.

Policy decisions are derived from the existing canonical sources:

- `hg_profiles` for Social Meet identity age and current publication state;
- `hg_spotmeeting_invites` for invite volume, duplicate detection, declines and cancellations;
- `hg_social_meet_blocks` for active interaction blocking and post-block cooldown evidence;
- `hg_social_meet_reports` for confidential report cooldowns and unresolved-report policy tiering;
- the existing Social Meet interaction safety gate for active blocks and moderation restrictions.

`supabase/migrations/005_social_meet_abuse_indexes.sql` adds query-support indexes only. It does not introduce a new abuse-state source of truth.

## Invite creation preflight

`SocialMeetInviteAbuseService.ensure_invite_creation_allowed(...)` is the reusable server-side guard for future Spotmeeting invite creation.

Before allowing an invite attempt it verifies:

1. the context type is one of the existing History GO invite context types;
2. sender and recipient are distinct;
3. both profiles are currently `discoverable` and have the current Social Meet consent version;
4. the existing interaction safety gate allows the pair;
5. no active invite already exists for the same sender, recipient and context;
6. no private report or recent block cooldown suppresses contact;
7. no recent decline or repeated-cancellation cooldown applies;
8. sender, pair and recipient rolling rate limits are below the applicable policy tier.

Production invite creation must not rely on a stale preflight result. The durable invite service must repeat the safety and abuse checks immediately before the authoritative insert and protect the duplicate check within the same transaction or equivalent serialization boundary.

## Rolling rate limits

Rate windows are rolling, not calendar-aligned. This prevents users from bypassing controls by sending immediately before and after a minute, hour or midnight boundary.

### Standard tier

- sender: 3 invite attempts per rolling minute;
- sender: 15 per rolling hour;
- sender: 40 per rolling 24 hours;
- same sender/recipient pair: 5 per rolling 24 hours;
- recipient global inbound cap: 80 per rolling 24 hours.

### Restricted tier

The restricted tier applies when:

- the sender entered Social Meet less than 7 days ago; or
- the sender has one or more unresolved reports in `submitted`, `queued` or `under_review` state.

Limits:

- sender: 1 invite attempt per rolling minute;
- sender: 5 per rolling hour;
- sender: 12 per rolling 24 hours;
- same sender/recipient pair: 2 per rolling 24 hours;
- recipient global inbound cap: 50 per rolling 24 hours.

These values are server policy constants and may be tuned through an explicit policy change. They must not become client-authoritative configuration.

## Duplicate suppression

A new invite is rejected with `duplicate_active_invite` when the same sender and recipient already have a `pending` or `accepted` invite for the same `contextType` and `contextId`.

The future invite persistence migration should add or strengthen a database-level uniqueness/serialization guarantee if needed so concurrent requests cannot both pass preflight and create duplicate active invites.

## Cooldowns

Current cooldown rules:

- decline: 24 hours for the same sender/recipient direction;
- report from recipient against sender: 7 days of contact suppression;
- block between the pair: 7 days after the latest block event/removal in addition to active-block enforcement;
- repeated cancellations: 3 sender-to-recipient cancellations inside 24 hours triggers rate limiting.

Private report and block cooldowns return the non-enumerating `recipient_unavailable` error. The sender must not be able to infer whether a recipient blocked or reported them.

Decline, repeated cancellation and volume limits return `rate_limited`.

## Stable failure codes

The preflight guard uses stable errors:

- `invalid_invite_context`
- `invalid_invite_target`
- `profile_not_published`
- `recipient_unavailable`
- `interaction_blocked`
- `duplicate_active_invite`
- `rate_limited`

The API layer for durable invites should preserve non-enumerating behavior and must not add details such as exact bucket counts, report presence, block direction or cooldown timestamps to participant responses.

## Privacy exclusions

The abuse layer does not use or store:

- GPS or coordinates;
- live location, nearby or distance-to-person;
- last-seen, online or presence data;
- public visit history or route traces;
- followers, feeds or popularity scores;
- free-chat content;
- public trust/reputation scores;
- raw IP/device identifiers in participant APIs.

Operational security controls may evolve separately when legally and technically justified, but they must remain private security infrastructure and must not leak into participant/public Social Meet responses.

## Production enablement gate

This abuse-policy slice does **not** enable production Spotmeeting invitations.

The next server-owned slice must move the existing `hg_spotmeeting_invites` lifecycle behind FastAPI and:

1. map participant-facing public `profileId` values to private auth-user bindings server-side;
2. validate server-owned preset message IDs and reject free text;
3. run identity, moderation, block and abuse checks transactionally before insert/delivery;
4. enforce the invite state machine server-side;
5. provide participant-scoped listing and cross-device synchronization;
6. revoke or supersede direct browser writes for server-owned invite operations;
7. preserve the existing privacy exclusions and production discovery gates.
