// ==============================
// History Go – app.js
// Kart-modus, auto-follow, info-kort, "Se flere", milde farger, ikoner
// ==============================

// ---- Konstanter ----
const NEARBY_LIMIT = 2;
const START_POS = { lat: 59.9139, lon: 10.7522, zoom: 13 }; // Oslo sentrum
const DIPLOMA_THRESHOLDS = { bronse: 5, sølv: 8, gull: 12 };

// ---- Data ----
let PLACES = [];
let PEOPLE = [];

Promise.all([
  fetch('places.json').then(r => r.json()),
  fetch('people.json').then(r => r.json()).catch(() => [])
]).then(([places, people]) => {
  PLACES = places || [];
  PEOPLE = people || [];
  init();
});

// ---- LocalStorage ----
const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const diplomas        = JSON.parse(localStorage.getItem("diplomas_by_category") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");

function saveVisited(){  localStorage.setItem("visited_places", JSON.stringify(visited));  renderCollection(); }
function saveDiplomas(){ localStorage.setItem("diplomas_by_category", JSON.stringify(diplomas)); }
function savePeople(){   localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); }

// ---- DOM ----
const el = {
  map:        document.getElementById('map'),
  overlay:    document.getElementById('overlay'),
  status:     document.getElementById('status'),
  list:       document.getElementById('list'),
  collection: document.getElementById('collectionGrid'),
  count:      document.getElementById('count'),
  diplomas:   document.getElementById('diplomas'),
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
  infoClose:  document.getElementById('infoClose')
};

// ---- State ----
let map, placeLayer, peopleLayer, userMarker;
let isMapMode = false;
let autoFollow = false;
let currentPos = null;
let lastClickedPlace = null;

// ---- Utils ----
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
  return '#1976d2'; // historie/standard
}
const tierRank = t => ({ bronse:1, sølv:2, gull:3 }[t] || 0);
const tierFor  = n => (n>=DIPLOMA_THRESHOLDS.gull?'gull': n>=DIPLOMA_THRESHOLDS.sølv?'sølv': n>=DIPLOMA_THRESHOLDS.bronse?'bronse': null);
const tierEmoji= t => t==='gull'?'🥇':t==='sølv'?'🥈':t==='bronse'?'🥉':'';

// ---- Kart ----
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

  // Visuell liten prikk
  const mark = L.circleMarker([p.lat, p.lon], {
    radius:7, weight:2, color:'#111', fillColor:color, fillOpacity:.9
  }).addTo(placeLayer);

  // Usynlig stor hitbox
  const hit = L.circleMarker([p.lat, p.lon], {
    radius:20, weight:0, color:'transparent', fillColor:'transparent', fillOpacity:0, interactive:true
  }).addTo(placeLayer);

  const open = ()=> openInfoCard(p);
  mark.on('click', open);
  hit.on('click', open);
}

function drawPlaces(){
  placeLayer.clearLayers();
  PLACES.forEach(addPlaceMarker);
}

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

// ---- Info-kort ----
function openInfoCard(place){
  lastClickedPlace = place;
  el.infoIcon.textContent  = place.icon || '📍';
  el.infoTitle.textContent = place.name;
  el.infoMeta.textContent  = `${place.category} • radius ${place.r||120} m`;
  el.infoDesc.textContent  = place.desc || '';
  el.infoCard.hidden = false;
}
function closeInfoCard(){ el.infoCard.hidden = true; }

