// =====================================================
// routes.js — History GO
//  A) Ekte gangrute: brukerposisjon -> valgt sted (ORS)
//  B) Tematiske ruter: KUN data/routes.json + visning på kart + Nearby/rutefane
// =====================================================

console.log("routes.js start");

const HG_ORS = {
  baseUrl: "https://api.openrouteservice.org",
  apiKey: "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6Ijg1NjAxMzZmNDg0ZDQ0NzM4OTFlMWU1ODJjMjE5NzZlIiwiaCI6Im11cm11cjY0In0=",
  profile: "foot-walking"
};

window.HG_ORS = window.HG_ORS || {};
window.HG_ORS.baseUrl = HG_ORS.baseUrl;
window.HG_ORS.apiKey  = HG_ORS.apiKey;
window.HG_ORS.profile = HG_ORS.profile;

let ROUTES = [];
let routesLoaded = false;

const HG_ROUTE_SRC   = "hg-thematic-route";
const HG_ROUTE_GLOW  = "hg-thematic-route-glow";
const HG_ROUTE_LINE  = "hg-thematic-route-line";
const HG_ROUTE_STOPS = "hg-thematic-route-stops";

const HG_NAV_SRC  = "hg-nav-route";
const HG_NAV_LINE = "hg-nav-route-line";

function _toast(msg) {
  if (typeof window.showToast === "function") window.showToast(msg);
}

function _getMap() {
  const map = window.MAP || window.HGMap?.getMap?.() || null;
  if (map && window.MAP !== map) window.MAP = map;
  return map;
}

