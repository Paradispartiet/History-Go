# Civication NextAction surface audit

Oppdatert: 2026-06-30

## 1. UI-komponenter som rendrer mailer

- `CivicationNextActionUI` rendrer den ene aktive saken valgt av `CivicationNextActionSelector`.
- `CivicationDayPhaseUI` rendrer fasekort/status og peker på neste sak, men ikke mailvalg.
- `CivicationInboxTopActionUI` rendrer jobbmail/personlige meldinger/systemmeldinger som arkiv- og detaljkort.
- `CivicationMiniSectionsUI`/legacy `renderCivicationInbox` kan vise innboksinnhold, men skal rute svar til NextAction.
- `renderWorkdayPanel` i `CivicationUI.js` rendrer arbeidsdag, fasechips og åpne saker; full bundleliste er debug-only.

## 2. UI-komponenter som rendrer svarvalg

- Primært og spillbart: bare `CivicationNextActionUI`, med `data-civi-next-action-answer`.
- Debug-only: `buildPhaseBundleItemsHtml` kan fortsatt vise `data-civi-bundle-choice` når Civication debug/test mode er eksplisitt på.
- Arkiv/statusflater (`Dagens fase`, `Innboks`, `WorkdayPanel` normal runtime) rendrer ikke primære svarvalg.

## 3. Hvilke svarvalg er klikkbare?

- Klikkbare dagprogresjonsvalg er `data-civi-next-action-answer` i `CivicationNextActionUI`.
- Innboksens åpne mailer får lenke/knapp til NextAction (`data-civi-open-next-action`) i stedet for egne svar.
- Dagens fase og WorkdayPanel bruker `data-civi-day-phase-next-action` for å åpne NextAction.

## 4. Hvilken komponent eier progresjon?

- `CivicationNextActionSelector` velger én aktiv handling fra `CivicationDayProgression.inspect()` før innboks-fallback.
- `CivicationNextActionUI` eier svarhandlingen og kaller `CivicationMailEngine.answerMail(...)`.
- `CivicationMailEngine` markerer mail resolved og fyrer `civi:inboxChanged`, `civi:dayPhaseChanged` og `updateProfile`.
- `CivicationDailyMailBuilder`/`CivicationDayProgression` eier dagfaseopplåsing og neste fase.

## 5. Risiko for dupliserte svar

Tidligere risiko lå i at samme aktive mail kunne få knapper i NextAction, Dagens fase/phase bundle, Innboks og WorkdayPanel. Låsingen er:

- Normal WorkdayPanel skjuler bundlevalg; bare debug viser dem.
- Dagens fase viser status og NextAction-knapp.
- Innboks viser arkiv/detaljer og NextAction-handover, ikke `data-civi-inbox-answer`.
- Tester låser at `data-civi-next-action-answer` bare finnes i NextAction for den aktive mailen.

## 6. Risiko for at samme mail vises både som aktiv og arkiv

Samme mail kan fremdeles vises i innboks som arkiv/detalj mens den er aktiv i NextAction. Det er tillatt, men arkivkortet må ikke fremstå som svarflate. `CivicationInboxTopActionUI` leser NextAction-/faseeide id-er og viser «Håndteres i Neste handling» for åpne saker.

## Referanseroller for v0.1

- `by/by_radgiver_plan` (Arealplanlegger): planfaglige mailfamilier med naboer, utbyggere, saksbehandling, frister, utvalg og juridisk/politisk lesbarhet.
- `naeringsliv/renholder` (Renholder): renhold/HMS/hygiene-mailfamilier med rom, soner, driftsleder, brukere, verneombud, kollegaer, tempo og verdighet.

Barnehageassistent holdes utenfor denne oppryddingen fordi rollen fortsatt har governance-avvik.

## QA etter NextAction-lock (2026-07-01)

Omfang: Arealplanlegger (`by/by_radgiver_plan`) og Renholder (`naeringsliv/renholder`) er kontrollert som referanseroller for v0.1 etter PR #1575.

### Resultat

- NextAction er fortsatt eneste aktive svarflate: `CivicationNextActionUI` rendrer `data-civi-next-action-answer`, mens Dagens fase og Innboks peker dit.
- Dagens fase fungerer som status/progresjon: den viser fase, neste sak og knappen «Gå til neste handling», uten egne svarvalg.
- Innboks fungerer som arkiv/detalj/handover: åpne saker merkes «Håndteres i Neste handling» og bruker `data-civi-open-next-action`, ikke `data-civi-inbox-answer`.
- WorkdayPanel normal runtime viser ikke konkurrerende bundlevalg; `data-civi-bundle-choice` er fortsatt debug/test-only.
- Arealplanlegger og Renholder har konkrete `mailFamilies`-valg som vinner over generiske fallback-valg. Referanserollekontrakten fant 80 Arealplanlegger-mailer og 103 Renholder-mailer uten fallback-lekkasje i konkrete valg.
- Arealplanlegger Day 1-planen bygger en hel dag med 40 forventede mail-/fasepunkter, inkludert planfaglige jobbmailer, followup/consequence senere i dagen og day_end-punkter.
- Renholder-rollepakken validerer fortsatt renhold/HMS/hygiene-spesifikk mailplan.

### QA-konklusjon

Godkjent for v0.1 playflow: Begge referanseroller kan spilles gjennom minst én dag uten doble svarflater. Det ble ikke funnet behov for ny motor, nye rollepakker eller FWG-dataendringer.

### Kjørte kontroller

- `npm run test:civication -- --runInBand` — passerer.
- `node tests/civication-inbox-top-action-open-status.test.js` — passerer.
- `node tests/civication-arealplanlegger-mail-plan.test.js` — passerer.
- `node tests/civication-renholder-mail-plan.test.js` — passerer.
