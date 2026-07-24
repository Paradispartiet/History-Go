import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const DATE = '2026-07-24';
const BATCH = 195;
const PLACE_ID = 'frognerstranda';
const OFFICIAL_URL = 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/frognerstranda/';
const SOURCE_OBJECT_ID = 'oslo-kommune:frognerstranda:embedded-geojson-line';
const REPORT_DIR = 'reports/oslo-coordinate-control-batch-195-frognerstranda-official-line';
const SPLIT_PATH = 'data/places/popkultur/oslo/places_oslo_populaerkultur/frognerstranda.json';
const AGGREGATE_PATH = 'data/places/popkultur/oslo/places_oslo_populaerkultur.json';
const CATEGORY_INDEX_PATH = 'data/places/popkultur/oslo/places_oslo_populaerkultur_index.json';
const EVIDENCE_PATH = 'data/coordinate-evidence/oslo/popkultur/frognerstranda.json';
const CIVICATION_PATH = 'data/Civication/map/historyGoPlaceMapping.popkultur.json';
const PROTOCOL_PATH = 'docs/coordinates/coordinate-control-protocol.md';

const EXPECTED_LINE = [
  [10.687466, 59.917656],
  [10.689268, 59.918],
  [10.690899, 59.917183],
  [10.692959, 59.915634],
  [10.696049, 59.915419],
  [10.698195, 59.914558],
  [10.700169, 59.913181],
  [10.704889, 59.910255],
  [10.706091, 59.910513],
  [10.707378, 59.910298],
  [10.707293, 59.909997],
  [10.70858, 59.909825]
];
const EXPECTED_MAP_POINT = [10.694761, 59.915451];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function decodeHtmlAttribute(value) {
  return value
    .replaceAll('&quot;', '"')
    .replaceAll('&#34;', '"')
    .replaceAll('&amp;', '&')
    .replaceAll('&#39;', "'")
    .replaceAll('&#x27;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function normalizeText(value) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&aring;', 'å')
    .replaceAll('&oslash;', 'ø')
    .replaceAll('&aelig;', 'æ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function haversineMeters(a, b) {
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const radius = 6371000;
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const dPhi = (lat2 - lat1) * Math.PI / 180;
  const dLambda = (lon2 - lon1) * Math.PI / 180;
  const h = Math.sin(dPhi / 2) ** 2
    + Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLambda / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function lineLengthAndMidpoint(coordinates) {
  const lengths = [];
  let total = 0;
  for (let i = 0; i < coordinates.length - 1; i += 1) {
    const length = haversineMeters(coordinates[i], coordinates[i + 1]);
    lengths.push(length);
    total += length;
  }
  const target = total / 2;
  let accumulated = 0;
  for (let i = 0; i < lengths.length; i += 1) {
    if (accumulated + lengths[i] >= target) {
      const fraction = (target - accumulated) / lengths[i];
      const [lon1, lat1] = coordinates[i];
      const [lon2, lat2] = coordinates[i + 1];
      return {
        lengthMeters: total,
        segmentIndex: i,
        segmentFraction: fraction,
        midpoint: {
          lat: lat1 + fraction * (lat2 - lat1),
          lon: lon1 + fraction * (lon2 - lon1)
        }
      };
    }
    accumulated += lengths[i];
  }
  throw new Error('Could not derive line midpoint.');
}

function maxCoordinateDrift(actual, expected) {
  assert(actual.length === expected.length, `Official line point count drift: ${actual.length} != ${expected.length}`);
  let max = 0;
  for (let i = 0; i < actual.length; i += 1) {
    assert(Array.isArray(actual[i]) && actual[i].length === 2, `Invalid official coordinate at index ${i}`);
    max = Math.max(max, Math.abs(actual[i][0] - expected[i][0]), Math.abs(actual[i][1] - expected[i][1]));
  }
  return max;
}

function assertLegacyPlace(place) {
  assert(place.id === PLACE_ID, `Unexpected place id: ${place.id}`);
  assert(place.name === 'Frognerstranda', `Unexpected place name: ${place.name}`);
  assert(place.lat === 59.9129 && place.lon === 10.7098 && place.r === 180, 'Legacy coordinate/radius drifted before batch 195.');
  assert(place.coordStatus === 'needs_source', `Unexpected pre-batch coordStatus: ${place.coordStatus}`);
  assert(place.coordType === 'legacy_unverified', `Unexpected pre-batch coordType: ${place.coordType}`);
  assert(place.locatorType === 'natural_area', `Unexpected pre-batch locatorType: ${place.locatorType}`);
}

const protocolBefore = await readFile(PROTOCOL_PATH, 'utf8');
const batchNumbers = [...protocolBefore.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const maxBatch = Math.max(...batchNumbers);
assert(maxBatch === 194, `Batch 195 hard gate failed: protocol max batch is ${maxBatch}, expected 194.`);
assert(protocolBefore.includes('| 194 | `regjeringskvartalet` |'), 'Batch 194 Regjeringskvartalet row is missing.');
assert(!protocolBefore.includes('| 195 |'), 'Batch 195 already exists.');

const [splitPlace, aggregate, categoryIndex, evidence, civication] = await Promise.all([
  readJson(SPLIT_PATH),
  readJson(AGGREGATE_PATH),
  readJson(CATEGORY_INDEX_PATH),
  readJson(EVIDENCE_PATH),
  readJson(CIVICATION_PATH)
]);
assertLegacyPlace(splitPlace);
assert(Array.isArray(aggregate), 'Popkultur aggregate is not an array.');
const aggregateMatches = aggregate.filter((place) => place?.id === PLACE_ID);
assert(aggregateMatches.length === 1, `Expected one aggregate Frognerstranda row, found ${aggregateMatches.length}.`);
assertLegacyPlace(aggregateMatches[0]);
assert(Array.isArray(categoryIndex), 'Popkultur category index is not an array.');
const categoryIndexMatches = categoryIndex.filter((place) => place?.id === PLACE_ID);
assert(categoryIndexMatches.length === 1, `Expected one category-index Frognerstranda row, found ${categoryIndexMatches.length}.`);
assertLegacyPlace(categoryIndexMatches[0]);
assert(evidence.placeId === PLACE_ID, 'Coordinate evidence placeId drifted.');
assert(evidence.evidenceStatus === 'needs_research', `Unexpected evidenceStatus: ${evidence.evidenceStatus}`);
assert(evidence.currentCoordinate?.coordStatus === 'needs_source', 'Evidence is no longer unresolved before batch 195.');

const response = await fetch(OFFICIAL_URL, {
  headers: {
    'user-agent': 'History-Go-coordinate-control/195 (+https://github.com/Paradispartiet/History-Go)',
    accept: 'text/html,application/xhtml+xml'
  }
});
assert(response.ok, `Official Frognerstranda page returned HTTP ${response.status}.`);
const officialHtml = await response.text();
const normalizedOfficialText = normalizeText(officialHtml);
for (const phrase of [
  'den strekker seg fra den innerste delen av frognerkilen og bygdøy i vest, til hjortnes/framnes i øst',
  'frognerstranda er en strandlinje',
  'havnepromenaden',
  'hovedsykkelveien'
]) {
  assert(normalizedOfficialText.includes(phrase), `Official scope phrase missing: ${phrase}`);
}

const geoJsonAttributeMatch = officialHtml.match(/geo-json-text="([^"]+)"/s);
assert(geoJsonAttributeMatch, 'Official page does not expose geo-json-text.');
const officialGeoJson = JSON.parse(decodeHtmlAttribute(geoJsonAttributeMatch[1]));
assert(officialGeoJson.type === 'FeatureCollection', 'Official map payload is not a FeatureCollection.');
const lineFeatures = officialGeoJson.features.filter((feature) => feature?.geometry?.type === 'LineString');
const pointFeatures = officialGeoJson.features.filter((feature) => feature?.geometry?.type === 'Point');
assert(lineFeatures.length === 1, `Expected one official LineString, found ${lineFeatures.length}.`);
assert(pointFeatures.length === 1, `Expected one official map point, found ${pointFeatures.length}.`);
const officialLine = lineFeatures[0].geometry.coordinates;
const officialPoint = pointFeatures[0].geometry.coordinates;
const maxDrift = maxCoordinateDrift(officialLine, EXPECTED_LINE);
assert(maxDrift <= 1e-12, `Official line geometry drifted by ${maxDrift} degrees.`);
assert(Math.abs(officialPoint[0] - EXPECTED_MAP_POINT[0]) <= 1e-12 && Math.abs(officialPoint[1] - EXPECTED_MAP_POINT[1]) <= 1e-12, 'Official map point drifted.');

const derived = lineLengthAndMidpoint(officialLine);
assert(Math.abs(derived.lengthMeters - 1633.6584804355962) < 0.01, `Unexpected official line length: ${derived.lengthMeters}`);
assert(Math.abs(derived.midpoint.lat - 59.91421669534142) < 1e-10, `Unexpected midpoint latitude: ${derived.midpoint.lat}`);
assert(Math.abs(derived.midpoint.lon - 10.698684277702272) < 1e-10, `Unexpected midpoint longitude: ${derived.midpoint.lon}`);

const roundedMidpoint = {
  lat: Number(derived.midpoint.lat.toFixed(12)),
  lon: Number(derived.midpoint.lon.toFixed(12))
};
const anchors = [
  { role: 'west_boundary', lat: officialLine[0][1], lon: officialLine[0][0] },
  { role: 'line_midpoint', lat: roundedMidpoint.lat, lon: roundedMidpoint.lon },
  { role: 'east_boundary', lat: officialLine.at(-1)[1], lon: officialLine.at(-1)[0] }
];
const coordNote = 'Oslo kommune definerer Frognerstranda som en strandlinje fra innerste Frognerkilen/Bygdøy i vest til Hjortnes/Framnes i øst og publiserer samme scope som en maskinlesbar 12-punkts GeoJSON LineString på den offisielle Frognerstranda-siden. Canonical lat/lon er det deterministiske lengdemidtpunktet langs denne kommunale linjen (ca. 1,63 km). Det separate kartpunktet på siden, E18, jernbane, tilfeldige coastline-segmenter og den kortere OSM-fotveien brukes ikke som koordinatproxy.';

const canonicalUpdate = {
  lat: roundedMidpoint.lat,
  lon: roundedMidpoint.lon,
  locatorType: 'linear_area',
  coordStatus: 'verified_geometry',
  sourceProvider: 'municipality',
  sourceObjectId: SOURCE_OBJECT_ID,
  geocodeAccuracy: 'geometric_center',
  coordRole: 'line_anchor',
  coordType: 'official_linear_coastal_zone_midpoint',
  coordSource: 'Oslo kommune – Frognerstranda embedded GeoJSON LineString',
  coordVerifiedAt: DATE,
  geometry: {
    type: 'LineString',
    coordinates: officialLine
  },
  anchors,
  coordNote
};
Object.assign(splitPlace, canonicalUpdate);
Object.assign(aggregateMatches[0], canonicalUpdate);
for (const field of [
  'lat', 'lon', 'r', 'locatorType', 'sourceProvider', 'sourceObjectId',
  'geocodeAccuracy', 'coordRole', 'coordType', 'coordStatus', 'coordSource',
  'coordVerifiedAt', 'coordNote'
]) {
  categoryIndexMatches[0][field] = splitPlace[field];
}

const mappingEntries = Object.values(civication.mappings ?? {}).filter((mapping) => mapping?.historyGoPlaceId === PLACE_ID);
assert(mappingEntries.length === 1, `Expected one Civication Frognerstranda mapping, found ${mappingEntries.length}.`);
mappingEntries[0].lat = roundedMidpoint.lat;
mappingEntries[0].lon = roundedMidpoint.lon;
mappingEntries[0].needsVerification = false;

const officialEvidence = {
  sourceProvider: 'municipality',
  sourceName: 'Oslo kommune – Frognerstranda, Fjordbyen',
  sourceUrl: OFFICIAL_URL,
  sourceObjectId: SOURCE_OBJECT_ID,
  sourceQuality: 'official_exact_linear_scope_geometry',
  finding: 'Oslo kommune defines Frognerstranda as the shoreline from the inner Frognerkilen/Bygdøy in the west to Hjortnes/Framnes in the east and embeds one 12-point GeoJSON LineString covering that full scope.',
  canVerifyCoordinate: true,
  reason: coordNote
};
const rejectedOsmEvidence = {
  sourceProvider: 'osm',
  sourceName: 'OpenStreetMap exact named Frognerstranda footway',
  sourceUrl: 'https://www.openstreetmap.org/way/71423688',
  sourceObjectId: 'osm-way:71423688',
  sourceQuality: 'exact_named_partial_segment_not_primary_geometry',
  finding: 'The exact named 918.4 m footway covers only the western strandpromenade segment and does not reach the official Hjortnes/Framnes boundary.',
  canVerifyCoordinate: false,
  reason: 'A partial OSM footway cannot proxy the full municipal Frognerstranda shoreline. It is retained only as a contextual crosscheck.'
};

Object.assign(evidence, {
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: roundedMidpoint.lat,
    lon: roundedMidpoint.lon,
    r: splitPlace.r,
    coordStatus: 'verified_geometry',
    coordSource: canonicalUpdate.coordSource,
    coordType: canonicalUpdate.coordType,
    coordNote
  },
  identity: {
    currentName: 'Frognerstranda',
    resolvedIdentity: 'Frognerstranda som den kommunalt avgrensede lineære strandsonen fra Frognerkilen/Bygdøy til Hjortnes/Framnes',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'linear_area',
    requiresSplit: false,
    splitReason: ''
  },
  requiredEvidence: [
    'offisiell maskinsporbar geometri for hele Frognerstranda-scope-et',
    'offisiell vest- og østgrense for strandsonen',
    'deterministisk line-anchor avledet fra samme geometri'
  ],
  evidence: [officialEvidence, rejectedOsmEvidence],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'municipality', sourceObjectId: SOURCE_OBJECT_ID, canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:71423688', canApplyToPlace: false }
  ],
  geometryCandidates: [
    {
      sourceProvider: 'municipality',
      sourceObjectId: SOURCE_OBJECT_ID,
      geometryType: 'LineString',
      pointCount: officialLine.length,
      lengthMeters: Number(derived.lengthMeters.toFixed(2)),
      westBoundary: anchors[0],
      eastBoundary: anchors[2],
      canApplyToPlace: true
    }
  ],
  coordinateCandidates: [
    {
      lat: roundedMidpoint.lat,
      lon: roundedMidpoint.lon,
      coordRole: 'line_anchor',
      sourceObjectId: SOURCE_OBJECT_ID,
      derivation: 'geodesic_length_midpoint',
      canApplyToPlace: true
    }
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'The official municipal line geometry and deterministic midpoint are applied to canonical Frognerstranda.'
  },
  notes: [
    coordNote,
    'The official page also embeds a separate point at 59.915451, 10.694761; batch 195 does not use that point because the full LineString provides the stronger canonical geometry.',
    'OSM way 71423688 remains a partial western crosscheck and is not the primary source object.'
  ]
});

