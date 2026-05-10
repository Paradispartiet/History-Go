# SET_MAL_README – Subkultur v4.3

Denne mappen inneholder den kanoniske fagpakken for `subkultur` i History Go.

Subkulturpakken skal brukes som styringslag for subkulturelle quizzer, subkultursteder og subkulturpersoner. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal fortsatt bygge på konkrete scener, miljøer, ungdomshus, klubber, skateparker, graffitiflater, underganger, øvingsrom, platesjapper, spillbutikker, fanziner, plakater, stickers, digitale fellesskap, motkulturelle hendelser, dokumenterte praksiser, konflikter, kontrollformer, kommersialisering, kulturarv, arkivspor, intervjuer, scenehistorier, lokalhistoriske kilder eller forskningskilder.

## Filer

```text
merke_subkultur.html
fagkart_subkultur_canonical_v4_5.json
methods_subkultur_canonical_v4_5.json
emner_subkultur_canonical_v4_5.json
emnemapping_subkultur_canonical_v4_5.json
subkulturpensum_canonical_v4_5.json
quiz_generator_rules_subkultur_v5_1_source_priority_patch.json
supersetQUIZMAL_subkultur.json
SET_MAL_README_subkultur_v4_3.md
```

## Grunnmodell

```text
merke_subkultur / subkulturteori
↓
fagkart_subkultur
↓
methods_subkultur
↓
emner_subkultur
↓
emnemapping_subkultur
↓
subkulturpensum
↓
quiz_generator_rules_subkultur
↓
supersetQUIZMAL_subkultur
↓
places_subkultur / people_subkultur
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For subkulturfiler betyr det:

```text
places_subkultur / people_subkultur skal bruke em_sub_*
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
em_natur_*
em_psy_*
```

## Hva hører hjemme i subkultur

Et sted eller en person hører hjemme i `subkultur` når hovedpoenget er alternativt fellesskap, scene, miljø, undergrunn, ungdomskultur, portvoktere, ritualer, trygghet, eksklusjon, deltakelse, sosial tilhørighet, stil, symboler, klær, kropp, språk, slang, autentisitet, smak, estetikk, visuelle grenser, remix av stil, subkulturelt sted, skatepark, undergang, graffitiflate, klubb, øvingsrom, okkupert rom, uformell møteplass, territorielle koder, digitalt rom, motkultur, avvik, moralpanikk, politi, kontroll, kriminalisering, regulering, marginalisering, klasse, skeiv motstand, retten til byen, fanziner, plakater, stickers, tags, graffiti, mixtapes, vinyl, gaming, LAN, cosplay, DIY, uavhengige medier, samlerobjekter, nettforum, historisering, kommersialisering, kulturarv, revival, institusjonalisering, merkevarebygging, dokumentasjon, tapte steder eller hvem som får fortelle historien.

Et sted eller en person skal ikke ligge i `subkultur` bare fordi stedet virker urbant, alternativt, ungt, trendy eller kommersielt. Det må finnes en dokumenterbar kobling til scene, miljø, stil, kode, ritual, sted, objekt, praksis, konflikt, kontrollform, kommersialisering, kulturarv eller subkulturell kilde.

Hvis hovedrollen er musikk som musikkfelt, populærkultur som massefenomen, media, kunst, litteratur, sport, næringsliv, politikk, historie, by, natur, psykologi eller vitenskap, skal hovedkategori være den kategorien. Subkultur kan da være tag eller sekundærlag.

## Eksempler på riktig sortering

```text
Blitz → subkultur hvis hovedvinkel er ungdomshus, scene, undergrunn, autonomi, motstand, fellesskap eller konflikt
Hausmania → subkultur hvis hovedvinkel er okkupert/alternativt rom, scene, kulturhus, autonomi, bykamp eller subkulturell praksis
Skur 13 → subkultur hvis hovedvinkel er skate, byrom, praksis, ungdomskultur eller subkulturelt territorium
Vaterland → subkultur hvis hovedvinkel er klubb-/scene-/undergrunnsmiljø, stil, tilhørighet eller uformell kultur
Brenneriveien → subkultur hvis hovedvinkel er scene, klubb, undergrunn, visuell kultur, natteliv eller alternativ møteplass
Torggata → subkultur hvis hovedvinkel er street, stickers, nisjemiljøer, uformell stil, scene, gatekoder eller subkulturell sirkulasjon
Grünerløkka → subkultur hvis hovedvinkel er historisk undergrunn, gentrifisering, stil, miljø, kommersialisering eller tapte steder
Akerselva → subkultur hvis hovedvinkel er graffitiflater, underganger, skate, uformelle møteplasser eller subkulturell bruk av byrom
Outland → subkultur hvis hovedvinkel er nisjefellesskap, gaming, cosplay, fandom, samlerobjekter eller subkulturell deltakelse
Youngstorget → subkultur hvis hovedvinkel er motkultur, protest, scene, ungdomskultur eller alternativ offentlighet
```

```text
Konsertsted der musikkhistorie, sjanger, artister eller konsertkultur er hovedvinkel → musikk
Kino, TV-format, kjendiser, memes og massefenomen → populærkultur
Avisredaksjon, pressehus og journalistikk → media
Kunstmuseer, kunstverk og gallerirom → kunst
Bibliotek, forlag, bokhandel og forfattersteder → litteratur
Idrettsanlegg, klubber og sportsarenaer → sport
Børs, butikker, merkevarer og kapitalmarked som virksomhet → næringsliv
Storting, rådhus, proteststeder og politiske institusjoner → politikk hvis styring/rett er hovedvinkel
Historiske minnesteder og gamle institusjoner uten subkulturell scene/praksis → historie
Parker, torg og gater som byrom, arkitektur eller sosialt rom → by
Natursteder, parker som økosystem og grønnstruktur → natur
Psykisk helse, institusjoner, behandling, stigma og normalitet → psykologi
Forskningsinstitusjoner og teknologimiljøer → vitenskap
```

## Kildeprioritet

```text
1. Konkrete scener, miljøer, ungdomshus, klubber, skateparker, graffitiflater, underganger, øvingsrom, platesjapper, spillbutikker, fanziner, plakater, stickers, digitale fellesskap, motkulturelle hendelser eller dokumenterte subkulturelle praksiser
2. Offisielle arkiv-, museums-, bydel-, kommune-, kulturhus-, klubb-, festival-, organisasjons-, medie-, politirapport-, forsknings- eller institusjonskilder
3. Subkulturforskning, ungdomskulturforskning, byforskning, kulturstudier, etnografi, intervjuer, arkiv, scenehistorie, dokumentasjon, avisomtale eller lokalhistoriske kilder
4. Dokumentert subkulturell prosess: tilhørighet, stil, autentisitet, grensearbeid, ritual, avvik, kontroll, motstand, marginalisering, gentrifisering, kommersialisering eller historisering
5. Dokumentert materiell og romlig praksis: klær, kropp, symboler, koder, tags, graffiti, skate, klubb, DIY, fanzine, LAN, cosplay, øvingsrom, uformelle møteplasser eller digitale rom
6. Stedsdata/persondata i appen
7. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Spørsmål skal starte i subkulturankeret

