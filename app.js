// ==============================
// History Go – app.js (full pakke)
// Steder + Diplomer + Personer + Kart (Leaflet) + Sheet-meny + Filter
// ==============================

// --- Data ---
let PLACES = [];
let PEOPLE = [];

Promise.all([
  fetch('places.json').then(r => r.json()),
  fetch('people.json').then(r => r.json()).catch(() => []) // people.json er valgfri
]).then(([places, people]) => {
  PLACES = places;
  PEOPLE = people;
  boot();
});

// --- LocalStorage state ---
const visited         = JSON.parse(localStorage.getItem("visited_places") || "{}");
const diplomas        = JSON.parse(localStorage.getItem("diplomas_by_category") || "{}");
const peopleCollected = JSON.parse(localStorage.getItem("people_collected") || "{}");

function saveVisited()  { localStorage.setItem("visited_places", JSON.stringify(visited));  renderCollection(); }
function saveDiplomas() { localStorage.setItem("diplomas_by_category", JSON.stringify(diplomas)); }
function savePeople()   { localStorage.setItem("people_collected", JSON.stringify(peopleCollected)); }

// --- DOM refs ---
const elList       = document.getElementById("list");
const elStatus     = document.getElementById("status");
const elCollection = document.getElementById("collection");
const elCount      = document.getElementById("count");
const elDiplomas   = document.getElementById("diplomas");
const elGallery    = document.getElementById("gallery");
const testToggle   = document.getElementById("testToggle");

// --- Visnings-/filterstate ---
let CURRENT_VIEW = "nearby"; // "nearby" | "collection" | "people" | "diplomas"
let ACTIVE_CAT   = "";       // "" = alle

// --- Diplom terskler ---
const DIPLOMA_THRESHOLDS = { bronse: 10, sølv: 25, gull: 50 };

// ==============================
// Hjelpere
// ==============================
function distMeters(a, b){
  const R=6371000, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function countVisitedByCategory(){
  const counts = {};
  for (const p of PLACES) if (visited[p.id]) counts[p.category] = (counts[p.category]||0)+1;
  return counts;
}
function tierForCount(n){
  if (n >= DIPLOMA_THRESHOLDS.gull)  return "gull";
  if (n >= DIPLOMA_THRESHOLDS.sølv)  return "sølv";
  if (n >= DIPLOMA_THRESHOLDS.bronse) return "bronse";
  return null;
}
function tierRank(t){ return ({bronse:1, sølv:2, gull:3}[t]||0); }
function tierEmoji(t){ return t==="gull"?"🥇":t==="sølv"?"🥈":t==="bronse"?"🥉":""; }

function catClass(cat){
  const k=(cat||"").toLowerCase();
  if (k.startsWith("hist")) return "cat-historie";
  if (k.startsWith("kul"))  return "cat-kultur";
  if (k.startsWith("sev"))  return "cat-severdigheter";
  if (k.startsWith("sport"))return "cat-sport";
  if (k.startsWith("natur"))return "cat-natur";
  return "";
}
function catColor(cat){
  const c=(cat||"").toLowerCase();
  if (c.includes("kultur")) return "#e63946";
  if (c.includes("severdig")) return "#ffb703";
  if (c.includes("sport") || c.includes("natur")) return "#2a9d8f";
  return "#1976d2"; // historie/default
}

// Sesong/tidsvindu for personer (events/figurer)
function isActive(person, now=new Date()){
  if (!person.window || !person.window.length) return true;
  for (const w of person.window){
    let s=new Date(w.start), e=new Date(w.end);
    if (w.repeat === "yearly"){ s.setFullYear(now.getFullYear()); e.setFullYear(now.getFullYear()); }
    if (now >= s && now <= e) return true;
  }
  return false;
}

// ==============================
// Toast
// ==============================
let lastAwardAt = 0;
function showToast(msg="Låst opp ✅"){
  const t=document.getElementById("toast");
  if(!t) return;
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(()=> t.style.display = "none", 1600);
}

// ==============================
// Leaflet-kart
// ==============================
let MAP, placeLayer, peopleLayer, userMarker, userCircle;

function initMap(start={lat:59.9139, lon:10.7522, zoom:13}){
  MAP = L.map('map', { zoomControl:false, worldCopyJump:true })
          .setView([start.lat, start.lon], start.zoom);

  // Mørk basemap
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap, &copy; CARTO'
  }).addTo(MAP);

  placeLayer  = L.layerGroup().addTo(MAP);
  peopleLayer = L.layerGroup().addTo(MAP);

  redrawPlaces();
  redrawPeople();
}

