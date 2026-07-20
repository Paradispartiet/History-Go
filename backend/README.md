# History GO backend

Status: **The shared FastAPI foundation and five server-owned Social Meet backend slices are implemented: Identity & Public Profile, participant safety/export/deletion, moderation/appeals, invite abuse controls, and the durable Spotmeeting invite lifecycle. Production candidate discovery remains disabled.**

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

Direct authenticated browser insert/update/delete access to `hg_spotmeeting_invites` is revoked by migration 006. Participant reads remain temporarily available while the existing frontend is migrated to the FastAPI adapter.

## Transitional client boundary

The existing browser adapters remain transitional infrastructure:

- `js/social/HGSocialMeetSupabaseClient.js`
- `js/social/HGSocialMeetAdapter.js`

The intended architecture is:

```text
existing History GO / Social Meet UI
                ↓
         typed client adapter
                ↓
           FastAPI domain API
                ↓
 reuse/evolve existing PostgreSQL schema + RLS
```

Do not create duplicate Social Meet profile, safety, moderation, abuse or invite models.

## Production Social Meet remains gated

The implemented backend slices are prerequisites, not permission to enable production candidate discovery.

The major remaining gates are:

1. candidate discovery using explicit, coarse knowledge-profile inputs only;
2. stale-result revalidation against current identity, publication, block, moderation and abuse policy at invite creation time;
3. frontend migration away from direct writes for migrated server-owned operations;
4. production-scale expiry/retention jobs and safe retained-record tombstones;
5. participant-safe notification delivery, if introduced;
6. rollout controls, observability and kill switches for production Social Meet.

Until these gates are complete, local/demo candidate discovery and existing production safety gates must remain in place.

## Existing Social Meet work that must be reused

Canonical schema evolution:

- `supabase/migrations/001_social_meet.sql`
- `supabase/migrations/002_social_meet_identity_profiles.sql`
- `supabase/migrations/003_social_meet_safety.sql`
- `supabase/migrations/004_social_meet_moderation.sql`
- `supabase/migrations/005_social_meet_abuse_indexes.sql`
- `supabase/migrations/006_spotmeeting_invites_server.sql`

Key contracts/implementation docs:

- `docs/social-meet-backend.md`
- `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`
- `docs/HG_SOCIAL_MEET_MODERATION_BACKEND.md`
- `docs/HG_SOCIAL_MEET_ABUSE_CONTROLS.md`
- `docs/HG_SPOTMEETING_INVITE_BACKEND.md`

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

The next server-owned slice should implement **candidate discovery with stale-result revalidation** using only explicit, coarse knowledge-profile inputs. It must revalidate identity, publication, blocks, moderation and abuse policy before any candidate becomes actionable and must not introduce GPS, nearby-user discovery, presence, public visit history or social-graph ranking.

Frontend migration to the FastAPI Social Meet/Spotmeeting adapter should proceed in parallel with that backend slice, without re-enabling direct writes to server-owned tables.
