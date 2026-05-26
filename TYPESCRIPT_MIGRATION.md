# TypeScript migration phase 1

This repository now has TypeScript configured as a **development-only type checker** without changing runtime behavior.

## What is set up

- `typescript` added as a dev dependency.
- Root `tsconfig.json` created.
- New `schemas/` folder with starter interfaces:
  - `place.ts`
  - `person.ts`
  - `badge.ts`
  - `quiz.ts`
  - `civication.ts`

## Why `allowJs`, `checkJs`, and `noEmit`

- `allowJs: true` lets TypeScript read existing JavaScript files.
- `checkJs: true` enables static type analysis directly in `.js` files.
- `noEmit: true` guarantees no output files are generated (no build/runtime change).

This supports gradual migration with no framework, bundler, or architecture changes.

## How gradual migration should work

1. Keep existing runtime in JavaScript.
2. Add JSDoc type hints in high-value JS modules.
3. Introduce utility-level TypeScript files as isolated additions.
4. Migrate larger loaders/data layers later, in controlled steps.

## Recommended next steps

- Start adding JSDoc types to shared helpers and data normalization functions.
- Migrate low-risk utility modules to `.ts` one by one.
- Plan loader migration later when schemas and data contracts are stable.

## Phase 2: Place schema alignment

- `schemas/place.ts` is now aligned with stable fields used in existing place data (for example `name` and `lon` as primary coordinate/name keys).
- Place loading in `js/boot.js` now has focused JSDoc typing for core place arrays and fallback file lists.
- Runtime behavior is unchanged; this is type/schema groundwork only.
- This reduces risk for the next loader-typing and validator steps by improving schema accuracy first.

## Phase 3: Storage schema and JSDoc groundwork

- `schemas/storage.ts` defines the current localStorage-backed shapes used by core History Go state, including visited places, collected people, merits, progress, dialogs, notes and Groundhopper stats.
- `js/state/state.js` now has lightweight JSDoc annotations for persisted state reads.
- `js/state/persistence.js` now has focused JSDoc annotations for persistence helpers and Groundhopper stats without changing storage keys or runtime behavior.
- `schemas/place.ts` includes the optional `sport_profile` field already used by Groundhopper logic.
- This phase documents the existing storage contract only; it does not centralize, rename, migrate or normalize localStorage data.


## Phase 4: Global/window typings for browser runtime contracts

- Added `schemas/globals.d.ts` with minimal `Window` declarations for existing browser globals used by current JavaScript runtime.
- Declarations reuse existing schema types (`Place`, `VisitedPlaces`, `MeritsByCategory`, `GroundhopperStats`) where relevant.
- No runtime logic, script loading behavior, localStorage keys, or data files were changed.
- This phase is declaration-only to reduce known global/window typecheck noise; the remaining broader typecheck baseline is still expected.

## Phase 5: Stronger JSDoc typing in `js/boot.js`

- `js/boot.js` now has stronger place-loading JSDoc annotations using a file-local alias (`BootPlace`) imported from `schemas/place`.
- The central place arrays (`places`, including DataHub loader cast) are now explicitly typed with `BootPlace[]`.
- Runtime behavior and loader/data flow are unchanged (no changes to fetch paths, fallbacks, DataHub logic, or startup flow).
- Remaining `npm run typecheck` baseline outside this focused JSDoc update is still expected.

## Phase 6: DataHub global typing

- `schemas/globals.d.ts` now includes a minimal `DataHubApi` declaration for the existing `window.DataHub` runtime object.
- The declaration documents current DataHub loader contracts such as `loadPlacesBase`, `loadFullPlace`, `getPlaceEnriched`, `loadEnrichedAll`, fag loaders, quiz loaders and nature loaders.
- Place-returning loaders reuse the existing `Place` schema where practical, while broader legacy loaders remain intentionally typed as `unknown`/`unknown[]` until their data contracts are stabilized.
- This phase is declaration-only and does not change `js/dataHub.js`, fetch behavior, cache behavior, paths, localStorage or startup flow.
- The broader `npm run typecheck` baseline is still expected to remain.

## Phase 7: Knowledge Engine JSDoc groundwork

