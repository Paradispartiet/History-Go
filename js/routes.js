// =====================================================
// routes.js — History GO
//  A) Ekte gangrute: brukerposisjon -> valgt sted (ORS)
//  B) Tematiske ruter: routes.json (stops[]) + visning på kart + venstrepanel
//
// Krever (globals):
//  - MAP (MapLibre map) i window.MAP
//  - PLACES (array) i window.PLACES
//  - getPos() (fra app.js) ELLER legacy userLat/userLon
//  - showToast(msg) (valgfritt)
//  - openPlaceCard(place) (valgfritt)
//
// HTML forventet (valgfritt):
//  - #leftPanelMode select med value: nearby|routes|badges
//  - #panelRoutes og #leftRoutesList
// =====================================================

console.log("routes.js start");

// -------------------- Config --------------------
const HG_ORS = {
  baseUrl: "https://api.openrouteservice.org",
  apiKey: apiKey: "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1NjAxMzZmNDg0ZDQ0NzM4OTFlMWU1ODJjMjE5NzZlIiwiaCI6Im11cm11cjY0In0=",
  profile: "foot-walking"
};

// -------------------- State --------------------
let ROUTES = [];
let routesLoaded = false;

// -------------------- MapLibre IDs --------------------
// Tematiske ruter
const HG_ROUTE_SRC   = "hg-thematic-route";
const HG_ROUTE_GLOW  = "hg-thematic-route-glow";
const HG_ROUTE_LINE  = "hg-thematic-route-line";
const HG_ROUTE_STOPS = "hg-thematic-route-stops";

// Navigasjon: gangrute (ORS)
const HG_NAV_SRC  = "hg-nav-route";
const HG_NAV_LINE = "hg-nav-route-line";

// =====================================================
// Helpers
// =====================================================
function _toast(msg) {
  if (typeof window.showToast === "function") window.showToast(msg);
}

function getUserPos() {
  // Ny standard: HG_POS via getPos()
  if (typeof window.getPos === "function") {
    const p = window.getPos();
    if (p && Number.isFinite(p.lat) && Number.isFinite(p.lon)) return p;
  }
  // Legacy fallback
  if (Number.isFinite(window.userLat) && Number.isFinite(window.userLon)) {
    return { lat: window.userLat, lon: window.userLon };
  }
  if (Number.isFinite(window.userLat) && Number.isFinite(window.userLng)) {
    return { lat: window.userLat, lon: window.userLng };
  }
  return null;
}

function _placeById(id) {
  return (window.PLACES || []).find(p => p.id === id) || null;
}

function _ensureMapReady() {
  return !!window.MAP;
}

// =====================================================
// A) Load thematic routes
// =====================================================
async function loadRoutes() {
  if (routesLoaded) return ROUTES;

  try {
    const res = await fetch("data/routes.json", { cache: "no-store" });
    if (!res.ok) throw new Error("routes.json http " + res.status);
    const data = await res.json();

    ROUTES = Array.isArray(data) ? data : [];
    routesLoaded = true;
    if (window.DEBUG) console.log("[routes] loaded:", ROUTES.length);
    return ROUTES;
  } catch (e) {
    routesLoaded = true;
    ROUTES = [];
    console.warn("[routes] load failed:", e);
    return ROUTES;
  }
}

// =====================================================
// B) Tematic route drawing
// =====================================================
function clearThematicRoute() {
  if (!_ensureMapReady()) return;
  try {
    if (MAP.getLayer(HG_ROUTE_STOPS)) MAP.removeLayer(HG_ROUTE_STOPS);
    if (MAP.getLayer(HG_ROUTE_LINE))  MAP.removeLayer(HG_ROUTE_LINE);
    if (MAP.getLayer(HG_ROUTE_GLOW))  MAP.removeLayer(HG_ROUTE_GLOW);
    if (MAP.getSource(HG_ROUTE_SRC))  MAP.removeSource(HG_ROUTE_SRC);
  } catch (e) {}
}

