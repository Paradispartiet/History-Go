// ==============================
// History Go – V2-alpha
// - Rute-stripe (lys) fra deg → valgt sted
// - Personmarkører (initialer) på kartet
// - Filter (kategorier + steder/personer)
// - Forside-ikoner (Mine steder / Mine personer) med navn
// - "Mer info" → Google
// - Kart skimrer svakt under panel
// ==============================

const START = { lat: 59.9139, lon: 10.7522, zoom: 13 };
const NEARBY_LIMIT = 2;
const QUIZ_FEEDBACK_MS = 2600;

let PLACES = [];
let PEOPLE = [];
let QUIZZES = [];
let currentPos = null;

// Storage
const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

function saveVisited(){  localStorage.setItem("visited_places", JSON.stringify(visited));  renderOwnedPlacesIcons(); renderCollectionCount(); }
function savePeople(){   localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); renderOwnedPeopleIcons(); }
function saveMerits(){   localStorage.setItem("merits_by_category", JSON.stringify(merits)); renderMerits(); }

// DOM refs
const el = {
  map: document.getElementById('map'),
  toast: document.getElementById('toast'),
  status: document.getElementById('status'),

  btnSeeMap:  document.getElementById('btnSeeMap'),
  btnExitMap: document.getElementById('btnExitMap'),
  btnCenter:  document.getElementById('btnCenter'),
  btnFilter:  document.getElementById('btnFilter'),
  btnClearRoute: document.getElementById('btnClearRoute'),
  test: document.getElementById('testToggle'),

  list: document.getElementById('nearbyList'),
  seeMore: document.getElementById('btnSeeMoreNearby'),
  sheetNear: document.getElementById('sheetNearby'),
  sheetNearBody: document.getElementById('sheetNearbyBody'),

  collectionCount: document.getElementById('collectionCount'),
  sheetCollection: document.getElementById('sheetCollection'),
  sheetCollectionBody: document.getElementById('sheetCollectionBody'),
  btnMoreCollection: document.getElementById('btnMoreCollection'),

  ownedPlacesGrid: document.getElementById('ownedPlacesGrid'),
  ownedPeopleGrid: document.getElementById('ownedPeopleGrid'),

  merits: document.getElementById('merits'),

  // Place Card
  pc:      document.getElementById('placeCard'),
  pcTitle: document.getElementById('pcTitle'),
  pcMeta:  document.getElementById('pcMeta'),
  pcDesc:  document.getElementById('pcDesc'),
  pcMore:  document.getElementById('pcMore'),
  pcUnlock:document.getElementById('pcUnlock'),
  pcRoute: document.getElementById('pcRoute'),
  pcClose: document.getElementById('pcClose'),

  // Filter sheet
  sheetFilter: document.getElementById('sheetFilter')
};

// Toast
function showToast(msg="OK", ms=1400){
  el.toast.textContent = msg;
  el.toast.style.display = "block";
  setTimeout(()=> el.toast.style.display="none", ms);
}