- `js/hgKnowledgeEngine.js` now has focused JSDoc aliases for the read-only analysis flow, including `KnowledgePlace`, `KnowledgeState`, `KnowledgeSubjectSignals` and `KnowledgeAnalysisResult`.
- The analysis documents its place lookup as `Map<string, KnowledgePlace>` and uses the existing `Place` schema for visited-place signal extraction.
- Runtime behavior is unchanged: no changes were made to DataHub calls, scoring, signal collection, `fullVisitedPlacesLoadedCount`, localStorage keys or output structure.
- Remaining `npm run typecheck` baseline outside this focused JSDoc update is still expected.

## Phase 8: Knowledge Engine globals for profile usage

- Added `schemas/knowledge-engine-globals.d.ts` to document the existing `window.HGKnowledgeEngine` and `window.hgKnowledgeReport` browser globals used by profile-related UI.
- This avoids touching the large and sensitive `js/profile.js` file while still making the Knowledge Engine profile contract visible to TypeScript.
- The declaration is intentionally broad around report internals (`Record<string, unknown>`) until a stable report schema is introduced.
- Runtime behavior is unchanged: no profile rendering, DOM, metrics, DataHub calls, localStorage keys or output structure were modified.
- Remaining `npm run typecheck` baseline is still expected.

## Phase 8B: Focused profile JSDoc around Knowledge Engine panel

- `js/profile.js` now has focused JSDoc around `renderKnowledgeEnginePanel`, including a file-local report alias and narrow local variable annotations for the Knowledge Engine report flow.
- The local report typing remains intentionally broad (`Record<string, unknown>` and `unknown[]`) to match current runtime variability.
- Runtime/rendering behavior is unchanged: no DOM structure, layout, profile metrics, Knowledge Engine logic, DataHub calls, localStorage keys, or output text were changed.
- Remaining `npm run typecheck` baseline outside this focused annotation scope is still expected.

## Phase 9: Read-only typecheck baseline reporting

- Added a read-only baseline report script at `tools/typecheck-baseline-report.mjs`.
- New command: `npm run typecheck:report`.
- Report output path: `reports/typecheck-baseline-report.md`.
- This phase performs no type fixes and no runtime/app behavior changes.
- The report is used to prioritize future migration targets from the actual baseline distribution.

## Phase 10: Civication read-only global typings baseline

- Added `schemas/civication-globals.d.ts` to document existing Civication browser globals that are already used at runtime.
- Declarations are intentionally broad and defensive (`Record<string, unknown>`, `unknown[]`, broad function signatures) to avoid changing Civication runtime assumptions.
- Added both `Window` properties and minimal global symbol declarations for legacy direct global usage (for example `CivicationState`, `CivicationEconomyEngine`, and `CivicationObligationEngine`).
- No Civication runtime files were modified, and no changes were made to economy, obligations, inbox/state behavior, lifestyle/capital logic, localStorage keys, or JSON/data files.
- This phase is declaration-only and intended to reduce typecheck baseline noise in `js/Civication/**` without refactoring Civication logic.


## Phase 11: Focused Event Engine JSDoc

- Added focused, file-local JSDoc typing in `js/Civication/core/civicationEventEngine.js`.
- Introduced intentionally broad local aliases for event, inbox, state, choice and free-form record structures to reduce type friction without changing behavior.
- Annotated central state/inbox/event handling methods and a few local variables for readability and gradual typecheck progress.
- No runtime logic, event-flow, choice/effects behavior, localStorage keys, DataHub calls, app wiring, or Civication data/JSON files were changed.
- Remaining typecheck baseline outside this focused file is still expected.

## Phase 12: Focused Civication UI JSDoc

- Added focused, file-local JSDoc typing in `js/Civication/ui/CivicationUI.js`.
- Introduced intentionally broad UI/event/state/inbox aliases to support gradual typechecking in this hotspot without refactoring runtime behavior.
- Annotated central UI rendering/event handling helpers with minimal parameter/return typing.
- No runtime logic, DOM structure, rendering, layout, CSS, UI text, localStorage keys, event-flow, choices/effects behavior, DataHub calls, or Civication data/JSON files were changed.
- Remaining typecheck baseline outside this focused file is still expected.

## Phase 13: Focused PlaceCard JSDoc

- Added focused, file-local JSDoc typing in `js/ui/place-card.js`.
- Added intentionally broad local aliases for place/place-related records (`PlaceCardPlace`, `PlaceCardRecord`, `PlaceCardPerson`, `PlaceCardBadge`, `PlaceCardRelation`) to support gradual typechecking without schema tightening.
- Annotated central PlaceCard entry/helpers for place rendering, social-data loading, unlock UI updates, and bottom-sheet bridge helpers.
- No runtime logic, DOM structure, rendering, layout, CSS, UI text, popup behavior, Nearby behavior, map behavior, unlock/quiz/state behavior, DataHub behavior, localStorage keys, or data/JSON files were changed.
- Remaining typecheck baseline outside this focused file is still expected.

