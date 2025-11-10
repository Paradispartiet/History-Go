/History-Go/
│
├── index.html              ← hovedapp (kart, seksjoner, mini-profil)
├── profile.html            ← full profilside (merker, personer, steder, tidslinje)
├── sw.js                   ← service worker (cache og offline)
│
│
├── js/                     ← all logikk (modulbasert)
│   ├── core.js             ← grunnstruktur, lasting av JSON, lagring
│   ├── app.js              ← hovedlogikk og oppstart (initApp)
│   ├── map.js              ← Leaflet-kart, markører, ruter
│   ├── ui.js               ← overlays, sheets, toasts, animasjoner
│   ├── quiz.js             ← quizflyt, spørsmål, poeng, merker
│   ├── profile.js          ← mini-profil + full profilvisning og eksport
│   └── data.js             ← caching, filtrering og datakoblinger
│
│
├── css/
│   └── theme.css           ← full stilpakke for hele appen
│
│
├── data/                   ← alle JSON-data
│   ├── places.json
│   ├── people.json
│   ├── badges.json
│   ├── routes.json
│   ├── settings.json
│   │
│   ├── quiz_by.json
│   ├── quiz_historie.json
│   ├── quiz_kunst.json
│   ├── quiz_litteratur.json
│   ├── quiz_musikk.json
│   ├── quiz_naeringsliv.json
│   ├── quiz_natur.json
│   ├── quiz_politikk.json
│   ├── quiz_populaerkultur.json
│   ├── quiz_sport.json
│   ├── quiz_subkultur.json
│   └── quiz_vitenskap.json
│
│
├── bilder/                 ← alle bilder og ikoner
│   ├── logo_historygo.PNG  ← hovedlogo
│   ├── nft_kort            ← spesialkort
│   │
│   ├── merker/             ← kategori-merker
│   │   ├── by.PNG
│   │   ├── kunst.PNG
│   │   ├── litteratur.PNG
│   │   ├── musikk.PNG
│   │   ├── natur.PNG
│   │   ├── politikk.PNG
│   │   ├── populaerkultur.PNG
│   │   ├── sport.PNG
│   │   ├── subkultur.PNG
│   │   ├── subkultur2.PNG
│   │   └── vitenskap.PNG
│   │
│   └── kort/
│       └── people/          ← personkort (framside/bakside)
│           ├── Collett_fram.PNG
│           ├── Collett_bak.PNG
│           ├── camilla_collett.PNG
│           ├── grete_waitz.PNG
│           ├── gro_harlem.PNG
│           ├── jens_stoltenberg.PNG
│           ├── kristian_birkeland.PNG
│           ├── may_britt_moser.PNG
│           ├── niels_henrik_abel.PNG
│           ├── ole_koppen.PNG
│           ├── ronny_deila.PNG
│           ├── mats_zuccarello.PNG
│           ├── luse_frants.PNG
│           ├── lusefrants_vaterland.PNG
│           ├── klanen_intility.PNG
│           └── Krasznahorkai.PNG
│
│
└── assets/ (valgfritt, fremtidig)
    ├── fonts/              ← lokale skrifttyper
    └── icons/              ← små vektor-ikoner for UI

