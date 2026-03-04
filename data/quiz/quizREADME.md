# QUIZ SYSTEM — README (History GO)

Dette dokumentet er **fasit** for quiz-/læring-/pensum-systemet slik det nå er bygget i History GO.
Ingen “normalisering” utover `trim()`. Domener = filnavn. Alt er **append-only** der det gir mening.

---

## 0) Hva vi bygger (kort)

**Quiz** er motoren som:
1) lar brukeren svare på flervalg,
2) lagrer “lært” innhold (kunnskap + funfacts),
3) produserer **learning log events** (hg_learning_log_v1) som blir brukt av:
   - emne-dekning (pensum/emner)
   - kurs-moduler / diplom
   - observasjoner (chips + valgfri tekst) som en videreføring av quiz-logikken

---

## 1) Filstruktur (relevant for quiz + læring)

### UI / sider
- `index.html` (app entry)
- `profile.html` (profil + progresjon)
- `emner_by_modul1.html` / `emner.html` (emner & pensum UI, hvis dere bruker den siden)
- `notater.html` (notatsystem – lever side om side med observations)

### Motorer / JS
- `js/QuizEngine.js` (quiz runtime: start/flow/resultat/historikk)
- `js/knowledge.js` (kunnskapspunkter + learning log helpers + emne-dekning v1/v2)
- `js/hgInsights.js` (begreper fra quiz / brukerprofil)
- `js/emnerLoader.js` (laster `emner_<subject>.json`)
- `js/emneDekning.js` (hvis dere har splittet dekningslogikken ut)
- `js/courses.js` (kursmoduler + compute + diplom)
- `js/observations.js` (**HGObservations**: chips + valgfri note → learning log)
- `js/popup-utils.js` (popups, reward popup, place/person popup, placeCard wiring)

### Data
- `data/quiz/quiz_<subject>.json` (quizitems)
- `data/emner/emner_<subject>.json` (emner/pensum-linjer, core_concepts)
- `data/pensum/pensum_<subject>.json` (kursmoduler)
- `data/observations/observations_<subject>.json` (observasjonslinser)
- (ev.) `data/tags.json`, `data/badges.json`, etc.

---

## 2) Nøkkeldata (JSON “contracts”)

### 2.1 QuizItem (minimum)
Quizdata er et array av objekter som minst bør ha:
- `id` (string) — unik
- `categoryId` (string) — domain/merke (f.eks. `"by"`)
- `personId` eller `placeId` (string) — hva quizen gjelder (valgfritt men nyttig)
- `question` (string)
- `options` (string[])
- `answer` (string)
- `dimension` (string) — brukes til kunnskapsunivers (category → dimension → items)
- `topic` (string)
- `knowledge` (string) — forklaring/innhold

**Viktig:** quiz kan også ha (anbefalt) koblinger til pensum:
- `core_concepts` (string[]) — begreper som går til HGInsights / learning log
- `related_emner` (string[]) — direkte “emne hits” (brukes av EmneDekningV2)
- `required_tags` / `tags` (string[]) — hvis dere bruker tags

### 2.2 Emne (emner_<subject>.json)
- `emne_id` (string)
- `subject_id` (string)
- `title` (string)
- `description` (string)
- `core_concepts` (string[])  ✅ kritisk for dekningsmotor
- (ev.) `dimensions`, `keywords`, `related_places`, `related_people`, etc.

### 2.3 Kursmodul (pensum_<subject>.json)
`pensum_<subject>.json` har:
- `subject_id`
- `label`
- `version`
- `modules`: array
  - `module_id`
  - `title`
  - `level`
  - `estimated_minutes`
  - `mål` (string[])
  - `emner` (string[]) — peker til `emne_id`
  - `konsepter` (string[]) — konsepter brukt i modulen
  - `required_tags` (string[]) — hvis dere bruker tag-regler i kursmotor
  - `anbefalte_steder` (string[]) / `anbefalte_personer` (string[])
  - `quiz_sett` (string[]) — grupper/ids dere vil knytte
  - `status` (pilot/active)

