# Phase 56 audit — next Civication local typecheck candidates

## Kort status
- Dette er en **audit-only** fase (ingen kodeendringer i JS/runtime).
- Phase 52-kandidatene er nå brukt opp via:
  - Phase 53 (`dayPatches.js`, PR #671)
  - Phase 54 (`civicationMailRuntime.js`, PR #672)
  - Phase 55 (`civicationLifeMailRuntime.js`, PR #675)
- Formålet her er å velge **én konkret og trygg lokal kandidat** for Phase 57, basert på faktisk typecheck-output.

## Baseline brukt (preflight)
- `total diagnostics`: **1888**
- `files with diagnostics`: **191**
- `other`: **571**
- `js/ui/**`: **510**
- `js/Civication/**`: **504**
- `CivicationUI.js`: **106**
- `CivicationMiniSectionsUI.js`: **22**
- `civicationEventEngine.js`: **23**
- `civicationEconomyEngine.js`: **0**
- `js/profile.js`: **83**
- `js/state/**`: **16**
- `TS2339`: **1539**
- `TS2551`: **137**
- `TS2322`: **20**
- `TS2349`: **12**

Preflight-resultat: baseline matcher oppgitt nivå etter #675.

## Kommandoer kjørt
1. `git status --porcelain=v1 --untracked-files=no`
2. `git log -1 --oneline`
3. `test -f .github/workflows/typecheck-baseline.yml`
4. `test -f reports/typecheck-baseline-report.md`
5. `test -f reports/civication-next-local-typecheck-candidates-phase-52.md`
6. `npm run typecheck:report`
7. `npm run typecheck 2>&1 | grep "js/Civication/" > /tmp/civication-typecheck-phase-56.txt || true`
8. `wc -l /tmp/civication-typecheck-phase-56.txt`
9. `awk -F'[(:]' '{print $1}' /tmp/civication-typecheck-phase-56.txt | sort | uniq -c | sort -nr | head -20`

## Topp Civication-filer med diagnostics (fra phase-56 uttrekk)
- `js/Civication/ui/CivicationUI.js`: 106
- `js/Civication/core/civicationEventEngine.js`: 23
- `js/Civication/ui/CivicationMiniSectionsUI.js`: 22
- `js/Civication/ui/CivicationMap.js`: 18
- `js/Civication/ui/CivicationDashboardUI.js`: 18
- `js/Civication/systems/day/dayActiveRoleStateSync.js`: 15
- `js/Civication/systems/civicationDailyMailBuilder.js`: 15
- `js/Civication/systems/day/dayPatches.js`: 14
- `js/Civication/systems/civicationRuntimeSanityGuard.js`: 14
- `js/Civication/systems/civicationLifeMailRuntime.js`: 13
- `js/Civication/systems/civicationMailRuntime.js`: 10

## Lokale kandidater (potensielt trygge JSDoc/cast-fikser)

| Fil | Linje | Error | Diagnostic | Hvorfor lokal | Anbefalt fase |
| --- | ---: | --- | --- | --- | --- |
| `js/Civication/systems/day/dayActiveRoleStateSync.js` | 52 | TS2339 | `mail_system` on `unknown` | Feltlesing på state-lignende objekt; ser ut som ren narrowing/cast | Phase 57 |
| `js/Civication/systems/day/dayActiveRoleStateSync.js` | 56-57 | TS2339 | `mail_plan_progress` on `unknown` | Samme lokale objekt som allerede brukes som plan-progresjon | Phase 57 |
| `js/Civication/systems/day/dayActiveRoleStateSync.js` | 131 | TS2339 | `mail_system` on `unknown` | Lokal property access i eksisterende runtime-flow | Phase 57 |
| `js/Civication/systems/day/dayActiveRoleStateSync.js` | 222 | TS2339 | `role_key/title/role_id/career_id` on `unknown` | Objekt behandles som role-record; egnet for lokal typedef | Phase 57 |
| `js/Civication/systems/day/dayActiveRoleStateSync.js` | 228-230 | TS2339 | `active_role_key/unemployed_since_week/stability` on `unknown` | Konsistent state-shape i samme funksjon | Phase 57 |
| `js/Civication/systems/civicationRuntimeSanityGuard.js` | 91-92 | TS2339 | `mail_system/mail_plan_progress` on `unknown` | Sanity-checkkode som allerede forventer disse feltene | Senere (58+) |
| `js/Civication/systems/civicationRuntimeSanityGuard.js` | 134 | TS2339 | `active_role_key/unemployed_since_week` on `unknown` | Lokal defensiv validering, ren type-narrowing-kandidat | Senere (58+) |

## Diagnostics som bør vente (ikke-lokale / risiko)

| Fil | Linje | Error | Diagnostic | Hvorfor vente |
| --- | ---: | --- | --- | --- |
| `js/Civication/core/civicationEventEngine.js` | flere | TS2339/TS2551 | `Window & typeof globalThis` (`CivicationMailEngine`, `CivicationTaskEngine`, etc.) | Krever globals/declaration-strategi; eksplisitt ikke deklarere Mail/TaskEngine nå |
| `js/Civication/systems/civicationDailyMailBuilder.js` | flere | TS2339/TS2551 | globale engine-navn på `window` | Ikke lokal; berører navngivning/global wiring |
| `js/Civication/systems/civicationDailyMailBuilder.js` | 1260 | TS2322 | objektform mismatch | Payload/API-shape, ikke bare lokal cast |
| `js/Civication/core/civicationJobs.js` | 323 | TS2769 | concat overload/objectform | Strukturell datamodellfeil, høyere risiko |
| `js/Civication/core/civicationJobs.js` | 429/448 | TS2345 | manglende felter i payload | Reell objektformkontrakt; ikke audit-lokal |
| `js/Civication/ui/CivicationMap.js` | flere | TS2339/TS2362/TS2363/TS2551 | globals + DOM target typing + aritmetikk | UI/global-dominerte feil i hotspot; bør tas separat |
| `js/Civication/systems/civicationLifeMailRuntime.js` | 317/375/388 | TS2551 | `CivicationEventEngine`/global attach | Ikke lokal; knyttet til global declarations |
| `js/Civication/systems/civicationMailRuntime.js` | 590/707/735 | TS2551/TS2339 | EventEngine/global attach | Ikke lokal; bør ikke røres i denne auditfasen |
| `js/Civication/systems/day/dayPatches.js` | flere | TS2551/TS2339/TS2322 | blandet global + shape-feil | Phase 53-fil; eksplisitt utenfor Phase 56 |

## Høyrisiko/hotspots som bør vente
- `js/Civication/ui/CivicationUI.js` (106 diagnostics)
- `js/Civication/core/civicationEventEngine.js` (23 diagnostics)
- `js/Civication/ui/CivicationMiniSectionsUI.js` (22 diagnostics)
- `js/Civication/core/civicationJobs.js` (TS2345/TS2769 payload/object-shape)
- Filer dominert av `Window & typeof globalThis` / manglende global declarations

## Spesifikk vurdering av utpekte filer (uten endring)
- `CivicationDashboardUI.js`: blanding av `unknown`-felter og mange global/window-avhengigheter; ikke ideell første lokale kandidat.
- `CivicationMap.js`: tung global/UI/DOM-typing; høyere risiko enn ønsket for neste smale fase.
- `civicationLifeMailRuntime.js`: gjenstående feil er primært global/window og bør ikke tas nå.
- `civicationMailRuntime.js`: gjenstående feil er primært global/window og bør ikke tas nå.
- `dayPatches.js`: gjenstående feil finnes, men filen er eksplisitt ikke mål i denne fasen.

## Anbefaling for Phase 57 (én konkret fil)
**Anbefalt neste konkrete fil: `js/Civication/systems/day/dayActiveRoleStateSync.js`**.

Begrunnelse:
- Har flere tydelige `unknown`-property diagnostics som ser lokalt avgrensede ut.
- Kan sannsynligvis løses med lokal JSDoc typedef/cast og enkel narrowing.
- Mindre hotspot enn UI- og engine-kjernene.
- Gir videre reduksjon i `js/Civication/**` uten å kreve globals- eller runtime-semantikkendring.

## Scope-bekreftelse for Phase 56
- Ingen JS-kode er endret.
- Ingen runtime-endringer er gjort.
- Ingen schema/global declarations er endret.
- Ingen datafiler er endret.
- Ingen UI/CSS/HTML er endret.
- Ingen AHA/package/workflow/baselinefil er endret.
- Kun auditrapport for Phase 56 er lagt til.
