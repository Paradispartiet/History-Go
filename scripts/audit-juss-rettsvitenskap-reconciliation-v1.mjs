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
  const brief9 = read('data/fag/politikk/juss_rettsvitenskap/tort_property_private_law_priority_protection_source_claim_brief_v1.json');
  const audit9 = read('reports/fagverk/juss-rettsvitenskap-tort-property-private-law-priority-protection-fulltext-v1-audit.json');
  const brief10 = read('data/fag/politikk/juss_rettsvitenskap/family_child_inheritance_person_law_source_claim_brief_v1.json');
  const audit10 = read('reports/fagverk/juss-rettsvitenskap-family-child-inheritance-person-law-source-brief-v1-audit.json');
  const subcategory = category.canonicalSubcategories?.politikk?.find((row) => row.id === 'juss_rettsvitenskap');

  assert(subcategory?.status === 'expansion_planned', 'Juss skal forbli expansion_planned');
  assert(registry.progress.materializedDomains === 9 && registry.progress.totalDomains === 12 && registry.progress.strictCompletionProven === false && registry.materialized.length === 9, 'Juss skal stå 9/12');
  assert(registry.next_gate === 'family_child_inheritance_person_law_fulltext', 'Neste gate må være Felt 10 fulltekst');
  assert(registry.materialized.every((row, index) => row.domain_id === ci.domains[index].domainId), 'Materialized registry-rekkefølge feil');
  assert(report.production_plan.materialized === 9 && report.production_plan.source_first_ready === 10 && report.production_plan.next_domain === ci.domains[9].domainId && report.production_plan.strict_completion_proven === false, 'Reconciliation-fremdrift feil');
  assert(report.domains.length === 12 && report.domains.every((row, index) => row.ordinal === index + 1 && row.domain_id === ci.domains[index].domainId), 'Reconciliation/CI-rekkefølge feil');
  assert(report.domains.filter((row) => row.classification === 'reuse_with_expansion').length === 1 && report.domains.filter((row) => row.classification === 'new_production_required').length === 11, 'Klassifisering feil');
  assert(report.move_decision?.move_existing_files?.length === 0, 'Eksisterende Politikk-filer skal ikke flyttes');
  assert(brief9.domain.ordinal === 9 && brief9.domain.id === ci.domains[8].domainId && brief9.status === 'source_first_ready_not_materialized', 'Felt 9 source-first-binding feil');
  assert(audit9.domain_id === ci.domains[8].domainId && audit9.status === 'pass_fulltext_materialized_domain_ready_for_registry' && audit9.six_part_quality_review.total === 30, 'Felt 9 fulltekst-audit feil');
  assert(brief10.domain.ordinal === 10 && brief10.domain.id === ci.domains[9].domainId && brief10.status === 'source_first_ready_not_materialized', 'Felt 10 source-first-binding feil');
  assert(audit10.domain_id === ci.domains[9].domainId && audit10.status === 'pass_source_first_ready_not_materialized', 'Felt 10 source-first-audit feil');

  return { status: 'pass', domains: 12, materialized: 9, sourceFirstReady: 10, strictCompletionProven: false, reuseWithExpansion: 1, newProductionRequired: 11, moveExisting: 0, nextDomain: ci.domains[9].domainId };
}

try {
  const report = audit();
  console.log(`Juss & rettsvitenskap reconciliation OK: ${report.materialized}/${report.domains} materialisert, felt ${report.sourceFirstReady} source-first klart.`);
} catch (error) {
  console.error(`Juss & rettsvitenskap reconciliation FEIL: ${error.message}`);
  process.exitCode = 1;
}
