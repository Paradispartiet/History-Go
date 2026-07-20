# Civication Life Story System

Nytt fortellingssystem for Civication — tegnet som nytt system, ikke som
reparasjon av det gamle. Dette dokumentet er normativt for alt under
`js/Civication/lifestory/` og `data/Civication/lifestory/`.

**Life Story System er fortellingslaget i Civication — «Min dag».** Det er
primærpanelet, men det er ikke hele appen. `Civication.html` laster HELE
Civication-skallet som standard (kart, dashboard, nabolag, kapital, psyke,
identitet, folk, offentlig lag, rolle/arbeidsdag, innboks) med Min dag øverst
som ÉN modul i skallet. Se «Civication-skallet og Min dag» nederst.

Mail er bare én scenevisning blant flere (melding, møte, telefon, krise,
samtale …). Kart, paneler og dashboard er aktivt Civication-produkt — ikke
legacy.

## Migreringsmål: én fortellingsmotor

Life Story Runner er fremtidig eneste autoritative fortellingsmotor for
Civication-dagen. «Min dag» er derfor den normale dagflaten, og eldre
`CivicationDayPhaseUI`/day-mail-flater skal ikke opprette konkurrerende
toppaneler i normal runtime.

Mail skal migreres til en **sceneform** i Life Story Runner, ikke beholdes som
egen motor. Arbeidsliv og privatliv skal leveres som **scene packs** som mater
samme runner med scener, valg, konsekvenser og tråder.

Den gamle day/mail-runtime-kjeden (`civicationMailEngine`,
`civicationDailyMailBuilder`, `dayProgressionController`,
`civicationNextActionSelector`, `civicationWorkdayRuntime`,
`civicationPrivatePhaseMailBuilder`, `civicationWorkdayMailBuilder`) beholdes
midlertidig som migreringskilde og kompatibilitetslag. Den er ikke ønsket
sluttarkitektur og skal flyttes ut etter hvert som funksjonene blir scene packs
i Life Story.

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
- **profil**: `{ "tags": ["culture", "natur"] }` — kandidat hvis spilleren
  har MINST ÉN av taggene fra History GO-profilen (ProfileSignalBridge:
  engelske temategs som `culture`/`sport`/`nature`/`politics`/`social`/
  `subculture` + norske domenetags fra samlingen). Broen er async, så
  `lifestoryShellBridge.refreshProfileSnapshot()` holder et synkront
  snapshot (`CivicationLifestoryProfileTags`) oppdatert ved `civi:booted`
  og `updateProfile`. **Uten snapshot fyrer profilgatede scener aldri** —
  profilinnhold er bonus, og to spillere med samme rolle men ulik History
  GO-profil får ulikt privatliv.

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

Min dag viser konsekvens som spillfeedback, ikke som debug. Når spilleren tar
et valg, tar UI-et en liten før/etter-snapshot av målere og relasjoner rundt
`applyChoice`. `konsekvensTekst` vises som hovedtekst, og målbare endringer
vises som små menneskelige chips som «Psyke +2», «Energi -4» eller
«Skolekontakten +8». Rå flagg, intern JSON og tekniske tråd-id-er skal ikke
vises som hovedfeedback.

Et valg kan ha et valgfritt `konsekvensTekst` — fortellingsmessig
tilbakemelding som vises etter valget og lagres i arkivet:

```json
"konsekvensTekst": "Skolekontakten svarer raskt og sender over bilder. Plansjefen virker mindre begeistret."
```

`konsekvensTekst` **erstatter ikke** state-endringer: lov 1 og 2 gjelder
fortsatt, og et valg uten faktiske effekter er ugyldig uansett tekst.
Tom/blank tekst avvises av validatoren.

## 6. UI-modellen

Hovedskjermen er **Min dag** (`CivicationLifestoryUI`). Den er primær
gameplay-flate i Civication v2: spilleren står i én nå-scene, tar ett valg,
ser konsekvensen og går videre i dagen. Innboks er ikke gameplay; innboks er
arkiv/bakgrunn.

Min dag består av:

- **Statuslinje** — rolle, dag, fase, psyke, energi og penger, med tydelig
  «Dagen er over» når runneren har avsluttet dagen.
- **NÅ** — scenen spilleren står i, med fase-label, visningstype,
  avsender/person når det finnes, tittel, brødtekst og trådens spillstatus.
- **VALG** — store mobilvennlige knapper/kort. Tone kan vises diskret på
  knappen, men valget er hovedhandlingen.
