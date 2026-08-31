import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-sprak-lingvistikk-linguistic-thinking-fulltext-v1.mjs';

test('Språk & lingvistikk felt 1 materialiseres strict med 4/8/32, 32 claims, 13 kilder, 8 vurderinger og 6 case', () => {
  const report = audit();
  assert.equal(report.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.deepEqual(report.counts, { modules:4, sections:8, paragraphs:32, verifiedClaims:32, sources:13, assessments:8, decisionScenarios:6 });
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 30);
  assert.equal(report.next_gate, 'register_domain_1_only_after_domain_2_phonetics_source_first_is_ready');
});
