// ==============================
// History Go – app.js (v12)
// ==============================

const START = { lat: 59.9139, lon: 10.7522, zoom: 13 };
const NEARBY_LIMIT = 2;
const QUIZ_FEEDBACK_MS = 2600;

let PLACES = [];
let PEOPLE = [];
let QUIZZES = [];

const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

function saveVisited(){  localStorage.setItem("visited_places", JSON.stringify(visited));  renderCollection(); }
function savePeople(){   localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); renderGallery(); }
function saveMerits(){   localStorage.setItem("merits_by_category", JSON.stringify(merits)); renderMerits(); }

// DOM refs
const el = {
  map:                document.getElementById('map'),
  toast:              document.getElementById('toast'),
  status:             document.getElementById('status'),
  btnSeeMap:          document.getElementById('btnSeeMap'),
  btnExitMap:         document.getElementById('btnExitMap'),
  btnCenter:          document.getElementById('btnCenter'),
  test:               document.getElementById('testToggle'),
  // lists
  list:               document.getElementById('nearbyList'),
  nearPeople:         document.getElementById('nearbyPeople'),
  seeMore:            document.getElementById('btnSeeMoreNearby'),
  sheetNear:          document.getElementById('sheetNearby'),
  sheetNearBody:      document.getElementById('sheetNearbyBody'),
  collectionGrid:     document.getElementById('collectionGrid'),
  collectionCount:    document.getElementById('collectionCount'),
  btnMoreCollection:  document.getElementById('btnMoreCollection'),
  sheetCollection:    document.getElementById('sheetCollection'),
  sheetCollectionBody:document.getElementById('sheetCollectionBody'),
  merits:             document.getElementById('merits'),
  gallery:            document.getElementById('gallery'),
  // place card
  pc:         document.getElementById('placeCard'),
  pcTitle:    document.getElementById('pcTitle'),
  pcMeta:     document.getElementById('pcMeta'),
  pcDesc:     document.getElementById('pcDesc'),
  pcMore:     document.getElementById('pcMore'),
  pcUnlock:   document.getElementById('pcUnlock'),
  pcClose:    document.getElementById('pcClose'),
  // quiz
  quizModal:   document.getElementById('quizModal'),
  quizTitle:   document.getElementById('quizTitle'),
  quizQ:       document.getElementById('quizQuestion'),
  quizChoices: document.getElementById('quizChoices'),
  quizProgress:document.getElementById('quizProgress'),
  quizFeedback:document.getElementById('quizFeedback'),
};

// Colors per category
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

// Helpers
function distMeters(a,b){
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function showToast(msg="OK", ms=1400){
  el.toast.textContent = msg; el.toast.style.display="block";
  setTimeout(()=> el.toast.style.display="none", ms);
}
function tagToCat(tags=[]){
  const t = (tags||[]).join(" ").toLowerCase();
  if (t.includes("kultur")) return "Kultur";
  if (t.includes("urban"))  return "Urban Life";
  if (t.includes("sport"))  return "Sport";
  if (t.includes("natur"))  return "Natur";
  if (t.includes("vitenskap")) return "Vitenskap";
  return "Historie";
}

// ==============================
// Leaflet map
// ==============================
let MAP, placeLayer, peopleLayer, userMarker, userPulse;
function initMap(){
  MAP = L.map('map', { zoomControl:false, attributionControl:false })
          .setView([START.lat, START.lon], START.zoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom:19, attribution:'© OpenStreetMap, © CARTO'
  }).addTo(MAP);
  placeLayer  = L.layerGroup().addTo(MAP);
  peopleLayer = L.layerGroup().addTo(MAP);
}

function drawPlaceMarkers(){
  placeLayer.clearLayers();
  PLACES.forEach(p=>{
    const m = L.circleMarker([p.lat, p.lon], {
      radius: 7, weight: 3, color: catColor(p.category),
      fillColor: "#0d1b2a", fillOpacity: .9, opacity:1
    }).addTo(placeLayer);
    // stor, usynlig hitbox
    const hb = L.circle([p.lat, p.lon], {radius:36, opacity:0, fillOpacity:0}).addTo(placeLayer);
    const openCard = ()=> openPlaceCard(p);
    m.on('click', openCard); hb.on('click', openCard);
  });
}

