// ============================================================
// === HISTORY GO – MAP.JS (farger per kategori) ==============
// ============================================================

(function initMap(){
  const el = document.getElementById("map");
  if (!el) return;

  // Fallback hvis Leaflet ikke er lastet
  if (typeof L === "undefined") {
    console.warn("Leaflet ikke lastet – hopper over kart");
    el.innerHTML = "<div style='padding:10px;color:#9fb3c8'>Kart ikke aktivt</div>";
    return;
  }

  // Opprett kart
  const map = L.map("map").setView([59.9139, 10.7522], 13);
  window.map = map;

  // Bakgrunnslag
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  // ----------------------------------------------------------
  // Hjelpefunksjon – velg farge etter kategori
  // ----------------------------------------------------------
  function catColor(cat = "") {
    const c = cat.toLowerCase();
    if (c.includes("historie")) return "#344B80";     // dyp blå
    if (c.includes("vitenskap")) return "#9b59b6";    // lilla
    if (c.includes("kunst")) return "#ffb703";        // gull
    if (c.includes("musikk")) return "#ff66cc";       // rosa
    if (c.includes("litteratur")) return "#f6c800";   // gul
    if (c.includes("natur")) return "#4caf50";        // grønn
    if (c.includes("sport")) return "#2a9d8f";        // turkis
    if (c.includes("by")) return "#e63946";           // rød
    if (c.includes("politikk")) return "#c77dff";     // lilla-rosa
    if (c.includes("populaerkultur")) return "#00c2ff";
    if (c.includes("subkultur")) return "#00c2ff";
    return "#FFD600"; // fallback
  }

  // ----------------------------------------------------------
  // Tegn alle steder som markører
  // ----------------------------------------------------------
  setTimeout(() => {
    const places = HG.data?.places || [];
    places.forEach(p => {
      if (!p.lat || !p.lon) return;

      const color = catColor(p.category || "");
      const markerIcon = L.divIcon({
        html: `<div style="
          width:18px;height:18px;
          background:${color};
          border-radius:50%;
          border:2px solid white;
          box-shadow:0 0 6px ${color}88;
        "></div>`,
        className: "",
        iconSize: [18,18],
        iconAnchor: [9,9]
      });

      const marker = L.marker([p.lat, p.lon], { icon: markerIcon }).addTo(map);
      marker.bindPopup(`<b>${p.name}</b><br>${p.desc || ""}`);
    });
  }, 500);
})();
