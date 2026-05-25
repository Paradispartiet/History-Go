# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-05-25T22:24:52.236Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 1968
- Files with diagnostics: 195
- Groups with diagnostics: 11
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| js/Civication/** | 79 | 584 | js/Civication/core/civicationCalendar.js<br>js/Civication/core/civicationEventEngine.js<br>js/Civication/core/civicationJobs.js |
| other | 73 | 571 | js/DomainRegistry.js<br>js/aha.js<br>js/app.js |
| js/ui/** | 20 | 510 | js/ui/badge-modal.js<br>js/ui/badge-unlock-toast.js<br>js/ui/badges.js |
| js/profile.js | 1 | 83 | js/profile.js |
| js/boot.js | 1 | 75 | js/boot.js |
| scripts/** | 14 | 62 | scripts/generate-civication-mails.js<br>scripts/i18n-audit-places.js<br>scripts/i18n-place-manifest-loader.js |
| js/hgKnowledgeEngine.js | 1 | 43 | js/hgKnowledgeEngine.js |
| js/state/** | 3 | 16 | js/state/openmode.js<br>js/state/persistence.js<br>js/state/state.js |
| sw.js | 1 | 12 | sw.js |
| js/dataHub.js | 1 | 11 | js/dataHub.js |
| root files | 1 | 1 | knowledge.js |

## Top 20 files by diagnostic count
| File | Diagnostic lines | Area |
| --- | ---: | --- |
| js/ui/place-card.js | 142 | js/ui/** |
| js/Civication/ui/CivicationUI.js | 107 | js/Civication/** |
| js/profile.js | 83 | js/profile.js |
| js/ui/popup-utils.js | 80 | js/ui/** |
| js/boot.js | 75 | js/boot.js |
| js/ui/left-panel.js | 55 | js/ui/** |
| js/routes.js | 47 | other |
| js/hgKnowledgeEngine.js | 43 | js/hgKnowledgeEngine.js |
| js/ui/lists.js | 41 | js/ui/** |
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
| TS2339 | 1619 |
| TS2551 | 137 |
| TS2304 | 70 |
| TS2307 | 36 |
| TS2322 | 20 |
| TS2345 | 13 |
| TS2580 | 13 |
| TS2349 | 12 |
| TS2550 | 11 |
| TS2362 | 6 |
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
1. Start with **js/Civication/** (584 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/ui/place-card.js` (142), `js/Civication/ui/CivicationUI.js` (107), `js/profile.js` (83), `js/ui/popup-utils.js` (80), `js/boot.js` (75).
3. Defer broader/sensitive areas until hotspot reduction is complete: `other`, `js/ui/**`, `js/profile.js`.
4. Keep this report read-only and rerun after each migration phase to validate trend direction.

## Raw output excerpt (first 80 lines)
```
> history-go@0.0.0 typecheck
> tsc -p tsconfig.json
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
js/Civication/core/civicationJobs.js(323,15): error TS2769: No overload matches this call.
  Overload 1 of 2, '(...items: ConcatArray<{ status: string; createdAt: number; event: any; }>[]): { status: string; createdAt: number; event: any; }[]', gave the following error.
    Argument of type '{ event?: { id?: string | number; }; }[]' is not assignable to parameter of type 'ConcatArray<{ status: string; createdAt: number; event: any; }>'.
      The types returned by 'slice(...)' are incompatible between these types.
        Type '{ event?: { id?: string | number; }; }[]' is not assignable to type '{ status: string; createdAt: number; event: any; }[]'.
          Type '{ event?: { id?: string | number; }; }' is missing the following properties from type '{ status: string; createdAt: number; event: any; }': status, createdAt
  Overload 2 of 2, '(...items: ({ status: string; createdAt: number; event: any; } | ConcatArray<{ status: string; createdAt: number; event: any; }>)[]): { status: string; createdAt: number; event: any; }[]', gave the following error.
    Argument of type '{ event?: { id?: string | number; }; }[]' is not assignable to parameter of type '{ status: string; createdAt: number; event: any; } | ConcatArray<{ status: string; createdAt: number; event: any; }>'.
      Type '{ event?: { id?: string | number; }; }[]' is not assignable to type 'ConcatArray<{ status: string; createdAt: number; event: any; }>'.
        The types returned by 'slice(...)' are incompatible between these types.
          Type '{ event?: { id?: string | number; }; }[]' is not assignable to type '{ status: string; createdAt: number; event: any; }[]'.
            Type '{ event?: { id?: string | number; }; }' is missing the following properties from type '{ status: string; createdAt: number; event: any; }': status, createdAt
js/Civication/core/civicationJobs.js(429,24): error TS2345: Argument of type '{ career_id: string; career_name: string; title: string; threshold: number; points_at_offer: number; }' is not assignable to parameter of type '{ career_id: any; career_name: any; title: any; threshold: any; points_at_offer: any; brand_id: any; brand_name: any; brand_type: any; brand_group: any; sector: any; place_id: any; employer_context: any; }'.
  Type '{ career_id: string; career_name: string; title: string; threshold: number; points_at_offer: number; }' is missing the following properties from type '{ career_id: any; career_name: any; title: any; threshold: any; points_at_offer: any; brand_id: any; brand_name: any; brand_type: any; brand_group: any; sector: any; place_id: any; employer_context: any; }': brand_id, brand_name, brand_type, brand_group, and 3 more.
js/Civication/core/civicationJobs.js(448,24): error TS2345: Argument of type '{ career_id: string; career_name: string; title: string; threshold: number; points_at_offer: number; }' is not assignable to parameter of type '{ career_id: any; career_name: any; title: any; threshold: any; points_at_offer: any; brand_id: any; brand_name: any; brand_type: any; brand_group: any; sector: any; place_id: any; employer_context: any; }'.
  Type '{ career_id: string; career_name: string; title: string; threshold: number; points_at_offer: number; }' is missing the following properties from type '{ career_id: any; career_name: any; title: any; threshold: any; points_at_offer: any; brand_id: any; brand_name: any; brand_type: any; brand_group: any; sector: any; place_id: any; employer_context: any; }': brand_id, brand_name, brand_type, brand_group, and 3 more.
js/Civication/core/civicationJobs.js(731,14): error TS2339: Property 'CivicationCalendar' does not exist on type 'Window & typeof globalThis'.
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
js/Civication/merits-and-jobs.js(193,22): error TS2304: Cannot find name 'catIdFromDisplay'.
js/Civication/roleStoryletBridge.js(133,10): error TS2339: Property 'CiviRoleStoryletBridge' does not exist on type 'Window & typeof globalThis'.
js/Civication/roleThreadResolver.js(88,67): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/roleThreadResolver.js(105,26): error TS2339: Property 'CiviStoryResolver' does not exist on type 'Window & typeof globalThis'.
js/Civication/roleThreadResolver.js(437,10): error TS2339: Property 'CiviRoleThreadResolver' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationActivePositionRecovery.js(170,5): error TS2322: Type 'boolean' is not assignable to type 'CiviFn'.
js/Civication/systems/civicationActivePositionRecovery.js(204,26): error TS2339: Property 'stability' does not exist on type 'unknown'.
js/Civication/systems/civicationActivePositionRecovery.js(226,10): error TS2339: Property 'CivicationActivePositionRecovery' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationBlockedJobMessages.js(15,21): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBlockedJobMessages.js(16,37): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBlockedJobMessages.js(24,21): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBlockedJobMessages.js(24,67): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBrandEmployerBridge.js(98,34): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBrandEmployerBridge.js(100,19): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBrandJobProgression.js(193,31): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationBrandJobProgression.js(313,31): error TS2339: Property 'CivicationBrandJobState' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationBrandJobProgression.js(328,24): error TS2339: Property 'CivicationBrandJobState' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationBrandJobProgression.js(337,22): error TS2339: Property 'DEBUG' does not exist on type 'Window & typeof globalThis'.
```
