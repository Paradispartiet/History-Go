# SYSTEM REGISTRY – History Go

Dette dokumentet definerer regler og kontrakter for systemet.
Det er bindende for videre utvikling.

---

## TILLATTE GLOBALS

Følgende globals er eksplisitt tillatt:

- window.PLACES
- window.PEOPLE
- window.BADGES
- window.RELATIONS
- window.MAP
- window.HGMap
- window.HGPos
- window.OPEN_MODE
- window.API
- window.HG_CiviDebug
- window.HG_RuntimeHealth
- window.HG_RuntimeSmokeRunner
- window.HG_RuntimeHealthPanel
- window.HG_CiviEconomySnapshot

Ingen andre globals skal introduseres uten beslutning.


### Top-level runtime health diagnostics

`window.HG_RuntimeHealth` is an allowed global exposed by `js/debug/HGRuntimeHealth.js` for browser-console diagnostics only.

Allowed methods:

- `HG_RuntimeHealth.snapshot()` — read-only snapshot of Civication health, HG Social health, core globals, map availability, profile/learning-log availability, and basic data counts.
- `HG_RuntimeHealth.health()` — read-only top-level readiness report returning `{ ok, score, checks, blockers, warnings, summary, timestamp }`.
- `HG_RuntimeHealth.printHealth()` — prints the report compactly in the console and returns the same health object.

This helper is **read-only diagnostics only**. It may aggregate existing subsystem diagnostics, including `HG_CiviDebug.health()` and `HG_SocialDebug.health()`, but it must not own or change Civication logic, HG Social logic, map logic, profile logic, data loading, UI, gameplay flow, rendering, or localStorage contents.


`window.HG_RuntimeSmokeRunner` is an allowed global exposed by `js/debug/HGRuntimeSmokeRunner.js` for **TEST_MODE-only** manual runtime smoke checks. It is enabled only when `localStorage.getItem("HG_TEST_MODE") === "1"`.

Allowed methods:

- `HG_RuntimeSmokeRunner.isEnabled()` — reads the TEST_MODE flag.
- `HG_RuntimeSmokeRunner.run()` — performs a read-only smoke check of runtime health, map data readiness, learning-log read APIs, Civication/HG Social debug health, profile snapshot availability, PlaceCard readiness, and privacy field leaks.
- `HG_RuntimeSmokeRunner.print()` — runs the same smoke check and prints compact console output.

This helper is **read-only diagnostics only**. It must not create demo data, fake users, invites, circles, routes, unlocks, economy ticks, mail answers, place-card opens, or gameplay/profile/map/data mutations. When TEST_MODE is disabled, `run()` only reads `HG_TEST_MODE` and returns a skipped result.

`window.HG_RuntimeHealthPanel` is an allowed global exposed by `js/debug/HGRuntimeHealthPanel.js` for **TEST_MODE-only** in-app diagnostics UI. It exposes `render()`, `refresh()`, `remove()`, and `isEnabled()`. The panel may render `HG_RuntimeHealth.health()` for manual testing only when test mode is enabled; it is read-only diagnostics UI, not production UI, and must not mutate gameplay, profile, map, data, Civication, HG Social, or localStorage state.


### Civication read-only debug-globals

Disse er eksplisitt tillatt, men er **kun read-only inspeksjon** (ingen gameplay, ingen skriving):

- `window.HG_CiviWorkdaySnapshot()` — returnerer et øyeblikksbilde av arbeidsdag-state
  (`CivicationUI.getCurrentWorkdaySnapshot`). Ren lesning av `CivicationState`,
  `CivicationCalendar`, `CivicationTaskEngine` og innboksen via den delte `computeWorkdayModel()`
  som `renderWorkdayPanel()` også bruker. Rører ikke DOM og endrer ikke rendering.
- `window.CivicationHome.getHomeSnapshot()` — read-only Home/nabolag-øyeblikksbilde fra
  `CivicationHome` / `civi_home_v1`, med kapital lest fra `hg_capital_v1`. Endrer ikke
  gameplay-state, priser, husleie eller boligpress.
