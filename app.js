// ==============================
// History Go – app.js (enkelt + sheet-drag)
// ==============================

const NEARBY_LIMIT = 2;
const START_POS = { lat:59.9139, lon:10.7522, zoom:13 };

// Data
let PLACES = [], PEOPLE = [];

Promise.all([
  fetch('places.json').then(r=>r.json()),
  fetch('people.json').then(r=>r.json()).catch(()=>[])
]).then(([places, people])=>{
  PLACES = places || [];
  PEOPLE = people || [];
  init();
});

// LocalStorage
const visited  = JSON.parse(localStorage.getItem("visited_places") || "{}");
const diplomas = JSON.parse(localStorage.getItem("diplomas_by_category") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");

function saveVisited(){ localStorage.setItem("visited_places", JSON.stringify(visited)); renderCollection(); }
function saveDiplomas(){ localStorage.setItem("diplomas_by_category", JSON.stringify(diplomas)); }
function savePeople(){ localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); }

// DOM
const el = {
  map:document.getElementById('map'),
  status:document.getElementById('status'),
  list:document.getElementById('list'),
  collection:document.getElementById('collection'),
  count:document.getElementById('count'),
  diplomas:document.getElementById('diplomas'),
  gallery:document.getElementById('gallery'),
  toast:document.getElementById('toast'),
  test:document.getElementById('testToggle'),
  sheet:document.getElementById('sheet')
};

// Diplomer
const DIPLOMA_THRESHOLDS = { bronse:5, sølv:8, gull:12 };
const tierRank = t=>({bronse:1, sølv:2, gull:3}[t]||0);
const tierFor = n => n>=12?'gull' : n>=8?'sølv' : n>=5?'bronse' : null;
const tierEmoji = t=> t==='gull'?'🥇': t==='sølv'?'🥈': t==='bronse'?'🥉':'';

// Kart
let MAP, userMarker;
function initMap(){
  MAP = L.map('map', { zoomControl:false, attributionControl:false })
           .setView([START_POS.lat, START_POS.lon], START_POS.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
    attribution:'&copy; OpenStreetMap, &copy; CARTO', maxZoom:19
  }).addTo(MAP);

  // Lett effekt (ikke mørkt)
  el.map.style.filter = 'blur(2px) saturate(1.05) brightness(0.95)';
  el.map.style.opacity = '0.95';

  // Pins
  PLACES.forEach(p=>{
    L.circleMarker([p.lat,p.lon],{
      radius:7, weight:2, color:'#111', fillColor:pickColor(p.category), fillOpacity:.9
    }).addTo(MAP).bindPopup(`<strong>${p.name}</strong><br>${p.category||''}`);
  });
}
function setUser(lat,lon){
  if(!MAP) return;
  if(!userMarker){
    userMarker = L.circleMarker([lat,lon],{radius:8,weight:2,color:'#fff',fillColor:'#1976d2',fillOpacity:1})
      .addTo(MAP).bindPopup('Du er her');
  } else userMarker.setLatLng([lat,lon]);
}

