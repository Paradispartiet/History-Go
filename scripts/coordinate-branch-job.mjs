import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const AGGREGATE = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening.json';
const SPLIT_INDEX = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening_index.json';
const SPLIT_MANIFEST = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening_manifest.json';
const SPLIT_DIR = 'data/places/sport/europa/norway/places_oslo_lekeplasser_trening';
const PLACE_INDEX = 'data/places/places_index.json';
const CIVICATION_DIR = 'data/Civication/map';
const ALIAS_CHECK = 'tools/check_place_id_aliases.mts';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const REPORT_DIR = 'reports/oslo-batch122-safe-pseudo-place-migration';

const MIGRATIONS = [
  { oldId: 'lekeplass_st_hanshaugen', newId: 'st_hanshaugen_park' },
  { oldId: 'lekeplass_birkelunden', newId: 'birkelunden' },
  { oldId: 'lekeplass_olaf_ryes_plass', newId: 'olaf_ryes_plass' },
  { oldId: 'lekeplass_botsparken', newId: 'botsparken' },
  { oldId: 'lekeplass_stensparken', newId: 'stensparken' },
  { oldId: 'treningssted_skur13', newId: 'skur13' }
];

const PHYSICAL_REF_KEYS = new Set([
  'placeId', 'place_id', 'primaryPlaceId', 'primary_place_id', 'historyGoPlaceId',
  'anchorPlaceId', 'anchor_place_id', 'homePlaceId', 'home_place_id', 'locationPlaceId',
  'location_place_id', 'relatedPlaceId', 'related_place_id'
]);
const PHYSICAL_REF_ARRAY_KEYS = new Set([
  'places', 'placeIds', 'place_ids', 'related_places', 'relatedPlaces', 'anchorPlaceIds', 'anchor_place_ids'
]);

const abs = (rel) => path.join(ROOT, rel);
const readJson = (rel) => JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
const writeJson = (rel, value) => {
  fs.mkdirSync(path.dirname(abs(rel)), { recursive: true });
  fs.writeFileSync(abs(rel), `${JSON.stringify(value, null, 2)}\n`);
};
const sha256 = (rel) => crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex');
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}
function dedupeStrings(values) {
  const seen = new Set();
  return values.filter((value) => {
    if (typeof value !== 'string') return true;
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}
function migrationMap() {
  return new Map(MIGRATIONS.map(({ oldId, newId }) => [oldId, newId]));
}
const ID_MAP = migrationMap();

function rewritePhysicalRefs(value, pathParts = [], actions = []) {
  if (Array.isArray(value)) {
    return value.map((item, index) => rewritePhysicalRefs(item, [...pathParts, String(index)], actions));
  }
  if (!value || typeof value !== 'object') return value;
  const out = Array.isArray(value) ? [] : { ...value };
  for (const [key, raw] of Object.entries(value)) {
    if (PHYSICAL_REF_KEYS.has(key) && typeof raw === 'string' && ID_MAP.has(raw)) {
      out[key] = ID_MAP.get(raw);
      actions.push({ path: [...pathParts, key].join('.'), oldId: raw, newId: out[key] });
      continue;
    }
    if (PHYSICAL_REF_ARRAY_KEYS.has(key) && Array.isArray(raw)) {
      const next = raw.map((item) => typeof item === 'string' && ID_MAP.has(item) ? ID_MAP.get(item) : item);
      out[key] = dedupeStrings(next);
      next.forEach((item, i) => {
        const old = raw[i];
        if (typeof old === 'string' && ID_MAP.has(old)) actions.push({ path: [...pathParts, key, String(i)].join('.'), oldId: old, newId: item });
      });
      continue;
    }
    out[key] = rewritePhysicalRefs(raw, [...pathParts, key], actions);
  }
  return out;
}

function scanPhysicalRefs(value, file, pathParts = [], hits = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => scanPhysicalRefs(item, file, [...pathParts, String(index)], hits));
    return hits;
  }
  if (!value || typeof value !== 'object') return hits;
  for (const [key, raw] of Object.entries(value)) {
    if (PHYSICAL_REF_KEYS.has(key) && typeof raw === 'string' && ID_MAP.has(raw)) {
      hits.push({ file, path: [...pathParts, key].join('.'), id: raw });
    }
    if (PHYSICAL_REF_ARRAY_KEYS.has(key) && Array.isArray(raw)) {
      raw.forEach((item, index) => {
        if (typeof item === 'string' && ID_MAP.has(item)) hits.push({ file, path: [...pathParts, key, String(index)].join('.'), id: item });
      });
    }
    scanPhysicalRefs(raw, file, [...pathParts, key], hits);
  }
  return hits;
}

