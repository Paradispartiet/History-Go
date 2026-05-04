# SET_MAL_README – Musikk v4.3

Denne mappen inneholder den kanoniske fagpakken for `musikk` i History Go.

Musikkpakken skal brukes som styringslag for musikkfaglige quizzer, musikksteder og musikkpersoner. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal fortsatt bygge på konkrete låter, verk, artister, band, komponister, utøvere, opptak, scener, studioer, festivaler, sjangre, musikkmiljøer, publikumssituasjoner, kritikk, resepsjon, program, arkiver eller dokumenterte musikkfaglige kilder.

## Filer

```text
fagkart_musikk_canonical_v4_5.json
methods_musikk_canonical_v4_5.json
emner_musikk_canonical_v4_5.json
emnemapping_musikk_canonical_v4_5.json
musikkpensum_canonical_v4_5.json
quiz_generator_rules_musikk_v5_1_source_priority_patch.json
supersetQUIZMAL_musikk.json
SET_MAL_README_musikk_v4_3.md
```

## Grunnmodell

Musikkpakken bygges ovenfra og ned:

```text
merke_musikk / musikkteori
↓
fagkart_musikk
↓
methods_musikk
↓
emner_musikk
↓
emnemapping_musikk
↓
musikkpensum
↓
quiz_generator_rules_musikk
↓
supersetQUIZMAL_musikk
↓
places_musikk / people_musikk
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For musikkfiler betyr det:

```text
places_musikk / people_musikk skal bruke em_musikk_*
```

De skal ikke bruke:

```text
em_by_*
em_his_*
em_kunst_*
em_lit_*
em_media_*
em_pop_*
em_vit_*
em_pol_*
em_naering_*
```

## Hva hører hjemme i musikk

Et sted eller en person hører hjemme i `musikk` når hovedpoenget er:

```text
lyd
låt
verk
artist
band
komponist
utøver
sanger
musiker
produsent
lydtekniker
arrangør
dirigent
DJ
konsertscene
klubb
studio
øvingslokale
festival
konsertrom
musikkhøgskole
radiostudio som musikkformidling
plateselskap
platebutikk
musikkarkiv
instrument
rytme
groove
klang
melodi
harmoni
komposisjon
arrangement
improvisasjon
live-energi
publikum
sceneinfrastruktur
sjanger
tradisjon
populærmusikk
klassisk musikk
jazz
hiphop
elektronika
folkemusikk
kirkemusikk
kor
musikkteknologi
opptak
mixing
mastering
sample
remiks
streaming
musikkritikk
resepsjon
kulturpolitikk
musikkbransje
musikkmiljø
subkultur knyttet til lyd og scene
```

Et sted eller en person skal ikke ligge i `musikk` bare fordi det er kulturelt, historisk, kjent, urbant eller fordi musikk kan spilles der. Det må finnes en dokumenterbar kobling til lyd, artist, låt, scene, studio, festival, sjanger, publikum, institusjon, musikkmiljø, opptak, produksjon, resepsjon eller musikkfaglig kilde.

Hvis hovedrollen er teater/scenekunst uten musikkfaglig hovedpoeng, film/TV, media, kunst, litteratur, historie, byarkitektur, næringsliv, politikk, sport eller vitenskap, skal hovedkategori være den kategorien. Musikk kan da være tag eller sekundærlag.

## Eksempler på riktig sortering

```text
Blå → musikk
Rockefeller → musikk
Sentrum Scene → musikk
Cosmopolite → musikk
Øyafestivalen → musikk
Oslo Konserthus → musikk
Norges musikkhøgskole → musikk
Rainbow Studio → musikk
NRK Marienlyst → musikk hvis hovedvinkel er radio, musikkformidling, opptak eller kringkastet musikk
Kulturkirken Jakob → musikk hvis hovedvinkel er konsertrom, kor, akustikk eller musikkprogram
Vaterland → musikk hvis hovedvinkel er scene, klubb, subkultur eller musikkmiljø
```

```text
Nationaltheatret → scenekunst hvis hovedvinkel er teaterproduksjon
Operaen → musikk/scenekunst etter hovedvinkel
Filmsteder → film/populærkultur
Pressehus → media
Kunstmuseer → kunst
Historiske bygg uten dokumentert musikkhovedkobling → historie/by
Generelle kulturhus uten spesifikk musikkrolle → vurder etter hovedvinkel
Byrom der konserter av og til arrangeres → by, med musikk som sekundært lag hvis relevant
```

## Kildeprioritet

Quizgeneratoren skal bruke denne prioriteringen:

```text
1. Konkrete låter, verk, artister, band, opptak, scener, studioer, festivaler, sjangre og musikkmiljøer
2. Offisielle scene-, festival-, institusjons-, musikkhøgskole-, kringkastings-, arkiv- eller plateselskapskilder
3. Musikkhistorisk faglitteratur, plateomtaler, konsertprogram, intervjuer, kataloger, arkivbeskrivelser og kritikk
4. Utgivelseshistorie, opptakshistorie, liveopptredener, program, produksjonsnotater og dokumentert resepsjon
5. Dokumentert musikalsk offentlighet: konserter, festivaler, radio, debatter, publikumspraksiser og scener
6. Stedsdata/persondata i appen
7. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Spørsmål skal starte i musikkankeret

