// =====================================================
// HISTORY GO – APP.JS – MODULOVERSIKT
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
// 10. GEOLOKASJON OG MAP-MODUS
// 11. INITIALISERING OG BOOT
// 12. STED-OVERLAY (tekst + personer)
// 13. MERKE-OPPDATERING VED VISNING
//
// 🟩 Nye funksjoner:
//     Legg dem i riktig modul og bruk samme
//     kommentar-format, f.eks.:
//     // -----------------------------------------------------
//     // 14. DIPLOM OG BRUKERPROFIL
//     // -----------------------------------------------------
//

// ==============================
// 1. KONSTANTER OG INIT-VARIABLER
// ==============================
const START = { lat: 59.9139, lon: 10.7522, zoom: 13 };
const NEARBY_LIMIT = 2;
const QUIZ_FEEDBACK_MS = 650; // én kilde sannhet

let PLACES = [];
let PEOPLE = [];

const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

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

  merits:     document.getElementById('merits'),
  gallery:    document.getElementById('gallery'),

  pc:         document.getElementById('placeCard'),
  pcTitle:    document.getElementById('pcTitle'),
  pcMeta:     document.getElementById('pcMeta'),
  pcDesc:     document.getElementById('pcDesc'),
  pcMore:     document.getElementById('pcMore'),
  pcUnlock:   document.getElementById('pcUnlock'),
  pcRoute:    document.getElementById('pcRoute'),
  pcClose:    document.getElementById('pcClose'),

  quizModal:  document.getElementById('quizModal'),
  quizTitle:  document.getElementById('quizTitle'),
  quizQ:      document.getElementById('quizQuestion'),
  quizChoices:document.getElementById('quizChoices'),
  quizProgress:document.getElementById('quizProgress'),
  quizFeedback:document.getElementById('quizFeedback'),
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
  return "#1976d2";
}
function catClass(cat=""){
  const c = cat.toLowerCase();
  if (c.includes("kultur")) return "kult";
  if (c.includes("urban"))  return "urban";
  if (c.includes("sport"))  return "sport";
  if (c.includes("natur"))  return "natur";
  if (c.includes("vitenskap")) return "viten";
  return "hist";
}
function tagToCat(tags=[]){
  const t = (tags.join(" ")||"").toLowerCase();
  if (t.includes("kultur")) return "Kultur";
  if (t.includes("urban"))  return "Urban Life";
  if (t.includes("sport"))  return "Sport";
  if (t.includes("natur"))  return "Natur";
  if (t.includes("vitenskap")) return "Vitenskap";
  return "Historie";
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
    showToast('Rute lagt (gatevis).', 1600);
  }catch(e){
    routeLine = L.polyline([from, to], {color:'#cfe8ff', weight:5, opacity:1}).addTo(MAP);
    MAP.fitBounds(routeLine.getBounds(), {padding:[40,40]});
    showToast('Vis som linje (ingen ruter-tjeneste)', 2000);
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
    // sikrer koordinater fra placeId om mangler
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
    mk.unbindPopup(); // hindrer Leaflet i å vise "fun fact"-popup
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
    if (merits[cat].points >= 10) merits[cat].level = "Mester";
    else if (merits[cat].points >= 5) merits[cat].level = "Kjentmann";
    saveMerits();

    showToast(`Låst opp: ${p.name} ✅`);
  };
  el.pcRoute.onclick = ()=> showRouteTo(p);

  // åpner ny overlay (les mer + personer)
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
  el.collectionCount.textContent = items.length;
  const first = items.slice(0, 18);
  el.collectionGrid.innerHTML = first.map(p => `
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
/* =======================================================
   HISTORY GO – Dynamisk lasting av quiz per kategori
   ======================================================= */

async function loadQuizForCategory(categoryId) {
  try {
    const fileMap = {
      "historie": "quiz_historie.json",
      "kunst": "quiz_kunst.json",
      "sport": "quiz_sport.json",
      "politikk": "quiz_politikk.json",
      "populaerkultur": "quiz_populaerkultur.json",
      "musikk": "quiz_musikk.json"
    };

    const file = fileMap[categoryId];
    if (!file) {
      console.warn("Ingen quizfil funnet for kategori:", categoryId);
      return [];
    }

    const response = await fetch(file, { cache: "no-store" });
    if (!response.ok) throw new Error("Feil ved lasting av " + file);
    const quizzes = await response.json();

    if (!Array.isArray(quizzes)) {
      console.error("Feil format i", file);
      return [];
    }

    console.log(`✅ Lastet ${quizzes.length} spørsmål fra ${file}`);
    return quizzes.filter(q => q.categoryId === categoryId);
  } catch (err) {
    console.error("Kunne ikke laste quiz for kategori:", categoryId, err);
    return [];
  }
}

/* =======================================================
   Håndter brukerklikk på kategori
   ======================================================= */

document.querySelectorAll(".category-button").forEach(btn => {
  btn.addEventListener("click", async () => {
    const categoryId = btn.dataset.category;
    const quizzes = await loadQuizForCategory(categoryId);
    renderQuiz(quizzes, categoryId);
  });
});

/* =======================================================
   Automatisk fallback ved første innlasting
   ======================================================= */

window.addEventListener("DOMContentLoaded", async () => {
  const defaultCategory = "historie"; // fallback
  const quizzes = await loadQuizForCategory(defaultCategory);
  renderQuiz(quizzes, defaultCategory);
});

/* =======================================================
   Viser quizen i UI
   ======================================================= */

function renderQuiz(quizzes, categoryId) {
  const container = document.getElementById("quiz-container");
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

    const question = document.createElement("p");
    question.textContent = q.question;
    card.appendChild(question);

    q.options.forEach(option => {
      const btn = document.createElement("button");
      btn.textContent = option;
      btn.className = "quiz-option";
      btn.onclick = () => checkAnswer(btn, option, q.answer);
      card.appendChild(btn);
    });

    container.appendChild(card);
  });
}
/* =======================================================
   START QUIZ FOR PERSON – NY DYNAMISK VERSJON
   ======================================================= */
async function startQuizForPerson(personId) {
  try {
    const person = PEOPLE.find(p => p.id === personId);
    if (!person) {
      console.warn("Fant ikke person med id:", personId);
      showToast("Fant ikke person");
      return;
    }

    const categoryId = tagToCat(person.tags)?.toLowerCase();
    if (!categoryId) {
      console.warn("Fant ingen kategori for:", person.name);
      showToast("Ingen kategori tilknyttet denne personen");
      return;
    }

    const quizzes = await loadQuizForCategory(categoryId);
    const quiz = quizzes.find(q => q.personId === personId);
    if (!quiz) {
      showToast("Ingen quiz tilgjengelig for " + person.name);
      return;
    }

    renderQuiz([quiz], categoryId);
    console.log(`🎯 Åpnet quiz for ${person.name} i kategori ${categoryId}`);
  } catch (err) {
    console.error("Feil ved lasting av quiz for person:", err);
    showToast("Kunne ikke laste quiz");
  }
}
/* =======================================================
   Sjekk svar og gi visuell tilbakemelding
   ======================================================= */

function checkAnswer(button, selected, correct) {
  const parent = button.parentElement;
  Array.from(parent.querySelectorAll("button")).forEach(b => b.disabled = true);

  if (selected === correct) {
    button.classList.add("correct");
  } else {
    button.classList.add("wrong");
    const correctBtn = Array.from(parent.querySelectorAll("button")).find(b => b.textContent === correct);
    if (correctBtn) correctBtn.classList.add("correct");
  }
}
/* =======================================================
   Sjekk svar og gi visuell tilbakemelding + poenglogikk
   ======================================================= */
function checkAnswer(button, selected, correct) {
  const parent = button.parentElement;
  Array.from(parent.querySelectorAll("button")).forEach(b => b.disabled = true);

  const isCorrect = selected === correct;
  if (isCorrect) {
    button.classList.add("correct");

    // --- 📊 Poengtelling ---
    const categoryId = parent.closest("[data-category]")?.dataset.category || "ukjent";
    const key = `quiz_correct_${categoryId}`;
    const current = parseInt(localStorage.getItem(key) || "0", 10) + 1;
    localStorage.setItem(key, current);

    if (current >= 3) {
      updateBadgeProgress(categoryId, 1);
      localStorage.setItem(key, 0); // nullstill etter poeng
      showToast(`+1 poeng i ${categoryId}!`);
      console.log(`🏅 Bruker fikk poeng i ${categoryId}`);
    }
  } else {
    button.classList.add("wrong");
    const correctBtn = Array.from(parent.querySelectorAll("button")).find(b => b.textContent === correct);
    if (correctBtn) correctBtn.classList.add("correct");
  }
}
// ==============================
// 8. MERKER, NIVÅER OG FREMGANG
// ==============================
async function renderMerits() {
  const container = document.getElementById("merits");
  if (!container) return;

  const badges = await fetch("badges.json").then(r => r.json());
  const merits = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

  const cats = Object.keys(merits).length ? Object.keys(merits) : badges.map(b => b.name);

  container.innerHTML = cats.map(cat => {
    const m = merits[cat] || { level: "Nybegynner", points: 0 };
    const badge = badges.find(b =>
      cat.toLowerCase().includes(b.id) ||
      b.name.toLowerCase().includes(cat.toLowerCase())
    );
    const icon = badge ? badge.icon : "⭐";

    const lower = cat.toLowerCase();
    let color = "#1976d2";
    if (lower.includes("kultur")) color = "#e63946";
    else if (lower.includes("urban")) color = "#ffb703";
    else if (lower.includes("sport")) color = "#2a9d8f";
    else if (lower.includes("natur")) color = "#4caf50";
    else if (lower.includes("vitenskap")) color = "#9b59b6";

    let status = `Nivå: ${m.level} • Poeng: ${m.points}`;
    if (badge) {
      const next = badge.tiers.find(t => m.points < t.threshold);
      status = next ? `${m.points}/${next.threshold} poeng (→ ${next.label})`
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
  if (thresholds.includes(newPoints)) {
    showToast(`🏅 Nytt nivå i ${cat}!`);
    pulseBadge(cat);
  }
}

/* =======================================================
   HISTORY GO – Poengsystem og progresjon
   ======================================================= */

const userProgress = JSON.parse(localStorage.getItem("historygo_progress")) || {};

// Oppdater poeng når man har svart riktig på tre spørsmål
function updateProgress(categoryId) {
  if (!userProgress[categoryId]) {
    userProgress[categoryId] = { correct: 0, points: 0 };
  }

  userProgress[categoryId].correct++;

  if (userProgress[categoryId].correct % 3 === 0) {
    userProgress[categoryId].points++;
    alert(`⭐ Du har tjent 1 poeng i ${categoryId}!`);
  }

  localStorage.setItem("historygo_progress", JSON.stringify(userProgress));
  updateBadgeDisplay(categoryId);
}

// Viser brukerens fremgang (kan kobles til UI)
function updateBadgeDisplay(categoryId) {
  const display = document.getElementById("progress-display");
  if (!display) return;

  const { correct = 0, points = 0 } = userProgress[categoryId] || {};
  display.textContent = `Riktige svar: ${correct}  •  Poeng: ${points}`;
}

/* =======================================================
   Justert checkAnswer-funksjon
   ======================================================= */

function checkAnswer(button, selected, correct) {
  const parent = button.parentElement;
  Array.from(parent.querySelectorAll("button")).forEach(b => b.disabled = true);

  const categoryId = document.querySelector("h2").textContent.toLowerCase().replace("quiz: ", "");

  if (selected === correct) {
    button.classList.add("correct");
    updateProgress(categoryId);
  } else {
    button.classList.add("wrong");
    const correctBtn = Array.from(parent.querySelectorAll("button")).find(b => b.textContent === correct);
    if (correctBtn) correctBtn.classList.add("correct");
  }
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
// 10. GEOLOKASJON OG MAP-MODUS
// ==============================
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

el.btnCenter?.addEventListener('click', ()=>{
  if (currentPos && MAP){
    MAP.setView([currentPos.lat, currentPos.lon], Math.max(MAP.getZoom(), 15), {animate:true});
    showToast("Sentrert");
  }
});
el.btnSeeMap?.addEventListener('click', ()=>{ document.body.classList.add('map-only'); });
el.btnExitMap?.addEventListener('click', ()=>{ document.body.classList.remove('map-only'); });

el.seeMore?.addEventListener('click', ()=>{ buildSeeMoreNearby(); openSheet(el.sheetNear); });

// ==============================
// 11. INITIALISERING OG BOOT
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

function boot(){
  initMap();

  Promise.all([
    fetch('places.json').then(r=>r.ok?r.json():Promise.reject('places.json ' + r.status)),
    fetch('people.json').then(r=>r.ok?r.json():Promise.reject('people.json ' + r.status)).catch((e)=>{ console.error('PEOPLE LOAD FAIL', e); return []; }),
    fetch('quizzes.json').then(r=>r.ok?r.json():Promise.reject('quizzes.json ' + r.status)).catch(()=>[])
  ]).then(([places, people, quizzes])=>{
    PLACES = places||[];
    PEOPLE = people||[];
    QUIZZES = quizzes||[];

    try { drawPlaceMarkers(); } catch(e){ console.error("Feil i drawPlaceMarkers()", e); }
    try { drawPeopleMarkers(); } catch(e){ console.error("Feil i drawPeopleMarkers()", e); }

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
        err => console.warn("Ingen posisjon:", err),
        { enableHighAccuracy: true }
      );
    }

    wire();
  }).catch((e)=>{
    console.error('DATA LOAD ERROR', e);
    showToast("Kunne ikke laste data.", 2000);
  });
}

document.addEventListener('DOMContentLoaded', boot);

// ==============================
// 12. STED-OVERLAY (tekst + personer)
// ==============================
// Henter kort-tekst fra Wikipedia (CORS-vennlig) – fallback til Google-lenke
async function fetchWikiSummary(name){
  try{
    const url = `https://no.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' }});
    if (!res.ok) throw new Error('No wiki');
    const data = await res.json();
    return data.extract || "";
  }catch(_){ return ""; }
}

