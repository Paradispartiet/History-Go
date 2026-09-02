#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(value, null, 2)}\n`);
const writeText = (file, value) => fs.writeFileSync(path.join(ROOT, file), value);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const registryFile = 'data/fag/politikk/juss_rettsvitenskap/production_registry_v1.json';
const registry = read(registryFile);
assert(registry.progress.materializedDomains === 8 && registry.materialized.length === 8, 'Forventet Juss 8/12 før Felt 9-finalisering');
registry.updated_at = '2026-09-02';
registry.status = 'domains_1_2_3_4_5_6_7_8_9_materialized_domain_10_source_first_ready';
registry.progress.materializedDomains = 9;
registry.progress.strictCompletionProven = false;
registry.next_gate = 'family_child_inheritance_person_law_fulltext';
if (!registry.materialized.some((row) => row.ordinal === 9)) {
  registry.materialized.push({
    ordinal: 9,
    domain_id: 'erstatning_tingsrett_formuesrett_rettsvern',
    chapter: 'data/fagverk/politikk/juss_rettsvitenskap/erstatning-tingsrett-formuesrett-og-rettsvern.json',
    claims: 'data/fagverk/politikk/juss_rettsvitenskap/erstatning-tingsrett-formuesrett-og-rettsvern/claims.json',
    assessment: 'data/fagverk/politikk/juss_rettsvitenskap/erstatning-tingsrett-formuesrett-og-rettsvern/assessment.json',
    audit: 'reports/fagverk/juss-rettsvitenskap-tort-property-private-law-priority-protection-fulltext-v1-audit.json',
    source_brief: 'data/fag/politikk/juss_rettsvitenskap/tort_property_private_law_priority_protection_source_claim_brief_v1.json',
    source_brief_audit: 'reports/fagverk/juss-rettsvitenskap-tort-property-private-law-priority-protection-source-brief-v1-audit.json'
  });
}
write(registryFile, registry);

const reconciliationFile = 'reports/fagverk/juss-rettsvitenskap-reconciliation-v1.json';
const reconciliation = read(reconciliationFile);
reconciliation.updated_at = '2026-09-02';
reconciliation.status = 'reconciliation_complete_domains_1_2_3_4_5_6_7_8_9_materialized_domain_10_source_first_ready';
reconciliation.production_plan.materialized = 9;
reconciliation.production_plan.source_first_ready = 10;
reconciliation.production_plan.next_domain = 'familie_barn_arv_personrett';
reconciliation.production_plan.strict_completion_proven = false;
write(reconciliationFile, reconciliation);

const ciFile = '.github/ci/fagverk-juss-rettsvitenskap-domain-registry-v1.json';
const ci = read(ciFile);
for (const report of [
  'reports/fagverk/juss-rettsvitenskap-tort-property-private-law-priority-protection-fulltext-v1-audit.json',
  'reports/fagverk/juss-rettsvitenskap-family-child-inheritance-person-law-source-brief-v1-audit.json'
]) {
  if (!ci.ci.deterministicPaths.includes(report)) ci.ci.deterministicPaths.push(report);
}
write(ciFile, ci);

const sourceAuditFile = 'scripts/brief-juss-rettsvitenskap-tort-property-private-law-priority-protection-sources-v1.mjs';
let sourceAudit = fs.readFileSync(path.join(ROOT, sourceAuditFile), 'utf8');
const before = sourceAudit;
sourceAudit = sourceAudit.replace("  const chapterPath = path.join(ROOT, 'data/fagverk/politikk/juss_rettsvitenskap/erstatning-tingsrett-formuesrett-og-rettsvern.json');\n", '');
sourceAudit = sourceAudit.replace("  assert(!fs.existsSync(chapterPath), 'Felt 9 skal ikke være fulltekstmaterialisert');\n", '');
assert(sourceAudit !== before && !sourceAudit.includes('chapterPath'), 'Klarte ikke å oppgradere Felt 9 source-first-auditen for materialisert felt');
writeText(sourceAuditFile, sourceAudit);

