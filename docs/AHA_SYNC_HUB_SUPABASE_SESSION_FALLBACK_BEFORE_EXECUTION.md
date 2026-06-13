# AHA Sync Hub Supabase session fallback before execution

## Current decision

- Supabase/session fallback requirements are reviewed, not implemented.
- Manual sync execution remains **NO-GO**.
- The dedicated execution page remains planned, not implemented.
- Home remains preview-only.
- The audit write path remains not activated.
- Rollback implementation remains not activated.
- Auto-sync is permanently forbidden.
- Missing Supabase/session must never delete or overwrite local-first data.
- No Supabase/session-dependent execution may activate before all gates are **GO**.

## Purpose

Session fallback must be defined before execution so that the operator can tell whether remote sync is available and every missing or failed dependency fails closed. A missing session must block execution safely; missing Supabase configuration or availability must block remote writes safely; and local-first data must remain protected.

Preview and dry-run inspection must remain useful without Supabase. Failed remote readiness must not write or delete data. A future audit/history implementation must capture the blocked state, but the audit write path is not active now and this review does not add it.

## Session states

| Status | Requirement meaning |
| --- | --- |
| `unknown` | Session readiness has not been established; execution is blocked. |
| `not_configured` | Session/auth integration is not configured; execution is blocked. |
| `unavailable` | Session service cannot be used; execution is blocked. |
| `anonymous` | An anonymous session exists but has no execution authority. |
| `unauthenticated` | No authenticated user session exists. |
| `authenticated` | Identity is authenticated, but authorization and all other gates still require evaluation. |
| `expired` | The session is expired and cannot authorize execution. |
| `permission_denied` | Identity exists but lacks required authorization. |
| `ready` | Authentication and authorization requirements are satisfied; this state alone does not make execution GO. |
| `blocked_no_go` | Policy or another activation gate explicitly blocks execution. |

These values define a requirements/status model only; they are not a runtime implementation.

## Supabase availability states

| Status | Requirement meaning |
| --- | --- |
| `unknown` | Supabase readiness has not been established; remote execution is blocked. |
| `not_configured` | Supabase integration is not configured. |
| `missing_client` | No usable Supabase client is available. |
| `missing_url` | Required Supabase URL is absent. |
| `missing_key` | Required Supabase key is absent. |
| `unavailable` | Supabase cannot currently provide the required service. |
| `reachable` | Service is reachable, but schema, permission, session, and write readiness remain unproven. |
| `unreachable` | Service cannot be reached. |
| `permission_denied` | Required remote operation is not authorized. |
| `ready` | Required remote dependencies are ready; this state alone does not make execution GO. |
| `blocked_no_go` | Policy or another activation gate explicitly blocks remote execution. |

These values define a requirements/status model only; they are not a runtime implementation.

## Required fallback behavior

