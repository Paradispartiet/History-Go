# Phase 87: CivicationUI remaining diagnostics audit after TrackHUD pass

## Scope

This is a read-only TypeScript migration audit for `js/Civication/ui/CivicationUI.js` after the Phase 84 active-position/pending-offer pass, the Phase 85 psyche-dashboard pass, and the Phase 86 TrackHUD state-shape pass. It does not change `js/Civication/ui/CivicationUI.js`, schema declarations, runtime JavaScript, UI/DOM/CSS, data, stories, places, people, import tooling, package metadata, or `tsconfig.json`.

## Current baseline summary

Generated with `npm run typecheck:report` on 2026-06-01.

| Metric | Current value |
| --- | ---: |
| Total diagnostic lines | 1669 |
| Files with diagnostics | 183 |
| `js/Civication/**` diagnostic lines | 290 |
| `js/Civication/ui/CivicationUI.js` diagnostic lines | 45 |
| `TS2339` total diagnostic lines | 1325 |
| `TS2322` total diagnostic lines | 12 |

`js/Civication/ui/CivicationUI.js` is now the seventh-largest file hotspot in the repository baseline and the largest remaining `js/Civication/**` file hotspot in the top-20 list. The file-specific count is unchanged during this audit because no runtime/source file was edited.

## CivicationUI diagnostics grouped by TypeScript code

| Code | Count in `CivicationUI.js` | Main remaining pattern |
| --- | ---: | --- |
| `TS2339` | 42 | Property access on broad `unknown` return values, undeclared `window` globals, and `Element` members from `querySelector(...)`. |
| `TS2322` | 2 | Broad method-bag return assigned to a concrete district map; numeric `Math.round(...)` assigned to `textContent`. |
| `TS2698` | 1 | Object spread from `CivicationPsyche.getSnapshot()` while the snapshot return remains `unknown` in `renderPerception()`. |
| **Total** | **45** |  |

## Noisiest concrete lines/functions still producing diagnostics

| Function / area | Count | Lines | Noise source |
| --- | ---: | --- | --- |
| `renderCivicationInbox()` legacy/profile host branch | 8 | 1136, 1143, 1146, 1172, 1179-1180, 1183, 1186 | Pending-event and answer-result shapes are still broad; `CivicationNPCs`, `CivicationThreadBridge`, and `DEBUG` are undeclared globals. |
| `renderCivicationInbox()` Civication-mode message branch | 11 | 1306, 1308, 1312, 1314-1315, 1333, 1338-1339, 1342, 1346 | `host.querySelector(...)` returns `Element`, not `HTMLElement`; answer results and thread bridge globals remain broad. |
| `renderWorkdayPanel()` / workday item helpers | 5 | 693, 697, 719, 754, 781 | Workday item, event, brand, state, and task title values still flow from broad runtime/method-bag returns. |
| `renderCivication()` salary/badge lookup leftovers | 4 | 187, 194, 307, 314 | `window.BADGES` and `window.HG_CAREERS` array elements remain `unknown` inside `.find(...)` callbacks, even after the active-position local casts. |
| `syncRoleBaseline()` | 4 | 397, 402, 409, 414 | The active position used by this helper was outside the Phase 84 `renderCivication()` target and still reads from an `unknown` result. |
| `renderHomeStatus()` | 3 | 488, 506-507 | The current home payload remains broad, so `home` cannot be read safely by TypeScript. |
| `renderPerception()` | 3 | 1396-1401 | The psyche snapshot and identity profile remain broad; object spread, `dominant`, and `lines.map(...)` are not locally narrowed. |
| Small isolated leftovers | 7 | 85, 110-122, 628, 1040, 1373 | Pending event id, offer action wiring, district selector map assignment, event view-model NPC lookup, and capital text assignment. |

## Previously audited clusters now resolved

- **Active-position / pending-offer cluster:** Phase 84 removed the large `renderCivication()` profile-mode and Civication-mode active-position/pending-offer clusters that dominated the Phase 83 audit. The remaining related noise is smaller and outside that exact target: `wireCivicationActions()` offer reads, `syncRoleBaseline()`, and badge/career array element callbacks.
- **Psyche-dashboard snapshot / `textContent` cluster:** Phase 85 resolved the `renderPsycheDashboard()` snapshot score/trust reads and the dashboard numeric `textContent` assignments. The only psyche-adjacent leftovers are now in `renderPerception()`, which has a separate snapshot spread and generated-lines contract.
- **TrackHUD state-shape cluster:** Phase 86 resolved the `renderTrackHUD()` diagnostics for `tracks`, `track_progress`, and `identity_tags`; the current baseline has no remaining `renderTrackHUD()` diagnostics.

## Classification of the remaining 45 diagnostics

The first four classes below are mutually exclusive and account for all 45 diagnostics. The event/inbox-sensitive and deferred sections then call out risk overlays for planning.

### 1. Global/window declaration issues

**8 diagnostics** are declaration gaps rather than local runtime-shape problems:

- `window.CivicationNPCs` at lines 1040 and 1146.
- `window.CivicationThreadBridge` at lines 1179-1180 and 1338-1339.
- `window.DEBUG` at lines 1183 and 1342.