- **KONSEKVENS** — fortellingsmessig feedback (`konsekvensTekst`) etter
  forrige valg, pluss små før/etter-chips for målere og relasjoner. Dette
  kommer fra valget og Player State-endringer, ikke fra v1-mailmotorer.
- **TRÅDPANEL** — status/oversikt, ikke en ekstra motor. Thread state vises
  med menneskelige titler og norske labels: active = Aktiv, escalated =
  Eskalert, dormant = Hvilende, completed = Fullført. Active/escalated
  prioriteres visuelt over completed/dormant.
- **KALENDER / SENERE I DAG** — enkel oversikt over kommende faser/scener
  uten å spoile brødtekst.
- **ARKIV / TIDLIGERE VALG** — siste valg og eventuell konsekvenstekst,
  kompakt nok til ikke å dominere nå-scenen.
- **DAGSOPPSUMMERING** — når dagen er over: «Dag X er over», viktige valg,
  meter-endringer siden morgenen, tråder som ble fullført/eskalert/lagt
  hvilende, kort narrativ oppsummering fra konsekvenstekst, og den tydelige
  knappen **Start neste dag**. `startNextDay` beholder arkiv/tidligere valg,
  setter riktig dag/fase og gir ny spillbar scene når dag 2 har innhold.

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
├── lifestoryRunner.js     # Day Runner: conditions, thread state, day progression
└── lifestoryShellBridge.js # énveis konsekvensbro: meter-deltaer -> skallets psyke

js/Civication/ui/
└── CivicationLifestoryUI.js  # Min dag-visningen

data/Civication/lifestory/
├── manifest.json
├── shared/
│   └── phaseDefinitions.json
├── roles/
│   ├── arealplanlegger/
│   │   ├── role.json      # kjernefantasi, personer, konflikter, endings
│   │   ├── threads.json   # arbeidstråder
│   │   └── scenes.json    # spillbare øyeblikk
│   ├── renholder/
│   │   ├── role.json
│   │   ├── threads.json
│   │   └── scenes.json
│   └── ekspeditor/
│       ├── role.json
│       ├── threads.json
│       └── scenes.json
└── life/
    ├── threads.json       # privattråder (delt av ALLE roller)
    └── scenes.json
