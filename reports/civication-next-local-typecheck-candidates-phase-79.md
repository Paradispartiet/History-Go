# Phase 79 — Civication-first local typecheck candidate refresh after Phase 78

## Status

Phase 79 is an **audit-only** refresh for the Civication-first TypeScript/JSDoc migration after the Phase 73–78 Civication phases were merged. The audit only reviews diagnostics under `js/Civication/**` and exists to choose the next safe local Phase 80 target.

No JS code, runtime behavior, schemas/globals, data, AHA, `js/ui/**`, CSS, HTML, package/workflow files, tests, manifests, `TYPESCRIPT_MIGRATION.md`, or the baseline file were changed. The only intended repository change is this report.

## Baseline used

The preflight baseline report matched the expected post-PR-768 values:

| Metric | Expected / observed |
| --- | ---: |
| Total diagnostics | 1845 |
| Files with diagnostics | 189 |
| `other` | 586 |
| `js/ui/**` | 498 |
| `js/Civication/**` | 447 |
| `js/Civication/ui/CivicationUI.js` | 106 |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | 22 |
| `js/Civication/core/civicationEventEngine.js` | 23 |
| `js/Civication/core/civicationEconomyEngine.js` | 0 |
| `js/profile.js` | 83 |
| `js/state/**` | 16 |
| TS2339 | 1494 |
| TS2551 | 137 |
| TS2304 | 70 |
| TS2322 | 20 |
| TS2349 | 14 |

## Commands run

```bash
git status --porcelain=v1
git status --porcelain=v1 --untracked-files=no
git log -1 --oneline
test -f .github/workflows/typecheck-baseline.yml
test -f reports/typecheck-baseline-report.md
test -f reports/civication-next-local-typecheck-candidates-phase-72.md
test -f reports/typecheck-baseline-drift-audit-phase-73-preflight.md
npm run typecheck:report
npm run typecheck > /tmp/typecheck-full-phase-79-civication.txt 2>&1 || true
grep "js/Civication/" /tmp/typecheck-full-phase-79-civication.txt > /tmp/civication-typecheck-phase-79.txt || true
grep "TS2339" /tmp/civication-typecheck-phase-79.txt > /tmp/civication-ts2339-phase-79.txt || true
grep "TS2551" /tmp/civication-typecheck-phase-79.txt > /tmp/civication-ts2551-phase-79.txt || true
grep "TS2304" /tmp/civication-typecheck-phase-79.txt > /tmp/civication-ts2304-phase-79.txt || true
grep "TS2322" /tmp/civication-typecheck-phase-79.txt > /tmp/civication-ts2322-phase-79.txt || true
grep "TS2349" /tmp/civication-typecheck-phase-79.txt > /tmp/civication-ts2349-phase-79.txt || true
grep "TS2740" /tmp/civication-typecheck-phase-79.txt > /tmp/civication-ts2740-phase-79.txt || true
grep "TS2345" /tmp/civication-typecheck-phase-79.txt > /tmp/civication-ts2345-phase-79.txt || true
python3 one-off diagnostic parsing scripts against /tmp/civication-typecheck-phase-79.txt
```

Start-control notes:

- `git status --porcelain=v1 --untracked-files=no` showed no tracked changes before this audit work.
- `git status --porcelain=v1` showed untracked `node_modules/`. It was not deleted. It is dependency install state, not an intended source/report change, and it is not part of this PR diff.
- `git log -1 --oneline` returned `02d5e5f Move approved litteratur legacy people to Oslo`.

## Fresh Civication diagnostic capture

Total Civication diagnostic count is **447** across **73 files**.

### Diagnostics per error code for `js/Civication/**`

| Error code | Count |
| --- | ---: |
| TS2339 | 385 |
| TS2551 | 36 |
| TS2322 | 10 |
| TS2362 | 5 |
| TS2363 | 4 |
| TS2345 | 2 |
| TS2740 | 2 |
| TS2769 | 1 |
| TS2304 | 1 |
| TS2698 | 1 |

### Top Civication files by diagnostic count