## Phase 13B: PlaceCard JSDoc regression fix

- Fixed the narrow `PlaceCardPlace` alias introduced in Phase 13.
- Widened the file-local PlaceCard shape in `js/ui/place-card.js` to match runtime-used fields.
- No runtime, layout, DOM, CSS, rendering, or data-contract behavior changes were made.
- Regenerated `reports/typecheck-baseline-report.md` after the JSDoc-only adjustment.

## Phase 14: Popup-utils JSDoc groundwork (stability-adjusted)

- Attempted focused JSDoc typing in `js/ui/popup-utils.js`, but the first annotation set increased baseline diagnostics in `js/ui/**`.
- Rolled back the problematic popup-utils annotations to preserve the post-Phase 13B baseline trend (no increase in total diagnostics/UI diagnostics).
- This phase is therefore treated as JSDoc groundwork only, pending a later pass with broader cross-file/global typing support.
- No runtime logic, popup behavior, DOM structure, rendering, layout, CSS, z-index, UI text, PlaceCard, Nearby, map, unlock/quiz/state, localStorage keys, DataHub calls, or data/JSON files were changed.

## Phase 15: Profile JSDoc groundwork only (stability-adjusted)

- Attempted focused, file-local JSDoc typing in `js/profile.js`, but the first annotation pass increased baseline diagnostics.
- Rolled back the problematic profile annotations to preserve the post-Phase 14 baseline direction (no increase in total diagnostics).
- This phase is therefore documented as groundwork only, pending a safer follow-up pass with broader typing support.
- Baseline reflects current main after intervening Civication merges; Phase 15 leaves `js/profile.js` unchanged at 84 diagnostics.
- No runtime logic, profile UI, DOM structure, rendering, layout, CSS, text, progression/badge/quiz logic, localStorage keys/contracts, Knowledge Engine runtime, DataHub calls, state/persistence contracts, or app/data files were changed.

## Phase 16: Focused day progression controller JSDoc

- Added focused, file-local JSDoc typing in `js/Civication/systems/day/dayProgressionController.js`.
- Added intentionally broad local day progression aliases for runtime item/mail event/inspection/advance result shapes to avoid runtime-coupled overtyping.
- Annotated the central controller methods (`inspect`, `canAdvancePhase`, `advancePhaseIfReady`) and small phase/status helpers with minimal parameter/return typing.
- No runtime logic, phase-flow/day progression behavior, mail-runtime, DailyMailBuilder, EventChannels dispatch names, Calendar behavior, UI/DOM/rendering/layout/CSS/text, localStorage keys/contracts, or data/JSON files were changed.
- Remaining baseline diagnostics outside this focused JSDoc update are expected.

## Phase 17: Focused Civication boot JSDoc

- Added focused, file-local JSDoc typing in `js/Civication/CivicationBoot.js`.
- Added intentionally broad boot/UI/engine/global aliases to document boot/init contracts without tightening runtime-coupled dynamic behavior.
- Annotated central boot helpers (`ensure*`, data load, boot start, and boot error handling) with minimal parameter/return typing.
- No runtime logic, boot order, script loading, engine init, UI init, mail flow, day progression, localStorage keys/contracts, or data/JSON files were changed.
- Remaining typecheck baseline outside this focused update is expected.

## Phase 18: Focused Civication economy engine JSDoc

- Added focused, file-local JSDoc typing in `js/Civication/core/civicationEconomyEngine.js`.
- Added intentionally broad economy aliases for wallet/career/progress/rules/tick-result contracts to reduce hotspot type friction without tightening runtime-coupled dynamic behavior.
- Declaration-level fixes for `deriveTierFromPoints` / `window.HGLearningLog` are intentionally deferred to a later, isolated globals pass to avoid baseline instability in this phase.
- No runtime logic, economy logic, weekly tick/wallet/career/progression behavior, localStorage keys/contracts, UI/mail/day progression flow, or data/JSON files were changed.
- Remaining typecheck baseline outside this focused update is expected.


## Phase 19: Civication globals-only declaration pass

