/* ===============================
   History Go – app.js (stabil)
   =============================== */

/* ---------- Konstanter ---------- */
const NEARBY_LIMIT = 2;

/* ---------- Global state ---------- */
const HG = {
  map: null,
  placeLayer: null,
  peopleLayer: null,
  userMarker: null,
  geoWatchId: null,
  inMapMode: false,
  followUser: false,
  lastPos: null,
  lastUserMoveAt: 0,
  modalsOpen: 0,
  places: [],
  people: [],
  quizzes: [],
  visited: JSON.parse(localStorage.getItem("visited_places") || "{}"),
  merits: JSON.parse(localStorage.getItem("merits_by_category") || "{}"),
  peopleCollected: JSON.parse(localStorage.getItem("people_collected") || "{}")
};

const now = () => Date.now();
const userRecentlyMoved = (ms = 8000) => now() - HG.lastUserMoveAt < ms;
const modalsBlocked = () => HG.modalsOpen > 0;

function openModal() {
  HG.modalsOpen++;
  document.body.classList.add('body-lock');
}
function closeModal() {
  HG.modalsOpen = Math.max(0, HG.modalsOpen - 1);
  if (HG.modalsOpen === 0) document.body.classList.remove('body-lock');
}

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);
const el = {
  map:        $('map'),
  status:     $('status'),
  nearbyList: $('nearbyList'),
  btnSeeMore: $('btnSeeMoreNearby'),
  collection: $('collectionGrid'),
  collectionCount: $('collectionCount'),
  merits:     $('merits'),
  gallery:    $('gallery'),
  toast:      $('toast'),
  test:       $('testToggle'),
  btnSeeMap:  $('btnSeeMap'),
  btnExitMap: $('btnExitMap'),
  btnCenter:  $('btnCenter'),
  // place card
  placeCard:  $('placeCard'),
  pcTitle:    $('pcTitle'),
  pcMeta:     $('pcMeta'),
  pcDesc:     $('pcDesc'),
  pcMore:     $('pcMore'),
  pcUnlock:   $('pcUnlock'),
  pcClose:    $('pcClose'),
  // sheets
  sheetNearby: $('sheetNearby'),
  sheetNearbyBody: $('sheetNearbyBody'),
  sheetCollection: $('sheetCollection'),
  sheetCollectionBody: $('sheetCollectionBody'),
  // quiz
  quizModal:  $('quizModal'),
  quizTitle:  $('quizTitle'),
  quizQuestion: $('quizQuestion'),
  quizChoices:  $('quizChoices'),
  quizProgress: $('quizProgress'),
  quizFeedback: $('quizFeedback'),
  quizClose:    $('quizClose'),
};

/* ---------- Utils ---------- */
function showToast(msg = 'OK') {
  if (!el.toast) return;
  el.toast.textContent = msg;
  el.toast.style.display = 'block';
  setTimeout(() => (el.toast.style.display = 'none'), 1500);
}
function pickColor(cat) {
  const c = (cat || '').toLowerCase();
  if (c.includes('kultur')) return '#e63946';
  if (c.includes('urban'))  return '#4f7cac';
  if (c.includes('natur'))  return '#2a9d8f';
  if (c.includes('sport'))  return '#4caf50';
  return '#1976d2'; // historie / default
}
function haversine(a, b) {
  const R = 6371e3, toRad = d => d * Math.PI/180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat), la2 = toRad(b.lat);
  const x = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}
function formatDistance(m) {
  if (!isFinite(m) || m == null) return 'Ukjent avstand';
  if (m < 950) return `${Math.round(m)} m unna`;
  return `${(m/1000).toFixed(1)} km unna`;
}
function getCollectedPeopleSet() {
  // støtte både {id:true} og ["id","id2"]
  try {
    const mapObj = HG.peopleCollected;
    const arr = Array.isArray(mapObj) ? mapObj : Object.keys(mapObj).filter(k => !!mapObj[k]);
    return new Set(arr);
  } catch {
    return new Set();
  }
}
function saveVisited()  { localStorage.setItem("visited_places", JSON.stringify(HG.visited)); renderCollection(); }
function saveMerits()   { localStorage.setItem("merits_by_category", JSON.stringify(HG.merits)); }
function savePeople()   { localStorage.setItem("people_collected", JSON.stringify(HG.peopleCollected)); renderGallery(); }

