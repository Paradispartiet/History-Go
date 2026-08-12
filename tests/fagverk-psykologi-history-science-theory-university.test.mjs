import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiHistoryScienceTheoryUniversity } from '../scripts/audit-fagverk-psykologi-history-science-theory-university.mjs';

test('Psykologi materialiserer eksakt 20/20 universitetskrav i historie og vitenskapsteori', () => {
  const { report } = auditPsykologiHistoryScienceTheoryUniversity({ checkReport: false });
  assert.equal(report.status, 'psykologi_history_science_theory_university_complete');
  assert.equal(report.coverage.requiredTopicCount, 20);
  assert.equal(report.coverage.materializedTopicCount, 20);
  assert.equal(report.coverage.exactTopicCoverage, true);
  assert.deepEqual(report.coverage.familyCounts, {
    origins_institutions: 5,
    schools_turns: 5,
    science_theory_explanation_measurement: 5,
    evidence_ethics_historiography: 5
  });
  assert.equal(report.sources.sourceCount, 25);
  assert.equal(report.sources.allTopicsSourced, true);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});

test('Historie og vitenskapsteori krever kildekritikk og vern mot diagnose, lineær kanon og evidensoverreach', () => {
  const { report } = auditPsykologiHistoryScienceTheoryUniversity({ checkReport: false });
  assert.equal(report.gates.allTopicsHaveDefinitions, true);
  assert.equal(report.gates.allTopicsHaveLearningOutcomes, true);
  assert.equal(report.gates.allTopicsHaveCriticalDistinctions, true);
  assert.equal(report.gates.allTopicsHaveMisuseGuards, true);
  assert.equal(report.gates.allTopicsHaveResolvedSources, true);
  assert.equal(report.gates.noRetrospectiveDiagnosisOrPersonLabel, true);
  assert.equal(report.gates.noSingleOriginProgressLadderOrTotalSchool, true);
  assert.equal(report.gates.noMeasurementPredictionOrNeuralCorrelateAsCompleteExplanation, true);
  assert.equal(report.gates.historicalContextValuesReplicationAndEthicsLimitsPresent, true);
});
