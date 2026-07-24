import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const targetId = 'bygdoy_roykenvika';
const reportRel = 'reports/oslo-coordinate-bygdoy-roykenvika-retirement-post-195';
const reportDir = path.join(root, reportRel);
const splitRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy/bygdoy_roykenvika.json';
const evidenceRel = 'data/coordinate-evidence/oslo/natur/bygdoy_roykenvika.json';
const aggregateRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy.json';
const manifestRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy_manifest.json';
const evidenceManifestRel = 'data/coordinate-evidence/manifest.json';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const sha256 = (text) => crypto.createHash('sha256').update(text).digest('hex');
const readText = async (relativePath) => fs.readFile(path.join(root, relativePath), 'utf8');
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));
const writeJson = async (relativePath, value) => fs.writeFile(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
const exists = async (relativePath) => fs.access(path.join(root, relativePath)).then(() => true, () => false);

const protocol = await readText('docs/coordinates/coordinate-control-protocol.md');
const protocolBatches = [...protocol.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...protocolBatches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocol), 'Batch 196 already exists; retirement must be rebased and re-audited.');

const research = await readJson('reports/oslo-coordinate-bygdoy-roykenvika-identity-research-post-195/summary.json');
assert(research.placeId === targetId, 'Identity research targets another place.');
assert(research.decision === 'identity_unsubstantiated_recommend_retirement', `Unexpected research decision: ${research.decision}`);
assert(research.matchCounts?.kartverketExactOsloCandidates === 0, 'Official Oslo place-name candidate exists; do not retire automatically.');
assert(research.matchCounts?.kartverketExactBygdoyHits === 0, 'Official Bygdøy place-name candidate exists; do not retire automatically.');
assert(research.matchCounts?.mediaWikiBygdoyHits === 0, 'Reference-work Bygdøy hit exists; do not retire automatically.');
assert(research.matchCounts?.nationalLibraryBygdoyMetadataHits === 0, 'National Library Bygdøy metadata hit exists; do not retire automatically.');
assert(research.canonicalChanged === false, 'Research pass unexpectedly changed canonical data.');

assert(await exists(splitRel), 'Split place file is already absent.');
assert(await exists(evidenceRel), 'Coordinate evidence file is already absent.');
const splitBefore = await readJson(splitRel);
assert(splitBefore.id === targetId, 'Split place file has the wrong ID.');
assert(splitBefore.coordStatus === 'needs_source', 'Place is no longer unresolved; rerun the decision.');

const isTargetRecord = (value) => value && typeof value === 'object' && !Array.isArray(value) &&
  [value.id, value.placeId, value.historyGoPlaceId, value.place_id, value.placeID].includes(targetId);

const transform = (value, stats) => {
  if (Array.isArray(value)) {
    const output = [];
    for (const item of value) {
      if (item === targetId) {
        stats.removedArrayStrings += 1;
        continue;
      }
      if (isTargetRecord(item)) {
        stats.removedRecords += 1;
        continue;
      }
      output.push(transform(item, stats));
    }
    return output;
  }
  if (value && typeof value === 'object') {
    const output = {};
    for (const [key, child] of Object.entries(value)) {
      if (key === targetId) {
        stats.removedObjectKeys += 1;
        continue;
      }
      output[key] = transform(child, stats);
    }
    return output;
  }
  return value;
};

const walkJson = async (directory) => {
  const entries = await fs.readdir(path.join(root, directory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walkJson(rel));
    else if (entry.isFile() && entry.name.endsWith('.json')) files.push(rel);
  }
  return files;
};

const activeRoots = [
  'data/Civication',
  'data/i18n/content/places',
  'data/leksikon',
  'data/natur',
  'data/quiz',
  'data/stories',
  'data/wonderkammer',
];
const ignoredGeneratedOrSourcePaths = new Set([manifestRel, evidenceManifestRel]);
const changedFiles = [];
const transformStats = { removedRecords: 0, removedArrayStrings: 0, removedObjectKeys: 0 };

for (const activeRoot of activeRoots) {
  if (!await exists(activeRoot)) continue;
  for (const relativePath of await walkJson(activeRoot)) {
    if (ignoredGeneratedOrSourcePaths.has(relativePath)) continue;
    const beforeText = await readText(relativePath);
    if (!beforeText.includes(targetId)) continue;
    const parsed = JSON.parse(beforeText);
    const localStats = { removedRecords: 0, removedArrayStrings: 0, removedObjectKeys: 0 };
    const transformed = transform(parsed, localStats);
    const afterText = `${JSON.stringify(transformed, null, 2)}\n`;
    assert(!afterText.includes(targetId), `Active reference remains after transformation: ${relativePath}`);
    await fs.writeFile(path.join(root, relativePath), afterText, 'utf8');
    changedFiles.push({ relativePath, ...localStats });
    for (const key of Object.keys(transformStats)) transformStats[key] += localStats[key];
  }
}

