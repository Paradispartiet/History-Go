// =====================================================
// HISTORY GO – APP.JS (stabil produksjonsversjon v16)
// =====================================================
//
// 1.  KONSTANTER OG INIT-VARIABLER
// 2.  ELEMENTREFERANSER (DOM-cache)
// 3.  KATEGORIFUNKSJONER (farge, klasse, tag)
// 4.  GEO OG AVSTANDSBEREGNING
// 5.  BRUKERPOSISJON OG KART (ruter, markører)
// 6.  STED- OG PERSONKORT
// 7.  LISTEVISNINGER (nærområde, samling, galleri)
// 8.  MERKER, NIVÅER OG FREMGANG
// 9.  HENDELSER OG SHEETS
// 10. INITIALISERING OG BOOT
// 11. STED-OVERLAY (tekst + personer)
// 12. QUIZ – DYNAMISK LASTER, MODAL & SCORE
// =====================================================


// ==============================
// 1. KONSTANTER OG INIT-VARIABLER
// ==============================
const START = { lat: 59.9139, lon: 10.7522, zoom: 13 };
const NEARBY_LIMIT = 2;
const QUIZ_FEEDBACK_MS = 650;

let PLACES = [];
let PEOPLE = [];

const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

// progress for “+1 poeng per 3 riktige”
const userProgress    = JSON.parse(localStorage.getItem("historygo_progress") || "{}");

function saveVisited(){  localStorage.setItem("visited_places", JSON.stringify(visited));  renderCollection(); }
function savePeople(){   localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); renderGallery(); }

function showToast(msg, ms=2000){
  const t = el.toast;
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(t._hide);
  t._hide = setTimeout(()=>{ t.style.display = 'none'; }, ms);
}


// ==============================
// 2. ELEMENTREFERANSER (DOM-cache)
// ==============================
const el = {
  map:        document.getElementById('map'),
  toast:      document.getElementById('toast'),
  status:     document.getElementById('status'),

  btnSeeMap:  document.getElementById('btnSeeMap'),
  btnExitMap: document.getElementById('btnExitMap'),
  btnCenter:  document.getElementById('btnCenter'),
  test:       document.getElementById('testToggle'),

  list:       document.getElementById('nearbyList'),
  nearPeople: document.getElementById('nearbyPeople'),
  seeMore:    document.getElementById('btnSeeMoreNearby'),
  sheetNear:  document.getElementById('sheetNearby'),
  sheetNearBody: document.getElementById('sheetNearbyBody'),

  collectionGrid: document.getElementById('collectionGrid'),
  collectionCount:document.getElementById('collectionCount'),
  btnMoreCollection: document.getElementById('btnMoreCollection'),
  sheetCollection: document.getElementById('sheetCollection'),
  sheetCollectionBody: document.getElementById('sheetCollectionBody'),

  gallery:    document.getElementById('gallery'),

  // 🔧 Place Card (sheet)
  pc:         document.getElementById('placeCard'),
  pcTitle:    document.getElementById('pcTitle'),
  pcMeta:     document.getElementById('pcMeta'),
  pcDesc:     document.getElementById('pcDesc'),
  pcUnlock:   document.getElementById('pcUnlock'),
  pcRoute:    document.getElementById('pcRoute'),
  pcClose:    document.getElementById('pcClose'),
  
};

// ==============================
// 3. KATEGORIFUNKSJONER – FULL KORRESPONDANSE MED BADGES (uten "historie")
// ==============================

function norm(s = "") {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa");
}

// ------------------------------
// Farger (bruker badge-fargene)
// ------------------------------
function catColor(cat = "") {
  const c = norm(cat);
  if (c.includes("vitenskap") || c.includes("filosofi")) return "#9b59b6";
  if (c.includes("kunst") || c.includes("kultur")) return "#ffb703";
  if (c.includes("musikk") || c.includes("scene")) return "#ff66cc";
  if (c.includes("litteratur") || c.includes("poesi")) return "#f6c800";
  if (c.includes("natur") || c.includes("miljoe")) return "#4caf50";
  if (c.includes("sport") || c.includes("idrett") || c.includes("lek")) return "#2a9d8f";
  if (c.includes("by") || c.includes("arkitektur")) return "#e63946";
  if (c.includes("politikk") || c.includes("samfunn")) return "#c77dff";
  if (c.includes("populaer") || c.includes("pop")) return "#ffb703";
  if (c.includes("subkultur") || c.includes("urban")) return "#ff66cc";
  return "#9b59b6"; // fallback
}

// ------------------------------
// CSS-klasser for chips/badges
// ------------------------------
function catClass(cat = "") {
  const c = norm(cat);
  if (c.includes("vitenskap") || c.includes("filosofi")) return "vitenskap";
  if (c.includes("kunst") || c.includes("kultur")) return "kunst";
  if (c.includes("musikk") || c.includes("scene")) return "musikk";
  if (c.includes("litteratur") || c.includes("poesi")) return "litteratur";
  if (c.includes("natur") || c.includes("miljoe")) return "natur";
  if (c.includes("sport") || c.includes("idrett") || c.includes("lek")) return "sport";
  if (c.includes("by") || c.includes("arkitektur")) return "by";
  if (c.includes("politikk") || c.includes("samfunn")) return "politikk";
  if (c.includes("populaer") || c.includes("pop")) return "populaerkultur";
  if (c.includes("subkultur") || c.includes("urban")) return "subkultur";
  return "vitenskap";
}

