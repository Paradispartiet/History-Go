// ==============================
// History Go – app.js (Merker erstatter Diplomer)
// - Poeng fra sted (+1), person (+1), quiz (+1)
// - Kart-modus, auto-follow, info-kort, “Se flere”
// ==============================

const NEARBY_LIMIT = 2;
const START_POS = { lat: 59.9139, lon: 10.7522, zoom: 13 };

// Data
let PLACES = [];
let PEOPLE = [];
let BADGES = [];

Promise.all([
  fetch('places.json').then(r => r.json()),
  fetch('people.json').then(r => r.json()).catch(() => []),
  fetch('badges.json').then(r => r.json()).catch(() => [])
]).then(([places, people, badges]) => {
  PLACES = places || [];
  PEOPLE = people || [];
  BADGES = badges || [];
  init();
});

// Storage
const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const badgeProgress   = JSON.parse(localStorage.getItem("badge_progress") || "{}"); // { [badgeId]: { points, tier } }

function saveVisited(){  localStorage.setItem("visited_places", JSON.stringify(visited));  renderCollection(); }
function savePeople(){   localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); }
function saveBadges(){   localStorage.setItem("badge_progress", JSON.stringify(badgeProgress)); }

// DOM
const el = {
  map:        document.getElementById('map'),
  overlay:    document.getElementById('overlay'),
  status:     document.getElementById('status'),
  list:       document.getElementById('list'),
  collection: document.getElementById('collectionGrid'),
  count:      document.getElementById('count'),
  badges:     document.getElementById('badges'),
  gallery:    document.getElementById('gallery'),
  toast:      document.getElementById('toast'),
  test:       document.getElementById('testToggle'),
  fabMap:     document.getElementById('fabMap'),
  centerBtn:  document.getElementById('centerBtn'),
  nearbyMore: document.getElementById('nearbyMoreBtn'),
  sheet:      document.getElementById('nearbySheet'),
  sheetClose: document.getElementById('nearbySheetClose'),
  sheetList:  document.getElementById('nearbySheetList'),
  expandColl: document.getElementById('expandCollection'),
  infoCard:   document.getElementById('infoCard'),
  infoIcon:   document.getElementById('infoIcon'),
  infoTitle:  document.getElementById('infoTitle'),
  infoMeta:   document.getElementById('infoMeta'),
  infoDesc:   document.getElementById('infoDesc'),
  infoMore:   document.getElementById('infoMoreBtn'),
  infoUnlock: document.getElementById('infoUnlockBtn'),
  infoClose:  document.getElementById('infoClose'),
  quizDlg:    document.getElementById('quizDialog'),
  quizClose:  document.getElementById('quizClose'),
  quizBody:   document.getElementById('quizBody'),
};

let map, placeLayer, peopleLayer, userMarker;
let isMapMode = false;
let autoFollow = false;
let currentPos = null;
let lastClickedPlace = null;
let lastQuizPerson = null;

