import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const placesRoot = path.join(root, 'data/places');
const evidenceRoot = path.join(root, 'data/coordinate-evidence/oslo');
const reportDir = path.join(root, 'reports/oslo-coordinate-fresh-main-audit-20260725');
await fs.mkdir(reportDir, { recursive: true });

const resolvedStatuses = new Set(['verified', 'verified_geometry', 'verified_historical_source']);
const recentlyResolvedIds = [
  'psykologisk_institutt_uio',
  'radiumhospitalet',
  'rikshospitalet',
  'teknisk_museum',
  'universitetet_i_oslo_blindern',
  'universitetets_gamle_hovedbygning',
  'tvergastein',
];

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

function normalizePath(full) {
  return path.relative(root, full).split(path.sep).join('/');
}

function extractRows(value) {
  if (Array.isArray(value)) return value.filter((row) => row && typeof row === 'object' && typeof row.id === 'string');
  if (value && typeof value === 'object' && typeof value.id === 'string') return [value];
  for (const key of ['places', 'data', 'items']) {
    if (Array.isArray(value?.[key])) return value[key].filter((row) => row && typeof row === 'object' && typeof row.id === 'string');
  }
  return [];
}

function sourceScore(sourcePath, rootValue, id) {
  let score = 0;
  if (!Array.isArray(rootValue) && rootValue?.id === id) score += 100;
  if (sourcePath.endsWith(`/${id}.json`)) score += 50;
  if (/\/places_[^/]+\//.test(sourcePath) || /\/places\//.test(sourcePath)) score += 20;
  if (sourcePath.includes('_index') || sourcePath.includes('_manifest')) score -= 200;
  return score;
}

const sourceFiles = (await walk(placesRoot)).filter((full) => {
  const rel = normalizePath(full);
  return rel.split('/').includes('oslo') && !rel.endsWith('_index.json') && !rel.endsWith('_manifest.json');
});

const candidatesById = new Map();
let sourceRows = 0;
for (const file of sourceFiles) {
  const sourcePath = normalizePath(file);
  let rootValue;
  try { rootValue = JSON.parse(await fs.readFile(file, 'utf8')); } catch { continue; }
  for (const row of extractRows(rootValue)) {
    sourceRows += 1;
    const candidate = { row, sourcePath, score: sourceScore(sourcePath, rootValue, row.id) };
    const current = candidatesById.get(row.id);
    if (!current || candidate.score > current.score) candidatesById.set(row.id, candidate);
  }
}

const evidenceById = new Map();
for (const file of await walk(evidenceRoot)) {
  const id = path.basename(file, '.json');
  let value = null;
  try { value = JSON.parse(await fs.readFile(file, 'utf8')); } catch {}
  evidenceById.set(id, { path: normalizePath(file), value });
}

function evidenceDecision(evidence) {
  if (!evidence?.value || typeof evidence.value !== 'object') return {};
  const value = evidence.value;
  const decision = value.decision && typeof value.decision === 'object' ? value.decision : {};
  return {
    canBecomeVerified: decision.canBecomeVerified ?? value.canBecomeVerified ?? null,
    blockedReason: decision.blockedReason ?? value.blockedReason ?? null,
    exhaustedResearch: decision.exhaustedResearch ?? value.exhaustedResearch ?? false,
    exhaustedDecision: decision.exhaustedDecision ?? value.exhaustedDecision ?? null,
    nextAction: decision.nextAction ?? value.nextAction ?? null,
  };
}

const active = [];
for (const [id, candidate] of candidatesById) {
  const row = candidate.row;
  if (row.disabled === true || row.active === false) continue;
  const evidence = evidenceById.get(id) || null;
  const decision = evidenceDecision(evidence);
  active.push({
    placeId: id,
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
    ...decision,
  });
}

const unresolved = active.filter((row) => !resolvedStatuses.has(row.coordStatus));
const exhausted = unresolved.filter((row) => row.exhaustedResearch === true || (row.canBecomeVerified === false && Boolean(row.blockedReason)));
const actionable = unresolved.filter((row) => !exhausted.includes(row));

function priority(row) {
  let score = 0;
  if (!row.coordStatus) score += 100;
  else if (row.coordStatus === 'needs_source') score += 90;
  else if (row.coordStatus === 'legacy_unverified') score += 80;
  else score += 50;
  if (!row.evidencePath) score += 20;
  if (row.sourceObjectId) score += 5;
  if (row.category === 'vitenskap') score += 3;
  return score;
}
for (const row of actionable) row.auditPriorityScore = priority(row);
actionable.sort((a, b) => b.auditPriorityScore - a.auditPriorityScore || a.placeId.localeCompare(b.placeId, 'nb'));
exhausted.sort((a, b) => a.placeId.localeCompare(b.placeId, 'nb'));

const statusCounts = {};
for (const row of active) {
  const key = row.coordStatus || '(missing)';
  statusCounts[key] = (statusCounts[key] || 0) + 1;
}

const recentlyResolved = recentlyResolvedIds.map((id) => {
  const row = active.find((item) => item.placeId === id) || null;
  return row ? {
    placeId: id,
    coordStatus: row.coordStatus,
    coordType: row.coordType,
    locatorType: row.locatorType,
    sourceProvider: row.sourceProvider,
    sourceObjectId: row.sourceObjectId,
    lat: row.lat,
    lon: row.lon,
    radius: row.radius,
    sourcePath: row.sourcePath,
    resolved: resolvedStatuses.has(row.coordStatus),
  } : { placeId: id, missing: true, resolved: false };
});

if (recentlyResolved.some((row) => !row.resolved)) {
  throw new Error(`Recent production result missing or unresolved: ${JSON.stringify(recentlyResolved.filter((row) => !row.resolved))}`);
}

const summary = {
  version: '2026-07-25',
  generatedFrom: 'fresh main via one-shot coordinate runner',
  sourceFilesRead: sourceFiles.length,
  sourceRows,
  uniqueActiveOsloPlaces: active.length,
  resolvedActiveCount: active.length - unresolved.length,
  unresolvedActiveCount: unresolved.length,
  exhaustedUnresolvedCount: exhausted.length,
  actionableUnresolvedCount: actionable.length,
  missingEvidenceCount: unresolved.filter((row) => !row.evidencePath).length,
  statusCounts,
  recentlyResolved,
  knownExhausted: exhausted,
  actionableQueue: actionable,
};

await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
const top = actionable.slice(0, 10).map((row, index) => `${index + 1}. ${row.placeId} — ${row.name || 'uten navn'} (${row.category || 'ukjent'}, status ${row.coordStatus || 'mangler'})`).join('\n');
await fs.writeFile(path.join(reportDir, 'README.md'), `# Fresh main Oslo coordinate audit — 2026-07-25\n\nActive: ${active.length}\nResolved: ${active.length - unresolved.length}\nUnresolved: ${unresolved.length}\nActionable: ${actionable.length}\nExhausted: ${exhausted.length}\n\n## Top actionable\n\n${top || 'Ingen.'}\n`, 'utf8');
console.log(JSON.stringify({ active: active.length, unresolved: unresolved.length, actionable: actionable.length, exhausted: exhausted.length, top: actionable.slice(0, 10).map((row) => row.placeId), recentlyResolved }, null, 2));
