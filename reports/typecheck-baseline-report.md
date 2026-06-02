# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-06-02T22:20:38.385Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 192
- Files with diagnostics: 59
- Groups with diagnostics: 10
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| other | 19 | 60 | js/app.js<br>js/audits/imageRoles.audit.js<br>js/console/diagnosticConsole.js |
| js/Civication/** | 20 | 58 | js/Civication/core/civicationJobs.js<br>js/Civication/core/civicationState.js<br>js/Civication/systems/civicationActivePositionRecovery.js |
| js/ui/** | 12 | 51 | js/ui/badge-modal.js<br>js/ui/badge-unlock-toast.js<br>js/ui/dom.js |
| js/boot.js | 1 | 8 | js/boot.js |
| js/hgKnowledgeEngine.js | 1 | 5 | js/hgKnowledgeEngine.js |
| js/state/** | 2 | 4 | js/state/persistence.js<br>js/state/state.js |
| js/profile.js | 1 | 3 | js/profile.js |
| js/dataHub.js | 1 | 1 | js/dataHub.js |
| root files | 1 | 1 | knowledge.js |
| scripts/** | 1 | 1 | scripts/verify-civication-boot-smoke.js |

## Top 20 files by diagnostic count
| File | Diagnostic lines | Area |
| --- | ---: | --- |
| js/ui/place-card.js | 23 | js/ui/** |
| js/psychologyRoom.js | 11 | other |
| js/Civication/ui/CivicationDashboardUI.js | 8 | js/Civication/** |
| js/boot.js | 8 | js/boot.js |
| js/Civication/ui/CivicationSystemMap.js | 7 | js/Civication/** |
| js/Civication/systems/day/dayPatches.js | 6 | js/Civication/** |
| js/console/diagnosticConsole.js | 6 | other |
| js/i18n.js | 6 | other |
| js/observationsView.js | 6 | other |
| js/Civication/ui/CivicationMap.js | 5 | js/Civication/** |
| js/hgKnowledgeEngine.js | 5 | js/hgKnowledgeEngine.js |
| js/map.js | 5 | other |
| js/nextUpRuntime.js | 5 | other |
| js/ui/toast.js | 5 | js/ui/** |
| js/Civication/systems/civicationBlockedJobMessages.js | 4 | js/Civication/** |
| js/routes.js | 4 | other |
| js/ui/badge-modal.js | 4 | js/ui/** |
| js/Civication/systems/day/dayNarrativeConsequencesUI.js | 3 | js/Civication/** |
| js/Civication/ui/CivicationEmptyPanels.js | 3 | js/Civication/** |
| js/Civication/ui/CivicationInboxTopActionUI.js | 3 | js/Civication/** |

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
| TS2339 | 136 |
| TS2345 | 11 |
| TS2322 | 10 |
| TS2451 | 6 |
| TS2362 | 4 |
| TS2304 | 4 |
| TS2769 | 4 |
| TS2363 | 3 |
| TS2349 | 3 |
| TS2739 | 2 |
| TS2554 | 2 |
| TS2552 | 2 |
| TS2740 | 1 |
| TS2488 | 1 |
| TS2353 | 1 |
| TS2741 | 1 |
| TS2307 | 1 |

## Priority recommendations (mechanical)
1. Start with **other (60 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/ui/place-card.js` (23), `js/psychologyRoom.js` (11), `js/Civication/ui/CivicationDashboardUI.js` (8), `js/boot.js` (8), `js/Civication/ui/CivicationSystemMap.js` (7).
3. Defer broader/sensitive areas until hotspot reduction is complete: `js/Civication/**`, `js/ui/**`, `js/boot.js`.
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
js/Civication/systems/civicationBlockedJobMessages.js(15,21): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBlockedJobMessages.js(16,37): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBlockedJobMessages.js(24,21): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBlockedJobMessages.js(24,67): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
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
js/Civication/ui/CivicationDashboardUI.js(126,34): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/ui/CivicationDashboardUI.js(137,34): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/ui/CivicationDashboardUI.js(150,27): error TS2339: Property 'home' does not exist on type 'unknown'.
js/Civication/ui/CivicationDashboardUI.js(191,28): error TS2339: Property 'event' does not exist on type 'unknown'.
js/Civication/ui/CivicationDashboardUI.js(218,31): error TS2339: Property 'title' does not exist on type 'unknown'.
js/Civication/ui/CivicationDashboardUI.js(218,53): error TS2339: Property 'title' does not exist on type 'unknown'.
js/Civication/ui/CivicationDashboardUI.js(220,23): error TS2339: Property 'career_name' does not exist on type 'unknown'.
js/Civication/ui/CivicationDashboardUI.js(220,45): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/ui/CivicationEmptyPanels.js(57,17): error TS2339: Property '_t' does not exist on type '() => void'.
js/Civication/ui/CivicationEmptyPanels.js(57,48): error TS2339: Property '_t' does not exist on type '() => void'.
js/Civication/ui/CivicationEmptyPanels.js(58,13): error TS2339: Property '_t' does not exist on type '() => void'.
js/Civication/ui/CivicationHome.js(348,5): error TS2322: Type '{ frogner: { id: string; name: string; baseCost: number; quizRequirements: { naeringsliv: number; kunst: number; }; modifiers: { visibility: number; integrity: number; autonomy: number; }; }; grunerlokka: { ...; }; sagene: { ...; }; ullern: { ...; }; sondre_nordstrand: { ...; }; sentrum: { ...; }; }' is not assignable to type 'CiviFn'.
  Type '{ frogner: { id: string; name: string; baseCost: number; quizRequirements: { naeringsliv: number; kunst: number; }; modifiers: { visibility: number; integrity: number; autonomy: number; }; }; grunerlokka: { ...; }; sagene: { ...; }; ullern: { ...; }; sondre_nordstrand: { ...; }; sentrum: { ...; }; }' provides no match for the signature '(...args: unknown[]): unknown'.
js/Civication/ui/CivicationInboxTopActionUI.js(194,18): error TS2339: Property 'onclick' does not exist on type 'Element'.
js/Civication/ui/CivicationInboxTopActionUI.js(197,28): error TS2339: Property 'closest' does not exist on type 'EventTarget'.
js/Civication/ui/CivicationInboxTopActionUI.js(501,24): error TS2339: Property '__civiInboxSectionsWrapped' does not exist on type '() => void'.
js/Civication/ui/CivicationMap.js(13,671): error TS2339: Property 'getAttribute' does not exist on type 'EventTarget'.
js/Civication/ui/CivicationMap.js(13,729): error TS2339: Property 'setAttribute' does not exist on type 'EventTarget'.
js/Civication/ui/CivicationMap.js(50,525): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/ui/CivicationMap.js(95,934): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/ui/CivicationMap.js(95,958): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/ui/CivicationSystemMap.js(38,150): error TS2339: Property 'work' does not exist on type '{}'.
js/Civication/ui/CivicationSystemMap.js(53,1042): error TS2339: Property 'work' does not exist on type '{}'.
js/Civication/ui/CivicationSystemMap.js(53,1142): error TS2339: Property 'housing' does not exist on type '{}'.
js/Civication/ui/CivicationSystemMap.js(53,1246): error TS2339: Property 'store' does not exist on type '{}'.
js/Civication/ui/CivicationSystemMap.js(53,1351): error TS2339: Property 'people' does not exist on type '{}'.
js/Civication/ui/CivicationSystemMap.js(53,1454): error TS2339: Property 'debate' does not exist on type '{}'.
js/Civication/ui/CivicationSystemMap.js(53,1557): error TS2339: Property 'leisure' does not exist on type '{}'.
js/Civication/ui/CivicationUI.js(628,9): error TS2322: Type 'CiviFn | {}' is not assignable to type 'Record<string, { id?: string; name?: string; baseCost?: number; modifiers?: Record<string, number>; quizRequirements?: Record<string, unknown>; }>'.
  Type 'CiviFn' is not assignable to type 'Record<string, { id?: string; name?: string; baseCost?: number; modifiers?: Record<string, number>; quizRequirements?: Record<string, unknown>; }>'.
    Index signature for type 'string' is missing in type 'CiviFn'.
js/Civication/ui/CivicationUI.js(1374,7): error TS2322: Type 'number' is not assignable to type 'string'.
js/app.js(121,20): error TS2339: Property 'dataset' does not exist on type 'Element'.
js/audits/imageRoles.audit.js(62,79): error TS2739: Type 'Blob' is missing the following properties from type 'File': lastModified, name, webkitRelativePath
js/audits/imageRoles.audit.js(63,67): error TS2739: Type 'Blob' is missing the following properties from type 'File': lastModified, name, webkitRelativePath
js/boot.js(140,12): error TS2339: Property 'checked' does not exist on type 'HTMLElement'.
js/boot.js(143,35): error TS2339: Property 'checked' does not exist on type 'HTMLElement'.
js/boot.js(381,28): error TS2349: This expression is not callable.
  Type '{}' has no call signatures.
js/boot.js(418,43): error TS2349: This expression is not callable.
  Type 'never' has no call signatures.
js/boot.js(452,14): error TS2304: Cannot find name 'wire'.
js/boot.js(452,35): error TS2304: Cannot find name 'wire'.
js/boot.js(454,14): error TS2304: Cannot find name 'renderGallery'.
js/boot.js(454,44): error TS2304: Cannot find name 'renderGallery'.
js/console/diagnosticConsole.js(126,10): error TS2339: Property 'type' does not exist on type 'HTMLElement'.
js/console/diagnosticConsole.js(207,12): error TS2339: Property 'onclick' does not exist on type 'Element'.
js/console/diagnosticConsole.js(214,8): error TS2339: Property 'style' does not exist on type 'Element'.
```
