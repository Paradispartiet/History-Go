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
- js/fagkartLoader.ts (migrert til TS ESM; bundlet til dist/web/fagkartLoader.js, publiserer fortsatt window.Fagkart)
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

## Runtime diagnostics

**Ansvar**
- Runtime health er passiv readiness: den samler eksisterende health/snapshot-signaler uten å endre state.
- Smoke runner er en manuell runtime smoke check som bare finnes i TEST_MODE (`HG_TEST_MODE=1`).
- Smoke runner er read-only og oppretter ikke demodata, brukere, invites, circles, routes, unlocks eller andre gameplay-endringer.

**Filer**

- js/debug/HGRuntimeHealth.js
- js/debug/HGRuntimeSmokeRunner.js
- js/debug/HGRuntimeHealthPanel.js

**Eier**
- window.HG_RuntimeHealth
- window.HG_RuntimeSmokeRunner
- window.HG_RuntimeHealthPanel

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
- Rolle: rask profilstatus i `index.html`

### 6.8 Full profilside
- profile.html
- js/profile.js
- Eier: full profil, samling, merker, profilkart, historikk og profilpaneler
- Rolle: canonical profilside; ikke en intern APP SHELL-view

### 6.9 Søk
- js/ui/search.js
- Eier: global search-widget

### 6.10 Chips
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
  - Home/nabolag-state bor her og lagres kanonisk i `civi_home_v1`. Kapital leses fra `hg_capital_v1`; Home UI er en renderer over `CivicationHome`-state, ikke en egen gameplay-kilde. `getDistrictViewModels()` og `getHomeSnapshot()` er read-only helpers for UI/debug og endrer ikke state.
- js/Civication/ui/CivicationPublicLayer.js
- js/Civication/ui/CivicationMap.js
- js/Civication/ui/CivicationUI.js
  - Arbeidsdag-panelet er en **renderer** over `CivicationState`, `CivicationCalendar`,
    `CivicationTaskEngine` og innboks/event-data. `computeWorkdayModel()` er den ene
    datakilden; `renderWorkdayPanel()` tegner den, og `getCurrentWorkdaySnapshot()`
    (eksponert read-only som `window.HG_CiviWorkdaySnapshot`) returnerer den uendret for
    debugging/inspeksjon — skriver ingenting, rører ikke DOM.

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

**Boot/debug helpers**
- `window.HG_CiviDebug` lives in `js/Civication/CivicationBoot.js`.
- It is a read-only browser-console helper for `await HG_CiviDebug.snapshot()`, `await HG_CiviDebug.print()`, `await HG_CiviDebug.health()`, and `await HG_CiviDebug.printHealth()`.
- `HG_CiviDebug.snapshot()` is raw state inspection: it gathers wallet, inventory, profile, inbox, shop visibility, psyche, home, economy, capital, and related debug state without interpreting playability.
- `HG_CiviDebug.health()` is readiness/playability interpretation layered on top of the snapshot: it reports checks, blockers, warnings, a score, and a short Norwegian summary for whether Civication is playable right now.
- Both snapshot and health helpers are read-only and must not mutate wallet, inventory, profile, inbox, shop visibility, psyche, home, economy, capital, localStorage, DOM, rendering, or gameplay state.

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
- Splitte rask index-start fra bakgrunnslast

**Filer**
- js/boot.js
- js/boot-fast.js

**Eier**
- boot()
- bootCritical()
- bootBackground()
- PEOPLE_FILES
- EPOKER_FILES
- buildEpokerRuntimeIndex

**Se også**
- [Index app structure](../docs/APP_STRUCTURE_INDEX.md)

---

## 12. APP SHELL

**Ansvar**
- DOMContentLoaded
- safeRun
- Sammenkobling av systemet
- Starte index-router etter critical boot
- La background boot kjøre uten å blokkere app-ready

**Filer**
- js/app.js
- js/router/AppRouter.js
- js/views/MapView.js

**Eier**
- markAppReady
- HGAppRouter
- HGMapView
- Index-rutene `#/map`, `#/place/:id`, `#/quiz/:id`

**Se også**
- [Index app structure](../docs/APP_STRUCTURE_INDEX.md)

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

---

## Civication profile/shop visibility

