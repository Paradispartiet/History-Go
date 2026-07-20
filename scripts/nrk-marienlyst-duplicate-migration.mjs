import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const OLD = 'nrk_marienlyst';
const NEW = 'nrk_huset_marienlyst';
const OLD_CHILD = 'data/places/naeringsliv/oslo/places_naeringsliv/nrk_marienlyst.json';
const AGGREGATE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const OLD_EVIDENCE = 'data/coordinate-evidence/oslo/naeringsliv/nrk_marienlyst.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const OLD_QUIZ = 'data/quiz/naeringsliv/nrk_marienlyst_sets_merged.json';
const NEW_QUIZ = 'data/quiz/naeringsliv/nrk_huset_marienlyst_sets_merged.json';
const OLD_STORY = 'data/stories/stories_nrk_marienlyst.json';
const NEW_STORY = 'data/stories/stories_nrk_huset_marienlyst.json';
const STORY_BATCH_MANIFEST = 'data/stories/stories_manifest_naeringsliv_batch_01.json';
const STORY_MANIFEST = 'data/stories/stories_manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const ALIAS_CHECK = 'tools/check_place_id_aliases.mts';
const REPORT_DIR = 'reports/nrk-marienlyst-duplicate-migration-final';

function full(file) { return path.join(ROOT, file); }
function readJson(file) { return JSON.parse(fs.readFileSync(full(file), 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}
function sha256(file) { return crypto.createHash('sha256').update(fs.readFileSync(full(file))).digest('hex'); }
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}
function replaceDeep(value) {
  if (Array.isArray(value)) return value.map(replaceDeep);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k.replaceAll(OLD, NEW), replaceDeep(v)]));
  }
  return typeof value === 'string' ? value.replaceAll(OLD, NEW) : value;
}

const duplicatePlace = readJson(OLD_CHILD);
const canonicalPlace = readJson('data/places/media/oslo/places_oslo_media/nrk_huset_marienlyst.json');
if (duplicatePlace.name !== 'NRK Marienlyst' || canonicalPlace.id !== NEW) throw new Error('Unexpected NRK place state');
if (canonicalPlace.sourceObjectId !== 'geonorge-adresser-v1:0301:10722:1') throw new Error('Canonical NRK anchor changed unexpectedly');

const initialReferenceFiles = walk(full('data')).filter((file) => {
  if (!file.endsWith('.json')) return false;
  return fs.readFileSync(file, 'utf8').includes(OLD);
}).map((file) => path.relative(ROOT, file)).sort();

// Remove duplicate place from active naeringsliv source and split metadata.
const aggregate = readJson(AGGREGATE);
const filteredAggregate = aggregate.filter((place) => place?.id !== OLD);
if (filteredAggregate.length !== aggregate.length - 1) throw new Error('Expected exactly one duplicate NRK place in aggregate');
writeJson(AGGREGATE, filteredAggregate);
if (fs.existsSync(full(OLD_CHILD))) fs.unlinkSync(full(OLD_CHILD));

const splitIndex = readJson(SPLIT_INDEX);
const filteredIndex = splitIndex.filter((row) => row?.id !== OLD);
if (filteredIndex.length !== splitIndex.length - 1) throw new Error('Expected exactly one duplicate NRK row in split index');
writeJson(SPLIT_INDEX, filteredIndex);

