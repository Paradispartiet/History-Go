// =====================================================
// ROUTES.JS – tematiske ruter (MapLibre) + “Nærmeste ruter”
// Krever:
//  - global MAP (maplibregl.Map) fra app.js/app(127).js
//  - global PLACES array
//  - showToast(), openPlaceCard(), catColor()
//  - sheet: #sheetNearby + #sheetNearbyBody
// =====================================================

let ROUTES = [];
let routesLoaded = false;

// MapLibre layer/source ids for temaruter
const HG_ROUTE_SRC = "hg-thematic-route";
const HG_ROUTE_GLOW = "hg-thematic-route-glow";
const HG_ROUTE_LINE = "hg-thematic-route-line";
const HG_ROUTE_STOPS = "hg-thematic-route-stops";

async function loadRoutes() {
  if (routesLoaded) return;
  try {
    ROUTES = await fetch("routes.json", { cache: "no-store" }).then(r => r.json());
    routesLoaded = true;
    console.log("Ruter lastet:", ROUTES.length);
  } catch (err) {
    console.warn("Kunne ikke laste ruter", err);
    ROUTES = [];
    routesLoaded = true;
  }
}

// ---------- utils ----------
function distKm(aLat, aLon, bLat, bLon) {
  const R = 6371;
  const dLat = (bLat - aLat) * Math.PI / 180;
  const dLon = (bLon - aLon) * Math.PI / 180;
  const lat1 = aLat * Math.PI / 180;
  const lat2 = bLat * Math.PI / 180;
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// Haversine i meter
function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a1 = toRad(lat1);
  const a2 = toRad(lat2);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a1) * Math.cos(a2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(x));
}

/**
 * route: { id,name,category,desc,stops:[{placeId,title,info}] }
 * userPos: {lat, lon}
 * visited: object map { [placeId]: true/false } (valgfri)
 *
 * return:
 * { distM, stopIndex, placeId, stopTitle, place }
 */
function computeNearestStop(route, userPos, visited = null) {
  if (!route?.stops?.length || !userPos) return null;

  // bygg kandidatliste
  const candidates = route.stops
    .map((s, idx) => {
      const place = PLACES.find(p => p.id === s.placeId);
      if (!place) return null;

      const distM = Math.round(
        distanceMeters(userPos.lat, userPos.lon, place.lat, place.lon)
      );

      const isVisited = visited ? !!visited[s.placeId] : false;

      return {
        idx,
        distM,
        placeId: s.placeId,
        stopTitle: s.title || place.name || "",
        place,
        isVisited
      };
    })
    .filter(Boolean);

  if (!candidates.length) return null;

  // Bonusregel: nærmeste UBESØKTE først, ellers nærmeste uansett
  const pool = candidates.some(c => !c.isVisited)
    ? candidates.filter(c => !c.isVisited)
    : candidates;

  pool.sort((a, b) => a.distM - b.distM);

  const best = pool[0];
  return {
    distM: best.distM,
    stopIndex: best.idx,
    placeId: best.placeId,
    stopTitle: best.stopTitle,
    place: best.place
  };
}

function getUserLatLonFallback() {
  // app(127).js bruker userPos {lat, lon}. Hvis ikke, prøv window.userLat/userLon, ellers START.
  if (window.userPos && typeof window.userPos.lat === "number" && typeof window.userPos.lon === "number") {
    return { lat: window.userPos.lat, lon: window.userPos.lon };
  }
  if (typeof window.userLat === "number" && typeof window.userLon === "number") {
    return { lat: window.userLat, lon: window.userLon };
  }
  if (window.START && typeof START.lat === "number" && typeof START.lon === "number") {
    return { lat: START.lat, lon: START.lon };
  }
  return null;
}

function routeStopsWithPlaces(route) {
  const stops = (route?.stops || []).map((s, idx) => {
    const plc = (window.PLACES || []).find(p => p.id === s.placeId);
    return plc ? { ...s, _idx: idx, _place: plc } : null;
  }).filter(Boolean);
  return stops;
}

// return { km, stopIndex, stopTitle, placeId }
function nearestStopToUser(route, userLat, userLon) {
  const stops = routeStopsWithPlaces(route);
  if (!stops.length) return null;

  let best = null;
  for (const s of stops) {
    const p = s._place;
    const km = distKm(userLat, userLon, p.lat, p.lon);
    if (!best || km < best.km) {
      best = { km, stopIndex: s._idx, stopTitle: s.title || p.name || "", placeId: s.placeId };
    }
  }
  return best;
}