```

**Startkontrakten — du starter arbeidsledig:** Uten jobb og uten eksplisitt
valg spiller Min dag rollen `arbeidsledig` (meldekort, søknader, dager uten
ramme — bygget på `lifeMails/arbeidsledig`-universet). Jobb kommer via den
dokumenterte kjeden (dashboardet: «Ta quiz og åpne jobbtilbud for å starte et
livsløp»): quiz/merker i History GO → jobbtilbud i skallet → aksept → Min dag
adopterer jobbens rolle automatisk. `arbeidsledig` har bevisst INGEN
`role_scope`-binding — ingen jobb mapper til den. Kontrakten håndheves av
`tests/civication-lifestory-arbeidsledig.test.js`.

**Roller velges ALDRI av spilleren — de fortjenes gjennom quiz.** Det finnes
ingen rollevelger i produktet, og det skal aldri bygges en: en velger ville
latt spilleren hoppe over hele kunnskapsmekanikken som binder Civication til
History GO. Den eneste veien til en rolle er startkontrakten over
(quiz/merker → jobbtilbud → aksept → adopsjon).

**Dev-/testverktøy (ikke produktflate):** `Civication.html?lifestoryRole=<id>`
tvinger en bestemt rolle for utvikling, innholdsarbeid og deterministiske
tester (persisteres i localStorage `civication_lifestory_role_v1`; fjern
nøkkelen for å gå tilbake til normal oppførsel). Ukjent rolle-id feiler fast i
manifest-oppslaget — ingen stille fallback. Bytte av rolle starter en ny
Player State (én lagringsplass, `civication_lifestory_v1`). Parameteren skal
aldri lenkes fra UI eller omtales som spillerfunksjon.

**Life Story → skallets psyke (konsekvensbroen):** Når spilleren tar et valg
i Min dag, skrives de faktiske meter-endringene (etter clamping) videre til
skallets psyke-motor via `lifestoryShellBridge.js`, slik at psyke-panelet og
dashboardet speiler dagens valg. Broen er bevisst smal — kun målere med
1:1-semantikk broes: `integritet` → `updateIntegrity`, `synlighet` →
`updateVisibility`, `handlingsrom` → `updateEconomicRoom` (alle clampet og
resiliens-dempet av psyke-motoren selv). **Bevisst ikke broet:** `penger`
(skallets PC-saldo eies av økonomimotoren — to skrivere ville drifte),
`psyke`/`energi` (skallets psyke er akser, ingen kanonisk motpart) og
`relasjoner` (rollens personer er fortellingspersoner, ikke skallets
people-system). Broen er énveis (leser aldri psyke tilbake), skriver ALDRI
i testmodus, og er stille no-op på rene Min dag-flater uten skall.

**Min dag på kartet (stedsmarkøren):** Byen er spillebrettet — kartet viser
hvor nå-scenen foregår. `CivicationLifestoryPlaceMarker` (shell-kjeden) leser
`CivicationLifestoryUI.getCurrentSceneInfo()` og løser sted som en ærlig
ladder: arbeidsliv-scene → arbeidsplassen (employer-bydel fra skallets aktive
posisjon når den finnes), privatliv-scene → hjemmet (valgt bydel fra
CivicationHome), dagen er over → hjemme. Forankringen gjenbruker
`CivicationCityLayer.resolveLocationAnchor` (samme projeksjon som steds-/
vennemarkørene); uten kjent bydel dokkes markøren i kartets hjørne i stedet
for å påstå en posisjon vi ikke har. Kun visning — markøren skriver aldri
state, og den oppdateres av `civi:lifestoryChanged` (dispatches nå også etter
første render), `civi:booted`, `civi:homeChanged` og karttransform-events.

**Skall-jobb → Life Story-rolle:** Uten dev-parameteren følger Min dag
skallets aktive jobb. Mappingen er canonical: skallets aktive posisjon
(`hg_active_position_v1`) → `CivicationCareerRoleResolver.resolveCareerRoleScope`
→ `role_scope`-bindingen i lifestory-manifestet
(`manifest.roles.<id>.role_scope`, f.eks. `renholder` → `renholder`,
`by_radgiver_plan` → `arealplanlegger`). Adopsjonen skjer ved `civi:booted`
og ved jobbskifte (`updateProfile`), og gjelder KUN når spilleren ikke har
valgt rolle selv — eksplisitt valg vinner alltid, og adopsjon skrives aldri
til `civication_lifestory_role_v1`. Jobb uten Life Story-pakke (f.eks.
ekspeditør i dag) endrer ingenting. Ny rolle i Life Story kobles til jobben
sin ved å sette `role_scope` i manifestet — ingen JS-endring.

**Regel for delte livsscener:** `life/`-filene deles av alle roller, så en
livsscene kan aldri referere rollespesifikke tråder eller relasjoner i
`conditions`/`effekter`. En scene som forgrenes på en rolletråd hører hjemme i
rollens egen `scenes.json` (den kan fortsatt ligge på en privatlivstråd).
Renholder-testen håndhever dette.

**Og tekstene må være livssituasjon-nøytrale:** delte scener spilles også av
arbeidsledig. Ingen delt tekst kan anta jobb, pendling, lønning, kontor eller
en bestemt rolle — og aldri hardkode beløp (startpenger varierer per rolle).
Forbudslisten håndheves av `civication-lifestory-arbeidsledig.test.js`
(«frokost, dusj, gå til jobben»-bugen skal ikke kunne komme tilbake).
Rollefarget tekst hører hjemme i rollens egne scener.

**Kvalitetskrav for delte livsscener (håndhevet av samme test):**

- Hvert valg har `konsekvensTekst` — spilleren skal alltid få fortellings-
  messig svar på det de gjorde.
- Private scener i arbeidsfasene (formiddag/ettermiddag) har prioritet ≤ 5,
  så rollescenene alltid spilles først — privatlivet fyller pausene, det
  fortrenger ikke jobben.
- **Lav psyke gir ro, aldri mer press** (arvet designregel fra det gamle
  privatmail-systemet): ro-/hvilescener gates på `meters.psyke.max`, slik at
  de tilbys når spilleren trenger dem (se `kveld_01_lande_dagen`).

**Skrivestil: konkret hverdagsspråk, ikke kvasifilosofi** (produkteierens
regel, batch 6): scener og valg skal beskrive gjenkjennelige, konkrete
handlinger — sove lenger, trene, skrive eller male på et eget prosjekt, ta
en øl på puben, lage middag av det du har, ringe søsteren din. Ikke
metaforer («sette gjerde rundt en time», «natten er det siste valget du
tar»). Valgretningene skal være realistiske modeller av ulike livsstiler,
med `data/Civication/lifestyles.json` (13 livsstiler: hipster, teknokrat,
hippie, familiemenneske, hustler, prosess-menneske, yuppie, bohem,
friluftstype, konkurransemenneske, håndverker, gjeldsspiral, nøktern
overlever) som referansekatalog: en scene med flere valg bør spenne over
flere av disse retningene (skapende, sosial/uteliv, trening/friluft,
nøktern/sparsom, ambisiøs, familie). Ting som koster penger i teksten
(pub, kjøpelunsj, bestilt middag) skal også koste `penger` i effektene.

**Livsstilsbroen (batch 7):** valg kan tagges med `livsstil: ["nightlife"]`
— tags fra vokabularet i `lifestyles.json` (låst i `LIVSSTIL_TAGS` i
`lifestoryContent.js`; ukjent tag => FAIL FAST). Ved valg sender
`CivicationLifestoryUI` taggene gjennom
`CivicationLifestoryShellBridge.applyLifestyleTagsToShell()` til skallets
`HG_Lifestyle.addTags()`, som teller dem opp i `hg_lifestyle_v1` og kårer
dominant livsstil (stamp). Dermed drar spillemønsteret i Min dag spilleren
mot en faktisk livsstil: pub-kvelder => nightlife => hipster/gjeldsspiral,
egne prosjekter => craft => håndverker/teknokrat, turene og banen =>
outdoor/fitness => friluftstype/konkurransemenneske. Samme kontrakt som
psyke-broen: énveis, testmodus skriver aldri, mangler motoren => stille
no-op. Kontrakten eies av `civication-lifestory-lifestyle-bridge.test.js`
(vokabular-sync, fail-fast, testmodus-gate, scoring-retninger).

**Visningen (batch 8):** Min dag viser stampen to steder — en «Livsstil»-chip
i statuslinjen og linjen «Valgene dine drar mot: …» i dagsoppsummeringen.
Begge leser `HG_Lifestyle.getStamp()` og vises KUN når `score > 0` — før
valgene har bygget en tydelig retning (eller uten motoren, ren Min dag-
flate) vises ingenting; vi gjetter aldri en livsstil. UI-et re-rendrer på
`updateProfile` (ren lesing — kan ikke starte event-løkke), så chipen
dukker opp når taggene er telt. Testfestet i
`civication-v2-min-dag-ui.test.js` med mocket `HG_Lifestyle`.

**Handlinger (batch 10): valg som UTFØRER noe i spillet.** Et valg kan ha
`handling: { type }` — da er valget ikke bare tekst, det utfører en ekte
spillhandling når det tas:

- `velg_bosted` → åpner Personlig-panelet der nabolagsvalget bor
  (`CivicationHome`)
- `aapne_butikk` → åpner Kommers-panelet (butikken)
- `aapne_karriere` → åpner Karriere-panelet (jobbtilbudene)
- `gaa_til_quiz` → navigerer til History GO (`index.html#/map`) — byen er
  spillbrettet, quizzene tas på stedene
