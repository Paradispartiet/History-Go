import { readdir, readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const DATE = '2026-07-24';
const REPORT_DIR = 'reports/oslo-coordinate-unresolved-queue-audit-post-195';
const INDEX_PATH = 'data/places/places_index.json';
const EVIDENCE_ROOT = 'data/coordinate-evidence';
const PROTOCOL_PATH = 'docs/coordinates/coordinate-control-protocol.md';
const SIGRID_RESEARCH = 'reports/oslo-coordinate-sigrid-undset-art-collection-research-post-195/summary.json';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function listJsonFiles(root) {
  const out = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full.replaceAll('\\', '/'));
    }
  }
  await walk(root);
  return out.sort();
}

function text(value) {
  return JSON.stringify(value ?? '').toLowerCase();
}

function isResolvedIdentity(status) {
  return ['resolved', 'resolved_broad_area', 'resolved_identity', 'resolved_current'].includes(String(status ?? ''));
}

function countApplicable(rows) {
  return Array.isArray(rows) ? rows.filter((row) => row?.canApplyToPlace === true).length : 0;
}

function classify(row) {
  const combined = text({
    name: row.name,
    identity: row.resolvedIdentity,
    problem: row.identityProblem,
    blocked: row.blockedReason,
    next: row.nextAction,
    locatorType: row.locatorType
  });
  const sensitive = /(salamander|habitat|privat|private|sårbar|sensitive|individ|fangst|felle)/i.test(combined);
  const broad = ['linear_area', 'natural_area', 'institutional_area', 'route', 'quay', 'park'].includes(row.locatorType)
    || /(område|omrade|halvøy|halvoy|sivbelte|kulturlandskap|industristrøk|industristrok|korridor)/i.test(combined);

  if (row.coordStatus === 'needs_manual_visual_qa') return { bucket: 'manual_visual_qa', baseRank: 1 };
  if (row.canBecomeVerified && (row.applicableCoordinateCount > 0 || row.applicableGeometryCount > 0)) {
    return { bucket: 'production_candidate', baseRank: 0 };
  }
  if (!isResolvedIdentity(row.identityStatus)) return { bucket: 'identity_resolution', baseRank: 30 };
  if (sensitive) return { bucket: 'sensitive_or_thematic_model_decision', baseRank: 40 };
  if (broad) return { bucket: 'official_geometry_or_multi_anchor_research', baseRank: 20 };
  return { bucket: 'exact_object_or_coordinate_research', baseRank: 10 };
}

const protocol = await readFile(PROTOCOL_PATH, 'utf8');
const batchNumbers = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const maxBatch = Math.max(...batchNumbers);
assert(maxBatch === 195, `Queue audit hard gate failed: protocol max batch is ${maxBatch}, expected 195.`);
assert(protocol.includes('| 195 | `frognerstranda` |'), 'Batch 195 Frognerstranda row is missing.');
assert(!protocol.includes('| 196 |'), 'Batch 196 already exists; replay audit from fresh main.');

const runtime = JSON.parse(await readFile(INDEX_PATH, 'utf8'));
assert(Array.isArray(runtime), 'Runtime place index is not an array.');
const runtimeById = new Map(runtime.map((place) => [place.id, place]));

const sigridResearch = await exists(SIGRID_RESEARCH)
  ? JSON.parse(await readFile(SIGRID_RESEARCH, 'utf8'))
  : null;