function formatKm(km) {
  if (km == null || !isFinite(km)) return "";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km < 10 ? 1 : 0)} km`;
}

// ---------- UI: route overlay ----------
async function showRouteOverlay(routeId, startIndex = null) {
  await loadRoutes();
  const route = ROUTES.find(r => r.id === routeId);
  if (!route) return showToast?.("Fant ikke ruten.");

  const ovOld = document.getElementById("routeOverlay");
  if (ovOld) ovOld.remove();

  const stops = routeStopsWithPlaces(route);

  const user = getUserLatLonFallback();
  const near = user ? nearestStopToUser(route, user.lat, user.lon) : null;
  const suggested = (startIndex == null && near) ? near.stopIndex : startIndex;

  const overlay = document.createElement("div");
  overlay.id = "routeOverlay";
  overlay.className = "place-overlay";

  overlay.innerHTML = `
    <button class="close-overlay" onclick="closeRouteOverlay()">×</button>
    <div class="place-overlay-content">
      <div class="left">
        <h2>${route.name}</h2>
        <p class="muted">${route.category || ""}</p>
        <p>${route.desc || ""}</p>

        <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;">
          <button class="primary" onclick="focusRouteOnMap('${route.id}', ${suggested ?? 0})">
            Vis rute på kart
          </button>
          ${near ? `
            <button class="ghost" onclick="focusRouteOnMap('${route.id}', ${near.stopIndex})">
              Start nærmest (${formatKm(near.km)})
            </button>` : ""
          }
        </div>

        ${near ? `<p class="muted" style="margin-top:10px;">Nærmeste stopp: <strong>${near.stopTitle}</strong> (${formatKm(near.km)})</p>` : ""}
      </div>

      <div class="right">
        ${stops.map(s => {
          const p = s._place;
          return `
            <div class="card" style="margin-bottom:8px;">
              <strong>${s.title || p.name}</strong><br>
              <p>${s.info || ""}</p>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <button class="ghost" onclick="openPlaceById('${s.placeId}')">Åpne sted</button>
                <button class="secondary" onclick="focusRouteOnMap('${route.id}', ${s._idx})">Start her</button>
              </div>
            </div>`;
        }).join("")}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.addEventListener("click", e => {
    if (e.target && e.target.id === "routeOverlay") closeRouteOverlay();
  });
}

function closeRouteOverlay() {
  const ov = document.getElementById("routeOverlay");
  if (ov) ov.remove();
}

function openPlaceById(id) {
  const p = (window.PLACES || []).find(x => x.id === id);
  if (p) window.openPlaceCard?.(p);
  closeRouteOverlay();
}

// ---------- Map: draw elegant thematic route ----------
function clearThematicRoute() {
  if (!window.MAP || typeof MAP.getLayer !== "function") return;

  [HG_ROUTE_STOPS, HG_ROUTE_LINE, HG_ROUTE_GLOW].forEach(id => {
    if (MAP.getLayer(id)) MAP.removeLayer(id);
  });
  if (MAP.getSource(HG_ROUTE_SRC)) MAP.removeSource(HG_ROUTE_SRC);
}

function focusRouteOnMap(routeId, startIndex = 0) {
  const route = ROUTES.find(r => r.id === routeId);
  if (!route || !window.MAP) return;

  const stops = routeStopsWithPlaces(route);
  if (!stops.length) return showToast?.("Ingen gyldige stopp funnet.");

  // Start kan være “hvilket stopp som helst”
  const start = Math.max(0, Math.min(Number(startIndex) || 0, stops.length - 1));
  const ordered = stops.slice(start);

  const coords = ordered.map(s => [s._place.lon, s._place.lat]); // MapLibre: [lon,lat]
  if (coords.length < 2) {
    // hvis bare ett punkt, fly
    MAP.flyTo({ center: coords[0], zoom: Math.max(MAP.getZoom(), 15) });
    showToast?.("Kun ett stopp å vise.");
    return;
  }

  // Farge fra kategori (samme som steder)
  const color = (typeof window.catColor === "function")
    ? window.catColor(route.category || "")
    : "#f6c800";

  clearThematicRoute();

  // GeoJSON: line + stop points
  const geo = {
    type: "FeatureCollection",
    features: [
      { type: "Feature", properties: { kind: "line" }, geometry: { type: "LineString", coordinates: coords } },
      ...ordered.map((s, i) => ({
        type: "Feature",
        properties: { kind: "stop", idx: i, title: s.title || s._place.name || "" },
        geometry: { type: "Point", coordinates: [s._place.lon, s._place.lat] }
      }))
    ]
  };

  MAP.addSource(HG_ROUTE_SRC, { type: "geojson", data: geo });

  // Glow
  MAP.addLayer({
    id: HG_ROUTE_GLOW,
    type: "line",
    source: HG_ROUTE_SRC,
    filter: ["==", ["get", "kind"], "line"],
    paint: {
      "line-color": "rgba(255,255,255,0.22)",
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 5, 14, 8, 17, 14],
      "line-blur": ["interpolate", ["linear"], ["zoom"], 11, 2, 15, 3.5, 17, 4.5],
      "line-opacity": 0.85
    }
  });

  // Core line (category color)
  MAP.addLayer({
    id: HG_ROUTE_LINE,
    type: "line",
    source: HG_ROUTE_SRC,
    filter: ["==", ["get", "kind"], "line"],
    paint: {
      "line-color": color,
      "line-width": ["interpolate", ["linear"], ["zoom"], 11, 2.4, 14, 4.2, 17, 7.0],
      "line-opacity": 0.95
    }
  });

  // Stops (small, neat)
  MAP.addLayer({
    id: HG_ROUTE_STOPS,
    type: "circle",
    source: HG_ROUTE_SRC,
    filter: ["==", ["get", "kind"], "stop"],
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 11, 3.2, 14, 4.4, 17, 6.2],
      "circle-color": "#111",
      "circle-stroke-color": "rgba(255,255,255,0.9)",
      "circle-stroke-width": 1.4,
      "circle-opacity": 0.95
    }
  });

  // Fit bounds
  const bounds = coords.reduce(
    (bb, c) => bb.extend(c),
    new maplibregl.LngLatBounds(coords[0], coords[0])
  );
  MAP.fitBounds(bounds, { padding: 50 });

  showToast?.("Viser temarute.");
}

