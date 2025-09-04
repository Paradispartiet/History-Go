/* === History Go – kart + trekkbart panel + 2 nærmeste === */

// Demo-data (bytt gjerne til places.json/people.json senere)
const PLACES = [
  { id:"radhus", name:"Oslo rådhus", category:"Historie", lat:59.913, lon:10.734, desc:"Nobelseremoniens hjem." },
  { id:"nasjonalmus", name:"Nasjonalmuseet", category:"Kultur", lat:59.9146, lon:10.7229, desc:"Nordens største kunstmuseum." },
  { id:"opera", name:"Den Norske Opera & Ballett", category:"Kultur", lat:59.9076, lon:10.7532, desc:"Operahuset i Bjørvika." },
  { id:"vigelandsparken", name:"Vigelandsparken", category:"Severdigheter", lat:59.9270, lon:10.7003, desc:"Skulpturpark av Gustav Vigeland." }
];

const DIPLOMAS = [
  { id:"d1", name:"Oslo – Grunnpakke", tier:"bronse", meta:"Fullfør 5 steder", desc:"De første fem stedene i sentrum er låst opp." },
  { id:"d2", name:"Kulturstien", tier:"sølv", meta:"Fullfør 8 kultursteder", desc:"Museer, bibliotek og scenehus." },
  { id:"d3", name:"Historie-mester", tier:"gull", meta:"Fullfør 12 historiske steder", desc:"Du kan byens tidslinjer." }
];
const PEOPLE = [
  { id:"nansen", initials:"FN", name:"Fridtjof Nansen", sub:"Oppdager • Humanist", pills:["Person","Quiz","Nær"], now:true },
  { id:"ibsen", initials:"HI", name:"Henrik Ibsen", sub:"Dramatiker • «Et dukkehjem»", pills:["Person","Snart"], now:false }
];

// DOM
const el = {
  list: document.getElementById("list"),
  status: document.getElementById("status"),
  collection: document.getElementById("collection"),
  diplomas: document.getElementById("diplomas"),
  gallery: document.getElementById("gallery"),
  toast: document.getElementById("toast")
};

// Kart
let map, userMarker;
function initMap(center=[59.9139,10.7522], zoom=13){
  map = L.map('map',{ zoomControl:false, attributionControl:false }).setView(center, zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:19}).addTo(map);

  // pins
  PLACES.forEach(p=>{
    L.circleMarker([p.lat,p.lon], {
      radius:7, color:"#111", weight:1, fillColor:"#1976d2", fillOpacity:.9
    }).addTo(map).bindPopup(`<strong>${p.name}</strong><br>${p.category}`);
  });
}
function setUser(lat, lon){
  if (!map) return;
  if (!userMarker){
    userMarker = L.circleMarker([lat,lon], {radius:8, color:"#fff", weight:2, fillColor:"#00e676", fillOpacity:1})
      .addTo(map).bindPopup("Du er her");
  } else userMarker.setLatLng([lat,lon]);
}

