# 🧭 HISTORY GO — SYSTEM MAP (nyeste)
Dette dokumentet er fasit for **hva som skjer**, **hvordan det skjer**, og **hvorfor** – på tvers av History GO + AHA.

---

## 1) Entry points (sider) og hva de eier

### `index.html` (Hovedapp)
**Eier:** kart, utforsk, placeCard, quiz-start, unlock, ruter, person/sted-popups, samtale + notat-triggere.  
**Runtime-kjerne:** `js/app.js` orkestrerer og kobler moduler.

### `profile.html` (Profil)
**Eier:** profil-statistikk, merker/badges + modal, people-grid, visited-grid, timeline, “Siste kunnskap/funfacts”, og AHA-knapp.  
Kjører typisk: `js/knowledge.js`, `js/trivia.js`, `js/profile.js` (+ popup/utils).

### `knowledge.html` (Kunnskapsbibliotek)
**Eier:** lesing/oversikt over all lagret knowledge (fra `knowledge_universe`) + emne/coverage-visning der det er aktivt.

### `notater.html` (Notatbok)
**Eier:** render av alle notater fra `hg_user_notes_v1`.  
**Viktig:** siden fetcher `people.json` og `places.json` direkte (ikke via DataHub).

### `emner.html` (Emner / pensum)
**Eier:** emne-dekning per fagfelt basert på brukerens begreper (fra HGInsights) + emner fra EmnerLoader + `computeEmneDekning`.

### `AHA/index.html` (AHA)
**Eier:** import av HG-data (leser `aha_import_payload_v1`) og visning av innsiktskammer / chat + meta.

---

## 2) Moduloversikt (ansvar og “hvorfor”)

### `js/app.js` — Orchestrator (nåværende “core”)
**Hva:** init, event-binding, progresjon, localStorage-kontrakter, samtale/notat-handlers, og eksportbuffer til AHA.  
**Hvorfor:** ett sted å forstå “hva skjer når brukeren gjør X”.

### `js/dataHub.js` — Datasentral
**Hva:** laster JSON innen scope, bygger cache, “enriched” datasett og loader pakker (quiz-kategorier, overlays, emner/fagkart der det er i bruk).  
**Hvorfor:** team-sikkert: færre fetch-spredninger og mer deterministisk dataflyt.

### `js/map.js` — HGMap (MapLibre)
**Hva:** init kart, marker-lag, visited-state, click-callbacks (kaller tilbake til app/UI), og `refreshMarkers`.  
**Hvorfor:** kartlogikk isolert fra progresjon.

### `js/quizzes.js` — QuizEngine
**Hva:** starter quiz for targetId (place/person), bruker manifest for å finne riktige quizfiler, gating (krever state), og sender rewards via hooks.  
**Hvorfor:** quiz er “motoren” som produserer progresjon + knowledge/trivia + insights.  
**Designregel:** knowledge/trivia belønnes på **riktige svar** via hooks.

### `js/knowledge.js` — Knowledge universe + AHA-sync
**Hva:** lagrer/leser `knowledge_universe`, tilbyr `saveKnowledgeFromQuiz`, og trigger UI-sync via `updateProfile`.  
**Hvorfor:** knowledge er varig, gjenbrukbart “innholdslag” som vokser av learning events.

### `js/trivia.js` — Trivia universe + AHA-sync
**Hva:** lagrer/leser `trivia_universe`, og trigger UI-sync via `updateProfile`.  
**Hvorfor:** trivia er mikro-belønning/mikrolæring (holder flyt).

### `js/popup-utils.js` — UI/Popups + placeCard
**Hva:** `showPersonPopup`, `showPlacePopup`, `openPlaceCard` + reward-popups. Leser inline knowledge/trivia fra localStorage, men **viser det kun hvis quiz er fullført**.  
**Hvorfor:** “læring låser opp innhold” (først quiz → så kunnskap/funfacts).

