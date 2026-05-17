# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-05-17T19:41:31.558Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 2092
- Files with diagnostics: 198
- Groups with diagnostics: 11
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| js/Civication/** | 85 | 770 | js/Civication/CivicationBoot.js<br>js/Civication/capitalEngine.js<br>js/Civication/capitalMaintenanceEngine.js |
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
| TS2339 | 1679 |
| TS2551 | 202 |
| TS2304 | 71 |
| TS2307 | 36 |
| TS2322 | 21 |
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
1. Start with **js/Civication/** (770 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/ui/place-card.js` (123), `js/Civication/ui/CivicationUI.js` (102), `js/Civication/core/civicationEventEngine.js` (91), `js/ui/popup-utils.js` (80), `js/profile.js` (79).
3. Defer broader/sensitive areas until hotspot reduction is complete: `other`, `js/ui/**`, `js/profile.js`.
4. Keep this report read-only and rerun after each migration phase to validate trend direction.

## Raw output excerpt (first 80 lines)
```
> history-go@0.0.0 typecheck
> tsc -p tsconfig.json
js/Civication/CivicationBoot.js(172,7): error TS2322: Type 'CivicationEventEngine' is not assignable to type 'CiviMethodBag'.
  Index signature for type 'string' is missing in type 'CivicationEventEngine'.
js/Civication/capitalEngine.js(126,48): error TS2339: Property 'economic' does not exist on type 'unknown'.
js/Civication/capitalEngine.js(127,48): error TS2339: Property 'cultural' does not exist on type 'unknown'.
js/Civication/capitalEngine.js(128,48): error TS2339: Property 'symbolic' does not exist on type 'unknown'.
js/Civication/capitalEngine.js(150,19): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/capitalEngine.js(150,37): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/capitalEngine.js(157,27): error TS2339: Property 'ownedItems' does not exist on type 'object'.
js/Civication/capitalEngine.js(158,18): error TS2339: Property 'ownedItems' does not exist on type 'object'.
js/Civication/capitalEngine.js(169,22): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/capitalEngine.js(169,42): error TS2339: Property 'career' does not exist on type 'unknown'.
js/Civication/capitalMaintenanceEngine.js(41,44): error TS2339: Property 'maintenanceDays' does not exist on type 'object'.
js/Civication/capitalMaintenanceEngine.js(41,65): error TS2339: Property 'maintenanceDays' does not exist on type 'object'.
js/Civication/capitalMaintenanceEngine.js(42,40): error TS2339: Property 'decayPerDay' does not exist on type 'object'.
js/Civication/capitalMaintenanceEngine.js(42,57): error TS2339: Property 'decayPerDay' does not exist on type 'object'.
js/Civication/capitalMaintenanceEngine.js(205,5): error TS2322: Type 'unknown' is not assignable to type 'number'.
js/Civication/civicationCommercial.js(33,25): error TS2339: Property 'balance' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(99,36): error TS2339: Property 'packs' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(99,53): error TS2339: Property 'packs' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(125,36): error TS2339: Property 'stores' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(125,54): error TS2339: Property 'stores' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(175,47): error TS2339: Property 'map' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(176,52): error TS2339: Property 'map' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(200,52): error TS2339: Property 'map' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(246,35): error TS2339: Property 'balance' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(279,12): error TS2339: Property 'balance' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(289,26): error TS2339: Property 'balance' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(52,27): error TS2339: Property 'career' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(52,42): error TS2339: Property 'career' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(103,28): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(106,23): error TS2339: Property 'career' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(112,26): error TS2339: Property 'career' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(120,44): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(177,21): error TS2339: Property 'career' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(288,21): error TS2339: Property 'career' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(388,27): error TS2339: Property 'warning_used' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(394,19): error TS2339: Property 'warning_used' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(397,19): error TS2339: Property 'career' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(485,24): error TS2339: Property 'achieved_at' does not exist on type 'unknown'.
js/Civication/civicationObligationEngine.js(486,27): error TS2339: Property 'achieved_at' does not exist on type 'unknown'.
js/Civication/core/CivicationPsyche.js(334,40): error TS2339: Property 'autonomy' does not exist on type 'unknown'.
js/Civication/core/CivicationPsyche.js(337,38): error TS2339: Property 'trust' does not exist on type 'unknown'.
js/Civication/core/CivicationPsyche.js(409,18): error TS2339: Property 'economy_profile' does not exist on type 'unknown'.
js/Civication/core/CivicationPsyche.js(418,21): error TS2339: Property 'economy_profile' does not exist on type 'unknown'.
js/Civication/core/CivicationPsyche.js(565,32): error TS2339: Property 'economy_profile' does not exist on type 'unknown'.
js/Civication/core/CivicationPsyche.js(583,30): error TS2339: Property 'economy_profile' does not exist on type 'unknown'.
js/Civication/core/CivicationPsyche.js(584,37): error TS2339: Property 'economy_profile' does not exist on type 'unknown'.
js/Civication/core/CivicationPsyche.js(598,29): error TS2339: Property 'economy_profile' does not exist on type 'unknown'.
js/Civication/core/CivicationPsyche.js(605,31): error TS2339: Property 'economy_profile' does not exist on type 'unknown'.
js/Civication/core/CivicationPsyche.js(640,10): error TS2551: Property 'CivicationPsyche' does not exist on type 'Window & typeof globalThis'. Did you mean 'CivicationHome'?
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
```