const splitManifest = readJson(SPLIT_MANIFEST);
const beforeManifestCount = splitManifest.places?.length ?? 0;
splitManifest.places = (splitManifest.places || []).filter((row) => row?.id !== OLD);
if (splitManifest.places.length !== beforeManifestCount - 1) throw new Error('Expected exactly one duplicate NRK row in split manifest');
splitManifest.source_sha256 = sha256(AGGREGATE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

// Remove stale coordinate evidence for the deleted duplicate record.
if (fs.existsSync(full(OLD_EVIDENCE))) fs.unlinkSync(full(OLD_EVIDENCE));
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
evidenceManifest.files = (evidenceManifest.files || []).filter((entry) => entry !== 'oslo/naeringsliv/nrk_marienlyst.json');
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

// Move the 5x6 quiz set onto the canonical place id. No canonical quiz file existed before migration.
if (!fs.existsSync(full(OLD_QUIZ))) throw new Error('Old NRK quiz set missing');
if (fs.existsSync(full(NEW_QUIZ))) throw new Error('Canonical NRK quiz file already exists; manual merge required');
const quiz = replaceDeep(readJson(OLD_QUIZ));
quiz.targetId = NEW;
quiz.merge_notes = {
  ...(quiz.merge_notes || {}),
  duplicate_migration: `Migrated from legacy duplicate place id ${OLD} to canonical ${NEW}. The quiz remains a naeringsliv learning track attached to the canonical media place.`
};
writeJson(NEW_QUIZ, quiz);
fs.unlinkSync(full(OLD_QUIZ));

// Merge the complementary work/infrastructure story into the canonical story file.
const canonicalStories = readJson(NEW_STORY);
const oldStories = replaceDeep(readJson(OLD_STORY)).map((story) => ({
  ...story,
  id: story.id.replace('st_nrk_marienlyst_', 'st_nrk_huset_marienlyst_'),
  place_id: NEW,
  sources: Array.isArray(story.sources)
    ? story.sources.map((source) => source === 'History Go place registry: nrk_huset_marienlyst'
      ? 'History Go place registry: nrk_huset_marienlyst'
      : source)
    : story.sources
}));
const existingStoryIds = new Set(canonicalStories.map((story) => story.id));
for (const story of oldStories) if (!existingStoryIds.has(story.id)) canonicalStories.push(story);
writeJson(NEW_STORY, canonicalStories);
fs.unlinkSync(full(OLD_STORY));

// Remove the legacy story manifest entry; canonical story file is already in the main story registry.
if (fs.existsSync(full(STORY_BATCH_MANIFEST))) {
  const storyBatch = readJson(STORY_BATCH_MANIFEST);
  storyBatch.files = (storyBatch.files || []).filter((entry) => entry?.entity_id !== OLD && entry?.path !== OLD_STORY);
  writeJson(STORY_BATCH_MANIFEST, storyBatch);
}
const storyManifest = readJson(STORY_MANIFEST);
const hasCanonicalStory = (storyManifest.files || []).some((entry) => entry?.entity_id === NEW || entry?.path === NEW_STORY);
if (!hasCanonicalStory) {
  storyManifest.files.push({ category: 'media', entity_id: NEW, path: NEW_STORY });
  writeJson(STORY_MANIFEST, storyManifest);
}

// Rewrite any remaining exact active data references to the canonical id.
const specialFiles = new Set([
  OLD_CHILD, OLD_EVIDENCE, OLD_QUIZ, OLD_STORY,
  AGGREGATE, SPLIT_INDEX, SPLIT_MANIFEST, EVIDENCE_MANIFEST,
  NEW_QUIZ, NEW_STORY, STORY_BATCH_MANIFEST, STORY_MANIFEST
]);
const rewrittenFiles = [];
for (const abs of walk(full('data'))) {
  if (!abs.endsWith('.json')) continue;
  const rel = path.relative(ROOT, abs);
  if (specialFiles.has(rel)) continue;
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.includes(OLD)) continue;
  fs.writeFileSync(abs, text.replaceAll(OLD, NEW));
  rewrittenFiles.push(rel);
}

// Lock the migration into the legacy-id gate.
let aliasCheck = fs.readFileSync(full(ALIAS_CHECK), 'utf8');
if (!aliasCheck.includes(`${OLD}: '${NEW}'`) && !aliasCheck.includes(`${OLD}': '${NEW}`)) {
  aliasCheck = aliasCheck.replace(
    "const aliases: AliasMap = { sagene_film: 'sagene', kampen_film: 'kampen', psykologirommet_oslo: 'psykologisk_institutt_uio' };",
    "const aliases: AliasMap = { sagene_film: 'sagene', kampen_film: 'kampen', psykologirommet_oslo: 'psykologisk_institutt_uio', nrk_marienlyst: 'nrk_huset_marienlyst' };"
  );
}
fs.writeFileSync(full(ALIAS_CHECK), aliasCheck);

