// ==============================
// History Go – app.js (v14)
// - Personer på kart (initialer-ikoner)
// - “Mer info” → Google
// - Engangs-sentrer-knapp
// - Rute: OSRM (valgfritt) eller lys fallback-linje
// - Min samling: små ikoner (3/rad) + sheet for resten
// - Galleri: KUN samlede personer
// - “Se flere i nærheten” sheet
// - Quiz-feedback tregere
// - Kartpanel gjennomsiktig (kartprikker skimter)
// ==============================

// ---- Konstanter ----
const START = { lat: 59.9139, lon: 10.7522, zoom: 13 };
const NEARBY_LIMIT = 2;
const QUIZ_FEEDBACK_MS = 2600;

// Valgfritt: pek til en OSRM-server for faktisk gangrute (hvis tom → fallback rett linje)
const OSRM_URL = ""; // f.eks: "https://router.project-osrm.org/route/v1/foot"

// ---- State ----
let PLACES = [];
let PEOPLE = [];
let QUIZZES = [];

const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}"); // {Kategori:{level,points}}

function saveVisited(){  localStorage.setItem("visited_places", JSON.stringify(visited));  renderCollection(); }
function savePeople(){   localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); renderGallery(); }
function saveMerits(){   localStorage.setItem("merits_by_category", JSON.stringify(merits)); renderMerits(); }

// ---- DOM ----
const el = {
  map:        document.getElementById('map'),
  toast:      document.getElementById('toast'),
  status:     document.getElementById('status'),
  btnSeeMap:  document.getElementById('btnSeeMap'),
  btnExitMap: document.getElementById('btnExitMap'),
  btnCenter:  document.getElementById('btnCenter'),
  test:       document.getElementById('testToggle'),
  // lists
  list:       document.getElementById('nearbyList'),
  nearPeople: document.getElementById('nearbyPeople'),
  seeMore:    document.getElementById('btnSeeMoreNearby'),
  sheetNear:  document.getElementById('sheetNearby'),
  sheetNearBody: document.getElementById('sheetNearbyBody'),
  // collection
  collectionGrid: document.getElementById('collectionGrid'),
  collectionCount:document.getElementById('collectionCount'),
  btnMoreCollection: document.getElementById('btnMoreCollection'),
  sheetCollection: document.getElementById('sheetCollection'),
  sheetCollectionBody: document.getElementById('sheetCollectionBody'),
  // merits & gallery
  merits:     document.getElementById('merits'),
  gallery:    document.getElementById('gallery'),
  // place card
  pc:         document.getElementById('placeCard'),
  pcTitle:    document.getElementById('pcTitle'),
  pcMeta:     document.getElementById('pcMeta'),
  pcDesc:     document.getElementById('pcDesc'),
  pcMore:     document.getElementById('pcMore'),
  pcUnlock:   document.getElementById('pcUnlock'),
  pcRoute:    document.getElementById('pcRoute'),
  pcClose:    document.getElementById('pcClose'),
  // quiz
  quizModal:  document.getElementById('quizModal'),
  quizTitle:  document.getElementById('quizTitle'),
  quizQ:      document.getElementById('quizQuestion'),
  quizChoices:document.getElementById('quizChoices'),
  quizProgress:document.getElementById('quizProgress'),
  quizFeedback:document.getElementById('quizFeedback'),
};

// ---- Farger ----
function catColor(cat=""){
  const c = cat.toLowerCase();
  if (c.includes("kultur")) return "#e63946";
  if (c.includes("urban"))  return "#ffb703";
  if (c.includes("sport"))  return "#2a9d8f";
  if (c.includes("natur"))  return "#4caf50";
  if (c.includes("vitenskap")) return "#9b59b6";
  return "#1976d2"; // Historie / default
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

// ---- Geo ----
function distMeters(a,b){
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

// ---- Toast ----
function showToast(msg="OK", ms=1400){
  el.toast.textContent = msg;
  el.toast.style.display = "block";
  setTimeout(()=> el.toast.style.display="none", ms);
}

// ==============================
// Kart (Leaflet)
// ==============================
let MAP, placeLayer, peopleLayer, userMarker, userPulse, routeLayer;

function initMap() {
  MAP = L.map('map', { zoomControl:false, attributionControl:false })
          .setView([START.lat, START.lon], START.zoom);

  // Natt tiles (tydeligere)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap, © CARTO'
  }).addTo(MAP);

  placeLayer  = L.layerGroup().addTo(MAP);
  peopleLayer = L.layerGroup().addTo(MAP);
  routeLayer  = L.layerGroup().addTo(MAP);
}

