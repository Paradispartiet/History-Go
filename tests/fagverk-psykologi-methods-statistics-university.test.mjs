import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiMethodsStatisticsUniversity } from '../scripts/audit-fagverk-psykologi-methods-statistics-university.mjs';

test('Psykologi materialiserer eksakt 20/20 universitetskrav i metode og statistikk', () => {
  const { report } = auditPsykologiMethodsStatisticsUniversity({ checkReport: false });
  assert.equal(report.status, 'psykologi_methods_statistics_university_complete');
  assert.equal(report.coverage.requiredTopicCount, 20);
  assert.equal(report.coverage.materializedTopicCount, 20);
  assert.equal(report.coverage.exactTopicCoverage, true);
  assert.deepEqual(report.coverage.familyCounts, {
    design: 6,
    sampling_measurement: 4,
    statistics: 6,
    inference_integrity: 4
  });
  assert.equal(report.sources.sourceCount, 7);
  assert.equal(report.sources.allTopicsSourced, true);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});

test('Metodegrenen krever faglig innhold, fagskiller og kildeoppløsning per tema', () => {
  const { report } = auditPsykologiMethodsStatisticsUniversity({ checkReport: false });
  assert.equal(report.gates.allTopicsHaveDefinitions, true);
  assert.equal(report.gates.allTopicsHaveLearningOutcomes, true);
  assert.equal(report.gates.allTopicsHaveCriticalDistinctions, true);
  assert.equal(report.gates.allTopicsHaveMisuseGuards, true);
  assert.equal(report.gates.allTopicsHaveResolvedSources, true);
  assert.equal(report.gates.minimumSourceBaseMet, true);
});