### 2.4 Observations lenses (observations_<subject>.json)
Eksempel dere bruker nå (riktig form):
- `schema` (number)
- `subject_id`
- `label`
- `lenses` (array)
  - `lens_id` (unik)
  - `title`
  - `prompt`
  - `type` (`multi_select` | `single_select`)
  - `options`: `{ id, label }[]`
  - valgfritt:
    - `allow_note` (bool)
    - `note_label` (string)
    - `note_max_len` (number)

---

## 3) LocalStorage (kilder og “single source”)

### 3.1 Quiz-historikk
- `quiz_history` → `Array`
  - minimum: `{ id, categoryId, ts, ... }`
  - brukes i popup-utils:
    - `hasCompletedQuiz(targetId)`
    - `getLastQuizCategoryId(targetId)`

### 3.2 Kunnskap (fra quiz)
- `knowledge_universe` → `Object`
  - Struktur:
    - `categoryId` → `dimension` → `[{ id, topic, text }]`
  - `id`-konvensjon (fra knowledge.js):
    - `quiz_<quizItem.id>` eller `quiz_<targetId>_<...>` avhengig av hvordan dere setter `entry.id`
  - Brukes i popup-utils:
    - `getInlineKnowledgeFor(categoryId, targetId)` (filtrerer på prefix)

### 3.3 Funfacts / trivia (fra quiz eller annen kilde)
- `trivia_universe` → `Object`
  - Struktur:
    - `categoryId` → `targetId` → `string[] | string`

### 3.4 Learning log (append-only)
- `hg_learning_log_v1` → `Array` (append-only events)
  - Quiz-events (hvis QuizEngine skriver det) + Observations-events (HGObservations)
  - Brukes av:
    - `getUserConceptsFromLearningLog()`
    - `getUserEmneHitsFromLearningLog()`
    - kursmotor (`HGCourses.compute`)
    - popups (for å vise observasjoner)

### 3.5 Andre (kontekst)
- `visited` / `merits` etc. (ikke del av quiz, men påvirker reward/UX)

---

## 4) Runtime API (hva som må finnes på window)

### 4.1 Quiz
- `window.QuizEngine.start(targetId)`
  - targetId = place.id eller person.id (det dere allerede gjør i PlaceCard)

### 4.2 Knowledge system (legacy + fortsatt brukt)
- `window.saveKnowledgeFromQuiz(quizItem, context?)`
- `window.computeEmneDekning(userConcepts, emner)` (v1)
- `window.computeEmneDekningV2(userConcepts, emner, { emneHits })` (v2)
- `window.getUserConceptsFromLearningLog()`
- `window.getUserEmneHitsFromLearningLog()`

### 4.3 Emner
- `window.Emner.loadForSubject(subjectId)` (fra emnerLoader.js)

### 4.4 Kurs
- `window.HGCourses.compute({ subjectId, emnerAll })`
  - returnerer typisk:
    - `course: { percent, done, total, modules: [...] }`
    - `diploma: { eligible, ... }`
    - `learning: { logCount, emneHitsCount, ... }`

### 4.5 Observasjoner
- `window.HGObservations.init({ showToast, dispatchProfileUpdate })`
- `window.HGObservations.start({ target, lensId })`
  - `target`:
    - `{ targetId, targetType:"place"|"person"|"generic", subject_id, categoryId?, title? }`

---

## 5) UI-integrasjon (hvor ting trigges)

### 5.1 PlaceCard (kortet nederst)
Knappene deres (eksempel):
- `pcQuiz` → `QuizEngine.start(place.id)`
- `pcNote` → notat (eksisterende)
- `pcObserve` → **observations** (chips + note)

**Trigger for observations (fasit):**
- I `openPlaceCard(place)`:
  - finn `btnObs = document.getElementById("pcObserve")`
  - `btnObs.onclick = () => HGObservations.start({ target:{...}, lensId:"by_brukere_hvem" })`

