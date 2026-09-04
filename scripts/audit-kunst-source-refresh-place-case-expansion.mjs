#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUND_FILE = 'data/fagverk/kunst/maintenance/source-refresh-place-case-expansion-round1-2026-09-04.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const COMPLETE_REPORT = 'reports/fagverk/kunst-complete-audit.json';
const KUNST_ROOT = 'data/fagverk/kunst';
const PLACE_ROOT = 'data/places/kunst/oslo';
const EXPECTED_BASELINE = 'b701979e50e99cb54c481bf1fcd6b7f640881222';

const TARGET_CHAPTERS = new Set([
  'felt-og-institusjon',
  'produksjon-og-praksis',
  'estetisk-sprak-og-form',
  'makt-og-legitimitet',
  'publikum-og-offentlighet',
  'tid-og-transformasjon'
]);
const REQUIRED_SOURCE_IDS = new Set([
  'kunstmaint1_kunstnerforbundet_about_2026',
  'kunstmaint1_kulturdirektoratet_visningssteder_2026',
  'kunstmaint1_norske_grafikere_about',
  'kunstmaint1_norske_grafikere_originalgrafikk',
  'kunstmaint1_emanuel_vigeland_museum',
  'kunstmaint1_snl_emanuel_vigeland_2026',
  'kunstmaint1_kongehuset_kunststall_history',
  'kunstmaint1_kongehuset_trader_i_tid_2026',
  'kunstmaint1_oslo_klosterenga_current',
  'kunstmaint1_oslo_art_collection_80_2026',
  'kunstmaint1_future_library_custodianship_2026',
  'kunstmaint1_oslo_future_library_governance'
]);
const REQUIRED_PLACE_IDS = new Set([
  'kunstnerforbundet',
  'norske_grafikere',
  'emanuel_vigeland_mausoleum',
  'dronning_sonja_kunststall',
  'klosterenga_skulpturpark',
  'framtidsbiblioteket_nordmarka'
]);
const REQUIRED_GATES = [
  'all_sources_https',
  'all_sources_authoritative_or_institutional',
  'all_cases_source_bound',
  'all_cases_place_bound',
  'all_case_places_canonical',
  'all_case_places_new_to_complete_audit',
  'all_six_chapters_reconciled',
  'claim_provenance_preserved',
  'theory_integrity_scope_unchanged',
  'canonical_subject_architecture_unchanged',
  'completion_status_preserved',
  'institutional_self_description_not_treated_as_independent_criticism',
  'field_observation_not_treated_as_population_reception_evidence',
  'future_plan_not_treated_as_completed_outcome'
];

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
      visit(JSON.parse(fs.readFileSync(entryPath, 'utf8')));
    } catch {
      // Canonical identity is proved only by parseable JSON documents.
    }
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

