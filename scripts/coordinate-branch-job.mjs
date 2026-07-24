import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-24';
const PLACE_ID = 'gronlikaia';
const REPORT_DIR = 'reports/oslo-coordinate-gronlikaia-geometry-audit-post-191';
const PORT_URL = 'https://www.oslohavn.no/no/meny/fjordbyen/havnepromenaden/';
const MUNICIPAL_URL = 'https://aktuelt.oslo.kommune.no/feil-retning-i-utviklingen-av-gronlikaia';
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&limit=20&q=Gr%C3%B8nlikaia%2C%20Oslo%2C%20Norway';
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
const lineLength = (coords) => coords.slice(1).reduce((sum, p, i) => sum + distanceMeters(coords[i].lat, coords[i].lon, p.lat, p.lon), 0);
const polygonAreaApprox = (coords) => {
  if (!Array.isArray(coords) || coords.length < 3) return 0;
  const lat0 = coords.reduce((s, p) => s + p.lat, 0) / coords.length;
  const mx = 111320 * Math.cos(lat0 * Math.PI / 180), my = 110540;
  let sum = 0;
  for (let i = 0; i < coords.length; i++) {
    const a = coords[i], b = coords[(i + 1) % coords.length];
    sum += (a.lon * mx) * (b.lat * my) - (b.lon * mx) * (a.lat * my);
  }
  return Math.abs(sum) / 2;
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

const evidence = readJson('data/coordinate-evidence/oslo/naeringsliv/gronlikaia.json');
if (evidence.placeId !== PLACE_ID || evidence.coordinateDecision !== 'needs_geometry') throw new Error('Unexpected Grønlikaia evidence state');

const repoCandidates = runtimePlaces
  .filter((place) => place.id !== PLACE_ID && /(grønlikaia|gronlikaia|grønlia|gronlia|kongshavn|sydhavna)/i.test(`${place.id} ${place.name}`))
  .map((place) => ({
    id: place.id, name: place.name, category: place.category || null,
    lat: place.lat, lon: place.lon, r: place.r || null,
    locatorType: place.locatorType || null, coordStatus: place.coordStatus || null,
    coordType: place.coordType || null, sourceObjectId: place.sourceObjectId || null,
    sourceFile: place.sourceFile || place.file || null,
    distanceMeters: Number(distanceMeters(legacy.lat, legacy.lon, place.lat, place.lon).toFixed(2))
  }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters);

const grep = spawnSync('git', ['grep', '-n', '-F', `"${PLACE_ID}"`, '--', 'data'], { encoding: 'utf8' });
if (![0, 1].includes(grep.status)) throw new Error(`git grep failed: ${grep.stderr}`);
const refs = String(grep.stdout || '').trim().split('\n').filter(Boolean);

const [portHtml, municipalHtml] = await Promise.all([fetchText(PORT_URL), fetchText(MUNICIPAL_URL)]);
const officialChecks = {
  portMentionsGrønlikaia: /Grønlikaia|Grønli Kaia/i.test(portHtml),
  portMentionsHavnepromenade: /Havnepromenaden/i.test(portHtml),
  portMentionsAlnaBoundary: /Alna/i.test(portHtml) && /grensen mellom Bjørvika og Sydhavna|boundary between Bjørvika and Sydhavna/i.test(portHtml),
  municipalityMentionsGrønlikaia: /Grønlikaia/i.test(municipalHtml),
  municipalityCallsDevelopmentArea: /byutviklingsområde/i.test(municipalHtml) || /development area/i.test(municipalHtml)
};
if (!officialChecks.portMentionsGrønlikaia || !officialChecks.municipalityMentionsGrønlikaia) {
  throw new Error(`Official identity checks failed: ${JSON.stringify(officialChecks)}`);
}

const bbox = '(59.893,10.744,59.907,10.779)';
const overpassQuery = `[out:json][timeout:90];\n(\n  way["man_made"="quay"]${bbox};\n  relation["man_made"="quay"]${bbox};\n  way["landuse"="port"]${bbox};\n  relation["landuse"="port"]${bbox};\n  nwr["harbour"="yes"]${bbox};\n  nwr["name"~"Grønlikaia|Grønlia|Grønlikaien|Kongshavn",i]${bbox};\n);\nout tags center geom;`;
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
  const isClosed = geometry.length >= 4 && geometry[0].lat === geometry.at(-1).lat && geometry[0].lon === geometry.at(-1).lon;
  return {
    type: el.type,
    id: el.id,
    osmObjectId: `osm-${el.type}:${el.id}`,
    tags: el.tags || {},
    center,
    distanceFromLegacyMeters: center ? Number(distanceMeters(legacy.lat, legacy.lon, center.lat, center.lon).toFixed(2)) : null,
    geometryPointCount: geometry.length,
    geometryLengthMeters: geometry.length >= 2 ? Number(lineLength(geometry).toFixed(2)) : null,
    approxAreaSquareMeters: isClosed ? Math.round(polygonAreaApprox(geometry)) : null,
    isClosed,
    geometry
  };
});
const quayCandidates = osmCandidates.filter((c) => c.tags.man_made === 'quay').sort((a, b) => (a.distanceFromLegacyMeters ?? Infinity) - (b.distanceFromLegacyMeters ?? Infinity));
const portAreaCandidates = osmCandidates.filter((c) => c.tags.landuse === 'port' || c.tags.harbour === 'yes').sort((a, b) => (a.distanceFromLegacyMeters ?? Infinity) - (b.distanceFromLegacyMeters ?? Infinity));
const namedCandidates = osmCandidates.filter((c) => /(grønlikaia|grønlia|grønlikaien)/i.test(`${c.tags.name || ''} ${c.tags.alt_name || ''} ${c.tags.official_name || ''}`));

