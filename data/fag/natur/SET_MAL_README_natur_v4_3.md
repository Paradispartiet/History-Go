# SET_MAL_README – Natur v4.3

Denne mappen inneholder den kanoniske fagpakken for `natur` i History Go.

Naturpakken skal brukes som styringslag for natur- og miljøfaglige quizzer, natursteder og naturpersoner. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal fortsatt bygge på konkrete arter, habitater, økosystemer, vassdrag, parker, geologiske former, klimaeffekter, vannkvalitet, forurensning, restaurering, vern, forvaltning, feltmålinger, kartdata, artsdata, hydrologiske data, klimadata, geologiske data eller dokumenterte naturfaglige kilder.

## Filer

```text
fagkart_natur_canonical_v4_5.json
methods_natur_canonical_v4_5.json
emner_natur_canonical_v4_5.json
emnemapping_natur_canonical_v4_5.json
naturpensum_canonical_v4_5.json
quiz_generator_rules_natur_v5_1_source_priority_patch.json
supersetQUIZMAL_natur.json
SET_MAL_README_natur_v4_3.md
```

## Grunnmodell

```text
merke_natur / natur- og miljøteori
↓
fagkart_natur
↓
methods_natur
↓
emner_natur
↓
emnemapping_natur
↓
naturpensum
↓
quiz_generator_rules_natur
↓
supersetQUIZMAL_natur
↓
places_natur / people_natur
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For naturfiler betyr det:

```text
places_natur / people_natur skal bruke em_natur_*
```

De skal ikke bruke:

```text
em_by_*
em_his_*
em_kunst_*
em_lit_*
em_media_*
em_musikk_*
em_pop_*
em_vit_*
em_pol_*
em_naering_*
```

## Hva hører hjemme i natur

Et sted eller en person hører hjemme i `natur` når hovedpoenget er:

```text
art
habitat
økosystem
naturtype
biologisk mangfold
bestand
næringsnett
pollinering
jordliv
mikroliv
skog
vegetasjon
suksesjon
våtmark
vannspeil
elv
bekk
vassdrag
innsjø
dam
fjord
strand
vannkvalitet
overvann
hydrologi
sediment
kretsløp
karbon
energiflyt
klima
urban varme
resiliens
sårbarhet
vippepunkt
klimatilpasning
ekstremvær
geologi
berggrunn
landskapsform
topografi
dalføre
vannskille
erosjon
istid
strandlinje
lang naturtid
bynatur
urban økologi
grønnstruktur
økologisk korridor
park som økosystem
trær
bydyr
kolonihage
marka
natur–by-friksjon
forurensning
miljøgifter
mikroplast
naturinngrep
vern
restaurering
regenerasjon
forvaltning
miljødata
økologisk rettferdighet
naturkonflikt
tålegrense
```

Et sted eller en person skal ikke ligge i `natur` bare fordi stedet er grønt, pent, rekreativt eller fordi natur finnes der som bakgrunn. Det må finnes en dokumenterbar kobling til art, habitat, økosystem, vassdrag, klima, geologi, grønnstruktur, forurensning, restaurering, vern, forvaltning, miljødata eller naturfaglig kilde.

Hvis hovedrollen er byarkitektur, historie, sport, kultur, politikk, næringsliv, kunst, litteratur, media, musikk, populærkultur eller vitenskap som institusjon, skal hovedkategori være den kategorien. Natur kan da være tag eller sekundærlag.

## Eksempler på riktig sortering

```text
Østensjøvannet → natur
Akerselva → natur hvis hovedvinkel er vassdrag, økologi, vannkvalitet, grønn korridor eller restaurering
Alnaelva → natur
Ljanselva → natur
Maridalsvannet → natur
Oslofjorden → natur hvis hovedvinkel er fjordøkologi, vannkvalitet, forurensning eller marint system
Hovedøya → natur hvis hovedvinkel er øyøkologi, geologi, habitat eller naturforvaltning
Bygdøy → natur hvis hovedvinkel er habitat, kystnatur, skog, jord, strand eller grønnstruktur
Marka → natur
Ekeberg → natur hvis hovedvinkel er geologi, landskap, vegetasjon eller natur–by-overgang
Tøyenparken → natur hvis hovedvinkel er parkøkologi, trær, urban varme eller grønnstruktur
Stensparken → natur hvis hovedvinkel er parkøkologi, vegetasjon, topografi eller bynatur
Hovinbekken → natur hvis hovedvinkel er bekkeåpning, overvann eller restaurering
```

```text
Parker som primært byrom, lek, arkitektur eller sosial møteplass → by
Idrettsanlegg i grøntområder → sport
Historiske ruiner i naturmiljø → historie hvis historien er hovedvinkel
Kunstparker eller skulpturparker → kunst hvis kunstverkene er hovedvinkel
Miljøpolitisk institusjon → politikk hvis politisk institusjon er hovedvinkel
Forskningsinstitusjon → vitenskap hvis kunnskapsinstitusjonen er hovedvinkel
Næringsareal med miljøtiltak → næringsliv hvis virksomhet/kapital er hovedvinkel
```

## Kildeprioritet

Quizgeneratoren skal bruke denne prioriteringen:

```text
1. Konkrete arter, habitater, økosystemer, vassdrag, parker, geologiske former, klimarisikoer, forurensningsspor, miljøtiltak og forvaltningscase
2. Offisielle natur-, miljø-, kommune-, NVE-, Miljødirektoratet-, Artsdatabanken-, kart-, museum-, forsknings- eller forvaltningskilder
3. Økologisk faglitteratur, hydrologiske data, vannkvalitetsdata, artskart, geologiske kart, klimadata, feltmålinger og forskningsrapporter
4. Dokumentert naturprosess: kretsløp, energiflyt, erosjon, suksesjon, forstyrrelse, regenerasjon, tålegrense eller økologisk korridor
5. Dokumentert miljøpåvirkning: forurensning, miljøgifter, mikroplast, arealinngrep, restaurering, vern, forvaltning, miljørettferdighet eller naturkonflikt
6. Stedsdata/persondata i appen
7. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Spørsmål skal starte i naturankeret

