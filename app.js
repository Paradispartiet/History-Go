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
function saveMerits(){   localStorage.setItem("merits_by_category", JSON.stringify(merits)); renderMerits(); }

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

  pc:         document.getElementById('placeCard'),
  pcTitle:    document.getElementById('pcTitle'),
  pcMeta:     document.getElementById('pcMeta'),
  pcDesc:     document.getElementById('pcDesc'),
  pcMore:     document.getElementById('pcMore'),
  pcUnlock:   document.getElementById('pcUnlock'),
  pcRoute:    document.getElementById('pcRoute'),
  pcClose:    document.getElementById('pcClose'),
};


// ==============================
// 3. KATEGORIFUNKSJONER
// ==============================
function catColor(cat=""){
  const c = cat.toLowerCase();
  if (c.includes("kultur")) return "#e63946";
  if (c.includes("urban"))  return "#ffb703";
  if (c.includes("sport"))  return "#2a9d8f";
  if (c.includes("natur"))  return "#4caf50";
  if (c.includes("vitenskap")) return "#9b59b6";
  if (c.includes("politikk")) return "#c77dff";
  if (c.includes("musikk")) return "#ff66cc";
  return "#1976d2";
}
function catClass(cat=""){
  const c = cat.toLowerCase();
  if (c.includes("kultur")) return "kult";
  if (c.includes("urban"))  return "urban";
  if (c.includes("sport"))  return "sport";
  if (c.includes("natur"))  return "natur";
  if (c.includes("vitenskap")) return "viten";
  if (c.includes("politikk")) return "poli";
  if (c.includes("musikk")) return "musikk";
  return "hist";
}
function tagToCat(tags=[]){
  const t = (tags.join(" ")||"").toLowerCase();
  if (t.includes("kultur")) return "Kultur"; // <- fikset (var "Kultur & kultur")
  if (t.includes("populær") || t.includes("populaer") || t.includes("pop")) return "Populærkultur";
  if (t.includes("urban"))  return "Urban Life";
  if (t.includes("sport"))  return "Sport";
  if (t.includes("natur"))  return "Natur & miljø";
  if (t.includes("vitenskap") || t.includes("filosofi")) return "Vitenskap & filosofi";
  if (t.includes("politikk") || t.includes("samfunn")) return "Politikk & samfunn";
  if (t.includes("musikk")) return "Musikk & scenekunst";
  if (t.includes("arkitektur") || t.includes("by")) return "By & arkitektur";
  return "Historie";
}
function catIdFromDisplay(name=""){
  const n = name.toLowerCase();
  if (n.includes("historie")) return "historie";
  if (n.includes("vitenskap")) return "vitenskap";
  if (n.includes("kultur")) return "kunst";
  if (n.includes("musikk")) return "musikk";
  if (n.includes("natur")) return "natur";
  if (n.includes("sport")) return "sport";
  if (n.includes("by")) return "by";
  if (n.includes("politikk")) return "politikk";
  if (n.includes("populær")) return "populaerkultur";
  if (n.includes("subkultur")) return "subkultur";
  return "historie";
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
let MAP, userMarker, userPulse, routeLine, routeControl, placeLayer, peopleLayer;

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

function showRouteTo(place){
  if (!MAP) return;
  const from = currentPos ? L.latLng(currentPos.lat, currentPos.lon) : L.latLng(START.lat, START.lon);
  const to   = L.latLng(place.lat, place.lon);

  if (routeLine){ MAP.removeLayer(routeLine); routeLine = null; }

  try{
    if (!L.Routing) throw new Error('no LRM');
    if (routeControl){ MAP.removeControl(routeControl); routeControl = null; }
    routeControl = L.Routing.control({
      waypoints: [from, to],
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      addWaypoints: false, draggableWaypoints: false, fitSelectedRoutes: true, show: false,
      lineOptions: { styles: [{color:'#cfe8ff', opacity:1, weight:6}] },
      createMarker: ()=>null
    }).addTo(MAP);
    showToast('Rute lagt.');
  }catch(e){
    routeLine = L.polyline([from, to], {color:'#cfe8ff', weight:5, opacity:1}).addTo(MAP);
    MAP.fitBounds(routeLine.getBounds(), {padding:[40,40]});
    showToast('Vis linje (ingen rutetjeneste)');
  }
}

function initMap() {
  MAP = L.map('map').setView([START.lat, START.lon], START.zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  }).addTo(MAP);

  placeLayer = L.layerGroup().addTo(MAP);
  peopleLayer = L.layerGroup().addTo(MAP);
}

