# History GO — profile progress og place collection runtime

Status: **operational read-only/runtime guide**  
Progress reader: `js/progress/profileProgressReader.js`  
Place collection: `js/profile-place-collection.js`  
Mål-/adaptermodell: `docs/PROGRESSION_MODEL.md`  
Sist kontrollert: **2026-07-28**

Dette dokumentet beskriver to implementerte, men forskjellige profilrelaterte read-lag:

1. `HGProfileProgressReader` — generell read-only progresjonshelper for flere eksisterende state-kilder.
2. `HGProfilePlaceCollection` — profilens place-samling, som holder fysisk visit og quiz collection adskilt og viser unionen.

Ingen av dem er en ny global sannhetskilde.

## 1. `HGProfileProgressReader`

Global:

```js
window.HGProfileProgressReader
```

Helperen:

- leser eksisterende localStorage/globaler;
- skriver ingenting;
- migrerer ingenting;
- rendrer ingen DOM;
- gir UI en defensiv read-only adapter.

Den kan lese kilder som:

- `visited_places`;
- `people_collected`;
- quiz progress/history;
- merits;
- favoritter;
- music unlocks;
- unlock-state;
- groundhopper-state;
- learning-log quizhistorikk der tilgjengelig.

Den reparerer ikke ugyldig state; den returnerer defensiv fallback.

## 2. Progress Reader API

Den implementerte helperen eksponerer metoder for blant annet:

- visited place IDs;
- collected People IDs;
- quiz history/fullførte units;
- merits per kategori;
- favorittsteder;
- unlock state;
- Groundhopper;
- place progress summary;
- samlet profile summary.

Den faktiske kildekoden eier den presise offentlige API-listen.

## 3. `getPlaceProgressSummary`

Denne helperen har en **smal compatibility/read-summary**, ikke hele canonical progresjonsmodellen.

Den kan beregne signaler som:

- besøkt;
- quiz fullført;
- favoritt;
- category merit-info;
- helper-spesifikke statusnavn;
- neste handling.

Hvis helperen bruker navn som `completed`, betyr det bare helperens implementerte beregning. Det skal ikke brukes til å viske ut forskjellen mellom:

- fysisk visit;
- quiz collection;
- spillerens brede canonical completion.

`docs/COMPLETION_DEFINITIONS.md` eier begrepsbetydningen.

## 4. Place collection er et separat read-lag

`HGProfileProgressReader.getVisitedPlaceIds()` er **ikke** hele profilsamlingen av steder.

Den nye place-samlingen eies av:

```js
window.HGProfilePlaceCollection
```

og leser separat:

```text
visited_places
places_collected
```

Der:

- `visited_places` = fysisk besøkte steder;
- `places_collected` = quiz-/target-unlocked places.

## 5. Profilens samlede place-liste

`HGProfilePlaceCollection.getCollectedPlaceIds()` bygger unionen:

```text
fysisk besøkte places ∪ quiz-samlede places
```

Kilden bevares semantisk:

- fysisk besøkt kan vises som `Besøkt`;
- quiz-samlet kan vises som `Quiz`.

Dette gjør det mulig å vise begge i profilsamlingen uten å hevde at quiz collection er fysisk visit.

## 6. Place collection API

Den implementerte helperen eksponerer blant annet:

```js
HGProfilePlaceCollection.getVisitedPlaceIds()
HGProfilePlaceCollection.getQuizCollectedPlaceIds()
HGProfilePlaceCollection.getCollectedPlaceIds()
HGProfilePlaceCollection.getCollectedSource(placeId)
HGProfilePlaceCollection.install()
HGProfilePlaceCollection.refresh()
```

Den kan oppdatere place collection, timeline og collection-card-flater når profilen er klar.

## 7. Skriveeierskap

Disse read-lagene skal ikke blandes med write-eiere.

- fysisk visit-write eies av physical visit-runtime;
- `places_collected` write eies av place target-unlock i `js/hg_unlocks.js`;
- People collection følger eksisterende People/unlock-state;
- quizresultater følger quizmotoren;
- favoritt følger favorittsystemet.

Read-model skal aldri reparere state ved å skrive tilbake.

## 8. Profile summary

`HGProfileProgressReader` kan fortsatt gi et bredt profilsummary av state-kilder den faktisk kjenner.

`HGProfilePlaceCollection` kompletterer dette for **place collection**, men gjør ikke automatisk alle nye collection-felter tilgjengelige gjennom den eldre progress reader-API-en.

UI som trenger «samlede steder» skal derfor bruke den implementerte place collection-readmodellen, ikke anta at visited-listen alene er profilsamlingen.

## 9. Forholdet til canonical modeller

- `docs/COMPLETION_DEFINITIONS.md` eier hva besøkt/samlet/fullført betyr.
- `docs/PROGRESSION_MODEL.md` eier samlet adaptermodell.
- `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md` eier runtimegrensen mellom quiz, place collection og fysisk visit.
- denne filen dokumenterer de implementerte profil-readhelperne.

Planlagte felter i `PROGRESSION_MODEL.md` er ikke implementert bare fordi de står der.

## 10. Do not use for

Ikke bruk disse helperne til:

- ny storage-key;
- migrering;
- backend-sync;
- fysisk visit-write;
- quiz-write;
- badge-/merit-writes;
- å erstatte learning log;
- å hevde at hele progresjonsmodellen er implementert;
- å slå sammen «visited» og «collected» semantisk.

## 11. Endringsregel

Denne guiden skal oppdateres i samme PR når noen av disse endres:

- public API i `profileProgressReader.js`;
- kildene den leser;
- public API i `profile-place-collection.js`;
- `visited_places`/`places_collected`-unionen;
- source-labeling for collected places;
- hvilken profilflate som renderer collection-state.