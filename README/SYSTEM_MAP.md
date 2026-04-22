# SYSTEM MAP – History Go

Dette dokumentet beskriver den faktiske arkitekturen i History Go per nå.
Det er en operativ oversikt over filer, ansvar og eierskap.

---

## OVERORDNET ARKITEKTUR

History Go er delt i tydelige lag:

- State (persistens)
- Core (logikk og regler, ingen DOM)
- Data / Knowledge / Insight
- Geo / Map
- Game / Progression
- UI (DOM og interaksjon)
- Observations
- Stories
- Civication (karriere, merker, jobber, identitet, psyke)
- Boot (lasting og init)
- App shell (kobler alt)

---

## 1. STATE – persistens (ingen DOM)

**Ansvar**
- Lokal state (visited, collected osv.)
- Persistering til localStorage
- Open mode / test mode

**Filer**

- js/state/state.js
- js/state/persistence.js
- js/state/openmode.js

**Eier**
- window.visited / window.collected (runtime)
- SET_* / GET_*-hjelpere
- OPEN_MODE

---

## 2. CORE (ingen DOM, ingen side-effekter)

**Ansvar**
- Konstanter
- Kategorier
- Avstand/geo-beregning
- Læringshendelser og læringsstate
- Viewport / lag / bottom sheet

**Filer**

- js/core/core.js
- js/core/categories.js
- js/core/geo.js
- js/core/pos.js
- js/core/knowledgeLearningState.js
- js/core/learningEvents.js
- js/core/viewportManager.js
- js/core/layerManager.js
- js/core/bottomSheetController.js

**Eier**
- START
- PLACES / PEOPLE / BADGES / RELATIONS (runtime)
- CATEGORY_LIST
- catColor / catClass / tagToCat
- distMeters
- HGPos / getPos

---

## 3. DATA / KNOWLEDGE / INSIGHT

**Ansvar**
- Datalasting (manifest-basert)
- Knowledge-univers
- Trivia / funfacts
- Innsikts-events
- AHA-integrasjon (eksport)
- Notater og dialoger
- Domain registry (fag-id normalisering)

**Filer**

- js/dataHub.js
- js/knowledge.js
- js/knowledge_component.js
- js/trivia.js
- js/hgInsights.js
- js/aha.js
- js/hgConceptIndex.js
- js/emnerLoader.js
- js/emneDekning.js
- js/fagkartLoader.js
- js/epoker-runtime.js
- js/DomainRegistry.js
- js/domainHealthReport.js

**Eier**
- window.DataHub (loadPlacesBase, loadPeopleBase, loadNature, overlays, enriched, emner, fagkart, quiz)
- window.FLORA / window.FAUNA (satt av DataHub.loadNature)
- knowledge_universe / trivia_universe
- hg_insights_events_v1
- hg_user_notes_v1 / hg_person_dialogs_v1
- aha_import_payload_v1
- saveKnowledgeFromQuiz
- HGInsights.logCorrectQuizAnswer / getUserConcepts
- DomainRegistry.resolve

---

## 4. GEO / MAP / ROUTING

**Ansvar**
- Kart
- Markører
- Ruter
- OpenRouteService-konfig

**Filer**

- js/map.js
- js/navRoutes.js
- js/orsConfig.js
- js/routes.js
- js/ui/geo-indicator.js

**Eier**
- HGMap
- MAP (runtime)
- focusMap / pulseMarker
- ORS API-nøkkel

---

## 5. GAME / PROGRESSION

**Ansvar**
- Quiz-motor (manifest-basert, ID-basert)
- Unlocks (generelle + natur)
- Quiz-audit

**Filer**

- js/quizzes.js
- js/quiz-audit.js
- js/hg_unlocks.js
- js/hg_nature_unlocks.js

**Eier**
- QuizEngine.init / start / getTargetSummary
- HGUnlocks.recordFromQuiz
- HGNatureUnlocks.recordFromQuiz
- quiz_history / quiz_progress / hg_learning_log_v1
- hg_nature_unlocks_v2

---

## 6. UI – DOM OG VISNING

### 6.1 DOM-cache
- js/ui/dom.js
- Eier: `el`

### 6.2 Feedback / UX
- js/ui/toast.js
- Eier: `showToast`

### 6.3 Lister og visninger
- js/ui/lists.js
- Eier: renderNearbyPlaces, renderCollection, renderGallery

### 6.4 Hendelser og interaksjon
- js/ui/events.js
- js/ui/interactions.js
- Eier: global click-delegation, quiz-start, søk-resultater, badge-routing

### 6.5 Venstre panel + PlaceCard
- js/ui/left-panel.js
- js/ui/place-card.js
- js/ui/popup-utils.js
- Eier: collapsePlaceCard / expandPlaceCard, initLeftPanel, enterMapMode / exitMapMode