const protocolAddition = `\n\n| 195 | \`frognerstranda\` | Frognerstranda | verified_geometry | \`${SOURCE_OBJECT_ID}\` |\n\nBatch 195 (${DATE}) løser Frognerstranda som den brede lineære strandsonen Oslo kommune selv avgrenser fra den innerste delen av Frognerkilen/Bygdøy i vest til Hjortnes/Framnes i øst. Kommunens offisielle Frognerstranda-side eksponerer dette scope-et som én maskinlesbar GeoJSON LineString med 12 punkter og en lengde på ca. 1,63 km. Canonical lat/lon er det deterministiske lengdemidtpunktet langs samme kommunale linje. Locator-typen korrigeres fra \`natural_area\` til \`linear_area\`. Det separate kartpunktet på nettsiden, E18, jernbane, tilfeldige coastline-segmenter og den kortere eksakt navngitte OSM-fotveien brukes ikke som proxy for hele strandsonen; legacy-punktet og nearest/first-hit brukes ikke.\n`;

await mkdir(REPORT_DIR, { recursive: true });
const officialPageSha256 = createHash('sha256').update(officialHtml).digest('hex');
const summary = {
  version: DATE,
  batch: BATCH,
  placeId: PLACE_ID,
  source: {
    provider: 'Oslo kommune',
    url: OFFICIAL_URL,
    sourceObjectId: SOURCE_OBJECT_ID,
    httpStatus: response.status,
    pageSha256: officialPageSha256
  },
  officialScope: {
    westBoundary: 'inner Frognerkilen and Bygdøy',
    eastBoundary: 'Hjortnes/Framnes',
    identity: 'linear coastal zone / shoreline'
  },
  geometry: {
    type: 'LineString',
    pointCount: officialLine.length,
    coordinates: officialLine,
    maxPinnedCoordinateDriftDegrees: maxDrift,
    lengthMeters: Number(derived.lengthMeters.toFixed(2)),
    midpoint: roundedMidpoint,
    midpointSegmentIndex: derived.segmentIndex,
    midpointSegmentFraction: derived.segmentFraction,
    officialMapPointNotUsed: { lat: officialPoint[1], lon: officialPoint[0] }
  },
  previousCoordinate: { lat: 59.9129, lon: 10.7098, r: 180 },
  appliedCoordinate: { ...roundedMidpoint, r: 180 },
  locatorType: 'linear_area',
  coordinateStatus: 'verified_geometry',
  rejectedPrimaryProxies: ['osm-way:71423688', 'E18', 'railway', 'arbitrary coastline segment', 'official standalone map point'],
  decision: 'apply_official_municipal_line_as_batch_195'
};

