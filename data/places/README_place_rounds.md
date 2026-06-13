# PlaceCard-rundinger (`rounds`)

PlaceCard-rundinger er nå **innholdsmoduler**: en runding er en innholdstype
eller handling brukeren kan åpne på stedet. Kategori beskriver hva stedet er;
kategorinavn skal ikke brukes som canonical PlaceCard-rundinger.

PlaceCard viser alltid et fast 3x3-grid med **9 synlige rundinger**, valgt fra en
canonical pool på **11**. Feltet `place.rounds` betyr derfor prioritering og
relevans: rundingene som listes der kommer først etter alias-normalisering, og
runtime fyller deretter opp til 9 med relevante standardrundinger. `rundinger`
støttes som legacy alias for `rounds`.

## Canonical ids

Nye data skal kun bruke disse canonical id-ene:

- `people`
- `fortellinger`
- `leksikon`
- `wonderkammer`
- `routes`
- `badges`
- `tasks`
- `observations`
- `brands`
- `civication`
- `works`

## Legacy aliases

Runtime støtter disse bakoverkompatible aliasene slik at eksisterende data ikke
knekker:

- `lexicon` -> `leksikon`
- `stories` / `story` -> `fortellinger`
- `nature` -> `wonderkammer`
- `football` / `music` -> `works`

Nye data skal **ikke** bruke `lexicon`, `stories`, `story`, `nature`, `football`
eller `music` i `rounds`.

## Fallback og prioritering

Hvis et sted mangler `rounds`/`rundinger`, eller hvis deklarerte rundinger er
færre enn 9, fylles kortet fra en bred innholdspool. Generell fallback er:

```json
["people", "fortellinger", "leksikon", "wonderkammer", "routes", "badges", "tasks", "observations", "brands", "civication", "works"]
```

Runtime kan bruke en enkel kategori-spesifikk fallback-profil, men bare med de
11 canonical innholdsrundingene. Ukjente ids ignoreres med `console.warn`,
duplikater fjernes etter canonical id, og PlaceCard returnerer aldri mer enn 9
rundinger.

Eksempel:

```json
{
  "id": "torggata",
  "rounds": ["leksikon", "brands", "badges", "routes"]
}
```

Dette betyr at `leksikon`, `brands`, `badges` og `routes` prioriteres først;
PlaceCard fyller resten av 3x3-gridet med relevante innholdsmoduler.

## Kuratoriske kriterier

### people

Personer knyttet til stedet: forfattere, kunstnere, politikere, idrettsfolk,
vitenskapsfolk, arkitekter, musikere, lokale aktører, historiske skikkelser og
personer som har bodd, virket, opptrådt, bygget, skrevet, forsket, kjempet
eller blitt minnet der.

### fortellinger

Narrative historier, hendelser, scener, historiske øyeblikk og “hva skjedde
her”. `fortellinger` dekker behovet for events/hendelser som PlaceCard-runding;
`events` er ikke egen canonical runding nå.

### leksikon

Forklaringer, begreper, fagord, språkleksikon, kontekst og kunnskapskort.
Dette er oppslagsverk/forklaring, ikke primært narrativ. Leksikon kan fortsatt
lenke videre til fortellinger, lesespor og Wonderkammer der huben gjør det.

### wonderkammer

Ting å se etter på stedet: objekter, skilt, statuer, bygningselementer,
detaljer, spor, lekeapparater, treningsapparater, kunstobjekter, naturfunn og
små observasjonsobjekter. Legacy `nature` mappes hit fordi natur i PlaceCard
skal handle om ting å se, spor, funn og observasjon.

### routes

Ruter stedet inngår i: historiske ruter, byvandringer, ferdselslinjer,
transportlinjer, pilegrimsruter, handelsruter, elveruter, havneruter,
politiske ruter, kulturvandringer, krigs-/motstandsruter, idretts- eller
musikkruter.

### badges

Merker, samling, progresjon og underbadges. Brukes når stedet bør gi
samlings-/progresjonsverdi eller inngå i et faglig/kuratorisk badge-system.

### tasks

Oppgaver: quiz, minioppdrag, observasjonsoppgaver, kreative oppgaver, fysiske
oppgaver, barne-/lekeoppgaver og “gjør noe her”. Ikke bruk `tasks` som løfte om
ny oppgavemotor; rundingen kan ha tomtilstand til data finnes.

### observations

Brukerens egne observasjoner: notater, bilder, minner, funn, feltarbeid og
“legg til observasjon”. Rundingen peker på observasjonsflyt eller tomtilstand;
den oppretter ikke ny lagringsmodell alene.

### brands

Aktører: institusjoner, organisasjoner, klubber, museer, medier, butikker,
scener, offentlige aktører, bedrifter, idrettslag og andre navngitte system-
aktører. `brands` betyr ikke bare kommersielle merkevarer.

### civication

Civication Store: en stedsspesifikk store-/butikk-/samlingsfunksjon for
konkrete fysiske objekter knyttet til akkurat dette stedet. Objektene kan
kjøpes eller samles og brukes videre i Civication, for eksempel som tegn på
stedets historie, funksjon, institusjon, symboler eller fysiske miljø. Generiske
objekter skal ikke legges inn: et godt Civication Store-objekt bør miste mye av
meningen sin hvis det flyttes til et annet sted. `civication` er fortsatt
canonical PlaceCard-round-id-en, selv om UI-konseptet kan hete “Civication
Store”.

### works

Stedets verk, produksjoner, stats og prestasjoner. Dette kan være bøker,
sanger, filmer, malerier, skulpturer, teaterstykker, TV-/radioprogrammer,
arkitekturverk, taler, artikler, kamper, rekorder, mål, finaler,
idrettsprestasjoner, utstillinger og forestillinger. PlaceCard-`works` handler
om stedets verk/prestasjoner/produksjoner, ikke om å flytte personens verk inn i
personmodellen. Legacy `football` og `music` mappes hit fordi kamper, rekorder,
låter, konserter, utgivelser og prestasjoner hører hjemme i denne rundingen.

## Ikke egne PlaceCard-rundinger nå

- Tidslinje er ikke egen runding nå; tids-/epokeinformasjon kan ligge i badges,
  leksikon, fortellinger eller annet relevant innhold.
- Nærhet/koblinger håndteres av NextUp/Fortsett reisen, ikke av en egen
  PlaceCard-runding.
- Kategorinavn som `nature`, `football`, `music`, `art`, `literature`,
  `science`, `politics`, `sport`, `media`, `architecture`, `history`, `market`,
  `transport`, `memorial` og `subculture` skal ikke brukes som canonical
  PlaceCard-rundinger.
