// Last steder fra places.json (du kan endre filen når som helst)
let PLACES = [];
fetch('places.json').then(r => r.json()).then(data => { PLACES = data; boot(); });

const visited = JSON.parse(localStorage.getItem("visited_places") || "{}");
const elList = document.getElementById("list");
const elStatus = document.getElementById("status");
const elCollection = document.getElementById("collection");
const elCount = document.getElementById("count");
const testToggle = document.getElementById("testToggle");

function saveVisited(){ localStorage.setItem("visited_places", JSON.stringify(visited)); renderCollection(); }
function distMeters(a, b){
  const R=6371000, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
}
function renderCollection(){
  const items = PLACES.filter(p=>visited[p.id]);
  elCollection.innerHTML = items.length
    ? items.map(p=>`<div class="badge">${p.name}</div>`).join("")
    : `<div class="muted">Besøk et sted for å låse opp ditt første ikon.</div>`;
  elCount.textContent = items.length;
}
function renderList(user){
  const sorted = PLACES.map(p=>{
    const d = user ? Math.round(distMeters(user,{lat:p.lat,lon:p.lon})) : null;
    return {...p, d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));
  elList.innerHTML = sorted.map(p=>`
    <div class="card">
      <div style="flex:1">
        <div class="name">${p.name}</div>
        <div class="meta">${p.category} • radius ${testToggle.checked?Math.max(p.r,5000):p.r} m</div>
        <div class="desc">${p.desc}</div>
        <div class="dist">${p.d==null?"–":`Avstand: ${p.d} m`}</div>
      </div>
      <button class="btn ${visited[p.id]?'ghost':'primary'}" onclick="unlock('${p.id}',${p.lat},${p.lon},${p.r})">
        ${visited[p.id]?'Låst opp':'Lås opp'}
      </button>
    </div>`).join("");
}
window.unlock = (id,lat,lon,r)=>{
  if(!window.__lastPos){ alert("Vent, henter posisjon…"); return; }
  const radius = testToggle.checked ? Math.max(r,5000) : r;
  const d = Math.round(distMeters(window.__lastPos,{lat,lon}));
  if(d <= radius){ visited[id]=true; saveVisited(); alert("Låst opp ✅"); renderList(window.__lastPos); }
  else{ alert(`For langt unna: ~${d} m (radius ${radius} m).`); }
};
function boot(){
  renderCollection();
  if("geolocation" in navigator){
    navigator.geolocation.watchPosition(pos=>{
      const {latitude, longitude} = pos.coords;
      window.__lastPos = {lat:latitude, lon:longitude};
      elStatus.textContent = `Din posisjon: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
      renderList(window.__lastPos);
    }, err=>{ elStatus.textContent = "Kunne ikke hente posisjon: " + err.message; },
    { enableHighAccuracy:true, maximumAge:5000, timeout:15000 });
  } else { elStatus.textContent = "Nettleseren støtter ikke geolokasjon."; }
  testToggle.addEventListener("change", ()=>renderList(window.__lastPos));
}
