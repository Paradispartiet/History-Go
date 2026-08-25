#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AUDIT_FILE = 'data/fag/subkultur/subkultur_places_people_audit_v1.json';
const WRITE = process.argv.includes('--write');

const PLACE_DECISIONS = {
  hartvig_nissens_skole_skam: { decision: 'reclassify', category: 'film_tv', reason: 'TV-lokasjon og fandom alene dokumenterer ikke et stedbundet subkulturmiljø.' },
  abelonegarden: { decision: 'remove_secondary_badge', category: 'historie', reason: 'Sosial marginalitet og en navngitt historisk person er ikke i seg selv et subkulturmiljø.' },
  lisbon_village_underground: { decision: 'reclassify', category: 'naeringsliv', reason: 'Coworking og kreativ næring dokumenterer ikke alene en subkulturell sosial verden.' }
};

const PEOPLE_RECLASSIFY = {
  bjarne_melgaard: 'kunst',
  steinar_jakobsen: 'kunst',
  ole_kopreitan: 'politikk',
  karpe: 'musikk',
  arif: 'musikk',
  kolapalsen: 'historie',
  snippmoller: 'historie',
  lusefrants: 'historie',
  lisa_kristoffersen: 'historie',
  advokat_hermansen: 'historie',
  ole_bjorn: 'historie',
  viggo_tigeren: 'historie',
  tinashe_williamson: 'media',
  stephen_butkus: 'kunst',
  christopher_nielsen: 'kunst',
  hariton_pushwagner: 'kunst',
  don_martin: 'musikk',
  tommy_tee: 'musikk',
  warlocks_oslo: 'musikk',
  kjetil_rolness: 'media',
  renald_antoinette: 'historie',
  lars_poverud: 'historie',
  karl_rognstad: 'historie',
  astrid_christensen: 'historie',
  abelone_kristensen: 'historie'
};

const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const writeJson = (relative, value) => {
  const compactRows = relative.endsWith('/people_subkultur_oslo_named_batch4.json') && Array.isArray(value);
  const serialized = compactRows
    ? `[\n  ${value.map((entry) => JSON.stringify(entry)).join(',\n  ')}\n]\n`
    : JSON.stringify(value, null, 2) + '\n';
  fs.writeFileSync(path.join(ROOT, relative), serialized);
};
const list = (value) => Array.isArray(value) ? value : [];
const hasSubEmne = (record) => list(record.emne_ids).some((id) => String(id).startsWith('em_sub_'));
const isRelevantPlace = (record) => record.category === 'subkultur'
  || list(record.secondaryBadgeIds).includes('subkultur')
  || hasSubEmne(record);
const isRelevantPerson = (record) => record.category === 'subkultur'
  || list(record.secondaryBadgeIds).includes('subkultur')
  || list(record.tags).includes('subkultur')
  || hasSubEmne(record);

function flatten(value) {
  if (Array.isArray(value)) return value.flatMap(flatten);
  if (!value || typeof value !== 'object') return [];
  if (value.id) return [value];
  return Object.values(value).flatMap(flatten);
}

function manifestFiles(relative) {
  return list(readJson(relative).files).map((file) => file.startsWith('data/') ? file : `data/${file}`);
}

function loadRecords(relative) {
  const byId = new Map();
  for (const file of manifestFiles(relative)) {
    for (const record of flatten(readJson(file))) {
      if (record.id) byId.set(record.id, { ...record, __file: file });
    }
  }
  return byId;
}

function transform(value, updater) {
  if (Array.isArray(value)) return value.map((entry) => transform(entry, updater));
  if (!value || typeof value !== 'object') return value;
  if (value.id) return updater({ ...value });
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, transform(entry, updater)]));
}