const aggregate = await readJson(aggregateRel);
assert(Array.isArray(aggregate), 'Bygdøy aggregate must be an array.');
const aggregateBeforeCount = aggregate.length;
const filteredAggregate = aggregate.filter((place) => place?.id !== targetId);
assert(filteredAggregate.length === aggregateBeforeCount - 1, 'Expected exactly one Røykensvika aggregate record.');
await writeJson(aggregateRel, filteredAggregate);

await fs.unlink(path.join(root, splitRel));
await fs.unlink(path.join(root, evidenceRel));

const aggregateText = await readText(aggregateRel);
const manifest = await readJson(manifestRel);
assert(Array.isArray(manifest.places), 'Split manifest places must be an array.');
const manifestBeforeCount = manifest.places.length;
manifest.places = manifest.places.filter((entry) => entry.id !== targetId).map((entry, index) => ({ ...entry, order: index }));
assert(manifest.places.length === manifestBeforeCount - 1, 'Expected exactly one Røykensvika split-manifest entry.');
manifest.place_count = manifest.places.length;
manifest.source_sha256 = sha256(aggregateText);
manifest.generated_at = new Date().toISOString();
await writeJson(manifestRel, manifest);

const evidenceManifest = await readJson(evidenceManifestRel);
const evidenceManifestStats = { removedRecords: 0, removedArrayStrings: 0, removedObjectKeys: 0 };
const transformedEvidenceManifest = transform(evidenceManifest, evidenceManifestStats);
const evidenceManifestText = `${JSON.stringify(transformedEvidenceManifest, null, 2)}\n`;
assert(!evidenceManifestText.includes(targetId), 'Coordinate evidence manifest still references the retired place.');
await fs.writeFile(path.join(root, evidenceManifestRel), evidenceManifestText, 'utf8');

const activeJsonFiles = [];
for (const activeRoot of ['data/Civication', 'data/i18n/content/places', 'data/leksikon', 'data/natur', 'data/places', 'data/quiz', 'data/stories', 'data/wonderkammer', 'data/coordinate-evidence']) {
  if (await exists(activeRoot)) activeJsonFiles.push(...await walkJson(activeRoot));
}
const remainingReferences = [];
for (const relativePath of activeJsonFiles) {
  const text = await readText(relativePath);
  if (text.includes(targetId)) remainingReferences.push(relativePath);
}
assert(remainingReferences.length === 0, `Active references remain after retirement: ${remainingReferences.join(', ')}`);
assert(!await exists(splitRel), 'Split place file still exists after retirement.');
assert(!await exists(evidenceRel), 'Coordinate evidence file still exists after retirement.');

await fs.mkdir(reportDir, { recursive: true });
const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  placeId: targetId,
  decision: 'retired_unsubstantiated_identity',
  sourceResearch: 'reports/oslo-coordinate-bygdoy-roykenvika-identity-research-post-195/summary.json',
  canonicalChanged: true,
  coordinateSelected: false,
  retirementReason: 'No official or independent credible source substantiates a Bygdøy place identity named Røykensvika/Røykensvik. Keeping the marker would preserve synthetic place content at an arbitrary legacy coordinate.',
  removedPrimaryFiles: [splitRel, evidenceRel],
  aggregateBeforeCount,
  aggregateAfterCount: filteredAggregate.length,
  splitManifestBeforeCount: manifestBeforeCount,
  splitManifestAfterCount: manifest.places.length,
  transformedActiveReferenceFiles: changedFiles,
  transformStats,
  evidenceManifestStats,
  remainingActiveReferences: remainingReferences,
  nextQueueCandidate: 'bygdoy_kongsgard_salamanderdam',
};
await writeJson(`${reportRel}/summary.json`, summary);
await fs.writeFile(path.join(reportDir, 'README.md'), `# Retire Bygdøy Røykensvika after batch 195\n\n- Place: **\`${targetId}\`**\n- Decision: **\`retired_unsubstantiated_identity\`**\n- Coordinate selected: **no**\n- Canonical data changed: **yes**\n- Active references remaining: **0**\n\nThe identity-first research found no exact Kartverket candidate in Oslo or on Bygdøy, no Oslo Byleksikon/Lokalhistoriewiki hit and no National Library metadata tying the name to Bygdøy. The synthetic place record, coordinate evidence and all active content references are therefore removed instead of moving the legacy marker.\n\nThe next unresolved queue candidate is \`bygdoy_kongsgard_salamanderdam\`.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'retirement_complete',
  reportDir: reportRel,
  placeId: targetId,
  aggregateBeforeCount,
  aggregateAfterCount: filteredAggregate.length,
  transformedReferenceFiles: changedFiles.length,
  remainingActiveReferences: 0,
  nextQueueCandidate: 'bygdoy_kongsgard_salamanderdam',
}, null, 2));
