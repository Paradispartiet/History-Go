# Civication — ikke-karriere-roller og livsposisjoner

Status: **canonical klassifikasjons- og produksjonsgrense**  
Sist kontrollert: **2026-09-11**

Denne kontrakten forklarer hva Civication mener med roller som ikke er formell jobb. Den oppretter ingen ny runtime. Den samler og avgrenser lag som allerede finnes i repoet.

Maskinlesbar fasit: [`../data/Civication/nonCareerRoleTaxonomy.json`](../data/Civication/nonCareerRoleTaxonomy.json).

## 1. Hovedskillet

Civication har ikke ett flatt «rolle»-system. Følgende lag er bevisst separate:

```text
Badge-progresjon
    ↓ kan åpne
livsposisjon ──────────────┐
                           │
formell jobb               │
livsomstendigheter         │
levevei                    ├─→ spillerens samlede livskontekst
relasjoner / nettverk      │
bolig / ytelser            │
omdømme / status           │
                           │
Role World kan lese dette ─┘
```

Det betyr blant annet:

- **jobb** er en faktisk stilling/posisjon med career-kontrakt og eventuelle kvalifikasjons- eller utnevnelsesporter;
- **livsposisjon** er en selvvalgt identitet, praksis, status eller livsbane som kan eksistere med eller uten jobb;
- **livsomstendighet** er for eksempel student, arbeidssøker, pensjonist, AAP/uføretrygd eller bosituasjon;
- **levevei** er konkrete inntektsmuligheter/strømmer og er verken jobb eller identitet;
- **relasjon** er state mellom spilleren og andre mennesker;
- **roleModel** er authored fag-/rolleinnhold og er ikke automatisk en spillerrolle.

## 2. Canonical runtime-eiere

### Formell jobb

Eies av `CivicationState` gjennom `hg_active_position_v1`.

Jobbstatus må komme fra canonical career-kontrakt. Badge-poeng eller livsposisjon kan aldri alene gi ansettelse, lønn, autorisasjon, folkevalgt mandat eller lederutnevnelse.

### Livsposisjon

Eies av `CivicationLifePositions` gjennom `hg_civi_life_positions_v1`.

Runtime bygger valgbare livsposisjoner fra tre kilder:

1. effective Badge-tier `life_position` / `life_positions`, etter obligatoriske Career overlays;
2. `data/Civication/lifePositionCatalog.json`;
3. de fem alltid åpne `OPEN_LIFE_POSITIONS` i `civicationLifePositionRuntime.js`.

Badge-poeng **låser opp valg**. Spilleren må fortsatt velge posisjonen eksplisitt.

### Livsomstendigheter

Ligger i samme life-position store, men i `circumstances`:

- `activity_status`
- `benefit_status`
- `housing_status`
- `housing_choice`

Disse er kontekst, ikke egne identitetsroller.

### Relasjoner

Eies av `CivicationRelationshipEngine`. Den canonicale vennskapsstigen går fra `stranger` til `close_friend` og har egen trust/familiarity/historikk.

«Venn», «bekjent» og «nær venn» skal derfor ikke dupliseres som livsposisjoner.

### Levevei

Eies av `CivicationLivelihoods` gjennom `hg_civi_livelihood_v1`.

Levevei kan eksistere uten jobb og kan være relevant for en livsposisjon, men identiteten betaler aldri penger av seg selv.

## 3. Faktisk omfang på main

På den canonicale baselinen som denne kontrakten ble opprettet mot:

- **19 Badges**
- **274 Badge-tiers**
- **118 effective tier-baserte life_position-deskriptorer**
- **117 tiers** er eksplisitt `not_job / replace` i Badge Career Audit
- **85** posisjoner ligger i den separate Life Position Catalog
- **8** av disse er de samme Helse-/Utdanning-posisjonene som også ligger på Badge-tier og dedupliseres av runtime
- **195 unike Badge-scopede livsposisjoner**
- **5 alltid åpne livsbaner**
- dermed **200 unike valgbare livsposisjoner**

Dette tallet er **ikke** `roleModels`-tallet.

RoleModel-manifestet har **293 filer**. Scenario People-resolveren reduserer dette til **287 canonical roleModels** etter seks shadow-relasjoner. Disse filene brukes til authored rolle-/personresolusjon og kan representere work scopes, Badge-tiers, statusnivåer eller alias. De skal ikke telles som 287 spillerroller.

Career Role World-grunnlaget har fortsatt **85 ferdige karriererolleverdener**. **Supporter**, **Nabolagskjenner**, **Filmklubbmenneske** og **Sofafilosof** er nå fullførte life-position Role Worlds. Den samlede Role World-indeksen har dermed **89 verdener = 85 career + 4 life_position**.

## 4. Hvorfor 118 life_position-deskriptorer, men 117 not_job-tiers?

Historie har den viktige grensetilstanden:

`Doktorgradsstudent`

Den er samtidig:

- en employment-independent `doctoral_study_stage`;
- en mulig **separat** formell karrieremulighet;
- fail-closed uten `academic_phd_admission_or_employment`.