// Utils
function pickColor(cat){
  const c=(cat||'').toLowerCase();
  if(c.includes('kultur')) return '#e63946';
  if(c.includes('severd')) return '#ffb703';
  if(c.includes('sport')||c.includes('natur')) return '#2a9d8f';
  return '#1976d2';
}
function haversine(a,b){
  const R=6371e3,toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function showToast(msg='OK'){
  if(!el.toast) return;
  el.toast.textContent=msg; el.toast.style.display='block';
  setTimeout(()=> el.toast.style.display='none', 1400);
}
function countVisitedByCategory(){
  const counts={}; for(const p of PLACES) if(visited[p.id]) counts[p.category]=(counts[p.category]||0)+1;
  return counts;
}

// Render
function renderNearby(pos){
  const withDist = PLACES.map(p=>{
    const d = pos ? Math.round(haversine(pos,{lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));

  const subset = withDist.slice(0, NEARBY_LIMIT);
  el.list.innerHTML = subset.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||''} • Oslo</div>
      <p class="desc">${p.desc||''}</p>
      <div class="dist">${p.d==null?'':(p.d<1000?`${p.d} m unna`:`${(p.d/1000).toFixed(1)} km unna`)}</div>
    </article>
  `).join('');
}
function renderCollection(){
  const items = PLACES.filter(p=>visited[p.id]);
  el.collection.innerHTML = items.length
    ? items.map(p=>`<span class="badge" style="background:${pickColor(p.category)};${pickColor(p.category)==='#ffb703'?'color:#111':''}">${p.name}</span>`).join('')
    : `<div class="muted">Besøk et sted for å låse opp ditt første merke.</div>`;
  el.count.textContent = items.length;
}
function renderDiplomas(){
  const counts = countVisitedByCategory();
  const cats=[...new Set(PLACES.map(p=>p.category))];
  el.diplomas.innerHTML = cats.map(cat=>{
    const n=counts[cat]||0, t=tierFor(n);
    const next = n<5?`→ ${5-n} til bronse` : n<8?`→ ${8-n} til sølv` : n<12?`→ ${12-n} til gull` : 'Maks!';
    const tLabel = t ? `<span class="tier ${t}">${tierEmoji(t)} ${t.toUpperCase()}</span>` : '';
    const tClass = t ? ` ${t}` : '';
    return `
      <div class="diploma${tClass}">
        <div class="name">${cat} ${tLabel}</div>
        <div class="meta">Fullfør for å låse opp nivåer</div>
        <p class="desc">${next}</p>
      </div>`;
  }).join('');
}
function renderGallery(){
  if(!el.gallery) return;
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
    : `<div class="muted">Samle personer ved events og høytider (f.eks. Julenissen i desember).</div>`;
}

// Nærhet/tildeling (valgfri auto i testmodus)
function awardBadge(place){
  if(visited[place.id]) return;
  visited[place.id]=true; saveVisited();
  showToast(`Låst opp: ${place.name} ✅`);
  const counts=countVisitedByCategory();
  const newTier=tierFor(counts[place.category]||0), old=diplomas[place.category]||null;
  if(newTier && tierRank(newTier)>tierRank(old)){
    diplomas[place.category]=newTier; saveDiplomas();
    showToast(`${tierEmoji(newTier)} ${place.category}: ${newTier.toUpperCase()}!`);
    renderDiplomas();
  }
}
function autoAwardNearby(pos){
  if(!el.test?.checked) return;
  for(const p of PLACES){
    const d=Math.round(haversine(pos,{lat:p.lat,lon:p.lon}));
    if(d<=Math.max(p.r||120,5000)) awardBadge(p);
  }
}

// Geolokasjon
let currentPos=null;
function requestLocation(){
  if(!navigator.geolocation){
    el.status.textContent='Geolokasjon støttes ikke.'; renderNearby(null); return;
  }
  el.status.textContent='Henter posisjon…';
  navigator.geolocation.getCurrentPosition(g=>{
    currentPos={lat:g.coords.latitude,lon:g.coords.longitude};
    el.status.textContent='Posisjon funnet.'; setUser(currentPos.lat,currentPos.lon);
    renderNearby(currentPos); autoAwardNearby(currentPos);
  }, _=>{
    el.status.textContent='Kunne ikke hente posisjon.'; renderNearby(null);
  }, {enableHighAccuracy:true, timeout:8000, maximumAge:10000});
}

// Bottom-sheet: dra for å åpne/lukke
(function enableSheetDrag(){
  const sheet = el.sheet; if(!sheet) return;
  const VH = window.innerHeight;
  const MIN = 0.22*VH;        // “peek”
  const MAX = 0.88*VH;        // fullt
  let current = 0.5*VH;       // start
  let startY=0, startH=0, dragging=false;

  sheet.style.maxHeight=`${MAX}px`;
  sheet.style.height=`${current}px`;

  const handle = sheet.querySelector('.handle') || sheet;

  function down(e){ dragging=true; startY=(e.touches?e.touches[0].clientY:e.clientY); startH=sheet.getBoundingClientRect().height; sheet.style.transition='none'; }
  function move(e){
    if(!dragging) return;
    const y=(e.touches?e.touches[0].clientY:e.clientY);
    let h = startH - (y - startY);
    h = Math.max(MIN, Math.min(MAX, h));
    current=h; sheet.style.height=`${current}px`;
  }
  function up(){
    if(!dragging) return; dragging=false; sheet.style.transition='height 160ms ease';
    const snap = (current < (MIN+(MAX-MIN)/2)) ? MAX : MIN;
    current=snap; sheet.style.height=`${current}px`;
  }

  handle.addEventListener('mousedown', down);
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
  handle.addEventListener('touchstart', down, {passive:true});
  window.addEventListener('touchmove', move, {passive:false});
  window.addEventListener('touchend', up);
})();

// Init
function init(){
  initMap();
  renderCollection(); renderDiplomas(); renderGallery();
  requestLocation();

  el.test?.addEventListener('change', e=>{
    if(e.target.checked){
      currentPos={lat:START_POS.lat,lon:START_POS.lon};
      el.status.textContent='Testmodus: Oslo sentrum';
      setUser(currentPos.lat,currentPos.lon);
      renderNearby(currentPos); showToast('Testmodus PÅ');
    }else{ showToast('Testmodus AV'); requestLocation(); }
  });
}