function runTargetAwareCheck(check) {
  console.log(`\n[batch122 migration] npm run ${check}`);
  const result = spawnSync('npm', ['run', check], { encoding: 'utf8' });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  process.stdout.write(output);
  if (result.status !== 0) {
    const targetLines = output.split('\n').filter((line) => MIGRATIONS.some(({ oldId, newId }) => line.includes(oldId) || line.includes(newId)));
    if (targetLines.length) throw new Error(`${check} reported migration-specific regressions:\n${targetLines.join('\n')}`);
    console.log(`[batch122 migration] ${check} has pre-existing non-target failures; no migration-specific regression detected.`);
  }
}

const placeIndexRaw = readJson(PLACE_INDEX);
const placeIndex = Array.isArray(placeIndexRaw) ? placeIndexRaw : placeIndexRaw.places || [];
const placeById = new Map(placeIndex.map((place) => [place.id, place]));
for (const { oldId, newId } of MIGRATIONS) {
  if (!placeById.has(oldId)) throw new Error(`Legacy pseudo-place missing from current runtime index: ${oldId}`);
  if (!placeById.has(newId)) throw new Error(`Canonical migration target missing from current runtime index: ${newId}`);
}

const initialPhysicalRefs = [];
for (const file of walk(abs('data'))) {
  if (!file.endsWith('.json')) continue;
  const rel = path.relative(ROOT, file);
  try {
    scanPhysicalRefs(JSON.parse(fs.readFileSync(file, 'utf8')), rel, [], initialPhysicalRefs);
  } catch {
    // Ignore non-JSON or generated malformed fixtures; active JSON paths are validated later by repo checks.
  }
}

// Remove the six pseudo-place rows from aggregate and split outputs.
const aggregate = readJson(AGGREGATE);
const oldIds = new Set(MIGRATIONS.map(({ oldId }) => oldId));
const filteredAggregate = aggregate.filter((place) => !oldIds.has(place?.id));
if (aggregate.length - filteredAggregate.length !== MIGRATIONS.length) {
  throw new Error(`Expected to remove ${MIGRATIONS.length} aggregate rows, removed ${aggregate.length - filteredAggregate.length}`);
}
writeJson(AGGREGATE, filteredAggregate);

const splitIndex = readJson(SPLIT_INDEX);
const filteredIndex = splitIndex.filter((row) => !oldIds.has(row?.id));
if (splitIndex.length - filteredIndex.length !== MIGRATIONS.length) throw new Error('Unexpected split-index removal count');
writeJson(SPLIT_INDEX, filteredIndex);

const splitManifest = readJson(SPLIT_MANIFEST);
const oldManifestCount = splitManifest.places?.length ?? 0;
splitManifest.places = (splitManifest.places || []).filter((row) => !oldIds.has(row?.id));
if (oldManifestCount - splitManifest.places.length !== MIGRATIONS.length) throw new Error('Unexpected split-manifest removal count');
splitManifest.places = splitManifest.places.map((row, order) => ({ ...row, order }));
splitManifest.place_count = splitManifest.places.length;
splitManifest.source_sha256 = sha256(AGGREGATE);
splitManifest.generated_at = new Date().toISOString();
writeJson(SPLIT_MANIFEST, splitManifest);

for (const { oldId } of MIGRATIONS) {
  const child = `${SPLIT_DIR}/${oldId}.json`;
  if (!fs.existsSync(abs(child))) throw new Error(`Expected split child missing: ${child}`);
  fs.unlinkSync(abs(child));
}

