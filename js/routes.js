// =====================================================
// ROUTES.JS – tematiske ruter (MapLibre) + “Nærmeste ruter”
// + rute fra posisjon → enkelt place (showRouteToPlace)
//
// Krever globals fra app.js:
//  - MAP (maplibregl.Map)
//  - PLACES, visited (visited kan mangle -> går fint)
//  - currentPos OR userPos OR userLat/userLon
//  - showToast(), openPlaceCard()
//  - START (fallback startpos)
//  - sheet: #sheetNearby + #sheetNearbyBody
// =====================================================

console.log("routes.js start");

let ROUTES = [];
let routesLoaded = false;

// MapLibre source/layers for temaruter
const HG_ROUTE_SRC  = "hg-thematic-route";
const HG_ROUTE_GLOW = "hg-thematic-route-glow";
const HG_ROUTE_LINE = "hg-thematic-route-line";
const HG_ROUTE_STOPS = "hg-thematic-route-stops";

// MapLibre source/layer for “rute til sted”
const HG_NAV_SRC  = "hg-nav-route";
const HG_NAV_LINE = "hg-nav-route-line";

// ---------- load ----------
async function loadRoutes() {
  if (routesLoaded) return ROUTES;

  try {
    // ✅ VIKTIG: ikke bruk "/data/..." (knekker på subpath)
    const res = await fetch("data/routes.json", { cache: "no-store" });
    if (!res.ok) throw new Error("routes.json http " + res.status);

    const data = await res.json();
    ROUTES.length = 0;
    if (Array.isArray(data)) ROUTES.push(...data);

    routesLoaded = true;
    if (window.DEBUG) console.log("[routes] lastet:", ROUTES.length);
    return ROUTES;
  } catch (err) {
    if (window.DEBUG) console.warn("[routes] load fail:", err);
    ROUTES.length = 0;
    routesLoaded = true;
    return ROUTES;
  }
}

// ---------- utils ----------
function toRad(d) { return (d * Math.PI) / 180; }

function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a1 = toRad(lat1);
  const a2 = toRad(lat2);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a1) * Math.cos(a2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(x));
}

function formatDist(m) {
  if (m == null) return "";
  const mm = Math.round(m);
  return mm < 1000 ? `${mm} m` : `${(mm / 1000).toFixed(1)} km`;
}

// Tåler flere pos-format (currentPos/userPos/userLat+userLon)
function getUserPos() {
  // ✅ Ny standard: én sannhet (HG_POS via getPos)
  if (typeof getPos === "function") {
    const p = getPos();
    if (p && typeof p.lat === "number" && typeof p.lon === "number") return p;
  }

  // (fallback) eldre globals hvis noe er lastet i feil rekkefølge
  if (typeof window.userLat === "number" && typeof window.userLon === "number") {
    return { lat: window.userLat, lon: window.userLon };
  }
  if (typeof window.userLat === "number" && typeof window.userLng === "number") {
    return { lat: window.userLat, lon: window.userLng };
  }

  return null;
}

// ---------- nearest-stop logic ----------
function computeNearestStop(route, userPosObj, visitedMap = null) {
  if (!route?.stops?.length || !userPosObj) return null;

  const candidates = route.stops
    .map((s, idx) => {
      const place = (window.PLACES || []).find(p => p.id === s.placeId);
      if (!place) return null;

      const distM = distanceMeters(userPosObj.lat, userPosObj.lon, place.lat, place.lon);
      const isVisited = visitedMap ? !!visitedMap[s.placeId] : false;

      return {
        distM,
        stopIndex: idx,
        placeId: s.placeId,
        stopTitle: s.title || place.name || "",
        place,
        isVisited
      };
    })
    .filter(Boolean);

  if (!candidates.length) return null;

  const unvisited = candidates.filter(c => !c.isVisited);
  const pool = unvisited.length ? unvisited : candidates;

  pool.sort((a, b) => a.distM - b.distM);
  return pool[0];
}

function getNearbyRoutesSorted(userPosObj, visitedMap = null) {
  if (!Array.isArray(ROUTES) || !ROUTES.length) return [];

  return ROUTES
    .map(r => {
      const n = computeNearestStop(r, userPosObj, visitedMap);
      return {
        ...r,
        _nearestDistM: n ? n.distM : null,
        _nearestStopIndex: n ? n.stopIndex : null,
        _nearestStopPlaceId: n ? n.placeId : null,
        _nearestStopName: n ? (n.stopTitle || n.place?.name || "") : ""
      };
    })
    .sort((a, b) => (a._nearestDistM ?? 1e12) - (b._nearestDistM ?? 1e12));
}

// =====================================================
// LEFT PANEL: ROUTES VIEW (panelRoutes / leftRoutesList)
// =====================================================

