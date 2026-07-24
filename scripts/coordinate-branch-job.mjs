import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const BATCH = 194;
const PREVIOUS_BATCH = 193;
const PLACE_ID = 'regjeringskvartalet';
const EXPECTED_PLAN_ID = '202020172';
const EXPECTED_PLAN_NAME = 'S-5100';
const SOURCE_OBJECT_ID = `oslo-planinnsyn:REGTILLEGG:Omraadeplan:${EXPECTED_PLAN_ID}`;
const VERIFIED_AT = '2026-07-24';
const root = process.cwd();

const paths = {
  aggregate: join(root, 'data/places/politikk/oslo/places_politikk.json'),
  splitDir: join(root, 'data/places/politikk/oslo/places_politikk'),
  splitChild: join(root, 'data/places/politikk/oslo/places_politikk/regjeringskvartalet.json'),
  splitManifest: join(root, 'data/places/politikk/oslo/places_politikk_manifest.json'),
  splitIndex: join(root, 'data/places/politikk/oslo/places_politikk_index.json'),
  globalIndex: join(root, 'data/places/places_index.json'),
  evidence: join(root, 'data/coordinate-evidence/oslo/politikk/regjeringskvartalet.json'),
  civication: join(root, 'data/Civication/map/historyGoPlaceMapping.politikk.json'),
  protocol: join(root, 'docs/coordinates/coordinate-control-protocol.md'),
  researchSummary: join(root, 'reports/oslo-coordinate-regjeringskvartalet-wfs-area-research-post-193/summary.json'),
  researchGeoJson: join(root, 'reports/oslo-coordinate-regjeringskvartalet-wfs-area-research-post-193/omraadeplan-native.geojson'),
  reportDir: join(root, 'reports/oslo-coordinate-control-batch-194-regjeringskvartalet-official-plan'),
};

const governmentDecisionUrl = 'https://www.regjeringen.no/no/dokumenter/vedtak-av-statlig-reguleringsplan-for-nytt-regjeringskvartal/id2538263/';
const wfsBaseUrl = 'https://od2.pbe.oslo.kommune.no/cgi-bin/wms';
const wfsUrl = `${wfsBaseUrl}?map=REGTILLEGG&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=ms%3AOmraadeplan&OUTPUTFORMAT=geojson&SRSNAME=EPSG%3A32632`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(text) {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function normalizeText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&aring;|&#229;/gi, 'å')
    .replace(/&oslash;|&#248;/gi, 'ø')
    .replace(/&aelig;|&#230;/gi, 'æ')
    .replace(/&ndash;|&#8211;/gi, '–')
    .replace(/&mdash;|&#8212;/gi, '—')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&amp;|&#38;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'History-Go-coordinate-control/1.0 (+https://github.com/Paradispartiet/History-Go)',
      accept: 'text/html,application/json,application/geo+json;q=0.9,*/*;q=0.8',
    },
  });
  assert(response.ok, `Fetch failed ${response.status} ${response.statusText}: ${url}`);
  return await response.text();
}

function findPlanFeature(collection) {
  assert(collection?.type === 'FeatureCollection', 'WFS response is not a FeatureCollection.');
  const matches = (collection.features ?? []).filter((feature) => {
    const p = feature?.properties ?? {};
    return String(p.PLANID) === EXPECTED_PLAN_ID && String(p.PLANNAVN) === EXPECTED_PLAN_NAME && String(p.PLANTYPE) === '34';
  });
  assert(matches.length === 1, `Expected exactly one ${EXPECTED_PLAN_NAME}/${EXPECTED_PLAN_ID} polygon, got ${matches.length}.`);
  const feature = matches[0];
  assert(feature.geometry?.type === 'Polygon', `Expected Polygon geometry, got ${feature.geometry?.type}.`);
  assert(Array.isArray(feature.geometry.coordinates) && feature.geometry.coordinates.length >= 1, 'Plan polygon has no rings.');
  return feature;
}

function pointCount(geometry) {
  return geometry.coordinates.reduce((sum, ring) => sum + ring.length, 0);
}

function bboxOfGeometry(geometry) {
  const xs = [];
  const ys = [];
  for (const ring of geometry.coordinates) {
    for (const [x, y] of ring) {
      xs.push(x);
      ys.push(y);
    }
  }
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
  };
}

