import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const BATCH = 194;
const PREVIOUS_BATCH = 193;
const PLACE_ID = 'regjeringskvartalet';
const VERIFIED_AT = '2026-07-24';
const PLAN_ID = '202020172';
const PLAN_NAME = 'S-5100';
const PLAN_TYPE = '34';
const SOURCE_OBJECT_ID = `oslo-planinnsyn:REGTILLEGG:Omraadeplan:${PLAN_ID}`;
const SOURCE_CONTRACT_RAW_SHA256 = 'baf3dd4db03fc13d4e02ee57fe62e74f4af659451c3b7a28ae3d79d3cd54ef6b';
const SOURCE_CONTRACT_CANONICAL_SHA256 = 'c987de325475ee96d536957f276c350e2cc1a035ba336c43ea5d782cf0b36f09';
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
  sourceContract: join(root, 'reports/oslo-coordinate-regjeringskvartalet-official-source-crosscheck-post-193/official-source-contract.json'),
  reportDir: join(root, 'reports/oslo-coordinate-control-batch-194-regjeringskvartalet-official-plan'),
};

const governmentDecisionUrl = 'https://www.regjeringen.no/no/dokumenter/vedtak-av-statlig-reguleringsplan-for-nytt-regjeringskvartal/id2538263/';
const wfsUrl = 'https://od2.pbe.oslo.kommune.no/cgi-bin/wms?map=REGTILLEGG&SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=ms%3AOmraadeplan&OUTPUTFORMAT=geojson&SRSNAME=EPSG%3A32632';

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

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'History-Go-coordinate-control/1.0',
      accept: 'application/json,application/geo+json;q=0.9,*/*;q=0.8',
    },
  });
  assert(response.ok, `Fetch failed ${response.status} ${response.statusText}: ${url}`);
  return JSON.parse(await response.text());
}

function findPlanFeature(collection) {
  assert(collection?.type === 'FeatureCollection', 'WFS response is not a FeatureCollection.');
  const matches = (collection.features ?? []).filter((feature) => {
    const p = feature?.properties ?? {};
    return String(p.PLANID) === PLAN_ID
      && String(p.PLANNAVN) === PLAN_NAME
      && String(p.PLANTYPE) === PLAN_TYPE;
  });
  assert(matches.length === 1, `Expected one ${PLAN_NAME}/${PLAN_ID}/${PLAN_TYPE} feature, got ${matches.length}.`);
  const feature = matches[0];
  assert(feature.geometry?.type === 'Polygon', `Expected Polygon, got ${feature.geometry?.type}.`);
  assert(Array.isArray(feature.geometry.coordinates) && feature.geometry.coordinates.length > 0, 'Plan polygon has no rings.');
  return feature;
}

function pointCount(geometry) {
  return geometry.coordinates.reduce((total, ring) => total + ring.length, 0);
}

function bboxOf(geometry) {
  const points = geometry.coordinates.flat();
  return {
    minX: Math.min(...points.map(([x]) => x)),
    minY: Math.min(...points.map(([, y]) => y)),
    maxX: Math.max(...points.map(([x]) => x)),
    maxY: Math.max(...points.map(([, y]) => y)),
  };
}

function ringAreaCentroid(ring) {
  let twiceArea = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const cross = x1 * y2 - x2 * y1;
    twiceArea += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  const area = twiceArea / 2;
  assert(Math.abs(area) > 1e-6, 'Degenerate polygon ring.');
  return { area, x: cx / (6 * area), y: cy / (6 * area) };
}

function polygonAreaCentroid(geometry) {
  let totalArea = 0;
  let weightedX = 0;
  let weightedY = 0;
  for (const ring of geometry.coordinates) {
    const result = ringAreaCentroid(ring);
    totalArea += result.area;
    weightedX += result.x * result.area;
    weightedY += result.y * result.area;
  }
  assert(Math.abs(totalArea) > 1e-6, 'Degenerate polygon geometry.');
  return {
    areaM2: Math.abs(totalArea),
    centroid: { x: weightedX / totalArea, y: weightedY / totalArea },
  };
}

function pointInRing(point, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses = ((yi > point.y) !== (yj > point.y))
      && point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || Number.EPSILON) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

function pointInPolygon(point, geometry) {
  if (!pointInRing(point, geometry.coordinates[0])) return false;
  return geometry.coordinates.slice(1).every((hole) => !pointInRing(point, hole));
}