function subcultureEmnerForPerson(record) {
  const corpus = [record.id, record.name, record.desc, record.popupDesc, ...list(record.tags)]
    .join(' ').toLowerCase();
  const result = new Set(list(record.emne_ids).filter((id) => String(id).startsWith('em_sub_')));
  const add = (...ids) => ids.forEach((id) => result.add(id));
  if (/skate|skateboard/.test(corpus)) add('em_sub_skate_byrom', 'em_sub_deltakelse_laring');
  if (/graffiti|street_art|gatekunst/.test(corpus)) add('em_sub_graffiti_gatekunst', 'em_sub_territoriale_koder');
  if (/alternativmedia|alternativpresse|uavhengig_presse|torggata_blad|zine|småforlag|radio/.test(corpus)) {
    add('em_sub_uavhengige_medier', 'em_sub_diy_praksis');
  }
  if (/blitz|husokkupasjon|selvstyring|selvorganisering/.test(corpus)) {
    add('em_sub_autonomi_motstand', 'em_sub_okkuperte_rom', 'em_sub_sosial_organisering');
  }
  if (/motkultur|club_7|scene_7/.test(corpus)) add('em_sub_motkultur', 'em_sub_scene_fellesskap', 'em_sub_sted_scene');
  if (/klubbkultur|nattliv|nattkultur|dj_kultur|batida/.test(corpus)) {
    add('em_sub_klubbkultur_natt', 'em_sub_scene_fellesskap', 'em_sub_sted_scene');
  }
  if (/undergrunnsmusikk|konsertkultur|konsertsted|black_metal|platekultur|uavhengig_scene|historisk_scene/.test(corpus)) {
    add('em_sub_musikkscener', 'em_sub_scene_fellesskap', 'em_sub_sted_scene');
  }
  if (/skeiv/.test(corpus)) add('em_sub_skeive_miljoer', 'em_sub_scene_fellesskap');
  if (/spill|gaming|e_sport|nerdkultur/.test(corpus)) add('em_sub_gaming_lan', 'em_sub_scene_fellesskap');
  if (/dugnad|arrangor|miljobygging|redaksjon/.test(corpus)) add('em_sub_arrangorer_dugnad', 'em_sub_sosial_organisering');
  if (/ungdomskultur|lavterskel/.test(corpus)) add('em_sub_ungdomskultur_identitet', 'em_sub_tilhorighet_miljo');
  if (/miljoet|miljøet/.test(corpus) && result.size === 0) add('em_sub_tilhorighet_miljo', 'em_sub_scene_fellesskap');
  return [...result];
}

function buildPlaceRows(records) {
  const rows = [];
  for (const record of records.values()) {
    if (!isRelevantPlace(record) && !PLACE_DECISIONS[record.id]) continue;
    const override = PLACE_DECISIONS[record.id];
    const emneIds = list(record.emne_ids).filter((id) => String(id).startsWith('em_sub_'));
    rows.push({
      place_id: record.id,
      source_file: record.__file,
      decision: override?.decision ?? (record.category === 'subkultur' ? 'retain_primary' : 'retain_secondary'),
      resulting_category: override?.category ?? record.category,
      subkultur_emne_ids: override ? [] : emneIds,
      classification_basis: override?.reason ?? 'Canonical stedstekst dokumenterer miljø/praksis, og minst én canonical emnekobling avgrenser Subkultur-laget.',
      case_validation_status: 'requires_environment_near_and_independent_sources'
    });
  }
  return rows.sort((a, b) => a.place_id.localeCompare(b.place_id));
}

function buildPeopleRows(records) {
  const rows = [];
  for (const record of records.values()) {
    if (!isRelevantPerson(record) && !PEOPLE_RECLASSIFY[record.id]) continue;
    const category = PEOPLE_RECLASSIFY[record.id];
    const emneIds = category ? [] : subcultureEmnersFor(record);
    rows.push({
      people_id: record.id,
      source_file: record.__file,
      decision: category ? 'reclassify_remove_subkultur' : (record.category === 'subkultur' ? 'retain_primary' : 'retain_cross_category'),
      resulting_category: category ?? record.category,
      subkultur_emne_ids: emneIds,
      classification_basis: category
        ? 'Person-, sjanger-, kunstner- eller byoriginalstatus dokumenterer ikke alene et avgrenset subkulturmiljø.'
        : 'Posten har en eksplisitt kobling til et dokumentert miljø, en kollektiv praksis eller stedbundet infrastruktur.'
    });
  }
  return rows.sort((a, b) => a.people_id.localeCompare(b.people_id));
}

