#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUND1_FILE = 'data/fagverk/historie/maintenance/source-refresh-place-case-expansion-round1-2026-09-04.json';
const ROUND2_FILE = 'data/fagverk/historie/maintenance/source-refresh-place-case-expansion-round2-2026-09-04.json';
const ROUND3_FILE = 'data/fagverk/historie/maintenance/source-refresh-place-case-expansion-round3-2026-09-04.json';
const ROUND4_FILE = 'data/fagverk/historie/maintenance/source-refresh-place-case-expansion-round4-2026-09-04.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const SUBJECT_AUDIT_FILE = 'reports/fagverk/historie-subject-audit.json';
const EDITORIAL_PROFILES_FILE = 'data/fag/historie/editorial_profiles_historie_v1.json';
const HISTORIE_ROOT = 'data/fagverk/historie';
const PLACE_ROOT = 'data/places';
const EXPECTED_BASELINE = '27f812cd24f99e888decd20a5c4c149fc02a653f';

const TARGET_CHAPTERS = new Set([
  'middelalder_kirke_kongemakt',
  '1814_statsdannelse',
  'minne_kulturarv_historiebruk',
  'katastrofer_brudd_ulykker',
  'kjonn_familie_livslop'
]);
const EXPECTED_REMAINING_CHAPTERS = new Set([
  'samisk_urfolkshistorie',
  'offentlighet_mobilisering_bevegelser',
  'kald_krig_etterkrig'
]);
const REQUIRED_SOURCE_IDS = new Set([
  'histmaint4_oslo_middelalderparken_mariakirken',
  'histmaint4_niku_kongsgard_mariakirken_2026',
  'histmaint4_oppdagkvadraturen_paleet_1814',
  'histmaint4_regjeringen_1814_regjering_departementsdannelse',
  'histmaint4_roseslottet_memory_2026',
  'histmaint4_stortinget_roseslottet_2026',
  'histmaint4_brannmuseet_1858_history',
  'histmaint4_oslobyleksikon_bybrannen_1858',
  'histmaint4_nb_camilla_collett_archive',
  'histmaint4_oslo_camilla_collett_memorial_2026'
]);
const REQUIRED_PLACE_IDS = new Set([
  'mariakirken_ruin_oslo',
  'palehaven_paleet',
  'roseslottet',
  'brannmuseet_oslo',
  'camilla_collett_statue'
]);
const REQUIRED_GATES = [
  'all_sources_https',
  'all_sources_authoritative_or_institutional',
  'all_cases_source_bound',
  'all_cases_place_bound',
  'all_case_places_canonical',
  'all_case_places_new_to_editorial_baseline',
  'round4_chapters_disjoint_from_round1_round2_round3',
  'round4_places_disjoint_from_round1_round2_round3',
  'claim_provenance_preserved',
  'historiography_and_theory_integrity_scope_unchanged',
  'canonical_subject_architecture_unchanged',
  'completion_status_preserved',
  'archaeological_interpretation_bounded',
  'palace_anchor_not_treated_as_total_state_formation',
  'present_day_memorial_meaning_not_retrojected',
  'museum_location_not_treated_as_event_location',
  'statue_not_treated_as_direct_life_evidence'
];

const abs = (value) => path.join(ROOT, value);
const readJson = (value) => JSON.parse(fs.readFileSync(abs(value), 'utf8'));
const text = (value) => String(value ?? '').trim();
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function walkJsonFiles(rootPath, visit) {
  if (!fs.existsSync(rootPath)) return;
  for (const entry of fs.readdirSync(rootPath, { withFileTypes: true })) {
    const entryPath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) { walkJsonFiles(entryPath, visit); continue; }
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    try { visit(JSON.parse(fs.readFileSync(entryPath, 'utf8'))); } catch { /* parseable canonical docs only */ }
  }
}

