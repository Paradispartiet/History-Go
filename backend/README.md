# History GO backend

Status: **Phase 1 foundation, Social Meet Identity & Public Profile, and the user-facing Social Meet safety core are implemented. Production Spotmeeting discovery remains gated.**

The canonical technical architecture is defined in:

- [`docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](../docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md)

This directory is the production server boundary for History GO. It must not duplicate existing local-first gameplay or create parallel domain models. A domain moves here only when a concrete server-authoritative responsibility is implemented end to end.

## Technology contract

The backend standard is:

- **Python** for server code,
- **FastAPI** for HTTP/API boundaries,
- **Pydantic / pydantic-settings** for typed contracts and configuration,
- **SQLAlchemy + psycopg 3** for the PostgreSQL connection boundary,
- **PostgreSQL** for mutable production state,
- **Supabase** as managed PostgreSQL/Auth/Storage infrastructure where appropriate,
- **pytest** for tests,
- **Ruff** for formatting/linting,
- **mypy strict mode** for static type checking.

The TypeScript client and Node repository tooling remain separate concerns. New production backend domains must not be implemented as ad-hoc Node services without an explicit architecture decision.

## Implemented server foundation

The shared backend foundation includes:

1. FastAPI application factory and production-safe OpenAPI behavior.
2. Validated `HG_BACKEND_*` environment configuration.
3. `/api/v1/health/live` process liveness endpoint.
4. `/api/v1/health/ready` dependency-aware readiness endpoint.
5. Lazy PostgreSQL/SQLAlchemy connection boundary using psycopg 3.
6. Supabase Auth token verification boundary.
7. Request IDs on HTTP responses.
8. Required Ruff, mypy and pytest CI gates.
9. Python 3.12 and 3.14 test coverage in CI.

## Server-owned domain 1: Social Meet Identity & Public Profile

The first migrated domain slice reuses and extends the existing `public.hg_profiles` table. It does **not** introduce a second Social Meet profile model.

Implemented API:

```text
GET  /api/v1/social-meet/me
PUT  /api/v1/social-meet/profile
GET  /api/v1/social-meet/profiles/{profileId}
POST /api/v1/social-meet/profile/unpublish
```

The identity model deliberately separates three identifiers:

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

Rules enforced by the backend:

- `auth.users.id` is never returned by public profile APIs.
- `profile_id` is generated separately from the auth account and is the only stable public user identifier.
- a profile cannot become `discoverable` without the current Social Meet consent version;
- publication additionally requires explicit confirmation that the user reviewed the public profile preview;
- public profile reads require an authenticated requester with active Social Meet opt-in;
- `draft`, `private`, `paused`, `blocked_or_suspended` and `deleted` profiles are not returned by the public profile endpoint;
- blocked/suspended/deleted profile states cannot be overwritten through normal user profile writes;
- GPS, live location, nearby state, distance, last-seen/presence, followers/feed, chat/free text, public visit history and other forbidden privacy fields are rejected recursively;
- public profile responses never include account IDs, auth subjects, email, phone, device IDs, IP addresses or moderation notes.

The profile migration is:

- `supabase/migrations/002_social_meet_identity_profiles.sql`

It extends `hg_profiles` with opaque Social Meet IDs, visibility, consent and public learning-profile fields while preserving the existing basic History GO profile fields.

## Server-owned domain 2: Social Meet safety core

The safety core implements private user blocks, confidential structured reports, durable moderation-queue fan-out, a private safety audit trail, and a reusable interaction guard for later candidate/invite services.

Implemented participant API:

```text
GET    /api/v1/social-meet/blocks
POST   /api/v1/social-meet/blocks
DELETE /api/v1/social-meet/blocks/{blockId}

POST   /api/v1/social-meet/reports
GET    /api/v1/social-meet/reports/submitted
GET    /api/v1/social-meet/reports/{reportId}
```

Server-enforced safety rules include:

- block and report operations use public `profile_id` values at participant boundaries, never auth/account IDs;
- a profile cannot block or report itself;
- when a block/report references an invite, the backend verifies that the invite actually belongs to the two involved users;
- active blocks are checked bidirectionally so either participant can suppress future contact;
- reports accept an allow-listed reason code and bounded structured details only, never a free-text report message;
- recursive forbidden-field scanning rejects GPS, live location, nearby/distance, presence, public visit history, follower/feed and free-chat fields before persistence;
- report responses never expose reporter identity, auth/account IDs, moderator notes, IP/device information or internal queue state;
- a submitted report is committed before moderation-queue fan-out, so a temporary queue failure cannot destroy the user's report;
- block/report/audit profile UUIDs are retained without foreign keys to `hg_profiles`, allowing safety evidence to survive profile deletion without blocking account deletion;
- the safety interaction guard fails closed for unavailable, unpublished, non-consenting or blocked profile pairs;
- safety audit records contain action/decision identifiers only and no location, presence or message content.

The safety migration is:

- `supabase/migrations/003_social_meet_safety_core.sql`

The four new safety tables are server-owned. Direct `anon` and `authenticated` Supabase table access is revoked; participant access goes through FastAPI.

The moderation queue is intentionally private. This slice does **not** yet expose moderator/admin endpoints or enable production discovery.

## Transitional direct Supabase access

The existing browser adapter remains transitional infrastructure:

- `js/social/HGSocialMeetSupabaseClient.js`
- `js/social/HGSocialMeetAdapter.js`

The identity migration restricts the authenticated browser role so it may continue writing the legacy basic profile fields required by the current client, but it cannot directly self-authorize Social Meet publication or write the new server-owned consent/fingerprint/visibility fields. The safety tables are fully server-owned and cannot be written directly by the browser role.

The intended migration remains:

```text
existing History GO / Social Meet UI
                ↓
         typed client adapter
                ↓
           FastAPI domain API
                ↓
 reuse/evolve existing PostgreSQL schema + RLS
```

Do not create a second set of Social Meet tables or a parallel invite model.

## Production Social Meet remains gated

Identity/profile and the user-facing block/report core are prerequisites, not permission to enable production discovery.

The following still must be completed server-side before production Spotmeeting discovery is enabled:

1. moderator/admin enforcement APIs, suspension/restore actions and appeal/review handling;
2. rate limits, duplicate suppression and cooldowns, including enforcement after blocks/reports;
3. retention, export, account deletion/anonymization and durable suppression/tombstone behavior;
4. durable Spotmeeting invite lifecycle using the existing `hg_spotmeeting_invites` model;
5. candidate discovery using only explicit, coarse knowledge-profile inputs and the safety interaction guard;
6. cross-device sync;
7. frontend migration away from direct client writes for migrated server-owned operations.

Until these prerequisites are complete, local/demo discovery behavior and the existing production safety gates must remain in place.

## Existing Social Meet work that must be reused

The repository already contains:

- `supabase/migrations/001_social_meet.sql` — original PostgreSQL schema + RLS,
- `supabase/migrations/002_social_meet_identity_profiles.sql` — server-owned identity/profile evolution,
- `supabase/migrations/003_social_meet_safety_core.sql` — server-owned block/report safety persistence,
- `docs/social-meet-backend.md`,
- `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`,
- `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`,
- `docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`,
- the existing Social Meet browser adapters.

Backend work must evolve these contracts and schemas rather than replacing them.

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

The API is then available through the FastAPI development server. OpenAPI docs are enabled outside production and disabled automatically when `HG_BACKEND_ENVIRONMENT=production`.

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

- If no database is configured and it is not required, readiness reports `skipped`.
- If a database is configured, readiness pings it and fails on connection errors.
- If `HG_BACKEND_READINESS_REQUIRE_DATABASE=true`, missing configuration fails readiness.

### Supabase Auth verification

The auth boundary does not store the Supabase legacy JWT secret.

- Modern asymmetric `RS256` / `ES256` access tokens are verified locally against the Supabase project JWKS.
- Legacy `HS256` tokens are verified through the Supabase Auth `/user` endpoint and require the public/publishable project key.
- Unsupported JWT algorithms fail closed.
- Domain code receives only a verified minimal `AuthPrincipal`, not raw auth infrastructure.

## Validation

Run from the repository root after installing backend dev dependencies:

```bash
python -m ruff check backend
python -m ruff format --check backend
python -m mypy backend/app
cd backend && python -m pytest --cov=app --cov-report=term-missing --cov-fail-under=80
```

The same checks are enforced by `.github/workflows/backend-python.yml` on Python 3.12 and 3.14.

When Ruff formatting fails in CI, the workflow persists the exact format diff as a `backend-ruff-format-diff-*` artifact so the next fix can use the recorded diagnostics rather than terminal-only output.

## Ownership rules

Backend code owns:

- server-authoritative business rules,
- authentication and authorization boundaries,
- cross-device sync,
- multi-user state,
- Social Meet / Spotmeeting production rules,
- moderation and abuse controls,
- protected integrations and secrets,
- database writes that must not be trusted to the client.

The backend does **not** automatically own the editorial datasets under `data/`. Places, people, quiz, curriculum and other established canonical content remain JSON/manifest-driven unless a separate data architecture decision changes that.

## Next backend slice

The next safety slice should add **moderator/admin enforcement plus rate limits/cooldowns and retention/export/delete**, because those controls still gate production invite delivery and candidate discovery.

After those protections are in place, move the existing Spotmeeting invite state machine behind FastAPI while reusing `hg_spotmeeting_invites` rather than creating a new invite model.

Do not attempt a whole-app backend rewrite.
