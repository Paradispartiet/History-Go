// ==============================
// History Go – app.js (alt i ett)
// - Kart i bakgrunnen (Leaflet) + "Se kart" fullskjerm-modus
// - Maks 2 steder i "Nærmest nå"
// - SVG-ikoner for kategorier/diplomer/personpills
// - Samling, Diplomer, Galleri
// - Testmodus-knapp (Oslo sentrum)
// ==============================

// ---- Konstanter ----
const NEARBY_LIMIT = 2;
const START_POS = { lat: 59.9139, lon: 10.7522, zoom: 13 }; // Oslo sentrum
const DIPLOMA_THRESHOLDS = { bronse: 5, sølv: 8, gull: 12 };

// ---- Data ----
let PLACES = [];
let PEOPLE = [];

// ---- LocalStorage state ----
const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const diplomas        = JSON.parse(localStorage.getItem("diplomas_by_category") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");

function saveVisited(){  localStorage.setItem("visited_places", JSON.stringify(visited));  renderCollection(); }
function saveDiplomas(){ localStorage.setItem("diplomas_by_category", JSON.stringify(diplomas)); }
function savePeople(){   localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); }

// ---- DOM ----
const el = {
  map:        document.getElementById('map'),
  status:     document.getElementById('status'),
  list:       document.getElementById('list'),
  collection: document.getElementById('collection'),
  count:      document.getElementById('count'),
  diplomas:   document.getElementById('diplomas'),
  gallery:    document.getElementById('gallery'),
  toast:      document.getElementById('toast'),
  test:       document.getElementById('testToggle'),
  btnMap:     document.getElementById('btnMap'),
  mapExit:    document.getElementById('mapExit'),
  mapLegend:  document.getElementById('mapLegend'),
  header:     document.querySelector('header'),
  body:       document.body
};

// ---- Hjelpere (ikoner/farger/diplom) ----
function svgIdForCategory(cat){
  const k=(cat||'').toLowerCase();
  if (k.includes('kultur')) return 'ico-theatre';
  if (k.includes('severd')) return 'ico-camera';
  if (k.includes('sport'))  return 'ico-ball';
  if (k.includes('natur'))  return 'ico-tree';
  return 'ico-castle';
}
function colorForCategory(cat){
  const k=(cat||'').toLowerCase();
  if (k.includes('kultur')) return '#e63946';
  if (k.includes('severd')) return '#ffb703';
  if (k.includes('sport')||k.includes('natur')) return '#2a9d8f';
  return '#1976d2';
}
function medalIdForTier(t){
  return t==='gull' ? 'ico-medal-gold'
       : t==='sølv' ? 'ico-medal-silver'
       : t==='bronse' ? 'ico-medal-bronze'
       : 'ico-trophy';
}
const tierRank = t => ({ bronse:1, sølv:2, gull:3 }[t] || 0);
const tierFor  = n => (n>=DIPLOMA_THRESHOLDS.gull?'gull' : n>=DIPLOMA_THRESHOLDS.sølv?'sølv' : n>=DIPLOMA_THRESHOLDS.bronse?'bronse' : null);

// ---- Hjelpere (annet) ----
function haversine(a,b){
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function showToast(msg='OK'){
  if(!el.toast) return;
  el.toast.textContent = msg;
  el.toast.style.display='block';
  setTimeout(()=> el.toast.style.display='none', 1400);
}
function countVisitedByCategory(){
  const counts = {};
  for (const p of PLACES) if (visited[p.id]) counts[p.category] = (counts[p.category]||0)+1;
  return counts;
}

// ---- Leaflet-kart ----
let MAP, userMarker;

function initMap() {
  MAP = L.map('map', { zoomControl:false, attributionControl:false })
          .setView([START_POS.lat, START_POS.lon], START_POS.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap, &copy; CARTO', maxZoom: 19
  }).addTo(MAP);

  // Markører for steder
  PLACES.forEach(p=>{
    L.circleMarker([p.lat, p.lon], {
      radius:7, weight:2, color:'#111', fillColor:colorForCategory(p.category), fillOpacity:.9
    })
    .addTo(MAP)
    .bindPopup(`
      <div style="min-width:220px">
        <div style="display:flex;align-items:center;gap:8px;font-weight:900">
          <svg class="ico" style="color:${colorForCategory(p.category)}"><use href="#${svgIdForCategory(p.category)}"/></svg>
          ${p.name}
        </div>
        <div style="opacity:.8;margin:4px 0">${p.category||''}</div>
        <div style="line-height:1.35">${p.desc||''}</div>
      </div>
    `);
  });

  buildLegend();
}

