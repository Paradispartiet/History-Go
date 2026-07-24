import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const root = process.cwd();
const EXPECTED_PROTOCOL_MAX_BATCH = 194;
const VERIFIED_STATUSES = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const RESOLVED_EVIDENCE_STATUSES = new Set(['applied_to_place', 'rejected']);
const CENTRAL_BBOX = {
  minLat: 59.89,
  maxLat: 59.94,
  minLon: 10.70,
  maxLon: 10.78,
};
const CENTRAL_REFERENCE = { lat: 59.9139, lon: 10.7522 };
const reportDir = join(root, 'reports/oslo-coordinate-central-unresolved-audit-post-194');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function rel(path) {
  return relative(root, path).replaceAll('\\', '/');
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function toPlaces(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.places)) return payload.places;
  if (Array.isArray(payload?.items)) return payload.items;
  return [payload];
}

function haversineMeters(a, b) {
  const toRad = (value) => value * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.sqrt(h));
}

function insideCentralBbox(place) {
  return Number.isFinite(place?.lat)
    && Number.isFinite(place?.lon)
    && place.lat >= CENTRAL_BBOX.minLat
    && place.lat <= CENTRAL_BBOX.maxLat
    && place.lon >= CENTRAL_BBOX.minLon
    && place.lon <= CENTRAL_BBOX.maxLon;
}

function candidateCount(evidence, key) {
  return Array.isArray(evidence?.[key]) ? evidence[key].length : 0;
}

function applicableCount(evidence, key) {
  return Array.isArray(evidence?.[key])
    ? evidence[key].filter((candidate) => candidate?.canApplyToPlace === true).length
    : 0;
}

const protocolPath = join(root, 'docs/coordinates/coordinate-control-protocol.md');
const protocol = await readFile(protocolPath, 'utf8');
const protocolBatches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(protocolBatches.length > 0, 'Coordinate protocol contains no batch rows.');
const protocolMaxBatch = Math.max(...protocolBatches);
assert(
  protocolMaxBatch === EXPECTED_PROTOCOL_MAX_BATCH,
  `Expected protocol max batch ${EXPECTED_PROTOCOL_MAX_BATCH}, got ${protocolMaxBatch}.`,
);
assert(
  protocol.includes('| 194 | `regjeringskvartalet` |'),
  'Protocol does not contain merged batch 194 Regjeringskvartalet row.',
);

const placeManifestPath = join(root, 'data/places/manifest.json');
const placeManifest = await readJson(placeManifestPath);
assert(Array.isArray(placeManifest?.files), 'Place manifest lacks files[].');

const activePlaces = new Map();
for (const entry of placeManifest.files) {
  const sourcePath = join(root, 'data', entry);
  if (!existsSync(sourcePath)) continue;
  const payload = await readJson(sourcePath);
  for (const place of toPlaces(payload)) {
    if (!place?.id) continue;
    activePlaces.set(String(place.id), {
      place,
      sourceFile: rel(sourcePath),
    });
  }
}

const evidenceManifestPath = join(root, 'data/coordinate-evidence/manifest.json');
const evidenceManifest = await readJson(evidenceManifestPath);
assert(Array.isArray(evidenceManifest?.files), 'Coordinate evidence manifest lacks files[].');

const activeUnresolved = [];
for (const entry of evidenceManifest.files) {
  const evidencePath = join(root, 'data/coordinate-evidence', entry);
  assert(existsSync(evidencePath), `Missing evidence file from manifest: ${rel(evidencePath)}.`);
  const evidence = await readJson(evidencePath);
  const placeId = String(evidence?.placeId ?? '').trim();
  if (!placeId) continue;
  const active = activePlaces.get(placeId);
  if (!active) continue;

  const place = active.place;
  const evidenceStatus = String(evidence?.evidenceStatus ?? '').trim();
  const coordinateDecision = String(evidence?.coordinateDecision ?? '').trim();
  const coordStatus = String(place?.coordStatus ?? '').trim();
  const unresolved = !RESOLVED_EVIDENCE_STATUSES.has(evidenceStatus)
    || !VERIFIED_STATUSES.has(coordStatus);
  if (!unresolved) continue;

  const row = {
    placeId,
    name: place.name ?? null,
    category: place.category ?? null,
    sourceFile: active.sourceFile,
    evidenceFile: rel(evidencePath),
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    coordStatus: coordStatus || null,
    coordType: place.coordType ?? null,
    locatorType: place.locatorType ?? null,
    sourceProvider: place.sourceProvider ?? null,
    sourceObjectId: place.sourceObjectId ?? null,
    evidenceStatus: evidenceStatus || null,
    coordinateDecision: coordinateDecision || null,
    identityStatus: evidence?.identity?.identityStatus ?? null,
    resolvedIdentity: evidence?.identity?.resolvedIdentity ?? null,
    identityProblem: evidence?.identity?.identityProblem ?? null,
    blockedReason: evidence?.decision?.blockedReason ?? null,
    nextAction: evidence?.decision?.nextAction ?? null,
    canBecomeVerified: evidence?.decision?.canBecomeVerified === true,
    candidateCounts: {
      address: candidateCount(evidence, 'addressCandidates'),
      sourceObject: candidateCount(evidence, 'sourceObjectCandidates'),
      geometry: candidateCount(evidence, 'geometryCandidates'),
      coordinate: candidateCount(evidence, 'coordinateCandidates'),
    },
    applicableCounts: {
      sourceObject: applicableCount(evidence, 'sourceObjectCandidates'),
      geometry: applicableCount(evidence, 'geometryCandidates'),
      coordinate: applicableCount(evidence, 'coordinateCandidates'),
    },
    centralBbox: insideCentralBbox(place),
    distanceFromCentralReferenceM: Number.isFinite(place?.lat) && Number.isFinite(place?.lon)
      ? Number(haversineMeters(CENTRAL_REFERENCE, place).toFixed(1))
      : null,
  };
  row.productionReadiness = row.canBecomeVerified
    && (row.applicableCounts.geometry > 0 || row.applicableCounts.coordinate > 0)
    ? 'production_ready_evidence'
    : 'needs_source_or_scope';
  activeUnresolved.push(row);
}

