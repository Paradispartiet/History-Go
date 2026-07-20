# History GO backend

Status: **The shared FastAPI foundation and six server-owned Social Meet backend slices are implemented: Identity & Public Profile, participant safety/export/deletion, moderation/appeals, invite abuse controls, the durable Spotmeeting invite lifecycle, and privacy-safe candidate discovery. The production Spotmeeting browser path is also migrated to the typed FastAPI client boundary. Production discovery and invite writes remain fail-closed until their rollout gates are explicitly enabled.**

The canonical technical architecture is defined in:

- [`docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](../docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md)

This directory is the production server boundary for History GO. It must not duplicate existing local-first gameplay or create parallel domain models. A domain moves here only when a concrete server-authoritative responsibility is implemented end to end.

## Technology contract

The backend standard is:

- **Python** for server code;
- **FastAPI** for HTTP/API boundaries;
- **Pydantic / pydantic-settings** for typed contracts and configuration;
- **SQLAlchemy + psycopg 3** for the PostgreSQL connection boundary;
- **PostgreSQL** for mutable production state;
- **Supabase** as managed PostgreSQL/Auth/Storage infrastructure where appropriate;
- **pytest** for tests;
- **Ruff** for formatting/linting;
- **mypy strict mode** for static type checking.

The TypeScript client and Node repository tooling remain separate concerns. New production backend domains must not be implemented as ad-hoc Node services without an explicit architecture decision.

## Shared server foundation

The backend foundation includes:

1. FastAPI application factory and production-safe OpenAPI behavior.
2. Validated `HG_BACKEND_*` environment configuration.
3. `/api/v1/health/live` process liveness.
4. `/api/v1/health/ready` dependency-aware readiness.
5. Lazy PostgreSQL/SQLAlchemy connections using psycopg 3.
6. Supabase Auth token verification.
7. Request IDs on HTTP responses.
8. Explicit moderator/admin authorization from verified `app_metadata.history_go_roles` only.
9. Required Ruff, strict mypy and pytest/coverage CI gates.
10. Python 3.12 and 3.14 test coverage in CI.
11. Persisted CI diagnostics for Ruff, mypy and pytest failures.

## Server-owned slice 1: Identity & Public Profile

The identity slice reuses and extends `public.hg_profiles`; it does not introduce a second Social Meet profile model.

Implemented API:

```text
GET  /api/v1/social-meet/me
PUT  /api/v1/social-meet/profile
GET  /api/v1/social-meet/profiles/{profileId}
POST /api/v1/social-meet/profile/unpublish
```

The identity boundary separates:

```text
Supabase auth.users.id
        ↓ private auth binding
hg_profiles.user_id
        ↓
hg_profiles.social_user_id
        ↓ private/service identity
hg_profiles.profile_id
        ↓ only stable public Social Meet identity
public profile / discovery / invite APIs
```

Core rules:

- auth IDs are never returned by public profile APIs;
- `profile_id` is the stable public participant identifier;
- `discoverable` requires the current consent version and explicit publication confirmation;
- public reads require authenticated Social Meet opt-in;
- blocked, suspended and deleted profile states cannot be overwritten by normal user writes;
- forbidden privacy/tracking fields are rejected recursively.

Migration:

- `supabase/migrations/002_social_meet_identity_profiles.sql`

## Server-owned slice 2: Participant safety, export and deletion

Implemented API:

```text
GET    /api/v1/social-meet/blocks
POST   /api/v1/social-meet/blocks
DELETE /api/v1/social-meet/blocks/{blockId}

POST   /api/v1/social-meet/reports
GET    /api/v1/social-meet/reports/submitted
GET    /api/v1/social-meet/reports/{reportId}

GET    /api/v1/social-meet/export
DELETE /api/v1/social-meet/account
```

The safety boundary provides:

- bidirectional active block enforcement;
- confidential structured reports;
- participant-safe, non-enumerating errors;
- a reusable interaction gate for discovery and invite operations;
- participant-scoped export;
- idempotent Social Meet deletion/tombstoning without deleting the Supabase auth account.

Migration:

- `supabase/migrations/003_social_meet_safety.sql`

## Server-owned slice 3: Moderation and appeals

Moderator/admin API:

```text
GET  /api/v1/social-meet/moderation/queue
GET  /api/v1/social-meet/moderation/queue/{queueItemId}
POST /api/v1/social-meet/moderation/queue/{queueItemId}/actions
POST /api/v1/social-meet/moderation/reports/{reportId}/resolve
POST /api/v1/social-meet/moderation/profiles/{profileId}/suspend
```

Admin-only API:

```text
POST /api/v1/social-meet/moderation/profiles/{profileId}/restore
POST /api/v1/social-meet/appeals/{appealId}/decision
```

Participant appeal API:

```text
GET  /api/v1/social-meet/appeals
POST /api/v1/social-meet/appeals
```

Staff authorization is derived only from verified, server-controlled Supabase `app_metadata.history_go_roles` values:

- `history_go_moderator`
- `history_go_admin`

Email, browser state, public profiles, `user_metadata` and generic role fields never grant staff privileges.

Migration and implementation documentation:

- `supabase/migrations/004_social_meet_moderation.sql`
- `docs/HG_SOCIAL_MEET_MODERATION_BACKEND.md`

## Server-owned slice 4: Spotmeeting invite abuse controls

The abuse-control slice implements the server preflight policy used by durable invite creation. It reuses canonical state instead of creating a parallel reputation or rate-limit ledger.

The guard evaluates:

- current sender/recipient publication and consent;
- block and moderation restrictions;
- duplicate active invites;
- rolling sender, pair and recipient volume limits;
- stricter policy for new Social Meet opt-ins and unresolved reports;
- cooldowns after decline, confidential reports, blocks and repeated cancellations.

Private report/block causes collapse to non-enumerating participant errors.

Migration and policy documentation:

- `supabase/migrations/005_social_meet_abuse_indexes.sql`
- `docs/HG_SOCIAL_MEET_ABUSE_CONTROLS.md`

## Server-owned slice 5: Durable Spotmeeting invite lifecycle

The invite slice evolves the existing `public.hg_spotmeeting_invites` table. It does **not** create a parallel invite model.

Implemented API:

```text
GET  /api/v1/social-meet/spotmeeting/presets
POST /api/v1/social-meet/spotmeeting/invites
GET  /api/v1/social-meet/spotmeeting/inbox
GET  /api/v1/social-meet/spotmeeting/sync

POST /api/v1/social-meet/spotmeeting/invites/{inviteId}/accept
POST /api/v1/social-meet/spotmeeting/invites/{inviteId}/decline
POST /api/v1/social-meet/spotmeeting/invites/{inviteId}/cancel
POST /api/v1/social-meet/spotmeeting/invites/{inviteId}/complete
```

The server preserves the existing five product preset IDs and accepts no free-text invite message.

Creation is protected by:

1. identity/publication/consent validation;
2. shared block and moderation enforcement;
3. abuse-policy preflight;
4. serializable PostgreSQL creation transaction;
5. deterministic profile locking;
6. transactional revalidation of profile eligibility, blocks, cooldowns, rate limits and duplicates;
7. database uniqueness for active duplicates and creator-scoped idempotency keys.

The lifecycle is server-authoritative:

- `pending -> accepted`: recipient only;
- `pending -> declined`: recipient only;
- `pending -> cancelled`: sender only;
- `accepted -> cancelled`: either participant;
- `accepted -> completed`: either participant;
- repeated completion is idempotent;
- stale version races return `conflict`;
- stale active invites expire server-side;
- accept/complete are additionally protected by a database-level safety trigger against racing block/moderation changes.

Cross-device sync uses a global monotonic `sync_version` cursor. It is not a presence, online or last-seen signal.

Migration and implementation documentation:

- `supabase/migrations/006_spotmeeting_invites_server.sql`
- `docs/HG_SPOTMEETING_INVITE_BACKEND.md`

Direct authenticated browser insert/update/delete access to `hg_spotmeeting_invites` is revoked by migration 006. The production Spotmeeting adapter now uses the FastAPI lifecycle API. Transitional participant read access remains only for older browser surfaces that have not yet been retired or migrated.

## Server-owned slice 6: Privacy-safe candidate discovery

Candidate discovery is implemented behind fail-closed rollout controls and reuses the existing Social Meet profile and safety state rather than creating a second discovery graph.

Implemented API:

```text
POST /api/v1/social-meet/spotmeeting/discovery/context-candidates
```

The discovery boundary:

- requires a currently discoverable requester with the current consent version;
- filters candidates for current publication, consent, deletion and moderation state;
- suppresses active/recent block relationships;
- suppresses recent or unresolved confidential report relationships;
- suppresses active invites and decline cooldowns;
- ranks only after suppression;
- returns opaque public `profile_id` values, never auth IDs;
- exposes safe match-reason categories but never internal compatibility scores.

Ranking uses only explicit, coarse compatibility inputs such as current History GO context, preferred themes, eras and learning goals. It permanently excludes GPS, nearby/proximity, distance, presence, last-seen, followers, popularity, feeds, public visit history, passive behavior and free chat.

Discovery requires both:

1. deployment kill switch `HG_BACKEND_SPOTMEETING_DISCOVERY_ENABLED=true`;
2. the private PostgreSQL `spotmeeting_discovery` rollout flag introduced by migration 007.

The private database gate supports explicit public-profile cohorts and deterministic percentage rollout. Missing or disabled rollout state fails closed.

Discovery results are advisory snapshots only. `generatedAt` and `staleAfterSeconds` tell the client when to refresh; they are not presence or availability signals. The durable invite creation path independently revalidates current profile eligibility, blocks, moderation, abuse/cooldowns, rate limits and duplicate state before any invite insert.

Migration and implementation documentation:

- `supabase/migrations/007_social_meet_candidate_discovery.sql`
- `docs/HG_SOCIAL_MEET_CANDIDATE_DISCOVERY_BACKEND.md`

## Production client boundary

The production Spotmeeting browser path now follows:

```text
existing History GO / Social Meet UI
                ↓
       HGSocialMeetAdapter.js
                ↓
 HGSocialMeetFastApiClient.ts
                ↓
            FastAPI domain API
                ↓
 reuse/evolve existing PostgreSQL schema + RLS
```

Relevant client files:

- `js/social/HGSocialMeetAdapter.js`
- `js/social/HGSocialMeetFastApiClient.ts`
- `dist/web/hgSocialMeetFastApiClient.js`
- `docs/HG_SOCIAL_MEET_FASTAPI_CLIENT.md`

The typed client uses the existing Supabase browser session only as an authentication-token bridge. Migrated Spotmeeting discovery, invite creation, inbox and lifecycle mutations are routed through FastAPI, and production server failures do not fall back to local fake invites.

`HG_TEST_MODE=1` intentionally retains the local/demo Spotmeeting flow for product testing. Learning circles and the legacy social-activity list remain transitional direct-Supabase areas until they receive a separate server-authoritative domain decision.

Do not create duplicate Social Meet profile, safety, moderation, abuse, discovery or invite models.

## Production Social Meet remains gated

The core backend and client migration are implemented, but this is not automatic permission to expose Social Meet broadly in production.

Already implemented technical gates include:

- authenticated public profile identity and explicit opt-in;
- recursive forbidden-field validation;
- durable server-authoritative invite persistence and lifecycle;
- participant blocks, structured reports, moderation and appeals;
- invite abuse controls and rate/cooldown enforcement;
- privacy-safe candidate discovery;
- stale-result revalidation through the authoritative invite creation transaction;
- production frontend routing through the typed FastAPI boundary;
- deployment kill switches for production invite writes and discovery;
- private database discovery cohorts/percentage rollout.

The major remaining production gates are:

1. production-scale retention/cleanup jobs and safe retained-record tombstone policy for closed invites, deleted Social Meet state, reports, moderation records and legal/safety holds;
2. privacy-safe operational observability that measures service health without reconstructing presence, movement, social graphs or popularity;
3. an explicit production rollout/rollback procedure, including environment configuration, cohort review, moderation capacity, kill-switch rehearsal and staged expansion;
4. participant-safe notification delivery if notifications are introduced;
5. an explicit server-authoritative decision for remaining transitional Social Meet areas such as learning circles and legacy social activity.

Until an explicit production rollout decision enables the corresponding gates, production discovery and invite writes remain fail-closed by configuration. Local/demo behavior remains separate under TEST_MODE.

## Existing Social Meet work that must be reused

Canonical schema evolution:

- `supabase/migrations/001_social_meet.sql`
- `supabase/migrations/002_social_meet_identity_profiles.sql`
- `supabase/migrations/003_social_meet_safety.sql`
- `supabase/migrations/004_social_meet_moderation.sql`
- `supabase/migrations/005_social_meet_abuse_indexes.sql`
- `supabase/migrations/006_spotmeeting_invites_server.sql`
- `supabase/migrations/007_social_meet_candidate_discovery.sql`

Key contracts/implementation docs:

- `docs/social-meet-backend.md`
- `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_MODERATION_BACKEND.md`
- `docs/HG_SOCIAL_MEET_ABUSE_CONTROLS.md`
- `docs/HG_SPOTMEETING_INVITE_BACKEND.md`
- `docs/HG_SOCIAL_MEET_CANDIDATE_DISCOVERY_BACKEND.md`
- `docs/HG_SOCIAL_MEET_FASTAPI_CLIENT.md`

Backend work must evolve these contracts and schemas rather than replace them.

## AHA is a separate backend concern

The repository also contains `render.yaml` for an AHA Node service. It is not the History GO production backend defined here and must not be silently folded into this service. Any AHA consolidation requires its own audit and architecture decision.

## Local setup

From the repository root:

```bash
python -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e './backend[dev]'
cp backend/.env.example backend/.env
fastapi dev backend/app/main.py
```

OpenAPI docs are enabled outside production and disabled automatically when `HG_BACKEND_ENVIRONMENT=production`.

## Configuration

All backend settings use the `HG_BACKEND_` prefix.

Core settings:

- `HG_BACKEND_ENVIRONMENT`
- `HG_BACKEND_DATABASE_URL`
- `HG_BACKEND_SUPABASE_URL`
- `HG_BACKEND_SUPABASE_PUBLISHABLE_KEY`
- `HG_BACKEND_SUPABASE_JWT_AUDIENCE`
- `HG_BACKEND_READINESS_REQUIRE_DATABASE`
- `HG_BACKEND_READINESS_REQUIRE_AUTH`
- `HG_BACKEND_SPOTMEETING_INVITE_WRITES_ENABLED`
- `HG_BACKEND_SPOTMEETING_DISCOVERY_ENABLED`
- `HG_BACKEND_SPOTMEETING_DISCOVERY_MAX_CANDIDATES`
- `HG_BACKEND_SPOTMEETING_DISCOVERY_STALE_AFTER_SECONDS`

Production invite mutations fail closed unless `HG_BACKEND_SPOTMEETING_INVITE_WRITES_ENABLED=true`. Discovery fails closed unless both the deployment kill switch and the private database rollout flag allow the requester.

Never commit real database credentials, service-role keys, JWT signing secrets or private integration keys.

### Database readiness

The backend does not connect to PostgreSQL at import time. Connections are created lazily through the shared `Database` boundary.

- missing optional database configuration reports `skipped`;
- configured database readiness performs a real ping and fails on connection errors;
- `HG_BACKEND_READINESS_REQUIRE_DATABASE=true` makes missing configuration fail readiness.

### Supabase Auth verification

The auth boundary does not store the Supabase legacy JWT secret.

- modern asymmetric `RS256` / `ES256` access tokens are verified locally against Supabase JWKS;
- legacy `HS256` tokens are verified through Supabase Auth `/user` using the public/publishable key;
- unsupported JWT algorithms fail closed;
- domain code receives a verified minimal `AuthPrincipal`, not raw auth infrastructure;
- History GO staff roles are read only from verified `app_metadata.history_go_roles`.

## Validation

Run from the repository root after installing backend dev dependencies:

```bash
python -m ruff check backend
python -m ruff format --check backend
python -m mypy backend/app
cd backend && python -m pytest --cov=app --cov-report=term-missing --cov-fail-under=80
```

The same checks run in `.github/workflows/backend-python.yml` on Python 3.12 and 3.14. Failed Ruff, mypy and pytest gates persist their diagnostic output as workflow artifacts for exact repair work.

The browser-side FastAPI migration is additionally protected by the TypeScript web typecheck, committed `dist/web` build-sync gate and the combined Social Meet/Spotmeeting browser smoke in `.github/workflows/typescript-guard.yml`.

## Ownership rules

Backend code owns:

- server-authoritative business rules;
- authentication and authorization boundaries;
- cross-device sync;
- multi-user state;
- Social Meet / Spotmeeting production rules;
- moderation and abuse controls;
- protected integrations and secrets;
- database writes that must not be trusted to the client.

The backend does **not** automatically own editorial datasets under `data/`. Places, people, quiz, curriculum and other established canonical content remain JSON/manifest-driven unless a separate data architecture decision changes that.

## Next backend slice

The next server-owned backend work should implement **production retention/cleanup and privacy-safe operational observability** before broad Social Meet rollout. The work must define retention windows and safe tombstone/legal-hold behavior for closed invites and safety/moderation state, add idempotent scheduled cleanup paths, and expose only aggregate service-health metrics that cannot reconstruct participant presence, movement, popularity or social graphs.
