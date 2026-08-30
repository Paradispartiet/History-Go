import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-geografi-economic-geography-resources-transport-value-chains-fulltext-v1.mjs';

test('Geografi felt 9 materialiserer økonomisk geografi med strict source-first spor', () => {
  const result = audit();
  assert.equal(result.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.deepEqual(result.counts, { modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, verifiedSources: 13, assessments: 8, decisionCases: 6 });
  assert.equal(result.gates.gross_trade_value_added_boundary, true);
  assert.equal(result.gates.fdi_flow_stock_boundary, true);
  assert.equal(result.gates.resilience_scenario_boundary, true);
});
