import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const retiredId = 'bygdoy_roykenvika';
const reportRel = 'reports/oslo-coordinate-retire-bygdoy-roykenvika-post-195';
const reportDir = path.join(root, reportRel);
const splitRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy/bygdoy_roykenvika.json';
const aggregateRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy.json';
const evidenceRel = 'data/coordinate-evidence/oslo/natur/bygdoy_roykenvika.json';
const evidenceManifestRel = 'data/coordinate-evidence/manifest.json';
const placeManifestRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy_manifest.json';
const placeIndexRel = 'data/places/natur/oslo/places_oslo_natur_bygdoy_index.json';
const globalPlaceIndexRel = 'data/places/places_index.json';
const civicationRel = 'data/Civication/map/historyGoPlaceMapping.natur_bygdoy.json';
const natureMapRel = 'data/natur/nature_routes_place_map.json';
const natureCandidatesRel = 'data/natur/nature_place_map_candidates.json';
const wonderkammerRel = 'data/wonderkammer/site_package_bygdoy_friluft.json';
const leksikonRel = 'data/leksikon/places/oslo/natur/leksikon_oslo_natur_batch3.json';
const i18nRels = [
  'data/i18n/content/places/en.json',
  'data/i18n/content/places/es.json',
  'data/i18n/content/places/pt.json',
];
const protocolRel = 'docs/coordinates/coordinate-control-protocol.md';
const aliasCheckerRel = 'tools/check_place_id_aliases.mts';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const readText = async (relativePath) => fs.readFile(path.join(root, relativePath), 'utf8');
const readJson = async (relativePath) => JSON.parse(await readText(relativePath));
const writeJson = async (relativePath, value) => {
  await fs.writeFile(path.join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
};
const exists = async (relativePath) => {
  try {
    await fs.access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
};
const sha256File = async (relativePath) => crypto
  .createHash('sha256')
  .update(await fs.readFile(path.join(root, relativePath)))
  .digest('hex');

const protocolBefore = await readText(protocolRel);
const batches = [...protocolBefore.matchAll(/^\|\s*(\d+)\s*\|/gm)].map((match) => Number(match[1]));
const protocolMaxBatch = Math.max(...batches);
assert(protocolMaxBatch === 195, `Expected protocol max batch 195, got ${protocolMaxBatch}`);
assert(!/^\|\s*196\s*\|/m.test(protocolBefore), 'Batch 196 already exists; rerun retirement from the new state.');

const research = await readJson('reports/oslo-coordinate-bygdoy-roykenvika-identity-research-post-195/summary.json');
assert(research.placeId === retiredId, 'Identity research has the wrong placeId.');
assert(research.decision === 'identity_unsubstantiated_recommend_retirement', `Unexpected identity decision: ${research.decision}`);
assert(research.canonicalChanged === false, 'Identity research unexpectedly changed canonical data.');
assert(research.matchCounts?.kartverketExactOsloCandidates === 0, 'An exact Kartverket Oslo candidate exists; retirement must stop.');
assert(research.matchCounts?.kartverketExactBygdoyHits === 0, 'An exact Kartverket Bygdøy candidate exists; retirement must stop.');
assert(research.matchCounts?.mediaWikiBygdoyHits === 0, 'A reference-work Bygdøy hit exists; retirement must stop.');
assert(research.matchCounts?.nationalLibraryBygdoyMetadataHits === 0, 'A National Library Bygdøy metadata hit exists; retirement must stop.');

assert(await exists(splitRel), 'Split place file is already absent.');
assert(await exists(evidenceRel), 'Coordinate evidence file is already absent.');
const split = await readJson(splitRel);
assert(split.id === retiredId, 'Split place file has the wrong ID.');
assert(split.coordStatus === 'needs_source', 'Place is no longer unresolved; do not retire automatically.');

const modified = new Set();
const deleted = [];
const markWrite = async (relativePath, value) => {
  await writeJson(relativePath, value);
  modified.add(relativePath);
};

const hasIdentity = (object) => object && typeof object === 'object' && (
  object.place_id === retiredId ||
  object.placeId === retiredId ||
  object.historyGoPlaceId === retiredId ||
  object.id === retiredId
);

const pruneDeep = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== retiredId && !hasIdentity(item))
      .map(pruneDeep);
  }
  if (!value || typeof value !== 'object') return value;
  const output = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === retiredId || key === `map_${retiredId}`) continue;
    if (child === retiredId) continue;
    if (hasIdentity(child)) continue;
    output[key] = pruneDeep(child);
  }
  return output;
};

const aggregate = await readJson(aggregateRel);
assert(Array.isArray(aggregate), 'Bygdøy aggregate must be an array.');
const aggregateAfter = aggregate.filter((place) => place.id !== retiredId).map(pruneDeep);
assert(aggregateAfter.length === aggregate.length - 1, 'Aggregate did not lose exactly one place.');
await markWrite(aggregateRel, aggregateAfter);

