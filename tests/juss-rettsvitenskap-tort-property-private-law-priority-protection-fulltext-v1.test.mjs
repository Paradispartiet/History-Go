import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-juss-rettsvitenskap-tort-property-private-law-priority-protection-fulltext-v1.mjs';

test('Erstatning/tingsrett er 4/8/32/32 fulltekst med 30/30 strict audit', () => {
  const report = audit();
  assert.equal(report.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.deepEqual(report.counts, { modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, sources: 13, assessments: 8, decisionScenarios: 6 });
  assert.equal(report.six_part_quality_review.total, 30);
});