**Viktig:** lensId må matche `observations_by.json`:
- Dere bruker nå: `by_brukere_hvem`, `by_stemning`, `by_makt_ulikhet`
- Ikke bruk “lens_...” hvis JSON ikke har det.

### 5.2 Popups (Place/Person)
Popups brukes for:
- “Mer info”
- rask navigasjon mellom person ↔ sted
- inline “Kunnskap” + “Funfacts”
- inline “Observasjoner” (fra learning log)

Fasit-visning av observasjoner i popups:
- Les `hg_learning_log_v1`
- filtrer:
  - `type === "observation"`
  - `targetId === place.id/person.id`
  - `targetType === "place"/"person"`
- render liste (siste 10), vis:
  - `lens_id`
  - `selected[]` (id-ene)
  - `note` (valgfritt)
  - `ts` (dato)

### 5.3 Knowledge-siden (profil → “kunnskap”)
**Ikke bland observations inn i “knowledge_universe”.**
Observations er:
- situert (place/person)
- tidsstemplede events
- chips + note
Derfor hører de hjemme i:
- popups (sted/person)
- eventuelt egen “Observasjoner”-side/sekjson som leser learning log

Knowledge-siden skal holde seg til:
- “lært gjennom quiz”-tekster (knowledge_universe)
- emner/pensum-dekning (via concepts/emneHits)

---

## 6) Emner + Pensum + Kurs (hvordan de henger sammen)

### 6.1 Emne-dekning
Kilde til begreper:
1) `getUserConceptsFromLearningLog()` (foretrukket)
2) fallback: `HGInsights.getUserConcepts(userId)`

Kilde til “direkte emne hit”:
- `getUserEmneHitsFromLearningLog()` → `Set(emne_id)`

Dekningsberegning:
- `computeEmneDekningV2(concepts, emner, { emneHits })`
  - hvis `directHit`: match = total (100%)
  - ellers match på `core_concepts`

### 6.2 Kursmoduler (pensum_<subject>.json)
Kursmotoren (`HGCourses.compute`) bruker typisk:
- modulen sine `emner[]` (kobling til emne_id)
- modulen sine `konsepter[]` / rules
- learning log (quiz + observations) for progresjon

**Viktig praksis:**
- `required_tags` kan brukes som “kvalifikatorer” hvis dere faktisk bruker tags i compute-reglene.
- Hvis dere ikke bruker tags i compute: la feltet være med (framtid) men ikke gjør det til hard requirement i UI.

---

## 7) Reward-flow (popup-problemet dere ser)

Symptom dere beskriver:
- etter quiz kommer **to** popups:
  1) en reward popup som blinker/er veldig rask
  2) så kommer place/person popup

Årsak (typisk):
- `makePopup()` kalles to ganger etter hverandre i samme flow.
  - eksempel: `showRewardPlace()` → `makePopup(...)`
  - så kalles `showPlacePopup()` rett etter → `makePopup(...)` lukker reward med en gang

**Fasit UX (enkelt):**
- Kun **én** popup vises av gangen.
- Reward popup skal være “first class”, og brukeren trykker **Fortsett**.
- På “Fortsett” velger dere enten:
  - lukke popup (ferdig), eller
  - åpne place/person popup (sekundær)

**Teknisk fasit (uten å gjøre det komplisert):**
- Reward popup skal **ikke** trigge en ny popup automatisk før brukeren klikker.
- Hvis dere vil gå videre til place/person popup: bind det på knappen (onclick) etter `makePopup()` er laget.

(Dette er grunnen til at “makePopup(`...`, 'reward-popup')” i seg selv er riktig — det er bare “vis popup”. Hvis en annen funksjon kaller makePopup rett etterpå, overskrives den.)

---

## 8) Arbeidsoppgaver “hvor er vi nå” (status)