function _escapeHTML(v) {
  return String(v ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function _validRoutes() {
  return ROUTES.filter(r => r?.id && Array.isArray(r.stops) && r.stops.length);
}

function _routeById(routeId) {
  return _validRoutes().find(x => x.id === routeId) || null;
}

function _placeById(id) {
  return (window.PLACES || []).find(p => p.id === id) || null;
}

function getUserPos() {
  if (typeof window.getPos === "function") {
    const p = window.getPos();
    if (p && Number.isFinite(p.lat) && Number.isFinite(p.lon)) return p;
  }

  if (Number.isFinite(window.userLat) && Number.isFinite(window.userLon)) {
    return { lat: window.userLat, lon: window.userLon };
  }

  if (Number.isFinite(window.userLat) && Number.isFinite(window.userLng)) {
    return { lat: window.userLat, lon: window.userLng };
  }

  return null;
}

function getActiveRouteBadgeFilter() {
  return window.HG_getActiveBadgeFilter?.() || window.HG_NEARBY_BADGE_FILTER || "all";
}

function isRouteBadgeFilterActive() {
  const f = getActiveRouteBadgeFilter();
  return !!f && f !== "all";
}

function routeMatchesActiveBadge(route) {
  if (!isRouteBadgeFilterActive()) return true;

  const badge = String(getActiveRouteBadgeFilter()).trim();
  if (!route?.stops?.length) return false;

  return route.stops.some(stop => {
    const p = _placeById(stop.placeId);
    return p && String(p.category || "").trim() === badge;
  });
}

function activeBadgeNameForRoutes() {
  const id = getActiveRouteBadgeFilter();
  const cats = Array.isArray(window.CATEGORY_LIST) ? window.CATEGORY_LIST : [];
  const c = cats.find(x => String(x.id || "").trim() === String(id).trim());
  return c?.name || id;
}

function _ensureRoutePanelStyles() {
  if (document.getElementById("hg-route-strip-styles")) return;

  const style = document.createElement("style");
  style.id = "hg-route-strip-styles";
  style.textContent = `
    #panelRoutes.leftpanel-view{
      padding:0 8px;
      justify-content:flex-start;
    }

    #leftRoutesList{
      margin-top:12px;
      height:160px;
      width:100%;
      min-height:160px;
      flex:0 0 auto;

      display:flex;
      align-items:center;
      gap:12px;

      overflow-x:auto;
      overflow-y:hidden;
      -webkit-overflow-scrolling:touch;
      scrollbar-width:none;

      padding:12px 2px 0;
    }

    #leftRoutesList::-webkit-scrollbar{ display:none; }

    #leftRoutesList .left-route-item{
      flex:0 0 220px;
      width:220px;
      height:150px;
      position:relative;
      overflow:hidden;
      border:0;
      border-radius:20px;
      padding:14px;

      display:flex;
      flex-direction:column;
      justify-content:flex-end;
      gap:6px;

      background:
        radial-gradient(circle at 18% 12%, rgba(255,255,255,.18), transparent 34%),
        linear-gradient(135deg, rgba(52,199,89,.52), rgba(8,20,12,.96));
      color:#fff;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);
      scroll-snap-align:start;
      cursor:pointer;
      text-align:left;
    }

    #leftRoutesList .left-route-item::before{
      content:"";
      position:absolute;
      inset:0;
      background:linear-gradient(to bottom, transparent 44%, rgba(0,0,0,.48) 100%);
      pointer-events:none;
    }

    #leftRoutesList .left-route-title,
    #leftRoutesList .left-route-meta{
      position:relative;
      z-index:1;
      pointer-events:none;
    }

    #leftRoutesList .left-route-title{
      font-size:16px;
      line-height:1.08;
      font-weight:900;
      color:#fff;
      text-shadow:0 2px 8px rgba(0,0,0,.78);
    }

    #leftRoutesList .left-route-meta{
      display:flex;
      justify-content:space-between;
      align-items:flex-end;
      gap:10px;
      font-size:11px;
      line-height:1.1;
      color:rgba(255,255,255,.86);
      text-shadow:0 2px 8px rgba(0,0,0,.78);
    }

    #leftRoutesList .left-route-stop{
      min-width:0;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }

    #leftRoutesList .left-route-dist{
      flex:0 0 auto;
      white-space:nowrap;
      font-weight:800;
    }
  `;
  document.head.appendChild(style);
}

function _enterRouteMapMode() {
  document.body?.classList.add("map-only");

  if (window.LayerManager?.setMode) {
    window.LayerManager.setMode("map");
  } else if (typeof window.enterMapMode === "function") {
    window.enterMapMode();
  }

  const btnSeeMap = document.getElementById("btnSeeMap");
  const btnExitMap = document.getElementById("btnExitMap");
  if (btnSeeMap) btnSeeMap.style.display = "none";
  if (btnExitMap) btnExitMap.style.display = "block";

  window.setPlaceCardCollapsed?.(true);
  window.setNearbyCollapsed?.(true);

  window.HGMap?.resize?.();
  _getMap()?.resize?.();
}

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

function clearThematicRoute() {
  const map = _getMap();
  if (!map) return;

  try {
    if (map.getLayer(HG_ROUTE_STOPS)) map.removeLayer(HG_ROUTE_STOPS);
    if (map.getLayer(HG_ROUTE_LINE))  map.removeLayer(HG_ROUTE_LINE);
    if (map.getLayer(HG_ROUTE_GLOW))  map.removeLayer(HG_ROUTE_GLOW);
    if (map.getSource(HG_ROUTE_SRC))  map.removeSource(HG_ROUTE_SRC);
  } catch (e) {}
}

function focusRouteOnMap(routeId, startIndex = 0) {
  const map = _getMap();
  if (!map) {
    _toast("Kartet er ikke klart ennå.");
    return;
  }

  if (typeof map.isStyleLoaded === "function" && !map.isStyleLoaded()) {
    map.once("load", () => focusRouteOnMap(routeId, startIndex));
    return;
  }

  const r = _routeById(routeId);
  if (!r?.stops?.length) {
    _toast("Fant ikke rute.");
    return;
  }

  const places = r.stops
    .map(s => _placeById(s.placeId))
    .filter(Boolean)
    .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon));

  if (!places.length) {
    _toast("Ruten har ingen gyldige stopp i PLACES.");
    return;
  }

  const sliced = places.slice(Math.max(0, startIndex));
  const visiblePlaces = sliced.length ? sliced : places;
  const coords = visiblePlaces.map(p => [Number(p.lon), Number(p.lat)]);

  const features = [];

  if (coords.length >= 2) {
    features.push({
      type: "Feature",
      properties: { id: r.id, name: r.name || r.title || "Rute" },
      geometry: { type: "LineString", coordinates: coords }
    });
  }

  features.push(...visiblePlaces.map((p, i) => ({
    type: "Feature",
    properties: { placeId: p.id, name: p.name, idx: i + startIndex },
    geometry: { type: "Point", coordinates: [Number(p.lon), Number(p.lat)] }
  })));

  const geo = { type: "FeatureCollection", features };

  try {
    if (!map.getSource(HG_ROUTE_SRC)) {
      map.addSource(HG_ROUTE_SRC, { type: "geojson", data: geo });
    } else {
      map.getSource(HG_ROUTE_SRC).setData(geo);
    }

    if (!map.getLayer(HG_ROUTE_GLOW)) {
      map.addLayer({
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
    }

    if (!map.getLayer(HG_ROUTE_LINE)) {
      map.addLayer({
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
    }

    if (!map.getLayer(HG_ROUTE_STOPS)) {
      map.addLayer({
        id: HG_ROUTE_STOPS,
        type: "circle",
        source: HG_ROUTE_SRC,
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 14, 7, 18, 11],
          "circle-color": "#ffffff",
          "circle-stroke-color": "#000000",
          "circle-stroke-width": 1.8
        }
      });
    }

    if (!map.__hgRouteStopsClickBound) {
      map.on("click", HG_ROUTE_STOPS, (e) => {
        const f = e.features && e.features[0];
        if (!f) return;

        const id = f.properties?.placeId;
        const p = id ? _placeById(id) : null;

        if (p && typeof window.openPlaceCard === "function") {
          window.openPlaceCard(p);
        }
      });

      map.__hgRouteStopsClickBound = true;
    }

    if (coords.length === 1) {
      map.flyTo({
        center: coords[0],
        zoom: Math.max(map.getZoom() || 13, 15),
        essential: true
      });
    } else {
      const b = coords.reduce(
        (bb, c) => bb.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );

      map.fitBounds(b, { padding: 70, maxZoom: 16 });
    }

    _toast(coords.length >= 2 ? "Rute vist på kartet" : "Rutestopp vist på kartet");
  } catch (e) {
    console.warn("[routes] thematic route draw failed", e);
    _toast("Kunne ikke tegne ruten på kartet.");
  }
}

function showRouteOverlay(routeId, startIndex = 0) {
  const r = _routeById(routeId);
  if (!r) {
    _toast("Fant ikke rute.");
    return;
  }

  _enterRouteMapMode();

  setTimeout(() => {
    try {
      focusRouteOnMap(routeId, startIndex);
    } catch (e) {
      console.warn("[showRouteOverlay] focusRouteOnMap failed", e);
    }
  }, 160);

  _toast(`${r.name || r.title || "Rute"} (${r.stops?.length || 0} stopp)`);
}

function clearNavRoute() {
  const map = _getMap();
  if (!map) return;

  try {
    if (map.getLayer(HG_NAV_LINE)) map.removeLayer(HG_NAV_LINE);
    if (map.getSource(HG_NAV_SRC)) map.removeSource(HG_NAV_SRC);
  } catch (e) {}
}

async function fetchORSRouteGeoJSON(from, to) {
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
  const map = _getMap();
  if (!map) return;
  if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lon)) return;

  if (typeof map.isStyleLoaded === "function" && !map.isStyleLoaded()) {
    map.once("load", () => showWalkingRouteToPlace(place));
    return;
  }

  const pos = getUserPos();
  if (!pos) {
    _toast("Fant ikke posisjon ennå.");
    return;
  }

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

  try {
    map.addSource(HG_NAV_SRC, { type: "geojson", data: out.geojson });

    map.addLayer({
      id: HG_NAV_LINE,
      type: "line",
      source: HG_NAV_SRC,
      paint: {
        "line-color": "#00d4ff",
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 3, 14, 5, 18, 8],
        "line-opacity": 0.95
      }
    });
  } catch (e) {
    console.warn("[ORS route] draw failed", e);
    _toast("Kunne ikke tegne gangruten.");
    return;
  }

  const coords = out.geojson.features[0].geometry.coordinates;
  const b = coords.reduce(
    (bb, c) => bb.extend(c),
    new maplibregl.LngLatBounds(coords[0], coords[0])
  );

  map.fitBounds(b, { padding: 60 });

  if (Number.isFinite(out.distance_m) && Number.isFinite(out.duration_s)) {
    const km = (out.distance_m / 1000).toFixed(1);
    const min = Math.round(out.duration_s / 60);
    _toast(`Gårute: ${km} km · ca ${min} min`);
  } else {
    _toast(`Gårute til ${place.name || "sted"}`);
  }
}

