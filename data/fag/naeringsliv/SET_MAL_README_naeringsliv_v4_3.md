# SET_MAL_README – Næringsliv v4.3

Denne mappen inneholder den kanoniske fagpakken for `naeringsliv` i History Go.

Næringslivpakken skal brukes som styringslag for næringslivsfaglige quizzer, næringslivssteder og næringslivspersoner. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal fortsatt bygge på konkrete virksomheter, arbeidssteder, produksjonssteder, banker, børs, butikker, kontorbygg, havner, lager, teknologimiljøer, logistikkpunkter, kapitalstrømmer, eierskap, markeder, arbeidsvilkår, årsrapporter, registerdata, statistikk, arkiver, bransjekilder eller dokumenterte næringslivsfaglige kilder.

## Filer

```text
fagkart_naeringsliv_canonical_v4_5.json
methods_naeringsliv_canonical_v4_5.json
emner_naeringsliv_canonical_v4_5.json
emnemapping_naeringsliv_canonical_v4_5.json
naeringslivpensum_canonical_v4_5.json
quiz_generator_rules_naeringsliv_v5_1_source_priority_patch.json
supersetQUIZMAL_naeringsliv.json
SET_MAL_README_naeringsliv_v4_3.md
```

## Grunnmodell

Næringslivpakken bygges ovenfra og ned:

```text
merke_naeringsliv / næringslivsteori
↓
fagkart_naeringsliv
↓
methods_naeringsliv
↓
emner_naeringsliv
↓
emnemapping_naeringsliv
↓
naeringslivpensum
↓
quiz_generator_rules_naeringsliv
↓
supersetQUIZMAL_naeringsliv
↓
places_naeringsliv / people_naeringsliv
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For næringslivsfiler betyr det:

```text
places_naeringsliv / people_naeringsliv skal bruke em_naering_*
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
```

## Hva hører hjemme i næringsliv

Et sted eller en person hører hjemme i `naeringsliv` når hovedpoenget er:

```text
arbeid
arbeidsplass
arbeidsliv
verdiskaping
produksjon
produksjonssted
fabrikk
verksted
industri
mekanisering
profesjon
kompetanse
arbeidsprosess
arbeidsvilkår
tjenesteyting
service
butikk
handel
handelsgate
marked
forbruk
kunde
pris
konkurranse
merkevare
statusforbruk
bank
børs
forsikring
kapital
finans
kreditt
eierskap
styring
investering
eiendomskapital
finansdistrikt
kontorby
hovedkontor
organisasjon
ledelse
kontrollsystem
bransje
årsrapport
regnskap
statistikk
registerdata
teknologi
innovasjon
startup
gründer
plattformøkonomi
data
algoritmer
automatisering
digitalisering
logistikk
verdikjede
havn
lager
transport
distribusjon
infrastruktur
fagforening
arbeidskonflikt
regulering
risiko
krise
bærekraft
eksternalitet
ressursbruk
økonomiske blindsoner
```

Et sted eller en person skal ikke ligge i `naeringsliv` bare fordi det er et kontorbygg, en gammel bygning, et byutviklingsområde eller et sted der økonomisk aktivitet tilfeldigvis finnes. Det må finnes en dokumenterbar kobling til arbeid, virksomhet, kapital, marked, teknologi, logistikk, eierskap, produksjon, handel, regulering, økonomisk institusjon eller næringslivsfaglig kilde.

Hvis hovedrollen er media, historie, byarkitektur, kunst, litteratur, musikk, populærkultur, politikk, vitenskap eller sport, skal hovedkategori være den kategorien. Næringsliv kan da være tag eller sekundærlag.

## Eksempler på riktig sortering

```text
Oslo Børs → næringsliv
Bankplassen → næringsliv hvis hovedvinkel er bank, kapital, finans eller institusjon
DNB Bjørvika → næringsliv
Barcode → næringsliv hvis hovedvinkel er kontorby, kapital, eiendom eller tjenesteøkonomi
Aker Brygge → næringsliv hvis hovedvinkel er eiendom, handel, kontor, marked eller byøkonomi
Tjuvholmen → næringsliv hvis hovedvinkel er eiendomskapital, investering eller omformet næringsrom
Freia → næringsliv
Schous bryggeri → næringsliv hvis hovedvinkel er produksjon, industri, arbeidsliv eller omstilling
Christiania Seildugsfabrik → næringsliv
Akerselva industrimiljø → næringsliv hvis hovedvinkel er industri, produksjon, arbeid eller verdiskaping
Oslo havn → næringsliv hvis hovedvinkel er logistikk, varestrøm, transport eller infrastruktur
Alnabru → næringsliv
Forskningsparken / Oslo Science Park → næringsliv hvis hovedvinkel er innovasjon, teknologi eller startupmiljø
StartupLab / Mesh → næringsliv
LO-bygget / Youngstorget → næringsliv hvis hovedvinkel er arbeidsliv, fagforening, interessekamp eller arbeid–kapital
```

```text
Pressehus → media
Historiske bygg uten dokumentert næringslivshovedkobling → historie/by
Kunstmuseer → kunst
Litteraturhus, forlag og bibliotek → litteratur
Konsertscener, klubber og studioer → musikk
Politiske institusjoner → politikk
Forskningssteder der hovedpoenget er vitenskapelig kunnskap → vitenskap
Byutviklingsområder uten konkret arbeid/kapital/marked/infrastruktur-vinkel → by
Kontorbygg uten konkret virksomhets-, kapital-, marked- eller arbeidslivsvinkel → by
```

## Kildeprioritet

Quizgeneratoren skal bruke denne prioriteringen:

```text
1. Konkrete virksomheter, arbeidssteder, produksjonssteder, banker, børs, butikker, kontorbygg, havner, lager, teknologimiljøer, logistikkpunkter og økonomiske institusjoner
2. Offisielle bedrifts-, arkiv-, museum-, statistikk-, kommune-, bransje-, register-, børs-, bank- eller institusjonskilder
3. Økonomihistorisk faglitteratur, årsrapporter, regnskap, registerdata, bransjerapporter, kart, arkivbeskrivelser og forskningskilder
4. Dokumentert arbeid, produksjonsprosess, verdikjede, kapitalstrøm, eierskap, marked, forbruk, logistikk, teknologi eller omstilling
5. Dokumentert økonomisk offentlighet: arbeidskonflikter, regulering, bransjedebatter, næringspolitikk, fagforeninger og miljøkostnader
6. Stedsdata/persondata i appen
7. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Spørsmål skal starte i næringslivsankeret

