#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUND1_FILE = 'data/fagverk/by/maintenance/source-refresh-place-case-expansion-round1-2026-09-04.json';
const ROUND2_FILE = 'data/fagverk/by/maintenance/source-refresh-place-case-expansion-round2-2026-09-04.json';
const ROUND3_FILE = 'data/fagverk/by/maintenance/source-refresh-place-case-expansion-round3-2026-09-04.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const COMPLETE_REPORT = 'reports/fagverk/by-complete-audit.json';
const BY_ROOT = 'data/fagverk/by';
const PLACE_ROOT = 'data/places/by/oslo';
const EXPECTED_BASELINE = 'b402ef14f5d3fd95e3bd1ea5fbd850df6cfba25f';

const abs = (value) => path.join(ROOT, value);
const readJson = (value) => JSON.parse(fs.readFileSync(abs(value), 'utf8'));
const text = (value) => String(value ?? '').trim();
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const TARGET_CHAPTERS = new Set([
  'byliv-offentlige-rom',
  'byliv-sosial-offentlighet',
  'byliv-hendelser-midlertidighet',
  'byliv-stemning-mikrokomfort',
  'byliv-rytmer-miks-konflikt',
  'arkitektur-type-skala-byform',
  'arkitektur-gatekant-makt-ombruk'
]);

const REQUIRED_SOURCE_IDS = new Set([
  'bymaint3_oslo_levende_oslo_2024',
  'bymaint3_oslo_architecture_meeting_places',
  'bymaint3_dibk_tek17_outdoor_universal',
  'bymaint3_oslo_byliv_grant_2026',
  'bymaint3_oslo_public_space_rental_2026',
  'bymaint3_police_arrangements_current',
  'bymaint3_oslo_oslometer_pilot_2026',
  'bymaint3_oslo_lakkegata_pocket_park',
  'bymaint3_oslo_highrise_strategy',
  'bymaint3_oslo_kpa_development_areas_2026',
  'bymaint3_oslo_architecture_policy_reuse',
  'bymaint3_oslo_architecture_flexible_use',
  'bymaint3_riksantikvaren_reuse',
  'bymaint3_oslomet_public_space_research_2026'
]);

function collectCanonicalPlaceIds() {
  const ids = new Set();
  const walk = (dirPath) => {
    if (!fs.existsSync(dirPath)) return;
    for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
      const entryPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
      try {
        const doc = JSON.parse(fs.readFileSync(entryPath, 'utf8'));
        if (text(doc.id)) ids.add(text(doc.id));
      } catch {
        // Canonical identity is proved only by parseable place documents.
      }
    }
  };
  walk(abs(PLACE_ROOT));
  return ids;
}

function placeIdsFromCases(doc) {
  const ids = new Set();
  for (const item of doc.cases || []) {
    for (const placeId of item.place_ids || []) ids.add(placeId);
  }
  return ids;
}

function sourceIds(doc) {
  return new Set((doc.source_refresh || []).map((source) => source.id));
}

