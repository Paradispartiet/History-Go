import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiDevelopmentalUniversity } from '../scripts/audit-fagverk-psykologi-developmental-university.mjs';

test('Psykologi materialiserer eksakt 20/20 universitetskrav i utviklingspsykologi', () => {
  const { report } = auditPsykologiDevelopmentalUniversity({ checkReport: false });
  assert.equal(report.status, 'psykologi_developmental_university_complete');
  assert.equal(report.coverage.requiredTopicCount, 20);
  assert.equal(report.coverage.materializedTopicCount, 20);
  assert.equal(report.coverage.exactTopicCoverage, true);
  assert.deepEqual(report.coverage.familyCounts, {
    foundations_methods: 5,
    early_development: 5,
    childhood_adolescence: 5,
    adulthood_aging_context: 5
  });
  assert.equal(report.sources.sourceCount, 19);
  assert.equal(report.sources.allTopicsSourced, true);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});

test('Utviklingspsykologi krever livsløp, metode og vern mot merking, determinisme og alder-kohort-feil', () => {
  const { report } = auditPsykologiDevelopmentalUniversity({ checkReport: false });
  assert.equal(report.gates.allTopicsHaveDefinitions, true);
  assert.equal(report.gates.allTopicsHaveLearningOutcomes, true);
  assert.equal(report.gates.allTopicsHaveCriticalDistinctions, true);
  assert.equal(report.gates.allTopicsHaveMisuseGuards, true);
  assert.equal(report.gates.allTopicsHaveResolvedSources, true);
  assert.equal(report.gates.noCasualMilestoneOrDevelopmentalDiagnosis, true);
  assert.equal(report.gates.attachmentAndParentingLabelGuardPresent, true);
  assert.equal(report.gates.adversityAndBrainDestinyGuardPresent, true);
  assert.equal(report.gates.ageCohortAndAgingDiagnosisGuardsPresent, true);
});
