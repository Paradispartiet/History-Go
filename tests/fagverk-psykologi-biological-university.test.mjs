import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiBiologicalUniversity } from '../scripts/audit-fagverk-psykologi-biological-university.mjs';

test('Psykologi materialiserer eksakt 15/15 universitetskrav i biologisk psykologi', () => {
  const { report } = auditPsykologiBiologicalUniversity({ checkReport: false });
  assert.equal(report.status, 'psykologi_biological_university_complete');
  assert.equal(report.coverage.requiredTopicCount, 15);
  assert.equal(report.coverage.materializedTopicCount, 15);
  assert.equal(report.coverage.exactTopicCoverage, true);
  assert.deepEqual(report.coverage.familyCounts, {
    cellular_systems: 4,
    development_variation: 3,
    regulation_behavior: 6,
    methods_inference: 2
  });
  assert.equal(report.sources.sourceCount, 8);
  assert.equal(report.sources.allTopicsSourced, true);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});

test('Biologisk psykologi krever fagskiller, kildeoppløsning og determinismevern', () => {
  const { report } = auditPsykologiBiologicalUniversity({ checkReport: false });
  assert.equal(report.gates.allTopicsHaveDefinitions, true);
  assert.equal(report.gates.allTopicsHaveLearningOutcomes, true);
  assert.equal(report.gates.allTopicsHaveCriticalDistinctions, true);
  assert.equal(report.gates.allTopicsHaveMisuseGuards, true);
  assert.equal(report.gates.allTopicsHaveResolvedSources, true);
  assert.equal(report.gates.biologicalDeterminismGuardPresent, true);
});
