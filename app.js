// ==============================
// History Go – app.js
// ==============================
const NEARBY_LIMIT = 2;
const START_POS = { lat: 59.9139, lon: 10.7522, zoom: 13 };

let PLACES = [], PEOPLE = [];

// Data
Promise.all([
  fetch('places.json').then(r=>r.json()),
  fetch('people.json').then(r=>r.json()).catch(()=>[])
]).then(([places, people])=>{
  PLACES=places; PEOPLE=people;
  init();
});

// State
const visited=JSON.parse(localStorage.getItem("visited_places")||"{}");
function saveVisited(){ localStorage.setItem("visited_places", JSON.stringify(visited)); renderCollection(); }

const el={
  map:document.getElementById("map"),
  status:document.getElementById("status"),
  list:document.getElementById("list"),
  collection:document.getElementById("collection"),
  count:document.getElementById("count"),
  diplomas:document.getElementById("diplomas"),
  gallery:document.getElementById("gallery"),
  toast:document.getElementById("toast")
};

// Kart
let MAP,userMarker;
function initMap(){
  MAP=L.map("map",{zoomControl:false,attributionControl:false})
    .setView([START_POS.lat,START_POS.lon],START_POS.zoom);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  { attribution:"&copy; OpenStreetMap, &copy;CARTO" }).addTo(MAP);

  PLACES.forEach(p=>{
    L.circleMarker([p.lat,p.lon],{radius:7,weight:2,color:"#111",
      fillColor:"#1976d2",fillOpacity:.9}).addTo(MAP)
      .bindPopup(`<b>${p.name}</b><br>${p.category||""}`);
  });
}
function setUser(lat,lon){
  if(!MAP)return;
  if(!userMarker){
    userMarker=L.circleMarker([lat,lon],{radius:8,weight:2,color:"#fff",
      fillColor:"#1976d2",fillOpacity:1}).addTo(MAP).bindPopup("Du er her");
  } else userMarker.setLatLng([lat,lon]);
}

// Hjelpere
function haversine(a,b){
  const R=6371e3,toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat),dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat),la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
function showToast(msg){el.toast.textContent=msg;el.toast.style.display="block";setTimeout(()=>el.toast.style.display="none",1400);}

// Render
function renderNearby(pos){
  const withDist=PLACES.map(p=>{
    const d=pos?Math.round(haversine(pos,{lat:p.lat,lon:p.lon})):null;
    return {...p,d};
  }).sort((a,b)=>(a.d??1e12)-(b.d??1e12));
  const subset=withDist.slice(0,NEARBY_LIMIT);
  el.list.innerHTML=subset.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||""} • Oslo</div>
      <p class="desc">${p.desc||""}</p>
      <div class="dist">${p.d<1000?p.d+" m":(p.d/1000).toFixed(1)+" km"} unna</div>
    </article>
  `).join("");
}
function renderCollection(){ el.collection.innerHTML=Object.keys(visited).length?"<em>Samling vises her</em>":"<em>Ingen enda</em>"; el.count.textContent=Object.keys(visited).length; }
function renderDiplomas(){ el.diplomas.innerHTML="<em>Diplomer vises her</em>"; }
function renderGallery(){ el.gallery.innerHTML="<em>Galleri vises her</em>"; }

// Geo
function requestLocation(){
  if(!navigator.geolocation){el.status.textContent="Ingen geolokasjon";renderNearby(null);return;}
  navigator.geolocation.getCurrentPosition(g=>{
    const pos={lat:g.coords.latitude,lon:g.coords.longitude};
    el.status.textContent="Posisjon funnet.";
    setUser(pos.lat,pos.lon); renderNearby(pos);
  },()=>{el.status.textContent="Kunne ikke hente posisjon";renderNearby(null);});
}

// Init
function init(){ initMap(); renderCollection(); renderDiplomas(); renderGallery(); requestLocation(); }
