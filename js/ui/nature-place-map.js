// @ts-nocheck
// Dedicated hiking/nature map for nature places.
// This is deliberately separate from the ordinary History GO main map.
(function installNaturePlaceMap(global) {
  "use strict";

  const ROOT_ID = "hgNaturePlaceMap";
  const MAP_ID = "hgNaturePlaceMapCanvas";
  const STYLE_ID = "hgNaturePlaceMapStyles";
  const BASE_TILES = "https://cache.kartverket.no/v1/wmts/1.0.0/toporaster/default/webmercator/{z}/{y}/{x}.png";
  const ROUTES_WMS = "https://wms.geonorge.no/skwms1/wms.friluftsruter";
  const VERN_WMS = "https://kart.miljodirektoratet.no/arcgis/services/vern/mapserver/WMSServer";
  const NIN_WMS = "https://kart.miljodirektoratet.no/arcgis/services/naturtyper_nin/MapServer/WMSServer";

  let natureMap = null;
  let placeMarker = null;
  let currentPlaceId = "";

  function s(value) { return String(value == null ? "" : value).trim(); }
  function isNaturePlace(place) { return s(place?.category).toLowerCase() === "natur"; }
  function number(value) { const n = Number(value); return Number.isFinite(n) ? n : null; }

  function norgeskartUrl(place) {
    const query = encodeURIComponent(s(place?.name || place?.title || place?.id));
    return `https://norgeskart.no/?project=norgeskart&sok=${query}`;
  }

  function wmsTileUrl(base, layers) {
    const params = [
      "service=WMS",
      "version=1.1.1",
      "request=GetMap",
      `layers=${encodeURIComponent(layers)}`,
      "styles=",
      "format=image/png",
      "transparent=true",
      "srs=EPSG:3857",
      "bbox={bbox-epsg-3857}",
      "width=256",
      "height=256"
    ];
    return `${base}?${params.join("&")}`;
  }

  function buildStyle() {
    return {
      version: 8,
      sources: {
        kartverket_turkart: {
          type: "raster",
          tiles: [BASE_TILES],
          tileSize: 256,
          attribution: "© Kartverket"
        },
        kartverket_turruter: {
          type: "raster",
          tiles: [wmsTileUrl(ROUTES_WMS, "Fotrute,Sykkelrute,Skiloype,AnnenRute,Friluftslivtilrettelegging")],
          tileSize: 256,
          attribution: "© Kartverket"
        },
        naturbase_vern: {
          type: "raster",
          tiles: [wmsTileUrl(VERN_WMS, "naturvern_omrade")],
          tileSize: 256,
          attribution: "Miljødirektoratet"
        },
        naturbase_nin: {
          type: "raster",
          tiles: [wmsTileUrl(NIN_WMS, "naturtyper_nin_alle")],
          tileSize: 256,
          attribution: "Miljødirektoratet"
        }
      },
      layers: [
        { id: "kartverket-turkart", type: "raster", source: "kartverket_turkart" },
        { id: "naturbase-vern", type: "raster", source: "naturbase_vern", layout: { visibility: "none" }, paint: { "raster-opacity": 0.52 } },
        { id: "naturbase-nin", type: "raster", source: "naturbase_nin", layout: { visibility: "none" }, paint: { "raster-opacity": 0.52 } },
        { id: "kartverket-turruter", type: "raster", source: "kartverket_turruter", paint: { "raster-opacity": 0.96 } }
      ]
    };
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID}[hidden]{display:none!important}
      #${ROOT_ID}{position:fixed;inset:0;z-index:10050;background:#070707;color:#fff;display:flex;flex-direction:column}
      #${ROOT_ID} .hg-nature-map-head{display:flex;align-items:center;gap:10px;padding:10px 12px;border-bottom:1px solid rgba(255,255,255,.22);background:#090909}
      #${ROOT_ID} .hg-nature-map-title{min-width:0;flex:1;font:700 16px/1.2 system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #${ROOT_ID} .hg-nature-map-close{border:1px solid rgba(255,255,255,.55);background:#111;color:#fff;border-radius:999px;width:38px;height:38px;font-size:22px;line-height:1;cursor:pointer}
      #${ROOT_ID} .hg-nature-map-stage{position:relative;flex:1;min-height:0;background:#d9d4c7}
      #${ROOT_ID} #${MAP_ID}{position:absolute;inset:0}
      #${ROOT_ID} .hg-nature-map-layers{position:absolute;left:10px;bottom:10px;z-index:4;display:flex;gap:6px;max-width:calc(100% - 20px);overflow-x:auto;padding:4px;background:rgba(7,7,7,.74);border-radius:999px;backdrop-filter:blur(5px)}
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
        <button class="hg-nature-map-close" type="button" data-nature-map-close aria-label="Lukk kart">×</button>
      </header>
      <div class="hg-nature-map-stage">
        <div id="${MAP_ID}" aria-label="Tur- og naturkart"></div>
        <div class="hg-nature-map-layers" aria-label="Kartlag">
          <button class="hg-nature-layer" type="button" data-layer="kartverket-turruter" aria-pressed="true">Turruter</button>
          <button class="hg-nature-layer" type="button" data-layer="naturbase-vern" aria-pressed="false">Vern</button>
          <button class="hg-nature-layer" type="button" data-layer="naturbase-nin" aria-pressed="false">Naturtyper</button>
        </div>
      </div>
      <footer class="hg-nature-map-foot">
        <div class="hg-nature-map-note">Turkart: Kartverkets toporaster med Nasjonal database for turruter. Valgfrie faglag: Naturbase vern og NiN-naturtyper.</div>
        <div class="hg-nature-map-links">
          <a class="hg-nature-map-link" data-norgeskart-open target="_blank" rel="noopener">Åpne i Norgeskart</a>
          <a class="hg-nature-map-link" href="https://www.kartverket.no/api-og-data/friluftsliv" target="_blank" rel="noopener">Om turrutedata</a>
          <a class="hg-nature-map-link" href="https://artskart.artsdatabanken.no/" target="_blank" rel="noopener">Artskart</a>
        </div>
        <div class="hg-nature-map-note">Kartgrunnlag og turruter: © Kartverket. Naturdata: Miljødirektoratet. Artsobservasjoner vises ikke som punktlag før presisjon/sensitivitet er håndtert eksplisitt.</div>
      </footer>
    `;
    document.body.appendChild(root);
    root.querySelector("[data-nature-map-close]")?.addEventListener("click", close);
    root.addEventListener("keydown", event => { if (event.key === "Escape") close(); });
    root.querySelectorAll("[data-layer]").forEach(button => {
      button.addEventListener("click", () => toggleLayer(button));
    });
    return root;
  }

  function toggleLayer(button) {
    if (!natureMap) return;
    const layerId = s(button?.dataset?.layer);
    if (!layerId || !natureMap.getLayer?.(layerId)) return;
    const visible = natureMap.getLayoutProperty(layerId, "visibility") !== "none";
    natureMap.setLayoutProperty(layerId, "visibility", visible ? "none" : "visible");
    button.setAttribute("aria-pressed", visible ? "false" : "true");
  }

  function installMarker(place, lon, lat) {
    placeMarker?.remove?.();
    placeMarker = null;
    if (!global.maplibregl?.Marker) return;
    const marker = document.createElement("div");
    marker.setAttribute("aria-label", s(place?.name || place?.title || "Natursted"));
    marker.style.cssText = "width:18px;height:18px;border-radius:50%;background:#111;border:3px solid #fff;box-shadow:0 1px 7px rgba(0,0,0,.55)";
    placeMarker = new global.maplibregl.Marker({ element: marker, anchor: "center" }).setLngLat([lon, lat]).addTo(natureMap);
  }

  function buildMap(place) {
    const lat = number(place?.lat);
    const lon = number(place?.lon ?? place?.lng);
    if (lat == null || lon == null || !global.maplibregl?.Map) return false;

    if (natureMap) {
      natureMap.remove();
      natureMap = null;
    }
    placeMarker?.remove?.();
    placeMarker = null;

    natureMap = new global.maplibregl.Map({
      container: MAP_ID,
      style: buildStyle(),
      center: [lon, lat],
      zoom: 14.4,
      minZoom: 7,
      maxZoom: 18,
      attributionControl: true
    });
    natureMap.addControl?.(new global.maplibregl.NavigationControl({ showCompass: true }), "top-right");
    natureMap.on?.("load", () => installMarker(place, lon, lat));
    currentPlaceId = s(place?.id);
    return true;
  }

  function open(place) {
    if (!isNaturePlace(place)) {
      global.showToast?.("Turkart finnes bare på natursteder");
      return false;
    }
    const root = ensureRoot();
    const title = s(place?.name || place?.title || "Natursted");
    root.querySelector("[data-nature-map-title]").textContent = `Turkart · ${title}`;
    root.querySelector("[data-norgeskart-open]")?.setAttribute("href", norgeskartUrl(place));
    root.hidden = false;
    document.documentElement.classList.add("hg-nature-map-open");
    const built = buildMap(place);
    if (!built) {
      root.hidden = true;
      document.documentElement.classList.remove("hg-nature-map-open");
      global.showToast?.("Turkart krever gyldige koordinater og MapLibre");
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

  global.HGNaturePlaceMap = {
    open,
    close,
    isNaturePlace,
    norgeskartUrl,
    buildStyle,
    sources: {
      base: BASE_TILES,
      turruter: ROUTES_WMS,
      vern: VERN_WMS,
      naturtyper: NIN_WMS
    },
    getCurrentPlaceId: () => currentPlaceId
  };
})(window);
