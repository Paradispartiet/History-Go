# SET_MAL_README – Politikk v4.3

Denne mappen inneholder den kanoniske fagpakken for `politikk` i History Go.

Politikkpakken skal brukes som styringslag for politiske og samfunnsfaglige quizzer, politikksteder og politikkpersoner. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal fortsatt bygge på konkrete institusjoner, lover, vedtak, reformer, offentlige rom, rettsbygg, forvaltningssteder, demokratiske arenaer, velferdstjenester, konflikter, proteststeder, normsystemer, fordelingsdata, rettskilder, budsjett, reguleringsplaner, statistikk, arkiver, offentlige dokumenter eller dokumenterte samfunnsfaglige kilder.

## Filer

```text
fagkart_politikk_canonical_v4_5.json
methods_politikk_canonical_v4_5.json
emner_politikk_canonical_v4_5.json
emnemapping_politikk_canonical_v4_5.json
politikkpensum_canonical_v4_5.json
quiz_generator_rules_politikk_v5_1_source_priority_patch.json
supersetQUIZMAL_politikk.json
SET_MAL_README_politikk_v4_3.md
```

## Grunnmodell

```text
merke_politikk / politikk- og samfunnsteori
↓
fagkart_politikk
↓
methods_politikk
↓
emner_politikk
↓
emnemapping_politikk
↓
politikkpensum
↓
quiz_generator_rules_politikk
↓
supersetQUIZMAL_politikk
↓
places_politikk / people_politikk
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For politikkfiler betyr det:

```text
places_politikk / people_politikk skal bruke em_pol_*
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
em_naering_*
em_natur_*
```

## Hva hører hjemme i politikk

Et sted eller en person hører hjemme i `politikk` når hovedpoenget er styring, institusjon, forvaltning, byråkrati, offentlig administrasjon, kommunal struktur, beslutningssystem, rådhus, Storting, departement, regjeringsbygg, bydelshus, offentlig tjeneste, demokrati, valg, representasjon, parlamentarisme, lokaldemokrati, offentlighet, debatt, politisk symbol, politisk møteplass, rettsstat, domstol, lov, rettighet, plikt, straff, kontroll, rettssikkerhet, borger–stat-relasjon, fordeling, velferd, levekår, ulikhet, klasse, boligpolitikk, helsepolitikk, sosialpolitikk, utdanning, demografi, budsjett, ressursprioritering, politisk konflikt, makt, interessegruppe, sivilsamfunn, organisasjon, demonstrasjon, protest, aktivisme, ideologi, konfliktlinje, normer, normalitet, minoritet, majoritet, identitet, kjønn, familie, integrering, migrasjon, hverdagsliv, sosial kontroll, legitimitet, tillit, ytringsfrihet, symbolsk makt eller strukturell vold.

Et sted eller en person skal ikke ligge i `politikk` bare fordi stedet ligger nær et maktbygg, har en vag samfunnsvinkel eller kan tolkes politisk i bred forstand. Det må finnes en dokumenterbar kobling til styring, institusjon, lov, vedtak, reform, offentlig tjeneste, rettighet, fordeling, velferd, konflikt, representasjon, norm, offentlighet, sosial prosess eller samfunnsfaglig kilde.

Hvis hovedrollen er byarkitektur, historie, næringsliv, media, kunst, litteratur, musikk, sport, natur, vitenskap eller populærkultur, skal hovedkategori være den kategorien. Politikk kan da være tag eller sekundærlag.

## Eksempler på riktig sortering

```text
Stortinget → politikk
Oslo rådhus → politikk
Regjeringskvartalet → politikk
Oslo tinghus → politikk
Høyesterett → politikk
Eidsvolls plass → politikk hvis hovedvinkel er demokrati, offentlighet, protest eller politisk symbolikk
Youngstorget → politikk hvis hovedvinkel er protest, arbeiderbevegelse, organisering, sivilsamfunn eller politisk offentlighet
Rådhusplassen → politikk hvis hovedvinkel er offentlig rom, styring, seremoni, demokratisk symbolikk eller politisk markering
NAV-kontor → politikk hvis hovedvinkel er velferdsstat, rettigheter, forvaltning eller offentlig tjeneste
Ullevål sykehus → politikk hvis hovedvinkel er helsepolitikk, offentlig tjeneste, velferd eller prioritering
Tøyen → politikk hvis hovedvinkel er levekår, demografi, ulikhet, integrering eller bypolitikk
Groruddalen → politikk hvis hovedvinkel er levekår, integrering, bypolitikk, fordeling eller representasjon
Familievernkontor → politikk hvis hovedvinkel er familie, stat, omsorg, rettigheter eller offentlig tjeneste
LO-bygget → politikk hvis hovedvinkel er arbeidslivspolitikk, kollektiv kamp, organisasjon eller interessepolitikk
```

```text
Rådhus som arkitekturhistorie → by/historie hvis arkitekturen eller historien er hovedvinkel
Avisredaksjon, pressehus og journalistikk → media
Børs, bank, kapitalmarked og forretningshovedkontor → næringsliv
Parker som byrom, lek og opphold → by
Parker som økosystem, habitat eller grønnstruktur → natur
Kunstmuseer, monumenter og kunstparker → kunst hvis kunstverkene er hovedvinkel
Litteraturhus, bibliotek og forlag → litteratur hvis litteratur/offentlig samtale som kulturfelt er hovedvinkel
Konsertscener og musikkarenaer → musikk
Forskningsinstitusjoner → vitenskap hvis kunnskapsproduksjonen er hovedvinkel
Idrettsanlegg og sportsarenaer → sport
```

## Kildeprioritet

```text
1. Konkrete institusjoner, lover, reformer, offentlige rom, rettsbygg, forvaltningssteder, demokratiske arenaer, velferdstjenester, konflikter, proteststeder, normsystemer og sosiale prosesser
2. Offisielle kommune-, stat-, Storting-, domstol-, Lovdata-, SSB-, arkiv-, partiprogram-, utrednings-, rapport-, budsjett-, reguleringsplan- eller institusjonskilder
3. Politisk historie, samfunnsfaglig forskning, rettskilder, NOU-er, stortingsmeldinger, kommunale dokumenter, statistikk, levekårsdata, demografiske data og forvaltningsdokumenter
4. Dokumentert samfunnsprosess: styring, representasjon, fordeling, rettssikkerhet, regulering, konflikt, offentlighet, legitimitet, normalitet, sosial kontroll eller kollektiv beslutning
5. Dokumentert politisk offentlighet: debatt, protest, organisering, partier, bevegelser, interessegrupper, sivilsamfunn, ytringsfrihet, polarisering og demokratiske møteplasser
6. Stedsdata/persondata i appen
7. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Spørsmål skal starte i politikkankeret

