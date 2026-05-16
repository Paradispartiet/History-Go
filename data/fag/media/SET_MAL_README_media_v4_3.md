# SET_MAL_README – Media v4.3

Denne mappen inneholder den kanoniske fagpakken for `media` i History Go.

Media-pakken skal brukes som styringslag for mediaquizzer, mediesteder og mediepersoner. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal bygge på konkrete aviser, redaksjoner, mediehus, trykkerier, presseklubber, nyhetssaker, kilder, journalister, redaktører, plattformer, publiseringer, debatter, arkiver, pressehistoriske steder, presseetiske dokumenter, plattformdata, medieøkonomi eller dokumenterte medieprosesser.

## Filer

```text
merke_media.html
fagkart_media_canonical_v4_5.json
methods_media_canonical_v4_5.json
emner_media_canonical_v4_5.json
emnemapping_media_canonical_v4_5.json
mediapensum_canonical_v4_5.json
quiz_generator_rules_media_v5_1_source_priority_patch.json
supersetQUIZMAL_media.json
SET_MAL_README_media_v4_3.md
```

## Grunnmodell

```text
merke_media / medieteori
↓
fagkart_media
↓
methods_media
↓
emner_media
↓
emnemapping_media
↓
mediapensum
↓
quiz_generator_rules_media
↓
supersetQUIZMAL_media
↓
places_media / people_media
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For mediafiler betyr det:

```text
places_media / people_media skal bruke em_media_*
```

De skal ikke bruke:

```text
em_by_*
em_his_*
em_kunst_*
em_lit_*
em_musikk_*
em_pop_*
em_pol_*
em_naering_*
em_natur_*
em_psy_*
em_sub_*
em_vit_*
em_sport_*
em_film_tv_*
```

## Hva hører hjemme i Media

Et sted eller en person hører hjemme i `media` når hovedpoenget er presse, journalistikk, avis, redaksjon, mediehus, trykkeri, presseklubb, journalist, redaktør, desk, forside, nyhetsarbeid, pressehistorie, offentlighet, ytringsfrihet, pressefrihet, kildevern, redaktøransvar, medieetikk, debatt, tillit, pressekritikk, kildekritikk, faktasjekk, verifisering, framing, diskurs, nyhetsverdi, objektivitet, ekspertkilder, datajournalistikk, feilinformasjon, dokumentasjon, plattform, algoritme, feed, søk, deling, moderering, annonsemodell, metrikk, pushvarsel, distribusjon, digital offentlighet, propaganda, desinformasjon, politisk kommunikasjon, sensur, konspirasjoner, kriseretorikk, bots, troll, polarisering, krigsbilder, informasjonskrig, medieeierskap, medieøkonomi, annonseøkonomi, betalingsmur, journalistisk arbeidsliv, mediekonsern, nedbemanning, teknologisk omstilling eller kommersialisering.

Et sted eller en person skal ikke ligge i `media` bare fordi stedet er omtalt i media. Det må finnes en dokumenterbar kobling til medieproduksjon, redaksjon, pressehistorie, publisering, kildearbeid, plattform, offentlighet, medieøkonomi eller medieprosess.

Hvis hovedrollen er Film & TV, populærkultur, politikk, næringsliv, litteratur, kunst, musikk, by, historie, subkultur, teknologi, sport, natur, psykologi eller vitenskap, skal hovedkategori være den kategorien. Media kan da være tag eller sekundærlag.

## Eksempler på riktig sortering

```text
Akersgata → media hvis hovedvinkel er avishistorie, redaksjoner, pressehistorie, nyhetsarbeid eller mediehus
Pressens hus → media hvis hovedvinkel er presse, journalistikk, presseetikk, offentlighet eller mediebransje
VG-huset → media hvis hovedvinkel er avis, redaksjon, digital publisering, tabloid presse eller medieøkonomi
Aftenposten → media hvis hovedvinkel er avis, redaksjon, pressehistorie, offentlighet eller nyhetsproduksjon
NRK Marienlyst → media hvis hovedvinkel er kringkasting, nyheter, redaksjon, offentlighet eller journalistikk
NRK Marienlyst → film_tv hvis hovedvinkel er TV-serier, produksjoner, underholdning, audiovisuelle verk eller TV-format
Stortinget → media hvis hovedvinkel er pressekonferanse, politisk journalistikk, offentlighet eller makt møter presse
Stortinget → politikk hvis hovedvinkel er lovgivning, parti, styring eller parlamentarisme
Tinghuset → media hvis hovedvinkel er rettsreportasje, offentlighet, presseetikk eller kildearbeid
Tinghuset → politikk/rett/historie hvis hovedvinkel er domstol, rettsstat eller konkret rettshistorie
```

## Kildeprioritet

```text
1. Konkret avis, redaksjon, mediehus, trykkeri, presseklubb, nyhetssak, kilde, journalist, redaktør, plattform, publisering, debatt, arkiv eller dokumentert mediespor
2. Offisiell presse-, redaksjons-, mediehus-, arkiv-, avis-, kringkastings-, organisasjons-, plattform-, PFU-, presseetisk-, database- eller lokalhistorisk kilde
3. Pressehistorie, mediehistorie, journalistikkforskning, offentlighetsteori, mediesosiologi, plattformstudier, propaganda-/desinformasjonsforskning, medieøkonomi eller arkivkilde
4. Dokumentert medieprosess: kildearbeid, verifisering, publisering, redigering, framing, distribusjon, moderering, debatt, rettelse, arkivering eller algoritmisk synlighet
5. Dokumentert materiell og romlig praksis: redaksjon, avishus, trykkeri, TV-/radiohus, presseklubb, kamera, mikrofon, desk, server, publiseringsverktøy, forside, overskrift, pressefoto eller nyhetsarkiv
6. Stedsdata/persondata i appen
7. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Spørsmål skal starte i mediaankeret

