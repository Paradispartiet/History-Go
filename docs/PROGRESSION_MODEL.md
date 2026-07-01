# History GO — progresjonsmodell

Dette dokumentet beskriver felles progresjonsmodell for History GO.

Formålet er å gjøre kart, PlaceCard, quiz, badges, profil, Wonderkammer, ruter, Nearby, HG Social og Spotmeeting enige om samme sannhet.

Gjelder History GO-spillet. Civication er eget prosjekt og inngår ikke her.

---

## 1. Hvorfor felles progresjon?

History GO har mange systemer. Uten felles progresjonsmodell blir hvert system sin egen øy.

Felles modell skal gjøre at:

- PlaceCard vet hva brukeren har gjort på stedet.
- Profilen viser riktig status.
- Wonderkammer viser opplåste funn.
- Nearby anbefaler riktig neste sted.
- Ruter vet hvilke stopp som er fullført.
- Badges kan beregnes konsekvent.
- Social/Spotmeeting kan vise trygg og riktig aktivitet.
- Lokal lagring kan fungere før backend er komplett.

---

## 2. Overordnet modell

Progresjon bør samles i én versjonert struktur.

Forslag til hovednøkkel:

```js
history_go_progress_v1
```

Forslag til form:

```js
{
  version: 1,
  updatedAt: "2026-07-01T00:00:00.000Z",
  player: {
    homePlace: null,
    level: null,
    titles: []
  },
  places: {},
  quizzes: {},
  badges: {},
  people: {},
  wonder: {},
  routes: {},
  favorites: {},
  categories: {},
  social: {},
  spotmeetings: {}
}
```

Dette er produktmodell, ikke nødvendigvis endelig kodeformat.

---

## 3. Place progress

Hvert sted bør ha egen progresjonsstatus.

```js
places: {
  [placeId]: {
    placeId,
    category,
    discoveredAt,
    openedAt,
    visitedAt,
    checkedInAt,
    completedAt,
    masteredAt,
    status,
    medal,
    quizIds: [],
    badgeIds: [],
    unlockedPeople: [],
    unlockedWonderItems: [],
    routeIds: [],
    favorite: false,
    updatedAt
  }
}
```

Gyldige `status`-verdier:

- `unknown`
- `discovered`
- `opened`
- `visited`
- `checked_in`
- `quiz_attempted`
- `quiz_completed`
- `completed`
- `mastered`

Gyldige `medal`-verdier:

- `none`
- `bronze`
- `silver`
- `gold`

---

## 4. Quiz progress

```js
quizzes: {
  [quizId]: {
    quizId,
    placeId,
    personId,
    category,
    attempts,
    bestScore,
    lastScore,
    completed,
    perfect,
    attemptedAt,
    completedAt,
    updatedAt
  }
}
```

Quiz skal kunne være:

- forsøkt
- bestått/fullført
- perfekt
- repetert

Quiz må kunne oppdatere:

- stedstatus
- badges
- knowledge/trivia
- profil
- Wonderkammer
- ruteprogresjon

---

## 5. Badge progress

```js
badges: {
  [badgeId]: {
    badgeId,
    type,
    category,
    sourceType,
    sourceId,
    earnedAt,
    level,
    visibleInProfile
  }
}
```

Badge-typer:

- `place_badge`
- `category_badge`
- `route_badge`
- `person_badge`
- `wonder_badge`
- `event_badge`
- `special_badge`

`sourceType` bør peke på hva som ga badget:

- `place`
- `quiz`
- `route`
- `person`
- `wonder_item`
- `category`

---

## 6. People progress

```js
people: {
  [personId]: {
    personId,
    discoveredAt,
    unlockedAt,
    collectedAt,
    completedAt,
    sourcePlaceIds: [],
    sourceRouteIds: [],
    relationIds: [],
    wonderItemIds: [],
    status,
    updatedAt
  }
}
```

Gyldige statuser:

- `unknown`
- `discovered`
- `unlocked`
- `collected`
- `completed`

Personer bør låses opp gjennom steder, ruter, quiz eller Wonderkammer-funn.

---

## 7. Wonder progress

```js
wonder: {
  [itemId]: {
    itemId,
    type,
    title,
    sourceType,
    sourceId,
    unlockedAt,
    collectedAt,
    category,
    placeIds: [],
    personIds: [],
    routeIds: [],
    visible: true
  }
}
```

Wonderkammer-funn bør kunne være:

- `curiosity`
- `quote`
- `artifact`
- `person_link`
- `place_link`
- `route_memory`
- `nature_observation`
- `sport_moment`
- `music_trace`
- `political_event`
- `business_history`
- `urban_phenomenon`

