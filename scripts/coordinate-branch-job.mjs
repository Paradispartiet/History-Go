import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const placesRoot = path.join(root, 'data/places');
const evidenceRoot = path.join(root, 'data/coordinate-evidence/oslo');
const reportDir = path.join(root, 'reports/oslo-coordinate-fresh-main-audit-20260725-final-v2');
await fs.mkdir(reportDir, { recursive: true });

const resolvedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);

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
  for (const key of ['places', 'items', 'data']) {
    if (Array.isArray(value?.[key])) return value[key].filter((row) => row && typeof row === 'object' && typeof row.id === 'string');
  }
  return [];
}
function score(sourcePath, payload, placeId) {
  let value = 0;
  if (!Array.isArray(payload) && payload?.id === placeId) value += 100;
  if (sourcePath.endsWith(`/${placeId}.json`)) value += 50;
  if (/\/places_[^/]+\//.test(sourcePath) || /\/places\//.test(sourcePath)) value += 20;
  if (sourcePath.includes('_index') || sourcePath.includes('_manifest')) value -= 200;
  return value;
}

const canonicalById = new Map();
let sourceRows = 0;
const sourceFiles = (await walk(placesRoot)).filter((file) => {
  const sourcePath = rel(file);
  return sourcePath.split('/').includes('oslo')
    && !sourcePath.endsWith('_index.json')
    && !sourcePath.endsWith('_manifest.json')
    && !sourcePath.includes('/arkiv/');
});
for (const file of sourceFiles) {
  const sourcePath = rel(file);
  let payload;
  try { payload = JSON.parse(await fs.readFile(file, 'utf8')); } catch { continue; }
  for (const row of extractRows(payload)) {
    sourceRows += 1;
    const candidate = { row, sourcePath, score: score(sourcePath, payload, row.id) };
    const current = canonicalById.get(row.id);
    if (!current || candidate.score > current.score) canonicalById.set(row.id, candidate);
  }
}

const evidenceById = new Map();
for (const file of await walk(evidenceRoot)) {
  let value = null;
  try { value = JSON.parse(await fs.readFile(file, 'utf8')); } catch {}
  evidenceById.set(path.basename(file, '.json'), { path: rel(file), value });
}
function decisionFrom(evidence) {
  const value = evidence?.value;
  if (!value || typeof value !== 'object') return {};
  const decision = value.decision && typeof value.decision === 'object' ? value.decision : {};
  return {
    canBecomeVerified: decision.canBecomeVerified ?? value.canBecomeVerified ?? null,
    blockedReason: decision.blockedReason ?? value.blockedReason ?? null,
    evidenceStatus: value.evidenceStatus ?? null,
  };
}

const active = [];
for (const [placeId, candidate] of canonicalById) {
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
    ...decisionFrom(evidence),
  });
}

const unresolved = active.filter((row) => !resolvedStatuses.has(row.coordStatus));
const exhausted = unresolved.filter((row) => row.canBecomeVerified === false && Boolean(row.blockedReason));
const actionable = unresolved.filter((row) => !exhausted.includes(row));
const missingStatus = active.filter((row) => !row.coordStatus);
const missingEvidence = unresolved.filter((row) => !row.evidencePath);
const statusCounts = {};
for (const row of active) {
  const key = row.coordStatus || '(missing)';
  statusCounts[key] = (statusCounts[key] || 0) + 1;
}

const bryn = active.find((row) => row.placeId === 'bryn_industriomrade');
if (!bryn || bryn.coordStatus !== 'needs_source' || bryn.coordType !== 'unverified_area_anchor' || bryn.canBecomeVerified !== false) {
  throw new Error(`Bryn normalization missing: ${JSON.stringify(bryn)}`);
}
if (actionable.length) throw new Error(`Actionable Oslo candidates remain: ${actionable.map((row) => row.placeId).join(', ')}`);
if (missingStatus.length) throw new Error(`Active Oslo places still miss coordStatus: ${missingStatus.map((row) => row.placeId).join(', ')}`);
if (missingEvidence.length) throw new Error(`Unresolved Oslo places still miss evidence: ${missingEvidence.map((row) => row.placeId).join(', ')}`);

const summary = {
  version: '2026-07-25-final-v2',
  generatedFrom: 'fresh main after Bryn status normalization',
  sourceFilesRead: sourceFiles.length,
  sourceRows,
  uniqueActiveOsloPlaces: active.length,
  resolvedActiveCount: active.length - unresolved.length,
  unresolvedActiveCount: unresolved.length,
  exhaustedUnresolvedCount: exhausted.length,
  actionableUnresolvedCount: actionable.length,
  missingStatusCount: missingStatus.length,
  missingEvidenceCount: missingEvidence.length,
  statusCounts,
  brynNormalization: {
    placeId: bryn.placeId,
    coordStatus: bryn.coordStatus,
    coordType: bryn.coordType,
    locatorType: bryn.locatorType,
    sourceObjectId: bryn.sourceObjectId,
    evidencePath: bryn.evidencePath,
    canBecomeVerified: bryn.canBecomeVerified,
    coordinateUnchanged: bryn.lat === 59.9129 && bryn.lon === 10.8251 && bryn.radius === 250,
  },
  actionableQueue: actionable,
  knownExhausted: exhausted.sort((a, b) => a.placeId.localeCompare(b.placeId, 'nb')),
};
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(
  path.join(reportDir, 'README.md'),
  `# Final normalized Oslo coordinate audit — 2026-07-25\n\nActive: ${active.length}\nResolved: ${summary.resolvedActiveCount}\nUnresolved but exhausted: ${summary.exhaustedUnresolvedCount}\nActionable: ${summary.actionableUnresolvedCount}\nMissing coordStatus: ${summary.missingStatusCount}\nMissing evidence: ${summary.missingEvidenceCount}\n`,
  'utf8',
);
console.log(JSON.stringify({
  active: active.length,
  resolved: summary.resolvedActiveCount,
  unresolved: summary.unresolvedActiveCount,
  exhausted: summary.exhaustedUnresolvedCount,
  actionable: summary.actionableUnresolvedCount,
  missingStatus: summary.missingStatusCount,
  missingEvidence: summary.missingEvidenceCount,
  bryn: summary.brynNormalization,
}, null, 2));
