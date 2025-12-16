// =====================================================
// ROUTES.JS – tematiske ruter (MapLibre) + “Nærmeste ruter”
// + rute fra posisjon → enkelt place (showRouteToPlace)
//
// Krever globals fra app.js:
//  - MAP (maplibregl.Map)
//  - PLACES, visited (visited kan mangle -> går fint)
//  - currentPos OR userPos (en av dem)
//  - showToast(), openPlaceCard(), catColor()
//  - sheet: #sheetNearby + #sheetNearbyBody (hvis du bruker sheet)
// =====================================================

let ROUTES = [];
let routesLoaded = false;

// MapLibre source/layers for temaruter
const HG_ROUTE_SRC = "hg-thematic-route";
const HG_ROUTE_GLOW = "hg-thematic-route-glow";
const HG_ROUTE_LINE = "hg-thematic-route-line";
const HG_ROUTE_STOPS = "hg-thematic-route-stops";

// MapLibre source/layer for “rute til sted”
const HG_NAV_SRC = "hg-nav-route";
const HG_NAV_LINE = "hg-nav-route-line";

// ---------- load ----------
async function loadRoutes() {
  if (routesLoaded) return ROUTES;

  try {
    const data = await fetch("routes.json", { cache: "no-store" }).then(r => r.json());

    // Behold samme array-referanse (viktig!)
    ROUTES.length = 0;
    if (Array.isArray(data)) ROUTES.push(...data);

    routesLoaded = true;
    console.log("Ruter lastet:", ROUTES.length);
    return ROUTES;
  } catch (err) {
    console.warn("Kunne ikke laste ruter", err);

    // Også her: behold samme array-referanse
    ROUTES.length = 0;

    routesLoaded = true;
    return ROUTES;
  }
}

// ---------- utils ----------
function toRad(d) { return (d * Math.PI) / 180; }

// Haversine i meter
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
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

function getUserPos() {
  // du har brukt både currentPos og userPos i app-utdragene
  return (typeof currentPos !== "undefined" && currentPos)
    ? currentPos
    : (typeof userPos !== "undefined" && userPos ? userPos : null);
}

