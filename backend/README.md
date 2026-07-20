# History GO backend

Status: **The shared FastAPI foundation and four server-owned Social Meet backend slices are implemented: Identity & Public Profile, participant safety/export/deletion, moderation/appeals, and invite abuse-policy preflight. Production Spotmeeting invite creation and discovery remain disabled.**

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
10. Persisted CI diagnostics for Ruff lint, Ruff format and strict mypy failures.

## Server-owned domain: Social Meet Identity & Public Profile

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
- A profile cannot become `discoverable` without the current Social Meet consent version.
- Publication additionally requires explicit confirmation that the user reviewed the public profile preview.
- Public profile reads require an authenticated requester with active Social Meet opt-in.
- `draft`, `private`, `paused`, `blocked_or_suspended` and `deleted` profiles are not returned by the public profile endpoint.
- Blocked, suspended and deleted profile states cannot be overwritten through normal user profile writes.
- GPS, live location, nearby state, distance, last-seen/presence, followers/feed, chat/free text, public visit history and other forbidden privacy fields are rejected recursively.
- Public profile responses never include account IDs, auth subjects, email, phone, device IDs, IP addresses or moderation notes.

The profile migration is:

- `supabase/migrations/002_social_meet_identity_profiles.sql`

It extends `hg_profiles` with opaque Social Meet IDs, visibility, consent and public learning-profile fields while preserving the existing basic History GO profile fields.

## Server-owned domain: Social Meet participant safety, export and deletion

The second migrated slice adds the participant-facing safety and data-rights boundary required before production Spotmeeting can be enabled.

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

The safety migration is:

- `supabase/migrations/003_social_meet_safety.sql`

It adds:

- private `hg_social_meet_blocks` relationships,
- confidential `hg_social_meet_reports`,
- participant-only RLS reads,
- server-authoritative write boundaries,
- a private `deleted_at` Social Meet tombstone,
- indexes and constraints for active block enforcement and report processing.

Safety rules enforced by the backend:

- block and report targets are addressed only by opaque public `profile_id` values;
- active block checks are bidirectional;
- the reusable `ensure_interaction_allowed` domain gate is available for discovery and invite boundaries;
- a blocked profile is never told who blocked it through the block API;
- unknown targets and inaccessible safety records use non-enumerating errors;
- report creation returns only a safe receipt containing report ID, state and timestamp;
- report detail fields are a server-owned allow-list of structured codes, not arbitrary free text;
- nested GPS, live location, nearby, presence, last-seen, chat, public visit history and equivalent forbidden data are rejected before domain execution;
- exports include only the current user's Social Meet identity/profile state, their block records, their submitted reports and participant-scoped invite records;
- exports do not expose raw auth provider IDs or reporter-private fields;
- Social Meet deletion is idempotent and tombstones Social Meet publication data without deleting the Supabase auth account or shared History GO profile fields such as display name, avatar and home place.

## Server-owned domain: moderation and appeals

The moderation slice adds staff-only enforcement and participant-scoped appeal handling without introducing free-text moderation payloads.

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

The moderation migration is:

- `supabase/migrations/004_social_meet_moderation.sql`

It adds server-owned moderation queue, profile restriction, appeal and safety-audit persistence.

Staff authorization is derived only from verified, server-controlled Supabase `app_metadata.history_go_roles` values:

- `history_go_moderator`
- `history_go_admin`

Email addresses, public profiles, browser state, `user_metadata` and generic role fields never grant History GO staff privileges.

Moderation rules include:

- durable report reconciliation into the moderation queue;
- structured queue actions and resolution codes;
- suspension to `blocked_or_suspended`;
- admin-only restore to `paused`, never directly to `discoverable`;
- structured participant appeals without reporter identity or private evidence exposure;
- admin-only appeal decisions;
- structured safety audit without location, presence, free-chat or participant-visible moderator notes.

Concrete implementation details are documented in:

- `docs/HG_SOCIAL_MEET_MODERATION_BACKEND.md`

## Server-owned domain: Spotmeeting invite abuse-policy preflight

The abuse-control slice implements a reusable server-side preflight guard for future durable Spotmeeting invite creation. It does **not** enable production invite delivery by itself.

The policy reuses canonical existing state rather than creating a parallel abuse ledger:

- `hg_profiles` for Social Meet age and publication state;
- `hg_spotmeeting_invites` for rolling volume, duplicate, decline and cancellation evidence;
- `hg_social_meet_blocks` for active suppression and post-block cooldown evidence;
- `hg_social_meet_reports` for confidential report cooldowns and unresolved-report policy tiering;
- the existing interaction safety gate for active blocks and moderation restrictions.

