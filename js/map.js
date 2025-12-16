// map.js — History GO (MapLibre) — STABLE MARKERS v1
(function () {
  "use strict";

  let MAP = null;

  // state
  let mapReady = false;
  let dataReady = false;

  let START = { lat: 59.9139, lon: 10.7522, zoom: 13 };

  let PLACES = [];
  let visited = {};
  let catColor = () => "#ffffff";
  let onPlaceClick = () => {};

  let userMarker = null;

  // ids
  const SRC = "hg-places";
  const L_DOTS = "hg-places-dots";
  const L_HIT  = "hg-places-hit";
  const L_LAB  = "hg-places-label";

  // ---------- helpers ----------
  function isNum(x) {
    return typeof x === "number" && Number.isFinite(x);
  }

  function lighten(hex, amount = 0.22) {
    let c = String(hex || "#000").trim();
    if (c.startsWith("#")) c = c.slice(1);
    if (c.length === 3) c = c.split("").map(ch => ch + ch).join("");
    if (c.length !== 6) c = "000000";
    const n = parseInt(c, 16);
    if (!Number.isFinite(n)) return "#ffffff";
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.min(255, Math.round(r + 255 * amount));
    g = Math.min(255, Math.round(g + 255 * amount));
    b = Math.min(255, Math.round(b + 255 * amount));
    return `rgb(${r},${g},${b})`;
  }

  function buildFC() {
    const feats = [];
    for (const p of PLACES) {
      const lat = Number(p?.lat);
      const lon = Number(p?.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      const v = !!visited[p.id];
      const base = catColor(p.category);
      const fill = v ? lighten(base, 0.22) : base;
      const border = v ? "#ffd700" : "#0b0b0b";

      feats.push({
        type: "Feature",
        properties: {
          id: p.id,
          name: p.name || "",
          visited: v ? 1 : 0,
          fill,
          border
        },
        geometry: { type: "Point", coordinates: [lon, lat] }
      });
    }
    return { type: "FeatureCollection", features: feats };
  }

  function ensurePlacesLayer() {
    if (!MAP) return;
    if (!mapReady || !dataReady) return;

    // Style kan “resette” layers. Vent til style er klar.
    if (!MAP.isStyleLoaded()) return;

    // Source
    const fc = buildFC();

    if (!MAP.getSource(SRC)) {
      MAP.addSource(SRC, { type: "geojson", data: fc });
    } else {
      MAP.getSource(SRC).setData(fc);
    }

    // Layers (kan mangle etter style reload)
    if (!MAP.getLayer(L_DOTS)) {
      MAP.addLayer({
        id: L_DOTS,
        type: "circle",
        source: SRC,
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            10, 4,
            12, 6,
            14, 9,
            16, 13,
            18, 18
          ],
          "circle-color": ["get", "fill"],
          "circle-stroke-color": ["get", "border"],
          "circle-stroke-width": 2,
          "circle-opacity": 1
        }
      });
    }

    if (!MAP.getLayer(L_HIT)) {
      MAP.addLayer({
        id: L_HIT,
        type: "circle",
        source: SRC,
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            10, 14,
            12, 16,
            14, 18,
            16, 22,
            18, 28
          ],
          "circle-color": "rgba(0,0,0,0)",
          "circle-opacity": 0
        }
      });
    }

    if (!MAP.getLayer(L_LAB)) {
      MAP.addLayer({
        id: L_LAB,
        type: "symbol",
        source: SRC,
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 12, 11, 15, 13, 18, 15],
          "text-offset": [0, 1.15],
          "text-anchor": "top",
          "text-allow-overlap": false,
          "text-ignore-placement": false
        },
        paint: {
          "text-color": "rgba(20,20,20,0.92)",
          "text-halo-color": "rgba(255,255,255,0.95)",
          "text-halo-width": 1.3,
          "text-halo-blur": 0.2,
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0.0, 12, 0.5, 14, 1.0]
        }
      });
    }

    // Flytt alltid til toppen (så de ikke havner “under” basemap-lag)
    [L_DOTS, L_HIT, L_LAB].forEach(id => {
      if (MAP.getLayer(id)) MAP.moveLayer(id);
    });

    // Cursor + click bindes én gang
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

  function drawNowOrSoon() {
    if (!MAP) return;

    // Hvis style ikke er klar enda: prøv igjen når den blir det
    if (!MAP.isStyleLoaded()) return;

    ensurePlacesLayer();
  }

  // ---------- public ----------
  function initMap({ containerId = "map", start = START } = {}) {
    START = start || START;

    // Fargerik og tydelig, med gatenavn/stedsnavn
    const STYLE_URL = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

    MAP = new maplibregl.Map({
      container: containerId,
      style: STYLE_URL,
      center: [START.lon, START.lat],
      zoom: START.zoom,
      pitch: 0,
      bearing: 0,
      antialias: true
    });

    MAP.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    MAP.on("load", () => {
      mapReady = true;
      ensurePlacesLayer();
      MAP.resize();
    });

    // VIKTIG: hvis style “reloades” så forsvinner custom layers → legg dem tilbake
    MAP.on("styledata", () => {
      if (!mapReady) return;
      // styledata kan spamme, men ensurePlacesLayer er idempotent
      ensurePlacesLayer();
    });

    return MAP;
  }

  function resize() {
    if (MAP && typeof MAP.resize === "function") MAP.resize();
  }

  function getMap() {
    return MAP;
  }

  function setDataReady(v) {
    dataReady = !!v;
    ensurePlacesLayer();
  }

  function setPlaces(input) {
    const arr = Array.isArray(input) ? input : (Array.isArray(input?.places) ? input.places : []);
    PLACES = arr;
    ensurePlacesLayer();
  }

  function setVisited(obj) {
    visited = obj || {};
    ensurePlacesLayer();
  }

  function setCatColor(fn) {
    if (typeof fn === "function") catColor = fn;
    ensurePlacesLayer();
  }

  function setOnPlaceClick(fn) {
    if (typeof fn === "function") onPlaceClick = fn;
  }

  function setUser(lat, lon, { fly = false } = {}) {
    if (!isNum(lat) || !isNum(lon)) return;

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

  function maybeDrawMarkers() {
    ensurePlacesLayer();
  }

  function refreshMarkers() {
    ensurePlacesLayer();
  }

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
