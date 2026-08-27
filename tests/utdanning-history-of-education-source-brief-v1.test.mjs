import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-utdanning-history-of-education-sources-v1.mjs';

test('Utdanningshistorie klargjøres source-first med historiske metodegrenser', () => {
  const report = audit();
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.topicBriefs, 8);
  assert.equal(report.counts.plannedClaims, 32);
  assert.equal(report.counts.decisionScenarios, 6);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 29);
});