function drawPlaceMarkers() {
  if (!MAP || !PLACES.length) return;
  placeLayer.clearLayers();

  PLACES.forEach(p => {
    const mk = L.circleMarker([p.lat, p.lon], {
      radius: 8,
      color: '#fff',
      weight: 1,
      fillColor: catColor(p.category),
      fillOpacity: 1
    }).addTo(placeLayer);

    mk.bindTooltip(p.name, { permanent: false, direction: "top" });
    mk.on('click', () => openPlaceCard(p));
  });
}

function drawPeopleMarkers() {
  if (!MAP || !PEOPLE.length) return;
  peopleLayer.clearLayers();

  PEOPLE.forEach(pr => {
    if ((pr.lat==null || pr.lon==null) && pr.placeId){
      const plc = PLACES.find(x=>x.id===pr.placeId);
      if (plc){ pr.lat = plc.lat; pr.lon = plc.lon; }
    }
    if (pr.lat==null || pr.lon==null) return;

    const html = `
      <div style="
        width:28px;height:28px;border-radius:999px;
        background:${catColor(tagToCat(pr.tags))}; color:#111;
        display:flex;align-items:center;justify-content:center;
        font-weight:900; font-size:12px; border:2px solid #111;
        box-shadow:0 0 0 3px rgba(0,0,0,.25);
      ">
        ${(pr.initials || '').slice(0,2).toUpperCase()}
      </div>`;

    const icon = L.divIcon({ className:"", html, iconSize:[28,28], iconAnchor:[14,14] });
    const mk = L.marker([pr.lat, pr.lon], { icon }).addTo(peopleLayer);
    const hb = L.circle([pr.lat, pr.lon], { radius:36, opacity:0, fillOpacity:0 }).addTo(peopleLayer);
    const openFromPerson = () => openPlaceCardByPerson(pr);
    mk.on('click', openFromPerson);
    hb.on('click', openFromPerson);
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

function openPlaceCard(p){
  currentPlace = p;
  el.pcTitle.textContent = p.name;
  el.pcMeta.textContent  = `${p.category} • radius ${p.r||120} m`;
  el.pcDesc.textContent  = p.desc || "";
  el.pc.setAttribute('aria-hidden','false');

  el.pcMore.onclick = () => window.open(googleUrl(p.name), '_blank');
  el.pcUnlock.textContent = visited[p.id] ? "Låst opp" : "Lås opp";
  el.pcUnlock.disabled = !!visited[p.id];
  el.pcUnlock.onclick = ()=> {
    if (visited[p.id]) { showToast("Allerede låst opp"); return; }
    visited[p.id] = true; saveVisited();

    const cat = p.category || "Historie";
    merits[cat] = merits[cat] || { level:"Nybegynner", points:0 };
    merits[cat].points += 1;
    updateMeritLevel(cat, merits[cat].points);
    if (merits[cat].points >= 12) merits[cat].level = "Historiker";
    else if (merits[cat].points >= 7) merits[cat].level = "Forteller";
    else if (merits[cat].points >= 3) merits[cat].level = "Tidsreisende";
    saveMerits();

    showToast(`Låst opp: ${p.name} ✅`);
  };
  el.pcRoute.onclick = ()=> showRouteTo(p);

  showPlaceOverlay(p);
}

function openPlaceCardByPerson(person){
  const place = PLACES.find(x => x.id === person.placeId) || {
    id:"personloc", name:person.name, category: tagToCat(person.tags),
    r: person.r || 150, desc: person.desc || "", lat: person.lat, lon: person.lon
  };
  openPlaceCard(place);
  el.pcUnlock.textContent = "Ta quiz";
  el.pcUnlock.disabled = false;
  el.pcUnlock.onclick = ()=> startQuizForPerson(person.id);
}

el.pcClose?.addEventListener('click', ()=> {
  el.pc.setAttribute('aria-hidden','true');
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

function renderNearbyPeople(){
  if (!currentPos) { el.nearPeople.innerHTML = ""; return; }
  const candidates = PEOPLE
    .map(pr=>{
      if ((pr.lat==null||pr.lon==null) && pr.placeId){
        const plc = PLACES.find(x=>x.id===pr.placeId);
        if (plc){ pr.lat = plc.lat; pr.lon = plc.lon; }
      }
      return ({ ...pr, _d: Math.round(distMeters(currentPos,{lat:pr.lat,lon:pr.lon})) });
    })
    .filter(pr => pr.lat!=null && pr.lon!=null)
    .filter(pr => pr._d <= (pr.r||200) + (el.test?.checked ? 5000 : 0))
    .sort((a,b)=>a._d-b._d)
    .slice(0, 6);

  el.nearPeople.innerHTML = candidates.map(renderPersonCardInline).join("");
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

function renderGallery(){
  const got = PEOPLE.filter(p => !!peopleCollected[p.id]);
  el.gallery.innerHTML = got.length ? got.map(p=>`
    <span class="badge ${catClass(tagToCat(p.tags))}" title="${p.name}">
      <span class="i" style="background:${catColor(tagToCat(p.tags))}"></span> ${p.name}
    </span>
  `).join("") : `<div class="muted">Samle personer ved å møte dem og klare quizen.</div>`;
}

function buildSeeMoreNearby(){
  const sorted = PLACES
    .map(p => ({...p, _d: currentPos ? Math.round(distMeters(currentPos, {lat:p.lat,lon:p.lon})) : null }))
    .sort((a,b)=>(a._d??1e12)-(b._d??1e12));
  el.sheetNearBody.innerHTML = sorted.slice(NEARBY_LIMIT, NEARBY_LIMIT+24).map(renderPlaceCard).join("");
}


// ==============================
// 8. MERKER, NIVÅER OG FREMGANG
// ==============================
async function renderMerits() {
  const container = document.getElementById("merits");
  if (!container) return;

  const badges = await fetch("badges.json", {cache:"no-store"}).then(r => r.json());
  const localMerits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  const cats = Object.keys(localMerits).length ? Object.keys(localMerits) : badges.map(b => b.name);

  container.innerHTML = cats.map(cat => {
    const m = localMerits[cat] || { level: "Nybegynner", points: 0 };
    const badge = badges.find(b =>
      cat.toLowerCase().includes(b.id) ||
      b.name.toLowerCase().includes(cat.toLowerCase())
    );
    const icon = badge ? badge.icon : "⭐";
    const color = badge ? badge.color : catColor(cat);

    let status = `Nivå: ${m.level} • Poeng: ${m.points}`;
    if (badge) {
      const next = badge.tiers.find(t => m.points < t.threshold);
      status = next ? `${m.points}/${next.threshold} poeng (→ ${t.next || next.label})`
                    : `${m.points} poeng – maks nivå`;
    }

    return `
      <div class="card badge-card">
        <div class="badge-icon-ring" style="border-color:${color}">
          <span class="badge-icon">${icon}</span>
        </div>
        <div class="badge-info">
          <strong>${cat}</strong><br>
          <small>${status}</small>
        </div>
      </div>`;
  }).join("");
}

function pulseBadge(cat) {
  const cards = document.querySelectorAll(".badge-card");
  cards.forEach(card => {
    const name = card.querySelector(".badge-info strong")?.textContent || "";
    if (name.trim().toLowerCase() === cat.trim().toLowerCase()) {
      card.classList.add("badge-pulse");
      setTimeout(() => card.classList.remove("badge-pulse"), 1200);
    }
  });
}

function updateMeritLevel(cat, newPoints) {
  const thresholds = [3, 7, 12];
  const catName = cat;
  if (thresholds.includes(newPoints)) {
    showToast(`🏅 Nytt nivå i ${catName}!`);
    pulseBadge(catName);
  }
}

function updateBadgeDisplay(categoryId) {
  const display = document.getElementById("progress-display");
  if (!display) return;
  const rec = userProgress[categoryId] || {correct:0, points:0};
  display.textContent = `Riktige svar: ${rec.correct}  •  Poeng: ${rec.points}`;
}

function addCorrectAndMaybePoint(categoryIdDisplay){
  const categoryId = catIdFromDisplay(categoryIdDisplay);
  if (!userProgress[categoryId]) userProgress[categoryId] = { correct: 0, points: 0 };
  userProgress[categoryId].correct++;

  if (userProgress[categoryId].correct % 3 === 0) {
    userProgress[categoryId].points++;
    const catLabel = categoryIdDisplay;
    merits[catLabel] = merits[catLabel] || { level:"Nybegynner", points:0 };
    merits[catLabel].points += 1;

    if (merits[catLabel].points >= 12) merits[catLabel].level = "Historiker";
    else if (merits[catLabel].points >= 7) merits[catLabel].level = "Forteller";
    else if (merits[catLabel].points >= 3) merits[catLabel].level = "Tidsreisende";

    saveMerits();
    updateMeritLevel(catLabel, merits[catLabel].points);
    showToast(`+1 poeng i ${catLabel}!`);
  }

  localStorage.setItem("historygo_progress", JSON.stringify(userProgress));
  updateBadgeDisplay(categoryId);
}


// ==============================
// 9. HENDELSER OG SHEETS
// ==============================
document.addEventListener('click', (e)=>{
  const openId = e.target.getAttribute?.('data-open');
  if (openId){
    const p = PLACES.find(x=>x.id===openId);
    if (p) openPlaceCard(p);
  }
  const infoName = e.target.getAttribute?.('data-info');
  if (infoName){
    window.open(`https://www.google.com/search?q=${decodeURIComponent(infoName)} Oslo`, '_blank');
  }
  const quizId = e.target.getAttribute?.('data-quiz');
  if (quizId){
    startQuizForPerson(quizId);
  }
});

function openSheet(sheet){ sheet?.setAttribute('aria-hidden','false'); }
function closeSheet(sheet){ sheet?.setAttribute('aria-hidden','true'); }
document.querySelectorAll('[data-close]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sel = btn.getAttribute('data-close');
    document.querySelector(sel)?.setAttribute('aria-hidden','true');
  });
});


// ==============================
// 10. INITIALISERING OG BOOT
// ==============================
function wire(){
  document.querySelectorAll('.sheet-close').forEach(b=>{
    b.addEventListener('click', ()=> {
      const sel = b.getAttribute('data-close');
      if (sel) document.querySelector(sel)?.setAttribute('aria-hidden','true');
    });
  });

  el.test?.addEventListener('change', e=>{
    if (e.target.checked){
      currentPos = { lat: START.lat, lon: START.lon };
      el.status.textContent = "Testmodus: Oslo sentrum";
      setUser(currentPos.lat, currentPos.lon);
      renderNearbyPlaces(); renderNearbyPeople();
      showToast("Testmodus PÅ");
    } else {
      showToast("Testmodus AV"); requestLocation();
    }
  });
}

function requestLocation(){
  if (!navigator.geolocation){
    el.status.textContent = "Geolokasjon støttes ikke.";
    renderNearbyPlaces(); renderNearbyPeople(); return;
  }
  el.status.textContent = "Henter posisjon…";
  navigator.geolocation.getCurrentPosition(g=>{
    currentPos = { lat:g.coords.latitude, lon:g.coords.longitude };
    el.status.textContent = "Posisjon funnet.";
    setUser(currentPos.lat, currentPos.lon);
    renderNearbyPlaces(); renderNearbyPeople();
  }, _=>{
    el.status.textContent = "Kunne ikke hente posisjon.";
    renderNearbyPlaces(); renderNearbyPeople();
  }, { enableHighAccuracy:true, timeout:8000, maximumAge:10000 });
}

function boot(){
  initMap();

  Promise.all([
    fetch('places.json', {cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject('places.json')),
    fetch('people.json', {cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject('people.json')).catch(()=>[])
  ]).then(([places, people])=>{
    PLACES = places||[];
    PEOPLE = people||[];

    try { drawPlaceMarkers(); } catch(_){}
    try { drawPeopleMarkers(); } catch(_){}

    renderNearbyPlaces();
    renderNearbyPeople();
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
          renderNearbyPeople();
        },
        ()=>{},
        { enableHighAccuracy: true }
      );
    }

    wire();
  }).catch(()=>{
    showToast("Kunne ikke laste data.", 2000);
  });
}

document.addEventListener('DOMContentLoaded', boot);


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
        ${place.image ? `<img src="${place.image}" alt="${place.name}" style="width:100%;border-radius:8px;margin-bottom:10px;">` : ''}
        <p>${summary || (place.desc || 'Ingen beskrivelse tilgjengelig.')}</p>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          <a class="ghost" href="${googleUrl(place.name)}" target="_blank" rel="noopener">Åpne Google</a>
          <a class="ghost" href="https://no.wikipedia.org/wiki/${encodeURIComponent(place.name)}" target="_blank" rel="noopener">Åpne Wikipedia</a>
        </div>
      </div>
      <div class="right">
        ${peopleHere.length ? peopleHere.map(p => `
          <div class="card">
            <strong>${p.name}</strong><br>
            <span class="muted">${tagToCat(p.tags)}</span>
            <p>${p.desc || ''}</p>
            <button class="primary" onclick="startQuizForPerson('${p.id}')">Ta quiz</button>
          </div>`).join('')
        : '<div class="muted">Ingen personer registrert.</div>'}
      </div>
    </div>`;

  document.body.appendChild(overlay);

  // 🔹 Lukking ved klikk utenfor (ekstra trygghet)
  overlay.addEventListener('click', e => {
    if (e.target.id === 'placeOverlay') closePlaceOverlay();
  });
} // ← viktig: avslutter showPlaceOverlay riktig

// ==============================
// KARTMODUS – SE KART / LUKK KART
// ==============================

function enterMapMode() {
  document.body.classList.add("map-mode");
  el.btnSeeMap.style.display = "none";
  el.btnExitMap.style.display = "block";
  document.querySelector("main").style.display = "none";
  document.querySelector("header").style.display = "none";
  showToast("Kartmodus");
}

function exitMapMode() {
  document.body.classList.remove("map-mode");
  el.btnSeeMap.style.display = "block";
  el.btnExitMap.style.display = "none";
  document.querySelector("main").style.display = "";
  document.querySelector("header").style.display = "";
  showToast("Tilbake til oversikt");
}

el.btnSeeMap?.addEventListener("click", enterMapMode);
el.btnExitMap?.addEventListener("click", exitMapMode);

// ==============================
// 12. QUIZ – DYNAMISK LASTER, MODAL & SCORE
// ==============================

// Filkartlegging per kategori-id (ryddet til eksisterende filer)
const QUIZ_FILE_MAP = {
  "historie": "quiz_historie.json",
  "kunst": "quiz_kunst.json",
  "sport": "quiz_sport.json",
  "politikk": "quiz_politikk.json",
  "populaerkultur": "quiz_populaerkultur.json"
};

async function loadQuizForCategory(categoryId) {
  try {
    const file = QUIZ_FILE_MAP[categoryId];
    if (!file) return [];
    const response = await fetch(file, { cache: "no-store" });
    if (!response.ok) throw new Error();
    const quizzes = await response.json();
    if (!Array.isArray(quizzes)) return [];
    return quizzes.filter(q => (q.categoryId || "").toLowerCase() === categoryId.toLowerCase());
  } catch (_) {
    return [];
  }
}

// Bygger modal-UI én gang
function ensureQuizUI(){
  if (document.getElementById('quizModal')) return;
  const m = document.createElement('div');
  m.className = 'modal';
  m.id = 'quizModal';
  m.setAttribute('aria-hidden','true');
  m.innerHTML = `
    <div class="modal-body">
      <div class="modal-head">
        <strong id="quizTitle">Quiz</strong>
        <button class="ghost" id="quizClose">Lukk</button>
      </div>
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
  m.addEventListener('click', e=>{
    if (e.target.id==='quizModal') closeQuiz();
  });
  document.getElementById('quizClose').onclick = closeQuiz;
  document.addEventListener('keydown', e=>{
    if (e.key==='Escape') closeQuiz();
  });
}
function openQuiz(){ ensureQuizUI(); document.getElementById('quizModal').setAttribute('aria-hidden','false'); }
function closeQuiz(){ const el=document.getElementById('quizModal'); if(el) el.setAttribute('aria-hidden','true'); }

// Starter quiz for person: samler alle spørsmål i kategori som matcher personId
async function startQuizForPerson(personId) {
  const person = PEOPLE.find(p => p.id === personId);
  if (!person) { showToast("Fant ikke person"); return; }

  const displayCat = tagToCat(person.tags);             // f.eks. "Sport" / "Kultur" / "Populærkultur"
  const categoryId  = catIdFromDisplay(displayCat);      // f.eks. "sport" / "kunst" / "populaerkultur"

  const items = await loadQuizForCategory(categoryId);
  const questionsForPerson = items.filter(q => q.personId === personId);
  if (!questionsForPerson.length) { showToast("Ingen quiz tilgjengelig her ennå"); return; }

  // Konverter til modal-format { text, choices, answerIndex }
  const qs = questionsForPerson.map(q => {
    const idx = (q.options||[]).findIndex(o => o === q.answer);
    return { text: q.question, choices: q.options || [], answerIndex: idx >= 0 ? idx : 0 };
  });

  openQuiz();
  runQuizFlow({
    title: person.name || "Quiz",
    questions: qs,
    onEnd: (correctCount, total) => {
      if (correctCount > 0) {
        // én correct teller som 1 riktig i “per 3 riktige = +1 poeng”
        for (let i=0; i<correctCount; i++) addCorrectAndMaybePoint(displayCat);
      }
      showToast(`Quiz fullført: ${correctCount}/${total} 🎉`);
    }
  });
}

// Kategori-knapper (valgfritt): laster alle spørsmål i kategorien og viser som “kort” i en container
document.querySelectorAll(".category-button")?.forEach(btn => {
  btn.addEventListener("click", async () => {
    const categoryId = btn.dataset.category;
    const quizzes = await loadQuizForCategory(categoryId);
    renderQuizList(quizzes, categoryId);
  });
});

// Render listevisning (ikke modal) – brukes når man åpner en kategori
function renderQuizList(quizzes, categoryId) {
  const container = document.getElementById("quiz-container");
  if (!container) return;
  container.innerHTML = "";

  if (!quizzes.length) {
    container.innerHTML = `<p>Ingen spørsmål funnet for denne kategorien.</p>`;
    return;
  }

  const title = document.createElement("h2");
  title.textContent = "Quiz: " + categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
  container.appendChild(title);

  quizzes.forEach(q => {
    const card = document.createElement("div");
    card.className = "quiz-card";
    card.dataset.category = categoryId;

    const question = document.createElement("p");
    question.textContent = q.question;
    card.appendChild(question);

    (q.options || []).forEach(option => {
      const btn = document.createElement("button");
      btn.textContent = option;
      btn.className = "quiz-option";
      btn.onclick = () => {
        const isCorrect = option === q.answer;
        Array.from(card.querySelectorAll("button")).forEach(b => b.disabled = true);
        if (isCorrect) {
          btn.classList.add("correct");
          addCorrectAndMaybePoint(title.textContent.replace("Quiz: ",""));
        } else {
          btn.classList.add("wrong");
          const correctBtn = Array.from(card.querySelectorAll("button")).find(b => b.textContent === q.answer);
          if (correctBtn) correctBtn.classList.add("correct");
        }
      };
      card.appendChild(btn);
    });

    container.appendChild(card);
  });
}

// Modal-flow (ett spørsmål av gangen)
function runQuizFlow({ title="Quiz", questions=[], onEnd=()=>{} }){
  ensureQuizUI();
  const qs = {
    title: document.getElementById('quizTitle'),
    q: document.getElementById('quizQ'),
    choices: document.getElementById('quizChoices'),
    progress: document.getElementById('quizProgress'),
    feedback: document.getElementById('quizFeedback')
  };
  qs.title.textContent = title;

  let i = 0, correctCount = 0;

  function renderStep(){
    const q = questions[i];
    qs.q.textContent = q.text;
    qs.choices.innerHTML = q.choices.map((opt, idx)=>`<button data-idx="${idx}">${opt}</button>`).join('');
    qs.progress.textContent = `${i+1}/${questions.length}`;
    qs.feedback.textContent = '';

    qs.choices.querySelectorAll('button').forEach(btn=>{
      btn.onclick = () => {
        const chosen = Number(btn.dataset.idx);
        const ok = chosen === Number(q.answerIndex);
        btn.classList.add(ok ? 'correct' : 'wrong');
        qs.feedback.textContent = ok ? 'Riktig ✅' : 'Feil ❌';
        if (ok) correctCount++;

        qs.choices.querySelectorAll('button').forEach(b=>b.disabled = true);

        setTimeout(()=>{
          i++;
          if (i < questions.length){
            renderStep();
          } else {
            closeQuiz();
            onEnd(correctCount, questions.length);
          }
        }, QUIZ_FEEDBACK_MS);
      };
    });
  }

  renderStep();
}

// Auto-fallback første last (valgfritt: vis “historie”)
window.addEventListener("DOMContentLoaded", async () => {
  const defaultCategory = "historie";
  const container = document.getElementById("quiz-container");
  if (!container) return;
  const quizzes = await loadQuizForCategory(defaultCategory);
  renderQuizList(quizzes, defaultCategory);
});

// Eksponer for HTML onclick
window.startQuizForPerson = startQuizForPerson;
window.closePlaceOverlay = closePlaceOverlay;
