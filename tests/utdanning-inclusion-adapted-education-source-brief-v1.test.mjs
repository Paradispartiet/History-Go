import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-utdanning-inclusion-adapted-education-sources-v1.mjs';

test('Inkludering og tilpasset opplæring låses source-first til 13/8/32/6 uten elevtyping', () => {
  const report = audit();
  assert.deepEqual(report.counts, {
    verifiedSources: 13,
    topicBriefs: 8,
    plannedClaims: 32,
    decisionScenarios: 6,
    modules: 4,
  });
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 29);
});
