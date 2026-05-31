# Phase 66 — audit next Civication local typecheck candidates

## Status

Phase 66 is an audit-only pass after Phase 65 / PR #720, which targeted `js/Civication/systems/day/dayConsequences.js`. No JavaScript, runtime behavior, schemas/globals, data, AHA files, UI, CSS, HTML, package files, workflow files, manifest files, tests, `TYPESCRIPT_MIGRATION.md`, or baseline files are intentionally changed by this phase.

Recommended Phase 67 target: **`js/Civication/systems/day/dayProgressionController.js`**.

## Baseline used

`npm run typecheck:report` was run before the audit. `reports/typecheck-baseline-report.md` matched the requested post-Phase-65 / PR #720 baseline values:

- Total diagnostics: 1873
- Files with diagnostics: 191
- `other`: 579
- `js/ui/**`: 516
- `js/Civication/**`: 464
- `js/Civication/ui/CivicationUI.js`: 106
- `js/Civication/ui/CivicationMiniSectionsUI.js`: 22
- `js/Civication/core/civicationEventEngine.js`: 23
- `js/Civication/core/civicationEconomyEngine.js`: 0
- `js/profile.js`: 83
- `js/state/**`: 16
- TS2339: 1522
- TS2551: 137
- TS2304: 70
- TS2322: 20
- TS2349: 14

The Civication-only capture contained 464 diagnostic lines.

## Commands run

```bash
git status --porcelain=v1
git status --porcelain=v1 --untracked-files=no
git log -1 --oneline
test -f .github/workflows/typecheck-baseline.yml
test -f reports/typecheck-baseline-report.md
test -f reports/civication-next-local-typecheck-candidates-phase-62.md
test -f js/Civication/systems/day/dayConsequences.js
cat tsconfig.json | sed -n '1,220p'
npm run typecheck:report
npm run typecheck 2>&1 | grep "js/Civication/" > /tmp/civication-typecheck-phase-66.txt || true
wc -l /tmp/civication-typecheck-phase-66.txt
git diff --name-only
```

Start-control commit: `15c85c9 Phase 66 audit Civication local typecheck candidates`.

Start-control note: `node_modules/` was present as an untracked directory. It was not deleted or modified; `tsconfig.json` includes only `js/**/*.js`, `scripts/**/*.js`, root `*.js`, and schema paths while explicitly excluding `node_modules`, and the tracked tree was clean before the report generation step.

## Top Civication files by diagnostics

| Diagnostics | File |
| ---: | --- |
| 106 | `js/Civication/ui/CivicationUI.js` |
| 23 | `js/Civication/core/civicationEventEngine.js` |
| 22 | `js/Civication/ui/CivicationMiniSectionsUI.js` |
| 18 | `js/Civication/ui/CivicationDashboardUI.js` |
| 18 | `js/Civication/ui/CivicationMap.js` |
| 15 | `js/Civication/systems/civicationDailyMailBuilder.js` |
| 14 | `js/Civication/systems/day/dayPatches.js` |
| 13 | `js/Civication/ui/CivicationInboxTopActionUI.js` |
| 11 | `js/Civication/systems/day/dayConsequencesUI.js` |
| 10 | `js/Civication/systems/civicationMailRuntime.js` |
| 10 | `js/Civication/systems/day/dayRuntimeDebugPanel.js` |
| 9 | `js/Civication/ui/CivicationSectionsUI.js` |
| 8 | `js/Civication/systems/civicationCareerOutcomeRuntime.js` |
| 8 | `js/Civication/systems/civicationDailyTaskGates.js` |
| 8 | `js/Civication/ui/CivicationMapModel.js` |
| 8 | `js/Civication/ui/CivicationSystemMap.js` |
| 6 | `js/Civication/core/civicationState.js` |
| 6 | `js/Civication/systems/civicationBrandJobProgression.js` |
| 6 | `js/Civication/systems/day/dayConsequences.js` |
| 6 | `js/Civication/utils/storyResolver.js` |

## Local candidates

