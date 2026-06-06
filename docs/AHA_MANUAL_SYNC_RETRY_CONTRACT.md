# AHA manual sync retry contract

## 1. Purpose and status

This contract is a safety gate that must be accepted before a historical AHA manual sync run can receive real retry capability. It defines the evidence, confirmation, adapter, audit, payload, failure, and UI requirements for a possible future retry implementation.

The existing retry eligibility preview is read-only. `eligible_preview` means only that the recorded evidence is sufficient to prepare a new validation, readiness, and confirmation flow. It is not authorization to write, it is not a stored confirmation, and it must never execute a retry.

This documentation does not implement retry. Until the complete contract is implemented and tested, no UI or adapter path may give retry write authority.

The governing invariant is:

> one user action → one confirmation → one run → one audit trail

A retry is always a new manual run. It must have its own `retryRunId`, confirmation, current checks, structured result, and audit trail while retaining an explicit link to the immutable `originalRunId`.

## 2. Definitions

- **Original run:** the historical manual sync run being considered for retry. Its `runId` becomes `originalRunId` in the retry flow.
- **Retry run:** one newly confirmed manual attempt. Its new and unique run identifier is `retryRunId`.
- **Eligibility preview:** a read-only assessment of historical evidence. Only `eligible_preview` permits the UI to prepare a retry confirmation; it does not permit execution.
- **Current checks:** validation, readiness, checklist, target, adapter, reconstruction, security, and audit-writer checks performed for the prospective retry, rather than trusted solely from historical state.
- **Safe reconstruction:** rebuilding the retry payload from the current validated source, or using an explicitly approved and redacted safe snapshot under a separate payload-snapshot contract.

## 3. When retry may be considered

A run may reach retry confirmation preparation only when **all** of the following are true:

1. The original run exists in audit history, and the audit entry or correlated attempt/outcome records are complete, internally consistent, readable, and free of unresolved security or redaction warnings.
2. The original `resultStatus` is exactly `failed` or `partial_success`. A `success` or `blocked` result is not retryable.
3. The original run has a valid `runId`; that value is preserved as `originalRunId`.
4. The original target was configured, the same intended target can be identified unambiguously, and the target is still `configured` when retry is prepared and executed.
5. The target adapter explicitly declares support for the retry contract.
6. `includedModules` exists, contains at least one valid module identifier, and can be checked against the current source and target contract.
7. `totalItems` is greater than zero, and `itemCounts` is consistent with the included modules and total.
8. A minimized payload summary exists and contains enough non-secret metadata to support safe reconstruction and comparison.
9. The historical validation summary has zero errors, or a new validation over the safely reconstructed current payload passes. This exception never makes an original `blocked` run retryable; blocked runs remain blocked from retry.
10. Historical readiness is `ready`, or a new readiness check passes for the current source, payload, target, adapter, and audit dependencies.
11. Any required current checklist passes.
12. The read-only retry eligibility preview returns `eligible_preview` and exposes no unresolved blocker.
13. The original payload can be reconstructed safely under section 7.
14. Any relevant partial-write or rollback state is understood well enough to prevent duplicate or contradictory writes.
15. The audit log writer can durably write both the retry attempt and its outcome or failure record.
16. The user completes a new, explicit, manual retry confirmation that applies to exactly one retry run.

Eligibility must be re-evaluated when preparing the confirmation and again immediately before execution. Historical eligibility is not a durable grant: if the target, source, payload, validation, readiness, adapter support, security state, rollback state, or audit availability changes, the retry must fail closed.

## 4. When retry must be blocked

Retry must be blocked when **any** of the following is true:

- The original `resultStatus` is `success`.
- The original run is `blocked`, including a run blocked because of validation errors. A future corrected sync must be prepared as a new manual sync, not represented as a retry of a blocked write attempt.
- The original run or correlated audit records do not provide a valid `runId`/`originalRunId`.
- The original target status is `not_configured`.
- The target is no longer `configured`, is unavailable, is ambiguous, or no longer matches the intended target contract.
- `includedModules` is missing or empty.
- `totalItems` is zero or is inconsistent with the available counts.
- `payloadSummary` is missing, unsafe, inconsistent, or insufficient for controlled reconstruction.
- An audit entry required to understand the run is incomplete, corrupt, contradictory, or cannot be correlated safely.
- An audit entry has an unresolved redaction or security warning.
- The original payload cannot be reconstructed safely.
- A relevant rollback or partial-write outcome is unresolved, including uncertainty about which items were committed.
- The user does not complete the new manual retry confirmation, cancels it, or the confirmation no longer matches the proposed retry.
- The target adapter does not explicitly support retry.
- The audit log writer is unavailable or cannot durably write the retry attempt and outcome/failure records.
- Current validation, readiness, checklist, target, security, reconstruction, or adapter checks fail.
- The eligibility preview does not return `eligible_preview` or contains blockers.
- A duplicate retry execution or reused confirmation is detected.

