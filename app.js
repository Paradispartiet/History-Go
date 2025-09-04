/* ===============================
   HISTORY GO – mini-app (client)
   Renders: Nearby, Collection, Diplomas, Gallery
   =============================== */

/* ---------- Kategori → CSS badge-klasse ---------- */
const CATEGORY_TO_CLASS = {
  "Historie": "badge-historie",
  "Kultur": "badge-kultur",
  "Sport": "badge-sport",
  "Severdigheter": "badge-severdigheter",
  "Natur": "badge-natur"
};

/* ---------- Dummy data (kan byttes ut med API) ---------- */
const PLACES = [
  { id: "akershus", name: "Akershus festning", category: "Historie", lat:59.909, lon:10.739, desc:"Middelalderborg og kongsresidens.", distance:null },
  { id: "opera", name: "Den Norske Opera & Ballett", category: "Kultur", lat:59.907, lon:10.753, desc:"Ikonisk bygg med takvandring.", distance:null },
  { id: "ullevål", name: "Ullevål stadion", category: "Sport", lat:59.948, lon:10.737, desc:"Nasjonalstadion.", distance:null },
  { id: "vigelandsparken", name: "Vigelandsparken", category: "Severdigheter", lat:59.927, lon:10.699, desc:"Verdens største skulpturpark.", distance:null },
  { id: "frammuseet", name: "Frammuseet", category: "Historie", lat:59.906, lon:10.699, desc:"Polarekspedisjoner og FRAM.", distance:null },
  { id: "intility", name: "Intility Arena (VIF)", category: "Sport", lat:59.914, lon:10.791, desc:"Hjemmebanen til Vålerenga.", distance:null },
  { id: "nasjonalmus", name: "Nasjonalmuseet", category: "Kultur", lat:59.913, lon:10.731, desc:"Nordens største kunstmuseum.", distance:null },
  { id: "deichman", name: "Deichman Bjørvika", category: "Kultur", lat:59.910, lon:10.752, desc:"Hovedbiblioteket i Oslo.", distance:null },
  { id: "botanisk", name: "Botanisk hage", category: "Severdigheter", lat:59.917, lon:10.771, desc:"Grønn oase og museer.", distance:null },
  { id: "rådhus", name: "Oslo rådhus", category: "Historie", lat:59.913, lon:10.734, desc:"Nobelseremoniens hjem.", distance:null }
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
  { id:"nansen", initials:"FN", name:"Fridtjof Nansen", sub:"Oppdager • Humanist", pills:["Person","Quiz","Nær"], now:true },
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
  testToggle:document.getElementById("testToggle"),
  fabMenu:   document.getElementById("fabMenu"),
  sheet:     document.getElementById("sheet"),
  sheetClose:document.getElementById("sheetClose"),
  sheetApply:document.getElementById("sheetApply"),
  catFilter: document.getElementById("catFilter"),

  // seksjoner (brukes av showView)
  sectionNearby:     document.querySelector('#list')?.closest('.section'),
  sectionCollection: document.querySelector('#collection')?.closest('.section'),
  sectionDiplomas:   document.querySelector('#diplomas')?.closest('.section'),
  sectionPeople:     document.querySelector('#gallery')?.closest('.section'),

  // hurtigknapper (legg de inn i HTML hvis du vil)
  btnNearby:    document.getElementById('btnNearby'),
  btnCollection:document.getElementById('btnCollection'),
  btnDiplomas:  document.getElementById('btnDiplomas'),
  btnPeople:    document.getElementById('btnPeople'),
};

/* ---------- Visnings-state ---------- */
let CURRENT_VIEW = 'nearby'; // 'nearby' | 'collection' | 'diplomas' | 'people'

function showView(view){
  CURRENT_VIEW = view;

  const mapSec = {
    nearby: el.sectionNearby,
    collection: el.sectionCollection,
    diplomas: el.sectionDiplomas,
    people: el.sectionPeople
  };

  Object.entries(mapSec).forEach(([k, node])=>{
    if (!node) return;
    node.style.display = (k === view ? 'block' : 'none');
  });

  // re-render det som er synlig
  if (view === 'nearby') renderNearby(filteredWithDistance(PLACES, currentPos));
  if (view === 'collection') renderCollection();
  if (view === 'diplomas') renderDiplomas();
  if (view === 'people') renderGallery();
}

