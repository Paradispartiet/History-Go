#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROUND1_FILE = 'data/fagverk/politikk/maintenance/source-refresh-case-expansion-2026-09-04.json';
const ROUND2_FILE = 'data/fagverk/politikk/maintenance/source-refresh-case-expansion-round2-2026-09-04.json';
const ROUND3_FILE = 'data/fagverk/politikk/maintenance/source-refresh-case-expansion-round3-2026-09-04.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const PLACE_DIR = 'data/places/politikk/oslo/places_politikk';
const POLITIKK_ROOT = 'data/fagverk/politikk';
const EXPECTED_BASELINE = '7a1b249277aced924f37beff9e63e3abf92813da';

const CANONICAL_CHAPTERS = new Set([
  'regimer-og-institusjoner',
  'parlamentarisme',
  'valg-partier-velgeratferd',
  'forvaltning',
  'offentlig-politikk-beslutning-implementering',
  'internasjonal-politikk-sikkerhet-samarbeid',
  'politisk-okonomi-stat-marked',
  'fordeling-velferd-ulikhet',
  'konflikt-makt-sivilsamfunn',
  'normer-identitet-hverdagsliv',
  'norsk-politikk-eos-eu-flernivastyring',
  'rett-lov-rettssikkerhet',
  'statsvitenskapelig-metode-og-sammenligning'
]);

const ROUND3_TARGETS = new Set([
  'regimer-og-institusjoner',
  'parlamentarisme',
  'rett-lov-rettssikkerhet',
  'politisk-okonomi-stat-marked',
  'statsvitenskapelig-metode-og-sammenligning'
]);

const abs = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const text = (v) => String(v ?? '').trim();
const assert = (ok, msg) => { if (!ok) throw new Error(msg); };

function collectPlaceIds() {
  const ids = new Set();
  const dir = abs(PLACE_DIR);
  assert(fs.existsSync(dir), `Mangler canonical place-katalog: ${PLACE_DIR}`);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const doc = JSON.parse(fs.readFileSync(path.join(dir, entry.name), 'utf8'));
    if (text(doc.id)) ids.add(text(doc.id));
  }
  return ids;
}

