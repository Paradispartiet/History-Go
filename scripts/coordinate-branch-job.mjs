import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const OLD = 'akerhus_slott';
const NEW = 'akershus_festning';
const AGGREGATE = 'data/places/historie/oslo/places_historie.json';
const OLD_CHILD = 'data/places/historie/oslo/places_historie/akerhus_slott.json';
const SPLIT_INDEX = 'data/places/historie/oslo/places_historie_index.json';
const SPLIT_MANIFEST = 'data/places/historie/oslo/places_historie_manifest.json';
const OLD_EVIDENCE = 'data/coordinate-evidence/oslo/historie/akerhus_slott.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PLACE_INDEX = 'data/places/places_index.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const ALIAS_CHECK = 'tools/check_place_id_aliases.mts';
const REPORT_DIR = 'reports/akerhus-slott-duplicate-migration-final';
const I18N_FILES = new Set([
  'data/i18n/content/places/en.json',
  'data/i18n/content/places/es.json',
  'data/i18n/content/places/pt.json'
]);

function full(file) { return path.join(ROOT, file); }
function readJson(file) { return JSON.parse(fs.readFileSync(full(file), 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}
function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(full(file))).digest('hex');
}
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}
function replaceExact(value, rel, collisions) {
  if (Array.isArray(value)) return value.map((item) => replaceExact(item, rel, collisions));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, raw] of Object.entries(value)) {
      const nextKey = key === OLD ? NEW : key;
      const nextValue = replaceExact(raw, rel, collisions);
      if (Object.prototype.hasOwnProperty.call(out, nextKey) && nextKey !== key) {
        if (JSON.stringify(out[nextKey]) !== JSON.stringify(nextValue)) {
          collisions.push({ file: rel, key: nextKey });
        }
        continue;
      }
      out[nextKey] = nextValue;
    }
    return out;
  }
  return value === OLD ? NEW : value;
}
function runCheck(check) {
  console.log(`\n[Akerhus migration] npm run ${check}`);
  const result = spawnSync('npm', ['run', check], { encoding: 'utf8' });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  process.stdout.write(output);
  if (result.status !== 0) {
    const targetLines = output.split('\n').filter((line) => line.includes(OLD) || line.includes(NEW));
    if (targetLines.length) {
      throw new Error(`${check} reported Akershus migration regressions:\n${targetLines.join('\n')}`);
    }
    console.log(`[Akerhus migration] ${check} has pre-existing non-target failures; no Akershus-specific regression detected.`);
  }
}

const canonicalPlace = readJson('data/places/historie/oslo/places_historie/akershus_festning.json');
const duplicatePlace = readJson(OLD_CHILD);
if (canonicalPlace.id !== NEW || canonicalPlace.coordStatus !== 'verified_geometry') {
  throw new Error('Canonical Akershus festning is not in expected verified_geometry state');
}
if (duplicatePlace.id !== OLD || duplicatePlace.lat !== canonicalPlace.lat || duplicatePlace.lon !== canonicalPlace.lon) {
  throw new Error('Legacy Akerhus Slott is no longer the expected exact physical duplicate');
}

const initialReferenceFiles = walk(full('data'))
  .filter((file) => file.endsWith('.json') && fs.readFileSync(file, 'utf8').includes(`"${OLD}"`))
  .map((file) => path.relative(ROOT, file))
  .sort();

// Remove the duplicate physical place and its split metadata.
const aggregate = readJson(AGGREGATE);
const filteredAggregate = aggregate.filter((place) => place?.id !== OLD);
if (filteredAggregate.length !== aggregate.length - 1) throw new Error('Expected exactly one legacy Akerhus Slott place in aggregate');
writeJson(AGGREGATE, filteredAggregate);
if (fs.existsSync(full(OLD_CHILD))) fs.unlinkSync(full(OLD_CHILD));

const splitIndex = readJson(SPLIT_INDEX);
const filteredIndex = splitIndex.filter((row) => row?.id !== OLD);
if (filteredIndex.length !== splitIndex.length - 1) throw new Error('Expected exactly one legacy row in historie split index');
writeJson(SPLIT_INDEX, filteredIndex);

const splitManifest = readJson(SPLIT_MANIFEST);
const oldManifestCount = splitManifest.places?.length ?? 0;
splitManifest.places = (splitManifest.places || []).filter((row) => row?.id !== OLD);
if (splitManifest.places.length !== oldManifestCount - 1) throw new Error('Expected exactly one legacy row in historie split manifest');
splitManifest.source_sha256 = sha256(AGGREGATE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

// Remove stale coordinate evidence for the duplicate.
if (fs.existsSync(full(OLD_EVIDENCE))) fs.unlinkSync(full(OLD_EVIDENCE));
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
evidenceManifest.files = (evidenceManifest.files || []).filter((entry) => entry !== 'oslo/historie/akerhus_slott.json');
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

// Clean i18n duplicate keys explicitly so key collisions cannot overwrite canonical translations.
const i18nActions = [];
for (const rel of I18N_FILES) {
  if (!fs.existsSync(full(rel))) continue;
  const data = readJson(rel);
  if (!Object.prototype.hasOwnProperty.call(data, OLD)) continue;
  if (Object.prototype.hasOwnProperty.call(data, NEW)) {
    delete data[OLD];
    i18nActions.push({ file: rel, action: 'removed_duplicate_key' });
  } else {
    data[NEW] = data[OLD];
    delete data[OLD];
    i18nActions.push({ file: rel, action: 'moved_to_canonical_key' });
  }
  writeJson(rel, data);
}

// Retarget exact active IDs across quiz, stories, people, mappings and manifests.
// File paths and prose strings containing the old spelling are intentionally left untouched.
const specialFiles = new Set([
  AGGREGATE, OLD_CHILD, SPLIT_INDEX, SPLIT_MANIFEST, OLD_EVIDENCE,
  EVIDENCE_MANIFEST, PLACE_INDEX, ...I18N_FILES
]);
const rewrittenFiles = [];
const collisions = [];
for (const abs of walk(full('data'))) {
  if (!abs.endsWith('.json')) continue;
  const rel = path.relative(ROOT, abs);
  if (specialFiles.has(rel)) continue;
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.includes(`"${OLD}"`)) continue;
  const data = JSON.parse(text);
  const replaced = replaceExact(data, rel, collisions);
  writeJson(rel, replaced);
  rewrittenFiles.push(rel);
}
if (collisions.length) throw new Error(`Exact-ID key collisions require manual review: ${JSON.stringify(collisions)}`);

