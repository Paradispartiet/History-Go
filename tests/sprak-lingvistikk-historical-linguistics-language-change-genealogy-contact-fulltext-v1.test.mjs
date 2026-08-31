import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-sprak-lingvistikk-historical-linguistics-language-change-genealogy-contact-fulltext-v1.mjs';

test('Språk & lingvistikk felt 9 Historisk lingvistikk er fulltekstmaterialisert med strict evidensporter', () => {
  const r=audit();
  assert.equal(r.status,'pass_fulltext_materialized_domain_ready_for_registry');
  assert.deepEqual(r.counts,{modules:4,sections:8,paragraphs:32,verifiedClaims:32,sources:13,assessments:8,decisionScenarios:6});
  assert.equal(r.six_part_quality_review.total,30);
  assert.equal(Object.values(r.gates).every(Boolean),true);
});