These diagnostics look like possible local JSDoc/cast candidates because the failing access is on an `unknown` value, a local response/status object, or a value already treated by existing code as a structured object/array. They do not require schema/global declarations or runtime semantics to investigate further.

| File | Line | Error | Diagnostic | Why it looks local | Recommended later phase |
| --- | ---: | --- | --- | --- | --- |
| `js/Civication/systems/day/dayProgressionController.js` | 126 | TS2339 | Property `status` does not exist on type `unknown`. | `findInboxItemForRow()` already returns a local inbox item shape, and the existing code reads `status` only for normalization/comparison. A local inbox-item typedef/cast should describe the object without runtime changes. | **Phase 67** |
| `js/Civication/systems/day/dayProgressionController.js` | 130 | TS2339 | Property `resolved` does not exist on type `unknown`. | Same local inbox item/event object as line 126; the code only checks a boolean-like resolved flag. | **Phase 67** |
| `js/Civication/systems/day/dayConsequencesUI.js` | 12 | TS2339 | Property `career_id` does not exist on type `unknown`. | Active-position access is immediately normalized as a local career id string; a local active-position typedef/cast looks mechanical. | Later day UI cleanup after wrapper diagnostics are separated |
| `js/Civication/systems/day/dayConsequencesUI.js` | 75 | TS2339 | Property `trust` does not exist on type `unknown`. | Snapshot data is already consumed as a local psyche snapshot object with trust/integrity/visibility/economic/autonomy fields. | Later day UI cleanup after wrapper diagnostics are separated |
| `js/Civication/systems/day/dayConsequencesUI.js` | 83 | TS2339 | Property `flags` does not exist on type `unknown`. | Mail branch state has a local fallback object with `flags`, so a local branch-state typedef/cast should be enough in isolation. | Later day UI cleanup after wrapper diagnostics are separated |
| `js/Civication/systems/civicationMailRuntime.js` | 717 | TS2339 | Property `mail_plan_progress` does not exist on type `unknown`. | `getState()` is used as a local state bag and these are direct state fields; a local state typedef could likely cover them. | Later mail-runtime cleanup only if globals remain out of scope |
| `js/Civication/systems/civicationMailRuntime.js` | 718 | TS2339 | Property `mail_system` does not exist on type `unknown`. | Same local state bag as line 717. | Later mail-runtime cleanup only if globals remain out of scope |
| `js/Civication/systems/civicationRoleStarter.js` | 149 | TS2339 | Property `stability` does not exist on type `unknown`. | Looks like a local outcome/state object read for a scalar field; likely local JSDoc/cast once the surrounding file is checked. | Later small systems cleanup |
| `js/Civication/systems/day/dayEvents.js` | 380 | TS2339 | Property `score` does not exist on type `unknown`. | Existing code treats the value as an event scoring object; likely local object-shape JSDoc if no payload contract issue appears nearby. | Later day-events cleanup |
| `js/Civication/systems/day/dayEvents.js` | 381 | TS2339 | Property `stability` does not exist on type `unknown`. | Same local scoring object as line 380. | Later day-events cleanup |
| `js/Civication/systems/day/dayContacts.js` | 67 | TS2339 | Property `career_id` does not exist on type `unknown`. | Active-position style career-id read; likely local active-position typedef/cast. | Later small day-system cleanup |
| `js/Civication/systems/day/dayFactionMailScoring.js` | 48 | TS2339 | Property `activeFaction` does not exist on type `unknown`. | Local state/context object field access; likely local if the surrounding scoring API is already runtime-stable. | Later faction scoring cleanup |
| `js/Civication/ui/CivicationDashboardUI.js` | 126 | TS2339 | Property `id` does not exist on type `unknown`. | In isolation this is a local offer/item object read, but the file also has UI/global diagnostics. | Later dedicated UI pass, not Phase 67 |

## Diagnostics that should wait

