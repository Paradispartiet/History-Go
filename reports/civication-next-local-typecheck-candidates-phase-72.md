# Phase 72 — Civication-first local typecheck candidate refresh

## Status

Phase 72 is an **audit-only** refresh for the Civication-first TypeScript/JSDoc migration. The audit only looks at diagnostics under `js/Civication/**` and is intended to choose the next safe local Phase 73 target after the Civication phases through PR #735 / Phase 71.

No JavaScript/runtime code, schemas/globals, data, AHA, `js/ui/**`, CSS, HTML, package/workflow files, tests, manifests, `TYPESCRIPT_MIGRATION.md`, or the baseline file were intentionally changed. The only intended repository change is this report.

## Baseline used

The preflight baseline report matched the expected post-Phase-71 values:

| Metric | Expected / observed |
| --- | ---: |
| Total diagnostics | 1848 |
| Files with diagnostics | 189 |
| `other` | 579 |
| `js/ui/**` | 498 |
| `js/Civication/**` | 457 |
| `js/Civication/ui/CivicationUI.js` | 106 |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | 22 |
| `js/Civication/core/civicationEventEngine.js` | 23 |
| `js/Civication/core/civicationEconomyEngine.js` | 0 |
| `js/profile.js` | 83 |
| `js/state/**` | 16 |
| TS2339 | 1497 |
| TS2551 | 137 |
| TS2322 | 20 |
| TS2349 | 14 |

Note: the prompt also listed TS2304 = 70 in the background baseline. The preflight report still contains TS2304 = 70 globally, but the explicit Phase 72 baseline-match gate only required the rows above.

## Commands run

```bash
git status --porcelain=v1
git status --porcelain=v1 --untracked-files=no
git log -1 --oneline
test -f .github/workflows/typecheck-baseline.yml
test -f reports/typecheck-baseline-report.md
test -f reports/civication-next-local-typecheck-candidates-phase-66.md
test -f reports/typecheck-baseline-drift-audit-phase-71-preflight.md
npm run typecheck:report
npm run typecheck > /tmp/typecheck-full-phase-72-civication.txt 2>&1 || true
grep "js/Civication/" /tmp/typecheck-full-phase-72-civication.txt > /tmp/civication-typecheck-phase-72.txt || true
grep "TS2339" /tmp/civication-typecheck-phase-72.txt > /tmp/civication-ts2339-phase-72.txt || true
grep "TS2551" /tmp/civication-typecheck-phase-72.txt > /tmp/civication-ts2551-phase-72.txt || true
grep "TS2304" /tmp/civication-typecheck-phase-72.txt > /tmp/civication-ts2304-phase-72.txt || true
grep "TS2322" /tmp/civication-typecheck-phase-72.txt > /tmp/civication-ts2322-phase-72.txt || true
grep "TS2349" /tmp/civication-typecheck-phase-72.txt > /tmp/civication-ts2349-phase-72.txt || true
python3 one-off diagnostic parsing scripts against /tmp/civication-typecheck-phase-72.txt
```

Start-control notes:

- `git status --porcelain=v1 --untracked-files=no` showed no tracked changes before this audit work.
- `git status --porcelain=v1` showed untracked `node_modules/`. It was not deleted. It is dependency install state, not an intended source/report change; it is not part of this PR diff.
- `git log -1 --oneline` returned `79a33b4 Add Oslo popkultur people batch 1 (normalize from legacy)`.

## Fresh Civication diagnostic capture

Total Civication diagnostic count remains **457** across **73 files**.

### Diagnostics per error code for `js/Civication/**`

| Error code | Count |
| --- | ---: |
| TS2339 | 395 |
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
| `js/Civication/systems/day/dayPatches.js` | 14 |
| `js/Civication/ui/CivicationInboxTopActionUI.js` | 13 |
| `js/Civication/systems/day/dayConsequencesUI.js` | 11 |
| `js/Civication/systems/civicationMailRuntime.js` | 10 |
| `js/Civication/systems/day/dayRuntimeDebugPanel.js` | 10 |
| `js/Civication/ui/CivicationSectionsUI.js` | 9 |
| `js/Civication/systems/civicationCareerOutcomeRuntime.js` | 8 |
| `js/Civication/systems/civicationDailyTaskGates.js` | 8 |
| `js/Civication/ui/CivicationMapModel.js` | 8 |
| `js/Civication/ui/CivicationSystemMap.js` | 8 |
| `js/Civication/core/civicationState.js` | 6 |
| `js/Civication/systems/civicationBrandJobProgression.js` | 6 |
| `js/Civication/systems/day/dayConsequences.js` | 6 |
| `js/Civication/utils/storyResolver.js` | 6 |

