# HG Social Backend Contract

HG Social v3 is backend-ready. It is a knowledge graph social system, never a location graph.

## Hard boundaries

The backend must never store GPS, live presence, visit history, last seen, nearby people, follower graph, or public activity feed data. Social objects are scoped to explicit knowledge actions: profile visibility, match queries, meet invites, circles, blocks, and reports.

## API endpoints

### `POST /profile`
Creates or updates a user knowledge profile and privacy settings.

Request body: `displayName`, `bio`, `avatar`, `badges`, `completedEmner`, `coreConcepts`, `interests`, `privacySettings`.

### `GET /profile/:id`
Returns a profile only when `canSeeProfile(viewerId, id)` passes.

### `POST /match/query`
Returns knowledge matches only when both sides allow `visibleInMatchLists` and no block exists.

### `POST /meet/invite`
Creates a pending invite only when `canSendInvite(viewerId, targetId)` and moderation checks pass.

### `POST /meet/respond`
Accepts, declines, or cancels an invite. Declined and cancelled invites are auto-deleted after 30 days.

### `POST /circle/create`
Creates a learning circle with explicit members, focus domains, and optional active knowledge spots. Spots are thematic context, not location tracking.

### `POST /circle/join`
Joins a circle only when privacy, block, moderation, and circle membership rules pass.

### `POST /block`
Blocks a target user and applies mutual invisibility immediately.

### `POST /report`
Creates a moderation report. Valid reasons: Harassment, Spam, Manipulation, Unsafe behavior, Other.

## Canonical client index

The client exposes `window.HG_SOCIAL_INDEX` as the local single source-of-truth mirror for backend transition fields: profiles, matches, invites, confirmedMeets, trust, circles, sharedRoutes, sharedQuiz, sharedObservations, blocks, reports, and privacySettings.
