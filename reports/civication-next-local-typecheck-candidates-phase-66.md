# Phase 66 — Civication next local typecheck candidates audit

## Status

Audit-only Phase 66 after Phase 65 / PR #720 (`js/Civication/systems/day/dayConsequences.js`) is complete. The working baseline still matches the expected post-#720 numbers, and this report identifies one narrow local candidate for Phase 67 without changing runtime code.

No JavaScript code, schemas/globals, data, AHA, UI implementation, CSS, HTML, workflows, package files, manifest files, tests, `TYPESCRIPT_MIGRATION.md`, or the tracked baseline report were changed by this phase.

Untracked `node_modules/` was present at start. It is excluded by `tsconfig.json` and was not deleted or modified for this audit.

## Baseline used

`npm run typecheck:report` regenerated `reports/typecheck-baseline-report.md` with only the timestamp changed. The reported diagnostic counts matched the required post-#720 baseline, so the generated timestamp-only report change was reverted and the baseline file is not part of this diff.

Expected and observed baseline:

| Metric | Count |
| --- | ---: |
| Total diagnostic lines | 1873 |
| Files with diagnostics | 191 |
| `other` | 579 |
| `js/ui/**` | 516 |
| `js/Civication/**` | 464 |
| `js/Civication/ui/CivicationUI.js` | 106 |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | 22 |
| `js/Civication/core/civicationEventEngine.js` | 23 |
| `js/Civication/core/civicationEconomyEngine.js` | 0 |
| `js/profile.js` | 83 |
| `js/state/**` | 16 |
| `TS2339` | 1522 |
| `TS2551` | 137 |
| `TS2322` | 20 |
| `TS2349` | 14 |

## Commands run

```sh
git status --porcelain=v1
git status --porcelain=v1 --untracked-files=no
git log -1 --oneline
test -f .github/workflows/typecheck-baseline.yml
test -f reports/typecheck-baseline-report.md
test -f reports/civication-next-local-typecheck-candidates-phase-62.md
test -f js/Civication/systems/day/dayConsequences.js
cat tsconfig.json | sed -n '1,220p'
npm run typecheck:report
sed -n '1,220p' reports/typecheck-baseline-report.md
git diff -- reports/typecheck-baseline-report.md
git checkout -- reports/typecheck-baseline-report.md
npm run typecheck 2>&1 | grep "js/Civication/" > /tmp/civication-typecheck-phase-66.txt || true
wc -l /tmp/civication-typecheck-phase-66.txt
python3 - <<'PY'
# parsed /tmp/civication-typecheck-phase-66.txt for file and error-code counts
PY
grep -F 'js/Civication/systems/day/dayProgressionController.js' /tmp/civication-typecheck-phase-66.txt
grep -F 'js/Civication/systems/day/dayConsequencesUI.js' /tmp/civication-typecheck-phase-66.txt
grep -F 'js/Civication/systems/civicationDailyTaskGates.js' /tmp/civication-typecheck-phase-66.txt
grep -F 'js/Civication/systems/day/dayPatches.js' /tmp/civication-typecheck-phase-66.txt
nl -ba js/Civication/systems/day/dayProgressionController.js | sed -n '104,132p'
nl -ba js/Civication/systems/day/dayConsequencesUI.js | sed -n '1,95p'
nl -ba js/Civication/systems/civicationMailRuntime.js | sed -n '680,745p'
nl -ba js/Civication/systems/day/dayContacts.js | sed -n '64,72p'
nl -ba js/Civication/systems/day/dayEvents.js | sed -n '372,384p'
nl -ba js/Civication/systems/day/dayFactionMailScoring.js | sed -n '40,52p'
```

## Top Civication files with diagnostics

Full Civication diagnostic extraction found 464 lines across 75 files. Top files by count:

