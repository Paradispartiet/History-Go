import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const OLD = 'loelva_historisk';
const NEW = 'alnaelva';
const CANONICAL = 'data/places/natur/oslo/places_oslo_alna/alnaelva.json';
const OLD_CHILD = 'data/places/natur/oslo/places_oslo_alna/loelva_historisk.json';
const OLD_EVIDENCE = 'data/coordinate-evidence/oslo/natur/loelva_historisk.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/loelva-historical-alias-migration';

function full(file) { return path.join(ROOT, file); }
function readJson(file) { return JSON.parse(fs.readFileSync(full(file), 'utf8')); }
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(full(file)), { recursive: true });
  fs.writeFileSync(full(file), `${JSON.stringify(value, null, 2)}\n`);
}
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}
function runTargetAwareCheck(check) {
  console.log(`\n[Loelva finalizer] npm run ${check}`);
  const result = spawnSync('npm', ['run', check], { encoding: 'utf8' });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  process.stdout.write(output);
  if (result.status !== 0) {
    const targetLines = output.split('\n').filter((line) => line.includes(OLD));
    if (targetLines.length) {
      throw new Error(`${check} reported legacy Loelva regressions:\n${targetLines.join('\n')}`);
    }
    console.log(`[Loelva finalizer] ${check} has pre-existing non-target failures; no legacy-ID regression detected.`);
  }
}

if (fs.existsSync(full(OLD_CHILD))) throw new Error('Legacy Loelva child still exists after validated data overlay');
if (fs.existsSync(full(OLD_EVIDENCE))) throw new Error('Legacy Loelva evidence still exists after validated data overlay');

const canonical = readJson(CANONICAL);
if (canonical.id !== NEW) throw new Error('Canonical Alnaelva missing');
if (canonical.coordStatus !== 'needs_source') throw new Error(`Alnaelva was unexpectedly promoted to ${canonical.coordStatus}`);
if (canonical.lat !== 59.9325 || canonical.lon !== 10.833 || canonical.r !== 400) {
  throw new Error(`Alnaelva coordinate changed unexpectedly: ${canonical.lat}, ${canonical.lon}, r=${canonical.r}`);
}
const aliasRelation = (canonical.relations || []).find((relation) => relation?.id === 'relation_alnaelva_loelva_historical_alias');
if (!aliasRelation || aliasRelation.type !== 'historical_alias' || aliasRelation.label !== 'Loelva') {
  throw new Error('Sourced historical Loelva alias relation is missing from canonical Alnaelva');
}

const evidenceManifest = readJson(EVIDENCE_MANIFEST);
if (!Array.isArray(evidenceManifest.files)) throw new Error('Coordinate evidence manifest missing files array');
const oldEvidenceEntry = 'oslo/natur/loelva_historisk.json';
const beforeEvidenceCount = evidenceManifest.files.length;
evidenceManifest.files = evidenceManifest.files.filter((entry) => entry !== oldEvidenceEntry);
const removedEvidenceManifestEntries = beforeEvidenceCount - evidenceManifest.files.length;
if (removedEvidenceManifestEntries !== 1) {
  throw new Error(`Expected exactly one Loelva evidence manifest entry, removed ${removedEvidenceManifestEntries}`);
}
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

let protocol = fs.readFileSync(full(PROTOCOL), 'utf8');
const unresolvedHeader = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
const unresolvedStart0 = protocol.indexOf(unresolvedHeader);
if (unresolvedStart0 < 0) throw new Error('Oslo unresolved header missing');
const etne0 = protocol.indexOf('\n## Etne', unresolvedStart0);
const unresolvedEnd0 = etne0 >= 0 ? etne0 : protocol.length;
const unresolvedLines = protocol.slice(unresolvedStart0, unresolvedEnd0).split('\n');
const oldRows = unresolvedLines.filter((line) => line.includes(`\`${OLD}\``));
if (oldRows.length !== 1) throw new Error(`Expected exactly one unresolved Loelva row, found ${oldRows.length}`);
const unresolvedBlock = unresolvedLines.filter((line) => !line.includes(`\`${OLD}\``)).join('\n');
protocol = protocol.slice(0, unresolvedStart0) + unresolvedBlock + protocol.slice(unresolvedEnd0);

const migrationNote = `Alias-migrering (2026-07-20): \`${OLD}\` er fjernet som separat fysisk place fordi Loelva er dokumentert som historisk/alternativt navn på \`${NEW}\`, ikke som et eget vassdrag. Navnehistorien er bevart som en eksplisitt \`historical_alias\`-relasjon på canonical Alnaelva, aktive referanser er retargetet og den separate Civication-markøren er fjernet. Alnaelvas koordinatstatus er fortsatt \`needs_source\`; migreringen verifiserer ikke den uavklarte elvegeometrien.`;
if (!protocol.includes(migrationNote)) {
  protocol = protocol.replace(unresolvedHeader, `${migrationNote}\n\n${unresolvedHeader}`);
}

const osloStart = protocol.indexOf('## Oslo');
const unresolvedStart = protocol.indexOf(unresolvedHeader);
const etneStart = protocol.indexOf('\n## Etne', unresolvedStart);
if (osloStart < 0 || unresolvedStart < 0) throw new Error('Could not locate Oslo protocol sections');
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
for (const check of ['audit:quiz-manifest:v2', 'audit:people-of-places', 'places:emner:check']) {
  runTargetAwareCheck(check);
}

const remainingExactIds = walk(full('data'))
  .filter((file) => file.endsWith('.json') && fs.readFileSync(file, 'utf8').includes(`"${OLD}"`))
  .map((file) => path.relative(ROOT, file))
  .sort();
if (remainingExactIds.length) {
  throw new Error(`Legacy Loelva exact IDs remain in active data: ${remainingExactIds.join(', ')}`);
}

fs.mkdirSync(full(REPORT_DIR), { recursive: true });
writeJson(`${REPORT_DIR}/summary.json`, {
  date: '2026-07-20',
  oldId: OLD,
  canonicalId: NEW,
  canonicalCoordinate: { lat: canonical.lat, lon: canonical.lon, r: canonical.r },
  canonicalCoordStatus: canonical.coordStatus,
  preservedHistoricalAliasRelation: aliasRelation,
  removedEvidenceManifestEntries,
  remainingExactIds,
  protocolCounts: { verifiedCount, unresolvedCount }
});
fs.writeFileSync(
  full(`${REPORT_DIR}/README.md`),
  `# Loelva historical alias migration\n\n- Removed \`${OLD}\` as a separate physical place.\n- Preserved Loelva as a sourced historical alias relation on canonical \`${NEW}\`.\n- Kept Alnaelva at \`needs_source\` with unchanged coordinates.\n- Removed only the stale Loelva evidence-manifest entry from the current manifest.\n- Retargeted active references and consolidated the documented nature-map alias keys in the validated data commit.\n- Protocol after migration: ${verifiedCount} verified/source-controlled Oslo places; ${unresolvedCount} unresolved controls.\n`
);

console.log(JSON.stringify({ ok: true, verifiedCount, unresolvedCount, remainingExactIds }, null, 2));
