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
