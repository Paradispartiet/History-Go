# Civication – integrert livsreise: gjennomføringsplan og kontrollregister

Opprettet: 2026-10-20. Eier: Civication. Status: **aktiv plan; ikke godkjent som ferdig spillerreise**.

## Formål og fasit
Spilleren skal kunne leve 14 ekte spilldager der arbeid, privatliv, relasjoner, økonomi, psyke, energi og integritet henger sammen. Et valg fra dag 2 må kunne få observerbare, kausalt begrunnede følger på dag 14. En grønn unit-test alene beviser ikke at dette skjer i nettleseren.

Dette er **arbeidsplan og akseptansekriterier**, ikke en ny runtime-kontrakt. Følg `CIVICATION_README.md`, `CIVICATION_PATCH_ORDER.md`, Scene Pipeline, Life Story og eksisterende økonomi-/relasjonskontrakter. Opprett ingen parallelle motorer.

## Én prioritert leveranse
**PR #6437** (`fix/civication-vitality-long-journey-20261020`) er aktivt utkast. Ikke opprett ny PR for samme bolk. Arbeidet omfatter moderat nattlig energi-restitusjon, terskelbasert og synlig belastning for krevende valg, personlige målere på tvers av jobbbytte, samt dag 2–3-ekspeditørscener og regresjonstester. Alt er **under CI-/spillbarhetskontroll**, ikke merget ved planoppdateringen. PR #6415 og #6427 er tidligere merget og skal ikke produseres om igjen.

### Fase 1: fullfør PR #6437
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
| ID | Område | Akseptansekriterium | Status per 2026-10-20 |
| --- | --- | --- | --- |
| C1 | PR #6437 | Grønn CI og reell spillflyt før merge | Pågår, utkast |
| C2 | Energi | Gradvis restitusjon uten dobbeltelling | Implementert på gren, ikke godkjent |
| C3 | Psyke | Små, forutsigbare utslag med synlige følger | Implementert på gren, ikke kalibrert bredt |
| C4 | Jobbbytte | Personlige målere bevares; rollespesifikke verdier isoleres | Endret på gren, må regresjonstestes |
| C5 | Etterspill | Dag 2-valg endrer dag 3-hendelse | Innhold lagt på gren, må gjennomspilles |
| C6 | Økonomi | Fortellingstransaksjoner og faktisk lommebok samstemmer | Åpent |
| C7 | Kalender | Livsdager og økonomiuker gir forventet progresjon | Åpent |
| C8 | Relasjoner | Personer reagerer senere på tidligere valg | Delvis, ende-til-ende ikke bevist |
| C9 | Skylagring | Samme progresjon etter reload/ny enhet | Åpent som full akseptanse |
| C10 | 14 dager | Autentisk brukerreise med kausale konsekvenser | Ikke godkjent |
| C11 | UI | Én tydelig innboks, naturlig dagflyt og tilbakemelding | Sluttkontroll gjenstår |

## Arbeidsregler
1. Oppdater dette registeret ved hver vesentlige leveranse; skill mellom «kode på gren», «CI bestått», «merget» og «spilltest godkjent».
2. Én arbeidsbolk om gangen. Prioriter feil som bryter spillerreisen før nye historier eller bred innholdsproduksjon.
3. Hold `docs/CIVICATION_README.md` som kanonisk inngang; denne planen er operativt sporingsdokument, ikke alternativ fasit.
4. Bruk eksakte GitHub-lenker: [aktiv PR #6437](https://github.com/Paradispartiet/History-Go/pull/6437), [PR #6415](https://github.com/Paradispartiet/History-Go/pull/6415), [PR #6427](https://github.com/Paradispartiet/History-Go/pull/6427).
