import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-geografi-settlement-urban-rural-urbanisation-fulltext-v1.mjs';

test('Geografi felt 8 fulltekst materialiserer bosetting og urban-rural analyse strengt', () => {
  const result = audit();
  assert.equal(result.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.equal(result.domain_id, 'bosetting_by_land_urbanisering');
  assert.deepEqual(result.counts, { modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, verifiedSources: 13, assessments: 8, decisionCases: 6 });
  assert.equal(result.six_part_quality_review.total, 30);
  assert.equal(result.next_gate, 'register_domain_8_only_after_domain_9_source_first_is_ready');
});
