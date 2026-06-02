# Phase 93: Civication remaining diagnostics audit

## Current baseline summary

Generated from `npm run typecheck:report` on 2026-06-02.

| Metric | Current baseline |
| --- | ---: |
| Total TypeScript diagnostic lines | 1520 |
| Files with diagnostics | 181 |
| `js/Civication/**` diagnostic lines | 265 |
| `js/Civication/**` files with diagnostics | 65 |
| `js/Civication/ui/CivicationUI.js` diagnostic lines | 31 |
| `js/Civication/ui/CivicationMiniSectionsUI.js` diagnostic lines | 20 |

This is a read-only audit. No Civication runtime files, schemas/declarations, UI/CSS/DOM files, data files, `tsconfig.json`, package metadata, HTML, stories, places, people, or import tooling were changed.

## All Civication files with diagnostics

| Rank | File | Count | Codes | Diagnostic lines |
| ---: | --- | ---: | --- | --- |
| 1 | `js/Civication/ui/CivicationUI.js` | 31 | TS2339×28, TS2322×2, TS2698×1 | 85, 110, 111, 122, 187, 194, 307, 314, 397, 402, 409, 414, 488, 506, 507, 628, 693, 697, 719, 754, 781, 1136, 1143, 1172, 1186, 1333, 1346, 1373, 1396, 1397, 1401 |
| 2 | `js/Civication/ui/CivicationMiniSectionsUI.js` | 20 | TS2339×18, TS2551×2 | 33, 33, 33, 40, 40, 41, 41, 44, 44, 76, 76, 118, 122, 127, 544, 696, 697, 782, 819, 921 |
| 3 | `js/Civication/ui/CivicationMap.js` | 18 | TS2339×14, TS2362×2, TS2363×1, TS2551×1 | 6, 13, 13, 16, 17, 18, 22, 23, 27, 49, 50, 50, 73, 95, 95, 95, 96, 103 |
| 4 | `js/Civication/ui/CivicationDashboardUI.js` | 15 | TS2339×9, TS2551×6 | 61, 62, 74, 75, 126, 137, 150, 191, 218, 218, 220, 220, 241, 242, 252 |
| 5 | `js/Civication/systems/day/dayConsequencesUI.js` | 11 | TS2339×10, TS2740×1 | 12, 75, 76, 83, 87, 88, 89, 90, 128, 131, 137 |
| 6 | `js/Civication/systems/day/dayRuntimeDebugPanel.js` | 10 | TS2339×10 | 59, 59, 64, 69, 73, 76, 80, 296, 297, 310 |
| 7 | `js/Civication/systems/day/dayPatches.js` | 8 | TS2339×7, TS2322×1 | 648, 648, 690, 737, 779, 850, 869, 878 |
| 8 | `js/Civication/ui/CivicationMapModel.js` | 8 | TS2339×8 | 69, 70, 71, 72, 73, 74, 75, 76 |
| 9 | `js/Civication/ui/CivicationSystemMap.js` | 8 | TS2339×8 | 38, 53, 53, 53, 53, 53, 53, 64 |
| 10 | `js/Civication/ui/CivicationInboxTopActionUI.js` | 7 | TS2339×4, TS2551×3 | 164, 166, 194, 197, 482, 501, 540 |
| 11 | `js/Civication/systems/day/dayNpcCharacterThreads.js` | 5 | TS2339×4, TS2551×1 | 39, 143, 144, 147, 157 |
| 12 | `js/Civication/utils/storyResolver.js` | 5 | TS2339×5 | 118, 118, 461, 462, 497 |
| 13 | `js/Civication/systems/civicationBlockedJobMessages.js` | 4 | TS2339×4 | 15, 16, 24, 24 |
| 14 | `js/Civication/systems/civicationBrandJobProgression.js` | 4 | TS2339×4 | 313, 328, 356, 360 |
| 15 | `js/Civication/systems/day/dayFactionConflictSystem.js` | 4 | TS2339×4 | 89, 116, 116, 222 |
| 16 | `js/Civication/systems/day/dayNpcReactions.js` | 4 | TS2339×3, TS2551×1 | 13, 18, 285, 287 |
| 17 | `js/Civication/ui/CivicationDayPhaseUI.js` | 4 | TS2339×4 | 110, 115, 121, 168 |
| 18 | `js/Civication/ui/CivicationEmptyPanels.js` | 4 | TS2339×4 | 57, 57, 58, 79 |
| 19 | `js/Civication/core/civicationJobs.js` | 3 | TS2345×2, TS2769×1 | 323, 429, 448 |
| 20 | `js/Civication/mailPlanBridge.js` | 3 | TS2339×2, TS2551×1 | 245, 252, 690 |
| 21 | `js/Civication/systems/civicationDailyTaskGates.js` | 3 | TS2339×3 | 343, 409, 427 |
| 22 | `js/Civication/systems/civicationPeopleEngine.js` | 3 | TS2551×3 | 333, 340, 346 |
| 23 | `js/Civication/systems/civicationRoleStarter.js` | 3 | TS2339×2, TS2551×1 | 161, 162, 174 |
| 24 | `js/Civication/systems/civicationStorageTrace.js` | 3 | TS2339×2, TS2551×1 | 87, 110, 125 |
| 25 | `js/Civication/systems/day/dayAllianceMailScoring.js` | 3 | TS2339×3 | 13, 97, 116 |
| 26 | `js/Civication/systems/day/dayChoiceToneVariants.js` | 3 | TS2339×3 | 13, 175, 195 |
| 27 | `js/Civication/systems/day/dayConsequences.js` | 3 | TS2339×3 | 18, 309, 311 |
| 28 | `js/Civication/systems/day/dayFactionMailScoring.js` | 3 | TS2339×3 | 41, 94, 114 |
| 29 | `js/Civication/systems/day/dayFactionVoice.js` | 3 | TS2339×3 | 28, 84, 104 |
| 30 | `js/Civication/systems/day/dayNarrativeConsequencesUI.js` | 3 | TS2339×2, TS2740×1 | 168, 171, 177 |
| 31 | `js/Civication/systems/day/dayPeopleMeetingGate.js` | 3 | TS2339×3 | 12, 53, 72 |
| 32 | `js/Civication/systems/day/dayPeopleMeetingRelationshipVariant.js` | 3 | TS2339×3 | 12, 150, 170 |
| 33 | `js/Civication/ui/CivicationBrandJobUI.js` | 3 | TS2339×2, TS2551×1 | 82, 98, 222 |
| 34 | `js/Civication/ui/CivicationPeopleReactionsUI.js` | 3 | TS2551×3 | 5, 25, 41 |
| 35 | `js/Civication/core/civicationEventEngine.js` | 2 | TS2362×1, TS2363×1 | 42, 42 |
| 36 | `js/Civication/core/civicationState.js` | 2 | TS2362×1, TS2363×1 | 389, 389 |
| 37 | `js/Civication/systems/civicationActivePositionRecovery.js` | 2 | TS2322×1, TS2339×1 | 170, 226 |
| 38 | `js/Civication/systems/civicationBrandEmployerBridge.js` | 2 | TS2339×2 | 98, 100 |
| 39 | `js/Civication/systems/civicationDailyMailBuilder.js` | 2 | TS2322×1, TS2339×1 | 1260, 1459 |
| 40 | `js/Civication/systems/civicationRuntimeSanityGuard.js` | 2 | TS2339×2 | 59, 245 |
| 41 | `js/Civication/systems/day/dayAllianceSystem.js` | 2 | TS2339×2 | 33, 118 |
| 42 | `js/Civication/systems/day/dayCharacterReplyConsequences.js` | 2 | TS2339×2 | 18, 38 |
| 43 | `js/Civication/systems/day/dayFactionNpcReactions.js` | 2 | TS2339×2 | 20, 56 |
| 44 | `js/Civication/systems/day/dayProgressionController.js` | 2 | TS2339×2 | 52, 219 |
| 45 | `js/Civication/systems/day/dayWeeklyReview.js` | 2 | TS2362×1, TS2363×1 | 19, 19 |
| 46 | `js/Civication/ui/CivicationDebateUI.js` | 2 | TS2551×2 | 20, 115 |
| 47 | `js/Civication/ui/CivicationHome.js` | 2 | TS2339×1, TS2322×1 | 161, 348 |
| 48 | `js/Civication/ui/CivicationMapZonesFallback.js` | 2 | TS2551×2 | 4, 6 |
| 49 | `js/Civication/ui/CivicationOnboardingUI.js` | 2 | TS2339×2 | 8, 33 |
| 50 | `js/Civication/ui/CivicationPeopleUI.js` | 2 | TS2551×2 | 14, 44 |
| 51 | `js/Civication/identityCompass.js` | 1 | TS2551×1 | 94 |
| 52 | `js/Civication/identityEngine.js` | 1 | TS2339×1 | 225 |
| 53 | `js/Civication/merits-and-jobs.js` | 1 | TS2304×1 | 193 |
| 54 | `js/Civication/roleThreadResolver.js` | 1 | TS2339×1 | 439 |
| 55 | `js/Civication/systems/civicationBrandJobState.js` | 1 | TS2339×1 | 217 |
| 56 | `js/Civication/systems/civicationCareerOutcomeRuntime.js` | 1 | TS2339×1 | 563 |
| 57 | `js/Civication/systems/civicationDebateEngine.js` | 1 | TS2551×1 | 605 |
| 58 | `js/Civication/systems/civicationLifeMailRuntime.js` | 1 | TS2551×1 | 388 |
| 59 | `js/Civication/systems/civicationMailPlanDebug.js` | 1 | TS2339×1 | 12 |
| 60 | `js/Civication/systems/civicationMailRuntime.js` | 1 | TS2339×1 | 681 |
| 61 | `js/Civication/systems/civicationPlaceAccessBridge.js` | 1 | TS2339×1 | 198 |
| 62 | `js/Civication/systems/day/dayActiveRoleStateSync.js` | 1 | TS2339×1 | 370 |
| 63 | `js/Civication/systems/day/dayChoiceDirector.js` | 1 | TS2339×1 | 104 |
| 64 | `js/Civication/systems/day/dayFactionChoiceSystem.js` | 1 | TS2339×1 | 61 |
| 65 | `js/Civication/ui/CivicationStoreUI.js` | 1 | TS2551×1 | 85 |