| Diagnostics | File | Audit classification |
| ---: | --- | --- |
| 106 | `js/Civication/ui/CivicationUI.js` | Hotspot; wait |
| 23 | `js/Civication/core/civicationEventEngine.js` | Hotspot/globals; wait |
| 22 | `js/Civication/ui/CivicationMiniSectionsUI.js` | Hotspot; wait |
| 18 | `js/Civication/ui/CivicationDashboardUI.js` | UI/globals plus local unknowns; wait |
| 18 | `js/Civication/ui/CivicationMap.js` | Data globals and DOM narrowing; wait |
| 15 | `js/Civication/systems/civicationDailyMailBuilder.js` | Mail/task globals plus real payload-shape error; wait |
| 14 | `js/Civication/systems/day/dayPatches.js` | Mixed globals, function contract, and local unknowns; wait |
| 13 | `js/Civication/ui/CivicationInboxTopActionUI.js` | UI/globals/DOM; wait |
| 11 | `js/Civication/systems/day/dayConsequencesUI.js` | Local unknowns exist, but wrapper typing also present; second-tier candidate |
| 10 | `js/Civication/systems/civicationMailRuntime.js` | Mostly globals plus two local state fields; wait |
| 10 | `js/Civication/systems/day/dayRuntimeDebugPanel.js` | Runtime debug globals plus function property marker; wait |
| 9 | `js/Civication/ui/CivicationSectionsUI.js` | UI local unknowns plus global export; wait |
| 8 | `js/Civication/systems/civicationCareerOutcomeRuntime.js` | Mail/EventEngine globals and TS2551; wait |
| 8 | `js/Civication/systems/civicationDailyTaskGates.js` | Mail/task/EventEngine globals and TS2551; wait |
| 8 | `js/Civication/ui/CivicationMapModel.js` | UI/model diagnostics; not selected |
| 8 | `js/Civication/ui/CivicationSystemMap.js` | UI/map diagnostics; not selected |
| 6 | `js/Civication/systems/day/dayConsequences.js` | Explicitly out of scope; do not touch |
| 4 | `js/Civication/systems/day/dayProgressionController.js` | Best narrow local candidate despite two remaining globals |

## Local candidates

These diagnostics look like likely local JSDoc/cast cleanups because the current code already treats the values as objects/arrays/state records and uses guarded optional access. They should still be handled in a later code phase, not in this audit.

| File | Line | Code | Diagnostic | Why it looks local | Recommended later phase |
| --- | ---: | --- | --- | --- | --- |
| `js/Civication/systems/day/dayProgressionController.js` | 126 | TS2339 | `Property 'status' does not exist on type 'unknown'.` | `findInboxItemForRow()` returns an inbox element from `window.CivicationState?.getInbox?.()` after an `Array.isArray` guard, and the same function immediately reads `item?.event?.id` / `item?.id`; a local return/item typedef refinement should make `status` visible without runtime changes. | **Phase 67 recommended target** |
| `js/Civication/systems/day/dayProgressionController.js` | 130 | TS2339 | `Property 'resolved' does not exist on type 'unknown'.` | Same local inbox-item path as line 126. Existing logic already checks `inboxItem?.event?.resolved`; a local `event` shape or cast is likely sufficient. | **Phase 67 recommended target** |
| `js/Civication/systems/day/dayConsequencesUI.js` | 12 | TS2339 | `Property 'career_id' does not exist on type 'unknown'.` | `getActivePosition()` is treated as an active-position record. Local state/position typedef would likely clear it, but this file also has wrapper typing diagnostics at lines 128/131/137. | Phase 68+ after `dayProgressionController` |
| `js/Civication/systems/day/dayConsequencesUI.js` | 75-76 | TS2339 | `Property 'trust' does not exist on type 'unknown'.` | `snap?.psyche` is used as a metrics record; local snapshot/psyche typedefs would likely be enough. | Phase 68+ after wrapper audit |
| `js/Civication/systems/day/dayConsequencesUI.js` | 83 | TS2339 | `Property 'flags' does not exist on type 'unknown'.` | `snap?.branch` is already treated as a mail branch record with `flags`; local branch typedef likely enough. | Phase 68+ after wrapper audit |
| `js/Civication/systems/day/dayConsequencesUI.js` | 87-90 | TS2339 | `Property 'integrity'/'visibility'/'economicRoom'/'autonomy' does not exist on type 'unknown'.` | Same local snapshot/psyche metrics record as the trust accesses. | Phase 68+ after wrapper audit |
| `js/Civication/systems/civicationMailRuntime.js` | 717-718 | TS2339 | `Property 'mail_plan_progress'/'mail_system' does not exist on type 'unknown'.` | `inspect()` reads from the existing state object and returns a debug/report object; a local state record cast may be enough. The surrounding file is still dominated by globals and mail/task dependencies, so it is not the next safest file. | Later mail-runtime phase |
| `js/Civication/systems/day/dayContacts.js` | 67 | TS2339 | `Property 'career_id' does not exist on type 'unknown'.` | Single active-position field access through `CivicationState`; likely local active-position cast only. | Small later day-system cleanup |
| `js/Civication/systems/day/dayEvents.js` | 380-381 | TS2339 | `Property 'score'/'stability' does not exist on type 'unknown'.` | Local `getState()` record read with simple scalar defaults. Likely local state typedef/cast only. | Small later day-system cleanup |
| `js/Civication/systems/day/dayFactionMailScoring.js` | 48 | TS2339 | `Property 'activeFaction' does not exist on type 'unknown'.` | Local `getState()` record read and normalized string. | Small later day-system cleanup |
| `js/Civication/systems/day/dayPatches.js` | 687, 763 | TS2339 | `Property 'complete'/'career_id' does not exist on type 'unknown'.` | These individual accesses are local-looking, but the file also has globals, `answer` function-contract diagnostics, and TS2322. | Wait; do not split inside Phase 67 |
| `js/Civication/ui/CivicationDashboardUI.js` | 126, 137, 150, 191, 218, 220 | TS2339 | `id`, `career_id`, `home`, `event`, `title`, `career_name` on `unknown`. | UI data-record casts may be local, but the file mixes UI globals and dashboard integrations. | Later UI-specific phase only |