// ------------------------------
// Kategorier brukt i quiz-fil-kartet
// ------------------------------
function tagToCat(tags = []) {
  const t = norm(Array.isArray(tags) ? tags.join(" ") : tags || "");

  // 🔹 Viktig: sjekk spesifikke kulturtyper før "kunst/kultur"
  if (t.includes("subkultur") || t.includes("urban")) return "subkultur";
  if (t.includes("populaer") || t.includes("pop")) return "populaerkultur";

  if (t.includes("vitenskap") || t.includes("filosofi")) return "vitenskap";
  if (t.includes("kunst") || t.includes("kultur")) return "kunst";
  if (t.includes("musikk") || t.includes("scene")) return "musikk";
  if (t.includes("litteratur") || t.includes("poesi")) return "litteratur";
  if (t.includes("natur") || t.includes("miljoe")) return "natur";
  if (t.includes("sport") || t.includes("idrett") || t.includes("lek")) return "sport";
  if (t.includes("by") || t.includes("arkitektur")) return "by";
  if (t.includes("politikk") || t.includes("samfunn")) return "politikk";

  return "vitenskap"; // fallback
}

// ------------------------------
// Enkel bridge for visningsnavn
// ------------------------------
function catIdFromDisplay(name = "") {
  return tagToCat(name);
}


// ==============================
// 4. GEO OG AVSTANDSBEREGNING
// ==============================
function distMeters(a,b){
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}


// ==============================
// 5. BRUKERPOSISJON OG KART (ruter, markører)
// ==============================
let MAP, userMarker, userPulse, routeLine, routeControl, placeLayer;

function setUser(lat, lon){
  if (!MAP) return;
  if (!userMarker){
    userMarker = L.circleMarker([lat,lon], {
      radius:8, weight:2, color:'#fff', fillColor:'#1976d2', fillOpacity:1
    }).addTo(MAP).bindPopup('Du er her');
    userPulse = L.circle([lat,lon], {
      radius: 25, color:'#00e676', weight:1, opacity:.6, fillColor:'#00e676', fillOpacity:.12
    }).addTo(MAP);
  } else {
    userMarker.setLatLng([lat,lon]);
    userPulse.setLatLng([lat,lon]);
  }
}

function initMap() {
  MAP = L.map('map', { zoomControl: false }).setView([START.lat, START.lon], START.zoom);
  placeLayer = L.layerGroup().addTo(MAP);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(MAP);

  MAP.whenReady(() => {
    mapReady = true;
    maybeDrawMarkers();

    // 🔧 Riktig oppsett – sørg for at kartet vises bak alt annet, men fyller hele skjermen
    const mapEl = document.getElementById('map');
    if (mapEl) {
      mapEl.style.position = 'fixed';
      mapEl.style.inset = '0';
      mapEl.style.width = '100%';
      mapEl.style.height = '100%';
      mapEl.style.zIndex = '1';
    }
  });
}

function showRouteTo(place){
  if (!MAP) return;

  const from = currentPos
    ? L.latLng(currentPos.lat, currentPos.lon)
    : L.latLng(START.lat, START.lon);
  const to = L.latLng(place.lat, place.lon);

  if (routeLine){ MAP.removeLayer(routeLine); routeLine = null; }

  try {
    if (!L.Routing) throw new Error('no LRM');
    if (routeControl){ MAP.removeControl(routeControl); routeControl = null; }

    routeControl = L.Routing.control({
      waypoints: [from, to],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://routing.openstreetmap.de/routed-foot/route/v1',
        profile: 'foot'
      }),
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: { styles: [{ color: '#cfe8ff', opacity: 1, weight: 6 }] },
      createMarker: () => null
    }).addTo(MAP);

    showToast('Rute lagt.');
  } catch(e) {
    routeLine = L.polyline([from, to], { color:'#cfe8ff', weight:5, opacity:1 }).addTo(MAP);
    MAP.fitBounds(routeLine.getBounds(), { padding:[40,40] });
    showToast('Vis linje (ingen rutetjeneste)');
  }
}

let mapReady = false;
let dataReady = false;

function maybeDrawMarkers() {
  if (mapReady && dataReady) {
    drawPlaceMarkers();
  }
}

function lighten(hex, amount = 0.35) {
  // Gjør fargen lysere ved å øke RGB-verdiene
  const c = hex.replace('#','');
  const num = parseInt(c,16);
  let r = Math.min(255, (num >> 16) + 255 * amount);
  let g = Math.min(255, ((num >> 8) & 0x00FF) + 255 * amount);
  let b = Math.min(255, (num & 0x0000FF) + 255 * amount);
  return `rgb(${r},${g},${b})`;
}

function drawPlaceMarkers() {
  if (!MAP || !PLACES.length) return;
  placeLayer.clearLayers();

  PLACES.forEach(p => {
    const isVisited = !!visited[p.id];
    const fill = isVisited ? lighten(catColor(p.category), 0.35) : catColor(p.category);
    const border = isVisited ? '#ffd700' : '#fff'; // gullkant hvis besøkt

    const mk = L.circleMarker([p.lat, p.lon], {
      radius: isVisited ? 9 : 8,
      color: border,
      weight: 2,
      fillColor: fill,
      fillOpacity: 1
    }).addTo(placeLayer);

    mk.bindTooltip(
      isVisited ? `✅ ${p.name}` : p.name,
      { permanent: false, direction: "top" }
    );

    // Klikk åpner kun overlay (ikke placeCard)
    mk.on('click', () => {
      closePlaceOverlay();
      showPlaceOverlay(p);
    });
  });
}

