# Social Meet / Spotmeeting backend roadmap status

Date: 2026-07-01  
Scope: Documentation/status only. No backend implementation, runtime behavior, Civication files, GPS/live-location behavior, nearby discovery, followers/feed, public visit history, passive tracking, or free chat were added.

## What was added

Added `docs/HG_SOCIAL_MEET_BACKEND_ROADMAP.md` as a production backend implementation roadmap for Spotmeeting based on the existing identity, invite backend, and block/report/moderation contracts.

## Phase summary

- **Phase 0: keep demo-only disabled in production.** Preserve `backend_not_enabled` behavior, isolate demo candidates to test mode, add feature flags, and introduce forbidden-field checks before any production backend exposure.
- **Phase 1: identity + opt-in profile backend.** Build authenticated account binding, opaque public profile IDs, explicit publish/withdraw/delete states, and public read models that expose only approved opt-in fields.
- **Phase 2: invite persistence + inbox sync.** Add durable invite source-of-truth records, participant inbox projections, preset-only messages, context validation, lifecycle transitions, idempotency, expiration, export, and participant-side hide/delete behavior.
- **Phase 3: block/report enforcement.** Enforce blocks and structured reports before suggestions, invite creation, invite delivery, inbox rendering, accepting, completing, notifications, exports, and profile reads where policy requires suppression.
- **Phase 4: moderation/admin tooling.** Add role-gated report queues, moderation actions, private audit trails, privacy-safe dashboards, and retention jobs.
- **Phase 5: limited production discovery rollout.** Enable discovery only behind cohorts and kill switches, using opted-in eligible profiles and knowledge/context compatibility only.

## Production gate summary

Production Spotmeeting discovery must remain disabled until identity, opt-in profile publication, forbidden-field validation, invite durability, block/report enforcement, moderation tooling, rate limits, retention/privacy workflows, observability, staged rollout controls, and rollback rehearsals all pass.

## Database and API planning summary

The roadmap sketches source-of-truth and read-model storage for profiles, public profile projections, suppression, invites, invite events, participant inbox items, blocks, reports, moderation actions, rate limits, and audit events. It also lists profile, discovery, invite, safety, and moderator/admin endpoints needed for a production backend.

## Required test coverage summary

Each phase includes tests for production-disabled behavior, authentication, opt-in visibility, forbidden nested fields, preset-only invite messages, inbox fan-out, cross-device sync, lifecycle transitions, idempotent completion, block/report suppression, non-leaking failure codes, moderator authorization, retention/deletion/export behavior, kill switches, and ranking that excludes forbidden location, presence, social graph, feed, visit-history, passive-tracking, and free-chat inputs.

## Rollback and privacy summary

The roadmap requires remote feature flags, staged disable order, read-only inbox preservation where safe, block/report availability during most incidents, projection rebuilds from source-of-truth records, forward-compatible suppression/tombstones, and privacy reviews before each rollout expansion.

## What must remain forbidden forever

Spotmeeting must never add GPS, live location, nearby users, distance-to-person, last-seen or online status, followers/following, public activity feeds, public visit history, passive tracking, free chat, free-text invite messages, or public exposure of private account, device, operational, or moderation data.

## Next implementable backend task

Start with Phase 0 backend safety scaffolding: add feature flags, keep production discovery disabled, and add backend forbidden-field contract tests. Do not enable real discovery or invite writes until Phase 1 through Phase 4 gates are implemented and verified.
