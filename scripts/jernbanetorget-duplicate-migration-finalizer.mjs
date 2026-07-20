import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const OLD = 'jernbanetorget_trafikknutepunkt';
const NEW = 'jernbanetorget';
const AGGREGATE = 'data/places/naeringsliv/oslo/places_naeringsliv.json';
const OLD_CHILD = 'data/places/naeringsliv/oslo/places_naeringsliv/jernbanetorget_trafikknutepunkt.json';
const SPLIT_INDEX = 'data/places/naeringsliv/oslo/places_naeringsliv_index.json';
const SPLIT_MANIFEST = 'data/places/naeringsliv/oslo/places_naeringsliv_manifest.json';
const OLD_EVIDENCE = 'data/coordinate-evidence/oslo/naeringsliv/jernbanetorget_trafikknutepunkt.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const CIVICATION = 'data/Civication/map/historyGoPlaceMapping.naeringsliv.json';
const I18N_FILES = [
  'data/i18n/content/places/en.json',
  'data/i18n/content/places/es.json',
  'data/i18n/content/places/pt.json'
];
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const ALIAS_CHECK = 'tools/check_place_id_aliases.mts';
const REPORT_DIR = 'reports/jernbanetorget-duplicate-migration-final';

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

const canonicalPlace = readJson('data/places/by/oslo/places/jernbanetorget.json');
if (canonicalPlace.id !== NEW || canonicalPlace.coordStatus !== 'verified_geometry') {
  throw new Error('Canonical Jernbanetorget is not in the expected verified_geometry state');
}

const initialReferences = [];
for (const abs of walk(full('data'))) {
  if (!abs.endsWith('.json')) continue;
  const text = fs.readFileSync(abs, 'utf8');
  if (!text.includes(OLD)) continue;
  initialReferences.push(path.relative(ROOT, abs));
}
initialReferences.sort();

// Remove duplicate place from active naeringsliv source and split metadata.
const aggregate = readJson(AGGREGATE);
const filteredAggregate = aggregate.filter((place) => place?.id !== OLD);
if (filteredAggregate.length !== aggregate.length - 1) {
  throw new Error('Expected exactly one duplicate Jernbanetorget record in naeringsliv aggregate');
}
writeJson(AGGREGATE, filteredAggregate);
if (fs.existsSync(full(OLD_CHILD))) fs.unlinkSync(full(OLD_CHILD));

const splitIndex = readJson(SPLIT_INDEX);
const filteredIndex = splitIndex.filter((row) => row?.id !== OLD);
if (filteredIndex.length !== splitIndex.length - 1) {
  throw new Error('Expected exactly one duplicate Jernbanetorget row in split index');
}
writeJson(SPLIT_INDEX, filteredIndex);

const splitManifest = readJson(SPLIT_MANIFEST);
const oldManifestCount = splitManifest.places?.length ?? 0;
splitManifest.places = (splitManifest.places || []).filter((row) => row?.id !== OLD);
if (splitManifest.places.length !== oldManifestCount - 1) {
  throw new Error('Expected exactly one duplicate Jernbanetorget row in split manifest');
}
splitManifest.source_sha256 = sha256(AGGREGATE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

// Remove obsolete coordinate evidence and its manifest entry.
if (fs.existsSync(full(OLD_EVIDENCE))) fs.unlinkSync(full(OLD_EVIDENCE));
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
evidenceManifest.files = (evidenceManifest.files || []).filter(
  (entry) => entry !== 'oslo/naeringsliv/jernbanetorget_trafikknutepunkt.json'
);
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

// Canonical Jernbanetorget already has its own Civication mapping in the by mapping file.
// Remove the duplicate naeringsliv mapping instead of creating two mappings to the same physical place.
const civication = readJson(CIVICATION);
const removedCivicationMappings = [];
for (const [key, mapping] of Object.entries(civication.mappings || {})) {
  if (mapping?.historyGoPlaceId === OLD) {
    removedCivicationMappings.push(key);
    delete civication.mappings[key];
  }
}
if (removedCivicationMappings.length !== 1) {
  throw new Error(`Expected one duplicate Civication mapping, found ${removedCivicationMappings.length}`);
}
writeJson(CIVICATION, civication);

// Remove duplicate translations if canonical translations exist; otherwise move the translation to the canonical key.
const i18nActions = [];
for (const file of I18N_FILES) {
  const data = readJson(file);
  if (!Object.prototype.hasOwnProperty.call(data, OLD)) continue;
  if (Object.prototype.hasOwnProperty.call(data, NEW)) {
    delete data[OLD];
    i18nActions.push({ file, action: 'removed_duplicate_key' });
  } else {
    data[NEW] = data[OLD];
    delete data[OLD];
    i18nActions.push({ file, action: 'moved_to_canonical_key' });
  }
  writeJson(file, data);
}

// Lock the retired ID into the legacy-alias gate.
let aliasText = fs.readFileSync(full(ALIAS_CHECK), 'utf8');
if (!aliasText.includes(`${OLD}: '${NEW}'`)) {
  const aliasMatch = aliasText.match(/const aliases: AliasMap = \{([^}]*)\};/s);
  if (!aliasMatch) throw new Error('Could not locate aliases map in check_place_id_aliases.mts');
  const body = aliasMatch[1].trim();
  const replacement = `const aliases: AliasMap = { ${body}${body ? ', ' : ''}${OLD}: '${NEW}' };`;
  aliasText = aliasText.replace(aliasMatch[0], replacement);
}
fs.writeFileSync(full(ALIAS_CHECK), aliasText);

