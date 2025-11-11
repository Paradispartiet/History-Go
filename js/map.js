// ============================================================
// === HISTORY GO – MAP.JS (v3.7, dag/natt + lysende fotruter) ===
// ============================================================
//
//  • Nattkart over dagkart (for lysrute-effekt)
//  • Ruter som ekte gangveier (OSRM) med glød i tre lag
//  • Full støtte for markører, quiz, puls, nærhet, toast, profil
// ============================================================

const map = (() => {
  let leafletMap;
  let markers = {};

  // ----------------------------------------------------------
  // 1) INITIER KARTET (dag under natt, for lysrute-effekt)
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

    // --- Dagkart (under) ---
    const dayLayer = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, zIndex: 1 }
    ).addTo(leafletMap);

    // --- Nattkart (over) ---
    const nightLayer = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, opacity: 1, zIndex: 2 }
    ).addTo(leafletMap);

    drawPlaceMarkers(places);
    setTimeout(() => leafletMap.invalidateSize(), 400);

    // Lagre referanser
    map._dayLayer = dayLayer;
    map._nightLayer = nightLayer;

    console.log(`🗺️ Kart initialisert med ${places.length} steder (dag/natt aktivert)`);
  }

  // ----------------------------------------------------------
  // 2) MARKØRER (hover, trykk, debug-trygg)
  // ----------------------------------------------------------
  function drawPlaceMarkers(places = []) {
    if (!leafletMap || !Array.isArray(places)) {
      console.warn("❗ drawPlaceMarkers: leafletMap eller places mangler");
      return;
    }

    Object.values(markers).forEach(m => leafletMap.removeLayer(m));
    markers = {};

    const visited = load("visited_places", []);
    const visitedIds = visited.map(v => v.id);

    places.forEach(p => {
      if (!p.lat || !p.lon) {
        console.warn(`⚠️ Ugyldige koordinater for sted: ${p.name}`);
        return;
      }

      const color = catColor(p.category);
      const visitedHere = visitedIds.includes(p.id);

      const icon = L.divIcon({
        className: "place-marker",
        html: `<div style="
          background:${color};
          border:${visitedHere ? '2px solid #fff' : '2px solid transparent'};
          box-shadow:${visitedHere ? '0 0 8px #fff5' : '0 0 5px rgba(0,0,0,.4)'};
          width:14px; height:14px; border-radius:50%;
          transition: transform .15s ease;
        "></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      const m = L.marker([p.lat, p.lon], { icon }).addTo(leafletMap);
      const popupHTML = `
        <strong>${p.name}</strong><br>
        <small>${p.category || ""}</small><br><br>
        <button class="popup-quiz-btn" data-id="${p.id}">Ta quiz</button>
        <button class="popup-map-btn" data-id="${p.id}" style="margin-left:6px;">Se på kart</button>
      `;

      m.bindPopup(popupHTML);

      m.on("popupopen", e => {
        const node = e.popup._contentNode;
        const quizBtn = node.querySelector(".popup-quiz-btn");
        const mapBtn = node.querySelector(".popup-map-btn");

        if (quizBtn) quizBtn.onclick = () => {
          e.popup._close();
          if (window.quiz?.startQuiz) quiz.startQuiz(p.id);
        };
        if (mapBtn) mapBtn.onclick = () => {
          e.popup._close();
          if (window.map?.focusOnPlace) map.focusOnPlace(p.id);
        };
      });

      m.on("click", () => handlePlaceClick(p.id));
      m.on("mouseover", () => m._icon.querySelector("div").style.transform = "scale(1.4)");
      m.on("mouseout",  () => m._icon.querySelector("div").style.transform = "scale(1)");

      markers[p.id] = m;
    });

    console.log(`📍 Tegnet ${Object.keys(markers).length} steder på kartet`);
  }

  // ----------------------------------------------------------
  // 3) TRYKK PÅ STED
  // ----------------------------------------------------------
  function handlePlaceClick(placeId) {
    const pl = (HG?.data?.places || []).find(x => x.id === placeId);
    if (!pl) {
      console.warn(`⚠️ Fant ikke sted med id: ${placeId}`);
      return;
    }

    pulseMarker(placeId);
    ui?.showToast?.(`📍 ${pl.name} (${pl.category || "ukjent"})`);

    const visited = load("visited_places", []);
    if (!visited.some(v => v.id === placeId)) {
      visited.push({
        id: pl.id, name: pl.name, category: pl.category,
        lat: pl.lat, lon: pl.lon, year: pl.year || null,
        date: new Date().toISOString()
      });
      save("visited_places", visited);
      window.dispatchEvent(new Event("updateProfile"));
    }

    document.dispatchEvent(new CustomEvent("placeSelected", { detail: { placeId } }));
    if (window.HGConsole) HGConsole.log(`📍 Klikket på sted: ${pl.name}`, "cmd");

    if (leafletMap && pl.lat && pl.lon)
      leafletMap.flyTo([pl.lat, pl.lon], 16, { duration: 1.2 });
  }

  // ----------------------------------------------------------
  // 4) PULS-EFFEKT
  // ----------------------------------------------------------
  function pulseMarker(id) {
    const el = markers[id]?._icon?.querySelector("div");
    if (!el) return;
    el.style.transition = "none";
    el.style.transform = "scale(1)";
    el.style.opacity = "1";
    void el.offsetWidth;
    el.style.transition = "transform 0.6s cubic-bezier(0.33,1,0.68,1), opacity 0.6s ease";
    el.style.transform = "scale(1.7)";
    el.style.opacity = "0.4";
    setTimeout(() => {
      el.style.transform = "scale(1)";
      el.style.opacity = "1";
    }, 600);
  }

  // ----------------------------------------------------------
  // 5) NÆRHET & HJELPERE
  // ----------------------------------------------------------
  function highlightNearbyPlaces(lat, lon, radius = 150) {
    const nearby = (HG?.data?.places || []).filter(p => distance(lat, lon, p.lat, p.lon) <= radius);
    nearby.forEach(p => pulseMarker(p.id));
  }

  function load(key, def) {
    try { return JSON.parse(localStorage.getItem(key)) || def; }
    catch { return def; }
  }

  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch {}
  }

  function distance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // ----------------------------------------------------------
  // 6) FARGER
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
  // 7) FOKUSER PÅ STED
  // ----------------------------------------------------------
  function focusOnPlace(placeId) {
    const pl = (HG?.data?.places || []).find(p => p.id === placeId);
    if (pl && leafletMap) {
      leafletMap.setView([pl.lat, pl.lon], 16);
      pulseMarker(placeId);
    }
  }

  // ----------------------------------------------------------
  // 8) RUTER – ekte gangvei (OSRM) + låst tykkelse
  // ----------------------------------------------------------
  function clearActiveRoute() {
    ['_activeGlow','_activeLineOuter','_activeLineInner'].forEach(k => {
      if (map[k]) {
        leafletMap.removeLayer(map[k]);
        map[k] = null;
      }
    });
  }

  async function showRouteNow(route) {
    if (!route || !leafletMap) return;
    ui?.showToast?.("⏳ Henter rute...");
    clearActiveRoute();

    const coordPairs = (route.stops || [])
      .map(s => {
        const pl = HG.data.places.find(p => p.id === s.placeId);
        return pl ? [pl.lon, pl.lat] : null;
      })
      .filter(Boolean);

    if (coordPairs.length < 2) return;

    const query = coordPairs.map(c => c.join(',')).join(';');
    const url = `https://router.project-osrm.org/route/v1/foot/${query}?overview=full&geometries=geojson`;
    let walkCoords = [];
    try {
      const res = await fetch(url);
      const json = await res.json();
      walkCoords = json.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
    } catch (err) {
      console.warn("Kunne ikke hente fotrute:", err);
      walkCoords = coordPairs.map(c => [c[1], c[0]]);
    }

    map._activeGlow = L.polyline(walkCoords, {
      color: "#fffbe6",
      weight: 30,
      opacity: 0.08,
      pane: 'shadowPane',
      lineJoin: "round",
      lineCap: "round"
    }).addTo(leafletMap);

    map._activeLineOuter = L.polyline(walkCoords, {
      color: "#fff6b0",
      weight: 8,
      opacity: 0.22,
      pane: 'shadowPane',
      lineJoin: "round",
      lineCap: "round"
    }).addTo(leafletMap);

    map._activeLineInner = L.polyline(walkCoords, {
      color: "#ffe97f",
      weight: 4,
      opacity: 0.9,
      pane: 'shadowPane',
      lineJoin: "round",
      lineCap: "round"
    }).addTo(leafletMap);

    leafletMap.fitBounds(L.latLngBounds(walkCoords).pad(0.2));
    console.log(`🥾 Fotrute aktivert: ${route.name}`);
  }

  // ----------------------------------------------------------
  // 9) EKSPORT
  // ----------------------------------------------------------
  return {
    initMap,
    focusOnPlace,
    pulseMarker,
    highlightNearbyPlaces,
    showRouteNow
  };
})();