Et mediaspørsmål skal starte i minst ett av disse ankrene:

```text
avis
redaksjon
mediehus
trykkeri
presseklubb
journalist
redaktør
kilde
varsler
forside
overskrift
offentlighet
ytringsfrihet
pressefrihet
kildevern
redaktøransvar
medieetikk
faktasjekk
verifisering
framing
diskurs
nyhetsverdi
plattform
algoritme
feed
søk
moderering
annonsemodell
propaganda
desinformasjon
sensur
medieeierskap
medieøkonomi
journalistisk arbeidsliv
mediekilde
```

Deretter kan fagpakken styre hvilket emne, metode og teorispor som passer.

## Viktige kategorigrenser

```text
Nyhetsredaksjon, avis, pressehistorie, kildearbeid og offentlighet → media
TV-serie, filmverk, scene, kino, location eller audiovisuelle produksjoner → film_tv
Kjendis, fandom, massefenomen og underholdningsreferanser uten redaksjonell funksjon → populaerkultur
Partier, lover, styring, forvaltning og ideologi uten presse-/offentlighetsvinkel → politikk
Sponsor, konsern, marked og kommersiell virksomhet uten publisering/redaksjon/medieøkonomi som hovedvinkel → naeringsliv
Teknologi, data eller algoritmer uten publisering, feed, plattformoffentlighet eller distribusjon → vitenskap/næringsliv etter hovedvinkel
Teater, musikk, kunst eller litteratur som omtales i media → hovedkategori etter uttrykksform, media som sekundært tag
```

## Migrering av eksisterende mediafiler

Når `places_oslo_media.json` og `people_media.json` ryddes, skal gamle eller feil fagkoblinger byttes ut med mediekoblinger.

Eksempel på feil hovedemner i mediafil:

```json
"emne_ids": [
  "em_pol_offentlighet",
  "em_film_tv_kringkasting"
]
```

skal erstattes med relevante `em_media_*`, for eksempel:

```json
"emne_ids": [
  "em_media_avishus_offentlighetsrom",
  "em_media_redaksjon_desk",
  "em_media_kildearbeid"
]
```

Valg av `em_media_*` skal alltid gjøres ut fra faktisk sted/person/redaksjon/avis/sak/kilde/publisering/plattform/offentlighet/medieprosess, ikke automatisk fra gamle emner.

## Arbeidsregel

Ikke lag raske oversettelser fra andre fagpakker til `em_media_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

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

Deretter velges 2–4 presise `em_media_*`.

## Faste kontrollspørsmål før et sted legges i media

```text
Er hovedpoenget mediefaglig?
Finnes det konkret redaksjon, avis, mediehus, sak, kilde, publisering, plattform, offentlighet, pressehistorie eller dokumentert medieprosess?
Kan quizen bygges fra pressehistoriske, mediehistoriske, journalistiske, redaksjonelle, presseetiske, plattformmessige, medieøkonomiske, arkivbaserte eller lokalhistoriske kilder?
Er dette egentlig Film & TV, populærkultur, politikk, næringsliv, litteratur, kunst, musikk, by, historie, subkultur eller teknologi?
```

Hvis svaret på siste spørsmål er ja, skal stedet flyttes eller holdes i riktig hovedkategori.

## Status

Media-pakken inneholder per nå:

```text
6 domener
118 emner
115 metoder
118 emnemappinger
60 topic hooks
8 settfaser i generatorreglene
1 media-supersetmal
1 media-merkefil
```

Neste arbeid etter denne pakken er å migrere `places_oslo_media.json` og `people_media.json` slik at de bruker `em_media_*` og ikke gamle `em_by_*`, `em_his_*`, `em_kunst_*`, `em_lit_*`, `em_musikk_*`, `em_pop_*`, `em_pol_*`, `em_naering_*`, `em_natur_*`, `em_psy_*`, `em_sub_*`, `em_vit_*`, `em_sport_*`, `em_film_tv_*` eller andre fagpakker som hovedemner.