if (!pos) {
  body.innerHTML = `<div class="hg-muted">Fant ikke posisjon ennå.</div>`;
  sheet.classList.add("open");
  return;
}
P
// ---------- nearest-stop logic ----------
// route: { stops:[{placeId,title,info}] }
// return: { distM, stopIndex, placeId, stopTitle, place, isVisited }
function computeNearestStop(route, userPosObj, visitedMap = null) {
  if (!route?.stops?.length || !userPosObj) return null;

  const candidates = route.stops
    .map((s, idx) => {
      const place = PLACES.find(p => p.id === s.placeId);
      if (!place) return null;

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

  // Bonus-regel: prioriter nærmeste UBESØKTE stopp hvis mulig
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

// ---------- UI: “Nærmeste ruter” inn i samme sheet-panel ----------
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
        <button class="chip" onclick="focusRouteOnMap('${r.id}', ${idx})">Vis</button>
      </div>
    </div>
  `;
}

async function openRoutesSheet() {
  await loadRoutes();

  const pos = getUserPos();
  const sheet = document.getElementById("sheetNearby");
  const body  = document.getElementById("sheetNearbyBody");
  if (!sheet || !body) {
    console.warn("Mangler sheetNearby/sheetNearbyBody i DOM");
    return;
  }

  // Sett tittel ETTER at sheet finnes
  const titleEl = sheet.querySelector(".sheet-head h3");
  if (titleEl) titleEl.textContent = "Nærmeste ruter";

  const sorted = getNearbyRoutesSorted(
    pos,
    (typeof visited !== "undefined" ? visited : null)
  );

  body.innerHTML = sorted.length
    ? sorted.map(renderRouteRow).join("")
    : `<div class="hg-muted">Ingen ruter funnet.</div>`;

  sheet.classList.add("open");
}

// ---------- Overlay (info) ----------
function showRouteOverlay(routeId, startIndex = 0) {
  const r = ROUTES.find(x => x.id === routeId);
  if (!r) return;

  // Hvis du allerede har en modal/overlay i appen din: kall den her.
  // For nå: enkel toast (så du ikke mister funksjon)
  showToast(`${r.name} (${r.stops?.length || 0} stopp)`);
}

function closeRouteOverlay() {
  // hvis du har en faktisk overlay, lukk den her
}

// ---------- Map: tematisk rute ----------
function clearThematicRoute() {
  if (!MAP) return;

  if (MAP.getLayer(HG_ROUTE_STOPS)) MAP.removeLayer(HG_ROUTE_STOPS);
  if (MAP.getLayer(HG_ROUTE_LINE)) MAP.removeLayer(HG_ROUTE_LINE);
  if (MAP.getLayer(HG_ROUTE_GLOW)) MAP.removeLayer(HG_ROUTE_GLOW);
  if (MAP.getSource(HG_ROUTE_SRC)) MAP.removeSource(HG_ROUTE_SRC);
}

function focusRouteOnMap(routeId, startIndex = 0) {
  if (!MAP) return;

  const r = ROUTES.find(x => x.id === routeId);
  if (!r?.stops?.length) return;

  const places = r.stops
    .map(s => PLACES.find(p => p.id === s.placeId))
    .filter(Boolean);

  if (!places.length) return;

  const sliced = places.slice(Math.max(0, startIndex));
  const coords = sliced.map(p => [p.lon, p.lat]);


  
  // Bygg GeoJSON
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

  // clear + add
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

  // klikk på stopp -> åpne place card
  if (!MAP.__hgRouteStopsClickBound) {
    MAP.on("click", HG_ROUTE_STOPS, (e) => {
      const f = e.features && e.features[0];
      if (!f) return;
      const id = f.properties.placeId;
      const p = PLACES.find(x => x.id === id);
      if (p) openPlaceCard(p);
    });
    MAP.__hgRouteStopsClickBound = true;
  }

  // zoom til ruten
  const b = coords.reduce(
    (bb, c) => bb.extend(c),
    new maplibregl.LngLatBounds(coords[0], coords[0])
  );
  MAP.fitBounds(b, { padding: 50 });

  showToast("Rute vist på kartet");
}

// ---------- Map: posisjon → enkelt place (OSRM) ----------
async function showRouteToPlace(place) {
  if (!MAP || !place) return;

  const pos = getUserPos();
  const from = pos ? [pos.lon, pos.lat] : [START.lon, START.lat];

  // place kan ha lon/lat eller lat/lon – du har brukt begge i tråden
  const to = (typeof place.lon === "number" && typeof place.lat === "number")
    ? [place.lon, place.lat]
    : (typeof place.lng === "number" && typeof place.lat === "number")
      ? [place.lng, place.lat]
      : null;

  if (!to) return;

  // fjern gammel
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

    const b = coords.reduce(
      (bb, c) => bb.extend(c),
      new maplibregl.LngLatBounds(coords[0], coords[0])
    );
    MAP.fitBounds(b, { padding: 40 });

    showToast("Rute lagt.");
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

    const b = new maplibregl.LngLatBounds(from, from).extend(to);
    MAP.fitBounds(b, { padding: 40 });

    showToast("Vis linje (ingen rutetjeneste)");
  }
}


// ---------- expose globals ----------
window.ROUTES = ROUTES; // OBS: dette peker på initial array; ROUTES fylles senere
window.loadRoutes = loadRoutes;
window.openRoutesSheet = openRoutesSheet;

window.showRouteOverlay = showRouteOverlay;
window.closeRouteOverlay = closeRouteOverlay;

window.focusRouteOnMap = focusRouteOnMap;
window.clearThematicRoute = clearThematicRoute;

window.computeNearestStop = computeNearestStop;
window.getNearbyRoutesSorted = getNearbyRoutesSorted;

window.showRouteToPlace = showRouteToPlace;


