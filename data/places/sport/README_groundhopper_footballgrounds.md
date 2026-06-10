# Groundhopper / footballgrounds.json – History Go-standard

Denne README-en beskriver hvordan vi lager `footballgrounds.json`-filer for History Go.

Målet er at fotballstadioner og fotballbaner ikke bare skal være Groundhopper-punkter, men komplette History Go-steder. Hvert sted skal kunne vises på kartet, åpnes i PlaceCard, brukes i Groundhopper-samlingen, gi quizgrunnlag, gi Wonderkammer-innhold, kobles til klubber/spillere/staff i HG Football Manager, og telle mot badges/underbadges.

---

## 1. Filplassering

Alle fotballgrounds skal ligge i History-Go-repoet, under sport-kategorien:

```text
data/places/sport/<city_id>/footballgrounds.json
```

Eksempler:

```text
data/places/sport/london/footballgrounds.json
data/places/sport/lisbon/footballgrounds.json
data/places/sport/madrid/footballgrounds.json
data/places/sport/barcelona/footballgrounds.json
data/places/sport/rio_de_janeiro/footballgrounds.json
data/places/sport/buenos_aires/footballgrounds.json
```

`footballgrounds.json` skal brukes for fotballstadioner, fotballbaner, tidligere stadionsteder og tydelige fotballanlegg.

Andre sportsteder skal ligge i egne filer, ikke blandes inn i `footballgrounds.json`.

Eksempler:

```text
data/places/sport/lisbon/sportvenues.json
data/places/sport/lisbon/athletics.json
data/places/sport/lisbon/indoor_arenas.json
data/places/sport/lisbon/watersport.json
data/places/sport/lisbon/historical_sport_sites.json
```

Enkeltregel:

```text
footballgrounds.json = fotballsteder
sportvenues.json / andre filer = andre sportsteder
```

---

## 2. Grunnprinsipp

Et Groundhopper-sted er alltid et vanlig History Go-sted.

Det skal derfor ikke lages egen Groundhopper-database. Groundhopper er et felt på vanlige steder:

```json
"groundhopper": true
```

Riktig modell:

```text
History Go-sted
  → category: "sport"
  → sport_type: "football"
  → place_type: "stadium" / "former_stadium_site" / "training_ground" / "academy_ground"
  → groundhopper: true
  → quiz_profile
  → wonderkammer
  → underbadge_ids
  → club_ids
```

---

## 3. ID-standard

Bruk by først:

```text
<city_id>_<place_slug>
```

Eksempler:

```text
london_wembley_stadium
lisbon_estadio_da_luz
madrid_santiago_bernabeu
barcelona_spotify_camp_nou
milan_san_siro
rio_de_janeiro_maracana
buenos_aires_la_bombonera
```

Unngå dette mønsteret framover:

```text
wembley_stadium_london
estadio_da_luz_lisbon
```

Grunnen er at by-først-ID gjør det lettere å gruppere, søke og lese datalistene.

Dersom et sted allerede finnes i produksjon med gammelt ID-format, skal ID ikke endres uten migrering/alias-håndtering.

---

## 4. Obligatoriske felt

Alle entries i `footballgrounds.json` skal ha disse feltene:

```json
{
  "id": "city_place_slug",
  "visual": {
    "designCode": "stadium_miniature"
  },
  "name": "Stadium Name",
  "lat": 0,
  "lon": 0,
  "r": 250,
  "category": "sport",
  "city_id": "city_id",
  "country": "Country",
  "continent": "Europe",
  "sport_type": "football",
  "place_type": "stadium",
  "groundhopper": true,
  "stadium_tier": "world_icon",
  "groundhopper_tags": [],
  "club_ids": [],
  "year": 2000,
  "desc": "",
  "image": "",
  "frontImage": "",
  "cardImage": "",
  "popupDesc": "",
  "emne_ids": [],
  "quiz_profile": {},
  "wonderkammer": {},
  "underbadge_ids": []
}
```

---

## 5. `place_type`

Bruk presise verdier.

Vanlige verdier:

```text
stadium
former_stadium_site
academy_ground
training_ground
local_football_ground
national_stadium
```