Et politikkspørsmål skal starte i minst ett av disse ankrene:

```text
institusjon
offentlig bygg
kommune
Storting
rådhus
departement
regjeringsbygg
tinghus
domstol
lov
rettskilde
rettighet
plikt
forvaltningsvedtak
offentlig tjeneste
velferdstjeneste
budsjett
fordeling
statistikk
levekårsdata
valg
representasjon
offentlighet
debattarena
politisk symbol
parti
bevegelse
sivilsamfunn
protest
konflikt
interessegruppe
norm
normalitet
minoritet
majoritet
identitet
migrasjon
integrering
sosial kontroll
legitimitet
tillit
bypolitikk
reguleringsplan
arkiv
NOU
stortingsmelding
kommunalt dokument
```

Deretter kan fagpakken styre hvilket emne, metode og teorispor som passer.

## Migrering av eksisterende politikkfiler

Når `places_politikk.json` og `people_politikk.json` ryddes, skal gamle eller feil fagkoblinger byttes ut med politikkkoblinger.

Eksempel på feil hovedemner i politikkfil:

```json
"emne_ids": [
  "em_by_transformasjon_ombruk",
  "em_his_minnesteder_historiebruk"
]
```

skal erstattes med relevante `em_pol_*`, for eksempel:

```json
"emne_ids": [
  "em_pol_institusjoner_styring",
  "em_pol_maktens_geografi",
  "em_pol_offentlighet_debatt"
]
```

Valg av `em_pol_*` skal alltid gjøres ut fra faktisk sted/person/institusjon/lov/konflikt/fordeling/norm/offentlighet/sosial prosess, ikke automatisk fra gamle emner.

## Arbeidsregel

Ikke lag raske oversettelser fra andre fagpakker til `em_pol_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

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

Deretter velges 2–4 presise `em_pol_*`.

## Faste kontrollspørsmål før et sted legges i politikk

```text
Er hovedpoenget politisk eller samfunnsfaglig?
Finnes det konkret institusjon, lov, vedtak, reform, offentlig tjeneste, rettighet, fordeling, konflikt, norm, representasjon, offentlighet eller sosial prosess?
Kan quizen bygges fra politiske, rettslige, forvaltningsmessige, statistiske, historiske eller samfunnsfaglige kilder?
Er dette egentlig by, historie, næringsliv, media, kunst, litteratur, musikk, sport, natur, vitenskap eller populærkultur?
```

Hvis svaret på siste spørsmål er ja, skal stedet flyttes eller holdes i riktig hovedkategori.

## Viktige kategorigrenser

```text
Storting, rådhus, departement, regjeringsbygg og offentlige styringsbygg → politikk
Domstoler, tinghus, rettsstat og rettskilder → politikk
Offentlig tjeneste, velferd, NAV, helsepolitikk og fordeling → politikk
Proteststeder, demonstrasjonsplasser og organisasjonsbygg → politikk hvis politisk organisering eller konflikt er hovedvinkel
Youngstorget som arbeiderbevegelse/protest/offentlighet → politikk
Youngstorget som byrom, servering og torgliv → by
Børs, bank og kapitalmarked → næringsliv
Presse, avisredaksjon og journalistikk → media
Kunstverk, monumenter og skulpturer → kunst hvis kunstverkene er hovedvinkel
Minnested som politisk kamp, terror, rettsstat eller offentlig sorg → politikk/historie etter hovedvinkel
Historisk minnespor uten samfunnsfaglig nåtids- eller institusjonsvinkel → historie
Park som offentlig møteplass, byrom eller sosialt rom → by
Park som habitat, grønnstruktur eller økosystem → natur
Miljøpolitisk kamp eller forvaltningskonflikt → politikk hvis konflikt/styring er hovedvinkel, natur hvis økologisk prosess er hovedvinkel
Forskningsinstitusjon → vitenskap hvis forskning/kunnskapsproduksjon er hovedvinkel
Partikontor, fagforening, interessegruppe og organisasjonsbygg → politikk hvis organisering/makt/interesser er hovedvinkel
```

## Status

Politikkpakken inneholder per nå:

```text
6 domener
59 emner
38 metoder
59 emnemappinger
60 topic hooks
8 settfaser i generatorreglene
1 politikk-supersetmal
```

Neste arbeid etter denne pakken er å migrere `places_politikk.json` og `people_politikk.json` slik at de bruker `em_pol_*` og ikke gamle `em_by_*`, `em_his_*`, `em_kunst_*`, `em_lit_*`, `em_media_*`, `em_musikk_*`, `em_naering_*`, `em_natur_*` eller andre fagpakker som hovedemner.