Dette viser hvorfor Civication ikke kan bruke et enkelt «jobb / ikke jobb»-boolean på hele Badge-tieren. En identitet eller livsfase kan sameksistere med en gated career opportunity uten at Badge-poeng eller identiteten i seg selv skaper ansettelse.

Samme hovedregel gjelder ellers når en life-position-tier har `career_unlock`: career-kontrakten er et eget lag og må bestå sin egen policy.

## 5. Overlay-regelen

Rå Badge-JSON er ikke alltid hele effective Civication-kontrakten.

Særlig Natur og Næringsliv får Career-/life-position-kontraktene gjennom obligatoriske filer under:

`data/Civication/badgeCareerContracts/`

CivicationShellBoot laster rå Badges og anvender deretter disse overlayene før career/life-runtime brukes.

En audit som bare leser `data/badges/*.json` vil derfor gi feil klassifikasjon.

## 6. Katalogposisjoner og tier-posisjoner er samme runtime-lag

`lifePositionCatalog.json` er ikke et alternativt livssystem. Runtime slår sammen:

```text
Badge tier life_position
+ Life Position Catalog
+ åpne livsvalg
→ CivicationLifePositions
→ hg_civi_life_positions_v1
```

Deduplisering skjer per `badge_id + label`.

Helse og Utdanning har til sammen åtte posisjoner både på tier og i katalog. De er derfor åtte spillerposisjoner, ikke seksten.

## 7. De fem åpne livsbanene

Følgende er alltid åpne og krever ikke Badge-poeng:

- Uteligger
- Boms
- Kriminell
- Bohem
- Nomade

De ligger bevisst i samme Life Position-runtime, ikke i en ny «fri rolle»-motor.

Der en åpen livsbane påvirker housing-context, skjer det gjennom de eksisterende circumstance-feltene.

## 8. Hva kan få en Role World?

Role World-standarden gjelder både **jobb og livsposisjon**.

Dermed kan en canonical `life_position` få en egen Role World når den faktisk har nok authored substans til å bestå samme kvalitetskontrakt:

- eget sosiologisk hovedproblem;
- sosialt miljø og recurring people grammar;
- relevante langsomme akser;
- nøyaktig 14 dager × fire dramaturgiske faser;
- primære relasjonelle tråder;
- privat etterklang;
- forsinkede konsekvenser;
- reell provenance til governed sources;
- materialisering gjennom `civication_scene_v1`;
- `no_new_runtime: true`.

Det skal **ikke** masseproduseres 200 Role Worlds bare fordi 200 livsposisjoner er valgbare.

## 9. Hva skal ikke være egne Role Worlds?

Følgende skal normalt brukes som kontekst/state i andre verdener, ikke som standalone Role World-subjekter:

- `life_circumstance`
- `relationship_state`
- `livelihood`
- `role_model` som bare authored modell
- Career Gameplay sine tre eksplisitte noncareer discovery rows

Eksempel: «uføretrygdet» er en benefit-status som kan endre hverdagen i mange Role Worlds. Den er ikke automatisk en egen identitetsrolle.

Tilsvarende er «nær venn» en relasjonsstatus mellom to personer, ikke en livsposisjon spilleren velger fra Badge-progresjon.

## 10. Produksjonsregel videre

Neste non-career Role World-arbeid skal være **readiness først, rolle-for-rolle**. Den maskinlesbare køen ligger i `data/Civication/lifePositionRoleWorldReadiness.json` og genereres av `scripts/audit-civication-life-position-role-world-readiness.mjs`.

`sport/supporter`, `by/nabolagskjenner`, `film_tv/filmklubbmenneske` og `filosofi/sofafilosof` er source-backed `ready`-posisjoner som allerede er ferdigstilt som Role Worlds. `historie/historievandrer` har nå egen governed 14-storylet narrativ dybde og er den eneste uferdige `ready`-kandidaten. Readiness-auditen bruker tre separate klasser — `ready`, `needs_authored_depth` og `not_a_standalone_world` — mens faktisk produksjonsstatus ligger separat i `role_world_status`. Fasit er nå **5 ready = 4 role_world_complete + 1 pending**, **155 needs_authored_depth** og **40 not_a_standalone_world**.


```text
canonical life_position
→ inventer eksisterende private/life/social/narrative-kilder
→ bevis eget sosiologisk problem
→ bevis faktisk provenance
→ vurder Role World-readiness
→ én kandidat per PR
→ full Role World + Scene Pipeline CI
```

Vi skal ikke:

- lage en ny NonCareerRoleEngine;
- flytte circumstances inn i lifePositionCatalog;
- gjøre relasjonstrinn til Badge-identiteter;
- bruke roleModel-antall som produksjonskø;
- gi livsposisjoner automatisk lønn eller myndighet;
- skape generiske 56-beat grids uten authored sourcegrunnlag.

Dette holder Civication som **ett livssystem med flere separate state-lag**, ikke som en samling konkurrerende rollemotorer.
