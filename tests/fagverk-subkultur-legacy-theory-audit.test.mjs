import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { auditSubkulturLegacyTheory } from '../scripts/audit-fagverk-subkultur-legacy-theory.mjs';

test('Subkultur raw legacy audit preserves the exact archived source and all legacy sections', () => {
  const report = auditSubkulturLegacyTheory();
  assert.equal(report.subject, 'subkultur');
  assert.equal(report.legacy.sourcePreserved, true);
  assert.equal(report.legacy.originalBlobSha, '562ac143c3f26fd7fb6bc817dc320f3b088246bb');
  assert.equal(report.legacy.archiveBlobSha, report.legacy.originalBlobSha);
  assert.equal(report.legacy.archivePage, 'data/fag/subkultur/archive/merke_subkultur_full_teori_legacy_20260830.html');
  assert.equal(report.legacy.compatibilityPage, 'data/fag/subkultur/merke_subkultur.html');
  assert.equal(report.legacy.sectionCount, 11);
  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.deepEqual(report.rows.map((row) => row.id), ['felt','normativ','doxa','metode','materiell','sosial','geografisk','temporal','blindsoner','begreper','bidrag']);
});

test('Subkultur raw audit remains evidence-only while the adjudicated route is retired', () => {
  const report = auditSubkulturLegacyTheory();
  assert.equal(report.canonical.registryChapterCount, 8);
  assert.ok(report.canonical.corpusCharacterCount >= report.canonical.corpusTruncationFloor);
  assert.equal(report.navigation.legacyRouteActive, false);
  assert.equal(report.navigation.routeRetired, true);
  assert.equal(report.navigation.portalRedirected, true);
  assert.equal(report.navigation.badgePage, 'fagverk.html?subject=subkultur#fagverkIaProgresjon');
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /explicit adjudication contract/i);
});

test('Subkultur compatibility URL is redirect-only and cannot retain legacy theory', () => {
  const source = fs.readFileSync('data/fag/subkultur/merke_subkultur.html', 'utf8');
  assert.match(source, /location\.replace/);
  assert.match(source, /subject=subkultur#fagverkIaProgresjon/);
  assert.doesNotMatch(source, /merke-blokk|SUBKULTUR\s*[–-]\s*full teoretisk beskrivelse|id=["']felt["']/i);
});

test('Subkultur raw audit reports complete anchor coverage without hiding gaps', () => {
  const report = auditSubkulturLegacyTheory();
  const knowledge = report.rows.filter((row) => row.role === 'knowledge');
  assert.equal(knowledge.length, 10);
  assert.ok(knowledge.every((row) => row.anchorCount > 0 && row.foundCount === row.anchorCount));
  assert.equal(report.summary.anchorCompleteCount, 10);
  assert.equal(report.summary.manualReviewCount, 0);
  const product = report.rows.find((row) => row.id === 'bidrag');
  assert.equal(product.role, 'legacy_product_copy');
  assert.equal(product.contentStatus, 'legacy_product_copy_no_canonical_migration_required');
});
