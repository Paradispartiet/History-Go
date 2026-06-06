# AHA Sync Hub plan

## Principles

- Sync is manual and gated. Loading a page, opening Sync Hub or a modal, and selecting a target must never trigger a write.
- Existing AHA database connectivity is reused through `HistoryGoAHAAuth`; Sync Hub must not create another client or embed credentials.
- Database and audit writes belong in adapter/repository layers. The dashboard presents state and structured results only.
- Audit data is minimized and versioned: no full payload, credentials, tokens, passwords, connection strings, or unknown object dumps.
- Activation and auto-sync are outside the current plan until manual write guarantees and result history are established.

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

### 3. Manual sync result history panel — next

Add a read-only result-history panel backed by the hardened audit records. Keep querying in a repository/service layer, expose explicit loading/error/empty states, and do not introduce polling, activation, or auto-sync.

### 4. Activation / auto-sync — not introduced

No activation or auto-sync work is included. Any future activation must be a separate, explicitly approved phase after result history and durable operational safeguards.
