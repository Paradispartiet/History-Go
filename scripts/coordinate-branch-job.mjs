import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const id = 'bygdoy_roykenvika';
const reportRel = 'reports/oslo-coordinate-bygdoy-roykenvika-retirement-post-195';
const splitRel = `data/places/natur/oslo/places_oslo_natur_bygdoy/${id}.json`;
const evidenceRel = `data/coordinate-evidence/oslo/natur/${id}.json`;
const aggregateRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy.json';
const splitManifestRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy_manifest.json';
const evidenceManifestRel = 'data/coordinate-evidence/manifest.json';
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const readText = (rel) => fs.readFile(path.join(root, rel), 'utf8');
const readJson = async (rel) => JSON.parse(await readText(rel));
const writeJson = (rel, value) => fs.writeFile(path.join(root, rel), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const exists = (rel) => fs.access(path.join(root, rel)).then(() => true, () => false);
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');

const protocol = await readText('docs/coordinates/coordinate-control-protocol.md');
const maxBatch = Math.max(...[...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((m) => Number(m[1])));
assert(maxBatch === 195 && !/^\|\s*196\s*\|/m.test(protocol), `Expected protocol to stop at batch 195, got ${maxBatch}`);

const research = await readJson('reports/oslo-coordinate-bygdoy-roykenvika-identity-research-post-195/summary.json');
assert(research.placeId === id && research.decision === 'identity_unsubstantiated_recommend_retirement', 'Retirement research gate failed.');
for (const key of ['kartverketExactOsloCandidates', 'kartverketExactBygdoyHits', 'mediaWikiBygdoyHits', 'nationalLibraryBygdoyMetadataHits']) {
  assert(research.matchCounts?.[key] === 0, `Research gate ${key} is no longer zero.`);
}
assert(await exists(splitRel), 'Split place is already absent.');
assert(await exists(evidenceRel), 'Coordinate evidence is already absent.');
const split = await readJson(splitRel);
assert(split.id === id && split.coordStatus === 'needs_source', 'Place is no longer an unresolved retirement candidate.');

const stats = { removedRecords: 0, removedStrings: 0, removedKeys: 0 };
const isTargetString = (value) => typeof value === 'string' && (value === id || value.endsWith(`/${id}.json`));
const isTargetRecord = (value) => value && typeof value === 'object' && !Array.isArray(value) &&
  [value.id, value.placeId, value.historyGoPlaceId, value.place_id, value.placeID].includes(id);
const transform = (value) => {
  if (Array.isArray(value)) return value.flatMap((item) => {
    if (isTargetString(item)) { stats.removedStrings += 1; return []; }
    if (isTargetRecord(item)) { stats.removedRecords += 1; return []; }
    return [transform(item)];
  });
  if (value && typeof value === 'object') {
    const output = {};
    for (const [key, child] of Object.entries(value)) {
      if (key === id || isTargetRecord(child)) {
        if (key === id) stats.removedKeys += 1; else stats.removedRecords += 1;
        continue;
      }
      output[key] = transform(child);
    }
    return output;
  }
  return value;
};

const walkJson = async (rel) => {
  const files = [];
  for (const entry of await fs.readdir(path.join(root, rel), { withFileTypes: true })) {
    const child = path.join(rel, entry.name);
    if (entry.isDirectory()) files.push(...await walkJson(child));
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(child);
  }
  return files;
};

const activeRoots = ['data/Civication', 'data/i18n/content/places', 'data/leksikon', 'data/natur', 'data/quiz', 'data/stories', 'data/wonderkammer'];
const changedReferenceFiles = [];
for (const activeRoot of activeRoots) {
  if (!await exists(activeRoot)) continue;
  for (const rel of await walkJson(activeRoot)) {
    const before = await readText(rel);
    if (!before.includes(id)) continue;
    const after = `${JSON.stringify(transform(JSON.parse(before)), null, 2)}\n`;
    assert(!after.includes(id), `Active reference remains after transformation: ${rel}`);
    await fs.writeFile(path.join(root, rel), after, 'utf8');
    changedReferenceFiles.push(rel);
  }
}

const aggregate = await readJson(aggregateRel);
const aggregateBeforeCount = aggregate.length;
const aggregateAfter = aggregate.filter((place) => place?.id !== id);
assert(aggregateAfter.length === aggregateBeforeCount - 1, 'Expected one aggregate place removal.');
await writeJson(aggregateRel, aggregateAfter);
await fs.unlink(path.join(root, splitRel));
await fs.unlink(path.join(root, evidenceRel));

const aggregateText = await readText(aggregateRel);
const splitManifest = await readJson(splitManifestRel);
const splitManifestBeforeCount = splitManifest.places.length;
splitManifest.places = splitManifest.places.filter((entry) => entry.id !== id).map((entry, order) => ({ ...entry, order }));
assert(splitManifest.places.length === splitManifestBeforeCount - 1, 'Expected one split-manifest removal.');
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256(aggregateText);
splitManifest.generated_at = new Date().toISOString();
await writeJson(splitManifestRel, splitManifest);

const evidenceManifest = transform(await readJson(evidenceManifestRel));
const evidenceManifestText = `${JSON.stringify(evidenceManifest, null, 2)}\n`;
assert(!evidenceManifestText.includes(id), 'Coordinate evidence manifest still references the retired place.');
await fs.writeFile(path.join(root, evidenceManifestRel), evidenceManifestText, 'utf8');

const remaining = [];
for (const activeRoot of [...activeRoots, 'data/places', 'data/coordinate-evidence']) {
  if (!await exists(activeRoot)) continue;
  for (const rel of await walkJson(activeRoot)) if ((await readText(rel)).includes(id)) remaining.push(rel);
}
assert(remaining.length === 0, `Active references remain: ${remaining.join(', ')}`);

await fs.mkdir(path.join(root, reportRel), { recursive: true });
const summary = {
  version: '2026-07-24',
  protocolMaxBatch: maxBatch,
  placeId: id,
  decision: 'retired_unsubstantiated_identity',
  sourceResearch: 'reports/oslo-coordinate-bygdoy-roykenvika-identity-research-post-195/summary.json',
  canonicalChanged: true,
  coordinateSelected: false,
  aggregateBeforeCount,
  aggregateAfterCount: aggregateAfter.length,
  splitManifestBeforeCount,
  splitManifestAfterCount: splitManifest.places.length,
  removedPrimaryFiles: [splitRel, evidenceRel],
  changedReferenceFiles,
  stats,
  remainingActiveReferences: remaining,
  nextQueueCandidate: 'bygdoy_kongsgard_salamanderdam'
};
await writeJson(`${reportRel}/summary.json`, summary);
await fs.writeFile(path.join(root, reportRel, 'README.md'), `# Retire Bygdøy Røykensvika after batch 195\n\n- Decision: **retired_unsubstantiated_identity**\n- Coordinate selected: **no**\n- Active references remaining: **0**\n- Next queue candidate: **bygdoy_kongsgard_salamanderdam**\n`, 'utf8');
console.log(JSON.stringify({ status: 'retirement_complete', ...summary }, null, 2));
