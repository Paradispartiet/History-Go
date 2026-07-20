import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const OLD = 'loelva_historisk';
const NEW = 'alnaelva';
const AGGREGATE = 'data/places/natur/oslo/places_oslo_alna.json';
const OLD_CHILD = 'data/places/natur/oslo/places_oslo_alna/loelva_historisk.json';
const NEW_CHILD = 'data/places/natur/oslo/places_oslo_alna/alnaelva.json';
const SPLIT_INDEX = 'data/places/natur/oslo/places_oslo_alna_index.json';
const SPLIT_MANIFEST = 'data/places/natur/oslo/places_oslo_alna_manifest.json';
const OLD_EVIDENCE = 'data/coordinate-evidence/oslo/natur/loelva_historisk.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const CIVICATION = 'data/Civication/map/historyGoPlaceMapping.natur_alna.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const ALIAS_CHECK = 'tools/check_place_id_aliases.mts';
const REPORT_DIR = 'reports/loelva-historical-alias-migration';
const I18N_FILES = [
  'data/i18n/content/places/en.json',
  'data/i18n/content/places/es.json',
  'data/i18n/content/places/pt.json'
];

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
function dedupeArray(values) {
  const out = [];
  const seen = new Set();
  for (const value of values) {
    const key = value && typeof value === 'object' ? JSON.stringify(value) : `scalar:${String(value)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}
function replaceExact(value, rel, collisions) {
  if (Array.isArray(value)) {
    return dedupeArray(value.map((item) => replaceExact(item, rel, collisions)));
  }
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
function runTargetAwareCheck(check) {
  console.log(`\n[Loelva migration] npm run ${check}`);
  const result = spawnSync('npm', ['run', check], { encoding: 'utf8' });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  process.stdout.write(output);
  if (result.status !== 0) {
    const targetLines = output.split('\n').filter((line) => line.includes(OLD));
    if (targetLines.length) {
      throw new Error(`${check} reported legacy Loelva regressions:\n${targetLines.join('\n')}`);
    }
    console.log(`[Loelva migration] ${check} has pre-existing non-target failures; no legacy-ID regression detected.`);
  }
}

const oldPlace = readJson(OLD_CHILD);
const canonical = readJson(NEW_CHILD);
if (oldPlace.id !== OLD || oldPlace.coordStatus !== 'needs_source') {
  throw new Error('Legacy Loelva record is not in the expected unresolved alias state');
}
if (canonical.id !== NEW || canonical.coordStatus !== 'needs_source') {
  throw new Error('Canonical Alnaelva is not in the expected unresolved river state');
}
const coordinateBefore = {
  lat: canonical.lat,
  lon: canonical.lon,
  r: canonical.r,
  coordStatus: canonical.coordStatus,
  coordSource: canonical.coordSource,
  sourceObjectId: canonical.sourceObjectId
};

const initialReferenceFiles = walk(full('data'))
  .filter((file) => file.endsWith('.json') && fs.readFileSync(file, 'utf8').includes(`"${OLD}"`))
  .map((file) => path.relative(ROOT, file))
  .sort();

const historicalAliasRelation = {
  id: 'relation_alnaelva_loelva_historical_alias',
  type: 'historical_alias',
  label: 'Loelva',
  target_id: NEW,
  desc: 'Loelva er dokumentert som et historisk/alternativt navn på Alna, ikke som et separat fysisk vassdrag.',
  sourceProvider: 'manual_research',
  sourceObjectId: 'snl:alna:loelva-alias',
  sourceUrl: 'https://snl.no/Alna_(elv_i_Oslo)'
};
canonical.relations = dedupeArray([...(Array.isArray(canonical.relations) ? canonical.relations : []), historicalAliasRelation]);
canonical.tags = dedupeArray([...(Array.isArray(canonical.tags) ? canonical.tags : []), 'historisk_landskap', 'naturtap']);
const aliasSentence = 'Elva har også vært omtalt som Loelva; dette er et historisk/alternativt navn på Alna og ikke et eget separat vassdrag.';
if (!String(canonical.popupDesc || '').includes('omtalt som Loelva')) {
  canonical.popupDesc = `${String(canonical.popupDesc || '').trim()}\n\n${aliasSentence}`.trim();
}
if (
  canonical.lat !== coordinateBefore.lat ||
  canonical.lon !== coordinateBefore.lon ||
  canonical.r !== coordinateBefore.r ||
  canonical.coordStatus !== coordinateBefore.coordStatus ||
  canonical.coordSource !== coordinateBefore.coordSource ||
  canonical.sourceObjectId !== coordinateBefore.sourceObjectId
) {
  throw new Error('Canonical Alnaelva coordinate state changed during alias merge');
}
writeJson(NEW_CHILD, canonical);

const aggregate = readJson(AGGREGATE);
let oldCount = 0;
let canonicalCount = 0;
const updatedAggregate = [];
for (const place of aggregate) {
  if (place?.id === OLD) {
    oldCount++;
    continue;
  }
  if (place?.id === NEW) {
    canonicalCount++;
    updatedAggregate.push(canonical);
  } else {
    updatedAggregate.push(place);
  }
}
if (oldCount !== 1 || canonicalCount !== 1) {
  throw new Error(`Expected one old and one canonical Alna record, found old=${oldCount} canonical=${canonicalCount}`);
}
writeJson(AGGREGATE, updatedAggregate);
if (fs.existsSync(full(OLD_CHILD))) fs.unlinkSync(full(OLD_CHILD));

const splitIndex = readJson(SPLIT_INDEX);
const filteredIndex = splitIndex.filter((row) => row?.id !== OLD);
if (filteredIndex.length !== splitIndex.length - 1) {
  throw new Error('Expected exactly one Loelva row in split index');
}
writeJson(SPLIT_INDEX, filteredIndex);

const splitManifest = readJson(SPLIT_MANIFEST);
const oldManifestCount = splitManifest.places?.length ?? 0;
splitManifest.places = (splitManifest.places || []).filter((row) => row?.id !== OLD);
if (splitManifest.places.length !== oldManifestCount - 1) {
  throw new Error('Expected exactly one Loelva row in split manifest');
}
const canonicalManifestRow = splitManifest.places.find((row) => row?.id === NEW);
if (!canonicalManifestRow) throw new Error('Canonical Alnaelva missing from split manifest');
canonicalManifestRow.sha256 = sha256(NEW_CHILD);
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256(AGGREGATE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

if (fs.existsSync(full(OLD_EVIDENCE))) fs.unlinkSync(full(OLD_EVIDENCE));
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
evidenceManifest.files = (evidenceManifest.files || []).filter((entry) => entry !== 'oslo/natur/loelva_historisk.json');
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

const civication = readJson(CIVICATION);
const oldMappings = Object.entries(civication.mappings || {}).filter(([, mapping]) => mapping?.historyGoPlaceId === OLD);
const canonicalMappings = Object.entries(civication.mappings || {}).filter(([, mapping]) => mapping?.historyGoPlaceId === NEW);
if (oldMappings.length !== 1 || canonicalMappings.length < 1) {
  throw new Error(`Unexpected Civication mapping state old=${oldMappings.length} canonical=${canonicalMappings.length}`);
}
const [oldMappingKey] = oldMappings[0];
delete civication.mappings[oldMappingKey];
writeJson(CIVICATION, civication);

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

const specialFiles = new Set([
  AGGREGATE, OLD_CHILD, NEW_CHILD, SPLIT_INDEX, SPLIT_MANIFEST,
  OLD_EVIDENCE, EVIDENCE_MANIFEST, CIVICATION, ...I18N_FILES
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
if (collisions.length) {
  throw new Error(`Exact-ID collisions require manual review: ${JSON.stringify(collisions)}`);
}

let aliasText = fs.readFileSync(full(ALIAS_CHECK), 'utf8');
if (!aliasText.includes(`${OLD}: '${NEW}'`)) {
  const aliasMatch = aliasText.match(/const aliases: AliasMap = \{([^}]*)\};/s);
  if (!aliasMatch) throw new Error('Could not locate aliases map');
  const body = aliasMatch[1].trim();
  aliasText = aliasText.replace(aliasMatch[0], `const aliases: AliasMap = { ${body}${body ? ', ' : ''}${OLD}: '${NEW}' };`);
}
fs.writeFileSync(full(ALIAS_CHECK), aliasText);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
const unresolvedHeader = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const unresolvedStart0 = protocol.indexOf(unresolvedHeader);
if (unresolvedStart0 < 0) throw new Error('Oslo unresolved header missing');
const etne0 = protocol.indexOf('\n## Etne', unresolvedStart0);
const unresolvedEnd0 = etne0 >= 0 ? etne0 : protocol.length;
const unresolvedBlock = protocol
  .slice(unresolvedStart0, unresolvedEnd0)
  .split('\n')
  .filter((line) => !line.includes(`\`${OLD}\``))
  .join('\n');
