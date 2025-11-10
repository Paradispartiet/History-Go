# 🗺️ HISTORY GO — README v5.4

![Status](https://img.shields.io/badge/status-active-brightgreen) ![Version](https://img.shields.io/badge/version-v5.4-blue) ![Offline](https://img.shields.io/badge/offline-supported-yellow) ![License](https://img.shields.io/badge/license-CC--BY--SA--4.0-orange)

---

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
// === README: SYSTEMOVERSIKT, BRUK OG ARKITEKTUR ============
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
//   ↳ lastes via core.boot() → lagres i HG.data
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
//  LOKAL LAGRING (localStorage)
//   user_name, user_color, visited_places, people_collected, merits_by_category, quiz_progress
//   ↳ brukes for progresjon, merker og profilnivå
//
//  VISNINGSLAGET (HTML / CSS)
//   index.html     → kart, ruter, mini-profil
//   profile.html   → full profilside med merker, personer, steder og tidslinje
//   css/theme.css  → farger, rammer, typografi
//
// ============================================================
//
// 📦 INSTALLASJON
//
// 1. Klon repoet:
//    git clone https://github.com/bruker/History-Go.git
// 2. Åpne index.html i nettleser (Live Server anbefales).
// 3. Appen fungerer offline etter første lasting (sw.js håndterer cache).
//
// ============================================================
//
// 💡 BRUK
//
// - Åpne appen → se kartet.
// - Trykk på et sted for å starte quiz.
// - Få poeng og lås opp personer.
// - Gå til Profil for å se merker, steder og tidslinje.
// - Del eller eksporter profilkortet.
//
// ============================================================
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
// ============================================================
//
//  PROFILSIDE (profile.html)
//   - Profilkort (navn, farge, nivå, statistikk)
//   - Merker (trykbare ikoner, viser quiz-svar i badge-modal)
//   - Personer (runde ansikter, trykk for popup med info og kort)
//   - Steder (liste over besøkte steder med bilde av kort)
//   - Tidslinje (alle kort sortert etter year)
//   - Handlinger (Del, Eksporter, Nullstill)
//   - Modal-container (#modal) for popup-vinduer
//
//  PROFILE.JS
//   Funksjoner:
//     initProfileMini(), renderProfileCard(), renderMerits(), showBadgeModal(category),
//     renderCollectedPeople(), showPersonModal(personId), renderVisitedPlaces(), showPlaceModal(placeId),
//     renderTimelineProfile(), exportProfile(), resetProfileData().
//   Interaksjon:
//     Klikk på merke → viser badge-modal med quiz og svar.
//     Klikk på person → viser popup med info og kort.
//     Klikk på sted → viser popup med bilde av stedskort.
//     Alt oppdateres live via window.dispatchEvent("updateProfile").
//
// ============================================================
//
// ⚙️ MODUL-FUNKSJONER (UTVALG)
//
//  map.js
//   initMap() – Tegner Leaflet-kart
//   highlightNearbyPlaces() – markerer steder i nærheten
//   pulseMarker(id) – visuell feedback
//
//  quiz.js
//   startQuiz() – starter quiz for kategori/sted
//   runQuizFlow() – styrer spørsmålsrekkefølge
//   addCompletedQuizAndMaybePoint() – tildeler poeng og badge
//
//  ui.js
//   showToast(msg) – gir visuell melding
//   openSheet(id)/closeSheet(id) – styrer bunnark
//
//  core.js
//   boot() – henter JSON og starter app
//   fetchJSON(path) – laster data
//   save()/load() – lagrer til localStorage
//
// ============================================================
//
// 🔍 DATAFORMAT
//
// places.json
// {
//   "id": "observatoriet",
//   "name": "Observatoriet",
//   "lat": 59.9223,
//   "lon": 10.7351,
//   "category": "vitenskap",
//   "year": 1833,
//   "desc": "Tidligere hovedobservatorium i Oslo."
// }
//
// people.json
// {
//   "id": "camilla_collett",
//   "name": "Camilla Collett",
//   "desc": "Forfatter og forkjemper for kvinners rettigheter.",
//   "tags": ["litteratur", "historie"],
//   "placeId": "damstredet"
// }
//
// badges.json
// {
//   "id": "vitenskap",
//   "name": "Vitenskap",
//   "levels": ["Student", "Professor", "Orakel"],
//   "points": [5, 10, 20]
// }
//
// ============================================================
// 📂 DATAMALER (BASERT PÅ FAKTISKE JSON-FILER)
// ============================================================
//
// Hver modul i History Go bygger på rene JSON-filer i /data/.
// Disse fungerer som universelle maler for steder, personer,
// ruter, merker og quizer. Alle følger samme prinsipp:
//  - korte, unike id-er
//  - kategorier som samsvarer med badges.json
//  - lesbare beskrivelser og årstall der det finnes
//
// ------------------------------------------------------------
//
// 🏛 PLACES.JSON  →  STEDER PÅ KARTET
// ------------------------------------------------------------
//
// {
//   "id": "observatoriet",
//   "name": "Observatoriet",
//   "lat": 59.9223,
//   "lon": 10.7351,
//   "r": 150,
//   "category": "vitenskap",
//   "year": 1833,
//   "desc": "Tidligere hovedobservatorium i Oslo.",
//   "image": "bilder/kort/places/observatoriet.PNG"
// }
//
// ------------------------------------------------------------
//
// 👩‍🔬 PEOPLE.JSON  →  PERSONER KNYTTET TIL STEDER
// ------------------------------------------------------------
//
// {
//   "id": "camilla_collett",
//   "name": "Camilla Collett",
//   "desc": "Forfatter og forkjemper for kvinners rettigheter.",
//   "year": 1813,
//   "tags": ["litteratur", "historie"],
//   "placeId": "damstredet",
//   "image": "bilder/kort/people/camilla_collett.PNG"
// }
//
// ------------------------------------------------------------
//
// 🧩 BADGES.JSON  →  KATEGORIER OG VALØRNIVÅER
// ------------------------------------------------------------
//
// {
//   "id": "vitenskap",
//   "name": "Vitenskap",
//   "color": "#9b59b6",
//   "icon": "bilder/merker/vitenskap.PNG",
//   "levels": ["Student", "Professor", "Orakel"],
//   "points": [5, 10, 20],
//   "desc": "For innsikt i forskning, oppdagelser og teknologi."
// }
//
// ------------------------------------------------------------
//
// 🧭 ROUTES.JSON  →  TEMATISKE RUTER PÅ KARTET
// ------------------------------------------------------------
//
// {
//   "id": "vitenskapsruten",
//   "name": "Vitenskapsruten",
//   "category": "vitenskap",
//   "places": ["observatoriet", "nobelinstituttet", "polhogda"],
//   "color": "#9b59b6",
//   "desc": "En vandring gjennom Norges forskningshistorie."
// }
//
// ------------------------------------------------------------
//
// 🧪 QUIZ_*.JSON  →  SPØRSMÅL KNYTTET TIL STEDER ELLER PERSONER
// ------------------------------------------------------------
//
// {
//   "id": "observatoriet_quiz_1",
//   "categoryId": "vitenskap",
//   "placeId": "observatoriet",
//   "question": "Hva var hovedformålet med Observatoriet?",
//   "options": ["Måle tid og stjerner", "Meteorologisk forskning", "Undervisning i fysikk"],
//   "answer": "Måle tid og stjerner"
// }
//
// ------------------------------------------------------------
//
// 📦 KONVENSJONER
//
//  • Alle ID-er er små bokstaver uten mellomrom eller æøå
//  • Bildereferanser peker til /bilder/kort/ eller /bilder/merker/
//  • category-verdier må samsvare med badges.json
//  • placeId og personId må være gyldige koblinger
//  • Alle bilder skrives med store filendelser (.PNG)
//  • Hver JSON-fil kan utvides med flere felt (f.eks. "wiki" eller "audio"),
//    men systemet bruker kun dokumenterte nøkler i hovedvisningen.
//
// ------------------------------------------------------------
//
// 💾 SAMMENHENG MELLOM FILENE
//
//  places.json   →  steder på kartet
//      ⤷ people.json    →  personer tilknyttet steder
//          ⤷ quiz_*.json →  spørsmål knyttet til personer/steder
//      ⤷ routes.json    →  grupper av steder
//  badges.json   →  farger, nivåer og poengsystem
//
// ------------------------------------------------------------
//
// 🧠 BRUK I KODEN
//
//  core.js       →  fetchJSON("/data/*.json") og lagring i HG.data
//  app.js        →  initApp() kobler sammen moduler
//  map.js        →  bruker places og routes for karttegning
//  quiz.js       →  bruker quiz_*.json for spørsmål
//  profile.js    →  henter badges, places og people for profilvisning
//
// ============================================================
//
// 🧱 ARKITEKTURVALG
//
// - Vanilla JS-moduler uten rammeverk for full offline-kompatibilitet.
// - Leaflet brukes for kartlag og markører.
// - JSON-data brukes som universelt innholdslag (ingen backend kreves).
// - LocalStorage holder progresjon, merker og profil.
// - Service Worker gir cache-first ytelse og offline.
//
// ============================================================
//
//  PROFILSIDE (profile.html)
//   - Profilkort (navn, farge, nivå, statistikk)
//   - Merker (trykbare ikoner, viser quiz-svar i badge-modal)
//   - Personer (runde ansikter, trykk for popup med info og kort)
//   - Steder (liste over besøkte steder med bilde av kort)
//   - Tidslinje (alle kort sortert etter year)
//   - Handlinger (Del, Eksporter, Nullstill)
//   - Modal-container (#modal) for popup-vinduer
//
// ============================================================
//
// 🧭 PROGRESJONSSYKLUS (v3.0)
//
//             ┌────────────────────────────┐
//             │        1. UTFORSK          │
//             │  Bruker åpner et sted      │
//             │  i kart eller nær-liste    │
//             └──────────────┬─────────────┘
//                            │
//                            ▼
//                   map.openPlaceCard()
//                            │
//                            ▼
//             ┌────────────────────────────┐
//             │        2. START QUIZ       │
//             │  quiz.startQuiz(placeId)   │
//             │  → laster quiz_*.json      │
//             │  → viser modal             │
//             └──────────────┬─────────────┘
//                            │
//                            ▼
//                      quiz.runQuizFlow()
//                            │
//                            ▼
//             ┌────────────────────────────┐
//             │        3. FULLFØR QUIZ     │
//             │  finalizeQuizResult()      │
//             │  → lagrer quiz_progress    │
//             │  → tildeler poeng          │
//             │  → legger til sted         │
//             │  → låser opp personer      │
//             └──────────────┬─────────────┘
//                            │
//                            ▼
//                    🎯 RESULTAT LAGRES
//        localStorage:
//          • quiz_progress
//          • merits_by_category
//          • visited_places
//          • people_collected
//                            │
//                            ▼
//             ┌────────────────────────────┐
//             │      4. OPPDATER MERKER    │
//             │  updateMeritLevel(cat)     │
//             │  → beregner valør          │
//             │  → viser ui.showToast()    │
//             └──────────────┬─────────────┘
//                            │
//                            ▼
//                     🏅 NYTT MERKE!
//          Merits oppdatert (Bronse → Sølv → Gull)
//                            │
//                            ▼
//             ┌────────────────────────────┐
//             │     5. LIVE OPPDATERING    │
//             │  window.dispatchEvent(     │
//             │    new Event("updateProfile") ) │
//             │  profile.js → renderAll()  │
//             └──────────────┬─────────────┘
//                            │
//                            ▼
//                  💾 PROFIL OPPDATERT LIVE
//          Nye steder, personer og merker vises umiddelbart.
//
// ============================================================
//
// 🚀 ROADMAP
// - [x] Full profilside med merker, personer og tidslinje
// - [x] Live oppdatering via updateProfile-event
// - [ ] Overgang til theme.json for globale design-tokens
// - [ ] Statistikk per rute
// - [ ] Import/export av progresjon
// - [ ] Lokal highscore-liste
// - [ ] “Dagens kort” funksjon
// - [ ] Deling via QR-kode
//
// ============================================================
//
// ⚖️ LISENS
// © 2025 History Go. Publisert under Creative Commons BY-SA 4.0.
//
// ============================================================
//
// 🎨 DESIGN OG MERKEPROFIL
//
// Farger (fra theme.css):
// --bg: #0a1929
// --panel: rgba(13,27,42,.86)
// --panel-border: rgba(255,255,255,.08)
// --text: #fff
// --subtext: rgba(255,255,255,.65)
// --yellow: #FFD600
// --viten: #9b59b6
// --kult: #ffb703
// --urban: #e63946
// --natur: #4caf50
// --sport: #2a9d8f
// --hist: #344B80
//
// Typografi:
// font-family: "Inter", system-ui, sans-serif;
// Overskrifter: 600–700 vekt, brødtekst 400–500
// App-frame: sort ramme 6px, radius 18px, svak indre glød
//
// Komponenter:
// • Header – logo og appnavn
// • Kart – Leaflet med markører
// • Mini-profil – navn, nivå, statistikk
// • Quiz – modal med spørsmål og poeng
// • Merker – runde ikoner med kategori- og valørfarge
// • Person-galleri – trykkbare ansikter
// • Tidslinje – kort sortert etter årstall
// • Toasts – flytende meldinger (nytt merke!)
// • Sheets – bunnark for utvidet info
//
// Effekter:
// - Fade-in/out (toast, modal)
// - Puls (marker på kart)
// - Smooth transitions (overlay, sheets)
//
// Designfilosofi:
// Mørk bakgrunn med sterke, rene fargetoner.
// Fokus på læring, belønning og flyt.
// Offline-først og iPad-optimalisert.
// Bildekort i 2:1-format, aldri beskåret.
// Alle PNG-filer skrives med store bokstaver (.PNG).
//
// ============================================================
//
// 👤 UTVIKLET AV
// Mats Gran · 2025 · Oslo
// https://github.com/bruker/History-Go