function placeMarker(p){
  return L.circleMarker([p.lat, p.lon], {
    radius: 8,
    color: catColor(p.category),
    weight: 3,
    opacity: 1,
    fillColor: "#111",
    fillOpacity: 0.9
  });
}

function redrawPlaces(){
  if (!MAP) return;
  placeLayer.clearLayers();

  const data = ACTIVE_CAT
    ? PLACES.filter(p => (p.category||'').toLowerCase().includes(ACTIVE_CAT.toLowerCase()))
    : PLACES;

  data.forEach(p=>{
    const m = placeMarker(p).addTo(placeLayer);

    // radius (synlig guide)
    const r = p.r || 120;
    L.circle([p.lat,p.lon], {
      radius: r,
      color: catColor(p.category),
      weight: 1.5,
      opacity: 0.6,
      fillOpacity: 0
    }).addTo(placeLayer);

    // popup (Lås opp)
    m.bindPopup(`
      <div style="min-width:200px">
        <div style="font-weight:900">${p.name}</div>
        <div style="opacity:.8">${p.category || ""} • radius ${r} m</div>
        <div style="margin-top:8px">${p.desc||""}</div>
        <div style="margin-top:10px">
          <button id="unlock_${p.id}" class="btn primary" style="width:100%">Lås opp</button>
        </div>
      </div>
    `);

    m.on('popupopen', ()=>{
      const btn = document.getElementById(`unlock_${p.id}`);
      if (!btn) return;
      btn.onclick = ()=>{
        const pos = window.__lastPos;
        const boost = testToggle?.checked ? 5000 : 0;
        const rEff = Math.max(p.r || 120, boost);
        if (!pos){ awardBadge(p); return; }
        const d = Math.round(distMeters(pos, {lat:p.lat, lon:p.lon}));
        if (d <= rEff) awardBadge(p);
        else showToast(`Du er ${d} m unna (trenger ${rEff} m)`);
      };
    });
  });
}

function redrawPeople(){
  if (!MAP) return;
  peopleLayer.clearLayers();
  if (!PEOPLE?.length) return;

  const now = new Date();
  PEOPLE.forEach(pr=>{
    if (!isActive(pr, now)) return;

    const m = L.circleMarker([pr.lat, pr.lon], {
      radius: 7,
      color: "#ffb703",
      weight: 3,
      fillColor: "#111",
      fillOpacity: .9
    }).addTo(peopleLayer);

    m.bindPopup(`
      <div style="min-width:200px">
        <div style="font-weight:900">${pr.name}</div>
        <div style="opacity:.8">${(pr.tags||[]).join(", ")}</div>
        <div style="margin-top:8px">${pr.desc||""}</div>
        <div style="margin-top:10px">
          <button id="collect_${pr.id}" class="btn" style="background:#2a9d8f;color:#fff;width:100%">Samle</button>
        </div>
      </div>
    `);

    m.on('popupopen', ()=>{
      const btn = document.getElementById(`collect_${pr.id}`);
      if (!btn) return;
      btn.onclick = ()=>{
        const pos = window.__lastPos;
        const boost = testToggle?.checked ? 5000 : 0;
        const rEff = Math.max(pr.r || 150, boost);
        if (!pos){ awardPerson(pr); return; }
        const d = Math.round(distMeters(pos, {lat:pr.lat, lon:pr.lon}));
        if (d <= rEff) awardPerson(pr);
        else showToast(`Du er ${d} m unna (trenger ${rEff} m)`);
      };
    });
  });
}

function updateUserOnMap(pos){
  if (!MAP) return;
  const {lat, lon} = pos;

  if (!userMarker){
    userMarker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: "",
        html: `<div style="
          width:16px;height:16px;border-radius:50%;
          background:#00e676;box-shadow:0 0 0 3px rgba(0,230,118,.35);
          border:2px solid #063;"></div>`
      })
    }).addTo(MAP);
    userCircle = L.circle([lat, lon], {
      radius: 25,
      color: "#00e676",
      weight: 1,
      opacity: .6,
      fillColor: "#00e676",
      fillOpacity: .12
    }).addTo(MAP);
  } else {
    userMarker.setLatLng([lat, lon]);
    userCircle.setLatLng([lat, lon]);
  }
}

