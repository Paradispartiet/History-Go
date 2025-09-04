// ==============================
// History Go – app.js med kartmodus + historie-popups
// ==============================

const NEARBY_LIMIT = 2;
const START_POS = { lat: 59.9139, lon: 10.7522, zoom: 13 };

let PLACES = [];
let PEOPLE = [];

// Self-check for manglende IDs
(function selfCheck(){
  const need = ["map","toast","mapExit","mapToggle","testToggle","status","list","collection","count","diplomas","gallery"];
  const miss = need.filter(id => !document.getElementById(id));
  if (miss.length) console.warn("Mangler DOM-noder:", miss);
})();

// Last data
Promise.all([
  fetch('places.json').then(r => r.json()).catch(()=>[]),
  fetch('people.json').then(r => r.json()).catch(()=>[])
]).then(([places, people]) => {
  PLACES = Array.isArray(places) ? places : [];
  PEOPLE = Array.isArray(people) ? people : [];
  init();
});

// State (localStorage)
const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const diplomas        = JSON.parse(localStorage.getItem("diplomas_by_category") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");
const saveVisited = () => localStorage.setItem("visited_places", JSON.stringify(visited));
const saveDiplomas= () => localStorage.setItem("diplomas_by_category", JSON.stringify(diplomas));
const savePeople  = () => localStorage.setItem("people_collected", JSON.stringify(peopleCollected));

// DOM
const el = {
  map:        document.getElementById('map'),
  mapToggle:  document.getElementById('mapToggle'),
  mapExit:    document.getElementById('mapExit'),
  status:     document.getElementById('status'),
  list:       document.getElementById('list'),
  collection: document.getElementById('collection'),
  count:      document.getElementById('count'),
  diplomas:   document.getElementById('diplomas'),
  gallery:    document.getElementById('gallery'),
  toast:      document.getElementById('toast'),
  test:       document.getElementById('testToggle')
};

// Diplomer
const DIP = { bronse:5, sølv:8, gull:12 };
const tierRank = t => ({bronse:1,sølv:2,gull:3}[t]||0);
const tierFor  = n => (n>=DIP.gull?'gull': n>=DIP.sølv?'sølv': n>=DIP.bronse?'bronse': null);
const tierEmoji= t => t==='gull'?'🥇':t==='sølv'?'🥈':t==='bronse'?'🥉':'';

// Kart (Leaflet)
let MAP, userMarker;
function initMap(){
  MAP = L.map('map',{zoomControl:false,attributionControl:false})
          .setView([START_POS.lat, START_POS.lon], START_POS.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(MAP);

  // Marker + rik popup (title + category + history/desc)
  PLACES.forEach(p=>{
    const title = p.name || '';
    const cat   = p.category || '';
    const hist  = p.history || p.desc || '';

    const marker = L.circleMarker([p.lat,p.lon], {
      radius:7, weight:2, color:'#111',
      fillColor: pickColor(cat), fillOpacity:.95
    }).addTo(MAP);

    marker.bindPopup(`
      <div style="min-width:220px">
        <div style="font-weight:900;font-size:14px">${title}</div>
        <div style="opacity:.75;margin-bottom:6px">${cat}</div>
        <div style="line-height:1.35">${hist}</div>
      </div>
    `);
  });
}
function setUser(lat,lon){
  if(!MAP) return;
  if(!userMarker){
    userMarker = L.circleMarker([lat,lon], {radius:8, weight:2, color:'#fff', fillColor:'#1976d2', fillOpacity:1})
      .addTo(MAP).bindPopup('Du er her');
  } else {
    userMarker.setLatLng([lat,lon]);
  }
  // I kartmodus kan størrelse være feil før resize
  setTimeout(()=> MAP.invalidateSize(), 50);
}

// Hjelpere
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

// Kartmodus (kun kartet synlig)
function enterMapOnly(){
  document.body.classList.add('map-only');
  setTimeout(()=> MAP && MAP.invalidateSize(), 50);
}
function exitMapOnly(){
  document.body.classList.remove('map-only');
  setTimeout(()=> MAP && MAP.invalidateSize(), 50);
}

// Render – nærmest nå (kun 2)
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

// Render – samling
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

// Render – diplomer
const DIPLOMA_THRESHOLDS = DIP;
function renderDiplomas(){
  const counts=countVisitedByCategory();
  const cats=[...new Set(PLACES.map(p=>p.category))];
  el.diplomas.innerHTML = cats.map(cat=>{
    const n=counts[cat]||0, t=tierFor(n);
    const next = n<DIPLOMA_THRESHOLDS.bronse?`→ ${DIPLOMA_THRESHOLDS.bronse-n} til bronse`
               : n<DIPLOMA_THRESHOLDS.sølv  ?`→ ${DIPLOMA_THRESHOLDS.sølv-n} til sølv`
               : n<DIPLOMA_THRESHOLDS.gull  ?`→ ${DIPLOMA_THRESHOLDS.gull-n} til gull` : 'Maks!';
    const label = t?`<span class="tier ${t}">${tierEmoji(t)} ${t.toUpperCase()}</span>`:'';
    const cls = t?` ${t}`:'';
    return `<div class="diploma${cls}">
      <div class="name">${cat} ${label}</div>
      <div class="meta">Fullfør for å låse opp nivåer</div>
      <p class="desc">${next}</p>
    </div>`;
  }).join('');
}

// Render – galleri (enkelt)
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

// Geo
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

// Init
function init(){
  initMap();
  renderCollection(); renderDiplomas(); renderGallery();
  startGeo();

  // Testmodus
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

  // Kartmodus
  el.mapToggle?.addEventListener('click', enterMapOnly);
  el.mapExit?.addEventListener('click', exitMapOnly);
}