function interiorAnchor(geometry, centroid, bbox) {
  if (pointInPolygon(centroid, geometry)) return { ...centroid, method: 'polygon_centroid' };
  const candidates = [];
  const steps = 80;
  for (let yStep = 1; yStep < steps; yStep += 1) {
    for (let xStep = 1; xStep < steps; xStep += 1) {
      const point = {
        x: bbox.minX + ((bbox.maxX - bbox.minX) * xStep) / steps,
        y: bbox.minY + ((bbox.maxY - bbox.minY) * yStep) / steps,
      };
      if (pointInPolygon(point, geometry)) {
        candidates.push({ ...point, distance: Math.hypot(point.x - centroid.x, point.y - centroid.y) });
      }
    }
  }
  assert(candidates.length > 0, 'No deterministic interior anchor found.');
  candidates.sort((a, b) => a.distance - b.distance || a.y - b.y || a.x - b.x);
  return { x: candidates[0].x, y: candidates[0].y, method: 'deterministic_interior_grid_point' };
}

function utm32ToWgs84(easting, northing) {
  const a = 6378137;
  const e2 = 0.0066943799901413165;
  const k0 = 0.9996;
  const ep2 = e2 / (1 - e2);
  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const x = easting - 500000;
  const m = northing / k0;
  const mu = m / (a * (1 - e2 / 4 - (3 * e2 ** 2) / 64 - (5 * e2 ** 3) / 256));
  const phi1 = mu
    + ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu)
    + ((21 * e1 ** 2) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu)
    + ((151 * e1 ** 3) / 96) * Math.sin(6 * mu)
    + ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);
  const n1 = a / Math.sqrt(1 - e2 * Math.sin(phi1) ** 2);
  const t1 = Math.tan(phi1) ** 2;
  const c1 = ep2 * Math.cos(phi1) ** 2;
  const r1 = (a * (1 - e2)) / (1 - e2 * Math.sin(phi1) ** 2) ** 1.5;
  const d = x / (n1 * k0);
  const lat = phi1 - (n1 * Math.tan(phi1) / r1) * (
    d ** 2 / 2
    - (5 + 3 * t1 + 10 * c1 - 4 * c1 ** 2 - 9 * ep2) * d ** 4 / 24
    + (61 + 90 * t1 + 298 * c1 + 45 * t1 ** 2 - 252 * ep2 - 3 * c1 ** 2) * d ** 6 / 720
  );
  const lon = (
    d - (1 + 2 * t1 + c1) * d ** 3 / 6
    + (5 - 2 * c1 + 28 * t1 - 3 * c1 ** 2 + 8 * ep2 + 24 * t1 ** 2) * d ** 5 / 120
  ) / Math.cos(phi1);
  return { lat: lat * 180 / Math.PI, lon: 9 + lon * 180 / Math.PI };
}

function maxGeometryDrift(a, b) {
  assert(a.type === b.type, 'Research/live geometry type mismatch.');
  assert(a.coordinates.length === b.coordinates.length, 'Research/live ring count mismatch.');
  let max = 0;
  for (let ringIndex = 0; ringIndex < a.coordinates.length; ringIndex += 1) {
    const aRing = a.coordinates[ringIndex];
    const bRing = b.coordinates[ringIndex];
    assert(aRing.length === bRing.length, `Research/live point count mismatch in ring ${ringIndex}.`);
    for (let i = 0; i < aRing.length; i += 1) {
      max = Math.max(max, Math.hypot(aRing[i][0] - bRing[i][0], aRing[i][1] - bRing[i][1]));
    }
  }
  return max;
}

function extremePoints(geometry) {
  const points = geometry.coordinates.flat().map(([x, y], index) => ({ x, y, index }));
  return {
    north: [...points].sort((a, b) => b.y - a.y || a.x - b.x || a.index - b.index)[0],
    south: [...points].sort((a, b) => a.y - b.y || a.x - b.x || a.index - b.index)[0],
    east: [...points].sort((a, b) => b.x - a.x || a.y - b.y || a.index - b.index)[0],
    west: [...points].sort((a, b) => a.x - b.x || a.y - b.y || a.index - b.index)[0],
  };
}