These are attractive because a declaration-only pass could remove them without touching `CivicationUI.js`. However, the declarations must be intentionally broad and schema-only, because the affected code is in inbox/event-sensitive rendering and choice handlers.

### 2. Local unknown/property-access issues

**28 diagnostics** are ordinary local shape reads from broad method-bag returns or globally declared dynamic arrays:

- Pending event / pending offer / answer result reads: lines 85, 110-122, 1136, 1143, 1172, 1186, 1333, and 1346.
- Badge and career array item reads in `renderCivication()`: lines 187, 194, 307, and 314.
- Active-position reads in `syncRoleBaseline()`: lines 397, 402, 409, and 414.
- Current home reads in `renderHomeStatus()`: lines 488 and 506-507.
- Workday state/event/task reads: lines 693, 697, 719, 754, and 781.
- Identity/perception reads: lines 1397 and 1401.

Most of these should be handled with file-local JSDoc casts only when a phase is scoped to the owning function. Broadening shared method-bag return types would be riskier because those declarations are used across many Civication files.

### 3. DOM/querySelector/HTMLElement issues

**6 diagnostics** are DOM-local and concentrated in the Civication-mode branch of `renderCivicationInbox()`:

- `fb.style` at lines 1306 and 1312.
- `ok.style` at lines 1308 and 1314.
- `ok.onclick` at lines 1308 and 1315.

These could likely be removed with local `HTMLElement` casts at the three `host.querySelector(...)` sites for `choiceBox`, `fb`, and `ok`. This is mechanically safe if it does not change markup, IDs, classes, rendered text, visibility order, or event-handler behavior, but it still touches the inbox branch.

### 4. Function-contract/signature issues

**3 diagnostics** are contract/signature mismatches rather than undeclared properties:

- `openDistrictSelector()` assigns a broad `window.CivicationHome?.getDistricts?.()` fallback to a concrete district map at line 628 (`TS2322`).
- `renderCapital()` assigns `Math.round(...)` directly to `textContent` at line 1373 (`TS2322`).
- `renderPerception()` spreads `snapshot` at line 1396 while TypeScript still sees the snapshot as non-object/`unknown` (`TS2698`).

These are good later cleanup candidates, but they are not the largest cluster and do not need to be Phase 88 if the goal is the safest high-signal reduction.

### 5. Event/inbox-sensitive issues

**At least 20 diagnostics** sit on or directly adjacent to event/inbox-sensitive flow:

- `refreshCivicationAfterAnswer()` pending-event check at line 85.
- `renderCivicationInbox()` legacy/profile host branch at lines 1136-1186.
- `renderCivicationInbox()` Civication-mode message branch at lines 1306-1346.
- The global declaration gaps for `CivicationNPCs`, `CivicationThreadBridge`, and `DEBUG` are also consumed by inbox/event rendering and thread-enqueue paths.

This confirms that the inbox/event area is now the single biggest remaining cluster in `CivicationUI.js`. Any code-touching pass here should be explicitly inbox-only and limited to local casts; no structural refactor should be combined with it.

### 6. Issues that should be deferred

Defer these unless a later phase is explicitly scoped to them:

- Workday item contracts in `renderWorkdayPanel()` because they mix state, event, brand, and task display data.
- `renderPerception()` because it combines stored capital, psyche snapshot spread, identity profile, and generated HTML lines.
- `syncRoleBaseline()` and `renderHomeStatus()` because they are small, isolated clusters that do not dominate the file baseline.
- Broad global/method-bag return tightening, because it can easily create cross-file regressions outside `CivicationUI.js`.
- Any structural `renderCivicationInbox()` cleanup, markup changes, event-order changes, text changes, or thread-enqueue behavior changes.

## Recommended Phase 88 scope

The safest Phase 88 is a **declaration-only pass** for the three missing inbox-adjacent globals:

1. Add broad declarations for `window.CivicationNPCs`, `window.CivicationThreadBridge`, and `window.DEBUG` in `schemas/civication-globals.d.ts`.
2. Keep the declarations intentionally loose: lookup/enqueue methods should accept broad values and return broad nullable/unknown shapes; `DEBUG` should be optional boolean-like.

Rationale: although `renderCivicationInbox()` is now the biggest cluster, an inbox-only DOM local-cast pass would require editing the event/inbox rendering function and touching callback binding sites. A declaration-only pass can address **8 diagnostics** without editing `CivicationUI.js` or inbox runtime flow. If Phase 88 must avoid schema changes, the next safest fallback is a narrow inbox-only DOM local-cast pass for `choiceBox`, `fb`, and `ok` in `renderCivicationInbox()`, capped at the 6 `Element.style`/`Element.onclick` diagnostics and with no markup or behavior changes.

## Explicit non-goals for the next fix phase

Phase 88 should not combine declaration work with local inbox DOM casts. It should also avoid runtime logic changes, UI/DOM structure changes, CSS changes, visible text changes, data/story/place/people/import changes, package changes, `tsconfig.json` changes, and broad method-bag return-type changes.