function drawPlaceMarkers() {
  placeLayer.clearLayers();
  PLACES.forEach(p=>{
    const m = L.circleMarker([p.lat, p.lon], {
      radius: 7, color: catColor(p.category), weight: 3, opacity: 1,
      fillColor: "#0d1b2a", fillOpacity: 0.9
    }).addTo(placeLayer);

    // stor usynlig hitbox:
    const hb = L.circle([p.lat, p.lon], {radius: 36, opacity:0, fillOpacity:0}).addTo(placeLayer);

    const openCard = () => openPlaceCard(p);
    m.on('click', openCard);
    hb.on('click', openCard);
  });
}

function drawPeopleMarkers() {
  peopleLayer.clearLayers();
  PEOPLE.forEach(pr=>{
    const color = catColor(tagToCat(pr.tags));
    const html = `
      <div style="
        width:28px;height:28px;border-radius:999px;
        background:${color}; color:#0d1b2a;
        display:flex;align-items:center;justify-content:center;
        font-weight:900; font-size:12px; border:2px solid #0d1b2a;
        box-shadow:0 0 0 3px rgba(0,0,0,.25);
      ">${(pr.initials||'').slice(0,2).toUpperCase()}</div>`;
    const icon = L.divIcon({ className:"", html, iconSize:[28,28], iconAnchor:[14,14] });

    const lat = pr.lat ?? (PLACES.find(x=>x.id===pr.placeId)?.lat);
    const lon = pr.lon ?? (PLACES.find(x=>x.id===pr.placeId)?.lon);
    if (lat==null || lon==null) return;

    const mk = L.marker([lat,lon], { icon }).addTo(peopleLayer);
    const hb = L.circle([lat, lon], {radius: 36, opacity:0, fillOpacity:0}).addTo(peopleLayer);

    const openFromPerson = () => openPlaceCardByPerson({ ...pr, lat, lon });
    mk.on('click', openFromPerson);
    hb.on('click', openFromPerson);
  });
}

function setUser(lat, lon){
  if (!MAP) return;
  if (!userMarker){
    userMarker = L.circleMarker([lat,lon], {
      radius:8, weight:2, color:'#fff', fillColor:'#1976d2', fillOpacity:1
    }).addTo(MAP).bindPopup('Du er her');
    userPulse = L.circle([lat,lon], { radius: 25, color:'#00e676', weight:1, opacity:.6, fillColor:'#00e676', fillOpacity:.12
    }).addTo(MAP);
  } else {
    userMarker.setLatLng([lat,lon]);
    userPulse.setLatLng([lat,lon]);
  }
}