const osloUnresolved = activeUnresolved.filter((row) => row.evidenceFile.includes('/oslo/'));
const centralRows = osloUnresolved
  .filter((row) => row.centralBbox)
  .sort((a, b) => {
    const readyOrder = Number(b.productionReadiness === 'production_ready_evidence')
      - Number(a.productionReadiness === 'production_ready_evidence');
    return readyOrder
      || (a.distanceFromCentralReferenceM ?? Number.POSITIVE_INFINITY)
        - (b.distanceFromCentralReferenceM ?? Number.POSITIVE_INFINITY)
      || a.placeId.localeCompare(b.placeId, 'nb');
  });

const readinessCounts = centralRows.reduce((counts, row) => {
  counts[row.productionReadiness] = (counts[row.productionReadiness] ?? 0) + 1;
  return counts;
}, {});

const summary = {
  version: '2026-07-24',
  coordinateMaxBatch: protocolMaxBatch,
  scope: {
    label: 'Oslo sentrum / indre Oslo priority box',
    bbox: CENTRAL_BBOX,
    referencePoint: CENTRAL_REFERENCE,
    exclusionRule: 'Only active evidence-backed unresolved places whose current public marker lies inside the bbox are included.',
  },
  activePlaceCount: activePlaces.size,
  evidenceFileCount: evidenceManifest.files.length,
  activeUnresolvedEvidenceCount: activeUnresolved.length,
  activeUnresolvedOsloCount: osloUnresolved.length,
  activeUnresolvedCentralCount: centralRows.length,
  readinessCounts,
  centralRows,
  nextCandidate: centralRows[0] ?? null,
  decision: centralRows.length === 0
    ? 'no_active_unresolved_central_places'
    : centralRows.some((row) => row.productionReadiness === 'production_ready_evidence')
      ? 'take_first_production_ready_central_candidate'
      : 'research_first_central_candidate_without_guessing',
};

await mkdir(reportDir, { recursive: true });
await writeJson(join(reportDir, 'summary.json'), summary);

const lines = [
  '# Oslo sentrum unresolved coordinate audit after batch 194',
  '',
  `Date: ${summary.version}`,
  '',
  `- protocol max batch: ${protocolMaxBatch}`,
  `- active unresolved evidence-backed places: ${activeUnresolved.length}`,
  `- active unresolved Oslo places: ${osloUnresolved.length}`,
  `- active unresolved inside central priority box: ${centralRows.length}`,
  '',
  '| placeId | name | category | status | decision | readiness | distance from centre |',
  '|---|---|---|---|---|---|---:|',
  ...centralRows.map((row) => `| \`${row.placeId}\` | ${row.name ?? '-'} | ${row.category ?? '-'} | ${row.coordStatus ?? '-'} | ${row.coordinateDecision ?? '-'} | ${row.productionReadiness} | ${row.distanceFromCentralReferenceM ?? '-'} m |`),
  '',
  `Decision: **${summary.decision}**`,
  '',
  summary.nextCandidate
    ? `Next candidate: \`${summary.nextCandidate.placeId}\` — ${summary.nextCandidate.nextAction ?? summary.nextCandidate.blockedReason ?? 'requires source-first review'}`
    : 'No unresolved central candidate remains in the defined priority box.',
  '',
  'No canonical place, coordinate, evidence or protocol data changed in this audit.',
  '',
];
await writeFile(join(reportDir, 'README.md'), `${lines.join('\n')}\n`, 'utf8');

console.log(JSON.stringify({
  coordinateMaxBatch: protocolMaxBatch,
  activeUnresolvedEvidenceCount: activeUnresolved.length,
  activeUnresolvedOsloCount: osloUnresolved.length,
  activeUnresolvedCentralCount: centralRows.length,
  readinessCounts,
  nextCandidate: summary.nextCandidate,
}, null, 2));
