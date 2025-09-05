// ==============================
// History Go – app.js
// ==============================

/* ---------- Konstanter ---------- */
const START = { lat: 59.9139, lon: 10.7522, zoom: 13 };
const NEARBY_LIMIT = 2;
const HITBOX_SIZE = 44; // px
const STORAGE = {
  visited: 'visited_places',
  badges:  'earned_badges',
  people:  'people_collected'
};
const CATEGORIES = ['historie','kultur','sport','natur','urban'];
const CAT_ICON = {
  historie:'🏛️', kultur:'🎭', sport:'🏅', natur:'🌿', urban:'🏙️'
};
const CAT_CHIP = { historie:'blue', kultur:'red', sport:'green', natur:'yellow', urban:'blue' };

/* ---------- Data ---------- */
let PLACES=[], PEOPLE=[], QUIZZES=[], BADGES=[];
let MAP, userMarker, follow = false;
let currentPos = null;
let markers = []; // { place, marker, hit }

/* ---------- DOM ---------- */
const $ = sel => document.querySelector(sel);
const els = {
  map: $('#map'),
  seeMapBtn: $('#seeMapBtn'),
  mapExit:   $('#mapExit'),
  mapCenter: $('#mapCenter'),
  mapFollow: $('#mapFollow'),
  toast:     $('#toast'),
  test:      $('#testToggle'),

  nearbyList: $('#nearbyList'),
  status:     $('#status'),
  showMoreNearby: $('#showMoreNearby'),
  nearbyMoreWrap: $('#nearbyMoreWrap'),
  moreNearbySheet: $('#moreNearbySheet'),
  moreNearbyList: $('#moreNearbyList'),
  closeMoreNearby: $('#closeMoreNearby'),

  collection: $('#collection'),
  collectionCount: $('#collectionCount'),
  moreCollectionWrap: $('#moreCollectionWrap'),
  moreCollectionN: $('#moreCollectionN'),
  showMoreCollection: $('#showMoreCollection'),

  badges: $('#badges'),
  gallery: $('#gallery'),

  placeCard: $('#placeCard'),
  pcTitle: $('#pcTitle'),
  pcMeta: $('#pcMeta'),
  pcDesc: $('#pcDesc'),
  pcRead: $('#pcRead'),
  pcClose: $('#pcClose'),
};

/* ---------- LocalStorage ---------- */
const visited = JSON.parse(localStorage.getItem(STORAGE.visited) || "{}");
const earned  = JSON.parse(localStorage.getItem(STORAGE.badges ) || "{}");
const people  = JSON.parse(localStorage.getItem(STORAGE.people  ) || "{}");

function saveVisited(){ localStorage.setItem(STORAGE.visited, JSON.stringify(visited)); }
function saveBadges(){  localStorage.setItem(STORAGE.badges,  JSON.stringify(earned));  }
function savePeople(){  localStorage.setItem(STORAGE.people,  JSON.stringify(people));  }

/* ---------- Init ---------- */
Promise.all([
  fetch('places.json').then(r=>r.json()),
  fetch('people.json').then(r=>r.json()).catch(()=>[]),
  fetch('quizzes.json').then(r=>r.json()).catch(()=>[]),
  fetch('badges.json').then(r=>r.json()).catch(()=>[])
]).then(([pl, pe, qz, bd])=>{
  PLACES = (pl||[]).filter(p => CATEGORIES.includes((p.category||'').toLowerCase()));
  PEOPLE = pe||[];
  QUIZZES= qz||[];
  BADGES = bd||[];
  boot();
}).catch(()=> boot());

function boot(){
  initMap();
  bindUI();
  renderCollection();
  renderBadges();
  renderGallery();
  requestLocation();
}

/* ---------- Kart ---------- */
function initMap(){
  MAP = L.map('map', { zoomControl:false, attributionControl:true })
        .setView([START.lat, START.lon], START.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom:19,
    attribution:'&copy; OpenStreetMap &copy; CARTO'
  }).addTo(MAP);

  // Plasser markører
  PLACES.forEach(p=>{
    // Visuell prikk
    const m = L.circleMarker([p.lat, p.lon], {
      radius:6, weight:2, color:'#0f1b2a', fillColor:'#1976d2', fillOpacity:0.95
    }).addTo(MAP);

    // Usynlig "hitbox"
    const hit = L.circleMarker([p.lat, p.lon], {
      radius:HITBOX_SIZE/2, weight:0, fillOpacity:0, opacity:0
    }).addTo(MAP);

    hit.on('click', ()=> openPlaceCard(p));
    m.on('click',   ()=> openPlaceCard(p));

    markers.push({ place:p, marker:m, hit });
  });
}

