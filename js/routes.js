// =====================================================
// routes.js – History GO
// Tematiske ruter (MapLibre) + "Nærmeste ruter" + venstre panel (Ruter)
// Krever (globalt fra app.js / resten av appen):
//   - MAP (maplibregl.Map)  [kan mangle → rute på kart deaktiveres]
//   - PLACES (array)
//   - visited (object map placeId->true) [kan mangle]
//   - currentPos eller userPos: { lat, lon } [kan mangle → viser "ingen posisjon"]
//   - showToast(msg) [valgfri]
//   - openPlaceCard(place) [valgfri]
//   - START = { lat, lon } [fallback for showRouteToPlace]
//   - sheet: #sheetNearby og #sheetNearbyBody (for openRoutesSheet)
// DOM (venstre panel):
//   - #leftPanelMode
//   - #panelNearby, #panelRoutes, #panelBadges
//   - #leftRoutesList
// =====================================================

(() => {
  // ----- config -----
  const DEBUG = false;

  // MapLibre source/layers for temaruter
  const HG_ROUTE_SRC = "hg-thematic-route";
  const HG_ROUTE_GLOW = "hg-thematic-route-glow";
  const HG_ROUTE_LINE = "hg-thematic-route-line";
  const HG_ROUTE_STOPS = "hg-thematic-route-stops";

  // MapLibre source/layer for “rute til sted”
  const HG_NAV_SRC = "hg-nav-route";
  const HG_NAV_LINE = "hg-nav-route-line";

  // ----- state -----
  let ROUTES = [];
  let routesLoaded = false;
  let routesLoadingPromise = null;

  // ==========================
  // Helpers
  // ==========================
  function log(...a) { if (DEBUG) console.log("[routes]", ...a); }
  function warn(...a) { if (DEBUG) console.warn("[routes]", ...a); }

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
    if (m == null || !Number.isFinite(m)) return "—";
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m / 1000).toFixed(1)} km`;
  }

  function getUserPos() {
    // Godta både currentPos og userPos (slik du allerede gjør i andre filer)
    const p =
      (typeof window.currentPos !== "undefined" && window.currentPos)
        ? window.currentPos
        : ((typeof window.userPos !== "undefined" && window.userPos) ? window.userPos : null);

    if (!p) return null;

    const lat = Number(p.lat);
    const lon = Number(p.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lon };
  }

  function getVisitedMap() {
    return (typeof window.visited !== "undefined" && window.visited) ? window.visited : null;
  }

  function toast(msg) {
    if (typeof window.showToast === "function") window.showToast(msg);
    else log("toast:", msg);
  }

  // ==========================
  // Load routes.json
  // ==========================
  async function loadRoutes() {
    if (routesLoaded) return ROUTES;
    if (routesLoadingPromise) return routesLoadingPromise;

    routesLoadingPromise = (async () => {
      try {
        const data = await fetch("data/routes.json", { cache: "no-store" }).then(r => r.json());
        ROUTES.length = 0;
        if (Array.isArray(data)) ROUTES.push(...data);
        routesLoaded = true;
        log("loaded routes:", ROUTES.length);
        return ROUTES;
      } catch (e) {
        warn("failed load routes.json", e);
        ROUTES.length = 0;
        routesLoaded = true;
        return ROUTES;
      } finally {
        routesLoadingPromise = null;
      }
    })();

    return routesLoadingPromise;
  }

  // ==========================
  // Nearest-stop logic
  // ==========================
  function computeNearestStop(route, userPosObj, visitedMap = null) {
    if (!route?.stops?.length || !userPosObj) return null;
    if (!Array.isArray(window.PLACES)) return null;

    const candidates = route.stops
      .map((s, idx) => {
        const place = window.PLACES.find(p => p.id === s.placeId);
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

    // Prioriter nærmeste ubesøkte hvis mulig
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
          _nearestStopPlaceId: n ? n.placeId : null,
          _nearestStopName: n ? (n.stopTitle || n.place?.name || "") : ""
        };
      })
      .sort((a, b) => (a._nearestDistM ?? 1e12) - (b._nearestDistM ?? 1e12));
  }

  // ==========================
  // MapLibre: thematic route
  // ==========================
  function clearThematicRoute() {
    const MAP = window.MAP;
    if (!MAP) return;

    try {
      if (MAP.getLayer(HG_ROUTE_STOPS)) MAP.removeLayer(HG_ROUTE_STOPS);
      if (MAP.getLayer(HG_ROUTE_LINE)) MAP.removeLayer(HG_ROUTE_LINE);
      if (MAP.getLayer(HG_ROUTE_GLOW)) MAP.removeLayer(HG_ROUTE_GLOW);
      if (MAP.getSource(HG_ROUTE_SRC)) MAP.removeSource(HG_ROUTE_SRC);
    } catch (e) {
      warn("clearThematicRoute error", e);
    }
  }

  function focusRouteOnMap(routeId, startIndex = 0) {
    const MAP = window.MAP;
    if (!MAP) {
      toast("Kart er ikke lastet (MAP mangler)");
      return;
    }
    if (!Array.isArray(window.PLACES)) return;

    const r = ROUTES.find(x => x.id === routeId);
    if (!r?.stops?.length) {
      toast("Fant ikke ruten");
      return;
    }

    const places = r.stops
      .map(s => window.PLACES.find(p => p.id === s.placeId))
      .filter(Boolean);

    if (!places.length) {
      toast("Ruten har ingen stopp (mangler PLACES-match)");
      return;
    }

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

    try {
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

      // klikking på stopp -> openPlaceCard(place)
      if (!MAP.__hgRouteStopsClickBound) {
        MAP.on("click", HG_ROUTE_STOPS, (e) => {
          const f = e.features && e.features[0];
          if (!f) return;
          const id = f.properties?.placeId;
          const p = window.PLACES.find(x => x.id === id);
          if (p && typeof window.openPlaceCard === "function") window.openPlaceCard(p);
        });
        MAP.__hgRouteStopsClickBound = true;
      }

      // zoom til ruten
      const b = coords.reduce(
        (bb, c) => bb.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      MAP.fitBounds(b, { padding: 50 });

      toast("Rute vist på kartet");
    } catch (e) {
      warn("focusRouteOnMap error", e);
      toast("Kunne ikke tegne rute på kartet");
    }
  }

  // ==========================
  // MapLibre: route to place (OSRM)
  // ==========================
  async function showRouteToPlace(place) {
    const MAP = window.MAP;
    if (!MAP || !place) return;

    const pos = getUserPos();
    const START = window.START || { lat: 59.9139, lon: 10.7522 }; // fallback Oslo-ish
    const from = pos ? [pos.lon, pos.lat] : [START.lon, START.lat];

    const to =
      (typeof place.lon === "number" && typeof place.lat === "number")
        ? [place.lon, place.lat]
        : (typeof place.lng === "number" && typeof place.lat === "number")
          ? [place.lng, place.lat]
          : null;

    if (!to) return;

    try {
      if (MAP.getLayer(HG_NAV_LINE)) MAP.removeLayer(HG_NAV_LINE);
      if (MAP.getSource(HG_NAV_SRC)) MAP.removeSource(HG_NAV_SRC);
    } catch {}

    try {
      const url =
        `https://routing.openstreetmap.de/routed-foot/route/v1/foot/` +
        `${from[0]},${from[1]};${to[0]},${to[1]}` +
        `?overview=full&geometries=geojson`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("route http " + res.status);
      const json = await res.json();

      const coords = json?.routes?.[0]?.geometry?.coordinates;
      if (!coords || !coords.length) throw new Error("no geometry");

      MAP.addSource(HG_NAV_SRC, {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: coords } }
      });

      MAP.addLayer({
        id: HG_NAV_LINE,
        type: "line",
        source: HG_NAV_SRC,
        paint: {
          "line-color": "rgba(207,232,255,0.95)",
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 3, 14, 5, 18, 8],
          "line-opacity": 1
        }
      });

      const b = coords.reduce(
        (bb, c) => bb.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      MAP.fitBounds(b, { padding: 40 });

      toast("Rute lagt.");
    } catch (e) {
      warn("OSRM failed, fallback line", e);

      MAP.addSource(HG_NAV_SRC, {
        type: "geojson",
        data: { type: "Feature", geometry: { type: "LineString", coordinates: [from, to] } }
      });

      MAP.addLayer({
        id: HG_NAV_LINE,
        type: "line",
        source: HG_NAV_SRC,
        paint: {
          "line-color": "rgba(207,232,255,0.95)",
          "line-width": ["interpolate", ["linear"], ["zoom"], 10, 3, 14, 5, 18, 8],
          "line-opacity": 1
        }
      });

      const b = new maplibregl.LngLatBounds(from, from).extend(to);
      MAP.fitBounds(b, { padding: 40 });

      toast("Vis linje (ingen rutetjeneste)");
    }
  }

  // ==========================
  // Sheet: "Nærmeste ruter"
  // ==========================
  function renderRouteRow(r) {
    const dist = formatDist(r._nearestDistM);
    const stopName = r._nearestStopName || "—";
    const cat = r.category || "";
    const idx = (r._nearestStopIndex ?? 0);

    return `
      <div class="hg-place">
        <div class="hg-place-top">
          <strong>${r.name || r.title || "Rute"}</strong>
          <span class="hg-muted">${cat}</span>
        </div>
        <div class="hg-muted" style="margin-top:4px;">
          📍 ${dist} til nærmeste stopp: ${stopName}
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
          <button class="chip" onclick="loadRoutes().then(()=>focusRouteOnMap('${r.id}', ${idx}))">Vis</button>
        </div>
      </div>
    `;
  }

  async function openRoutesSheet() {
    await loadRoutes();

    const pos = getUserPos();
    const sheet = document.getElementById("sheetNearby");
    const body = document.getElementById("sheetNearbyBody");
    if (!sheet || !body) {
      warn("missing #sheetNearby / #sheetNearbyBody");
      return;
    }

    // title
    const titleEl = sheet.querySelector(".sheet-head h3");
    if (titleEl) titleEl.textContent = "Nærmeste ruter";

    if (!pos) {
      body.innerHTML = `<div class="hg-muted">Fant ikke posisjon ennå.</div>`;
      sheet.classList.add("open");
      return;
    }

    const sorted = getNearbyRoutesSorted(pos, getVisitedMap());

    body.innerHTML = sorted.length
      ? sorted.map(renderRouteRow).join("")
      : `<div class="hg-muted">Ingen ruter funnet.</div>`;

    sheet.classList.add("open");
  }

  // ==========================
  // Left panel: Routes view
  // ==========================
  async function renderLeftRoutesList() {
    const box = document.getElementById("leftRoutesList");
    if (!box) return;

    // sørg for at ruter faktisk er lastet
    await loadRoutes();

    const pos = getUserPos();
    if (!pos) {
      box.innerHTML = `<div class="muted">Fant ikke posisjon ennå.</div>`;
      return;
    }

    const list = getNearbyRoutesSorted(pos, getVisitedMap());

    if (!list.length) {
      box.innerHTML = `<div class="muted">Ingen ruter lastet.</div>`;
      return;
    }

    box.innerHTML = list
      .slice(0, 14)
      .map(r => {
        const dist = formatDist(r._nearestDistM);
        const stopName = r._nearestStopName || "—";
        const title = r.title || r.name || "Rute";
        const routeId = r.id || "";
        const idx = (r._nearestStopIndex ?? 0);

        return `
          <div class="left-route-item" data-route="${routeId}" data-idx="${idx}">
            <div class="left-route-title">${title}</div>
            <div class="left-route-meta muted">
              <span>${stopName}</span>
              <span>•</span>
              <span>${dist}</span>
            </div>
          </div>
        `;
      })
      .join("");

    // click -> vis på kart
    box.onclick = (e) => {
      const item = e.target.closest(".left-route-item");
      if (!item) return;
      const routeId = item.getAttribute("data-route");
      const idx = Number(item.getAttribute("data-idx") || "0") || 0;
      if (!routeId) return;

      // Vis direkte på kartet
      focusRouteOnMap(routeId, idx);
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

    if (mode === "routes") {
      // render routes view
      renderLeftRoutesList().catch(err => warn("renderLeftRoutesList", err));
    }
  }

  function initLeftRoutesPanel() {
    // guard mot dobbelt init
    if (window.__hgLeftRoutesPanelInit) return;
    window.__hgLeftRoutesPanelInit = true;

    const sel = document.getElementById("leftPanelMode");
    if (!sel) return;

    sel.addEventListener("change", () => setLeftPanelMode(sel.value));

    // Når geo kommer (app.js bør dispatch'e hg:geo)
    window.addEventListener("hg:geo", () => {
      if (sel.value === "routes") renderLeftRoutesList().catch(() => {});
    });

    // Første sync
    setLeftPanelMode(sel.value || "nearby");
  }

  // ==========================
  // Boot
  // ==========================
  document.addEventListener("DOMContentLoaded", () => {
    try { initLeftRoutesPanel(); } catch (e) { warn("initLeftRoutesPanel", e); }
  });

  // ==========================
  // Expose globals (som du forventer i andre filer)
  // ==========================
  window.ROUTES = ROUTES;
  window.loadRoutes = loadRoutes;

  window.computeNearestStop = computeNearestStop;
  window.getNearbyRoutesSorted = getNearbyRoutesSorted;

  window.openRoutesSheet = openRoutesSheet;

  window.focusRouteOnMap = focusRouteOnMap;
  window.clearThematicRoute = clearThematicRoute;

  window.showRouteToPlace = showRouteToPlace;
})();
