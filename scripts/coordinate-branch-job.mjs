#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const batch = 123;
const sourceRel = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json';
const sourceFile = path.join(root, sourceRel);
const sourceDir = path.dirname(sourceFile);
const splitDir = path.join(sourceDir, 'places_oslo_lekeplasser_trening');
const splitManifestFile = path.join(sourceDir, 'places_oslo_lekeplasser_trening_manifest.json');
const splitIndexFile = path.join(sourceDir, 'places_oslo_lekeplasser_trening_index.json');
const protocolFile = path.join(root, 'docs/coordinates/coordinate-control-protocol.md');
const aliasToolFile = path.join(root, 'tools/check_place_id_aliases.mts');
const reportDir = path.join(root, 'reports/oslo-coordinate-control-batch-123-playground-parent-migration');
fs.mkdirSync(reportDir, { recursive: true });

const migrations = {
  lekeplass_sofienbergparken: 'sofienbergparken_subkultur',
  lekeplass_st_hanshaugen: 'st_hanshaugen_park',
  lekeplass_birkelunden: 'birkelunden',
  lekeplass_olaf_ryes_plass: 'olaf_ryes_plass',
  lekeplass_botsparken: 'botsparken',
  lekeplass_stensparken: 'stensparken',
  treningssted_skur13: 'skur13',
};
const migratedIds = new Set(Object.keys(migrations));
const expectedRemaining = [
  'lekeplass_kirsebarlunden',
  'lekeplass_snippen',
  'lekeplass_frognerborgen',
  'lekeplass_kampen_park',
  'aktivitet_rudolf_nilsens_plass',
  'treningssted_torshovdalen',
  'treningssted_kampen_park',
  'treningssted_sognsvann',
  'korketrekkeren',
];

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
const writeText = (file, value) => fs.writeFileSync(file, value.endsWith('\n') ? value : value + '\n');
const sha256File = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

function walkJson(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkJson(full);
    return entry.isFile() && entry.name.endsWith('.json') ? [full] : [];
  });
}

function replaceExactStrings(value, key = '') {
  if (typeof value === 'string') {
    if (key === 'id') return value;
    return migrations[value] ?? value;
  }
  if (Array.isArray(value)) return value.map((item) => replaceExactStrings(item, key));
  if (!value || typeof value !== 'object') return value;
  const out = {};
  for (const [childKey, childValue] of Object.entries(value)) out[childKey] = replaceExactStrings(childValue, childKey);
  return out;
}

function mergeWonderkammerPlaces(payload) {
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.places)) return payload;
  const merged = [];
  const byPlaceId = new Map();
  for (const rawEntry of payload.places) {
    const entry = structuredClone(rawEntry);
    const placeId = String(entry?.place_id ?? '');
    if (!placeId || !byPlaceId.has(placeId)) {
      merged.push(entry);
      if (placeId) byPlaceId.set(placeId, entry);
      continue;
    }
    const target = byPlaceId.get(placeId);
    if (!Array.isArray(target?.chambers) || !Array.isArray(entry?.chambers)) {
      throw new Error(`Duplicate Wonderkammer place_id uten mergebare chambers: ${placeId}`);
    }
    const seen = new Set(target.chambers.map((item) => item?.id).filter(Boolean));
    for (const chamber of entry.chambers) {
      if (chamber?.id && seen.has(chamber.id)) continue;
      target.chambers.push(chamber);
      if (chamber?.id) seen.add(chamber.id);
    }
  }
  payload.places = merged;
  return payload;
}

function pruneCivication(value) {
  if (Array.isArray(value)) return value.map(pruneCivication).filter((item) => item !== undefined);
  if (!value || typeof value !== 'object') return value;
  if (typeof value.historyGoPlaceId === 'string' && migratedIds.has(value.historyGoPlaceId)) return undefined;
  const out = {};
  for (const [key, child] of Object.entries(value)) {
    const next = pruneCivication(child);
    if (next !== undefined) out[key] = next;
  }
  return out;
}

// Only migrate when today's canonical parent actually exists. Frognerborgen and the two
// Kampen activity layers stay in manual review because their older proposed parent IDs
// (`frognerparken` and `kampen_park`) no longer exist as canonical places.
const currentIndex = readJson(path.join(root, 'data/places/places_index.json'));
const currentIds = new Set((Array.isArray(currentIndex) ? currentIndex : []).map((place) => place?.id).filter(Boolean));
for (const parentId of new Set(Object.values(migrations))) {
  if (!currentIds.has(parentId)) throw new Error(`Mangler canonical parent-place: ${parentId}`);
}

const sourcePlaces = readJson(sourceFile);
if (!Array.isArray(sourcePlaces)) throw new Error('Lekeplass/trening source må være array');
const beforeIds = sourcePlaces.map((place) => place?.id).filter(Boolean);
for (const id of migratedIds) if (!beforeIds.includes(id)) throw new Error(`Source mangler forventet migrerings-ID ${id}`);
const remainingPlaces = sourcePlaces.filter((place) => !migratedIds.has(place?.id));
const remainingIds = remainingPlaces.map((place) => place.id);
if (JSON.stringify(remainingIds) !== JSON.stringify(expectedRemaining)) {
  throw new Error(`Uventet restinventar etter migrering: ${JSON.stringify(remainingIds)}`);
}
writeJson(sourceFile, remainingPlaces);