// ==============================
// Renderere (med view/filter)
// ==============================
function showView(v){
  CURRENT_VIEW = v;

  const sec = {
    nearby:     document.querySelector('#list')?.closest('.section'),
    collection: document.querySelector('#collection')?.closest('.section'),
    diplomas:   document.querySelector('#diplomas')?.closest('.section'),
    people:     document.querySelector('#gallery')?.closest('.section'),
  };
  for (const k of Object.keys(sec)){
    if (!sec[k]) continue;
    sec[k].style.display = (k===v ? 'block' : 'none');
  }

  // Render riktig innhold
  renderList(window.__lastPos);
  renderCollection();
  renderDiplomas();
  renderGallery();
}

function renderCollection(){
  if (CURRENT_VIEW !== "collection") return;
  const items = PLACES.filter(p=>visited[p.id]);
  elCollection.innerHTML = items.length
    ? items.map(p=>`<div class="badge ${catClass(p.category)}">${p.name}</div>`).join("")
    : `<div class="muted">Besøk et sted for å låse opp ditt første merke.</div>`;
  elCount.textContent = items.length;
}

function renderList(user){
  const base = ACTIVE_CAT
    ? PLACES.filter(p => (p.category||'').toLowerCase().includes(ACTIVE_CAT.toLowerCase()))
    : PLACES;

  const sorted = base.map(p=>{
    const d = user ? Math.round(distMeters(user,{lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));

  // Kun i "nearby"-visning
  if (CURRENT_VIEW !== "nearby") { elList.innerHTML = ""; return; }

  elList.innerHTML = sorted.map(p=>{
    const c = catClass(p.category);
    const radius = testToggle?.checked ? Math.max(p.r,5000) : p.r;
    const dist = p.d==null ? "–" : `Avstand: ${p.d} m`;
    return `
      <div class="card ${c}">
        <div style="flex:1">
          <div class="name">${p.name}</div>
          <div class="meta">${p.category || ""} • radius ${radius} m</div>
          <div class="desc">${p.desc || ""}</div>
          <div class="dist">${dist}</div>
        </div>
      </div>`;
  }).join("");
}

function renderDiplomas(){
  if (CURRENT_VIEW !== "diplomas") return;

  const counts = countVisitedByCategory();
  const allCats = [...new Set(PLACES.map(p=>p.category))];

  elDiplomas.innerHTML = allCats.map(cat=>{
    const n    = counts[cat] || 0;
    const tier = diplomas[cat] || null;

    const next =
      n < DIPLOMA_THRESHOLDS.bronse ? `→ ${DIPLOMA_THRESHOLDS.bronse-n} til bronse`
    : n < DIPLOMA_THRESHOLDS.sølv   ? `→ ${DIPLOMA_THRESHOLDS.sølv-n} til sølv`
    : n < DIPLOMA_THRESHOLDS.gull   ? `→ ${DIPLOMA_THRESHOLDS.gull-n} til gull`
    : "Maks!";

    const tierLabel = tier
      ? `<span class="tier ${tier}">${tierEmoji(tier)} ${tier?.toUpperCase()}</span>`
      : "";
    const tierClass = tier ? ` ${tier}` : "";

    return `
      <div class="diploma${tierClass}">
        <div><strong>${cat}</strong> <span class="tag">${n} steder</span> ${tierLabel}</div>
        <div class="muted">${next}</div>
      </div>`;
  }).join("");
}

function renderGallery(){
  if (CURRENT_VIEW !== "people" || !elGallery) return;
  const got = PEOPLE.filter(p => peopleCollected[p.id]);

  elGallery.innerHTML = got.length
    ? got.map(p => `
      <div class="person-card">
        <div class="avatar">${(p.initials || (p.name||"")[0]).slice(0,2).toUpperCase()}</div>
        <div class="info">
          <div class="name">${p.name}</div>
          <div class="sub">${p.desc || ""}</div>
          <div style="margin-top:6px">
            ${(p.tags||[]).map(t=>{
              const map={person:"pill person",event:"pill event",sesong:"pill event",now:"pill now",soon:"pill soon"};
              const cls = map[t] || "pill";
              const label = t.charAt(0).toUpperCase()+t.slice(1);
              return `<span class="${cls}">${label}</span>`;
            }).join("")}
          </div>
        </div>
        <div class="person-actions">
          <button class="person-btn">Samlet</button>
        </div>
      </div>
    `).join("")
    : `<div class="muted">Samle personer ved events og høytider (f.eks. Julenissen i desember).</div>`;
}

// ==============================
// Utdeling (steder/personer) + nærhet
// ==============================
function awardBadge(place){
  if (visited[place.id]) return false;
  visited[place.id] = true;
  saveVisited();

  const now=Date.now();
  if(now - lastAwardAt > 1200){ showToast(`Låst opp: ${place.name} ✅`); lastAwardAt = now; }

  // Oppdater diplom
  const counts  = countVisitedByCategory();
  const cat     = place.category;
  const newTier = tierForCount(counts[cat]||0);
  const oldTier = diplomas[cat] || null;

  if(newTier && tierRank(newTier) > tierRank(oldTier)){
    diplomas[cat] = newTier; saveDiplomas();
    showToast(`${tierEmoji(newTier)} ${cat}: ${newTier.toUpperCase()}!`);
    renderDiplomas();
  }
  return true;
}

function checkProximity(user){
  const radiusBoost = testToggle?.checked ? 5000 : 0;
  for(const p of PLACES){
    const r = Math.max(p.r, radiusBoost ? Math.max(p.r, radiusBoost) : p.r);
    const d = Math.round(distMeters(user,{lat:p.lat,lon:p.lon}));
    if (d <= r) awardBadge(p);
  }
  renderList(user);
  renderDiplomas();
}

function awardPerson(p){
  if (peopleCollected[p.id]) return false;
  peopleCollected[p.id] = Date.now();
  savePeople();
  showToast(`Samlet: ${p.name} ✅`);
  renderGallery();
  return true;
}

function checkProximityPeople(user){
  const radiusBoost = testToggle?.checked ? 5000 : 0;
  const now = new Date();
  for (const p of PEOPLE){
    if (!isActive(p, now)) continue;
    const r = Math.max(p.r, radiusBoost ? Math.max(p.r, radiusBoost) : p.r);
    const d = Math.round(distMeters(user, {lat:p.lat, lon:p.lon}));
    if (d <= r) awardPerson(p);
  }
}

// ==============================
// Sheet / FAB
// ==============================
function wireSheet(){
  const sheet = document.getElementById('sheet');
  const fab   = document.getElementById('fabMenu');
  const close = document.getElementById('sheetClose');
  const apply = document.getElementById('sheetApply');
  const catSel= document.getElementById('catFilter');

  fab?.addEventListener('click', ()=> sheet?.setAttribute('aria-hidden','false'));
  close?.addEventListener('click', ()=> sheet?.setAttribute('aria-hidden','true'));

  // Bytt visning
  sheet?.querySelectorAll('.sheet-item').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const v = btn.getAttribute('data-view');
      if (v){ showView(v); }
    });
  });

  // Bruk kategori-filter
  apply?.addEventListener('click', ()=>{
    ACTIVE_CAT = catSel?.value || "";
    sheet?.setAttribute('aria-hidden','true');
    renderList(window.__lastPos);
    redrawPlaces(); // filtrer pins
  });
}

// ==============================
// Init
// ==============================
function boot(){
  // Kart først
  initMap({lat:59.9139, lon:10.7522, zoom:13});

  // Startvisning
  showView("nearby");
  wireSheet();

  if ("geolocation" in navigator){
    navigator.geolocation.watchPosition(pos=>{
      const {latitude, longitude} = pos.coords;
      window.__lastPos = {lat:latitude, lon:longitude};
      elStatus.textContent = `Din posisjon: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;

      // Kart-posisjon
      updateUserOnMap(window.__lastPos);

      // Nærhet
      checkProximity(window.__lastPos);
      checkProximityPeople(window.__lastPos);
    }, err=>{
      elStatus.textContent = "Kunne ikke hente posisjon: " + err.message;
    }, { enableHighAccuracy:true, maximumAge:5000, timeout:15000 });
  } else {
    elStatus.textContent = "Nettleseren støtter ikke geolokasjon.";
  }

  // Testmodus toggle
  testToggle?.addEventListener("change", ()=>{
    renderList(window.__lastPos);
    redrawPlaces(); // oppdatér effektiv radius i popups
  });
}
