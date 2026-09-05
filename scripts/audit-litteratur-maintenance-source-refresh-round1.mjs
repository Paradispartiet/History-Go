#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAINT_FILE = 'data/fagverk/litteratur/maintenance/source-refresh-round1-2026-09-04.json';
const PATHWAY_FILE = 'data/quiz/litteratur/litteratur_subject_pathways_v1.json';
const COVERAGE_FILE = 'data/fag/litteratur/litteraturvitenskap_canonical_v1/coverage_contract_v1.json';
const STATUS_FILE = 'data/fagverk/subject_status.json';
const EXPECTED_BASELINE = '2caaf789e1df2bf3d64dfc52be9b56bccf4b50ec';
const AREA_ID = 'faggrunnlag_metode_forskningspraksis';
const SOURCE_PREFIX = 'src_lit_faggrunnlag_metode_forskningspraksis_';

const abs = (p) => path.join(ROOT, p);
const read = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const text = (v) => String(v ?? '').trim();
const assert = (ok, message) => { if (!ok) throw new Error(message); };

const REQUIRED_GATES = [
  'all_12_area_sources_accounted_for',
  'canonical_source_ids_preserved',
  'canonical_urls_preserved_without_authoritative_replacement',
  'crawler_403_not_treated_as_dead_link',
  'indeterminate_fetch_not_treated_as_dead_link',
  'version_metadata_refreshed_in_maintenance_evidence',
  'claim_provenance_scope_unchanged',
  'theory_integrity_scope_unchanged',
  'canonical_subject_architecture_unchanged',
  'completion_status_preserved'
];

