import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportRel = 'reports/oslo-coordinate-fresh-main-audit-post-195';
const reportDir = path.join(root, reportRel);
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const placeManifestRel = 'data/places/manifest.json';
const exclusionsRel = 'data/places/place_exclusions.json';
const closureRel = 'reports/oslo-coordinate-retire-ostensjovannet-sivbelte-post-195/summary.json';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const readText = async (relativePath) => fs.readFile(path.join(root, relativePath), 'utf8');
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));
const exists = async (relativePath) => {
  try {
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
};
const asDataRel = (entry) => {
  const normalized = String(entry).trim().replaceAll('\\', '/');
  return normalized.startsWith('data/') ? normalized : `data/${normalized}`;
};
const isObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const placesFrom = (value) => {
  if (Array.isArray(value)) return value.filter(isObject);
  if (isObject(value) && Array.isArray(value.places)) return value.places.filter(isObject);
  if (isObject(value) && typeof value.id === 'string') return [value];
  return [];
};
const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase();
const resolvedStatuses = new Set([
  'verified',
  'verified_geometry',
  'verified_exact',
  'official',
  'official_geometry',
  'exact',
]);
const unresolvedStatuses = new Set([
  '',
  'needs_source',
  'needs_review',
  'legacy',
  'legacy_unverified',
  'provisional',
  'approximate',
  'unknown',
  'unverified',
]);

await fs.mkdir(reportDir, { recursive: true });

const protocol = await readText(protocolRel);
const batches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 exists; rerun this audit against the new protocol state.');

const closure = await readJson(closureRel);
assert(closure.queueStatus === 'post_195_unresolved_queue_complete', 'The merged post-195 queue is not marked complete.');
assert(closure.nextQueueCandidate === null, 'The merged post-195 closure still has a next candidate.');

const exclusions = await readJson(exclusionsRel);
const disabledIds = new Set(exclusions.disabledPlaceIds ?? []);
for (const expected of [
  'bygdoy_roykenvika',
  'bygdoy_kongsgard_salamanderdam',
  'ostensjovannet_sivbelte',
]) {
  assert(disabledIds.has(expected), `Expected disabled post-195 place ${expected}.`);
}

const manifest = await readJson(placeManifestRel);
const sourceFiles = (manifest.files ?? []).map(asDataRel);
assert(sourceFiles.length > 0, 'Place manifest contains no source files.');

const activeById = new Map();
const duplicateSources = new Map();
const statusCounts = new Map();
let sourceFilesRead = 0;
let osloSourceRows = 0;

for (const sourceRel of sourceFiles) {
  if (!sourceRel.includes('/oslo/')) continue;
  if (!(await exists(sourceRel))) continue;
  let data;
  try {
    data = await readJson(sourceRel);
  } catch {
    continue;
  }
  sourceFilesRead += 1;
  for (const place of placesFrom(data)) {
    if (typeof place.id !== 'string' || place.id.length === 0) continue;
    osloSourceRows += 1;
    const status = normalizeStatus(place.coordStatus);
    statusCounts.set(status || '(missing)', (statusCounts.get(status || '(missing)') ?? 0) + 1);
    const row = {
      placeId: place.id,
      name: place.name ?? null,
      category: place.category ?? sourceRel.split('/')[2] ?? null,
      sourcePath: sourceRel,
      coordStatus: status || null,
      coordType: place.coordType ?? null,
      locatorType: place.locatorType ?? null,
      coordSource: place.coordSource ?? null,
      coordSourceId: place.coordSourceId ?? place.sourceObjectId ?? null,
      lat: Number.isFinite(Number(place.lat)) ? Number(place.lat) : null,
      lon: Number.isFinite(Number(place.lon)) ? Number(place.lon) : null,
      disabled: disabledIds.has(place.id),
      sourceHint: place.sourceHint ?? null,
    };
    if (!activeById.has(place.id)) activeById.set(place.id, row);
    else {
      const sources = duplicateSources.get(place.id) ?? [activeById.get(place.id).sourcePath];
      sources.push(sourceRel);
      duplicateSources.set(place.id, [...new Set(sources)].sort());
      const current = activeById.get(place.id);
      const currentScore = Number(Boolean(current.coordSourceId)) + Number(Boolean(current.coordSource)) + Number(resolvedStatuses.has(current.coordStatus));
      const candidateScore = Number(Boolean(row.coordSourceId)) + Number(Boolean(row.coordSource)) + Number(resolvedStatuses.has(row.coordStatus));
      if (candidateScore > currentScore) activeById.set(place.id, row);
    }
  }
}

const evidenceById = new Map();
const walkJson = async (directory) => {
  const output = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walkJson(full));
    else if (entry.name.endsWith('.json')) output.push(full);
  }
  return output;
};
const evidenceRoot = path.join(root, 'data/coordinate-evidence/oslo');
for (const fullPath of await walkJson(evidenceRoot)) {
  let evidence;
  try {
    evidence = JSON.parse(await fs.readFile(fullPath, 'utf8'));
  } catch {
    continue;
  }
  if (typeof evidence.placeId !== 'string') continue;
  evidenceById.set(evidence.placeId, {
    evidencePath: path.relative(root, fullPath).split(path.sep).join('/'),
    identityStatus: evidence.identity?.identityStatus ?? null,
    canBecomeVerified: evidence.decision?.canBecomeVerified ?? null,
    blockedReason: evidence.decision?.blockedReason ?? evidence.decision?.reason ?? null,
  });
}