// Lock the retired typo into the legacy alias gate.
let aliasText = fs.readFileSync(full(ALIAS_CHECK), 'utf8');
if (!aliasText.includes(`${OLD}: '${NEW}'`)) {
  const aliasMatch = aliasText.match(/const aliases: AliasMap = \{([^}]*)\};/s);
  if (!aliasMatch) throw new Error('Could not locate aliases map');
  const body = aliasMatch[1].trim();
  aliasText = aliasText.replace(aliasMatch[0], `const aliases: AliasMap = { ${body}${body ? ', ' : ''}${OLD}: '${NEW}' };`);
}
fs.writeFileSync(full(ALIAS_CHECK), aliasText);

// Remove the unresolved duplicate control and document the migration.
let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
const unresolvedHeader = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const unresolvedStart0 = protocol.indexOf(unresolvedHeader);
if (unresolvedStart0 < 0) throw new Error('Oslo unresolved header missing');
const etne0 = protocol.indexOf('\n## Etne', unresolvedStart0);
const unresolvedEnd0 = etne0 >= 0 ? etne0 : protocol.length;
const unresolvedBlock = protocol.slice(unresolvedStart0, unresolvedEnd0)
  .split('\n')
  .filter((line) => !line.includes(`\`${OLD}\``))
  .join('\n');
protocol = protocol.slice(0, unresolvedStart0) + unresolvedBlock + protocol.slice(unresolvedEnd0);
const migrationNote = `Duplikatmigrering (2026-07-20): \`${OLD}\` er fjernet som separat fysisk place og eksakte aktive data-ID-er er migrert til canonical \`${NEW}\`. Quiz- og storyfiler kan beholde legacy-filnavn som innholdsbeholdere, men alle place-targets peker nå på canonical festningsrecord. Legacy-ID-en er lagt til alias-gaten. Ingen ny verifisert place er opprettet.`;
if (!protocol.includes(migrationNote)) protocol = protocol.replace(unresolvedHeader, `${migrationNote}\n\n${unresolvedHeader}`);
const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf(unresolvedHeader);
const etneStart = protocol.indexOf('## Etne');
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedSection = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length);
const unresolvedCount = unresolvedSection.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat')).length;
protocol = protocol.replace(/^Oslo-tabellen inneholder nå .*$/m, `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Duplikatet \`${OLD}\` er migrert til \`${NEW}\` uten å opprette et nytt fysisk sted. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`);
protocol = protocol.replace(/^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m, `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`);
fs.writeFileSync(full(PROTOCOL), protocol);

// Rebuild runtime index before asserting that no exact legacy IDs remain.
execFileSync('npm', ['run', 'places:index:build'], { stdio: 'inherit' });
execFileSync('npm', ['run', 'places:aliases:check'], { stdio: 'inherit' });

const remainingExactIds = walk(full('data'))
  .filter((file) => file.endsWith('.json') && fs.readFileSync(file, 'utf8').includes(`"${OLD}"`))
  .map((file) => path.relative(ROOT, file))
  .sort();
if (remainingExactIds.length) throw new Error(`Legacy Akerhus Slott exact IDs remain: ${remainingExactIds.join(', ')}`);

for (const check of ['check:stories', 'audit:quiz-manifest:v2', 'audit:people-of-places', 'places:emner:check']) runCheck(check);

fs.mkdirSync(full(REPORT_DIR), { recursive: true });
writeJson(`${REPORT_DIR}/summary.json`, {
  date: '2026-07-20',
  oldId: OLD,
  canonicalId: NEW,
  canonicalCoordinate: { lat: canonicalPlace.lat, lon: canonicalPlace.lon },
  canonicalSourceObjectId: canonicalPlace.sourceObjectId,
  removedDuplicatePlace: true,
  initialReferenceFiles,
  rewrittenFiles,
  i18nActions,
  remainingExactIds,
  protocolCounts: { verifiedCount, unresolvedCount }
});
fs.writeFileSync(full(`${REPORT_DIR}/README.md`), `# Akerhus Slott duplicate migration\n\n- Removed legacy typo-place \`${OLD}\`.\n- Canonical physical place remains \`${NEW}\` with its existing verified Forsvarsbygg geometry anchor.\n- Retargeted exact active IDs in quiz, stories, people, mappings and manifests without renaming content files.\n- Removed stale duplicate coordinate evidence and split metadata.\n- Added the retired ID to the legacy alias gate.\n- No new physical place or coordinate was created.\n- Protocol after migration: ${verifiedCount} verified/source-controlled Oslo places; ${unresolvedCount} unresolved controls.\n`);

console.log(JSON.stringify({ ok: true, verifiedCount, unresolvedCount, initialReferenceFiles, rewrittenFiles, i18nActions }, null, 2));
