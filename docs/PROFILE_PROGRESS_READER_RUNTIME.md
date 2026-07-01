# History GO — Profile Progress Reader runtime

`js/progress/profileProgressReader.js` er en liten read-only runtime-helper.

Den finnes for å gjøre den progresjonslesingen som allerede brukes i `profile.js` tilgjengelig for index-flater som PlaceCard, Nearby og ruter.

Den er ikke en ny progresjonsmodell og ikke en ny lagringssannhet.

---

## Prinsipper

- Leser bare eksisterende localStorage/globaler.
- Skriver ingenting.
- Migrerer ingenting.
- Rendrer ingen DOM.
- Endrer ikke gameplay.
- Erstatter ikke `profile.js`.
- Skal brukes av nye UI-pass for å unngå dobbel progresjonslogikk.

---

## Global

Runtime eksponerer:

```js
window.HGProfileProgressReader
```

---

## Leser fra

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

---

## Viktige metoder

```js
HGProfileProgressReader.getVisitedPlaceIds()
HGProfileProgressReader.getVisitedPlaceIdList()
HGProfileProgressReader.getCollectedPeopleIds()
HGProfileProgressReader.getCollectedPeopleIdList()
HGProfileProgressReader.getCompletedQuizUnitIds()
HGProfileProgressReader.getCompletedQuizUnitIdList()
HGProfileProgressReader.getCompletedQuizUnitCount()
HGProfileProgressReader.getMeritsByCategory()
HGProfileProgressReader.getFavoritePlaceIds()
HGProfileProgressReader.getFavoritePlaceIdList()
HGProfileProgressReader.isFavoritePlace(placeId)
HGProfileProgressReader.getMusicUnlockSummary()
HGProfileProgressReader.getUnlockState()
HGProfileProgressReader.getGroundhopperStats()
HGProfileProgressReader.getPlaceProgressSummary(placeId, { category })
HGProfileProgressReader.getProfileProgressSummary()
```

---

## Første bruk

Første naturlige brukssted er PlaceCard-status.

PlaceCard bør kunne lese:

```js
const status = window.HGProfileProgressReader.getPlaceProgressSummary(place.id, {
  category: place.category
});
```

og bruke dette til å vise:

- besøkt
- quiz fullført
- favoritt
- completed
- neste handling

---

## Ikke bruk til

- ny lagring
- migrering
- backend-sync
- route-state som egen sannhet
- å skrive badges/merits
- å erstatte `HGLearningLog`
- å erstatte `profile.js`

---

## Neste steg

1. PlaceCard status surface.
2. Nearby/NextUp kan lese `getPlaceProgressSummary`.
3. Ruter kan bruke visited/quiz-status uten å kopiere profile-logikk.
4. `profile.js` kan senere frivillig bruke helperen, men det er ikke nødvendig i første pass.
