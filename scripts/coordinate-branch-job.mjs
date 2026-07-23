#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const targetId = 'bantjern_salamanderlokalitet';
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-166-bantjern-private-proxy-research');
fs.mkdirSync(reportDir, { recursive: true });

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') return [];
      return walk(full);
    }
    return [full];
  });
}

function findJsonPaths(value, needle, currentPath = '$', out = []) {
  if (value === needle) out.push(currentPath);
  if (Array.isArray(value)) {
    value.forEach((item, index) => findJsonPaths(item, needle, `${currentPath}[${index}]`, out));
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) findJsonPaths(item, needle, `${currentPath}.${key}`, out);
  }
  return out;
}

const jsonRefs = [];
const textRefs = [];
const possibleBantjernPlaces = [];
for (const file of walk(root)) {
  const rel = path.relative(root, file).replaceAll('\\', '/');
  if (rel.startsWith('reports/coordinate-branch-runner/')) continue;
  if (!/\.(json|md|js|mjs|ts|tsx|html|yml|yaml)$/i.test(file)) continue;
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { continue; }
  if (text.includes(targetId)) textRefs.push(rel);
  if (!file.endsWith('.json')) continue;
  let parsed;
  try { parsed = JSON.parse(text); } catch { continue; }
  const paths = findJsonPaths(parsed, targetId);
  if (paths.length) jsonRefs.push({ file: rel, paths });
  const entries = Array.isArray(parsed) ? parsed : [parsed];
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const id = String(entry.id || '');
    const name = String(entry.name || '');
    if (/b[aå]ntjern/i.test(id) || /b[aå]ntjern/i.test(name)) {
      possibleBantjernPlaces.push({ file: rel, id: entry.id || null, name: entry.name || null, coordStatus: entry.coordStatus || null, sourceObjectId: entry.sourceObjectId || null });
    }
  }
}

const exclusions = JSON.parse(fs.readFileSync(path.join(root, 'data/places/place_exclusions.json'), 'utf8'));
const runtimeIndex = JSON.parse(fs.readFileSync(path.join(root, 'data/places/places_index.json'), 'utf8'));
const runtimeMatches = runtimeIndex.filter((entry) => entry?.id === targetId || /b[aå]ntjern/i.test(String(entry?.id || '')) || /b[aå]ntjern/i.test(String(entry?.name || '')));
const targetSource = JSON.parse(fs.readFileSync(path.join(root, 'data/places/natur/oslo/places_oslo_natur_salamanderdammer/bantjern_salamanderlokalitet.json'), 'utf8'));

const report = {
  generatedAt: new Date().toISOString(),
  targetId,
  targetSource: {
    name: targetSource.name,
    coordStatus: targetSource.coordStatus,
    coordType: targetSource.coordType,
    locatorType: targetSource.locatorType,
    sourceHint: targetSource.sourceHint,
    avoidAngles: targetSource.quiz_profile?.avoid_angles || [],
    coordNote: targetSource.coordNote,
  },
  currentlyDisabled: exclusions.disabledPlaceIds?.includes(targetId) || false,
  runtimeMatches,
  exactJsonReferences: jsonRefs,
  exactTextReferenceFiles: [...new Set(textRefs)].sort(),
  possibleBantjernPlaces: [...new Map(possibleBantjernPlaces.map((item) => [`${item.file}:${item.id}`, item])).values()],
  decision: {
    coordinatePromotionAllowed: false,
    reason: 'The canonical record itself states that the documented salamander pond is private and that the current public Båntjern point is only a pedagogical near-anchor. Promoting either the public lake proxy or a precise private pond location would violate the place identity and visitability model.',
    recommendedAction: 'Retire the active proxy place through place_exclusions while preserving its source record as historical/research content. Remove or retarget active place-reference fields that would otherwise point to the retired ID. Do not publish a precise private habitat coordinate.',
  },
};

fs.writeFileSync(path.join(reportDir, 'reference-audit.json'), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(reportDir, 'README.md'), `# Batch 166 – Båntjern private-proxy audit\n\nThis is a read-only reference audit for \`${targetId}\`. The source record explicitly distinguishes the private documented salamander pond from the public Båntjern near-anchor.\n\n- runtime matches: ${runtimeMatches.length}\n- JSON files with exact references: ${jsonRefs.length}\n- already disabled: ${report.currentlyDisabled}\n- recommended action: retire the active proxy rather than publish a false public coordinate or a precise private habitat coordinate.\n`);

console.log(JSON.stringify({
  batch: 166,
  targetId,
  currentlyDisabled: report.currentlyDisabled,
  runtimeMatchCount: runtimeMatches.length,
  referenceFileCount: jsonRefs.length,
  possibleBantjernPlaceCount: report.possibleBantjernPlaces.length,
  decision: report.decision,
}, null, 2));
