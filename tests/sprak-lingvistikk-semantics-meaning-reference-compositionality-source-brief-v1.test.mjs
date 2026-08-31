import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-sprak-lingvistikk-semantics-meaning-reference-compositionality-sources-v1.mjs';

test('Språk & lingvistikk felt 6 Semantikk er source-first klar, ikke materialisert', () => {
  const report = audit();
  assert.equal(report.status, 'pass_source_first_ready_not_materialized');
  assert.deepEqual(report.counts, {sources:13,topicBriefs:8,plannedClaims:32,decisionScenarios:6,plannedAssessments:8});
  assert.equal(report.six_part_quality_review.total, 30);
  assert.equal(report.next_gate, 'materialize_semantics_meaning_reference_compositionality_fulltext');
});
