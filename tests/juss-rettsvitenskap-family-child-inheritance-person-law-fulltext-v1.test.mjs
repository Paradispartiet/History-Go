import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-juss-rettsvitenskap-family-child-inheritance-person-law-fulltext-v1.mjs';

test('Juss felt 10 fulltekst er 4/8/32 med 32 claims, 13 kilder og 30/30', () => {
  const report = audit();
  assert.equal(report.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.deepEqual(report.counts, { modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, sources: 13, assessments: 8, decisionScenarios: 6 });
  assert.equal(report.gates.current_vs_enacted_not_in_force, true);
  assert.equal(report.six_part_quality_review.total, 30);
});