Et subkulturspørsmål skal starte i minst ett av disse ankrene:

```text
scene
fellesskap
undergrunn
ungdomskultur
portvokter
ritual
tilhørighet
stil
symbol
kode
klær
kropp
slang
autentisitet
smak
visuell grense
skatepark
graffitiflate
klubb
øvingsrom
okkupert rom
uformell møteplass
digitalt rom
motkultur
avvik
moralpanikk
politi
kontroll
kriminalisering
marginalisering
rett til byen
fanzine
plakat
sticker
tag
mixtape
vinyl
gaming
LAN
cosplay
DIY
uavhengige medier
nettforum
kulturarv
kommersialisering
revival
arkiv
tapt sted
scenehistorie
```

Deretter kan fagpakken styre hvilket emne, metode og teorispor som passer.

## Migrering av eksisterende subkulturfiler

Når `places_subkultur.json` og `people_subkultur.json` ryddes, skal gamle eller feil fagkoblinger byttes ut med subkulturkoblinger.

Eksempel på feil hovedemner i subkulturfil:

```json
"emne_ids": [
  "em_musikk_konsertarenaer",
  "em_pop_fans_fandom"
]
```

skal erstattes med relevante `em_sub_*`, for eksempel:

```json
"emne_ids": [
  "em_sub_scene_fellesskap",
  "em_sub_undergrunn_miljo",
  "em_sub_autonomi_motstand"
]
```

