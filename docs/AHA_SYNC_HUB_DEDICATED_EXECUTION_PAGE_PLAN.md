# AHA Sync Hub dedicated execution page plan

## Current decision

The dedicated execution page is planned, not implemented. It must be disabled by default. Manual sync execution remains **NO-GO**, Home remains preview-only, and auto-sync is permanently forbidden. This plan does not create `sync.html` or any other execution surface.

## Preconditions

Before execution can be considered, the page must satisfy the [Supabase/session fallback requirements](./AHA_SYNC_HUB_SUPABASE_SESSION_FALLBACK_BEFORE_EXECUTION.md), including authenticated/authorized session readiness, Supabase readiness, local-first preservation, no-write fallback, explicit operator visibility, and test-locked automatic-trigger prohibitions.

Audit readiness and rollback readiness must be explicit and must not be inferred from Supabase/session readiness. The page must stay disabled while any activation gate is not GO.

## Disabled-by-default policy

- Rendering, loading, authentication, session restoration, storage events, visibility changes, timers, and intervals must not execute sync.
- Preview and dry-run remain read-only and usable without Supabase.
- The operator must see blocked reasons and the next required action.
- Home cannot become an execution surface.
- A later implementation still requires separate review, tests, and the explicit activation PR.
