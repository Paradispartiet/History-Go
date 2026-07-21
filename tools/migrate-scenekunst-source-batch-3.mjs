#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = process.cwd();
const TARGET_CATEGORY = 'scenekunst';
const NOW = new Date().toISOString();
const ROOT_MANIFEST = 'data/places/manifest.json';
const REPORT_JSON = 'reports/scenekunst-source-migration-batch-3-2026-07-21.json';
const DECISIONS_JSON = 'reports/scenekunst-nationwide-decisions-2026-07-21.json';
const DECISIONS_MD = 'reports/scenekunst-nationwide-decisions-2026-07-21.md';

const OSLO_TARGET = {
  aggregate: 'data/places/scenekunst/oslo/places_scenekunst.json',
  manifest: 'data/places/scenekunst/oslo/places_scenekunst_manifest.json',
  index: 'data/places/scenekunst/oslo/places_scenekunst_index.json',
  childDir: 'data/places/scenekunst/oslo/places_scenekunst',
  childPrefix: 'places_scenekunst/',
};

const LISBON_TARGET = {
  aggregate: 'data/places/scenekunst/europe/portugal/lisbon/places_lisbon_scenekunst.json',
  manifest: 'data/places/scenekunst/europe/portugal/lisbon/places_lisbon_scenekunst_manifest.json',
  index: 'data/places/scenekunst/europe/portugal/lisbon/places_lisbon_scenekunst_index.json',
  childDir: 'data/places/scenekunst/europe/portugal/lisbon/places_lisbon_scenekunst',
  childPrefix: 'places_lisbon_scenekunst/',
};

const SPLIT_GROUPS = [
  {
    aggregate: 'data/places/by/oslo/places_by.json',
    manifest: 'data/places/by/oslo/places_by_manifest.json',
    index: 'data/places/by/oslo/places_by_index.json',
    ids: ['operahuset'],
    target: OSLO_TARGET,
  },
  {
    aggregate: 'data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst.json',
    manifest: 'data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst_manifest.json',
    index: 'data/places/kunst/europe/portugal/lisbon/places_lisbon_kunst_index.json',
    ids: ['lisbon_teatro_nacional_d_maria_ii', 'lisbon_teatro_sao_luiz'],
    target: LISBON_TARGET,
  },
  {
    aggregate: 'data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json',
    manifest: 'data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk_manifest.json',
    index: 'data/places/musikk/europe/portugal/lisbon/places_lisbon_musikk_index.json',
    ids: ['lisbon_teatro_tivoli_bbva'],
    target: LISBON_TARGET,
  },
];

const STANDALONE_MOVES = [
  {
    id: 'kilden_teater_konserthus_kristiansand',
    oldPath: 'data/places/kunst/agder/kilden_teater_konserthus_kristiansand.json',
    newPath: 'data/places/scenekunst/agder/kilden_teater_konserthus_kristiansand.json',
    sourceUrl: 'https://kilden.com/dette-er-kilden/',
    rationale: 'Kilden samler profesjonelt teater, opera og øvrig scenekunst i én produserende institusjon; musikk og byutvikling beholdes som innholdslag.',
  },
  {
    id: 'fredrikshalds_teater',
    oldPath: 'data/places/kunst/ostfold/fredrikshalds_teater.json',
    newPath: 'data/places/scenekunst/ostfold/fredrikshalds_teater.json',
    sourceUrl: 'https://ostfoldmuseene.no/fredrikshald/om',
    rationale: 'Fredrikshalds Teater fungerer både som museum og levende teaterbygning med forestillinger; teater er den primære stedstypen.',
  },
];

const MOVE_DECISIONS = {
  operahuset: {
    sourceUrl: 'https://www.operaen.no/om-oss/',
    rationale: 'Operahuset er hovedarena for Den Norske Opera & Ballett, landets største musikk- og scenekunstinstitusjon; arkitektur og byrom beholdes som lag.',
  },
  kilden_teater_konserthus_kristiansand: STANDALONE_MOVES[0],
  fredrikshalds_teater: STANDALONE_MOVES[1],
  lisbon_teatro_nacional_d_maria_ii: {
    sourceUrl: 'https://www.tndm.pt/pt/sobre-nos/',
    rationale: 'Nasjonalteaterets uttrykte samfunnsoppdrag er å produsere og presentere teater.',
  },
  lisbon_teatro_sao_luiz: {
    sourceUrl: 'https://www.teatrosaoluiz.pt/missao/',
    rationale: 'São Luiz er et kommunalt teater med tre scener og et bredt scenekunstprogram.',
  },
  lisbon_teatro_tivoli_bbva: {
    sourceUrl: 'https://www.teatrotivolibbva.pt/',
    rationale: 'Tivoli er et aktivt teater for dramatikk, dans, standup og musikk; teateridentiteten er den primære stedstypen.',
  },
};

