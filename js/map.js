// map.js — History GO (MapLibre + place layers)
// Flyttet ut fra app.js (seksjon 5)

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

  function lighten(hex, amount = 0.35) {
  let c = String(hex || "#000000").trim();

  // fjern #
  if (c.startsWith("#")) c = c.slice(1);

  // støtt #fff → #ffffff
  if (c.length === 3) {
    c = c.split("").map(ch => ch + ch).join("");
  }

  // fallback ved rar input
  if (c.length !== 6) c = "000000";

  const num = parseInt(c, 16);
  if (Number.isNaN(num)) return "rgb(255,255,255)";

  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;

  r = Math.min(255, Math.round(r + 255 * amount));
  g = Math.min(255, Math.round(g + 255 * amount));
  b = Math.min(255, Math.round(b + 255 * amount));

  return `rgb(${r},${g},${b})`;
}

  function initMap({ containerId = "map", start = START } = {}) {
    START = start || START;
    const el = document.getElementById(containerId);
    if (!el) return null;

    MAP = new maplibregl.Map({
      container: containerId,
      style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
      center: [START.lon, START.lat],
      zoom: START.zoom,
      pitch: 0,
      bearing: 0,
      antialias: true
    });

    // Zoom-kontroller nederst til høyre
    MAP.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );

    MAP.on("load", () => {
      mapReady = true;

      applyGlowRoads();
      applyDarkColorfulLook();

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

  function setDataReady(v) {
    dataReady = !!v;
  }

  function setPlaces(arr) {
    PLACES = Array.isArray(arr) ? arr : [];
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

  function setUser(lat, lon, { fly = false } = {}) {
    if (typeof lat !== "number" || typeof lon !== "number") return;
    window.userLat = lat;
    window.userLon = lon;

    if (!MAP) return;

    const ll = [lon, lat];

    if (!userMarker) {
      const dot = document.createElement("div");
      dot.className = "hg-user-dot";
      dot.style.width = "14px";
      dot.style.height = "14px";
      dot.style.borderRadius = "50%";
      dot.style.background = "rgba(255,255,255,0.92)";
      dot.style.boxShadow = "0 0 12px rgba(255,255,255,0.35)";
      dot.style.border = "2px solid rgba(0,0,0,0.35)";

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
    // Kall denne når "visited" endrer seg
    drawPlaceMarkers();
  }

  function drawPlaceMarkers() {
    if (!MAP || !PLACES.length) return;

    const fc = {
      type: "FeatureCollection",
      features: PLACES
        .filter(p => p && typeof p.lat === "number" && typeof p.lon === "number")
        .map(p => {
          const isVisited = !!visited[p.id];
          const base = catColor(p.category);
          const fill = isVisited ? lighten(base, 0.35) : base;
          const border = isVisited ? "#ffd700" : "#ffffff";

          return {
            type: "Feature",
            properties: {
              id: p.id,
              name: p.name || "",
              visited: isVisited ? 1 : 0,
              fill,
              border
            },
            geometry: { type: "Point", coordinates: [p.lon, p.lat] }
          };
        })
    };

    // Oppdater hvis finnes
    if (MAP.getSource("places")) {
      MAP.getSource("places").setData(fc);
      return;
    }

    // Første gang: legg source + layers + handlers
    if (!MAP.isStyleLoaded()) {
      MAP.once("load", () => drawPlaceMarkers());
      return;
    }

    MAP.addSource("places", { type: "geojson", data: fc });

    // Mild glow bak
    if (!MAP.getLayer("places-glow")) {
      MAP.addLayer({
        id: "places-glow",
        type: "circle",
        source: "places",
        paint: {
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 1.0, 12, 1.4, 14, 2.6, 16, 5.5, 18, 10.0],
          "circle-color": "rgba(255,255,255,0.18)",
          "circle-blur": 0.9
        }
      });
    }

    // Usynlig "treffflate" (stor radius, 0 opacity)
    if (!MAP.getLayer("places-hit")) {
      MAP.addLayer({
        id: "places-hit",
        type: "circle",
        source: "places",
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            10, 10,
            12, 12,
            14, 14,
            16, 18,
            18, 24
          ],
          "circle-color": "rgba(255,255,255,0)",
          "circle-stroke-width": 0,
          "circle-opacity": 0
        }
      });
    }

    // Prikkene (synlige)
    if (!MAP.getLayer("places")) {
      MAP.addLayer({
        id: "places",
        type: "circle",
        source: "places",
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            10, ["+", 1.8, ["*", 0.35, ["get", "visited"]]],
            12, ["+", 2.6, ["*", 0.45, ["get", "visited"]]],
            14, ["+", 4.2, ["*", 0.60, ["get", "visited"]]],
            16, ["+", 7.2, ["*", 0.95, ["get", "visited"]]],
            18, ["+", 12.0, ["*", 1.30, ["get", "visited"]]]
          ],
          "circle-color": ["get", "fill"],
          "circle-stroke-color": ["get", "border"],
          "circle-stroke-width": 1.6,
          "circle-opacity": 1
        }
      });
    }

    // TV-tekst: baklag (skyggeboks)
    if (!MAP.getLayer("places-label-bg")) {
      MAP.addLayer({
        id: "places-label-bg",
        type: "symbol",
        source: "places",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 10, 12, 14, 14, 18, 18],
          "text-offset": [0, 1.25],
          "text-anchor": "top",
          "text-allow-overlap": false,
          "text-ignore-placement": false
        },
        paint: {
          "text-color": "rgba(0,0,0,0.01)",
          "text-halo-color": "rgba(0,0,0,0.70)",
          "text-halo-width": 6.0,
          "text-halo-blur": 0.8,
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.0, 12, 0.65, 14, 1.0]
        }
      });
    }

    // TV-tekst: frontlag (hvit tekst)
    if (!MAP.getLayer("places-label")) {
      MAP.addLayer({
        id: "places-label",
        type: "symbol",
        source: "places",
        layout: {
          "text-field": ["get", "name"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 10, 12, 14, 14, 18, 18],
          "text-offset": [0, 1.25],
          "text-anchor": "top",
          "text-allow-overlap": false,
          "text-ignore-placement": false
        },
        paint: {
          "text-color": "rgba(255,255,255,0.98)",
          "text-halo-color": "rgba(0,0,0,0.92)",
          "text-halo-width": 1.8,
          "text-halo-blur": 0.6,
          "text-opacity": ["interpolate", ["linear"], ["zoom"], 10, 0.0, 12, 0.65, 14, 1.0]
        }
      });
    }

    // Cursor feedback (bind kun én gang)
    if (!MAP.__hgPlacesCursorBound) {
      MAP.on("mouseenter", "places-hit", () => { MAP.getCanvas().style.cursor = "pointer"; });
      MAP.on("mouseleave", "places-hit", () => { MAP.getCanvas().style.cursor = ""; });
      MAP.__hgPlacesCursorBound = true;
    }

    // Click handler (bind kun én gang)
    if (!MAP.__hgPlacesClickBound) {
      MAP.on("click", "places-hit", (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        const id = f.properties && f.properties.id;
        if (id) onPlaceClick(id);
      });
      MAP.__hgPlacesClickBound = true;
    }
  }

  function applyGlowRoads() {
    if (!MAP) return;
    const style = MAP.getStyle();
    const layers = (style && style.layers) || [];
    const firstSymbol = layers.find(l => l.type === "symbol");
    const beforeId = firstSymbol ? firstSymbol.id : undefined;

    const roadLayers = layers
      .filter(l => l.type === "line" && /road|street|highway/i.test(l.id))
      .slice(0, 8);

    roadLayers.forEach((rl, i) => {
      const glowId = `hg-road-glow-${i}`;
      if (MAP.getLayer(glowId)) return;

      MAP.addLayer(
        {
          id: glowId,
          type: "line",
          source: rl.source,
          "source-layer": rl["source-layer"],
          filter: rl.filter,
          layout: rl.layout,
          paint: {
            "line-color": "rgba(255,255,255,0.22)",
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10, 1.2,
              13, 2.0,
              16, 4.6,
              18, 8.2
            ],
            "line-blur": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10, 0.7,
              14, 1.3,
              18, 2.2
            ],
            "line-opacity": 0.55
          }
        },
        beforeId
      );
    });
  }

  function applyDarkColorfulLook() {
    if (!MAP) return;

    const style = MAP.getStyle();
    const layers = (style && style.layers) || [];

    // Dim bakgrunn med et semi-transparent lag (beholder farger)
    if (!MAP.getSource("hg-dim")) {
      MAP.addSource("hg-dim", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Polygon",
                coordinates: [[
                  [-180, -85],
                  [ 180, -85],
                  [ 180,  85],
                  [-180,  85],
                  [-180, -85]
                ]]
              }
            }
          ]
        }
      });

      const firstSymbol = layers.find(l => l.type === "symbol");
      const beforeId = firstSymbol ? firstSymbol.id : undefined;

      MAP.addLayer({
        id: "hg-dim",
        type: "fill",
        source: "hg-dim",
        paint: { "fill-color": "rgba(0,0,0,0.26)", "fill-opacity": 1 }
      }, beforeId);
    }

    // Labels: hvit tekst + mørk halo
    layers.forEach(l => {
      if (l.type !== "symbol") return;
      if (!/label|place|road|poi/i.test(l.id)) return;

      try {
        MAP.setPaintProperty(l.id, "text-color", "rgba(255,255,255,0.96)");
        MAP.setPaintProperty(l.id, "text-halo-color", "rgba(0,0,0,0.85)");
        MAP.setPaintProperty(l.id, "text-halo-width", 1.35);
        MAP.setPaintProperty(l.id, "text-halo-blur", 0.4);
      } catch (e) {}
    });
  }

  // Expose API
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