function ringSignedAreaAndCentroid(ring) {
  let twiceArea = 0;
  let cxTimes6Area = 0;
  let cyTimes6Area = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cxTimes6Area += (x1 + x2) * cross;
    cyTimes6Area += (y1 + y2) * cross;
  }
  const signedArea = twiceArea / 2;
  assert(Math.abs(signedArea) > 1e-6, 'Degenerate polygon ring.');
  return {
    signedArea,
    centroid: {
      x: cxTimes6Area / (6 * signedArea),
      y: cyTimes6Area / (6 * signedArea),
    },
  };
}

function polygonAreaAndCentroid(geometry) {
  let weightedX = 0;
  let weightedY = 0;
  let totalSignedArea = 0;
  for (const ring of geometry.coordinates) {
    const result = ringSignedAreaAndCentroid(ring);
    weightedX += result.centroid.x * result.signedArea;
    weightedY += result.centroid.y * result.signedArea;
    totalSignedArea += result.signedArea;
  }
  assert(Math.abs(totalSignedArea) > 1e-6, 'Degenerate polygon geometry.');
  return {
    areaM2: Math.abs(totalSignedArea),
    centroid: {
      x: weightedX / totalSignedArea,
      y: weightedY / totalSignedArea,
    },
  };
}

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = ((yi > point.y) !== (yj > point.y))
      && (point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInPolygon(point, geometry) {
  if (!pointInRing(point, geometry.coordinates[0])) return false;
  for (let i = 1; i < geometry.coordinates.length; i += 1) {
    if (pointInRing(point, geometry.coordinates[i])) return false;
  }
  return true;
}

function deterministicInteriorAnchor(geometry, centroid, bbox) {
  if (pointInPolygon(centroid, geometry)) return { ...centroid, method: 'polygon_centroid' };
  const candidates = [];
  const steps = 80;
  for (let yi = 1; yi < steps; yi += 1) {
    for (let xi = 1; xi < steps; xi += 1) {
      const point = {
        x: bbox.minX + ((bbox.maxX - bbox.minX) * xi) / steps,
        y: bbox.minY + ((bbox.maxY - bbox.minY) * yi) / steps,
      };
      if (pointInPolygon(point, geometry)) {
        const distanceToCentroid = Math.hypot(point.x - centroid.x, point.y - centroid.y);
        candidates.push({ ...point, distanceToCentroid });
      }
    }
  }
  assert(candidates.length > 0, 'Could not derive deterministic interior point from official polygon.');
  candidates.sort((a, b) => a.distanceToCentroid - b.distanceToCentroid || a.y - b.y || a.x - b.x);
  return { x: candidates[0].x, y: candidates[0].y, method: 'deterministic_interior_grid_point' };
}

function utm32ToWgs84(easting, northing) {
  const a = 6378137.0;
  const eccSquared = 0.0066943799901413165;
  const k0 = 0.9996;
  const eccPrimeSquared = eccSquared / (1 - eccSquared);
  const e1 = (1 - Math.sqrt(1 - eccSquared)) / (1 + Math.sqrt(1 - eccSquared));
  const x = easting - 500000.0;
  const y = northing;
  const longOrigin = 9.0;
  const M = y / k0;
  const mu = M / (a * (1 - eccSquared / 4 - (3 * eccSquared ** 2) / 64 - (5 * eccSquared ** 3) / 256));
  const phi1Rad = mu
    + ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu)
    + ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu)
    + ((151 * e1 ** 3) / 96) * Math.sin(6 * mu)
    + ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);
  const N1 = a / Math.sqrt(1 - eccSquared * Math.sin(phi1Rad) ** 2);
  const T1 = Math.tan(phi1Rad) ** 2;
  const C1 = eccPrimeSquared * Math.cos(phi1Rad) ** 2;
  const R1 = (a * (1 - eccSquared)) / (1 - eccSquared * Math.sin(phi1Rad) ** 2) ** 1.5;
  const D = x / (N1 * k0);
  const latRad = phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (
    D ** 2 / 2
    - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * eccPrimeSquared) * D ** 4 / 24
    + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * eccPrimeSquared - 3 * C1 ** 2) * D ** 6 / 720
  );
  const lonRad = (
    D
    - (1 + 2 * T1 + C1) * D ** 3 / 6
    + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * eccPrimeSquared + 24 * T1 ** 2) * D ** 5 / 120
  ) / Math.cos(phi1Rad);
  return {
    lat: latRad * 180 / Math.PI,
    lon: longOrigin + lonRad * 180 / Math.PI,
  };
}

