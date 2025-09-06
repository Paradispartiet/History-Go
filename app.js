/* ======= State ======= */
let PLACES = [], PEOPLE = [], QUIZZES = [], BADGES = [];
let userPos = null;
let testMode = false;
let map, markers = [];
let inMapMode = false;
let autoFollow = true;
let autoPauseTimer = null;
let currentPlace = null;

/* ======= Utils ======= */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

function showToast(txt){
  const t = $('#toast');
  t.textContent = txt;
  t.classList.add('on');
  setTimeout(()=>t.classList.remove('on'), 2000);
}

async function loadJSON(url, {retries=2}={}){
  for (let i=0;i<=retries;i++){
    try{
      const r = await fetch(url, {cache:'no-store'});
      if(!r.ok) throw new Error(r.statusText||('HTTP '+r.status));
      return await r.json();
    }catch(e){ if(i===retries) throw e; }
  }
}

function haversine(a,b){
  const R = 6371000;
  const dLat = (b.lat-a.lat)*Math.PI/180;
  const dLon = (b.lon-a.lon)*Math.PI/180;
  const sLat1 = Math.sin(dLat/2), sLon1 = Math.sin(dLon/2);
  const aa = sLat1*sLat1 + Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*sLon1*sLon1;
  return 2*R*Math.asin(Math.min(1, Math.sqrt(aa)));
}
function formatDistance(m){
  if (!Number.isFinite(m)) return '—';
  return m>1000 ? (m/1000).toFixed(1)+' km' : Math.round(m)+' m';
}

/* ======= Storage ======= */
const store = {
  get places(){ return JSON.parse(localStorage.getItem('places')||'[]'); },
  addPlace(id){ const s=new Set(this.places); s.add(id); localStorage.setItem('places', JSON.stringify([...s])); },
  get people(){ return JSON.parse(localStorage.getItem('peopleCollected')||'[]'); },
  addPerson(id){ const s=new Set(this.people); s.add(id); localStorage.setItem('peopleCollected', JSON.stringify([...s])); },
  get badges(){ return JSON.parse(localStorage.getItem('badges')||'{}'); },
  addBadgeProgress(cat, pts){
    const b = this.badges;
    b[cat] = (b[cat]||0) + (pts||0);
    localStorage.setItem('badges', JSON.stringify(b));
  }
};

/* ======= Init ======= */
init();
async function init(){
  try {
    [PLACES, PEOPLE, QUIZZES, BADGES] = await Promise.all([
      loadJSON('./places.json'),
      loadJSON('./people.json'),
      loadJSON('./quizzes.json'),
      loadJSON('./badges.json')
    ]);
  } catch(e){
    showToast('Kunne ikke laste data.');
  }

  // UI hooks
  $('#btnSeeMap').addEventListener('click', enterMap);
  $('#btnExitMap').addEventListener('click', exitMap);
  $('#pcClose').addEventListener('click', hidePlaceCard);
  $$('#placeCard .pc-actions .ghost-btn, #pcMore').forEach(btn=>{
    btn.addEventListener('click',()=>window.open('https://www.visitoslo.com/','_blank'));
  });
  $$('.sheet .sheet-close').forEach(b=>b.addEventListener('click', e=>{
    const sel = e.currentTarget.getAttribute('data-close');
    closeSheet(sel);
  }));
  $('#quizClose').addEventListener('click', closeQuiz);
  $('#btnSeeMoreNearby').addEventListener('click', openNearbySheet);

  // Testmodus toggle
  const t = $('#testToggle');
  testMode = t?.checked || false;
  t?.addEventListener('change', ()=>{ testMode=t.checked; getPosition(true); });

  // Geoposisjon
  getPosition();

  renderAll();
}

/* ======= Geolocation ======= */
function getPosition(force=false){
  if (testMode){
    userPos = {lat:59.91699, lon:10.72763}; // Slottet
    $('#status').textContent = 'Posisjon ukjent (viser likevel).';
    renderAll();
    if (inMapMode) centerIfPossible(true);
    return;
  }
  if (!navigator.geolocation){
    $('#status').textContent='Posisjon ikke støttet.';
    renderAll(); return;
  }
  navigator.geolocation.getCurrentPosition(
    p => {
      userPos = {lat:p.coords.latitude, lon:p.coords.longitude};
      $('#status').textContent='';
      renderAll();
      if (inMapMode) centerIfPossible();
    },
    _ => {
      $('#status').textContent='Posisjon ukjent (viser likevel).';
      renderAll();
    },
    {enableHighAccuracy:true, maximumAge: force?0:15000, timeout:8000}
  );
}

