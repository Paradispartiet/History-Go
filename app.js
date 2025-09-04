// ==============================
// History Go – app.js (stabil)
// - Kart bak (Leaflet), mild blur i CSS
// - Kun 2 steder i "nærmest nå"
// - Enkel header m/ testmodus
// - Self-check + datasjekk + cache-busting ferdig
// ==============================

const NEARBY_LIMIT = 2;
const START_POS = { lat: 59.9139, lon: 10.7522, zoom: 13 };

// ---- Self-check (fanger manglende IDer) ----
(function selfCheck(){
  const need = ["map","toast","testToggle","status","list","collection","count","diplomas","gallery"];
  const miss = need.filter(id => !document.getElementById(id));
  if (miss.length) {
    const box = document.createElement('div');
    box.style.cssText = "position:fixed;left:8px;bottom:8px;background:#e63946;color:#fff;padding:8px 10px;border-radius:8px;z-index:9999;font:12px/1.2 system-ui";
    box.textContent = "Mangler elementer: " + miss.join(", ");
    document.body.appendChild(box);
    console.warn("Mangler DOM-noder:", miss);
  }
})();

// ---- Enkle validerere for data ----
function validatePlaces(arr){
  if (!Array.isArray(arr)) return [];
  return arr.filter(p =>
    p && p.id && p.name && typeof p.lat === "number" && typeof p.lon === "number"
  );
}
function validatePeople(arr){ return Array.isArray(arr) ? arr : []; }

// ---- Data ----
let PLACES = [];
let PEOPLE = [];

Promise.all([
  fetch('places.json').then(r => r.json()).then(validatePlaces),
  fetch('people.json').then(r => r.json()).then(validatePeople).catch(() => [])
]).then(([places, people]) => {
  PLACES = places || [];
  PEOPLE = people || [];
  init();
});

// ---- LocalStorage state ----
const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const diplomas        = JSON.parse(localStorage.getItem("diplomas_by_category") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");

const saveVisited  = () => localStorage.setItem("visited_places", JSON.stringify(visited));
const saveDiplomas = () => localStorage.setItem("diplomas_by_category", JSON.stringify(diplomas));
const savePeople   = () => localStorage.setItem("people_collected", JSON.stringify(peopleCollected));

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
  test:       document.getElementById('testToggle')
};

// ---- Diplomer ----
const DIP = { bronse:5, sølv:8, gull:12 };
const tierRank = t => ({bronse:1,sølv:2,gull:3}[t]||0);
const tierFor  = n => (n>=DIP.gull?'gull': n>=DIP.sølv?'sølv': n>=DIP.bronse?'bronse': null);
const tierEmoji= t => t==='gull'?'🥇':t==='sølv'?'🥈':t==='bronse'?'🥉':'';

// ---- Kart (Leaflet) ----
let MAP, userMarker;
function initMap(){
  MAP = L.map('map',{zoomControl:false,attributionControl:false})
          .setView([START_POS.lat, START_POS.lon], START_POS.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(MAP);

  PLACES.forEach(p=>{
    L.circleMarker([p.lat,p.lon], {
      radius:7, weight:2, color:'#111', fillColor:pickColor(p.category), fillOpacity:.9
    }).addTo(MAP).bindPopup(`<strong>${p.name}</strong><br>${p.category||''}`);
  });
}
function setUser(lat,lon){
  if(!MAP) return;
  if(!userMarker){
    userMarker = L.circleMarker([lat,lon], {radius:8,weight:2,color:'#fff',fillColor:'#1976d2',fillOpacity:1})
      .addTo(MAP).bindPopup('Du er her');
  } else userMarker.setLatLng([lat,lon]);
}

// ---- Hjelpere ----
function pickColor(cat){
  const c=(cat||'').toLowerCase();
  if(c.includes('kultur')) return '#e63946';
  if(c.includes('severd')) return '#ffb703';
  if(c.includes('sport')||c.includes('natur')) return '#2a9d8f';
  return '#1976d2';
}
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
  setTimeout(()=> el.toast.style.display='none', 1200);
}
function countVisitedByCategory(){
  const m={}; for(const p of PLACES) if(visited[p.id]) m[p.category]=(m[p.category]||0)+1; return m;
}