### Ferdig
- Observations-system:
  - `HGObservations` (modal + chips + valgfri tekst) → `hg_learning_log_v1`
  - trigger via PlaceCard-knapp (pcObserve)
  - visning i place/person popups (les fra learning log)
- By pensum-moduler:
  - modul 1 og modul 2 definert i `pensum_by.json` (kursmoduler)
  - emner koblet via `emner[]`
  - dekningsmotor klar via `computeEmneDekningV2`

### Neste (der vi stoppet ved “minioppdrag”)
Minioppdrag skal behandles som en quiz-lignende videreføring:
- “chips + valgfri tekst” = observations (allerede bygget)
- dermed:
  - minioppdrag kan flyttes til observations-linser (per modul / per emne)
  - eller beholdes i pensum JSON, men UI trigger HGObservations med riktig lens_id

**Konklusjon:** minioppdrag er ikke “teit” hvis det blir gjort som:
- flervalgschips + valgfri note
- lagres som learning log event
- vises under stedet/personen og kan telle i modulprogress

---

## 9) Regler (ikke bryt dette)

- Ingen normalisering utover `trim()` (ikke lowercasing av ids i data, kun i sammenligning der nødvendig).
- Domener = filnavn (by = by-filer, historie = historie-filer, osv.).
- Learning log er append-only (ikke muter historikk).
- Observations ligger i learning log, ikke i knowledge_universe.
- Reward popup må ikke “overskrives” av annen popup i samme tick.

---

## 10) Minimal sjekkliste (når noe ikke vises)

1) Er `js/observations.js` lastet i riktig HTML?
2) Finnes `data/observations/observations_by.json` på riktig path?
3) Matcher `lensId` i koden `lens_id` i JSON?
4) Skrives events faktisk til `hg_learning_log_v1`? (sjekk localStorage)
5) Leser popup-utils riktig targetId/targetType?
6) Ved dobbel popup: søk etter to kall til `makePopup()` i quiz-flowen rett etter hverandre.

---

SLUTT.


2

Her er en ansvars-matrise som binder sammen History Go + Learning + Knowledge + AHA + Civication. Den er skrevet slik at du kan lime den rett inn i arbeidsdokumentet.

⸻

Ansvars-matrise (modul → leser → skriver → events)

1) Quiz (legacy og set)

Modul: quizzes.js
Leser: quiz-data (manifest + filer), PEOPLE/PLACES
Skriver:
	•	legacy: quiz_history + merits_by_category (som før)
	•	set: hg_quiz_sets_v1 (set progress)
	•	set: KnowledgeLearning.setUnderstood(emne_id) kun via emne_ids på riktige svar
Events:
	•	alltid etter progresjon: updateProfile

Regel: Legacy-quiz skal ikke trigge learning-state. Set-quiz gjør det.

⸻

2) PlaceCard / åpne sted

Modul: place-card.js (openPlaceCard(place))
Leser: place.emne_ids
Skriver: KnowledgeLearning.setSeen(emne_id) for hvert emne_id
Events: (valgfritt men anbefalt) learning:updated via HG_LearningEvents.markSeen

Regel: seen trigges kun ved faktisk åpning av placeCard (ikke radius, ikke nearby).

⸻

3) KnowledgeLearningState (epistemisk status)

Modul: knowledgeLearningState.js
Leser: hg_learning_v1
Skriver: hg_learning_v1
API: getState/getLearning/setSeen/setUnderstood/setApplied/reset
Events: ingen (state skal ikke være “motor”)

Regel: dette er “status”, ikke analyse.

⸻

4) LearningEvents (bro og dispatch)

Modul: learningEvents.js
Leser: input emne_id
Skriver: kaller KnowledgeLearning.*
Events: learning:updated

Regel: UI og spillmotorer kaller HG_LearningEvents.* når mulig. Direkte kall til KnowledgeLearning.* kun der det er enklest.

⸻

5) Knowledge (tekstlig innhold)

Modul: knowledge.js
Leser: quiz resultater / items (per riktig svar)
Skriver: knowledge_universe + hg_learning_log_v1 (courses/emnedekning)
Events: updateProfile (når det legges til knowledge/trivia)

