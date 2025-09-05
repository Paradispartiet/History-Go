// ==============================
// History Go – app.js (forside)
// ==============================

const NEARBY_LIMIT = 2;
const START_POS = { lat: 59.9139, lon: 10.7522, zoom: 13 };

// Data
let PLACES = [];
let PEOPLE = [];

// State / storage
const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const diplomas        = JSON.parse(localStorage.getItem("diplomas_by_category") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");

function saveVisited(){  localStorage.setItem("visited_places", JSON.stringify(visited));  renderCollection(); }
function saveDiplomas(){ localStorage.setItem("diplomas_by_category", JSON.stringify(diplomas)); }
function savePeople(){   localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); }

// DOM
const el = {
  map:        document.getElementById('map'),
  toast:      document.getElementById('toast'),
  status:     document.getElementById('status'),
  list:       document.getElementById('list'),
  collection: document.getElementById('collection'),
  count:      document.getElementById('count'),
  diplomas:   document.getElementById('diplomas'),
  gallery:    document.getElementById('gallery'),

  moreBtn:    document.getElementById('moreCollection'),
  sheet:      document.getElementById('sheet'),
  sheetBody:  document.getElementById('sheetBody'),
  sheetClose: document.getElementById('sheetClose'),

  infoCard:   document.getElementById('infocard'),
  infoTitle:  document.getElementById('infoTitle'),
  infoMeta:   document.getElementById('infoMeta'),
  infoDesc:   document.getElementById('infoDesc'),
  infoMore:   document.getElementById('infoMore'),
  infoClose:  document.getElementById('infoClose'),

  modal:      document.getElementById('modal'),
  modalTitle: document.getElementById('modalTitle'),
  modalBody:  document.getElementById('modalBody'),
  modalLink:  document.getElementById('modalLink'),
  modalClose: document.getElementById('modalClose'),

  test:       document.getElementById('testToggle'),
  mapToggle:  document.getElementById('mapToggle')
};

// Diplomer
const DIPLOMA_THRESHOLDS = { bronse: 10, sølv: 25, gull: 50 };
const tierRank = t => ({ bronse:1, sølv:2, gull:3 }[t] || 0);
const tierFor  = n => (n>=DIPLOMA_THRESHOLDS.gull?'gull': n>=DIPLOMA_THRESHOLDS.sølv?'sølv': n>=DIPLOMA_THRESHOLDS.bronse?'bronse': null);
const tierEmoji = t => t==='gull'?'🥇':t==='sølv'?'🥈':t==='bronse'?'🥉':'';

// Utils
function pickColor(cat){
  const c=(cat||'').toLowerCase();
  if (c.includes('kultur')) return '#e63946';
  if (c.includes('sever'))  return '#ffb703';
  if (c.includes('sport')||c.includes('natur')) return '#2a9d8f';
  return '#1976d2';
}
function haversine(a,b){
  const R=6371e3,toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function showToast(msg){
  if(!el.toast) return;
  el.toast.textContent=msg; el.toast.style.display='block';
  setTimeout(()=> el.toast.style.display='none',1400);
}
function countVisitedByCategory(){
  const counts={};
  for(const p of PLACES) if(visited[p.id]) counts[p.category]=(counts[p.category]||0)+1;
  return counts;
}

// Map (Leaflet)
let MAP, userMarker;
function initMap(){
  MAP = L.map('map', { zoomControl:false, attributionControl:false })
        .setView([START_POS.lat, START_POS.lon], START_POS.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap, &copy; CARTO', maxZoom: 19
  }).addTo(MAP);

  // Plasser markører med stor hitbox
  drawPlaceMarkers();
}
function setUser(lat, lon){
  if(!MAP) return;
  if(!userMarker){
    userMarker = L.circleMarker([lat,lon], {
      radius:8, weight:2, color:'#fff', fillColor:'#1976d2', fillOpacity:1
    }).addTo(MAP).bindPopup('Du er her');
  } else userMarker.setLatLng([lat,lon]);
}

// Place markers + hitbox + click -> info card
function drawPlaceMarkers(){
  if(!MAP) return;
  PLACES.forEach(p=>{
    // Synlig prikk
    const dot = L.circleMarker([p.lat,p.lon], {
      radius:7, weight:2, color:'#111', fillColor:pickColor(p.category), fillOpacity:.95
    }).addTo(MAP);

    // Usynlig hitbox (36px-ish)
    const hit = L.circle([p.lat,p.lon], {
      radius: 30, color:'#000', opacity:0, fillOpacity:0, interactive:true
    }).addTo(MAP);

    const open = ()=> openInfoCard(p);
    dot.on('click', open);
    hit.on('click', open);
  });
}

