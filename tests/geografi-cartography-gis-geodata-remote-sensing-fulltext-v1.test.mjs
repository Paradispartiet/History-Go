import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-geografi-cartography-gis-geodata-remote-sensing-fulltext-v1.mjs';

test('Geografi felt 2 materialiserer kartografi, GIS, geodata og fjernmåling med strict claim- og valideringsspor', () => {
  const report = audit();
  assert.equal(report.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.equal(report.domain_id, 'kartografi_gis_geodata_fjernmaling');
  assert.deepEqual(report.counts, {
    modules: 4,
    sections: 8,
    paragraphs: 32,
    verifiedClaims: 32,
    verifiedSources: 13,
    assessments: 8,
    decisionCases: 6
  });
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 30);
  assert.equal(report.next_gate, 'register_domain_2_only_after_domain_3_source_first_is_ready');
});
