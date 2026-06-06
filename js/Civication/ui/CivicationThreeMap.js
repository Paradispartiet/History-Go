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

  // Del 5 – Zoombasert LOD for History Go-place-miniatyrer. Maks antall synlige
  // place-miniatyrer per nivå, og hvor små de tegnes. Lav zoom skal være ryddig
  // (landemerkene dominerer); høyere zoom åpner for flere lokale steder.
  const PLACE_LOD_LIMITS = { low: 26, mid: 90, high: 190, veryHigh: 240 };
  const PLACE_LOD_SCALE = { low: 0.34, mid: 0.40, high: 0.46, veryHigh: 0.50 };
  function placeLodLevel(z) {
    if (z > 4.0) return "veryHigh";
    if (z > 2.6) return "high";
    if (z > 1.4) return "mid";
    return "low";
  }

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

  const VIEW = 10.6;         // ortografisk halv-høyde ved zoom = 1
  const MIN_ZOOM = 0.7;
  const MAX_ZOOM = 6.0;
  const ZOOM_STEP = 1.22;
  const MAX_DPR = 2;

  // Kamera-basis (gir ca. 48° tilt – rolig diorama-/modellbordvinkel).
  const CAM_BASE = { x: 0.15, y: 16.5, z: 14.2 };
  const TILT = Math.atan2(CAM_BASE.y, CAM_BASE.z); // radianer
  const START_ZOOM = 1.24;   // startutsnitt: fjord + sentrum + nord/vest-landemerker
  const START_PAN = { x: 0.25, z: -0.35 };

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


  // Bydelsprofiler: mer enn bare høyde/tetthet. Profilene styrer kvartalsrytme,
  // takform, fargefamilie, grønnandel og små lokale objekt-typer uten å øke
  // generisk bymasse. Sub-profiler (Bjørvika/Tøyen/Kampen/Aker Brygge osv.)
  // velges av posisjon inne i større kartdistrikter.
  const DISTRICT_VISUAL_PROFILES = {
    sentrum: { hMin: 0.62, hMax: 1.22, cell: 0.016, gap: 0.007, dens: 0.84, footprint: 0.78, roof: 0.12, roofStyle: "flat", tone: "centrum", green: 0.08, blockRotation: -0.04, smallHouse: 0.02, localObject: "axis" },
    bjorvika: { hMin: 0.72, hMax: 1.35, cell: 0.018, gap: 0.009, dens: 0.70, footprint: 0.82, roof: 0.02, roofStyle: "flat", tone: "glass", green: 0.06, blockRotation: 0.46, smallHouse: 0.00, localObject: "promenade" },
    grunerlokka: { hMin: 0.46, hMax: 0.90, cell: 0.016, gap: 0.006, dens: 0.82, footprint: 0.76, roof: 0.56, roofStyle: "mixed", tone: "brick", green: 0.22, blockRotation: 0.12, smallHouse: 0.07, localObject: "courtyard" },
    frogner: { hMin: 0.42, hMax: 0.82, cell: 0.022, gap: 0.010, dens: 0.58, footprint: 0.70, roof: 0.45, roofStyle: "mixed", tone: "light_plaster", green: 0.34, blockRotation: -0.11, smallHouse: 0.10, localObject: "park_tree" },
    majorstuen: { hMin: 0.48, hMax: 0.90, cell: 0.020, gap: 0.009, dens: 0.66, footprint: 0.74, roof: 0.36, roofStyle: "mixed", tone: "light_plaster", green: 0.24, blockRotation: -0.02, smallHouse: 0.06, localObject: "square" },
    st_hanshaugen: { hMin: 0.46, hMax: 0.86, cell: 0.016, gap: 0.007, dens: 0.76, footprint: 0.74, roof: 0.50, roofStyle: "mixed", tone: "warm_block", green: 0.25, blockRotation: 0.04, smallHouse: 0.04, localObject: "hill_park" },
    gamle_oslo: { hMin: 0.50, hMax: 1.05, cell: 0.018, gap: 0.008, dens: 0.70, footprint: 0.78, roof: 0.20, roofStyle: "mixed", tone: "worker_brick", green: 0.14, blockRotation: 0.18, smallHouse: 0.04, localObject: "yard" },
    toyen: { hMin: 0.48, hMax: 0.88, cell: 0.018, gap: 0.009, dens: 0.66, footprint: 0.72, roof: 0.28, roofStyle: "mixed", tone: "toyen_warm", green: 0.24, blockRotation: -0.08, smallHouse: 0.06, localObject: "town_square" },
    kampen: { hMin: 0.28, hMax: 0.52, cell: 0.018, gap: 0.010, dens: 0.58, footprint: 0.64, roof: 0.88, roofStyle: "gable", tone: "wooden_warm", green: 0.30, blockRotation: 0.30, smallHouse: 0.80, localObject: "red_roof" },
    sagene: { hMin: 0.42, hMax: 0.82, cell: 0.016, gap: 0.007, dens: 0.74, footprint: 0.74, roof: 0.56, roofStyle: "mixed", tone: "worker_brick", green: 0.24, blockRotation: 0.10, smallHouse: 0.08, localObject: "river_yard" },
    bygdoy: { hMin: 0.24, hMax: 0.45, cell: 0.030, gap: 0.016, dens: 0.30, footprint: 0.56, roof: 0.70, roofStyle: "gable", tone: "villa_green", green: 0.65, blockRotation: -0.08, smallHouse: 0.70, localObject: "villa" },
    ekeberg: { hMin: 0.22, hMax: 0.44, cell: 0.031, gap: 0.017, dens: 0.24, footprint: 0.52, roof: 0.52, roofStyle: "gable", tone: "villa_green", green: 0.72, blockRotation: 0.18, smallHouse: 0.60, localObject: "lookout" },
    ullern: { hMin: 0.30, hMax: 0.62, cell: 0.026, gap: 0.014, dens: 0.42, footprint: 0.60, roof: 0.56, roofStyle: "gable", tone: "villa_green", green: 0.45, blockRotation: -0.10, smallHouse: 0.48, localObject: "villa" },
    alna: { hMin: 0.30, hMax: 0.66, cell: 0.034, gap: 0.014, dens: 0.54, footprint: 0.88, roof: 0.08, roofStyle: "flat", tone: "industri", green: 0.08, blockRotation: 0.04, smallHouse: 0.00, localObject: "industrial_shed" },
    nordstrand: { hMin: 0.26, hMax: 0.55, cell: 0.027, gap: 0.015, dens: 0.36, footprint: 0.58, roof: 0.70, roofStyle: "gable", tone: "villa_green", green: 0.55, blockRotation: 0.16, smallHouse: 0.56, localObject: "villa" },
    aker_brygge: { hMin: 0.36, hMax: 0.62, cell: 0.020, gap: 0.011, dens: 0.50, footprint: 0.68, roof: 0.05, roofStyle: "flat", tone: "waterfront", green: 0.06, blockRotation: 0.26, smallHouse: 0.00, localObject: "pier" }
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
  let landmarkGroup = null;
  let INVISIBLE_HIT_MAT = null;

  let W = 0, H = 0;
  let zoom = 1;
  let panX = 0, panZ = 0;
  let active = false;
  let dirty = true;
  let rafId = 0;

  let _places = null;
  let _loadStarted = false;
  let _lastLod = null;
  let hitTargets = [];
  let _visibleMiniatures = [];
  let _landmarkPlaceMap = {};

  const _stats = {
    placeMarkers: 0, instancedBuildings: 0, genericBuildings: 0, highRiseCount: 0,
    trees: 0, landmarks: 0, roadSegments: 0, landmarkCountByType: {},
    localObjects: 0, parkObjects: 0, waterfrontObjects: 0,
    visiblePlaceMiniatures: 0, placeMiniatureTypes: {}, hiddenDuplicateLandmarkPlaces: 0,
    placeLodLevel: null, culledPlaces: 0, nudgedPlaces: 0, clickableLandmarkPlaces: [],
    miniatureMeshTotal: 0, detailedMiniatures: 0, lowDetailMiniatures: 0
  };

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
  // Del 6 – Prioritering av History Go-places. Høyere score = vises tidligere
  // ved lav zoom og overlever LOD-grensene. Lav score til generiske
  // gatepunkter og små lokale punkter uten egen visuell type.
  function priorityOfPlace(p) {
    const cm = p.civiMap || {};
    let s = 0;
    if (typeof cm.priority === "number") s += cm.priority * 4 + 10;
    if (matchLandmarkForPlace(p)) s += 14;            // tilsvarer håndmodellert landemerke
    const type = resolvePlaceMiniatureType(p);
    if (type === "stadium" || type === "ice_arena") s += 8;
    else if (type === "museum" || type === "gallery" || type === "theatre" ||
             type === "music_venue" || type === "cinema" || type === "library") s += 6;
    else if (type === "fortress" || type === "civic" || type === "church") s += 5;
    else if (type === "station" || type === "university") s += 5;
    else if (type === "park" || type === "square" || type === "waterfront") s += 4;
    if (p.raw.frontImage || p.raw.cardImage || p.raw.image) s += 3;
    if (p.raw.quiz_profile) s += 2;
    const proj = project(p);
    if (proj) {
      const dCentre = Math.hypot(proj.x - 0.52, proj.y - 0.60); // sentrum/Karl Johan-aksen
      if (dCentre < 0.10) s += 4; else if (dCentre < 0.20) s += 2;
      if (proj.x > 0.55 && proj.x < 0.64 && proj.y > 0.59 && proj.y < 0.69) s += 2; // Bjørvika
    }
    try { if (window.visited && window.visited[p.id]) s += 3; } catch (e) { /* collected ukjent */ }
    if (type === "street") s -= 3;        // generiske gatepunkter
    else if (type === "default") s -= 2;  // punkter uten egen visuell type
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
    _lastLod = null;
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
    buildGreenSpaces();
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

  // Del 3 – Veiskjelett / byakser
  // Subtile bånd på terrenget som gjør byen lesbar og hjelper orientering.
  // Veiene skal ikke dominere; de binder sammen nøkkelstedene.
  function buildRoadRibbon(points, width, color, y) {
    const ribbon = extrudeShape(ribbonPolygon(points, width), 0.018, color, y, { cast: false, receive: false });
    _stats.roadSegments += Math.max(0, points.length - 1);
    return ribbon;
  }

  function buildAxes() {
    const land = window.CIVI_OSLO_LANDSCAPE || {};
    const g = new THREE.Group();
    const baseY = GROUND_Y + 0.04;
    _stats.roadSegments = 0;

    // Akerselva-korridoren – blå/grønn nord–sør-linje gjennom byen.
    if (land.akerselva) {
      g.add(extrudeShape(ribbonPolygon(land.akerselva, 0.014), 0.02, PAL.river, baseY, { cast: false, receive: false }));
      _stats.roadSegments += Math.max(0, land.akerselva.length - 1);
    }

    // Jernbaneaksen ved Oslo S / Bjørvika.
    const rail = [[0.40, 0.605], [0.47, 0.60], [0.535, 0.598], [0.60, 0.605], [0.665, 0.615]];
    g.add(buildRoadRibbon(rail, 0.009, PAL.rail, baseY + 0.005));

    // Karl Johans gate – byens paradeakse Oslo S -> Stortinget/Nationaltheatret
    // -> Slottet. Litt tydeligere og lysere enn de andre veiene, men fortsatt
    // subtil og lav på terrenget (ikke moderne kart-overlay).
    g.add(buildRoadRibbon(
      [[0.538, 0.588], [0.515, 0.58], [0.495, 0.575], [0.46, 0.575], [0.435, 0.566], [0.405, 0.558]],
      0.018, 0xf5ead0, baseY + 0.006
    ));

    // Ring 1 – svak sentrumssløyfe rundt kjernen.
    g.add(buildRoadRibbon(
      [[0.44, 0.60], [0.50, 0.585], [0.56, 0.595], [0.59, 0.635], [0.55, 0.665], [0.47, 0.665], [0.44, 0.63], [0.44, 0.60]],
      0.008, shade(PAL.road, -0.06), baseY
    ));

    // Ring 2 – større bue nord for sentrum.
    g.add(buildRoadRibbon(
      [[0.28, 0.535], [0.38, 0.47], [0.50, 0.45], [0.62, 0.46], [0.70, 0.505]],
      0.010, shade(PAL.road, -0.01), baseY
    ));

    // E18 / havneakse langs fjorden vest–øst.
    g.add(buildRoadRibbon(
      [[0.30, 0.685], [0.40, 0.667], [0.47, 0.657], [0.54, 0.66], [0.62, 0.66], [0.70, 0.675]],
      0.008, shade(PAL.road, -0.10), baseY - 0.002
    ));

    // Trondheimsveien / nordøst-akse mot Grünerløkka/Tøyen.
    g.add(buildRoadRibbon(
      [[0.53, 0.585], [0.56, 0.54], [0.59, 0.50], [0.625, 0.46], [0.65, 0.42]],
      0.008, shade(PAL.road, -0.04), baseY
    ));

    // Få, lokale forbindelser som hjelper nabolagslesing uten Google Maps-preg.
    g.add(buildRoadRibbon([[0.555, 0.455], [0.585, 0.485], [0.625, 0.518]], 0.007, shade(PAL.road, -0.02), baseY));
    g.add(buildRoadRibbon([[0.362, 0.445], [0.350, 0.505], [0.335, 0.575], [0.315, 0.640]], 0.007, shade(PAL.road, 0.01), baseY));
    g.add(buildRoadRibbon([[0.425, 0.458], [0.445, 0.490], [0.455, 0.515]], 0.006, shade(PAL.road, -0.03), baseY));
    g.add(buildRoadRibbon([[0.386, 0.655], [0.464, 0.613], [0.505, 0.646]], 0.010, 0xd8ceb9, baseY + 0.004));
    g.add(buildRoadRibbon([[0.626, 0.518], [0.662, 0.552], [0.690, 0.562]], 0.007, shade(PAL.road, -0.06), baseY));

    scene.add(g);
  }


  function addModelBox(g, nx, ny, w, d, h, c, y, rot) {
    const m = box(w, h, d, c);
    m.position.set(nx2x(nx), (y || GROUND_Y) + h / 2, ny2z(ny));
    if (rot) m.rotation.y = rot;
    g.add(m);
    return m;
  }

  function addTreeCluster(g, nx, ny, n, r, y) {
    const rng = mulberry32(hashStr(`tree:${nx}:${ny}:${n}`));
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2, rr = r * (0.25 + rng() * 0.75);
      const tr = coneMesh(0.09 + rng() * 0.04, 0.34 + rng() * 0.22, 7, 0x3f7a46 + Math.floor(rng() * 0x101000));
      tr.position.set(nx2x(nx + Math.cos(a) * rr), (y || GROUND_Y) + 0.03, ny2z(ny + Math.sin(a) * rr));
      g.add(tr);
    }
  }

  function buildGreenSpaces() {
    const g = new THREE.Group();
    const baseY = GROUND_Y + 0.052;
    _stats.parkObjects = 0;

    const parks = [
      { id: "st_hanshaugen", x: 0.455, y: 0.515, r: 0.48, sx: 1.15, sz: 0.82, c: 0x6fa66a },
      { id: "toyenparken", x: 0.625, y: 0.485, r: 0.43, sx: 1.05, sz: 0.80, c: 0x78a86b },
      { id: "botanisk", x: 0.610, y: 0.505, r: 0.25, sx: 0.9, sz: 0.9, c: 0x88b879 }
    ];
    parks.forEach((p0) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(p0.r, p0.r * 1.08, 0.05, 18), toMat(p0.c));
      m.scale.set(p0.sx, 1, p0.sz);
      m.position.set(nx2x(p0.x), baseY + 0.025, ny2z(p0.y));
      m.receiveShadow = true;
      g.add(m);
      _stats.parkObjects++;
    });

    // Grønne skuldre langs Akerselva – tydelig blå/grønn korridor gjennom Sagene/Løkka.
    const land = window.CIVI_OSLO_LANDSCAPE || {};
    if (land.akerselva) {
      g.add(extrudeShape(ribbonPolygon(land.akerselva, 0.035), 0.012, 0x5f8f59, baseY - 0.018, { cast: false, receive: false }));
      _stats.parkObjects++;
    }

    addTreeCluster(g, 0.455, 0.515, 8, 0.018, baseY);
    addTreeCluster(g, 0.625, 0.485, 7, 0.018, baseY);
    addTreeCluster(g, 0.610, 0.505, 6, 0.014, baseY);
    scene.add(g);
  }

  function buildLocalObjects() {
    const g = new THREE.Group();
    _stats.localObjects = 0;
    _stats.waterfrontObjects = 0;

    // Aker Brygge/Tjuvholmen og havnepromenaden: lave kaier, små brygger/båter.
    [[0.36,0.675,0.55,0.055,0.02,0.28],[0.405,0.665,0.48,0.050,0.02,0.22],[0.535,0.672,0.42,0.045,0.02,0.02],[0.610,0.665,0.46,0.050,0.02,-0.22]].forEach(([x,y,w,d,h,r]) => {
      addModelBox(g, x, y, w, d, h, 0xc9b894, GROUND_Y + 0.045, r);
      _stats.localObjects++; _stats.waterfrontObjects++;
    });
    [[0.34,0.705],[0.375,0.710],[0.415,0.700],[0.585,0.695],[0.625,0.700],[0.47,0.785],[0.525,0.825]].forEach(([x,y], i) => {
      const boat = new THREE.Group();
      boat.add(box(0.13, 0.035, 0.05, i % 2 ? 0xded8c8 : 0xb24a3a));
      const mast = box(0.012, 0.11, 0.012, 0xe8e2d4); mast.position.y = 0.05; boat.add(mast);
      boat.position.set(nx2x(x), WATER_Y + 0.035, ny2z(y));
      boat.rotation.y = (i % 3 - 1) * 0.45;
      g.add(boat);
      _stats.localObjects++; _stats.waterfrontObjects++;
    });

    // Lokale torg/overganger – uten labels, bare modellbordflater.
    [[0.626,0.518,0xd8a675],[0.555,0.485,0xc08d6a],[0.372,0.505,0xd5c4a5],[0.455,0.455,0xc9b79c]].forEach(([x,y,c]) => {
      addModelBox(g, x, y, 0.38, 0.28, 0.018, c, GROUND_Y + 0.055, -0.08);
      _stats.localObjects++;
    });

    // Kampen: små varme trehus-/saltak-objekter på skrå rytme.
    [[0.650,0.548],[0.668,0.535],[0.678,0.560],[0.642,0.570]].forEach(([x,y], i) => {
      const house = new THREE.Group();
      house.add(box(0.18, 0.20, 0.14, i % 2 ? 0xc98b58 : 0xd0a06e));
      const roof = gableRoof(0.20, 0.08, 0.16, 0x8f3b28); roof.position.y = 0.20; house.add(roof);
      house.position.set(nx2x(x), GROUND_Y + 0.07, ny2z(y));
      house.rotation.y = 0.35 + i * 0.13;
      g.add(house);
      _stats.localObjects++;
    });

    // Alna: flate industriskur/lagerhaller med brede gråbrune flater.
    [[0.735,0.505,0.48,0.30],[0.790,0.545,0.55,0.26],[0.700,0.585,0.42,0.28]].forEach(([x,y,w,d], i) => {
      addModelBox(g, x, y, w, d, 0.16 + i * 0.025, i % 2 ? 0x8d8780 : 0x777c7d, GROUND_Y + 0.055, 0.04);
      _stats.localObjects++;
    });

    // Bygdøy/Ekeberg: spredte villa-/utsiktsobjekter og grønne flekker.
    [[0.215,0.705],[0.250,0.735],[0.175,0.760],[0.675,0.720],[0.715,0.795]].forEach(([x,y], i) => {
      const villa = new THREE.Group();
      villa.add(box(0.16, 0.14, 0.13, 0xd8ccb6));
      const roof = gableRoof(0.17, 0.06, 0.14, 0x765c3f); roof.position.y = 0.14; villa.add(roof);
      villa.position.set(nx2x(x), GROUND_Y + 0.07, ny2z(y));
      villa.rotation.y = i * 0.27;
      g.add(villa);
      _stats.localObjects++;
    });

    scene.add(g);
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
    return DISTRICT_VISUAL_PROFILES[id] || DISTRICT_VISUAL_PROFILES.sentrum;
  }

  function districtVisualProfileForPoint(id, nx, ny) {
    const land = window.CIVI_OSLO_LANDSCAPE || {};
    if (pointInPoly(nx, ny, BYGDOY)) return DISTRICT_VISUAL_PROFILES.bygdoy;
    if (land.ekebergRidge && pointInPoly(nx, ny, land.ekebergRidge)) return DISTRICT_VISUAL_PROFILES.ekeberg;
    if (id === "gamle_oslo") {
      if (nx >= 0.555 && nx <= 0.64 && ny >= 0.595 && ny <= 0.68) return DISTRICT_VISUAL_PROFILES.bjorvika;
      if (nx >= 0.605 && nx <= 0.655 && ny >= 0.49 && ny <= 0.545) return DISTRICT_VISUAL_PROFILES.toyen;
      if (nx >= 0.640 && nx <= 0.690 && ny >= 0.525 && ny <= 0.575) return DISTRICT_VISUAL_PROFILES.kampen;
    }
    if (id === "frogner" && nx <= 0.42 && ny >= 0.63) return DISTRICT_VISUAL_PROFILES.aker_brygge;
    if (id === "frogner" && nx >= 0.33 && nx <= 0.43 && ny <= 0.59) return DISTRICT_VISUAL_PROFILES.majorstuen;
    return DISTRICT_VISUAL_PROFILES[id] || DISTRICT_VISUAL_PROFILES.sentrum;
  }

  function getDistrictVisualProfiles() {
    const out = {};
    Object.keys(DISTRICT_VISUAL_PROFILES).forEach((id) => { out[id] = Object.assign({}, DISTRICT_VISUAL_PROFILES[id]); });
    return out;
  }

  function buildingColor(col, tone, t) {
    if (tone === "industri") col.setHSL(0.09 + t * 0.04, 0.05 + t * 0.05, 0.40 + t * 0.16);
    else if (tone === "glass") col.setHSL(0.56 + t * 0.04, 0.10 + t * 0.08, 0.58 + t * 0.22);
    else if (tone === "waterfront") col.setHSL(0.12 + t * 0.05, 0.08 + t * 0.07, 0.58 + t * 0.18);
    else if (tone === "brick") col.setHSL(0.055 + t * 0.025, 0.24 + t * 0.12, 0.43 + t * 0.16);
    else if (tone === "worker_brick") col.setHSL(0.06 + t * 0.035, 0.18 + t * 0.10, 0.40 + t * 0.17);
    else if (tone === "toyen_warm") col.setHSL(0.05 + t * 0.09, 0.20 + t * 0.14, 0.46 + t * 0.18);
    else if (tone === "wooden_warm") col.setHSL(0.04 + t * 0.06, 0.30 + t * 0.18, 0.42 + t * 0.20);
    else if (tone === "light_plaster") col.setHSL(0.095 + t * 0.035, 0.12 + t * 0.09, 0.58 + t * 0.16);
    else if (tone === "warm_block") col.setHSL(0.075 + t * 0.04, 0.18 + t * 0.1, 0.48 + t * 0.18);
    else if (tone === "villa_green") col.setHSL(0.105 + t * 0.05, 0.13 + t * 0.09, 0.52 + t * 0.18);
    else if (tone === "centrum") col.setHSL(0.085 + t * 0.04, 0.13 + t * 0.1, 0.50 + t * 0.20);
    else if (tone === "green") col.setHSL(0.10 + t * 0.05, 0.14 + t * 0.1, 0.46 + t * 0.18);
    else col.setHSL(0.075 + t * 0.05, 0.16 + t * 0.1, 0.44 + t * 0.20); // block
    return col;
  }

  function roofColor(col, b) {
    if (b.roofTone === "wooden_warm") col.setHSL(0.045 + b.tone * 0.025, 0.42, 0.27 + b.tone * 0.08);
    else if (b.roofTone === "villa_green") col.setHSL(0.06 + b.tone * 0.03, 0.24, 0.32 + b.tone * 0.09);
    else col.setHSL(0.055 + b.tone * 0.03, 0.30, 0.30 + b.tone * 0.1);
    return col;
  }


  function landmarkClearanceAt(nx, ny) {
    let best = null;
    LANDMARK_CLEAR_ZONES.forEach((z) => {
      const dist = Math.hypot(nx - z.x, ny - z.y);
      if (dist <= z.r && (!best || dist < best.dist)) best = { zone: z, dist };
    });
    return best;
  }

  function clearZoneBuildingFactor(nx, ny) {
    const hit = landmarkClearanceAt(nx, ny);
    if (!hit) return 1;
    const t = hit.dist / Math.max(0.0001, hit.zone.r);
    if (t < 0.46) return 0;
    return clamp(0.42 + t * 0.52, 0.42, 0.88);
  }

  function buildCity() {
    const districts = window.CIVI_MAP_DISTRICTS || [];
    const blocks = [];
    districts.forEach((d) => {
      const poly = d.shape;
      if (!poly || !poly.length) return;
      const baseProf = districtBuildProfile(d.id);
      const rng = mulberry32(hashStr(d.id) ^ 0x5151);
      const cx = (d.center && d.center[0]) || 0.5;
      const cy = (d.center && d.center[1]) || 0.5;
      const angBase = baseProf.blockRotation != null ? baseProf.blockRotation : ((hashStr(d.id) % 100) / 100 - 0.5) * 0.5;
      const ca = Math.cos(angBase), sa = Math.sin(angBase);
      const bb = polyBBox(poly);
      const stepX = baseProf.cell + baseProf.gap;
      const stepY = baseProf.cell + baseProf.gap;
      const pad = stepX;
      for (let gy = bb.minY - pad; gy <= bb.maxY + pad; gy += stepY) {
        for (let gx = bb.minX - pad; gx <= bb.maxX + pad; gx += stepX) {
          // roter rutenettet rundt bydelssenter -> antydede gater i vinkel.
          const lx = gx - cx, ly = gy - cy;
          const nx = cx + lx * ca - ly * sa;
          const ny = cy + lx * sa + ly * ca;
          if (!pointInPoly(nx, ny, poly)) continue;
          const prof = districtVisualProfileForPoint(d.id, nx, ny);
          const clearFactor = clearZoneBuildingFactor(nx, ny);
          if (clearFactor <= 0) continue;
          if (rng() > prof.dens * clearFactor) continue;
          if (rng() < prof.green * 0.18) continue; // små lommer/bakgårder/parker uten flere mesh
          // Kvartal: profilert fotavtrykk + litt variasjon. Småhusprofiler gir
          // lavere, smalere volum med salttak (Kampen/Bygdøy/Nordstrand).
          const small = rng() < prof.smallHouse;
          const fw = prof.cell * (prof.footprint * (0.82 + rng() * 0.28)) * MAP_W * (0.78 + clearFactor * 0.22) * (small ? 0.68 : 1);
          const fd = prof.cell * (prof.footprint * (0.82 + rng() * 0.28)) * MAP_D * (0.78 + clearFactor * 0.22) * (small ? 0.72 : 1);
          const h = (prof.hMin + Math.pow(rng(), 1.4) * (prof.hMax - prof.hMin)) * (0.58 + clearFactor * 0.42) * (small ? 0.82 : 1);
          const roof = (small || rng() < prof.roof * clearFactor) && Math.min(fw, fd) < 0.66;
          const ang = prof.blockRotation != null ? prof.blockRotation : angBase;
          blocks.push({
            x: nx2x(nx), z: ny2z(ny), fw, fd, h, rot: ang + (rng() - 0.5) * (small ? 0.34 : 0.12),
            tone: rng(), toneKind: prof.tone, roof, roofTone: prof.tone, small
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
        roofMesh.setColorAt(ri, roofColor(col, b));
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
    _stats.genericBuildings = blocks.length;
    // «Høyhus» i den generiske massen: skal nå være svært få (Oslo-profil).
    _stats.highRiseCount = blocks.reduce((n, b) => n + (b.h > 1.4 ? 1 : 0), 0);
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
  // Del 4/5 – Håndlagde Oslo-landemerker (nøkkelsteder)
  // ---------------------------------------------------------------------------
  // --- Nøkkelsteder, samlet i én justerbar struktur -------------------------
  // Normalisert x/y (samme system som resten av kartet). baseY default = GROUND_Y.
  // opts videresendes til byggeren (farge/høyde/varianter). Endre tallene her
  // for å flytte/skalere et landemerke uten å røre byggekoden.
  //
  // Lesbarhetsaudit / visuell prioritet:
  // priority 1 skal leses umiddelbart i vanlig spillkamera:
  // - Holmenkollen
  // - Barcode/Bjørvika/Operaen
  // - Slottet/Karl Johan
  // - Akershus/Rådhuset
  // - Ullevaal/Bislett/Jordal
  // priority 2 skal støtte mini-Oslo ved litt zoom, uten å konkurrere like hardt:
  // - Oslo S/Plaza/Posthuset
  // - Aker Brygge
  // - Tøyen torg
  // - Kampen
  // - Frognerparken
  // - Nationaltheatret/Stortinget/Deichman/Munch
  const LANDMARK_VISUAL_PRIORITY = {
    holmenkollen: 1, barcode: 1, operaen: 1, slottet: 1, akershus: 1, radhuset: 1,
    ullevaal: 1, bislett: 1, jordal: 1,
    oslo_s: 2, oslo_plaza: 2, posthuset: 2, aker_brygge: 2, toyen_torg: 2, kampen: 2,
    frognerparken: 2, nationaltheatret: 2, stortinget: 2, deichman: 2, munch: 2
  };

  const OSLO_KEY_LANDMARKS = [
    { id: "holmenkollen",     type: "ski_jump",          x: 0.285, y: 0.108, scale: 1.08, baseY: MARKA_H, rot: 0.18 },
    { id: "ullevaal",         type: "football_stadium",  x: 0.416, y: 0.255, scale: 1.26, rot: -0.08, opts: { h: 0.46 } },
    { id: "frognerparken",    type: "park_monument",     x: 0.302, y: 0.462, scale: 1.08, rot: 0.12 },
    { id: "bislett",          type: "athletics_stadium", x: 0.425, y: 0.458, scale: 1.04, rot: 0.16, opts: { h: 0.28 } },
    { id: "slottet",          type: "palace",            x: 0.404, y: 0.558, scale: 1.12, rot: -0.05 },
    { id: "nationaltheatret", type: "theatre",           x: 0.458, y: 0.574, scale: 0.82 },
    { id: "stortinget",       type: "civic_low",         x: 0.492, y: 0.574, scale: 0.88, opts: { h: 0.5 } },
    { id: "posthuset",        type: "post_tower",        x: 0.516, y: 0.570, scale: 0.86, opts: { h: 1.62, color: 0x777f88 } },
    { id: "oslo_s",           type: "station_hall",      x: 0.535, y: 0.590, scale: 1.05, rot: 0.02, opts: { color: 0xa2adb4, h: 0.34 } },
    { id: "oslo_plaza",       type: "plaza_tower",       x: 0.550, y: 0.577, scale: 0.9, opts: { h: 2.25, w: 0.24, d: 0.28, color: 0x3f5063, crown: true } },
    { id: "radhuset",         type: "city_hall",         x: 0.464, y: 0.613, scale: 1.08, rot: -0.03 },
    { id: "deichman",         type: "culture_block",     x: 0.516, y: 0.613, scale: 0.78, opts: { color: 0xd0c8b9, h: 0.72 } },
    { id: "akershus",         type: "fortress",          x: 0.505, y: 0.646, scale: 1.13, rot: 0.13 },
    { id: "aker_brygge",      type: "waterfront",        x: 0.386, y: 0.655, scale: 1.12, rot: 0.28 },
    { id: "barcode",          type: "barcode_row",       x: 0.573, y: 0.622, scale: 0.94, rot: 0.46, opts: { hScale: 0.9 } },
    { id: "munch",            type: "culture_block",     x: 0.600, y: 0.636, scale: 0.88, rot: -0.32, opts: { color: 0x6b737c, h: 1.08, lean: true } },
    { id: "operaen",          type: "opera",             x: 0.584, y: 0.657, scale: 1.12, rot: -0.18, baseY: 0.035 },
    { id: "toyen_torg",       type: "town_square",       x: 0.626, y: 0.518, scale: 0.92, rot: -0.08, opts: { h: 0.28, color: 0xd8a675 } },
    { id: "kampen",           type: "wooden_houses",     x: 0.662, y: 0.552, scale: 0.9, rot: 0.18, opts: { h: 0.36, warm: true } },
    { id: "jordal",           type: "ice_arena",         x: 0.690, y: 0.562, scale: 1.05, rot: -0.12, opts: { color: 0xd9e3e6, ice: 0x9fd3e8 } }
  ];

  const LANDMARK_CLEAR_ZONES = [
    { id: "slottet", x: 0.404, y: 0.558, r: 0.037 },
    { id: "akershus", x: 0.505, y: 0.646, r: 0.035 },
    { id: "radhuset", x: 0.464, y: 0.613, r: 0.032 },
    { id: "operaen", x: 0.584, y: 0.657, r: 0.034 },
    { id: "barcode", x: 0.573, y: 0.622, r: 0.030 },
    { id: "ullevaal", x: 0.416, y: 0.255, r: 0.041 },
    { id: "bislett", x: 0.425, y: 0.458, r: 0.032 },
    { id: "jordal", x: 0.690, y: 0.562, r: 0.030 },
    { id: "toyen_torg", x: 0.626, y: 0.518, r: 0.028 },
    { id: "frognerparken", x: 0.302, y: 0.462, r: 0.038 }
  ];

  // --- Del 2 – Mapping: History Go-place <-> håndmodellert landemerke ---------
  // Hindrer at et place som ALLEREDE finnes som håndmodellert landemerke får en
  // ekstra generisk place-miniatyr oppå modellen. Nøklene er landmark-id-er fra
  // OSLO_KEY_LANDMARKS; verdiene er place-id-/navn-aliaser. Trenger ikke være
  // perfekt – skal bare hindre åpenbare duplikater.
  const HAND_MODELED_PLACE_ALIASES = {
    holmenkollen: ["holmenkollen", "holmenkollbakken"],
    ullevaal: ["ullevaal", "ullevaal_stadion"],
    bislett: ["bislett", "bislett_stadion"],
    jordal: ["jordal", "jordal_amfi"],
    slottet: ["slottet", "det_kongelige_slott", "kongelige_slott"],
    akershus: ["akershus", "akershus_festning"],
    radhuset: ["radhuset", "oslo_radhus", "oslo_rådhus"],
    operaen: ["operaen", "oslo_opera", "den_norske_opera", "operahuset"],
    barcode: ["barcode", "bjorvika_barcode"],
    oslo_s: ["oslo_s", "oslo_sentralstasjon"],
    aker_brygge: ["aker_brygge", "tjuvholmen"],
    frognerparken: ["frognerparken", "vigelandsparken"],
    munch: ["munch", "munch_museet", "munchmuseet"],
    nationaltheatret: ["nationaltheatret", "national_theatret"],
    stortinget: ["stortinget"],
    deichman: ["deichman", "deichmanske", "deichman_bjorvika"],
    oslo_plaza: ["oslo_plaza", "radisson_plaza"],
    posthuset: ["posthuset", "postgirobygget"],
    toyen_torg: ["toyen_torg"],
    kampen: ["kampen"]
  };

  function normId(s) {
    return String(s == null ? "" : s).trim().toLowerCase().replace(/[\s-]+/g, "_");
  }

  // Matcher place mot håndmodellert landemerke. Returnerer { landmarkId, exact }
  // eller null. Eksakte id/navn-treff sjekkes FØR delstreng-treff (>= 9 tegn), så
  // f.eks. «Nationaltheatret» (teater) vinner over «Nationaltheatret stasjon»
  // (delstreng) – og kan velges som det kanoniske stedet ved landemerket.
  function landmarkMatchInfo(p) {
    const id = normId(p.id);
    const name = normId(p.name);
    const keys = Object.keys(HAND_MODELED_PLACE_ALIASES);
    for (let k = 0; k < keys.length; k++) {
      const aliases = HAND_MODELED_PLACE_ALIASES[keys[k]];
      for (let i = 0; i < aliases.length; i++) {
        const a = aliases[i];
        if (id === a || name === a) return { landmarkId: keys[k], exact: true };
      }
    }
    for (let k = 0; k < keys.length; k++) {
      const aliases = HAND_MODELED_PLACE_ALIASES[keys[k]];
      for (let i = 0; i < aliases.length; i++) {
        const a = aliases[i];
        if (a.length >= 9 && (id.indexOf(a) !== -1 || name.indexOf(a) !== -1)) return { landmarkId: keys[k], exact: false };
      }
    }
    return null;
  }

  function matchLandmarkForPlace(p) {
    const info = landmarkMatchInfo(p);
    return info ? info.landmarkId : null;
  }

  function getLandmarkEntry(landmarkId) {
    return OSLO_KEY_LANDMARKS.find((e) => e.id === landmarkId) || null;
  }

  // --- Del 4 – Landemerke-archetypes (enkle, gjenkjennelige miniatyrer) ------
  // Hver returnerer { group, h } med bunn på lokal y=0.

  // 1. Holmenkollen – gjenkjennelig skihopp: grønn landingsås, lyst ståltårn,
  // skrått tilløp/inrun med utkraget hoppkant og et lite tribuneamfi nederst.
  // Leses som skihopp fra standardvinkelen: tårn bak (nord), bakken ned mot
  // publikum (sør/+z). Ikonisk, men holdt lav nok til ikke å dominere kartet.
  function createSkiJump() {
    const g = new THREE.Group();
    const steel = 0xdfe5ea, snow = 0xeff4f9, green = 0x49823f;

    // Grønn landingsås – bred kile som heller ned mot publikum.
    const hill = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.5, 0.3, 18), toMat(green));
    hill.scale.set(1, 1, 1.55); hill.position.set(0, 0.15, 0.2); hill.receiveShadow = true; g.add(hill);

    // Tribune-/utsiktsamfi nederst foran (halv ring).
    const stand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.76, 0.2, 18, 1, false, 0, Math.PI), toMat(0xb7bdc2)
    );
    stand.position.set(0, 0.1, 1.0); stand.castShadow = true; stand.receiveShadow = true; g.add(stand);

    // Snøhvit landingsbakke som heller ned mot fronten.
    const landing = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 1.25), toMat(snow));
    landing.position.set(0, 0.5, 0.5); landing.rotation.x = 0.5; landing.castShadow = true; landing.receiveShadow = true; g.add(landing);

    // Lyst ståltårn bak (konstruksjonsfarge).
    const tower = box(0.22, 1.5, 0.28, steel); tower.position.set(0, 0.92, -0.78); g.add(tower);
    [-0.13, 0.13].forEach((x) => {
      const leg = box(0.05, 1.42, 0.06, shade(steel, -0.1));
      leg.position.set(x, 0.71, -0.78); leg.rotation.z = x > 0 ? -0.11 : 0.11; g.add(leg);
    });

    // Skrått tilløp/inrun fra tårntoppen ned til hoppkanten.
    const inrun = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.06, 1.4), toMat(snow));
    inrun.position.set(0, 1.06, -0.18); inrun.rotation.x = 0.66; inrun.castShadow = true; g.add(inrun);

    // Utkraget hoppkant (ikonisk overheng).
    const lip = box(0.3, 0.09, 0.34, steel); lip.position.set(0, 0.62, 0.42); g.add(lip);

    return { group: g, h: 1.7 };
  }

  // 2/3. Smalt høyt tårn (Plaza) og lavere bredt tårn (Posthuset).
  function createPlazaTower(o) {
    const g = new THREE.Group();
    const h = o.h || 2.6, w = o.w || 0.3, d = o.d || 0.34, c = o.color || 0x3b4b5f;
    g.add(box(w, h, d, c));
    const cap = box(w * 0.82, 0.08, d * 0.82, shade(c, 0.12)); cap.position.y = h; g.add(cap);
    // Glassbånd på de to fronene som vender mot kameraet.
    const glass = box(w * 0.62, h * 0.9, 0.02, shade(c, 0.22)); glass.position.set(0, h * 0.5, d / 2); g.add(glass);
    // Plaza får en slank topp-setback + antenne så den leses som ÉT høyt tårn.
    if (o.crown) {
      const top = box(w * 0.6, 0.18, d * 0.6, shade(c, 0.06)); top.position.set(0, h + 0.08, 0); g.add(top);
      const mast = cyl(0.012, 0.012, 0.34, 6, shade(c, 0.3)); mast.position.y = h + 0.17; g.add(mast);
    }
    return { group: g, h };
  }
  function createPostTower(o) {
    // Lavere og bredere enn Plaza – tydelig flatt, massivt kontortårn.
    const t = createPlazaTower({ h: (o && o.h) || 1.95, w: 0.52, d: 0.46, color: (o && o.color) || 0x707783 });
    const c = (o && o.color) || 0x707783;
    const podium = box(0.66, 0.34, 0.6, shade(c, -0.06)); podium.position.set(0, 0.17, 0.04); t.group.add(podium);
    return t;
  }

  // Oslo S – lav/lang stasjonsform med tydelig hallpreg: et bredt, lavt
  // terminalbygg med buet glasstak (perronghall) langs lengden og en liten
  // sentral inngangsgavl. Lavt, men langt – forklarer transitt, ikke høyde.
  function createStationHall(o) {
    const g = new THREE.Group();
    const c = (o && o.color) || 0x9aa6b0, h = (o && o.h) || 0.4;

    // Lavt, langt terminalbygg.
    const body = box(1.25, h, 0.52, c); body.position.set(0, h / 2, 0); g.add(body);

    // Buet glass-perronghall langs lengden (halv sylinder).
    const hall = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 1.15, 16, 1, false, 0, Math.PI),
      toMat(shade(c, 0.16))
    );
    hall.rotation.z = Math.PI / 2; hall.position.set(0, h, -0.02); hall.castShadow = true; hall.receiveShadow = true; g.add(hall);

    // Liten sentral inngangsgavl mot byen (+z).
    const entry = box(0.34, h * 0.95, 0.12, shade(c, -0.08)); entry.position.set(0, h * 0.475, 0.28); g.add(entry);
    const gable = gableRoof(0.36, 0.12, 0.14, shade(c, -0.14)); gable.position.set(0, h * 0.95, 0.28); g.add(gable);

    return { group: g, h: h + 0.24 };
  }

  // Barcode – distinkt «strekkode»-rad med smale, ulike tårn. Dette er kartets
  // hovedområde for høyhus. Variert høyde, bredde og fargetone, tydelig mellomrom
  // mellom slankene, holdt nær Bjørvika/Oslo S. Ikke for mange/brede tårn.
  function createBarcodeRow(o) {
    const g = new THREE.Group();
    const hScale = (o && o.hScale) || 1;
    const cols = [0x37495d, 0x3f5266, 0x435a6e, 0x4a5d6f, 0x3a4e62];
    // Forhåndsbestemt variasjon (deterministisk, leses som ulike tårn).
    const slabs = [
      { h: 1.45, w: 0.16 }, { h: 1.9, w: 0.18 }, { h: 1.25, w: 0.14 },
      { h: 2.05, w: 0.2 }, { h: 1.6, w: 0.15 }, { h: 1.35, w: 0.17 },
      { h: 1.95, w: 0.16 }, { h: 1.5, w: 0.19 }
    ];
    let x = -0.72;
    slabs.forEach((s, i) => {
      const tw = createPlazaTower({ h: s.h * hScale, w: s.w, d: 0.5, color: cols[i % cols.length] });
      tw.group.position.set(x, 0, (i % 2) * 0.05 - 0.025);
      g.add(tw.group);
      x += s.w + 0.04;
    });
    return { group: g, h: 2.05 * hScale };
  }

  // Operaen – lav, hvit og bred kileform som heller skrått ned mot fjorden
  // (+z). Den skrå takflaten kan vandres på; et lavt glass-/scenetårn bryter
  // ryggen og en hvit marmorplass møter vannkanten. Lav, bred, lett geometri.
  function createOpera() {
    const g = new THREE.Group();
    const white = 0xece9e1, glass = 0xb6c5cd;

    // Tverrsnitt (X-Y): rygg ved x=0 (høyde H), heller ned til x=depth (y=0).
    const L = 1.95, depth = 1.35, H = 0.6;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0); shape.lineTo(depth, 0); shape.lineTo(0, H); shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: L, bevelEnabled: false });
    geo.translate(0, 0, -L / 2);   // sentrer langs bredden (ekstrudering)
    geo.rotateY(-Math.PI / 2);     // skråflaten vender mot +z (vannet)
    geo.translate(0, 0, -depth / 2);
    const roof = new THREE.Mesh(geo, toMat(white));
    roof.castShadow = true; roof.receiveShadow = true; g.add(roof);

    // Lavt glass-/scenetårn som bryter ryggen.
    const tower = box(0.5, 0.46, 0.34, glass); tower.position.set(0, 0.23, -depth / 2 - 0.04); g.add(tower);

    // Hvit marmorplass mot vannkanten.
    const apron = box(L * 0.94, 0.03, 0.42, 0xdedacf);
    apron.position.set(0, 0, depth / 2 + 0.18); apron.receiveShadow = true; g.add(apron);

    return { group: g, h: H };
  }

  // Munch / Deichman – egne kulturblokker (Munch får en svak knekk på toppen).
  function createCultureBlock(o) {
    const g = new THREE.Group();
    const c = (o && o.color) || 0x6f7a86, h = (o && o.h) || 1.2;
    g.add(box(0.46, h, 0.46, c));
    if (o && o.lean) {
      const top = box(0.46, h * 0.3, 0.46, shade(c, 0.06));
      top.position.set(0.08, h * 0.85, 0); top.rotation.z = -0.08; g.add(top);
    }
    const cap = box(0.5, 0.05, 0.5, shade(c, -0.1)); cap.position.y = h; g.add(cap);
    return { group: g, h };
  }

  // Akershus festning – lav, massiv borg på en festningsodde mot fjorden:
  // tydelig ringmur rundt en borggård, tre tårn (ett høyt hovedtårn med spiss
  // + to lavere hjørnetårn). Steinmateriale, klart adskilt fra vanlige bygg.
  function createFortress() {
    const g = new THREE.Group();
    const stone = 0x938a7c, wall = 0x8c8478, dark = 0x6b665a;

    // Festningsodde / bastion-sokkel (5-kant) som stikker ut mot fjorden.
    const baseH = 0.12;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.42, baseH, 5), toMat(0x8f8775));
    base.position.y = baseH / 2; base.rotation.y = 0.4; base.receiveShadow = true; g.add(base);

    // Borggård-gulv.
    const yard = box(1.12, 0.04, 1.12, shade(stone, 0.07)); yard.position.set(0, baseH + 0.02, 0); g.add(yard);

    // Ringmur (fire lave, massive murer) med murkrone.
    const wallH = 0.44, span = 0.62, th = 0.15;
    [[0, -span, 1.36, th], [0, span, 1.36, th], [-span, 0, th, 1.36], [span, 0, th, 1.36]].forEach(([x, z, w, d]) => {
      const m = box(w, wallH, d, wall); m.position.set(x, baseH + wallH / 2, z); g.add(m);
      const crown = box(w + 0.02, 0.05, d + 0.02, shade(wall, -0.1)); crown.position.set(x, baseH + wallH, z); g.add(crown);
    });

    // Hovedtårn (keep) med høy spiss.
    const keepH = 0.95;
    const keep = box(0.4, keepH, 0.4, shade(stone, 0.04)); keep.position.set(-0.16, baseH + keepH / 2, -0.12); g.add(keep);
    const spire = coneMesh(0.3, 0.5, 4, dark); spire.position.set(-0.16, baseH + keepH, -0.12); spire.rotation.y = Math.PI / 4; g.add(spire);

    // To lavere, runde hjørnetårn.
    [[0.46, 0.42], [0.46, -0.42]].forEach(([x, z]) => {
      const th2 = 0.66;
      const t = cyl(0.16, 0.18, th2, 12, stone); t.position.set(x, baseH + th2 / 2, z); g.add(t);
      const sp = coneMesh(0.2, 0.3, 12, dark); sp.position.set(x, baseH + th2, z); g.add(sp);
    });

    return { group: g, h: baseH + keepH + 0.5 };
  }

  // Rådhuset – Oslos ikoniske dobbelttårn: to massive rektangulære tegltårn
  // og en lavere, bred mellombygning med forplass mot fjorden. Mørkere
  // rød/brun steinpalett gjør det gjenkjennelig som rådhus, ikke to bokser.
  function createCityHall(o) {
    const g = new THREE.Group();
    const c = (o && o.color) || 0x9c4f33, dark = shade(c, -0.09);

    // Lav, bred mellombygning.
    const midH = 0.72;
    const mid = box(1.12, midH, 0.58, shade(c, 0.04)); mid.position.set(0, midH / 2, 0); g.add(mid);
    const midCap = box(1.16, 0.05, 0.62, dark); midCap.position.set(0, midH, 0); g.add(midCap);

    // To massive rektangulære tårn (litt ulik høyde, som de ekte).
    [[-0.35, 1.5], [0.35, 1.66]].forEach(([x, h]) => {
      const tw = box(0.42, h, 0.48, c); tw.position.set(x, h / 2, -0.04); g.add(tw);
      const cap = box(0.46, 0.07, 0.52, dark); cap.position.set(x, h, -0.04); g.add(cap);
      // Antydet vindusrille på fronten.
      const win = box(0.3, h * 0.82, 0.02, shade(c, 0.13)); win.position.set(x, h * 0.52, 0.22); g.add(win);
    });

    // Forplass mot fjorden (sør/+z).
    const court = box(0.92, 0.025, 0.5, 0xb6a07e); court.position.set(0, 0, 0.52); court.receiveShadow = true; g.add(court);

    return { group: g, h: 1.66 };
  }

  // Slottet – lavt, symmetrisk og horisontalt: hovedkropp + to fremskutte
  // sidefløyer, midtrisalitt med søylehint, gesims, og en plass/akse foran
  // (mot Karl Johan). Står på en enkel grønn slottsbakke. Lys gulaktig stein,
  // bevisst lave proporsjoner – ingen høyhusfølelse.
  function createPalace() {
    const g = new THREE.Group();
    const c = 0xe7d3a0, top = 0.18, bodyH = 0.5;

    // Slottsbakke (grønn høyde) rundt bygget.
    const hill = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 2.05, 0.18, 22), toMat(0x6f9460));
    hill.position.y = 0.09; hill.receiveShadow = true; g.add(hill);
    // Enkle parktrær på bakken.
    [[-1.0, -0.3], [1.05, -0.2], [-0.95, 0.55], [1.0, 0.5]].forEach(([x, z]) => {
      const tr = coneMesh(0.13, 0.42, 7, 0x3f7a46); tr.position.set(x, top, z); g.add(tr);
    });

    // Hovedkropp – lav, bred, horisontal.
    const main = box(1.3, bodyH, 0.46, c); main.position.set(0, top + bodyH / 2, 0); g.add(main);
    // Gesims/tak.
    const cap = box(1.36, 0.06, 0.5, shade(c, -0.13)); cap.position.set(0, top + bodyH, 0); g.add(cap);

    // To fremskutte sidefløyer.
    [-0.62, 0.62].forEach((x) => {
      const wing = box(0.34, bodyH * 0.92, 0.6, shade(c, -0.03));
      wing.position.set(x, top + bodyH * 0.46, 0.08); g.add(wing);
      const wcap = box(0.38, 0.05, 0.64, shade(c, -0.14)); wcap.position.set(x, top + bodyH * 0.92, 0.08); g.add(wcap);
    });

    // Midtrisalitt med søylehint.
    const ris = box(0.42, bodyH * 1.12, 0.16, shade(c, 0.05)); ris.position.set(0, top + bodyH * 0.56, 0.26); g.add(ris);
    for (let i = -1; i <= 1; i++) {
      const col = cyl(0.028, 0.028, bodyH * 0.8, 8, shade(c, 0.13)); col.position.set(i * 0.13, top, 0.33); g.add(col);
    }

    // Plass/akse foran (mot Karl Johan).
    const plaza = box(0.56, 0.025, 0.74, 0xcdbb97); plaza.position.set(0, top, 0.62); plaza.receiveShadow = true; g.add(plaza);

    return { group: g, h: top + bodyH + 0.06 };
  }

  // Nationaltheatret – lav kulturbygning med klassisk søylefront.
  function createTheatre(o) {
    const g = new THREE.Group();
    const c = (o && o.color) || PAL.culture, h = (o && o.h) || 0.55;
    g.add(box(0.8, h, 0.5, c));
    for (let i = -2; i <= 2; i++) {
      const col = cyl(0.045, 0.045, h * 0.95, 8, shade(c, 0.12)); col.position.x = i * 0.16; col.position.z = 0.28; g.add(col);
    }
    const ped = gableRoof(0.78, 0.16, 0.2, shade(c, -0.1)); ped.position.set(0, h, 0.28); g.add(ped);
    const roof = box(0.84, 0.06, 0.54, shade(c, -0.14)); roof.position.y = h; g.add(roof);
    return { group: g, h: h + 0.16 };
  }

  // Stortinget – lav civic-bygning med midtrotunde/kuppel.
  function createCivicLow(o) {
    const g = new THREE.Group();
    const c = (o && o.color) || 0xc9a96a, h = (o && o.h) || 0.55;
    g.add(box(0.9, h, 0.45, c));
    const drumH = 0.34;
    const rot = cyl(0.17, 0.19, drumH, 16, shade(c, 0.05)); rot.position.y = h + drumH / 2; g.add(rot);
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      toMat(shade(c, -0.08))
    );
    dome.position.y = h + drumH; g.add(dome);
    return { group: g, h: h + drumH + 0.18 };
  }

  // Aker Brygge / Tjuvholmen – tydelig vannkant/kai: en lang brygge-/kaikant,
  // en rad lave bryggeblokker med varierte saltak mot promenaden, en treplanke-
  // promenade, og småbåt-brygger som stikker ut i fjorden. Vannnær, ikke boligblokk.
  function createWaterfrontBlocks() {
    const g = new THREE.Group();
    const quayH = 0.07;

    // Kaikant / brygge-platting langs fjorden.
    const quay = box(1.5, quayH, 0.46, 0xb7a98c); quay.position.set(0, quayH / 2, 0); quay.receiveShadow = true; g.add(quay);
    // Trekledd promenade-stripe mot vannet (+z).
    const promenade = box(1.5, 0.02, 0.16, 0xc8b48f); promenade.position.set(0, quayH, 0.22); g.add(promenade);

    // Rad med lave bryggeblokker, varierte saltak og glassfasade mot vannet.
    const cols = [0xd9cab0, 0xc7b9a0, 0xcdd5d9, 0xd0c2a8, 0xd6c9b2];
    for (let i = 0; i < 6; i++) {
      const h = 0.34 + (i % 3) * 0.13, c = cols[i % cols.length], x = -0.62 + i * 0.25;
      const b = box(0.21, h, 0.32, c); b.position.set(x, quayH + h / 2, -0.07); g.add(b);
      const r = gableRoof(0.23, 0.1, 0.34, shade(c, -0.16)); r.position.set(x, quayH + h, -0.07); g.add(r);
      const glass = box(0.16, h * 0.66, 0.02, 0x9fc3d6); glass.position.set(x, quayH + h * 0.4, 0.1); g.add(glass);
    }

    // Småbåt-brygger som stikker ut i fjorden.
    [-0.35, 0.18, 0.6].forEach((x) => {
      const pier = box(0.1, 0.04, 0.42, 0xa89878); pier.position.set(x, quayH * 0.6, 0.42); g.add(pier);
    });
    // Et par små båter ved bryggene.
    [[-0.35, 0.58], [0.6, 0.55]].forEach(([x, z]) => {
      const boat = box(0.08, 0.05, 0.16, 0xe4e0d6); boat.position.set(x, quayH * 0.4, z); g.add(boat);
    });

    return { group: g, h: 0.6 };
  }

  // Tøyen torg – åpen lokal plass: en tydelig brolagt torgflate med lave bygg
  // rundt på tre–fire sider, og et lite torgtre/paviljong i midten.
  function createTownSquare(o) {
    const g = new THREE.Group();
    const baseColor = (o && o.color) || 0xc6b896;
    const heightFactor = ((o && o.h) || 0.42) / 0.42;
    // Åpen, brolagt torgflate.
    const plaza = box(0.95, 0.03, 0.95, baseColor); plaza.position.y = 0.015; plaza.receiveShadow = true; g.add(plaza);
    const inlay = box(0.5, 0.035, 0.5, shade(baseColor, -0.07)); inlay.position.y = 0.018; inlay.rotation.y = Math.PI / 4; g.add(inlay);

    // Lave bygg rundt torget (rammer plassen inn).
    const cols = [0xcdb89c, 0xc4b59a, 0xd0c1a4, 0xc9b59b];
    [[-0.62, -0.5], [0.0, -0.66], [0.62, -0.5], [0.66, 0.3], [-0.66, 0.3], [0.0, 0.66]].forEach(([x, z], i) => {
      const h = (0.42 + (i % 3) * 0.12) * heightFactor, c = cols[i % cols.length];
      const b = box(0.32, h, 0.3, c); b.position.set(x, h / 2, z); g.add(b);
      const r = gableRoof(0.34, 0.09, 0.32, shade(c, -0.16)); r.position.set(x, h, z); g.add(r);
    });

    // Lite torgtre i midten.
    const trunk = cyl(0.025, 0.03, 0.12, 6, 0x7a5a3a); trunk.position.set(0, 0.03, 0); g.add(trunk);
    const crown = coneMesh(0.14, 0.34, 8, 0x4f8a4a); crown.position.set(0, 0.15, 0); g.add(crown);

    return { group: g, h: 0.66 };
  }

  // Kampen – lav, tett klynge av små trehus/småhus i varme farger, med
  // saltak og små hager. Tydelig småhuspreg, ingen høyde.
  function createWoodenHousesCluster(o) {
    const g = new THREE.Group();
    const heightFactor = ((o && o.h) || 0.38) / 0.38;
    const cols = [0xc96f53, 0xd98b5e, 0xb5654a, 0xd9a86b, 0xc77f55, 0xcf9a62];
    const roofCols = [0x7a4636, 0x8a5a3e, 0x6f4334];
    const rng = mulberry32(0xCA3);
    // Liten grønn hageflate under husene.
    const yard = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.92, 0.03, 14), toMat(0x7fa05f));
    yard.position.y = 0.015; yard.receiveShadow = true; g.add(yard);
    for (let i = 0; i < 12; i++) {
      const x = (rng() - 0.5) * 1.25, z = (rng() - 0.5) * 1.25;
      const h = (0.22 + rng() * 0.16) * heightFactor, c = cols[i % cols.length];
      const rot = (rng() - 0.5) * 0.5;
      const b = box(0.2, h, 0.22, c); b.position.set(x, 0.03 + h / 2, z); b.rotation.y = rot; g.add(b);
      const r = gableRoof(0.24, 0.12, 0.26, roofCols[i % roofCols.length]); r.position.set(x, 0.03 + h, z); r.rotation.y = rot; g.add(r);
    }
    return { group: g, h: 0.5 };
  }

  // Jordal Amfi – ishall/amfi: rund, lav, kuppelaktig form med buet tak.
  // Skiller seg fra fotball-/friidrettsstadion (ingen åpen bane) – tett shell.
  function createIceArena(o) {
    const g = new THREE.Group();
    const shellColor = (o && o.color) || 0xc1c8ce;
    const iceColor = (o && o.ice) || 0xd6dce1;
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.58, 0.34, 26), toMat(shellColor));
    shell.scale.set(1.22, 1, 1); shell.position.y = 0.17; shell.castShadow = true; shell.receiveShadow = true; g.add(shell);
    // Buet, lukket tak (kuppel) – gjør den klart til ishall, ikke stadion.
    const roof = new THREE.Mesh(
      new THREE.SphereGeometry(0.56, 22, 11, 0, Math.PI * 2, 0, Math.PI / 2),
      toMat(iceColor)
    );
    roof.scale.set(1.22, 0.42, 1); roof.position.y = 0.34; roof.castShadow = true; roof.receiveShadow = true; g.add(roof);
    return { group: g, h: 0.58 };
  }

  // Ullevaal – kartets største stadion: rektangulær bowl med fire tribuner
  // rundt en grønn bane, og lysmaster i hjørnene. Tydelig fotballstadion.
  function createFootballStadium(o) {
    const g = new THREE.Group();
    const c = (o && o.color) || 0xcaced2, h = (o && o.h) || 0.46;
    const W2 = 0.92, D2 = 0.7, th = 0.16; // halv bredde/dybde, tribunetykkelse
    // Fire rette tribuner danner en rektangulær bowl.
    [[0, -D2, W2 * 2, th], [0, D2, W2 * 2, th], [-W2, 0, th, D2 * 2 - th], [W2, 0, th, D2 * 2 - th]].forEach(([x, z, w, d]) => {
      const stand = box(w, h, d, c); stand.position.set(x, h / 2, z); g.add(stand);
      const cap = box(w, 0.04, d, shade(c, -0.1)); cap.position.set(x, h, z); g.add(cap);
    });
    // Grønn bane i midten.
    const pitch = box(W2 * 1.5, 0.05, D2 * 1.4, 0x4f8f55); pitch.position.set(0, 0.025, 0); pitch.receiveShadow = true; g.add(pitch);
    const line = box(0.02, 0.06, D2 * 1.4, 0xdfe6df); line.position.set(0, 0.03, 0); g.add(line);
    // Lysmaster i hjørnene.
    [[-W2, -D2], [W2, -D2], [-W2, D2], [W2, D2]].forEach(([x, z]) => {
      const mast = cyl(0.02, 0.02, h + 0.22, 6, 0x9aa0a6); mast.position.set(x, (h + 0.22) / 2, z); g.add(mast);
    });
    return { group: g, h: h + 0.22 };
  }

  // Bislett – lavere, oval friidrettsstadion: rødlig løpebane rundt grønt
  // infield, klart rundere/lavere enn Ullevaal.
  function createAthleticsStadium(o) {
    const g = new THREE.Group();
    const c = (o && o.color) || 0xc0907a, h = (o && o.h) || 0.3, sx = 1.28;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.52, h, 28), toMat(c));
    ring.scale.x = sx; ring.position.y = h / 2; ring.castShadow = true; ring.receiveShadow = true; g.add(ring);
    // Rødlig løpebane.
    const track = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, h * 0.55, 28), toMat(0xb24a3a));
    track.scale.x = sx; track.position.y = h * 0.6; track.receiveShadow = true; g.add(track);
    // Grønt infield.
    const pitch = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, h * 0.58, 28), toMat(0x4f8f55));
    pitch.scale.x = sx; pitch.position.y = h * 0.62; pitch.receiveShadow = true; g.add(pitch);
    return { group: g, h };
  }

  // Frognerparken / Vigeland – grønt parkrom med en tydelig midtakse, rader av
  // små trær langs aksen, og en monolitt-markør (høy, smal tilspisset søyle) på
  // en plinth i enden. Klart parkrom med monument, ikke bare tilfeldig grønt.
  function createParkMonumentAxis() {
    const g = new THREE.Group();
    const lawn = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.45, 0.05, 22), toMat(0x6aa66f));
    lawn.position.y = 0.025; lawn.receiveShadow = true; g.add(lawn);

    // Tydelig midtakse (gangvei) med trapp/plass-følelse.
    const axis = box(0.2, 0.025, 1.9, 0xd9cdba); axis.position.y = 0.05; g.add(axis);

    // Monolitten – plinth + høy, smal tilspisset søyle i aksens ende.
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.12, 16), toMat(0xcdbfa8));
    plinth.position.set(0, 0.06, -0.7); plinth.receiveShadow = true; g.add(plinth);
    const mono = cyl(0.05, 0.1, 0.85, 14, 0xe2d8c6); mono.position.set(0, 0.12, -0.7); g.add(mono);
    const tip = coneMesh(0.05, 0.16, 14, 0xe2d8c6); tip.position.set(0, 0.12 + 0.85, -0.7); g.add(tip);

    // Trerader langs aksen (rammer parkrommet inn).
    [[-0.42, 0.55], [0.42, 0.55], [-0.42, 0.0], [0.42, 0.0], [-0.5, -0.45], [0.5, -0.45]].forEach(([x, z]) => {
      const tr = coneMesh(0.11, 0.38, 7, 0x3f7a46); tr.position.set(x, 0.05, z); g.add(tr);
    });

    return { group: g, h: 1.0 };
  }

  const KEY_LANDMARK_BUILDERS = {
    ski_jump: createSkiJump,
    football_stadium: createFootballStadium,
    athletics_stadium: createAthleticsStadium,
    palace: createPalace,
    theatre: createTheatre,
    civic_low: createCivicLow,
    station_hall: createStationHall,
    plaza_tower: createPlazaTower,
    post_tower: createPostTower,
    barcode_row: createBarcodeRow,
    opera: createOpera,
    culture_block: createCultureBlock,
    fortress: createFortress,
    city_hall: createCityHall,
    waterfront: createWaterfrontBlocks,
    town_square: createTownSquare,
    wooden_houses: createWoodenHousesCluster,
    ice_arena: createIceArena,
    park_monument: createParkMonumentAxis
  };

  function buildKeyLandmark(entry) {
    const make = KEY_LANDMARK_BUILDERS[entry.type];
    if (!make) return null;
    const built = make(entry.opts || {});
    const group = built.group || built;
    const baseY = entry.baseY == null ? GROUND_Y : entry.baseY;
    group.position.set(nx2x(entry.x), baseY, ny2z(entry.y));
    if (entry.rot) group.rotation.y = entry.rot;
    if (entry.scale && entry.scale !== 1) group.scale.setScalar(entry.scale);
    group.userData = Object.assign({ landmarkId: entry.id, landmarkType: entry.type }, group.userData || {});
    return group;
  }

  function buildLandmarks() {
    const g = new THREE.Group();
    _stats.landmarks = 0;
    _stats.landmarkCountByType = {};
    OSLO_KEY_LANDMARKS.forEach((entry) => {
      const node = buildKeyLandmark(entry);
      if (!node) return;
      g.add(node);
      _stats.landmarks++;
      _stats.landmarkCountByType[entry.type] = (_stats.landmarkCountByType[entry.type] || 0) + 1;
    });
    landmarkGroup = g;
    scene.add(g);
  }

  function getLandmarkPositions() {
    return OSLO_KEY_LANDMARKS.map((e) => {
      const clearZone = LANDMARK_CLEAR_ZONES.find((z) => z.id === e.id);
      return {
        id: e.id,
        type: e.type,
        x: e.x,
        y: e.y,
        scale: e.scale == null ? 1 : e.scale,
        priority: LANDMARK_VISUAL_PRIORITY[e.id] || null,
        clearZoneRadius: clearZone ? clearZone.r : null
      };
    });
  }

  // ---------------------------------------------------------------------------
  // Del 3 – Place miniature archetypes (History Go-place-miniatyrer)
  // ---------------------------------------------------------------------------
  // Små, stedstilpassede 3D-miniatyrer for faktiske places. Enkel Three.js-
  // geometri (primitiver), få mesh per miniature, ingen eksterne modeller, ingen
  // teksturer, ingen tekstlabels. Underordnet de håndmodellerte landemerkene.
  // Hver bygger returnerer { group, h } med bunn på lokal y=0.
  //
  // Del 1 – Felles detalj-helpere. Alle legger primitive mesh i en gruppe
  // (lokal origo, bunn y=0). De holdes lette og kalles typisk bare når LOD gir
  // nok detalj. Ingen tekst – «skilt» er blanke flater (addMiniSignShape).
  function lodDetail(lod) {
    if (lod === "veryHigh") return 3;
    if (lod === "high") return 2;
    if (lod === "mid") return 1;
    return 0; // low: kun kropp + silhuett
  }
  // Del 9 – dempet detaljpalett avledet av kroppsfargen.
  function winMat(c) { return mixHex(0x7e94a6, c, 0.14); } // dempet blå/grå vinduer
  function doorMat(c) { return shade(c, -0.24); }          // mørkere dør

  function addWindows(g, c, opts) {
    const o = opts || {};
    const cols = o.cols || 3, rows = o.rows || 1;
    const y0 = o.y0 != null ? o.y0 : 0.12, dy = o.dy != null ? o.dy : 0.11;
    const spanX = o.spanX != null ? o.spanX : 0.32, z = o.z != null ? o.z : 0.2;
    const w = o.w != null ? o.w : 0.05, wh = o.wh != null ? o.wh : 0.06, depth = o.depth || 0.02;
    const mat = winMat(c);
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < cols; i++) {
        const x = cols > 1 ? -spanX / 2 + spanX * (i / (cols - 1)) : 0;
        const win = box(w, wh, depth, mat);
        win.position.set(x, y0 + r * dy, z);
        if (o.rot) win.rotation.y = o.rot;
        g.add(win); n++;
      }
    }
    return n;
  }
  function addWindowBands(g, c, opts) {
    // Brede, rolige vindusbånd (få mesh) – f.eks. bibliotek/galleri.
    const o = opts || {};
    const rows = o.rows || 2, y0 = o.y0 != null ? o.y0 : 0.12, dy = o.dy != null ? o.dy : 0.12;
    const w = o.w != null ? o.w : 0.34, z = o.z != null ? o.z : 0.205;
    const mat = winMat(c);
    let n = 0;
    for (let r = 0; r < rows; r++) {
      const band = box(w, o.bh || 0.05, 0.02, mat);
      band.position.set(0, y0 + r * dy, z); g.add(band); n++;
    }
    return n;
  }
  function addDoor(g, c, opts) {
    const o = opts || {};
    const w = o.w || 0.1, hh = o.h || 0.14, z = o.z != null ? o.z : 0.2;
    const d = box(w, hh, o.depth || 0.03, doorMat(c));
    d.position.set(o.x || 0, hh / 2, z);
    g.add(d); return 1;
  }
  function addSteps(g, c, opts) {
    const o = opts || {};
    const n = o.n || 2, w = o.w || 0.4, z = o.z != null ? o.z : 0.24, mat = shade(c, 0.06);
    for (let i = 0; i < n; i++) {
      const s = box(w - i * 0.07, 0.025, 0.05 + (n - i) * 0.02, mat);
      s.position.set(0, 0.013 + i * 0.025, z + i * 0.03);
      g.add(s);
    }
    return n;
  }
  function addColumns(g, c, opts) {
    const o = opts || {};
    const n = o.n || 3, h = o.h || 0.28, z = o.z != null ? o.z : 0.2, spanX = o.spanX || 0.36, r = o.r || 0.024;
    const mat = shade(c, 0.12);
    for (let i = 0; i < n; i++) {
      const x = n > 1 ? -spanX / 2 + spanX * (i / (n - 1)) : 0;
      const col = cyl(r, r, h, 6, mat);
      col.position.set(x, h / 2, z);
      g.add(col);
    }
    return n;
  }
  function addRoofDetails(g, c, opts) {
    const o = opts || {};
    const w = o.w || 0.5, d = o.d || 0.4, y = o.y != null ? o.y : 0.32;
    let n = 0;
    const cap = box(w + 0.06, 0.04, d + 0.06, shade(c, -0.13)); // takgesims
    cap.position.y = y; g.add(cap); n++;
    if (o.penthouse) {
      const ph = box(w * 0.38, 0.06, d * 0.38, shade(c, -0.05)); // lite takoppbygg
      ph.position.set(o.phx || 0, y + 0.05, o.phz || 0); g.add(ph); n++;
    }
    return n;
  }
  function addChimney(g, c, opts) {
    const o = opts || {};
    const w = o.w || 0.04, h = o.h || 0.12;
    const ch = box(w, h, w, shade(c, -0.2));
    ch.position.set(o.x != null ? o.x : 0.1, (o.base || 0.3) + h / 2, o.z != null ? o.z : -0.08);
    g.add(ch); return 1;
  }
  function addAwning(g, c, opts) {
    const o = opts || {};
    const a = box(o.w || 0.46, 0.03, o.d || 0.12, shade(c, 0.16));
    a.position.set(o.x || 0, o.y != null ? o.y : 0.18, o.z != null ? o.z : 0.22);
    if (o.tilt) a.rotation.x = o.tilt;
    g.add(a); return 1;
  }
  function addSmallTrees(g, pts, opts) {
    const o = opts || {};
    const baseY = o.y != null ? o.y : 0.05, th = o.h || 0.2;
    pts.forEach(([x, z], i) => {
      const tr = coneMesh(o.r || 0.07, th, 6, i % 2 ? 0x3f7a46 : 0x4a8a50);
      tr.position.set(x, baseY + th / 2, z);
      g.add(tr);
    });
    return pts.length;
  }
  function addTinyBenches(g, pts, c, y) {
    pts.forEach(([x, z]) => {
      const b = box(0.08, 0.02, 0.03, shade(c, -0.1));
      b.position.set(x, (y != null ? y : 0.02) + 0.01, z);
      g.add(b);
    });
    return pts.length;
  }
  function addFieldLines(g, opts) {
    const o = opts || {};
    const y = o.y != null ? o.y : 0.055, d = o.d || 0.4, lc = 0xe8eee8;
    let n = 0;
    const mid = box(0.018, 0.004, d, lc); mid.position.set(0, y, 0); g.add(mid); n++;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.006, 6, 16), toMat(lc));
    ring.rotation.x = Math.PI / 2; ring.position.set(0, y, 0); g.add(ring); n++;
    if (o.goals) {
      [-1, 1].forEach((s) => { const goal = box(0.1, 0.04, 0.015, 0xf0f0ec); goal.position.set(0, y + 0.02, s * (d / 2 - 0.015)); g.add(goal); n++; });
    }
    return n;
  }
  function addQuayDetails(g, c, opts) {
    const o = opts || {};
    let n = 0;
    const pier = box(0.1, 0.03, o.pierLen || 0.3, shade(0xb7a98c, -0.06)); // brygge
    pier.position.set(o.pierX != null ? o.pierX : 0.22, o.y != null ? o.y : 0.045, 0.16); g.add(pier); n++;
    [[-0.2, 0.1], [0.02, 0.1]].forEach(([x, z]) => { // pullerter
      const b = cyl(0.018, 0.022, 0.05, 6, shade(c, -0.2));
      b.position.set(x, (o.y != null ? o.y : 0.06) + 0.025, z); g.add(b); n++;
    });
    return n;
  }
  function addMiniBoat(g, y) {
    const boat = new THREE.Group();
    boat.add(box(0.12, 0.03, 0.05, 0xd8d0bf));
    const mast = box(0.01, 0.09, 0.01, 0xe8e2d4); mast.position.y = 0.06; boat.add(mast);
    boat.position.set(0.2, y != null ? y : 0.05, 0.2);
    boat.rotation.y = 0.3;
    g.add(boat);
    return 2;
  }
  function addMiniSignShape(g, c, opts) {
    // Blankt skilt uten tekst (stolpe + flate).
    const o = opts || {};
    let n = 0;
    const h = o.h || 0.16, z = o.z != null ? o.z : 0.26, x = o.x || 0;
    const post = cyl(0.012, 0.012, h, 5, shade(c, -0.1));
    post.position.set(x, h / 2, z); g.add(post); n++;
    const panel = box(o.w || 0.12, o.ph || 0.07, 0.012, mixHex(0xb9c2cb, c, 0.12));
    panel.position.set(x, h, z); g.add(panel); n++;
    return n;
  }

  const PLACE_MINIATURE_TYPES = {
    // Del 3 – kultur: bred front, søyler, trapp, takgesims.
    museum(o) {
      const g = new THREE.Group(), c = mixHex(o.color, PAL.culture, 0.12), h = 0.32, d = lodDetail(o.lod);
      g.add(box(0.56, h, 0.4, c));                                    // bred front
      if (d >= 1) {
        addRoofDetails(g, c, { w: 0.56, d: 0.4, y: h });             // takgesims
        addColumns(g, c, { n: 4, h: h * 0.86, z: 0.21, spanX: 0.4 });// søylefront
        addSteps(g, c, { n: 2, w: 0.42, z: 0.24 });                  // inngangstrapp
        addDoor(g, c, { z: 0.205, h: 0.15 });
      }
      if (d >= 2) addWindows(g, c, { cols: 3, y0: 0.2, z: -0.205, spanX: 0.36 });
      return { group: g, h };
    },
    // Del 3 – lav moderne blokk med rotert glasstak/lysgård og sidefløy.
    gallery(o) {
      const g = new THREE.Group(), c = shade(o.color, 0.08), h = 0.26, d = lodDetail(o.lod);
      g.add(box(0.52, h, 0.42, c));                                   // lav blokk
      const sky = box(0.26, 0.07, 0.26, mixHex(0x9fb6c4, c, 0.2)); sky.position.set(0.04, h + 0.02, 0); sky.rotation.y = Math.PI / 4; g.add(sky); // skrå glasstak
      if (d >= 1) {
        const wing = box(0.2, h * 0.7, 0.3, shade(c, -0.05)); wing.position.set(-0.34, (h * 0.7) / 2, 0.04); g.add(wing); // sidefløy
        addRoofDetails(g, c, { w: 0.52, d: 0.42, y: h });
      }
      if (d >= 2) addWindowBands(g, c, { rows: 2, w: 0.36, y0: 0.1, z: 0.215 });
      return { group: g, h: h + 0.06 };
    },
    // Del 3 – tydelig inngangsfront, scenekasse/snorloft og baldakin.
    theatre(o) {
      const g = new THREE.Group(), c = mixHex(o.color, PAL.culture, 0.1), h = 0.38, d = lodDetail(o.lod);
      g.add(box(0.46, h, 0.38, c));
      const fly = box(0.3, h * 1.18, 0.26, shade(c, -0.06)); fly.position.set(0, (h * 1.18) / 2, -0.08); g.add(fly); // scenekasse/snorloft
      if (d >= 1) {
        const front = box(0.5, h * 0.5, 0.08, shade(c, 0.1)); front.position.set(0, h * 0.25, 0.2); g.add(front); // inngangsfront
        addAwning(g, c, { w: 0.52, d: 0.13, y: h * 0.5, z: 0.26 });  // baldakin
        addDoor(g, c, { z: 0.245, h: 0.14, w: 0.12 });
      }
      if (d >= 2) {
        addColumns(g, c, { n: 2, h: h * 0.46, z: 0.24, spanX: 0.34, r: 0.022 });
        addWindows(g, c, { cols: 3, y0: h * 0.7, z: 0.195, spanX: 0.3, w: 0.045 });
      }
      return { group: g, h: h * 1.18 };
    },
    // Del 3 – mørkere scenehus med scenetårn, sidevolum og inngangsmarkise.
    music_venue(o) {
      const g = new THREE.Group(), c = shade(o.color, -0.1), h = 0.34, d = lodDetail(o.lod);
      g.add(box(0.44, h, 0.42, c));                                   // mørkt scenehus
      const tower = box(0.3, h * 1.25, 0.28, shade(c, -0.05)); tower.position.set(-0.02, (h * 1.25) / 2, -0.06); g.add(tower); // scenetårn
      if (d >= 1) {
        const side = box(0.16, h * 0.7, 0.3, shade(c, 0.04)); side.position.set(0.3, (h * 0.7) / 2, 0.05); g.add(side); // sidevolum
        addAwning(g, c, { w: 0.26, d: 0.12, y: h * 0.42, z: 0.24, x: -0.04 }); // inngangsmarkise
        addDoor(g, c, { z: 0.215, x: -0.04, h: 0.13 });
      }
      if (d >= 2) {
        addWindows(g, c, { cols: 2, y0: h * 0.7, z: 0.215, spanX: 0.2, w: 0.04 });
        addMiniSignShape(g, c, { x: 0.16, z: 0.24, h: 0.14, w: 0.1, ph: 0.06 });
      }
      return { group: g, h: h * 1.25 };
    },
    // Del 3 – marquee-form (uten tekst) og kino-front.
    cinema(o) {
      const g = new THREE.Group(), c = mixHex(o.color, PAL.culture, 0.08), h = 0.34, d = lodDetail(o.lod);
      g.add(box(0.44, h, 0.4, c));
      const marquee = box(0.54, 0.12, 0.14, shade(c, 0.14)); marquee.position.set(0, h * 0.62, 0.22); g.add(marquee); // marquee
      if (d >= 1) {
        const blade = box(0.08, h * 0.7, 0.06, shade(c, 0.18)); blade.position.set(0.2, h * 0.85, 0.24); g.add(blade); // vertikalt skilt (blankt)
        addAwning(g, c, { w: 0.5, d: 0.1, y: h * 0.42, z: 0.24 });
        addDoor(g, c, { z: 0.205, w: 0.14, h: 0.14 });
      }
      if (d >= 2) {
        addWindows(g, c, { cols: 3, y0: h * 0.32, z: 0.205, spanX: 0.3, w: 0.05 });
        const poster = box(0.05, 0.09, 0.012, mixHex(0xb9c2cb, c, 0.1)); poster.position.set(-0.18, h * 0.32, 0.205); g.add(poster); // blank plakatflate
      }
      return { group: g, h: h + 0.07 };
    },
    // Del 3 – rolig offentlig bygg med taklys/atrium og brede vindusbånd.
    library(o) {
      const g = new THREE.Group(), c = mixHex(o.color, PAL.culture, 0.1), h = 0.4, d = lodDetail(o.lod);
      g.add(box(0.5, h, 0.42, c));
      const atrium = box(0.22, 0.05, 0.22, mixHex(0xbcd0d8, c, 0.3)); atrium.position.set(0, h + 0.025, 0); g.add(atrium); // taklys/atrium
      if (d >= 1) {
        addRoofDetails(g, c, { w: 0.5, d: 0.42, y: h });
        addSteps(g, c, { n: 2, w: 0.36, z: 0.24 });
        addDoor(g, c, { z: 0.215, h: 0.15, w: 0.12 });
      }
      if (d >= 2) addWindowBands(g, c, { rows: 2, w: 0.4, y0: 0.13, dy: 0.13, z: 0.215 });
      return { group: g, h: h + 0.05 };
    },
    // Del 5 – skip + tårn + spir + inngangsfront.
    church(o) {
      const g = new THREE.Group(), c = mixHex(o.color, PAL.culture, 0.1), h = 0.34, d = lodDetail(o.lod);
      g.add(box(0.3, h, 0.44, c));                                    // skip
      const tower = box(0.16, h * 1.5, 0.16, shade(c, 0.05)); tower.position.set(0, (h * 1.5) / 2, -0.18); g.add(tower);
      const spire = coneMesh(0.11, 0.3, 4, shade(c, -0.2)); spire.position.set(0, h * 1.5 + 0.15, -0.18); spire.rotation.y = Math.PI / 4; g.add(spire);
      if (d >= 1) {
        const roof = gableRoof(0.32, 0.1, 0.44, shade(c, -0.16)); roof.position.set(0, h, 0); g.add(roof); // saltak på skip
        const porch = box(0.18, h * 0.5, 0.08, shade(c, 0.04)); porch.position.set(0, h * 0.25, 0.24); g.add(porch); // inngangsfront
        addDoor(g, c, { z: 0.285, h: 0.13, w: 0.08 });
      }
      if (d >= 2) addWindows(g, c, { cols: 2, rows: 2, y0: h * 0.4, dy: 0.1, z: 0.155, spanX: 0.16, w: 0.03, wh: 0.07 });
      return { group: g, h: h * 1.5 + 0.3 };
    },
    // Del 4 – lav skolefløy, skolegård og enkel takform.
    school(o) {
      const g = new THREE.Group(), c = o.color, h = 0.3, d = lodDetail(o.lod);
      const a = box(0.52, h, 0.3, c); a.position.set(-0.06, h / 2, 0); g.add(a); // lav fløy
      const r = box(0.56, 0.04, 0.34, shade(c, -0.13)); r.position.set(-0.06, h, 0); g.add(r); // enkel takform
      if (d >= 1) {
        const yard = box(0.34, 0.02, 0.34, shade(c, 0.14)); yard.position.set(0.3, 0.01, 0.06); g.add(yard); // skolegård
        const b = box(0.24, h * 0.8, 0.24, shade(c, -0.03)); b.position.set(0.28, (h * 0.8) / 2, 0.04); g.add(b); // mindre fløy
        addDoor(g, c, { x: -0.06, z: 0.155, h: 0.13 });
      }
      if (d >= 2) {
        addWindows(g, c, { cols: 4, y0: h * 0.55, z: 0.155, spanX: 0.4, w: 0.045 });
        addMiniSignShape(g, c, { x: 0.42, z: 0.18, h: 0.16, w: 0.02, ph: 0.04 }); // flaggstang-aktig (blank)
      }
      return { group: g, h };
    },
    // Del 4 – bredt institusjonsbygg med fløyer, inngangsparti og gårdsrom.
    university(o) {
      const g = new THREE.Group(), c = mixHex(o.color, PAL.culture, 0.08), h = 0.4, d = lodDetail(o.lod);
      g.add(box(0.62, h, 0.32, c));
      const wingL = box(0.18, h * 0.9, 0.46, shade(c, -0.04)); wingL.position.set(-0.3, (h * 0.9) / 2, 0.1); g.add(wingL);
      const wingR = box(0.18, h * 0.9, 0.46, shade(c, -0.04)); wingR.position.set(0.3, (h * 0.9) / 2, 0.1); g.add(wingR); // fløyer
      if (d >= 1) {
        const court = box(0.26, 0.02, 0.34, shade(c, 0.12)); court.position.set(0, 0.01, 0.16); g.add(court); // indre gårdsrom
        const entry = box(0.22, h * 0.6, 0.1, shade(c, 0.06)); entry.position.set(0, h * 0.3, 0.04); g.add(entry); // inngangsparti
        addDoor(g, c, { z: 0.095, h: 0.14, w: 0.1 });
      }
      if (d >= 2) addWindows(g, c, { cols: 4, y0: 0.16, z: 0.165, spanX: 0.44, w: 0.045 });
      return { group: g, h };
    },
    // Del 7 – lang hall, takbue og spor-/plattformantydning.
    station(o) {
      const g = new THREE.Group(), c = o.color, h = 0.3, d = lodDetail(o.lod);
      g.add(box(0.8, h, 0.4, c));                                     // lang hall
      const hall = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.82, 14, 1, false, 0, Math.PI), toMat(shade(c, 0.12)));
      hall.rotation.z = Math.PI / 2; hall.position.set(0, h, 0); g.add(hall); // takbue
      if (d >= 1) {
        const platform = box(0.86, 0.03, 0.12, shade(c, 0.08)); platform.position.set(0, 0.015, 0.26); g.add(platform); // plattform
        const rail1 = box(0.86, 0.01, 0.015, PAL.rail); rail1.position.set(0, 0.02, 0.22); g.add(rail1);
        const rail2 = box(0.86, 0.01, 0.015, PAL.rail); rail2.position.set(0, 0.02, 0.3); g.add(rail2); // spor
      }
      if (d >= 2) {
        addWindows(g, c, { cols: 5, y0: h * 0.5, z: 0.205, spanX: 0.6, w: 0.05 });
        addDoor(g, c, { z: 0.205, h: 0.16, w: 0.12 });
      }
      return { group: g, h: h + 0.2 };
    },
    // Del 6 – tribunering + tydelig bane, lysmaster ved høy zoom.
    stadium(o) {
      const g = new THREE.Group(), c = o.color, h = 0.26, d = lodDetail(o.lod);
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, h, 20), toMat(c));
      ring.position.y = h / 2; ring.scale.x = 1.3; ring.castShadow = true; ring.receiveShadow = true; g.add(ring); // tribunering
      const pitch = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, h * 0.5, 20), toMat(0x4f8f55));
      pitch.position.y = h * 0.55; pitch.scale.x = 1.3; pitch.receiveShadow = true; g.add(pitch); // bane
      if (d >= 1) {
        const tier = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, h * 0.7, 20, 1, true), toMat(shade(c, 0.08)));
        tier.position.y = h * 0.7; tier.scale.x = 1.3; g.add(tier); // indre tribunerad
      }
      if (d >= 2) {
        addFieldLines(g, { y: h * 0.82, d: 0.34, goals: true });
        [[-0.5, -0.28], [0.5, -0.28], [-0.5, 0.28], [0.5, 0.28]].forEach(([x, z]) => {
          const mast = box(0.02, 0.18, 0.02, shade(c, 0.2)); mast.position.set(x, 0.09, z); g.add(mast); // lysmaster
        });
      }
      return { group: g, h: h + 0.1 };
    },
    // Del 6 – grønn bane med enkle linjer/mål.
    sports_field(o) {
      const g = new THREE.Group(), h = 0.05, d = lodDetail(o.lod);
      const field = box(0.62, h, 0.42, 0x5a9a57); field.position.y = h / 2; g.add(field);
      if (d >= 1) addFieldLines(g, { y: h + 0.005, d: 0.4, goals: true });
      if (d >= 2) {
        const stand = box(0.5, 0.06, 0.06, shade(0x5a9a57, -0.2)); stand.position.set(0, 0.03, -0.26); g.add(stand); // liten tribune
        addTinyBenches(g, [[0, -0.24]], 0x8a7a5c, 0.06);
      }
      return { group: g, h: 0.08 };
    },
    // Del 6 – lav avrundet ishall med kuppel og lys isflate-antydning.
    ice_arena(o) {
      const g = new THREE.Group(), c = shade(o.color, 0.1), h = 0.24, d = lodDetail(o.lod);
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, h, 20), toMat(c));
      shell.scale.set(1.2, 1, 1); shell.position.y = h / 2; shell.castShadow = true; shell.receiveShadow = true; g.add(shell);
      const roof = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toMat(shade(c, 0.08)));
      roof.scale.set(1.2, 0.42, 1); roof.position.y = h; g.add(roof); // avrundet kuppel
      if (d >= 1) {
        const ice = box(0.4, 0.02, 0.16, mixHex(0xcfe6ef, c, 0.2)); ice.position.set(0, 0.01, 0.5); g.add(ice); // lys isflate (forplass)
        const entry = box(0.18, h * 0.7, 0.08, shade(c, -0.06)); entry.position.set(0, (h * 0.7) / 2, 0.46); g.add(entry); // inngang
      }
      if (d >= 2) {
        addWindows(g, c, { cols: 3, y0: h * 0.5, z: 0.42, spanX: 0.4, w: 0.05 });
        addDoor(g, c, { z: 0.5, h: 0.12 });
      }
      return { group: g, h: h + 0.18 };
    },
    // Del 6 – sandflate, lekestruktur, sklie og huske.
    playground(o) {
      const g = new THREE.Group(), h = 0.04, d = lodDetail(o.lod);
      const sand = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.34, h, 16), toMat(0xd8c48c));
      sand.position.y = h / 2; sand.receiveShadow = true; g.add(sand); // sandflate
      if (d >= 1) {
        const frame = box(0.06, 0.2, 0.24, 0xb45a48); frame.position.set(-0.08, 0.1, 0); g.add(frame); // klatrestativ
        const slide = box(0.2, 0.03, 0.06, 0xd0c2a8); slide.position.set(0.04, 0.1, 0); slide.rotation.z = 0.5; g.add(slide); // sklie
        const swing = box(0.18, 0.02, 0.04, 0x8a6a4a); swing.position.set(0.16, 0.18, 0.1); g.add(swing); // huske
      }
      if (d >= 2) {
        addSmallTrees(g, [[-0.22, 0.18]], { h: 0.18, r: 0.06, y: 0.04 });
        addTinyBenches(g, [[0.2, -0.16]], 0x8a7a5c, 0.04);
      }
      return { group: g, h: 0.22 };
    },
    // Del 6 – grønn flate, små trær, sti og benk.
    park(o) {
      const g = new THREE.Group(), h = 0.06, d = lodDetail(o.lod);
      const lawn = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, h, 16), toMat(0x6aa66f));
      lawn.position.y = h / 2; lawn.receiveShadow = true; g.add(lawn); // grønn flate
      addSmallTrees(g, [[-0.14, 0.08], [0.14, -0.04]], { h: 0.26, r: 0.1, y: h }); // silhuett-trær
      if (d >= 1) {
        addSmallTrees(g, [[0.04, 0.18]], { h: 0.24, r: 0.09, y: h });
        const path = box(0.5, 0.01, 0.07, shade(0xc9b092, 0.04)); path.position.set(0, h + 0.005, -0.1); path.rotation.y = 0.3; g.add(path); // liten sti
      }
      if (d >= 2) addTinyBenches(g, [[-0.18, -0.12], [0.2, 0.1]], 0x8a7a5c, h);
      return { group: g, h: h + 0.26 };
    },
    // Del 7 – åpen plass, lave bygg rundt, liten statue/tre/benk.
    square(o) {
      const g = new THREE.Group(), c = o.color, h = 0.02, d = lodDetail(o.lod);
      const plaza = box(0.62, h, 0.62, shade(c, 0.12)); plaza.position.y = h / 2; plaza.receiveShadow = true; g.add(plaza); // åpen plass
      [[-0.36, -0.22], [0.36, -0.22]].forEach(([x, z], i) => {
        const bh = 0.26 + i * 0.06; const b = box(0.22, bh, 0.2, c); b.position.set(x, bh / 2, z); g.add(b);
      }); // lave bygg rundt
      if (d >= 1) {
        const b = box(0.24, 0.3, 0.2, shade(c, -0.04)); b.position.set(0, 0.15, 0.4); g.add(b);
        const statueBase = cyl(0.05, 0.06, 0.06, 8, PAL.stone); statueBase.position.set(0, 0.03, 0); g.add(statueBase);
        const statue = box(0.04, 0.14, 0.04, shade(PAL.stone, -0.1)); statue.position.set(0, 0.13, 0); g.add(statue); // liten statue
      }
      if (d >= 2) {
        addSmallTrees(g, [[-0.18, 0.18]], { h: 0.2, r: 0.08, y: 0.02 });
        addTinyBenches(g, [[0.16, 0.12]], c, 0.02);
      }
      return { group: g, h: 0.32 };
    },
    // Del 7 – smal gateflate med husrekker på sidene.
    street(o) {
      const g = new THREE.Group(), c = o.color, h = 0.22, d = lodDetail(o.lod);
      const strip = box(0.62, 0.02, 0.18, shade(c, -0.08)); strip.position.y = 0.01; g.add(strip); // gateflate
      [-0.2, 0.04, 0.26].forEach((x, i) => { const bh = h - (i % 2) * 0.06; const b = box(0.14, bh, 0.16, i % 2 ? shade(c, 0.06) : c); b.position.set(x, bh / 2, -0.12); g.add(b); }); // husrekke
      if (d >= 1) [-0.2, 0.26].forEach((x) => { const r = gableRoof(0.15, 0.05, 0.17, shade(c, -0.14)); r.position.set(x, h - 0.02, -0.12); g.add(r); });
      if (d >= 2) [-0.08, 0.2].forEach((x, i) => { const bh = 0.16 - i * 0.03; const b = box(0.14, bh, 0.14, i % 2 ? c : shade(c, 0.05)); b.position.set(x, bh / 2, 0.12); g.add(b); }); // motsatt side
      return { group: g, h };
    },
    // Del 7 – kai, brygge, lite bygg og en liten båt.
    waterfront(o) {
      const g = new THREE.Group(), c = mixHex(o.color, 0xc9b894, 0.2), h = 0.07, d = lodDetail(o.lod);
      const quay = box(0.62, h, 0.3, 0xb7a98c); quay.position.y = h / 2; quay.receiveShadow = true; g.add(quay); // kai
      const b = box(0.3, 0.26, 0.2, c); b.position.set(-0.1, h + 0.13, -0.03); g.add(b); // lite bygg
      if (d >= 1) addQuayDetails(g, c, { y: h, pierLen: 0.3, pierX: 0.22 }); // brygge + pullerter
      if (d >= 2) {
        addMiniBoat(g, h + 0.02);
        const crane = box(0.03, 0.2, 0.03, shade(c, -0.1)); crane.position.set(0.1, h + 0.1, -0.08); g.add(crane);
      }
      return { group: g, h: h + 0.26 };
    },
    // Del 5 – steinbase, hjørnetårn, mur og borggård (skiller seg fra civic).
    fortress(o) {
      const g = new THREE.Group(), c = shade(o.color, -0.04), h = 0.3, d = lodDetail(o.lod);
      const base = box(0.6, 0.06, 0.6, shade(c, 0.06)); base.position.y = 0.03; g.add(base); // steinbase
      [[-0.24, -0.24], [0.24, -0.24], [-0.24, 0.24], [0.24, 0.24]].forEach(([x, z]) => {
        const t = cyl(0.07, 0.08, h * 1.1, 7, shade(c, 0.03)); t.position.set(x, 0.06 + (h * 1.1) / 2, z); g.add(t); // hjørnetårn
      });
      if (d >= 1) {
        const wallN = box(0.5, h * 0.7, 0.07, c); wallN.position.set(0, 0.06 + (h * 0.7) / 2, -0.24); g.add(wallN);
        const wallS = box(0.5, h * 0.7, 0.07, c); wallS.position.set(0, 0.06 + (h * 0.7) / 2, 0.24); g.add(wallS);
        const wallW = box(0.07, h * 0.7, 0.5, c); wallW.position.set(-0.24, 0.06 + (h * 0.7) / 2, 0); g.add(wallW);
        const wallE = box(0.07, h * 0.7, 0.5, c); wallE.position.set(0.24, 0.06 + (h * 0.7) / 2, 0); g.add(wallE); // mur rundt borggård
        addDoor(g, c, { z: 0.275, h: 0.12, w: 0.1 }); // port
      }
      if (d >= 2) {
        const keep = box(0.18, h * 0.9, 0.18, shade(c, 0.04)); keep.position.set(0, 0.06 + (h * 0.9) / 2, 0); g.add(keep); // indre kjernetårn
        const sp = coneMesh(0.13, 0.18, 4, shade(c, -0.18)); sp.position.set(0, 0.06 + h * 0.9 + 0.09, 0); sp.rotation.y = Math.PI / 4; g.add(sp);
      }
      return { group: g, h: h * 1.1 + 0.2 };
    },
    // Del 2 – offentlig kjernebygg med base, tårnvolum, trapp og søyler.
    civic(o) {
      const g = new THREE.Group(), c = o.color, h = 0.4, d = lodDetail(o.lod);
      g.add(box(0.52, h * 0.7, 0.5, c));                              // bred base
      const tower = box(0.3, h, 0.3, shade(c, 0.06)); tower.position.set(0, h / 2, 0); g.add(tower); // tårnvolum
      if (d >= 1) {
        addRoofDetails(g, c, { w: 0.3, d: 0.3, y: h });
        addSteps(g, c, { n: 2, w: 0.4, z: 0.28 });
        addDoor(g, c, { z: 0.255, h: 0.15 });
      }
      if (d >= 2) {
        addColumns(g, c, { n: 3, h: h * 0.5, z: 0.25, spanX: 0.3, r: 0.022 });
        addWindows(g, c, { cols: 3, y0: h * 0.85, z: 0.155, spanX: 0.22, w: 0.04 });
      }
      return { group: g, h };
    },
    // Del 8 – råere form: skate-/rampe-, mur- og sceneaktige volum (uten neon).
    subculture(o) {
      const g = new THREE.Group(), c = shade(o.color, -0.04), h = 0.28, d = lodDetail(o.lod);
      const body = box(0.42, h, 0.38, c); body.position.y = h / 2; body.rotation.y = 0.08; g.add(body);
      const ramp = box(0.3, 0.04, 0.2, shade(c, 0.06)); ramp.position.set(0.06, 0.12, 0.26); ramp.rotation.x = -0.5; g.add(ramp); // skate-/rampeform
      if (d >= 1) {
        const stage = box(0.26, h * 0.4, 0.12, shade(c, -0.1)); stage.position.set(-0.08, (h * 0.4) / 2 + 0.04, 0.22); g.add(stage); // scenevolum
        const wall = box(0.04, h * 0.7, 0.36, shade(c, 0.04)); wall.position.set(-0.24, (h * 0.7) / 2, 0); g.add(wall); // mur
      }
      if (d >= 2) {
        const quarter = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.24, 10, 1, true, 0, Math.PI / 2), toMat(shade(c, 0.1)));
        quarter.rotation.z = Math.PI; quarter.position.set(-0.18, 0.12, 0.24); g.add(quarter); // quarter-pipe
        const tag = box(0.18, 0.12, 0.012, mixHex(0xb9c2cb, c, 0.1)); tag.position.set(0, h * 0.55, 0.2); tag.rotation.z = 0.1; g.add(tag); // blank flate
      }
      return { group: g, h };
    },
    // Del 8 – lav lagerhall med port, pipe og ventilasjonsblokker.
    industrial(o) {
      const g = new THREE.Group(), c = mixHex(o.color, 0x8d8780, 0.3), h = 0.24, d = lodDetail(o.lod);
      g.add(box(0.7, h, 0.46, c));                                    // lagerhall
      const r = gableRoof(0.72, 0.07, 0.48, shade(c, -0.1)); r.position.y = h; g.add(r);
      if (d >= 1) {
        const gate = box(0.2, h * 0.8, 0.04, shade(c, -0.22)); gate.position.set(-0.12, (h * 0.8) / 2, 0.23); g.add(gate); // port
        addChimney(g, c, { x: 0.26, z: -0.12, base: h + 0.05, h: 0.18, w: 0.05 }); // pipe
      }
      if (d >= 2) {
        [-0.04, 0.12, 0.28].forEach((x) => { const v = box(0.08, 0.06, 0.1, shade(c, 0.04)); v.position.set(x, h + 0.05, 0); g.add(v); }); // ventilasjonsblokker
        addWindows(g, c, { cols: 3, y0: h * 0.55, z: 0.235, spanX: 0.3, w: 0.05 });
      }
      return { group: g, h: h + 0.07 };
    },
    // Del 2 – butikkfront: baldakin, dør, butikkvinduer og blankt skilt.
    commerce(o) {
      const g = new THREE.Group(), c = o.color, h = 0.3, d = lodDetail(o.lod);
      g.add(box(0.42, h, 0.36, c));
      if (d >= 1) {
        addAwning(g, c, { w: 0.46, d: 0.12, y: h * 0.5, z: 0.2 });
        addDoor(g, c, { z: 0.185, h: 0.12 });
        const cap = box(0.44, 0.04, 0.38, shade(c, -0.1)); cap.position.y = h; g.add(cap); // takkant
      }
      if (d >= 2) {
        addWindows(g, c, { cols: 3, y0: h * 0.32, z: 0.185, spanX: 0.3, w: 0.06, wh: 0.07 });
        addMiniSignShape(g, c, { x: 0, z: 0.22, h: 0.12, w: 0.16, ph: 0.05 });
      }
      return { group: g, h };
    },
    // Del 2 – boligblokk (lett): takkant, dør og vindusrytme.
    apartment(o) {
      const g = new THREE.Group(), c = o.color, h = 0.5, d = lodDetail(o.lod);
      g.add(box(0.42, h, 0.42, c));
      if (d >= 1) {
        const cap = box(0.46, 0.04, 0.46, shade(c, -0.12)); cap.position.y = h; g.add(cap); // takkant
        addDoor(g, c, { z: 0.215, h: 0.13 });
      }
      if (d >= 2) addWindows(g, c, { cols: 2, rows: 2, y0: 0.16, dy: 0.16, z: 0.215, spanX: 0.22, w: 0.06, wh: 0.07 });
      return { group: g, h };
    },
    // Del 2 – generisk småbygg (svært lett): takkant, dør, et par vinduer.
    default(o) {
      const g = new THREE.Group(), c = o.color, h = 0.32, d = lodDetail(o.lod);
      g.add(box(0.38, h, 0.38, c));
      if (d >= 1) {
        const cap = box(0.4, 0.04, 0.4, shade(c, -0.1)); cap.position.y = h; g.add(cap); // takkant
        addDoor(g, c, { z: 0.195, h: 0.12 });
      }
      if (d >= 2) addWindows(g, c, { cols: 2, y0: h * 0.55, z: 0.195, spanX: 0.18, w: 0.05 });
      return { group: g, h };
    }
  };

  // Del 4 – Type-resolver for places. Prioritert: civiMap.assetType -> mapAssetType
  // -> kategori/quiz_profile-nøkkelord -> id/navn-heuristikk -> default.
  function resolvePlaceMiniatureType(p) {
    const cm = p.civiMap || {};
    const explicit = String(cm.assetType || (p.raw && p.raw.mapAssetType) || "").trim().toLowerCase();
    if (explicit && PLACE_MINIATURE_TYPES[explicit]) return explicit;

    const cat = String(p.category || "").toLowerCase();
    const qp = (p.raw && p.raw.quiz_profile) || {};
    const ptype = String(qp.place_type || "").toLowerCase();
    const subtype = String(qp.subtype || "").toLowerCase();
    const hay = `${p.id || ""} ${p.name || ""} ${ptype} ${subtype}`.toLowerCase();

    // Sterke nøkkelord på tvers av kategorier.
    if (/ishall|ishockey|amfi|skoyte|skøyte|isbane|kunstisbane/.test(hay)) return "ice_arena";
    if (/stadion|stadium|arena/.test(hay)) return "stadium";
    if (/lekeplass|playground|sandlek/.test(hay)) return "playground";
    if (/museum|museet/.test(hay)) return "museum";
    if (/galleri|gallery|kunsthall/.test(hay)) return "gallery";
    if (/bibliotek|library|deichman/.test(hay)) return "library";
    if (/kino|cinema|filmteater/.test(hay)) return "cinema";
    if (/teater|theatre|theater|revyscene|revy/.test(hay)) return "theatre";
    if (/kirke|kapell|domkirke|katedral|church|moske|synagoge/.test(hay)) return "church";
    if (/universitet|hogskole|høgskole|university|fakultet|campus/.test(hay)) return "university";
    if (/skole|gymnas|videregaende|videregående|school/.test(hay)) return "school";
    if (/stasjon|t-bane|jernbane|holdeplass|station|terminal|metro/.test(hay)) return "station";
    if (/festning|slott|borg|skanse|fortress|fort\b/.test(hay)) return "fortress";
    if (/brygge|havn|kai|fjord|vann|dam|tjern|elv|strand|waterfront|marina/.test(hay)) return "waterfront";
    if (/park|hage|skog|lund|mark|allmenning|grøntdrag/.test(hay)) return "park";
    if (/torg|plass\b|square/.test(hay)) return "square";
    if (/fabrikk|lager|industri|verksted|verk\b|mølle|mølla|depot|warehouse/.test(hay)) return "industrial";
    if (/butikk|marked|kjopesenter|kjøpesenter|handel|shop|mall|basar/.test(hay)) return "commerce";
    if (/scene|konsert|musikkklubb|spellemann|rockefeller|spektrum|venue/.test(hay)) return "music_venue";
    if (/gate\b|veien|allé|alle\b|street/.test(hay)) return "street";

    // Kategori-basert.
    switch (cat) {
      case "sport":
        if (/jordal|ishall|amfi/.test(hay)) return "ice_arena";
        if (/stadion|arena/.test(hay)) return "stadium";
        return "sports_field";
      case "kunst": return /galleri/.test(hay) ? "gallery" : "museum";
      case "litteratur": return "library";
      case "musikk": return "music_venue";
      case "film": case "film_tv": return "cinema";
      case "popkultur": case "populaerkultur": return "music_venue";
      case "subkultur": return "subculture";
      case "natur": return "park";
      case "politikk": case "media": return "civic";
      case "vitenskap": case "psykologi": return "university";
      case "naeringsliv": return "commerce";
      case "by": return "apartment";
    }

    // quiz_profile.place_type fallback.
    if (/park/.test(ptype)) return "park";
    if (/kirke/.test(ptype)) return "church";
    if (/museum/.test(ptype)) return "museum";
    if (/stadion/.test(ptype)) return "stadium";

    return "default";
  }

  function mixHex(a, b, t) {
    const ca = new THREE.Color(a), cb = new THREE.Color(b);
    return ca.lerp(cb, t).getHex();
  }

  // Dempet palett: farge antyder kategori, men trekkes mot varm stein så
  // miniatyrene leser som del av dioramaet (ikke neon). Grøntflater forblir grønne.
  function placeColorFor(p, type) {
    const accent = categoryColor(p.category);
    if (type === "park" || type === "sports_field") return mixHex(0x6f9d63, accent, 0.18);
    return mixHex(PAL.stone, accent, 0.34);
  }

  // Del 8 – En klikkbar place-miniatyr. userData.placeId på gruppe og alle mesh.
  // Ingen tekstlabels, ingen beacons; place-miniatyrer kaster ikke skygge (iPad-ytelse).
  function buildPlaceMiniature(p, opts) {
    const type = (opts && opts.type) || resolvePlaceMiniatureType(p);
    const lod = (opts && opts.lod) || _lastLod || "high";
    const color = placeColorFor(p, type);
    const make = PLACE_MINIATURE_TYPES[type] || PLACE_MINIATURE_TYPES.default;
    const built = make({ color, lod });
    const group = built.group;
    const scale = (opts && opts.scale) || 0.4;
    group.scale.setScalar(scale);
    group.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.userData = { placeId: p.id }; } });
    group.userData = { placeId: p.id, miniatureType: type, h: built.h };
    return group;
  }

  // Del 7 – flytt place vekk fra håndmodellerte landemerkers clear zones.
  function avoidLandmarkMarkerPosition(proj) {
    const hit = landmarkClearanceAt(proj.x, proj.y);
    if (!hit) return { x: proj.x, y: proj.y, nearLandmark: false };
    const zone = hit.zone;
    const minDist = zone.r * 0.94;
    const angle = hit.dist > 0.0001
      ? Math.atan2(proj.y - zone.y, proj.x - zone.x)
      : (hashStr(zone.id) % 628) / 100;
    return {
      x: clamp(zone.x + Math.cos(angle) * minDist, 0.03, 0.97),
      y: clamp(zone.y + Math.sin(angle) * minDist, 0.04, 0.96),
      nearLandmark: true
    };
  }

  function placeScaleFor(lod, nx, ny) {
    let s = PLACE_LOD_SCALE[lod] || 0.4;
    if (landmarkClearanceAt(nx, ny)) s *= 0.8; // dempes ved landemerker (forrang)
    return s;
  }

  // Del 5 – view-frustum/screen-distance culling for høy/svært høy zoom.
  function inCameraView(nx, ny, margin) {
    if (!camera) return true;
    const v = new THREE.Vector3(nx2x(nx), GROUND_Y, ny2z(ny));
    v.project(camera);
    const m = margin == null ? 1.18 : margin;
    return Math.abs(v.x) <= m && Math.abs(v.y) <= m;
  }

  // ---------------------------------------------------------------------------
  // Del 5/7/8 – Bygg synlige place-miniatyrer (LOD + overlap-nudge + hit targets)
  // ---------------------------------------------------------------------------
  function rebuildPlaces() {
    if (!scene || !THREE) return;
    if (!placeGroup) { placeGroup = new THREE.Group(); scene.add(placeGroup); }
    for (let i = placeGroup.children.length - 1; i >= 0; i--) {
      const node = placeGroup.children[i];
      placeGroup.remove(node);
      node.traverse((m) => {
        if (m.geometry) m.geometry.dispose();
        if (m.material && m.material !== INVISIBLE_HIT_MAT) m.material.dispose();
      });
    }
    hitTargets = [];
    _visibleMiniatures = [];
    _landmarkPlaceMap = {};
    _stats.placeMiniatureTypes = {};
    _stats.hiddenDuplicateLandmarkPlaces = 0;
    _stats.culledPlaces = 0;
    _stats.nudgedPlaces = 0;
    _stats.clickableLandmarkPlaces = [];
    _stats.miniatureMeshTotal = 0;
    _stats.detailedMiniatures = 0;
    _stats.lowDetailMiniatures = 0;
    if (!_places) { _stats.placeMarkers = 0; _stats.visiblePlaceMiniatures = 0; return; }

    const lod = placeLodLevel(zoom);
    _lastLod = lod;
    _stats.placeLodLevel = lod;
    if (camera) camera.updateMatrixWorld();

    // Del 2 – skill ut places som tilsvarer håndmodellerte landemerker; de får
    // ingen ekstra generisk marker. Flere places kan matche samme landemerke
    // (duplikater/aliaser) – da velges ÉT kanonisk sted (eksakt treff foran
    // delstreng) som klikkbart via en usynlig hit target ved modellen.
    const byLandmark = {};
    const candidates = [];
    let hiddenCount = 0;
    _places.forEach((p) => {
      const info = landmarkMatchInfo(p);
      if (info && getLandmarkEntry(info.landmarkId)) {
        hiddenCount++;
        const cur = byLandmark[info.landmarkId];
        if (!cur || (info.exact && !cur.exact)) byLandmark[info.landmarkId] = { place: p, exact: info.exact };
      } else {
        candidates.push(p);
      }
    });

    Object.keys(byLandmark).forEach((landmarkId) => {
      const place = byLandmark[landmarkId].place;
      const e = getLandmarkEntry(landmarkId);
      const baseY = e.baseY == null ? GROUND_Y : e.baseY;
      const hit = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), INVISIBLE_HIT_MAT);
      hit.position.set(nx2x(e.x), baseY + 0.5, ny2z(e.y));
      hit.userData = { placeId: place.id, landmarkId };
      placeGroup.add(hit);
      hitTargets.push({ id: place.id, place, landmarkId, viaLandmark: true });
      _landmarkPlaceMap[landmarkId] = place.id;
      _stats.clickableLandmarkPlaces.push({ placeId: place.id, landmarkId });
    });
    _stats.hiddenDuplicateLandmarkPlaces = hiddenCount;

    // Del 6 – prioriter og projiser; Del 5 – LOD-grense + frustum-culling.
    const scored = [];
    candidates.forEach((p) => {
      const proj = project(p);
      if (!proj) return;
      scored.push({ p, proj, prio: priorityOfPlace(p) });
    });
    scored.sort((a, b) => b.prio - a.prio);

    const limit = PLACE_LOD_LIMITS[lod] || 26;
    const cull = (lod === "high" || lod === "veryHigh");
    const placedNorm = [];
    let drawn = 0;

    for (let i = 0; i < scored.length && drawn < limit; i++) {
      const entry = scored[i];
      const proj = entry.proj;
      if (cull && !inCameraView(proj.x, proj.y)) { _stats.culledPlaces++; continue; }

      // Del 7 – unngå landemerker, deretter nudge bort fra andre miniatyrer.
      const avoided = avoidLandmarkMarkerPosition(proj);
      const scale = placeScaleFor(lod, avoided.x, avoided.y);
      const sep = 0.016 + scale * 0.03;

      let nx = avoided.x, ny = avoided.y, nudged = false;
      for (let attempt = 0; attempt < 6; attempt++) {
        let hitQ = null, md = Infinity;
        for (let j = 0; j < placedNorm.length; j++) {
          const q = placedNorm[j];
          const d = Math.hypot(nx - q.x, ny - q.y);
          if (d < sep && d < md) { md = d; hitQ = q; }
        }
        if (!hitQ) break;
        const dx = nx - hitQ.x, dy = ny - hitQ.y;
        const len = Math.hypot(dx, dy) || 1;
        const push = (sep - md) + 0.004;
        nx = clamp(nx + (dx / len) * push, 0.03, 0.97);
        ny = clamp(ny + (dy / len) * push, 0.04, 0.96);
        nudged = true;
      }
      if (nudged) _stats.nudgedPlaces++;
      placedNorm.push({ x: nx, y: ny });

      const type = resolvePlaceMiniatureType(entry.p);
      const node = buildPlaceMiniature(entry.p, { type, scale, lod });
      node.position.set(nx2x(nx), GROUND_Y, ny2z(ny));
      placeGroup.add(node);

      // Del 12 – mesh-budsjett-statistikk per miniatyr.
      let meshCount = 0;
      node.traverse((m) => { if (m.isMesh) meshCount++; });
      _stats.miniatureMeshTotal += meshCount;
      if (meshCount >= 6) _stats.detailedMiniatures++; else _stats.lowDetailMiniatures++;

      hitTargets.push({ id: entry.p.id, place: entry.p, type, viaLandmark: false });
      _visibleMiniatures.push({ id: entry.p.id, name: entry.p.name, type, priority: entry.prio, x: Number(nx.toFixed(4)), y: Number(ny.toFixed(4)), nudged });
      _stats.placeMiniatureTypes[type] = (_stats.placeMiniatureTypes[type] || 0) + 1;
      drawn++;
    }

    _stats.visiblePlaceMiniatures = drawn;
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
    if (placeLodLevel(zoom) !== _lastLod) rebuildPlaces();
    updateCamera();
  }
  function zoomIn() { setZoom(zoom * ZOOM_STEP); }
  function zoomOut() { setZoom(zoom / ZOOM_STEP); }
  function reset() { zoom = START_ZOOM; panX = START_PAN.x; panZ = START_PAN.z; updateCamera(); }
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
      // Ved høy/svært høy zoom avhenger synlige places av kameraets utsnitt:
      // rebuild ved endt gest så frustum-culling/nearby-prioritering oppdateres.
      else if (moved && active && (_lastLod === "high" || _lastLod === "veryHigh")) rebuildPlaces();
      downPt = null; moved = false;
    }
  }
  function onWheel(e) {
    if (!active || !inMapMode()) return;
    e.preventDefault();
    setZoom(zoom * (e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP));
  }
  function openPlace(placeId) {
    if (placeId == null) return;
    window.location.href = `index.html#/place/${encodeURIComponent(placeId)}`;
  }

  function handleTap(e) {
    if (!placeGroup) return;
    const { px, py } = relPos(e);
    const ndc = new THREE.Vector2((px / W) * 2 - 1, -(py / H) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);

    // Del 8 – primært: place-miniatyrer + usynlige landmark-hit targets.
    const hits = raycaster.intersectObjects(placeGroup.children, true);
    if (hits.length) {
      let o = hits[0].object;
      while (o && !(o.userData && o.userData.placeId)) o = o.parent;
      if (o && o.userData && o.userData.placeId) { openPlace(o.userData.placeId); return; }
    }

    // Fallback: klikk på selve det håndmodellerte landemerket som matcher et place.
    if (landmarkGroup) {
      const lmHits = raycaster.intersectObjects(landmarkGroup.children, true);
      if (lmHits.length) {
        let o = lmHits[0].object;
        while (o && !(o.userData && o.userData.landmarkId)) o = o.parent;
        if (o && o.userData && o.userData.landmarkId) {
          const placeId = _landmarkPlaceMap[o.userData.landmarkId];
          if (placeId) openPlace(placeId);
        }
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
    // Delt, usynlig (men raycastbar) material for landmark-hit targets.
    INVISIBLE_HIT_MAT = new THREE.MeshBasicMaterial({ visible: false });

    buildLights();
    buildBoard();
    buildLandscape();
    buildCity();
    buildTrees();
    buildLocalObjects();
    buildLandmarks();

    zoom = START_ZOOM;
    panX = START_PAN.x;
    panZ = START_PAN.z;

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
      asset: resolveAssetType(p), archetype: archetypeForAsset(resolveAssetType(p)),
      miniatureType: resolvePlaceMiniatureType(p),
      landmarkMatch: matchLandmarkForPlace(p),
      priority: priorityOfPlace(p),
      normalized: proj, world: proj ? { x: nx2x(proj.x), z: ny2z(proj.y) } : null
    };
  }

  function getSceneStats() {
    let rendererType = "none";
    if (renderer) rendererType = (renderer.capabilities && renderer.capabilities.isWebGL2) ? "webgl2" : "webgl";
    return {
      placeMarkers: _stats.placeMarkers,
      visiblePlaceMiniatures: _stats.visiblePlaceMiniatures || 0,
      placeMiniatureTypes: Object.assign({}, _stats.placeMiniatureTypes),
      averageMeshesPerMiniature: _stats.visiblePlaceMiniatures
        ? Number((_stats.miniatureMeshTotal / _stats.visiblePlaceMiniatures).toFixed(2)) : 0,
      detailedMiniatures: _stats.detailedMiniatures || 0,
      lowDetailMiniatures: _stats.lowDetailMiniatures || 0,
      hiddenDuplicateLandmarkPlaces: _stats.hiddenDuplicateLandmarkPlaces || 0,
      placeLodLevel: _stats.placeLodLevel || null,
      culledPlaces: _stats.culledPlaces || 0,
      nudgedPlaces: _stats.nudgedPlaces || 0,
      clickableLandmarkPlaces: (_stats.clickableLandmarkPlaces || []).map((x) => Object.assign({}, x)),
      genericBuildings: _stats.genericBuildings,
      instancedBuildings: _stats.instancedBuildings,
      highRiseCount: _stats.highRiseCount,
      trees: _stats.trees,
      localObjects: _stats.localObjects,
      parkObjects: _stats.parkObjects,
      waterfrontObjects: _stats.waterfrontObjects,
      districtProfiles: Object.keys(DISTRICT_VISUAL_PROFILES).length,
      landmarks: _stats.landmarks,
      landmarkCountByType: Object.assign({}, _stats.landmarkCountByType),
      roadSegments: _stats.roadSegments,
      clearZones: LANDMARK_CLEAR_ZONES.map((z) => Object.assign({}, z)),
      clearZoneCount: LANDMARK_CLEAR_ZONES.length,
      startZoom: START_ZOOM,
      cameraBase: Object.assign({}, CAM_BASE),
      rendererType,
      renderer: rendererType,
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
    getSceneStats,
    getDistrictVisualProfiles,
    getLandmarkPositions,
    getVisiblePlaceMiniatures: () => _visibleMiniatures.map((m) => Object.assign({}, m)),
    getPlaceMiniatureTypeStats: () => Object.assign({}, _stats.placeMiniatureTypes)
  };
})();
