/* app.js — History Go (tilpasset indexen du limte inn) */

const els = {
  map: document.getElementById('map'),
  btnSeeMap: document.getElementById('btnSeeMap'),
  btnExitMap: document.getElementById('btnExitMap'),
  btnCenter: document.getElementById('btnCenter'),
  toast: document.getElementById('toast'),
  status: document.getElementById('status'),
  testToggle: document.getElementById('testToggle'),
  nearbyList: document.getElementById('nearbyList'),
  sheetNearby: document.getElementById('sheetNearby'),
  sheetNearbyBody: document.getElementById('sheetNearbyBody'),
  btnSeeMoreNearby: document.getElementById('btnSeeMoreNearby'),
  collectionGrid: document.getElementById('collectionGrid'),
  collectionCount: document.getElementById('collectionCount'),
  sheetCollection: document.getElementById('sheetCollection'),
  sheetCollectionBody: document.getElementById('sheetCollectionBody'),
  merits: document.getElementById('merits'),
  gallery: document.getElementById('gallery'),
  placeCard: document.getElementById('placeCard'),
  pcTitle: document.getElementById('pcTitle'),
  pcMeta: document.getElementById('pcMeta'),
  pcDesc: document.getElementById('pcDesc'),
  pcMore: document.getElementById('pcMore'),
  pcUnlock: document.getElementById('pcUnlock'),
  pcClose: document.getElementById('pcClose'),
  quizModal: document.getElementById('quizModal'),
  quizTitle: document.getElementById('quizTitle'),
  quizClose: document.getElementById('quizClose'),
  quizQuestion: document.getElementById('quizQuestion'),
  quizChoices: document.getElementById('quizChoices'),
  quizProgress: document.getElementById('quizProgress'),
  quizFeedback: document.getElementById('quizFeedback'),
  header: document.querySelector('header'),
  main: document.querySelector('main')
};

const STORE = {
  collection: new Set(JSON.parse(localStorage.getItem('hg_collection') || '[]')),
  persons: new Set(JSON.parse(localStorage.getItem('hg_persons') || '[]')),
  merits: JSON.parse(localStorage.getItem('hg_merits') || '{}') // { Historie: n, Kultur: n, ...}
};

let DATA = { places: [], people: [], quizzes: [] };
let userPos = null;
let map, youMarker, autoWatchId = null;
let markers = new Map(); // placeId -> { dot, hit, popupData }

/* ---------- Utils ---------- */
const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));
const distanceKm = (a,b)=>{
  const R=6371, dLat=(b.lat-a.lat)*Math.PI/180, dLon=(b.lon-a.lon)*Math.PI/180;
  const s1=Math.sin(dLat/2)**2 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(s1));
};
function toast(msg,ms=1400){
  els.toast.textContent = msg;
  els.toast.style.display='block';
  setTimeout(()=>els.toast.style.display='none', ms);
}
function saveStore(){
  localStorage.setItem('hg_collection', JSON.stringify([...STORE.collection]));
  localStorage.setItem('hg_persons', JSON.stringify([...STORE.persons]));
  localStorage.setItem('hg_merits', JSON.stringify(STORE.merits));
}

/* ---------- Init data & map ---------- */
async function loadData(){
  const [places, people, quizzes] = await Promise.all([
    fetch('places.json').then(r=>r.json()),
    fetch('people.json').then(r=>r.json()),
    fetch('quizzes.json').then(r=>r.json()).catch(()=>[])
  ]);
  DATA.places = places;
  DATA.people = people;
  DATA.quizzes = quizzes;
}

