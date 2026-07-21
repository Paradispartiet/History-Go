#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const TARGET_CATEGORY = 'scenekunst';
const TARGET_AGGREGATE = 'data/places/scenekunst/oslo/places_scenekunst.json';
const TARGET_MANIFEST = 'data/places/scenekunst/oslo/places_scenekunst_manifest.json';
const TARGET_INDEX = 'data/places/scenekunst/oslo/places_scenekunst_index.json';
const TARGET_CHILD_DIR = 'data/places/scenekunst/oslo/places_scenekunst';
const OVERRIDE_INDEX = 'data/places/category_overrides/index.json';
const OVERRIDE_BATCH = 'data/places/category_overrides/scenekunst_oslo_batch_1.json';
const ROOT_PLACES_MANIFEST = 'data/places/manifest.json';
const REPORT_PATH = 'reports/scenekunst-source-migration-batch-1-2026-07-21.json';
const SUMMARY_PATH = 'reports/scenekunst-category-migration-batch-1-2026-07-21.md';

const GROUPS = [
  {
    aggregate: 'data/places/litteratur/oslo/places_litteratur.json',
    manifest: 'data/places/litteratur/oslo/places_litteratur_manifest.json',
    index: 'data/places/litteratur/oslo/places_litteratur_index.json',
    ids: ['nationaltheatret'],
  },
  {
    aggregate: 'data/places/musikk/oslo/places_musikk.json',
    manifest: 'data/places/musikk/oslo/places_musikk_manifest.json',
    index: 'data/places/musikk/oslo/places_musikk_index.json',
    ids: ['det_norske_teatret'],
  },
  {
    aggregate: 'data/places/popkultur/oslo/places_oslo_populaerkultur.json',
    manifest: 'data/places/popkultur/oslo/places_oslo_populaerkultur_manifest.json',
    index: 'data/places/popkultur/oslo/places_oslo_populaerkultur_index.json',
    ids: ['chat_noir', 'edderkoppen_scene', 'latter', 'folketeateret'],
  },
];

const EXPECTED_IDS = GROUPS.flatMap((group) => group.ids);
const now = new Date().toISOString();

function abs(rel) {
  return path.join(ROOT, rel);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(abs(rel), 'utf8'));
}

function writeJson(rel, data) {
  const file = abs(rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function sha256(rel) {
  return crypto.createHash('sha256').update(fs.readFileSync(abs(rel))).digest('hex');
}

function asPlaces(data, label) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray(data.places)) return data.places;
  if (data && typeof data === 'object' && typeof data.id === 'string') return [data];
  throw new Error(`${label}: unsupported place JSON shape`);
}

function exactOne(rows, id, label) {
  const matches = rows.filter((row) => row && row.id === id);
  if (matches.length !== 1) {
    throw new Error(`${label}: expected exactly one row for ${id}, found ${matches.length}`);
  }
  return matches[0];
}

function childPayloadLike(original, place) {
  if (Array.isArray(original)) return [place];
  if (original && typeof original === 'object' && Array.isArray(original.places)) {
    return { ...original, places: [place] };
  }
  return place;
}

function buildIndexRow(oldRow, place, file) {
  if (oldRow && typeof oldRow === 'object') {
    return { ...oldRow, category: TARGET_CATEGORY, file };
  }
  const row = {
    id: place.id,
    name: place.name,
    category: TARGET_CATEGORY,
  };
  for (const key of ['lat', 'lon', 'r', 'year', 'coordStatus', 'coordType']) {
    if (Object.prototype.hasOwnProperty.call(place, key)) row[key] = place[key];
  }
  row.file = file;
  return row;
}

if (fs.existsSync(abs(TARGET_AGGREGATE)) || fs.existsSync(abs(TARGET_MANIFEST))) {
  throw new Error('Target Scenekunst source dataset already exists; refusing to overwrite it.');
}