## Diagnostics grouped by TypeScript code

| Code | Count | Primary pattern | Phase/risk guidance |
| --- | ---: | --- | --- |
| TS2339 | 209 | Property access on `unknown`, `Window & typeof globalThis`, `typeof globalThis`, or DOM `Element` shapes. Repeated properties include `CivicationNpcCharacterThreads`, `CiviMailPlanBridge`, `career_id`, `home`, `CivicationChoiceDirector`, `title`, and map globals. | Split into declaration-only passes for missing globals and local JSDoc/cast passes for unknown/object or DOM element reads. Do not mix UI and core/event/job/state files. |
| TS2551 | 34 | Missing/near-match `window.*` globals such as `CivicationMiniSectionsUI`, `CivicationPeopleEngine`, `CivicationBrandJobUI`, `CivicationNpcReactions`, and map helpers. | Declaration-only candidates after verifying current runtime export names. Avoid changing runtime symbols just to satisfy TypeScript. |
| TS2322 | 6 | Assignment shape mismatches: boolean assigned to a function-bag type, zone-map object assigned to narrower model shape, phase slot object shape, and number/string mismatch. | Mostly contract-sensitive. Audit exact object contracts before edits; one-off local casts may be safe only when the runtime value is intentionally broad. |
| TS2362 | 5 | Left-hand arithmetic operands are Date/object/unknown-ish. | Safe `Number(...)`/`.getTime()` micro-fix candidates when the current expression is clearly numeric date math. Best next target: `civicationEventEngine.js` `weekKey()`. |
| TS2363 | 4 | Right-hand arithmetic operands are Date/object/unknown-ish. | Same as TS2362. Keep date math micro-fixes isolated and avoid changing week-key semantics. |
| TS2345 | 2 | Career progression offer objects omit brand/employer fields expected by `pushOffer`. | Job/state contract issue. Do not patch with dummy fields before auditing the offer contract and downstream consumers. |
| TS2740 | 2 | Wrapped renderer functions assigned/cast as `Window`-like shapes. | Runtime patch/wrapper sensitive. Defer until a dedicated wrapper-contract pass. |
| TS2769 | 1 | `concat` combines inbox envelopes with a narrower existing inbox item shape. | Array/object-shape issue in `civicationJobs.js`; likely Phase 95, separate from event-engine numeric work. |
| TS2304 | 1 | Missing local/global symbol `catIdFromDisplay`. | Declaration or local helper provenance audit required. Do not invent runtime helper without locating source. |
| TS2698 | 1 | Spread from a value TypeScript cannot prove is an object in `CivicationUI.js`. | UI local object-shape candidate, but defer behind UI-sensitive clusters. |

