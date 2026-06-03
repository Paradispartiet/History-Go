# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-06-03T04:12:43.105Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 112
- Files with diagnostics: 47
- Groups with diagnostics: 9
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| js/ui/** | 10 | 42 | js/ui/badge-unlock-toast.js<br>js/ui/dom.js<br>js/ui/geo-indicator.js |
| js/Civication/** | 17 | 37 | js/Civication/core/civicationJobs.js<br>js/Civication/core/civicationState.js<br>js/Civication/systems/civicationActivePositionRecovery.js |
| other | 13 | 19 | js/app.js<br>js/audits/imageRoles.audit.js<br>js/console/legacyExtensions.js |
| js/boot.js | 1 | 4 | js/boot.js |
| js/state/** | 2 | 4 | js/state/persistence.js<br>js/state/state.js |
| js/profile.js | 1 | 3 | js/profile.js |
| js/dataHub.js | 1 | 1 | js/dataHub.js |
| root files | 1 | 1 | knowledge.js |
| scripts/** | 1 | 1 | scripts/verify-civication-boot-smoke.js |

## Top 20 files by diagnostic count
| File | Diagnostic lines | Area |
| --- | ---: | --- |
| js/ui/place-card.js | 23 | js/ui/** |
| js/Civication/systems/day/dayPatches.js | 6 | js/Civication/** |
| js/boot.js | 4 | js/boot.js |
| js/Civication/systems/day/dayNarrativeConsequencesUI.js | 3 | js/Civication/** |
| js/Civication/ui/CivicationEmptyPanels.js | 3 | js/Civication/** |
| js/Civication/ui/CivicationInboxTopActionUI.js | 3 | js/Civication/** |
| js/Civication/ui/CivicationMap.js | 3 | js/Civication/** |
| js/onboarding/onboardingEngine.js | 3 | other |
| js/profile.js | 3 | js/profile.js |
| js/state/state.js | 3 | js/state/** |
| js/stories/stories_utils.js | 3 | other |
| js/ui/popup-utils.js | 3 | js/ui/** |
| js/ui/search.js | 3 | js/ui/** |
| js/ui/wonderkammer-entry.js | 3 | js/ui/** |
| js/Civication/core/civicationJobs.js | 2 | js/Civication/** |
| js/Civication/core/civicationState.js | 2 | js/Civication/** |
| js/Civication/systems/civicationBrandEmployerBridge.js | 2 | js/Civication/** |
| js/Civication/systems/day/dayFactionConflictSystem.js | 2 | js/Civication/** |
| js/Civication/systems/day/dayRuntimeDebugPanel.js | 2 | js/Civication/** |
| js/Civication/systems/day/dayWeeklyReview.js | 2 | js/Civication/** |

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
| TS2339 | 60 |
| TS2345 | 11 |
| TS2322 | 10 |
| TS2451 | 6 |
| TS2362 | 4 |
| TS2304 | 4 |
| TS2769 | 4 |
| TS2363 | 3 |
| TS2739 | 2 |
| TS2552 | 2 |
| TS2740 | 1 |
| TS2488 | 1 |
| TS2353 | 1 |
| TS2741 | 1 |
| TS2349 | 1 |
| TS2307 | 1 |

## Priority recommendations (mechanical)
1. Start with **js/ui/** (42 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/ui/place-card.js` (23), `js/Civication/systems/day/dayPatches.js` (6), `js/boot.js` (4), `js/Civication/systems/day/dayNarrativeConsequencesUI.js` (3), `js/Civication/ui/CivicationEmptyPanels.js` (3).
3. Defer broader/sensitive areas until hotspot reduction is complete: `js/Civication/**`, `other`, `js/boot.js`.
4. Keep this report read-only and rerun after each migration phase to validate trend direction.

## Raw output excerpt (first 80 lines)
```
js/Civication/core/civicationJobs.js(443,24): error TS2345: Argument of type '{ career_id: string; career_name: string; title: string; threshold: number; points_at_offer: number; }' is not assignable to parameter of type '{ career_id: any; career_name: any; title: any; threshold: any; points_at_offer: any; brand_id: any; brand_name: any; brand_type: any; brand_group: any; sector: any; place_id: any; employer_context: any; }'.
  Type '{ career_id: string; career_name: string; title: string; threshold: number; points_at_offer: number; }' is missing the following properties from type '{ career_id: any; career_name: any; title: any; threshold: any; points_at_offer: any; brand_id: any; brand_name: any; brand_type: any; brand_group: any; sector: any; place_id: any; employer_context: any; }': brand_id, brand_name, brand_type, brand_group, and 3 more.
js/Civication/core/civicationJobs.js(462,24): error TS2345: Argument of type '{ career_id: string; career_name: string; title: string; threshold: number; points_at_offer: number; }' is not assignable to parameter of type '{ career_id: any; career_name: any; title: any; threshold: any; points_at_offer: any; brand_id: any; brand_name: any; brand_type: any; brand_group: any; sector: any; place_id: any; employer_context: any; }'.
  Type '{ career_id: string; career_name: string; title: string; threshold: number; points_at_offer: number; }' is missing the following properties from type '{ career_id: any; career_name: any; title: any; threshold: any; points_at_offer: any; brand_id: any; brand_name: any; brand_type: any; brand_group: any; sector: any; place_id: any; employer_context: any; }': brand_id, brand_name, brand_type, brand_group, and 3 more.
js/Civication/core/civicationState.js(389,8): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/core/civicationState.js(389,15): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/systems/civicationActivePositionRecovery.js(170,5): error TS2322: Type 'boolean' is not assignable to type 'CiviFn'.
js/Civication/systems/civicationBrandEmployerBridge.js(98,34): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBrandEmployerBridge.js(100,19): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationDailyMailBuilder.js(1260,11): error TS2322: Type '{ slot: string; date?: string; phase?: string; phase_label?: any; advances_role_plan?: boolean; }' is not assignable to type '{ date: string; phase: string; phase_label: any; slot: string; advances_role_plan: boolean; }'.
  Property 'date' is optional in type '{ slot: string; date?: string; phase?: string; phase_label?: any; advances_role_plan?: boolean; }' but required in type '{ date: string; phase: string; phase_label: any; slot: string; advances_role_plan: boolean; }'.
js/Civication/systems/civicationPlaceAccessBridge.js(198,64): error TS2339: Property 'then' does not exist on type 'unknown'.
js/Civication/systems/day/dayFactionConflictSystem.js(116,25): error TS2339: Property 'score' does not exist on type 'never'.
js/Civication/systems/day/dayFactionConflictSystem.js(116,42): error TS2339: Property 'faction' does not exist on type 'never'.
js/Civication/systems/day/dayNarrativeConsequencesUI.js(168,52): error TS2339: Property '__civiNarrativeWrapped' does not exist on type 'never'.
js/Civication/systems/day/dayNarrativeConsequencesUI.js(171,28): error TS2339: Property 'apply' does not exist on type 'never'.
js/Civication/systems/day/dayNarrativeConsequencesUI.js(177,5): error TS2740: Type '{ (...args: any[]): any; __civiNarrativeWrapped: boolean; }' is missing the following properties from type 'Window': clientInformation, closed, cookieStore, customElements, and 208 more.
js/Civication/systems/day/dayNpcCharacterThreads.js(147,28): error TS2339: Property 'detail' does not exist on type 'Event'.
js/Civication/systems/day/dayPatches.js(648,28): error TS2339: Property 'getPendingEvent' does not exist on type 'answer'.
js/Civication/systems/day/dayPatches.js(648,51): error TS2339: Property 'getPendingEvent' does not exist on type 'answer'.
js/Civication/systems/day/dayPatches.js(690,24): error TS2339: Property 'onAppOpen' does not exist on type 'answer'.
js/Civication/systems/day/dayPatches.js(737,22): error TS2339: Property 'onAppOpen' does not exist on type 'answer'.
js/Civication/systems/day/dayPatches.js(779,20): error TS2339: Property 'onAppOpen' does not exist on type 'answer'.
js/Civication/systems/day/dayPatches.js(850,5): error TS2322: Type 'boolean' is not assignable to type 'CiviFn'.
js/Civication/systems/day/dayRuntimeDebugPanel.js(296,40): error TS2339: Property '_t' does not exist on type '() => void'.
js/Civication/systems/day/dayRuntimeDebugPanel.js(297,20): error TS2339: Property '_t' does not exist on type '() => void'.
js/Civication/systems/day/dayWeeklyReview.js(19,21): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/systems/day/dayWeeklyReview.js(19,25): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/ui/CivicationEmptyPanels.js(57,17): error TS2339: Property '_t' does not exist on type '() => void'.
js/Civication/ui/CivicationEmptyPanels.js(57,48): error TS2339: Property '_t' does not exist on type '() => void'.
js/Civication/ui/CivicationEmptyPanels.js(58,13): error TS2339: Property '_t' does not exist on type '() => void'.
js/Civication/ui/CivicationHome.js(348,5): error TS2322: Type '{ frogner: { id: string; name: string; baseCost: number; quizRequirements: { naeringsliv: number; kunst: number; }; modifiers: { visibility: number; integrity: number; autonomy: number; }; }; grunerlokka: { ...; }; sagene: { ...; }; ullern: { ...; }; sondre_nordstrand: { ...; }; sentrum: { ...; }; }' is not assignable to type 'CiviFn'.
  Type '{ frogner: { id: string; name: string; baseCost: number; quizRequirements: { naeringsliv: number; kunst: number; }; modifiers: { visibility: number; integrity: number; autonomy: number; }; }; grunerlokka: { ...; }; sagene: { ...; }; ullern: { ...; }; sondre_nordstrand: { ...; }; sentrum: { ...; }; }' provides no match for the signature '(...args: unknown[]): unknown'.
js/Civication/ui/CivicationInboxTopActionUI.js(194,18): error TS2339: Property 'onclick' does not exist on type 'Element'.
js/Civication/ui/CivicationInboxTopActionUI.js(197,28): error TS2339: Property 'closest' does not exist on type 'EventTarget'.
js/Civication/ui/CivicationInboxTopActionUI.js(501,24): error TS2339: Property '__civiInboxSectionsWrapped' does not exist on type '() => void'.
js/Civication/ui/CivicationMap.js(50,525): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/ui/CivicationMap.js(95,934): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/ui/CivicationMap.js(95,958): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/ui/CivicationUI.js(628,9): error TS2322: Type 'CiviFn | {}' is not assignable to type 'Record<string, { id?: string; name?: string; baseCost?: number; modifiers?: Record<string, number>; quizRequirements?: Record<string, unknown>; }>'.
  Type 'CiviFn' is not assignable to type 'Record<string, { id?: string; name?: string; baseCost?: number; modifiers?: Record<string, number>; quizRequirements?: Record<string, unknown>; }>'.
    Index signature for type 'string' is missing in type 'CiviFn'.
js/Civication/ui/CivicationUI.js(1374,7): error TS2322: Type 'number' is not assignable to type 'string'.
js/app.js(121,20): error TS2339: Property 'dataset' does not exist on type 'Element'.
js/audits/imageRoles.audit.js(62,79): error TS2739: Type 'Blob' is missing the following properties from type 'File': lastModified, name, webkitRelativePath
js/audits/imageRoles.audit.js(63,67): error TS2739: Type 'Blob' is missing the following properties from type 'File': lastModified, name, webkitRelativePath
js/boot.js(452,14): error TS2304: Cannot find name 'wire'.
js/boot.js(452,35): error TS2304: Cannot find name 'wire'.
js/boot.js(454,14): error TS2304: Cannot find name 'renderGallery'.
js/boot.js(454,44): error TS2304: Cannot find name 'renderGallery'.
js/console/legacyExtensions.js(101,77): error TS2339: Property 'url' does not exist on type 'URL | Request'.
  Property 'url' does not exist on type 'URL'.
js/console/verify.js(140,12): error TS2339: Property 'onclick' does not exist on type 'Element'.
js/core/pos.js(364,43): error TS2339: Property 'hasAttribute' does not exist on type 'EventTarget'.
js/core/viewportManager.js(24,10): error TS2339: Property 'isContentEditable' does not exist on type 'Element'.
js/dataHub.js(67,38): error TS2769: No overload matches this call.
  Overload 1 of 2, '(input: string | URL | Request, init?: RequestInit): Promise<Response>', gave the following error.
    Type 'string' is not assignable to type 'RequestCache'.
  Overload 2 of 2, '(input: URL | RequestInfo, init?: RequestInit): Promise<Response>', gave the following error.
    Type 'string' is not assignable to type 'RequestCache'.
js/emnerLoader.js(26,41): error TS2339: Property 'src' does not exist on type 'HTMLOrSVGScriptElement'.
  Property 'src' does not exist on type 'SVGScriptElement'.
js/hgchips.js(65,21): error TS2488: Type 'unknown' must have a '[Symbol.iterator]()' method that returns an iterator.
js/learningLog.js(130,7): error TS2353: Object literal may only specify known properties, and 'LEARNING' does not exist in type 'CiviLearningLogFn'.
js/nature_place_map_bridge.js(269,31): error TS2339: Property 'closest' does not exist on type 'EventTarget'.
js/onboarding/onboardingEngine.js(131,18): error TS2339: Property 'filter' does not exist on type 'unknown'.
js/onboarding/onboardingEngine.js(138,18): error TS2339: Property 'some' does not exist on type 'unknown'.
js/onboarding/onboardingEngine.js(344,43): error TS2339: Property 'filter' does not exist on type 'unknown'.
js/profile.js(61,5): error TS2451: Cannot redeclare block-scoped variable 'PEOPLE'.
js/profile.js(62,5): error TS2451: Cannot redeclare block-scoped variable 'PLACES'.
js/profile.js(63,5): error TS2451: Cannot redeclare block-scoped variable 'BADGES'.
js/profileIdentity.js(373,52): error TS2339: Property 'detail' does not exist on type 'Event'.
js/profileIdentity.js(377,25): error TS2339: Property 'detail' does not exist on type 'Event'.
js/state/persistence.js(149,24): error TS2345: Argument of type 'string | number' is not assignable to parameter of type 'number'.
  Type 'string' is not assignable to type 'number'.
js/state/state.js(21,5): error TS2451: Cannot redeclare block-scoped variable 'PLACES'.
js/state/state.js(22,5): error TS2451: Cannot redeclare block-scoped variable 'PEOPLE'.
js/state/state.js(23,5): error TS2451: Cannot redeclare block-scoped variable 'BADGES'.
js/stories/stories_utils.js(46,16): error TS2339: Property 'dataset' does not exist on type 'Element'.
js/stories/stories_utils.js(48,14): error TS2339: Property 'dataset' does not exist on type 'Element'.
```
