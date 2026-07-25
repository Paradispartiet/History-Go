import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const placesRoot = path.join(root, 'data/places');
const evidenceRoot = path.join(root, 'data/coordinate-evidence/oslo');
const reportDir = path.join(root, 'reports/oslo-coordinate-fresh-main-audit-20260725-final');
await fs.mkdir(reportDir, { recursive: true });

const resolvedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const newlyResolved = [
  'nybrua_pilarrom',
  'clemenskirken',
  'hallvardskatedralen',
  'kongsgarden_middelalder_oslo',
  'korskirken',
  'mariakirken',
  'olavsklosteret',
  'tukthuset',
];
const newlyExhausted = [
  'gronland_underganger',
  'grunerlokka_bakgardsvegger',
  'hausmannsgate_aksen',
  'kolstadgata_toyen_vegger',
  'kuba_akselpassasjer',
  'schweigaards_gate_lodalen',
  'vulkan_murvegger',
  'anatomigarden',
  'bispeborgen',
];
const previousActionable = [...newlyResolved, ...newlyExhausted];

async function walk(dir) {
  const out = [];
  let entries = [];
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}
const rel = (full) => path.relative(root, full).split(path.sep).join('/');

function extractRows(value) {
  if (Array.isArray(value)) return value.filter((row) => row && typeof row === 'object' && typeof row.id === 'string');
  if (value && typeof value === 'object' && typeof value.id === 'string') return [value];
  for (const key of ['places', 'data', 'items']) {
    if (Array.isArray(value?.[key])) return value[key].filter((row) => row && typeof row === 'object' && typeof row.id === 'string');
  }
  return [];
}
function scoreCandidate(sourcePath, rootValue, id) {
  let score = 0;
  if (!Array.isArray(rootValue) && rootValue?.id === id) score += 100;
  if (sourcePath.endsWith(`/${id}.json`)) score += 50;
  if (/\/places_[^/]+\//.test(sourcePath) || /\/places\//.test(sourcePath)) score += 20;
  if (sourcePath.includes('_index') || sourcePath.includes('_manifest')) score -= 200;
  return score;
}

const sourceFiles = (await walk(placesRoot)).filter((full) => {
  const sourcePath = rel(full);
  return sourcePath.split('/').includes('oslo')
    && !sourcePath.endsWith('_index.json')
    && !sourcePath.endsWith('_manifest.json')
    && !sourcePath.includes('/arkiv/');
});
const byId = new Map();
let sourceRows = 0;
for (const file of sourceFiles) {
  const sourcePath = rel(file);
  let payload;
  try { payload = JSON.parse(await fs.readFile(file, 'utf8')); } catch { continue; }
  for (const row of extractRows(payload)) {
    sourceRows += 1;
    const candidate = { row, sourcePath, score: scoreCandidate(sourcePath, payload, row.id) };
    const current = byId.get(row.id);
    if (!current || candidate.score > current.score) byId.set(row.id, candidate);
  }
}

const evidenceById = new Map();
for (const file of await walk(evidenceRoot)) {
  let value = null;
  try { value = JSON.parse(await fs.readFile(file, 'utf8')); } catch {}
  evidenceById.set(path.basename(file, '.json'), { path: rel(file), value });
}
function evidenceDecision(evidence) {
  const value = evidence?.value;
  if (!value || typeof value !== 'object') return {};
  const decision = value.decision && typeof value.decision === 'object' ? value.decision : {};
  return {
    canBecomeVerified: decision.canBecomeVerified ?? value.canBecomeVerified ?? null,
    blockedReason: decision.blockedReason ?? value.blockedReason ?? null,
    nextAction: decision.nextAction ?? value.nextAction ?? null,
    evidenceStatus: value.evidenceStatus ?? null,
  };
}

const active = [];
for (const [placeId, candidate] of byId) {
  const row = candidate.row;
  if (row.disabled === true || row.active === false) continue;
  const evidence = evidenceById.get(placeId) || null;
  active.push({
    placeId,
    name: row.name || null,
    category: row.category || null,
    sourcePath: candidate.sourcePath,
    coordStatus: row.coordStatus || null,
    coordType: row.coordType || null,
    locatorType: row.locatorType || null,
    sourceProvider: row.sourceProvider || null,
    sourceObjectId: row.sourceObjectId || null,
    lat: row.lat ?? null,
    lon: row.lon ?? null,
    radius: row.r ?? null,
    evidencePath: evidence?.path || null,
    ...evidenceDecision(evidence),
  });
}

const unresolved = active.filter((row) => !resolvedStatuses.has(row.coordStatus));
const exhausted = unresolved.filter((row) => row.canBecomeVerified === false && Boolean(row.blockedReason));
const actionable = unresolved.filter((row) => !exhausted.includes(row));
const statusCounts = {};
for (const row of active) {
  const key = row.coordStatus || '(missing)';
  statusCounts[key] = (statusCounts[key] || 0) + 1;
}

const closureRows = previousActionable.map((placeId) => {
  const row = active.find((item) => item.placeId === placeId) || null;
  const expectedOutcome = newlyResolved.includes(placeId) ? 'resolved' : 'exhausted';
  const actualOutcome = !row
    ? 'missing'
    : resolvedStatuses.has(row.coordStatus)
      ? 'resolved'
      : row.canBecomeVerified === false && Boolean(row.blockedReason)
        ? 'exhausted'
        : 'actionable';
  return {
    placeId,
    expectedOutcome,
    actualOutcome,
    matches: expectedOutcome === actualOutcome,
    coordStatus: row?.coordStatus ?? null,
    coordType: row?.coordType ?? null,
    evidencePath: row?.evidencePath ?? null,
    sourceObjectId: row?.sourceObjectId ?? null,
  };
});
const closureFailures = closureRows.filter((row) => !row.matches);
if (closureFailures.length) throw new Error(`Previous actionable closure failed: ${JSON.stringify(closureFailures)}`);
if (actionable.length) throw new Error(`Fresh main still has actionable Oslo coordinate candidates: ${actionable.map((row) => row.placeId).join(', ')}`);

const summary = {
  version: '2026-07-25-final',
  generatedFrom: 'fresh main after subculture and historical production',
  sourceFilesRead: sourceFiles.length,
  sourceRows,
  uniqueActiveOsloPlaces: active.length,
  resolvedActiveCount: active.length - unresolved.length,
  unresolvedActiveCount: unresolved.length,
  exhaustedUnresolvedCount: exhausted.length,
  actionableUnresolvedCount: actionable.length,
  missingEvidenceCount: unresolved.filter((row) => !row.evidencePath).length,
  statusCounts,
  previousActionableClosure: {
    candidateCount: closureRows.length,
    resolvedCount: closureRows.filter((row) => row.actualOutcome === 'resolved').length,
    exhaustedCount: closureRows.filter((row) => row.actualOutcome === 'exhausted').length,
    failureCount: closureFailures.length,
    candidates: closureRows,
  },
  knownExhausted: exhausted.sort((a, b) => a.placeId.localeCompare(b.placeId, 'nb')),
  actionableQueue: actionable,
};
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(
  path.join(reportDir, 'README.md'),
  `# Final fresh-main Oslo coordinate audit — 2026-07-25\n\nActive: ${active.length}\nResolved: ${summary.resolvedActiveCount}\nUnresolved but exhausted: ${summary.exhaustedUnresolvedCount}\nActionable: ${summary.actionableUnresolvedCount}\n\nAll ${closureRows.length} candidates from the previous actionable queue are closed: ${summary.previousActionableClosure.resolvedCount} resolved and ${summary.previousActionableClosure.exhaustedCount} exhausted.\n`,
  'utf8',
);
console.log(JSON.stringify({
  active: active.length,
  resolved: summary.resolvedActiveCount,
  unresolved: summary.unresolvedActiveCount,
  exhausted: summary.exhaustedUnresolvedCount,
  actionable: summary.actionableUnresolvedCount,
  closure: summary.previousActionableClosure,
}, null, 2));
