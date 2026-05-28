# Phase 60 audit — next Civication local typecheck candidates

## Kort status
- Dette er en **audit-only** fase etter Phase 59 / PR #687.
- Phase 59 behandlet `js/Civication/systems/civicationRuntimeSanityGuard.js`; den filen røres ikke videre i denne fasen.
- Målet er å finne **én konkret, trygg lokal TypeScript/JSDoc-kandidat** for Phase 61 basert på faktisk `js/Civication/**` typecheck-output etter sanity guard-fasen.
- Ingen runtime-semantikk, JS-kode, schemas/globals, data, UI, CSS, HTML, package- eller workflow-filer er endret.

## Baseline brukt (preflight etter #687)
- `total diagnostics`: **1865**
- `files with diagnostics`: **191**
- `other`: **571**
- `js/ui/**`: **510**
- `js/Civication/**`: **481**
- `CivicationUI.js`: **106**
- `CivicationMiniSectionsUI.js`: **22**
- `civicationEventEngine.js`: **23**
- `civicationEconomyEngine.js`: **0**
- `js/profile.js`: **83**
- `js/state/**`: **16**
- `TS2339`: **1516**
- `TS2551`: **137**
- `TS2304`: **70**
- `TS2322`: **20**
- `TS2349`: **12**
- Observed in the generated report as an additional relevant count: `TS2345`: **13**

Preflight-resultat: baseline matcher oppgitt nivå etter #687 for de kontrollerte nøkkeltallene.

## Kommandoer kjørt
1. `git status --porcelain=v1 --untracked-files=no`
2. `git log -1 --oneline`
3. `test -f .github/workflows/typecheck-baseline.yml`
4. `test -f reports/typecheck-baseline-report.md`
5. `test -f reports/civication-next-local-typecheck-candidates-phase-58.md`
6. `npm run typecheck:report`
7. `npm run typecheck 2>&1 | grep "js/Civication/" > /tmp/civication-typecheck-phase-60.txt || true`
8. `wc -l /tmp/civication-typecheck-phase-60.txt`
9. `python` one-off parsing of `/tmp/civication-typecheck-phase-60.txt` for file/error-code counts and candidate classes
10. `grep`/`sed` spot checks of candidate diagnostics

## Topp Civication-filer med diagnostics (fra phase-60 uttrekk)
- `js/Civication/ui/CivicationUI.js`: 106
- `js/Civication/core/civicationEventEngine.js`: 23
- `js/Civication/ui/CivicationMiniSectionsUI.js`: 22
- `js/Civication/ui/CivicationDashboardUI.js`: 18
- `js/Civication/ui/CivicationMap.js`: 18
- `js/Civication/systems/civicationDailyMailBuilder.js`: 15
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
- `js/Civication/core/civicationState.js`: 6

Civication-uttrekket inneholder **481** diagnostic-linjer. Error-code-fordelingen i uttrekket er: `TS2339` 419, `TS2551` 36, `TS2322` 10, `TS2362` 5, `TS2363` 4, `TS2345` 2, `TS2740` 2, `TS2769` 1, `TS2304` 1, `TS2698` 1.

## Lokale kandidater (potensielt trygge JSDoc/cast-fikser)

