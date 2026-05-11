# SET_MAL_README – Sport & lek v4.3

Denne mappen inneholder den kanoniske fagpakken for `sport` i History Go.

Sportpakken skal brukes som styringslag for sportquizzer, sportsteder, sportspersoner, Groundhopper-spor og idrettsbasert samling. Den skal ikke brukes som erstatning for eksterne kilder. Faktapåstander i quizzer skal bygge på konkrete arenaer, stadioner, baner, haller, løkker, svømmehaller, skøytebaner, skibakker, klubbhus, idrettslag, turneringer, kamper, rekorder, spillere, trenere, supportere, lekeplasser, treningssteder, anlegg, frivillighet, idrettsorganisering, folkehelse, kroppslig praksis, Groundhopper-relevante steder, kampdata, statistikk, arkiv, forbundskilder, klubbhistorier, anleggskilder, biografier eller lokalhistoriske kilder.

## Filer

```text
merke_sport.html
fagkart_sport_canonical_v4_5.json
methods_sport_canonical_v4_5.json
emner_sport_canonical_v4_5.json
emnemapping_sport_canonical_v4_5.json
sportpensum_canonical_v4_5.json
quiz_generator_rules_sport_v5_1_source_priority_patch.json
supersetQUIZMAL_sport.json
SET_MAL_README_sport_v4_3.md
```

## Grunnmodell

```text
merke_sport / sportteori
↓
fagkart_sport
↓
methods_sport
↓
emner_sport
↓
emnemapping_sport
↓
sportpensum
↓
quiz_generator_rules_sport
↓
supersetQUIZMAL_sport
↓
places_sport / people_sport
↓
Groundhopper / profil / samling
```

## Hovedregel

```text
category = hovedfaget / hovedmerket
emne_ids = emner fra riktig fagpakke
tags = sekundære lag
```

For sportfiler betyr det:

```text
places_sport / people_sport skal bruke em_sport_*
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
em_vit_*
```

## Hva hører hjemme i sport

Et sted eller en person hører hjemme i `sport` når hovedpoenget er idrett, lek, arena, anlegg, stadion, bane, hall, løkke, skøytebane, svømmehall, skibakke, klubbhus, tribune, Groundhopper-relevant idrettssted, regler, spillform, konkurranse, fair play, dommer, turnering, rekord, ranking, tabell, rivalisering, taktikk, kampformat, kropp, trening, teknikk, prestasjon, mestring, belastning, restitusjon, talentutvikling, idrettsteknologi, prestasjonsdata, klubb, lag, trener, frivillighet, dugnad, breddeidrett, elite, lokalmiljø, støtteapparat, idrettsfamilier, supporterkultur, publikum, chants, ritualer, helter, legender, lokal identitet, supporterobjekter, kampdag, barns lek, folkehelse, inkludering, kjønn, klasse, funksjonsevne, minoriteter, anleggspolitikk, frafall, byromslek eller uorganisert fysisk aktivitet.

Et sted eller en person skal ikke ligge i `sport` bare fordi stedet er en park, et byrom, et helsested, et skoleområde eller et aktivitetsområde. Det må finnes en dokumenterbar kobling til idrett, lek, trening, anlegg, konkurranse, fysisk aktivitet, klubb, kamp, spiller, supporter, prestasjon eller idrettskilde.

Hvis hovedrollen er by, natur, politikk, næringsliv, media, populærkultur, subkultur, psykologi, vitenskap, musikk, kunst, litteratur eller historie, skal hovedkategori være den kategorien. Sport kan da være tag eller sekundærlag.

## Eksempler på riktig sortering

```text
Bislett Stadion → sport hvis hovedvinkel er arena, friidrett, stadionminne, rekorder, publikum, kampdag, Groundhopper eller idrettshistorie
Ullevaal Stadion → sport hvis hovedvinkel er fotballarena, landslag, klubbhistorie, kampdag, supporterkultur eller Groundhopper
Jordal Amfi → sport hvis hovedvinkel er ishockey, skøyter, arena, lokal idrettshistorie, publikum eller anleggshistorie
Frogner stadion → sport hvis hovedvinkel er skøyter, idrettsarena, trening, konkurranse eller stadionhistorie
Vallhall → sport hvis hovedvinkel er fotballhall, trening, klubb, bredde/elite eller idrettsinfrastruktur
Ekebergsletta → sport hvis hovedvinkel er turnering, Norway Cup, fotball, breddeidrett, barn/ungdom eller idrettsminne
Holmenkollen → sport hvis hovedvinkel er ski, hopp, arena, nasjonal idrettshistorie, prestasjon eller Groundhopper
Sognsvann → sport hvis hovedvinkel er løping, trening, kroppslig praksis, mosjon eller folkehelse
Skatepark → sport hvis hovedvinkel er fysisk aktivitet, teknikk, treningssted, konkurranse eller anlegg
Skatepark → subkultur hvis hovedvinkel er subkulturell scene, stil, kode, gatepraksis eller undergrunn
```

## Kildeprioritet

```text
1. Konkret stadion, bane, hall, løkke, svømmehall, skøytebane, skibakke, klubbhus, idrettslag, turnering, kamp, rekord, spiller, trener, supporterobjekt, lekeplass eller dokumentert aktivitet
2. Offisiell klubb-, forbunds-, kommune-, anleggs-, arkiv-, museums-, statistikk-, idrettshistorisk-, avis-, rapport- eller arrangementskilde
3. Idrettshistorie, idrettssosiologi, kroppskultur, folkehelse, organisasjonsforskning, supporterforskning, treningslære, lekteori, biografier, kampdata eller lokalhistorisk kilde
4. Dokumentert idrettslig prosess: trening, prestasjon, regelbruk, konkurranse, rekord, lagbygging, frivillighet, supporterkultur, inkludering, frafall, folkehelse eller lek
5. Dokumentert materiell og romlig praksis: bane, mål, nett, linjer, tribune, garderobe, resultattavle, ball, ski, skøyter, sykkel, drakt, klubbmerke, medalje, billett, supporterutstyr eller treningsdata
6. Stedsdata/persondata i appen
7. Fagkart, methods, emner, mapping og pensum som styring – ikke faktakilde
```

