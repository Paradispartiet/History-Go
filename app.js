// ==============================
// History Go – app.js (v4)
// ==============================

// ---- Data ----
let PLACES = [];
let PEOPLE = [];
let QUIZZES = [];

// ---- LocalStorage state ----
const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");         // {placeId:true}
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");       // {personId:ts}
const merits          = JSON.parse(localStorage.getItem("merit_points") || "{}");           // { "Historie": points, ... }

function saveVisited(){  localStorage.setItem("visited_places", JSON.stringify(visited));  renderCollection(); renderMerits(); }
function savePeople(){   localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); renderGallery(); renderMerits(); }
function saveMerits(){   localStorage.setItem("merit_points", JSON.stringify(merits)); renderMerits(); }

// ---- DOM refs ----
const el = {
  map:          document.getElementById('map'),
  toast:        document.getElementById('toast'),
  status:       document.getElementById('status'),
  test:         document.getElementById('testToggle'),

  btnSeeMap:    document.getElementById('btnSeeMap'),
  btnExitMap:   document.getElementById('btnExitMap'),
  btnCenter:    document.getElementById('btnCenter'),

  nearbyList:   document.getElementById('nearbyList'),
  btnSeeMoreNearby: document.getElementById('btnSeeMoreNearby'),
  sheetNearby:  document.getElementById('sheetNearby'),
  sheetNearbyBody: document.getElementById('sheetNearbyBody'),

  collectionGrid: document.getElementById('collectionGrid'),
  collectionCount:document.getElementById('collectionCount'),
  btnMoreCollection:document.getElementById('btnMoreCollection'),
  sheetCollection: document.getElementById('sheetCollection'),
  sheetCollectionBody: document.getElementById('sheetCollectionBody'),

  merits:       document.getElementById('merits'),
  gallery:      document.getElementById('gallery'),

  // Place card
  placeCard:    document.getElementById('placeCard'),
  pcTitle:      document.getElementById('pcTitle'),
  pcMeta:       document.getElementById('pcMeta'),
  pcDesc:       document.getElementById('pcDesc'),
  pcClose:      document.getElementById('pcClose'),
  pcMore:       document.getElementById('pcMore'),
  pcUnlock:     document.getElementById('pcUnlock'),

  // Quiz
  quizModal:    document.getElementById('quizModal'),
  quizClose:    document.getElementById('quizClose'),
  quizTitle:    document.getElementById('quizTitle'),
  quizQuestion: document.getElementById('quizQuestion'),
  quizChoices:  document.getElementById('quizChoices'),
  quizProgress: document.getElementById('quizProgress'),
  quizFeedback: document.getElementById('quizFeedback'),
};

function showToast(msg='OK'){ if(!el.toast) return; el.toast.textContent=msg; el.toast.style.display='block'; setTimeout(()=> el.toast.style.display='none',1400); }

// ---- Kategori-farger/chips ----
function catColor(cat){
  const k=(cat||'').toLowerCase();
  if (k.includes('urban'))  return '#ffb703';
  if (k.includes('kultur')) return '#e63946';
  if (k.includes('sport'))  return '#2a9d8f';
  if (k.includes('natur'))  return '#4fb7a9';
  if (k.includes('histor')) return '#1976d2';
  return '#7aa0c8';
}
function chipClass(cat){
  const k=(cat||'').toLowerCase();
  if (k.includes('urban'))  return 'gold';
  if (k.includes('kultur')) return 'red';
  if (k.includes('sport'))  return 'green';
  if (k.includes('natur'))  return 'green';
  if (k.includes('histor')) return 'blue';
  return 'gray';
}

