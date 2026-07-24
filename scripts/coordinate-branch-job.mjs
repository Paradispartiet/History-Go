import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const DATE = '2026-07-24';
const REPORT_DIR = 'reports/oslo-coordinate-unresolved-queue-audit-post-192';
mkdirSync(REPORT_DIR, { recursive: true });

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');

const protocol = readFileSync('docs/coordinates/coordinate-control-protocol.md', 'utf8');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|\s*`/gm)].map((match) => Number(match[1])));
if (maxBatch !== 192) throw new Error(`Expected coordinate max batch 192, got ${maxBatch}`);

const runtimeRoot = readJson('data/places/places_index.json');
const runtimePlaces = [];
const seen = new Set();
const visit = (value) => {
  if (Array.isArray(value)) return value.forEach(visit);
  if (!value || typeof value !== 'object') return;
  if (typeof value.id === 'string' && typeof value.name === 'string' && Number.isFinite(value.lat) && Number.isFinite(value.lon)) {
    if (!seen.has(value.id)) {
      seen.add(value.id);
      runtimePlaces.push(value);
    }
    return;
  }
  Object.values(value).forEach(visit);
};
visit(runtimeRoot);
const runtimeById = new Map(runtimePlaces.map((place) => [place.id, place]));

const evidenceManifest = readJson('data/coordinate-evidence/manifest.json');
if (!Array.isArray(evidenceManifest.files)) throw new Error('Coordinate evidence manifest missing files[]');

const rows = [];
for (const relativePath of evidenceManifest.files) {
  const file = `data/coordinate-evidence/${relativePath}`;
  if (!existsSync(file)) throw new Error(`Evidence manifest file missing: ${file}`);
  const evidence = readJson(file);
  const placeId = evidence.placeId;
  if (typeof placeId !== 'string') continue;
  const place = runtimeById.get(placeId) || null;
  if (!place) continue;

  const coordStatus = place.coordStatus || '';
  const isVerified = coordStatus.startsWith('verified');
  const applied = evidence.evidenceStatus === 'applied_to_place';
  const decision = evidence.coordinateDecision || '';
  const canBecomeVerified = evidence.decision?.canBecomeVerified === true;
  const hasApplicableCoordinate = Array.isArray(evidence.coordinateCandidates) && evidence.coordinateCandidates.some((candidate) => candidate?.canApplyToPlace === true && Number.isFinite(candidate?.lat) && Number.isFinite(candidate?.lon));
  const hasApplicableGeometry = Array.isArray(evidence.geometryCandidates) && evidence.geometryCandidates.some((candidate) => candidate?.canApplyToPlace === true && Number.isFinite(candidate?.lat) && Number.isFinite(candidate?.lon));

  if (isVerified && applied) continue;

  let bucket = 'other_unresolved';
  if (canBecomeVerified && (hasApplicableCoordinate || hasApplicableGeometry)) bucket = 'production_ready_evidence';
  else if (/manual_visual_qa|visual/i.test(`${coordStatus} ${decision} ${evidence.decision?.blockedReason || ''} ${evidence.decision?.nextAction || ''}`)) bucket = 'manual_visual_qa';
  else if (/identity|split|ambiguous/i.test(`${decision} ${evidence.identity?.identityStatus || ''} ${evidence.identity?.identityProblem || ''} ${evidence.decision?.blockedReason || ''}`)) bucket = 'identity_or_split';
  else if (/geometry|polygon|area|anchor|route|quay/i.test(`${decision} ${evidence.identity?.locatorTypeCandidate || ''} ${evidence.decision?.blockedReason || ''} ${evidence.decision?.nextAction || ''}`)) bucket = 'needs_geometry_or_scope';
  else if (/source/i.test(`${coordStatus} ${decision} ${evidence.decision?.blockedReason || ''} ${evidence.decision?.nextAction || ''}`) || !place.sourceObjectId) bucket = 'needs_source';

  rows.push({
    placeId,
    name: place.name,
    category: place.category || null,
    sourceFile: place.sourceFile || place.file || null,
    lat: place.lat,
    lon: place.lon,
    r: place.r || null,
    coordStatus: coordStatus || null,
    coordType: place.coordType || null,
    locatorType: place.locatorType || null,
    sourceProvider: place.sourceProvider || null,
    sourceObjectId: place.sourceObjectId || null,
    evidenceFile: file,
    evidenceStatus: evidence.evidenceStatus || null,
    coordinateDecision: decision || null,
    identityStatus: evidence.identity?.identityStatus || null,
    resolvedIdentity: evidence.identity?.resolvedIdentity || null,
    identityProblem: evidence.identity?.identityProblem || null,
    blockedReason: evidence.decision?.blockedReason || null,
    nextAction: evidence.decision?.nextAction || null,
    canBecomeVerified,
    hasApplicableCoordinate,
    hasApplicableGeometry,
    bucket
  });
}

rows.sort((a, b) => {
  const priority = {
    production_ready_evidence: 0,
    needs_source: 1,
    identity_or_split: 2,
    needs_geometry_or_scope: 3,
    manual_visual_qa: 4,
    other_unresolved: 5
  };
  return (priority[a.bucket] ?? 9) - (priority[b.bucket] ?? 9) || a.category?.localeCompare(b.category || '') || a.placeId.localeCompare(b.placeId);
});

const groups = Object.fromEntries([...new Set(rows.map((row) => row.bucket))].map((bucket) => [bucket, rows.filter((row) => row.bucket === bucket)]));
const osloRows = rows.filter((row) => /(^|\/)oslo(\/|$)/i.test(row.sourceFile || '') || /(^|\/)oslo(\/|$)/i.test(row.evidenceFile));
const akershusRows = rows.filter((row) => /(^|\/)akershus(\/|$)/i.test(row.sourceFile || '') || /(^|\/)akershus(\/|$)/i.test(row.evidenceFile));

const summary = {
  version: DATE,
  coordinateMaxBatch: maxBatch,
  runtimePlaceCount: runtimePlaces.length,
  evidenceFileCount: evidenceManifest.files.length,
  activeUnresolvedEvidenceCount: rows.length,
  activeUnresolvedOsloCount: osloRows.length,
  activeUnresolvedAkershusCount: akershusRows.length,
  bucketCounts: Object.fromEntries(Object.entries(groups).map(([bucket, items]) => [bucket, items.length])),
  groups,
  osloRows,
  akershusRows
};
writeJson(`${REPORT_DIR}/summary.json`, summary);

const lines = [
  '# Active unresolved coordinate queue after batch 192',
  '',
  `Date: ${DATE}`,
  '',
  `- Runtime places: ${runtimePlaces.length}`,
  `- Coordinate-evidence files: ${evidenceManifest.files.length}`,
  `- Active unresolved evidence-backed places: ${rows.length}`,
  `- Oslo unresolved: ${osloRows.length}`,
  `- Akershus unresolved: ${akershusRows.length}`,
  '',
  '## Buckets',
  ''
];
for (const [bucket, items] of Object.entries(groups)) {
  lines.push(`### ${bucket} (${items.length})`, '');
  for (const row of items) {
    lines.push(`- \`${row.placeId}\` — ${row.name} — status=${row.coordStatus || 'missing'} — decision=${row.coordinateDecision || 'missing'} — next=${row.nextAction || row.blockedReason || 'none'}`);
  }
  lines.push('');
}
writeFileSync(`${REPORT_DIR}/summary.md`, `${lines.join('\n')}\n`, 'utf8');

console.log(JSON.stringify({
  coordinateMaxBatch: maxBatch,
  activeUnresolvedEvidenceCount: rows.length,
  activeUnresolvedOsloCount: osloRows.length,
  activeUnresolvedAkershusCount: akershusRows.length,
  bucketCounts: summary.bucketCounts,
  topCandidates: rows.slice(0, 20).map((row) => ({ placeId: row.placeId, name: row.name, bucket: row.bucket, coordStatus: row.coordStatus, nextAction: row.nextAction }))
}, null, 2));