function geometryMaxDrift(a, b) {
  assert(a.type === b.type, `Geometry type changed: ${a.type} -> ${b.type}`);
  assert(a.coordinates.length === b.coordinates.length, 'Polygon ring count changed.');
  let max = 0;
  for (let r = 0; r < a.coordinates.length; r += 1) {
    assert(a.coordinates[r].length === b.coordinates[r].length, `Polygon point count changed in ring ${r}.`);
    for (let i = 0; i < a.coordinates[r].length; i += 1) {
      const [ax, ay] = a.coordinates[r][i];
      const [bx, by] = b.coordinates[r][i];
      max = Math.max(max, Math.hypot(ax - bx, ay - by));
    }
  }
  return max;
}

function extremeBoundaryPoints(geometry) {
  const points = geometry.coordinates.flat().map(([x, y], index) => ({ x, y, index }));
  const north = [...points].sort((a, b) => b.y - a.y || a.x - b.x || a.index - b.index)[0];
  const south = [...points].sort((a, b) => a.y - b.y || a.x - b.x || a.index - b.index)[0];
  const east = [...points].sort((a, b) => b.x - a.x || a.y - b.y || a.index - b.index)[0];
  const west = [...points].sort((a, b) => a.x - b.x || a.y - b.y || a.index - b.index)[0];
  return { north, south, east, west };
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

function roundCoordinate(value) {
  return Number(value.toFixed(12));
}

function lightIndexRow(place) {
  return {
    id: place.id,
    name: place.name ?? null,
    category: place.category ?? null,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    year: place.year ?? null,
    coordStatus: place.coordStatus ?? null,
    coordType: place.coordType ?? null,
    file: `places_politikk/${place.id}.json`,
  };
}

async function rebuildPoliticsSplit(places) {
  const source = `${JSON.stringify(places, null, 2)}\n`;
  await writeFile(paths.aggregate, source, 'utf8');
  const manifestRows = [];
  const indexRows = [];
  for (let i = 0; i < places.length; i += 1) {
    const place = places[i];
    const content = `${JSON.stringify(place, null, 2)}\n`;
    const fileName = `${place.id}.json`;
    await writeFile(join(paths.splitDir, fileName), content, 'utf8');
    manifestRows.push({
      id: place.id,
      name: place.name ?? null,
      category: place.category ?? null,
      file: `places_politikk/${fileName}`,
      order: i,
      sha256: sha256(content),
    });
    indexRows.push(lightIndexRow(place));
  }
  const manifest = {
    version: 'places_politikk_split_v1',
    source_file: 'places_politikk.json',
    source_path: 'data/places/politikk/oslo/places_politikk.json',
    source_sha256: sha256(source),
    generated_at: new Date().toISOString(),
    place_count: places.length,
    layout: {
      place_files_dir: 'places_politikk/',
      one_file_per_place: true,
      filename_rule: '<place.id>.json',
      manifest_preserves_original_order: true,
      original_aggregate_left_unchanged: true,
    },
    places: manifestRows,
  };
  await writeJson(paths.splitManifest, manifest);
  await writeJson(paths.splitIndex, indexRows);
}

const [aggregate, splitChild, evidence, civication, protocol, researchSummary, researchGeoJson, globalIndex] = await Promise.all([
  readJson(paths.aggregate),
  readJson(paths.splitChild),
  readJson(paths.evidence),
  readJson(paths.civication),
  readFile(paths.protocol, 'utf8'),
  readJson(paths.researchSummary),
  readJson(paths.researchGeoJson),
  readJson(paths.globalIndex),
]);

assert(Array.isArray(aggregate), 'Politics aggregate must be an array.');
const placeMatches = aggregate.filter((place) => place.id === PLACE_ID);
assert(placeMatches.length === 1, `Expected one aggregate ${PLACE_ID}, got ${placeMatches.length}.`);
const place = placeMatches[0];
assert(JSON.stringify(place) === JSON.stringify(splitChild), 'Aggregate and split child are not identical before batch 194.');
assert(place.coordStatus === 'needs_source', `Expected needs_source, got ${place.coordStatus}.`);
assert(place.coordType === 'legacy_unverified', `Expected legacy_unverified, got ${place.coordType}.`);
assert(place.locatorType === 'institutional_area', `Expected institutional_area, got ${place.locatorType}.`);
assert(Math.abs(place.lat - 59.9156) < 1e-10 && Math.abs(place.lon - 10.7451) < 1e-10, 'Legacy coordinate changed since research.');
assert(evidence.placeId === PLACE_ID && evidence.coordinateDecision === 'needs_geometry', 'Coordinate evidence is no longer in the researched unresolved state.');
assert(researchSummary.coordinateMaxBatch === PREVIOUS_BATCH, 'Merged research was not based on batch 193.');
assert(researchSummary.decision === 'candidate_covering_plan_feature_requires_identity_crosscheck', 'Merged research decision changed unexpectedly.');

const batchNumbers = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batchNumbers);
assert(protocolMaxBatch === PREVIOUS_BATCH, `Protocol max batch is ${protocolMaxBatch}, expected ${PREVIOUS_BATCH}.`);
assert(!protocol.includes(`| ${BATCH} |`), `Protocol already contains batch ${BATCH}.`);
assert(protocol.includes('| 193 | `tjernsmyr_salamanderlokalitet` |'), 'Protocol tail does not contain batch 193 Tjernsmyr.');

