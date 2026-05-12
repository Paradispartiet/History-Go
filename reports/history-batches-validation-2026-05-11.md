# Validering: historie-batcher 2026-05-11

Denne rapporten gjelder de nye historie-batchene som er lagt inn som egne filer, ikke direkte merget inn i hovedfilene.

## Filer kontrollert

- `data/people/people_historie_next_batch_01.json`
- `data/people/people_historie_next_batch_02_normalized.json`
- `data/people/people_historie_next_batch_03_normalized.json`
- `data/people/people_historie_next_batch_02.json` — erstattet av normalisert batch
- `data/people/people_historie_next_batch_03.json` — erstattet av normalisert batch
- `data/places/historie/oslo/places_historie_next_batch_middelalder_01.json`
- `data/places/historie/oslo/places_historie_next_batch_middelalder_02.json`
- `data/places/historie/oslo/places_historie_next_batch_ruth_maier_01.json`
- `data/places/historie/oslo/places_historie_next_batch_tidlig_moderne_01.json`
- `data/places/historie/oslo/places_historie_next_batch_straff_sosial_01.json`
- `data/leksikon/places/oslo/historie/leksikon_oslo_historie_underpunkter_next_batch_01.json`

## Status

Batchene er lagt inn som separate arbeidsfiler. De er derfor ikke aktive i appen før de enten:

1. merges inn i hovedfilene, eller
2. legges til i relevant manifest/loader dersom batchfiler skal lastes direkte.

Anbefalt løsning er vanlig merge inn i hovedfilene etter kontroll.

## Viktig normalisering etter underpunkt-avgjørelse

Følgende steder skal foreløpig ikke behandles som aktive `placeId`-er for people:

- `mariakirken`
- `clemenskirken`
- `hallvardskatedralen`
- `bispeborgen`
- `kongsgarden_middelalder_oslo`
- `korskirken`
- `olavsklosteret`
- `anatomigarden`

Disse ligger nå som underpunkter i:

`data/leksikon/places/oslo/historie/leksikon_oslo_historie_underpunkter_next_batch_01.json`

People-batch 02 og 03 er derfor normalisert slik at `placeId` og `places[]` peker til aktive hovedsteder som:

- `middelalder_oslo`
- `oslo_domkirke`
- `akerhus_slott`

De gamle filene `people_historie_next_batch_02.json` og `people_historie_next_batch_03.json` skal ikke brukes videre uten denne normaliseringen.

## Nye place-ID-er i middelalderbatch 01

Følgende nye steder ligger i:

`data/places/historie/oslo/places_historie_next_batch_middelalder_01.json`

- `nonneseter_kloster`
- `mariakirken`
- `clemenskirken`
- `hallvardskatedralen`
- `bispeborgen`
- `kongsgarden_middelalder_oslo`

### Aktiv merge-status

Kun `nonneseter_kloster` bør vurderes som eget place i første aktive merge.

De øvrige i denne batchen bør foreløpig flyttes/holdes som underpunkter under `middelalder_oslo`.

### Før merge

`nonneseter_kloster` må koordinatsjekkes visuelt før `coordStatus` endres til `verified`.

## Nye place-ID-er i middelalderbatch 02

Følgende nye steder ligger i:

`data/places/historie/oslo/places_historie_next_batch_middelalder_02.json`

- `olavsklosteret`
- `korskirken`
- `oslo_ladegard`

### Aktiv merge-status

Kun `oslo_ladegard` bør vurderes som eget place i første aktive merge.

`olavsklosteret` bør foreløpig være underpunkt under `oslo_ladegard` eller `middelalder_oslo`.

`korskirken` bør foreløpig være underpunkt under `middelalder_oslo`.

### Før merge

`oslo_ladegard` må koordinatsjekkes visuelt før `coordStatus` endres til `verified`.

## Tidlig moderne / sosialhistorisk place-batch

Følgende nye steder ligger i:

`data/places/historie/oslo/places_historie_next_batch_tidlig_moderne_01.json`

