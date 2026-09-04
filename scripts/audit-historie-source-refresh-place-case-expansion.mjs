#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUND_FILE = 'data/fagverk/historie/maintenance/source-refresh-place-case-expansion-round1-2026-09-04.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const SUBJECT_AUDIT_FILE = 'reports/fagverk/historie-subject-audit.json';
const EDITORIAL_PROFILES_FILE = 'data/fag/historie/editorial_profiles_historie_v1.json';
const HISTORIE_ROOT = 'data/fagverk/historie';
const PLACE_ROOT = 'data/places';
const EXPECTED_BASELINE = '73f21ff713de281cdf22d733da12625ce8b8340d';

const TARGET_CHAPTERS = new Set([
  'historisk_tid_periodisering',
  'kilder_arkiv_spor',
  'makt_stat_institusjoner',
  'forste_verdenskrig_mellomkrig',
  'forhistorie_arkeologi'
]);

const REQUIRED_SOURCE_IDS = new Set([
  'histmaint1_oslo_museum_hammersborg_1902',
  'histmaint1_oslo_byleksikon_hammersborg',
  'histmaint1_oslo_kommune_waisenhuset',
  'histmaint1_lokalhistoriewiki_waisenhuset',
  'histmaint1_oslo_kommune_gamle_radhus',
  'histmaint1_domstol_hoyesterett_1815',
  'histmaint1_norges_bank_1914_1918',
  'histmaint1_norges_bank_1929_1940',
  'histmaint1_mjaerum_ekeberg_2009',
  'histmaint1_riksantikvaren_archaeology_2026'
]);

