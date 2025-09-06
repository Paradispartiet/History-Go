// ==============================
// History Go – app.js (quiz + personer + merker)
// - Laster places.json, people.json, quizzes.json
// - Map-markører -> placeCard med personer på stedet
// - Klikk person -> start quiz (fra quizzes.json)
// - Riktige svar gir poeng/merker per kategori
// - Galleri viser KUN innsamlede personer
// ==============================

// --- Data ---
let PLACES = [];
let PEOPLE = [];
let QUIZZES = [];

// --- LocalStorage state ---
const visitedPlaces     = JSON.parse(localStorage.getItem("visited_places") || "{}");  // sted-merker (valgfritt)
const peopleCollected   = JSON.parse(localStorage.getItem("people_collected") || "{}"); // { personId: timestamp }
const meritsByCategory  = JSON.parse(localStorage.getItem("merits_by_cat")   || "{}");  // { "Historie": 3, ... }

function saveVisited() { localStorage.setItem("visited_places", JSON.stringify(visitedPlaces)); }
function savePeople()  { localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); renderGallery(); }
function saveMerits()  { localStorage.setItem("merits_by_cat", JSON.stringify(meritsByCategory)); renderMerits(); }

// --- DOM refs (matcher index.html du har) ---
const elMap        = document.getElementById("map");
const elToast      = document.getElementById("toast");
const elStatus     = document.getElementById("status");
const elNearList   = document.getElementById("nearbyList");
const elColGrid    = document.getElementById("collectionGrid");
const elColCount   = document.getElementById("collectionCount");
const elGallery    = document.getElementById("gallery");
const elSeeMap     = document.getElementById("btnSeeMap");
const elExitMap    = document.getElementById("btnExitMap");
const elCenter     = document.getElementById("btnCenter");
const elSeeMore    = document.getElementById("btnSeeMoreNearby");
const elMoreCol    = document.getElementById("btnMoreCollection");
const elTest       = document.getElementById("testToggle");

// Place card
const pcRoot   = document.getElementById("placeCard");
const pcTitle  = document.getElementById("pcTitle");
const pcMeta   = document.getElementById("pcMeta");
const pcDesc   = document.getElementById("pcDesc");
const pcMore   = document.getElementById("pcMore");
const pcUnlock = document.getElementById("pcUnlock");
const pcClose  = document.getElementById("pcClose");

// Sheets
const sheetNearby      = document.getElementById("sheetNearby");
const sheetNearbyBody  = document.getElementById("sheetNearbyBody");
const sheetCollection  = document.getElementById("sheetCollection");
const sheetCollectionBody = document.getElementById("sheetCollectionBody");

// Quiz modal
const qModal   = document.getElementById("quizModal");
const qTitle   = document.getElementById("quizTitle");
const qQ       = document.getElementById("quizQuestion");
const qChoices = document.getElementById("quizChoices");
const qProg    = document.getElementById("quizProgress");
const qFb      = document.getElementById("quizFeedback");
const qClose   = document.getElementById("quizClose");

// --- Konstanter ---
const NEARBY_LIMIT = 2;

