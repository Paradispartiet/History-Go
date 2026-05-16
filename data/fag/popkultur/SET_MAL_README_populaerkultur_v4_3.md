# SET_MAL_README – Populærkultur v4.3

Denne mappen inneholder den kanoniske fagpakken for `populaerkultur` i History Go.

Populærkulturpakken skal brukes som styringslag for popkulturelle quizzer, populærkultursteder og populærkulturpersoner. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal fortsatt bygge på konkrete formater, filmer, TV-serier, radioprogrammer, spill, klipp, feeds, internettfenomener, memer, virale hendelser, kjendiser, karakterer, fandoms, plattformer, reklamer, merch, filmlokasjoner, kinoer, butikker, oppmerksomhetsdata, seertall, strømmetall, trenddata, arkiver, intervjuer, bransjekilder eller dokumenterte popkulturelle kilder.

## Filer

```text
fagkart_populaerkultur_canonical_v4_5.json
methods_populaerkultur_canonical_v4_5.json
emner_populaerkultur_canonical_v4_5.json
emnemapping_populaerkultur_canonical_v4_5.json
populaerkulturpensum_canonical_v4_5.json
quiz_generator_rules_populaerkultur_v5_1_source_priority_patch.json
supersetQUIZMAL_populaerkultur.json
SET_MAL_README_populaerkultur_v4_3.md
```

## Grunnmodell

