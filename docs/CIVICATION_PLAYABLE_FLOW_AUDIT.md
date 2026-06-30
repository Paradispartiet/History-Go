# Civication Playable Flow Audit

> Status: navigasjons- og produktanalyse.
> Formål: forklare hvorfor Civication/History GO-opplevelsen kan føles rotete, hvor blindveiene oppstår, og hvilken oppryddingsrekkefølge som gjør spillet spillbart igjen uten å bygge enda en motor.

---

## Kort konklusjon

Rotet skyldes ikke én enkelt feil. Det skyldes at prosjektet har vokst gjennom mange riktige enkeltgrep, men uten én hard regel for **spillerens hovedvei**.

Det finnes nå flere systemer som hver for seg er logiske:

- `CivicationMailRuntime` velger rollebaserte mailer over tid.
- `CivicationDailyMailBuilder` bygger en hel dag fra `mailDayProgram.json`.
- `CivicationMailEngine` lagrer og viser innboks.
- `CivicationEventEngine` håndterer svar og konsekvens.
- `CivicationDayProgression` vurderer fase, åpne saker og om fasen kan gå videre.
- `CivicationDayPhaseUI`, `CivicationInboxTopActionUI`, `CivicationNextActionUI` og `WorkdayPanel` viser ulike innganger til samme arbeidsdag.

Problemet er at spilleren opplever disse lagene som flere mulige veier videre. Når alle flater prøver å hjelpe, blir det uklart hva som faktisk er neste handling.

**Riktig produktregel:**

```text
Neste handling eier valget.
Dagens fase eier status.
Innboks eier historikk og kontekst.
WorkdayPanel eier oversikt.
DailyMailBuilder + mailDayProgram eier dagrytmen.
MailRuntime eier langsiktig rolleprogresjon.
```

---

## Spillerens autoritative hovedvei

Dette skal være den eneste mentale modellen spilleren trenger:

```text
1. Du har en rolle.
2. Dagen har en fase.
3. Fasen har én neste sak.
4. Du trykker “Gå til neste handling”.
5. Du leser saken og svarer der.
6. Systemet viser konsekvens / læring / task / relasjon.
7. Når fasen er tom, går du videre til neste fase.
8. Når dagen er ferdig, får du dagslutt og ny dag.
```

Alt UI må støtte denne modellen. Ingen flate bør starte en alternativ loop.

---

## Nåværende hovedkilder til blindveier

### 1. For mange flater viser samme objekt

Samme aktive sak kan vises i:

- Dagens fase
- Innboks
- WorkdayPanel
- Top action card
- NextAction modal

Når flere av disse viser svarvalg, oppstår det parallell navigasjon. Testen `tests/civication-next-action-consolidation.test.js` låser en bedre regel: Dagens fase og Innboks skal peke til NextAction, ikke selv være svarflater.

**Tiltak:** Behold denne regelen og gjør den produktmessig synlig i README og UI-tekst.

### 2. Fallback-valg gjør at alt føles likt

`CivicationDailyMailBuilder.normalizeChoices()` lager generiske valg hvis en mail ikke har minst to gyldige valg. Det er nyttig som fail-safe, men dårlig som spillopplevelse hvis mange mailer mangler egne valg.

Symptom:

```text
Alle meldingstråder har samme svaralternativer.
```

Sannsynlig årsak:

```text
mailFamilies / narrative storylets / generated phase events mangler konkrete choices,
eller sloten faller tilbake til generert innhold.
```

**Tiltak:** fallback-valg må vises som debug-problem i test/dev-modus. En rolle skal ikke regnes som spillbar før andelen fallback-valg er lav.

### 3. Dagsfasene er både konsept og runtime

Dokumentasjonen har omtalt arbeidsdagen som fem faser:

```text
Morgen → Lunsj → Ettermiddag → Kveld → Dagslutt
```

Samtidig opererer `mailDayProgram.json` / `DailyMailBuilder.defaultProgram()` med en mer detaljert rytme:

```text
morning → forenoon → workday → lunch → afternoon → dinner → evening → day_end
```

Begge kan være riktige produktmessig, men de må ikke presenteres som to ulike sannheter.

**Tiltak:** UI kan vise fem brukerfaser, mens runtime kan bruke åtte interne faser. Det må dokumenteres eksplisitt:

```text
User-facing phase = enkel fase spilleren forstår.
Runtime phase = intern slot- og leveringsstruktur.
```

### 4. Flere systemer har historisk eid dagrytmen

Den eldre `dayPatches`-flyten eide tidligere fasegenerering og per-svar-faseskifte. Nå peker kommentarene i koden mot at `DailyMailBuilder + mailDayProgram` skal eie dagrytmen, mens `dayPatches` skal beholde etter-svar-effekter, recovery og onboarding.

Det er riktig retning, men risikoen er at ny kode igjen legger faseprogresjon inn i feil lag.

**Tiltak:** innfør en eksplisitt regel:

```text
Ingen ny kode får kalle Calendar.setPhase/advancePhase som del av vanlig svarflyt
uten å gå gjennom CivicationDayProgression eller DailyMailBuilder-kontrakten.
```

### 5. Rolleinnholdet er ikke alltid dypt nok til dagstrukturen

`mailDayProgram` forventer mange typer innhold: `job`, `micro`, `people`, `conflict`, `event`, `followup`, `knowledge`, `consequence`, `day_end`, osv.

Hvis en rolle bare har noen få store mailer, må systemet fylle resten med generert/fallback-innhold. Da føles spillet skjematisk.