const evidenceManifest = await readJson(evidenceManifestRel);
const evidenceManifestBeforeCount = evidenceManifest.files?.length ?? 0;
evidenceManifest.files = (evidenceManifest.files ?? []).filter((file) => file !== 'oslo/natur/bygdoy_roykenvika.json');
assert(evidenceManifest.files.length === evidenceManifestBeforeCount - 1, 'Evidence manifest did not lose exactly one row.');
await markWrite(evidenceManifestRel, evidenceManifest);

const civication = await readJson(civicationRel);
assert(civication.mappings?.map_bygdoy_roykenvika, 'Civication mapping is already absent.');
delete civication.mappings.map_bygdoy_roykenvika;
await markWrite(civicationRel, civication);

const natureMap = await readJson(natureMapRel);
assert(natureMap.places?.[retiredId], 'Nature route map entry is already absent.');
delete natureMap.places[retiredId];
await markWrite(natureMapRel, natureMap);

const natureCandidatesBefore = await readJson(natureCandidatesRel);
const natureCandidatesAfter = pruneDeep(natureCandidatesBefore);
assert(JSON.stringify(natureCandidatesAfter) !== JSON.stringify(natureCandidatesBefore), 'Nature candidate data did not contain the retired place ID.');
await markWrite(natureCandidatesRel, natureCandidatesAfter);

for (const i18nRel of i18nRels) {
  const before = await readJson(i18nRel);
  const after = pruneDeep(before);
  assert(JSON.stringify(after) !== JSON.stringify(before), `${i18nRel} did not contain the retired place ID.`);
  await markWrite(i18nRel, after);
}

const wonderkammer = await readJson(wonderkammerRel);
const beforeWonderkammerCount = Array.isArray(wonderkammer.places) ? wonderkammer.places.length : 0;
wonderkammer.places = (wonderkammer.places ?? []).filter((place) => place.place_id !== retiredId);
assert(wonderkammer.places.length === beforeWonderkammerCount - 1, 'Wonderkammer did not lose exactly one place package.');
const replaceWonderkammerStrings = (value) => {
  if (Array.isArray(value)) return value.map(replaceWonderkammerStrings);
  if (!value || typeof value !== 'object') {
    if (typeof value !== 'string') return value;
    return value
      .replace(/Huk, Paradisbukta, Røykensvika og Bygdøynes/g, 'Huk, Paradisbukta og Bygdøynes')
      .replace(/Huk, Paradisbukta, Røykensvika,? og Bygdøynes/g, 'Huk, Paradisbukta og Bygdøynes');
  }
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, replaceWonderkammerStrings(child)]));
};
await markWrite(wonderkammerRel, replaceWonderkammerStrings(wonderkammer));

const leksikonBefore = await readJson(leksikonRel);
const leksikonAfter = pruneDeep(leksikonBefore);
assert(JSON.stringify(leksikonAfter) !== JSON.stringify(leksikonBefore), 'Leksikon did not contain the retired place ID.');
await markWrite(leksikonRel, leksikonAfter);

const bygdoySplitDir = path.join(root, 'data/places/natur/oslo/places_oslo_natur_bygdoy');
for (const filename of await fs.readdir(bygdoySplitDir)) {
  if (!filename.endsWith('.json') || filename === 'bygdoy_roykenvika.json') continue;
  const relativePath = `data/places/natur/oslo/places_oslo_natur_bygdoy/${filename}`;
  const before = await readJson(relativePath);
  const after = pruneDeep(before);
  if (JSON.stringify(before) !== JSON.stringify(after)) await markWrite(relativePath, after);
}

await fs.rm(path.join(root, splitRel));
deleted.push(splitRel);
await fs.rm(path.join(root, evidenceRel));
deleted.push(evidenceRel);

const placeManifest = pruneDeep(await readJson(placeManifestRel));
assert(Array.isArray(placeManifest.places), 'Bygdøy split manifest has no places array.');
placeManifest.place_count = placeManifest.places.length;
placeManifest.generated_at = new Date().toISOString();
placeManifest.source_sha256 = await sha256File(aggregateRel);
placeManifest.places = await Promise.all(placeManifest.places.map(async (entry, order) => ({
  ...entry,
  order,
  sha256: await sha256File(`data/places/natur/oslo/${entry.file}`),
})));
assert(placeManifest.places.length === aggregateAfter.length, 'Split manifest and aggregate counts differ after retirement.');
await markWrite(placeManifestRel, placeManifest);

const placeIndexBefore = await readJson(placeIndexRel);
const placeIndexAfter = pruneDeep(placeIndexBefore);
assert(Array.isArray(placeIndexAfter) && placeIndexAfter.length === placeIndexBefore.length - 1, 'Bygdøy split index did not lose exactly one row.');
await markWrite(placeIndexRel, placeIndexAfter);

