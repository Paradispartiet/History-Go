import test from 'node:test';
import assert from 'node:assert/strict';
import { audit } from '../scripts/audit-geografi-geographic-thinking-fulltext-v1.mjs';

test('Geografisk tenkning materialiseres som 4 moduler, 8 seksjoner, 32 claims og 8 vurderinger', () => {
  const report = audit();
  assert.equal(report.subject_id, 'natur');
  assert.equal(report.canonical_subcategory_id, 'geografi');
  assert.equal(report.domain_id, 'geografisk_tenkning_sted_rom_skala_region');
  assert.equal(report.status, 'pass_fulltext_materialized_domain_ready_for_registry');
  assert.equal(report.counts.modules, 4);
  assert.equal(report.counts.sections, 8);
  assert.equal(report.counts.paragraphs, 32);
  assert.equal(report.counts.verifiedClaims, 32);
  assert.equal(report.counts.verifiedSources, 13);
  assert.equal(report.counts.assessments, 8);
  assert.equal(report.counts.decisionCases, 6);
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 30);
});
