// map.js — History GO (MapLibre) — STABLE MARKERS v1
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

  // ---- IDs (unikke, ingen kollisjon med basemap) ----
  const SRC = "hg-places-src";
  const L_GLOW = "hg-places-glow";
  const L_HIT = "hg-places-hit";
  const L_DOTS = "hg-places-dots";
  const L_LABEL = "hg-places-label";

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

  function safeRemoveLayer(id) {
    try { if (MAP && MAP.getLayer(id)) MAP.removeLayer(id); } catch (_) {}
  }
  function safeRemoveSource(id) {
    try { if (MAP && MAP.getSource(id)) MAP.removeSource(id); } catch (_) {}
  }

  function clearHgLayers() {
    if (!MAP) return;
    [L_LABEL, L_DOTS, L_HIT, L_GLOW].forEach(safeRemoveLayer);
    safeRemoveSource(SRC);
  }

  function ensureStyleReady(cb) {
    if (!MAP) return;
    if (MAP.isStyleLoaded && MAP.isStyleLoaded()) return cb();
    // MapLibre: "load" kan allerede ha skjedd, så vi tar også "idle"
    const once = () => { MAP.off("idle", once); cb(); };
    MAP.once("load", cb);
    MAP.on("idle", once);
  }

  // ---- init ----
  function initMap({ containerId = "map", start = START } = {}) {
    START = start || START;
    const el = document.getElementById(containerId);
    if (!el) return null;

    // Pen, lys, detaljert, med labels
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
      if (dataReady) drawPlaceMarkers(true);
      MAP.resize();
    });

    return MAP;
  }

  function getMap() { return MAP; }
  function resize() { if (MAP && MAP.resize) MAP.resize(); }

  // ---- setters ----
  function setDataReady(v) {
    dataReady = !!v;
    if (mapReady && dataReady) drawPlaceMarkers(false);
  }

  function setPlaces(input) {
    const arr = Array.isArray(input) ? input : (Array.isArray(input?.places) ? input.places : []);
    PLACES = arr;
    if (mapReady && dataReady) drawPlaceMarkers(false);
  }

  function setVisited(obj) {
    visited = obj || {};
    if (mapReady && dataReady) drawPlaceMarkers(false);
  }

  function setCatColor(fn) { if (typeof fn === "function") catColor = fn; }
  function setOnPlaceClick(fn) { if (typeof fn === "function") onPlaceClick = fn; }

  // ---- user ----
  function setUser(lat, lon, { fly = false } = {}) {
    lat = num(lat); lon = num(lon);
    if (lat == null || lon == null) return;

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

  // ---- markers ----
  function maybeDrawMarkers() {
    if (mapReady && dataReady) drawPlaceMarkers(false);
  }

  function refreshMarkers() {
    if (mapReady && dataReady) drawPlaceMarkers(false);
  }

  function drawPlaceMarkers(forceRebuild = false) {
    if (!MAP) return;
    if (!Array.isArray(PLACES) || PLACES.length === 0) return;

    ensureStyleReady(() => {
      const features = [];

      for (const p of PLACES) {
        const lat = num(p?.lat ?? p?.latitude);
        const lon = num(p?.lon ?? p?.lng ?? p?.longitude);
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

      const fc = { type: "FeatureCollection", features };

      // Hvis du har hatt gamle layers: rebuild
      if (forceRebuild) {
        clearHgLayers();
      }

      // Oppdater om source finnes
      const src = MAP.getSource(SRC);
      if (src && src.setData) {
        src.setData(fc);
        moveHgLayersToTop();
        return;
      }

      // Ellers: bygg fra scratch (og fjern gamle HG-lag først)
      clearHgLayers();

      MAP.addSource(SRC, { type: "geojson", data: fc });

      MAP.addLayer({
        id: L_GLOW,
        type: "circle",
        source: SRC,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 3, 12, 4, 14, 6, 16, 10, 18, 16],
          "circle-color": "rgba(0,0,0,0.10)",
          "circle-blur": 0.9
        }
      });

      MAP.addLayer({
        id: L_HIT,
        type: "circle",
        source: SRC,
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 12, 12, 14, 14, 16, 16, 20, 18, 26],
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
            10, ["+", 3.4, ["*", 0.6, ["get", "visited"]]],
            12, ["+", 4.6, ["*", 0.9, ["get", "visited"]]],
            14, ["+", 6.4, ["*", 1.2, ["get", "visited"]]],
            16, ["+", 9.6, ["*", 1.5, ["get", "visited"]]],
            18, ["+", 14.0, ["*", 1.8, ["get", "visited"]]]
          ],
          "circle-color": ["get", "fill"],
          "circle-stroke-color": ["get", "border"],
          "circle-stroke-width": 2.0,
          "circle-opacity": 1
        }
      });

      MAP.addLayer({
        id: L_LABEL,
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

      // Cursor/click én gang
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

      moveHgLayersToTop();
    });
  }

  function moveHgLayersToTop() {
    if (!MAP) return;
    [L_GLOW, L_DOTS, L_HIT, L_LABEL].forEach(id => {
      try { if (MAP.getLayer(id)) MAP.moveLayer(id); } catch (_) {}
    });
  }

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
