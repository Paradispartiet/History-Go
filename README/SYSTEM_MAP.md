# SYSTEM MAP – History Go

Dette dokumentet beskriver den faktiske arkitekturen i History Go per nå.
Det er en operativ oversikt over filer, ansvar og eierskap.

---

## OVERORDNET ARKITEKTUR

History Go er delt i tydelige lag:

- Core (logikk og regler, ingen DOM)
- Data / Knowledge
- Geo / Map
- UI (DOM og interaksjon)
- Civication (karriere, merker, jobber)
- Boot (lasting og init)
- App shell (kobler alt)

---

## 1. CORE (ingen DOM, ingen UI)

**Ansvar**
- Konstanter
- Kategorier
- Avstand/geo-beregning
- Små hjelpefunksjoner

**Filer**

js/core/core.js
js/core/categories.js
js/core/geo.js

**Eier**
- START
- PLACES / PEOPLE / BADGES / RELATIONS (runtime)
- CATEGORY_LIST
- catColor / catClass / tagToCat
- distMeters

---

## 2. DATA / KNOWLEDGE

**Ansvar**
- Knowledge-univers
- AHA-integrasjon
- Notater og dialoger
- Export/sync

**Filer**

js/dataHub.js
js/knowledge.js
js/knowledge_component.js
js/trivia.js

**Eier**
- userNotes
- personDialogs
- exportHistoryGoData
- syncHistoryGoToAHA
- saveKnowledgeFromQuiz

---

## 3. GEO / MAP

**Ansvar**
- Posisjon
- Kart
- Markører
- Ruter

**Filer**

js/pos.js
js/map.js
js/navRoutes.js
js/ors-config.js



**Eier**
- HGPos
- HGMap
- MAP (runtime)
- getPos / focusMap / pulseMarker

---

## 4. UI – DOM OG VISNING

### 4.1 DOM-cache

js/ui/dom.js
Eier: `el`

---

### 4.2 Feedback / UX
js/ui/toast.js

Eier: `showToast`

---

### 4.3 Lister og visninger
js/ui/lists.js

Eier:
- renderNearbyPlaces
- renderCollection
- renderGallery

---

### 4.4 Hendelser og interaksjon
js/ui/events.js
js/ui/interactions.js

Eier:
- global click-delegation
- quiz-start
- søk-resultater
- badge-routing

---

### 4.5 Venstre panel + PlaceCard
js/ui/left-panel.js

Eier:
- collapsePlaceCard / expandPlaceCard
- initLeftPanel
- enterMapMode / exitMapMode

---

### 4.6 Badges og modal
js/ui/badges.js
js/ui/badge-modal.js

Eier:
- ensureBadgesLoaded
- deriveTierFromPoints
- handleBadgeClick

---

### 4.7 Mini-profil
js/ui/mini-profile.js

Eier:
- initMiniProfile
- quiz-historikk
- Civication inbox-visning

---

## 5. CIVICATION

**Ansvar**
- Poeng
- Merker
- Jobbtilbud
- Aktiv stilling

**Filer**
js/merits-and-jobs.js
js/tiersCivi.js
js/Civication inbox.js

**Eier**
- addCompletedQuizAndMaybePoint
- updateMeritLevel
- hg_job_offers_v1
- hg_active_position_v1

---

## 6. BOOT

**Ansvar**
- Laste data
- Bygge runtime-indekser
- Init QuizEngine
- Init map
- Init epoker

**Fil**
js/boot.js

**Eier**
- boot()
- PEOPLE_FILES
- EPOKER_FILES
- buildEpokerRuntimeIndex

---

## 7. APP SHELL

**Ansvar**
- DOMContentLoaded
- safeRun
- Sammenkobling av systemet

**Fil**
js/app.js

---

## SLUTT
Dette dokumentet er normativt.
Avvik fra dette skal enten refaktoreres eller dokumenteres eksplisitt.
