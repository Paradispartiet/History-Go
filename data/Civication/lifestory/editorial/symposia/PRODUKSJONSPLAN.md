# Civication – produksjonsplan for rollebaserte livsfortellinger

**Dato:** 12.10.2026  
**Omfang:** formelle jobbroller, livsposisjoner, redaksjonelle symposier, samtlige eksisterende fortsettelser og People-koblinger.  
**Viktig:** Dette er en produksjonsplan. `main` og runtime endres ikke ved å opprette planfiler.

## Prinsipp og prioritet

Spilleren er alltid den handlende hovedpersonen. Jobbrollen bestemmer arbeidshverdagen og de relevante arbeidskonfliktene. Aktivt valgt livsposisjon bestemmer den frivillige livsfortellingens kontekst. Civication-bipersoner er fiktive, har egne motiver og opprettholder stabile relasjoner. History Go People brukes som dokumenterte personer/kilder og deltar ikke automatisk i fiktive hendelser.

**Kildehierarki:** (1) aktiv spillerrolle og tidligere valg, (2) kanoniske rollefiler/fortsettelser, (3) rollenes verdener og narrative streams, (4) litterære dramaturgiske spor, (5) kuratert og dokumentert History Go-fagstoff. Et litterært plott kan aldri oppheve etablerte scener, spillerens autonomi eller fakta.

## Produksjonsskjema for hvert rollesymposium

| Felt | Produksjonskrav |
|---|---|
| Identitet | Kanonisk role_id / role_scope, om jobbrolle eller livsposisjon, selvvalgt/aktivert-status, badge-krav |
| Premiss | Hvilket liv spilleren faktisk lever i denne rollen |
| Dramaturgi | Hovedspørsmål, konkret konflikt, åpning, vendepunkt, eskalering, konsekvens, mulig etterspill |
| Litteratur | Hovedspor L01–L24, grunnplott P01–P07 og samtidstype C01–C24, med begrunnelse i rollen |
| Scener | Dag, fase, tittel, scene-ID, reelle valg, betingelser, avsender, sted, historie- og kildegrunnlag |
| Spillmekanikk | Reelle valgeffekter, målere, relasjoner, flagg, tråder og avslutningskriterier – uten konstruerte belønninger |
| Bipersoner | Navneromsatt stabil ID, navn/alias, karakterdriv, makt, egen motivasjon, hemmeligheter, relasjonsfølge |
| People | Eget faktareferansefelt: kanonisk ID, faglig rolle, dokumentert kilde, hvor det brukes. Aldri fiktiv casting |
| Sammenheng | Forrige kapittel, forrige valg, tidligere løfter, sosiale konsekvenser og utslag på senere dag |
| Godkjenning | Innholdsmatch, riktig aktiv rolle, tverrrolle-gate, fortsatt spillbar handling, ingen arkivmigrering uten test |

## Gjennomført registerføring

| Innhold | Dokument | Omfang |
|---|---|---:|
| Formelle jobb- og systemroller | `formalRolesV1.json` | 15 |
| Selvvalgte livsposisjoner | `lifePositions01V1.json` + `lifePositions02V1.json` | 21 |
| Dokumenterte kapittelsymposier | `chapters01V1.json` + `chapters02V1.json` + `chapters03V1.json` | 45 |
| People-fagkoblinger for samtlige roller – **ingen ferdig kildegodkjent** | `historicalPeoplePlanV1.json` | 36 rader, 0 godkjente koblinger |
| Fiktive, rollespesifikke personposter | `charactersV1.json` | 110 |
| Hovedregister med rolle → kapitler → kilder | `indexV1.json` | 36 roller/posisjoner + 45 kapitler |

Disse tallene angir **redaksjonell dokumentasjonsdekning**, ikke nyutviklede spillbare kapitler. De 21 rolleverdenene har hver en sesongplan med dag- og fase-beats. Slike beater er ikke det samme som registrerte Life Story-scener.

## Åpne arbeidsstrømmer, i riktig rekkefølge

### 1. Identitet og navnerom – blokkerer videre masseproduksjon

- Etabler én dokumentert karakteridentitet pr. gjennomgående biperson, også alias/nøkkel fra lagret tilstand. Spesifiser `arbeidsledig:mira` (medmusikeren), `arbeidsledig:lea` (prosjektbyggeren) og `arbeidsledig:amir` (miljøkontakten, ny fortellerbetegnelse Arvid). Eksisterende spill-ID-er og relasjonsnøkler beholdes til migrering er testet.
- Avklar visningsnavn gjennom dag 1–34 slik at medmusikeren ikke fremstår som en tilfeldig ny Mira, prosjektbyggeren som en tilfeldig ny Lea eller miljøkontakten som en ny Arvid. Det redaksjonelle navnet må ha eksplisitt alias, ikke heuristisk navneerstatning.
- Skill navn i forskjellige rollepakker: Psykolog-pasienten «Lea» er foreløpig **ikke** samme person som arbeidsledig-sporets prosjektbygger. Kollegaen Amir i psykologrollen er ikke automatisk miljøkontakten `arbeidsledig:amir`.
- Joakim har redaksjonell oppføring, men mangler kanonisk Life Story-cast-ID. Ikke koble ham med navnelikhet alene.