### `js/hgInsights.js` — Begrepsspor (quiz_correct → concepts)
**Hva:** logger events i `hg_insights_events_v1`. Kun `core_concepts` teller; `topic` er ikke fallback.  
**Hvorfor:** gir robust begrepsgrunnlag for emner/pensum og AHA-profil.

### `js/hgConceptIndex.js` — Konseptindeks
**Hva:** indeks/struktur som lar deg mappe begreper videre (brukes av innsiktslaget/AHA).  
**Hvorfor:** gjør begreper navigerbare (ikke bare en logg).

### `js/routes.js` — Ruter
**Hva:** rutevisning/aktivering (“show route to …”), koblet til kart og placeCard flow.  
**Hvorfor:** ruter er egen oppdagelsesmodus (tematisk guiding).

### `js/profile.js` — Profilmotor
**Hva:** bygger profil-UI (stats, merits, personer, steder, tidslinje), leser knowledge/trivia “latest”, og eksponerer AHA-knappen fra profilen.  
**Hvorfor:** profil er “sannhetens speil”: render av lagret progresjon.

### `AHA/ahaChat.js` + `AHA/insightsChamber.js` (+ meta)
**Hva:** AHA-import + lagring/visning av kammer (insikter, topics, stats) og chat + meta-analyse.  
**Hvorfor:** HG produserer erfaring; AHA produserer abstraksjon og “meta”.

---

## 3) Runtime: hva som skjer (detaljert flyt)

### 3.1 Oppstart (uten core.js)
1) `index.html` laster moduler (app er hovedstart).
2) `app.js` initierer systemet (leser data/progresjon, binder UI-events).
3) `DataHub` brukes for lasting/caching av data.
4) `HGMap.initMap(...)` opprettes og får `setPlaces` + `setVisited`.
5) `QuizEngine.init(...)` settes opp med hooks (knowledge/trivia/insights/rewards).

**Hvorfor:** deterministisk “data først → UI etterpå”.

---

### 3.2 Utforsk → placeCard → quiz
- Bruker trykker et sted (kart/panel) → `openPlaceCard(place)` rendrer kort + knapper.
- Klikk “Ta quiz” → `QuizEngine.start(place.id)`.
- QuizEngine bruker `data/quiz/manifest.json` / kategori-loading for å hente riktig quizinnhold.

**Hvorfor:** quizer er modulære per fagfelt og kan caches/offline.

---

### 3.3 Riktig svar → belønning → knowledge/trivia → innsikt
Ved riktig svar:
- `HGInsights.logCorrectQuizAnswer(userId, quizItem)` logger begreper (kun `core_concepts`).
- `saveKnowledgeFromQuiz(...)` legger inn kunnskap i `knowledge_universe`.
- trivia legges inn i `trivia_universe`.
- UI sync: `window.dispatchEvent(new Event("updateProfile"))`.

**Hvorfor:** stabilt læringsspor (insights) + varig innhold (knowledge) + “spark” (trivia).

---

### 3.4 Visning av knowledge/trivia (låst bak fullført quiz)
Popups/PlaceCard viser inline knowledge/trivia kun hvis quiz er fullført (gating).  
Matcher items på id-prefix: `quiz_<targetId>_...` i `knowledge_universe`.

**Hvorfor:** “læring først, innhold etterpå”.

---

### 3.5 Samtale + notater (HG → AHA)
I person-popup finnes knapper:
- `data-chat-person="<person.id>"`
- `data-note-person="<person.id>"`

`app.js` håndterer lagring til:
- `hg_person_dialogs_v1`
- `hg_user_notes_v1`
og oppdaterer AHA-importbuffer (`aha_import_payload_v1`).

**Hvorfor:** chat/notater er tekstlig materiale AHA kan gjøre til innsikt.

---

### 3.6 Profil (leser state og rendrer)
`profile.html` rendrer fra localStorage via `profile.js`.  
Viser også “Siste kunnskap” og “Siste funfacts”.

---

### 3.7 Emner/pensum (HGInsights → computeEmneDekning)
`emner.html`:
- henter user concepts via `HGInsights.getUserConcepts(userId)`
- laster emner via Emner-loader
- beregner dekning med `computeEmneDekning(concepts, emner)`

