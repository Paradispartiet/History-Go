// CivicationThreeMap.js
// 3D-miniatyr-/dioramakart for Civication (WebGL via Three.js).
//
// Mål: et stilisert «bordmodell»-Oslo – et håndbygget strategispillkart, ikke
// et satellittkart. Ekstruderte landflater, en tydelig fjord i sør, hevet Marka
// i nord, Ekebergåsen i sørøst, Bygdøy-halvøy, øyer i fjorden, et prosedyralt
// kvartalsbygd byteppe og håndlagde Oslo-landemerker.
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

  // Terreng-/byhøyder (verdensenheter).
  const WATER_Y = 0.0;       // fjordens overflate
  const GROUND_Y = 0.12;     // topp av landplaten; bygg/trær står her
  const MARKA_H = 0.95;      // Marka-platået i nord
  const EKEBERG_H = 0.62;    // Ekebergåsen i sørøst
  const BYGDOY_H = 0.20;     // Bygdøy-halvøya
  const MAX_BUILDINGS = 1300;
  const MAX_ROOFS = 900;
  const MAX_TREES = 620;

  const VIEW = 11;           // ortografisk halv-høyde ved zoom = 1
  const MIN_ZOOM = 0.7;
  const MAX_ZOOM = 6.0;
  const ZOOM_STEP = 1.22;
  const MAX_DPR = 2;

  // Kamera-basis (gir ca. 48° tilt – rolig diorama-/modellbordvinkel).
  const CAM_BASE = { x: 0, y: 17, z: 15 };
  const TILT = Math.atan2(CAM_BASE.y, CAM_BASE.z); // radianer

  // Fargepalett – varm modellmaling, dyp fjord, dempet industri, grønn Marka.
  const PAL = {
    background: 0x0e141c,
    board: 0x171c24,
    fjord: 0x1d4d6c,
    fjordSpec: 0x2f6e93,
    marka: 0x294730,
    ekeberg: 0x335439,
    bygdoy: 0x3a6442,
    island: 0x497a4e,
    ground: 0xc9b092,
    groundCentrum: 0xd8c6a4,
    groundIndustri: 0x9b958a,
    groundGreen: 0xa7bd90,
    river: 0x356b82,
    rail: 0x474752,
    road: 0xb6a583,
    stone: 0x8f877a,
    culture: 0xe6d5c2
  };

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

  const _stats = { placeMarkers: 0, instancedBuildings: 0, trees: 0, landmarks: 0 };

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
    if (/bibliotek|library|deichman/.test(hay)) return "library";
    if (/opera|teater|theatre|theater|scene|konserthus|kino|klubb|venue/.test(hay)) return "theatre";
    if (/skole|gymnas|universitet|college|school/.test(hay)) return "school";
    if (/stasjon|t-bane|jernbane|holdeplass|station|rail/.test(hay)) return "station";
    if (/kirke|kapell|domkirke|church/.test(hay)) return "church";
    if (/festning|slott|borg|skanse|fortress/.test(hay)) return "fortress";
    if (/lager|industri|verksted|fabrikk|warehouse|depot/.test(hay)) return "warehouse";
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
    // Tydelige, men dempede modell-toner (ikke neon).
    const colors = {
      by: 0xd8be96, sport: 0x7fb98a, kunst: 0xb593db, litteratur: 0x93acca,
      musikk: 0xdb95b6, historie: 0xcea874, natur: 0x73b681, subkultur: 0xa982d0,
      politikk: 0xe6c182, vitenskap: 0x76a3d6, media: 0x92bccb, film: 0xc794d6,
      film_tv: 0xc794d6, popkultur: 0xd6a4c6, psykologi: 0x9bb5c8
    };
    return colors[category] != null ? colors[category] : 0xc6c2bc;
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
  // Geometri-hjelpere
  // ---------------------------------------------------------------------------
  function toMat(c, opts) {
    if (c && c.isMaterial) return c;
    return new THREE.MeshLambertMaterial(Object.assign({ color: new THREE.Color(c) }, opts || {}));
  }

  // Ekstruder et normalisert polygon (liste av [nx,ny]) til en blokk/plate.
  function extrudeShape(points, height, c, yBase, opts) {
    const o = opts || {};
    const shape = new THREE.Shape();
    points.forEach((pt, i) => {
      // shape-y -> -worldZ etter rotateX(-90), så vi mater inn -ny2z(py).
      const sx = nx2x(pt[0]);
      const sy = -ny2z(pt[1]);
      if (i) shape.lineTo(sx, sy); else shape.moveTo(sx, sy);
    });
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: height, bevelEnabled: !!o.bevel,
      bevelThickness: o.bevel || 0, bevelSize: o.bevel || 0, bevelSegments: 1
    });
    geo.rotateX(-Math.PI / 2); // legg flatt i XZ, ekstruder oppover (+Y)
    const mesh = new THREE.Mesh(geo, toMat(c));
    mesh.position.y = yBase || 0;
    mesh.castShadow = o.cast != null ? o.cast : (height > 0.3);
    mesh.receiveShadow = o.receive != null ? o.receive : true;
    return mesh;
  }

  // Bånd-polygon rundt en polylinje (for elv, jernbane, hovedakser).
  function ribbonPolygon(poly, width) {
    const left = [], right = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i];
      const a = poly[Math.max(0, i - 1)];
      const b = poly[Math.min(poly.length - 1, i + 1)];
      let dx = b[0] - a[0], dy = b[1] - a[1];
      const len = Math.hypot(dx, dy) || 1; dx /= len; dy /= len;
      const ox = -dy * width / 2, oy = dx * width / 2;
      left.push([p[0] + ox, p[1] + oy]);
      right.push([p[0] - ox, p[1] - oy]);
    }
    return left.concat(right.reverse());
  }

  // Deterministisk RNG (mulberry32) for stabil by-layout.
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function pointInPoly(x, y, poly) {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      const hit = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (hit) inside = !inside;
    }
    return inside;
  }
  function polyBBox(poly) {
    let minX = 1, minY = 1, maxX = 0, maxY = 0;
    poly.forEach(([x, y]) => { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
    return { minX, minY, maxX, maxY };
  }

  // Enkle mesh-byggesteiner (lokal origo, bunn på y=0).
  function box(w, h, d, c, opts) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toMat(c, opts));
    m.position.y = h / 2;
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function cyl(rt, rb, h, seg, c) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), toMat(c));
    m.position.y = h / 2;
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  function coneMesh(r, h, seg, c) {
    const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), toMat(c));
    m.position.y = h / 2;
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }
  // Saltak (trekantprisme) som eget mesh – mønet langs z.
  function gableRoof(w, h, d, c) {
    const s = new THREE.Shape();
    s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0, 1); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false });
    geo.translate(0, 0, -0.5);
    geo.scale(w, h, d);
    const m = new THREE.Mesh(geo, toMat(c));
    m.castShadow = true; m.receiveShadow = true;
    return m;
  }

  // ---------------------------------------------------------------------------
  // Del 1 – Terreng / landskap
  // ---------------------------------------------------------------------------

  // Kystlinje for hele fastlandet: nord dekkes helt, sørkysten er ujevn med en
  // innskåret Bjørvika-bukt og pynter ved Akershus/Gamle Oslo.
  const LAND_COAST = [
    [-0.03, -0.03], [1.03, -0.03], [1.03, 0.68],
    [0.92, 0.70], [0.84, 0.72],
    [0.78, 0.70],            // Gamle Oslo-kant
    [0.70, 0.745],           // østre Bjørvika-odde stikker ut
    [0.655, 0.66],           // Bjørvika-bukta trekker seg nordover (innskåret havn)
    [0.605, 0.70],
    [0.565, 0.645],          // indre havnebasseng
    [0.50, 0.725],           // Akershus-odden stikker ut
    [0.445, 0.695],          // Rådhusplassen
    [0.385, 0.715],
    [0.335, 0.675],          // mot Bygdøy-halsen
    [0.245, 0.70], [0.13, 0.70], [-0.03, 0.69]
  ];
  const BYGDOY = [[0.10, 0.665], [0.295, 0.665], [0.335, 0.72], [0.285, 0.80], [0.18, 0.825], [0.085, 0.765], [0.055, 0.70]];

  function buildBoard() {
    // Hevet modellbrett / sokkel.
    const board = new THREE.Mesh(new THREE.BoxGeometry(MAP_W + 3.4, 1.1, MAP_D + 3.4), toMat(PAL.board));
    board.position.y = -0.6;
    board.receiveShadow = true;
    scene.add(board);

    // Fjordvann – Phong gir en svak «våt» glans. Dekker hele brettet; land
    // legges oppå i nord, så blått leses som fjord i sør.
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(MAP_W + 3.4, MAP_D + 3.4),
      new THREE.MeshPhongMaterial({ color: PAL.fjord, shininess: 80, specular: PAL.fjordSpec })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = WATER_Y;
    water.receiveShadow = true;
    scene.add(water);
  }

  function buildLandscape() {
    const land = window.CIVI_OSLO_LANDSCAPE || {};

    // Fastlandsplate (varm stein) – løfter byen over fjorden.
    const mainland = extrudeShape(LAND_COAST, GROUND_Y, PAL.ground, 0, { cast: false });
    scene.add(mainland);

    // Bygdøy-halvøy.
    scene.add(extrudeShape(BYGDOY, BYGDOY_H, PAL.bygdoy, 0, { cast: true }));

    // Marka som hevet skogsplatå i nord, Ekeberg som ås i sørøst.
    if (land.markaNorth) scene.add(extrudeShape(land.markaNorth, MARKA_H, PAL.marka, 0, { cast: true, bevel: 0.04 }));
    if (land.ekebergRidge) scene.add(extrudeShape(land.ekebergRidge, EKEBERG_H, PAL.ekeberg, 0, { cast: true, bevel: 0.03 }));

    // Øyer i fjorden som små grønne modelløyer på en lys strandsokkel.
    const islands = [
      [0.465, 0.78, 0.5], [0.42, 0.825, 0.38], [0.525, 0.83, 0.44],
      [0.385, 0.755, 0.3], [0.575, 0.785, 0.34], [0.49, 0.875, 0.3]
    ];
    islands.forEach(([nx, ny, r]) => {
      const sand = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.42, r * 0.5, 0.05, 14), toMat(0xc8b890));
      sand.position.set(nx2x(nx), 0.025, ny2z(ny));
      sand.receiveShadow = true;
      scene.add(sand);
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toMat(PAL.island));
      m.position.set(nx2x(nx), 0.05, ny2z(ny));
      m.scale.y = 0.45;
      m.castShadow = true; m.receiveShadow = true;
      scene.add(m);
    });

    // Tynne bydels-slabs som farget grunn (gir per-bydel identitet).
    (window.CIVI_MAP_DISTRICTS || []).forEach((d) => {
      const slab = extrudeShape(d.shape, 0.035, districtTint(d), GROUND_Y, { cast: false });
      scene.add(slab);
    });

    buildAxes();
  }

  function districtTint(d) {
    switch (d.id) {
      case "sentrum": return PAL.groundCentrum;
      case "gamle_oslo": return 0xcab89c;
      case "grunerlokka": case "st_hanshaugen": case "sagene": return 0xceb99c;
      case "frogner": case "ullern": return 0xd6c8ad;
      case "alna": return PAL.groundIndustri;
      case "nordstrand": case "stovner": return PAL.groundGreen;
      default: return PAL.ground;
    }
  }

  // Elv, jernbane og et par hovedakser som tynne bånd på bakken.
  function buildAxes() {
    const land = window.CIVI_OSLO_LANDSCAPE || {};
    const baseY = GROUND_Y + 0.04;
    // Akerselva – blå/grønn linje fra nord mot sentrum.
    if (land.akerselva) {
      const river = extrudeShape(ribbonPolygon(land.akerselva, 0.013), 0.02, PAL.river, baseY, { cast: false, receive: false });
      scene.add(river);
    }
    // Jernbane langs havna (Oslo S / Bjørvika).
    const rail = [[0.40, 0.605], [0.47, 0.60], [0.535, 0.598], [0.60, 0.605], [0.665, 0.615]];
    scene.add(extrudeShape(ribbonPolygon(rail, 0.009), 0.02, PAL.rail, baseY + 0.005, { cast: false, receive: false }));
    // Hovedakse (Karl Johan-ish) Slottet -> Oslo S.
    const axis = [[0.45, 0.55], [0.49, 0.572], [0.52, 0.582], [0.535, 0.588]];
    scene.add(extrudeShape(ribbonPolygon(axis, 0.011), 0.02, PAL.road, baseY, { cast: false, receive: false }));
  }

  // ---------------------------------------------------------------------------
  // Del 6 – Lys / atmosfære
  // ---------------------------------------------------------------------------
  function buildLights() {
    scene.add(new THREE.HemisphereLight(0xd6e6f2, 0x3a4233, 0.78));
    const sun = new THREE.DirectionalLight(0xfff1da, 1.18);
    sun.position.set(-15, 24, 13); // konsekvent mykt lys oppe-til-venstre
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -18; sc.right = 18; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 80;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.5;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xc4d6ea, 0.30);
    fill.position.set(13, 11, -11);
    scene.add(fill);
  }

  // ---------------------------------------------------------------------------
  // Del 2 – Prosedyralt, kvartalsbygd byteppe (InstancedMesh)
  // ---------------------------------------------------------------------------
  function districtBuildProfile(id) {
    // cell/gap er i normaliserte enheter (kvartal + gate). flat = flate tak.
    switch (id) {
      case "sentrum":      return { hMin: 0.9, hMax: 2.9, cell: 0.016, gap: 0.006, dens: 0.92, roof: 0.0, tone: "centrum" };
      case "gamle_oslo":   return { hMin: 0.6, hMax: 2.1, cell: 0.017, gap: 0.007, dens: 0.80, roof: 0.18, tone: "centrum" };
      case "grunerlokka":  return { hMin: 0.5, hMax: 1.05, cell: 0.016, gap: 0.006, dens: 0.86, roof: 0.62, tone: "block" };
      case "st_hanshaugen":return { hMin: 0.5, hMax: 1.0, cell: 0.016, gap: 0.006, dens: 0.80, roof: 0.58, tone: "block" };
      case "sagene":       return { hMin: 0.45, hMax: 0.95, cell: 0.016, gap: 0.006, dens: 0.78, roof: 0.62, tone: "block" };
      case "frogner":      return { hMin: 0.45, hMax: 0.95, cell: 0.021, gap: 0.009, dens: 0.62, roof: 0.48, tone: "block" };
      case "ullern":       return { hMin: 0.35, hMax: 0.8, cell: 0.025, gap: 0.012, dens: 0.52, roof: 0.55, tone: "green" };
      case "alna":         return { hMin: 0.35, hMax: 0.9, cell: 0.030, gap: 0.012, dens: 0.58, roof: 0.10, tone: "industri" };
      case "nordstrand":   return { hMin: 0.3, hMax: 0.65, cell: 0.025, gap: 0.013, dens: 0.44, roof: 0.7, tone: "green" };
      case "stovner":      return { hMin: 0.3, hMax: 0.78, cell: 0.026, gap: 0.012, dens: 0.46, roof: 0.55, tone: "green" };
      default:             return { hMin: 0.4, hMax: 0.9, cell: 0.018, gap: 0.007, dens: 0.6, roof: 0.4, tone: "block" };
    }
  }

  function buildingColor(col, tone, t) {
    if (tone === "industri") col.setHSL(0.09 + t * 0.04, 0.05 + t * 0.05, 0.40 + t * 0.16);
    else if (tone === "centrum") col.setHSL(0.085 + t * 0.04, 0.13 + t * 0.1, 0.50 + t * 0.20);
    else if (tone === "green") col.setHSL(0.10 + t * 0.05, 0.14 + t * 0.1, 0.46 + t * 0.18);
    else col.setHSL(0.075 + t * 0.05, 0.16 + t * 0.1, 0.44 + t * 0.20); // block
    return col;
  }

  function buildCity() {
    const districts = window.CIVI_MAP_DISTRICTS || [];
    const blocks = [];
    districts.forEach((d) => {
      const poly = d.shape;
      if (!poly || !poly.length) return;
      const prof = districtBuildProfile(d.id);
      const rng = mulberry32(hashStr(d.id) ^ 0x5151);
      const cx = (d.center && d.center[0]) || 0.5;
      const cy = (d.center && d.center[1]) || 0.5;
      const ang = ((hashStr(d.id) % 100) / 100 - 0.5) * 0.5; // svak kvartalsrotasjon
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const bb = polyBBox(poly);
      const stepX = prof.cell + prof.gap;
      const stepY = prof.cell + prof.gap;
      const pad = stepX;
      for (let gy = bb.minY - pad; gy <= bb.maxY + pad; gy += stepY) {
        for (let gx = bb.minX - pad; gx <= bb.maxX + pad; gx += stepX) {
          // roter rutenettet rundt bydelssenter -> antydede gater i vinkel.
          const lx = gx - cx, ly = gy - cy;
          const nx = cx + lx * ca - ly * sa;
          const ny = cy + lx * sa + ly * ca;
          if (!pointInPoly(nx, ny, poly)) continue;
          if (rng() > prof.dens) continue;
          // Kvartal: fotavtrykk fyller mesteparten av cellen, litt variasjon.
          const fw = prof.cell * (0.62 + rng() * 0.30) * MAP_W;
          const fd = prof.cell * (0.62 + rng() * 0.30) * MAP_D;
          const h = prof.hMin + Math.pow(rng(), 1.4) * (prof.hMax - prof.hMin);
          const roof = (rng() < prof.roof) && Math.min(fw, fd) < 0.62;
          blocks.push({
            x: nx2x(nx), z: ny2z(ny), fw, fd, h, rot: ang + (rng() - 0.5) * 0.12,
            tone: rng(), toneKind: prof.tone, roof
          });
          if (blocks.length >= MAX_BUILDINGS) break;
        }
        if (blocks.length >= MAX_BUILDINGS) break;
      }
    });
    if (!blocks.length) return;

    // Vegger/kropp – ett InstancedMesh.
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff }), blocks.length);
    mesh.castShadow = true; mesh.receiveShadow = true;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    const pos = new THREE.Vector3(), scl = new THREE.Vector3(), col = new THREE.Color();

    // Tak – eget InstancedMesh (saltak-prismer) for kvartalsbyene.
    const roofList = blocks.filter((b) => b.roof).slice(0, MAX_ROOFS);
    let roofMesh = null;
    if (roofList.length) {
      const rgeo = new THREE.ExtrudeGeometry(
        (() => { const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0, 1); s.closePath(); return s; })(),
        { depth: 1, bevelEnabled: false }
      );
      rgeo.translate(0, 0, -0.5);
      roofMesh = new THREE.InstancedMesh(rgeo, new THREE.MeshLambertMaterial({ color: 0xffffff }), roofList.length);
      roofMesh.castShadow = true; roofMesh.receiveShadow = true;
    }

    let ri = 0;
    blocks.forEach((b, i) => {
      q.setFromAxisAngle(up, b.rot);
      pos.set(b.x, GROUND_Y + b.h / 2, b.z);
      scl.set(b.fw, b.h, b.fd);
      m.compose(pos, q, scl);
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, buildingColor(col, b.toneKind, b.tone));
      if (roofMesh && b.roof && ri < roofList.length) {
        const rh = Math.min(b.fw, b.fd) * 0.55;
        pos.set(b.x, GROUND_Y + b.h, b.z);
        scl.set(b.fw, rh, b.fd);
        m.compose(pos, q, scl);
        roofMesh.setMatrixAt(ri, m);
        col.setHSL(0.055 + b.tone * 0.03, 0.30, 0.30 + b.tone * 0.1); // terrakotta/grå tak
        roofMesh.setColorAt(ri, col);
        ri++;
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);
    if (roofMesh) {
      roofMesh.instanceMatrix.needsUpdate = true;
      if (roofMesh.instanceColor) roofMesh.instanceColor.needsUpdate = true;
      scene.add(roofMesh);
    }
    _stats.instancedBuildings = blocks.length;
  }

  // Trær i Marka, på Ekeberg, Bygdøy og i grønne bydeler (InstancedMesh).
  function buildTrees() {
    const land = window.CIVI_OSLO_LANDSCAPE || {};
    const rng = mulberry32(73331);
    const regions = [];
    if (land.markaNorth) regions.push({ poly: land.markaNorth, baseY: MARKA_H, n: 320 });
    if (land.ekebergRidge) regions.push({ poly: land.ekebergRidge, baseY: EKEBERG_H, n: 110 });
    regions.push({ poly: BYGDOY, baseY: BYGDOY_H, n: 55 });
    const greenDistricts = ["nordstrand", "stovner", "ullern"];
    (window.CIVI_MAP_DISTRICTS || []).forEach((d) => {
      if (greenDistricts.includes(d.id)) regions.push({ poly: d.shape, baseY: GROUND_Y, n: 38 });
    });

    const pts = [];
    regions.forEach((reg) => {
      const bb = polyBBox(reg.poly);
      let placed = 0, guard = 0;
      while (placed < reg.n && guard < reg.n * 25 && pts.length < MAX_TREES) {
        guard++;
        const x = bb.minX + rng() * (bb.maxX - bb.minX);
        const y = bb.minY + rng() * (bb.maxY - bb.minY);
        if (!pointInPoly(x, y, reg.poly)) continue;
        pts.push({ x: nx2x(x), z: ny2z(y), baseY: reg.baseY, h: 0.42 + rng() * 0.4, tone: rng() });
        placed++;
      }
    });
    if (!pts.length) return;

    const geo = new THREE.ConeGeometry(0.17, 1, 7);
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshLambertMaterial({ color: 0xffffff }), pts.length);
    mesh.castShadow = false; mesh.receiveShadow = true; // trær kaster ikke skygge (ytelse)
    const m = new THREE.Matrix4(), q = new THREE.Quaternion();
    const pos = new THREE.Vector3(), scl = new THREE.Vector3(), col = new THREE.Color();
    pts.forEach((t, i) => {
      pos.set(t.x, t.baseY + t.h / 2, t.z);
      scl.set(0.8 + t.tone * 0.6, t.h, 0.8 + t.tone * 0.6);
      m.compose(pos, q, scl);
      mesh.setMatrixAt(i, m);
      col.setHSL(0.29 + t.tone * 0.04, 0.40, 0.24 + t.tone * 0.13);
      mesh.setColorAt(i, col);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);
    _stats.trees = pts.length;
  }

  // ---------------------------------------------------------------------------
  // Del 3 – Miniatyrbygg-katalog (building archetypes)
  // Hver bygger returnerer { group, h } med bunn på lokal y=0.
  // ---------------------------------------------------------------------------
  const ARCHETYPES = {
    apartment_block(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 0.9;
      g.add(box(0.5, h, 0.5, c));
      const cap = box(0.54, 0.05, 0.54, shade(c, -0.12)); cap.position.y = h; g.add(cap);
      return { group: g, h };
    },
    row_block(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 0.55;
      g.add(box(0.78, h, 0.34, c));
      const r = gableRoof(0.8, 0.16, 0.36, shade(c, -0.18)); r.position.y = h; g.add(r);
      return { group: g, h };
    },
    tower_block(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 1.7;
      g.add(box(0.36, h, 0.36, c));
      const cap = box(0.3, 0.08, 0.3, shade(c, 0.1)); cap.position.y = h; g.add(cap);
      return { group: g, h };
    },
    barcode_tower(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 1.7;
      g.add(box(0.18, h, 0.52, c));
      return { group: g, h };
    },
    civic_building(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 0.95;
      g.add(box(0.72, h * 0.7, 0.72, c));
      const mid = box(0.4, h, 0.4, shade(c, 0.06)); g.add(mid);
      const cap = box(0.46, 0.06, 0.46, shade(c, -0.1)); cap.position.y = h; g.add(cap);
      return { group: g, h };
    },
    museum(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 0.6;
      g.add(box(0.74, h, 0.56, c));
      const roof = box(0.8, 0.06, 0.62, shade(c, -0.12)); roof.position.y = h; g.add(roof);
      // antydede kolonner foran
      for (let i = -2; i <= 2; i++) {
        const col = cyl(0.04, 0.04, h * 0.92, 8, shade(c, 0.12));
        col.position.set(i * 0.15, 0, 0.3); g.add(col);
      }
      return { group: g, h };
    },
    theatre(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 0.65;
      g.add(box(0.66, h, 0.5, c));
      const front = box(0.7, h * 0.55, 0.1, shade(c, 0.1)); front.position.set(0, 0, 0.26); g.add(front);
      const canopy = box(0.72, 0.05, 0.18, shade(c, -0.15)); canopy.position.set(0, h * 0.5, 0.34); g.add(canopy);
      return { group: g, h };
    },
    church(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 0.55;
      g.add(box(0.34, h, 0.46, c));
      const tower = box(0.18, h * 1.5, 0.18, shade(c, 0.05)); tower.position.set(0, 0, -0.16); g.add(tower);
      const spire = coneMesh(0.13, 0.42, 4, shade(c, -0.2)); spire.position.set(0, h * 1.5, -0.16); spire.rotation.y = Math.PI / 4; g.add(spire);
      return { group: g, h: h * 1.5 + 0.42 };
    },
    station(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 0.42;
      g.add(box(0.92, h, 0.46, c));
      const hall = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.9, 16, 1, false, 0, Math.PI), toMat(shade(c, 0.12)));
      hall.rotation.z = Math.PI / 2; hall.position.set(0, h, 0); g.add(hall);
      return { group: g, h: h + 0.24 };
    },
    stadium(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 0.34;
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.5, h, 22), toMat(c));
      ring.position.y = h / 2; ring.scale.x = 1.25; ring.castShadow = true; ring.receiveShadow = true; g.add(ring);
      const pitch = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, h * 0.6, 22), toMat(0x4f8f55));
      pitch.position.y = h * 0.55; pitch.scale.x = 1.25; pitch.receiveShadow = true; g.add(pitch);
      return { group: g, h };
    },
    school(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 0.5;
      const a = box(0.56, h, 0.4, c); a.position.x = -0.1; g.add(a);
      const b = box(0.34, h, 0.34, c); b.position.set(0.28, 0, 0.12); g.add(b);
      const r = gableRoof(0.58, 0.12, 0.42, shade(c, -0.15)); r.position.set(-0.1, h, 0); g.add(r);
      return { group: g, h };
    },
    warehouse(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 0.36;
      g.add(box(0.92, h, 0.62, c));
      const r = gableRoof(0.94, 0.1, 0.64, shade(c, -0.1)); r.position.y = h; g.add(r);
      return { group: g, h };
    },
    waterfront_building(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 0.45;
      g.add(box(0.66, h, 0.32, c));
      const glass = box(0.6, h * 0.8, 0.06, shade(c, 0.18)); glass.position.set(0, 0, 0.16); g.add(glass);
      return { group: g, h };
    },
    park_object(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 0.12;
      const mound = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, h, 16), toMat(0x6aa66f));
      mound.position.y = h / 2; mound.receiveShadow = true; g.add(mound);
      [[-0.18, 0.1], [0.16, -0.12], [0.05, 0.2]].forEach(([x, z]) => {
        const tr = coneMesh(0.12, 0.4, 7, 0x3f7a46); tr.position.set(x, h, z); g.add(tr);
      });
      return { group: g, h: h + 0.4 };
    },
    landmark(o) {
      const g = new THREE.Group(); const c = o.color, h = o.h || 1.0;
      g.add(box(0.5, h * 0.5, 0.5, c));
      const a = box(0.36, h * 0.35, 0.36, shade(c, 0.06)); a.position.y = h * 0.5; g.add(a);
      const b = box(0.22, h * 0.3, 0.22, shade(c, 0.12)); b.position.y = h * 0.85; g.add(b);
      return { group: g, h: h * 1.15 };
    }
  };

  function shade(c, amt) {
    const col = new THREE.Color(c);
    const hsl = { h: 0, s: 0, l: 0 }; col.getHSL(hsl);
    col.setHSL(hsl.h, hsl.s, clamp(hsl.l + amt, 0, 1));
    return col.getHex();
  }

  function archetypeForAsset(asset) {
    switch (asset) {
      case "skyline": return "barcode_tower";
      case "civic": return "civic_building";
      case "fortress": return "civic_building";
      case "museum": return "museum";
      case "library": return "museum";
      case "theatre": return "theatre";
      case "church": return "church";
      case "station": return "station";
      case "stadium": return "stadium";
      case "school": return "school";
      case "warehouse": return "warehouse";
      case "waterfront": return "waterfront_building";
      case "park": return "park_object";
      case "street": return "row_block";
      default: return "apartment_block";
    }
  }

  // ---------------------------------------------------------------------------
  // Del 4 – Håndlagde Oslo-landemerker
  // ---------------------------------------------------------------------------
  function placeArch(group, name, nx, ny, opts, baseY, rotY) {
    const built = ARCHETYPES[name](opts || {});
    built.group.position.set(nx2x(nx), baseY == null ? GROUND_Y : baseY, ny2z(ny));
    if (rotY) built.group.rotation.y = rotY;
    group.add(built.group);
    _stats.landmarks++;
    return built.group;
  }

  function buildLandmarks() {
    const g = new THREE.Group();
    _stats.landmarks = 0;

    // Barcode – rad med slanke høyhus ved Bjørvika.
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const nx = 0.578 + t * 0.040;
      const ny = 0.560 + t * 0.030;
      const h = 1.45 + ((i % 3) * 0.45) + (i === 4 ? 0.6 : 0);
      placeArch(g, "barcode_tower", nx, ny, { color: 0x37495d, h }, GROUND_Y, 0.42);
    }

    // Oslo S / Posthuset / Plaza-ish høyder.
    placeArch(g, "station", 0.535, 0.598, { color: 0x9aa6b0, h: 0.42 }, GROUND_Y);
    placeArch(g, "tower_block", 0.553, 0.580, { color: 0x3b4b5f, h: 2.6 }, GROUND_Y);
    placeArch(g, "tower_block", 0.520, 0.575, { color: 0x47566a, h: 2.0 }, GROUND_Y);

    // Operaen – hvit skrå rampe ved vannet.
    buildOpera(g);

    // Munch / Deichman / Bjørvika kulturbygg.
    placeArch(g, "museum", 0.598, 0.638, { color: 0x6f7a86, h: 1.4 }, GROUND_Y, -0.3); // Munch (høy, mørk)
    placeArch(g, "museum", 0.512, 0.612, { color: PAL.culture, h: 0.8 }, GROUND_Y);     // Deichman

    // Akershus festning – steinmasse + tårn med spisstak.
    buildAkershus(g);

    // Rådhuset – to teglsteinstårn + lavere mellombygg.
    placeArch(g, "civic_building", 0.463, 0.61, { color: 0x9c5a3c, h: 1.7 }, GROUND_Y);
    placeArch(g, "civic_building", 0.49, 0.61, { color: 0x9c5a3c, h: 1.7 }, GROUND_Y);
    const mid = box(MAP_W * 0.025, 0.8, MAP_D * 0.05, 0xab6647);
    mid.position.set(nx2x(0.4765), GROUND_Y, ny2z(0.612)); g.add(mid);

    // Slottet – gul klassisk blokk på grønn høyde.
    const slottHill = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.7, 0.18, 18), toMat(0x6f9460));
    slottHill.position.set(nx2x(0.45), GROUND_Y + 0.09, ny2z(0.55)); slottHill.receiveShadow = true; g.add(slottHill);
    placeArch(g, "civic_building", 0.45, 0.55, { color: 0xe6cf92, h: 0.7 }, GROUND_Y + 0.18);

    // Bislett stadion – oval lav arena.
    placeArch(g, "stadium", 0.43, 0.465, { color: 0xbf6a52, h: 0.34 }, GROUND_Y);

    // Frognerparken / Vigeland – parkmarkør.
    placeArch(g, "park_object", 0.305, 0.465, { color: 0x6aa66f }, GROUND_Y);
    const obelisk = cyl(0.05, 0.08, 0.7, 8, 0xd9cdba);
    obelisk.position.set(nx2x(0.305), GROUND_Y, ny2z(0.465)); g.add(obelisk);

    // Holmenkollen – skihopp i åsen nordvest.
    buildHolmenkollen(g);

    scene.add(g);
  }

  function buildOpera(group) {
    const L = 1.7, Hh = 1.0, depth = 1.5;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.lineTo(L, 0); shape.lineTo(0, Hh); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    geo.translate(-L / 2, 0, -depth / 2);
    const mesh = new THREE.Mesh(geo, toMat(0xeae6dc));
    mesh.position.set(nx2x(0.55), 0.04, ny2z(0.642));
    mesh.rotation.y = -0.5;
    mesh.castShadow = true; mesh.receiveShadow = true;
    group.add(mesh);
    _stats.landmarks++;
  }

  function buildAkershus(group) {
    const g = new THREE.Group();
    g.add(box(0.95, 0.5, 0.95, 0x8a8276));
    const t = box(0.3, 1.05, 0.3, 0x948b7d); g.add(t);
    const spire = coneMesh(0.26, 0.5, 4, 0x4f4a40); spire.position.y = 1.05; spire.rotation.y = Math.PI / 4; g.add(spire);
    g.position.set(nx2x(0.5), GROUND_Y, ny2z(0.646));
    group.add(g);
    _stats.landmarks++;
  }

  function buildHolmenkollen(group) {
    const g = new THREE.Group();
    const tower = box(0.14, 1.7, 0.14, 0xdfe4e9); g.add(tower);
    const inrun = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 2.0), toMat(0xc7ced6));
    inrun.position.set(0, 1.0, 0.85); inrun.rotation.x = -0.62; inrun.castShadow = true; g.add(inrun);
    g.position.set(nx2x(0.30), MARKA_H, ny2z(0.165));
    group.add(g);
    _stats.landmarks++;
  }

  // ---------------------------------------------------------------------------
  // Del 5 – Interaktive History Go-places (arketyp + dempet kategori-fyr)
  // ---------------------------------------------------------------------------
  function placeGroupFor(p) {
    const asset = resolveAssetType(p);
    const accent = categoryColor(p.category);
    // Kropp i varm stein lett trukket mot kategorifargen (tydelig, ikke neon).
    const bodyColor = mixHex(PAL.stone, accent, 0.4);
    const arch = archetypeForAsset(asset);
    const built = ARCHETYPES[arch]({ color: bodyColor });
    const group = built.group;
    group.traverse((m) => { if (m.isMesh) m.userData = { placeId: p.id }; });

    // Liten lysende fyr på toppen så places skiller seg fra bybildet.
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 8),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(accent) })
    );
    beacon.position.y = built.h + 0.2;
    beacon.userData = { placeId: p.id };
    group.add(beacon);

    group.userData = { placeId: p.id, h: built.h };
    return group;
  }

  function mixHex(a, b, t) {
    const ca = new THREE.Color(a), cb = new THREE.Color(b);
    return ca.lerp(cb, t).getHex();
  }

  function rebuildPlaces() {
    if (!scene || !THREE) return;
    if (!placeGroup) { placeGroup = new THREE.Group(); scene.add(placeGroup); }
    for (let i = placeGroup.children.length - 1; i >= 0; i--) {
      const node = placeGroup.children[i];
      placeGroup.remove(node);
      node.traverse((m) => {
        if (m.geometry) m.geometry.dispose();
        if (m.material) m.material.dispose();
      });
    }
    hitTargets = [];
    if (!_places) { _stats.placeMarkers = 0; return; }

    _lastBucket = zoomBucket(zoom);
    visibleSet(_places, zoom).forEach((p) => {
      const proj = project(p);
      if (!proj) return;
      const node = placeGroupFor(p);
      node.position.set(nx2x(proj.x), GROUND_Y, ny2z(proj.y));
      placeGroup.add(node);
      hitTargets.push({ id: p.id, place: p });
    });
    _stats.placeMarkers = hitTargets.length;
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
    const hits = raycaster.intersectObjects(placeGroup.children, true);
    if (hits.length) {
      let o = hits[0].object;
      while (o && !(o.userData && o.userData.placeId)) o = o.parent;
      if (o && o.userData && o.userData.placeId) {
        window.location.href = `index.html#/place/${encodeURIComponent(o.userData.placeId)}`;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Kontroller (egne for 3D-kartet)
  // ---------------------------------------------------------------------------
  function ensureControls() {
    if (!host) return;
    host.querySelector(".civi-map-zoom-controls")?.remove();
    const box2 = document.createElement("div");
    box2.className = "civi-map-zoom-controls";
    box2.innerHTML =
      '<button type="button" class="civi-map-zoom-btn" data-three-zoom-in aria-label="Zoom inn">+</button>' +
      '<button type="button" class="civi-map-zoom-btn" data-three-zoom-reset aria-label="Nullstill zoom">⤢</button>' +
      '<button type="button" class="civi-map-zoom-btn" data-three-zoom-out aria-label="Zoom ut">−</button>';
    box2.querySelector("[data-three-zoom-in]").addEventListener("click", (e) => { e.preventDefault(); zoomIn(); });
    box2.querySelector("[data-three-zoom-out]").addEventListener("click", (e) => { e.preventDefault(); zoomOut(); });
    box2.querySelector("[data-three-zoom-reset]").addEventListener("click", (e) => { e.preventDefault(); reset(); });
    host.appendChild(box2);
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

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.domElement.className = "civi-three-canvas";
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    host.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(PAL.background);
    scene.fog = new THREE.Fog(PAL.background, 44, 96);
    camera = new THREE.OrthographicCamera(-VIEW, VIEW, VIEW, -VIEW, 0.1, 200);
    raycaster = new THREE.Raycaster();

    buildLights();
    buildBoard();
    buildLandscape();
    buildCity();
    buildTrees();
    buildLandmarks();

    zoom = 1.35; // start litt inn-zoomet for mer trøkk

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
      asset: resolveAssetType(p), archetype: archetypeForAsset(resolveAssetType(p)), priority: priorityOf(p),
      normalized: proj, world: proj ? { x: nx2x(proj.x), z: ny2z(proj.y) } : null
    };
  }

  function getSceneStats() {
    let rendererType = "none";
    if (renderer) rendererType = (renderer.capabilities && renderer.capabilities.isWebGL2) ? "webgl2" : "webgl";
    return {
      placeMarkers: _stats.placeMarkers,
      instancedBuildings: _stats.instancedBuildings,
      trees: _stats.trees,
      landmarks: _stats.landmarks,
      rendererType,
      zoom: Number(zoom.toFixed(3)),
      active,
      fallback: !active
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
    getProjectionDebug,
    getSceneStats
  };
})();
