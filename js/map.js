(function initMap(){
  const el = document.getElementById("map");
  if(!el) return;
  if(typeof L === "undefined"){ console.warn("Leaflet ikke lastet – hopper over kart"); el.innerHTML = "<div style='padding:10px;color:#9fb3c8'>Kart ikke aktivt</div>"; return; }

  const map = L.map("map").setView([59.9139, 10.7522], 12);
  window.map = map;
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19 }).addTo(map);

  // legg inn en markør for fallback-stedet hvis finnes
  const pl = (HG.data?.places||[]).find(p=>p.id==="observatoriet");
  if(pl){ L.marker([pl.lat, pl.lon]).addTo(map).bindPopup(pl.name); }
})();