// Category color/class
function catColor(cat=""){
  const c = cat.toLowerCase();
  if (c.includes("kultur")) return "#e63946";
  if (c.includes("urban"))  return "#ffb703";
  if (c.includes("sport"))  return "#2a9d8f";
  if (c.includes("natur"))  return "#4caf50";
  if (c.includes("vitenskap")) return "#9b59b6";
  return "#1976d2";
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

// Dist
function distMeters(a,b){
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

// =============== Map ===============
let MAP, placeLayer, peopleLayer, routeLayer, userMarker, userPulse;

function initMap(){
  MAP = L.map('map', {zoomControl:false, attributionControl:false})
          .setView([START.lat, START.lon], START.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom:19, attribution:'© OpenStreetMap, © CARTO'
  }).addTo(MAP);

  routeLayer  = L.layerGroup().addTo(MAP);
  placeLayer  = L.layerGroup().addTo(MAP);
  peopleLayer = L.layerGroup().addTo(MAP);
}

function setUser(lat, lon){
  if (!MAP) return;
  if (!userMarker){
    userMarker = L.circleMarker([lat,lon], { radius:8, weight:2, color:'#fff', fillColor:'#1976d2', fillOpacity:1 })
      .addTo(MAP).bindPopup('Du er her');
    userPulse = L.circle([lat,lon], { radius:25, color:'#00e676', weight:1, opacity:.6, fillColor:'#00e676', fillOpacity:.12 })
      .addTo(MAP);
  } else {
    userMarker.setLatLng([lat,lon]);
    userPulse.setLatLng([lat,lon]);
  }
}

// Markers
function drawPlaceMarkers(){
  placeLayer.clearLayers();
  PLACES.forEach(p=>{
    const m = L.circleMarker([p.lat,p.lon], {
      radius:7, color:catColor(p.category), weight:3, opacity:1,
      fillColor:"#0d1b2a", fillOpacity:0.9
    }).addTo(placeLayer);

    const openCard = ()=> openPlaceCard(p);
    m.on('click', openCard);

    // stor usynlig hitbox
    L.circle([p.lat,p.lon], { radius:36, opacity:0, fillOpacity:0 })
      .addTo(placeLayer).on('click', openCard);
  });
}
function drawPeopleMarkers(){
  peopleLayer.clearLayers();
  PEOPLE.forEach(pr=>{
    const bg = catColor(tagToCat(pr.tags));
    const html = `
      <div style="
        width:28px;height:28px;border-radius:999px;
        background:${bg}; color:#111; display:flex;align-items:center;justify-content:center;
        font-weight:900; font-size:12px; border:2px solid #111; box-shadow:0 0 0 3px rgba(0,0,0,.25);
      ">${(pr.initials||'').slice(0,2).toUpperCase()}</div>`;
    const icon = L.divIcon({ className:"", html, iconSize:[28,28], iconAnchor:[14,14]});
    const mk = L.marker([pr.lat, pr.lon], {icon}).addTo(peopleLayer);
    const openFromPerson = ()=> openPlaceCardByPerson(pr);
    mk.on('click', openFromPerson);
    L.circle([pr.lat, pr.lon], {radius:36, opacity:0, fillOpacity:0}).addTo(peopleLayer).on('click', openFromPerson);
  });
}

// Routing (baseline: lys stripe)
function clearRoute(){ routeLayer.clearLayers(); }
function drawRoute(from, to){
  clearRoute();
  if (!from || !to) return;
  // enkel lerp/kurve: midtpunkt flyttes svakt for subtil “bue”
  const mid = { lat:(from.lat+to.lat)/2 + 0.003, lon:(from.lon+to.lon)/2 };
  const latlngs = [[from.lat,from.lon],[mid.lat,mid.lon],[to.lat,to.lon]];
  L.polyline(latlngs, {color:"#fffff0", weight:6, opacity:.45}).addTo(routeLayer);
  L.polyline(latlngs, {color:"#fffacd", weight:3, opacity:.75}).addTo(routeLayer);
  MAP.fitBounds(L.polyline(latlngs).getBounds(), { padding:[30,30] });
}

// =============== Place card ===============
let currentPlace = null;

function openPlaceCard(p){
  currentPlace = p;
  el.pcTitle.textContent = p.name;
  el.pcMeta.textContent  = `${p.category} • radius ${p.r||120} m`;
  el.pcDesc.textContent  = p.desc || "";
  el.pcMore.href = `https://www.google.com/search?q=${encodeURIComponent(p.name + " Oslo")}`;
  el.pc.setAttribute('aria-hidden','false');

  el.pcUnlock.textContent = visited[p.id] ? "Allerede låst opp" : "Lås opp";
  el.pcUnlock.disabled = !!visited[p.id];
  el.pcUnlock.onclick = ()=>{
    if (visited[p.id]) return;
    visited[p.id] = true; saveVisited();
    el.pcUnlock.textContent = "Allerede låst opp";
    el.pcUnlock.disabled = true;
    showToast(`Låst opp: ${p.name} ✅`);
  };

  el.pcRoute.onclick = ()=>{
    if (!currentPos){ showToast("Ingen posisjon ennå"); return; }
    drawRoute(currentPos, {lat:p.lat, lon:p.lon});
    showToast("Viser rute");
  };
}
function openPlaceCardByPerson(person){
  const place = PLACES.find(x=>x.id===person.placeId) || {
    id:"personloc", name:person.name, category: tagToCat(person.tags),
    r: person.r||150, desc: person.desc||"", lat: person.lat, lon: person.lon
  };
  openPlaceCard(place);
  // quiz-knapp
  el.pcUnlock.textContent = "Ta quiz";
  el.pcUnlock.disabled = false;
  el.pcUnlock.onclick = ()=> startQuizForPerson(person.id);
}
el.pcClose.addEventListener('click', ()=> el.pc.setAttribute('aria-hidden','true'));

// =============== Lists / render ===============
function renderNearbyPlaces(){
  const sorted = PLACES
    .map(p=>({...p,_d: currentPos ? Math.round(distMeters(currentPos,{lat:p.lat,lon:p.lon})) : null}))
    .sort((a,b)=>(a._d??1e12)-(b._d??1e12));
  const sub = sorted.slice(0, NEARBY_LIMIT);
  el.list.innerHTML = sub.map(p=>`
    <article class="card">
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${p.category||""} • Oslo</div>
        <p class="desc">${p.desc||""}</p>
      </div>
      <div class="row between">
        <div class="dist">${p._d==null?"":(p._d<1000?`${p._d} m`:`${(p._d/1000).toFixed(1)} km`)}</div>
        <a class="ghost-btn" href="https://www.google.com/search?q=${encodeURIComponent(p.name + ' Oslo')}" target="_blank" rel="noopener">Mer info</a>
      </div>
    </article>
  `).join("");
}
function buildSeeMoreNearby(){
  const sorted = PLACES
    .map(p=>({...p,_d: currentPos ? Math.round(distMeters(currentPos,{lat:p.lat,lon:p.lon})) : null}))
    .sort((a,b)=>(a._d??1e12)-(b._d??1e12));
  el.sheetNearBody.innerHTML = sorted.slice(NEARBY_LIMIT, NEARBY_LIMIT+18).map(p=>`
    <article class="card">
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${p.category||""} • Oslo</div>
        <p class="desc">${p.desc||""}</p>
      </div>
      <div class="row between">
        <div class="dist">${p._d==null?"":(p._d<1000?`${p._d} m`:`${(p._d/1000).toFixed(1)} km`)}</div>
        <button class="ghost-btn" data-open="${p.id}">Åpne</button>
      </div>
    </article>
  `).join("");
}
function renderCollectionCount(){
  const items = PLACES.filter(p=>visited[p.id]);
  el.collectionCount.textContent = items.length;
}
function renderOwnedPlacesIcons(){
  const items = PLACES.filter(p=>visited[p.id]);
  const first = items.slice(0,9);
  el.ownedPlacesGrid.innerHTML = first.map(p=>{
    return `
      <div class="icon-tile" data-open="${p.id}" title="${p.name}">
        <div class="icon-round ${catToRingClass(p.category)}" style="background:${catColor(p.category)}22">
          ${getIconSVG(p.category)}
        </div>
        <div class="icon-name">${p.name}</div>
      </div>`;
  }).join("");

  const rest = items.slice(9);
  if (rest.length){
    el.btnMoreCollection.style.display = "inline-flex";
    el.btnMoreCollection.onclick = ()=>{
      el.sheetCollectionBody.innerHTML = rest.map(p=>`
        <span class="badge">
          <span class="i" style="background:${catColor(p.category)}"></span> ${p.name}
        </span>`).join("");
      openSheet(el.sheetCollection);
    };
  } else {
    el.btnMoreCollection.style.display = "none";
  }
}
function renderOwnedPeopleIcons(){
  const got = PEOPLE.filter(pr => !!peopleCollected[pr.id]);
  el.ownedPeopleGrid.innerHTML = got.length ? got.map(pr=>{
    const cat = tagToCat(pr.tags), bg = catColor(cat);
    const initials = (pr.initials||pr.name||'?').slice(0,2).toUpperCase();
    return `
      <div class="icon-tile" data-quiz="${pr.id}" title="${pr.name}">
        <div class="icon-round ${catToRingClass(cat)}" style="background:${bg}22; color:#111; font-weight:900; font-size:14px;">
          ${initials}
        </div>
        <div class="icon-name">${pr.name}</div>
      </div>`;
  }).join("") : `<div class="muted">Samle personer ved å møte dem og klare quizen.</div>`;
}
function renderMerits(){
  const cats = new Set(PLACES.map(p=>p.category).concat(["Vitenskap"]));
  el.merits.innerHTML = [...cats].map(cat=>{
    const m = merits[cat] || { level:"Nybegynner", points:0 };
    return `
      <div class="card">
        <div class="name">${cat}</div>
        <div class="meta">Nivå: ${m.level} • Poeng: ${m.points}</div>
      </div>`;
  }).join("");
}

// Click delegation (åpne/quiz)
document.addEventListener('click', (e)=>{
  const openId = e.target.getAttribute?.('data-open') || e.target.closest?.('.icon-tile')?.getAttribute?.('data-open');
  if (openId){
    const p = PLACES.find(x=>x.id===openId);
    if (p) openPlaceCard(p);
  }
  const quizId = e.target.getAttribute?.('data-quiz') || e.target.closest?.('.icon-tile')?.getAttribute?.('data-quiz');
  if (quizId){
    startQuizForPerson(quizId);
  }
});

// Sheets
function openSheet(sheet){ sheet?.setAttribute('aria-hidden','false'); }
function closeSheet(sheet){ sheet?.setAttribute('aria-hidden','true'); }
document.querySelectorAll('[data-close]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sel = btn.getAttribute('data-close');
    document.querySelector(sel)?.setAttribute('aria-hidden','true');
  });
});

