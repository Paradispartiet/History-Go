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
const unique = (xs) => new Set(xs).size === xs.length;

export function auditScenekunstUniversityReadiness({ writeReport = false, checkReport = true } = {}) {
  const readiness = json(P.readiness);
  const emner = json(P.emner);
  const fagkart = json(P.fagkart);
  const methods = json(P.methods);
  const pensum = json(P.pensum);
  const registry = json(P.registry);

  assert(readiness.schema === 'history_go_fagverk_scenekunst_university_readiness_v1', 'Feil readiness-schema');
  assert(readiness.subject_id === 'scenekunst', 'Readiness gjelder ikke Scenekunst');
  assert(readiness.complete_ready === false, 'Inventory-reconciliation kan ikke gjøre Scenekunst complete');
  assert(readiness.status === 'breadth_inventory_reconciled_chapter_production_pending', 'Readiness har feil post-reconciliation-status');
  assert(readiness.canonical_scope?.no_fixed_completion_quota === true, 'Ferdigkravet kan ikke være en tallkvote');
  assert(readiness.foundation_baseline?.domain_count === 4 && readiness.foundation_baseline?.emne_count === 8 && readiness.foundation_baseline?.method_count === 9, 'Foundation-baseline er endret');

  assert(emner.length === 20 && unique(emner.map((row) => row.emne_id)), 'Canonical Scenekunst skal ha 20 unike post-reconciliation-emner');
  assert(fagkart.categories.length === 4, 'Renderer-fagområdene skal forbli fire');
  assert(methods.methods.length === 14 && unique(methods.methods.map((row) => row.method_id)), 'Canonical Scenekunst skal ha 14 unike metoder');
  assert(pensum.modules.length === 5, 'Post-reconciliation-pensum skal ha fem progresjonsmoduler');
  assert((registry.subjects?.scenekunst?.chapters || []).length === 0, 'Kapittelproduksjon skal fortsatt være separat fra inventory-reconciliation');

  const emneIds = new Set(emner.map((row) => row.emne_id));
  const methodIds = new Set(methods.methods.map((row) => row.method_id));
  for (const id of readiness.preserved_foundation_emne_ids) assert(emneIds.has(id), `Foundation-emne er mistet: ${id}`);
  assert(readiness.preserved_foundation_emne_ids.length === 8, 'Foundation-emnelisten har feil størrelse');
  assert(readiness.reconciled_emne_ids.length === 12 && readiness.reconciled_emne_ids.every((id) => emneIds.has(id)), 'Reconciled emner matcher ikke canonical inventar');
  assert(readiness.reconciled_method_ids.length === 5 && readiness.reconciled_method_ids.every((id) => methodIds.has(id)), 'Reconciled metoder matcher ikke canonical inventar');

  for (const emne of emner) {
    assert(emne.status === 'active', `${emne.emne_id} er ikke active`);
    assert(emne.definition?.length >= 120, `${emne.emne_id} har for kort selvstendig definisjon`);
    assert(emne.why_it_matters?.length >= 100, `${emne.emne_id} har for kort why_it_matters`);
    assert(emne.key_questions?.length >= 3, `${emne.emne_id} mangler tre nøkkelspørsmål`);
    assert(emne.method_ids?.length >= 3 && emne.method_ids.every((id) => methodIds.has(id)), `${emne.emne_id} har ugyldig metodekobling`);
  }
  assert(methods.methods.every((row) => row.canonical_status === 'canonical'), 'Ikke-canonical metode i aktiv Scenekunst-pakke');

  const fagkartIds = fagkart.categories.flatMap((row) => row.emne_ids || []);
  const moduleIds = pensum.modules.flatMap((row) => row.emner || []);
  assert(fagkartIds.length === 20 && unique(fagkartIds) && fagkartIds.every((id) => emneIds.has(id)), 'Fagkartet skal eie hvert canonicalt emne nøyaktig én gang');
  assert(moduleIds.length === 20 && unique(moduleIds) && moduleIds.every((id) => emneIds.has(id)), 'Pensummodulene skal dekke hvert canonicalt emne nøyaktig én gang');
  assert(fagkart.principles?.university_breadth_reconciled === true, 'Fagkartet mangler eksplisitt breadth-reconciliation');
  assert(fagkart.principles?.no_fixed_completion_quota === true, 'Fagkartet mangler no-quota-regel');

  assert(readiness.benchmark_sources.length >= 7, 'For få universitets-/sektorbenchmarks');
  for (const source of readiness.benchmark_sources) {
    assert(/^https:\/\//.test(source.url), `Benchmark mangler inspectable HTTPS URL: ${source.id}`);
    assert(source.verified_at === '2026-08-18', `Benchmark har feil verifikasjonsdato: ${source.id}`);
    assert(source.relevance?.length >= 80, `Benchmark mangler faglig relevansforklaring: ${source.id}`);
  }
  assert(readiness.coverage_families.length === 12, 'Readiness skal ha tolv eksplisitte coverage-familier');
  assert(readiness.coverage_families.every((row) => row.status === 'inventory_reconciled' && row.emne_ids?.every((id) => emneIds.has(id))), 'Coverage-familie er ikke reconcilet til canonicalt emne');
  assert(readiness.blocking_gaps.length === 0, 'Inventory-reconciliation har fortsatt blocking breadth gaps');
  assert(readiness.resolved_blocking_gap_ids.length === 7, 'Feil antall løste readiness-blokkere');

  const requiredCompletion = new Set(readiness.completion_requirements || []);
  for (const gate of ['all_canonical_emners_have_explicit_fulltext_ownership','paragraph_to_claim_trace_complete','all_used_claims_resolve_to_inspectable_sources','gap_overlap_and_filler_audit_clean','full_subject_quality_review_at_least_27_of_30_with_no_dimension_below_4']) {
    assert(requiredCompletion.has(gate), `Completion-port mangler: ${gate}`);
  }

  const report = {
    schema: 'history_go_fagverk_scenekunst_university_readiness_audit_v1',
    version: '1.1.0',
    status: 'breadth_inventory_reconciled_chapter_production_pending',
    subject: 'scenekunst',
    foundationBaseline: { domains: 4, emners: 8, methods: 9, mappings: 8, registeredChapters: 0 },
    canonicalInventory: { domains: 4, emners: 20, methods: 14, mappings: 20, progressionModules: 5, registeredChapters: 0 },
    benchmarks: readiness.benchmark_sources.length,
    coverageFamilies: readiness.coverage_families.length,
    unresolvedBreadthGaps: 0,
    preservedFoundationEmners: readiness.preserved_foundation_emne_ids.length,
    reconciledEmners: readiness.reconciled_emne_ids.length,
    reconciledMethods: readiness.reconciled_method_ids.length,
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
    console.log(`Scenekunst university breadth OK: ${report.canonicalInventory.emners} emner, ${report.canonicalInventory.methods} metoder, ${report.unresolvedBreadthGaps} breadth gaps.`);
  } catch (error) {
    console.error(`Scenekunst university readiness FEIL: ${error.message}`);
    process.exitCode = 1;
  }
}
