import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-geografi-population-demography-migration-mobility-fulltext-v1.mjs';

test('Geografi felt 7 er fulltekstmaterialisert med streng demografi- og romlig evidenskontrakt', () => {
  const result = audit();
  assert.equal(result.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.deepEqual(result.counts, { modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, verifiedSources: 13, assessments: 8, decisionCases: 6 });
  assert.equal(result.six_part_quality_review.total, 30);
  assert.equal(result.next_gate, 'register_domain_7_only_after_domain_8_source_first_is_ready');
});