export function auditLitteraturMaintenanceSourceRefreshRound1() {
  const maint = read(MAINT_FILE);
  const pathway = read(PATHWAY_FILE);
  const coverage = read(COVERAGE_FILE);
  const status = read(STATUS_FILE).subjects.find((item) => item.id === 'litteratur');

  assert(maint.schema === 'history_go_litteratur_maintenance_source_refresh_v1', 'Feil maintenance-schema');
  assert(maint.subject_id === 'litteratur', 'Feil subject_id');
  assert(maint.round_id === 'source_refresh_round1_2026_09_04', 'Feil round_id');
  assert(maint.baseline_main_sha === EXPECTED_BASELINE, 'Round 1 er ikke bundet til eksakt main-baseline');
  assert(maint.checked_at === '2026-09-04' && maint.status === 'verified', 'Round 1 er ikke datert/verifisert');
  assert(maint.scope?.area_id === AREA_ID, 'Round 1 bruker feil fagområde');
  assert(maint.scope?.canonical_source_mutation === false, 'Round 1 skal ikke mutere canonical source-registry');
  assert(maint.scope?.new_strict_subcategory === false && maint.scope?.place_production === false, 'Round 1 bryter maintenance-scope');
  assert(maint.scope?.maintenance_evidence_only === true, 'Round 1 skal være evidence-only');

  assert(pathway.schema === 'history_go_subject_pathway_package_v1', 'Litteratur pathway bruker feil schema');
  assert(pathway.status === 'canonical' && pathway.subject_id === 'litteratur', 'Litteratur pathway er ikke canonical');
  assert(Array.isArray(pathway.sources) && pathway.sources.length === 384, 'Litteratur pathway skal fortsatt ha 384 canonicale kilder');
  assert(new Set(pathway.sources.map((source) => source.source_id)).size === 384, 'Litteratur pathway har dupliserte source IDs');
  assert(Array.isArray(pathway.sets) && pathway.sets.length === 28, 'Litteratur pathway skal fortsatt ha 28 områder');

  assert(coverage.schema === 'history_go_literature_universal_coverage_contract_v1', 'Coverage-contract bruker feil schema');
  assert(coverage.completion_definition?.required_area_count === 28, 'Coverage-contract skal kreve 28 områder');
  assert(coverage.completion_definition?.required_topic_count === 168, 'Coverage-contract skal kreve 168 artikler/temaer');
  const area = (coverage.coverage_areas || []).find((item) => item.id === AREA_ID);
  assert(area, `Mangler canonicalt område ${AREA_ID}`);
  assert(Array.isArray(area.topics) && area.topics.length === 6, `${AREA_ID}: skal ha seks canonicale temaer`);

  assert(status?.navigationStatus === 'materialized', 'Litteratur skal fortsatt være materialized');
  assert(status?.assessmentStatus === 'audited', 'Litteratur skal fortsatt være audited');
  assert(status?.editorialStatus === 'complete', 'Litteratur completion-status skal bevares');
  assert(status?.nextGate === 'maintenance_and_source_refresh', 'Litteratur maintenance-porten skal bevares');

  const canonicalAreaSources = pathway.sources.filter((source) => text(source.source_id).startsWith(SOURCE_PREFIX));
  assert(canonicalAreaSources.length === 12, `${AREA_ID}: forventer nøyaktig 12 canonicale kilder`);
  const canonicalById = new Map(canonicalAreaSources.map((source) => [source.source_id, source]));
  const checks = maint.source_checks || [];
  assert(checks.length === 12, 'Round 1 skal kontrollere nøyaktig 12 kilder');
  assert(new Set(checks.map((item) => item.source_id)).size === 12, 'Round 1 har dupliserte source IDs');

  const stateCounts = new Map();
  for (const check of checks) {
    const canonical = canonicalById.get(check.source_id);
    assert(canonical, `${check.source_id}: finnes ikke blant områdets canonicale kilder`);
    assert(check.url === canonical.url, `${check.source_id}: maintenance URL avviker fra canonical URL`);
    assert(/^https:\/\//.test(check.url), `${check.source_id}: canonical URL skal bruke https`);
    assert(text(check.evidence).length >= 100, `${check.source_id}: verification evidence er for svak`);
    assert(text(check.version_note).length >= 45, `${check.source_id}: version_note er for svak`);
    assert(['verified_live', 'crawler_access_restricted_403', 'fetch_indeterminate_no_replacement'].includes(check.verification_state), `${check.source_id}: ukjent verification_state`);
    assert(['retain_canonical_url', 'retain_until_authoritative_replacement_is_verified'].includes(check.action), `${check.source_id}: ugyldig action`);
    if (check.verification_state !== 'verified_live') {
      assert(check.action === 'retain_until_authoritative_replacement_is_verified', `${check.source_id}: usikker kilde kan ikke auto-replaces`);
    }
    stateCounts.set(check.verification_state, (stateCounts.get(check.verification_state) || 0) + 1);
  }

  for (const source of canonicalAreaSources) {
    assert(checks.some((item) => item.source_id === source.source_id), `Mangler maintenance-kontroll for ${source.source_id}`);
  }

  assert(stateCounts.get('verified_live') === 9, 'Round 1 skal ha 9 verified_live');
  assert(stateCounts.get('crawler_access_restricted_403') === 2, 'Round 1 skal ha 2 crawler_access_restricted_403');
  assert(stateCounts.get('fetch_indeterminate_no_replacement') === 1, 'Round 1 skal ha 1 fetch_indeterminate_no_replacement');
  assert(maint.summary?.canonical_sources_checked === 12, 'Summary skal rapportere 12 kontrollerte kilder');
  assert(maint.summary?.verified_live === 9, 'Summary verified_live skal være 9');
  assert(maint.summary?.crawler_access_restricted_403 === 2, 'Summary 403 skal være 2');
  assert(maint.summary?.fetch_indeterminate_no_replacement === 1, 'Summary indeterminate skal være 1');
  assert(maint.summary?.canonical_url_replacements === 0, 'Round 1 skal ha 0 URL-erstatninger');

  for (const gate of REQUIRED_GATES) assert(maint.quality_gates?.[gate] === true, `Mangler grønn kvalitetsport ${gate}`);

  return {
    schema: 'history_go_litteratur_maintenance_source_refresh_audit_v1',
    status: 'passed',
    round: 1,
    area_id: AREA_ID,
    baseline_main_sha: maint.baseline_main_sha,
    canonical_pathway_source_count: pathway.sources.length,
    canonical_area_count: pathway.sets.length,
    canonical_topic_count: coverage.completion_definition.required_topic_count,
    area_source_count: canonicalAreaSources.length,
    verified_live: stateCounts.get('verified_live'),
    crawler_access_restricted_403: stateCounts.get('crawler_access_restricted_403'),
    fetch_indeterminate_no_replacement: stateCounts.get('fetch_indeterminate_no_replacement'),
    canonical_url_replacements: maint.summary.canonical_url_replacements,
    gates: {
      complete_status_preserved: true,
      maintenance_gate_preserved: true,
      canonical_source_identity_preserved: true,
      canonical_source_urls_preserved: true,
      uncertain_sources_fail_closed: true,
      claim_provenance_scope_unchanged: true,
      theory_integrity_scope_unchanged: true,
      subject_architecture_unchanged: true,
      no_strict_subcategory: true,
      no_place_production: true
    }
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(auditLitteraturMaintenanceSourceRefreshRound1(), null, 2)}\n`);
}
