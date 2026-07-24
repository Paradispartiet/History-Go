import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const root = process.cwd();
const reportDir = join(root, 'reports/oslo-coordinate-unresolved-audit-post-195');
const placeManifestPath = join(root, 'data/places/manifest.json');
const evidenceManifestPath = join(root, 'data/coordinate-evidence/manifest.json');
const protocolPath = join(root, 'docs/coordinates/coordinate-control-protocol.md');
const centralBbox = { minLat: 59.89, maxLat: 59.94, minLon: 10.70, maxLon: 10.78 };
const centralReference = { lat: 59.9139, lon: 10.7522 };
const verifiedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const reviewStatuses = new Set(['needs_manual_visual_qa', 'needs_source', 'legacy_unverified', 'historical_approximation', 'invalid']);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

function stableString(value) {
  return JSON.stringify(stable(value));
}

function extractPlaces(value) {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.places)) return value.places;
  if (value && typeof value === 'object' && typeof value.id === 'string') return [value];
  return [];
}

function isActive(place) {
  return Boolean(place?.id)
    && place.hidden !== true
    && place.stub !== true
    && place.meta?.status !== 'disabled'
    && place.status !== 'disabled';
}

function isSpecificChildPath(relativePath, placeId) {
  return basename(relativePath) === `${placeId}.json`;
}

