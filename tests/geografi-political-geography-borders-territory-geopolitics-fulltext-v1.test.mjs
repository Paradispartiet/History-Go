import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-geografi-political-geography-borders-territory-geopolitics-fulltext-v1.mjs';

test('Geografi felt 10 materialiserer politisk geografi med strict source-first spor', () => {
  const result = audit();
  assert.equal(result.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.deepEqual(result.counts, { modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, verifiedSources: 13, assessments: 8, decisionCases: 6 });
  assert.equal(result.gates.sovereignty_jurisdiction_control_boundary, true);
  assert.equal(result.gates.maritime_zone_boundary, true);
  assert.equal(result.gates.conflict_event_status_boundary, true);
  assert.equal(result.gates.disputed_boundary_metadata, true);
});
