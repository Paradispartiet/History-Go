# Phase 58 audit — next Civication local typecheck candidates

## Kort status
- Dette er en **audit-only** fase etter Phase 57 / PR #682.
- Phase 57 behandlet `js/Civication/systems/day/dayActiveRoleStateSync.js`; den filen røres ikke videre i denne fasen.
- Målet er å finne **én konkret, trygg lokal TypeScript/JSDoc-kandidat** for Phase 59 basert på faktisk `js/Civication/**` typecheck-output.
- Ingen runtime-semantikk, JS-kode, schemas/globals, data, UI, CSS, HTML, package- eller workflow-filer er endret.

## Baseline brukt (preflight etter #682)
- `total diagnostics`: **1876**
- `files with diagnostics`: **191**
- `other`: **571**
- `js/ui/**`: **510**
- `js/Civication/**`: **492**
- `CivicationUI.js`: **106**
- `CivicationMiniSectionsUI.js`: **22**
- `civicationEventEngine.js`: **23**
- `civicationEconomyEngine.js`: **0**
- `js/profile.js`: **83**
- `js/state/**`: **16**
- `TS2339`: **1527**
- `TS2551`: **137**
- `TS2304`: **70**
- `TS2322`: **20**
- `TS2349`: **12**
- Observed in the generated report as an additional relevant count: `TS2345`: **13**

Preflight-resultat: baseline matcher oppgitt nivå etter #682 for de kontrollerte nøkkeltallene.

## Kommandoer kjørt
1. `git status --porcelain=v1 --untracked-files=no`
2. `git log -1 --oneline`
3. `test -f .github/workflows/typecheck-baseline.yml`
4. `test -f reports/typecheck-baseline-report.md`
5. `test -f reports/civication-next-local-typecheck-candidates-phase-56.md`
6. `npm run typecheck:report`
7. `npm run typecheck 2>&1 | grep "js/Civication/" > /tmp/civication-typecheck-phase-58.txt || true`
8. `wc -l /tmp/civication-typecheck-phase-58.txt`
9. `python3` one-off parsing of `/tmp/civication-typecheck-phase-58.txt` for file/error-code counts
10. `grep`/`sed` spot checks of candidate diagnostics and local source context

## Topp Civication-filer med diagnostics (fra phase-58 uttrekk)
- `js/Civication/ui/CivicationUI.js`: 106
- `js/Civication/core/civicationEventEngine.js`: 23
- `js/Civication/ui/CivicationMiniSectionsUI.js`: 22
- `js/Civication/ui/CivicationDashboardUI.js`: 18
- `js/Civication/ui/CivicationMap.js`: 18
- `js/Civication/systems/civicationDailyMailBuilder.js`: 15
- `js/Civication/systems/civicationRuntimeSanityGuard.js`: 14
- `js/Civication/systems/day/dayPatches.js`: 14
- `js/Civication/systems/civicationLifeMailRuntime.js`: 13
- `js/Civication/ui/CivicationInboxTopActionUI.js`: 13
- `js/Civication/systems/day/dayConsequencesUI.js`: 11
- `js/Civication/systems/civicationMailRuntime.js`: 10
- `js/Civication/systems/day/dayRuntimeDebugPanel.js`: 10
- `js/Civication/ui/CivicationSectionsUI.js`: 9
- `js/Civication/systems/civicationCareerOutcomeRuntime.js`: 8
- `js/Civication/systems/civicationDailyTaskGates.js`: 8
- `js/Civication/systems/day/dayConsequences.js`: 8
- `js/Civication/ui/CivicationMapModel.js`: 8
- `js/Civication/ui/CivicationSystemMap.js`: 8
- `js/Civication/systems/civicationDebateEngine.js`: 7

Civication-uttrekket inneholder **492** diagnostic-linjer. Error-code-fordelingen i uttrekket er: `TS2339` 430, `TS2551` 36, `TS2322` 10, `TS2362` 5, `TS2363` 4, `TS2345` 2, `TS2740` 2, `TS2769` 1, `TS2304` 1, `TS2698` 1.

## Lokale kandidater (potensielt trygge JSDoc/cast-fikser)

