# PlaceCard-rundinger (`rounds`)

PlaceCard-rundinger er datastyrte per sted. Bruk feltet `rounds` på et sted
for å velge hvilke hovedrundinger/ikoner som skal vises, og i hvilken rekkefølge.
`rundinger` støttes som alias for eldre/norske data.

## Gyldige id-er

Canonical PlaceCard-round ids er:

- `people`
- `nature`
- `badges`
- `civication`
- `brands`
- `leksikon`
- `routes`
- `music`
- `football`

`lexicon` støttes kun som bakoverkompatibelt alias til canonical id `leksikon`.
Nye data skal bruke `leksikon`.

## Standard-fallback

Når et sted mangler både `rounds` og `rundinger`, bruker PlaceCard standardsettet:

```json
["people", "nature", "badges", "civication", "brands", "leksikon", "routes"]
```

`music` og `football` vises bare når stedet deklarerer dem eksplisitt i `rounds`
/ `rundinger`.

## Leksikon samler kunnskapsrundingen

Stories/Fortellinger, Lesespor, Wonderkammer, Språkleksikon og øvrige
leksikon-/kunnskapsobjekter ligger under Leksikon-rundingen. De skal ikke legges
inn som egne PlaceCard-hovedrundinger eller egne hovedikoner.

Eksempel:

```json
{
  "id": "torggata",
  "rounds": ["leksikon", "brands", "badges", "routes"]
}
```

## Kuratoriske kriterier

### people

Brukes når stedet naturlig kan knyttes til personer:

- forfattere
- kunstnere
- politikere
- idrettsfolk
- vitenskapsfolk
- arkitekter
- musikere
- lokale aktører
- historiske skikkelser
- personer som har bodd, virket, opptrådt, bygget, skrevet, forsket, kjempet
  eller blitt minnet der

Ikke bruk `people` bare fordi stedet er offentlig eller kjent. Det må finnes
eller kunne finnes en meningsfull personkobling.

### nature

Brukes når natur, park, vann, landskap, grøntstruktur, flora/fauna, friluftsliv
eller topografi er en sentral del av stedet.

Eksempler:

- parker
- gravlunder med landskap/naturpreg
- vann
- hager
- markasteder
- utsiktspunkter
- grøntdrag

### badges

Brukes når stedet bør gi samlings-/progresjonsverdi. Dette gjelder de fleste
kanoniske History Go-steder, men kan utelates for svært tekniske, midlertidige
eller interne dataobjekter.

### civication

Brukes når stedet kan ha samfunns-, økonomi-, arbeids-, institusjons-,
politisk-, handel-, bolig-, transport- eller bylivsfunksjon i Civication.

Eksempler:

- rådhus
- torg
- skoler
- stasjoner
- butikker/handlegater
- industri
- kontorområder
- kulturinstitusjoner
- offentlige bygg
- politiske steder

### brands

Brukes når stedet naturlig kan kobles til merkevarer, institusjoner,
organisasjoner, klubber, scener, museer, medier, bedrifter, offentlige aktører
eller andre navngitte systemaktører.

Eksempler:

- NRK Marienlyst
- Nasjonalmuseet
- MUNCH
- Ullevaal stadion
- Stortinget
- SALT
- Hausmania
- Deichman

`brands` betyr ikke bare kommersielle merkevarer. Det inkluderer også
institusjoner og organisasjoner som fungerer som gjenkjennelige aktører i
History Go.

### leksikon

Brukes når stedet bør ha utdypende kunnskapsinnhold.

Leksikon samler:

- Fortellinger / Stories
- Lesespor
- Wonderkammer
- Språkleksikon
- objekter
- begreper
- historiske forklaringer
- faglige artikler
- korte kunnskapskort

De fleste historiske, kulturelle, politiske, vitenskapelige, kunstneriske,
litterære og byanalytiske steder bør ha `leksikon`.

### routes

Brukes når stedet naturlig inngår i ruter:

- historiske ruter
- byvandringer
- ferdselslinjer
- transportlinjer
- pilegrimsruter
- handelsruter
- elveruter
- havneruter
- politiske ruter
- kulturvandringer
- krigs-/motstandsruter
- idretts- eller musikkruter

`routes` kan brukes både for fysisk History Go-gåing og for online/textual
historical routes.

### music

Brukes kun når stedet har tydelig musikkkobling:

- konsertscene
- klubb
- studio
- festival
- artiststed
- musikkhistorisk sted
- plateselskap
- AHA Music-relasjon

Ikke bruk `music` bare fordi stedet kan ha hatt arrangementer. Musikk må være
en tydelig del av stedets identitet eller bruk.

### football

Brukes på fotballrelaterte steder:

- stadioner
- fotballbaner
- klubbsteder
- supporterplasser
- treningsfelt
- historiske kampsteder
- steder relevante for HG Football Manager

Ikke bruk `football` på generelle idrettssteder uten tydelig fotballkobling.

## Anbefalt prioritering

Hvis et sted har mange mulige rundinger:

1. Ta med rundinger som faktisk gir brukerhandling.
2. Ta med rundinger som støttes av eksisterende eller planlagt data.
3. Ikke fyll alle steder med alt.
4. Bruk fallback for generelle steder uten særskilt kuratering.
5. Bruk eksplisitt `rounds` når stedet har en tydelig egenprofil.

## Ikke bruk som PlaceCard-rundinger

Disse skal ikke brukes i `rounds`:

- `stories`
- `wonderkammer`
- `lexicon`

Forklaring:

- `stories` og `wonderkammer` ligger under `leksikon`.
- `lexicon` er bare alias for gamle data; nye data skal bruke `leksikon`.

## Kodekontrakt

- `PLACE_ROUND_REGISTRY` — eneste kilde for kjente rundinger (id, label,
  ikon-DOM, liste-DOM, alias og kind).
- `getPlaceRounds(place)` — leser `rounds`/`rundinger`, normaliserer alias og
  filtrerer ukjente id-er.
- `applyPlaceRounds(place)` — viser/skjuler PlaceCard-ikonene per sted.
