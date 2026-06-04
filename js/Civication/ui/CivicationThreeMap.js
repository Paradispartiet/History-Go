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

  // Terreng-/byhøyder (verdensenheter).
  const GROUND_Y = 0.10;     // topp av bydels-slab; bygg/trær står her
  const MARKA_H = 0.75;      // Marka-platået i nord
  const EKEBERG_H = 0.55;    // Ekebergåsen i sørøst
  const MAX_BUILDINGS = 1200;
  const MAX_TREES = 520;

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
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
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

  // Liten boks-bygning på normalisert posisjon (verdensenheter for w/h/d).
  function addBox(group, nx, ny, w, h, d, color, baseY, rotY) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
    mesh.position.set(nx2x(nx), (baseY == null ? GROUND_Y : baseY) + h / 2, ny2z(ny));
    if (rotY) mesh.rotation.y = rotY;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return mesh;
  }

  function buildBoard() {
    // Hevet brett / «modellplate» med en liten sokkel.
    const board = new THREE.Mesh(new THREE.BoxGeometry(MAP_W + 3, 1.0, MAP_D + 3), mat(0x0f1319));
    board.position.y = -0.55;
    board.receiveShadow = true;
    scene.add(board);

    // Fjordvann – Phong gir en svak «våt» glans.
    const water = new THREE.Mesh(
      new THREE.PlaneGeometry(MAP_W + 3, MAP_D + 3),
      new THREE.MeshPhongMaterial({ color: 0x245579, shininess: 60, specular: 0x335a78 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.0;
    water.receiveShadow = true;
    scene.add(water);
  }

  function buildLandscape() {
    const land = window.CIVI_OSLO_LANDSCAPE || {};
    // Marka som hevet skogsplatå i nord, Ekeberg som ås i sørøst.
    if (land.markaNorth) scene.add(extrudeShape(land.markaNorth, MARKA_H, 0x2f5238, 0));
    if (land.ekebergRidge) scene.add(extrudeShape(land.ekebergRidge, EKEBERG_H, 0x3f6347, 0));
    if (land.cityBasin) scene.add(extrudeShape(land.cityBasin, 0.05, 0x223040, 0));

    // Bygdøy-halvøy.
    const BYGDOY = [[0.13,0.65],[0.27,0.62],[0.34,0.66],[0.33,0.74],[0.25,0.79],[0.16,0.77],[0.10,0.70]];
    scene.add(extrudeShape(BYGDOY, 0.2, 0x3f6b46, 0));

    // Øyer i fjorden som små grønne kuler.
    const islands = [[0.465,0.760,0.55],[0.415,0.800,0.42],[0.520,0.815,0.5],[0.395,0.745,0.36]];
    islands.forEach(([nx, ny, r]) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x4f7a52));
      m.position.set(nx2x(nx), 0.02, ny2z(ny));
      m.scale.y = 0.5;
      m.castShadow = true; m.receiveShadow = true;
      scene.add(m);
    });

    // Tynne bydels-slabs som farget grunn.
    (window.CIVI_MAP_DISTRICTS || []).forEach((d) => {
      const fill = (d.style && d.style.fill) || "#cabda9";
      const slab = extrudeShape(d.shape, GROUND_Y, new THREE.Color(fill).getHex(), 0);
      scene.add(slab);
    });
  }

  function buildLights() {
    scene.add(new THREE.HemisphereLight(0xcfe2f2, 0x33402f, 0.85));
    const sun = new THREE.DirectionalLight(0xfff2e0, 1.45);
    sun.position.set(-16, 26, 12); // konsekvent lys oppe-til-venstre
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -18; sc.right = 18; sc.top = 18; sc.bottom = -18; sc.near = 1; sc.far = 80;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.6;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xbcd0e6, 0.35);
    fill.position.set(12, 10, -10);
    scene.add(fill);
  }

  // Høyde-/bredde-område per bydel for det prosedyrale bybildet.
  function districtBuildProfile(id) {
    switch (id) {
      case "sentrum": return { hMin: 0.8, hMax: 2.7, fw: 0.22, dens: 0.9 };
      case "gamle_oslo": return { hMin: 0.6, hMax: 2.0, fw: 0.24, dens: 0.78 };
      case "grunerlokka": return { hMin: 0.5, hMax: 1.0, fw: 0.2, dens: 0.85 };
      case "st_hanshaugen": return { hMin: 0.5, hMax: 1.0, fw: 0.2, dens: 0.78 };
      case "sagene": return { hMin: 0.45, hMax: 0.95, fw: 0.2, dens: 0.78 };
      case "frogner": return { hMin: 0.4, hMax: 0.9, fw: 0.24, dens: 0.6 };
      case "ullern": return { hMin: 0.35, hMax: 0.8, fw: 0.24, dens: 0.5 };
      case "alna": return { hMin: 0.4, hMax: 1.0, fw: 0.4, dens: 0.55 };
      case "nordstrand": return { hMin: 0.3, hMax: 0.65, fw: 0.24, dens: 0.45 };
      case "stovner": return { hMin: 0.3, hMax: 0.7, fw: 0.26, dens: 0.45 };
      default: return { hMin: 0.4, hMax: 0.9, fw: 0.22, dens: 0.6 };
    }
  }

  // Teppe av småbygg inni hver bydel – instansert for ytelse.
  function buildCity() {
    const rng = mulberry32(20240601);
    const inst = [];
    (window.CIVI_MAP_DISTRICTS || []).forEach((d) => {
      const poly = d.shape;
      if (!poly || !poly.length) return;
      const bb = polyBBox(poly);
      const prof = districtBuildProfile(d.id);
      const step = 0.0135;
      for (let gy = bb.minY; gy <= bb.maxY; gy += step) {
        for (let gx = bb.minX; gx <= bb.maxX; gx += step) {
          if (rng() > prof.dens) continue;
          const jx = gx + (rng() - 0.5) * step * 0.7;
          const jy = gy + (rng() - 0.5) * step * 0.7;
          if (!pointInPoly(jx, jy, poly)) continue;
          const h = prof.hMin + rng() * (prof.hMax - prof.hMin);
          const fw = prof.fw * (0.7 + rng() * 0.6);
          const fd = prof.fw * (0.7 + rng() * 0.6);
          inst.push({ x: nx2x(jx), z: ny2z(jy), h, fw, fd, rot: (rng() - 0.5) * 0.6, tone: rng() });
          if (inst.length >= MAX_BUILDINGS) break;
        }
        if (inst.length >= MAX_BUILDINGS) break;
      }
    });
    if (!inst.length) return;

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geo, material, inst.length);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const col = new THREE.Color();
    inst.forEach((b, i) => {
      q.setFromAxisAngle(up, b.rot);
      pos.set(b.x, GROUND_Y + b.h / 2, b.z);
      scl.set(b.fw, b.h, b.fd);
      m.compose(pos, q, scl);
      mesh.setMatrixAt(i, m);
      // Varme, avmettede modellmaling-toner.
      col.setHSL(0.085 + b.tone * 0.05, 0.16 + b.tone * 0.12, 0.42 + b.tone * 0.2);
      mesh.setColorAt(i, col);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);
  }

  // Trær i Marka, på Ekeberg og i grønne bydeler.
  function buildTrees() {
    const land = window.CIVI_OSLO_LANDSCAPE || {};
    const rng = mulberry32(73331);
    const regions = [];
    if (land.markaNorth) regions.push({ poly: land.markaNorth, baseY: MARKA_H, n: 260 });
    if (land.ekebergRidge) regions.push({ poly: land.ekebergRidge, baseY: EKEBERG_H, n: 90 });
    const greenDistricts = ["nordstrand", "stovner"];
    (window.CIVI_MAP_DISTRICTS || []).forEach((d) => {
      if (greenDistricts.includes(d.id)) regions.push({ poly: d.shape, baseY: GROUND_Y, n: 40 });
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
        pts.push({ x: nx2x(x), z: ny2z(y), baseY: reg.baseY, h: 0.4 + rng() * 0.35, tone: rng() });
        placed++;
      }
    });
    if (!pts.length) return;

    const geo = new THREE.ConeGeometry(0.16, 1, 7);
    const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const mesh = new THREE.InstancedMesh(geo, material, pts.length);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const col = new THREE.Color();
    pts.forEach((t, i) => {
      pos.set(t.x, t.baseY + t.h / 2, t.z);
      scl.set(0.8 + t.tone * 0.6, t.h, 0.8 + t.tone * 0.6);
      m.compose(pos, q, scl);
      mesh.setMatrixAt(i, m);
      col.setHSL(0.30, 0.42, 0.26 + t.tone * 0.12);
      mesh.setColorAt(i, col);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    scene.add(mesh);
  }

  // Håndmodellerte Oslo-landemerker.
  function buildLandmarks() {
    const g = new THREE.Group();

    // Barcode – rad med slanke høyhus ved Bjørvika.
    for (let i = 0; i < 9; i++) {
      const t = i / 8;
      const nx = 0.574 + t * 0.036;
      const ny = 0.582 + t * 0.052;
      const h = 1.5 + ((i % 3) * 0.45) + (i === 4 ? 0.6 : 0);
      addBox(g, nx, ny, 0.16, h, 0.5, 0x34465b, GROUND_Y, 0.5);
    }
    // Høyhus ved Oslo S (Plaza/Posthuset).
    addBox(g, 0.553, 0.586, 0.26, 2.6, 0.26, 0x3a4a5e, GROUND_Y);
    addBox(g, 0.536, 0.58, 0.32, 2.05, 0.32, 0x47566a, GROUND_Y);

    // Operaen – hvit skrå rampe ved vannet.
    buildOpera(g);

    // Akershus festning – steinmasse + tårn med spisstak.
    addBox(g, 0.5, 0.646, 0.95, 0.5, 0.95, 0x8a8276, GROUND_Y);
    addBox(g, 0.5, 0.646, 0.3, 1.05, 0.3, 0x948b7d, GROUND_Y);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.5, 4), mat(0x4f4a40));
    spire.position.set(nx2x(0.5), GROUND_Y + 1.05 + 0.25, ny2z(0.646));
    spire.rotation.y = Math.PI / 4;
    spire.castShadow = true;
    g.add(spire);

    // Rådhuset – to teglsteinstårn + lavere mellombygg.
    addBox(g, 0.463, 0.61, 0.3, 1.7, 0.5, 0x9c5a3c, GROUND_Y);
    addBox(g, 0.49, 0.61, 0.3, 1.7, 0.5, 0x9c5a3c, GROUND_Y);
    addBox(g, 0.4765, 0.612, 0.62, 0.8, 0.5, 0xab6647, GROUND_Y);

    // Slottet – gul klassisk blokk på en grønn høyde.
    addBox(g, 0.45, 0.55, 1.0, 0.5, 0.5, 0xe6cf92, GROUND_Y);
    addBox(g, 0.45, 0.55, 0.34, 0.7, 0.5, 0xefd9a0, GROUND_Y);

    // Holmenkollen – skihopp i åsen nordvest.
    const hkBase = MARKA_H;
    addBox(g, 0.30, 0.165, 0.14, 1.7, 0.14, 0xdfe4e9, hkBase);
    const inrun = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 2.0), mat(0xc7ced6));
    inrun.position.set(nx2x(0.30), hkBase + 1.0, ny2z(0.205));
    inrun.rotation.x = -0.62;
    inrun.castShadow = true;
    g.add(inrun);

    scene.add(g);
  }

  function buildOpera(group) {
    const L = 1.7, Hh = 1.0, depth = 1.5;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(L, 0);
    shape.lineTo(0, Hh);
    shape.closePath();
    const geo = new THREE.ExtrudeGeometry(shape, { depth: depth, bevelEnabled: false });
    geo.translate(-L / 2, 0, -depth / 2);
    const mesh = new THREE.Mesh(geo, mat(0xeae6dc));
    mesh.position.set(nx2x(0.548), 0.02, ny2z(0.636));
    mesh.rotation.y = -0.5;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  }

  // Interaktive History Go-places: bygning + lysende kategori-fyr.
  function placeGroupFor(p) {
    const asset = resolveAssetType(p);
    const accent = categoryColor(p.category);
    let geo, color = accent, h;

    if (asset === "skyline") { h = 1.6; geo = new THREE.BoxGeometry(0.34, h, 0.34); }
    else if (asset === "civic") { h = 1.0; geo = new THREE.BoxGeometry(0.6, h, 0.6); }
    else if (asset === "fortress") { h = 0.75; geo = new THREE.BoxGeometry(0.6, h, 0.6); color = 0x9aa0a4; }
    else if (asset === "station") { h = 0.55; geo = new THREE.BoxGeometry(0.7, h, 0.45); color = 0x8a96a0; }
    else if (asset === "museum" || asset === "library" || asset === "theatre") { h = 0.85; geo = new THREE.BoxGeometry(0.56, h, 0.5); }
    else if (asset === "church") { h = 1.2; geo = new THREE.CylinderGeometry(0.14, 0.22, h, 6); }
    else if (asset === "stadium") { h = 0.34; geo = new THREE.CylinderGeometry(0.44, 0.44, h, 18); color = 0x5fa36a; }
    else if (asset === "park") { h = 0.18; geo = new THREE.CylinderGeometry(0.42, 0.42, h, 14); color = 0x6aa66f; }
    else if (asset === "waterfront") { h = 0.4; geo = new THREE.BoxGeometry(0.66, h, 0.32); color = 0x3d7299; }
    else if (asset === "street") { h = 0.16; geo = new THREE.BoxGeometry(0.6, h, 0.24); color = 0x6e6f73; }
    else { h = 0.65; geo = new THREE.BoxGeometry(0.46, h, 0.46); }

    const group = new THREE.Group();
    const body = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: new THREE.Color(color), emissive: new THREE.Color(accent), emissiveIntensity: 0.18 }));
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData = { placeId: p.id };
    group.add(body);

    // Lysende fyr på toppen så places skiller seg fra bybildet.
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 10, 8),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(accent) })
    );
    beacon.position.y = h / 2 + 0.22;
    beacon.userData = { placeId: p.id };
    group.add(beacon);

    group.userData = { placeId: p.id, h };
    return group;
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
    if (!_places) return;

    _lastBucket = zoomBucket(zoom);
    visibleSet(_places, zoom).forEach((p) => {
      const proj = project(p);
      if (!proj) return;
      const node = placeGroupFor(p);
      node.position.set(nx2x(proj.x), GROUND_Y, ny2z(proj.y));
      placeGroup.add(node);
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

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.domElement.className = "civi-three-canvas";
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1016);
    scene.fog = new THREE.Fog(0x0b1016, 46, 92);
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