## Classification summary

The 457 remaining Civication diagnostics classify cleanly into the migration buckets below. Some files are mixed, so the recommended next work should target a local subset rather than trying to clear every diagnostic in a file.

| Classification bucket | Diagnostic count | Notes |
| --- | ---: | --- |
| Global/window-declaration candidates | 268 | `Window & typeof globalThis`, `typeof globalThis`, TS2551 global Civication names, exported `window.Civication...`, bridge/runtime/system globals. |
| Next local JSDoc/type-only candidates | 149 | Mostly `unknown`, `{}`, `answer`, `never`, or locally wrapped function property-access diagnostics. This includes large UI hotspots, so not every local diagnostic is a safe immediate target. |
| API-shape/payload/function-contract waitlist | 26 | TS2322/TS2345/TS2769/TS2740/TS2362/TS2363/TS2698/TS2304 diagnostics that may reflect real contract or numeric-shape decisions. |
| UI/DOM hotspots inside Civication | 14 | DOM element/event narrowing such as `Element`, `EventTarget`, `Event`, `onclick`, `style`, and `closest`. |

## Next local JSDoc/type-only candidates

These are the best local candidates because they are property-access diagnostics on existing local shapes and can likely be handled with local typedefs/casts without runtime behavior, schema/global declaration, data, CSS/HTML, or workflow changes. Large UI files are noted but intentionally not recommended for Phase 73.

| File | Line | Error code | Diagnostic | Why local | Recommended phase |
| --- | ---: | --- | --- | --- | --- |
| `js/Civication/systems/day/dayFactionNpcReactions.js` | 39 | TS2339 | Property `career_id` does not exist on type `unknown`. | Single local payload/read-shape diagnostic in a 3-diagnostic file; remaining two diagnostics are globals and can wait for declaration work. | **Phase 73 recommended** |
| `js/Civication/systems/day/dayConsequences.js` | 18 | TS2339 | Property `role_scope` does not exist on type `unknown`. | Existing mail-plan/consequence object read; local shape/cast can address without runtime change. | Later local phase |
| `js/Civication/systems/day/dayConsequences.js` | 30 | TS2339 | Property `preferred_families` does not exist on type `unknown`. | Same local consequence metadata object as line 18. | Later local phase |
| `js/Civication/systems/day/dayConsequences.js` | 31 | TS2339 | Property `flags` does not exist on type `unknown`. | Same local consequence metadata object as line 18. | Later local phase |
| `js/Civication/systems/civicationMailRuntime.js` | 717 | TS2339 | Property `mail_plan_progress` does not exist on type `unknown`. | Local stats/state response read; can likely be narrowed locally after globals are left untouched. | Later local phase |
| `js/Civication/systems/civicationMailRuntime.js` | 718 | TS2339 | Property `mail_system` does not exist on type `unknown`. | Same local stats/state response read as line 717. | Later local phase |
| `js/Civication/systems/day/dayNarrativeConsequencesUI.js` | 12 | TS2339 | Property `career_id` does not exist on type `unknown`. | Small local career/consequence object read, but file also has wrapper-function contract diagnostics. | Later local phase |
| `js/Civication/systems/day/dayNpcReactions.js` | 269 | TS2339 | Property `career_id` does not exist on type `unknown`. | Local NPC reaction payload read, but file also depends on global systems. | Later local phase |
| `js/Civication/systems/day/dayPatches.js` | 687 | TS2339 | Property `complete` does not exist on type `unknown`. | Local answer/task shape, but file is larger and mixed with globals and contract diagnostics. | Later local phase |
| `js/Civication/systems/day/dayPatches.js` | 763 | TS2339 | Property `career_id` does not exist on type `unknown`. | Local career payload read, but file is mixed and should not be first. | Later local phase |
| `js/Civication/ui/CivicationSectionsUI.js` | 106 | TS2339 | Property `event` does not exist on type `unknown`. | Local UI state object read; file has 8 similar local reads plus one export global. | Later UI-local Civication phase |
| `js/Civication/ui/CivicationSystemMap.js` | 38 | TS2339 | Property `work` does not exist on type `{}`. | Local map/config object shape; no schema/global required, but UI-map work should be batched. | Later UI-local Civication phase |

