# AHA Sync Hub rollback and no-write failure modes

## Current decision

Rollback/no-write requirements are reviewed and test-locked, but rollback implementation is not activated. Manual sync execution remains **NO-GO**, and auto-sync is permanently forbidden.

The related [Supabase/session fallback review](./AHA_SYNC_HUB_SUPABASE_SESSION_FALLBACK_BEFORE_EXECUTION.md) is reviewed, not implemented. Missing Supabase, session, authorization, audit readiness, or rollback readiness must fail closed without remote writes, local-first overwrites, or `localStorage` deletion.

## No-write contract

- Preview and dry-run are read-only.
- A blocked readiness, validation, session, authorization, audit, rollback, schema, or activation gate produces no domain write.
- Failure must not delete or overwrite local-first data.
- Automatic retries, rollback attempts, and execution triggers are forbidden.

## Rollback status

Rollback remains a prerequisite to define and test where activation policy requires it. This document does not implement rollback, claim successful rollback, or grant execution authority.

## Activation status

Execution remains **NO-GO** until every activation gate is GO. Auto-sync remains permanently forbidden.
