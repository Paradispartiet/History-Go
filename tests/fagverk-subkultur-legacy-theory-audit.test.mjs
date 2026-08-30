import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSubkulturLegacyTheory } from '../scripts/audit-fagverk-subkultur-legacy-theory.mjs';

test('Subkultur raw legacy audit preserves source and enumerates all legacy sections', () => {
  const report = auditSubkulturLegacyTheory();
  assert.equal(report.subject, 'subkultur');
  assert.equal(report.legacy.sourcePreserved, true);
  assert.equal(report.legacy.originalBlobSha, '562ac143c3f26fd7fb6bc817dc320f3b088246bb');
  assert.equal(report.legacy.activeBlobSha, report.legacy.originalBlobSha);
  assert.equal(report.legacy.sectionCount, 11);
  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.deepEqual(report.rows.map((row) => row.id), ['felt','normativ','doxa','metode','materiell','sosial','geografisk','temporal','blindsoner','begreper','bidrag']);
});

test('Subkultur raw audit is evidence-only and cannot authorize redirect', () => {
  const report = auditSubkulturLegacyTheory();
  assert.equal(report.canonical.registryChapterCount, 8);
  assert.ok(report.canonical.corpusCharacterCount >= report.canonical.corpusTruncationFloor);
  assert.equal(report.navigation.legacyRouteActive, true);
  assert.equal(report.navigation.routeRetired, false);
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /explicit section adjudication/i);
});

test('Subkultur raw audit reports anchor coverage per knowledge section without hiding gaps', () => {
  const report = auditSubkulturLegacyTheory();
  const knowledge = report.rows.filter((row) => row.role === 'knowledge');
  assert.equal(knowledge.length, 10);
  assert.ok(knowledge.every((row) => row.anchorCount > 0 && row.foundCount <= row.anchorCount));
  assert.equal(report.summary.anchorCompleteCount + report.summary.manualReviewCount, 10);
  const product = report.rows.find((row) => row.id === 'bidrag');
  assert.equal(product.role, 'legacy_product_copy');
  assert.equal(product.contentStatus, 'legacy_product_copy_no_canonical_migration_required');
});
