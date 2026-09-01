import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-juss-rettsvitenskap-procedure-evidence-civil-criminal-process-fulltext-v1.mjs';

test('Rettergang/bevis er strict 4/8/32 fulltekst', () => {
  const report = audit();
  assert.equal(report.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.deepEqual(report.counts, { modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, sources: 13, assessments: 8, decisionScenarios: 6 });
  assert.equal(report.six_part_quality_review.total, 30);
});
