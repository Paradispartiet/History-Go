# 🧭 HISTORY GO — SYSTEM MAP (nyeste)
Dette dokumentet er fasit for **hva som skjer**, **hvordan det skjer**, og **hvorfor** – på tvers av History GO + AHA.

---

## 1) Entry points (sider) og hva de eier

### `index.html` (Hovedapp)
**Eier:** kart, utforsk, placeCard, quiz-start, unlock, ruter, person/sted-popups, samtale + notat triggers.  
**Runtime-kjerne:** `js/app.js` orkestrerer og kobler moduler.  [oai_citation:0‡index.html](sediment://file_00000000d58c720c8a39ec5ab4986634)  [oai_citation:1‡app 2.js](sediment://file_00000000ac28720a8b2ae16855897363)

### `profile.html` (Profil)
**Eier:** profil-statistikk, merker/badges + modal, people-grid, visited-grid, timeline, “Siste kunnskap/funfacts”, og AHA-knapp.  [oai_citation:2‡profile.html](sediment://file_000000000a4c71f4a7f3a78b04dc4e35)  
Kjører: `js/knowledge.js`, `js/trivia.js`, `js/profile.js`.  [oai_citation:3‡profile.html](sediment://file_000000000a4c71f4a7f3a78b04dc4e35)

### `knowledge.html` (Kunnskapsbibliotek)
**Eier:** lesing/oversikt over all lagret knowledge (fra `knowledge_universe`). 

### `notater.html` (Notatbok)
**Eier:** render av alle notater fra `hg_user_notes_v1`.  [oai_citation:4‡notater.html](sediment://file_00000000b92871f486bfea98ba1d799e)  
**Viktig:** denne siden fetcher `people.json` og `places.json` direkte (ikke via DataHub).  [oai_citation:5‡notater.html](sediment://file_00000000b92871f486bfea98ba1d799e)

### `emner.html` (Emner / pensum)
**Eier:** emne-dekning per fagfelt basert på brukerens begreper (fra HGInsights) + emner fra EmnerLoader + `computeEmneDekning`.  [oai_citation:6‡emner.html](sediment://file_00000000b95c71f48436d6be7b142056)

### `AHA/index.html` (AHA)
**Eier:** import av HG-data (leser `aha_import_payload_v1`) og visning av innsiktskammer / chat.  [oai_citation:7‡index AHA.html](sediment://file_000000000ccc71f4a2b2d89bdd9ac09f)  [oai_citation:8‡ahaChat.js](sediment://file_00000000d53471f4a786fc85c56feb22)  [oai_citation:9‡routes.js](sediment://file_00000000a990720aa80f64b91ee6b751)

---

## 2) Moduloversikt (ansvar og “hvorfor”)

### `js/app.js` — Orchestrator (den nye “core”)
**Hva:** init, event-binding, progresjon, localStorage-kontrakter, samtale/notat-handlers, og eksportbuffer til AHA.  [oai_citation:10‡app 2.js](sediment://file_00000000ac28720a8b2ae16855897363)  
**Hvorfor:** ett sted å forstå “hva skjer når brukeren gjør X”.

### `js/dataHub.js` — Datasentral
**Hva:** laster JSON innen scope, bygger cache, “enriched” datasett og loader pakker (quiz manifest, overlays, emner/pensum hvis aktivert).  [oai_citation:11‡dataHub.js](sediment://file_00000000de44720aa99eb6770a66cc59)  
**Hvorfor:** team-sikkert: færre fetch-spredninger og mer deterministisk dataflyt.

### `js/map.js` — HGMap (MapLibre)
**Hva:** init kart, marker-lag, visited-state, click-callbacks (kaller tilbake til app/UI), og refreshMarkers.  [oai_citation:12‡map.js](sediment://file_000000005484720ab51b8ffa260b88e3)  
**Hvorfor:** kartlogikk isolert fra progresjon.

### `js/quizzes.js` — QuizEngine
**Hva:** starter quiz for targetId (place/person), bruker manifest for å finne riktige quizfiler, “gating” (krever at sted er visited før quiz), og sender rewards.  [oai_citation:13‡quizzes.js](sediment://file_000000000ffc720aa6b5415f4b14ce5a)  
**Hvorfor:** quiz er “motoren” som produserer progresjon + knowledge/trivia-signaler.

**Viktig designregel i koden:** knowledge/trivia belønning trigges på **riktige svar** via API-hooks.  [oai_citation:14‡quizzes.js](sediment://file_000000000ffc720aa6b5415f4b14ce5a)

### `js/knowledge.js` — Knowledge universe + AHA-sync
**Hva:** lagrer/leser `knowledge_universe`, tilbyr “saveKnowledgeFromQuiz”, og trigget UI-sync via `updateProfile`.  [oai_citation:15‡knowledge.js](sediment://file_00000000c480720abb3c061dd390cb31)  
**Hvorfor:** knowledge er varig, gjenbrukbart “innholdslag” som vokser av learning events.

### `js/trivia.js` — Trivia universe + AHA-sync
**Hva:** lagrer/leser `trivia_universe`, tilbyr `saveTriviaPoint`, og trigget UI-sync via `updateProfile`.  [oai_citation:16‡trivia.js](sediment://file_0000000094e0720aa9de1d7ca663169b)  
**Hvorfor:** trivia er mikro-belønning/mikrolæring (hold flyt).

### `js/popup-utils.js` — UI/Popups + placeCard
**Hva:** `showPersonPopup`, `showPlacePopup`, `openPlaceCard` + reward-popups. Leser inline knowledge/trivia fra localStorage, men **viser det bare hvis quiz er fullført**.  [oai_citation:17‡popup-utils.js](sediment://file_00000000077c71f4abe46f365249f2d5)  
**Hvorfor:** “kunnskap låses opp av læring” (først quiz → så kunnskap/funfacts i kort/popup).

### `js/hgInsights.js` — Begrepsspor (quiz_correct → concepts)
**Hva:** logger events i `hg_insights_events_v1`. Kun `core_concepts` teller; `topic` er ikke fallback.   
**Hvorfor:** gir et robust “concept count”-grunnlag for emner/pensum og AHA-profil.

### `js/hgConceptIndex.js` — Konseptindeks
**Hva:** indeks/struktur som lar deg mappe begreper videre (brukes av AHA/innsiktslaget).  [oai_citation:18‡hgConceptIndex.js](sediment://file_00000000d8dc720a803a3abcc3810e08)  
**Hvorfor:** gjør “begreper” om til navigerbar struktur (ikke bare en logg).

### `js/routes.js` — Ruter
**Hva:** rutevisning/aktivering (“show route to …”), koblet til kart og placeCard flow.  [oai_citation:19‡notater.html](sediment://file_000000009dcc71f4949d419964ee2ff4)  
**Hvorfor:** ruter er egen oppdagelsesmodus (tematisk guiding).

### `js/profile.js` — Profilmotor
**Hva:** bygger profil-UI (stats, merits, personer, steder, tidslinje), leser knowledge/trivia “latest”, og eksponerer AHA-knappen fra profilen.   [oai_citation:20‡profile.html](sediment://file_000000000a4c71f4a7f3a78b04dc4e35)  
**Hvorfor:** profil er “sannhetens speil”: render av lagret progresjon.

### `AHA/ahaChat.js` + `AHA/insightsChamber.js`
**Hva:** AHA sin import + lagring/visning av kammer (insikter, topics, stats) og chat.  [oai_citation:21‡ahaChat.js](sediment://file_00000000d53471f4a786fc85c56feb22)  [oai_citation:22‡routes.js](sediment://file_00000000a990720aa80f64b91ee6b751)  
**Hvorfor:** HG produserer erfaring; AHA produserer abstraksjon og “meta”.

---

## 3) Runtime: hva som skjer (detaljert flyt)

### 3.1 Oppstart (uten core.js)
1) `index.html` laster moduler (app er hovedstart).  [oai_citation:23‡index.html](sediment://file_00000000d58c720c8a39ec5ab4986634)  
2) `app.js` initierer systemet (leser data/progresjon, binder UI-events).  [oai_citation:24‡app 2.js](sediment://file_00000000ac28720a8b2ae16855897363)  
3) `DataHub` brukes for lasting/caching av JSON og pakker.  [oai_citation:25‡dataHub.js](sediment://file_00000000de44720aa99eb6770a66cc59)  
4) `HGMap.initMap(...)` opprettes og får `setPlaces` + `setVisited`.  [oai_citation:26‡map.js](sediment://file_000000005484720ab51b8ffa260b88e3)  
5) `QuizEngine.init(...)` settes opp med API-hooks (knowledge/trivia/insights/rewards).  [oai_citation:27‡quizzes.js](sediment://file_000000000ffc720aa6b5415f4b14ce5a)

**Hvorfor:** deterministisk “data først → UI etterpå”.

---

### 3.2 Utforsk → placeCard → quiz
- Bruker trykker et sted (kart/panel) → `openPlaceCard(place)` rendrer kort + knapper.  [oai_citation:28‡popup-utils.js](sediment://file_00000000077c71f4abe46f365249f2d5)  
- Klikk “Ta quiz” → `QuizEngine.start(place.id)` (ny motor).  [oai_citation:29‡popup-utils.js](sediment://file_00000000077c71f4abe46f365249f2d5)  [oai_citation:30‡quizzes.js](sediment://file_000000000ffc720aa6b5415f4b14ce5a)  
- QuizEngine henter quiz via manifest (`data/quiz/manifest.json`) og laster riktig quizfil.  [oai_citation:31‡quizzes.js](sediment://file_000000000ffc720aa6b5415f4b14ce5a)  [oai_citation:32‡manifest.json](sediment://file_00000000bff8720a884b645df495c814)

**Hvorfor:** quizer er modulære per fagfelt og kan caches/offline.

---

### 3.3 Riktig svar → belønning → knowledge/trivia → innsikt
Ved riktig svar:
- `HGInsights.logCorrectQuizAnswer(userId, quizItem)` logger begreper (kun `core_concepts`).   
- `knowledge.saveKnowledgeFromQuiz(...)` legger inn kunnskapsblokk i `knowledge_universe`.  [oai_citation:33‡knowledge.js](sediment://file_00000000c480720abb3c061dd390cb31)  
- `trivia.saveTriviaPoint(...)` legger inn funfact i `trivia_universe`.  [oai_citation:34‡trivia.js](sediment://file_0000000094e0720aa9de1d7ca663169b)  
- UI sync: `window.dispatchEvent(new Event("updateProfile"))` gjør at mini-profil/profil/labels kan oppdatere.  [oai_citation:35‡knowledge.js](sediment://file_00000000c480720abb3c061dd390cb31)  [oai_citation:36‡trivia.js](sediment://file_0000000094e0720aa9de1d7ca663169b)

**Hvorfor:** du får et stabilt læringsspor (insights) + varig innhold (knowledge) + “spark” (trivia).

---

### 3.4 Visning av knowledge/trivia (låst bak fullført quiz)
Popups/PlaceCard viser inline knowledge/trivia kun hvis `hasCompletedQuiz(targetId)` er true.  [oai_citation:37‡popup-utils.js](sediment://file_00000000077c71f4abe46f365249f2d5)  
Den matcher items på id-prefix: `quiz_<targetId>_...` inne i `knowledge_universe`.  [oai_citation:38‡popup-utils.js](sediment://file_00000000077c71f4abe46f365249f2d5)

**Hvorfor:** “læring først, innhold etterpå” (hindrer at alt blir gratis scrolletekst).

---

### 3.5 Samtale + notater (HG → AHA)
I person-popup finnes knapper:
- `data-chat-person="<person.id>"` (snakk)
- `data-note-person="<person.id>"` (notat)  [oai_citation:39‡popup-utils.js](sediment://file_00000000077c71f4abe46f365249f2d5)

`app.js` håndterer lagring til:
- `hg_person_dialogs_v1`
- `hg_user_notes_v1`
og oppdaterer AHA-importbuffer (`aha_import_payload_v1`).  [oai_citation:40‡app 2.js](sediment://file_00000000ac28720a8b2ae16855897363)

**Hvorfor:** chat/notater er “tekstlig kunnskap” som AHA kan gjøre til innsikt.

---

### 3.6 Profil (leser state og rendrer)
`profile.html` viser alle panelene og modalen for badges, og kaller `profile.js` som rendrer fra localStorage.  [oai_citation:41‡profile.html](sediment://file_000000000a4c71f4a7f3a78b04dc4e35)   
Den viser også “Siste kunnskap” og “Siste funfacts” basert på universene.  [oai_citation:42‡profile.html](sediment://file_000000000a4c71f4a7f3a78b04dc4e35)

---

### 3.7 Emner/pensum (HGInsights → computeEmneDekning)
`emner.html`:
- henter user concepts via `HGInsights.getUserConcepts(userId)`  [oai_citation:43‡emner.html](sediment://file_00000000b95c71f48436d6be7b142056)   
- laster emner via `Emner.loadForSubject(subjectId)` (emnerLoader)  [oai_citation:44‡emner.html](sediment://file_00000000b95c71f48436d6be7b142056)  
- beregner dekning med `computeEmneDekning(concepts, emner)`  [oai_citation:45‡emner.html](sediment://file_00000000b95c71f48436d6be7b142056)

**Hvorfor:** “hva du har lært” knyttes til pensumlinjer (målbar progresjon).

---

### 3.8 Offline-first
Service worker cacher:
- sider (index/profile/knowledge/notater)
- CSS/JS
- data (places/people/tags/badges/routes + quiz-manifest og quiz-filer)
og bruker **network-first for HTML** og **cache-first for statics**.  [oai_citation:46‡sw.js](sediment://file_00000000b114720aa19a322a09c81c5a)

**Hvorfor:** iPad + bybruk krever robust offline og rask last.

---

## 4) State-kontrakt (localStorage keys)

**Progresjon/kjerne:**
- `visited` / `visited_places` (avhenger av hvilken struktur app.js bruker)
- `merits_by_category`
- `quiz_progress` og/eller `quiz_history` (popup-utils sjekker `quiz_history`)  [oai_citation:47‡popup-utils.js](sediment://file_00000000077c71f4abe46f365249f2d5)

**Knowledge/Trivia:**
- `knowledge_universe`  [oai_citation:48‡knowledge.js](sediment://file_00000000c480720abb3c061dd390cb31)
- `trivia_universe`  [oai_citation:49‡trivia.js](sediment://file_0000000094e0720aa9de1d7ca663169b)

**Innsikt/begrep:**
- `hg_insights_events_v1` 

**Samtaler og notater:**
- `hg_person_dialogs_v1`  [oai_citation:50‡app 2.js](sediment://file_00000000ac28720a8b2ae16855897363)
- `hg_user_notes_v1`  [oai_citation:51‡notater.html](sediment://file_00000000b92871f486bfea98ba1d799e)

**AHA bro:**
- `aha_import_payload_v1` (HG skriver; AHA leser ved import)  [oai_citation:52‡app 2.js](sediment://file_00000000ac28720a8b2ae16855897363)  [oai_citation:53‡index AHA.html](sediment://file_000000000ccc71f4a2b2d89bdd9ac09f)

---

## 5) Team-regler (for å unngå rot)

1) Ikke endre localStorage keys uten migrering + oppdatert SYSTEM_MAP.
2) Ikke bypass QuizEngine-hooks: rewards/knowledge/trivia/insights må trigges samme sted.
3) DataHub er “datasentral”; unngå direkte fetch i nye sider (notater.html gjør det nå).  [oai_citation:54‡notater.html](sediment://file_00000000b92871f486bfea98ba1d799e)
4) Popup-utils viser knowledge/trivia kun ved fullført quiz – ikke fjern uten å være bevisst på designregelen.  [oai_citation:55‡popup-utils.js](sediment://file_00000000077c71f4abe46f365249f2d5)
5) Service worker: endringer i filnavn krever oppdatering av STATIC_ASSETS og CACHE_VERSION.  [oai_citation:56‡sw.js](sediment://file_00000000b114720aa19a322a09c81c5a)

---
