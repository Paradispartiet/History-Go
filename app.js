// ==============================
// History Go – app.js
// ==============================

const NEARBY_LIMIT = 2;
const START_POS = { lat:59.9139, lon:10.7522, zoom:13 };

let PLACES = [];
let PEOPLE = [];

Promise.all([
  fetch('places.json').then(r=>r.json()),
  fetch('people.json').then(r=>r.json()).catch(()=>[])
]).then(([places, people])=>{
  PLACES = places || [];
  PEOPLE = people || [];
  init();
});

// --- State (LS) ---
const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const diplomas        = JSON.parse(localStorage.getItem("diplomas_by_category") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");

function saveVisited(){ localStorage.setItem("visited_places", JSON.stringify(visited)); renderCollection(); }
function saveDiplomas(){ localStorage.setItem("diplomas_by_category", JSON.stringify(diplomas)); }
function savePeople(){   localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); }

// --- DOM refs ---
const el = {
  map:        document.getElementById('map'),
  mapExit:    document.getElementById('mapExit'),
  toggleMap:  document.getElementById('toggleMap'),
  infoCard:   document.getElementById('infoCard'),
  icTitle:    document.getElementById('icTitle'),
  icMeta:     document.getElementById('icMeta'),
  icDesc:     document.getElementById('icDesc'),
  icMore:     document.getElementById('icMore'),
  infoClose:  document.getElementById('infoClose'),

  status:     document.getElementById('status'),
  list:       document.getElementById('list'),
  collection: document.getElementById('collection'),
  moreCollection: document.getElementById('moreCollection'),
  count:      document.getElementById('count'),
  diplomas:   document.getElementById('diplomas'),
  gallery:    document.getElementById('gallery'),
  toast:      document.getElementById('toast'),
  test:       document.getElementById('testToggle'),
};

const DIPLOMA_THRESHOLDS = { bronse:5, sølv:8, gull:12 };

// --- Kart (Leaflet) ---
let MAP, markersLayer, userMarker;

function initMap(){
  MAP = L.map('map', { zoomControl:false, attributionControl:false })
          .setView([START_POS.lat, START_POS.lon], START_POS.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom:19, attribution:'© OpenStreetMap, © CARTO'
  }).addTo(MAP);

  markersLayer = L.layerGroup().addTo(MAP);
  drawMarkers();
}

function drawMarkers(){
  markersLayer.clearLayers();
  PLACES.forEach(p=>{
    const color = catColor(p.category);
    const html = `
      <div class="hitbox-36">
        <div class="hit-dot" style="background:${color}"></div>
      </div>`;
    const icon = L.divIcon({ html, className:'', iconSize:[36,36], iconAnchor:[18,18] });
    const m = L.marker([p.lat, p.lon], { icon }).addTo(markersLayer);
    m.on('click', ()=> showInfoCard(p));
  });
}

function setUser(lat, lon){
  if (!MAP) return;
  if (!userMarker){
    const icon = L.divIcon({ html:'<div class="hitbox-36"><div class="hit-dot" style="background:#00e676"></div></div>', className:'', iconSize:[36,36], iconAnchor:[18,18] });
    userMarker = L.marker([lat,lon], {icon}).addTo(MAP);
  } else {
    userMarker.setLatLng([lat,lon]);
  }
}