- `window.CivicationHome.getDistrictViewModels()` — read-only district view models for
  UI/debug. Bruker eksisterende distriktsdata, låseregler og kapital-lesning, men skriver
  ingenting og endrer ikke kjøps-/flytteregler.

---

## INIT-REGLER

| Funksjon | Fil | Når |
|--------|-----|-----|
| boot() | boot.js | DOMContentLoaded |
| initLeftPanel() | left-panel.js | etter DOM |
| initMiniProfile() | mini-profile.js | etter DOM |
| QuizEngine.init() | boot.js | etter data |

All init skjer via `boot()`.

---

## ABSOLUTTE REGLER

1. ❌ Core-filer skal aldri bruke DOM
2. ❌ UI-filer skal aldri fetch’e data
3. ❌ Ingen `DOMContentLoaded` utenfor `app.js`
4. ❌ Ingen dupliserte funksjonsnavn på tvers av filer
5. ✅ All systemstart går gjennom `boot()`

---

## FEILHÅNDTERING

- `safeRun()` er eneste tillatte wrapper for init
- Kritiske feil logges til `window.__HG_LAST_ERROR__`
- UI-feil skal ikke stoppe boot

---

## ENDRINGER

Endringer i struktur krever:
1. Oppdatert SYSTEM_MAP.md
2. Oppdatert SYSTEM_REGISTRY.md

Ingen unntak.

---

## SLUTT
Dette dokumentet er kontrakten for History Go.

SYSTEM REGISTRY (UPDATED 2025-12-28)
====================================

NOTE
----
Denne fila er oppdatert uten å slette noe av originalteksten.
Originalinnholdet står fortsatt her, og nye avklaringer er lagt til som egne seksjoner.

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
- lasting av fagfiler via `data/fag/fag_manifest.json` (aktive fagfiler per subject)
- (evt) lasting av overlays/pensum/quiz via manifest/loader (der det er implementert) 

Regel:
- Ingen andre filer fetcher `/data/*.json` direkte **hvis dataHub tilbyr det**.

Fagfil-kontrakt (manifest)
- Aktiv kontrakt: `data/fag/fag_manifest.json`.
- Manifestfelter per subject: `pensum`, `emner`, `fagkart`, `methods`, `supersetQuizMal`.
- Canonical/versjonerte filnavn beholdes; runtime skal gå via manifestet.
- Store fagfiler skal ikke renames/reformatteres for å bytte aktiv versjon.
- Aktiv versjon byttes ved å endre manifestet.

**Bevisst unntak (dokumentert):**
- `notater.html` fetcher `data/people/manifest.json` med manifest-listede people-filer, samt `data/places.json`, for å mappe id→navn.

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
- `data/people/manifest.json` (canonical people-kilde; peker til split people-filer)
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

## 8) AHA (History Go lokal bro)

