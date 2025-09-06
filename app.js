// ==============================
// History Go – v12 app.js
// ==============================

const NEARBY_LIMIT = 2;
const START_POS = { lat: 59.9139, lon: 10.7522, zoom: 13 };

// Data
let PLACES = [];
let PEOPLE = [];
let QUIZZES = [];

// State i storage
const visited = JSON.parse(localStorage.getItem("visited_places") || "{}");           // stedId: true
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}"); // personId: timestamp
const meritsByCat = JSON.parse(localStorage.getItem("merits_by_category") || "{}");   // kategori: poeng

function saveVisited(){ localStorage.setItem("visited_places", JSON.stringify(visited)); renderCollection(); }
function savePeople(){ localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); renderGallery(); }
function saveMerits(){ localStorage.setItem("merits_by_category", JSON.stringify(meritsByCat)); renderMerits(); }

// DOM refs
const el = {
  map:        document.getElementById('map'),
  toast:      document.getElementById('toast'),
  status:     document.getElementById('status'),
  test:       document.getElementById('testToggle'),

  btnSeeMap:  document.getElementById('btnSeeMap'),
  btnExitMap: document.getElementById('btnExitMap'),
  btnCenter:  document.getElementById('btnCenter'),
  btnFollow:  document.getElementById('btnFollow'),

  nearbyList: document.getElementById('nearbyList'),
  btnSeeMoreNearby: document.getElementById('btnSeeMoreNearby'),
  sheetNearby: document.getElementById('sheetNearby'),
  sheetNearbyBody: document.getElementById('sheetNearbyBody'),

  collectionGrid: document.getElementById('collectionGrid'),
  collectionCount: document.getElementById('collectionCount'),
  sheetCollection: document.getElementById('sheetCollection'),
  sheetCollectionBody: document.getElementById('sheetCollectionBody'),
  btnMoreCollection: document.getElementById('btnMoreCollection'),

  merits:     document.getElementById('merits'),
  gallery:    document.getElementById('gallery'),

  placeCard:  document.getElementById('placeCard'),
  pcTitle:    document.getElementById('pcTitle'),
  pcMeta:     document.getElementById('pcMeta'),
  pcDesc:     document.getElementById('pcDesc'),
  pcClose:    document.getElementById('pcClose'),
  pcMore:     document.getElementById('pcMore'),
  pcUnlock:   document.getElementById('pcUnlock'),

  quizModal:  document.getElementById('quizModal'),
  quizClose:  document.getElementById('quizClose'),
  quizTitle:  document.getElementById('quizTitle'),
  quizQuestion: document.getElementById('quizQuestion'),
  quizChoices:  document.getElementById('quizChoices'),
  quizProgress: document.getElementById('quizProgress'),
  quizFeedback: document.getElementById('quizFeedback'),
};

function toast(msg="OK"){ if(!el.toast) return; el.toast.textContent=msg; el.toast.style.display="block"; setTimeout(()=>el.toast.style.display="none",1500); }

// Geo helpers
function haversine(a,b){
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function catColor(cat){
  const k=(cat||"").toLowerCase();
  if(k.startsWith("hist")) return "#1976d2";
  if(k.startsWith("kul"))  return "#e63946";
  if(k.startsWith("sport"))return "#2a9d8f";
  if(k.startsWith("natur"))return "#43a047";
  if(k.startsWith("urban"))return "#ffb703";
  return "#888";
}

// Map
let MAP, userMarker, userCircle, placeLayer;
let autoFollow=false;
let currentPos=null;
let lastMapUserDrag=0;

// Map init
function initMap(){
  MAP = L.map('map', { zoomControl:false, attributionControl:false }).setView([START_POS.lat, START_POS.lon], START_POS.zoom);
  // Mørk tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom:20 }).addTo(MAP);

  placeLayer = L.layerGroup().addTo(MAP);

  // Track pan/zoom for å slå av follow
  MAP.on('movestart', ()=>{ lastMapUserDrag=Date.now(); if(autoFollow) setAutoFollow(false); });
}

function setUser(lat, lon){
  if(!MAP) return;
  if(!userMarker){
    userMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className:"", html:`<div style="width:16px;height:16px;border-radius:50%;background:#00e676;border:2px solid #063;box-shadow:0 0 0 3px rgba(0,230,118,.35)"></div>`
      })
    }).addTo(MAP);
    userCircle = L.circle([lat, lon], {radius:25, color:"#00e676", weight:1, opacity:.6, fillColor:"#00e676", fillOpacity:.12}).addTo(MAP);
  } else {
    userMarker.setLatLng([lat,lon]); userCircle.setLatLng([lat,lon]);
  }
}

