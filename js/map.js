// ============================================================
// === HISTORY GO – MAP.JS (v3.3, komplett og kompatibel) =====
// ============================================================
//
//  • Viser steder som fargede prikker etter kategori
//  • Popup inneholder “Ta quiz”-knapp som starter quizen
//  • Ingen faste ruter vises automatisk
//  • Støtter puls, nærhets-effekt og “Se på kart”
//
// ------------------------------------------------------------
// INNHOLDSFORTEGNELSE
// ------------------------------------------------------------
// 1) Initier kartet
// 2) Markører (med "Ta quiz"-knapp)
// 3) Trykk på sted
// 4) Visuelle effekter (puls)
// 5) Nærhet & hjelpere (load, distance)
// 6) Farger (kategori / badge)
// 7) Fokuser på sted (“Se på kart”)
// 8) Eksport av offentlige funksjoner
// ============================================================

const map = (() => {
  let leafletMap;
  let markers = {};

  // ----------------------------------------------------------
  // 1) INITIER KARTET
  // ----------------------------------------------------------
  function initMap(places = [], routes = []) {
    if (!window.L) {
      console.error("Leaflet mangler – kunne ikke starte kart.");
      return;
    }

    leafletMap = L.map("map", {
      zoomControl: false,
      attributionControl: false,
      preferCanvas: true,
      worldCopyJump: false,
    }).setView([59.9139, 10.7522], 13);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '©OpenStreetMap, ©Carto',
  subdomains: 'abcd',
  maxZoom: 19
}).addTo(leafletMap);

    drawPlaceMarkers(places);

    setTimeout(() => leafletMap.invalidateSize(), 400);
    console.log(`🗺️ Kart initialisert med ${places.length} steder`);
  }

  // ----------------------------------------------------------
  // 2) MARKØRER (med "Ta quiz"-knapp)
  // ----------------------------------------------------------
  function drawPlaceMarkers(places) {
    if (!leafletMap || !Array.isArray(places)) return;

    const visited = load("visited_places", []);
    const visitedIds = visited.map(v => v.id);

    places.forEach((p) => {
      const color = catColor(p.category);
      const visitedHere = visitedIds.includes(p.id);

      const icon = L.divIcon({
        className: "place-marker",
        html: `<div style="
          background:${color};
          border:${visitedHere ? '2px solid #fff' : '2px solid transparent'};
          box-shadow:${visitedHere ? '0 0 8px #fff5' : '0 0 5px rgba(0,0,0,.4)'};
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const m = L.marker([p.lat, p.lon], { icon }).addTo(leafletMap);

      const popupHTML = `
        <strong>${p.name}</strong><br>
        <small>${p.category || ""}</small><br><br>
        <button class="popup-quiz-btn" data-id="${p.id}">Ta quiz</button>
      `;

      m.bindPopup(popupHTML);
      m.on("popupopen", (e) => {
        const btn = e.popup._contentNode.querySelector(".popup-quiz-btn");
        if (btn) {
          btn.onclick = () => {
            if (window.quiz?.startQuiz) quiz.startQuiz(p.id);
            e.popup._close();
          };
        }
      });

      m.on("click", () => handlePlaceClick(p.id));
      markers[p.id] = m;
    });
  }

  // ----------------------------------------------------------
  // 3) TRYKK PÅ STED
  // ----------------------------------------------------------
  function handlePlaceClick(placeId) {
    const pl = (HG?.data?.places || []).find((x) => x.id === placeId);
    if (!pl) return;

    pulseMarker(placeId);
    document.dispatchEvent(new CustomEvent("placeSelected", { detail: { placeId } }));
    ui.showToast(`📍 ${pl.name}`);
  }

  // ----------------------------------------------------------
  // 4) VISUELLE EFFEKTER (PULS)
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
  // 5) NÆRHET & HJELPERE
  // ----------------------------------------------------------
  function highlightNearbyPlaces(lat, lon, radius = 150) {
    const nearby = (HG?.data?.places || []).filter((p) => {
      const d = distance(lat, lon, p.lat, p.lon);
      return d <= radius;
    });
    nearby.forEach((p) => pulseMarker(p.id));
  }

  function load(key, def) {
    try {
      return JSON.parse(localStorage.getItem(key)) || def;
    } catch {
      return def;
    }
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
  // 6) FARGER (KATEGORI / BADGE)
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

  // ----------------------------------------------------------
  // 7) FOKUSER PÅ STED (“Se på kart”)
  // ----------------------------------------------------------
  function focusOnPlace(placeId) {
    const pl = (HG?.data?.places || []).find(p => p.id === placeId);
    if (pl && leafletMap) {
      leafletMap.setView([pl.lat, pl.lon], 16);
      pulseMarker(placeId);
    }
  }
  // ----------------------------------------------------------
  // VIS RUTE PÅ KART (lyst dag-sti på mørkt nattkart)
  // ----------------------------------------------------------
  function showRouteNow(route) {
    if (!route || !window.L || !leafletMap) return;

    // Fjern tidligere rute hvis en finnes
    if (map._activeLineOuter) leafletMap.removeLayer(map._activeLineOuter);
    if (map._activeLineInner) leafletMap.removeLayer(map._activeLineInner);

    // Hent koordinater fra ruten
    const coords = (route.stops || [])
      .map(s => {
        const pl = HG.data.places.find(p => p.id === s.placeId);
        return pl ? [pl.lat, pl.lon] : null;
      })
      .filter(Boolean);

    if (coords.length < 2) return;

    // Lys effekt rundt stien (nattlys)
    map._activeLineOuter = L.polyline(coords, {
      color: "#fff6b0",     // myk gyllen glød
      weight: 8,
      opacity: 0.18,
      lineJoin: "round",
      lineCap: "round"
    }).addTo(leafletMap);

    // Selve fotstien – tynnere og sterkere
    map._activeLineInner = L.polyline(coords, {
      color: "#ffe97f",     // varm lys-gul sti
      weight: 4,
      opacity: 0.9,
      lineJoin: "round",
      lineCap: "round"
    }).addTo(leafletMap);

    // Zoom til ruten
    leafletMap.fitBounds(L.latLngBounds(coords).pad(0.2));

    console.log(`🟡 Viser rute: ${route.name}`);
  }
  // ----------------------------------------------------------
  // 8) EKSPORT
  // ----------------------------------------------------------
  return {
  initMap,
  focusOnPlace,
  pulseMarker,
  highlightNearbyPlaces,
  showRouteNow, // 👈 legg til denne
};
})();