const governmentHtml = await fetchText(governmentDecisionUrl);
const governmentText = normalizeText(governmentHtml);
const requiredGovernmentTerms = [
  'Vedtak av statlig reguleringsplan for nytt regjeringskvartal',
  '10.02.2017',
  'Akersgata',
  'Møllergata',
  'Trefoldighetskirken',
  'Deichmanske bibliotek',
  'Høyesterett',
  'Grensen 1',
  'R5',
];
const governmentChecks = Object.fromEntries(requiredGovernmentTerms.map((term) => [term, governmentText.includes(term)]));
assert(Object.values(governmentChecks).every(Boolean), `Official government decision failed required text gate: ${JSON.stringify(governmentChecks)}`);

const liveCollection = JSON.parse(await fetchText(wfsUrl));
const liveFeature = findPlanFeature(liveCollection);
const researchFeature = findPlanFeature(researchGeoJson);
const geometryDriftM = geometryMaxDrift(researchFeature.geometry, liveFeature.geometry);
assert(geometryDriftM <= 0.05, `Official plan geometry drifted ${geometryDriftM.toFixed(3)} m from merged research.`);
assert(pointCount(liveFeature.geometry) === pointCount(researchFeature.geometry), 'Official plan geometry point count changed.');

const bbox = bboxOfGeometry(liveFeature.geometry);
const expectedBbox = researchSummary.geometryContainsCenter[0].bbox;
for (const key of ['minX', 'minY', 'maxX', 'maxY']) {
  assert(Math.abs(bbox[key] - expectedBbox[key]) <= 0.05, `Official plan bbox ${key} drifted: ${bbox[key]} vs ${expectedBbox[key]}.`);
}
const legacyUtm = researchSummary.canonicalCenterUtm32;
const legacyRoundTrip = utm32ToWgs84(legacyUtm.x, legacyUtm.y);
assert(Math.abs(legacyRoundTrip.lat - place.lat) < 0.00001 && Math.abs(legacyRoundTrip.lon - place.lon) < 0.00001, `UTM/WGS84 conversion gate failed: ${JSON.stringify(legacyRoundTrip)} vs ${place.lat},${place.lon}.`);
assert(pointInPolygon({ x: legacyUtm.x, y: legacyUtm.y }, liveFeature.geometry), 'Legacy canonical point is no longer inside S-5100 official plan polygon.');

