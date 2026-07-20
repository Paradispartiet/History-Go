# History GO backend

Status: **Phase 1 foundation is implemented. Social Meet Identity & Public Profile is the first migrated server-owned domain slice.**

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

## First server-owned domain: Social Meet Identity & Public Profile

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

### Transitional direct Supabase access

The existing browser adapter remains transitional infrastructure:

- `js/social/HGSocialMeetSupabaseClient.js`
- `js/social/HGSocialMeetAdapter.js`

The migration restricts the authenticated browser role so it may continue writing the legacy basic profile fields required by the current client, but it cannot directly self-authorize Social Meet publication or write the new server-owned consent/fingerprint/visibility fields.

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

The Identity & Public Profile slice is a prerequisite, not permission to enable production discovery.

The following must still move server-side before production Spotmeeting discovery is enabled:

1. block/report/moderation enforcement;
2. export and deletion workflows;
3. durable Spotmeeting invite lifecycle and rate limiting;
4. candidate discovery using only explicit, coarse knowledge-profile inputs;
5. cross-device sync;
6. frontend migration away from direct client writes for migrated server-owned operations.

Until these prerequisites are complete, local/demo discovery behavior and the existing production safety gates must remain in place.

## Existing Social Meet work that must be reused

The repository already contains:

- `supabase/migrations/001_social_meet.sql` — original PostgreSQL schema + RLS,
- `supabase/migrations/002_social_meet_identity_profiles.sql` — server-owned identity/profile evolution,
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

The next server-owned slice should be **Social Meet block/report safety enforcement and export/delete support**, because the identity contract requires those protections before production candidate discovery or durable Spotmeeting delivery can be enabled.

After that, move the existing Spotmeeting invite state machine behind FastAPI while reusing `hg_spotmeeting_invites` rather than creating a new invite model.

Do not attempt a whole-app backend rewrite.