// Utils
function showToast(msg='OK'){
  if(!el.toast) return;
  el.toast.textContent = msg;
  el.toast.style.display='block';
  setTimeout(()=> el.toast.style.display='none', 1400);
}
function haversine(a,b){
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function pickColor(cat){
  const c = (cat||'').toLowerCase();
  if (c.includes('kultur')) return '#e63946';
  if (c.includes('sport')) return '#2a9d8f';
  if (c.includes('natur')) return '#4caf50';
  if (c.includes('urban')) return '#3a7bd5';
  return '#1976d2';
}

// Kategori -> merke-id (poengkonto)
function badgeIdForCategory(cat){
  const c=(cat||'').toLowerCase();
  if (c.includes('historie')) return 'tidslinje';
  if (c.includes('kultur'))   return 'kunst_kultur';
  if (c.includes('sport'))    return 'sport';
  if (c.includes('natur'))    return 'natur';
  if (c.includes('urban'))    return 'by_arkitektur';
  return 'oppdager'; // fallback
}

// Merke-hjelpere
function findBadge(badgeId){ return BADGES.find(b => b.id === badgeId); }
function evaluateTier(badgeId){
  const b = findBadge(badgeId); if (!b) return null;
  const pts = (badgeProgress[badgeId]?.points) || 0;
  let unlocked = null;
  for (const t of b.tiers){
    if (pts >= t.threshold) unlocked = t.id;
  }
  return unlocked;
}
function awardBadgePoints(badgeId, pts=1){
  if (!badgeProgress[badgeId]) badgeProgress[badgeId] = { points: 0, tier: null };
  badgeProgress[badgeId].points += pts;
  const prevTier = badgeProgress[badgeId].tier;
  const newTier = evaluateTier(badgeId);
  if (newTier && newTier !== prevTier){
    badgeProgress[badgeId].tier = newTier;
    const b = findBadge(badgeId);
    const tierObj = b.tiers.find(t => t.id === newTier);
    showToast(`${b?.icon||'⭐'} ${b?.name||'Merke'}: ${tierObj?.label||'Nytt nivå'}!`);
  } else {
    const b = findBadge(badgeId);
    showToast(`+${pts} poeng i ${b?.name||'merke'}`);
  }
  saveBadges();
  renderBadges();
}

// Kart
function initMap(){
  map = L.map('map', { zoomControl:false, attributionControl:false }).setView([START_POS.lat, START_POS.lon], START_POS.zoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap, &copy; CARTO', maxZoom: 19
  }).addTo(map);
  placeLayer  = L.layerGroup().addTo(map);
  peopleLayer = L.layerGroup().addTo(map);
  drawPlaces();
}
function addPlaceMarker(p){
  const color = pickColor(p.category);
  const mark = L.circleMarker([p.lat, p.lon], {
    radius:7, weight:2, color:'#111', fillColor:color, fillOpacity:.9
  }).addTo(placeLayer);
  const hit = L.circleMarker([p.lat, p.lon], {
    radius:20, weight:0, color:'transparent', fillColor:'transparent', fillOpacity:0, interactive:true
  }).addTo(placeLayer);
  const open = ()=> openInfoCard(p);
  mark.on('click', open); hit.on('click', open);
}
function drawPlaces(){ placeLayer.clearLayers(); PLACES.forEach(addPlaceMarker); }
function updateUserOnMap(pos){
  if (!map || !pos) return;
  if (!userMarker){
    userMarker = L.circleMarker([pos.lat, pos.lon], {
      radius:8, weight:2, color:'#fff', fillColor:'#1976d2', fillOpacity:1
    }).addTo(map).bindPopup('Du er her');
  } else {
    userMarker.setLatLng([pos.lat, pos.lon]);
  }
  if (isMapMode && autoFollow){
    map.setView([pos.lat, pos.lon], Math.max(map.getZoom(), 15), { animate:true });
  }
}

// Info-kort + personer/quiz
function openInfoCard(place){
  lastClickedPlace = place;
  el.infoIcon.textContent  = place.icon || '📍';
  el.infoTitle.textContent = place.name;
  el.infoMeta.textContent  = `${place.category} • radius ${place.r||120} m`;
  el.infoDesc.textContent  = place.desc || '';

  // Personer på stedet
  const here = PEOPLE.filter(pr => pr.placeId === place.id);
  const peopleBlock = here.length ? `
    <div class="info-people">
      <div class="info-people-title">Personer her</div>
      <div class="info-people-list">
        ${here.map(pr => `
          <button class="person-chip" data-person="${pr.id}">
            ${(pr.initials||pr.name.slice(0,2)).toUpperCase()} – ${pr.name}
          </button>`).join('')}
      </div>
    </div>
  ` : '';
  el.infoDesc.innerHTML = (place.desc || '') + peopleBlock;

  if (here.length){
    el.infoDesc.querySelectorAll('.person-chip').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const pid = btn.getAttribute('data-person');
        const person = PEOPLE.find(p=>p.id===pid);
        if (person) openQuiz(person, place);
      });
    });
  }

  el.infoCard.hidden = false;
}
function closeInfoCard(){ el.infoCard.hidden = true; }

function openQuiz(person, placeForContext){
  lastQuizPerson = person;
  const q = person.quiz;
  if (!q || !Array.isArray(q.choices)) {
    // Ingen quiz → samle person direkte (+ poeng for person)
    awardPerson(person, placeForContext);
    return;
  }
  el.quizTitle.textContent = `Quiz: ${person.name}`;
  el.quizBody.innerHTML = `
    <p class="quiz-q">${q.question}</p>
    <div class="quiz-options">
      ${q.choices.map((c, i)=>`
        <button class="quiz-option" data-i="${i}">${c}</button>
      `).join('')}
    </div>
    ${q.hint ? `<p class="quiz-hint muted">Hint: ${q.hint}</p>` : ``}
  `;
  el.quizBody.querySelectorAll('.quiz-option').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = Number(btn.getAttribute('data-i'));
      const correct = idx === q.answerIndex;
      if (correct){
        // Samle person (om ikke allerede)
        awardPerson(person, placeForContext);
        // Quiz-poeng → eksplisitt badgeId eller default "kunnskap"
        const award = person.quiz?.award;
        const badgeId = award?.badgeId || 'kunnskap';
        const pts = award?.points || 1;
        awardBadgePoints(badgeId, pts);
        closeDialog(el.quizDlg);
      } else {
        showToast('Feil, prøv igjen ✍️');
      }
    });
  });
  openDialog(el.quizDlg);
}

