import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/brief-geografi-climate-weather-zones-change-sources-v1.mjs';

test('Geografi felt 4 source-first låser klima-, rom- og usikkerhetskontrakt', () => {
  const report = audit();
  assert.equal(report.status, 'pass_source_first_ready_not_materialized');
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.topicBriefs, 8);
  assert.equal(report.counts.plannedClaims, 32);
  assert.equal(report.counts.decisionScenarios, 6);
  assert.equal(report.counts.plannedAssessments, 8);
  assert.equal(report.counts.reuseOwnerChapters, 1);
  assert.equal(report.gates.reuse_owner_preserved, true);
  assert.equal(report.gates.climate_normals, true);
  assert.equal(report.gates.regional_projection_uncertainty, true);
});