// ---- Hjelpere ----
function distMeters(a,b){
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function fmtDist(m){ if(m<1000) return `${Math.round(m)} m unna`; return `${(m/1000).toFixed(1)} km unna`; }

function getAllCategories(){ return [...new Set(PLACES.map(p=>p.category))]; }
function countVisitedByCategory(){ const c={}; for(const p of PLACES) if(visited[p.id]) c[p.category]=(c[p.category]||0)+1; return c; }
function countPeopleByCategory(){
  const c={};
  for(const pr of PEOPLE){
    if(!peopleCollected[pr.id]) continue;
    const place=PLACES.find(x=>x.id===pr.placeId);
    const cat=place?.category||'Ukjent';
    c[cat]=(c[cat]||0)+1;
  }
  return c;
}

// ---- Leaflet kart ----
let MAP, userMarker;
let mapMode=false, autoFollow=false;
let userPos=null;

function initMap(){
  MAP = L.map('map',{zoomControl:false, attributionControl:false}).setView([59.9139,10.7522],13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(MAP);

  // Plasser markører
  PLACES.forEach(p=>{
    // Visuell liten prikk
    const dot = L.circleMarker([p.lat,p.lon],{
      radius:6, weight:2, color:'#111', fillColor:catColor(p.category), fillOpacity:.95
    }).addTo(MAP);

    // Usynlig stor hitbox (36-44px)
    const hit = L.circle([p.lat,p.lon],{
      radius: 20, color:'#000', opacity:0, fillOpacity:0, interactive:true
    }).addTo(MAP);

    const open = ()=> openPlaceCard(p);
    dot.on('click', open);
    hit.on('click', open);

    // Optional radius-guide i testmodus (aktivert senere)
  });
}

function setUser(lat,lon){
  if(!MAP) return;
  if(!userMarker){
    userMarker = L.circleMarker([lat,lon],{radius:8,weight:2,color:'#fff',fillColor:'#1976d2',fillOpacity:1}).addTo(MAP).bindPopup('Du er her');
  } else {
    userMarker.setLatLng([lat,lon]);
  }
  if (mapMode && autoFollow){
    MAP.setView([lat,lon], MAP.getZoom(), {animate:true});
  }
}

// ---- Place card ----
let __currentPlace=null;
function openPlaceCard(p){
  __currentPlace = p;
  el.pcTitle.textContent = p.name;
  el.pcMeta.textContent  = `${p.category||''} • radius ${(p.r||120)} m`;
  el.pcDesc.textContent  = (p.desc||'');
  el.placeCard.setAttribute('aria-hidden','false');
}
function closePlaceCard(){
  el.placeCard.setAttribute('aria-hidden','true');
  __currentPlace = null;
}
el.pcClose.addEventListener('click', closePlaceCard);
el.pcMore.addEventListener('click', ()=>{
  // Toggle mer tekst (enkelt). Kun demo – kan byttes til egen modal.
  el.pcDesc.classList.toggle('expanded');
});
el.pcUnlock.addEventListener('click', ()=>{
  const p = __currentPlace; if(!p) return;
  const pos = userPos;
  const boost = el.test?.checked ? 5000 : 0;
  const rEff = Math.max(p.r||120, boost);
  if(!pos){ awardBadge(p); return; }
  const d = Math.round(distMeters(pos,{lat:p.lat,lon:p.lon}));
  if(d<=rEff){ awardBadge(p); closePlaceCard(); }
  else showToast(`Du er ${d} m unna (trenger ${rEff} m)`);
});

// ---- Nearby (2 + sheet) ----
function renderNearby(){
  const arr = PLACES.map(p=>{
    const d = userPos ? distMeters(userPos,{lat:p.lat,lon:p.lon}) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));

  const top2 = arr.slice(0,2);
  el.nearbyList.innerHTML = top2.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||''}</div>
      <p class="desc">${p.desc||''}</p>
      <div class="dist">${p.d==null?'':fmtDist(p.d)}</div>
      <div class="row right" style="margin-top:8px">
        <button class="ghost-btn" data-goto="${p.id}">Vis på kart</button>
      </div>
    </article>
  `).join('');

  // Knapper
  el.nearbyList.querySelectorAll('[data-goto]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const p = PLACES.find(x=>x.id===btn.getAttribute('data-goto'));
      if(!p) return;
      enterMapMode(true);
      MAP.setView([p.lat,p.lon], 16, {animate:true});
      openPlaceCard(p);
    });
  });

  // Sheet for flere
  el.sheetNearbyBody.innerHTML = arr.slice(2).map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||''}</div>
      <p class="desc">${p.desc||''}</p>
      <div class="dist">${p.d==null?'':fmtDist(p.d)}</div>
      <div class="row right" style="margin-top:8px">
        <button class="ghost-btn" data-open="${p.id}">Åpne</button>
      </div>
    </article>
  `).join('');
  el.sheetNearbyBody.querySelectorAll('[data-open]').forEach(b=>{
    b.addEventListener('click', ()=>{
      const p = PLACES.find(x=>x.id===b.getAttribute('data-open')); if(!p) return;
      closeSheet(el.sheetNearby);
      enterMapMode(true);
      MAP.setView([p.lat,p.lon], 16, {animate:true});
      openPlaceCard(p);
    });
  });
}