- `gaa_til_byen` → samme navigasjon, for turer/trening/aktiviteter der ute
  (Fritid-panelet er foreløpig tomt — derfor går aktivitetsvalg ut i byen)
- `gaa_til_debatt` → `index.html#/debate/<id>` — krever `id`, og id-en må
  finnes i `data/debates/` (id-sync håndheves av actions-testen; f.eks.
  går «det lokale møtet» til debatten `radhusplassen_bilfri`)

Typene eies av `HANDLING_TYPES` i `lifestoryContent.js` (ukjent type =>
FAIL FAST). Utføreren er `js/Civication/ui/CivicationLifestoryActions.js`
(UI-laget — fanebytte skjer ved å klikke footer-fanen, samme vei som
spilleren selv). UI-et viser et handlingshint på valgknappen («→ åpner
butikken») og utfører handlingen ETTER at Player State er lagret, så
navigasjon aldri mister progresjon. Uten skall-DOM er fanebytte stille
no-op.

**Shell-conditions: scener gatet på sann spilltilstand.** `conditions.shell`
(nøkler i `SHELL_CONDITION_KEYS`: `harBosted`, `harJobb`) leser det synkrone
snapshotet `CivicationLifestoryShellState`, som `lifestoryShellBridge.
refreshShellStateSnapshot()` holder ved like fra `CivicationHome`/
`CivicationState` (på `civi:booted`/`updateProfile`/`civi:homeChanged`).
Uten snapshot fyrer shell-gatede scener ALDRI — samme fail-safe som profil.
Første bruk: «Du må velge et sted å bo» (dag 1) og «Fortsatt uten fast
adresse» (dag 2) fyrer kun når skallet faktisk mangler bosted, og
handlingsvalget åpner nabolagsvalget. Kontrakten eies av
`civication-lifestory-actions.test.js`.

