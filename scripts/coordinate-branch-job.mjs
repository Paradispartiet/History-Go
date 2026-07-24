import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-24';
const PLACE_ID = 'frysja_industriomrade';
const REPORT_DIR = 'reports/oslo-coordinate-frysja-industrial-model-audit-post-191';
const OFFICIAL_URL = 'https://magasin.oslo.kommune.no/byplan/frysja-kvalitet-og-kvantitet';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&limit=20&q=Frysja%2C%20Oslo%2C%20Norway';
mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const distanceMeters = (a, b, c, d) => {
  const rad = (x) => x * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(c - a), dLon = rad(d - b);
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(q));
};
const polygonAreaApprox = (coords) => {
  if (!Array.isArray(coords) || coords.length < 3) return 0;
  const lat0 = coords.reduce((s, p) => s + p.lat, 0) / coords.length;
  const mx = 111320 * Math.cos(lat0 * Math.PI / 180);
  const my = 110540;
  let sum = 0;
  for (let i = 0; i < coords.length; i++) {
    const a = coords[i], b = coords[(i + 1) % coords.length];
    sum += (a.lon * mx) * (b.lat * my) - (b.lon * mx) * (a.lat * my);
  }
  return Math.abs(sum) / 2;
};
const pointInPolygon = (lat, lon, coords) => {
  if (!Array.isArray(coords) || coords.length < 3) return false;
  let inside = false;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const xi = coords[i].lon, yi = coords[i].lat;
    const xj = coords[j].lon, yj = coords[j].lat;
    const intersect = ((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / ((yj - yi) || 1e-12) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};
async function fetchText(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'user-agent': 'History-Go coordinate research/1.0', ...(options.headers || {}) } });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return text;
}

const protocol = readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((m) => Number(m[1])));
if (maxBatch !== 191) throw new Error(`Expected coordinate max batch 191, got ${maxBatch}`);

const runtimeRoot = readJson('data/places/places_index.json');
const runtimePlaces = [];
const visit = (value) => {
  if (Array.isArray(value)) return value.forEach(visit);
  if (!value || typeof value !== 'object') return;
  if (typeof value.id === 'string' && typeof value.name === 'string' && Number.isFinite(value.lat) && Number.isFinite(value.lon)) {
    runtimePlaces.push(value);
    return;
  }
  Object.values(value).forEach(visit);
};
visit(runtimeRoot);
const legacyMatches = runtimePlaces.filter((place) => place.id === PLACE_ID);
if (legacyMatches.length !== 1) throw new Error(`Expected one runtime ${PLACE_ID}, got ${legacyMatches.length}`);
const legacy = legacyMatches[0];
if (legacy.coordStatus !== 'needs_source' || legacy.locatorType !== 'linear_area') throw new Error('Frysja legacy state changed from expected unresolved area contract');

const repoCandidates = runtimePlaces
  .filter((place) => place.id !== PLACE_ID && /(frysja|brekke|brekkedammen)/i.test(`${place.id} ${place.name}`))
  .map((place) => ({
    id: place.id,
    name: place.name,
    category: place.category || null,
    lat: place.lat,
    lon: place.lon,
    r: place.r || null,
    locatorType: place.locatorType || null,
    coordStatus: place.coordStatus || null,
    coordType: place.coordType || null,
    sourceObjectId: place.sourceObjectId || null,
    sourceFile: place.sourceFile || place.file || null,
    distanceMeters: Number(distanceMeters(legacy.lat, legacy.lon, place.lat, place.lon).toFixed(2))
  }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters);

const grep = spawnSync('git', ['grep', '-n', '-F', `"${PLACE_ID}"`, '--', 'data'], { encoding: 'utf8' });
if (![0, 1].includes(grep.status)) throw new Error(`git grep failed: ${grep.stderr}`);
const refs = String(grep.stdout || '').trim().split('\n').filter(Boolean);

const evidence = readJson('data/coordinate-evidence/oslo/naeringsliv/frysja_industriomrade.json');
if (evidence.placeId !== PLACE_ID || evidence.coordinateDecision !== 'needs_geometry') throw new Error('Unexpected Frysja evidence state');

const officialHtml = await fetchText(OFFICIAL_URL);
const officialChecks = {
  mentionsFrysja: /Frysja/i.test(officialHtml),
  mentionsIndustrialHistory: /industri/i.test(officialHtml),
  mentionsAkerselva: /Akerselva/i.test(officialHtml)
};
if (!officialChecks.mentionsFrysja || !officialChecks.mentionsIndustrialHistory) throw new Error(`Official Frysja identity source no longer supports the record: ${JSON.stringify(officialChecks)}`);

const overpassQuery = `[out:json][timeout:60];\n(\n  way["landuse"="industrial"](59.953,10.756,59.970,10.790);\n  relation["landuse"="industrial"](59.953,10.756,59.970,10.790);\n  nwr["name"~"Frysja|Brekke",i](59.953,10.756,59.970,10.790);\n);\nout tags center geom;`;
const overpassText = await fetchText(OVERPASS_URL, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ data: overpassQuery }).toString()
});
writeFileSync(`${REPORT_DIR}/overpass-raw.json`, overpassText, 'utf8');
const overpass = JSON.parse(overpassText);

