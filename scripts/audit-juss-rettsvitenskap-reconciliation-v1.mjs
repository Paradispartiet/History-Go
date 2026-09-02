#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const category = read('data/categories/category_contract.json');
  const registry = read('data/fag/politikk/juss_rettsvitenskap/production_registry_v1.json');
  const ci = read('.github/ci/fagverk-juss-rettsvitenskap-domain-registry-v1.json');
  const report = read('reports/fagverk/juss-rettsvitenskap-reconciliation-v1.json');
  const brief8 = read('data/fag/politikk/juss_rettsvitenskap/contracts_obligations_contract_law_source_claim_brief_v1.json');
  const audit8 = read('reports/fagverk/juss-rettsvitenskap-contracts-obligations-contract-law-fulltext-v1-audit.json');
  const brief9 = read('data/fag/politikk/juss_rettsvitenskap/tort_property_private_law_priority_protection_source_claim_brief_v1.json');
  const subcategory = category.canonicalSubcategories?.politikk?.find((row) => row.id === 'juss_rettsvitenskap');

  assert(subcategory?.status === 'expansion_planned', 'Juss skal forbli expansion_planned');
  assert(registry.progress.materializedDomains === 8 && registry.progress.totalDomains === 12 && registry.progress.strictCompletionProven === false && registry.materialized.length === 8, 'Juss skal stå 8/12');
  assert(registry.next_gate === 'tort_property_private_law_priority_protection_fulltext', 'Neste gate må være Felt 9 fulltekst');
  assert(registry.materialized.every((row, index) => row.domain_id === ci.domains[index].domainId), 'Materialized registry-rekkefølge feil');
  assert(report.production_plan.materialized === 8 && report.production_plan.source_first_ready === 9 && report.production_plan.next_domain === ci.domains[8].domainId && report.production_plan.strict_completion_proven === false, 'Reconciliation-fremdrift feil');
  assert(report.domains.length === 12 && report.domains.every((row, index) => row.ordinal === index + 1 && row.domain_id === ci.domains[index].domainId), 'Reconciliation/CI-rekkefølge feil');
  assert(report.domains.filter((row) => row.classification === 'reuse_with_expansion').length === 1 && report.domains.filter((row) => row.classification === 'new_production_required').length === 11, 'Klassifisering feil');
  assert(report.move_decision?.move_existing_files?.length === 0, 'Eksisterende Politikk-filer skal ikke flyttes');
  assert(brief8.domain.ordinal === 8 && brief8.domain.id === ci.domains[7].domainId && brief8.status === 'source_first_ready_not_materialized', 'Felt 8 source-first-binding feil');
  assert(audit8.domain_id === ci.domains[7].domainId && audit8.status === 'pass_fulltext_materialized_domain_ready_for_registry' && audit8.six_part_quality_review.total === 30, 'Felt 8 fulltekst-audit feil');
  assert(brief9.domain.ordinal === 9 && brief9.domain.id === ci.domains[8].domainId && brief9.status === 'source_first_ready_not_materialized', 'Felt 9 source-first-binding feil');

  return { status: 'pass', domains: 12, materialized: 8, sourceFirstReady: 9, strictCompletionProven: false, reuseWithExpansion: 1, newProductionRequired: 11, moveExisting: 0, nextDomain: ci.domains[8].domainId };
}

try {
  const report = audit();
  console.log(`Juss & rettsvitenskap reconciliation OK: ${report.materialized}/${report.domains} materialisert, felt ${report.sourceFirstReady} source-first klart.`);
} catch (error) {
  console.error(`Juss & rettsvitenskap reconciliation FEIL: ${error.message}`);
  process.exitCode = 1;
}
