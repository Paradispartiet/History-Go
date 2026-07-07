# Civication Life Story System

Nytt fortellingssystem for Civication — tegnet som nytt system, ikke som
reparasjon av det gamle. Dette dokumentet er normativt for alt under
`js/Civication/lifestory/` og `data/Civication/lifestory/`.

**Life Story System er Civication v2 — den primære systemarkitekturen.**
`Civication.html` laster kun v2-flyten (Min dag). Alt gammelt maskineri er
Civication v1 (legacy) og lastes aldri i hovedflyten — se «Civication v2 og
legacy-gaten» nederst.

## 1. Kjerneidé

Spilleren lever dager. Dager består av scener. Scener tilhører
fortellingstråder. Fortellingstråder kommer fra privatliv og arbeidsliv.
Valg endrer spillerens liv. Endret liv åpner nye scener.

Det er hele spillet.

Ikke mailmotor. Ikke konfliktmotor. Ikke masse spesialmotorer.
**Én fortellingsrunner + gode fortellingspakker.**

## 2. Hovedmodell

```
PLAYER STATE  (hvem spilleren er akkurat nå)
   ↓
MIN DAG       (morgen / formiddag / ettermiddag / kveld)
   ↓
AKTIVE TRÅDER (arbeid + privatliv)
   ↓
SCENE         (det spilleren opplever nå)
   ↓
VALG          (hva spilleren gjør)
   ↓
KONSEKVENS    (relasjoner, psyke, jobb, tid)
   ↓
tilbake til Player State
```

## 3. Grunnobjektene

- **Player State** — spillets hukommelse: rolle, dag, fase, målere
  (penger, psyke, energi, integritet, synlighet, handlingsrom),
  relasjoner, aktive tråder, tidligere valg, arkiv.
- **Role Package** — en stilling er en arbeidslivsroman: kjernefantasi,
  arbeidsoppgaver, faste personer, hovedkonflikter, mulige endings.
  Ikke en motor — en innholdspakke.
- **Life Package** — privatlivet kjører parallelt med jobben og kan
  kollidere med arbeidslivet.
- **Story Thread** — en tråd er ikke en mail; en tråd er en liten
  historie med konflikt, personer og mulige retninger.
- **Scene** — det spilleren faktisk spiller. Mail er bare én
  visningstype; andre er melding, møte, telefon, kalenderhendelse,
  intern vurdering, privat hendelse, krise, samtale, refleksjon.
- **Choice** — spillerens handling, alltid med effekter.
- **Day Runner** — den ene egentlige «motoren».

## 4. De fire lovene

1. **Ingen valg uten konsekvens.** Hvert valg må ha minst én effekt
   som endrer Player State.
2. **Ingen konsekvens uten state-endring.** Effekter skrives alltid
   til Player State, aldri bare til UI.
3. **Ingen scene uten tråd.** Hver scene peker på en eksisterende
   fortellingstråd.
4. **Ingen tråd uten konflikt.** Hver tråd har et definert
   konfliktfelt.

Innholdsvalidatoren (`lifestoryContent.js`) håndhever lovene og
**feiler fast** (kaster) på brudd — ingen normalisering, ingen gjetting,
i tråd med SYSTEM_REGISTRY-regel 6.

## 4b. Scene conditions

En scene kan gjøres betinget av Player State via `conditions`. En scene
er bare kandidat hvis alle betingelsene er oppfylt. Toppnøklene er
`flagg`, `meters`, `relasjoner`, `threads` — alt annet er en innholdsfeil
(fail fast).

```json
"conditions": {
  "flagg": {
    "tok_skolevei_alvorlig": true,
    "aldri_satt": { "finnes": false }
  },
  "meters":     { "energi":   { "min": 40, "max": 90 } },
  "relasjoner": { "plansjef":  { "min": 35 } },
  "threads":    { "skolevei_parkeringskjeller": "active" }
}
```

