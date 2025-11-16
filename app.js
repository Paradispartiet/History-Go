// =====================================================
// HISTORY GO — KAPITTELSTRUKTUR (A–N)
// Dette er den endelige og faste strukturen for app.js
// =====================================================
//
// 📚 KAPITTEL A — Data, state & storage
//   • Konstanter
//   • Global state
//   • LocalStorage-objekter
//   • saveVisited()
//   • savePeople()
//   • saveMerits()
//   • saveQuizzes()
//   • showToast()
//


// =====================================================
// KAPITTEL A — DATA, STATE & STORAGE
// =====================================================

// -------------------------------
// 1. GLOBAL STATE
// -------------------------------
let PLACES  = [];
let PEOPLE  = [];
let BADGES  = {};
let ROUTES  = [];

let userPos = null;        // { lat, lon }
let liveMode = false;      // real-time updates on/off


// -------------------------------
// 2. LOCALSTORAGE – LES INN EKSISTERENDE DATA
// -------------------------------
// Alt lastes én gang og holdes i minnet.
// Lagres på nytt etter endringer.

const VISITED = JSON.parse(localStorage.getItem("visited_places") || "{}");
const COLLECTED = JSON.parse(localStorage.getItem("people_collected") || "{}");
const MERITS = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
const QUIZZES = JSON.parse(localStorage.getItem("completed_quizzes") || "{}");


// -------------------------------
// 3. LAGRE-FUNKSJONER
// -------------------------------

function saveVisited() {
  localStorage.setItem("visited_places", JSON.stringify(VISITED));
}

function savePeople() {
  localStorage.setItem("people_collected", JSON.stringify(COLLECTED));
}

function saveMerits() {
  localStorage.setItem("merits_by_category", JSON.stringify(MERITS));
}

function saveQuizzes() {
  localStorage.setItem("completed_quizzes", JSON.stringify(QUIZZES));
}


// -------------------------------
// 4. TOAST-MELDINGER (standardisert)
// -------------------------------
// Brukes gjennom hele appen.
// Ren, ikke-blokkerende, forsvinner selv.

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "hg-toast";
  t.textContent = msg;

  document.body.appendChild(t);

  // Fade ut
  setTimeout(() => {
    t.style.opacity = "0";
    t.style.transform = "translateY(-8px)";
  }, 1800);

  // Fjern helt
  setTimeout(() => t.remove(), 2500);
}



// 📚 KAPITTEL B — DOM-cache & kategorier
//   • el = { … }
//   • norm()
//   • catColor()
//   • catClass()
//   • tagToCat()
//   • catIdFromDisplay()
//





// =====================================================
// KAPITTEL B — DOM-CACHE & KATEGORIER
// =====================================================

// -------------------------------
// 1. DOM-CACHE
// -------------------------------
// Én gang, én struktur, aldri mer leting i DOM.
// Alt som brukes videre i appen må inn her.

const el = {
  map:               document.getElementById("map"),
  placeCard:         document.getElementById("placeCard"),
  nearbyList:        document.getElementById("nearbyList"),
  collectionGrid:    document.getElementById("collectionGrid"),
  galleryGrid:       document.getElementById("galleryGrid"),
  sheets:            document.querySelectorAll(".hg-sheet"),
  sheetOverlay:      document.getElementById("sheetOverlay"),
  miniProfile:       document.getElementById("miniProfile"),
  quizContainer:     document.getElementById("quizContainer"),
  quizInner:         document.getElementById("quizInner")
};


// -------------------------------
// 2. RENE KATEGORI-ID'ER (fra #84 som er endelig)
// -------------------------------
// Disse brukes overalt: kort, markører, badges, profil, quiz.

const CATEGORY_LIST = [
  "historie",
  "vitenskap",
  "kunst",
  "musikk",
  "natur",
  "sport",
  "by",
  "politikk",
  "populaerkultur",
  "subkultur"
];


// -------------------------------
// 3. NORMALISERING
// -------------------------------
// Unngår feil ved matching av kategorier.