// Info-card
let currentPlace = null;
function openInfoCard(p){
  currentPlace = p;
  el.infoTitle.textContent = p.name;
  el.infoMeta.textContent  = `${p.category||''}`;
  el.infoDesc.textContent  = p.desc || '';
  el.infoCard.style.display = 'block';

  el.infoMore.onclick = ()=>{
    if(p.details){
      openModal(p);
    } else if(p.link){
      window.open(p.link, '_blank', 'noopener');
    } else {
      showToast('Ingen mer info tilgjengelig.');
    }
  };
}
function closeInfoCard(){
  el.infoCard.style.display='none';
  currentPlace=null;
}
el.infoClose.addEventListener('click', closeInfoCard);

// Modal
function openModal(p){
  el.modalTitle.textContent = p.name;
  el.modalBody.innerHTML = `
    <p class="muted" style="margin-top:0">${p.category||''}</p>
    <p>${(p.details || p.desc || 'Ingen detaljert tekst tilgjengelig.')}</p>
  `;
  if(p.link){
    el.modalLink.style.display='inline-block';
    el.modalLink.href = p.link;
  } else {
    el.modalLink.style.display='none';
  }
  el.modal.setAttribute('aria-hidden','false');
}
function closeModal(){ el.modal.setAttribute('aria-hidden','true'); }
el.modalClose.addEventListener('click', closeModal);
el.modal.addEventListener('click', (e)=>{ if(e.target===el.modal) closeModal(); });

// Map-only toggle
function setMapOnly(on){
  document.body.classList.toggle('map-only', !!on);
  if(el.mapToggle) el.mapToggle.textContent = on ? 'Skjul kart' : 'Se kart';
  setTimeout(()=> MAP && MAP.invalidateSize(), 180);
}
el.mapToggle.addEventListener('click', ()=> setMapOnly(!document.body.classList.contains('map-only')));

