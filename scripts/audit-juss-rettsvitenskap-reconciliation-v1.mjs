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
  const subcategory = category.canonicalSubcategories?.politikk?.find((row) => row.id === 'juss_rettsvitenskap');

  assert(subcategory?.status === 'expansion_planned', 'Juss skal forbli expansion_planned');
  assert(registry.progress.materializedDomains === 7 && registry.progress.totalDomains === 12 && registry.progress.strictCompletionProven === false && registry.materialized.length === 7, 'Juss skal stå 7/12');
  assert(registry.next_gate === 'contracts_obligations_contract_law_fulltext', 'Neste gate må være Felt 8 fulltekst');
  assert(registry.materialized.every((row, index) => row.domain_id === ci.domains[index].domainId), 'Materialized registry-rekkefølge feil');
  assert(report.production_plan.materialized === 7 && report.production_plan.source_first_ready === 8 && report.production_plan.next_domain === ci.domains[7].domainId && report.production_plan.strict_completion_proven === false, 'Reconciliation-fremdrift feil');
  assert(report.domains.length === 12 && report.domains.every((row, index) => row.ordinal === index + 1 && row.domain_id === ci.domains[index].domainId), 'Reconciliation/CI-rekkefølge feil');
  assert(report.domains.filter((row) => row.classification === 'reuse_with_expansion').length === 1 && report.domains.filter((row) => row.classification === 'new_production_required').length === 11, 'Klassifisering feil');
  assert(report.move_decision?.move_existing_files?.length === 0, 'Eksisterende Politikk-filer skal ikke flyttes');
  assert(brief8.domain.ordinal === 8 && brief8.domain.id === ci.domains[7].domainId && brief8.status === 'source_first_ready_not_materialized', 'Felt 8 source-first-binding feil');

  return { status: 'pass', domains: 12, materialized: 7, sourceFirstReady: 8, strictCompletionProven: false, reuseWithExpansion: 1, newProductionRequired: 11, moveExisting: 0, nextDomain: ci.domains[7].domainId };
}

try {
  const report = audit();
  console.log(`Juss & rettsvitenskap reconciliation OK: ${report.materialized}/${report.domains} materialisert, felt ${report.sourceFirstReady} source-first klart.`);
} catch (error) {
  console.error(`Juss & rettsvitenskap reconciliation FEIL: ${error.message}`);
  process.exitCode = 1;
}
