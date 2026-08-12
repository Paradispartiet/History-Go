import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiSocialUniversity } from '../scripts/audit-fagverk-psykologi-social-university.mjs';

test('Psykologi materialiserer eksakt 20/20 universitetskrav i sosialpsykologi', () => {
  const { report } = auditPsykologiSocialUniversity({ checkReport: false });
  assert.equal(report.status, 'psykologi_social_university_complete');
  assert.equal(report.coverage.requiredTopicCount, 20);
  assert.equal(report.coverage.materializedTopicCount, 20);
  assert.equal(report.coverage.exactTopicCoverage, true);
  assert.deepEqual(report.coverage.familyCounts, {
    social_cognition_attitudes: 5,
    influence_groups_power: 5,
    relations_cooperation_conflict: 5,
    intergroup_methods_context: 5
  });
  assert.equal(report.sources.sourceCount, 22);
  assert.equal(report.sources.allTopicsSourced, true);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});

test('Sosialpsykologi krever metodekritikk og vern mot manipulasjon, merking og overgeneralisering', () => {
  const { report } = auditPsykologiSocialUniversity({ checkReport: false });
  assert.equal(report.gates.allTopicsHaveDefinitions, true);
  assert.equal(report.gates.allTopicsHaveLearningOutcomes, true);
  assert.equal(report.gates.allTopicsHaveCriticalDistinctions, true);
  assert.equal(report.gates.allTopicsHaveMisuseGuards, true);
  assert.equal(report.gates.allTopicsHaveResolvedSources, true);
  assert.equal(report.gates.noIndividualCharacterOrDiagnosisFromSingleObservation, true);
  assert.equal(report.gates.noManipulationRecipeOrAutomaticControl, true);
  assert.equal(report.gates.noGroupAverageOrBiasMeasureAsIndividualVerdict, true);
  assert.equal(report.gates.replicationCultureAndContextLimitsPresent, true);
});
