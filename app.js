/* === History Go – Sheet over kart (uten toppmeny) === */

// --- Data ---
let PLACES = [];
let PEOPLE = [];

// Last inn data
Promise.all([
  fetch('places.json').then(r=>r.json()),
  fetch('people.json').then(r=>r.json()).catch(()=>[])
]).then(([places, people])=>{
  PLACES = places || [];
  PEOPLE = people || [];
  init();
});

// --- DOM ---
const el = {
  status: document.getElementById('status'),
  list: document.getElementById('list'),
  btnMore: document.getElementById('btnMore'),
  collection: document.getElementById('collection'),
  count: document.getElementById('count'),
  diplomas: document.getElementById('diplomas'),
  gallery: document.getElementById('gallery'),
  toast: document.getElementById('toast'),
  sheet: document.getElementById('sheet')
};

// --- State ---
let currentPos = null;
let showAllNearby = false;

// --- Kart (Leaflet) ---
let MAP, userMarker;

function initMap(center=[59.9139,10.7522], zoom=13){
  MAP = L.map('map',{zoomControl:false, attributionControl:false})
          .setView(center, zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom: 19
  }).addTo(MAP);

  // Stedspins
  (PLACES || []).forEach(p=>{
    const m = L.circleMarker([p.lat,p.lon],{
      radius:7, weight:1, color:'#111', fillColor:'#1976d2', fillOpacity:.95
    }).addTo(MAP);
    m.bindPopup(`<strong>${p.name}</strong><br>${p.category||''}`);
  });
}

function setUser(lat, lon){
  if(!MAP) return;
  const opts = {radius:8,color:'#fff',weight:2,fillColor:'#00e676',fillOpacity:1};
  if(userMarker){ userMarker.setLatLng([lat,lon]); }
  else { userMarker = L.circleMarker([lat,lon],opts).addTo(MAP).bindPopup('Din posisjon'); }
}

// --- Utils ---
const dist = (a,b)=>{
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
};
const fmt = m=> m<1000 ? `${Math.round(m)} m unna` : `${(m/1000).toFixed(1)} km unna`;
const clsByCat = c=>{
  c = (c||'').toLowerCase();
  if(c.startsWith('hist')) return 'badge-historie';
  if(c.startsWith('kul'))  return 'badge-kultur';
  if(c.startsWith('sev'))  return 'badge-severdigheter';
  if(c.startsWith('sport'))return 'badge-sport';
  return 'badge-historie';
};
function showToast(msg){ el.toast.textContent=msg; el.toast.style.display='block'; setTimeout(()=>el.toast.style.display='none',1500); }

// --- Renderers ---
function renderNearby(){
  const src = (currentPos
    ? PLACES.map(p=>({...p, d:dist(currentPos,{lat:p.lat,lon:p.lon})})).sort((a,b)=>(a.d??1e12)-(b.d??1e12))
    : PLACES.map(p=>({...p, d:null}))
  );

  const list = showAllNearby ? src : src.slice(0,2);
  el.list.innerHTML = list.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||''} • Oslo</div>
      <div class="desc">${p.desc||''}</div>
      <div class="dist">${p.d==null ? '–' : fmt(p.d)}</div>
    </article>
  `).join('');

  el.btnMore.style.display = src.length > 2 ? 'inline-block' : 'none';
  el.btnMore.textContent = showAllNearby ? 'Vis færre' : 'Vis flere';
}

function renderCollection(){
  // Enkel “chips” av alle steder (demo). Bytt gjerne til visited senere.
  el.collection.innerHTML = PLACES.slice(0,10).map(p=>
    `<span class="badge ${clsByCat(p.category)}">${p.name}</span>`
  ).join('');
  el.count.textContent = Math.min(PLACES.length,10);
}

function renderDiplomas(){
  // Demo-diplomer
  const d = [
    {name:"Oslo – Grunnpakke", tier:"bronse", meta:"Fullfør 5 steder", desc:"De første fem stedene i sentrum er låst opp."},
    {name:"Kulturstien", tier:"sølv", meta:"Fullfør 8 kultursteder", desc:"Museer, bibliotek og scenehus."},
    {name:"Historie-mester", tier:"gull", meta:"Fullfør 12 historiske steder", desc:"Du kan byens tidslinjer."}
  ];
  el.diplomas.innerHTML = d.map(x=>`
    <article class="card diploma ${x.tier}">
      <div class="name">${x.name} <span class="tier ${x.tier}">${x.tier.toUpperCase()}</span></div>
      <div class="meta">${x.meta}</div>
      <div class="desc">${x.desc}</div>
    </article>
  `).join('');
}

function renderGallery(){
  el.gallery.innerHTML = (PEOPLE||[]).map(p=>{
    const pills = (p.tags||['Person']).map(t=>{
      const m = {person:'person',event:'event',now:'now',soon:'soon'};
      return `<span class="pill ${m[t]||'person'}">${t[0].toUpperCase()+t.slice(1)}</span>`;
    }).join('');
    return `
      <article class="person-card">
        <div class="avatar">${(p.initials||p.name?.slice(0,2)||'HG').toUpperCase()}</div>
        <div style="flex:1">
          <div class="name">${p.name||''}</div>
          <div class="meta">${p.desc||''}</div>
          <div style="margin-top:6px">${pills}</div>
        </div>
        <button class="person-btn ${p.now?'':'ghost'}">${p.now?'Gå til':'Forbered'}</button>
      </article>
    `;
  }).join('');
}

// --- Geolokasjon ---
function locate(){
  if(!navigator.geolocation){
    el.status.textContent = "Geolokasjon støttes ikke.";
    renderNearby();
    return;
  }
  el.status.textContent = "Henter posisjon…";
  navigator.geolocation.getCurrentPosition(pos=>{
    currentPos = {lat:pos.coords.latitude, lon:pos.coords.longitude};
    el.status.textContent = "Posisjon funnet.";
    setUser(currentPos.lat,currentPos.lon);
    renderNearby();
  },err=>{
    el.status.textContent = "Kunne ikke hente posisjon.";
    renderNearby();
  },{enableHighAccuracy:true, timeout:8000, maximumAge:10000});
}

// --- Sheet interaksjon (drag opp/ned) ---
(function(){
  const sheet = document.getElementById('sheet');
  const handle = sheet.querySelector('.handle');

  let startY=0, startH=0, dragging=false;

  function setHeight(px){
    const minH = 140;
    const maxH = Math.round(window.innerHeight*0.95);
    const h = Math.max(minH, Math.min(maxH, px));
    sheet.style.maxHeight = h+'px';
  }

  function onStart(y){
    dragging=true; startY=y; startH=sheet.getBoundingClientRect().height;
    document.body.style.userSelect='none';
  }
  function onMove(y){
    if(!dragging) return;
    setHeight(startH + (startY - y));
  }
  function onEnd(){
    dragging=false; document.body.style.userSelect='';
  }

  handle.addEventListener('mousedown', e=>onStart(e.clientY));
  window.addEventListener('mousemove', e=>onMove(e.clientY));
  window.addEventListener('mouseup', onEnd);

  handle.addEventListener('touchstart', e=>onStart(e.touches[0].clientY), {passive:true});
  window.addEventListener('touchmove', e=>onMove(e.touches[0].clientY), {passive:true});
  window.addEventListener('touchend', onEnd);
})();

// --- Init ---
function init(){
  initMap();
  locate();
  renderCollection();
  renderDiplomas();
  renderGallery();

  // “Vis flere”
  el.btnMore.addEventListener('click', ()=>{
    showAllNearby = !showAllNearby;
    renderNearby();
  });
}
