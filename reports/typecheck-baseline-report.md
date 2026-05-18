# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-05-18T09:45:13.152Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 2052
- Files with diagnostics: 194
- Groups with diagnostics: 11
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| js/Civication/** | 81 | 730 | js/Civication/CivicationBoot.js<br>js/Civication/civicationCommercial.js<br>js/Civication/core/civicationCalendar.js |
| other | 70 | 551 | js/DomainRegistry.js<br>js/aha.js<br>js/app.js |
| js/ui/** | 20 | 479 | js/ui/badge-modal.js<br>js/ui/badge-unlock-toast.js<br>js/ui/badges.js |
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
| js/ui/place-card.js | 123 | js/ui/** |
| js/Civication/ui/CivicationUI.js | 102 | js/Civication/** |
| js/Civication/core/civicationEventEngine.js | 91 | js/Civication/** |
| js/ui/popup-utils.js | 80 | js/ui/** |
| js/profile.js | 79 | js/profile.js |
| js/boot.js | 75 | js/boot.js |
| js/routes.js | 47 | other |
| js/ui/left-panel.js | 47 | js/ui/** |
| js/hgKnowledgeEngine.js | 43 | js/hgKnowledgeEngine.js |
| js/Civication/core/civicationEconomyEngine.js | 39 | js/Civication/** |
| js/ui/lists.js | 37 | js/ui/** |
| js/console/devConsole.js | 36 | other |
| js/ui/nature-card.js | 36 | js/ui/** |
| js/Civication/systems/day/dayPatches.js | 30 | js/Civication/** |
| js/quizzes.js | 30 | other |
| js/nextUpRuntime.js | 29 | other |
| js/nature_place_map_bridge.js | 27 | other |
| js/Civication/systems/civicationLifeMailRuntime.js | 23 | js/Civication/** |
| js/Civication/systems/civicationCareerOutcomeRuntime.js | 22 | js/Civication/** |
| js/Civication/ui/CivicationMiniSectionsUI.js | 22 | js/Civication/** |

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
| TS2339 | 1641 |
| TS2551 | 201 |
| TS2304 | 71 |
| TS2307 | 36 |
| TS2322 | 20 |
| TS2580 | 13 |
| TS2349 | 12 |
| TS2550 | 11 |
| TS2362 | 6 |
| TS2345 | 6 |
| TS2451 | 6 |
| TS2552 | 5 |
| TS2363 | 4 |
| TS2538 | 4 |
| TS2740 | 3 |
| TS2739 | 3 |
| TS2769 | 3 |
| TS2698 | 2 |
| TS2554 | 2 |
| TS2488 | 1 |
| TS2353 | 1 |
| TS2741 | 1 |

## Priority recommendations (mechanical)
1. Start with **js/Civication/** (730 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/ui/place-card.js` (123), `js/Civication/ui/CivicationUI.js` (102), `js/Civication/core/civicationEventEngine.js` (91), `js/ui/popup-utils.js` (80), `js/profile.js` (79).
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
js/Civication/core/civicationEconomyEngine.js(91,32): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(96,26): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(96,46): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(104,28): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(113,22): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(113,50): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(121,42): error TS2339: Property 'tiers' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(121,57): error TS2339: Property 'tiers' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(131,35): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(132,37): error TS2339: Property 'name' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(132,51): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(140,24): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(191,19): error TS2339: Property 'global_rules' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(193,19): error TS2339: Property 'global_rules' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(200,16): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(202,26): error TS2339: Property 'unemployed_since_week' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(234,25): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(234,54): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(250,26): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(254,14): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(254,28): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(276,20): error TS2339: Property 'economy' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(279,20): error TS2339: Property 'economy' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(287,15): error TS2339: Property 'world_logic' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(293,7): error TS2304: Cannot find name 'getQuizCountLastWeek'.
js/Civication/core/civicationEconomyEngine.js(293,35): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(298,22): error TS2339: Property 'strikes' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(317,15): error TS2339: Property 'economy' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(331,14): error TS2551: Property 'CivicationPsyche' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationHome'?
js/Civication/core/civicationEconomyEngine.js(332,15): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(345,12): error TS2339: Property 'economy' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(409,25): error TS2339: Property 'global_rules' does not exist on type 'unknown[] | CiviRecord'.
  Property 'global_rules' does not exist on type 'unknown[]'.
js/Civication/core/civicationEconomyEngine.js(410,25): error TS2339: Property 'global_rules' does not exist on type 'unknown[] | CiviRecord'.
  Property 'global_rules' does not exist on type 'unknown[]'.
js/Civication/core/civicationEconomyEngine.js(411,25): error TS2339: Property 'global_rules' does not exist on type 'unknown[] | CiviRecord'.
  Property 'global_rules' does not exist on type 'unknown[]'.
js/Civication/core/civicationEconomyEngine.js(414,25): error TS2339: Property 'global_rules' does not exist on type 'unknown[] | CiviRecord'.
  Property 'global_rules' does not exist on type 'unknown[]'.
js/Civication/core/civicationEconomyEngine.js(485,43): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(491,54): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(492,24): error TS2339: Property 'economy' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(495,16): error TS2339: Property 'economy' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(41,8): error TS2362: The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/core/civicationEventEngine.js(41,15): error TS2363: The right-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type.
js/Civication/core/civicationEventEngine.js(86,39): error TS2339: Property 'HG_STATE' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(118,5): error TS2322: Type 'unknown' is not assignable to type 'CiviEventEngineState'.
  Index signature for type 'string' is missing in type '{}'.
js/Civication/core/civicationEventEngine.js(159,16): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(160,21): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(162,5): error TS2740: Type '{}' is missing the following properties from type 'CiviEventEngineInboxItem[]': length, pop, push, concat, and 28 more.
js/Civication/core/civicationEventEngine.js(167,16): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(168,14): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(171,16): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(172,14): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(199,25): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(200,25): error TS2339: Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/civicationEventEngine.js(220,16): error TS2339: Property 'role_key' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(221,28): error TS2339: Property 'role_key' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(224,30): error TS2339: Property 'title' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(227,16): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(228,28): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(237,18): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(238,14): error TS2551: Property 'CivicationPsyche' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationHome'?
js/Civication/core/civicationEventEngine.js(248,28): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(252,16): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEventEngine.js(252,30): error TS2339: Property 'career_id' does not exist on type 'unknown'.
```