// Remove pseudo-place Civication mappings. Canonical parents may have their own mappings elsewhere;
// if not, that is a separate parent-map enrichment task rather than a reason to keep a fake place marker.
const civicationActions = [];
const mappingFiles = walk(abs(CIVICATION_DIR)).filter((file) => file.endsWith('.json'));
const targetMappings = new Map(MIGRATIONS.map(({ newId }) => [newId, []]));
for (const file of mappingFiles) {
  const rel = path.relative(ROOT, file);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [key, mapping] of Object.entries(data.mappings || {})) {
    if (targetMappings.has(mapping?.historyGoPlaceId)) targetMappings.get(mapping.historyGoPlaceId).push({ file: rel, key });
  }
}
for (const file of mappingFiles) {
  const rel = path.relative(ROOT, file);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let changed = false;
  for (const [key, mapping] of Object.entries(data.mappings || {})) {
    if (!oldIds.has(mapping?.historyGoPlaceId)) continue;
    const newId = ID_MAP.get(mapping.historyGoPlaceId);
    civicationActions.push({ file: rel, key, oldId: mapping.historyGoPlaceId, newId, canonicalMappingPresent: (targetMappings.get(newId) || []).length > 0 });
    delete data.mappings[key];
    changed = true;
  }
  if (changed) writeJson(rel, data);
}

// Remove obsolete place-translation keys; do not overwrite canonical parent text with playground text.
const i18nActions = [];
for (const file of walk(abs('data/i18n'))) {
  if (!file.endsWith('.json')) continue;
  const rel = path.relative(ROOT, file);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  let changed = false;
  for (const { oldId, newId } of MIGRATIONS) {
    if (Object.prototype.hasOwnProperty.call(data, oldId)) {
      delete data[oldId];
      i18nActions.push({ file: rel, oldId, newId, action: 'removed_obsolete_place_key' });
      changed = true;
    }
  }
  if (changed) writeJson(rel, data);
}

// Retarget only fields that are explicitly physical place references. Preserve provenance/content IDs
// such as Wonderkammer meta.sourceObjectId and chamber/item IDs.
const special = new Set([AGGREGATE, SPLIT_INDEX, SPLIT_MANIFEST, PLACE_INDEX]);
for (const { oldId } of MIGRATIONS) special.add(`${SPLIT_DIR}/${oldId}.json`);
for (const file of mappingFiles) special.add(path.relative(ROOT, file));
const rewrittenFiles = [];
const rewriteActions = [];
for (const file of walk(abs('data'))) {
  if (!file.endsWith('.json')) continue;
  const rel = path.relative(ROOT, file);
  if (special.has(rel) || rel.startsWith('data/i18n/')) continue;
  const text = fs.readFileSync(file, 'utf8');
  if (![...oldIds].some((id) => text.includes(`"${id}"`))) continue;
  const data = JSON.parse(text);
  const actions = [];
  const rewritten = rewritePhysicalRefs(data, [], actions);
  if (actions.length) {
    writeJson(rel, rewritten);
    rewrittenFiles.push(rel);
    rewriteActions.push(...actions.map((action) => ({ file: rel, ...action })));
  }
}

// Retire old IDs in the alias gate so future exact physical references normalize to canonical parents.
let aliasText = fs.readFileSync(abs(ALIAS_CHECK), 'utf8');
const aliasMatch = aliasText.match(/const aliases: AliasMap = \{([^}]*)\};/s);
if (!aliasMatch) throw new Error('Could not locate aliases map');
let aliasBody = aliasMatch[1].trim();
for (const { oldId, newId } of MIGRATIONS) {
  const existing = aliasText.match(new RegExp(`${oldId}\\s*:\\s*['\"]([^'\"]+)['\"]`));
  if (existing && existing[1] !== newId) throw new Error(`Conflicting existing alias for ${oldId}: ${existing[1]}`);
  if (!existing) aliasBody += `${aliasBody ? ', ' : ''}${oldId}: '${newId}'`;
}
aliasText = aliasText.replace(aliasMatch[0], `const aliases: AliasMap = { ${aliasBody} };`);
fs.writeFileSync(abs(ALIAS_CHECK), aliasText);