// Quiz (som før)
let quizState = null;
function startQuizForPerson(personId){
  const q = QUIZZES.filter(x=>x.personId===personId);
  if (!q || !q.length){ showToast("Ingen quiz enda – kommer!"); return; }
  quizState = { quiz:q[0], i:0, answers:[] };
  document.getElementById('quizTitle').textContent = quizState.quiz.title;
  document.getElementById('quizFeedback').textContent = "";
  showQuizQuestion();
  document.getElementById('quizModal').setAttribute('aria-hidden','false');
}
function showQuizQuestion(){
  const { quiz, i } = quizState;
  const item = quiz.questions[i];
  const qEl = document.getElementById('quizQuestion');
  const cEl = document.getElementById('quizChoices');
  const pEl = document.getElementById('quizProgress');
  const fEl = document.getElementById('quizFeedback');
  qEl.textContent = item.text;
  cEl.innerHTML = item.choices.map((c,idx)=>`<button data-choice="${idx}">${c}</button>`).join("");
  pEl.textContent = `Spørsmål ${i+1} av ${quiz.questions.length}`;
  cEl.querySelectorAll('button').forEach(btn=>{
    btn.onclick = ()=>{
      const pick = Number(btn.getAttribute('data-choice'));
      const correct = (pick === item.answerIndex);
      btn.classList.add(correct?'correct':'wrong');
      fEl.textContent = correct ? "Riktig! 🎉" : (item.explanation || "Feil svar.");
      setTimeout(()=> nextQuizStep(correct), QUIZ_FEEDBACK_MS);
    };
  });
}
function nextQuizStep(correct){
  const fEl = document.getElementById('quizFeedback');
  const qm  = document.getElementById('quizModal');
  quizState.answers.push(correct);
  quizState.i++;
  if (quizState.i >= quizState.quiz.questions.length){
    const allCorrect = quizState.answers.every(x=>x);
    const cat = quizState.quiz.reward?.category || "Historie";
    const pts = quizState.quiz.reward?.points || 1;
    merits[cat] = merits[cat] || { level:"Nybegynner", points:0 };
    merits[cat].points += pts;
    if (merits[cat].points >= 10) merits[cat].level = "Mester";
    else if (merits[cat].points >= 5) merits[cat].level = "Kjentmann";
    saveMerits();
    const pid = quizState.quiz.personId;
    peopleCollected[pid] = Date.now();
    savePeople();
    fEl.textContent = allCorrect ? "Flott! Merke oppdatert ✨" : "Ferdig – prøv igjen for full score!";
    setTimeout(()=>{ qm.setAttribute('aria-hidden','true'); }, 900);
  } else {
    fEl.textContent = "";
    showQuizQuestion();
  }
}
document.getElementById('quizClose').addEventListener('click', ()=>{
  document.getElementById('quizModal').setAttribute('aria-hidden','true');
});