## Diagnostics that should wait

| File | Line | Code | Diagnostic | Why it should not be touched now |
| --- | ---: | --- | --- | --- |
| `js/Civication/core/civicationEventEngine.js` | 160-201, 1533-1534 | TS2339 | `CivicationMailEngine` missing on `Window & typeof globalThis`. | Explicitly forbidden: do not declare `CivicationMailEngine`; previous dry-run showed TS2551 regression. Also this is a major hotspot. |
| `js/Civication/core/civicationEventEngine.js` | 1004, 1939 | TS2339 | `CivicationTaskEngine` missing on `Window & typeof globalThis`. | Explicitly forbidden: do not declare `CivicationTaskEngine`; global declaration risk. |
| `js/Civication/core/civicationEventEngine.js` | 42 | TS2362/TS2363 | Arithmetic operand typing. | Core event-engine hotspot; not a narrow local unknown-property cleanup. |
| `js/Civication/core/civicationJobs.js` | 323 | TS2769 | No overload matches this call. | Payload/API-shape error; requires contract understanding rather than local cast. |
| `js/Civication/core/civicationJobs.js` | 429, 448 | TS2345 | Offer payload missing `brand_id`, `brand_name`, `brand_type`, `brand_group`, `sector`, `place_id`, `employer_context`. | Real payload-shape/contract diagnostic; should wait. |
| `js/Civication/systems/day/dayPatches.js` | 648, 688, 735, 774 | TS2339 | `getPendingEvent` / `onAppOpen` missing on type `answer`. | Function-contract shape, not a simple local response-field cast. |
| `js/Civication/systems/day/dayPatches.js` | 716, 785, 920 | TS2339 | `CivicationTaskEngine` missing on `Window & typeof globalThis`. | Explicitly forbidden global/task declaration area. |
| `js/Civication/systems/day/dayPatches.js` | 845 | TS2322 | `Type 'boolean' is not assignable to type 'CiviFn'.` | Real function/property contract diagnostic. |
| `js/Civication/systems/day/dayConsequences.js` | 18, 30, 31, 309, 311 | TS2339 | Remaining globals plus local-looking fields in the Phase 65 target. | Explicitly out of scope for Phase 66/67 selection; do not touch `dayConsequences.js`. |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 95, 1016, 1027, 1078-1120, 1371 | TS2339 | `CivicationMailEngine` / `CivicationTaskEngine` globals. | Explicitly risky globals and not local. |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 1260 | TS2322 | Optional `date`, `phase`, `phase_label`, `advances_role_plan` assigned to a required payload type. | Real payload contract; wait. |
| `js/Civication/systems/civicationCareerOutcomeRuntime.js` | 494, 523, 577, 578 | TS2551 | `CivicationEventEngine` missing; suggestion says `CivicationEconomyEngine`. | TS2551 global-name/suggestion area; do not touch in local-cast phase. |
| `js/Civication/systems/civicationDailyTaskGates.js` | 308, 314, 343, 386, 426-428 | TS2339/TS2551 | Task/mail/builder/EventEngine globals. | Dominated by globals and explicitly sensitive task/mail engines. |
| `js/Civication/ui/CivicationMap.js` | 6, 16-27, 49-50, 73, 95-96 | TS2339/TS2362/TS2363 | Map data globals and arithmetic typing. | Data/global declarations and UI/map model area; wait. |
| `js/Civication/ui/CivicationInboxTopActionUI.js` | 194, 197 | TS2339 | `onclick` on `Element`, `closest` on `EventTarget`. | DOM element narrowing in a UI file; not selected for local system phase. |
| `js/Civication/systems/day/dayRuntimeDebugPanel.js` | 296-297 | TS2339 | `_t` missing on type `() => void`. | Function property marker/debug timer typing; separate debug-panel pass, not Phase 67. |

