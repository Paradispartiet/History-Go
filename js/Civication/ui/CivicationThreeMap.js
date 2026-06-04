// CivicationThreeMap.js
// 3D-miniatyr-/dioramakart for Civication (WebGL via Three.js).
//
// Mål: et stilisert «bordmodell»-Oslo med ekstruderte bydeler og små
// bygningsklosser, lett tilt og myk zoom/pan – ikke et ekte satellittkart.
//
// Robusthet:
// - Three.js lastes via dynamisk import() fra CDN (pinnet versjon).
// - Tar bare over når WebGL + biblioteket lastes OK. Ved enhver feil/offline
//   forblir det 2D Canvas-kartet aktivt som fallback (ingen blank skjerm).
// - Gjenbruker samme datakilde (DataHub), Oslo-filter og kalibrerte projeksjon
//   som Canvas-motoren, slik at places havner på samme stiliserte Oslo.
//
// Aktiveres når window.CIVICATION_THREE_MAP_ENABLED === true.
(function () {
  "use strict";

  if (window.CivicationThreeMap) return;

  const THREE_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

  // ---------------------------------------------------------------------------
  // Konfig
  // ---------------------------------------------------------------------------
  const OSLO_FILTER = { minLat: 59.75, maxLat: 60.10, minLon: 10.45, maxLon: 11.00 };

  const LOW_ZOOM_LIMIT = 18;
  const MID_ZOOM_LIMIT = 45;
  const HIGH_ZOOM_LIMIT = 80;

  // Verdensmål: normalisert 0–1 mappes inn på et brett på MAP_W x MAP_D enheter.
  const MAP_W = 20;
  const MAP_D = 20;

  const VIEW = 11;           // ortografisk halv-høyde ved zoom = 1
  const MIN_ZOOM = 0.7;
  const MAX_ZOOM = 6.0;
  const ZOOM_STEP = 1.22;
  const MAX_DPR = 2;

  // Kamera-basis (gir ca. 52° tilt – diorama-vinkel).
  const CAM_BASE = { x: 0, y: 18, z: 14 };
  const TILT = Math.atan2(CAM_BASE.y, CAM_BASE.z); // radianer

  // ---------------------------------------------------------------------------
  // Tilstand
  // ---------------------------------------------------------------------------
  let THREE = null;
  let host = null;
  let renderer = null;
  let scene = null;
  let camera = null;
  let raycaster = null;
  let placeGroup = null;

  let W = 0, H = 0;
  let zoom = 1;
  let panX = 0, panZ = 0;
  let active = false;
  let dirty = true;
  let rafId = 0;

  let _places = null;
  let _loadStarted = false;
  let _lastBucket = null;
  let hitTargets = [];

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };
  const inMapMode = () => document.body.classList.contains("civi-mapmode");

  // Normalisert (0–1) -> verdenskoordinater på bakkeplanet (XZ).
  const nx2x = (nx) => (nx - 0.5) * MAP_W;
  const ny2z = (ny) => (ny - 0.5) * MAP_D;

  // ---------------------------------------------------------------------------
  // Data: lasting, filtrering, projeksjon (gjenbruker kalibreringen)
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
  function inBox(p, b) {
    return p.lat != null && p.lon != null &&
      p.lat >= b.minLat && p.lat <= b.maxLat && p.lon >= b.minLon && p.lon <= b.maxLon;
  }
  function isOslo(p) {
    if (inBox(p, OSLO_FILTER)) return true;
    const cm = p.civiMap || {};
    if (String(cm.region || "").toLowerCase() === "oslo") return true;
    if (String(p.raw.city || "").toLowerCase() === "oslo") return true;
    return false;
  }
  function project(p) {
    const cm = p.civiMap || {};
    if (typeof cm.x === "number" && typeof cm.y === "number" &&
        cm.x >= 0 && cm.x <= 1 && cm.y >= 0 && cm.y <= 1) {
      return { x: cm.x, y: cm.y };
    }
    if (p.lat == null || p.lon == null) return null;
    const cal = window.CivicationOsloMapCalibration;
    if (cal && typeof cal.projectLatLonWithAnchors === "function") {
      const r = cal.projectLatLonWithAnchors(p.lat, p.lon);
      if (r) return { x: r.x, y: r.y };
    }
    return null;
  }

  function resolveAssetType(p) {
    const cm = p.civiMap || {};
    const explicit = String(cm.assetType || p.raw.mapAssetType || "").trim().toLowerCase();
    const hay = `${p.id || ""} ${p.name || ""}`.toLowerCase();
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
    switch (String(p.category || "").toLowerCase()) {
      case "sport": return "stadium";
      case "kunst": return "museum";
      case "litteratur": return "library";
      case "musikk": case "film": case "film_tv": case "popkultur": return "theatre";
      case "natur": return "park";
      case "politikk": case "media": return "civic";
      default: return "default";
    }
  }
  function priorityOf(p) {
    const cm = p.civiMap || {};
    if (typeof cm.priority === "number") return cm.priority;
    const hay = `${p.id || ""} ${p.name || ""}`.toLowerCase();
    const asset = resolveAssetType(p);
    let s = 0;
    if (asset === "stadium" || asset === "skyline" || asset === "civic") s += 6;
    if (/sentrum|oslo_s|bjorvika|bjørvika|barcode|aker_brygge|akershus|bislett|national|storting|radhus|rådhus/.test(hay)) s += 4;
    if (p.raw.frontImage || p.raw.cardImage) s += 2;
    if (p.raw.quiz_profile) s += 1;
    return s;
  }
  function categoryColor(category) {
    const colors = {
      by: 0xdcbf97, sport: 0x86be8f, kunst: 0xc5a0e8, litteratur: 0x9fb5ce,
      musikk: 0xe8a0c0, historie: 0xd8b27a, natur: 0x7fc08a, subkultur: 0xb48ed8,
      politikk: 0xf1ce91, vitenskap: 0x83aede, media: 0xa0c8d8, film: 0xd0a0e0,
      film_tv: 0xd0a0e0, popkultur: 0xe0b0d0, psykologi: 0xa8c0d0
    };
    return colors[category] != null ? colors[category] : 0xcfcfcf;
  }

  function zoomBucket(z) {
    if (z > 2.6) return "high";
    if (z > 1.4) return "mid";
    return "low";
  }
  function visibleSet(places, z) {
    const sorted = places.slice().sort((a, b) => priorityOf(b) - priorityOf(a));
    const bucket = zoomBucket(z);
    let limit = LOW_ZOOM_LIMIT;
    if (bucket === "high") limit = HIGH_ZOOM_LIMIT;
    else if (bucket === "mid") limit = MID_ZOOM_LIMIT;
    return sorted.slice(0, Math.min(sorted.length, limit));
  }

  function setPlaces(list) {
    const seen = new Set();
    const out = [];
    (list || []).forEach((raw) => {
      const p = normalize(raw);
      if (!p.id || seen.has(p.id)) return;
      if (!isOslo(p)) return;
      seen.add(p.id);
      out.push(p);
    });
    _places = out;
    _lastBucket = null;
    rebuildPlaces();
  }
  function ensureLoaded() {
    if (_loadStarted) return;
    _loadStarted = true;
    const dataHub = window.DataHub;
    if (dataHub && typeof dataHub.loadPlacesBase === "function") {
      dataHub.loadPlacesBase({ cache: "default" })
        .then(setPlaces)
        .catch((e) => {
          console.warn("[CivicationThreeMap] loadPlacesBase feilet:", (e && e.message) || e);
          if (Array.isArray(window.PLACES)) setPlaces(window.PLACES);
        });
      return;
    }
    if (Array.isArray(window.PLACES)) setPlaces(window.PLACES);
  }

  // ---------------------------------------------------------------------------
  // Scene-bygging
  // ---------------------------------------------------------------------------
  function mat(color, opts) {
    return new THREE.MeshLambertMaterial(Object.assign({ color: new THREE.Color(color) }, opts || {}));
  }

  // Ekstruder et normalisert polygon (liste av [nx,ny]) til en lav blokk.
  function extrudeShape(points, height, color, yBase) {
    const shape = new THREE.Shape();
    points.forEach((pt, i) => {
      // shape-y -> -worldZ etter rotateX(-90), så vi mater inn -ny2z(py).
      const sx = nx2x(pt[0]);
      const sy = -ny2z(pt[1]);
      if (i) shape.lineTo(sx, sy); else shape.moveTo(sx, sy);
    });
    const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2); // legg flatt i XZ, ekstruder oppover (+Y)
    const mesh = new THREE.Mesh(geo, mat(color));
    mesh.position.y = yBase || 0;
    return mesh;
  }

  function buildBoard() {
    // Hevet brett / «modellplate».
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(MAP_W + 2.4, 0.8, MAP_D + 2.4),
      mat(0x12161d)
    );
    board.position.y = -0.45;
    scene.add(board);

    // Vannflate (fjord) som tynt blått dekke litt under bakken.
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(MAP_W + 2.4, MAP_D + 2.4),
      mat(0x27567a)
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.02;
    scene.add(water);
  }

  function buildLandscape() {
    const land = window.CIVI_OSLO_LANDSCAPE || {};
    // Marka/terreng og åsrygger som lave grønne flater.
    if (land.markaNorth) scene.add(extrudeShape(land.markaNorth, 0.25, 0x2c4a35, 0));
    if (land.ekebergRidge) scene.add(extrudeShape(land.ekebergRidge, 0.45, 0x456b4d, 0));
    if (land.cityBasin) scene.add(extrudeShape(land.cityBasin, 0.12, 0x25333f, 0));

    // Bygdøy-halvøy.
    const BYGDOY = [[0.13,0.65],[0.27,0.62],[0.34,0.66],[0.33,0.74],[0.25,0.79],[0.16,0.77],[0.10,0.70]];
    scene.add(extrudeShape(BYGDOY, 0.22, 0x3f6b46, 0));

    // Bydelsflater som litt høyere blokker.
    (window.CIVI_MAP_DISTRICTS || []).forEach((d) => {
      const fill = (d.style && d.style.fill) || "#cabda9";
      scene.add(extrudeShape(d.shape, 0.35, new THREE.Color(fill).getHex(), 0.12));
    });
  }

  function buildLights() {
    scene.add(new THREE.HemisphereLight(0xbcd3e6, 0x2a2f25, 0.95));
    const sun = new THREE.DirectionalLight(0xfff1dd, 1.05);
    sun.position.set(-8, 14, 6); // konsekvent lys oppe-til-venstre
    scene.add(sun);
  }

  // Geometri/høyde per asset-type for place-klossene.
  function placeMeshFor(p) {
    const asset = resolveAssetType(p);
    const accent = categoryColor(p.category);
    let geo, color = accent, h;

    if (asset === "skyline") { h = 1.5; geo = new THREE.BoxGeometry(0.34, h, 0.34); }
    else if (asset === "civic") { h = 0.95; geo = new THREE.BoxGeometry(0.62, h, 0.62); }
    else if (asset === "fortress") { h = 0.7; geo = new THREE.BoxGeometry(0.6, h, 0.6); color = 0x9aa0a4; }
    else if (asset === "station") { h = 0.5; geo = new THREE.BoxGeometry(0.7, h, 0.45); color = 0x8a96a0; }
    else if (asset === "museum" || asset === "library" || asset === "theatre") { h = 0.8; geo = new THREE.BoxGeometry(0.56, h, 0.5); }
    else if (asset === "church") { h = 1.1; geo = new THREE.CylinderGeometry(0.16, 0.22, h, 6); }
    else if (asset === "stadium") { h = 0.32; geo = new THREE.CylinderGeometry(0.42, 0.42, h, 16); color = 0x5fa36a; }
    else if (asset === "park") { h = 0.16; geo = new THREE.CylinderGeometry(0.4, 0.4, h, 12); color = 0x6aa66f; }
    else if (asset === "waterfront") { h = 0.34; geo = new THREE.BoxGeometry(0.66, h, 0.32); color = 0x3d7299; }
    else if (asset === "street") { h = 0.12; geo = new THREE.BoxGeometry(0.6, h, 0.24); color = 0x6e6f73; }
    else { h = 0.6; geo = new THREE.BoxGeometry(0.44, h, 0.44); }

    const mesh = new THREE.Mesh(geo, mat(color));
    mesh.userData = { placeId: p.id, h };
    return mesh;
  }

  function rebuildPlaces() {
    if (!scene || !THREE) return;
    if (!placeGroup) { placeGroup = new THREE.Group(); scene.add(placeGroup); }
    // Rydd
    for (let i = placeGroup.children.length - 1; i >= 0; i--) {
      const m = placeGroup.children[i];
      placeGroup.remove(m);
      if (m.geometry) m.geometry.dispose();
      if (m.material) m.material.dispose();
    }
    hitTargets = [];
    if (!_places) return;

    _lastBucket = zoomBucket(zoom);
    visibleSet(_places, zoom).forEach((p) => {
      const proj = project(p);
      if (!proj) return;
      const mesh = placeMeshFor(p);
      mesh.position.set(nx2x(proj.x), 0.12 + mesh.userData.h / 2, ny2z(proj.y));
      placeGroup.add(mesh);
      hitTargets.push({ id: p.id, place: p });
    });
    dirty = true;
  }

  // ---------------------------------------------------------------------------
  // Kamera / render
  // ---------------------------------------------------------------------------
  function updateCamera() {
    const aspect = W / H || 1;
    camera.left = -aspect * VIEW;
    camera.right = aspect * VIEW;
    camera.top = VIEW;
    camera.bottom = -VIEW;
    camera.zoom = zoom;
    camera.position.set(CAM_BASE.x + panX, CAM_BASE.y, CAM_BASE.z + panZ);
    camera.lookAt(panX, 0, panZ);
    camera.updateProjectionMatrix();
    dirty = true;
  }

  function resize() {
    if (!host || !renderer) return;
    const rect = host.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width) || window.innerWidth || 960);
    H = Math.max(1, Math.round(rect.height) || window.innerHeight || 640);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.setSize(W, H, false);
    updateCamera();
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    if (!active || !dirty) return;
    dirty = false;
    renderer.render(scene, camera);
  }

  // ---------------------------------------------------------------------------
  // Zoom / pan / klikk
  // ---------------------------------------------------------------------------
  function setZoom(z) {
    const nz = clamp(z, MIN_ZOOM, MAX_ZOOM);
    if (Math.abs(nz - zoom) < 0.0005) return;
    zoom = nz;
    if (zoomBucket(zoom) !== _lastBucket) rebuildPlaces();
    updateCamera();
  }
  function zoomIn() { setZoom(zoom * ZOOM_STEP); }
  function zoomOut() { setZoom(zoom / ZOOM_STEP); }
  function reset() { zoom = 1; panX = 0; panZ = 0; updateCamera(); }
  function getZoom() { return zoom; }

  function panBy(dxPx, dyPx) {
    const unitsPerPx = (camera.right - camera.left) / (W * camera.zoom || 1);
    panX -= dxPx * unitsPerPx;
    panZ -= (dyPx * unitsPerPx) / Math.max(0.2, Math.cos(TILT)); // bakken trekker seg unna i dybden
    updateCamera();
  }

  const pointers = new Map();
  let pinchPrev = null, panPrev = null, downPt = null, moved = false;

  function relPos(e) {
    const r = host.getBoundingClientRect();
    return { px: clamp(e.clientX - r.left, 0, W), py: clamp(e.clientY - r.top, 0, H) };
  }
  function pinchDist() {
    const pts = [...pointers.values()];
    return Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
  }
  function ignoreTarget(t) {
    return !!(t && t.closest && t.closest(
      ".civi-map-zoom-controls, .civi-system-hud, .civi-system-panel, .civi-system-close, .civi-zone-node, .civi-map-legend"
    ));
  }

  function onPointerDown(e) {
    if (!active || !inMapMode() || ignoreTarget(e.target)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) { panPrev = { x: e.clientX, y: e.clientY }; downPt = { x: e.clientX, y: e.clientY }; moved = false; }
    else if (pointers.size === 2) { panPrev = null; pinchPrev = pinchDist(); }
  }
  function onPointerMove(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size >= 2) {
      const now = pinchDist();
      if (pinchPrev) { e.preventDefault(); const r = now / pinchPrev; if (r && Number.isFinite(r)) setZoom(zoom * r); }
      pinchPrev = now; moved = true; return;
    }
    if (panPrev) {
      const dx = e.clientX - panPrev.x, dy = e.clientY - panPrev.y;
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
    if (pointers.size === 1) { const p = [...pointers.values()][0]; panPrev = { x: p.x, y: p.y }; }
    else if (pointers.size === 0) {
      panPrev = null;
      if (wasSingle && start && !moved && active && inMapMode()) handleTap(e);
      downPt = null; moved = false;
    }
  }
  function onWheel(e) {
    if (!active || !inMapMode()) return;
    e.preventDefault();
    setZoom(zoom * (e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP));
  }
  function handleTap(e) {
    if (!placeGroup) return;
    const { px, py } = relPos(e);
    const ndc = new THREE.Vector2((px / W) * 2 - 1, -(py / H) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(placeGroup.children, false);
    if (hits.length && hits[0].object.userData && hits[0].object.userData.placeId) {
      const id = hits[0].object.userData.placeId;
      window.location.href = `index.html#/place/${encodeURIComponent(id)}`;
    }
  }

  // ---------------------------------------------------------------------------
  // Kontroller (egne for 3D-kartet)
  // ---------------------------------------------------------------------------
  function ensureControls() {
    if (!host) return;
    host.querySelector(".civi-map-zoom-controls")?.remove();
    const box = document.createElement("div");
    box.className = "civi-map-zoom-controls";
    box.innerHTML =
      '<button type="button" class="civi-map-zoom-btn" data-three-zoom-in aria-label="Zoom inn">+</button>' +
      '<button type="button" class="civi-map-zoom-btn" data-three-zoom-reset aria-label="Nullstill zoom">⤢</button>' +
      '<button type="button" class="civi-map-zoom-btn" data-three-zoom-out aria-label="Zoom ut">−</button>';
    box.querySelector("[data-three-zoom-in]").addEventListener("click", (e) => { e.preventDefault(); zoomIn(); });
    box.querySelector("[data-three-zoom-out]").addEventListener("click", (e) => { e.preventDefault(); zoomOut(); });
    box.querySelector("[data-three-zoom-reset]").addEventListener("click", (e) => { e.preventDefault(); reset(); });
    host.appendChild(box);
  }

  function bindEvents() {
    host.addEventListener("wheel", onWheel, { passive: false });
    host.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove, { passive: false });
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", () => setTimeout(resize, 120));
    document.getElementById("btnCiviMap")?.addEventListener("click", () => setTimeout(() => { resize(); dirty = true; }, 30));
  }

  // ---------------------------------------------------------------------------
  // Init med trygg fallback
  // ---------------------------------------------------------------------------
  function webglAvailable() {
    try {
      const c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
    } catch (e) { return false; }
  }

  async function init() {
    if (window.CIVICATION_THREE_MAP_ENABLED !== true) return;
    if (active) return;
    host = document.getElementById("civiMapWorld");
    if (!host) return;
    if (!webglAvailable()) {
      console.info("[CivicationThreeMap] WebGL ikke tilgjengelig – beholder Canvas-kartet.");
      return;
    }

    try {
      THREE = await import(/* @vite-ignore */ THREE_URL);
    } catch (e) {
      console.warn("[CivicationThreeMap] Klarte ikke laste three.js – beholder Canvas-kartet:", (e && e.message) || e);
      return;
    }

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.domElement.className = "civi-three-canvas";
    host.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0d1117, 40, 80);
    camera = new THREE.OrthographicCamera(-VIEW, VIEW, VIEW, -VIEW, 0.1, 200);
    raycaster = new THREE.Raycaster();

    buildLights();
    buildBoard();
    buildLandscape();

    // Marker host slik at CSS skjuler 2D-canvasene, og signaliser at 3D er aktiv.
    host.classList.add("is-three-map");
    window.__civiThreeActive = true;
    active = true;

    ensureControls();
    bindEvents();
    resize();
    ensureLoaded();
    loop();

    console.info("[CivicationThreeMap] 3D miniatyrkart aktivt (Three.js " + (THREE.REVISION || "?") + ")");
  }

  function isActive() { return active; }

  function getProjectionDebug(placeId) {
    const id = String(placeId == null ? "" : placeId);
    const p = (_places || []).find((x) => String(x.id) === id);
    if (!p) return { id, found: false };
    const proj = project(p);
    return {
      id: p.id, name: p.name, found: true, lat: p.lat, lon: p.lon,
      asset: resolveAssetType(p), priority: priorityOf(p),
      normalized: proj, world: proj ? { x: nx2x(proj.x), z: ny2z(proj.y) } : null
    };
  }

  document.addEventListener("DOMContentLoaded", init);
  window.addEventListener("civi:booted", init);
  window.addEventListener("civi:dataReady", init);
  if (document.readyState !== "loading") init();

  window.CivicationThreeMap = {
    init,
    isActive,
    reset,
    zoomIn,
    zoomOut,
    getZoom,
    getHitTargets: () => hitTargets.slice(),
    getProjectionDebug
  };
})();
