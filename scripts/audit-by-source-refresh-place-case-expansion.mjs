#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAINTENANCE_FILE = 'data/fagverk/by/maintenance/source-refresh-place-case-expansion-round1-2026-09-04.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const COMPLETE_REPORT = 'reports/fagverk/by-complete-audit.json';
const BY_ROOT = 'data/fagverk/by';
const PLACE_ROOT = 'data/places/by/oslo';
const PLACE_SPLIT_DIR = 'data/places/by/oslo/places';
const EXPECTED_BASELINE = 'dad35c9703726e1987ae075d55f91c93b050ec5d';

const abs = (value) => path.join(ROOT, value);
const readJson = (value) => JSON.parse(fs.readFileSync(abs(value), 'utf8'));
const text = (value) => String(value ?? '').trim();
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const TARGET_CHAPTERS = new Set([
  'boligpolitikk-pris-leie-eie-tilgang',
  'regional-global-pendling-migrasjon-sammenligning',
  'data-styring-kart-plan-medvirkning-algoritmer',
  'klima-helse-varme-vann-tilgjengelighet',
  'administrasjon-plan-kontroll-beredskap'
]);

const REQUIRED_SOURCE_IDS = new Set([
  'bymaint1_ssb_rent_2025',
  'bymaint1_ssb_house_price_q2_2026',
  'bymaint1_oslo_central_plans_2026',
  'bymaint1_ssb_commuting_oslo_2025',
  'bymaint1_oslo_planning_process',
  'bymaint1_oslo_planinnsyn',
  'bymaint1_oslo_medvirkning_2026',
  'bymaint1_oslo_near_nature_plan_2026_2035',
  'bymaint1_oslo_budget_climate_2026',
  'bymaint1_dsb_municipal_preparedness',
  'bymaint1_kdd_planning_guidance_2026'
]);

function collectCanonicalPlaceIds() {
  const ids = new Set();
  const loadDirFiles = (dirPath) => {
    if (!fs.existsSync(dirPath)) return;
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
      const doc = JSON.parse(fs.readFileSync(path.join(dirPath, entry.name), 'utf8'));
      if (text(doc.id)) ids.add(text(doc.id));
    }
  };
  loadDirFiles(abs(PLACE_ROOT));
  loadDirFiles(abs(PLACE_SPLIT_DIR));
  return ids;
}

