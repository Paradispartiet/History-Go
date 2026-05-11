# SET_MAL_README – Vitenskap v4.3

Denne mappen inneholder den kanoniske fagpakken for `vitenskap` i History Go.

Vitenskapspakken skal brukes som styringslag for vitenskapelige quizzer, vitenskapssteder og vitenskapspersoner. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal fortsatt bygge på konkrete institusjoner, universiteter, laboratorier, observatorier, instrumenter, målinger, datasett, forskningsmiljøer, metoder, modeller, teknologiske systemer, medisinske case, miljømålinger, vitenskapelige gjennombrudd, forskningspublikasjoner, rapporter, arkiver, fagfellekilder eller fagmiljøkilder.

## Filer

```text
fagkart_vitenskap_canonical_v4_5.json
methods_vitenskap_canonical_v4_5.json
emner_vitenskap_canonical_v4_5.json
emnemapping_vitenskap_canonical_v4_5.json
vitenskappensum_canonical_v4_5.json
quiz_generator_rules_vitenskap_v5_1_source_priority_patch.json
supersetQUIZMAL_vitenskap.json
SET_MAL_README_vitenskap_v4_3.md
```

## Grunnmodell

```text
merke_vitenskap / vitenskapsteori
↓
fagkart_vitenskap
↓
methods_vitenskap
↓
emner_vitenskap
↓
emnemapping_vitenskap
↓
vitenskappensum
↓
quiz_generator_rules_vitenskap
↓
supersetQUIZMAL_vitenskap
↓
places_vitenskap / people_vitenskap
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For vitenskapsfiler betyr det:

```text
places_vitenskap / people_vitenskap skal bruke em_vit_*
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
em_pol_*
em_naering_*
em_natur_*
em_psy_*
em_sub_*
```

## Hva hører hjemme i vitenskap

Et sted eller en person hører hjemme i `vitenskap` når hovedpoenget er vitenskapelig institusjon, universitet, laboratorium, observatorium, institutt, museum, arkiv, forskningsmiljø, forskningsinfrastruktur, metode, hypotese, observasjon, eksperiment, variabel, instrument, kalibrering, standardisering, statistikk, modell, simulering, fagfellekonsensus, paradigme, teori, evidens, objektivitet, sannhetsproduksjon, vitenskapelig revolusjon, blindsoner, kausalitet, vitenskapsfilosofi, teknologi, data, sensor, datasett, beregning, protokoll, algoritme, automatisering, datavisualisering, teknologisk infrastruktur, digital vitenskap, naturvitenskap, medisin, biologi, klima, miljø, geologi, økologi, epidemiologi, prøver, feltarbeid, vitenskapelig miljøovervåking, forskningsfinansiering, ekspertmakt, vitenskapsetikk, risiko, kontroverser, marginaliserte felt, interessekonflikt, offentlighet, styring eller vitenskapens samfunnsendring.

Et sted eller en person skal ikke ligge i `vitenskap` bare fordi stedet har teknologi, natur, helse, utdanning eller institusjonsstatus. Det må finnes en dokumenterbar kobling til vitenskapelig metode, institusjon, instrument, modell, datasett, observasjon, forskningsmiljø, gjennombrudd, teknologi, medisin, miljøvitenskap, kontrovers eller vitenskapelig kilde.

Hvis hovedrollen er natur som opplevelse, by, politikk, næringsliv, psykologi, historie, media, kunst, litteratur, sport, musikk, populærkultur eller subkultur, skal hovedkategori være den kategorien. Vitenskap kan da være tag eller sekundærlag.

## Eksempler på riktig sortering

```text
Observatoriet → vitenskap hvis hovedvinkel er observasjon, måling, astronomi, instrumenter, institusjon eller vitenskapshistorie
Universitetet i Oslo / Blindern → vitenskap hvis hovedvinkel er forskning, metode, fagmiljø, laboratorium, teori, vitenskapshistorie eller kunnskapsinstitusjon
Teknisk Museum → vitenskap hvis hovedvinkel er teknologi-, industri-, instrument-, medisin- eller vitenskapshistorie
Naturhistorisk museum → vitenskap hvis hovedvinkel er klassifikasjon, samling, naturhistorie, biologi, geologi eller forskningsformidling
Botanisk hage → vitenskap hvis hovedvinkel er botanikk, klassifikasjon, forskning, samlinger eller naturvitenskapelig formidling
Meteorologisk institutt → vitenskap hvis hovedvinkel er klima, vær, observasjon, måling, modeller, data eller prognoser
Rikshospitalet / Ullevål sykehus → vitenskap hvis hovedvinkel er medisinsk forskning, klinisk evidens, laboratorier, epidemiologi eller forskningsinstitusjon
Forskningsparken / Oslo Science City → vitenskap hvis hovedvinkel er forskning, innovasjon, forskningsinfrastruktur, teknologi, data eller kunnskapssystemer
Nasjonalbiblioteket → vitenskap hvis hovedvinkel er arkiv, data, kunnskapslagring, dokumentasjon eller forskningsinfrastruktur
Oslofjorden → vitenskap hvis hovedvinkel er miljømåling, økologi, prøver, feltarbeid, klima, biologi eller forskningsdata
```

```text
Natursted som tur, landskap, rekreasjon eller økosystem uten vitenskapelig metode/kilde → natur
Teknologiprodukt som vare, merkevare eller marked → næringsliv
Universitet som bygg, campus eller byutvikling uten forskningsvinkel → by
Sykehus som helsetjeneste, pasientforløp eller forvaltning uten forskningsvinkel → politikk/helse etter hovedvinkel
Museum som kunstsamling eller kulturhistorisk rom → kunst/historie etter hovedvinkel
Bibliotek som litteratur, bokkultur eller forfatterrom → litteratur
Protest mot forskning, forskningspolitikk eller statsstyring → politikk hvis styring/rett er hovedvinkel
Mediehus og forskningsformidling som journalistikk/offentlighet → media hvis redaksjonell praksis er hovedvinkel
Idrettsteknologi brukt i sportskontekst → sport hvis idrettspraksis er hovedvinkel
```

## Kildeprioritet

```text
1. Konkrete institusjoner, universiteter, laboratorier, observatorier, instrumenter, målinger, datasett, forskningsmiljøer, metoder, modeller, teknologiske systemer, medisinske case, miljømålinger eller vitenskapelige gjennombrudd
2. Offisielle universitets-, museums-, institusjons-, arkiv-, forskningsråds-, sykehus-, observatorie-, laboratorie-, rapport-, datasett- eller fagmiljøkilder
3. Vitenskapshistorie, vitenskapsfilosofi, STS, medisin-, teknologi- og naturvitenskapshistorie, forskningspublikasjoner, rapporter, arkiver, fagfellekilder eller dokumentert forskningsformidling
4. Dokumentert vitenskapelig prosess: observasjon, måling, kalibrering, standardisering, replikasjon, modellering, testing, klassifikasjon, datainnsamling, simulering, evidens eller konsensus
5. Dokumentert teknologi- og datainfrastruktur: sensorer, datasett, algoritmer, protokoller, beregning, visualisering, automatisering, datainfrastruktur eller standarder
6. Stedsdata/persondata i appen
7. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Spørsmål skal starte i vitenskapsankeret