| File | Line | Error | Diagnostic | Why not touch now |
| --- | ---: | --- | --- | --- |
| `js/Civication/core/civicationEventEngine.js` | 160 | TS2339 | Property `CivicationMailEngine` does not exist on type `Window & typeof globalThis`. | Global/window declaration area; explicitly do not declare `CivicationMailEngine`. |
| `js/Civication/core/civicationEventEngine.js` | 1004 | TS2339 | Property `CivicationTaskEngine` does not exist on type `Window & typeof globalThis`. | Global/window declaration area; explicitly do not declare `CivicationTaskEngine`. |
| `js/Civication/core/civicationEventEngine.js` | 2069 | TS2551 | Property `CivicationEventEngine` does not exist on type `Window & typeof globalThis`. Did you mean `CivicationEconomyEngine`? | TS2551 global-name suggestion; previous dry-runs warned against this category. |
| `js/Civication/core/civicationJobs.js` | 323 | TS2769 | No overload matches this call. | Payload/object-shape mismatch; likely requires contract/data semantics rather than a local cast. |
| `js/Civication/core/civicationJobs.js` | 429 | TS2345 | Argument is missing brand/place/employer fields required by the parameter type. | Real payload-shape contract issue; should not be hidden in a local migration. |
| `js/Civication/core/civicationJobs.js` | 448 | TS2345 | Argument is missing brand/place/employer fields required by the parameter type. | Same payload-shape contract issue as line 429. |
| `js/Civication/systems/day/dayPatches.js` | 373 | TS2551 | Property `CivicationEventEngine` does not exist on type `Window & typeof globalThis`. Did you mean `CivicationEconomyEngine`? | TS2551 global-name suggestion in a mixed patch file. |
| `js/Civication/systems/day/dayPatches.js` | 648 | TS2339 | Property `getPendingEvent` does not exist on type `answer`. | Existing `answer` type appears wrong or too narrow; this is API-shape review, not a simple `unknown` access. |
| `js/Civication/systems/day/dayPatches.js` | 687 | TS2339 | Property `complete` does not exist on type `unknown`. | Local-looking by itself, but this file is a hotspot with globals, `answer` API-shape diagnostics, and function-contract issues. |
| `js/Civication/systems/day/dayPatches.js` | 845 | TS2322 | Type `boolean` is not assignable to type `CiviFn`. | Function/payload contract mismatch; not safe for a local property-access-only phase. |
| `js/Civication/systems/day/dayConsequences.js` | 18 | TS2339 | Property `role_scope` does not exist on type `unknown`. | Phase 65 / PR #720 just targeted this file; do not touch it in the next audit-selected phase. |
| `js/Civication/systems/day/dayConsequencesUI.js` | 128 | TS2339 | Property `__civiConsequencesWrapped` does not exist on type `never`. | Wrapper/function narrowing issue; riskier than simple unknown property access. |
| `js/Civication/systems/day/dayConsequencesUI.js` | 137 | TS2740 | Function wrapper object is missing `Window` properties. | Function/window shape mismatch; not a simple local response-object cast. |
| `js/Civication/systems/day/dayRuntimeDebugPanel.js` | 59 | TS2339 | Property `CiviMailPlanBridge` does not exist on type `Window & typeof globalThis`. | File is dominated by globals/window declarations. |
| `js/Civication/systems/day/dayRuntimeDebugPanel.js` | 296 | TS2339 | Property `_t` does not exist on type `() => void`. | Function augmentation/timer handle shape, not a local response object. |
| `js/Civication/systems/civicationCareerOutcomeRuntime.js` | 494 | TS2551 | Property `CivicationEventEngine` does not exist on type `Window & typeof globalThis`. Did you mean `CivicationEconomyEngine`? | TS2551 global-name suggestion; do not address through globals/schema here. |
| `js/Civication/systems/civicationDailyTaskGates.js` | 308 | TS2339 | Property `CivicationTaskEngine` does not exist on type `Window & typeof globalThis`. | Explicitly forbidden global family for this audit. |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 1260 | TS2322 | Local slot object has optional `date`/`phase` where required fields are expected. | Real object-contract mismatch; needs API-shape review. |
| `js/Civication/ui/CivicationMap.js` | 13 | TS2339 | Property `getAttribute` does not exist on type `EventTarget`. | DOM element narrowing in a UI file; wait for a dedicated UI pass. |
| `js/Civication/ui/CivicationDashboardUI.js` | 61 | TS2339 | Property `CivicationMiniSectionsUI` does not exist on type `Window & typeof globalThis`. | UI global/window declaration area; not a local system-file candidate. |

