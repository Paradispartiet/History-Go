import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-utdanning-school-leadership-organization-sources-v1.mjs';

test('Skoleledelse og organisasjon klargjøres source-first med mandat-, praksis- og kapasitetsgrenser', () => {
  const report = audit();
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.topicBriefs, 8);
  assert.equal(report.counts.plannedClaims, 32);
  assert.equal(report.counts.decisionScenarios, 6);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 29);
});
