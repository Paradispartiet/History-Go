# Civication

Civication er rolle-/arbeidslivsspillet i History GO-universet. Spilleren får en rolle, går gjennom dager og faser, svarer på saker, bygger kompetanse, mister eller vinner tillit, får oppgaver i History GO-rommene og ender i mestring, stagnasjon, fall, opprykk eller ny retning.

Denne README-en er **Civication-startsiden**. Den skal forklare hvordan Civication faktisk skal spilles og utvikles. Lange analyser ligger i `docs/`, mens mail- og rollemodellstandarden ligger i egne data-dokumenter.

Civication skal ikke bare være en jobbmail-generator. Det skal bygge små sosiologiske hverdagsdramaer der spilleren lærer hvordan moderne mennesker lever, arbeider, tilpasser seg, strever, spiller roller og forsøker å beholde verdighet under press.

---

## Spillbar hovedvei

Spilleren skal bare trenge én mental modell:

```text
Rolle
  → dag
  → fase
  → neste handling
  → valg
  → konsekvens / læring / task / relasjon
  → neste sak eller neste fase
  → dagslutt
  → ny dag
```

Den viktigste regelen:

```text
Neste handling er eneste aktive svarflate.
```

Dagens fase, WorkdayPanel og Innboks kan forklare, oppsummere og arkivere, men de skal ikke konkurrere med `Neste handling` om å være stedet der spilleren tar valg.

---

## Hva eier hva?

| Lag | Eier | Skal ikke eie |
|---|---|---|
| `CivicationNextActionSelector` | Velger én aktiv handling | Langsiktig progresjon |
| `CivicationNextActionUI` | Viser saken og svarvalgene | Arkiv / full innboks |
| `CivicationDayPhaseUI` | Fase-status og knapp til NextAction | Egne svarvalg |
| `CivicationInboxTopActionUI` / Innboks | Arkiv, kontekst, detaljer | Aktiv fasesvarflate |
| `WorkdayPanel` | Oversikt over arbeidsdag/rolle | Progresjon eller svarvalg |
| `CivicationDailyMailBuilder` | Dagens kø, slots og rytme | Rolleplottet alene |
| `mailDayProgram.json` | Deklarativ dagsstruktur | Konkrete rollehistorier |
| `CivicationMailRuntime` | Langsiktig rolleprogresjon / primær jobbmail | UI-ruting |
| `CivicationMailEngine` | Mailstore, pending/resolved/read/archive | Valg av neste rollehendelse |
| `CivicationEventEngine` | Svar, effekter og konsekvens | Ny dagmotor |
| `CivicationDayProgression` | Om fasen er tom / kan gå videre | Mailinnhold |
| `roleModels` | Rollebibel | Konkrete mailtekster |
| `mailPlans` | Dramaturgisk rolleplan | UI |
| `mailFamilies` | Konkrete simulerte mailsaker | Dagsrytmen alene |

---

## Autoritative dokumenter

| Tema | Fil |
|---|---|
| Spillbar flow og blindveier | [`../../docs/CIVICATION_PLAYABLE_FLOW_AUDIT.md`](../../docs/CIVICATION_PLAYABLE_FLOW_AUDIT.md) |
| Arbeidsdag / fase-integrasjon | [`../../docs/CIVICATION_WORKDAY_PHASE_INTEGRATION_AUDIT.md`](../../docs/CIVICATION_WORKDAY_PHASE_INTEGRATION_AUDIT.md) |
| Mailsystem og rollemodeller | [`README-mailsystem-og-rolemodels.md`](./README-mailsystem-og-rolemodels.md) |
| Rollepakke-standard | [`../../docs/CIVICATION_ROLE_PACK_STANDARD.md`](../../docs/CIVICATION_ROLE_PACK_STANDARD.md) |

---

## Hvorfor Civication føles rotete nå

Civication har blitt bygget som flere riktige systemer oppå hverandre, men spilleren ser resultatet som flere innganger:

```text
Dagens fase
Innboks
WorkdayPanel
Top action
Neste handling
Tasks
Profilkort
History GO-rom
AHA-analyse
```

Når flere av disse prøver å være handlingsflate, oppstår blindveier. Spilleren vet ikke om man skal svare i innboksen, trykke dagens fase, åpne neste handling, fortsette bolken, fullføre task eller vente på ny fase.

Løsningen er ikke enda en motor. Løsningen er strengere eierskap:

```text
Statusflater forklarer.
Neste handling lar spilleren handle.
Innboks arkiverer og viser detaljer.
Dagsmotoren leverer rytmen.
Rolledata leverer historien.
```

---