export function auditBySourceRefreshPlaceCaseExpansionRound3() {
  const round1 = readJson(ROUND1_FILE);
  const round2 = readJson(ROUND2_FILE);
  const doc = readJson(ROUND3_FILE);
  const status = readJson(STATUS_FILE);
  const complete = readJson(COMPLETE_REPORT);

  assert(round1.schema === 'history_go_by_maintenance_round_v1', 'By maintenance round 1 har feil schema');
  assert(round1.round_id === 'source_refresh_and_place_case_expansion_round1_2026_09_04', 'By maintenance round 1 har uventet round_id');
  assert(round2.schema === 'history_go_by_maintenance_round_v1', 'By maintenance round 2 har feil schema');
  assert(round2.round_id === 'source_refresh_and_place_case_expansion_round2_2026_09_04', 'By maintenance round 2 har uventet round_id');
  assert(doc.schema === 'history_go_by_maintenance_round_v1', 'By maintenance round 3 bruker feil schema');
  assert(doc.subject_id === 'by', 'By maintenance round 3 bruker feil subject_id');
  assert(doc.round_id === 'source_refresh_and_place_case_expansion_round3_2026_09_04', 'By maintenance round 3 bruker feil round_id');
  assert(doc.baseline_main_sha === EXPECTED_BASELINE, 'By maintenance round 3 er ikke bundet til eksakt fersk main-baseline');
  assert(doc.checked_at === '2026-09-04' && doc.status === 'verified', 'By maintenance round 3 er ikke datert og verifisert');

  assert(doc.scope?.new_strict_subcategory === false, 'By maintenance round 3 skal ikke opprette ny strict-underkategori');
  assert(doc.scope?.place_production === false, 'By maintenance round 3 skal ikke være stedsproduksjon');
  assert(doc.scope?.canonical_architecture_change === false, 'By maintenance round 3 skal ikke endre canonical fagarkitektur');

  const byStatus = (status.subjects || []).find((row) => row.id === 'by');
  assert(byStatus?.navigationStatus === 'materialized', 'By skal fortsatt være materialized');
  assert(byStatus?.assessmentStatus === 'audited', 'By skal fortsatt være audited');
  assert(byStatus?.editorialStatus === 'complete', 'By completion-status skal bevares');
  assert(byStatus?.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'By skal fortsatt peke til maintenance-porten');

  assert(complete.schema === 'history_go_fagverk_by_complete_audit_v1', 'By complete-audit har feil schema');
  assert(complete.status === 'complete', 'By complete-audit er ikke complete');
  assert(complete.summary?.chapterCount === 17, 'By complete-audit skal fortsatt ha 17 kapitler');
  assert(complete.summary?.uniquePlaceCount === 20, 'By maintenance forventer canonical complete-baseline på 20 unike steder');

  const round1Targets = new Set(round1.target_chapters || []);
  const round2Targets = new Set(round2.target_chapters || []);
  const declaredTargets = new Set(doc.target_chapters || []);
  assert(declaredTargets.size === TARGET_CHAPTERS.size, 'By maintenance round 3 skal deklarere nøyaktig sju målkapitler');
  for (const chapterId of TARGET_CHAPTERS) {
    assert(declaredTargets.has(chapterId), `Mangler round-3-målkapittel ${chapterId}`);
    assert(fs.existsSync(abs(`${BY_ROOT}/${chapterId}.json`)), `Ukjent canonicalt By-kapittel ${chapterId}`);
    assert(!round1Targets.has(chapterId), `${chapterId}: round 3 overlapper round 1`);
    assert(!round2Targets.has(chapterId), `${chapterId}: round 3 overlapper round 2`);
  }
  for (const chapterId of round1Targets) assert(!round2Targets.has(chapterId), `${chapterId}: round 1 og 2 overlapper`);

  const combinedTargets = new Set([...round1Targets, ...round2Targets, ...declaredTargets]);
  assert(combinedTargets.size === 17, 'By maintenance round 1 + 2 + 3 skal samlet dekke 17 ulike kapitler');
  const canonicalChapterIds = new Set((complete.canonicalDomainCoverage || []).flatMap((row) => row.chapterIds || []));
  assert(canonicalChapterIds.size === 17, 'Complete-auditen skal deklarere 17 canonicale kapittel-ID-er');
  assert(combinedTargets.size === canonicalChapterIds.size, 'Maintenance-reconciliation har feil kapittelantall');
  for (const chapterId of canonicalChapterIds) assert(combinedTargets.has(chapterId), `Maintenance-reconciliation mangler canonicalt kapittel ${chapterId}`);
  for (const chapterId of combinedTargets) assert(canonicalChapterIds.has(chapterId), `Maintenance-reconciliation inneholder ikke-canonicalt kapittel ${chapterId}`);

  const refreshes = doc.source_refresh || [];
  const cases = doc.cases || [];
  assert(refreshes.length === REQUIRED_SOURCE_IDS.size, 'By maintenance round 3 skal ha nøyaktig 14 kildekontroller');
  assert(cases.length === 7, 'By maintenance round 3 skal ha nøyaktig sju nye case');

  const priorSourceIds = new Set([...sourceIds(round1), ...sourceIds(round2)]);
  const refreshIds = new Set();
  const publishers = new Set();
  for (const source of refreshes) {
    assert(text(source.id) && !refreshIds.has(source.id), `Duplisert eller tom round-3-kilde-ID: ${source.id}`);
    assert(!priorSourceIds.has(source.id), `${source.id}: round 3 gjenbruker en tidligere maintenance-kilde-ID`);
    refreshIds.add(source.id);
    publishers.add(text(source.publisher));
    assert(/^https:\/\//.test(text(source.url)), `${source.id}: URL skal bruke https`);
    assert(text(source.publisher).length >= 3, `${source.id}: mangler publisher`);
    assert(text(source.source_location).length >= 55, `${source.id}: source_location er for svak`);
    assert(source.health === 'verified_live', `${source.id}: kildehelse er ikke verified_live`);
    assert(Array.isArray(source.chapter_ids) && source.chapter_ids.length >= 1, `${source.id}: mangler chapter_ids`);
    for (const chapterId of source.chapter_ids) {
      assert(TARGET_CHAPTERS.has(chapterId), `${source.id}: kilde ligger utenfor round-3-målkapitlene`);
    }
  }
  for (const id of REQUIRED_SOURCE_IDS) assert(refreshIds.has(id), `Mangler obligatorisk round-3-kilde ${id}`);
  assert(publishers.size >= 5, 'Round 3 skal ha minst fem institusjonelle utgivere');

  const canonicalPlaceIds = collectCanonicalPlaceIds();
  const completePlaces = new Set(complete.coveredPlaceIds || []);
  const round1Places = placeIdsFromCases(round1);
  const round2Places = placeIdsFromCases(round2);
  for (const placeId of round1Places) assert(!round2Places.has(placeId), `${placeId}: round 1 og 2 har stedsoverlapp`);

  const caseIds = new Set();
  const usedSources = new Set();
  const usedPlaces = new Set();
  const usedChapters = new Set();

  for (const item of cases) {
    assert(text(item.id) && !caseIds.has(item.id), `Duplisert eller tom round-3-case-ID: ${item.id}`);
    caseIds.add(item.id);
    assert(text(item.title), `${item.id}: mangler tittel`);
    assert(text(item.case_claim).length >= 220, `${item.id}: case_claim er for kort`);
    assert(TARGET_CHAPTERS.has(item.chapter_id), `${item.id}: ukjent round-3-målkapittel ${item.chapter_id}`);
    assert(!usedChapters.has(item.chapter_id), `${item.id}: round 3 har flere case for samme målkapittel ${item.chapter_id}`);
    usedChapters.add(item.chapter_id);

    assert(Array.isArray(item.source_ids) && item.source_ids.length >= 2, `${item.id}: caset skal bruke minst to round-3-kilder`);
    for (const sourceId of item.source_ids) {
      assert(refreshIds.has(sourceId), `${item.id}: ukjent round-3-kilde ${sourceId}`);
      usedSources.add(sourceId);
    }

    assert(Array.isArray(item.place_ids) && item.place_ids.length >= 1, `${item.id}: caset mangler stedskobling`);
    for (const placeId of item.place_ids) {
      assert(canonicalPlaceIds.has(placeId), `${item.id}: ukjent canonical place_id ${placeId}`);
      assert(!completePlaces.has(placeId), `${item.id}: ${placeId} finnes allerede i By complete-audit`);
      assert(!round1Places.has(placeId), `${item.id}: ${placeId} ble allerede lagt til i maintenance round 1`);
      assert(!round2Places.has(placeId), `${item.id}: ${placeId} ble allerede lagt til i maintenance round 2`);
      usedPlaces.add(placeId);
    }

    assert(Array.isArray(item.analysis_questions) && item.analysis_questions.length === 3, `${item.id}: caset skal ha nøyaktig tre analysespørsmål`);
    assert(item.analysis_questions.every((question) => text(question).length >= 70), `${item.id}: analysespørsmålene er for svake`);
  }

  assert(usedChapters.size === TARGET_CHAPTERS.size, 'Round 3 skal dekke alle sju målkapitler nøyaktig én gang');
  for (const chapterId of TARGET_CHAPTERS) assert(usedChapters.has(chapterId), `Round 3 mangler ${chapterId}`);
  assert(usedSources.size === refreshIds.size, 'Alle round-3-kilder skal brukes av minst ett case');
  assert(usedPlaces.size >= 8, 'Round 3 skal legge til minst åtte nye canonicale By-steder');

  const gates = doc.quality_gates || {};
  for (const gate of [
    'all_sources_https',
    'all_sources_authoritative_or_institutional',
    'all_cases_source_bound',
    'all_cases_place_bound',
    'all_case_places_canonical',
    'all_case_places_new_to_complete_audit',
    'round3_chapters_disjoint_from_round1_and_round2',
    'round3_places_disjoint_from_round1_and_round2',
    'all_17_chapters_reconciled_across_rounds',
    'claim_provenance_preserved',
    'theory_integrity_scope_unchanged',
    'canonical_subject_architecture_unchanged',
    'completion_status_preserved',
    'field_observation_not_treated_as_statistical_legal_or_causal_proof'
  ]) assert(gates[gate] === true, `By maintenance round 3 mangler grønn kvalitetsport: ${gate}`);

  const projectedUniquePlaceCount = complete.summary.uniquePlaceCount + round1Places.size + round2Places.size + usedPlaces.size;
  assert(projectedUniquePlaceCount >= 41, 'Samlet By maintenance skal dokumentere minst 41 unike stedscase etter round 3');

  return {
    schema: 'history_go_by_maintenance_audit_v1',
    status: 'passed',
    round: 3,
    round_id: doc.round_id,
    baseline_main_sha: doc.baseline_main_sha,
    source_refresh_count: refreshes.length,
    publisher_count: publishers.size,
    case_count: cases.length,
    chapter_count: usedChapters.size,
    combined_maintenance_chapter_count: combinedTargets.size,
    canonical_chapter_count: canonicalChapterIds.size,
    baseline_unique_place_count: complete.summary.uniquePlaceCount,
    round1_unique_place_count: round1Places.size,
    round2_unique_place_count: round2Places.size,
    new_unique_place_count: usedPlaces.size,
    projected_unique_place_count: projectedUniquePlaceCount,
    gates: {
      source_health: true,
      canonical_chapter_identity: true,
      canonical_place_identity: true,
      full_17_of_17_chapter_reconciliation: true,
      chapter_non_overlap_prior_rounds: true,
      place_non_overlap_prior_rounds: true,
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
  const report = auditBySourceRefreshPlaceCaseExpansionRound3();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