Batch 11 utvidet handlingene: tur-/trenings-/aktivitetsvalg (`by_02_banen_frister`,
`by_01_groent_kveldslys`, `d3_ettermiddag_kroppen_vil_ut`) går ut i byen
(`gaa_til_byen`), det lokale møtet går til en ekte debatt (`gaa_til_debatt` med
id-sync mot `data/debates/`), og en ny husleiepress-scene (`husleie_01_presset`,
dag 3) fyrer kun når skallets `getRentPressure().score >= 50` — med handlingsvalg
som åpner nabolagsvalget (flytte billigere) eller karrierepanelet (mer inntekt).
Ny shell-nøkkel: `harHusleiepress`.

Batch 12 tok i bruk den siste ubrukte shell-nøkkelen, `harJobb`, til å lukke
den sentrale kontrakten (arbeidsledig → quiz → jobb): scenen
`jobb_01_du_har_jobb_naa` (dag 1 kveld, på tråden «Hvor står du i
arbeidslivet?») fyrer kun når skallet melder en aktiv stilling, og
anerkjenner øyeblikket «du har en jobb å gå til nå» — med et valg som åpner
karrierepanelet (neste steg). Den fyrer aldri for arbeidsledig (`harJobb` er
per definisjon `false` der) eller uten snapshot.

**Endings (batch 13): uka kåres en slutt.** På den siste dagen med innhold
(`CivicationLifestoryEndings.isFinalDay` — ingen scene finnes for en senere
dag) tolkes hele spillet til en av rollens `endings` — akkurat som progresjon
ellers i History GO tolkes fra evidens, aldri skrives direkte. Hver ending har
`kriterier` (målere, flagg, relasjoner, trådstatuser) med faste vekter (flagg
veier mest); høyest total vinner, og **en ending må ha minst ett flagg-treff
(et ekte valg) for å kåres** — start-målere alene skal aldri kåre en slutt.
Scorer ingen ending, brukes den ene `standard`-endingen (validatoren krever
nøyaktig én per rolle, og at kriterier peker på kjente signaler — ellers FAIL
FAST). `resolveEnding` er ren, deterministisk lesing. Forsiktig/ærlig spill
kårer en «god» slutt (Fagstolt, Faglig sterk, …), hensynsløst en hard (Usynlig
og forbigått, Politisk lydig, Mistet tilliten). UI-et viser slutten i
dagsoppsummeringen på siste dag og erstatter «Start neste dag» med «Start et
nytt liv». Modulen er ny i lastekjeden (`lifestoryEndings.js`). Kontrakten eies
av `civication-lifestory-endings.test.js`.

