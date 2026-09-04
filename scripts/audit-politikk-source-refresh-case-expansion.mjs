#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAINTENANCE_FILE = 'data/fagverk/politikk/maintenance/source-refresh-case-expansion-2026-09-04.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const POLITIKK_ROOT = 'data/fagverk/politikk';
const PLACE_DIR = 'data/places/politikk/oslo/places_politikk';

const abs = (value) => path.join(ROOT, value);
const readJson = (value) => JSON.parse(fs.readFileSync(abs(value), 'utf8'));
const text = (value) => String(value ?? '').trim();
const assert = (ok, message) => { if (!ok) throw new Error(message); };

function walkJsonFiles(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkJsonFiles(full, result);
    else if (entry.isFile() && entry.name === 'claims.json') result.push(full);
  }
  return result;
}

function collectCanonicalSourceIds() {
  const ids = new Set();
  for (const claimsPath of walkJsonFiles(abs(POLITIKK_ROOT))) {
    const doc = JSON.parse(fs.readFileSync(claimsPath, 'utf8'));
    for (const source of doc.sources || []) if (text(source.id)) ids.add(text(source.id));
  }
  return ids;
}

function collectCanonicalPlaceIds() {
  const ids = new Set();
  const dir = abs(PLACE_DIR);
  assert(fs.existsSync(dir) && fs.statSync(dir).isDirectory(), `Canonical Politikk-place-katalog mangler: ${PLACE_DIR}`);
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue;
    const doc = JSON.parse(fs.readFileSync(path.join(dir, entry.name), 'utf8'));
    if (text(doc.id)) ids.add(text(doc.id));
  }
  return ids;
}

