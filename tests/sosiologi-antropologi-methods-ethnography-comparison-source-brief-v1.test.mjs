import assert from 'node:assert/strict';
import test from 'node:test';
import { audit } from '../scripts/brief-sosiologi-antropologi-methods-ethnography-comparison-sources-v1.mjs';

test('metode, etnografi og sammenligning er kildeklart uten fulltekstregistrering', () => {
  const report = audit();
  assert.equal(report.status, 'pass');
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.topicBriefs, 8);
  assert.equal(report.counts.plannedClaims, 32);
  assert.ok(report.six_part_quality_review.total >= 27);
});