// ==============================
// 6. STED- OG PERSONKORT
// ==============================
let currentPlace = null;

function googleUrl(name){
  const q = encodeURIComponent(`site:no.wikipedia.org ${name} Oslo`);
  return `https://www.google.com/search?q=${q}`;
}

// Liten visuell effekt når et sted låses opp
function pulseMarker(lat, lon) {
  if (!MAP) return;
  const pulse = L.circle([lat, lon], {
    radius: 30,
    color: '#ffd700',
    weight: 2,
    opacity: 0.9,
    fillColor: '#ffd700',
    fillOpacity: 0.3
  }).addTo(MAP);
  setTimeout(() => MAP.removeLayer(pulse), 1000);
}

function openPlaceCard(p){
  currentPlace = p;
  el.pcTitle.textContent = p.name;
  el.pcMeta.textContent  = `${p.category} • radius ${p.r||120} m`;
  el.pcDesc.textContent  = p.desc || "";
  el.pc.setAttribute('aria-hidden','false');

  el.pcUnlock.onclick = ()=> {
    if (visited[p.id]) { 
      showToast("Allerede låst opp"); 
      return; 
    }

    visited[p.id] = true; 
    saveVisited();
    drawPlaceMarkers();          // 🔄 Oppdater kartet umiddelbart
    pulseMarker(p.lat, p.lon);   // ✨ Kort glød på markøren

    // Poeng: +1 i riktig kategori — men bare hvis kategori faktisk finnes
    const cat = p.category;
    if (cat && cat.trim()) {
      merits[cat] = merits[cat] || { points: 0 };
      merits[cat].points += 1;
      saveMerits();
      updateMeritLevel(cat, merits[cat].points);
    }

    showToast(`Låst opp: ${p.name} ✅`);
  };
  
  el.pcRoute.onclick = ()=> showRouteTo(p);
  showPlaceOverlay(p);
}

function openPlaceCardByPerson(person) {
  const place = PLACES.find(x => x.id === person.placeId) || {
    id: "personloc",
    name: person.name,
    category: tagToCat(person.tags),
    r: person.r || 150,
    desc: person.desc || "",
    lat: person.lat,
    lon: person.lon
  };
  openPlaceCard(place);
  el.pcUnlock.textContent = "Ta quiz";
  el.pcUnlock.disabled = false;
  el.pcUnlock.onclick = () => startQuiz(person.id);
}

el.pcClose?.addEventListener('click', () => {
  el.pc.setAttribute('aria-hidden', 'true');
  el.pcUnlock.textContent = "Lås opp";
});


// ==============================
// 7. LISTEVISNINGER (nærområde, samling, galleri)
// ==============================
let currentPos = null;

function renderNearbyPlaces(){
  const sorted = PLACES
    .map(p => ({...p, _d: currentPos ? Math.round(distMeters(currentPos, {lat:p.lat,lon:p.lon})) : null }))
    .sort((a,b)=>(a._d??1e12)-(b._d??1e12));
  el.list.innerHTML = sorted.slice(0, NEARBY_LIMIT).map(renderPlaceCard).join("");
}

function renderPlaceCard(p){
  const dist = p._d==null ? "" : (p._d<1000? `${p._d} m` : `${(p._d/1000).toFixed(1)} km`);
  return `
    <article class="card">
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${p.category||""} • Oslo</div>
        <p class="desc">${p.desc||""}</p>
      </div>
      <div class="row between">
        <div class="dist">${dist}</div>
        <div class="row">
          <button class="ghost" data-open="${p.id}">Åpne</button>
          <button class="ghost" data-info="${encodeURIComponent(p.name)}">Mer info</button>
        </div>
      </div>
    </article>`;
}

function renderPersonCardInline(pr){
  const cat = tagToCat(pr.tags);
  const dist = pr._d<1000? `${pr._d} m` : `${(pr._d/1000).toFixed(1)} km`;
  return `
    <article class="card">
      <div>
        <div class="name">${pr.name}</div>
        <div class="meta">${cat}</div>
        <p class="desc">${pr.desc||""}</p>
      </div>
      <div class="row between">
        <div class="dist">${dist}</div>
        <button class="primary" data-quiz="${pr.id}">Ta quiz</button>
      </div>
    </article>`;
}

function renderCollection(){
  const items = PLACES.filter(p => visited[p.id]);
  const grid = el.collectionGrid;
  if (!grid) return;
  const count = el.collectionCount;
  if (count) count.textContent = items.length;

  const first = items.slice(0, 18);
  grid.innerHTML = first.map(p => `
    <span class="badge ${catClass(p.category)}" title="${p.name}">
      <span class="i" style="background:${catColor(p.category)}"></span> ${p.name}
    </span>`).join("");
}

