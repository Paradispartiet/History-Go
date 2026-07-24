import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const DATE = '2026-07-24';
const EXPECTED_MAX_BATCH = 195;
const REPORT_DIR = 'reports/oslo-coordinate-central-unresolved-audit-post-195';
const PLACE_MANIFEST_PATH = 'data/places/manifest.json';
const EVIDENCE_ROOT = 'data/coordinate-evidence';
const EVIDENCE_MANIFEST_PATH = `${EVIDENCE_ROOT}/manifest.json`;
const PROTOCOL_PATH = 'docs/coordinates/coordinate-control-protocol.md';
const BBOX = { minLat: 59.89, maxLat: 59.94, minLon: 10.70, maxLon: 10.78 };
const REFERENCE = { lat: 59.9139, lon: 10.7522 };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function toPlaces(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.places)) return payload.places;
  if (Array.isArray(payload?.items)) return payload.items;
  return payload?.id ? [payload] : [];
}

function insideBbox(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon)
    && lat >= BBOX.minLat && lat <= BBOX.maxLat
    && lon >= BBOX.minLon && lon <= BBOX.maxLon;
}

function haversineM(a, b) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const radius = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * radius * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function candidateCounts(evidence) {
  return {
    address: Array.isArray(evidence.addressCandidates) ? evidence.addressCandidates.length : 0,
    sourceObject: Array.isArray(evidence.sourceObjectCandidates) ? evidence.sourceObjectCandidates.length : 0,
    geometry: Array.isArray(evidence.geometryCandidates) ? evidence.geometryCandidates.length : 0,
    coordinate: Array.isArray(evidence.coordinateCandidates) ? evidence.coordinateCandidates.length : 0
  };
}

function applicableCounts(evidence) {
  const countApplicable = (rows) => Array.isArray(rows) ? rows.filter((row) => row?.canApplyToPlace === true).length : 0;
  return {
    sourceObject: countApplicable(evidence.sourceObjectCandidates),
    geometry: countApplicable(evidence.geometryCandidates),
    coordinate: countApplicable(evidence.coordinateCandidates)
  };
}

function productionReadiness(place, evidence) {
  const applicable = applicableCounts(evidence);
  if (evidence?.decision?.canBecomeVerified === true
      && (applicable.coordinate > 0 || applicable.geometry > 0 || applicable.sourceObject > 0)) {
    return 'production_ready';
  }
  if (String(place?.coordStatus || '').startsWith('needs_')
      || ['needs_research', 'candidate_sources_collected'].includes(String(evidence?.evidenceStatus || ''))) {
    return 'needs_source_or_scope';
  }
  return 'manual_review';
}

const protocol = await readFile(PROTOCOL_PATH, 'utf8');
const batchNumbers = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const maxBatch = Math.max(...batchNumbers);
assert(maxBatch === EXPECTED_MAX_BATCH, `Expected protocol max batch ${EXPECTED_MAX_BATCH}, found ${maxBatch}.`);
assert(protocol.includes('| 195 | `frognerstranda` | Frognerstranda | verified_geometry |'), 'Batch 195 Frognerstranda protocol row is missing.');

const placeManifest = await readJson(PLACE_MANIFEST_PATH);
const activePlaces = new Map();
for (const entry of placeManifest.files ?? []) {
  const file = path.posix.join('data', entry);
  if (!existsSync(file)) continue;
  let payload;
  try {
    payload = await readJson(file);
  } catch {
    continue;
  }
  for (const place of toPlaces(payload)) {
    if (!place?.id || place?.hidden === true || place?.stub === true) continue;
    activePlaces.set(String(place.id), { place, file });
  }
}

const evidenceManifest = await readJson(EVIDENCE_MANIFEST_PATH);
const evidenceRows = [];
for (const entry of evidenceManifest.files ?? []) {
  const evidenceFile = path.posix.join(EVIDENCE_ROOT, entry);
  if (!existsSync(evidenceFile)) continue;
  const evidence = await readJson(evidenceFile);
  const placeId = String(evidence?.placeId || '');
  const active = activePlaces.get(placeId);
  if (!active) continue;
  evidenceRows.push({ placeId, evidence, evidenceFile, ...active });
}

const unresolved = evidenceRows.filter(({ place, evidence }) => {
  const evidenceStatus = String(evidence?.evidenceStatus || '');
  const coordStatus = String(place?.coordStatus || '');
  if (evidenceStatus === 'applied_to_place' || evidenceStatus === 'rejected') return false;
  return coordStatus.startsWith('needs_') || coordStatus === 'unverified' || evidenceStatus !== 'applied_to_place';
});