## Spørsmål skal starte i sportankeret

Et sportspørsmål skal starte i minst ett av disse ankrene:

```text
arena
stadion
bane
hall
ishall
skøytebane
svømmehall
skibakke
løkke
klubbhus
groundhopper
klubb
lag
spiller
trener
frivillig
dommer
regel
konkurranse
kamp
turnering
rekord
ranking
taktikk
kropp
trening
teknikk
prestasjon
mestring
skade
supporter
publikum
chant
ritual
rivalisering
helt
legende
lekeplass
lek
folkehelse
inkludering
kjønn
klasse
tilgang
paraidrett
anleggspolitikk
frafall
idrettskilde
```

Deretter kan fagpakken styre hvilket emne, metode og teorispor som passer.

## Groundhopper-regel

Sportsteder er som hovedregel Groundhopper-relevante når de er stadioner, arenaer, baner, haller, ishaller, friidrettsbaner, fotballbaner, skibakker, svømmehaller, løkker, klubbhus eller turneringssteder med dokumentert idrettshistorie.

```text
Groundhopper = History Go-samling/progresjon/profil
Ikke hovedvisning i Civication/Fritid
```

Groundhopper kan gi:

```text
arena_minne
historiske_spillere
kampdag_spor
klubbhistorie
badges
lagbygging
```

Sportsteder kan senere brukes til å låse opp historiske fotballspillere og lagbygging, men Groundhopper-statistikk skal vises på profilsiden / History Go-samlingslaget.

## Migrering av eksisterende sportfiler

Når `places_sport.json` og `people_sport.json` ryddes, skal gamle eller feil fagkoblinger byttes ut med sportkoblinger.

Eksempel på feil hovedemner i sportfil:

```json
"emne_ids": [
  "em_by_byrom",
  "em_natur_rekreasjon"
]
```

skal erstattes med relevante `em_sport_*`, for eksempel:

```json
"emne_ids": [
  "em_sport_stadion_minne",
  "em_sport_idrettsarena_sted",
  "em_sport_groundhopper_stedsbesok"
]
```

Valg av `em_sport_*` skal alltid gjøres ut fra faktisk sted/person/arena/klubb/regel/prestasjon/spiller/lek/supporter/anlegg/trening/idrettskilde, ikke automatisk fra gamle emner.

## Arbeidsregel

Ikke lag raske oversettelser fra andre fagpakker til `em_sport_*` uten å lese objektet. Hvert sted og hver person skal vurderes etter:

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

Deretter velges 2–4 presise `em_sport_*`.

## Faste kontrollspørsmål før et sted legges i sport

```text
Er hovedpoenget idrettslig?
Finnes det konkret arena, klubb, lag, regel, kamp, prestasjon, spiller, trener, lek, supporter, anlegg, treningsform eller dokumentert idrettskilde?
Kan quizen bygges fra idrettshistoriske, klubbhistoriske, kampdata-, statistikk-, arkiv-, forbunds-, kommune-, anleggs-, biografiske, treningsfaglige eller lokalhistoriske kilder?
Er dette egentlig by, natur, politikk, næringsliv, media, populærkultur, subkultur, psykologi, vitenskap, musikk, kunst, litteratur eller historie?
```

Hvis svaret på siste spørsmål er ja, skal stedet flyttes eller holdes i riktig hovedkategori.

## Viktige kategorigrenser

```text
Stadion som arena, kampdag, rekorder, klubbhistorie eller Groundhopper → sport
Stadion som arkitektur, byutvikling eller minnepolitikk uten idrettslig hovedvinkel → by/historie etter hovedvinkel
Park som løpe-, trenings-, kamp- eller lekepraksis → sport hvis fysisk aktivitet er hovedvinkel
Park som grøntområde, økologi eller rekreasjon → natur/by
Skatepark som fysisk aktivitet, teknikk, anlegg eller konkurranse → sport
Skatepark som stil, gatekode, undergrunn eller subkulturell scene → subkultur
Supporterkultur som kampdag, publikum, klubb og rivalisering → sport
Supporterkultur som subkulturell stil, gateidentitet og undergrunnskode → subkultur
Treningsdata, biomekanikk og idrettsforskning → vitenskap hvis forskning/metode er hovedvinkel
Kropp, motivasjon og prestasjon som behandling/psykisk helse → psykologi hvis dette er hovedvinkel
Sportsbutikk, sponsor, merkevare og kommersiell drift → næringsliv hvis marked/økonomi er hovedvinkel
Sportsjournalistikk, TV-rettigheter og medieproduksjon → media hvis mediesystemet er hovedvinkel
```

## Status

Sportpakken inneholder per nå:

```text
6 domener
116 emner
109 metoder
116 emnemappinger
60 topic hooks
8 settfaser i generatorreglene
1 sport-supersetmal
1 sport-merkefil
Groundhopper default: True
```

Neste arbeid etter denne pakken er å migrere `places_sport.json` og `people_sport.json` slik at de bruker `em_sport_*` og ikke gamle `em_by_*`, `em_his_*`, `em_kunst_*`, `em_lit_*`, `em_media_*`, `em_musikk_*`, `em_pop_*`, `em_pol_*`, `em_naering_*`, `em_natur_*`, `em_psy_*`, `em_sub_*`, `em_vit_*` eller andre fagpakker som hovedemner.