---

## 8. Route progress

```js
routes: {
  [routeId]: {
    routeId,
    status,
    startedAt,
    completedAt,
    masteredAt,
    currentStopId,
    stopProgress: {
      [placeId]: {
        placeId,
        status,
        completedAt,
        required: true
      }
    },
    badgeIds: [],
    wonderItemIds: [],
    updatedAt
  }
}
```

Gyldige rute-statuser:

- `not_started`
- `started`
- `in_progress`
- `ready_for_final`
- `completed`
- `mastered`

Ruteprogresjon skal oppdateres når stedstatus endres.

---

## 9. Favorites

Favoritter bør være generiske nok til å støtte flere objekttyper.

```js
favorites: {
  places: {
    [placeId]: {
      placeId,
      addedAt
    }
  },
  people: {},
  routes: {},
  categories: {}
}
```

Minimum for v1:

- favoritt steder
- visning i Nearby
- visning i profil

---

## 10. Category progress

```js
categories: {
  [categoryId]: {
    categoryId,
    discoveredCount,
    openedCount,
    visitedCount,
    completedPlaceCount,
    completedQuizCount,
    badgeCount,
    routeCount,
    completedRouteCount,
    unlockedPeopleCount,
    wonderItemCount,
    level,
    percent,
    updatedAt
  }
}
```

Kategori-progresjon bør vises i profil.

Eksempel på nivåer:

- `not_started`
- `started`
- `bronze`
- `silver`
- `gold`
- `mastered`

---

## 11. Home place

Offentlig hjemsted bør ligge under `player.homePlace`.

```js
homePlace: {
  placeId,
  name,
  category,
  lat,
  lon,
  radius,
  selectedAt,
  visibility
}
```

Regel:

- Må være et eksisterende History GO-sted.
- Skal ikke være privat adresse.
- Skal kunne brukes av Nearby, ruter, anbefalinger, profil, Social og Spotmeeting.

---

## 12. Social progress

Social må kobles til History GO-objekter.

```js
social: {
  activity: {
    [activityId]: {
      activityId,
      type,
      sourceType,
      sourceId,
      visibility,
      createdAt
    }
  },
  friends: {},
  blocks: {},
  reports: {}
}
```

Eksempler på `sourceType`:

- `place`
- `route`
- `wonder_item`
- `person`
- `badge`
- `spotmeeting`

---

## 13. Spotmeeting progress

```js
spotmeetings: {
  [meetingId]: {
    meetingId,
    placeId,
    createdAt,
    scheduledAt,
    status,
    participantIds: [],
    visibility,
    safetyChecked: true,
    updatedAt
  }
}
```

Gyldige statuser:

- `draft`
- `invited`
- `accepted`
- `declined`
- `cancelled`
- `completed`

Regel:

- `placeId` må være offentlig History GO-sted.
- Ingen privat adresse.

---

## 14. Oppdateringsflyt

Når en spiller fullfører quiz på et sted, bør dette skje:

1. `quizzes[quizId]` oppdateres.
2. `places[placeId]` oppdateres.
3. Badge-regler evalueres.
4. People-unlocks evalueres.
5. Wonderkammer-unlocks evalueres.
6. Ruteprogresjon evalueres.
7. Kategori-progresjon beregnes.
8. Profil får ny summary.
9. Nearby får ny anbefalingsgrunnlag.
10. Social activity opprettes hvis aktivert og tillatt.

---

## 15. Lokal først, backend senere

Progresjonen skal fungere lokalt før backend er komplett.

Krav:

- tåle reload
- tåle offline
- kunne eksporteres/importeres
- kunne migreres til konto/sync senere

Backend skal støtte produktmodellen, ikke definere den på nytt.

---

## 16. Migrering

Alle endringer i progresjonsformat må ha:

- versjonsnummer
- migreringsfunksjon
- fallback for gamle data
- dokumentert endring

Ikke endre localStorage-nøkler uten migrering.

---

## 17. Første implementerbare minimum

Progression Core v1 bør starte med:

- places
- quizzes
- badges
- favorites
- routes
- people
- wonder
- categories
- homePlace

Social og Spotmeeting kan bruke samme modell etterpå.

---

## 18. Suksesskriterium

Etter Progression Core v1 skal dette være sant:

- PlaceCard viser riktig status.
- Profil viser riktig status.
- Wonderkammer viser opplåste funn.
- Nearby anbefaler basert på faktisk progresjon.
- Ruter oppdateres automatisk når steder fullføres.
- Reload mister ikke progresjon.
- Backend kan kobles på uten å endre produktlogikken.
