# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-06-02T17:55:28.270Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 344
- Files with diagnostics: 68
- Groups with diagnostics: 11
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| js/Civication/** | 22 | 116 | js/Civication/core/civicationJobs.js<br>js/Civication/core/civicationState.js<br>js/Civication/systems/civicationActivePositionRecovery.js |
| other | 23 | 98 | js/app.js<br>js/audits/imageRoles.audit.js<br>js/console/diagnosticConsole.js |
| js/ui/** | 14 | 74 | js/ui/badge-modal.js<br>js/ui/badge-unlock-toast.js<br>js/ui/badges.js |
| js/profile.js | 1 | 26 | js/profile.js |
| sw.js | 1 | 10 | sw.js |
| js/boot.js | 1 | 8 | js/boot.js |
| js/hgKnowledgeEngine.js | 1 | 5 | js/hgKnowledgeEngine.js |
| js/state/** | 2 | 4 | js/state/persistence.js<br>js/state/state.js |
| js/dataHub.js | 1 | 1 | js/dataHub.js |
| root files | 1 | 1 | knowledge.js |
| scripts/** | 1 | 1 | scripts/verify-civication-boot-smoke.js |

## Top 20 files by diagnostic count
| File | Diagnostic lines | Area |
| --- | ---: | --- |
| js/Civication/ui/CivicationUI.js | 31 | js/Civication/** |
| js/profile.js | 26 | js/profile.js |
| js/ui/place-card.js | 23 | js/ui/** |
| js/Civication/ui/CivicationMiniSectionsUI.js | 18 | js/Civication/** |
| js/Civication/systems/day/dayConsequencesUI.js | 11 | js/Civication/** |
| js/psychologyRoom.js | 11 | other |
| js/observations.js | 10 | other |
| js/quizzes.js | 10 | other |
| js/ui/popup-utils.js | 10 | js/ui/** |
| sw.js | 10 | sw.js |
| js/console/init.js | 9 | other |
| js/profileIdentity.js | 9 | other |
| js/Civication/ui/CivicationDashboardUI.js | 8 | js/Civication/** |
| js/boot.js | 8 | js/boot.js |
| js/ui/badges.js | 8 | js/ui/** |
| js/ui/profile-nextup.js | 8 | js/ui/** |
| js/Civication/ui/CivicationSystemMap.js | 7 | js/Civication/** |
| js/Civication/systems/day/dayPatches.js | 6 | js/Civication/** |
| js/console/diagnosticConsole.js | 6 | other |
| js/i18n.js | 6 | other |

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
| TS2339 | 286 |
| TS2345 | 11 |
| TS2322 | 10 |
| TS2451 | 6 |
| TS2362 | 4 |
| TS2304 | 4 |
| TS2769 | 4 |
| TS2363 | 3 |
| TS2349 | 3 |
| TS2740 | 2 |
| TS2739 | 2 |
| TS2554 | 2 |
| TS2552 | 2 |
| TS2698 | 1 |
| TS2488 | 1 |
| TS2353 | 1 |
| TS2741 | 1 |
| TS2307 | 1 |

## Priority recommendations (mechanical)
1. Start with **js/Civication/** (116 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/Civication/ui/CivicationUI.js` (31), `js/profile.js` (26), `js/ui/place-card.js` (23), `js/Civication/ui/CivicationMiniSectionsUI.js` (18), `js/Civication/systems/day/dayConsequencesUI.js` (11).
3. Defer broader/sensitive areas until hotspot reduction is complete: `other`, `js/ui/**`, `js/profile.js`.
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
js/Civication/systems/day/dayConsequencesUI.js(12,67): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/systems/day/dayConsequencesUI.js(75,45): error TS2339: Property 'trust' does not exist on type 'unknown'.
js/Civication/systems/day/dayConsequencesUI.js(76,43): error TS2339: Property 'trust' does not exist on type 'unknown'.
js/Civication/systems/day/dayConsequencesUI.js(83,64): error TS2339: Property 'flags' does not exist on type 'unknown'.
js/Civication/systems/day/dayConsequencesUI.js(87,50): error TS2339: Property 'integrity' does not exist on type 'unknown'.
js/Civication/systems/day/dayConsequencesUI.js(88,51): error TS2339: Property 'visibility' does not exist on type 'unknown'.
js/Civication/systems/day/dayConsequencesUI.js(89,49): error TS2339: Property 'economicRoom' does not exist on type 'unknown'.
js/Civication/systems/day/dayConsequencesUI.js(90,49): error TS2339: Property 'autonomy' does not exist on type 'unknown'.
js/Civication/systems/day/dayConsequencesUI.js(128,52): error TS2339: Property '__civiConsequencesWrapped' does not exist on type 'never'.
js/Civication/systems/day/dayConsequencesUI.js(131,28): error TS2339: Property 'apply' does not exist on type 'never'.
js/Civication/systems/day/dayConsequencesUI.js(137,5): error TS2740: Type '{ (...args: any[]): any; __civiConsequencesWrapped: boolean; }' is missing the following properties from type 'Window': clientInformation, closed, cookieStore, customElements, and 208 more.
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
js/Civication/ui/CivicationMiniSectionsUI.js(33,30): error TS2339: Property 'title' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(33,46): error TS2339: Property 'career_name' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(33,68): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(40,18): error TS2339: Property 'brand_name' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(40,54): error TS2339: Property 'brand_name' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(41,18): error TS2339: Property 'workplace' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(41,53): error TS2339: Property 'workplace' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(44,18): error TS2339: Property 'status' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(44,49): error TS2339: Property 'status' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(76,19): error TS2339: Property 'title' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(76,44): error TS2339: Property 'title' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(118,59): error TS2339: Property 'home' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(122,59): error TS2339: Property 'home' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(127,59): error TS2339: Property 'home' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(544,55): error TS2339: Property 'home' does not exist on type 'unknown'.
js/Civication/ui/CivicationMiniSectionsUI.js(696,15): error TS2339: Property 'onclick' does not exist on type 'Element'.
```
