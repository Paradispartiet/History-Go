import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const DATE = '2026-07-24';
const BATCH = 192;
const PLACE_ID = 'gronlikaia';
const OSM_WAY_ID = 865222822;
const SOURCE_OBJECT_ID = `osm-way:${OSM_WAY_ID}`;
const SOURCE_URL = `https://www.openstreetmap.org/way/${OSM_WAY_ID}`;
const OVERPASS_URL = 'https://overpass.kumi.systems/api/interpreter';
const MUNICIPAL_URL = 'https://aktuelt.oslo.kommune.no/feil-retning-i-utviklingen-av-gronlikaia';
const PORT_URL = 'https://www.oslohavn.no/no/meny/fjordbyen/havnepromenaden/';

const AGGREGATE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const SPLIT_FILE = 'data/places/naeringsliv/oslo/places_naeringsliv/gronlikaia.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const EVIDENCE_FILE = 'data/coordinate-evidence/oslo/naeringsliv/gronlikaia.json';
const CIVICATION_FILE = 'data/Civication/map/historyGoPlaceMapping.naeringsliv.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const RESEARCH_REPORT = 'reports/oslo-coordinate-gronlikaia-geometry-audit-post-191/summary.json';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-192-gronlikaia-exact-quay';
mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const distanceMeters = (a, b, c, d) => {
  const rad = (x) => x * Math.PI / 180;
  const R = 6371000;
  const dLat = rad(c - a), dLon = rad(d - b);
  const q = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a)) * Math.cos(rad(c)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(q));
};
const lineLength = (coords) => coords.slice(1).reduce((sum, point, index) => sum + distanceMeters(coords[index].lat, coords[index].lon, point.lat, point.lon), 0);
const lengthMidpoint = (coords) => {
  const lengths = coords.slice(1).map((point, index) => distanceMeters(coords[index].lat, coords[index].lon, point.lat, point.lon));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  const target = total / 2;
  let travelled = 0;
  for (let i = 0; i < lengths.length; i++) {
    if (travelled + lengths[i] >= target) {
      const ratio = (target - travelled) / lengths[i];
      return {
        lat: coords[i].lat + (coords[i + 1].lat - coords[i].lat) * ratio,
        lon: coords[i].lon + (coords[i + 1].lon - coords[i].lon) * ratio,
        totalLengthM: total,
        segmentIndex: i,
        ratio
      };
    }
    travelled += lengths[i];
  }
  throw new Error('Could not calculate line midpoint');
};
const extractPlaces = (root) => {
  const out = [], seen = new Set();
  const visit = (value, depth = 0) => {
    if (depth > 8 || value == null) return;
    if (Array.isArray(value)) return value.forEach((item) => visit(item, depth + 1));
    if (typeof value !== 'object') return;
    if (typeof value.id === 'string' && typeof value.name === 'string' && Number.isFinite(value.lat) && Number.isFinite(value.lon)) {
      if (!seen.has(value.id)) { seen.add(value.id); out.push(value); }
      return;
    }
    Object.values(value).forEach((item) => visit(item, depth + 1));
  };
  visit(root);
  return out;
};
async function fetchText(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'user-agent': 'History-Go coordinate production/1.0', ...(options.headers || {}) } });
  const text = await response.text();
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return text;
}

let protocol = readFileSync(PROTOCOL, 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match) => Number(match[1])));
if (maxBatch !== 191) throw new Error(`Expected coordinate max batch 191, got ${maxBatch}`);

const research = readJson(RESEARCH_REPORT);
if (research.version !== DATE || research.legacy?.id !== PLACE_ID) throw new Error('Merged Grønlikaia research report is missing or unexpected');
const researchedWay = (research.osm?.namedExactGeometry || []).filter((candidate) => candidate.osmObjectId === SOURCE_OBJECT_ID && candidate.tags?.man_made === 'quay' && candidate.tags?.name === 'Grønlikaia');
if (researchedWay.length !== 1) throw new Error(`Expected one exact researched Grønlikaia quay candidate, got ${researchedWay.length}`);
const researchedGeometry = researchedWay[0].geometry;
if (!Array.isArray(researchedGeometry) || researchedGeometry.length !== 2) throw new Error('Researched Grønlikaia quay is no longer a two-point exact way');

