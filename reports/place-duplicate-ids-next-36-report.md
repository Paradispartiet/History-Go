# Place duplicate IDs – neste 36

## 1) Kort status

Etter første lavrisiko-opprydding ble `data/places/places_by_22_with_quiz_profiles_v2_refined.json` flyttet ut av toppnivå `data/places/` og inn i `data/places/arkiv/`. Det reduserte top-level duplicate IDs fra **82** til **36**.

Denne rapporten kategoriserer de **36 gjenværende duplicate place IDs**. Rapporten gjør ingen dataendringer.

## 2) Avgrensning

Denne rapporten gjelder bare gjenværende duplikater i top-level `data/places/*.json` etter batch 1.

Ikke endret i denne jobben:

- `data/places/*.json`
- `js/boot.js`
- `data/places/manifest.json`
- i18n-filer
- quizdata
- kartlogikk
- unlock/progresjon
- CSS/runtime

## 3) Hovedmønstre

De 36 gjenværende duplikatene faller i fire grupper:

1. `oslo_places.json` dupliserer temafiler.
2. Ekte semantiske fler-kategori-steder.
3. Steder som bør få ny ID hvis de skal eksistere i flere faglige kontekster.
4. Steder der `oslo_places.json` sannsynligvis bør arkiveres eller ekskluderes fra aktiv/top-level duplicate-scan.

## 4) Gruppe A – oslo_places.json-duplikater mot temafiler

Dette er steder der `oslo_places.json` har samme ID som en mer spesifikk temafil. I de fleste tilfeller er temafilen den mest autoritative aktive kilden, fordi appens kategoristruktur er bygd rundt egne filer som `places_litteratur.json`, `places_historie.json`, `places_vitenskap.json` og `places_subkultur.json`.

Anbefaling: ikke rett én og én først. Avklar heller om `oslo_places.json` fortsatt skal ligge som top-level aktiv kilde. Hvis filen er eldre samlefil/backuplignende kilde, bør den flyttes til arkiv eller ekskluderes fra top-level dataskanning.

| ID | Forekomster | Foreløpig vurdering |
|---|---|---|
| `alexander_kiellands_plass` | `oslo_places.json` + `places_litteratur.json` | behold temafil, vurder arkiv for `oslo_places.json` |
| `alf_proysen_statue_nittedal` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `camilla_collett_statue` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `deichman_grunerlokka` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `eldorado_bokhandel` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `gamle_deichman` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `gamle_trikkestallen` | `oslo_places.json` + `places_historie.json` | behold temafil |
| `grotta` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `henrik_wergeland_statue` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `ibsen_quotes` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `inger_hagerups_plass` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `kulturkirken_jakob_litteratur` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `litteraturhuset` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `nasjonalbiblioteket` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `nationaltheatret` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `nobelinstituttet` | `oslo_places.json` + `places_historie.json` | sjekk kategori: vitenskap i begge forekomster, men ligger i historiefil |
| `norli_universitetsgata` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `oscar_braaten_statuen` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `proysenhuset_rudshogda` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `ruth_maier_minne` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `sigrid_undset_statue` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `slottet` | `oslo_places.json` + `places_historie.json` | behold temafil |
| `sofienberg_kirke` | `oslo_places.json` + `places_historie.json` | behold temafil |
| `sofienbergparken_subkultur` | `oslo_places.json` + `places_subkultur.json` | behold temafil |
| `tronsmo_bokhandel` | `oslo_places.json` + `places_litteratur.json` | behold temafil |
| `tvergastein` | `oslo_places.json` + `places_vitenskap.json` | behold temafil |
| `universitetets_gamle_hovedbygning` | `oslo_places.json` + `places_vitenskap.json` | behold temafil |
| `universitetets_gamle_kjemi` | `oslo_places.json` + `places_vitenskap.json` | behold temafil |

Antall i gruppe A: **28**.

## 5) Gruppe B – ekte semantiske fler-kategori-steder

Disse stedene har reell faglig dobbelthet. Det betyr ikke nødvendigvis at de skal ha samme place-ID i flere filer. Hvis samme fysiske sted skal brukes i flere faglige perspektiver, må vi velge én av to modeller:

1. Én master-place med én ID, og faglige koblinger via `emne_ids`, relations, quizzes eller overlays.
2. Flere kontekstspesifikke place-IDs, der ID-en viser faglig perspektiv, f.eks. `barcode_by` og `barcode_kunst`.