// ============================================================
// === README: SYSTEMOVERSIKT OG APP-FLYT =====================
// ============================================================
//
// 🧩 HISTORY GO – MODULOVERSIKT
//
//  DATA-LAGET (/data/*.json)
//   ├─ places.json        → steder
//   ├─ people.json        → personer
//   ├─ badges.json        → merker og valørgrenser
//   ├─ routes.json        → ruter på kartet
//   ├─ quiz_*.json        → quizer per kategori
//   └─ settings.json      → generell konfig
//
//   ↳ lastes via core.boot() → lagres i HG.data
//
// ------------------------------------------------------------
//
//  LOGIKK-LAGET (/js/*.js)
//   ├─ core.js     → lasting, lagring, boot()
//   ├─ app.js      → hovedkoordinator (initApp)
//   ├─ map.js      → kart, markører, posisjon
//   ├─ ui.js       → overlays, sheets, toasts
//   ├─ quiz.js     → spørsmål, poeng, merker
//   ├─ profile.js  → mini-profil + full profilside (merker, personer, steder, tidslinje)
//   └─ data.js     → cache og filtrering
//
//   ↳ binder sammen DATA → VISNING via HG.data og events
//
// ------------------------------------------------------------
//
//  LOKAL LAGRING (localStorage)
//   user_name
//   user_color
//   visited_places
//   people_collected
//   merits_by_category
//   quiz_progress
//
//   ↳ brukes for progresjon, merker og profilnivå
//
// ------------------------------------------------------------
//
//  VISNINGSLAGET (HTML / CSS)
//   index.html     → kart, ruter, mini-profil
//   profile.html   → full profilside med merker, personer, steder og tidslinje
//   css/theme.css  → farger, rammer, typografi
//
//   ↳ leser dynamiske data fra JS-modulene
//
// ------------------------------------------------------------
//
//  BRUKERGRENSESNITT
//   - Kart (Leaflet)
//   - Steder i nærheten
//   - Utforsk ruter
//   - Mini-profil med nivå
//   - Quiz-modal og sheets
//   - Tidslinje med kort
//   - Del / eksporter / nullstill
//
// ------------------------------------------------------------
//
//  BRUKERHANDLINGER
//   trykk på sted  → quiz.startQuiz()
//   fullfør quiz   → handleQuizCompletion()
//                   → addCompletedQuizAndMaybePoint()
//                   → updateMeritLevel()
//                   → addVisitedPlace()
//                   → unlockPeopleAtPlace()
//                   → window.dispatchEvent("updateProfile")
//   åpne profil    → renderProfileCard()
//   del profil     → exportProfile()
//
// ------------------------------------------------------------
//
//  PROFILSIDE
//   - profile.html lastes
//        profile.renderProfileCard()
//        profile.renderMerits()
//        profile.renderCollectedPeople()
//        profile.renderVisitedPlaces()
//        profile.renderTimelineProfile()
//        profile.exportProfile()
//        profile.resetProfileData()
//
//   Klikk på merke  → badge-modal med quiz og svar
//   Klikk på person → popup med info og kort
//   Klikk på sted   → popup med stedskort
//   Del profil      → html2canvas → PNG
//   Nullstill data  → localStorage.clear() + updateProfile
//
// ------------------------------------------------------------
//
//  VISUELL TILBAKEMELDING
//   ui.showToast("Nytt merke!")
//   map.pulseMarker(placeId)
//   profilkort oppdateres live (updateProfile-event)
//
// ------------------------------------------------------------
//
//  FLYT
//
//   core.boot()
//     ↓
//   app.initApp()
//     ↓
//   map.initMap() + ui.initUI() + quiz.initQuizSystem() + Profile.initProfileMini()
//     ↓
//   bruker klikker sted → quiz.startQuiz()
//     ↓
//   quiz fullføres → handleQuizCompletion()
//     ↓
//   window.dispatchEvent("updateProfile")
//     ↓
//   profile.js oppdateres live (uten reload)
//
// ------------------------------------------------------------
//
//  PROFILE.JS – Mini-profil og full profilside
//   Ansvar: viser brukerinformasjon, statistikk, merker, personer, steder og tidslinje. 
//   Håndterer eksport, nullstilling og popup-vinduer.
//   Funksjoner: 
//     initProfileMini(), renderProfileCard(), renderMerits(), showBadgeModal(category),
//     renderCollectedPeople(), showPersonModal(personId), renderVisitedPlaces(), showPlaceModal(placeId),
//     renderTimelineProfile(), exportProfile(), resetProfileData().
//   Interaksjon:
//     - Klikk på merke → viser badge-modal med quiz og svar
//     - Klikk på person → viser popup med info og kort
//     - Klikk på sted → viser popup med bilde av stedskort
//     - Alt oppdateres live via window.dispatchEvent("updateProfile")
//   Viser: navn, nivå, statistikk, favorittkategori, samlede merker, personer, steder og kronologisk tidslinje.
//
// ------------------------------------------------------------
//
//  FORMÅL
//   Dette dokumentet beskriver History Go som helhet – et modulært,
//   offline-klar læringssystem som kobler sted, historie og kunnskap
//   gjennom kart, quizer og visuell progresjon.
//
// ============================================================

───────────────────────────────────────────────────────────────
🧭 HISTORY GO — PROGRESJONSSYKLUS (v3.0)
───────────────────────────────────────────────────────────────

             ┌────────────────────────────┐
             │        1. UTFORSK          │
             │  Bruker åpner et sted      │
             │  i kart eller nær-liste    │
             └──────────────┬─────────────┘
                            │
                            ▼
                   map.openPlaceCard()
                            │
                            ▼
             ┌────────────────────────────┐
             │        2. START QUIZ       │
             │  quiz.startQuiz(placeId)   │
             │  → laster quiz_*.json      │
             │  → viser modal             │
             └──────────────┬─────────────┘
                            │
                            ▼
                      quiz.runQuizFlow()
                            │
                            ▼
             ┌────────────────────────────┐
             │        3. FULLFØR QUIZ     │
             │  finalizeQuizResult()      │
             │  → lagrer quiz_progress    │
             │  → tildeler poeng          │
             │  → legger til sted         │
             │  → låser opp personer      │
             └──────────────┬─────────────┘
                            │
                            ▼
                    🎯 RESULTAT LAGRES
        localStorage:
          • quiz_progress
          • merits_by_category
          • visited_places
          • people_collected
                            │
                            ▼
             ┌────────────────────────────┐
             │      4. OPPDATER MERKER    │
             │  updateMeritLevel(cat)     │
             │  → beregner valør          │
             │  → viser ui.showToast()    │
             └──────────────┬─────────────┘
                            │
                            ▼
                     🏅 NYTT MERKE!
          Merits oppdatert (Bronse → Sølv → Gull)
                            │
                            ▼
             ┌────────────────────────────┐
             │     5. LIVE OPPDATERING    │
             │  app.js →                  │
             │  window.dispatchEvent(     │
             │    new Event("updateProfile") ) │
             │                              │
             │  profile.js → renderAll()    │
             └──────────────┬─────────────┘
                            │
                            ▼
                  💾 PROFIL OPPDATERT LIVE
          • Nye steder, personer og merker
          • Oppdatert nivå og poengsum
          • Tidslinje sortert på nytt
                            │
                            ▼
             ┌────────────────────────────┐
             │        6. DEL PROFIL       │
             │  html2canvas → PNG-kort    │
             │  "Historiker · nivå 4"     │
             └──────────────┬─────────────┘
                            │
                            ▼
                     🔄 TILBAKE TIL KART
           Bruker fortsetter reisen → ny quiz

───────────────────────────────────────────────────────────────
🧩 DATA → QUIZ → RESULTAT → MERKER → PROFIL → DELING
───────────────────────────────────────────────────────────────
• Hver quiz oppdaterer sted, personer og merker
• Profilen rendres live via updateProfile-eventet
• Hele systemet holdes synkronisert uten reload
───────────────────────────────────────────────────────────────
