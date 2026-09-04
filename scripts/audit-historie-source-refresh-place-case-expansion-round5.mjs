#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUND_FILES = [
  'data/fagverk/historie/maintenance/source-refresh-place-case-expansion-round1-2026-09-04.json',
  'data/fagverk/historie/maintenance/source-refresh-place-case-expansion-round2-2026-09-04.json',
  'data/fagverk/historie/maintenance/source-refresh-place-case-expansion-round3-2026-09-04.json',
  'data/fagverk/historie/maintenance/source-refresh-place-case-expansion-round4-2026-09-04.json',
  'data/fagverk/historie/maintenance/source-refresh-place-case-expansion-round5-2026-09-04.json'
];
const STATUS_FILE = 'data/fagverk/subject_status.json';
const SUBJECT_AUDIT_FILE = 'reports/fagverk/historie-subject-audit.json';
const EDITORIAL_PROFILES_FILE = 'data/fag/historie/editorial_profiles_historie_v1.json';
const HISTORIE_ROOT = 'data/fagverk/historie';
const PLACE_ROOT = 'data/places';
const EXPECTED_BASELINE = 'a4c47ad3b8a2898b0a4b9299effefacc3184e39f';

const TARGET_CHAPTERS = new Set([
  'samisk_urfolkshistorie',
  'offentlighet_mobilisering_bevegelser',
  'kald_krig_etterkrig'
]);
const REQUIRED_SOURCE_IDS = new Set([
  'histmaint5_norsk_folkemuseum_baastede',
  'histmaint5_sametinget_museer_baastede',
  'histmaint5_stortinget_protest_history',
  'histmaint5_stortinget_eidsvolls_plass',
  'histmaint5_fhm_forsvarsmuseet',
  'histmaint5_forsvaret_nato_2026'
]);
const REQUIRED_PLACE_IDS = new Set([
  'norsk_folkemuseum',
  'eidsvolls_plass',
  'forsvarsmuseet'
]);
const REQUIRED_GATES = [
  'all_sources_https',
  'all_sources_authoritative_or_institutional',
  'all_cases_source_bound',
  'all_cases_place_bound',
  'all_case_places_canonical',
  'all_case_places_new_to_editorial_baseline',
  'round5_chapters_disjoint_from_round1_round2_round3_round4',
  'round5_places_disjoint_from_round1_round2_round3_round4',
  'all_23_canonical_chapters_covered',
  'maintenance_cycle_reconciled',
  'claim_provenance_preserved',
  'historiography_and_theory_integrity_scope_unchanged',
  'canonical_subject_architecture_unchanged',
  'completion_status_preserved',
  'indigenous_self_representation_preserved',
  'protest_place_not_equated_with_entire_movement',
  'museum_not_equated_with_entire_cold_war'
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
    try { visit(JSON.parse(fs.readFileSync(entryPath, 'utf8'))); } catch { /* canonical parseable docs only */ }
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
  for (const item of doc.cases || []) for (const id of item.place_ids || []) ids.add(id);
  return ids;
}