| Fil | Linje | Error | Diagnostic | Hvorfor den ser lokal ut | Anbefalt senere fase |
| --- | ---: | --- | --- | --- | --- |
| `js/Civication/systems/civicationRuntimeSanityGuard.js` | 91-92 | TS2339 | `mail_system` / `mail_plan_progress` on `unknown` | Lokal sanity-check leser allerede state-feltene defensivt med object-check; egnet for lokal state-record typedef/cast uten runtime-effekt. | **Phase 59** |
| `js/Civication/systems/civicationRuntimeSanityGuard.js` | 134 | TS2339 | `active_role_key` / `unemployed_since_week` on `unknown` | Samme lokale state-objekt brukes som rolle-state; kan sannsynligvis snevres med lokal JSDoc-shape. | **Phase 59** |
| `js/Civication/systems/civicationRuntimeSanityGuard.js` | 147 | TS2339 | `mail_director_v2` on `unknown` | Lokal director-state validering etter object-check; kandidat for lokal record-cast. | **Phase 59** |
| `js/Civication/systems/civicationLifeMailRuntime.js` | 102-105 | TS2339 | `identity_tags`, `life_tags`, `life_flags`, `tracks` on `unknown` | Felt brukes kun til `Array.isArray`-guard før spredning; ren lokal state-shape/narrowing-kandidat, men filen har fortsatt global/EventEngine-diagnostics. | Senere |
| `js/Civication/systems/civicationMailRuntime.js` | 717-718 | TS2339 | `mail_plan_progress` / `mail_system` on `unknown` | Lokale snapshot-felt på state-lignende objekt; kan trolig løses med lokal cast, men filen har flere globals og bør ikke være første Phase 59-mål. | Senere |
| `js/Civication/systems/civicationMailEngine.js` | 281 | TS2339 | `ok` on `unknown` | Lokalt svarobjekt fra `window.HG_CiviEngine?.answer`; ett responsfelt kan snevres lokalt, men filen har `CivicationMailEngine` global attach som ikke skal deklareres nå. | Senere |
| `js/Civication/systems/civicationDebateEngine.js` | 289, 295-298 | TS2339 | `trust`, `integrity`, `visibility`, `economicRoom`, `autonomy` on `unknown` | Lokale score/impact-felt på objekt som allerede behandles som konsekvens-shape; mulig JSDoc typedef-kandidat. | Senere |
| `js/Civication/systems/civicationDebateEngine.js` | 420 | TS2339 | `focus` on `unknown` | Lokal property access på valg-/debattlignende objekt; kan trolig snevres lokalt. | Senere |
| `js/Civication/ui/CivicationDashboardUI.js` | 126, 137, 150, 191, 218, 220 | TS2339 | `id`, `career_id`, `home`, `event`, `title`, `career_name` on `unknown` | Flere lokale UI-renderdata-felt, men samme fil er blandet med globale UI dependencies og bør ikke være første lokale fase. | Senere |
| `js/Civication/systems/day/dayConsequences.js` | 13, 18, 29-31 | TS2339 | `career_id`, `role_scope`, `preferred_types`, `preferred_families`, `flags` on `unknown` | Små lokale day-consequence object-shapes; mulig senere lokal typedef-fase hvis day-sporet åpnes igjen. | Senere |
| `js/Civication/systems/day/dayConsequencesUI.js` | 12, 75-90 | TS2339 | `career_id`, `trust`, `flags`, `integrity`, `visibility`, `economicRoom`, `autonomy` on `unknown` | Lokale UI/consequence records; men filen har også wrapper/`never`/`Window` mismatch som bør separeres. | Senere |
| `js/Civication/systems/day/dayPatches.js` | 687, 763 | TS2339 | `complete`, `career_id` on `unknown` | Lokale fields finnes, men filen er blandet med `answer` shape, `CivicationTaskEngine` globals og TS2322; bør vente. | Senere |

## Diagnostics som skal vente (ikke lokale / risiko)