function initMap(){
  map = L.map('map', { zoomControl:false, attributionControl:false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    maxZoom: 19
  }).addTo(map);

  // deg-markør
  youMarker = L.circleMarker([0,0], {radius:6, color:'#0ff', weight:2, fillColor:'#0ff', fillOpacity:.8});
  youMarker.addTo(map);

  // markers for places
  for(const p of DATA.places){
    const pos=[p.lat,p.lon];

    // synlig liten prikk
    const dot = L.circleMarker(pos, {
      radius:6, color:'#1976d2', weight:2, fillColor:'#1976d2', fillOpacity:0.9
    }).addTo(map);

    // usynlig stor hitbox (fast px via circleMarker ~ 22)
    const hit = L.circleMarker(pos, {
      radius:22, color:'transparent', weight:0, fillColor:'transparent', fillOpacity:0, interactive:true
    }).addTo(map);

    const openCard = ()=>showPlaceCard(p);
    dot.on('click', openCard);
    hit.on('click', openCard);

    markers.set(p.id, {dot, hit});
  }
}

async function locate(){
  if(els.testToggle.checked){
    // testpos: Oslo S
    const pos = { coords:{ latitude:59.9111, longitude:10.7528, accuracy:30 } };
    onPosition(pos);
    return;
  }
  if(!navigator.geolocation){
    els.status.textContent = 'Geolokasjon støttes ikke.';
    return;
  }
  navigator.geolocation.getCurrentPosition(onPosition, ()=>els.status.textContent='Kunne ikke hente posisjon.');
}

function onPosition(pos){
  userPos = {lat:pos.coords.latitude, lon:pos.coords.longitude, acc:pos.coords.accuracy};
  els.status.textContent = 'Posisjon funnet.';
  youMarker.setLatLng([userPos.lat, userPos.lon]);
  if(!map._loaded){
    map.setView([userPos.lat, userPos.lon], 14);
  }
  renderNearby();
}

/* ---------- Renderers ---------- */
function renderNearby(){
  if(!userPos) return;
  const withDist = DATA.places.map(p=>{
    const d = distanceKm(userPos, {lat:p.lat,lon:p.lon});
    return {...p, _dKm: d};
  }).sort((a,b)=>a._dKm-b._dKm);

  const top2 = withDist.slice(0,2);
  const rest = withDist.slice(2, 30);

  els.nearbyList.innerHTML = top2.map(cardPlace).join('');
  els.btnSeeMoreNearby.onclick = ()=>{
    els.sheetNearbyBody.innerHTML = rest.map(cardPlace).join('');
    openSheet(els.sheetNearby);
  };
}

function cardPlace(p){
  const dist = p._dKm!=null ? formatDist(p._dKm) : '';
  return `
  <div class="card" data-place="${p.id}">
    <div class="name">${p.name}</div>
    <div class="meta">${p.category}</div>
    <div class="desc">${p.desc||''}</div>
    ${dist ? `<div class="dist">${dist}</div>`:''}
  </div>`;
}

function formatDist(km){
  if(km<1) return `${Math.round(km*1000)} m unna`;
  return `${km.toFixed(1)} km unna`;
}

function renderCollection(){
  const items = DATA.places.filter(p=>STORE.collection.has(p.id));
  els.collectionCount.textContent = items.length;
  // første rad: maks 4
  const head = items.slice(0,4);
  const tail = items.slice(4);
  els.collectionGrid.innerHTML = head.map(badge).join('');
  if(tail.length){
    els.btnMoreCollection.style.display='inline-block';
    els.btnMoreCollection.onclick = ()=>{
      els.sheetCollectionBody.innerHTML = items.map(badge).join('');
      openSheet(els.sheetCollection);
    };
  }else{
    els.btnMoreCollection.style.display='none';
  }
}

function badge(p){
  const color = {
    'Historie':'badge-blue',
    'Kultur':'badge-red',
    'Sport':'badge-green',
    'Natur':'badge-olive',
    'Urban Life':'badge-amber'
  }[p.category] || 'badge-soft';
  return `<span class="badge ${color}" data-place="${p.id}">${p.name}</span>`;
}

