# HG Social QA + Privacy Guards

HG Social is a **knowledge graph social** layer, not a location graph social layer. QA must verify that social discovery, invites, circles, timelines, and NextUp social suggestions are derived from learning signals and concept proximity rather than physical proximity or tracking data.

## QA Checklist

- Public profiles must not expose location or visit history.
- Match results must be based only on knowledge fields.
- Meet invites may contain `spotId` as a proposed meeting place, but not current location.
- Confirmed meets may contain planned spot/time, but not live location.
- Circle activity is member-only.
- Social timeline is private by default.
- NextUp social suggestions must use concept proximity, not physical proximity.

## Runtime Guard Coverage

`js/hgSocialGuards.js` exposes `window.HG_SocialGuards.assertNoSocialPrivacyLeak(payload, context)` for runtime validation of HG Social outputs. The guard recursively scans object keys and logs `HG_SOCIAL_PRIVACY_VIOLATION` with `{ context, key, path }` if a forbidden field appears.

Guarded contexts:

- `publicProfile`
- `knowledgeMatch`
- `meetInvite`
- `confirmedMeet`
- `circleActivity`
- `socialTimeline`
- `nextUpSocial`

## Forbidden Fields and Signals

HG Social must never expose:

- GPS
- live location
- visit history
- last seen
- nearby people
- followers/following
- public activity feed
- online status
- exact activity timestamps

The runtime forbidden-key list includes `gps`, `latitude`, `longitude`, `coords`, `location`, `distance`, `nearby`, `visitHistory`, `visitedPlaces`, `lastSeen`, `onlineNow`, `followers`, `following`, `publicActivityFeed`, and `activityTimestamp`.

## Hard Rule

History Go Social remains **knowledge graph social**, not **location graph social**.
