import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-sprak-lingvistikk-sociolinguistics-variation-multilingualism-language-power-sources-v1.mjs';

test('Språk & lingvistikk felt 8 Sosiolingvistikk er source-first klar, reuse-with-expansion og ikke materialisert', () => {
  const report = audit();
  assert.equal(report.status, 'pass_source_first_ready_not_materialized');
  assert.deepEqual(report.counts, {sources:13,topicBriefs:8,plannedClaims:32,decisionScenarios:6,plannedAssessments:8});
  assert.equal(report.gates.reuse_with_expansion, true);
  assert.equal(report.gates.existing_owner_content_preserved, true);
  assert.equal(report.six_part_quality_review.total, 30);
  assert.equal(report.next_gate, 'materialize_sociolinguistics_variation_multilingualism_language_power_fulltext');
});
