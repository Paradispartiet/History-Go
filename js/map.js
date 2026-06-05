// js/map.js — History GO — MARKERS STABLE (v2)
// MapLibre + places markers + labels + robust touch/click hit-testing.
(function () {
  "use strict";

  let MAP = null;
  let mapReady = false;
  let mapStyleMode = "standard";
  let pendingStyleMode = null;
  let isApplyingStyle = false;

  let START = { lat: 59.9139, lon: 10.7522, zoom: 13 };

  let PLACES = [];
  let visited = {};
  let catColor = (/** @type {any} */ _cat) => "#ffffff";
  let onPlaceClick = (/** @type {any} */ _id) => {};

  let userMarker = null;
  const STYLE_STORAGE_KEY = "hg_map_style_mode";
  const STYLE_MODE_STANDARD = "standard";
  const STYLE_MODE_SATELLITE = "satellite";
  const STYLE_URL_STANDARD = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

  const SRC = "hg-places";
  const STANDARD_DIM_SRC = "hg-standard-map-dim-src";
  const STANDARD_DIM_LAYER = "hg-standard-map-dim";
  const STANDARD_DIM_OPACITY = 0.22;
  const L_GLOW = "hg-places-glow";
  const L_HIT  = "hg-places-hit";
  const L_DOTS = "hg-places-dots";
  const L_LAB  = "hg-places-label";
  const PLACE_LABEL_MIN_ZOOM = 13.8;
  const PLACE_HIT_LAYERS = [L_HIT, L_DOTS, L_LAB, L_GLOW];
  const PLACE_HIT_PRIORITY = [L_HIT, L_DOTS, L_LAB, L_GLOW];
  const PLACE_TAP_TOLERANCE_PX = 28;

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

  function initMap({ containerId = "map", start = START } = {}) {
    START = start || START;
    const el = document.getElementById(containerId);
    if (!el || !window.maplibregl) return null;

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
      applyStandardMapDarkening();
      drawPlaceMarkers();
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
    // Beholdt for kompatibilitet.
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

    const customStyleUrl = String(window.HG_NATURTRO_STYLE_URL || "").trim();
    if (customStyleUrl) {
      if (/([?&])key=/.test(customStyleUrl)) return customStyleUrl;
      const sep = customStyleUrl.includes("?") ? "&" : "?";
      return `${customStyleUrl}${sep}key=${encodeURIComponent(key)}`;
    }

    const styleId = String(window.HG_NATURTRO_STYLE_ID || "streets-v4").trim() || "streets-v4";
    return `https://api.maptiler.com/maps/${encodeURIComponent(styleId)}/style.json?key=${encodeURIComponent(key)}`;
  }

  function runWhenStyleReady(fn) {
    if (!MAP || typeof fn !== "function") return;
    if (typeof MAP.isStyleLoaded === "function" && MAP.isStyleLoaded()) {
      fn();
      return;
    }
    MAP.once("style.load", () => {
      if (typeof MAP.once === "function") MAP.once("idle", fn);
      else fn();
    });
  }

  function applyMapStyle(nextMode) {
    console.debug("[HGMap] set style start", nextMode);
    if (!MAP || typeof MAP.setStyle !== "function") {
      console.warn("[HGMap] MapLibre map not ready for style switch");
      return;
    }

    const desired = nextMode === STYLE_MODE_SATELLITE ? STYLE_MODE_SATELLITE : STYLE_MODE_STANDARD;
    if (isApplyingStyle) {
      console.debug("[HGMap] style switch already in progress");
      return;
    }

    if (desired === mapStyleMode && !isApplyingStyle) {
      console.debug("[HGMap] style already active", desired);
      renderMapStyleToggle();
      drawPlaceMarkers();
      return;
    }

    const key = getMapTilerKey();
    console.debug("[HGMap] key present", Boolean(key));
    const styleUrl = getStyleUrlForMode(desired);
    console.debug("[HGMap] style url", styleUrl);
    if (!styleUrl) {
      if (desired === STYLE_MODE_SATELLITE) {
        console.warn("[HGMap] Naturtro kart krever window.HG_MAPTILER_KEY. Beholder standardkart.");
      }
      renderMapStyleToggle();
      return;
    }

    isApplyingStyle = true;
    pendingStyleMode = desired;

    const onStyleReady = () => {
      if (!MAP) return;
      const resolvedMode = pendingStyleMode === STYLE_MODE_SATELLITE ? STYLE_MODE_SATELLITE : STYLE_MODE_STANDARD;
      mapStyleMode = resolvedMode;
      pendingStyleMode = null;
      isApplyingStyle = false;
      saveMapStyleMode(mapStyleMode);
      mapReady = true;
      applyStandardMapDarkening();
      drawPlaceMarkers();
      moveMarkersOnTop();
      MAP.resize();
      renderMapStyleToggle();
      console.debug("[HGMap] place layers restored", {
        source: Boolean(MAP.getSource(SRC)),
        glow: Boolean(MAP.getLayer(L_GLOW)),
        hit: Boolean(MAP.getLayer(L_HIT)),
        dots: Boolean(MAP.getLayer(L_DOTS)),
        label: Boolean(MAP.getLayer(L_LAB))
      });
    };

    try {
      MAP.setStyle(styleUrl);
      runWhenStyleReady(onStyleReady);
      console.debug("[HGMap] setStyle called");
    } catch (error) {
      const message = error?.message || "unknown error";
      console.warn("[HGMap] Naturtro style failed", message, error);
      isApplyingStyle = false;
      pendingStyleMode = null;
      renderMapStyleToggle();
    }
  }

  function redrawPlacesAfterStyleLoad(mode) {
    if (!MAP) return;
    const resolvedMode = mode === STYLE_MODE_SATELLITE ? STYLE_MODE_SATELLITE : STYLE_MODE_STANDARD;
    const run = () => {
      mapStyleMode = resolvedMode;
      pendingStyleMode = null;
      isApplyingStyle = false;
      saveMapStyleMode(mapStyleMode);
      mapReady = true;
      console.debug("[HGMap] redrawing place markers after style switch");
      applyStandardMapDarkening();
      drawPlaceMarkers();
      moveMarkersOnTop();
      MAP.resize();
      renderMapStyleToggle();
      console.debug("[HGMap] place layers restored");
    };

    if (typeof MAP.isStyleLoaded === "function" && MAP.isStyleLoaded()) {
      if (typeof MAP.once === "function") MAP.once("idle", run);
      else run();
      return;
    }

    MAP.once("style.load", () => {
      console.debug("[HGMap] style loaded", resolvedMode);
      if (typeof MAP.once === "function") MAP.once("idle", run);
      else run();
    });
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
      <button type="button" class="hg-map-style-btn" data-mode="standard" aria-pressed="false" data-i18n="ui.attr.map">Kart</button>
      <button type="button" class="hg-map-style-btn" data-mode="satellite" aria-pressed="false" data-i18n="ui.map.detailed">Detaljert</button>
    `;

    const onStyleTogglePress = (ev) => {
      const btn = ev.target?.closest?.(".hg-map-style-btn");
      if (!btn) return;
      ev.preventDefault?.();
      ev.stopPropagation?.();
      applyMapStyle(btn.dataset.mode);
    };

    wrap.addEventListener("click", onStyleTogglePress);
    wrap.querySelectorAll(".hg-map-style-btn").forEach((/** @type {HTMLElement} */ btn) => {
      btn.addEventListener("touchend", onStyleTogglePress, { passive: false });
    });

    controls.insertBefore(wrap, controls.firstChild);
    renderMapStyleToggle();

    const mapEl = /** @type {HTMLElement & { __hgResizeBound?: boolean }} */ (document.getElementById(containerId));
    if (mapEl && !mapEl.__hgResizeBound) {
      window.addEventListener("orientationchange", resize, { passive: true });
      window.addEventListener("resize", resize, { passive: true });
      mapEl.__hgResizeBound = true;
    }
  }

  function renderMapStyleToggle() {
    const wrap = document.querySelector(".hg-map-style-toggle");
    if (!wrap) return;
    wrap.querySelectorAll(".hg-map-style-btn").forEach((/** @type {HTMLElement} */ btn) => {
      const isActive = btn.dataset.mode === mapStyleMode;
      btn.classList.toggle("is-active", isActive);
      btn.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }


  function setPaintPropertyIfSupported(layerId, property, value) {
    if (!MAP || !MAP.getLayer(layerId)) return;
    try {
      MAP.setPaintProperty(layerId, property, value);
    } catch {}
  }

  function tuneStandardBaseMapStyle() {
    if (!MAP || mapStyleMode !== STYLE_MODE_STANDARD || !MAP.getStyle) return;
    const style = MAP.getStyle();
    const layers = Array.isArray(style?.layers) ? style.layers : [];

    for (const layer of layers) {
      const id = layer?.id;
      if (!id || id.startsWith("hg-")) continue;
      const sourceLayer = String(layer["source-layer"] || id).toLowerCase();
      const layerType = layer.type;

      if (layerType === "background") {
        setPaintPropertyIfSupported(id, "background-color", "#101721");
        continue;
      }

      if (layerType === "fill") {
        if (/water|ocean|river|lake/.test(sourceLayer)) {
          setPaintPropertyIfSupported(id, "fill-color", "#0b3551");
          setPaintPropertyIfSupported(id, "fill-opacity", 0.96);
        } else if (/park|wood|forest|landcover|landuse|green|grass|cemetery/.test(sourceLayer)) {
          setPaintPropertyIfSupported(id, "fill-color", "#173726");
          setPaintPropertyIfSupported(id, "fill-opacity", 0.78);
        } else if (/building/.test(sourceLayer)) {
          setPaintPropertyIfSupported(id, "fill-color", "#26313d");
          setPaintPropertyIfSupported(id, "fill-opacity", 0.64);
        } else if (/land|earth/.test(sourceLayer)) {
          setPaintPropertyIfSupported(id, "fill-color", "#18212c");
        }
        continue;
      }

      if (layerType === "line") {
        if (/road|transport|rail|tunnel|bridge/.test(sourceLayer)) {
          setPaintPropertyIfSupported(id, "line-color", "#53677d");
          setPaintPropertyIfSupported(id, "line-opacity", 0.72);
        } else if (/water|river|stream/.test(sourceLayer)) {
          setPaintPropertyIfSupported(id, "line-color", "#1e5c7e");
          setPaintPropertyIfSupported(id, "line-opacity", 0.84);
        }
        continue;
      }

      if (layerType === "symbol" && layer.layout?.["text-field"]) {
        setPaintPropertyIfSupported(id, "text-color", "#eef5ff");
        setPaintPropertyIfSupported(id, "text-halo-color", "rgba(5,10,18,0.92)");
        setPaintPropertyIfSupported(id, "text-halo-width", 1.25);
        setPaintPropertyIfSupported(id, "text-halo-blur", 0.25);
        setPaintPropertyIfSupported(id, "text-opacity", 0.96);
      }
    }
  }

  function applyStandardMapDarkening() {
    if (!MAP || mapStyleMode !== STYLE_MODE_STANDARD) return;
    if (typeof MAP.isStyleLoaded === "function" && !MAP.isStyleLoaded()) {
      runWhenStyleReady(applyStandardMapDarkening);
      return;
    }

    if (!MAP.getSource(STANDARD_DIM_SRC)) {
      MAP.addSource(STANDARD_DIM_SRC, {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [[
                [-180, -85],
                [180, -85],
                [180, 85],
                [-180, 85],
                [-180, -85]
              ]]
            }
          }]
        }
      });
    }

    tuneStandardBaseMapStyle();

    if (!MAP.getLayer(STANDARD_DIM_LAYER)) {
      MAP.addLayer({
        id: STANDARD_DIM_LAYER,
        type: "fill",
        source: STANDARD_DIM_SRC,
        paint: {
          "fill-color": "#07101d",
          "fill-opacity": STANDARD_DIM_OPACITY
        }
      });
    }

    moveMarkersOnTop();
  }

  function setUser(lat, lon, { fly = false } = {}) {
    lat = num(lat);
    lon = num(lon);
    if (lat == null || lon == null || !MAP) return;

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

  function removeIfExists() {
    if (!MAP) return;
    [L_LAB, L_HIT, L_DOTS, L_GLOW].forEach(id => {
      if (MAP.getLayer(id)) MAP.removeLayer(id);
    });
    if (MAP.getSource(SRC)) MAP.removeSource(SRC);
  }

  function isStandardMapStyle() {
    return mapStyleMode === STYLE_MODE_STANDARD;
  }

  function getPlaceMarkerBorder(isVisited) {
    if (isStandardMapStyle()) return isVisited ? "#ffe45f" : "#f8fbff";
    return isVisited ? "#ffd700" : "#111111";
  }

  function getPlaceMarkerStrokeWidth() {
    return isStandardMapStyle() ? 2.4 : 1.8;
  }

  function getPlaceGlowPaint() {
    if (!isStandardMapStyle()) {
      return {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 2, 12, 3, 14, 5, 16, 9, 18, 14],
        "circle-color": "rgba(0,0,0,0.12)",
        "circle-blur": 0.8
      };
    }

    return {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 6, 12, 8, 14, 11, 16, 16, 18, 22],
      "circle-color": ["get", "fill"],
      "circle-opacity": 0.28,
      "circle-blur": 0.65
    };
  }

  function getPlaceLabelPaint() {
    if (!isStandardMapStyle()) {
      return {
        "text-color": "rgba(20,20,20,0.92)",
        "text-halo-color": "rgba(255,255,255,0.95)",
        "text-halo-width": 1.4,
        "text-halo-blur": 0.25,
        "text-opacity": [
          "interpolate", ["linear"], ["zoom"],
          PLACE_LABEL_MIN_ZOOM, 0.0,
          PLACE_LABEL_MIN_ZOOM + 1.2, 0.55,
          PLACE_LABEL_MIN_ZOOM + 2.0, 1.0
        ]
      };
    }

    return {
      "text-color": "rgba(250,252,255,0.98)",
      "text-halo-color": "rgba(3,8,15,0.96)",
      "text-halo-width": 2.2,
      "text-halo-blur": 0.18,
      "text-opacity": [
        "interpolate", ["linear"], ["zoom"],
        PLACE_LABEL_MIN_ZOOM - 0.2, 0.0,
        PLACE_LABEL_MIN_ZOOM + 0.8, 0.78,
        PLACE_LABEL_MIN_ZOOM + 1.6, 1.0
      ]
    };
  }

  function drawPlaceMarkers() {
    if (!MAP) return;
    if (!Array.isArray(PLACES) || PLACES.length === 0) return;

    if (typeof MAP.isStyleLoaded === "function" && !MAP.isStyleLoaded()) {
      runWhenStyleReady(drawPlaceMarkers);
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
      const border = getPlaceMarkerBorder(isVisited);

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

    if (!features.length) return;

    const fc = { type: "FeatureCollection", features };
    applyStandardMapDarkening();
    const src = MAP.getSource(SRC);
    if (src) {
      src.setData(fc);
      moveMarkersOnTop();
      return;
    }

    removeIfExists();
    MAP.addSource(SRC, { type: "geojson", data: fc });

    MAP.addLayer({
      id: L_GLOW,
      type: "circle",
      source: SRC,
      paint: getPlaceGlowPaint()
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
        "circle-stroke-width": getPlaceMarkerStrokeWidth(),
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
      paint: getPlaceLabelPaint()
    });

    MAP.addLayer({
      id: L_HIT,
      type: "circle",
      source: SRC,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 16, 12, 20, 14, 24, 16, 30, 18, 38],
        "circle-color": "rgba(0,0,0,0.01)",
        "circle-opacity": 0.01
      }
    });

    bindPlaceLayerHandlers();
    moveMarkersOnTop();
    console.debug("[HGMap] place layers restored");
  }

  function hasLayer(id) {
    return !!(MAP && MAP.getLayer(id));
  }

  function getPointFromOriginalEvent(originalEvent) {
    if (!MAP || !originalEvent) return null;
    const canvas = MAP.getCanvas?.();
    const rect = canvas?.getBoundingClientRect?.();
    if (!rect) return null;

    const touch = originalEvent.changedTouches?.[0] || originalEvent.touches?.[0] || null;
    const clientX = touch ? touch.clientX : originalEvent.clientX;
    const clientY = touch ? touch.clientY : originalEvent.clientY;

    if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function getPlaceFeatureFromEvent(e) {
    if (!MAP || typeof MAP.queryRenderedFeatures !== "function") return null;

    const layers = PLACE_HIT_LAYERS.filter(hasLayer);
    if (!layers.length) return null;

    const eventFeatures = Array.isArray(e?.features) ? e.features : [];
    for (const layerId of PLACE_HIT_PRIORITY) {
      const match = eventFeatures.find((feature) => feature?.layer?.id === layerId && feature?.properties?.id);
      if (match) return match;
    }

    const point = e?.point || getPointFromOriginalEvent(e?.originalEvent);
    if (!point) return null;

    const originalEvent = e?.originalEvent;
    const isTouch = !!(originalEvent?.changedTouches?.length || originalEvent?.touches?.length || originalEvent?.pointerType === "touch");
    const queryArea = isTouch
      ? [
          [point.x - PLACE_TAP_TOLERANCE_PX, point.y - PLACE_TAP_TOLERANCE_PX],
          [point.x + PLACE_TAP_TOLERANCE_PX, point.y + PLACE_TAP_TOLERANCE_PX]
        ]
      : point;

    const features = MAP.queryRenderedFeatures(queryArea, { layers });
    if (!Array.isArray(features) || !features.length) return null;

    for (const layerId of PLACE_HIT_PRIORITY) {
      const match = features.find((feature) => feature?.layer?.id === layerId && feature?.properties?.id);
      if (match) return match;
    }

    return features.find((feature) => feature?.properties?.id) || null;
  }

  function bindPlaceLayerHandlers() {
    if (!MAP || !hasLayer(L_HIT)) return;

    if (MAP.__hgPlaceHandlers) {
      const prev = MAP.__hgPlaceHandlers;
      MAP.off("mouseenter", L_HIT, prev.setPointer);
      MAP.off("mouseleave", L_HIT, prev.clearPointer);
      MAP.off("click", prev.handlePlaceClick);
      MAP.off("touchend", prev.handlePlaceClick);
      [L_HIT, L_DOTS, L_LAB].forEach((layerId) => {
        if (!hasLayer(layerId)) return;
        MAP.off("click", layerId, prev.handlePlaceClick);
        MAP.off("touchend", layerId, prev.handlePlaceClick);
      });
    }

    const canvas = MAP.getCanvas();

    const setPointer = () => {
      canvas.style.cursor = "pointer";
    };

    const clearPointer = () => {
      canvas.style.cursor = "";
    };

    const handlePlaceClick = (e) => {
      const feature = getPlaceFeatureFromEvent(e);
      const id = feature?.properties?.id;
      if (!id) return;

      e?.preventDefault?.();
      e?.originalEvent?.preventDefault?.();
      e?.originalEvent?.stopPropagation?.();

      onPlaceClick(id);
    };

    MAP.__hgPlaceHandlers = { setPointer, clearPointer, handlePlaceClick };

    MAP.on("mouseenter", L_HIT, setPointer);
    MAP.on("mouseleave", L_HIT, clearPointer);

    MAP.on("click", handlePlaceClick);
    MAP.on("touchend", handlePlaceClick);

    [L_HIT, L_DOTS, L_LAB].forEach((layerId) => {
      if (!hasLayer(layerId)) return;
      MAP.on("click", layerId, handlePlaceClick);
      MAP.on("touchend", layerId, handlePlaceClick);
    });
  }

  function moveMarkersOnTop() {
    if (!MAP) return;
    [L_GLOW, L_DOTS, L_LAB, L_HIT].forEach(id => {
      if (MAP.getLayer(id)) MAP.moveLayer(id);
    });
  }

  function maybeDrawMarkers() { drawPlaceMarkers(); }
  function refreshMarkers() { drawPlaceMarkers(); }

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
