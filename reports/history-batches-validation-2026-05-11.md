# Validering: historie-batcher 2026-05-11

Denne rapporten gjelder de nye historie-batchene som er lagt inn som egne filer, ikke direkte merget inn i hovedfilene.

## Filer kontrollert

- `data/people/people_historie_next_batch_01.json`
- `data/people/people_historie_next_batch_02.json`
- `data/people/people_historie_next_batch_03.json`
- `data/places/historie/oslo/places_historie_next_batch_middelalder_01.json`
- `data/places/historie/oslo/places_historie_next_batch_middelalder_02.json`
- `data/places/historie/oslo/places_historie_next_batch_ruth_maier_01.json`
- `data/places/historie/oslo/places_historie_next_batch_tidlig_moderne_01.json`
- `data/places/historie/oslo/places_historie_next_batch_straff_sosial_01.json`

## Status

Batchene er lagt inn som separate arbeidsfiler. De er derfor ikke aktive i appen før de enten:

1. merges inn i hovedfilene, eller
2. legges til i relevant manifest/loader dersom batchfiler skal lastes direkte.

Anbefalt løsning er vanlig merge inn i hovedfilene etter kontroll.

## Nye place-ID-er i middelalderbatch 01

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

## Nye place-ID-er i middelalderbatch 02

Følgende nye steder ligger i:

`data/places/historie/oslo/places_historie_next_batch_middelalder_02.json`

- `olavsklosteret`
- `korskirken`
- `oslo_ladegard`

Alle tre har:

- `category: "historie"`
- `coordStatus: "needs_manual_map_check"`
- `coordSource: "approximate_manual_lookup"`

### Vurdering

Alle tre passer faglig godt i historie-kategorien. De styrker middelalderbyen med klosterorden, sognekirke, hverdagsliv, bispegårdslag, formidling og historiske tidslag.

### Før merge

Koordinater må kontrolleres visuelt før `coordStatus` endres til `verified`.

Anbefalt sjekkerekkefølge:

1. `oslo_ladegard`
2. `olavsklosteret`
3. `korskirken`

`oslo_ladegard` bør sjekkes først fordi det er et eksisterende fysisk bygg og kan brukes som stabilt orienteringspunkt for de nærliggende ruinene.

## Tidlig moderne / sosialhistorisk place-batch

Følgende nye steder ligger i:

`data/places/historie/oslo/places_historie_next_batch_tidlig_moderne_01.json`

- `gamle_radhus`
- `galgeberg`
- `oslo_hospital`
- `tukthuset`

Alle fire har:

- `category: "historie"`
- `coordStatus: "needs_manual_map_check"`
- `coordSource: "approximate_manual_lookup"`

### Vurdering

Alle fire passer faglig godt i historie-kategorien. De utvider kategorien fra middelalder/kongemakt til tidlig moderne bystyre, rettshistorie, straff, fattigdom, omsorg, institusjoner og sosial kontroll.

### Før merge

Koordinater må kontrolleres visuelt før `coordStatus` endres til `verified`.

Anbefalt sjekkerekkefølge:

1. `gamle_radhus`
2. `oslo_hospital`
3. `tukthuset`
4. `galgeberg`

`gamle_radhus` og `oslo_hospital` bør være lettest å verifisere som fysiske steder. `galgeberg` er historisk område/stedsnavn og må sjekkes som områdepunkt, ikke bygningssenter.

## Straff og sosialhistorisk place-batch

Følgende nye steder ligger i:

`data/places/historie/oslo/places_historie_next_batch_straff_sosial_01.json`

- `botsfengselet`
- `prinds_christian_augusts_minde`
- `anatomigarden`

Alle tre har:

- `category: "historie"`
- `coordStatus: "needs_manual_map_check"`
- `coordSource: "approximate_manual_lookup"`

### Vurdering

Alle tre passer faglig godt i historie-kategorien. De styrker retts-, straffe-, fengsels-, fattigomsorgs- og institusjonshistorien i appen. Batchen gjør historie-kategorien mindre kongerekke-tung og mer sosialhistorisk presis.

`akershus_slaveri` er fjernet som egen place. Fengsels-/slaverihistorien på Akershus skal eventuelt behandles som leksikon-, Wonderkammer- eller underinnhold under `akerhus_slott`, ikke som eget kartpunkt.