- Civication profile panel (`profile.html` via `js/Civication/ui/CivicationUI.js`) is a defensive renderer for the player's Civication status.
- The panel reads career/role and PC wallet state from `CivicationState`, shop inventory and visible packs from `HG_CiviShop`, and salary/psyche context from CapitalEngine-compatible salary helpers, the economy snapshot, and `CivicationPsyche`.
- Profile does not own the PC wallet or shop inventory. Wallet and inventory mutations remain in the Civication state/shop systems.
- The economy engine owns the weekly PC tick and a read-only economy model (`HG_CiviEconomySnapshot` / `CivicationEconomyEngine.getEconomySnapshot`) that explains wallet, job income, job expenses, home rent, affordability, and next-tick status without running the tick.
- Wallet remains owned by `CivicationState`; home rent remains owned by `CivicationHome`. The economy snapshot may combine wallet/job/home/shop data, but it is read-only and must not create gameplay state.
- The profile shop UI is renderer-only: it displays visible packs, owned state, style tag counts, and delegates purchase attempts to `HG_CiviShop.buyPack(packId)`.

## Civication Home / Nabolag gameplay v1
Status: implemented
Purpose: makes district/home choice affect rent pressure, housing status and progression.

- `js/Civication/ui/CivicationHome.js` owns the `civi_home_v1` home gameplay state: `currentDistrictId`, `unlockedDistrictIds`, rent due/payment markers, housing status, move history, and eviction warnings.
- Home movement now runs through `canMoveToDistrict()`, `unlockDistrict()`, and `moveToDistrict()`, so locked districts require knowledge/progress/visit state or explicit unlock state before the player can live there.
- `applyRentTick()` applies weekly rent against existing PC/economic capital storage and worsens `housingStatus` when rent cannot be paid; unemployment/no-income state raises rent pressure and support eligibility without implementing full NAV.

---

## Top-level runtime health diagnostics

**Boot/debug helper**
- `window.HG_RuntimeHealth` lives in `js/debug/HGRuntimeHealth.js` and is loaded by `js/app.js` as a browser-console diagnostic helper.
- It is a top-level, read-only runtime diagnosis for `await HG_RuntimeHealth.snapshot()`, `await HG_RuntimeHealth.health()`, and `await HG_RuntimeHealth.printHealth()`.
- It answers whether History Go is playable right now by checking core globals, map readiness, data counts, profile/learning-log availability, Civication diagnostics, and HG Social diagnostics.
- It aggregates `window.HG_CiviDebug.health()` and `window.HG_SocialDebug.health()` when those subsystem diagnostics are loaded on the current page.
- It does not own Civication logic, HG Social logic, map behavior, profile behavior, data loading, UI, or gameplay state. It must not mutate state, create data, write localStorage, or change rendering.
- `window.HG_RuntimeHealthPanel` lives in `js/debug/HGRuntimeHealthPanel.js` and is loaded by `js/app.js` after `HG_RuntimeHealth`. It is a **TEST_MODE-only** read-only panel: it renders `HG_RuntimeHealth.health()` inside the app only when `HG_TEST_MODE` is enabled, and it is not production UI.
- The panel is only diagnostic visibility for manual testing (for example iPad smoke checks). It must not create demo data, profiles, invites, circles, economy ticks, mail answers, unlocks, or other gameplay/profile/map/data mutations.

## HG Social Demo Adapter and TEST_MODE-visible demo surfaces

- `js/social/HGSocialDemo.js` owns the isolated HG Social demo sandbox. It is TEST_MODE-only, requires manual `HG_SocialDemo.seed()`, stores demo state only in `hg_social_demo_state_v1`, and exposes demo-only preset invite writes through `sendDemoInvite()` plus `getPresetMessages()`.
- `js/social/HGSocialDemoAdapter.js` exposes `window.HG_SocialDemoAdapter` as a read-only bridge from seeded demo state into visible app surfaces. It never inserts fake users into `PEOPLE`, never mutates real social graphs, and marks returned objects with `demoOnly: true`.
- `js/ui/place-card.js` calls the adapter for a TEST_MODE-only PlaceCard block titled `Demo: kunnskapsfolk her`. The block shows fake knowledge matches and its invite action writes only to demo storage.
- `js/social/HGSocialDemoProfile.js` exposes `window.HG_SocialDemoProfile` for a small inline-styled demo profile popover. It shows demo-only profile fields and preset demo invite controls without chat, free text, place tracking, or follower data.
- `js/social/HGSocialDemoPanel.js`, `js/debug/HGRuntimeHealthPanel.js`, and `js/debug/HGRuntimeSmokeRunner.js` surface seeded demo counts, privacy status, smoke checks, reset controls, and leak detection only when `localStorage.getItem("HG_TEST_MODE") === "1"`.