**Migreringskilde:** `data/Civication/privatePhaseMailFamilies/` (45 gamle
private mailer over seks døgnfaser, 22 med History GO-profilmatch) migreres
batchvis inn som livsscener. Batch 1 dekket lunsj/ettermiddag/middag-hullene
og kveldsro. Batch 2 la til `profil`-conditions i motoren og seks
profilgatede scener på tråden «Byen og deg» (kulturell omvei, grønt
kveldslys, banen, lokalmøtet, miljøet, invitasjonen) — privatlivet speiler
nå History GO-profilen. Batch 3 ga privatlivet et navngitt persongalleri:
«venn» (Jonas) og «familie» (Søsteren din) finnes i ALLE rollers `personer`
og `startState.relasjoner` (kontrakten eies av arbeidsledig-testen), de
delte venne-scenene flytter `relasjoner.venn`, og en ny familiescene
(«Hilsen hjemmefra», dag 2) flytter `relasjoner.familie` — relasjoner i
privatlivet beveger seg nå over dager i stedet for å stå stille. Batch 4
dekket søvn/helse/dagslutt-familien (den siste mailfamilien uten scener):
ny tråd «Natten og søvnen» med en to-dagers arc — dag 1-nattscenen setter
alltid `la_deg_i_tide` eller `sen_kveld`, dag 2-morgenen leser natten
(uthvilt vs tung start), og dag 2-kvelden lukker tråden med refleksjonen
«Ett øyeblikk før du sovner». I tillegg: energigated ro-scene («Kroppen
sier fra», energi ≤ 45 — ro-regelen gjelder også lav energi: aldri mer
press) og en profilgated hvile-scene på `low_energy`/`rest`-taggene.
Søvn-arc-kontrakten eies av arbeidsledig-testen. Batch 5 fullførte
mailmigreringen med de siste temaene: ny tråd «Dine egne timer»
(kalender/rutine — dag 1-morgenscenen setter nøyaktig ett av tre grenflagg,
og hver gren har sin egen dag 2-ettermiddagsscene som lukker tråden),
mat-scenene «Lunsj: hva blir det til?» (dag 2, formiddag) og «En stille
middag hjemme» (dag 2, kveld, psyke ≤ 55 — ro-regelen), og den profilgatede
morgenscenen «Ti minutter med noe du samler på»
(vitenskap/historie/litteratur-taggene) på tråden «Lysten til å lære».
Grenkontrakten (ett flagg per valg, én lukkende gren-scene per flagg) eies
av arbeidsledig-testen. **Alle de 45 gamle private mailene er nå dekket av
livsscener.** Batch 6 var en språkvask etter produkteierens tilbakemelding:
delte scener og arbeidsledig-dagen skrevet om fra abstrakt/kvasifilosofisk
til konkret hverdagsspråk (se skrivestil-regelen i §-en over), venne-kvelden
ble en pubkveld som koster penger, og arbeidsledig-ettermiddagen fikk to nye
livsstilsvalg: eget prosjekt (skrive/male/lage) og en øl på puben (som
bygger relasjonen til bekjenten — nettverket som kjenner folk). Batch 7
koblet valgene tilbake til livsstilssystemet: 41 valg tagget med
`livsstil`-tags (18 retninger i bruk), broet til skallets `HG_Lifestyle`
ved valg — se «Livsstilsbroen» i forrige seksjon. Batch 9 åpnet **dag 3**:
ny delt tråd «Uka videre» med `startDag: 3` og ubetingede morgen-/kvelds-
scener — garantien for at dag 3 aldri er en tom dag, uansett gren (motoren
avslutter en tom dag stille, så uten denne ville dag 3 «blinket forbi»).
Dag 3 leser dagene før: økonomi-purringen fyrer kun på den eskalerte
grenen (regningen som ble skjøvet unna — trådstatus er betingelsen, ingen
flagg trengs), Jonas ringer og foreslår fast torsdag, kroppen vil ut etter
tre dager, og kvelden spør hva tre dager sier om uka. Arbeidsledig får
payoff-buen: avslag på søknaden («mer dokumentert kompetanse») →
«Det du kan»-lista → merkene/kunnskapen som veien til jobb. Hver jobbrolle
har dagsplan 3 og et rolleanker på en levende rolletråd (Sindre og rom 204,
stamkundens prismatch, utbyggeren som vil ha muntlig ja). Kontrakten
(«dag 3 er aldri tom, for noen rolle, på noen gren») eies av
`civication-lifestory-day3.test.js`. Gjenstår: dag 4+ etter samme mønster,
og `endings`-feltet i rollepakkene er fortsatt ubrukt av motoren — en
naturlig kandidat når en uke er spillbar.

Alle kjernefilene er DOM-frie og har dobbel eksport (window-global +
`module.exports`) så de kan testes rett i Node. Testene plukkes opp
automatisk av `npm run test:civication`:

- `tests/civication-lifestory-runner.test.js` — de fire lovene + hel dag
  1 morgen→kveld.
- `tests/civication-lifestory-engine.test.js` — conditions, thread state,
  day progression, konsekvenstekst.
- `tests/civication-lifestory-renholder.test.js` — rolle nummer to: hele
  dag 1 + begge dag-2-grener, rolle-agnostiske livsscener, dev-parameteren.
- `tests/civication-lifestory-ekspeditor.test.js` — rolle nummer tre: hele
  dag 1 + begge dag-2-grener (lukkingen/kassadifferansen), jobb-binding.
- `tests/civication-lifestory-shell-role-bridge.test.js` — skall-jobb →
  Life Story-rolle: manifest-bindinger, canonical resolver ende-til-ende,
  JSDOM-adopsjon ved civi:booted, eksplisitt valg vinner.
- `tests/civication-lifestory-shell-psyche-bridge.test.js` — Life Story →
  skallets psyke: mapping, testmodus-gate, no-op uten skall, UI-kontrakt.
- `tests/civication-lifestory-place-marker.test.js` — Min dag på kartet:
  steds-ladder, dokket fallback, UI-/loader-kontrakter.
- `tests/civication-v2-main-flow.test.js` — v2-allowlist + legacy-gate.
- `tests/civication-v2-min-dag-ui.test.js` — Min dag i JSDOM inkl. neste dag.

## 8. Hva som er kassert som designmodell

Mailmotor, rollemailmotor, narrativ mailmotor, konfliktmotor, solmotor,
fase-mailmotor, inbox som hovedspill, next-action som altstyrende lås,
like svaralternativer på alle tråder, tilfeldig generering uten tråd.

