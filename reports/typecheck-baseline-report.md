# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-06-05T04:12:41.459Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 49
- Files with diagnostics: 12
- Groups with diagnostics: 1
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| js/Civication/** | 12 | 49 | js/Civication/civicationCommercial.js<br>js/Civication/systems/civicationJobEligibilityRuntime.js<br>js/Civication/ui/CivicationCanvasMap.js |

## Top 20 files by diagnostic count
| File | Diagnostic lines | Area |
| --- | ---: | --- |
| js/Civication/ui/CivicationCanvasMap.js | 16 | js/Civication/** |
| js/Civication/systems/civicationJobEligibilityRuntime.js | 5 | js/Civication/** |
| js/Civication/ui/CivicationThreeMap.js | 5 | js/Civication/** |
| js/Civication/ui/CivicationUI.js | 5 | js/Civication/** |
| js/Civication/ui/CivicationHistoryGoPlaceLayer.js | 4 | js/Civication/** |
| js/Civication/ui/CivicationDashboardUI.js | 3 | js/Civication/** |
| js/Civication/ui/CivicationMapZoom.js | 3 | js/Civication/** |
| js/Civication/civicationCommercial.js | 2 | js/Civication/** |
| js/Civication/ui/CivicationInboxTopActionUI.js | 2 | js/Civication/** |
| js/Civication/ui/CivicationMiniSectionsUI.js | 2 | js/Civication/** |
| js/Civication/ui/CivicationDayPhaseUI.js | 1 | js/Civication/** |
| js/Civication/ui/CivicationMap.js | 1 | js/Civication/** |

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
| TS2339 | 36 |
| TS2551 | 10 |
| TS2367 | 2 |
| TS2322 | 1 |

## Priority recommendations (mechanical)
1. Start with **js/Civication/** (49 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/Civication/ui/CivicationCanvasMap.js` (16), `js/Civication/systems/civicationJobEligibilityRuntime.js` (5), `js/Civication/ui/CivicationThreeMap.js` (5), `js/Civication/ui/CivicationUI.js` (5), `js/Civication/ui/CivicationHistoryGoPlaceLayer.js` (4).
3. Defer broader/sensitive areas until hotspot reduction is complete: none identified.
4. Keep this report read-only and rerun after each migration phase to validate trend direction.

## Raw output excerpt (first 80 lines)
```
> history-go@0.0.0 typecheck
> tsc -p tsconfig.json
js/Civication/civicationCommercial.js(225,55): error TS2339: Property 'store' does not exist on type 'object'.
js/Civication/civicationCommercial.js(236,57): error TS2339: Property 'housing' does not exist on type 'object'.
js/Civication/systems/civicationJobEligibilityRuntime.js(688,18): error TS2367: This comparison appears to be unintentional because the types 'CiviFn' and 'boolean' have no overlap.
js/Civication/systems/civicationJobEligibilityRuntime.js(714,32): error TS2339: Property 'findIndex' does not exist on type 'unknown'.
js/Civication/systems/civicationJobEligibilityRuntime.js(726,5): error TS2322: Type 'boolean' is not assignable to type 'CiviFn'.
js/Civication/systems/civicationJobEligibilityRuntime.js(736,10): error TS2339: Property 'CivicationJobEligibilityRuntime' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationJobEligibilityRuntime.js(775,29): error TS2367: This comparison appears to be unintentional because the types 'CiviFn' and 'boolean' have no overlap.
js/Civication/ui/CivicationCanvasMap.js(9,14): error TS2551: Property 'CivicationCanvasMap' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationCanvasMap.js(60,31): error TS2339: Property 'CIVICATION_CANVAS_MAP_ENABLED' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(121,26): error TS2339: Property 'getContext' does not exist on type 'HTMLElement'.
js/Civication/ui/CivicationCanvasMap.js(122,30): error TS2339: Property 'getContext' does not exist on type 'HTMLElement'.
js/Civication/ui/CivicationCanvasMap.js(204,23): error TS2551: Property 'CIVI_OSLO_GEO_ANCHORS' does not exist on type 'Window & typeof globalThis'. Did you mean 'CIVI_OSLO_ANCHORS'?
js/Civication/ui/CivicationCanvasMap.js(332,24): error TS2339: Property 'CivicationOsloMapCalibration' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(572,16): error TS2339: Property '__civiThreeActive' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(688,16): error TS2339: Property '__civiThreeActive' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(755,22): error TS2339: Property 'place' does not exist on type 'never'.
js/Civication/ui/CivicationCanvasMap.js(755,36): error TS2339: Property 'place' does not exist on type 'never'.
js/Civication/ui/CivicationCanvasMap.js(756,21): error TS2339: Property 'place' does not exist on type 'never'.
js/Civication/ui/CivicationCanvasMap.js(765,16): error TS2339: Property '__civiThreeActive' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(838,24): error TS2339: Property 'CivicationOsloMapCalibration' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(840,20): error TS2551: Property 'CIVI_OSLO_GEO_ANCHORS' does not exist on type 'Window & typeof globalThis'. Did you mean 'CIVI_OSLO_ANCHORS'?
js/Civication/ui/CivicationCanvasMap.js(852,24): error TS2339: Property 'CivicationOsloMapCalibration' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(873,10): error TS2551: Property 'CivicationCanvasMap' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationDashboardUI.js(87,28): error TS2339: Property 'pc' does not exist on type 'unknown'.
js/Civication/ui/CivicationDashboardUI.js(87,42): error TS2339: Property 'balance' does not exist on type 'unknown'.
js/Civication/ui/CivicationDashboardUI.js(87,61): error TS2339: Property 'amount' does not exist on type 'unknown'.
js/Civication/ui/CivicationDayPhaseUI.js(196,28): error TS2339: Property 'CivicationJobEligibilityRuntime' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationHistoryGoPlaceLayer.js(176,26): error TS2551: Property 'CivicationMapZoom' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationHistoryGoPlaceLayer.js(176,54): error TS2551: Property 'CivicationMapZoom' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationHistoryGoPlaceLayer.js(320,16): error TS2339: Property 'CIVICATION_CANVAS_MAP_ENABLED' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationHistoryGoPlaceLayer.js(411,10): error TS2339: Property 'CivicationHistoryGoPlaceLayer' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationInboxTopActionUI.js(73,31): error TS2339: Property 'CivicationInboxItemFilters' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationInboxTopActionUI.js(73,69): error TS2339: Property 'CivicationInboxItemFilters' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationMap.js(133,34): error TS2339: Property 'CIVICATION_CANVAS_MAP_ENABLED' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationMapZoom.js(7,14): error TS2339: Property 'CIVICATION_CANVAS_MAP_ENABLED' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationMapZoom.js(8,12): error TS2551: Property 'CivicationMapZoom' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationMapZoom.js(267,10): error TS2551: Property 'CivicationMapZoom' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationMiniSectionsUI.js(428,10): error TS2339: Property 'CivicationInboxItemFilters' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationMiniSectionsUI.js(428,46): error TS2339: Property 'CivicationInboxItemFilters' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationThreeMap.js(20,14): error TS2551: Property 'CivicationThreeMap' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationThreeMap.js(143,24): error TS2339: Property 'CivicationOsloMapCalibration' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationThreeMap.js(1105,16): error TS2339: Property 'CIVICATION_THREE_MAP_ENABLED' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationThreeMap.js(1147,12): error TS2339: Property '__civiThreeActive' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationThreeMap.js(1193,10): error TS2551: Property 'CivicationThreeMap' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationUI.js(1218,25): error TS2339: Property 'daily_mail_meta' does not exist on type 'unknown'.
js/Civication/ui/CivicationUI.js(1219,24): error TS2339: Property 'role_content_meta' does not exist on type 'unknown'.
js/Civication/ui/CivicationUI.js(1220,24): error TS2339: Property 'life_mail_meta' does not exist on type 'unknown'.
js/Civication/ui/CivicationUI.js(1221,28): error TS2339: Property 'mail_plan_meta' does not exist on type 'unknown'.
js/Civication/ui/CivicationUI.js(1222,33): error TS2339: Property 'career_outcome_meta' does not exist on type 'unknown'.
npm warn Unknown env config "http-proxy". This will stop working in the next major version of npm.
```

## Phase 89: Lesespor DataHub result declaration pass

- Added a narrow declaration-only result shape for DataHub.loadLesespor() in schemas/globals.d.ts.
- The declared result matches the existing runtime return shape from js/dataHub.js: items, byPlace and manifest.
- This removes the leksikon_loader.js unknown.items diagnostics without changing runtime behavior.
- No Civication files, runtime logic, router, boot, CSS, HTML, data files or app flow were changed.
