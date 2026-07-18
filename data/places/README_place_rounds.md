# PlaceCard-rundinger (`rounds`)

PlaceCard-rundingene bygger på en fast rundingspool og kategori-profiler. Hver
kategori-profil viser nøyaktig 9 rundinger i et stabilt 3x3-grid, mens
`place.category` velger hvilken profil stedet får. `place.rounds` / `rundinger`
kan fortsatt brukes som manuell override i enkelttilfeller, men nye data trenger
normalt ikke å sette feltet.

## Rundingspool

Canonical PlaceCard-rundinger i poolen er:

- `people`
- `nature`
- `badges`
- `works`
- `civication`
- `brands`
- `før_nå`
- `fortellinger`
- `leksikon`
- `play`
- `training`
- `tasks`

Alle kategori-profiler skal ha nøyaktig 9 rundinger, ingen duplikater og bare
id-er som finnes i denne poolen.

## Kategori-profiler

```text
by:
people | nature | badges
works | civication | brands
før_nå | fortellinger | leksikon

historie:
people | works | badges
før_nå | civication | brands
nature | fortellinger | leksikon

historisk:
people | works | badges
før_nå | civication | brands
nature | fortellinger | leksikon

natur:
tasks | nature | badges
training | civication | brands
før_nå | fortellinger | leksikon

sport:
people | training | badges
works | civication | brands
før_nå | fortellinger | leksikon

lekeplass:
play | nature | badges
tasks | civication | brands
før_nå | fortellinger | leksikon

trening:
people | nature | badges
training | civication | brands
før_nå | tasks | leksikon

politikk:
people | works | badges
før_nå | civication | brands
nature | fortellinger | leksikon

kunst:
people | works | badges
nature | civication | brands
før_nå | fortellinger | leksikon

litteratur:
people | works | badges
nature | civication | brands
før_nå | fortellinger | leksikon

musikk:
people | works | badges
nature | civication | brands
før_nå | fortellinger | leksikon

vitenskap:
people | nature | badges
works | civication | brands
før_nå | fortellinger | leksikon

subkultur:
people | works | badges
play | civication | brands
før_nå | fortellinger | leksikon

naeringsliv:
people | works | badges
før_nå | civication | brands
nature | fortellinger | leksikon

transport:
people | works | badges
før_nå | civication | brands
nature | fortellinger | leksikon
```

## Legacy aliases

Runtime støtter disse bakoverkompatible aliasene slik at eksisterende data ikke
knekker:

- `lexicon` -> `leksikon`
- `stories` / `story` -> `fortellinger`
- `wonderkammer` -> `leksikon`
- `football` / `music` -> `works`
- `routes` er legacy alias for `før_nå`, men skal ikke brukes som ny canonical runding.
- `observations` er legacy og skal ikke brukes som ny canonical runding.

Nye data skal bruke canonical id-er hvis metadatafeltet fortsatt trengs. `routes` er ikke PlaceCard-runding fordi ruter håndteres av egen Rute-knapp/footer, Nearby/Utforsk og ruteflyt.

## Leksikon og Wonderkammer

`leksikon` er kunnskaps- og oppdagelsesinngangen i PlaceCard. Wonderkammer er
ikke lenger en egen hovedrunding, men skal fortsatt eksistere som innholdstype og
ligge under Leksikon-flowen / Leksikon-huben sammen med for eksempel begreper,
språk, forklaringer, objekter, detaljer og lesespor.

Quiz og kunnskapsspørsmål uten en konkret fysisk stedshandling bør heller ligge
under `leksikon`, `fortellinger` eller `badges` enn å gi stedet `tasks`.

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

### nature

Fysisk miljø og naturspor ved stedet. `nature` betyr ikke bare villmark; den kan
også dekke bynatur, landskap, grøntstruktur, vann, trær, vær, topografi,
materialitet og stedets fysiske omgivelser. Derfor kan `nature` brukes som en
stabil innholdsrunding i flere kultur-, institusjons- og transportprofiler.

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

`tasks` er en handlingsrunding, ikke en hypotetisk oppgaveplass. Bruk den bare
når rundingen kan bety noe brukeren faktisk kan gjøre på stedet: finne noe, leke
noe, trene noe, observere noe, utføre en fysisk aktivitet eller løse en konkret
stedshandling.

`tasks` skal bare brukes i kategori-profiler der oppgaven er konkret:

- `natur` — observasjons-/finn-/se-etter-oppgaver, artsjakt, spor, stier og
  friluftshandlinger.
- `lekeplass` — leke-, finne-, bevegelses- og barneoppgaver.
- `trening` — økter, runder, intervaller, styrkeoppgaver og fysisk aktivitet.

Kultur-, institusjons-, transport- og politikksteder skal ikke få `tasks` bare
fordi de kan ha quiz eller oppgaver senere. Uten en konkret fysisk oppgave bør
quiz/kunnskapsspørsmål heller kurateres under `leksikon`, `fortellinger` eller
`badges`.

### play

`play` skal ikke brukes bredt. Bruk den for `lekeplass`, og eventuelt i
`subkultur` der lek, skate, eksperimentering eller uformell bruk av byrom gir
mening.

### training

Trening, fysisk øving, runder, aktivitetsopplegg og idrettsnære handlinger.

Stedsspesifikt innhold kan ligge i `training_profile` uten å overstyre
`place.rounds`:

```json
{
  "training_profile": {
    "title": "Kort tittel",
    "summary": "Hva økten trener på ved akkurat dette stedet.",
    "safety": "Stedsspesifikk trygghetsregel.",
    "exercises": [
      {
        "id": "stabil_id",
        "title": "Øvelsesnavn",
        "instruction": "Konkret fysisk framgangsmåte.",
        "duration_minutes": 10,
        "intensity": "lett",
        "why": "Hvorfor øvelsen hører hjemme her."
      }
    ]
  }
}
```

`training_profile` skal bare fylles når kategori-profilen faktisk har
`training`, og øvelsene skal kunne utføres trygt og lovlig på stedet.

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

### før_nå

Visuelt og stedlig før/etter-innhold: historiske bilder, dagens bilde,
transformasjon, og endringer i bruk, uttrykk og fysisk miljø.

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
- Kategorinavn som `football`, `music`, `art`, `literature`, `science`,
  `politics`, `history`, `market`, `transport`, `memorial` og `subculture` skal
  ikke brukes som canonical PlaceCard-rundinger.