A blocked retry must not call the target writer. If the audit writer is safely available, the blocked decision may be recorded as a minimized retry audit event; inability to record a blocked decision must never be used as a reason to proceed with the write.

## 5. No automatic retry

Auto-retry is never permitted. No retry may be initiated by:

- page load or reload;
- opening Sync Hub or history;
- opening or closing the history details drawer;
- selecting or changing a target;
- opening a modal or retry confirmation preview;
- receiving a failed or `partial_success` sync result;
- a timer, schedule, queue, polling loop, background task, service worker, or application resume;
- reconstruction, validation, readiness, checklist, or eligibility-preview completion.

There is no scheduled retry and no background retry. Preparing or viewing retry information remains read-only. Every retry requires one deliberate user action, one fresh confirmation, one new run, and one linked audit trail.

## 6. Retry confirmation requirements

Retry requires a dedicated confirmation flow separate from the original run's confirmation. Before the user can confirm, the UI must show:

- a minimized summary of the original run and its `originalRunId`;
- the retry eligibility status and all reasons or blockers;
- the intended target and current target status;
- included and excluded modules, item counts, and `totalItems`;
- validation, readiness, checklist, reconstruction, rollback, and partial-write warnings, errors, or blockers;
- a clear statement that the proposed action is a manual retry of the identified original run;
- a clear statement that confirmation authorizes only one new retry run.

The user must explicitly acknowledge the retry relationship and confirm the action manually. Opening the confirmation UI, selecting the target, viewing eligibility, or having confirmed the original run is not confirmation.

The confirmation must be bound to the proposed `retryRunId`, `originalRunId`, target, modules, counts, payload-summary identity/checksum, and current check summaries. A material change invalidates it and requires a new confirmation.

Confirmation is single-use, applies only to one retry run, and must not be stored permanently. It must not be written to `localStorage`, reused after cancellation or execution, or treated as durable authorization across page loads or application sessions. Audit may retain only the minimized confirmation summary required by section 8, never secret input or an unrestricted UI-state dump.

## 7. Payload and reconstruction contract

Retry must not send an uncontrolled copy of an old payload directly to the target writer. Historical payload summaries are evidence and comparison metadata, not write payloads.

A retry payload must be produced through exactly one approved path:

1. use the minimized safe payload summary to identify scope, then reconstruct data from the current validated source; or
2. use a stored payload snapshot only when a separate contract explicitly classifies the snapshot as safe, redacted, integrity-checked, access-controlled, version-compatible, and approved for retry.

The first path is the default. Reconstructed data must pass the current payload schema, module, count, validation, readiness, checklist, target, and security checks. Differences from the historical summary must be surfaced before confirmation and may invalidate eligibility.

The second path is unavailable unless its complete snapshot contract exists. Merely finding serialized historical data, an object dump, cached UI state, or an audit record is not approval to reuse it.

If the payload cannot be reconstructed safely, retry is blocked. Full payloads, item dumps, credentials, tokens, passwords, connection strings, authorization/session data, and other secrets must not be introduced into eligibility, confirmation, history, details, or retry audit records.

## 8. Retry audit log contract

A retry must create a new audit trail linked to, but not overwriting or mutating, the original run's audit trail. At minimum, the retry audit contract records:

