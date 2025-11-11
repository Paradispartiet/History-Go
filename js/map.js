// ============================================================
// === HISTORY GO – MAP.JS (v3.3, komplett og kompatibel) =====
// ============================================================
//
//  • Viser steder som fargede prikker etter kategori
//  • Popup inneholder “Ta quiz”-knapp som starter quizen
//  • Ingen faste ruter vises automatisk
//  • Støtter puls, nærhets-effekt og “Se på kart”
// ============================================================

const map = (() => {
  let leafletMap;
  let markers = {};

  // ----------------------------------------------------------
  // INITIER KARTET
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

    // Bakgrunnslag
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      tileSize: 256,
      crossOrigin: true,
    }).addTo(leafletMap);

    drawPlaceMarkers(places);

    // Viktig for Safari/iPad
    setTimeout(() => leafletMap.invalidateSize(), 400);

    console.log(`🗺️ Kart initialisert med ${places.length} steder`);
  }

  // ----------------------------------------------------------
  // MARKØRER (med "Ta quiz"-knapp)
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
  // “SE PÅ KART” FRA APP.JS
  // ----------------------------------------------------------
  function focusOnPlace(placeId) {
    const pl = (HG?.data?.places || []).find((x) => x.id === placeId);
    if (!pl || !leafletMap) return;

    leafletMap.setView([pl.lat, pl.lon], 16, { animate: true });
    const marker = markers[placeId];
    if (marker) {
      marker.openPopup();
      pulseMarker(placeId);
    }
  }

  // ----------------------------------------------------------
  // TRYKK PÅ STED
  // ----------------------------------------------------------
  function handlePlaceClick(placeId) {
    const pl = (HG?.data?.places || []).find((x) => x.id === placeId);
    if (!pl) return;

    pulseMarker(placeId);
    document.dispatchEvent(new CustomEvent("placeSelected", { detail: { placeId } }));
    ui.showToast(`📍 ${pl.name}`);
  }

  // ----------------------------------------------------------
  // VISUELLE EFFEKTER
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
  // NÆRHET & HJELPERE
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
  // FARGER
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
  // 9) FOKUSER PÅ STED (for "Se på kart"-knappen)
  // ----------------------------------------------------------
  function focusOnPlace(placeId) {
    const pl = (HG?.data?.places || []).find(p => p.id === placeId);
    if (pl && leafletMap) {
      leafletMap.setView([pl.lat, pl.lon], 16);
      pulseMarker(placeId); // liten animasjon for å fremheve stedet
    }
  }
  
  // ----------------------------------------------------------
  // EKSPORT
  // ----------------------------------------------------------
  return {
    initMap,
    focusOnPlace,
    pulseMarker,
    highlightNearbyPlaces,
  };
})();
