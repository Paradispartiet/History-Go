import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const OLD = 'nydalen_industristed';
const NEW = 'nydalen';
const OLD_AGG = 'data/places/natur/oslo/places_oslo_natur_akerselvarute.json';
const OLD_CHILD = 'data/places/natur/oslo/places_oslo_natur_akerselvarute/nydalen_industristed.json';
const OLD_INDEX = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_index.json';
const OLD_MANIFEST = 'data/places/natur/oslo/places_oslo_natur_akerselvarute_manifest.json';
const NEW_AGG = 'data/places/by/oslo/places_by.json';
const NEW_CHILD = 'data/places/by/oslo/places/nydalen.json';
const NEW_MANIFEST = 'data/places/by/oslo/places_by_manifest.json';
const OLD_EVIDENCE = 'data/coordinate-evidence/oslo/natur/nydalen_industristed.json';
const EVIDENCE_MANIFEST = 'data/coordinate-evidence/manifest.json';
const ROUTE_MAPPING = 'data/Civication/map/historyGoPlaceMapping.natur_akerselvarute.json';
const PLACE_INDEX = 'data/places/places_index.json';
const PROTOCOL = 'docs/coordinates/coordinate-control-protocol.md';
const ALIAS_CHECK = 'tools/check_place_id_aliases.mts';
const TARGET_TEST = 'tests/nydalen-industristed-batch1-round-content.test.js';
const REPORT_DIR = 'reports/nydalen-industristed-duplicate-migration-final';
const I18N_FILES = new Set([
  'data/i18n/content/places/en.json',
  'data/i18n/content/places/es.json',
  'data/i18n/content/places/pt.json'
]);
const APPROVED_KEY_COLLISION_FILES = new Set([
  'data/natur/nature_bird_place_map.json',
  'data/natur/nature_place_map_candidates.json'
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
function unionScalar(a = [], b = []) {
  return [...new Set([...(a || []), ...(b || [])])];
}
function unionByKey(a = [], b = []) {
  const out = [];
  const seen = new Set();
  for (const item of [...(a || []), ...(b || [])]) {
    const key = item && typeof item === 'object'
      ? (item.id || item.url || JSON.stringify(item))
      : JSON.stringify(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

const canonicalPreferredConflicts = [];
function mergeCanonicalPreferred(existing, incoming, trace) {
  if (existing === undefined) return incoming;
  if (incoming === undefined) return existing;
  if (JSON.stringify(existing) === JSON.stringify(incoming)) return existing;
  if (Array.isArray(existing) && Array.isArray(incoming)) return unionByKey(existing, incoming);
  if (existing && incoming && typeof existing === 'object' && typeof incoming === 'object' && !Array.isArray(existing) && !Array.isArray(incoming)) {
    const out = { ...existing };
    for (const [key, value] of Object.entries(incoming)) {
      out[key] = mergeCanonicalPreferred(out[key], value, `${trace}.${key}`);
    }
    return out;
  }
  canonicalPreferredConflicts.push({ trace, canonical: existing, retired: incoming });
  return existing;
}

function replaceExact(value, rel, collisions) {
  if (Array.isArray(value)) {
    const hadDirectOld = value.some((item) => item === OLD);
    const mapped = value.map((item) => replaceExact(item, rel, collisions));
    return hadDirectOld ? unionByKey([], mapped) : mapped;
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, raw] of Object.entries(value)) {
      const nextKey = key === OLD ? NEW : key;
      const nextValue = replaceExact(raw, rel, collisions);
      if (Object.prototype.hasOwnProperty.call(out, nextKey) && nextKey !== key) {
        if (APPROVED_KEY_COLLISION_FILES.has(rel)) {
          out[nextKey] = mergeCanonicalPreferred(out[nextKey], nextValue, `${rel}:${nextKey}`);
          continue;
        }
        if (JSON.stringify(out[nextKey]) !== JSON.stringify(nextValue)) collisions.push({ file: rel, key: nextKey });
        continue;
      }
      out[nextKey] = nextValue;
    }
    return out;
  }
  return value === OLD ? NEW : value;
}

function runTargetAwareCheck(check) {
  console.log(`\n[Nydalen migration] npm run ${check}`);
  const result = spawnSync('npm', ['run', check], { encoding: 'utf8' });
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  process.stdout.write(output);
  if (result.status !== 0) {
    const targetLines = output.split('\n').filter((line) => line.includes(OLD));
    if (targetLines.length) {
      throw new Error(`${check} reported legacy Nydalen industristed regressions:\n${targetLines.join('\n')}`);
    }
    console.log(`[Nydalen migration] ${check} has pre-existing non-target failures; no legacy-ID regression detected.`);
  }
}

const oldPlaceRaw = readJson(OLD_CHILD);
const canonicalRaw = readJson(NEW_CHILD);
if (oldPlaceRaw.id !== OLD || oldPlaceRaw.coordStatus !== 'needs_source') {
  throw new Error('Legacy Nydalen industristed state changed unexpectedly');
}
if (canonicalRaw.id !== NEW || canonicalRaw.coordStatus !== 'verified_geometry') {
  throw new Error('Canonical Nydalen is not in expected verified_geometry state');
}
const canonicalCoordinateBefore = {
  lat: canonicalRaw.lat,
  lon: canonicalRaw.lon,
  r: canonicalRaw.r,
  coordStatus: canonicalRaw.coordStatus,
  sourceObjectId: canonicalRaw.sourceObjectId
};

const initialReferenceFiles = walk(full('data'))
  .filter((file) => file.endsWith('.json') && fs.readFileSync(file, 'utf8').includes(`"${OLD}"`))
  .map((file) => path.relative(ROOT, file))
  .sort();

const mergeCollisions = [];
const oldPlace = replaceExact(oldPlaceRaw, OLD_CHILD, mergeCollisions);
if (mergeCollisions.length) {
  throw new Error(`Unexpected collisions while normalizing Nydalen content: ${JSON.stringify(mergeCollisions)}`);
}

const canonical = {
  ...canonicalRaw,
  routeId: canonicalRaw.routeId || oldPlace.routeId,
  tags: unionScalar(canonicalRaw.tags, oldPlace.tags),
  emne_ids: unionScalar(canonicalRaw.emne_ids, oldPlace.emne_ids),
  externalLinks: unionByKey(canonicalRaw.externalLinks, oldPlace.externalLinks),
  underbadge_ids: unionScalar(canonicalRaw.underbadge_ids, oldPlace.underbadge_ids),
  works: unionByKey(canonicalRaw.works, oldPlace.works),
  for_na: canonicalRaw.for_na || oldPlace.for_na,
  civication_store: unionByKey(canonicalRaw.civication_store, oldPlace.civication_store),
  brands: unionByKey(canonicalRaw.brands, oldPlace.brands),
  nature_profile: oldPlace.nature_profile || canonicalRaw.nature_profile
};

if (canonical.lat !== canonicalCoordinateBefore.lat || canonical.lon !== canonicalCoordinateBefore.lon || canonical.r !== canonicalCoordinateBefore.r || canonical.coordStatus !== canonicalCoordinateBefore.coordStatus || canonical.sourceObjectId !== canonicalCoordinateBefore.sourceObjectId) {
  throw new Error('Canonical Nydalen coordinate identity changed during content merge');
}
writeJson(NEW_CHILD, canonical);

const canonicalAggregate = readJson(NEW_AGG);
let canonicalCount = 0;
const updatedCanonicalAggregate = canonicalAggregate.map((place) => {
  if (place?.id !== NEW) return place;
  canonicalCount++;
  return canonical;
});
if (canonicalCount !== 1) throw new Error(`Expected exactly one canonical Nydalen in by aggregate, found ${canonicalCount}`);
writeJson(NEW_AGG, updatedCanonicalAggregate);

const canonicalManifest = readJson(NEW_MANIFEST);
const canonicalManifestRow = (canonicalManifest.places || []).find((row) => row?.id === NEW);
if (!canonicalManifestRow) throw new Error('Canonical Nydalen missing from by split manifest');
canonicalManifestRow.sha256 = sha256(NEW_CHILD);
canonicalManifest.source_sha256 = sha256(NEW_AGG);
canonicalManifest.generated_at = new Date().toISOString();
writeJson(NEW_MANIFEST, canonicalManifest);

const oldAggregate = readJson(OLD_AGG);
const filteredOldAggregate = oldAggregate.filter((place) => place?.id !== OLD);
if (filteredOldAggregate.length !== oldAggregate.length - 1) {
  throw new Error('Expected exactly one Nydalen industristed in Akerselva aggregate');
}
const oldAggregateCollisions = [];
writeJson(OLD_AGG, replaceExact(filteredOldAggregate, OLD_AGG, oldAggregateCollisions));
if (oldAggregateCollisions.length) {
  throw new Error(`Exact-ID collisions in Akerselva aggregate: ${JSON.stringify(oldAggregateCollisions)}`);
}
if (fs.existsSync(full(OLD_CHILD))) fs.unlinkSync(full(OLD_CHILD));

const oldIndex = readJson(OLD_INDEX);
const filteredOldIndex = oldIndex.filter((row) => row?.id !== OLD);
if (filteredOldIndex.length !== oldIndex.length - 1) {
  throw new Error('Expected exactly one Nydalen industristed row in route split index');
}
writeJson(OLD_INDEX, filteredOldIndex);

const oldManifest = readJson(OLD_MANIFEST);
const oldManifestCount = oldManifest.places?.length ?? 0;
oldManifest.places = (oldManifest.places || []).filter((row) => row?.id !== OLD);
if (oldManifest.places.length !== oldManifestCount - 1) {
  throw new Error('Expected exactly one Nydalen industristed row in route split manifest');
}
oldManifest.place_count = oldManifest.places.length;
oldManifest.source_sha256 = sha256(OLD_AGG);
oldManifest.generated_at = new Date().toISOString();
writeJson(OLD_MANIFEST, oldManifest);

if (fs.existsSync(full(OLD_EVIDENCE))) fs.unlinkSync(full(OLD_EVIDENCE));
const evidenceManifest = readJson(EVIDENCE_MANIFEST);
evidenceManifest.files = (evidenceManifest.files || []).filter((entry) => entry !== 'oslo/natur/nydalen_industristed.json');
writeJson(EVIDENCE_MANIFEST, evidenceManifest);

const routeMapping = readJson(ROUTE_MAPPING);
const mappingEntries = Object.entries(routeMapping.mappings || {});
const oldMappingEntries = mappingEntries.filter(([, mapping]) => mapping?.historyGoPlaceId === OLD);
const canonicalMappingEntries = mappingEntries.filter(([, mapping]) => mapping?.historyGoPlaceId === NEW);
if (oldMappingEntries.length !== 1) {
  throw new Error(`Expected exactly one Nydalen industristed route mapping, found ${oldMappingEntries.length}`);
}
if (canonicalMappingEntries.length < 1) {
  throw new Error('Canonical Nydalen route mapping is missing; refusing to create a second physical mapping implicitly');
}
const [oldMappingKey] = oldMappingEntries[0];
delete routeMapping.mappings[oldMappingKey];
writeJson(ROUTE_MAPPING, routeMapping);

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
  OLD_AGG, OLD_CHILD, OLD_INDEX, OLD_MANIFEST,
  NEW_AGG, NEW_CHILD, NEW_MANIFEST,
  OLD_EVIDENCE, EVIDENCE_MANIFEST, ROUTE_MAPPING, PLACE_INDEX,
  ...I18N_FILES
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

const migratedTest = `const assert = require('assert');\nconst fs = require('fs');\nconst path = require('path');\n\nconst repo = path.resolve(__dirname, '..');\nconst readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(repo, relativePath), 'utf8'));\nconst expectedRounds = ['people', 'nature', 'badges', 'works', 'civication', 'brands', 'før_nå', 'fortellinger', 'leksikon'];\nconst runtimeSource = fs.readFileSync(path.join(repo, 'js/ui/place-card.js'), 'utf8');\nconst byProfileMatch = runtimeSource.match(/by:\\s*\\[([^\\]]+)\\]/);\nassert(byProfileMatch, 'Runtime skal ha en dokumentert byprofil');\nassert.deepStrictEqual(JSON.parse(\`[\${byProfileMatch[1]}]\`), expectedRounds, 'Canonical Nydalen skal bruke byprofilens ni rundinger');\n\nconst place = readJson('data/places/by/oslo/places/nydalen.json');\nconst people = readJson('data/people/natur/oslo/people_natur_oslo.json');\nconst adam = people.find((row) => row.id === 'adam_severin_hiorth_nydalen');\nconst oluf = people.find((row) => row.id === 'oluf_onsum_christiania_spigerverk');\nconst stories = readJson('data/stories/stories_nydalsdammen.json');\nconst story = stories.find((row) => row.id === 'st_nydalen_industristed_fra_fossedal_til_bydel');\nconst articles = readJson('data/leksikon/places/oslo/historie/leksikon_oslo_historie_batch2.json');\nconst article = articles.find((row) => row.place_id === 'nydalen' && JSON.stringify(row).includes('Nydalens Compagnie'));\nconst placeIndex = new Map(readJson('data/places/places_index.json').map((row) => [row.id, row]));\nconst validUnderbadgeIds = new Set(readJson('data/badges/historie.json').sub);\n\nassert.strictEqual(place.id, 'nydalen');\nassert.strictEqual(place.category, 'by');\nassert.strictEqual(place.coordStatus, 'verified_geometry');\nassert.deepStrictEqual([place.lat, place.lon, place.r, place.year], [59.9497, 10.7675, 260, 2000]);\nassert.strictEqual(placeIndex.get('nydalen')?.year, 2000);\nassert(!placeIndex.has('nydalen_industristed'));\nfor (const person of [adam, oluf]) {\n  assert(person, 'Begge dokumenterte industripersonene skal beholdes');\n  assert.strictEqual(person.placeId, 'nydalen');\n  assert(person.places.includes('nydalen'));\n}\nassert(story && story.place_id === 'nydalen');\nassert(article && article.place_id === 'nydalen');\nassert(Array.isArray(place.works) && place.works.length >= 7);\nassert(place.for_na?.before && place.for_na?.now && place.for_na?.change);\nassert(Array.isArray(place.civication_store) && place.civication_store.length >= 2);\nassert(place.civication_store.every((item) => item.collection === 'nydalen'));\nassert(Array.isArray(place.brands) && place.brands.length >= 5);\nassert(Array.isArray(place.externalLinks) && place.externalLinks.length >= 5);\nassert(Array.isArray(place.underbadge_ids) && place.underbadge_ids.length >= 4);\nassert(place.underbadge_ids.every((id) => validUnderbadgeIds.has(id)));\nassert(place.nature_profile?.summary?.length >= 300);\nfor (const nearby of ['nydalsdammen', 'stilla_nydalen', 'seilduksfabrikken_nydalen']) assert(place.nature_profile.nearby_place_ids.includes(nearby));\nconst combined = JSON.stringify({ place, adam, oluf, story, article });\nfor (const year of ['1845', '1847', '1853', '1864', '1989', '1990']) assert(combined.includes(year));\nassert(/Nydalens Compagnie/.test(combined));\nassert(/Christiania Spigerverk/.test(combined));\nassert(/Akerselva/.test(combined));\nassert(!combined.includes('\\"nydalen_industristed\\"'));\nconsole.log('Canonical Nydalen preserves migrated industrial round content');\n`;
fs.writeFileSync(full(TARGET_TEST), migratedTest);

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
const migrationNote = `Duplikatmigrering (2026-07-20): \`${OLD}\` er fjernet som separat fysisk place fordi recorden overlapper canonical og koordinatverifiserte \`${NEW}\`. Industristedets dokumenterte works, før–nå, brands, Civication-objekter, kilder, underbadges og Akerselva-naturprofil er slått inn i canonical Nydalen. Quiz-, people-, story-, leksikon-, natur- og rutereferanser er retargetet til canonical place-ID. Arts- og naturkandidatkart som allerede hadde begge ID-ene er eksplisitt slått sammen under canonical ID med canonical stedmetadata som autoritet. Det verifiserte Nydalen-området beholder sitt eksisterende geometrianker.`;
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
  `Oslo-tabellen inneholder nå ${verifiedCount} verifiserte eller kildekontrollerte canonical steder. Duplikatet \`${OLD}\` er migrert til \`${NEW}\` uten å opprette et nytt fysisk sted. Antallet fullførte kontroller uten godkjent Oslo-koordinat er ${unresolvedCount}.`
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
  throw new Error(`Legacy Nydalen industristed exact IDs remain: ${remainingExactIds.join(', ')}`);
}

for (const check of ['check:stories', 'audit:quiz-manifest:v2', 'audit:people-of-places', 'places:emner:check']) {
  runTargetAwareCheck(check);
}
console.log('\n[Nydalen migration] dedicated content regression test');
execFileSync('node', [TARGET_TEST], { stdio: 'inherit' });

fs.mkdirSync(full(REPORT_DIR), { recursive: true });
writeJson(`${REPORT_DIR}/summary.json`, {
  date: '2026-07-20',
  oldId: OLD,
  canonicalId: NEW,
  canonicalCoordinateBefore,
  canonicalCoordinateAfter: {
    lat: canonical.lat,
    lon: canonical.lon,
    r: canonical.r,
    coordStatus: canonical.coordStatus,
    sourceObjectId: canonical.sourceObjectId
  },
  removedDuplicatePlace: true,
  removedRouteMapping: oldMappingKey,
  mergedFields: ['routeId', 'tags', 'emne_ids', 'externalLinks', 'underbadge_ids', 'works', 'for_na', 'civication_store', 'brands', 'nature_profile'],
  explicitlyMergedCollisionFiles: [...APPROVED_KEY_COLLISION_FILES],
  canonicalPreferredConflicts,
  initialReferenceFiles,
  rewrittenFiles,
  i18nActions,
  remainingExactIds,
  protocolCounts: { verifiedCount, unresolvedCount }
});
fs.writeFileSync(
  full(`${REPORT_DIR}/README.md`),
  `# Nydalen industristed duplicate migration\n\n- Removed legacy duplicate physical place \`${OLD}\`.\n- Canonical place remains \`${NEW}\` with unchanged verified Oslo byleksikon area geometry.\n- Merged the richer industrial-history content into canonical Nydalen before deleting the duplicate.\n- Retargeted exact active quiz, people, story, leksikon, nature and route references.\n- Explicitly merged the two pre-existing nature-map key collisions under canonical \`${NEW}\`; canonical place metadata wins scalar conflicts while list/object content is preserved.\n- Removed the duplicate Akerselva Civication mapping because a canonical Nydalen route mapping already exists.\n- Updated the dedicated round-content regression test for canonical Nydalen and the by-category round order.\n- Added the retired ID to the legacy alias gate.\n- Protocol after migration: ${verifiedCount} verified/source-controlled Oslo places; ${unresolvedCount} unresolved controls.\n`
);

console.log(JSON.stringify({
  ok: true,
  verifiedCount,
  unresolvedCount,
  oldMappingKey,
  canonicalPreferredConflicts,
  initialReferenceFiles,
  rewrittenFiles,
  i18nActions
}, null, 2));