async function renderLeftRoutesList() {
  const box = document.getElementById("leftRoutesList");
  if (!box) return;

  // ✅ sørg for at ruter faktisk er lastet
  await loadRoutes();

  if (!ROUTES.length) {
    box.innerHTML = `<div class="muted">Ingen ruter lastet (routes.json tom / feil path).</div>`;
    return;
  }

  const pos = getUserPos();
  if (!pos) {
    box.innerHTML = `<div class="muted">Fant ikke posisjon ennå.</div>`;
    return;
  }

  const visitedMap =
    (typeof window.visited !== "undefined" && window.visited) ? window.visited : {};

  const list = getNearbyRoutesSorted(pos, visitedMap);

  if (!list.length) {
    box.innerHTML = `<div class="muted">Ingen ruter funnet.</div>`;
    return;
  }

  box.innerHTML = list
    .slice(0, 12)
    .map(r => {
      const dist = formatDist(r._nearestDistM);
      const stopName = r._nearestStopName || "";
      const title = r.title || r.name || "Rute";
      const routeId = r.id || "";

      return `
        <div class="left-route-item" data-route="${routeId}">
          <div class="left-route-title">${title}</div>
          <div class="left-route-meta muted">
            <div>${stopName}</div>
            <div>${dist}</div>
          </div>
        </div>
      `;
    })
    .join("");

  box.onclick = (e) => {
    const item = e.target.closest(".left-route-item");
    if (!item) return;
    const routeId = item.getAttribute("data-route");
    if (!routeId) return;

    // Klikk → vis rute på kart (bruk nærmeste stopp som start)
    const r = ROUTES.find(x => x.id === routeId);
    const pos = getUserPos();
    const n = (r && pos) ? computeNearestStop(r, pos, visitedMap) : null;
    const idx = n ? n.stopIndex : 0;

    if (typeof window.focusRouteOnMap === "function") {
      window.focusRouteOnMap(routeId, idx);
      return;
    }

    if (typeof window.openRoutesSheet === "function") {
      window.openRoutesSheet();
      return;
    }

    console.warn("[routes] Ingen visningsfunksjon funnet for", routeId);
  };
}

function setLeftPanelMode(mode) {
  const pNearby = document.getElementById("panelNearby");
  const pRoutes = document.getElementById("panelRoutes");
  const pBadges = document.getElementById("panelBadges");
  if (!pNearby || !pRoutes || !pBadges) return;

  pNearby.style.display = (mode === "nearby") ? "" : "none";
  pRoutes.style.display = (mode === "routes") ? "" : "none";
  pBadges.style.display = (mode === "badges") ? "" : "none";

  if (mode === "routes") renderLeftRoutesList();
}

function initLeftRoutesPanel() {
  const sel = document.getElementById("leftPanelMode");
  if (!sel) return;

  sel.addEventListener("change", () => setLeftPanelMode(sel.value));

  // Når geo kommer → oppdater ruter-lista hvis vi står i routes
  window.addEventListener("hg:geo", () => {
    if (sel.value === "routes") renderLeftRoutesList();
  });

  // Første sync
  setLeftPanelMode(sel.value || "nearby");
}

// =====================================================
// Map: tematisk rute (samme som din, men beholdt)
// =====================================================

function clearThematicRoute() {
  if (!window.MAP) return;

  if (MAP.getLayer(HG_ROUTE_STOPS)) MAP.removeLayer(HG_ROUTE_STOPS);
  if (MAP.getLayer(HG_ROUTE_LINE)) MAP.removeLayer(HG_ROUTE_LINE);
  if (MAP.getLayer(HG_ROUTE_GLOW)) MAP.removeLayer(HG_ROUTE_GLOW);
  if (MAP.getSource(HG_ROUTE_SRC)) MAP.removeSource(HG_ROUTE_SRC);
}