function setUser(lat, lon){
  if (!MAP) return;
  if (!userMarker){
    userMarker = L.circleMarker([lat,lon],{radius:8,weight:2,color:'#fff',fillColor:'#1976d2',fillOpacity:1}).addTo(MAP);
  } else userMarker.setLatLng([lat,lon]);

  if (follow) MAP.setView([lat,lon], MAP.getZoom(), {animate:true});
}

/* ---------- UI ---------- */
function bindUI(){
  // Kart toggle
  els.seeMapBtn.addEventListener('click', ()=> setMapOnly(true));
  els.mapExit  .addEventListener('click', ()=> setMapOnly(false));
  function setMapOnly(on){
    document.body.classList.toggle('map-only', !!on);
    els.mapFollow.setAttribute('aria-pressed','false');
    follow=false;
  }

  // Senter/follow
  els.mapCenter.addEventListener('click', ()=>{
    if (currentPos) MAP.setView([currentPos.lat,currentPos.lon], 16, {animate:true});
  });
  els.mapFollow.addEventListener('click', ()=>{
    follow=!follow;
    els.mapFollow.setAttribute('aria-pressed', follow?'true':'false');
    if (follow && currentPos) MAP.setView([currentPos.lat,currentPos.lon], 16, {animate:true});
  });

  // Place-card
  els.pcClose.addEventListener('click', ()=> els.placeCard.hidden=true);
  els.pcRead .addEventListener('click', ()=>{
    const url = els.pcRead.dataset.url;
    if (url) window.open(url, '_blank');
  });

  // Flere i nærheten
  els.showMoreNearby?.addEventListener('click', ()=> els.moreNearbySheet.hidden=false);
  els.closeMoreNearby?.addEventListener('click', ()=> els.moreNearbySheet.hidden=true);

  // Testmodus
  els.test?.addEventListener('change', e=>{
    if (e.target.checked){
      currentPos = {lat:START.lat, lon:START.lon};
      els.status.textContent = 'Testmodus: Oslo sentrum';
      setUser(currentPos.lat,currentPos.lon);
      renderNearby(currentPos);
      showToast('Testmodus PÅ');
    } else {
      showToast('Testmodus AV');
      requestLocation();
    }
  });
}

/* ---------- Geolokasjon ---------- */
function requestLocation(){
  if (!navigator.geolocation){
    els.status.textContent = 'Geolokasjon støttes ikke.';
    renderNearby(null);
    return;
  }
  els.status.textContent = 'Henter posisjon…';
  navigator.geolocation.getCurrentPosition(g=>{
    currentPos = {lat:g.coords.latitude, lon:g.coords.longitude};
    els.status.textContent = 'Posisjon funnet.';
    setUser(currentPos.lat,currentPos.lon);
    renderNearby(currentPos);
  }, _=>{
    els.status.textContent = 'Kunne ikke hente posisjon.';
    renderNearby(null);
  }, {enableHighAccuracy:true, timeout:8000, maximumAge:10000});
}

/* ---------- Render: nærhet ---------- */
function haversine(a,b){
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}