| File | Diagnostics |
| --- | ---: |
| `js/Civication/ui/CivicationUI.js` | 106 |
| `js/Civication/core/civicationEventEngine.js` | 23 |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | 22 |
| `js/Civication/ui/CivicationDashboardUI.js` | 18 |
| `js/Civication/ui/CivicationMap.js` | 18 |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 15 |
| `js/Civication/ui/CivicationInboxTopActionUI.js` | 13 |
| `js/Civication/systems/day/dayPatches.js` | 12 |
| `js/Civication/systems/day/dayConsequencesUI.js` | 11 |
| `js/Civication/systems/day/dayRuntimeDebugPanel.js` | 10 |
| `js/Civication/ui/CivicationSectionsUI.js` | 9 |
| `js/Civication/systems/civicationCareerOutcomeRuntime.js` | 8 |
| `js/Civication/systems/civicationDailyTaskGates.js` | 8 |
| `js/Civication/systems/civicationMailRuntime.js` | 8 |
| `js/Civication/ui/CivicationMapModel.js` | 8 |
| `js/Civication/ui/CivicationSystemMap.js` | 8 |
| `js/Civication/core/civicationState.js` | 6 |
| `js/Civication/systems/civicationBrandJobProgression.js` | 6 |
| `js/Civication/utils/storyResolver.js` | 6 |
| `js/Civication/mailPlanBridge.js` | 5 |
| `js/Civication/systems/civicationLifeMailRuntime.js` | 5 |
| `js/Civication/systems/day/dayNpcCharacterThreads.js` | 5 |
| `js/Civication/systems/civicationBlockedJobMessages.js` | 4 |
| `js/Civication/systems/day/dayFactionConflictSystem.js` | 4 |
| `js/Civication/systems/day/dayNpcReactions.js` | 4 |

## Phase 72 candidates resolved in Phase 73–78

Phase 72 is now stale for the next-choice decision because the following recommended/local candidates were already addressed by the merged Civication-first phases:

| Phase | File | Phase 72 local diagnostics now gone | Notes |
| ---: | --- | --- | --- |
| 73 | `js/Civication/systems/day/dayFactionNpcReactions.js` | line 39, TS2339 `career_id` on `unknown` | The file now has only global/window diagnostics left. |
| 74 | `js/Civication/systems/day/dayConsequences.js` | lines 18, 30, 31, TS2339 `role_scope`, `preferred_families`, `flags` on `unknown` | The file now has only global/window diagnostics left. |
| 75 | `js/Civication/systems/civicationMailRuntime.js` | lines 717–718, TS2339 `mail_plan_progress` / `mail_system` on `unknown` | Remaining diagnostics are global/window references. |
| 76 | `js/Civication/systems/day/dayNpcReactions.js` | line 269, TS2339 `career_id` on `unknown` | Remaining diagnostics are global/window references. |
| 77 | `js/Civication/systems/day/dayNarrativeConsequencesUI.js` | line 12, TS2339 `career_id` on `unknown` | Remaining diagnostics are wrapper/function-contract waitlist items. |
| 78 | `js/Civication/systems/day/dayPatches.js` | lines 687 and 763, TS2339 `complete` / `career_id` on `unknown` | Remaining diagnostics are answer-shape, globals, and patch contract issues. |

## Classification summary

The 447 remaining Civication diagnostics are still dominated by global/window declarations and large Civication UI hotspots. The safest immediate Phase 80 work should therefore be a small local UI file rather than a core/runtime hotspot or a declaration/schema phase.

| Classification bucket | Diagnostic count estimate | Notes |
| --- | ---: | --- |
| Global/window-declaration candidates | ~282 | `Window & typeof globalThis`, `typeof globalThis`, TS2551 global Civication names, exported `window.Civication...`, bridge/runtime/system globals, and `DEBUG` / `PEOPLE` / memory globals. |
| Next local JSDoc/type-only candidates | ~22 | Remaining non-hotspot local reads are now mostly `unknown`, `{}`, `answer`, and `never` property-access diagnostics in a small number of files. |
| Civication UI-local candidates | ~114 | Civication UI files have many local UI state/object reads, but several are too large for the very next phase. |
| API-shape/payload/function-contract waitlist | 27 | TS2322/TS2345/TS2769/TS2740/TS2362/TS2363/TS2698/TS2304 diagnostics that may reflect real contract, callback, numeric-shape, or missing-symbol decisions. |
| UI/DOM hotspots inside Civication | 13 | DOM/event narrowing on `Element`, `EventTarget`, `Event`, `onclick`, `style`, and `closest`. |

## Next local JSDoc/type-only candidates

These candidates are local property-access or local shape reads that can plausibly be handled with JSDoc typedefs/casts and no runtime behavior, schema/global declaration, data, CSS/HTML, or workflow change. Files already completed in Phases 73–78 are intentionally not re-recommended.

