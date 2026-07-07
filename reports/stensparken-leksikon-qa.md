# QA: Stensparken Leksikon etter merge

Dato: 2026-07-07

## Sluttstatus

**PASS_WITH_TODOS**

Stensparken-laget er i hovedsak merget og klart for quizproduksjon av kjerne-, parkstrid-, eldre nyhets-, kunst/person- og skeiv-historie-spor. Det gjenstår TODO-er for manglende forventede underentries, svak kildekontekst i noen nyere/randsonesaker og eventuelle place-entries for randsoner dersom runtime senere krever strenge `linkedPlaceIds`.

## Struktur og funn

- Leksikon-data ligger under `data/leksikon/`.
- Stensparken-spesifikk Leksikon-fil: `data/leksikon/places/oslo/by/leksikon_oslo_by_stensparken.json`.
- People-data ligger under `data/people/`.
- Place-data ligger under `data/places/`.
- Funnet ved søk etter `place_id/placeId = stensparken`, `linkedPlaceIds/linked_place_ids` til `stensparken` og taggen `stensparken`.

**Antall Stensparken-relaterte Leksikon-entries funnet: 22**

## Entries gruppert etter QA-kategori

### Kjerne

- `stensparken_hovedartikkel`
- `blaasen`
- `korpehaugen`
- `nattmannshaugen`
- `station_stensparken_trianguleringspunkt`
- `reiersens_lokke`

### Gamle nyheter / mørk historie

- `stensparken_1920_lumske_eksistenser`
- `stensparken_1930_skam_for_byen`
- `nattmannshaugen`

### Bykamp / parkstrid

- `oscar_hoff_planen_for_stensparken`
- `p_bassoe_varemessen_1928`
- `reguleringsraadet_1930_redder_parken`
- `stensparken_1928_parkstriden`
- `stensparken_1933_tryggere_park`

### People / kunst / arkitektur

- `sigrid_undset_monumentet`
- `reiersens_lokke`
- `station_stensparken_trianguleringspunkt`

### Skeiv historie

- `stensparken_kjaerlighetskarusellen_1937`

### Barn / hverdagsliv

- `barneparken_i_stensparken`
- `cafe_stensparken_2025`

### Nyere notiser

- `cafe_stensparken_2025`
- `stensparken_2022_funn_av_dod_person`
- `stensparken_2020_koronafester`
- `stensparken_2023_gressbrann`
- `stensparken_2024_soppelskur_brann`

### Randsonesaker

- `pilestredet_70_halloween_drapet`

## Kjerneentries: status

### Funnet med forventet eller tydelig tilsvarende id

- `stensparken` → finnes som place-id og Leksikon-hovedartikkel `stensparken_hovedartikkel`.
- `blaasen`
- `korpehaugen`
- `nattmannshaugen`
- `reiersens_lokke`
- `barneparken_i_stensparken`
- `cafe_stensparken_2025`
- `stensparken_1920_lumske_eksistenser`
- `stensparken_1928_parkstriden`
- `stensparken_1930_skam_for_byen`
- `stensparken_1933_tryggere_park`
- `stensparken_kjaerlighetskarusellen_1937`
- `stensparken_dod_person_2022` → tilsvarende funnet som `stensparken_2022_funn_av_dod_person`.
- `stensparken_koronafester_2020` → tilsvarende funnet som `stensparken_2020_koronafester`.
- `pilestredet_70_halloween_drapet`

### missing_expected_entries

Disse ble ikke funnet som egne Leksikon-entries med nøyaktig eller tydelig tilsvarende id:

- `stensparken_som_gammel_bymark`
- `stensparken_som_avfallssted` (tema delvis dekket via `nattmannshaugen`)
- `fagerborg_kirke_i_stensparken`
- `sigrid_undset_i_stensparken`
- `kjersti_wexelsen_goksoyr`
- `harald_aars_og_pissoaret`
- `hagbarth_schytte_berg_fagerborg_kirke`
- `halvor_c_reiersen_og_reiersens_lokke`
- `kjaerlighetskarusellen`
- `skeiv_historie_i_stensparken`
- `kjaerlighetskarusellen_fredet_2009`
- `per_barclay_lysinstallasjonen`
- `tante_centy`
- `huset_pa_haugen` / `murvillaen_presteboligen_i_stensparken`

## Type/tone/quiz_use QA

- `stensparken_1920_lumske_eksistenser`: `type: historical_news`, `tone: dark`, `classification.quiz_use: core`. OK.
- `stensparken_1928_parkstriden`: `type: historical_news`, `tone: civic`, `classification.quiz_use: core`. OK.
- `stensparken_1930_skam_for_byen`: `type: historical_news`, `tone: local_complaint`, `classification.quiz_use: good`. OK.
- `stensparken_1933_tryggere_park`: `type: historical_news`, `tone: urban_reform`, `classification.quiz_use: core`. OK.
- `stensparken_kjaerlighetskarusellen_1937`: `type: historical_news`, `tone: queer_history`, `classification.quiz_use: core`. OK som historisk skeiv-historie-entry, men TODO står for egen artefakt-entry `kjaerlighetskarusellen`.
- `stensparken_2022_funn_av_dod_person`: endret til `type: modern_notice`, `classification.quiz_use: avoid_for_quiz`. OK; teksten sier at ingenting tydet på noe kriminelt.
- `pilestredet_70_halloween_drapet`: `type: nearby_crime_history`, `classification.quiz_use: optional`. OK som randsonesak; teksten sier eksplisitt at hendelsen ikke er inne i selve Stensparken.

## Kildekvalitet

### Entries uten kilder/sourceRefs

