// Last steder fra places.json
let PLACES = [];
fetch('places.json').then(r => r.json()).then(data => { 
  PLACES = data; 
  boot(); 
});

// --- LocalStorage state ---
const visited = JSON.parse(localStorage.getItem("visited_places") || "{}");
const diplomas = JSON.parse(localStorage.getItem("diplomas_by_category") || "{}");

// --- DOM refs ---
const elList = document.getElementById("list");
const elStatus = document.getElementById("status");
const elCollection = document.getElementById("collection");
const elCount = document.getElementById("count");
const elDiplomas = document.getElementById("diplomas");
const testToggle = document.getElementById("testToggle");

// --- Diplom terskler ---
const DIPLOMA_THRESHOLDS = { bronse: 10, sølv: 25, gull: 50 };

function saveVisited(){ 
  localStorage.setItem("visited_places", JSON.stringify(visited)); 
  renderCollection(); 
}
function saveDiplomas(){
  localStorage.setItem("diplomas_by_category", JSON.stringify(diplomas));
}

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
  for (const p of PLACES){
    if (visited[p.id]) counts[p.category] = (counts[p.category]||0)+1;
  }
  return counts;
}
function tierForCount(n){
  if (n >= DIPLOMA_THRESHOLDS.gull) return "gull";
  if (n >= DIPLOMA_THRESHOLDS.sølv) return "sølv";
  if (n >= DIPLOMA_THRESHOLDS.bronse) return "bronse";
  return null;
}
function tierRank(t){ return ({bronse:1, sølv:2, gull:3}[t]||0); }

// --- Toast ---
let lastAwardAt=0;
function showToast(msg="Låst opp ✅"){
  const t=document.getElementById("toast");
  t.textContent=msg; t.style.display="block";
  setTimeout(()=>t.style.display="none",1600);
}

// --- Renderere ---
function renderCollection(){
  const items = PLACES.filter(p=>visited[p.id]);
  elCollection.innerHTML = items.length
    ? items.map(p=>`<div class="badge">${p.name}</div>`).join("")
    : `<div class="muted">Besøk et sted for å låse opp ditt første ikon.</div>`;
  elCount.textContent = items.length;
}
function renderList(user){
  const sorted=PLACES.map(p=>{
    const d=user?Math.round(distMeters(user,{lat:p.lat,lon:p.lon})):null;
    return {...p,d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));
  elList.innerHTML = sorted.map(p=>`
    <div class="card">
      <div style="flex:1">
        <div class="name">${p.name}</div>
        <div class="meta">${p.category} • radius ${testToggle.checked?Math.max(p.r,5000):p.r} m</div>
        <div class="desc">${p.desc}</div>
        <div class="dist">${p.d==null?"–":`Avstand: ${p.d} m`}</div>
      </div>
    </div>`).join("");
}
function renderDiplomas(){
  const counts = countVisitedByCategory();
  const allCats = [...new Set(PLACES.map(p=>p.category))];
  elDiplomas.innerHTML = allCats.map(cat=>{
    const n=counts[cat]||0;
    const tier=diplomas[cat]||null;
    const next = 
      n < DIPLOMA_THRESHOLDS.bronse ? `→ ${DIPLOMA_THRESHOLDS.bronse-n} til bronse`
    : n < DIPLOMA_THRESHOLDS.sølv   ? `→ ${DIPLOMA_THRESHOLDS.sølv-n} til sølv`
    : n < DIPLOMA_THRESHOLDS.gull   ? `→ ${DIPLOMA_THRESHOLDS.gull-n} til gull`
    : "Maks!";
    const tierLabel = tier?`• <span class="tier">${tier.toUpperCase()}</span>`:"";
    return `<div class="diploma"><div><strong>${cat}</strong> <span class="tag">${n} steder</span> ${tierLabel}</div><div class="muted">${next}</div></div>`;
  }).join("");
}

// --- Badges og diplomer ---
function awardBadge(place){
  if (visited[place.id]) return false;
  visited[place.id]=true; saveVisited();
  const now=Date.now();
  if(now-lastAwardAt>1200){ showToast(`Låst opp: ${place.name} ✅`); lastAwardAt=now; }

  // sjekk diplom
  const counts=countVisitedByCategory();
  const cat=place.category;
  const newTier=tierForCount(counts[cat]||0);
  const oldTier=diplomas[cat]||null;
  if(newTier && tierRank(newTier)>tierRank(oldTier)){
    diplomas[cat]=newTier; saveDiplomas();
    showToast(`🎖️ ${cat}: ${newTier.toUpperCase()}!`);
    renderDiplomas();
  }
  return true;
}
function checkProximity(user){
  const radiusBoost=testToggle.checked?5000:0;
  for(const p of PLACES){
    const r=Math.max(p.r,radiusBoost?Math.max(p.r,radiusBoost):p.r);
    const d=Math.round(distMeters(user,{lat:p.lat,lon:p.lon}));
    if(d<=r) awardBadge(p);
  }
  renderList(user); renderDiplomas();
}

// --- Init ---
function boot(){
  renderCollection();
  renderDiplomas();
  if("geolocation" in navigator){
    navigator.geolocation.watchPosition(pos=>{
      const {latitude,longitude}=pos.coords;
      window.__lastPos={lat:latitude,lon:longitude};
      elStatus.textContent=`Din posisjon: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      checkProximity(window.__lastPos);
    }, err=>{ elStatus.textContent="Kunne ikke hente posisjon: "+err.message; },
    { enableHighAccuracy:true, maximumAge:5000, timeout:15000 });
  } else {
    elStatus.textContent="Nettleseren støtter ikke geolokasjon.";
  }
  testToggle.addEventListener("change",()=>renderList(window.__lastPos));
}