// Åpne/lukk dialog
function openDialog(dlg){ try{ dlg.showModal(); }catch{ dlg.setAttribute('open',''); } }
function closeDialog(dlg){ try{ dlg.close(); }catch{ dlg.removeAttribute('open'); } }
el.infoClose?.addEventListener('click', closeInfoCard);
el.infoMore?.addEventListener('click', ()=>{
  if (!lastClickedPlace) return;
  alert(`${lastClickedPlace.name}\n\n${lastClickedPlace.desc||''}`);
});
el.quizClose?.addEventListener('click', ()=> closeDialog(el.quizDlg));

// Nearby / collection / badges / gallery
function renderNearby(pos){
  const withDist = PLACES.map(p=>{
    const d = pos ? Math.round(haversine(pos, {lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));
  const subset = withDist.slice(0, NEARBY_LIMIT);
  el.list.innerHTML = subset.map(p=>`
    <article class="card">
      <div>
        <div class="name">${p.icon||'📍'} ${p.name}</div>
        <div class="meta">${p.category||''} • Oslo</div>
        <p class="desc">${p.desc||''}</p>
        <div class="dist">${p.d==null ? '' : (p.d<1000 ? `${p.d} m unna` : `${(p.d/1000).toFixed(1)} km unna`)}</div>
      </div>
    </article>
  `).join('');
  fillNearbySheet(withDist.slice(NEARBY_LIMIT));
}
function fillNearbySheet(items){
  el.sheetList.innerHTML = items.length
    ? items.map(p=>`
      <article class="card">
        <div>
          <div class="name">${p.icon||'📍'} ${p.name}</div>
          <div class="meta">${p.category||''} • radius ${p.r||120} m</div>
          <p class="desc">${p.desc||''}</p>
          <div class="dist">${p.d==null ? '' : (p.d<1000 ? `${p.d} m unna` : `${(p.d/1000).toFixed(1)} km unna`)}</div>
        </div>
      </article>
    `).join('')
    : `<div class="muted">Ingen flere i nærheten nå.</div>`;
}
function renderCollection(){
  const items = PLACES.filter(p=>visited[p.id]);
  const SHOW = 8;
  const head = items.slice(0, SHOW);
  const rest = items.length - head.length;

  el.collection.innerHTML = head.length
    ? head.map(p=>`<span class="badge">${p.icon||'📍'} ${p.name}</span>`).join('')
    : `<div class="muted">Besøk et sted for å låse opp ditt første merke.</div>`;
  el.count.textContent = `(${items.length})`;

  if (rest > 0){
    el.expandColl.hidden = false;
    el.expandColl.textContent = `+${rest} flere`;
    el.expandColl.onclick = ()=>{
      el.collection.insertAdjacentHTML('beforeend',
        items.slice(SHOW).map(p=>`<span class="badge">${p.icon||'📍'} ${p.name}</span>`).join('')
      );
      el.expandColl.hidden = true;
    };
  } else {
    el.expandColl.hidden = true;
  }
}
function renderBadges(){
  if (!el.badges) return;
  el.badges.innerHTML = BADGES.map(b=>{
    const pts  = badgeProgress[b.id]?.points || 0;
    const tier = badgeProgress[b.id]?.tier || null;
    const tierLabel = tier ? b.tiers.find(t=>t.id===tier)?.label : null;
    const next = b.tiers.find(t => !tier || t.threshold > pts);
    const goal = next ? next.threshold : pts || 1;
    const pct  = Math.max(0, Math.min(100, Math.round((pts/goal)*100)));
    return `
      <div class="diploma">
        <div class="name">${b.icon||'⭐'} ${b.name} ${tierLabel?`<span class="tier">${tierLabel}</span>`:''}</div>
        <div class="meta">${b.desc}</div>
        <div class="progress"><span style="width:${pct}%;"></span></div>
        <div class="muted" style="margin-top:6px">
          ${next ? `→ ${goal-pts} poeng til ${next.label}` : `Maks nivå!`}
        </div>
      </div>
    `;
  }).join('');
}
function renderGallery(){
  if (!el.gallery) return;
  const got = PEOPLE.filter(p=>peopleCollected[p.id]);
  el.gallery.innerHTML = got.length
    ? got.map(p=>`
        <article class="person-card">
          <div class="avatar">${(p.initials||p.name?.slice(0,2)||'??').toUpperCase()}</div>
          <div class="info">
            <div class="name">${p.name}</div>
            <div class="meta">${p.desc||p.sub||''}</div>
          </div>
          <button class="person-btn">Samlet</button>
        </article>
      `).join('')
    : `<div class="muted">Samle personer ved steder og events.</div>`;
}

// Tildeling: sted/person
function awardBadge(place){
  if (visited[place.id]) return;
  visited[place.id] = true;
  saveVisited();
  showToast(`Låst opp: ${place.icon||'📍'} ${place.name} ✅`);

  // Merke-poeng for sted
  const badgeId = badgeIdForCategory(place.category);
  awardBadgePoints(badgeId, 1);
}
function awardPerson(person, placeForContext){
  if (peopleCollected[person.id]) {
    // fortsatt poeng for å bestå quiz kan skje separat
    return;
  }
  peopleCollected[person.id] = Date.now();
  savePeople();
  showToast(`Samlet: ${person.name} ✅`);

  // Merke-poeng for person (knyttet til stedets kategori hvis vi har place)
  const place = placeForContext || PLACES.find(pl=>pl.id === person.placeId);
  const badgeId = person.quiz?.award?.badgeId || (place ? badgeIdForCategory(place.category) : 'kunnskap');
  awardBadgePoints(badgeId, 1);
  renderGallery();
}

// Radius-sjekk for sted
function canUnlock(place, pos){
  if (!pos) return false;
  const d = Math.round(haversine(pos, {lat:place.lat, lon:place.lon}));
  const rEff = place.r || 120;
  return d <= rEff;
}

// Kartmodus / auto-follow
function setMapMode(on){
  isMapMode = !!on;
  document.body.classList.toggle('map-only', isMapMode);
  el.fabMap.textContent = isMapMode ? '✕' : '🗺️';
  if (isMapMode){
    el.centerBtn.hidden = false;
  } else {
    el.centerBtn.hidden = true;
    setAutoFollow(false);
    closeInfoCard();
  }
}
function setAutoFollow(on){
  autoFollow = !!on;
  el.centerBtn.classList.toggle('active', autoFollow);
  if (autoFollow && currentPos) updateUserOnMap(currentPos);
}

// Geolokasjon
function startGeolocation(){
  if (!navigator.geolocation){
    el.status.textContent = 'Geolokasjon støttes ikke.';
    renderNearby(null);
    return;
  }
  el.status.textContent = 'Henter posisjon…';
  navigator.geolocation.watchPosition(g=>{
    currentPos = { lat:g.coords.latitude, lon:g.coords.longitude };
    el.status.textContent = 'Posisjon funnet.';
    updateUserOnMap(currentPos);
    renderNearby(currentPos);
  }, _=>{
    el.status.textContent = 'Kunne ikke hente posisjon.';
    renderNearby(null);
  }, { enableHighAccuracy:true, timeout:15000, maximumAge:5000 });
}

// “Se flere i nærheten” sheet
function openNearbySheet(){ openDialog(el.sheet); el.nearbyMore.setAttribute('aria-expanded','true'); }
function closeNearbySheet(){ closeDialog(el.sheet); el.nearbyMore.setAttribute('aria-expanded','false'); }
el.nearbyMore?.addEventListener('click', openNearbySheet);
el.sheetClose?.addEventListener('click', closeNearbySheet);

// Info-kort knapper
el.infoUnlock?.addEventListener('click', ()=>{
  if (!lastClickedPlace) return;
  if (el.test?.checked || canUnlock(lastClickedPlace, currentPos)){
    awardBadge(lastClickedPlace);
    closeInfoCard();
  } else {
    const d = Math.round(haversine(currentPos, {lat:lastClickedPlace.lat, lon:lastClickedPlace.lon}));
    const r = lastClickedPlace.r || 120;
    showToast(`Du er ${d} m unna (trenger ≤ ${r} m)`);
  }
});
el.infoMore?.addEventListener('click', ()=>{
  if (!lastClickedPlace) return;
  alert(`${lastClickedPlace.name}\n\n${lastClickedPlace.desc||''}`);
});

// Init
function init(){
  initMap();
  renderCollection();
  renderBadges();
  renderGallery();
  startGeolocation();

  el.fabMap?.addEventListener('click', ()=> setMapMode(!isMapMode));
  el.centerBtn?.addEventListener('click', ()=> setAutoFollow(!autoFollow));

  el.test?.addEventListener('change', e=>{
    if (e.target.checked){
      currentPos = { lat: START_POS.lat, lon: START_POS.lon };
      el.status.textContent = 'Testmodus: Oslo S';
      updateUserOnMap(currentPos);
      renderNearby(currentPos);
      showToast('Testmodus PÅ');
    } else {
      showToast('Testmodus AV');
    }
  });
}
