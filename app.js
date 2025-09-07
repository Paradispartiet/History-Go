// =============== Konstanter ===============
const START = { lat: 59.9139, lon: 10.7522, zoom: 13 };
const NEARBY_LIMIT = 2;
const QUIZ_FEEDBACK_MS = 2600;

let PLACES = [], PEOPLE = [], QUIZZES = [];

const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const merits          = JSON.parse(localStorage.getItem("merits_by_category") || "{}");

// =============== DOM ======================
const el = {
  map:        document.getElementById('map'),
  toast:      document.getElementById('toast'),
  status:     document.getElementById('status'),
  btnSeeMap:  document.getElementById('btnSeeMap'),
  btnExitMap: document.getElementById('btnExitMap'),
  btnCenter:  document.getElementById('btnCenter'),
  btnZoomIn:  document.getElementById('btnZoomIn'),
  btnZoomOut: document.getElementById('btnZoomOut'),
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
  pcRoute:    document.getElementById('pcRoute'),
  pcUnlock:   document.getElementById('pcUnlock'),
  pcClose:    document.getElementById('pcClose'),
  quizModal:  document.getElementById('quizModal'),
  quizTitle:  document.getElementById('quizTitle'),
  quizQ:      document.getElementById('quizQuestion'),
  quizChoices:document.getElementById('quizChoices'),
  quizProgress:document.getElementById('quizProgress'),
  quizFeedback:document.getElementById('quizFeedback'),
};