function norm(str) {
  return (str || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}


// -------------------------------
// 4. KATEGORIFARGER
// -------------------------------
// Brukes til markører, kort, badges, rammer, grafer.
// Fargene her MÅ gjenspeile dine badge-ikoner.

function catColor(id) {
  switch (id) {
    case "historie":        return "#D4A373";
    case "vitenskap":       return "#4FB0E8";
    case "kunst":           return "#E86BB0";
    case "musikk":          return "#F2C75B";
    case "natur":           return "#6ECF7A";
    case "sport":           return "#4FD1A1";
    case "by":              return "#A6A6A6";
    case "politikk":        return "#FF8A47";
    case "populaerkultur":  return "#A67CFF";
    case "subkultur":       return "#E25555";
    default:                return "#888";
  }
}


// -------------------------------
// 5. KATEGORI-KLASSER
// -------------------------------
// CSS-hook for farge/tema.

function catClass(id) {
  return "cat-" + norm(id);
}


// -------------------------------
// 6. TAG → KATEGORI-ID
// -------------------------------
// Brukes når personer har tags som "maler", "forfatter",
// "rapper", "trommeslager" og du må mappe til riktig kategori.

function tagToCat(tag) {
  if (!tag) return null;
  
  const t = norm(tag);

  if (["forfatter", "litteratur", "poet"].includes(t)) return "kunst";
  if (["maler", "skulptur", "billedkunst"].includes(t)) return "kunst";
  if (["musikk", "artist", "komponist", "band"].includes(t)) return "musikk";
  if (["miljø", "natur", "biologi"].includes(t)) return "natur";
  if (["arkitektur", "urbanisme", "byliv"].includes(t)) return "by";
  if (["politikk", "samfunn"].includes(t)) return "politikk";
  if (["sport", "idrett"].includes(t)) return "sport";
  if (["kultur", "pop"].includes(t)) return "populaerkultur";
  if (["subkultur", "underground", "graffiti"].includes(t)) return "subkultur";

  return null; // ukjent tag
}


// -------------------------------
// 7. DISPLAYLABEL → KATEGORI-ID
// -------------------------------
// Når du har skrevet “Kunst & kultur” i UI og må hente dette.

function catIdFromDisplay(label) {
  if (!label) return null;

  const n = norm(label);

  if (n.includes("kunst")) return "kunst";
  if (n.includes("vitenskap")) return "vitenskap";
  if (n.includes("historie")) return "historie";
  if (n.includes("musikk")) return "musikk";
  if (n.includes("natur")) return "natur";
  if (n.includes("sport")) return "sport";
  if (n.includes("politikk")) return "politikk";
  if (n.includes("by")) return "by";
  if (n.includes("popul")) return "populaerkultur";
  if (n.includes("sub")) return "subkultur";

  return null;
}






// 📚 KAPITTEL C — Geo & kart-motor
//   • distMeters()
//   • Kartstate-variabler
//   • initMap()
//   • setUser()
//   • linkPeopleToPlaces()
//   • drawPlaceMarkers()
//   • maybeDrawMarkers()
//   • lighten()
//   • showRouteTo(
//


// =====================================================
// KAPITTEL C — GEO & KART-MOTOR
// =====================================================


// -------------------------------------------
// 1. DISTANSEBEREGNING (Haversine)
// -------------------------------------------
function distMeters(a, b) {
  if (!a || !b) return Infinity;

  const R = 6371000; // meter
  const lat1 = a.lat * Math.PI/180;
  const lat2 = b.lat * Math.PI/180;
  const dLat = (b.lat - a.lat) * Math.PI/180;
  const dLon = (b.lon - a.lon) * Math.PI/180;

  const s =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s));
}


// -------------------------------------------
// 2. KARTSTATE
// -------------------------------------------
let mapInstance = null;
let userMarker = null;

// Markører for steder:
// placeMarkers = { [place.id]: leafletMarker }
let placeMarkers = {};


// -------------------------------------------
// 3. INIT MAP (Leaflet)
// -------------------------------------------
function initMap() {
  if (mapInstance) return;

  mapInstance = L.map("map", {
    zoomControl: false,
    attributionControl: false,
    minZoom: 12,
    maxZoom: 18
  }).setView([59.9139, 10.7522], 14); // Default: Oslo sentrum

  // Lyst og nøytralt bakgrunnskart (Carto)
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    { maxZoom: 19 }
  ).addTo(mapInstance);
}


