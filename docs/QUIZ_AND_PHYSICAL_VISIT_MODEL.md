# History GO — quiz og fysisk besøksstatus

Status: **operational runtimeguide**  
Canonical ferdigmodell: [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md)  
Runtime: [`../js/quiz/quizAccess.ts`](../js/quiz/quizAccess.ts), [`../js/visits/physicalVisits.ts`](../js/visits/physicalVisits.ts) og [`../js/ui/placeVisitButton.ts`](../js/ui/placeVisitButton.ts)  
Regresjonstest: [`../tests/quiz-physical-visit-separation.test.js`](../tests/quiz-physical-visit-separation.test.js)  
Sist kontrollert: **2026-07-26**

Dette dokumentet beskriver den implementerte runtimegrensen mellom digital quiztilgang og fysisk besøksregistrering. Den brede produktbetydningen av fullført, besøkt, utforsket og mestret eies fortsatt av `COMPLETION_DEFINITIONS.md`.

## Autoritetsrekkefølge

1. [`COMPLETION_DEFINITIONS.md`](./COMPLETION_DEFINITIONS.md) — canonical produktmodell for ferdigtilstander på tvers av History GO.
2. [`../js/progress/placeProgress.ts`](../js/progress/placeProgress.ts) — smal place-progress-snapshotmodell.
3. [`../js/quiz/quizAccess.ts`](../js/quiz/quizAccess.ts) — digital quiztilgang uten fysisk besøkswrite.
4. [`../js/visits/physicalVisits.ts`](../js/visits/physicalVisits.ts) — fysisk visit service, legacy-persistensadapter og posisjonsgate.
5. [`../js/ui/placeVisitButton.ts`](../js/ui/placeVisitButton.ts) — PlaceCard-knappens tilstand og handling.
6. [`../js/ui/place-card-quizcards-patch.ts`](../js/ui/place-card-quizcards-patch.ts) — installasjon og kobling av delene i browser-runtime.
7. [`../tests/quiz-physical-visit-separation.test.js`](../tests/quiz-physical-visit-separation.test.js) — regressjonsbevis for at quiz ikke skriver fysisk besøksstatus.
8. Dette dokumentet — menneskelesbar runtimeguide.

Ved konflikt gjelder canonical ferdigmodell, kildekode og tester foran denne teksten.

## Implementert nå

### Digital quiz er uavhengig av fysisk besøk

Quiz-adapteren patcher `QuizEngine.init()` og gir motoren:

- en `getVisited()`-visning som svarer `true` for enhver place-nøkkel, slik at en eldre besøksgate ikke blokkerer digital quiz;
- en `saveVisitedFromQuiz()`-funksjon som returnerer `false` og ikke skriver til fysisk besøksdata.

Hvis `QuizEngine` installeres senere, patcher runtime setter-pathen når motoren blir tilgjengelig. Ved installasjon av besøksmodellen erstattes også `window.saveVisitedFromQuiz` med en deaktivert kompatibilitetsfunksjon som returnerer `false`.

Quizåpning eller quizfullføring er derfor ikke et fysisk besøk og skal ikke skrive til `window.visited` gjennom denne adapteren.

### Fysisk besøksservice

Før quiz-skriveveien deaktiveres, fanger integrasjonen den eksisterende legacy-funksjonen for fysisk besøkslagring. `window.HGPhysicalVisits` eksponerer:

- `isVisited(placeId)`
- `record(place)`
- `toProgress(placeId, input)`

`record(place)` normaliserer place-ID-en, er idempotent for et allerede registrert sted, kaller den fangede fysiske persistensfunksjonen og kontrollerer deretter at `window.visited[placeId]` faktisk er satt. Ved et nytt vellykket besøk sendes `hg:physicalVisitRegistered` med `placeId` og tidsstempel.

Servicen returnerer eksplisitte feil for manglende place-ID, utilgjengelig persistens eller mislykket persistens. Den oppretter ikke selv et nytt lagringsformat.

### Posisjonsgate

`getPhysicalVisitGate()` godkjenner besøk på to måter:

- `TEST_MODE` gir en eksplisitt utviklingsbypass;
- ellers kreves nåværende posisjon, `distMeters()` og minst ett mål fra `getPlaceDistanceTargets(place)`.

Hvert mål bruker egen radius eller stedets fallbackradius, som er 150 meter når ingen annen radius finnes. Resultatet skiller mellom manglende posisjon, manglende anker og for stor avstand.

### PlaceCard-knappen

PlaceCard-kontrolleren bruker den fysiske besøksservicen og gaten. Den viser blant annet:

- `Henter posisjon…`
- `Gå nærmere` eller gjenværende meter
- `Registrer besøk`
- `Registrer besøk (test)` i testmodus
- `Besøkt ✅` når stedet allerede er registrert

Ved godkjent registrering pulseres kartmarkøren dersom helperen finnes, og brukeren får en lokal bekreftelse. Knappen kan ikke brukes til å registrere besøk uten godkjent gate, bortsett fra testmodus.

### Smal place-progress read-model

`window.HGPlaceProgress.createSnapshot()` bygger en beregnet snapshot med statusene:

- `unopened`
- `opened`
- `visited`
- `quiz_completed`
- `explored`
- `mastered`

`explored` betyr i denne smale modellen både quiz fullført og fysisk besøkt. `mastered` krever i tillegg at kalleren sender `extraPlaceActionCompleted: true`.

Snapshoten lagrer ikke selv progresjon. Den leser input og fysisk besøksstatus og returnerer en beregnet tilstand.

## Ikke garantert eller tildelt av dette subsystemet

Denne runtimegrensen tildeler eller vedlikeholder ikke i seg selv:

- første eller siste besøksdato;
- besøksantall eller reiselogg;
- Groundhopper-progresjon;
- fysisk eller digital ruteprogresjon;
- observations eller learning-log-events;
- badges, stedsmerker, poeng eller meritpoeng;
- people-unlocks eller samlingsobjekter;
- varig lagring av `extraPlaceActionCompleted` eller `mastered`;
- quizresultat, quizhistorikk eller øvrige quizbelønninger.

Andre subsystemer kan lese legacy `visited`-store eller lytte til `hg:physicalVisitRegistered`. Slike downstream-effekter er ikke direkte atferd i denne modulen uten egen dokumentert runtime og test.

## Forholdet til canonical ferdigmodell

`COMPLETION_DEFINITIONS.md` eier den brede betydningen av stedshandlinger og ferdigtilstander. I denne besøksruntimeen betyr `visited` et fysisk registrert besøk gjennom fysisk gate og kompatibel fysisk persistens. Det betyr ikke bare at PlaceCard er åpnet eller at en quiz er fullført.

De seks statusene i `HGPlaceProgress` er en smal adapter/read-model. De erstatter ikke canonical statusoversikt med blant annet `discovered`, `checked_in`, `quiz_attempted`, `observed` og `completed`.

## Validering

```bash
npm run build:scripts
node dist/scripts/check-documentation-governance.mjs
node --test tests/quiz-physical-visit-separation.test.js
npm run typecheck:web
```

## Historisk snapshot

Pre-consolidation-dokumentet er bevart byte-identisk i:

```txt
reports/archive/2026-07/quiz-physical-visits/QUIZ_AND_PHYSICAL_VISIT_MODEL_PRE_CONSOLIDATION_2026-07-26.md
```

Snapshotet dokumenterer den tidligere brede målmodellen, men skal ikke brukes som bevis for at downstream-belønninger er implementert av quiz-/besøksmodulen.