/* ======= Render ======= */
function renderAll(){
  renderNearby();
  renderCollection();
  renderBadges();
  renderGallery();
}

function nearestPlaces(arr, origin, take=10){
  const o = origin || {lat:59.9133, lon:10.7389}; // fallback sentrum
  return [...arr]
    .map(p => ({...p, _d: haversine(o, {lat:p.lat, lon:p.lon})}))
    .sort((a,b)=>a._d-b._d)
    .slice(0, take);
}

function renderNearby(){
  const target = $('#nearbyList');
  const list = nearestPlaces(PLACES, userPos, 2);
  target.innerHTML = list.map(renderPlaceCard).join('');
  // bind knapper
  list.forEach(p => bindPlaceCardButtons(p.id));
}
function renderPlaceCardHtml(p, withDistance=true){
  const d = userPos ? haversine(userPos, p) : NaN;
  const distTxt = withDistance ? `<div class="pc-dist">${formatDistance(d)} unna</div>` : '';
  return `
  <div class="card">
    <div class="card-head">
      <div class="card-title">${p.name}</div>
      <div class="pill">${p.category}</div>
    </div>
    <div class="card-body">
      <div class="muted">${p.desc||''}</div>
      ${distTxt}
      <div class="row gap">
        <button class="ghost-btn" data-act="more" data-id="${p.id}">Les mer</button>
        <button class="primary-btn" data-act="unlock" data-id="${p.id}">Lås opp</button>
      </div>
    </div>
  </div>`;
}
function renderPlaceCard(p){ return renderPlaceCardHtml(p,true); }

function bindPlaceCardButtons(placeId){
  $$(`[data-id="${placeId}"][data-act="more"]`).forEach(b=>b.addEventListener('click', ()=>openPlace(placeId)));
  $$(`[data-id="${placeId}"][data-act="unlock"]`).forEach(b=>b.addEventListener('click', ()=>openPlace(placeId, true)));
}

function openNearbySheet(){
  const body = $('#sheetNearbyBody');
  const list = nearestPlaces(PLACES, userPos, 20);
  body.innerHTML = list.map(p => renderPlaceCardHtml(p,false)).join('');
  list.forEach(p => bindPlaceCardButtons(p.id));
  openSheet('#sheetNearby');
}

function renderCollection(){
  const ids = store.places;
  $('#collectionCount').textContent = ids.length;
  const grid = $('#collectionGrid');
  if (!ids.length){ grid.innerHTML = '<div class="muted">Ingen steder enda.</div>'; return; }
  const items = PLACES.filter(p=>ids.includes(p.id)).slice(0,6);
  grid.innerHTML = items.map(p=>`<div class="chip">${p.name}</div>`).join('');
  $('#btnMoreCollection').style.display = ids.length>6 ? 'inline-flex' : 'none';
}

function renderBadges(){
  const wrap = $('#merits');
  const progress = store.badges; // {Historie: n, Kultur: n, ...}
  const cats = ['Historie','Kultur','Sport','Natur','Urban Life'];
  wrap.innerHTML = cats.map(cat=>{
    const n = progress[cat]||0;
    const toBronse = Math.max(0, 5-(n%5));
    return `
      <div class="merit">
        <div class="merit-title">${cat}</div>
        <div class="merit-sub">Progresjon: ${n%5}/5</div>
        <div class="merit-bar"><span style="width:${(n%5)*20}%"></span></div>
        <div class="merit-note">→ ${toBronse} til bronse</div>
      </div>
    `;
  }).join('');
}

function renderGallery(){
  const wrap = $('#gallery');
  const collected = store.people;
  if (!collected.length){
    wrap.innerHTML = '<div class="muted">Ingen personer enda. Lås opp et sted og ta en quiz!</div>';
    return;
  }
  const items = PEOPLE.filter(p => collected.includes(p.id));
  wrap.innerHTML = items.map(p=>`<div class="chip">${p.name}</div>`).join('');
}