function drawPeopleMarkers(){
  peopleLayer.clearLayers();
  PEOPLE.forEach(pr=>{
    // bruk stedets posisjon om lat/lon mangler
    if (typeof pr.lat !== "number" || typeof pr.lon !== "number"){
      const pl = PLACES.find(x=>x.id===pr.placeId);
      if (pl){ pr.lat = pl.lat; pr.lon = pl.lon; }
    }
    if (typeof pr.lat !== "number" || typeof pr.lon !== "number") return;

    const cat = tagToCat(pr.tags);
    const html = `
      <div style="
        width:28px;height:28px;border-radius:999px;
        background:${catColor(cat)}; color:#111;
        display:flex;align-items:center;justify-content:center;
        font-weight:900; font-size:12px; border:2px solid #111;
        box-shadow:0 0 0 3px rgba(0,0,0,.25);
      ">${(pr.initials||pr.name?.slice(0,2)||'??').toUpperCase()}</div>`;
    const icon = L.divIcon({ className:"", html, iconSize:[28,28], iconAnchor:[14,14] });

    const mk = L.marker([pr.lat, pr.lon], { icon }).addTo(peopleLayer);
    const hb = L.circle([pr.lat, pr.lon], {radius:36, opacity:0, fillOpacity:0}).addTo(peopleLayer);
    const openFromPerson = ()=> openPlaceCardByPerson(pr);
    mk.on('click', openFromPerson); hb.on('click', openFromPerson);
  });
}

function setUser(lat, lon){
  if (!MAP) return;
  if (!userMarker){
    userMarker = L.circleMarker([lat,lon], { radius:8, weight:2, color:'#fff', fillColor:'#1976d2', fillOpacity:1 })
                   .addTo(MAP).bindPopup('Du er her');
    userPulse  = L.circle([lat,lon], { radius:25, color:'#00e676', weight:1, opacity:.6, fillColor:'#00e676', fillOpacity:.12 })
                   .addTo(MAP);
  } else {
    userMarker.setLatLng([lat,lon]);
    userPulse.setLatLng([lat,lon]);
  }
}

// ==============================
// Place card
// ==============================
let currentPlace = null;

function openPlaceCard(p){
  currentPlace = p;
  el.pcTitle.textContent = p.name;
  el.pcMeta.textContent  = `${p.category} • radius ${p.r||120} m`;
  el.pcDesc.textContent  = p.desc || "";
  // "Mer info" → Google
  const q = encodeURIComponent(`${p.name} Oslo`);
  el.pcMore.href = `https://www.google.com/search?q=${q}`;
  el.pc.setAttribute('aria-hidden','false');

  el.pcUnlock.textContent = visited[p.id] ? "Allerede låst" : "Lås opp";
  el.pcUnlock.disabled = !!visited[p.id];
  el.pcUnlock.onclick = ()=> {
    if (visited[p.id]) { showToast("Allerede låst opp"); return; }
    visited[p.id] = Date.now(); saveVisited();
    showToast(`Låst opp: ${p.name} ✅`);
  };
}

function openPlaceCardByPerson(person){
  const place = PLACES.find(x=>x.id===person.placeId) || {
    id:"personloc", name:person.name, category: tagToCat(person.tags),
    r: person.r || 150, desc: person.desc || "", lat: person.lat, lon: person.lon
  };
  openPlaceCard(place);
  // gjør knappen til "Ta quiz"
  el.pcUnlock.textContent = "Ta quiz";
  el.pcUnlock.disabled = false;
  el.pcUnlock.onclick  = ()=> startQuizForPerson(person.id);
}
el.pcClose.addEventListener('click', ()=>{
  el.pc.setAttribute('aria-hidden','true');
  el.pcUnlock.textContent = "Lås opp";
  el.pcUnlock.disabled = false;
});

// ==============================
// Renders
// ==============================
let currentPos = null;