**Akseptanse:** alle NPC-opptredener har gyldig identitetskobling, ingen duplikat-identitet som følge av alias/navnelikhet, og arkiv/lagrede relasjonsnøkler er bevart.

### 2. History Go People – teknisk brudd må rettes separat

Dagens `lifestoryState.bindPersonTypes` / `presentText` kan gi en samlet virkelig person rollen som fiktiv medmusiker, prosjektbygger eller miljøkontakt. Dette er uforenlig med den nye modellen, men det er **ikke endret av dokumentene**.

Neste tekniske PR må gjøre fiktiv rolleidentitet uavhengig av History Go-samlingen. Knyt deretter relevante faktakort gjennom separat `historical_person_ref` med sporbar kildestøtte og faglig relevans, uten fiktiv dialog/handling. Gammel spillerhistorikk skal vises som den faktisk ble lagret, og aldri stilltiende tilskrives andre.

**Akseptanse:** redigering av `people_collected` endrer ikke fiktiv cast, handling, relasjoner eller tidligere scenetekst; historiske fagkoblinger er eksplisitte og kildebelagte; gammel historikk er stabil.

### 3. Rollebytte og 45 kapittelkjeder

21 av de 45 kapitlene har forgjengere under en annen livsposisjon. Dette er forteller-overganger, **ikke bevis for et faktisk bytte av rolle**. `lifestoryRunner.hasContinuationRole` krever aktiv kanonisk primærlivsposisjon. Verifiser også hva som skjer når spilleren ikke vil eller ikke kan bytte: historien må stoppe/pauses forståelig uten tap av valg og uten å presentere bipersonens handlinger som spillerens nye jobb.

Gjennomspill de fem etablerte lengre rutene dag 1–34: musikk, sideprosjekt, miljø, frilanser, gründer. Verifiser første kapittel, alle overgangsdager, spesialvalg, bortfall av avtaler, senere konsekvenser, avslutninger og arkiv.

**Akseptanse:** alle registrerte 45 kapittelobjekter kan valideres mot sine kilder; alle gjennomspillbare baner består; ingen fremtidig scene omtaler en avvist handling som gjennomført.

### 4. Hullene i rollefordelingen

16 av 21 livsposisjoner har ikke dedikerte fortsettelseskapitler i Life Story. Behold deres selvstendige rolleverden/narrative stream, og produser kapitler **rolle for rolle** når identitetsmodellen og de fem eksisterende rutene er godkjent. Fortsett med forskjellige konsekvensmodeller for f.eks. flanør, psykolog, gangster, musiker og renholder; del bare generiske hverdagsrammer, ikke felles hovedfortelling.

Formelle jobbroller har egne rollepakker, men krever en særskilt kvalitetsgjennomgang av scenekjeder, ikke bare at de står på listen.

**Akseptanse:** hver påbegynte ny rolle må ha komplett selvstendig dramaturgi og dokumenterte relasjoner. Ikke generer 34 nye dager per rolle før en kort gjennomspilling har påvist kvalitet.

### 5. Publisering

Kjør redaksjonell indekskontroll, målrettede Civication Life Story-tester og relevant full Civication-regresjon. Kontroller GitHub Actions etter PR; merge først når alle påkrevde kontroller er grønne, tverrrolle-forløp fungerer og People-substitusjon ikke feilaktig presenteres som løst.

## Rollout-matrise

| Gruppe | Nåværende tilstand | Neste port |
|---|---|---|
| 15 formelle rollepakker | Kanoniske rolledata og symposier registrert | Rolle-for-rolle gameplay/konsistens |
| 5 livsposisjoner med fortsettelser | Kapitler dokumentert til dag 34 | NPC-kobling, tverrrolle og regresjon |
| 16 livsposisjoner uten Life Story-fortsettelser | Rolleverdener og dramaturgisk sesongplan | Opprett første spillbare kapittel etter kvalitetsport |
| 45 eksisterende fortsettelser | Redaksjonelt symposium pr. kapittel | Åpning/valg/konsekvens/rolle-eierskap testet |
| 110 rollelokale bipersonposter | Registerført som fiktive | Stabil ID/alias og sosial relasjonskontrakt |
| History Go People | Separat reell personkilde; seks eldre substitusjonskandidater | Selvstendig, faglig dokumentert referansebro |