### 6.6 Badges og modal
- js/ui/badges.js
- js/ui/badge-modal.js
- Eier: ensureBadgesLoaded, deriveTierFromPoints, handleBadgeClick

### 6.7 Mini-profil
- js/ui/mini-profile.js
- Eier: initMiniProfile, quiz-historikk, Civication inbox-visning

### 6.8 Søk
- js/ui/search.js
- Eier: global search-widget

### 6.9 Chips
- js/hgchips.js

---

## 7. OBSERVATIONS

**Ansvar**
- Observasjonslogg (manifest-basert)
- Visning av observasjoner

**Filer**
- js/observations.js
- js/observationsView.js

**Eier**
- HGObservations
- hg_learning_log_v1 (delt med quiz)

---

## 8. STORIES

**Ansvar**
- Fortellingsmotor
- Kilde/episode-ekstraksjon
- Scoring / dedupe / generering

**Filer**
- js/stories/stories_loader.js
- js/stories/stories_utils.js
- js/stories/story_source_collector.js
- js/stories/story_episode_extractor.js
- js/stories/story_scoring.js
- js/stories/story_dedupe.js
- js/stories/story_generator_engine.js
- js/stories/story_quiz_generator.js
- js/stories/story_graph_engine.js

**Eier**
- HGStories.init

---

## 9. CIVICATION

**Ansvar**
- Roller, stillinger og karriere
- Poeng, merker og jobbtilbud
- Økonomi, kapital, obligasjoner
- Identitet og psyke
- Livsstil og kommersiell rolle
- Kalender, oppgaver og events
- Mailplan (storylets / tråder)

**Filer — kjerne (state + regler)**
- js/Civication/core/civicationState.js
- js/Civication/core/civicationJobs.js
- js/Civication/core/civicationEconomyEngine.js
- js/Civication/core/civicationEventEngine.js
- js/Civication/core/CivicationPsyche.js
- js/Civication/core/civicationCalendar.js
- js/Civication/core/civicationTaskEngine.js

**Filer — rot (engines / rolle / identitet)**
- js/Civication/tiersCivi.js
- js/Civication/merits-and-jobs.js
- js/Civication/civicationObligationEngine.js
- js/Civication/capitalEngine.js
- js/Civication/capitalMaintenanceEngine.js
- js/Civication/identityCore.js
- js/Civication/identityCompass.js
- js/Civication/identityEngine.js
- js/Civication/civiLifestyle.js
- js/Civication/civicationCommercial.js
- js/Civication/roleStoryletBridge.js
- js/Civication/roleThreadResolver.js
- js/Civication/CivicationBoot.js

**Filer — UI**
- js/Civication/ui/CivicationHome.js
- js/Civication/ui/CivicationPublicLayer.js
- js/Civication/ui/CivicationMap.js
- js/Civication/ui/CivicationUI.js

**Filer — utils / systems**
- js/Civication/utils/storyResolver.js
- js/Civication/utils/conflictLoader.js
- js/Civication/systems/civicationMailPlanPatchRuntime.js
- js/Civication/systems/civicationMailPlanDebug.js
- js/Civication/systems/day/dayCalendarBridge.js
- js/Civication/systems/day/dayHistoryGoContexts.js
- js/Civication/systems/day/dayCarryover.js
- js/Civication/systems/day/dayWeeklyReview.js
- js/Civication/systems/day/dayContacts.js
- js/Civication/systems/day/dayKnowledge.js
- js/Civication/systems/day/dayEvents.js
- js/Civication/systems/day/dayPatches.js

**Eier**
- addCompletedQuizAndMaybePoint
- updateMeritLevel
- hg_job_offers_v1
- hg_active_position_v1
- hg_capital_v1
- hg_civi_task_results_v1

---

## 10. LOADERE (data-loadere utenfor DataHub)

**Filer**
- js/events/events_loader.js
- js/brands/brands_loader.js

---

## 11. BOOT

**Ansvar**
- Laste data
- Bygge runtime-indekser
- Init QuizEngine
- Init map
- Init epoker
- Init DataHub.loadNature

**Fil**
- js/boot.js

**Eier**
- boot()
- PEOPLE_FILES
- EPOKER_FILES
- buildEpokerRuntimeIndex

---

## 12. APP SHELL

**Ansvar**
- DOMContentLoaded
- safeRun
- Sammenkobling av systemet

**Fil**
- js/app.js

---

## 13. DEV / CONSOLE / AUDITS

**Filer**
- js/console/init.js
- js/console/verify.js
- js/console/diagnosticConsole.js
- js/console/devConsole.js
- js/console/legacyExtensions.js
- js/audits/missingImages.audit.js

---

## SLUTT
Dette dokumentet er normativt.
Avvik fra dette skal enten refaktoreres eller dokumenteres eksplisitt.
