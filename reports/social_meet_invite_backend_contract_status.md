# Social Meet invite backend contract status

Date: 2026-06-30  
Scope: Documentation/status only. No backend implementation, runtime behavior, Civication files, GPS/live-location features, nearby discovery, followers/feed, free chat, public visit history, or passive tracking were changed.

## What was added

Added `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md` to define the production Spotmeeting backend invite persistence and safety contract.

## Invite lifecycle summary

The contract requires durable, participant-scoped invite records with these states:

- `pending`
- `accepted`
- `declined`
- `cancelled`
- `completed`
- `expired`
- `reported`
- `blocked`

Allowed transitions are limited by actor and state. Recipients may accept or decline pending invites, senders may cancel pending invites, either participant may complete an accepted invite once, the server may expire stale invites, and either participant may report or block from retained participant-scoped records. Invalid transitions must fail without mutating state.

## Backend API sketch summary

The contract sketches backend endpoints for:

- listing server-owned preset messages;
- creating context-bound invites;
- reading participant inboxes;
- accepting, declining, cancelling, completing, reporting, and blocking;
- cross-device incremental sync;
- participant export;
- participant-side deletion or hiding where policy allows.

Invite creation must validate authenticated identity, published profiles, context shape, preset message ID, block/report state, duplicate suppression, and rate limits before fan-out to sender and recipient inbox projections.

## Forbidden fields and behaviors

The backend contract explicitly forbids storing, exposing, inferring, or returning:

- GPS coordinates
- live location
- nearby users
- distance-to-person
- last-seen, online, presence, or availability status
- followers/following and popularity counts
- public activity feed
- free chat or free-text invite messages
- public visit history, check-ins, recently visited places, or passive place trails
- passive tracking, background movement, sensor-derived proximity, or co-presence inference
- raw route history, raw observation history, raw quiz answers, or exact timestamped learning logs as public invite fields
- private account IDs, auth subjects, email, phone, IP addresses, device IDs, and moderation notes in participant/public APIs

## Required persistence and safety behavior

Production Spotmeeting backend persistence must provide:

- durable source-of-truth invite records;
- recipient delivery and sender/recipient inbox fan-out;
- cross-device sync and deterministic conflict handling;
- server-side block/report enforcement before suggestions, creation, delivery, and lifecycle actions;
- preset-message validation only, with no free-text invite payloads;
- rate limits, duplicate suppression, cooldowns, and abuse prevention;
- participant-scoped export, deletion, retention, and safe tombstone behavior;
- moderation hooks and report queues;
- audit logging for safety events without location tracking or presence reconstruction.

## Test expectations

The contract calls for automated tests covering authentication, profile visibility, context validation, forbidden field rejection at any nesting level, preset-only validation, inbox fan-out, cross-device sync, lifecycle transitions, idempotent completion, block/report enforcement, duplicate suppression, rate limits, export/deletion/retention behavior, moderation hooks, and audit logs that do not contain forbidden location, presence, social graph, feed, or free-chat data.

## Next backend prerequisite

The next prerequisite remains durable authenticated Social Meet identity plus explicit opt-in public profile publication. Production invite persistence should not be enabled until server-side identity, visibility, block/report enforcement, preset validation, retention/export/delete policy, and moderation hooks are implemented and verified.

## Checks run

- Attempted to pull latest `main`, but this repository has no configured `origin` remote in the current environment.
- Reviewed the existing Social Meet identity contract, Spotmeeting product status, Spotmeeting product documentation, Spotmeeting runtime module, profile Social Meet UI references, and browser smoke test coverage before adding the new contract.
