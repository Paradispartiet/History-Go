# History GO backend

Status: **Phase 1 foundation implemented. No production game domain has been migrated yet.**

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

## What Phase 1 contains

```text
backend/
  app/
    api/
      dependencies.py
      routes/
        health.py
    auth/
      supabase.py
    core/
      config.py
      database.py
    main.py
  tests/
  .env.example
  pyproject.toml
```

Implemented foundation:

1. FastAPI application factory and production-safe OpenAPI behavior.
2. Validated `HG_BACKEND_*` environment configuration.
3. `/api/v1/health/live` process liveness endpoint.
4. `/api/v1/health/ready` dependency-aware readiness endpoint.
5. Lazy PostgreSQL/SQLAlchemy connection boundary using psycopg 3.
6. Supabase Auth token verification boundary.
7. Request IDs on HTTP responses.
8. pytest coverage for health, database and auth foundation behavior.
9. Required Ruff, mypy and pytest GitHub Actions gates.
10. Python 3.12 and 3.14 test coverage in CI.

This phase deliberately adds **no new game tables, no duplicate Social Meet schema, no user/progression model and no production writes**.

## Existing backend work that must be reused

The repository already contains real backend-oriented work for Social Meet:

- `supabase/migrations/001_social_meet.sql` — PostgreSQL schema + RLS,
- `docs/social-meet-backend.md` and the Social Meet backend contracts,
- `js/social/HGSocialMeetSupabaseClient.js`,
- `js/social/HGSocialMeetAdapter.js`.

That work is not replaced by this foundation. The intended migration is:

```text
existing TypeScript Social Meet UI
              ↓
       typed client adapter
              ↓
         FastAPI domain API
              ↓
 reuse/evolve existing PostgreSQL schema + RLS
```

The current direct client → Supabase adapter remains transitional infrastructure until the matching server domain is migrated. Do not create a second set of Social Meet tables or a parallel invite model.

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

This allows the foundation to run before the first server-owned domain is enabled without pretending that a production database is healthy.

### Supabase Auth verification

The auth boundary does not store the Supabase legacy JWT secret.

- Modern asymmetric `RS256` / `ES256` access tokens are verified locally against the Supabase project JWKS.
- Legacy `HS256` tokens are verified through the Supabase Auth `/user` endpoint and require the public/publishable project key.
- Unsupported JWT algorithms fail closed.
- Domain code receives only a verified minimal `AuthPrincipal`, not raw auth infrastructure.

## Health endpoints

```text
GET /api/v1/health/live
GET /api/v1/health/ready
```

`live` answers only whether the API process is alive.

`ready` reports database/auth dependency state and returns HTTP `503` when a configured dependency is unhealthy or a required dependency is missing.

Health responses must never expose credentials, connection strings, bearer tokens or private Supabase configuration.

## Validation

Run from the repository root after installing backend dev dependencies:

```bash
python -m ruff check backend
python -m ruff format --check backend
python -m mypy backend/app
cd backend && python -m pytest --cov=app --cov-report=term-missing --cov-fail-under=80
```

The same checks are enforced by `.github/workflows/backend-python.yml`.

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

## Next backend phase

The next phase must migrate **one real server-owned vertical slice** rather than expanding infrastructure horizontally.

The strongest candidate is authentication + one minimal account/profile read/write flow, followed by carefully moving an existing Social Meet operation behind FastAPI while reusing the existing PostgreSQL schema and privacy contracts.

Do not attempt a whole-app backend rewrite.