### Før merge

Koordinater må kontrolleres visuelt før `coordStatus` endres til `verified`.

Anbefalt sjekkerekkefølge:

1. `botsfengselet`
2. `prinds_christian_augusts_minde`
3. `anatomigarden`

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

## People-batch 03

Filen:

`data/people/people_historie_next_batch_03.json`

Inneholder:

- `ingebjorg_hakonsdatter`
- `haakon_haakonsson`
- `skule_baardsson`

### Koblingsstatus

Personer med eksisterende hovedanker:

- `ingebjorg_hakonsdatter` -> `akerhus_slott`
- `haakon_haakonsson` -> `oslo_domkirke`

Personer som bruker nye batch-steder:

- `ingebjorg_hakonsdatter` -> `mariakirken` i `places[]`
- `haakon_haakonsson` -> `kongsgarden_middelalder_oslo` i `places[]`
- `skule_baardsson` -> `bispeborgen`

### Vurdering

Batchen passer godt med historie-regelen: senmiddelalder, borgerkrigstid, kongemakt, dynasti, kirke, legitimitet og maktkamp.

## Samlet anbefalt merge-rekkefølge

1. Koordinatsjekk og merge `places_historie_next_batch_middelalder_01.json`.
2. Koordinatsjekk og merge `places_historie_next_batch_middelalder_02.json`.
3. Koordinatsjekk og merge `places_historie_next_batch_tidlig_moderne_01.json`.
4. Koordinatsjekk og merge `places_historie_next_batch_straff_sosial_01.json`.
5. Koordinatsjekk og merge `places_historie_next_batch_ruth_maier_01.json`.
6. Merge `people_historie_next_batch_02.json`.
7. Merge `people_historie_next_batch_03.json`.
8. Merge `people_historie_next_batch_01.json`.
9. Etter merge: kjør people-place coverage på nytt.
10. Etter coverage: rydd eventuell Ruth Maier-duplikat i litteratur/legacy.

## Risiko og tiltak

### 1. Ikke skriv tilbake trunkert `people_historie.json`

`people_historie.json` er lang, og GitHub-verktøyet kan vise avkortet innhold ved lesing. Ikke bruk avkortet respons som grunnlag for full overskriving.

Tiltak:

- Bruk skript/local merge eller trygg JSON-merge.
- Ikke kopier hele filen fra en trunkert verktøyrespons.

### 2. Koordinater må ikke merkes verified ennå

Alle nye middelaldersteder og tidlig moderne steder må kontrolleres i kart før status endres.

Tiltak:

- Behold `needs_manual_map_check` til prikkene er testet visuelt.

### 3. Ruth Maier skal behandles som historie

Ruth Maier kan være relevant for litteratur fordi dagbøkene er tekstlige kilder, men hovedkategorien bør være historie.

Tiltak:

- Behold `ruth_maier` i historie-batch.
- Behold/opprett `ruth_maier_minne` som historie-place.
- Hvis Ruth Maier finnes i litteraturdata, rydd senere ved å flytte eller normalisere slik at hun ikke ligger dobbelt med ulik hovedkategori.

### 4. Batch-steder må merges før personer som peker til dem

People-batch 02 og 03 bruker steder som bare finnes i batchfiler ennå.

Tiltak:

- Merge/aktiver stedene først.
- Kjør coverage etterpå.

### 5. Overlappende historiske steder må ha tydelig faglig skille

Noen nye steder ligger tett på eller inne i eksisterende steder:

- flere middelalderruiner overlapper `middelalder_oslo`
- `anatomigarden` og `gamle_radhus` ligger tett ved `christiania_torv`

Tiltak:

- Behold dem bare hvis appen skal vise mer presise underpunkter.
- Hvis kartet blir for tett, kan de heller behandles som leksikon-/Wonderkammer-objekter under hovedstedet.

## Klar for neste steg

Tryggeste neste arbeidssteg:

1. Koordinatsjekk middelalderstedene, tidlig moderne-stedene, straff/sosial-stedene og `ruth_maier_minne`.
2. Merge place-batchene inn i `data/places/historie/oslo/places_historie.json`.
3. Merge people-batch 02 og 03.
4. Merge people-batch 01.
5. Kjør coverage og duplicate-ID-kontroll.
