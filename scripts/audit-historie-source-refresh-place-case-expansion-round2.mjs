#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUND1_FILE = 'data/fagverk/historie/maintenance/source-refresh-place-case-expansion-round1-2026-09-04.json';
const ROUND2_FILE = 'data/fagverk/historie/maintenance/source-refresh-place-case-expansion-round2-2026-09-04.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const SUBJECT_AUDIT_FILE = 'reports/fagverk/historie-subject-audit.json';
const EDITORIAL_PROFILES_FILE = 'data/fag/historie/editorial_profiles_historie_v1.json';
const HISTORIE_ROOT = 'data/fagverk/historie';
const PLACE_ROOT = 'data/places';
const EXPECTED_BASELINE = 'bf48de76740f27eba2e29ea4b629c734dcfaaa03';

const TARGET_CHAPTERS = new Set([
  'industri_arbeid_sosialhistorie',
  'migrasjon_minoritet_tilhorighet',
  'religion_reformasjon_livssyn',
  'miljo_klima_landskap',
  'vitenskap_teknologi_kunnskap'
]);

const REQUIRED_SOURCE_IDS = new Set([
  'histmaint2_oslo_byleksikon_lilleborg',
  'histmaint2_oslo_museum_lilleborg_1900',
  'histmaint2_oslo_museum_interkulturelt',
  'histmaint2_oslo_museum_gronland_2025',
  'histmaint2_kirken_gamle_aker_history_2026',
  'histmaint2_kirken_gamle_aker_rehab_2026',
  'histmaint2_oslo_alna_holalokka',
  'histmaint2_oslo_alna_needs_plan_2026',
  'histmaint2_tekniskmuseum_about',
  'histmaint2_tekniskmuseum_objects'
]);

const REQUIRED_PLACE_IDS = new Set([
  'lilleborg_fabrikker',
  'gronland_politistasjon',
  'gamle_aker_kirke',
  'alnaelva',
  'teknisk_museum'
]);

const abs = (value) => path.join(ROOT, value);
const readJson = (value) => JSON.parse(fs.readFileSync(abs(value), 'utf8'));
const text = (value) => String(value ?? '').trim();
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function walkJsonFiles(rootPath, visit) {
  if (!fs.existsSync(rootPath)) return;
  for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
    const entryPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      walkJsonFiles(entryPath, visit);
      continue;
    }
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    try {
      visit(JSON.parse(fs.readFileSync(entryPath, 'utf8')), entryPath);
    } catch {
      // Only parseable canonical place documents can prove identity.
    }
  }
}

function collectCanonicalPlaceIds() {
  const ids = new Set();
  walkJsonFiles(abs(PLACE_ROOT), (doc) => {
    if (!doc || Array.isArray(doc) || typeof doc !== 'object') return;
    const id = text(doc.id);
    const name = text(doc.name);
    if (id && name) ids.add(id);
  });
  return ids;
}

function collectEditorialBaseline(profiles) {
  const placeIds = new Set();
  let caseAnchorCount = 0;
  for (const profile of profiles.profiles || []) {
    for (const anchor of profile.case_anchors || []) {
      caseAnchorCount += 1;
      if (text(anchor.place_id)) placeIds.add(anchor.place_id);
    }
  }
  return { placeIds, caseAnchorCount };
}

function placeIdsFromCases(doc) {
  const ids = new Set();
  for (const item of doc.cases || []) {
    for (const placeId of item.place_ids || []) ids.add(placeId);
  }
  return ids;
}

