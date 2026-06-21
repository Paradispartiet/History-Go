# PlaceCard-rundinger (`rounds`)

PlaceCard-rundingene er nå et **fast 3x3-grid** med 9 faste innganger. Gridet
skal være visuelt stabilt fra sted til sted, og `rounds` / `rundinger` skal ikke
lenger brukes til å flytte rundinger visuelt.

Fast plassering:

```text
Row 1: people | works        | badges
Row 2: tasks  | civication   | brands
Row 3: routes | fortellinger | leksikon
```

Det betyr blant annet at `people` alltid ligger øverst til venstre, `badges`
alltid øverst til høyre, `fortellinger` alltid nederst i midten og `leksikon`
alltid nederst til høyre.

## Canonical ids

Canonical PlaceCard-rundinger er nøyaktig disse 9 id-ene, i fast grid-rekkefølge:

- `people`
- `works`
- `badges`
- `tasks`
- `civication`
- `brands`
- `routes`
- `fortellinger`
- `leksikon`

Nye data trenger normalt ikke å sette `rounds`. Hvis `rounds` eller `rundinger`
finnes i eldre data, kan feltet beholdes som legacy/kuratorisk metadata, men det
styrer ikke lenger hvilke rundinger som vises eller hvilken visuell rekkefølge de
har i PlaceCard.

## Legacy aliases

Runtime støtter disse bakoverkompatible aliasene slik at eksisterende data ikke
knekker:

- `lexicon` -> `leksikon`
- `stories` / `story` -> `fortellinger`
- `wonderkammer` / `nature` -> `leksikon`
- `football` / `music` -> `works`
- `observations` -> `tasks` (legacy / ikke anbefalt i nye data)

Nye data skal bruke canonical id-er hvis metadatafeltet fortsatt trengs.

## Leksikon og Wonderkammer

`leksikon` er kunnskaps- og oppdagelsesinngangen i PlaceCard. Wonderkammer er
ikke lenger en egen hovedrunding, men skal fortsatt eksistere som innholdstype og
ligge under Leksikon-flowen / Leksikon-huben sammen med for eksempel begreper,
språk, forklaringer, objekter, detaljer og lesespor.

Naturinnhold skal heller ikke ha en egen fast PlaceCard-runding. Natur kan ligge
under `leksikon` når det gjelder arter, naturbegreper og økologi, under `tasks`
når det gjelder natur-oppgaver, eller under `fortellinger` når det gjelder
stedets naturhistorie.

## Observasjoner

`observations` er ikke en canonical PlaceCard-runding nå. Eventuelle eksisterende
observasjons-, notat- eller “legg til”-flyter skal beholdes som handlinger utenfor
runding-gridet. Ikke bruk `observations` som ny PlaceCard-runding.

## Kuratoriske kriterier

### people

Personer knyttet til stedet: forfattere, kunstnere, politikere, idrettsfolk,
vitenskapsfolk, arkitekter, musikere, lokale aktører, historiske skikkelser og
personer som har bodd, virket, opptrådt, bygget, skrevet, forsket, kjempet eller
blitt minnet der.

### works

Stedets verk, produksjoner, stats og prestasjoner. Dette kan være bøker, sanger,
filmer, malerier, skulpturer, teaterstykker, TV-/radioprogrammer,
arkitekturverk, taler, artikler, kamper, rekorder, mål, finaler,
idrettsprestasjoner, utstillinger og forestillinger. Legacy `football` og
`music` mappes hit fordi kamper, rekorder, låter, konserter, utgivelser og
prestasjoner hører hjemme i denne rundingen.

### badges

Merker, samling, progresjon og underbadges. Brukes når stedet bør gi
samlings-/progresjonsverdi eller inngå i et faglig/kuratorisk badge-system.

### tasks

Oppgaver: quiz, minioppdrag, observasjonsoppgaver, kreative oppgaver, fysiske
oppgaver, barne-/lekeoppgaver og “gjør noe her”. Ikke bruk `tasks` som løfte om
ny oppgavemotor; rundingen kan ha tomtilstand til data finnes.

### civication

Civication Store: en stedsspesifikk store-/butikk-/samlingsfunksjon for konkrete
fysiske objekter knyttet til akkurat dette stedet. Objektene kan kjøpes eller
samles og brukes videre i Civication, for eksempel som tegn på stedets historie,
funksjon, institusjon, symboler eller fysiske miljø. Generiske objekter skal ikke
legges inn: et godt Civication Store-objekt bør miste mye av meningen sin hvis
det flyttes til et annet sted. `civication` er fortsatt canonical
PlaceCard-round-id-en, selv om UI-konseptet kan hete “Civication Store”.

### brands

Aktører: institusjoner, organisasjoner, klubber, museer, medier, butikker,
scener, offentlige aktører, bedrifter, idrettslag og andre navngitte
systemaktører. `brands` betyr ikke bare kommersielle merkevarer.

### routes

Ruter stedet inngår i: historiske ruter, byvandringer, ferdselslinjer,
transportlinjer, pilegrimsruter, handelsruter, elveruter, havneruter, politiske
ruter, kulturvandringer, krigs-/motstandsruter, idretts- eller musikkruter.

### fortellinger

Narrative historier, hendelser, scener, historiske øyeblikk og “hva skjedde
her”. `fortellinger` dekker behovet for events/hendelser som PlaceCard-runding;
`stories` / `story` er bare legacy aliases.

### leksikon

Forklaringer, begreper, fagord, språkleksikon, kontekst, kunnskapskort og
Wonderkammer-innhold som objekter, detaljer og ting å se etter på stedet.
Leksikon kan fortsatt lenke videre til fortellinger, lesespor og Wonderkammer der
huben gjør det.

## Ikke egne PlaceCard-rundinger nå

- `wonderkammer` er ikke egen hovedrunding; det ligger under `leksikon`.
- `observations` er ikke egen hovedrunding; observasjoner håndteres som handling
  eller separat flyt utenfor gridet.
- Tidslinje er ikke egen runding nå; tids-/epokeinformasjon kan ligge i badges,
  leksikon, fortellinger eller annet relevant innhold.
- Nærhet/koblinger håndteres av NextUp/Fortsett reisen, ikke av en egen
  PlaceCard-runding.
- Kategorinavn som `nature`, `football`, `music`, `art`, `literature`,
  `science`, `politics`, `sport`, `media`, `architecture`, `history`, `market`,
  `transport`, `memorial` og `subculture` skal ikke brukes som canonical
  PlaceCard-rundinger.
