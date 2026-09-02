#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const registryFile = 'data/fag/politikk/juss_rettsvitenskap/production_registry_v1.json';
const ciFile = '.github/ci/fagverk-juss-rettsvitenskap-domain-registry-v1.json';
const reconciliationFile = 'reports/fagverk/juss-rettsvitenskap-reconciliation-v1.json';
const registry = read(registryFile);
const ci = read(ciFile);
const reconciliation = read(reconciliationFile);
const audit10 = read('reports/fagverk/juss-rettsvitenskap-family-child-inheritance-person-law-fulltext-v1-audit.json');
const brief11 = read('data/fag/politikk/juss_rettsvitenskap/labour_company_business_tax_market_law_source_claim_brief_v1.json');
const audit11 = read('reports/fagverk/juss-rettsvitenskap-labour-company-business-tax-market-law-source-brief-v1-audit.json');

assert(registry.progress.materializedDomains === 9 && registry.materialized.length === 9, 'Canonical må stå 9/12 før Felt 10 registreres');
assert(registry.next_gate === 'family_child_inheritance_person_law_fulltext', 'Uventet canonical next_gate før Felt 10');
assert(audit10.domain_id === ci.domains[9].domainId && audit10.status === 'pass_fulltext_materialized_domain_ready_for_registry' && audit10.six_part_quality_review.total === 30, 'Felt 10 fulltekst er ikke grønn');
assert(brief11.domain.ordinal === 11 && brief11.domain.id === ci.domains[10].domainId && brief11.status === 'source_first_ready_not_materialized', 'Felt 11 source-first er ikke klart');
assert(audit11.status === 'pass_source_first_ready_not_materialized' && audit11.gates.not_materialized === true, 'Felt 11 source-first-audit er ikke grønn');

registry.status = 'domains_1_2_3_4_5_6_7_8_9_10_materialized_domain_11_source_first_ready';
registry.progress.materializedDomains = 10;
registry.progress.strictCompletionProven = false;
registry.next_gate = 'labour_company_business_tax_market_law_fulltext';
registry.materialized.push({
  ordinal: 10,
  domain_id: 'familie_barn_arv_personrett',
  chapter: 'data/fagverk/politikk/juss_rettsvitenskap/familie-barn-arv-og-personrett.json',
  claims: 'data/fagverk/politikk/juss_rettsvitenskap/familie-barn-arv-og-personrett/claims.json',
  assessment: 'data/fagverk/politikk/juss_rettsvitenskap/familie-barn-arv-og-personrett/assessment.json',
  audit: 'reports/fagverk/juss-rettsvitenskap-family-child-inheritance-person-law-fulltext-v1-audit.json',
  source_brief: 'data/fag/politikk/juss_rettsvitenskap/family_child_inheritance_person_law_source_claim_brief_v1.json',
  source_brief_audit: 'reports/fagverk/juss-rettsvitenskap-family-child-inheritance-person-law-source-brief-v1-audit.json'
});

const requiredDeterministic = [
  'reports/fagverk/juss-rettsvitenskap-family-child-inheritance-person-law-fulltext-v1-audit.json',
  'reports/fagverk/juss-rettsvitenskap-labour-company-business-tax-market-law-source-brief-v1-audit.json'
];
for (const item of requiredDeterministic) {
  if (!ci.ci.deterministicPaths.includes(item)) ci.ci.deterministicPaths.push(item);
}

reconciliation.status = 'reconciliation_complete_domains_1_2_3_4_5_6_7_8_9_10_materialized_domain_11_source_first_ready';
reconciliation.production_plan.materialized = 10;
reconciliation.production_plan.source_first_ready = 11;
reconciliation.production_plan.next_domain = ci.domains[10].domainId;
reconciliation.production_plan.strict_completion_proven = false;

write(registryFile, registry);
write(ciFile, ci);
write(reconciliationFile, reconciliation);
console.log('Juss canonical finalisert fail-closed: 10/12 materialisert, Felt 11 source-first klart.');