Other local candidates are concentrated in `CivicationUI.js`, `CivicationMiniSectionsUI.js`, `CivicationDashboardUI.js`, `CivicationSectionsUI.js`, `dayConsequencesUI.js`, and `dayPatches.js`. They remain valid type-only targets, but their files are larger or mixed enough that they should not be the immediate Phase 73 choice.

## Global/window-declaration candidates

These diagnostics should wait for a later dedicated declaration phase because they are about known globals, bridge/runtime exports, debug globals, or system objects on `window`/`globalThis`, not local payload shapes.

| File / area | Global name(s) | Error code(s) | Why take later |
| --- | --- | --- | --- |
| Many Civication system/UI files | `CivicationMailEngine` (31 diagnostics) | TS2339 | Shared runtime global; should be declared once rather than patched locally in each consumer. |
| Many Civication system/UI files | `CivicationEventEngine` (20 diagnostics) | TS2551 | Shared event engine global; TS2551 suggests current declarations know related names but not this one. |
| Many Civication system/UI files | `CivicationTaskEngine` (14 diagnostics) | TS2339 | Shared task engine global; declaration-phase candidate. |
| Many Civication system/UI files | `DEBUG` (12 diagnostics) | TS2339 | Cross-cutting debug flag on `window`; should be declared centrally. |
| Mail/runtime/day files | `CivicationMailRuntime` (10 diagnostics) | TS2339 | Runtime bridge global used across systems; declaration-phase candidate. |
| UI/day files | `CivicationEventChannels` (10 diagnostics) | TS2339 | Event bus/channel global; declaration-phase candidate. |
| Day/NPC/meeting files | `CivicationNpcCharacterThreads` (10 diagnostics) | TS2339 | NPC thread system global; declaration-phase candidate. |
| Day/debug files | `CiviMailPlanBridge` (10 diagnostics) | TS2339 | Mail-plan bridge global; declaration-phase candidate. |
| UI files | `CivicationMiniSectionsUI` (8 diagnostics) | TS2339 | UI export global; declaration-phase candidate. |
| Day files | `CivicationChoiceDirector` (7 diagnostics) | TS2339 | Choice director system global; declaration-phase candidate. |
| `js/Civication/ui/CivicationMapModel.js` and map consumers | `CIVI_MAP_DISTRICTS`, `CIVI_MAP_CONNECTIONS`, `CIVI_MAP_LANDMARKS`, `CIVI_MAP_BLOCK_PATTERNS`, `CIVI_OSLO_SKELETON`, `CIVI_OSLO_LANDSCAPE`, `CIVI_OSLO_CORRIDORS`, `CIVI_OSLO_ANCHORS` | TS2339 | Map data globals; not a local JSDoc payload fix. |
| State/brand files | `CivicationState`, `CivicationBrandJobState`, `CivicationBrandJobProgression`, `CivicationBrandJobUI` | TS2339/TS2551 | Cross-system globals; should be handled together. |
| Conflict/alliance/faction files | `CivicationConflicts`, `CivicationAllianceSystem`, `CivicationFactionConflictSystem`, `CivicationFactionChoiceSystem`, `CivicationFactionMailScoring`, `CivicationFactionVoice` | TS2339 | Day/faction system exports; declaration-phase candidate. |
| Identity/role files | `HG_IdentityCompass`, `HG_IdentityEngine`, `CiviRoleStoryletBridge`, `CiviRoleThreadResolver`, `CiviStoryResolver` | TS2339/TS2551 | Identity/role bridge globals; declaration-phase candidate. |
| Export-only singletons | `CivicationActivePositionRecovery`, `CivicationCareerOutcomeRuntime`, `CivicationDailyTaskGates`, `CivicationLifeMailRuntime`, `CiviMailPlanDebug`, `CivicationRoleStarter`, `CivicationRuntimeSanityGuard`, `CivicationStorageTrace`, `CivicationActiveRoleStateSync`, `CivicationAllianceMailScoring`, `CivicationChoiceToneVariants`, `CivicationRuntimeDebugPanel`, `CivicationDebateEngine`, `CivicationMailEngine`, `CivicationEventChannels`, `CivicationStoreUI` | TS2339/TS2551 | Mostly `window.X = ...` exports; should be solved by central globals declarations. |
| Patch markers / browser-ish globals | `__HG_STORY_STATE_MEM__`, `__civiStorageTracePatched`, `__civiNpcCharacterThreadPatched`, `__civiDayPhaseUiPatched`, `PEOPLE`, `getZones`, `HG_STATE`, `HGOnboarding` | TS2339/TS2551 | Runtime/patch/browser globals; should not be solved through unrelated local casts. |