function formatDist(m) {
  if (m == null) return "";
  const mm = Math.round(m);
  return mm < 1000 ? `${mm} m` : `${(mm / 1000).toFixed(1)} km`;
}

function toRad(d) {
  return (d * Math.PI) / 180;
}

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

function getNearbyRoutesSorted(userPosObj, visitedMap = null, sourceRoutes = _validRoutes()) {
  if (!Array.isArray(sourceRoutes) || !sourceRoutes.length) return [];

  return sourceRoutes
    .map(r => {
      const n = computeNearestStop(r, userPosObj, visitedMap);
      return {
        ...r,
        _nearestDistM: n ? n.distM : null,
        _nearestStopIndex: n ? n.stopIndex : 0,
        _nearestStopName: n ? (n.place?.name || "") : ""
      };
    })
    .filter(r => r._nearestDistM != null)
    .sort((a, b) => (a._nearestDistM ?? 1e12) - (b._nearestDistM ?? 1e12));
}

async function renderLeftRoutesList() {
  const box = document.getElementById("leftRoutesList");
  if (!box) return;

  _ensureRoutePanelStyles();
  await loadRoutes();

  const availableRoutes = _validRoutes();

  if (!availableRoutes.length) {
    box.innerHTML = `<div class="muted">Ingen ruter lastet fra routes.json.</div>`;
    return;
  }

  const learningFilteredRoutes = availableRoutes.filter(r => {
    if (!r.unlock_emne) return true;
    if (!window.KnowledgeLearning) return true;
    return window.KnowledgeLearning.isUnderstood?.(r.unlock_emne);
  });

  if (!learningFilteredRoutes.length) {
    box.innerHTML = `<div class="muted">Ingen ruter tilgjengelige enda.</div>`;
    return;
  }

  const badgeFilteredRoutes = learningFilteredRoutes.filter(routeMatchesActiveBadge);

  if (!badgeFilteredRoutes.length) {
    box.innerHTML = `
      <div class="hg-empty-guide">
        <div class="hg-empty-guide-icon">🏅</div>
        <div class="hg-empty-guide-title">Ingen ruter</div>
        <div class="hg-empty-guide-text">Ingen ruter har stopp i ${_escapeHTML(activeBadgeNameForRoutes())}. Trykk badgeknappen for å velge et annet badge eller alle.</div>
      </div>
    `;
    return;
  }

  const pos = getUserPos();
  if (!pos) {
    box.innerHTML = `<div class="muted">Fant ikke posisjon ennå.</div>`;
    return;
  }

  const visitedMap = (typeof window.visited !== "undefined" && window.visited) ? window.visited : {};
  const list = getNearbyRoutesSorted(pos, visitedMap, badgeFilteredRoutes);

  if (!list.length) {
    box.innerHTML = `<div class="muted">Ingen ruter har gyldige stopp i kartdataene.</div>`;
    return;
  }

  box.innerHTML = list.slice(0, 12).map(r => {
    const title = r.title || r.name || "Rute";
    const dist = formatDist(r._nearestDistM);
    const stop = r._nearestStopName || "";

    return `
      <button class="left-route-item" type="button" data-route="${_escapeHTML(r.id)}">
        <div class="left-route-title">${_escapeHTML(title)}</div>
        <div class="left-route-meta">
          <div class="left-route-stop">${_escapeHTML(stop)}</div>
          <div class="left-route-dist">${_escapeHTML(dist)}</div>
        </div>
      </button>
    `;
  }).join("");

  box.onclick = (e) => {
    const item = e.target.closest(".left-route-item");
    if (!item) return;

    const routeId = item.getAttribute("data-route");
    if (!routeId) return;

    const pos = getUserPos();
    const visitedMap = (typeof window.visited !== "undefined" && window.visited) ? window.visited : {};
    const r = _routeById(routeId);
    const n = (r && pos) ? computeNearestStop(r, pos, visitedMap) : null;
    const idx = n ? n.stopIndex : 0;

    showRouteOverlay(routeId, idx);
  };
}