function renderGallery() {
  const got = PEOPLE.filter(p => !!peopleCollected[p.id]);
  if (!el.gallery) return;

  if (!got.length) {
    el.gallery.innerHTML = `<div class="muted">Samle personer ved å møte dem og klare quizen.</div>`;
    return;
  }

  el.gallery.innerHTML = got.map(p => {
    const imgPath = p.image || `bilder/kort/people/${p.id}.PNG`;
    const cat = tagToCat(p.tags);
    const color = catColor(cat);

    return `
      <div class="person-card" data-person="${p.id}" title="${p.name}">
        <img src="${imgPath}" alt="${p.name}" class="person-thumb">
        <div class="person-label" style="color:${color}">${p.name}</div>
      </div>`;
  }).join("");

  // Klikk åpner popup-kortet igjen
  el.gallery.querySelectorAll(".person-card").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.person;
      const person = PEOPLE.find(p => p.id === id);
      if (person) showPersonPopup(person);
    });
  });
}

function buildSeeMoreNearby(){
  const sorted = PLACES
    .map(p => ({...p, _d: currentPos ? Math.round(distMeters(currentPos, {lat:p.lat,lon:p.lon})) : null }))
    .sort((a,b)=>(a._d??1e12)-(b._d??1e12));
  el.sheetNearBody.innerHTML = sorted.slice(NEARBY_LIMIT, NEARBY_LIMIT+24).map(renderPlaceCard).join("");
}


// ==============================
// 8. MERKER, NIVÅER OG FREMGANG (RENSKET VERSJON)
// ==============================

// Lagre alle poeng og nivåer
function saveMerits() {
  localStorage.setItem("merits_by_category", JSON.stringify(merits));
}

// Pulsanimasjon når man får nytt nivå (kan brukes i fremtidig effekt)
function pulseBadge(cat) {
  const cards = document.querySelectorAll(".badge-mini");
  cards.forEach(card => {
    const name = card.querySelector(".badge-mini-label")?.textContent || "";
    if (name.trim().toLowerCase() === cat.trim().toLowerCase()) {
      card.classList.add("badge-pulse");
      setTimeout(() => card.classList.remove("badge-pulse"), 1200);
    }
  });
}

// Oppdater nivå ved ny poengsum
async function updateMeritLevel(cat, newPoints) {
  const badges = await fetch("badges.json", { cache: "no-store" }).then(r => r.json());
  const badge = badges.find(b =>
    cat.toLowerCase().includes(b.id) ||
    b.name.toLowerCase().includes(cat.toLowerCase())
  );
  if (!badge) return;

  for (let i = badge.tiers.length - 1; i >= 0; i--) {
    const tier = badge.tiers[i];
    if (newPoints === tier.threshold) {
      showToast(`🏅 Nytt nivå i ${cat}: ${tier.label}!`);
      pulseBadge(cat);
      break;
    }
  }
}

// Poengsystem – gi +1 poeng per fullført quiz
async function addCompletedQuizAndMaybePoint(categoryDisplay, quizId) {
  const categoryId = catIdFromDisplay(categoryDisplay);
  const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  progress[categoryId] = progress[categoryId] || { completed: [] };

  // Hindre dobbel poeng for samme quiz
  if (progress[categoryId].completed.includes(quizId)) return;

  // Registrer fullført quiz
  progress[categoryId].completed.push(quizId);
  localStorage.setItem("quiz_progress", JSON.stringify(progress));

  const catLabel = categoryDisplay;
  merits[catLabel] = merits[catLabel] || { level: "Nybegynner", points: 0 };
  merits[catLabel].points += 1; // nå +1 for hver fullførte quiz

  // Oppdater nivå ut fra badges.json
  const badges = await fetch("badges.json", { cache: "no-store" }).then(r => r.json());
  const badge = badges.find(b =>
    catLabel.toLowerCase().includes(b.id) ||
    b.name.toLowerCase().includes(catLabel.toLowerCase())
  );
  if (badge) {
    for (let i = badge.tiers.length - 1; i >= 0; i--) {
      const tier = badge.tiers[i];
      if (merits[catLabel].points >= tier.threshold) {
        merits[catLabel].level = tier.label;
        break;
      }
    }
  }

  saveMerits();
  updateMeritLevel(catLabel, merits[catLabel].points);
  showToast(`🏅 +1 poeng i ${catLabel}!`);
}

// ==============================
// 9. HENDELSER OG SHEETS
// ==============================
document.addEventListener('click', (e) => {
  const openId = e.target.getAttribute?.('data-open');
  if (openId) {
    const p = PLACES.find(x => x.id === openId);
    if (p) {
      closePlaceOverlay();
      showPlaceOverlay(p);
    }
  }

  const infoName = e.target.getAttribute?.('data-info');
  if (infoName) {
    window.open(`https://www.google.com/search?q=${decodeURIComponent(infoName)} Oslo`, '_blank');
  }

  // Felles quiz-håndtering (person eller sted)
  const quizId = e.target.getAttribute?.('data-quiz');
  if (quizId) startQuiz(quizId);
});

function openSheet(sheet){ sheet?.setAttribute('aria-hidden','false'); }
function closeSheet(sheet){ sheet?.setAttribute('aria-hidden','true'); }
document.querySelectorAll('[data-close]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sel = btn.getAttribute('data-close');
    document.querySelector(sel)?.setAttribute('aria-hidden','true');
  });
});

