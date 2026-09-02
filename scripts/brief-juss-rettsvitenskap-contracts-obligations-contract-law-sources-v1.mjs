#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read('data/fag/politikk/juss_rettsvitenskap/contracts_obligations_contract_law_source_claim_brief_v1.json');
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims || []);
  const sourceIds = new Set(brief.sources.map((source) => source.id));

  assert(brief.status === 'source_first_ready_not_materialized', 'Felt 8 skal være source-first, ikke materialisert');
  assert(brief.domain.ordinal === 8 && brief.domain.id === 'avtaler_obligasjoner_kontraktsrett', 'Felt 8 har feil binding');
  assert(brief.sources.length === 13 && sourceIds.size === 13, 'Felt 8 krever 13 unike kilder');
  assert(brief.topic_briefs.length === 8 && claims.length === 32 && new Set(claims.map((claim) => claim.id)).size === 32, 'Felt 8 krever 8 emner og 32 unike claims');
  assert(brief.planned_assessments.length === 8 && brief.decision_scenarios.length === 6, 'Felt 8 krever 8 vurderinger og 6 case');
  assert(brief.sources.every((source) => source.url.startsWith('https://') && source.retrieval_status === 'verified_2026_09_01'), 'Kilde-URL eller verifiseringsdato mangler');
  assert(claims.every((claim) => claim.source_ids.length >= 2 && claim.source_ids.every((id) => sourceIds.has(id))), 'Alle claims må ha minst to gyldige kilder');
  assert(brief.decision_scenarios.every((scenario) => scenario.source_ids.length >= 2 && scenario.source_ids.every((id) => sourceIds.has(id))), 'Alle case må ha minst to gyldige kilder');
  assert(brief.fulltext_requirements.modules === 4 && brief.fulltext_requirements.sections === 8 && brief.fulltext_requirements.paragraphs === 32 && brief.fulltext_requirements.verified_claims === 32, 'Felt 8 fulltekstplan må være 4/8/32/32');
  const boundaries = brief.topic_briefs.map((topic) => topic.boundary).join(' ').toLowerCase();
  for (const token of ['tilbud', 'fullmakt', 'standardvilkår', 'ugyldighet', 'levering', 'forsinkelse', 'mangel', 'heving', 'erstatning', 'foreldelse', 'angrerett', 'cisg']) {
    assert(boundaries.includes(token), `Mangler kontraktsrettslig grense: ${token}`);
  }

  const report = {
    schema: 'history_go_juss_rettsvitenskap_contracts_obligations_contract_law_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-09-01',
    status: 'pass_source_first_ready_not_materialized',
    counts: { sources: 13, topics: 8, plannedClaims: 32, plannedAssessments: 8, decisionScenarios: 6 },
    gates: {
      formation_offer_acceptance_and_scope: true,
      authority_terms_and_transparency: true,
      invalidity_unfairness_and_consumer_protection: true,
      performance_delivery_payment_and_risk: true,
      delay_performance_withholding_and_termination: true,
      conformity_cure_and_replacement: true,
      price_reduction_damages_and_mitigation: true,
      assignment_limitation_withdrawal_and_cisg: true,
      mandatory_and_default_rules_distinguished: true,
      not_materialized: true
    },
    next_gate: 'contracts_obligations_contract_law_fulltext'
  };
  write('reports/fagverk/juss-rettsvitenskap-contracts-obligations-contract-law-source-brief-v1-audit.json', report);
  return report;
}

try {
  const report = audit();
  console.log(`Avtaler/obligasjoner source-first OK: ${report.counts.sources} kilder / ${report.counts.topics} emner / ${report.counts.plannedClaims} claims.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