function focusRouteOnMap(routeId, startIndex = 0) {
  if (!_ensureMapReady()) return;

  const r = ROUTES.find(x => x.id === routeId);
  if (!r?.stops?.length) return;

  const places = r.stops
    .map(s => _placeById(s.placeId))
    .filter(Boolean);

  if (!places.length) return;

  const sliced = places.slice(Math.max(0, startIndex));
  const coords = sliced.map(p => [p.lon, p.lat]);
  if (coords.length < 2) return;

  const geo = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { id: r.id, name: r.name || r.title || "Rute" },
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
      "line-blur":  ["interpolate", ["linear"], ["zoom"], 10, 1.2, 14, 2.0, 18, 3.2],
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
      const id = f.properties?.placeId;
      const p = id ? _placeById(id) : null;
      if (p && typeof window.openPlaceCard === "function") window.openPlaceCard(p);
    });
    MAP.__hgRouteStopsClickBound = true;
  }

  const b = coords.reduce(
    (bb, c) => bb.extend(c),
    new maplibregl.LngLatBounds(coords[0], coords[0])
  );
  MAP.fitBounds(b, { padding: 60 });

  _toast("Rute vist på kartet");
}

function showRouteOverlay(routeId, startIndex = 0) {
  // “overlay” hos deg = vis linja + toast
  const r = ROUTES.find(x => x.id === routeId);
  if (!r) { _toast("Fant ikke rute."); return; }

  try { focusRouteOnMap(routeId, startIndex); }
  catch (e) { console.warn("[showRouteOverlay] focusRouteOnMap failed", e); }

  _toast(`${r.name || r.title || "Rute"} (${r.stops?.length || 0} stopp)`);
}

function closeRouteOverlay() {
  // placeholder — hvis du senere lager et faktisk overlay
}

// =====================================================
// C) ORS walking route (user -> place)
// =====================================================
function clearNavRoute() {
  if (!_ensureMapReady()) return;
  try {
    if (MAP.getLayer(HG_NAV_LINE)) MAP.removeLayer(HG_NAV_LINE);
    if (MAP.getSource(HG_NAV_SRC)) MAP.removeSource(HG_NAV_SRC);
  } catch (e) {}
}

async function fetchORSRouteGeoJSON(from, to) {
  // from/to: [lon, lat]
  if (!HG_ORS.apiKey || HG_ORS.apiKey.includes("PUTT_ORS_KEY_HER")) {
    throw new Error("Mangler ORS apiKey (HG_ORS.apiKey).");
  }

  const url =
    `${HG_ORS.baseUrl}/v2/directions/${HG_ORS.profile}/geojson` +
    `?start=${from[0]},${from[1]}` +
    `&end=${to[0]},${to[1]}`;

  const r = await fetch(url, {
    headers: {
      "Authorization": HG_ORS.apiKey,
      "Accept": "application/geo+json,application/json"
    }
  });
  if (!r.ok) throw new Error(`ORS directions HTTP ${r.status}`);

  const geojson = await r.json();
  const feat = geojson?.features?.[0];
  const coords = feat?.geometry?.coordinates;

  if (!feat || !Array.isArray(coords) || coords.length < 2) {
    throw new Error("ORS ga ingen gyldig rute-geometri.");
  }

  const summary = feat?.properties?.summary || {};
  return { geojson, distance_m: summary.distance, duration_s: summary.duration };
}

async function showWalkingRouteToPlace(place) {
  if (!_ensureMapReady()) return;
  if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) return;

  const pos = getUserPos();
  if (!pos) { _toast("Fant ikke posisjon ennå."); return; }

  const from = [pos.lon, pos.lat];
  const to   = [place.lon, place.lat];

  clearNavRoute();

  let out;
  try {
    out = await fetchORSRouteGeoJSON(from, to);
  } catch (e) {
    console.warn("[ORS route] failed", e);
    _toast("Kunne ikke hente gangrute (ORS).");
    return;
  }

  MAP.addSource(HG_NAV_SRC, { type: "geojson", data: out.geojson });

  MAP.addLayer({
    id: HG_NAV_LINE,
    type: "line",
    source: HG_NAV_SRC,
    paint: {
      "line-color": "#00d4ff",
      "line-width": ["interpolate", ["linear"], ["zoom"], 10, 3, 14, 5, 18, 8],
      "line-opacity": 0.95
    }
  });

  const coords = out.geojson.features[0].geometry.coordinates;
  const b = coords.reduce(
    (bb, c) => bb.extend(c),
    new maplibregl.LngLatBounds(coords[0], coords[0])
  );
  MAP.fitBounds(b, { padding: 60 });

  if (Number.isFinite(out.distance_m) && Number.isFinite(out.duration_s)) {
    const km = (out.distance_m / 1000).toFixed(1);
    const min = Math.round(out.duration_s / 60);
    _toast(`Gårute: ${km} km · ca ${min} min`);
  } else {
    _toast(`Gårute til ${place.name || "sted"}`);
  }
}