function initLeftRoutesPanel() {
  _ensureRoutePanelStyles();

  const sel = document.getElementById("leftPanelMode");
  if (!sel) return;

  sel.addEventListener("change", () => setLeftPanelMode(sel.value));

  window.addEventListener("hg:geo", () => {
    if (sel.value === "routes") renderLeftRoutesList();
  });

  setLeftPanelMode(sel.value || "nearby");
}

window.HGRoutes = {
  load: loadRoutes,

  init() {
    loadRoutes();
    _ensureRoutePanelStyles();
    initLeftRoutesPanel();
  },

  showThematic(routeId, startIndex = 0) {
    showRouteOverlay(routeId, startIndex);
  },

  clearThematic() {
    clearThematicRoute();
  },

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

window.renderLeftRoutesList = renderLeftRoutesList;
window.focusRouteOnMap = focusRouteOnMap;
window.showRouteOverlay = showRouteOverlay;
window.clearThematicRoute = clearThematicRoute;

window.showRouteToPlace = (place) => window.HGRoutes.showToPlace(place);
window.showRouteTo = function(place) {
  if (typeof window.showRouteToPlace === "function") return window.showRouteToPlace(place);
  _toast("Rute-funksjon ikke lastet");
};

console.log("routes.js end", typeof window.showRouteToPlace);
