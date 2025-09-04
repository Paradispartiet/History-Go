/* ===============================
   History Go – app.js (med rullgardin)
   Kart i bakgrunnen + seksjoner som kan åpnes/lukkes
   =============================== */

// -------- Data --------
let PLACES = [];
let PEOPLE = [];

Promise.all([
  fetch('places.json').then(r => r.json()),
  fetch('people.json').then(r => r.json()).catch(()=>[]) // valgfri
]).then(([places, people]) => {
  PLACES = places || [];
  PEOPLE = people || [];
  init();
});

// -------- DOM refs --------
const el = {
  map:       document.getElementById('map'),
  status:    document.getElementById('status'),
  list:      document.getElementById('list'),
  collection:document.getElementById('collection'),
  count:     document.getElementById('count'),
  diplomas:  document.getElementById('diplomas'),
  gallery:   document.getElementById('gallery'),
  toast:     document.getElementById('toast'),
  testToggle:document.getElementById('testToggle'),
};

// -------- Kart (Leaflet) --------
let MAP, userMarker;
function initMap(center=[59.9139,10.7522], zoom=13){
  MAP = L.map('map', { zoomControl:false, attributionControl:false })
         .setView(center, zoom);

  // Mørk bakgrunns-tiles (ser bra ut bak glass)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap, © CARTO'
  }).addTo(MAP);

  // Pins for steder (enkelt – farger per kategori)
  PLACES.forEach(p=>{
    L.circleMarker([p.lat, p.lon], {
      radius: 7,
      weight: 1,
      color: '#111',
      fillColor: pickColor(p.category),
      fillOpacity: 0.9
    }).addTo(MAP)
      .bindPopup(`<strong>${p.name}</strong><br>${p.category||''}`);
  });
}

function setUserMarker(lat, lon){
  if (!MAP) return;
  if (!userMarker){
    userMarker = L.circleMarker([lat,lon], {
      radius: 8, color: '#fff', weight: 2, fillColor: '#00e676', fillOpacity: 1
    }).addTo(MAP).bindPopup('Du er her');
  } else {
    userMarker.setLatLng([lat,lon]);
  }
}

