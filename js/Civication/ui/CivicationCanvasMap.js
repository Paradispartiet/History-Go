// CivicationCanvasMap.js
// Canvas-basert Civication-kartmotor.
// Tegner basekart + History Go-places på <canvas>, med egen smooth zoom/pan.
// Erstatter det tunge SVG-kartet når window.CIVICATION_CANVAS_MAP_ENABLED === true.
// Ingen eksterne biblioteker, ingen stedsnavn på places.
(function () {
  "use strict";

  if (window.CivicationCanvasMap) return;

  // ---------------------------------------------------------------------------
  // Konfig / konstanter
  // ---------------------------------------------------------------------------
  const OSLO_BOUNDS = { minLat: 59.80, maxLat: 60.02, minLon: 10.55, maxLon: 10.90 };
  const OSLO_FILTER = { minLat: 59.75, maxLat: 60.10, minLon: 10.45, maxLon: 11.00 };

  const LOW_ZOOM_LIMIT = 18;
  const MID_ZOOM_LIMIT = 45;
  const HIGH_ZOOM_LIMIT = 80;

  const ZOOM_STEP = 1.25;
  const MAX_DPR = 2;

  // ---------------------------------------------------------------------------
  // Transform-state (world-koordinater er normalisert 0–1)
  // ---------------------------------------------------------------------------
  const state = {
    zoom: 1,
    minZoom: 1,
    maxZoom: 7.5,
    cx: 0.5,
    cy: 0.5,
    panX: 0,
    panY: 0
  };

  let host = null;
  let baseCanvas = null;
  let placesCanvas = null;
  let baseCtx = null;
  let placesCtx = null;

  let W = 0;       // CSS-piksler
  let H = 0;       // CSS-piksler
  let dpr = 1;

  let _places = null;
  let _loadStarted = false;
  let _inited = false;
  let frameQueued = false;

  let hitTargets = [];
  let visiblePlaces = [];

  // Lyttere for transform-endringer (zoom/pan/resize). Andre kartlag (f.eks.
  // CivicationCityLayer) bruker disse + window-eventet civi:canvasMapTransformChanged
  // for å holde HTML-markører forankret i kartets eget koordinatsystem.
  const transformListeners = new Set();
  let transformEmitQueued = false;

  // ---------------------------------------------------------------------------
  // Småhjelpere
  // ---------------------------------------------------------------------------
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  const flagOn = () => window.CIVICATION_CANVAS_MAP_ENABLED === true;
  const inMapMode = () => document.body.classList.contains("civi-mapmode");

  function zoneIndex() {
    const idx = {};
    (window.CIVI_MAP_DISTRICTS || []).forEach((d) => { idx[d.id] = d; });
    return idx;
  }

  // ---------------------------------------------------------------------------
  // Projisering world<->screen
  // ---------------------------------------------------------------------------
  function worldToScreen(x, y) {
    return {
      x: (x - state.cx) * state.zoom * W + W / 2,
      y: (y - state.cy) * state.zoom * H + H / 2
    };
  }
  function screenToWorld(px, py) {
    return {
      x: (px - W / 2) / (state.zoom * W) + state.cx,
      y: (py - H / 2) / (state.zoom * H) + state.cy
    };
  }

  // ---------------------------------------------------------------------------
  // Stabilt projeksjons-API (Del A)
  // ---------------------------------------------------------------------------
  // Lar andre kartlag bruke NØYAKTIG samme projeksjon som canvas selv tegner med,
  // slik at steder, venner, hjem og sosiale møter forankres i kartets eget
  // koordinatsystem (ikke som overlay-prosenter). Endrer ikke hvordan canvas
  // tegnes – dette er lese-API på samme transform-state og samme place-løype.

  function getTransformState() {
    return { zoom: state.zoom, cx: state.cx, cy: state.cy, width: W, height: H };
  }

  function getViewportSize() {
    return { width: W, height: H };
  }

  // Er Canvas-kartet den aktive (tegnende) kartmotoren akkurat nå? Falsk når 3D
  // har tatt over (window.__civiThreeActive) eller før init/flag.
  function isActive() {
    return flagOn() && _inited && !window.__civiThreeActive;
  }

  // World-koordinat (normalisert 0–1) -> skjermpiksel. Samme matte som
  // worldToScreen som canvas-tegningen bruker. null ved ugyldig input/viewport.
  function projectWorldToScreen(x, y) {
    const nx = Number(x), ny = Number(y);
    if (!Number.isFinite(nx) || !Number.isFinite(ny)) return null;
    if (!W || !H) return null;
    return worldToScreen(nx, ny);
  }

  // World-koordinatene er allerede normaliserte 0–1, så normalisert == world her.
  const projectNormalizedToScreen = projectWorldToScreen;

  // Slå opp et place: enten et rå/normalisert place-objekt, eller en place-id
  // (matches mot de innlastede places). Returnerer normalisert form.
  function lookupPlace(placeOrId) {
    if (placeOrId && typeof placeOrId === "object") return normalize(placeOrId);
    const id = String(placeOrId == null ? "" : placeOrId);
    if (!id) return null;
    return (_places || []).find((p) => String(p.id) === id) || null;
  }

  // Place -> normalisert world-koordinat via SAMME løype som drawPlaces bruker
  // (manuell civiMap.x/y vinner, ellers kalibrert Oslo-projeksjon). null = mangler
  // koordinater (gjetter aldri).
  function projectPlaceToWorld(placeOrId) {
    const place = lookupPlace(placeOrId);
    if (!place) return null;
    return projectOsloLatLonToCiviXY(place);
  }

  // Place -> skjermpiksel (kombinerer projectPlaceToWorld + projectWorldToScreen).
  function projectPlaceToScreen(placeOrId) {
    const w = projectPlaceToWorld(placeOrId);
    if (!w) return null;
    const s = projectWorldToScreen(w.x, w.y);
    if (!s) return null;
    return { x: s.x, y: s.y, source: w.source };
  }

  function onTransformChanged(callback) {
    if (typeof callback === "function") transformListeners.add(callback);
  }
  function offTransformChanged(callback) {
    transformListeners.delete(callback);
  }

  // Dispatch ett ryddig transform-event etter at state er oppdatert. Coalesces
  // via rAF slik at zoom/pan-strømmer ikke spammer (maks ett pr. frame).
  function notifyTransformChanged() {
    const detail = getTransformState();
    transformListeners.forEach((cb) => { try { cb(detail); } catch (e) { /* lytter feilet */ } });
    try {
      window.dispatchEvent(new CustomEvent("civi:canvasMapTransformChanged", { detail }));
    } catch (e) { /* CustomEvent utilgjengelig */ }
  }
  function scheduleTransformEmit() {
    if (transformEmitQueued) return;
    transformEmitQueued = true;
    requestAnimationFrame(() => { transformEmitQueued = false; notifyTransformChanged(); });
  }

  // Kun for headless tester: sett transform/viewport uten et ekte canvas.
  function setTransformForTesting(t) {
    const o = t && typeof t === "object" ? t : {};
    if (Number.isFinite(o.zoom)) state.zoom = o.zoom;
    if (Number.isFinite(o.cx)) state.cx = o.cx;
    if (Number.isFinite(o.cy)) state.cy = o.cy;
    if (Number.isFinite(o.width)) W = o.width;
    if (Number.isFinite(o.height)) H = o.height;
    return getTransformState();
  }

  function clampPan() {
    const halfX = 0.5 / state.zoom;
    const halfY = 0.5 / state.zoom;
    state.cx = halfX >= 0.5 ? 0.5 : clamp(state.cx, halfX, 1 - halfX);
    state.cy = halfY >= 0.5 ? 0.5 : clamp(state.cy, halfY, 1 - halfY);
    state.panX = state.cx;
    state.panY = state.cy;
  }

  // ---------------------------------------------------------------------------
  // Canvas-oppsett
  // ---------------------------------------------------------------------------
  function ensureCanvases() {
    host = document.getElementById("civiMapWorld");
    if (!host) return false;

    host.classList.add("is-canvas-map");

    baseCanvas = document.getElementById("civiMapBaseCanvas");
    if (!baseCanvas) {
      baseCanvas = document.createElement("canvas");
      baseCanvas.id = "civiMapBaseCanvas";
      baseCanvas.className = "civi-map-canvas civi-map-base-canvas";
      host.insertBefore(baseCanvas, host.firstChild);
    }

    placesCanvas = document.getElementById("civiMapPlacesCanvas");
    if (!placesCanvas) {
      placesCanvas = document.createElement("canvas");
      placesCanvas.id = "civiMapPlacesCanvas";
      placesCanvas.className = "civi-map-canvas civi-map-places-canvas";
      // Places-canvas skal ligge over base-canvas.
      if (baseCanvas.nextSibling) host.insertBefore(placesCanvas, baseCanvas.nextSibling);
      else host.appendChild(placesCanvas);
    }

    baseCtx = baseCanvas.getContext("2d");
    placesCtx = placesCanvas.getContext("2d");
    return !!(baseCtx && placesCtx);
  }

  function resize() {
    if (!host || !baseCanvas || !placesCanvas) return;
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const rect = host.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width) || window.innerWidth || 960);
    H = Math.max(1, Math.round(rect.height) || window.innerHeight || 640);

    [baseCanvas, placesCanvas].forEach((c) => {
      c.width = Math.round(W * dpr);
      c.height = Math.round(H * dpr);
      c.style.width = W + "px";
      c.style.height = H + "px";
    });
    baseCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    placesCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    clampPan();
    scheduleFrame();
    scheduleTransformEmit();
  }

  // ---------------------------------------------------------------------------
  // Basekart-tegning
  // ---------------------------------------------------------------------------
  function fillPoly(ctx, pts, fill, stroke, lineWidth) {
    if (!pts || !pts.length) return;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const s = worldToScreen(p[0], p[1]);
      if (i) ctx.lineTo(s.x, s.y);
      else ctx.moveTo(s.x, s.y);
    });
    ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth || 1; ctx.lineJoin = "round"; ctx.stroke(); }
  }

  function strokePolyline(ctx, pts, stroke, lineWidth) {
    if (!pts || pts.length < 2) return;
    ctx.beginPath();
    pts.forEach((p, i) => {
      const s = worldToScreen(p[0], p[1]);
      if (i) ctx.lineTo(s.x, s.y);
      else ctx.moveTo(s.x, s.y);
    });
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth || 1;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  }

  function drawBaseLabel(ctx, text, x, y, sizePx) {
    const s = worldToScreen(x, y);
    ctx.save();
    ctx.font = `800 ${sizePx}px "Inter","Segoe UI",system-ui,-apple-system,sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = sizePx * 0.18;
    ctx.strokeText(text, s.x, s.y);
    ctx.fillStyle = "#e8f5ff";
    ctx.fillText(text, s.x, s.y);
    ctx.restore();
  }

  // Stiliserte Oslo-former (normaliserte 0–1-koordinater). Lette polygoner/
  // ellipser/linjer – ingen tunge gradients, skygger eller blur.
  const BYGDOY_PENINSULA = [[0.13,0.65],[0.27,0.62],[0.34,0.66],[0.33,0.74],[0.25,0.79],[0.16,0.77],[0.10,0.70]];
  const BJORVIKA_INLET = [[0.52,0.60],[0.61,0.60],[0.64,0.66],[0.60,0.73],[0.54,0.72],[0.50,0.66]];
  const AKERSHUS_POINT = [[0.47,0.61],[0.525,0.62],[0.545,0.66],[0.505,0.69],[0.455,0.67]];
  const FJORD_ISLANDS = [
    { id: "hovedoya",   rx: 0.032, ry: 0.018 },
    { id: "_lindoya",   x: 0.415, y: 0.800, rx: 0.024, ry: 0.013 },
    { id: "_gressholmen",x: 0.520, y: 0.815, rx: 0.028, ry: 0.015 },
    { id: "_nakkholmen", x: 0.395, y: 0.745, rx: 0.018, ry: 0.011 }
  ];

  function anchorXY(id) {
    const a = (window.CIVI_OSLO_GEO_ANCHORS || []).find((an) => an.id === id);
    return a ? { x: a.x, y: a.y } : null;
  }

  function fillEllipseWorld(ctx, cx, cy, rx, ry, fill, stroke, lineWidth) {
    const s = worldToScreen(cx, cy);
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, Math.max(0.5, rx * state.zoom * W), Math.max(0.5, ry * state.zoom * H), 0, 0, Math.PI * 2);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth || 1; ctx.stroke(); }
  }

  function drawBase() {
    const ctx = baseCtx;
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    const land = window.CIVI_OSLO_LANDSCAPE || {};

    // 1) Bakgrunn (dekker hele flaten uavhengig av transform).
    ctx.fillStyle = "#11171f";
    ctx.fillRect(0, 0, W, H);

    // 2) Fjord / vann – Oslofjorden sør og sørvest.
    if (land.fjord) fillPoly(ctx, land.fjord, "#27567a");
    if (land.innerFjordArm) fillPoly(ctx, land.innerFjordArm, "rgba(95,151,189,0.45)");
    // Bjørvika som innskåret vann/bykant.
    fillPoly(ctx, BJORVIKA_INLET, "#1f4a64");

    // 3) Øyer og halvøyer.
    fillPoly(ctx, BYGDOY_PENINSULA, "#3f6b46", "rgba(20,40,28,0.5)", 1);     // Bygdøy
    FJORD_ISLANDS.forEach((isl) => {
      const c = isl.x != null ? { x: isl.x, y: isl.y } : anchorXY(isl.id);
      if (c) fillEllipseWorld(ctx, c.x, c.y, isl.rx, isl.ry, "#4f7a52", "rgba(20,40,28,0.45)", 1);
    });

    // 4) Marka / åsrygger.
    if (land.markaNorth) fillPoly(ctx, land.markaNorth, "#2c4a35");
    if (land.ekebergRidge) fillPoly(ctx, land.ekebergRidge, "#456b4d");   // Ekebergåsen sørøst
    // Sognsvann i marka (lite vann).
    const sogn = anchorXY("sognsvann");
    if (sogn) fillEllipseWorld(ctx, sogn.x, sogn.y, 0.018, 0.012, "#2f5d7e");

    // 5) Bybassenget.
    if (land.cityBasin) fillPoly(ctx, land.cityBasin, "#25333f");

    // 6) Bydelsflater.
    (window.CIVI_MAP_DISTRICTS || [])
      .slice()
      .sort((a, b) => (a.visualWeight || 0) - (b.visualWeight || 0))
      .forEach((d) => {
        const st = d.style || {};
        fillPoly(ctx, d.shape, st.fill || "#cabda9", "rgba(255,255,255,0.10)", 1);
      });

    // 7) Hovedveier / korridorer (stiliserte linjer, ikke detaljert veinett).
    const idx = zoneIndex();
    (window.CIVI_OSLO_CORRIDORS || []).forEach((c) => {
      const ids = c.ring || [c.from, ...(c.via || []), c.to];
      const pts = ids.map((id) => idx[id] && idx[id].center).filter(Boolean);
      strokePolyline(ctx, pts, c.style === "ring" ? "rgba(246,234,208,0.22)" : "rgba(224,236,245,0.28)", c.style === "ring" ? 2.4 : 3);
    });
    // Enkel jernbaneakse fra Oslo S.
    const osloS = anchorXY("oslo_s");
    if (osloS) {
      ctx.save();
      ctx.setLineDash([6, 5]);
      strokePolyline(ctx, [[0.31, 0.585], [0.44, 0.583], [osloS.x, osloS.y], [0.66, 0.60], [0.80, 0.625]],
        "rgba(210,200,180,0.30)", 1.6);
      ctx.restore();
    }

    // 8) Akerselva.
    if (land.akerselva) {
      strokePolyline(ctx, land.akerselva, "rgba(222,244,255,0.28)", 9);
      strokePolyline(ctx, land.akerselva, "#7dc0df", 4.5);
    }

    // 9) Få landemerkeområder.
    fillPoly(ctx, AKERSHUS_POINT, "#7d7363", "rgba(40,34,26,0.55)", 1);     // Akershus festning
    const bjorvika = anchorXY("bjorvika");
    if (bjorvika) fillEllipseWorld(ctx, bjorvika.x, bjorvika.y, 0.02, 0.013, "rgba(120,150,180,0.35)");

    // Få faste basekart-labels (ikke place-navn).
    const labelScale = clamp(state.zoom, 0.8, 2.2);
    drawBaseLabel(ctx, "Fjorden", 0.57, 0.90, 18 * labelScale);
    drawBaseLabel(ctx, "Marka", 0.15, 0.10, 18 * labelScale);
  }

  // ---------------------------------------------------------------------------
  // History Go-places: lasting, filtrering, projisering, prioritet
  // ---------------------------------------------------------------------------
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
    // 1) Manuell plassering vinner alltid.
    if (typeof civiMap.x === "number" && typeof civiMap.y === "number" &&
        civiMap.x >= 0 && civiMap.x <= 1 && civiMap.y >= 0 && civiMap.y <= 1) {
      return { x: civiMap.x, y: civiMap.y, source: "manual" };
    }
    if (place.lat == null || place.lon == null) return null;

    // 2) Kalibrert Oslo-projeksjon (IDW over geo-ankere).
    const cal = window.CivicationOsloMapCalibration;
    if (cal && typeof cal.projectLatLonWithAnchors === "function") {
      try {
        const r = cal.projectLatLonWithAnchors(place.lat, place.lon);
        if (r) return { x: r.x, y: r.y, source: r.source || "calibrated" };
      } catch (e) { /* faller gjennom til bounding-box */ }
    }

    // 3) Fallback: gammel ren bounding-box-projeksjon.
    const x = clamp((place.lon - OSLO_BOUNDS.minLon) / (OSLO_BOUNDS.maxLon - OSLO_BOUNDS.minLon), 0.04, 0.96);
    const rawY = 1 - ((place.lat - OSLO_BOUNDS.minLat) / (OSLO_BOUNDS.maxLat - OSLO_BOUNDS.minLat));
    const y = clamp(0.18 + rawY * 0.74, 0.08, 0.94);
    return { x, y, source: "fallback" };
  }

  function resolveAssetType(place) {
    const civiMap = place.civiMap || {};
    const explicit = String(civiMap.assetType || place.raw.mapAssetType || "").trim().toLowerCase();
    const hay = `${place.id || ""} ${place.name || ""}`.toLowerCase();

    if (/barcode|skyline/.test(explicit + " " + hay)) return "skyline";
    if (/rådhus|radhus|storting|parlament|parliament|civic/.test(explicit + " " + hay)) return "civic";
    if (/stadion|arena|stadium/.test(explicit + " " + hay)) return "stadium";
    if (/museum|galleri/.test(hay)) return "museum";
    if (/bibliotek|library/.test(hay)) return "library";
    if (/opera|teater|theatre|theater|scene|konserthus|kino|klubb|venue/.test(hay)) return "theatre";
    if (/stasjon|t-bane|jernbane|holdeplass|station|rail/.test(hay)) return "station";
    if (/kirke|kapell|domkirke|church/.test(hay)) return "church";
    if (/festning|slott|borg|skanse|fortress/.test(hay)) return "fortress";
    if (/skate|rullebrett/.test(hay)) return "street";
    if (/brygge|havn|kai|fjord|vann|dam|tjern|port|harbor|harbour|waterfront/.test(hay)) return "waterfront";
    if (/park|hage|skog|mark|lund|ås/.test(hay)) return "park";
    if (/gate|street|torg|plass/.test(hay)) return "street";

    switch (String(place.category || "").toLowerCase()) {
      case "sport": return "stadium";
      case "kunst": return "museum";
      case "litteratur": return "library";
      case "musikk":
      case "film":
      case "film_tv":
      case "popkultur": return "theatre";
      case "natur": return "park";
      case "politikk":
      case "media": return "civic";
      default: return "default";
    }
  }

  function priorityOf(place) {
    const cm = place.civiMap || {};
    if (typeof cm.priority === "number") return cm.priority;

    const hay = `${place.id || ""} ${place.name || ""}`.toLowerCase();
    const asset = resolveAssetType(place);
    let score = 0;
    if (asset === "stadium" || asset === "skyline" || asset === "civic") score += 6;
    if (/sentrum|oslo_s|bjorvika|bjørvika|barcode|aker_brygge|akershus|bislett|national|storting|radhus|rådhus/.test(hay)) score += 4;
    if (place.raw.frontImage || place.raw.cardImage) score += 2;
    if (place.raw.quiz_profile) score += 1;
    return score;
  }

  function zoomBucket(zoom) {
    if (zoom > 2.2) return "high";
    if (zoom > 1.4) return "mid";
    return "low";
  }

  function visibleSet(places, zoom) {
    const sorted = places.slice().sort((a, b) => priorityOf(b) - priorityOf(a));
    const bucket = zoomBucket(zoom);
    let limit = LOW_ZOOM_LIMIT;
    if (bucket === "high") limit = HIGH_ZOOM_LIMIT;
    else if (bucket === "mid") limit = MID_ZOOM_LIMIT;
    return sorted.slice(0, Math.min(sorted.length, limit));
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

  // ---------------------------------------------------------------------------
  // Places-tegning (enkle, raske former – ingen tekst, ingen tunge skygger)
  // ---------------------------------------------------------------------------
  function ellipse(ctx, cx, cy, rx, ry, fill) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
  }
  function box(ctx, x, y, w, h, fill, stroke) {
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, w, h);
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 0.6; ctx.strokeRect(x, y, w, h); }
  }

  function drawMiniature(ctx, sx, sy, scale, assetType, category) {
    const accent = categoryColor(category);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.scale(scale, scale);

    // Lett markør-skygge (kun én pr. place).
    ellipse(ctx, 0, 4, 8, 3, "rgba(0,0,0,0.26)");

    if (assetType === "stadium") {
      ellipse(ctx, 0, -1, 12, 7, "#9aa0a4");
      ellipse(ctx, 0, -1, 8, 4, "#5fa36a");
      ctx.restore();
      return;
    }
    if (assetType === "park") {
      ellipse(ctx, 0, 0, 10, 5, "#6aa66f");
      ellipse(ctx, -3, -6, 3, 3, "#4f8a55");
      ellipse(ctx, 5, -4, 2.4, 2.4, "#4f8a55");
      ctx.restore();
      return;
    }
    if (assetType === "waterfront") {
      box(ctx, -11, 0, 22, 5, "#3d7299");
      box(ctx, -9, -3, 18, 3, "#8a7d68");
      box(ctx, 3, -10, 7, 8, "#c9b79c", "#6f5a44");
      ctx.restore();
      return;
    }
    if (assetType === "street") {
      box(ctx, -11, -3, 22, 7, "#6e6f73");
      ctx.restore();
      return;
    }
    if (assetType === "skyline") {
      [-7, -2, 3].forEach((x, i) => {
        const h = [17, 23, 14][i];
        box(ctx, x, -h, 4, h + 3, "#c9b79c", "#6f5a44");
      });
      ctx.restore();
      return;
    }
    if (assetType === "fortress") {
      box(ctx, -10, -8, 20, 11, "#9aa0a4", "#5b6064");
      box(ctx, 5, -14, 6, 8, "#9aa0a4", "#5b6064");
      ctx.restore();
      return;
    }
    if (assetType === "civic") {
      box(ctx, -10, -12, 20, 15, "#bfb6a6", "#5a5044");
      // lite tak/gesims
      ctx.beginPath();
      ctx.moveTo(-11, -12); ctx.lineTo(0, -17); ctx.lineTo(11, -12); ctx.closePath();
      ctx.fillStyle = "#6f6357"; ctx.fill();
      ellipse(ctx, 0, 5, 2, 2, accent);
      ctx.restore();
      return;
    }
    if (assetType === "museum" || assetType === "library" || assetType === "theatre") {
      box(ctx, -9, -11, 18, 14, "#c9b79c", "#6f5a44");
      // flatt/tempel-tak
      ctx.beginPath();
      ctx.moveTo(-10, -11); ctx.lineTo(0, -16); ctx.lineTo(10, -11); ctx.closePath();
      ctx.fillStyle = "#7d5b46"; ctx.fill();
      box(ctx, -5, -8, 2.4, 2.4, "#cfe6f5");
      box(ctx, 2.6, -8, 2.4, 2.4, "#cfe6f5");
      ellipse(ctx, 0, 5, 1.8, 1.8, accent);
      ctx.restore();
      return;
    }
    if (assetType === "station") {
      box(ctx, -11, -7, 22, 10, "#8a96a0", "#4f5760");
      ctx.beginPath();
      ctx.moveTo(-12, -7); ctx.quadraticCurveTo(0, -14, 12, -7);
      ctx.lineTo(12, -5); ctx.lineTo(-12, -5); ctx.closePath();
      ctx.fillStyle = "#5e6b74"; ctx.fill();
      ctx.restore();
      return;
    }
    if (assetType === "church") {
      box(ctx, -6, -10, 12, 13, "#c9b79c", "#6f5a44");
      box(ctx, -1.5, -20, 3, 10, "#a8957a", "#6f5a44");
      ctx.beginPath();
      ctx.moveTo(-2.5, -20); ctx.lineTo(0, -25); ctx.lineTo(2.5, -20); ctx.closePath();
      ctx.fillStyle = "#7d5b46"; ctx.fill();
      ctx.restore();
      return;
    }

    // Default: liten kloss/hus med tak + vinduer + kategori-ring.
    box(ctx, -7, -10, 14, 13, "#c9b79c", "#6f5a44");
    ctx.beginPath();
    ctx.moveTo(-8, -10); ctx.lineTo(0, -15); ctx.lineTo(8, -10); ctx.closePath();
    ctx.fillStyle = "#7d5b46"; ctx.fill();
    box(ctx, -4.5, -7, 2.2, 2.2, "#cfe6f5");
    box(ctx, 2.3, -7, 2.2, 2.2, "#cfe6f5");
    ellipse(ctx, 0, 4.5, 1.8, 1.8, accent);
    ctx.restore();
  }

  function placeScale() {
    // Litt mindre ved lav zoom, litt større ved høy zoom – forankret i landskapet.
    return clamp(0.52 + state.zoom * 0.13, 0.52, 1.7);
  }

  function drawPlaces() {
    const ctx = placesCtx;
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    hitTargets = [];
    visiblePlaces = [];
    if (!_places || !_places.length) return;

    const scale = placeScale();
    const radius = 14 * scale;
    const list = visibleSet(_places, state.zoom);

    list.forEach((place) => {
      const projected = projectOsloLatLonToCiviXY(place);
      if (!projected) return;
      const s = worldToScreen(projected.x, projected.y);
      // Hopp over de som er godt utenfor synlig flate (lett kulling).
      if (s.x < -40 || s.x > W + 40 || s.y < -50 || s.y > H + 50) return;

      const assetType = resolveAssetType(place);
      drawMiniature(ctx, s.x, s.y, scale, assetType, place.category);

      visiblePlaces.push(place);
      hitTargets.push({ id: place.id, x: s.x, y: s.y, radius, place });
    });
  }

  // ---------------------------------------------------------------------------
  // Render-løkke (én frame pr. rAF)
  // ---------------------------------------------------------------------------
  function drawFrame() {
    frameQueued = false;
    if (window.__civiThreeActive) return; // 3D-kartet tegner; ikke mal skjult Canvas
    if (!baseCtx || !placesCtx) return;
    drawBase();
    drawPlaces();
  }

  function scheduleFrame() {
    if (frameQueued) return;
    frameQueued = true;
    requestAnimationFrame(drawFrame);
  }

  // ---------------------------------------------------------------------------
  // Datainnlasting
  // ---------------------------------------------------------------------------
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
    scheduleFrame();
  }

  function ensureLoaded() {
    if (_loadStarted) return;
    _loadStarted = true;

    const dataHub = window.DataHub;
    if (dataHub && typeof dataHub.loadPlacesBase === "function") {
      dataHub.loadPlacesBase({ cache: "default" })
        .then(setPlaces)
        .catch((error) => {
          console.warn("[CivicationCanvasMap] loadPlacesBase feilet:", (error && error.message) || error);
          if (Array.isArray(window.PLACES)) setPlaces(window.PLACES);
          else { _places = []; scheduleFrame(); }
        });
      return;
    }

    if (Array.isArray(window.PLACES)) { setPlaces(window.PLACES); return; }

    console.warn("[CivicationCanvasMap] DataHub.loadPlacesBase mangler og window.PLACES finnes ikke – tegner tomt place-lag.");
    _places = [];
    scheduleFrame();
  }

  // ---------------------------------------------------------------------------
  // Zoom / pan
  // ---------------------------------------------------------------------------
  function zoomAt(newZoom, px, py) {
    const z = clamp(newZoom, state.minZoom, state.maxZoom);
    if (Math.abs(z - state.zoom) < 0.0005) return;
    const wp = screenToWorld(px, py);
    state.zoom = z;
    state.cx = wp.x - (px - W / 2) / (z * W);
    state.cy = wp.y - (py - H / 2) / (z * H);
    clampPan();
    scheduleFrame();
    scheduleTransformEmit();
  }

  function panBy(dxPx, dyPx) {
    if (!W || !H) return;
    state.cx -= dxPx / (state.zoom * W);
    state.cy -= dyPx / (state.zoom * H);
    clampPan();
    scheduleFrame();
    scheduleTransformEmit();
  }

  function zoomIn() { zoomAt(state.zoom * ZOOM_STEP, W / 2, H / 2); }
  function zoomOut() { zoomAt(state.zoom / ZOOM_STEP, W / 2, H / 2); }
  function reset() { state.zoom = 1; state.cx = 0.5; state.cy = 0.5; clampPan(); scheduleFrame(); scheduleTransformEmit(); }
  function getZoom() { return state.zoom; }

  // ---------------------------------------------------------------------------
  // Pointer-håndtering (pan, pinch, tap->navigasjon)
  // ---------------------------------------------------------------------------
  const pointers = new Map();
  let pinchPrev = null;
  let panPrev = null;
  let downPt = null;
  let moved = false;

  function relPos(e) {
    const r = host.getBoundingClientRect();
    return {
      px: clamp(e.clientX - r.left, 0, W),
      py: clamp(e.clientY - r.top, 0, H)
    };
  }

  function pinchState() {
    const pts = [...pointers.values()];
    const dx = pts[0].x - pts[1].x;
    const dy = pts[0].y - pts[1].y;
    const dist = Math.hypot(dx, dy) || 1;
    const r = host.getBoundingClientRect();
    return {
      dist,
      px: clamp((pts[0].x + pts[1].x) / 2 - r.left, 0, W),
      py: clamp((pts[0].y + pts[1].y) / 2 - r.top, 0, H)
    };
  }

  function ignoreTarget(target) {
    return !!(target && target.closest && target.closest(
      ".civi-map-zoom-controls, .civi-system-hud, .civi-system-panel, .civi-system-close, .civi-zone-node, .civi-map-legend"
    ));
  }

  function onPointerDown(e) {
    if (window.__civiThreeActive) return; // 3D-kartet er aktivt; Canvas er fallback
    if (!flagOn() || !inMapMode()) return;
    if (ignoreTarget(e.target)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      panPrev = { x: e.clientX, y: e.clientY };
      downPt = { x: e.clientX, y: e.clientY };
      moved = false;
    } else if (pointers.size === 2) {
      panPrev = null;
      pinchPrev = pinchState();
    }
  }

  function onPointerMove(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.size >= 2) {
      const now = pinchState();
      if (pinchPrev) {
        e.preventDefault();
        const ratio = now.dist / pinchPrev.dist;
        if (ratio && Number.isFinite(ratio)) zoomAt(state.zoom * ratio, now.px, now.py);
      }
      pinchPrev = now;
      moved = true;
      return;
    }

    if (panPrev) {
      const dx = e.clientX - panPrev.x;
      const dy = e.clientY - panPrev.y;
      if (Math.hypot(dx, dy) > 2) moved = true;
      e.preventDefault();
      panBy(dx, dy);
      panPrev = { x: e.clientX, y: e.clientY };
    }
  }

  function onPointerUp(e) {
    const wasSingle = pointers.size === 1;
    const start = downPt;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchPrev = null;

    if (pointers.size === 1) {
      const p = [...pointers.values()][0];
      panPrev = { x: p.x, y: p.y };
    } else if (pointers.size === 0) {
      panPrev = null;
      if (wasSingle && start && !moved && flagOn() && inMapMode()) {
        handleTap(e);
      }
      downPt = null;
      moved = false;
    }
  }

  function handleTap(e) {
    const { px, py } = relPos(e);
    let best = null;
    let bestDist = Infinity;
    hitTargets.forEach((t) => {
      const d = Math.hypot(px - t.x, py - t.y);
      if (d <= t.radius && d < bestDist) { best = t; bestDist = d; }
    });
    if (best && best.place && best.place.id) {
      openHistoryGoPlaceMenu(best.place);
    }
  }

  function openHistoryGoPlaceMenu(place) {
    const menu = window.CivicationHistoryGoPlaceLayer;
    if (menu && typeof menu.openPlaceMenu === "function") {
      menu.openPlaceMenu(place);
      return;
    }
    if (place && place.id != null) window.location.href = `index.html#/place/${encodeURIComponent(place.id)}`;
  }

  function onWheel(e) {
    if (window.__civiThreeActive) return; // 3D-kartet er aktivt; Canvas er fallback
    if (!flagOn() || !inMapMode()) return;
    e.preventDefault();
    const { px, py } = relPos(e);
    const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
    zoomAt(state.zoom * factor, px, py);
  }

  // ---------------------------------------------------------------------------
  // Zoomkontroller (egne for canvas-kartet)
  // ---------------------------------------------------------------------------
  function ensureControls() {
    if (!host || host.querySelector(".civi-map-zoom-controls")) return;
    const box = document.createElement("div");
    box.className = "civi-map-zoom-controls";
    box.innerHTML =
      '<button type="button" class="civi-map-zoom-btn" data-civi-canvas-zoom-in aria-label="Zoom inn">+</button>' +
      '<button type="button" class="civi-map-zoom-btn" data-civi-canvas-zoom-reset aria-label="Nullstill zoom">⤢</button>' +
      '<button type="button" class="civi-map-zoom-btn" data-civi-canvas-zoom-out aria-label="Zoom ut">−</button>';
    box.querySelector("[data-civi-canvas-zoom-in]").addEventListener("click", (e) => { e.preventDefault(); zoomIn(); });
    box.querySelector("[data-civi-canvas-zoom-out]").addEventListener("click", (e) => { e.preventDefault(); zoomOut(); });
    box.querySelector("[data-civi-canvas-zoom-reset]").addEventListener("click", (e) => { e.preventDefault(); reset(); });
    host.appendChild(box);
  }

  function bindEvents() {
    host.addEventListener("wheel", onWheel, { passive: false });
    host.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  }

  // ---------------------------------------------------------------------------
  // Init / render
  // ---------------------------------------------------------------------------
  function init() {
    if (!flagOn()) return;
    if (_inited) { resize(); return; }
    if (!ensureCanvases()) return;
    _inited = true;
    console.info("[CivicationCanvasMap] Canvas map active");
    ensureControls();
    bindEvents();
    resize();
    ensureLoaded();
    scheduleFrame();
  }

  function render() {
    if (!flagOn()) return;
    if (!_inited) { init(); return; }
    scheduleFrame();
  }

  // Resize/redraw på relevante hendelser.
  window.addEventListener("resize", () => { if (_inited) resize(); });
  window.addEventListener("orientationchange", () => setTimeout(() => { if (_inited) resize(); }, 120));
  document.addEventListener("DOMContentLoaded", init);
  ["civi:booted", "civi:dataReady"].forEach((ev) => window.addEventListener(ev, () => {
    init();
    if (_inited) resize();
  }));
  // Tegn på nytt når kartmodus åpnes (knappen toggler body.civi-mapmode).
  document.getElementById("btnCiviMap")?.addEventListener("click", () => setTimeout(render, 30));

  // Hvis dokumentet allerede er lastet (script kjøres sent).
  if (document.readyState !== "loading") init();

  // ---------------------------------------------------------------------------
  // Debug for plassering
  // ---------------------------------------------------------------------------
  function getCalibrationAnchors() {
    const cal = window.CivicationOsloMapCalibration;
    if (cal && typeof cal.getAnchors === "function") return cal.getAnchors();
    return (window.CIVI_OSLO_GEO_ANCHORS || []).slice();
  }

  function getProjectionDebug(placeId) {
    const id = String(placeId == null ? "" : placeId);
    const place = (_places || []).find((p) => String(p.id) === id);
    if (!place) return { id, found: false };

    const civiMap = place.civiMap || {};
    const manual = typeof civiMap.x === "number" && typeof civiMap.y === "number" &&
      civiMap.x >= 0 && civiMap.x <= 1 && civiMap.y >= 0 && civiMap.y <= 1;

    const cal = window.CivicationOsloMapCalibration;
    let detail = null;
    if (!manual && place.lat != null && place.lon != null && cal && typeof cal.projectDetailed === "function") {
      try { detail = cal.projectDetailed(place.lat, place.lon); } catch (e) { detail = null; }
    }

    const projected = projectOsloLatLonToCiviXY(place);
    return {
      id: place.id,
      name: place.name,
      found: true,
      lat: place.lat,
      lon: place.lon,
      source: projected ? projected.source : null,
      baseline: detail ? detail.baseline : (cal && cal.projectLatLonBoundingBox && place.lat != null ? cal.projectLatLonBoundingBox(place.lat, place.lon) : null),
      calibrated: detail ? { x: detail.x, y: detail.y } : null,
      final: projected ? { x: projected.x, y: projected.y } : null,
      nearestAnchors: detail ? detail.nearest : (manual ? [] : null)
    };
  }

  window.CivicationCanvasMap = {
    init,
    render,
    reset,
    zoomIn,
    zoomOut,
    getZoom,
    getVisiblePlaces: () => visiblePlaces.slice(),
    getHitTargets: () => hitTargets.slice(),
    getProjectionDebug,
    getCalibrationAnchors,
    // Stabilt projeksjons-API (Del A) – samme projeksjon som canvas tegner med.
    projectWorldToScreen,
    projectNormalizedToScreen,
    projectPlaceToWorld,
    projectPlaceToScreen,
    getTransformState,
    getViewportSize,
    isActive,
    onTransformChanged,
    offTransformChanged,
    setTransformForTesting
  };
})();