function centerMap(){ if(currentPos && MAP) MAP.setView([currentPos.lat,currentPos.lon], Math.max(MAP.getZoom(), 15), {animate:true}); }

function setAutoFollow(on){
  autoFollow = on;
  el.btnFollow.classList.toggle('active', !!on);
  toast(on ? "Auto-follow på" : "Auto-follow av");
}

function redrawPlaces(){
  if(!placeLayer) return;
  placeLayer.clearLayers();

  PLACES.forEach(p=>{
    const color = catColor(p.category);
    // stor hitbox via divIcon
    const icon = L.divIcon({
      className: "place-icon",
      html: `
        <div class="hitbox" style="position:absolute;left:-22px;top:-22px;width:44px;height:44px;border-radius:50%;"></div>
        <div class="dot" style="position:absolute;left:-5px;top:-5px;width:10px;height:10px;border-radius:50%;background:${color};box-shadow:0 0 8px ${color}88;"></div>
      `,
      iconSize: [44,44],
      iconAnchor: [22,22]
    });
    const m = L.marker([p.lat, p.lon], {icon}).addTo(placeLayer);

    m.on('click', ()=> openPlaceCard(p));
  });
}

// Place card
let activePlace=null;
function openPlaceCard(p){
  activePlace=p;
  el.pcTitle.textContent = p.name;
  el.pcMeta.textContent  = `${p.category} • radius ${p.r||120} m`;
  el.pcDesc.textContent  = p.desc || "";
  el.placeCard.setAttribute('aria-hidden','false');

  // Lås opp
  el.pcUnlock.onclick = ()=>{
    if(!currentPos){ toast("Ingen posisjon"); return; }
    const boost = el.test?.checked ? 5000 : 0;
    const rEff = Math.max(p.r||120, boost);
    const d = Math.round(haversine(currentPos, {lat:p.lat,lon:p.lon}));
    if(d <= rEff){
      if(!visited[p.id]){ visited[p.id]=true; saveVisited(); addMerit(p.category, 1); toast(`Låst opp: ${p.name} ✅`); }
      else toast(`Allerede låst opp ✅`);
    } else {
      toast(`Du er ${d} m unna (trenger ${rEff} m)`);
    }
  };

  el.pcMore.onclick = ()=>{
    window.open(`https://www.google.com/search?q=${encodeURIComponent(p.name+" Oslo")}`,'_blank');
  };
}
el.pcClose.onclick = ()=> el.placeCard.setAttribute('aria-hidden','true');

// Merits (poeng/valør)
function addMerit(cat, pts){
  meritsByCat[cat] = (meritsByCat[cat]||0) + pts;
  saveMerits();
}
function levelFor(points){
  if(points>=20) return {label:"Geni", pct:100};
  if(points>=12) return {label:"Mester", pct: Math.min(100, Math.round((points/20)*100))};
  if(points>=5)  return {label:"Amatør", pct: Math.min(100, Math.round((points/20)*100))};
  return {label:"Nybegynner", pct: Math.min(100, Math.round((points/20)*100))};
}