**Hvorfor:** “hva du har lært” knyttes til pensumlinjer (målbar progresjon).

---

### 3.8 Offline-first
Service worker cacher:
- sider (index/profile/knowledge/notater)
- CSS/JS
- data (places/people/tags/badges/routes + quiz-manifest og quiz-filer)
Strategi: **network-first for HTML**, **cache-first for statics**.

**Hvorfor:** iPad + bybruk krever robust offline og rask last.

---

## 4) State-kontrakt (localStorage keys)

**Progresjon/kjerne:**
- `visited` / `visited_places` (avhenger av struktur i app)
- `merits_by_category`
- `quiz_progress` og/eller `quiz_history` (popup-utils sjekker `quiz_history`)

**Knowledge/Trivia:**
- `knowledge_universe`
- `trivia_universe`

**Innsikt/begrep:**
- `hg_insights_events_v1`

**Samtaler og notater:**
- `hg_person_dialogs_v1`
- `hg_user_notes_v1`

**AHA bro:**
- `aha_import_payload_v1` (HG skriver; AHA leser ved import)

---

## 5) Team-regler (for å unngå rot)
1) Ikke endre localStorage-keys uten migrering + oppdatert SYSTEM_MAP.
2) Ikke bypass QuizEngine-hooks: rewards/knowledge/trivia/insights må trigges samme sted.
3) DataHub er datasentral; unngå direkte fetch i nye sider (notater.html er dokumentert unntak).
4) Popup-utils gating (“vis kun etter fullført quiz”) er en designregel.
5) Service worker: endringer i filnavn krever oppdatering av cache-liste og cache-versjon.

---

# 🔌 API INDEX (STRICT) — Public exports (History GO + AHA)
Dette er **ikke** en liste over alle interne funksjoner.
Dette er kun det som faktisk eksponeres globalt (public surface).

---

## History GO

### js/app.js
Eksporterer globals:
- `window.__HG_LAST_ERROR__`
- `window.HG_ENV` (objekt)
  - `HG_ENV.geo` settes til `"unknown" | "granted" | "blocked"`
- `window.userLat`
- `window.userLon`
- `window.MAP`
- `window.START`

Eksporterer funksjon:
- `window.pulseMarker(id)`

---

### js/dataHub.js
Eksporterer:
- `window.DataHub` (objekt)

Public metoder/properties på `DataHub`:
- `fetchJSON`
- `clearCache`
- `loadTags`
- `loadPlacesBase`
- `loadPeopleBase`
- `loadBadges`
- `loadRoutes`
- `loadPlaceOverlays`
- `loadPeopleOverlays`
- `getPlaceEnriched`
- `getPersonEnriched`
- `loadEnrichedAll`
- `loadEmner`
- `loadFagkart`
- `loadFagkartMap`
- `loadQuizCategory`
- `normalizeTags`
- `mergeDeep`
- `indexBy`
- `APP_BASE_PATH`
- `DEFAULTS`

---

### js/map.js
Eksporterer globals:
- window.HG_POS (autorativ posisjon: {status, lat, lon, ts})
- window.HGMap  (kart / markører)

Kompat (legacy, kan fases ut):
- window.userLat
- window.userLon
- window.currentPos

Public metoder på `HGMap`:
- `initMap`
- `getMap`
- `resize`
- `setDataReady`
- `setPlaces`
- `setVisited`
- `setCatColor`
- `setOnPlaceClick`
- `setUser`
- `maybeDrawMarkers`
- `refreshMarkers`

---

### js/routes.js
Eksporterer globals:
- `window.ROUTES`
- `window.loadRoutes`
- `window.openRoutesSheet`
- `window.showRouteOverlay`
- `window.closeRouteOverlay`
- `window.focusRouteOnMap`
- `window.clearThematicRoute`
- `window.computeNearestStop`
- `window.getNearbyRoutesSorted`
- `window.showRouteToPlace`

---