## API-shape/payload/function-contract diagnostics that should wait

These are not the best local audit-first targets because they may encode true contract mismatches, callback/function signatures, arithmetic/numeric shape assumptions, or object payload completeness.

| File | Line | Error code | Diagnostic | Why wait |
| --- | ---: | --- | --- | --- |
| `js/Civication/core/civicationEventEngine.js` | 42 | TS2362/TS2363 | Arithmetic operands are not known numeric types. | Core event-engine numeric contract; high-risk hotspot. |
| `js/Civication/core/civicationJobs.js` | 323 | TS2769 | No overload matches this call. | Overload/API contract should be reviewed with call shape. |
| `js/Civication/core/civicationJobs.js` | 429 | TS2345 | Job-offer object is missing brand/place/employer fields expected by callee. | Cross-system payload completeness decision. |
| `js/Civication/core/civicationJobs.js` | 448 | TS2345 | Job-offer object is missing brand/place/employer fields expected by callee. | Same cross-system payload completeness decision. |
| `js/Civication/core/civicationState.js` | 389 | TS2362/TS2363 | Arithmetic operands are not known numeric types. | State numeric shape should be decided separately. |
| `js/Civication/systems/civicationActivePositionRecovery.js` | 170 | TS2322 | `boolean` is not assignable to `CiviFn`. | Function/global declaration or assignment contract mismatch. |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 1260 | TS2322 | Object with optional `date`/`phase` fields is assigned to a type requiring them. | Mail payload contract completeness. |
| `js/Civication/systems/day/dayConsequencesUI.js` | 137 | TS2740 | Wrapped function object is being compared/assigned against `Window`. | Wrapper/function contract issue, not just local payload shape. |
| `js/Civication/systems/day/dayNarrativeConsequencesUI.js` | 177 | TS2740 | Wrapped function object is being compared/assigned against `Window`. | Wrapper/function contract issue. |
| `js/Civication/systems/day/dayPatches.js` | 845 | TS2322 | `boolean` is not assignable to `CiviFn`. | Patch marker/function shape should be handled with wrapper/global work. |
| `js/Civication/systems/day/dayWeeklyReview.js` | 19 | TS2362/TS2363 | Arithmetic operands are not known numeric types. | Numeric/date contract needs focused review. |
| `js/Civication/ui/CivicationHome.js` | 348 | TS2322 | Home object is not assignable to `CiviFn`. | Declaration/API shape mismatch for home data export. |
| `js/Civication/ui/CivicationMap.js` | 50, 95 | TS2362/TS2363 | Arithmetic operands are not known numeric types. | Map coordinate numeric narrowing should be UI-map focused. |
| `js/Civication/ui/CivicationUI.js` | 526, 529, 532, 535, 1351 | TS2322 | `number` is not assignable to `string`. | Large UI hotspot with mixed state/render contracts. |
| `js/Civication/ui/CivicationUI.js` | 606 | TS2322 | `CiviFn | {}` is not assignable to home config record. | Home config/API-shape decision inside largest hotspot. |
| `js/Civication/ui/CivicationUI.js` | 1374 | TS2698 | Spread types may only be created from object types. | Unknown object-spread contract in large hotspot. |
| `js/Civication/merits-and-jobs.js` | 193 | TS2304 | Cannot find name `catIdFromDisplay`. | Missing symbol/declaration decision, not a local property-shape fix. |

## UI/DOM hotspots inside Civication

These should be saved for focused UI/DOM narrowing phases inside `js/Civication/**`, not mixed into the next small local Phase 73.