## High-risk / hotspot list

- `js/Civication/ui/CivicationUI.js` — 106 diagnostics; large UI hotspot with many `unknown` reads mixed with broader UI/runtime shape issues.
- `js/Civication/core/civicationEventEngine.js` — 23 diagnostics; core runtime/global hotspot and explicitly contains forbidden `CivicationMailEngine`/`CivicationTaskEngine` global diagnostics.
- `js/Civication/ui/CivicationMiniSectionsUI.js` — 22 diagnostics; UI hotspot with many active-position/offer/home unknown reads.
- `js/Civication/core/civicationJobs.js` — remaining diagnostics are TS2769/TS2345 payload-shape issues and should wait.
- `js/Civication/systems/day/dayPatches.js` — mixed globals, function-contract diagnostics, TS2322, and a few local-looking unknowns; should wait.
- `js/Civication/systems/civicationDailyMailBuilder.js` — mail/task globals and a real TS2322 payload-shape diagnostic.
- `js/Civication/systems/civicationDailyTaskGates.js` — mail/task/EventEngine globals and TS2551 diagnostics.
- `js/Civication/ui/CivicationDashboardUI.js`, `js/Civication/ui/CivicationMap.js`, `js/Civication/ui/CivicationInboxTopActionUI.js`, `js/Civication/ui/CivicationSectionsUI.js` — UI/global/DOM areas; do not use as the next system-local candidate.
- Files dominated by `Window & typeof globalThis`, `typeof globalThis`, missing global declarations, TS2551 suggestions, or TS2304 should wait.

## Phase 67 recommendation

Recommended next concrete file for Phase 67:

`js/Civication/systems/day/dayProgressionController.js`

Reason: it has only four diagnostics in the current Civication typecheck extraction. Two are global export/builder diagnostics that can be left alone, while the two local diagnostics at lines 126 and 130 are both caused by the same inbox-item shape inferred through `findInboxItemForRow()`. A narrow Phase 67 can target only that local inbox item/event typing with JSDoc or local casts, avoid runtime behavior changes, avoid schemas/globals, and avoid the explicitly forbidden `CivicationMailEngine` / `CivicationTaskEngine` declarations.

Expected scope for Phase 67 if accepted:

- Touch only `js/Civication/systems/day/dayProgressionController.js`.
- Fix only the local `inboxItem?.event?.status` and `inboxItem?.event?.resolved` unknown-property diagnostics.
- Do not attempt to declare globals or clear `window.CivicationDailyMailBuilder` / `window.CivicationDayProgression` in the same phase.
- Re-run `npm run typecheck:report` and ensure the GitHub Actions workflow `Typecheck baseline report` remains the final control if it runs.

## Explicit non-changes

This audit did not change:

- JS code or runtime behavior.
- `schemas/civication-globals.d.ts` or any global declarations.
- `reports/typecheck-baseline-report.md` in the final diff.
- AHA files, place/emne files, Lesespor/Leksikon files, `data/fag`, or `data/places`.
- UI/CSS/HTML implementation files.
- Workflows, package files, manifest files, tests, or `TYPESCRIPT_MIGRATION.md`.
