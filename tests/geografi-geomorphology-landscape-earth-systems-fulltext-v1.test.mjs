import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-geografi-geomorphology-landscape-earth-systems-fulltext-v1.mjs';

test('Geografi felt 3 fulltekst låser reuse, 4/8/32 og 32 reverifiserte claims', () => {
  const report = audit();
  assert.equal(report.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.equal(report.counts.modules, 4);
  assert.equal(report.counts.sections, 8);
  assert.equal(report.counts.paragraphs, 32);
  assert.equal(report.counts.verifiedClaims, 32);
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.assessments, 8);
  assert.equal(report.counts.decisionCases, 6);
  assert.equal(report.counts.reuseOwnerChapters, 2);
  assert.equal(report.gates.reuse_owner_preserved, true);
});
