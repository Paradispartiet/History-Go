// js/map.js — History GO — MARKERS STABLE (v1)
// (MapLibre + places markers + labels)
(function () {
  "use strict";

  let MAP = null;
  let mapReady = false;

  let START = { lat: 59.9139, lon: 10.7522, zoom: 13 };

  let PLACES = [];
  let visited = {};
  let catColor = () => "#ffffff";
  let onPlaceClick = () => {};

  let userMarker = null;

  // ---- helpers ----
  function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function lighten(hex, amount = 0.25) {
    let c = String(hex || "#000000").trim();
    if (c.startsWith("#")) c = c.slice(1);
    if (c.length === 3) c = c.split("").map(ch => ch + ch).join("");
    if (c.length !== 6) c = "000000";

    const n = parseInt(c, 16);
    if (Number.isNaN(n)) return "rgb(255,255,255)";

    let r = (n >> 16) & 255;
    let g = (n >> 8) & 255;
    let b = n & 255;

    r = Math.min(255, Math.round(r + 255 * amount));
    g = Math.min(255, Math.round(g + 255 * amount));
    b = Math.min(255, Math.round(b + 255 * amount));

    return `rgb(${r},${g},${b})`;
  }

  // ---- init ----
  function initMap({ containerId = "map", start = START } = {}) {
    START = start || START;
    const el = document.getElementById(containerId);
    if (!el) return null;

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
      drawPlaceMarkers(); // ← tegn så snart kartet er klart
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

  // ---- setters ----
  function setPlaces(arr) {
    PLACES = Array.isArray(arr) ? arr : [];
    if (mapReady) drawPlaceMarkers();
  }

  function setVisited(obj) {
    visited = obj || {};
    if (mapReady) drawPlaceMarkers();
  }

  function setCatColor(fn) {
    if (typeof fn === "function") catColor = fn;
    if (mapReady) drawPlaceMarkers();
  }

  function setOnPlaceClick(fn) {
    if (typeof fn === "function") onPlaceClick = fn;
  }

  function setDataReady(_) {
    // Beholdt for kompat, men vi trenger ikke gate lenger
    // (markører tegnes når kart + places finnes)
  }

  // ---- user ----
  function setUser(lat, lon, { fly = false } = {}) {
  lat = num(lat); lon = num(lon);
  if (lat == null || lon == null) return;
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
    MAP.flyTo({
      center: ll,
      zoom: Math.max(MAP.getZoom() || 13, 15),
      speed: 1.2
    });
  }
}

  // ---- markers ----
  const SRC = "hg-places";
  const L_GLOW = "hg-places-glow";
  const L_HIT  = "hg-places-hit";
  const L_DOTS = "hg-places-dots";
  const L_LAB  = "hg-places-label";

  function removeIfExists() {
    if (!MAP) return;
    [L_LAB, L_DOTS, L_HIT, L_GLOW].forEach(id => {
      if (MAP.getLayer(id)) MAP.removeLayer(id);
    });
    if (MAP.getSource(SRC)) MAP.removeSource(SRC);
  }

  function drawPlaceMarkers() {
    if (!MAP) return;
    if (!Array.isArray(PLACES) || PLACES.length === 0) return;

    if (!MAP.isStyleLoaded()) {
      MAP.once("load", drawPlaceMarkers);
      return;
    }

    const features = [];
    for (const p of PLACES) {
      const lat = num(p?.lat);
      const lon = num(p?.lon);
      if (lat == null || lon == null) continue;

      const isVisited = !!visited[p.id];
      const base = catColor(p.category);
      const fill = isVisited ? lighten(base, 0.25) : base;
      const border = isVisited ? "#ffd700" : "#111111";

      features.push({
        type: "Feature",
        properties: {
          id: p.id,
          name: p.name || "",
          visited: isVisited ? 1 : 0,
          fill,
          border
        },
        geometry: { type: "Point", coordinates: [lon, lat] }
      });
    }

    // Hvis ingen gyldige coords: ikke tegn
    if (!features.length) return;

    const fc = { type: "FeatureCollection", features };

    // Hvis source finnes: oppdater data
    const src = MAP.getSource(SRC);
    if (src) {
      src.setData(fc);
      moveMarkersOnTop();
      return;
    }

    // Clean start (unngå rester fra gamle lag)
    removeIfExists();

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

    if (!MAP.__hgPlacesBound) {
      MAP.on("mouseenter", L_HIT, () => { MAP.getCanvas().style.cursor = "pointer"; });
      MAP.on("mouseleave", L_HIT, () => { MAP.getCanvas().style.cursor = ""; });
      MAP.on("click", L_HIT, (e) => {
        const f = e.features && e.features[0];
        const id = f && f.properties && f.properties.id;
        if (id) onPlaceClick(id);
      });
      MAP.__hgPlacesBound = true;
    }

    moveMarkersOnTop();
  }

  function moveMarkersOnTop() {
    if (!MAP) return;
    [L_GLOW, L_DOTS, L_HIT, L_LAB].forEach(id => {
      if (MAP.getLayer(id)) MAP.moveLayer(id);
    });
  }

  function maybeDrawMarkers() { drawPlaceMarkers(); }
  function refreshMarkers() { drawPlaceMarkers(); }

  // ---- expose ----
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