## Top 10 Civication hotspots

| Rank | File | Count | Dominant risk profile | Recommended handling |
| ---: | --- | ---: | --- | --- |
| 1 | `js/Civication/ui/CivicationUI.js` | 31 | UI/DOM-sensitive local property access plus object-shape assignments. | Defer broad UI work; use future very narrow local casts only, one rendering cluster at a time. |
| 2 | `js/Civication/ui/CivicationMiniSectionsUI.js` | 20 | UI summary/detail unknown-shape access and missing UI globals. | Separate local summary/detail cast pass from declaration-only globals. |
| 3 | `js/Civication/ui/CivicationMap.js` | 18 | Map globals plus numeric SVG/layout arithmetic. | UI/map-sensitive; do not mix with core date-math. Audit map globals before casts. |
| 4 | `js/Civication/ui/CivicationDashboardUI.js` | 15 | UI dashboard global loads and local state-property reads. | UI-sensitive; likely declaration-only for loaded UI globals, then local dashboard state casts. |
| 5 | `js/Civication/systems/day/dayConsequencesUI.js` | 11 | Day consequence UI rendering, wrapper shape, active career access. | Defer wrapper assignment; local career/consequence casts may be safe in a dedicated UI/day pass. |
| 6 | `js/Civication/systems/day/dayRuntimeDebugPanel.js` | 10 | Debug panel global/state access. | Low runtime impact but broad debug surface; declaration-only/global audit first. |
| 7 | `js/Civication/systems/day/dayPatches.js` | 8 | Runtime patch hooks and function assignment shape. | Runtime-sensitive; only change under a dedicated patch-contract pass. |
| 8 | `js/Civication/ui/CivicationMapModel.js` | 8 | Map model global/data-shape exposure. | Schema/data-contract or declaration-only audit; avoid UI map behavior changes. |
| 9 | `js/Civication/ui/CivicationSystemMap.js` | 8 | System-map object/property access and public export. | UI-sensitive local casts; separate from map model declarations. |
| 10 | `js/Civication/ui/CivicationInboxTopActionUI.js` | 7 | Inbox/UI globals and DOM event handlers. | UI-sensitive; can be a future DOM/global micro-pass, not with core event/job files. |