export function auditBySourceRefreshPlaceCaseExpansion() {
  const doc = readJson(MAINTENANCE_FILE);
  const status = readJson(STATUS_FILE);
  const complete = readJson(COMPLETE_REPORT);

  assert(doc.schema === 'history_go_by_maintenance_round_v1', 'By-vedlikehold bruker feil schema');
  assert(doc.subject_id === 'by', 'By-vedlikehold bruker feil subject_id');
  assert(doc.round_id === 'source_refresh_and_place_case_expansion_round1_2026_09_04', 'By-vedlikehold bruker feil round_id');
  assert(doc.baseline_main_sha === EXPECTED_BASELINE, 'By-vedlikehold er ikke bundet til eksakt fersk main-baseline');
  assert(doc.checked_at === '2026-09-04' && doc.status === 'verified', 'By-vedlikehold er ikke datert og verifisert');

  assert(doc.scope?.new_strict_subcategory === false, 'By-vedlikehold skal ikke opprette ny strict-underkategori');
  assert(doc.scope?.place_production === false, 'By-vedlikehold skal ikke være stedsproduksjon');
  assert(doc.scope?.canonical_architecture_change === false, 'By-vedlikehold skal ikke endre canonical fagarkitektur');

  const byStatus = (status.subjects || []).find((row) => row.id === 'by');
  assert(byStatus?.navigationStatus === 'materialized', 'By skal fortsatt være materialized');
  assert(byStatus?.assessmentStatus === 'audited', 'By skal fortsatt være audited');
  assert(byStatus?.editorialStatus === 'complete', 'By completion-status skal bevares');
  assert(byStatus?.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'By skal fortsatt peke til vedlikeholds-/stedscaseporten');

  assert(complete.schema === 'history_go_fagverk_by_complete_audit_v1', 'By complete-audit har feil schema');
  assert(complete.status === 'complete', 'By complete-audit er ikke complete');
  assert(complete.summary?.chapterCount === 17, 'By complete-audit skal fortsatt ha 17 kapitler');
  assert(complete.summary?.uniquePlaceCount === 20, 'By maintenance round 1 forventer baseline på 20 unike stedscase');

  const declaredTargets = new Set(doc.target_chapters || []);
  assert(declaredTargets.size === TARGET_CHAPTERS.size, 'By-vedlikehold skal deklarere nøyaktig fem målkapitler');
  for (const chapterId of TARGET_CHAPTERS) {
    assert(declaredTargets.has(chapterId), `Mangler målkapittel ${chapterId}`);
    assert(fs.existsSync(abs(`${BY_ROOT}/${chapterId}.json`)), `Ukjent canonicalt By-kapittel ${chapterId}`);
  }

  const refreshes = doc.source_refresh || [];
  const cases = doc.cases || [];
  assert(refreshes.length === REQUIRED_SOURCE_IDS.size, 'By-vedlikehold skal ha nøyaktig 11 kildekontroller');
  assert(cases.length === 5, 'By-vedlikehold skal ha nøyaktig fem nye case');

  const refreshIds = new Set();
  const publishers = new Set();
  for (const source of refreshes) {
    assert(text(source.id) && !refreshIds.has(source.id), `Duplisert eller tom kilde-ID: ${source.id}`);
    refreshIds.add(source.id);
    publishers.add(text(source.publisher));
    assert(/^https:\/\//.test(text(source.url)), `${source.id}: URL skal bruke https`);
    assert(text(source.publisher).length >= 3, `${source.id}: mangler publisher`);
    assert(text(source.source_location).length >= 45, `${source.id}: source_location er for svak`);
    assert(source.health === 'verified_live', `${source.id}: kildehelse er ikke verified_live`);
    assert(Array.isArray(source.chapter_ids) && source.chapter_ids.length >= 1, `${source.id}: mangler chapter_ids`);
    for (const chapterId of source.chapter_ids) {
      assert(TARGET_CHAPTERS.has(chapterId), `${source.id}: kilde ligger utenfor runde-1-målkapitlene`);
    }
  }
  for (const id of REQUIRED_SOURCE_IDS) assert(refreshIds.has(id), `Mangler obligatorisk kildekontroll ${id}`);
  assert(publishers.size >= 5, 'Kildegrunnlaget skal ha minst fem institusjonelle utgivere');

  const canonicalPlaceIds = collectCanonicalPlaceIds();
  const baselinePlaces = new Set(complete.coveredPlaceIds || []);
  const caseIds = new Set();
  const usedSources = new Set();
  const usedPlaces = new Set();
  const usedChapters = new Set();

  for (const item of cases) {
    assert(text(item.id) && !caseIds.has(item.id), `Duplisert eller tom case-ID: ${item.id}`);
    caseIds.add(item.id);
    assert(text(item.title), `${item.id}: mangler tittel`);
    assert(text(item.case_claim).length >= 180, `${item.id}: case_claim er for kort`);
    assert(TARGET_CHAPTERS.has(item.chapter_id), `${item.id}: ukjent målkapittel ${item.chapter_id}`);
    usedChapters.add(item.chapter_id);

    assert(Array.isArray(item.source_ids) && item.source_ids.length >= 2, `${item.id}: caset skal bruke minst to vedlikeholdskilder`);
    for (const sourceId of item.source_ids) {
      assert(refreshIds.has(sourceId), `${item.id}: ukjent kilde ${sourceId}`);
      usedSources.add(sourceId);
    }

    assert(Array.isArray(item.place_ids) && item.place_ids.length >= 1, `${item.id}: caset mangler stedskobling`);
    for (const placeId of item.place_ids) {
      assert(canonicalPlaceIds.has(placeId), `${item.id}: ukjent canonical place_id ${placeId}`);
      assert(!baselinePlaces.has(placeId), `${item.id}: ${placeId} finnes allerede i By complete-audit og er ikke en ny stedscaseutvidelse`);
      usedPlaces.add(placeId);
    }

    assert(Array.isArray(item.analysis_questions) && item.analysis_questions.length === 3, `${item.id}: caset skal ha nøyaktig tre analysespørsmål`);
    assert(item.analysis_questions.every((question) => text(question).length >= 60), `${item.id}: analysespørsmålene er for svake`);
  }

  assert(usedChapters.size === TARGET_CHAPTERS.size, 'Caseutvidelsen skal dekke alle fem målkapitler nøyaktig én gang');
  for (const chapterId of TARGET_CHAPTERS) assert(usedChapters.has(chapterId), `Caseutvidelsen mangler ${chapterId}`);
  assert(usedSources.size === refreshIds.size, 'Alle kildekontroller skal brukes av minst ett case');
  assert(usedPlaces.size >= 6, 'Runde 1 skal legge til minst seks nye canonicale stedscase');

  const gates = doc.quality_gates || {};
  for (const gate of [
    'all_sources_https',
    'all_sources_authoritative_or_institutional',
    'all_cases_source_bound',
    'all_cases_place_bound',
    'all_case_places_canonical',
    'all_case_places_new_to_complete_audit',
    'claim_provenance_preserved',
    'theory_integrity_scope_unchanged',
    'canonical_subject_architecture_unchanged',
    'completion_status_preserved',
    'field_observation_not_treated_as_statistical_or_legal_proof'
  ]) assert(gates[gate] === true, `By-vedlikehold mangler grønn kvalitetsport: ${gate}`);

  return {
    schema: 'history_go_by_maintenance_audit_v1',
    status: 'passed',
    round: 1,
    round_id: doc.round_id,
    baseline_main_sha: doc.baseline_main_sha,
    source_refresh_count: refreshes.length,
    publisher_count: publishers.size,
    case_count: cases.length,
    chapter_count: usedChapters.size,
    baseline_unique_place_count: complete.summary.uniquePlaceCount,
    new_unique_place_count: usedPlaces.size,
    projected_unique_place_count: complete.summary.uniquePlaceCount + usedPlaces.size,
    gates: {
      source_health: true,
      canonical_chapter_identity: true,
      canonical_place_identity: true,
      new_place_case_expansion: true,
      case_source_trace: true,
      claim_provenance_preserved: true,
      theory_integrity_scope_unchanged: true,
      subject_architecture_unchanged: true,
      completion_status_preserved: true,
      no_strict_subcategory: true,
      no_place_production: true
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditBySourceRefreshPlaceCaseExpansion();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