const geometryStats = polygonAreaAndCentroid(liveFeature.geometry);
assert(geometryStats.areaM2 > 50_000 && geometryStats.areaM2 < 400_000, `Unexpected official plan area ${geometryStats.areaM2.toFixed(2)} m².`);
const anchorUtm = deterministicInteriorAnchor(liveFeature.geometry, geometryStats.centroid, bbox);
assert(pointInPolygon(anchorUtm, liveFeature.geometry), 'Derived official plan anchor is not inside polygon.');
const anchorWgs = utm32ToWgs84(anchorUtm.x, anchorUtm.y);
const canonicalCoordinate = { lat: roundCoordinate(anchorWgs.lat), lon: roundCoordinate(anchorWgs.lon) };
assert(canonicalCoordinate.lat > 59.91 && canonicalCoordinate.lat < 59.92, `Derived latitude out of Oslo-centre scope: ${canonicalCoordinate.lat}.`);
assert(canonicalCoordinate.lon > 10.73 && canonicalCoordinate.lon < 10.76, `Derived longitude out of Oslo-centre scope: ${canonicalCoordinate.lon}.`);

const boundaryUtm = extremeBoundaryPoints(liveFeature.geometry);
const boundaryAnchors = Object.entries(boundaryUtm).map(([direction, point]) => {
  const converted = utm32ToWgs84(point.x, point.y);
  return {
    id: `regjeringskvartalet_plan_boundary_${direction}`,
    name: `Regjeringskvartalet planområde – ${direction}`,
    type: 'boundary_point',
    lat: roundCoordinate(converted.lat),
    lon: roundCoordinate(converted.lon),
    r: 25,
  };
});

const globalRows = Array.isArray(globalIndex) ? globalIndex : globalIndex.places;
assert(Array.isArray(globalRows), 'Global place index has unexpected shape.');
const exactIdCount = globalRows.filter((row) => row.id === PLACE_ID).length;
const exactNameDuplicateCount = globalRows.filter((row) => row.id !== PLACE_ID && String(row.name).toLocaleLowerCase('nb-NO') === 'regjeringskvartalet').length;
assert(exactIdCount === 1, `Expected one runtime ${PLACE_ID}, got ${exactIdCount}.`);
assert(exactNameDuplicateCount === 0, `Found ${exactNameDuplicateCount} other canonical places named Regjeringskvartalet.`);

