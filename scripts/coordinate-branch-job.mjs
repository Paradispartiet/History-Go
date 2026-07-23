#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const scanRoot = path.join(root, 'data/places/natur/oslo');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-166-unresolved-inventory');
fs.mkdirSync(reportDir, { recursive: true });

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const statusRank = {
  needs_source: 0,
  needs_review: 1,
  review: 2,
  unresolved: 3,
};

const records = [];
for (const file of walk(scanRoot).filter((file) => file.endsWith('.json'))) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if (rel.endsWith('_index.json') || rel.endsWith('_manifest.json')) continue;
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    continue;
  }
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  for (const place of entries) {
    if (!place || typeof place !== 'object' || !place.id) continue;
    const coordStatus = String(place.coordStatus || 'missing');
    const coordType = String(place.coordType || 'missing');
    const sourceProvider = String(place.sourceProvider || 'missing');
    const unresolved =
      coordStatus === 'needs_source' ||
      coordStatus === 'needs_review' ||
      coordStatus === 'review' ||
      coordStatus === 'unresolved' ||
      coordType === 'legacy_unverified' ||
      sourceProvider === 'manual_research' && !coordStatus.startsWith('verified');
    if (!unresolved) continue;
    records.push({
      id: place.id,
      name: place.name || '',
      category: place.category || 'natur',
      coordStatus,
      coordType,
      sourceProvider,
      sourceObjectId: place.sourceObjectId || null,
      locatorType: place.locatorType || null,
      lat: place.lat ?? null,
      lon: place.lon ?? null,
      routeId: place.routeId || null,
      file: rel,
      isAggregateRecord: Array.isArray(parsed),
      coordNote: place.coordNote || '',
    });
  }
}

// De-duplicate aggregate/split copies, preferring one-object split files.
const byId = new Map();
for (const record of records) {
  const existing = byId.get(record.id);
  if (!existing || (existing.isAggregateRecord && !record.isAggregateRecord)) byId.set(record.id, record);
}
const unique = [...byId.values()].sort((a, b) => {
  const aRank = statusRank[a.coordStatus] ?? (a.coordType === 'legacy_unverified' ? 4 : 5);
  const bRank = statusRank[b.coordStatus] ?? (b.coordType === 'legacy_unverified' ? 4 : 5);
  return aRank - bRank || a.id.localeCompare(b.id, 'nb');
});

const report = {
  generatedAt: new Date().toISOString(),
  scope: 'data/places/natur/oslo canonical JSON records',
  unresolvedCount: unique.length,
  statusCounts: Object.fromEntries([...new Set(unique.map((record) => record.coordStatus))].sort().map((status) => [status, unique.filter((record) => record.coordStatus === status).length])),
  records: unique,
  nextCandidate: unique[0] || null,
  selectionRule: 'Rank explicit coordStatus=needs_source first, then needs_review/review/unresolved. De-duplicate aggregate and split copies by place ID and prefer the one-object split file. This report does not modify canonical place data.',
};

fs.writeFileSync(path.join(reportDir, 'unresolved-oslo-natur.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'README.md'), `# Oslo natur unresolved coordinate inventory\n\nRead-only inventory generated from canonical JSON under \`data/places/natur/oslo\`.\n\n- unresolved records: ${unique.length}\n- next ranked candidate: ${unique[0] ? `\`${unique[0].id}\` — ${unique[0].name}` : 'none'}\n\nNo canonical place data is changed by this batch.\n`);

console.log(JSON.stringify({
  batch: 166,
  unresolvedCount: unique.length,
  statusCounts: report.statusCounts,
  nextCandidate: report.nextCandidate,
}, null, 2));