| Fil | Linje | Error | Diagnostic | Hvorfor den ikke skal røres nå |
| --- | ---: | --- | --- | --- |
| `js/Civication/core/civicationEventEngine.js` | 87, 160-2069 | TS2339/TS2551 | `Window & typeof globalThis` globals (`HG_STATE`, `CivicationMailEngine`, `CivicationTaskEngine`, `CiviStoryResolver`, etc.) | Krever global declaration/navnestrategi; `CivicationMailEngine` og `CivicationTaskEngine` skal eksplisitt ikke deklareres nå. |
| `js/Civication/core/civicationEventEngine.js` | 42 | TS2362/TS2363 | arithmetic operands not known as numbers | Kjerne-engine hotspot; krever kontekstuell typing, ikke egnet smal audit-kandidat. |
| `js/Civication/core/civicationJobs.js` | 323 | TS2769 | `No overload matches this call` | Payload/object-form mismatch; høyere risiko enn lokal JSDoc-cast. |
| `js/Civication/core/civicationJobs.js` | 429/448 | TS2345 | Missing `brand_id`, `brand_name`, `sector`, `place_id`, `employer_context`, etc. | Reell API/payload-kontrakt; kan kreve data/runtime-semantikk. |
| `js/Civication/systems/day/dayActiveRoleStateSync.js` | 109/293/370 | TS2339/TS2551 | `CivicationMailRuntime`, `CivicationEventEngine`, `CivicationActiveRoleStateSync` globals | Phase 57-filen er eksplisitt utenfor scope i Phase 58; gjenværende feil er global-declaration-form, ikke lokal unknown-narrowing. |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 95, 479, 1016, 1027, 1078-1120, 1292, 1371, 1378, 1459 | TS2339/TS2551 | `CivicationMailEngine`, `CivicationMailRuntime`, `CivicationTaskEngine`, `CivicationEventEngine`, global attach | Dominert av globals/window og eksplisitt Mail/TaskEngine-risiko; ikke lokal kandidat. |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 1260 | TS2322 | Optional `date`/`phase`/`advances_role_plan` object not assignable to required shape | Objektform/API-shape, ikke bare lokal cast. |
| `js/Civication/systems/day/dayPatches.js` | 648/688/735/774 | TS2339 | `getPendingEvent` / `onAppOpen` on `answer` | Feilen handler om eksisterende declared `answer` shape og bør ikke blandes inn nå. |
| `js/Civication/systems/day/dayPatches.js` | 716/785/920 | TS2339 | `CivicationTaskEngine` global | Eksplisitt global-declaration-risiko; ikke deklarer nå. |
| `js/Civication/systems/day/dayPatches.js` | 845 | TS2322 | `boolean` not assignable to `CiviFn` | Shape/typing-kontrakt, ikke lokal unknown-property access. |
| `js/Civication/ui/CivicationMap.js` | 6-103 | TS2339/TS2551 | `CIVI_MAP_DISTRICTS`, `CIVI_OSLO_LANDSCAPE`, `CIVI_OSLO_CORRIDORS`, `CIVI_MAP_LANDMARKS`, `CivicationMap` globals | UI/map-global declarations; ikke lokal JSDoc-target. |
| `js/Civication/ui/CivicationMap.js` | 13 | TS2339 | `getAttribute` / `setAttribute` on `EventTarget` | DOM event-target narrowing in UI file; bør være egen UI-typing fase, ikke Civication local state audit. |
| `js/Civication/ui/CivicationMap.js` | 50/95 | TS2362/TS2363 | arithmetic operands not known as numbers | UI/map model typing; bør vente. |
| `js/Civication/ui/CivicationDashboardUI.js` | 61-99, 195, 209, 241-252 | TS2339/TS2551 | `CivicationMiniSectionsUI`, `CivicationBrandJobUI`, `CivicationMailEngine`, `CivicationEventChannels`, global attach | Blandet global/UI dependency hotspot; ikke første lokale phase. |
| `js/Civication/systems/civicationRuntimeSanityGuard.js` | 49/194/235 | TS2339/TS2551 | `CivicationActivePositionRecovery`, `CivicationEventEngine`, `CivicationRuntimeSanityGuard` globals | Skal holdes utenfor Phase 59-forslagets lokale del; ikke endre schemas/globals. |
| `js/Civication/systems/civicationLifeMailRuntime.js` | 32/317/375/388 | TS2339/TS2551 | `CivicationMailEngine`, `CivicationEventEngine`, `CivicationLifeMailRuntime` globals | Resten av filen er global-declaration-dominert; ikke deklarer MailEngine/EventEngine nå. |
| `js/Civication/systems/civicationMailRuntime.js` | 81, 590, 681, 707, 735 | TS2339/TS2551 | `CivicationMailEngine`, `CivicationEventEngine`, `CivicationBrandJobState`, `CivicationMailRuntime` globals | Ikke-lokal global/navnestrategi. |
| `js/Civication/ui/CivicationUI.js` | flere | TS2339/TS2322 | Stor miks av `unknown`, global access og UI state | 106 diagnostics og UI hotspot; skal vente. |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | flere | TS2339/TS2551 | Mini-section UI/global mix | 22 diagnostics; hotspot listet eksplisitt for vent. |

