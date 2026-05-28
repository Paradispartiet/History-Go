# Phase 62 — audit next Civication local typecheck candidates

## Status

Phase 62 is an audit-only pass after Phase 61 / PR #690, which targeted `js/Civication/systems/civicationLifeMailRuntime.js`. No JavaScript, runtime behavior, schemas/globals, data, AHA files, UI, CSS, HTML, package files, workflow files, or baseline files are intentionally changed by this phase.

Recommended Phase 63 target: **`js/Civication/systems/civicationDebateEngine.js`**.

## Baseline used

`npm run typecheck:report` was run before the audit. `reports/typecheck-baseline-report.md` matched the requested post-Phase-61 baseline values:

- Total diagnostics: 1857
- Files with diagnostics: 191
- `other`: 571
- `js/ui/**`: 510
- `js/Civication/**`: 473
- `js/Civication/ui/CivicationUI.js`: 106
- `js/Civication/ui/CivicationMiniSectionsUI.js`: 22
- `js/Civication/core/civicationEventEngine.js`: 23
- `js/Civication/core/civicationEconomyEngine.js`: 0
- `js/profile.js`: 83
- `js/state/**`: 16
- TS2339: 1508
- TS2551: 137
- TS2304: 70
- TS2322: 20
- TS2349: 12

The Civication-only capture contained 473 diagnostic lines.

## Commands run

```bash
git status --porcelain=v1 --untracked-files=no
git log -1 --oneline
test -f .github/workflows/typecheck-baseline.yml
test -f reports/typecheck-baseline-report.md
test -f reports/civication-next-local-typecheck-candidates-phase-60.md
npm run typecheck:report
npm run typecheck 2>&1 | grep "js/Civication/" > /tmp/civication-typecheck-phase-62.txt || true
wc -l /tmp/civication-typecheck-phase-62.txt
git diff --name-only
```

Start-control commit: `92102df Phase 61: narrow civicationLifeMailRuntime tag state typecheck pass`.

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
| 8 | `js/Civication/systems/day/dayConsequences.js` |
| 8 | `js/Civication/ui/CivicationMapModel.js` |
| 8 | `js/Civication/ui/CivicationSystemMap.js` |
| 7 | `js/Civication/systems/civicationDebateEngine.js` |

## Local candidates

These diagnostics look like local JSDoc/cast candidates because the failing access is on an `unknown` value or a value already used locally as a structured object. They do not require schema/global declarations or runtime semantics to investigate further.

| File | Line | Error | Diagnostic | Why it looks local | Recommended later phase |
| --- | ---: | --- | --- | --- | --- |
| `js/Civication/systems/civicationDebateEngine.js` | 289 | TS2339 | Property `trust` does not exist on type `unknown`. | `snap` comes from an optional snapshot call with `{}` fallback and is immediately read as a psyche snapshot. Local object typedef/cast should describe the snapshot shape without changing runtime. | **Phase 63** |
| `js/Civication/systems/civicationDebateEngine.js` | 295 | TS2339 | Property `integrity` does not exist on type `unknown`. | Same local `snap` object as line 289. | **Phase 63** |
| `js/Civication/systems/civicationDebateEngine.js` | 296 | TS2339 | Property `visibility` does not exist on type `unknown`. | Same local `snap` object as line 289. | **Phase 63** |
| `js/Civication/systems/civicationDebateEngine.js` | 297 | TS2339 | Property `economicRoom` does not exist on type `unknown`. | Same local `snap` object as line 289. | **Phase 63** |
| `js/Civication/systems/civicationDebateEngine.js` | 298 | TS2339 | Property `autonomy` does not exist on type `unknown`. | Same local `snap` object as line 289. | **Phase 63** |
| `js/Civication/systems/civicationDebateEngine.js` | 420 | TS2339 | Property `focus` does not exist on type `unknown`. | `identity` is returned by local `getIdentityState()` with a fallback containing `focus`; a local return typedef/cast should be enough. | **Phase 63** |
| `js/Civication/systems/civicationMailEngine.js` | 281 | TS2339 | Property `ok` does not exist on type `unknown`. | Local response from `window.HG_CiviEngine?.answer` is checked as an answer result. A narrow local result typedef/cast could likely fix it. | Later local cleanup after DebateEngine |
| `js/Civication/systems/day/dayConsequences.js` | 13 | TS2339 | Property `career_id` does not exist on type `unknown`. | Active-position access is used as an object with a career id; likely local active-position typedef/cast. | Later day-system cleanup |
| `js/Civication/systems/day/dayConsequences.js` | 29 | TS2339 | Property `preferred_types` does not exist on type `unknown`. | Mail branch state has a local fallback object with array fields, so a local branch-state typedef/cast looks mechanical. | Later day-system cleanup |
| `js/Civication/systems/day/dayConsequencesUI.js` | 75 | TS2339 | Property `trust` does not exist on type `unknown`. | UI reads a local summary/state object as a structured object; likely local typedef/cast, but the same file also has wrapper/function-shape errors. | Later, after nonlocal wrapper diagnostics are separated |
| `js/Civication/systems/day/dayProgressionController.js` | 126 | TS2339 | Property `status` does not exist on type `unknown`. | Looks like a local response/status object. Small enough for a later narrow pass. | Later local cleanup |
| `js/Civication/systems/day/dayProgressionController.js` | 130 | TS2339 | Property `resolved` does not exist on type `unknown`. | Same local response/status object as line 126. | Later local cleanup |

## Diagnostics that should wait