Et næringslivsspørsmål skal starte i minst ett av disse ankrene:

```text
arbeidsplass
virksomhet
firma
bedrift
fabrikk
produksjonssted
verksted
kontor
hovedkontor
butikk
handelsgate
marked
kunde
forbrukerpraksis
merkevare
bank
børs
forsikring
kapitalstrøm
eierskap
investering
eiendom
finansinstitusjon
regnskap
årsrapport
registerdata
statistikk
teknologi
plattform
data
algoritme
automatisering
startup
innovasjon
logistikk
havn
lager
transport
distribusjon
verdikjede
infrastruktur
fagforening
arbeidskonflikt
regulering
bærekraft
eksternalitet
miljøkostnad
økonomisk institusjon
```

Deretter kan fagpakken styre hvilket emne, metode og teorispor som passer.

## Migrering av eksisterende næringslivfiler

Når `places_naeringsliv.json` og `people_naeringsliv.json` ryddes, skal gamle eller feil fagkoblinger byttes ut med næringslivkoblinger.

Eksempel på feil hovedemner i næringslivfil:

```json
"emne_ids": [
  "em_by_transformasjon_ombruk",
  "em_his_minnesteder_historiebruk"
]
```

skal erstattes med relevante `em_naering_*`, for eksempel:

```json
"emne_ids": [
  "em_naering_eiendom_kapital_byutvikling",
  "em_naering_finansdistrikt_kontorby",
  "em_naering_byens_okonomiske_rom"
]
```

Valg av `em_naering_*` skal alltid gjøres ut fra faktisk sted/person/virksomhet/arbeid/kapital/marked/teknologi/logistikk, ikke automatisk fra gamle emner.

## Arbeidsregel

Ikke lag raske oversettelser fra andre fagpakker til `em_naering_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

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

Deretter velges 2–4 presise `em_naering_*`.

## Faste kontrollspørsmål før et sted legges i næringsliv

```text
Er hovedpoenget næringslivsfaglig?
Finnes det konkret arbeid, virksomhet, produksjon, kapital, eierskap, marked, handel, teknologi, logistikk, infrastruktur, arbeidskonflikt eller regulering?
Kan quizen bygges fra næringslivsfaglige kilder?
Er dette egentlig media, historie, by, kunst, litteratur, musikk, populærkultur, politikk, vitenskap eller sport?
```

Hvis svaret på siste spørsmål er ja, skal stedet flyttes eller holdes i riktig hovedkategori.

## Viktige kategorigrenser

```text
Børs, bank, finans og kapitalmarked → næringsliv
Presse, avisredaksjon og journalistikk → media
Forlag som litterær publisering → litteratur
Forlag som virksomhet/kapital/organisasjon → næringsliv bare hvis dette er hovedvinkel
Konsertscene som live-musikk og publikum → musikk
Konsertarena som næringsaktør uten musikkhovedpoeng → næringsliv bare hvis økonomien er hovedvinkel
Historisk fabrikk som arbeid/produksjon/industri → næringsliv
Historisk fabrikk som minnespor/byhistorie uten økonomisk analyse → historie/by
Handelsgate som marked, forbruk og butikkstruktur → næringsliv
Handelsgate som byrom, ferdsel og arkitektur → by
Kontorbygg som arbeidsplass/kapital/virksomhet → næringsliv
Kontorbygg som arkitektur/byutvikling → by
Havn som varestrøm/logistikk/verdikjede → næringsliv
Havn som byrom/landskap → by
Teknologimiljø som innovasjon/startup/plattform → næringsliv
Forskningsmiljø som kunnskapsproduksjon → vitenskap
Fagforening som arbeid–kapital/interesseorganisering → næringsliv
Fagforening som partipolitisk institusjon → politikk hvis hovedvinkelen er politisk
```

## Status

Næringslivpakken inneholder per nå:

```text
6 domener
36 emner
27 metoder
36 emnemappinger
60 topic hooks
8 settfaser i generatorreglene
1 næringsliv-supersetmal
```

Neste arbeid etter denne pakken er å migrere `places_naeringsliv.json` og `people_naeringsliv.json` slik at de bruker `em_naering_*` og ikke gamle `em_by_*`, `em_his_*`, `em_kunst_*`, `em_lit_*`, `em_media_*`, `em_musikk_*` eller andre fagpakker som hovedemner.