const RETAIN_DECISIONS = {
  ibsen_museum_teater: 'Beholdes i litteratur: primærfunksjonen er litteraturmuseum og Ibsen-formidling.',
  lisbon_teatro_romano: 'Beholdes i historie: stedet er et arkeologisk ruin- og museumssted, ikke en aktiv scene.',
  sentrum_scene: 'Beholdes i musikk: primærfunksjonen er konsertarena.',
  sub_scene: 'Beholdes i subkultur: primærfunksjonen er rusfri konsert- og ungdomskulturscene.',
  vaterland_bar_scene: 'Beholdes i subkultur: primærfunksjonen er bar og undergrunnskonsertscene.',
  arendal_kulturhus: 'Beholdes i kunst: bredt kulturhus uten entydig teater som primærfunksjon.',
  lisbon_coliseu_dos_recreios: 'Beholdes i musikk: primærfunksjonen i datasettet er konsert- og forestillingsarena med musikktyngde.',
  lisbon_culturgest: 'Beholdes i kunst: tverrfaglig kunst- og kultursenter.',
};

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
  if (matches.length !== 1) throw new Error(`${label}: expected exactly one ${id}, found ${matches.length}`);
  return matches[0];
}

function payloadLike(original, places) {
  if (Array.isArray(original)) return places;
  if (original && typeof original === 'object' && Array.isArray(original.places)) {
    return { ...original, places };
  }
  if (places.length !== 1) throw new Error('Object payload can only contain one place');
  return places[0];
}

function childPayloadLike(original, place) {
  if (Array.isArray(original)) return [place];
  if (original && typeof original === 'object' && Array.isArray(original.places)) {
    return { ...original, places: [place] };
  }
  return place;
}

function buildIndexRow(oldRow, place, file) {
  if (oldRow && typeof oldRow === 'object') return { ...oldRow, category: TARGET_CATEGORY, file };
  const row = { id: place.id, name: place.name, category: TARGET_CATEGORY };
  for (const key of ['lat', 'lon', 'r', 'year', 'coordStatus', 'coordType']) {
    if (Object.prototype.hasOwnProperty.call(place, key)) row[key] = place[key];
  }
  row.file = file;
  return row;
}

function refreshSplitSource(group, removeSet) {
  const aggregateOriginal = readJson(group.aggregate);
  const aggregateRows = asPlaces(aggregateOriginal, group.aggregate);
  const manifest = readJson(group.manifest);
  const index = readJson(group.index);
  if (!Array.isArray(manifest.places)) throw new Error(`${group.manifest}: places must be array`);
  if (!Array.isArray(index)) throw new Error(`${group.index}: index must be array`);

  const moved = [];
  for (const id of group.ids) {
    const aggregatePlace = exactOne(aggregateRows, id, group.aggregate);
    const manifestRow = exactOne(manifest.places, id, group.manifest);
    const indexRow = exactOne(index, id, group.index);
    const oldChild = path.posix.join(path.posix.dirname(group.manifest), manifestRow.file);
    const childOriginal = readJson(oldChild);
    const childPlace = exactOne(asPlaces(childOriginal, oldChild), id, oldChild);
    if (aggregatePlace.category === TARGET_CATEGORY || childPlace.category === TARGET_CATEGORY) {
      throw new Error(`${id}: already ${TARGET_CATEGORY} in source`);
    }
    moved.push({
      id,
      place: { ...childPlace, category: TARGET_CATEGORY },
      childOriginal,
      oldChild,
      oldIndexRow: indexRow,
      target: group.target,
      sourceAggregate: group.aggregate,
    });
  }

  const nextAggregateRows = aggregateRows.filter((row) => !removeSet.has(row.id));
  if (nextAggregateRows.length !== aggregateRows.length - removeSet.size) {
    throw new Error(`${group.aggregate}: removal count mismatch`);
  }
  writeJson(group.aggregate, payloadLike(aggregateOriginal, nextAggregateRows));

  manifest.places = manifest.places
    .filter((row) => !removeSet.has(row.id))
    .map((row, order) => ({ ...row, order }));
  manifest.place_count = manifest.places.length;
  manifest.generated_at = NOW;
  manifest.source_sha256 = sha256(group.aggregate);
  for (const row of manifest.places) {
    const childRel = path.posix.join(path.posix.dirname(group.manifest), row.file);
    row.sha256 = sha256(childRel);
  }
  writeJson(group.manifest, manifest);
  writeJson(group.index, index.filter((row) => !removeSet.has(row.id)));

  return moved;
}

