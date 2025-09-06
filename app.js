// ==============================
// History Go – v11 (Merker + Galleri kun samlet + Aktivitet + Kartfix)
// ==============================

// --- Konstanter ---
const START = { lat:59.9139, lon:10.7522, zoom:13 };
const NEARBY_LIMIT = 2;
const FEED_MAX = 50;

// --- Kategori → farger ---
const CAT_COLOR = (cat="")=>{
  const c = cat.toLowerCase();
  if (c.includes("kultur")) return "#e63946";
  if (c.includes("sport"))  return "#2a9d8f";
  if (c.includes("natur"))  return "#64c896";
  if (c.includes("urban"))  return "#ffb703";
  return "#1976d2"; // Historie/default
};
const catClass = (cat="")=>{
  const c = cat.toLowerCase();
  if (c.includes("kultur")) return "kult";
  if (c.includes("sport"))  return "sport";
  if (c.includes("natur"))  return "natur";
  if (c.includes("urban"))  return "urban";
  return "hist";
};

// --- Data ---
let PLACES = [];
let PEOPLE = [];
let QUIZZES = [];

// --- State (LocalStorage) ---
const store = {
  visited: JSON.parse(localStorage.getItem("visited_places") || "{}"),
  people:  JSON.parse(localStorage.getItem("people_collected") || "{}"),
  merits:  JSON.parse(localStorage.getItem("merits_by_category") || "{}"), // {Historie: n, Kultur:n ...}
  feed:    JSON.parse(localStorage.getItem("activity_feed") || "[]"),       // [{t,msg}]
  save(){
    localStorage.setItem("visited_places", JSON.stringify(this.visited));
    localStorage.setItem("people_collected", JSON.stringify(this.people));
    localStorage.setItem("merits_by_category", JSON.stringify(this.merits));
    localStorage.setItem("activity_feed", JSON.stringify(this.feed.slice(-FEED_MAX)));
  },
  log(msg){
    this.feed.push({ t: Date.now(), msg });
    this.save();
    renderFeed();
  }
};

// --- DOM refs ---
const el = {
  map:        document.getElementById("map"),
  status:     document.getElementById("status"),
  nearbyList: document.getElementById("nearbyList"),
  seeMoreBtn: document.getElementById("btnSeeMoreNearby"),
  collectionGrid: document.getElementById("collectionGrid"),
  collectionCount: document.getElementById("collectionCount"),
  btnMoreCollection: document.getElementById("btnMoreCollection"),
  merits:     document.getElementById("merits"),
  gallery:    document.getElementById("gallery"),
  toast:      document.getElementById("toast"),
  test:       document.getElementById("testToggle"),
  btnSeeMap:  document.getElementById("btnSeeMap"),
  btnExitMap: document.getElementById("btnExitMap"),
  btnCenter:  document.getElementById("btnCenter"),
  // place card
  pc:         document.getElementById("placeCard"),
  pcTitle:    document.getElementById("pcTitle"),
  pcMeta:     document.getElementById("pcMeta"),
  pcDesc:     document.getElementById("pcDesc"),
  pcMore:     document.getElementById("pcMore"),
  pcUnlock:   document.getElementById("pcUnlock"),
  pcClose:    document.getElementById("pcClose"),
  // sheets
  sheetNearby: document.getElementById("sheetNearby"),
  sheetNearbyBody: document.getElementById("sheetNearbyBody"),
  sheetCollection: document.getElementById("sheetCollection"),
  sheetCollectionBody: document.getElementById("sheetCollectionBody"),
  // quiz
  quiz:       document.getElementById("quizModal"),
  quizTitle:  document.getElementById("quizTitle"),
  quizQ:      document.getElementById("quizQuestion"),
  quizChoices:document.getElementById("quizChoices"),
  quizProg:   document.getElementById("quizProgress"),
  quizFb:     document.getElementById("quizFeedback"),
  // activity
  feed:       document.getElementById("activityFeed"),
  btnClearFeed: document.getElementById("btnClearFeed"),
};

