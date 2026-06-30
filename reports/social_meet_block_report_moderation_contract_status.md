# Social Meet block/report and moderation contract status

Date: 2026-06-30  
Scope: Documentation/status only. No backend implementation, runtime behavior, Civication files, GPS/live-location features, nearby discovery, followers/feed, free chat, public visit history, or passive tracking were changed.

## What was added

Added `docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md` to define the required server-side block, report, moderation, appeal, audit, retention, deletion, export, abuse-prevention, and API contract for production Spotmeeting discovery.

## Block/report model summary

Blocks are private safety relationships between public Social Meet profile IDs. A block has an opaque `blockId`, blocker and blocked profile IDs, scope, optional related invite/context, lifecycle status, timestamps, and source surface. Blocking must prevent future suggestions and new invite delivery in both directions, must be enforced server-side, and must not become public profile data or a feed event.

Reports are private safety submissions with opaque `reportId`, private reporter profile ID, reported profile ID, optional invite/context, allow-listed reason code, bounded structured details, status, timestamps, and moderation evidence references. Reporting must not reveal reporter identity to the reported user and must never expose private account IDs, auth subjects, IP/device data, or moderator notes in participant/public APIs.

## Moderation and enforcement points

The contract requires enforcement:

- before candidate suggestions;
- before invite creation;
- before invite delivery;
- before inbox rendering;
- before accepting or completing an invite.

Moderation queue records must support triage, review, actions, private notes, appeal/review states, and structured action history without exposing reporter identity or collecting location/presence data.

## API sketch summary

The contract sketches endpoints for:

- listing, creating, and removing blocks;
- submitting and viewing the current user's submitted reports;
- moderator/admin queue review and actions;
- resolving reports;
- suspending/restoring profiles;
- appeal submission and appeal decisions.

Participant APIs must return only safe profile, block, report, invite, status, and timestamp data. Admin/moderator APIs may access private safety data only inside authorized boundaries.

## Forbidden fields and behaviors

The contract explicitly forbids adding, storing, exposing, inferring, ranking by, or returning:

- GPS coordinates
- live location
- nearby users
- distance-to-person
- last-seen, online, presence, or availability status
- followers/following and popularity counts
- public activity feed
- public visit history, check-ins, recently visited places, or passive place trails
- passive tracking, background movement, sensor-derived proximity, or co-presence inference
- free chat, free-text invite messages, open direct messaging, or custom messages visible to the reported user
- private account IDs, auth subjects, email, phone, IP addresses, device IDs, and moderator notes in participant/public APIs

## Required safety behavior

Production Spotmeeting discovery remains blocked until the backend provides:

- durable server-side block records;
- durable report records and moderation queue intake;
- confidential reporter handling;
- bidirectional suggestion and delivery suppression for blocks;
- invite lifecycle suppression for reports, restrictions, suspensions, and moderation actions;
- rate limits, duplicate suppression, cooldowns, and non-enumerating errors;
- retention, deletion, export, tombstone, and appeal/review policy;
- audit logging for safety decisions without tracking location, presence, public visit history, followers/feed, or free chat.

## Test expectations

The contract calls for automated tests covering bidirectional block enforcement, stale candidate revalidation, invite creation and delivery suppression, confidential report submission, moderation restrictions, inbox tombstones, rate limits/cooldowns, export/deletion/retention, appeal privacy, forbidden field rejection at any nesting level, and audit logs without forbidden location, presence, social graph, feed, visit-history, passive-tracking, or free-chat data.

## Next backend prerequisite

The next backend prerequisite is implementing and verifying durable authenticated Social Meet identity, explicit opt-in public profiles, server-side invite persistence, and the block/report/moderation safety layer together. Production Spotmeeting discovery must remain disabled until these contracts are implemented server-side and no-forbidden-field tests pass.

## Checks run

- Attempted `git pull origin main`, but the current repository has no configured `origin` remote in this environment.
- Reviewed the existing Social Meet identity contract, invite backend contract/status, Spotmeeting product status, Spotmeeting documentation, Spotmeeting runtime module, moderation/privacy bundles, and profile Social Meet UI references before adding the new documentation.

## Follow-up documentation links

Added cross-references from the Social Meet identity contract, invite backend contract, and Spotmeeting product documentation to the block/report/moderation contract so the production discovery gate points at all required server-side safety contracts.
