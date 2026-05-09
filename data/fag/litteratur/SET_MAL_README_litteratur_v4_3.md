# SET_MAL_README – Litteratur v4.3

Denne mappen inneholder den kanoniske fagpakken for `litteratur` i History Go.

Litteraturpakken skal brukes som styringslag for litteraturfaglige quizzer, litteratursteder og litteraturpersoner. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal fortsatt bygge på konkrete tekster, verk, forfattere, forfatterskap, publikasjoner, biblioteker, forlag, arkiver, manuskripter, kritikk, resepsjon eller dokumentert litterær offentlighet.

## Filer

```text
fagkart_litteratur_canonical_v4_5.json
methods_litteratur_canonical_v4_5.json
emner_litteratur_canonical_v4_5.json
emnemapping_litteratur_canonical_v4_5.json
litteraturpensum_canonical_v4_5.json
quiz_generator_rules_litteratur_v5_1_source_priority_patch.json
supersetQUIZMAL_litteratur.json
SET_MAL_README_litteratur_v4_3.md
```

## Grunnmodell

Litteraturpakken bygges ovenfra og ned:

```text
merke_litteratur / litteraturteori
↓
fagkart_litteratur
↓
methods_litteratur
↓
emner_litteratur
↓
emnemapping_litteratur
↓
litteraturpensum
↓
quiz_generator_rules_litteratur
↓
supersetQUIZMAL_litteratur
↓
places_litteratur / people_litteratur
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For litteraturfiler betyr det:

```text
places_litteratur / people_litteratur skal bruke em_lit_*
```

De skal ikke bruke:

```text
em_by_*
em_his_*
em_kunst_*
em_media_*
em_musikk_*
em_pop_*
em_vit_*
em_pol_*
em_naering_*
```

## Hva hører hjemme i litteratur

Et sted eller en person hører hjemme i `litteratur` når hovedpoenget er:

```text
tekst
verk
forfatter
forfatterskap
poesi
roman
drama som tekst
essay
biografi
sakprosa som litterær form
oversettelse
kritikk
redaktørarbeid
forlag
bokhandel
bibliotek
lesesal
arkiv
manuskript
brev
dagbok
litteraturhus
litterær kafé
litterær scene
opplesning
tidsskrift
litterær offentlighet
leserfellesskap
kanon
språkpolitikk
sjanger
litteraturhistorisk epoke
```

Et sted eller en person skal ikke ligge i `litteratur` bare fordi det er kulturelt, historisk, gammelt eller fordi en forfatter en gang var der. Det må finnes en dokumenterbar kobling til tekst, verk, forfatterskap, publikasjon, institusjon, lesing, arkiv, offentlighet eller litterær formidling.

Hvis hovedrollen er scenekunst, musikk, film/TV, media, kunst, historie, byarkitektur, næringsliv, politikk, sport eller vitenskap, skal hovedkategori være den kategorien. Litteratur kan da være tag eller sekundærlag.

## Eksempler på riktig sortering

```text
Deichman Bjørvika → litteratur
Litteraturhuset → litteratur
Nasjonalbiblioteket → litteratur
Gyldendalhuset → litteratur
Aschehoug → litteratur
Ibsenmuseet → litteratur
Henrik Ibsens hjem → litteratur
Grand Café som litterært miljø → litteratur
Damstredet/Telthusbakken som litterært miljø → litteratur hvis koblet til forfatter/verk
```

```text
Nationaltheatret → scenekunst/musikk hvis hovedvinkel er sceneproduksjon
Nationaltheatret → litteratur bare hvis hovedvinkel er drama som tekst, Ibsen, Bjørnson eller litterær offentlighet
Operaen → musikk/scenekunst eller by
Filmsteder → film/populærkultur
Pressehus → media
Historiske bygg uten dokumentert litterær hovedkobling → historie/by
Kunstmuseer → kunst
```

## Kildeprioritet

Quizgeneratoren skal bruke denne prioriteringen:

```text
1. Konkrete tekster, verk, forfatterskap, publikasjoner, litterære steder og leserpraksiser
2. Offisielle bibliotek-, museum-, forlag-, arkiv-, akademi- eller institusjonskilder
3. Litteraturhistorisk faglitteratur, biografier, kataloger, arkivbeskrivelser og kritikk
4. Publikasjonshistorie, utgavehistorikk, manuskript, brev, dagbøker og dokumentert resepsjon
5. Dokumentert litterær offentlighet: opplesninger, debatter, festivaler, tidsskrifter og formidling
6. Stedsdata/persondata i appen
7. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Spørsmål skal starte i litteraturankeret