// Geolokasjon
function requestLocation(){
  if (!navigator.geolocation){
    el.status.textContent = "Geolokasjon støttes ikke.";
    renderNearbyPlaces(); return;
  }
  el.status.textContent = "Henter posisjon…";
  navigator.geolocation.getCurrentPosition(g=>{
    currentPos = { lat:g.coords.latitude, lon:g.coords.longitude };
    el.status.textContent = "Posisjon funnet.";
    setUser(currentPos.lat, currentPos.lon);
    renderNearbyPlaces();
  }, _=>{
    el.status.textContent = "Kunne ikke hente posisjon.";
    renderNearbyPlaces();
  }, { enableHighAccuracy:true, timeout:8000, maximumAge:10000 });
}

// Kart-modus
el.btnSeeMap.addEventListener('click', ()=>{
  document.body.classList.add('map-only');
});
el.btnExitMap.addEventListener('click', ()=>{
  document.body.classList.remove('map-only');
});
el.btnCenter.addEventListener('click', ()=>{
  if (currentPos && MAP){
    MAP.setView([currentPos.lat,currentPos.lon], Math.max(MAP.getZoom(), 15), {animate:true});
    showToast("Sentrert");
  }
});
el.btnClearRoute.addEventListener('click', ()=> { clearRoute(); showToast("Sti fjernet"); });

