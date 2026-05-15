# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-05-15T10:35:07.516Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 2117
- Files with diagnostics: 198
- Groups with diagnostics: 11
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| js/Civication/** | 85 | 792 | js/Civication/CivicationBoot.js<br>js/Civication/capitalEngine.js<br>js/Civication/capitalMaintenanceEngine.js |
| other | 70 | 552 | js/DomainRegistry.js<br>js/aha.js<br>js/app.js |
| js/ui/** | 20 | 475 | js/ui/badge-modal.js<br>js/ui/badge-unlock-toast.js<br>js/ui/badges.js |
| js/profile.js | 1 | 84 | js/profile.js |
| js/boot.js | 1 | 76 | js/boot.js |
| scripts/** | 14 | 62 | scripts/generate-civication-mails.js<br>scripts/i18n-audit-places.js<br>scripts/i18n-place-manifest-loader.js |
| js/hgKnowledgeEngine.js | 1 | 43 | js/hgKnowledgeEngine.js |
| sw.js | 1 | 12 | sw.js |
| js/dataHub.js | 1 | 11 | js/dataHub.js |
| js/state/** | 3 | 9 | js/state/openmode.js<br>js/state/persistence.js<br>js/state/state.js |
| root files | 1 | 1 | knowledge.js |

## Top 20 files by diagnostic count
| File | Diagnostic lines | Area |
| --- | ---: | --- |
| js/ui/place-card.js | 115 | js/ui/** |
| js/Civication/ui/CivicationUI.js | 107 | js/Civication/** |
| js/Civication/core/civicationEventEngine.js | 97 | js/Civication/** |
| js/profile.js | 84 | js/profile.js |
| js/ui/popup-utils.js | 82 | js/ui/** |
| js/boot.js | 76 | js/boot.js |
| js/routes.js | 47 | other |
| js/ui/left-panel.js | 47 | js/ui/** |
| js/Civication/core/civicationEconomyEngine.js | 43 | js/Civication/** |
| js/hgKnowledgeEngine.js | 43 | js/hgKnowledgeEngine.js |
| js/ui/lists.js | 37 | js/ui/** |
| js/console/devConsole.js | 36 | other |
| js/ui/nature-card.js | 36 | js/ui/** |
| js/quizzes.js | 31 | other |
| js/Civication/systems/day/dayPatches.js | 30 | js/Civication/** |
| js/nextUpRuntime.js | 29 | other |
| js/nature_place_map_bridge.js | 27 | other |
| js/Civication/systems/civicationLifeMailRuntime.js | 23 | js/Civication/** |
| js/Civication/systems/civicationCareerOutcomeRuntime.js | 22 | js/Civication/** |
| js/Civication/ui/CivicationMiniSectionsUI.js | 22 | js/Civication/** |

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
| TS2339 | 1684 |
| TS2551 | 217 |
| TS2304 | 86 |
| TS2307 | 36 |
| TS2322 | 19 |
| TS2580 | 13 |
| TS2349 | 12 |
| TS2550 | 11 |
| TS2362 | 6 |
| TS2451 | 6 |
| TS2345 | 5 |
| TS2552 | 5 |
| TS2363 | 4 |
| TS2740 | 3 |
| TS2739 | 3 |
| TS2769 | 3 |
| TS2698 | 2 |
| TS2554 | 2 |

## Priority recommendations (mechanical)
1. Start with **js/Civication/** (792 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/ui/place-card.js` (115), `js/Civication/ui/CivicationUI.js` (107), `js/Civication/core/civicationEventEngine.js` (97), `js/profile.js` (84), `js/ui/popup-utils.js` (82).
3. Defer broader/sensitive areas until hotspot reduction is complete: `other`, `js/ui/**`, `js/profile.js`.
4. Keep this report read-only and rerun after each migration phase to validate trend direction.

## Raw output excerpt (first 80 lines)
```
> history-go@0.0.0 typecheck
> tsc -p tsconfig.json
js/Civication/CivicationBoot.js(141,7): error TS2322: Type 'CivicationEventEngine' is not assignable to type 'CiviMethodBag'.
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
js/Civication/civicationObligationEngine.js(522,28): error TS2551: Property 'HGLearningLog' does not exist on type 'Window & typeof globalThis'. Did you mean 'getLearningLog'?
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
js/Civication/core/civicationEconomyEngine.js(7,25): error TS2551: Property 'HGLearningLog' does not exist on type 'Window & typeof globalThis'. Did you mean 'getLearningLog'?
js/Civication/core/civicationEconomyEngine.js(84,32): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(89,26): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(89,46): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(92,5): error TS2304: Cannot find name 'deriveTierFromPoints'.
js/Civication/core/civicationEconomyEngine.js(97,28): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(106,22): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(106,50): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(114,42): error TS2339: Property 'tiers' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(114,57): error TS2339: Property 'tiers' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(124,35): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(125,37): error TS2339: Property 'name' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(125,51): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(133,24): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(183,19): error TS2339: Property 'global_rules' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(185,19): error TS2339: Property 'global_rules' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(192,16): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(194,26): error TS2339: Property 'unemployed_since_week' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(226,25): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(226,54): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(242,26): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(246,14): error TS2339: Property 'id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(246,28): error TS2339: Property 'career_id' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(256,5): error TS2304: Cannot find name 'deriveTierFromPoints'.
js/Civication/core/civicationEconomyEngine.js(268,20): error TS2339: Property 'economy' does not exist on type 'unknown'.
js/Civication/core/civicationEconomyEngine.js(271,20): error TS2339: Property 'economy' does not exist on type 'unknown'.
```
