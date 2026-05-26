# Phase 46-prep — Civication declaration regression dry-run audit

## Kort status
- Dette er en audit-only dry-run.
- Forrige Phase 46 declaration-forsøk ble stoppet og revertet pga. beskyttet regresjon.
- I denne fasen ble declarations testet én og én lokalt, målt, og deretter revertet.
- Ingen schema/declaration-endringer er beholdt.

## Baseline brukt
- total diagnostics: 1962
- files with diagnostics: 195
- js/Civication/**: 578
- CivicationUI.js: 107
- CivicationMiniSectionsUI.js: 22
- civicationEventEngine.js: 26
- TS2339: 1613
- TS2551: 137
- TS2322: 20
- TS2349: 12

## Forrige forsøk (Phase 46) status
Forrige forsøk som la inn declarations for `CivicationCalendar`, `CivicationMailEngine` og `CivicationTaskEngine` i `schemas/civication-globals.d.ts` ble korrekt stoppet og revertet fordi beskyttede metrics økte.

## Kommandoer kjørt
- `git status --porcelain=v1 --untracked-files=no`
- `git log -1 --oneline`
- `test -f .github/workflows/typecheck-baseline.yml`
- `test -f schemas/civication-globals.d.ts`
- `test -f reports/civication-global-declarations-audit-phase-45.md`
- `npm run typecheck:report`
- `npm run typecheck 2>&1 | grep -E "CivicationCalendar|CivicationMailEngine|CivicationTaskEngine|CivicationUI.js|civicationEventEngine.js" || true`
- `git restore schemas/civication-globals.d.ts reports/typecheck-baseline-report.md`
- `git status --porcelain=v1 --untracked-files=no`

## Dry-run resultater per global

| Global | Declaration-form testet | Total diag (før→etter) | js/Civication/** (før→etter) | CivicationUI.js (før→etter) | TS2339 (før→etter) | TS2551 (før→etter) | TS2322 (før→etter) | Vurdering |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CivicationCalendar | `CiviMethodBag` (smal) | 1962 → 1971 | 578 → 587 | 107 → 109 | 1613 → 1618 | 137 → 137 | 20 → 23 | Ikke trygg |
| CivicationMailEngine | `CiviMethodBag` (smal) | 1962 → 1938 | 578 → 554 | 107 → 106 | 1613 → 1555 | 137 → 171 | 20 → 20 | Ikke trygg |
| CivicationTaskEngine | `CiviMethodBag` (smal) | 1962 → 1981 | 578 → 597 | 107 → 118 | 1613 → 1597 | 137 → 171 | 20 → 21 | Ikke trygg |
| CivicationCalendar | `any` (bred) | 1962 → 1930 | 578 → 546 | 107 → 106 | 1613 → 1581 | 137 → 137 | 20 → 20 | Trygg |
| CivicationMailEngine | `any` (bred) | 1962 → 1931 | 578 → 547 | 107 → 105 | 1613 → 1548 | 137 → 171 | 20 → 20 | Ikke trygg |
| CivicationTaskEngine | `any` (bred) | 1962 → 1948 | 578 → 564 | 107 → 104 | 1613 → 1565 | 137 → 171 | 20 → 20 | Ikke trygg |

## Nøyaktige regressjonsmønstre observert

### CivicationCalendar med smal form (`CiviMethodBag`)
- Ny regressjon i total diagnostics, `js/Civication/**`, `CivicationUI.js` og `TS2322`.
- Relevante nye feil i Civication-eventflyt viste bl.a. property-access på `unknown` i `civicationEventEngine.js` (f.eks. `startsAtLabel`, `deadlineAtLabel`), som indikerer at declarationen gjør kallkjeder strengere uten å dekke faktisk API-form.

### CivicationMailEngine med smal og bred form (`CiviMethodBag` / `any`)
- Begge former trigget markant økning i `TS2551` (137 → 171).
- Gjentatte nye "Did you mean 'CivicationMailEngine'?"-forslag flyttet tidligere `TS2339` over til `TS2551` i flere filer (bl.a. `CivicationMailRuntime`/`CivicationTaskEngine` referanser i `civicationEventEngine.js`, `civicationTaskEngine.js`, `mailPlanBridge.js`).
- Konklusjon: selve eksistensen av globalen `CivicationMailEngine` kolliderer med navnelikhet og suggestion-heurstikk i eksisterende kode.

### CivicationTaskEngine med smal og bred form (`CiviMethodBag` / `any`)
- Begge former trigget markant økning i `TS2551` (137 → 171).
- Flere nye "Did you mean 'CivicationTaskEngine'?" for `CivicationMailEngine`-oppslag i `civicationEventEngine.js`, dvs. declarationen introduserer bred navnekollisjon/suggestion-regresjon.
- Smal form ga i tillegg klar volumregresjon (total +19, `js/Civication/**` +19, `CivicationUI.js` +11).

## Tolkning (årsaksnivå)
- `CivicationMailEngine` og `CivicationTaskEngine`: regresjonen skyldes primært **selve eksistensen av global declaration** (ikke bare smalhet), siden også `any`-form bevarer TS2551-regresjonen.
- `CivicationCalendar`: smal form er ikke trygg (nye strenghets/shape-feil), men bred `any`-form ser trygg ut i denne dry-runen.
- Det er dermed sannsynlig både navnekollisjon/suggestion-effekt og API-shape-stramning avhengig av declaration-form.

## Anbefaling for neste declaration-fase
1. **Ikke deklarer `CivicationMailEngine` eller `CivicationTaskEngine` globalt ennå**.
2. `CivicationCalendar` kan eventuelt vurderes i en isolert egenfase med eksplisitt guardrails, og start med `any` dersom målet kun er å fjerne `TS2339` uten sideeffekt.
3. Hvis `MailEngine`/`TaskEngine` skal inn senere, typ API lokalt først (forbrukssteder) og unngå globalnavn som trigger TS2551-suggestion-regresjon.

## Scope-bekreftelse
- Ingen JS-kode, runtime, data, AHA, UI, CSS, HTML eller schema-endringer er beholdt.
- Denne fasen blander ikke inn åpne PR-er #645 og #646.
