/* ===============================
   HISTORY GO – app.js (enkelt UI)
   Kart i bakgrunnen + seksjoner
   - Nearby viser 2 først (Vis flere / Vis færre)
   =============================== */

/* ---------- Kategori → CSS badge-klasse ---------- */
const CATEGORY_TO_CLASS = {
  "Historie": "badge-historie",
  "Kultur": "badge-kultur",
  "Sport": "badge-sport",
  "Severdigheter": "badge-severdigheter",
  "Natur": "badge-natur"
};

/* ---------- Demo-data (kan byttes ut med API) ---------- */
const PLACES = [
  { id: "akershus",        name: "Akershus festning",      category: "Historie",      lat:59.909, lon:10.739, desc:"Middelalderborg og kongsresidens." },
  { id: "opera",           name: "Den Norske Opera & Ballett", category: "Kultur",    lat:59.907, lon:10.753, desc:"Ikonisk bygg med takvandring." },
  { id: "ullevål",         name: "Ullevål stadion",        category: "Sport",         lat:59.948, lon:10.737, desc:"Nasjonalstadion." },
  { id: "vigelandsparken", name: "Vigelandsparken",        category: "Severdigheter", lat:59.927, lon:10.699, desc:"Verdens største skulpturpark." },
  { id: "frammuseet",      name: "Frammuseet",             category: "Historie",      lat:59.906, lon:10.699, desc:"Polarekspedisjoner og FRAM." },
  { id: "intility",        name: "Intility Arena (VIF)",   category: "Sport",         lat:59.914, lon:10.791, desc:"Hjemmebanen til Vålerenga." },
  { id: "nasjonalmus",     name: "Nasjonalmuseet",         category: "Kultur",        lat:59.913, lon:10.731, desc:"Nordens største kunstmuseum." },
  { id: "deichman",        name: "Deichman Bjørvika",      category: "Kultur",        lat:59.910, lon:10.752, desc:"Hovedbiblioteket i Oslo." },
  { id: "botanisk",        name: "Botanisk hage",          category: "Severdigheter", lat:59.917, lon:10.771, desc:"Grønn oase og museer." },
  { id: "rådhus",          name: "Oslo rådhus",            category: "Historie",      lat:59.913, lon:10.734, desc:"Nobelseremoniens hjem." }
];

const INITIAL_COLLECTION = [
  "akershus","rådhus","nasjonalmus","opera","ullevål","intility",
  "frammuseet","vigelandsparken","botanisk","deichman"
];

const DIPLOMAS = [
  { id:"d1", name:"Oslo – Grunnpakke", tier:"bronse", meta:"Fullfør 5 steder", desc:"De første fem stedene i sentrum er låst opp." },
  { id:"d2", name:"Kulturstien",       tier:"sølv",   meta:"Fullfør 8 kultursteder", desc:"Museer, bibliotek og scenehus." },
  { id:"d3", name:"Historie-mester",   tier:"gull",   meta:"Fullfør 12 historiske steder", desc:"Du kan byens tidslinjer." }
];

const PEOPLE = [
  { id:"nansen", initials:"FN", name:"Fridtjof Nansen", sub:"Oppdager • Humanist", pills:["Person","Quiz","Nær"],  now:true },
  { id:"ibsen",  initials:"HI", name:"Henrik Ibsen",    sub:"Dramatiker • «Et dukkehjem»", pills:["Person","Snart"], now:false }
];

/* ---------- State & storage ---------- */
const storage = {
  getCollection(){
    try {
      const raw = localStorage.getItem("collection");
      if (raw) return JSON.parse(raw);
    } catch(_) {}
    return INITIAL_COLLECTION.slice();
  },
  setCollection(arr){
    try { localStorage.setItem("collection", JSON.stringify(arr)); } catch(_) {}
  }
};

/* ---------- DOM refs ---------- */
const el = {
  map:       document.getElementById("map"),
  status:    document.getElementById("status"),
  list:      document.getElementById("list"),
  collection:document.getElementById("collection"),
  count:     document.getElementById("count"),
  diplomas:  document.getElementById("diplomas"),
  gallery:   document.getElementById("gallery"),
  toast:     document.getElementById("toast"),
  testToggle:document.getElementById("testToggle")
};

/* ---------- Map (Leaflet) ---------- */
let map, userMarker;

function initMap(center=[59.9139, 10.7522], zoom=13){
  map = L.map('map', { zoomControl:false, attributionControl:false }).setView(center, zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom:19, attribution:'© OpenStreetMap'
  }).addTo(map);

  // markers for places (enkel stil)
  PLACES.forEach(p=>{
    const color = pickColor(p.category);
    L.circleMarker([p.lat, p.lon], {
      radius:7, fillOpacity:0.9, weight:1, color:"#111", fillColor:color
    }).addTo(map).bindPopup(`<strong>${p.name}</strong><br>${p.category}`);
  });
}

function setUserMarker(lat, lon){
  if (!map) return;
  if (userMarker) { userMarker.setLatLng([lat,lon]); return; }
  userMarker = L.circleMarker([lat, lon], {
    radius:8, color:"#fff", weight:2, fillColor:"#1976d2", fillOpacity:1
  }).addTo(map).bindPopup("Du er her");
}