el.seeMore?.addEventListener('click', () => {
  buildSeeMoreNearby();
  openSheet(el.sheetNear);
});

// ==============================
// 10. INITIALISERING OG BOOT (REN OG KORREKT)
// ==============================
function wire() {
  document.querySelectorAll('.sheet-close').forEach(b => {
    b.addEventListener('click', () => {
      const sel = b.getAttribute('data-close');
      if (sel) document.querySelector(sel)?.setAttribute('aria-hidden', 'true');
    });
  });

  el.test?.addEventListener('change', e => {
    if (e.target.checked) {
      currentPos = { lat: START.lat, lon: START.lon };
      el.status.textContent = "Testmodus: Oslo sentrum";
      setUser(currentPos.lat, currentPos.lon);
      renderNearbyPlaces();
      // renderNearbyPeople();  ← fjernet
      showToast("Testmodus PÅ");
    } else {
      showToast("Testmodus AV");
      requestLocation();
    }
  });
}

function requestLocation() {
  if (!navigator.geolocation) {
    el.status.textContent = "Geolokasjon støttes ikke.";
    renderNearbyPlaces();
    // renderNearbyPeople();  ← fjernet
    return;
  }
  el.status.textContent = "Henter posisjon…";
  navigator.geolocation.getCurrentPosition(g => {
    currentPos = { lat: g.coords.latitude, lon: g.coords.longitude };
    el.status.textContent = "Posisjon funnet.";
    setUser(currentPos.lat, currentPos.lon);
    renderNearbyPlaces();
    // renderNearbyPeople();  ← fjernet
  }, _ => {
    el.status.textContent = "Kunne ikke hente posisjon.";
    renderNearbyPlaces();
    // renderNearbyPeople();  ← fjernet
  }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 });
}

function boot() {
  initMap(); // 🟢 start kartet med én gang

  // Laster places og people med presise feilmeldinger
  Promise.all([
    fetch('places.json')
      .then(r => {
        if (!r.ok) throw new Error(`places.json (${r.status})`);
        return r.json();
      })
      .catch(err => { throw new Error(`Feil ved lasting av places.json → ${err.message}`); }),

    fetch('people.json')
      .then(r => {
        if (!r.ok) throw new Error(`people.json (${r.status})`);
        return r.json();
      })
      .catch(err => { throw new Error(`Feil ved lasting av people.json → ${err.message}`); })
  ])
  .then(([places, people]) => {
    PLACES = places || [];
    PEOPLE = people || [];

    dataReady = true;
    maybeDrawMarkers();

    renderNearbyPlaces();
    renderCollection();
    renderMerits();
    renderGallery();

    requestLocation();

    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          currentPos = { lat: latitude, lon: longitude };
          setUser(latitude, longitude);
          renderNearbyPlaces();
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }

    wire();
  })
  .catch(err => {
    console.error("❌ Datafeil i boot():", err);
    showToast(`Kunne ikke laste data (${err.message})`, 4000);
  });
}

document.addEventListener('DOMContentLoaded', boot);

// === MINI-PROFIL PÅ FORSIDEN – VISER NAVN, STATISTIKK, QUIZZER ===
document.addEventListener("DOMContentLoaded", () => {
  const nm = document.getElementById("miniName");
  const st = document.getElementById("miniStats");
  if (!nm || !st) return;

  // Bruk samme nøkler som profilsiden
  const name  = localStorage.getItem("user_name")  || "Utforsker #182";
  const color = localStorage.getItem("user_color") || "#f6c800";

  // Hent progresjon fra lagring
  // Hent progresjon fra lagring (riktige nøkler)
const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const quizProgress    = JSON.parse(localStorage.getItem("quiz_progress") || "{}");

  // Tell opp
  const visitedCount = Object.keys(visited).length;
  const badgeCount   = Object.keys(merits).length;
  const quizCount    = Object.values(quizProgress)
    .map(v => (Array.isArray(v.completed) ? v.completed.length : 0))
    .reduce((a,b) => a + b, 0);

  // Sett navn og farge
  nm.textContent = name;
  nm.style.color = color;

  // Sett statistikktekst
  st.textContent = `${visitedCount} steder · ${badgeCount} merker · ${quizCount} quizzer`;
});

// --- Interaktive lenker i mini-profil ---
document.getElementById("linkPlaces")?.addEventListener("click", () => {
  enterMapMode();
  showToast("Viser steder på kartet");
});

document.getElementById("linkBadges")?.addEventListener("click", () => {
  window.location.href = "profile.html#userBadgesGrid";
});


