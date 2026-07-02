# Civication v0.1 Playthrough QA etter Phase Mail Integration

Dato: 2026-07-02  
Repo: `Paradispartiet/History-Go`  
Omfang: PR #1601–#1608 med særlig kontroll av at topp-mailviseren er fjernet og fase-mailen eies av `Dagens fase`.

## Konklusjon

**Godkjent for v0.1-reference-loop innenfor tilgjengelig container-QA.** Alle tre referanseroller kan startes via TestMode-kontrakten, dagmotoren kan starte en ny testdag, `NextAction` er fortsatt eneste aktive svarflate, og phase-mail vises i `Dagens fase` uten at den gamle topp-mailviseren kommer tilbake.

Det ble ikke funnet småfeil som krevde kodeendring. Denne runden gjør derfor bare én endring: denne QA-rapporten.

## Metode og avgrensninger

- Appen ble startet rent fra repo-roten med lokal statisk server, og `Civication.html` svarte `HTTP/1.0 200 OK`.
- Full interaktiv browser-playthrough kunne ikke kjøres i containeren fordi Playwright ikke er installert i `node_modules`, og ingen systembrowser ble brukt i denne QA-runden. QA-en kombinerer derfor lokal app-start, kildekontroll av de relevante UI-/systemfilene og Civication runtime-/surface-testene som dekker samme playthrough-kontrakt.
- Det ble ikke bygget ny motor, ingen nye rollepakker ble laget, FWG-arkitektur ble ikke endret, og TestMode ble ikke endret.

## Leste filer

Følgende rapporter, UI-filer, systemfiler og tester ble lest før vurdering:

- `reports/civication-phase-mail-integration.md`
- `reports/civication-test-mode-reference-launcher.md`
- `reports/civication-v01-manual-browser-qa.md`
- `js/Civication/ui/CivicationMiniSectionsUI.js`
- `js/Civication/ui/CivicationDayPhaseUI.js`
- `js/Civication/ui/CivicationNextActionUI.js`
- `js/Civication/ui/CivicationInboxTopActionUI.js`
- `js/Civication/ui/CivicationTestModeUI.js`
- `js/Civication/systems/civicationNextActionSelector.js`
- `js/Civication/systems/civicationDailyMailBuilder.js`
- `js/Civication/systems/civicationDayProgression.js`
- `tests/civication-next-action-consolidation.test.js`
- `tests/civication-inbox-top-action-open-status.test.js`
- `tests/civication-day-phase-single-owner.test.js`
- `tests/civication-test-mode-ui.test.js`
- `tests/civication-dashboard-travel-focus.test.js`

## Rolle-playthrough: Arealplanlegger

**Status:** OK.

- TestMode-kontrakten markerer `Arealplanlegger` som referanserolle og kan starte rollen via eksisterende `CivicationRoleStarter`.
- `Start dag` bruker `CivicationDailyMailBuilder.startToday({ forceNew: true, ignorePending: true })`, som dekker ren QA-start uten å endre launcheren.
- Topp-mailviser er borte: `civiTopActionCard` rendres ikke lenger som home-controls hovedseksjon.
- `Dagens fase` peker til samme aktive sak som `NextAction`, men rendrer ikke egne svarvalg.
- `Neste fokus` dupliserer ikke mailtittel; dashboard-fokus oppsummerer pending inbox som `Åpen sak i dagens fase`.
- NextAction kan åpne aktiv sak, vise valg og svare via single-owner-svarflaten.
- Innboks-kort er passive med mindre kortet er current NextAction.

## Rolle-playthrough: Renholder

**Status:** OK.

- TestMode-kontrakten markerer `Renholder` som referanserolle og kan starte rollen via eksisterende `CivicationRoleStarter`.
- Reference-role choice-contract sjekker Renholder-mailene uten generiske fallbackvalg.
- Phase-mail ligger i `Dagens fase`, mens `NextAction` eier svaret.
- Tester dekker at aktiv inbox-card kan vise valg uten at valg lekker til andre tråder.
- Full Civication-suite dekker Renholder role package, first week, second week og two-week flow.

## Rolle-playthrough: Barnehageassistent

**Status:** OK.

- TestMode-kontrakten markerer `Barnehageassistent` som referanserolle og kan starte rollen via eksisterende `CivicationRoleStarter`.
- FWG story simulation passerer for `barnehageassistent`, `by_radgiver_plan` og `renholder`.
- Samme rolleuavhengige `NextAction`-/Dagens fase-/Innboks-kontrakt sikrer ingen dobbelt svarflate for Barnehageassistent.
- `broken_mapping` forblir `0` i TestMode-testen.

## Akseptansesjekk

| Sjekk | Resultat |
| --- | --- |
| Alle tre referanseroller kan spilles minst én dag via TestMode-kontrakten | OK |
| Topp-mailviseren er borte | OK |
| Dagens fase viser fase-mail / aktiv fasesak | OK |
| Ingen duplisering mellom Dagens fase og Neste fokus | OK |
| Ingen dobbelt svarflate | OK |
| Ingen stale inbox-blocker for ny dag | OK |
| Ingen double answer/enqueue loop | OK |
| NextAction recovery fungerer etter refresh/reentry | OK i eksisterende NextAction-/selector-kontrakt |
| Active inbox-card-regelen holder | OK |
| Andre inbox-tråder er passive | OK |
| Start ny dag fungerer via testmodus-flagg og day progression-kontrakt | OK |
| TestMode reset rydder nok state | OK i TestMode-kontrakten |
| `broken_mapping` | 0 |
| `npm run test:civication -- --runInBand` | Pass |

## Kjørte kontroller

- `npm run test:civication -- --runInBand` — passerte. Scriptet videresender `--runInBand` til siste node-test, men hele Civication-kjeden kjørte ferdig.
- `node tests/civication-inbox-top-action-open-status.test.js && node tests/civication-day-phase-single-owner.test.js` — passerte.
- `python3 -m http.server 4173` + `curl -I http://127.0.0.1:4173/Civication.html` — appen svarte `HTTP/1.0 200 OK`.

## Funn og fikser

Ingen kodefunn. Ingen småfikser ble gjort for copy, status label, stale-state cleanup, selector priority, phase-mail preview fallback, handover-label, debug/status message eller test coverage.