```text
merke_populaerkultur / populærkulturteori
↓
fagkart_populaerkultur
↓
methods_populaerkultur
↓
emner_populaerkultur
↓
emnemapping_populaerkultur
↓
populaerkulturpensum
↓
quiz_generator_rules_populaerkultur
↓
supersetQUIZMAL_populaerkultur
↓
places_populaerkultur / people_populaerkultur
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For populærkulturfiler betyr det:

```text
places_populaerkultur / people_populaerkultur skal bruke em_pop_*
```

De skal ikke bruke:

```text
em_by_*
em_his_*
em_kunst_*
em_lit_*
em_media_*
em_musikk_*
em_vit_*
em_pol_*
em_naering_*
em_natur_*
```

## Hva hører hjemme i populærkultur

Et sted eller en person hører hjemme i `populaerkultur` når hovedpoenget er massefenomen, medieformat, film, TV, serie, radio, podcast, spill, streaming, klipp, feed, plattform, algoritmisk synlighet, publikumsrytme, ikon, kjendis, karakter, rollefigur, programleder, komiker, maskot, merkefigur, ikonisk scene, hype, skandale, visuell gjenkjennelse, fandom, fans, referansefellesskap, smak, status, generasjonsminne, cosplay, deltakelse, remix, fanobjekt, tilhørighet, internettkultur, meme, viralitet, influencer, metrics, likes, delinger, kommentarfelt, trendbølge, plattformskifte, digital offentlighet, representasjon, normer, kropp, kjønn, relasjoner, humor, stereotypier, verdensbilder, kollektiv fantasi, popkulturell doxa, filmlokasjon, kino, popkulturelt sted, butikk, merch, samlerkultur, reklameflate, opplevelsesøkonomi, hype-maskineri eller usynlig arbeid i popkultur.

Et sted eller en person skal ikke ligge i `populaerkultur` bare fordi stedet er kjent, besøkt, kommersielt, underholdende eller fordi mange liker det. Det må finnes en dokumenterbar kobling til format, ikon, karakter, meme, fandom, plattform, representasjon, objekt, sted, reklame, merch, sirkulasjon, kollektiv referanse eller popkulturell kilde.

Hvis hovedrollen er media som journalistikk/institusjon, musikk som musikkfelt, kunst, litteratur, sport, næringsliv, politikk, historie, by, natur, vitenskap eller subkultur, skal hovedkategori være den kategorien. Populærkultur kan da være tag eller sekundærlag.

## Eksempler på riktig sortering

```text
Colosseum kino → populærkultur hvis hovedvinkel er kino, filmformat, publikumsrytme eller felles visning
Filmens hus → populærkultur hvis hovedvinkel er filmkultur, format, visning, arkiv eller popkulturell sirkulasjon
NRK Marienlyst → populærkultur hvis hovedvinkel er TV-format, program, karakterer, kjendiser, publikumsrytmer eller medieminner
Outland → populærkultur hvis hovedvinkel er fandom, samlerkultur, fanobjekter, spill, tegneserier eller referansefellesskap
Torggata → populærkultur hvis hovedvinkel er trend, feed, byrom som scene, internettkultur eller populærkulturell sirkulasjon
Grünerløkka → populærkultur hvis hovedvinkel er trend, identitet, livsstilsformat, fandom, visuell kultur eller populær referanse
Karl Johans gate → populærkultur hvis hovedvinkel er reklameflate, ikonisk byrom, massepublikum, sirkulasjon eller popkulturell synlighet
Aker Brygge → populærkultur hvis hovedvinkel er livsstilsfantasi, reklame, kommers, opplevelsesøkonomi eller visuell gjenkjennelse
Oslo S → populærkultur hvis hovedvinkel er kollektiv referanse, byrom som scene, viral lokasjon eller populærkulturelt motiv
Rockefeller / Sentrum Scene → populærkultur hvis hovedvinkel er popkulturelt massefenomen, publikumsritual, ikonisk scene eller fandom
```

```text
Avisredaksjon, pressehus og journalistikk → media
Musikkarenaer der musikkfelt, sjangerhistorie eller konsertkultur er hovedvinkel → musikk
Kunstmuseer, kunstverk og gallerirom → kunst
Bibliotek, forlag, bokhandel og forfattersteder → litteratur
Idrettsanlegg, klubber og sportsarenaer → sport
Børs, butikkjeder, reklamebransje og kapitalmarked som virksomhet → næringsliv
Storting, rådhus, proteststeder og politiske institusjoner → politikk
Historiske minnesteder og gamle institusjoner uten popkulturell sirkulasjon → historie
Parker, torg og gater som byrom, arkitektur eller sosialt rom → by
Natursteder, parker som økosystem og grønnstruktur → natur
Forskningsinstitusjoner og teknologimiljøer → vitenskap
Subkulturelle steder der undergrunn, scene, stil eller motkultur er hovedpoeng → subkultur
```

## Kildeprioritet

```text
1. Konkrete formater, filmer, TV-serier, radioprogrammer, spill, klipp, feeds, internettfenomener, memer, virale hendelser, kjendiser, karakterer, fandoms, plattformer, reklamer, merch, filmlokasjoner eller popkulturelle hendelser
2. Offisielle medie-, produksjons-, studio-, kino-, plattform-, arkiv-, museum-, bransje-, publikums-, seertall-, strømme-, spill- eller institusjonskilder
3. Mediehistorie, populærkulturforskning, resepsjonsdata, trenddata, seertall, klikk, likes, delinger, arkivbeskrivelser, intervjuer, bransjedata eller forskningskilder
4. Dokumentert sirkulasjon: ikonisk øyeblikk, sitat, deling, fandom, representasjon, trend, viralt spor, plattformskifte, gjenkjennelse eller kollektiv referanse
5. Dokumentert oppmerksomhetsøkonomi: hype, skandale, metrics, algoritmisk synlighet, plattformlogikk, reklame, kommers, samlerkultur eller merch
6. Stedsdata/persondata i appen
7. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Spørsmål skal starte i populærkulturankeret

Et populærkulturspørsmål skal starte i minst ett av disse ankrene:

```text
format
film
TV
serie
radio
podcast
spill
streaming
klipp
feed
plattform
algoritme
ikon
kjendis
karakter
programleder
komiker
maskot
sitat
meme
viral hendelse
influencer
fandom
fanobjekt
cosplay
remix
referansefellesskap
representasjon
stereotypi
kroppsnorm
kjønnsnorm
humor
kollektiv fantasi
kino
filmlokasjon
butikk
merch
reklameflate
hype
skandale
oppmerksomhetsøkonomi
metrics
arkiv
seertall
strømmetall
trenddata
plattformdata
bransjekilde
resepsjonsdata
```