for (const id of migratedIds) {
  const childFile = path.join(splitDir, `${id}.json`);
  if (!fs.existsSync(childFile)) throw new Error(`Mangler split child før sletting: ${id}`);
  fs.unlinkSync(childFile);
}

const splitManifest = readJson(splitManifestFile);
splitManifest.places = (splitManifest.places || []).filter((row) => !migratedIds.has(row?.id));
splitManifest.places.forEach((row, index) => { row.order = index; });
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256File(sourceFile);
splitManifest.generated_at = new Date().toISOString();
for (const row of splitManifest.places) row.sha256 = sha256File(path.join(sourceDir, row.file));
writeJson(splitManifestFile, splitManifest);

const splitIndex = readJson(splitIndexFile);
if (!Array.isArray(splitIndex)) throw new Error('Split index må være array');
writeJson(splitIndexFile, splitIndex.filter((row) => !migratedIds.has(row?.id)));

const deletedEvidence = [];
for (const file of walkJson(path.join(root, 'data/coordinate-evidence'))) {
  let payload;
  try { payload = readJson(file); } catch { continue; }
  if (migratedIds.has(payload?.placeId)) {
    deletedEvidence.push(path.relative(root, file).replace(/\\/g, '/'));
    fs.unlinkSync(file);
  }
}

// Wonderkammer is the destination model for these subfeatures. Retarget exact IDs and
// merge any duplicate parent groups created by the retargeting.
const wonderkammerChanges = [];
for (const file of walkJson(path.join(root, 'data/wonderkammer'))) {
  const before = fs.readFileSync(file, 'utf8');
  const payload = mergeWonderkammerPlaces(replaceExactStrings(JSON.parse(before)));
  const after = JSON.stringify(payload, null, 2) + '\n';
  if (after !== before) {
    fs.writeFileSync(file, after);
    wonderkammerChanges.push(path.relative(root, file).replace(/\\/g, '/'));
  }
}

// These subfeatures are no longer top-level History Go places, so their Civication map entries go.
const civicationChanges = [];
for (const file of walkJson(path.join(root, 'data/Civication'))) {
  const before = fs.readFileSync(file, 'utf8');
  const payload = pruneCivication(JSON.parse(before));
  const after = JSON.stringify(payload, null, 2) + '\n';
  if (after !== before) {
    fs.writeFileSync(file, after);
    civicationChanges.push(path.relative(root, file).replace(/\\/g, '/'));
  }
}

// Place translation files use place IDs as top-level dictionary keys. Removed place keys
// are deleted rather than merged into the parent translation, because playground text is
// now Wonderkammer content and must not overwrite the canonical parent place description.
const i18nChanges = [];
for (const file of walkJson(path.join(root, 'data/i18n/content/places'))) {
  const before = fs.readFileSync(file, 'utf8');
  const payload = JSON.parse(before);
  let changed = false;
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    for (const oldId of migratedIds) {
      if (Object.prototype.hasOwnProperty.call(payload, oldId)) {
        delete payload[oldId];
        changed = true;
      }
    }
  }
  if (changed) {
    fs.writeFileSync(file, JSON.stringify(payload, null, 2) + '\n');
    i18nChanges.push(path.relative(root, file).replace(/\\/g, '/'));
  }
}

// Retarget exact references on other active content surfaces. Never rewrite a record's own id.
const retargetRoots = ['data/leksikon', 'data/quiz', 'data/stories', 'data/places'];
const retargetedFiles = [];
for (const relRoot of retargetRoots) {
  for (const file of walkJson(path.join(root, relRoot))) {
    if (file === sourceFile || file === splitManifestFile || file === splitIndexFile || file.startsWith(splitDir + path.sep)) continue;
    const before = fs.readFileSync(file, 'utf8');
    const payload = replaceExactStrings(JSON.parse(before));
    const after = JSON.stringify(payload, null, 2) + '\n';
    if (after !== before) {
      fs.writeFileSync(file, after);
      retargetedFiles.push(path.relative(root, file).replace(/\\/g, '/'));
    }
  }
}

// Extend the existing legacy-ID gate so future content cannot reintroduce removed subfeature IDs.
let aliasTool = fs.readFileSync(aliasToolFile, 'utf8');
for (const [oldId, parentId] of Object.entries(migrations)) {
  if (!aliasTool.includes(`${oldId}: '${parentId}'`)) {
    aliasTool = aliasTool.replace(/const aliases: AliasMap = \{([^\n]*)\};/, (_match, body) => `const aliases: AliasMap = {${body}, ${oldId}: '${parentId}' };`);
  }
}
aliasTool = aliasTool.replace(
  "const targets: string[] = ['data/i18n/content/places', 'data/leksikon', 'data/places', 'data/quiz'];",
  "const targets: string[] = ['data/i18n/content/places', 'data/leksikon', 'data/places', 'data/quiz', 'data/stories', 'data/wonderkammer', 'data/Civication'];"
);
writeText(aliasToolFile, aliasTool);