Et litteraturspørsmål skal starte i minst ett av disse ankrene:

```text
konkret tekst
tekstutdrag
verk
forfatter
forfatterskap
forfatterhjem
litterært sted
bibliotek
forlag
bokhandel
arkiv
manuskript
brev
dagbok
publikasjonshistorie
utgave
paratekst
kritikk
resepsjon
oversettelse
språkvalg
leserpraksis
opplesning
litteraturhus
litterær offentlighet
digital tekst
```

Deretter kan fagpakken styre hvilket emne, metode og teorispor som passer.

## Migrering av eksisterende litteraturfiler

Når `places_litteratur.json` og `people_litteratur.json` ryddes, skal gamle eller feil fagkoblinger byttes ut med litteraturkoblinger.

Eksempel på feil hovedemner i litteraturfil:

```json
"emne_ids": [
  "em_by_symbolsk_makt_og_representasjon",
  "em_his_minnesteder_historiebruk"
]
```

skal erstattes med relevante `em_lit_*`, for eksempel:

```json
"emne_ids": [
  "em_lit_litteraere_steder_og_bytekst",
  "em_lit_forfatterskap_verk_og_liv",
  "em_lit_lesere_offentlighet_formidling"
]
```

Valg av `em_lit_*` skal alltid gjøres ut fra faktisk sted/person/verk, ikke automatisk fra gamle emner.

## Arbeidsregel

Ikke lag raske oversettelser fra andre fagpakker til `em_lit_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

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

Deretter velges 2–4 presise `em_lit_*`.

## Faste kontrollspørsmål før et sted legges i litteratur

```text
Er hovedpoenget litteraturfaglig?
Finnes det konkret tekst, verk, forfatter, forfatterskap, publikasjon, bibliotek, forlag, arkiv, lesing, offentlighet eller litterær formidling?
Kan quizen bygges fra litteraturfaglige kilder?
Er dette egentlig scenekunst, musikk, film, media, kunst, historie, by, vitenskap, politikk, sport eller næringsliv?
```

Hvis svaret på siste spørsmål er ja, skal stedet flyttes eller holdes i riktig hovedkategori.

## Viktige kategorigrenser

```text
Drama som tekst → litteratur
Drama som oppføring/sceneproduksjon → scenekunst/musikk
Forfatterhjem knyttet til verk/forfatterskap → litteratur
Historisk bolig uten litterær hovedkobling → historie/by
Bibliotek som lesing, teksttilgang og offentlighet → litteratur
Bibliotek som arkitektur/byutvikling → by
Forlag som litterær publisering → litteratur
Forlag som næringsvirksomhet uten litterær analyse → næringsliv
Avisredaksjon som litteraturkritikk/tidsskrift → litteratur eller media etter hovedvinkel
Avisredaksjon som pressehistorie → media
```

## Status

Litteraturpakken inneholder per nå:

```text
6 domener
28 emner
29 metoder
28 emnemappinger
60 topic hooks
8 settfaser i generatorreglene
1 litteratur-supersetmal
```

Neste arbeid etter denne pakken er å migrere `places_litteratur.json` og `people_litteratur.json` slik at de bruker `em_lit_*` og ikke gamle `em_by_*`, `em_his_*`, `em_kunst_*` eller andre fagpakker som hovedemner.