- `retryRunId`;
- `originalRunId`;
- `timestamp` (and the repository's canonical recorded-at field when applicable);
- `trigger: "manual_retry"`;
- `target`;
- `targetStatus`;
- `includedModules`;
- `excludedModules`;
- `itemCounts`;
- `totalItems`;
- minimized retry-eligibility status, reasons, and blockers;
- validation, readiness, and checklist summaries;
- a minimized, single-use confirmation summary;
- `resultStatus`;
- `writeStatus`;
- `rollbackStatus`;
- warnings;
- errors.

The audit should also retain the applicable audit schema version, retry phase, payload-summary identity/checksum, adapter/reconstruction mode, and `auditStatus` where the established audit schema supports them.

The adapter must durably write an `attempt` before a target write and then write an `outcome` or `failed` record. A blocked retry may use a `blocked` phase when safe audit writing is available. Attempt and outcome records must be independently identifiable while sharing the same `retryRunId` and `originalRunId` relationship.

Retry audit data must not store secrets and must not dump the full payload by default. It must use a versioned whitelist and minimized summaries. Unknown nested objects and unrestricted exception, request, response, adapter, or payload dumps are prohibited.

Both retry attempt and retry outcome should be visible in history. The details drawer should be able to show the original-to-retry and retry-to-original relationship without exposing full payloads or secrets. A retry must never overwrite the original history entry.

## 9. Target and adapter requirements

Retry remains an adapter/repository responsibility and must not write through the dashboard directly. Before retry capability is enabled, the target adapter must:

- explicitly advertise support for this retry contract and its contract/schema version;
- accept the new retry context containing `retryRunId` and `originalRunId`;
- reject retry when the target is not currently `configured` and ready;
- reject retry when the original run is not eligible or current checks invalidate eligibility;
- accept only safely reconstructed and currently validated included-module data;
- return a structured result containing the retry relationship and explicit result, write, audit, and rollback statuses;
- write the required retry attempt before the target write and the outcome/failure afterward through the audit writer/repository;
- fail closed if the attempt cannot be audited;
- avoid any dashboard-owned database write or newly embedded target client;
- never enable auto-sync or auto-retry.

A generic manual-sync execution function is not, by itself, retry support. The future implementation must make the retry context, checks, confirmation, reconstruction, audit relationship, and failure semantics explicit rather than silently routing historical state into a normal write call.

## 10. Failure, partial success, and rollback behavior

- A successful retry must report its own `retryRunId` and link to `originalRunId` in both its structured result and audit trail.
- A failed retry must be reported and audit-logged clearly as a failure of the retry run; it must not mutate the original run's result.
- `partial_success` is permitted only when an explicit partial-failure contract identifies what succeeded, what failed, whether another retry is safe, and how duplicate writes are prevented. Existing audit-write partial semantics may be represented only as defined by the established manual-sync audit contract.
- `rollbackStatus` must reflect verified behavior. It must never claim `rolled_back` unless an actual rollback completed and durable evidence supports that claim.
- If a retry domain write succeeds but its required outcome audit fails, the result must not be reported as clean `success`. It must expose the write/audit disagreement, normally as `partial_success` under the established audit guarantee, with explicit warnings and errors.
- If the attempt audit fails, no target write may occur.
- If the write result is ambiguous, the retry must fail closed for further retry preparation until reconciliation resolves what was written.
- A retry must not conceal, normalize away, or automatically re-run failures.

## 11. Future UI rules

A future retry UI may:

- show **Retry eligibility**;
- show **Prepare retry** or **Retry confirmation** when preparation is permitted;
- display current blockers, warnings, checks, target, modules, and counts;
- display `originalRunId` and the proposed or completed `retryRunId` relationship;
- state prominently that retry is manual and single-run.

A future retry UI must not:

- show or enable a functioning **Retry now** action until the full contract is implemented and verified;
- imply that `eligible_preview` is execution approval;
- hide blockers or unresolved partial/rollback state;
- display full payloads, item dumps, secrets, credentials, or unrestricted audit objects;
- trigger execution from history, details, target selection, modal opening, or any other passive interaction;
- retain a permanent confirmation.

Until a later implementation PR satisfies this contract, retry-related controls are previews only and have no write authority.

## 12. Explicitly out of scope for this documentation PR

This PR must not:

- add a retry button or functioning **Retry now** control;
- implement a retry flow or retry execution;
- call `executeAhaManualSyncRun`;
- change the target adapter, dashboard, state machine, database, repository, or database client;
- change tests or runtime behavior;
- write an audit record or `localStorage` value;
- start a sync or enable auto-sync/auto-retry;
- connect a new target or create a new database client.

The next recommended increment is a read-only, non-executing retry confirmation preview. Actual retry authority must come in a later, separately reviewed change after the preview and all adapter/audit/reconstruction safeguards are in place.
