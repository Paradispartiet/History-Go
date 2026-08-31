import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-sprak-lingvistikk-morphology-word-structure-inflection-derivation-fulltext-v1.mjs';

test('Språk & lingvistikk felt 4 Morfologi er strict fulltekstmaterialisert', () => {
  const report = audit();
  assert.equal(report.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.deepEqual(report.counts, {modules:4,sections:8,paragraphs:32,verifiedClaims:32,sources:13,assessments:8,decisionScenarios:6});
  assert.equal(report.six_part_quality_review.total, 30);
  assert.equal(report.next_gate, 'register_domain_4_only_after_domain_5_syntax_source_first_is_ready');
});
