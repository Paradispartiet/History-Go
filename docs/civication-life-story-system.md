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

## 5. Day Runner

Runneren gjør bare dette:

1. Les Player State
2. Finn aktive tråder
3. Finn mulige scener for dagens fase
4. Velg beste neste scene
5. Vis scenen
6. Ta imot valg
7. Oppdater Player State
8. Lås opp nye scener
9. Gå videre i dagen

Ikke mer.

## 6. UI-modellen

Hovedskjermen er **Min dag** (`CivicationLifestoryUI`):

- **NÅ** — scenen spilleren står i, med valgene.
- **AKTIVE TRÅDER** — pågående historier.
- **KALENDER / SENERE I DAG** — det som venter i senere faser.
- **ARKIV** — tidligere valg. Innboks er ikke spillet; innboks er arkiv.

## 7. Filstruktur

```
js/Civication/lifestory/
├── lifestoryContent.js    # last + valider fortellingspakker (fail fast)
├── lifestoryState.js      # Player State: opprett, effekter, lagring
└── lifestoryRunner.js     # Day Runner (den ene motoren)

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
`module.exports`) så de kan testes rett i Node
(`tests/civication-lifestory-runner.test.js`, plukkes opp automatisk av
`npm run test:civication`).

## 8. Hva som er kassert som designmodell

Mailmotor, rollemailmotor, narrativ mailmotor, konfliktmotor, solmotor,
fase-mailmotor, inbox som hovedspill, next-action som altstyrende lås,
like svaralternativer på alle tråder, tilfeldig generering uten tråd.

De gamle motorene slettes ikke med én gang, men de styrer ikke lenger
designet. Nye fortellinger bygges som pakker i
`data/Civication/lifestory/`, aldri som nye motorer.

## 9. Pilot: Arealplanlegger, Dag 1

Piloten skal bevise én ting: kan spilleren leve én dag som
arealplanlegger, med arbeidstråder, privatliv, valg og konsekvenser?

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
