# Phase 52 audit — next Civication local typecheck candidates

## Kort status
- Phase 52 er gjennomført som **audit-only** uten kodeendringer i JS/runtime.
- Baseline-preflight matcher forventet post-#668 baseline.
- Phase 49-kandidatene (`CivicationStoreUI.js` og `dayChoiceDirector.js`) er nå brukt opp av Phase 50/51, så denne auditen identifiserer neste trygge lokale kandidat.

## Baseline brukt (verifisert i preflight)
Kilde: `reports/typecheck-baseline-report.md` etter `npm run typecheck:report`.

- total diagnostics: **1911**
- files with diagnostics: **191**
- other: **571**
- js/Civication/**: **527**
- CivicationUI.js: **106**
- CivicationMiniSectionsUI.js: **22**
- civicationEventEngine.js: **23**
- civicationEconomyEngine.js: **0**
- js/ui/**: **510**
- js/ui/place-card.js: **142**
- js/profile.js: **83**
- js/state/**: **16**
- TS2339: **1562**
- TS2551: **137**
- TS2304: **70**
- TS2322: **20**
- TS2349: **12**

## Kommandoer kjørt
1. `git status --porcelain=v1 --untracked-files=no`
2. `git log -1 --oneline`
3. `test -f .github/workflows/typecheck-baseline.yml`
4. `test -f reports/typecheck-baseline-report.md`
5. `test -f reports/civication-next-local-typecheck-candidates-phase-49.md`
6. `npm run typecheck:report`
7. `npm run typecheck 2>&1 | grep "js/Civication/" > /tmp/civication-typecheck-phase-52.txt || true`

## Topp Civication-filer med diagnostics (fra phase-52-uttrekk)
- `js/Civication/ui/CivicationUI.js`: 106
- `js/Civication/core/civicationEventEngine.js`: 23
- `js/Civication/systems/civicationLifeMailRuntime.js`: 22
- `js/Civication/systems/day/dayPatches.js`: 22
- `js/Civication/ui/CivicationMiniSectionsUI.js`: 22
- `js/Civication/ui/CivicationDashboardUI.js`: 18
- `js/Civication/ui/CivicationMap.js`: 18
- `js/Civication/systems/civicationMailRuntime.js`: 16

## 1) Lokale kandidater (for senere, mekanisk/lokal JSDoc-cast-stil)

| Fil | Linje | Error | Diagnostic | Hvorfor ser den lokal ut | Anbefalt fase |
| --- | ---: | --- | --- | --- | --- |
| `js/Civication/systems/day/dayPatches.js` | 61 | TS2339 | `Property 'reason' does not exist on type 'unknown'.` | Property access på `unknown` i lokal flyt; kan typisk løses med lokal shape-cast | Phase 53 (primær) |
| `js/Civication/systems/day/dayPatches.js` | 62 | TS2339 | `Property 'previous_role' does not exist on type 'unknown'.` | Samme mønster som over, lokal data-lesing | Phase 53 (primær) |
| `js/Civication/systems/day/dayPatches.js` | 186 | TS2339 | `Property 'complete' does not exist on type 'unknown'.` | Lokal status-lesing, ingen indikasjon på nødvendig runtime-endring | Phase 53 (primær) |
| `js/Civication/systems/day/dayPatches.js` | 214 | TS2339 | `Property 'career_id' does not exist on type 'unknown'.` | Lokal feltlesing på ukjent payload | Phase 53 (primær) |
| `js/Civication/systems/day/dayPatches.js` | 375 | TS2339 | `Property 'active' does not exist on type 'unknown'.` | Ren lokal narrowing-kandidat | Phase 53 (primær) |
| `js/Civication/systems/day/dayPatches.js` | 386 | TS2339 | `Property 'active' does not exist on type 'unknown'.` | Som over | Phase 53 (primær) |
| `js/Civication/systems/day/dayPatches.js` | 393 | TS2339 | `Property 'complete' does not exist on type 'unknown'.` | Som over | Phase 53 (primær) |
| `js/Civication/systems/day/dayPatches.js` | 676 | TS2339 | `Property 'complete' does not exist on type 'unknown'.` | Lokal ukjent->felt aksess | Phase 53 (primær) |
| `js/Civication/systems/day/dayPatches.js` | 752 | TS2339 | `Property 'career_id' does not exist on type 'unknown'.` | Konsistent med lokal feltaksessmønster | Phase 53 (primær) |
| `js/Civication/systems/civicationMailRuntime.js` | 487 | TS2339 | `Property 'consumed' does not exist on type 'unknown'.` | Lokal payload/state-feltlesing | Phase 54+ |
| `js/Civication/systems/civicationMailRuntime.js` | 491 | TS2339 | `Property 'mail_system' does not exist on type 'unknown'.` | Lokal shape-cast-kandidat | Phase 54+ |
| `js/Civication/systems/civicationLifeMailRuntime.js` | 82 | TS2339 | `Property 'consumed' does not exist on type 'unknown'.` | Lokal state-feltlesing, men i fil med global-koblinger | Phase 54+ |
| `js/Civication/systems/civicationLifeMailRuntime.js` | 93 | TS2339 | `Property 'mail_branch_state' does not exist on type 'unknown'.` | Lokal struktur-aksess | Phase 54+ |

## 2) Diagnostics som skal vente (ikke-lokale / krever globals/runtime/data-shape)

| Fil | Linje | Error | Diagnostic | Hvorfor ikke nå |
| --- | ---: | --- | --- | --- |
| `js/Civication/core/civicationEventEngine.js` | 160 | TS2339 | `Property 'CivicationMailEngine' does not exist on type 'Window & typeof globalThis'.` | Global declaration/navnrom; eksplisitt forbudt å deklarere mail/task engine i denne fasen |
| `js/Civication/core/civicationEventEngine.js` | 1004 | TS2339 | `Property 'CivicationTaskEngine' does not exist on type 'Window & typeof globalThis'.` | Som over; kan gi TS2551-regresjon ifølge føringer |
| `js/Civication/core/civicationJobs.js` | 323 | TS2769 | `No overload matches this call.` | Payload/objektform-kontrakt, ikke ren lokal cast-opprydding |
| `js/Civication/core/civicationJobs.js` | 429 | TS2345 | Mangler flere felt i argumentobjekt | Krever semantikk/dataform-beslutning, ikke auditens lokale mål |
| `js/Civication/ui/CivicationMap.js` | 6 | TS2339 | `Property 'CIVI_MAP_DISTRICTS' does not exist on type 'Window & typeof globalThis'.` | Global/window-dominert fil |
| `js/Civication/ui/CivicationDashboardUI.js` | 61 | TS2339 | `Property 'CivicationMiniSectionsUI' does not exist on type 'Window & typeof globalThis'.` | Global kobling mellom UI-moduler, ikke lokal unknown-cast |
| `js/Civication/systems/day/dayPatches.js` | 364 | TS2551 | `Property 'CivicationEventEngine' does not exist ... Did you mean 'CivicationEconomyEngine'?` | TS2551/global-navn; bør ikke røres i lokal-cast fase |
| `js/Civication/systems/day/dayPatches.js` | 705 | TS2339 | `Property 'CivicationTaskEngine' does not exist on type 'Window & typeof globalThis'.` | Global declaration/engine-kobling |
| `js/Civication/merits-and-jobs.js` | 193 | TS2304 | `Cannot find name 'catIdFromDisplay'.` | Manglende symbol/import, ikke lokal unknown-feltaksess |

## 3) Høyrisiko/hotspots som bør vente
- `js/Civication/ui/CivicationUI.js` (106): stor hotspot + eksplisitt unntatt i denne fasen.
- `js/Civication/core/civicationEventEngine.js` (23): tung `Window/globalThis` + forbudte engine-declarations.
- `js/Civication/ui/CivicationMiniSectionsUI.js` (22): hotspot-UI.
- `js/Civication/core/civicationJobs.js` (TS2345/TS2769): payloadform/kontrakter.
- Filer dominert av globals/window declarations (`CivicationMap.js`, deler av dashboard/mail-runtime-filer).

## Vurderte filer (uten endringer)
- `js/Civication/systems/civicationLifeMailRuntime.js`
- `js/Civication/systems/day/dayPatches.js`
- `js/Civication/ui/CivicationDashboardUI.js`
- `js/Civication/ui/CivicationMap.js`
- `js/Civication/systems/civicationMailRuntime.js`

## Anbefaling for Phase 53 (én konkret fil)
**Anbefalt neste fil: `js/Civication/systems/day/dayPatches.js`.**

Begrunnelse:
- Høy andel lokale `unknown`-property diagnostics som ser mekaniske ut.
- Kan angripes med smale, lokale JSDoc-casts/narrowing uten å endre runtime-semantikk.
- Unngår å måtte røre `schemas/civication-globals.d.ts` eller deklarere `CivicationMailEngine`/`CivicationTaskEngine`.
- Passer naturlig som neste trinn etter day-relatert arbeid i Phase 51.

## Endringsomfang i denne fasen
- Denne fasen er **audit-only**.
- Ingen endringer er gjort i JS-kode, runtime, schemas/globals, data, AHA, UI, CSS, HTML, package/workflow eller baseline-rapport.
- Eneste nye fil i diff skal være denne rapporten.