## HG Social Surface Contract

- `js/social/HGSocialSurfaceContract.js` owns the read-only HG Social surface contract for demo and future production social surfaces. Social surfaces are knowledge-based: they describe shared themes, learned concepts, badges, routes, quizzes, observations, circles, and timeline items rather than proximity or presence.
- The PlaceCard social block is TEST_MODE demo UI today and a future production direction later. It must stay isolated from real users, real backend/auth, real persistence, and real place/person data until a production social implementation adopts the contract.
- Invites are preset-only. The demo invite path accepts only known preset message ids and rejects free text.
- The contract forbids GPS, live location, presence, follower/following metrics, last-seen language, distance wording, and free-text chat on visible social surfaces.
- `window.HG_SocialDemoProfile` defines the future public profile direction with avatar, handle, bio, knowledge fields, badges, learned concepts, favorite places, shared activities, and an explicit privacy checklist.

---

## HG Social Signals

**Filer**
- `js/social/HGSocialSignals.js`
- `js/social/HGSocialSignalBridge.js`
- `js/social/HGSocialDebug.js`
- `js/debug/HGRuntimeHealth.js`
- `js/debug/HGRuntimeSmokeRunner.js`

**Formål**
- `window.HG_SocialSignals` is the real local learning/social signal layer for the current player.
- Signals are produced only by explicit player actions: completed quizzes, completed routes, saved observations, earned badge/merit tiers, and explicit place affinity from already-recorded learning actions.
- The storage key is `hg_social_signals_v1`; it stores deterministic sequence numbers instead of exact timestamps.
- The read models power future public profiles and matching through `getSummary()` and `getPublicProfileSeed()`.

**Privacy contract**
- No GPS, coordinates, passive proximity, live status, followers/following counts, backend users, free-text chat, or exact timestamps.
- Demo state remains separate in `HG_SocialDemo`; demo users must never be written into real signals.
- `health()` scans stored signals, summary, and profile seed for forbidden field names and visible wording.

**Event bridge**
- `window.HG_SocialSignalBridge` listens for privacy-safe explicit-action events and forwards them to `HG_SocialSignals` without changing gameplay outcomes, points, unlocks, or UI.

## HG Public Profile Read-model

- `js/social/HGPublicProfileReadModel.js` exposes `window.HG_PublicProfileReadModel`, a local-only, privacy-safe read-model for previewing what the current user's HG public profile could show if the user chooses to make it public.
- The read-model is built from `HG_SocialSignals.getPublicProfileSeed()` and the dedicated local settings key `hg_public_profile_settings_v1`; it does not add backend publishing, create real social visibility, or publish to global users.
- Public profile state is disabled by default and uses alias-first identity (`Historieutforsker` with the compass avatar) unless a future safe explicit display-name source is available.
- The model intentionally excludes GPS, coordinates, live status, followers/following, last-seen state, exact persisted timestamps, private visit logs, and raw free-text observations.
- `js/social/HGPublicProfilePreviewPanel.js` exposes `window.HG_PublicProfilePreviewPanel` for a local preview panel with privacy checklist, section cards, and TEST_MODE-only clear controls.
- Runtime social diagnostics and smoke checks can include the read-model health so future matching and real public profile surfaces can use one canonical, privacy-validated source.

## HG Social Match Graph

HG Social Match Graph is a local-only knowledge matching engine exposed as `window.HG_SocialMatchGraph`. It builds a normalized self profile from `HG_PublicProfileReadModel.getReadModel()` and compares it with privacy-safe candidate public profiles.

- In `HG_TEST_MODE`, seeded HG Social demo candidates are used for local/manual social surfaces.
- Outside test mode there is no backend discovery yet; the graph returns an explicit `backend_not_enabled` source/warning unless future safe public candidates are available.
- The graph never uses GPS, live status, follower metrics, distance, real user discovery, or backend persistence.
- Match output is derived and privacy-safe: scores, shared knowledge domains, shared concepts, badges, routes, favorite places, observation tags, Norwegian reasons, and suggested preset activities.
- PlaceCard demo surfaces, the public profile preview, runtime health/smoke, and future Min dag surfaces can read this graph without inserting demo users into `PEOPLE`.

Optional panel `window.HG_SocialMatchGraphPanel` renders local self profile, top matches, place matches, privacy status, and warnings without CSS or backend calls.