Anbefalt praksis:

```json
"place_type": "stadium"
```

for aktive stadioner.

```json
"place_type": "former_stadium_site"
```

for revne/tapte stadionsteder som fortsatt er historisk viktige.

Eksempler på `former_stadium_site`:

```text
london_old_wembley_site
amsterdam_de_meer_stadion_site
buenos_aires_viejo_gasometro_site
istanbul_ali_sami_yen_stadium_site
montevideo_estadio_pocitos_site
```

---

## 6. `stadium_tier`

Bruk `stadium_tier` for Groundhopper-klassifisering.

Vanlige verdier:

```text
world_icon
national_stadium
elite_stadium
historic_club_ground
cult_ground
modern_stadium
academy_ground
local_football_ground
former_stadium_site
```

Eksempler:

```json
"stadium_tier": "world_icon"
```

for Wembley, Maracanã, La Bombonera, San Siro, Camp Nou.

```json
"stadium_tier": "cult_ground"
```

for små eller særpregede grounds med sterk supporter-/stedshistorie.

```json
"stadium_tier": "local_football_ground"
```

for lokale/metropolitane stadioner som gir dybde til byen.

---

## 7. `groundhopper_tags`

`groundhopper_tags` skal brukes til filtrering, samling og tematisk lesing.

Eksempler:

```json
"groundhopper_tags": [
  "world_icon",
  "national_arena",
  "fa_cup_final",
  "english_football",
  "supporter_culture"
]
```

Gode tag-typer:

```text
world_icon
national_stadium
historic_ground
former_ground
cult_ground
modern_arena
academy_ground
local_football_ground
supporter_identity
fan_owned_story
derby_stadium
river_stadium
olympic_legacy
world_cup_final
champions_league_final
copa_libertadores
working_class_football
stadium_relocation
lost_ground
football_archaeology
women_football
youth_football
multiuse_stadium
```

Tags skal være tekniske og stabile, ikke fulle setninger.

---

## 8. `club_ids`

`club_ids` kobler History Go-stedet videre til HG Football Manager.

Eksempel:

```json
"club_ids": [
  "arsenal"
]
```

Flere klubber kan brukes når stadionet er delt eller historisk knyttet til flere klubber:

```json
"club_ids": [
  "ac_milan",
  "inter_milan"
]
```

For landslagsarenaer:

```json
"club_ids": [
  "england_national_team"
]
```

For akademi/kvinnefotball:

```json
"club_ids": [
  "ajax",
  "jong_ajax",
  "ajax_women",
  "ajax_youth"
]
```

`club_ids` skal ikke erstatte `category`, `sport_type` eller `groundhopper`. Det er et koblingsfelt videre til klubb-, spiller-, trener- og staff-data.

---

## 9. `desc`

`desc` er kortteksten som kan vises i kort, liste eller enkel PlaceCard-visning.

Den skal være informativ, men ikke for lang.

Anbefalt lengde:

```text
1–4 setninger
```

Den bør inneholde:

```text
hvem bruker stedet
hvorfor stedet er viktig
årstall eller historisk overgang
hvilken Groundhopper-verdi stedet har
```

Eksempel:

```json
"desc": "Benficas moderne hjemmebane i bydelen Luz, åpnet i 2003 som erstatning for det gamle Estádio da Luz fra 1954. Stadionet er et av Portugals viktigste klubbfotballsteder, bygget for EM 2004 og tett knyttet til Benfica som folkeklubb, europeisk finalearena og moderne stadionøkonomi."
```

---

## 10. `popupDesc`

`popupDesc` er hovedteksten i PlaceCard/popup.

Den skal være mye rikere enn `desc`.

Anbefalt lengde:

```text
2–4 avsnitt
```

Den bør forklare:

```text
stedets opprinnelse
klubb-/supporteridentitet
byhistorie og idrettsgeografi
hvorfor stedet er viktig i Groundhopper
eventuelle konflikter, flyttinger, rivninger eller modernisering
```

God `popupDesc` skal ikke bare si at stadionet er kjent. Den skal forklare hvorfor stedet betyr noe.

Eksempelstruktur:

