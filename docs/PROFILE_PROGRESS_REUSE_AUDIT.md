# History GO — profile-progress reuse audit

Dette dokumentet korrigerer retningen etter `docs/PROGRESSION_MODEL.md` og `docs/HISTORY_GO_PLAYABLE_GAP_AUDIT.md`.

Konklusjonen er: **profile leser allerede mye av progresjonen.** Derfor skal neste arbeid ikke lage en ny parallell progresjonssannhet. Riktig arbeid er å kartlegge hva `profile.js` allerede leser, og eventuelt trekke ut små rene lesehelpers slik at PlaceCard, Nearby og ruter kan bruke samme forståelse.

Gjelder History GO-spillet. Civication behandles som eget prosjekt og skal ikke styre dette passet.

---

## 1. Kort konklusjon

Ikke bygg stor `Progression Read Model v1` nå.

Bygg heller et smalt **Profile Progress Reuse Pass**:

1. Behold eksisterende lagringsnøkler.
2. Behold profile som hovedvisning for progresjon.
3. Ikke lag ny localStorage-sannhet.
4. Ikke migrer data.
5. Ikke dupliser profile-beregninger i PlaceCard/Nearby.
6. Trekk eventuelt ut små read-only helpers fra `profile.js` til en delt fil.

Riktig mål:

```text
profile.js sin eksisterende progresjonsforståelse → gjenbrukbar for PlaceCard, Nearby og ruter
```

Feil mål:

```text
ny progresjonsdatabase → profile må senere tilpasses den
```

---

## 2. Hva profile.js allerede gjør

`js/profile.js` sier selv at filen:

- kjører kun på `profile.html`
- leser people/places/badges
- viser profilkort
- viser merker
- viser personer låst opp
- viser steder besøkt
- viser tidslinje
- er kompatibel med localStorage-logikk fra appen

Dette er viktig: profile er allerede en progresjonsleser, ikke bare en ren visningsfil.

---

## 3. Eksisterende progresjonslesere i profile.js

### LocalStorage helper

`profile.js` har allerede:

```js
function ls(name, fallback = {})
```

Den brukes som trygg JSON-leser fra localStorage.

### Besøkte steder

`getVisitedPlaceIds()` leser:

```text
visited_places
```

via `readProgressIdSet("visited_places")`.

Dette brukes av:

- `getCompletedPlaceCount()`
- `renderPlacesCollection()`
- `renderTimeline()`
- `renderCollectionCards()`
- `updateProfileMarkers()`

### Samlede personer

`getCollectedPeopleIds()` leser:

```text
people_collected
```

via `readProgressIdSet("people_collected")`.

Dette brukes av:

- `renderPeopleCollection()`
- `renderTimeline()`
- `renderCollectionCards()`

### Fullførte quiz-enheter

`getCompletedQuizUnitCount()` leser:

- `window.HGLearningLog.getQuizHistory()`
- `quiz_progress`

Den samler id-er fra begge og teller unike enheter.

Dette er viktig fordi quiz-systemet både har legacy/vanlig quiz og set-basert quiz.

### Unlocks

`getUnlockState()` leser:

```text
hg_unlocks_v1
```

og returnerer `byQuiz`, `quizIds` og `visitedCount`.

### Musikkfunn

`getMusicUnlockSummary()` leser enten:

- `window.HGAhaMusic.getMusicUnlockSummary()`

eller fallback:

```text
hg_unlocked_music_objects_v1
```

Den oppsummerer:

- total
- artister
- tracks
- steder

### Merits / badges

`renderMerits()` og `openBadgeModal()` leser:

```text
merits_by_category
```

Og badge-modal leser quizhistorikk fra:

```js
window.HGLearningLog?.getQuizHistory?.()
```

Meritnivå beregnes fra badge tiers og points, ikke bare lagret level-tekst.

### Knowledge

`renderLatestKnowledge()` leser:

- `window.getKnowledgeUniverse()`
- fallback `knowledge_universe`

### Concepts / learning

Concepts og knowledge engine bruker:

- HGLearningLog
- HGKnowledgeEngine
- courses/pensum
- emne/signaler

### NextUp

`renderNextUpProfileCard()` leser:

```js
window.getNextUpProfileSummary()
```

### Groundhopper

Groundhopper-panel leser:

```text
hg_groundhopper_stats_v1
```

og bruker runtime-helpers som:

- `window.HG_getGroundhopperLevel`
- `window.HG_getGroundhopperAchievements`

### Profile-map

Profilkartet viser besøkte steder basert på:

```js
getVisitedPlaceIds()
```

---

## 4. Profile renderes allerede på updateProfile

`profile.js` lytter på:

```js
window.addEventListener("updateProfile", ...)
```

og rerendrer blant annet:

- profilkort
- PC
- merits
- people collection
- places collection
- timeline
- collection cards
- music collection
- latest knowledge
- latest trivia
- concepts
- NextUp
- Groundhopper
- KnowledgeEngine
- KnowledgeMatches
- profile map markers

Dette betyr at `updateProfile` allerede er hovedsignalet for progresjonsendring.

---

## 5. Hva dette betyr for videre arbeid

Det vi trenger er ikke et nytt stort system.