## Vanlige symptomer og sannsynlig årsak

### “Alle meldingstråder har samme svaralternativer”

Sannsynlig årsak:

```text
Mailen mangler to gyldige choices, så DailyMailBuilder bruker fallback-valg.
```

Tiltak:

- Sjekk aktuell `mailFamily`.
- Sjekk at hver mail har minst to konkrete valg.
- Ikke regn rollen som spillbar hvis den bruker fallback-valg ofte.
- Legg inn audit for fallback-rate per rolle.

### “Jeg finner ikke veien videre”

Sannsynlig årsak:

```text
Aktiv sak vises flere steder, eller queued/pending state vises uten tydelig NextAction-rute.
```

Tiltak:

- `CivicationNextActionSelector.getCurrent()` må returnere riktig handling.
- Dagens fase skal ha knapp til NextAction.
- Innboks skal si “Håndteres i Neste handling” for aktiv fasesak.
- Ingen inline-svar i Dagens fase eller Innboks for samme aktive sak.

### “Dagen hopper rart mellom faser”

Sannsynlig årsak:

```text
Flere systemer forsøker å eie Calendar phase / faseskifte.
```

Tiltak:

- `DailyMailBuilder + mailDayProgram` eier rytmen.
- `DayProgression` vurderer om fasen kan gå videre.
- Ikke gjeninnfør per-svar-faseskifte i gamle patcher for daily-events.

### “Rollen føles som generisk innboks”

Sannsynlig årsak:

```text
roleModel/mailPlan/mailFamilies er ikke dype nok til å fylle dagsrytmen.
```

Tiltak:

- Forbedre `roleModel` før flere mailer skrives.
- Skriv konkret personkart, konfliktkart og hovedcase.
- Lag nok `micro`, `people`, `followup`, `knowledge` og `consequence` til at arbeidsdagen får rytme.

---

## Minimum for at en Civication-rolle er spillbar

En rolle er ikke spillbar før dette er sant:

1. Rollen kan startes og recoveres.
2. `roleModel` er konkret og forklarer arbeid, personer, konflikter og kompetanse.
3. `mailPlan` har en faktisk dramaturgisk bue.
4. `mailFamilies` finnes for minst `job`, `people`, `conflict`, `story`, `event`.
5. Det finnes nok `micro`, `followup`, `knowledge` og `consequence` til å fylle en arbeidsdag uten massiv fallback.
6. Minst 90 % av mailene har konkrete valg, ikke fallback.
7. `Neste handling` viser aktiv sak og svarvalg.
8. Dagens fase og Innboks peker til `Neste handling`.
9. Fasen kan fullføres uten manuell debugging.
10. Dagslutt leder til oppsummering eller ny dag.

---

## Leveverden, ikke bare oppgaver

Arbeidslivet i Civication skal føles som en verden.

Derfor bør hver rolle ha en dagsrytme:

```text
Morgen: arbeidspress, mål, beskjed, krav
Lunsj: kollegaer, rykter, sosial friksjon, kropp, pause
Ettermiddag: konflikt, konsekvens, kunde, sjef, system
Kveld: privatliv, familie, venner, ensomhet, økonomi, slitenhet, drømmer
```

Dette gjør at spilleren ikke bare svarer på oppgaver, men lever gjennom en sosial posisjon.

---

## Hva Civication-mailer skal være

Civication-mailer skal ikke være tilfeldige hendelser med valg. De skal være små spillbare scener.

Hver viktig mail eller tråd bør ha:

1. konkret avsender
2. konkret situasjon
3. sosialt press
4. faglig eller praktisk problem
5. tydelig rolleposisjon
6. valg som ikke bare er rett/galt
7. konsekvens for tillit, status, relasjon, risiko eller selvforståelse
8. etterklang i senere meldinger

---

## Sosiologiske stereotypier

NPC-er skal først være sosiale typer.

Ikke flate vitser, men gjenkjennelige posisjoner i et miljø:

- den glatte lederen
- den gamle ringreven
- den kyniske kollegaen
- den flinke ekstrahjelpen
- den krenkede kunden
- den rike kunden
- den fattige kunden
- den usynlige arbeideren
- den moralske vennen
- familien som trenger at du holder ut
- personen som vil opp og bort
- personen som har gitt opp

Hver type skal ha en funksjon:

```text
klasseposisjon
status
makt over spilleren
hva de vil ha
hva de skjuler
hvordan de snakker
hva de lærer spilleren
```

Stereotypien er starten. Dybde kommer når typen får motsetninger, historie og konsekvenser.

---

## Film som inspirasjonsbank

Civication kan bruke filmhistorien og HG Film Producer som tematisk inspirasjonsbank.

