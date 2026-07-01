# History GO — progresjonsmodell

Dette dokumentet beskriver hvordan History GO bør samle og lese progresjon på tvers av eksisterende systemer.

Det skal ikke innføre en ny parallell sannhet som erstatter dagens `quiz_history`, `knowledge_universe`, `trivia_universe`, `hg_learning_log_v1`, badges/merits, route-state eller profile snapshots. Det definerer en **samlet read-model / adaptermodell** som eksisterende og framtidig UI kan lese fra.

Leses sammen med:

- `docs/COMPLETION_DEFINITIONS.md`
- `docs/HISTORY_GO_PRODUCT_MAP.md`
- `README/quizREADME.md`
- `README/README.pensum.md`
- `README/fagstrukturREADME.md`
- `docs/DATA_PRODUCTION_CONTRACT.md`
- `docs/APP_STRUCTURE_INDEX.md`

Gjelder History GO-spillet. Civication er eget prosjekt og inngår ikke i denne progresjonsmodellen.

---

## 1. Hvorfor felles progresjon?

History GO har mange eksisterende progresjonsspor:

- quiz-historikk
- knowledge/trivia
- learning log
- observations
- badges/merits
- profile summary
- route-state
- place visited-state
- people/relations
- Wonderkammer
- Social Meet / Spotmeeting local/demo state

Uten samlet lesemodell blir hvert system sin egen øy.

Felles modell skal gjøre at:

- PlaceCard vet hva brukeren har gjort på stedet.
- Profilen viser riktig status.
- Wonderkammer/leksikon viser opplåste funn.
- Nearby anbefaler riktig neste sted.
- Ruter vet hvilke stopp som er fullført.
- Badges kan beregnes konsekvent.
- Social Meet / Spotmeeting kan bruke trygg, kontekstbundet status.
- Lokal lagring kan fungere før backend er komplett.

---

## 2. Eksisterende lagring som må respekteres

Denne modellen må bygge på eksisterende nøkler og motorer.

| Lagring / motor | Rolle |
|---|---|
| `quiz_history` | quizforsøk og fullførte quizzer |
| `knowledge_universe` | tekstlig kunnskap låst opp via quiz |
| `trivia_universe` | funfacts/mikrobelønninger |
| `hg_learning_log_v1` | append-only learning events, quiz/observations/emne hits |
| `HGObservations` | observasjons-events til learning log |
| `HGCourses.compute` | beregner kurs-/diplomstatus fra emner/logg |
| `DomainHealthReport` | validerer domener/filer |
| `QuizAudit` | validerer quiz-targets mot places/people |
| badges/merits | eksisterende badge-/meritstatus |
| route-state | eksisterende rutevisning/aktivering der implementert |
| profile update event | `window.dispatchEvent(new Event("updateProfile"))` |

Regel:

> Ikke flytt data til ny nøkkel uten migrering. Første steg er read-model, ikke ny sannhetskilde.

---

## 3. Read-model, ikke erstatning

Første felles progresjonsmodell bør være en beregnet/aggregert read-model.

Forslag til navn hvis den materialiseres:

```js
history_go_progress_read_model_v1
```

Denne kan bygges fra eksisterende lagring:

```js
{
  version: 1,
  updatedAt,
  sources: {
    quizHistory: true,
    knowledgeUniverse: true,
    triviaUniverse: true,
    learningLog: true,
    badges: true,
    routes: true,
    profile: true
  },
  player: {},
  places: {},
  quizzes: {},
  badges: {},
  people: {},
  wonder: {},
  routes: {},
  favorites: {},
  categories: {},
  socialMeet: {},
  spotmeetings: {}
}
```

Dette er produktmodell/read-model. Runtime source of truth for hvert felt må fortsatt følge eksisterende kontrakter.

---

## 4. Place progress

Place progress bør beregnes fra:

- åpnet PlaceCard/popup
- visited-state
- innsjekk der det finnes
- quiz_history
- observations i `hg_learning_log_v1`
- badges/merits
- route-state
- Wonderkammer/leksikon-unlocks
- favorites

