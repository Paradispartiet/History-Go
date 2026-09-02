#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read('data/fag/politikk/juss_rettsvitenskap/tort_property_private_law_priority_protection_source_claim_brief_v1.json');
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims || []);
  const sourceIds = new Set(brief.sources.map((source) => source.id));
  const chapterPath = path.join(ROOT, 'data/fagverk/politikk/juss_rettsvitenskap/erstatning-tingsrett-formuesrett-og-rettsvern.json');

  assert(brief.status === 'source_first_ready_not_materialized', 'Felt 9 skal være source-first, ikke materialisert');
  assert(brief.domain.ordinal === 9 && brief.domain.id === 'erstatning_tingsrett_formuesrett_rettsvern', 'Felt 9 har feil binding');
  assert(brief.sources.length === 13 && sourceIds.size === 13, 'Felt 9 krever 13 unike kilder');
  assert(brief.topic_briefs.length === 8 && claims.length === 32 && new Set(claims.map((claim) => claim.id)).size === 32, 'Felt 9 krever 8 emner og 32 unike claims');
  assert(brief.planned_assessments.length === 8 && brief.decision_scenarios.length === 6, 'Felt 9 krever 8 vurderinger og 6 case');
  assert(brief.sources.every((source) => source.url.startsWith('https://lovdata.no/') && source.retrieval_status === 'verified_2026_09_02'), 'Lovdata-URL eller verifiseringsdato mangler');
  assert(claims.every((claim) => claim.status === 'planned_requires_fulltext_verification' && claim.source_ids.length >= 2 && claim.source_ids.every((id) => sourceIds.has(id))), 'Alle claims må ha minst to gyldige kilder');
  const usedSourceIds = new Set([...claims, ...brief.decision_scenarios].flatMap((row) => row.source_ids));
  assert(brief.sources.every((source) => usedSourceIds.has(source.id)), 'Alle kilder må brukes av claim eller case');
  assert(brief.topic_briefs.every((topic) => topic.method_ids.length >= 2 && topic.source_ids.length >= 2 && topic.boundary.length >= 180), 'Alle emner må ha metode, kilder og avgrensning');
  assert(brief.decision_scenarios.every((scenario) => scenario.source_ids.length >= 2 && scenario.source_ids.every((id) => sourceIds.has(id))), 'Alle case må ha minst to gyldige kilder');
  assert(brief.fulltext_requirements.modules === 4 && brief.fulltext_requirements.sections === 8 && brief.fulltext_requirements.paragraphs === 32 && brief.fulltext_requirements.verified_claims === 32, 'Felt 9 fulltekstplan må være 4/8/32/32');
  assert(!fs.existsSync(chapterPath), 'Felt 9 skal ikke være fulltekstmaterialisert');
  const boundaries = brief.topic_briefs.map((topic) => topic.boundary).join(' ').toLowerCase();
  for (const token of ['ansvarsgrunnlag', 'årsak', 'objektivt ansvar', 'personskade', 'sameie', 'naborettslig', 'servitutt', 'hevd', 'rettsvern', 'prioritet', 'god tro', 'pant', 'kreditorbeslag', 'omstøtelse']) {
    assert(boundaries.includes(token), `Mangler erstatnings-/tingsrettslig grense: ${token}`);
  }

  const report = {
    schema: 'history_go_juss_rettsvitenskap_tort_property_private_law_priority_protection_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-09-02',
    status: 'pass_source_first_ready_not_materialized',
    counts: { sources: 13, topics: 8, plannedClaims: 32, plannedAssessments: 8, decisionScenarios: 6 },
    gates: {
      liability_basis_causation_and_loss: true,
      statutory_strict_liability_and_insurance: true,
      causation_adequacy_contribution_and_mitigation: true,
      personal_injury_quantification: true,
      ownership_coownership_and_neighbour_law: true,
      servitudes_and_prescription: true,
      legal_protection_priority_and_good_faith_acquisition: true,
      security_creditor_seizure_avoidance_and_distribution: true,
      personal_and_proprietary_rights_distinguished: true,
      validity_priority_and_legal_protection_distinguished: true,
      not_materialized: true
    },
    next_gate: 'tort_property_private_law_priority_protection_fulltext'
  };
  write('reports/fagverk/juss-rettsvitenskap-tort-property-private-law-priority-protection-source-brief-v1-audit.json', report);
  return report;
}

try {
  const report = audit();
  console.log(`Erstatning/tingsrett source-first OK: ${report.counts.sources} kilder / ${report.counts.topics} emner / ${report.counts.plannedClaims} claims.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
