import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiCognitiveUniversity } from '../scripts/audit-fagverk-psykologi-cognitive-university.mjs';

test('Psykologi materialiserer eksakt 17/17 universitetskrav i kognitiv psykologi', () => {
  const { report } = auditPsykologiCognitiveUniversity({ checkReport: false });
  assert.equal(report.status, 'psykologi_cognitive_university_complete');
  assert.equal(report.coverage.requiredTopicCount, 17);
  assert.equal(report.coverage.materializedTopicCount, 17);
  assert.equal(report.coverage.exactTopicCoverage, true);
  assert.deepEqual(report.coverage.familyCounts, {
    perception_attention: 4,
    memory_learning: 4,
    language_representation: 4,
    reasoning_decision_control: 5
  });
  assert.equal(report.sources.sourceCount, 14);
  assert.equal(report.sources.allTopicsSourced, true);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});

test('Kognitiv psykologi krever fagskiller, kildeoppløsning og vern mot diagnose, falsk minnesikkerhet og tankelesing', () => {
  const { report } = auditPsykologiCognitiveUniversity({ checkReport: false });
  assert.equal(report.gates.allTopicsHaveDefinitions, true);
  assert.equal(report.gates.allTopicsHaveLearningOutcomes, true);
  assert.equal(report.gates.allTopicsHaveCriticalDistinctions, true);
  assert.equal(report.gates.allTopicsHaveMisuseGuards, true);
  assert.equal(report.gates.allTopicsHaveResolvedSources, true);
  assert.equal(report.gates.singleTaskDiagnosisGuardPresent, true);
  assert.equal(report.gates.memoryConfidenceAccuracyGuardPresent, true);
  assert.equal(report.gates.behavioralAndBrainThoughtReadingGuardPresent, true);
});