Ingen av de 22 Stensparken-relaterte Leksikon-entries mangler `externalLinks`.

### Sterke kilder observert

- Oslo byleksikon for Stensparken, Reiersens løkke, Fagerborg kirke, Kjærlighetskarusellen og Pilestredet.
- Oslo kommune for Stensparken og Fagerborg kirke.
- Byarkivet/Tobias: «Parken på byens tak».
- Riksantikvaren for Kjærlighetskarusellen-fredning.
- Skeivt arkiv / Blikk for skeiv-historie-kontekst.
- Vårt Oslo / Aftenposten / Sol for nyere notiser.

### Entries med svak kilde eller svak kontekst

- `pilestredet_70_halloween_drapet`: `source_quality: weak_context`; har bare generell Pilestredet-kilde i Leksikon-entryen og bør ikke brukes som kjernequiz uten bedre sakskilde.
- `stensparken_2022_funn_av_dod_person`: `source_quality: weak_context`; nyere notis, skal unngås i quiz.
- `stensparken_2023_gressbrann`: `source_quality: weak_context`; nyere notis, skal unngås i quiz.
- `stensparken_2024_soppelskur_brann`: `source_quality: weak_context`; nyere notis, skal unngås i quiz.

### Kildeklassifisering fikset

- Gamle avisnotiser som bygger på Tobias/Byarkivet er merket med `source_quality: archival_secondary`, ikke direkte originalavis.
- Moderne notiser er ikke merket `primary`; de er merket `news_secondary` eller `weak_context`.

## People-koblinger

### Forventede people entries

Alle forventede people IDs finnes:

- `sigrid_undset` — placeId/places peker til `stensparken`.
- `kjersti_wexelsen_goksoyr` — placeId/places peker til `stensparken`.
- `harald_aars` — placeId/places peker til `stensparken`.
- `hagbarth_schytte_berg` — placeId/places peker til `stensparken`.
- `halvor_c_reiersen` — placeId/places peker til `stensparken`.

### Broken peopleIds

- Ingen broken `peopleIds` funnet i Stensparken-Leksikon-entryene.
- Merk: Stensparken-entryene bruker ikke eksplisitte `peopleIds`-felt per nå; koblingen er indirekte via people-data og tekst/kilder.

### Jan Erik Vold

- `jan_erik_vold` finnes i people-data, men ikke i Stensparken-kontekst. OK.

## linkedPlaceIds / place-id QA

- Stensparken place-id finnes i place-data.
- Stensparken-Leksikon-entryene bruker ikke eksplisitte `linkedPlaceIds` / `linked_place_ids` per nå.

### Særlig sjekkede place IDs

- `fagerborg_kirke`: finnes i place-data.
- `kjaerlighetskarusellen`: finnes i place-data.
- `pilestredet_70`: ikke funnet som egen place-id.

### Broken linkedPlaceIds

- Ingen broken `linkedPlaceIds` i Stensparken-Leksikon, fordi feltet ikke brukes i disse entryene.

### needs_place_entry

- `pilestredet_70` bør vurderes som egen place-entry hvis Halloween-drapet/randsonesaker senere skal ha streng kobling til sted-ID. Ikke opprettet i denne QA-en.

## Tekst og risikopunkter

- Halloween-drapet: teksten knytter saken til Pilestredet/Sporveisgata/Stensparken-randsonen og sier at det ikke skjedde inne i selve parken. Ingen usikker hardkodet dato ble funnet i entryen.
- Død person 2022: teksten sier nøkternt at politiets opplysning var at ingenting tydet på noe kriminelt. Etter QA er entryen merket `modern_notice` og `avoid_for_quiz`.
- Kjærlighetskarusellen: teksten behandler ikke stedet bare som urinal; den inkluderer offentlig urinal, skjult møtested og skeiv historie. Kilder dekker også fredning, men egen forventet entry for fredning 2009 mangler.
- 1920-tallsstoffet: tekstene er tydelige på at dette er avis-/arkivstoff og bruker moralpanikk/uro som historisk retorikk, ikke som nåtidsvurdering av parken.

## Entries som bør unngås i quiz

- `stensparken_2022_funn_av_dod_person`
- `stensparken_2023_gressbrann`
- `stensparken_2024_soppelskur_brann`

## Eventuelle faktiske rettelser gjort

Små schema-/klassifiseringsfikser i `data/leksikon/places/oslo/by/leksikon_oslo_by_stensparken.json`:

- La til `classification.quiz_use` og `classification.source_quality` for eldre nyheter, skeiv-historie-entry, randsonesak og nyere notiser.
- Endret nyere notis-entries fra `type: news_note` til `type: modern_notice` for å matche forventet klassifisering.
- Ingen nye Leksikon-entries opprettet.
- Ingen nye personer lagt inn.
- Ingen Jan Erik Vold-kobling lagt inn.

## Tester og valideringer kjørt

- `python3` JSON-parse og Stensparken-opptelling for `data/leksikon`.
- `python3` kontroll av forventede people IDs i `data/people`.
- `python3` kontroll av relevante place IDs i `data/places`.
- `python3 -m json.tool data/leksikon/places/oslo/by/leksikon_oslo_by_stensparken.json`.
- `npm run leksikon:ids:check`.

## Konklusjon

Stensparken er **klar for quizproduksjon med forbehold**: bruk kjerneentries, parkstrid, eldre nyheter, Reiersens løkke, Sigrid Undset-monumentet, barneparken og Kjærlighetskarusellen-sporet. Unngå nyere døds-/brannnotiser i quiz, og bruk Halloween-drapet bare som optional randsonestoff inntil bedre kildekobling/place-entry finnes.