/* ======= Place detail + Quiz ======= */
function openPlace(id, unlock=false){
  const p = PLACES.find(x=>x.id===id);
  if (!p) return;
  currentPlace = p;
  $('#pcTitle').textContent = p.name;
  $('#pcMeta').textContent = `${p.category} • radius ${p.r||100} m`;
  $('#pcDesc').textContent = p.desc||'';
  const persons = PEOPLE.filter(x => x.placeId === p.id);
  const unlockBtn = $('#pcUnlock');
  unlockBtn.disabled = !persons.length;
  unlockBtn.textContent = persons.length ? 'Møt person' : 'Ingen personer her';
  unlockBtn.onclick = () => {
    if (!persons.length) return;
    startQuizFor(persons[0]); // én i første omgang
  };
  showPlaceCard();
  if (unlock && persons.length) startQuizFor(persons[0]);
}

function startQuizFor(person){
  const quiz = QUIZZES.find(q => q.personId===person.id);
  if (!quiz){ showToast('Ingen quiz ennå.'); return; }
  runQuiz(quiz, () => {
    // Reward
    store.addPerson(person.id);
    store.addBadgeProgress(quiz.reward?.category || 'Historie', quiz.reward?.points || 1);
    store.addPlace(currentPlace.id);
    renderGallery(); renderBadges(); renderCollection();
    showToast(`${person.name} lagt til i samlingen!`);
    hidePlaceCard();
  });
}

function runQuiz(quiz, onWin){
  const modal = $('#quizModal');
  let i = 0, correct = 0;
  $('#quizTitle').textContent = quiz.title;
  function draw(){
    const q = quiz.questions[i];
    $('#quizQuestion').textContent = q.text;
    $('#quizChoices').innerHTML = q.choices.map((c,idx)=>`
      <button class="choice" data-i="${idx}">${c}</button>
    `).join('');
    $('#quizProgress').textContent = `${i+1}/${quiz.questions.length}`;
    $('#quizFeedback').textContent = '';
    $$('#quizChoices .choice').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const ok = Number(btn.getAttribute('data-i'))===q.answerIndex;
        if (ok){ correct++; $('#quizFeedback').textContent='Riktig!'; }
        else { $('#quizFeedback').textContent='Feil. '+(q.explanation||''); }
        setTimeout(()=>{
          i++;
          if (i>=quiz.questions.length){
            closeQuiz();
            if (correct===quiz.questions.length) onWin?.();
            else showToast('Prøv igjen – du klarer det!');
          } else draw();
        }, 600);
      });
    });
  }
  modal.classList.add('on');
  draw();
}
function closeQuiz(){ $('#quizModal').classList.remove('on'); }

/* ======= Sheets & card ======= */
function openSheet(sel){ const el=$(sel); el?.classList.add('on'); }
function closeSheet(sel){ const el=$(sel); el?.classList.remove('on'); }
function showPlaceCard(){ $('#placeCard').classList.add('on'); }
function hidePlaceCard(){ $('#placeCard').classList.remove('on'); }

/* ======= Map ======= */
function enterMap(){
  inMapMode = true; autoFollow = true;
  $('#map').classList.add('on');
  $('#btnExitMap').style.display='block';
  $('#btnCenter').style.display='block';
  if (!map) initMap();
  centerIfPossible(true);
}
function exitMap(){
  inMapMode = false;
  $('#map').classList.remove('on');
  $('#btnExitMap').style.display='none';
  $('#btnCenter').style.display='none';
}
function initMap(){
  map = L.map('map', {zoomControl:false}).setView([59.9133,10.7389], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'© OSM'
  }).addTo(map);
  map.on('movestart zoomstart click', pauseAutoFollow);
  $('#btnCenter').addEventListener('click', ()=>{ autoFollow=true; centerIfPossible(true); });

  // markers + større hitbox
  for (const p of PLACES){
    const vis = L.circleMarker([p.lat,p.lon], {radius:5, weight:2, color:'#7dafff', opacity:.9, fillOpacity:.6}).addTo(map);
    const hit = L.circle([p.lat,p.lon], {radius:25, color:'#0000', fillColor:'#0000', fillOpacity:0, interactive:true}).addTo(map);
    hit.on('click', ()=>openPlace(p.id));
    markers.push(vis);
  }
}
function pauseAutoFollow(){
  if (!inMapMode) return;
  autoFollow = false;
  clearTimeout(autoPauseTimer);
  autoPauseTimer = setTimeout(()=>{ autoFollow = true; }, 10000);
}
function centerIfPossible(force=false){
  if (!map) return;
  if ((autoFollow || force) && userPos){
    map.setView([userPos.lat, userPos.lon], Math.max(map.getZoom(), 14), {animate:true});
  }
}