// ---- Min samling (én rad + sheet) ----
function renderCollection(){
  const items = PLACES.filter(p=>visited[p.id]);
  el.collectionCount.textContent = items.length;

  // vis ~første rad (ta de 8 første – praktisk tommelregel)
  const first = items.slice(0,8);
  el.collectionGrid.innerHTML = first.map(p=>`<span class="chip ${chipClass(p.category)}">${p.name}</span>`).join('');

  const leftover = items.length - first.length;
  if (leftover > 0){
    el.btnMoreCollection.style.display = '';
    el.btnMoreCollection.textContent = `+ ${leftover} flere`;
    el.sheetCollectionBody.innerHTML = items.slice(8).map(p=>`<span class="chip ${chipClass(p.category)}">${p.name}</span>`).join('');
  } else {
    el.btnMoreCollection.style.display = 'none';
    el.sheetCollectionBody.innerHTML = '';
  }
}

// ---- Merker (poeng per kategori) ----
function tierForTotalPoints(n){
  if (n >= 24) return 'gull';
  if (n >= 12) return 'sølv';
  if (n >= 5)  return 'bronse';
  return null;
}
function renderMerits(){
  if(!el.merits) return;
  const cats = getAllCategories();
  const v = countVisitedByCategory();
  const pc = countPeopleByCategory();

  el.merits.innerHTML = cats.map(cat=>{
    const vv = v[cat]  || 0;
    const pp = pc[cat] || 0;
    const qq = merits[cat] || 0;
    const total = vv + pp + qq;
    const rel = Math.max(0, Math.min(100, Math.round((total/24)*100)));
    const tier = tierForTotalPoints(total);
    const tierLabel = tier ? `<span class="tier-label ${tier}">${tier.toUpperCase()}</span>` : '';
    return `
      <div class="merit-card">
        <div class="merit-head">${cat} ${tierLabel}</div>
        <div class="merit-sub">
          <span class="badge-soft">Poeng: <strong>${total}</strong></span>
          <span class="badge-soft">Steder: ${vv}</span>
          <span class="badge-soft">Personer: ${pp}</span>
          <span class="badge-soft">Quiz: +${qq}</span>
        </div>
        <div class="meter"><span style="width:${rel}%"></span></div>
      </div>
    `;
  }).join('');
}

// ---- Galleri (personer) ----
function renderGallery(){
  if(!el.gallery) return;
  const got = PEOPLE.filter(p=>peopleCollected[p.id]);
  el.gallery.innerHTML = got.length
    ? got.map(p=>{
        const initials=(p.initials || (p.name||'').slice(0,2)).toUpperCase();
        return `
        <article class="person-card">
          <div class="avatar">${initials}</div>
          <div>
            <div class="name">${p.name}</div>
            <div class="meta">${p.desc||''}</div>
          </div>
          <button class="person-btn" data-quiz="${p.id}">Quiz</button>
        </article>`;
      }).join('')
    : `<div class="muted">Samle personer ved steder – start en quiz for å få poeng.</div>`;

  el.gallery.querySelectorAll('[data-quiz]').forEach(btn=>{
    btn.addEventListener('click', ()=> startQuiz(btn.getAttribute('data-quiz')));
  });
}

// ---- Award-funksjoner ----
function awardBadge(place){
  if (visited[place.id]) { showToast('Allerede låst'); return; }
  visited[place.id]=true; saveVisited();
  showToast(`Låst opp: ${place.name} ✅`);
}
function awardPerson(person){
  if (peopleCollected[person.id]){ showToast('Allerede samlet'); return; }
  peopleCollected[person.id]=Date.now(); savePeople();
  showToast(`Samlet: ${person.name} ✅`);
}

// ---- Geolokasjon ----
function requestLocation(){
  if(!navigator.geolocation){ el.status.textContent='Geolokasjon støttes ikke.'; renderNearby(); return; }
  el.status.textContent='Henter posisjon…';
  navigator.geolocation.watchPosition((geo)=>{
    userPos = {lat:geo.coords.latitude, lon:geo.coords.longitude};
    el.status.textContent = `Din posisjon: ${userPos.lat.toFixed(5)}, ${userPos.lon.toFixed(5)}`;
    setUser(userPos.lat, userPos.lon);
    renderNearby();

    // Testmodus: auto-award innen stor radius
    if (el.test?.checked){
      for(const p of PLACES){
        const d = distMeters(userPos,{lat:p.lat,lon:p.lon});
        if (d <= Math.max(p.r||120, 5000)) awardBadge(p);
      }
    }
  }, (err)=>{
    el.status.textContent='Kunne ikke hente posisjon: '+err.message;
    renderNearby();
  }, {enableHighAccuracy:true, maximumAge:5000, timeout:15000});
}