// ---- Rute (OSRM hvis satt, ellers lys linje) ----
async function drawRouteTo(lat, lon){
  routeLayer.clearLayers();
  if (!currentPos){ showToast("Ukjent posisjon"); return; }

  const from = [currentPos.lon, currentPos.lat];
  const to   = [lon, lat];

  if (OSRM_URL){
    try{
      const url = `${OSRM_URL}/${from.join(',')};${to.join(',')}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      const coords = data?.routes?.[0]?.geometry?.coordinates;
      if (coords && coords.length){
        const latlngs = coords.map(([x,y])=>[y,x]);
        L.polyline(latlngs, {
          weight: 6, opacity: 1, color: '#e0f7fa' // lys “dag” på nattkart
        }).addTo(routeLayer);
        MAP.fitBounds(L.latLngBounds(latlngs), {padding:[30,30]});
        showToast("Rute klar");
        return;
      }
    }catch(_){}
  }
  // Fallback: rett linje (lys)
  const line = L.polyline([[currentPos.lat,currentPos.lon],[lat,lon]], { weight:6, color:'#e0f7fa', opacity:1 }).addTo(routeLayer);
  MAP.fitBounds(line.getBounds(), {padding:[30,30]});
  showToast("Vist som linje (ingen ruter-tjeneste)");
}

// ==============================
// Place Card
// ==============================
let currentPlace = null;

function openPlaceCard(p){
  currentPlace = p;
  el.pcTitle.textContent = p.name;
  el.pcMeta.textContent  = `${p.category} • radius ${p.r||120} m`;
  el.pcDesc.textContent  = p.desc || "";
  el.pc.setAttribute('aria-hidden','false');

  // “Mer info” → Google
  const q = encodeURIComponent(`${p.name} Oslo`);
  el.pcMore.href = `https://www.google.com/search?q=${q}`;

  el.pcUnlock.textContent = visited[p.id] ? "Allerede låst" : "Lås opp";
  el.pcUnlock.disabled = !!visited[p.id];
  el.pcUnlock.onclick = ()=> {
    if (visited[p.id]) { showToast("Allerede låst"); return; }
    visited[p.id] = true; saveVisited();
    showToast(`Låst opp: ${p.name} ✅`);
  };

  el.pcRoute.onclick = ()=> drawRouteTo(p.lat, p.lon);
}

function openPlaceCardByPerson(person){
  const place = PLACES.find(x => x.id === person.placeId) || {
    id:"personloc", name:person.name, category: tagToCat(person.tags),
    r: person.r || 150, desc: person.desc || "", lat: person.lat, lon: person.lon
  };
  openPlaceCard(place);
  // Bytt “Lås opp” til “Ta quiz”
  el.pcUnlock.textContent = "Ta quiz";
  el.pcUnlock.disabled = false;
  el.pcUnlock.onclick = ()=> startQuizForPerson(person.id);
}

el.pcClose.addEventListener('click', ()=> {
  el.pc.setAttribute('aria-hidden','true');
  el.pcUnlock.textContent = "Lås opp";
  el.pcUnlock.disabled = false;
});

// ==============================
// Render – lister
// ==============================
let currentPos = null;

function renderNearbyPlaces(){
  const sorted = PLACES
    .map(p => ({...p, _d: currentPos ? Math.round(distMeters(currentPos, {lat:p.lat,lon:p.lon})) : null }))
    .sort((a,b)=>(a._d??1e12)-(b._d??1e12));
  const subset = sorted.slice(0, NEARBY_LIMIT);
  el.list.innerHTML = subset.map(renderPlaceCard).join("");
}

function renderNearbyPeople(){
  if (!currentPos) { el.nearPeople.innerHTML = ""; return; }
  const candidates = PEOPLE
    .map(pr=>{
      const base = PLACES.find(x=>x.id===pr.placeId);
      const lat = pr.lat ?? base?.lat, lon = pr.lon ?? base?.lon;
      return (!lat||!lon) ? null : ({ ...pr, lat, lon, _d: Math.round(distMeters(currentPos,{lat,lon})) });
    })
    .filter(Boolean)
    .sort((a,b)=>a._d-b._d)
    .slice(0, 6);

  el.nearPeople.innerHTML = candidates.map(renderPersonCardInline).join("");
}

function renderPlaceCard(p){
  const google = `https://www.google.com/search?q=${encodeURIComponent(p.name+" Oslo")}`;
  return `
    <article class="card">
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${p.category||""} • Oslo</div>
        <p class="desc">${p.desc||""}</p>
      </div>
      <div class="row between">
        <div class="dist">${p._d==null ? "" : (p._d<1000? `${p._d} m` : `${(p._d/1000).toFixed(1)} km`)}</div>
        <a class="ghost-btn" href="${google}" target="_blank" rel="noopener">Mer info</a>
      </div>
    </article>
  `;
}

function renderPersonCardInline(pr){
  const cat = tagToCat(pr.tags);
  const color = catColor(cat);
  return `
    <article class="card">
      <div>
        <div class="name">${pr.name}</div>
        <div class="meta">${cat}</div>
        <p class="desc">${pr.desc||""}</p>
      </div>
      <div class="row between">
        <div class="dist">${pr._d<1000? `${pr._d} m` : `${(pr._d/1000).toFixed(1)} km`}</div>
        <button class="primary-btn" data-quiz="${pr.id}">Ta quiz</button>
      </div>
    </article>
  `;
}

function renderCollection(){
  const items = PLACES.filter(p => visited[p.id]);
  el.collectionCount.textContent = items.length;

  // små ikon-badges (3 pr rad)
  const first = items.slice(0, 9);
  const rest  = items.slice(9);

  el.collectionGrid.innerHTML = first.map(p => `
    <div class="collection-item ${catClass(p.category)}">
      <span class="dot" style="background:${catColor(p.category)}"></span>
      <span class="label">${p.name}</span>
    </div>`).join("");

  if (rest.length){
    el.btnMoreCollection.style.display = "inline-flex";
    el.btnMoreCollection.onclick = ()=>{
      el.sheetCollectionBody.innerHTML = rest.map(p => `
        <div class="collection-item ${catClass(p.category)}">
          <span class="dot" style="background:${catColor(p.category)}"></span>
          <span class="label">${p.name}</span>
        </div>`).join("");
      openSheet(el.sheetCollection);
    };
  } else {
    el.btnMoreCollection.style.display = "none";
  }
}

function renderMerits(){
  const cats = new Set(PLACES.map(p=>p.category).concat(["Vitenskap"]));
  el.merits.innerHTML = [...cats].map(cat=>{
    const m = merits[cat] || { level: "Nybegynner", points: 0 };
    return `
      <div class="card">
        <div class="name">${cat}</div>
        <div class="meta">Nivå: ${m.level} • Poeng: ${m.points}</div>
        <div class="row right"><button class="ghost-btn" disabled>Progresjon</button></div>
      </div>
    `;
  }).join("");
}

function renderGallery(){
  const got = PEOPLE.filter(p => !!peopleCollected[p.id]);
  el.gallery.innerHTML = got.length ? got.map(p=>{
    const cat = tagToCat(p.tags);
    return `
      <div class="person-item ${catClass(cat)}">
        <span class="dot" style="background:${catColor(cat)}">${(p.initials||'').slice(0,2).toUpperCase()}</span>
        <span class="label">${p.name}</span>
      </div>`;
  }).join("") : `<div class="muted">Samle personer ved å møte dem og klare quizen.</div>`;
}

// “Se flere i nærheten”
function buildSeeMoreNearby(){
  const sorted = PLACES
    .map(p => ({...p, _d: currentPos ? Math.round(distMeters(currentPos, {lat:p.lat,lon:p.lon})) : null }))
    .sort((a,b)=>(a._d??1e12)-(b._d??1e12));
  el.sheetNearBody.innerHTML = sorted.slice(NEARBY_LIMIT, NEARBY_LIMIT+18).map(renderPlaceCard).join("");
}

// Delegerte klikk
document.addEventListener('click', (e)=>{
  const quizId = e.target.getAttribute?.('data-quiz');
  if (quizId) startQuizForPerson(quizId);
});

// ==============================
// Sheets
// ==============================
function openSheet(sheet){ sheet?.setAttribute('aria-hidden','false'); }
function closeSheet(sheet){ sheet?.setAttribute('aria-hidden','true'); }
document.querySelectorAll('[data-close]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sel = btn.getAttribute('data-close');
    document.querySelector(sel)?.setAttribute('aria-hidden','true');
  });
});