function collectCanonicalPlaceIds() {
  const ids = new Set();
  walkJsonFiles(abs(PLACE_ROOT), (doc) => {
    if (!doc || Array.isArray(doc) || typeof doc !== 'object') return;
    if (text(doc.id) && text(doc.name)) ids.add(text(doc.id));
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
    for (const id of item.place_ids || []) ids.add(id);
  }
  return ids;
}

export function auditHistorieSourceRefreshPlaceCaseExpansionRound4() {
  const round1 = readJson(ROUND1_FILE);
  const round2 = readJson(ROUND2_FILE);
  const round3 = readJson(ROUND3_FILE);
  const doc = readJson(ROUND4_FILE);
  const status = readJson(STATUS_FILE);
  const subjectAudit = readJson(SUBJECT_AUDIT_FILE);
  const editorialProfiles = readJson(EDITORIAL_PROFILES_FILE);

  assert(round1.round_id === 'source_refresh_and_place_case_expansion_round1_2026_09_04', 'Historie round 1 har uventet round_id');
  assert(round2.round_id === 'source_refresh_and_place_case_expansion_round2_2026_09_04', 'Historie round 2 har uventet round_id');
  assert(round3.round_id === 'source_refresh_and_place_case_expansion_round3_2026_09_04', 'Historie round 3 har uventet round_id');
  assert(doc.schema === 'history_go_historie_maintenance_round_v1', 'Historie round 4 bruker feil schema');
  assert(doc.subject_id === 'historie', 'Historie round 4 bruker feil subject_id');
  assert(doc.round_id === 'source_refresh_and_place_case_expansion_round4_2026_09_04', 'Historie round 4 har uventet round_id');
  assert(doc.baseline_main_sha === EXPECTED_BASELINE, 'Historie round 4 er ikke bundet til eksakt fersk main-baseline');
  assert(doc.checked_at === '2026-09-04' && doc.status === 'verified', 'Historie round 4 er ikke datert og verifisert');
  assert(doc.scope?.new_strict_subcategory === false && doc.scope?.place_production === false && doc.scope?.canonical_architecture_change === false && doc.scope?.maintenance_evidence_only === true, 'Historie round 4 bryter maintenance-scope');

  const historieStatus = (status.subjects || []).find((row) => row.id === 'historie');
  assert(historieStatus?.navigationStatus === 'materialized', 'Historie skal fortsatt være materialized');
  assert(historieStatus?.assessmentStatus === 'audited', 'Historie skal fortsatt være audited');
  assert(historieStatus?.editorialStatus === 'complete', 'Historie completion-status skal bevares');
  assert(historieStatus?.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'Historie maintenance-porten skal bevares');

  assert(subjectAudit.schema === 'history_go_fagverk_historie_subject_audit_v1', 'Historie subject-audit har feil schema');
  assert(subjectAudit.summary?.chapterCount === 23 && subjectAudit.summary?.domainCount === 23 && subjectAudit.summary?.emneCount === 230, 'Historie canonicale totaler har flyttet seg');
  assert(subjectAudit.summary?.curriculumPeriods === 9 && subjectAudit.summary?.curriculumCoveredPeriods === 9, 'Historie 9/9 periodedekning er brutt');
  const canonicalChapters = new Set((subjectAudit.chapters || []).map((chapter) => chapter.id));
  assert(canonicalChapters.size === 23, 'Historie skal ha 23 unike canonicale kapitler');

  const r1Targets = new Set(round1.target_chapters || []);
  const r2Targets = new Set(round2.target_chapters || []);
  const r3Targets = new Set(round3.target_chapters || []);
  const r4Targets = new Set(doc.target_chapters || []);
  assert(r1Targets.size === 5 && r2Targets.size === 5 && r3Targets.size === 5 && r4Targets.size === 5, 'Hver Historie maintenance-runde 1–4 skal ha fem målkapitler');

  const previousTargets = new Set([...r1Targets, ...r2Targets, ...r3Targets]);
  assert(previousTargets.size === 15, 'Historie round 1–3 skal samlet dekke 15 ulike kapitler');
  for (const chapterId of TARGET_CHAPTERS) {
    assert(r4Targets.has(chapterId), `Mangler Historie round-4-målkapittel ${chapterId}`);
    assert(canonicalChapters.has(chapterId), `${chapterId}: ukjent canonicalt Historie-kapittel`);
    assert(fs.existsSync(abs(`${HISTORIE_ROOT}/${chapterId}.json`)), `${chapterId}: mangler canonical kapittelfil`);
    assert(!previousTargets.has(chapterId), `${chapterId}: round 4 overlapper tidligere runde`);
  }
  const combinedTargets = new Set([...previousTargets, ...r4Targets]);
  assert(combinedTargets.size === 20, 'Historie round 1–4 skal samlet dekke 20 ulike kapitler');
  const remainingChapters = [...canonicalChapters].filter((id) => !combinedTargets.has(id)).sort();
  assert(remainingChapters.length === 3, 'Historie skal ha nøyaktig tre udekkede maintenance-kapitler etter round 4');
  const expectedRemaining = [...EXPECTED_REMAINING_CHAPTERS].sort();
  assert(JSON.stringify(remainingChapters) === JSON.stringify(expectedRemaining), `Uventet round-5-rest: ${remainingChapters.join(', ')}`);

  const editorialBaseline = collectEditorialBaseline(editorialProfiles);
  assert(editorialBaseline.caseAnchorCount === 54, 'Historie editorial baseline skal fortsatt ha 54 caseankere');
  const r1Places = placeIdsFromCases(round1);
  const r2Places = placeIdsFromCases(round2);
  const r3Places = placeIdsFromCases(round3);
  assert(r1Places.size === 5 && r2Places.size === 5 && r3Places.size === 5, 'Historie round 1–3 skal ha fem nye steder hver');
  const previousPlaces = new Set([...r1Places, ...r2Places, ...r3Places]);
  assert(previousPlaces.size === 15, 'Historie round 1–3 skal ha 15 ulike maintenance-steder');

  const refreshes = doc.source_refresh || [];
  const cases = doc.cases || [];
  assert(refreshes.length === 10, 'Historie round 4 skal ha nøyaktig 10 kildekontroller');
  assert(cases.length === 5, 'Historie round 4 skal ha nøyaktig fem case');
  const previousSourceIds = new Set([
    ...(round1.source_refresh || []),
    ...(round2.source_refresh || []),
    ...(round3.source_refresh || [])
  ].map((source) => source.id));
  const refreshIds = new Set();
  const publishers = new Set();
  for (const source of refreshes) {
    assert(text(source.id) && !refreshIds.has(source.id), `Duplisert/tom Historie round-4-kilde-ID: ${source.id}`);
    assert(!previousSourceIds.has(source.id), `${source.id}: source-id gjenbrukes fra tidligere round`);
    refreshIds.add(source.id);
    publishers.add(text(source.publisher));
    assert(REQUIRED_SOURCE_IDS.has(source.id), `${source.id}: uventet round-4-kilde`);
    assert(/^https:\/\//.test(text(source.url)), `${source.id}: URL skal bruke https`);
    assert(text(source.source_location).length >= 90, `${source.id}: source_location er for svak`);
    assert(source.health === 'verified_live', `${source.id}: source health er ikke verified_live`);
    assert(text(source.authority).length >= 8, `${source.id}: authority mangler`);
    assert(Array.isArray(source.chapter_ids) && source.chapter_ids.length === 1 && TARGET_CHAPTERS.has(source.chapter_ids[0]), `${source.id}: feil chapter binding`);
  }
  for (const id of REQUIRED_SOURCE_IDS) assert(refreshIds.has(id), `Mangler obligatorisk Historie round-4-kilde ${id}`);
  assert(publishers.size >= 8, 'Historie round 4 skal ha minst åtte utgiveridentiteter');

  const canonicalPlaceIds = collectCanonicalPlaceIds();
  const usedPlaces = new Set();
  const usedSources = new Set();
  const usedChapters = new Set();
  const caseIds = new Set();
  for (const item of cases) {
    assert(text(item.id) && !caseIds.has(item.id), `Duplisert/tom Historie round-4-case-ID: ${item.id}`);
    caseIds.add(item.id);
    assert(text(item.case_claim).length >= 420, `${item.id}: case_claim er for kort`);
    assert(TARGET_CHAPTERS.has(item.chapter_id) && !usedChapters.has(item.chapter_id), `${item.id}: ugyldig eller duplisert kapittel`);
    usedChapters.add(item.chapter_id);
    assert(Array.isArray(item.source_ids) && item.source_ids.length >= 2, `${item.id}: caset må ha minst to kilder`);
    for (const sourceId of item.source_ids) {
      assert(refreshIds.has(sourceId), `${item.id}: ukjent source ${sourceId}`);
      usedSources.add(sourceId);
    }
    assert(Array.isArray(item.place_ids) && item.place_ids.length === 1, `${item.id}: caset skal ha ett presist stedanker`);
    const placeId = item.place_ids[0];
    assert(canonicalPlaceIds.has(placeId), `${item.id}: ukjent canonical place_id ${placeId}`);
    assert(!editorialBaseline.placeIds.has(placeId), `${item.id}: ${placeId} finnes allerede i 54-anchor-baselinen`);
    assert(!previousPlaces.has(placeId), `${item.id}: ${placeId} finnes i tidligere maintenance-round`);
    assert(!usedPlaces.has(placeId), `${item.id}: ${placeId} brukes flere ganger i round 4`);
    usedPlaces.add(placeId);
    assert(Array.isArray(item.analysis_questions) && item.analysis_questions.length === 3 && item.analysis_questions.every((q) => text(q).length >= 115), `${item.id}: analysespørsmålene er for svake`);
  }
  assert(usedChapters.size === 5 && usedSources.size === 10 && usedPlaces.size === 5, 'Historie round 4 mangler full case/source/place-dekning');
  for (const id of REQUIRED_PLACE_IDS) assert(usedPlaces.has(id), `Historie round 4 mangler obligatorisk sted ${id}`);

  const gates = doc.quality_gates || {};
  for (const gate of REQUIRED_GATES) assert(gates[gate] === true, `Historie round 4 mangler grønn kvalitetsport: ${gate}`);

  const projectedUnique = new Set([
    ...editorialBaseline.placeIds,
    ...r1Places,
    ...r2Places,
    ...r3Places,
    ...usedPlaces
  ]);
  return {
    schema: 'history_go_historie_maintenance_audit_v1',
    status: 'passed',
    round: 4,
    round_id: doc.round_id,
    baseline_main_sha: doc.baseline_main_sha,
    source_refresh_count: refreshes.length,
    publisher_count: publishers.size,
    case_count: cases.length,
    chapter_count: usedChapters.size,
    combined_maintenance_chapter_count: combinedTargets.size,
    remaining_maintenance_chapter_count: remainingChapters.length,
    remaining_maintenance_chapters: remainingChapters,
    canonical_chapter_count: canonicalChapters.size,
    baseline_editorial_case_anchor_count: editorialBaseline.caseAnchorCount,
    round1_new_place_count: r1Places.size,
    round2_new_place_count: r2Places.size,
    round3_new_place_count: r3Places.size,
    round4_new_place_count: usedPlaces.size,
    projected_case_anchor_count: editorialBaseline.caseAnchorCount + (round1.cases || []).length + (round2.cases || []).length + (round3.cases || []).length + cases.length,
    projected_unique_place_count: projectedUnique.size,
    gates: {
      source_health: true,
      canonical_chapter_identity: true,
      canonical_place_identity: true,
      chapter_non_overlap_previous_rounds: true,
      place_non_overlap_editorial_and_previous_rounds: true,
      case_source_trace: true,
      claim_provenance_preserved: true,
      historiography_and_theory_integrity_scope_unchanged: true,
      subject_architecture_unchanged: true,
      completion_status_preserved: true,
      archaeology_bounded: true,
      state_formation_not_localized_to_palace: true,
      memorial_retrojection_bounded: true,
      museum_location_bounded: true,
      statue_evidence_bounded: true,
      no_strict_subcategory: true,
      no_place_production: true
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(auditHistorieSourceRefreshPlaceCaseExpansionRound4(), null, 2)}\n`);
}