await Promise.all([
  writeJson(SPLIT_PATH, splitPlace),
  writeJson(AGGREGATE_PATH, aggregate),
  writeJson(CATEGORY_INDEX_PATH, categoryIndex),
  writeJson(EVIDENCE_PATH, evidence),
  writeJson(CIVICATION_PATH, civication),
  writeFile(PROTOCOL_PATH, `${protocolBefore.trimEnd()}${protocolAddition}`, 'utf8'),
  writeJson(`${REPORT_DIR}/official-frognerstranda.geojson`, officialGeoJson),
  writeJson(`${REPORT_DIR}/summary.json`, summary),
  writeFile(`${REPORT_DIR}/README.md`, `# Coordinate batch 195 – Frognerstranda\n\n- source: Oslo kommune, official Frognerstranda/Fjordbyen page\n- official geometry: one 12-point GeoJSON LineString\n- official scope: inner Frognerkilen/Bygdøy → Hjortnes/Framnes\n- line length: ${summary.geometry.lengthMeters} m\n- canonical line midpoint: ${roundedMidpoint.lat}, ${roundedMidpoint.lon}\n- locator type: \`linear_area\`\n- status: \`verified_geometry\`\n- OSM way 71423688: retained only as a partial western crosscheck\n- legacy point / nearest / first-hit: not used\n`, 'utf8')
]);

console.log(JSON.stringify(summary, null, 2));