| Fil | Linje | Error | Diagnostic | Hvorfor den ser lokal ut | Anbefalt senere fase |
| --- | ---: | --- | --- | --- | --- |
| `js/Civication/systems/civicationLifeMailRuntime.js` | 102-105 | TS2339 | `identity_tags`, `life_tags`, `life_flags`, `tracks` on `unknown` | Konsentrert gruppe på samme lokale state/tag-kilde; eksisterende kode behandler feltene som arrays før videre bruk. Kan sannsynligvis løses med lokal JSDoc typedef/cast uten runtime-effekt, mens globals i samme fil blir stående. | **Phase 61** |
| `js/Civication/systems/civicationDebateEngine.js` | 289, 295-298 | TS2339 | `trust`, `integrity`, `visibility`, `economicRoom`, `autonomy` on `unknown` | Lokale consequence/score-felt på objekt som allerede brukes som impact-shape; mulig lokal typedef-kandidat. | Senere |
| `js/Civication/systems/civicationDebateEngine.js` | 420 | TS2339 | `focus` on `unknown` | Lokal property access på debatt-/choice-lignende objekt; kan trolig snevres lokalt. | Senere |
| `js/Civication/systems/civicationMailRuntime.js` | 717-718 | TS2339 | `mail_plan_progress` / `mail_system` on `unknown` | Lokale snapshot-felt på state-lignende objekt; kan trolig løses med lokal cast, men filen har flere globals og bør komme etter en smalere pass. | Senere |
| `js/Civication/systems/civicationMailEngine.js` | 281 | TS2339 | `ok` on `unknown` | Ett lokalt responsfelt fra svarobjekt; kan snevres uten runtime-effekt, men filen har `CivicationMailEngine` global attach som ikke skal deklareres nå. | Senere |
| `js/Civication/systems/day/dayConsequences.js` | 13, 18, 29-31 | TS2339 | `career_id`, `role_scope`, `preferred_types`, `preferred_families`, `flags` on `unknown` | Små lokale read-only accesses på role/consequence-shapes; kandidat for senere lokal cast hvis `CiviMailPlanBridge`/ChoiceDirector globals holdes utenfor. | Senere |
| `js/Civication/systems/day/dayConsequencesUI.js` | 12, 75-90 | TS2339 | `career_id`, `trust`, `flags`, `integrity`, `visibility`, `economicRoom`, `autonomy` on `unknown` | Lokale render/summary-felt, men filen har wrapper/`never`/`Window` assignment diagnostics som gjør den mindre ren nå. | Senere |
| `js/Civication/systems/day/dayPatches.js` | 687, 763 | TS2339 | `complete`, `career_id` on `unknown` | To local-looking accesses, men samme fil er blandet med `answer` shape, TaskEngine globals og `TS2322`; ikke egnet som neste smale fase. | Senere |
| `js/Civication/ui/CivicationDashboardUI.js` | 126, 137, 150, 191, 218, 220 | TS2339 | `id`, `career_id`, `home`, `event`, `title`, `career_name` on `unknown` | Lokale UI-renderdata-felt finnes, men filen er blandet med globale UI dependencies og bør ikke være første lokale Phase 61-mål. | Senere |

## Diagnostics som skal vente

