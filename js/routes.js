// =====================================================
// ROUTES.JS – tematiske ruter (MapLibre) + “Nærmeste ruter”
// + rute fra posisjon → enkelt place (showRouteToPlace)
//
// Robust versjon:
//  - Ingen ReferenceError (DEBUG, MAP, PLACES osv sjekkes)
//  - Fetch med RELATIV sti: "data/routes.json" (GitHub Pages-safe)
//  - getUserPos tåler flere globale varianter (currentPos/userPos/userLat+userLon etc)
//  - Routes-panelet laster ruter før render
// =====================================================

(function () {
  "use strict";

  // -------- state --------
  const ROUTES = [];
  let routesLoaded = false;

  // MapLibre source/layers for temaruter
  const HG_ROUTE_SRC = "hg-thematic-route";
  const HG_ROUTE_GLOW = "hg-thematic-route-glow";
  const HG_ROUTE_LINE = "hg-thematic-route-line";
  const HG_ROUTE_STOPS = "hg-thematic-route-stops";

  // MapLibre source/layer for “rute til sted”
  const HG_NAV_SRC = "hg-nav-route";
  const HG_NAV_LINE = "hg-nav-route-line";

  // -------- helpers --------
  function log(...args) {
    if (typeof window.DEBUG !== "undefined" && window.DEBUG) console.log(...args);
  }
  function warn(...args) {
    if (typeof window.DEBUG !== "undefined" && window.DEBUG) console.warn(...args);
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

  function formatDist(m) {
    if (m == null || Number.isNaN(m)) return "";
    if (m < 1000) return `${Math.round(m)} m`;
    return `${(m / 1000).toFixed(1)} km`;
  }

  // Tåler mange globale pos-format
  function getUserPos() {
    // 1) currentPos / userPos
    const p =
      (typeof window.currentPos !== "undefined" && window.currentPos) ? window.currentPos :
      (typeof window.userPos !== "undefined" && window.userPos) ? window.userPos :
      null;

    if (p) {
      // mulig: {lat, lon} / {lat, lng} / {latitude, longitude}
      const lat = (typeof p.lat === "number") ? p.lat :
                  (typeof p.latitude === "number") ? p.latitude : null;

      const lon = (typeof p.lon === "number") ? p.lon :
                  (typeof p.lng === "number") ? p.lng :
                  (typeof p.longitude === "number") ? p.longitude : null;

      if (typeof lat === "number" && typeof lon === "number") return { lat, lon };
    }

    // 2) userLat/userLon (du har brukt dette andre steder)
    if (typeof window.userLat === "number" && typeof window.userLon === "number") {
      return { lat: window.userLat, lon: window.userLon };
    }

    // 3) userLat/userLng
    if (typeof window.userLat === "number" && typeof window.userLng === "number") {
      return { lat: window.userLat, lon: window.userLng };
    }

    return null;
  }

  function getPlacesArray() {
    return Array.isArray(window.PLACES) ? window.PLACES : [];
  }

  // -------- load routes --------
  async function loadRoutes() {
    if (routesLoaded) return ROUTES;

    try {
      // RELATIV sti (viktig på GitHub Pages)
      const data = await fetch("data/routes.json", { cache: "no-store" }).then(r => r.json());

      ROUTES.length = 0;
      if (Array.isArray(data)) ROUTES.push(...data);

      routesLoaded = true;
      log("[routes] loaded:", ROUTES.length);
      return ROUTES;
    } catch (err) {
      warn("[routes] could not load routes.json", err);
      ROUTES.length = 0;
      routesLoaded = true;
      return ROUTES;
    }
  }

  // -------- nearest-stop logic --------
  function computeNearestStop(route, userPosObj, visitedMap = null) {
    if (!route || !Array.isArray(route.stops) || !route.stops.length) return null;
    if (!userPosObj) return null;

    const PLACES = getPlacesArray();
    if (!PLACES.length) return null;

    const candidates = route.stops
      .map((s, idx) => {
        const place = PLACES.find(p => p.id === s.placeId);
        if (!place) return null;

        if (typeof place.lat !== "number" || typeof place.lon !== "number") return null;

        const distM = Math.round(
          distanceMeters(userPosObj.lat, userPosObj.lon, place.lat, place.lon)
        );

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

    // prioriter ubesøkte hvis mulig
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

  // -------- UI: sheet “Nærmeste ruter” --------
  function renderRouteRow(r) {
    const dist = formatDist(r._nearestDistM);
    const stopName = r._nearestStopName || "";
    const cat = r.category || "";
    const idx = (r._nearestStopIndex ?? 0);

    return `
      <div class="hg-place">
        <div class="hg-place-top">
          <strong>${r.name}</strong>
          <span class="hg-muted">${cat}</span>
        </div>
        <div class="hg-muted" style="margin-top:4px;">
          📍 ${dist} til nærmeste stopp: ${stopName}
        </div>
        <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
          <button class="chip ghost" onclick="showRouteOverlay('${r.id}', ${idx})">Info</button>
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
    if (!sheet || !body) return;

    const titleEl = sheet.querySelector(".sheet-head h3");
    if (titleEl) titleEl.textContent = "Nærmeste ruter";

    if (!pos) {
      body.innerHTML = `<div class="hg-muted">Fant ikke posisjon ennå.</div>`;
      sheet.classList.add("open");
      return;
    }

    const visitedMap = (typeof window.visited !== "undefined" && window.visited) ? window.visited : null;
    const sorted = getNearbyRoutesSorted(pos, visitedMap);

    body.innerHTML = sorted.length
      ? sorted.map(renderRouteRow).join("")
      : `<div class="hg-muted">Ingen ruter funnet.</div>`;

    sheet.classList.add("open");
  }

  function showRouteOverlay(routeId, startIndex = 0) {
    const r = ROUTES.find(x => x.id === routeId);
    if (!r) return;
    if (typeof window.showToast === "function") window.showToast(`${r.name} (${r.stops?.length || 0} stopp)`);
  }
  function closeRouteOverlay() {}

  // -------- Map: tematisk rute --------
  function getMap() { return window.MAP || null; }

  function clearThematicRoute() {
    const MAP = getMap();
    if (!MAP) return;

    if (MAP.getLayer(HG_ROUTE_STOPS)) MAP.removeLayer(HG_ROUTE_STOPS);
    if (MAP.getLayer(HG_ROUTE_LINE)) MAP.removeLayer(HG_ROUTE_LINE);
    if (MAP.getLayer(HG_ROUTE_GLOW)) MAP.removeLayer(HG_ROUTE_GLOW);
    if (MAP.getSource(HG_ROUTE_SRC)) MAP.removeSource(HG_ROUTE_SRC);
  }

  function focusRouteOnMap(routeId, startIndex = 0) {
    const MAP = getMap();
    if (!MAP) return;

    const r = ROUTES.find(x => x.id === routeId);
    if (!r || !Array.isArray(r.stops) || !r.stops.length) return;

    const PLACES = getPlacesArray();
    const places = r.stops.map(s => PLACES.find(p => p.id === s.placeId)).filter(Boolean);
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

    // click på stopp -> åpne place card
    if (!MAP.__hgRouteStopsClickBound) {
      MAP.on("click", HG_ROUTE_STOPS, (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        const id = f.properties.placeId;
        const p = getPlacesArray().find(x => x.id === id);
        if (p && typeof window.openPlaceCard === "function") window.openPlaceCard(p);
      });
      MAP.__hgRouteStopsClickBound = true;
    }

    // zoom til ruten
    if (typeof window.maplibregl !== "undefined" && coords.length) {
      const b = coords.reduce(
        (bb, c) => bb.extend(c),
        new window.maplibregl.LngLatBounds(coords[0], coords[0])
      );
      MAP.fitBounds(b, { padding: 50 });
    }

    if (typeof window.showToast === "function") window.showToast("Rute vist på kartet");
  }

  // -------- Map: posisjon → enkelt place (OSRM) --------
  async function showRouteToPlace(place) {
    const MAP = getMap();
    if (!MAP || !place) return;

    const pos = getUserPos();
    const START = window.START || { lon: 10.746, lat: 59.912 }; // fallback
    const from = pos ? [pos.lon, pos.lat] : [START.lon, START.lat];

    const to =
      (typeof place.lon === "number" && typeof place.lat === "number")
        ? [place.lon, place.lat]
        : (typeof place.lng === "number" && typeof place.lat === "number")
          ? [place.lng, place.lat]
          : null;

    if (!to) return;

    if (MAP.getLayer(HG_NAV_LINE)) MAP.removeLayer(HG_NAV_LINE);
    if (MAP.getSource(HG_NAV_SRC)) MAP.removeSource(HG_NAV_SRC);

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

      if (typeof window.maplibregl !== "undefined") {
        const b = coords.reduce(
          (bb, c) => bb.extend(c),
          new window.maplibregl.LngLatBounds(coords[0], coords[0])
        );
        MAP.fitBounds(b, { padding: 40 });
      }

      if (typeof window.showToast === "function") window.showToast("Rute lagt.");
    } catch (e) {
      // fallback: rett linje
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

      if (typeof window.maplibregl !== "undefined") {
        const b = new window.maplibregl.LngLatBounds(from, from).extend(to);
        MAP.fitBounds(b, { padding: 40 });
      }

      if (typeof window.showToast === "function") window.showToast("Vis linje (ingen rutetjeneste)");
    }
  }

  // =====================================================
  // LEFT PANEL: ROUTES VIEW (panelRoutes / leftRoutesList)
  // =====================================================

  async function renderLeftRoutesList() {
    const box = document.getElementById("leftRoutesList");
    if (!box) return;

    await loadRoutes();

    const pos = getUserPos();
    if (!pos) {
      box.innerHTML = `<div class="muted">Fant ikke posisjon ennå.</div>`;
      return;
    }

    const visitedMap =
      (typeof window.visited !== "undefined" && window.visited) ? window.visited : {};

    const list = getNearbyRoutesSorted(pos, visitedMap);

    if (!list.length) {
      box.innerHTML = `<div class="muted">Ingen ruter lastet.</div>`;
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
              <span>${stopName}</span>
              <span>•</span>
              <span>${dist}</span>
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

      // Vis ruta på kart (fra nærmeste stopp)
      const r = ROUTES.find(x => x.id === routeId);
      const idx = r?._nearestStopIndex ?? 0;
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

    if (mode === "routes") renderLeftRoutesList();
  }

  function initLeftRoutesPanel() {
    const sel = document.getElementById("leftPanelMode");
    if (!sel) return;

    sel.addEventListener("change", () => setLeftPanelMode(sel.value));

    // Når geo kommer: oppdater ruter hvis aktivt
    window.addEventListener("hg:geo", () => {
      if (sel.value === "routes") renderLeftRoutesList();
    });

    // første sync
    setLeftPanelMode(sel.value || "nearby");
  }

  document.addEventListener("DOMContentLoaded", () => {
    try { initLeftRoutesPanel(); } catch (e) { console.warn("[routes] initLeftRoutesPanel", e); }
    // pre-load routes i bakgrunnen (ikke blokker)
    loadRoutes();
  });

  // -------- expose globals --------
  window.ROUTES = ROUTES;
  window.loadRoutes = loadRoutes;
  window.openRoutesSheet = openRoutesSheet;
  window.showRouteOverlay = showRouteOverlay;
  window.closeRouteOverlay = closeRouteOverlay;
  window.focusRouteOnMap = focusRouteOnMap;
  window.clearThematicRoute = clearThematicRoute;
  window.computeNearestStop = computeNearestStop;
  window.getNearbyRoutesSorted = getNearbyRoutesSorted;
  window.showRouteToPlace = showRouteToPlace;
})();
