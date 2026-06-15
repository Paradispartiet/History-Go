# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-06-15T17:53:08.842Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 12
- Files with diagnostics: 5
- Groups with diagnostics: 3
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| js/Civication/** | 3 | 8 | js/Civication/map/loadCivicationCityMapEntries.js<br>js/Civication/systems/civicationJobEligibilityRuntime.js<br>js/Civication/ui/CivicationCityLayer.js |
| other | 1 | 3 | js/visualDesignCodes.js |
| js/dataHub.js | 1 | 1 | js/dataHub.js |

## Top 20 files by diagnostic count
| File | Diagnostic lines | Area |
| --- | ---: | --- |
| js/Civication/systems/civicationJobEligibilityRuntime.js | 4 | js/Civication/** |
| js/Civication/ui/CivicationCityLayer.js | 3 | js/Civication/** |
| js/visualDesignCodes.js | 3 | other |
| js/Civication/map/loadCivicationCityMapEntries.js | 1 | js/Civication/** |
| js/dataHub.js | 1 | js/dataHub.js |

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
| TS2339 | 7 |
| TS2322 | 2 |
| TS2367 | 2 |
| TS2345 | 1 |

## Priority recommendations (mechanical)
1. Start with **js/Civication/** (8 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/Civication/systems/civicationJobEligibilityRuntime.js` (4), `js/Civication/ui/CivicationCityLayer.js` (3), `js/visualDesignCodes.js` (3), `js/Civication/map/loadCivicationCityMapEntries.js` (1), `js/dataHub.js` (1).
3. Defer broader/sensitive areas until hotspot reduction is complete: `other`, `js/dataHub.js`.
4. Keep this report read-only and rerun after each migration phase to validate trend direction.

## Raw output excerpt (first 80 lines)
```
> history-go@0.0.0 typecheck
> tsc -p tsconfig.json
js/Civication/map/loadCivicationCityMapEntries.js(455,7): error TS2322: Type '{ id: any; historyGoPlaceId: any; name: any; category: string; lat: any; lon: any; buildingTypeId: any; mapRole: any; visibleAs: any; socialFunctions: any; phaseTypes: any; groundhopperRelevant: any; source: { ...; }; }[]' is not assignable to type 'CiviCityMapEntry[]'.
  Type '{ id: any; historyGoPlaceId: any; name: any; category: string; lat: any; lon: any; buildingTypeId: any; mapRole: any; visibleAs: any; socialFunctions: any; phaseTypes: any; groundhopperRelevant: any; source: { ...; }; }' is not assignable to type 'CiviCityMapEntry'.
    Types of property 'category' are incompatible.
      Type 'string' is not assignable to type '"by"'.
js/Civication/systems/civicationJobEligibilityRuntime.js(688,18): error TS2367: This comparison appears to be unintentional because the types 'CiviFn' and 'boolean' have no overlap.
js/Civication/systems/civicationJobEligibilityRuntime.js(714,32): error TS2339: Property 'findIndex' does not exist on type 'unknown'.
js/Civication/systems/civicationJobEligibilityRuntime.js(726,5): error TS2322: Type 'boolean' is not assignable to type 'CiviFn'.
js/Civication/systems/civicationJobEligibilityRuntime.js(775,29): error TS2367: This comparison appears to be unintentional because the types 'CiviFn' and 'boolean' have no overlap.
js/Civication/ui/CivicationCityLayer.js(394,11): error TS2339: Property '_civiLoc' does not exist on type 'HTMLButtonElement'.
js/Civication/ui/CivicationCityLayer.js(422,16): error TS2339: Property '_civiLoc' does not exist on type 'HTMLButtonElement'.
js/Civication/ui/CivicationCityLayer.js(423,16): error TS2339: Property '_civiOffset' does not exist on type 'HTMLButtonElement'.
js/dataHub.js(281,16): error TS2345: Argument of type '(e: any) => any[] & any[]' is not assignable to parameter of type '(reason: any) => PromiseLike<never>'.
  Property 'then' is missing in type 'any[] & any[]' but required in type 'PromiseLike<never>'.
js/visualDesignCodes.js(352,37): error TS2339: Property 'test' does not exist on type 'string | RegExp'.
  Property 'test' does not exist on type 'string'.
js/visualDesignCodes.js(393,38): error TS2339: Property 'test' does not exist on type 'string | RegExp'.
  Property 'test' does not exist on type 'string'.
js/visualDesignCodes.js(431,19): error TS2339: Property 'test' does not exist on type 'string | boolean | RegExp'.
  Property 'test' does not exist on type 'string'.
```
