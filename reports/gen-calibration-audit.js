// reports/gen-calibration-audit.js
// Genererer audit-rapport for Canvas-kartets Oslo-kalibrering.
//   node reports/gen-calibration-audit.js
//
// Bruker samme kalibreringsmodell (CivicationOsloMapCalibration.js) og
// landskapsdata (CivicationMapModel.js) som kjører i nettleseren, slik at
// rapporten matcher faktisk plassering. Endrer ingen place-data.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const DATA = path.join(ROOT, "data");

// --- Last nettleser-moduler i et lett window-shim ---------------------------
const sandbox = { window: {}, Math, console };
sandbox.window.Math = Math;
vm.createContext(sandbox);
function loadBrowserModule(rel) {
  const code = fs.readFileSync(path.join(ROOT, rel), "utf8");
  vm.runInContext(code, sandbox, { filename: rel });
}
loadBrowserModule("js/Civication/ui/CivicationMapModel.js");
loadBrowserModule("js/Civication/ui/CivicationOsloMapCalibration.js");

const CAL = sandbox.window.CivicationOsloMapCalibration;
const LAND = sandbox.window.CIVI_OSLO_LANDSCAPE || {};

// --- Stiliserte land/vann-former (speiler CivicationCanvasMap.js) ----------
const BYGDOY_PENINSULA = [[0.13,0.65],[0.27,0.62],[0.34,0.66],[0.33,0.74],[0.25,0.79],[0.16,0.77],[0.10,0.70]];
const BJORVIKA_INLET = [[0.52,0.60],[0.61,0.60],[0.64,0.66],[0.60,0.73],[0.54,0.72],[0.50,0.66]];
const AKERSHUS_POINT = [[0.47,0.61],[0.525,0.62],[0.545,0.66],[0.505,0.69],[0.455,0.67]];
const ANCHORS = sandbox.window.CIVI_OSLO_GEO_ANCHORS || [];
function anchorXY(id) { const a = ANCHORS.find((an) => an.id === id); return a ? { x: a.x, y: a.y } : null; }
const ISLANDS = [
  Object.assign({ rx: 0.032, ry: 0.018 }, anchorXY("hovedoya")),
  { x: 0.415, y: 0.800, rx: 0.024, ry: 0.013 },
  { x: 0.520, y: 0.815, rx: 0.028, ry: 0.015 },
  { x: 0.395, y: 0.745, rx: 0.018, ry: 0.011 }
].filter((i) => i && i.x != null);

// --- Filter / projeksjon (speiler CanvasMap) -------------------------------
const OSLO_FILTER = { minLat: 59.75, maxLat: 60.10, minLon: 10.45, maxLon: 11.00 };
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };

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
  return p.lat != null && p.lon != null && p.lat >= b.minLat && p.lat <= b.maxLat && p.lon >= b.minLon && p.lon <= b.maxLon;
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
  if (typeof cm.x === "number" && typeof cm.y === "number" && cm.x >= 0 && cm.x <= 1 && cm.y >= 0 && cm.y <= 1) {
    return { x: cm.x, y: cm.y, source: "manual" };
  }
  if (p.lat == null || p.lon == null) return null;
  const r = CAL.projectLatLonWithAnchors(p.lat, p.lon);
  if (r) return { x: r.x, y: r.y, source: r.source || "calibrated" };
  const bb = CAL.projectLatLonBoundingBox(p.lat, p.lon);
  return { x: bb.x, y: bb.y, source: "fallback" };
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

// --- Geometri ---------------------------------------------------------------
function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
function inIsland(x, y) {
  if (pointInPoly(x, y, BYGDOY_PENINSULA)) return true;
  if (pointInPoly(x, y, AKERSHUS_POINT)) return true;
  return ISLANDS.some((isl) => {
    const dx = (x - isl.x) / isl.rx, dy = (y - isl.y) / isl.ry;
    return dx * dx + dy * dy <= 1;
  });
}
function inFjord(x, y) {
  const water = (LAND.fjord && pointInPoly(x, y, LAND.fjord)) ||
    (LAND.innerFjordArm && pointInPoly(x, y, LAND.innerFjordArm)) ||
    pointInPoly(x, y, BJORVIKA_INLET);
  return !!water && !inIsland(x, y);
}

// --- Last places -----------------------------------------------------------
function readJSON(rel) { return JSON.parse(fs.readFileSync(path.join(DATA, rel), "utf8")); }
const manifest = readJSON("places/manifest.json");
const rawPlaces = [];
for (const file of manifest.files) {
  let data;
  try { data = readJSON(file); } catch (e) { continue; }
  if (Array.isArray(data)) rawPlaces.push(...data);
  else if (Array.isArray(data && data.places)) rawPlaces.push(...data.places);
}

// Dedup + normaliser + Oslo-filter
const seen = new Set();
const allNorm = [];
rawPlaces.forEach((raw) => {
  const p = normalize(raw);
  if (!p.id || seen.has(p.id)) return;
  seen.add(p.id);
  allNorm.push(p);
});
const oslo = allNorm.filter(isOslo);

