# Civication – integrert livsreise: gjennomføringsplan og kontrollregister

Opprettet: 2026-10-20. Eier: Civication. Status: **aktiv plan; ikke godkjent som ferdig spillerreise**.

## Formål og fasit
Spilleren skal kunne leve 14 ekte spilldager der arbeid, privatliv, relasjoner, økonomi, psyke, energi og integritet henger sammen. Et valg fra dag 2 må kunne få observerbare, kausalt begrunnede følger på dag 14. En grønn unit-test alene beviser ikke at dette skjer i nettleseren.

Dette er **arbeidsplan og akseptansekriterier**, ikke en ny runtime-kontrakt. Følg `CIVICATION_README.md`, `CIVICATION_PATCH_ORDER.md`, Scene Pipeline, Life Story og eksisterende økonomi-/relasjonskontrakter. Opprett ingen parallelle motorer.

## Faktisk publiseringsstatus – 21. oktober 2026

- [#6400](https://github.com/Paradispartiet/History-Go/pull/6400) er merget: idempotent dagsplan og aktiviteter knyttet til riktig spilldag.
- [#6408](https://github.com/Paradispartiet/History-Go/pull/6408) er merget: én eier av toppkort, tydelige innboksstatuser og sikker dagslutt.
- [#6481](https://github.com/Paradispartiet/History-Go/pull/6481) og [#6490](https://github.com/Paradispartiet/History-Go/pull/6490) er merget: syv spilldager per uke og lønn etter faktisk jobb hver spilldag.
- [#6496](https://github.com/Paradispartiet/History-Go/pull/6496) er merget: jobbhistorikk følger kontosikkerhetskopi.
- [#6500](https://github.com/Paradispartiet/History-Go/pull/6500) korrigerer at NPC-relasjonene `civi.socialRelationships.v1`, tidligere svar `civi.socialResponses.v1` og samtaletråder `civi.socialConversations.v1` falt utenfor kontoens nøkkelutvalg. Fire mock-baserte regresjoner følger PR-en; merge krever grønn CI.
- [#6382](https://github.com/Paradispartiet/History-Go/pull/6382) er fremdeles et **utkast**: røde tester og gjeninnføring av faste Mira/Lea/Arvid-navn i brukerrettet tekst er ikke godkjent. De skal være fiktive typer med kanonisk intern-ID, ikke faste personer eller virkelige History Go-personer.
- Dette er **ikke** en gjennomført 14-dagers nettlesertest; fysisk kontogjenoppretting, NPC-etterspill og reelle History Go-opplåsinger er fortsatt åpne porter.

## Én prioritert leveranse
**PR #6437** (`fa223ed75547212edbc33792d705e79287527d2c`) er merget til `main` med seks beståtte CI-arbeidsflyter. Vitalitets-/Life Story-koden og regressjonene er publisert; dette er **ikke** full 14-dagers browser-/kontoakseptanse. PR #6415 og #6427 er også merget. Ukeavregningen etter **syv faktiske spilldager** er merget i PR #6481 (`dacbd7270bbf41f7bfb90ac1996f1d92a95d7ed8`). Denne feilen ved jobbbytte er lukket i #6490. Leveveiavregning og nye nettverkstilbud følger spilluker gjennom #6498 og #6504 (begge merget). NPC-relasjoner, svar og samtaler sikkerhetskopieres gjennom #6500 (merget). Full 14-dagers gjennomspilling gjenstår.

### Fase 1: verifiser publisert PR #6437
- [ ] Les fersk CI for nøyaktig siste head-commit; rett feil i samme PR, ikke ved å ignorere tester.
- [ ] Kontroller at restitusjon skjer nøyaktig én gang ved gyldig dagbytte, og at lav psyke/energi ikke fører til utilsiktede eller dobbelte effekter.
- [ ] Kontroller at psyke, energi, integritet, relasjoner, private valg og tidsankre følger spilleren gjennom jobbbytte; rollespesifikke verdier beholdes separat.
- [ ] Test at dag 2-hendelsen og alle tre dag 3-oppfølgingene faktisk kan nås i montert UI med riktige vilkår, uten duplisering.
- [ ] Sjekk norsk språk, brukerforklaring, skjermleservarsel og konsekvenstekst; ingen diagnoseaktige påstander eller urimelige straffer.
- [ ] Kontroller økonomi, History Go og cloud-save regresjoner. Merge først ved grønne relevante kontroller og bekreftet fungerende spillflyt.

### Fase 2: balanse og konsekvensmatrise
- [ ] Lag målbar oversikt over alle psyke-/energi-/integritets-/handlingsrom-deltaer fra faktiske scener (fordeling, daglig netto, ytterpunkter, frekvens, null/100-metning).
- [ ] Kalibrer med dokumenterte scenarier: rolig dag, tung vakt, flere tunge dager, restitusjon, støtte fra andre, arbeidsledighet, jobbbytte. Vurder 0–100-skala og terskler som hypoteser; ingen påstått medisinsk presisjon.
- [ ] Konsekvenser må være synlige og begrunnede: valg → lagret state → respons → senere scene. Gi rom for bedring og alternativer; unngå deterministiske straffespiraler.
- [ ] Test at effekter verken trigges dobbelt i Life Story og psyke/livsstil-broen eller forsvinner ved reload.

### Fase 3: samordne eksisterende spillmotorer
- [ ] Kartlegg hvem som eier lommebok/transaksjoner, fortellingsøkonomi, kalenderuke, livsdag, sosial relasjon og Life Story-relasjon. Lag konkret mapping før endringer.
- [ ] Bekreft om fiktive utgifter i historiene faktisk belastes kanonisk lommebok. Ingen dobbeltbelastning eller falsk transaksjon.
- [ ] Kontroller at ukentlig økonomi utløses av korrekt spilltid, ikke uventet av veggklokke alene.
- [ ] Synkroniser relasjonelle hendelser til relevante sosiale reaksjoner uten å blande fiktive NPC-er med virkelige History Go-personer.
- [ ] Gjenbruk eksisterende Scene Pipeline, ChoiceDirector, livelihood, History Go completion bridge og cloud save.

### Fase 4: organisk 14-dagers akseptanse
- [ ] Start med fersk, ordinær bruker uten kunstig badge, jobb, lønn, flagg eller testopplåsinger.
- [ ] Dag 1–3: arbeidssituasjon, bolig, penger, første relasjoner og konsekvenser.
- [ ] Dag 4–7: autentiske oppgaver, søknader, vennskap, konflikter og restitusjon.
- [ ] Dag 8–10: senere hendelser ut fra faktiske tidligere valg og ekte progresjon.
- [ ] Dag 11–14: arbeid/levevei, økonomi, fritid, sosialt etterspill, psyke og energi.
- [ ] Test utlogging, ny innlogging, nettleserbytte og cloud save. Spillhistorikk og private valg må bevares.
- [ ] Hvis ekte History Go-opplåsing eller progresjon blokkerer løpet: dokumenter nøyaktig blokkering og rett årsaken. Ikke omgå med testdata.
- [ ] Gjennomfør minst to ulike valgruter, inkludert krevende valg og rehabilitering. Observer faktisk UI, ikke bare unit-tests.

### Fase 5: produktkontroll
- [ ] Samle «Min dag», én innboks, tydelig navigasjon, NPC-reaksjoner, kart og oppgaver uten dupliserte handlinger.
- [ ] Gjennomgå tekster redaksjonelt: naturlig motivasjon, rolletroverdighet, valgfrihet og ingen karikatur.
- [ ] Dokumenter akseptansestatus med bevis: testnavn, commit, scenario, forventet/faktisk, avvik, PR og beslutning.

## Kontrollregister – oppdater etter hvert arbeid
| ID | Område | Akseptansekriterium | Status per 2026-10-21 |
| --- | --- | --- | --- |
| C1 | PR #6437 | Grønn CI og reell spillflyt før merge | Merget, 6/6 CI; full E2E-spillflyt ikke godkjent |
| C2 | Energi | Gradvis restitusjon uten dobbeltelling | Implementert i #6437 (main); full spillerreise ikke godkjent |
| C3 | Psyke | Små, forutsigbare utslag med synlige følger | Implementert i #6437 (main); bred balansekalibrering mangler |
| C4 | Jobbbytte | Personlige målere bevares; rollespesifikke verdier isoleres | Merget i #6437; komplett spillreise må regresjonstestes |
| C5 | Etterspill | Dag 2-valg endrer dag 3-hendelse | Oppfølgingsscene merget; full nettlesergjennomspilling mangler |
| C6 | Økonomi | Fortellingstransaksjoner og faktisk lommebok samstemmer | Åpent |
| C7 | Kalender | Livsdager og økonomiuker gir forventet progresjon | #6481, #6490, #6498 og #6504 merget; lønn og tilbud følger spilluker, full E2E ikke godkjent |
| C8 | Relasjoner | Personer reagerer senere på tidligere valg | NPC-relasjoner, sosiale svar og samtaler sikkerhetskopieres gjennom #6500 (merget); faktisk senere sosialt etterspill ikke bevist |
| C9 | Skylagring | Samme progresjon etter reload/ny enhet | #6395/#6496/#6500 merget; mock restore av Life Story, jobb og NPC-minne testet. Spillerens egne fasesnapshots undersøkes separat; fysisk konto-/enhetsbytte ikke godkjent |
| C10 | 14 dager | Autentisk brukerreise med kausale konsekvenser | Ikke godkjent |
| C11 | UI | Én tydelig innboks, naturlig dagflyt og tilbakemelding | Dagsplan #6400 og toppkort/innboks #6408 merget; integrert nettleserkontroll gjenstår |

## Arbeidsregler
1. Oppdater dette registeret ved hver vesentlige leveranse; skill mellom «kode på gren», «CI bestått», «merget» og «spilltest godkjent».
2. Én arbeidsbolk om gangen. Prioriter feil som bryter spillerreisen før nye historier eller bred innholdsproduksjon.
3. Hold `docs/CIVICATION_README.md` som kanonisk inngang; denne planen er operativt sporingsdokument, ikke alternativ fasit.
4. Bruk eksakte GitHub-lenker: [aktiv PR #6437](https://github.com/Paradispartiet/History-Go/pull/6437), [PR #6415](https://github.com/Paradispartiet/History-Go/pull/6415), [PR #6427](https://github.com/Paradispartiet/History-Go/pull/6427).

## Neste spesifikke 14-dagers lagringskontroll (2026-10-21)

`civi.playerPhaseSnapshots.v1` er spillerens sist lagrede aktivitet og tilgjengelighet i hver sosial fase. Den bruker en egen prikk-notasjon og falt utenfor skybackup selv etter at NPC-samtaler ble rettet i #6500. En avgrenset oppfølging inkluderer nøyaktig denne kanoniske nøkkelen, uten å åpne for vilkårlige `civi.*`-nøkler. Ny regresjon kontrollerer samtidig `hg_civi_calendar_v1`, `hg_civi_livelihood_v1`, Life Story og wallet ved simulert kontogjenoppretting etter spilldag 14. Dette er **ikke** en ekte fjorten dagers nettleserreise og godkjenner ikke C8–C10 alene.