/* ---------- Data lasting ---------- */
async function loadJSON(url) {
  try {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error(`${url} -> ${r.status}`);
    return await r.json();
  } catch (e) {
    console.warn('[DATA]', url, e);
    showToast('Kunne ikke laste data.');
    return null;
  }
}

/* ---------- Kart ---------- */
function initMap() {
  if (HG.map) return HG.map;
  HG.map = L.map('map', { zoomControl: true, attributionControl: false })
           .setView([59.9133, 10.7389], 13);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(HG.map);

  ['movestart','dragstart','zoomstart','click','touchstart'].forEach(ev => {
    HG.map.on(ev, () => { HG.lastUserMoveAt = now(); });
  });

  HG.placeLayer  = L.layerGroup().addTo(HG.map);
  HG.peopleLayer = L.layerGroup().addTo(HG.map);
  return HG.map;
}

function addPlaceMarkers() {
  if (!HG.map || !HG.placeLayer) return;
  HG.placeLayer.clearLayers();

  HG.places.forEach(p => {
    // Liten visuell prikk
    const dot = L.circleMarker([p.lat, p.lon], {
      radius: 5, weight: 2, color: '#111', fillColor: pickColor(p.category), fillOpacity: .95
    }).addTo(HG.placeLayer);

    // Stor usynlig hitbox (enklere å treffe)
    const hit = L.circle([p.lat, p.lon], {
      radius: 22, color: 'transparent', opacity: 0, fillColor: 'transparent', fillOpacity: 0
    }).addTo(HG.placeLayer);

    const openCard = () => showPlaceCard(p);

    dot.on('click', openCard);
    hit.on('click', openCard);
  });
}

function updateUserOnMap(lat, lon) {
  if (!HG.map) return;
  if (!HG.userMarker) {
    HG.userMarker = L.circleMarker([lat, lon], {
      radius: 7, weight: 2, color: '#fff', fillColor: '#1976d2', fillOpacity: 1
    }).addTo(HG.map).bindPopup('Du er her');
  } else {
    HG.userMarker.setLatLng([lat, lon]);
  }
}

function centerOn(latlng) {
  if (!HG.map) return;
  HG.map.setView(latlng, Math.max(HG.map.getZoom(), 15), { animate: true });
}

/* ---------- Geolokasjon ---------- */
function startGeolocation() {
  if (!navigator.geolocation || HG.geoWatchId) return;
  HG.geoWatchId = navigator.geolocation.watchPosition(
    pos => {
      const p = [pos.coords.latitude, pos.coords.longitude];
      HG.lastPos = { lat: p[0], lon: p[1] };
      updateUserOnMap(p[0], p[1]);
      if (HG.inMapMode && HG.followUser && !modalsBlocked() && !userRecentlyMoved()) {
        centerOn(p);
      }
      renderNearby(HG.lastPos);
    },
    err => { console.warn('Geolokasjonsfeil', err); },
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
  );
}
function stopGeolocation() {
  if (HG.geoWatchId) {
    navigator.geolocation.clearWatch(HG.geoWatchId);
    HG.geoWatchId = null;
  }
}

/* ---------- Place card ---------- */
function showPlaceCard(place) {
  openModal();
  el.pcTitle.textContent = place.name;
  el.pcMeta.textContent  = `${place.category} • radius ${place.r || 120} m`;
  el.pcDesc.textContent  = place.desc || '';

  el.pcMore.onclick   = () => window.open(`https://www.google.com/search?q=${encodeURIComponent(place.name+' Oslo')}`, '_blank');
  el.pcUnlock.onclick = () => {
    // enkel lås-opp: hvis i testmodus => alltid
    const ok = el.test?.checked ? true : withinRadius(place);
    if (ok) {
      if (!HG.visited[place.id]) {
        HG.visited[place.id] = true; saveVisited();
        showToast(`Låst opp: ${place.name} ✅`);
      } else {
        showToast('Allerede låst opp ✅');
      }
    } else {
      if (HG.lastPos) {
        const d = Math.round(haversine(HG.lastPos, {lat:place.lat, lon:place.lon}));
        showToast(`Du er ${d} m unna`);
      } else {
        showToast('Ukjent posisjon');
      }
    }
  };

  el.placeCard.setAttribute('aria-hidden','false');
}
function hidePlaceCard() {
  el.placeCard.setAttribute('aria-hidden','true');
  closeModal();
}
el.pcClose?.addEventListener('click', hidePlaceCard);