- Added globals-only declarations in `schemas/civication-globals.d.ts` for `deriveTierFromPoints` and `window.HGLearningLog` using intentionally broad, runtime-safe shapes.
- Kept the pass declaration-only (no runtime/app code changes) and did not alter economy logic, weekly tick behavior, wallet/career/progression flow, localStorage contracts, UI/DOM/layout/CSS, mail flow, day progression, or data/JSON files.
- Regenerated the typecheck baseline report to confirm baseline trend/expectations for remaining diagnostics.
- Follow-up adjustment: `HGLearningLog` fallback index signature is callable (`CiviLearningLogFn | undefined`) to avoid TS2349 call regressions from `unknown` fallback members.

## Phase 20: Civication Event Engine second focused JSDoc pass

- Added a second focused, JSDoc-only pass in `js/Civication/core/civicationEventEngine.js`.
- Reused and carefully widened existing file-local event/inbox/state/choice/task-result aliases to keep dynamic Civication runtime contracts broad and stable.
- Added/adjusted method-level JSDoc on existing Event Engine helpers only (no new runtime helpers/functions introduced).
- No runtime logic, event-flow, inbox-flow, jobmail/private-message-flow, choices/effects/task-result behavior, localStorage keys/contracts, UI/DOM/rendering/layout/CSS/text, or data/JSON contracts were changed.
- Remaining baseline diagnostics are still expected as part of incremental migration.

## Phase 21: Civication UI second JSDoc groundwork

- Evaluated a second focused JSDoc pass for `js/Civication/ui/CivicationUI.js`.
- The attempted annotations were not retained because this phase prioritized baseline stability and no safe reduction was identified.
- `js/Civication/ui/CivicationUI.js` remains unchanged in this phase.
- Regenerated the typecheck baseline report to confirm the baseline remains stable.
- No runtime logic, UI rendering, DOM structure, layout, CSS, UI text, inbox/jobmail/private-message flow, choices/effects behavior, localStorage keys/contracts, or data/JSON contracts were changed.
- Remaining typecheck baseline is still expected as part of gradual migration.

## Phase 22: Focused capitalEngine JSDoc

- Added focused, file-local JSDoc typing in `js/Civication/capitalEngine.js`.
- Introduced broad local capital/state-oriented aliases (`CiviCapitalRecord`, `CiviCapitalVector`, `CiviCapitalEntry`, `CiviCapitalRuntimeUser`) and applied them on existing helpers only.
- No runtime logic, capital calculation behavior, economic/cultural/social/symbolic logic, localStorage keys/contracts, UI/DOM/rendering, or data/JSON contracts were changed.
- Remaining typecheck baseline outside this focused update is still expected.

## Phase 23: Focused capitalMaintenanceEngine JSDoc

- Added focused, file-local JSDoc typing in `js/Civication/capitalMaintenanceEngine.js`.
- Introduced broad local maintenance aliases for record/profile/vector/meta/config contracts to keep runtime-coupled dynamic fields intentionally loose.
- No runtime logic, capital maintenance behavior, decay behavior, `maintenanceDays`/`decayPerDay` logic, localStorage keys, UI/DOM/rendering, or data/JSON contracts were changed.
- Remaining typecheck baseline outside this focused update is still expected.

## Phase 24: Focused civicationCommercial JSDoc

- Added focused, file-local JSDoc typing in `js/Civication/civicationCommercial.js`.
- Introduced broad local commercial/shop aliases for record, wallet, inventory, pack and store contracts to reduce dynamic field type friction.
- Annotated existing commercial helpers for wallet/inventory/data-loading/visibility/purchase flow without changing runtime behavior.
- No runtime/shop/purchase/sell/refund/wallet/balance/packs/ownedItems/localStorage/UI/data logic was changed.
- Remaining baseline diagnostics outside this focused file are still expected.

## Phase 25: Focused civicationObligationEngine JSDoc

- Added focused, file-local JSDoc typing in `js/Civication/civicationObligationEngine.js`.
- Introduced broad local obligation aliases for record/state/career/contract/item/active-position contracts to reduce dynamic `career`/`career_id`/obligation-field type friction.
- Annotated existing obligation helpers around state access, career bootstrapping, contract/metrics computation and quiz-history filtering only.
- No runtime, obligation logic, career/career_id flow, state contract, localStorage keys, UI/DOM, or data/JSON behavior was changed.
- Remaining baseline diagnostics outside this focused file are still expected.