function renderNearby(pos){
  const withD = PLACES.map(p=>{
    const d = pos? Math.round(haversine(pos,{lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));

  const top = withD.slice(0, NEARBY_LIMIT);
  const rest = withD.slice(NEARBY_LIMIT);

  els.nearbyList.innerHTML = top.map(renderPlaceCardHTML).join('');
  els.nearbyMoreWrap.hidden = rest.length===0;

  // Fyll sheet
  els.moreNearbyList.innerHTML = rest.map(renderPlaceCardHTML).join('');
}

function renderPlaceCardHTML(p){
  const dist = p.d==null ? '' : (p.d<1000? `${p.d} m unna` : `${(p.d/1000).toFixed(1)} km unna`);
  const cat  = (p.category||'').toLowerCase();
  return `
    <article class="card" data-id="${p.id}" role="button" tabindex="0" aria-label="${p.name}">
      <div class="title">${p.name}</div>
      <div class="meta">${CAT_ICON[cat]||''} ${capitalize(cat)} • Oslo</div>
      <p class="desc">${p.desc||''}</p>
      <div class="dist">${dist}</div>
    </article>
  `;
}
function capitalize(s){ return (s||'').charAt(0).toUpperCase()+ (s||'').slice(1); }

// Deleger klikk fra lister -> openPlaceCard
['nearbyList','moreNearbyList'].forEach(id=>{
  const root = document.getElementById(id);
  root?.addEventListener('click', e=>{
    const art = e.target.closest('[data-id]'); if(!art) return;
    const plc = PLACES.find(p=>p.id===art.dataset.id);
    if (plc) openPlaceCard(plc);
  });
});

/* ---------- Place-card ---------- */
function openPlaceCard(p){
  els.pcTitle.textContent = p.name;
  const cat = (p.category||'').toLowerCase();
  els.pcMeta.textContent  = `${capitalize(cat)} • Oslo`;
  els.pcDesc.textContent  = p.desc || '';
  els.pcRead.dataset.url  = p.url || '';
  els.placeCard.hidden = false;
}

/* ---------- Samling ---------- */
function renderCollection(){
  const items = PLACES.filter(p=>visited[p.id]);
  const total = Object.keys(visited).length;
  els.collectionCount.textContent = total;

  // vis maks 4 i første rad
  const visible = items.slice(0,4);
  const restN   = Math.max(total - visible.length, 0);
  els.collection.innerHTML = visible.map(p=>{
    const cat = (p.category||'').toLowerCase();
    const color = CAT_CHIP[cat] || 'blue';
    return `<button class="chip ${color}" data-id="${p.id}" aria-label="${p.name}">
      <span class="ico">${CAT_ICON[cat]||'📍'}</span> ${p.name}
    </button>`;
  }).join('');
  if (restN>0){
    els.moreCollectionWrap.hidden=false;
    els.moreCollectionN.textContent = restN;
  } else {
    els.moreCollectionWrap.hidden=true;
  }

  // klikk på chip -> place-card
  els.collection.addEventListener('click', e=>{
    const chip = e.target.closest('.chip'); if(!chip) return;
    const plc = PLACES.find(p=>p.id===chip.dataset.id);
    if (plc) openPlaceCard(plc);
  });
}

/* ---------- Merker (tidl. diplomer) ---------- */
function renderBadges(){
  // enkel telling per kategori (steder besøkt)
  const counts = {};
  for (const p of PLACES) if (visited[p.id]) counts[p.category]=(counts[p.category]||0)+1;

  els.badges.innerHTML = CATEGORIES.map(cat=>{
    const n = counts[cat]||0;
    const goal = 5; // enkel baseline
    const pct = Math.max(0, Math.min(100, Math.round(100*n/goal)));
    return `
      <div class="badge">
        <div class="name">${CAT_ICON[cat]} ${capitalize(cat)}</div>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <div class="small">Progresjon: ${n}/${goal} → ${Math.max(goal-n,0)} til bronse</div>
      </div>
    `;
  }).join('');
}

/* ---------- Galleri (personer) ---------- */
function renderGallery(){
  const got = PEOPLE.filter(p=>people[p.id]);
  if (!got.length){
    els.gallery.innerHTML = `<div class="muted">Samle personer ved å besøke steder og ta quiz.</div>`;
    return;
  }
  els.gallery.innerHTML = got.map(p=>`
    <article class="person">
      <div class="avatar">${(p.initials||p.name?.slice(0,2)||'').toUpperCase()}</div>
      <div class="info">
        <div class="pname">${p.name}</div>
        <div class="muted">${(p.tags||[]).join(' • ')}</div>
      </div>
      <button class="pill-ghost pill" style="margin-left:auto">Samlet</button>
    </article>
  `).join('');
}

/* ---------- Utils ---------- */
function showToast(msg='OK'){
  els.toast.textContent = msg;
  els.toast.style.display='block';
  setTimeout(()=> els.toast.style.display='none', 1400);
}