// === QUIZ-HISTORIKK MODAL (forside) ===
function showQuizHistory() {
  const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  const allCompleted = Object.entries(progress)
    .flatMap(([cat, val]) => (val.completed || []).map(id => ({ category: cat, id })));

  if (!allCompleted.length) {
    showToast("Du har ingen fullførte quizzer ennå.");
    return;
  }

  // hent PEOPLE og PLACES fra global state
  const recent = allCompleted.slice(-8).reverse(); // vis siste 8
  const list = recent.map(item => {
    const person = PEOPLE.find(p => p.id === item.id);
    const place  = PLACES.find(p => p.id === item.id);
    const name   = person?.name || place?.name || item.id;
    const cat    = item.category || "–";
    return `<li><strong>${name}</strong><br><span class="muted">${cat}</span></li>`;
  }).join("");

  const html = `
    <div class="quiz-modal" id="quizHistoryModal">
      <div class="quiz-modal-inner">
        <button class="quiz-close" id="closeQuizHistory">✕</button>
        <h2>Fullførte quizzer</h2>
        <ul class="quiz-history-list">${list}</ul>
      </div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", html);

  const modal = document.getElementById("quizHistoryModal");
  document.getElementById("closeQuizHistory").onclick = () => modal.remove();
  modal.addEventListener("click", e => { if (e.target.id === "quizHistoryModal") modal.remove(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") modal.remove(); });
}

document.getElementById("linkQuiz")?.addEventListener("click", showQuizHistory);

// ==============================
//  AKTIVER PROFILSIDE (v18+)
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  const isProfile = document.querySelector(".profile-page");
  if (!isProfile) return;

  renderProfileCard();
  renderCollection();
  renderMerits();
  renderGallery();
  renderUserBadges();
});

// ==============================
// 11. STED-OVERLAY (tekst + personer)
// ==============================
async function fetchWikiSummary(name){
  try{
    const url = `https://no.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }});
    if (!res.ok) throw new Error('No wiki');
    const data = await res.json();
    return data.extract || "";
  }catch(_){ return ""; }
}

function closePlaceOverlay() {
  const ov = document.getElementById('placeOverlay');
  if (ov) ov.remove();
}