// =====================================================
// D) Left panel list (nearest routes)
// =====================================================
function formatDist(m) {
  if (m == null) return "";
  const mm = Math.round(m);
  return mm < 1000 ? `${mm} m` : `${(mm / 1000).toFixed(1)} km`;
}
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

function computeNearestStop(route, userPosObj, visitedMap = null) {
  if (!route?.stops?.length || !userPosObj) return null;

  const candidates = route.stops
    .map((s, idx) => {
      const place = _placeById(s.placeId);
      if (!place) return null;

      const distM = distanceMeters(userPosObj.lat, userPosObj.lon, place.lat, place.lon);
      const isVisited = visitedMap ? !!visitedMap[s.placeId] : false;

      return { distM, stopIndex: idx, placeId: s.placeId, place, isVisited };
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
        _nearestStopIndex: n ? n.stopIndex : 0,
        _nearestStopName: n ? (n.place?.name || "") : ""
      };
    })
    .sort((a, b) => (a._nearestDistM ?? 1e12) - (b._nearestDistM ?? 1e12));
}

async function renderLeftRoutesList() {
  const box = document.getElementById("leftRoutesList");
  if (!box) return;

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

  const visitedMap = (typeof window.visited !== "undefined" && window.visited) ? window.visited : {};
  const list = getNearbyRoutesSorted(pos, visitedMap);

  box.innerHTML = list.slice(0, 12).map(r => {
    const title = r.title || r.name || "Rute";
    const dist = formatDist(r._nearestDistM);
    const stop = r._nearestStopName || "";
    return `
      <div class="left-route-item" data-route="${r.id}">
        <div class="left-route-title">${title}</div>
        <div class="left-route-meta muted">
          <div>${stop}</div>
          <div>${dist}</div>
        </div>
      </div>
    `;
  }).join("");

  box.onclick = (e) => {
    const item = e.target.closest(".left-route-item");
    if (!item) return;
    const routeId = item.getAttribute("data-route");
    if (!routeId) return;

    const pos = getUserPos();
    const visitedMap = (typeof window.visited !== "undefined" && window.visited) ? window.visited : {};
    const r = ROUTES.find(x => x.id === routeId);
    const n = (r && pos) ? computeNearestStop(r, pos, visitedMap) : null;
    const idx = n ? n.stopIndex : 0;

    showRouteOverlay(routeId, idx);
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

  // når pos oppdateres → refresh rute-liste hvis vi står i routes
  window.addEventListener("hg:geo", () => {
    if (sel.value === "routes") renderLeftRoutesList();
  });

  setLeftPanelMode(sel.value || "nearby");
}

// =====================================================
// Public API (clean) + Compat for popup-utils
// =====================================================
window.HGRoutes = {
  load: loadRoutes,

  init() {
    loadRoutes();
    initLeftRoutesPanel();
  },

  // Tematisk rute
  showThematic(routeId, startIndex = 0) {
    showRouteOverlay(routeId, startIndex);
  },

  clearThematic() {
    clearThematicRoute();
  },

  // Gangrute (ORS)
  async showToPlace(place) {
    await showWalkingRouteToPlace(place);
  },

  clearNav() {
    clearNavRoute();
  },

  clearAll() {
    clearNavRoute();
    clearThematicRoute();
  }
};

// Compat: popup-utils forventer showRouteTo(place)
// og noen steder forventer showRouteToPlace(place)
window.showRouteToPlace = (place) => window.HGRoutes.showToPlace(place);
window.showRouteTo = function(place) {
  if (typeof window.showRouteToPlace === "function") return window.showRouteToPlace(place);
  _toast("Rute-funksjon ikke lastet");
};

document.addEventListener("DOMContentLoaded", () => {
  try { window.HGRoutes.init(); } catch (e) { console.warn("[HGRoutes.init]", e); }
});

console.log("routes.js end", typeof window.showRouteToPlace);