export function auditHistorieSourceRefreshPlaceCaseExpansionRound5() {
  const rounds = ROUND_FILES.map(readJson);
  const [round1, round2, round3, round4, doc] = rounds;
  const status = readJson(STATUS_FILE);
  const subjectAudit = readJson(SUBJECT_AUDIT_FILE);
  const editorialProfiles = readJson(EDITORIAL_PROFILES_FILE);

  const expectedRoundIds = [1, 2, 3, 4, 5].map((round) => `source_refresh_and_place_case_expansion_round${round}_2026_09_04`);
  rounds.forEach((round, index) => assert(round.round_id === expectedRoundIds[index], `Historie round ${index + 1} har uventet round_id`));
  assert(doc.schema === 'history_go_historie_maintenance_round_v1', 'Historie round 5 bruker feil schema');
  assert(doc.subject_id === 'historie', 'Historie round 5 bruker feil subject_id');
  assert(doc.baseline_main_sha === EXPECTED_BASELINE, 'Historie round 5 er ikke bundet til eksakt fersk main-baseline');
  assert(doc.checked_at === '2026-09-04' && doc.status === 'verified', 'Historie round 5 er ikke datert og verifisert');
  assert(doc.scope?.final_reconciliation_round === true, 'Historie round 5 skal være eksplisitt sluttreconciliation');
  assert(doc.scope?.new_strict_subcategory === false && doc.scope?.place_production === false && doc.scope?.canonical_architecture_change === false && doc.scope?.maintenance_evidence_only === true, 'Historie round 5 bryter maintenance-scope');

  const historieStatus = (status.subjects || []).find((row) => row.id === 'historie');
  assert(historieStatus?.navigationStatus === 'materialized', 'Historie skal fortsatt være materialized');
  assert(historieStatus?.assessmentStatus === 'audited', 'Historie skal fortsatt være audited');
  assert(historieStatus?.editorialStatus === 'complete', 'Historie completion-status skal bevares');
  assert(historieStatus?.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'Historie maintenance-porten skal bevares etter 23/23-reconciliation');

  assert(subjectAudit.schema === 'history_go_fagverk_historie_subject_audit_v1', 'Historie subject-audit har feil schema');
  assert(subjectAudit.summary?.chapterCount === 23 && subjectAudit.summary?.domainCount === 23 && subjectAudit.summary?.emneCount === 230, 'Historie canonicale totaler har flyttet seg');
  assert(subjectAudit.summary?.curriculumPeriods === 9 && subjectAudit.summary?.curriculumCoveredPeriods === 9, 'Historie 9/9 periodedekning er brutt');
  const canonicalChapters = new Set((subjectAudit.chapters || []).map((chapter) => chapter.id));
  assert(canonicalChapters.size === 23, 'Historie skal ha 23 unike canonicale kapitler');
  for (const chapterId of canonicalChapters) assert(fs.existsSync(abs(`${HISTORIE_ROOT}/${chapterId}.json`)), `${chapterId}: mangler canonical kapittelfil`);

  const targetSets = rounds.map((round) => new Set(round.target_chapters || []));
  assert(targetSets[0].size === 5 && targetSets[1].size === 5 && targetSets[2].size === 5 && targetSets[3].size === 5 && targetSets[4].size === 3, 'Historie maintenance-rundene skal ha kapittelfordelingen 5+5+5+5+3');
  const previousTargets = new Set([...targetSets[0], ...targetSets[1], ...targetSets[2], ...targetSets[3]]);
  assert(previousTargets.size === 20, 'Historie round 1–4 skal samlet dekke 20 ulike kapitler');
  for (const chapterId of TARGET_CHAPTERS) {
    assert(targetSets[4].has(chapterId), `Mangler Historie round-5-målkapittel ${chapterId}`);
    assert(canonicalChapters.has(chapterId), `${chapterId}: ukjent canonicalt Historie-kapittel`);
    assert(!previousTargets.has(chapterId), `${chapterId}: round 5 overlapper tidligere runde`);
  }
  const combinedTargets = new Set([...previousTargets, ...targetSets[4]]);
  assert(combinedTargets.size === 23, 'Historie round 1–5 skal samlet dekke 23 ulike kapitler');
  assert([...canonicalChapters].every((id) => combinedTargets.has(id)), 'Historie maintenance-syklusen dekker ikke alle canonicale kapitler');
  assert([...combinedTargets].every((id) => canonicalChapters.has(id)), 'Historie maintenance-syklusen inneholder ukjent kapittel');
  const remainingChapters = [...canonicalChapters].filter((id) => !combinedTargets.has(id));
  assert(remainingChapters.length === 0, `Historie har fortsatt udekkede maintenance-kapitler: ${remainingChapters.join(', ')}`);

  const editorialBaseline = collectEditorialBaseline(editorialProfiles);
  assert(editorialBaseline.caseAnchorCount === 54, 'Historie editorial baseline skal fortsatt ha 54 caseankere');
  const roundPlaces = rounds.map(placeIdsFromCases);
  assert(roundPlaces[0].size === 5 && roundPlaces[1].size === 5 && roundPlaces[2].size === 5 && roundPlaces[3].size === 5 && roundPlaces[4].size === 3, 'Historie maintenance-rundene skal ha stedfordelingen 5+5+5+5+3');
  const previousPlaces = new Set([...roundPlaces[0], ...roundPlaces[1], ...roundPlaces[2], ...roundPlaces[3]]);
  assert(previousPlaces.size === 20, 'Historie round 1–4 skal ha 20 ulike maintenance-steder');

  const refreshes = doc.source_refresh || [];
  const cases = doc.cases || [];
  assert(refreshes.length === 6, 'Historie round 5 skal ha nøyaktig seks kildekontroller');
  assert(cases.length === 3, 'Historie round 5 skal ha nøyaktig tre case');
  const previousSourceIds = new Set(rounds.slice(0, 4).flatMap((round) => round.source_refresh || []).map((source) => source.id));
  const refreshIds = new Set();
  const publishers = new Set();
  for (const source of refreshes) {
    assert(text(source.id) && !refreshIds.has(source.id), `Duplisert/tom Historie round-5-kilde-ID: ${source.id}`);
    assert(!previousSourceIds.has(source.id), `${source.id}: source-id gjenbrukes fra tidligere round`);
    refreshIds.add(source.id);
    publishers.add(text(source.publisher));
    assert(REQUIRED_SOURCE_IDS.has(source.id), `${source.id}: uventet round-5-kilde`);
    assert(/^https:\/\//.test(text(source.url)), `${source.id}: URL skal bruke https`);
    assert(text(source.source_location).length >= 100, `${source.id}: source_location er for svak`);
    assert(source.health === 'verified_live', `${source.id}: source health er ikke verified_live`);
    assert(text(source.authority).length >= 8, `${source.id}: authority mangler`);
    assert(Array.isArray(source.chapter_ids) && source.chapter_ids.length === 1 && TARGET_CHAPTERS.has(source.chapter_ids[0]), `${source.id}: feil chapter binding`);
  }
  for (const id of REQUIRED_SOURCE_IDS) assert(refreshIds.has(id), `Mangler obligatorisk Historie round-5-kilde ${id}`);
  assert(publishers.size >= 5, 'Historie round 5 skal ha minst fem utgiveridentiteter');

  const canonicalPlaceIds = collectCanonicalPlaceIds();
  const usedPlaces = new Set();
  const usedSources = new Set();
  const usedChapters = new Set();
  const caseIds = new Set();
  for (const item of cases) {
    assert(text(item.id) && !caseIds.has(item.id), `Duplisert/tom Historie round-5-case-ID: ${item.id}`);
    caseIds.add(item.id);
    assert(text(item.case_claim).length >= 520, `${item.id}: case_claim er for kort`);
    assert(TARGET_CHAPTERS.has(item.chapter_id) && !usedChapters.has(item.chapter_id), `${item.id}: ugyldig eller duplisert kapittel`);
    usedChapters.add(item.chapter_id);
    assert(Array.isArray(item.source_ids) && item.source_ids.length === 2, `${item.id}: sluttrunden krever nøyaktig to kildekontroller per case`);
    for (const sourceId of item.source_ids) {
      assert(refreshIds.has(sourceId), `${item.id}: ukjent source ${sourceId}`);
      usedSources.add(sourceId);
    }
    assert(Array.isArray(item.place_ids) && item.place_ids.length === 1, `${item.id}: caset skal ha ett presist stedanker`);
    const placeId = item.place_ids[0];
    assert(canonicalPlaceIds.has(placeId), `${item.id}: ukjent canonical place_id ${placeId}`);
    assert(!editorialBaseline.placeIds.has(placeId), `${item.id}: ${placeId} finnes allerede i 54-anchor-baselinen`);
    assert(!previousPlaces.has(placeId), `${item.id}: ${placeId} finnes i tidligere maintenance-round`);
    assert(!usedPlaces.has(placeId), `${item.id}: ${placeId} brukes flere ganger i round 5`);
    usedPlaces.add(placeId);
    assert(Array.isArray(item.analysis_questions) && item.analysis_questions.length === 3 && item.analysis_questions.every((q) => text(q).length >= 130), `${item.id}: analysespørsmålene er for svake`);
  }
  assert(usedChapters.size === 3 && usedSources.size === 6 && usedPlaces.size === 3, 'Historie round 5 mangler full case/source/place-dekning');
  for (const id of REQUIRED_PLACE_IDS) assert(usedPlaces.has(id), `Historie round 5 mangler obligatorisk sted ${id}`);

  const gates = doc.quality_gates || {};
  for (const gate of REQUIRED_GATES) assert(gates[gate] === true, `Historie round 5 mangler grønn kvalitetsport: ${gate}`);

  const projectedUnique = new Set([
    ...editorialBaseline.placeIds,
    ...roundPlaces[0],
    ...roundPlaces[1],
    ...roundPlaces[2],
    ...roundPlaces[3],
    ...usedPlaces
  ]);
  const totalMaintenanceCases = rounds.reduce((sum, round) => sum + (round.cases || []).length, 0);
  assert(totalMaintenanceCases === 23, 'Historie maintenance-syklusen skal ha ett nytt case per canonicalt kapittel totalt');

  return {
    schema: 'history_go_historie_maintenance_audit_v1',
    status: 'passed',
    round: 5,
    round_id: doc.round_id,
    baseline_main_sha: doc.baseline_main_sha,
    source_refresh_count: refreshes.length,
    publisher_count: publishers.size,
    case_count: cases.length,
    chapter_count: usedChapters.size,
    maintenance_cycle_round_count: rounds.length,
    total_maintenance_case_count: totalMaintenanceCases,
    combined_maintenance_chapter_count: combinedTargets.size,
    remaining_maintenance_chapter_count: remainingChapters.length,
    canonical_chapter_count: canonicalChapters.size,
    baseline_editorial_case_anchor_count: editorialBaseline.caseAnchorCount,
    baseline_editorial_unique_place_count: editorialBaseline.placeIds.size,
    prior_round_new_place_count: previousPlaces.size,
    round5_new_place_count: usedPlaces.size,
    projected_case_anchor_count: editorialBaseline.caseAnchorCount + totalMaintenanceCases,
    projected_unique_place_count: projectedUnique.size,
    maintenance_cycle_reconciled: true,
    gates: {
      source_health: true,
      canonical_chapter_identity: true,
      canonical_place_identity: true,
      chapter_non_overlap_previous_rounds: true,
      place_non_overlap_editorial_and_previous_rounds: true,
      case_source_trace: true,
      all_23_canonical_chapters_covered: true,
      claim_provenance_preserved: true,
      historiography_and_theory_integrity_scope_unchanged: true,
      subject_architecture_unchanged: true,
      completion_status_preserved: true,
      indigenous_self_representation_preserved: true,
      protest_place_scope_bounded: true,
      military_museum_scope_bounded: true,
      no_strict_subcategory: true,
      no_place_production: true
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(auditHistorieSourceRefreshPlaceCaseExpansionRound5(), null, 2)}\n`);
}