// ---- Nearby / Collection / Diplomas / Gallery ----
function renderNearby(pos){
  const withDist = PLACES.map(p=>{
    const d = pos ? Math.round(haversine(pos, {lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));

  // Kun 2 i panelet
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

  // Fyll sheet-lista med resten
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
  // Vis første 8 som chips
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
      // Enkel utvidelse: legg til resten én gang
      el.collection.insertAdjacentHTML('beforeend',
        items.slice(SHOW).map(p=>`<span class="badge">${p.icon||'📍'} ${p.name}</span>`).join('')
      );
      el.expandColl.hidden = true;
    };
  } else {
    el.expandColl.hidden = true;
  }
}

function countVisitedByCategory(){
  const counts = {};
  for (const p of PLACES) if (visited[p.id]) counts[p.category] = (counts[p.category]||0)+1;
  return counts;
}

function renderDiplomas(){
  const counts = countVisitedByCategory();
  const cats = [...new Set(PLACES.map(p=>p.category))];

  el.diplomas.innerHTML = cats.map(cat=>{
    const n = counts[cat]||0;
    const t = diplomas[cat] || null;
    const next =
      n < DIPLOMA_THRESHOLDS.bronse ? `→ ${DIPLOMA_THRESHOLDS.bronse-n} til bronse` :
      n < DIPLOMA_THRESHOLDS.sølv   ? `→ ${DIPLOMA_THRESHOLDS.sølv-n} til sølv`   :
      n < DIPLOMA_THRESHOLDS.gull   ? `→ ${DIPLOMA_THRESHOLDS.gull-n} til gull`   : 'Maks!';
    const tLabel = t ? `<span class="tier ${t}">${tierEmoji(t)} ${t.toUpperCase()}</span>` : '';
    const tClass = t ? ` ${t}` : '';
    const goal =
      n < DIPLOMA_THRESHOLDS.bronse ? DIPLOMA_THRESHOLDS.bronse :
      n < DIPLOMA_THRESHOLDS.sølv   ? DIPLOMA_THRESHOLDS.sølv   :
      n < DIPLOMA_THRESHOLDS.gull   ? DIPLOMA_THRESHOLDS.gull   : n;
    const pct = Math.max(0, Math.min(100, Math.round((n / goal) * 100)));

    return `
      <div class="diploma${tClass}">
        <div class="name">${cat} ${tLabel}</div>
        <div class="meta">${next}</div>
        <div class="progress"><span style="width:${pct}%;"></span></div>
      </div>`;
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

// ---- Nærhet / tildeling ----
function awardBadge(place){
  if (visited[place.id]) return;
  visited[place.id] = true; saveVisited();
  showToast(`Låst opp: ${place.icon||'📍'} ${place.name} ✅`);

  const counts = countVisitedByCategory();
  const newTier = tierFor(counts[place.category]||0);
  const oldTier = diplomas[place.category] || null;
  if (newTier && tierRank(newTier) > tierRank(oldTier)){
    diplomas[place.category] = newTier; saveDiplomas();
    showToast(`${tierEmoji(newTier)} ${place.category}: ${newTier.toUpperCase()}!`);
    renderDiplomas();
  }
}

function canUnlock(place, pos){
  if (!pos) return false;
  const d = Math.round(haversine(pos, {lat:place.lat, lon:place.lon}));
  const rEff = place.r || 120;
  return d <= rEff;
}

// ---- Kartmodus / Auto-follow ----
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

// ---- Geolokasjon ----
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

// ---- Info-kort handling ----
el.infoClose?.addEventListener('click', closeInfoCard);
el.infoMore?.addEventListener('click', ()=>{
  if (!lastClickedPlace) return;
  alert(`${lastClickedPlace.name}\n\n${lastClickedPlace.desc||''}`);
});
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

// ---- “Se flere i nærheten” sheet ----
function openNearbySheet(){
  try { el.sheet.showModal(); }
  catch { el.sheet.setAttribute('open',''); } // enkel fallback
}
function closeNearbySheet(){
  try { el.sheet.close(); }
  catch { el.sheet.removeAttribute('open'); }
}
el.nearbyMore?.addEventListener('click', ()=>{
  el.nearbyMore.setAttribute('aria-expanded','true');
  openNearbySheet();
});
el.sheetClose?.addEventListener('click', ()=>{
  el.nearbyMore.setAttribute('aria-expanded','false');
  closeNearbySheet();
});

// ---- Init ----
function init(){
  initMap();
  renderCollection();
  renderDiplomas();
  renderGallery();
  startGeolocation();

  // FAB & sentrer
  el.fabMap?.addEventListener('click', ()=> setMapMode(!isMapMode));
  el.centerBtn?.addEventListener('click', ()=> setAutoFollow(!autoFollow));

  // Testmodus
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
