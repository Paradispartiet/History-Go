# AHA implementation status

## Implemented

- AHA manual sync remains explicitly initiated and gated. There is no auto-sync on page load, Sync Hub open, target selection, or confirmation-modal open.
- Manual sync reuses the existing `HistoryGoAHAAuth` database connection and target writer. No new database client or credentials are introduced.
- The audit trail is frozen at schema version `1.0.0`. Every entry contains `schemaVersion`, `runId`, `recordedAt`/`timestamp`, manual trigger, phase, target metadata, included/excluded modules, counts, readiness/validation/checklist summaries, minimized payload summary, confirmation summary, result/write/rollback statuses, warnings, and errors.
- Audit phases are explicit: valid runs require a durable `attempt` entry before the domain write, followed by an `outcome` or `failed` entry. Gated runs use a `blocked` entry when the audit writer is available.
- Audit is fail-closed by default. A missing writer or failed attempt audit blocks the domain write. A successful domain write followed by a failed outcome audit is returned as `partial_success`, never clean `success`, with explicit `auditStatus` and errors.
- Audit records contain module IDs, counts, item total, payload shape, and a checksum over that minimized shape. Full item payloads and unknown nested fields are not persisted.
- Sensitive keys and common secret-bearing text forms are redacted. Tokens, passwords, credentials, connection strings, raw credentials, and authorization/session data are not part of the stored schema.
- Write guarantees are explicit: confirmation, configured/ready target, ready state, successful validation/checklist, at least one included module, and a payload value for every included module are required before any domain write.
- The adapter creates a write payload from included module IDs only. Excluded modules and unrelated top-level payload fields are never passed to the domain writer.
- A minimal in-memory duplicate guard blocks repeated execution of the same `runId` plus confirmation timestamp during the current runtime. It does not use `localStorage`; durable cross-runtime idempotency remains a future database-contract concern.
- Structured results expose `resultStatus`, `writeStatus`, `auditStatus`, `auditId`, and `rollbackStatus`. Because rollback is not implemented, `rollbackStatus` is always `not_available`; the adapter never claims `rolled_back`.
- The dashboard only formats and renders result metadata. It does not call the database, target writer, or audit repository directly.

## Not implemented

- Auto-sync/activation is intentionally not implemented.
- Result-history browsing is not yet implemented.
- Durable cross-session idempotency is not claimed; the current duplicate guard protects one application runtime only.
- Rollback and partial domain-write semantics are not implemented. `partial_success` is reserved for a completed domain write whose required outcome audit failed.

## Next recommended PR

`feat: add AHA manual sync result history panel`
