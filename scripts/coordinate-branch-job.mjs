import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const PLACE_ID = 'frognerstranda';
const EXPECTED_MAX_BATCH = 194;
const REPORT_DIR = 'reports/oslo-coordinate-frognerstranda-scope-research-post-194';
const LEGACY = { lat: 59.9129, lon: 10.7098, r: 180 };
const BBOX = '(59.904,10.684,59.921,10.728)';
const SSR_URL = 'https://ws.geonorge.no/stedsnavn/v1/navn?sok=Frognerstranda&fuzzy=false&utkoordsys=4258&treffPerSide=100';
const ADDRESS_URL = 'https://ws.geonorge.no/adresser/v1/sok?sok=Frognerstranda&kommunenummer=0301&treffPerSide=100';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search?format=jsonv2&polygon_geojson=1&addressdetails=1&namedetails=1&limit=50&countrycodes=no&q=Frognerstranda%20Oslo';
const OVERPASS_ENDPOINTS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter',
  'https://overpass.nchc.org.tw/api/interpreter',
];

mkdirSync(REPORT_DIR, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function maxProtocolBatch() {
  const text = readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
  const batches = [...text.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
  return Math.max(...batches);
}

function toRad(value) {
  return value * Math.PI / 180;
}

function distanceMeters(a, b) {
  const R = 6371008.8;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function lineLength(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += distanceMeters(points[i - 1], points[i]);
  return total;
}

function polygonArea(points) {
  if (points.length < 4) return null;
  const meanLat = points.reduce((sum, point) => sum + point.lat, 0) / points.length;
  const scaleX = 111320 * Math.cos(toRad(meanLat));
  const scaleY = 110540;
  let area = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    area += (a.lon * scaleX) * (b.lat * scaleY) - (b.lon * scaleX) * (a.lat * scaleY);
  }
  return Math.abs(area) / 2;
}

function centerOf(points) {
  if (!points.length) return null;
  return {
    lat: points.reduce((sum, point) => sum + point.lat, 0) / points.length,
    lon: points.reduce((sum, point) => sum + point.lon, 0) / points.length,
  };
}

function normalizeName(value) {
  return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

async function fetchText(url, options = {}, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'user-agent': 'History-Go coordinate research/1.0 (source-first)',
          accept: '*/*',
          ...(options.headers || {}),
        },
        signal: AbortSignal.timeout(90000),
      });
      const text = await response.text();
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${text.slice(0, 300)}`);
      return { text, url, status: response.status, contentType: response.headers.get('content-type') || '' };
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await new Promise((resolve) => setTimeout(resolve, attempt * 1600));
    }
  }
  throw lastError;
}

async function fetchOverpass(query) {
  const failures = [];
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const result = await fetchText(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ data: query }).toString(),
      }, 1);
      return { ...result, endpoint, failures };
    } catch (error) {
      failures.push({ endpoint, error: String(error) });
    }
  }
  return { text: null, endpoint: null, failures };
}

function extractSsrRows(payload) {
  if (Array.isArray(payload?.navn)) return payload.navn;
  if (Array.isArray(payload?.stedsnavn)) return payload.stedsnavn;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function extractAddressRows(payload) {
  if (Array.isArray(payload?.adresser)) return payload.adresser;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function osmSummary(element) {
  const geometry = Array.isArray(element.geometry)
    ? element.geometry.map((point) => ({ lat: Number(point.lat), lon: Number(point.lon) })).filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lon))
    : [];
  const center = element.center && Number.isFinite(Number(element.center.lat)) && Number.isFinite(Number(element.center.lon))
    ? { lat: Number(element.center.lat), lon: Number(element.center.lon) }
    : centerOf(geometry);
  const isClosed = geometry.length > 3 && geometry[0].lat === geometry.at(-1).lat && geometry[0].lon === geometry.at(-1).lon;
  return {
    osmType: element.type,
    osmId: element.id,
    osmObjectId: `osm-${element.type}:${element.id}`,
    tags: element.tags || {},
    center,
    distanceFromLegacyMeters: center ? Number(distanceMeters(LEGACY, center).toFixed(2)) : null,
    geometryPointCount: geometry.length,
    geometryLengthMeters: geometry.length > 1 ? Number(lineLength(geometry).toFixed(2)) : null,
    approximateAreaSquareMeters: isClosed ? Number(polygonArea(geometry).toFixed(2)) : null,
    isClosed,
    geometry,
  };
}

const protocolMax = maxProtocolBatch();
assert(protocolMax === EXPECTED_MAX_BATCH, `Coordinate sequence changed: expected ${EXPECTED_MAX_BATCH}, found ${protocolMax}`);

const evidence = JSON.parse(readFileSync('data/coordinate-evidence/oslo/popkultur/frognerstranda.json', 'utf8'));
assert(evidence.placeId === PLACE_ID, 'Unexpected evidence placeId.');
assert(evidence.currentCoordinate?.coordStatus === 'needs_source', `Unexpected coordStatus=${evidence.currentCoordinate?.coordStatus}`);
assert(evidence.coordinateDecision === 'needs_geometry', `Unexpected coordinateDecision=${evidence.coordinateDecision}`);
const place = JSON.parse(readFileSync('data/places/popkultur/oslo/places_oslo_populaerkultur/frognerstranda.json', 'utf8'));
assert(place.id === PLACE_ID && place.coordStatus === 'needs_source', 'Active place state changed before research.');

const index = JSON.parse(readFileSync('data/places/places_index.json', 'utf8'));
const repoCandidates = index
  .filter((candidate) => candidate?.id !== PLACE_ID)
  .filter((candidate) => /frognerstranda|frogner stranda|frognerkilen|skarpsno|kongshavn|filipstad/i.test(`${candidate?.id || ''} ${candidate?.name || ''}`))
  .map((candidate) => ({
    id: candidate.id,
    name: candidate.name,
    category: candidate.category,
    lat: candidate.lat,
    lon: candidate.lon,
    coordStatus: candidate.coordStatus || null,
    coordType: candidate.coordType || null,
    sourceObjectId: candidate.sourceObjectId || null,
    distanceMeters: Number(distanceMeters(LEGACY, candidate).toFixed(2)),
  }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters);

const [ssrResponse, addressResponse, nominatimResponse] = await Promise.all([
  fetchText(SSR_URL),
  fetchText(ADDRESS_URL),
  fetchText(NOMINATIM_URL, { headers: { accept: 'application/json' } }),
]);
writeFileSync(`${REPORT_DIR}/kartverket-stedsnavn.json`, ssrResponse.text, 'utf8');
writeFileSync(`${REPORT_DIR}/geonorge-adresser.json`, addressResponse.text, 'utf8');
writeFileSync(`${REPORT_DIR}/nominatim.json`, nominatimResponse.text, 'utf8');

const ssrPayload = JSON.parse(ssrResponse.text);
const addressPayload = JSON.parse(addressResponse.text);
const nominatim = JSON.parse(nominatimResponse.text);
const ssrRows = extractSsrRows(ssrPayload);
const addressRows = extractAddressRows(addressPayload);

const exactNameQuery = `[out:json][timeout:45];\n(\n  node["name"~"^Frognerstranda$",i]${BBOX};\n  way["name"~"^Frognerstranda$",i]${BBOX};\n  relation["name"~"^Frognerstranda$",i]${BBOX};\n);\nout tags center geom;`;
const contextQuery = `[out:json][timeout:60];\n(\n  way["footway"="promenade"]${BBOX};\n  way["natural"~"beach|coastline"]${BBOX};\n  way["name"~"Frognerkilen|Skarpsno|Filipstad|Frognerstranda",i]${BBOX};\n  relation["name"~"Frognerkilen|Skarpsno|Filipstad|Frognerstranda",i]${BBOX};\n);\nout tags center geom;`;
const exactOverpass = await fetchOverpass(exactNameQuery);
const contextOverpass = await fetchOverpass(contextQuery);
if (exactOverpass.text) writeFileSync(`${REPORT_DIR}/overpass-exact-name.json`, exactOverpass.text, 'utf8');
if (contextOverpass.text) writeFileSync(`${REPORT_DIR}/overpass-context.json`, contextOverpass.text, 'utf8');
writeFileSync(`${REPORT_DIR}/overpass-status.json`, `${JSON.stringify({ exact: { endpoint: exactOverpass.endpoint, failures: exactOverpass.failures }, context: { endpoint: contextOverpass.endpoint, failures: contextOverpass.failures } }, null, 2)}\n`, 'utf8');

const exactElements = exactOverpass.text ? (JSON.parse(exactOverpass.text).elements || []).map(osmSummary) : [];
const contextElements = contextOverpass.text ? (JSON.parse(contextOverpass.text).elements || []).map(osmSummary) : [];
const exactNamedPhysical = exactElements.filter((candidate) => normalizeName(candidate.tags?.name) === 'frognerstranda');
const exactAreaCandidates = exactNamedPhysical.filter((candidate) => candidate.isClosed && candidate.approximateAreaSquareMeters > 0);
const exactLinearCandidates = exactNamedPhysical.filter((candidate) => !candidate.isClosed && candidate.geometryPointCount > 1);
const nearbyPromenadeCandidates = contextElements
  .filter((candidate) => candidate.center && candidate.distanceFromLegacyMeters <= 800)
  .filter((candidate) => candidate.tags?.footway === 'promenade' || /footway|cycleway|path|pedestrian/.test(candidate.tags?.highway || ''))
  .sort((a, b) => a.distanceFromLegacyMeters - b.distanceFromLegacyMeters);
const nearbyCoastCandidates = contextElements
  .filter((candidate) => candidate.center && candidate.distanceFromLegacyMeters <= 800)
  .filter((candidate) => candidate.tags?.natural === 'coastline' || candidate.tags?.natural === 'beach')
  .sort((a, b) => a.distanceFromLegacyMeters - b.distanceFromLegacyMeters);

const ssrExactRows = ssrRows.filter((row) => normalizeName(row?.skrivemåte || row?.stedsnavn || row?.navn || row?.navneobjekt?.stedsnavn) === 'frognerstranda');
const nominatimExact = nominatim.filter((row) => normalizeName(row?.namedetails?.name || row?.name || row?.display_name?.split(',')[0]) === 'frognerstranda');
const nominatimGeometry = nominatimExact.map((row) => ({
  osmType: row.osm_type || null,
  osmId: row.osm_id || null,
  osmObjectId: row.osm_type && row.osm_id ? `osm-${row.osm_type}:${row.osm_id}` : null,
  category: row.category || null,
  type: row.type || null,
  class: row.class || null,
  displayName: row.display_name || null,
  lat: Number(row.lat),
  lon: Number(row.lon),
  geojsonType: row.geojson?.type || null,
  geojson: row.geojson || null,
  distanceFromLegacyMeters: Number(distanceMeters(LEGACY, { lat: Number(row.lat), lon: Number(row.lon) }).toFixed(2)),
}));
const nominatimAreaCandidates = nominatimGeometry.filter((row) => /Polygon/.test(row.geojsonType || ''));
const nominatimLinearCandidates = nominatimGeometry.filter((row) => /LineString/.test(row.geojsonType || ''));

const officialToponymTypes = ssrExactRows.map((row) => ({
  skrivemåte: row?.skrivemåte || row?.stedsnavn || row?.navn || null,
  navneobjekttype: row?.navneobjekttype || row?.navneobjekt?.navneobjekttype || row?.objekttype || null,
  navneobjekttypekode: row?.navneobjekttypekode || row?.navneobjekt?.navneobjekttypekode || null,
  kommunenavn: row?.kommunenavn || row?.kommune?.kommunenavn || null,
  fylkesnavn: row?.fylkesnavn || row?.fylke?.fylkesnavn || null,
  representasjonspunkt: row?.representasjonspunkt || row?.navneobjekt?.representasjonspunkt || null,
  raw: row,
}));

const officialTypeText = officialToponymTypes.map((row) => `${row.navneobjekttype || ''} ${row.navneobjekttypekode || ''}`).join(' ');
const allAreaCandidates = [...exactAreaCandidates.map((row) => ({ source: 'overpass', ...row })), ...nominatimAreaCandidates.map((row) => ({ source: 'nominatim', ...row }))];
const allLinearCandidates = [...exactLinearCandidates.map((row) => ({ source: 'overpass', ...row })), ...nominatimLinearCandidates.map((row) => ({ source: 'nominatim', ...row }))];
let decision = 'needs_scope_research';
let productionModel = null;
let reason = 'No exact official or OSM geometry has yet been shown to represent the broad Frognerstranda waterfront identity.';
if (allAreaCandidates.length === 1 && /strand|kyst|område|park/i.test(officialTypeText)) {
  decision = 'exact_named_area_candidate_found';
  productionModel = { type: 'area', sourceObjectId: allAreaCandidates[0].osmObjectId || null, source: allAreaCandidates[0].source };
  reason = 'One exact named area geometry matches an official Frognerstranda place-name type compatible with the waterfront scope.';
} else if (allLinearCandidates.length > 0 && /veg|gate|sti|strand|kyst/i.test(officialTypeText)) {
  decision = 'linear_name_candidate_requires_topology_reconciliation';
  productionModel = { type: 'linear_candidate_set', sourceObjectIds: allLinearCandidates.map((candidate) => candidate.osmObjectId).filter(Boolean) };
  reason = 'Exact named linear geometry exists, but it must be reconciled with the official place-name type and the record’s waterfront/promenade scope before production.';
} else if (officialToponymTypes.length > 0) {
  decision = 'official_toponym_found_without_applicable_geometry';
  reason = 'Kartverket confirms an official Frognerstranda name, but no exact matching geometry currently supports the broad waterfront record.';
} else if (allAreaCandidates.length || allLinearCandidates.length) {
  decision = 'osm_identity_found_without_official_toponym_classification';
  reason = 'An exact OSM/Nominatim geometry exists, but Kartverket did not return a matching official object classification in this pass.';
}

const summary = {
  version: '2026-07-24',
  placeId: PLACE_ID,
  coordinateMaxBatch: protocolMax,
  legacy: { ...LEGACY, locatorType: place.locatorType, description: place.popupDesc },
  repoCandidates,
  officialSources: {
    kartverketStedsnavnUrl: SSR_URL,
    geonorgeAddressUrl: ADDRESS_URL,
    kartverketExactNameCount: ssrExactRows.length,
    officialToponymTypes,
    addressCount: addressRows.length,
  },
  nominatim: {
    url: NOMINATIM_URL,
    exactCount: nominatimExact.length,
    exactGeometry: nominatimGeometry,
    areaCandidateCount: nominatimAreaCandidates.length,
    linearCandidateCount: nominatimLinearCandidates.length,
  },
  osm: {
    exactNameQuery,
    contextQuery,
    exactOverpassAvailable: Boolean(exactOverpass.text),
    contextOverpassAvailable: Boolean(contextOverpass.text),
    exactCandidateCount: exactElements.length,
    exactNamedPhysicalCount: exactNamedPhysical.length,
    exactAreaCandidateCount: exactAreaCandidates.length,
    exactLinearCandidateCount: exactLinearCandidates.length,
    exactNamedPhysical,
    nearbyPromenadeCandidateCount: nearbyPromenadeCandidates.length,
    nearbyPromenadeCandidates: nearbyPromenadeCandidates.slice(0, 30),
    nearbyCoastCandidateCount: nearbyCoastCandidates.length,
    nearbyCoastCandidates: nearbyCoastCandidates.slice(0, 30),
  },
  decision,
  productionModel,
  reason,
  nextAction: decision === 'exact_named_area_candidate_found'
    ? 'Run a source-first production pass after independent scope confirmation.'
    : decision === 'linear_name_candidate_requires_topology_reconciliation'
      ? 'Fetch the exact OSM objects directly and trace endpoint connectivity; determine whether the official Frognerstranda identity is a road, promenade, shoreline or combined linear waterfront before production.'
      : 'Do not promote the legacy marker. Obtain explicit official area geometry or a documented multi-anchor waterfront model.',
};

writeFileSync(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
writeFileSync(`${REPORT_DIR}/README.md`, `# Frognerstranda physical-scope research\n\nDate: 2026-07-24\n\n- Kartverket exact-name rows: ${ssrExactRows.length}\n- Geonorge address rows: ${addressRows.length}\n- Nominatim exact rows: ${nominatimExact.length}\n- exact named OSM physical objects: ${exactNamedPhysical.length}\n- exact named area candidates: ${allAreaCandidates.length}\n- exact named linear candidates: ${allLinearCandidates.length}\n- nearby promenade candidates: ${nearbyPromenadeCandidates.length}\n- nearby coastline/beach candidates: ${nearbyCoastCandidates.length}\n- exact Overpass available: ${Boolean(exactOverpass.text)}\n- context Overpass available: ${Boolean(contextOverpass.text)}\n\nDecision: **${decision}**\n\n${reason}\n\n${summary.nextAction}\n`, 'utf8');

const grep = spawnSync('git', ['grep', '-n', '-F', `"${PLACE_ID}"`, '--', 'data'], { encoding: 'utf8' });
writeFileSync(`${REPORT_DIR}/repo-references.txt`, grep.stdout || '', 'utf8');
console.log(JSON.stringify({ reportDir: REPORT_DIR, decision, kartverketExact: ssrExactRows.length, nominatimExact: nominatimExact.length, exactNamedOsm: exactNamedPhysical.length, exactOverpassAvailable: Boolean(exactOverpass.text) }, null, 2));