Et vitenskapsspørsmål skal starte i minst ett av disse ankrene:

```text
institusjon
universitet
laboratorium
observatorium
arkiv
museum
forskningsmiljø
instrument
måling
kalibrering
standardisering
hypotese
eksperiment
variabel
replikasjon
statistikk
modell
simulering
algoritme
datasett
sensor
protokoll
datainfrastruktur
evidens
paradigme
teori
objektivitet
konsensus
kontrovers
kausalitet
medisin
biologi
klima
miljøovervåking
geologi
økologi
feltarbeid
prøve
forskningsfinansiering
ekspertmakt
vitenskapsetikk
risiko
offentlig tillit
vitenskapsformidling
forskningspolitikk
vitenskapelig kilde
```

Deretter kan fagpakken styre hvilket emne, metode og teorispor som passer.

## Migrering av eksisterende vitenskapsfiler

Når `places_vitenskap.json` og `people_vitenskap.json` ryddes, skal gamle eller feil fagkoblinger byttes ut med vitenskapskoblinger.

Eksempel på feil hovedemner i vitenskapsfil:

```json
"emne_ids": [
  "em_natur_okologi",
  "em_his_institusjonshistorie"
]
```

skal erstattes med relevante `em_vit_*`, for eksempel:

```json
"emne_ids": [
  "em_vit_observasjon_maling",
  "em_vit_instrumenter_maling",
  "em_vit_institusjonell_autoritet"
]
```