const overrideRows = readJson(OVERRIDE_BATCH);
const overrideIds = new Set(asPlaces(overrideRows, OVERRIDE_BATCH).map((row) => row.id));
for (const id of EXPECTED_IDS) {
  if (!overrideIds.has(id)) throw new Error(`${OVERRIDE_BATCH}: missing expected override ${id}`);
}
if (overrideIds.size !== EXPECTED_IDS.length) {
  throw new Error(`${OVERRIDE_BATCH}: contains unexpected rows; refusing partial cleanup`);
}

const moved = [];

for (const group of GROUPS) {
  const aggregateData = readJson(group.aggregate);
  if (!Array.isArray(aggregateData)) throw new Error(`${group.aggregate}: expected array aggregate`);
  const splitManifest = readJson(group.manifest);
  const splitIndex = readJson(group.index);
  if (!Array.isArray(splitManifest.places)) throw new Error(`${group.manifest}: places must be an array`);
  if (!Array.isArray(splitIndex)) throw new Error(`${group.index}: expected array index`);

  const removeSet = new Set(group.ids);

  for (const id of group.ids) {
    const aggregatePlace = exactOne(aggregateData, id, group.aggregate);
    const manifestRow = exactOne(splitManifest.places, id, group.manifest);
    const indexRow = exactOne(splitIndex, id, group.index);
    if (typeof manifestRow.file !== 'string' || !manifestRow.file.trim()) {
      throw new Error(`${group.manifest}: ${id} has no child file`);
    }

    const oldChildRel = path.posix.join(path.posix.dirname(group.manifest), manifestRow.file);
    const oldChildData = readJson(oldChildRel);
    const childPlaces = asPlaces(oldChildData, oldChildRel);
    const childPlace = exactOne(childPlaces, id, oldChildRel);

    if (aggregatePlace.category === TARGET_CATEGORY || childPlace.category === TARGET_CATEGORY) {
      throw new Error(`${id}: already marked as ${TARGET_CATEGORY} in an old source`);
    }

    const canonicalPlace = { ...childPlace, category: TARGET_CATEGORY };
    const newChildFile = `places_scenekunst/${id}.json`;
    const newChildRel = path.posix.join(path.posix.dirname(TARGET_MANIFEST), newChildFile);
    writeJson(newChildRel, childPayloadLike(oldChildData, canonicalPlace));

    moved.push({
      id,
      name: canonicalPlace.name,
      place: canonicalPlace,
      oldAggregate: group.aggregate,
      oldManifest: group.manifest,
      oldIndex: group.index,
      oldChild: oldChildRel,
      oldIndexRow: indexRow,
      newChild: newChildRel,
      newChildFile,
    });
  }

  const newAggregate = aggregateData.filter((place) => !removeSet.has(place.id));
  if (newAggregate.length !== aggregateData.length - group.ids.length) {
    throw new Error(`${group.aggregate}: aggregate removal count mismatch`);
  }
  writeJson(group.aggregate, newAggregate);

  splitManifest.places = splitManifest.places
    .filter((row) => !removeSet.has(row.id))
    .map((row, order) => ({ ...row, order }));
  splitManifest.place_count = splitManifest.places.length;
  splitManifest.generated_at = now;
  splitManifest.source_sha256 = sha256(group.aggregate);
  for (const row of splitManifest.places) {
    const childRel = path.posix.join(path.posix.dirname(group.manifest), row.file);
    row.sha256 = sha256(childRel);
  }
  writeJson(group.manifest, splitManifest);

  writeJson(group.index, splitIndex.filter((row) => !removeSet.has(row.id)));

  for (const item of moved.filter((row) => row.oldManifest === group.manifest)) {
    fs.unlinkSync(abs(item.oldChild));
  }
}

if (moved.length !== EXPECTED_IDS.length) {
  throw new Error(`Expected to move ${EXPECTED_IDS.length} places, moved ${moved.length}`);
}
if (new Set(moved.map((row) => row.id)).size !== EXPECTED_IDS.length) {
  throw new Error('Duplicate IDs detected in migration result');
}

const targetAggregate = moved.map((row) => row.place);
writeJson(TARGET_AGGREGATE, targetAggregate);

const targetManifestRows = moved.map((row, order) => ({
  id: row.id,
  name: row.name,
  category: TARGET_CATEGORY,
  file: row.newChildFile,
  order,
  sha256: sha256(row.newChild),
}));

