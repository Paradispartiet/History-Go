# 🧭 History GO – SYSTEM REGISTRY (LOCKED v2)

Dette dokumentet er fasit for filstruktur, ansvar og eierskap.
Ingen “normalisering” eller gjetting er tillatt: **domener = filnavn**.
Hvis id ikke matcher → **FAIL FAST**.

Domener (canonical ids):
by, historie, kunst, litteratur, musikk, naeringsliv, natur, politikk,
popkultur, psykologi, sport, subkultur, vitenskap  [oai_citation:0‡DomainRegistry.js](sediment://file_000000008360720ab3a478d5d1c0d42c)

---

## 1) Entry points

- Root: `index.html` (History GO)  [oai_citation:1‡index.html](sediment://file_00000000d58c720c8a39ec5ab4986634)
- Profile: `profile.html`  [oai_citation:2‡profile.html](sediment://file_000000000a4c71f4a7f3a78b04dc4e35)
- Knowledge: `knowledge.html`  [oai_citation:3‡knowledge.html](sediment://file_0000000053c4720abca21077bd0e053d)
- Notater: `notater.html`  [oai_citation:4‡app.js](sediment://file_00000000dc98720ca7dc44e6d53963bd)
- Emner: `emner.html`  [oai_citation:5‡knowledge.html](sediment://file_0000000053c4720abca21077bd0e053d)
- AHA: `AHA/index.html`  [oai_citation:6‡index AHA.html](sediment://file_000000000ccc71f4a2b2d89bdd9ac09f)
- App bootstrap: `js/app.js` (ingen `core.js` i denne versjonen)  [oai_citation:7‡app.js](sediment://file_00000000dc98720ca7dc44e6d53963bd)
- Service worker: `sw.js`  [oai_citation:8‡sw.js](sediment://file_00000000b114720aa19a322a09c81c5a)
- PWA manifest: `manifest.json`  [oai_citation:9‡app.js](sediment://file_00000000dc98720ca7dc44e6d53963bd)

---

## 2) Kjerne (JS) — ansvar og eierskap

### `js/app.js`
Rolle: **Orchestrator / bootstrap** (nåværende “core”).
Eier:
- init av app
- event-binding
- kobling mellom kart/data/quiz/profil
- lagring av brukerinteraksjon (notater + dialoger)
- eksportbuffer til AHA (`aha_import_payload_v1`)  [oai_citation:10‡app.js](sediment://file_00000000dc98720ca7dc44e6d53963bd)

---

### `js/dataHub.js`
Rolle: **Datasentral + caching + enrichment**.
Eier:
- lasting av JSON og bygging av cache/indekser
- (evt) lasting av overlays/pensum/quiz via manifest/loader (der det er implementert) 

Regel:
- Ingen andre filer fetcher `/data/*.json` direkte **hvis dataHub tilbyr det**.

**Bevisst unntak (dokumentert):**
- `notater.html` fetcher `data/people.json` og `data/places.json` direkte for å mappe id→navn.  [oai_citation:11‡app.js](sediment://file_00000000dc98720ca7dc44e6d53963bd)

---

### `js/map.js`
Rolle: **Kartmotor (HGMap)**.
Eier:
- init av MapLibre-kart
- markers + visited-state
- click → callback til UI/app (ikke egen app-state) 

---

### `js/routes.js`
Rolle: **Ruter**.
Eier:
- route rendering/aktivering
- aktiv rute-state lokalt for route-modus (ikke global app-state)  [oai_citation:12‡notater.html](sediment://file_000000009dcc71f4949d419964ee2ff4)

---

### `js/quizzes.js`
Rolle: **Quizmotor (QuizEngine)**.
Eier:
- laste quiz-manifest + riktige quiz-filer
- starte/avslutte quiz
- belønning/hooks på riktige svar (insights/knowledge/trivia) 

Regel:
- QuizEngine skal være eneste stedet som “binder” quizflyt til belønning-kall (via API/hooks).

---

### `js/profile.js`
Rolle: **Profil og visning av progresjon**.
Eier:
- rendring av profilside (stats, merits, badges, steder/personer, timeline)
- leser localStorage som sannhet
- reagerer på `updateProfile` (live oppdatering)   [oai_citation:13‡profile.html](sediment://file_000000000a4c71f4a7f3a78b04dc4e35)

---

### `js/hgInsights.js`
Rolle: **Innsiktsmotor (HG)**.
Eier:
- registrere læring/konsepter som events
- **kun `core_concepts` regnes som begreper** (topic er ikke fallback)
- lagrer i `hg_insights_events_v1` 

---

### `js/hgConceptIndex.js`
Rolle: **Begrepsindeks**.
Eier:
- indeks over konsepter og koblinger (for navigasjon/struktur/matching)  [oai_citation:14‡hgConceptIndex.js](sediment://file_00000000d8dc720a803a3abcc3810e08)

---

### `js/knowledge.js`
Rolle: **Knowledge-universe + lagring + AHA-sync**.
Eier:
- `knowledge_universe` (localStorage)
- `saveKnowledgeFromQuiz(...)`
- dispatch `updateProfile`
- kaller `syncHistoryGoToAHA()` når tilgjengelig  [oai_citation:15‡knowledge.js](sediment://file_00000000c480720abb3c061dd390cb31)

---

### `js/trivia.js`
Rolle: **Trivia-universe + lagring + AHA-sync**.
Eier:
- `trivia_universe` (localStorage)
- `saveTriviaPoint(...)`
- dispatch `updateProfile`
- kaller `syncHistoryGoToAHA()` når tilgjengelig  [oai_citation:16‡knowledge.js](sediment://file_00000000c480720abb3c061dd390cb31)

---

### `js/popup-utils.js`
Rolle: **Popup/UI-hjelpere + PlaceCard**.
Regel:
- ingen “global forretningslogikk”
- lov å gjøre gating/visningsregler (f.eks. “vis kun etter fullført quiz”)

Eier:
- person-popup / place-popup
- PlaceCard-UI og knapper (quiz/chat/notat)
- inline visning av knowledge/trivia når quiz er fullført (gating via `quiz_history`)  [oai_citation:17‡popup-utils.js](sediment://file_00000000077c71f4abe46f365249f2d5)

---

### `js/knowledge_component.js`
Rolle: **UI-komponent for knowledge** (renderer knowledge-lister/komponenter i HG-sider).  [oai_citation:18‡knowledge_component.js](sediment://file_0000000020d4720a9c775d5489494dae)

---

### `js/DomainRegistry.js`
Rolle: **Domene-fasit + alias + fail-fast**.
Eier:
- canonical domain ids + alias
- filkonvensjon-helper (`file(kind, domainId)`)
- STOPP ved ukjent domene (ingen normalisering)  [oai_citation:19‡DomainRegistry.js](sediment://file_000000008360720ab3a478d5d1c0d42c)

---

### `js/domainHealthReport.js`
Rolle: **Helsesjekk for domener (filer/manifest)**.
Eier:
- verifisere at domener har forventede filer (emner/quiz/merke + manifest best effort)
- dev-verktøy (toast/log)  [oai_citation:20‡domainHealthReport.js](sediment://file_00000000e7f471f4aedee10968b3595c)

---

### `js/quiz-audit.js`
Rolle: **Quiz-integritetssjekk**.
Eier:
- lese `data/quiz/manifest.json`
- laste quizfiler
- validere at `personId/placeId` finnes i PEOPLE/PLACES  [oai_citation:21‡quiz-audit.js](sediment://file_00000000fa54720aabdb60556e9c8681)

---

## 3) Data (core)

### `/data` (statisk)
- `data/people.json`
- `data/places.json`
- `data/routes.json`
- `data/tags.json`
- `data/badges.json`
- (evt) base-skjema-filer hvis de brukes i repoet (holdes stabile)

Regel:
- steder/personer/quiz må bruke id-er som matcher koblinger (placeId/personId osv.).
- endrer du id → kjør QuizAudit etterpå.  [oai_citation:22‡quiz-audit.js](sediment://file_00000000fa54720aabdb60556e9c8681)

### `/data/overlays/<domain>`
- tematiske overlays per domene (hvis aktivert via DataHub). 

### `/data/pensum` og/eller `/emner`
- pensumstruktur og emner brukes av `emner.html` og AHA-matching.  [oai_citation:23‡knowledge.html](sediment://file_0000000053c4720abca21077bd0e053d)  [oai_citation:24‡ahaEmneMatcher.js](sediment://file_000000004a78720ab78a7929271e8b15)

---

## 4) Quiz-data (per domene)

Folder: `data/quiz/`

- `manifest.json`  ← autoritativ liste, brukes av QuizEngine/Audit   [oai_citation:25‡quiz-audit.js](sediment://file_00000000fa54720aabdb60556e9c8681)
- quizfiler per domene (filnavn styrt av DomainRegistry + manifest)  [oai_citation:26‡DomainRegistry.js](sediment://file_000000008360720ab3a478d5d1c0d42c)

Regel:
- Ingen quiz skal lastes uten at den finnes i `data/quiz/manifest.json`. 
- Ingen mapping/normalisering av domenenavn er lov.

---

## 5) Emner (per domene) + fagkart

Folder: `/emner/`

Emner per domene:
- `emner_<domainId>.json` (domainId må være canonical)  [oai_citation:27‡domainHealthReport.js](sediment://file_00000000e7f471f4aedee10968b3595c)

Fagkart:
- `fagkart*.json` (hvis i bruk) – lastes av fagkart-loader via DataHub/Emner-sider.  [oai_citation:28‡knowledge.html](sediment://file_0000000053c4720abca21077bd0e053d)

Regel:
- `emner_*` filnavn er canonical domain id.
- Konflikter som `popkultur` vs `populaerkultur` skal håndteres eksplisitt via DomainRegistry alias (ikke “normalisering”).  [oai_citation:29‡DomainRegistry.js](sediment://file_000000008360720ab3a478d5d1c0d42c)

---

## 6) Merker (HTML-sider)

Folder: `/merker/`

- `merker.html` (oversikt)
- `merker.css`
- `merke_<domainId>.html` (eller alias-løsning via DomainRegistry)

Regel:
- merkesider renderer; de eier ikke systemlogikk.
- de viser emner/knowledge via dedikerte moduler (f.eks. `knowledge_component.js`).  [oai_citation:30‡knowledge_component.js](sediment://file_0000000020d4720a9c775d5489494dae)

---

## 7) CSS

### 7.1 `/css/` (komplett liste)
Folder: `/css/`

- `theme.css`
- `base.css`
- `layout.css`
- `components.css`
- `effects.css`
- `knowledge.css`
- `map.css`
- `merits.css`
- `miniProfile.css`
- `nearby.css`
- `overlay.css`
- `placeCard.css`
- `popups.css`
- `profile.css`
- `quiz.css`
- `search.css`
- `sheets.css`

Regel:
- Ingen nye CSS-filer legges inn uten at denne lista oppdateres (LOCKED).

---

### 7.2 CSS lastet per entrypoint (autoritative HTML-headere)

#### `index.html` (hovedapp)
Laster:
- `/css/theme.css`
- `/css/base.css`
- `/css/layout.css`
- `/css/components.css`
- `/css/effects.css`
- `/css/map.css`
- `/css/nearby.css`
- `/css/search.css`
- `/css/sheets.css`
- `/css/overlay.css`
- `/css/placeCard.css`
- `/css/popups.css`
- `/css/quiz.css`
- `/css/merits.css`
- `/css/miniProfile.css`
- **(DEV)** `js/console/console.css` *(ikke i /css/, men lastes her)*

#### `profile.html` (profil)
Laster:
- `/css/theme.css`
- `/css/base.css`
- `/css/layout.css`
- `/css/components.css`
- `/css/miniProfile.css`
- `/css/merits.css`
- `/css/popups.css`
- `/css/overlay.css`
- `/css/effects.css`
- `/css/profile.css`

#### `knowledge.html` (kunnskap)
Laster:
- `/css/theme.css`
- `/css/base.css`
- `/css/layout.css`
- `/css/components.css`
- `/css/knowledge.css`

#### `notater.html` (notater)
Laster:
- `/css/theme.css`
- `/css/base.css`
- `/css/layout.css`
- `/css/components.css`
- `/css/effects.css`

#### `emner.html` (emner/pensum)
Laster:
- `/css/theme.css`
- `/css/base.css`
- `/css/layout.css`
- `/css/components.css`
- `/css/effects.css`
- (evt) `knowledge.css` hvis emner-siden viser knowledge-komponenter

Regel:
- Hvis en side endrer CSS-lasterekkefølge eller legger til/fjerner CSS, skal denne seksjonen oppdateres (LOCKED).

## 8) AHA (egen app)

Folder: `/AHA/`
- `index.html`  [oai_citation:31‡index AHA.html](sediment://file_000000000ccc71f4a2b2d89bdd9ac09f)
- `ahaChat.js`  [oai_citation:32‡ahaChat.js](sediment://file_00000000d53471f4a786fc85c56feb22)
- `insightsChamber.js`  [oai_citation:33‡routes.js](sediment://file_00000000a990720aa80f64b91ee6b751)
- `metaInsightsEngine.js`  [oai_citation:34‡metaInsightsEngine.js](sediment://file_00000000487871f48023ad7d767e6096)
- `ahaEmneMatcher.js`  [oai_citation:35‡ahaEmneMatcher.js](sediment://file_000000004a78720ab78a7929271e8b15)
- `ahaFieldProfiles.js`  [oai_citation:36‡ahaFieldProfiles.js](sediment://file_0000000086bc720a91836afbff47490e)
- `aha-chat.css`
- `sw.js` (AHA-scope)

Kontrakt HG → AHA:
- HG skriver `aha_import_payload_v1` (localStorage)
- AHA importerer på brukerhandling (“Importer History Go”)  [oai_citation:37‡app.js](sediment://file_00000000dc98720ca7dc44e6d53963bd)  [oai_citation:38‡index AHA.html](sediment://file_000000000ccc71f4a2b2d89bdd9ac09f)

---

## 9) Streng regel: ingen normalisering

Canonical id = filnavnssuffiks.

Hvis id ikke matcher:
- FAIL FAST (log error + stopp)
- aldri fallback til annen kategori

Konflikter håndteres kun via **ett eksplisitt mapping/alias** i DomainRegistry:
- eksempel: `popkultur` vs `populaerkultur` (må være eksplisitt alias, ikke heuristikk)  [oai_citation:39‡DomainRegistry.js](sediment://file_000000008360720ab3a478d5d1c0d42c)

---

## 10) Validering før merge (standard)
- Kjør: `DomainHealthReport.run({ toast: true })`  [oai_citation:40‡domainHealthReport.js](sediment://file_00000000e7f471f4aedee10968b3595c)
- Kjør: `QuizAudit.run()`  [oai_citation:41‡quiz-audit.js](sediment://file_00000000fa54720aabdb60556e9c8681)
- Minimum manual test:
  - start quiz → riktig svar → knowledge/trivia lagres → `updateProfile` trigges  [oai_citation:42‡knowledge.js](sediment://file_00000000c480720abb3c061dd390cb31)  [oai_citation:43‡knowledge.js](sediment://file_00000000c480720abb3c061dd390cb31)