### js/quizzes.js
Eksporterer:
- `window.QuizEngine` (objekt)

Public metoder på `QuizEngine`:
- `init`
- `start`

---

### js/popup-utils.js
Eksporterer globals (funksjoner):
- `window.showPersonPopup`
- `window.showPlacePopup`
- `window.openPlaceCard`
- `window.openPlaceCardByPerson`
- `window.showRewardPlace`
- `window.showRewardPerson`

---

### js/knowledge.js
Eksporterer globals (funksjoner):
- `window.syncHistoryGoToAHA`
- `window.saveKnowledgeFromQuiz`
- `window.computeEmneDekning`

---

### js/trivia.js
Eksporterer globals (funksjon):
- `window.syncHistoryGoToAHA`

---

### js/hgInsights.js
Eksporterer:
- `window.HGInsights` (objekt)

Public metoder på `HGInsights`:
- `logCorrectQuizAnswer`
- `getUserConcepts`
- `clearAll`

---

### js/hgConceptIndex.js
Eksporterer:
- `window.HGConceptIndex` (objekt)

Public metoder på `HGConceptIndex`:
- `buildGlobalConceptIndex`
- `getConceptSummary`

---

### js/DomainRegistry.js
Eksporterer:
- `window.DomainRegistry` (objekt)

Public metoder på `DomainRegistry`:
- `resolve`
- `list`
- `aliasMap`
- `file`

---

### js/domainHealthReport.js
Eksporterer:
- `window.DomainHealthReport` (objekt)

Public metoder:
- `run`

---

### js/quiz-audit.js
Eksporterer:
- `window.QuizAudit` (objekt)

Public metoder:
- `run`

---

## AHA (egen app)

### AHA/insightsChamber.js
Eksporterer:
- `window.InsightsEngine` (objekt)

Public metoder på `InsightsEngine`:
- `createEmptyChamber`
- `createSignalFromMessage`
- `addSignalToChamber`
- `splitIntoSentences`
- `getInsightsForTopic`
- `computeTopicStats`
- `computeSemanticCounts`
- `computeDimensionsSummary`
- `createPathSteps`
- `createConceptPathForConcept`
- `createSynthesisText`
- `createArticleDraft`
- `computeTopicsOverview`
- `createNarrativeForTopic`
- `extractConcepts`
- `mergeConcepts`
- `getConceptsForTheme`

---

### AHA/metaInsightsEngine.js
Eksporterer:
- `window.MetaInsightsEngine` (objekt)

Public metoder på `MetaInsightsEngine`:
- `buildUserMetaProfile`
- `computeGlobalSemanticProfile`
- `detectCrossTopicPatterns`
- `enrichInsightsWithLifecycle`
- `computeInsightLifecycle`
- `buildConceptIndex`
- `buildConceptIndexForTheme`
- `posFilterConcepts`
- `extractMultiwordConcepts`

---

### AHA/ahaFieldProfiles.js
Eksporterer:
- `window.HG_FIELD_PROFILES` (objekt)

Public keys i `HG_FIELD_PROFILES`:
- `historie`
- `vitenskap`
- `kunst`
- `natur`
- `musikk`
- `populaerkultur`
- `subkultur`
- `sport`
- `by`
- `politikk`
- `naeringsliv`
- `litteratur`

---

### AHA/ahaEmneMatcher.js
Eksporterer (global funksjon):
- `matchEmneForText(subjectId, text)`


---

# ➕ LEGG TIL I `SYSTEM_MAP.md`
*(legg til nederst – ikke flytt eksisterende piler)*

```md
---

## Observations & Pensum – systemflyt (utvidelse)

Quiz ─┐
      ├──> hg_learning_log_v1 ────────────────┐
Observation ──────────────────────────────────┤
                                                ├──> Courses / Pensum (HGCourses)
Knowledge ─────────────────────────────────────┘

Observation ──> Place Popup (visning)
Observation ──> Person Popup (visning)

Notes ───────────────┐
                      └──> Profil / AHA / refleksjon
