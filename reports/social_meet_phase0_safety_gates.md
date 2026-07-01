# Social Meet Phase 0 production safety gates

Date: 2026-07-01

## Scope

This report covers only Social Meet / HG Spotmeeting runtime safety gates. It does not implement backend behavior and does not change Civication.

## Runtime readiness flags

`HGSpotmeeting.js` now treats production Spotmeeting discovery as disabled unless all of these runtime readiness flags are explicitly `true`:

- `backendReady`
- `identityReady`
- `invitePersistenceReady`
- `moderationReady`
- `productionDiscoveryEnabled` (derived from all four required flags)

The default state is safe: all readiness flags are `false`, and `productionDiscoveryEnabled` is `false`.

## Production behavior outside `HG_TEST_MODE`

- Candidate discovery fails closed with `backend_not_enabled` or another readiness-specific disabled reason.
- Invite creation for real candidates fails safely before persistence while production discovery is disabled.
- Demo candidates are not returned outside `HG_TEST_MODE`.
- Demo profiles are not written to global `PEOPLE`.

## TEST_MODE behavior

`HG_TEST_MODE=1` keeps the existing local demo flow available:

- Demo candidates can be suggested from PlaceCard flows.
- Preset-only demo invites can be created locally.
- The demo remains private/manual/preset-only and continues to reject forbidden privacy fields.

## Health and smoke coverage

Runtime health and smoke checks now cover the safety gate contract:

- `productionDiscoveryEnabled` is false by default.
- `backendReady=false` blocks discovery.
- Missing identity readiness blocks discovery.
- Missing invite persistence readiness blocks discovery.
- Missing moderation readiness blocks discovery.
- Forbidden privacy fields are still rejected.

## Privacy result

Phase 0 continues to reject forbidden privacy fields such as GPS/live location, coordinates, nearby users, followers/following, feed, free chat/free text, public visit history, and visited places.
