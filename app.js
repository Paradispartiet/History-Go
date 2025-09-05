/* =========================
   History Go – app.js (ny)
   ========================= */

// ---------- Små utils ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const km = (m) => {
  if (m == null || isNaN(m)) return '';
  if (m < 1000) return `${Math.round(m)} m unna`;
  return `${(m / 1000).toFixed(1)} km unna`;
};

function showToast(msg, ms = 2500) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.style.display = 'block';
  setTimeout(() => (t.style.display = 'none'), ms);
}

// ---------- Debug fetch med cache-busting ----------
async function fetchJSON(url) {
  const busted = `${url}${url.includes('?') ? '&' : '?'}v=${Date.now()}`;
  console.log('[DEBUG] Fetch:', busted);
  let res;
  try {
    res = await fetch(busted, { cache: 'no-store' });
  } catch (e) {
    console.error('[DEBUG] Nettverksfeil:', e);
    throw new Error(`Nettverksfeil for ${url}`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    console.error('[DEBUG] HTTP-feil', res.status, body.slice(0, 180));
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  try {
    const json = await res.json();
    console.log('[DEBUG] OK:', url, Array.isArray(json) ? `${json.length} rader` : Object.keys(json));
    return json;
  } catch (e) {
    console.error('[DEBUG] JSON-feil:', e);
    throw new Error(`JSON-feil for ${url}`);
  }
}

// ---------- App-state ----------
const state = {
  testMode: false,
  userPos: null,        // {lat, lon}
  autoFollow: false,    // kun i kart-modus
  mapOnly: false,

  places: [],
  people: [],
  quizzes: [],
  badges: [],

  // localStorage
  collection: new Set(JSON.parse(localStorage.getItem('hg_collection') || '[]')),  // placeId
  peopleOwned: new Set(JSON.parse(localStorage.getItem('hg_people') || '[]')),     // personId
  badgeXP: JSON.parse(localStorage.getItem('hg_badgeXP') || '{}'),                 // {Kategori: poeng}
};

function persist() {
  localStorage.setItem('hg_collection', JSON.stringify([...state.collection]));
  localStorage.setItem('hg_people', JSON.stringify([...state.peopleOwned]));
  localStorage.setItem('hg_badgeXP', JSON.stringify(state.badgeXP));
}

// ---------- Geolokasjon ----------
function getPosition() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });
}

function distanceMeters(a, b) {
  if (!a || !b) return null;
  const R = 6371000;
  const toRad = (x) => x * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat), lat2 = toRad(b.lat);
  const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ---------- Kart (Leaflet) ----------
let map, userMarker, markersLayer;

function initMap() {
  if (map) return map;
  map = L.map('map', { zoomControl: false, attributionControl: false }).setView([59.913, 10.75], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);
  markersLayer = L.layerGroup().addTo(map);

  // brukerpos
  userMarker = L.circleMarker([59.913, 10.75], {
    radius: 6, color: '#1976d2', fillColor: '#1976d2', fillOpacity: 0.9
  }).addTo(map);

  // sentrer-knapp
  $('#btnCenter').addEventListener('click', () => {
    if (!state.userPos) return;
    map.setView([state.userPos.lat, state.userPos.lon], Math.max(15, map.getZoom()));
    state.autoFollow = true;
    showToast('Auto-follow på');
  });

  // exit-knapp
  $('#btnExitMap').addEventListener('click', () => toggleMapOnly(false));

  return map;
}

function renderMarkers() {
  if (!map) initMap();
  markersLayer.clearLayers();

  state.places.forEach((p) => {
    // synlig liten prikk
    const dot = L.circleMarker([p.lat, p.lon], {
      radius: 6, color: '#2f6b95', fillColor: '#2f6b95', fillOpacity: 0.95
    }).addTo(markersLayer);

    // usynlig stor hitbox for fingre
    const hit = L.circle([p.lat, p.lon], {
      radius: Math.max(p.r || 120, 36),
      color: '#0000',
      fillColor: '#0000',
      fillOpacity: 0,
      interactive: true,
    }).addTo(markersLayer);

    const openCard = () => openPlaceCard(p);

    dot.on('click', openCard);
    hit.on('click', openCard);
  });
}

function updateUserOnMap() {
  if (!map || !state.userPos) return;
  userMarker.setLatLng([state.userPos.lat, state.userPos.lon]);
  if (state.mapOnly && state.autoFollow) {
    map.setView([state.userPos.lat, state.userPos.lon]);
  }
}

