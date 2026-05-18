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