- **flagg**: literal verdi (må være lik `tidligereValg[k]`), eller
  `{ "finnes": true/false }` (nøkkelen må / må ikke finnes).
- **meters / relasjoner**: `{ min?, max? }` inklusive grenser; minst én
  grense kreves, `min > max` avvises.
- **threads**: krever nøyaktig oppgitt trådstatus. Tråd uten threadState
  regnes som `dormant` (ikke startet).

Validering skjer i `lifestoryContent.js` (kjente nøkler, kjente
målere/relasjoner/tråder), evaluering i `lifestoryRunner.js`
(`conditionsMet`). Ukjent nøkkel/tråd/måler → fail fast.

## 4c. Thread state

Tråder er ikke lenger en flat liste — hver tråd har state i
`state.threadState`:

```js
threadState: {
  skolevei_parkeringskjeller: { status: "active", step: 1, lastSceneId: "skolevei_01_melding" }
}
```

Statuser: **active**, **completed**, **dormant**, **escalated**. Bare
`active` og `escalated` er spillbare (gir kandidatscener); `completed` og
`dormant` gir ingen nye scener.

Valg kan endre trådstate via `effekter.threads`:

```json
"effekter": {
  "threads": { "skolevei_parkeringskjeller": { "status": "escalated", "stepDelta": 1 } }
}
```

`status` settes direkte (validert), `stepDelta` legges til `step`.
`lastSceneId` føres av runneren. `createInitialState` gir hver dag-1-tråd
`{ status: "active", step: 0, lastSceneId: null }`; tråder med senere
`startDag` får ikke threadState før dagen deres kommer, så de forveksles
aldri med dvale-tråder.

## 5. Day Runner

Runneren gjør bare dette:

1. Les Player State
2. Finn spillbare tråder (active/escalated)
3. Finn mulige scener for dagens fase (fase + tråd spillbar + conditions oppfylt + ikke spilt)
4. Velg beste neste scene (høyest prioritet, deterministisk)
5. Vis scenen
6. Ta imot valg
7. Oppdater Player State (målere, relasjoner, flagg, thread state)
8. Lås opp nye scener
9. Gå videre i dagen (hopp over tomme faser; avslutt dagen når siste fase er tom)

Ikke mer.

## 5b. Day progression: neste dag

Når siste fase er tom, avslutter runneren dagen (`completeDay`) og
`getView` returnerer oppsummeringen i stedet for en scene.

`startNextDay(state, content)`:

- `dag += 1`, tilbake til første fase, `dagFerdig = false`.
- Tråder hvis `startDag` nå er nådd og som aldri fikk threadState,
  aktiveres. `completed`/`dormant`/`escalated`-tråder beholder statusen
  sin — de vekkes bare av eksplisitte `threads`-effekter, aldri
  automatisk, så gårsdagens ferdige tråder dominerer ikke neste dag.
- `dagStartMeters` og `dagStartThreadStatus` nullstilles (grunnlaget for
  neste dags oppsummering).
- **Arkiv, tidligere valg og relasjoner beholdes urørt.**
- Kaster hvis dagen ikke er ferdig.

`getDaySummary` grupperer trådene som skiftet status siden morgenen i
`fullfoert` / `eskalert` / `hvilende`, ved siden av `meterEndringer` og
dagens `valg`.

Arealplanlegger har nå et ekte **dag 2** som leser dag 1:

- **Morgenen** forgrenes på gårsdagens kveldsrefleksjon: flaggene
  `valgte_aa_staa_i_jobben` / `begynte_aa_se_seg_om` / `vil_endre_arbeidsmaate`
  gir tre ulike morgenscener (`conditions.flagg`).
- **Formiddagen** forgrenes på skolevei-trådens status
  (`conditions.threads`): `escalated` gir en politisk konfrontasjon,
  `active` gir en fortsettelse, `dormant` gir en scene der plansjefen
  gjenåpner saken (den scenen ligger på den aktive `plansjef_merarbeid`-
  tråden og kan sette skolevei tilbake til `active`).
