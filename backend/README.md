# History GO backend

Status: **Target code surface — production backend not yet fully implemented here.**

The canonical technical architecture is defined in:

- [`docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md`](../docs/HISTORY_GO_TECHNICAL_ARCHITECTURE.md)

Do not use this directory as an excuse to create placeholder services or duplicate existing local-first behavior. Backend code should be added here only when a concrete server-owned domain is implemented end to end.

## Technology decision

The production backend standard is:

- **Python** for server code,
- **FastAPI** for HTTP/API boundaries,
- **Pydantic** for request/response contracts,
- **PostgreSQL** for mutable production state,
- **Supabase** as managed PostgreSQL/Auth/Storage infrastructure where appropriate,
- **pytest** for backend tests,
- Python linting and static type checking as required CI gates once backend code is introduced.

The TypeScript client and Node tooling remain separate concerns. New production backend domains should not be implemented as ad-hoc Node services without an explicit architecture decision.

## Intended structure

Create only the directories required by real implementation work. The target shape is:

```text
backend/
  app/
    api/
      routes/
    auth/
    core/
    domains/
    models/
    schemas/
    services/
    repositories/
    main.py
  tests/
  migrations/
  pyproject.toml
```

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

The backend does **not** automatically own the editorial History GO datasets under `data/`. Places, people, quiz, curriculum and other established canonical content remain JSON/manifest-driven unless a separate data architecture decision changes that.

## First implementation phase

When backend implementation begins, the first PR should establish only the professional foundation:

1. FastAPI application skeleton.
2. Environment/configuration model.
3. Health endpoint.
4. PostgreSQL connection boundary.
5. Supabase Auth token verification boundary.
6. Test setup.
7. Formatter/linter/static type checker.
8. Required backend CI gate.

After that, migrate one real server-owned domain at a time. Do not attempt a whole-app backend rewrite.

## Existing Supabase work

The repository already contains Social Meet PostgreSQL/Supabase migrations and adapter work. That work remains valuable:

- the SQL is standard PostgreSQL,
- RLS remains useful defense in depth,
- existing schemas and privacy contracts should be reused where sound.

The long-term production boundary is nevertheless:

```text
TypeScript client
      ↓
FastAPI
      ↓
server-side domain rules
      ↓
PostgreSQL / Supabase infrastructure
```

Existing direct client→Supabase adapters are therefore treated as current implementation/transitional infrastructure, not a blanket pattern for all new backend functionality.