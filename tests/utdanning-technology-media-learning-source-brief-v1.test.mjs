import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-utdanning-technology-media-learning-sources-v1.mjs';

test('Teknologi, medier og læring klargjøres source-first med lærings-, KI-, personvern- og evidensgrenser', () => {
  const report = audit();
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.topicBriefs, 8);
  assert.equal(report.counts.plannedClaims, 32);
  assert.equal(report.counts.decisionScenarios, 6);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 29);
});