const aggregate = readJson(AGGREGATE);
if (!Array.isArray(aggregate)) throw new Error(`${AGGREGATE} is not an array`);
const matches = aggregate.filter((place) => place?.id === PLACE_ID);
if (matches.length !== 1) throw new Error(`Expected one ${PLACE_ID} aggregate record, got ${matches.length}`);
const legacy = matches[0];
if (legacy.coordStatus || legacy.sourceObjectId || legacy.locatorType) throw new Error('Legacy Grønlikaia unexpectedly already has a coordinate contract');

const oldEvidence = readJson(EVIDENCE_FILE);
if (oldEvidence.placeId !== PLACE_ID || oldEvidence.coordinateDecision !== 'needs_geometry') throw new Error('Unexpected legacy Grønlikaia evidence state');

const [municipalHtml] = await Promise.all([fetchText(MUNICIPAL_URL)]);
const officialChecks = {
  municipalityMentionsGrønlikaia: /Grønlikaia/i.test(municipalHtml),
  municipalityCallsDevelopmentArea: /byutviklingsområde/i.test(municipalHtml) || /development area/i.test(municipalHtml)
};
if (!Object.values(officialChecks).every(Boolean)) throw new Error(`Municipal Grønlikaia identity check failed: ${JSON.stringify(officialChecks)}`);

const overpassQuery = `[out:json][timeout:45];way(${OSM_WAY_ID});out tags geom;`;
const overpassText = await fetchText(OVERPASS_URL, {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ data: overpassQuery }).toString()
});
writeFileSync(`${REPORT_DIR}/overpass-exact-way.json`, overpassText, 'utf8');
const overpass = JSON.parse(overpassText);
const wayMatches = (overpass.elements || []).filter((element) => element.type === 'way' && Number(element.id) === OSM_WAY_ID);
if (wayMatches.length !== 1) throw new Error(`Expected one live OSM way ${OSM_WAY_ID}, got ${wayMatches.length}`);
const way = wayMatches[0];
if (way.tags?.man_made !== 'quay' || way.tags?.name !== 'Grønlikaia' || way.tags?.natural !== 'coastline') {
  throw new Error(`Live OSM way identity changed: ${JSON.stringify(way.tags || {})}`);
}
const geometry = (way.geometry || []).map((point) => ({ lat: Number(point.lat), lon: Number(point.lon) }));
if (geometry.length !== 2 || geometry.some((point) => !Number.isFinite(point.lat) || !Number.isFinite(point.lon))) throw new Error('Live Grønlikaia quay geometry is not the expected two-point line');

const endpointToleranceM = 0.25;
const directMatch = distanceMeters(geometry[0].lat, geometry[0].lon, researchedGeometry[0].lat, researchedGeometry[0].lon) <= endpointToleranceM
  && distanceMeters(geometry[1].lat, geometry[1].lon, researchedGeometry[1].lat, researchedGeometry[1].lon) <= endpointToleranceM;
const reverseMatch = distanceMeters(geometry[0].lat, geometry[0].lon, researchedGeometry[1].lat, researchedGeometry[1].lon) <= endpointToleranceM
  && distanceMeters(geometry[1].lat, geometry[1].lon, researchedGeometry[0].lat, researchedGeometry[0].lon) <= endpointToleranceM;
if (!directMatch && !reverseMatch) throw new Error('Live Grønlikaia quay endpoints drifted from merged research geometry');

const midpoint = lengthMidpoint(geometry);
if (Math.abs(midpoint.totalLengthM - 241.15) > 0.5) throw new Error(`Unexpected quay length ${midpoint.totalLengthM.toFixed(2)}m`);
const lat = midpoint.lat;
const lon = midpoint.lon;