| File | Line | Error code | Diagnostic | Why local | Recommended phase |
| --- | ---: | --- | --- | --- | --- |
| `js/Civication/ui/CivicationSectionsUI.js` | 106 | TS2339 | Property `event` does not exist on type `unknown`. | Existing inbox/pending-event summary read; local event summary shape can be typed without changing runtime. | **Phase 80 recommended** |
| `js/Civication/ui/CivicationSectionsUI.js` | 121–123 | TS2339 | Properties `title`, `career_name`, and `career_id` do not exist on type `unknown`. | Existing active-role summary read; a local active-position typedef/cast should cover the cluster. | **Phase 80 recommended** |
| `js/Civication/ui/CivicationSectionsUI.js` | 134–135 | TS2339 | Property `home` does not exist on type `unknown`. | Existing home-state summary read; local home-state typedef/cast should cover the cluster. | **Phase 80 recommended** |
| `js/Civication/systems/civicationPlaceAccessBridge.js` | 198 | TS2339 | Property `then` does not exist on type `unknown`. | Local Promise-like return from `rebuildAccessState`; can be narrowed locally, but the file otherwise has global export diagnostics. | Later local phase |
| `js/Civication/systems/day/dayPatches.js` | 648, 690, 737, 779 | TS2339 | `getPendingEvent` / `onAppOpen` do not exist on type `answer`. | Local answer/runtime bridge shape, but Phase 78 already touched the file and it remains mixed with globals plus TS2322. | Later local phase |
| `js/Civication/systems/day/dayFactionConflictSystem.js` | 116 | TS2339 | Properties `score` and `faction` do not exist on type `never`. | Local sorted conflict candidate shape; low count, but the `never` source should be reviewed carefully with conflict scoring logic. | Later local phase |
| `js/Civication/systems/day/dayConsequencesUI.js` | 12, 75–90 | TS2339 | `career_id`, `trust`, `flags`, `integrity`, `visibility`, `economicRoom`, and `autonomy` do not exist on type `unknown`. | Existing consequence snapshot/state reads; local typedef possible, but wrapper/function-contract diagnostics remain in the same file. | Later UI-local phase |

## Civication UI-local candidates

These are UI-local `unknown`, `{}`, wrapper-property, or UI-state diagnostics inside `js/Civication/**`. They should be handled in Civication UI-local phases and not mixed with general `js/ui/**` work.

| File | Lines | Error code | Diagnostic pattern | Why UI-local | Recommended phase |
| --- | --- | --- | --- | --- | --- |
| `js/Civication/ui/CivicationSectionsUI.js` | 106, 121–123, 134–135 | TS2339 | `event`, active-role fields, and `home` on `unknown` | Small Civication UI summary file; one export global remains separable. | **Phase 80 recommended** |
| `js/Civication/ui/CivicationSystemMap.js` | 38, 53 | TS2339 | Access categories `work`, `housing`, `store`, `people`, `debate`, `leisure` on `{}` | Local context fallback shape; good later UI-local candidate, but minified one-line panel code makes review noisier than `CivicationSectionsUI.js`. | Later UI-local phase |
| `js/Civication/ui/CivicationDashboardUI.js` | 126–220 | TS2339 | `id`, `career_id`, `home`, `event`, `title`, `career_name` on `unknown` | Similar state-summary shapes, but 18 total diagnostics and several globals make it larger than Phase 80 should be. | Later UI-local phase |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | 33–544 | TS2339 | Role/home/job fields on `unknown` | Valid UI-local shapes, but this is a 22-diagnostic hotspot. | Later UI-local phase |
| `js/Civication/ui/CivicationUI.js` | many | TS2339/TS2322/TS2698 | Large state/render shape cluster | Largest Civication hotspot and mixed with DOM/API-shape issues. | Hotspot phase only |
| `js/Civication/systems/day/dayConsequencesUI.js` | 12, 75–90, 128–137 | TS2339/TS2740 | Snapshot fields plus wrapper function properties | Civication UI support file, but mixed local state and wrapper contract diagnostics. | Later UI-local phase |

## Global/window-declaration candidates

These should be batched in a later declaration-oriented phase because they are about exported/imported globals rather than local payload narrowing.