// --- Helpers ---
function catColor(cat){
  const c=(cat||'').toLowerCase();
  if (c.includes('kultur')) return '#e63946';
  if (c.includes('severd')) return '#ffb703';
  if (c.includes('sport')||c.includes('natur')) return '#2a9d8f';
  return '#1976d2';
}
function haversine(a,b){
  const R=6371e3,toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function fmtDist(m){ return m<1000 ? `${Math.round(m)} m unna` : `${(m/1000).toFixed(1)} km unna`; }
function showToast(msg='OK'){ el.toast.textContent=msg; el.toast.style.display='block'; setTimeout(()=>el.toast.style.display='none',1400); }

// --- Info-kort ---
let currentInfo = null;
function showInfoCard(place){
  currentInfo = place;
  el.icTitle.textContent = place.name;
  el.icMeta.textContent  = `${place.category||''} • Oslo`;
  el.icDesc.textContent  = place.desc || '';
  el.icMore.onclick = () => {
    if (place.url) window.open(place.url, '_blank');
    else showToast('Ingen lenke tilgjengelig');
  };
  el.infoCard.setAttribute('aria-hidden','false');
  if (MAP) MAP.flyTo([place.lat, place.lon], Math.max(MAP.getZoom(), 15));
}
function hideInfoCard(){ el.infoCard.setAttribute('aria-hidden','true'); }

// --- Renderere ---
function renderNearby(pos){
  const sorted = PLACES.map(p=>{
    const d = pos ? Math.round(haversine(pos,{lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));

  const subset = sorted.slice(0, NEARBY_LIMIT);

  el.list.innerHTML = subset.map(p=>`
    <article class="card" data-id="${p.id}">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||''} • Oslo</div>
      <div class="desc">${p.desc||''}</div>
      <div class="dist">${p.d==null?'':fmtDist(p.d)}</div>
    </article>
  `).join('');

  // Kort klikk → kart + info
  [...el.list.querySelectorAll('.card')].forEach(card=>{
    card.addEventListener('click', ()=>{
      const p = PLACES.find(x=>x.id===card.dataset.id);
      if (!p) return;
      enterMapMode();
      showInfoCard(p);
    });
  });
}

function renderCollection(){
  const items = PLACES.filter(p=>visited[p.id]);
  const total = items.length;
  el.count.textContent = total;

  const show = items.slice(0,4);
  el.collection.innerHTML = show.map(p=>{
    const mild = catColor(p.category);
    const fg = mild==='#ffb703' ? '#111' : '#fff';
    return `<span class="badge" data-id="${p.id}" style="background:${mild};color:${fg}">${p.name}</span>`;
  }).join('');

  // badge click -> map + info
  [...el.collection.querySelectorAll('.badge')].forEach(b=>{
    b.addEventListener('click', ()=>{
      const p = PLACES.find(x=>x.id===b.dataset.id);
      if (!p) return;
      enterMapMode(); showInfoCard(p);
    });
  });

  const rest = total - show.length;
  if (rest > 0){
    el.moreCollection.style.display='inline-block';
    el.moreCollection.textContent = `+${rest} flere`;
    el.moreCollection.onclick = ()=>{
      // ekspander
      el.collection.innerHTML = items.map(p=>{
        const mild = catColor(p.category);
        const fg = mild==='#ffb703' ? '#111' : '#fff';
        return `<span class="badge" data-id="${p.id}" style="background:${mild};color:${fg}">${p.name}</span>`;
      }).join('');
      el.moreCollection.style.display='none';
      [...el.collection.querySelectorAll('.badge')].forEach(b=>{
        b.addEventListener('click', ()=>{
          const p = PLACES.find(x=>x.id===b.dataset.id);
          if (!p) return;
          enterMapMode(); showInfoCard(p);
        });
      });
    };
  } else {
    el.moreCollection.style.display='none';
  }
}

function countVisitedByCategory(){
  const counts={};
  for (const p of PLACES) if (visited[p.id]) counts[p.category]=(counts[p.category]||0)+1;
  return counts;
}

function renderDiplomas(){
  const counts = countVisitedByCategory();
  const cats = [...new Set(PLACES.map(p=>p.category))];
  el.diplomas.innerHTML = cats.map(cat=>{
    const n = counts[cat]||0;
    const tillBronse = Math.max(0, DIPLOMA_THRESHOLDS.bronse - n);
    const pct = Math.min(1, n / DIPLOMA_THRESHOLDS.bronse);
    const cls = n>=DIPLOMA_THRESHOLDS.gull?'gull': n>=DIPLOMA_THRESHOLDS.sølv?'sølv':'bronse';
    return `
      <div class="diploma ${cls}">
        <div class="name">${cat}</div>
        <div class="stripe"></div>
        <div class="meta">Progresjon: ${n}/${DIPLOMA_THRESHOLDS.bronse}</div>
        <div class="bar"><span style="width:${pct*100}%"></span></div>
        <div class="desc">→ ${tillBronse} til bronse</div>
      </div>`;
  }).join('');
}

function renderGallery(){
  const got = PEOPLE.filter(p=>peopleCollected[p.id]);
  el.gallery.innerHTML = got.length
    ? got.map(p=>`
        <article class="person-card">
          <div class="avatar">${(p.initials||p.name?.slice(0,2)||'??').toUpperCase()}</div>
          <div style="flex:1">
            <div class="name">${p.name}</div>
            <div class="meta">${p.desc || p.sub || ''}</div>
          </div>
        </article>
      `).join('')
    : `<div class="muted">Samle personer ved events og høytider (f.eks. Julenissen i desember).</div>`;
}

// --- Seksjons-titler → scroll ---
function wireSectionTitles(){
  document.querySelectorAll('.title[data-target]').forEach(elm=>{
    elm.addEventListener('click', ()=>{
      const id = elm.getAttribute('data-target');
      document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'});
    });
  });
}

// --- Kartmodus toggle ---
function enterMapMode(){
  document.body.classList.add('map-only');
  if (el.toggleMap) el.toggleMap.textContent = 'Tilbake';
}
function exitMapMode(){
  document.body.classList.remove('map-only');
  hideInfoCard();
  if (el.toggleMap) el.toggleMap.textContent = 'Se kart';
}

// --- Geolokasjon ---
let currentPos=null;
function requestLocation(){
  if (!navigator.geolocation){
    el.status.textContent = 'Geolokasjon støttes ikke.';
    renderNearby(null); return;
  }
  el.status.textContent = 'Henter posisjon…';
  navigator.geolocation.getCurrentPosition(g=>{
    currentPos = {lat:g.coords.latitude, lon:g.coords.longitude};
    el.status.textContent = 'Posisjon funnet.';
    setUser(currentPos.lat, currentPos.lon);
    renderNearby(currentPos);
  }, _=>{
    el.status.textContent = 'Kunne ikke hente posisjon.';
    renderNearby(null);
  }, {enableHighAccuracy:true, timeout:8000, maximumAge:10000});
}

// --- Init ---
function init(){
  initMap();
  wireSectionTitles();
  renderCollection();
  renderDiplomas();
  renderGallery();
  requestLocation();

  // Toggle knapper
  el.toggleMap?.addEventListener('click', ()=>{
    if (document.body.classList.contains('map-only')) exitMapMode(); else enterMapMode();
  });
  el.mapExit?.addEventListener('click', exitMapMode);
  el.infoClose?.addEventListener('click', hideInfoCard);

  // Testmodus
  el.test?.addEventListener('change', (e)=>{
    if (e.target.checked){
      currentPos = { lat:START_POS.lat, lon:START_POS.lon };
      setUser(currentPos.lat, currentPos.lon);
      renderNearby(currentPos);
      showToast('Testmodus PÅ');
    } else {
      showToast('Testmodus AV');
      requestLocation();
    }
  });
}
