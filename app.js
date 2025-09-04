/* === History Go – kart + skyvbart panel + 2 nærmeste === */

// Bruk dine JSON-filer om de finnes, ellers faller vi tilbake til demo
let PLACES = [];
let PEOPLE = [];

Promise.all([
  fetch('places.json').then(r => r.ok ? r.json() : [] ).catch(()=>[]),
  fetch('people.json').then(r => r.ok ? r.json() : [] ).catch(()=>[])
]).then(([places, people])=>{
  PLACES = Array.isArray(places) && places.length ? places : [
    { id:"radhus", name:"Oslo rådhus", category:"Historie", lat:59.913, lon:10.734, desc:"Nobelseremoniens hjem." },
    { id:"nasjonalmus", name:"Nasjonalmuseet", category:"Kultur", lat:59.9146, lon:10.7229, desc:"Nordens største kunstmuseum." },
    { id:"opera", name:"Den Norske Opera & Ballett", category:"Kultur", lat:59.9076, lon:10.7532, desc:"Operahuset i Bjørvika." },
    { id:"vigelandsparken", name:"Vigelandsparken", category:"Severdigheter", lat:59.9270, lon:10.7003, desc:"Skulpturpark av Gustav Vigeland." }
  ];
  PEOPLE = Array.isArray(people) ? people : [];

  init();
});

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

  PLACES.forEach(p=>{
    L.circleMarker([p.lat,p.lon], {
      radius:7, color:"#111", weight:1, fillColor:"#1976d2", fillOpacity:.9
    }).addTo(map).bindPopup(`<strong>${p.name}</strong><br>${p.category||''}`);
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
  const items = (pos
    ? PLACES.map(p=>({...p,d:dist(pos,{lat:p.lat,lon:p.lon})}))
    : PLACES.map(p=>({...p,d:null}))
  ).sort((a,b)=>(a.d??1e12)-(b.d??1e12))
   .slice(0,2);

  el.list.innerHTML = items.map(p=>`
    <article class="card">
      <div class="name">${p.name}</div>
      <div class="meta">${p.category||''} • Oslo</div>
      <div class="desc">${p.desc||""}</div>
      <div class="dist">${p.d==null?"":fmtM(p.d)}</div>
    </article>
  `).join("");
}

// Samling (placeholder), diplomer, galleri
function renderCollection(){
  const sample = PLACES.slice(0,5).map(p=>p.name);
  el.collection.innerHTML = sample.map(n=>`<span class="badge">${n}</span>`).join("");
  const elCount = document.getElementById("count");
  if (elCount) elCount.textContent = sample.length;
}
function renderDiplomas(){
  el.diplomas.innerHTML = `
    <div class="diploma bronse"><div class="name">Oslo – Grunnpakke <span class="tier bronse">BRONSE</span></div><div class="meta">Fullfør 5 steder</div><p class="desc">De første fem stedene i sentrum er låst opp.</p></div>
    <div class="diploma sølv"><div class="name">Kulturstien <span class="tier sølv">SØLV</span></div><div class="meta">Fullfør 8 kultursteder</div><p class="desc">Museer, bibliotek og scenehus.</p></div>
    <div class="diploma gull"><div class="name">Historie-mester <span class="tier gull">GULL</span></div><div class="meta">Fullfør 12 historiske steder</div><p class="desc">Du kan byens tidslinjer.</p></div>
  `;
}
function renderGallery(){
  if (!PEOPLE.length) {
    el.gallery.innerHTML = `<div class="muted">Samle personer ved events og høytider.</div>`;
    return;
  }
  el.gallery.innerHTML = PEOPLE.map(p=>{
    const initials = (p.initials || p.name?.slice(0,2) || "?").toUpperCase();
    const pills = (p.tags||p.pills||[]).map(x=>{
      const cls = x==="Person"?"person":(x==="Quiz"?"event":(x==="Nær"||x==="now"?"now":"soon"));
      const label = (x.charAt?x.charAt(0).toUpperCase()+x.slice(1):x);
      return `<span class="pill ${cls}">${label}</span>`;
    }).join("");
    return `
      <div class="person-card">
        <div class="avatar">${initials}</div>
        <div style="flex:1">
          <div class="name">${p.name}</div>
          <div class="sub">${p.sub || p.desc || ""}</div>
          <div style="margin-top:6px">${pills}</div>
        </div>
        <button class="person-btn">Gå til</button>
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

// Skyvbart panel (dra for å se kartet)
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
    if (h < vh()*0.45) setH(96); else setH(vh()-80);   // liten vs stor
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
  addEventListener('resize', ()=> setH(curH()));
})();

// Init
function init(){
  initMap();
  renderCollection();
  renderDiplomas();
  renderGallery();
  locate();
}
