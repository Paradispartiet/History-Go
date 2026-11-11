# Ekspeditørens prisavvik – gjennomføringsplan

> **For agentic workers:** Execute inline with superpowers:executing-plans; verify with superpowers:test-driven-development.

**Goal:** Gjør prisavvikets kundebehandling, melding, bekreftede overlevering og kontroll av retting til et sammenhengende spillbart forløp.

**Architecture:** Behold første jobbmail og eksisterende tråd-ID-er. Bruk MailRuntime sine forfattede oppfølgingstråder og ChoiceDirector/dayConsequences til historikk og grenflagg. Regenerer eksisterende sceneregister; ingen ny motor.

**Tech Stack:** JSON, eksisterende nettleser-JavaScript, Node/VM-test.

**Spec:** docs/civication-symposium/ekspeditor.md – konkret arbeidseksempel og synopsis «Prisen ved hylla».

## Global Constraints

- Rolleidentitet, førsteuketall og mailplan beholdes.
- Kilder og lokale spillpremisser skilles; bare faktisk valgte handlinger lagres.
- Bekreftet overlevering er ikke kontrollert retting.
- Denne bolken gjelder normal jobbgameplay. Eldre Life Story-kontrollpunkter er fortsatt åpne.

## Review Focus

- Å hjelpe kunden må ikke automatisk lukke årsaken til prisfeilen.
- Et meldt avvik må ikke framstilles som overtatt før Lenes bekreftelse.
- Egen kontroll og kollegahjelp skal begge være forsvarlige svar.
- Avbrutt kontroll må forbli uavklart; delegert kontroll må navngi faktisk kontrollør.
- Oppfølgingssvar skal ikke hoppe over neste jobb-/privatlivssteg eller gjenåpne løste scener.

## Oppgave 1: Spillbar prisoppfølging

Files: data/Civication/mailFamilies/naeringsliv/job/ekspeditor_job.json; data/Civication/compiledSceneRegistryV1.json; tests/civication-ekspeditor-price-handover.test.js; docs/civication-symposium/ekspeditor.md.

- [x] Skriv VM-gjennomspilling med ekte compiled katalog, EventEngine, ChoiceDirector, MailRuntime, dayConsequences og State. Test korrekte startvalg, reparasjon av snarvei/avvisning, ubekreftet melding, utsatt kontroll, delegert kontroll, ingen gjentakelse og uendret plansteg for tråder.
- [x] Kjør testen mot eksisterende innhold; forvent feil fordi handel og oppfølging ikke har de nødvendige handlingene/registreringene.
- [x] Utvid eksisterende prisvalg og tråder, regenerer registeret og kjør testen grønn.
- [ ] Kjør relevante ekspeditør-, katalog- og gjennomspillingstester samt npm run test:civication. Oppdater dokumentets reelle status.
- [ ] Gjennomgå hele diffen, publiser PR og følg CI før merge. Verifiser eksakt head og main etterpå.

## Gjennomføringsnotat

Baseline: ekspeditørens UI-flow og førsteuke samt compiled registry --check bestod. Ny test feilet først fordi konsekvensen ikke tilbød en oppfølgingshandling, og bestod etter innholdsendringen. 13/13 fokuserte testfiler bestod. Hele Civication-suiten kjøres separat. Ingen nye motorer eller generiske state-felt. Valgt gren gir konkrete hendelser i eksisterende historikk og avgrensede mail_branch_state-flagg.