function haversineMeters(a, b) {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
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
  const aggregateText = `${JSON.stringify(places, null, 2)}\n`;
  await writeFile(paths.aggregate, aggregateText, 'utf8');
  const manifestRows = [];
  const indexRows = [];
  for (let index = 0; index < places.length; index += 1) {
    const place = places[index];
    const text = `${JSON.stringify(place, null, 2)}\n`;
    const file = `places_politikk/${place.id}.json`;
    await writeFile(join(paths.splitDir, `${place.id}.json`), text, 'utf8');
    manifestRows.push({
      id: place.id,
      name: place.name ?? null,
      category: place.category ?? null,
      file,
      order: index,
      sha256: sha256(text),
    });
    indexRows.push(lightIndexRow(place));
  }
  await writeJson(paths.splitManifest, {
    version: 'places_politikk_split_v1',
    source_file: 'places_politikk.json',
    source_path: 'data/places/politikk/oslo/places_politikk.json',
    source_sha256: sha256(aggregateText),
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
  });
  await writeJson(paths.splitIndex, indexRows);
}

const [
  aggregate,
  splitChild,
  evidence,
  civication,
  protocol,
  researchSummary,
  researchGeoJson,
  sourceContractRaw,
  globalIndex,
] = await Promise.all([
  readJson(paths.aggregate),
  readJson(paths.splitChild),
  readJson(paths.evidence),
  readJson(paths.civication),
  readFile(paths.protocol, 'utf8'),
  readJson(paths.researchSummary),
  readJson(paths.researchGeoJson),
  readFile(paths.sourceContract, 'utf8'),
  readJson(paths.globalIndex),
]);

assert(sha256(sourceContractRaw) === SOURCE_CONTRACT_RAW_SHA256, `Merged source-contract raw hash changed: ${sha256(sourceContractRaw)}.`);
const sourceContract = JSON.parse(sourceContractRaw);
const contractChecks = {
  version: sourceContract.version === VERIFIED_AT,
  placeId: sourceContract.placeId === PLACE_ID,
  researchType: sourceContract.researchType === 'official_identity_and_scope_crosscheck',
  title: sourceContract.officialDecision?.title === 'Vedtak av statlig reguleringsplan for nytt regjeringskvartal',
  decisionDate: sourceContract.officialDecision?.decisionDate === '2017-02-10',
  reference: sourceContract.officialDecision?.reference === '16/2890-8',
  legalBasis: sourceContract.officialDecision?.legalBasis === 'plan- og bygningsloven § 6-4',
  sourceUrl: sourceContract.officialDecision?.htmlUrl === governmentDecisionUrl,
  adopted: sourceContract.officialDecision?.adoptedStateRegulationConfirmed === true,
  west: sourceContract.documentedPlanScope?.westBoundary === 'Akersgata',
  east: sourceContract.documentedPlanScope?.eastBoundary === 'Møllergata',
  north: JSON.stringify(sourceContract.documentedPlanScope?.northBoundary) === JSON.stringify(['Trefoldighetskirken', 'Deichmanske bibliotek']),
  south: JSON.stringify(sourceContract.documentedPlanScope?.southBoundary) === JSON.stringify(['Høyesterett mellom Akersgata og Grubbegata', 'Grensen 1 mellom Grubbegata og Møllergata']),
  r5: sourceContract.documentedPlanScope?.additionalIncludedObject === 'Regjeringsbygget R5 på vestsiden av Akersgata',
  planId: sourceContract.planinnsynCandidate?.planId === PLAN_ID,
  planName: sourceContract.planinnsynCandidate?.planName === PLAN_NAME,
  planType: sourceContract.planinnsynCandidate?.planType === PLAN_TYPE,
  geometryType: sourceContract.planinnsynCandidate?.geometryType === 'Polygon',
  identityMatches: sourceContract.crosscheckDecision?.identityMatches === true,
  scopeMatches: sourceContract.crosscheckDecision?.scopeMatches === true,
  canSupportProduction: sourceContract.crosscheckDecision?.canSupportProduction === true,
  conditions: sourceContract.crosscheckDecision?.productionConditions?.length === 4,
  originBlockRecorded: sourceContract.verification?.githubActionsOriginReachability === 'blocked_http_403',
  canonicalHash: sourceContract.contractSha256 === SOURCE_CONTRACT_CANONICAL_SHA256,
};
assert(Object.values(contractChecks).every(Boolean), `Merged official source contract failed: ${JSON.stringify(contractChecks)}.`);

