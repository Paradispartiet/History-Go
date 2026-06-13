# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-06-13T21:49:03.711Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 118
- Files with diagnostics: 26
- Groups with diagnostics: 4
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| js/Civication/** | 19 | 103 | js/Civication/civicationCommercial.js<br>js/Civication/map/loadCivicationCityMapEntries.js<br>js/Civication/systems/CivicationSocialConversationEngine.js |
| other | 4 | 9 | js/app.js<br>js/boot-fast.js<br>js/core/domainRuntime.js |
| js/ui/** | 2 | 5 | js/ui/place-card-epoke.js<br>js/ui/place-card.js |
| js/dataHub.js | 1 | 1 | js/dataHub.js |

## Top 20 files by diagnostic count
| File | Diagnostic lines | Area |
| --- | ---: | --- |
| js/Civication/ui/CivicationCanvasMap.js | 18 | js/Civication/** |
| js/Civication/ui/CivicationCityLayer.js | 14 | js/Civication/** |
| js/Civication/systems/civicationFriendMessages.js | 10 | js/Civication/** |
| js/Civication/systems/CivicationSocialConversationEngine.js | 9 | js/Civication/** |
| js/Civication/ui/CivicationThreeMap.js | 7 | js/Civication/** |
| js/Civication/map/loadCivicationCityMapEntries.js | 6 | js/Civication/** |
| js/Civication/systems/civicationJobEligibilityRuntime.js | 5 | js/Civication/** |
| js/Civication/ui/CivicationHistoryGoPlaceLayer.js | 5 | js/Civication/** |
| js/Civication/ui/CivicationUI.js | 5 | js/Civication/** |
| js/Civication/systems/CivicationSocialPlaceResolver.js | 4 | js/Civication/** |
| js/Civication/ui/CivicationDashboardUI.js | 4 | js/Civication/** |
| js/visualDesignCodes.js | 4 | other |
| js/Civication/systems/civicationFriendsEngine.js | 3 | js/Civication/** |
| js/Civication/ui/CivicationMapZoom.js | 3 | js/Civication/** |
| js/boot-fast.js | 3 | other |
| js/ui/place-card.js | 3 | js/ui/** |
| js/Civication/civicationCommercial.js | 2 | js/Civication/** |
| js/Civication/systems/civicationRelationshipEngine.js | 2 | js/Civication/** |
| js/Civication/ui/CivicationInboxTopActionUI.js | 2 | js/Civication/** |
| js/Civication/ui/CivicationMiniSectionsUI.js | 2 | js/Civication/** |

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
| TS2339 | 78 |
| TS2551 | 34 |
| TS2322 | 2 |
| TS2367 | 2 |
| TS2345 | 2 |

## Priority recommendations (mechanical)
1. Start with **js/Civication/** (103 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/Civication/ui/CivicationCanvasMap.js` (18), `js/Civication/ui/CivicationCityLayer.js` (14), `js/Civication/systems/civicationFriendMessages.js` (10), `js/Civication/systems/CivicationSocialConversationEngine.js` (9), `js/Civication/ui/CivicationThreeMap.js` (7).
3. Defer broader/sensitive areas until hotspot reduction is complete: `other`, `js/ui/**`, `js/dataHub.js`.
4. Keep this report read-only and rerun after each migration phase to validate trend direction.

## Raw output excerpt (first 80 lines)
```
> history-go@0.0.0 typecheck
> tsc -p tsconfig.json
js/Civication/civicationCommercial.js(225,55): error TS2339: Property 'store' does not exist on type 'object'.
js/Civication/civicationCommercial.js(236,57): error TS2339: Property 'housing' does not exist on type 'object'.
js/Civication/map/loadCivicationCityMapEntries.js(124,46): error TS2339: Property 'buildingTypes' does not exist on type 'unknown'.
js/Civication/map/loadCivicationCityMapEntries.js(125,29): error TS2339: Property 'buildingTypes' does not exist on type 'unknown'.
js/Civication/map/loadCivicationCityMapEntries.js(206,33): error TS2339: Property 'mappingData' does not exist on type '{}'.
js/Civication/map/loadCivicationCityMapEntries.js(207,32): error TS2339: Property 'placesData' does not exist on type '{}'.
js/Civication/map/loadCivicationCityMapEntries.js(208,39): error TS2339: Property 'buildingTypesData' does not exist on type '{}'.
js/Civication/map/loadCivicationCityMapEntries.js(454,7): error TS2322: Type '{ id: any; historyGoPlaceId: any; name: any; category: string; lat: any; lon: any; buildingTypeId: any; mapRole: any; visibleAs: any; socialFunctions: any; phaseTypes: any; groundhopperRelevant: any; source: { ...; }; }[]' is not assignable to type 'CiviCityMapEntry[]'.
  Type '{ id: any; historyGoPlaceId: any; name: any; category: string; lat: any; lon: any; buildingTypeId: any; mapRole: any; visibleAs: any; socialFunctions: any; phaseTypes: any; groundhopperRelevant: any; source: { ...; }; }' is not assignable to type 'CiviCityMapEntry'.
    Types of property 'category' are incompatible.
      Type 'string' is not assignable to type '"by"'.
js/Civication/systems/CivicationSocialConversationEngine.js(26,14): error TS2339: Property 'CivicationSocialConversationEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/CivicationSocialConversationEngine.js(177,24): error TS2551: Property 'CivicationFriendsEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/CivicationSocialConversationEngine.js(186,24): error TS2551: Property 'CivicationFriendsEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/CivicationSocialConversationEngine.js(199,24): error TS2551: Property 'CivicationFriendsEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/CivicationSocialConversationEngine.js(213,27): error TS2339: Property 'CivicationFriendMessages' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/CivicationSocialConversationEngine.js(487,27): error TS2339: Property 'CivicationFriendMessages' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/CivicationSocialConversationEngine.js(488,27): error TS2551: Property 'CivicationRelationshipEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationObligationEngine'?
js/Civication/systems/CivicationSocialConversationEngine.js(659,27): error TS2339: Property 'CivicationFriendMessages' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/CivicationSocialConversationEngine.js(786,10): error TS2339: Property 'CivicationSocialConversationEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/CivicationSocialPlaceResolver.js(46,14): error TS2339: Property 'CivicationSocialPlaceResolver' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/CivicationSocialPlaceResolver.js(717,24): error TS2551: Property 'CivicationFriendsEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/CivicationSocialPlaceResolver.js(755,24): error TS2551: Property 'CivicationFriendsEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/CivicationSocialPlaceResolver.js(913,10): error TS2339: Property 'CivicationSocialPlaceResolver' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationFriendMessages.js(21,14): error TS2339: Property 'CivicationFriendMessages' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationFriendMessages.js(140,24): error TS2551: Property 'CivicationFriendsEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/civicationFriendMessages.js(273,24): error TS2551: Property 'CivicationFriendsEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/civicationFriendMessages.js(477,24): error TS2551: Property 'CivicationFriendsEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/civicationFriendMessages.js(705,27): error TS2551: Property 'CivicationRelationshipEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationObligationEngine'?
js/Civication/systems/civicationFriendMessages.js(782,27): error TS2551: Property 'CivicationRelationshipEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationObligationEngine'?
js/Civication/systems/civicationFriendMessages.js(926,35): error TS2339: Property 'CivicationSocialConversationEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationFriendMessages.js(927,23): error TS2339: Property 'CivicationSocialConversationEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationFriendMessages.js(929,29): error TS2339: Property 'CivicationSocialConversationEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationFriendMessages.js(978,10): error TS2339: Property 'CivicationFriendMessages' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationFriendsEngine.js(14,14): error TS2551: Property 'CivicationFriendsEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/civicationFriendsEngine.js(2069,29): error TS2339: Property 'CivicationSocialPlaceResolver' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationFriendsEngine.js(2114,10): error TS2551: Property 'CivicationFriendsEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/civicationJobEligibilityRuntime.js(688,18): error TS2367: This comparison appears to be unintentional because the types 'CiviFn' and 'boolean' have no overlap.
js/Civication/systems/civicationJobEligibilityRuntime.js(714,32): error TS2339: Property 'findIndex' does not exist on type 'unknown'.
js/Civication/systems/civicationJobEligibilityRuntime.js(726,5): error TS2322: Type 'boolean' is not assignable to type 'CiviFn'.
js/Civication/systems/civicationJobEligibilityRuntime.js(736,10): error TS2339: Property 'CivicationJobEligibilityRuntime' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationJobEligibilityRuntime.js(775,29): error TS2367: This comparison appears to be unintentional because the types 'CiviFn' and 'boolean' have no overlap.
js/Civication/systems/civicationRelationshipEngine.js(23,14): error TS2551: Property 'CivicationRelationshipEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationObligationEngine'?
js/Civication/systems/civicationRelationshipEngine.js(361,10): error TS2551: Property 'CivicationRelationshipEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationObligationEngine'?
js/Civication/ui/CivicationCanvasMap.js(9,14): error TS2551: Property 'CivicationCanvasMap' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationCanvasMap.js(66,31): error TS2339: Property 'CIVICATION_CANVAS_MAP_ENABLED' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(110,43): error TS2339: Property '__civiThreeActive' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(221,26): error TS2339: Property 'getContext' does not exist on type 'HTMLElement'.
js/Civication/ui/CivicationCanvasMap.js(222,30): error TS2339: Property 'getContext' does not exist on type 'HTMLElement'.
js/Civication/ui/CivicationCanvasMap.js(305,23): error TS2551: Property 'CIVI_OSLO_GEO_ANCHORS' does not exist on type 'Window & typeof globalThis'. Did you mean 'CIVI_OSLO_ANCHORS'?
js/Civication/ui/CivicationCanvasMap.js(433,24): error TS2339: Property 'CivicationOsloMapCalibration' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(673,16): error TS2339: Property '__civiThreeActive' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(791,16): error TS2339: Property '__civiThreeActive' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(858,22): error TS2339: Property 'place' does not exist on type 'never'.
js/Civication/ui/CivicationCanvasMap.js(858,36): error TS2339: Property 'place' does not exist on type 'never'.
js/Civication/ui/CivicationCanvasMap.js(859,35): error TS2339: Property 'place' does not exist on type 'never'.
js/Civication/ui/CivicationCanvasMap.js(864,25): error TS2339: Property 'CivicationHistoryGoPlaceLayer' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(873,16): error TS2339: Property '__civiThreeActive' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(946,24): error TS2339: Property 'CivicationOsloMapCalibration' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(948,20): error TS2551: Property 'CIVI_OSLO_GEO_ANCHORS' does not exist on type 'Window & typeof globalThis'. Did you mean 'CIVI_OSLO_ANCHORS'?
js/Civication/ui/CivicationCanvasMap.js(960,24): error TS2339: Property 'CivicationOsloMapCalibration' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCanvasMap.js(981,10): error TS2551: Property 'CivicationCanvasMap' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationCityLayer.js(11,14): error TS2339: Property 'CivicationCityLayer' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCityLayer.js(28,19): error TS2551: Property 'CivicationFriendsEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/ui/CivicationCityLayer.js(61,23): error TS2551: Property 'CivicationThreeMap' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationCityLayer.js(67,23): error TS2551: Property 'CivicationCanvasMap' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationCityLayer.js(195,23): error TS2551: Property 'CivicationCanvasMap' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationCityLayer.js(199,23): error TS2551: Property 'CivicationThreeMap' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMap'?
js/Civication/ui/CivicationCityLayer.js(394,11): error TS2339: Property '_civiLoc' does not exist on type 'HTMLButtonElement'.
js/Civication/ui/CivicationCityLayer.js(422,16): error TS2339: Property '_civiLoc' does not exist on type 'HTMLButtonElement'.
js/Civication/ui/CivicationCityLayer.js(423,16): error TS2339: Property '_civiOffset' does not exist on type 'HTMLButtonElement'.
js/Civication/ui/CivicationCityLayer.js(693,29): error TS2339: Property 'CivicationSocialPlaceResolver' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCityLayer.js(896,27): error TS2339: Property 'CivicationFriendMessages' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCityLayer.js(1279,27): error TS2339: Property 'CivicationFriendMessages' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCityLayer.js(1319,27): error TS2339: Property 'CivicationFriendMessages' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationCityLayer.js(1413,10): error TS2339: Property 'CivicationCityLayer' does not exist on type 'Window & typeof globalThis'.
js/Civication/ui/CivicationDashboardUI.js(87,28): error TS2339: Property 'pc' does not exist on type 'unknown'.
js/Civication/ui/CivicationDashboardUI.js(87,42): error TS2339: Property 'balance' does not exist on type 'unknown'.
```