| ID | Forekomster | Problem | Mulig løsning |
|---|---|---|---|
| `barcode` | `places_by.json` + `places_kunst.json` | byutvikling vs arkitektur/kunstperspektiv | vurder `barcode_by` / `barcode_kunst`, eller én master i by med kunstkobling |
| `damstredet_telthusbakken` | `places_by.json` + `places_historie.json` | historisk trehusmiljø vs by-/arkitekturperspektiv | sannsynlig én master + flere emner, eller `damstredet_telthusbakken_historie` |
| `deichman_bjorvika` | `oslo_places.json` + `places_by.json` + `places_litteratur.json` | bytransformasjon vs bibliotek/litteraturinstitusjon | behold én fysisk master, eller splitt `deichman_bjorvika_by` / `deichman_bjorvika_litteratur` |
| `tjuvholmen` | `places_by.json` + `places_kunst.json` | byutvikling/eiendom vs kunst/byrom | vurder én master + kunstkobling, eller egne kontekst-ID-er |
| `ullevål_hageby` | `oslo_places.json` + `places_by.json` + `places_litteratur.json` | byplanlegging vs litterær kobling | behold by-master, legg litteratur som relation/overlay, eller ny litteratur-ID |
| `var_frelsers_gravlund` | `oslo_places.json` + `places_historie.json` + `places_litteratur.json` | gravlund som historisk minnested og litterær kanon | sannsynlig én master + sterke person/litteratur-relasjoner |
| `vigelandsparken` | `places_by.json` + `places_kunst.json` | park/byrom vs kunstverk/skulpturanlegg | vurder om kunstfilen skal være autoritativ, eller byfilen med kunst-emner |
| `voienvolden` | `oslo_places.json` + `places_by.json` + `places_litteratur.json` | historisk gård/bystruktur vs litterær kobling | én master + litteraturrelation, eller separate fag-ID-er |

Antall i gruppe B: **8**.

## 6) Gruppe C – steder som bør få ny ID hvis de skal finnes i flere faglige kontekster

Dette gjelder særlig steder der samme fysiske objekt brukes som ulikt faglig case. Hvis appen skal kunne gi flere ulike quizløp, badges eller fagkort for samme sted, bør ID-en være unik per kontekst.

Kandidater for ny ID:

- `barcode` → `barcode_by` / `barcode_kunst`
- `deichman_bjorvika` → `deichman_bjorvika_by` / `deichman_bjorvika_litteratur`
- `tjuvholmen` → `tjuvholmen_by` / `tjuvholmen_kunst`
- `vigelandsparken` → `vigelandsparken_by` / `vigelandsparken_kunst`
- `ullevål_hageby` → `ullevål_hageby_by` / `ullevål_hageby_litteratur`
- `voienvolden` → `voienvolden_by` / `voienvolden_litteratur`

Dette må ikke gjøres automatisk. Nye ID-er påvirker relations, quiz, i18n, visited/unlock og eventuelle Wonderkammer-koblinger.

## 7) Gruppe D – oslo_places.json bør trolig arkiveres/ekskluderes

`oslo_places.json` står for de fleste gjenværende duplikatene. Før vi retter enkeltobjekter, bør vi avklare om filen er aktiv kilde eller eldre samlefil.

Hvis `oslo_places.json` ikke er referert av `data/places/manifest.json` eller `js/boot.js`, er tryggeste neste PR å flytte den til:

`data/places/arkiv/oslo_places.json`

Da vil top-level duplicate-scan sannsynligvis reduseres kraftig uten å endre aktiv runtime-data.

Viktig: dette må verifiseres før flytting.

## 8) Risiko for i18n/sourceHash

Duplicate IDs påvirker i18n fordi `data/i18n/content/places/{lang}.json` bruker place-ID som nøkkel.

Hvis samme ID finnes i flere norske masterobjekter, kan `_sourceHash` bli beregnet fra feil forekomst eller fra første forekomst i fallback/scan-rekkefølge. Dette kan gi:

- feil stale-status
- oversettelse basert på feil norsk tekst
- feil `name`, `desc` eller `popupDesc` i valgt språk
- uklar fallback hvis en ID finnes i flere kategorier

Derfor bør duplicate-opprydding prioriteres før store oversettelsesbatcher.

## 9) Neste trygge PR

Neste tryggeste PR bør ikke rette semantiske fler-kategori-steder først. Den bør først avklare `oslo_places.json`.

Forslag til neste PR:

1. Verifiser at `data/places/oslo_places.json` ikke er i `data/places/manifest.json`.
2. Verifiser at `data/places/oslo_places.json` ikke er i `PLACE_FILES_FALLBACK` i `js/boot.js`.
3. Søk etter alle runtime-/datareferanser til `oslo_places.json`.
4. Hvis filen ikke er aktiv: flytt den til `data/places/arkiv/oslo_places.json`.
5. Kjør duplicate-scan på top-level `data/places/*.json` på nytt.
6. Opprett rapport `reports/place-duplicate-cleanup-batch-2.md`.

Forventet effekt:

- De fleste gruppe A-duplikater forsvinner.
- Semantiske fler-kategori-duplikater i gruppe B blir stående igjen for manuell modellbeslutning.

## 10) Ikke gjør ennå

Ikke gjør dette i neste PR:

- ikke slett temafiler
- ikke endre place IDs
- ikke flytt objekter mellom kategorier
- ikke endre quiz/relation/i18n-koblinger
- ikke forsøk å løse `barcode`, `vigelandsparken`, `deichman_bjorvika`, `var_frelsers_gravlund` automatisk

Dette krever egen modellbeslutning per sted.