## Phase 26: Focused CivicationPsyche JSDoc

- Added focused, file-local JSDoc typing in `js/Civication/core/CivicationPsyche.js`.
- Introduced broad local psyche aliases for record/state/profile/trust-meta contracts to reduce dynamic `autonomy`/`trust`/`economy_profile` type friction.
- Annotated existing storage/state helpers and selected local lifestyle/identity variables only, with intentionally broad types.
- No runtime, psyche, autonomy, trust, economy_profile, state/localStorage, UI/DOM, rendering, or data/JSON behavior was changed.
- Remaining typecheck baseline outside this focused file is still expected.

## Phase 27: Civication economy engine second focused JSDoc pass

- Added a second focused, JSDoc-only pass in `js/Civication/core/civicationEconomyEngine.js`.
- Reused and lightly extended existing broad file-local economy aliases for wallet/career/progress/tick-result contracts, plus a minimal broad badge alias to reduce remaining unknown-property noise.
- Added narrow local variable/function-level JSDoc annotations in existing economy helpers only (no new runtime helpers, no flow refactors).
- No runtime/economy/salary/weekly tick/wallet/balance/career/progression/badge/tier/`deriveTierFromPoints`/`window.HGLearningLog`/localStorage/UI/data behavior changed.
- Remaining typecheck baseline outside this focused pass is expected.


## Phase 28: Third focused Civication economy engine JSDoc pass

- Added a third focused, JSDoc-only typing pass in `js/Civication/core/civicationEconomyEngine.js` after Phase 27.
- Added safe local casts/annotations for active position, career lookups, badge lookups, and career-rule access to reduce `unknown` property-access diagnostics without changing runtime flow.
- Added declaration-only Civication globals in `schemas/civication-globals.d.ts` for existing runtime symbol (`CivicationPsyche`) to reduce missing-global friction.
- `getQuizCountLastWeek` was not declared as a global, because it does not exist as a global runtime function; the remaining `TS2304` in the economy engine is deferred to a separate runtime/architecture clarification phase.
- Runtime behavior is unchanged: no economy logic, wallet/balance/salary/weekly tick/career/progression/badge/tier behavior, localStorage keys, dispatch/updateProfile flow, UI/layout, or data contracts were changed.
- Regenerated `reports/typecheck-baseline-report.md` and retained it with non-regressive baseline trend.


## Phase 29: Economy maintenance quiz count routed via obligation engine API

- Replaced the bare/global `getQuizCountLastWeek(active.career_id)` usage in `js/Civication/core/civicationEconomyEngine.js` with the existing runtime API call `window.CivicationObligationEngine?.getQuizCountLastWeek?.(active.career_id)`.
- Kept the call defensive with a numeric fallback (`0`) so weekly maintenance evaluation remains safe if the obligation engine is not yet available at runtime.
- Did **not** add any global declaration for `getQuizCountLastWeek`; `schemas/civication-globals.d.ts` remains honest about available globals.
- Applied a local typed-state access adjustment for `capitalState` (`stateView?.economy?.capital`) to remove the remaining unknown-state property access in this file without changing runtime behavior.
- This is a minimal runtime/architecture clarification only; economy behavior (salary, expense, strikes/stability flow, layoff/capital flow) is otherwise unchanged.

## Phase 30: focused JSDoc pass for Civication event engine

- Added a focused, JSDoc/typecheck-only pass in `js/Civication/core/civicationEventEngine.js` with minimal local casts/annotations on existing dynamic values (`active position`, `inbox`, `event`, autonomy return value) while keeping flow/behavior unchanged.
- During review adjustment, dropped the added broad global declarations from `schemas/civication-globals.d.ts` in this phase because they caused cross-file diagnostic redistribution in other Civication hotspots.
- Also dropped the `weekKey` arithmetic expression tweak so this phase stays strictly annotation-focused.
- No runtime/event-flow/inbox-flow/jobmail/private-message-flow changes were made, and no data/UI/DOM/CSS/layout/text/localStorage contract changes were made.
- Regenerated `reports/typecheck-baseline-report.md` after the adjustment pass; resulting baseline satisfies non-regression for `CivicationUI.js`, `CivicationMiniSectionsUI.js`, `TS2551`, and `TS2322` while still reducing `civicationEventEngine.js`.

## Phase 31: continue local JSDoc cleanup in Civication event engine

