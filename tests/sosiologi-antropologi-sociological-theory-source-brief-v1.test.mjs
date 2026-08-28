import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-sosiologi-antropologi-sociological-theory-sources-v1.mjs';

test('Sosiologisk teori klargjøres source-first med teori-, metode- og ansvarlighetsgrenser', () => {
  const report = audit();
  assert.equal(report.subject_id, 'politikk');
  assert.equal(report.canonical_subcategory_id, 'sosiologi_antropologi');
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.topicBriefs, 8);
  assert.equal(report.counts.plannedClaims, 32);
  assert.equal(report.counts.decisionScenarios, 6);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 29);
});