**Tiltak:** bruk minimumsvolumet i `data/Civication/README-mailsystem-og-rolemodels.md` som spillbarhetsgate. En rolle er ikke “spillbar” bare fordi den har en `roleModel` og én `mailPlan`.

### 6. README-strukturen har vært et produktproblem

Rot-README-en fungerte både som:

- startside
- idébibel
- statuslogg
- konseptarkiv
- delvis systemdokumentasjon

Det gjør at nye endringer lett legges nederst i feil fil, og at gamle sannheter blir stående sammen med nye sannheter.

**Tiltak:** rot-README skal bare være inngang. Autoritative dokumenter skal ligge i dedikerte filer.

---

## Definisjon av “spillbar” Civication-rolle

En rolle er ikke spillbar før dette er sant:

1. Rollen kan startes og recoveres.
2. `roleModel` finnes og er konkret.
3. `mailPlan` har dramaturgisk bue.
4. `mailFamilies` finnes for minst `job`, `people`, `conflict`, `story`, `event`.
5. Det finnes nok `micro`, `followup`, `knowledge` og `consequence` til å fylle dagsrytmen uten massiv fallback.
6. Minst 90 % av mailene har to eller flere rolle-/situasjonsspesifikke valg.
7. Dagens aktive sak vises som én `NextAction`.
8. Innboks og Dagens fase peker til `NextAction`, ikke egne svarflater.
9. Fasen kan fullføres uten manuell debugging.
10. Dagslutt leder tydelig til ny dag eller oppsummering.

---

## Oppryddingsrekkefølge

### Fase 1 — lås hovedveien

Mål:

```text
Spilleren skal alltid vite hva neste handling er.
```

Tiltak:

- Behold `CivicationNextActionSelector` som eneste selector for aktiv handling.
- Behold `CivicationNextActionUI` som eneste svarflate.
- La Dagens fase vise status + knapp.
- La Innboks vise arkiv/kontekst + “Håndteres i Neste handling”.
- Fjern/unngå alle nye inline-svar i statusflater.

Validering:

```bash
npm run test:civication-next-action
```

### Fase 2 — gjør fallback synlig

Mål:

```text
Generiske svar skal aldri forveksles med ferdig spillinnhold.
```

Tiltak:

- Tell fallback-valg per dag/rolle.
- Legg `fallback_choice_count`, `generated_phase_count` og `missing_choices_count` i `CivicationDailyMailBuilder.inspect()`.
- I test/dev-modus: vis advarsel når aktiv rolle bruker fallback for mange ganger.
- Lag audit som feiler når en rolle over en terskel mangler konkrete valg.

### Fase 3 — skill brukerfase fra runtimefase

Mål:

```text
Spilleren ser enkel dagsrytme. Runtime kan være mer detaljert.
```

Tiltak:

- Dokumenter mapping fra intern fase til brukerfase.
- UI bruker brukerfase-labels.
- Runtime beholder interne slots.
- Tests sjekker at “Neste handling” ikke hopper uforståelig mellom faser.

### Fase 4 — innholdsgate for roller

Mål:

```text
Ingen rolle markeres som spillbar før den har nok faktisk innhold.
```

Tiltak:

- Utvid `audit:civication:role-packs` med:
  - antall mailer per type
  - antall choices per mail
  - fallback-risiko
  - roleModel/mailPlan/mailFamily-match
  - om rollen kan fylle minst én hel dag uten generert støy

### Fase 5 — reduser dokumentasjonsgjeld

Mål:

```text
Én sannhet per dokument.
```

Tiltak:

- Rot-README = veiviser.
- `data/Civication/README-mailsystem-og-rolemodels.md` = innholdssystem.
- `docs/CIVICATION_WORKDAY_PHASE_INTEGRATION_AUDIT.md` = teknisk fase-/motorhistorikk.
- Dette dokumentet = spillbar flow og blindvei-audit.
- Gamle idébibler flyttes til `docs/archive/` hvis de ikke er autoritative.

---

## Anti-regler

Ikke gjør dette:

- Ikke lag enda et panel som også viser svarvalg.
- Ikke la en mail kunne besvares både i Innboks og NextAction.
- Ikke la `dayPatches` gjenvinne eierskap over vanlig dagrytme.
- Ikke legg nye rolle-ID-mappinger i UI.
- Ikke regn fallback-genererte mailer som ferdig innhold.
- Ikke bland AHA-analyse inn i hovednavigasjonen uten en tydelig brukerhandling.

---

## Praktisk debug-sjekk når spillet føles dødt

Kjør i konsoll/dev:

```js
CivicationDailyMailBuilder.inspect()
CivicationDailyMailBuilder.getCurrentPhaseItems()
CivicationDayProgression.inspect()
CivicationNextActionSelector.getCurrent()
CivicationMailEngine.getInbox()
```

Se etter:

- `pending_exists` uten synlig NextAction
- queued items i fase som ikke kan åpnes
- `blocked_by_open_task` uten tydelig task-lenke
- mange generated/fallback items
- fase som ikke matcher aktivt item
- innboks som viser svarvalg for aktiv fasesak

---

## Produktmål

Civication skal ikke føles som en innboks med tilfeldige valg. Det skal føles som en arbeidsdag i en rolle:

```text
rolle → fase → sak → valg → konsekvens → ny sak → ny fase → dagslutt
```

Når den modellen er tydelig, kan resten av universet være komplekst uten at spilleren går seg bort.