function appendExistingTarget(target, items) {
  const aggregate = readJson(target.aggregate);
  const manifest = readJson(target.manifest);
  const index = readJson(target.index);
  if (!Array.isArray(aggregate) || !Array.isArray(manifest.places) || !Array.isArray(index)) {
    throw new Error(`${target.aggregate}: target split files have invalid shape`);
  }
  const existingIds = new Set(aggregate.map((row) => row.id));
  for (const item of items) {
    if (existingIds.has(item.id)) throw new Error(`${item.id}: already present in target aggregate`);
    const childFile = `${target.childPrefix}${item.id}.json`;
    const childRel = path.posix.join(path.posix.dirname(target.manifest), childFile);
    writeJson(childRel, childPayloadLike(item.childOriginal, item.place));
    aggregate.push(item.place);
    manifest.places.push({
      id: item.id,
      name: item.place.name,
      category: TARGET_CATEGORY,
      file: childFile,
      order: manifest.places.length,
      sha256: sha256(childRel),
    });
    index.push(buildIndexRow(item.oldIndexRow, item.place, childFile));
  }
  writeJson(target.aggregate, aggregate);
  manifest.place_count = manifest.places.length;
  manifest.generated_at = NOW;
  manifest.source_sha256 = sha256(target.aggregate);
  for (const row of manifest.places) {
    const childRel = path.posix.join(path.posix.dirname(target.manifest), row.file);
    row.sha256 = sha256(childRel);
  }
  writeJson(target.manifest, manifest);
  writeJson(target.index, index);
}

function createNewTarget(target, items) {
  for (const rel of [target.aggregate, target.manifest, target.index]) {
    if (fs.existsSync(abs(rel))) throw new Error(`${rel}: target already exists`);
  }
  const aggregate = [];
  const manifestRows = [];
  const indexRows = [];
  items.forEach((item, order) => {
    const childFile = `${target.childPrefix}${item.id}.json`;
    const childRel = path.posix.join(path.posix.dirname(target.manifest), childFile);
    writeJson(childRel, childPayloadLike(item.childOriginal, item.place));
    aggregate.push(item.place);
    manifestRows.push({
      id: item.id,
      name: item.place.name,
      category: TARGET_CATEGORY,
      file: childFile,
      order,
      sha256: sha256(childRel),
    });
    indexRows.push(buildIndexRow(item.oldIndexRow, item.place, childFile));
  });
  writeJson(target.aggregate, aggregate);
  writeJson(target.manifest, {
    version: 'places_lisbon_scenekunst_split_v1',
    source_file: path.posix.basename(target.aggregate),
    source_path: target.aggregate,
    source_sha256: sha256(target.aggregate),
    generated_at: NOW,
    place_count: manifestRows.length,
    layout: {
      place_files_dir: path.posix.basename(target.childDir) + '/',
      one_file_per_place: true,
      filename_rule: '<place.id>.json',
      manifest_preserves_original_order: true,
      original_aggregate_left_unchanged: false,
    },
    places: manifestRows,
  });
  writeJson(target.index, indexRows);
}

const allMoved = [];
for (const group of SPLIT_GROUPS) {
  const removeSet = new Set(group.ids);
  const moved = refreshSplitSource(group, removeSet);
  allMoved.push(...moved);
}

const osloItems = allMoved.filter((item) => item.target === OSLO_TARGET);
const lisbonItems = allMoved.filter((item) => item.target === LISBON_TARGET);
if (osloItems.length !== 1) throw new Error(`Expected 1 Oslo item, found ${osloItems.length}`);
if (lisbonItems.length !== 3) throw new Error(`Expected 3 Lisbon items, found ${lisbonItems.length}`);
appendExistingTarget(OSLO_TARGET, osloItems);
createNewTarget(LISBON_TARGET, lisbonItems);

for (const item of allMoved) {
  if (!fs.existsSync(abs(item.oldChild))) throw new Error(`${item.oldChild}: missing before deletion`);
  fs.unlinkSync(abs(item.oldChild));
}

const standaloneResults = [];
for (const move of STANDALONE_MOVES) {
  if (fs.existsSync(abs(move.newPath))) throw new Error(`${move.newPath}: target already exists`);
  const original = readJson(move.oldPath);
  const rows = asPlaces(original, move.oldPath);
  const place = exactOne(rows, move.id, move.oldPath);
  if (rows.length !== 1) throw new Error(`${move.oldPath}: expected exactly one place`);
  const canonical = { ...place, category: TARGET_CATEGORY };
  writeJson(move.newPath, payloadLike(original, [canonical]));
  fs.unlinkSync(abs(move.oldPath));
  standaloneResults.push({ ...move, place: canonical });
}

const rootManifest = readJson(ROOT_MANIFEST);
if (!rootManifest || !Array.isArray(rootManifest.files)) throw new Error(`${ROOT_MANIFEST}: files must be array`);