```text
Avsnitt 1: Historisk opprinnelse og fysisk sted
Avsnitt 2: Klubbidentitet, supporterkultur og viktige epoker
Avsnitt 3: Hvorfor stedet er viktig i History Go/Groundhopper
```

---

## 11. Bilde- og visualfelter

Alle steder skal ha:

```json
"visual": {
  "designCode": "stadium_miniature"
},
"image": "",
"frontImage": "",
"cardImage": ""
```

Disse kan stå tomme til vi har bildeproduksjon/kortproduksjon klart.

`visual.designCode` gir appen beskjed om at stedet skal kunne vises som stadionminiatur/kortvisning.

Standard for fotballgrounds:

```json
"designCode": "stadium_miniature"
```

---

## 12. `emne_ids`

Fotballstadioner skal normalt ha:

```json
"emne_ids": [
  "em_sport_idrettsgeografi",
  "em_sport_kropp_konkurranse"
]
```

Andre mulige emner kan legges til senere når emnestrukturen er validert.

Ikke finn på nye `emne_ids` uten at de finnes i prosjektets emnedata.

---

## 13. `quiz_profile`

`quiz_profile` styrer hvordan quizspørsmål kan lages om stedet.

Mal:

```json
"quiz_profile": {
  "place_type": "stadion",
  "subtype": "fotballstadion_for_storklubb_og_mesterskapsarena",
  "signature_features": [
    "hjemmebane for klubben",
    "åpnet i årstall",
    "kjent for bestemt arkitektur, derby, finale eller supportertradisjon"
  ],
  "primary_angles": [
    "sport",
    "klubbidentitet",
    "byhistorie",
    "infrastruktur"
  ],
  "question_families": [
    "gjenkjenning",
    "historisk_endring",
    "kontrast",
    "bruk",
    "saertrekk"
  ],
  "avoid_angles": [
    "generisk_fotballarena",
    "ren_resultatliste"
  ],
  "must_include": [
    "det viktigste historiske skiftet",
    "stedets rolle for klubb eller by"
  ],
  "contrast_targets": [
    "city_other_place_id",
    "city_other_stadium_id"
  ],
  "notes": "Badge-sub: stadion. Stedet skal leses som idrettsgeografi og klubbidentitet, ikke bare som arkitektur."
}
```

### `place_type`

Bruk norsk her:

```json
"place_type": "stadion"
```

Andre muligheter:

```text
historisk_stadionsted
treningsanlegg
akademianlegg
nasjonalarena
idrettsanlegg
```

### `subtype`

Skal være mer presis.

Eksempler:

```text
nasjonalarena_og_finalestadion
fotballstadion_for_storklubb_og_mesterskapsarena
kompakt_byground_for_lokal_londonklubb
supportergjenreist_stadion_og_fan_owned_story
olympiastadion_ombygd_til_fotballstadion
tidligere_stadionsted_og_fotballarkeologi
```

### `signature_features`

Skal gi quizgeneratoren konkrete kjennetegn.

Eksempel:

```json
"signature_features": [
  "hjemmebane for S.L. Benfica",
  "åpnet i 2003 som erstatning for stadionet fra 1954",
  "brukt under EM 2004"
]
```

### `primary_angles`

Bruk stabile vinkler:

```text
sport
klubbidentitet
supporterkultur
idrettsgeografi
byhistorie
infrastruktur
stadionøkonomi
stadionmodernisering
mesterskap
lokal_identitet
```

### `question_families`

Vanlige verdier:

```text
gjenkjenning
historisk_endring
kontrast
bruk
rolle
saertrekk
kritikk
tidslag
```

### `avoid_angles`

Brukes for å hindre kjedelige eller feilaktige spørsmål.

Eksempler:

```json
"avoid_angles": [
  "generisk_fotballarena",
  "ren_resultatliste",
  "ren_kapasitetsbeskrivelse"
]
```

### `must_include`

Dette er det quiz og forklaring ikke må miste.

Eksempel:

```json
"must_include": [
  "Benficas rolle blant de tre store klubbene i Portugal",
  "skiftet fra gammelt stadion til nybygget i 2003"
]
```

### `contrast_targets`