- `gamle_radhus`
- `galgeberg`
- `oslo_hospital`
- `tukthuset`

### Aktiv merge-status

Bør vurderes som egne places i første aktive merge:

- `gamle_radhus`
- `galgeberg`
- `oslo_hospital`

Avvent:

- `tukthuset`

`tukthuset` må ha mer presis stedsavklaring før aktiv merge.

### Før merge

Koordinater må kontrolleres visuelt før `coordStatus` endres til `verified`.

## Straff og sosialhistorisk place-batch

Følgende nye steder ligger i:

`data/places/historie/oslo/places_historie_next_batch_straff_sosial_01.json`

- `botsfengselet`
- `prinds_christian_augusts_minde`
- `anatomigarden`

### Aktiv merge-status

Bør vurderes som egne places i første aktive merge:

- `botsfengselet`
- `prinds_christian_augusts_minde`

Bør holdes som underpunkt:

- `anatomigarden` under `christiania_torv`

`akershus_slaveri` er fjernet som egen place. Fengsels-/slaverihistorien på Akershus skal eventuelt behandles som leksikon-, Wonderkammer- eller underinnhold under `akerhus_slott`, ikke som eget kartpunkt.

### Før merge

Koordinater må kontrolleres visuelt før `coordStatus` endres til `verified`.

## Ruth Maier-place

Følgende sted ligger i:

`data/places/historie/oslo/places_historie_next_batch_ruth_maier_01.json`

- `ruth_maier_minne`

### Aktiv merge-status

Bør vurderes som eget place i første aktive merge.

`ruth_maier_minne` er faglig et historie-/minnested, ikke et litteratursted. Stedet er knyttet til Ruth Maiers plass, Dalsbergstien 3, snublestein, Holocaust, deportasjonen av norske jøder og dagbokhistorie.

### Før merge

Koordinaten bør kontrolleres visuelt på kart før `coordStatus` endres til `verified`.

## People-batch 01

Filen:

`data/people/people_historie_next_batch_01.json`

Inneholder:

- `petter_moen`
- `ruth_maier`
- `biskop_nikolas_arnason`
- `eufemia_av_rugen`
- `hakon_vi_magnusson`
- `margrete_valdemarsdatter`
- `sigurd_jorsalfare`
- `kong_olav_kyrre`
- `peder_clausson_friis`

### Status

Batchen er ryddet for dobbeltføring: `dronning_margrete` ble fjernet fordi den dupliserte `margrete_valdemarsdatter`.

`ruth_maier` skal beholdes som historieperson. Hvis Ruth Maier finnes i litteraturdata fra før, er det en kategoriseringsfeil eller en krysskategorisering som må ryddes senere. Hun bør ha historie som hovedkategori fordi den sentrale appfunksjonen hennes er Holocaust, okkupasjon, deportasjon, minne og dagbok som historisk kilde.

### Koblingsstatus

Trygge eksisterende ankersteder:

- `middelalder_oslo`
- `oslo_domkirke`
- `akerhus_slott`
- `oslo_radhus`

Koblinger som bør sjekkes før merge:

- `mollergata_19` brukt av `petter_moen`
- `christiania_torv` brukt av `peder_clausson_friis`

Koblinger dekket av nye batch-steder:

- `ruth_maier_minne` brukt av `ruth_maier`

### Anbefaling

- `petter_moen` bør merges når `mollergata_19` er bekreftet som aktiv place-ID.
- `ruth_maier` kan merges etter at `ruth_maier_minne` er merget eller lastes aktivt.
- Hvis `ruth_maier` allerede finnes i `people_litteratur.json`, bør hun flyttes/normaliseres til historie eller beholdes ett sted med tydelig historie-hovedkategori og eventuell litteraturtag.
- Middelalderpersonene i batchen kan i hovedsak merges etter at hovedfilen tåler trygg innliming.

## People-batch 02 normalisert

Filen:

`data/people/people_historie_next_batch_02_normalized.json`

Inneholder:

- `astrid_olavsdatter`
- `magnus_den_gode`
- `magnus_lagabote`
- `gunnhild_kongsmor`
- `sigurd_ribbung`
- `alv_erlingsson`

### Koblingsstatus

Alle `placeId` og `places[]` er normalisert til aktive hovedsteder:

- `middelalder_oslo`
- `oslo_domkirke`
- `akerhus_slott`

Underpunkter som `bispeborgen` og `kongsgarden_middelalder_oslo` er fjernet fra `places[]` og omtalt i tekst/leksikon i stedet.

## People-batch 03 normalisert

Filen:

`data/people/people_historie_next_batch_03_normalized.json`

Inneholder:

- `ingebjorg_hakonsdatter`
- `haakon_haakonsson`
- `skule_baardsson`

### Koblingsstatus

Alle `placeId` og `places[]` er normalisert til aktive hovedsteder:

- `middelalder_oslo`
- `oslo_domkirke`
- `akerhus_slott`

Underpunkter som `mariakirken`, `bispeborgen` og `kongsgarden_middelalder_oslo` er fjernet fra `places[]` og omtalt i tekst/leksikon i stedet.

## Samlet anbefalt merge-rekkefølge

1. Koordinatsjekk og merge aktive place-kandidater:
   - `nonneseter_kloster`
   - `oslo_ladegard`
   - `gamle_radhus`
   - `galgeberg`
   - `oslo_hospital`
   - `botsfengselet`
   - `prinds_christian_augusts_minde`
   - `ruth_maier_minne`
2. Hold/merge underpunktfilen som leksikon-/Wonderkammer-arbeid, ikke som place-manifest.
3. Merge `people_historie_next_batch_02_normalized.json`.
4. Merge `people_historie_next_batch_03_normalized.json`.
5. Merge `people_historie_next_batch_01.json` etter koblingskontroll.
6. Etter merge: kjør people-place coverage på nytt.
7. Etter coverage: rydd eventuell Ruth Maier-duplikat i litteratur/legacy.

## Risiko og tiltak

### 1. Ikke skriv tilbake trunkert `people_historie.json`

`people_historie.json` er lang, og GitHub-verktøyet kan vise avkortet innhold ved lesing. Ikke bruk avkortet respons som grunnlag for full overskriving.

Tiltak:

- Bruk skript/local merge eller trygg JSON-merge.
- Ikke kopier hele filen fra en trunkert verktøyrespons.

### 2. Koordinater må ikke merkes verified ennå

Alle nye steder må kontrolleres i kart før status endres.

Tiltak:

- Behold `needs_manual_map_check` til prikkene er testet visuelt.

### 3. Ruth Maier skal behandles som historie

Ruth Maier kan være relevant for litteratur fordi dagbøkene er tekstlige kilder, men hovedkategorien bør være historie.

Tiltak:

- Behold `ruth_maier` i historie-batch.
- Behold/opprett `ruth_maier_minne` som historie-place.
- Hvis Ruth Maier finnes i litteraturdata, rydd senere ved å flytte eller normalisere slik at hun ikke ligger dobbelt med ulik hovedkategori.

### 4. Underpunkter må ikke brukes som `placeId` før de er aktive places

Middelalderruiner og detaljpunkter som ikke er aktive kartpunkter, skal ikke brukes som `placeId` eller `places[]` i people-data.

Tiltak:

- Bruk normaliserte people-batcher.
- Bruk underpunktfilen for Mariakirken, Bispeborgen, Kongsgården osv.

## Klar for neste steg

Tryggeste neste arbeidssteg:

1. Lage en egen `places_historie_merge_candidates_01.json` med bare de aktive place-kandidatene.
2. Koordinatsjekke disse kandidatene.
3. Merge place-kandidater inn i `places_historie.json`.
4. Merge normaliserte people-batcher.
5. Kjør coverage og duplicate-ID-kontroll.