function setUser(lat, lon){
  if (!MAP) return;
  if (!userMarker) {
    userMarker = L.circleMarker([lat, lon], {
      radius:8, weight:2, color:'#fff', fillColor:'#1976d2', fillOpacity:1
    }).addTo(MAP).bindPopup('Du er her');
  } else {
    userMarker.setLatLng([lat, lon]);
  }
}

function buildLegend(){
  // Legg til legend nederst hvis den ikke finnes
  if (!el.mapLegend){
    const div = document.createElement('div');
    div.id = 'mapLegend';
    div.className = 'map-legend';
    el.body.appendChild(div);
    el.mapLegend = div;
  }
  el.mapLegend.innerHTML = `
    <div class="item"><svg class="ico" style="color:#1976d2"><use href="#ico-castle"/></svg>Historie</div>
    <div class="item"><svg class="ico" style="color:#e63946"><use href="#ico-theatre"/></svg>Kultur</div>
    <div class="item"><svg class="ico" style="color:#2a9d8f"><use href="#ico-ball"/></svg>Sport</div>
    <div class="item"><svg class="ico" style="color:#ffb703"><use href="#ico-camera"/></svg>Severd.</div>
    <div class="item"><svg class="ico" style="color:#2a9d8f"><use href="#ico-tree"/></svg>Natur</div>
  `;
  el.mapLegend.style.display = 'flex';
}

// ---- Kartmodus (Se kart / lukk) ----
function ensureMapButtons(){
  // Se kart-knapp i header
  if (!el.btnMap){
    const btn = document.createElement('button');
    btn.id = 'btnMap';
    btn.className = 'link-btn';
    btn.textContent = 'Se kart';
    (el.header || document.body).appendChild(btn);
    el.btnMap = btn;
  }
  // Lukk (×) knapp over kart
  if (!el.mapExit){
    const x = document.createElement('button');
    x.id = 'mapExit';
    x.className = 'map-exit';
    x.setAttribute('aria-label','Lukk kart');
    x.textContent = '×';
    document.body.appendChild(x);
    el.mapExit = x;
  }
}
function openMap(){
  document.body.classList.add('map-only');
  setTimeout(()=> { if (MAP) MAP.invalidateSize(); }, 60);
}
function closeMap(){
  document.body.classList.remove('map-only');
  setTimeout(()=> { if (MAP) MAP.invalidateSize(); }, 60);
}