Bruk andre steder i samme by eller kategori.

Eksempler:

```json
"contrast_targets": [
  "lisbon_estadio_jose_alvalade",
  "lisbon_estadio_do_restelo"
]
```

---

## 14. `wonderkammer`

`wonderkammer` gjør stedet utforskende og fysisk.

Mal:

```json
"wonderkammer": {
  "see": [],
  "do": [],
  "observe": [],
  "learn": []
}
```

### `see`

Hva spilleren skal se fysisk.

Eksempel:

```json
"see": [
  "den røde fasaden og takkonstruksjonen over tribunene",
  "klubbmerker og supporterflagg rundt stadionet",
  "kontrasten mellom stadionet og boligområdene rundt"
]
```

### `do`

Hva spilleren kan gjøre på stedet.

Eksempel:

```json
"do": [
  "gå rundt hele stadionet for å forstå skalaen",
  "kombiner med klubbmuseet hvis det er åpent",
  "delta på kampkveld for å oppleve lyd og publikumskoreografi"
]
```

### `observe`

Hva spilleren skal legge merke til.

Eksempel:

```json
"observe": [
  "hvordan området fungerer på kampdag versus hverdag",
  "hvordan publikum organiseres rundt kollektivtransport",
  "hvilke tegn på klubbtilhørighet som finnes i nærområdet"
]
```

### `learn`

Hva spilleren skal lære.

Eksempel:

```json
"learn": [
  "hva klubben betyr i byens idrettsgeografi",
  "hvordan stadionbygging endrer publikumsopplevelse",
  "hvordan supporterkultur og klubbøkonomi vises i fysisk rom"
]
```

---

## 15. `underbadge_ids`

Vanlige underbadges for footballgrounds:

```json
"underbadge_ids": [
  "fotball",
  "stadion",
  "idrettsarenaer",
  "tribune_og_publikum",
  "supporterkultur"
]
```

Legg til flere når relevant:

```text
mesterskap
turneringer
nasjonalarenaer
premier_league
moderne_arenaer
historisk_ground
lokalidrett
fan_eierskap
olympiske_anlegg
byutvikling
arbeideridrett
fotballarkeologi
kvinnefotball
ungdomsfotball
```

Ikke legg inn underbadges som ikke finnes i prosjektets underbadge-system uten at de samtidig opprettes/valideres.

---

## 16. Komplett entry-mal

Kopier denne når et nytt footballground skal lages:

```json
{
  "id": "city_stadium_slug",
  "visual": {
    "designCode": "stadium_miniature"
  },
  "name": "Stadium Name",
  "lat": 0,
  "lon": 0,
  "r": 250,
  "category": "sport",
  "city_id": "city_id",
  "country": "Country",
  "continent": "Europe",
  "sport_type": "football",
  "place_type": "stadium",
  "groundhopper": true,
  "stadium_tier": "historic_club_ground",
  "groundhopper_tags": [
    "historic_ground",
    "club_identity",
    "supporter_culture"
  ],
  "club_ids": [
    "club_id"
  ],
  "year": 2000,
  "desc": "Kort tekst på 1–4 setninger som forklarer hva stedet er, hvem det tilhører, når det åpnet og hvorfor det er viktig i History Go.",
  "image": "",
  "frontImage": "",
  "cardImage": "",
  "popupDesc": "Lengre tekst på 2–4 avsnitt. Forklar opprinnelse, klubbidentitet, byhistorie, supporterkultur, stadionendringer og hvorfor stedet er viktig for Groundhopper.",
  "emne_ids": [
    "em_sport_idrettsgeografi",
    "em_sport_kropp_konkurranse"
  ],
  "quiz_profile": {
    "place_type": "stadion",
    "subtype": "fotballstadion_for_klubb_og_byhistorie",
    "signature_features": [
      "hjemmebane for klubben",
      "åpnet i årstall",
      "kjent for bestemt historisk eller fysisk særtrekk"
    ],
    "primary_angles": [
      "sport",
      "klubbidentitet",
      "idrettsgeografi",
      "byhistorie"
    ],
    "question_families": [
      "gjenkjenning",
      "historisk_endring",
      "kontrast",
      "bruk",
      "saertrekk"
    ],
    "avoid_angles": [
      "generisk_fotballarena",
      "ren_resultatliste"
    ],
    "must_include": [
      "viktig historisk overgang",
      "stedets rolle for klubb, by eller supporterkultur"
    ],
    "contrast_targets": [
      "city_other_place_id"
    ],
    "notes": "Badge-sub: stadion. Stedet skal leses som sport, sted og klubbidentitet, ikke bare som arkitektur."
  },
  "wonderkammer": {
    "see": [
      "fysisk kjennetegn 1",
      "fysisk kjennetegn 2",
      "fysisk kjennetegn 3"
    ],
    "do": [
      "handling spilleren kan gjøre på stedet",
      "kombiner med nærliggende relevant sted",
      "opplev kampdag hvis mulig"
    ],
    "observe": [
      "hvordan stedet fungerer på kampdag versus hverdag",
      "hvordan klubbidentitet vises i nærområdet",
      "hvordan stadionet møter byrommet rundt"
    ],
    "learn": [
      "hva klubben betyr i byen",
      "hvordan stadionet endret seg historisk",
      "hvorfor stedet er viktig for Groundhopper"
    ]
  },
  "underbadge_ids": [
    "fotball",
    "stadion",
    "idrettsarenaer",
    "tribune_og_publikum",
    "supporterkultur"
  ]
}
```

