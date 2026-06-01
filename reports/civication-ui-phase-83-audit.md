# Phase 83: CivicationUI diagnostics audit after profile pass

## Scope

This is a read-only TypeScript migration audit for `js/Civication/ui/CivicationUI.js` after Phase 82 and Phase 82B. It does not change runtime JavaScript, schema declarations, DOM/CSS/layout, data, stories, places, people, import tooling, package metadata, or `tsconfig.json`.

## Current baseline summary

Generated with `npm run typecheck:report` on 2026-06-01.

| Metric | Current value |
| --- | ---: |
| Total diagnostic lines | 1724 |
| Files with diagnostics | 183 |
| `js/Civication/**` diagnostic lines | 341 |
| `js/Civication/ui/CivicationUI.js` diagnostic lines | 96 |
| `js/ui/place-card.js` diagnostic lines | 139 |
| `js/ui/popup-utils.js` diagnostic lines | 80 |
| `js/boot.js` diagnostic lines | 76 |
| `js/profile.js` diagnostic lines | 62 |

Note: the committed pre-run baseline recorded 1718 total diagnostics and `js/ui/place-card.js` at 130. Regenerating the baseline in this environment updates the timestamp and reports 1724 total diagnostics, with `js/Civication/**`, `CivicationUI.js`, `popup-utils.js`, `boot.js`, and `profile.js` unchanged.

## CivicationUI diagnostics grouped by TypeScript code

| Code | Count | Main pattern in `CivicationUI.js` |
| --- | ---: | --- |
| `TS2339` | 89 | Property access on `unknown`, undeclared `window` globals, and DOM `Element` members such as `style`/`onclick`. |
| `TS2322` | 6 | Number assigned to `textContent` plus one broad method-bag return assigned to an object map. |
| `TS2698` | 1 | Object spread from a `CivicationPsyche.getSnapshot()` value typed as `unknown`. |
| **Total** | **96** |  |

## Noisiest concrete lines/functions

| Function / area | Count | Lines | Noise source |
| --- | ---: | --- | --- |
| `renderCivication()` Civication-mode branch | 19 | 282-343 | `active` and `offer` are returned from broad `CiviMethodBag` methods, so `career_id`, `title`, `career_name`, `threshold`, `expires_iso`, `offer_key`, and `ok` are read from `unknown`. |
| `renderCivication()` profile branch | 16 | 154-213 | Same active-position and pending-offer shapes as above, plus merit/salary lookups by `active.career_id`. |
| `renderPsycheDashboard()` | 15 | 507-577 | Snapshot is `unknown`; score fields (`integrity`, `visibility`, `economicRoom`, `autonomy`, `trust`) drive DOM rendering and include four number-to-string `textContent` assignments. |
| `renderCivicationInbox()` Civication-mode branch | 11 | 1208-1324 | Message item/event and answer-result shapes are broad, and `host.querySelector(...)` returns `Element`, causing `style`/`onclick` DOM diagnostics. |
| `renderCivicationInbox()` legacy/profile branch | 8 | 1112-1164 | Pending-event, NPC lookup, answer-result, `CivicationThreadBridge`, `DEBUG`, and feedback result shapes are not declared/narrowed locally. |
| `renderWorkdayPanel()` / workday item helpers | 6 | 671-759 | Workday item state/event/brand fields (`career`, `event`, `brand_name`, `stability`, `title`) are read from broad item values. |
| `renderTrackHUD()` | 5 | 1397-1402 | State returned from `CivicationState.getState()` is `unknown`, so `tracks`, `track_progress`, and `identity_tags` are not locally narrowed. |

## Classification

### 1. Global/window declaration issues

These are genuine global declaration gaps rather than local object-shape reads:

- `window.CivicationNPCs` in event view-model and legacy inbox sender lookup (`TS2339`, lines 1018 and 1124).
- `window.CivicationThreadBridge` in both inbox choice handlers (`TS2339`, lines 1157-1158 and 1316-1317).
- `window.DEBUG` in the same thread-enqueue catch blocks (`TS2339`, lines 1161 and 1320).

These could be removed with declarations, but Phase 84 should avoid schema work if it is intended to stay file-local and low-risk.

### 2. Local unknown/property-access issues

Most diagnostics are local reads from methods declared as `CiviFn`, whose return type is `unknown`:

- Active-position reads in `renderCivication()` and `syncRoleBaseline()` (`career_id`, `career_name`, `title`, `achieved_at`).
- Pending-offer reads in `wireCivicationActions()` and `renderCivication()` (`offer_key`, `expires_iso`, `threshold`, `ok`).
- Pending-event and inbox item reads in `refreshCivicationAfterAnswer()` and `renderCivicationInbox()` (`event`, `feedback`, `ok`).
- Psyche/state reads in `renderPsycheDashboard()`, `renderPerception()`, and `renderTrackHUD()` (`integrity`, `visibility`, `economicRoom`, `autonomy`, `trust`, `tracks`, `track_progress`, `identity_tags`).

These are the best candidates for local JSDoc/type-only casts because the file already defines broad `CiviUiRecord`, `CiviUiEvent`, `CiviUiInboxItem`, and `CiviUiState` aliases.

### 3. Function-contract/signature issues

- `renderPsycheDashboard()` writes numeric rounded scores directly to `textContent` at lines 526, 529, 532, and 535; TypeScript expects `string`.
- `renderCapital()` writes a numeric `Math.round(...)` result to `textContent` at line 1351.
- `renderPsycheDashboard()` assigns `window.CivicationPsyche?.getPsycheModifiers?.() || {}` to a concrete `Record<string, ...>` at line 606, but the method-bag return is `unknown`/`CiviFn | {}`.

These are safe-looking but not entirely shape-free: `textContent` string coercion is behavior-preserving, while the modifiers map needs a local cast to the existing expected map shape.

### 4. DOM/rendering-sensitive issues

- The `renderCivicationInbox()` Civication-mode branch uses `host.querySelector(...)` for feedback and OK controls. TypeScript only knows `Element`, not `HTMLElement`, at lines 1284, 1286, 1290, 1292, and 1293.
- The same branch dynamically rebuilds inbox HTML and binds callbacks after rendering. A future pass should use local DOM casts only at the query sites and avoid changing markup, IDs, text, classes, control visibility, event order, or `refreshCivicationAfterAnswer(...)` behavior.
- `renderPsycheDashboard()` and `renderPerception()` are rendering-sensitive because they directly generate status text/HTML from broad runtime state. Type-only annotations are preferable to refactors.

### 5. Issues that should be deferred

- Schema/global declaration additions for `CivicationNPCs`, `CivicationThreadBridge`, and `DEBUG` should be deferred unless a phase is explicitly declaration-only.
- `renderCivicationInbox()` should not be structurally refactored in the next pass; it combines two host modes, dynamic sections, choice handling, feedback rendering, and thread enqueue behavior.
- `renderPerception()` and `renderTrackHUD()` should be deferred if Phase 84 is capped at one or two targets, because they are smaller isolated clusters and do not reduce the highest concentration first.
- Broad global type improvements to `CiviMethodBag` should be deferred; changing method return contracts globally could create cross-file regressions.

## Recommended Phase 84 fix scope

Keep Phase 84 as a narrow, file-local JSDoc/type-only pass in `js/Civication/ui/CivicationUI.js` with **one or two** safe targets:

1. **Active-position and pending-offer local shapes in `renderCivication()` only.**
   - Add local typedefs or local casts for active-position and pending-offer objects used by both profile and Civication modes.
   - This directly targets the two noisiest clusters (35 diagnostics total across the two `renderCivication()` branches) without touching schemas or runtime behavior.
2. **Optional second target: `wireCivicationActions()` pending-offer/answer result casts.**
   - Reuse the same pending-offer shape for `offer_key` and a tiny `{ ok?: unknown }` answer-result shape.
   - This is small, adjacent to the offer contract, and should remove three additional diagnostics without changing action wiring.

If Phase 84 must be even narrower, do only target 1 and leave `wireCivicationActions()` for a follow-up.

## Explicit non-goals for Phase 84

Phase 84 should not touch:

- `schemas/civication-globals.d.ts` or any other declaration/schema file.
- `tsconfig.json`.
- Runtime logic, control flow, storage keys, event dispatch order, or Civication engine calls.
- DOM structure, CSS classes, IDs, visible UI text, templates, rendering order, or event handler behavior.
- `renderCivicationInbox()` structural code, thread-enqueue behavior, `CivicationThreadBridge`, `CivicationNPCs`, or `DEBUG` declarations.
- `renderPsycheDashboard()`, `renderPerception()`, and `renderTrackHUD()` unless Phase 84 is explicitly broadened after the active-position/pending-offer pass.
- Data files, stories, places, people, import tools, `package.json`, or unrelated `js/ui/**` hotspots such as `place-card.js` and `popup-utils.js`.
