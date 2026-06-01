# Phase 90: `js/ui/place-card.js` TypeScript diagnostics audit

## Scope

This is a read-only diagnostics audit for `js/ui/place-card.js` after Phase 89 replacement. It does not change `js/ui/place-card.js`, runtime JavaScript, UI/DOM/CSS, schemas, data, `tsconfig.json`, package metadata, stories, places, people, or import tooling.

## Current baseline summary

Regenerated with `npm run typecheck:report` on 2026-06-01.

| Baseline item | Current value |
| --- | ---: |
| Total diagnostic lines | 1529 |
| Files with diagnostics | 181 |
| `js/ui/**` diagnostic lines | 502 |
| `js/Civication/**` diagnostic lines | 265 |
| Largest file hotspot | `js/ui/place-card.js` |
| `js/ui/place-card.js` diagnostic lines | 139 |
| Dominant repository-wide code | `TS2339` (1196) |

`js/ui/place-card.js` is therefore the largest single remaining hotspot in the current baseline, ahead of `js/ui/popup-utils.js` (79), `js/boot.js` (67), `js/profile.js` (57), and `js/ui/left-panel.js` (55).

## Diagnostics in `js/ui/place-card.js` by TypeScript code

Captured from `npm run typecheck -- --pretty false` after the baseline regeneration.

| TypeScript code | Count | Dominant meaning in this file |
| --- | ---: | --- |
| `TS2339` | 109 | Missing properties on `Window`, `HTMLElement`/`Element`/`EventTarget`, broad `object`/`unknown` records, and union values. |
| `TS2345` | 7 | Broad `PlaceCardPlace | Record<string, unknown>` values passed to helpers/functions expecting narrower `Place` or place-card shapes. |
| `TS2304` | 7 | Undeclared globals referenced as bare identifiers (`FLORA`, `LayerManager`). |
| `TS2551` | 6 | Missing window globals with near-name suggestions (`HGNavigator`, `HGRoutes`). |
| `TS2538` | 4 | `unknown` values used as object index keys (`place.id`/similar dynamic ids). |
| `TS2322` | 3 | `unknown` assigned to string-only DOM/text fields. |
| `TS2741` | 1 | `Record<string, unknown>` assigned into a `Place[]` slot where required `id` is not proven. |
| `TS2349` | 1 | Optional DataHub method is not callable under the current global type. |
| `TS2769` | 1 | `Map(...)` construction from broad place rows cannot satisfy overloads. |
| **Total** | **139** | |

### Line-range concentration

| Area | Approx. diagnostics | Main noise pattern |
| --- | ---: | --- |
| `openPlaceCard()` setup and round-popup binding, lines 191-375 | 16 | `window.*` globals, DataHub callable shape, `Place` vs `Record` assignment, and helper argument narrowing. |
| Main render population, lines 459-569 | 30 | Image element casts, category/sport profile shape, global people/flora/nearby/nav lists, and broad `Map` input. |
| People/flora list bindings, lines 700-780 | 9 | `querySelectorAll()` returns `Element`, so `.onclick`/`.dataset` need local element views; popup globals are undeclared. |
| Emne/relation/badge helper area, lines 899-1215 | 27 | `window.Emner`, relation maps, Civication/brand route globals, social cache globals, and helper parameter shapes. |
| Action/route/quiz/observation area, lines 1314-1488 | 28 | Route-menu window exports, `EventTarget.closest`, route globals, quiz globals, observation globals, and popup globals. |
| Unlock and marker update area, lines 1516-1613 | 14 | Button element type, `place.id`/badge index keys, groundhopper place shape, save/update contracts, marker globals, and merits union shape. |
| Collapse/expand/langchange area, lines 1696-1801 | 14 | `LayerManager`, `bottomSheetController`, and `openPlaceCard` window declaration noise. |

## Dominant problem classes

### 1. Place/object shape issues

These are visible where `place` starts as `PlaceCardPlace | PlaceCardRecord | null | undefined`, then is merged with DataHub payloads and passed into helpers with different expectations.

Representative examples:

- Line 202 assigns a broad `place` value back into `window.PLACES`, where TypeScript expects `Place` with a required `id`.
- Lines 311, 314, and 328 pass `currentPlace || place || {}` into helper functions whose JSDoc expects either a place-card shape or a broad record, but the inferred `window.PLACES` row type remains `Place | Record<string, unknown>`.
- Lines 1581 and 1590 pass `place` into groundhopper helpers that expect `Place`, while this function still allows `Record<string, unknown>`.
- Lines 1526, 1564, 1588, and 1610-1613 show `place.id` and badge ids used as object keys or merit records while TypeScript still sees `unknown` or union values.

Assessment: this class contains some local JSDoc/cast candidates, but broadening place contracts too much can mask real data-shape uncertainty. The safest candidates are very small local aliases for current place id strings and merit records, not schema changes.

### 2. DOM/querySelector/HTMLElement issues

These are mostly mechanical and local:

- Lines 459 and 464 treat `getElementById()` results as image elements and read/write `.src`.
- Lines 700-742 and related list handlers bind `.onclick` and read `.dataset` on `querySelectorAll()` results typed as `Element`.
- Line 1426 reads `.closest` from `EventTarget`.
- Line 1516 writes `.disabled` on a button reference typed as `HTMLElement`.