---

## 17. Eksempel: Benfica / Estádio da Luz

```json
{
  "id": "lisbon_estadio_da_luz",
  "visual": {
    "designCode": "stadium_miniature"
  },
  "name": "Estádio da Luz",
  "lat": 38.7528,
  "lon": -9.1849,
  "r": 350,
  "category": "sport",
  "city_id": "lisbon",
  "country": "Portugal",
  "continent": "Europe",
  "sport_type": "football",
  "place_type": "stadium",
  "groundhopper": true,
  "stadium_tier": "world_icon",
  "groundhopper_tags": [
    "sl_benfica",
    "primeira_liga",
    "euro_2004",
    "champions_league_final",
    "a_catedral",
    "club_identity",
    "lisbon_derby"
  ],
  "club_ids": [
    "sl_benfica"
  ],
  "year": 2003,
  "desc": "Hjemmebanen til S.L. Benfica i bydelen Luz, åpnet i 2003 som erstatning for det gamle Estádio da Luz fra 1954. Stadionet er blant Europas største fotballarenaer og ble brukt under EM 2004, samtidig som det fungerer som Benficas store røde klubbtempel.",
  "image": "",
  "frontImage": "",
  "cardImage": "",
  "popupDesc": "Det opprinnelige Estádio da Luz åpnet i 1954 og var i en periode et av Europas største stadioner. Det ble revet og erstattet av et nytt stadion i 2003, designet av Damon Lavelle, før Portugal skulle være vertskap for EM i fotball i 2004. S.L. Benfica, grunnlagt i 1904, er en av de tre store klubbene i portugisisk fotball sammen med Sporting CP og FC Porto, og har en av Europas største medlemsmasser. Stadionet ligger i bydelen Luz nordvest i Lisboa og er omgitt av museum, servicefunksjoner og klubbens røde symbolske landskap.

For History Go er Estádio da Luz et godt sted å lese hvordan toppfotball i Portugal er knyttet til klubbidentitet, regional rivalisering, mediestruktur og investering i idrettsanlegg. Stadionet er ikke bare en arena, men et uttrykk for Benfica som folkeklubb, europeisk finalested og moderne fotballinstitusjon.",
  "emne_ids": [
    "em_sport_idrettsgeografi",
    "em_sport_kropp_konkurranse"
  ],
  "quiz_profile": {
    "place_type": "stadion",
    "subtype": "fotballstadion_for_storklubb_og_em_arena",
    "signature_features": [
      "hjemmebane for S.L. Benfica",
      "åpnet i 2003 som erstatning for stadionet fra 1954",
      "blant Europas største fotballarenaer, brukt under EM 2004"
    ],
    "primary_angles": [
      "sport",
      "klubbidentitet",
      "byhistorie",
      "infrastruktur"
    ],
    "question_families": [
      "gjenkjenning",
      "historisk_endring",
      "kontrast",
      "bruk"
    ],
    "avoid_angles": [
      "generisk_fotballarena",
      "generisk_em_arena"
    ],
    "must_include": [
      "Benficas rolle blant de tre store klubbene i Portugal",
      "skiftet fra det gamle stadionet fra 1954 til nybygget i 2003"
    ],
    "contrast_targets": [
      "lisbon_estadio_jose_alvalade",
      "lisbon_estadio_do_restelo"
    ],
    "notes": "Badge-sub: idrettsarenaer. Stadionet skal leses som idrettsanlegg knyttet til klubbidentitet og europeisk fotballøkonomi, ikke bare som arkitektur."
  },
  "wonderkammer": {
    "see": [
      "den røde fasaden og takkonstruksjonen over tribunene",
      "ørnesymbolet og klubbmerker rundt stadionet",
      "kontrasten mellom stadion og boligområdene i Luz"
    ],
    "do": [
      "gå rundt hele stadionet for å forstå skalaen",
      "kombiner med et besøk i klubbens museum hvis åpent",
      "delta på en kampkveld for å oppleve publikumskoreografi og lyd"
    ],
    "observe": [
      "hvordan området fungerer på kampdag versus en vanlig hverdag",
      "tegn på klubbtilhørighet i nærområdet: kafeer, sjal, butikker",
      "hvordan ankomst og logistikk er organisert rundt stadionet"
    ],
    "learn": [
      "hva Benfica betyr som klubb i portugisisk samfunns- og medieliv",
      "hvordan EM 2004 satte spor i portugisisk stadioninfrastruktur",
      "hvordan byggingen av et nytt stadion på samme tomt endrer både by og publikumsopplevelse"
    ]
  },
  "underbadge_ids": [
    "fotball",
    "stadion",
    "idrettsarenaer",
    "tribune_og_publikum",
    "supporterkultur",
    "mesterskap",
    "turneringer"
  ]
}
```

