# History GO – SYSTEM REGISTRY (LOCKED v1)

Dette dokumentet er fasit for filstruktur, ansvar og eierskap.
Ingen “normalisering” eller gjetting er tillatt: domener = filnavn.

Domener (canonical ids):
by, historie, kunst, litteratur, musikk, naeringsliv, natur, politikk,
popkultur, psykologi, sport, subkultur, vitenskap

---

## 1) Entry points

- Root: `index.html` (History GO)
- AHA: `AHA/index.html`
- App bootstrap: `js/app.js`
- Service worker: `sw.js`

---

## 2) Kjerne (JS)

### js/app.js
Rolle: Orchestrator / bootstrap.
Eier:
- init av app
- event-binding
- kobling mellom kart/data/quiz/profil

### js/dataHub.js
Rolle: Datasentral + caching.
Eier:
- lasting av JSON fra `/data/*`
- (evt) loading av overlays/pensum/quiz via manifest/loader

Regel:
- Ingen andre filer fetcher `/data/*.json` direkte hvis dataHub tilbyr det.

### js/map.js
Rolle: Kartmotor.
Eier:
- initMap
- markers + click → UI

### js/routes.js
Rolle: Ruter.
Eier:
- render/tegn ruter
- aktiv rute state (ikke global app state)

### js/quizzes.js
Rolle: Quizmotor.
Eier:
- laste quiz-manifest + riktige quiz-filer
- starte/avslutte quiz
- levere resultater til hgInsights/profile

### js/profile.js
Rolle: Brukerprofil/progresjon.
Eier:
- progresjon, badges, visited
- localStorage state

### js/hgInsights.js
Rolle: Innsiktsmotor (HG).
Eier:
- registrere læring/konsepter
- stats per domene/emne

### js/hgConceptIndex.js
Rolle: Begrepsindeks.
Eier:
- indeks over konsepter og koblinger

### js/knowledge.js
Rolle: Kunnskapsvisning (HG).
Eier:
- rendring av “knowledge” flater/tekst

### js/knowledge_component.js
Rolle: UI-komponent for knowledge.

### js/popup-utils.js
Rolle: Popup/UI-hjelpere.
Regel:
- ingen forretningslogikk

### js/trivia.js
Rolle: Trivia/mikroinnhold.

### js/emnerLoader.js
Rolle: Leser emne-filer fra `/emner/*` og gjør dem tilgjengelig for UI/merker/AHA.
Eier:
- loadEmnerForDomain(domainId)

### js/fagkartLoader.js
Rolle: Leser fagkart-struktur fra `/emner/fagkart*.json`.

### js/emneDekning.js
Rolle: Dekningslogikk (hva brukeren “har dekket” i pensum).
Eier:
- computeCoverage(domainId, userState, emner)

---

## 3) Data (core)

### /data (statisk)
- data/people.json
- data/places.json
- data/routes.json
- data/tags.json
- data/badges.json
- data/people_baseskjema.json
- data/places_baseskjema.json

### /data/overlays/by
- (tematiske overlays for “by”)

### /data/pensum
- (pensumfiler / struktur)

---

## 4) Quiz-data (per domene)

Folder: `data/quiz/`

Filer:
- quiz_by.json
- quiz_historie.json
- quiz_kunst.json
- quiz_litteratur.json
- quiz_musikk.json
- quiz_naeringsliv.json
- quiz_natur.json
- quiz_politikk.json
- quiz_populaerkultur.json
- quiz_psykologi.json
- quiz_sport.json
- quiz_subkultur.json
- quiz_vitenskap.json
- manifest.json   <-- autoritativ liste, brukes av quizzes.js

Regel:
- Ingen quiz skal lastes uten at den finnes i manifest.json
- Ingen mapping/normalisering av domenenavn er lov.

---

## 5) Emner (per domene) + fagkart

Folder: `/emner/`

Emner per domene:
- emner_by.json
- emner_historie.json
- emner_kunst.json
- emner_litteratur.json
- emner_musikk.json
- emner_naeringsliv.json
- emner_natur.json
- emner_politikk.json
- emner_popkultur.json
- emner_psykologi.json
- emner_sport.json
- emner_subkultur.json
- emner_vitenskap.json

Fagkart:
- fagkart.json
- fagkart_map.json

Regel:
- emner_* filnavn er canonical domain id.
- popkultur (emner) og populaerkultur (quiz) er IKKE samme id uten eksplisitt mapping.

---

## 6) Merker (HTML-sider)

Folder: `/merker/`

- merker.html (oversikt)
- merker.css
- merke_by.html
- merke_historie.html
- merke_kunst.html
- merke_litteratur.html
- merke_musikk.html
- merke_naeringsliv.html
- merke_natur.html
- merke_politikk.html
- merke_populaerkultur.html
- merke_psykologi.html
- merke_sport.html
- merke_subkultur.html
- merke_vitenskap.html

Regel:
- Merkesider renderer; de eier ikke logikk.
- De bruker emnerLoader/fagkartLoader + stats fra hgInsights/profile.

---

## 7) CSS

Folder: `/css/`
- base.css
- components.css
- effects.css
- knowledge.css
- layout.css
- map.css
- merits.css
- miniProfile.css
- nearby.css
- overlay.css
- placeCard.css
- popups.css
- profile.css
- quiz.css
- search.css
- sheets.css
- theme.css

---

## 8) AHA (egen app)

Folder: `/AHA/`
- index.html
- ahaChat.js
- insightsChamber.js
- metaInsightsEngine.js
- ahaEmneMatcher.js
- ahaFieldProfiles.js
- aha-chat.css
- package.json
- sw.js

---

## 9) Streng regel: ingen normalisering

Canonical id = filnavnssuffiks.

Hvis id ikke matcher:
- FAIL FAST (log error + stopp)
- aldri “fallback” til annen kategori

Eksempel på konflikt som må håndteres eksplisitt:
- emner_popkultur.json  vs  quiz_populaerkultur.json  vs  merke_populaerkultur.html
Dette krever ETT eksplisitt mapping-objekt (ikke normalisering).