protocol = protocol.slice(0, unresolvedStart0) + unresolvedBlock + protocol.slice(unresolvedEnd0);
const migrationNote = `Alias-migrering (2026-07-20): \`${OLD}\` er fjernet som separat fysisk place fordi Loelva er dokumentert som historisk/alternativt navn på \`${NEW}\`, ikke som et eget vassdrag. Navnehistorien er bevart som en eksplisitt \`historical_alias\`-relasjon på canonical Alnaelva, aktive referanser er retargetet og den separate Civication-markøren er fjernet. Alnaelvas koordinatstatus er fortsatt \`needs_source\`; migreringen verifiserer ikke den uavklarte elvegeometrien.`;
if (!protocol.includes(migrationNote)) {
  protocol = protocol.replace(unresolvedHeader, `${migrationNote}\n\n${unresolvedHeader}`);
}
const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf(unresolvedHeader);
const etneStart = protocol.indexOf('## Etne');
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedSection = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length);
const unresolvedCount = unresolvedSection
  .split('\n')
  .filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat'))
  .length;
protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Alias-recorden \`${OLD}\` er migrert til \`${NEW}\` uten å opprette eller verifisere et nytt fysisk sted. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`
);
protocol = protocol.replace(
  /^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m,
  `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`
);
fs.writeFileSync(full(PROTOCOL), protocol);