// ---------- “Near me” list in your existing sheet ----------
async function openRoutesSheet() {
  await loadRoutes();

  const sheet = document.getElementById("sheetNearby");
  const body = document.getElementById("sheetNearbyBody");
  if (!sheet || !body) return showToast?.("Mangler sheetNearby.");

  const user = getUserLatLonFallback();
  if (!user) return showToast?.("Fant ikke posisjon.");

  // sort by nearest stop
  const items = ROUTES
    .map(r => {
      const near = nearestStopToUser(r, user.lat, user.lon);
      return near ? { route: r, near } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.near.km - b.near.km);

  if (!items.length) {
    body.innerHTML = `<p class="muted">Ingen ruter funnet.</p>`;
  } else {
    body.innerHTML = items.slice(0, 40).map(({ route, near }) => {
      const cat = route.category || "";
      return `
        <div class="hg-place" style="display:flex;justify-content:space-between;gap:10px;align-items:center;">
          <div style="min-width:0;">
            <div style="font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${route.name}
            </div>
            <div class="hg-muted" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
              ${cat} · start nærmest: ${near.stopTitle} · ${formatKm(near.km)}
            </div>
          </div>

          <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;">
            <button class="ghost" onclick="showRouteOverlay('${route.id}', ${near.stopIndex})">Info</button>
            <button class="primary" onclick="focusRouteOnMap('${route.id}', ${near.stopIndex})">Vis</button>
          </div>
        </div>
      `;
    }).join("");
  }

  sheet.setAttribute("aria-hidden", "false");
}

// ==============================
// NÆRMESTE STOPP (for "Nærmeste ruter")
// ==============================

// Haversine i meter
function distanceMeters(aLat, aLon, bLat, bLon) {
  const R = 6371000;
  const toRad = d => (d * Math.PI) / 180;

  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const lat1 = toRad(aLat);
  const lat2 = toRad(bLat);

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(x));
}

/**
 * route: { stops:[{placeId,...}] }
 * userPos: {lat, lon}
 * returns: { distM, stopIndex, place, placeId }
 */
function computeNearestStop(route, userPos) {
  if (!route?.stops?.length || !userPos) return null;

  let best = null;

  route.stops.forEach((s, idx) => {
    const plc = PLACES.find(p => p.id === s.placeId);
    if (!plc) return;

    const d = distanceMeters(userPos.lat, userPos.lon, plc.lat, plc.lon);

    if (!best || d < best.distM) {
      best = { distM: d, stopIndex: idx, place: plc, placeId: plc.id };
    }
  });

  return best;
}

/**
 * Returnerer ruter sortert etter nærmeste stopp.
 * Legger på:
 *  _nearestDistM, _nearestStopIndex, _nearestStopPlaceId, _nearestStopName
 */
function getNearbyRoutesSorted(userPos) {
  if (!Array.isArray(ROUTES) || !ROUTES.length) return [];

  return ROUTES
    .map(r => {
      const n = computeNearestStop(r, userPos);
      return {
        ...r,
        _nearestDistM: n ? Math.round(n.distM) : null,
        _nearestStopIndex: n ? n.stopIndex : null,
        _nearestStopPlaceId: n ? n.placeId : null,
        _nearestStopName: n?.place?.name || ""
      };
    })
    .sort((a, b) => (a._nearestDistM ?? 1e12) - (b._nearestDistM ?? 1e12));
}

// Formatering (samme stil som places-lista di)
function formatDist(m) {
  if (m == null) return "";
  return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km`;
}

function startRouteAtNearest(routeId, userPos) {
  const route = ROUTES.find(r => r.id === routeId);
  if (!route) return;

  const n = computeNearestStop(route, userPos);
  if (!n) return showToast("Fant ikke nærmeste stopp.");

  // Lagre på route-objektet (enkelt, null ekstra datastruktur)
  route._startIndex = n.stopIndex;
  route._startPlaceId = n.placeId;

  // Åpne overlay som før, men du kan nå vise “Starter ved …”
  showRouteOverlay(routeId);
}

// ---------- expose globals (so app.js can call it without imports) ----------
window.loadRoutes = loadRoutes;
window.showRouteOverlay = showRouteOverlay;
window.closeRouteOverlay = closeRouteOverlay;
window.focusRouteOnMap = focusRouteOnMap;
window.openRoutesSheet = openRoutesSheet;
window.clearThematicRoute = clearThematicRoute;
