# Migreringsplan: `profile.html` som intern ProfileView-kandidat

Status: analyse/plan, ingen runtime-endringer.

Denne planen kartlegger om og hvordan `profile.html` senere kan flyttes inn i index-appens hash-router som en intern `ProfileView`. Den skal ikke leses som en implementeringsbeslutning for full flytting. Dagens stabile appstruktur er fortsatt:

```txt
bootCritical()
bootBackground()
AppRouter
MapView
#/map
#/place/:id
#/quiz/:id
```

`profile.html`, `js/profile.js`, `Civication.html` og `js/Civication/**` skal fortsatt behandles som egne runtime-/sidegrenser til migreringen er eksplisitt godkjent.

---

## 1. Kort diagnose

`profile.html` er ikke bare en visning. Den er en selvstendig side med egen `body`-modus, eget Leaflet-kart, eget dashboard-DOM, egen CSS-miks, egen script-pipeline og en egen `DOMContentLoaded`-boot i `js/profile.js`.

Den tryggeste konklusjonen er:

- Profilen kan på sikt deles opp i interne view-komponenter.
- Den bør ikke flyttes inn som hel side i index-routeren i ett steg.
- Første interne variant bør være en liten profilsummary i index uten kart og uten Civication-panel.
- Full dashboard, profilkart, Civication og groundhopper bør vente til de er separert fra side-boot og globale variabler.

Anbefaling: start senere med alternativ **D: bare profilsummary i index først**. Det gir en ekte intern `ProfileView`-retning uten å importere `profile.html` sin boot, kart eller Civication-runtime.

---

## 2. Hva `profile.html` eier

| Område | Faktisk eierskap i dag | Migreringsvurdering |
| --- | --- | --- |
| Header | Egen `site-header` med tilbakeknapp til `index.html`, logo/brand og `btnSeeMap`. Den er ikke index-headeren med mini-profil, søk, språkvelger og Civication-lenke. | **Kan flyttes delvis senere**, men ikke som-is. En intern view bør bruke index-shell/header og kun rendere profilinnhold. |
| Tilbakeknapp | `<a href="index.html" class="back-link">←</a>` er side-navigasjon, ikke router-navigasjon. | **Kan flyttes nå senere** som router-handling (`HGAppRouter.toMap()`), men bør ikke endres før `#/profile` finnes. |
| Profilkort | `profileCard`, `profileName`, `statVisited`, `statQuizzes`, `statStreak`, `pcValue`, AHA-/edit-knapper. Renderes av `renderProfileCard()` og `renderPC()`. | **Kan flyttes til intern ProfileView først**, men helst som en ny, liten summary-komponent basert på eksisterende localStorage/DataHub-state, ikke ved å kjøre hele `js/profile.js`. |
| Statistikk | Henter visited/quiz/streak/PC fra localStorage og Civication-wallet. | **Kan flyttes i liten form**, men PC-linje må være defensiv fordi `getPCWallet()` er Civication-avhengig. |
| Kart | Eget `<div id="map">`, Leaflet CSS/JS og `setupProfileMap()` med `L.map("map")`. | **Bør vente.** Dette kolliderer direkte med index sitt eksisterende `#map` og `HGMap`/`MAP`. |
| Tabs | `profile-tabs` og `profile-tab-panel` styres av separat `DOMContentLoaded` (`initProfileTabs`). | **Kan flyttes senere**, men ikke før DOM og tab-state eies av en intern view-lifecycle. |
| Samling | Steder, personer, kortsamling og tidslinje (`collectionGrid`, `peopleGrid`, `collectionCardsBody`, `timelineBody`). | **Bør vente etter summary.** Kan flyttes modulvis når renderer-funksjonene er gjort parameteriserte og ikke globale. |
| Merker | `badgeModal`, `merits`, badge mini-kort og modal-logikk. | **Bør vente.** Index har allerede `js/ui/badges.js`/`badge-modal.js`-eierskap; dobbel badge-modal/logikk bør unngås. |
| Kunnskap | Kunnskapsprofil, konsepter, latest knowledge/trivia og `knowledgeEnginePanel`. | **Bør vente.** Avhenger av knowledge/insight/AHA-funksjoner og mange DOM-id-er. Kan migreres som egen fase. |
| Civication-panel | Inline Civication-dashboard med rolle, tilbud, shop, inbox og lenker. Laster mange `js/Civication/**` scripts. | **Bør forbli egen side/vente.** Ikke flytt inn i ProfileView før Civication har egen intern lifecycle/adapter. |
| Groundhopper | `groundhopperProfilePanel` med egen localStorage-statistikk og `window.HG_getGroundhopper*`-hooks. | **Bør vente.** Kan senere bli egen subkomponent når data-/hook-kontrakt er dokumentert. |
| Scripts | Laster base/knowledge/Civication-scripts og til slutt `js/profile.js`. | **Bør ikke flyttes som-is.** Intern ProfileView må ikke injisere dagens side-scriptliste. |
| Egen boot | `js/profile.js` har egen `DOMContentLoaded` som initierer kart, laster data og rendrer alt. | **Bør ikke flyttes.** Må først refaktoreres til eksplisitte init/render/destroy-funksjoner. |
| Egen CSS | `profile.css` og `profile-dashboard.css` pluss delt app-CSS. | **Kan gjenbrukes selektivt**, men intern view må testes mot index sine body-klasser og layout. |