export function auditPolitikkSourceRefreshCaseExpansion() {
  const doc = readJson(MAINTENANCE_FILE);
  const status = readJson(STATUS_FILE);

  assert(doc.schema === 'history_go_politikk_maintenance_round_v1', 'Vedlikeholdsrunden bruker feil schema');
  assert(doc.subject_id === 'politikk', 'Vedlikeholdsrunden bruker feil subject_id');
  assert(doc.round_id === 'source_refresh_and_case_expansion_2026_09_04', 'Vedlikeholdsrunden bruker feil round_id');
  assert(doc.checked_at === '2026-09-04' && doc.status === 'verified', 'Vedlikeholdsrunden er ikke datert og verifisert');
  assert(/^[0-9a-f]{40}$/.test(text(doc.baseline_main_sha)), 'Vedlikeholdsrunden mangler eksakt baseline-SHA');

  assert(doc.scope?.new_strict_subcategory === false, 'Vedlikeholdsrunden skal ikke opprette ny strict-underkategori');
  assert(doc.scope?.civication === false, 'Vedlikeholdsrunden skal ikke endre Civication');
  assert(doc.scope?.place_production === false, 'Vedlikeholdsrunden skal ikke være stedsproduksjon');

  const politicsStatus = (status.subjects || []).find((row) => row.id === 'politikk');
  assert(politicsStatus?.navigationStatus === 'materialized', 'Politikk skal fortsatt være materialized');
  assert(politicsStatus?.assessmentStatus === 'audited', 'Politikk skal fortsatt være audited');
  assert(politicsStatus?.editorialStatus === 'expanded_and_audited', 'Første vedlikeholdsrunde skal ikke omklassifisere Politikk uten separat statusreconciliation');
  assert(politicsStatus?.nextGate === 'source_refresh_and_case_expansion', 'Politikk peker ikke til vedlikeholdsporten som denne runden realiserer');

  const refreshes = doc.source_refresh || [];
  const cases = doc.cases || [];
  assert(refreshes.length >= 9, 'Vedlikeholdsrunden skal kontrollere minst ni kildeposter');
  assert(cases.length >= 5, 'Vedlikeholdsrunden skal materialisere minst fem konkrete case');

  const refreshIds = new Set();
  const canonicalSourceIds = collectCanonicalSourceIds();
  const chapterIds = new Set();
  let currentSourceCount = 0;

  for (const source of refreshes) {
    assert(text(source.id) && !refreshIds.has(source.id), `Duplisert eller tom vedlikeholdskilde: ${source.id}`);
    refreshIds.add(source.id);
    assert(/^https:\/\//.test(text(source.url)), `${source.id}: URL skal bruke https`);
    assert(text(source.publisher) && text(source.source_location), `${source.id}: mangler publisher eller source_location`);
    assert(source.health === 'verified_live', `${source.id}: kildehelse er ikke verified_live`);
    assert(Array.isArray(source.chapter_ids) && source.chapter_ids.length >= 1, `${source.id}: mangler chapter_ids`);
    for (const chapterId of source.chapter_ids) {
      chapterIds.add(chapterId);
      assert(fs.existsSync(abs(`${POLITIKK_ROOT}/${chapterId}.json`)), `${source.id}: ukjent Politikk-kapittel ${chapterId}`);
    }
    for (const sourceId of source.existing_source_ids || []) {
      assert(canonicalSourceIds.has(sourceId), `${source.id}: canonical kilde-ID finnes ikke: ${sourceId}`);
    }
    if ((source.existing_source_ids || []).length === 0) currentSourceCount += 1;
  }

  const requiredRefreshIds = [
    'maint_stortinget_tasks',
    'maint_stortinget_lovarbeid',
    'maint_stortinget_2025_2029',
    'maint_stortinget_oslo_2025_2029',
    'maint_valg_2025_data',
    'maint_oslo_governance',
    'maint_efta_eealaw',
    'maint_utredningsinstruksen_2025',
    'maint_state_municipal_governance'
  ];
  for (const id of requiredRefreshIds) assert(refreshIds.has(id), `Mangler obligatorisk vedlikeholdskilde: ${id}`);
  assert(currentSourceCount >= 2, 'Vedlikeholdsrunden skal tilføre minst to reelt nye samtidige kildekontroller');

  const placeIds = collectCanonicalPlaceIds();
  const caseIds = new Set();
  const usedRefreshIds = new Set();
  const usedPlaceIds = new Set();
  const usedChapterIds = new Set();

  for (const item of cases) {
    assert(text(item.id) && !caseIds.has(item.id), `Duplisert eller tom case-ID: ${item.id}`);
    caseIds.add(item.id);
    assert(text(item.title), `${item.id}: mangler tittel`);
    assert(text(item.case_claim).length >= 120, `${item.id}: case_claim er for kort`);
    assert(fs.existsSync(abs(`${POLITIKK_ROOT}/${item.chapter_id}.json`)), `${item.id}: ukjent kapittel ${item.chapter_id}`);
    usedChapterIds.add(item.chapter_id);
    assert(Array.isArray(item.source_ids) && item.source_ids.length >= 2, `${item.id}: caset skal bruke minst to vedlikeholdskilder`);
    for (const sourceId of item.source_ids) {
      assert(refreshIds.has(sourceId), `${item.id}: ukjent vedlikeholdskilde ${sourceId}`);
      usedRefreshIds.add(sourceId);
    }
    assert(Array.isArray(item.place_ids) && item.place_ids.length >= 1, `${item.id}: caset mangler stedskobling`);
    for (const placeId of item.place_ids) {
      assert(placeIds.has(placeId), `${item.id}: ukjent canonical place_id ${placeId}`);
      usedPlaceIds.add(placeId);
    }
    assert(Array.isArray(item.analysis_questions) && item.analysis_questions.length === 3, `${item.id}: caset skal ha nøyaktig tre analysespørsmål`);
    assert(item.analysis_questions.every((question) => text(question).length >= 45), `${item.id}: analysespørsmålene er for svake`);
  }

  assert(usedChapterIds.size >= 4, 'Caseutvidelsen skal berøre minst fire Politikk-kapitler');
  assert(usedPlaceIds.size >= 4, 'Caseutvidelsen skal bruke minst fire canonicale politiske steder');
  assert(usedRefreshIds.size >= 8, 'Caseutvidelsen skal faktisk bruke hoveddelen av de oppfriskede kildekontrollene');

  const gates = doc.quality_gates || {};
  for (const gate of [
    'all_sources_https',
    'all_sources_authoritative_or_institutional',
    'all_cases_source_bound',
    'all_cases_place_bound',
    'claim_provenance_preserved',
    'theory_integrity_scope_unchanged',
    'canonical_subject_architecture_unchanged'
  ]) assert(gates[gate] === true, `Vedlikeholdsrunden mangler grønn kvalitetsport: ${gate}`);

  const report = {
    schema: 'history_go_politikk_maintenance_audit_v1',
    status: 'passed',
    round_id: doc.round_id,
    baseline_main_sha: doc.baseline_main_sha,
    source_refresh_count: refreshes.length,
    new_current_source_count: currentSourceCount,
    case_count: cases.length,
    chapter_count: usedChapterIds.size,
    place_count: usedPlaceIds.size,
    reused_canonical_source_id_count: new Set(refreshes.flatMap((source) => source.existing_source_ids || [])).size,
    gates: {
      source_health: true,
      canonical_source_identity: true,
      canonical_chapter_identity: true,
      canonical_place_identity: true,
      case_source_trace: true,
      claim_provenance_preserved: true,
      theory_integrity_scope_unchanged: true,
      subject_architecture_unchanged: true,
      no_strict_subcategory: true,
      no_civication: true
    }
  };

  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const report = auditPolitikkSourceRefreshCaseExpansion();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