De gamle motorene slettes ikke med én gang, men de styrer ikke lenger
designet. Nye fortellinger bygges som pakker i
`data/Civication/lifestory/`, aldri som nye motorer.

## 9. Rollene: Arealplanlegger, Renholder og Ekspeditør, Dag 1 og Dag 2

Piloten (Arealplanlegger) beviser at spilleren kan leve dager med
arbeidstråder, privatliv, valg og konsekvenser — og at dag 2 leser dag 1.
Renholder og Ekspeditør er rolle to og tre og beviser at en ny rolle er
**ren data**: samme runner, samme livsscener, null ny motorkode.

Arealplanlegger — arbeidstråder dag 1:

1. Skoleveien bak parkeringskjelleren
2. Den lange nabomailen
3. Hva er egentlig politisk valg?
4. Utbygger vil ha rask avklaring
5. Plansjefen vil unngå merarbeid

Renholder — arbeidstråder dag 1 (fra FWG-konfliktene i
`workGrammars/naeringsliv/renholder.json`):

1. Rommet som så rent ut (synlig rent vs hygienisk rent)
2. Tidsvinduet krymper (tempo vs grundighet)
3. Sølet i fellesarealet (lite avvik vs HMS/driftsproblem)
4. Ryggen sier fra (kroppens grenser vs produksjonspress)
5. Det usynlige arbeidet (verdighet vs lav status)

Personene er rollens actor-grammatikk: Kari (driftsleder), Amina (erfaren
renholder), Sindre (kontorbruker), Ole (verneombud).

Ekspeditør — arbeidstråder dag 1 (fra mail-familienes univers i
`mailFamilies/naeringsliv/job/ekspeditor_job.json` og mailplanens arc):

1. Prisfeilen i køen (tempo vs nøyaktighet)
2. Kunden som tror du bestemmer (forventning vs fullmakt)
3. Vikaren spør midt i køen (opplæringsansvar vs egen kø)
4. Varen som ikke finnes (love for mye vs si sannheten om lageret)
5. Lukkingen (bli fort ferdig vs standard for neste skift)

Personene er mail-familienes faste cast: Lene (butikksjef), Amir (erfaren
kollega), vikaren og stamkunden.

**Trådlivssyklus-regel (lærdom fra Ekspeditør):** bare `active`/`escalated`
tråder gir kandidatscener. Et dag-1-valg som setter tråden `completed`
blokkerer dermed trådens egne dag-2-scener. Har en tråd innhold på dag 2,
skal dag-1-valgene holde den spillbar (`stepDelta`/`escalated`) og la
dag-2-scenene lukke den.

Privattråder dag 1 (delt av alle roller):

1. Du har sovet dårlig
2. Økonomien er stram
3. Noen forventer svar i kveld
4. Hvor står du i arbeidslivet?
5. Kroppen og kreftene (måltider, pauser, ro — migrert fra privatfase-mailene)
6. Folkene rundt deg (venner/nærhet — migrert)
7. Lysten til å lære (migrert)

Dag 2 er ekte innhold og forgrenes på dag 1 via `conditions` — se §5b.
Arealplanlegger: morgenen leser identitetsvalget fra kvelden, formiddagen
skolevei-trådens status, kvelden økonomi-tråden og pengemåleren.
Renholder: morgenen leser om avviket ble meldt (vernerunde vs «noen skled
nesten»), formiddagen om du tok det ekstra rommet, kvelden om det usynlige
arbeidet eskalerte. Ekspeditør: morgenen leser lukkingen (ros vs rotet som
ventet), formiddagen om du hjalp vikaren, kvelden om den bøyde returregelen
ble en kassadifferanse. Dag 3+ er uskrevet; en tom dag avsluttes trygt.

## 10. Regelen for Civication

Civication er ikke et mailspill. Civication er et livsfortellingsspill
der hver stilling er en arbeidslivsfortelling, privatlivet går
parallelt, dagen er spillbrettet, scener er gameplay og valg former
livsløpet.

## 11. Civication-skallet og Min dag

Civication-skallet — kart, dashboard, nabolag, kapital, psyke, identitet,
folk, offentlig lag, rolle/arbeidsdag og innboks — er **hovedproduktet** og
lastes som standard. Min dag (Life Story) er **primærpanelet**, men eier ikke
siden alene. Innboks/mail er ett panel blant mange, ikke hovedspillet.