---

## 3. Hva `js/profile.js` booter/laster

### 3.1 Hva kjøres ved `DOMContentLoaded`?

`js/profile.js` har to DOMContentLoaded-løp:

1. Hovedboot:
   - lager `safeCall()` wrapper
   - kjører `setupProfileMap()` tidlig
   - venter på `window.ensureCiviCareerRulesLoaded()` hvis tilgjengelig
   - laster people, places og badges via `DataHub`
   - setter lokale `PEOPLE`, `PLACES`, `BADGES`
   - eksponerer `window.PEOPLE`, `window.PLACES`, `window.BADGES`
   - rendrer profilkort, PC, Civication, merker, personer, steder, tidslinje, kortsamling, kunnskap, trivia, konsepter, AHA, NextUp, groundhopper og knowledge engine
   - oppdaterer profilkart-markører
   - binder profilredigering, AHA-knapp og `updateProfile`-refresh
2. Tab-init:
   - `initProfileTabs()` finner `.profile-tab` og `.profile-tab-panel`
   - binder klikk og aktiverer første tab

Dette er side-boot, ikke intern view-lifecycle.

### 3.2 Globale variabler og globale hooks

`profile.js` bruker eller setter blant annet:

- `var PEOPLE = []`, `var PLACES = []`, `var BADGES = []`
- `window.PEOPLE`, `window.PLACES`, `window.BADGES`
- `window.showPersonPopup`, `window.showPlacePopup` fallback-stubs
- `window.HGLearningLog`
- `window.HG_I18N`
- `window.HGUserProfile`
- `window.getPCWallet`
- `window.getNextUpProfileSummary`
- `window.allPlaces`, `window.HGPlaces`
- `window.HG_getGroundhopperLevel`, `window.HG_getGroundhopperAchievements`
- `window.HG_renderGroundhopperProfilePanel`
- `window.DataHub`
- `window.ensureCiviCareerRulesLoaded`
- `window.CivicationUI`
- `window.HGKnowledgeEngine`
- `window.hgKnowledgeReport`
- `window.HistoryGoAHAAuth`
- `window.location.href`
- Leaflet-globalen `L`
- `PROFILE_MAP` og `PROFILE_LAYER` i filscope

### 3.3 Data som lastes på nytt

Profilboot laster eksplisitt:

```js
window.DataHub?.loadPeopleBase?.() || window.DataHub?.loadPeople?.()
window.DataHub?.loadPlacesBase?.() || window.DataHub?.loadPlaces?.()
window.DataHub?.loadBadges?.()
```

I tillegg kan render-funksjoner lese/lage rapporter fra:

- `window.HGKnowledgeEngine.run({ cache: "default" })`
- `window.getTriviaUniverse()`
- `window.getNextUpProfileSummary()`
- Civication rules/UI via Civication scripts
- localStorage-baserte profiler, quiz, merits, notes, dialogs, groundhopper og AHA-state

