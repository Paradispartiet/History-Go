# Validering: historie-batcher 2026-05-11

Denne rapporten gjelder de nye historie-batchene som er lagt inn som egne filer, ikke direkte merget inn i hovedfilene.

## Filer kontrollert

- `data/people/people_historie_next_batch_01.json`
- `data/people/people_historie_next_batch_02.json`
- `data/places/historie/oslo/places_historie_next_batch_middelalder_01.json`
- `data/places/historie/oslo/places_historie_next_batch_ruth_maier_01.json`

## Status

Batchene er lagt inn som separate arbeidsfiler. De er derfor ikke aktive i appen før de enten:

1. merges inn i hovedfilene, eller
2. legges til i relevant manifest/loader dersom batchfiler skal lastes direkte.

Anbefalt løsning er vanlig merge inn i hovedfilene etter kontroll.

## Nye place-ID-er i middelalderbatchen

Følgende nye steder ligger i:

`data/places/historie/oslo/places_historie_next_batch_middelalder_01.json`

- `nonneseter_kloster`
- `mariakirken`
- `clemenskirken`
- `hallvardskatedralen`
- `bispeborgen`
- `kongsgarden_middelalder_oslo`

Alle seks har:

- `category: "historie"`
- `coordStatus: "needs_manual_map_check"`
- `coordSource: "approximate_manual_lookup"`

### Vurdering

Alle seks passer faglig godt i historie-kategorien etter ny README-regel. De handler om middelalderbyen, kirke, kloster, kongemakt, bispemakt, ruiner og kulturarv.

### Før merge

Koordinater bør finjusteres på kart før `coordStatus` endres til `verified`.

Anbefalt sjekkerekkefølge:

1. `mariakirken`
2. `hallvardskatedralen`
3. `clemenskirken`
4. `bispeborgen`
5. `kongsgarden_middelalder_oslo`
6. `nonneseter_kloster`

Grunnen er at de fem første ligger tett i middelalderbyen og må skilles presist slik at prikkene ikke overlapper eller havner på feil ruinområde.

## Ruth Maier-place

Følgende sted ligger i:

`data/places/historie/oslo/places_historie_next_batch_ruth_maier_01.json`

- `ruth_maier_minne`

### Vurdering

`ruth_maier_minne` er faglig et historie-/minnested, ikke et litteratursted. Stedet er knyttet til Ruth Maiers plass, Dalsbergstien 3, snublestein, Holocaust, deportasjonen av norske jøder og dagbokhistorie.

Stedet har:

- `category: "historie"`
- `coordStatus: "needs_manual_map_check"`
- `coordSource: "approximate_manual_lookup"`

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

## People-batch 02

Filen:

`data/people/people_historie_next_batch_02.json`

Inneholder:

- `astrid_olavsdatter`
- `magnus_den_gode`
- `magnus_lagabote`
- `gunnhild_kongsmor`
- `sigurd_ribbung`
- `alv_erlingsson`

### Koblingsstatus

Personer med bare eksisterende hovedanker:

- `astrid_olavsdatter` -> `middelalder_oslo`, `oslo_domkirke`
- `magnus_den_gode` -> `middelalder_oslo`, `oslo_domkirke`
- `gunnhild_kongsmor` -> `akerhus_slott`, `middelalder_oslo`

Personer som bruker nye batch-steder:

- `magnus_lagabote` -> `kongsgarden_middelalder_oslo`
- `sigurd_ribbung` -> `bispeborgen` i `places[]`
- `alv_erlingsson` -> `kongsgarden_middelalder_oslo` i `places[]`

### Anbefaling

Merge-rekkefølge:

1. Merge og koordinatsjekk `places_historie_next_batch_middelalder_01.json` først.
2. Merge/aktiver `places_historie_next_batch_ruth_maier_01.json`.
3. Deretter merge `people_historie_next_batch_02.json`.
4. Til slutt merge `people_historie_next_batch_01.json`.

## Risiko og tiltak

### 1. Ikke skriv tilbake trunkert `people_historie.json`

`people_historie.json` er lang, og GitHub-verktøyet kan vise avkortet innhold ved lesing. Ikke bruk avkortet respons som grunnlag for full overskriving.

Tiltak:

- Bruk skript/local merge eller trygg JSON-merge.
- Ikke kopier hele filen fra en trunkert verktøyrespons.

### 2. Koordinater må ikke merkes verified ennå

Alle nye middelaldersteder ligger tett. De må kontrolleres i kart før status endres.

Tiltak:

- Behold `needs_manual_map_check` til prikkene er testet visuelt.

### 3. Ruth Maier skal behandles som historie

Ruth Maier kan være relevant for litteratur fordi dagbøkene er tekstlige kilder, men hovedkategorien bør være historie.

Tiltak:

- Behold `ruth_maier` i historie-batch.
- Behold/opprett `ruth_maier_minne` som historie-place.
- Hvis Ruth Maier finnes i litteraturdata, rydd senere ved å flytte eller normalisere slik at hun ikke ligger dobbelt med ulik hovedkategori.

## Klar for neste steg

Tryggeste neste arbeidssteg:

1. Sjekk om `ruth_maier` allerede finnes i `people_litteratur.json` eller legacy `data/people.json`.
2. Koordinatsjekk `ruth_maier_minne` og de seks middelalderstedene.
3. Merge middelaldersteder inn i `data/places/historie/oslo/places_historie.json`.
4. Merge `ruth_maier_minne` inn i `data/places/historie/oslo/places_historie.json`.
5. Merge people-batch 02.
6. Merge people-batch 01.