function subcultureEmnersFor(record) {
  const ids = subcultureEmnerForPerson(record);
  if (ids.length === 0) throw new Error(`Beholdt People-post mangler faglig emnemapping: ${record.id}`);
  return ids;
}

function applyPeopleRows(rows) {
  const byFile = new Map();
  for (const row of rows) {
    if (!byFile.has(row.source_file)) byFile.set(row.source_file, new Map());
    byFile.get(row.source_file).set(row.people_id, row);
  }
  for (const [file, decisions] of byFile) {
    const updated = transform(readJson(file), (record) => {
      const row = decisions.get(record.id);
      if (!row) return record;
      record.category = row.resulting_category;
      if (row.decision === 'reclassify_remove_subkultur') {
        record.tags = list(record.tags).filter((tag) => tag !== 'subkultur');
        if (Array.isArray(record.secondaryBadgeIds)) {
          record.secondaryBadgeIds = record.secondaryBadgeIds.filter((id) => id !== 'subkultur');
          if (record.secondaryBadgeIds.length === 0) delete record.secondaryBadgeIds;
        }
        if (Array.isArray(record.emne_ids)) {
          record.emne_ids = record.emne_ids.filter((id) => !String(id).startsWith('em_sub_'));
          if (record.emne_ids.length === 0) delete record.emne_ids;
        }
      } else {
        record.emne_ids = [...new Set([...list(record.emne_ids), ...row.subkultur_emne_ids])];
      }
      return record;
    });
    writeJson(file, updated);
  }
}

function main() {
  const places = loadRecords('data/places/manifest.json');
  const people = loadRecords('data/people/manifest.json');
  let placeRows;
  let peopleRows;
  if (fs.existsSync(path.join(ROOT, AUDIT_FILE))) {
    const existing = readJson(AUDIT_FILE);
    placeRows = buildPlaceRows(places);
    const existingPeopleById = new Map(list(existing.people).map((row) => [row.people_id, row]));
    const newPeopleRows = buildPeopleRows(people).filter((row) => !existingPeopleById.has(row.people_id));
    peopleRows = [...list(existing.people), ...newPeopleRows].sort((a, b) => a.people_id.localeCompare(b.people_id));
  } else {
    placeRows = buildPlaceRows(places);
    peopleRows = buildPeopleRows(people);
  }
  if (WRITE) applyPeopleRows(peopleRows);
  const report = {
    schema: 'history_go_subkultur_places_people_audit_v1',
    version: 1,
    subject_id: 'subkultur',
    status: 'classification_complete_case_evidence_pending',
    definition_guard: 'Mennesker, miljøer og praksiser på siden av eller i friksjon med storsamfunnet; aktivitet, sjanger, arena, marginalitet eller alternativ merkevare alene kvalifiserer ikke.',
    totals: {
      audited_places: placeRows.length,
      retained_places: placeRows.filter((row) => row.decision.startsWith('retain_')).length,
      reclassified_places: placeRows.filter((row) => !row.decision.startsWith('retain_')).length,
      audited_people: peopleRows.length,
      retained_people: peopleRows.filter((row) => row.decision.startsWith('retain_')).length,
      reclassified_people: peopleRows.filter((row) => !row.decision.startsWith('retain_')).length
    },
    places: placeRows,
    people: peopleRows,
    next_gate: 'case_source_validation'
  };
  if (WRITE) writeJson(AUDIT_FILE, report);
  const expected = fs.existsSync(path.join(ROOT, AUDIT_FILE)) ? readJson(AUDIT_FILE) : report;
  if (JSON.stringify(expected) !== JSON.stringify(report)) throw new Error(`${AUDIT_FILE} er utdatert; kjør --write`);
  console.log(`Subkultur dataaudit OK: ${report.totals.audited_places} steder, ${report.totals.audited_people} People; casekilder gjenstår.`);
}

main();
