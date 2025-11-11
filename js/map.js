// ============================================================
// === HISTORY GO – MAP.JS (bilder + hover-effekt) ============
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
  // Farge per kategori
  // ----------------------------------------------------------
  function catColor(cat = "") {
    const c = cat.toLowerCase();
    if (c.includes("historie")) return "#344B80";
    if (c.includes("vitenskap")) return "#9b59b6";
    if (c.includes("kunst")) return "#ffb703";
    if (c.includes("musikk")) return "#ff66cc";
    if (c.includes("litteratur")) return "#f6c800";
    if (c.includes("natur")) return "#4caf50";
    if (c.includes("sport")) return "#2a9d8f";
    if (c.includes("by")) return "#e63946";
    if (c.includes("politikk")) return "#c77dff";
    if (c.includes("populaerkultur")) return "#00c2ff";
    if (c.includes("subkultur")) return "#00c2ff";
    return "#FFD600";
  }

  // ----------------------------------------------------------
  // Tegn alle steder som markører med bilde-popup
  // ----------------------------------------------------------
  setTimeout(() => {
    const places = HG.data?.places || [];
    places.forEach(p => {
      if (!p.lat || !p.lon) return;

      const color = catColor(p.category || "");
      const markerIcon = L.divIcon({
        html: `<div class="hg-marker" 
                    style="--c:${color};"></div>`,
        className: "",
        iconSize: [18,18],
        iconAnchor: [9,9]
      });

      const marker = L.marker([p.lat, p.lon], { icon: markerIcon }).addTo(map);

      const imgHtml = p.image
        ? `<img src="${p.image}" alt="${p.name}" 
                style="width:100%;max-width:220px;border-radius:8px;margin-bottom:6px;">`
        : "";

      const popupHtml = `
        ${imgHtml}
        <b>${p.name}</b><br>
        <small>${p.desc || ""}</small>
      `;

      marker.bindPopup(popupHtml);

      // Hover-effekt: legg til / fjern glød
      marker.on("mouseover", () => {
        const el = marker.getElement()?.querySelector(".hg-marker");
        if (el) el.style.boxShadow = `0 0 10px 3px ${color}99`;
      });
      marker.on("mouseout", () => {
        const el = marker.getElement()?.querySelector(".hg-marker");
        if (el) el.style.boxShadow = `0 0 6px ${color}55`;
      });
    });
  }, 500);
})();