function closePlaceOverlay(){
  document.getElementById('placeOverlay')?.remove();
}

async function showPlaceOverlay(place) {
  // Fjern tidligere popup hvis den finnes
  document.getElementById('placeOverlay')?.remove();

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
}

// ==============================
// 13. MERKE-OPPDATERING VED VISNING
// ==============================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("section.panel h2").forEach(h2 => {
    if (h2.textContent.trim().startsWith("Merker")) {
      renderMerits();
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) renderMerits();
      }, { threshold: 0.3 });
      observer.observe(h2);
    }
  });
});

// ==============================
// 10. QUIZ-MODAL (UI) – Ligger til slutt så DOM finnes
// ==============================
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

function startQuizForPerson(personId){
  const quiz = (QUIZZES||[]).find(q => q.personId === personId);
  if (!quiz || !quiz.questions || !quiz.questions.length){ showToast('Ingen quiz her enda'); return; }

  ensureQuizUI();
  const qs = {
    title: document.getElementById('quizTitle'),
    q: document.getElementById('quizQ'),
    choices: document.getElementById('quizChoices'),
    progress: document.getElementById('quizProgress'),
    feedback: document.getElementById('quizFeedback')
  };

  qs.title.textContent = quiz.title || 'Quiz';
  let i = 0, correctCount = 0;

  function renderStep(){
    const q = quiz.questions[i];
    qs.q.textContent = q.text;
    qs.choices.innerHTML = q.choices.map((opt, idx)=>`<button data-idx="${idx}">${opt}</button>`).join('');
    qs.progress.textContent = `${i+1}/${quiz.questions.length}`;
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
          if (i < quiz.questions.length){
            renderStep();
          } else {
            closeQuiz();

            // Oppdater merits
            try {
              const cat = tagToCat((QUIZZES.find(q => q.personId === personId)?.tags) || []);
              const points = correctCount;
              merits[cat] = merits[cat] || { level: "Nybegynner", points: 0 };
              merits[cat].points += points;

              if (merits[cat].points >= 10) merits[cat].level = "Mester";
              else if (merits[cat].points >= 5) merits[cat].level = "Kjentmann";

              saveMerits();
              updateMeritLevel(cat, merits[cat].points);
            } catch (e) {
              console.warn("Kunne ikke oppdatere merits", e);
            }

            showToast(`Quiz fullført: ${correctCount}/${quiz.questions.length} 🎉`);
          }
        }, QUIZ_FEEDBACK_MS);
      };
    });
  }

  openQuiz();
  renderStep();
}

// globalt for eksisterende knapper (om brukt i HTML)
window.startQuizForPerson = startQuizForPerson;