for (const move of STANDALONE_MOVES) {
  const oldEntry = move.oldPath.replace(/^data\//, '');
  const newEntry = move.newPath.replace(/^data\//, '');
  const positions = rootManifest.files
    .map((entry, index) => entry === oldEntry ? index : -1)
    .filter((index) => index >= 0);
  if (positions.length !== 1) throw new Error(`${ROOT_MANIFEST}: expected one ${oldEntry}, found ${positions.length}`);
  if (rootManifest.files.includes(newEntry)) throw new Error(`${ROOT_MANIFEST}: ${newEntry} already exists`);
  rootManifest.files[positions[0]] = newEntry;
}

const lisbonEntry = LISBON_TARGET.aggregate.replace(/^data\//, '');
if (rootManifest.files.includes(lisbonEntry)) throw new Error(`${ROOT_MANIFEST}: ${lisbonEntry} already exists`);
const lisbonAnchor = 'places/musikk/europe/portugal/lisbon/places_lisbon_musikk.json';
const anchorIndex = rootManifest.files.indexOf(lisbonAnchor);
if (anchorIndex < 0) throw new Error(`${ROOT_MANIFEST}: Lisbon anchor missing`);
rootManifest.files.splice(anchorIndex + 1, 0, lisbonEntry);
writeJson(ROOT_MANIFEST, rootManifest);

const movedIds = [...allMoved.map((item) => item.id), ...standaloneResults.map((item) => item.id)];
const expectedIds = Object.keys(MOVE_DECISIONS);
if (movedIds.length !== expectedIds.length || new Set(movedIds).size !== expectedIds.length) {
  throw new Error(`Move count mismatch: moved ${movedIds.length}, expected ${expectedIds.length}`);
}
for (const id of expectedIds) if (!movedIds.includes(id)) throw new Error(`Missing moved ID ${id}`);

const decisionRows = [
  ...movedIds.map((id) => ({
    id,
    decision: 'move_to_scenekunst',
    category: TARGET_CATEGORY,
    sourceUrl: MOVE_DECISIONS[id].sourceUrl,
    rationale: MOVE_DECISIONS[id].rationale,
  })),
  ...Object.entries(RETAIN_DECISIONS).map(([id, rationale]) => ({
    id,
    decision: 'retain_current_category',
    rationale,
  })),
];

writeJson(DECISIONS_JSON, {
  generatedAt: NOW,
  scope: 'nationwide active-place theatre and performing-arts classification',
  movedCount: movedIds.length,
  retainedCount: Object.keys(RETAIN_DECISIONS).length,
  decisions: decisionRows,
});

const md = [
  '# Scenekunst – landsdekkende beslutninger',
  '',
  `Generert: ${NOW}`,
  '',
  `- Flyttes til Scenekunst: ${movedIds.length}`,
  `- Beholdes i nåværende kategori: ${Object.keys(RETAIN_DECISIONS).length}`,
  '',
  '## Flyttes',
  '',
  ...movedIds.flatMap((id) => [
    `### \`${id}\``,
    '',
    `- Beslutning: \`move_to_scenekunst\``,
    `- Begrunnelse: ${MOVE_DECISIONS[id].rationale}`,
    `- Offisiell kilde: ${MOVE_DECISIONS[id].sourceUrl}`,
    '',
  ]),
  '## Beholdes',
  '',
  ...Object.entries(RETAIN_DECISIONS).flatMap(([id, rationale]) => [
    `- \`${id}\`: ${rationale}`,
  ]),
  '',
];
fs.writeFileSync(abs(DECISIONS_MD), md.join('\n'), 'utf8');

writeJson(REPORT_JSON, {
  generatedAt: NOW,
  status: 'source_migration_applied',
  category: TARGET_CATEGORY,
  movedPlaceIds: movedIds,
  targets: {
    oslo: OSLO_TARGET.aggregate,
    lisbon: LISBON_TARGET.aggregate,
    agder: STANDALONE_MOVES[0].newPath,
    ostfold: STANDALONE_MOVES[1].newPath,
  },
  sourceGroups: SPLIT_GROUPS.map((group) => ({
    aggregate: group.aggregate,
    manifest: group.manifest,
    index: group.index,
    ids: group.ids,
  })),
  standaloneMoves: STANDALONE_MOVES.map(({ id, oldPath, newPath }) => ({ id, oldPath, newPath })),
  validation: {
    placesIndexBuild: 'run_by_workflow_after_migration',
    placesChecks: 'run_by_workflow_after_migration',
    categoryAudit: 'run_by_workflow_after_migration',
  },
});

console.log(`Moved ${movedIds.length} places to ${TARGET_CATEGORY}:`);
for (const id of movedIds) console.log(`- ${id}`);