const childIds = new Set(['22_juli_senteret', 'hoyblokka', 'y_blokka']);
const distanceRows = globalRows
  .filter((row) => row.id !== PLACE_ID && Number.isFinite(row.lat) && Number.isFinite(row.lon))
  .map((row) => ({
    id: row.id,
    name: row.name,
    distanceMeters: haversineMeters(canonicalCoordinate, { lat: row.lat, lon: row.lon }),
    expectedChildOverlap: childIds.has(row.id),
  }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters);
const unexpectedCollision = distanceRows.find((row) => row.distanceMeters < 3 && !row.expectedChildOverlap);
assert(!unexpectedCollision, `Unexpected canonical collision within 3 m: ${JSON.stringify(unexpectedCollision)}.`);
const childOverlapRows = distanceRows.filter((row) => row.expectedChildOverlap);
assert(childOverlapRows.length === 3, `Expected three known Regjeringskvartalet child places, got ${childOverlapRows.length}.`);

const coordNote = `Object-type-first area production: Oslo kommune Planinnsyn exposes one exact current area-plan polygon as ${EXPECTED_PLAN_NAME} / PLANID ${EXPECTED_PLAN_ID} in REGTILLEGG WFS. The canonical display marker is the deterministic ${anchorUtm.method} of that official polygon (${Math.round(geometryStats.areaM2)} m²). Kommunal- og moderniseringsdepartementets decision of 10 February 2017 documents the same Regjeringskvartalet institutional scope between Akersgata and Møllergata, with Trefoldighetskirken/Deichman to the north and Høyesterett/Grensen 1 to the south. Høyblokka, 22. juli-senteret and the historical Y-blokka remain separate canonical subplaces inside the parent area; no individual building is used as a proxy for the whole quarter.`;

Object.assign(place, {
  lat: canonicalCoordinate.lat,
  lon: canonicalCoordinate.lon,
  locatorType: 'institutional_area',
  sourceProvider: 'municipality',
  sourceObjectId: SOURCE_OBJECT_ID,
  geocodeAccuracy: 'semantic_anchor',
  coordRole: 'area_anchor',
  coordType: 'official_plan_area_anchor',
  coordStatus: 'verified_geometry',
  coordSource: `Oslo kommune Planinnsyn – ${EXPECTED_PLAN_NAME} / PLANID ${EXPECTED_PLAN_ID}`,
  coordSourceId: SOURCE_OBJECT_ID,
  coordSourceUrl: wfsUrl,
  coordVerifiedAt: VERIFIED_AT,
  coordNote,
  sourceHint: 'Canonical parent geometry is the official S-5100 Regjeringskvartalet plan polygon. Individual government buildings and memorial institutions remain separate subplaces.',
  anchors: boundaryAnchors,
  externalLinks: [
    {
      type: 'official',
      label: 'Regjeringen.no – vedtak av statlig reguleringsplan',
      url: governmentDecisionUrl,
      lang: 'nb',
      verifiedAt: VERIFIED_AT,
    },
    {
      type: 'official_map',
      label: `Oslo kommune Planinnsyn – ${EXPECTED_PLAN_NAME}`,
      url: wfsUrl,
      lang: 'nb',
      verifiedAt: VERIFIED_AT,
    },
  ],
});

await rebuildPoliticsSplit(aggregate);

const mapping = civication?.mappings?.map_regjeringskvartalet;
assert(mapping?.historyGoPlaceId === PLACE_ID, 'Civication mapping for Regjeringskvartalet is missing.');
mapping.lat = canonicalCoordinate.lat;
mapping.lon = canonicalCoordinate.lon;
mapping.needsVerification = false;
await writeJson(paths.civication, civication);

const updatedEvidence = {
  schemaVersion: '1.0',
  placeId: PLACE_ID,
  placeFile: 'data/places/politikk/oslo/places_politikk.json',
  evidenceStatus: 'applied_to_place',
  coordinateDecision: 'apply_source_backed_coordinate',
  currentCoordinate: {
    lat: canonicalCoordinate.lat,
    lon: canonicalCoordinate.lon,
    r: place.r,
    coordStatus: 'verified_geometry',
    coordSource: `Oslo kommune Planinnsyn – ${EXPECTED_PLAN_NAME} / PLANID ${EXPECTED_PLAN_ID}`,
    coordType: 'official_plan_area_anchor',
    coordNote,
  },
  identity: {
    currentName: 'Regjeringskvartalet',
    resolvedIdentity: 'Regjeringskvartalet som samlet institusjonsområde avgrenset av den offisielle statlige reguleringsplanen',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'institutional_area',
    requiresSplit: false,
    splitReason: 'Parent-area identity is retained; Høyblokka, 22. juli-senteret and historical Y-blokka remain separate canonical subplaces.',
  },
  requiredEvidence: [
    'offisiell maskinsporbar samlet planområdeflate',
    'offisiell statlig identitets- og avgrensningskilde',
    'deterministisk representasjonsanker inne i samme flate',
  ],
  evidence: [
    {
      sourceProvider: 'municipality',
      sourceName: `Oslo kommune Planinnsyn REGTILLEGG – ${EXPECTED_PLAN_NAME}`,
      sourceUrl: wfsUrl,
      sourceObjectId: SOURCE_OBJECT_ID,
      sourceQuality: 'official_exact_plan_area_geometry',
      finding: `WFS feature PLANID ${EXPECTED_PLAN_ID}, PLANNAVN ${EXPECTED_PLAN_NAME}, PLANTYPE 34 is the exact official polygon containing the researched Regjeringskvartalet centre.`,
      canVerifyCoordinate: true,
      reason: coordNote,
    },
    {
      sourceProvider: 'government',
      sourceName: 'Kommunal- og moderniseringsdepartementet – vedtak av statlig reguleringsplan for nytt regjeringskvartal',
      sourceUrl: governmentDecisionUrl,
      sourceObjectId: 'regjeringen:16-2890-8:2017-02-10',
      sourceQuality: 'official_adopted_plan_identity_and_scope',
      finding: 'The adopted plan defines Regjeringskvartalet as a combined institutional area between Akersgata and Møllergata, including the documented northern and southern boundaries and R5.',
      canVerifyCoordinate: false,
      reason: 'The government decision establishes identity and scope; Oslo Planinnsyn supplies the machine-traceable geometry and coordinate anchor.',
    },
  ],
  addressCandidates: [],
  sourceObjectCandidates: [
    { sourceProvider: 'municipality', sourceObjectId: SOURCE_OBJECT_ID, canApplyToPlace: true },
    { sourceProvider: 'government', sourceObjectId: 'regjeringen:16-2890-8:2017-02-10', canApplyToPlace: false },
  ],
  geometryCandidates: [
    {
      sourceProvider: 'municipality',
      sourceObjectId: SOURCE_OBJECT_ID,
      geometryType: 'Polygon',
      areaM2: Number(geometryStats.areaM2.toFixed(2)),
      pointCount: pointCount(liveFeature.geometry),
      bbox,
      canApplyToPlace: true,
    },
  ],
  coordinateCandidates: [
    {
      lat: canonicalCoordinate.lat,
      lon: canonicalCoordinate.lon,
      coordRole: 'area_anchor',
      sourceObjectId: SOURCE_OBJECT_ID,
      derivation: anchorUtm.method,
      canApplyToPlace: true,
    },
  ],
  decision: {
    canBecomeVerified: true,
    blockedReason: '',
    nextAction: 'Official plan geometry and deterministic area anchor are applied to canonical Regjeringskvartalet.',
  },
  notes: [
    coordNote,
    `Official polygon geometry matches the merged post-193 research with maximum coordinate drift ${geometryDriftM.toFixed(3)} m.`,
    `Known child places inside the parent area: ${childOverlapRows.map((row) => `${row.id} (${row.distanceMeters.toFixed(1)} m)`).join(', ')}.`,
  ],
};
await writeJson(paths.evidence, updatedEvidence);

const protocolLines = protocol.split('\n');
let removedNeedsReviewRows = 0;
const filteredProtocolLines = protocolLines.filter((line) => {
  const isRegjeringskvartaletTableRow = /^\|/.test(line) && line.includes('`regjeringskvartalet`');
  if (isRegjeringskvartaletTableRow) removedNeedsReviewRows += 1;
  return !isRegjeringskvartaletTableRow;
});
const protocolBase = filteredProtocolLines.join('\n').replace(/\s+$/, '');
const protocolAppend = `\n\n| ${BATCH} | \`regjeringskvartalet\` | Regjeringskvartalet | verified_geometry | \`${SOURCE_OBJECT_ID}\` |\n\nBatch ${BATCH} (${VERIFIED_AT}) løser \`regjeringskvartalet\` som et samlet institusjonsområde uten å bruke én enkelt regjeringsbygning som proxy. Oslo kommunes Planinnsyn-WFS eksponerer den eksakte offisielle planflaten ${EXPECTED_PLAN_NAME} / PLANID ${EXPECTED_PLAN_ID}; livegeometrien er identisk med den mergede post-193-researchen innen ${geometryDriftM.toFixed(3)} meter og inneholder det tidligere uverifiserte kartankeret. Canonical lat/lon er det deterministiske ${anchorUtm.method === 'polygon_centroid' ? 'polygonsenteret' : 'innvendige rutenettspunktet'} fra samme flate. Departementets vedtak 10. februar 2017 dokumenterer det samme fysiske og institusjonelle scope-et mellom Akersgata og Møllergata, med Trefoldighetskirken/Deichman i nord og Høyesterett/Grensen 1 i sør. \`hoyblokka\`, \`22_juli_senteret\` og \`y_blokka\` beholdes som separate canonical understeder inne i parent-området; deres nærhet er forventet parent/subplace-overlapp, ikke navne- eller koordinatduplikater.\n`;
await writeFile(paths.protocol, `${protocolBase}${protocolAppend}`, 'utf8');

await mkdir(paths.reportDir, { recursive: true });
await writeJson(join(paths.reportDir, 'official-plan-feature.json'), {
  type: 'FeatureCollection',
  name: 'Regjeringskvartalet S-5100 exact production feature',
  crs: liveCollection.crs ?? null,
  features: [liveFeature],
});
await writeJson(join(paths.reportDir, 'official-government-source-check.json'), {
  version: VERIFIED_AT,
  sourceUrl: governmentDecisionUrl,
  requiredTerms: governmentChecks,
  decisionDateConfirmed: governmentText.includes('10.02.2017'),
  adoptedStatePlanConfirmed: governmentText.includes('vedtar Kommunal- og moderniseringsdepartementet statlig reguleringsplan'),
  scopeCrosscheck: {
    west: 'Akersgata',
    east: 'Møllergata',
    north: ['Trefoldighetskirken', 'Deichmanske bibliotek'],
    south: ['Høyesterett', 'Grensen 1'],
    additional: 'R5',
  },
});
await writeJson(join(paths.reportDir, 'batch-194-result.json'), {
  version: VERIFIED_AT,
  batch: BATCH,
  placeId: PLACE_ID,
  status: 'produced_from_official_plan_area_geometry',
  old: {
    coordinate: { lat: splitChild.lat, lon: splitChild.lon, r: splitChild.r },
    coordStatus: splitChild.coordStatus,
    coordType: splitChild.coordType,
  },
  current: {
    coordinate: { ...canonicalCoordinate, r: place.r },
    sourceObjectId: SOURCE_OBJECT_ID,
    coordStatus: 'verified_geometry',
    coordType: 'official_plan_area_anchor',
    locatorType: 'institutional_area',
    derivation: anchorUtm.method,
    areaM2: Number(geometryStats.areaM2.toFixed(2)),
    geometryPointCount: pointCount(liveFeature.geometry),
    bbox,
    boundaryAnchors,
  },
  liveProperties: liveFeature.properties,
  researchGeometryMaxDriftM: Number(geometryDriftM.toFixed(6)),
  exactNameDuplicateCount,
  nearestCanonicalBeforeWrite: distanceRows[0] ?? null,
  expectedChildOverlaps: childOverlapRows,
  unexpectedCollisionWithin3m: unexpectedCollision ?? null,
  civicationUpdates: 1,
  removedNeedsReviewProtocolRows: removedNeedsReviewRows,
  officialGovernmentChecks: governmentChecks,
  researchReport: 'reports/oslo-coordinate-regjeringskvartalet-wfs-area-research-post-193/summary.json',
});

console.log(JSON.stringify({
  batch: BATCH,
  placeId: PLACE_ID,
  sourceObjectId: SOURCE_OBJECT_ID,
  coordinate: canonicalCoordinate,
  derivation: anchorUtm.method,
  areaM2: Number(geometryStats.areaM2.toFixed(2)),
  geometryPointCount: pointCount(liveFeature.geometry),
  geometryDriftM: Number(geometryDriftM.toFixed(6)),
  expectedChildOverlaps: childOverlapRows,
  nearestCanonical: distanceRows[0] ?? null,
}, null, 2));