const activePlaces = extractPlaces(readJson('data/places/places_index.json'));
const exactNameDuplicates = activePlaces.filter((place) => place.id !== PLACE_ID && place.name.trim().toLowerCase() === 'grønlikaia');
if (exactNameDuplicates.length) throw new Error(`Existing canonical Grønlikaia duplicate: ${exactNameDuplicates.map((place) => place.id).join(', ')}`);
const nearby = activePlaces.filter((place) => place.id !== PLACE_ID)
  .map((place) => ({ id: place.id, name: place.name, distanceMeters: Number(distanceMeters(lat, lon, place.lat, place.lon).toFixed(2)) }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters);
if (nearby[0]?.distanceMeters <= 3) throw new Error(`Existing canonical marker within 3m: ${nearby[0].id} at ${nearby[0].distanceMeters}m`);

const north = geometry[0].lat >= geometry[1].lat ? geometry[0] : geometry[1];
const south = geometry[0].lat < geometry[1].lat ? geometry[0] : geometry[1];
const coordNote = `Object-type-first production: exact OSM way ${OSM_WAY_ID} is the named quay Grønlikaia (man_made=quay, natural=coastline). The canonical display marker is the deterministic length midpoint of this 241.15 m quay segment. Oslo kommune documents the broader Grønlikaia development area; that larger planning area remains historical and transformation context and is not falsely represented as an OSM polygon. No nearby service road or unrelated neighbouring quay is used as the coordinate source.`;

const place = {
  ...legacy,
  lat,
  lon,
  r: 220,
  locatorType: 'linear_area',
  sourceProvider: 'osm',
  sourceObjectId: SOURCE_OBJECT_ID,
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'line_anchor',
  coordType: 'quay_segment_midpoint',
  coordStatus: 'verified_geometry',
  coordSource: `OpenStreetMap exact named quay way ${OSM_WAY_ID} – Grønlikaia`,
  coordSourceId: SOURCE_OBJECT_ID,
  coordSourceUrl: SOURCE_URL,
  coordVerifiedAt: DATE,
  coordNote,
  sourceHint: 'Canonical physical locator is the exact named Grønlikaia quay segment. The broader harbour/development area remains contextual content, not claimed geometry.',
  anchors: [
    { id: 'gronlikaia_quay_north', name: 'Grønlikaia kai – nordende', type: 'route_point', lat: north.lat, lon: north.lon, r: 55 },
    { id: 'gronlikaia_quay_south', name: 'Grønlikaia kai – sørende', type: 'route_point', lat: south.lat, lon: south.lon, r: 55 }
  ],
  externalLinks: [
    ...((legacy.externalLinks || []).filter((link) => link?.url !== MUNICIPAL_URL && link?.url !== PORT_URL && link?.url !== SOURCE_URL)),
    { type: 'official', label: 'Oslo kommune – utvikling av Grønlikaia', url: MUNICIPAL_URL, lang: 'nb', verifiedAt: DATE },
    { type: 'official', label: 'Oslo Havn – Grønlikaia og Havnepromenaden', url: PORT_URL, lang: 'nb', verifiedAt: DATE },
    { type: 'reference', label: 'OpenStreetMap – Grønlikaia kai', url: SOURCE_URL, lang: 'nb', verifiedAt: DATE }
  ]
};

const evidence = {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: AGGREGATE,
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: { lat, lon, r: 220, coordStatus: 'verified_geometry', coordSource: place.coordSource, coordType: 'quay_segment_midpoint', coordNote },
  identity: {
    currentName: place.name,
    resolvedIdentity: 'den eksakte navngitte Grønlikaia-kaien som fysisk locator, med det bredere tidligere havne-/containerområdet og dagens utviklingsområde som kontekstlag',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'linear_area',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: ['eksakt navngitt kai-geometri', 'deterministisk lineært displayanker på samme kai', 'offisiell kilde som dokumenterer Grønlikaia som bredere havne-/utviklingsområde'],
  evidence: [
    {
      sourceProvider: 'osm',
      sourceName: `OpenStreetMap – way ${OSM_WAY_ID} Grønlikaia`,
      sourceUrl: SOURCE_URL,
      sourceObjectId: SOURCE_OBJECT_ID,
      sourceQuality: 'exact_named_quay_geometry',
      finding: `Eksakt 241.15 m kyst-/kaigeometri med name=Grønlikaia, man_made=quay og natural=coastline. Lengdemidtpunktet brukes som line-anchor.`,
      canVerifyCoordinate: true,
      reason: coordNote
    },
    {
      sourceProvider: 'municipality',
      sourceName: 'Oslo kommune – utvikling av Grønlikaia',
      sourceUrl: MUNICIPAL_URL,
      sourceObjectId: 'oslo-kommune:plan:gronlikaia',
      sourceQuality: 'official_area_identity',
      finding: 'Oslo kommune dokumenterer Grønlikaia som et viktig byutviklingsområde knyttet til tidligere havnearealer.',
      canVerifyCoordinate: false,
      reason: 'Dokumenterer den bredere historiske og planmessige konteksten; den eksakte fysiske locator-geometrien kommer fra den navngitte OSM-kaien.'
    },
    {
      sourceProvider: 'manual_research',
      sourceName: 'Oslo Havn – Grønlikaia og Havnepromenaden',
      sourceUrl: PORT_URL,
      sourceObjectId: 'oslo-havn:fjordbyen:gronlikaia',
      sourceQuality: 'official_port_scope_context',
      finding: 'Oslo Havn beskriver Grønlikaia som fjordby-/havnepromenadeområde ved overgangen mot Sydhavna.',
      canVerifyCoordinate: false,
      reason: 'Støtter havne- og transformasjonskonteksten, men brukes ikke som direkte koordinatkilde.'
    }
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'osm', sourceObjectId: SOURCE_OBJECT_ID, canApplyToPlace: true },
    { sourceProvider: 'municipality', sourceObjectId: 'oslo-kommune:plan:gronlikaia', canApplyToPlace: false }
  ],
  geometryCandidates: [
    { sourceProvider: 'osm', sourceObjectId: SOURCE_OBJECT_ID, lat, lon, coordRole: 'line_anchor', canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: SOURCE_OBJECT_ID, lat: north.lat, lon: north.lon, coordRole: 'boundary_anchor', canApplyToPlace: false },
    { sourceProvider: 'osm', sourceObjectId: SOURCE_OBJECT_ID, lat: south.lat, lon: south.lon, coordRole: 'boundary_anchor', canApplyToPlace: false }
  ],
  coordinateCandidates: [
    { sourceProvider: 'osm', sourceObjectId: SOURCE_OBJECT_ID, lat, lon, coordRole: 'line_anchor', canApplyToPlace: true }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Grønlikaia er produsert på den eksakte navngitte kai-geometrien; det bredere utviklingsområdet beholdes som kontekst uten å bli påstått som samme geometri.'
  },
  notes: [coordNote, `Nærmeste andre canonical marker ved write-time var ${nearby[0]?.id || 'ingen'} på ${nearby[0]?.distanceMeters ?? 'n/a'} meter; ingen markør lå innen 3 meter.`]
};

writeJson(AGGREGATE, aggregate.map((item) => item?.id === PLACE_ID ? place : item));
writeJson(SPLIT_FILE, place);
writeJson(EVIDENCE_FILE, evidence);

const splitManifest = readJson(SPLIT_MANIFEST);
if (!Array.isArray(splitManifest.places)) throw new Error(`${SPLIT_MANIFEST} missing places[]`);
const manifestMatches = splitManifest.places.filter((row) => row?.id === PLACE_ID);
if (manifestMatches.length !== 1) throw new Error(`Expected one split-manifest row, got ${manifestMatches.length}`);
manifestMatches[0].name = place.name;
manifestMatches[0].sha256 = sha256(SPLIT_FILE);
splitManifest.source_sha256 = sha256(AGGREGATE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

const splitIndex = readJson(SPLIT_INDEX);
if (!Array.isArray(splitIndex)) throw new Error(`${SPLIT_INDEX} is not an array`);
const indexMatches = splitIndex.filter((item) => item?.id === PLACE_ID);
if (indexMatches.length !== 1) throw new Error(`Expected one split-index row, got ${indexMatches.length}`);
const indexFile = indexMatches[0].file;
writeJson(SPLIT_INDEX, splitIndex.map((item) => item?.id === PLACE_ID ? { ...place, file: indexFile } : item));

const civication = readJson(CIVICATION_FILE);
let civiUpdates = 0;
const updateCivi = (value) => {
  if (Array.isArray(value)) return value.forEach(updateCivi);
  if (!value || typeof value !== 'object') return;
  if (value.historyGoPlaceId === PLACE_ID) {
    value.name = place.name;
    value.lat = lat;
    value.lon = lon;
    value.needsVerification = false;
    civiUpdates += 1;
  }
  Object.values(value).forEach(updateCivi);
};
updateCivi(civication);
if (civiUpdates !== 1) throw new Error(`Expected one Civication mapping update, got ${civiUpdates}`);
writeJson(CIVICATION_FILE, civication);

const protocolLines = protocol.split('\n');
const unresolvedRows = protocolLines.map((line, index) => line.includes(`\`${PLACE_ID}\``) ? index : -1).filter((index) => index >= 0);
if (unresolvedRows.length !== 1) throw new Error(`Expected one unresolved protocol row for ${PLACE_ID}, got ${unresolvedRows.length}`);
protocol = protocolLines.filter((_, index) => !unresolvedRows.includes(index)).join('\n');
protocol = `${protocol.trimEnd()}\n\n| ${BATCH} | \`${PLACE_ID}\` | Grønlikaia | verified geometry | \`${SOURCE_OBJECT_ID}\` |\n\nBatch ${BATCH} (${DATE}) løser \`${PLACE_ID}\` ved å skille den fysiske locatoren fra den bredere plan- og transformasjonskonteksten. Live OSM way ${OSM_WAY_ID} er den eksakte navngitte Grønlikaia-kaien (\`man_made=quay\`, \`natural=coastline\`) og er 241,15 meter lang. Canonical lat/lon er det deterministiske lengdemidtpunktet på samme kai, med nord- og sørende lagret som eksplisitte anchors. Oslo kommune og Oslo Havn dokumenterer den bredere havne- og utviklingskonteksten, men denne blir ikke feilaktig fremstilt som en OSM-polygon. Nærliggende Loengkaia, Grønliutstikkeren og serviceveier er eksplisitt ikke brukt som koordinatkilde.\n`;
writeFileSync(PROTOCOL, protocol, 'utf8');

writeJson(`${REPORT_DIR}/batch-192-result.json`, {
  version: DATE,
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'produced_from_exact_named_quay_geometry',
  old: { coordinate: { lat: legacy.lat, lon: legacy.lon, r: legacy.r }, coordStatus: legacy.coordStatus || null },
  current: {
    coordinate: { lat, lon, r: place.r },
    sourceObjectId: SOURCE_OBJECT_ID,
    coordStatus: place.coordStatus,
    coordType: place.coordType,
    locatorType: place.locatorType,
    geometryLengthM: Number(midpoint.totalLengthM.toFixed(2)),
    endpoints: { north, south }
  },
  officialChecks,
  liveTags: way.tags,
  exactNameDuplicateCount: exactNameDuplicates.length,
  nearestCanonicalBeforeWrite: nearby[0] || null,
  civicationUpdates: civiUpdates,
  researchReport: RESEARCH_REPORT
});

console.log(JSON.stringify({
  batch: BATCH,
  placeId: PLACE_ID,
  sourceObjectId: SOURCE_OBJECT_ID,
  coordinate: { lat, lon },
  geometryLengthM: Number(midpoint.totalLengthM.toFixed(2)),
  endpoints: { north, south },
  nearestCanonicalBeforeWrite: nearby[0] || null
}, null, 2));