| Fil | Linje | Error | Diagnostic | Hvorfor den ikke skal røres nå |
| --- | ---: | --- | --- | --- |
| `js/Civication/core/civicationEventEngine.js` | 160-201, 1533-1534 | TS2339 | `CivicationMailEngine` on `Window & typeof globalThis` | Eksplisitt global-declaration-risiko; ikke deklarer `CivicationMailEngine` nå. |
| `js/Civication/core/civicationEventEngine.js` | 1004, 1939 | TS2339 | `CivicationTaskEngine` on `Window & typeof globalThis` | Eksplisitt global-declaration-risiko; ikke deklarer `CivicationTaskEngine` nå. |
| `js/Civication/core/civicationEventEngine.js` | 2069 | TS2551 | `CivicationEventEngine` missing on `Window & typeof globalThis` | TS2551/global-navn; skal ikke løses via schemas/globals i auditfasen. |
| `js/Civication/core/civicationJobs.js` | 323 | TS2769 | No overload matches this call | Payload/object-shape-overload; krever egen kontraktvurdering, ikke lokal unknown-cast. |
| `js/Civication/core/civicationJobs.js` | 429, 448 | TS2345 | Offer object missing brand/place/employer fields | Reell payload/API-shape mismatch; ikke trygg lokal JSDoc-fase. |
| `js/Civication/systems/civicationLifeMailRuntime.js` | 32 | TS2339 | `CivicationMailEngine` global | Skal ikke løses ved global declaration nå; Phase 61 bør kun ta local unknown-tag-feltene hvis denne filen velges. |
| `js/Civication/systems/civicationLifeMailRuntime.js` | 317, 375, 388 | TS2551 | `CivicationEventEngine` / `CivicationLifeMailRuntime` globals | TS2551/global attach-sak; vent på global-strategi. |
| `js/Civication/systems/civicationMailRuntime.js` | 81, 590, 681, 707, 735 | TS2339/TS2551 | `CivicationMailEngine`, `CivicationEventEngine`, `CivicationBrandJobState`, `CivicationMailRuntime` globals | Ikke-lokal global/navnestrategi. |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 1260 | TS2322 | Optional slot object not assignable to required phase object | Reell object-shape/contract typing; ikke en lokal unknown-property read. |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 95, 1016-1120, 1292, 1371-1459 | TS2339/TS2551 | Mail/Task/Event/DailyMailBuilder globals | Dominert av global dependencies; ikke rør `CivicationMailEngine`/`CivicationTaskEngine`. |
| `js/Civication/systems/day/dayPatches.js` | 648, 688, 735, 774 | TS2339 | `getPendingEvent` / `onAppOpen` on `answer` | Handler om eksisterende declared `answer` shape; ikke bland inn i lokal unknown-pass. |
| `js/Civication/systems/day/dayPatches.js` | 716, 785, 920 | TS2339 | `CivicationTaskEngine` global | Eksplisitt global-declaration-risiko; ikke deklarer nå. |
| `js/Civication/systems/day/dayPatches.js` | 845 | TS2322 | `boolean` not assignable to `CiviFn` | Funksjons-/payloadkontrakt; ikke lokal unknown-property access. |
| `js/Civication/systems/day/dayConsequencesUI.js` | 128, 131, 137 | TS2339/TS2740 | wrapper property/apply on `never`, function assigned to `Window` | Wrapper/type-shape-problem; bør være egen fase. |
| `js/Civication/ui/CivicationMap.js` | 6-103 | TS2339/TS2551 | Map data globals and `CivicationMap` global attach | Dominert av map/global declarations and UI event-target typing. |
| `js/Civication/ui/CivicationMap.js` | 50, 95 | TS2362/TS2363 | arithmetic operands not known as numbers | UI/map model typing; ikke lokal state-cast. |
| `js/Civication/ui/CivicationDashboardUI.js` | 61-99, 195, 209, 241-252 | TS2339/TS2551 | `CivicationMiniSectionsUI`, `CivicationBrandJobUI`, `CivicationMailEngine`, `CivicationEventChannels`, global attach | Blandet UI/global dependency hotspot; vent. |
| `js/Civication/systems/civicationRuntimeSanityGuard.js` | 49, 194, 235 | TS2339/TS2551 | `CivicationActivePositionRecovery`, `CivicationEventEngine`, `CivicationRuntimeSanityGuard` globals | Phase 59-fil; skal ikke røres i Phase 60, og resterende feil er globals. |
| `js/Civication/ui/CivicationUI.js` | flere | TS2339/TS2322 | Stor miks av `unknown`, global access og UI state | 106 diagnostics og eksplisitt hotspot; skal vente. |
| `js/Civication/ui/CivicationMiniSectionsUI.js` | flere | TS2339/TS2551 | Mini-section UI/global mix | 22 diagnostics og eksplisitt hotspot; skal vente. |

## Høyrisiko/hotspots som bør vente
- `js/Civication/ui/CivicationUI.js` (106 diagnostics)
- `js/Civication/core/civicationEventEngine.js` (23 diagnostics)
- `js/Civication/ui/CivicationMiniSectionsUI.js` (22 diagnostics)
- `js/Civication/core/civicationJobs.js` (`TS2345`/`TS2769` payload/object-shape)
- `js/Civication/ui/CivicationMap.js` (map-globals + DOM `EventTarget` + arithmetic typing)
- `js/Civication/ui/CivicationDashboardUI.js` (local-looking unknown fields mixed with globals/UI dependencies)
- `js/Civication/systems/civicationDailyMailBuilder.js` (Mail/Task/Event globals + `TS2322` shape mismatch)
- `js/Civication/systems/day/dayPatches.js` (mixed `answer` shape, TaskEngine globals and `TS2322`)
- Filer dominert av `Window & typeof globalThis`, `typeof globalThis`, `TS2551`, `TS2304`, eller manglende global declarations