function renderMerits(){
  // vis små “display cards” per kategori med poeng
  const cats = ['Historie','Kultur','Sport','Natur','Urban Life'];
  els.merits.innerHTML = cats.map(cat=>{
    const pts = STORE.merits[cat]||0;
    const need = 5; // enkel terskel per nivå
    const pct = Math.min(100, Math.round(pts/need*100));
    return `
      <div class="merit">
        <div class="merit-t">${cat}</div>
        <div class="merit-bar"><i style="width:${pct}%"></i></div>
        <div class="muted">Poeng: ${pts} / ${need}</div>
      </div>`;
  }).join('');
}

function renderPeopleGallery(){
  // vise personer nær deg (enkelt: topp 6 nærmeste personer basert på placeId)
  const arr = DATA.people.map(pe=>{
    const pl = DATA.places.find(p=>p.id===pe.placeId);
    if(!pl) return null;
    const d = userPos ? distanceKm(userPos, {lat:pl.lat,lon:pl.lon}) : 999;
    return {...pe, _dKm:d, place: pl};
  }).filter(Boolean).sort((a,b)=>a._dKm-b._dKm).slice(0,6);
  els.gallery.innerHTML = arr.map(pe=>personCard(pe)).join('');
}

function personCard(pe){
  const owned = STORE.persons.has(pe.id);
  return `
  <div class="person-card">
    <div class="avatar">${(pe.initials||'??').slice(0,2)}</div>
    <div>
      <div class="name">${pe.name}</div>
      <div class="meta">${pe.place?.name||''}</div>
      <div class="muted">${pe.desc||''}</div>
    </div>
    <button class="person-btn" data-person="${pe.id}" ${owned?'disabled':''}>
      ${owned?'I samling':'Møt'}
    </button>
  </div>`;
}

/* ---------- Place card ---------- */
let currentPlace = null;

function showPlaceCard(p){
  currentPlace = p;
  els.pcTitle.textContent = p.name;
  els.pcMeta.textContent = `${p.category} • ${p.r||150} m radius`;
  els.pcDesc.textContent = p.desc||'';
  els.placeCard.setAttribute('aria-hidden','false');
  els.placeCard.classList.add('show');

  els.pcMore.onclick = ()=> {
    // åpne relevant Wikipedia/lenke hvis du ønsker — placeholder:
    window.open(`https://www.google.com/search?q=${encodeURIComponent(p.name+' Oslo')}`,'_blank');
  };
  els.pcUnlock.onclick = ()=> startQuizForFirstPersonAt(p.id);
}

function hidePlaceCard(){
  els.placeCard.classList.remove('show');
  els.placeCard.setAttribute('aria-hidden','true');
}

/* ---------- Quiz ---------- */
let quiz = null, qi=0;

function startQuizForFirstPersonAt(placeId){
  const peopleHere = DATA.people.filter(pe=>pe.placeId===placeId);
  if(!peopleHere.length){ toast('Ingen personer her (enda).'); return; }
  const target = peopleHere[0]; // enkel versjon – ta første
  const qz = DATA.quizzes.find(q=>q.personId===target.id);
  if(!qz){ toast('Ingen quiz for denne (enda).'); return; }

  quiz = { meta:qz, person:target };
  qi = 0;
  openQuiz();
  renderQuizStep();
}

function openQuiz(){
  els.quizModal.setAttribute('aria-hidden','false');
  els.quizModal.classList.add('show');
}
function closeQuiz(){
  els.quizModal.classList.remove('show');
  els.quizModal.setAttribute('aria-hidden','true');
}

