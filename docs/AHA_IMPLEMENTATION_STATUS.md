# AHA implementation status

## Implemented

- AHA manual sync remains explicitly initiated and gated. There is no auto-sync on page load, Sync Hub open, target selection, confirmation-modal open, history open, or details open.
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
- Manual sync history is available through a read-only reader that reuses the existing audit repository and database connection. It does not poll, sync, write audit entries, or write database state.
- A read-only **Manual sync run details** panel can open one selected history run and can be closed without persisting UI state. The selection exists only in dashboard memory.
- History details are built through an explicit whitelist. They expose audit/status metadata, modules, counts, readiness/validation/checklist summaries, minimized payload summary, confirmation summary, warnings, errors, and a short result message when available.
- The details panel never renders a full payload, full item data, secrets, tokens, passwords, credentials, or connection strings. Unknown fields and nested object dumps are excluded.
- Opening or closing history details does not change the existing confirmation, sync, domain-write, or audit-write flow.
- A read-only retry eligibility preview exists for historical runs. Its `eligible_preview` state is informational only and cannot execute retry, persist confirmation, mutate the selected run, or write audit/database state.
- The manual sync retry contract is documented in [`AHA_MANUAL_SYNC_RETRY_CONTRACT.md`](./AHA_MANUAL_SYNC_RETRY_CONTRACT.md). It defines eligibility and blockers, fresh confirmation, `originalRunId` → `retryRunId` linkage, safe payload reconstruction, adapter support, attempt/outcome audit, failure/partial/rollback semantics, UI limits, and the prohibition on auto-retry.
- Sync remains manual and gated: one deliberate user action, one confirmation, one run, and one audit trail. No retry contract or preview grants write authority.
- The AHA Sync Hub operator UI is simplified into a top status summary, a primary manual action area, visible manual sync history, and on-demand technical details.
- **Advanced diagnostics** keeps dry-run, validation, readiness, minimized payload sample, checklist, target internals, audit preview, adapter/state-machine status, run internals, and retry eligibility reasons out of the main operator path. Its open/closed state is local UI state and is never persisted.
- Critical blockers remain visible outside Advanced diagnostics, including validation errors, blocked readiness, missing target or audit configuration, audit/write failures, missing required confirmation, and a failed last run.
- The confirmation view now prioritizes what will be synced, target, module/item totals, blockers or warnings, and audit status while preserving the existing gates.
- This simplification changes UI organization only. The adapter, state machine, target contract, database write, audit writer, payload written, retry execution, and confirmation rules are unchanged. Auto-sync remains absent.

## Not implemented

- Auto-sync/activation and auto-retry are intentionally not implemented. There is no page-load, history-open, details-open, target-select, modal-open, failed-result, scheduled, or background retry trigger.
- Retry execution and retry confirmation preview are not implemented. The existing eligibility preview remains read-only.
- Durable cross-session idempotency is not claimed; the current duplicate guard protects one application runtime only.
- Rollback and partial domain-write semantics are not implemented. `partial_success` is reserved for a completed domain write whose required outcome audit failed.

## Next recommended PR

`chore: review AHA Home dashboard information hierarchy`