| File | Line | Error code | Diagnostic | Why UI/DOM |
| --- | ---: | --- | --- | --- |
| `js/Civication/systems/day/dayNpcCharacterThreads.js` | 147 | TS2339 | Property `detail` does not exist on type `Event`. | Event/detail narrowing. |
| `js/Civication/ui/CivicationInboxTopActionUI.js` | 194 | TS2339 | Property `onclick` does not exist on type `Element`. | Element narrowing. |
| `js/Civication/ui/CivicationInboxTopActionUI.js` | 197 | TS2339 | Property `closest` does not exist on type `EventTarget`. | EventTarget narrowing. |
| `js/Civication/ui/CivicationMap.js` | 13 | TS2339 | Property `getAttribute` does not exist on type `EventTarget`. | EventTarget narrowing. |
| `js/Civication/ui/CivicationMap.js` | 13 | TS2339 | Property `setAttribute` does not exist on type `EventTarget`. | EventTarget narrowing. |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | 696 | TS2339 | Property `onclick` does not exist on type `Element`. | Element narrowing in UI hotspot. |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | 697 | TS2339 | Property `onclick` does not exist on type `Element`. | Element narrowing in UI hotspot. |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | 819 | TS2339 | Property `closest` does not exist on type `EventTarget`. | EventTarget narrowing in UI hotspot. |
| `js/Civication/ui/CivicationUI.js` | 1284 | TS2339 | Property `style` does not exist on type `Element`. | Element narrowing in largest hotspot. |
| `js/Civication/ui/CivicationUI.js` | 1286 | TS2339 | Property `style` / `onclick` does not exist on type `Element`. | Element narrowing in largest hotspot. |
| `js/Civication/ui/CivicationUI.js` | 1290 | TS2339 | Property `style` does not exist on type `Element`. | Element narrowing in largest hotspot. |
| `js/Civication/ui/CivicationUI.js` | 1292 | TS2339 | Property `style` does not exist on type `Element`. | Element narrowing in largest hotspot. |
| `js/Civication/ui/CivicationUI.js` | 1293 | TS2339 | Property `onclick` does not exist on type `Element`. | Element narrowing in largest hotspot. |

## High-risk / hotspot list

Do not use these as the first Phase 73 local target while smaller candidates remain:

| File | Diagnostics | Hotspot reason |
| --- | ---: | --- |
| `js/Civication/ui/CivicationUI.js` | 106 | Largest Civication hotspot; mixes unknown state reads, globals, TS2322, DOM narrowing, object spread/API-shape issues. |
| `js/Civication/core/civicationEventEngine.js` | 23 | Core runtime engine; mixes mail/event/task globals with arithmetic/numeric diagnostics. |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | 22 | UI hotspot; mixes many local unknown reads, globals, and DOM narrowing. |
| `js/Civication/ui/CivicationDashboardUI.js` | 18 | UI state/render hotspot; mostly local unknown reads but larger than needed for Phase 73. |
| `js/Civication/ui/CivicationMap.js` | 18 | UI-map hotspot; globals, DOM EventTarget, and numeric arithmetic diagnostics are mixed. |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 15 | Mail-builder runtime with globals and payload contract TS2322. |
| `js/Civication/systems/day/dayPatches.js` | 14 | Mixed day patch file: local answer-shape reads, globals, patch markers, and function contract mismatch. |
| `js/Civication/ui/CivicationInboxTopActionUI.js` | 13 | UI event/DOM plus global export/consumer diagnostics. |
| `js/Civication/systems/day/dayConsequencesUI.js` | 11 | Has local unknown reads but also wrapper/function contract diagnostics. |

## Recommended Phase 73

Recommended next concrete file: **`js/Civication/systems/day/dayFactionNpcReactions.js`**.

Why this is the safest next target:

- It has only **3 diagnostics** total.
- Only **1 diagnostic** is the desired local type-only category: line 39, TS2339, `career_id` on `unknown`.
- The other two diagnostics are clear global/window-declaration candidates (`CivicationNpcCharacterThreads` and `CivicationChoiceDirector`) and can be left untouched for a later declaration phase.
- It is not a large UI/DOM hotspot and does not require schemas/globals, data, runtime behavior, AHA, CSS/HTML, package/workflow, or baseline changes.
- Expected Phase 73 scope can be deliberately tiny: add local JSDoc/type-only narrowing for the existing reaction/career payload read, with no runtime logic changes.

## Explicit non-changes

This Phase 72 audit did **not** intentionally change:

- JS source under `js/**`
- `js/ui/**`
- schemas or globals declarations
- data files
- AHA
- place/emne areas
- Lesespor/Leksikon areas
- CSS or HTML
- package files or workflow files
- tests or manifests
- `TYPESCRIPT_MIGRATION.md`
- `reports/typecheck-baseline-report.md` baseline content in the final diff

Final validation should treat the GitHub Actions workflow **“Typecheck baseline report”** as the authoritative check if it runs on the PR.
