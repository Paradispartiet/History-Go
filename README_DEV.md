# 🧭 HISTORY GO – UTVIKLERDOKUMENTASJON (`README_DEV.md`)

## 🔧 OVERSIKT
History Go består av et modulbasert klientsystem som kjører lokalt i nettleseren.  
Hver modul har ett klart ansvar og kommuniserer via det globale objektet `HG`.  
Appen fungerer uten server – alt lagres i `localStorage`.

---

## 🧩 MODULREKKEFØLGE OG AVHENGIGHETER

| Last rekkefølge | Fil | Hovedoppgave | Avhenger av |
|-----------------|------|---------------|-------------|
| 1 | **core.js** | Oppretter `HG`, laster JSON-data, starter `boot()` | – |
| 2 | **data.js** | Inneholder `HG.data` (places, people, routes, badges osv.) | core.js |
| 3 | **map.js** | Leaflet-kart, markører, ruter og zoom | Leaflet + HG.data |
| 4 | **ui.js** | Åpne/lukke sheets og modaler, vis toast | DOM |
| 5 | **quiz.js** | Quizflyt, resultater og callback til `app.handleQuizCompletion()` | app.js |
| 6 | **app.js** | Hovedlogikk for utforskmodus (kart + nærhet + ruter) | core + map + ui + quiz |
| 7 | **profile.js** | Profilside med bakgrunnskart og brukerdata | core + map + html2canvas |

---

## 📜 HTML-LASTEORDEN

### **index.html**
```html
<script src="js/core.js"></script>
<script src="js/data.js"></script>
<script src="js/map.js"></script>
<script src="js/ui.js"></script>
<script src="js/quiz.js"></script>
<script src="js/app.js"></script>
```

### **profile.html**
```html
<script src="js/core.js"></script>
<script src="js/data.js"></script>
<script src="js/map.js"></script>
<script src="js/profile.js"></script>
```

---

## 🔄 DATAFLYT OG HENDELSER

```
core.boot()
   ↓
HG.data lastes (places, people, badges, routes)
   ↓
app.initApp()
   ↓
map.initMap() + quiz.initQuizSystem()
   ↓
bruker spiller → quiz.endQuiz(result)
   ↓
app.handleQuizCompletion(result)
   ↓
localStorage oppdateres
   ↓
window.dispatchEvent("updateProfile")
   ↓
profile.js → renderAll() + oppdatert kart
```

---

## 🗺️ KARTMODUL (map.js)
- **initMap(places, routes)** oppretter Leaflet-instans.  
- **highlightNearbyPlaces(lat, lon, radius)** viser markører rundt brukeren.  
- **drawRoute(route)** tegner rutelag på kartet.  
- Benytter standardfarger fra CSS-variablene (--hist, --viten osv.).  

---

## 📱 UTFORSKMODUS (app.js)
- Viser liste over **nærmeste steder** og **ruter**.  
- Automatisk oppdatering ved geolokasjonsendring.  
- Kaller `quiz.startQuiz(placeId)` ved trykk på “Start”.  
- Fargekoder elementer etter kategori (`getCategoryColor()`).  
- Sender `updateProfile` event når poeng, meritter eller steder endres.

---

## 👤 PROFILMODUS (profile.js)
- Kart i bakgrunnen (`Leaflet`) viser brukerens besøkte steder og personer.  
- Klikk på person/sted/tidslinje → kartet zoomer inn.  
- Live-synk med forsiden via `updateProfile`-event.  
- Eksport (`html2canvas`) og nullstilling (`localStorage.clear()`).  

---

## 💾 DATASTRUKTURER (i localStorage)
| Nøkkel | Innhold |
|---------|----------|
| `visited_places` | [{ id, name, year, desc, lat, lon }] |
| `people_collected` | [{ id, name, placeId, year }] |
| `merits_by_category` | { categoryId: {points, valør} } |
| `quiz_progress` | { quizId: result objekt } |
| `user_name` / `user_color` | profilinformasjon |

---

## 🎨 STILSTANDARDER (theme.css)
- **Bakgrunn:** `--bg: #0a1929` (mørk blå)  
- **Paneler:** `--panel` med lett gjennomsiktighet og avrundede hjørner  
- **Hovedfarge:** `--accent: #FFD600`  
- **Kategorifarger:** `--hist`, `--viten`, `--kult`, `--musikk`, `--lit`, `--natur`, `--sport`, `--urban`  
- **Modaler og sheets:** bruk `.sheet`, `.modal`, `.backdrop` og `.sheet-open`  
- **Kartetikett:** `.map-label` med kategoriens fargekant  

---

## ⚙️ HENDELSESLYTTING
| Event | Sendes fra | Fanges av | Effekt |
|--------|-------------|-----------|--------|
| `updateProfile` | `app.js` | `profile.js` | oppdater profil og kart |
| `storage` | Browser (sync) | `profile.js` | oppdater når localStorage endres |
| `DOMContentLoaded` | Alle JS filer | initiering av moduler |

---

## 🧭 UTVIKLERNOTATER
- **Unngå duplikat-moduler.** Hver fil har ett ansvar.  
- **Ingen hardkoding av bilder.** Bruk `bilder/kort/{places|people}/{id}.PNG`.  
- **All progresjon skal gå via `app.handleQuizCompletion()`** for å holde statistikken korrekt.  
- **Ingen inline-farger.** Bruk CSS-variabler eller `getCategoryColor()`.  
- **Alle bilder skal være full ramme (ingen kutt).**

---

## 📦 FILSTRUKTUR (2025-11)
```
HistoryGo/
│
├── index.html
├── profile.html
├── css/
│   └── theme.css
├── js/
│   ├── core.js
│   ├── data.js
│   ├── map.js
│   ├── ui.js
│   ├── quiz.js
│   ├── app.js
│   └── profile.js
├── bilder/
│   ├── logo_historygo.PNG
│   ├── merker/
│   ├── kort/
│   │   ├── people/
│   │   └── places/
│   └── ikoner/
└── data/
    ├── places.json
    ├── people.json
    ├── routes.json
    ├── badges.json
    └── quizzes.json
```
