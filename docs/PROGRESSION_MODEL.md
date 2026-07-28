# History GO — progresjonsmodell

Status: **canonical read-model / adaptermodell**  
Eier: `history_go_progress_read_model`  
Sist kontrollert: **2026-07-28**

Dette dokumentet beskriver hvordan History GO skal **lese progresjon på tvers av eksisterende lagring**. Det skal ikke opprette en ny parallell sannhetskilde.

Leses sammen med:

- `docs/COMPLETION_DEFINITIONS.md`
- `docs/HISTORY_GO_PRODUCT_MAP.md`
- `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md`
- `docs/PROFILE_PROGRESS_READER_RUNTIME.md`
- `docs/DATA_PRODUCTION_CONTRACT.md`

## 1. Prinsipp: adapter først, ny lagring sist

History GO har allerede flere aktive state-kilder:

- `visited_places` — fysisk besøkte steder;
- `places_collected` — quiz-/target-unlocked places;
- `people_collected` — People-samling der eksisterende runtime bruker den;
- `quiz_history` — quizforsøk/resultater;
- `knowledge_universe`;
- `trivia_universe`;
- `hg_learning_log_v1`;
- badges/merits;
- route-state;
- favoritter;
- profil-/read-model-adaptere.

Regel:

> Ikke flytt eksisterende state til en ny nøkkel bare for å gjøre modellen penere. Første steg er alltid å lese og normalisere eksisterende state.

## 2. Ikke bruk én statusstige for alt

Stedprogresjon består av flere uavhengige akser.

En read-model bør derfor heller uttrykke:

```js
places: {
  [placeId]: {
    placeId,
    category,
    opened: false,
    physicalVisited: false,
    quizAttempted: false,
    quizCompleted: false,
    quizCollected: false,
    collected: false,
    observed: false,
    favorite: false,
    routeIds: [],
    badgeIds: [],
    updatedAt
  }
}
```

Ikke la `collected` bety fysisk besøkt, og ikke la `visited` bety quizfullført.

## 3. Place collection

Implementert profilsamling skiller mellom to kilder:

```text
visited_places    = fysisk besøkte steder
places_collected  = quiz-/target-unlocked places
```

Profilens samlede place-liste er unionen:

```text
collected places = visited_places ∪ places_collected
```

Read-model bør bevare kilden, for eksempel:

```js
{
  physicalVisited: true,
  quizCollected: false,
  collected: true,
  collectionSources: ["visit"]
}
```

eller:

```js
{
  physicalVisited: false,
  quizCollected: true,
  collected: true,
  collectionSources: ["quiz"]
}
```

Quiz skal aldri skrive `visited_places`.

## 4. Fysisk visit

Fysisk visit eies av visit-runtime og `docs/QUIZ_AND_PHYSICAL_VISIT_MODEL.md`.

Read-model kan lese fysisk besøksstatus, men skal ikke rekonstruere eller gjette den fra:

- quiz;
- åpnet PlaceCard;
- collected-state;
- ruteprogresjon;
- favoritt.

## 5. Quiz progress

Quizprogress leses fra eksisterende quizmotor og `quiz_history`.

En normalisert read-model kan uttrykke:

```js
quizzes: {
  [quizId]: {
    quizId,
    targetType,
    targetId,
    attempts,
    bestScore,
    lastScore,
    attempted,
    completed,
    perfect,
    relatedEmner: [],
    updatedAt
  }
}
```

Quiz kan utløse eksisterende Knowledge/trivia/learning-log/badge/unlock-hooks. Når et place-target faktisk låses opp, kan runtime skrive `places_collected`.

Produksjon av quiz eies av `data/quiz/regler/QUIZ_PRODUCTION_CANONICAL.md`.

## 6. Learning progress

Learning progress er ikke det samme som Knowledge.

Eksisterende skille:

- `knowledge_universe` = tekstlig kunnskapsinnhold;
- `trivia_universe` = trivia/mikrobelønninger;
- `hg_learning_log_v1` = append-only læringshendelser;
- courses/pensum = beregnet progresjon fra emner/logg der implementert.

Learning log skal ikke muteres for å rette visning. UI skal bruke en bedre read-model.

## 7. Badges / merits

Badge-/meritstatus skal leses fra eksisterende badge-/meritsystemer.

Read-model må respektere:

- `category` som stedets primære canonical kategori;
- `underbadge_ids` som canonical underbadges;
- eksisterende badgefiler og faktisk runtime;
- ingen globale Bronse/Sølv/Gull-regler som ikke er implementert.

## 8. People progress

People-data og People-progress er forskjellige lag.

En read-model kan uttrykke eksisterende spillerstatus som:

```js
people: {
  [personId]: {
    personId,
    discovered: false,
    unlocked: false,
    collected: false,
    completed: false,
    sourcePlaceIds: [],
    sourceRouteIds: [],
    updatedAt
  }
}
```

Ikke generer People-progress bare fordi personen finnes i en PlaceCard-runding.

## 9. Objects, Details, Spots, Works, Nature og Brands

Disse er canonical innholdstyper, men det finnes ikke automatisk én felles spillerpersistens for alle.

Read-model kan senere aggregere unlocks/samling når faktisk runtime finnes, men skal ikke opprette generiske `object_collected`- eller tilsvarende sannhetskilder uten eksplisitt implementasjon og migreringsplan.

Civication-state holdes separat fra History GO-progresjon.

## 10. Wonderkammer

Wonderkammer er legacy og skal **ikke** ha en egen ny `wonder`-gren i canonical progresjonsmodellen.

Fjern/ikke innfør nye felter som:

```text
wonder
wonderItemIds
unlockedWonderItems
wonderItemCount
```

for ny stedproduksjon.

Legacy Wonderkammer-data migreres til de systemene innholdet faktisk tilhører.

## 11. Ruter

Route progress leses fra den enkelte rutemotorens state.

Historiske ruter skiller online og fysisk spor. Dagens runtime garanterer ikke GPS-basert fysisk rutesamling bare fordi `physical.enabled` finnes i data.

Se `docs/README_HistoryGo_Historiske_Ruter.md`.

## 12. Favoritter

Favoritt er en egen akse og skal være lesbar av relevante flater.

```js
favorites: {
  places: {},
  people: {},
  routes: {},
  categories: {}
}
```

Favoritt skal ikke påvirke besøksstatus eller completion uten en eksplisitt regel.

## 13. Category / fag-progresjon

Kategori- og fagprogresjon bør i hovedsak beregnes fra eksisterende kilder, ikke kopieres til nye ad-hoc felt.

Relevant kjede:

```text
Merke / kategori
→ fagområde og emner
→ quiz / steder / observasjon
→ learning log / eksisterende state
→ beregnet progresjon
→ UI
```

Navigasjonsrollene mellom Merket og Faget eies av `docs/FAGVERK_NAVIGATION.md`.

## 14. Home place

Offentlig hjemsted er en spillerpreferanse/read-model-kobling og skal alltid peke til et eksisterende History GO-sted, aldri privat adresse.

Det kan brukes av Nearby, ruter, anbefalinger, profil og privacy-sikre sosiale flater.

## 15. Social Meet / Spotmeeting

Sosial state holdes adskilt fra place-visits og offentlig progresjon.

Social Meet/Spotmeeting skal ikke gjøre live location, besøkslogg eller GPS-distance offentlig.

Se deres egne privacy-/runtimekontrakter.

## 16. Profiloppdatering

Når eksisterende progresjonsendrende runtime krever det, skal `updateProfile` dispatches slik at profil/read-model kan oppdatere seg.

En write er ikke ferdig integrert hvis:

1. state lagres;
2. men relevant profil/read-model ikke kan lese endringen.

## 17. Forslag til samlet read-model

Hvis en samlet read-model materialiseres, skal den være beregnet og kildesporbar:

```js
history_go_progress_read_model_v1 = {
  version: 1,
  updatedAt,
  sources: {},
  places: {},
  quizzes: {},
  learning: {},
  badges: {},
  people: {},
  routes: {},
  favorites: {},
  categories: {},
  homePlace: {},
  socialMeet: {},
  spotmeetings: {}
}
```

Hvert felt skal kunne forklares med hvilken eksisterende state-kilde som bærer sannheten.

## 18. Autoritetsregel

Ved konflikt gjelder:

1. faktisk persistens/runtime og tester;
2. subsystemets canonical runtimekontrakt;
3. `COMPLETION_DEFINITIONS.md` for begrepsbetydning;
4. denne read-model-kontrakten;
5. eldre roadmap-/arkivmateriale.

Dette dokumentet beskriver hvordan vi leser state sammen. Det skal aldri brukes som argument for å hevde at planlagte write-paths eller unlocks allerede finnes.