Assessment: these are the best local-cast candidates because they document existing DOM assumptions without changing selectors or rendered output. They are still UI-sensitive, so Phase 91 should target only one tiny cluster rather than the whole card.

### 3. Image/card/media field issues

The main image cluster is lines 459-464:

- `frontImgEl.src` is read/written while `frontImgEl` is only `HTMLElement | null`.
- `miniImgEl.src` is written while `miniImgEl` is only `HTMLElement | null`.
- `place.image`/`place.frontImage`/`place.cardImage` are broad optional values, so string-only assignments produce `unknown`/string diagnostics.

Assessment: this is a narrow and attractive Phase 91 candidate if handled with local `HTMLImageElement` casts and `String(...)` normalization only. It should not change image fallback order, IDs, classes, or markup.

### 4. Story/Wonderkammer/Leksikon/people relation issues

The card pulls together several dynamic content systems:

- Leksikon globals at lines 297-298.
- People and flora lists at lines 511-524, then relation display rendering in the people section.
- Relation maps around line 943 and route/canonical social-event data around lines 1169-1215.
- Civication Store and brand entries around lines 1013-1074.

Assessment: many diagnostics here reflect cross-module/global declarations or ambiguous data shapes. These should wait for dedicated schema/global passes or data-shape audits. Avoid mixing them into a local DOM cast phase.

### 5. Global/window declaration issues

A large part of the 109 `TS2339` diagnostics are missing `Window` properties rather than local runtime problems. Repeated examples include:

- `openPlaceCard`, `LESESPOR`, `HG_I18N`, `KnowledgeLearning`, `HGLeksikon`, `HGTimeResolver`, `showPlaceCardRoundPopup`.
- `CATEGORY_LIST`, `PEOPLE`, `FLORA`, `NEARBY_PLACES`, `HGNavigator`.
- `Emner`, `REL_BY_PLACE`, `CIVICATION_STORE_BY_PLACE`, `CivicationStore`, `BRANDS_BY_PLACE`, `HGBrands`.
- `HGRoutes`, `ROUTES`, route popup helpers, `QuizEngine`, `HGObservations`.
- `drawPlaceMarkers`, `pulseMarker`, `LayerManager`, `bottomSheetController`.

Assessment: these require schema/global declarations to reduce correctly. They should not be fixed inside Phase 91 unless the whole PR is declaration-only and tightly scoped to one owned global family. For the next phase, local DOM casts are safer.

### 6. Function-contract/signature issues

The file has several contract mismatches:

- DataHub method callability at line 210 (`TS2349`).
- Helper argument mismatches around lines 311, 314, 328, 1581, 1585, and 1590 (`TS2345`).
- `new Map(...)` overload friction at line 569 (`TS2769`) because place rows are still broad.

Assessment: these should be postponed unless a narrow helper-local type view can be proven. They touch data loading, relation lookup, unlock state, and map/groundhopper behavior, so they are more likely to hide real contract drift.

### 7. Issues that should be deferred

Defer these from Phase 91:

- Broad `Window` declaration sweeps for all place-card integrations.
- Place schema or `schemas/*.d.ts` changes for `Place`, people, flora, routes, brands, relations, Civication Store, social data, or observations.
- Unlock, visited, merits, marker, route, and bottom-sheet behavior typing; these are runtime-sensitive and share globals with other modules.
- Any refactor of the place-card render flow, DOM structure, IDs/classes, UI layout, or data fallbacks.
- Any data-file changes to make TypeScript happier.

## Candidate classification

| Candidate class | Examples | Recommendation |
| --- | --- | --- |
| Safe local JSDoc/cast candidates | `frontImgEl`/`miniImgEl` image element casts; `btnUnlock` button cast; individual `querySelectorAll()` button casts where handlers only read `dataset`. | Good for a small Phase 91 if limited to one cluster. |
| Requires schema/global declarations | `window.HGLeksikon`, `window.HGTimeResolver`, `window.HGNavigator`, `window.HGRoutes`, `window.QuizEngine`, `window.HGObservations`, social caches, `LayerManager`, `bottomSheetController`. | Use separate declaration-only phases, one global family at a time. |
| Could affect UI/DOM rendering and should wait | Broad people/flora/relation renderer annotations, route-menu event target rewrites, collapse/expand controller typing, unlock button behavior. | Defer until a targeted UI-sensitive pass is planned and manually checked. |
| Could be real data-shape uncertainty | `place` merged from DataHub, sport profile fields, relation records, Civication/brand entries, social data payloads, merits entries. | Audit data contracts first; avoid schema changes in a place-card local-cast PR. |

## Recommended Phase 91

Keep Phase 91 intentionally small and TypeScript-only. Recommended target:

1. **Image element micro-pass in `openPlaceCard()` lines 459-464 only.** Add local `HTMLImageElement` casts for `pcFrontImage` and `pcMiniImg`, and normalize assigned image values with `String(...)` while preserving the current fallback order.
2. Optionally, if the first target is too small, include **only** the `btnUnlock` button cast at line 1516. Do not include querySelector handler sweeps, globals, schema declarations, route/observation logic, or place-shape changes in the same PR.

Expected benefit is modest but safe: a handful of diagnostics removed without touching UI structure, runtime branches, schemas, data, or global declarations.