## Concrete line/function overview for largest and sensitive files

### `js/Civication/ui/CivicationUI.js` — 31 diagnostics

- `rerenderMailViews()` around line 85: one `TS2339` global/window or property-access diagnostic.
- Early click handlers around lines 110, 111, and 122: three `TS2339` UI handler diagnostics.
- Active-position/pending-state clusters around lines 187, 194, 307, and 314: four `TS2339` local unknown/property-access diagnostics.
- Repeated conditional/render clusters around lines 397, 402, 409, 414, 488, 506, and 507: seven `TS2339` diagnostics.
- `openDistrictSelector()` around line 628: one `TS2322` assignment/shape diagnostic.
- `renderWorkdayPanel()` and nearby workday state reads around lines 693, 697, 719, 754, and 781: five `TS2339` diagnostics.
- Late UI action/rendering clusters around lines 1136, 1143, 1172, 1186, 1333, and 1346: six `TS2339` diagnostics.
- `renderPerception()` around lines 1396, 1397, and 1401: one `TS2698` spread/object-shape diagnostic plus two `TS2339` property reads.
- Recommendation: do not resume broad CivicationUI work in Phase 94; keep UI work parked and split any future pass by one UI function/cluster.

### `js/Civication/ui/CivicationMiniSectionsUI.js` — 20 diagnostics

- Summary/detail rendering at lines 33, 40, 41, 44, 76, 118, 122, and 127: thirteen `TS2339` local property-access diagnostics, mostly summary/detail object shape.
- Middle UI refresh/opening lines 544, 696, 697, 782, 819, and 921: five `TS2339`/`TS2551` diagnostics around mini-section UI globals, structure, refresh scheduling, and handlers.
- Recommendation: future work should separate summary/detail local JSDoc casts from missing `window.CivicationMiniSectionsUI` declaration checks.

### `js/Civication/ui/CivicationMap.js` — 18 diagnostics