function renderQuizStep(){
  const q = quiz.meta.questions[qi];
  els.quizTitle.textContent = quiz.meta.title;
  els.quizQuestion.textContent = q.text;
  els.quizChoices.innerHTML = q.choices.map((c,idx)=>`<button class="choice" data-idx="${idx}">${c}</button>`).join('');
  els.quizProgress.textContent = `Spørsmål ${qi+1} av ${quiz.meta.questions.length}`;
  els.quizFeedback.textContent = '';

  [...els.quizChoices.querySelectorAll('.choice')].forEach(btn=>{
    btn.onclick = ()=>{
      const pick = Number(btn.dataset.idx);
      if(pick === q.answerIndex){
        els.quizFeedback.textContent = 'Riktig!';
        qi++;
        if(qi>=quiz.meta.questions.length){
          // reward
          STORE.persons.add(quiz.person.id);
          STORE.collection.add(quiz.person.placeId);
          const cat = quiz.meta.reward?.category || quiz.meta.category;
          const pts = quiz.meta.reward?.points || 1;
          STORE.merits[cat] = (STORE.merits[cat]||0) + pts;
          saveStore();
          renderCollection();
          renderMerits();
          renderPeopleGallery();
          closeQuiz();
          toast(`Du låste opp ${quiz.person.name}!`);
        }else{
          renderQuizStep();
        }
      }else{
        els.quizFeedback.textContent = q.explanation ? `Feil. ${q.explanation}` : 'Feil, prøv igjen.';
      }
    };
  });
}

/* ---------- Sheets ---------- */
function openSheet(el){ el.classList.add('show'); el.setAttribute('aria-hidden','false'); }
function closeSheet(el){ el.classList.remove('show'); el.setAttribute('aria-hidden','true'); }
document.addEventListener('click', (e)=>{
  const closeSel = e.target.closest('[data-close]');
  if(closeSel){
    const sel = closeSel.getAttribute('data-close');
    const el = document.querySelector(sel);
    if(el) closeSheet(el);
  }
});

/* ---------- Map mode ---------- */
function enterMapMode(){
  document.body.classList.add('map-only');
  hidePlaceCard();
  // start auto-follow
  if(autoWatchId) navigator.geolocation.clearWatch(autoWatchId);
  autoWatchId = navigator.geolocation.watchPosition(p=>{
    onPosition(p);
    if(userPos) map.panTo([userPos.lat, userPos.lon], {animate:true});
  }, ()=>{}, {enableHighAccuracy:true, maximumAge:4000, timeout:8000});
}
function exitMapMode(){
  document.body.classList.remove('map-only');
  if(autoWatchId) { navigator.geolocation.clearWatch(autoWatchId); autoWatchId=null; }
}
function centerOnYou(){
  if(userPos) map.panTo([userPos.lat, userPos.lon], {animate:true});
}

/* ---------- Wire up ---------- */
function wire(){
  els.btnSeeMap.onclick = enterMapMode;
  els.btnExitMap.onclick = exitMapMode;
  els.btnCenter.onclick = centerOnYou;
  els.pcClose.onclick = hidePlaceCard;
  els.quizClose.onclick = closeQuiz;

  // klikk på kort/badges
  document.addEventListener('click', (e)=>{
    const card = e.target.closest('.card');
    if(card && card.dataset.place){
      const p = DATA.places.find(x=>x.id===card.dataset.place);
      if(p){ showPlaceCard(p); map.setView([p.lat,p.lon], 16); }
    }
    const badgeEl = e.target.closest('.badge');
    if(badgeEl && badgeEl.dataset.place){
      const p = DATA.places.find(x=>x.id===badgeEl.dataset.place);
      if(p){ showPlaceCard(p); }
    }
    const personBtn = e.target.closest('.person-btn');
    if(personBtn){
      const id = personBtn.dataset.person;
      const pe = DATA.people.find(x=>x.id===id);
      if(!pe) return;
      // merk i samling uten quiz (møte) – quiz for diplom via placeCard
      STORE.persons.add(pe.id); saveStore(); renderPeopleGallery(); toast(`${pe.name} lagt til i samlingen`);
    }
  });

  els.testToggle.onchange = ()=> locate();
}

/* ---------- Start ---------- */
(async function start(){
  try{
    await loadData();
    initMap();
    wire();
    locate();
    renderCollection();
    renderMerits();
    renderPeopleGallery();
  }catch(err){
    console.error(err);
    toast('Kunne ikke laste data.');
  }
})();