assert(Array.isArray(aggregate), 'Politics aggregate must be an array.');
const matches = aggregate.filter((place) => place.id === PLACE_ID);
assert(matches.length === 1, `Expected one ${PLACE_ID}, got ${matches.length}.`);
const place = matches[0];
assert(JSON.stringify(place) === JSON.stringify(splitChild), 'Aggregate/split Regjeringskvartalet mismatch before production.');
assert(place.coordStatus === 'needs_source' && place.coordType === 'legacy_unverified', 'Regjeringskvartalet is no longer in researched unresolved state.');
assert(place.locatorType === 'institutional_area', `Unexpected locatorType ${place.locatorType}.`);
assert(Math.abs(place.lat - 59.9156) < 1e-10 && Math.abs(place.lon - 10.7451) < 1e-10, 'Legacy point changed after research.');
assert(evidence.placeId === PLACE_ID && evidence.coordinateDecision === 'needs_geometry', 'Evidence state changed after research.');
assert(researchSummary.coordinateMaxBatch === PREVIOUS_BATCH, 'Geometry research was not based on batch 193.');
assert(researchSummary.decision === 'candidate_covering_plan_feature_requires_identity_crosscheck', 'Geometry research decision changed.');

const protocolBatches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMax = Math.max(...protocolBatches);
assert(protocolMax === PREVIOUS_BATCH, `Protocol max batch ${protocolMax}, expected ${PREVIOUS_BATCH}.`);
assert(protocol.includes('| 193 | `tjernsmyr_salamanderlokalitet` |'), 'Protocol tail does not contain batch 193.');
assert(!protocol.includes(`| ${BATCH} |`), `Protocol already contains batch ${BATCH}.`);

const liveCollection = await fetchJson(wfsUrl);
const liveFeature = findPlanFeature(liveCollection);
const researchFeature = findPlanFeature(researchGeoJson);
const geometryDriftM = maxGeometryDrift(researchFeature.geometry, liveFeature.geometry);
assert(geometryDriftM <= 0.05, `Live S-5100 geometry drift ${geometryDriftM.toFixed(3)} m exceeds tolerance.`);
assert(pointCount(liveFeature.geometry) === pointCount(researchFeature.geometry), 'Live S-5100 point count changed.');

const bbox = bboxOf(liveFeature.geometry);
const expectedBbox = researchSummary.geometryContainsCenter?.[0]?.bbox;
assert(expectedBbox, 'Merged geometry research lacks locked bbox.');
for (const key of ['minX', 'minY', 'maxX', 'maxY']) {
  assert(Math.abs(bbox[key] - expectedBbox[key]) <= 0.05, `Live bbox ${key} changed: ${bbox[key]} vs ${expectedBbox[key]}.`);
  assert(Math.abs(bbox[key] - sourceContract.planinnsynCandidate.bbox[key]) <= 0.05, `Live bbox ${key} differs from merged source contract.`);
}
const legacyUtm = researchSummary.canonicalCenterUtm32;
assert(pointInPolygon({ x: legacyUtm.x, y: legacyUtm.y }, liveFeature.geometry), 'Legacy canonical point is no longer inside S-5100.');
const legacyRoundTrip = utm32ToWgs84(legacyUtm.x, legacyUtm.y);
assert(Math.abs(legacyRoundTrip.lat - place.lat) < 0.00001 && Math.abs(legacyRoundTrip.lon - place.lon) < 0.00001, 'UTM/WGS84 conversion gate failed.');

const geometryStats = polygonAreaCentroid(liveFeature.geometry);
assert(geometryStats.areaM2 > 50_000 && geometryStats.areaM2 < 400_000, `Unexpected S-5100 area ${geometryStats.areaM2.toFixed(2)} m².`);
const anchorUtm = interiorAnchor(liveFeature.geometry, geometryStats.centroid, bbox);
assert(pointInPolygon(anchorUtm, liveFeature.geometry), 'Derived anchor is outside S-5100.');
const anchorConverted = utm32ToWgs84(anchorUtm.x, anchorUtm.y);
const canonicalCoordinate = {
  lat: roundCoordinate(anchorConverted.lat),
  lon: roundCoordinate(anchorConverted.lon),
};
assert(canonicalCoordinate.lat > 59.91 && canonicalCoordinate.lat < 59.92, `Derived latitude outside Oslo centre: ${canonicalCoordinate.lat}.`);
assert(canonicalCoordinate.lon > 10.73 && canonicalCoordinate.lon < 10.76, `Derived longitude outside Oslo centre: ${canonicalCoordinate.lon}.`);