Et musikkspørsmål skal starte i minst ett av disse ankrene:

```text
konkret lyd
låt
verk
opptak
artist
band
komponist
utøver
produsent
lydtekniker
scene
konsertrom
klubb
festival
studio
øvingsrom
radiostudio
musikkhøgskole
plate
utgivelse
streamingkatalog
liveopptreden
konsertprogram
kritikk
resepsjon
instrument
rytme
groove
klang
stemme
form
arrangement
improvisasjon
produksjonsvalg
sjanger
tradisjon
musikkmiljø
subkultur
publikumssituasjon
musikkteknologi
lydsystem
plattform
arkiv
metadata
distribusjonsform
```

Deretter kan fagpakken styre hvilket emne, metode og teorispor som passer.

## Migrering av eksisterende musikkfiler

Når `places_musikk.json` og `people_musikk.json` ryddes, skal gamle eller feil fagkoblinger byttes ut med musikkkoblinger.

Eksempel på feil hovedemner i musikkfil:

```json
"emne_ids": [
  "em_by_torg_plasser_som_scene",
  "em_his_minnesteder_historiebruk"
]
```

skal erstattes med relevante `em_musikk_*`, for eksempel:

```json
"emne_ids": [
  "em_musikk_scene_live_performativitet",
  "em_musikk_publikum_fellesskap",
  "em_musikk_festival_sceneinfrastruktur"
]
```

Valg av `em_musikk_*` skal alltid gjøres ut fra faktisk sted/person/lyd/scene/studio/sjanger, ikke automatisk fra gamle emner.

## Arbeidsregel

Ikke lag raske oversettelser fra andre fagpakker til `em_musikk_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

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

Deretter velges 2–4 presise `em_musikk_*`.

## Faste kontrollspørsmål før et sted legges i musikk

```text
Er hovedpoenget musikkfaglig?
Finnes det konkret lyd, låt, artist, band, scene, studio, festival, opptak, publikum, sjanger, musikkmiljø eller musikkfaglig institusjon?
Kan quizen bygges fra musikkfaglige kilder?
Er dette egentlig teater/scenekunst, film, media, kunst, litteratur, historie, by, vitenskap, politikk, sport eller næringsliv?
```

Hvis svaret på siste spørsmål er ja, skal stedet flyttes eller holdes i riktig hovedkategori.

## Viktige kategorigrenser

```text
Konsertrom som musikkrom → musikk
Konsertrom som arkitektur/byrom → by
Opera som musikkverk/sang/orkester → musikk
Opera som sceneproduksjon/institusjonell scenekunst → scenekunst/musikk etter hovedvinkel
Teaterbygg uten musikkhovedpoeng → scenekunst/by
Klubb som lyd, DJ, live, subkultur og publikum → musikk
Klubb som servering/uteliv uten musikkhovedpoeng → by/næringsliv
Radio som musikkformidling → musikk
Radio som presse/mediehistorie → media
Festival som musikkprogram, scene og publikum → musikk
Festival som generell byhendelse eller midlertidig plassbruk → by
Studio som opptak, produksjon og lydarbeid → musikk
Studio som næringslokale uten musikkfaglig vinkel → næringsliv/by
Artist som musiker/komponist/produsent → musikk
Kulturpersonlighet med svak musikkrolle → riktig hovedkategori + eventuell musikk-tag
```

## Status

Musikkpakken inneholder per nå:

```text
6 domener
40 emner
27 metoder
40 emnemappinger
60 topic hooks
8 settfaser i generatorreglene
1 musikk-supersetmal
```

Neste arbeid etter denne pakken er å migrere `places_musikk.json` og `people_musikk.json` slik at de bruker `em_musikk_*` og ikke gamle `em_by_*`, `em_his_*`, `em_kunst_*`, `em_lit_*` eller andre fagpakker som hovedemner.