/* ---------- Utils ---------- */
function pickColor(category){
  switch(category){
    case "Historie": return "#1976d2";
    case "Kultur": return "#e63946";
    case "Sport": return "#2a9d8f";
    case "Severdigheter": return "#ffb703";
    case "Natur": return "#4caf50";
    default: return "#888";
  }
}

function haversine(lat1, lon1, lat2, lon2){
  const R = 6371e3, toRad = d => d * Math.PI/180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // meter
}
function fmtDist(m){
  if (m < 1000) return `${Math.round(m)} m unna`;
  return `${(m/1000).toFixed(1)} km unna`;
}
function showToast(msg="OK"){
  el.toast.textContent = msg;
  el.toast.style.display = "block";
  setTimeout(()=> el.toast.style.display = "none", 1500);
}

/* ---------- Nearby: begrenset visning ---------- */
const NEARBY_LIMIT = 2;     // vis 2 kort først
let showAllNearby = false;  // “Vis flere / Vis færre”
let currentPos = null;

function renderNearby(){
  // sorter med avstand hvis vi har posisjon
  const data = currentPos
    ? PLACES.map(p => ({ ...p, _d: Math.round(haversine(currentPos.lat, currentPos.lon, p.lat, p.lon)) }))
            .sort((a,b) => (a._d ?? 1e12) - (b._d ?? 1e12))
    : PLACES.slice();

  const visible = showAllNearby ? data : data.slice(0, NEARBY_LIMIT);

  el.list.innerHTML = visible.map(p => `
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category} • Oslo</div>
      <p class="desc">${p.desc || ""}</p>
      <div class="dist">${p._d ? fmtDist(p._d) : "–"}</div>
    </article>
  `).join("");

  if (data.length > NEARBY_LIMIT) {
    el.list.innerHTML += `
      <div style="text-align:center;margin:8px 0 2px">
        <button class="btn ghost" onclick="toggleNearby()">
          ${showAllNearby ? "Vis færre" : "Vis flere"}
        </button>
      </div>
    `;
  }
}
window.toggleNearby = function(){
  showAllNearby = !showAllNearby;
  renderNearby();
};

/* ---------- Samling / Diplomer / Galleri ---------- */
function renderCollection(){
  const ids = storage.getCollection();
  const items = ids.map(id => PLACES.find(p=>p.id===id)).filter(Boolean);
  el.collection.innerHTML = items.map(item =>
    `<span class="badge ${CATEGORY_TO_CLASS[item.category]||""}">${item.name}</span>`
  ).join("");
  el.count.textContent = items.length;
}

function renderDiplomas(){
  el.diplomas.innerHTML = DIPLOMAS.map(d => `
    <div class="diploma ${d.tier}">
      <div class="name">${d.name} <span class="tier ${d.tier}">${d.tier.charAt(0).toUpperCase()+d.tier.slice(1)}</span></div>
      <div class="meta">${d.meta}</div>
      <p class="desc">${d.desc}</p>
    </div>
  `).join("");
}

function renderGallery(){
  el.gallery.innerHTML = PEOPLE.map(p=>{
    const pills = p.pills.map(x=>{
      const cls = x === "Person" ? "person" : (x==="Quiz"?"event":(x==="Nær"?"now":"soon"));
      return `<span class="pill ${cls}">${x}</span>`;
    }).join("");
    return `
      <article class="person-card">
        <div class="avatar">${p.initials}</div>
        <div class="info">
          <div class="name">${p.name}</div>
          <div class="sub">${p.sub}</div>
          <p class="desc">${p.now ? "Lås opp ved Fram-museet og ta «Polarekspedisjoner»." : "Finn sitat ved teatret og svar for merke."}</p>
          <div class="person-actions">${pills}</div>
        </div>
        <button class="person-btn ${p.now ? "" : "ghost"}">${p.now?"Gå til":"Forbered"}</button>
      </article>
    `;
  }).join("");
}

/* ---------- Geolokasjon + Testmodus ---------- */
function requestLocation(){
  if (!navigator.geolocation){
    el.status.textContent = "Geolokasjon støttes ikke.";
    renderNearby();
    return;
  }
  el.status.textContent = "Henter posisjon…";
  navigator.geolocation.getCurrentPosition(
    (geo)=>{
      currentPos = { lat: geo.coords.latitude, lon: geo.coords.longitude };
      el.status.textContent = "Posisjon funnet.";
      setUserMarker(currentPos.lat, currentPos.lon);
      renderNearby();
    },
    ()=>{
      el.status.textContent = "Kunne ikke hente posisjon.";
      renderNearby();
    },
    { enableHighAccuracy:true, timeout:7000, maximumAge:10000 }
  );
}

function setTestMode(on){
  if (on){
    currentPos = { lat:59.910, lon:10.752 }; // Oslo S-ish
    el.status.textContent = "Testmodus: Oslo S";
    if (map){ setUserMarker(currentPos.lat, currentPos.lon); map.setView([currentPos.lat,currentPos.lon], 14); }
    showAllNearby = false;
    renderNearby();
    showToast("Testmodus PÅ");
  } else {
    showAllNearby = false;
    showToast("Testmodus AV");
    requestLocation();
  }
}

/* ---------- Init ---------- */
function init(){
  initMap();
  renderCollection();
  renderDiplomas();
  renderGallery();
  requestLocation();
  el.testToggle.addEventListener("change", (e)=> setTestMode(e.target.checked));
}
document.addEventListener("DOMContentLoaded", init);