// ---- Render ----
function renderNearby(pos){
  const arr = PLACES.map(p=>{
    const d = pos ? Math.round(haversine(pos,{lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12)).slice(0, NEARBY_LIMIT);

  el.list.innerHTML = arr.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||''} • Oslo</div>
      <p class="desc">${p.desc||''}</p>
      <div class="dist">${p.d==null?'': (p.d<1000?`${p.d} m unna`:`${(p.d/1000).toFixed(1)} km unna`)}</div>
    </article>
  `).join('');
}
function renderCollection(){
  const items = PLACES.filter(p=>visited[p.id]);
  el.collection.innerHTML = items.length
    ? items.map(p=>{
        const c=pickColor(p.category); const style = c==='#ffb703'?'color:#111;':'';
        return `<span class="badge" style="background:${c};${style}">${p.name}</span>`;
      }).join('')
    : `<div class="muted">Besøk et sted for å låse opp ditt første merke.</div>`;
  el.count.textContent = items.length;
}
function renderDiplomas(){
  const counts=countVisitedByCategory();
  const cats=[...new Set(PLACES.map(p=>p.category))];
  el.diplomas.innerHTML = cats.map(cat=>{
    const n=counts[cat]||0, t=tierFor(n);
    const next = n<DIP.bronse?`→ ${DIP.bronse-n} til bronse` : n<DIP.sølv?`→ ${DIP.sølv-n} til sølv` : n<DIP.gull?`→ ${DIP.gull-n} til gull` : 'Maks!';
    const label = t?`<span class="tier ${t}">${tierEmoji(t)} ${t.toUpperCase()}</span>`:'';
    const cls = t?` ${t}`:'';
    return `<div class="diploma${cls}">
      <div class="name">${cat} ${label}</div>
      <div class="meta">Fullfør for å låse opp nivåer</div>
      <p class="desc">${next}</p>
    </div>`;
  }).join('');
}
function renderGallery(){
  const got = PEOPLE.filter(p=>peopleCollected[p.id]);
  el.gallery.innerHTML = got.length
    ? got.map(p=>`
      <article class="person-card">
        <div class="avatar">${(p.initials||p.name?.slice(0,2)||'??').toUpperCase()}</div>
        <div class="info">
          <div class="name">${p.name}</div>
          <div class="sub">${p.desc||p.sub||''}</div>
        </div>
        <button class="person-btn">Samlet</button>
      </article>`).join('')
    : `<div class="muted">Samle personer ved events og høytider (f.eks. Julenissen i desember).</div>`;
}

// ---- Geo ----
let currentPos=null;
function startGeo(){
  if(!navigator.geolocation){ el.status.textContent='Geolokasjon støttes ikke.'; renderNearby(null); return; }
  el.status.textContent='Henter posisjon…';
  navigator.geolocation.watchPosition(g=>{
    currentPos={lat:g.coords.latitude, lon:g.coords.longitude};
    el.status.textContent='Posisjon funnet.';
    setUser(currentPos.lat,currentPos.lon);
    renderNearby(currentPos);
  }, _=>{
    el.status.textContent='Kunne ikke hente posisjon.';
    renderNearby(null);
  }, { enableHighAccuracy:true, maximumAge:5000, timeout:15000 });
}

// ---- Init ----
function init(){
  initMap();
  renderCollection(); renderDiplomas(); renderGallery();
  startGeo();

  el.test?.addEventListener('change', e=>{
    if(e.target.checked){
      currentPos={lat:START_POS.lat, lon:START_POS.lon};
      el.status.textContent='Testmodus: Oslo sentrum';
      setUser(currentPos.lat,currentPos.lon);
      renderNearby(currentPos);
      showToast('Testmodus PÅ');
    } else {
      showToast('Testmodus AV');
      startGeo();
    }
  });
}