Deretter kan fagpakken styre hvilket emne, metode og teorispor som passer.

## Migrering av eksisterende populærkulturfiler

Når `places_populaerkultur.json` og `people_populaerkultur.json` ryddes, skal gamle eller feil fagkoblinger byttes ut med populærkulturkoblinger.

Eksempel på feil hovedemner i populærkulturfil:

```json
"emne_ids": [
  "em_media_presse_offentlighet",
  "em_musikk_konsertarenaer"
]
```

skal erstattes med relevante `em_pop_*`, for eksempel:

```json
"emne_ids": [
  "em_pop_film_tv_format",
  "em_pop_kino_populaer_offentlighet",
  "em_pop_publikum_rytme_vaner"
]
```

Valg av `em_pop_*` skal alltid gjøres ut fra faktisk sted/person/format/ikon/meme/fandom/plattform/representasjon/objekt/sirkulasjon, ikke automatisk fra gamle emner.

## Arbeidsregel

Ikke lag raske oversettelser fra andre fagpakker til `em_pop_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

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

Deretter velges 2–4 presise `em_pop_*`.

## Faste kontrollspørsmål før et sted legges i populærkultur

```text
Er hovedpoenget popkulturelt?
Finnes det konkret format, ikon, karakter, meme, fandom, plattform, representasjon, objekt, sted, reklame, merch, sirkulasjon eller kollektiv referanse?
Kan quizen bygges fra popkulturelle, mediehistoriske, resepsjonsmessige, plattformmessige, bransjemessige eller dokumenterte sirkulasjonskilder?
Er dette egentlig media, musikk, kunst, litteratur, sport, næringsliv, politikk, historie, by, natur, vitenskap eller subkultur?
```

Hvis svaret på siste spørsmål er ja, skal stedet flyttes eller holdes i riktig hovedkategori.

## Viktige kategorigrenser

```text
Kino som filmvisning, publikumsritual og populærkulturelt fellesminne → populærkultur
Kino som arkitektur eller byhistorie → by/historie
TV-studio som programformat, kjendiser, karakterer og felles medieminner → populærkultur
TV-studio som journalistisk institusjon og nyhetsproduksjon → media
Konsertsted som popkulturelt ikon, fandom eller massefenomen → populærkultur
Konsertsted som musikkhistorie, scene eller sjangerfelt → musikk
Butikk som fanobjekter, merch, samlerkultur eller fandom → populærkultur
Butikk som varehandel, merkevare, eierskap eller kapital → næringsliv
Reklameflate som synlighet, visuell slagkraft eller oppmerksomhetsøkonomi → populærkultur
Reklamebransje som virksomhet eller marked → næringsliv
Meme, viralitet, influencers og feeds → populærkultur
Journalistikk, redaksjon og presseoffentlighet → media
Filmlokasjon som kollektiv referanse eller populær scene → populærkultur
Filmlokasjon som byrom eller arkitektur uten sirkulasjon → by
Subkulturell scene, stil og motkultur → subkultur hvis undergrunn/scene er hovedvinkel
```

## Status

Populærkulturpakken inneholder per nå:

```text
6 domener
56 emner
48 metoder
56 emnemappinger
60 topic hooks
8 settfaser i generatorreglene
1 populærkultur-supersetmal
```

Neste arbeid etter denne pakken er å migrere `places_populaerkultur.json` og `people_populaerkultur.json` slik at de bruker `em_pop_*` og ikke gamle `em_by_*`, `em_his_*`, `em_kunst_*`, `em_lit_*`, `em_media_*`, `em_musikk_*`, `em_naering_*`, `em_pol_*`, `em_natur_*` eller andre fagpakker som hovedemner.