function wireQuickToggles(){
  el.btnNearby    && el.btnNearby.addEventListener('click',    ()=>showView('nearby'));
  el.btnCollection&& el.btnCollection.addEventListener('click',()=>showView('collection'));
  el.btnDiplomas  && el.btnDiplomas.addEventListener('click',  ()=>showView('diplomas'));
  el.btnPeople    && el.btnPeople.addEventListener('click',    ()=>showView('people'));
}

/* ---------- Map (Leaflet) ---------- */
let map, userMarker;

function initMap(center=[59.9139, 10.7522], zoom=13){
  map = L.map('map', { zoomControl:false, attributionControl:false }).setView(center, zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom:19, attribution:'© OpenStreetMap'
  }).addTo(map);

  // markers for places
  PLACES.forEach(p=>{
    const color = pickColor(p.category);
    const marker = L.circleMarker([p.lat, p.lon], {
      radius:7, fillOpacity:0.9, weight:1, color:"#111", fillColor:color
    });
    marker.addTo(map).bindPopup(`<strong>${p.name}</strong><br>${p.category}`);
  });
}

function setUserMarker(lat, lon){
  if (!map) return;
  const icon = L.circleMarker([lat, lon], {radius:8, color:"#fff", weight:2, fillColor:"#1976d2", fillOpacity:1});
  if (userMarker) { userMarker.setLatLng([lat,lon]); }
  else { userMarker = icon.addTo(map).bindPopup("Du er her"); }
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
  const R = 6371e3;
  const toRad = d => d * Math.PI/180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // meters
}

function formatDistance(m){
  if (m < 1000) return `${Math.round(m)} m unna`;
  return `${(m/1000).toFixed(1)} km unna`;
}

function showToast(msg="OK"){
  el.toast.textContent = msg;
  el.toast.style.display = "block";
  setTimeout(()=> el.toast.style.display = "none", 1500);
}

/* ---------- Renderers ---------- */
function renderNearby(list){
  el.list.innerHTML = "";
  list.forEach(p=>{
    const stripeClass =
      p.category === "Historie"      ? "cat-historie" :
      p.category === "Kultur"        ? "cat-kultur" :
      p.category === "Sport"         ? "cat-sport" :
      p.category === "Severdigheter" ? "cat-severdigheter" :
      "cat-natur";

    const distance = p.distance != null ? `<div class="dist">${formatDistance(p.distance)}</div>` : "";

    const card = document.createElement("article");
    card.className = `card ${stripeClass}`;
    card.innerHTML = `
      <div>
        <div class="name">${p.name}</div>
        <div class="meta">${p.category} • Oslo</div>
        <p class="desc">${p.desc || ""}</p>
        ${distance}
      </div>
    `;
    el.list.appendChild(card);
  });
}

function renderCollection(){
  const ids = storage.getCollection();
  const items = ids
    .map(id => PLACES.find(p=>p.id===id))
    .filter(Boolean);

  el.collection.innerHTML = "";
  items.forEach(item=>{
    const chip = document.createElement("span");
    chip.className = `badge ${CATEGORY_TO_CLASS[item.category]||""}`;
    chip.textContent = item.name;
    el.collection.appendChild(chip);
  });
  el.count.textContent = items.length;
}

function renderDiplomas(){
  el.diplomas.innerHTML = "";
  DIPLOMAS.forEach(d=>{
    const box = document.createElement("div");
    box.className = `diploma ${d.tier}`;
    box.innerHTML = `
      <div class="name">${d.name} <span class="tier ${d.tier}">${capitalize(d.tier)}</span></div>
      <div class="meta">${d.meta}</div>
      <p class="desc">${d.desc}</p>
    `;
    el.diplomas.appendChild(box);
  });
}

