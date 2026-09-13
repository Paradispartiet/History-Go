# History GO FastAPI production rollout

Status: **deployment-ready; rollout remains fail-closed until the Render service is created and verified**

## Canonical deployment

History GO frontend remains on GitHub Pages. The server-authoritative Social Meet backend is
the Python/FastAPI application under `backend/` and is declared as the separate Render web
service `history-go-backend` in `render.yaml`.

The existing `history-go-aha-backend` Render service is a different Node/AHA service and must
not own History GO Social Meet state.

## Render service

`history-go-backend` uses:

- Python 3.14.3;
- `backend/` as service root;
- `pip install .`;
- `uvicorn app.main:app --host 0.0.0.0 --port $PORT`;
- `/api/v1/health/ready` as deployment health check;
- the AHA production Supabase project for PostgreSQL and Auth.

The following are intentionally secret/manual Render values and must never be committed:

- `HG_BACKEND_DATABASE_URL`;
- `HG_BACKEND_SUPABASE_PUBLISHABLE_KEY`.

The Supabase URL and non-secret runtime policy values are declared in the Blueprint.

## Initial fail-closed state

A newly created service starts with:

- `HG_BACKEND_SPOTMEETING_INVITE_WRITES_ENABLED=false`;
- `HG_BACKEND_SPOTMEETING_DISCOVERY_ENABLED=false`;
- `HG_BACKEND_SOCIAL_MEET_RETENTION_APPLY_ENABLED=false`.

PostgreSQL also starts with these private feature flags disabled:

- `spotmeeting_discovery`;
- `social_meet_place_status`.

A successful health check therefore proves infrastructure, not participant rollout.

## Production database baseline

The AHA production project already contained the original `001_social_meet.sql` foundation
before tracked Supabase migrations were introduced. On 2026-09-13 the database was audited:
the five foundation tables, RLS policies and triggers matched the repository foundation and
contained no Social Meet participant data.

Migrations 002–010 were then applied and verified through the Supabase migration boundary.
Do not replay `001_social_meet.sql` blindly against production or manually insert rows into
Supabase's migration-history tables.

## Database role

FastAPI uses a direct server-side PostgreSQL connection. Do not put the database owner password
in browser code or repository configuration.

Preferred production setup is a dedicated `history_go_backend` login role with:

- LOGIN;
- BYPASSRLS, because FastAPI is the authoritative server policy boundary;
- no SUPERUSER, CREATEDB, CREATEROLE or REPLICATION;
- CONNECT to the application database;
- USAGE on the required schemas;
- only the table/sequence privileges required by the Social Meet repositories.

Create/rotate the password only when it can be written directly into Render's secret environment.
Do not print or commit the credential.

## Rollout order

1. Create/sync the `history-go-backend` Render service.
2. Add the database URL and Supabase publishable key as Render secrets.
3. Verify `GET /api/v1/health/live`.
4. Verify `GET /api/v1/health/ready` returns HTTP 200 with both database and auth = `ok`.
5. Verify CORS from `https://paradispartiet.github.io`.
6. Enable `HG_BACKEND_SPOTMEETING_INVITE_WRITES_ENABLED` and
   `HG_BACKEND_SPOTMEETING_DISCOVERY_ENABLED` on the server.
7. Configure the History GO frontend with the exact deployed backend URL and FastAPI mode.
8. Smoke-test authenticated profile publication and retrieval.
9. Enable the private PostgreSQL `spotmeeting_discovery` feature flag.
10. Smoke-test knowledge matching and the preset-only invite lifecycle with real test accounts.
11. Enable `social_meet_place_status`.
12. With two opted-in test accounts, prove:
    - one user can choose **Vis meg her i 60 min** for a canonical Place;
    - the second user sees that profile only under **Folk her nå** for the same Place;
    - **Folk å møte** remains independent;
    - **Skjul meg** removes the profile immediately;
    - expiry removes it without creating public visit history;
    - blocks/reports/moderation suppress the profile;
    - no GPS, coordinates, distance, nearby or last-seen data is sent or returned.

Only after these checks should percentage rollout be widened.

## Rollback

Rollback does not require deleting participant data or reverting the schema.

Fastest shutdown order:

1. set `social_meet_place_status.enabled=false`;
2. set `spotmeeting_discovery.enabled=false`;
3. set the two backend deployment kill switches to false;
4. redeploy/restart the backend if environment changes require it.

The frontend must then render backend-disabled states rather than falling back to fake production
candidates or invites.