// Filter
const visibleCats = new Set(["Historie","Kultur","Sport","Natur","Urban Life","Vitenskap"]);
let showPlaces = true, showPeople = true;

function applyFilters(){
  // places
  placeLayer.eachLayer(layer=>{
    const ll = layer.getLatLng?.();
    if (!ll) return; // skip hitboxes/poly
    const p = PLACES.find(x=> Math.abs(x.lat-ll.lat)<1e-6 && Math.abs(x.lon-ll.lng)<1e-6);
    const ok = p && visibleCats.has(p.category) && showPlaces;
    layer._path ? (layer._path.style.display = ok ? "" : "none") : layer._icon && (layer._icon.style.display = ok ? "" : "none");
  });
  // people
  peopleLayer.eachLayer(layer=>{
    const ll = layer.getLatLng?.();
    if (!ll) return;
    // find person by ll
    const pr = PEOPLE.find(x=> Math.abs(x.lat-ll.lat)<1e-6 && Math.abs(x.lon-ll.lng)<1e-6);
    const cat = pr ? tagToCat(pr.tags) : "Historie";
    const ok = pr && visibleCats.has(cat) && showPeople;
    layer._icon && (layer._icon.style.display = ok ? "" : "none");
  });
}

el.btnFilter.addEventListener('click', ()=> openSheet(el.sheetFilter));
el.sheetFilter.addEventListener('change', (e)=>{
  if (e.target.classList?.contains('flt-cat')){
    if (e.target.checked) visibleCats.add(e.target.value); else visibleCats.delete(e.target.value);
    applyFilters();
  }
  if (e.target.id === 'fltPlaces'){ showPlaces = e.target.checked; applyFilters(); }
  if (e.target.id === 'fltPeople'){ showPeople = e.target.checked; applyFilters(); }
});

// Se flere i nærheten
el.seeMore.addEventListener('click', ()=>{ buildSeeMoreNearby(); openSheet(el.sheetNear); });

// Click → draw route when click card open “Vis rute”
document.addEventListener('click', (e)=>{
  const openId = e.target.getAttribute?.('data-open');
  if (openId){
    const p = PLACES.find(x=>x.id===openId);
    if (p){ openPlaceCard(p); }
  }
});

// Test toggle
document.getElementById('testToggle')?.addEventListener('change', (e)=>{
  if (e.target.checked){
    currentPos = { lat: START.lat, lon: START.lon };
    el.status.textContent = "Testmodus: Oslo sentrum";
    setUser(currentPos.lat,currentPos.lon);
    renderNearbyPlaces();
    showToast("Testmodus PÅ");
  } else {
    showToast("Testmodus AV");
    requestLocation();
  }
});

// Init
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
    applyFilters();

    renderNearbyPlaces();
    renderOwnedPlacesIcons();
    renderOwnedPeopleIcons();
    renderMerits();
    renderCollectionCount();

    requestLocation();
  }).catch(()=>{
    showToast("Kunne ikke laste data.", 1600);
  });
}
document.addEventListener('DOMContentLoaded', boot);