Vi trenger enten:

### Alternativ A — ingen kode nå

Bare bruk denne auditrapporten som styring og gå rett til PlaceCard-status.

Da må PlaceCard lese samme keys som profile leser, men uten å kopiere store deler av `profile.js`.

### Alternativ B — liten delt reader

Trekk ut de mest generelle funksjonene fra `profile.js` til en delt read-only helper, for eksempel:

```text
js/progress/profileProgressReader.js
```

Den bør bare lese og returnere enkel status. Ingen skriving. Ingen DOM. Ingen migrering.

Mulige exports/globals:

```js
window.HGProfileProgressReader = {
  getVisitedPlaceIds,
  getCollectedPeopleIds,
  getCompletedQuizUnitIds,
  getCompletedQuizUnitCount,
  getMusicUnlockSummary,
  getMeritsByCategory,
  getPlaceProgressSummary,
  getProfileProgressSummary
}
```

Men dette skal bare gjøres hvis PlaceCard/Nearby/ruter faktisk trenger det.

---

## 6. Hva bør gjenbrukes først

### Først: disse rene leserne

De er gode kandidater for delt helper:

- `ls(name, fallback)`
- `readProgressIdSet(storageKey)`
- `getVisitedPlaceIds()`
- `getCollectedPeopleIds()`
- `getCompletedQuizUnitCount()`
- en variant av `getCompletedQuizUnitIds()`
- `getMusicUnlockSummary()`

### Ikke trekk ut nå

Ikke trekk ut UI-rendering:

- `renderProfileCard`
- `renderMerits`
- `renderPlacesCollection`
- `renderPeopleCollection`
- `renderTimeline`
- `renderKnowledgeEnginePanel`
- DOM helpers
- modal-logikk
- kart-rendering

Dette skal forbli profile-visning.

---

## 7. Hva PlaceCard mangler fra profile-forståelsen

PlaceCard trenger ikke hele profilen. Det trenger status for aktivt sted.

Minimum status PlaceCard bør kunne lese:

```js
{
  placeId,
  visited: true/false,
  quizCompleted: true/false,
  favorite: true/false,
  collectedPeopleCount,
  musicUnlockCount,
  meritCategoryPoints,
  nextAction
}
```

Dette bør komme fra samme keys som profile leser:

- `visited_places`
- `quiz_progress`
- `hg_quiz_sets_v1`
- `hg_learning_log_v1`
- `people_collected`
- `merits_by_category`
- `hg_favorite_place_ids_v1`
- musikk-unlocks der relevant

---

## 8. Hva Nearby mangler fra profile-forståelsen

Nearby trenger ikke profil-rendering. Nearby trenger anbefalingssignaler.

Minimum:

- er stedet besøkt?
- har stedet ufullført quiz?
- er stedet favoritt?
- er stedet i aktiv rute?
- låser stedet opp noe?
- er stedet nær offentlig hjemsted eller posisjon?

Profile har allerede deler av dette, men ikke som Nearby-vennlig API.

---

## 9. Hva ruter mangler fra profile-forståelsen

Ruter trenger stoppstatus.

Minimum:

- hvilke stopp er besøkt?
- hvilke stopp har fullført quiz/handling?
- hvilke stopp mangler?
- skal rute regnes som online, fysisk eller komplett?

Profile kan allerede lese besøkte steder. Ruter trenger sannsynligvis egen liten adapter som bruker samme `getVisitedPlaceIds()` og quiz-settlesing.

---

## 10. Ikke gjør dette

Ikke gjør dette nå:

- ikke innfør `history_go_progress_read_model_v1` i localStorage
- ikke flytt profile-logikk til et stort nytt system
- ikke migrer eksisterende keys
- ikke endre quiz-writeflow
- ikke endre `updateProfile`-kontrakten
- ikke bland Civication inn i History GO-progresjonspasset
- ikke lag ny route-state før rute-flowen er avklart

---

## 11. Anbefalt neste PR

Neste kode-PR bør være liten:

### `profile-progress-reader-v1`

Gjør:

1. Lag `js/progress/profileProgressReader.js` som ren read-only helper.
2. Flytt eller dupliser forsiktig bare rene reader-funksjoner fra `profile.js`.
3. Last helperen før `profile.js` på `profile.html` og før PlaceCard/miniProfile der den trengs på `index.html`.
4. La `profile.js` bruke helperen der det er trygt.
5. Ikke endre UI først.
6. Eksponer enkel `window.HGProfileProgressReader`.

Men det kan også være riktig å vente med kode-PR og heller gå rett til PlaceCard status, dersom PlaceCard bare trenger noen få enkle checks.

---

## 12. Endelig vurdering

Ja, progresjonsgjenbruk er nødvendig.

Nei, ny stor progresjonsmodell er ikke nødvendig nå.

Den produktive linjen er:

```text
profile.js leser allerede progresjon → trekk ut minimale read-only helpers → bruk dem i PlaceCard/Nearby/ruter
```

Ikke:

```text
bygg ny progresjonsmodell → tilpass profile senere
```

Dette er viktig fordi History GO allerede er stort nok. Nå må vi redusere dobbeltlogikk, ikke lage flere parallelle lag.
