import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFilmTvTelevisionPlatformsParticipationSourceBriefV1 } from '../scripts/brief-film-tv-television-platforms-participation-sources-v1.mjs';

test('femte planenhet har komplett og deterministisk kilde- og claimbrief', () => {
  const result = auditFilmTvTelevisionPlatformsParticipationSourceBriefV1();
  assert.deepEqual(result.report.summary, {
    emne_count: 8,
    source_count: 20,
    case_count: 19,
    planned_claim_count: 31,
    planned_claim_counts_by_emne: [4, 4, 4, 4, 3, 4, 4, 4],
    proposed_module_count: 3,
    registered_chapter_count_delta: 1,
    resolved_claim_count: 31
  });
  assert.ok(Object.values(result.report.gates).every(Boolean));
});

test('claim- og modulomfanget følger problemgrensene', () => {
  const result = auditFilmTvTelevisionPlatformsParticipationSourceBriefV1();
  assert.equal(new Set(result.topicBriefs.map((topic) => topic.planned_claims.length)).size, 2);
  assert.equal(new Set(result.brief.proposed_module_order.map((module) => module.emne_ids.length)).size, 2);
  assert.ok(result.topicBriefs.every((topic) => topic.source_ids.length >= 3 && topic.case_ids.length >= 3 && topic.method_ids.length >= 1 && topic.canonical_boundary));
});

test('overganger skiller teknologi, institusjon, program, tilgang og bruk', () => {
  const result = auditFilmTvTelevisionPlatformsParticipationSourceBriefV1();
  assert.equal(result.brief.source_policy.technological_transition_requires_documented_institution_program_access_or_use_change, true);
  assert.equal(result.brief.production_requirements.transitions_must_keep_technology_institution_program_access_and_use_distinct, true);
  assert.equal(result.brief.production_requirements.corporate_primary_sources_must_not_define_the_whole_transition, true);
  const roles = result.brief.sources.map((row) => row.evidence_role);
  assert.ok(roles.some((role) => /corporate-primary-trace/.test(role)));
  assert.ok(roles.some((role) => /historical-audience-research/.test(role)));
  assert.ok(roles.some((role) => /institutional-historiography/.test(role)));
});

test('alle casekilder er tilgjengelige i emnet som bruker caset', () => {
  const result = auditFilmTvTelevisionPlatformsParticipationSourceBriefV1();
  const cases = new Map(result.brief.case_candidates.map((row) => [row.id, row]));
  for (const topic of result.topicBriefs) {
    for (const caseId of topic.case_ids) {
      assert.ok(cases.get(caseId).source_ids.every((sourceId) => topic.source_ids.includes(sourceId)));
    }
  }
});

test('briefen dokumenterer registrering først etter fulltekst- og evidensaudit', () => {
  const result = auditFilmTvTelevisionPlatformsParticipationSourceBriefV1();
  assert.ok(result.plannedClaims.every((claim) => claim.status === 'resolved_to_verified_claim' && claim.final_claim_id === claim.id));
  assert.equal(result.brief.runtime_registration.registered, true);
  assert.equal(result.brief.runtime_registration.registration_after_full_chapter_gate, true);
  assert.equal(result.registry.subjects.film_tv.chapters.some((chapter) => chapter.id === 'fjernsyn-plattformer-og-deltakerhistorier'), true);
  assert.equal(result.status.subjects.find((row) => row.id === 'film_tv').nextGate, 'television_platforms_participation_full_chapter_complete_next_unit_source_brief');
});

test('naboområdene forblir eksplisitt utenfor enheten', () => {
  const result = auditFilmTvTelevisionPlatformsParticipationSourceBriefV1();
  assert.equal(result.brief.source_policy.current_platform_power_audience_data_and_fan_use_remain_outside_this_unit, true);
  assert.equal(result.brief.source_policy.documentary_close_analysis_of_evidence_and_ethics_remains_in_next_unit, true);
  assert.equal(result.brief.source_policy.archive_preservation_practice_remains_outside_this_unit, true);
  assert.equal(result.brief.production_requirements.current_platform_market_power_and_recommendation_analysis_remain_outside_scope, true);
});
