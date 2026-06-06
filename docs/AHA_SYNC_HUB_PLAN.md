# AHA Sync Hub plan

## Principles

- Sync is manual and gated; opening a page or changing UI state must never trigger a write.
- Existing AHA database connectivity is reused through `HistoryGoAHAAuth`; Sync Hub must not create another client or embed credentials.
- Database and audit writes belong in adapter/repository layers. The dashboard only presents state and results.
- Audit data is minimized: no secrets and no full payload by default.

## Phases

### 1. Manual sync target integration — implemented

The manual adapter uses the existing database target/write contract and requires explicit readiness, target, validation/checklist, and confirmation gates.

### 2. Manual sync audit log writer — implemented

- `ahaManualSyncAuditRepository` writes structured audit records through the existing AHA database connection and `aha_imports` target.
- `executeAhaManualSyncRun()` audits successful, failed, and blocked attempts when the writer is available.
- Audit failure is visible in the adapter result and prevents an unaudited target write from being reported as full success.
- The dashboard does not write audit records directly.
- Audit records contain summaries and checksums rather than full payloads, and sensitive keys are removed defensively.

### 3. Manual sync result history panel — next

Add a read-only result-history panel backed by the audit records. Keep querying in a repository/service layer, expose explicit loading/error/empty states, and do not introduce polling or auto-sync.