const REQUIRED_PLACE_IDS = new Set([
  'hammersborg_torg',
  'waisenhuset_kongens_gate',
  'gamle_radhus',
  'bankplassen',
  'ekeberg_helleristninger'
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
      // Non-parseable files cannot prove canonical identity and are ignored here.
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

export function auditHistorieSourceRefreshPlaceCaseExpansion() {
  const doc = readJson(ROUND_FILE);
  const status = readJson(STATUS_FILE);
  const subjectAudit = readJson(SUBJECT_AUDIT_FILE);
  const editorialProfiles = readJson(EDITORIAL_PROFILES_FILE);

  assert(doc.schema === 'history_go_historie_maintenance_round_v1', 'Historie maintenance round 1 bruker feil schema');
  assert(doc.subject_id === 'historie', 'Historie maintenance round 1 bruker feil subject_id');
  assert(doc.round_id === 'source_refresh_and_place_case_expansion_round1_2026_09_04', 'Historie maintenance round 1 har uventet round_id');
  assert(doc.baseline_main_sha === EXPECTED_BASELINE, 'Historie maintenance round 1 er ikke bundet til eksakt fersk main-baseline');
  assert(doc.checked_at === '2026-09-04' && doc.status === 'verified', 'Historie maintenance round 1 er ikke datert og verifisert');

  assert(doc.scope?.new_strict_subcategory === false, 'Historie maintenance skal ikke opprette ny strict-underkategori');
  assert(doc.scope?.place_production === false, 'Historie maintenance skal ikke være stedsproduksjon');
  assert(doc.scope?.canonical_architecture_change === false, 'Historie maintenance skal ikke endre canonical fagarkitektur');
  assert(doc.scope?.maintenance_evidence_only === true, 'Historie maintenance skal være separat vedlikeholdsevidens');

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
  const declaredTargets = new Set(doc.target_chapters || []);
  assert(declaredTargets.size === TARGET_CHAPTERS.size, 'Historie maintenance round 1 skal deklarere nøyaktig fem målkapitler');
  for (const chapterId of TARGET_CHAPTERS) {
    assert(declaredTargets.has(chapterId), `Mangler Historie maintenance-målkapittel ${chapterId}`);
    assert(canonicalChapters.has(chapterId), `${chapterId}: finnes ikke i canonical Historie subject-audit`);
    assert(fs.existsSync(abs(`${HISTORIE_ROOT}/${chapterId}.json`)), `${chapterId}: mangler canonical kapittelfil`);
  }

  assert(editorialProfiles.schema === 'history_go_historie_editorial_profiles_v1', 'Historie editorial profiles har feil schema');
  const editorialBaseline = collectEditorialBaseline(editorialProfiles);
  assert(editorialBaseline.caseAnchorCount === 54, 'Historie editorial baseline skal fortsatt ha 54 kuraterte caseankere');

  const refreshes = doc.source_refresh || [];
  const cases = doc.cases || [];
  assert(refreshes.length === REQUIRED_SOURCE_IDS.size, 'Historie maintenance round 1 skal ha nøyaktig 10 kildekontroller');
  assert(cases.length === TARGET_CHAPTERS.size, 'Historie maintenance round 1 skal ha nøyaktig fem case');

  const refreshIds = new Set();
  const publishers = new Set();
  for (const source of refreshes) {
    assert(text(source.id) && !refreshIds.has(source.id), `Duplisert eller tom Historie-kilde-ID: ${source.id}`);
    refreshIds.add(source.id);
    publishers.add(text(source.publisher));
    assert(/^https:\/\//.test(text(source.url)), `${source.id}: URL skal bruke https`);
    assert(text(source.publisher).length >= 3, `${source.id}: mangler publisher`);
    assert(text(source.source_location).length >= 55, `${source.id}: source_location er for svak`);
    assert(source.health === 'verified_live', `${source.id}: kildehelse er ikke verified_live`);
    assert(text(source.authority).length >= 8, `${source.id}: authority er ikke eksplisitt`);
    assert(Array.isArray(source.chapter_ids) && source.chapter_ids.length >= 1, `${source.id}: mangler chapter_ids`);
    for (const chapterId of source.chapter_ids) {
      assert(TARGET_CHAPTERS.has(chapterId), `${source.id}: kilde ligger utenfor round-1-målkapitlene`);
    }
  }
  for (const id of REQUIRED_SOURCE_IDS) assert(refreshIds.has(id), `Mangler obligatorisk Historie-kilde ${id}`);
  assert(publishers.size >= 7, 'Historie maintenance round 1 skal ha minst sju institusjonelle/faglige utgiveridentiteter');

  const canonicalPlaceIds = collectCanonicalPlaceIds();
  const caseIds = new Set();
  const usedSources = new Set();
  const usedPlaces = new Set();
  const usedChapters = new Set();

  for (const item of cases) {
    assert(text(item.id) && !caseIds.has(item.id), `Duplisert eller tom Historie-case-ID: ${item.id}`);
    caseIds.add(item.id);
    assert(text(item.title), `${item.id}: mangler tittel`);
    assert(text(item.case_claim).length >= 220, `${item.id}: case_claim er for kort`);
    assert(TARGET_CHAPTERS.has(item.chapter_id), `${item.id}: ukjent målkapittel ${item.chapter_id}`);
    assert(!usedChapters.has(item.chapter_id), `${item.id}: målkapitlet ${item.chapter_id} har mer enn ett round-1-case`);
    usedChapters.add(item.chapter_id);

    assert(Array.isArray(item.source_ids) && item.source_ids.length >= 2, `${item.id}: caset skal bruke minst to round-1-kilder`);
    for (const sourceId of item.source_ids) {
      assert(refreshIds.has(sourceId), `${item.id}: ukjent round-1-kilde ${sourceId}`);
      usedSources.add(sourceId);
    }

    assert(Array.isArray(item.place_ids) && item.place_ids.length >= 1, `${item.id}: caset mangler stedskobling`);
    for (const placeId of item.place_ids) {
      assert(canonicalPlaceIds.has(placeId), `${item.id}: ukjent canonical place_id ${placeId}`);
      assert(!editorialBaseline.placeIds.has(placeId), `${item.id}: ${placeId} finnes allerede i de 54 kuraterte editorial caseankrene`);
      usedPlaces.add(placeId);
    }

    assert(Array.isArray(item.analysis_questions) && item.analysis_questions.length === 3, `${item.id}: caset skal ha nøyaktig tre analysespørsmål`);
    assert(item.analysis_questions.every((question) => text(question).length >= 70), `${item.id}: analysespørsmålene er for svake`);
  }

  assert(usedChapters.size === TARGET_CHAPTERS.size, 'Historie maintenance round 1 skal dekke alle fem målkapitlene');
  for (const chapterId of TARGET_CHAPTERS) assert(usedChapters.has(chapterId), `Historie maintenance mangler ${chapterId}`);
  assert(usedSources.size === refreshIds.size, 'Alle Historie round-1-kilder skal brukes av minst ett case');
  assert(usedPlaces.size === REQUIRED_PLACE_IDS.size, 'Historie maintenance round 1 skal bruke nøyaktig fem nye canonicale steder');
  for (const placeId of REQUIRED_PLACE_IDS) assert(usedPlaces.has(placeId), `Historie maintenance mangler obligatorisk sted ${placeId}`);

  const gates = doc.quality_gates || {};
  for (const gate of [
    'all_sources_https',
    'all_sources_authoritative_or_institutional',
    'all_cases_source_bound',
    'all_cases_place_bound',
    'all_case_places_canonical',
    'all_case_places_new_to_editorial_baseline',
    'claim_provenance_preserved',
    'historiography_and_theory_integrity_scope_unchanged',
    'canonical_subject_architecture_unchanged',
    'completion_status_preserved',
    'source_conflicts_surfaced_not_flattened',
    'place_anchor_not_treated_as_location_of_all_systemic_effects',
    'archaeological_context_not_overclaimed_as_direct_date_or_meaning'
  ]) assert(gates[gate] === true, `Historie maintenance round 1 mangler grønn kvalitetsport: ${gate}`);

  return {
    schema: 'history_go_historie_maintenance_audit_v1',
    status: 'passed',
    round: 1,
    round_id: doc.round_id,
    baseline_main_sha: doc.baseline_main_sha,
    source_refresh_count: refreshes.length,
    publisher_count: publishers.size,
    case_count: cases.length,
    chapter_count: usedChapters.size,
    canonical_chapter_count: canonicalChapters.size,
    baseline_editorial_case_anchor_count: editorialBaseline.caseAnchorCount,
    baseline_editorial_unique_place_count: editorialBaseline.placeIds.size,
    new_unique_place_count: usedPlaces.size,
    projected_case_anchor_count: editorialBaseline.caseAnchorCount + cases.length,
    gates: {
      source_health: true,
      canonical_chapter_identity: true,
      canonical_place_identity: true,
      case_places_new_to_editorial_baseline: true,
      case_source_trace: true,
      claim_provenance_preserved: true,
      historiography_and_theory_integrity_scope_unchanged: true,
      subject_architecture_unchanged: true,
      completion_status_preserved: true,
      source_conflicts_preserved: true,
      systemic_effects_not_localized_to_place_anchor: true,
      archaeological_context_bounded: true,
      no_strict_subcategory: true,
      no_place_production: true
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditHistorieSourceRefreshPlaceCaseExpansion();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