const nominatimText = await fetchText(NOMINATIM_URL, { headers: { 'accept-language': 'nb,en' } });
writeFileSync(`${REPORT_DIR}/nominatim-raw.json`, nominatimText, 'utf8');
const nominatim = JSON.parse(nominatimText).map((item) => ({
  osm_type: item.osm_type, osm_id: item.osm_id, type: item.type, category: item.category,
  display_name: item.display_name, lat: Number(item.lat), lon: Number(item.lon),
  distanceFromLegacyMeters: Number(distanceMeters(legacy.lat, legacy.lon, Number(item.lat), Number(item.lon)).toFixed(2)),
  geojsonType: item.geojson?.type || null, geojson: item.geojson || null
}));

const coherentQuaySet = quayCandidates.filter((c) => c.distanceFromLegacyMeters != null && c.distanceFromLegacyMeters <= 1200 && c.geometryPointCount >= 2);
const namedExactGeometry = namedCandidates.filter((c) => c.geometryPointCount >= 2);
let decision;
if (namedExactGeometry.length === 1 && ['quay', 'port'].includes(namedExactGeometry[0].tags.man_made || namedExactGeometry[0].tags.landuse)) {
  decision = `One named Grønlikaia geometry candidate exists (${namedExactGeometry[0].osmObjectId}); inspect its extent against official harbour/development scope before production.`;
} else if (coherentQuaySet.length >= 2) {
  decision = `Multiple quay geometries exist near Grønlikaia (${coherentQuaySet.length} candidates). A production model may be possible as an ordered multi-segment quay, but only after endpoint/topology and official-scope reconciliation.`;
} else {
  decision = 'No source-backed single Grønlikaia area/quay geometry is available from the bounded live OSM search. Keep the record unresolved unless official plan/harbour geometry or a defensible multi-anchor quay model is established.';
}

writeJson(`${REPORT_DIR}/summary.json`, {
  version: DATE,
  purpose: 'Determine whether Grønlikaia can be modeled from exact quay/port geometry instead of a generic legacy point.',
  legacy,
  evidence,
  officialSources: { port: PORT_URL, municipality: MUNICIPAL_URL, checks: officialChecks },
  repoCandidates,
  referenceLineCount: refs.length,
  references: refs,
  osm: {
    query: overpassQuery,
    candidateCount: osmCandidates.length,
    quayCandidateCount: quayCandidates.length,
    portAreaCandidateCount: portAreaCandidates.length,
    namedCandidateCount: namedCandidates.length,
    coherentQuaySetCount: coherentQuaySet.length,
    namedExactGeometry,
    coherentQuaySet,
    quayCandidates,
    portAreaCandidates,
    namedCandidates,
    allCandidates: osmCandidates
  },
  nominatim,
  decision
});
writeFileSync(`${REPORT_DIR}/sources.md`, `# Grønlikaia geometry audit\n\nDate: ${DATE}\n\n${decision}\n\n- Repo candidates matching Grønlikaia/Grønlia/Kongshavn/Sydhavna: ${repoCandidates.length}\n- Exact legacy-ID reference lines: ${refs.length}\n- Live OSM quay candidates: ${quayCandidates.length}\n- Live OSM port-area candidates: ${portAreaCandidates.length}\n- Named Grønlikaia/Grønlia candidates: ${namedCandidates.length}\n- Nearby coherent quay candidates (≤1.2 km): ${coherentQuaySet.length}\n- Nominatim candidates: ${nominatim.length}\n\nOfficial identity/scope sources checked:\n- ${PORT_URL}\n- ${MUNICIPAL_URL}\n\nNo canonical place or coordinate data is changed by this audit.\n`, 'utf8');

console.log(JSON.stringify({
  placeId: PLACE_ID,
  repoCandidateCount: repoCandidates.length,
  referenceLineCount: refs.length,
  quayCandidateCount: quayCandidates.length,
  portAreaCandidateCount: portAreaCandidates.length,
  namedCandidateCount: namedCandidates.length,
  coherentQuaySetCount: coherentQuaySet.length,
  nominatimCount: nominatim.length,
  nearestQuays: quayCandidates.slice(0, 12).map((c) => ({ osmObjectId: c.osmObjectId, name: c.tags.name || null, distanceMeters: c.distanceFromLegacyMeters, lengthMeters: c.geometryLengthMeters, pointCount: c.geometryPointCount })),
  decision
}, null, 2));