function haversineMeters(a, b) {
  const toRad = (degrees) => degrees * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371008.8 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function inCentralBbox(place) {
  return Number.isFinite(place.lat)
    && Number.isFinite(place.lon)
    && place.lat >= centralBbox.minLat
    && place.lat <= centralBbox.maxLat
    && place.lon >= centralBbox.minLon
    && place.lon <= centralBbox.maxLon;
}

function countCandidates(evidence) {
  return {
    address: Array.isArray(evidence.addressCandidates) ? evidence.addressCandidates.length : 0,
    sourceObject: Array.isArray(evidence.sourceObjectCandidates) ? evidence.sourceObjectCandidates.length : 0,
    geometry: Array.isArray(evidence.geometryCandidates) ? evidence.geometryCandidates.length : 0,
    coordinate: Array.isArray(evidence.coordinateCandidates) ? evidence.coordinateCandidates.length : 0
  };
}

function applicableCount(rows) {
  if (!Array.isArray(rows)) return 0;
  return rows.filter((row) => row?.canApplyToPlace === true || row?.canVerifyCoordinate === true).length;
}

function countApplicable(evidence) {
  return {
    address: applicableCount(evidence.addressCandidates),
    sourceObject: applicableCount(evidence.sourceObjectCandidates),
    geometry: applicableCount(evidence.geometryCandidates),
    coordinate: applicableCount(evidence.coordinateCandidates)
  };
}

function totalApplicable(counts) {
  return Object.values(counts).reduce((sum, value) => sum + value, 0);
}

function normalizeEvidenceRow(place, evidence, evidenceFile, sourceFile) {
  const candidateCounts = countCandidates(evidence);
  const applicableCounts = countApplicable(evidence);
  const canBecomeVerified = evidence.decision?.canBecomeVerified === true;
  const applicableGeometryOrCoordinate = applicableCounts.geometry + applicableCounts.coordinate;
  const productionReadiness = canBecomeVerified && applicableGeometryOrCoordinate > 0
    ? 'production_ready'
    : 'needs_source_or_scope';
  const identityStatus = evidence.identity?.identityStatus ?? null;
  const identityResolved = identityStatus === 'resolved';
  const distanceFromCentralReferenceM = Number.isFinite(place.lat) && Number.isFinite(place.lon)
    ? Number(haversineMeters(centralReference, place).toFixed(1))
    : null;
  return {
    placeId: place.id,
    name: place.name ?? place.id,
    category: place.category ?? null,
    sourceFile: `data/${sourceFile}`,
    evidenceFile: `data/coordinate-evidence/${evidenceFile}`,
    lat: place.lat ?? null,
    lon: place.lon ?? null,
    r: place.r ?? null,
    coordStatus: place.coordStatus ?? null,
    coordType: place.coordType ?? null,
    locatorType: place.locatorType ?? null,
    sourceProvider: place.sourceProvider ?? null,
    sourceObjectId: place.sourceObjectId ?? null,
    evidenceStatus: evidence.evidenceStatus ?? null,
    coordinateDecision: evidence.coordinateDecision ?? null,
    identityStatus,
    identityResolved,
    resolvedIdentity: evidence.identity?.resolvedIdentity ?? null,
    identityProblem: evidence.identity?.identityProblem ?? null,
    blockedReason: evidence.decision?.blockedReason ?? null,
    nextAction: evidence.decision?.nextAction ?? null,
    canBecomeVerified,
    candidateCounts,
    applicableCounts,
    applicableCandidateCount: totalApplicable(applicableCounts),
    centralBbox: inCentralBbox(place),
    distanceFromCentralReferenceM,
    productionReadiness
  };
}

function rankRows(rows) {
  return [...rows].sort((a, b) => {
    const readiness = Number(b.productionReadiness === 'production_ready') - Number(a.productionReadiness === 'production_ready');
    if (readiness) return readiness;
    const applicable = b.applicableCandidateCount - a.applicableCandidateCount;
    if (applicable) return applicable;
    const identity = Number(b.identityResolved) - Number(a.identityResolved);
    if (identity) return identity;
    const distanceA = a.distanceFromCentralReferenceM ?? Number.POSITIVE_INFINITY;
    const distanceB = b.distanceFromCentralReferenceM ?? Number.POSITIVE_INFINITY;
    if (distanceA !== distanceB) return distanceA - distanceB;
    return a.placeId.localeCompare(b.placeId);
  });
}

await mkdir(reportDir, { recursive: true });

const protocol = await readFile(protocolPath, 'utf8');
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
assert(batches.length > 0, 'Coordinate protocol contains no batch rows.');
assert(Math.max(...batches) === 195, `Expected coordinate protocol max batch 195, got ${Math.max(...batches)}.`);
assert(protocol.includes('| 195 | `frognerstranda` | Frognerstranda | verified_geometry | `oslo-kommune:fjordbyen:frognerstranda:official-page-geojson` |'), 'Protocol batch 195 Frognerstranda row changed.');

const placeManifest = JSON.parse(await readFile(placeManifestPath, 'utf8'));
assert(Array.isArray(placeManifest.files), 'Place manifest has no files array.');
const activeById = new Map();
const duplicateRows = [];
for (const relativePath of placeManifest.files) {
  let parsed;
  try {
    parsed = JSON.parse(await readFile(join(root, 'data', relativePath), 'utf8'));
  } catch (error) {
    throw new Error(`Could not parse manifest place file data/${relativePath}: ${error instanceof Error ? error.message : String(error)}`);
  }
  for (const place of extractPlaces(parsed)) {
    if (!isActive(place)) continue;
    const current = { place, sourceFile: relativePath };
    const existing = activeById.get(place.id);
    if (!existing) {
      activeById.set(place.id, current);
      continue;
    }
    const equal = stableString(existing.place) === stableString(place);
    duplicateRows.push({
      placeId: place.id,
      equal,
      existingFile: existing.sourceFile,
      duplicateFile: relativePath
    });
    assert(equal, `Conflicting active place rows for ${place.id}: ${existing.sourceFile} vs ${relativePath}.`);
    if (!isSpecificChildPath(existing.sourceFile, place.id) && isSpecificChildPath(relativePath, place.id)) {
      activeById.set(place.id, current);
    }
  }
}

const frogner = activeById.get('frognerstranda');
assert(frogner, 'Active frognerstranda missing after batch 195.');
assert(frogner.place.coordStatus === 'verified_geometry', `Frognerstranda status is ${frogner.place.coordStatus}.`);
assert(frogner.place.sourceProvider === 'municipality', `Frognerstranda sourceProvider is ${frogner.place.sourceProvider}.`);
assert(frogner.place.sourceObjectId === 'oslo-kommune:fjordbyen:frognerstranda:official-page-geojson', 'Frognerstranda official source object changed.');
assert(frogner.place.geometry?.type === 'LineString' && frogner.place.geometry.coordinates?.length === 12, 'Frognerstranda official 12-point geometry missing.');

const evidenceManifest = JSON.parse(await readFile(evidenceManifestPath, 'utf8'));
assert(Array.isArray(evidenceManifest.files), 'Coordinate evidence manifest has no files array.');
const evidenceByPlaceId = new Map();
for (const relativePath of evidenceManifest.files) {
  const evidence = JSON.parse(await readFile(join(root, 'data/coordinate-evidence', relativePath), 'utf8'));
  assert(typeof evidence.placeId === 'string' && evidence.placeId.length > 0, `Evidence file ${relativePath} has no placeId.`);
  assert(!evidenceByPlaceId.has(evidence.placeId), `Duplicate coordinate evidence for ${evidence.placeId}.`);
  evidenceByPlaceId.set(evidence.placeId, { evidence, evidenceFile: relativePath });
}

const sigrid = evidenceByPlaceId.get('sigrid_undset_statue');
assert(sigrid, 'Sigrid Undset evidence missing.');
assert(sigrid.evidence.evidenceStatus === 'needs_research', 'Sigrid Undset evidence unexpectedly resolved.');
assert(sigrid.evidence.decision?.canBecomeVerified === false, 'Sigrid Undset evidence unexpectedly production-ready.');
const rejectedSigridNode = sigrid.evidence.sourceObjectCandidates?.find((candidate) => candidate.sourceObjectId === 'osm-node:7596280553');
assert(rejectedSigridNode?.canApplyToPlace === false, 'Rejected Sigrid Undset OSM candidate is no longer blocked.');

const osloRows = [];
const orphanEvidence = [];
for (const [placeId, entry] of evidenceByPlaceId) {
  if (!entry.evidenceFile.startsWith('oslo/')) continue;
  const active = activeById.get(placeId);
  if (!active) {
    orphanEvidence.push({ placeId, evidenceFile: entry.evidenceFile });
    continue;
  }
  const status = String(active.place.coordStatus ?? '');
  const applied = entry.evidence.evidenceStatus === 'applied_to_place';
  const unresolved = reviewStatuses.has(status) || !verifiedStatuses.has(status) || !applied;
  if (!unresolved) continue;
  osloRows.push(normalizeEvidenceRow(active.place, entry.evidence, entry.evidenceFile, active.sourceFile));
}

const rankedOsloRows = rankRows(osloRows);
const centralRows = rankRows(rankedOsloRows.filter((row) => row.centralBbox));
const centralProductionReady = centralRows.filter((row) => row.productionReadiness === 'production_ready');
const outsideCentralRows = rankedOsloRows.filter((row) => !row.centralBbox);
const nextCandidate = centralProductionReady[0]
  ?? outsideCentralRows.find((row) => row.productionReadiness === 'production_ready')
  ?? centralRows[0]
  ?? outsideCentralRows[0]
  ?? null;

assert(centralRows.length === 1, `Expected exactly one unresolved central Oslo place after batch 195, got ${centralRows.length}: ${centralRows.map((row) => row.placeId).join(', ')}.`);
assert(centralRows[0].placeId === 'sigrid_undset_statue', `Unexpected central unresolved place: ${centralRows[0].placeId}.`);
assert(centralRows[0].productionReadiness === 'needs_source_or_scope', 'Sigrid Undset should not be production-ready.');
assert(!rankedOsloRows.some((row) => row.placeId === 'frognerstranda'), 'Verified Frognerstranda still appears in unresolved queue.');

const readinessCounts = rankedOsloRows.reduce((counts, row) => {
  counts[row.productionReadiness] = (counts[row.productionReadiness] ?? 0) + 1;
  return counts;
}, {});
const statusCounts = rankedOsloRows.reduce((counts, row) => {
  const key = row.coordStatus ?? 'missing';
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});

const summary = {
  version: '2026-07-24',
  coordinateMaxBatch: 195,
  scope: {
    centralLabel: 'Oslo sentrum / indre Oslo priority box',
    centralBbox,
    centralReference,
    inclusionRule: 'Active evidence-backed Oslo places whose canonical coordinate state is not fully applied and verified.',
    rankingRule: 'Production-ready first; otherwise applicable candidate count, resolved identity, distance from central reference and placeId.'
  },
  activePlaceCount: activeById.size,
  placeManifestFileCount: placeManifest.files.length,
  duplicateManifestRows: duplicateRows.length,
  evidenceFileCount: evidenceByPlaceId.size,
  orphanOsloEvidenceCount: orphanEvidence.length,
  activeUnresolvedOsloCount: rankedOsloRows.length,
  activeUnresolvedCentralCount: centralRows.length,
  centralProductionReadyCount: centralProductionReady.length,
  outsideCentralUnresolvedCount: outsideCentralRows.length,
  readinessCounts,
  coordStatusCounts: statusCounts,
  centralRows,
  rankedOsloRows,
  orphanOsloEvidence,
  nextCandidate,
  decision: centralProductionReady.length > 0
    ? 'continue_with_production_ready_central_candidate'
    : nextCandidate?.productionReadiness === 'production_ready'
      ? 'central_queue_blocked_continue_with_next_production_ready_oslo_candidate'
      : 'central_queue_blocked_continue_with_ranked_research_first_oslo_candidate'
};

await writeFile(join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await writeFile(join(reportDir, 'README.md'), `# Oslo unresolved coordinate audit after batch 195\n\nCoordinate protocol max batch: **195**.\n\n## Oslo sentrum\n\n- unresolved central places: **${centralRows.length}**\n- production-ready central places: **${centralProductionReady.length}**\n- remaining central place: **${centralRows[0]?.placeId ?? 'none'}**\n\nFrognerstranda is excluded because batch 195 applied Oslo kommunes official full-scope GeoJSON and set the place to \`verified_geometry\`. Sigrid Undset-statuen remains blocked; exact OSM node 7596280553 is explicitly rejected and cannot be reused.\n\n## Whole Oslo queue\n\n- active unresolved evidence-backed Oslo places: **${rankedOsloRows.length}**\n- outside the central box: **${outsideCentralRows.length}**\n- production-ready: **${readinessCounts.production_ready ?? 0}**\n- needs source or scope: **${readinessCounts.needs_source_or_scope ?? 0}**\n\nNext candidate: **${nextCandidate ? `${nextCandidate.placeId} — ${nextCandidate.name}` : 'none'}**  \nReadiness: **${nextCandidate?.productionReadiness ?? 'none'}**  \nDecision: **${summary.decision}**\n\nNo canonical place, coordinate evidence or protocol data changed in this audit.\n`, 'utf8');

console.log(JSON.stringify({
  coordinateMaxBatch: summary.coordinateMaxBatch,
  activeUnresolvedOsloCount: summary.activeUnresolvedOsloCount,
  activeUnresolvedCentralCount: summary.activeUnresolvedCentralCount,
  centralRows: centralRows.map((row) => ({ placeId: row.placeId, productionReadiness: row.productionReadiness })),
  nextCandidate: nextCandidate ? {
    placeId: nextCandidate.placeId,
    name: nextCandidate.name,
    productionReadiness: nextCandidate.productionReadiness,
    applicableCandidateCount: nextCandidate.applicableCandidateCount
  } : null,
  decision: summary.decision
}, null, 2));
