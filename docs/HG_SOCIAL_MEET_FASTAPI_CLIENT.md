# Social Meet FastAPI client migration

Status: **the production Spotmeeting discovery/invite browser path is routed through the typed FastAPI client boundary; local demo behavior remains available only in explicit TEST_MODE.**

## Purpose

The browser must not mutate server-owned Social Meet state directly after those domains move behind FastAPI.

This migration establishes the client path:

```text
History GO UI / legacy compatibility surfaces
                ↓
       HGSocialMeetAdapter.js
                ↓
 HGSocialMeetFastApiClient.ts
                ↓
       FastAPI /api/v1
                ↓
 canonical PostgreSQL Social Meet state
```

The existing UI is retained. No parallel Spotmeeting UI, invite store or profile model is introduced.

## Typed client

Source:

- `js/social/HGSocialMeetFastApiClient.ts`

Committed browser bundle:

- `dist/web/hgSocialMeetFastApiClient.js`

The module is part of the canonical esbuild web build and publishes the temporary strangler interop global:

```text
window.HG_SocialMeetFastApiClient
```

The legacy Social Meet adapter lazy-loads the built bundle when FastAPI mode is configured, so the large application boot loader does not need another permanent global dependency.

## Runtime configuration

FastAPI mode is enabled by an explicit backend mode or configured API base URL:

```html
<script>
  window.HG_SOCIAL_MEET_BACKEND = 'fastapi';
  window.HG_SOCIAL_MEET_API = {
    enabled: true,
    baseUrl: 'https://api.example.com'
  };
</script>
```

A `<meta name="hg-backend-url" content="https://api.example.com">` value is also supported by the typed client.

The production deployment must provide the actual backend URL. No backend hostname or secret is committed in repository configuration.

## Authentication

The FastAPI client reuses the authenticated Supabase browser session only to obtain the current access token:

```text
Supabase browser auth session
        ↓ access token only
Authorization: Bearer ...
        ↓
History GO FastAPI
        ↓ verifies Supabase token
server-owned domain logic
```

The token is never returned through the Social Meet adapter API or persisted by the new client.

`HGSocialMeetSupabaseClient.js` therefore remains required as an authentication/session bridge during this phase, but migrated Social Meet invite/discovery writes no longer go directly from the browser to PostgreSQL.

## Migrated production operations

The adapter now routes these operations through FastAPI:

- current Social Meet profile state;
- Social Meet profile upsert/publication fields;
- Spotmeeting candidate discovery;
- durable invite creation;
- participant invite inbox;
- accept/decline/cancel/complete lifecycle transitions.

Candidate identifiers passed from discovery to invite creation are opaque public `profileId` values. Raw Supabase auth user IDs are not used as public target identifiers.

## Discovery signals

The existing Spotmeeting sheet derives only coarse, explicit History GO context signals from the canonical place object:

- place category/theme;
- explicit era labels when present;
- canonical `emne_ids`/tags;
- route category for route context;
- quiz question-family tags;
- quiz/profile learning-angle tags.

The client does not send:

- GPS or precise coordinates;
- nearby/proximity/distance;
- live location or presence;
- last seen/online state;
- followers/popularity/feed signals;
- public visit/check-in history;
- passive movement or behavioral history;
- free-text user-to-user messages.

The backend remains the authoritative eligibility, suppression and ranking boundary.

## Stale discovery results

A rendered candidate card is not permission to send an invite.

When a user presses **Send forslag**, the client sends the public candidate `profileId` and current History GO context to the durable FastAPI invite endpoint. The backend then independently revalidates current:

- profile publication and consent;
- blocks and moderation restrictions;
- abuse cooldowns and rate limits;
- active duplicate state;
- database uniqueness/idempotency.

A stale card therefore fails closed when the candidate has become ineligible since discovery.

## Local/demo behavior

`HG_TEST_MODE=1` keeps the established local/demo Spotmeeting flow for product testing.

Outside TEST_MODE:

- FastAPI discovery failures do not fall back to demo candidates;
- FastAPI invite failures do not create local fake invites;
- missing FastAPI configuration renders a backend-disabled state rather than pretending the operation succeeded.

This separation prevents production UI state from diverging from server-authoritative multi-user state.

## Still transitional

These older Social Meet surfaces are not migrated by this slice and must not be confused with the server-owned Spotmeeting path:

- learning circles;
- legacy social activity list.

They continue through the existing Supabase adapter behavior until a separate domain migration defines their authoritative server model.

## Validation

The migration is covered by:

- TypeScript web typecheck;
- committed esbuild bundle sync check;
- existing Spotmeeting browser smoke test;
- `tests/social-meet-fastapi-adapter.test.js`.

The focused FastAPI frontend test verifies:

- production adapter mode uses FastAPI;
- discovery maps public `profileId` values only;
- invite payloads include the complete server-owned context and idempotency key;
- the typed client bundle lazy-loads once;
- a production server failure cannot create a local invite.