Regel: Knowledge = “hva du har lest/låst opp”, ikke seen/understood/applied.

⸻

6) KnowledgeComponent (render + emner)

Modul: knowledge_component.js
Leser: emner via DataHub.loadEmner(categoryId) + knowledge_universe
Skriver: DOM (render)
Events: ingen (kun UI)

Regel: kan vise learning-status (seen/understood/applied) ved å lese KnowledgeLearning.getLearning(emne_id).

⸻

7) Emnedekning + Courses

Modul: emneDekning.js + courses.js (og compute i knowledge.js)
Leser: hg_learning_log_v1 + emne-definisjoner (core_concepts, key_terms)
Skriver: normalt ingen permanent storage (beregning), evt course-progress hvis dere har det
Events: valgfritt learning:updated eller updateProfile ved UI refresh

Regel: dette er analyse/kuratering. Ikke epistemisk status.

⸻

8) HGUnlocks (samling/unlocks)

Modul: hg_unlocks.js
Leser: quiz items + targetId/placeId/personId
Skriver: hg_unlocks_v1
Events: hg:unlocks

Regel: unlocks er samlingslogikk, ikke læringsstatus.

⸻

9) Trivia

Modul: trivia.js
Leser: trivia payload fra quiz/innhold
Skriver: trivia_universe
Events: updateProfile

Regel: trivia er “minne/glede”, ikke emneprogress.

⸻

10) HGInsights (core concepts log)

Modul: hgInsights.js
Leser: quizItem.core_concepts (kun riktige svar)
Skriver: hg_insights_events_v1
Events: (valgfritt) learning:updated

Regel: Insights = begrepsspor (events), ikke seen/understood/applied.

⸻

11) AHA InsightsChamber

Modul: insightsChamber.js
Leser: AHA signals + ev. KnowledgeLearning.getLearning(emne_id) for statusvisning
Skriver: AHA-insights storage (intern)
Events: AHA-egne

Regel: AHA kan tagge emner, men skal ikke automatisk sette understood/applied uten eksplisitt brukerhandling.

⸻

12) AHA EmneMatcher

Modul: ahaEmneMatcher.js
Leser: emne-definisjoner (keywords/core_concepts)
Skriver: forslag / match-resultat (ingen permanent state)
Events: ingen

Regel: tagging/hjelp, ikke “læringsbevis”.

⸻

13) Civication

Moduler: civicationEventEngine.js, conflictLoader.js, packs
Leser: KnowledgeLearning.getLearning(emne_id) for gating og “applied”
Skriver: ved løst konflikt/quest: KnowledgeLearning.setApplied(emne_id) (helst via HG_LearningEvents.markApplied)
Events: updateProfile, ev. civi:*

Regel: Civication = anvendelse. Applied kommer herfra.

⸻

Globale regler (for disiplin)
	1.	Evidens skriver LearningState

	•	place opened → seen
	•	set quiz correct → understood
	•	conflict resolved → applied

	2.	Analyse skriver ikke LearningState automatisk
emnedekning/courses kan foreslå, men ikke sette.
	3.	AHA tagger, men setter ikke
AHA kan vise status og foreslå neste steg. “Markér som forstått” må være eksplisitt.
	4.	UpdateProfile kun når progresjon endrer UI
Når set completion, unlocks, trivia/knowledge, civication konsekvens.

⸻

Hvis du vil, kan vi nå bruke matrisen til å definere én konkret “kontrakt” for quiz-set-formatet (felt som type/funfact/epoch/lifestyle/emne_ids) slik at både Knowledge, Trivia, AHA-tagging og LearningState kan bruke samme quiz-objekt uten ekstra spesialkoding.


Du har helt rett. Hvis systemet bare bruker én spørsmålsstruktur, vil quizene bli monotone. Løsningen er å definere spørsmålstyper (question archetypes) og la hvert set bruke en blanding av dem. Da trekker systemet fra ulike felt: fakta, trivia, emne, epoke, år, konsepter, osv.