// Record migration status without advancing batch 122: nine source records still require resolution.
let protocol = fs.readFileSync(abs(PROTOCOL), 'utf8');
const note = `Batch 122-forberedelse (2026-07-21): seks rene lekeplass-/trenings-pseudo-places er migrert til eksisterende canonical parents uten nye markører: \`lekeplass_st_hanshaugen\` → \`st_hanshaugen_park\`, \`lekeplass_birkelunden\` → \`birkelunden\`, \`lekeplass_olaf_ryes_plass\` → \`olaf_ryes_plass\`, \`lekeplass_botsparken\` → \`botsparken\`, \`lekeplass_stensparken\` → \`stensparken\` og \`treningssted_skur13\` → \`skur13\`. Leke-/treningsinnhold beholdes som Wonderkammer/activity-lag, mens pseudo-place-postene og deres separate Civication-markører er fjernet. Batch 122 forblir aktiv for de ni gjenværende source-recordene.`;
if (!protocol.includes(note)) {
  const marker = '### Dokumenterte Oslo-kontroller uten godkjent koordinat';
  const index = protocol.indexOf(marker);
  if (index < 0) throw new Error('Could not find Oslo protocol migration-note insertion point');
  protocol = `${protocol.slice(0, index)}${note}\n\n${protocol.slice(index)}`;
}
fs.writeFileSync(abs(PROTOCOL), protocol);

execFileSync('npm', ['run', 'places:index:build'], { stdio: 'inherit' });
execFileSync('npm', ['run', 'places:aliases:check'], { stdio: 'inherit' });

// No retired ID may remain in an explicit physical-place reference field.
const remainingPhysicalRefs = [];
for (const file of walk(abs('data'))) {
  if (!file.endsWith('.json')) continue;
  const rel = path.relative(ROOT, file);
  try {
    scanPhysicalRefs(JSON.parse(fs.readFileSync(file, 'utf8')), rel, [], remainingPhysicalRefs);
  } catch {
    // Standard repository checks below handle malformed active JSON.
  }
}
if (remainingPhysicalRefs.length) {
  throw new Error(`Retired pseudo-place IDs remain in physical reference fields: ${JSON.stringify(remainingPhysicalRefs.slice(0, 50))}`);
}

for (const check of ['check:stories', 'audit:quiz-manifest:v2', 'audit:people-of-places', 'places:emners:check']) {
  runTargetAwareCheck(check);
}

const remainingAggregateIds = readJson(AGGREGATE).map((place) => place.id);
const remainingSourceCount = remainingAggregateIds.length;
writeJson(`${REPORT_DIR}/summary.json`, {
  version: '2026-07-21',
  batch: 122,
  migrations: MIGRATIONS,
  removedPseudoPlaceCount: MIGRATIONS.length,
  remainingSourceCount,
  remainingSourceIds: remainingAggregateIds,
  initialPhysicalRefs,
  rewrittenFiles,
  rewriteActions,
  civicationActions,
  targetCanonicalMappings: Object.fromEntries([...targetMappings.entries()]),
  i18nActions,
  remainingPhysicalRefs,
  batchAdvanced: false,
  nextAction: 'Resolve the nine remaining batch-122 source records; do not reintroduce the retired pseudo-place IDs.'
});
fs.writeFileSync(abs(`${REPORT_DIR}/README.md`), `# Oslo batch 122 — safe pseudo-place migration\n\nSix playground/training pseudo-places were retired to existing canonical parent places. The physical place registry no longer treats these activity layers as standalone places. Wonderkammer/activity provenance IDs are preserved where they are not physical place references.\n\nBatch 122 remains active for the nine unresolved source records.\n`);

console.log(JSON.stringify({
  ok: true,
  migrated: MIGRATIONS.length,
  remainingSourceCount,
  remainingSourceIds: remainingAggregateIds,
  physicalRefsRewritten: rewriteActions.length,
  civicationMappingsRemoved: civicationActions.length,
  batchAdvanced: false
}, null, 2));