function toggleMapOnly(on) {
  state.mapOnly = on;
  document.body.classList.toggle('map-only', !!on);
  $('#btnExitMap').style.display = on ? 'block' : 'none';
  $('#btnCenter').style.display = on ? 'block' : 'none';
  if (on) {
    initMap();
    renderMarkers();
    updateUserOnMap();
  } else {
    state.autoFollow = false;
  }
}

// ---------- UI-renderere ----------
function renderNearby(limit = 2) {
  const box = $('#nearbyList');
  box.innerHTML = '';

  let items = state.places.map(p => {
    const dist = distanceMeters(state.userPos, {lat: p.lat, lon: p.lon});
    return { ...p, _dist: dist ?? Infinity };
  }).sort((a,b)=>a._dist-b._dist);

  const show = items.slice(0, limit);
  show.forEach(p => box.appendChild(placeCardItem(p)));

  // “Se flere i nærheten”
  $('#btnSeeMoreNearby').onclick = () => {
    const body = $('#sheetNearbyBody');
    body.innerHTML = '';
    items.slice(limit).forEach(p => body.appendChild(placeCardItem(p)));
    openSheet('#sheetNearby');
  };
}

function placeCardItem(p) {
  const distText = km(p._dist);
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <div class="row between">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category}</div>
    </div>
    <div class="desc">${p.desc || ''}</div>
    <div class="dist">${distText || ''}</div>
    <div class="row gap8 mt8">
      <button class="ghost-btn" data-open="${p.id}">Les mer</button>
      <button class="primary-btn" data-unlock="${p.id}">Lås opp</button>
    </div>
  `;
  el.querySelector('[data-open]').addEventListener('click', () => openPlaceCard(p));
  el.querySelector('[data-unlock]').addEventListener('click', () => unlockPlace(p.id));
  return el;
}

function openPlaceCard(p) {
  $('#pcTitle').textContent = p.name;
  $('#pcMeta').textContent = `${p.category} • ${p.r || 120}m radius`;
  $('#pcDesc').textContent = p.desc || '';
  $('#pcMore').onclick = () => {
    // evt. ekstern lenke senere
    showToast('Kommer: mer historikk/lenker');
  };
  $('#pcUnlock').onclick = () => unlockPlace(p.id);
  $('#pcClose').onclick = closePlaceCard;
  $('#placeCard').setAttribute('aria-hidden', 'false');
  $('#placeCard').classList.add('open');
}

function closePlaceCard() {
  $('#placeCard').classList.remove('open');
  $('#placeCard').setAttribute('aria-hidden', 'true');
}

function unlockPlace(id) {
  if (!state.collection.has(id)) {
    state.collection.add(id);
    persist();
    renderCollection();
    showToast('Låst opp sted!');
  } else {
    showToast('Allerede i samlingen');
  }
}

function renderCollection() {
  const grid = $('#collectionGrid');
  const countEl = $('#collectionCount');
  grid.innerHTML = '';

  const items = state.places.filter(p => state.collection.has(p.id));
  countEl.textContent = items.length;

  const MAX = 4;
  items.slice(0, MAX).forEach(p => {
    const b = document.createElement('button');
    b.className = `badge badge-${(p.category||'').toLowerCase().replace(/\s+/g,'-')}`;
    b.textContent = p.name;
    b.addEventListener('click', () => openPlaceCard(p));
    grid.appendChild(b);
  });

  const rest = Math.max(0, items.length - MAX);
  const moreBtn = $('#btnMoreCollection');
  if (rest > 0) {
    moreBtn.style.display = 'inline-flex';
    moreBtn.textContent = `+${rest} flere`;
    moreBtn.onclick = () => {
      const body = $('#sheetCollectionBody');
      body.innerHTML = '';
      items.slice(MAX).forEach(p => {
        const b = document.createElement('button');
        b.className = `badge badge-${(p.category||'').toLowerCase().replace(/\s+/g,'-')}`;
        b.textContent = p.name;
        b.addEventListener('click', () => openPlaceCard(p));
        body.appendChild(b);
      });
      openSheet('#sheetCollection');
    };
  } else {
    moreBtn.style.display = 'none';
  }
}

function renderBadges() {
  const wrap = $('#merits');
  wrap.innerHTML = '';
  // badges.json: [{id, category, levels:[...]}] – men vi renderer enkel progress ut fra state.badgeXP
  const cats = ['Historie', 'Kultur', 'Sport', 'Natur', 'Urban Life'];
  cats.forEach(cat => {
    const xp = Number(state.badgeXP[cat] || 0);
    const goal = 5; // enkel “bronse” terskel
    const pct = Math.max(0, Math.min(100, (xp/goal)*100));

    const c = document.createElement('div');
    c.className = 'diploma';
    c.innerHTML = `
      <div class="name">${cat}</div>
      <div class="meta">Progresjon: ${xp}/${goal}</div>
      <div class="progress"><span style="width:${pct}%"></span></div>
      <div class="muted">→ ${Math.max(0, goal-xp)} til bronse</div>
    `;
    wrap.appendChild(c);
  });
}

function renderPeopleGallery() {
  const box = $('#gallery');
  box.innerHTML = '';
  state.people.forEach(person => {
    const el = document.createElement('div');
    el.className = 'person-card';
    const owned = state.peopleOwned.has(person.id);
    el.innerHTML = `
      <div class="avatar">${(person.initials||'?').slice(0,2)}</div>
      <div>
        <div class="name">${person.name}</div>
        <div class="meta">${(person.tags||[]).join(' • ')}</div>
      </div>
      <button class="person-btn">${owned ? 'I samling' : 'Møt'}</button>
    `;
    el.querySelector('.person-btn').addEventListener('click', () => {
      meetPerson(person);
    });
    box.appendChild(el);
  });
}

function meetPerson(person) {
  if (!state.peopleOwned.has(person.id)) {
    state.peopleOwned.add(person.id);
    // gi 1 xp i kategori ut fra person.tags -> mapp til badge-kategori hvis mulig
    const cat = guessCategoryFromTags(person.tags);
    if (cat) state.badgeXP[cat] = (state.badgeXP[cat] || 0) + 1;
    persist();
    renderPeopleGallery();
    renderBadges();
    showToast(`Du møtte ${person.name}!`);
  } else {
    showToast(`${person.name} er allerede i samlingen`);
  }
}

function guessCategoryFromTags(tags = []) {
  const t = tags.map(s => s.toLowerCase());
  if (t.includes('sport') || t.includes('løp') || t.includes('ski') || t.includes('fotball')) return 'Sport';
  if (t.includes('natur')) return 'Natur';
  if (t.includes('urban life') || t.includes('artist') || t.includes('ikon') || t.includes('næringsliv')) return 'Urban Life';
  if (t.includes('kultur') || t.includes('maleri') || t.includes('teater') || t.includes('musik')) return 'Kultur';
  return 'Historie';
}

// ---------- Sheets ----------
function openSheet(sel) {
  const s = $(sel);
  if (!s) return;
  s.setAttribute('aria-hidden', 'false');
  s.classList.add('open');
}
function closeSheet(sel) {
  const s = $(sel);
  if (!s) return;
  s.classList.remove('open');
  s.setAttribute('aria-hidden', 'true');
}

// ---------- Init ----------
async function boot() {
  // kontroller
  $('#btnSeeMap')?.addEventListener('click', () => toggleMapOnly(true));
  $$('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => closeSheet(btn.getAttribute('data-close')));
  });
  $('#pcClose')?.addEventListener('click', closePlaceCard);

  // testmodus
  $('#testToggle')?.addEventListener('change', (e) => {
    state.testMode = e.target.checked;
    showToast(state.testMode ? 'Testmodus på' : 'Testmodus av');
  });

  // last data
  const status = $('#status');
  try {
    status.textContent = 'Laster data…';
    const [places, people, quizzes, badges] = await Promise.all([
      fetchJSON('./places.json'),
      fetchJSON('./people.json'),
      fetchJSON('./quizzes.json'),
      fetchJSON('./badges.json'),
    ]);
    state.places = places;
    state.people = people;
    state.quizzes = quizzes;
    state.badges = badges;
  } catch (e) {
    console.error(e);
    status.textContent = 'Kunne ikke laste data.';
    showToast('Kunne ikke laste data.');
    return;
  }

  // posisjon
  state.userPos = await getPosition();
  if (state.userPos) {
    status.textContent = 'Posisjon funnet.';
  } else {
    status.textContent = 'Posisjon ukjent (viser likevel).';
  }

  // render
  renderNearby(2);
  renderCollection();
  renderBadges();
  renderPeopleGallery();

  // kart init “late”
  initMap();
  renderMarkers();
  updateUserOnMap();

  // geowatch for autofollow i kart-modus
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition((pos) => {
      state.userPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      updateUserOnMap();
    });
  }
}

document.addEventListener('DOMContentLoaded', boot);