## High-risk / hotspot list

Defer these for now:

- `js/Civication/ui/CivicationUI.js` — 106 diagnostics; large UI hotspot with many unknown object, DOM, and global accesses.
- `js/Civication/core/civicationEventEngine.js` — 23 diagnostics; core engine hotspot dominated by globals/window declarations, including mail/task engine globals that should not be declared here.
- `js/Civication/ui/CivicationMiniSectionsUI.js` — 22 diagnostics; UI hotspot despite many local-looking unknown reads.
- `js/Civication/ui/CivicationDashboardUI.js` — 18 diagnostics; mixed UI globals and unknown reads, better for a dedicated UI pass.
- `js/Civication/ui/CivicationMap.js` — 18 diagnostics; map globals plus DOM/EventTarget narrowing and arithmetic issues.
- `js/Civication/core/civicationJobs.js` — remaining diagnostics are `TS2769`/`TS2345` payload-form issues and should wait.
- `js/Civication/systems/day/dayPatches.js` — mixed globals, `answer` API-shape diagnostics, `unknown` reads, and a `TS2322` function-contract issue.
- `js/Civication/systems/day/dayRuntimeDebugPanel.js` — mostly globals/window declarations and function augmentation diagnostics.
- `js/Civication/systems/civicationDailyTaskGates.js` — includes forbidden `CivicationTaskEngine`/`CivicationMailEngine` globals and TS2551 global suggestions.
- `js/Civication/systems/civicationDailyMailBuilder.js` — mixed forbidden globals, TS2551 global suggestions, and a real `TS2322` slot object contract.
- `js/Civication/systems/civicationCareerOutcomeRuntime.js` and `js/Civication/systems/civicationMailRuntime.js` — dominated by global/window/TS2551 diagnostics despite a few local-looking state reads.
- `js/Civication/systems/day/dayConsequences.js` — just handled by Phase 65 / PR #720; do not select again for Phase 67.

## Phase 67 recommendation

Pick **`js/Civication/systems/day/dayProgressionController.js`** for Phase 67.

Why this is the safest next concrete candidate:

1. It is outside the large UI/core hotspots and outside the forbidden Phase 63–65 files (`civicationDebateEngine.js`, `civicationMailEngine.js`, and `dayConsequences.js`).
2. It has only 4 diagnostics total.
3. The actionable local part is exactly 2 adjacent `TS2339` diagnostics on the same local inbox item/event shape: `status` at line 126 and `resolved` at line 130.
4. The existing file already defines local `DayProgRecord`, `DayProgRuntimeItem`, and related typedefs, so a follow-up phase can likely add or reuse a narrow local inbox item/event typedef without runtime behavior changes.
5. The two remaining diagnostics in the file are `Window & typeof globalThis` export/dependency globals (`CivicationDailyMailBuilder` and `CivicationDayProgression`). Phase 67 should either leave those untouched or use only local casts if needed; it should not edit `schemas/civication-globals.d.ts`.
6. It does not require declaring `CivicationMailEngine` or `CivicationTaskEngine`, touching `CivicationCalendar?: any`, changing data, AHA, place/emne, Lesespor/Leksikon, CSS, HTML, packages, workflows, tests, or the baseline report.

## Explicit non-changes

This phase does not intentionally change any JS code, runtime behavior, schemas/globals, data, AHA files, UI, CSS, HTML, workflows, package files, manifest files, tests, `TYPESCRIPT_MIGRATION.md`, or `reports/typecheck-baseline-report.md`. The only intended diff is this audit report:

- `reports/civication-next-local-typecheck-candidates-phase-66.md`
