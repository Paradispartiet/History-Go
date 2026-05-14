# Typecheck baseline report

## Metadata
- Generated at (UTC): 2026-05-14T20:37:36.377Z
- Command: `npm run typecheck`
- Typecheck exit code: 2
- Total diagnostic lines found: 2192
- Files with diagnostics: 199
- Groups with diagnostics: 11
- Unparsed/unknown diagnostic lines: 0

## Summary by area
| Area | Files | Diagnostic lines | Example files |
| --- | ---: | ---: | --- |
| js/Civication/** | 86 | 848 | js/Civication/CivicationBoot.js<br>js/Civication/capitalEngine.js<br>js/Civication/capitalMaintenanceEngine.js |
| other | 70 | 559 | js/DomainRegistry.js<br>js/aha.js<br>js/app.js |
| js/ui/** | 20 | 481 | js/ui/badge-modal.js<br>js/ui/badge-unlock-toast.js<br>js/ui/badges.js |
| js/profile.js | 1 | 90 | js/profile.js |
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
| js/ui/place-card.js | 119 | js/ui/** |
| js/Civication/core/civicationEventEngine.js | 93 | js/Civication/** |
| js/Civication/ui/CivicationUI.js | 91 | js/Civication/** |
| js/profile.js | 90 | js/profile.js |
| js/ui/popup-utils.js | 82 | js/ui/** |
| js/boot.js | 76 | js/boot.js |
| js/Civication/core/civicationEconomyEngine.js | 47 | js/Civication/** |
| js/routes.js | 47 | other |
| js/ui/left-panel.js | 47 | js/ui/** |
| js/hgKnowledgeEngine.js | 43 | js/hgKnowledgeEngine.js |
| js/Civication/systems/day/dayPatches.js | 40 | js/Civication/** |
| js/ui/lists.js | 37 | js/ui/** |
| js/console/devConsole.js | 36 | other |
| js/ui/nature-card.js | 36 | js/ui/** |
| js/quizzes.js | 33 | other |
| js/nextUpRuntime.js | 29 | other |
| js/nature_place_map_bridge.js | 27 | other |
| js/Civication/ui/CivicationDashboardUI.js | 25 | js/Civication/** |
| js/Civication/merits-and-jobs.js | 24 | js/Civication/** |
| js/Civication/systems/civicationDailyMailBuilder.js | 23 | js/Civication/** |

## Diagnostic types (TypeScript error code)
| Error code | Count |
| --- | ---: |
| TS2339 | 1878 |
| TS2304 | 98 |
| TS2551 | 98 |
| TS2307 | 36 |
| TS2322 | 13 |
| TS2580 | 13 |
| TS2349 | 12 |
| TS2550 | 11 |
| TS2362 | 6 |
| TS2451 | 6 |
| TS2345 | 5 |
| TS2552 | 5 |
| TS2363 | 4 |
| TS2740 | 2 |
| TS2739 | 2 |
| TS2554 | 2 |
| TS2769 | 1 |

## Priority recommendations (mechanical)
1. Start with **js/Civication/** (848 diagnostics)** because it currently has the highest baseline volume.
2. Focus first on concentrated hotspots: `js/ui/place-card.js` (119), `js/Civication/core/civicationEventEngine.js` (93), `js/Civication/ui/CivicationUI.js` (91), `js/profile.js` (90), `js/ui/popup-utils.js` (82).
3. Defer broader/sensitive areas until hotspot reduction is complete: `other`, `js/ui/**`, `js/profile.js`.
4. Keep this report read-only and rerun after each migration phase to validate trend direction.

## Raw output excerpt (first 80 lines)
```
> history-go@0.0.0 typecheck
> tsc -p tsconfig.json
js/Civication/CivicationBoot.js(7,28): error TS2339: Property 'CIVI_CAREER_RULES' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(16,12): error TS2339: Property 'CIVI_CAREER_RULES' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(23,12): error TS2339: Property 'CIVI_CAREER_RULES' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(52,14): error TS2339: Property 'CivicationRoleModelRuntime' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(53,12): error TS2339: Property 'CivicationRoleModelRuntime' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(59,12): error TS2339: Property 'CivicationRoleModelRuntime' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(70,14): error TS2339: Property 'CivicationBlockedJobMessages' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(73,21): error TS2339: Property 'CivicationBlockedJobMessages' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(81,14): error TS2339: Property 'CivicationCareerRoleResolver' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(84,21): error TS2339: Property 'CivicationCareerRoleResolver' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(100,10): error TS2339: Property 'BADGES' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(101,10): error TS2339: Property 'HG_CAREERS' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(141,14): error TS2339: Property 'HG_CiviEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(158,18): error TS2339: Property 'CivicationEconomyEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(159,9): error TS2304: Cannot find name 'CivicationEconomyEngine'.
js/Civication/CivicationBoot.js(162,18): error TS2339: Property 'CivicationObligationEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(163,9): error TS2304: Cannot find name 'CivicationObligationEngine'.
js/Civication/CivicationBoot.js(166,14): error TS2339: Property 'CivicationUI' does not exist on type 'Window & typeof globalThis'.
js/Civication/CivicationBoot.js(168,20): error TS2339: Property 'HG_CiviEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(124,34): error TS2339: Property 'CivicationHome' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(149,26): error TS2339: Property 'getPrimaryLifestyle' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(149,60): error TS2339: Property 'HG_Lifestyle' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(154,24): error TS2339: Property 'HG_CiviShop' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(165,27): error TS2339: Property 'CivicationState' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(166,26): error TS2339: Property 'CivicationState' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(185,28): error TS2339: Property 'CIVI_ITEMS' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(186,32): error TS2339: Property 'CIVI_SYNERGIES' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(187,25): error TS2339: Property 'HG_CAREERS' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(187,46): error TS2339: Property 'CAREERS' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(188,28): error TS2339: Property 'CIVI_LIFESTYLES' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(188,54): error TS2339: Property 'LIFESTYLES' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalEngine.js(214,10): error TS2339: Property 'CAPITAL_ENGINE' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalMaintenanceEngine.js(33,22): error TS2339: Property 'CIVI_CAPITAL_MAINT_PROFILE' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalMaintenanceEngine.js(204,14): error TS2339: Property 'HG_IdentityCore' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalMaintenanceEngine.js(205,20): error TS2339: Property 'HG_IdentityCore' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalMaintenanceEngine.js(273,23): error TS2339: Property 'CIVI_QUIZ_CAPITAL_MAP' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalMaintenanceEngine.js(273,62): error TS2339: Property 'CIVI_QUIZ_CAPITAL_MAP' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalMaintenanceEngine.js(274,14): error TS2339: Property 'CIVI_QUIZ_CAPITAL_MAP' does not exist on type 'Window & typeof globalThis'.
js/Civication/capitalMaintenanceEngine.js(300,10): error TS2339: Property 'HG_CapitalMaintenance' does not exist on type 'Window & typeof globalThis'.
js/Civication/civiLifestyle.js(166,10): error TS2339: Property 'HG_Lifestyle' does not exist on type 'Window & typeof globalThis'.
js/Civication/civiLifestyle.js(174,10): error TS2339: Property 'getPrimaryLifestyle' does not exist on type 'Window & typeof globalThis'.
js/Civication/civiLifestyle.js(175,19): error TS2339: Property 'HG_Lifestyle' does not exist on type 'Window & typeof globalThis'.
js/Civication/civicationCommercial.js(31,23): error TS2339: Property 'getPCWallet' does not exist on type 'Window & typeof globalThis'.
js/Civication/civicationCommercial.js(32,24): error TS2339: Property 'getPCWallet' does not exist on type 'Window & typeof globalThis'.
js/Civication/civicationCommercial.js(53,23): error TS2339: Property 'savePCWallet' does not exist on type 'Window & typeof globalThis'.
js/Civication/civicationCommercial.js(54,14): error TS2339: Property 'savePCWallet' does not exist on type 'Window & typeof globalThis'.
js/Civication/civicationCommercial.js(99,36): error TS2339: Property 'packs' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(99,53): error TS2339: Property 'packs' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(125,36): error TS2339: Property 'stores' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(125,54): error TS2339: Property 'stores' does not exist on type 'unknown'.
js/Civication/civicationCommercial.js(161,27): error TS2339: Property 'CivicationPlaceAccessBridge' does not exist on type 'Window & typeof globalThis'.
js/Civication/civicationCommercial.js(166,27): error TS2339: Property 'CivicationPlaceAccessBridge' does not exist on type 'Window & typeof globalThis'.
js/Civication/civicationCommercial.js(297,10): error TS2339: Property 'HG_CiviShop' does not exist on type 'Window & typeof globalThis'.
js/Civication/civicationObligationEngine.js(47,12): error TS2304: Cannot find name 'CivicationState'.
js/Civication/civicationObligationEngine.js(56,12): error TS2304: Cannot find name 'CivicationState'.
js/Civication/civicationObligationEngine.js(168,7): error TS2304: Cannot find name 'CivicationState'.
js/Civication/civicationObligationEngine.js(271,7): error TS2304: Cannot find name 'CivicationState'.
js/Civication/civicationObligationEngine.js(277,5): error TS2304: Cannot find name 'CivicationState'.
js/Civication/civicationObligationEngine.js(279,5): error TS2304: Cannot find name 'CivicationState'.
js/Civication/civicationObligationEngine.js(390,5): error TS2304: Cannot find name 'CivicationState'.
js/Civication/civicationObligationEngine.js(449,5): error TS2304: Cannot find name 'CivicationState'.
js/Civication/civicationObligationEngine.js(474,5): error TS2304: Cannot find name 'CivicationState'.
js/Civication/civicationObligationEngine.js(494,5): error TS2304: Cannot find name 'CivicationState'.
js/Civication/civicationObligationEngine.js(522,28): error TS2551: Property 'HGLearningLog' does not exist on type 'Window & typeof globalThis'. Did you mean 'getLearningLog'?
js/Civication/civicationObligationEngine.js(543,10): error TS2339: Property 'CivicationObligationEngine' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(329,29): error TS2339: Property 'HG_IdentityCore' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(405,28): error TS2339: Property 'getPrimaryLifestyle' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(405,62): error TS2339: Property 'HG_Lifestyle' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(436,27): error TS2339: Property 'CivicationState' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(440,30): error TS2339: Property 'CivicationJobs' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(540,25): error TS2339: Property 'CivicationState' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(545,30): error TS2339: Property 'CivicationJobs' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(549,10): error TS2339: Property 'HG_CivicationPublic' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(564,28): error TS2339: Property 'getPrimaryLifestyle' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(564,62): error TS2339: Property 'HG_Lifestyle' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(589,28): error TS2339: Property 'HG_Lifestyle' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(602,28): error TS2339: Property 'getPrimaryLifestyle' does not exist on type 'Window & typeof globalThis'.
js/Civication/core/CivicationPsyche.js(602,62): error TS2339: Property 'HG_Lifestyle' does not exist on type 'Window & typeof globalThis'.
```
