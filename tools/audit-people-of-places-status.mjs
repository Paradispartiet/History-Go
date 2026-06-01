import fs from 'fs';
import path from 'path';
import { buildActivePlaceIdSet, manifestFilesToPaths, readJson, toArray } from './lib/placeRefAuditUtils.mjs';

const root = process.cwd();
const peopleManifestPath = path.join(root, 'data/people/manifest.json');
const placesManifestPath = path.join(root, 'data/places/manifest.json');
const placesIndexPath = path.join(root, 'data/places/places_index.json');
const reportJsonPath = path.join(root, 'reports/people-of-places-status.json');
const reportMdPath = path.join(root, 'reports/people-of-places-status.md');

const repoPath = (filePath) => path.relative(root, filePath).replace(/\\/g, '/');
const md = (value) => String(value ?? '').replace(/\|/g, '\\|');
const uniqueSorted = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), 'nb'));
const canonicalCategory = (value) => value === 'popkultur' ? 'populaerkultur' : value;

function normalizeManifestEntry(entry) {
  const raw = String(entry || '').trim().replace(/^\.?\//, '');
  if (!raw) return null;
  return raw.startsWith('data/') ? raw : `data/${raw}`;
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function fileCategoryGuess(sourceFile) {
  const parts = sourceFile.split('/');
  if (parts.length >= 4 && parts[0] === 'data' && parts[1] === 'people' && !parts[2].startsWith('people_')) {
    return canonicalCategory(parts[2]);
  }
  const base = path.basename(sourceFile, '.json');
  if (base.startsWith('people_')) return canonicalCategory(base.slice('people_'.length));
  return null;
}

function isGeographicPeopleFile(sourceFile) {
  const parts = sourceFile.split('/');
  return parts.length > 4 && parts[0] === 'data' && parts[1] === 'people';
}

function schemaKind(sourceFile, people) {
  if (sourceFile.endsWith('people_naeringsliv.json')) return 'source_place_id_schema';
  if (sourceFile.endsWith('people_filantroper.json')) return 'collectionGroup_filantroper_schema';
  const sourcePlaceCount = people.filter((person) => person && Object.prototype.hasOwnProperty.call(person, 'source_place_id')).length;
  const placeIdCount = people.filter((person) => person && Object.prototype.hasOwnProperty.call(person, 'placeId')).length;
  const mediaCount = people.filter((person) => person?.media && typeof person.media === 'object').length;
  if (sourcePlaceCount > 0 && placeIdCount === 0) return 'source_place_id_schema';
  if (mediaCount > 0 && placeIdCount === 0) return 'media_metadata_schema';
  return 'standard_placeId_schema';
}

function inferCategory(person, fallback) {
  if (person?.collectionGroup === 'filantroper') return 'filantroper';
  if (typeof person?.category === 'string' && person.category.trim()) return canonicalCategory(person.category.trim());
  return canonicalCategory(fallback) || 'unknown';
}

function collectPlaceRefs(person) {
  const refs = [];
  if (typeof person?.placeId === 'string' && person.placeId.trim()) refs.push({ field: 'placeId', placeId: person.placeId.trim() });
  if (typeof person?.place_id === 'string' && person.place_id.trim()) refs.push({ field: 'place_id', placeId: person.place_id.trim() });
  if (typeof person?.place === 'string' && person.place.trim()) refs.push({ field: 'place', placeId: person.place.trim() });
  if (typeof person?.source_place_id === 'string' && person.source_place_id.trim()) refs.push({ field: 'source_place_id', placeId: person.source_place_id.trim() });
  for (const [i, placeId] of (Array.isArray(person?.places) ? person.places : []).entries()) {
    if (typeof placeId === 'string' && placeId.trim()) refs.push({ field: `places[${i}]`, placeId: placeId.trim() });
  }
  for (const [i, placeId] of (Array.isArray(person?.placeIds) ? person.placeIds : []).entries()) {
    if (typeof placeId === 'string' && placeId.trim()) refs.push({ field: `placeIds[${i}]`, placeId: placeId.trim() });
  }
  for (const [i, placeId] of (Array.isArray(person?.place_ids) ? person.place_ids : []).entries()) {
    if (typeof placeId === 'string' && placeId.trim()) refs.push({ field: `place_ids[${i}]`, placeId: placeId.trim() });
  }
  return refs;
}

function primaryAnchor(person) {
  return String(person?.placeId || person?.source_place_id || person?.place_id || person?.place || '').trim();
}

function imageFields(person) {
  const fields = [];
  for (const field of ['image', 'cardImage']) {
    if (typeof person?.[field] === 'string' && person[field].trim()) fields.push({ field, imagePath: person[field].trim() });
  }
  if (typeof person?.media?.image === 'string' && person.media.image.trim()) fields.push({ field: 'media.image', imagePath: person.media.image.trim() });
  if (typeof person?.media?.imageCard === 'string' && person.media.imageCard.trim()) fields.push({ field: 'media.imageCard', imagePath: person.media.imageCard.trim() });
  return fields;
}

function imageExists(imagePath) {
  const candidates = [path.join(root, imagePath), path.join(root, 'public', imagePath), path.join(root, 'src', imagePath)];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

function schemaNotesForFile(sourceFile, people, categoryGuess, kind) {
  const notes = [];
  const withPlaceId = people.filter((p) => Object.prototype.hasOwnProperty.call(p || {}, 'placeId')).length;
  const withSourcePlaceId = people.filter((p) => Object.prototype.hasOwnProperty.call(p || {}, 'source_place_id')).length;
  const withPlacesArray = people.filter((p) => Array.isArray(p?.places)).length;
  const withCollectionGroup = people.filter((p) => typeof p?.collectionGroup === 'string' && p.collectionGroup.trim()).length;
  const categoryValues = uniqueSorted(people.map((p) => p?.category));

  notes.push(`schemaKind=${kind}`);
  notes.push(`placeId=${withPlaceId}/${people.length}`);
  notes.push(`source_place_id=${withSourcePlaceId}/${people.length}`);
  notes.push(`placesArray=${withPlacesArray}/${people.length}`);
  if (withCollectionGroup) notes.push(`collectionGroup=${withCollectionGroup}/${people.length}`);
  if (categoryValues.length) notes.push(`categories=${categoryValues.join(',')}`);

  if (sourceFile.endsWith('people_naeringsliv.json')) {
    if (withSourcePlaceId === people.length && withPlaceId === 0) notes.push('ok: særskilt næringsliv-schema med source_place_id');
    else notes.push('schema_review: næringsliv blander source_place_id/placeId-mønstre');
  } else if (sourceFile.endsWith('people_filantroper.json')) {
    const wrongGroup = people.filter((p) => p?.collectionGroup !== 'filantroper').length;
    if (wrongGroup === 0) notes.push('ok: filantroper vurderes etter collectionGroup, ikke category');
    else notes.push(`schema_review: ${wrongGroup} mangler collectionGroup=filantroper`);
  } else if (withSourcePlaceId > 0) {
    notes.push('schema_review: source_place_id brukes utenfor særskilt næringsliv-schema');
  }

  const categoryMismatches = people.filter((p) => {
    if (!p?.category || !categoryGuess) return false;
    if (sourceFile.endsWith('people_filantroper.json') && p.collectionGroup === 'filantroper') return false;
    return canonicalCategory(p.category) !== canonicalCategory(categoryGuess);
  }).length;
  if (categoryMismatches > 0) notes.push(`category_mismatch=${categoryMismatches}`);
  return notes;
}

function suggestedInvalidAction(invalidPlaceId) {
  if (!invalidPlaceId) return 'hold_for_manual_review';
  return 'create_place_later';
}

const generatedAt = new Date().toISOString();
const peopleManifest = readJson(peopleManifestPath);
const manifestFiles = uniqueSorted((peopleManifest.files || []).map(normalizeManifestEntry));
const manifestSet = new Set(manifestFiles);
const placeIds = buildActivePlaceIdSet(root, placesManifestPath);
let placesIndexIds = new Set();
if (fs.existsSync(placesIndexPath)) {
  const indexData = readJson(placesIndexPath);
  const indexRows = Array.isArray(indexData) ? indexData : Object.values(indexData || {});
  placesIndexIds = new Set(indexRows.map((row) => typeof row === 'string' ? row : row?.id).filter(Boolean));
}
const validPlaceIds = new Set([...placeIds, ...placesIndexIds]);

const peopleFiles = manifestFiles.map((rel) => path.join(root, rel));
const fileReports = [];
const categoryMap = new Map();
const allPeople = [];
const invalidPlaceRefs = [];
const peopleWithoutStrongAnchor = [];
const emptyPlacesEntries = [];
const weakPlacesEntries = [];
const categorySchemaMismatches = [];
const missingImages = [];
const schemaStatus = [];
const idOccurrences = new Map();
const missingBlockerRefs = new Map();

for (const filePath of peopleFiles) {
  const sourceFile = repoPath(filePath);
  const listedInManifest = manifestSet.has(sourceFile);
  const categoryGuess = fileCategoryGuess(sourceFile);
  const geographicStructure = isGeographicPeopleFile(sourceFile);
  const people = toArray(readJson(filePath));
  const kind = schemaKind(sourceFile, people);
  const idsInFile = new Map();

  let missingIdCount = 0;
  let missingNameCount = 0;
  let missingCategoryCount = 0;
  let missingPrimaryAnchorCount = 0;
  let invalidPlaceRefCount = 0;

  for (const person of people) {
    const personId = person?.id || null;
    const personName = person?.name || null;
    const category = inferCategory(person, categoryGuess);
    const anchor = primaryAnchor(person);
    const refs = collectPlaceRefs(person);
    const validRefs = refs.filter((ref) => validPlaceIds.has(ref.placeId));
    const hasValidPrimaryAnchor = !!anchor && validPlaceIds.has(anchor);
    const placesArray = Array.isArray(person?.places) ? person.places : [];

    allPeople.push({ sourceFile, personId, personName, category, anchor });
    if (!personId) missingIdCount += 1;
    else {
      if (!idOccurrences.has(personId)) idOccurrences.set(personId, []);
      idOccurrences.get(personId).push({ sourceFile, personName });
      if (!idsInFile.has(personId)) idsInFile.set(personId, []);
      idsInFile.get(personId).push(personName);
    }
    if (!personName) missingNameCount += 1;
    if (!person?.category && person?.collectionGroup !== 'filantroper') missingCategoryCount += 1;
    if (!hasValidPrimaryAnchor) {
      missingPrimaryAnchorCount += 1;
      peopleWithoutStrongAnchor.push({ sourceFile, personId, personName, reason: anchor ? 'primary_anchor_invalid' : 'primary_anchor_missing', primaryAnchor: anchor || null, validRefs: validRefs.map((ref) => ref.placeId) });
    }
    if (Array.isArray(person?.places) && person.places.length === 0) {
      emptyPlacesEntries.push({ sourceFile, personId, personName, reason: 'empty_places_array' });
    }
    if (!Array.isArray(person?.places) || person.places.length === 0 || (anchor && !placesArray.includes(anchor) && kind !== 'source_place_id_schema')) {
      weakPlacesEntries.push({
        sourceFile,
        personId,
        personName,
        placeId: person?.placeId || null,
        source_place_id: person?.source_place_id || null,
        places: Array.isArray(person?.places) ? person.places : null,
        reason: !Array.isArray(person?.places) ? 'missing_places_array' : person.places.length === 0 ? 'empty_places_array' : 'places_array_does_not_include_primary_anchor',
      });
    }

    for (const ref of refs) {
      if (validPlaceIds.has(ref.placeId)) continue;
      invalidPlaceRefCount += 1;
      const row = { sourceFile, personId, personName, field: ref.field, invalidPlaceId: ref.placeId, suggestedAction: suggestedInvalidAction(ref.placeId) };
      invalidPlaceRefs.push(row);
      if (!missingBlockerRefs.has(ref.placeId)) missingBlockerRefs.set(ref.placeId, { placeId: ref.placeId, occurrences: 0, people: [] });
      const blocker = missingBlockerRefs.get(ref.placeId);
      blocker.occurrences += 1;
      blocker.people.push({ sourceFile, personId, personName, field: ref.field });
    }

    if (person?.category && categoryGuess && canonicalCategory(person.category) !== canonicalCategory(categoryGuess)) {
      if (!(sourceFile.endsWith('people_filantroper.json') && person.collectionGroup === 'filantroper')) {
        categorySchemaMismatches.push({ sourceFile, personId, personName, category: person.category, expected: categoryGuess, reason: 'category_does_not_match_file_category' });
      }
    }

    for (const image of imageFields(person)) {
      if (!imageExists(image.imagePath)) missingImages.push({ sourceFile, personId, personName, ...image });
    }

    if (!categoryMap.has(category)) categoryMap.set(category, { category, totalPeople: 0, files: new Set(), flatFiles: new Set(), geographicFiles: new Set(), validPrimaryAnchors: 0, sourcePlaceSchemaFiles: new Set() });
    const c = categoryMap.get(category);
    c.totalPeople += 1;
    c.files.add(sourceFile);
    if (geographicStructure) c.geographicFiles.add(sourceFile); else c.flatFiles.add(sourceFile);
    if (hasValidPrimaryAnchor) c.validPrimaryAnchors += 1;
    if (kind === 'source_place_id_schema') c.sourcePlaceSchemaFiles.add(sourceFile);
  }

  const duplicateIdsWithinFile = [...idsInFile.entries()].filter(([, rows]) => rows.length > 1).map(([id]) => id);
  const schemaNotes = schemaNotesForFile(sourceFile, people, categoryGuess, kind);
  fileReports.push({
    path: sourceFile,
    listedInManifest,
    categoryGuess,
    geographicStructure,
    peopleCount: people.length,
    duplicateIdsWithinFile,
    missingIdCount,
    missingNameCount,
    missingCategoryCount,
    missingPrimaryAnchorCount,
    invalidPlaceRefCount,
    schemaKind: kind,
    schemaNotes,
  });
  schemaStatus.push({ sourceFile, schemaKind: kind, schemaNotes, deviations: schemaNotes.filter((note) => note.startsWith('schema_review') || note.startsWith('category_mismatch')) });
}

const duplicatePeopleIds = [...idOccurrences.entries()]
  .filter(([, entries]) => entries.length > 1)
  .map(([id, entries]) => ({ id, entries }))
  .sort((a, b) => a.id.localeCompare(b.id, 'nb'));

const categories = [...categoryMap.values()].map((row) => {
  let suggestedNextAction = 'leave_as_is';
  let reason = 'Kategorien er allerede geografisk strukturert eller trenger ingen egen oppfølgingsbatch basert på denne auditten.';
  if (row.sourcePlaceSchemaFiles.size > 0) {
    suggestedNextAction = 'schema_review';
    reason = 'Kategorien bruker særskilt source_place_id-schema og bør vurderes før geografisk split.';
  } else if (row.flatFiles.size > 0 && row.totalPeople >= 10 && row.validPrimaryAnchors === row.totalPeople) {
    suggestedNextAction = 'geographic_split';
    reason = 'Kategorien er flat, har mange entries og alle entries har gyldig hovedanker.';
  } else if (row.flatFiles.size > 0 && row.totalPeople < 10 && row.validPrimaryAnchors === row.totalPeople) {
    suggestedNextAction = 'expand_content';
    reason = 'Kategorien er liten og ren; mer innhold bør komme før eventuell split.';
  } else if (row.validPrimaryAnchors < row.totalPeople) {
    suggestedNextAction = 'schema_review';
    reason = 'Noen entries mangler gyldig hovedanker og bør vurderes før neste innholdsrunde.';
  }
  return {
    category: row.category,
    totalPeople: row.totalPeople,
    files: uniqueSorted([...row.files]),
    flatFiles: uniqueSorted([...row.flatFiles]),
    geographicFiles: uniqueSorted([...row.geographicFiles]),
    suggestedNextAction,
    reason,
  };
}).sort((a, b) => a.category.localeCompare(b.category, 'nb'));

const flatPeopleFiles = fileReports.filter((row) => !row.geographicStructure).map((row) => row.path);
const geographicPeopleFiles = fileReports.filter((row) => row.geographicStructure).map((row) => row.path);
const mixedCategoryStructure = categories.filter((row) => row.flatFiles.length > 0 && row.geographicFiles.length > 0).map((row) => row.category);
const safeFlatFilesForGeographicSplit = fileReports
  .filter((row) => !row.geographicStructure && row.peopleCount >= 10 && row.invalidPlaceRefCount === 0 && row.missingPrimaryAnchorCount === 0 && row.schemaKind === 'standard_placeId_schema')
  .map((row) => row.path);
const flatFilesHoldForSchemaReview = fileReports
  .filter((row) => !row.geographicStructure && row.schemaKind !== 'standard_placeId_schema')
  .map((row) => ({ path: row.path, schemaKind: row.schemaKind, reason: row.schemaKind === 'source_place_id_schema' ? 'Særskilt source_place_id-schema bør vurderes før split.' : 'Særskilt filschema bør vurderes før split.' }));

function chooseRecommendedNextPr() {
  if (invalidPlaceRefs.length > 0) {
    return { type: 'schema_cleanup', category: null, reason: 'Audit fant ugyldige place-referanser; cleanup bør tas før nye batches.', safeBatchSize: invalidPlaceRefs.length, blockers: uniqueSorted(invalidPlaceRefs.map((row) => row.invalidPlaceId)) };
  }
  const missingStrong = peopleWithoutStrongAnchor.length;
  if (missingStrong > 5) {
    return { type: 'place_creation', category: null, reason: 'Flere entries mangler gyldig hovedanker; vurder place-ref cleanup eller nye steder før ekspansjon.', safeBatchSize: Math.min(missingStrong, 10), blockers: uniqueSorted(peopleWithoutStrongAnchor.map((row) => row.primaryAnchor).filter(Boolean)) };
  }
  const splitCandidates = categories
    .filter((row) => row.suggestedNextAction === 'geographic_split')
    .sort((a, b) => b.totalPeople - a.totalPeople || a.category.localeCompare(b.category, 'nb'));
  if (splitCandidates.length) {
    const top = splitCandidates[0];
    return { type: 'geographic_split', category: top.category, reason: `${top.category} er største flate kategori med gyldige hovedankere og vanlig people-schema.`, safeBatchSize: top.totalPeople, blockers: [] };
  }
  const expandCandidates = categories
    .filter((row) => row.suggestedNextAction === 'expand_content')
    .sort((a, b) => a.totalPeople - b.totalPeople || a.category.localeCompare(b.category, 'nb'));
  if (expandCandidates.length) {
    const top = expandCandidates[0];
    return { type: 'content_expansion', category: top.category, reason: `${top.category} er liten og ren nok for innholdsutvidelse.`, safeBatchSize: 10, blockers: [] };
  }
  const schemaCandidate = categories.find((row) => row.suggestedNextAction === 'schema_review');
  if (schemaCandidate) {
    return { type: 'schema_cleanup', category: schemaCandidate.category, reason: `${schemaCandidate.category} bør ha schema review før split eller ekspansjon.`, safeBatchSize: schemaCandidate.totalPeople, blockers: [] };
  }
  return { type: 'content_expansion', category: null, reason: 'Ingen invalid refs, duplikater eller store flate split-kandidater ble funnet.', safeBatchSize: 10, blockers: [] };
}

const heldBackCandidates = [
  { id: 'kristine_bonnevie', status: 'held_back_duplicate_existing', reason: 'Allerede finnes i historie/split people-data ifølge #800.', nextRequirement: 'Ikke legg inn på nytt; vurder kun krysskobling hvis produktet trenger det.' },
  { id: 'marcus_thrane', status: 'held_back_duplicate_existing', reason: 'Allerede finnes i historie/split people-data ifølge #800.', nextRequirement: 'Ikke legg inn på nytt; vurder kun krysskobling hvis produktet trenger det.' },
  { id: 'martin_tranmael', status: 'held_back_duplicate_existing', reason: 'Allerede finnes i historie/split people-data ifølge #800.', nextRequirement: 'Ikke legg inn på nytt; vurder kun krysskobling hvis produktet trenger det.' },
  { id: 'trygve_bratteli', status: 'held_back_duplicate_existing', reason: 'Allerede finnes i historie/split people-data ifølge #800.', nextRequirement: 'Ikke legg inn på nytt; vurder kun krysskobling hvis produktet trenger det.' },
  { id: 'bjarne_melgaard', status: 'held_back_duplicate_existing', reason: 'Allerede finnes i kunst ifølge #812.', nextRequirement: 'Ikke legg inn på nytt; vurder eksisterende kunst-entry før eventuell utvidelse.' },
  { id: 'helvete_black_metal_miljoet', status: 'held_back_missing_valid_anchor', reason: 'Manglet passende gyldig place-anker ifølge #812.', nextRequirement: 'Finn eksisterende gyldig placeId eller opprett sted i separat place-PR før people-entry.' },
  { id: 'johan_thrane_holst_freia', status: 'held_back_missing_valid_anchor', reason: 'Manglet passende gyldig place-anker ifølge #812.', nextRequirement: 'Finn/opprett gyldig Freia-/næringslivsanker før people-entry.' },
  { id: 'ludvig_g_braathen_luftfart', status: 'held_back_missing_valid_anchor', reason: 'Manglet passende gyldig place-anker ifølge #812.', nextRequirement: 'Finn/opprett gyldig luftfarts-/næringslivsanker før people-entry.' },
];

const report = {
  generatedAt,
  input: {
    peopleManifest: 'data/people/manifest.json',
    placesManifest: 'data/places/manifest.json',
    placesIndex: 'data/places/places_index.json',
  },
  summary: {
    generatedAt,
    peopleFilesRead: fileReports.length,
    totalPeople: allPeople.length,
    uniquePeopleIds: idOccurrences.size,
    duplicatePeopleIds: duplicatePeopleIds.length,
    invalidPlaceRefs: invalidPlaceRefs.length,
    peopleWithoutValidPrimaryAnchor: peopleWithoutStrongAnchor.length,
    peopleWithEmptyPlacesArray: emptyPlacesEntries.length,
    flatPeopleFiles: flatPeopleFiles.length,
    geographicPeopleFiles: geographicPeopleFiles.length,
    categoriesRepresented: categories.length,
  },
  peopleFiles: fileReports,
  categories,
  geographicStructureStatus: {
    alreadyGeographic: geographicPeopleFiles,
    stillFlat: flatPeopleFiles,
    mixedCategoryStructure,
    recommendedNextGeographicSplit: categories.filter((row) => row.suggestedNextAction === 'geographic_split').map((row) => ({ category: row.category, totalPeople: row.totalPeople, files: row.flatFiles })),
    safeFlatFilesForGeographicSplit,
    flatFilesHoldForSchemaReview,
  },
  placeRefAudit: {
    invalidPlaceRefs,
    missingPlaceBlockers: [...missingBlockerRefs.values()].sort((a, b) => a.placeId.localeCompare(b.placeId, 'nb')),
  },
  peopleWithoutStrongAnchor,
  weakPlaces: weakPlacesEntries,
  schemaStatus,
  categorySchemaMismatches,
  duplicatePeopleIds,
  imageAudit: {
    checked: true,
    missingImages,
  },
  heldBackCandidates,
  recommendedNextPr: chooseRecommendedNextPr(),
  guardrails: {
    peopleEntriesAdded: 0,
    peopleEntriesMoved: 0,
    placeIdsCreated: 0,
    note: 'Audit-scriptet leser people/place-data og skriver kun rapporter under reports/.',
  },
};

function renderMd(r) {
  const lines = [];
  lines.push('# People of Places status-audit etter #812');
  lines.push('');
  lines.push(`Generert: ${r.generatedAt}`);
  lines.push('');
  lines.push('## Sammendrag');
  lines.push('');
  lines.push('| Felt | Verdi |');
  lines.push('|---|---:|');
  for (const [key, value] of Object.entries(r.summary)) lines.push(`| ${md(key)} | ${md(value)} |`);
  lines.push('');
  lines.push('## People-filer');
  lines.push('');
  lines.push('| Fil | Kategori | Geo | People | Dups i fil | Mangler id | Mangler navn | Mangler category | Mangler hovedanker | Invalid refs | Schema |');
  lines.push('|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|');
  for (const f of r.peopleFiles) {
    lines.push(`| ${md(f.path)} | ${md(f.categoryGuess)} | ${f.geographicStructure ? 'ja' : 'nei'} | ${f.peopleCount} | ${f.duplicateIdsWithinFile.length} | ${f.missingIdCount} | ${f.missingNameCount} | ${f.missingCategoryCount} | ${f.missingPrimaryAnchorCount} | ${f.invalidPlaceRefCount} | ${md(f.schemaKind)} |`);
  }
  lines.push('');
  lines.push('## Kategorioversikt');
  lines.push('');
  lines.push('| Kategori | People | Flate filer | Geofiler | Foreslått neste steg | Begrunnelse |');
  lines.push('|---|---:|---:|---:|---|---|');
  for (const c of r.categories) lines.push(`| ${md(c.category)} | ${c.totalPeople} | ${c.flatFiles.length} | ${c.geographicFiles.length} | ${md(c.suggestedNextAction)} | ${md(c.reason)} |`);
  lines.push('');
  lines.push('## Geografisk strukturstatus');
  lines.push('');
  lines.push(`- Allerede geografisk strukturert: ${r.geographicStructureStatus.alreadyGeographic.length}`);
  lines.push(`- Fortsatt flate filer: ${r.geographicStructureStatus.stillFlat.length}`);
  lines.push(`- Blandede kategorier: ${r.geographicStructureStatus.mixedCategoryStructure.length ? r.geographicStructureStatus.mixedCategoryStructure.join(', ') : 'ingen'}`);
  lines.push(`- Trygge flate filer for neste geografiske split: ${r.geographicStructureStatus.safeFlatFilesForGeographicSplit.length ? r.geographicStructureStatus.safeFlatFilesForGeographicSplit.join(', ') : 'ingen'}`);
  lines.push(`- Hold for schema review: ${r.geographicStructureStatus.flatFilesHoldForSchemaReview.length ? r.geographicStructureStatus.flatFilesHoldForSchemaReview.map((row) => `${row.path} (${row.schemaKind})`).join(', ') : 'ingen'}`);
  lines.push('');
  lines.push('### Anbefalte geografiske split-kandidater');
  lines.push('');
  if (r.geographicStructureStatus.recommendedNextGeographicSplit.length) {
    for (const row of r.geographicStructureStatus.recommendedNextGeographicSplit) lines.push(`- ${row.category}: ${row.totalPeople} entries (${row.files.join(', ')})`);
  } else {
    lines.push('- Ingen basert på nåværende auditlogikk.');
  }
  lines.push('');
  lines.push('## Place-ref audit');
  lines.push('');
  lines.push(`Invalid refs: ${r.placeRefAudit.invalidPlaceRefs.length}`);
  if (r.placeRefAudit.invalidPlaceRefs.length) {
    lines.push('');
    lines.push('| Fil | Person | Felt | Invalid placeId | Foreslått handling |');
    lines.push('|---|---|---|---|---|');
    for (const row of r.placeRefAudit.invalidPlaceRefs) lines.push(`| ${md(row.sourceFile)} | ${md(row.personId)} / ${md(row.personName)} | ${md(row.field)} | ${md(row.invalidPlaceId)} | ${md(row.suggestedAction)} |`);
  }
  lines.push('');
  lines.push('## People uten sterkt anker');
  lines.push('');
  if (r.peopleWithoutStrongAnchor.length) {
    lines.push('| Fil | Person | Årsak | Primæranker |');
    lines.push('|---|---|---|---|');
    for (const row of r.peopleWithoutStrongAnchor) lines.push(`| ${md(row.sourceFile)} | ${md(row.personId)} / ${md(row.personName)} | ${md(row.reason)} | ${md(row.primaryAnchor)} |`);
  } else {
    lines.push('- Ingen entries mangler gyldig hovedanker.');
  }
  lines.push('');
  lines.push('## Tom eller svak places[]');
  lines.push('');
  lines.push(`Entries med tom places[]: ${r.summary.peopleWithEmptyPlacesArray}`);
  lines.push(`Entries med svak/manglende places[] etter auditreglene: ${r.weakPlaces.length}`);
  if (r.weakPlaces.length) {
    lines.push('');
    lines.push('| Fil | Person | Årsak | placeId | source_place_id | places |');
    lines.push('|---|---|---|---|---|---|');
    for (const row of r.weakPlaces) lines.push(`| ${md(row.sourceFile)} | ${md(row.personId)} / ${md(row.personName)} | ${md(row.reason)} | ${md(row.placeId)} | ${md(row.source_place_id)} | ${md(JSON.stringify(row.places))} |`);
  }
  lines.push('');
  lines.push('## Schema-status');
  lines.push('');
  for (const row of r.schemaStatus) {
    lines.push(`- ${row.sourceFile}: ${row.schemaKind}; ${row.schemaNotes.join('; ')}`);
  }
  lines.push('');
  lines.push('## Category/collectionGroup-avvik');
  lines.push('');
  if (r.categorySchemaMismatches.length) {
    lines.push('| Fil | Person | Category | Forventet | Årsak |');
    lines.push('|---|---|---|---|---|');
    for (const row of r.categorySchemaMismatches) lines.push(`| ${md(row.sourceFile)} | ${md(row.personId)} / ${md(row.personName)} | ${md(row.category)} | ${md(row.expected)} | ${md(row.reason)} |`);
  } else {
    lines.push('- Ingen category/collectionGroup-avvik etter filspesifikke regler.');
  }
  lines.push('');
  lines.push('## Duplicate IDs');
  lines.push('');
  if (r.duplicatePeopleIds.length) {
    for (const row of r.duplicatePeopleIds) lines.push(`- ${row.id}: ${row.entries.map((entry) => entry.sourceFile).join(', ')}`);
  } else {
    lines.push('- Ingen duplicate IDs på tvers av manifest-listede people-filer.');
  }
  lines.push('');
  lines.push('## Image/cardImage audit');
  lines.push('');
  lines.push(`Mangler filer for image/cardImage/media: ${r.imageAudit.missingImages.length}`);
  if (r.imageAudit.missingImages.length) {
    lines.push('');
    lines.push('| Fil | Person | Felt | Bane |');
    lines.push('|---|---|---|---|');
    for (const row of r.imageAudit.missingImages) lines.push(`| ${md(row.sourceFile)} | ${md(row.personId)} / ${md(row.personName)} | ${md(row.field)} | ${md(row.imagePath)} |`);
  }
  lines.push('');
  lines.push('## Holdt tilbake fra tidligere batcher');
  lines.push('');
  lines.push('| Kandidat | Status | Årsak | Neste krav |');
  lines.push('|---|---|---|---|');
  for (const row of r.heldBackCandidates) lines.push(`| ${md(row.id)} | ${md(row.status)} | ${md(row.reason)} | ${md(row.nextRequirement)} |`);
  lines.push('');
  lines.push('## Manglende steder som blockers');
  lines.push('');
  if (r.placeRefAudit.missingPlaceBlockers.length) {
    for (const row of r.placeRefAudit.missingPlaceBlockers) lines.push(`- ${row.placeId}: ${row.occurrences} forekomster`);
  } else {
    lines.push('- Ingen invalid place IDs ble funnet i manifest-listede people-filer.');
  }
  lines.push('');
  lines.push('## Anbefalt neste PR');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(r.recommendedNextPr, null, 2));
  lines.push('```');
  lines.push('');
  lines.push('## Guardrails for denne audit-PR-en');
  lines.push('');
  lines.push('- Ingen people entries ble lagt til.');
  lines.push('- Ingen people entries ble flyttet.');
  lines.push('- Ingen nye place IDs ble opprettet.');
  lines.push('- Scriptet leser data og skriver kun rapportene `reports/people-of-places-status.json` og `reports/people-of-places-status.md`.');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

ensureDir(reportJsonPath);
fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(reportMdPath, renderMd(report));
console.log(`Wrote ${repoPath(reportJsonPath)} and ${repoPath(reportMdPath)}`);
console.log(`People: ${report.summary.totalPeople}; flat files: ${report.summary.flatPeopleFiles}; geographic files: ${report.summary.geographicPeopleFiles}; invalid refs: ${report.summary.invalidPlaceRefs}; duplicate IDs: ${report.summary.duplicatePeopleIds}`);