const knownExhausted = new Map([
  ['bryn_industriomrade', {
    decision: 'keep_needs_source',
    report: 'reports/oslo-coordinate-bryn-official-scope-research-post-195/summary.json',
  }],
  ['bygdoy_natur', {
    decision: 'official_bygdoy_cultural_environment_is_partial_scope_keep_needs_source',
    report: 'reports/oslo-coordinate-bygdoy-gulliste-scope-research-post-195-v5/summary.json',
  }],
  ['frysja_industriomrade', {
    decision: 'keep_needs_source',
    report: 'reports/oslo-coordinate-frysja-industrial-model-audit-post-191/summary.json',
  }],
  ['sigrid_undset_statue', {
    decision: 'keep_needs_source',
    report: 'reports/oslo-coordinate-sigrid-undset-art-collection-research-post-195/summary.json',
  }],
]);

const allActive = [...activeById.values()].filter((row) => !row.disabled);
const unresolved = allActive
  .filter((row) => unresolvedStatuses.has(row.coordStatus ?? ''))
  .map((row) => ({
    ...row,
    ...(evidenceById.get(row.placeId) ?? {
      evidencePath: null,
      identityStatus: null,
      canBecomeVerified: null,
      blockedReason: null,
    }),
    exhaustedResearch: knownExhausted.has(row.placeId),
    exhaustedDecision: knownExhausted.get(row.placeId)?.decision ?? null,
    exhaustedReport: knownExhausted.get(row.placeId)?.report ?? null,
  }))
  .sort((a, b) => a.category.localeCompare(b.category) || a.placeId.localeCompare(b.placeId));

const knownExhaustedRows = unresolved.filter((row) => row.exhaustedResearch);
const actionableRows = unresolved.filter((row) => !row.exhaustedResearch);
const missingEvidenceRows = unresolved.filter((row) => !row.evidencePath);
const resolvedActiveCount = allActive.filter((row) => resolvedStatuses.has(row.coordStatus ?? '')).length;
const otherStatusRows = allActive.filter((row) =>
  !resolvedStatuses.has(row.coordStatus ?? '') && !unresolvedStatuses.has(row.coordStatus ?? ''));

const rankActionable = (row) => {
  let score = 0;
  if (row.coordStatus === 'needs_review') score += 40;
  if (row.identityStatus === 'resolved') score += 20;
  if (row.canBecomeVerified === true) score += 30;
  if (row.coordSourceId) score += 15;
  if (row.coordSource) score += 10;
  if (row.lat !== null && row.lon !== null) score += 5;
  if (row.identityStatus === 'unresolved') score -= 10;
  return score;
};
const rankedActionable = actionableRows
  .map((row) => ({ ...row, auditPriorityScore: rankActionable(row) }))
  .sort((a, b) => b.auditPriorityScore - a.auditPriorityScore || a.placeId.localeCompare(b.placeId));

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  sourceFilesRead,
  osloSourceRows,
  uniqueActiveOsloPlaces: allActive.length,
  resolvedActiveCount,
  unresolvedActiveCount: unresolved.length,
  exhaustedUnresolvedCount: knownExhaustedRows.length,
  actionableUnresolvedCount: rankedActionable.length,
  missingEvidenceCount: missingEvidenceRows.length,
  otherStatusCount: otherStatusRows.length,
  disabledPost195Ids: [
    'bygdoy_roykenvika',
    'bygdoy_kongsgard_salamanderdam',
    'ostensjovannet_sivbelte',
  ],
  statusCounts: Object.fromEntries([...statusCounts.entries()].sort(([a], [b]) => a.localeCompare(b))),
  knownExhausted: knownExhaustedRows,
  actionableQueue: rankedActionable,
  missingEvidence: missingEvidenceRows,
  otherStatuses: otherStatusRows,
  duplicateActiveSources: Object.fromEntries([...duplicateSources.entries()].sort(([a], [b]) => a.localeCompare(b))),
  nextCandidate: rankedActionable[0] ?? null,
  queueDecision: rankedActionable.length === 0
    ? 'no_new_actionable_oslo_coordinate_items_after_post_195'
    : 'new_actionable_oslo_coordinate_items_found_after_post_195',
};

await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# Fresh-main Oslo coordinate audit after post-195 closure\n\n- Protocol max batch: **${protocolMaxBatch}**\n- Canonical data changed: **no**\n- Unique active Oslo places: **${allActive.length}**\n- Resolved active places: **${resolvedActiveCount}**\n- Unresolved active places: **${unresolved.length}**\n- Known exhausted unresolved tracks: **${knownExhaustedRows.length}**\n- New actionable unresolved tracks: **${rankedActionable.length}**\n- Missing coordinate-evidence files: **${missingEvidenceRows.length}**\n- Queue decision: **\`${summary.queueDecision}\`**\n- Next candidate: **${summary.nextCandidate ? `\`${summary.nextCandidate.placeId}\` — ${summary.nextCandidate.name ?? 'unnamed'}` : 'none'}**\n\nThis audit rebuilds the queue from the current manifest-loaded Oslo place sources. Disabled post-195 records are excluded from runtime scope, while the four source-exhausted unresolved records remain visible but are not reopened without new evidence.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'fresh_main_audit_complete',
  reportDir: reportRel,
  protocolMaxBatch,
  uniqueActiveOsloPlaces: allActive.length,
  unresolvedActiveCount: unresolved.length,
  exhaustedUnresolvedCount: knownExhaustedRows.length,
  actionableUnresolvedCount: rankedActionable.length,
  missingEvidenceCount: missingEvidenceRows.length,
  queueDecision: summary.queueDecision,
  nextCandidate: summary.nextCandidate?.placeId ?? null,
}, null, 2));