writeJson(TARGET_MANIFEST, {
  version: 'places_scenekunst_split_v1',
  source_file: path.posix.basename(TARGET_AGGREGATE),
  source_path: TARGET_AGGREGATE,
  source_sha256: sha256(TARGET_AGGREGATE),
  generated_at: now,
  place_count: targetManifestRows.length,
  layout: {
    place_files_dir: 'places_scenekunst/',
    one_file_per_place: true,
    filename_rule: '<place.id>.json',
    manifest_preserves_original_order: true,
    original_aggregate_left_unchanged: false,
  },
  places: targetManifestRows,
});

writeJson(TARGET_INDEX, moved.map((row) => buildIndexRow(
  row.oldIndexRow,
  row.place,
  row.newChildFile,
)));

const rootManifest = readJson(ROOT_PLACES_MANIFEST);
if (!rootManifest || !Array.isArray(rootManifest.files)) {
  throw new Error(`${ROOT_PLACES_MANIFEST}: files must be an array`);
}
const targetManifestEntry = TARGET_AGGREGATE.replace(/^data\//, '');
if (rootManifest.files.includes(targetManifestEntry)) {
  throw new Error(`${ROOT_PLACES_MANIFEST}: target entry already exists`);
}
const insertionIndex = rootManifest.files.findIndex((entry) => String(entry).includes('places/sport/'));
if (insertionIndex >= 0) rootManifest.files.splice(insertionIndex, 0, targetManifestEntry);
else rootManifest.files.push(targetManifestEntry);
writeJson(ROOT_PLACES_MANIFEST, rootManifest);

const overrideIndex = readJson(OVERRIDE_INDEX);
if (!overrideIndex || !Array.isArray(overrideIndex.files)) {
  throw new Error(`${OVERRIDE_INDEX}: files must be an array`);
}
const overrideFilename = path.posix.basename(OVERRIDE_BATCH);
if (!overrideIndex.files.includes(overrideFilename)) {
  throw new Error(`${OVERRIDE_INDEX}: ${overrideFilename} is not registered`);
}
overrideIndex.files = overrideIndex.files.filter((file) => file !== overrideFilename);
writeJson(OVERRIDE_INDEX, overrideIndex);
fs.unlinkSync(abs(OVERRIDE_BATCH));

writeJson(REPORT_PATH, {
  generatedAt: now,
  status: 'source_migration_applied',
  category: TARGET_CATEGORY,
  movedPlaceIds: moved.map((row) => row.id),
  newAggregate: TARGET_AGGREGATE,
  newSplitManifest: TARGET_MANIFEST,
  newSplitIndex: TARGET_INDEX,
  oldSources: GROUPS.map((group) => ({
    aggregate: group.aggregate,
    splitManifest: group.manifest,
    splitIndex: group.index,
    movedIds: group.ids,
  })),
  removedOverrideBatch: OVERRIDE_BATCH,
  validation: {
    placesIndexBuild: 'run_by_workflow_after_migration',
    placesChecks: 'run_by_workflow_after_migration',
    categoryAudit: 'run_by_workflow_after_migration',
  },
});

const summaryAppendix = `\n\n## Kildemigrering fullført\n\nBatchen er flyttet fra midlertidig category override til kanoniske kildefiler under \`data/places/scenekunst/oslo/\`. De gamle radene og split-filene er fjernet fra Litteratur, Musikk og Populærkultur, override-batchen er slettet, og \`places_index.json\` regenereres av migreringsjobben.\n`;
if (fs.existsSync(abs(SUMMARY_PATH))) {
  const current = fs.readFileSync(abs(SUMMARY_PATH), 'utf8');
  if (!current.includes('## Kildemigrering fullført')) {
    fs.writeFileSync(abs(SUMMARY_PATH), `${current.trimEnd()}${summaryAppendix}`, 'utf8');
  }
}

console.log(`Moved ${moved.length} places to ${TARGET_AGGREGATE}:`);
for (const row of moved) console.log(`- ${row.id}: ${row.oldChild} -> ${row.newChild}`);
