import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-geografi-population-demography-migration-mobility-sources-v1.mjs';

test('Geografi felt 7 er source-first klart uten å telle som materialisert', () => {
  const result = audit();
  assert.equal(result.status, 'pass_source_first_ready_not_materialized');
  assert.deepEqual(result.counts, { verifiedSources: 13, topicBriefs: 8, plannedClaims: 32, decisionScenarios: 6, plannedAssessments: 8 });
  assert.equal(result.six_part_quality_review.total, 30);
  assert.equal(result.next_gate, 'population_demography_migration_mobility_fulltext');
});