/* ---------- Sheets ---------- */
function openSheet(elm) { if (!elm) return; openModal(); elm.setAttribute('aria-hidden','false'); }
function closeSheet(elm){ if (!elm) return; elm.setAttribute('aria-hidden','true'); closeModal(); }
document.querySelectorAll('.sheet .sheet-close')?.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const sel = btn.getAttribute('data-close');
    const n = sel ? document.querySelector(sel) : btn.closest('.sheet');
    closeSheet(n);
  });
});

/* ---------- Quiz (stub – åpner/lukker) ---------- */
function openQuiz(title = 'Quiz') {
  el.quizTitle.textContent = title;
  el.quizQuestion.textContent = '';
  el.quizChoices.innerHTML = '';
  el.quizProgress.textContent = '';
  el.quizFeedback.textContent = '';
  openModal();
  el.quizModal.setAttribute('aria-hidden','false');
}
function closeQuiz() {
  el.quizModal.setAttribute('aria-hidden','true');
  closeModal();
}
el.quizClose?.addEventListener('click', closeQuiz);

/* ---------- Renderers ---------- */
function withinRadius(place) {
  if (!HG.lastPos) return false;
  const d = haversine(HG.lastPos, {lat:place.lat, lon:place.lon});
  const boost = el.test?.checked ? 5000 : 0;
  const rEff = Math.max(place.r || 120, boost);
  return d <= rEff;
}

function renderNearby(pos) {
  const list = HG.places.map(p => ({
    ...p,
    d: pos ? haversine(pos, {lat:p.lat, lon:p.lon}) : Infinity
  })).sort((a,b)=> (a.d||Infinity) - (b.d||Infinity));

  const top = list.slice(0, NEARBY_LIMIT);
  el.nearbyList.innerHTML = top.map(p => `
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||''}</div>
      <p class="desc">${p.desc||''}</p>
      <div class="dist">${formatDistance(p.d)}</div>
    </article>
  `).join('');

  // “Se flere i nærheten” sheet
  el.btnSeeMore?.onclick = () => {
    el.sheetNearbyBody.innerHTML = list.slice(NEARBY_LIMIT).map(p => `
      <article class="card" style="margin-bottom:8px">
        <div class="name">${p.name}</div>
        <div class="meta">${p.category||''}</div>
        <div class="dist">${formatDistance(p.d)}</div>
      </article>
    `).join('') || `<div class="muted">Ingen flere i nærheten akkurat nå.</div>`;
    openSheet(el.sheetNearby);
  };
}

function renderCollection() {
  const items = HG.places.filter(p => HG.visited[p.id]);
  el.collection.innerHTML = '';
  const maxInline = 8;
  items.slice(0, maxInline).forEach(p=>{
    const chip = document.createElement('span');
    chip.className = 'badge';
    chip.style.background = pickColor(p.category);
    if (pickColor(p.category) === '#ffb703') chip.style.color = '#111';
    chip.textContent = p.name;
    el.collection.appendChild(chip);
  });
  const more = items.length - maxInline;
  if (more > 0) {
    $('btnMoreCollection').style.display = 'inline-block';
    $('btnMoreCollection').onclick = () => {
      el.sheetCollectionBody.innerHTML = items.map(p=>`<span class="badge" style="background:${pickColor(p.category)}">${p.name}</span>`).join('');
      openSheet(el.sheetCollection);
    };
  } else {
    $('btnMoreCollection').style.display = 'none';
  }
  el.collectionCount.textContent = items.length;
}