## Høyrisiko/hotspots som bør vente
- `js/Civication/ui/CivicationUI.js` (106 diagnostics)
- `js/Civication/core/civicationEventEngine.js` (23 diagnostics)
- `js/Civication/ui/CivicationMiniSectionsUI.js` (22 diagnostics)
- `js/Civication/core/civicationJobs.js` (`TS2345`/`TS2769` payload/object-shape)
- `js/Civication/ui/CivicationMap.js` (globals + DOM + arithmetic typing)
- `js/Civication/ui/CivicationDashboardUI.js` (lokale unknown-felt finnes, men blandes med globals/UI dependencies)
- `js/Civication/systems/civicationDailyMailBuilder.js` (Mail/Task/Event globals + shape mismatch)
- `js/Civication/systems/day/dayPatches.js` (Phase 53-fil med mixed answer-shape, TaskEngine globals og TS2322)
- Filer dominert av `Window & typeof globalThis`, `typeof globalThis`, `TS2551`, `TS2304`, eller manglende global declarations

## Spesifikk vurdering av utpekte filer (uten endring)
- `js/Civication/systems/civicationRuntimeSanityGuard.js`: beste lokale kandidat nå. Den har 11 tydelige `unknown` state/director-felt rundt `mail_system`, `mail_plan_progress`, `active_role_key`, `unemployed_since_week` og `mail_director_v2`; de kan sannsynligvis tas med lokal typedef/cast mens global-linjene blir stående.
- `js/Civication/ui/CivicationDashboardUI.js`: har flere lokale renderdata-felt på `unknown`, men også mange globals (`CivicationMiniSectionsUI`, `CivicationBrandJobUI`, `CivicationMailEngine`, `CivicationEventChannels`) og bør vente.
- `js/Civication/ui/CivicationMap.js`: dominert av map-globals, DOM `EventTarget` narrowing og arithmetic typing; ikke lokal kandidat.
- `js/Civication/systems/civicationDailyMailBuilder.js`: dominert av Mail/Task/Event globals og en object-shape TS2322; ikke lokal kandidat.
- `js/Civication/systems/day/dayPatches.js`: har et par local-looking `unknown` properties, men er blandet med `answer` typedef, `CivicationTaskEngine` globals og TS2322; bør vente.
- `js/Civication/systems/civicationLifeMailRuntime.js`: local-looking array-tag fields finnes, men gjenværende global/EventEngine diagnostics gjør den mindre ren enn sanity guard.
- `js/Civication/systems/civicationMailRuntime.js`: bare to local-looking state snapshot fields; resten er globals, så ikke førstevalg.

## Anbefaling for Phase 59 (én konkret fil)
**Anbefalt neste konkrete fil: `js/Civication/systems/civicationRuntimeSanityGuard.js`.**

Begrunnelse:
- Den har en konsentrert gruppe local-looking `TS2339` diagnostics på `unknown` state/director objects (`mail_system`, `mail_plan_progress`, `active_role_key`, `unemployed_since_week`, `mail_director_v2`).
- Feilene ligger i defensiv sanity-check/repair-kode som allerede behandler verdiene som objekter før feltlesing.
- En senere Phase 59 kan sannsynligvis redusere mange diagnostics med lokal JSDoc typedef/cast uten runtime-effekt.
- Phase 59 bør eksplisitt la global-diagnostics i samme fil stå (`CivicationActivePositionRecovery`, `CivicationEventEngine`, `CivicationRuntimeSanityGuard`) og ikke endre `schemas/civication-globals.d.ts`.

## Scope-bekreftelse for Phase 58
- Ingen JS-kode er endret.
- Ingen runtime-endringer er gjort.
- Ingen schema/global declarations er endret.
- Ingen datafiler er endret.
- Ingen UI/CSS/HTML er endret.
- Ingen AHA-spor, place/emne-spor, package-filer, workflow-filer, manifestfiler, tests eller `TYPESCRIPT_MIGRATION.md` er endret.
- `reports/typecheck-baseline-report.md` er ikke en tilsiktet del av diffen.
- Kun auditrapporten `reports/civication-next-local-typecheck-candidates-phase-58.md` skal være i endelig diff.