const osmCandidates = (overpass.elements || []).map((el) => {
  const geometry = Array.isArray(el.geometry) ? el.geometry.map((p) => ({ lat: Number(p.lat), lon: Number(p.lon) })).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon)) : [];
  const center = el.center && Number.isFinite(Number(el.center.lat)) && Number.isFinite(Number(el.center.lon))
    ? { lat: Number(el.center.lat), lon: Number(el.center.lon) }
    : geometry.length
      ? { lat: geometry.reduce((s, p) => s + p.lat, 0) / geometry.length, lon: geometry.reduce((s, p) => s + p.lon, 0) / geometry.length }
      : null;
  return {
    type: el.type,
    id: el.id,
    osmObjectId: `osm-${el.type}:${el.id}`,
    tags: el.tags || {},
    center,
    distanceFromLegacyMeters: center ? Number(distanceMeters(legacy.lat, legacy.lon, center.lat, center.lon).toFixed(2)) : null,
    geometryPointCount: geometry.length,
    approxAreaSquareMeters: geometry.length >= 3 ? Math.round(polygonAreaApprox(geometry)) : null,
    containsLegacyPoint: geometry.length >= 3 ? pointInPolygon(legacy.lat, legacy.lon, geometry) : false,
    geometry
  };
});
const industrialPolygons = osmCandidates
  .filter((c) => c.tags.landuse === 'industrial' && c.geometryPointCount >= 3)
  .sort((a, b) => (a.distanceFromLegacyMeters ?? Infinity) - (b.distanceFromLegacyMeters ?? Infinity));
const namedFrysjaCandidates = osmCandidates.filter((c) => /frysja/i.test(`${c.tags.name || ''} ${c.tags.alt_name || ''} ${c.tags.official_name || ''}`));
const containingIndustrial = industrialPolygons.filter((c) => c.containsLegacyPoint);

const nominatimText = await fetchText(NOMINATIM_URL, { headers: { 'accept-language': 'nb,en' } });
writeFileSync(`${REPORT_DIR}/nominatim-raw.json`, nominatimText, 'utf8');
const nominatim = JSON.parse(nominatimText).map((item) => ({
  osm_type: item.osm_type,
  osm_id: item.osm_id,
  type: item.type,
  category: item.category,
  display_name: item.display_name,
  lat: Number(item.lat),
  lon: Number(item.lon),
  distanceFromLegacyMeters: Number(distanceMeters(legacy.lat, legacy.lon, Number(item.lat), Number(item.lon)).toFixed(2)),
  geojsonType: item.geojson?.type || null,
  geojson: item.geojson || null
}));

const decision = containingIndustrial.length === 1
  ? 'One live OSM industrial polygon contains the legacy display point. It is a strong geometry candidate, but production should first confirm that its physical extent corresponds to the municipal Frysja transformation area rather than only one sub-parcel.'
  : containingIndustrial.length > 1
    ? 'Multiple industrial polygons contain/overlap the legacy Frysja anchor; no single geometry can be promoted without scope reconciliation.'
    : 'No single live OSM industrial polygon contains the legacy point. Continue with a multi-anchor or municipal-plan geometry approach; do not verify the current point.';

writeJson(`${REPORT_DIR}/summary.json`, {
  version: DATE,
  purpose: 'Resolve whether Frysja industriområde is a duplicate, a source-backed OSM/municipal area, or still an unresolved broad-area proxy.',
  legacy,
  evidence,
  officialSource: { url: OFFICIAL_URL, checks: officialChecks },
  repoCandidates,
  referenceLineCount: refs.length,
  references: refs,
  osm: {
    query: overpassQuery,
    candidateCount: osmCandidates.length,
    industrialPolygonCount: industrialPolygons.length,
    containingIndustrialCount: containingIndustrial.length,
    namedFrysjaCount: namedFrysjaCandidates.length,
    containingIndustrial,
    namedFrysjaCandidates,
    nearestIndustrialPolygons: industrialPolygons.slice(0, 20),
    allCandidates: osmCandidates
  },
  nominatim,
  decision
});
writeFileSync(`${REPORT_DIR}/sources.md`, `# Frysja industrial model + geometry audit\n\nDate: ${DATE}\n\n${decision}\n\n- Repo candidates matching Frysja/Brekke: ${repoCandidates.length}\n- Exact legacy-ID reference lines: ${refs.length}\n- Live OSM industrial polygons in bounded search: ${industrialPolygons.length}\n- Industrial polygons containing the current legacy point: ${containingIndustrial.length}\n- Named Frysja OSM candidates: ${namedFrysjaCandidates.length}\n- Nominatim Frysja candidates: ${nominatim.length}\n\nOfficial identity source checked: ${OFFICIAL_URL}\n\nNo canonical place or coordinate data is changed by this audit.\n`, 'utf8');

console.log(JSON.stringify({
  placeId: PLACE_ID,
  repoCandidateCount: repoCandidates.length,
  referenceLineCount: refs.length,
  industrialPolygonCount: industrialPolygons.length,
  containingIndustrialCount: containingIndustrial.length,
  namedFrysjaCount: namedFrysjaCandidates.length,
  nominatimCount: nominatim.length,
  containingIndustrial: containingIndustrial.map((c) => ({ osmObjectId: c.osmObjectId, name: c.tags.name || null, area: c.approxAreaSquareMeters, center: c.center })),
  decision
}, null, 2));
