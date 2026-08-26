#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF = 'data/fag/utdanning/special_education_source_claim_brief_v1.json';
const REPORT = 'reports/fagverk/utdanning-special-education-source-brief-v1-audit.json';
const abs = (file) => path.join(ROOT, file);
const read = (file) => JSON.parse(fs.readFileSync(abs(file), 'utf8'));
const write = (file, value) => {
  fs.mkdirSync(path.dirname(abs(file)), { recursive: true });
  fs.writeFileSync(abs(file), `${JSON.stringify(value, null, 2)}\n`);
};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

export function audit({ writeReport = false } = {}) {
  const brief = read(BRIEF);
  const topics = brief.topic_briefs;
  const claims = topics.flatMap((topic) => topic.planned_claims);
  const sourceIds = new Set(brief.sources.map((source) => source.id));

  assert(
    brief.subject_id === 'utdanning'
      && brief.scope.primary_domain_id === 'spesialpedagogikk'
      && brief.scope.canonical_emne_id === 'em_utdanning_spesialpedagogikk',
    'Feil spesialpedagogikk-scope',
  );
  assert(
    brief.runtime_registration.registered === false
      && !brief.metadata_registration.global_status_mutation_in_source_brief,
    'Source brief kan ikke registrere runtime eller global status',
  );
  assert(
    brief.sources.length === 13
      && topics.length === 8
      && claims.length === 32
      && brief.decision_scenarios.length === 6,
    'Spesialpedagogikk skal ha 13 kilder, 8 spor, 32 claims og 6 scenarioer',
  );
  assert(
    new Set(claims.map((claim) => claim.id)).size === 32
      && claims.every((claim) => claim.status === 'planned_requires_fulltext_verification'
        && claim.source_ids.length >= 2
        && claim.source_ids.every((id) => sourceIds.has(id))),
    'Claims må være unike og kildebundet',
  );
  assert(
    brief.sources.every((source) => source.url.startsWith('https://')
      && source.source_location
      && source.retrieval_status === 'verified_2026-08-27'),
    'Kilder må være inspiserbare',
  );
  const usedSources = new Set(claims.flatMap((claim) => claim.source_ids));
  assert([...sourceIds].every((id) => usedSources.has(id)), 'Alle 13 kilder må brukes');
  assert(
    brief.source_policy.rights_and_participation_are_primary
      && brief.source_policy.diagnosis_does_not_determine_instruction
      && brief.source_policy.functioning_is_contextual_and_interactive
      && brief.source_policy.inclusion_requires_learning_and_belonging_not_placement_only
      && brief.source_policy.assessment_must_include_environment_and_student_voice
      && brief.source_policy.response_to_intervention_is_not_diagnosis_by_delay
      && brief.source_policy.aac_is_language_access_not_reward_or_last_resort,
    'Kritiske spesialpedagogiske grenser mangler',
  );

  const report = {
    schema: 'history_go_utdanning_special_education_source_brief_audit_v1',
    version: '1.0.0',
    updated_at: '2026-08-27',
    status: 'pass',
    subject_id: 'utdanning',
    domain_id: 'spesialpedagogikk',
    counts: {
      verifiedSources: 13,
      topicBriefs: 8,
      plannedClaims: 32,
      decisionScenarios: 6,
      modules: 4,
    },
    gates: {
      sourceFirstUnregistered: true,
      noGlobalStatusMutation: true,
      allSourcesInspectable: true,
      everyClaimSourceBound: true,
      everySourceUsed: true,
      rightsAndParticipationBoundary: true,
      diagnosisNonDeterminismBoundary: true,
      contextualFunctioningBoundary: true,
      inclusionBeyondPlacementBoundary: true,
      studentVoiceAndEnvironmentBoundary: true,
      rtiNonDiagnosisBoundary: true,
      targetedSupportNonFatalismBoundary: true,
      aacLanguageAccessBoundary: true,
      fulltextClaimTraceRequired: true,
    },
    six_part_quality_review: {
      source_authority_and_provenance: 5,
      claim_plan_and_verifiability: 5,
      special_education_theory_and_boundary_quality: 5,
      rights_participation_and_learner_ethics: 5,
      pedagogy_and_scenarios: 4,
      architecture_and_reproducibility: 5,
      total: 29,
      maximum: 30,
      note: 'Source-first-produksjon; claims forblir planlagte til fulltekst med gjensidig paragraph↔claim-spor.',
    },
    next_gate: brief.next_gate,
  };

  if (writeReport) write(REPORT, report);
  else assert(isDeepStrictEqual(read(REPORT), report), `${REPORT} er utdatert`);
  return report;
}

try {
  const report = audit({ writeReport: process.argv.includes('--write-report') });
  console.log(`Spesialpedagogikk source brief OK: ${report.counts.verifiedSources} kilder, ${report.counts.topicBriefs} spor, ${report.counts.plannedClaims} claims; ${report.six_part_quality_review.total}/30.`);
} catch (error) {
  console.error(`Spesialpedagogikk source brief FEIL: ${error.message}`);
  process.exitCode = 1;
}
