# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-06-01T12:28:59.809Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 1801
- Files with diagnostics: 183
- Groups with diagnostics: 11
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| other | 73 | 586 | js/DomainRegistry.js<br>js/aha.js<br>js/app.js |
| js/ui/** | 20 | 498 | js/ui/badge-modal.js<br>js/ui/badge-unlock-toast.js<br>js/ui/badges.js |
| js/Civication/** | 67 | 403 | js/Civication/core/civicationEventEngine.js<br>js/Civication/core/civicationJobs.js<br>js/Civication/core/civicationState.js |
| js/profile.js | 1 | 83 | js/profile.js |
| js/boot.js | 1 | 76 | js/boot.js |
| scripts/** | 14 | 62 | scripts/generate-civication-mails.js<br>scripts/i18n-audit-places.js<br>scripts/i18n-place-manifest-loader.js |
| js/hgKnowledgeEngine.js | 1 | 43 | js/hgKnowledgeEngine.js |
| js/dataHub.js | 1 | 21 | js/dataHub.js |
| js/state/** | 3 | 16 | js/state/openmode.js<br>js/state/persistence.js<br>js/state/state.js |
| sw.js | 1 | 12 | sw.js |
| root files | 1 | 1 | knowledge.js |

## Top 20 files by diagnostic count
| File | Diagnostic lines | Area |
| --- | ---: | --- |
| js/ui/place-card.js | 130 | js/ui/** |
| js/Civication/ui/CivicationUI.js | 114 | js/Civication/** |
| js/profile.js | 83 | js/profile.js |
| js/ui/popup-utils.js | 80 | js/ui/** |
| js/boot.js | 76 | js/boot.js |
| js/ui/left-panel.js | 55 | js/ui/** |
| js/routes.js | 47 | other |
| js/hgKnowledgeEngine.js | 43 | js/hgKnowledgeEngine.js |
| js/ui/lists.js | 41 | js/ui/** |
| js/console/devConsole.js | 36 | other |
| js/ui/nature-card.js | 36 | js/ui/** |
| js/Civication/ui/CivicationMiniSectionsUI.js | 32 | js/Civication/** |
| js/quizzes.js | 30 | other |
| js/nextUpRuntime.js | 29 | other |
| js/nature_place_map_bridge.js | 27 | other |
| js/ui/search.js | 22 | js/ui/** |
| js/console/legacyExtensions.js | 21 | other |
| js/dataHub.js | 21 | js/dataHub.js |
| js/leksikon/leksikon_loader.js | 21 | other |
| js/console/diagnosticConsole.js | 20 | other |

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
| TS2339 | 1444 |
| TS2551 | 138 |
| TS2304 | 70 |
| TS2307 | 36 |
| TS2322 | 23 |
| TS2349 | 14 |
| TS2345 | 13 |
| TS2580 | 13 |
| TS2550 | 11 |
| TS2362 | 6 |
| TS2451 | 6 |
| TS2552 | 5 |
| TS2363 | 4 |
| TS2538 | 4 |
| TS2769 | 2 |
| TS2367 | 2 |
| TS2740 | 2 |
| TS2739 | 2 |
| TS2554 | 2 |
| TS2698 | 1 |
| TS2488 | 1 |
| TS2353 | 1 |
| TS2741 | 1 |

## Priority recommendations (mechanical)
1. Start with **other (586 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/ui/place-card.js` (130), `js/Civication/ui/CivicationUI.js` (114), `js/profile.js` (83), `js/ui/popup-utils.js` (80), `js/boot.js` (76).
3. Defer broader/sensitive areas until hotspot reduction is complete: `js/ui/**`, `js/Civication/**`, `js/profile.js`.
4. Keep this report read-only and rerun after each migration phase to validate trend direction.

## Raw output excerpt (first 80 lines)
```
> history-go@0.0.0 typecheck
> tsc -p tsconfig.json
js/Civication/core/civicationEventEngine.js(42,8): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/core/civicationEventEngine.js(42,15): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
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
js/Civication/core/civicationState.js(389,8): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/core/civicationState.js(389,15): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/identityCompass.js(94,10): error TS2551: Property 'HG_IdentityCompass' does not exist on type 'Window & typeof globalThis'. Did you mean 'HG_IdentityCore'?
js/Civication/identityEngine.js(225,8): error TS2339: Property 'HG_IdentityEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/mailPlanBridge.js(245,24): error TS2551: Property 'CivicationNpcReactions' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationSectionsUI'?
js/Civication/mailPlanBridge.js(252,24): error TS2339: Property 'CivicationNpcCharacterThreads' does not exist on type 'Window & typeof globalThis'.
js/Civication/mailPlanBridge.js(690,10): error TS2339: Property 'CiviMailPlanBridge' does not exist on type 'Window & typeof globalThis'.
js/Civication/merits-and-jobs.js(193,22): error TS2304: Cannot find name 'catIdFromDisplay'.
js/Civication/roleThreadResolver.js(108,33): error TS2339: Property 'story_flags' does not exist on type 'unknown'.
js/Civication/roleThreadResolver.js(108,54): error TS2339: Property 'story_flags' does not exist on type 'unknown'.
js/Civication/roleThreadResolver.js(439,10): error TS2339: Property 'CiviRoleThreadResolver' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationActivePositionRecovery.js(170,5): error TS2322: Type 'boolean' is not assignable to type 'CiviFn'.
js/Civication/systems/civicationActivePositionRecovery.js(226,10): error TS2339: Property 'CivicationActivePositionRecovery' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationBlockedJobMessages.js(15,21): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBlockedJobMessages.js(16,37): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBlockedJobMessages.js(24,21): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBlockedJobMessages.js(24,67): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBrandEmployerBridge.js(98,34): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBrandEmployerBridge.js(100,19): error TS2339: Property 'CivicationState' does not exist on type 'typeof globalThis'.
js/Civication/systems/civicationBrandJobProgression.js(313,31): error TS2339: Property 'CivicationBrandJobState' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationBrandJobProgression.js(328,24): error TS2339: Property 'CivicationBrandJobState' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationBrandJobProgression.js(337,22): error TS2339: Property 'DEBUG' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationBrandJobProgression.js(356,23): error TS2339: Property 'CivicationBrandJobState' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationBrandJobProgression.js(360,10): error TS2339: Property 'CivicationBrandJobProgression' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationBrandJobState.js(217,10): error TS2339: Property 'CivicationBrandJobState' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationCareerOutcomeRuntime.js(424,38): error TS2339: Property 'sequence' does not exist on type 'unknown'.
js/Civication/systems/civicationCareerOutcomeRuntime.js(427,30): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/systems/civicationCareerOutcomeRuntime.js(460,24): error TS2367: This comparison appears to be unintentional because the types 'CiviFn' and 'boolean' have no overlap.
js/Civication/systems/civicationCareerOutcomeRuntime.js(489,5): error TS2322: Type 'boolean' is not assignable to type 'CiviFn'.
js/Civication/systems/civicationCareerOutcomeRuntime.js(563,10): error TS2339: Property 'CivicationCareerOutcomeRuntime' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationCareerOutcomeRuntime.js(576,18): error TS2367: This comparison appears to be unintentional because the types 'CiviFn' and 'boolean' have no overlap.
js/Civication/systems/civicationDailyMailBuilder.js(129,18): error TS2339: Property 'DEBUG' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationDailyMailBuilder.js(482,18): error TS2339: Property 'DEBUG' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationDailyMailBuilder.js(1017,29): error TS2339: Property 'status' does not exist on type 'unknown'.
js/Civication/systems/civicationDailyMailBuilder.js(1021,30): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/systems/civicationDailyMailBuilder.js(1260,11): error TS2322: Type '{ slot: string; date?: string; phase?: string; phase_label?: any; advances_role_plan?: boolean; }' is not assignable to type '{ date: string; phase: string; phase_label: any; slot: string; advances_role_plan: boolean; }'.
  Property 'date' is optional in type '{ slot: string; date?: string; phase?: string; phase_label?: any; advances_role_plan?: boolean; }' but required in type '{ date: string; phase: string; phase_label: any; slot: string; advances_role_plan: boolean; }'.
js/Civication/systems/civicationDailyMailBuilder.js(1371,80): error TS2339: Property 'length' does not exist on type 'unknown'.
js/Civication/systems/civicationDailyMailBuilder.js(1459,10): error TS2339: Property 'CivicationDailyMailBuilder' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationDailyTaskGates.js(343,28): error TS2339: Property 'CivicationDailyMailBuilder' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationDailyTaskGates.js(409,10): error TS2339: Property 'CivicationDailyTaskGates' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationDailyTaskGates.js(426,82): error TS2339: Property 'length' does not exist on type 'unknown'.
js/Civication/systems/civicationDailyTaskGates.js(427,35): error TS2339: Property 'CivicationDailyMailBuilder' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationDebateEngine.js(605,10): error TS2551: Property 'CivicationDebateEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/civicationLifeMailRuntime.js(61,18): error TS2339: Property 'DEBUG' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationLifeMailRuntime.js(388,10): error TS2551: Property 'CivicationLifeMailRuntime' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationMailRuntime'?
js/Civication/systems/civicationMailPlanDebug.js(12,10): error TS2339: Property 'CiviMailPlanDebug' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationMailRuntime.js(141,18): error TS2339: Property 'DEBUG' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationMailRuntime.js(553,18): error TS2339: Property 'DEBUG' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationMailRuntime.js(627,22): error TS2339: Property 'DEBUG' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationMailRuntime.js(681,43): error TS2339: Property 'CivicationBrandJobState' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationMailRuntime.js(736,5): error TS2322: Type 'string' is not assignable to type 'CiviFn'.
js/Civication/systems/civicationNPCs.js(31,22): error TS2339: Property 'DEBUG' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationNPCs.js(50,10): error TS2339: Property 'CivicationNPCs' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationPeopleEngine.js(333,10): error TS2551: Property 'CivicationPeopleEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/civicationPeopleEngine.js(340,12): error TS2551: Property 'CivicationPeopleEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/civicationPeopleEngine.js(346,12): error TS2551: Property 'CivicationPeopleEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEventEngine'?
js/Civication/systems/civicationPlaceAccessBridge.js(198,64): error TS2339: Property 'then' does not exist on type 'unknown'.
js/Civication/systems/civicationRoleModelRuntime.js(102,18): error TS2339: Property 'DEBUG' does not exist on type 'Window & typeof globalThis'.
js/Civication/systems/civicationRoleStarter.js(161,16): error TS2339: Property 'CivicationActivePositionRecovery' does not exist on type 'Window & typeof globalThis'.
```
