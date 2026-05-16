# SET_MAL_README – Kunst v4.3

Denne mappen inneholder den kanoniske fagpakken for `kunst` i History Go.

Kunstpakken skal brukes som styringslag for kunstfaglige quizzer, kunststeder og kunstpersoner. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal fortsatt bygge på konkrete verk, kunstnere, institusjoner, samlinger, utstillinger, kataloger, kunsthistoriske kilder, kritikk, resepsjon eller dokumentert offentlig kunst.

## Filer

```text
fagkart_kunst_canonical_v4_5.json
methods_kunst_canonical_v4_5.json
emner_kunst_canonical_v4_5.json
emnemapping_kunst_canonical_v4_5.json
kunstpensum_canonical_v4_5.json
quiz_generator_rules_kunst_v5_1_source_priority_patch.json
supersetQUIZMAL_kunst.json
SET_MAL_README_kunst_v4_3.md
```

## Grunnmodell

Kunstpakken bygges ovenfra og ned:

```text
merke_kunst / kunstteori
↓
fagkart_kunst
↓
methods_kunst
↓
emner_kunst
↓
emnemapping_kunst
↓
kunstpensum
↓
quiz_generator_rules_kunst
↓
supersetQUIZMAL_kunst
↓
places_kunst / people_kunst
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For kunstfiler betyr det:

```text
places_kunst / people_kunst skal bruke em_kunst_*
```

De skal ikke bruke:

```text
em_by_*
em_his_*
em_media_*
em_musikk_*
em_pop_*
em_vit_*
em_pol_*
em_naering_*
```

## Hva hører hjemme i kunst

Et sted eller en person hører hjemme i `kunst` når hovedpoenget er:

```text
kunstverk
kunstner
billedkunst
skulptur
offentlig kunst
monument som kunstverk
skulpturpark
museum
galleri
kunsthall
kunstskole
atelier
kunstnerisk produksjonssted
kunstsamling
kuratering
kunstkritikk
kunstinstitusjon
kunstfelt
kanon
representasjon
materialitet
medium
form
resepsjon
kunsthistorisk epoke
```

Et sted eller en person skal ikke ligge i `kunst` bare fordi det er estetisk, kulturelt, gammelt eller visuelt interessant. Hvis hovedrollen er musikk, scenekunst, film/TV, media, litteratur, historie, byarkitektur, næringsliv, politikk, sport eller vitenskap, skal hovedkategori være den kategorien. Kunst kan da være tag eller sekundærlag.

## Eksempler på riktig sortering

```text
Nasjonalmuseet → kunst
Munchmuseet → kunst
Kunstnernes Hus → kunst
Astrup Fearnley Museet → kunst
Vigelandsparken → kunst
Ekebergparken → kunst
Tjuvholmen skulpturpark → kunst
Oslo Kunstforening → kunst
Kunsthall Oslo → kunst
Kunsthøgskolen i Oslo → kunst
```

```text
Nationaltheatret → musikk/scenekunst
Operaen → musikk/scenekunst eller by, avhengig av hovedvinkel
Rockefeller → musikk
Filmsteder → film/populærkultur
Pressehus → media
Historiske bygg uten kunstfaglig hovedpoeng → historie/by
Arkitektursteder uten konkret kunstverk eller kunstinstitusjon → by
```

## Kildeprioritet

Quizgeneratoren skal bruke denne prioriteringen:

```text
1. Konkrete verk, kunstnere, institusjoner, samlinger, utstillinger eller offentlig kunst
2. Offisielle museum-, galleri-, akademi-, arkiv- eller institusjonssider
3. Katalogtekster, veggtekster, samlingsnotater og kuratoriske tekster
4. Kunsthistorisk faglitteratur, monografier, essays og forskningskilder
5. Dokumentert kunstkritikk og resepsjon
6. Kunstnertekster, intervjuer og prosessdokumentasjon
7. Stedsdata/persondata i appen
8. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Spørsmål skal starte i kunstankeret

Et kunstspørsmål skal starte i minst ett av disse ankrene:

```text
konkret kunstverk
navngitt kunstner
kunstinstitusjon
museum
galleri
kunsthall
kunstskole
atelier
samling
utstilling
kuratorisk valg
synlig form
materiale
medium
skala
symbol
offentlig kunstverk
monument
publikumsmøte
resepsjon
kunsthistorisk kilde
```

Deretter kan fagpakken styre hvilket emne, metode og teorispor som passer.

## Migrering av eksisterende kunstfiler

Når `places_kunst.json` og `people_kunst.json` ryddes, skal gamle eller feil fagkoblinger byttes ut med kunstkoblinger.

Eksempel på feil hovedemner i kunstfil:

```json
"emne_ids": [
  "em_by_symbolsk_makt_og_representasjon",
  "em_his_minnesteder_historiebruk"
]
```

skal erstattes med relevante `em_kunst_*`, for eksempel:

```json
"emne_ids": [
  "em_kunst_offentlig_kunst_monumenter",
  "em_kunst_representasjon_og_abstraksjon",
  "em_kunst_publikum_klasse_og_kapital"
]
```

Valg av `em_kunst_*` skal alltid gjøres ut fra faktisk sted/person/verk, ikke automatisk fra gamle emner.

## Arbeidsregel

Ikke lag raske oversettelser fra andre fagpakker til `em_kunst_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

```text
id
name
category
desc
popupDesc
year
quiz_profile.place_type
quiz_profile.subtype
quiz_profile.signature_features
quiz_profile.must_include
quiz_profile.notes
```

Deretter velges 2–4 presise `em_kunst_*`.

## Faste kontrollspørsmål før et sted legges i kunst

```text
Er hovedpoenget kunstfaglig?
Finnes det konkret verk, kunstner, samling, institusjon, utstilling, form, materiale, resepsjon eller offentlig kunst?
Kan quizen bygges fra kunstfaglige kilder?
Er dette egentlig musikk, scenekunst, film, media, historie, by, vitenskap, politikk, sport eller næringsliv?
```

Hvis svaret på siste spørsmål er ja, skal stedet flyttes eller holdes i riktig hovedkategori.

## Status

Kunstpakken inneholder per nå:

```text
6 domener
20 emner
21 metoder
20 emnemappinger
60 topic hooks
8 settfaser i generatorreglene
1 kunst-supersetmal
```

Neste arbeid etter denne pakken er å migrere `places_kunst.json` og `people_kunst.json` slik at de bruker `em_kunst_*` og ikke gamle `em_by_*`, `em_his_*` eller andre fagpakker som hovedemner.