function renderNearbyPlaces(){
  const sorted = PLACES
    .map(p => ({...p, _d: currentPos ? Math.round(distMeters(currentPos, {lat:p.lat,lon:p.lon})) : null }))
    .sort((a,b)=>(a._d??1e12)-(b._d??1e12));
  const subset = sorted.slice(0, NEARBY_LIMIT);
  el.list.innerHTML = subset.map(p=>`
    <article class="card">
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${p.category||""} • Oslo</div>
        <p class="desc">${p.desc||""}</p>
      </div>
      <div class="row between">
        <div class="dist">${p._d==null ? "" : (p._d<1000? `${p._d} m` : `${(p._d/1000).toFixed(1)} km`)}</div>
        <a class="ghost-btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(p.name + ' Oslo')}">Mer info</a>
      </div>
    </article>
  `).join("");
}

function renderNearbyPeople(){
  if (!currentPos) { el.nearPeople.innerHTML = ""; return; }
  const candidates = PEOPLE
    .map(pr=>{
      if (typeof pr.lat !== "number" || typeof pr.lon !== "number"){
        const pl = PLACES.find(x=>x.id===pr.placeId);
        if (pl){ pr.lat = pl.lat; pr.lon = pl.lon; }
      }
      const d = (typeof pr.lat === "number") ? Math.round(distMeters(currentPos,{lat:pr.lat,lon:pr.lon})) : 9e9;
      return { ...pr, _d:d };
    })
    .filter(pr => pr._d < 9e9)
    .sort((a,b)=>a._d-b._d)
    .slice(0, 6);

  el.nearPeople.innerHTML = candidates.map(pr=>{
    const cat = tagToCat(pr.tags);
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
  }).join("");
}

function renderCollection(){
  const items = PLACES.filter(p => visited[p.id]);
  el.collectionCount.textContent = items.length;
  const first = items.slice(0, 6);
  const rest  = items.slice(6);

  el.collectionGrid.innerHTML = first.map(p=>`
    <span class="badge ${catClass(p.category)}"><span class="i"></span> ${p.name}</span>
  `).join("");

  if (rest.length){
    el.btnMoreCollection.style.display = "inline-flex";
    el.btnMoreCollection.onclick = ()=>{
      el.sheetCollectionBody.innerHTML = rest.map(p=>`
        <span class="badge ${catClass(p.category)}"><span class="i"></span> ${p.name}</span>
      `).join("");
      openSheet(el.sheetCollection);
    };
  } else el.btnMoreCollection.style.display = "none";
}

function renderMerits(){
  const cats = new Set(PLACES.map(p=>p.category).concat(["Vitenskap"]));
  el.merits.innerHTML = [...cats].map(cat=>{
    const m = merits[cat] || { level:"Nybegynner", points:0 };
    return `
      <div class="card">
        <div class="name">${cat}</div>
        <div class="meta">Nivå: ${m.level} • Poeng: ${m.points}</div>
      </div>
    `;
  }).join("");
}

function renderGallery(){
  const got = PEOPLE.filter(p => !!peopleCollected[p.id]);
  el.gallery.innerHTML = got.length ? got.map(p=>{
    const cat = tagToCat(p.tags);
    return `<span class="badge ${catClass(cat)}"><span class="i"></span> ${p.name}</span>`;
  }).join("") : `<div class="muted">Samle personer ved å møte dem og klare quizen.</div>`;
}

// “Se flere i nærheten” sheet
function buildSeeMoreNearby(){
  const sorted = PLACES
    .map(p => ({...p, _d: currentPos ? Math.round(distMeters(currentPos, {lat:p.lat,lon:p.lon})) : null }))
    .sort((a,b)=>(a._d??1e12)-(b._d??1e12));
  el.sheetNearBody.innerHTML = sorted.slice(NEARBY_LIMIT, NEARBY_LIMIT+24).map(p=>`
    <article class="card">
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${p.category||""} • Oslo</div>
        <p class="desc">${p.desc||""}</p>
      </div>
      <div class="row between">
        <div class="dist">${p._d==null ? "" : (p._d<1000? `${p._d} m` : `${(p._d/1000).toFixed(1)} km`)}</div>
        <a class="ghost-btn" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent(p.name + ' Oslo')}">Mer info</a>
      </div>
    </article>
  `).join("");
}

// Click delegation
document.addEventListener('click', (e)=>{
  const quizId = e.target?.getAttribute?.('data-quiz');
  if (quizId) startQuizForPerson(quizId);
  const closeSel = e.target?.getAttribute?.('data-close');
  if (closeSel){ document.querySelector(closeSel)?.setAttribute('aria-hidden','true'); }
});

