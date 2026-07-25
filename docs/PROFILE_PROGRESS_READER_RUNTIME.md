# History GO — Profile Progress Reader runtime

Status: **operational read-only runtime-guide**  
Kodeeier: `js/progress/profileProgressReader.js`  
Sist kontrollert: **2026-07-25**

`HGProfileProgressReader` gjør eksisterende progresjonslesing tilgjengelig for index-flater som PlaceCard, Nearby og ruter.

Den er:

- en faktisk runtime-helper;
- read-only;
- en avgrenset implementert del av mål-/adaptermodellen i [`PROGRESSION_MODEL.md`](./PROGRESSION_MODEL.md).

Den er ikke:

- en ny progresjonsmodell;
- en ny lagringssannhet;
- en migrering;
- en erstatning for `profile.js`, Knowledge, learning log, badges eller route-state.

## Runtime boundary

Koden:

- leser eksisterende localStorage/globaler;
- skriver ingenting;
- migrerer ingenting;
- rendrer ingen DOM;
- endrer ikke gameplay;
- skal brukes av nye UI-pass for å unngå duplisert progresjonslesing.

Global:

```js
window.HGProfileProgressReader
```

## Sources

Helperen leser:

- `visited_places`
- `people_collected`
- `quiz_progress`
- `merits_by_category`
- `hg_unlocked_music_objects_v1`
- `hg_favorite_place_ids_v1`
- `hg_groundhopper_stats_v1`
- `hg_unlocks_v1`
- `window.HGLearningLog.getQuizHistory()` der tilgjengelig
- `window.HGFavoritePlaces` der tilgjengelig
- `window.HGAhaMusic` der tilgjengelig

Hvis en kilde mangler eller har ugyldig lokal JSON, returnerer helperen defensiv fallback. Den reparerer eller skriver ikke kilden.

## Public methods

```js
HGProfileProgressReader.getVisitedPlaceIds()
HGProfileProgressReader.getVisitedPlaceIdList()
HGProfileProgressReader.getCollectedPeopleIds()
HGProfileProgressReader.getCollectedPeopleIdList()
HGProfileProgressReader.getQuizHistory()
HGProfileProgressReader.getCompletedQuizUnitIds()
HGProfileProgressReader.getCompletedQuizUnitIdList()
HGProfileProgressReader.getCompletedQuizUnitCount()
HGProfileProgressReader.getMeritsByCategory()
HGProfileProgressReader.getFavoritePlaceIds()
HGProfileProgressReader.getFavoritePlaceIdList()
HGProfileProgressReader.isFavoritePlace(placeId)
HGProfileProgressReader.getMusicUnlockRows()
HGProfileProgressReader.getMusicUnlockSummary()
HGProfileProgressReader.getUnlockState()
HGProfileProgressReader.getGroundhopperStats()
HGProfileProgressReader.getPlaceProgressSummary(placeId, { category })
HGProfileProgressReader.getProfileProgressSummary()
```

## Place summary

```js
const status = window.HGProfileProgressReader.getPlaceProgressSummary(place.id, {
  category: place.category
});
```

Den implementerte summaryen kan lese:

- besøkt;
- quiz fullført;
- favoritt;
- category merit-info;
- beregnet status `unknown`, `visited`, `quiz_completed` eller `completed`;
- neste handling `open`, `quiz` eller `completed`.

Den bredere status- og datamodellen i `PROGRESSION_MODEL.md` er fortsatt en mål-/adaptermodell. Felter som ikke finnes i helperens kode skal ikke fremstilles som implementert.

## Profile summary

`getProfileProgressSummary()` samler nå:

- besøkte place-id-er og antall;
- collected people-id-er og antall;
- fullførte quiz-unit-id-er og antall;
- favorittsteder og antall;
- merits per kategori;
- music unlock summary;
- unlock-state;
- groundhopper-stats.

## Do not use for

- ny storage-key;
- migrering;
- backend-sync;
- route-state som egen sannhet;
- badge-/merit-writes;
- å erstatte `HGLearningLog`;
- å erstatte `profile.js`;
- å hevde at hele `PROGRESSION_MODEL.md` er implementert.

## Change rule

Når den offentlige API-flaten, source keys eller summary-semantikken i `profileProgressReader.js` endres, skal denne guiden oppdateres i samme PR.