- Lines 6, 13, 16, 17, 18, 22, 23, 27, 49, 50, 73, and 96: map/global property diagnostics (`TS2339`).
- Lines 50 and 95: map-layout arithmetic diagnostics (`TS2362`/`TS2363`).
- Line 103: missing/near-match map export diagnostic (`TS2551`).
- Recommendation: defer because map rendering is UI-sensitive. If tackled later, split declaration-only map globals from numeric SVG/layout coercion.

### `js/Civication/ui/CivicationDashboardUI.js` — 15 diagnostics

- `ensureMiniModeLoaded()` / `ensureBrandJobUILoaded()` around lines 61, 62, 74, and 75: four `TS2551` missing UI-global diagnostics.
- Dashboard state/label reads around lines 126, 137, 150, and 191: four `TS2339` local property-access diagnostics.
- `render()` / `scheduleRender()` around lines 218, 220, 241, 242, and 252: mixed `TS2339`/`TS2551` UI global and state reads.
- Recommendation: UI-sensitive; prefer a declaration-only pass for verified public UI globals before local dashboard casts.

### `js/Civication/systems/day/dayConsequencesUI.js` — 11 diagnostics

- Lines 12 and 75–90: active-career and consequence-box property reads (`TS2339`).
- Lines 128, 131, and 137: renderer patch/wrapper diagnostics including `TS2740`.
- Recommendation: defer wrapper assignment diagnostics; local consequence payload casts can be a future day-UI-only pass.

### `js/Civication/systems/day/dayRuntimeDebugPanel.js` — 10 diagnostics

- Lines 59, 64, 69, 73, 76, and 80: debug panel getters reading plan, people, alliance, faction, day progression, and runtime globals.
- Lines 296, 297, and 310: render scheduling and debug panel UI state reads.
- Recommendation: mostly declaration/local-cast candidates, but not a Phase 94 target because the panel touches many day-system contracts.

### `js/Civication/core/civicationEventEngine.js` — 2 diagnostics

- `weekKey()` line 42: `TS2362` and `TS2363` on `date - yearStart` date arithmetic.
- Existing behavior computes an ISO-like week number from two `Date` objects. The smallest likely fix is numeric coercion (`Number(date) - Number(yearStart)` or equivalent `.getTime()` values) scoped to this expression only.
- Recommendation: best Phase 94 target because it is isolated, mechanical, and should not change event flow, inbox flow, choice/effect behavior, or runtime model.

### `js/Civication/core/civicationJobs.js` — 3 diagnostics

- `prependInboxEvents()` line 323: `TS2769` because `.concat(existing)` combines newly-created inbox envelopes with an `existing` array typed as `{ event?: { id?: string | number } }[]`, which lacks required `status` and `createdAt` fields from the mapped envelope shape.
- `maybeOfferCareerProgression()` lines 429 and 448: two `TS2345` diagnostics because the pushed progression offers include `career_id`, `career_name`, `title`, `threshold`, and `points_at_offer`, but the current inferred `pushOffer` payload expects additional brand/employer context fields.
- Recommendation: do not include in Phase 94. Treat as a separate Phase 95 job/object-shape audit or micro-pass after confirming the inbox envelope and offer payload contract.

### `js/Civication/core/civicationState.js` — 2 diagnostics

- `weekKey()` line 389: `TS2362` and `TS2363` on `date - yearStart` date arithmetic.
- This mirrors the event-engine date-math pattern, but the state module is a global source-of-truth file.
- Recommendation: safe in principle as numeric coercion, but leave out of Phase 94 unless the phase explicitly allows one additional same-pattern state target. Prefer event-engine first.

## Classification by migration strategy

### 1. Arithmetic / numeric coercion issues

Files and lines: `civicationEventEngine.js` line 42, `civicationState.js` line 389, `dayWeeklyReview.js` line 19, and `CivicationMap.js` lines 50 and 95.

- Safe `Number(...)` / `.getTime()` candidates: `civicationEventEngine.js` line 42, because it is a single expression inside `weekKey()` and TypeScript is objecting to `Date` subtraction rather than to a broader data contract.
- Probably safe but more sensitive: `civicationState.js` line 389, because it is the global state week utility and should be handled only after the event-engine micro-pass or in the same phase only if reviewers want one extra identical target.
- UI-sensitive numeric candidates: `CivicationMap.js` lines 50 and 95. Defer because map layout/rendering should not be mixed with core date math.
- Runtime-sensitive day-system candidate: `dayWeeklyReview.js` line 19. Defer to a day-weekly review pass.

