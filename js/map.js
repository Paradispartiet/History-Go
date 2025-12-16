// map.js — History GO (MapLibre + place layers) — STABLE v1
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

  // IDs (unngå kollisjon med basemap / andre moduler)
  const SRC = "hg-places-src";
  const L_GLOW = "hg-places-glow";
  const L_HIT  = "hg-places-hit";
  const L_DOTS = "hg-places-dots";
  const L_LAB  = "hg-places-label";

  // ---------- helpers ----------
  function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  function getLat(p) {
    if (!p) return null;
    return num(p.lat ?? p.latitude ?? (Array.isArray(p.coords) ? p.coords[1] : null));
  }
  function getLon(p) {
    if (!p) return null;
    return num(p.lon ?? p.lng ?? p.longitude ?? (Array.isArray(p.coords) ? p.coords[0] : null));
  }

  function lighten(hex, amount = 0.25) {
    let c = String(hex || "#000000").trim();
    if (c.startsWith("#")) c = c.slice(1);
    if (c.length === 3) c = c.split("").map(ch => ch + ch).join("");
    if (c.length !== 6) c = "000000";

    const v = parseInt(c, 16);
    if (Number.isNaN(v)) return "rgb(255,255,255)";

    let r = (v >> 16) & 255;
    let g = (v >> 8) & 255;
    let b = v & 255;

    r = Math.min(255, Math.round(r + 255 * amount));
    g = Math.min(255, Math.round(g + 255 * amount));
    b = Math.min(255, Math.round(b + 255 * amount));
    return `rgb(${r},${g},${b})`;
  }

  function buildFeatureCollection() {
    const features = [];
    for (const p of PLACES) {
      const lat = getLat(p);
      const lon = getLon(p);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      const isVisited = !!visited[p.id];
      const base = catColor(p.category);
      const fill = isVisited ? lighten(base, 0.25) : base;
      const border = isVisited ? "#ffd700" : "rgba(0,0,0,0.9)";

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
    return { type: "FeatureCollection", features };
  }

  function safeRemoveLayer(id) {
    try { if (MAP && MAP.getLayer(id)) MAP.removeLayer(id); } catch (_) {}
  }
  function safeRemoveSource(id) {
    try { if (MAP && MAP.getSource(id)) MAP.removeSource(id); } catch (_) {}
  }

  function forceOnTop() {
    if (!MAP) return;
    [L_GLOW, L_DOTS, L_HIT, L_LAB].forEach(id => {
      try { if (MAP.getLayer(id)) MAP.moveLayer(id); } catch (_) {}
    });
  }

  function ensurePlacesLayers(fc) {
    if (!MAP) return false;
    if (!MAP.isStyleLoaded()) return false;

    // 1) source
    if (!MAP.getSource(SRC)) {
      try {
        MAP.addSource(SRC, { type: "geojson", data: fc });
      } catch (e) {
        // hvis style glitchet: rydd og prøv igjen
        safeRemoveSource(SRC);
        try { MAP.addSource(SRC, { type: "geojson", data: fc }); } catch (_) { return false; }
      }
    } else {
      // oppdater data
      try { MAP.getSource(SRC).setData(fc); } catch (_) {}
    }

    // 2) layers (bygg bare de som mangler)
    if (!MAP.getLayer(L_GLOW)) {
      try {
        MAP.addLayer({
          id: L_GLOW,
          type: "circle",
          source: SRC,
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 2, 12, 3, 14, 5, 16, 9, 18, 14],
            "circle-color": "rgba(0,0,0,0.12)",
            "circle-blur": 0.85
          }
        });
      } catch (e) {
        // hvis noe feiler: hard reset hele HG-layer stack og rebuild
        safeRemoveLayer(L_LAB); safeRemoveLayer(L_DOTS); safeRemoveLayer(L_HIT); safeRemoveLayer(L_GLOW);
        safeRemoveSource(SRC);
        return ensurePlacesLayers(fc);
      }
    }

    if (!MAP.getLayer(L_HIT)) {
      try {
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
      } catch (e) {
        safeRemoveLayer(L_LAB); safeRemoveLayer(L_DOTS); safeRemoveLayer(L_HIT); safeRemoveLayer(L_GLOW);
        safeRemoveSource(SRC);
        return ensurePlacesLayers(fc);
      }
    }

    if (!MAP.getLayer(L_DOTS)) {
      try {
        MAP.addLayer({
          id: L_DOTS,
          type: "circle",
          source: SRC,
          paint: {
            "circle-radius": [
              "interpolate", ["linear"], ["zoom"],
              10, ["+", 3.2, ["*", 0.6, ["get", "visited"]]],
              12, ["+", 4.4, ["*", 0.8, ["get", "visited"]]],
              14, ["+", 6.2, ["*", 1.1, ["get", "visited"]]],
              16, ["+", 9.2, ["*", 1.4, ["get", "visited"]]],
              18, ["+", 13.2, ["*", 1.7, ["get", "visited"]]]
            ],
            "circle-color": ["get", "fill"],
            "circle-stroke-color": ["get", "border"],
            "circle-stroke-width": 1.9,
            "circle-opacity": 1
          }
        });
      } catch (e) {
        safeRemoveLayer(L_LAB); safeRemoveLayer(L_DOTS); safeRemoveLayer(L_HIT); safeRemoveLayer(L_GLOW);
        safeRemoveSource(SRC);
        return ensurePlacesLayers(fc);
      }
    }

    if (!MAP.getLayer(L_LAB)) {
      try {
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
            "text-halo-color": "rgba(255,255,255,0.96)",
            "text-halo-width": 1.4,
            "text-halo-blur": 0.25,
            "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.0, 12, 0.55, 14, 1.0]
          }
        });
      } catch (e) {
        // labels er optional – ikke la det stoppe prikker
      }
    }

    // 3) bind handlers én gang
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

    // 4) alltid øverst
    forceOnTop();
    return true;
  }

  // ---------- public API ----------
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

    MAP.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    MAP.on("load", () => {
      mapReady = true;
      if (dataReady) drawPlaceMarkers();
      MAP.resize();
    });

    // Viktig på mobil: hvis style “blinker”/resets, legg lagene tilbake
    MAP.on("styledata", () => {
      if (dataReady) drawPlaceMarkers();
    });

    return MAP;
  }

  function resize() { if (MAP && typeof MAP.resize === "function") MAP.resize(); }
  function getMap() { return MAP; }

  function setDataReady(v) { dataReady = !!v; }
  function setPlaces(input) {
    const arr = Array.isArray(input) ? input : (Array.isArray(input?.places) ? input.places : []);
    PLACES = arr;
  }
  function setVisited(obj) { visited = obj || {}; }
  function setCatColor(fn) { if (typeof fn === "function") catColor = fn; }
  function setOnPlaceClick(fn) { if (typeof fn === "function") onPlaceClick = fn; }

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

    if (fly) {
      MAP.flyTo({ center: ll, zoom: Math.max(MAP.getZoom() || 13, 15), speed: 1.2 });
    }
  }

  function maybeDrawMarkers() {
    if (mapReady && dataReady) drawPlaceMarkers();
  }

  function refreshMarkers() {
    drawPlaceMarkers();
  }

  function drawPlaceMarkers() {
    if (!MAP || !PLACES.length) return;
    const fc = buildFeatureCollection();
    ensurePlacesLayers(fc);
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