export function auditPolitikkSourceRefreshCaseExpansionRound3() {
  const r1 = readJson(ROUND1_FILE);
  const r2 = readJson(ROUND2_FILE);
  const r3 = readJson(ROUND3_FILE);
  const status = readJson(STATUS_FILE);

  assert(r3.schema === 'history_go_politikk_maintenance_round_v1', 'Runde 3 bruker feil schema');
  assert(r3.subject_id === 'politikk', 'Runde 3 bruker feil subject_id');
  assert(r3.round_id === 'source_refresh_and_case_expansion_round3_2026_09_04', 'Runde 3 bruker feil round_id');
  assert(r3.baseline_main_sha === EXPECTED_BASELINE, 'Runde 3 er ikke bundet til eksakt fersk main-baseline');
  assert(r3.checked_at === '2026-09-04' && r3.status === 'verified', 'Runde 3 er ikke datert/verifisert');
  assert(r3.scope?.new_strict_subcategory === false, 'Runde 3 skal ikke opprette strict-underkategori');
  assert(r3.scope?.civication === false, 'Runde 3 skal ikke endre Civication');
  assert(r3.scope?.place_production === false, 'Runde 3 skal ikke være stedsproduksjon');

  const politicsStatus = (status.subjects || []).find((row) => row.id === 'politikk');
  assert(politicsStatus?.navigationStatus === 'materialized', 'Politikk skal være materialized');
  assert(politicsStatus?.assessmentStatus === 'audited', 'Politikk skal være audited');
  assert(politicsStatus?.editorialStatus === 'expanded_and_audited', 'expanded_and_audited skal bevares');
  assert(politicsStatus?.nextGate === 'source_refresh_and_case_expansion', 'Løpende vedlikeholdsport skal bevares');

  for (const chapterId of CANONICAL_CHAPTERS) {
    assert(fs.existsSync(abs(`${POLITIKK_ROOT}/${chapterId}.json`)), `Mangler canonical Politikk-kapittel ${chapterId}`);
  }

  const refreshes = r3.source_refresh || [];
  const cases = r3.cases || [];
  assert(refreshes.length === 10, 'Runde 3 skal ha nøyaktig 10 kildekontroller');
  assert(cases.length === 5, 'Runde 3 skal ha nøyaktig 5 case');

  const refreshIds = new Set();
  for (const source of refreshes) {
    assert(text(source.id) && !refreshIds.has(source.id), `Duplisert/tom kilde-ID: ${source.id}`);
    refreshIds.add(source.id);
    assert(/^https:\/\//.test(text(source.url)), `${source.id}: URL skal bruke https`);
    assert(text(source.publisher) && text(source.source_location), `${source.id}: mangler publisher/source_location`);
    assert(source.health === 'verified_live', `${source.id}: health skal være verified_live`);
    assert(Array.isArray(source.chapter_ids) && source.chapter_ids.length === 1, `${source.id}: skal være bundet til ett målkapittel`);
    assert(ROUND3_TARGETS.has(source.chapter_ids[0]), `${source.id}: ligger utenfor runde-3-målkapitlene`);
  }

  const priorChapterIds = new Set([...(r1.cases || []), ...(r2.cases || [])].map((item) => item.chapter_id));
  for (const chapterId of ROUND3_TARGETS) assert(!priorChapterIds.has(chapterId), `Runde 3 dupliserer tidligere kapittel ${chapterId}`);

  const placeIds = collectPlaceIds();
  const caseIds = new Set();
  const priorCaseIds = new Set([...(r1.cases || []), ...(r2.cases || [])].map((item) => item.id));
  const usedSources = new Set();
  const usedPlaces = new Set();
  const usedChapters = new Set();

  for (const item of cases) {
    assert(text(item.id) && !caseIds.has(item.id) && !priorCaseIds.has(item.id), `Duplisert case-ID: ${item.id}`);
    caseIds.add(item.id);
    assert(ROUND3_TARGETS.has(item.chapter_id), `${item.id}: feil målkapittel`);
    usedChapters.add(item.chapter_id);
    assert(text(item.case_claim).length >= 120, `${item.id}: case_claim for kort`);
    assert(Array.isArray(item.source_ids) && item.source_ids.length >= 2, `${item.id}: trenger minst to kilder`);
    for (const sourceId of item.source_ids) { assert(refreshIds.has(sourceId), `${item.id}: ukjent kilde ${sourceId}`); usedSources.add(sourceId); }
    assert(Array.isArray(item.place_ids) && item.place_ids.length >= 1, `${item.id}: mangler sted`);
    for (const placeId of item.place_ids) { assert(placeIds.has(placeId), `${item.id}: ukjent canonical place ${placeId}`); usedPlaces.add(placeId); }
    assert(Array.isArray(item.analysis_questions) && item.analysis_questions.length === 3, `${item.id}: skal ha tre analysespørsmål`);
    assert(item.analysis_questions.every((q) => text(q).length >= 45), `${item.id}: analysespørsmål for svake`);
  }

  assert(usedChapters.size === 5, 'Runde 3 skal dekke alle fem målkapitler');
  for (const chapterId of ROUND3_TARGETS) assert(usedChapters.has(chapterId), `Runde 3 mangler ${chapterId}`);
  assert(usedSources.size === 10, 'Alle ti runde-3-kilder skal brukes i case');
  assert(usedPlaces.size >= 5, 'Runde 3 skal bruke minst fem canonicale steder');

  const allCovered = new Set([...(r1.cases || []), ...(r2.cases || []), ...cases].map((item) => item.chapter_id));
  assert(allCovered.size === CANONICAL_CHAPTERS.size, `Tre runder skal dekke 13/13 kapitler; fikk ${allCovered.size}`);
  for (const chapterId of CANONICAL_CHAPTERS) assert(allCovered.has(chapterId), `Samlet vedlikehold mangler ${chapterId}`);

  const gates = r3.quality_gates || {};
  for (const gate of [
    'all_sources_https', 'all_sources_authoritative_or_institutional', 'all_cases_source_bound',
    'all_cases_place_bound', 'claim_provenance_preserved', 'theory_integrity_scope_unchanged',
    'canonical_subject_architecture_unchanged', 'status_semantics_preserved',
    'prior_round_coverage_not_duplicated', 'all_13_canonical_chapters_covered_across_rounds'
  ]) assert(gates[gate] === true, `Mangler grønn runde-3-port: ${gate}`);

  return {
    schema: 'history_go_politikk_maintenance_audit_v1',
    status: 'passed',
    round: 3,
    round_id: r3.round_id,
    baseline_main_sha: r3.baseline_main_sha,
    source_refresh_count: refreshes.length,
    case_count: cases.length,
    chapter_count: usedChapters.size,
    place_count: usedPlaces.size,
    total_round_count: 3,
    total_case_count: (r1.cases || []).length + (r2.cases || []).length + cases.length,
    total_canonical_chapter_coverage: allCovered.size,
    gates: {
      source_health: true,
      canonical_chapter_identity: true,
      canonical_place_identity: true,
      case_source_trace: true,
      claim_provenance_preserved: true,
      theory_integrity_scope_unchanged: true,
      subject_architecture_unchanged: true,
      status_semantics_preserved: true,
      prior_round_coverage_not_duplicated: true,
      all_13_canonical_chapters_covered: true,
      no_strict_subcategory: true,
      no_civication: true
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(auditPolitikkSourceRefreshCaseExpansionRound3(), null, 2)}\n`);
}
