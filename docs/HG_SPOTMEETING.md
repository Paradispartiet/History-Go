# HG Spotmeeting v1

HG Spotmeeting is the product name for voluntary, privacy-safe meeting requests around History Go knowledge. A spotmeeting is not dating, not social media, not a live-location feature, and not chat.

## Definition

A spotmeeting is a manual request to meet around a History Go place, route, quiz, observation, circle, or topic. Matching is based on knowledge, interests, completed learning, routes, observations, and shared concepts — never where someone is right now.

## Allowed contexts

Every spotmeeting context must include `contextType`, `contextId`, `title`, `reason`, and `sourceSurface`.

Allowed context types:

- `place`
- `quiz`
- `route`
- `observation`
- `topic`
- `circle`

## Lifecycle

1. User manually opens a spotmeeting surface.
2. History Go suggests knowledge/activity matches for the selected context.
3. User sends one preset message.
4. Recipient can accept or decline.
5. Sender can cancel.
6. Either side can block or report according to social moderation rules.
7. A completed spotmeeting can be marked completed once. Completion does not farm trust or alter existing scoring.

## Privacy rules

Spotmeeting must always be:

- manually initiated;
- knowledge/activity based;
- tied to a place, topic, route, quiz, observation, or circle;
- preset-message only;
- cancellable;
- blockable/reportable;
- private by default.

Spotmeeting must never expose or use GPS, live location, last seen, nearby users, distance to person, followers, public feed, free chat, public visit history, or passive tracking.

## Demo vs production

`window.HG_Spotmeeting` exists in production, but production invite discovery returns `backend_not_enabled` until a real privacy-reviewed backend exists. In `HG_TEST_MODE`, the module can read seeded HG Social demo candidates. Demo data remains local and must not be inserted into `PEOPLE` or production profile/social storage.

## Backend requirements

A future backend must implement the same privacy contract before real discovery is enabled:

- authenticated current-user identity;
- explicit opt-in public profile/read model;
- context-bound invite API;
- preset message IDs only;
- cancellation, accept, decline, block, and report endpoints;
- retention/deletion policy;
- no live location, nearby-user, follower/feed, or chat primitives.


## Related server-side safety contracts

Production Spotmeeting discovery remains disabled until the server-side identity, invite, and block/report/moderation contracts are implemented and verified:

- `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`

## Non-goals

HG Spotmeeting does not implement dating, free chat, public feeds, follower graphs, live presence, GPS discovery, distance ranking, or backend calls in v1.
