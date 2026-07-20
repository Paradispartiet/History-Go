(() => {
  // js/map.ts
  (function() {
    "use strict";
    let MAP = null;
    let mapReady = false;
    let mapStyleMode = "standard";
    let pendingStyleMode = null;
    let isApplyingStyle = false;
    let START = { lat: 59.9139, lon: 10.7522, zoom: 13 };
    let PLACES = [];
    let visited = {};
    let catColor = (_cat) => "#ffffff";
    let onPlaceClick = (_id) => {
    };
    let userMarker = null;
    const STYLE_STORAGE_KEY = "hg_map_style_mode";
    const STYLE_MODE_STANDARD = "standard";
    const STYLE_MODE_SATELLITE = "satellite";
    const DEFAULT_MAP_PITCH = 35;
    const STYLE_URL_STANDARD = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
    const SRC = "hg-places";
    const L_GLOW = "hg-places-glow";
    const L_HIT = "hg-places-hit";
    const L_DOTS = "hg-places-dots";
    const L_LAB = "hg-places-label";
    const PLACE_LABEL_MIN_ZOOM = 13.8;
    const PLACE_HIT_LAYERS = [L_HIT, L_DOTS, L_LAB, L_GLOW];
    const PLACE_HIT_PRIORITY = [L_HIT, L_DOTS, L_LAB, L_GLOW];
    const PLACE_TAP_TOLERANCE_PX = 12;
    const PLACE_POINTER_MOVE_TOLERANCE_PX = 7;
    const PLACE_GESTURE_COOLDOWN_MS = 180;
    function num(v) {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }
    const CONTRACT_VERIFIED_STATUSES = /* @__PURE__ */ new Set(["verified", "verified_geometry", "verified_historical_source"]);
    const CONTRACT_REVIEW_STATUSES = /* @__PURE__ */ new Set(["needs_manual_visual_qa", "needs_source", "legacy_unverified", "historical_approximation"]);
    const CONTRACT_LINEAR_TYPES = /* @__PURE__ */ new Set(["street", "linear_area", "route", "quay", "park", "natural_area"]);
    const CONTRACT_COORD_ROLES = /* @__PURE__ */ new Set(["display_marker", "unlock_point", "label_anchor", "entrance", "building_center", "site_center", "line_anchor", "area_anchor", "historical_anchor"]);
    const CONTRACT_ACCURACY = /* @__PURE__ */ new Set(["rooftop", "entrance", "building", "parcel", "interpolated", "geometric_center", "approximate", "historical_approximation", "semantic_anchor", "unknown"]);
    function hasCoordinateText(value) {
      return typeof value === "string" && value.trim().length > 0;
    }
    function hasStructuredCoordinateAddress(address) {
      return !!address && typeof address === "object" && ["street", "number", "postcode", "city", "country"].some((field) => hasCoordinateText(address[field]));
    }
    function hasCoordinateSourceIdentity(place) {
      return hasCoordinateText(place == null ? void 0 : place.sourceObjectId) || hasStructuredCoordinateAddress(place == null ? void 0 : place.address);
    }
    function coordinateDecimals(value) {
      var _a;
      const raw = String(value);
      if (/e-/i.test(raw)) return Number(raw.split(/e-/i)[1]) || 0;
      return ((_a = raw.split(".")[1]) == null ? void 0 : _a.length) || 0;
    }
    function hasCoordinateGeometryOrAnchor(place) {
      return !!(place == null ? void 0 : place.geometry) || Array.isArray(place == null ? void 0 : place.anchors) && place.anchors.length > 0 || (place == null ? void 0 : place.coordRole) === "line_anchor" || (place == null ? void 0 : place.coordRole) === "area_anchor";
    }
    function hasCompleteCoordinateContract(place) {
      const locatorType = String((place == null ? void 0 : place.locatorType) || "").trim();
      const sourceProvider = String((place == null ? void 0 : place.sourceProvider) || "").trim();
      const geocodeAccuracy = String((place == null ? void 0 : place.geocodeAccuracy) || "").trim();
      const coordRole = String((place == null ? void 0 : place.coordRole) || "").trim();
      if (!locatorType || !sourceProvider || sourceProvider === "legacy_unknown") return false;
      if (!hasCoordinateSourceIdentity(place)) return false;
      if (!CONTRACT_ACCURACY.has(geocodeAccuracy) || geocodeAccuracy === "approximate" || geocodeAccuracy === "unknown") return false;
      if (!CONTRACT_COORD_ROLES.has(coordRole)) return false;
      if (!hasCoordinateText(place == null ? void 0 : place.coordType) || !hasCoordinateText(place == null ? void 0 : place.coordNote)) return false;
      if (String((place == null ? void 0 : place.coordSource) || "").trim() === "manual_map_check" && !hasCoordinateSourceIdentity(place)) return false;
      if (geocodeAccuracy === "interpolated" && coordRole === "unlock_point") return false;
      if (CONTRACT_LINEAR_TYPES.has(locatorType) && !hasCoordinateGeometryOrAnchor(place)) return false;
      if (["historic_site", "archaeological_site"].includes(locatorType) && !["historical_map", "manual_research"].includes(sourceProvider)) return false;
      return true;
    }
    function getCoordinateTrust(place) {
      const lat = num(place == null ? void 0 : place.lat);
      const lon = num(place == null ? void 0 : place.lon);
      const r = num(place == null ? void 0 : place.r);
      if (lat == null || lon == null || r == null || lat < -90 || lat > 90 || lon < -180 || lon > 180 || r <= 0) return "invalid";
      const coordStatus = String((place == null ? void 0 : place.coordStatus) || "").trim();
      if (!coordStatus || !hasCoordinateText(place == null ? void 0 : place.locatorType) || !hasCoordinateText(place == null ? void 0 : place.sourceProvider)) return "unknown";
      if (coordStatus === "invalid") return "invalid";
      if (CONTRACT_REVIEW_STATUSES.has(coordStatus)) return "review";
      if (coordinateDecimals(lat) < 4 || coordinateDecimals(lon) < 4) return "review";
      if (CONTRACT_VERIFIED_STATUSES.has(coordStatus) && hasCompleteCoordinateContract(place)) return "verified";
      return "review";
    }
    function lighten(hex, amount = 0.25) {
      let c = String(hex || "#000000").trim();
      if (c.startsWith("#")) c = c.slice(1);
      if (c.length === 3) c = c.split("").map((ch) => ch + ch).join("");
      if (c.length !== 6) c = "000000";
      const n = parseInt(c, 16);
      if (Number.isNaN(n)) return "rgb(255,255,255)";
      let r = n >> 16 & 255;
      let g = n >> 8 & 255;
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
        pitch: DEFAULT_MAP_PITCH,
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
        MAP.resize();
        applyStandardMapPalette();
        drawPlaceMarkers();
        moveMarkersOnTop();
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
    }
    function getSavedMapStyleMode() {
      try {
        const raw = localStorage.getItem(STYLE_STORAGE_KEY);
        if (raw === STYLE_MODE_STANDARD || raw === STYLE_MODE_SATELLITE) return raw;
      } catch {
      }
      return STYLE_MODE_STANDARD;
    }
    function saveMapStyleMode(mode) {
      try {
        localStorage.setItem(STYLE_STORAGE_KEY, mode);
      } catch {
      }
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
        applyStandardMapPalette();
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
        const message = (error == null ? void 0 : error.message) || "unknown error";
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
        applyStandardMapPalette();
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
        var _a, _b, _c, _d;
        const btn = (_b = (_a = ev.target) == null ? void 0 : _a.closest) == null ? void 0 : _b.call(_a, ".hg-map-style-btn");
        if (!btn) return;
        (_c = ev.preventDefault) == null ? void 0 : _c.call(ev);
        (_d = ev.stopPropagation) == null ? void 0 : _d.call(ev);
        applyMapStyle(btn.dataset.mode);
      };
      wrap.addEventListener("click", onStyleTogglePress);
      wrap.querySelectorAll(".hg-map-style-btn").forEach((btn) => {
        btn.addEventListener("touchend", onStyleTogglePress, { passive: false });
      });
      controls.insertBefore(wrap, controls.firstChild);
      renderMapStyleToggle();
      const mapEl = (
        /** @type {HTMLElement & { __hgResizeBound?: boolean }} */
        document.getElementById(containerId)
      );
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
    function setPaintPropertyIfSupported(layerId, property, value) {
      if (!MAP || !MAP.getLayer(layerId)) return;
      try {
        MAP.setPaintProperty(layerId, property, value);
      } catch {
      }
    }
    function getStandardFillPaint(layerName) {
      if (/water|ocean|river|lake|canal|reservoir/.test(layerName)) {
        return { color: "#8fcbe6", opacity: 0.94 };
      }
      if (/park|grass|green|garden|pitch/.test(layerName)) {
        return { color: "#bde7ad", opacity: 0.72 };
      }
      if (/wood|forest|natural|landcover|cemetery/.test(layerName)) {
        return { color: "#a8d99b", opacity: 0.62 };
      }
      if (/landuse|farmland|meadow|scrub/.test(layerName)) {
        return { color: "#d6ead0", opacity: 0.52 };
      }
      if (/building/.test(layerName)) {
        return { color: "#e1d7c8", opacity: 0.48 };
      }
      if (/land|earth/.test(layerName)) {
        return { color: "#f3efe5", opacity: 1 };
      }
      return null;
    }
    function getStandardRoadLinePaint(layerName) {
      if (/rail/.test(layerName)) {
        return { color: "#b9b4aa", opacity: 0.52 };
      }
      const isRoad = /road|transportation|highway|street|motorway|trunk|primary|secondary|tertiary|minor|service|tunnel|bridge|path|pedestrian|foot/.test(layerName);
      if (!isRoad) return null;
      if (/casing|outline|shadow/.test(layerName)) {
        return { color: "#d2cbbd", opacity: 0.44 };
      }
      if (/motorway|trunk/.test(layerName)) {
        return { color: "#d8c7ab", opacity: 0.68 };
      }
      if (/primary|secondary/.test(layerName)) {
        return { color: "#ddd6c9", opacity: 0.62 };
      }
      if (/tertiary/.test(layerName)) {
        return { color: "#e3ded3", opacity: 0.54 };
      }
      if (/path|foot|pedestrian|service|minor/.test(layerName)) {
        return { color: "#ebe5d9", opacity: 0.4 };
      }
      return { color: "#e2dbcf", opacity: 0.48 };
    }
    function getStandardLabelPaint(layerName) {
      if (/road|transportation|highway|street/.test(layerName)) {
        return {
          color: "#776f64",
          haloColor: "rgba(250,247,239,0.88)",
          haloWidth: 0.9,
          haloBlur: 0.25,
          opacity: 0.68
        };
      }
      if (/water|marine/.test(layerName)) {
        return {
          color: "#2d7598",
          haloColor: "rgba(235,247,251,0.86)",
          haloWidth: 1.05,
          haloBlur: 0.25,
          opacity: 0.86
        };
      }
      if (/poi|park/.test(layerName)) {
        return {
          color: "#4f7650",
          haloColor: "rgba(248,246,238,0.88)",
          haloWidth: 1.05,
          haloBlur: 0.25,
          opacity: 0.78
        };
      }
      if (/place|settlement|city|town|village/.test(layerName)) {
        return {
          color: "#3f4b55",
          haloColor: "rgba(250,247,239,0.92)",
          haloWidth: 1.2,
          haloBlur: 0.22,
          opacity: 0.9
        };
      }
      return {
        color: "#5a625f",
        haloColor: "rgba(250,247,239,0.88)",
        haloWidth: 1,
        haloBlur: 0.24,
        opacity: 0.76
      };
    }
    function tuneStandardBaseMapStyle() {
      var _a;
      if (!MAP || mapStyleMode !== STYLE_MODE_STANDARD || !MAP.getStyle) return;
      const style = MAP.getStyle();
      const layers = Array.isArray(style == null ? void 0 : style.layers) ? style.layers : [];
      for (const layer of layers) {
        const id = layer == null ? void 0 : layer.id;
        if (!id || id.startsWith("hg-")) continue;
        const sourceLayer = String(layer["source-layer"] || "").toLowerCase();
        const layerName = `${id} ${sourceLayer}`.toLowerCase();
        const layerType = layer.type;
        if (layerType === "background") {
          setPaintPropertyIfSupported(id, "background-color", "#f3efe5");
          continue;
        }
        if (layerType === "fill") {
          const fillPaint = getStandardFillPaint(layerName);
          if (fillPaint) {
            setPaintPropertyIfSupported(id, "fill-color", fillPaint.color);
            setPaintPropertyIfSupported(id, "fill-opacity", fillPaint.opacity);
          }
          continue;
        }
        if (layerType === "line") {
          const roadPaint = getStandardRoadLinePaint(layerName);
          if (roadPaint) {
            setPaintPropertyIfSupported(id, "line-color", roadPaint.color);
            setPaintPropertyIfSupported(id, "line-opacity", roadPaint.opacity);
            continue;
          }
          if (/water|river|stream/.test(layerName)) {
            setPaintPropertyIfSupported(id, "line-color", "#6bb7d9");
            setPaintPropertyIfSupported(id, "line-opacity", 0.72);
          }
          continue;
        }
        if (layerType === "symbol" && ((_a = layer.layout) == null ? void 0 : _a["text-field"])) {
          const labelPaint = getStandardLabelPaint(layerName);
          setPaintPropertyIfSupported(id, "text-color", labelPaint.color);
          setPaintPropertyIfSupported(id, "text-halo-color", labelPaint.haloColor);
          setPaintPropertyIfSupported(id, "text-halo-width", labelPaint.haloWidth);
          setPaintPropertyIfSupported(id, "text-halo-blur", labelPaint.haloBlur);
          setPaintPropertyIfSupported(id, "text-opacity", labelPaint.opacity);
        }
      }
    }
    function applyStandardMapPalette() {
      if (!MAP || mapStyleMode !== STYLE_MODE_STANDARD) return;
      if (typeof MAP.isStyleLoaded === "function" && !MAP.isStyleLoaded()) {
        runWhenStyleReady(applyStandardMapPalette);
        return;
      }
      tuneStandardBaseMapStyle();
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
        userMarker = new maplibregl.Marker({ element: dot, anchor: "center" }).setLngLat(ll).addTo(MAP);
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
      [L_LAB, L_HIT, L_DOTS, L_GLOW].forEach((id) => {
        if (MAP.getLayer(id)) MAP.removeLayer(id);
      });
      if (MAP.getSource(SRC)) MAP.removeSource(SRC);
    }
    function isStandardMapStyle() {
      return mapStyleMode === STYLE_MODE_STANDARD;
    }
    function getPlaceMarkerBorder(categoryId, fallbackColor) {
      const secondaryColorFn = window.catSecondaryColor;
      if (typeof secondaryColorFn === "function") {
        const secondaryColor = String(secondaryColorFn(categoryId) || "").trim();
        if (secondaryColor) return secondaryColor;
      }
      return fallbackColor || "#6c757d";
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
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 12, 7, 14, 9, 16, 13, 18, 18],
        "circle-color": ["get", "fill"],
        "circle-opacity": [
          "case",
          ["in", ["get", "coordinateTrust"], ["literal", ["review", "unknown"]]],
          0.12,
          0.24
        ],
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
            "interpolate",
            ["linear"],
            ["zoom"],
            PLACE_LABEL_MIN_ZOOM,
            0,
            PLACE_LABEL_MIN_ZOOM + 1.2,
            0.55,
            PLACE_LABEL_MIN_ZOOM + 2,
            1
          ]
        };
      }
      return {
        "text-color": "rgba(50,61,67,0.96)",
        "text-halo-color": "rgba(255,252,244,0.96)",
        "text-halo-width": 1.7,
        "text-halo-blur": 0.22,
        "text-opacity": [
          "interpolate",
          ["linear"],
          ["zoom"],
          PLACE_LABEL_MIN_ZOOM - 0.2,
          0,
          PLACE_LABEL_MIN_ZOOM + 0.8,
          0.74,
          PLACE_LABEL_MIN_ZOOM + 1.6,
          1
        ]
      };
    }
    function drawPlaceMarkers() {
      var _a;
      if (!MAP) return;
      if (!Array.isArray(PLACES) || PLACES.length === 0) return;
      if (typeof MAP.isStyleLoaded === "function" && !MAP.isStyleLoaded()) {
        runWhenStyleReady(drawPlaceMarkers);
        return;
      }
      const places = typeof ((_a = window.HG_I18N) == null ? void 0 : _a.localizePlaces) === "function" ? window.HG_I18N.localizePlaces(PLACES) : PLACES;
      const features = [];
      for (const p of places) {
        const coordinateTrust = getCoordinateTrust(p);
        p.coordinateTrust = coordinateTrust;
        if (coordinateTrust === "invalid") {
          console.warn("[HGMap] Skipping invalid place coordinate", { id: p == null ? void 0 : p.id, name: p == null ? void 0 : p.name });
          continue;
        }
        const lat = num(p == null ? void 0 : p.lat);
        const lon = num(p == null ? void 0 : p.lon);
        const isVisited = !!visited[p.id];
        const base = catColor(p.category);
        const fill = isVisited ? lighten(base, 0.25) : base;
        const border = getPlaceMarkerBorder(p.category, base);
        features.push({
          type: "Feature",
          properties: {
            id: p.id,
            name: p.name || "",
            visited: isVisited ? 1 : 0,
            coordinateTrust,
            coordinateTrustNote: coordinateTrust === "review" || coordinateTrust === "unknown" ? "Koordinat trenger kontroll" : "",
            fill,
            border
          },
          geometry: { type: "Point", coordinates: [lon, lat] }
        });
      }
      if (!features.length) return;
      const fc = { type: "FeatureCollection", features };
      applyStandardMapPalette();
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
            "interpolate",
            ["linear"],
            ["zoom"],
            10,
            ["+", 2.1, ["*", 0.4, ["get", "visited"]]],
            12,
            ["+", 2.8, ["*", 0.6, ["get", "visited"]]],
            14,
            ["+", 4.1, ["*", 0.8, ["get", "visited"]]],
            16,
            ["+", 6.1, ["*", 1, ["get", "visited"]]],
            18,
            ["+", 8.8, ["*", 1.3, ["get", "visited"]]]
          ],
          "circle-color": ["get", "fill"],
          "circle-stroke-color": ["get", "border"],
          "circle-stroke-width": getPlaceMarkerStrokeWidth(),
          "circle-opacity": [
            "case",
            ["in", ["get", "coordinateTrust"], ["literal", ["review", "unknown"]]],
            0.58,
            1
          ]
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
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 9, 12, 11, 14, 14, 16, 18, 18, 23],
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
      var _a, _b, _c, _d;
      if (!MAP || !originalEvent) return null;
      const canvas = (_a = MAP.getCanvas) == null ? void 0 : _a.call(MAP);
      const rect = (_b = canvas == null ? void 0 : canvas.getBoundingClientRect) == null ? void 0 : _b.call(canvas);
      if (!rect) return null;
      const touch = ((_c = originalEvent.changedTouches) == null ? void 0 : _c[0]) || ((_d = originalEvent.touches) == null ? void 0 : _d[0]) || null;
      const clientX = touch ? touch.clientX : originalEvent.clientX;
      const clientY = touch ? touch.clientY : originalEvent.clientY;
      if (!Number.isFinite(clientX) || !Number.isFinite(clientY)) return null;
      return { x: clientX - rect.left, y: clientY - rect.top };
    }
    function getPlaceFeatureFromEvent(e) {
      var _a, _b;
      if (!MAP || typeof MAP.queryRenderedFeatures !== "function") return null;
      const layers = PLACE_HIT_LAYERS.filter(hasLayer);
      if (!layers.length) return null;
      const eventFeatures = Array.isArray(e == null ? void 0 : e.features) ? e.features : [];
      for (const layerId of PLACE_HIT_PRIORITY) {
        const match = eventFeatures.find((feature) => {
          var _a2, _b2;
          return ((_a2 = feature == null ? void 0 : feature.layer) == null ? void 0 : _a2.id) === layerId && ((_b2 = feature == null ? void 0 : feature.properties) == null ? void 0 : _b2.id);
        });
        if (match) return match;
      }
      const point = (e == null ? void 0 : e.point) || getPointFromOriginalEvent(e == null ? void 0 : e.originalEvent);
      if (!point) return null;
      const originalEvent = e == null ? void 0 : e.originalEvent;
      const isTouch = !!(((_a = originalEvent == null ? void 0 : originalEvent.changedTouches) == null ? void 0 : _a.length) || ((_b = originalEvent == null ? void 0 : originalEvent.touches) == null ? void 0 : _b.length) || (originalEvent == null ? void 0 : originalEvent.pointerType) === "touch");
      const queryArea = isTouch ? [
        [point.x - PLACE_TAP_TOLERANCE_PX, point.y - PLACE_TAP_TOLERANCE_PX],
        [point.x + PLACE_TAP_TOLERANCE_PX, point.y + PLACE_TAP_TOLERANCE_PX]
      ] : point;
      const features = MAP.queryRenderedFeatures(queryArea, { layers });
      if (!Array.isArray(features) || !features.length) return null;
      for (const layerId of PLACE_HIT_PRIORITY) {
        const match = features.find((feature) => {
          var _a2, _b2;
          return ((_a2 = feature == null ? void 0 : feature.layer) == null ? void 0 : _a2.id) === layerId && ((_b2 = feature == null ? void 0 : feature.properties) == null ? void 0 : _b2.id);
        });
        if (match) return match;
      }
      return features.find((feature) => {
        var _a2;
        return (_a2 = feature == null ? void 0 : feature.properties) == null ? void 0 : _a2.id;
      }) || null;
    }
    function bindPlaceLayerHandlers() {
      var _a, _b, _c, _d;
      if (!MAP || !hasLayer(L_HIT)) return;
      if (MAP.__hgPlaceHandlers) {
        const prev = MAP.__hgPlaceHandlers;
        MAP.off("mouseenter", L_HIT, prev.setPointer);
        MAP.off("mouseleave", L_HIT, prev.clearPointer);
        MAP.off("click", prev.handlePlaceClick);
        MAP.off("touchend", prev.handlePlaceClick);
        MAP.off("dragstart", prev.markMapGesture);
        MAP.off("zoomstart", prev.markMapGesture);
        MAP.off("rotatestart", prev.markMapGesture);
        MAP.off("dragend", prev.finishMapGesture);
        MAP.off("zoomend", prev.finishMapGesture);
        MAP.off("rotateend", prev.finishMapGesture);
        (_a = prev.canvas) == null ? void 0 : _a.removeEventListener("pointerdown", prev.handlePointerDown);
        (_b = prev.canvas) == null ? void 0 : _b.removeEventListener("pointermove", prev.handlePointerMove);
        (_c = prev.canvas) == null ? void 0 : _c.removeEventListener("pointerup", prev.handlePointerUp);
        (_d = prev.canvas) == null ? void 0 : _d.removeEventListener("pointercancel", prev.handlePointerCancel);
      }
      const canvas = MAP.getCanvas();
      let pointerStart = null;
      let pointerMoved = false;
      let mapGestureActive = false;
      let suppressPlaceClickUntil = 0;
      let lastOpenedPlace = { id: null, at: 0 };
      const setPointer = () => {
        canvas.style.cursor = "pointer";
      };
      const clearPointer = () => {
        canvas.style.cursor = "";
      };
      const markMapGesture = () => {
        mapGestureActive = true;
        pointerMoved = true;
        suppressPlaceClickUntil = Date.now() + PLACE_GESTURE_COOLDOWN_MS;
      };
      const finishMapGesture = () => {
        mapGestureActive = false;
        suppressPlaceClickUntil = Date.now() + PLACE_GESTURE_COOLDOWN_MS;
      };
      const handlePointerDown = (event) => {
        pointerStart = { x: event.clientX, y: event.clientY };
        pointerMoved = false;
      };
      const handlePointerMove = (event) => {
        if (!pointerStart || pointerMoved) return;
        const dx = event.clientX - pointerStart.x;
        const dy = event.clientY - pointerStart.y;
        if (Math.hypot(dx, dy) > PLACE_POINTER_MOVE_TOLERANCE_PX) {
          pointerMoved = true;
          suppressPlaceClickUntil = Date.now() + PLACE_GESTURE_COOLDOWN_MS;
        }
      };
      const handlePointerUp = () => {
        if (pointerMoved) suppressPlaceClickUntil = Date.now() + PLACE_GESTURE_COOLDOWN_MS;
        pointerStart = null;
      };
      const handlePointerCancel = () => {
        pointerStart = null;
        pointerMoved = true;
        suppressPlaceClickUntil = Date.now() + PLACE_GESTURE_COOLDOWN_MS;
      };
      const handlePlaceClick = (e) => {
        var _a2, _b2, _c2, _d2, _e, _f;
        const now = Date.now();
        if (mapGestureActive || pointerMoved || now < suppressPlaceClickUntil) return;
        const feature = getPlaceFeatureFromEvent(e);
        const id = (_a2 = feature == null ? void 0 : feature.properties) == null ? void 0 : _a2.id;
        if (!id) return;
        if (lastOpenedPlace.id === id && now - lastOpenedPlace.at < PLACE_GESTURE_COOLDOWN_MS) return;
        lastOpenedPlace = { id, at: now };
        (_b2 = e == null ? void 0 : e.preventDefault) == null ? void 0 : _b2.call(e);
        (_d2 = (_c2 = e == null ? void 0 : e.originalEvent) == null ? void 0 : _c2.preventDefault) == null ? void 0 : _d2.call(_c2);
        (_f = (_e = e == null ? void 0 : e.originalEvent) == null ? void 0 : _e.stopPropagation) == null ? void 0 : _f.call(_e);
        onPlaceClick(id);
      };
      MAP.__hgPlaceHandlers = {
        canvas,
        setPointer,
        clearPointer,
        markMapGesture,
        finishMapGesture,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        handlePointerCancel,
        handlePlaceClick
      };
      canvas.addEventListener("pointerdown", handlePointerDown, { passive: true });
      canvas.addEventListener("pointermove", handlePointerMove, { passive: true });
      canvas.addEventListener("pointerup", handlePointerUp, { passive: true });
      canvas.addEventListener("pointercancel", handlePointerCancel, { passive: true });
      MAP.on("mouseenter", L_HIT, setPointer);
      MAP.on("mouseleave", L_HIT, clearPointer);
      MAP.on("dragstart", markMapGesture);
      MAP.on("zoomstart", markMapGesture);
      MAP.on("rotatestart", markMapGesture);
      MAP.on("dragend", finishMapGesture);
      MAP.on("zoomend", finishMapGesture);
      MAP.on("rotateend", finishMapGesture);
      MAP.on("click", handlePlaceClick);
      MAP.on("touchend", handlePlaceClick);
    }
    function moveMarkersOnTop() {
      if (!MAP) return;
      [L_GLOW, L_DOTS, L_LAB, L_HIT].forEach((id) => {
        if (MAP.getLayer(id)) MAP.moveLayer(id);
      });
    }
    function maybeDrawMarkers() {
      drawPlaceMarkers();
    }
    function refreshMarkers() {
      drawPlaceMarkers();
    }
    window.HGCoordinateTrust = { getCoordinateTrust };
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
      getCoordinateTrust,
      maybeDrawMarkers,
      refreshMarkers
    };
  })();
})();
