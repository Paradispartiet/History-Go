// CivicationThreeMap.js
// 3D-miniatyr-/dioramakart for Civication (WebGL via Three.js).
//
// Mål: et stilisert «bordmodell»-Oslo – et håndbygget strategispillkart, ikke
// et satellittkart. Ekstruderte landflater, en tydelig fjord i sør, hevet Marka
// i nord, Ekebergåsen i sørøst, Bygdøy-halvøy, øyer i fjorden, et prosedyralt
// kvartalsbygd byteppe og håndlagde Oslo-landemerker.
//
// Robusthet:
// - Three.js lastes via dynamisk import() – LOKALT fra js/vendor/three (vendret,
//   committet, pinnet til three@0.160.0), med CDN kun som fallback. Dermed virker
//   3D-kartet også offline / bak proxy der CDN er blokkert.
// - Tar bare over når WebGL + biblioteket lastes OK. Ved enhver feil/offline
//   forblir det 2D Canvas-kartet aktivt som fallback (ingen blank skjerm).
// - Flatene bruker MeshStandardMaterial (PBR) med en prosedyral gradient-env
//   (scene.environment) for mykt, materialrikt anslag i den varme diorama-tonen.
// - Gjenbruker samme datakilde (DataHub), Oslo-filter og kalibrerte projeksjon
//   som Canvas-motoren, slik at places havner på samme stiliserte Oslo.
//
// Aktiveres når window.CIVICATION_THREE_MAP_ENABLED === true.
(function () {
  "use strict";

  if (window.CivicationThreeMap) return;

  // Three.js + addons lastes lokalt (vendret, committet) via import map ("three"
  // / "three/addons/"), så hoved-instansen og postprosesserings-addonene deler
  // ÉN modul-instans. Absolutt lokal URL og CDN beholdes som fallback for
  // hoved-three hvis import map / vendret fil skulle mangle (da kjører kartet
  // uten post-prosessering).
  const THREE_LOCAL_URL = (typeof document !== "undefined" && document.baseURI)
    ? new URL("js/vendor/three/three.module.js", document.baseURI).href
    : "js/vendor/three/three.module.js";
  const THREE_CDN_URL = "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

  // Postprosesserings-addons (lastes via import map i init; null hvis utilgjengelig).
  let ADDONS = null;

  // ---------------------------------------------------------------------------
  // Konfig
  // ---------------------------------------------------------------------------
  const OSLO_FILTER = { minLat: 59.75, maxLat: 60.10, minLon: 10.45, maxLon: 11.00 };

  // Del 5 – Zoombasert LOD for History Go-place-miniatyrer. Maks antall synlige
  // place-miniatyrer per nivå, og hvor små de tegnes. Lav zoom skal være ryddig
  // (landemerkene dominerer); høyere zoom åpner for flere lokale steder.
  // Vis (nesten) alle History GO-stedene som ekte miniatyr-bygg, ikke bare et
  // lite utvalg. Fyllmassen er nesten borte, så de ekte stedene ER byen.
  const PLACE_LOD_LIMITS = { low: 170, mid: 250, high: 320, veryHigh: 400 };
  const PLACE_LOD_SCALE = { low: 0.42, mid: 0.46, high: 0.50, veryHigh: 0.54 };
  function placeLodLevel(z) {
    if (z > 4.0) return "veryHigh";
    if (z > 2.6) return "high";
    if (z > 1.4) return "mid";
    return "low";
  }

  // Verdensmål: normalisert 0–1 mappes inn på et brett på MAP_W x MAP_D enheter.
  // Større brett (var 20) gir mer plass til flere steder; kamera/VIEW skaleres
  // med samme faktor så framing og tilt beholdes.
  const MAP_W = 24;
  const MAP_D = 24;

  // Terreng-/byhøyder (verdensenheter).
  const WATER_Y = 0.0;       // fjordens overflate
  const GROUND_Y = 0.12;     // topp av landplaten; bygg/trær står her
  const MARKA_H = 0.95;      // Marka-platået i nord
  const EKEBERG_H = 0.62;    // Ekebergåsen i sørøst
  const BYGDOY_H = 0.18;     // Bygdøy-halvøya (lav, skogkledd)
  const MAX_BUILDINGS = 1300;
  const MAX_ROOFS = 900;
  // Generisk (ikke-klikkbar) fyllmasse skal være en diskret bybakgrunn, ikke en
  // vegg av bokser: kraftig tynnere og luftigere, så de ekte, klikkbare stedene
  // blir hovedinnholdet.
  const FILLER_DENSITY = 0.16;  // nesten borte: ekte stedsminiatyrer er byen, ikke generiske bokser
  const FILLER_SPACING = 1.35;  // større rutenett-steg -> mer avstand mellom bygg
  const MAX_TREES = 620;

  const VIEW = 12.7;         // ortografisk halv-høyde ved zoom = 1 (skalert med brettet)
  const MIN_ZOOM = 0.5;      // mer utzoom (se hele det større brettet)
  const MAX_ZOOM = 11.0;     // mer innzoom (helt ned på enkeltsteder)
  const ZOOM_STEP = 1.22;
  const MAX_DPR = 2;

  // Kamera-basis (gir ca. 48° tilt – rolig diorama-/modellbordvinkel). Skalert
  // med brettet (×1.2) så utsnitt og vinkel er som før, bare på et større brett.
  const CAM_BASE = { x: 0.18, y: 19.8, z: 17.04 };
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

  // Post-prosessering (tilt-shift dybdeskarphet + vignett + varm grade). Egen
  // minimal komposisjon med core-THREE (ingen addon/CDN): scene rendres til et
  // render target, deretter en fullskjerms shader til skjermen. Bak et
  // kvalitetsnivå (_postEnabled) – ved lavt nivå/feil rendres scenen direkte.
  let _postEnabled = false;
  let _composer = null;
  let _ssaoPass = null;
  let _smaaPass = null;
  let _tiltPass = null;

  let _places = null;
  let _loadStarted = false;
  let _lastLod = null;
  let _stablePos = null; // bufret, zoom-uavhengig posisjon pr. place-id
  const _modelCache = {}; // "mini:<type>" / "lm:<id>" -> { wrap, h } (ekte GLB-modeller)
  let _modelsRequested = false;
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
    _stablePos = null; // ny data -> beregn stabil layout på nytt
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

  // --- Groundhopper-visning fra read-modellen (CivicationCityMap) ------------
  // Kartet leser det curerte grunnlaget for å markere de stedene som er
  // Groundhopper-relevante (arenaer/baner). Degraderer stille: er ikke
  // read-modellen tilgjengelig/lastet, skjer ingenting (ingen ring, ingen feil).
  let _cityMapLoadStarted = false;
  function ensureCityMapLoaded() {
    if (_cityMapLoadStarted) return;
    const api = window.CivicationCityMap;
    if (!api || typeof api.load !== "function") return;
    _cityMapLoadStarted = true;
    Promise.resolve(api.load())
      .then(() => { rebuildPlaces(); })          // tegn på nytt så ringene dukker opp
      .catch(() => { _cityMapLoadStarted = false; });
  }
  function isGroundhopperPlace(placeId) {
    const api = window.CivicationCityMap;
    return !!(api && typeof api.isGroundhopperPlace === "function" &&
      api.isGroundhopperPlace(placeId));
  }
  // Flat ring som legges under en miniatyr/landemerke for å markere
  // Groundhopper-relevans. Additiv – endrer ikke selve miniatyrgeometrien.
  function buildGroundhopperRing(scale) {
    const s = scale || 1;
    const geo = new THREE.RingGeometry(0.30 * s, 0.40 * s, 28);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x6fbf7a, transparent: true, opacity: 0.9,
      side: THREE.DoubleSide, depthWrite: false
    });
    const ring = new THREE.Mesh(geo, mat);
    ring.rotation.x = -Math.PI / 2;              // legg ringen flatt på bakken
    ring.userData.groundhopperRing = true;
    return ring;
  }

  // ---------------------------------------------------------------------------
  // Geometri-hjelpere
  // ---------------------------------------------------------------------------
  // Standard PBR-standardverdier for diorama-flatene: matt (høy ruhet), ikke-
  // metallisk. Sammen med scene.environment (myk gradient-IBL) gir dette
  // material-dybde og mykt anslag uten å bryte den varme, dempede paletten.
  const PBR_ROUGHNESS = 0.82;
  const PBR_METALNESS = 0.0;
  function toMat(c, opts) {
    if (c && c.isMaterial) return c;
    const params = Object.assign(
      { roughness: PBR_ROUGHNESS, metalness: PBR_METALNESS },
      opts || {},
      { color: new THREE.Color(c) }
    );
    return new THREE.MeshStandardMaterial(params);
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
    [0.78, 0.705],           // Grønland / Gamle Oslo-kant
    [0.705, 0.735],          // Sørenga-odden stikker ut i sør
    [0.660, 0.660],          // Bjørvika-bukta trekker seg nordover (innskåret havn)
    [0.622, 0.632],          // Bjørvika-bunn (Barcode/Munch-shore)
    [0.598, 0.672],          // østre Opera-spiss stikker ut
    [0.560, 0.700],          // Bjørvika-munning mot Akershus
    [0.524, 0.700],          // Akershus-odden østside
    [0.512, 0.690],          // Akershus-nes (stikker sør mellom de to buktene)
    [0.498, 0.662],          // Akershus vestside inn i Pipervika
    [0.468, 0.628],          // Pipervika-bunn (Rådhusplassen)
    [0.432, 0.652],          // Pipervika vestside
    [0.398, 0.678],          // Aker Brygge
    [0.352, 0.702],          // mot Bygdøy-halsen / Frognerkilen
    [0.245, 0.70], [0.13, 0.70], [-0.03, 0.69]
  ];
  // Bygdøy – gjenkjennelig halvøy vest for sentrum som henger sørover i fjorden,
  // med Bygdøynes (museene) som spiss mot sørøst og Frognerkilen-vann på nordsiden.
  const BYGDOY = [
    [0.075, 0.715], [0.205, 0.712], [0.255, 0.745], [0.235, 0.795],
    [0.300, 0.815], [0.288, 0.872], [0.222, 0.892], [0.170, 0.858],
    [0.150, 0.800], [0.085, 0.792], [0.048, 0.748]
  ];
  // Snarøya/Nesodden-armen – lav, skogkledd landtunge langs vestkanten som
  // rammer fjorden på venstre side (uten å blokkere utsikten mot byen i nord).
  const WEST_SHORE = [
    [-0.06, 0.60], [0.045, 0.625], [0.065, 0.72], [0.05, 0.83],
    [0.00, 0.94], [-0.06, 0.97]
  ];
  const WEST_SHORE_H = 0.15;

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
    // Snarøya/Nesodden-armen – rammer fjorden i vest.
    scene.add(extrudeShape(WEST_SHORE, WEST_SHORE_H, PAL.bygdoy, 0, { cast: true }));

    // Marka som hevet skogsplatå i nord, Ekeberg som ås i sørøst.
    if (land.markaNorth) scene.add(extrudeShape(land.markaNorth, MARKA_H, PAL.marka, 0, { cast: true, bevel: 0.04 }));
    if (land.ekebergRidge) scene.add(extrudeShape(land.ekebergRidge, EKEBERG_H, PAL.ekeberg, 0, { cast: true, bevel: 0.03 }));

    // Oslos indre øyklynge (Hovedøya størst, nærmest sentrum, så Lindøya,
    // Bleikøya, Gressholmen, Nakholmen utover). Flate modelløyer på strandsokkel.
    const islands = [
      [0.470, 0.780, 0.60], // Hovedøya
      [0.405, 0.815, 0.34], // Lindøya
      [0.520, 0.822, 0.32], // Bleikøya
      [0.455, 0.858, 0.30], // Gressholmen
      [0.372, 0.788, 0.24], // Nakholmen
      [0.560, 0.792, 0.24]  // Rambergøya
    ];
    islands.forEach(([nx, ny, r]) => {
      const sand = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.6, 0.045, 16), toMat(0xcab795));
      sand.position.set(nx2x(nx), 0.022, ny2z(ny));
      sand.receiveShadow = true;
      scene.add(sand);
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toMat(PAL.island));
      m.position.set(nx2x(nx), 0.045, ny2z(ny));
      m.scale.y = 0.30; // flatere -> leser som øy, ikke ball
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

  // Kjøreveier: matt asfaltgrå banelegme + valgfri, tynn malt midtstripe som
  // sitter rett oppå banen. Gjør at veiene leser som veier uten hardt
  // kart-overlay-preg.
  const ROAD_ASPHALT = 0x565b62;
  const ROAD_MARKING = 0xd9cc9c;
  function addRoad(g, points, width, y, opts) {
    const o = opts || {};
    g.add(buildRoadRibbon(points, width, o.color != null ? o.color : ROAD_ASPHALT, y));
    if (o.marking) {
      // Tynn (0.004 høy) stripe like over asfalttoppen (0.018).
      g.add(extrudeShape(ribbonPolygon(points, Math.max(0.0012, width * 0.14)), 0.004, ROAD_MARKING, y + 0.02, { cast: false, receive: false }));
    }
  }

  function buildAxes() {
    const land = window.CIVI_OSLO_LANDSCAPE || {};
    const g = new THREE.Group();
    const baseY = GROUND_Y + 0.04;
    _stats.roadSegments = 0;

    // Akerselva-korridoren – tydelig blå elv som renner nord–sør gjennom byen
    // og munner ut i fjorden. Bredere og litt mørkere enn før så den leser som elv.
    if (land.akerselva) {
      g.add(extrudeShape(ribbonPolygon(land.akerselva, 0.016), 0.012, shade(PAL.river, -0.06), baseY - 0.004, { cast: false, receive: false }));
      g.add(extrudeShape(ribbonPolygon(land.akerselva, 0.010), 0.02, PAL.river, baseY, { cast: false, receive: false }));
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
    addRoad(g,
      [[0.44, 0.60], [0.50, 0.585], [0.56, 0.595], [0.59, 0.635], [0.55, 0.665], [0.47, 0.665], [0.44, 0.63], [0.44, 0.60]],
      0.010, baseY, { marking: true }
    );

    // Ring 2 – større bue nord for sentrum.
    addRoad(g,
      [[0.28, 0.535], [0.38, 0.47], [0.50, 0.45], [0.62, 0.46], [0.70, 0.505]],
      0.013, baseY, { marking: true }
    );

    // E18 / havneakse langs fjorden vest–øst.
    addRoad(g,
      [[0.30, 0.685], [0.40, 0.667], [0.47, 0.657], [0.54, 0.66], [0.62, 0.66], [0.70, 0.675]],
      0.012, baseY - 0.002, { color: shade(ROAD_ASPHALT, -0.05), marking: true }
    );

    // Trondheimsveien / nordøst-akse mot Grünerløkka/Tøyen.
    addRoad(g,
      [[0.53, 0.585], [0.56, 0.54], [0.59, 0.50], [0.625, 0.46], [0.65, 0.42]],
      0.011, baseY, { marking: true }
    );

    // Få, lokale forbindelser som hjelper nabolagslesing uten Google Maps-preg.
    addRoad(g, [[0.555, 0.455], [0.585, 0.485], [0.625, 0.518]], 0.008, baseY, { color: shade(ROAD_ASPHALT, 0.04) });
    addRoad(g, [[0.362, 0.445], [0.350, 0.505], [0.335, 0.575], [0.315, 0.640]], 0.008, baseY, { color: shade(ROAD_ASPHALT, 0.05) });
    addRoad(g, [[0.425, 0.458], [0.445, 0.490], [0.455, 0.515]], 0.007, baseY, { color: shade(ROAD_ASPHALT, 0.03) });
    addRoad(g, [[0.386, 0.655], [0.464, 0.613], [0.505, 0.646]], 0.011, baseY + 0.004, { color: 0xb9b4ab });
    addRoad(g, [[0.626, 0.518], [0.662, 0.552], [0.690, 0.562]], 0.008, baseY, { color: shade(ROAD_ASPHALT, 0.0) });

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
    const baseY = (y || GROUND_Y) + 0.03;
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2, rr = r * (0.25 + rng() * 0.75);
      const px = nx2x(nx + Math.cos(a) * rr), pz = ny2z(ny + Math.sin(a) * rr);
      const th = 0.5 + rng() * 0.3;              // total trehøyde
      const trunkH = th * 0.36, ballR = th * 0.42;
      const trunk = cyl(0.03, 0.045, trunkH, 6, 0x6b4a2e);
      trunk.castShadow = false;
      trunk.position.set(px, baseY + trunkH / 2, pz);
      g.add(trunk);
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(ballR, 0), toMat(0x4f8a4a + Math.floor(rng() * 0x081000)));
      crown.castShadow = false; crown.receiveShadow = true;
      crown.scale.y = 0.9;
      crown.position.set(px, baseY + trunkH + ballR * 0.7, pz);
      g.add(crown);
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
      g.add(extrudeShape(ribbonPolygon(land.akerselva, 0.022), 0.012, 0x5f8f59, baseY - 0.018, { cast: false, receive: false }));
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
  // Myk gradient-IBL (himmel → horisont → varm bakke), generert i minnet via en
  // liten CanvasTexture + PMREM. Gir MeshStandard-flatene et retningsbestemt,
  // mykt anslag (image-based lighting) uten å laste ned noen asset.
  function buildEnvironment() {
    if (!renderer || typeof THREE.PMREMGenerator !== "function") return;
    const size = 128;
    const cvs = document.createElement("canvas");
    cvs.width = 8;
    cvs.height = size;
    const ctx = cvs.getContext("2d");
    if (!ctx) return;
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0.0, "#e6eef5");   // himmel (topp)
    grad.addColorStop(0.45, "#c2ccd4");
    grad.addColorStop(0.55, "#9aa0a2");  // horisont
    grad.addColorStop(1.0, "#4a443c");   // bakke (bunn, varm)
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 8, size);
    const tex = new THREE.CanvasTexture(cvs);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromEquirectangular(tex).texture;
    tex.dispose();
    pmrem.dispose();
  }

  function buildLights() {
    // Lysere, varmere dagslys så de ekte modellenes farger spretter, uten å
    // blåse ut PBR-flatene. Himmel-/omgivelseslys løftet, sol varmere og
    // sterkere, litt mer kjølig fill for dybde.
    scene.add(new THREE.HemisphereLight(0xe2ecf5, 0x474d3c, 0.66));
    const sun = new THREE.DirectionalLight(0xfff4e4, 1.36);
    sun.position.set(-15, 24, 13); // konsekvent mykt lys oppe-til-venstre
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -18; sc.right = 18; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 80;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.5;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xccdcee, 0.36);
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

  // Prosedyral fasade-tekstur: lys vegg (nær hvit så bygg-tonen slår gjennom via
  // instanceColor) med rutenett av mørkere «glass»-vinduer, etasjeskiller og et
  // bredere gateplan-bånd nederst. Gjør de instansierte boksene til lesbare
  // bygninger med vinduer uten ekstra draw calls. Én tekstur pr. etasjeantall
  // (bufret) så vinduene skaleres med byggehøyden i stedet for å strekkes.
  const _facadeTex = {};
  function facadeTexture(rows) {
    const nRows = Math.max(2, Math.round(rows || 8));
    if (_facadeTex[nRows]) return _facadeTex[nRows];
    if (typeof document === "undefined" || !document.createElement) return null;
    const rowPx = 28, top = 14, bandH = 20; // fast etasjehøyde -> proporsjonal tekstur
    const W = 128, H = top + nRows * rowPx + bandH;
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H;
    const ctx = cv.getContext && cv.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#efe9e0"; ctx.fillRect(0, 0, W, H); // veggflate
    const cols = 4, marginX = 14;
    const colStep = (W - marginX * 2) / cols;
    const winW = colStep * 0.56, winH = 17;
    for (let r = 0; r < nRows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = marginX + c * colStep + (colStep - winW) / 2;
        const y = top + r * rowPx + (rowPx - winH) / 2;
        // Litt variasjon: noen ruter mørkere (skygge/tent) så fasaden ikke blir flat.
        ctx.fillStyle = ((r * 7 + c * 3) % 5 === 0) ? "#6d7b87" : "#8593a0";
        ctx.fillRect(x, y, winW, winH);
        ctx.strokeStyle = "#d3cabb"; ctx.lineWidth = 1;
        ctx.strokeRect(x + 0.5, y + 0.5, winW - 1, winH - 1);
      }
    }
    // Gateplan / butikkfront nederst (lysere bånd) + en tynn taklist øverst.
    ctx.fillStyle = "#d9cfbe"; ctx.fillRect(0, H - bandH, W, bandH);
    ctx.fillStyle = "#c7bdab"; ctx.fillRect(0, H - bandH, W, 3);
    ctx.fillStyle = "#e6ded2"; ctx.fillRect(0, 0, W, 5);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
    if ("colorSpace" in tex) tex.colorSpace = THREE.SRGBColorSpace;
    if (renderer && renderer.capabilities) tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy?.() || 1);
    _facadeTex[nRows] = tex;
    return tex;
  }

  // Byggehøyde -> antall vindusetasjer (bøttet, så høye tårn får flere etasjer
  // enn lave rekkehus i stedet for samme strukne tekstur).
  const FACADE_BUCKETS = [
    { max: 0.5, rows: 2 }, { max: 0.72, rows: 3 }, { max: 0.95, rows: 5 },
    { max: 1.2, rows: 7 }, { max: Infinity, rows: 10 }
  ];
  function facadeBucketIndex(h) {
    for (let i = 0; i < FACADE_BUCKETS.length; i++) if (h < FACADE_BUCKETS[i].max) return i;
    return FACADE_BUCKETS.length - 1;
  }

  function buildCity() {
    const districts = window.CIVI_MAP_DISTRICTS || [];
    // Kystmaske: generiske bygg skal bare stå på faktisk land (innenfor
    // kystlinja eller på Ekeberg-landmassen), aldri ute i fjorden/buktene. Uten
    // dette strekker bydelspolygonene byggmasse ut over vannet ved havna.
    const ekeR = (window.CIVI_OSLO_LANDSCAPE || {}).ekebergRidge;
    const onLand = (nx, ny) => pointInPoly(nx, ny, LAND_COAST) || (ekeR && pointInPoly(nx, ny, ekeR));
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
      const stepX = (baseProf.cell + baseProf.gap) * FILLER_SPACING;
      const stepY = (baseProf.cell + baseProf.gap) * FILLER_SPACING;
      const pad = stepX;
      for (let gy = bb.minY - pad; gy <= bb.maxY + pad; gy += stepY) {
        for (let gx = bb.minX - pad; gx <= bb.maxX + pad; gx += stepX) {
          // roter rutenettet rundt bydelssenter -> antydede gater i vinkel.
          const lx = gx - cx, ly = gy - cy;
          const nx = cx + lx * ca - ly * sa;
          const ny = cy + lx * sa + ly * ca;
          if (!pointInPoly(nx, ny, poly)) continue;
          if (!onLand(nx, ny)) continue; // ikke bygg ute i fjorden/buktene
          const prof = districtVisualProfileForPoint(d.id, nx, ny);
          const clearFactor = clearZoneBuildingFactor(nx, ny);
          if (clearFactor <= 0) continue;
          if (rng() > prof.dens * clearFactor * FILLER_DENSITY) continue;
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

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
    const pos = new THREE.Vector3(), scl = new THREE.Vector3(), col = new THREE.Color();

    // Vegger/kropp – ett InstancedMesh pr. høydeklasse, hver med sin egen
    // fasade-tekstur (flere vindusetasjer jo høyere bygget). Bygg-tonen kommer
    // fortsatt fra instanceColor (multipliseres med teksturen).
    const bucketBlocks = FACADE_BUCKETS.map(() => []);
    blocks.forEach((b) => bucketBlocks[facadeBucketIndex(b.h)].push(b));
    bucketBlocks.forEach((list, bi) => {
      if (!list.length) return;
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: PBR_ROUGHNESS, metalness: PBR_METALNESS });
      const facadeTex = facadeTexture(FACADE_BUCKETS[bi].rows);
      if (facadeTex) wallMat.map = facadeTex;
      const wall = new THREE.InstancedMesh(geo, wallMat, list.length);
      wall.castShadow = true; wall.receiveShadow = true;
      list.forEach((b, k) => {
        q.setFromAxisAngle(up, b.rot);
        pos.set(b.x, GROUND_Y + b.h / 2, b.z);
        scl.set(b.fw, b.h, b.fd);
        m.compose(pos, q, scl);
        wall.setMatrixAt(k, m);
        wall.setColorAt(k, buildingColor(col, b.toneKind, b.tone));
      });
      wall.instanceMatrix.needsUpdate = true;
      if (wall.instanceColor) wall.instanceColor.needsUpdate = true;
      scene.add(wall);
    });

    // Tak – eget InstancedMesh (saltak-prismer) for kvartalsbyene.
    const roofList = blocks.filter((b) => b.roof).slice(0, MAX_ROOFS);
    let roofMesh = null;
    if (roofList.length) {
      const rgeo = new THREE.ExtrudeGeometry(
        (() => { const s = new THREE.Shape(); s.moveTo(-0.5, 0); s.lineTo(0.5, 0); s.lineTo(0, 1); s.closePath(); return s; })(),
        { depth: 1, bevelEnabled: false }
      );
      rgeo.translate(0, 0, -0.5);
      roofMesh = new THREE.InstancedMesh(rgeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: PBR_ROUGHNESS, metalness: PBR_METALNESS }), roofList.length);
      roofMesh.castShadow = true; roofMesh.receiveShadow = true;
    }

    // Flate tak: en tynn hette som dekker toppflaten (så fasadevinduene ikke
    // vises oppå bygget) og gir taket en egen, mørkere tone.
    const flatList = blocks.filter((b) => !b.roof);
    let capMesh = null;
    if (flatList.length) {
      capMesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: PBR_METALNESS }), flatList.length);
      capMesh.castShadow = true; capMesh.receiveShadow = true;
    }

    let ri = 0, ci = 0;
    blocks.forEach((b) => {
      q.setFromAxisAngle(up, b.rot);
      if (roofMesh && b.roof && ri < roofList.length) {
        const rh = Math.min(b.fw, b.fd) * 0.55;
        pos.set(b.x, GROUND_Y + b.h, b.z);
        scl.set(b.fw, rh, b.fd);
        m.compose(pos, q, scl);
        roofMesh.setMatrixAt(ri, m);
        roofMesh.setColorAt(ri, roofColor(col, b));
        ri++;
      } else if (capMesh && !b.roof && ci < flatList.length) {
        pos.set(b.x, GROUND_Y + b.h, b.z);
        scl.set(b.fw * 1.03, 0.05, b.fd * 1.03);
        m.compose(pos, q, scl);
        capMesh.setMatrixAt(ci, m);
        buildingColor(col, b.toneKind, b.tone).multiplyScalar(0.6);
        capMesh.setColorAt(ci, col);
        ci++;
      }
    });
    if (roofMesh) {
      roofMesh.instanceMatrix.needsUpdate = true;
      if (roofMesh.instanceColor) roofMesh.instanceColor.needsUpdate = true;
      scene.add(roofMesh);
    }
    if (capMesh) {
      capMesh.instanceMatrix.needsUpdate = true;
      if (capMesh.instanceColor) capMesh.instanceColor.needsUpdate = true;
      scene.add(capMesh);
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
    // conifer = andel bartrær (gran/furu). Marka/Ekeberg er nesten bare barskog;
    // parker og villastrøk får mer løvtre.
    if (land.markaNorth) regions.push({ poly: land.markaNorth, baseY: MARKA_H, n: 320, conifer: 0.9 });
    if (land.ekebergRidge) regions.push({ poly: land.ekebergRidge, baseY: EKEBERG_H, n: 110, conifer: 0.78 });
    regions.push({ poly: BYGDOY, baseY: BYGDOY_H, n: 60, conifer: 0.5 });
    regions.push({ poly: WEST_SHORE, baseY: WEST_SHORE_H, n: 70, conifer: 0.85 });
    const greenDistricts = ["nordstrand", "stovner", "ullern"];
    (window.CIVI_MAP_DISTRICTS || []).forEach((d) => {
      if (greenDistricts.includes(d.id)) regions.push({ poly: d.shape, baseY: GROUND_Y, n: 38, conifer: 0.35 });
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
        pts.push({ x: nx2x(x), z: ny2z(y), baseY: reg.baseY, h: 0.42 + rng() * 0.4, tone: rng(), conifer: rng() < reg.conifer });
        placed++;
      }
    });
    if (!pts.length) return;

    // Hvert tre = stamme (sylinder) + krone. Bartrær får spiss, lagdelt kjegle,
    // løvtrær en rund krone. Tre delte InstancedMesh-er (stamme/bar/løv) så vi
    // holder ytelsen, men får en tydelig tre-silhuett i stedet for en pigg.
    const conifers = pts.filter((t) => t.conifer);
    const decids = pts.filter((t) => !t.conifer);
    const trunkGeo = new THREE.CylinderGeometry(0.028, 0.042, 1, 5);
    const coneGeo = new THREE.ConeGeometry(0.34, 1, 8);
    const ballGeo = new THREE.IcosahedronGeometry(0.5, 0);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0 });
    const leafMat = () => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: PBR_ROUGHNESS, metalness: PBR_METALNESS });
    const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, pts.length);
    const coneMeshI = conifers.length ? new THREE.InstancedMesh(coneGeo, leafMat(), conifers.length) : null;
    const ballMesh = decids.length ? new THREE.InstancedMesh(ballGeo, leafMat(), decids.length) : null;
    [trunkMesh, coneMeshI, ballMesh].forEach((mm) => { if (mm) { mm.castShadow = false; mm.receiveShadow = true; } });
    const m = new THREE.Matrix4(), q = new THREE.Quaternion();
    const pos = new THREE.Vector3(), scl = new THREE.Vector3(), col = new THREE.Color();

    pts.forEach((t, i) => {
      const trunkH = t.h * 0.34;
      pos.set(t.x, t.baseY + trunkH / 2, t.z);
      scl.set(0.7 + t.tone * 0.5, trunkH, 0.7 + t.tone * 0.5);
      m.compose(pos, q, scl);
      trunkMesh.setMatrixAt(i, m);
      col.setHSL(0.075, 0.42, 0.20 + t.tone * 0.07); // stamme: brun
      trunkMesh.setColorAt(i, col);
    });

    conifers.forEach((t, i) => {
      const trunkH = t.h * 0.34, canopyH = t.h * 0.98;
      const r = 0.62 + t.tone * 0.6;
      pos.set(t.x, t.baseY + trunkH * 0.55 + canopyH / 2, t.z);
      scl.set(r, canopyH, r);
      m.compose(pos, q, scl);
      coneMeshI.setMatrixAt(i, m);
      col.setHSL(0.34 + t.tone * 0.03, 0.44, 0.19 + t.tone * 0.10); // mørk granfarge
      coneMeshI.setColorAt(i, col);
    });

    decids.forEach((t, i) => {
      const trunkH = t.h * 0.36, ballR = t.h * 0.44;
      const s = ballR / 0.5;
      pos.set(t.x, t.baseY + trunkH + ballR * 0.75, t.z);
      scl.set(s * (0.9 + t.tone * 0.3), s * (0.85 + t.tone * 0.2), s * (0.9 + t.tone * 0.3));
      m.compose(pos, q, scl);
      ballMesh.setMatrixAt(i, m);
      col.setHSL(0.25 + t.tone * 0.06, 0.46, 0.30 + t.tone * 0.12); // lysere løvverk
      ballMesh.setColorAt(i, col);
    });

    [trunkMesh, coneMeshI, ballMesh].forEach((mm) => {
      if (!mm) return;
      mm.instanceMatrix.needsUpdate = true;
      if (mm.instanceColor) mm.instanceColor.needsUpdate = true;
      scene.add(mm);
    });
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

  // Del 2 – ren grupperingslogikk (uten scene/DOM, derfor testbar): del en liste
  // normaliserte places i kandidater + ett kanonisk place per håndmodellert
  // landemerke. Eksakt id/navn-treff foran delstreng, så f.eks. selve teateret
  // velges foran «<teater> stasjon». hiddenCount = alle skjulte duplikater.
  function dedupeLandmarkPlaces(list) {
    const byLandmark = {};
    const candidates = [];
    let hiddenCount = 0;
    (list || []).forEach((p) => {
      const info = landmarkMatchInfo(p);
      if (info && getLandmarkEntry(info.landmarkId)) {
        hiddenCount++;
        const cur = byLandmark[info.landmarkId];
        if (!cur || (info.exact && !cur.exact)) byLandmark[info.landmarkId] = { place: p, exact: info.exact };
      } else {
        candidates.push(p);
      }
    });
    return { byLandmark, candidates, hiddenCount };
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

    // Flaggstang med norsk flagg på toppen av tårnet.
    const pole = cyl(0.008, 0.008, 0.34, 6, 0xbfb69f); pole.position.set(0, 1.5 + 0.17, -0.78); g.add(pole);
    const flag = box(0.005, 0.09, 0.14, 0xc0392b); flag.position.set(0, 1.5 + 0.28, -0.71); g.add(flag);
    const flagCross = box(0.006, 0.02, 0.14, 0xf2f2f2); flagCross.position.set(0, 1.5 + 0.28, -0.71); g.add(flagCross);

    return { group: g, h: 1.9 };
  }

  // 2/3. Smalt høyt tårn (Plaza) og lavere bredt tårn (Posthuset).
  function createPlazaTower(o) {
    const g = new THREE.Group();
    const h = o.h || 2.6, w = o.w || 0.3, d = o.d || 0.34, c = o.color || 0x3b4b5f;
    g.add(box(w, h, d, c));
    const cap = box(w * 0.82, 0.08, d * 0.82, shade(c, 0.12)); cap.position.y = h; g.add(cap);
    // Glassfasade på fronten (+z) med etasjebånd og vertikale delelinjer, så
    // tårnet leser som et glass-kontorbygg med etasjer, ikke en glatt boks.
    const glass = box(w * 0.66, h * 0.92, 0.02, shade(c, 0.22)); glass.position.set(0, h * 0.5, d / 2); g.add(glass);
    const floors = Math.max(4, Math.round(h / 0.16));
    for (let f = 1; f < floors; f++) {
      const line = box(w * 0.66, 0.01, 0.01, shade(c, -0.12));
      line.position.set(0, (h * 0.92 * f) / floors + h * 0.04, d / 2 + 0.011); g.add(line);
    }
    [-0.22, 0.22].forEach((fx) => {
      const v = box(0.008, h * 0.9, 0.01, shade(c, -0.1)); v.position.set(fx * w, h * 0.5, d / 2 + 0.011); g.add(v);
    });
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

    // Liten sentral inngangsgavl mot byen (+z), med det ikoniske tårnuret.
    const entry = box(0.34, h * 0.95, 0.12, shade(c, -0.08)); entry.position.set(0, h * 0.475, 0.28); g.add(entry);
    const gable = gableRoof(0.36, 0.12, 0.14, shade(c, -0.14)); gable.position.set(0, h * 0.95, 0.28); g.add(gable);
    const clockFace = cyl(0.05, 0.05, 0.015, 14, 0xf2ede2); clockFace.rotation.x = Math.PI / 2; clockFace.position.set(0, h * 0.78, 0.35); g.add(clockFace);
    const clockRim = cyl(0.057, 0.057, 0.01, 14, shade(c, -0.2)); clockRim.rotation.x = Math.PI / 2; clockRim.position.set(0, h * 0.78, 0.345); g.add(clockRim);
    // Vindusbånd langs den lange terminalfasaden.
    addWindows(g, c, { cols: 7, rows: 1, y0: h * 0.5, z: 0.265, spanX: 0.9, w: 0.05, wh: 0.12 });

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

    // Marmorpanel-skjøter på den skrå takflaten (tynne, litt mørkere linjer) –
    // gir den ikoniske «gå-på-taket»-panelfølelsen i stedet for én glatt kile.
    for (let i = 1; i < 6; i++) {
      const seam = box(L * 0.98, 0.008, 0.012, shade(white, -0.1));
      const t = i / 6; // langs skråningen fra rygg (z=-depth/2) til vann (z=+depth/2)
      seam.position.set(0, H * (1 - t) + 0.004, -depth / 2 + depth * t);
      seam.rotation.x = Math.atan2(H, depth); g.add(seam);
    }
    [-1, 1].forEach((s) => { // tverrskjøter
      const seam = box(0.01, 0.008, depth * 1.02, shade(white, -0.08));
      seam.position.set(s * L * 0.28, H * 0.5 + 0.004, 0); seam.rotation.x = Math.atan2(H, depth); g.add(seam);
    });

    // Ikonisk glass-foajévegg reist opp fra ryggen (mot byen).
    const foyer = box(L * 0.5, H * 0.92, 0.05, glass); foyer.position.set(0, H * 0.46, -depth / 2 - 0.02); g.add(foyer);
    const foyerFrame = box(L * 0.52, 0.03, 0.06, shade(white, -0.05)); foyerFrame.position.set(0, H * 0.92, -depth / 2 - 0.02); g.add(foyerFrame);
    // Lavt scenetårn som bryter ryggen.
    const tower = box(0.5, 0.5, 0.3, mixHex(glass, white, 0.4)); tower.position.set(0.42, 0.25, -depth / 2 - 0.08); g.add(tower);

    // Hvit marmorplass mot vannkanten.
    const apron = box(L * 0.94, 0.03, 0.42, 0xdedacf);
    apron.position.set(0, 0, depth / 2 + 0.18); apron.receiveShadow = true; g.add(apron);

    return { group: g, h: H };
  }

  // Munch / Deichman – egne kulturblokker. Munch-tårnet får sin ikoniske knekk:
  // den øvre tredelen bøyer seg tydelig framover, med glassbånd på fronten.
  function createCultureBlock(o) {
    const g = new THREE.Group();
    const c = (o && o.color) || 0x6f7a86, h = (o && o.h) || 1.2;
    if (o && o.lean) {
      // Rett underdel (2/3) + framoverbøyd overdel (1/3) = Munch-silhuetten.
      const baseH = h * 0.66;
      g.add(box(0.46, baseH, 0.46, c));
      const baseGlass = box(0.4, baseH * 0.88, 0.02, shade(c, 0.2)); baseGlass.position.set(0, baseH * 0.5, 0.235); g.add(baseGlass);
      const topH = h * 0.4;
      const top = box(0.46, topH, 0.46, shade(c, 0.05)); top.position.set(0.12, baseH + topH * 0.42, 0.04); top.rotation.z = -0.2; g.add(top);
      const topGlass = box(0.4, topH * 0.86, 0.02, shade(c, 0.22)); topGlass.position.set(0.15, baseH + topH * 0.42, 0.25); topGlass.rotation.z = -0.2; g.add(topGlass);
      return { group: g, h: h + 0.05 };
    }
    // Deichman o.l. – rett kulturblokk med glassfront og takkant.
    g.add(box(0.46, h, 0.46, c));
    const glass = box(0.4, h * 0.9, 0.02, shade(c, 0.18)); glass.position.set(0, h * 0.5, 0.235); g.add(glass);
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

    // Lav, bred mellombygning med arkade (søylerad) langs forsiden.
    const midH = 0.72;
    const mid = box(1.12, midH, 0.58, shade(c, 0.04)); mid.position.set(0, midH / 2, 0); g.add(mid);
    const midCap = box(1.16, 0.05, 0.62, dark); midCap.position.set(0, midH, 0); g.add(midCap);
    addWindows(g, c, { cols: 7, rows: 2, y0: midH * 0.34, dy: midH * 0.4, spanX: 0.9, z: 0.295, w: 0.05, wh: 0.1 });
    for (let i = 0; i < 9; i++) { // arkade/søylegang mot forplassen
      const px = -0.44 + (0.88 * i) / 8;
      const col = cyl(0.022, 0.022, 0.16, 8, shade(c, 0.1)); col.position.set(px, 0.08, 0.3); g.add(col);
    }

    // To massive rektangulære tegltårn (litt ulik høyde, som de ekte), hver med
    // vindusrutenett og en liten takhatt.
    [[-0.35, 1.5], [0.35, 1.66]].forEach(([x, h]) => {
      const tw = box(0.42, h, 0.48, c); tw.position.set(x, h / 2, -0.04); g.add(tw);
      const cap = box(0.46, 0.07, 0.52, dark); cap.position.set(x, h, -0.04); g.add(cap);
      const hat = box(0.2, 0.12, 0.24, shade(c, -0.16)); hat.position.set(x, h + 0.09, -0.04); g.add(hat);
      const winGrp = new THREE.Group(); winGrp.position.x = x; g.add(winGrp);
      addWindows(winGrp, c, { cols: 3, rows: 6, y0: h * 0.28, dy: h * 0.11, spanX: 0.26, z: 0.21, w: 0.045, wh: 0.055 });
    });

    // Forplass mot fjorden (sør/+z).
    const court = box(0.92, 0.025, 0.5, 0xb6a07e); court.position.set(0, 0, 0.52); court.receiveShadow = true; g.add(court);

    return { group: g, h: 1.66 + 0.15 };
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
    // Vindusrekker på fasaden (to etasjer) – gir palasspreg.
    addWindows(g, c, { cols: 9, rows: 2, y0: top + bodyH * 0.32, dy: bodyH * 0.4, spanX: 1.06, z: 0.235, w: 0.05, wh: 0.09 });

    // To fremskutte sidefløyer med egne vinduer.
    [-0.62, 0.62].forEach((x) => {
      const wing = box(0.34, bodyH * 0.92, 0.6, shade(c, -0.03));
      wing.position.set(x, top + bodyH * 0.46, 0.08); g.add(wing);
      const wcap = box(0.38, 0.05, 0.64, shade(c, -0.14)); wcap.position.set(x, top + bodyH * 0.92, 0.08); g.add(wcap);
      addWindows(g, c, { cols: 2, rows: 2, y0: top + bodyH * 0.3, dy: bodyH * 0.38, spanX: 0.16, z: 0.385, w: 0.045, wh: 0.08 });
    });

    // Midtrisalitt med klassisk søyleportikk (6 søyler) og trekantgavl/pediment.
    const ris = box(0.5, bodyH * 1.14, 0.14, shade(c, 0.05)); ris.position.set(0, top + bodyH * 0.57, 0.24); g.add(ris);
    for (let i = 0; i < 6; i++) {
      const cx = -0.2 + (0.4 * i) / 5;
      const col = cyl(0.03, 0.03, bodyH * 0.86, 10, shade(c, 0.14)); col.position.set(cx, top + bodyH * 0.43, 0.34); g.add(col);
    }
    const pediment = gableRoof(0.5, 0.12, 0.16, shade(c, -0.06)); pediment.position.set(0, top + bodyH * 1.14, 0.26); g.add(pediment);

    // Flaggstang på midttaket.
    const pole = cyl(0.008, 0.008, 0.34, 6, 0xbfb69f); pole.position.set(0, top + bodyH * 1.14 + 0.17, 0); g.add(pole);
    const flag = box(0.005, 0.08, 0.12, 0xc0392b); flag.position.set(0, top + bodyH * 1.14 + 0.28, 0.06); g.add(flag);

    // Plass/akse foran (mot Karl Johan).
    const plaza = box(0.56, 0.025, 0.74, 0xcdbb97); plaza.position.set(0, top, 0.62); plaza.receiveShadow = true; g.add(plaza);

    return { group: g, h: top + bodyH * 1.14 + 0.34 };
  }

  // Nationaltheatret – klassisk søylefront med trekantgavl, to hjørnepaviljonger
  // med grønne kuppeltak (bygningens signatur) og to statueplinter (Ibsen/
  // Bjørnson) på plassen foran.
  function createTheatre(o) {
    const g = new THREE.Group();
    const c = (o && o.color) || PAL.culture, h = (o && o.h) || 0.55;
    g.add(box(0.8, h, 0.5, c));
    // Klassisk søylefront under trekantgavl.
    for (let i = -2; i <= 2; i++) {
      const col = cyl(0.045, 0.045, h * 0.95, 8, shade(c, 0.12)); col.position.set(i * 0.16, h * 0.475, 0.28); g.add(col);
    }
    const ped = gableRoof(0.62, 0.15, 0.2, shade(c, -0.08)); ped.position.set(0, h, 0.28); g.add(ped);
    const roof = box(0.84, 0.06, 0.54, shade(c, -0.14)); roof.position.y = h; g.add(roof);
    addWindows(g, c, { cols: 3, rows: 1, y0: h * 0.55, z: 0.255, spanX: 0.4, w: 0.045, wh: 0.08 });

    // To hjørnepaviljonger med grønne kuppeltak.
    [-0.46, 0.46].forEach((x) => {
      const pav = box(0.22, h * 1.12, 0.32, shade(c, 0.03)); pav.position.set(x, h * 0.56, -0.02); g.add(pav);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 9, 0, Math.PI * 2, 0, Math.PI / 2), toMat(0x5f8a6a));
      dome.scale.y = 1.15; dome.position.set(x, h * 1.12, -0.02); g.add(dome);
      const finial = cyl(0.008, 0.008, 0.09, 6, 0x6f9a78); finial.position.set(x, h * 1.12 + 0.16, -0.02); g.add(finial);
    });
    // Statueplinter (Ibsen/Bjørnson) foran inngangen.
    [-0.22, 0.22].forEach((x) => {
      const base = box(0.07, 0.05, 0.07, PAL.stone); base.position.set(x, 0.025, 0.44); g.add(base);
      const fig = box(0.035, 0.11, 0.035, shade(PAL.stone, -0.12)); fig.position.set(x, 0.105, 0.44); g.add(fig);
    });
    return { group: g, h: h * 1.12 + 0.16 };
  }

  // Stortinget – lav, gul civic-bygning med det ikoniske halvrunde midtpartiet
  // som stikker fram (stortingssalen), to symmetriske sidefløyer, vindusrekker
  // og en lav kuppel over den runde fronten.
  function createCivicLow(o) {
    const g = new THREE.Group();
    const c = (o && o.color) || 0xc9a96a, h = (o && o.h) || 0.55;

    // Lang horisontal hovedkropp + gesims.
    g.add(box(1.2, h, 0.4, c));
    const cap = box(1.26, 0.05, 0.44, shade(c, -0.12)); cap.position.y = h; g.add(cap);

    // To symmetriske endefløyer, litt lavere.
    [-0.62, 0.62].forEach((x) => {
      const wing = box(0.26, h * 0.9, 0.46, shade(c, -0.02)); wing.position.set(x, h * 0.45, 0.02); g.add(wing);
      const wcap = box(0.3, 0.05, 0.5, shade(c, -0.13)); wcap.position.set(x, h * 0.9, 0.02); g.add(wcap);
    });

    // Ikonisk halvrundt midtparti som stikker fram mot Karl Johan (+z).
    const bayR = 0.28, bayH = h * 1.02;
    const bay = new THREE.Mesh(new THREE.CylinderGeometry(bayR, bayR, bayH, 20, 1, false, -Math.PI / 2, Math.PI), toMat(shade(c, 0.04)));
    bay.position.set(0, bayH / 2, 0.2); bay.castShadow = true; bay.receiveShadow = true; g.add(bay);
    // Høye buevinduer rundt den runde fronten.
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (Math.PI * (i + 0.5)) / 5;
      const win = box(0.05, bayH * 0.6, 0.02, winMat(c));
      win.position.set(Math.cos(a) * (bayR + 0.005), bayH * 0.5, 0.2 + Math.sin(a) * (bayR + 0.005));
      win.rotation.y = -a; g.add(win);
    }
    // Lav kuppel over det runde midtpartiet.
    const dome = new THREE.Mesh(new THREE.SphereGeometry(bayR * 0.92, 16, 9, 0, Math.PI * 2, 0, Math.PI / 2), toMat(shade(c, -0.06)));
    dome.scale.y = 0.6; dome.position.set(0, bayH, 0.2); g.add(dome);

    // Vindusrekker på fasadene til hovedkroppen.
    addWindows(g, c, { cols: 4, rows: 2, y0: h * 0.34, dy: h * 0.4, spanX: 0.34, z: 0.205, w: 0.05, wh: 0.09, rot: 0 });
    [-0.44, 0.44].forEach((x) => {
      const grp = new THREE.Group(); grp.position.x = x; g.add(grp);
      addWindows(grp, c, { cols: 2, rows: 2, y0: h * 0.34, dy: h * 0.4, spanX: 0.16, z: 0.205, w: 0.05, wh: 0.09 });
    });

    return { group: g, h: bayH + bayR * 0.6 };
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
    // Antydede figurringer på monolitten (Vigelands menneskesøyle).
    for (let i = 0; i < 5; i++) {
      const ring = cyl(0.062 - i * 0.008, 0.062 - i * 0.008, 0.012, 12, shade(0xe2d8c6, -0.08));
      ring.position.set(0, 0.2 + i * 0.15, -0.7); g.add(ring);
    }

    // Skulpturbro langs aksen – to rekker med små figur-poster (Vigelandsbroen).
    [-0.1, 0.1].forEach((x) => {
      for (let i = 0; i < 6; i++) {
        const z = 0.62 - i * 0.18;
        const plinth = box(0.04, 0.04, 0.04, shade(PAL.stone, 0.05)); plinth.position.set(x, 0.07, z); g.add(plinth);
        const fig = box(0.028, 0.1, 0.028, shade(0xcabfa8, -0.05)); fig.position.set(x, 0.14, z); g.add(fig);
      }
    });
    // Fontene på aksen mellom broen og monolitten.
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.05, 16), toMat(0x9db4bd));
    basin.position.set(0, 0.06, -0.15); basin.receiveShadow = true; g.add(basin);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 16), toMat(0xbcd2d8));
    water.position.set(0, 0.085, -0.15); g.add(water);

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
    // Ekte modell hvis registrert for dette landemerket, ellers håndmodell.
    const model = cloneModel("lm:" + entry.id);
    if (model) {
      const g0 = model.group;
      const baseY0 = entry.baseY == null ? GROUND_Y : entry.baseY;
      g0.position.set(nx2x(entry.x), baseY0, ny2z(entry.y));
      if (entry.rot) g0.rotation.y = entry.rot;
      if (entry.scale && entry.scale !== 1) g0.scale.setScalar(entry.scale);
      g0.userData = Object.assign({ landmarkId: entry.id, landmarkType: entry.type }, g0.userData || {});
      return g0;
    }
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
    // Kan kalles på nytt når ekte modeller er lastet -> fjern forrige gruppe.
    if (landmarkGroup) {
      scene.remove(landmarkGroup);
      landmarkGroup.traverse((m) => {
        if (m.geometry) m.geometry.dispose();
        if (m.material && m.material !== INVISIBLE_HIT_MAT) {
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((mm) => mm.dispose && mm.dispose());
        }
      });
      landmarkGroup = null;
    }
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
  // Små, stedstilpassede 3D-miniatyrer for faktiske places. Primitiv Three.js-
  // geometri, få mesh per miniature, ingen tekstlabels. Underordnet de
  // håndmodellerte landemerkene. Disse primitivene er nå FALLBACK i en hybrid:
  // finnes en registrert GLB-modell (assets/models/manifest.json) brukes den i
  // stedet. Hver bygger returnerer { group, h } med bunn på lokal y=0.
  //
  // Del 1 – Felles detalj-helpere. Alle legger primitive mesh i en gruppe
  // (lokal origo, bunn y=0). De holdes lette og kalles typisk bare når LOD gir
  // nok detalj. Ingen tekst – «skilt» er blanke flater (addMiniSignShape).
  function lodDetail(lod) {
    // Vis gjenkjennelig bygningsform (tak, søyler, spir, vinduer) også ved
    // standard zoom – ellers ser stedene bare ut som bokser. De detaljerte
    // modellene finnes allerede; her slås de på tidligere.
    if (lod === "veryHigh") return 3;
    if (lod === "high") return 3;
    if (lod === "mid") return 2;
    return 2; // low (standard utsnitt): full silhuett med takdetaljer/vinduer
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

  // Karakterfull takfarge: bygningstonen trukket mot en varm teglstein/skifer,
  // med litt variasjon pr. farge så takene blir polykrome (Anno/Settlers-preg)
  // i stedet for samme tone som veggen.
  const ROOF_PALETTE = [0x8a4a37, 0x7d4030, 0x9a5a3e, 0x5f5a55, 0x6a4a3a, 0x94533b];
  function roofTone(c) {
    const pick = ROOF_PALETTE[Math.abs(hashStr(String(c))) % ROOF_PALETTE.length];
    return mixHex(shade(c, -0.13), pick, 0.5);
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
    // Del 2 – butikkgård: lavt saltak med egen takfarge, baldakin, butikkvinduer.
    commerce(o) {
      const g = new THREE.Group(), c = o.color, h = 0.3, d = lodDetail(o.lod);
      g.add(box(0.42, h, 0.36, c));
      const roofC = roofTone(c);
      const roof = gableRoof(0.46, 0.11, 0.4, roofC); roof.position.y = h; g.add(roof); // lavt saltak
      if (d >= 1) {
        addAwning(g, c, { w: 0.46, d: 0.12, y: h * 0.5, z: 0.2 });
        addDoor(g, c, { z: 0.185, h: 0.12 });
        addChimney(g, c, { x: 0.14, z: -0.08, base: h + 0.06, h: 0.08, w: 0.04 });
      }
      if (d >= 2) {
        addWindows(g, c, { cols: 3, y0: h * 0.32, z: 0.185, spanX: 0.3, w: 0.06, wh: 0.07 });
        addMiniSignShape(g, c, { x: 0, z: 0.22, h: 0.12, w: 0.16, ph: 0.05 });
      }
      return { group: g, h: h + 0.11 };
    },
    // Del 2 – boligblokk: saltak med egen (varm) takfarge, pipe, dør, vindusrytme.
    apartment(o) {
      const g = new THREE.Group(), c = o.color, h = 0.5, d = lodDetail(o.lod);
      g.add(box(0.42, h, 0.42, c));
      const roofC = roofTone(c);
      const roof = gableRoof(0.47, 0.17, 0.47, roofC); roof.position.y = h; g.add(roof); // saltak
      if (d >= 1) {
        addChimney(g, c, { x: 0.12, z: -0.1, base: h + 0.04, h: 0.12, w: 0.045 });
        addDoor(g, c, { z: 0.215, h: 0.13 });
      }
      if (d >= 2) {
        addWindows(g, c, { cols: 2, rows: 2, y0: 0.16, dy: 0.16, z: 0.215, spanX: 0.22, w: 0.06, wh: 0.07 });
        const gableWin = box(0.05, 0.05, 0.02, mixHex(0xdfe8ef, c, 0.2)); gableWin.position.set(0, h + 0.07, 0.235); g.add(gableWin); // gavlvindu
      }
      return { group: g, h: h + 0.17 };
    },
    // Del 2 – generisk lite hus: saltak med egen takfarge, pipe, dør, vinduer.
    default(o) {
      const g = new THREE.Group(), c = o.color, h = 0.32, d = lodDetail(o.lod);
      g.add(box(0.38, h, 0.38, c));
      const roofC = roofTone(c);
      const roof = gableRoof(0.42, 0.14, 0.42, roofC); roof.position.y = h; g.add(roof); // saltak
      if (d >= 1) {
        addChimney(g, c, { x: 0.1, z: -0.08, base: h + 0.03, h: 0.09, w: 0.04 });
        addDoor(g, c, { z: 0.195, h: 0.12 });
      }
      if (d >= 2) addWindows(g, c, { cols: 2, y0: h * 0.5, z: 0.195, spanX: 0.18, w: 0.05 });
      return { group: g, h: h + 0.14 };
    }
  };

  // Del 4 – Type-resolver for places. Prioritert: civiMap.assetType -> mapAssetType
  // -> kategori/quiz_profile-nøkkelord -> id/navn-heuristikk -> default.
  function resolvePlaceMiniatureType(p) {
    const cm = p.civiMap || {};

    // Felles designCode-system (Del 6). Prøv den delte resolveren først hvis den
    // er lastet; bruk renderHints.threeType når den finnes i type-katalogen.
    // Kartet er aldri avhengig av at js/visualDesignCodes.js er lastet – uten
    // resolveren faller vi tilbake til den eksisterende logikken nedenfor.
    try {
      const reg = (typeof window !== "undefined") && window.HGVisualDesignCodes;
      if (reg && typeof reg.resolveForPlace === "function") {
        const r = reg.resolveForPlace(p.raw || p);
        const threeType = r && r.entry && r.entry.renderHints && r.entry.renderHints.threeType;
        if (threeType && PLACE_MINIATURE_TYPES[threeType]) return threeType;
      }
    } catch (e) { /* fall through to legacy resolver */ }

    const explicit = String(cm.assetType || (p.raw && p.raw.mapAssetType) || "").trim().toLowerCase();
    if (explicit && PLACE_MINIATURE_TYPES[explicit]) return explicit;

    const cat = String(p.category || "").toLowerCase();
    const qp = (p.raw && p.raw.quiz_profile) || {};
    const ptype = String(qp.place_type || "").toLowerCase();
    const subtype = String(qp.subtype || "").toLowerCase();
    const hay = `${p.id || ""} ${p.name || ""} ${ptype} ${subtype}`.toLowerCase();

    // Sterke nøkkelord på tvers av kategorier. NB: bare «skøyte» er for vidt –
    // det treffer friidrettsstadioner med skøytehistorie (f.eks. Bislett), så
    // ishall krever mer spesifikke termer.
    if (/ishall|ishockey|isbane|kunstisbane|skøytehall|skoytehall|amfi/.test(hay)) return "ice_arena";
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
  // ---------------------------------------------------------------------------
  // Hybrid: ekte GLB-modeller (assets/models/) med primitiv-fallback.
  // Modell-registeret (assets/models/manifest.json) mapper byggtype/landemerke-id
  // til .glb-filer. Registrerte bygg bruker den ekte modellen; alt annet bruker
  // de innebygde primitiv-modellene. Se assets/models/README.md.
  // ---------------------------------------------------------------------------
  function normalizeModelScene(scene, targetSize, cfg) {
    const bbox = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3(); bbox.getSize(size);
    const center = new THREE.Vector3(); bbox.getCenter(center);
    const maxXZ = Math.max(size.x, size.z) || 1;
    const s = (targetSize / maxXZ) * ((cfg && cfg.scale) || 1);
    scene.scale.setScalar(s);
    scene.position.set(-center.x * s, -bbox.min.y * s, -center.z * s);
    if (cfg && cfg.yOffset) scene.position.y += cfg.yOffset;
    scene.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    const wrap = new THREE.Group();
    if (cfg && cfg.rotationY) wrap.rotation.y = cfg.rotationY;
    wrap.add(scene);
    return { wrap, h: size.y * s };
  }
  async function loadBuildingModels() {
    if (_modelsRequested) return;
    _modelsRequested = true;
    let manifest;
    try {
      const res = await fetch("assets/models/manifest.json", { cache: "no-cache" });
      if (!res.ok) return;
      manifest = await res.json();
    } catch (e) { return; } // ingen manifest -> full fallback
    const types = (manifest && manifest.buildingTypes) || {};
    const lms = (manifest && manifest.landmarks) || {};
    // Hver oppføring kan være en fil (streng), et objekt {file,scale,...}, eller
    // en liste av slike (for variasjon – ett tilfeldig valg pr. sted).
    const jobs = [];
    const register = (key, def, size) => {
      const list = Array.isArray(def) ? def : [def];
      list.forEach((d) => {
        const cfg = typeof d === "string" ? { file: d } : (d || {});
        if (cfg.file) jobs.push({ key, cfg, size });
      });
    };
    Object.keys(types).forEach((t) => register("mini:" + t, types[t], 0.5));
    Object.keys(lms).forEach((id) => register("lm:" + id, lms[id], 1.2));
    const scenery = (manifest && manifest.scenery) || [];
    if (!jobs.length && !scenery.length) return; // tomt register -> full fallback
    let GLTFLoader;
    try { GLTFLoader = (await import(/* @vite-ignore */ "three/addons/loaders/GLTFLoader.js")).GLTFLoader; }
    catch (e) { console.warn("[CivicationThreeMap] GLTFLoader utilgjengelig – beholder primitiv-modeller:", (e && e.message) || e); return; }
    const loader = new GLTFLoader();
    let loaded = 0, hadLm = false;
    await Promise.all(jobs.map((job) => new Promise((resolve) => {
      loader.load("assets/models/" + job.cfg.file, (gltf) => {
        try {
          const norm = normalizeModelScene(gltf.scene, job.size, job.cfg);
          (_modelCache[job.key] || (_modelCache[job.key] = [])).push(norm);
          loaded++; if (job.key.startsWith("lm:")) hadLm = true;
        } catch (e) { /* hopp over defekt modell */ }
        resolve();
      }, undefined, () => resolve()); // fil mangler/feiler -> fallback
    })));
    if (loaded > 0) {
      if (hadLm) buildLandmarks();
      rebuildPlaces();
      dirty = true;
    }
    // Scenery – faste dekor-modeller på faste posisjoner (f.eks. båter i fjorden).
    if (scenery.length) {
      const sg = new THREE.Group();
      await Promise.all(scenery.map((sc) => new Promise((resolve) => {
        if (!sc || !sc.file) return resolve();
        loader.load("assets/models/" + sc.file, (gltf) => {
          try {
            const norm = normalizeModelScene(gltf.scene, sc.size || 0.4, sc);
            norm.wrap.position.set(nx2x(sc.x || 0.5), sc.baseY != null ? sc.baseY : (WATER_Y + 0.02), ny2z(sc.y || 0.85));
            sg.add(norm.wrap);
          } catch (e) { /* hopp over */ }
          resolve();
        }, undefined, () => resolve());
      })));
      if (sg.children.length) { scene.add(sg); dirty = true; }
    }
  }
  function cloneModel(key, seed) {
    const list = _modelCache[key];
    if (!list || !list.length) return null;
    const m = list.length === 1 ? list[0] : list[Math.abs(hashStr(String(seed || key))) % list.length];
    return { group: m.wrap.clone(true), h: m.h };
  }

  function buildPlaceMiniature(p, opts) {
    const type = (opts && opts.type) || resolvePlaceMiniatureType(p);
    const lod = (opts && opts.lod) || _lastLod || "high";
    const scale = (opts && opts.scale) || 0.4;
    // Ekte modell hvis registrert, ellers primitiv-fallback.
    let group, h;
    const model = cloneModel("mini:" + type, p.id);
    if (model) { group = model.group; h = model.h; }
    else {
      const color = placeColorFor(p, type);
      const make = PLACE_MINIATURE_TYPES[type] || PLACE_MINIATURE_TYPES.default;
      const built = make({ color, lod });
      group = built.group; h = built.h;
    }
    group.scale.setScalar(scale);
    group.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.userData = { placeId: p.id }; } });
    group.userData = { placeId: p.id, miniatureType: type, h };
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

  // Er punktet på faktisk land (innenfor kystlinja eller på Ekeberg-massen)?
  function isOnLand(nx, ny) {
    const ekeR = (window.CIVI_OSLO_LANDSCAPE || {}).ekebergRidge;
    return pointInPoly(nx, ny, LAND_COAST) || (ekeR && pointInPoly(nx, ny, ekeR));
  }
  // Nærmeste punkt på en polylinje + avstand (normaliserte koordinater).
  function nearestOnPolyline(x, y, poly) {
    let best = { dist: Infinity, cx: x, cy: y };
    for (let i = 0; i < poly.length - 1; i++) {
      const ax = poly[i][0], ay = poly[i][1], bx = poly[i + 1][0], by = poly[i + 1][1];
      const dx = bx - ax, dy = by - ay, len2 = dx * dx + dy * dy || 1e-9;
      let t = ((x - ax) * dx + (y - ay) * dy) / len2; t = Math.max(0, Math.min(1, t));
      const cx = ax + t * dx, cy = ay + t * dy;
      const dd = Math.hypot(x - cx, y - cy);
      if (dd < best.dist) best = { dist: dd, cx, cy };
    }
    return best;
  }
  // Skyv et punkt ut av vann: bort fra Akerselva, og tilbake på land om det
  // havnet i fjorden. Gjør at stedene aldri legger seg midt i elva/vannet.
  function avoidWater(nx, ny) {
    let x = nx, y = ny;
    const river = (window.CIVI_OSLO_LANDSCAPE || {}).akerselva;
    if (river && river.length > 1) {
      const near = nearestOnPolyline(x, y, river);
      const margin = 0.025;
      if (near.dist < margin) {
        const len = near.dist || 1e-4;
        x = clamp(near.cx + ((x - near.cx) / len) * margin, 0.03, 0.97);
        y = clamp(near.cy + ((y - near.cy) / len) * margin, 0.04, 0.96);
      }
    }
    if (!isOnLand(x, y)) {
      for (let s = 0; s < 10; s++) {
        x = clamp(x + (0.5 - x) * 0.14, 0.03, 0.97);
        y = clamp(y + (0.6 - y) * 0.14, 0.04, 0.96);
        if (isOnLand(x, y)) break;
      }
    }
    return { x, y };
  }
  // Stabil layout: nudge beregnes ÉN gang over HELE kandidatsettet med fast
  // separasjon (uavhengig av zoom) og vann-unngåelse, og bufres pr. place-id.
  // Da flytter ikke stedene seg når man zoomer, og de havner aldri i Akerselva.
  function computeStablePlaceLayout(scored) {
    const pos = {};
    const placed = [];
    const SEP = 0.03;
    for (let i = 0; i < scored.length; i++) {
      const avoided = avoidLandmarkMarkerPosition(scored[i].proj);
      let nx = avoided.x, ny = avoided.y;
      for (let attempt = 0; attempt < 8; attempt++) {
        let hitQ = null, md = Infinity;
        for (let j = 0; j < placed.length; j++) {
          const q = placed[j];
          const dd = Math.hypot(nx - q.x, ny - q.y);
          if (dd < SEP && dd < md) { md = dd; hitQ = q; }
        }
        if (!hitQ) break;
        const dx = nx - hitQ.x, dy = ny - hitQ.y, len = Math.hypot(dx, dy) || 1;
        const push = (SEP - md) + 0.004;
        nx = clamp(nx + (dx / len) * push, 0.03, 0.97);
        ny = clamp(ny + (dy / len) * push, 0.04, 0.96);
      }
      const w = avoidWater(nx, ny);
      placed.push({ x: w.x, y: w.y });
      pos[scored[i].p.id] = { x: w.x, y: w.y };
    }
    return pos;
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
    _stats.groundhopperMarkers = 0;
    // Kick read-modellen (memoisert); når den er klar, tegnes stedene på nytt
    // slik at Groundhopper-ringene kommer på.
    ensureCityMapLoaded();
    if (!_places) { _stats.placeMarkers = 0; _stats.visiblePlaceMiniatures = 0; return; }

    const lod = placeLodLevel(zoom);
    _lastLod = lod;
    _stats.placeLodLevel = lod;
    if (camera) camera.updateMatrixWorld();

    // Del 2 – skill ut places som tilsvarer håndmodellerte landemerker; de får
    // ingen ekstra generisk marker. Flere places kan matche samme landemerke
    // (duplikater/aliaser) – dedupeLandmarkPlaces velger ÉT kanonisk sted per
    // landemerke (eksakt treff foran delstreng) som klikkbart via en usynlig
    // hit target ved modellen.
    const dedup = dedupeLandmarkPlaces(_places);
    const byLandmark = dedup.byLandmark;
    const candidates = dedup.candidates;

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
      if (isGroundhopperPlace(place.id)) {
        const ring = buildGroundhopperRing(1.0);
        ring.position.set(nx2x(e.x), baseY + 0.02, ny2z(e.y));
        ring.userData.groundhopperPlaceId = place.id;
        placeGroup.add(ring);
        _stats.groundhopperMarkers += 1;
      }
    });
    _stats.hiddenDuplicateLandmarkPlaces = dedup.hiddenCount;

    // Del 6 – prioriter og projiser; Del 5 – LOD-grense + frustum-culling.
    const scored = [];
    candidates.forEach((p) => {
      const proj = project(p);
      if (!proj) return;
      scored.push({ p, proj, prio: priorityOfPlace(p) });
    });
    scored.sort((a, b) => b.prio - a.prio);

    // Stabil, zoom-uavhengig layout (nudge + vann-unngåelse beregnet ÉN gang).
    if (!_stablePos) _stablePos = computeStablePlaceLayout(scored);

    const limit = PLACE_LOD_LIMITS[lod] || 26;
    const cull = (lod === "high" || lod === "veryHigh");
    let drawn = 0;

    for (let i = 0; i < scored.length && drawn < limit; i++) {
      const entry = scored[i];
      // Posisjonen er fast pr. place-id -> stedene flytter seg ALDRI ved zoom,
      // og ligger aldri i Akerselva/vannet.
      const cached = _stablePos[entry.p.id] || { x: entry.proj.x, y: entry.proj.y };
      const nx = cached.x, ny = cached.y;
      if (cull && !inCameraView(nx, ny)) { _stats.culledPlaces++; continue; }
      const scale = placeScaleFor(lod, nx, ny);
      const nudged = Math.hypot(nx - entry.proj.x, ny - entry.proj.y) > 0.001;
      if (nudged) _stats.nudgedPlaces++;

      const type = resolvePlaceMiniatureType(entry.p);
      const node = buildPlaceMiniature(entry.p, { type, scale, lod });
      node.position.set(nx2x(nx), GROUND_Y, ny2z(ny));
      placeGroup.add(node);

      // Groundhopper-relevante steder får en flat markeringsring under miniatyren.
      const groundhopper = isGroundhopperPlace(entry.p.id);
      if (groundhopper) {
        const ring = buildGroundhopperRing(scale);
        ring.position.y = 0.02;
        node.add(ring);
        node.userData.groundhopperRelevant = true;
        _stats.groundhopperMarkers += 1;
      }

      // Del 12 – mesh-budsjett-statistikk per miniatyr.
      let meshCount = 0;
      node.traverse((m) => { if (m.isMesh) meshCount++; });
      _stats.miniatureMeshTotal += meshCount;
      if (meshCount >= 6) _stats.detailedMiniatures++; else _stats.lowDetailMiniatures++;

      hitTargets.push({ id: entry.p.id, place: entry.p, type, viaLandmark: false });
      _visibleMiniatures.push({ id: entry.p.id, name: entry.p.name, type, priority: entry.prio, x: Number(nx.toFixed(4)), y: Number(ny.toFixed(4)), nudged, groundhopper });
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
    // Del B: zoom/pan/resize gikk alle gjennom updateCamera -> varsle kartlag
    // (CivicationCityLayer) så HTML-markører kan re-projiseres mot 3D-kameraet.
    scheduleTransformEmit();
  }

  // ---------------------------------------------------------------------------
  // Del A – stabilt projeksjons-API (speiler CivicationCanvasMap der relevant)
  // ---------------------------------------------------------------------------
  // Lar andre kartlag (f.eks. CivicationCityLayer) projisere normaliserte
  // Civication world-koordinater (0–1) til skjermpiksler via NØYAKTIG samme
  // kamera/zoom/pan/resize-state som 3D-kartet selv tegner med. Rent lese-API –
  // endrer ikke rendering. Returnerer null når 3D ikke er aktivt eller punktet
  // ikke kan projiseres trygt (gjetter aldri).

  function getTransformState() {
    return { zoom, panX, panZ, width: W, height: H };
  }

  function getViewportSize() {
    return { width: W, height: H };
  }

  // Normalisert Civication world-koordinat (0–1) -> skjermpiksel relativt til
  // #civiMapWorld / renderer. Bruker 3D-kameraets projeksjon (vector.project).
  function projectWorldToScreen(nx, ny) {
    if (!active) return null;
    if (!THREE || !camera || !renderer) return null;
    if (!W || !H) return null;
    const x = Number(nx), y = Number(ny);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

    // Civication-normalisert -> Three world (XZ-bakkeplan), litt over bakken.
    const worldX = nx2x(x);
    const worldZ = ny2z(y);
    const worldY = GROUND_Y + 0.08;

    let v;
    try {
      v = new THREE.Vector3(worldX, worldY, worldZ);
      v.project(camera);
    } catch (_e) {
      return null;
    }
    if (!v || !Number.isFinite(v.x) || !Number.isFinite(v.y)) return null;
    // Utenfor trygt NDC-dybdespenn (bak kamera / klippet) -> ikke projiser.
    if (Number.isFinite(v.z) && Math.abs(v.z) > 1.5) return null;

    const screenX = (v.x + 1) / 2 * W;
    const screenY = (-v.y + 1) / 2 * H;
    if (!Number.isFinite(screenX) || !Number.isFinite(screenY)) return null;
    return { x: screenX, y: screenY };
  }

  // World-koordinatene er allerede normaliserte 0–1, så normalisert == world.
  const projectNormalizedToScreen = projectWorldToScreen;

  // ---------------------------------------------------------------------------
  // Del B – transform-event (zoom/pan/resize) med rAF-coalescing
  // ---------------------------------------------------------------------------
  const transformListeners = new Set();
  let transformEmitQueued = false;

  function onTransformChanged(callback) {
    if (typeof callback === "function") transformListeners.add(callback);
  }
  function offTransformChanged(callback) {
    transformListeners.delete(callback);
  }

  function notifyTransformChanged() {
    const detail = getTransformState();
    transformListeners.forEach((cb) => { try { cb(detail); } catch (_e) { /* lytter feilet */ } });
    try {
      window.dispatchEvent(new CustomEvent("civi:threeMapTransformChanged", { detail }));
    } catch (_e) { /* CustomEvent utilgjengelig */ }
  }
  function scheduleTransformEmit() {
    if (transformEmitQueued) return;
    transformEmitQueued = true;
    requestAnimationFrame(() => { transformEmitQueued = false; notifyTransformChanged(); });
  }

  // Kun for headless tester: injiser kamera/THREE/viewport/aktiv-state uten
  // WebGL, slik at projeksjons-API-et og transform-eventet kan dekkes i node.
  function setStateForTesting(s) {
    const o = s && typeof s === "object" ? s : {};
    if (o.THREE) THREE = o.THREE;
    if (o.camera) camera = o.camera;
    if (o.renderer) renderer = o.renderer;
    if (Number.isFinite(o.W)) W = o.W;
    if (Number.isFinite(o.H)) H = o.H;
    if (Number.isFinite(o.zoom)) zoom = o.zoom;
    if (Number.isFinite(o.panX)) panX = o.panX;
    if (Number.isFinite(o.panZ)) panZ = o.panZ;
    if (typeof o.active === "boolean") active = o.active;
    return getTransformState();
  }

  function resize() {
    if (!host || !renderer) return;
    const rect = host.getBoundingClientRect();
    W = Math.max(1, Math.round(rect.width) || window.innerWidth || 960);
    H = Math.max(1, Math.round(rect.height) || window.innerHeight || 640);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.setSize(W, H, false);
    resizePost();
    updateCamera();
  }

  // Kvalitetsnivå: eksplisitt window.CIVICATION_MAP_QUALITY ("high"/"low"/"off")
  // vinner; ellers på som standard, men av på små/lavytelses-enheter.
  function decidePostEnabled() {
    const q = String((typeof window !== "undefined" && window.CIVICATION_MAP_QUALITY) || "").toLowerCase();
    if (q === "high") return true;
    if (q === "low" || q === "off" || q === "none") return false;
    const cores = (typeof navigator !== "undefined" && navigator.hardwareConcurrency) || 8;
    const minSide = Math.min(W || 0, H || 0);
    if (cores <= 4 && minSide < 520) return false; // konservativt for svake mobiler
    return true;
  }

  async function loadPostAddons() {
    try {
      const base = "three/addons/postprocessing/";
      const [ec, rp, sp, ssao, smaa, op] = await Promise.all([
        import(/* @vite-ignore */ base + "EffectComposer.js"),
        import(/* @vite-ignore */ base + "RenderPass.js"),
        import(/* @vite-ignore */ base + "ShaderPass.js"),
        import(/* @vite-ignore */ base + "SSAOPass.js"),
        import(/* @vite-ignore */ base + "SMAAPass.js"),
        import(/* @vite-ignore */ base + "OutputPass.js")
      ]);
      return {
        EffectComposer: ec.EffectComposer, RenderPass: rp.RenderPass, ShaderPass: sp.ShaderPass,
        SSAOPass: ssao.SSAOPass, SMAAPass: smaa.SMAAPass, OutputPass: op.OutputPass
      };
    } catch (e) {
      console.warn("[CivicationThreeMap] post-addons utilgjengelig – kjører uten post:", (e && e.message) || e);
      return null;
    }
  }

  const POST_VERT = [
    "varying vec2 vUv;",
    "void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }"
  ].join("\n");

  // Tilt-shift-pass (kjører SIST, etter OutputPass, altså på ferdig sRGB): skarpt
  // bånd rundt uFocusCenter, økende blur mot topp/bunn – signatur-«miniatyrmodell»-
  // looken. Pluss vignett og en varm grade/kontrast. Ingen sRGB-encode her
  // (inputen er allerede sRGB fra OutputPass).
  const POST_FRAG = [
    "precision highp float;",
    "uniform sampler2D tDiffuse;",
    "uniform vec2 uResolution;",
    "uniform float uMaxBlur, uFocusCenter, uFocusHeight, uFalloff, uVignette, uGrade;",
    "varying vec2 vUv;",
    "void main(){",
    "  float d = abs(vUv.y - uFocusCenter);",
    "  float blur = smoothstep(uFocusHeight, uFocusHeight + uFalloff, d) * uMaxBlur;",
    "  vec2 px = 1.0 / uResolution;",
    "  vec3 acc = texture2D(tDiffuse, vUv).rgb;",
    "  float wsum = 1.0;",
    "  if (blur > 0.001) {",
    "    for (int i = 0; i < 12; i++) {",
    "      float a = float(i) * 0.5235987756;",           // 30° steg
    "      float r = (mod(float(i), 2.0) < 0.5) ? 1.0 : 0.55;", // to radier -> disk-aktig
    "      vec2 o = vec2(cos(a), sin(a)) * blur * r;",
    "      acc += texture2D(tDiffuse, vUv + o * px).rgb;",
    "      wsum += 1.0;",
    "    }",
    "    acc /= wsum;",
    "  }",
    "  vec2 q = vUv - 0.5;",
    "  float vig = 1.0 - uVignette * dot(q, q) * 1.6;",
    "  vec3 col = acc * vig;",
    "  col = mix(col, col * vec3(1.03, 1.0, 0.96), uGrade);", // varm tone
    "  col = (col - 0.5) * 1.04 + 0.5;",                       // lett kontrast
    "  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);",
    "}"
  ].join("\n");

  function drawingBufferSize() {
    const v = new THREE.Vector2();
    if (renderer && typeof renderer.getDrawingBufferSize === "function") renderer.getDrawingBufferSize(v);
    if (!(v.x > 0 && v.y > 0)) v.set(Math.max(1, W), Math.max(1, H));
    v.set(Math.max(1, Math.round(v.x)), Math.max(1, Math.round(v.y)));
    return v;
  }

  // EffectComposer-kjede: RenderPass → SSAO (kontaktskygger) → SMAA (kanter) →
  // OutputPass (tonemap+sRGB) → tilt-shift/vignett (til skjerm). Selvstendig
  // vendret three + addons (import map), ingen CDN.
  function buildPostPipeline() {
    _postEnabled = false;
    _composer = _ssaoPass = _smaaPass = _tiltPass = null;
    if (!renderer || !THREE || !ADDONS) return;
    if (!decidePostEnabled()) return;
    try {
      const sz = drawingBufferSize();
      const w = sz.x, h = sz.y;
      const rt = new THREE.WebGLRenderTarget(w, h, {
        type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter
      });
      _composer = new ADDONS.EffectComposer(renderer, rt);
      _composer.setPixelRatio(1);          // vi mater allerede inn drawingBuffer-størrelse
      _composer.setSize(w, h);
      _composer.addPass(new ADDONS.RenderPass(scene, camera));

      _ssaoPass = new ADDONS.SSAOPass(scene, camera, w, h);
      _ssaoPass.kernelRadius = 8;
      _ssaoPass.minDistance = 0.0015;
      _ssaoPass.maxDistance = 0.06;
      _composer.addPass(_ssaoPass);

      _smaaPass = new ADDONS.SMAAPass(w, h);
      _composer.addPass(_smaaPass);

      _composer.addPass(new ADDONS.OutputPass());

      _tiltPass = new ADDONS.ShaderPass({
        uniforms: {
          tDiffuse: { value: null },
          uResolution: { value: new THREE.Vector2(w, h) },
          uMaxBlur: { value: 3.4 },
          uFocusCenter: { value: 0.46 },
          uFocusHeight: { value: 0.13 },
          uFalloff: { value: 0.32 },
          uVignette: { value: 0.34 },
          uGrade: { value: 0.6 }
        },
        vertexShader: POST_VERT,
        fragmentShader: POST_FRAG
      });
      _composer.addPass(_tiltPass);        // sist → renderToScreen

      _postEnabled = true;
    } catch (e) {
      console.warn("[CivicationThreeMap] post-pipeline av (feil ved oppsett):", (e && e.message) || e);
      _postEnabled = false;
      _composer = _ssaoPass = _smaaPass = _tiltPass = null;
    }
  }

  function resizePost() {
    if (!_postEnabled || !_composer) return;
    const sz = drawingBufferSize();
    _composer.setSize(sz.x, sz.y);         // oppdaterer alle passenes targets
    if (_tiltPass) _tiltPass.uniforms.uResolution.value.set(sz.x, sz.y);
  }

  function loop() {
    rafId = requestAnimationFrame(loop);
    if (!active || !dirty) return;
    dirty = false;
    if (_postEnabled && _composer) {
      _composer.render();
    } else {
      renderer.render(scene, camera);
    }
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
    const place = (_places || []).find((candidate) => String(candidate && candidate.id) === String(placeId));
    const menu = window.CivicationHistoryGoPlaceLayer;
    if (menu && typeof menu.openPlaceMenu === "function") {
      menu.openPlaceMenu(place || placeId);
      return;
    }
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

    // Hoved-three via import map ("three"), med lokal absolutt URL og CDN som
    // fallback. Addonene (under) MÅ dele instans, så de bruker samme "three"-map.
    try {
      THREE = await import(/* @vite-ignore */ "three");
    } catch (eMap) {
      try {
        THREE = await import(/* @vite-ignore */ THREE_LOCAL_URL);
      } catch (eLocal) {
        console.warn("[CivicationThreeMap] lokal three.js feilet, prøver CDN:", (eLocal && eLocal.message) || eLocal);
        try {
          THREE = await import(/* @vite-ignore */ THREE_CDN_URL);
        } catch (e) {
          console.warn("[CivicationThreeMap] Klarte ikke laste three.js – beholder Canvas-kartet:", (e && e.message) || e);
          return;
        }
      }
    }

    // Postprosesserings-addons (deler three-instans via import map). Feiler stille
    // til null → kartet kjører uten post-prosessering (fail-safe).
    ADDONS = await loadPostAddons();

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.domElement.className = "civi-three-canvas";
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    host.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(PAL.background);
    scene.fog = new THREE.Fog(PAL.background, 62, 130); // mindre tåke -> klarere terreng/bygg i dybden
    camera = new THREE.OrthographicCamera(-VIEW, VIEW, VIEW, -VIEW, 0.1, 200);
    raycaster = new THREE.Raycaster();
    // Delt, usynlig (men raycastbar) material for landmark-hit targets.
    INVISIBLE_HIT_MAT = new THREE.MeshBasicMaterial({ visible: false });

    buildEnvironment();
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

    buildPostPipeline();
    ensureControls();
    bindEvents();
    resize();
    ensureLoaded();
    loadBuildingModels(); // hybrid: last ekte GLB-modeller om registrert (fallback ellers)
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
      groundhopperMarkers: _stats.groundhopperMarkers || 0,
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
    // Del A/B – stabilt projeksjons- og transform-API (speiler CanvasMap).
    projectWorldToScreen,
    projectNormalizedToScreen,
    getTransformState,
    getViewportSize,
    onTransformChanged,
    offTransformChanged,
    setStateForTesting,
    getHitTargets: () => hitTargets.slice(),
    getProjectionDebug,
    getSceneStats,
    getDistrictVisualProfiles,
    getLandmarkPositions,
    getVisiblePlaceMiniatures: () => _visibleMiniatures.map((m) => Object.assign({}, m)),
    getPlaceMiniatureTypeStats: () => Object.assign({}, _stats.placeMiniatureTypes),
    // Groundhopper-relevante steder som faktisk er tegnet (miniatyr eller landemerke).
    getGroundhopperMarkerCount: () => _stats.groundhopperMarkers || 0,
    isGroundhopperPlace,
    buildGroundhopperRing,
    // Post-prosessering (tilt-shift/vignett/grade) – status for test/introspeksjon.
    isPostEnabled: () => _postEnabled === true,
    // Rene introspeksjons-/testfunksjoner (uten scene/DOM) – speiler nøyaktig
    // logikken renderen bruker, så de kan dekkes av node-tester og dev-konsoll.
    resolvePlaceMiniatureType: (place) => resolvePlaceMiniatureType(normalize(place)),
    matchLandmarkForPlace: (place) => matchLandmarkForPlace(normalize(place)),
    priorityOfPlace: (place) => priorityOfPlace(normalize(place)),
    placeLodLevel,
    getPlaceMiniatureTypeKeys: () => Object.keys(PLACE_MINIATURE_TYPES),
    getPlaceLodLimits: () => Object.assign({}, PLACE_LOD_LIMITS),
    getHandModeledPlaceAliases: () => JSON.parse(JSON.stringify(HAND_MODELED_PLACE_ALIASES)),
    getLandmarkDedup: (list) => {
      const r = dedupeLandmarkPlaces((list || []).map(normalize));
      const canonical = {};
      Object.keys(r.byLandmark).forEach((k) => { canonical[k] = r.byLandmark[k].place.id; });
      return { canonical, hiddenCount: r.hiddenCount, candidateCount: r.candidates.length };
    }
  };
})();