Nedenfor er en konkret modell som passer direkte med feltene i supersetQUIZMAL.

⸻

1. Definer faste spørsmåls-typer

Lag en liten katalog med 10–12 archetypes. Hver type bruker forskjellige felt.

A. Faktaspørsmål

Bruker:

personId / placeId
year
knowledge

Eksempel

Hvilken rolle hadde Carl Berner i 1905?

⸻

B. Stedsspørsmål

Bruker:

placeId
emne_id
knowledge

Eksempel

Hva illustrerer Torggata tydelig i byutvikling?

⸻

C. År-spørsmål

Bruker:

year
epoke_id

Eksempel

Hvilket år markerer denne fasen i Oslos modernisering?

⸻

D. Begrepsspørsmål

Bruker:

core_concepts
concept_focus

Eksempel

Hva betyr “knutepunkt” i bygeografi?

⸻

E. Mekanisme-spørsmål

Bruker:

emne_id
core_concepts

Eksempel

Hva er en vanlig effekt av økt mobilitet i en by?

⸻

F. Epoque-spørsmål

Bruker:

epoke_id
knowledge

Eksempel

Hvilken epoke i byutviklingen representerer Ring 3?

⸻

G. Sammenligning

Bruker:

related_emner

Eksempel

Hva skiller et offentlig møteplassrom fra et kommersielt byrom?

⸻

H. Case-spørsmål

Bruker:

placeId
core_concepts

Eksempel

Hvilket sted i Oslo illustrerer tydelig et urbant knutepunkt?

⸻

I. Trivia / funfact

Bruker:

trivia
knowledge

Eksempel

Hvilket uventet faktum gjelder Carl Berners plass?

⸻

J. Analyse

Bruker:

emne_id
core_concepts
epoke_id

Eksempel

Hvorfor oppstår flaskehalser i bytrafikk?

⸻

2. Hvert set bør ha en miks

Dette hindrer monotoni.

Set 1 – Introduksjon

2 fakta
1 sted
1 trivia
1 begrep


⸻

Set 2 – Forståelse

1 fakta
1 epoke
1 mekanisme
1 case
1 begrep


⸻

Set 3 – Analyse

1 fakta
2 mekanisme
1 analyse
1 sammenligning


⸻

3. Distractors (feilalternativer)

For å gjøre quizene mer varierte, trekk feilalternativer fra:

andre emner i samme kategori
andre core_concepts
andre steder
andre epoker

Eksempel:

Spørsmål om mobilitet:

riktig:
knutepunkt

distractors:

gentrifisering
symbolsk makt
territorialitet


⸻

4. Dette gjør quizene forskjellige

Selv om temaet er det samme (f.eks. Carl Berner), kan spørsmålene variere:

fakta
sted
epoke
begrep
analyse

Dermed føles hvert set nytt.

⸻

5. Fordelen for appen

Systemet kan lage:
	•	kart-quiz
	•	tematiske quiz
	•	epoke-quiz
	•	person-quiz
	•	analyse-quiz

fra samme database.

⸻

6. Praktisk regel

Når vi lager nye quiz:

hver quiz må bruke minst ett av:
year
emne
concept
epoke
trivia

Da blir de ikke like.

⸻

7. Viktig designvalg

SupersetQUIZMAL bør derfor ha ett ekstra felt:

question_type

Eksempel:

"question_type": "concept"

mulige typer:

fact
place
year
concept
mechanism
epoque
comparison
case
trivia
analysis

Dette gjør at systemet kan balansere spørsmålene automatisk.

⸻

Hvis du vil, kan jeg også vise deg noe som er ganske viktig før vi lager alle quizene:

Du har faktisk allerede nok steder og emner til å lage et quizsystem som kan generere ca. 1500–2000 forskjellige spørsmål, men bare hvis vi organiserer emnekartet riktig først.