- Added a small, focused JSDoc/typecheck-only pass in `js/Civication/core/civicationEventEngine.js` targeting safe local diagnostics only (local pulse-state casts and narrow local callback/record annotations).
- Kept the pass file-local and runtime-neutral: no globals declarations were added, and `schemas/civication-globals.d.ts` was not changed.
- Reverted the temporary `weekKey` arithmetic expression change so runtime expression remains unchanged (`date - yearStart`), keeping this phase annotation-focused.
- No runtime logic or behavior was changed in event-flow, inbox-flow, jobmail/private-message flow, choice/effect semantics, localStorage keys/contracts, UI/DOM/layout/CSS/text, or Civication data contracts.
- Regenerated `reports/typecheck-baseline-report.md`; current baseline is 1942 total diagnostics and `civicationEventEngine.js` at 47, while preserving non-regression for `CivicationUI.js` (107), `CivicationMiniSectionsUI.js` (22), `TS2551` (124), and `TS2322` (20).
- `js/ui/**` (481) and `js/ui/place-card.js` (125) are above the post-Phase-30 reference values; this pass did not modify `js/ui/**` files, so that drift should be treated as baseline/report drift outside the Event Engine scope.


## Phase 32: continue safe local JSDoc cleanup in Civication event engine

- Added a small, controlled JSDoc/typecheck-only pass in `js/Civication/core/civicationEventEngine.js` focused on local `unknown`-to-record casts around fired/warning-state handling (`active`, `career`, `progress`, `contract`) and a local spread-safe cast source.
- Kept all changes file-local and runtime-neutral: no globals were added, and `schemas/civication-globals.d.ts` was not changed.
- No runtime logic/flow changes were made to event-flow, inbox-flow, jobmail/private-message flow, or choice/effect semantics; localStorage keys, UI/DOM/layout/CSS/text, and `weekKey` runtime expression are unchanged.
- Regenerated `reports/typecheck-baseline-report.md`; baseline moved from 1942 to 1929 total diagnostics and `civicationEventEngine.js` from 47 to 34, with protected metrics preserved (`CivicationUI.js` 107, `CivicationMiniSectionsUI.js` 22, `civicationEconomyEngine.js` 0, `TS2551` 124, `TS2322` 20, `js/ui/**` 481, `js/ui/place-card.js` 125).

## Phase 33: final local JSDoc cleanup in Civication event engine before globals

- Added one last file-local, JSDoc/typecheck-only pass in `js/Civication/core/civicationEventEngine.js` after Phase 32, focused on safe local diagnostics only.
- Applied narrow local casts/annotations for existing runtime-shaped objects (`getState`/`getInbox` returns, obligation evaluate result, `HG_CAREERS.global_rules` lookup chain, enqueue inbox item shape, and active position access in system-effects block).
- Kept changes runtime-neutral and local to Event Engine: no globals were added, and `schemas/civication-globals.d.ts` was not changed.
- Runtime/event/inbox/jobmail/private-message/choice/effect behavior is unchanged; no flow, branching, localStorage keys, UI/DOM/layout/CSS/text, or data contract changes were made.
- Regenerated `reports/typecheck-baseline-report.md`; after reverting the temporary `weekKey` arithmetic edit and keeping pure local-cast semantics for `HG_CAREERS` fallbacks, baseline settled at 1921 total diagnostics and `civicationEventEngine.js` at 26, while protected metrics remained non-regressive (`CivicationUI.js` 107, `CivicationMiniSectionsUI.js` 22, `civicationEconomyEngine.js` 0, `TS2551` 124, `TS2322` 19, `js/ui/**` 481, `js/ui/place-card.js` 125).

## Phase 34: Verified Civication globals (declaration-only batch)

- Added a small declaration-only batch in `schemas/civication-globals.d.ts` for verified runtime symbols: `hgGetJobOffers` and `hgSetJobOffers`.
- Runtime verification was done against direct assignments in `js/Civication/core/civicationJobs.js`.
- No runtime logic was changed; this phase only adds global declarations.
- No Event Engine runtime code, UI files, data/CSS/layout, or flow semantics were changed.

## Phase 36: narrow local JSDoc pass for Civication UI