// -------------------------------------------
// 4. SET USER POSITION ON MAP
// -------------------------------------------
function setUser(lat, lon) {
  userPos = { lat, lon };

  // Oppdater / lag brukerikon
  if (!userMarker) {
    userMarker = L.circleMarker([lat, lon], {
      radius: 7,
      color: "#FFD600",
      fillColor: "#FFD600",
      fillOpacity: 1,
      weight: 2
    }).addTo(mapInstance);
  } else {
    userMarker.setLatLng([lat, lon]);
  }

  // Sørg for at markører oppdateres
  maybeDrawMarkers();
}


// -------------------------------------------
// 5. LINK PERSONER ↔ STEDER
// -------------------------------------------
// Etter data er lastet i boot():
// place.people = [personId, personId...]

function linkPeopleToPlaces() {
  for (const p of PLACES) p.people = [];

  for (const person of PEOPLE) {
    if (Array.isArray(person.places)) {
      person.places.forEach(pid => {
        const found = PLACES.find(pl => pl.id === pid);
        if (found) found.people.push(person.id);
      });
    }
  }
}


// -------------------------------------------
// 6. TEGN ALLE MARKØRER (en gang)
// -------------------------------------------
function drawPlaceMarkers() {
  if (!mapInstance || placeMarkers.__drawn) return;

  PLACES.forEach(place => {
    const icon = L.divIcon({
      className: "hg-marker " + catClass(place.category),
      html: `<div class="dot"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const m = L.marker([place.lat, place.lon], { icon })
      .on("click", () => openPlaceCard(place));

    placeMarkers[place.id] = m;
    m.addTo(mapInstance);
  });

  placeMarkers.__drawn = true; // forhindrer duplikater
}


// -------------------------------------------
// 7. DYNAMISK MARKER-SYNKRONISERING
// -------------------------------------------
// Hver gang posisjonen endres, kjører denne
// for å justere lysstyrke / fremheving.

function maybeDrawMarkers() {
  if (!userPos) return;
  if (!placeMarkers.__drawn) drawPlaceMarkers();

  const u = userPos;

  for (const p of PLACES) {
    const m = placeMarkers[p.id];
    if (!m) continue;

    const dist = distMeters(u, { lat: p.lat, lon: p.lon });

    // Lysere hvis innen radius
    if (dist <= p.r) {
      lighten(m, true);
    } else {
      lighten(m, false);
    }
  }
}


// -------------------------------------------
// 8. LIGHTEN (visuell effekt)
// -------------------------------------------
function lighten(marker, active = false) {
  const el = marker.getElement();
  if (!el) return;

  if (active) {
    el.classList.add("active-marker");
  } else {
    el.classList.remove("active-marker");
  }
}


// -------------------------------------------
// 9. ROUTING
// -------------------------------------------
// Viser rute fra bruker → sted (Leaflet Routing Machine).

function showRouteTo(place) {
  if (!userPos) return showToast("📍 Ingen posisjon ennå");

  // Krever Leaflet Routing Machine:
  L.Routing.control({
    waypoints: [
      L.latLng(userPos.lat, userPos.lon),
      L.latLng(place.lat, place.lon)
    ],
    lineOptions: {
      addWaypoints: false,
      extendToWaypoints: false,
      missingRouteTolerance: 0
    },
    routeWhileDragging: false,
    createMarker: () => null
  }).addTo(mapInstance);
}







// 📚 KAPITTEL D — Posisjon & globale events
//   • requestLocation()
//   • enableLivePositionUpdates()
//   • testToggle-handler
//   • updateNearby-event
//


// =====================================================
// KAPITTEL C — GEO & KART-MOTOR
// =====================================================


// -------------------------------------------
// 1. DISTANSEBEREGNING (Haversine)
// -------------------------------------------
function distMeters(a, b) {
  if (!a || !b) return Infinity;

  const R = 6371000; // meter
  const lat1 = a.lat * Math.PI/180;
  const lat2 = b.lat * Math.PI/180;
  const dLat = (b.lat - a.lat) * Math.PI/180;
  const dLon = (b.lon - a.lon) * Math.PI/180;

  const s =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1) * Math.cos(lat2) *
    Math.sin(dLon/2) * Math.sin(dLon/2);

  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1-s));
}


// -------------------------------------------
// 2. KARTSTATE
// -------------------------------------------
let mapInstance = null;
let userMarker = null;

// Markører for steder:
// placeMarkers = { [place.id]: leafletMarker }
let placeMarkers = {};


// -------------------------------------------
// 3. INIT MAP (Leaflet)
// -------------------------------------------
function initMap() {
  if (mapInstance) return;

  mapInstance = L.map("map", {
    zoomControl: false,
    attributionControl: false,
    minZoom: 12,
    maxZoom: 18
  }).setView([59.9139, 10.7522], 14); // Default: Oslo sentrum

  // Lyst og nøytralt bakgrunnskart (Carto)
  L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    { maxZoom: 19 }
  ).addTo(mapInstance);
}


// -------------------------------------------
// 4. SET USER POSITION ON MAP
// -------------------------------------------
function setUser(lat, lon) {
  userPos = { lat, lon };

  // Oppdater / lag brukerikon
  if (!userMarker) {
    userMarker = L.circleMarker([lat, lon], {
      radius: 7,
      color: "#FFD600",
      fillColor: "#FFD600",
      fillOpacity: 1,
      weight: 2
    }).addTo(mapInstance);
  } else {
    userMarker.setLatLng([lat, lon]);
  }

  // Sørg for at markører oppdateres
  maybeDrawMarkers();
}


// -------------------------------------------
// 5. LINK PERSONER ↔ STEDER
// -------------------------------------------
// Etter data er lastet i boot():
// place.people = [personId, personId...]

function linkPeopleToPlaces() {
  for (const p of PLACES) p.people = [];

  for (const person of PEOPLE) {
    if (Array.isArray(person.places)) {
      person.places.forEach(pid => {
        const found = PLACES.find(pl => pl.id === pid);
        if (found) found.people.push(person.id);
      });
    }
  }
}


// -------------------------------------------
// 6. TEGN ALLE MARKØRER (en gang)
// -------------------------------------------
function drawPlaceMarkers() {
  if (!mapInstance || placeMarkers.__drawn) return;

  PLACES.forEach(place => {
    const icon = L.divIcon({
      className: "hg-marker " + catClass(place.category),
      html: `<div class="dot"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    const m = L.marker([place.lat, place.lon], { icon })
      .on("click", () => openPlaceCard(place));

    placeMarkers[place.id] = m;
    m.addTo(mapInstance);
  });

  placeMarkers.__drawn = true; // forhindrer duplikater
}


// -------------------------------------------
// 7. DYNAMISK MARKER-SYNKRONISERING
// -------------------------------------------
// Hver gang posisjonen endres, kjører denne
// for å justere lysstyrke / fremheving.

function maybeDrawMarkers() {
  if (!userPos) return;
  if (!placeMarkers.__drawn) drawPlaceMarkers();

  const u = userPos;

  for (const p of PLACES) {
    const m = placeMarkers[p.id];
    if (!m) continue;

    const dist = distMeters(u, { lat: p.lat, lon: p.lon });

    // Lysere hvis innen radius
    if (dist <= p.r) {
      lighten(m, true);
    } else {
      lighten(m, false);
    }
  }
}


// -------------------------------------------
// 8. LIGHTEN (visuell effekt)
// -------------------------------------------
function lighten(marker, active = false) {
  const el = marker.getElement();
  if (!el) return;

  if (active) {
    el.classList.add("active-marker");
  } else {
    el.classList.remove("active-marker");
  }
}


// -------------------------------------------
// 9. ROUTING
// -------------------------------------------
// Viser rute fra bruker → sted (Leaflet Routing Machine).

function showRouteTo(place) {
  if (!userPos) return showToast("📍 Ingen posisjon ennå");

  // Krever Leaflet Routing Machine:
  L.Routing.control({
    waypoints: [
      L.latLng(userPos.lat, userPos.lon),
      L.latLng(place.lat, place.lon)
    ],
    lineOptions: {
      addWaypoints: false,
      extendToWaypoints: false,
      missingRouteTolerance: 0
    },
    routeWhileDragging: false,
    createMarker: () => null
  }).addTo(mapInstance);
}













// 📚 KAPITTEL E — Sted- og personkort
//   • googleUrl()
//   • pulseMarker()
//   • openPlaceCard()
//   • openPlaceCardByPerson()
//   • pcClose()
//

// =====================================================
// KAPITTEL E — STED- OG PERSONKORT
// =====================================================
//
// Dette kapittelet håndterer:
//   • Åpning av steds-kort (placeCard)
//   • Åpning av kort via person (kobler person → sted)
//   • Pulse av markør på kartet
//   • Google Maps-lenke
//   • Lukking av kort
//
// Ingen lagring skjer i dette kapittelet.
// Ingen quiz, ingen belønning, ingen listevisning.
// Dette kapittelet er 100% ren visning + interaksjon.
// =====================================================


// -------------------------------------------
// 1. GOOGLE MAPS-LENKE FOR STED
// -------------------------------------------
function googleUrl(place) {
  if (!place) return "#";
  return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`;
}


// -------------------------------------------
// 2. PULSE-EFFEKT PÅ MARKØR
// -------------------------------------------
// Brukes når kort åpnes for å fremheve markøren i kartet.

function pulseMarker(placeId) {
  const marker = placeMarkers[placeId];
  if (!marker) return;

  const el = marker.getElement();
  if (!el) return;

  el.classList.add("pulse-once");
  setTimeout(() => el.classList.remove("pulse-once"), 600);
}


// -------------------------------------------
// 3. ÅPNE STEDSKORT DIREKTE
// -------------------------------------------
function openPlaceCard(place) {
  if (!place || !el.placeCard) return;

  // Pulse på kartet
  pulseMarker(place.id);

  // Sett kategori
  el.placeCard.dataset.cat = place.category;

  // Bygg HTML (kun det dette kapittelet skal gjøre)
  el.placeCard.innerHTML = `
    <div class="pc-main">
      <img src="${place.cardImage || place.image}" class="pc-img">

      <div class="pc-info">
        <h2 class="pc-title">${place.name}</h2>
        <div class="pc-year">${place.year || ""}</div>
        <p class="pc-desc">${place.desc || ""}</p>
      </div>
    </div>

    <div class="pc-actions">
      <a href="${googleUrl(place)}" class="pc-btn" target="_blank">Åpne i Maps</a>
      <button class="pc-btn pc-quiz" data-place="${place.id}">Ta quiz</button>
    </div>

    <button class="pc-close" onclick="pcClose()">✕</button>
  `;

  // Vis kortet
  el.placeCard.setAttribute("aria-hidden", "false");
}


// -------------------------------------------
// 4. ÅPNE KORT VIA PERSON
// -------------------------------------------
// Når man trykker på en person i popup → finn sted og åpne kortet.

function openPlaceCardByPerson(person) {
  if (!person) return;

  // Person peker på ett eller flere steder
  const placeId = person.placeId || (Array.isArray(person.places) ? person.places[0] : null);
  if (!placeId) return;

  const place = PLACES.find(p => p.id === placeId);
  if (place) openPlaceCard(place);
}


// -------------------------------------------
// 5. LUKK STEDSKORT
// -------------------------------------------
function pcClose() {
  if (el.placeCard) {
    el.placeCard.setAttribute("aria-hidden", "true");
  }
}












// 📚 KAPITTEL F — Listevisninger
//   • renderPlaceCard()
//   • renderNearbyPlaces()
//   • buildSeeMoreNearby()
//   • seeMore-click-handler
//




















// 📚 KAPITTEL G — Samling & galleri
//   • renderCollection()
//   • renderGallery()
//
// 📚 KAPITTEL H — Merker & nivåer
//   • ensureBadgesLoaded()
//   • pulseBadge()
//   • updateMeritLevel()
//   • addCompletedQuizAndMaybePoint()
//
// 📚 KAPITTEL I — Klikk-delegasjon & sheets
//   • openSheet()
//   • closeSheet()
//   • document-click
//   • [data-close]
//   • handleBadgeClick()
//
// 📚 KAPITTEL J — Mini-profil & profilhjelpere
//   • initMiniProfile()
//   • showQuizHistory()
//   • wireMiniProfileLinks()
//
// 📚 KAPITTEL K — Boot
//   • boot()
//   • DOMContentLoaded
//
// 📚 KAPITTEL L — Kartmodus
//   • enterMapMode()
//   • exitMapMode()
//
// 📚 KAPITTEL M — Quiz
//   • QUIZ_FILE_MAP
//   • loadQuizForCategory()
//   • ensureQuizUI()
//   • openQuiz()
//   • closeQuiz()
//   • startQuiz()
//   • markQuizAsDone()
//   • runQuizFlow()
//
// 📚 KAPITTEL N — Reward-popups
//   • showRewardPerson()
//   • showRewardPlace()
//
// =====================================================
// SLUTT PÅ KAPITTELSTRUKTUR
// =====================================================
