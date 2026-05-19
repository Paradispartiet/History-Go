# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-05-19T20:39:16.389Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 1921
- Files with diagnostics: 193
- Groups with diagnostics: 11
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| js/Civication/** | 80 | 597 | js/Civication/CivicationBoot.js<br>js/Civication/civicationCommercial.js<br>js/Civication/core/civicationCalendar.js |
| other | 70 | 551 | js/DomainRegistry.js<br>js/aha.js<br>js/app.js |
| js/ui/** | 20 | 481 | js/ui/badge-modal.js<br>js/ui/badge-unlock-toast.js<br>js/ui/badges.js |
| js/profile.js | 1 | 79 | js/profile.js |
| js/boot.js | 1 | 75 | js/boot.js |
| scripts/** | 14 | 62 | scripts/generate-civication-mails.js<br>scripts/i18n-audit-places.js<br>scripts/i18n-place-manifest-loader.js |
| js/hgKnowledgeEngine.js | 1 | 43 | js/hgKnowledgeEngine.js |
| sw.js | 1 | 12 | sw.js |
| js/dataHub.js | 1 | 11 | js/dataHub.js |
| js/state/** | 3 | 9 | js/state/openmode.js<br>js/state/persistence.js<br>js/state/state.js |
| root files | 1 | 1 | knowledge.js |

## Top 20 files by diagnostic count
| File | Diagnostic lines | Area |
| --- | ---: | --- |
| js/ui/place-card.js | 125 | js/ui/** |
| js/Civication/ui/CivicationUI.js | 107 | js/Civication/** |
| js/ui/popup-utils.js | 80 | js/ui/** |
| js/profile.js | 79 | js/profile.js |
| js/boot.js | 75 | js/boot.js |
| js/routes.js | 47 | other |
| js/ui/left-panel.js | 47 | js/ui/** |
| js/hgKnowledgeEngine.js | 43 | js/hgKnowledgeEngine.js |
| js/ui/lists.js | 37 | js/ui/** |
| js/console/devConsole.js | 36 | other |
| js/ui/nature-card.js | 36 | js/ui/** |
| js/Civication/systems/day/dayPatches.js | 30 | js/Civication/** |
| js/quizzes.js | 30 | other |
| js/nextUpRuntime.js | 29 | other |
| js/nature_place_map_bridge.js | 27 | other |
| js/Civication/core/civicationEventEngine.js | 26 | js/Civication/** |
| js/Civication/systems/civicationLifeMailRuntime.js | 23 | js/Civication/** |
| js/Civication/ui/CivicationMiniSectionsUI.js | 22 | js/Civication/** |
| js/ui/search.js | 22 | js/ui/** |
| js/console/legacyExtensions.js | 21 | other |

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
| TS2339 | 1593 |
| TS2551 | 124 |
| TS2304 | 70 |
| TS2307 | 36 |
| TS2322 | 19 |
| TS2580 | 13 |
| TS2349 | 12 |
| TS2550 | 11 |
| TS2362 | 6 |
| TS2345 | 6 |
| TS2451 | 6 |
| TS2552 | 5 |
| TS2363 | 4 |
| TS2538 | 4 |
| TS2769 | 2 |
| TS2740 | 2 |
| TS2739 | 2 |
| TS2554 | 2 |
| TS2698 | 1 |
| TS2488 | 1 |
| TS2353 | 1 |
| TS2741 | 1 |

## Priority recommendations (mechanical)
1. Start with **js/Civication/** (597 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/ui/place-card.js` (125), `js/Civication/ui/CivicationUI.js` (107), `js/ui/popup-utils.js` (80), `js/profile.js` (79), `js/boot.js` (75).
3. Defer broader/sensitive areas until hotspot reduction is complete: `other`, `js/ui/**`, `js/profile.js`.
4. Keep this report read-only and rerun after each migration phase to validate trend direction.

## Raw output excerpt (first 80 lines)
```
> history-go@0.0.0 typecheck
> tsc -p tsconfig.json
js/Civication/CivicationBoot.js(172,7): error TS2322: Type 'CivicationEventEngine' is not assignable to type 'CiviMethodBag'.
  Index signature for type 'string' is missing in type 'CivicationEventEngine'.
js/Civication/civicationCommercial.js(53,25): error TS2339: Property 'balance' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(135,36): error TS2339: Property 'packs' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(135,53): error TS2339: Property 'packs' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(164,36): error TS2339: Property 'stores' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(164,54): error TS2339: Property 'stores' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(230,47): error TS2339: Property 'map' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(231,52): error TS2339: Property 'map' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(259,52): error TS2339: Property 'map' does not exist on type 'unknown'.
js/Civication/core/civicationCalendar.js(169,10): error TS2339: Property 'CivicationCalendar' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(42,8): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/core/civicationEventEngine.js(42,15): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/core/civicationEventEngine.js(87,39): error TS2339: Property 'HG_STATE' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(160,16): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(161,64): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(168,16): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(169,14): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(172,16): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(173,14): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(200,25): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(201,25): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(384,18): error TS2339: Property 'CivicationMailRuntime' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(415,20): error TS2339: Property 'CiviRoleStoryletBridge' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(989,14): error TS2339: Property 'CivicationCalendar' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1000,14): error TS2339: Property 'CivicationCalendar' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1003,14): error TS2339: Property 'CivicationTaskEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1029,18): error TS2339: Property 'CiviStoryResolver' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1030,29): error TS2339: Property 'CiviStoryResolver' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1090,39): error TS2339: Property 'CivicationConflicts' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1091,29): error TS2339: Property 'CivicationConflicts' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1527,35): error TS2339: Property 'CivicationEventChannels' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1532,16): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1533,26): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1938,14): error TS2339: Property 'CivicationTaskEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1957,12): error TS2339: Property 'CivicationCalendar' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(2068,8): error TS2551: Property 'CivicationEventEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEconomyEngine'?
js/Civication/core/civicationJobs.js(171,33): error TS2339: Property 'flags' does not exist on type 'unknown'.
js/Civication/core/civicationJobs.js(171,49): error TS2339: Property 'flags' does not exist on type 'unknown'.
js/Civication/core/civicationJobs.js(318,42): error TS2339: Property 'map' does not exist on type 'unknown'.
js/Civication/core/civicationJobs.js(322,15): error TS2769: No overload matches this call.
  Overload 1 of 2, '(...items: ConcatArray<{ status: string; createdAt: number; event: any; }>[]): { status: string; createdAt: number; event: any; }[]', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type 'ConcatArray<{ status: string; createdAt: number; event: any; }>'.
      Type '{}' is missing the following properties from type 'ConcatArray<{ status: string; createdAt: number; event: any; }>': length, join, slice
  Overload 2 of 2, '(...items: ({ status: string; createdAt: number; event: any; } | ConcatArray<{ status: string; createdAt: number; event: any; }>)[]): { status: string; createdAt: number; event: any; }[]', gave the following error.
    Argument of type 'unknown' is not assignable to parameter of type '{ status: string; createdAt: number; event: any; } | ConcatArray<{ status: string; createdAt: number; event: any; }>'.
js/Civication/core/civicationJobs.js(428,24): error TS2345: Argument of type '{ career_id: string; career_name: string; title: string; threshold: number; points_at_offer: number; }' is not assignable to parameter of type '{ career_id: any; career_name: any; title: any; threshold: any; points_at_offer: any; brand_id: any; brand_name: any; brand_type: any; brand_group: any; sector: any; place_id: any; employer_context: any; }'.
  Type '{ career_id: string; career_name: string; title: string; threshold: number; points_at_offer: number; }' is missing the following properties from type '{ career_id: any; career_name: any; title: any; threshold: any; points_at_offer: any; brand_id: any; brand_name: any; brand_type: any; brand_group: any; sector: any; place_id: any; employer_context: any; }': brand_id, brand_name, brand_type, brand_group, and 3 more.
js/Civication/core/civicationJobs.js(447,24): error TS2345: Argument of type '{ career_id: string; career_name: string; title: string; threshold: number; points_at_offer: number; }' is not assignable to parameter of type '{ career_id: any; career_name: any; title: any; threshold: any; points_at_offer: any; brand_id: any; brand_name: any; brand_type: any; brand_group: any; sector: any; place_id: any; employer_context: any; }'.
  Type '{ career_id: string; career_name: string; title: string; threshold: number; points_at_offer: number; }' is missing the following properties from type '{ career_id: any; career_name: any; title: any; threshold: any; points_at_offer: any; brand_id: any; brand_name: any; brand_type: any; brand_group: any; sector: any; place_id: any; employer_context: any; }': brand_id, brand_name, brand_type, brand_group, and 3 more.
js/Civication/core/civicationJobs.js(570,30): error TS2339: Property 'career' does not exist on type 'unknown'.
js/Civication/core/civicationJobs.js(729,14): error TS2339: Property 'CivicationCalendar' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationJobs.js(795,10): error TS2339: Property 'hgGetJobOffers' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationJobs.js(796,10): error TS2339: Property 'hgSetJobOffers' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationState.js(146,16): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationState.js(147,34): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationState.js(162,16): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationState.js(163,14): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationState.js(389,8): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/core/civicationState.js(389,15): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/core/civicationTaskEngine.js(173,14): error TS2339: Property 'CivicationCalendar' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationTaskEngine.js(263,10): error TS2339: Property 'CivicationTaskEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/identityCompass.js(16,28): error TS2339: Property 'focus' does not exist on type 'unknown'.
js/Civication/identityCompass.js(92,10): error TS2551: Property 'HG_IdentityCompass' does not exist on type 'Window & typeof globalThis'. Did you mean 'HG_IdentityCore'?
js/Civication/identityEngine.js(225,8): error TS2339: Property 'HG_IdentityEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/mailPlanBridge.js(137,26): error TS2551: Property 'CivicationEventEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEconomyEngine'?
js/Civication/mailPlanBridge.js(141,21): error TS2339: Property 'CivicationMailRuntime' does not exist on type 'Window & typeof globalThis'.
js/Civication/mailPlanBridge.js(245,24): error TS2339: Property 'CivicationNpcReactions' does not exist on type 'Window & typeof globalThis'.
js/Civication/mailPlanBridge.js(252,24): error TS2339: Property 'CivicationNpcCharacterThreads' does not exist on type 'Window & typeof globalThis'.
js/Civication/mailPlanBridge.js(690,10): error TS2339: Property 'CiviMailPlanBridge' does not exist on type 'Window & typeof globalThis'.
js/Civication/merits-and-jobs.js(27,44): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/merits-and-jobs.js(28,35): error TS2339: Property 'find' does not exist on type 'unknown'.
js/Civication/merits-and-jobs.js(40,16): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/merits-and-jobs.js(85,37): error TS2339: Property 'some' does not exist on type 'unknown'.
js/Civication/merits-and-jobs.js(99,35): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/merits-and-jobs.js(176,16): error TS2339: Property 'ok' does not exist on type 'unknown'.
js/Civication/merits-and-jobs.js(177,17): error TS2339: Property 'reason' does not exist on type 'unknown'.
js/Civication/merits-and-jobs.js(189,22): error TS2304: Cannot find name 'catIdFromDisplay'.
```