- Added a narrow, local JSDoc/typecheck-only pass in `js/Civication/ui/CivicationUI.js`, scoped to the district selector and public feed rendering paths.
- Introduced local record/object casts near usage for feed items and district data (`DISTRICTS`, `modifiers`, `quizRequirements`) to reduce local unknown/property-access diagnostics.
- Kept runtime behavior unchanged: no logic/flow/branching/order/side-effect changes, no globals additions, and no DOM/CSS/layout/text/event-listener behavior changes.
- No changes were made to `schemas/civication-globals.d.ts`, `js/Civication/core/civicationEventEngine.js`, or economy engine code.
- GitHub Actions workflow `Typecheck baseline report` is the final baseline control for this phase.

## Phase 37: narrow CivicationBoot type-only pass

- Added a declaration-only global in `schemas/civication-globals.d.ts` for existing runtime usage in `js/Civication/CivicationBoot.js`: `window.__CIVI_BOOT_ERROR__`.
- Scope stayed intentionally narrow to CivicationBoot typing friction only; no runtime guards, no flow/branch/order/storage changes, and no boot-sequence changes were introduced.
- No UI/Event Engine/Economy Engine/MiniSections/js/ui files were modified in this phase.
- Runtime behavior, DOM/CSS/layout/text, and app-init semantics remain unchanged.

## Phase 38: narrow CivicationCommercial typecheck pass

- Added a narrow, file-local JSDoc/type-only pass in `js/Civication/civicationCommercial.js` after Phase 37, focused only on local `unknown` property-access friction.
- Applied local type annotations/casts for `window.getPCWallet()` result, `window.DataHub.fetchJSON()` pack/store payload shapes, and access-bucket return values near usage.
- No runtime behavior was changed: buy/sell/wallet/economy logic, branching/order/returns, storage keys, event flow, DOM/CSS/layout/text, and public API semantics remain unchanged.
- No globals/schema declarations were changed (`schemas/civication-globals.d.ts` untouched), and no UI/Event Engine/Economy Engine/MiniSections/js/ui files were modified.
- Regenerated `reports/typecheck-baseline-report.md`; GitHub Actions workflow `Typecheck baseline report` remains the final control gate.

## Phase 39: Narrow CivicationJobs type-only pass after baseline refresh

- Applied an extremely narrow, local JSDoc typing pass in `js/Civication/core/civicationJobs.js` after baseline refresh PR #636.
- Added local object-shape annotations for branch flags, inbox events and career state reads that were already treated as object/array at runtime.
- Scope is type-only/JSDoc-only and local to existing expressions; runtime behavior, control flow, payload semantics, and storage/event/mail/career logic remain unchanged.

## Phase 40: narrow merits-and-jobs typecheck pass

- Added a narrow, local JSDoc/type-only pass in `js/Civication/merits-and-jobs.js` after Phase 39 / PR #637.
- Applied small local casts for `window.HG_CAREERS`, `window.BADGES`, existing offers, and push-offer result usage to reduce `unknown` property-access noise (`TS2339`) without changing runtime behavior.
- Left `TS2304` (`catIdFromDisplay`) unchanged in this phase because fixing it safely would require import/global/declaration/runtime-scope work outside this narrow file-local pass.
- Runtime logic, merits/jobs logic, career flow, event flow, rewards, storage contracts, UI/DOM/CSS/layout/text, and schemas/globals are unchanged.

## Phase 41: narrow identityCompass typecheck pass

- Added an extremely narrow, local JSDoc/type-only cast in `js/Civication/identityCompass.js` after Phase 40 / PR #638.
- Fixed the local `TS2339` unknown property-access diagnostic on `identity.focus` by adding a local shape cast at the existing read site, with no runtime logic change.
- Intentionally left the `window.HG_IdentityCompass` global diagnostic in place in this phase because it requires global declaration/schema work outside this file-local pass.
- No runtime behavior was changed: IdentityCompass rendering flow, API behavior, storage, DOM/CSS/layout/text, and schemas/globals remain unchanged.

## Phase 42: narrow roleThreadResolver typecheck pass

- Added one extremely narrow, local JSDoc/type-only annotation in `js/Civication/roleThreadResolver.js` for the existing active-position read used to access `.career_id`.
- Removed one local `TS2339` (`career_id` on `unknown`) without changing runtime logic, flow, branching, returns, storage, or resolver behavior.
- Left global/window diagnostics (`CiviStoryResolver`, `CiviRoleThreadResolver`) unchanged because those require global declaration/schema scope outside this file-local pass.
- No schema/global declarations were changed; `schemas/civication-globals.d.ts` remains untouched.

