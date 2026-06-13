# AHA Sync Hub audit/history activation requirements

## Current decision

Audit/history activation requirements are reviewed and test-locked. The audit write path is not activated, manual sync execution remains **NO-GO**, and auto-sync is permanently forbidden.

The related [Supabase/session fallback review](./AHA_SYNC_HUB_SUPABASE_SESSION_FALLBACK_BEFORE_EXECUTION.md) defines session/operator fallback requirements. Those requirements are reviewed, not implemented.

## Activation requirements

- A future execution attempt must have fail-closed audit readiness before any domain write.
- Blocked Supabase/session, authentication, authorization, remote readiness, audit, and rollback states must later be representable in audit/history.
- Preview and dry-run must never write audit/history.
- Operator-visible status must distinguish local-only preview from remotely executable readiness.
- Audit/history must not turn a blocked state into execution authority.

## Current limitations

No audit write path, session fallback runtime, rollback implementation, or manual execution is activated by this review. Home remains preview-only, and all automatic execution triggers remain forbidden.
