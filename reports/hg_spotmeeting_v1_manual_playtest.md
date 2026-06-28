# HG Spotmeeting v1 manual/demo playtest

Date: 2026-06-28
Branch: `work`
Scope: Spotmeeting only. Civication files and data manifests were not changed.

## Setup

- Attempted to pull latest `main`, but this checkout has no `origin` remote configured, so `git fetch origin main && git pull origin main` failed before contacting a repository.
- TEST_MODE was enabled in the manual/test harness by setting `HG_TEST_MODE=1` in localStorage.
- Inspected:
  - `js/social/HGSpotmeeting.js`
  - `js/ui/place-card.js`
  - `profile.html`
  - `js/debug/HGRuntimeHealth.js`
  - `js/debug/HGRuntimeSmokeRunner.js`
  - `docs/HG_SPOTMEETING.md`

## Manual/demo flow verification

### What worked

- PlaceCard includes a `Kunnskapsmøte` section for Spotmeeting.
- The PlaceCard copy explains that the meeting is based on learning/knowledge rather than current location: `Møt folk gjennom det dere har lært — ikke hvor dere er.`
- The PlaceCard exposes the expected demo actions:
  - `Finn match`
  - `Foreslå quiz`
  - `Foreslå rute`
  - `Foreslå observasjon`
- In TEST_MODE, `getSpotmeetingSuggestions()` can return demo candidates from HG Social demo data without inserting demo users into production `PEOPLE`.
- Production mode remains backend-disabled and returns the expected `backend_not_enabled` warning.
- Spotmeeting invites are manual, private, context-bound, and stored locally under `hg_spotmeeting_v1`.
- Preset messages are enforced by `presetMessageId`; free-text invite attempts return `invalid_preset_message`.
- Forbidden privacy fields in context, such as `latitude`, are rejected with `forbidden_privacy_field`.
- Accepted and completed invites are included in the profile inbox counts via `getSpotmeetingInbox()`.
- Cancel, accept, decline, and completed state transitions are implemented.
- Blocked/reported state prevents creating new invites for affected users where implemented.
- Completing an already-completed spotmeeting is idempotent and does not farm trust (`trustDelta: 0`).

### Blockers

- Latest `main` could not be pulled because no `origin` remote is configured in this checkout. This is an environment/repository setup blocker, not a Spotmeeting product-flow blocker.
- No browser automation environment was provided for a visual click-through screenshot, so the playtest was verified by source inspection and the requested runtime/unit tests.

### Warnings

- The PlaceCard buttons currently only request suggestions/show toast feedback. They do not complete a visible end-to-end invite-send UI from the PlaceCard itself. Programmatic invite creation works through `HG_Spotmeeting.createSpotmeetingInvite()`.
- Profile copy uses negative privacy wording that includes social terms such as followers/feed equivalents (`følgere`, `aktivitetsfeed`) to say they are not shown. If the requirement means those words must not appear anywhere in visible UI, this copy should be changed.
- `docs/HG_SPOTMEETING.md` intentionally mentions forbidden terms in privacy/non-goal documentation. This is appropriate for documentation, but it means a raw repository text scan will find those words.

### Confusing UI copy

- `Kunnskapsmøte` is clear, but the PlaceCard action result `Spotmeeting-forslag er klart i TEST_MODE` may be confusing because no visible list or send action appears after the toast.
- Profile inbox title says `HG Spotmeeting` while PlaceCard says `Kunnskapsmøte`; that is understandable, but a short bridge phrase could improve consistency.

### Missing actions

- No visible PlaceCard-level action to choose a candidate and send one of the preset messages was found in the inspected PlaceCard UI.
- No visible Profile-level action list of individual pending/accepted/completed invite cards was found; profile currently shows counts and privacy checklist.
- Explicit block/report controls were not found in the Spotmeeting-specific UI surfaces inspected, though blocked/reported state is respected by the underlying API.

### Privacy checks

- Spotmeeting config is private-by-default, manual-only, and preset-only.
- Forbidden fields checked/rejected include GPS/live-location/current-location style fields and social primitives such as followers/feed/chat/free text.
- TEST_MODE demo candidates remain demo-only/local and are separated from production `PEOPLE`.
- No backend calls were added or required.
- No GPS, live location, nearby-user discovery, distance ranking, followers, feed, or free chat feature was added.

### Demo-playable result

HG Spotmeeting v1 is demo-playable as a privacy-safe API/runtime flow in TEST_MODE and partially demo-playable in the PlaceCard UI. The core privacy contract and state lifecycle work, but the visible UI is closer to a demo stub than a complete manual invite flow because candidate selection and sending preset invites are not exposed directly in the PlaceCard.

### Next recommended fix

Add a small TEST_MODE-only PlaceCard demo panel that lists returned candidates and lets the user send exactly one preset message via existing `HG_Spotmeeting.createSpotmeetingInvite()`, then updates the profile inbox. Keep it local-only, preset-only, and privacy-scanned; do not add backend calls or free text.

## Tests run

- `node tests/hg-spotmeeting.test.js` — passed.
- `node tests/hg-runtime-smoke-runner.test.js` — passed.
- `node tests/hg-runtime-health.test.js` — passed with exit code 0 and no console output.
- `node tests/hg-social-demo-ux.test.js` — passed.
- `node tests/hg-social-surface-contract.test.js` — passed.
- `node tests/place-card-rounds-runtime-audit.test.js` — passed.
