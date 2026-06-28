# HG Spotmeeting v1 manual/demo playtest

Date: 2026-06-28
Branch: work
Scope: HG Spotmeeting only. Civication was not inspected or changed.
Mode: TEST_MODE (`HG_TEST_MODE=1`) for demo verification.

## Setup notes

- Pull latest main: attempted `git fetch origin main && git merge origin/main --ff-only`, but this checkout has no `origin` remote configured, so the pull could not be completed in this environment.
- TEST_MODE: verified by code path and test harness using `HG_TEST_MODE=1` in localStorage.
- No data manifests were changed.
- No backend calls were added or required.

## Files inspected

- `js/social/HGSpotmeeting.js`
- `js/ui/place-card.js`
- `profile.html`
- `js/debug/HGRuntimeHealth.js`
- `js/debug/HGRuntimeSmokeRunner.js`
- `docs/HG_SPOTMEETING.md`

## Manual/demo flow verification

| Check | Result | Notes |
| --- | --- | --- |
| Open a PlaceCard | Pass by static/manual flow audit | PlaceCard appends the Spotmeeting section to the people/social area. |
| “Kunnskapsmøte” section appears | Pass | `renderHGSpotmeetingPlaceCardSection()` renders `<h3>Kunnskapsmøte</h3>`. |
| Copy says meeting is knowledge/shared-activity based, not location | Pass | PlaceCard says “Møt folk gjennom det dere har lært — ikke hvor dere er.” Profile says meetings are based on learning, routes, observations, and topics, not position. |
| Try “Finn match” | Pass | Button exists and invokes `getSpotmeetingSuggestions()` for the PlaceCard context. |
| Try “Foreslå quiz” | Partial/demo pass | Button exists and triggers the same demo suggestion path. It does not yet create/send a quiz invite from the UI. |
| Try “Foreslå rute” | Partial/demo pass | Button exists and triggers the same demo suggestion path. It does not yet create/send a route invite from the UI. |
| Try “Foreslå observasjon” | Partial/demo pass | Button exists and triggers the same demo suggestion path. It does not yet create/send an observation invite from the UI. |
| Only preset messages are available | Pass | Spotmeeting config exposes five preset messages and invite creation rejects unknown/free-form message text. |
| Free text impossible/rejected | Pass | `createSpotmeetingInvite(..., 'Vil du møtes?')` is rejected as `invalid_preset_message` in tests. No free text input was found on the Spotmeeting surface. |
| No GPS/live/nearby/distance/lastSeen/followers/feed/chat wording in Spotmeeting payloads | Pass | Runtime tests scan Spotmeeting config/state/inbox/timeline JSON for forbidden privacy keys. |
| Accepted/pending/completed spotmeetings appear in profile inbox | Pass | Profile inbox renders pending, accepted, completed counts from `getSpotmeetingInbox()`. |
| Block/report/cancel state respected where implemented | Pass with limitation | Blocked/reported users are rejected by `canCreateSpotmeetingInvite()`. Cancel API exists. Report creation UI was not found in this flow. |

## What worked

- Spotmeeting is present as a PlaceCard section labelled “Kunnskapsmøte”.
- The primary copy clearly frames the product as knowledge-based rather than location-based.
- TEST_MODE suggestion discovery works with local demo candidates.
- The core API supports pending, accepted, completed, declined, and cancelled states.
- Duplicate completion is idempotent and does not add trust.
- Profile inbox summarizes pending, accepted, and completed Spotmeetings.
- The privacy model is explicit in documentation and enforced by runtime tests.

## Blockers

- No product-flow blocker for demo playability was found.
- Environment blocker: latest `main` could not be pulled because no Git remote is configured in this checkout.

## Warnings

- The PlaceCard buttons “Foreslå quiz”, “Foreslå rute”, and “Foreslå observasjon” currently behave like demo suggestion/status actions. They do not visibly select or send their corresponding preset invite in the UI.
- The runtime health file contains generic map/runtime references to nearby places as part of broader app diagnostics. Spotmeeting-specific storage/config/timeline tests did not expose forbidden Spotmeeting fields.
- Block/report is enforced through stored state checks, but a dedicated Spotmeeting report UI was not observed in the PlaceCard demo flow.

## Confusing UI copy

- “Foreslå quiz/rute/observasjon” implies that clicking will create or choose that exact preset invite. In the current PlaceCard demo flow it only displays match/suggestion feedback.
- “Finn match” works as a safe demo action, but the follow-up path to choose a preset and create an invite is not visible from the PlaceCard UI.

## Missing actions

- Visible preset chooser/send-invite action from PlaceCard.
- Visible cancel action in the profile inbox.
- Visible report/block action in the Spotmeeting-specific UI, even though block/report state is respected by the API.

## Privacy checks

Result: Pass.

- Spotmeeting contexts are sanitized and reject forbidden privacy fields such as GPS coordinates, live location, nearby/distance, last seen, followers/feed, chat, free text, public visit history, and visited places.
- Production mode returns `backend_not_enabled` for discovery rather than using an unreviewed backend.
- TEST_MODE uses local demo candidates and does not insert demo users into global `PEOPLE`.
- Invites store context, preset message ID/label, status, manual/private flags, and demo flag only.
- Free text is rejected because invite creation accepts only known preset message IDs.

## Demo-playable verdict

HG Spotmeeting v1 is demo-playable in TEST_MODE as a privacy-safe concept flow: users can see the PlaceCard entry point, request demo matches, verify preset-only invite creation through the API, and see inbox counts for pending/accepted/completed states.

It is not yet a complete end-to-end clickable invite-sending UI from PlaceCard because the visible “Foreslå …” buttons currently stop at suggestion/toast feedback instead of selecting/sending presets.

## Next recommended fix

Add a minimal TEST_MODE-only PlaceCard preset chooser/send step that maps the existing buttons to the existing preset IDs and calls `createSpotmeetingInvite()` for a selected demo candidate, while keeping the current privacy contract: no free text, no GPS/live/nearby/distance/lastSeen/followers/feed/chat, no backend calls, and no data manifest changes.