| File / area | Global name(s) | Error code | Why later |
| --- | --- | --- | --- |
| `js/Civication/core/civicationEventEngine.js` | `HG_STATE`, `CivicationMailEngine`, `CivicationMailRuntime`, `CiviRoleStoryletBridge`, `CivicationTaskEngine`, `CiviStoryResolver`, `CivicationConflicts`, `CivicationEventEngine` | TS2339/TS2551 | Core engine depends on many runtime globals; declaration work should be coordinated, not local-cast-only. |
| `js/Civication/systems/civicationDailyTaskGates.js` | `CivicationTaskEngine`, `CivicationMailEngine`, `CivicationDailyMailBuilder`, `CivicationEventEngine`, `CivicationDailyTaskGates` | TS2339/TS2551 | Almost entirely global/window references after earlier local phases. |
| `js/Civication/systems/civicationCareerOutcomeRuntime.js` | `CivicationMailRuntime`, `CivicationEventEngine`, `CivicationCareerOutcomeRuntime` | TS2339/TS2551 | Runtime cross-system bridge declarations should be centralized. |
| `js/Civication/systems/civicationDailyMailBuilder.js` | `CivicationMailEngine`, `CivicationMailRuntime`, `CivicationTaskEngine`, `CivicationEventEngine`, `CivicationDailyMailBuilder`, `DEBUG` | TS2339/TS2551 | Mail builder is mostly globals plus one payload contract issue; not a local-only target. |
| `js/Civication/systems/day/dayRuntimeDebugPanel.js` | `CiviMailPlanBridge`, `CivicationNpcCharacterThreads`, `CivicationAllianceSystem`, `CivicationFactionConflictSystem`, `CivicationDayProgression`, `CivicationDailyMailBuilder`, `CivicationRuntimeDebugPanel` | TS2339 | Debug panel is global/system wiring dominated. |
| `js/Civication/utils/storyResolver.js` | `PEOPLE`, `__HG_STORY_STATE_MEM__`, `CiviStoryResolver` | TS2339 | Shared data/memory globals should be declared consistently. |
| Small one-export files | `CivicationTaskEngine`, `HG_IdentityCompass`, `HG_IdentityEngine`, `CiviRoleStoryletBridge`, `CivicationBrandJobState`, `CivicationDebateEngine`, `CivicationEventChannels`, `CivicationMailEngine`, `CivicationConflicts` | TS2339/TS2551 | Mostly single `window.*` export diagnostics; best solved by a declaration pass, not repeated local casts. |

## API-shape/payload/function-contract waitlist

These are not recommended for Phase 80 because they may encode real contracts between systems, wrapper functions, callbacks, numeric shapes, or missing declarations.

| File | Line(s) | Error code | Diagnostic | Why wait |
| --- | ---: | --- | --- | --- |
| `js/Civication/core/civicationEventEngine.js` | 42 | TS2362/TS2363 | Arithmetic operands are not known numeric types. | Core event score/date math shape should be reviewed with engine semantics. |
| `js/Civication/core/civicationJobs.js` | 323 | TS2769 | No overload matches this call. | Overload/callback contract rather than local property access. |
| `js/Civication/core/civicationJobs.js` | 429, 448 | TS2345 | Career offer object lacks brand/employer fields required by callee. | Real payload contract between jobs and offer handling. |
| `js/Civication/core/civicationState.js` | 389 | TS2362/TS2363 | Arithmetic operands are not known numeric types. | State numeric shape needs deliberate review. |
| `js/Civication/merits-and-jobs.js` | 193 | TS2304 | Cannot find name `catIdFromDisplay`. | Missing symbol/declaration decision, not a local JSDoc property fix. |
| `js/Civication/systems/civicationActivePositionRecovery.js` | 170 | TS2322 | `boolean` is not assignable to `CiviFn`. | Runtime/export marker shape; declaration/function contract decision. |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 1260 | TS2322 | Task slot object has optional fields where required fields are expected. | Mail/task payload shape may require API/data decision. |
| `js/Civication/systems/day/dayConsequencesUI.js` | 137 | TS2740 | Wrapped function object is missing `Window` properties. | Wrapper assignment/function contract issue. |
| `js/Civication/systems/day/dayNarrativeConsequencesUI.js` | 177 | TS2740 | Wrapped function object is missing `Window` properties. | Wrapper assignment/function contract issue. |
| `js/Civication/systems/day/dayPatches.js` | 850 | TS2322 | `boolean` is not assignable to `CiviFn`. | Patch marker/function shape should wait for wrapper/global work. |
| `js/Civication/systems/day/dayWeeklyReview.js` | 19 | TS2362/TS2363 | Arithmetic operands are not known numeric types. | Weekly-review numeric state shape should be reviewed in a contract pass. |
| `js/Civication/ui/CivicationHome.js` | 348 | TS2322 | Home object is not assignable to `CiviFn`. | Home data export/declaration contract. |
| `js/Civication/ui/CivicationMap.js` | 50, 95 | TS2362/TS2363 | Map coordinate arithmetic operands are not known numeric types. | UI-map coordinate shape, not a tiny Phase 80 target. |
| `js/Civication/ui/CivicationUI.js` | 526, 529, 532, 535, 606, 1351, 1374 | TS2322/TS2698 | Number/string, home config, and object-spread contract issues. | Largest UI hotspot with mixed state/render contracts. |

