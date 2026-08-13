import test from 'node:test';
import assert from 'node:assert/strict';
import { auditReligionUniversityCompletion } from '../scripts/audit-fagverk-religion-university-completion-v1.mjs';

test('Religion university completion er komplett', () => {
  const { report } = auditReligionUniversityCompletion({ checkReport: false });
  assert.equal(report.status, 'religion_university_completion_complete');
  assert.equal(report.coverage.universityAreaCount, 12);
  assert.equal(report.coverage.canonicalTopicCount, 72);
  assert.equal(report.coverage.standaloneArticleCount, 72);
  assert.equal(report.coverage.requiredMethodCount, 18);
  assert.equal(report.coverage.conceptCount, 72);
  assert.equal(report.evidence.registeredSourceCount, 235);
  assert.equal(report.evidence.registeredClaimCount, 432);
  assert.equal(report.concepts.articleBacked, true);
  assert.equal(report.concepts.duplicateEditorialTextRequired, false);
  assert.ok(report.quality.minimumObservedScore >= 27);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.complete, true);
});
