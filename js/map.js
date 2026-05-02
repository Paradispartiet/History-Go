// js/map.js — History GO — MARKERS STABLE (v1)
// (MapLibre + places markers + labels)
(function () {
  "use strict";

  let MAP = null;
  let mapReady = false;
  let mapStyleMode = "standard";
  let pendingStyleMode = null;
  let isApplyingStyle = false;
  let placeLayerHandlers = null;

  let START = { lat: 59.9139, lon: 10.7522, zoom: 13 };

  let PLACES = [];
  let visited = {};
  let catColor = () => "#ffffff";
  let onPlaceClick = () => {};

  let userMarker = null;
  const STYLE_STORAGE_KEY = "hg_map_style_mode";
  const STYLE_MODE_STANDARD = "standard";
  const STYLE_MODE_SATELLITE = "satellite";
  const STYLE_URL_STANDARD = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

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

    mapStyleMode = getSavedMapStyleMode();
    const initialStyleUrl = getStyleUrlForMode(mapStyleMode);
    if (!initialStyleUrl) {
      console.warn("[HGMap] Naturtro kart krever window.HG_MAPTILER_KEY. Beholder standardkart.");
      mapStyleMode = STYLE_MODE_STANDARD;
      saveMapStyleMode(mapStyleMode);
    }

    MAP = new maplibregl.Map({
      container: containerId,
      style: getStyleUrlForMode(mapStyleMode),
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
      ensureMapStyleToggle(containerId);
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

  function getSavedMapStyleMode() {
    try {
      const raw = localStorage.getItem(STYLE_STORAGE_KEY);
      if (raw === STYLE_MODE_STANDARD || raw === STYLE_MODE_SATELLITE) return raw;
    } catch {}
    return STYLE_MODE_STANDARD;
  }

  function saveMapStyleMode(mode) {
    try { localStorage.setItem(STYLE_STORAGE_KEY, mode); } catch {}
  }

  function getMapTilerKey() {
    const key = String(window.HG_MAPTILER_KEY || window.MAPTILER_KEY || "").trim();
    return key || "";
  }

  function getStyleUrlForMode(mode) {
    if (mode !== STYLE_MODE_SATELLITE) return STYLE_URL_STANDARD;
    const key = getMapTilerKey();
    if (!key) return null;
    return `https://api.maptiler.com/maps/satellite-v4/style.json?key=${encodeURIComponent(key)}`;
  }

  function redrawPlacesAfterStyleLoad(mode) {
    if (!MAP) return;

    const run = () => {
      mapStyleMode = mode === STYLE_MODE_SATELLITE ? STYLE_MODE_SATELLITE : STYLE_MODE_STANDARD;
      saveMapStyleMode(mapStyleMode);
      mapReady = true;
      console.debug("[HGMap] style loaded", mapStyleMode);
      console.debug("[HGMap] redrawing place markers after style switch");
      drawPlaceMarkers();
      moveMarkersOnTop();
      MAP.resize();
      renderMapStyleToggle();
    };

    if (MAP.isStyleLoaded()) {
      run();
      return;
    }

    MAP.once("style.load", run);
  }

  function applyMapStyle(nextMode) {
    console.debug("[HGMap] set style start", nextMode);
    if (!MAP || typeof MAP.setStyle !== "function") {
      console.warn("[HGMap] MapLibre map not ready for style switch");
      return;
    }
    if (isApplyingStyle) return;
    const desired = nextMode === STYLE_MODE_SATELLITE ? STYLE_MODE_SATELLITE : STYLE_MODE_STANDARD;
    const styleUrl = getStyleUrlForMode(desired);
    if (!styleUrl) {
      if (desired === STYLE_MODE_SATELLITE) {
        console.warn("[HGMap] Naturtro kart krever window.HG_MAPTILER_KEY. Beholder standardkart.");
      }
      mapStyleMode = STYLE_MODE_STANDARD;
      saveMapStyleMode(mapStyleMode);
      renderMapStyleToggle();
      return;
    }

    isApplyingStyle = true;
    pendingStyleMode = desired;

    const clearState = () => {
      isApplyingStyle = false;
      pendingStyleMode = null;
    };

    const onError = (error) => {
      if (!isApplyingStyle) return;
      const message = error?.error?.message || error?.message || "unknown error";
      console.warn("[HGMap] style failed", message, error?.error || error);
      MAP.off("error", onError);
      clearState();

      mapStyleMode = STYLE_MODE_STANDARD;
      saveMapStyleMode(mapStyleMode);
      renderMapStyleToggle();

      try {
        MAP.setStyle(STYLE_URL_STANDARD);
        redrawPlacesAfterStyleLoad(STYLE_MODE_STANDARD);
      } catch (fallbackError) {
        console.warn("[HGMap] style failed", fallbackError);
      }
    };

    MAP.once("error", onError);
    MAP.setStyle(styleUrl);
    redrawPlacesAfterStyleLoad(desired);

    const finalize = () => {
      MAP.off("error", onError);
      clearState();
    };
    if (MAP.isStyleLoaded()) finalize();
    else MAP.once("style.load", finalize);
  }

  function ensureMapStyleToggle(containerId) {
    const controls = document.querySelector(".map-controls");
    if (!controls || controls.querySelector(".hg-map-style-toggle")) {
      renderMapStyleToggle();
      return;
    }
    const wrap = document.createElement("div");
    wrap.className = "hg-map-style-toggle";
    wrap.innerHTML = `
      <button type="button" class="hg-map-style-btn" data-mode="standard" aria-pressed="false">Kart</button>
      <button type="button" class="hg-map-style-btn" data-mode="satellite" aria-pressed="false">Naturtro</button>
    `;
    const onStyleTogglePress = (ev) => {
      const btn = ev.target?.closest?.(".hg-map-style-btn");
      if (!btn) return;
      if (typeof ev.preventDefault === "function") ev.preventDefault();
      if (typeof ev.stopPropagation === "function") ev.stopPropagation();

      if (typeof console !== "undefined" && typeof console.debug === "function") {
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const topEl = document.elementFromPoint(cx, cy);
        console.debug("[HGMap] map style hit test", {
          mode: btn.dataset.mode,
          rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
          topElement: topEl?.className || topEl?.id || topEl?.tagName || null
        });
      }

      applyMapStyle(btn.dataset.mode);
    };

    wrap.addEventListener("click", onStyleTogglePress);
    wrap.querySelectorAll(".hg-map-style-btn").forEach((btn) => {
      btn.addEventListener("touchend", onStyleTogglePress, { passive: false });
    });
    controls.insertBefore(wrap, controls.firstChild);
    renderMapStyleToggle();

    const mapEl = document.getElementById(containerId);
    if (mapEl && !mapEl.__hgResizeBound) {
      window.addEventListener("orientationchange", resize, { passive: true });
      window.addEventListener("resize", resize, { passive: true });
      mapEl.__hgResizeBound = true;
    }
  }

  function renderMapStyleToggle() {
    const wrap = document.querySelector(".hg-map-style-toggle");
    if (!wrap) return;
    wrap.querySelectorAll(".hg-map-style-btn").forEach((btn) => {
      const isActive = btn.dataset.mode === mapStyleMode;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
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

    if (!MAP.isStyleLoaded()) return;

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
          10, ["+", 2.4, ["*", 0.5, ["get", "visited"]]],
          12, ["+", 3.2, ["*", 0.7, ["get", "visited"]]],
          14, ["+", 4.8, ["*", 0.9, ["get", "visited"]]],
          16, ["+", 7.2, ["*", 1.2, ["get", "visited"]]],
          18, ["+", 10.5, ["*", 1.5, ["get", "visited"]]]
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

    bindPlaceLayerHandlers();
    moveMarkersOnTop();
    console.debug("[HGMap] place layers restored");
  }

  function bindPlaceLayerHandlers() {
    if (!MAP || !MAP.getLayer(L_HIT)) return;

    if (placeLayerHandlers) {
      MAP.off("mouseenter", L_HIT, placeLayerHandlers.setPointer);
      MAP.off("mouseleave", L_HIT, placeLayerHandlers.clearPointer);
      MAP.off("click", L_HIT, placeLayerHandlers.handlePlaceClick);
      MAP.off("touchend", L_HIT, placeLayerHandlers.handlePlaceClick);
    }

    const canvas = MAP.getCanvas();
    const setPointer = () => { canvas.style.cursor = "pointer"; };
    const clearPointer = () => { canvas.style.cursor = ""; };
    const handlePlaceClick = (e) => {
      const f = e?.features?.[0];
      const id = f?.properties?.id;
      if (!id) return;
      e?.originalEvent?.preventDefault?.();
      e?.originalEvent?.stopPropagation?.();
      onPlaceClick(id);
    };

    MAP.on("mouseenter", L_HIT, setPointer);
    MAP.on("mouseleave", L_HIT, clearPointer);
    MAP.on("click", L_HIT, handlePlaceClick);
    MAP.on("touchend", L_HIT, handlePlaceClick);

    placeLayerHandlers = { setPointer, clearPointer, handlePlaceClick };
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