// Render: Nearby
function renderNearby(pos){
  const withDist = PLACES.map(p=>{
    const d = pos ? Math.round(haversine(pos, {lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));

  const subset = withDist.slice(0, NEARBY_LIMIT);
  el.nearbyList.innerHTML = subset.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category} • Oslo</div>
      <p class="desc">${p.desc||''}</p>
      <div class="dist">${p.d==null?'':(p.d<1000?`${p.d} m`:`${(p.d/1000).toFixed(1)} km`)}</div>
    </article>
  `).join("");

  // Sheet for "Se flere"
  el.btnSeeMoreNearby.onclick = ()=>{
    const rest = withDist.slice(NEARBY_LIMIT);
    el.sheetNearbyBody.innerHTML = rest.length
      ? rest.map(p=>`
          <article class="card" style="margin-bottom:8px">
            <div class="name">${p.name}</div>
            <div class="meta">${p.category}</div>
            <div class="desc">${p.desc||''}</div>
            <div class="dist">${p.d==null?'':(p.d<1000?`${p.d} m`:`${(p.d/1000).toFixed(1)} km`)}</div>
          </article>
        `).join("")
      : `<div class="muted">Ingen flere funnet.</div>`;
    openSheet(el.sheetNearby);
  };
}

// Render: Collection (én rad + +N)
function renderCollection(){
  const items = PLACES.filter(p=>visited[p.id]);
  el.collectionGrid.innerHTML = "";
  const maxInRow = 5;
  items.slice(0, maxInRow).forEach(p=>{
    const cls = catBadgeClass(p.category);
    const chip = document.createElement("span");
    chip.className = `badge ${cls}`;
    chip.textContent = p.name;
    el.collectionGrid.appendChild(chip);
  });
  el.collectionCount.textContent = items.length;
  const hidden = Math.max(0, items.length - maxInRow);
  el.btnMoreCollection.style.display = hidden>0 ? "inline-flex" : "none";
  el.btnMoreCollection.onclick = ()=>{
    el.sheetCollectionBody.innerHTML = items.map(p=>{
      const cls = catBadgeClass(p.category);
      return `<span class="badge ${cls}">${p.name}</span>`;
    }).join("");
    openSheet(el.sheetCollection);
  };
}
function catBadgeClass(cat){
  const k=(cat||"").toLowerCase();
  if(k.startsWith("hist")) return "hist";
  if(k.startsWith("kul"))  return "kult";
  if(k.startsWith("sport"))return "sport";
  if(k.startsWith("natur"))return "natur";
  if(k.startsWith("urban"))return "urban";
  return "";
}

// Render: Merits
function renderMerits(){
  // Vis alle kategorier som finnes blant PLACES
  const cats = [...new Set(PLACES.map(p=>p.category))];
  el.merits.innerHTML = cats.map(cat=>{
    const pts = meritsByCat[cat]||0;
    const lvl = levelFor(pts);
    return `
      <div class="merit">
        <div class="name">${cat} • <strong>${lvl.label}</strong></div>
        <div class="meta">Poeng: ${pts}</div>
        <div class="bar"><span style="width:${lvl.pct}%"></span></div>
      </div>
    `;
  }).join("");
}

// Render: Gallery (kun samlet personer)
function renderGallery(){
  if(!el.gallery) return;
  const got = PEOPLE.filter(p => peopleCollected[p.id]);
  el.gallery.innerHTML = got.length
    ? got.map(p=>`
        <article class="person-card">
          <div class="avatar">${(p.initials||p.name?.slice(0,2)||'??').toUpperCase()}</div>
          <div>
            <div class="name">${p.name}</div>
            <div class="meta">${p.desc||''}</div>
          </div>
          <div class="spacer"></div>
        </article>
      `).join("")
    : `<div class="muted">Samle personer ved stedene og gjennom quiz – de vises her når du har dem.</div>`;
}

// People & quiz
function availablePeopleAtPlace(placeId){
  // Person er tilgjengelig hvis (du er i radius) eller (stedet er besøkt)
  if(!placeId) return [];
  return PEOPLE.filter(p => p.placeId === placeId);
}

function startQuizForPerson(personId){
  const quiz = QUIZZES.find(q => q.personId === personId);
  if(!quiz){ toast("Ingen quiz tilgjengelig"); return; }
  openQuiz(quiz);
}

let quizState=null;
function openQuiz(quiz){
  quizState = { quiz, i:0, correct:0 };
  el.quizTitle.textContent = quiz.title || "Quiz";
  el.quizFeedback.textContent = "";
  el.quizFeedback.className = "quiz-feedback";
  renderQuizStep();
  el.quizModal.setAttribute('aria-hidden','false');
}
function closeQuiz(){ el.quizModal.setAttribute('aria-hidden','true'); quizState=null; }
el.quizClose.onclick = closeQuiz;

function renderQuizStep(){
  const { quiz, i } = quizState;
  const q = quiz.questions[i];
  el.quizQuestion.textContent = q.text;
  el.quizChoices.innerHTML = q.choices.map((c,idx)=>`<button data-idx="${idx}">${c}</button>`).join("");
  el.quizProgress.textContent = `Spørsmål ${i+1} av ${quiz.questions.length}`;
  el.quizChoices.querySelectorAll('button').forEach(btn=>{
    btn.onclick = ()=> onQuizChoice(parseInt(btn.getAttribute('data-idx'),10));
  });
}

function onQuizChoice(idx){
  const { quiz, i } = quizState;
  const q = quiz.questions[i];
  const ok = idx === q.answerIndex;
  el.quizFeedback.textContent = ok ? (q.explanation || "Riktig!") : ("Feil. " + (q.explanation||""));
  el.quizFeedback.className = "quiz-feedback " + (ok ? "ok" : "err");
  setTimeout(()=>{
    if(ok){
      quizState.correct++;
      if(quizState.i < quiz.questions.length-1){
        quizState.i++; renderQuizStep();
      } else {
        // Fullført
        addMerit(quiz.reward?.category || quiz.category, quiz.reward?.points || 1);
        // person inn i samling
        const pid = quiz.personId;
        if(!peopleCollected[pid]){ peopleCollected[pid]=Date.now(); savePeople(); }
        toast("Quiz fullført! Poeng +1");
        closeQuiz();
      }
    } else {
      // la spilleren prøve igjen på samme spørsmål
      renderQuizStep();
    }
  }, 1300); // ← feedback blir stående 1.3s
}

// Sheets helpers
function openSheet(node){ node?.setAttribute('aria-hidden','false'); }
function closeSheet(node){ node?.setAttribute('aria-hidden','true'); }
document.querySelectorAll('.sheet .sheet-close').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sel = btn.getAttribute('data-close');
    if(sel) closeSheet(document.querySelector(sel));
  });
});

// Kart-modus toggle
function enterMapMode(){ document.body.classList.add('map-only'); }
function exitMapMode(){ document.body.classList.remove('map-only'); setAutoFollow(false); }
el.btnSeeMap.onclick = enterMapMode;
el.btnExitMap.onclick = exitMapMode;

// Senter & follow
el.btnCenter.onclick = centerMap;
el.btnFollow.onclick = ()=> setAutoFollow(!autoFollow);

// Geolokasjon
function requestLocation(){
  if(!navigator.geolocation){
    el.status.textContent="Geolokasjon støttes ikke.";
    renderNearby(null);
    return;
  }
  el.status.textContent="Henter posisjon…";
  navigator.geolocation.watchPosition(
    (pos)=>{
      currentPos = { lat:pos.coords.latitude, lon:pos.coords.longitude };
      el.status.textContent = `Posisjon: ${currentPos.lat.toFixed(5)}, ${currentPos.lon.toFixed(5)}`;
      setUser(currentPos.lat, currentPos.lon);
      renderNearby(currentPos);

      if(autoFollow && document.body.classList.contains('map-only')){
        const sinceDrag = Date.now()-lastMapUserDrag;
        if(sinceDrag>500){ centerMap(); }
      }
    },
    (err)=>{
      el.status.textContent = "Kunne ikke hente posisjon: " + err.message;
      renderNearby(null);
    },
    { enableHighAccuracy:true, maximumAge:5000, timeout:15000 }
  );
}

// Testmodus
el.test?.addEventListener('change', e=>{
  if(e.target.checked){
    currentPos = { lat: START_POS.lat, lon: START_POS.lon };
    el.status.textContent = "Testmodus: Oslo sentrum";
    setUser(currentPos.lat, currentPos.lon);
    renderNearby(currentPos);
    toast("Testmodus PÅ");
  } else {
    toast("Testmodus AV");
    // reinit pos via geoloc
  }
});

// Init
async function boot(){
  try{
    const [places, people, quizzes] = await Promise.all([
      fetch('places.json').then(r=>r.json()),
      fetch('people.json').then(r=>r.json()).catch(()=>[]),
      fetch('quizzes.json').then(r=>r.json()).catch(()=>[])
    ]);
    PLACES = places||[];
    PEOPLE = people||[];
    QUIZZES = quizzes||[];

    initMap();
    redrawPlaces();
    renderCollection();
    renderMerits();
    renderGallery();
    requestLocation();

  }catch(e){
    console.error(e);
    toast("Kunne ikke laste data.");
  }
}

// Knytt personer til placeCard (start quiz)
document.addEventListener('click', (ev)=>{
  // Klikk på person-knapp inni placeCard kunne vært implementert her om vi viser personliste per sted
});

// Start
document.addEventListener('DOMContentLoaded', boot);