// Regenerate runtime and run cross-surface integrity checks before the coordinate runner gates.
execFileSync('npm', ['run', 'places:index:build'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:tools'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/tools/check_place_id_aliases.mjs'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'build:scripts'], { cwd: root, stdio: 'inherit' });
execFileSync('node', ['dist/scripts/audit-civication-historygo-place-mapping.mjs'], { cwd: root, stdio: 'inherit' });
execFileSync('npm', ['run', 'check:stories'], { cwd: root, stdio: 'inherit' });

// Any exact legacy ID left in active data is a hard migration bug.
const residuals = [];
for (const file of walkJson(path.join(root, 'data'))) {
  if (/(^|[\\/])(archive|arkiv)([\\/]|$)/i.test(file)) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const oldId of migratedIds) {
    if (text.includes(`\"${oldId}\"`)) residuals.push({ file: path.relative(root, file).replace(/\\/g, '/'), oldId });
  }
}
if (residuals.length) throw new Error(`Legacy place-ID-er står igjen i aktiv data: ${JSON.stringify(residuals.slice(0, 50))}`);

const manualReview = expectedRemaining.filter((id) => id !== 'korketrekkeren');
const report = {
  generatedAt: new Date().toISOString(),
  batch,
  sourceFile: sourceRel,
  modelRule: 'Pure playground/training subfeatures belong in Wonderkammer under a real canonical parent place, not as duplicate map places.',
  migrated: Object.entries(migrations).map(([oldPlaceId, parentPlaceId]) => ({ oldPlaceId, parentPlaceId })),
  remainingForManualIdentityReview: manualReview,
  alreadyControlled: ['korketrekkeren'],
  sourceRecordCountBefore: beforeIds.length,
  sourceRecordCountAfter: remainingIds.length,
  deletedEvidence,
  wonderkammerChanges,
  civicationChanges,
  i18nChanges,
  retargetedFiles,
  residualLegacyReferences: residuals,
};
writeJson(path.join(reportDir, 'results.json'), report);
writeText(path.join(reportDir, 'README.md'), [
  '# Oslo coordinate control batch 123 – playground/training parent migration',
  '',
  'This batch resolves identity overlap before further coordinate production. Seven pure playground/training subfeature records are removed as independent active places and their Wonderkammer content is retargeted to existing canonical parent places.',
  '',
  '## Migrated',
  ...Object.entries(migrations).map(([oldId, parentId]) => `- \`${oldId}\` → Wonderkammer under \`${parentId}\``),
  '',
  '## Still requires manual identity/parent review',
  ...manualReview.map((id) => `- \`${id}\``),
  '',
  '`lekeplass_frognerborgen`, `lekeplass_kampen_park` and `treningssted_kampen_park` remain open because the older audit referenced non-existent current parent IDs. `korketrekkeren` remains the already controlled record. No coordinate is fabricated for unresolved identity cases.',
].join('\n'));

let protocol = fs.readFileSync(protocolFile, 'utf8');
if (!protocol.includes('Batch 123 (2026-07-21)')) {
  const migratedText = Object.entries(migrations).map(([oldId, parentId]) => `\`${oldId}\` → \`${parentId}\``).join(', ');
  const reviewText = manualReview.map((id) => `\`${id}\``).join(', ');
  const paragraph = `Batch 123 (2026-07-21) rydder lekeplass-/treningskøen før videre koordinatproduksjon. Repoets modellregel er at rene lekeplasser og rene treningsaktivitetslag skal være Wonderkammer-innhold under et faktisk canonical parent-place, ikke egne overlappende kartmarkører. Syv sikre subfeature-records er derfor migrert til parent-place og fjernet som aktive places: ${migratedText}. Wonderkammer-referanser er retargetet, Civication-top-level-mappings for de fjernede place-ID-ene er fjernet, place-i18n for de fjernede markørene er fjernet, og legacy-ID-ene er lagt i alias-gaten. Åtte grensefall forblir urørt til egen identitetskontroll: ${reviewText}. Frognerborgen og de to Kampen-postene beholdes eksplisitt i review fordi den eldre migreringsauditen pekte på parent-ID-ene \`frognerparken\` og \`kampen_park\`, som ikke finnes i dagens canonical inventory. \`korketrekkeren\` var allerede kontrollert. Den tidligere lekeplass/trening-rapporten som brukte batchnummer 122 var kun read-only intake og endret ingen canonical data.`;
  const marker = 'Retrospektiv compliance-audit batch 1–120 (2026-07-21):';
  if (!protocol.includes(marker)) throw new Error('Fant ikke protokollmarkør for batch 123');
  protocol = protocol.replace(marker, `${paragraph}\n\n${marker}`);
  writeText(protocolFile, protocol);
}

console.log(JSON.stringify({ batch, migrated: Object.keys(migrations).length, remainingForManualIdentityReview: manualReview }, null, 2));