let aliasChecker = await readText(aliasCheckerRel);
assert(!aliasChecker.includes(`const retiredIds = new Set<string>(['${retiredId}'])`), 'Retired ID guard already exists.');
aliasChecker = aliasChecker.replace(
  'const root = process.cwd();',
  `const retiredIds = new Set<string>(['${retiredId}']);\nconst root = process.cwd();`,
);
aliasChecker = aliasChecker.replace(
  '  for (const [oldId, newId] of Object.entries(aliases)) {',
  `  for (const retiredId of retiredIds) {\n    if (txt.includes(\`"\${retiredId}"\`)) {\n      bad++;\n      console.error(\`\${path.relative(root, f)} references retired place id \${retiredId} (no canonical replacement)\`);\n    }\n  }\n  for (const [oldId, newId] of Object.entries(aliases)) {`,
);
await fs.writeFile(path.join(root, aliasCheckerRel), aliasChecker, 'utf8');
modified.add(aliasCheckerRel);

const protocolLines = protocolBefore.split('\n').filter((line) => !line.includes(retiredId));
const retirementSection = `\n## Identitetsavviklinger etter batch 195\n\n| Place ID | Beslutning | Grunnlag | Erstatning |\n|---|---|---|---|\n| \`${retiredId}\` | Aktiv place-markør avviklet; identiteten kunne ikke dokumenteres | \`reports/oslo-coordinate-bygdoy-roykenvika-identity-research-post-195/summary.json\` | Ingen; innhold og koblinger er fjernet fremfor å flyttes til et annet fysisk sted |\n`;
let protocolAfter = protocolLines.join('\n').replace(/\n+$/, '\n');
assert(!protocolAfter.includes('## Identitetsavviklinger etter batch 195'), 'Retirement section already exists.');
protocolAfter += retirementSection;
await fs.writeFile(path.join(root, protocolRel), protocolAfter, 'utf8');
modified.add(protocolRel);

const walkJson = async (directory) => {
  const output = [];
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) output.push(...await walkJson(full));
    else if (entry.name.endsWith('.json')) output.push(full);
  }
  return output;
};
const generatedReferencesPendingRebuild = [];
const remainingActiveReferences = [];
for (const file of await walkJson(path.join(root, 'data'))) {
  const relativePath = path.relative(root, file).split(path.sep).join('/');
  const text = await fs.readFile(file, 'utf8');
  if (!text.includes(`"${retiredId}"`)) continue;
  if (relativePath === globalPlaceIndexRel) generatedReferencesPendingRebuild.push(relativePath);
  else remainingActiveReferences.push(relativePath);
}
assert(remainingActiveReferences.length === 0, `Retired ID remains in active source JSON: ${remainingActiveReferences.join(', ')}`);
assert(generatedReferencesPendingRebuild.length === 1 && generatedReferencesPendingRebuild[0] === globalPlaceIndexRel,
  `Unexpected generated references before rebuild: ${generatedReferencesPendingRebuild.join(', ')}`);
assert(!(await exists(splitRel)), 'Split place file still exists.');
assert(!(await exists(evidenceRel)), 'Coordinate evidence file still exists.');
assert(!JSON.stringify(await readJson(aggregateRel)).includes(retiredId), 'Aggregate still references retired ID.');

await fs.mkdir(reportDir, { recursive: true });
const summary = {
  version: '2026-07-24',
  protocolMaxBatch,
  placeId: retiredId,
  decision: 'retired_without_replacement',
  canonicalChanged: true,
  coordinatePromoted: false,
  reason: 'No independent credible source documents a Bygdøy place identity named Røykensvika/Røykensvik. The synthetic marker and derivative content were removed rather than reassigned to a different physical place.',
  sourceResearch: 'reports/oslo-coordinate-bygdoy-roykenvika-identity-research-post-195/summary.json',
  deletedFiles: deleted,
  modifiedFiles: [...modified].sort(),
  remainingActiveReferences,
  generatedReferencesPendingRebuild,
  nextQueueCandidate: 'bygdoy_kongsgard_salamanderdam',
};
await fs.writeFile(path.join(reportDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
await fs.writeFile(path.join(reportDir, 'README.md'), `# Retire Bygdøy Røykensvika after batch 195\n\n- Place ID: **\`${retiredId}\`**\n- Decision: **retired without replacement**\n- Coordinate promoted: **no**\n- Deleted source/evidence files: **${deleted.length}**\n- Active source JSON references remaining: **${remainingActiveReferences.length}**\n- Generated global index references pending standard rebuild: **${generatedReferencesPendingRebuild.length}**\n- Next queue candidate: **\`bygdoy_kongsgard_salamanderdam\`**\n\nThe place identity could not be documented in Kartverket, Oslo reference sources, National Library metadata, municipal search, Wikidata, Nominatim or bounded OSM context. The marker, synthetic content and derivative mappings are removed rather than guessed or redirected to another place. The standard runner rebuild removes the final generated global-index row before validation.\n`, 'utf8');

console.log(JSON.stringify({
  status: 'retirement_applied',
  reportDir: reportRel,
  placeId: retiredId,
  deletedFiles: deleted.length,
  modifiedFiles: modified.size,
  remainingActiveReferences: remainingActiveReferences.length,
  generatedReferencesPendingRebuild: generatedReferencesPendingRebuild.length,
  nextQueueCandidate: 'bygdoy_kongsgard_salamanderdam',
}, null, 2));