Et naturspørsmål skal starte i minst ett av disse ankrene:

```text
art
habitat
økosystem
biodiversitet
våtmark
skog
vegetasjon
elv
bekk
innsjø
fjord
vannkvalitet
overvann
jord
sediment
geologi
landskapsform
klima
karbon
energiflyt
resiliens
urban økologi
grønn korridor
parkøkosystem
forurensning
mikroplast
miljøgift
restaurering
vern
forvaltning
naturkonflikt
feltmåling
kartdata
artskart
hydrologiske data
klimadata
geologisk kart
forvaltningsplan
```

Deretter kan fagpakken styre hvilket emne, metode og teorispor som passer.

## Migrering av eksisterende naturfiler

Når `places_natur.json` og `people_natur.json` ryddes, skal gamle eller feil fagkoblinger byttes ut med naturkoblinger.

Eksempel på feil hovedemner i naturfil:

```json
"emne_ids": [
  "em_by_parker_og_byrom",
  "em_his_minnesteder_historiebruk"
]
```

skal erstattes med relevante `em_natur_*`, for eksempel:

```json
"emne_ids": [
  "em_natur_urban_okologi_byrom",
  "em_natur_gronnstruktur_korridorer",
  "em_natur_skog_vegetasjon_suksesjon"
]
```

Valg av `em_natur_*` skal alltid gjøres ut fra faktisk sted/person/art/habitat/vassdrag/klima/geologi/forurensning/forvaltning, ikke automatisk fra gamle emner.

## Arbeidsregel

Ikke lag raske oversettelser fra andre fagpakker til `em_natur_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

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

Deretter velges 2–4 presise `em_natur_*`.

## Faste kontrollspørsmål før et sted legges i natur

```text
Er hovedpoenget natur- eller miljøfaglig?
Finnes det konkret art, habitat, økosystem, vannsystem, klimaeffekt, geologi, grønnstruktur, forurensning, restaurering, vern eller forvaltning?
Kan quizen bygges fra naturfaglige kilder?
Er dette egentlig by, historie, sport, kultur, politikk, næringsliv, kunst, litteratur, media, musikk, populærkultur eller vitenskap som institusjon?
```

Hvis svaret på siste spørsmål er ja, skal stedet flyttes eller holdes i riktig hovedkategori.

## Viktige kategorigrenser

```text
Våtmark, fugleliv og habitat → natur
Park som økosystem, trær, bydyr og grønn korridor → natur
Park som sosialt byrom, lek og opphold → by
Skatepark i grøntområde → subkultur/sport etter hovedvinkel, ikke natur
Stadion eller bane i grøntområde → sport
Elv som vassdrag, vannkvalitet, habitat eller restaurering → natur
Elv som industrihistorie eller byutvikling → historie/by/næringsliv etter hovedvinkel
Fjord som økosystem, vannkvalitet eller forurensning → natur
Fjord som havn, transport eller logistikk → næringsliv
Geologisk form, dalføre, berggrunn og erosjon → natur
Utsiktspunkt som byrom eller turiststed → by
Naturreservat og verneområde → natur
Miljøpolitisk kamp eller institusjon → politikk hvis politisk organisering er hovedvinkel
Naturforskningsinstitusjon → vitenskap hvis institusjonen/kunnskapsproduksjonen er hovedvinkel
Miljøteknologi eller grønn virksomhet → næringsliv hvis virksomheten er hovedvinkel
```

## Status

Naturpakken inneholder per nå:

```text
6 domener
33 emner
30 metoder
33 emnemappinger
60 topic hooks
8 settfaser i generatorreglene
1 natur-supersetmal
```

Neste arbeid etter denne pakken er å migrere `places_natur.json` og `people_natur.json` slik at de bruker `em_natur_*` og ikke gamle `em_by_*`, `em_his_*`, `em_kunst_*`, `em_lit_*`, `em_media_*`, `em_musikk_*`, `em_naering_*` eller andre fagpakker som hovedemner.