// Sheets
function openSheet(sheet){ sheet?.setAttribute('aria-hidden','false'); }

// ==============================
// Quiz
// ==============================
let quizState = null;

function startQuizForPerson(personId){
  const q = QUIZZES.filter(x=>x.personId===personId);
  if (!q || !q.length) { showToast("Ingen quiz enda – kommer!"); return; }
  quizState = { quiz: q[0], i:0, answers:[] };
  el.quizTitle.textContent = quizState.quiz.title;
  el.quizFeedback.textContent = "";
  showQuizQuestion();
  el.quizModal.setAttribute('aria-hidden','false');
}
function showQuizQuestion(){
  const { quiz, i } = quizState;
  const item = quiz.questions[i];
  el.quizQ.textContent = item.text;
  el.quizChoices.innerHTML = item.choices.map((c, idx)=>`<button data-choice="${idx}">${c}</button>`).join("");
  el.quizProgress.textContent = `Spørsmål ${i+1} av ${quiz.questions.length}`;
  el.quizChoices.querySelectorAll('button').forEach(btn=>{
    btn.onclick = ()=>{
      const pick = Number(btn.getAttribute('data-choice'));
      const correct = (pick === item.answerIndex);
      btn.classList.add(correct ? 'correct' : 'wrong');
      el.quizFeedback.textContent = correct ? "Riktig! 🎉" : (item.explanation || "Feil svar.");
      setTimeout(()=> nextQuizStep(correct), QUIZ_FEEDBACK_MS);
    };
  });
}
function nextQuizStep(correct){
  const { quiz } = quizState;
  quizState.answers.push(correct); quizState.i++;
  if (quizState.i >= quiz.questions.length){
    const allCorrect = quizState.answers.every(x=>x);
    const cat = quiz.reward?.category || "Historie";
    const pts = quiz.reward?.points || 1;
    merits[cat] = merits[cat] || { level:"Nybegynner", points:0 };
    merits[cat].points += pts;
    if (merits[cat].points >= 10) merits[cat].level = "Mester";
    else if (merits[cat].points >= 5) merits[cat].level = "Kjentmann";
    saveMerits();
    peopleCollected[quiz.personId] = Date.now(); savePeople();
    el.quizFeedback.textContent = allCorrect ? "Flott! Merke oppdatert ✨" : "Ferdig – prøv igjen for full score!";
    setTimeout(()=>{
      el.quizModal.setAttribute('aria-hidden','true');
      renderNearbyPeople(); renderGallery();
    }, 900);
  } else { el.quizFeedback.textContent = ""; showQuizQuestion(); }
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
    renderNearbyPlaces(); renderNearbyPeople();
  }, _=>{
    el.status.textContent = "Kunne ikke hente posisjon.";
    renderNearbyPlaces(); renderNearbyPeople();
  }, { enableHighAccuracy:true, timeout:8000, maximumAge:10000 });
}

// ==============================
// Kart-modus + sentrer
// ==============================
el.btnSeeMap.addEventListener('click', ()=>{
  document.body.classList.add('map-only');
  el.btnCenter.style.display = "block";
});
el.btnExitMap.addEventListener('click', ()=>{
  document.body.classList.remove('map-only');
  el.btnCenter.style.display = "none";
});
el.btnCenter.addEventListener('click', ()=>{
  if (currentPos && MAP){
    MAP.setView([currentPos.lat, currentPos.lon], Math.max(MAP.getZoom(), 15), {animate:true});
    showToast("Sentrert");
  }
});

// ==============================
// Init
// ==============================
function wire(){
  el.seeMore.addEventListener('click', ()=>{ buildSeeMoreNearby(); openSheet(el.sheetNear); });
  el.test?.addEventListener('change', e=>{
    if (e.target.checked){
      currentPos = { lat: START.lat, lon: START.lon };
      el.status.textContent = "Testmodus: Oslo sentrum";
      setUser(currentPos.lat, currentPos.lon);
      renderNearbyPlaces(); renderNearbyPeople();
      showToast("Testmodus PÅ");
    } else { showToast("Testmodus AV"); requestLocation(); }
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
  }).catch(()=> showToast("Kunne ikke laste data.", 1600));
  wire();
}
document.addEventListener('DOMContentLoaded', boot);