### 2. Array / concat / object-shape issues

Files and lines: `civicationJobs.js` lines 323, 429, and 448; `CivicationUI.js` line 1396; selected `TS2322` files.

- `civicationJobs.js` line 323 is a clear array/concat object-shape issue and should be Phase 95 or later, not Phase 94.
- `civicationJobs.js` lines 429 and 448 require a job-offer payload contract audit before deciding whether to widen local JSDoc or include optional brand/employer fields.
- `CivicationUI.js` line 1396 is UI-local spread/object-shape work and should wait for a UI-only pass.

### 3. Global / window declaration issues

Most `TS2339`/`TS2551` diagnostics against `Window & typeof globalThis` or `typeof globalThis` are declaration-only candidates after verifying runtime exports. Examples include `CivicationMiniSectionsUI`, `CivicationPeopleEngine`, `CivicationBrandJobUI`, `CivicationNpcReactions`, `CivicationNpcCharacterThreads`, `CiviMailPlanBridge`, `CivicationChoiceDirector`, `CivicationDailyMailBuilder`, and map globals.

- Safe declaration-only candidates: files that only assign or read a known existing `window.*` export and do not require local runtime shape decisions.
- Not automatically safe: globals where TypeScript suggests a similarly named existing global. Verify the actual runtime export name before adding declarations; do not rename runtime globals.

### 4. Local unknown / property-access issues

These are mostly `TS2339` reads from values TypeScript sees as `unknown`, for example `career_id`, `title`, `home`, `event`, `ok`, and domain-specific day-system payloads.

- Safe local JSDoc/cast candidates: single-function clusters that only read optional fields and already use defensive runtime fallbacks.
- Schema/data-contract audit candidates: repeated domain payload properties that imply a shared object contract, especially job offers, map model entries, day consequence payloads, and story resolver records.

### 5. DOM / UI-sensitive issues

UI files remain the largest Civication concentration: `CivicationUI.js`, `CivicationMiniSectionsUI.js`, `CivicationMap.js`, `CivicationDashboardUI.js`, `CivicationSystemMap.js`, and `CivicationInboxTopActionUI.js`.

- Future UI phases should target one function or rendering cluster at a time.
- Do not mix UI DOM casts with core/event/job/state changes.
- Map rendering and dashboard loading are especially sensitive because small typing edits can accidentally alter layout, loaded globals, or initialization timing.

### 6. Event / job / state contract issues

Core/event/job/state files have few diagnostics but higher runtime risk.

- `civicationEventEngine.js` line 42: isolated numeric coercion; best Phase 94 candidate.
- `civicationState.js` line 389: same numeric pattern but state source-of-truth; safe only as a very explicit same-pattern follow-up.
- `civicationJobs.js` lines 323, 429, 448: job/inbox/offer contract-sensitive; keep separate from event-engine numeric work.
- Day patch/wrapper files (`dayPatches.js`, `dayConsequencesUI.js`, `dayNarrativeConsequencesUI.js`) touch runtime monkey-patches/wrappers and should be isolated.

### 7. Issues that should be deferred

- Broad CivicationUI cleanup: parked at a lower baseline after Phase 82–89 and should not be reopened as a broad pass.
- `civicationJobs.js` offer payload shape: defer until a dedicated job-contract pass.
- Wrapper assignment diagnostics (`TS2740`) in day UI consequence wrappers: defer until wrapper-contract audit.
- Map rendering arithmetic/globals: defer because it is UI/layout-sensitive.
- Missing helper `catIdFromDisplay`: defer until provenance is located; do not invent a helper in a migration pass.

## Recommended Phase 94

Recommended Phase 94 should have **one safe target**:

1. `js/Civication/core/civicationEventEngine.js` only: a pure numeric-coercion micro-pass in `weekKey()` line 42, replacing the typed `Date` subtraction with explicit numeric date values while preserving the existing week-number calculation.

Do **not** include `civicationJobs.js` in Phase 94. Its `concat`/offer diagnostics should be a separate Phase 95 after a job/inbox/offer contract audit. Also do not mix `CivicationUI.js`, `CivicationMiniSectionsUI.js`, map UI files, schemas/declarations, or day patch/wrapper files into Phase 94.
