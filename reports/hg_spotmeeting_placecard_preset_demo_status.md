# HG Spotmeeting PlaceCard preset demo status

Date: 2026-06-28
Scope: Spotmeeting only.

## Implemented

- Added `js/social/HGSpotmeetingPlaceCardDemo.js`.
- Loaded the runtime from `js/app.js` immediately after `js/social/HGSpotmeeting.js`.
- Added `tests/hg-spotmeeting-placecard-demo.test.js`.
- Updated `reports/hg_spotmeeting_v1_manual_playtest.md` with a follow-up section.

## Behavior

- In `HG_TEST_MODE=1`, the existing PlaceCard `Kunnskapsmøte` buttons now open a local candidate chooser.
- `Foreslå quiz` maps to `quiz_together`.
- `Foreslå rute` maps to `route_one_day`.
- `Foreslå observasjon` maps to `shared_observation`.
- `Finn match` maps to `compare_place_learning`.
- Sending uses the existing `HG_Spotmeeting.createSpotmeetingInvite()` API.
- Duplicate pending/accepted/completed invites for the same target/context/preset are disabled in the chooser.

## Privacy and limits

- TEST_MODE-only UI.
- Preset-only messages.
- No backend calls.
- No data manifest changes.
- No Civication changes.
- No free chat.
- No social feed/follow primitives.

## Test added

- `node tests/hg-spotmeeting-placecard-demo.test.js`