// ==============================
// Quiz
// ==============================
let quizState = null;

function startQuizForPerson(personId){
  const q = QUIZZES.filter(x=>x.personId===personId);
  if (!q || !q.length) { showToast("Ingen quiz enda – kommer!"); return; }

  quizState = { quiz: q[0], i: 0, answers: [] };
  el.quizTitle.textContent = quizState.quiz.title;
  el.quizFeedback.textContent = "";
  showQuizQuestion();
  el.quizModal.setAttribute('aria-hidden','false');
}

function showQuizQuestion(){
  const { quiz, i } = quizState;
  const item = quiz.questions[i];
  el.quizQ.textContent = item.text;
  el.quizChoices.innerHTML = item.choices.map((c, idx)=>`
    <button data-choice="${idx}">${c}</button>
  `).join("");
  el.quizProgress.textContent = `Spørsmål ${i+1} av ${quiz.questions.length}`;

  el.quizChoices.querySelectorAll('button').forEach(btn=>{
    btn.onclick = ()=>{
      const pick = Number(btn.getAttribute('data-choice'));
      const correct = (pick === item.answerIndex);
      btn.classList.add(correct ? 'correct':'wrong');
      el.quizFeedback.textContent = correct ? "Riktig! 🎉" : (item.explanation || "Feil svar.");

      setTimeout(()=>{
        nextQuizStep(correct);
      }, QUIZ_FEEDBACK_MS);
    };
  });
}

