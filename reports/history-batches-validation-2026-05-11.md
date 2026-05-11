# Validering: historie-batcher 2026-05-11

Denne rapporten gjelder de nye historie-batchene som er lagt inn som egne filer, ikke direkte merget inn i hovedfilene.

## Filer kontrollert

- `data/people/people_historie_next_batch_01.json`
- `data/people/people_historie_next_batch_02.json`
- `data/places/historie/oslo/places_historie_next_batch_middelalder_01.json`

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

### Koblingsstatus

Trygge eksisterende ankersteder:

- `middelalder_oslo`
- `oslo_domkirke`
- `akerhus_slott`
- `oslo_radhus`

Koblinger som bør sjekkes før merge:

- `mollergata_19` brukt av `petter_moen`
- `ruth_maier_minne` brukt av `ruth_maier`
- `christiania_torv` brukt av `peder_clausson_friis`

### Anbefaling

- `petter_moen` bør merges når `mollergata_19` er bekreftet som aktiv place-ID.
- `ruth_maier` bør ikke merges før `ruth_maier_minne` finnes som aktivt sted, eller personen kobles til et eksisterende Holocaust-/okkupasjonsminnested.
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
2. Deretter merge `people_historie_next_batch_02.json`.
3. Til slutt merge `people_historie_next_batch_01.json`, men hold igjen `ruth_maier` til stedskoblingen er avklart.

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

### 3. Ruth Maier trenger eget sted eller annen kobling

`ruth_maier_minne` er brukt som sted, men må bekreftes/opprettes før personen kan aktiveres.

Mulige løsninger:

- opprette `ruth_maier_minne` som historisk/minnested-place
- koble henne midlertidig til eksisterende okkupasjons-/minnested
- holde henne i batch til place finnes

## Klar for neste steg

Tryggeste neste arbeidssteg:

1. Lag en liten `ruth_maier_minne` place-batch hvis stedet ikke finnes.
2. Koordinatsjekk de seks middelalderstedene.
3. Merge middelaldersteder inn i `data/places/historie/oslo/places_historie.json`.
4. Merge people-batch 02.
5. Merge people-batch 01 med eventuell utsettelse av `ruth_maier`.