function renderMerits() {
  // enkel visning: summer etter kategori av besøkte steder
  const counts = {};
  HG.places.forEach(p => { if (HG.visited[p.id]) counts[p.category] = (counts[p.category]||0)+1; });

  const cats = Object.keys(counts);
  el.merits.innerHTML = cats.length
    ? cats.map(cat=>{
        const n = counts[cat];
        const level = n >= 12 ? 'Polarhelt' : n >= 8 ? 'Omreisende' : 'Turist';
        return `
          <div class="diploma">
            <div class="name">${cat} <span class="tier">${level}</span></div>
            <div class="meta">Fremdrift</div>
            <div class="desc">Du har ${n} i denne kategorien.</div>
          </div>`;
      }).join('')
    : `<div class="muted">Besøk steder og ta quizer for å låse opp merker.</div>`;
}

function renderGallery() {
  if (!el.gallery) return;
  const have = getCollectedPeopleSet();
  const mine = HG.people.filter(p => have.has(p.id));
  el.gallery.innerHTML = mine.length
    ? mine.map(p=>`
        <article class="person-card">
          <div class="avatar">${(p.initials||p.name?.slice(0,2)||'??').toUpperCase()}</div>
          <div class="info">
            <div class="name">${p.name}</div>
            <div class="sub">${p.desc||p.sub||''}</div>
          </div>
          <button class="person-btn">Samlet</button>
        </article>
      `).join('')
    : `<div class="muted">Du har ikke samlet noen personer ennå.</div>`;
}

/* ---------- Kartmodus-knapper ---------- */
el.btnSeeMap?.addEventListener('click', () => {
  HG.inMapMode = true;
  el.map.style.display = 'block';
  initMap();
  addPlaceMarkers();
  startGeolocation();
});

el.btnExitMap?.addEventListener('click', () => {
  HG.inMapMode = false;
  el.map.style.display = 'none';
  hidePlaceCard();
  closeSheet(el.sheetNearby);
  closeSheet(el.sheetCollection);
  closeQuiz();
  HG.followUser = false;
  el.btnCenter?.classList.remove('is-on');
  stopGeolocation();
});

el.btnCenter?.addEventListener('click', () => {
  HG.followUser = !HG.followUser;
  el.btnCenter.classList.toggle('is-on', HG.followUser);
  if (HG.followUser && HG.lastPos) centerOn([HG.lastPos.lat, HG.lastPos.lon]);
});

/* ---------- Testmodus ---------- */
el.test?.addEventListener('change', (e) => {
  if (e.target.checked) {
    HG.lastPos = { lat:59.9139, lon:10.7522 };
    el.status.textContent = 'Testmodus: Oslo sentrum';
    if (HG.inMapMode && HG.map) {
      updateUserOnMap(HG.lastPos.lat, HG.lastPos.lon);
      centerOn([HG.lastPos.lat, HG.lastPos.lon]);
    }
    renderNearby(HG.lastPos);
    showToast('Testmodus PÅ');
  } else {
    showToast('Testmodus AV');
    if (HG.inMapMode) startGeolocation();
    else {
      // oppdater listen med ukjent pos
      renderNearby(null);
    }
  }
});

/* ---------- Init ---------- */
(async function init() {
  // last data
  const [places, people, quizzes] = await Promise.all([
    loadJSON('./places.json'),
    loadJSON('./people.json'),
    loadJSON('./quizzes.json')
  ]);
  HG.places  = Array.isArray(places)  ? places  : [];
  HG.people  = Array.isArray(people)  ? people  : [];
  HG.quizzes = Array.isArray(quizzes) ? quizzes : [];

  // UI
  renderNearby(null);
  renderCollection();
  renderMerits();
  renderGallery();

  // posisjon
  if ('geolocation' in navigator) {
    el.status.textContent = 'Henter posisjon…';
    navigator.geolocation.getCurrentPosition(
      g => {
        HG.lastPos = { lat: g.coords.latitude, lon: g.coords.longitude };
        el.status.textContent = 'Posisjon funnet.';
        renderNearby(HG.lastPos);
      },
      _ => { el.status.textContent = 'Kunne ikke hente posisjon.'; },
      { enableHighAccuracy:true, timeout:8000, maximumAge:10000 }
    );
  } else {
    el.status.textContent = 'Geolokasjon støttes ikke.';
  }
})();