export function auditKunstSourceRefreshPlaceCaseExpansion() {
  const doc = readJson(ROUND_FILE);
  const status = readJson(STATUS_FILE);
  const complete = readJson(COMPLETE_REPORT);

  assert(doc.schema === 'history_go_kunst_maintenance_round_v1', 'Kunst maintenance bruker feil schema');
  assert(doc.subject_id === 'kunst', 'Kunst maintenance bruker feil subject_id');
  assert(doc.round_id === 'source_refresh_and_place_case_expansion_round1_2026_09_04', 'Kunst maintenance har uventet round_id');
  assert(doc.baseline_main_sha === EXPECTED_BASELINE, 'Kunst maintenance er ikke bundet til eksakt main-baseline');
  assert(doc.checked_at === '2026-09-04' && doc.status === 'verified', 'Kunst maintenance er ikke datert og verifisert');
  assert(doc.scope?.new_strict_subcategory === false, 'Kunst maintenance skal ikke opprette ny strict-underkategori');
  assert(doc.scope?.place_production === false, 'Kunst maintenance skal ikke være stedsproduksjon');
  assert(doc.scope?.canonical_architecture_change === false, 'Kunst maintenance skal ikke endre canonical fagarkitektur');
  assert(doc.scope?.maintenance_evidence_only === true, 'Kunst maintenance skal være evidence-only vedlikehold');

  const kunstStatus = (status.subjects || []).find((row) => row.id === 'kunst');
  assert(kunstStatus?.navigationStatus === 'materialized', 'Kunst skal fortsatt være materialized');
  assert(kunstStatus?.assessmentStatus === 'audited', 'Kunst skal fortsatt være audited');
  assert(kunstStatus?.editorialStatus === 'complete', 'Kunst completion-status skal bevares');
  assert(kunstStatus?.nextGate === 'maintenance_source_refresh_and_place_case_expansion', 'Kunst maintenance-porten skal bevares');

  assert(complete.schema === 'history_go_fagverk_kunst_complete_audit_v1', 'Kunst complete-audit har feil schema');
  assert(complete.status === 'complete', 'Kunst complete-audit er ikke complete');
  assert(complete.summary?.domainCount === 6, 'Kunst complete-audit skal fortsatt ha 6 fagområder');
  assert(complete.summary?.chapterCount === 6, 'Kunst complete-audit skal fortsatt ha 6 kapitler');
  assert(complete.summary?.emneCount === 21, 'Kunst complete-audit skal fortsatt ha 21 emner');
  assert(complete.summary?.methodCount === 21, 'Kunst complete-audit skal fortsatt ha 21 metoder');
  assert(complete.summary?.uniquePlaceCount === 11, 'Kunst maintenance forventer baseline på 11 unike stedscase');

  const canonicalChapterIds = new Set((complete.canonicalDomainCoverage || []).flatMap((row) => row.chapterIds || []));
  assert(canonicalChapterIds.size === 6, 'Kunst complete-audit skal deklarere 6 canonicale kapittel-ID-er');
  const declaredTargets = new Set(doc.target_chapters || []);
  assert(declaredTargets.size === 6, 'Kunst maintenance skal deklarere nøyaktig seks målkapitler');
  for (const chapterId of TARGET_CHAPTERS) {
    assert(declaredTargets.has(chapterId), `Mangler Kunst maintenance-målkapittel ${chapterId}`);
    assert(canonicalChapterIds.has(chapterId), `${chapterId}: er ikke canonicalt Kunst-kapittel`);
    assert(fs.existsSync(abs(`${KUNST_ROOT}/${chapterId}.json`)), `${chapterId}: mangler canonical kapittelfil`);
  }
  for (const chapterId of canonicalChapterIds) assert(declaredTargets.has(chapterId), `Kunst maintenance mangler canonicalt kapittel ${chapterId}`);

  const refreshes = doc.source_refresh || [];
  const cases = doc.cases || [];
  assert(refreshes.length === 12, 'Kunst maintenance skal ha nøyaktig 12 kildekontroller');
  assert(cases.length === 6, 'Kunst maintenance skal ha nøyaktig 6 nye case');

  const refreshIds = new Set();
  const publishers = new Set();
  for (const source of refreshes) {
    assert(text(source.id) && !refreshIds.has(source.id), `Duplisert eller tom Kunst-kilde-ID: ${source.id}`);
    refreshIds.add(source.id);
    publishers.add(text(source.publisher));
    assert(REQUIRED_SOURCE_IDS.has(source.id), `${source.id}: uventet Kunst maintenance-kilde`);
    assert(/^https:\/\//.test(text(source.url)), `${source.id}: URL skal bruke https`);
    assert(text(source.publisher).length >= 3, `${source.id}: mangler publisher`);
    assert(text(source.source_location).length >= 90, `${source.id}: source_location er for svak`);
    assert(source.health === 'verified_live', `${source.id}: source health er ikke verified_live`);
    assert(text(source.authority).length >= 8, `${source.id}: authority mangler`);
    assert(Array.isArray(source.chapter_ids) && source.chapter_ids.length === 1, `${source.id}: skal bindes til nøyaktig ett kapittel`);
    assert(TARGET_CHAPTERS.has(source.chapter_ids[0]), `${source.id}: ukjent chapter binding ${source.chapter_ids[0]}`);
  }
  for (const sourceId of REQUIRED_SOURCE_IDS) assert(refreshIds.has(sourceId), `Mangler obligatorisk Kunst-kilde ${sourceId}`);
  assert(publishers.size >= 8, 'Kunst maintenance skal ha minst åtte tydelige utgiveridentiteter');

  const canonicalPlaceIds = collectCanonicalPlaceIds();
  const baselinePlaces = new Set(complete.coveredPlaceIds || []);
  assert(baselinePlaces.size === 11, 'Kunst complete-audit skal ha 11 unike baseline-steder');
  const caseIds = new Set();
  const usedSources = new Set();
  const usedPlaces = new Set();
  const usedChapters = new Set();

  for (const item of cases) {
    assert(text(item.id) && !caseIds.has(item.id), `Duplisert eller tom Kunst-case-ID: ${item.id}`);
    caseIds.add(item.id);
    assert(text(item.title).length >= 20, `${item.id}: tittel er for svak`);
    assert(text(item.case_claim).length >= 430, `${item.id}: case_claim er for kort`);
    assert(TARGET_CHAPTERS.has(item.chapter_id), `${item.id}: ukjent målkapittel ${item.chapter_id}`);
    assert(!usedChapters.has(item.chapter_id), `${item.id}: flere case bruker samme kapittel ${item.chapter_id}`);
    usedChapters.add(item.chapter_id);

    assert(Array.isArray(item.source_ids) && item.source_ids.length === 2, `${item.id}: caset skal bruke nøyaktig to kilder`);
    for (const sourceId of item.source_ids) {
      assert(refreshIds.has(sourceId), `${item.id}: ukjent source ${sourceId}`);
      usedSources.add(sourceId);
    }

    assert(Array.isArray(item.place_ids) && item.place_ids.length === 1, `${item.id}: caset skal ha ett presist stedanker`);
    const placeId = item.place_ids[0];
    assert(canonicalPlaceIds.has(placeId), `${item.id}: ukjent canonical place_id ${placeId}`);
    assert(!baselinePlaces.has(placeId), `${item.id}: ${placeId} finnes allerede i Kunst complete-audit`);
    assert(!usedPlaces.has(placeId), `${item.id}: ${placeId} brukes flere ganger`);
    usedPlaces.add(placeId);

    assert(Array.isArray(item.analysis_questions) && item.analysis_questions.length === 3, `${item.id}: caset skal ha nøyaktig tre analysespørsmål`);
    assert(item.analysis_questions.every((question) => text(question).length >= 105), `${item.id}: analysespørsmålene er for svake`);
  }

  assert(usedChapters.size === 6, 'Kunst maintenance skal dekke alle seks kapitler nøyaktig én gang');
  for (const chapterId of TARGET_CHAPTERS) assert(usedChapters.has(chapterId), `Kunst maintenance mangler ${chapterId}`);
  assert(usedSources.size === 12, 'Alle 12 Kunst-kilder skal brukes av minst ett case');
  assert(usedPlaces.size === 6, 'Kunst maintenance skal legge til nøyaktig seks nye steder');
  for (const placeId of REQUIRED_PLACE_IDS) assert(usedPlaces.has(placeId), `Kunst maintenance mangler obligatorisk sted ${placeId}`);

  const projectedUniquePlaceIds = new Set([...baselinePlaces, ...usedPlaces]);
  assert(projectedUniquePlaceIds.size === 17, 'Kunst maintenance skal projisere 11 → 17 unike stedscase');

  const gates = doc.quality_gates || {};
  for (const gate of REQUIRED_GATES) assert(gates[gate] === true, `Kunst maintenance mangler grønn kvalitetsport: ${gate}`);

  return {
    schema: 'history_go_kunst_maintenance_audit_v1',
    version: '1.0.0',
    status: 'passed',
    round: 1,
    round_id: doc.round_id,
    baseline_main_sha: doc.baseline_main_sha,
    source_refresh_count: refreshes.length,
    publisher_count: publishers.size,
    case_count: cases.length,
    chapter_count: usedChapters.size,
    canonical_chapter_count: canonicalChapterIds.size,
    baseline_unique_place_count: baselinePlaces.size,
    new_unique_place_count: usedPlaces.size,
    projected_unique_place_count: projectedUniquePlaceIds.size,
    gates: {
      source_health: true,
      canonical_chapter_identity: true,
      canonical_place_identity: true,
      full_6_of_6_chapter_reconciliation: true,
      place_non_overlap_complete_baseline: true,
      case_source_trace: true,
      claim_provenance_preserved: true,
      theory_integrity_scope_unchanged: true,
      subject_architecture_unchanged: true,
      completion_status_preserved: true,
      self_description_bounded: true,
      reception_inference_bounded: true,
      future_outcome_inference_bounded: true,
      no_strict_subcategory: true,
      no_place_production: true
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(auditKunstSourceRefreshPlaceCaseExpansion(), null, 2)}\n`);
}