| Scenario | Required behavior | Must not happen | Gate impact |
| --- | --- | --- | --- |
| Supabase client missing | Show local preview and a blocked remote state. | Construct a hidden client, write remotely, or alter local data. | E, G, I, J |
| Supabase URL/key missing | Report not configured and block remote execution. | Guess credentials, expose secrets, or attempt a write. | E, G, I, J |
| Supabase unavailable | Preserve local-first data and show the availability failure. | Delete, overwrite, or treat local data as stale. | F, G, I, J |
| Network failure | Fail closed with a bounded, operator-visible error. | Retry automatically, write partially, or erase local state. | F, G, I, J |
| Unauthenticated user | Show authentication required and block execution. | Elevate anonymous/local state into execution authority. | E, G, I, J |
| Expired session | Show session expired and require an explicit future recovery flow. | Auto-execute after refresh or silently continue. | E, F, G, I, J |
| Permission denied | Show authorization blocked without exposing sensitive details. | Retry writes automatically or report readiness. | F, G, I, J |
| Anonymous session | Permit preview only and show no execution authority. | Treat anonymous as authenticated/authorized. | E, G, I, J |
| Remote table unavailable | Block the affected target and identify the dependency. | Create/migrate tables or fall back to destructive local behavior. | F, G, I, J |
| Remote schema mismatch | Block execution and report an actionable compatibility reason. | Coerce an unsafe payload or write against an unknown schema. | F, G, I, J |
| Remote write rejected | Return a failed/blocked result without further writes. | Claim success, auto-retry, or delete local source data. | F, G, H, I, J |
| Audit write unavailable | Block future execution under fail-closed audit policy. | Perform the domain write without required audit readiness. | G, H, I, J |
| Rollback unavailable | Keep execution NO-GO where rollback readiness is required. | Claim rollback, simulate recovery, or start a rollback attempt. | F, G, I, J |
| `localStorage` parse failure | Surface a local-data error and preserve the original stored value. | Clear, replace, normalize, or remotely write the damaged value. | F, G, I, J |
| Activation gates not green | Show `blocked_no_go` and identify outstanding gates. | Let fallback logic convert NO-GO into GO. | E, F, G, H, I, J |

## Preview and dry-run behavior

- Preview must work without Supabase.
- Dry-run target inspection must work without Supabase.
- A dry-run plan may show that the remote target is unavailable.
- Dry-run must not write.
- Dry-run must not call Supabase write APIs.
- Missing Supabase/session must not delete `localStorage`.
- Missing Supabase/session must not hide local counts.
- Missing Supabase/session must show a blocked remote execution state.

## Execution blocking rules

- No execution without an authenticated and authorized session.
- No remote write without Supabase in the `ready` state.
- No audit write without audit readiness.
- No rollback attempt without rollback readiness.
- No fallback may convert **NO-GO** into **GO**.
- No Home action may trigger session-based execution.
- No page-load or session-ready event may trigger execution.
- No auth-ready event may trigger execution.
- No storage event may trigger execution.
- No timer or interval may trigger execution.

## Required operator visibility

A future execution UI must be able to show:

- Supabase configured/not configured;
- session status;
- authentication status;
- authorization status;
- remote readiness status;
- remote write availability;
- audit write availability;
- rollback availability;
- local-only mode;
- blocked reason; and
- next required action.

## Forbidden behavior

- No auto-sync after a session becomes ready.
- No execution on auth-ready.
- No execution on page load.
- No execution on render.
- No execution on storage event.
- No execution on `visibilitychange`.
- No execution by timer or interval.
- No deleting `localStorage` when Supabase is unavailable.
- No deleting `localStorage` when a session is missing.
- No writing audit/history during preview.
- No writing remote data during dry-run.
- No source events.
- No insights creation.
- No publishing.
- No social sharing.

## Activation gate impact

- **Gate E — dedicated execution surface readiness:** the future surface must remain disabled and clearly expose session/remote blockers.
- **Gate F — per-module errors/results:** dependency, permission, schema, and write failures need explicit bounded results.
- **Gate G — no-write safety:** every missing or failed dependency must preserve local-first data and produce no writes/deletes.
- **Gate H — audit/history:** a future audit path must represent blocked states, but that write path is not active now.
- **Gate I — Supabase/session fallback:** this review defines the required state and fallback contract; implementation is not activated.
- **Gate J — tests:** fallback, preview, no-write, no-delete, and no-auto-trigger behavior must be test-locked.

## Required before activation

- Supabase/session fallback requirements reviewed.
- Supabase/session fallback tests added.
- Preview without Supabase test-locked.
- No-write on missing session test-locked.
- No `localStorage` deletion on missing Supabase/session test-locked.
- No auto-sync on auth-ready test-locked.
- Blocked remote execution state documented.
- Operator visibility documented.
- A separate activation PR is still required: `feat: activate manual AHA Sync Hub execution`.

## Recommended next PR

`test: lock Sync Hub Supabase session fallback before execution`