// Remove the unresolved duplicate row and record the migration without creating a fake new verified place.
let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
const unresolvedHeader = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const unresolvedStart0 = protocol.indexOf(unresolvedHeader);
if (unresolvedStart0 < 0) throw new Error('Oslo unresolved header missing');
const etne0 = protocol.indexOf('\n## Etne', unresolvedStart0);
const unresolvedEnd0 = etne0 >= 0 ? etne0 : protocol.length;
const cleanUnresolved = protocol.slice(unresolvedStart0, unresolvedEnd0).split('\n').filter((line) => !line.includes(`\`${OLD}\``)).join('\n');
protocol = protocol.slice(0, unresolvedStart0) + cleanUnresolved + protocol.slice(unresolvedEnd0);
const migrationNote = `Duplikatmigrering (2026-07-20): \`${OLD}\` er fjernet som separat place og alle aktive datareferanser er migrert til canonical \`${NEW}\`. Det tidligere naeringsliv-quizsettet er beholdt som faglig spor på canonical place-ID, den komplementære arbeidslivshistorien er slått inn i canonical storyfil, og legacy-ID-en er lagt til alias-gaten for å hindre nye referanser.`;
if (!protocol.includes(migrationNote)) protocol = protocol.replace(unresolvedHeader, `${migrationNote}\n\n${unresolvedHeader}`);
const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf(unresolvedHeader);
const etneStart = protocol.indexOf('## Etne');
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedSection = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length);
if (unresolvedSection.includes(`\`${OLD}\``)) throw new Error('Legacy NRK duplicate remains in unresolved section');
const unresolvedCount = unresolvedSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Duplikatet \`${OLD}\` er migrert til \`${NEW}\` uten å opprette et nytt fysisk sted. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(full(PROTOCOL), protocol);

const remainingReferenceFiles = walk(full('data')).filter((file) => file.endsWith('.json') && fs.readFileSync(file, 'utf8').includes(OLD)).map((file) => path.relative(ROOT, file)).sort();
if (remainingReferenceFiles.length) throw new Error(`Legacy NRK id still present in active data: ${remainingReferenceFiles.join(', ')}`);

fs.mkdirSync(full(REPORT_DIR), { recursive: true });
writeJson(`${REPORT_DIR}/summary.json`, {
  date: '2026-07-20',
  oldId: OLD,
  canonicalId: NEW,
  canonicalAnchor: canonicalPlace.sourceObjectId,
  removedDuplicatePlace: true,
  migratedQuiz: { from: OLD_QUIZ, to: NEW_QUIZ, questionCount: (quiz.sets || []).flatMap((set) => set.questions || []).length },
  mergedStories: { from: OLD_STORY, to: NEW_STORY, addedCount: oldStories.length },
  initialReferenceFiles,
  rewrittenFiles,
  remainingReferenceFiles,
  protocolCounts: { verifiedCount, unresolvedCount }
});
fs.writeFileSync(full(`${REPORT_DIR}/README.md`), `# NRK Marienlyst duplicate migration\n\n- Removed legacy duplicate place id \`${OLD}\`.\n- Canonical place remains \`${NEW}\` at the verified Geonorge address anchor.\n- Migrated the 5×6 naeringsliv quiz set to the canonical place id.\n- Merged the complementary work/infrastructure story into the canonical story file.\n- Rewrote every remaining exact active JSON reference under \`data/\`.\n- Added the legacy id to the place-alias validation gate.\n- Protocol after migration: ${verifiedCount} verified/source-controlled Oslo places; ${unresolvedCount} unresolved controls.\n`);

console.log(JSON.stringify({ ok: true, verifiedCount, unresolvedCount, initialReferenceFiles, rewrittenFiles }, null, 2));
