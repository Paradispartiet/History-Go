# Phase 49 — Civication next local typecheck candidate audit

## Kort status
Dette er en **audit-only** fase for å finne neste trygge, lokale TypeScript/JSDoc-kandidat i `js/Civication/**` før en eventuell Phase 50.

- Ingen JS-kode er endret.
- Ingen runtime-endringer er gjort.
- Ingen schemas/globals er endret.
- Ingen data/AHA/UI/CSS/HTML er endret.
- Ingen baselinefil er endret med vilje i denne fasen.

## Baseline brukt (etter PR #655)
Verifisert mot `reports/typecheck-baseline-report.md` etter ny kjøring av `npm run typecheck:report`:

- total diagnostics: **1921**
- files with diagnostics: **191**
- `js/Civication/**`: **537**
- `js/Civication/ui/CivicationUI.js`: **106**
- `js/Civication/ui/CivicationMiniSectionsUI.js`: **22**
- `js/Civication/core/civicationEventEngine.js`: **23**
- `js/Civication/core/civicationEconomyEngine.js`: **0**
- `js/ui/**`: **510**
- `js/ui/place-card.js`: **142**
- `js/profile.js`: **83**
- `js/state/**`: **16**
- TS2339: **1572**
- TS2551: **137**
- TS2304: **70**
- TS2322: **20**
- TS2349: **12**

## Kommandoer kjørt
```bash
git status --porcelain=v1 --untracked-files=no
git log -1 --oneline
test -f .github/workflows/typecheck-baseline.yml
test -f reports/typecheck-baseline-report.md
npm run typecheck:report
npm run typecheck 2>&1 | grep "js/Civication/" > /tmp/civication-typecheck.txt || true
```

## Topp Civication-filer med diagnostics (fra /tmp-capture)
1. `js/Civication/ui/CivicationUI.js` — 106
2. `js/Civication/core/civicationEventEngine.js` — 23
3. `js/Civication/systems/civicationLifeMailRuntime.js` — 22
4. `js/Civication/systems/day/dayPatches.js` — 22
5. `js/Civication/ui/CivicationMiniSectionsUI.js` — 22
6. `js/Civication/ui/CivicationDashboardUI.js` — 18
7. `js/Civication/ui/CivicationMap.js` — 18
8. `js/Civication/systems/civicationMailRuntime.js` — 16

## Gruppe 1 — Lokale kandidater (senere, trygg JSDoc-cast uten runtime-endring)

| Fil | Linje | Error | Diagnostic | Hvorfor lokal | Anbefalt fase |
|---|---:|---|---|---|---|
| `js/Civication/ui/CivicationStoreUI.js` | 27 | TS2339 | Property `packs` does not exist on type `unknown`. | `store`/payload brukes lokalt i UI-flyt; kandidat for smal JSDoc-typing av lokal struktur. | Phase 50 |
| `js/Civication/ui/CivicationStoreUI.js` | 41 | TS2339 | Property `map` does not exist on type `unknown`. | Klassisk array-operasjon på verdi som allerede behandles som liste i samme fil. | Phase 50 |
| `js/Civication/ui/CivicationStoreUI.js` | 42 | TS2339 | Property `filter` does not exist on type `unknown`. | Samme lokale listeflyt som `map`; sannsynligvis løsbart med lokal cast/typedef. | Phase 50 |
| `js/Civication/ui/CivicationStoreUI.js` | 74 | TS2339 | Property `ok` does not exist on type `unknown`. | Respons-håndtering lokalt i modul; egnet for liten response-typedef. | Phase 50 |
| `js/Civication/systems/day/dayChoiceDirector.js` | 47 | TS2339 | Property `activeFaction` does not exist on type `unknown`. | Enkel enkelttilgang i avgrenset modul; mulig lokal guard/typedef uten global-endringer. | Phase 50/51 |

## Gruppe 2 — Ikke lokale / vent

| Fil | Linje | Error | Diagnostic | Hvorfor ikke nå |
|---|---:|---|---|---|
| `js/Civication/core/civicationEventEngine.js` | 160 | TS2339 | Property `CivicationMailEngine` does not exist on type `Window & typeof globalThis`. | Global/window declaration-problem; eksplisitt risikoområde fra tidligere faser. |
| `js/Civication/core/civicationEventEngine.js` | 1004 | TS2339 | Property `CivicationTaskEngine` does not exist on type `Window & typeof globalThis`. | Skal ikke deklareres i denne fasen (TS2551-regresjonsrisiko). |
| `js/Civication/merits-and-jobs.js` | 193 | TS2304 | Cannot find name `catIdFromDisplay`. | Manglende global/import, ikke lokal unknown-cast. |
| `js/Civication/core/civicationJobs.js` | 323 | TS2769 | No overload matches this call. | Payload/form-kontrakt for array/object; krever semantiske avklaringer, ikke bare lokal cast. |
| `js/Civication/core/civicationJobs.js` | 429 | TS2345 | Argument missing required employer/brand fields. | Faktisk objektform/API-shape mismatch; ikke egnet som «smal lokal» migrering. |
| `js/Civication/mailPlanBridge.js` | 137 | TS2551 | `CivicationEventEngine` does not exist on `Window & typeof globalThis` (Did you mean...). | TS2551/globalnavn; må tas i globals-spor, ikke i lokal auditfase. |

## Gruppe 3 — Høyrisiko/hotspots som bør vente

- `js/Civication/ui/CivicationUI.js` (106): stor hotspot med mange `unknown` + potensielle skjulte data-/kontraktsavhengigheter.
- `js/Civication/core/civicationEventEngine.js` (23): domineres av `Window/globalThis`-feil.
- `js/Civication/ui/CivicationMiniSectionsUI.js` (22): UI-hotspot med tett kobling til state/data-shapes.
- `js/Civication/core/civicationJobs.js` (TS2345/TS2769): payload-/shape-feil som ikke er ren lokal cast-jobb.

## Anbefaling for Phase 50
**Konkret neste fil:** `js/Civication/ui/CivicationStoreUI.js`.

Begrunnelse: lav volum, lokale `unknown` property-access (`packs/length/map/filter/ok`) og tydelig kandidat for lokal JSDoc-typing uten runtime-endring eller globals-arbeid.

## Eksplisitt endringsomfang i Phase 49
Denne fasen har kun produsert auditrapporten. Ingen endringer er gjort i:

- `js/**`
- `schemas/**` (inkl. `schemas/civication-globals.d.ts`)
- `AHA/**`
- `data/**`
- UI/CSS/HTML-filer
- workflows/package/manifest/tests
- `reports/typecheck-baseline-report.md`
