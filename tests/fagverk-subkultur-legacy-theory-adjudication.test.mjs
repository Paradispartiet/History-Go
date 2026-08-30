import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSubkulturLegacyAdjudication } from '../scripts/audit-fagverk-subkultur-legacy-adjudication.mjs';

test('Subkultur adjudication covers all legacy sections without invented migrations', () => {
  const report = auditSubkulturLegacyAdjudication();
  assert.equal(report.subject, 'subkultur');
  assert.equal(report.summary.legacySectionCount, 11);
  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.equal(report.summary.adjudicatedKnowledgeCount, 10);
  assert.equal(report.summary.migratedSectionCount, 0);
  assert.equal(report.summary.canonicalSupersedesCount, 10);
  assert.equal(report.summary.retiredProductCopyCount, 1);
  assert.ok(report.rows.filter((row) => row.role === 'knowledge').every((row) => row.disposition === 'canonical_supersedes'));
  assert.ok(report.rows.every((row) => row.migrationRefs.length === 0));
});

test('Subkultur adjudication proves the completed archive and progression-route retirement', () => {
  const report = auditSubkulturLegacyAdjudication();
  assert.equal(report.summary.rawAuditRedirectReady, false);
  assert.equal(report.summary.redirectReady, true);
  assert.equal(report.summary.redirectTarget, 'fagverk.html?subject=subkultur#fagverkIaProgresjon');
  assert.equal(report.summary.portalRedirected, true);
  assert.equal(report.summary.routeRetired, true);
  assert.equal(report.summary.portalRoute, 'fagverk.html?subject=subkultur#fagverkIaProgresjon');
  assert.equal(report.summary.legacyBadgeSourcePreserved, true);
  assert.equal(report.summary.archiveBlobSha, '562ac143c3f26fd7fb6bc817dc320f3b088246bb');
  assert.equal(report.inputs.archivePage, 'data/fag/subkultur/archive/merke_subkultur_full_teori_legacy_20260830.html');
  assert.equal(report.inputs.compatibilityPage, 'data/fag/subkultur/merke_subkultur.html');
});

test('Subkultur adjudication has real canonical owners for every knowledge section', () => {
  const report = auditSubkulturLegacyAdjudication();
  for (const row of report.rows.filter((item) => item.role === 'knowledge')) {
    assert.equal(row.anchorCoverage, 1, row.id);
    assert.ok(row.ownerFiles.length > 0, row.id);
    assert.ok(row.rationale.length >= 80, row.id);
  }
  const product = report.rows.find((row) => row.id === 'bidrag');
  assert.equal(product.disposition, 'retire_legacy_product_copy');
  assert.deepEqual(product.ownerFiles, []);
});