function focusRouteOnMap(routeId, startIndex = 0) {
  if (!window.MAP) return;

  const r = ROUTES.find(x => x.id === routeId);
  if (!r?.stops?.length) return;

  const places = r.stops
    .map(s => (window.PLACES || []).find(p => p.id === s.placeId))
    .filter(Boolean);

  if (!places.length) return;

  const sliced = places.slice(Math.max(0, startIndex));
  const coords = sliced.map(p => [p.lon, p.lat]);

  const geo = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: r.id, name: r.name },
        geometry: { type: "LineString", coordinates: coords }
      },
      ...sliced.map((p, i) => ({
        type: "Feature",
        properties: { placeId: p.id, name: p.name, idx: i + startIndex },
        geometry: { type: "Point", coordinates: [p.lon, p.lat] }
      }))
    ]
  };

  clearThematicRoute();
  MAP.addSource(HG_ROUTE_SRC, { type: "geojson", data: geo });

  MAP.addLayer({
    id: HG_ROUTE_GLOW,
    type: "line",
    source: HG_ROUTE_SRC,
    filter: ["==", ["geometry-type"], "LineString"],
    paint: {
      "line-color": "rgba(255,255,255,0.20)",
      "line-width": ["interpolate", ["linear"], ["zoom"], 10, 4, 14, 7, 18, 12],
      "line-blur": ["interpolate", ["linear"], ["zoom"], 10, 1.2, 14, 2.0, 18, 3.2],
      "line-opacity": 0.7
    }
  });

  MAP.addLayer({
    id: HG_ROUTE_LINE,
    type: "line",
    source: HG_ROUTE_SRC,
    filter: ["==", ["geometry-type"], "LineString"],
    paint: {
      "line-color": "#f6c800",
      "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2.5, 14, 4.5, 18, 7],
      "line-opacity": 0.95
    }
  });

  MAP.addLayer({
    id: HG_ROUTE_STOPS,
    type: "circle",
    source: HG_ROUTE_SRC,
    filter: ["==", ["geometry-type"], "Point"],
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 4, 14, 6, 18, 10],
      "circle-color": "#ffffff",
      "circle-stroke-color": "#000000",
      "circle-stroke-width": 1.4
    }
  });

  if (!MAP.__hgRouteStopsClickBound) {
    MAP.on("click", HG_ROUTE_STOPS, (e) => {
      const f = e.features && e.features[0];
      if (!f) return;
      const id = f.properties.placeId;
      const p = (window.PLACES || []).find(x => x.id === id);
      if (p && typeof window.openPlaceCard === "function") window.openPlaceCard(p);
    });
    MAP.__hgRouteStopsClickBound = true;
  }

  const b = coords.reduce(
    (bb, c) => bb.extend(c),
    new maplibregl.LngLatBounds(coords[0], coords[0])
  );
  MAP.fitBounds(b, { padding: 50 });

  if (typeof window.showToast === "function") window.showToast("Rute vist på kartet");
}

// -----------------------------------------------------
// Overlay (rutevisning)
// -----------------------------------------------------
function showRouteOverlay(routeId, startIndex = 0) {
  const r = ROUTES.find(x => x.id === routeId);
  if (!r) {
    if (typeof window.showToast === "function") window.showToast("Fant ikke rute.");
    return;
  }

  // Vis ruten på kartet (linje + stopp)
  try {
    if (typeof window.focusRouteOnMap === "function") {
      window.focusRouteOnMap(routeId, startIndex);
    }
  } catch (e) {
    console.warn("[showRouteOverlay] focusRouteOnMap failed", e);
  }

  if (typeof window.showToast === "function") {
    window.showToast(`${r.name || "Rute"} (${r.stops?.length || 0} stopp)`);
  }
}

function closeRouteOverlay() {
  // hvis du vil: clearThematicRoute();
  // clearThematicRoute();
}

// -----------------------------------------------------
// Compat: popup-utils forventer showRouteTo(place)
// -----------------------------------------------------
window.showRouteTo = function(place) {
  if (typeof window.showRouteToPlace === "function") {
    return window.showRouteToPlace(place);
  }
  if (typeof window.showToast === "function") {
    window.showToast("Rute-funksjon ikke lastet (showRouteToPlace mangler)");
  }
};

// ---------- expose globals ----------
window.ROUTES = ROUTES;
window.loadRoutes = loadRoutes;

window.showRouteOverlay = showRouteOverlay;
window.closeRouteOverlay = closeRouteOverlay;

window.showRouteToPlace = function(place) {
  if (!place) {
    if (typeof window.showToast === "function") window.showToast("Ingen sted-data.");
    return;
  }

  // direkte routeId om du har det senere
  const directRouteId =
    place.routeId ||
    place.route_id ||
    place.route ||
    place.routeRef ||
    null;

  if (directRouteId) return showRouteOverlay(directRouteId, 0);

  // finn rute som inneholder place.id
  const pid = place.id;
  if (pid && Array.isArray(ROUTES) && ROUTES.length) {
    const r = ROUTES.find(rt => Array.isArray(rt.stops) && rt.stops.some(s => s.placeId === pid));
    if (r) {
      const idx = r.stops.findIndex(s => s.placeId === pid);
      return showRouteOverlay(r.id, Math.max(0, idx));
    }
  }

  if (typeof window.showToast === "function") {
    window.showToast("Fant ingen rute som inkluderer dette stedet.");
  }
};

window.focusRouteOnMap = focusRouteOnMap;
window.clearThematicRoute = clearThematicRoute;

window.computeNearestStop = computeNearestStop;
window.getNearbyRoutesSorted = getNearbyRoutesSorted;

document.addEventListener("DOMContentLoaded", () => {
  // sørg for at ROUTES er lastet tidlig
  loadRoutes();

  try { initLeftRoutesPanel(); } catch (e) { console.warn("[initLeftRoutesPanel]", e); }
});

console.log("routes.js end", typeof window.showRouteToPlace);