// -------- Små verktøy --------
function pickColor(cat=''){
  const k = cat.toLowerCase();
  if (k.startsWith('hist')) return '#1976d2';
  if (k.startsWith('kul'))  return '#e63946';
  if (k.startsWith('sev'))  return '#ffb703';
  if (k.startsWith('spor') || k.startsWith('natur')) return '#2a9d8f';
  return '#6b7280';
}
function haversine(a,b){
  const toRad = d=>d*Math.PI/180, R=6371e3;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const s1=toRad(a.lat), s2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(s1)*Math.cos(s2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function fmtDist(m){
  if (m==null) return '–';
  return m<1000 ? `${Math.round(m)} m unna` : `${(m/1000).toFixed(1)} km unna`;
}
function showToast(msg='OK'){
  if(!el.toast) return;
  el.toast.textContent = msg;
  el.toast.style.display = 'block';
  setTimeout(()=> el.toast.style.display='none', 1500);
}

// -------- Renderere --------
let currentPos = null;

function renderNearby(){
  const data = (currentPos
    ? PLACES.map(p=>({...p, _d: Math.round(haversine(currentPos,{lat:p.lat,lon:p.lon}))}))
            .sort((a,b)=>(a._d??1e12)-(b._d??1e12))
    : PLACES.map(p=>({...p,_d:null}))
  );

  el.list.innerHTML = data.map(p=>`
    <div class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||''} • Oslo</div>
      <div class="desc">${p.desc||''}</div>
      <div class="dist">${fmtDist(p._d)}</div>
    </div>
  `).join('');
}

function renderCollection(){
  // Demo: vis alle som “samling”
  el.collection.innerHTML = PLACES.map(p=>`<span class="badge">${p.name}</span>`).join('');
  el.count.textContent = PLACES.length;
}

const DIPLOMA_THRESHOLDS = { bronse:5, sølv:8, gull:12 };
function renderDiplomas(){
  // Enkle demo-kort – bytt til ekte logikk ved behov
  el.diplomas.innerHTML = `
    <div class="diploma bronse">
      <div class="name">Oslo – Grunnpakke <span class="tier bronse">🥉 BRONSE</span></div>
      <div class="meta">Fullfør 5 steder</div>
      <p class="desc">De første fem stedene i sentrum er låst opp.</p>
    </div>
    <div class="diploma sølv">
      <div class="name">Kulturstien <span class="tier sølv">🥈 SØLV</span></div>
      <div class="meta">Fullfør 8 kultursteder</div>
      <p class="desc">Museer, bibliotek og scenehus.</p>
    </div>
    <div class="diploma gull">
      <div class="name">Historie-mester <span class="tier gull">🥇 GULL</span></div>
      <div class="meta">Fullfør 12 historiske steder</div>
      <p class="desc">Du kan byens tidslinjer.</p>
    </div>
  `;
}

function renderGallery(){
  if(!PEOPLE?.length){
    el.gallery.innerHTML = `<div class="muted">Ingen personer å vise ennå.</div>`;
    return;
  }
  el.gallery.innerHTML = PEOPLE.map(p=>{
    const initials = (p.initials || p.name?.slice(0,2) || '?').toUpperCase();
    return `
      <div class="person-card">
        <div class="avatar">${initials}</div>
        <div class="info">
          <div class="name">${p.name}</div>
          <div class="sub">${p.sub || ''}</div>
          <p class="desc">${p.desc || ''}</p>
          <div class="person-actions">
            ${(p.tags||[]).map(t=>`<span class="pill">${t}</span>`).join('')}
          </div>
        </div>
        <button class="person-btn">Gå til</button>
      </div>
    `;
  }).join('');
}

// -------- Rullgardin / Accordion --------
const ACCORDION_KEY = 'hg_open_sections_v1';

function getOpenState(){
  try { return JSON.parse(localStorage.getItem(ACCORDION_KEY)||'{}'); }
  catch { return {}; }
}
function setOpenState(s){
  try { localStorage.setItem(ACCORDION_KEY, JSON.stringify(s)); } catch {}
}
function setCollapsed(sectionEl, collapsed){
  sectionEl.classList.toggle('collapsed', collapsed);
}
function initAccordion(){
  // Standard: “Nærmest nå” åpen, andre lukket – les fra storage
  const state = getOpenState();
  const sections = document.querySelectorAll('main .section');
  sections.forEach((sec, idx)=>{
    const id = sec.querySelector('.title')?.dataset.view || `sec${idx}`;
    const collapsed = state[id] ?? (id==='nearby' ? false : true);
    setCollapsed(sec, collapsed);

    // Klikk på tittellinja = toggle
    const title = sec.querySelector('.title.view-toggle') || sec.querySelector('.title');
    if (title){
      title.addEventListener('click', ()=>{
        const nowCollapsed = !sec.classList.contains('collapsed'); // skal bli
        setCollapsed(sec, nowCollapsed);
        const s = getOpenState();
        s[id] = nowCollapsed;
        setOpenState(s);
      });
    }
  });
}

// -------- Geolokasjon / Testmodus --------
function requestLocation(){
  if (!navigator.geolocation){
    el.status.textContent = 'Geolokasjon støttes ikke.';
    renderNearby();
    return;
  }
  el.status.textContent = 'Henter posisjon…';
  navigator.geolocation.getCurrentPosition(pos=>{
    currentPos = { lat:pos.coords.latitude, lon:pos.coords.longitude };
    el.status.textContent = 'Posisjon funnet.';
    setUserMarker(currentPos.lat, currentPos.lon);
    renderNearby();
  }, err=>{
    el.status.textContent = 'Kunne ikke hente posisjon: ' + err.message;
    renderNearby();
  }, { enableHighAccuracy:true, timeout:10000, maximumAge:10000 });
}

function wireTestMode(){
  el.testToggle?.addEventListener('change', (e)=>{
    if (e.target.checked){
      currentPos = { lat:59.910, lon:10.752 }; // Oslo S-ish
      el.status.textContent = 'Testmodus: Oslo S';
      setUserMarker(currentPos.lat, currentPos.lon);
      MAP && MAP.setView([currentPos.lat,currentPos.lon], 14);
      renderNearby();
      showToast('Testmodus PÅ');
    } else {
      currentPos = null;
      showToast('Testmodus AV');
      requestLocation();
    }
  });
}

// -------- Init --------
function init(){
  initMap();
  renderCollection();
  renderDiplomas();
  renderGallery();
  renderNearby();
  initAccordion();
  wireTestMode();
  requestLocation();
  showToast('History Go klar ✅');
}
