# History Go – uavhengige læringsspill

Dato: 2026-06-26

## Hovedvedtak

History Go skal være samlings-, steds- og kunnskapsmotoren. Civication skal ikke eie spillene.

De selvstendige læringsspillene er:

1. **HG Football Manager**
2. **HG Film Producer**
3. **Kunstskolen**
4. **Skrivekunstakademiet**

Civication kan vise dem som livsområder, jobber, fritid, status eller snarveier, men hvert spill må kunne kjøre uten Civication.

```text
History Go
→ felles steder, personer, verk, institusjoner, ruter, merker og samlinger

AHA / Profil
→ viser hvem brukeren er, progresjon, gallerier, spillstatus og læringsidentitet

Civication
→ livssimulator / samfunn / hverdag / økonomi / jobb og rollevalg

Selvstendige spill
→ FootballManager, Film Producer, Kunstskolen, Skrivekunstakademiet
```

## Arkitekturregel

```text
Civication kan lenke til spillene.
Civication kan bruke resultatene fra spillene.
Civication skal ikke være motoren til spillene.
```

All progresjon som påvirker brukerprofilen må trigge:

```js
window.dispatchEvent(new Event("updateProfile"));
```

Dette gjelder når et spill låser opp personer, steder, verk, merker, poeng, ferdigheter eller samlingsobjekter.

## Felles History Go-lag

Felleslaget skal inneholde de tingene alle spillene kan hente fra:

```text
places
people
works
institutions
events
routes
badges
objects
eras
movements
skills
```

Relasjonene er like viktige som objektene:

```text
person → place
work → place
work → person
institution → person
route → place
movement → work
skill → task
```

## Spillmodell

### HG Football Manager

Fotballspill med klubber, spillere, stadioner, trenere, formasjoner, taktikk, kampdag og historisk fotballkunnskap.

Skal kunne lese fra History Go:

```text
players
clubs
stadiums
football places
formations
staff
badges
```

Skal skrive tilbake:

```text
team progress
formation mastery
match badges
collected staff
manager level
```

### HG Film Producer

Filmspill der brukeren lærer film ved å caste, produsere, analysere locations, bygge filmspråk og forstå regissører, sjangre, studioer og filmhistoriske miljøer.

Skal kunne lese fra History Go:

```text
directors
actors
studios
film locations
cinemas
movements
works
```

Skal skrive tilbake:

```text
film craft progress
producer badges
scene tasks
location unlocks
```

### Kunstskolen

Kunstspill der brukeren lærer kunst ved å lage verk inspirert av kjente kunstverk, epoker, teknikker, museer, kunstnere og steder.

Skal kunne lese fra History Go:

```text
artists
artworks
museums
movements
techniques
studios
public art places
```

Skal skrive tilbake:

```text
art skill progress
completed studies
movement mastery
artwork unlocks
museum route progress
```

### Skrivekunstakademiet

Litteraturspill der brukeren lærer av forfattere, tekster, steder, scener, stemmer, dialog, rytme og komposisjon.

Dette bruker Goodreads 4+-uttrekket som kuratert inspirasjonskanon. Rating og private Goodreads-felt skal ikke importeres. Rating brukes kun som filter.

Skal kunne lese fra History Go:

```text
authors
books
literary places
bookstores
libraries
universities
publishers
magazines
routes
```

Skal skrive tilbake:

```text
writing craft progress
completed assignments
author unlocks
place story unlocks
writing badges
```

## Rettighetsregel

Spillene kan bruke:

```text
forfatternavn
kunstnernavn
titler
historiske fakta
steder
institusjoner
tema
formgrep
epoketrekk
public domain-materiale
brukerens egne tekster
```

Spillene skal ikke importere eller gjengi opphavsrettsbeskyttet boktekst, filmmanus, kunstverk eller annet beskyttet uttrykk som treningsdata eller oppgaveinnhold.

## Importregel

Denne PR-en etablerer scaffold og data-seed. Den skal ikke gjøre stor UI-endring.

Neste steg er å koble `data/historygo/shared/game_registry.json` til profil/AHA dersom repoet allerede har en Spill-tab eller en etablert spillseksjon. Hvis ikke skal registeret ligge som data først.