## Spesifikk vurdering av utpekte filer (uten endring)
- `js/Civication/systems/civicationLifeMailRuntime.js`: beste lokale kandidat nå. Den har en konsentrert local-looking gruppe på `identity_tags`, `life_tags`, `life_flags` og `tracks` på `unknown` etter Phase 59. En Phase 61 bør eksplisitt la `CivicationMailEngine`, `CivicationEventEngine` og global attach-diagnostics stå.
- `js/Civication/systems/civicationMailRuntime.js`: har to local-looking state snapshot fields (`mail_plan_progress`, `mail_system`), men er ellers dominert av `DEBUG`, Mail/Event/BrandJobState globals og global attach.
- `js/Civication/systems/civicationMailEngine.js`: ett local-looking `ok`-felt, men global attach på `CivicationMailEngine` skal ikke håndteres nå.
- `js/Civication/systems/civicationDebateEngine.js`: god senere lokal kandidat med flere consequence/score-felt på `unknown`, men lavere prioritert enn LifeMailRuntime fordi den også har global attach og mer domain-specific scoring shape.
- `js/Civication/systems/day/dayConsequences.js`: flere small local-looking fields, men blandet med `CiviMailPlanBridge` og `CivicationChoiceDirector` globals.
- `js/Civication/systems/day/dayConsequencesUI.js`: local-looking render fields finnes, men wrapper/`never`/`Window` diagnostics bør skilles ut før den velges.
- `js/Civication/systems/day/dayPatches.js`: bør vente på grunn av `answer` typedef, `CivicationTaskEngine` globals og `TS2322`.
- `js/Civication/ui/CivicationDashboardUI.js`: har lokale renderdata-felt, men blandes med globale UI dependencies og bør vente.
- `js/Civication/ui/CivicationMap.js`: dominert av map-globals, DOM event-target narrowing og arithmetic typing; ikke lokal Phase 61-kandidat.

## Anbefaling for Phase 61 (én konkret fil)
**Anbefalt neste konkrete fil: `js/Civication/systems/civicationLifeMailRuntime.js`.**

Begrunnelse:
- Den har en tett, lett avgrenset gruppe local-looking `TS2339` diagnostics på `unknown` rundt `identity_tags`, `life_tags`, `life_flags` og `tracks`.
- Disse feltene matcher migreringsmønsteret for lokal state/tag-shape JSDoc-cast uten runtime-effekt.
- En Phase 61 kan være smal: kun lokal typedef/cast/narrowing for tag arrays rundt linje 102-105, uten å deklarere `CivicationMailEngine` eller `CivicationEventEngine`, uten schema/global-endringer, og uten å røre `civicationRuntimeSanityGuard.js`.
- GitHub Actions workflow “Typecheck baseline report” bør være endelig kontrollgrunnlag hvis den kjører.

## Scope-bekreftelse for Phase 60
- Ingen JS-kode er endret.
- Ingen runtime-endringer er gjort.
- Ingen schema/global declarations er endret.
- Ingen datafiler er endret.
- Ingen UI/CSS/HTML er endret.
- Ingen AHA-spor, place/emne-spor, package-filer, workflow-filer, manifestfiler, tests eller `TYPESCRIPT_MIGRATION.md` er endret.
- `reports/typecheck-baseline-report.md` er ikke en tilsiktet del av diffen.
- Kun auditrapporten `reports/civication-next-local-typecheck-candidates-phase-60.md` skal være i endelig diff.