---

## 18. Validering før commit

Før en ny `footballgrounds.json` merges:

1. Filen må parse som gyldig JSON.
2. Alle entries må ha unik `id`.
3. Alle entries må ha `category: "sport"`.
4. Alle entries må ha `sport_type: "football"`.
5. Alle Groundhopper-steder må ha `groundhopper: true`.
6. Alle entries må ha `lat`, `lon` og `r`.
7. Alle entries må ha `desc` og `popupDesc`.
8. Alle entries må ha `quiz_profile`.
9. Alle entries må ha `wonderkammer`.
10. Alle entries må ha `underbadge_ids`.
11. Ikke bruk genererte filer som kilde.
12. Ikke hardkod Groundhopper-steder i appkode.
13. Ikke lag egen Groundhopper-database.

En enkel konsoll-/Node-validering kan senere legges til som script.

---

## 19. Arbeidsmetode når nye byer lages

For hver ny by:

```text
1. Lag data/places/sport/<city_id>/footballgrounds.json
2. Start med 5–12 viktige stadioner/grounds
3. Ta med både verdensikoner og lokale grounds
4. Ta med former_stadium_site når tapte steder er historisk viktige
5. Legg inn full History Go-struktur fra start
6. Koble filen inn i eksisterende loader/manifest på samme måte som andre place-filer
7. Valider JSON
8. Test at stedene vises i window.PLACES
9. Test at sportfilter og PlaceCard fungerer
10. Test at Groundhopper-telling kan finne groundhopper === true
```

Byfilen bør ikke bare være en liste over de største stadionene. Den bør vise fotballbyen som økosystem:

```text
verdensikon
nasjonalarena
storklubb
lokal klubb
kultground
tidligere stadionsted
akademi-/kvinnefotballsted
```

---

## 20. Viktig designregel

Et footballground skal kunne fungere i flere lag samtidig:

```text
Kartsted
PlaceCard
Groundhopper-samling
Quiz
Wonderkammer
Badge/underbadge
HG Football Manager unlock
```

Derfor må vi alltid skrive disse filene som komplette History Go-steder, ikke bare som stadionkoordinater.

