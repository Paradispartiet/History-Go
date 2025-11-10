// ============================================================
// === HISTORY GO – MAP.JS (v3.1, Leaflet-kart og ruter) ======
// ============================================================

const map = (() => {
  let leafletMap;
  let markers = {};

  function initMap(places = [], routes = []) {
    if (!window.L) {
      console.error("Leaflet mangler – kunne ikke starte kart.");
      return;
    }

    leafletMap = L.map("map", {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
    }).setView([59.9139, 10.7522], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(leafletMap);

    drawPlaceMarkers(places);
    drawRouteLines(routes);

    console.log(`🗺️ Kart initialisert med ${places.length} steder`);
  }

  // ----------------------------------------------------------
  // 2) MARKØRER
  // ----------------------------------------------------------
  function drawPlaceMarkers(places) {
    if (!leafletMap || !Array.isArray(places)) return;
    places.forEach((p) => {
      const color = catColor(p.category);
      const icon = L.divIcon({
        className: "place-marker",
        html: `<div style="background:${color}"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      const m = L.marker([p.lat, p.lon], { icon })
        .addTo(leafletMap)
        .on("click", () => handlePlaceClick(p.id));
      markers[p.id] = m;
    });
  }

  // ----------------------------------------------------------
  // 3) RUTER (fra routes.json → stops[])
  // ----------------------------------------------------------
  function drawRouteLines(routes) {
    if (!leafletMap || !Array.isArray(routes)) return;
    routes.forEach((r) => {
      const color = r.color || "#FFD600";
      const coords = (r.stops || [])
        .map((s) => {
          const pl = (HG?.data?.places || []).find(
            (p) => p.id === s.placeId
          );
          return pl ? [pl.lat, pl.lon] : null;
        })
        .filter(Boolean);
      if (coords.length > 1) {
        L.polyline(coords, { color, weight: 3, opacity: 0.8 }).addTo(
          leafletMap
        );
      }
    });
  }

  // ----------------------------------------------------------
  // 4) TRYKK PÅ STED
  // ----------------------------------------------------------
  function handlePlaceClick(placeId) {
    const pl = (HG?.data?.places || []).find((x) => x.id === placeId);
    if (!pl) return;
    pulseMarker(placeId);
    document.dispatchEvent(
      new CustomEvent("placeSelected", { detail: { placeId } })
    );
    ui.showToast(`📍 ${pl.name}`);
  }

  // ----------------------------------------------------------
  // 5) VISUELLE EFFEKTER
  // ----------------------------------------------------------
  function pulseMarker(id) {
    const el = markers[id]?._icon?.querySelector("div");
    if (!el) return;
    el.animate(
      [
        { transform: "scale(1)", opacity: 1 },
        { transform: "scale(1.5)", opacity: 0.4 },
        { transform: "scale(1)", opacity: 1 },
      ],
      { duration: 700, easing: "ease-out" }
    );
  }

  // ----------------------------------------------------------
  // 6) NÆRLIGGENDE STEDER
  // ----------------------------------------------------------
  function highlightNearbyPlaces(lat, lon, radius = 150) {
    const nearby = (HG?.data?.places || []).filter((p) => {
      const d = distance(lat, lon, p.lat, p.lon);
      return d <= radius;
    });
    nearby.forEach((p) => pulseMarker(p.id));
  }

  function distance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) ** 2 +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ----------------------------------------------------------
  // 7) FARGER
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
    if (c.includes("populaerkultur")) return "#ff6f00";
    if (c.includes("subkultur")) return "#00c2ff";
    return "#FFD600";
  }

  return { initMap, pulseMarker, highlightNearbyPlaces };
})();