// Avstand
function dist(a,b){ // meter
  const R=6371e3, toRad=d=>d*Math.PI/180;
  const dLat=toRad(b.lat-a.lat), dLon=toRad(b.lon-a.lon);
  const la1=toRad(a.lat), la2=toRad(b.lat);
  const x=Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
function fmtM(m){ return m<1000 ? `${Math.round(m)} m unna` : `${(m/1000).toFixed(1)} km unna`; }

// Render – kun 2 nærmeste
function renderNearby(pos){
  const items = (pos? PLACES.map(p=>({...p,d:dist(pos,{lat:p.lat,lon:p.lon})})) : PLACES.map(p=>({...p,d:null})))
    .sort((a,b)=>(a.d??1e12)-(b.d??1e12))
    .slice(0,2);

  el.list.innerHTML = items.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category} • Oslo</div>
      <div class="desc">${p.desc||""}</div>
      <div class="dist">${p.d==null?"":fmtM(p.d)}</div>
    </article>
  `).join("");
}

// Samling / diplomer / galleri
function renderCollection(){
  const names = ["Akershus festning","Oslo rådhus","Nasjonalmuseet","Den Norske Opera & Ballett","Vigelandsparken"];
  el.collection.innerHTML = names.map(n=>`<span class="badge">${n}</span>`).join("");
  document.getElementById("count").textContent = names.length;
}
function renderDiplomas(){
  el.diplomas.innerHTML = DIPLOMAS.map(d=>`
    <div class="diploma ${d.tier}">
      <div class="name">${d.name} <span class="tier ${d.tier}">${d.tier.toUpperCase()}</span></div>
      <div class="meta">${d.meta}</div>
      <div class="desc">${d.desc}</div>
    </div>
  `).join("");
}
function renderGallery(){
  el.gallery.innerHTML = PEOPLE.map(p=>{
    const pills = p.pills.map(x=>{
      const cls = x==="Person"?"person":(x==="Quiz"?"event":(x==="Nær"?"now":"soon"));
      return `<span class="pill ${cls}">${x}</span>`;
    }).join("");
    return `
      <div class="person-card">
        <div class="avatar">${p.initials}</div>
        <div style="flex:1">
          <div class="name">${p.name}</div>
          <div class="sub">${p.sub}</div>
          <div style="margin-top:6px">${pills}</div>
        </div>
        <button class="person-btn ${p.now?"":"ghost"}">${p.now?"Gå til":"Forbered"}</button>
      </div>
    `;
  }).join("");
}

// Geolokasjon
let currentPos=null;
function locate(){
  if(!navigator.geolocation){
    el.status.textContent="Geolokasjon støttes ikke.";
    renderNearby(null);
    return;
  }
  el.status.textContent="Henter posisjon…";
  navigator.geolocation.getCurrentPosition(
    pos=>{
      currentPos={lat:pos.coords.latitude, lon:pos.coords.longitude};
      el.status.textContent="Posisjon funnet.";
      setUser(currentPos.lat,currentPos.lon);
      renderNearby(currentPos);
    },
    _=>{
      el.status.textContent="Kunne ikke hente posisjon.";
      renderNearby(null);
    },
    {enableHighAccuracy:true,timeout:7000,maximumAge:10000}
  );
}

// Trekkbart panel (opp/ned for å vise kart)
(function(){
  const panel=document.getElementById('panel');
  const grab=document.getElementById('panelGrab');
  if(!panel||!grab) return;

  const vh = ()=>window.innerHeight;
  let startY=0, startH=0, dragging=false;

  function setH(px){
    const min=96;            // nesten helt nede (mest kart)
    const max=vh()-80;       // nesten fullskjerm
    const h = Math.max(min, Math.min(px, max));
    panel.style.setProperty('--panel-h', `${h}px`);
  }
  function curH(){ return panel.getBoundingClientRect().height; }
  function snap(){
    const h=curH();
    if (h < vh()*0.45) setH(96);         // liten (vis kart)
    else setH(vh()-80);                  // stor (vis innhold)
  }

  grab.addEventListener('pointerdown', e=>{
    dragging=true; startY=e.clientY; startH=curH();
    grab.setPointerCapture?.(e.pointerId);
  });
  panel.addEventListener('pointermove', e=>{
    if(!dragging) return;
    const dy = startY - e.clientY; // dra opp = positiv
    setH(startH + dy);
  });
  panel.addEventListener('pointerup', ()=>{
    if(!dragging) return; dragging=false; snap();
  });

  // Klikk = toggle stor/liten
  grab.addEventListener('click', ()=>{
    const h=curH();
    if (h > vh()*0.6) setH(96); else setH(vh()-80);
  });

  // Startpos
  setH(Math.min(vh()*0.78, vh()-80));
  window.addEventListener('resize', ()=> setH(curH()));
})();

// Init
document.addEventListener('DOMContentLoaded',()=>{
  initMap();
  renderCollection();
  renderDiplomas();
  renderGallery();
  locate();
});