function nextQuizStep(correct){
  const { quiz } = quizState;
  quizState.answers.push(correct);
  quizState.i++;
  if (quizState.i >= quiz.questions.length){
    const allCorrect = quizState.answers.every(x=>x);
    const cat = quiz.reward?.category || "Historie";
    const pts = quiz.reward?.points || 1;
    merits[cat] = merits[cat] || { level:"Nybegynner", points:0 };
    merits[cat].points += pts;
    if (merits[cat].points >= 10) merits[cat].level = "Mester";
    else if (merits[cat].points >= 5) merits[cat].level = "Kjentmann";
    saveMerits();

    peopleCollected[quiz.personId] = Date.now();
    savePeople();

    el.quizFeedback.textContent = allCorrect ? "Flott! Merke oppdatert ✨" : "Ferdig – prøv igjen for full score!";
    setTimeout(()=>{
      el.quizModal.setAttribute('aria-hidden','true');
      renderNearbyPeople();
      renderGallery();
    }, 900);
  } else {
    el.quizFeedback.textContent = "";
    showQuizQuestion();
  }
}

document.getElementById('quizClose').addEventListener('click', ()=>{
  el.quizModal.setAttribute('aria-hidden','true');
});

// ==============================
// Geolokasjon
// ==============================
function requestLocation(){
  if (!navigator.geolocation){
    el.status.textContent = "Geolokasjon støttes ikke.";
    renderNearbyPlaces(); renderNearbyPeople();
    return;
  }
  el.status.textContent = "Henter posisjon…";
  navigator.geolocation.getCurrentPosition(g=>{
    currentPos = { lat:g.coords.latitude, lon:g.coords.longitude };
    el.status.textContent = "Posisjon funnet.";
    setUser(currentPos.lat, currentPos.lon);
    renderNearbyPlaces();
    renderNearbyPeople();
  }, _=>{
    el.status.textContent = "Kunne ikke hente posisjon.";
    renderNearbyPlaces();
    renderNearbyPeople();
  }, { enableHighAccuracy:true, timeout:8000, maximumAge:10000 });
}

// Engangs-sentrering (ikke toggle)
el.btnCenter.addEventListener('click', ()=>{
  if (currentPos && MAP){
    MAP.setView([currentPos.lat, currentPos.lon], Math.max(MAP.getZoom(), 15), {animate:true});
    showToast("Sentrert");
  }
});

// Kart-modus
el.btnSeeMap.addEventListener('click', ()=>{
  document.body.classList.add('map-only');
  el.btnCenter.style.display = "inline-flex";
  el.btnExitMap.style.display = "inline-flex";
});
el.btnExitMap.addEventListener('click', ()=>{
  document.body.classList.remove('map-only');
  el.btnCenter.style.display = "none";
  el.btnExitMap.style.display = "none";
});

// “Se flere i nærheten”
el.seeMore.addEventListener('click', ()=>{
  buildSeeMoreNearby();
  openSheet(el.sheetNear);
});

// ==============================
// Init
// ==============================
function wire(){
  el.test?.addEventListener('change', e=>{
    if (e.target.checked){
      currentPos = { lat: START.lat, lon: START.lon };
      el.status.textContent = "Testmodus: Oslo sentrum";
      setUser(currentPos.lat, currentPos.lon);
      renderNearbyPlaces();
      renderNearbyPeople();
      showToast("Testmodus PÅ");
    } else {
      showToast("Testmodus AV");
      requestLocation();
    }
  });
}

function boot(){
  initMap();

  Promise.all([
    fetch('places.json').then(r=>r.json()),
    fetch('people.json').then(r=>r.json()).catch(()=>[]),
    fetch('quizzes.json').then(r=>r.json()).catch(()=>[])
  ]).then(([places, people, quizzes])=>{
    PLACES = places||[];
    PEOPLE = people||[];
    QUIZZES = quizzes||[];

    drawPlaceMarkers();
    drawPeopleMarkers();

    renderNearbyPlaces();
    renderNearbyPeople();
    renderCollection();
    renderMerits();
    renderGallery();

    requestLocation();
  }).catch(()=>{
    showToast("Kunne ikke laste data.", 1600);
  });

  wire();
}

document.addEventListener('DOMContentLoaded', boot);
