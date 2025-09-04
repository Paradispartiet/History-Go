// ==============================
// History Go – app.js (kart under + paneler over)
// ==============================

let PLACES = [];
let PEOPLE = [];

// Last inn data
Promise.all([
  fetch('places.json').then(r => r.json()),
  fetch('people.json').then(r => r.json()).catch(()=>[])
]).then(([places, people]) => {
  PLACES = places;
  PEOPLE = people;
  init();
});

// DOM refs
const el = {
  map:       document.getElementById("map"),
  status:    document.getElementById("status"),
  list:      document.getElementById("list"),
  collection:document.getElementById("collection"),
  count:     document.getElementById("count"),
  diplomas:  document.getElementById("diplomas"),
  gallery:   document.getElementById("gallery"),
  toast:     document.getElementById("toast"),
  testToggle:document.getElementById("testToggle"),
};

// Kart
let MAP, userMarker;
function initMap(center=[59.9139,10.7522], zoom=13){
  MAP = L.map('map',{zoomControl:false,attributionControl:false}).setView(center,zoom);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{
    attribution:'© OpenStreetMap © CARTO'
  }).addTo(MAP);

  // Steder
  PLACES.forEach(p=>{
    L.circleMarker([p.lat,p.lon],{
      radius:7, weight:1, color:"#111",
      fillColor:pickColor(p.category), fillOpacity:.9
    }).addTo(MAP).bindPopup(`<strong>${p.name}</strong><br>${p.category}`);
  });
}
function setUserMarker(lat,lon){
  if (!MAP) return;
  if (!userMarker){
    userMarker = L.circleMarker([lat,lon],{
      radius:8, color:"#fff", weight:2, fillColor:"#00e676", fillOpacity:1
    }).addTo(MAP).bindPopup("Du er her");
  } else {
    userMarker.setLatLng([lat,lon]);
  }
}

// Verktøy
function pickColor(cat=""){
  const c=cat.toLowerCase();
  if(c.includes("hist"))return"#1976d2";
  if(c.includes("kul")) return"#e63946";
  if(c.includes("sev")) return"#ffb703";
  if(c.includes("sport")||c.includes("natur")) return"#2a9d8f";
  return"#999";
}
function haversine(a,b){
  const toRad=d=>d*Math.PI/180,R=6371e3;
  const dLat=toRad(b.lat-a.lat),dLon=toRad(b.lon-a.lon);
  const s1=toRad(a.lat),s2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2+Math.cos(s1)*Math.cos(s2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
function fmtDist(m){
  if(m==null)return"–";
  return m<1000?`${Math.round(m)} m unna`:`${(m/1000).toFixed(1)} km unna`;
}
function showToast(msg="OK"){
  el.toast.textContent=msg;
  el.toast.style.display="block";
  setTimeout(()=>el.toast.style.display="none",1500);
}

// Render
let currentPos=null;
function renderNearby(){
  const data=currentPos
    ? PLACES.map(p=>({...p,_d:Math.round(haversine(currentPos,{lat:p.lat,lon:p.lon}))}))
            .sort((a,b)=>(a._d??1e12)-(b._d??1e12))
    : PLACES;
  el.list.innerHTML=data.map(p=>`
    <div class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||""} • Oslo</div>
      <div class="desc">${p.desc||""}</div>
      <div class="dist">${fmtDist(p._d)}</div>
    </div>
  `).join("");
}
function renderCollection(){
  el.collection.innerHTML=PLACES.map(p=>`<span class="badge">${p.name}</span>`).join("");
  el.count.textContent=PLACES.length;
}
function renderDiplomas(){
  el.diplomas.innerHTML=`
    <div class="diploma bronse"><div class="name">Oslo – Grunnpakke 🥉</div><div class="meta">Fullfør 5 steder</div></div>
    <div class="diploma sølv"><div class="name">Kulturstien 🥈</div><div class="meta">Fullfør 8 kultursteder</div></div>
    <div class="diploma gull"><div class="name">Historie-mester 🥇</div><div class="meta">Fullfør 12 historiske steder</div></div>
  `;
}
function renderGallery(){
  el.gallery.innerHTML=PEOPLE.map(p=>`
    <div class="person-card">
      <div class="avatar">${(p.initials||p.name.slice(0,2)).toUpperCase()}</div>
      <div class="info"><div class="name">${p.name}</div><div class="sub">${p.sub||""}</div></div>
      <button class="person-btn">Gå til</button>
    </div>
  `).join("");
}

// Geo
function requestLocation(){
  if(!navigator.geolocation){el.status.textContent="Ingen geolokasjon";renderNearby();return;}
  el.status.textContent="Henter posisjon…";
  navigator.geolocation.getCurrentPosition(pos=>{
    currentPos={lat:pos.coords.latitude,lon:pos.coords.longitude};
    el.status.textContent="Posisjon funnet.";
    setUserMarker(currentPos.lat,currentPos.lon);
    renderNearby();
  },err=>{
    el.status.textContent="Kunne ikke hente posisjon.";
    renderNearby();
  });
}
function wireTestMode(){
  el.testToggle.addEventListener("change",e=>{
    if(e.target.checked){
      currentPos={lat:59.910,lon:10.752};
      el.status.textContent="Testmodus: Oslo S";
      setUserMarker(currentPos.lat,currentPos.lon);
      MAP.setView([currentPos.lat,currentPos.lon],14);
      renderNearby();
      showToast("Testmodus PÅ");
    } else {
      currentPos=null;
      requestLocation();
      showToast("Testmodus AV");
    }
  });
}

// Init
function init(){
  initMap();
  renderCollection();
  renderDiplomas();
  renderGallery();
  renderNearby();
  wireTestMode();
  requestLocation();
  showToast("History Go klar ✅");
}
