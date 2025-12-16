// map.js — History GO (MapLibre + place layers) — CLEAN v1
(function () {
  "use strict";

  let MAP = null;
  let mapReady = false;
  let dataReady = false;

  let START = { lat: 59.9139, lon: 10.7522, zoom: 13 };

  let PLACES = [];
  let visited = {};
  let catColor = (catId) => "#ffffff";
  let onPlaceClick = (placeId) => {};

  let userMarker = null;

  // --- helpers -------------------------------------------------

  function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function getLat(p) {
    // støtt flere feltnavn uten å knekke
    if (!p) return null;
    if (p.lat != null) return num(p.lat);
    if (p.latitude != null) return num(p.latitude);
    if (Array.isArray(p.coords)) return num(p.coords[1]);
    return null;
  }

  function getLon(p) {
    if (!p) return null;
    if (p.lon != null) return num(p.lon);
    if (p.lng != null) return num(p.lng);
    if (p.longitude != null) return num(p.longitude);
    if (Array.isArray(p.coords)) return num(p.coords[0]);
    return null;
  }

  function lighten(hex, amount = 0.25) {
    let c = String(hex || "#000000").trim();
    if (c.startsWith("#")) c = c.slice(1);
    if (c.length === 3) c = c.split("").map(ch => ch + ch).join("");
    if (c.length !== 6) c = "000000";

    const numv = parseInt(c, 16);
    if (Number.isNaN(numv)) return "rgb(255,255,255)";

    let r = (numv >> 16) & 0xff;
    let g = (numv >> 8) & 0xff;
    let b = numv & 0xff;

    r = Math.min(255, Math.round(r + 255 * amount));
    g = Math.min(255, Math.round(g + 255 * amount));
    b = Math.min(255, Math.round(b + 255 * amount));

    return `rgb(${r},${g},${b})`;
  }

  // --- init ----------------------------------------------------

  function initMap({ containerId = "map", start = START } = {}) {
    START = start || START;
    const el = document.getElementById(containerId);
    if (!el) return null;

    // Lys, tydelig, detaljert – perfekte labels
    const STYLE_URL = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

    MAP = new maplibregl.Map({
      container: containerId,
      style: STYLE_URL,
      center: [START.lon, START.lat],
      zoom: START.zoom,
      pitch: 0,
      bearing: 0,
      antialias: true
    });

    MAP.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    MAP.on("load", () => {
      mapReady = true;
      if (dataReady) maybeDrawMarkers();
      MAP.resize();
    });

    return MAP;
  }

  function resize() {
    if (MAP && typeof MAP.resize === "function") MAP.resize();
  }

  function getMap() {
    return MAP;
  }

  // --- setters -------------------------------------------------

  function setDataReady(v) {
    dataReady = !!v;
  }

  function setPlaces(input) {
    // tåler både array og {places:[...]}
    const arr = Array.isArray(input) ? input : (Array.isArray(input?.places) ? input.places : []);
    PLACES = arr;
  }

  function setVisited(obj) {
    visited = obj || {};
  }

  function setCatColor(fn) {
    if (typeof fn === "function") catColor = fn;
  }

  function setOnPlaceClick(fn) {
    if (typeof fn === "function") onPlaceClick = fn;
  }

  // --- user position ------------------------------------------

  function setUser(lat, lon, { fly = false } = {}) {
    if (typeof lat !== "number" || typeof lon !== "number") return;

    // Standardiser pos for hele appen (routes.js / nearby / etc.)
    window.userLat = lat;
    window.userLon = lon;
    window.currentPos = { lat, lon };

    if (!MAP) return;

    const ll = [lon, lat];

    if (!userMarker) {
      const dot = document.createElement("div");
      dot.className = "hg-user-dot";
      dot.style.width = "14px";
      dot.style.height = "14px";
      dot.style.borderRadius = "50%";
      dot.style.background = "rgba(0,0,0,0.85)";
      dot.style.border = "2px solid rgba(255,255,255,0.95)";
      dot.style.boxShadow = "0 0 10px rgba(0,0,0,0.35)";

      userMarker = new maplibregl.Marker({ element: dot, anchor: "center" })
        .setLngLat(ll)
        .addTo(MAP);
    } else {
      userMarker.setLngLat(ll);
    }

    if (fly) {
      MAP.flyTo({ center: ll, zoom: Math.max(MAP.getZoom() || 13, 15), speed: 1.2 });
    }
  }

  // --- drawing -------------------------------------------------

  function maybeDrawMarkers() {
    if (mapReady && dataReady) drawPlaceMarkers();
  }

  function refreshMarkers() {
    drawPlaceMarkers();
  }

  function drawPlaceMarkers() {
  if (!MAP || !PLACES.length) return;

  const features = [];
  for (const p of PLACES) {
    const lat = Number(p?.lat);
    const lon = Number(p?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

    const isVisited = !!visited[p.id];
    const base = catColor(p.category);
    const fill = isVisited ? lighten(base, 0.25) : base;
    const border = isVisited ? "#ffd700" : "#111111";

    features.push({
      type: "Feature",
      properties: { id: p.id, name: p.name || "", visited: isVisited ? 1 : 0, fill, border },
      geometry: { type: "Point", coordinates: [lon, lat] }
    });
  }

  const fc = { type: "FeatureCollection", features };

  const SRC = "hg-places";
  const L_GLOW = "hg-places-glow";
  const L_HIT  = "hg-places-hit";
  const L_DOTS = "hg-places";
  const L_LAB  = "hg-places-label";

  // Hvis style ikke er ferdig, vent
  if (!MAP.isStyleLoaded()) {
    MAP.once("load", () => drawPlaceMarkers());
    return;
  }

  // Hvis source finnes: bare oppdater data
  const src = MAP.getSource(SRC);
  if (src) {
    src.setData(fc);
    forcePlacesOnTop();
    return;
  }

  // --- CLEAN SLATE (i tilfelle halv-lagde layers fra før) ---
  [L_LAB, L_DOTS, L_HIT, L_GLOW].forEach(id => { if (MAP.getLayer(id)) MAP.removeLayer(id); });
  if (MAP.getSource(SRC)) MAP.removeSource(SRC);

  // --- Add source + layers ---
  MAP.addSource(SRC, { type: "geojson", data: fc });

  MAP.addLayer({
    id: L_GLOW,
    type: "circle",
    source: SRC,
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 2, 12, 3, 14, 5, 16, 9, 18, 14],
      "circle-color": "rgba(0,0,0,0.12)",
      "circle-blur": 0.8
    }
  });

  MAP.addLayer({
    id: L_HIT,
    type: "circle",
    source: SRC,
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 10, 12, 12, 14, 14, 16, 18, 18, 24],
      "circle-color": "rgba(0,0,0,0)",
      "circle-opacity": 0
    }
  });

  MAP.addLayer({
    id: L_DOTS,
    type: "circle",
    source: SRC,
    paint: {
      "circle-radius": [
        "interpolate", ["linear"], ["zoom"],
        10, ["+", 3.2, ["*", 0.6, ["get", "visited"]]],
        12, ["+", 4.2, ["*", 0.8, ["get", "visited"]]],
        14, ["+", 6.0, ["*", 1.1, ["get", "visited"]]],
        16, ["+", 9.0, ["*", 1.4, ["get", "visited"]]],
        18, ["+", 13.0, ["*", 1.7, ["get", "visited"]]]
      ],
      "circle-color": ["get", "fill"],
      "circle-stroke-color": ["get", "border"],
      "circle-stroke-width": 1.8,
      "circle-opacity": 1
    }
  });

  MAP.addLayer({
    id: L_LAB,
    type: "symbol",
    source: SRC,
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Regular"],
      "text-size": ["interpolate", ["linear"], ["zoom"], 11, 12, 14, 13, 18, 16],
      "text-offset": [0, 1.2],
      "text-anchor": "top",
      "text-allow-overlap": false,
      "text-ignore-placement": false
    },
    paint: {
      "text-color": "rgba(20,20,20,0.92)",
      "text-halo-color": "rgba(255,255,255,0.95)",
      "text-halo-width": 1.4,
      "text-halo-blur": 0.25,
      "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.0, 12, 0.55, 14, 1.0]
    }
  });

  // Bind cursor/click én gang (merk: ny layer-id!)
  if (!MAP.__hgPlacesCursorBound) {
    MAP.on("mouseenter", L_HIT, () => { MAP.getCanvas().style.cursor = "pointer"; });
    MAP.on("mouseleave", L_HIT, () => { MAP.getCanvas().style.cursor = ""; });
    MAP.__hgPlacesCursorBound = true;
  }
  if (!MAP.__hgPlacesClickBound) {
    MAP.on("click", L_HIT, (e) => {
      const f = e.features && e.features[0];
      const id = f && f.properties && f.properties.id;
      if (id) onPlaceClick(id);
    });
    MAP.__hgPlacesClickBound = true;
  }

  forcePlacesOnTop();
}

function forcePlacesOnTop() {
  if (!MAP) return;
  ["hg-places-glow", "hg-places", "hg-places-hit", "hg-places-label"].forEach(id => {
    if (MAP.getLayer(id)) MAP.moveLayer(id);
  });
}
  
  // --- expose --------------------------------------------------

  window.HGMap = {
    initMap,
    getMap,
    resize,

    setDataReady,
    setPlaces,
    setVisited,
    setCatColor,
    setOnPlaceClick,

    setUser,

    maybeDrawMarkers,
    refreshMarkers
  };
})();