// Remove the unresolved duplicate row without inventing a new verified place.
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

const migrationNote = `Duplikatmigrering (2026-07-20): \`${OLD}\` er fjernet som separat place fordi recorden representerte samme fysiske knutepunkt som canonical \`${NEW}\`. Den separate næringslivs-Civication-mappingen er fjernet fordi canonical Jernbanetorget allerede har egen Civication-mapping, i18n-dublettnøkler er ryddet, og legacy-ID-en er lagt til alias-gaten. Ingen ny verifisert place er opprettet.`;
if (!protocol.includes(migrationNote)) {
  protocol = protocol.replace(unresolvedHeader, `${migrationNote}\n\n${unresolvedHeader}`);
}

const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf(unresolvedHeader);
const etneStart = protocol.indexOf('## Etne');
const verifiedCount = (protocol.slice(osloStart, unresolvedStart).match(/^\| \d+ \|/gm) || []).length;
const unresolvedSection = protocol.slice(unresolvedStart, etneStart > unresolvedStart ? etneStart : protocol.length);
if (unresolvedSection.includes(`\`${OLD}\``)) {
  throw new Error('Legacy Jernbanetorget duplicate remains in unresolved protocol section');
}
const unresolvedCount = unresolvedSection
  .split('\n')
  .filter((line) => line.startsWith('| ') && !line.startsWith('|---') && !line.startsWith('| kandidat'))
  .length;
protocol = protocol.replace(
  /^Oslo-tabellen inneholder nå .*$/m,
  `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Duplikatet \`${OLD}\` er migrert til \`${NEW}\` uten å opprette et nytt fysisk sted. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`
);
protocol = protocol.replace(
  /^Disse kontrollene er fullført, men teller ikke blant de \d+ verifiserte eller kildekontrollerte canonical Oslo-stedene\.$/m,
  `Disse kontrollene er fullført, men teller ikke blant de ${verifiedCount} verifiserte eller kildekontrollerte canonical Oslo-stedene.`
);
fs.writeFileSync(full(PROTOCOL), protocol);

const remainingExactIds = [];
for (const abs of walk(full('data'))) {
  if (!abs.endsWith('.json')) continue;
  const text = fs.readFileSync(abs, 'utf8');
  if (text.includes(`"${OLD}"`)) remainingExactIds.push(path.relative(ROOT, abs));
}
if (remainingExactIds.length) {
  throw new Error(`Legacy Jernbanetorget place ID still appears as an exact JSON value/key: ${remainingExactIds.join(', ')}`);
}

fs.mkdirSync(full(REPORT_DIR), { recursive: true });
writeJson(`${REPORT_DIR}/summary.json`, {
  date: '2026-07-20',
  oldId: OLD,
  canonicalId: NEW,
  canonicalCoordinate: { lat: canonicalPlace.lat, lon: canonicalPlace.lon },
  canonicalStatus: canonicalPlace.coordStatus,
  removedDuplicatePlace: true,
  removedCivicationMappings,
  i18nActions,
  initialReferences,
  remainingExactIds,
  protocolCounts: { verifiedCount, unresolvedCount }
});
fs.writeFileSync(
  full(`${REPORT_DIR}/README.md`),
  `# Jernbanetorget duplicate migration\n\n- Removed legacy duplicate place \`${OLD}\`.\n- Canonical place remains \`${NEW}\` with its existing verified route geometry.\n- Removed the duplicate naeringsliv Civication mapping because canonical Jernbanetorget already has its own mapping.\n- Cleaned duplicate i18n keys and removed stale coordinate evidence.\n- Added the legacy ID to the place-alias validation gate.\n- No new physical place or coordinate was created.\n- Protocol after migration: ${verifiedCount} verified/source-controlled Oslo places; ${unresolvedCount} unresolved controls.\n`
);

console.log(JSON.stringify({ ok: true, verifiedCount, unresolvedCount, initialReferences, removedCivicationMappings, i18nActions }, null, 2));
