#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = Object.freeze({
  readiness: 'data/fag/scenekunst/scenekunst_university_readiness_v1.json',
  emner: 'data/fag/scenekunst/emner_scenekunst_canonical_v1.json',
  fagkart: 'data/fag/scenekunst/fagkart_scenekunst_canonical_v1.json',
  methods: 'data/fag/scenekunst/methods_scenekunst_canonical_v1.json',
  pensum: 'data/fag/scenekunst/scenekunstpensum_canonical_v1.json',
  registry: 'data/fagverk/fagverk_registry.json',
  report: 'reports/fagverk/scenekunst-university-readiness-audit.json'
});
const abs = (p) => path.join(ROOT, p);
const json = (p) => JSON.parse(fs.readFileSync(abs(p), 'utf8'));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const same = (a,b) => JSON.stringify(a) === JSON.stringify(b);

export function auditScenekunstUniversityReadiness({ writeReport = false, checkReport = true } = {}) {
  const readiness = json(P.readiness);
  const emner = json(P.emner);
  const fagkart = json(P.fagkart);
  const methods = json(P.methods);
  const pensum = json(P.pensum);
  const registry = json(P.registry);

  assert(readiness.schema === 'history_go_fagverk_scenekunst_university_readiness_v1', 'Feil readiness-schema');
  assert(readiness.subject_id === 'scenekunst', 'Readiness gjelder ikke Scenekunst');
  assert(readiness.complete_ready === false, 'Readiness kan ikke gjøre Scenekunst complete');
  assert(readiness.canonical_scope?.no_fixed_completion_quota === true, 'Ferdigkravet kan ikke være en tallkvote');
  assert(readiness.status === 'breadth_reconciliation_required', 'Scenekunst skal fortsatt kreve bredde-reconciliation');

  assert(emner.length === 8, 'Foundation-baselinen skal ha åtte emner før reconciliation');
  assert(fagkart.categories.length === 4, 'Foundation-baselinen skal ha fire renderer-fagområder');
  assert(methods.methods.length === 9, 'Foundation-baselinen skal ha ni metoder');
  assert(new Set(emner.map((row) => row.emne_id)).size === 8, 'Foundation-emnene er ikke unike');
  assert(new Set(methods.methods.map((row) => row.method_id)).size === 9, 'Foundation-metodene er ikke unike');
  assert(pensum.modules.length === 3, 'Foundation-pensum skal ha tre progresjonsmoduler');

  const inventory = readiness.current_inventory;
  assert(inventory.domain_count === 4 && inventory.emne_count === 8 && inventory.method_count === 9, 'Readiness-baseline avviker fra canonical foundation');
  assert(inventory.registered_chapter_count === 0, 'Readiness skal starte før Scenekunst-kapitler er registrert');
  assert((registry.subjects?.scenekunst?.chapters || []).length === 0, 'Registry har uventede Scenekunst-kapitler');

  assert(readiness.benchmark_sources.length >= 6, 'For få universitets-/sektorbenchmarks');
  for (const source of readiness.benchmark_sources) {
    assert(/^https:\/\//.test(source.url), `Benchmark mangler inspectable HTTPS URL: ${source.id}`);
    assert(source.verified_at === '2026-08-18', `Benchmark har feil verifikasjonsdato: ${source.id}`);
    assert(source.relevance?.length >= 80, `Benchmark mangler faglig relevansforklaring: ${source.id}`);
  }

  const boundaryIds = new Set(readiness.neighbor_boundaries.map((row) => row.subject_id));
  for (const required of ['musikk', 'film_tv', 'kunst', 'historie', 'politikk']) {
    assert(boundaryIds.has(required), `Mangler nabofaggrense mot ${required}`);
  }

  const familyIds = readiness.coverage_families.map((row) => row.id);
  assert(new Set(familyIds).size === familyIds.length, 'Dupliserte coverage-familier');
  assert(readiness.coverage_families.length >= 10, 'Readiness er for smal for universitetsbredde');
  const gapFamilies = readiness.coverage_families.filter((row) => row.status === 'gap').map((row) => row.id);
  for (const required of ['history_traditions_performance_theory', 'archives_documentation_ephemerality', 'ethics_access_representation_working_conditions']) {
    assert(gapFamilies.includes(required), `Mangler eksplisitt breddehull: ${required}`);
  }

  assert(readiness.blocking_gaps.length >= 7, 'Readiness underdriver reelle blocking gaps');
  assert(new Set(readiness.blocking_gaps.map((row) => row.id)).size === readiness.blocking_gaps.length, 'Dupliserte blocking gaps');
  assert(readiness.blocking_gaps.every((row) => familyIds.includes(row.family_id)), 'Blocking gap peker til ukjent coverage-familie');

  const candidates = readiness.reconciliation_plan?.first_batch_candidate_topics || [];
  assert(candidates.length >= 10, 'Første reconciliation-plan er for smal');
  assert(new Set(candidates).size === candidates.length, 'Dupliserte reconciliation-kandidater');
  assert(readiness.reconciliation_plan?.preserve_renderer_domain_ids?.join('|') === 'institusjon_repertoar|verk_utover_form|dans_hybrid_humor|publikum_offentlighet', 'Renderer-domenegrensene er ikke eksplisitt bevart');

  const requiredCompletion = new Set(readiness.completion_requirements || []);
  for (const gate of [
    'all_blocking_breadth_gaps_reconciled',
    'all_canonical_emners_have_explicit_fulltext_ownership',
    'paragraph_to_claim_trace_complete',
    'all_used_claims_resolve_to_inspectable_sources',
    'gap_overlap_and_filler_audit_clean',
    'full_subject_quality_review_at_least_27_of_30_with_no_dimension_below_4'
  ]) assert(requiredCompletion.has(gate), `Completion-port mangler: ${gate}`);

  const report = {
    schema: 'history_go_fagverk_scenekunst_university_readiness_audit_v1',
    version: '1.0.0',
    status: 'blocked_for_completion_until_breadth_reconciliation',
    subject: 'scenekunst',
    baseline: { domains: 4, emners: 8, methods: 9, mappings: 8, registeredChapters: 0 },
    benchmarks: readiness.benchmark_sources.length,
    coverageFamilies: readiness.coverage_families.length,
    blockingGaps: readiness.blocking_gaps.length,
    candidateReconciliationTopics: candidates.length,
    completeReady: false,
    nextGate: readiness.next_gate
  };

  if (writeReport) {
    fs.mkdirSync(path.dirname(abs(P.report)), { recursive: true });
    fs.writeFileSync(abs(P.report), `${JSON.stringify(report, null, 2)}\n`);
  }
  if (checkReport) assert(same(json(P.report), report), `${P.report} er utdatert`);
  return report;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = new Set(process.argv.slice(2));
  try {
    const report = auditScenekunstUniversityReadiness({ writeReport: args.has('--write-report'), checkReport: !args.has('--no-check-report') });
    console.log(`Scenekunst university readiness OK: ${report.coverageFamilies} coverage-familier, ${report.blockingGaps} blocking gaps.`);
  } catch (error) {
    console.error(`Scenekunst university readiness FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