Vi kopierer ikke filmer, karakterer, scener eller dialog.

Vi bruker filmene fordi de ofte undersøker det moderne mennesket strever med:

- fremmedgjøring
- klasse
- arbeid
- statusangst
- forbruk
- skam
- ensomhet
- begjær
- familieplikt
- ambisjon
- kropp
- moral under press
- byliv
- masker og roller
- drømmen om et annet liv

Riktig oversettelse er:

```text
Film -> tema -> sosiologisk konflikt -> rollehverdag -> korrespondanse -> valg
```

Eksempel:

```text
En film om fremmedgjøring i byen
blir ikke kopiert som plot.
Den kan inspirere en ekspeditør-rolle der spilleren møter hundrevis av mennesker,
men likevel ikke blir sett som et helt menneske.
```

---

## Definisjon av “fylt rolle”

En rolle kan ha flere modenhetsnivåer.

| Nivå | Betydning |
|---|---|
| Baseline | Rollen har id, mapping, learning profile, mailPlan og noen mailFamilies. |
| Spillbar start | Rollen kan gi spilleren enkelte jobbmailer eller en enkel to-ukers praksisfortelling. |
| Leveverden | Rollen har dagsrytme, NPC-er, flere tider på dagen og private etterklanger. |
| Korrespondanseverden | Viktige hendelser består av 5-10 meldingsvekslinger, ikke bare én mail. |
| Sosiologisk serie | Rollen har 14-dagers bue, faste relasjoner, klassiske konflikter og konsekvenser som kommer tilbake. |

Bare siste nivå kan regnes som egentlig fylt.

---

## Første anbefalte rolleverdener

Start med én rolle og bygg den dypt før mange roller utvides grunt.

Anbefalt første rolle:

```text
naer_ekspeditor
```

Grunn:

- lav terskel for spillerforståelse
- sterk klasse- og statusakse
- tydelig kundemakt
- rikt rom for sosiologiske stereotypier
- naturlig morgen/lunsj/ettermiddag/kveld-struktur
- godt egnet for filmtemaer som fremmedgjøring, service, forbruk, skam og drømmen om et annet liv

---

## Utviklingsrekkefølge når en rolle skal ryddes

```text
1. Les roleModel.
2. Definer hovedcase og rolleplot.
3. Definer personer og konfliktakser.
4. Sjekk mailPlan mot plottet.
5. Sjekk mailFamilies og valg.
6. Kjør audit/test.
7. Spill gjennom én dag fra NextAction, ikke fra Innboks.
8. Først da justeres UI.
```

Ikke start med mer UI hvis rollen mangler innhold. Da skjuler UI bare dataproblemet.

---

## Debug

Kjør i konsoll:

```js
CivicationNextActionSelector.getCurrent()
CivicationDayProgression.inspect()
CivicationDailyMailBuilder.inspect()
CivicationDailyMailBuilder.getCurrentPhaseItems()
CivicationMailEngine.getInbox()
```

Se spesielt etter:

- aktiv sak finnes, men NextAction er tom
- pending mail finnes, men vises bare i innboks
- queued item kan ikke åpnes
- `blocked_by_open_task` uten tydelig task-lenke
- mange generated/fallback items
- mailer med tomme eller generiske choices
- fase i Calendar matcher ikke item.phase

---

## Tester og audits

```bash
npm run test:civication-next-action
npm run test:civication
npm run civication:boot-smoke
npm run audit:civication:role-packs
npm run audit:job-learning-profiles
npm run audit:job-knowledge-requirements
```

Ved UI-/flow-endringer skal `test:civication-next-action` være grønn før merge.

---

## Anti-regler

Ikke gjør dette:

- Ikke legg svarvalg i Dagens fase.
- Ikke la Innboks være parallell aktiv spillflate for dagens fasesak.
- Ikke lag ny dagmotor ved siden av `DailyMailBuilder + mailDayProgram`.
- Ikke hardkod nye rolle-ID-mappinger i UI.
- Ikke regn fallback-generert innhold som ferdig rolleinnhold.
- Ikke bland AHA inn i hovednavigasjonen uten en eksplisitt brukerhandling.
- Ikke skriv flere mailer før roleModel og mailPlan forklarer hva rollen egentlig handler om.

---

## Produktmål

Civication skal ikke føles som en tilfeldig innboks. Det skal føles som en arbeidsdag i et sosialt og faglig rom:

```text
rolle → fase → sak → valg → konsekvens → læring → ny sak → dagslutt
```

Når denne løkken er tydelig, kan systemet være komplekst uten at spilleren mister veien.