// --- Toast (med varighet) ---
function toast(msg, ms=1600){
  if (!el.toast) return;
  el.toast.textContent = msg;
  el.toast.style.display = "block";
  setTimeout(()=> el.toast.style.display = "none", ms);
}

// --- Hjelpere ---
const dist = (a,b)=>{
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
};
const fmtDist = m => m<1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`;

// --- Kart ---
let MAP, userMarker, placeLayer;
function initMap(){
  MAP = L.map('map', { zoomControl:false, attributionControl:false }).setView([START.lat, START.lon], START.zoom);
  // natt tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom:19 }).addTo(MAP);
  placeLayer = L.layerGroup().addTo(MAP);
}

function drawPlaces(){
  if (!MAP) return;
  placeLayer.clearLayers();
  PLACES.forEach(p=>{
    // liten prikk + stor hitbox
    const color = CAT_COLOR(p.category);
    const marker = L.circleMarker([p.lat,p.lon], {
      radius:6, weight:2, color:"#0b1a2a", fillColor:color, fillOpacity:.95
    }).addTo(placeLayer);

    // usynlig hitbox (stor)
    const hit = L.circleMarker([p.lat,p.lon], {
      radius:20, weight:0, color:"transparent", fillColor:"transparent", fillOpacity:0
    }).addTo(placeLayer);

    const openCard = ()=>{
      showPlaceCard(p);
    };
    marker.on('click', openCard);
    hit.on('click', openCard);
  });
}

function setUser(lat, lon, fly=false){
  if (!MAP) return;
  if (!userMarker){
    userMarker = L.circleMarker([lat, lon], { radius:8, weight:2, color:"#fff", fillColor:"#00d57a", fillOpacity:1 })
      .addTo(MAP).bindPopup("Du er her");
  } else {
    userMarker.setLatLng([lat, lon]);
  }
  if (fly) MAP.setView([lat,lon], MAP.getZoom(), { animate:true });
}

// engangs-sentrering
function centerNow(){
  if (!lastPos) return toast("Ingen posisjon ennå");
  setUser(lastPos.lat, lastPos.lon, true);
}

// --- Place card ---
let currentPlace = null;
function showPlaceCard(p){
  currentPlace = p;
  el.pcTitle.textContent = p.name;
  el.pcMeta.textContent  = `${p.category} • radius ${p.r||120} m`;
  el.pcDesc.textContent  = p.desc || "";
  el.pc.style.display = "block";
  el.pcMore.onclick = ()=> window.open(`https://www.google.com/search?q=${encodeURIComponent(p.name+' Oslo')}`,'_blank');
  el.pcUnlock.onclick = ()=> {
    awardPlace(p);
  };
}
function closePlaceCard(){
  el.pc.style.display = "none";
  currentPlace = null;
}

// --- Nearby / Collection / Merker / Gallery / Feed ---
let lastPos = null;

function renderNearby(){
  const arr = PLACES.map(p=>({
    ...p,
    d: lastPos ? Math.round(dist(lastPos, {lat:p.lat,lon:p.lon})) : null
  })).sort((a,b)=>(a.d??1e12)-(b.d??1e12));

  const top2 = arr.slice(0, NEARBY_LIMIT);
  el.nearbyList.innerHTML = top2.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category} • ${p.d==null?'–':fmtDist(p.d)}</div>
      <p class="desc">${p.desc||''}</p>
    </article>
  `).join("");
  // sheet-data
  el.sheetNearbyBody.innerHTML = arr.slice(NEARBY_LIMIT).map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category} • ${p.d==null?'–':fmtDist(p.d)}</div>
      <p class="desc">${p.desc||''}</p>
    </article>
  `).join("") || `<div class="muted">Ingen flere i nærheten.</div>`;
}