| File | Line | Error | Diagnostic | Why not touch now |
| --- | ---: | --- | --- | --- |
| `js/Civication/core/civicationEventEngine.js` | 160 | TS2339 | Property `CivicationMailEngine` does not exist on type `Window & typeof globalThis`. | Global/window declaration area; explicitly do not declare `CivicationMailEngine` in this phase. |
| `js/Civication/core/civicationEventEngine.js` | 1004 | TS2339 | Property `CivicationTaskEngine` does not exist on type `Window & typeof globalThis`. | Global/window declaration area; explicitly do not declare `CivicationTaskEngine` in this phase. |
| `js/Civication/core/civicationEventEngine.js` | 2069 | TS2551 | Property `CivicationEventEngine` does not exist on type `Window & typeof globalThis`. Did you mean `CivicationEconomyEngine`? | TS2551 global-name suggestion; previous dry-run warned against this category. |
| `js/Civication/core/civicationJobs.js` | 323 | TS2769 | No overload matches this call. | Payload/object-shape mismatch; may require contract/data semantics rather than a local cast. |
| `js/Civication/core/civicationJobs.js` | 429 | TS2345 | Argument is missing brand/place/employer fields required by the parameter type. | Real payload-shape contract issue; should not be hidden in an audit-only local migration. |
| `js/Civication/systems/civicationMailRuntime.js` | 590 | TS2551 | Property `CivicationEventEngine` does not exist on type `Window & typeof globalThis`. Did you mean `CivicationEconomyEngine`? | TS2551 global suggestion in a file with multiple globals; do not declare globals here. |
| `js/Civication/systems/civicationMailRuntime.js` | 717 | TS2339 | Property `mail_plan_progress` does not exist on type `unknown`. | Looks local in isolation, but this file is not to be touched in Phase 62 and also has global diagnostics. |
| `js/Civication/systems/day/dayPatches.js` | 648 | TS2339 | Property `getPendingEvent` does not exist on type `answer`. | Existing local/global type named `answer` appears wrong or too narrow; needs careful API-shape review. |
| `js/Civication/systems/day/dayPatches.js` | 845 | TS2322 | Type `boolean` is not assignable to type `CiviFn`. | Function/payload contract mismatch, not a safe local property-access-only candidate. |
| `js/Civication/systems/day/dayConsequencesUI.js` | 128 | TS2339 | Property `__civiConsequencesWrapped` does not exist on type `never`. | Wrapper/function narrowing issue; riskier than simple unknown property access. |
| `js/Civication/systems/day/dayConsequencesUI.js` | 137 | TS2740 | Function wrapper object is missing `Window` properties. | Function/window shape mismatch; not a simple local response-object cast. |
| `js/Civication/ui/CivicationInboxTopActionUI.js` | 194 | TS2339 | Property `onclick` does not exist on type `Element`. | DOM element narrowing in UI file; should wait because this audit avoids UI changes. |
| `js/Civication/ui/CivicationInboxTopActionUI.js` | 501 | TS2339 | Property `__civiInboxSectionsWrapped` does not exist on type `() => void`. | Wrapper augmentation issue in UI file; not a simple unknown object. |
| `js/Civication/ui/CivicationDashboardUI.js` | 61 | TS2339 | Property `CivicationMiniSectionsUI` does not exist on type `Window & typeof globalThis`. | UI global/window declaration area; not a local system-file candidate. |

## High-risk / hotspot list

Defer these for now:

- `js/Civication/ui/CivicationUI.js` — 106 diagnostics; large UI hotspot with many unknown object, DOM, and global accesses.
- `js/Civication/core/civicationEventEngine.js` — 23 diagnostics; engine hotspot dominated by globals/window declarations, including mail/task engine globals that should not be declared here.
- `js/Civication/ui/CivicationMiniSectionsUI.js` — 22 diagnostics; UI hotspot despite many local-looking unknown reads.
- `js/Civication/core/civicationJobs.js` — remaining diagnostics are `TS2769`/`TS2345` payload-form issues and should wait.
- `js/Civication/systems/day/dayPatches.js` — mixed globals, `answer` API-shape diagnostics, and `TS2322` function-contract issue.
- `js/Civication/systems/civicationMailRuntime.js` — explicitly not touched in this phase; mixed global diagnostics plus two local-looking mail state fields.
- `js/Civication/ui/CivicationDashboardUI.js` and `js/Civication/ui/CivicationInboxTopActionUI.js` — UI/global/DOM mixed diagnostics; wait for a dedicated UI pass.

## Phase 63 recommendation

Pick **`js/Civication/systems/civicationDebateEngine.js`** for Phase 63.

Why this is the safest next concrete candidate:

1. It is outside the explicitly high-risk UI/core hotspots.
2. It has only 7 diagnostics total.
3. 6 of 7 diagnostics are local `TS2339` reads from `unknown` values already treated as structured local state (`trust`, `integrity`, `visibility`, `economicRoom`, `autonomy`, and `focus`).
4. The remaining diagnostic is the file's own `window.CivicationDebateEngine` export global, which can be left for a global/schema phase if Phase 63 is constrained to local JSDoc/casts only.
5. It does not require touching `schemas/civication-globals.d.ts`, `CivicationMailEngine`, `CivicationTaskEngine`, `CivicationCalendar?: any`, data files, AHA, place/emne work, CSS, HTML, workflows, packages, or baseline files.

## Explicit non-changes

This phase does not intentionally change any JS code, runtime behavior, schemas/globals, data, AHA files, UI, CSS, HTML, workflows, package files, manifest files, tests, `TYPESCRIPT_MIGRATION.md`, or `reports/typecheck-baseline-report.md`. The only intended diff is this audit report:

- `reports/civication-next-local-typecheck-candidates-phase-62.md`
