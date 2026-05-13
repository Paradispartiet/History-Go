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
