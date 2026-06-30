# Social Meet / Spotmeeting product status checkpoint

Date: 2026-06-30  
Scope: Documentation/status only. No runtime code, Civication files, backend behavior, features, or data manifests were changed.

## Current product state

Social Meet / Spotmeeting is currently a privacy-safe, knowledge-based meet-invite layer for History Go. It is designed around explicit player intent: a player starts from a History Go context, chooses a preset invite, and manages the invite from the Social Meet profile tab.

The product shape is defined, documented, and protected by smoke tests, but it is not a production social backend yet. The client-side Spotmeeting module exists and exposes the expected API, while real production discovery remains disabled until a privacy-reviewed backend is built.

## What the player can do now

In the current local/demo layer, a player can:

- Open Social Meet as its own top-level profile tab.
- See Spotmeeting inbox content inside the Social Meet tab.
- Start from a supported History Go context such as a place, quiz, route, observation, topic, or circle.
- In `HG_TEST_MODE`, view seeded demo candidates for a place-like context.
- Send a Spotmeeting invite using one of the allowed preset messages.
- See pending, accepted, completed, declined, and cancelled invites grouped in the inbox.
- Accept or decline a pending invite.
- Cancel an invite where supported.
- Mark an accepted invite completed once.
- See player-facing helper copy that explains Spotmeeting uses preset choices, not free text, and does not share position or live status.

## Demo-only limitations

The following behavior is demo-only or local-only:

- Candidate discovery only returns demo candidates in `HG_TEST_MODE`.
- Invite storage is local browser storage, not shared across devices or accounts.
- Demo candidates come from Social Demo data and must not be inserted into production `PEOPLE` or production profile/social storage.
- Production invite discovery returns `backend_not_enabled` until a real backend exists.
- Current invite lifecycle actions are suitable for smoke/demo behavior, not durable cross-user production coordination.
- There is no real authenticated current-user identity, durable recipient identity, delivery pipeline, moderation queue, retention policy, or server-side rate limiting yet.

## Privacy-safe by design

The current layer is intentionally privacy-limited:

- Spotmeeting is manually initiated.
- Matching is knowledge/activity/context based, not live location based.
- Every invite is tied to an explicit context: place, quiz, route, observation, topic, or circle.
- Invite messages are preset-only.
- Invite metadata is private by default.
- The UI avoids free-chat inputs, social feeds, follower surfaces, nearby-user discovery, distance-to-person ranking, last-seen status, public visit history, passive tracking, GPS, and live-location behavior.
- Context payloads with forbidden privacy fields are rejected by the Spotmeeting module.
- Demo users are kept separate from global production people data.

## What is not built yet

The product still does not include:

- Real user identity or account binding.
- Production profile visibility and opt-in profile publication.
- Backend invite persistence.
- Cross-device invite sync.
- Real recipient delivery, notifications, or inbox fan-out.
- Server-side accept, decline, cancel, complete, block, or report enforcement.
- Moderation review tooling or durable report queues.
- Rate limits, abuse throttles, or spam prevention enforced by a backend.
- Calendar/time-window proposal support.
- Mutual confirmed-meet records backed by server state.
- Retention/deletion workflows for invites and reports.
- Production analytics or observability for this layer.

## Required backend later

Before real production discovery is enabled, the backend should provide:

- Authenticated current-user identity and account binding.
- Explicit opt-in public profile/read model.
- Context-bound invite creation and lookup APIs.
- Preset message ID validation only; no free-text invite messages.
- Durable invite persistence and cross-device inbox sync.
- Accept, decline, cancel, complete, block, and report endpoints.
- Server-side block/report enforcement before suggestions or invite delivery.
- Rate limiting and abuse controls.
- Retention, deletion, export, and moderation policies.
- Audit/health checks confirming no GPS, live-location, nearby-user, follower/feed, public-visit-history, last-seen, or free-chat primitives are introduced.

## Tests and health checks currently protecting this layer

Current coverage documented for Social Meet / Spotmeeting includes:

- `node tests/hg-spotmeeting.test.js` for TEST_MODE suggestions, preset invite creation, and privacy-forbidden payload checks.
- `node tests/hg-spotmeeting-placecard-demo.test.js` for PlaceCard demo wiring and TEST_MODE gating.
- `npm run test:social-review` for broader social review coverage.
- `npm run test:social-meet-spotmeeting-smoke` for the Social Meet / Spotmeeting browser smoke flow.
- `node tests/hg-runtime-health.test.js` for runtime health validation.
- `node tests/hg-runtime-smoke-runner.test.js` for compact runtime smoke checkpoints.
- `tests/social-meet-spotmeeting-browser-smoke.test.js` verifies the Social Meet tab, privacy-only settings mount, PlaceCard demo invite creation, inbox grouping, action transitions, empty state copy, and forbidden UI absence.

## Recommended next 3 build steps

1. **Bind Social Meet to real identity and opt-in profiles.** Define authenticated current-user identity, account binding, public profile visibility settings, and editable knowledge-fingerprint inputs before exposing real people in discovery.
2. **Add backend invite persistence and safety enforcement.** Build context-bound invite APIs with preset-message validation, durable inbox sync, accept/decline/cancel/complete endpoints, block/report enforcement, rate limits, retention/deletion policy, and moderation review hooks.
3. **Polish safety UX before expanding coordination.** Improve block/report flows and recipient control first; then optionally add calendar/time-window proposal support. Keep the hard rule: no GPS, no live location, no nearby users, no public visit history, no followers/feed mechanics, and no free chat.

## Next recommended build step

The next best build step is **real user identity / account binding plus explicit opt-in profile visibility**, because backend invite persistence and moderation controls need stable, privacy-reviewed user identifiers before production Spotmeeting discovery can safely exist.