## UI/DOM hotspots inside Civication

These should be saved for focused Civication UI/DOM narrowing phases, not mixed into Phase 80.

| File | Line | Error code | Diagnostic | Why UI/DOM |
| --- | ---: | --- | --- | --- |
| `js/Civication/systems/day/dayNpcCharacterThreads.js` | 147 | TS2339 | Property `detail` does not exist on type `Event`. | Event/detail narrowing. |
| `js/Civication/ui/CivicationInboxTopActionUI.js` | 194 | TS2339 | Property `onclick` does not exist on type `Element`. | Element narrowing. |
| `js/Civication/ui/CivicationInboxTopActionUI.js` | 197 | TS2339 | Property `closest` does not exist on type `EventTarget`. | EventTarget narrowing. |
| `js/Civication/ui/CivicationMap.js` | 13 | TS2339 | `getAttribute` / `setAttribute` do not exist on type `EventTarget`. | EventTarget narrowing. |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | 696–819 | TS2339 | `onclick` on `Element`; `closest` on `EventTarget`. | DOM/event narrowing in a UI hotspot. |
| `js/Civication/ui/CivicationUI.js` | 1284–1293 | TS2339 | `style` / `onclick` do not exist on type `Element`. | DOM element narrowing in the largest hotspot. |

## High-risk / hotspot list

Do not use these as the immediate Phase 80 target while smaller local candidates remain:

| File | Diagnostics | Hotspot reason |
| --- | ---: | --- |
| `js/Civication/ui/CivicationUI.js` | 106 | Largest Civication hotspot; mixes local state reads, globals, TS2322, DOM narrowing, and object-spread/API-shape issues. |
| `js/Civication/core/civicationEventEngine.js` | 23 | Core runtime engine; mixed mail/event/task globals plus arithmetic/numeric diagnostics. |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | 22 | UI hotspot; local unknown reads, globals, and DOM narrowing are mixed. |
| `js/Civication/ui/CivicationDashboardUI.js` | 18 | UI state/render hotspot; mostly local unknown reads but larger than needed for Phase 80. |
| `js/Civication/ui/CivicationMap.js` | 18 | UI-map hotspot with globals, EventTarget narrowing, and numeric arithmetic diagnostics. |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 15 | Mail-builder runtime with globals and a payload contract TS2322. |
| `js/Civication/ui/CivicationInboxTopActionUI.js` | 13 | UI event/DOM plus global export/consumer diagnostics. |
| `js/Civication/systems/day/dayPatches.js` | 12 | Recently touched Phase 78 file; remaining answer-shape reads are mixed with globals and TS2322. |
| `js/Civication/systems/day/dayConsequencesUI.js` | 11 | Local snapshot reads are mixed with wrapper/function-contract diagnostics. |
| `js/Civication/systems/day/dayRuntimeDebugPanel.js` | 10 | Debug panel is dominated by system/global references and timer helper shape. |

## Recommended Phase 80

Recommended next concrete file: **`js/Civication/ui/CivicationSectionsUI.js`**.

Why this is the safest next target:

- It has **9 diagnostics** total, but **8 are clear local `unknown` property-access diagnostics** in compact summary helpers.
- The remaining diagnostic is a single `window.CivicationSectionsUI` export/global declaration candidate that can be left untouched.
- The local clusters are existing read-only UI summaries: pending inbox event, active role, and home state.
- It should be possible to reduce several diagnostics with local JSDoc typedefs/casts only, with no runtime behavior, schemas/globals, data, AHA, CSS/HTML, package/workflow, baseline, or broad `js/ui/**` changes.
- It is smaller and safer than the current hotspots (`CivicationUI.js`, `CivicationMiniSectionsUI.js`, `CivicationDashboardUI.js`) and less noisy than the one-line/minified `CivicationSystemMap.js` context-shape cluster.

## Explicit non-changes

This Phase 79 audit did **not** intentionally change:

- JS source under `js/**`
- schemas or globals declarations
- data files
- AHA
- place/emne areas
- Lesespor/Leksikon areas
- `js/ui/**`
- CSS or HTML
- package files or workflow files
- tests or manifests
- `TYPESCRIPT_MIGRATION.md`
- `reports/typecheck-baseline-report.md` baseline content in the final diff

Final validation should treat the GitHub Actions workflow **“Typecheck baseline report”** as the authoritative check if it runs on the PR.