const evidenceFiles = await listJsonFiles(EVIDENCE_ROOT);
const rows = [];
for (const evidenceFile of evidenceFiles) {
  let evidence;
  try {
    evidence = JSON.parse(await readFile(evidenceFile, 'utf8'));
  } catch {
    continue;
  }
  const placeId = evidence?.placeId;
  if (!placeId || !runtimeById.has(placeId)) continue;
  const place = runtimeById.get(placeId);
  const currentStatus = String(place.coordStatus ?? evidence.currentCoordinate?.coordStatus ?? '');
  const unresolved = ['needs_source', 'needs_manual_visual_qa', 'legacy_unverified', 'historical_approximation'].includes(currentStatus)
    || ['needs_research', 'needs_review'].includes(String(evidence.evidenceStatus ?? ''));
  if (!unresolved) continue;

  const sourceFile = String(place.sourceFile ?? evidence.placeFile ?? '');
  const osloness = evidenceFile.includes('/oslo/') || sourceFile.includes('/oslo/');
  if (!osloness) continue;

  const decision = evidence.decision ?? {};
  const row = {
    placeId,
    name: place.name ?? evidence.identity?.currentName ?? null,
    category: place.category ?? null,
    sourceFile,
    evidenceFile,
    lat: place.lat,
    lon: place.lon,
    r: place.r,
    coordStatus: currentStatus || null,
    coordType: place.coordType ?? evidence.currentCoordinate?.coordType ?? null,
    locatorType: place.locatorType ?? evidence.identity?.locatorTypeCandidate ?? null,
    sourceProvider: place.sourceProvider ?? null,
    sourceObjectId: place.sourceObjectId ?? null,
    evidenceStatus: evidence.evidenceStatus ?? null,
    coordinateDecision: evidence.coordinateDecision ?? null,
    identityStatus: evidence.identity?.identityStatus ?? null,
    resolvedIdentity: evidence.identity?.resolvedIdentity ?? null,
    identityProblem: evidence.identity?.identityProblem ?? null,
    blockedReason: decision.blockedReason ?? null,
    nextAction: decision.nextAction ?? null,
    canBecomeVerified: decision.canBecomeVerified === true,
    addressCandidateCount: Array.isArray(evidence.addressCandidates) ? evidence.addressCandidates.length : 0,
    sourceObjectCandidateCount: Array.isArray(evidence.sourceObjectCandidates) ? evidence.sourceObjectCandidates.length : 0,
    geometryCandidateCount: Array.isArray(evidence.geometryCandidates) ? evidence.geometryCandidates.length : 0,
    coordinateCandidateCount: Array.isArray(evidence.coordinateCandidates) ? evidence.coordinateCandidates.length : 0,
    applicableSourceObjectCount: countApplicable(evidence.sourceObjectCandidates),
    applicableGeometryCount: countApplicable(evidence.geometryCandidates),
    applicableCoordinateCount: countApplicable(evidence.coordinateCandidates),
    recentlyExhaustedResearch: placeId === 'sigrid_undset_statue' && sigridResearch?.decision === 'keep_needs_source',
    recentResearchDecision: placeId === 'sigrid_undset_statue' ? sigridResearch?.decision ?? null : null
  };
  const classification = classify(row);
  row.bucket = classification.bucket;
  row.rank = classification.baseRank + (row.recentlyExhaustedResearch ? 100 : 0);
  rows.push(row);
}

rows.sort((a, b) => a.rank - b.rank || a.placeId.localeCompare(b.placeId));
const groups = {};
for (const row of rows) {
  (groups[row.bucket] ??= []).push(row);
}

const nextCandidate = rows.find((row) => !row.recentlyExhaustedResearch) ?? null;
const summary = {
  version: DATE,
  coordinateMaxBatch: maxBatch,
  runtimePlaceCount: runtime.length,
  evidenceFileCount: evidenceFiles.length,
  activeUnresolvedOsloCount: rows.length,
  bucketCounts: Object.fromEntries(Object.entries(groups).map(([key, value]) => [key, value.length])),
  resolvedOrMovedSincePost192: [
    { placeId: 'tjernsmyr_salamanderlokalitet', batch: 193, outcome: 'verified_geometry_moved_to_akershus' },
    { placeId: 'regjeringskvartalet', batch: 194, outcome: 'verified_geometry' },
    { placeId: 'frognerstranda', batch: 195, outcome: 'verified_geometry' }
  ],
  recentlyExhaustedResearch: rows.filter((row) => row.recentlyExhaustedResearch).map((row) => ({
    placeId: row.placeId,
    decision: row.recentResearchDecision
  })),
  groups,
  orderedQueue: rows,
  nextCandidate,
  decision: nextCandidate
    ? 'continue_with_highest_ranked_non_exhausted_oslo_candidate'
    : 'no_non_exhausted_oslo_candidate_remains'
};

await mkdir(REPORT_DIR, { recursive: true });
await writeFile(`${REPORT_DIR}/summary.json`, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

const queueLines = rows.map((row, index) =>
  `${index + 1}. \`${row.placeId}\` — ${row.name} — \`${row.bucket}\`${row.recentlyExhaustedResearch ? ' — recently exhausted' : ''}`
).join('\n');
const readme = `# Oslo unresolved coordinate queue after batch 195\n\n- Protocol max batch: **${maxBatch}**\n- Active unresolved Oslo places: **${rows.length}**\n- Next non-exhausted candidate: **${nextCandidate ? `\`${nextCandidate.placeId}\` — ${nextCandidate.name}` : 'none'}**\n- Canonical data changed: **no**\n\n## Ordered queue\n\n${queueLines || 'No active unresolved Oslo rows.'}\n\nRanking is based on current runtime presence, current coordinate evidence, identity resolution, applicable source candidates, object type and sensitivity. The recently exhausted Sigrid Undset research is deliberately deprioritized. No nearest/first-hit inference is used.\n`;
await writeFile(`${REPORT_DIR}/README.md`, readme, 'utf8');

console.log(JSON.stringify({
  status: 'audit_complete',
  reportDir: REPORT_DIR,
  activeUnresolvedOsloCount: rows.length,
  nextCandidate: nextCandidate?.placeId ?? null,
  bucketCounts: summary.bucketCounts
}, null, 2));
