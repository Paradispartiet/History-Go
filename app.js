// ==============================
// History Go – app.js (v14 plan applied)
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

// Colors/classes
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

// Geo
function distMeters(a,b){
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

      <div style="
        width:28px;height:28px;border-radius:999px;
        background:${catColor(tagToCat(pr.tags))}; color:#111;
        display:flex;align-items:center;justify-content:center;
        font-weight:900; font-size:12px; border:2px solid #111;
        box-shadow:0 0 0 3px rgba(0,0,0,.25);
      ">${(pr.initials||'').slice(0,2).toUpperCase()}</div>`;
    const icon = L.divIcon({ className:"", html, iconSize:[28,28], iconAnchor:[14,14] });
    const mk = L.marker([pr.lat,pr.lon], { icon }).addTo(peopleLayer);
    const hb = L.circle([pr.lat, pr.lon], {radius: 36, opacity:0, fillOpacity:0}).addTo(peopleLayer);
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

// Routing (real streets via OSRM; fallback to straight line)
function showRouteTo(place){
  if (!MAP) return;
  const from = currentPos ? L.latLng(currentPos.lat, currentPos.lon) : L.latLng(START.lat, START.lon);
  const to   = L.latLng(place.lat, place.lon);

  // Clear fallback line if any
  if (routeLine){ MAP.removeLayer(routeLine); routeLine = null; }

  try{
    if (!L.Routing) throw new Error('no LRM');
    if (routeControl){ MAP.removeControl(routeControl); routeControl = null; }
    routeControl = L.Routing.control({
      waypoints: [from, to],
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      addWaypoints: false, draggableWaypoints: false, fitSelectedRoutes: true, show: false,
      lineOptions: {
        styles: [{color:'#cfe8ff', opacity:1, weight:6}]
      },
      createMarker: ()=>null
    }).addTo(MAP);
    showToast('Rute lagt (gatevis).', 1600);
  }catch(e){
    // Fallback straight polyline
    routeLine = L.polyline([from, to], {color:'#cfe8ff', weight:5, opacity:1}).addTo(MAP);
    MAP.fitBounds(routeLine.getBounds(), {padding:[40,40]});
    showToast('Vis som linje (ingen ruter-tjeneste)', 2000);
  }
}

// Place card
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

  // 🏅 Poeng til kategori ved sted-opplåsning
  const cat = p.category || "Historie";
  merits[cat] = merits[cat] || { level:"Nybegynner", points:0 };
  merits[cat].points += 1;
  if (merits[cat].points >= 10) merits[cat].level = "Mester";
  else if (merits[cat].points >= 5) merits[cat].level = "Kjentmann";
  saveMerits();

  showToast(`Låst opp: ${p.name} ✅`);
};
  el.pcRoute.onclick = ()=> showRouteTo(p);
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

el.pcClose.addEventListener('click', ()=> {
  el.pc.setAttribute('aria-hidden','true');
  el.pcUnlock.textContent = "Lås opp";
});

// Render lists
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
      // ensure coords
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
    </article>
  `;
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
    </article>
  `;
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

async function renderMerits(){
  const badges = await fetch("badges.json").then(r=>r.json());
  const cats = new Set(PLACES.map(p=>p.category).concat(["Vitenskap"]));

  el.merits.innerHTML = [...cats].map(cat=>{
    const m = merits[cat] || { level:"Nybegynner", points:0 };
    // match badge ved å sjekke id/navn mot kategori
    const badge = badges.find(b =>
      cat.toLowerCase().includes(b.id) ||
      b.name.toLowerCase().includes(cat.toLowerCase())
    );
    let status = `Nivå: ${m.level} • Poeng: ${m.points}`;
    if (badge){
      const next = badge.tiers.find(t => m.points < t.threshold);
      status = next
        ? `${m.points}/${next.threshold} poeng (→ ${next.label})`
        : `${m.points} poeng – maks nivå`;
    }
    return `
      <div class="card">
        <div class="name">${cat}</div>
        <div class="meta">${status}</div>
      </div>
    `;
  }).join("");
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

// Sheets
function openSheet(sheet){ sheet?.setAttribute('aria-hidden','false'); }
function closeSheet(sheet){ sheet?.setAttribute('aria-hidden','true'); }
document.querySelectorAll('[data-close]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sel = btn.getAttribute('data-close');
    document.querySelector(sel)?.setAttribute('aria-hidden','true');
  });
});

// Quiz
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
document.getElementById('quizClose').addEventListener('click', ()=> el.quizModal.setAttribute('aria-hidden','true'));

// Geolocation
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

// Map mode
el.btnCenter.addEventListener('click', ()=>{
  if (currentPos && MAP){
    MAP.setView([currentPos.lat, currentPos.lon], Math.max(MAP.getZoom(), 15), {animate:true});
    showToast("Sentrert");
  }
});
el.btnSeeMap.addEventListener('click', ()=>{ document.body.classList.add('map-only'); });
el.btnExitMap.addEventListener('click', ()=>{ document.body.classList.remove('map-only'); });

// See more nearby
el.seeMore.addEventListener('click', ()=>{ buildSeeMoreNearby(); openSheet(el.sheetNear); });

// Boot
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

    drawPlaceMarkers();
    drawPeopleMarkers();

    renderNearbyPlaces();
    renderNearbyPeople();
    renderCollection();
    renderMerits();
    renderGallery();

    requestLocation();
  }).catch((e)=>{
    console.error('DATA LOAD ERROR', e);
    showToast("Kunne ikke laste data.", 2000);
  });

  wire();
}
document.addEventListener('DOMContentLoaded', boot);

// ===================================================================
// TOAST – liten melding nede på skjermen
// ===================================================================
function showToast(msg = "OK", ms = 2000) { … }
…
async function renderBadges() { … }

// ===================================================================
// AUTOMATISK OPPDATERING AV MERKER VED VISNING
// ===================================================================

// Når brukeren åpner eller trykker på "Merker"-panelet
document.addEventListener("DOMContentLoaded", () => {
  const meritsPanel = document.querySelector("section.panel h2");
  if (!meritsPanel) return;

  // Sjekk alle h2-elementer – finn den som heter "Merker"
  document.querySelectorAll("section.panel h2").forEach(h2 => {
    if (h2.textContent.trim().startsWith("Merker")) {
      // Kjør en gang ved lasting
      renderBadges();

      // Kjør også hver gang panelet blir synlig (scroll eller klikk)
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          renderBadges();
        }
      }, { threshold: 0.3 });
      observer.observe(h2);
    }
  });
});