// --- Statistikk ------------------------------------------------------------
let manualCount = 0, calibratedCount = 0, fallbackCount = 0;
const noLatLon = [];
const inFjordList = [];
oslo.forEach((p) => {
  const proj = project(p);
  if (!proj) { noLatLon.push({ id: p.id, name: p.name }); return; }
  if (proj.source === "manual") manualCount++;
  else if (proj.source === "calibrated") calibratedCount++;
  else fallbackCount++;
  p._proj = proj;
  if (inFjord(proj.x, proj.y)) inFjordList.push({ id: p.id, name: p.name, x: Number(proj.x.toFixed(3)), y: Number(proj.y.toFixed(3)) });
});

const outsideFilter = allNorm.filter((p) => !isOslo(p)).length;

const LIMITS = { low: 18, mid: 45, high: 80 };
const sorted = oslo.slice().filter((p) => p._proj).sort((a, b) => priorityOf(b) - priorityOf(a));
function topN(limit, n) {
  return sorted.slice(0, Math.min(sorted.length, limit)).slice(0, n).map((p) => ({
    id: p.id, name: p.name, category: p.category,
    priority: priorityOf(p), asset: resolveAssetType(p),
    x: Number(p._proj.x.toFixed(3)), y: Number(p._proj.y.toFixed(3)), source: p._proj.source
  }));
}
const top = { low: topN(LIMITS.low, 30), mid: topN(LIMITS.mid, 30), high: topN(LIMITS.high, 30) };

const summary = {
  generatedAt: new Date().toISOString(),
  totalPlacesLoaded: allNorm.length,
  osloPlaces: oslo.length,
  outsideOsloFilter: outsideFilter,
  withManualCiviMapXY: manualCount,
  withCalibratedProjection: calibratedCount,
  withFallbackProjection: fallbackCount,
  withoutLatLon: noLatLon.length,
  projectedIntoFjord: inFjordList.length,
  zoomLimits: LIMITS,
  anchors: ANCHORS.map((a) => ({ id: a.id, name: a.name, x: a.x, y: a.y }))
};

const json = { summary, withoutLatLon: noLatLon, projectedIntoFjord: inFjordList, top };
fs.writeFileSync(path.join(ROOT, "reports/civication-canvas-map-calibration-audit.json"), JSON.stringify(json, null, 2) + "\n");

// --- Markdown --------------------------------------------------------------
function mdTable(rows) {
  const head = "| # | id | navn | kat | asset | prio | x | y | kilde |\n|---|----|------|-----|-------|------|---|---|-------|";
  const body = rows.map((r, i) => `| ${i + 1} | \`${r.id}\` | ${r.name} | ${r.category} | ${r.asset} | ${r.priority} | ${r.x} | ${r.y} | ${r.source} |`).join("\n");
  return head + "\n" + body;
}
const md = `# Civication Canvas-kart – Oslo-kalibrering audit

Generert: ${summary.generatedAt}

Denne rapporten beskriver hvordan History Go-steder projiseres på det
Canvas-baserte Civication-Oslo-kartet etter at kalibreringsmodellen
(\`CivicationOsloMapCalibration.js\`) ble innført. Ingen place-data er endret.

## Nøkkeltall

| Måling | Antall |
|--------|--------|
| Steder lastet totalt (dedup) | ${summary.totalPlacesLoaded} |
| Oslo-steder (etter filter) | ${summary.osloPlaces} |
| Steder utenfor Oslo-filter | ${summary.outsideOsloFilter} |
| Med manuell \`civiMap.x/y\` | ${summary.withManualCiviMapXY} |
| Med kalibrert projeksjon | ${summary.withCalibratedProjection} |
| Med fallback (bounding box) | ${summary.withFallbackProjection} |
| Uten lat/lon | ${summary.withoutLatLon} |
| Projisert ut i fjorden (heuristikk) | ${summary.projectedIntoFjord} |

Zoom-grenser (antall synlige): low=${LIMITS.low}, mid=${LIMITS.mid}, high=${LIMITS.high}.

## Geo-ankere

| id | navn | x | y |
|----|------|---|---|
${summary.anchors.map((a) => `| ${a.id} | ${a.name} | ${a.x} | ${a.y} |`).join("\n")}

## Steder uten lat/lon (${noLatLon.length})

${noLatLon.length ? noLatLon.map((p) => `- \`${p.id}\` – ${p.name}`).join("\n") : "_Ingen._"}

## Steder som havner i fjorden etter projeksjon (${inFjordList.length})

Heuristikk: projisert punkt i fjord/innerFjordArm/Bjørvika-vann og ikke på øy/halvøy/festning.

${inFjordList.length ? inFjordList.map((p) => `- \`${p.id}\` – ${p.name} (x=${p.x}, y=${p.y})`).join("\n") : "_Ingen._"}

## Topp 30 synlige – low zoom (maks ${LIMITS.low})

${mdTable(top.low)}

## Topp 30 synlige – mid zoom (maks ${LIMITS.mid})

${mdTable(top.mid)}

## Topp 30 synlige – high zoom (maks ${LIMITS.high})

${mdTable(top.high)}
`;
fs.writeFileSync(path.join(ROOT, "reports/civication-canvas-map-calibration-audit.md"), md);

console.log("Audit generert:");
console.log("  oslo:", summary.osloPlaces, "manual:", manualCount, "calibrated:", calibratedCount, "fallback:", fallbackCount, "noLatLon:", noLatLon.length, "inFjord:", inFjordList.length);