// ---- Kart-modus & knapper ----
function enterMapMode(setFollow=false){
  if (!mapMode){
    document.body.classList.add('map-only');
    mapMode=true;
  }
  if (setFollow){
    autoFollow=true;
    el.btnCenter.classList.add('active');
    if (userPos) MAP.setView([userPos.lat,userPos.lon], 15, {animate:true});
  }
}
function exitMapMode(){
  document.body.classList.remove('map-only');
  mapMode=false;
  autoFollow=false;
  el.btnCenter.classList.remove('active');
}

el.btnSeeMap.addEventListener('click', ()=> enterMapMode(true));
el.btnExitMap.addEventListener('click', exitMapMode);
el.btnCenter.addEventListener('click', ()=>{
  autoFollow=!autoFollow;
  if (autoFollow && userPos) MAP.setView([userPos.lat,userPos.lon], MAP.getZoom(), {animate:true});
  el.btnCenter.classList.toggle('active', autoFollow);
});

// ---- Sheets ----
function openSheet(sh){ sh?.setAttribute('aria-hidden','false'); }
function closeSheet(sh){ sh?.setAttribute('aria-hidden','true'); }
document.querySelectorAll('.sheet .sheet-close').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sel = btn.getAttribute('data-close');
    if (sel) closeSheet(document.querySelector(sel));
  });
});
el.btnSeeMoreNearby.addEventListener('click', ()=> openSheet(el.sheetNearby));
el.btnMoreCollection.addEventListener('click', ()=> openSheet(el.sheetCollection));

// ---- Quiz ----
let __quiz = { quiz:null, idx:0, correct:0 };
function getQuizByPersonId(personId){ return QUIZZES.find(q=>q.personId===personId) || null; }
function applyReward(reward){
  if(!reward) return;
  const cat = reward.category || 'Historie';
  const pts = Number(reward.points||0);
  merits[cat] = (merits[cat]||0) + pts;
  saveMerits();
  showToast(`+${pts} poeng i ${cat}`);
}
function openQuizModal(){ el.quizModal?.setAttribute('aria-hidden','false'); }
function closeQuizModal(){ el.quizModal?.setAttribute('aria-hidden','true'); }
el.quizClose.addEventListener('click', closeQuizModal);

function startQuiz(personId){
  const q = getQuizByPersonId(personId);
  if(!q){ showToast('Ingen quiz her (enda)'); return; }
  __quiz = {quiz:q, idx:0, correct:0};
  renderQuizStep();
  openQuizModal();
}
function renderQuizStep(){
  const {quiz, idx} = __quiz;
  const step = quiz.questions[idx];
  el.quizTitle.textContent = quiz.title || 'Quiz';
  el.quizQuestion.textContent = step.text;
  el.quizProgress.textContent = `Spørsmål ${idx+1} av ${quiz.questions.length}`;
  el.quizFeedback.textContent = '';
  el.quizChoices.innerHTML = '';
  step.choices.forEach((choice,i)=>{
    const b=document.createElement('button');
    b.textContent=choice;
    b.addEventListener('click', ()=>{
      const ok = (i===step.answerIndex);
      b.classList.add(ok?'correct':'wrong');
      el.quizFeedback.textContent = step.explanation || (ok?'Riktig!':'Feil svar.');
      setTimeout(()=>{
        if(__quiz.idx < quiz.questions.length-1){ __quiz.idx++; renderQuizStep(); }
        else { applyReward(quiz.reward); closeQuizModal(); }
      }, 650);
    });
    el.quizChoices.appendChild(b);
  });
}

// ---- Init ----
function boot(){
  initMap();
  requestLocation();
  renderCollection();
  renderMerits();
  renderGallery();
  renderNearby();

  // placeCard lukking hvis du trykker utenfor (valgfritt)
  // (utelatt for enkelhet her)

  // Testmodus
  el.test?.addEventListener('change', e=>{
    if (e.target.checked){
      showToast('Testmodus PÅ');
      // gi en fiktiv posisjon i sentrum (for demo)
      userPos = {lat:59.9139, lon:10.7522};
      setUser(userPos.lat, userPos.lon);
      renderNearby();
    } else showToast('Testmodus AV');
  });
}

// ---- Start ----
Promise.all([
  fetch('places.json').then(r=>r.json()),
  fetch('people.json').then(r=>r.json()).catch(()=>[]),
  fetch('quizzes.json').then(r=>r.json()).catch(()=>[])
]).then(([places, people, quizzes])=>{
  PLACES = places||[];
  PEOPLE = people||[];
  QUIZZES = quizzes||[];
  boot();
});
