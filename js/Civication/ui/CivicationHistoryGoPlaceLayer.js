// CivicationHistoryGoPlaceLayer.js
// Lett History Go place-lag oppå Civication-SVG-kartet.
// Viser bare miniatyrbygg/klosser, ikke stedsnavn på kartet.
(function () {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";
  const LAYER_ID = "civi-map-hg-places";

  const OSLO_BOUNDS = { minLat: 59.80, maxLat: 60.02, minLon: 10.55, maxLon: 10.90 };
  const OSLO_FILTER = { minLat: 59.75, maxLat: 60.10, minLon: 10.45, maxLon: 11.00 };

  // Mindre enn Claudes første versjon (30 / 120 / alle), for å unngå støy og iPad-krasj.
  const LOW_ZOOM_LIMIT = 18;
  const MID_ZOOM_LIMIT = 45;
  const HIGH_ZOOM_LIMIT = 80;

  let _places = null;
  let _loadStarted = false;
  let _renderQueued = false;
  let _zoomRenderTimer = null;
  let _lastRenderedBucket = null;

  const node = (tag) => document.createElementNS(SVG_NS, tag);
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function host() { return document.getElementById("civiMapWorld"); }
  function svgEl() {
    const h = host();
    return h ? h.querySelector("svg") : null;
  }

  function el(tag, attrs) {
    const n = node(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, String(v)));
    return n;
  }

  function ensureLayer(svg) {
    let layer = svg.querySelector("#" + LAYER_ID);
    if (layer) return layer;

    layer = node("g");
    layer.setAttribute("id", LAYER_ID);
    layer.setAttribute("class", "civi-hg-place-layer");

    const before = svg.querySelector("#civi-map-labels") || svg.querySelector("#civi-map-state");
    if (before) svg.insertBefore(layer, before);
    else svg.appendChild(layer);
    return layer;
  }

  function normalize(place) {
    return {
      id: place && place.id,
      name: place && (place.name || place.title || place.id),
      category: (place && place.category) || "unknown",
      lat: num(place && place.lat),
      lon: num(place && place.lon),
      civiMap: (place && place.civiMap) || null,
      raw: place || {}
    };
  }

  function inBox(place, box) {
    return place.lat != null && place.lon != null &&
      place.lat >= box.minLat && place.lat <= box.maxLat &&
      place.lon >= box.minLon && place.lon <= box.maxLon;
  }

  function isOslo(place) {
    if (inBox(place, OSLO_FILTER)) return true;
    const civiMap = place.civiMap || {};
    if (String(civiMap.region || "").toLowerCase() === "oslo") return true;
    if (String(place.raw.city || "").toLowerCase() === "oslo") return true;
    return false;
  }

  function projectOsloLatLonToCiviXY(place) {
    const civiMap = place.civiMap || {};
    if (typeof civiMap.x === "number" && typeof civiMap.y === "number" &&
        civiMap.x >= 0 && civiMap.x <= 1 && civiMap.y >= 0 && civiMap.y <= 1) {
      return { x: civiMap.x, y: civiMap.y, source: "manual" };
    }
    if (place.lat == null || place.lon == null) return null;

    const x = clamp((place.lon - OSLO_BOUNDS.minLon) / (OSLO_BOUNDS.maxLon - OSLO_BOUNDS.minLon), 0.04, 0.96);
    const rawY = 1 - ((place.lat - OSLO_BOUNDS.minLat) / (OSLO_BOUNDS.maxLat - OSLO_BOUNDS.minLat));
    const y = clamp(0.18 + rawY * 0.74, 0.08, 0.94);
    return { x, y, source: "projected" };
  }

  const ASSET_ALIASES = {
    opera: "theatre_miniature",
    barcode: "skyline_miniature",
    skyline: "skyline_miniature",
    museum: "museum_miniature",
    library: "library_miniature",
    parliament: "civic_miniature",
    storting: "civic_miniature",
    cityhall: "civic_miniature",
    radhus: "civic_miniature",
    rådhus: "civic_miniature",
    theatre: "theatre_miniature",
    theater: "theatre_miniature",
    club: "theatre_miniature",
    venue: "theatre_miniature",
    stadium: "stadium_miniature",
    tower: "tower_miniature",
    warehouse: "factory_miniature",
    port: "waterfront_miniature",
    harbor: "waterfront_miniature",
    harbour: "waterfront_miniature",
    rail: "station_miniature",
    skate: "skatepark_miniature",
    skatepark: "skatepark_miniature",
    park: "park_miniature",
    generic_kultur: "theatre_miniature",
    generic_butikk: "commerce_miniature",
    generic_industri: "factory_miniature",
    generic_bolig: "block_miniature"
  };

  function normalizeAssetType(value) {
    const key = String(value || "").trim().toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_").replace(/[\/]+/g, "_");
    if (!key) return null;
    return ASSET_ALIASES[key] || key;
  }

  function resolveAssetType(place) {
    const civiMap = place.civiMap || {};
    const explicit = normalizeAssetType(civiMap.assetType) || normalizeAssetType(place.raw.mapAssetType);
    if (explicit) return explicit;

    const hay = `${place.id || ""} ${place.name || ""}`.toLowerCase();
    if (/barcode|skyline/.test(hay)) return "skyline_miniature";
    if (/rådhus|radhus|storting|parlament|parliament/.test(hay)) return "civic_miniature";
    if (/stadion|arena/.test(hay)) return "stadium_miniature";
    if (/museum|galleri/.test(hay)) return "museum_miniature";
    if (/bibliotek/.test(hay)) return "library_miniature";
    if (/opera|teater|scene|konserthus|kino|klubb/.test(hay)) return "theatre_miniature";
    if (/stasjon|t-bane|jernbane|holdeplass/.test(hay)) return "station_miniature";
    if (/kirke|kapell|domkirke/.test(hay)) return "church_miniature";
    if (/festning|slott|borg|skanse/.test(hay)) return "fortress_miniature";
    if (/skate|rullebrett/.test(hay)) return "skatepark_miniature";
    if (/lekeplass/.test(hay)) return "playground_miniature";
    if (/park|hage|skog|mark|lund|ås/.test(hay)) return "park_miniature";
    if (/brygge|havn|kai|fjord|vann|dam|tjern/.test(hay)) return "waterfront_miniature";
    if (/butikk|handel|marked|magasin/.test(hay)) return "commerce_miniature";
    if (/fabrikk|verksted|lager|logistikk|industri/.test(hay)) return "factory_miniature";

    switch (String(place.category || "").toLowerCase()) {
      case "sport": return "sports_field_miniature";
      case "kunst": return "museum_miniature";
      case "litteratur": return "library_miniature";
      case "musikk":
      case "film":
      case "film_tv":
      case "popkultur": return "theatre_miniature";
      case "natur": return "park_miniature";
      case "politikk":
      case "media": return "civic_miniature";
      case "vitenskap":
      case "psykologi": return "school_miniature";
      case "subkultur": return "street_miniature";
      case "by": return "block_miniature";
      default: return "default_miniature";
    }
  }

  function getZoom() {
    try { return (window.CivicationMapZoom && window.CivicationMapZoom.getZoom()) || 1; }
    catch (e) { return 1; }
  }

  function zoomBucket(zoom) {
    if (zoom > 2.2) return "high";
    if (zoom > 1.4) return "mid";
    return "low";
  }

  function priorityOf(place) {
    const cm = place.civiMap || {};
    if (typeof cm.priority === "number") return cm.priority;

    const hay = `${place.id || ""} ${place.name || ""}`.toLowerCase();
    const asset = resolveAssetType(place);
    let score = 0;
    if (asset === "stadium_miniature" || asset === "skyline_miniature" || asset === "civic_miniature") score += 6;
    if (/sentrum|oslo_s|bjorvika|aker_brygge|akershus|bislett|national|storting|radhus|rådhus/.test(hay)) score += 4;
    if (place.raw.frontImage || place.raw.cardImage) score += 2;
    if (place.raw.quiz_profile) score += 1;
    return score;
  }

  function visibleSet(places, zoom) {
    const sorted = places.slice().sort((a, b) => priorityOf(b) - priorityOf(a));
    const bucket = zoomBucket(zoom);
    if (bucket === "high") return sorted.slice(0, Math.min(sorted.length, HIGH_ZOOM_LIMIT));
    if (bucket === "mid") return sorted.slice(0, Math.min(sorted.length, MID_ZOOM_LIMIT));
    return sorted.slice(0, Math.min(sorted.length, LOW_ZOOM_LIMIT));
  }

  function shape(g, assetType, category) {
    const color = categoryColor(category);
    const add = (child) => g.appendChild(child);

    add(el("ellipse", { cx: 0, cy: 4, rx: 8, ry: 3, class: "civi-hg-mini-shadow" }));

    if (assetType === "stadium_miniature") {
      add(el("ellipse", { cx: 0, cy: -1, rx: 12, ry: 7, class: "civi-hg-stone" }));
      add(el("ellipse", { cx: 0, cy: -1, rx: 8, ry: 4, class: "civi-hg-field" }));
      return;
    }

    if (assetType === "sports_field_miniature") {
      add(el("rect", { x: -10, y: -6, width: 20, height: 11, rx: 1.5, class: "civi-hg-field" }));
      return;
    }

    if (assetType === "park_miniature" || assetType === "playground_miniature") {
      add(el("ellipse", { cx: 0, cy: 0, rx: 10, ry: 5, class: assetType === "playground_miniature" ? "civi-hg-sand" : "civi-hg-green" }));
      add(el("circle", { cx: -3, cy: -6, r: 3, class: "civi-hg-tree" }));
      add(el("circle", { cx: 5, cy: -4, r: 2.4, class: "civi-hg-tree" }));
      return;
    }

    if (assetType === "waterfront_miniature") {
      add(el("rect", { x: -11, y: 0, width: 22, height: 5, class: "civi-hg-water" }));
      add(el("rect", { x: -9, y: -3, width: 18, height: 3, class: "civi-hg-quay" }));
      add(el("rect", { x: 3, y: -10, width: 7, height: 8, class: "civi-hg-base" }));
      return;
    }

    if (assetType === "skatepark_miniature" || assetType === "street_miniature") {
      add(el("rect", { x: -11, y: -3, width: 22, height: 7, rx: 1, class: "civi-hg-street" }));
      if (assetType === "skatepark_miniature") add(el("path", { d: "M -8 2 Q -4 -6 0 2 Q 4 -6 8 2", class: "civi-hg-fieldline-stroke" }));
      return;
    }

    if (assetType === "skyline_miniature") {
      [-7, -2, 3].forEach((x, i) => {
        const h = [17, 23, 14][i];
        add(el("rect", { x, y: -h, width: 4, height: h + 3, class: "civi-hg-base" }));
      });
      return;
    }

    if (assetType === "tower_miniature") {
      add(el("rect", { x: -3, y: -22, width: 6, height: 25, class: "civi-hg-base" }));
      return;
    }

    if (assetType === "fortress_miniature") {
      add(el("rect", { x: -10, y: -8, width: 20, height: 11, class: "civi-hg-stone" }));
      add(el("rect", { x: 5, y: -14, width: 6, height: 8, class: "civi-hg-stone" }));
      return;
    }

    // Standard lett bygning/kloss. Fargen settes som data-ring, men bygget er rolig og rent.
    add(el("rect", { x: -7, y: -10, width: 14, height: 13, rx: 1, class: "civi-hg-base" }));
    add(el("polygon", { points: "-8,-10 0,-15 8,-10", class: "civi-hg-roof" }));
    add(el("rect", { x: -4.5, y: -7, width: 2.2, height: 2.2, class: "civi-hg-window" }));
    add(el("rect", { x: 2.3, y: -7, width: 2.2, height: 2.2, class: "civi-hg-window" }));
    add(el("circle", { cx: 0, cy: 4.5, r: 1.8, fill: color, class: "civi-hg-mini-ring" }));
  }

  function categoryColor(category) {
    const colors = {
      by: "#dcbf97", sport: "#86be8f", kunst: "#c5a0e8", litteratur: "#9fb5ce",
      musikk: "#e8a0c0", historie: "#d8b27a", natur: "#7fc08a", subkultur: "#b48ed8",
      politikk: "#f1ce91", vitenskap: "#83aede", media: "#a0c8d8", film: "#d0a0e0",
      film_tv: "#d0a0e0", popkultur: "#e0b0d0", psykologi: "#a8c0d0"
    };
    return colors[category] || "#cfcfcf";
  }

  function navigate(placeId) {
    window.location.href = `index.html#/place/${encodeURIComponent(placeId)}`;
  }

  function buildMiniature(place, cx, cy, scale) {
    const assetType = resolveAssetType(place);
    const g = node("g");
    g.setAttribute("class", "civi-hg-place-miniature");
    g.setAttribute("data-place-id", place.id);
    g.setAttribute("data-category", place.category);
    g.setAttribute("data-asset-type", assetType);
    g.setAttribute("role", "button");
    g.setAttribute("tabindex", "0");
    g.setAttribute("aria-label", place.name);
    g.setAttribute("transform", `translate(${cx.toFixed(1)},${cy.toFixed(1)}) scale(${scale.toFixed(3)})`);

    const title = node("title");
    title.textContent = place.name;
    g.appendChild(title);

    shape(g, assetType, place.category);

    g.addEventListener("click", (event) => {
      event.stopPropagation();
      navigate(place.id);
    });
    g.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.stopPropagation();
        navigate(place.id);
      }
    });
    return g;
  }

  function render() {
    const svg = svgEl();
    if (!svg) return;
    if (!_places) {
      ensureLoaded();
      return;
    }

    const layer = ensureLayer(svg);
    while (layer.firstChild) layer.removeChild(layer.firstChild);

    const h = host();
    const w = (h && h.clientWidth) || 960;
    const height = (h && h.clientHeight) || 640;
    const zoom = getZoom();
    const bucket = zoomBucket(zoom);
    _lastRenderedBucket = bucket;
    layer.setAttribute("data-civi-zoom-level", bucket);

    const scale = clamp(0.86 / Math.sqrt(zoom), 0.38, 0.9);
    visibleSet(_places, zoom).forEach((place) => {
      const projected = projectOsloLatLonToCiviXY(place);
      if (!projected) return;
      layer.appendChild(buildMiniature(place, projected.x * w, projected.y * height, scale));
    });
  }

  function scheduleRender() {
    if (_renderQueued) return;
    _renderQueued = true;
    requestAnimationFrame(() => {
      _renderQueued = false;
      render();
    });
  }

  function scheduleZoomRender() {
    const bucket = zoomBucket(getZoom());
    if (bucket === _lastRenderedBucket) return;
    clearTimeout(_zoomRenderTimer);
    _zoomRenderTimer = setTimeout(scheduleRender, 120);
  }

  function setPlaces(list) {
    const seen = new Set();
    const out = [];
    (list || []).forEach((raw) => {
      const place = normalize(raw);
      if (!place.id || seen.has(place.id)) return;
      if (!isOslo(place)) return;
      seen.add(place.id);
      out.push(place);
    });
    _places = out;
    scheduleRender();
  }

  function ensureLoaded() {
    if (_loadStarted) return;
    _loadStarted = true;

    const dataHub = window.DataHub;
    if (dataHub && typeof dataHub.loadPlacesBase === "function") {
      dataHub.loadPlacesBase({ cache: "default" })
        .then(setPlaces)
        .catch((error) => {
          console.warn("[CivicationHistoryGoPlaceLayer] loadPlacesBase feilet:", error && error.message || error);
          if (Array.isArray(window.PLACES)) setPlaces(window.PLACES);
          else {
            _places = [];
            scheduleRender();
          }
        });
      return;
    }

    if (Array.isArray(window.PLACES)) {
      setPlaces(window.PLACES);
      return;
    }

    console.warn("[CivicationHistoryGoPlaceLayer] DataHub.loadPlacesBase mangler og window.PLACES finnes ikke – tegner tomt lag.");
    _places = [];
    scheduleRender();
  }

  document.addEventListener("DOMContentLoaded", scheduleRender);
  ["civi:dataReady", "civi:booted", "civi:mapRendered", "resize", "storage"]
    .forEach((eventName) => window.addEventListener(eventName, scheduleRender));
  window.addEventListener("civi:mapZoomChanged", scheduleZoomRender);

  window.CivicationHistoryGoPlaceLayer = {
    render: scheduleRender,
    getPlaces: () => _places,
    projectOsloLatLonToCiviXY,
    resolveAssetType
  };
})();