writeText('scripts/audit-juss-rettsvitenskap-reconciliation-v1.mjs', `#!/usr/bin/env node
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
  const audit9 = read('reports/fagverk/juss-rettsvitenskap-tort-property-private-law-priority-protection-fulltext-v1-audit.json');
  const brief10 = read('data/fag/politikk/juss_rettsvitenskap/family_child_inheritance_person_law_source_claim_brief_v1.json');
  const subcategory = category.canonicalSubcategories?.politikk?.find((row) => row.id === 'juss_rettsvitenskap');

  assert(subcategory?.status === 'expansion_planned', 'Juss skal forbli expansion_planned');
  assert(registry.progress.materializedDomains === 9 && registry.progress.totalDomains === 12 && registry.progress.strictCompletionProven === false && registry.materialized.length === 9, 'Juss skal stå 9/12');
  assert(registry.next_gate === 'family_child_inheritance_person_law_fulltext', 'Neste gate må være Felt 10 fulltekst');
  assert(registry.materialized.every((row, index) => row.domain_id === ci.domains[index].domainId), 'Materialized registry-rekkefølge feil');
  assert(report.production_plan.materialized === 9 && report.production_plan.source_first_ready === 10 && report.production_plan.next_domain === ci.domains[9].domainId && report.production_plan.strict_completion_proven === false, 'Reconciliation-fremdrift feil');
  assert(report.domains.length === 12 && report.domains.every((row, index) => row.ordinal === index + 1 && row.domain_id === ci.domains[index].domainId), 'Reconciliation/CI-rekkefølge feil');
  assert(report.domains.filter((row) => row.classification === 'reuse_with_expansion').length === 1 && report.domains.filter((row) => row.classification === 'new_production_required').length === 11, 'Klassifisering feil');
  assert(report.move_decision?.move_existing_files?.length === 0, 'Eksisterende Politikk-filer skal ikke flyttes');
  assert(brief8.domain.ordinal === 8 && brief8.domain.id === ci.domains[7].domainId && brief8.status === 'source_first_ready_not_materialized', 'Felt 8 source-first-binding feil');
  assert(audit8.domain_id === ci.domains[7].domainId && audit8.status === 'pass_fulltext_materialized_domain_ready_for_registry' && audit8.six_part_quality_review.total === 30, 'Felt 8 fulltekst-audit feil');
  assert(brief9.domain.ordinal === 9 && brief9.domain.id === ci.domains[8].domainId && brief9.status === 'source_first_ready_not_materialized', 'Felt 9 source-first-binding feil');
  assert(audit9.domain_id === ci.domains[8].domainId && audit9.status === 'pass_fulltext_materialized_domain_ready_for_registry' && audit9.six_part_quality_review.total === 30, 'Felt 9 fulltekst-audit feil');
  assert(brief10.domain.ordinal === 10 && brief10.domain.id === ci.domains[9].domainId && brief10.status === 'source_first_ready_not_materialized', 'Felt 10 source-first-binding feil');

  return { status: 'pass', domains: 12, materialized: 9, sourceFirstReady: 10, strictCompletionProven: false, reuseWithExpansion: 1, newProductionRequired: 11, moveExisting: 0, nextDomain: ci.domains[9].domainId };
}

try {
  const report = audit();
  console.log(\`Juss & rettsvitenskap reconciliation OK: \${report.materialized}/\${report.domains} materialisert, felt \${report.sourceFirstReady} source-first klart.\`);
} catch (error) {
  console.error(\`Juss & rettsvitenskap reconciliation FEIL: \${error.message}\`);
  process.exitCode = 1;
}
`);

writeText('tests/juss-rettsvitenskap-reconciliation-v1.test.mjs', `import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-juss-rettsvitenskap-reconciliation-v1.mjs';

test('Juss har felt 1-9 materialisert og felt 10 Familie/barn/arv/personrett source-first', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.domains, 12);
  assert.equal(report.materialized, 9);
  assert.equal(report.sourceFirstReady, 10);
  assert.equal(report.strictCompletionProven, false);
  assert.equal(report.nextDomain, 'familie_barn_arv_personrett');
});
`);

console.log('TEMP Juss Felt 9/10 canonical kobling skrevet: 9/12 + Felt 10 source-first.');