function renderGallery(){
  el.gallery.innerHTML = "";
  PEOPLE.forEach(p=>{
    const card = document.createElement("article");
    card.className = "person-card";
    const pills = p.pills.map(x=>{
      const cls = x === "Person" ? "person" : (x === "Quiz" ? "event" : (x==="Nær"?"now":"soon"));
      return `<span class="pill ${cls}">${x}</span>`;
    }).join("");

    card.innerHTML = `
      <div class="avatar">${p.initials}</div>
      <div class="info">
        <div class="name">${p.name}</div>
        <div class="sub">${p.sub}</div>
        <p class="desc">${p.now ? "Lås opp ved Fram-museet og ta «Polarekspedisjoner»." : "Finn sitat ved teatret og svar for merke."}</p>
        <div class="person-actions">${pills}</div>
      </div>
      <button class="person-btn ${p.now ? "" : "ghost"}">${p.now?"Gå til":"Forbered"}</button>
    `;
    el.gallery.appendChild(card);
  });
}

function capitalize(s){ return s.charAt(0).toUpperCase()+s.slice(1); }

/* ---------- Filters (sheet) ---------- */
function openSheet(){ el.sheet.setAttribute("aria-hidden","false"); }
function closeSheet(){ el.sheet.setAttribute("aria-hidden","true"); }

function applyFilter(){
  const cat = el.catFilter.value; // "" = alle
  const src = [...PLACES];
  const filtered = cat ? src.filter(p=>p.category===cat) : src;
  renderNearby(filteredWithDistance(filtered, currentPos));
  closeSheet();
}

/* ---------- Geolokasjon & sortering ---------- */
let currentPos = null;

function filteredWithDistance(arr, pos){
  if (!pos) return arr;
  return arr
    .map(p => ({...p, distance: haversine(pos.lat, pos.lon, p.lat, p.lon)}))
    .sort((a,b)=> (a.distance??Infinity) - (b.distance??Infinity));
}

function requestLocation(){
  if (!navigator.geolocation){
    el.status.textContent = "Geolokasjon støttes ikke.";
    renderNearby(PLACES);
    return;
  }
  el.status.textContent = "Henter posisjon…";
  navigator.geolocation.getCurrentPosition(
    (geo)=>{
      currentPos = { lat: geo.coords.latitude, lon: geo.coords.longitude };
      el.status.textContent = "Posisjon funnet.";
      setUserMarker(currentPos.lat, currentPos.lon);
      renderNearby(filteredWithDistance(PLACES, currentPos));
    },
    ()=>{
      el.status.textContent = "Kunne ikke hente posisjon.";
      renderNearby(PLACES);
    },
    { enableHighAccuracy:true, timeout:7000, maximumAge:10000 }
  );
}

/* ---------- Testmodus ---------- */
function setTestMode(on){
  if (on){
    currentPos = { lat:59.910, lon:10.752 }; // Oslo S-ish
    el.status.textContent = "Testmodus: Oslo S";
    if (map){ setUserMarker(currentPos.lat, currentPos.lon); map.setView([currentPos.lat,currentPos.lon], 14); }
    renderNearby(filteredWithDistance(PLACES, currentPos));
    showToast("Testmodus PÅ");
  } else {
    showToast("Testmodus AV");
    requestLocation();
  }
}

/* ---------- Init ---------- */
function initUI(){
  // FAB -> open sheet
  el.fabMenu && el.fabMenu.addEventListener("click", openSheet);
  el.sheetClose && el.sheetClose.addEventListener("click", closeSheet);
  el.sheetApply && el.sheetApply.addEventListener("click", applyFilter);
  el.testToggle && el.testToggle.addEventListener("change", (e)=> setTestMode(e.target.checked));
  // hurtigknapper
  wireQuickToggles();
}

function init(){
  initMap();
  initUI();
  // startvisning
  showView('nearby');
  renderCollection();
  renderDiplomas();
  renderGallery();
  requestLocation();
}

document.addEventListener("DOMContentLoaded", init);