const boundaryAnchors = Object.entries(extremePoints(liveFeature.geometry)).map(([direction, point]) => {
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

const runtimeRows = Array.isArray(globalIndex) ? globalIndex : globalIndex.places;
assert(Array.isArray(runtimeRows), 'Global place index has unexpected shape.');
assert(runtimeRows.filter((row) => row.id === PLACE_ID).length === 1, 'Runtime Regjeringskvartalet identity is not unique.');
const exactNameDuplicates = runtimeRows.filter((row) => row.id !== PLACE_ID && String(row.name).toLocaleLowerCase('nb-NO') === 'regjeringskvartalet');
assert(exactNameDuplicates.length === 0, `Found duplicate Regjeringskvartalet names: ${JSON.stringify(exactNameDuplicates)}.`);

const childIds = new Set(['22_juli_senteret', 'hoyblokka', 'y_blokka']);
const distances = runtimeRows
  .filter((row) => row.id !== PLACE_ID && Number.isFinite(row.lat) && Number.isFinite(row.lon))
  .map((row) => ({
    id: row.id,
    name: row.name,
    distanceMeters: haversineMeters(canonicalCoordinate, row),
    expectedChildOverlap: childIds.has(row.id),
  }))
  .sort((a, b) => a.distanceMeters - b.distanceMeters);
const unexpectedCollision = distances.find((row) => row.distanceMeters < 3 && !row.expectedChildOverlap);
assert(!unexpectedCollision, `Unexpected canonical collision within 3 m: ${JSON.stringify(unexpectedCollision)}.`);
const childOverlaps = distances.filter((row) => row.expectedChildOverlap);
assert(childOverlaps.length === 3, `Expected three canonical child places, got ${childOverlaps.length}.`);

const coordNote = `Object-type-first area production: Oslo kommune Planinnsyn exposes one exact current area-plan polygon as ${PLAN_NAME} / PLANID ${PLAN_ID} in REGTILLEGG WFS. Canonical lat/lon is the deterministic ${anchorUtm.method} of the same official polygon (${Math.round(geometryStats.areaM2)} m²). The merged official state source contract documents the same Regjeringskvartalet institutional scope between Akersgata and Møllergata, with Trefoldighetskirken/Deichman in the north, Høyesterett/Grensen 1 in the south and R5 included. Høyblokka, 22. juli-senteret and historical Y-blokka remain separate canonical subplaces; no individual building is used as proxy for the parent area.`;

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
  coordSource: `Oslo kommune Planinnsyn – ${PLAN_NAME} / PLANID ${PLAN_ID}`,
  coordSourceId: SOURCE_OBJECT_ID,
  coordSourceUrl: wfsUrl,
  coordVerifiedAt: VERIFIED_AT,
  coordNote,
  anchors: boundaryAnchors,
});

await rebuildPoliticsSplit(aggregate);

const mapping = civication?.mappings?.map_regjeringskvartalet;
assert(mapping?.historyGoPlaceId === PLACE_ID, 'Civication Regjeringskvartalet mapping is missing.');
mapping.lat = canonicalCoordinate.lat;
mapping.lon = canonicalCoordinate.lon;
mapping.needsVerification = false;
await writeJson(paths.civication, civication);

await writeJson(paths.evidence, {
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
    coordSource: `Oslo kommune Planinnsyn – ${PLAN_NAME} / PLANID ${PLAN_ID}`,
    coordType: 'official_plan_area_anchor',
    coordNote,
  },
  identity: {
    currentName: 'Regjeringskvartalet',
    resolvedIdentity: 'Regjeringskvartalet som samlet institusjonsområde avgrenset av offisiell statlig reguleringsplan',
    identityStatus: 'resolved',
    identityProblem: '',
    locatorTypeCandidate: 'institutional_area',
    requiresSplit: false,
    splitReason: 'Parent-area identity retained; Høyblokka, 22. juli-senteret and historical Y-blokka remain separate canonical subplaces.',
  },
  requiredEvidence: [
    'merged official state identity and scope contract',
    'live official municipal plan-area geometry',
    'deterministic interior area anchor',
  ],
  evidence: [
    {
      sourceProvider: 'municipality',
      sourceName: `Oslo kommune Planinnsyn REGTILLEGG – ${PLAN_NAME}`,
      sourceUrl: wfsUrl,
      sourceObjectId: SOURCE_OBJECT_ID,
      sourceQuality: 'official_exact_plan_area_geometry',
      finding: `Live WFS returns exactly one PLANID ${PLAN_ID}, PLANNAVN ${PLAN_NAME}, PLANTYPE ${PLAN_TYPE} Polygon matching merged research.`,
      canVerifyCoordinate: true,
      reason: coordNote,
    },
    {
      sourceProvider: 'government',
      sourceName: sourceContract.officialDecision.title,
      sourceUrl: sourceContract.officialDecision.htmlUrl,
      sourceObjectId: 'regjeringen:16-2890-8:2017-02-10',
      sourceQuality: 'merged_official_adopted_plan_identity_and_scope',
      finding: sourceContract.crosscheckDecision.reason,
      canVerifyCoordinate: false,
      reason: 'The state decision establishes identity and scope; live Oslo Planinnsyn supplies the coordinate geometry.',
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
    nextAction: 'Official plan geometry and deterministic area anchor applied to canonical Regjeringskvartalet.',
  },
  notes: [
    coordNote,
    `Live geometry maximum drift from merged research: ${geometryDriftM.toFixed(3)} m.`,
    `Expected child overlaps: ${childOverlaps.map((row) => `${row.id} (${row.distanceMeters.toFixed(1)} m)`).join(', ')}.`,
  ],
});