const unresolvedOslo = unresolved.filter(({ file }) => file.includes('/oslo/'));
const centralRows = unresolvedOslo
  .filter(({ place }) => insideBbox(Number(place.lat), Number(place.lon)))
  .map(({ placeId, place, file, evidence, evidenceFile }) => ({
    placeId,
    name: place.name ?? '',
    category: place.category ?? '',
    sourceFile: file,
    evidenceFile,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    coordStatus: place.coordStatus ?? '',
    coordType: place.coordType ?? '',
    locatorType: place.locatorType ?? '',
    sourceProvider: place.sourceProvider ?? null,
    sourceObjectId: place.sourceObjectId ?? null,
    evidenceStatus: evidence.evidenceStatus ?? '',
    coordinateDecision: evidence.coordinateDecision ?? '',
    identityStatus: evidence.identity?.identityStatus ?? '',
    resolvedIdentity: evidence.identity?.resolvedIdentity ?? '',
    identityProblem: evidence.identity?.identityProblem ?? '',
    blockedReason: evidence.decision?.blockedReason ?? '',
    nextAction: evidence.decision?.nextAction ?? '',
    canBecomeVerified: evidence.decision?.canBecomeVerified === true,
    candidateCounts: candidateCounts(evidence),
    applicableCounts: applicableCounts(evidence),
    centralBbox: true,
    distanceFromCentralReferenceM: Number(haversineM(REFERENCE, { lat: Number(place.lat), lon: Number(place.lon) }).toFixed(1)),
    productionReadiness: productionReadiness(place, evidence),
    explicitRejectedSourceObjects: (evidence.sourceObjectCandidates ?? [])
      .filter((candidate) => candidate?.canApplyToPlace === false)
      .map((candidate) => candidate.sourceObjectId)
  }))
  .sort((a, b) => a.distanceFromCentralReferenceM - b.distanceFromCentralReferenceM || a.placeId.localeCompare(b.placeId));

assert(centralRows.length === 1, `Expected exactly one unresolved central place after batch 195, found ${centralRows.length}: ${centralRows.map((row) => row.placeId).join(', ')}`);
assert(centralRows[0].placeId === 'sigrid_undset_statue', `Unexpected remaining central place: ${centralRows[0].placeId}`);
assert(centralRows[0].coordStatus === 'needs_source', `Sigrid Undset status drifted: ${centralRows[0].coordStatus}`);
assert(centralRows[0].explicitRejectedSourceObjects.includes('osm-node:7596280553'), 'False Sigrid Undset OSM node rejection is missing from evidence.');
assert(!unresolved.some(({ placeId }) => placeId === 'frognerstranda'), 'Frognerstranda remains unresolved after batch 195.');

const readinessCounts = centralRows.reduce((counts, row) => {
  counts[row.productionReadiness] = (counts[row.productionReadiness] ?? 0) + 1;
  return counts;
}, {});

const summary = {
  version: DATE,
  coordinateMaxBatch: maxBatch,
  scope: {
    label: 'Oslo sentrum / indre Oslo priority box',
    bbox: BBOX,
    referencePoint: REFERENCE,
    exclusionRule: 'Only active evidence-backed unresolved places whose current public marker lies inside the bbox are included.'
  },
  activePlaceCount: activePlaces.size,
  evidenceFileCount: evidenceRows.length,
  activeUnresolvedEvidenceCount: unresolved.length,
  activeUnresolvedOsloCount: unresolvedOslo.length,
  activeUnresolvedCentralCount: centralRows.length,
  readinessCounts,
  resolvedSincePost194: [
    {
      placeId: 'frognerstranda',
      batch: 195,
      coordStatus: activePlaces.get('frognerstranda')?.place?.coordStatus,
      sourceObjectId: activePlaces.get('frognerstranda')?.place?.sourceObjectId
    }
  ],
  centralRows,
  nextCandidate: centralRows[0],
  decision: 'single_remaining_central_candidate_requires_new_exact_source_not_retry_of_rejected_osm_node'
};

await mkdir(REPORT_DIR, { recursive: true });
await writeFile(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(`${REPORT_DIR}/README.md`, `# Oslo sentrum unresolved audit after coordinate batch 195\n\n- Protocol max batch: 195\n- Active unresolved central places: ${centralRows.length}\n- Remaining candidate: \`${centralRows[0].placeId}\` (${centralRows[0].name})\n- Status: \`${centralRows[0].coordStatus}\` / \`${centralRows[0].productionReadiness}\`\n- Explicitly rejected exact object: \`osm-node:7596280553\`\n- Frognerstranda is no longer unresolved after batch 195.\n\nNo canonical place, coordinate, evidence or protocol data is changed by this audit.\n`, 'utf8');

console.log(JSON.stringify(summary, null, 2));