function renderCollection(){
  const items = PLACES.filter(p=> store.visited[p.id]);
  const firstRow = items.slice(0, 10);
  const more = Math.max(0, items.length - firstRow.length);

  el.collectionGrid.innerHTML = firstRow.map(p=>`
    <span class="badge ${catClass(p.category)}">${p.name}</span>
  `).join("") || `<div class="muted">Besøk et sted for å låse opp ditt første merke.</div>`;

  el.collectionCount.textContent = items.length;
  el.btnMoreCollection.style.display = more>0 ? "inline-block" : "none";
  // sheet
  el.sheetCollectionBody.innerHTML = items.map(p=>`
    <span class="badge ${catClass(p.category)}">${p.name}</span>
  `).join("");
}

function renderMerits(){
  const cats = ["Historie","Kultur","Sport","Natur","Urban Life"];
  el.merits.innerHTML = cats.map(cat=>{
    const pts = store.merits[cat]||0;
    const pct = Math.min(100, pts*10); // enkel skala
    const color = CAT_COLOR(cat);
    return `
      <div class="merit">
        <div class="name">${cat}</div>
        <div class="meta">${pts} poeng</div>
        <div class="bar"><div class="fill" style="width:${pct}%; background:${color}"></div></div>
      </div>
    `;
  }).join("");
}

function renderGallery(){
  // KUN samlet personer
  const collected = Object.keys(store.people);
  const items = PEOPLE.filter(p=> collected.includes(p.id));
  el.gallery.innerHTML = items.length ? items.map(p=>`
    <article class="person-card">
      <div class="avatar">${(p.initials||p.name?.slice(0,2)||'??').toUpperCase()}</div>
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${p.desc||''}</div>
      </div>
      <button class="person-btn" onclick="openQuizFor('${p.id}')">Quiz</button>
    </article>
  `).join("") : `<div class="muted">Samle personer ved stedene for å fylle galleriet.</div>`;
}

function renderFeed(){
  el.feed.innerHTML = store.feed.slice(-FEED_MAX).reverse().map(item=>{
    const d = new Date(item.t);
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    return `<div class="activity-item"><strong>${hh}:${mm}</strong> — ${item.msg}</div>`;
  }).join("") || `<div class="muted">Ingen aktivitet ennå.</div>`;
}

// --- Tildeling ---
function awardPlace(p){
  if (store.visited[p.id]) { toast("Allerede låst opp"); return; }
  store.visited[p.id] = Date.now();
  store.log(`Låst opp sted: ${p.name}`);
  store.save();
  renderCollection();
  closePlaceCard();
  toast(`Låst opp: ${p.name} ✅`, 1800);

  // Finn personer som hører til dette stedet → merk som "tilgjengelig" (valgfritt)
  // Vi venter med auto-samling; samling skjer når bruker trykker/kommer innen radius.
}

function collectPerson(person){
  if (store.people[person.id]) return;
  store.people[person.id] = Date.now();
  store.log(`Samlet person: ${person.name}`);
  store.save();
  renderGallery();
  toast(`Samlet: ${person.name} ✅`, 1800);
}

function addMerit(category, points=1){
  store.merits[category] = (store.merits[category]||0) + points;
  store.log(`Merke +${points} i ${category}`);
  store.save();
  renderMerits();
}