// =============== Utils ====================
function catColor(cat=""){
  const c = cat.toLowerCase();
  if (c.includes("kultur")) return "#e63946";
  if (c.includes("urban"))  return "#ffb703";
  if (c.includes("sport"))  return "#2a9d8f";
  if (c.includes("natur"))  return "#4caf50";
  if (c.includes("vitenskap")) return "#9b59b6";
  return "#1976d2"; // Historie
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
function distMeters(a,b){
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function showToast(msg="OK", ms=1400){
  el.toast.textContent = msg;
  el.toast.style.display = "block";
  setTimeout(()=> el.toast.style.display="none", ms);
}

// =============== Kart =====================
let MAP, placeLayer, peopleLayer, userMarker, userPulse, routingCtrl;
let currentPos = null, currentPlace = null;

function initMap() {
  MAP = L.map('map', { zoomControl:false, attributionControl:false })
          .setView([START.lat, START.lon], START.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap, © CARTO'
  }).addTo(MAP);

  placeLayer  = L.layerGroup().addTo(MAP);
  peopleLayer = L.layerGroup().addTo(MAP);
}

function drawPlaceMarkers() {
  placeLayer.clearLayers();
  PLACES.forEach(p=>{
    const m = L.circleMarker([p.lat, p.lon], {
      radius: 7,
      color: catColor(p.category),
      weight: 3,
      opacity: 1,
      fillColor: "#0d1b2a",
      fillOpacity: 0.9
    }).addTo(placeLayer);

    const hb = L.circle([p.lat, p.lon], {radius: 36, opacity:0, fillOpacity:0}).addTo(placeLayer);
    const openCard = () => openPlaceCard(p);
    m.on('click', openCard); hb.on('click', openCard);
  });
}

function personCoord(pr){
  // har personen egne coords?
  if (typeof pr.lat === "number" && typeof pr.lon === "number") return [pr.lat, pr.lon];
  // ellers finn stedet
  const pl = PLACES.find(x=>x.id===pr.placeId);
  return pl ? [pl.lat, pl.lon] : null;
}

function drawPeopleMarkers() {
  peopleLayer.clearLayers();
  PEOPLE.forEach(pr=>{
    const coord = personCoord(pr);
    if (!coord) return;
    const [lat,lon] = coord;

    const html = `
      <div style="
        width:28px;height:28px;border-radius:999px;
        background:${catColor(tagToCat(pr.tags))}; color:#111;
        display:flex;align-items:center;justify-content:center;
        font-weight:900; font-size:12px; border:2px solid #111;
        box-shadow:0 0 0 3px rgba(0,0,0,.25);
      ">${(pr.initials||'').slice(0,2).toUpperCase()}</div>`;
    const icon = L.divIcon({ className:"", html, iconSize:[28,28], iconAnchor:[14,14] });
    const mk = L.marker([lat,lon], { icon }).addTo(peopleLayer);
    const hb = L.circle([lat, lon], {radius: 36, opacity:0, fillOpacity:0}).addTo(peopleLayer);

    const openFromPerson = () => openPlaceCardByPerson(pr);
    mk.on('click', openFromPerson); hb.on('click', openFromPerson);
  });
}

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

// =============== Place card ===============
function googleLinkFor(p){
  const q = encodeURIComponent(`${p.name} Oslo`);
  return `https://www.google.com/search?q=${q}`;
}

function openPlaceCard(p){
  currentPlace = p;
  el.pcTitle.textContent = p.name;
  el.pcMeta.textContent  = `${p.category} • radius ${p.r||120} m`;
  el.pcDesc.textContent  = p.desc || "";
  el.pcMore.href = googleLinkFor(p);
  el.pc.setAttribute('aria-hidden','false');

  el.pcUnlock.onclick = ()=> {
    if (visited[p.id]) { showToast("Allerede låst opp"); return; }
    visited[p.id] = true; localStorage.setItem("visited_places", JSON.stringify(visited));
    renderCollection();
    showToast(`Låst opp: ${p.name} ✅`);
  };

  el.pcRoute.onclick = ()=> drawRouteTo(p);
}

function openPlaceCardByPerson(person){
  const pl = PLACES.find(x=>x.id===person.placeId);
  const p = pl || {
    id:"personloc", name:person.name, category: tagToCat(person.tags),
    r: person.r || 150, desc: person.desc || "",
    lat: personCoord(person)?.[0], lon: personCoord(person)?.[1]
  };
  openPlaceCard(p);
  el.pcUnlock.textContent = "Ta quiz";
  el.pcUnlock.onclick = ()=> startQuizForPerson(person.id);
}

el.pcClose.addEventListener('click', ()=>{
  el.pc.setAttribute('aria-hidden','true');
  el.pcUnlock.textContent = "Lås opp";
});

// =============== Rute (OSRM gang) =========
function drawRouteTo(p){
  if (!currentPos){ showToast("Ukjent posisjon"); return; }
  if (routingCtrl){ MAP.removeControl(routingCtrl); routingCtrl=null; }

  routingCtrl = L.Routing.control({
    fitSelectedRoutes: true,
    addWaypoints: false,
    draggableWaypoints: false,
    lineOptions:{
      styles:[
        {color:'#ffffff', opacity:0.95, weight:7},
        {color:'#87c5ff', opacity:0.95, weight:4}
      ]
    },
    router: L.Routing.osrmv1({
      serviceUrl: 'https://router.project-osrm.org/route/v1',
      profile: 'foot'
    }),
    waypoints: [
      L.latLng(currentPos.lat, currentPos.lon),
      L.latLng(p.lat, p.lon)
    ],
    createMarker: ()=> null
  }).addTo(MAP);

  showToast("Rute lagt til");
}

// =============== Render-lister =============
function renderNearbyPlaces(){
  const sorted = PLACES
    .map(p => ({...p, _d: currentPos ? Math.round(distMeters(currentPos, {lat:p.lat,lon:p.lon})) : null }))
    .sort((a,b)=>(a._d??1e12)-(b._d??1e12));
  const subset = sorted.slice(0, NEARBY_LIMIT);
  el.list.innerHTML = subset.map(p => `
    <article class="card">
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${p.category} • Oslo</div>
        <p class="desc">${p.desc||""}</p>
      </div>
      <div class="row between">
        <div class="dist">${p._d==null ? "" : (p._d<1000? `${p._d} m` : `${(p._d/1000).toFixed(1)} km`)}</div>
        <a class="ghost-btn" href="${googleLinkFor(p)}" target="_blank" rel="noopener">Mer info</a>
      </div>
    </article>
  `).join("");
}

function renderNearbyPeople(){
  if (!currentPos) { el.nearPeople.innerHTML = ""; return; }
  const candidates = PEOPLE
    .map(pr=>{
      const coord = personCoord(pr);
      if (!coord) return null;
      const [lat,lon] = coord;
      return ({ ...pr, lat, lon, _d: Math.round(distMeters(currentPos,{lat,lon})) })
    })
    .filter(Boolean)
    .filter(pr => pr._d <= (pr.r||200) + (el.test?.checked ? 5000 : 0))
    .sort((a,b)=>a._d-b._d)
    .slice(0, 6);

  el.nearPeople.innerHTML = candidates.map(pr=>`
    <article class="card">
      <div>
        <div class="name">${pr.name}</div>
        <div class="meta">${tagToCat(pr.tags)}</div>
        <p class="desc">${pr.desc||""}</p>
      </div>
      <div class="row between">
        <div class="dist">${pr._d<1000? `${pr._d} m` : `${(pr._d/1000).toFixed(1)} km`}</div>
        <button class="primary-btn" data-quiz="${pr.id}">Ta quiz</button>
      </div>
    </article>
  `).join("");
}

function renderCollection(){
  const items = PLACES.filter(p => visited[p.id]);
  el.collectionCount.textContent = items.length;

  const first = items.slice(0, 6);
  const rest  = items.slice(6);

  el.collectionGrid.innerHTML = first.map(p => `
    <span class="badge ${catClass(p.category)}">
      <span class="i" style="background:${catColor(p.category)}"></span> ${p.name}
    </span>`).join("");

  if (rest.length){
    el.btnMoreCollection.style.display = "inline-flex";
    el.btnMoreCollection.onclick = ()=>{
      el.sheetCollectionBody.innerHTML = rest.map(p => `
        <span class="badge ${catClass(p.category)}">
          <span class="i" style="background:${catColor(p.category)}"></span> ${p.name}
        </span>`).join("");
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
  el.gallery.innerHTML = got.length ? got.map(p=>`
    <span class="badge ${catClass(tagToCat(p.tags))}">
      <span class="i" style="background:${catColor(tagToCat(p.tags))}"></span> ${p.name}
    </span>
  `).join("") : `<div class="muted">Samle personer ved å møte dem og klare quizen.</div>`;
}

// Sheets
function openSheet(sheet){ sheet?.setAttribute('aria-hidden','false'); }
function closeSheet(sheet){ sheet?.setAttribute('aria-hidden','true'); }
document.querySelectorAll('[data-close]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sel = btn.getAttribute('data-close');
    document.querySelector(sel)?.setAttribute('aria-hidden','true');
  });
});