Forslag til read-model:

```js
places: {
  [placeId]: {
    placeId,
    category,
    discoveredAt,
    openedAt,
    visitedAt,
    checkedInAt,
    observedAt,
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

Gyldige read-model-statuser:

- `unknown`
- `discovered`
- `opened`
- `visited`
- `checked_in`
- `quiz_attempted`
- `quiz_completed`
- `observed`
- `completed`
- `mastered`

---

## 5. Quiz progress

Quiz progress bør lese fra eksisterende quizmotor og `quiz_history`.

```js
quizzes: {
  [quizId]: {
    quizId,
    placeId,
    personId,
    categoryId,
    attempts,
    bestScore,
    lastScore,
    completed,
    perfect,
    attemptedAt,
    completedAt,
    relatedEmner: [],
    coreConcepts: [],
    updatedAt
  }
}
```

Quiz completion bør fortsatt utløse eksisterende hooks:

- knowledge save
- trivia save
- learning log event
- badge/merit update
- `updateProfile`

Reward-popupen må ikke overskrives av ny popup i samme tick.

---

## 6. Learning progress

Learning progress er ikke det samme som knowledge.

Eksisterende skille:

- `knowledge_universe` = tekstlig kunnskap / låst opp kunnskapsinnhold
- `hg_learning_log_v1` = append-only events for quiz/observations/emne hits
- courses/pensum = beregner progresjon fra emner/logg

Read-model kan oppsummere:

```js
learning: {
  conceptsSeen: [],
  emneHits: [],
  observationsCount,
  quizEventCount,
  courseSummaries: {
    [subjectId]: {
      percent,
      done,
      total,
      modules: [],
      diploma
    }
  }
}
```

Regel:

> Learning log er append-only. Ikke muter historikk for å rette visning; bygg bedre read-model.

---

## 7. Badge / merits progress

```js
badges: {
  [badgeId]: {
    badgeId,
    type,
    category,
    underbadgeIds: [],
    sourceType,
    sourceId,
    earnedAt,
    level,
    visibleInProfile
  }
}
```

Badge-read-model må respektere:

- `category` som primært domain/badge
- `underbadge_ids` som underbadgefelt
- eksisterende badgefiler
- ingen oppfunnede category-felt før schema/runtime støtter det

---

## 8. People progress

People progress bør lese fra manifest-loadede people-filer og eksisterende relation-indekser.

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

Personer må ikke dupliseres. `placeId` og `places[]` må peke til eksisterende places.

---

## 9. Wonderkammer progress

Wonderkammer er innholdstype/samling. I PlaceCard skal Wonderkammer-innhold primært ligge under `leksikon`-flowen, ikke som egen canonical runding.

Read-model:

```js
wonder: {
  [itemId]: {
    itemId,
    title,
    type,
    treasureScope,
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

Nye entries bør bruke Wonderkammer-standarden:

- faktisk ting først
- undring
- handling
- samling
- `actual_site_treasure` foran `category_object`

---

## 10. Route progress

Ruter har minst to spor:

- vanlige ruter: geografisk rekkefølge av steder
- historiske ruter: narrativ reise + fysisk samling

Read-model:

```js
routes: {
  [routeId]: {
    routeId,
    type,
    status,
    startedAt,
    completedAt,
    masteredAt,
    onlineStatus,
    physicalStatus,
    currentStopId,
    stopProgress: {},
    badgeIds: [],
    wonderItemIds: [],
    updatedAt
  }
}
```

Historiske ruter kan ha statuser:

- ikke startet
- påbegynt online
- fullført online
- delvis samlet fysisk
- fullført fysisk
- komplett historisk rute

Ruteprogresjon skal kunne oppdatere profil og eventuelt Wonderkammer.

---

## 11. Favorites

Favoritter bør være lesbare for Nearby og profil.

```js
favorites: {
  places: {},
  people: {},
  routes: {},
  categories: {}
}
```

Minimum v1:

- favoritt steder
- visning i Nearby
- visning i profil
- fjern favoritt

---

## 12. Category progress

Kategori-progresjon bør i stor grad være beregnet, ikke nødvendigvis permanent lagret.

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
    coursePercent,
    level,
    percent,
    updatedAt
  }
}
```

Må respektere fagarkitekturen:

```text
Merke → Fagkart/fagplan → Emner → Quiz/steder/observasjon → Learning log → Courses/pensum → UI
```

Emner er mikro-kunnskap. Quiz/observations er handling. Pensum/courses tolker erfaring til progresjon.

---

## 13. Home place

Offentlig hjemsted bør være del av player-read-model.

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
- Skal kunne brukes av Nearby, ruter, anbefalinger, profil, Social Meet og Spotmeeting.

---

## 14. Social Meet read-model

Social Meet må følge privacy-kontrakten.

```js
socialMeet: {
  publicProfilePreview: {},
  matches: {},
  invites: {},
  circles: {},
  blocks: {},
  reports: {}
}
```

Må aldri bruke:

- live location
- nearby people
- public visit history
- public activity feed
- followers/following
- free chat
- GPS-distance ranking

Social Meet-signaler skal være knowledge-based og forklarbare.

---

## 15. Spotmeeting read-model

Spotmeeting er del av Social Meet.

```js
spotmeetings: {
  [meetingId]: {
    meetingId,
    contextType,
    contextId,
    title,
    reason,
    sourceSurface,
    createdAt,
    status,
    presetMessageId,
    participantIds: [],
    visibility,
    updatedAt
  }
}
```

Tillatte context types:

- `place`
- `quiz`
- `route`
- `observation`
- `topic`
- `circle`

Gyldige statuser:

- `pending`
- `accepted`
- `completed`
- `declined`
- `cancelled`

---

## 16. Oppdateringsflyt ved quiz

Når en spiller fullfører quiz på et sted, bør read-model kunne se dette:

1. QuizEngine fullfører quiz.
2. `quiz_history` oppdateres.
3. Knowledge/trivia hooks kjøres.
4. `hg_learning_log_v1` får relevant event der implementert.
5. Badge/merit-regler evalueres.
6. People-unlocks evalueres der data finnes.
7. Wonderkammer/leksikon-unlocks evalueres der data finnes.
8. Ruteprogresjon evalueres der stedet er rutestopp.
9. Kategori-/course-progress beregnes.
10. `updateProfile` dispatches.
11. Nearby/NextUp får bedre anbefalingsgrunnlag.

---

## 17. Lokal først, backend senere

Progresjon skal fungere lokalt før backend er komplett.

Krav:

- tåle reload
- tåle offline der data er cachet
- kunne eksporteres/importeres der slik funksjon finnes
- kunne migreres til konto/sync senere

Backend skal støtte produktmodellen og eksisterende lagringskontrakter, ikke introdusere en konkurrerende progresjonssannhet.

---

## 18. Migrering

Alle endringer i faktisk lagringsformat må ha:

- versjonsnummer
- migreringsfunksjon
- fallback for gamle data
- dokumentert endring

Ikke endre localStorage-nøkler uten migrering.

---

## 19. Første implementerbare minimum

Progression Read Model v1 bør starte som leselag over eksisterende data:

- places
- quizzes
- badges/merits
- favorites
- routes
- people
- wonder
- categories/course summary
- homePlace

Social Meet og Spotmeeting kan leses inn etterpå, men må følge privacy-kontrakten.

---

## 20. Suksesskriterium

Etter Progression Read Model v1 skal dette være sant:

- PlaceCard viser riktig status.
- Profil viser riktig status.
- Wonderkammer/leksikon viser opplåste funn.
- Nearby anbefaler basert på faktisk progresjon.
- Ruter oppdateres når steder/stopp fullføres.
- Reload mister ikke progresjon.
- Backend kan kobles på uten å endre produktlogikken.