async function showPlaceOverlay(place) {
  // Fjern eventuelle tidligere overlays
  const existing = document.getElementById('placeOverlay');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'placeOverlay';
  overlay.className = 'place-overlay';

  const peopleHere = PEOPLE.filter(p => p.placeId === place.id);
  const summary = await fetchWikiSummary(place.name);

  overlay.innerHTML = `
    <button class="close-overlay" onclick="closePlaceOverlay()">×</button>
    <div class="place-overlay-content">
      <div class="left">
        <h2>${place.name}</h2>
        <p class="muted">${place.category || ''} • radius ${place.r || 150} m</p>

        ${place.image ? `<img src="${place.image}" alt="${place.name}" style="width:100%;border-radius:8px;margin:10px 0;">` : ''}

        <p>${summary || (place.desc || 'Ingen beskrivelse tilgjengelig.')}</p>

        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
          <button class="primary" onclick='showRouteTo(${JSON.stringify(place)})'>Vis rute</button>
          <button class="ghost" onclick="window.open('${googleUrl(place.name)}','_blank')">Google</button>
          <button class="ghost" onclick="window.open('https://no.wikipedia.org/wiki/${encodeURIComponent(place.name)}','_blank')">Wikipedia</button>
        </div>

        <hr style="border:none;border-top:1px solid rgba(255,255,255,.1);margin:14px 0;">

        <div style="margin-top:12px;">
          <button class="primary" data-quiz="${place.id}">Ta quiz om stedet</button>
        </div>
      </div>

      <div class="right">
        ${peopleHere.length ? peopleHere.map(p => `
          <div class="card">
            <strong>${p.name}</strong><br>
            <span class="muted">${tagToCat(p.tags)}</span>
            <p>${p.desc || ''}</p>
            <button class="primary" data-quiz="${p.id}">Ta quiz</button>
          </div>`).join('')
        : '<div class="muted">Ingen personer registrert.</div>'}
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // Lukking ved klikk utenfor
  overlay.addEventListener('click', e => {
    if (e.target.id === 'placeOverlay') closePlaceOverlay();
  });
}

// ==============================
// KARTMODUS – SE KART / LUKK KART
// ==============================

function enterMapMode() {
  document.body.classList.add("map-only");
  el.btnSeeMap.style.display = "none";
  el.btnExitMap.style.display = "block";
  document.querySelector("main").style.display = "none";
  document.querySelector("header").style.display = "none";

  // 🔧 Flytt kartet øverst når kartmodus er aktiv
  const mapEl = document.getElementById("map");
  if (mapEl) mapEl.style.zIndex = "10";

  showToast("Kartmodus");
}

function exitMapMode() {
  document.body.classList.remove("map-only");
  el.btnSeeMap.style.display = "block";
  el.btnExitMap.style.display = "none";
  document.querySelector("main").style.display = "";
  document.querySelector("header").style.display = "";

  // 🔧 Flytt kartet bak igjen når du går ut av kartmodus
  const mapEl = document.getElementById("map");
  if (mapEl) mapEl.style.zIndex = "0";

  showToast("Tilbake til oversikt");
}

el.btnSeeMap?.addEventListener("click", enterMapMode);
el.btnExitMap?.addEventListener("click", exitMapMode);
// ==============================
// 12. QUIZ – DYNAMISK LASTER, MODAL & SCORE
// ==============================

// --- Filkartlegging for alle kategorier ---
const QUIZ_FILE_MAP = {
  "kunst": "quiz_kunst.json",
  "sport": "quiz_sport.json",
  "politikk": "quiz_politikk.json",
  "populaerkultur": "quiz_populaerkultur.json",
  "musikk": "quiz_musikk.json",
  "subkultur": "quiz_subkultur.json",
  "vitenskap": "quiz_vitenskap.json",
  "natur": "quiz_natur.json",
  "litteratur": "quiz_litteratur.json",
  "by": "quiz_by.json"
};

// --- Laster riktig quizfil etter kategori ---
async function loadQuizForCategory(categoryId) {
  const file = QUIZ_FILE_MAP[categoryId];
  if (!file) return [];
  try {
    const response = await fetch(file, { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data)
      ? data.filter(q => (q.categoryId || "").toLowerCase() === categoryId.toLowerCase())
      : [];
  } catch {
    return [];
  }
}

// ==============================
// QUIZ-UI – MODAL SOM BYGGES DYNAMISK
// ==============================
function ensureQuizUI() {
  if (document.getElementById("quizModal")) return;
  const m = document.createElement("div");
  m.id = "quizModal";
  m.className = "modal";
  m.innerHTML = `
    <div class="modal-body">
      <div class="modal-head">
        <strong id="quizTitle">Quiz</strong>
        <button class="ghost" id="quizClose">Lukk</button>
      </div>
      <div class="quiz-progress"><div class="bar"></div></div>
      <div class="sheet-body">
        <div id="quizQ" style="margin:6px 0 10px;font-weight:600"></div>
        <div id="quizChoices" class="quiz-choices"></div>
        <div style="display:flex;justify-content:space-between;margin-top:8px;">
          <span id="quizFeedback" class="quiz-feedback"></span>
          <small id="quizProgress" class="muted"></small>
        </div>
      </div>
    </div>`;
  document.body.appendChild(m);

  // Lukking
  const modal = document.getElementById("quizModal");
  modal.querySelector("#quizClose").onclick = closeQuiz;
  modal.addEventListener("click", e => { if (e.target.id === "quizModal") closeQuiz(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeQuiz(); });
}

function openQuiz() {
  ensureQuizUI();
  const el = document.getElementById("quizModal");
  el.style.display = "flex";
  el.classList.remove("fade-out");
}

function closeQuiz() {
  const el = document.getElementById("quizModal");
  if (!el) return;
  el.classList.add("fade-out");
  setTimeout(() => el.remove(), 450); // matcher CSS-animasjon
}

// ==============================
// START QUIZ (person eller sted)
// ==============================
async function startQuiz(targetId) {
  const person = PEOPLE.find(p => p.id === targetId);
  const place  = PLACES.find(p => p.id === targetId);
  if (!person && !place) return showToast("Fant verken person eller sted");

  const displayCat = person ? tagToCat(person.tags) : (place.category || "vitenskap");
  const categoryId = catIdFromDisplay(displayCat);
  const items = await loadQuizForCategory(categoryId);
  const questions = items.filter(q => q.personId === targetId || q.placeId === targetId);
  if (!questions.length) return showToast("Ingen quiz tilgjengelig her ennå");

  const formatted = questions.map(q => ({
    text: q.question,
    choices: q.options || [],
    answerIndex: (q.options || []).findIndex(o => o === q.answer)
  }));

  closePlaceOverlay();
  openQuiz();

  runQuizFlow({
  title: person ? person.name : place.name,
  questions: formatted,
  onEnd: (correct, total) => {
    addCompletedQuizAndMaybePoint(displayCat, targetId);
    if (person) {
      peopleCollected[targetId] = true;
      savePeople();
      showPersonPopup(person);
      document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" });
    }
    showToast(`Quiz fullført: ${correct}/${total} 🎉`);

    // ✨ Pulse på stedet som hører til personen når quizen fullføres
    if (person && person.placeId) {
      const plc = PLACES.find(p => p.id === person.placeId);
      if (plc) pulseMarker(plc.lat, plc.lon);
    }
  }
});
}
// ==============================
// MODAL QUIZ FLOW
// ==============================
function runQuizFlow({ title = "Quiz", questions = [], onEnd = () => {} }) {
  ensureQuizUI();
  const qs = {
    title: document.getElementById("quizTitle"),
    q: document.getElementById("quizQ"),
    choices: document.getElementById("quizChoices"),
    progress: document.getElementById("quizProgress"),
    feedback: document.getElementById("quizFeedback")
  };
  qs.title.textContent = title;

  let i = 0, correctCount = 0;

  function step() {
    const q = questions[i];
    qs.q.textContent = q.text;
    qs.choices.innerHTML = q.choices.map((opt, idx) =>
      `<button data-idx="${idx}">${opt}</button>`
    ).join("");
    qs.progress.textContent = `${i + 1}/${questions.length}`;
    qs.feedback.textContent = "";

    const bar = document.querySelector(".quiz-progress .bar");
    if (bar) bar.style.width = `${((i + 1) / questions.length) * 100}%`;

    qs.choices.querySelectorAll("button").forEach(btn => {
      btn.onclick = () => {
        const ok = Number(btn.dataset.idx) === q.answerIndex;
        btn.classList.add(ok ? "correct" : "wrong");
        qs.feedback.textContent = ok ? "Riktig ✅" : "Feil ❌";
        if (ok) correctCount++;
        qs.choices.querySelectorAll("button").forEach(b => b.disabled = true);
        setTimeout(() => {
          i++;
          if (i < questions.length) step();
          else {
            closeQuiz();
            onEnd(correctCount, questions.length);
          }
        }, QUIZ_FEEDBACK_MS);
      };
    });
  }

  step();
}

// ==============================
// PERSON-POPUP VED FULLFØRT QUIZ (FORBEDRET SAMLEKORT-VISNING)
// ==============================
function showPersonPopup(person) {
  const imgPath = person.image || `bilder/kort/people/${person.id}.PNG`;
  const cat = tagToCat(person.tags);
  const desc = person.desc || "Ingen beskrivelse tilgjengelig.";

  const card = document.createElement("div");
  card.className = "person-popup";
  card.innerHTML = `
    <div class="popup-inner" 
         style="width:280px;max-width:80vw;background:rgba(15,15,20,0.95);
                color:#fff;border-radius:12px;padding:18px;text-align:center;
                box-shadow:0 0 20px rgba(0,0,0,0.6);display:flex;
                flex-direction:column;align-items:center;animation:fadeIn .4s ease;">
      
      <img src="${imgPath}" alt="${person.name}"
           style="width:180px;height:180px;object-fit:contain;object-position:center;
                  border-radius:8px;margin-bottom:10px;">

      <h3 style="margin:6px 0 4px;font-size:1.25em;">${person.name}</h3>
      <p style="margin:0 0 10px;color:#ccc;font-size:0.9em;">${cat}</p>

      <p style="font-size:0.85em;line-height:1.4;color:#ddd;margin:0 0 14px;">
        ${desc}
      </p>

      <div style="background:#222;padding:8px 10px;border-radius:6px;font-size:0.9em;
                  color:#f6c800;display:inline-block;">
        🏅 Du har nå samlet kortet for <strong>${person.name}</strong>!
      </div>
    </div>`;

  document.body.appendChild(card);
  setTimeout(() => card.classList.add("visible"), 20);
  setTimeout(() => card.remove(), 4200);
}

// Enkle animasjonsstiler – legg bare inn én gang
const style = document.createElement("style");
style.textContent = `
.person-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.9);
  opacity: 0;
  transition: all 0.4s ease;
  z-index: 9999;
}
.person-popup.visible {
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;
}
@keyframes fadeIn {
  from {opacity:0;transform:translate(-50%,-50%) scale(0.85);}
  to   {opacity:1;transform:translate(-50%,-50%) scale(1);}
}`;
document.head.appendChild(style);

// ==============================
// BADGE-MODAL – VIS FASIT & STATUS
// ==============================
async function showBadgeModal(categoryDisplay) {
  const categoryId = catIdFromDisplay(categoryDisplay);
  const progress = JSON.parse(localStorage.getItem("quiz_progress") || "{}");
  const completed = progress[categoryId]?.completed || [];

  const badges = await fetch("badges.json", { cache: "no-store" }).then(r => r.json());
  const badge = badges.find(b => {
    const id = b.id.toLowerCase();
    const name = b.name.toLowerCase();
    const cat = categoryId.toLowerCase();
    return id === cat || name === cat ||
           id === cat.replace(/\s*&\s*/g, "") ||
           (cat.includes(id) && !cat.includes("scene"));
  }) || { name: categoryDisplay, color: "#999", icon: "🏅" };

  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");
  const merit = merits[categoryDisplay] || { level: "Nybegynner", points: 0 };

  const all = await loadQuizForCategory(categoryId);
  const done = all.filter(q => completed.includes(q.personId || q.placeId)).reverse();

  const html = `
    <div class="badge-modal-inner" style="border-top:4px solid ${badge.color}">
      <button class="badge-close" id="closeBadgeModal">✕</button>
      ${badge.id ? `<img src="${badge.image || `bilder/merker/${badge.id}.png`}" 
        alt="${badge.name}" class="badge-image">` : ""}
      <div class="badge-modal-header">
        <span class="badge-icon-large" style="color:${badge.color}">${badge.icon}</span>
        <div>
          <h2>${badge.name}</h2>
          <p class="muted">Nivå: ${merit.level} · Poeng: ${merit.points}</p>
        </div>
      </div>
      <hr>
      ${
        done.length
          ? done.map(q => `
              <div class="quiz-fasit">
                <p class="q">${q.question}</p>
                <p class="a">✅ Riktig svar: <strong>${q.answer}</strong></p>
              </div>`
            ).join("")
          : `<p class="muted">Ingen fullførte quizer ennå.</p>`
      }
    </div>`;

  let modal = document.getElementById("badgeModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "badgeModal";
    modal.className = "badge-modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = html;
  modal.style.display = "flex";
  modal.style.background = "transparent";
  modal.style.zIndex = 9999;

  const closeBtn = modal.querySelector("#closeBadgeModal");
  if (closeBtn) closeBtn.onclick = () => modal.remove();
  modal.addEventListener("click", e => { if (e.target.id === "badgeModal") modal.remove(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") modal.remove(); });
}

// --- Lytter på klikk i merkesamlingen ---
document.addEventListener("click", e => {
  const badgeCard = e.target.closest(".badge-card");
  if (badgeCard) {
    const cat = badgeCard.querySelector("strong")?.textContent?.trim();
    if (cat) showBadgeModal(cat);
  }
});

// --- Failsafe: Tegner markører når alt er lastet ---
let drawCheck = setInterval(() => {
  if (mapReady && dataReady && PLACES.length > 0) {
    maybeDrawMarkers();
    clearInterval(drawCheck);
  }
}, 500);



// ============================================================
// === SLUTT PROFIL & MERKER ================================
// ============================================================