> **Historikk:** En tidligere v2-rydding gjorde Min dag til eneste standard-
> visning og gjemte hele skallet bak `data-civi-legacy hidden`. Det var en
> arkitekturfeil: Min dag skulle være én flate inne i skallet, ikke erstatte
> det. Skallet er nå hentet ut av «legacy-buret» og er igjen standard.

`Civication.html` laster to ting:

**1. Min dag-modulen** (statiske script-tags, rendrer primærpanelet raskt og
uavhengig av resten av skallet):

```
js/Civication/civicationV2Config.js        # setter debug-flagget (canvas/3D)
js/Civication/core/CivicationStorageAdapter.js
js/Civication/core/civicationJsonStore.js
js/Civication/lifestory/lifestoryContent.js
js/Civication/lifestory/lifestoryState.js
js/Civication/lifestory/lifestoryRunner.js
js/Civication/ui/CivicationLifestoryUI.js
```

**2. Skallet**, via shell-loaderen (siste script-tag):

```
js/Civication/civicationShellLoader.js     # injiserer produkt-skallet, vekker shell-boot, laster day/mail etterpå
```

Shell-loaderen er delt i tre ordnede lister: `SHELL_SCRIPTS` for produkt-skallet
(kart, dashboard, kapital, psyke, identitet, hjem, folk, offentlig lag, butikk,
rollepanel, footer/panelnavigasjon og empty states), `DAY_SCRIPTS` for day/mail/
workday/innboks-logikk, og `LEGACY_DEBUG_SCRIPTS` for eksplisitt full debug.
Den injiserer `SHELL_SCRIPTS` så snart shell-DOM-en finnes (`#civiMapWorld`),
vekker shell-boot først, og laster/starter deretter day/mail-laget med egen
feilisolering. Rene Min dag-flater/enhetstester uten shell-DOM drar ikke inn
skallet. Rekkefølgen og allowlisten håndheves av `tests/civication-v2-main-flow.test.js`.

Skallseksjonene i Civication.html er **synlige som standard** — de er ikke
merket `data-civi-legacy` lenger. De er aktivt produkt.

**Full gammel/debug-modus er eksplisitt.** Debug-bryteren slår på de TUNGE,
eksperimentelle canvas/3D-kart-rendrerne og historiske debugpaneler. De er av som standard (skallet bruker det
komplette SVG-kartet i `CivicationMap`) og slås kun på eksplisitt:

- URL: `Civication.html?civicationLegacy=1`
- localStorage: `civication_legacy_enabled = "1"`
  (`CivicationV2Config.enableLegacy()` / `disableLegacy()` i konsollen)

Reglene fremover:

- Nye fortellinger bygges som **data** i `data/Civication/lifestory/`,
  aldri som nye engines.
- Innboks er arkiv/bakgrunn, ikke primær gameplay. Skallet viser robuste tomme
  panelstates som standard; day/mail-laget fyller innholdet etterpå og kan ikke
  velte skallet.
- Ingen nye statiske script-tags i Civication.html uten at dette dokumentet og
  main-flow-testen oppdateres samtidig.
- Boot er nå delt i to lag (se under). Mail/dag kan ikke lenger velte skallet.

### Boot-splitten: skall-boot vs. dag-/life-story-boot

`CivicationBoot` er en **tynn koordinator**, ikke lenger én stor orkestrator:

1. **`CivicationShellBoot`** — selve produktet/skallet: data (badges/careers),
   økonomi-tick, career-role-resolver og `CivicationUI.init()` (kart, dashboard,
   nabolag/kapital, psyke, identitet, hjem, offentlig feed, aktiv rolle, folk,
   butikk, track-HUD, footer, empty states). Kjøres **først** og skal **alltid**
   kunne starte.
2. **`CivicationDayBoot`** — dag-/fortellingslaget: hendelsesmotoren
   (`HG_CiviEngine`), rolle-modell-runtime, blokkerte jobbmeldinger, forpliktelser
   og `onAppOpen()` (bygger dagens mail-/innboks-scener). Kjøres **etterpå**, er
   **inert** uten dag-DOM (`#civiInboxSection`), og en feil her velter **aldri**
   skallet (egen try/catch, ingen boot-error-boks).

Mail/innboks/arbeidsdag er paneler inne i skallet, som skallet rendrer med empty
states og dag-laget fyller etterpå via `updateProfile`. Min dag (Life Story) er en
egen, uavhengig modul (`CivicationLifestoryUI`) og bootes ikke fra `CivicationBoot`.
Ansvarsdelingen er dekket av `tests/civication-boot-split.test.js`. `HG_CiviDebug`
(konsoll-diagnostikk) ligger fortsatt i `CivicationBoot.js`.
