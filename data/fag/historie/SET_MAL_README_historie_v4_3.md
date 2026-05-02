# SET_MAL_README – Historie v4.3

Denne mappen inneholder den kanoniske fagpakken for `historie` i History Go.

Historiepakken skal brukes som styringslag for historiske quizzer, historiske steder og historiske personer. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal fortsatt bygge på eksterne lokalhistoriske, arkivmessige, institusjonelle eller kulturminnefaglige kilder.

## Filer

```text
fagkart_historie_canonical_v4_5.json
methods_historie_canonical_v4_5.json
emner_historie_canonical_v4_5.json
emnemapping_historie_canonical_v4_5.json
historiepensum_canonical_v4_5.json
quiz_generator_rules_historie_v5_1_source_priority_patch.json
supersetQUIZMAL_historie.json
SET_MAL_README_historie_v4_3.md
```

## Grunnmodell

Historiepakken bygges ovenfra og ned:

```text
merke_historie / historieteori
↓
fagkart_historie
↓
methods_historie
↓
emner_historie
↓
emnemapping_historie
↓
historiepensum
↓
quiz_generator_rules_historie
↓
supersetQUIZMAL_historie
↓
places_historie / people_historie
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For historiefiler betyr det:

```text
places_historie / people_historie skal bruke em_his_*
```

De skal ikke bruke:

```text
em_by_*
em_media_*
em_naering_*
em_pol_*
em_vit_*
em_kunst_*
```

## Hva hører hjemme i historie

Et sted eller en person hører hjemme i `historie` når hovedpoenget er:

```text
historisk spor
kilde / arkiv / dokumentasjon
middelalder / kirke / kongemakt
1814 / grunnlov / statsdannelse
institusjoner / rett / fengsel / politi
krig / okkupasjon / motstand
sosialhistorie / arbeid / hverdagsliv
velferdshistorie
migrasjon / minoritetshistorie
minne / kulturarv / historiebruk
katastrofer / brudd / gjenoppbygging
```

Et sted eller en person skal ikke ligge i `historie` bare fordi det er gammelt eller historisk relevant. Hvis hovedrollen er presse, børs, næringsliv, sport, kunst, musikk, teater, film/TV, vitenskap, politikk eller psykologi, skal hovedkategori være den kategorien. Historie kan da være tag eller sekundærlag.

## Eksempler på riktig sortering

```text
Gamle Aker kirke → historie
Hovedøya kloster → historie
Eidsvollsbygningen → historie
Oscarsborg festning → historie
Grini fangeleir → historie
Møllergata 19 → historie
Vår Frelsers gravlund → historie
```

```text
Akersgata pressekvartal → media
Oslo Børs → naeringsliv
Aker mekaniske verksted → naeringsliv / by, avhengig av datastruktur
Hjula Væveri → naeringsliv / by, avhengig av datastruktur
Regjeringskvartalet → politikk
```

## Kildeprioritet

Quizgeneratoren skal bruke denne prioriteringen:

```text
1. Eksterne lokalhistoriske kilder
2. Offisielle museum-, arkiv-, kirke-, kommune- eller kulturminnekilder
3. Store norske leksikon / Oslo byleksikon / institusjonssider
4. Faglitteratur, bøker, kataloger og arkivreferanser
5. Verifisert journalistikk når den støtter en konkret historisk påstand
6. Stedsdata/persondata i appen
7. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Migrering av eksisterende historiefiler

Når `places_historie.json` og `people_historie.json` ryddes, skal gammel bykobling byttes ut med historiekobling.

Eksempel:

```json
"emne_ids": [
  "em_by_historiske_lag_i_hverdagsrom",
  "em_by_symbolsk_makt_og_representasjon"
]
```

skal erstattes med relevante `em_his_*`, for eksempel:

```json
"emne_ids": [
  "em_his_middelalder_oslo",
  "em_his_spor_materialitet",
  "em_his_minnesteder_historiebruk"
]
```

Valg av `em_his_*` skal alltid gjøres ut fra faktisk sted/person, ikke automatisk fra gamle `em_by_*`.

## Arbeidsregel

Ikke lag raske oversettelser fra `em_by_*` til `em_his_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

```text
id
name
category
desc
popupDesc
year
quiz_profile.place_type
quiz_profile.subtype
quiz_profile.must_include
quiz_profile.notes
```

Deretter velges 2–4 presise `em_his_*`.

## Status

Historiepakken inneholder per nå:

```text
12 domener
45 emner
12 metoder
45 emnemappinger
8 settfaser i generatorreglene
1 historie-supersetmal
```

Neste arbeid etter denne pakken er å migrere `places_historie.json` og `people_historie.json` slik at de bruker `em_his_*` og ikke gamle `em_by_*`.