// --- Utils ---
function toast(msg="OK") {
  if (!elToast) return;
  elToast.textContent = msg;
  elToast.style.display = "block";
  setTimeout(()=> elToast.style.display = "none", 1500);
}
function distMeters(a, b){
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function pickColor(cat){
  const c=(cat||"").toLowerCase();
  if (c.includes("kultur")) return "#e63946";
  if (c.includes("urban"))  return "#ffb703";
  if (c.includes("sport"))  return "#2a9d8f";
  if (c.includes("natur"))  return "#4caf50";
  return "#1976d2"; // historie/default
}

// ==============================
// Leaflet-kart
// ==============================
let MAP, userMarker, autoFollow=false, lastPos=null, placeLayer;

function initMap() {
  MAP = L.map("map", { zoomControl:false, attributionControl:false }).setView([59.9139,10.7522], 13);
  L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",{maxZoom:19}).addTo(MAP);
  placeLayer = L.layerGroup().addTo(MAP);

  // Vi tegner markører når PLACES er lastet
  redrawPlaces();

  // Sentrer-knapp
  elCenter?.addEventListener("click", ()=>{
    if (!lastPos) return;
    autoFollow = true;
    MAP.setView([lastPos.lat,lastPos.lon], 15);
    toast("Sentrerer på deg");
  });
}

function setUserOnMap(lat, lon){
  if (!MAP) return;
  if (!userMarker){
    userMarker = L.circleMarker([lat,lon], {radius:8, weight:2, color:"#fff", fillColor:"#1976d2", fillOpacity:1})
      .addTo(MAP).bindPopup("Du er her");
  } else {
    userMarker.setLatLng([lat,lon]);
  }
  if (autoFollow) MAP.setView([lat,lon]);
}

function redrawPlaces(){
  if (!MAP || !placeLayer) return;
  placeLayer.clearLayers();
  PLACES.forEach(p=>{
    const dot = L.circleMarker([p.lat, p.lon], {
      radius: 6, weight: 2, color: "#111",
      fillColor: pickColor(p.category), fillOpacity: 0.95
    }).addTo(placeLayer);

    // usynlig stor hitbox for fingre
    const hit = L.circle([p.lat, p.lon], {radius: 25, opacity:0, fillOpacity:0}).addTo(placeLayer);

    const openCard = ()=> showPlaceCard(p);

    dot.on("click", openCard);
    hit.on("click", openCard);
  });
}

// ==============================
// Place card (viser personer + handlinger)
// ==============================
let currentPlace = null;

function showPlaceCard(place){
  currentPlace = place;
  pcTitle.textContent = place.name;
  pcMeta.textContent  = `${place.category||""} • radius ${place.r||120} m`;
  pcDesc.innerHTML    = `
    <div style="margin-bottom:10px">${place.desc||""}</div>
    <div style="font-weight:800;margin:.5rem 0 .25rem">Personer her</div>
    ${renderPeopleAtPlaceHTML(place.id)}
  `;
  pcMore.onclick = ()=> window.open(`https://www.google.com/search?q=${encodeURIComponent(place.name+" Oslo")}`);
  pcUnlock.onclick = ()=> tryUnlockPlace(place);
  pcRoot.setAttribute("aria-hidden","false");
}
function hidePlaceCard(){ pcRoot.setAttribute("aria-hidden","true"); }
pcClose?.addEventListener("click", hidePlaceCard);

function renderPeopleAtPlaceHTML(placeId){
  const here = PEOPLE.filter(x => x.placeId === placeId);
  if (!here.length) return `<div class="muted">Ingen personer er knyttet hit ennå.</div>`;
  return here.map(p=>{
    const collected = !!peopleCollected[p.id];
    const collectBtn = collected
      ? `<button class="mini-btn" disabled>Samlet</button>`
      : `<button class="mini-btn" data-collect="${p.id}">Samle</button>`;
    const quizBtn = `<button class="mini-btn ghost" data-quiz="${p.id}">Quiz</button>`;
    return `
      <div class="row person-row">
        <div class="avatar-mini" style="background:${pickColor((p.tags||[])[0])}">${(p.initials||p.name?.slice(0,2)||"").toUpperCase()}</div>
        <div class="p-info">
          <div class="name">${p.name}</div>
          <div class="meta">${p.desc||""}</div>
        </div>
        <div class="p-actions">${collectBtn}${quizBtn}</div>
      </div>
    `;
  }).join("");
}

// Delegér "Samle" og "Quiz" klikk innen pcDesc
pcDesc?.addEventListener("click", (e)=>{
  const btn = e.target.closest("button");
  if (!btn) return;
  const personIdQuiz = btn.getAttribute("data-quiz");
  const personIdCollect = btn.getAttribute("data-collect");
  if (personIdQuiz)  startQuizForPerson(personIdQuiz);
  if (personIdCollect) tryCollectPerson(personIdCollect);
});

// Sjekk nærhet og samle person
function tryCollectPerson(personId){
  const p = PEOPLE.find(x=>x.id===personId);
  if (!p){ toast("Fant ikke person."); return; }
  const pos = lastPos;
  const rEff = p.r || 150;
  if (!pos){ toast("Mangler posisjon."); return; }
  const d = Math.round(distMeters(pos, {lat:p.lat, lon:p.lon}));
  if (d <= rEff){
    if (!peopleCollected[p.id]) {
      peopleCollected[p.id] = Date.now();
      savePeople();
      toast(`Samlet: ${p.name} ✅`);
      // oppdater placeCard knapp
      if (currentPlace) showPlaceCard(currentPlace);
    }
  } else {
    toast(`Du er ${d} m unna (trenger ${rEff} m)`);
  }
}

// Lås opp sted (valgfritt – lik logikk)
function tryUnlockPlace(place){
  const pos = lastPos;
  const rEff = place.r || 120;
  if (!pos){ toast("Mangler posisjon."); return; }
  const d = Math.round(distMeters(pos, {lat:place.lat, lon:place.lon}));
  if (d <= rEff){
    if (!visitedPlaces[place.id]){
      visitedPlaces[place.id] = Date.now();
      saveVisited();
      toast(`Låst opp: ${place.name} ✅`);
    }
  } else {
    toast(`Du er ${d} m unna (trenger ${rEff} m)`);
  }
}

// ==============================
// Quiz
// ==============================
let quizState = {
  quiz: null,
  idx: 0,
  correct: 0,
  person: null
};

function startQuizForPerson(personId){
  const q = QUIZZES.find(x => x.personId === personId);
  const person = PEOPLE.find(x => x.id === personId);
  if (!q){ toast("Ingen quiz enda for denne personen."); return; }

  quizState.quiz = JSON.parse(JSON.stringify(q));
  quizState.idx = 0;
  quizState.correct = 0;
  quizState.person = person || null;

  qTitle.textContent = quizState.quiz.title || (person?.name || "Quiz");
  qFb.textContent = "";
  renderQuizQuestion();
  qModal.setAttribute("aria-hidden","false");
}

function renderQuizQuestion(){
  const qz = quizState.quiz;
  const i  = quizState.idx;
  const q  = qz.questions[i];

  qQ.textContent = q.text;
  qChoices.innerHTML = "";
  qProg.textContent = `Spørsmål ${i+1} av ${qz.questions.length}`;

  q.choices.forEach((choice, idx)=>{
    const b = document.createElement("button");
    b.className = "quiz-choice";
    b.textContent = choice;
    b.onclick = ()=> handleQuizChoice(idx);
    qChoices.appendChild(b);
  });
}

function handleQuizChoice(choiceIdx){
  const qz = quizState.quiz;
  const i  = quizState.idx;
  const q  = qz.questions[i];
  const correct = (choiceIdx === q.answerIndex);

  if (correct) {
    quizState.correct++;
    qFb.textContent = "Riktig! ✅";
  } else {
    qFb.textContent = `Feil. ${q.explanation ? "Hint: "+q.explanation : ""}`;
  }

  // neste spørsmål / slutt
  setTimeout(()=>{
    qFb.textContent = "";
    if (quizState.idx < qz.questions.length - 1){
      quizState.idx++;
      renderQuizQuestion();
    } else {
      finishQuiz();
    }
  }, 800);
}

function finishQuiz(){
  qModal.setAttribute("aria-hidden","true");
  const qz = quizState.quiz;
  const total = qz.questions.length;
  const ok = quizState.correct > 0; // lav terskel: får poeng hvis minst ett riktig

  if (ok){
    const cat = (qz.reward?.category) || (quizState.person?.tags?.[0]) || "Historie";
    const pts = qz.reward?.points || 1;
    meritsByCategory[cat] = (meritsByCategory[cat]||0) + pts;
    saveMerits();
    toast(`+${pts} ${cat} ⭐`);
  } else {
    toast("Prøv igjen! 🙂");
  }
}

// Lukk quiz manuelt
qClose?.addEventListener("click", ()=> qModal.setAttribute("aria-hidden","true"));

// ==============================
// Render: Nærmest nå, Min samling, Merker, Galleri
// ==============================
function renderNearby(){
  if (!elNearList) return;
  const pos = lastPos;
  const items = PLACES.map(p=>{
    const d = pos ? Math.round(distMeters(pos, {lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12)).slice(0, NEARBY_LIMIT);

  elNearList.innerHTML = items.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||""} • radius ${p.r||120} m</div>
      <p class="desc">${p.desc||""}</p>
      <div class="dist">${p.d==null?"":(p.d<1000?`${p.d} m unna`:`${(p.d/1000).toFixed(1)} km unna`)}</div>
    </article>
  `).join("");
}

function renderCollection(){
  if (!elColGrid) return;
  const items = PLACES.filter(p=>visitedPlaces[p.id]);
  elColGrid.innerHTML = items.length
    ? items.slice(0, 10).map(p=>{
        const c = pickColor(p.category);
        const style = `background:${c}E6;${c==="#ffb703"?"color:#111;":""}`;
        return `<span class="badge" style="${style}">${p.name}</span>`;
      }).join("")
    : `<div class="muted">Besøk et sted for å låse opp ditt første merke.</div>`;
  elColCount.textContent = items.length;

  // "+ flere" sheet
  if (elMoreCol){
    elMoreCol.style.display = items.length>10 ? "inline-flex":"none";
    elMoreCol.onclick = ()=>{
      sheetCollection.setAttribute("aria-hidden","false");
      sheetCollectionBody.innerHTML = items.map(p=>{
        const c = pickColor(p.category);
        const style = `background:${c}E6;${c==="#ffb703"?"color:#111;":""}`;
        return `<span class="badge" style="${style}">${p.name}</span>`;
      }).join("");
    };
  }
}

function renderMerits(){
  const el = document.getElementById("merits");
  if (!el) return;
  const cats = ["Historie","Kultur","Sport","Natur","Urban Life"];
  el.innerHTML = cats.map(cat=>{
    const n = meritsByCategory[cat]||0;
    return `
      <div class="diploma">
        <div class="name">${cat}</div>
        <div class="meta">Poeng: ${n}</div>
        <div class="progress"><div style="width:${Math.min(100, n*10)}%"></div></div>
      </div>
    `;
  }).join("");
}

function renderGallery(){
  if (!elGallery) return;
  const got = PEOPLE.filter(p=>peopleCollected[p.id]);
  elGallery.innerHTML = got.length
    ? got.map(p=>{
        const bg = pickColor((p.tags||[])[0]);
        return `
          <article class="person-card">
            <div class="avatar" style="background:${bg}">${(p.initials||p.name?.slice(0,2)||"").toUpperCase()}</div>
            <div class="info">
              <div class="name">${p.name}</div>
              <div class="sub">${p.desc||""}</div>
            </div>
            <button class="person-btn ghost" data-quiz="${p.id}">Quiz</button>
          </article>
        `;
      }).join("")
    : `<div class="muted">Samle personer ute i byen – de du samler vises her.</div>`;
  // quiz fra galleri
  elGallery.querySelectorAll("[data-quiz]").forEach(btn=>{
    btn.addEventListener("click", ()=> startQuizForPerson(btn.getAttribute("data-quiz")));
  });
}

// ==============================
// Sheets & toggles
// ==============================
document.querySelectorAll(".sheet .sheet-close")?.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    const sel = btn.getAttribute("data-close");
    if (sel) document.querySelector(sel)?.setAttribute("aria-hidden","true");
  });
});
elSeeMore?.addEventListener("click", ()=>{
  // fyll med fler nærmeste
  const pos = lastPos;
  const items = PLACES.map(p=>{
    const d = pos ? Math.round(distMeters(pos, {lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));
  sheetNearbyBody.innerHTML = items.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||""} • radius ${p.r||120} m</div>
      <p class="desc">${p.desc||""}</p>
      <div class="dist">${p.d==null?"":(p.d<1000?`${p.d} m`:`${(p.d/1000).toFixed(1)} km`)}</div>
    </article>
  `).join("");
  sheetNearby.setAttribute("aria-hidden","false");
});

// Kart-modus toggle
function enterMapMode(){
  document.body.classList.add("map-only");
  autoFollow = true;
}
function exitMapMode(){
  document.body.classList.remove("map-only");
  autoFollow = false;
}
elSeeMap?.addEventListener("click", enterMapMode);
elExitMap?.addEventListener("click", exitMapMode);

// ==============================
// Geolokasjon
// ==============================
function watchLocation(){
  if (!("geolocation" in navigator)){
    elStatus.textContent = "Geolokasjon støttes ikke.";
    renderNearby(); return;
  }
  elStatus.textContent = "Henter posisjon…";
  navigator.geolocation.watchPosition(pos=>{
    lastPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
    elStatus.textContent = `Din posisjon: ${lastPos.lat.toFixed(5)}, ${lastPos.lon.toFixed(5)}`;
    setUserOnMap(lastPos.lat,lastPos.lon);
    renderNearby();
  }, err=>{
    elStatus.textContent = "Kunne ikke hente posisjon: " + err.message;
    renderNearby();
  }, { enableHighAccuracy:true, maximumAge:5000, timeout:15000 });
}

// Testmodus
elTest?.addEventListener("change", e=>{
  if (e.target.checked){
    lastPos = {lat:59.9139, lon:10.7522};
    setUserOnMap(lastPos.lat,lastPos.lon);
    renderNearby();
    toast("Testmodus PÅ");
  } else {
    toast("Testmodus AV");
    watchLocation();
  }
});

// ==============================
// Init
// ==============================
async function boot(){
  try{
    const [places, people, quizzes] = await Promise.all([
      fetch("places.json").then(r=>r.json()),
      fetch("people.json").then(r=>r.json()).catch(()=>[]),
      fetch("quizzes.json").then(r=>r.json()).catch(()=>[])
    ]);
    PLACES = places||[];
    PEOPLE = people||[];
    QUIZZES = quizzes||[];

    initMap();
    renderNearby();
    renderCollection();
    renderMerits();
    renderGallery();
    watchLocation();
  } catch(e){
    console.error(e);
    toast("Kunne ikke laste data.");
  }
}

document.addEventListener("DOMContentLoaded", boot);
