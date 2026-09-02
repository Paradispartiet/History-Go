#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const write = (file, value) => fs.writeFileSync(path.join(ROOT, file), `${JSON.stringify(value, null, 2)}\n`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };

export function audit() {
  const brief = read('data/fag/politikk/juss_rettsvitenskap/family_child_inheritance_person_law_source_claim_brief_v1.json');
  const claims = brief.topic_briefs.flatMap((topic) => topic.planned_claims || []);
  const sourceIds = new Set(brief.sources.map((source) => source.id));
  const sourceById = new Map(brief.sources.map((source) => [source.id, source]));
  const chapterPath = path.join(ROOT, 'data/fagverk/politikk/juss_rettsvitenskap/familie-barn-arv-og-personrett.json');

  assert(brief.status === 'source_first_ready_not_materialized', 'Felt 10 skal være source-first, ikke materialisert');
  assert(brief.domain.ordinal === 10 && brief.domain.id === 'familie_barn_arv_personrett', 'Felt 10 har feil binding');
  assert(brief.sources.length === 13 && sourceIds.size === 13, 'Felt 10 krever 13 unike kilder');
  assert(brief.topic_briefs.length === 8 && claims.length === 32 && new Set(claims.map((claim) => claim.id)).size === 32, 'Felt 10 krever 8 emner og 32 unike claims');
  assert(brief.planned_assessments.length === 8 && brief.decision_scenarios.length === 6, 'Felt 10 krever 8 vurderinger og 6 case');
  assert(brief.sources.every((source) => source.url.startsWith('https://lovdata.no/') && source.retrieval_status === 'verified_2026_09_02'), 'Lovdata-URL eller verifiseringsdato mangler');
  assert(claims.every((claim) => claim.status === 'planned_requires_fulltext_verification' && claim.source_ids.length >= 2 && claim.source_ids.every((id) => sourceIds.has(id))), 'Alle claims må ha minst to gyldige kilder');
  const usedSourceIds = new Set([...claims, ...brief.decision_scenarios].flatMap((row) => row.source_ids));
  assert(brief.sources.every((source) => usedSourceIds.has(source.id)), 'Alle kilder må brukes av claim eller case');
  assert(brief.topic_briefs.every((topic) => topic.method_ids.length >= 2 && topic.source_ids.length >= 2 && topic.boundary.length >= 180), 'Alle emner må ha metode, kilder og avgrensning');
  assert(brief.decision_scenarios.every((scenario) => scenario.source_ids.length >= 2 && scenario.source_ids.every((id) => sourceIds.has(id))), 'Alle case må ha minst to gyldige kilder');
  assert(brief.fulltext_requirements.modules === 4 && brief.fulltext_requirements.sections === 8 && brief.fulltext_requirements.paragraphs === 32 && brief.fulltext_requirements.verified_claims === 32, 'Felt 10 fulltekstplan må være 4/8/32/32');
  assert(!fs.existsSync(chapterPath), 'Felt 10 skal ikke være fulltekstmaterialisert');

  const currentChildLaw = sourceById.get('fam02-barnelova-1981-current');
  const enactedChildLaw = sourceById.get('fam03-barnelova-2025-not-in-force');
  assert(currentChildLaw?.effective_status === 'in_force_as_of_2026_09_02' && currentChildLaw.type === 'current-statute', 'Gjeldende barnelov 1981 må markeres som ikraftsatt');
  assert(enactedChildLaw?.effective_status === 'enacted_not_in_force_as_of_2026_09_02' && enactedChildLaw.type === 'enacted-statute-not-in-force', 'Barnelova 2025 må markeres som vedtatt, men ikke i kraft');
  const transitionClaim = claims.find((claim) => claim.id === 'family-09');
  assert(transitionClaim?.source_ids.includes(currentChildLaw.id) && transitionClaim?.source_ids.includes(enactedChildLaw.id), 'Lovovergangen må ha eksplisitt claim-spor');

  const boundaries = brief.topic_briefs.map((topic) => topic.boundary).join(' ').toLowerCase();
  for (const token of ['ekteskap', 'felleseie', 'samboer', 'foreldreansvar', 'samvær', 'barnets beste', 'barnevern', 'adopsjon', 'arverett', 'testament', 'vergemål', 'personnavn', 'folkeregister', 'personvern', 'ikke i kraft']) {
    assert(boundaries.includes(token), `Mangler familie-/personrettslig grense: ${token}`);
  }

  const report = {
    schema: 'history_go_juss_rettsvitenskap_family_child_inheritance_person_law_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-09-02',
    status: 'pass_source_first_ready_not_materialized',
    counts: { sources: 13, topics: 8, plannedClaims: 32, plannedAssessments: 8, decisionScenarios: 6 },
    gates: {
      marriage_status_dissolution_and_family_life: true,
      matrimonial_property_cohabitation_and_housing: true,
      parenthood_responsibility_residence_contact_and_transition: true,
      child_rights_welfare_participation_and_proportionality: true,
      adoption_parental_status_name_and_registration: true,
      intestacy_spouse_cohabitant_undivided_estate_and_forced_share: true,
      testament_estate_guardianship_capacity_and_future_mandate: true,
      personal_name_registration_capacity_and_privacy: true,
      current_and_enacted_not_in_force_child_law_distinguished: true,
      registration_and_underlying_civil_right_distinguished: true,
      not_materialized: true
    },
    next_gate: 'family_child_inheritance_person_law_fulltext'
  };
  write('reports/fagverk/juss-rettsvitenskap-family-child-inheritance-person-law-source-brief-v1-audit.json', report);
  return report;
}

try {
  const report = audit();
  console.log(`Familie/barn/arv/personrett source-first OK: ${report.counts.sources} kilder / ${report.counts.topics} emner / ${report.counts.plannedClaims} claims.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
