// ============================================================
// === HISTORY GO – MAP.JS (stabil med flere markører) =========
// ============================================================

(function initMap(){
  const el = document.getElementById("map");
  if (!el) return;

  // Fallback hvis Leaflet mangler
  if (typeof L === "undefined") {
    console.warn("Leaflet ikke lastet – hopper over kart");
    el.innerHTML = "<div style='padding:10px;color:#9fb3c8'>Kart ikke aktivt</div>";
    return;
  }

  // Opprett kart
  const map = L.map("map").setView([59.9139, 10.7522], 13);
  window.map = map;

  // Bakgrunnskart
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  // Vent til data er lastet inn
  setTimeout(() => {
    const places = HG.data?.places || [];
    places.forEach(p => {
      if (!p.lat || !p.lon) return;
      const marker = L.marker([p.lat, p.lon]).addTo(map);
      marker.bindPopup(`<b>${p.name}</b><br>${p.desc || ""}`);
    });
  }, 500);
})();