The supporting migration is:

- `supabase/migrations/005_social_meet_abuse_indexes.sql`

It adds query-support indexes only. No new abuse-state source of truth is introduced.

The guard enforces:

- distinct, currently discoverable and consenting sender/recipient profiles;
- the existing block/moderation interaction gate;
- active duplicate suppression by sender, recipient and context;
- rolling one-minute, one-hour and 24-hour rate windows;
- pair-level and recipient-level volume caps;
- stricter limits for new Social Meet profiles and profiles with unresolved reports;
- cooldowns after decline, confidential report, block and repeated cancellation;
- non-enumerating `recipient_unavailable` behavior for private report/block suppression.

The future durable invite service must re-run safety and abuse checks immediately before the authoritative invite insert and protect duplicate creation through the same transaction or equivalent serialization boundary.

Concrete policy details are documented in:

- `docs/HG_SOCIAL_MEET_ABUSE_CONTROLS.md`

## Transitional direct Supabase access

The existing browser adapter remains transitional infrastructure:

- `js/social/HGSocialMeetSupabaseClient.js`
- `js/social/HGSocialMeetAdapter.js`

The identity migration restricts the authenticated browser role so it may continue writing the legacy basic profile fields required by the current client, but it cannot directly self-authorize Social Meet publication or write server-owned consent/fingerprint/visibility fields.

The safety and moderation migrations keep their protected writes behind FastAPI.

The original invite migration still contains transitional participant write policies. Before production Spotmeeting invite operations are enabled, the durable FastAPI invite slice must revoke or supersede direct browser writes for server-owned invite creation and lifecycle transitions.

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

The implemented identity, participant-safety, moderation and abuse-policy slices are prerequisites, not permission to enable production discovery or invite delivery.

The remaining major server-owned prerequisites are:

1. durable Spotmeeting invite creation and lifecycle behind FastAPI, reusing `hg_spotmeeting_invites`;
2. transactional identity, block, moderation, abuse and duplicate revalidation at invite creation/delivery time;
3. participant-scoped invite listing, deterministic state transitions and cross-device synchronization;
4. server-owned preset-message validation and removal of direct browser writes for migrated invite operations;
5. candidate discovery using only explicit, coarse knowledge-profile inputs with stale-result revalidation;
6. expiry/retention enforcement and safe tombstones for retained participant records;
7. frontend migration away from direct client writes for migrated server-owned operations.

Until these prerequisites are complete, local/demo discovery behavior and the existing production safety gates must remain in place.

## Existing Social Meet work that must be reused

The repository already contains:

- `supabase/migrations/001_social_meet.sql` — original PostgreSQL schema + RLS;
- `supabase/migrations/002_social_meet_identity_profiles.sql` — server-owned identity/profile evolution;
- `supabase/migrations/003_social_meet_safety.sql` — participant safety, export and deletion support;
- `supabase/migrations/004_social_meet_moderation.sql` — moderation, restrictions, appeals and audit;
- `supabase/migrations/005_social_meet_abuse_indexes.sql` — query support for invite abuse controls;
- `docs/social-meet-backend.md`;
- `docs/HG_SOCIAL_MEET_IDENTITY_CONTRACT.md`;
- `docs/HG_SOCIAL_MEET_INVITE_BACKEND_CONTRACT.md`;
- `docs/HG_SOCIAL_MEET_BLOCK_REPORT_MODERATION_CONTRACT.md`;
- `docs/HG_SOCIAL_MEET_MODERATION_BACKEND.md`;
- `docs/HG_SOCIAL_MEET_ABUSE_CONTROLS.md`;
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
- History GO staff roles are read only from verified `app_metadata.history_go_roles`.

## Validation

Run from the repository root after installing backend dev dependencies:

```bash
python -m ruff check backend
python -m ruff format --check backend
python -m mypy backend/app
cd backend && python -m pytest --cov=app --cov-report=term-missing --cov-fail-under=80
```

The same checks are enforced by `.github/workflows/backend-python.yml` on Python 3.12 and 3.14. Failed lint, format and typecheck gates persist their diagnostics as workflow artifacts so the exact failure output can be reused during repair work.

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

The next server-owned slice should move the existing **Spotmeeting invite state machine behind FastAPI** while reusing `hg_spotmeeting_invites`, public `profile_id` participant boundaries, the bidirectional interaction safety gate and the abuse-policy preflight defined above.

That slice must make invite creation and lifecycle server-authoritative, add participant-scoped cross-device reads, enforce server-owned preset messages, close the direct-browser-write path for migrated invite operations, and revalidate safety/abuse controls transactionally before durable creation or delivery.

Do not attempt a whole-app backend rewrite.
