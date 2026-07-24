import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const root = process.cwd();
const BATCH = 195;
const PREVIOUS_BATCH = 194;
const PLACE_ID = 'frognerstranda';
const VERIFIED_AT = '2026-07-24';
const OFFICIAL_URL = 'https://www.oslo.kommune.no/slik-bygger-vi-oslo/fjordbyen/frognerstranda/';
const SOURCE_OBJECT_ID = 'oslo-kommune:fjordbyen:frognerstranda:official-page-geojson';
const EXPECTED_POINT = [10.694761, 59.915451];
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
  [10.70858, 59.909825],
];

const paths = {
  aggregate: join(root, 'data/places/popkultur/oslo/places_oslo_populaerkultur.json'),
  splitDir: join(root, 'data/places/popkultur/oslo/places_oslo_populaerkultur'),
  splitChild: join(root, 'data/places/popkultur/oslo/places_oslo_populaerkultur/frognerstranda.json'),
  splitManifest: join(root, 'data/places/popkultur/oslo/places_oslo_populaerkultur_manifest.json'),
  splitIndex: join(root, 'data/places/popkultur/oslo/places_oslo_populaerkultur_index.json'),
  globalIndex: join(root, 'data/places/places_index.json'),
  evidence: join(root, 'data/coordinate-evidence/oslo/popkultur/frognerstranda.json'),
  civication: join(root, 'data/Civication/map/historyGoPlaceMapping.popkultur.json'),
  protocol: join(root, 'docs/coordinates/coordinate-control-protocol.md'),
  centralAudit: join(root, 'reports/oslo-coordinate-central-unresolved-audit-post-194/summary.json'),
  reportDir: join(root, 'reports/oslo-coordinate-control-batch-195-frognerstranda-official-geojson'),
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function decodeHtml(value) {
  return String(value)
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&amp;|&#38;/gi, '&')
    .replace(/&lt;|&#60;/gi, '<')
    .replace(/&gt;|&#62;/gi, '>')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&aring;|&#229;/gi, 'å')
    .replace(/&oslash;|&#248;/gi, 'ø')
    .replace(/&aelig;|&#230;/gi, 'æ');
}

function normalizeText(html) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchOfficialPage() {
  const response = await fetch(OFFICIAL_URL, {
    redirect: 'follow',
    headers: {
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
      'accept-language': 'nb-NO,nb;q=0.9,en;q=0.8',
      accept: 'text/html,*/*;q=0.8',
    },
  });
  assert(response.ok, `Official Frognerstranda page failed ${response.status} ${response.statusText}.`);
  const html = await response.text();
  return {
    html,
    status: response.status,
    finalUrl: response.url,
    contentType: response.headers.get('content-type') ?? '',
  };
}

function parseOfficialGeoJson(html) {
  const attributes = [...html.matchAll(/geo-json-text="([^"]+)"/gi)].map((match) => match[1]);
  assert(attributes.length === 1, `Expected one official geo-json-text attribute, got ${attributes.length}.`);
  const decoded = decodeHtml(attributes[0]);
  const collection = JSON.parse(decoded);
  assert(collection?.type === 'FeatureCollection', 'Official map payload is not a FeatureCollection.');
  const points = collection.features.filter((feature) => feature?.geometry?.type === 'Point');
  const lines = collection.features.filter((feature) => feature?.geometry?.type === 'LineString');
  assert(points.length === 1, `Expected one official Point feature, got ${points.length}.`);
  assert(lines.length === 1, `Expected one official LineString feature, got ${lines.length}.`);
  return { collection, point: points[0], line: lines[0] };
}

function assertCoordinate(actual, expected, label, tolerance = 1e-9) {
  assert(Array.isArray(actual) && actual.length >= 2, `${label} is not a coordinate.`);
  assert(Math.abs(actual[0] - expected[0]) <= tolerance && Math.abs(actual[1] - expected[1]) <= tolerance,
    `${label} drifted: ${JSON.stringify(actual)} vs ${JSON.stringify(expected)}.`);
}

function assertLine(actual, expected) {
  assert(Array.isArray(actual), 'Official line coordinates are missing.');
  assert(actual.length === expected.length, `Official line point count changed: ${actual.length} vs ${expected.length}.`);
  for (let index = 0; index < expected.length; index += 1) {
    assertCoordinate(actual[index], expected[index], `Official line point ${index}`);
  }
}

function haversineMeters(a, b) {
  const R = 6371008.8;
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function lineLengthMeters(coordinates) {
  let total = 0;
  for (let index = 1; index < coordinates.length; index += 1) {
    total += haversineMeters(
      { lon: coordinates[index - 1][0], lat: coordinates[index - 1][1] },
      { lon: coordinates[index][0], lat: coordinates[index][1] },
    );
  }
  return total;
}

function closestPointDistanceMeters(pointCoordinate, lineCoordinates) {
  const refLat = pointCoordinate[1] * Math.PI / 180;
  const metersPerLat = 111132;
  const metersPerLon = 111320 * Math.cos(refLat);
  const toXY = ([lon, lat]) => ({ x: (lon - pointCoordinate[0]) * metersPerLon, y: (lat - pointCoordinate[1]) * metersPerLat });
  let minimum = Number.POSITIVE_INFINITY;
  for (let index = 1; index < lineCoordinates.length; index += 1) {
    const a = toXY(lineCoordinates[index - 1]);
    const b = toXY(lineCoordinates[index]);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const denominator = dx * dx + dy * dy;
    const t = denominator === 0 ? 0 : Math.max(0, Math.min(1, -(a.x * dx + a.y * dy) / denominator));
    const x = a.x + t * dx;
    const y = a.y + t * dy;
    minimum = Math.min(minimum, Math.hypot(x, y));
  }
  return minimum;
}

function lightIndexRow(place) {
  const row = {
    id: place.id,
    name: place.name ?? null,
    category: place.category ?? null,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    year: place.year ?? null,
    coordStatus: place.coordStatus ?? null,
    coordType: place.coordType ?? null,
    locatorType: place.locatorType ?? null,
    sourceProvider: place.sourceProvider ?? null,
    sourceObjectId: place.sourceObjectId ?? null,
    geocodeAccuracy: place.geocodeAccuracy ?? null,
    coordRole: place.coordRole ?? null,
    coordSource: place.coordSource ?? null,
    coordSourceId: place.coordSourceId ?? null,
    coordSourceUrl: place.coordSourceUrl ?? null,
    coordVerifiedAt: place.coordVerifiedAt ?? null,
    coordNote: place.coordNote ?? null,
    file: `places_oslo_populaerkultur/${place.id}.json`,
  };
  if (place.address !== undefined) row.address = place.address;
  return row;
}

async function rebuildSplit(places) {
  const source = `${JSON.stringify(places, null, 2)}\n`;
  await writeFile(paths.aggregate, source, 'utf8');
  const manifestRows = [];
  const indexRows = [];
  for (let index = 0; index < places.length; index += 1) {
    const place = places[index];
    const content = `${JSON.stringify(place, null, 2)}\n`;
    const filename = `${place.id}.json`;
    await writeFile(join(paths.splitDir, filename), content, 'utf8');
    manifestRows.push({
      id: place.id,
      name: place.name ?? null,
      category: place.category ?? null,
      file: `places_oslo_populaerkultur/${filename}`,
      order: index,
      sha256: sha256(content),
    });
    indexRows.push(lightIndexRow(place));
  }
  await writeJson(paths.splitManifest, {
    version: 'places_oslo_populaerkultur_split_v1',
    source_file: 'places_oslo_populaerkultur.json',
    source_path: 'data/places/popkultur/oslo/places_oslo_populaerkultur.json',
    source_sha256: sha256(source),
    generated_at: new Date().toISOString(),
    place_count: places.length,
    layout: {
      place_files_dir: 'places_oslo_populaerkultur/',
      one_file_per_place: true,
      filename_rule: '<place.id>.json',
      manifest_preserves_original_order: true,
      original_aggregate_left_unchanged: true,
    },
    places: manifestRows,
  });
  await writeJson(paths.splitIndex, indexRows);
}

const [aggregate, splitChild, evidence, civication, protocol, centralAudit, globalIndex, official] = await Promise.all([
  readJson(paths.aggregate),
  readJson(paths.splitChild),
  readJson(paths.evidence),
  readJson(paths.civication),
  readFile(paths.protocol, 'utf8'),
  readJson(paths.centralAudit),
  readJson(paths.globalIndex),
  fetchOfficialPage(),
]);

assert(Array.isArray(aggregate), 'Popkultur aggregate must be an array.');
const placeMatches = aggregate.filter((entry) => entry.id === PLACE_ID);
assert(placeMatches.length === 1, `Expected one aggregate ${PLACE_ID}, got ${placeMatches.length}.`);
const place = placeMatches[0];
assert(JSON.stringify(place) === JSON.stringify(splitChild), 'Aggregate and split child differ before batch 195.');
assert(place.coordStatus === 'needs_source', `Expected needs_source, got ${place.coordStatus}.`);
assert(place.coordType === 'legacy_unverified', `Expected legacy_unverified, got ${place.coordType}.`);
assert(place.locatorType === 'natural_area', `Expected legacy natural_area, got ${place.locatorType}.`);
assert(Math.abs(place.lat - 59.9129) < 1e-10 && Math.abs(place.lon - 10.7098) < 1e-10, 'Legacy coordinate changed before batch 195.');
assert(evidence.placeId === PLACE_ID && evidence.evidenceStatus === 'needs_research' && evidence.coordinateDecision === 'needs_geometry', 'Evidence is no longer in unresolved geometry state.');
assert(centralAudit.coordinateMaxBatch === PREVIOUS_BATCH, 'Central unresolved audit is not post-194.');
assert(centralAudit.queue?.some((entry) => entry.placeId === PLACE_ID), 'Frognerstranda is no longer in the post-194 central queue.');

const batchNumbers = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(Math.max(...batchNumbers) === PREVIOUS_BATCH, `Protocol max batch is ${Math.max(...batchNumbers)}, expected ${PREVIOUS_BATCH}.`);
assert(!protocol.includes(`| ${BATCH} |`), `Protocol already contains batch ${BATCH}.`);
assert(protocol.includes('| 194 | `regjeringskvartalet` |'), 'Protocol does not contain batch 194 Regjeringskvartalet.');

assert(official.finalUrl === OFFICIAL_URL, `Official URL redirected unexpectedly: ${official.finalUrl}.`);
const officialText = normalizeText(official.html);
const officialChecks = {
  title: officialText.includes('Frognerstranda'),
  shoreline: officialText.includes('Frognerstranda er en strandlinje sør i bydel Frogner i Oslo.'),
  westEast: officialText.includes('Den strekker seg fra den innerste delen av Frognerkilen og Bygdøy i vest, til Hjortnes/Framnes i øst.'),
  westernFjordbyen: officialText.includes('Det inngår også som det vestligste delområdet av Fjordbyen.'),
  harbourPromenade: /havnepromenaden/i.test(officialText),
  mainCycleRoute: /hovedsykkelveien/i.test(officialText),
};
assert(Object.values(officialChecks).every(Boolean), `Official text scope gate failed: ${JSON.stringify(officialChecks)}.`);

const parsed = parseOfficialGeoJson(official.html);
assertCoordinate(parsed.point.geometry.coordinates, EXPECTED_POINT, 'Official display point');
assertLine(parsed.line.geometry.coordinates, EXPECTED_LINE);
const lengthM = lineLengthMeters(EXPECTED_LINE);
assert(lengthM > 1000 && lengthM < 2500, `Unexpected official line length ${lengthM.toFixed(2)} m.`);
const pointDistanceToLineM = closestPointDistanceMeters(EXPECTED_POINT, EXPECTED_LINE);
assert(pointDistanceToLineM < 60, `Official display point is ${pointDistanceToLineM.toFixed(2)} m from official line.`);

const canonicalCoordinate = { lat: EXPECTED_POINT[1], lon: EXPECTED_POINT[0] };
const anchors = [
  {
    id: 'frognerstranda_vest_frognerkilen_bygdoy',
    name: 'Frognerstranda vest – indre Frognerkilen/Bygdøy',
    type: 'route_point',
    lat: EXPECTED_LINE[0][1],
    lon: EXPECTED_LINE[0][0],
    r: 140,
  },
  {
    id: 'frognerstranda_midt_offisielt_kartanker',
    name: 'Frognerstranda midt – offisielt kartanker',
    type: 'route_point',
    lat: canonicalCoordinate.lat,
    lon: canonicalCoordinate.lon,
    r: 140,
  },
  {
    id: 'frognerstranda_ost_hjortnes_framnes',
    name: 'Frognerstranda øst – Hjortnes/Framnes',
    type: 'route_point',
    lat: EXPECTED_LINE.at(-1)[1],
    lon: EXPECTED_LINE.at(-1)[0],
    r: 140,
  },
];

const globalRows = Array.isArray(globalIndex) ? globalIndex : globalIndex.places;
assert(Array.isArray(globalRows), 'Global place index has unexpected shape.');
assert(globalRows.filter((entry) => entry.id === PLACE_ID).length === 1, 'Runtime index does not contain exactly one Frognerstranda.');
const exactNameDuplicateCount = globalRows.filter((entry) => entry.id !== PLACE_ID && String(entry.name ?? '').toLocaleLowerCase('nb-NO') === 'frognerstranda').length;
assert(exactNameDuplicateCount === 0, `Found ${exactNameDuplicateCount} other canonical Frognerstranda names.`);
const distanceRows = globalRows
  .filter((entry) => entry.id !== PLACE_ID && Number.isFinite(entry.lat) && Number.isFinite(entry.lon))
  .map((entry) => ({
    id: entry.id,
    name: entry.name,
    distanceMeters: haversineMeters(canonicalCoordinate, { lat: entry.lat, lon: entry.lon }),
  }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters);
const unexpectedCollision = distanceRows.find((entry) => entry.distanceMeters < 3);
assert(!unexpectedCollision, `Unexpected canonical collision within 3 m: ${JSON.stringify(unexpectedCollision)}.`);

const coordNote = `Object-type-first line production from Oslo kommunes own Frognerstranda page. The page defines the full shoreline scope from inner Frognerkilen/Bygdøy in the west to Hjortnes/Framnes in the east and embeds one exact GeoJSON LineString with ${EXPECTED_LINE.length} ordered points (${lengthM.toFixed(1)} m) plus one official map point. Canonical lat/lon uses that official point; the complete official line is stored as geometry and its west, middle and east positions are stored as anchors. E18, railway, an arbitrary coastline segment and the western OSM footway alone are rejected as proxies for the full waterfront.`;

Object.assign(place, {
  lat: canonicalCoordinate.lat,
  lon: canonicalCoordinate.lon,
  locatorType: 'linear_area',
  sourceProvider: 'municipality',
  sourceObjectId: SOURCE_OBJECT_ID,
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'line_anchor',
  coordType: 'official_coastal_zone_anchor',
  coordStatus: 'verified_geometry',
  coordSource: 'Oslo kommune – Frognerstranda official page GeoJSON',
  coordSourceId: SOURCE_OBJECT_ID,
  coordSourceUrl: OFFICIAL_URL,
  coordVerifiedAt: VERIFIED_AT,
  coordNote,
  sourceHint: 'The canonical object is the full official Frognerstranda coastal zone, not one road, railway, coastline fragment or western promenade segment.',
  geometry: {
    type: 'LineString',
    coordinates: EXPECTED_LINE,
  },
  anchors,
  externalLinks: [
    {
      type: 'official',
      label: 'Oslo kommune – Frognerstranda i Fjordbyen',
      url: OFFICIAL_URL,
      lang: 'nb',
      verifiedAt: VERIFIED_AT,
    },
  ],
});

await rebuildSplit(aggregate);

const mapping = civication?.mappings?.map_frognerstranda;
assert(mapping?.historyGoPlaceId === PLACE_ID, 'Civication mapping for Frognerstranda is missing.');
mapping.lat = canonicalCoordinate.lat;
mapping.lon = canonicalCoordinate.lon;
mapping.needsVerification = false;
await writeJson(paths.civication, civication);

const updatedEvidence = {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: 'data/places/popkultur/oslo/places_oslo_populaerkultur.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'do_not_change_coordinates_yet',
  currentCoordinate: {
    lat: canonicalCoordinate.lat,
    lon: canonicalCoordinate.lon,
    r: place.r,
    coordStatus: 'verified_geometry',
    coordSource: 'Oslo kommune – Frognerstranda official page GeoJSON',
    coordType: 'official_coastal_zone_anchor',
    coordNote,
  },
  identity: {
    currentName: 'Frognerstranda',
    resolvedIdentity: 'Frognerstranda som offisielt avgrenset lineær fjordkant fra indre Frognerkilen/Bygdøy til Hjortnes/Framnes',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'linear_area',
    requiresSplit: false,
    splitReason: 'The complete municipal line and ordered anchors model the broad waterfront without splitting it into road, promenade or shoreline proxy places.',
  },
  requiredEvidence: [
    'offisiell eksplisitt fullscope-definisjon',
    'maskinsporbar full lineær geometri',
    'offisielt representasjonspunkt koblet til samme geometri',
  ],
  evidence: [
    {
      sourceProvider: 'municipality',
      sourceName: 'Oslo kommune – Frognerstranda i Fjordbyen',
      sourceUrl: OFFICIAL_URL,
      sourceObjectId: SOURCE_OBJECT_ID,
      sourceQuality: 'official_exact_linear_scope_and_geometry',
      finding: `The official page defines the west/east scope and embeds one ${EXPECTED_LINE.length}-point LineString plus one Point for the same Frognerstranda map.`,
      canVerifyCoordinate: true,
      reason: coordNote,
    },
    {
      sourceProvider: 'osm',
      sourceName: 'OpenStreetMap way 71423688 – Frognerstranda footway',
      sourceUrl: 'https://www.openstreetmap.org/way/71423688',
      sourceObjectId: 'osm-way:71423688',
      sourceQuality: 'exact_named_partial_segment_context_only',
      finding: 'The exact named western footway is a real component but does not span the full official Frognerstranda scope.',
      canVerifyCoordinate: false,
      reason: 'It is retained only as secondary topology context and is not used as the canonical source or display point.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'municipality', sourceObjectId: SOURCE_OBJECT_ID, canApplyToPlace: true },
    { sourceProvider: 'osm', sourceObjectId: 'osm-way:71423688', canApplyToPlace: false },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'municipality',
      sourceObjectId: SOURCE_OBJECT_ID,
      geometryType: 'LineString',
      pointCount: EXPECTED_LINE.length,
      lengthM: Number(lengthM.toFixed(2)),
      canApplyToPlace: true,
    },
  ],
  coordinateCandidates: [
    {
      lat: canonicalCoordinate.lat,
      lon: canonicalCoordinate.lon,
      coordRole: 'line_anchor',
      sourceObjectId: SOURCE_OBJECT_ID,
      derivation: 'official_embedded_point_for_same_map_geometry',
      distanceToOfficialLineM: Number(pointDistanceToLineM.toFixed(2)),
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Official full-scope line geometry, display point and ordered anchors are applied to canonical Frognerstranda.',
  },
  notes: [
    coordNote,
    `Nearest other canonical marker before write: ${distanceRows[0]?.id ?? 'none'} (${distanceRows[0]?.distanceMeters?.toFixed(1) ?? 'n/a'} m).`,
  ],
};
await writeJson(paths.evidence, updatedEvidence);

const protocolLines = protocol.split('\n');
let removedRows = 0;
const filteredLines = protocolLines.filter((line) => {
  const remove = /^\|/.test(line) && line.includes('`frognerstranda`');
  if (remove) removedRows += 1;
  return !remove;
});
const protocolBase = filteredLines.join('\n').replace(/\s+$/, '');
const protocolAppend = `\n\n| ${BATCH} | \`frognerstranda\` | Frognerstranda | verified_geometry | \`${SOURCE_OBJECT_ID}\` |\n\nBatch ${BATCH} (${VERIFIED_AT}) løser \`frognerstranda\` som et lineært kystområde fra indre Frognerkilen/Bygdøy til Hjortnes/Framnes. Oslo kommunes egen Frognerstranda-side dokumenterer dette fullscope-et og embedder en eksakt GeoJSON LineString med ${EXPECTED_LINE.length} ordnede punkter (${lengthM.toFixed(1)} meter) samt ett offisielt kartpunkt. Canonical lat/lon bruker kommunens eget punkt, mens hele linjen og vest–midt–øst-ankrene lagres på stedet. E18, jernbanen, én tilfeldig kystlinje og den navngitte vestlige OSM-fotveien avvises som proxy for hele sonen. Ingen nearest/first-hit-logikk brukes.\n`;
await writeFile(paths.protocol, `${protocolBase}${protocolAppend}`, 'utf8');

await mkdir(paths.reportDir, { recursive: true });
await writeJson(join(paths.reportDir, 'official-page-geojson.json'), parsed.collection);
await writeJson(join(paths.reportDir, 'official-source-capture.json'), {
  version: VERIFIED_AT,
  sourceUrl: OFFICIAL_URL,
  status: official.status,
  finalUrl: official.finalUrl,
  contentType: official.contentType,
  htmlBytes: Buffer.byteLength(official.html),
  htmlSha256: sha256(official.html),
  textChecks: officialChecks,
  sourceObjectId: SOURCE_OBJECT_ID,
  point: parsed.point,
  line: parsed.line,
  lineLengthM: Number(lengthM.toFixed(2)),
  displayPointDistanceToLineM: Number(pointDistanceToLineM.toFixed(2)),
});
await writeJson(join(paths.reportDir, 'batch-195-result.json'), {
  version: VERIFIED_AT,
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'produced_from_official_municipal_page_geojson',
  old: {
    coordinate: { lat: splitChild.lat, lon: splitChild.lon, r: splitChild.r },
    coordStatus: splitChild.coordStatus,
    coordType: splitChild.coordType,
    locatorType: splitChild.locatorType,
  },
  current: {
    coordinate: { ...canonicalCoordinate, r: place.r },
    sourceObjectId: SOURCE_OBJECT_ID,
    coordStatus: 'verified_geometry',
    coordType: 'official_coastal_zone_anchor',
    locatorType: 'linear_area',
    linePointCount: EXPECTED_LINE.length,
    lineLengthM: Number(lengthM.toFixed(2)),
    displayPointDistanceToLineM: Number(pointDistanceToLineM.toFixed(2)),
    anchors,
  },
  exactNameDuplicateCount,
  nearestCanonicalBeforeWrite: distanceRows[0] ?? null,
  unexpectedCollisionWithin3m: unexpectedCollision ?? null,
  removedNeedsReviewProtocolRows: removedRows,
  civicationUpdates: 1,
  officialChecks,
});
await writeFile(join(paths.reportDir, 'README.md'), `# Frognerstranda coordinate batch 195\n\nDate: ${VERIFIED_AT}\n\nFrognerstranda is produced from Oslo kommunes own page-embedded GeoJSON, not from a road or arbitrary shoreline proxy.\n\n- source object: \`${SOURCE_OBJECT_ID}\`\n- official display point: \`${canonicalCoordinate.lat}, ${canonicalCoordinate.lon}\`\n- official line: \`${EXPECTED_LINE.length}\` points, \`${lengthM.toFixed(1)} m\`\n- locator type: \`linear_area\`\n- coordinate status: \`verified_geometry\`\n- OSM way \`71423688\`: secondary partial-segment context only\n\nAll source, split, runtime, quality, intake and evidence gates must pass before merge.\n`, 'utf8');

console.log(JSON.stringify({
  batch: BATCH,
  placeId: PLACE_ID,
  sourceObjectId: SOURCE_OBJECT_ID,
  coordinate: canonicalCoordinate,
  linePointCount: EXPECTED_LINE.length,
  lineLengthM: Number(lengthM.toFixed(2)),
  displayPointDistanceToLineM: Number(pointDistanceToLineM.toFixed(2)),
  nearestCanonical: distanceRows[0] ?? null,
  removedNeedsReviewProtocolRows: removedRows,
}, null, 2));
