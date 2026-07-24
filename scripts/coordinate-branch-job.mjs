import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const reportDir = path.join(root, 'reports/oslo-coordinate-research-exhaustion-audit-post-195');

const readText = async (relativePath) =>
  fs.readFile(path.join(root, relativePath), 'utf8');

const readJson = async (relativePath) =>
  JSON.parse(await readText(relativePath));

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const protocol = await readText('docs/coordinates/coordinate-control-protocol.md');
const protocolBatches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...protocolBatches);
assert(protocolMaxBatch === 195, `Expected Oslo coordinate protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 already exists; this audit must be rerun from the new protocol state.');

const queue = await readJson('reports/oslo-coordinate-unresolved-queue-audit-post-195/summary.json');
assert(queue.coordinateMaxBatch === 195, 'The post-195 queue audit is not pinned to batch 195.');
assert(queue.activeUnresolvedOsloCount === 7, `Expected seven unresolved Oslo places, got ${queue.activeUnresolvedOsloCount}`);

const orderedQueue = [
  ...queue.groups.official_geometry_or_multi_anchor_research,
  ...queue.groups.identity_resolution,
  ...queue.groups.sensitive_or_thematic_model_decision,
  ...queue.groups.exact_object_or_coordinate_research,
].sort((a, b) => a.rank - b.rank || a.placeId.localeCompare(b.placeId));

const queueIds = new Set(orderedQueue.map((item) => item.placeId));
for (const expected of [
  'bryn_industriomrade',
  'bygdoy_natur',
  'frysja_industriomrade',
  'bygdoy_roykenvika',
  'bygdoy_kongsgard_salamanderdam',
  'ostensjovannet_sivbelte',
  'sigrid_undset_statue',
]) {
  assert(queueIds.has(expected), `Post-195 queue is missing ${expected}`);
}

const bryn = await readJson('reports/oslo-coordinate-bryn-official-scope-research-post-195/summary.json');
assert(bryn.placeId === 'bryn_industriomrade', 'Bryn report has the wrong placeId.');
assert(bryn.decision === 'keep_needs_source', `Unexpected Bryn decision: ${bryn.decision}`);
assert(bryn.canonicalChanged === false, 'Bryn research unexpectedly changed canonical data.');
assert(
  bryn.officialArcGis?.strongIndustrialCandidateCount === 0,
  'Bryn research found a strong official industrial candidate and must be reviewed before continuing.',
);

const bygdoy = await readJson('reports/oslo-coordinate-bygdoy-gulliste-scope-research-post-195-v5/summary.json');
assert(bygdoy.placeId === 'bygdoy_natur', 'Bygdøy report has the wrong placeId.');
assert(
  bygdoy.decision === 'official_bygdoy_cultural_environment_is_partial_scope_keep_needs_source',
  `Unexpected Bygdøy decision: ${bygdoy.decision}`,
);
assert(bygdoy.canonicalChanged === false, 'Bygdøy research unexpectedly changed canonical data.');
assert(bygdoy.lockedScope.expectedAnchorCount === 10, 'Bygdøy locked scope no longer contains ten anchors.');
assert(bygdoy.lockedScope.insideCount === 4, 'Bygdøy official polygon coverage changed; review the source before continuing.');
assert(bygdoy.lockedScope.outsideCount === 6, 'Bygdøy official polygon outside count changed; review the source before continuing.');

const frysja = await readJson('reports/oslo-coordinate-frysja-industrial-model-audit-post-191/summary.json');
assert(frysja.legacy.id === 'frysja_industriomrade', 'Frysja report has the wrong placeId.');
assert(frysja.evidence.decision.canBecomeVerified === false, 'Frysja research now allows verification and must be promoted instead of skipped.');
assert(
  frysja.evidence.decision.blockedReason.includes('mangler kildebelagt geometri'),
  'Frysja blocked reason no longer documents the missing source-backed geometry.',
);
assert(frysja.legacy.coordStatus === 'needs_source', 'Frysja is no longer unresolved; refresh the queue before continuing.');

const sigridExhausted = queue.recentlyExhaustedResearch?.some(
  (item) => item.placeId === 'sigrid_undset_statue' && item.decision === 'keep_needs_source',
);
assert(sigridExhausted, 'The post-195 queue does not preserve the exhausted Sigrid Undset decision.');

const exhausted = [
  {
    placeId: 'bryn_industriomrade',
    name: 'Bryn industriområde',
    researchPr: 3630,
    decision: bryn.decision,
    reason: 'No explicit official geometry was tied to the broad historical industrial-area identity.',
  },
  {
    placeId: 'bygdoy_natur',
    name: 'Bygdøy natur- og kulturmiljø',
    researchPr: 3637,
    decision: bygdoy.decision,
    reason: `The official cultural-environment component covers ${bygdoy.lockedScope.insideCount}/${bygdoy.lockedScope.expectedAnchorCount} locked peninsula anchors and omits material scope.`,
  },
  {
    placeId: 'frysja_industriomrade',
    name: 'Frysja industriområde',
    researchPr: 3567,
    decision: 'keep_needs_source',
    reason: frysja.evidence.decision.blockedReason,
  },
  {
    placeId: 'sigrid_undset_statue',
    name: 'Sigrid Undset-statuen',
    researchPr: 3628,
    decision: 'keep_needs_source',
    reason: 'Exact identity is documented, but no source-backed monument coordinate or geometry was found.',
  },
];

const exhaustedIds = new Set(exhausted.map((item) => item.placeId));
const remaining = orderedQueue.filter((item) => !exhaustedIds.has(item.placeId));
assert(remaining.length === 3, `Expected three non-exhausted queue items, got ${remaining.length}`);

const expectedRemaining = [
  'bygdoy_roykenvika',
  'bygdoy_kongsgard_salamanderdam',
  'ostensjovannet_sivbelte',
];
for (const [index, expected] of expectedRemaining.entries()) {
  assert(remaining[index]?.placeId === expected, `Expected remaining queue position ${index + 1} to be ${expected}, got ${remaining[index]?.placeId}`);
}

const nextCandidate = remaining[0];
assert(nextCandidate.identityStatus === 'unresolved', 'Røykensvika identity is no longer unresolved; refresh the decision before starting research.');

const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  researchOnly: true,
  canonicalChanged: false,
  sourceQueueReport: 'reports/oslo-coordinate-unresolved-queue-audit-post-195/summary.json',
  exhaustedResearchCount: exhausted.length,
  exhausted,
  remainingQueueCount: remaining.length,
  remainingQueue: remaining.map((item, index) => ({
    position: index + 1,
    placeId: item.placeId,
    name: item.name,
    bucket: item.bucket,
    identityStatus: item.identityStatus,
    blockedReason: item.blockedReason,
    nextAction: item.nextAction,
  })),
  nextCandidate: {
    placeId: nextCandidate.placeId,
    name: nextCandidate.name,
    bucket: nextCandidate.bucket,
    decision: 'research_identity_before_coordinate',
    hardConstraint: 'No coordinate or geometry may be selected until an independent credible source confirms a Bygdøy place identity named Røykensvika/Røykensvik.',
  },
};

const readme = `# Oslo coordinate research exhaustion audit after batch 195\n\n- Protocol max batch: **${protocolMaxBatch}**\n- Canonical data changed: **no**\n- Research tracks now treated as exhausted: **${exhausted.length}**\n- Remaining unresolved queue: **${remaining.length}**\n- Next candidate: **\`${nextCandidate.placeId}\` — ${nextCandidate.name}**\n\n## Exhausted without production promotion\n\n${exhausted.map((item) => `- \`${item.placeId}\` — ${item.name} — PR #${item.researchPr} — \`${item.decision}\`: ${item.reason}`).join('\n')}\n\n## Remaining ordered queue\n\n${remaining.map((item, index) => `${index + 1}. \`${item.placeId}\` — ${item.name} — \`${item.bucket}\``).join('\n')}\n\nThe earlier Frysja audit is still valid on current data: the broad area remains \`needs_source\` and no source-backed geometry or documented multi-anchor model has appeared. Replaying the same research would create churn rather than new evidence.\n\nThe next pass must resolve the claimed local identity \`bygdoy_roykenvika\` before any coordinate work. No nearest/first-hit, legacy-point reuse or name similarity outside Bygdøy is permitted.\n`;

await fs.mkdir(reportDir, { recursive: true });
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), readme, 'utf8');

console.log(JSON.stringify({
  status: 'audit_complete',
  reportDir: 'reports/oslo-coordinate-research-exhaustion-audit-post-195',
  protocolMaxBatch,
  exhaustedResearchCount: exhausted.length,
  remainingQueueCount: remaining.length,
  nextCandidate: nextCandidate.placeId,
}, null, 2));