// ---- Render ----
function renderNearby(pos){
  const withDist = PLACES.map(p=>{
    const d = pos ? Math.round(haversine(pos, {lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12)).slice(0, NEARBY_LIMIT);

  el.list.innerHTML = withDist.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">
        <svg class="ico" style="color:${colorForCategory(p.category)}"><use href="#${svgIdForCategory(p.category)}"/></svg>
        ${p.category||''} • Oslo
      </div>
      <p class="desc">${p.desc||''}</p>
      <div class="dist">
        ${p.d==null ? '' : (p.d<1000 ? `${p.d} m unna` : `${(p.d/1000).toFixed(1)} km unna`)}
      </div>
    </article>
  `).join('');
}

function renderCollection(){
  const items = PLACES.filter(p=>visited[p.id]);
  el.collection.innerHTML = items.length
    ? items.map(p=>`
      <span class="badge" style="background:${colorForCategory(p.category)};${colorForCategory(p.category)==='#ffb703'?'color:#111;':''}">
        <svg class="ico"><use href="#${svgIdForCategory(p.category)}"/></svg>
        ${p.name}
      </span>`).join('')
    : `<div class="muted">Besøk et sted for å låse opp ditt første merke.</div>`;
  el.count.textContent = items.length;
}

function renderDiplomas(){
  const counts = countVisitedByCategory();
  const cats = [...new Set(PLACES.map(p=>p.category))];

  el.diplomas.innerHTML = cats.map(cat=>{
    const n = counts[cat]||0;
    const t = tierFor(n);
    const next =
      n < DIPLOMA_THRESHOLDS.bronse ? `→ ${DIPLOMA_THRESHOLDS.bronse-n} til bronse` :
      n < DIPLOMA_THRESHOLDS.sølv   ? `→ ${DIPLOMA_THRESHOLDS.sølv-n} til sølv`   :
      n < DIPLOMA_THRESHOLDS.gull   ? `→ ${DIPLOMA_THRESHOLDS.gull-n} til gull`   : 'Maks!';
    const medalId = t ? medalIdForTier(t) : 'ico-trophy';
    return `
      <div class="diploma${t?` ${t}`:''}">
        <svg class="ico"><use href="#${medalId}"/></svg>
        <div class="name">${cat}</div>
        <div class="meta">Fullfør for å låse opp nivåer</div>
        <p class="desc">${next}</p>
      </div>`;
  }).join('');
}

function renderGallery(){
  if (!el.gallery) return;
  const got = PEOPLE.filter(p=>peopleCollected[p.id]);
  if (!got.length){
    el.gallery.innerHTML = `<div class="muted">Samle personer ved events og høytider (f.eks. Julenissen i desember).</div>`;
    return;
  }
  el.gallery.innerHTML = got.map(p=>{
    const pills = (p.pills||[]).map(x=>{
      const k=(x||'').toLowerCase();
      const id = k==='person' ? 'ico-user'
              : k==='quiz'   ? 'ico-quiz'
              : (k==='nær'||k==='naer'||k==='near') ? 'ico-near'
              : k==='snart'  ? 'ico-soon' : 'ico-pin';
      return `<span><svg class="ico"><use href="#${id}"/></svg>${x}</span>`;
    }).join('');
    return `
      <article class="person-card">
        <div class="avatar">${(p.initials||p.name?.slice(0,2)||'??').toUpperCase()}</div>
        <div class="info">
          <div class="name">${p.name}</div>
          <div class="meta">${p.sub||p.desc||''}</div>
          ${pills? `<div class="iconline">${pills}</div>`:''}
        </div>
        <button class="person-btn">Samlet</button>
      </article>`;
  }).join('');
}

// ---- Utdeling (kan trigges fra test/utvidelse) ----
function awardBadge(place){
  if (visited[place.id]) return;
  visited[place.id] = true; saveVisited();
  showToast(`Låst opp: ${place.name} ✅`);

  const catCounts = countVisitedByCategory();
  const newTier = tierFor(catCounts[place.category]||0);
  const oldTier = diplomas[place.category] || null;
  if (newTier && tierRank(newTier) > tierRank(oldTier)){
    diplomas[place.category] = newTier; saveDiplomas();
    showToast(`${newTier.toUpperCase()} i ${place.category}!`);
    renderDiplomas();
  }
}

// ---- Geolokasjon ----
let currentPos = null;

function requestLocation(){
  if (!navigator.geolocation){
    el.status && (el.status.textContent = 'Geolokasjon støttes ikke.');
    renderNearby(null);
    return;
  }
  el.status && (el.status.textContent = 'Henter posisjon…');
  navigator.geolocation.getCurrentPosition(g=>{
    currentPos = { lat:g.coords.latitude, lon:g.coords.longitude };
    el.status && (el.status.textContent = 'Posisjon funnet.');
    setUser(currentPos.lat, currentPos.lon);
    renderNearby(currentPos);
  }, _=>{
    el.status && (el.status.textContent = 'Kunne ikke hente posisjon.');
    renderNearby(null);
  }, { enableHighAccuracy:true, timeout:8000, maximumAge:10000 });
}

// ---- Init ----
function init(){
  ensureMapButtons();          // lag Se kart / × hvis mangler
  initMap();
  renderCollection();
  renderDiplomas();
  renderGallery();
  requestLocation();

  // Testmodus
  el.test?.addEventListener('change', e=>{
    if (e.target.checked){
      currentPos = { lat: START_POS.lat, lon: START_POS.lon };
      el.status && (el.status.textContent = 'Testmodus: Oslo sentrum');
      setUser(currentPos.lat, currentPos.lon);
      renderNearby(currentPos);
      showToast('Testmodus PÅ');
    } else {
      showToast('Testmodus AV');
      requestLocation();
    }
  });

  // Kart-knapper
  el.btnMap?.addEventListener('click', openMap);
  el.mapExit?.addEventListener('click', closeMap);
  document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeMap(); });
}

// ---- Last data og start ----
Promise.all([
  fetch('places.json').then(r => r.json()),
  fetch('people.json').then(r => r.json()).catch(() => [])
]).then(([places, people]) => {
  PLACES = places || [];
  PEOPLE = people || [];
  init();
});