Valg av `em_vit_*` skal alltid gjøres ut fra faktisk sted/person/institusjon/metode/instrument/modell/datasett/observasjon/gjennombrudd/teknologi/natur-/medisin-/miljøcase/kontrovers, ikke automatisk fra gamle emner.

## Arbeidsregel

Ikke lag raske oversettelser fra andre fagpakker til `em_vit_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

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

Deretter velges 2–4 presise `em_vit_*`.

## Faste kontrollspørsmål før et sted legges i vitenskap

```text
Er hovedpoenget vitenskapelig?
Finnes det konkret institusjon, metode, instrument, modell, datasett, observasjon, gjennombrudd, kontrovers, forskningsmiljø eller dokumentert vitenskapelig kilde?
Kan quizen bygges fra vitenskapsfaglige, institusjonshistoriske, metodehistoriske, teknologihistoriske, medisinske, miljøfaglige, forskningsmessige, rapportbaserte eller fagfellevurderte kilder?
Er dette egentlig natur, politikk, historie, by, media, kunst, litteratur, sport, musikk, populærkultur, subkultur, psykologi eller næringsliv?
```

Hvis svaret på siste spørsmål er ja, skal stedet flyttes eller holdes i riktig hovedkategori.

## Viktige kategorigrenser

```text
Naturhistorisk museum som klassifikasjon, samling og naturvitenskapelig kunnskapsproduksjon → vitenskap
Naturhistorisk museum som museumsrom eller kulturinstitusjon uten forskningsvinkel → kultur/historie etter hovedvinkel
Botanisk hage som botanikk, samling, taksonomi og forskning → vitenskap
Botanisk hage som park, rekreasjon eller grønt byrom → natur/by etter hovedvinkel
Sykehus som klinisk forskning, evidens, laboratorium og medisinvitenskap → vitenskap
Sykehus som helsetjeneste, pasienttilbud eller forvaltning → politikk/helse etter hovedvinkel
Teknologibygg som forskning, instrumenter, datasett, algoritmer og infrastruktur → vitenskap
Teknologibygg som næringsklynge, produktutvikling eller kapital → næringsliv
Observatorium som måling, instrumenter, observasjon og astronomihistorie → vitenskap
Observatorium som bygg, arkitektur eller kulturminne uten metodevinkel → by/historie etter hovedvinkel
Miljøsted som måling, prøver, feltarbeid, klima og data → vitenskap
Miljøsted som landskap, rekreasjon, artsmangfold eller vern uten forskningsvinkel → natur
```

## Status

Vitenskapspakken inneholder per nå:

```text
6 domener
80 emner
84 metoder
80 emnemappinger
60 topic hooks
8 settfaser i generatorreglene
1 vitenskap-supersetmal
```

Neste arbeid etter denne pakken er å migrere `places_vitenskap.json` og `people_vitenskap.json` slik at de bruker `em_vit_*` og ikke gamle `em_by_*`, `em_his_*`, `em_kunst_*`, `em_lit_*`, `em_media_*`, `em_musikk_*`, `em_pop_*`, `em_pol_*`, `em_naering_*`, `em_natur_*`, `em_psy_*`, `em_sub_*` eller andre fagpakker som hovedemner.