// --- Quiz ---
let quizState = null;
function openQuizFor(personId){
  const qs = QUIZZES.filter(q=> q.personId === personId);
  if (!qs.length){ toast("Ingen quiz ennå"); return; }
  startQuiz(qs[0]);
}
function startQuiz(q){
  quizState = { q, i:0, correct:0 };
  el.quizTitle.textContent = q.title;
  el.quizFb.textContent = "";
  renderQuizStep();
  el.quiz.setAttribute("aria-hidden","false");
}
function renderQuizStep(){
  const { q, i } = quizState;
  const item = q.questions[i];
  el.quizQ.textContent = item.text;
  el.quizChoices.innerHTML = item.choices.map((c,idx)=>`
    <button class="ghost-btn" data-idx="${idx}">${c}</button>
  `).join("");
  el.quizProg.textContent = `Spørsmål ${i+1} av ${q.questions.length}`;
  [...el.quizChoices.querySelectorAll('button')].forEach(btn=>{
    btn.onclick = ()=>{
      const idx = Number(btn.dataset.idx);
      const correct = idx === item.answerIndex;
      if (correct) quizState.correct++;
      el.quizFb.textContent = correct ? "Riktig! 🎉" : `Feil. ${item.explanation||""}`;
      // vent litt lenger så svaret ikke forsvinner for fort
      setTimeout(nextQuizStep, 1200);
    };
  });
}
function nextQuizStep(){
  const { q } = quizState;
  quizState.i++;
  if (quizState.i >= q.questions.length){
    // ferdig
    addMerit(q.reward?.category || q.category, q.reward?.points || 1);
    el.quiz.setAttribute("aria-hidden","true");
    toast("Quiz fullført ✅", 1800);
  } else {
    el.quizFb.textContent = "";
    renderQuizStep();
  }
}
document.getElementById("quizClose").onclick = ()=> el.quiz.setAttribute("aria-hidden","true");

// --- Geolokasjon ---
function useTestPos(){
  lastPos = { lat: START.lat, lon: START.lon };
  el.status.textContent = "Testmodus: Oslo sentrum";
  setUser(lastPos.lat, lastPos.lon);
  renderNearby();
}
function requestLocation(){
  if (!navigator.geolocation){ el.status.textContent="Geolokasjon støttes ikke."; renderNearby(); return; }
  el.status.textContent = "Henter posisjon…";
  navigator.geolocation.getCurrentPosition(pos=>{
    lastPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    el.status.textContent = "Posisjon funnet.";
    setUser(lastPos.lat, lastPos.lon);
    renderNearby();
  }, _=>{
    el.status.textContent = "Kunne ikke hente posisjon.";
    renderNearby();
  }, { enableHighAccuracy:true, timeout:8000, maximumAge:10000 });
}

// --- Sheets / UI ---
function openSheet(id){ document.querySelector(id).setAttribute("aria-hidden","false"); }
function closeSheet(id){ document.querySelector(id).setAttribute("aria-hidden","true"); }

// --- Init ---
function wireUI(){
  // map toggle
  el.btnSeeMap.onclick = ()=> document.body.classList.add("map-only");
  el.btnExitMap.onclick = ()=> document.body.classList.remove("map-only");
  el.btnCenter.onclick  = centerNow; // engangssentrering

  // place card
  el.pcClose.onclick = closePlaceCard;

  // sheets
  el.seeMoreBtn.onclick = ()=> openSheet("#sheetNearby");
  document.querySelectorAll(".sheet-close").forEach(b=> b.onclick = ()=> closeSheet(b.dataset.close));
  el.btnMoreCollection.onclick = ()=> openSheet("#sheetCollection");

  // testmodus
  el.test?.addEventListener("change", e=>{
    if (e.target.checked) useTestPos(); else requestLocation();
  });

  // feed
  el.btnClearFeed.onclick = ()=>{
    store.feed = [];
    store.save();
    renderFeed();
    toast("Aktivitet tømt", 900);
  };
}

function renderAll(){
  renderNearby();
  renderCollection();
  renderMerits();
  renderGallery();
  renderFeed();
}

function boot(){
  initMap();
  wireUI();

  Promise.all([
    fetch('places.json').then(r=>r.json()),
    fetch('people.json').then(r=>r.json()).catch(()=>[]),
    fetch('quizzes.json').then(r=>r.json()).catch(()=>[])
  ]).then(([places, people, quizzes])=>{
    PLACES = places || [];
    PEOPLE = people || [];
    QUIZZES = quizzes || [];
    drawPlaces();
    renderAll();
    requestLocation();
  }).catch(()=>{
    toast("Kunne ikke laste data.", 1800);
    renderAll();
    requestLocation();
  });
}

document.addEventListener("DOMContentLoaded", boot);
