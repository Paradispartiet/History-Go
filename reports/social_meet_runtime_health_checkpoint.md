# Social Meet runtime health checkpoint

## Scope

Social Meet / Spotmeeting only. No backend was added and Civication was not changed.

## Files inspected

- `js/debug/HGRuntimeHealth.js`
- `js/debug/HGRuntimeSmokeRunner.js`
- `js/social/HGSpotmeeting.js`
- `js/social/HGSpotmeetingPlaceCardDemo.js`
- `profile.html`
- `tests/social-meet-spotmeeting-browser-smoke.test.js`

## Health checks added or extended

Runtime health now validates that:

- `window.HG_Spotmeeting` exists.
- `HG_Spotmeeting.health()` returns `ok: true`.
- `window.HG_SpotmeetingPlaceCardDemo` exists.
- The profile DOM exposes the Social Meet tab.
- The profile DOM exposes the `spotmeeting-inbox` mount.
- `window.renderSpotmeetingInbox` exists for the inbox renderer.
- Spotmeeting preset messages are preset-only and do not expose free text.
- Context payloads with forbidden privacy fields are rejected.
- Demo users are not inserted into global `PEOPLE`.

## Smoke runner output

The runtime smoke runner now emits compact Social Meet checkpoints:

- `socialMeet.ok`
- `spotmeeting.ok`
- `spotmeetingInbox.ok`
- `privacy.ok`

## Privacy result

Privacy checks are expected to pass when forbidden fields are rejected and no demo users are found in `PEOPLE`. The checkpoint treats either failure as a blocker.

## Test commands

- `node tests/hg-spotmeeting.test.js`
- `node tests/hg-spotmeeting-placecard-demo.test.js`
- `npm run test:social-review`
- `npm run test:social-meet-spotmeeting-smoke`
- `node tests/hg-runtime-health.test.js`
- `node tests/hg-runtime-smoke-runner.test.js`


## 2026-09-13 production-readiness audit

The PlaceCard meeting entry now has an explicit distinction between **people to meet** and physical presence:

- `PlaceCard → Utforsk → Møtes` opens context candidate discovery.
- Candidates are opt-in knowledge/interest matches for the active Place.
- The product does **not** expose who is physically at the Place, GPS, distance, presence, online/last-seen state or public visit history.
- A meeting proposal is preset-only; accepted/declined/completed lifecycle remains server-owned when FastAPI is active.

Production audit found two frontend integration gaps and closed them in code:

1. `HGSocialMeetSupabaseClient` can now reuse the existing AHA/Supabase authenticated session as the FastAPI bearer-token source instead of requiring duplicate Social Meet auth configuration.
2. `HGSocialMeetProfileBridge` now provides explicit discoverable-profile publication/unpublication with `social_meet_identity_v1` consent, visible preview confirmation and privacy-safe knowledge signals.

The UI also reports distinct failure states for missing login, unpublished profile, disabled server rollout and unavailable network/backend.

This does **not** activate production multi-user Social Meet by itself. Real users remain unavailable until all external prerequisites exist:

- an active PostgreSQL/Supabase database with Social Meet migrations;
- a deployed FastAPI URL supplied to the browser;
- server discovery/write feature gates enabled according to rollout policy.

Fail-closed behavior is therefore intentional until infrastructure activation.
