// js/map.js — History GO — MARKERS STABLE (v2)
// MapLibre + places markers + labels + robust touch/click hit-testing.
(function () {
  "use strict";

  let MAP = null;
  let mapReady = false;
  let styleReady = false;
  let mapStyleMode = "standard";
  let pendingStyleMode = null;
  let queuedStyleMode = null;
  let isApplyingStyle = false;

  let START = { lat: 59.9139, lon: 10.7522, zoom: 13 };

  let PLACES = [];
  let visited = {};
  let catColor = (/** @type {any} */ _cat) => "#ffffff";
  let onPlaceClick = (/** @type {any} */ _id) => {};

  let userMarker = null;
  const placeAreaMarkers = new Map();
  let placeAreaMarkerZoomBound = false;
  // Touchscreen phones and iPads can render area squares while dropping
  // WebGL detail circles. Use one native detail-dot renderer on those devices.
  const placeDetailMarkers = new Map();
  let placeDetailMarkerEventsBound = false;
  let lastPlaceMarkerFeatures = [];
  const MAX_TOUCH_DETAIL_MARKERS = 240;
  const placeBadgeImages = new Map();
  let placeBadgeLoadStarted = false;
  // Badge-mode experiment; original dots and squares remain available.
  let markerMode = "badges";
  const MARKER_MODE_STORAGE_KEY = "hg_map_marker_mode";
  const STYLE_STORAGE_KEY = "hg_map_style_mode";
  const STYLE_MODE_STANDARD = "standard";
  const STYLE_MODE_SATELLITE = "satellite";
  const DEFAULT_MAP_PITCH = 35;
  const STYLE_URL_STANDARD = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

  const SRC = "hg-places";
  const L_GLOW = "hg-places-glow";
  const L_HIT  = "hg-places-hit";
  const L_DOTS = "hg-places-dots";
  const L_LAB  = "hg-places-label";
  const L_AREA_GLOW = "hg-place-areas-glow";
  const L_AREA_HIT = "hg-place-areas-hit";
  const L_AREA_DOTS = "hg-place-areas-dots";
  const L_AREA_LAB = "hg-place-areas-label";
  const PLACE_AREA_MARKER_CLASS = "hg-place-area-marker";
  const PLACE_AREA_LABEL_MIN_ZOOM = 15.0;
  const PLACE_DETAIL_MIN_ZOOM = 9.8;
  const PLACE_DETAIL_HIT_MIN_ZOOM = 9.8;
  const PLACE_DETAIL_LABEL_MIN_ZOOM = 15.0;
  const PLACE_DETAIL_BADGE_MIN_ZOOM = 15.8;
  const PLACE_DETAIL_FULL_ZOOM = 12.7;
  const PLACE_SCOPE_AREA = "area";
  const PLACE_MAP_LOD_OVERVIEW = "overview";
  const PLACE_MAP_LOD_AREA = "area";
  const PLACE_MAP_LOD_DETAIL = "detail";
  const PLACE_AREA_LOD_FILTER: any = ["in", ["get", "mapLod"], ["literal", [PLACE_MAP_LOD_OVERVIEW, PLACE_MAP_LOD_AREA]]];
  const PLACE_DETAIL_LOD_FILTER: any = ["==", ["get", "mapLod"], PLACE_MAP_LOD_DETAIL];
  const PLACE_HIT_LAYERS = [L_AREA_HIT, L_HIT, L_AREA_DOTS, L_DOTS, L_AREA_LAB, L_LAB, L_AREA_GLOW, L_GLOW];
  const PLACE_HIT_PRIORITY = [L_AREA_HIT, L_HIT, L_AREA_DOTS, L_DOTS, L_AREA_LAB, L_LAB, L_AREA_GLOW, L_GLOW];
  // MapLibre can retain the GeoJSON source while removing individual style layers.
  // A source alone is not proof that the user can see or tap the place dots.
  const REQUIRED_PLACE_LAYERS = [L_GLOW, L_DOTS, L_LAB, L_AREA_LAB, L_HIT, L_AREA_HIT];
  const PLACE_TAP_TOLERANCE_PX = 12;
  const PLACE_POINTER_MOVE_TOLERANCE_PX = 7;
  const PLACE_GESTURE_COOLDOWN_MS = 180;

  function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }


  // Coordinate Source Contract v1 display mirror: browser logic intentionally
  // mirrors tools/coordinate-source-contract.mts without importing the Node tool module.
  const CONTRACT_VERIFIED_STATUSES = new Set(["verified", "verified_geometry", "verified_historical_source"]);
  const CONTRACT_REVIEW_STATUSES = new Set(["needs_manual_visual_qa", "needs_source", "legacy_unverified", "historical_approximation"]);
  const CONTRACT_LINEAR_TYPES = new Set(["street", "linear_area", "route", "quay", "park", "natural_area"]);
  const CONTRACT_COORD_ROLES = new Set(["display_marker", "unlock_point", "label_anchor", "entrance", "building_center", "site_center", "line_anchor", "area_anchor", "historical_anchor"]);
  const CONTRACT_ACCURACY = new Set(["rooftop", "entrance", "building", "parcel", "interpolated", "geometric_center", "approximate", "historical_approximation", "semantic_anchor", "unknown"]);

  function hasCoordinateText(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function hasStructuredCoordinateAddress(address) {
    return !!address && typeof address === "object" && ["street", "number", "postcode", "city", "country"].some((field) => hasCoordinateText(address[field]));
  }

  function hasCoordinateSourceIdentity(place) {
    return hasCoordinateText(place?.sourceObjectId) || hasStructuredCoordinateAddress(place?.address);
  }

  function coordinateDecimals(value) {
    const raw = String(value);
    if (/e-/i.test(raw)) return Number(raw.split(/e-/i)[1]) || 0;
    return raw.split(".")[1]?.length || 0;
  }

  function hasCoordinateGeometryOrAnchor(place) {
    return !!place?.geometry || (Array.isArray(place?.anchors) && place.anchors.length > 0) || place?.coordRole === "line_anchor" || place?.coordRole === "area_anchor";
  }

  function hasCompleteCoordinateContract(place) {
    const locatorType = String(place?.locatorType || "").trim();
    const sourceProvider = String(place?.sourceProvider || "").trim();
    const geocodeAccuracy = String(place?.geocodeAccuracy || "").trim();
    const coordRole = String(place?.coordRole || "").trim();
    if (!locatorType || !sourceProvider || sourceProvider === "legacy_unknown") return false;
    if (!hasCoordinateSourceIdentity(place)) return false;
    if (!CONTRACT_ACCURACY.has(geocodeAccuracy) || geocodeAccuracy === "approximate" || geocodeAccuracy === "unknown") return false;
    if (!CONTRACT_COORD_ROLES.has(coordRole)) return false;
    if (!hasCoordinateText(place?.coordType) || !hasCoordinateText(place?.coordNote)) return false;
    if (String(place?.coordSource || "").trim() === "manual_map_check" && !hasCoordinateSourceIdentity(place)) return false;
    if (geocodeAccuracy === "interpolated" && coordRole === "unlock_point") return false;
    if (CONTRACT_LINEAR_TYPES.has(locatorType) && !hasCoordinateGeometryOrAnchor(place)) return false;
    if (["historic_site", "archaeological_site"].includes(locatorType) && !["historical_map", "manual_research"].includes(sourceProvider)) return false;
    return true;
  }

  function getCoordinateTrust(place) {
    const lat = num(place?.lat);
    const lon = num(place?.lon);
    const r = num(place?.r);
    if (lat == null || lon == null || r == null || lat < -90 || lat > 90 || lon < -180 || lon > 180 || r <= 0) return "invalid";

    const coordStatus = String(place?.coordStatus || "").trim();
    if (!coordStatus || !hasCoordinateText(place?.locatorType) || !hasCoordinateText(place?.sourceProvider)) return "unknown";
    if (coordStatus === "invalid") return "invalid";
    if (CONTRACT_REVIEW_STATUSES.has(coordStatus)) return "review";
    if (coordinateDecimals(lat) < 4 || coordinateDecimals(lon) < 4) return "review";
    if (CONTRACT_VERIFIED_STATUSES.has(coordStatus) && hasCompleteCoordinateContract(place)) return "verified";
    return "review";
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
    markerMode = getSavedMarkerMode();
    const initialStyleUrl = getStyleUrlForMode(mapStyleMode);
    if (!initialStyleUrl) {
      console.warn("[HGMap] Naturtro kart krever window.HG_MAPTILER_KEY. Beholder standardkart.");
      mapStyleMode = STYLE_MODE_STANDARD;
      saveMapStyleMode(mapStyleMode);
    }

    try {
      MAP = new maplibregl.Map({
        container: containerId,
        style: getStyleUrlForMode(mapStyleMode),
        center: [START.lon, START.lat],
        zoom: START.zoom,
        pitch: DEFAULT_MAP_PITCH,
        bearing: 0,
        antialias: true
      });
    } catch (error) {
      MAP = null;
      mapReady = false;
      styleReady = false;
      el.dataset.mapUnavailable = "1";
      el.setAttribute("aria-label", "Kart utilgjengelig – innhold kan fortsatt brukes");
      console.warn("[HGMap] WebGL-kart utilgjengelig; fortsetter uten kart.", error);
      return null;
    }

    // Mobile already has touch/pinch gestures and the compact History GO dock.
    // Do not stack MapLibre's white +/- zoom toolbar on top of these controls.
    if (!useNativeTouchDetailMarkers()) {
      MAP.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "bottom-right"
      );
    }

    // Rebuilding the base style removes custom GeoJSON layers. Restore place
    // dots whenever the new style loads, not only after a later "idle" event.
    MAP.on("style.load", restorePlaceLayersAfterStyleLoad);
    // Remote "Detaljert" style/network errors must not strand users on an
    // empty map. Keep the reliable default cartography available.
    MAP.on("error", (event) => {
      if (!isApplyingStyle || pendingStyleMode !== STYLE_MODE_SATELLITE) return;
      console.warn("[HGMap] Detaljert kartstil kunne ikke lastes; går tilbake til Kart.", event?.error);
      queuedStyleMode = null;
      pendingStyleMode = STYLE_MODE_STANDARD;
      try {
        MAP.setStyle(STYLE_URL_STANDARD);
      } catch (error) {
        isApplyingStyle = false;
        pendingStyleMode = null;
        console.warn("[HGMap] Kunne ikke gjenopprette standardkart", error);
      }
    });
    MAP.on("idle", () => {
      if (isApplyingStyle) restorePlaceLayersAfterStyleLoad();
      else ensureMarkers();
    });

    MAP.on("load", () => {
      styleReady = true;
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
    if (!MAP) return;
    MAP.resize?.();
    // Map bounds can be stale while the app header, PlaceCard and map mode
    // change visibility. Resync DOM dots after the real viewport is measured.
    if (lastPlaceMarkerFeatures.length) {
      syncPlaceAreaDomMarkers(lastPlaceMarkerFeatures);
      syncPlaceDetailDomMarkers(lastPlaceMarkerFeatures);
    }
  }

  function getMap() {
    return MAP;
  }

  function setPlaces(arr) {
    PLACES = Array.isArray(arr) ? arr : [];
    if (MAP) drawPlaceMarkers();
  }

  function setVisited(obj) {
    visited = obj || {};
    if (MAP) drawPlaceMarkers();
  }

  function setCatColor(fn) {
    if (typeof fn === "function") catColor = fn;
    if (MAP) drawPlaceMarkers();
  }

  function setOnPlaceClick(fn) {
    if (typeof fn === "function") onPlaceClick = fn;
  }

  function setDataReady(_) {
    // Beholdt for kompatibilitet.
  }

  function getSavedMapStyleMode() {
    // Always boot into the reliable default basemap. A persisted remote
    // "Detaljert" style could fail during startup and leave all markers
    // invisible until the user manually toggled styles.
    try {
      if (localStorage.getItem(STYLE_STORAGE_KEY) !== STYLE_MODE_STANDARD) {
        localStorage.setItem(STYLE_STORAGE_KEY, STYLE_MODE_STANDARD);
      }
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

  // MapLibre's isStyleLoaded() can remain false while map tiles, glyphs or
  // sprites are loading AFTER "style.load" has already fired. Listening once
  // for a second "style.load" then deadlocks until Kart/Detaljert switches
  // styles. Track the actual style.load event independently of tile loading.
  // Marker layers only need the parsed style, not a fully idle map.

  function restorePlaceLayersAfterStyleLoad() {
    if (!MAP) return;
    styleReady = true;

    // Resolve the requested style before painting its marker colors.
    if (pendingStyleMode) {
      mapStyleMode = pendingStyleMode;
      pendingStyleMode = null;
      isApplyingStyle = false;
      saveMapStyleMode(mapStyleMode);
    }

    mapReady = true;
    applyStandardMapPalette();
    drawPlaceMarkers();
    moveMarkersOnTop();
    MAP.resize();
    renderMapStyleToggle();

    // Honor the latest mobile press even if it happened during a style load.
    const queued = queuedStyleMode;
    queuedStyleMode = null;
    if (queued && queued !== mapStyleMode) applyMapStyle(queued);
  }

  function applyMapStyle(nextMode) {
    if (!MAP || typeof MAP.setStyle !== "function") return;

    const desired = nextMode === STYLE_MODE_SATELLITE ? STYLE_MODE_SATELLITE : STYLE_MODE_STANDARD;
    if (isApplyingStyle) {
      queuedStyleMode = desired;
      return;
    }
    if (desired === mapStyleMode) {
      ensureMarkers();
      renderMapStyleToggle();
      return;
    }

    const styleUrl = getStyleUrlForMode(desired);
    if (!styleUrl) {
      console.warn("[HGMap] Detaljert kart er ikke konfigurert; behold kartvisning.");
      renderMapStyleToggle();
      return;
    }

    isApplyingStyle = true;
    styleReady = false;
    pendingStyleMode = desired;
    try {
      MAP.setStyle(styleUrl);
      // style.load (with idle as fallback) owns the marker restoration.
    } catch (error) {
      console.warn("[HGMap] Kartstil kunne ikke lastes", error);
      isApplyingStyle = false;
      pendingStyleMode = null;
      queuedStyleMode = null;
      styleReady = Boolean(MAP.getStyle?.());
      renderMapStyleToggle();
      ensureMarkers();
    }
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

    // Mobile browsers already synthesize click from a tap. Binding touchend
    // as well caused two style actions for one physical press.
    wrap.addEventListener("click", onStyleTogglePress);

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
      return { color: "#ebe5d9", opacity: 0.40 };
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
        opacity: 0.90
      };
    }

    return {
      color: "#5a625f",
      haloColor: "rgba(250,247,239,0.88)",
      haloWidth: 1.0,
      haloBlur: 0.24,
      opacity: 0.76
    };
  }

  function tuneStandardBaseMapStyle() {
    if (!MAP || mapStyleMode !== STYLE_MODE_STANDARD || !MAP.getStyle) return;
    const style = MAP.getStyle();
    const layers = Array.isArray(style?.layers) ? style.layers : [];

    for (const layer of layers) {
      const id = layer?.id;
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

      if (layerType === "symbol" && layer.layout?.["text-field"]) {
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
    if (!styleReady) return;

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
    [L_AREA_LAB, L_LAB, L_AREA_HIT, L_HIT, L_AREA_DOTS, L_DOTS, L_AREA_GLOW, L_GLOW].forEach(id => {
      if (MAP.getLayer(id)) MAP.removeLayer(id);
    });
    if (MAP.getSource(SRC)) MAP.removeSource(SRC);
  }

  function isStandardMapStyle() {
    return mapStyleMode === STYLE_MODE_STANDARD;
  }

  function getPlaceMarkerBorder(categoryId, fallbackColor) {
    const secondaryColorFn = (window as any).catSecondaryColor;
    if (typeof secondaryColorFn === "function") {
      const secondaryColor = String(secondaryColorFn(categoryId) || "").trim();
      if (secondaryColor) return secondaryColor;
    }
    return fallbackColor || "#6c757d";
  }

  function getPlaceMarkerStrokeWidth(isArea = false) {
    // Preserve the established area-marker border, but keep detail markers
    // visually subordinate to their labels and to the overview layer.
    if (isArea) return isStandardMapStyle() ? 2.4 : 1.8;
    return isStandardMapStyle() ? 1.45 : 1.15;
  }

  function getPlaceDetailVisibility() {
    return [
      "interpolate", ["linear"], ["zoom"],
      PLACE_DETAIL_MIN_ZOOM, 0.0,
      PLACE_DETAIL_FULL_ZOOM, 1.0
    ];
  }

  function interpolatePlaceAreaMarkerSide(zoom, isVisited) {
    const stops = [[7, 7.0], [9.5, 8.0], [12, 9.5], [16, 11.0], [18, 12.5]];
    const bonus = isVisited ? Math.max(0.2, Math.min(0.5, 0.2 + (zoom - 7) * (0.3 / 11))) : 0;
    if (zoom <= stops[0][0]) return stops[0][1] + bonus;
    for (let index = 1; index < stops.length; index += 1) {
      const [rightZoom, rightSide] = stops[index];
      const [leftZoom, leftSide] = stops[index - 1];
      if (zoom <= rightZoom) {
        const progress = (zoom - leftZoom) / (rightZoom - leftZoom);
        return leftSide + (rightSide - leftSide) * progress + bonus;
      }
    }
    return stops[stops.length - 1][1] + bonus;
  }

  function updatePlaceAreaDomMarkerSizes() {
    if (!MAP) return;
    const zoom = Number(MAP.getZoom?.() || 10);
    for (const entry of placeAreaMarkers.values()) {
      const showBadge = isBadgeMarkerMode() && !!entry.badgeImage?.complete && entry.badgeImage.naturalWidth > 0;
      entry.element.classList?.toggle?.("has-category-badge", showBadge);
      const side = showBadge ? mapBadgeDiameter(zoom) : interpolatePlaceAreaMarkerSide(zoom, entry.visited);
      entry.element.style.width = `${side.toFixed(2)}px`;
      entry.element.style.height = `${side.toFixed(2)}px`;
      entry.element.style.borderWidth = showBadge ? `${Math.max(0.5, Math.min(2, side * 0.12)).toFixed(2)}px` : "2px";
    }
  }

  function syncPlaceAreaDomMarkers(features) {
    if (!MAP || typeof maplibregl?.Marker !== "function") return;
    const activeIds = new Set();

    for (const feature of features) {
      if (![PLACE_MAP_LOD_OVERVIEW, PLACE_MAP_LOD_AREA].includes(feature?.properties?.mapLod)) continue;
      const id = String(feature.properties.id || "").trim();
      if (!id) continue;
      activeIds.add(id);

      let entry = placeAreaMarkers.get(id);
      if (!entry) {
        const element = document.createElement("div");
        element.className = PLACE_AREA_MARKER_CLASS;
        element.dataset.placeId = id;
        element.setAttribute("aria-hidden", "true");
        element.style.boxSizing = "border-box";
        element.style.borderStyle = "solid";
        element.style.borderWidth = "2px";
        element.style.borderRadius = "0";
        element.style.pointerEvents = "none";
        element.style.zIndex = "12";
        const marker = new maplibregl.Marker({ element, anchor: "center" })
          .setLngLat(feature.geometry.coordinates)
          .addTo(MAP);
        entry = { marker, element, visited: false, badgeImage: null, badgeSrc: "" };
        placeAreaMarkers.set(id, entry);
      } else {
        // Restore native area markers if another map lifecycle step detached them.
        if (entry.element.isConnected === false) entry.marker.addTo(MAP);
        entry.marker.setLngLat(feature.geometry.coordinates);
      }

      entry.visited = feature.properties.visited === 1;
      entry.element.style.backgroundColor = feature.properties.fill;
      const markerBorder = String(feature.properties.border || "").trim();
      const markerFill = String(feature.properties.fill || "").trim();
      entry.element.style.borderColor = !markerBorder || markerBorder.toLowerCase() === markerFill.toLowerCase()
        ? "#17212a" : markerBorder;
      entry.element.style.opacity = ["review", "unknown"].includes(feature.properties.coordinateTrust) ? "0.9" : "1";
      entry.element.style.boxShadow = "0 0 0 1px rgba(0,0,0,.42), 0 1px 4px rgba(0,0,0,.3)";
      const badgeSrc = isBadgeMarkerMode() ? (placeBadgeImages.get(badgeCategoryId(feature.properties.category)) || "") : "";
      if (badgeSrc !== entry.badgeSrc) {
        entry.badgeImage?.remove();
        entry.badgeSrc = badgeSrc;
        entry.badgeImage = null;
        if (badgeSrc) {
          const image = document.createElement("img");
          image.className = "hg-place-area-badge";
          image.alt = "";
          image.draggable = false;
          image.addEventListener("load", updatePlaceAreaDomMarkerSizes);
          image.addEventListener("error", updatePlaceAreaDomMarkerSizes);
          entry.element.appendChild(image);
          entry.badgeImage = image;
          image.src = badgeSrc;
        }
      }
    }

    for (const [id, entry] of placeAreaMarkers) {
      if (activeIds.has(id)) continue;
      entry.marker.remove();
      placeAreaMarkers.delete(id);
    }

    if (!placeAreaMarkerZoomBound) {
      MAP.on("zoom", updatePlaceAreaDomMarkerSizes);
      placeAreaMarkerZoomBound = true;
    }
    updatePlaceAreaDomMarkerSizes();
  }

  function getSavedMarkerMode() {
    try { return window.localStorage.getItem(MARKER_MODE_STORAGE_KEY) === "dots" ? "dots" : "badges"; }
    catch { return "badges"; }
  }

  function isBadgeMarkerMode() { return markerMode === "badges"; }

  function setMarkerMode(nextMode) {
    markerMode = nextMode === "dots" ? "dots" : "badges";
    try { window.localStorage.setItem(MARKER_MODE_STORAGE_KEY, markerMode); } catch {}
    if (MAP) drawPlaceMarkers();
    return markerMode;
  }

  function mapBadgeDiameter(zoom) {
    return Math.max(2.5, Math.min(80, 3.5 * Math.pow(1.202, zoom - 5)));
  }

  function badgeCategoryId(value) {
    return String((window as any).catIdFromDisplay?.(value) || value || "").trim().toLowerCase();
  }

  function ensurePlaceBadgeImages() {
    const setBadges = (badges) => {
      for (const badge of Array.isArray(badges) ? badges : []) {
        const id = badgeCategoryId(badge?.id);
        const image = String(badge?.image || "").trim();
        if (id && /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(image)) placeBadgeImages.set(id, image);
      }
      if (lastPlaceMarkerFeatures.length && MAP) drawPlaceMarkers();
    };
    const existing = (window as any).BADGES;
    if (Array.isArray(existing) && existing.length) {
      if (!placeBadgeImages.size) setBadges(existing);
      return;
    }
    if (placeBadgeLoadStarted) return;
    const loadBadges = (window as any).DataHub?.loadBadges;
    if (typeof loadBadges !== "function") return;
    placeBadgeLoadStarted = true;
    Promise.resolve(loadBadges()).then(setBadges).catch(error => {
      console.warn("[HGMap] Badge images unavailable; keeping place dots", error);
    });
  }

  function useNativeTouchDetailMarkers() {
    // iPad (including desktop-mode Safari and large landscape models) must
    // use the same reliable native dots as phones, not fragile WebGL circles.
    const width = Number(window.innerWidth || 0);
    if (Number(window.navigator?.maxTouchPoints || 0) >= 1) return true;
    if (typeof window.matchMedia === "function") {
      return window.matchMedia("(max-width: 1199px), (pointer: coarse)").matches;
    }
    return width > 0 && width <= 1199;
  }

  function nativeDetailDotDiameter(zoom) {
    // Pixel diameter, interpolated continuously instead of stepwise size
    // jumps. Zooming OUT visibly reduces the dots on both phone and iPad.
    return Math.max(3.5, Math.min(8.5, 3.5 + (zoom - PLACE_DETAIL_MIN_ZOOM) * 0.78));
  }

  function nativeDetailBadgeDiameter(zoom) {
    if (isBadgeMarkerMode()) return mapBadgeDiameter(zoom);
    return Math.max(18, Math.min(42, 18 + (zoom - PLACE_DETAIL_BADGE_MIN_ZOOM) * 8));
  }

  function updateNativeDetailLabelVisibility() {
    if (!MAP || !placeDetailMarkers.size) return;
    const zoom = Number(MAP.getZoom?.() ?? START.zoom ?? 13);
    const labelsAllowed = zoom >= PLACE_DETAIL_LABEL_MIN_ZOOM;
    const maxLabels = zoom < 16 ? 48 : 90;
    const occupied = [];
    let shown = 0;
    const canvas = MAP.getCanvas?.();
    // Zero-sized startup maps must not suppress every label.
    const hasViewport = Number(canvas?.clientWidth || 0) > 100 &&
      Number(canvas?.clientHeight || 0) > 100;

    for (const entry of placeDetailMarkers.values()) {
      const label = entry.label;
      if (!label) continue;
      label.style.display = "none";
      if (!useNativeTouchDetailMarkers() || !labelsAllowed || !entry.name || shown >= maxLabels) continue;

      if (hasViewport && typeof MAP.project === "function") {
        let point;
        try { point = MAP.project([entry.lon, entry.lat]); } catch { point = null; }
        if (point && Number.isFinite(point.x) && Number.isFinite(point.y)) {
          const width = Math.min(146, Math.max(34, entry.name.length * 6.3));
          const left = point.x - width / 2;
          const markerSize = entry.hasCategoryBadge ? nativeDetailBadgeDiameter(zoom) : nativeDetailDotDiameter(zoom);
          const top = point.y + markerSize / 2 + 3;
          const rect = { left, right: left + width, top, bottom: top + 16 };
          if (occupied.some(other =>
            rect.left < other.right + 6 && rect.right > other.left - 6 &&
            rect.top < other.bottom + 3 && rect.bottom > other.top - 3)) continue;
          occupied.push(rect);
        }
      }
      label.style.display = "block";
      shown++;
    }
  }

  function updateNativeDetailDotSizes() {
    if (!MAP || !placeDetailMarkers.size) return;
    const zoom = Number(MAP.getZoom?.() ?? START.zoom ?? 13);
    const diameter = nativeDetailDotDiameter(zoom);
    const width = Math.max(0.9, Math.min(1.4, diameter * 0.2));
    for (const entry of placeDetailMarkers.values()) {
      const showBadge = (isBadgeMarkerMode() || zoom >= PLACE_DETAIL_BADGE_MIN_ZOOM) &&
        entry.badgeImage?.complete && entry.badgeImage.naturalWidth > 0;
      const size = showBadge ? nativeDetailBadgeDiameter(zoom) : diameter;
      entry.hasCategoryBadge = !!showBadge;
      entry.element.classList.toggle("has-category-badge", !!showBadge);
      entry.element.style.width = `${size.toFixed(2)}px`;
      entry.element.style.height = `${size.toFixed(2)}px`;
      entry.element.style.borderWidth = showBadge ? "0px" : `${width.toFixed(2)}px`;
    }
    updateNativeDetailLabelVisibility();
  }

  function syncPlaceDetailDomMarkers(features) {
    if (!MAP || typeof maplibregl?.Marker !== "function") return;
    const zoom = Number(MAP.getZoom?.() ?? START.zoom ?? 13);
    if (!placeDetailMarkerEventsBound) {
      const onViewportChanged = () => syncPlaceDetailDomMarkers(lastPlaceMarkerFeatures);
      MAP.on("zoom", updateNativeDetailDotSizes);
      MAP.on("moveend", onViewportChanged);
      MAP.on("zoomend", onViewportChanged);
      placeDetailMarkerEventsBound = true;
    }
    const badgesReady = isBadgeMarkerMode() && placeBadgeImages.size > 0;
    if ((!badgesReady && zoom < PLACE_DETAIL_MIN_ZOOM) ||
        (!badgesReady && !useNativeTouchDetailMarkers() && zoom < PLACE_DETAIL_BADGE_MIN_ZOOM)) {
      for (const entry of placeDetailMarkers.values()) entry.marker.remove();
      placeDetailMarkers.clear();
      return;
    }

    // Limit DOM nodes to the current visible viewport: the canonical vector
    // layers still represent all places, including those outside this window.
    const bounds = MAP.getBounds?.();
    const center = MAP.getCenter?.() || { lng: START.lon, lat: START.lat };
    const lon0 = Number(center.lng ?? center.lon ?? START.lon);
    const lat0 = Number(center.lat ?? START.lat);
    let visible = features.filter(feature => {
      if (feature?.properties?.mapLod !== PLACE_MAP_LOD_DETAIL) return false;
      if (zoom < PLACE_DETAIL_MIN_ZOOM && !(badgesReady && placeBadgeImages.has(badgeCategoryId(feature.properties.category)))) return false;
      if (!useNativeTouchDetailMarkers() && zoom < PLACE_DETAIL_BADGE_MIN_ZOOM &&
          !(badgesReady && placeBadgeImages.has(badgeCategoryId(feature.properties.category)))) return false;
      const coords = feature.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return false;
      return typeof bounds?.contains !== "function" || bounds.contains(coords);
    }).sort((a, b) => {
      const [ax, ay] = a.geometry.coordinates;
      const [bx, by] = b.geometry.coordinates;
      return ((ax - lon0) ** 2 + (ay - lat0) ** 2)
        - ((bx - lon0) ** 2 + (by - lat0) ** 2);
    }).slice(0, MAX_TOUCH_DETAIL_MARKERS);

    // During a cold mobile boot MapLibre can report bounds from an invisible
    // or zero-sized map container. Never interpret an empty first bounds
    // calculation as proof that there are no places to display.
    if (!visible.length) {
      visible = features.filter(feature => feature?.properties?.mapLod === PLACE_MAP_LOD_DETAIL &&
          (zoom >= PLACE_DETAIL_MIN_ZOOM || (badgesReady && placeBadgeImages.has(badgeCategoryId(feature.properties.category)))) &&
          (useNativeTouchDetailMarkers() || zoom >= PLACE_DETAIL_BADGE_MIN_ZOOM ||
            (badgesReady && placeBadgeImages.has(badgeCategoryId(feature.properties.category)))))
        .sort((a, b) => {
          const [ax, ay] = a.geometry.coordinates;
          const [bx, by] = b.geometry.coordinates;
          return ((ax - lon0) ** 2 + (ay - lat0) ** 2)
            - ((bx - lon0) ** 2 + (by - lat0) ** 2);
        }).slice(0, MAX_TOUCH_DETAIL_MARKERS);
    }

    const keep = new Set();
    for (const feature of visible) {
      const id = String(feature.properties.id || "").trim();
      if (!id) continue;
      keep.add(id);
      let entry = placeDetailMarkers.get(id);
      if (!entry) {
        const element = document.createElement("div");
        element.className = "hg-place-detail-marker";
        element.dataset.placeId = id;
        element.setAttribute("role", "button");
        element.setAttribute("aria-label", String(feature.properties.name || id));
        element.style.boxSizing = "border-box";
        element.style.borderRadius = "50%";
        element.style.borderStyle = "solid";
        element.style.borderWidth = "1px";
        element.style.pointerEvents = "auto";
        element.style.cursor = "pointer";
        element.style.touchAction = "manipulation";
        element.style.zIndex = "8";
        // Native touch markers must own visible place names: the separate
        // WebGL text layer previously vanished on some iPads.
        const label = document.createElement("span");
        label.className = "hg-place-detail-label";
        label.setAttribute("aria-hidden", "true");
        label.textContent = String(feature.properties.name || id);
        label.style.display = "none";
        element.appendChild(label);
        element.addEventListener("click", event => {
          event.preventDefault?.();
          event.stopPropagation?.();
          onPlaceClick(id);
        });
        const marker = new maplibregl.Marker({ element, anchor: "center" })
          .setLngLat(feature.geometry.coordinates)
          .addTo(MAP);
        entry = { marker, element, label, badgeImage: null, badgeSrc: "", hasCategoryBadge: false,
          name: String(feature.properties.name || id),
          lon: feature.geometry.coordinates[0], lat: feature.geometry.coordinates[1] };
        placeDetailMarkers.set(id, entry);
      } else if (entry.lon !== feature.geometry.coordinates[0] || entry.lat !== feature.geometry.coordinates[1]) {
        // Repeating setLngLat for an unchanged dot can cause needless DOM
        // projection/repaint and visible flashing during background updates.
        entry.marker.setLngLat(feature.geometry.coordinates);
        entry.lon = feature.geometry.coordinates[0];
        entry.lat = feature.geometry.coordinates[1];
      }
      const name = String(feature.properties.name || id);
      if (name !== entry.name) {
        entry.name = name;
        entry.label.textContent = name;
        entry.element.setAttribute("aria-label", name);
      }
      const badgeSrc = isBadgeMarkerMode() || zoom >= PLACE_DETAIL_BADGE_MIN_ZOOM
        ? (placeBadgeImages.get(badgeCategoryId(feature.properties.category)) || "") : "";
      if (badgeSrc !== entry.badgeSrc) {
        entry.badgeImage?.remove();
        entry.badgeSrc = badgeSrc;
        entry.badgeImage = null;
        if (badgeSrc) {
          const image = document.createElement("img");
          image.className = "hg-place-detail-badge";
          image.alt = "";
          image.draggable = false;
          image.addEventListener("load", updateNativeDetailDotSizes);
          image.addEventListener("error", updateNativeDetailDotSizes);
          entry.element.insertBefore(image, entry.label);
          entry.badgeImage = image;
          image.src = badgeSrc;
        }
      }
      entry.element.style.backgroundColor = feature.properties.fill;
      const borderColor = String(feature.properties.border || "").trim();
      const fillColor = String(feature.properties.fill || "").trim();
      // A missing category palette used to produce white fill AND white
      // outline on CARTO's pale basemap, rendering first-boot dots invisible.
      entry.element.style.borderColor = !borderColor || borderColor.toLowerCase() === fillColor.toLowerCase()
        ? "#17212a" : borderColor;
      entry.element.style.opacity = feature.properties.coordinateTrust === "invalid" ? "0" : "1";
      entry.element.style.boxShadow = "0 0 0 .45px rgba(0,0,0,.40), 0 1px 2px rgba(0,0,0,.28)";
    }
    for (const [id, entry] of placeDetailMarkers) {
      if (keep.has(id)) continue;
      entry.marker.remove();
      placeDetailMarkers.delete(id);
    }

    updateNativeDetailDotSizes();
  }

  function getPlaceGlowPaint(isArea = false) {
    const radius = isArea
      ? ["interpolate", ["linear"], ["zoom"], 7, 3.5, 9.5, 6, 12, 8.2, 16, 11.5, 18, 15]
      : ["interpolate", ["linear"], ["zoom"], 10, 1.8, 12, 2.5, 14, 3.7, 16, 5.2, 18, 7.4];
    const visibility = isArea ? 1 : getPlaceDetailVisibility();

    if (!isStandardMapStyle()) {
      return {
        "circle-radius": radius,
        "circle-color": "rgba(0,0,0,0.12)",
        "circle-opacity": ["*", 0.45, visibility],
        "circle-blur": 0.8
      };
    }

    return {
      "circle-radius": isArea
        ? radius
        : ["interpolate", ["linear"], ["zoom"], 10, 3.0, 12, 3.8, 14, 5.0, 16, 6.8, 18, 9.2],
      "circle-color": ["get", "fill"],
      "circle-opacity": [
        "*",
        [
          "case",
          ["in", ["get", "coordinateTrust"], ["literal", ["review", "unknown"]]], 0.12,
          0.24
        ],
        visibility
      ],
      "circle-blur": 0.65
    };
  }

  function getPlaceLabelPaint(isArea = false) {
    const opacity = isArea
      ? [
          "interpolate", ["linear"], ["zoom"],
          PLACE_AREA_LABEL_MIN_ZOOM, 0.0,
          PLACE_AREA_LABEL_MIN_ZOOM + 0.6, 0.86,
          PLACE_AREA_LABEL_MIN_ZOOM + 1.2, 1.0
        ]
      : [
          "interpolate", ["linear"], ["zoom"],
          PLACE_DETAIL_LABEL_MIN_ZOOM, 0.0,
          PLACE_DETAIL_LABEL_MIN_ZOOM + 0.8, 0.72,
          PLACE_DETAIL_LABEL_MIN_ZOOM + 1.6, 1.0
        ];

    if (!isStandardMapStyle()) {
      return {
        "text-color": "rgba(20,20,20,0.92)",
        "text-halo-color": "rgba(255,255,255,0.95)",
        "text-halo-width": isArea ? 1.8 : 1.4,
        "text-halo-blur": 0.25,
        "text-opacity": opacity
      };
    }

    return {
      "text-color": "rgba(50,61,67,0.96)",
      "text-halo-color": "rgba(255,252,244,0.96)",
      "text-halo-width": isArea ? 2.0 : 1.7,
      "text-halo-blur": 0.22,
      "text-opacity": opacity
    };
  }

  function getPlaceDotPaint(isArea = false) {
    return {
      "circle-radius": isArea
        ? [
            "interpolate", ["linear"], ["zoom"],
            7, ["+", 3.2, ["*", 0.25, ["get", "visited"]]],
            9.5, ["+", 5.2, ["*", 0.35, ["get", "visited"]]],
            12, ["+", 6.4, ["*", 0.45, ["get", "visited"]]],
            16, ["+", 7.2, ["*", 0.7, ["get", "visited"]]],
            18, ["+", 8.8, ["*", 0.9, ["get", "visited"]]]
          ]
        : [
            "interpolate", ["linear"], ["zoom"],
            9.8, ["+", 3.1, ["*", 0.3, ["get", "visited"]]],
            12, ["+", 3.5, ["*", 0.4, ["get", "visited"]]],
            14, ["+", 4.2, ["*", 0.5, ["get", "visited"]]],
            16, ["+", 5.0, ["*", 0.7, ["get", "visited"]]],
            18, ["+", 6.0, ["*", 0.8, ["get", "visited"]]]
          ],
      "circle-color": ["get", "fill"],
      "circle-stroke-color": ["get", "border"],
      "circle-stroke-width": isArea ? getPlaceMarkerStrokeWidth(true) + 0.5 : getPlaceMarkerStrokeWidth(false),
      // The layer minzoom already owns when detail markers appear. Do not fade
      // the actual dot away: once a place label can render, its dot must exist.
      "circle-opacity": [
        "case",
        ["==", ["get", "badgeAvailable"], 1], 0,
        ["in", ["get", "coordinateTrust"], ["literal", ["review", "unknown"]]], 0.58,
        1
      ]
    };
  }

  function getPlaceLabelLayout(isArea = false) {
    return {
      "text-field": ["get", "name"],
      "text-transform": "uppercase",
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Regular"],
      "text-size": isArea
        ? ["interpolate", ["linear"], ["zoom"], 9, 12.5, 12, 14.5, 16, 16.5, 18, 17.5]
        : ["interpolate", ["linear"], ["zoom"], 11, 12, 14, 13, 18, 16],
      "text-offset": [0, isArea ? 1.0 : 1.2],
      "text-anchor": "top",
      "text-allow-overlap": false,
      "text-ignore-placement": false
    };
  }

  function getPlaceHitPaint(isArea = false) {
    return {
      "circle-radius": isArea
        ? ["interpolate", ["linear"], ["zoom"], 7, 11, 10, 13, 12, 16, 16, 20, 18, 24]
        : ["interpolate", ["linear"], ["zoom"], 10, 9, 12, 11, 14, 14, 16, 18, 18, 23],
      "circle-color": "rgba(0,0,0,0.01)",
      "circle-opacity": 0.01
    };
  }

  function isAreaPlace(place) {
    return String(place?.placeScope || "").trim().toLowerCase() === PLACE_SCOPE_AREA;
  }

  function getMapLod(place) {
    const explicit = String(place?.mapLod || "").trim().toLowerCase();
    if ([PLACE_MAP_LOD_OVERVIEW, PLACE_MAP_LOD_AREA, PLACE_MAP_LOD_DETAIL].includes(explicit)) return explicit;
    return isAreaPlace(place) ? PLACE_MAP_LOD_AREA : PLACE_MAP_LOD_DETAIL;
  }

  function drawPlaceMarkers() {
    if (!MAP) return;
    if (!Array.isArray(PLACES) || PLACES.length === 0) return;

    // Native mobile dots must not wait for the map style, glyphs or tiles.
    // WebGL layers below are optional and are installed once style.load fires.
    const places = (typeof window.HG_I18N?.localizePlaces === "function")
      ? window.HG_I18N.localizePlaces(PLACES)
      : PLACES;

    const features = [];
    for (const p of places) {
      const coordinateTrust = getCoordinateTrust(p);
      p.coordinateTrust = coordinateTrust;
      if (coordinateTrust === "invalid") {
        console.warn("[HGMap] Skipping invalid place coordinate", { id: p?.id, name: p?.name });
        continue;
      }

      const lat = num(p?.lat);
      const lon = num(p?.lon);

      const isVisited = !!visited[p.id];
      const base = catColor(p.category);
      const fill = isVisited ? lighten(base, 0.25) : base;
      const border = getPlaceMarkerBorder(p.category, base);

      features.push({
        type: "Feature",
        properties: {
          id: p.id,
          name: p.name || "",
          badgeAvailable: isBadgeMarkerMode() && placeBadgeImages.has(badgeCategoryId(p.category)) ? 1 : 0,
          category: p.category || "",
          visited: isVisited ? 1 : 0,
          isAreaPlace: isAreaPlace(p) ? 1 : 0,
          mapLod: getMapLod(p),
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
    lastPlaceMarkerFeatures = features;
    ensurePlaceBadgeImages();
    syncPlaceAreaDomMarkers(features);
    // Native mobile detail dots do not depend on WebGL circle rendering.
    // They are created before the GeoJSON layers so they survive style errors.
    syncPlaceDetailDomMarkers(features);
    if (!styleReady) return;
    const src = MAP.getSource(SRC);
    if (src && REQUIRED_PLACE_LAYERS.every(id => MAP.getLayer(id))) {
      src.setData(fc);
      moveMarkersOnTop();
      return;
    }

    // Recover an incomplete style reload: removing only the stale source
    // cannot restore any missing layers, so rebuild the whole marker stack.
    removeIfExists();
    MAP.addSource(SRC, { type: "geojson", data: fc });

    MAP.addLayer({
      id: L_GLOW,
      layout: { visibility: useNativeTouchDetailMarkers() ? "none" : "visible" },
      minzoom: PLACE_DETAIL_MIN_ZOOM,
      filter: PLACE_DETAIL_LOD_FILTER,
      type: "circle",
      source: SRC,
      paint: getPlaceGlowPaint(false)
    });

    MAP.addLayer({
      id: L_DOTS,
      layout: { visibility: useNativeTouchDetailMarkers() ? "none" : "visible" },
      minzoom: PLACE_DETAIL_MIN_ZOOM,
      filter: PLACE_DETAIL_LOD_FILTER,
      type: "circle",
      source: SRC,
      paint: getPlaceDotPaint(false)
    });

    MAP.addLayer({
      id: L_LAB,
      // Touch text follows stable native dots; desktop keeps WebGL labels.
      minzoom: PLACE_DETAIL_LABEL_MIN_ZOOM,
      filter: PLACE_DETAIL_LOD_FILTER,
      type: "symbol",
      source: SRC,
      layout: {
        ...getPlaceLabelLayout(false),
        visibility: useNativeTouchDetailMarkers() ? "none" : "visible"
      },
      paint: getPlaceLabelPaint(false)
    });

    MAP.addLayer({
      id: L_AREA_LAB,
      minzoom: PLACE_AREA_LABEL_MIN_ZOOM,
      filter: PLACE_AREA_LOD_FILTER,
      type: "symbol",
      source: SRC,
      layout: getPlaceLabelLayout(true),
      paint: getPlaceLabelPaint(true)
    });

    MAP.addLayer({
      id: L_HIT,
      minzoom: PLACE_DETAIL_HIT_MIN_ZOOM,
      filter: PLACE_DETAIL_LOD_FILTER,
      type: "circle",
      source: SRC,
      paint: getPlaceHitPaint(false)
    });

    MAP.addLayer({
      id: L_AREA_HIT,
      filter: PLACE_AREA_LOD_FILTER,
      type: "circle",
      source: SRC,
      paint: getPlaceHitPaint(true)
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
    if (!MAP || ![L_AREA_HIT, L_HIT].some(hasLayer)) return;

    if (MAP.__hgPlaceHandlers) {
      const prev = MAP.__hgPlaceHandlers;
      for (const layerId of (prev.hoverLayers || [L_HIT])) {
        MAP.off("mouseenter", layerId, prev.setPointer);
        MAP.off("mouseleave", layerId, prev.clearPointer);
      }
      MAP.off("click", prev.handlePlaceClick);
      MAP.off("dragstart", prev.markMapGesture);
      MAP.off("zoomstart", prev.markMapGesture);
      MAP.off("rotatestart", prev.markMapGesture);
      MAP.off("dragend", prev.finishMapGesture);
      MAP.off("zoomend", prev.finishMapGesture);
      MAP.off("rotateend", prev.finishMapGesture);
      prev.canvas?.removeEventListener("pointerdown", prev.handlePointerDown);
      prev.canvas?.removeEventListener("pointermove", prev.handlePointerMove);
      prev.canvas?.removeEventListener("pointerup", prev.handlePointerUp);
      prev.canvas?.removeEventListener("pointercancel", prev.handlePointerCancel);
    }

    const canvas = MAP.getCanvas();
    let pointerStart = null;
    let pointerMoved = false;
    let mapGestureActive = false;
    let suppressPlaceClickUntil = 0;
    let lastOpenedPlace = { id: null, at: 0 };

    const prefetchFeature = (event: any) => {
      const feature = getPlaceFeatureFromEvent(event);
      const id = feature?.properties?.id;
      if (!id) return;
      const place = PLACES.find(candidate => String(candidate?.id || "") === String(id));
      void (window as any).HGPlaceOpen?.preload?.(place || id);
    };
    const setPointer = (event: any) => {
      canvas.style.cursor = "pointer";
      prefetchFeature(event);
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
      prefetchFeature({ originalEvent: event });
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
      const now = Date.now();
      if (mapGestureActive || pointerMoved || now < suppressPlaceClickUntil) return;

      const feature = getPlaceFeatureFromEvent(e);
      const id = feature?.properties?.id;
      if (!id) return;
      if (lastOpenedPlace.id === id && now - lastOpenedPlace.at < PLACE_GESTURE_COOLDOWN_MS) return;

      lastOpenedPlace = { id, at: now };
      e?.preventDefault?.();
      e?.originalEvent?.preventDefault?.();
      e?.originalEvent?.stopPropagation?.();

      onPlaceClick(id);
    };

    const hoverLayers = [L_AREA_HIT, L_HIT].filter(hasLayer);

    MAP.__hgPlaceHandlers = {
      canvas,
      hoverLayers,
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

    for (const layerId of hoverLayers) {
      MAP.on("mouseenter", layerId, setPointer);
      MAP.on("mouseleave", layerId, clearPointer);
    }
    MAP.on("dragstart", markMapGesture);
    MAP.on("zoomstart", markMapGesture);
    MAP.on("rotatestart", markMapGesture);
    MAP.on("dragend", finishMapGesture);
    MAP.on("zoomend", finishMapGesture);
    MAP.on("rotateend", finishMapGesture);
    MAP.on("click", handlePlaceClick);
    // A MapLibre tap dispatches click; touchend would fire a duplicate route.
  }

  function moveMarkersOnTop() {
    if (!MAP) return;
    [L_AREA_GLOW, L_GLOW, L_AREA_DOTS, L_DOTS, L_LAB, L_AREA_LAB, L_HIT, L_AREA_HIT].forEach(id => {
      if (MAP.getLayer(id)) MAP.moveLayer(id);
    });
  }

  function ensureMarkers() {
    if (!MAP || !styleReady || !mapReady || isApplyingStyle) return;
    if (!MAP.getSource(SRC) || !REQUIRED_PLACE_LAYERS.every(id => MAP.getLayer(id))) {
      drawPlaceMarkers();
    }
  }

  function maybeDrawMarkers() { ensureMarkers(); }
  function refreshMarkers() { drawPlaceMarkers(); }

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
    isAreaPlace,
    getMapLod,
    setMarkerMode,
    getMarkerMode: () => markerMode,

    maybeDrawMarkers,
    ensureMarkers,
    refreshMarkers
  };
})();
