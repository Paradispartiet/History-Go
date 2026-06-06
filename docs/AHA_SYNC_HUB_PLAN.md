# AHA Sync Hub plan

## Principles

- Sync is manual and gated. Loading a page, opening Sync Hub or a modal, selecting a target, browsing history, and opening run details must never trigger a write.
- Existing AHA database connectivity is reused through `HistoryGoAHAAuth`; Sync Hub must not create another client or embed credentials.
- Database and audit writes belong in adapter/repository layers. The dashboard presents state and structured results only.
- Audit data is minimized and versioned: no full payload, credentials, tokens, passwords, connection strings, or unknown object dumps.
- History and details are read-only. Their local UI state is not stored in `localStorage` or written to the database.
- Activation and auto-sync remain outside the plan. Any future write capability requires a separate, explicitly approved phase.

## Phases

### 1. Manual sync target integration — implemented

The manual adapter reuses the existing target/write contract. A domain write requires all of the following:

1. explicit confirmation;
2. a configured and ready target;
3. `ready` readiness status;
4. successful validation and checklist summaries;
5. at least one included module;
6. valid payload data for every included module;
7. a configured audit writer and a successfully persisted attempt entry.

The adapter passes only included modules to the target writer. Excluded modules, unrelated fields, and invalid payloads are not written.

### 2. Manual sync audit writer — implemented

- `ahaManualSyncAuditRepository` writes through the existing AHA database connection and `aha_imports` target.
- Audit schema `1.0.0` explicitly records manual `attempt`, `outcome`, `blocked`, and `failed` phases.
- Valid execution order is `attempt audit → domain write → outcome/failed audit`. Attempt-audit failure is fail-closed and prevents the domain write.
- Blocked runs are audited when the writer is available. Domain failures produce a failed result and a `failed` audit phase when possible.
- A successful domain write whose outcome audit fails is `partial_success`, with `writeStatus: success` and failed `auditStatus`; it is never reported as clean success.
- Missing audit configuration blocks writes by default and returns `auditStatus: not_configured`.
- Audit payload summaries contain only module IDs, counts, total, types, and a checksum of that minimized shape. The repository defensively whitelists the persisted schema and redacts secret-bearing text.
- Attempt and outcome records use phase-specific IDs so the outcome does not overwrite the attempt.
- Rollback is not implemented or claimed; `rollbackStatus` is `not_available` for blocked, successful, and failed runs.
- Duplicate execution of the same `runId` and confirmation timestamp is blocked within the current runtime without using `localStorage`. Durable cross-runtime idempotency requires a later database-level contract.

### 3. Manual sync result history panel — implemented

- The audit repository exposes a bounded, read-only history query using the existing `HistoryGoAHAAuth` client and `aha_imports` records.
- The dashboard renders read-only history rows and explicit empty/error-ready result structures without polling or background sync.
- History browsing does not call the target writer, audit writer, or any database mutation.

### 4. Manual sync history details drawer — implemented

- A selected history run opens in a compact **Manual sync run details** panel with a Close action.
- Details state (`selectedHistoryRunId` and `detailsOpen`) is local to the dashboard runtime and is not persisted.
- A whitelist-based details builder exposes run metadata, statuses, modules, counts, validation/readiness/checklist summaries, minimized payload/confirmation summaries, warnings, errors, and a short result message.
- Full payloads, full item data, unknown object dumps, secrets, tokens, passwords, credentials, and connection strings are never rendered.
- The panel is explicitly read-only. Opening or closing it does not start sync, write an audit entry, mutate database state, or alter the existing confirm/write flow.

### 5. Manual sync retry eligibility preview — next

Add a read-only preview that explains whether a historical run would be eligible for a separately confirmed retry. The preview must not execute a retry, mutate the selected run, write audit state, or weaken the existing manual confirmation and write guarantees.

### 6. Activation / auto-sync — not introduced

No activation or auto-sync work is included. Any future activation must be a separate, explicitly approved phase after durable operational safeguards and explicit product approval.