DataHub har intern fetch-cache, så dobbel lasting er ofte dempet på nettverksnivå. Kollisjonen er likevel at profileboot overskriver globale runtime-arrays og starter tunge renderløp uavhengig av index sin `bootCritical()`/`bootBackground()`-rekkefølge.

### 3.4 DOM-id-er `profile.js` forventer

Hovedlisten under bør regnes som profilside-kontrakt. En intern view må enten rendere disse id-ene eller refaktorere funksjonene til å ta en root/container.

- Profil/statistikk: `profileName`, `statVisited`, `statQuizzes`, `statStreak`, `statVisitedLabel`, `statQuizzesLabel`, `pcValue`
- NextUp/AHA/kunnskap: `nextUpProfileCard`, `nextUpProfileMeta`, `nextUpProfileChoices`, `nextUpProfilePath`, `btnOpenAHA`, `latestKnowledgeBox`, `lkTopic`, `lkCategory`, `conceptGrid`, `nextWhySection`, `nextWhyText`, `ahaSummary`, `ahaTopConcept`, `ahaTopMeta`
- Groundhopper: `groundhopperProfilePanel`, `groundhopperEmpty`, `groundhopperBody`, `groundhopperTopline`, `groundhopperStatGrid`, `groundhopperClubsLine`, `groundhopperLastVisited`, `groundhopperAchievements`, `groundhopperRecentList`, `groundhopperVisitedHint`, `groundhopperVisitedList`
- Merker/modal: `merits`, `badgeModal`
- Samling/tidslinje: `peopleGrid`, `collectionGrid`, `timelineBody`, `timelineProgressBar`, `timelineProgressText`, `collectionCardsBody`
- Civication: `civicationSection`, `civicationCard`, `civiRoleTitle`, `civiRoleDetails`, `civiSalaryLine`, `civiMeritLine`, `civiBurnoutStatus`, `civiOfferBox`, `civiOfferTitle`, `civiOfferMeta`, `civiShopBox`, `civiPcBalance`, `civiShopHint`, `civiShopPacks`, `civiStyleCounts`, `civiInboxBox`, `civiMailSubject`, `civiMailText`, `civiMailChoices`, `civiChoiceA`, `civiChoiceB`, `civiChoiceC`, `civiChoiceOK`, `civiMailFeedback`, `btnCiviOpen`, `btnCiviRanking`, `btnCiviWorld`
- View/tabs/kart: `map`, `.profile-tab`, `.profile-tab-panel`
- Profilvalg: `editProfileBtn`, `editProfileBtnBottom`, `exportProfileBtn`, `resetProfileBtn`, `languageSelect`

### 3.5 Funksjoner som kan gjenbrukes i index senere

Disse kan være kandidater hvis de først får en tydelig kontrakt og ikke antar global DOM:

- `getVisitedPlaceIds()` og `getCollectedPeopleIds()` som rene localStorage-lesere
- `getCompletedQuizUnitCount()` og `getCompletedPlaceCount()` for summary-statistikk
- `renderProfileCard()` i omskrevet form med container/root
- `renderPC()` defensivt, hvis Civication-wallet er valgfri
- `renderPeopleCollection()` og `renderPlacesCollection()` etter at popup-callbacks injiseres
- `renderMerits()` etter at badge-modal-eierskap er avklart med index sin badge-UI
- `renderGroundhopperProfilePanel()` som egen valgfri subkomponent senere

### 3.6 Funksjoner som kolliderer med index-runtime

Disse bør ikke flyttes direkte:

- `setupProfileMap()` og `updateProfileMarkers()` fordi de initierer Leaflet på `#map`, mens index allerede eier `#map` via `HGMap`/`MAP`.
- Hoved-`DOMContentLoaded` fordi den laster data, setter globale arrays, starter Civication og binder globale events.
- `window.showPersonPopup = window.showPersonPopup || (() => {})` og tilsvarende for place, fordi index allerede har popup-/place-card-kontrakter.
- `renderMerits()`/`openBadgeModal()` fordi index har eget badge/modal-eierskap.
- `window.CivicationUI?.init?.()` i profilboot fordi Civication er dokumentert som egen runtimegren.
- `window.location.href`-fallback i AHA-knapp og Civication-lenker bør ikke være en intern view-sideeffekt uten routerbeslutning.

