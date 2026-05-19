# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-05-19T10:21:23.322Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 1940
- Files with diagnostics: 193
- Groups with diagnostics: 11
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| js/Civication/** | 80 | 616 | js/Civication/CivicationBoot.js<br>js/Civication/civicationCommercial.js<br>js/Civication/core/civicationCalendar.js |
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
| js/Civication/core/civicationEventEngine.js | 45 | js/Civication/** |
| js/hgKnowledgeEngine.js | 43 | js/hgKnowledgeEngine.js |
| js/ui/lists.js | 37 | js/ui/** |
| js/console/devConsole.js | 36 | other |
| js/ui/nature-card.js | 36 | js/ui/** |
| js/Civication/systems/day/dayPatches.js | 30 | js/Civication/** |
| js/quizzes.js | 30 | other |
| js/nextUpRuntime.js | 29 | other |
| js/nature_place_map_bridge.js | 27 | other |
| js/Civication/systems/civicationLifeMailRuntime.js | 23 | js/Civication/** |
| js/Civication/ui/CivicationMiniSectionsUI.js | 22 | js/Civication/** |
| js/ui/search.js | 22 | js/ui/** |
| js/console/legacyExtensions.js | 21 | other |

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
| TS2339 | 1609 |
| TS2551 | 124 |
| TS2304 | 70 |
| TS2307 | 36 |
| TS2322 | 20 |
| TS2580 | 13 |
| TS2349 | 12 |
| TS2550 | 11 |
| TS2345 | 6 |
| TS2451 | 6 |
| TS2362 | 5 |
| TS2552 | 5 |
| TS2538 | 4 |
| TS2740 | 3 |
| TS2739 | 3 |
| TS2769 | 3 |
| TS2363 | 3 |
| TS2698 | 2 |
| TS2554 | 2 |
| TS2488 | 1 |
| TS2353 | 1 |
| TS2741 | 1 |

## Priority recommendations (mechanical)
1. Start with **js/Civication/** (616 diagnostics)** because it currently has the highest baseline volume.
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
js/Civication/core/civicationEventEngine.js(87,39): error TS2339: Property 'HG_STATE' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(119,5): error TS2322: Type 'unknown' is not assignable to type 'CiviEventEngineState'.
  Index signature for type 'string' is missing in type '{}'.
js/Civication/core/civicationEventEngine.js(160,16): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(161,21): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(163,5): error TS2740: Type '{}' is missing the following properties from type 'CiviEventEngineInboxItem[]': length, pop, push, concat, and 28 more.
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
js/Civication/core/civicationEventEngine.js(1168,7): error TS2739: Type '{}' is missing the following properties from type '{ ok: boolean; reason: string; }': ok, reason
js/Civication/core/civicationEventEngine.js(1256,30): error TS2339: Property 'global_rules' does not exist on type 'unknown[] | CiviRecord'.
  Property 'global_rules' does not exist on type 'unknown[]'.
js/Civication/core/civicationEventEngine.js(1257,30): error TS2339: Property 'global_rules' does not exist on type 'unknown[] | CiviRecord'.
  Property 'global_rules' does not exist on type 'unknown[]'.
js/Civication/core/civicationEventEngine.js(1258,30): error TS2339: Property 'global_rules' does not exist on type 'unknown[] | CiviRecord'.
  Property 'global_rules' does not exist on type 'unknown[]'.
js/Civication/core/civicationEventEngine.js(1519,35): error TS2339: Property 'CivicationEventChannels' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1524,16): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1525,26): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1537,22): error TS2769: No overload matches this call.
  Overload 1 of 2, '(...items: ConcatArray<{ status: string; enqueued_at: string; event: CiviEventEngineEvent; }>[]): { status: string; enqueued_at: string; event: CiviEventEngineEvent; }[]', gave the following error.
    Argument of type 'CiviEventEngineInboxItem[]' is not assignable to parameter of type 'ConcatArray<{ status: string; enqueued_at: string; event: CiviEventEngineEvent; }>'.
      The types returned by 'slice(...)' are incompatible between these types.
        Type 'CiviEventEngineInboxItem[]' is not assignable to type '{ status: string; enqueued_at: string; event: CiviEventEngineEvent; }[]'.
          Type 'CiviEventEngineInboxItem' is not assignable to type '{ status: string; enqueued_at: string; event: CiviEventEngineEvent; }'.
            Property 'status' is optional in type 'CiviEventEngineInboxItem' but required in type '{ status: string; enqueued_at: string; event: CiviEventEngineEvent; }'.
  Overload 2 of 2, '(...items: ({ status: string; enqueued_at: string; event: CiviEventEngineEvent; } | ConcatArray<{ status: string; enqueued_at: string; event: CiviEventEngineEvent; }>)[]): { ...; }[]', gave the following error.
    Argument of type 'CiviEventEngineInboxItem[]' is not assignable to parameter of type '{ status: string; enqueued_at: string; event: CiviEventEngineEvent; } | ConcatArray<{ status: string; enqueued_at: string; event: CiviEventEngineEvent; }>'.
      Type 'CiviEventEngineInboxItem[]' is not assignable to type 'ConcatArray<{ status: string; enqueued_at: string; event: CiviEventEngineEvent; }>'.
        The types returned by 'slice(...)' are incompatible between these types.
          Type 'CiviEventEngineInboxItem[]' is not assignable to type '{ status: string; enqueued_at: string; event: CiviEventEngineEvent; }[]'.
            Type 'CiviEventEngineInboxItem' is not assignable to type '{ status: string; enqueued_at: string; event: CiviEventEngineEvent; }'.
              Property 'status' is optional in type 'CiviEventEngineInboxItem' but required in type '{ status: string; enqueued_at: string; event: CiviEventEngineEvent; }'.
js/Civication/core/civicationEventEngine.js(1797,39): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(1928,14): error TS2339: Property 'CivicationTaskEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1947,12): error TS2339: Property 'CivicationCalendar' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(1958,16): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(1961,55): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(1974,11): error TS2698: Spread types may only be created from object types.
js/Civication/core/civicationEventEngine.js(1985,24): error TS2339: Property 'title' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(1985,39): error TS2339: Property 'career_name' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(1986,30): error TS2339: Property 'career_name' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(2000,46): error TS2339: Property 'progress' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(2001,46): error TS2339: Property 'contract' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(2006,22): error TS2339: Property 'role_key' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(2007,22): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(2009,27): error TS2339: Property 'title' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(2009,47): error TS2339: Property 'career_name' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(2010,33): error TS2339: Property 'career_name' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(2046,8): error TS2551: Property 'CivicationEventEngine' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationEconomyEngine'?
js/Civication/core/civicationJobs.js(171,33): error TS2339: Property 'flags' does not exist on type 'unknown'.
js/Civication/core/civicationJobs.js(171,49): error TS2339: Property 'flags' does not exist on type 'unknown'.
js/Civication/core/civicationJobs.js(318,42): error TS2339: Property 'map' does not exist on type 'unknown'.
js/Civication/core/civicationJobs.js(322,15): error TS2769: No overload matches this call.
  Overload 1 of 2, '(...items: ConcatArray<{ status: string; createdAt: number; event: any; }>[]): { status: string; createdAt: number; event: any; }[]', gave the following error.
```