let removedNeedsReviewRows = 0;
const protocolWithoutOldRow = protocol.split('\n').filter((line) => {
  const remove = /^\|/.test(line) && line.includes('`regjeringskvartalet`');
  if (remove) removedNeedsReviewRows += 1;
  return !remove;
}).join('\n').replace(/\s+$/, '');
const protocolEntry = `\n\n| ${BATCH} | \`regjeringskvartalet\` | Regjeringskvartalet | verified_geometry | \`${SOURCE_OBJECT_ID}\` |\n\nBatch ${BATCH} (${VERIFIED_AT}) løser \`regjeringskvartalet\` som et samlet institusjonsområde uten å bruke én enkelt regjeringsbygning som proxy. Oslo kommunes Planinnsyn-WFS eksponerer den eksakte offisielle planflaten ${PLAN_NAME} / PLANID ${PLAN_ID}; livegeometrien matcher den mergede post-193-researchen innen ${geometryDriftM.toFixed(3)} meter og inneholder det tidligere uverifiserte kartankeret. Canonical lat/lon er det deterministiske ${anchorUtm.method === 'polygon_centroid' ? 'polygonsenteret' : 'innvendige rutenettspunktet'} fra samme flate. Den mergede statlige kildekontrakten dokumenterer det samme institusjonelle scope-et mellom Akersgata og Møllergata, med Trefoldighetskirken/Deichman i nord, Høyesterett/Grensen 1 i sør og R5 inkludert. \`hoyblokka\`, \`22_juli_senteret\` og \`y_blokka\` beholdes som separate canonical understeder; deres nærhet er forventet parent/subplace-overlapp, ikke duplikater.\n`;
await writeFile(paths.protocol, `${protocolWithoutOldRow}${protocolEntry}`, 'utf8');

await mkdir(paths.reportDir, { recursive: true });
await writeJson(join(paths.reportDir, 'official-plan-feature.json'), {
  type: 'FeatureCollection',
  name: 'Regjeringskvartalet S-5100 exact production feature',
  crs: liveCollection.crs ?? null,
  features: [liveFeature],
});
await writeJson(join(paths.reportDir, 'official-government-source-check.json'), {
  version: VERIFIED_AT,
  sourceContractFile: 'reports/oslo-coordinate-regjeringskvartalet-official-source-crosscheck-post-193/official-source-contract.json',
  sourceContractRawSha256: sha256(sourceContractRaw),
  sourceContractCanonicalSha256: sourceContract.contractSha256,
  sourceUrl: sourceContract.officialDecision.htmlUrl,
  pdfUrl: sourceContract.officialDecision.pdfUrl,
  contractChecks,
  scopeCrosscheck: sourceContract.documentedPlanScope,
  githubActionsOriginReachability: sourceContract.verification.githubActionsOriginReachability,
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
  exactNameDuplicateCount: exactNameDuplicates.length,
  nearestCanonicalBeforeWrite: distances[0] ?? null,
  expectedChildOverlaps: childOverlaps,
  unexpectedCollisionWithin3m: unexpectedCollision ?? null,
  civicationUpdates: 1,
  removedNeedsReviewProtocolRows: removedNeedsReviewRows,
  sourceContractRawSha256: sha256(sourceContractRaw),
  researchReports: [
    'reports/oslo-coordinate-regjeringskvartalet-wfs-area-research-post-193/summary.json',
    'reports/oslo-coordinate-regjeringskvartalet-official-source-crosscheck-post-193/official-source-contract.json',
  ],
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
  nearestCanonical: distances[0] ?? null,
  expectedChildOverlaps: childOverlaps,
}, null, 2));
