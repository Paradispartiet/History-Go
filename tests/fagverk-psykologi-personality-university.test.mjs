import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiPersonalityUniversity } from '../scripts/audit-fagverk-psykologi-personality-university.mjs';

test('Psykologi materialiserer eksakt 16/16 universitetskrav i personlighetspsykologi', () => {
  const { report } = auditPsykologiPersonalityUniversity({ checkReport: false });
  assert.equal(report.status, 'psykologi_personality_university_complete');
  assert.equal(report.coverage.requiredTopicCount, 16);
  assert.equal(report.coverage.materializedTopicCount, 16);
  assert.equal(report.coverage.exactTopicCoverage, true);
  assert.deepEqual(report.coverage.familyCounts, {
    structure_models: 4,
    person_context_development: 4,
    origins_culture: 4,
    measurement_inference: 4
  });
  assert.equal(report.sources.sourceCount, 11);
  assert.equal(report.sources.allTopicsSourced, true);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});

test('Personlighetspsykologi krever fagskiller, kildeoppløsning og vern mot typing og overprediksjon', () => {
  const { report } = auditPsykologiPersonalityUniversity({ checkReport: false });
  assert.equal(report.gates.allTopicsHaveDefinitions, true);
  assert.equal(report.gates.allTopicsHaveLearningOutcomes, true);
  assert.equal(report.gates.allTopicsHaveCriticalDistinctions, true);
  assert.equal(report.gates.allTopicsHaveMisuseGuards, true);
  assert.equal(report.gates.allTopicsHaveResolvedSources, true);
  assert.equal(report.gates.personalityTypingAndDiagnosisGuardPresent, true);
  assert.equal(report.gates.briefObservationPredictionGuardPresent, true);
});
