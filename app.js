// ==============================
// History Go – app.js (full)
// Steder + Diplomer + Personer (Galleri) + kategori-farger/ikoner
// ==============================

// Last steder og personer
let PLACES = [];
let PEOPLE = [];

Promise.all([
  fetch('places.json').then(r => r.json()),
  fetch('people.json').then(r => r.json()).catch(() => []) // valgfri
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

// --- Diplom terskler ---
const DIPLOMA_THRESHOLDS = { bronse: 10, sølv: 25, gull: 50 };

// --- Hjelpere ---
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

// Kategori → klasse / ikon (brukes i UI)
function catClass(cat){
  const k=(cat||"").toLowerCase();
  if (k.startsWith("hist")) return "cat-historie";
  if (k.startsWith("kul"))  return "cat-kultur";
  if (k.startsWith("sev"))  return "cat-severdigheter";
  if (k.startsWith("sport"))return "cat-sport";
  if (k.startsWith("natur"))return "cat-natur";
  return "";
}
function catIcon(cat){
  const k=(cat||"").toLowerCase();
  if (k.startsWith("hist")) return "🏛️";
  if (k.startsWith("kul"))  return "🎨";
  if (k.startsWith("sev"))  return "📍";
  if (k.startsWith("sport"))return "🏟️";
  if (k.startsWith("natur"))return "🌳";
  return "📌";
}

// Tidsvindu for personer (events/figurer)
function isActive(person, now=new Date()){
  if (!person.window || !person.window.length) return true;
  for (const w of person.window){
    let s=new Date(w.start), e=new Date(w.end);
    if (w.repeat === "yearly"){ s.setFullYear(now.getFullYear()); e.setFullYear(now.getFullYear()); }
    if (now >= s && now <= e) return true;
  }
  return false;
}

// --- Toast ---
let lastAwardAt = 0;
function showToast(msg="Låst opp ✅"){
  const t=document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.style.display = "block";
  setTimeout(()=> t.style.display = "none", 1600);
}

// --- Renderere ---
function renderCollection(){
  const items = PLACES.filter(p=>visited[p.id]);
  elCollection.innerHTML = items.length
    ? items.map(p=>`<div class="badge ${catClass(p.category)}">${catIcon(p.category)} ${p.name}</div>`).join("")
    : `<div class="muted">Besøk et sted for å låse opp ditt første merke.</div>`;
  elCount.textContent = items.length;
}

function renderList(user){
  const sorted = PLACES.map(p=>{
    const d = user ? Math.round(distMeters(user,{lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));

  elList.innerHTML = sorted.map(p=>{
    const c = catClass(p.category);
    const ico = catIcon(p.category);
    const radius = testToggle.checked ? Math.max(p.r,5000) : p.r;
    const dist = p.d==null ? "–" : `Avstand: ${p.d} m`;
    return `
      <div class="card ${c}">
        <div style="flex:1">
          <div class="name">${ico} ${p.name}</div>
          <div class="meta">${p.category} • radius ${radius} m</div>
          <div class="desc">${p.desc}</div>
          <div class="dist">${dist}</div>
        </div>
        <div class="badge ${c.replace('card','badge')}">Lås opp</div>
      </div>`;
  }).join("");
}

function renderDiplomas(){
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
      ? `<span class="tier ${tier}">${tierEmoji(tier)} ${tier.toUpperCase()}</span>`
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
  if (!elGallery) return;
  const got = PEOPLE.filter(p => peopleCollected[p.id]);
  elGallery.innerHTML = got.length
    ? got.map(p => `
        <div class="card" style="align-items:center;gap:12px">
          <div style="width:48px;height:48px;border-radius:50%;background:#1976d2;color:#fff;
                      display:flex;align-items:center;justify-content:center;font-weight:900;">
            ${p.initials || (p.name||"")[0]}
          </div>
          <div style="flex:1">
            <div class="name">${p.name}</div>
            <div class="meta">${p.desc || ""}</div>
          </div>
          <div class="badge">Samlet</div>
        </div>
      `).join("")
    : `<div class="muted">Samle personer ved events og høytider (f.eks. Julenissen i desember).</div>`;
}

// --- Utdeling: steder (merker) + diplomer ---
function awardBadge(place){
  if (visited[place.id]) return false;
  visited[place.id] = true;
  saveVisited();

  const now=Date.now();
  if(now - lastAwardAt > 1200){ showToast(`Låst opp: ${place.name} ✅`); lastAwardAt = now; }

  // sjekk diplom
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
  const radiusBoost = testToggle.checked ? 5000 : 0;
  for(const p of PLACES){
    const r = Math.max(p.r, radiusBoost ? Math.max(p.r, radiusBoost) : p.r);
    const d = Math.round(distMeters(user,{lat:p.lat,lon:p.lon}));
    if (d <= r) awardBadge(p);
  }
  renderList(user);
  renderDiplomas();
}

// --- Utdeling: personer (Galleri) ---
function awardPerson(p){
  if (peopleCollected[p.id]) return false;
  peopleCollected[p.id] = Date.now();
  savePeople();
  showToast(`Samlet: ${p.name} ✅`);
  renderGallery();
  return true;
}

function checkProximityPeople(user){
  const radiusBoost = testToggle.checked ? 5000 : 0;
  const now = new Date();
  for (const p of PEOPLE){
    if (!isActive(p, now)) continue;
    const r = Math.max(p.r, radiusBoost ? Math.max(p.r, radiusBoost) : p.r);
    const d = Math.round(distMeters(user,{lat:p.lat, lon:p.lon}));
    if (d <= r) awardPerson(p);
  }
}

// --- Init ---
function boot(){
  renderCollection();
  renderDiplomas();
  renderGallery();

  if ("geolocation" in navigator){
    navigator.geolocation.watchPosition(pos=>{
      const {latitude, longitude} = pos.coords;
      window.__lastPos = {lat:latitude, lon:longitude};
      elStatus.textContent = `Din posisjon: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      checkProximity(window.__lastPos);
      checkProximityPeople(window.__lastPos);
    }, err=>{
      elStatus.textContent = "Kunne ikke hente posisjon: " + err.message;
    }, { enableHighAccuracy:true, maximumAge:5000, timeout:15000 });
  } else {
    elStatus.textContent = "Nettleseren støtter ikke geolokasjon.";
  }

  testToggle.addEventListener("change", ()=>renderList(window.__lastPos));
}