- **Kvelden** forgrenes på økonomi-tråden og pengemåleren, og lukkes med
  en to-dagers refleksjon.

En helt tom dag avsluttes fortsatt trygt i stedet for å krasje.

## 5c. Consequence feedback

Et valg kan ha et valgfritt `konsekvensTekst` — fortellingsmessig
tilbakemelding som vises etter valget og lagres i arkivet:

```json
"konsekvensTekst": "Skolekontakten svarer raskt og sender over bilder. Plansjefen virker mindre begeistret."
```

`konsekvensTekst` **erstatter ikke** state-endringer: lov 1 og 2 gjelder
fortsatt, og et valg uten faktiske effekter er ugyldig uansett tekst.
Tom/blank tekst avvises av validatoren.

## 6. UI-modellen

Hovedskjermen er **Min dag** (`CivicationLifestoryUI`):

- **NÅ** — scenen spilleren står i, med valgene.
- **KONSEKVENS** — fortellingsmessig feedback (`konsekvensTekst`) etter
  forrige valg.
- **AKTIVE TRÅDER** — spillbare historier (active/escalated), med status.
- **KALENDER / SENERE I DAG** — det som venter i senere faser.
- **ARKIV** — tidligere valg med konsekvenstekst. Innboks er ikke
  spillet; innboks er arkiv.
- **DAGSOPPSUMMERING** — når dagen er over: meter-endringer, tråder som
  ble fullført/eskalert/lagt i dvale, dagens valg, og **Start neste dag**.

## 6b. Slik flettes privatliv og arbeidsliv

Systemet knytter de to rytmene sammen via conditions og thread state —
ikke via gamle mailmotorer. I Arealplanlegger dag 1:

- **Privat start → arbeidsdag:** morgenvalget påvirker energi. Er energi
  lav (`<= 69`), får plansjefmøtet en egen «sliten»-variant
  (`plansjef_01_reaksjon_sliten`) med et mer utmattet valgsett; er energi
  høy (`>= 70`), spilles normalvarianten. Ren `conditions.meters`.
- **Arbeidsdag → privat kveld:** eskalerte du skolevei-saken
  (`threadState.skolevei_parkeringskjeller.status === "escalated"`),
  dukker kveldsscenen «Jobben ble med hjem» opp — betinget på trådstatus.
  Uten eskalering vises den ikke.

## 7. Filstruktur

```
js/Civication/lifestory/
├── lifestoryContent.js    # last + valider fortellingspakker inkl. conditions (fail fast)
├── lifestoryState.js      # Player State: opprett, effekter, thread state, lagring
└── lifestoryRunner.js     # Day Runner: conditions, thread state, day progression

js/Civication/ui/
└── CivicationLifestoryUI.js  # Min dag-visningen

data/Civication/lifestory/
├── manifest.json
├── shared/
│   └── phaseDefinitions.json
├── roles/
│   └── arealplanlegger/
│       ├── role.json      # kjernefantasi, personer, konflikter, endings
│       ├── threads.json   # arbeidstråder
│       └── scenes.json    # spillbare øyeblikk
└── life/
    ├── threads.json       # privattråder
    └── scenes.json
```

Alle kjernefilene er DOM-frie og har dobbel eksport (window-global +
`module.exports`) så de kan testes rett i Node. Testene plukkes opp
automatisk av `npm run test:civication`:

- `tests/civication-lifestory-runner.test.js` — de fire lovene + hel dag
  1 morgen→kveld.
- `tests/civication-lifestory-engine.test.js` — conditions, thread state,
  day progression, konsekvenstekst.
- `tests/civication-v2-main-flow.test.js` — v2-allowlist + legacy-gate.
- `tests/civication-v2-min-dag-ui.test.js` — Min dag i JSDOM inkl. neste dag.

## 8. Hva som er kassert som designmodell