## Phase 43: narrow ActivePositionRecovery typecheck pass

- Added one extremely narrow, local JSDoc/type-only cast in `js/Civication/systems/civicationActivePositionRecovery.js` at the existing `state.stability` read site.
- Removed one local `TS2339` (`stability` on `unknown`) without changing runtime logic, control flow, branching, return values, storage keys, recovery behavior, or active-position behavior.
- Left `TS2322` (boolean vs `CiviFn`) and the global/window diagnostic for `CivicationActivePositionRecovery` unchanged in this phase because they require non-local API/global typing scope outside this file-local pass.
- No schema/global declarations were changed; `schemas/civication-globals.d.ts` remains untouched.

## Phase 44: narrow BrandJobState typecheck pass

- Added one extremely narrow, local JSDoc/type-only annotation in `js/Civication/systems/civicationBrandJobState.js` for the existing active-position read used at `.brand_id` / `.brand_name` access sites.
- Removed local `TS2339` unknown/property-access diagnostics tied to `brand_id`/`brand_name` reads from the same `active` value, without changing runtime logic, control flow, branching, return values, event flow, storage keys, or brand/job-state behavior.
- Left only the window/global assignment diagnostic in this file unchanged in this phase because it requires global declaration/schema scope outside this single file-local pass.
- No schema/global declarations were changed; `schemas/civication-globals.d.ts` remains untouched.

## Phase 46: declare CivicationCalendar only

- Added one narrow declaration-only global in `schemas/civication-globals.d.ts`: `window.CivicationCalendar?: any`.
- Chose broad `any` form based on Phase 46-prep dry-run safety results; intentionally did not use narrow `CiviMethodBag` because it caused regression risk.
- Intentionally did not declare `CivicationMailEngine` or `CivicationTaskEngine` in this phase due to known TS2551 regression risk from dry-run findings.
- No runtime logic, JavaScript source, UI, CSS, HTML, AHA/data, manifests, workflows, or tests were changed.
- Regenerated `reports/typecheck-baseline-report.md` and verified protected metrics did not increase while CivicationCalendar-related TS2339 noise was reduced.

## Phase 47: narrow CareerOutcomeRuntime type-only pass

- Added a narrow, local JSDoc/type-only pass in `js/Civication/systems/civicationCareerOutcomeRuntime.js` after Phase 46 / PR #649.
- Applied three local casts at existing read sites to reduce `unknown` property-access diagnostics without altering runtime behavior:
  - state shape cast for reading `mail_runtime_v1` in `getRuntime`.
  - active-position cast near `CivicationPsyche.getAutonomy(active?.career_id)`.
  - active-position cast near `CivicationPsyche.registerCollapse(active?.career_id, ...)`.
- Intentionally left global/window diagnostics (`CivicationMailRuntime`, `CivicationEventEngine`, `CivicationCareerOutcomeRuntime`) unchanged because they require globals/schema scope outside this phase.
- Intentionally did not modify `schemas/civication-globals.d.ts`, and did not add declarations for `CivicationMailEngine`/`CivicationTaskEngine`.
- No runtime logic, career-outcome logic, mail-runtime logic, storage keys, DOM/CSS/layout/text, or event flow was changed.

## Phase 48: narrow CareerOutcomeRuntime follow-up type-only pass

- Added two narrow, local JSDoc/type-only casts in `js/Civication/systems/civicationCareerOutcomeRuntime.js` after Phase 47 / PR #652.
- Fixed local property-access diagnostics at existing read/write sites only:
  - local array+property cast for `suppressed.__career_outcome_terminal_closed` in `makeOutcomeAwareCandidates`.
  - local state-shape cast for `current.consumed` reads/spread in `patchEventEngineAnswer`.
- Intentionally left global/window diagnostics (`CivicationMailRuntime`, `CivicationEventEngine`, `CivicationCareerOutcomeRuntime`) unchanged because they require global declaration/schema scope, which is out of bounds for this phase.
- No runtime logic was changed: career-outcome flow, mail-runtime behavior, event flow, branching/order/returns, storage, DOM/CSS/layout/text all remain unchanged.
- `schemas/civication-globals.d.ts` was not modified; `CivicationCalendar?: any` from Phase 46 was not touched; no declarations were added for `CivicationMailRuntime`, `CivicationEventEngine`, `CivicationMailEngine`, or `CivicationTaskEngine`.