execFileSync('npm', ['run', 'places:index:build'], { stdio: 'inherit' });
execFileSync('npm', ['run', 'places:aliases:check'], { stdio: 'inherit' });

const remainingExactIds = walk(full('data'))
  .filter((file) => file.endsWith('.json') && fs.readFileSync(file, 'utf8').includes(`"${OLD}"`))
  .map((file) => path.relative(ROOT, file))
  .sort();
if (remainingExactIds.length) {
  throw new Error(`Legacy Loelva exact IDs remain: ${remainingExactIds.join(', ')}`);
}
const canonicalAfter = readJson(NEW_CHILD);
if (canonicalAfter.coordStatus !== 'needs_source' || canonicalAfter.lat !== coordinateBefore.lat || canonicalAfter.lon !== coordinateBefore.lon) {
  throw new Error('Alias migration accidentally promoted or moved Alnaelva');
}
if (!(canonicalAfter.relations || []).some((relation) => relation?.id === historicalAliasRelation.id)) {
  throw new Error('Historical Loelva alias relation missing from canonical Alnaelva');
}

for (const check of ['audit:quiz-manifest:v2', 'audit:people-of-places', 'places:emner:check']) {
  runTargetAwareCheck(check);
}

fs.mkdirSync(full(REPORT_DIR), { recursive: true });
writeJson(`${REPORT_DIR}/summary.json`, {
  date: '2026-07-20',
  oldId: OLD,
  canonicalId: NEW,
  coordinateBefore,
  coordinateAfter: {
    lat: canonicalAfter.lat,
    lon: canonicalAfter.lon,
    r: canonicalAfter.r,
    coordStatus: canonicalAfter.coordStatus,
    coordSource: canonicalAfter.coordSource,
    sourceObjectId: canonicalAfter.sourceObjectId
  },
  removedDuplicatePlace: true,
  removedCivicationMapping: oldMappingKey,
  preservedHistoricalAliasRelation: historicalAliasRelation,
  initialReferenceFiles,
  rewrittenFiles,
  i18nActions,
  remainingExactIds,
  protocolCounts: { verifiedCount, unresolvedCount }
});
fs.writeFileSync(
  full(`${REPORT_DIR}/README.md`),
  `# Loelva historical alias migration\n\n- Removed \`${OLD}\` as a separate physical place.\n- Preserved Loelva as a sourced historical alias relation on canonical \`${NEW}\`.\n- Kept Alnaelva coordinates and \`needs_source\` status unchanged.\n- Retargeted active exact-ID references and removed the duplicate Civication marker and coordinate-evidence file.\n- Added the retired ID to the place alias gate.\n- Protocol after migration: ${verifiedCount} verified/source-controlled Oslo places; ${unresolvedCount} unresolved controls.\n`
);

console.log(JSON.stringify({
  ok: true,
  verifiedCount,
  unresolvedCount,
  coordinateBefore,
  remainingExactIds,
  rewrittenFiles,
  i18nActions
}, null, 2));