Mailmotor, rollemailmotor, narrativ mailmotor, konfliktmotor, solmotor,
fase-mailmotor, inbox som hovedspill, next-action som altstyrende lås,
like svaralternativer på alle tråder, tilfeldig generering uten tråd.

De gamle motorene slettes ikke med én gang, men de styrer ikke lenger
designet. Nye fortellinger bygges som pakker i
`data/Civication/lifestory/`, aldri som nye motorer.

## 9. Pilot: Arealplanlegger, Dag 1 og Dag 2

Piloten beviser at spilleren kan leve dager som arealplanlegger, med
arbeidstråder, privatliv, valg og konsekvenser — og at dag 2 leser dag 1.

Arbeidstråder dag 1:

1. Skoleveien bak parkeringskjelleren
2. Den lange nabomailen
3. Hva er egentlig politisk valg?
4. Utbygger vil ha rask avklaring
5. Plansjefen vil unngå merarbeid

Privattråder dag 1:

1. Du har sovet dårlig
2. Økonomien er stram
3. Noen forventer svar i kveld
4. Du vurderer om jobben passer deg

Dag 2 er ekte innhold (ikke lenger en stub) og forgrenes på dag 1 via
`conditions` — se §5b. Morgenen leser identitetsvalget fra kvelden,
formiddagen leser skolevei-trådens status, kvelden leser økonomi-tråden
og pengemåleren. Dag 3+ er fortsatt uskrevet; en tom dag avsluttes
trygt.

## 10. Regelen for Civication

Civication er ikke et mailspill. Civication er et livsfortellingsspill
der hver stilling er en arbeidslivsfortelling, privatlivet går
parallelt, dagen er spillbrettet, scener er gameplay og valg former
livsløpet.

## 11. Civication v2 og legacy-gaten

Civication v1 (mailmotorer, next-action-lås, workday-runtime, day
progression, innboks som hovedspill) er **legacy**. Det er ikke slettet —
profile.html og Node-testene bruker fortsatt filene direkte — men det
styrer ikke lenger spillet.

Hovedflyten i `Civication.html` laster nøyaktig dette, i denne rekkefølgen:

```
js/Civication/civicationV2Config.js        # setter CIVICATION_LEGACY_ENABLED
js/Civication/core/CivicationStorageAdapter.js
js/Civication/core/civicationJsonStore.js
js/Civication/lifestory/lifestoryContent.js
js/Civication/lifestory/lifestoryState.js
js/Civication/lifestory/lifestoryRunner.js
js/Civication/ui/CivicationLifestoryUI.js
js/Civication/civicationLegacyLoader.js    # bærer hele v1-kjeden, inert som standard
```

Rekkefølgen og allowlisten håndheves av
`tests/civication-v2-main-flow.test.js` — nye script-tags i
Civication.html er et arkitekturvalg, ikke en drive-by.

Hele den gamle scriptkjeden (122 filer, inkl. `CivicationBoot.js` sist)
ligger som en ordnet liste i `js/Civication/civicationLegacyLoader.js` og
injiseres KUN når `window.CIVICATION_LEGACY_ENABLED === true`. Gamle
seksjoner i Civication.html (dashboard, innboks, arbeidsdag, kart,
kapital, …) er merket `data-civi-legacy hidden` og vises bare av
legacy-loaderen.

Legacy slås på eksplisitt, aldri implisitt:

- URL: `Civication.html?civicationLegacy=1`
- localStorage: `civication_legacy_enabled = "1"`
  (`CivicationV2Config.enableLegacy()` / `disableLegacy()` i konsollen)

Reglene fremover:

- Nye fortellinger bygges som **data** i `data/Civication/lifestory/`,
  aldri som nye engines.
- Innboks er arkiv/bakgrunn, ikke primær gameplay.
- Ingen nye scripts i v2-hovedflyten uten at dette dokumentet og
  main-flow-testen oppdateres samtidig.
- Neste ryddesteg (senere): gjenbruk rent eller slett v1-moduler — men
  først når profile.html og testene ikke lenger avhenger av dem.
