// @ts-nocheck
// js/ui/nature-detailed-map.js
// Dedicated hiking/nature map for canonical nature places.
// This module never reuses or manipulates the ordinary History GO main map.
(function installNatureDetailedMap(global) {
  "use strict";

  const ROOT_ID = "hgNatureDetailedMap";
  const MAP_ID = "hgNatureDetailedMapCanvas";
  const STYLE_ID = "hgNatureDetailedMapStyles";

  // Kartverket WMTS: toporaster is the official hiking-map layer.
  const KARTVERKET_TURKART = "https://cache.kartverket.no/v1/wmts/1.0.0/toporaster/default/webmercator/{z}/{y}/{x}.png";
  // Current national hiking-route WMS managed by Kartverket/Geonorge.
  const TURRUTER_WMS = "https://wms.geonorge.no/skwms1/wms.friluftsruter2";
  // Miljødirektoratet Naturbase: Naturtyper på land (NiN), all mapped localities.
  const NATURTYPER_NIN_WMS = "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_nin/MapServer/WMSServer";

  const ROUTE_LAYERS = Object.freeze(["Fotrute", "Sykkelrute", "Skiloype", "AnnenRute"]);

  let map = null;
  let marker = null;
  let currentPlaceId = "";

  function s(value) {
    return String(value == null ? "" : value).trim();
  }

  function finiteNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }

  function isNaturePlace(place) {
    return s(place?.category).toLowerCase() === "natur";
  }

  function getCoordinates(place) {
    const lat = finiteNumber(place?.lat);
    const lon = finiteNumber(place?.lon ?? place?.lng);
    return lat == null || lon == null ? null : { lat, lon };
  }

  function wmsTileUrl(baseUrl, layers) {
    const layerParam = encodeURIComponent(Array.isArray(layers) ? layers.join(",") : String(layers || ""));
    return [
      `${baseUrl}?SERVICE=WMS`,
      "VERSION=1.1.1",
      "REQUEST=GetMap",
      `LAYERS=${layerParam}`,
      "STYLES=",
      "FORMAT=image/png",
      "TRANSPARENT=TRUE",
      "SRS=EPSG:3857",
      "BBOX={bbox-epsg-3857}",
      "WIDTH=256",
      "HEIGHT=256"
    ].join("&");
  }

  function buildStyle() {
    return {
      version: 8,
      sources: {
        kartverket_turkart: {
          type: "raster",
          tiles: [KARTVERKET_TURKART],
          tileSize: 256,
          attribution: "© Kartverket"
        },
        kartverket_turruter: {
          type: "raster",
          tiles: [wmsTileUrl(TURRUTER_WMS, ROUTE_LAYERS)],
          tileSize: 256,
          attribution: "Turrutebasen © Kartverket / dataeiere"
        },
        naturbase_nin: {
          type: "raster",
          tiles: [wmsTileUrl(NATURTYPER_NIN_WMS, "naturtyper_nin_alle")],
          tileSize: 256,
          attribution: "Naturtyper NiN © Miljødirektoratet"
        }
      },
      layers: [
        {
          id: "kartverket-turkart",
          type: "raster",
          source: "kartverket_turkart"
        },
        {
          id: "naturbase-nin",
          type: "raster",
          source: "naturbase_nin",
          layout: { visibility: "none" },
          paint: { "raster-opacity": 0.52 }
        },
        {
          id: "kartverket-turruter",
          type: "raster",
          source: "kartverket_turruter",
          paint: { "raster-opacity": 0.98 }
        }
      ]
    };
  }

  function norgeskartUrl(place) {
    const query = encodeURIComponent(s(place?.name || place?.title || place?.id));
    return `https://norgeskart.no/?project=norgeskart&sok=${query}`;
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}[hidden]{display:none!important}
      #${ROOT_ID}{position:fixed;inset:0;z-index:10060;background:#070707;color:#fff;display:flex;flex-direction:column}
      #${ROOT_ID} .hg-nature-map-head{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.22);background:#090909}
      #${ROOT_ID} .hg-nature-map-title{min-width:0;flex:1;font:700 16px/1.2 system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #${ROOT_ID} .hg-nature-map-close{border:1px solid rgba(255,255,255,.55);background:#111;color:#fff;border-radius:999px;width:38px;height:38px;font-size:22px;line-height:1;cursor:pointer}
      #${ROOT_ID} .hg-nature-map-stage{position:relative;flex:1;min-height:0;background:#d9d4c7}
      #${ROOT_ID} #${MAP_ID}{position:absolute;inset:0}
      #${ROOT_ID} .hg-nature-map-layers{position:absolute;left:10px;bottom:10px;z-index:4;display:flex;gap:6px;max-width:calc(100% - 20px);overflow-x:auto;padding:4px;background:rgba(7,7,7,.76);border-radius:999px;backdrop-filter:blur(5px)}
      #${ROOT_ID} .hg-nature-layer{flex:0 0 auto;border:1px solid rgba(255,255,255,.45);background:#111;color:#fff;border-radius:999px;padding:7px 10px;font:600 12px/1 system-ui,sans-serif;cursor:pointer}
      #${ROOT_ID} .hg-nature-layer[aria-pressed="true"]{background:#fff;color:#111}
      #${ROOT_ID} .hg-nature-map-foot{padding:7px 10px 9px;border-top:1px solid rgba(255,255,255,.18);background:#090909;display:grid;gap:5px}
      #${ROOT_ID} .hg-nature-map-note{font:11px/1.35 system-ui,sans-serif;color:#d6d6d6}
      #${ROOT_ID} .hg-nature-map-links{display:flex;gap:8px;overflow-x:auto;padding-bottom:1px}
      #${ROOT_ID} .hg-nature-map-link{flex:0 0 auto;color:#fff;text-decoration:none;border:1px solid rgba(255,255,255,.36);border-radius:999px;padding:7px 10px;font:600 12px/1 system-ui,sans-serif}
      #${ROOT_ID} .maplibregl-ctrl-attrib{font-size:10px}
    `;
    document.head.appendChild(style);
  }

  function ensureRoot() {
    ensureStyles();
    let root = document.getElementById(ROOT_ID);
    if (root) return root;

    root = document.createElement("section");
    root.id = ROOT_ID;
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Turkart");
    root.innerHTML = `
      <header class="hg-nature-map-head">
        <div class="hg-nature-map-title" data-nature-map-title>Turkart</div>
        <button class="hg-nature-map-close" type="button" data-nature-map-close aria-label="Lukk turkart">×</button>
      </header>
      <div class="hg-nature-map-stage">
        <div id="${MAP_ID}" aria-label="Tur- og naturkart"></div>
        <div class="hg-nature-map-layers" aria-label="Kartlag">
          <button class="hg-nature-layer" type="button" data-layer="kartverket-turruter" aria-pressed="true">Turruter</button>
          <button class="hg-nature-layer" type="button" data-layer="naturbase-nin" aria-pressed="false">Naturtyper</button>
        </div>
      </div>
      <footer class="hg-nature-map-foot">
        <div class="hg-nature-map-note">Turkart fra Kartverket med Nasjonal database for turruter. Naturtyper er et valgfritt faglag fra Miljødirektoratet.</div>
        <div class="hg-nature-map-links">
          <a class="hg-nature-map-link" data-norgeskart-open target="_blank" rel="noopener">Åpne i Norgeskart</a>
          <a class="hg-nature-map-link" href="https://www.geonorge.no/kartdata/datasett-i-geonorge/friluftsliv2/" target="_blank" rel="noopener">Om turrutedata</a>
          <a class="hg-nature-map-link" href="https://artskart.artsdatabanken.no/" target="_blank" rel="noopener">Artskart</a>
        </div>
        <div class="hg-nature-map-note">Kartgrunnlag: © Kartverket. Naturtyper: © Miljødirektoratet. Artsobservasjoner vises ikke som punktlag før presisjon og sensitive funn er håndtert eksplisitt.</div>
      </footer>
    `;

    document.body.appendChild(root);
    root.querySelector("[data-nature-map-close]")?.addEventListener("click", close);
    root.addEventListener("keydown", event => {
      if (event.key === "Escape") close();
    });
    root.querySelectorAll("[data-layer]").forEach(button => {
      button.addEventListener("click", () => toggleLayer(button));
    });
    return root;
  }

  function toggleLayer(button) {
    if (!map) return;
    const layerId = s(button?.dataset?.layer);
    if (!layerId || !map.getLayer?.(layerId)) return;
    const visible = map.getLayoutProperty(layerId, "visibility") !== "none";
    map.setLayoutProperty(layerId, "visibility", visible ? "none" : "visible");
    button.setAttribute("aria-pressed", visible ? "false" : "true");
  }

  function removeMap() {
    marker?.remove?.();
    marker = null;
    map?.remove?.();
    map = null;
  }

  function addPlaceMarker(place, coordinates) {
    if (!global.maplibregl?.Marker || !map) return;
    const element = document.createElement("div");
    element.setAttribute("aria-label", s(place?.name || place?.title || "Natursted"));
    element.style.cssText = "width:18px;height:18px;border-radius:50%;background:#111;border:3px solid #fff;box-shadow:0 1px 7px rgba(0,0,0,.55)";
    marker = new global.maplibregl.Marker({ element, anchor: "center" })
      .setLngLat([coordinates.lon, coordinates.lat])
      .addTo(map);
  }

  function createMap(place) {
    const coordinates = getCoordinates(place);
    if (!coordinates || !global.maplibregl?.Map) return false;

    removeMap();
    map = new global.maplibregl.Map({
      container: MAP_ID,
      style: buildStyle(),
      center: [coordinates.lon, coordinates.lat],
      zoom: 14.4,
      minZoom: 7,
      maxZoom: 18,
      attributionControl: true
    });

    if (global.maplibregl.NavigationControl) {
      map.addControl?.(new global.maplibregl.NavigationControl({ showCompass: true }), "top-right");
    }
    map.on?.("load", () => addPlaceMarker(place, coordinates));
    currentPlaceId = s(place?.id);
    return true;
  }

  async function getPreview(place) {
    // The map round remains useful without a fake static preview. The canonical
    // map itself is rendered interactively when opened.
    return isNaturePlace(place) && getCoordinates(place) ? "" : "";
  }

  async function openPlace(place) {
    if (!isNaturePlace(place)) {
      global.showToast?.("Turkart finnes bare på natursteder");
      return false;
    }
    if (!getCoordinates(place)) {
      global.showToast?.("Turkart krever verifiserte stedkoordinater");
      return false;
    }
    if (!global.maplibregl?.Map) {
      global.showToast?.("Turkartmotoren er ikke lastet");
      return false;
    }

    const root = ensureRoot();
    const title = s(place?.name || place?.title || "Natursted");
    root.querySelector("[data-nature-map-title]").textContent = `Turkart · ${title}`;
    root.querySelector("[data-norgeskart-open]")?.setAttribute("href", norgeskartUrl(place));
    root.hidden = false;
    document.documentElement.classList.add("hg-nature-map-open");

    if (!createMap(place)) {
      root.hidden = true;
      document.documentElement.classList.remove("hg-nature-map-open");
      return false;
    }

    root.querySelector("[data-nature-map-close]")?.focus();
    return true;
  }

  function close() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;
    root.hidden = true;
    document.documentElement.classList.remove("hg-nature-map-open");
  }

  global.HGNatureDetailedMap = {
    openPlace,
    getPreview,
    close,
    isNaturePlace,
    buildStyle,
    norgeskartUrl,
    sources: Object.freeze({
      turkart: KARTVERKET_TURKART,
      turruter: TURRUTER_WMS,
      naturtyper: NATURTYPER_NIN_WMS
    }),
    routeLayers: [...ROUTE_LAYERS],
    getCurrentPlaceId: () => currentPlaceId
  };

  global.dispatchEvent?.(new Event("hg:nature-detailed-map-ready"));
})(window);