// Klikk-delegasjon
document.addEventListener('click', (e)=>{
  const quizId = e.target.getAttribute?.('data-quiz');
  if (quizId){ startQuizForPerson(quizId); }
});

// =============== Quiz ======================
let quizState = null;
function startQuizForPerson(personId){
  const q = QUIZZES.filter(x=>x.personId===personId);
  if (!q || !q.length) { showToast("Ingen quiz enda – kommer!"); return; }
  quizState = { quiz:q[0], i:0, answers:[] };
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
      btn.classList.add(correct ? 'correct':'wrong');
      el.quizFeedback.textContent = correct ? "Riktig! 🎉" : (item.explanation || "Feil svar.");
      setTimeout(()=> nextQuizStep(correct), QUIZ_FEEDBACK_MS);
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
    localStorage.setItem("merits_by_category", JSON.stringify(merits));

    peopleCollected[quiz.personId] = Date.now();
    localStorage.setItem("people_collected", JSON.stringify(peopleCollected));

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
document.getElementById('quizClose').addEventListener('click', ()=> el.quizModal.setAttribute('aria-hidden','true'));

// =============== Geolokasjon ==============
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
    renderNearbyPlaces(); renderNearbyPeople();
  }, { enableHighAccuracy:true, timeout:8000, maximumAge:10000 });
}

// =============== Kart-knapper / toggles ===
el.btnCenter.addEventListener('click', ()=> {
  if (currentPos && MAP){
    MAP.setView([currentPos.lat, currentPos.lon], Math.max(MAP.getZoom(), 15), {animate:true});
    showToast("Sentrert");
  }
});
el.btnZoomIn.addEventListener('click', ()=> MAP && MAP.zoomIn());
el.btnZoomOut.addEventListener('click', ()=> MAP && MAP.zoomOut());

el.btnSeeMap.addEventListener('click', ()=> document.body.classList.add('map-only'));
el.btnExitMap.addEventListener('click', ()=> document.body.classList.remove('map-only'));

// =============== “Se flere i nærheten” ====
el.seeMore?.addEventListener('click', ()=>{
  const sorted = PLACES
    .map(p => ({...p, _d: currentPos ? Math.round(distMeters(currentPos, {lat:p.lat,lon:p.lon})) : null }))
    .sort((a,b)=>(a._d??1e12)-(b._d??1e12));
  el.sheetNearBody.innerHTML = sorted.slice(NEARBY_LIMIT, NEARBY_LIMIT+18).map(p => `
    <article class="card">
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${p.category||""} • Oslo</div>
        <p class="desc">${p.desc||""}</p>
      </div>
      <div class="row between">
        <div class="dist">${p._d==null ? "" : (p._d<1000? `${p._d} m` : `${(p._d/1000).toFixed(1)} km`)}</div>
        <a class="ghost-btn" href="${googleLinkFor(p)}" target="_blank" rel="noopener">Mer info</a>
      </div>
    </article>
  `).join("");
  openSheet(el.sheetNear);
});

// =============== Init =====================
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
    PLACES = places||[]; PEOPLE = people||[]; QUIZZES = quizzes||[];
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