---

## 4. Kollisjonsrisikoer

| Risiko | Konkret område | Hvorfor det er en risiko | Tiltak før migrering |
| --- | --- | --- | --- |
| Dobbel kart-init | `profile.html` har `<div id="map">`; `setupProfileMap()` kjører `L.map("map")`; index har også `#map` og `HGMap.initMap({ containerId: "map" })`. | To kartmotorer forventer samme DOM-id og ulike API-er (`Leaflet` vs index `HGMap`). | Ikke flytt profilkart i P1-P4. Lag separat map-adapter eller bruk index-kartet med eget lag senere. |
| Dobbel DataHub-lasting | `profile.js` laster `loadPeopleBase`, `loadPlacesBase`, `loadBadges`; index critical/background laster places/people/nature/lesespor. | Kan overskrive `window.PLACES`/`window.PEOPLE` med annen datakilde/rekkefølge og skape timingbugs. | Intern ProfileView bør lese eksisterende `window.PLACES` først og kun etterspørre manglende data defensivt. |
| Dobbel badge-lasting | Profil laster `loadBadges()` og har egen modal; index har badge-UI-filer. | To modaler og to badge-kontrakter kan gi ulik tier/progressvisning. | Vent med merker; flytt først når badge-eierskap er samlet. |
| Globale PEOPLE/PLACES/BADGES | `profile.js` definerer `var PEOPLE/PLACES/BADGES` og setter `window.*`. | Index bruker samme globale navn som runtime-data. | Ikke co-load `js/profile.js` i index. Ekstraher rene helpers i ny fil senere. |
| localStorage-state | Profil leser `visited_places`, `people_collected`, `quiz_progress`, `hg_learning_log_v1`, `merits_by_category`, `user_*`, AHA, Civication og groundhopper. | Delt state er ønsket, men renderne antar ulik historikkform og kan telle ulikt fra mini-profile. | Dokumenter én canonical progress-leser før summary blir offisiell. |
| Civication UI | `profile.html` laster mange Civication-scripts; `profile.js` kaller `CivicationUI.init/render/renderInbox`. | Civication er dokumentert som egen runtime. Co-load kan binde events/render i index uforutsigbart. | Hold Civication ute; vis kun lenke/status senere. |
| Mini-profile | `index.html` har mini-profile-lenke til `profile.html`; `mini-profile.js` bruker `PEOPLE`, `PLACES`, `BADGES` og `updateProfile`. | Intern `#/profile` kan endre navigasjonsmønster, men mini-profile må fortsatt fungere før background data er ferdig. | Ikke endre mini-profile i første analyse. Senere endres lenke til `#/profile` kun når fallback er klar. |
| CSS-klasser | `body.profile-page`, `profile-dashboard-v2`, `map-only`, `site-header`, `map-controls`, `modal`, `btn`, `secondary`. | Index har `body.hg-app`, egen `site-header`, `map-controls`, modaler og map-state-klasser. | Scope ny ProfileView under egen root (`.hg-profile-view`) og unngå body-avhengighet. |
| DOM-id-er mangler i index | De fleste profile-id-er finnes ikke i index. | Direkte kjøring av render-funksjoner blir no-op noen steder og krasj/feilbinding andre steder. | Bruk container-parametre eller dedikert view-template. |
| DOMContentLoaded-logikk | `profile.js` starter alt ved page load. | Interne views trenger mount/unmount, ikke global page boot. | Ikke importer `profile.js`; lag ny `ProfileView.js` som egen lifecycle. |

---

## 5. Anbefalt migreringsstrategi

### Vurdering av første interne ProfileView-type

| Alternativ | Vurdering |
| --- | --- |
| A. Ekte intern view | Riktig endemål, men for stort som første steg hvis hele dashboardet tas med. |
| B. Wrapper som lenker til `profile.html` | Tryggest teknisk, men gir liten verdi utover dagens router-fallback. Kan være midlertidig fallback. |
| C. iframe/fallback | Bør unngås. Gir dobbel app i app, dårlig historie med kart, CSS, fokus og localStorage-events. |
| D. Bare profilsummary i index først | **Anbefales.** Gir en ekte intern view med lav risiko: navn, steder, quizsett, streak, PC hvis tilgjengelig og lenke til full profil. Ingen profilkart, ingen Civication-render, ingen tabs. |

