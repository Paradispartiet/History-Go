import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/brief-sosiologi-antropologi-norms-identity-everyday-life-sources-v1.mjs';

test('normer, identitet og hverdagsliv er kildeklart som reuse-with-expansion uten å telles som materialisert', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.counts.verifiedExpansionSources, 13);
  assert.equal(report.counts.topicBriefs, 8);
  assert.equal(report.counts.plannedExpansionClaims, 32);
  assert.equal(report.counts.preservedExistingClaims, 45);
  assert.ok(report.six_part_quality_review.total >= 27);
});
