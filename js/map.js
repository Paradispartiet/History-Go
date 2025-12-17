// map.js — History GO (MapLibre) — WORKING + NO COLLISIONS
(function () {
  "use strict";

  let MAP = null;
  let mapReady = false;
  let dataReady = false;

  let START = { lat: 59.9139, lon: 10.7522, zoom: 13 };

  let PLACES = [];
  let visited = {};
  let catColor = () => "#ffffff";
  let onPlaceClick = () => {};

  let userMarker = null;

  // --- helpers ---
  function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  function getLat(p) {
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
    const v = parseInt(c, 16);
    if (Number.isNaN(v)) return "rgb(255,255,255)";
    let r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
    r = Math.min(255, Math.round(r + 255 * amount));
    g = Math.min(255, Math.round(g + 255 * amount));
    b = Math.min(255, Math.round(b + 255 * amount));
    return `rgb(${r},${g},${b})`;
  }

  // --- init ---
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
      if (dataReady) drawPlaceMarkers();
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

  // --- setters ---
  function setDataReady(v) { dataReady = !!v; }
  function setPlaces(input) {
    const arr = Array.isArray(input) ? input : (Array.isArray(input?.places) ? input.places : []);
    PLACES = arr;
  }
  function setVisited(obj) { visited = obj || {}; }
  function setCatColor(fn) { if (typeof fn === "function") catColor = fn; }
  function setOnPlaceClick(fn) { if (typeof fn === "function") onPlaceClick = fn; }

  // --- user ---
  function setUser(lat, lon, { fly = false } = {}) {
    if (typeof lat !== "number" || typeof lon !== "number") return;

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

    if (fly) MAP.flyTo({ center: ll, zoom: Math.max(MAP.getZoom() || 13, 15), speed: 1.2 });
  }

  // --- markers (NO COLLISION IDS) ---
  const SRC = "hg_places_src";
  const L_DOTS = "hg_places_dots";
  const L_HIT  = "hg_places_hit";
  const L_LAB  = "hg_places_label";

  function maybeDrawMarkers() {
    if (mapReady && dataReady) drawPlaceMarkers();
  }
  function refreshMarkers() {
    drawPlaceMarkers();
  }

  function drawPlaceMarkers() {
    if (!MAP || !Array.isArray(PLACES) || !PLACES.length) return;

    if (!MAP.isStyleLoaded()) {
      MAP.once("load", () => drawPlaceMarkers());
      return;
    }

    const features = [];
    for (const p of PLACES) {
      const lat = getLat(p);
      const lon = getLon(p);
      if (lat == null || lon == null) continue;

      const isVisited = !!visited[p.id];
      const base = catColor(p.category);
      const fill = isVisited ? lighten(base, 0.25) : base;

      features.push({
        type: "Feature",
        properties: {
          id: p.id,
          name: p.name || "",
          visited: isVisited ? 1 : 0,
          fill
        },
        geometry: { type: "Point", coordinates: [lon, lat] }
      });
    }

    const fc = { type: "FeatureCollection", features };

    // update
    const src = MAP.getSource(SRC);
    if (src && typeof src.setData === "function") {
      src.setData(fc);
      return;
    }

    // clean if half-existing
    [L_LAB, L_DOTS, L_HIT].forEach(id => { if (MAP.getLayer(id)) MAP.removeLayer(id); });
    if (MAP.getSource(SRC)) MAP.removeSource(SRC);

    MAP.addSource(SRC, { type: "geojson", data: fc });

    // click surface (invisible)
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

    // dots
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
        "circle-stroke-color": "rgba(0,0,0,0.85)",
        "circle-stroke-width": 1.6,
        "circle-opacity": 1
      }
    });

    // labels
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
        "text-color": "rgba(20,20,20,0.95)",
        "text-halo-color": "rgba(255,255,255,0.98)",
        "text-halo-width": 1.4,
        "text-halo-blur": 0.25,
        "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.0, 12, 0.55, 14, 1.0]
      }
    });

    // cursor + click (bind once)
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
  }

  // --- expose ---
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