Valg av `em_sub_*` skal alltid gjøres ut fra faktisk sted/person/scene/stil/kode/praksis/objekt/konflikt/kontrollform/kommersialisering/kulturarv, ikke automatisk fra gamle emner.

## Arbeidsregel

Ikke lag raske oversettelser fra andre fagpakker til `em_sub_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

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

Deretter velges 2–4 presise `em_sub_*`.

## Faste kontrollspørsmål før et sted legges i subkultur

```text
Er hovedpoenget subkulturelt?
Finnes det konkret scene, miljø, stil, kode, ritual, sted, objekt, praksis, konflikt, kontrollform, kommersialisering, kulturarv eller dokumentert subkulturell kilde?
Kan quizen bygges fra subkulturelle, scenehistoriske, byhistoriske, arkivmessige, forskningsmessige, etnografiske, dokumentasjonsmessige eller lokale kilder?
Er dette egentlig musikk, populærkultur, media, kunst, litteratur, sport, næringsliv, politikk, historie, by, natur, psykologi eller vitenskap?
```

Hvis svaret på siste spørsmål er ja, skal stedet flyttes eller holdes i riktig hovedkategori.

## Viktige kategorigrenser

```text
Skatepark som subkulturell praksis, scene og byrom → subkultur
Skatepark som idrettsanlegg eller treningssted → sport hvis sport er hovedvinkel
Graffitiflate som tag, kontroll, gatekode og visuell praksis → subkultur
Gatekunst som kunsthistorie eller verk → kunst
Klubb som undergrunn, scene, nattkultur og tilhørighet → subkultur
Konsertsted som musikkhistorie, sjanger og artister → musikk
Ungdomshus som autonom scene, undergrunn og motstand → subkultur
Ungdomshus som kommunal tjeneste eller politikk → politikk/by etter hovedvinkel
Spillbutikk som nisjemiljø, gaming, LAN, fandom og deltakelse → subkultur
Spill som masseformat eller popkulturelt fenomen → populærkultur
Fanzine, stickers, tags og DIY-praksis → subkultur
Avis, presse og redaksjonell offentlighet → media
Byrom som uformell møteplass, konflikt og subkulturelt territorium → subkultur
Byrom som arkitektur, trafikk, byplan eller offentlig rom → by
```

## Status

Subkulturpakken inneholder per nå:

```text
6 domener
69 emner
71 metoder
69 emnemappinger
60 topic hooks
8 settfaser i generatorreglene
1 subkultur-supersetmal
1 ny merkefil
```

Neste arbeid etter denne pakken er å migrere `places_subkultur.json` og `people_subkultur.json` slik at de bruker `em_sub_*` og ikke gamle `em_by_*`, `em_his_*`, `em_kunst_*`, `em_lit_*`, `em_media_*`, `em_musikk_*`, `em_pop_*`, `em_vit_*`, `em_pol_*`, `em_naering_*`, `em_natur_*`, `em_psy_*` eller andre fagpakker som hovedemner.