Folder: `/AHA/`
- `index.html`  [oai_citation:31‡index AHA.html](sediment://file_000000000ccc71f4a2b2d89bdd9ac09f)
- `ahaHistoryGoImport.js`
- `insightsChamber.js`  [oai_citation:33‡routes.js](sediment://file_00000000a990720aa80f64b91ee6b751)
- `metaInsightsEngine.js`  [oai_citation:34‡metaInsightsEngine.js](sediment://file_00000000487871f48023ad7d767e6096)
- `ahaEmneMatcher.js`  [oai_citation:35‡ahaEmneMatcher.js](sediment://file_000000004a78720ab78a7929271e8b15)
- `ahaFieldProfiles.js`  [oai_citation:36‡ahaFieldProfiles.js](sediment://file_0000000086bc720a91836afbff47490e)
- `aha-chat.css`

Kontrakt HG → AHA:
- HG skriver `aha_import_payload_v1` (localStorage)
- AHA-EchoNet importerer `aha_import_payload_v1` via History Go-importbroen.

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
 


---

## Observations (HGObservations)

**Status:** Aktiv  
**Type:** Brukerobservasjoner / feltarbeid  
**Lagring:** `localStorage → hg_learning_log_v1`

### Formål
Observations gir brukeren mulighet til å registrere **egne tolkninger og inntrykk**
av steder og personer, som et supplement til quiz-basert kunnskap.

Dette er **empirisk, situert data** – ikke verifisert fakta.

### Dataskjema (learning log event)
```json
{
  "schema": 1,
  "type": "observation",
  "ts": 1730000000000,
  "subject_id": "by",
  "categoryId": "by",
  "targetType": "place | person",
  "targetId": "place_id | person_id",
  "lens_id": "by_brukere_hvem",
  "selected": ["barnefamilier", "pendlere"],
  "note": "Valgfri tekst"
}

UPPDATERINGER / KLARGJØRINGER (2025-12)
-------------------------------------
Roller (oppdatert, uten å fjerne gamle beskrivelser)
- Merker: toppnivå-fagfelt/kategori.
- Fagkart: faglig struktur (analyse-/feltkart). Ingen progresjonslogikk.
- Emner: pensum/innhold (én sannhet).
- Quiz/Observasjon/Notat: evidensgeneratorer.
- Learning log (`hg_learning_log_v1`): sannhetskilde for brukerens evidens.
- Courses (`HGCourses`): beregner progresjon, modulstatus og diplom (tolker evidens).
- Knowledge (`knowledge_universe` + UI): viser lagret kunnskap + kursstatus.


- `structure_*.json` er tatt helt ut av runtime. Hvis eldre tekst refererer til "structure", regnes det nå som DEPRECATED/historisk.
- Ontologi som *modell* er fortsatt relevant, men implementasjonen i runtime skjer via: Merker → Fagkart → Emner → Evidens (learning log) → Courses → UI.
- `Courses` er progresjonsmotor (tolkningslag) og skal ikke introdusere ny fagstruktur; den bruker emner + learning log + pensum-filer for å beregne modulstatus/diplom.
- Knowledge-visningen er nå flat (ingen structure) og kan i tillegg vise kursprogresjon via `HGCourseUI`/`HGCourses.compute`.


Deprecations
- Structure: fjernet fra runtime. Referanser i originaltekst er historiske.

---

## Civication wallet and shop inventory contracts

- Canonical PC wallet: `CivicationState` using `hg_civi_wallet_v1`.
- Legacy PC wallet: `hg_pc_wallet_v1` is a mirror only and must not be treated as canonical.
- Canonical shop inventory: `HG_CiviShop` using `hg_pc_inventory_v1`.
- Inventory shape: `packs`, `ownedItems`, and `style_counts`.
- Profile/shop renderers may read these contracts but must not redefine wallet logic, inventory logic, badge gating, prices, or data.
---

## Civication debug helper contract

- `window.HG_CiviDebug` is an allowed global exposed by `js/Civication/CivicationBoot.js` for browser-console inspection only.
- Allowed methods: `snapshot()`, `print()`, `health()`, and `printHealth()`. These may be asynchronous and must be safe to call as `await HG_CiviDebug.snapshot()`, `await HG_CiviDebug.print()`, `await HG_CiviDebug.health()`, and `await HG_CiviDebug.printHealth()`.
- Debug helpers must be read-only. They must not mutate Civication state, wallet state, shop inventory, inbox, profile state, localStorage contents, UI, gameplay flow, or create new storage keys.
- Debug helpers must handle missing runtimes, malformed localStorage, and failed visible-pack/store loading defensively.
- `HG_CiviDebug.health()` is a registered read-only readiness helper that reuses the debug snapshot and returns `{ ok, score, checks, blockers, warnings, summary, timestamp }` for browser-console playability triage.
- `HG_CiviDebug.printHealth()` is a registered read-only debug helper that prints the health report compactly and returns the same health object; it must not add UI, mutate state, or change rendering.

---

## Civication economy snapshot contract

- `window.HG_CiviEconomySnapshot` is an allowed read-only global exposed by `js/Civication/core/civicationEconomyEngine.js` for browser-console and debug inspection.
- The snapshot may combine wallet/job/home/shop data to explain current PC economy, but it must not mutate wallet, home, capital, shop, career state, localStorage contents, or gameplay flow.
- Economy snapshots must handle missing runtimes and unavailable visible packs defensively.

## Civication Home / Nabolag gameplay v1
Status: implemented
Purpose: makes district/home choice affect rent pressure, housing status and progression.

- `window.CivicationHome.unlockDistrict(districtId, reason)` — records district unlocks in `civi_home_v1`.
- `window.CivicationHome.canMoveToDistrict(districtId)` — returns whether a district can be moved into and why it is blocked.
- `window.CivicationHome.moveToDistrict(districtId)` — updates current home district and move history when the district is unlocked/available.
- `window.CivicationHome.applyRentTick(force)` — applies weekly rent using existing PC/economic capital and updates rent due/housing status.
- `window.CivicationHome.getHomeSnapshot()` now includes current district, rent pressure, rent due, unlocked ids, available/blocked moves, housing status, and support eligibility.

## HG Social Demo visible surfaces

`window.HG_SocialDemo` is a TEST_MODE-only, demo-only, privacy-safe sandbox API. New public functions:

- `HG_SocialDemo.sendDemoInvite({ toUserId, placeId, presetMessageId })` — writes or updates only demo invites in `hg_social_demo_state_v1`; it is not production data and not a real social graph invite.
- `HG_SocialDemo.getPresetMessages()` — returns the allowed preset demo invitation messages; no free text is accepted.

`window.HG_SocialDemoAdapter` is a TEST_MODE-only and seeded-demo-only adapter for visible manual-testing surfaces. It is demo-only, privacy-safe, not production data, and not a real social graph. It exposes `isEnabled`, place match readers, panel summary helpers, `renderPlaceSocialBlock`, `attachToPlaceCard`, and `detachFromPlaceCard` without mutating `PEOPLE`, `PLACES`, or real social storage.

`window.HG_SocialDemoProfile` is a TEST_MODE-only demo profile card renderer. It is demo-only, privacy-safe, not production data, and not a real profile/social surface. It exposes `open`, `close`, and `renderCard` for fake demo users only.

## HG Social Surface Contract Registry

- `window.HG_SocialSurfaceContract` is a read-only contract global exposed by `js/social/HGSocialSurfaceContract.js`. It exposes `getContract`, `getLabels`, `getActions`, `getPrivacyRules`, `validateSurfaceItem`, `normalizeReason`, and `normalizeAction`. Production social surfaces must follow this contract.
- `window.HG_SocialDemoAdapter` is TEST_MODE-only and seeded-demo-only. It may render demo PlaceCard social blocks and read seeded demo matches, but must never mutate `PEOPLE`, real social storage, real profile storage, production auth, or production place/person data.
- `window.HG_SocialDemoProfile` is TEST_MODE-only. It renders a demo-only profile card and compare-knowledge action using seeded demo state only.
- `window.HG_SocialDemoPanel` is TEST_MODE-only. It renders the stacked demo overview, profiles, matches, invites, circles, shared activities, timeline, and privacy checklist.
- `window.HG_SocialDemo.getActions()` returns the deterministic demo action log from `hg_social_demo_actions_v1`.
- `window.HG_SocialDemo.clearActions()` clears only the demo action log key.
- `window.HG_SocialDemo.sendDemoInvite({ toUserId, placeId, presetMessageId, sourceSurface })` creates or reuses a demo-only preset invite and rejects free text.
- `window.HG_SocialDemo.getPresetMessages()` returns the allowed preset demo invite labels. Demo surfaces are TEST_MODE-only; the contract is read-only; production social must follow the contract before exposing real social UI.

---

## HG Social Signals Registry

- `window.HG_SocialSignals` is the real, local, privacy-safe learning/social signal API. It exposes `recordSignal`, typed record helpers, `getSignals`, `getSummary`, `getPublicProfileSeed`, `clearSignalsForTestMode`, and `health`.
- `window.HG_SocialSignalBridge` is the event bridge for explicit player actions. It exposes `bind`, `unbind`, `isBound`, typed record-from-event helpers, and `health`.
- Storage: `hg_social_signals_v1` only. The model uses deterministic `seq` values, not exact timestamps.
- These APIs are not geolocation tracking, do not use passive proximity, and must not store live status, follower/following data, GPS/coordinates, backend users, or demo users.

Registered privacy-safe CustomEvents, all explicit-action only and not geolocation tracking:

- `hg:quizCompleted` — emitted after successful quiz/set completion payloads with quiz/place/domain/concept/tag fields only.
- `hg:routeCompleted` — emitted only after an explicit route completion, never on route open.
- `hg:observationAdded` — emitted after a saved observation with tags/concepts/title-safe fields only, not raw note bodies.
- `hg:badgeEarned` — reserved for earned badge/merit tier payloads.
- `hg:placeAffinity` — reserved for explicit place unlock/visited/quiz-completion affinity, not GPS or passive map movement.

## HG Public Profile Read-model registry

- `window.HG_PublicProfileReadModel` is exposed by `js/social/HGPublicProfileReadModel.js`. It provides `getSettings`, `saveSettings`, `isPublicEnabled`, `setPublicEnabled`, `getReadModel`, `getPreview`, `validate`, `health`, and `clearSettingsForTestMode` for a privacy-safe local public-profile preview.
- `window.HG_PublicProfilePreviewPanel` is exposed by `js/social/HGPublicProfilePreviewPanel.js`. It provides `render`, `refresh`, `remove`, and `isEnabled` for the current user's local preview only.
- `localStorage` key `hg_public_profile_settings_v1` stores local-only settings. It is not backend storage and is not global publication.
- Events: `hg:publicProfileSettingsChanged` and `hg:publicProfilePreviewRefreshed` dispatch privacy-safe payloads containing only enabled state, signal count, and visible section flags.
- Privacy status: local-only, privacy-safe, not backend, and not global publication yet. The model blocks GPS/live status/followers/last-seen/feed tracking fields and forbidden visible wording.

## HG Social Match Graph

### `window.HG_SocialMatchGraph`

Local-only, privacy-safe public-profile matching API.

- `buildSelfProfile()` reads `HG_PublicProfileReadModel.getReadModel()` and normalizes the local preview profile.
- `getCandidateProfiles()` uses seeded HG Social demo profiles only in `HG_TEST_MODE`; production returns `backend_not_enabled` unless future safe public local profiles are provided.
- `buildMatchGraph()`, `getMatches()`, `getMatchesForPlace()`, `getMatchReasons()`, `getSuggestedActivities()`, and `explainMatch()` produce deterministic knowledge-based suggestions.
- No backend, GPS, presence, follower/following metrics, last-seen values, distance, or real user discovery.
- Demo candidates remain `demoOnly:true` and must never be inserted into `PEOPLE`.

### `window.HG_SocialMatchGraphPanel`

Optional local panel for preview/debug rendering of the match graph. It shows self profile, top matches, place matches, privacy notes, and warnings. It is local-only and does not call a backend.

### `localStorage: hg_social_match_graph_cache_v1`

Reserved optional cache key for derived, privacy-safe match results. Current implementation computes live and only exposes `clearCacheForTestMode()` for this key. It must not store raw private profile data, observations, exact timestamps, GPS/coordinates, presence, follower/following metrics, last-seen values, or visit logs.

## HG Today Hub / Min dag registry

- `window.HG_TodayHub` is exposed by `js/today/HGTodayHub.js`.
- Methods:
  - `snapshot()` — builds the v1 read-only Today Hub snapshot.
  - `getSections()` — returns ordered UI sections: overview, priority, civication, learning, social, routes, observations, diagnostics.
  - `getActions()` — returns all read-only action suggestions.
  - `getPriorityActions()` — returns up to seven ranked suggestions.
  - `health()` — returns runtime/civication/social/learning/routes/observations/panel/privacy checks.
  - `explain(actionIdOrSectionId)` — explains a suggestion or section and its safe next step.
  - `refresh()` — rebuilds the read-model only.
- `window.HG_TodayHubPanel` is exposed by `js/today/HGTodayHubPanel.js`.
- Panel methods:
  - `render()`
  - `refresh()`
  - `remove()`
  - `isEnabled()`
- Status: read-only, local, no backend, no production auto-open.
- The hub reads existing models only and must not run economy ticks, start or complete routes/workdays, create observations, create invites, publish profiles, unlock anything, seed demo data, or alter localStorage during snapshot/health/render.
- Privacy status: local and knowledge-based. The hub blocks forbidden field names and visible wording associated with GPS, live status, followers/following, last-seen, passive tracking, and distance language.