### Faseplan

#### Phase P0 — Plan og kontrakt (nå)

- Dokumenter eierskap, kollisjoner og ikke-flytt-liste.
- Ikke endre runtime.

#### Phase P1 — Skjelett senere

- Lag `js/views/ProfileView.js` som en liten lifecycle-modul med `showProfileSummary()`/`hideProfile()` eller tilsvarende.
- Den skal ikke importere/kjøre `js/profile.js`.
- Den skal ikke opprette kart.
- Den skal ikke laste Civication.
- Den kan rendere i en egen root under index-shell, f.eks. `#appViewLayer` hvis en slik root først etableres, eller en ny dedikert container godkjennes.

#### Phase P2 — Router fallback senere

- Legg til `#/profile` i `AppRouter`, men behold fallback-lenke til `profile.html` i viewet.
- Mini-profile kan fortsatt peke til `profile.html` inntil `#/profile` er testet.
- Hvis `ProfileView` ikke finnes eller feiler, skal router sende brukeren til `profile.html`.

#### Phase P3 — Enkel summary senere

- Render kun:
  - navn
  - antall besøkte steder
  - antall quizsett
  - streak
  - PC hvis `getPCWallet` er tilgjengelig
  - knapper: “Åpne full profil” og “Til kartet”
- Bruk eksisterende `window.PLACES` hvis lastet; ikke tving full `DataHub.loadPlacesBase()` i critical path.

#### Phase P4 — Samling/merker senere

- Flytt samling og merker etter at rendererne er gjort container-baserte.
- Avklar om badge-modal skal eies av index badge-systemet eller profilkomponent.

#### Phase P5 — Profilkart separat senere

- Vurder om profilkart skal være:
  - eget lag i index-kartet, eller
  - kartløs liste/filtrering, eller
  - fortsatt kun på `profile.html`.
- Ikke initier Leaflet i index så lenge index-kartet eies av `HGMap`.

#### Phase P6 — Civication/groundhopper/kunnskap senere

- Flyttes bare når hvert panel har egen adapter og lifecycle.
- Civication bør trolig forbli egen side lengst.

---

## 6. Første trygge patch senere

Første trygge runtime-patch, etter godkjenning, bør være minimal:

1. Opprett `js/views/ProfileView.js` med en tom/skjelett API, for eksempel:
   - `showSummary()`
   - `hide()`
   - `isAvailable()`
2. Ikke legg inn eksisterende `js/profile.js`.
3. Ikke legg inn Leaflet.
4. Ikke flytt DOM fra `profile.html`.
5. Ikke flytt Civication.
6. Legg eventuelt til en trygg routergren for `#/profile` som:
   - viser summary hvis `window.HGProfileView` finnes
   - ellers navigerer til `profile.html`
7. La `profile.html` forbli fullprofil og kanonisk fallback.

Denne patchen skal kunne revertes uten å påvirke `#/map`, `#/place/:id` eller `#/quiz/:id`.

---

## 7. Hva som eksplisitt ikke bør flyttes ennå

Ikke flytt dette i første interne profilfase:

- `profile.html` som full HTML-side
- `js/profile.js` som hel fil
- `setupProfileMap()` / `updateProfileMarkers()`
- Leaflet CSS/JS fra `profile.html`
- `badgeModal` og full `renderMerits()`-modalflyt
- Civication-scriptlisten og `CivicationUI.init()`
- `knowledgeEnginePanel` / `HGKnowledgeEngine.run()`-dashboardet
- groundhopper-panelet
- tab-systemet som global DOMContentLoaded-init
- CSS/body-modusene `profile-page` og `map-only`
- endringer i service worker, boot, datafiler eller TypeScript-konvertering

---

## Beslutningsregel

En intern ProfileView kan starte når den er en liten index-native view med egen lifecycle. Den skal ikke være `profile.html` injisert inn i index, og den skal ikke co-loade `js/profile.js`.