// Nearby (2 stk)
function renderNearby(pos){
  const withDist = PLACES.map(p=>{
    const d = pos ? Math.round(haversine(pos,{lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));

  const subset = withDist.slice(0, NEARBY_LIMIT);
  el.list.innerHTML = subset.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||''}</div>
      <div class="desc">${p.desc||''}</div>
      <div class="dist">${p.d==null?'':(p.d<1000?`${p.d} m`:`${(p.d/1000).toFixed(1)} km`)} unna</div>
    </article>
  `).join('');
}

// Samling (1 linje + +N flere)
function renderCollection(){
  const items = PLACES.filter(p=>visited[p.id]);
  el.collection.innerHTML = items.length
    ? items.map(p=>`<span class="chip ${chipClass(p.category)}">${p.name}</span>`).join('')
    : `<div class="muted">Besøk et sted for å låse opp ditt første merke.</div>`;

  el.count.textContent = items.length;

  // +N
  const overflow = Math.max(0, items.length - 6);
  if(overflow>0){
    el.moreBtn.style.display='inline-block';
    el.moreBtn.textContent = `+${overflow} flere`;
  } else el.moreBtn.style.display='none';

  // Sheet-body (full liste)
  el.sheetBody.innerHTML = items.map(p=>`<span class="chip ${chipClass(p.category)}">${p.name}</span>`).join('');
}
function chipClass(cat){
  const c=(cat||'').toLowerCase();
  if(c.includes('kultur')) return 'red';
  if(c.includes('sever'))  return 'yellow';
  if(c.includes('sport')||c.includes('natur')) return 'green';
  return '';
}
el.moreBtn.addEventListener('click', ()=> el.sheet.setAttribute('aria-hidden','false'));
el.sheetClose.addEventListener('click', ()=> el.sheet.setAttribute('aria-hidden','true'));
el.sheet.addEventListener('click', (e)=>{ if(e.target===el.sheet) el.sheet.setAttribute('aria-hidden','true'); });

// Diplomer
function renderDiplomas(){
  const counts = countVisitedByCategory();
  const allCats = [...new Set(PLACES.map(p=>p.category))];

  el.diplomas.innerHTML = allCats.map(cat=>{
    const n    = counts[cat] || 0;
    const tier = diplomas[cat] || tierFor(n);
    const next =
      n < DIPLOMA_THRESHOLDS.bronse ? `→ ${DIPLOMA_THRESHOLDS.bronse-n} til bronse` :
      n < DIPLOMA_THRESHOLDS.sølv   ? `→ ${DIPLOMA_THRESHOLDS.sølv-n} til sølv`   :
      n < DIPLOMA_THRESHOLDS.gull   ? `→ ${DIPLOMA_THRESHOLDS.gull-n} til gull`   : 'Maks!';

    const tClass = tier ? ` ${tier}` : '';
    const progMax =
      n < DIPLOMA_THRESHOLDS.bronse ? DIPLOMA_THRESHOLDS.bronse :
      n < DIPLOMA_THRESHOLDS.sølv   ? DIPLOMA_THRESHOLDS.sølv :
      DIPLOMA_THRESHOLDS.gull;
    const pct = Math.min(100, Math.round((n / progMax) * 100));

    return `
      <div class="diploma${tClass}">
        <div class="name">${cat} ${tier?`<span class="tier">${tier.toUpperCase()}</span>`:''}</div>
        <div class="meta">Progresjon: ${n}/${progMax}</div>
        <div class="progress"><i style="width:${pct}%"></i></div>
        <div class="desc" style="margin-top:8px">${next}</div>
      </div>
    `;
  }).join('');
}

// Galleri
function renderGallery(){
  const got = PEOPLE.filter(p=>peopleCollected[p.id]);
  el.gallery.innerHTML = got.length
    ? got.map(p=>`
      <div class="person">
        <div class="avatar">${(p.initials || (p.name||'')[0]).slice(0,2).toUpperCase()}</div>
        <div style="flex:1">
          <div class="name">${p.name}</div>
          <div class="meta">${p.sub||p.desc||''}</div>
        </div>
        <button class="ghost small" disabled>Samlet</button>
      </div>
    `).join('')
    : `<div class="muted">Samle personer ved events og høytider (f.eks. Julenissen i desember).</div>`;
}

// Award (valgfritt auto i testmodus)
function awardBadge(place){
  if(visited[place.id]) return;
  visited[place.id]=true; saveVisited();
  showToast(`Låst opp: ${place.name} ✅`);

  const counts = countVisitedByCategory();
  const newTier = tierFor(counts[place.category]||0);
  const oldTier = diplomas[place.category] || null;
  if(newTier && tierRank(newTier) > tierRank(oldTier)){
    diplomas[place.category]=newTier; saveDiplomas();
    showToast(`${tierEmoji(newTier)} ${place.category}: ${newTier.toUpperCase()}!`);
    renderDiplomas();
  }
}

// Geolokasjon & nearby
let currentPos = null;
function requestLocation(){
  if(!navigator.geolocation){
    el.status.textContent='Geolokasjon støttes ikke.'; renderNearby(null); return;
  }
  el.status.textContent='Henter posisjon…';
  navigator.geolocation.getCurrentPosition(g=>{
    currentPos = {lat:g.coords.latitude, lon:g.coords.longitude};
    el.status.textContent='Posisjon funnet.';
    setUser(currentPos.lat, currentPos.lon);
    renderNearby(currentPos);
  }, _=>{
    el.status.textContent='Kunne ikke hente posisjon.'; renderNearby(null);
  }, {enableHighAccuracy:true, timeout:8000, maximumAge:10000});
}

// Header pille-knapper: smooth scroll
document.querySelectorAll('.pill[data-scroll]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sel = btn.getAttribute('data-scroll');
    const target = document.querySelector(sel);
    if(!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top, behavior:'smooth' });
  });
});

// Testmodus
el.test.addEventListener('change', e=>{
  if(e.target.checked){
    currentPos = {lat:START_POS.lat, lon:START_POS.lon};
    el.status.textContent='Testmodus: Oslo sentrum';
    setUser(currentPos.lat, currentPos.lon);
    renderNearby(currentPos);
    showToast('Testmodus PÅ');
  } else {
    showToast('Testmodus AV'); requestLocation();
  }
});

// Init
function init(){
  initMap();
  renderCollection();
  renderDiplomas();
  renderGallery();
  requestLocation();

  // Info/Modal close via ESC
  document.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){
      if(el.modal.getAttribute('aria-hidden')==='false') closeModal();
      if(el.sheet.getAttribute('aria-hidden')==='false') el.sheet.setAttribute('aria-hidden','true');
      if(el.infoCard.style.display==='block') closeInfoCard();
    }
  });

  // Klikk utenfor infokort -> lukk
  document.addEventListener('click', (e)=>{
    if(el.infoCard.style.display==='block'){
      const box = el.infoCard.querySelector('.info-inner');
      if(box && !box.contains(e.target) && e.target !== el.infoCard) closeInfoCard();
    }
  });
}

Promise.all([
  fetch('places.json').then(r=>r.json()),
  fetch('people.json').then(r=>r.json()).catch(()=>[])
]).then(([places, people])=>{
  PLACES = places||[];
  PEOPLE = people||[];
  init();
});