export function auditHistorieSourceRefreshPlaceCaseExpansionRound2() {
  const round1 = readJson(ROUND1_FILE);
  const doc = readJson(ROUND2_FILE);
  const status = readJson(STATUS_FILE);
  const subjectAudit = readJson(SUBJECT_AUDIT_FILE);
  const editorialProfiles = readJson(EDITORIAL_PROFILES_FILE);

  assert(round1.schema === 'history_go_historie_maintenance_round_v1', 'Historie maintenance round 1 har feil schema');
  assert(round1.round_id === 'source_refresh_and_place_case_expansion_round1_2026_09_04', 'Historie maintenance round 1 har uventet round_id');
  assert(doc.schema === 'history_go_historie_maintenance_round_v1', 'Historie maintenance round 2 bruker feil schema');
  assert(doc.subject_id === 'historie', 'Historie maintenance round 2 bruker feil subject_id');
  assert(doc.round_id === 'source_refresh_and_place_case_expansion_round2_2026_09_04', 'Historie maintenance round 2 har uventet round_id');
  assert(doc.baseline_main_sha === EXPECTED_BASELINE, 'Historie maintenance round 2 er ikke bundet til eksakt fersk main-baseline');
  assert(doc.checked_at === '2026-09-04' && doc.status === 'verified', 'Historie maintenance round 2 er ikke datert og verifisert');

  assert(doc.scope?.new_strict_subcategory === false, 'Historie maintenance round 2 skal ikke opprette ny strict-underkategori');
  assert(doc.scope?.place_production === false, 'Historie maintenance round 2 skal ikke være stedsproduksjon');
  assert(doc.scope?.canonical_architecture_change === false, 'Historie maintenance round 2 skal ikke endre canonical fagarkitektur');
  assert(doc.scope?.maintenance_evidence_only === true, 'Historie maintenance round 2 skal være separat vedlikeholdsevidens');

  const historieStatus = (status.subjects || []).find((row) => row.id === 'historie');
  assert(historieStatus?.navigationStatus === 'materialized', 'Historie skal fortsatt være materialized');
  assert(historieStatus?.assessmentStatus === 'audited', 'Historie skal fortsatt være audited');
  assert(historieStatus?.editorialStatus === 'complete', 'Historie completion-status skal bevares');
  assert(historieStatus?.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'Historie skal fortsatt peke til maintenance-porten');

  assert(subjectAudit.schema === 'history_go_fagverk_historie_subject_audit_v1', 'Historie subject-audit har feil schema');
  assert(subjectAudit.subject?.editorialStatus === 'complete', 'Historie subject-audit skal fortsatt være complete');
  assert(subjectAudit.summary?.domainCount === 23, 'Historie subject-audit skal ha 23 domener');
  assert(subjectAudit.summary?.chapterCount === 23, 'Historie subject-audit skal ha 23 kapitler');
  assert(subjectAudit.summary?.emneCount === 230, 'Historie subject-audit skal ha 230 canonicale emner');
  assert(subjectAudit.summary?.curriculumPeriods === 9 && subjectAudit.summary?.curriculumCoveredPeriods === 9, 'Historie skal fortsatt dekke 9/9 perioder');

  const canonicalChapters = new Set((subjectAudit.chapters || []).map((chapter) => chapter.id));
  assert(canonicalChapters.size === 23, 'Historie subject-audit skal deklarere 23 unike kapitler');
  const round1Targets = new Set(round1.target_chapters || []);
  const declaredTargets = new Set(doc.target_chapters || []);
  assert(round1Targets.size === 5, 'Historie maintenance round 1 skal ha fem målkapitler');
  assert(declaredTargets.size === TARGET_CHAPTERS.size, 'Historie maintenance round 2 skal deklarere nøyaktig fem målkapitler');
  for (const chapterId of TARGET_CHAPTERS) {
    assert(declaredTargets.has(chapterId), `Mangler Historie round-2-målkapittel ${chapterId}`);
    assert(canonicalChapters.has(chapterId), `${chapterId}: finnes ikke i canonical Historie subject-audit`);
    assert(fs.existsSync(abs(`${HISTORIE_ROOT}/${chapterId}.json`)), `${chapterId}: mangler canonical kapittelfil`);
    assert(!round1Targets.has(chapterId), `${chapterId}: round 2 overlapper round 1`);
  }
  const combinedTargets = new Set([...round1Targets, ...declaredTargets]);
  assert(combinedTargets.size === 10, 'Historie maintenance round 1 + 2 skal dekke ti ulike kapitler');

  assert(editorialProfiles.schema === 'history_go_historie_editorial_profiles_v1', 'Historie editorial profiles har feil schema');
  const editorialBaseline = collectEditorialBaseline(editorialProfiles);
  assert(editorialBaseline.caseAnchorCount === 54, 'Historie editorial baseline skal fortsatt ha 54 kuraterte caseankere');
  const round1Places = placeIdsFromCases(round1);
  assert(round1Places.size === 5, 'Historie maintenance round 1 skal ha fem nye steder');

  const refreshes = doc.source_refresh || [];
  const cases = doc.cases || [];
  assert(refreshes.length === REQUIRED_SOURCE_IDS.size, 'Historie maintenance round 2 skal ha nøyaktig 10 kildekontroller');
  assert(cases.length === TARGET_CHAPTERS.size, 'Historie maintenance round 2 skal ha nøyaktig fem case');

  const round1SourceIds = new Set((round1.source_refresh || []).map((source) => source.id));
  const refreshIds = new Set();
  const publishers = new Set();
  for (const source of refreshes) {
    assert(text(source.id) && !refreshIds.has(source.id), `Duplisert eller tom Historie round-2-kilde-ID: ${source.id}`);
    assert(!round1SourceIds.has(source.id), `${source.id}: round 2 gjenbruker en round-1-kilde-ID`);
    refreshIds.add(source.id);
    publishers.add(text(source.publisher));
    assert(/^https:\/\//.test(text(source.url)), `${source.id}: URL skal bruke https`);
    assert(text(source.publisher).length >= 3, `${source.id}: mangler publisher`);
    assert(text(source.source_location).length >= 80, `${source.id}: source_location er for svak`);
    assert(source.health === 'verified_live', `${source.id}: kildehelse er ikke verified_live`);
    assert(text(source.authority).length >= 8, `${source.id}: authority er ikke eksplisitt`);
    assert(Array.isArray(source.chapter_ids) && source.chapter_ids.length === 1, `${source.id}: skal være bundet til nøyaktig ett målkapittel`);
    assert(TARGET_CHAPTERS.has(source.chapter_ids[0]), `${source.id}: kilde ligger utenfor round-2-målkapitlene`);
  }
  for (const id of REQUIRED_SOURCE_IDS) assert(refreshIds.has(id), `Mangler obligatorisk Historie round-2-kilde ${id}`);
  assert(publishers.size >= 6, 'Historie maintenance round 2 skal ha minst seks institusjonelle utgiveridentiteter');

  const canonicalPlaceIds = collectCanonicalPlaceIds();
  const caseIds = new Set();
  const usedSources = new Set();
  const usedPlaces = new Set();
  const usedChapters = new Set();

  for (const item of cases) {
    assert(text(item.id) && !caseIds.has(item.id), `Duplisert eller tom Historie round-2-case-ID: ${item.id}`);
    caseIds.add(item.id);
    assert(text(item.title), `${item.id}: mangler tittel`);
    assert(text(item.case_claim).length >= 350, `${item.id}: case_claim er for kort`);
    assert(TARGET_CHAPTERS.has(item.chapter_id), `${item.id}: ukjent round-2-målkapittel ${item.chapter_id}`);
    assert(!usedChapters.has(item.chapter_id), `${item.id}: målkapitlet ${item.chapter_id} har mer enn ett round-2-case`);
    usedChapters.add(item.chapter_id);

    assert(Array.isArray(item.source_ids) && item.source_ids.length >= 2, `${item.id}: caset skal bruke minst to round-2-kilder`);
    for (const sourceId of item.source_ids) {
      assert(refreshIds.has(sourceId), `${item.id}: ukjent round-2-kilde ${sourceId}`);
      usedSources.add(sourceId);
    }

    assert(Array.isArray(item.place_ids) && item.place_ids.length === 1, `${item.id}: caset skal ha ett presist stedanker`);
    for (const placeId of item.place_ids) {
      assert(canonicalPlaceIds.has(placeId), `${item.id}: ukjent canonical place_id ${placeId}`);
      assert(!editorialBaseline.placeIds.has(placeId), `${item.id}: ${placeId} finnes allerede i de 54 kuraterte editorial caseankrene`);
      assert(!round1Places.has(placeId), `${item.id}: ${placeId} ble allerede lagt til i maintenance round 1`);
      assert(!usedPlaces.has(placeId), `${item.id}: ${placeId} brukes av mer enn ett round-2-case`);
      usedPlaces.add(placeId);
    }

    assert(Array.isArray(item.analysis_questions) && item.analysis_questions.length === 3, `${item.id}: caset skal ha nøyaktig tre analysespørsmål`);
    assert(item.analysis_questions.every((question) => text(question).length >= 100), `${item.id}: analysespørsmålene er for svake`);
  }

  assert(usedChapters.size === TARGET_CHAPTERS.size, 'Historie maintenance round 2 skal dekke alle fem målkapitlene');
  for (const chapterId of TARGET_CHAPTERS) assert(usedChapters.has(chapterId), `Historie round 2 mangler ${chapterId}`);
  assert(usedSources.size === refreshIds.size, 'Alle Historie round-2-kilder skal brukes av minst ett case');
  assert(usedPlaces.size === REQUIRED_PLACE_IDS.size, 'Historie maintenance round 2 skal bruke nøyaktig fem nye canonicale steder');
  for (const placeId of REQUIRED_PLACE_IDS) assert(usedPlaces.has(placeId), `Historie round 2 mangler obligatorisk sted ${placeId}`);

  const gates = doc.quality_gates || {};
  for (const gate of [
    'all_sources_https',
    'all_sources_authoritative_or_institutional',
    'all_cases_source_bound',
    'all_cases_place_bound',
    'all_case_places_canonical',
    'all_case_places_new_to_editorial_baseline',
    'round2_chapters_disjoint_from_round1',
    'round2_places_disjoint_from_round1',
    'claim_provenance_preserved',
    'historiography_and_theory_integrity_scope_unchanged',
    'canonical_subject_architecture_unchanged',
    'completion_status_preserved',
    'museum_curation_not_treated_as_total_social_reality',
    'present_day_institution_not_retrojected_unchanged_into_past',
    'planned_environmental_project_not_treated_as_completed',
    'place_anchor_not_treated_as_location_of_all_systemic_effects'
  ]) assert(gates[gate] === true, `Historie maintenance round 2 mangler grønn kvalitetsport: ${gate}`);

  const projectedUniquePlaces = new Set([...editorialBaseline.placeIds, ...round1Places, ...usedPlaces]);

  return {
    schema: 'history_go_historie_maintenance_audit_v1',
    status: 'passed',
    round: 2,
    round_id: doc.round_id,
    baseline_main_sha: doc.baseline_main_sha,
    source_refresh_count: refreshes.length,
    publisher_count: publishers.size,
    case_count: cases.length,
    chapter_count: usedChapters.size,
    combined_maintenance_chapter_count: combinedTargets.size,
    canonical_chapter_count: canonicalChapters.size,
    baseline_editorial_case_anchor_count: editorialBaseline.caseAnchorCount,
    baseline_editorial_unique_place_count: editorialBaseline.placeIds.size,
    round1_new_place_count: round1Places.size,
    round2_new_place_count: usedPlaces.size,
    projected_case_anchor_count: editorialBaseline.caseAnchorCount + (round1.cases || []).length + cases.length,
    projected_unique_place_count: projectedUniquePlaces.size,
    gates: {
      source_health: true,
      canonical_chapter_identity: true,
      canonical_place_identity: true,
      chapter_non_overlap_round1: true,
      place_non_overlap_editorial_and_round1: true,
      case_source_trace: true,
      claim_provenance_preserved: true,
      historiography_and_theory_integrity_scope_unchanged: true,
      subject_architecture_unchanged: true,
      completion_status_preserved: true,
      museum_representation_bounded: true,
      present_day_retrojection_bounded: true,
      planned_project_status_bounded: true,
      systemic_effects_not_localized_to_place_anchor: true,
      no_strict_subcategory: true,
      no_place_production: true
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditHistorieSourceRefreshPlaceCaseExpansionRound2();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
