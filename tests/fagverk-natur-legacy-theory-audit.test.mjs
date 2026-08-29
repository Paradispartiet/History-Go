import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const LEGACY = 'data/fag/natur/merke_natur (1).html';
const IDS = ['merke-og-fag', 'status', 'fagomrader', 'arbeidsmate', 'kilder', 'progresjon'];
const MANIFEST_SEEDS = [
  'data/fag/natur/emner_natur_canonical_v4_5.json',
  'data/fag/natur/fagkart_natur_canonical_v4_5.json',
  'data/fag/natur/methods_natur_canonical_v4_5.json',
  'data/fag/natur/naturpensum_canonical_v4_5.json',
  'data/fag/natur/supersetQUIZMAL_natur.json'
];

function run() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-natur-legacy-theory.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Natur legacy-side har målt 5/5 canonical kunnskapsdekning uten gap', () => {
  const report = run();
  assert.equal(report.schema, 'history_go_fagverk_natur_legacy_theory_audit_v1');
  assert.equal(report.subject, 'natur');
  assert.equal(report.legacy.badgePage, LEGACY);
  assert.equal(report.legacy.sectionCount, 6);
  assert.equal(report.legacy.knowledgeSectionCount, 5);
  assert.equal(report.legacy.productSummarySectionCount, 1);
  assert.deepEqual(report.rows.map(row => row.id), IDS);

  assert.deepEqual(report.canonical.manifestSeedFiles, MANIFEST_SEEDS);
  assert.equal(report.canonical.manifestGraphFileCount, 7);
  assert.equal(report.canonical.registryChapterCount, 12);
  assert.equal(report.canonical.registryGraphFileCount, 12);
  assert.equal(report.canonical.corpusCharacterCount, 1208632);
  assert.equal(report.canonical.badgeTierCount, 16);
  assert.equal(report.canonical.underbadgeCount, 88);
  assert.equal(report.canonical.categoryContractHasNatur, true);

  assert.equal(report.summary.knowledgeSectionCount, 5);
  assert.equal(report.summary.anchorCompleteCount, 5);
  assert.equal(report.summary.manualReviewCount, 0);
  assert.deepEqual(report.summary.manualReview, []);
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /explicit editorial adjudication/i);

  for (const row of report.rows.filter(row => row.role !== 'legacy_product_summary')) {
    assert.ok(row.anchorCount > 0, `${row.id} mangler kunnskapsankere`);
    assert.equal(row.foundCount, row.anchorCount, `${row.id} har uavklart canonical dekning`);
    assert.equal(row.anchorCoverage, 1, `${row.id} skal ha full canonical dekning`);
    assert.deepEqual(row.missingAnchors, [], `${row.id} skal ikke ha kunnskapsgap`);
  }

  assert.equal(report.navigation.badgePage, LEGACY);
  assert.equal(report.navigation.subjectPage, 'fagverk.html?subject=natur');
  assert.equal(report.navigation.target, 'fagverk.html?subject=natur#fagverkIaProgresjon');
  assert.equal(report.navigation.preRedirectLocked, true);
});

test('Natur-auditen holder produktmekanikk og produktgrenser utenfor kunnskapsdekningen', () => {
  const report = run();
  const status = report.rows.find(row => row.id === 'status');
  const role = report.rows.find(row => row.id === 'merke-og-fag');
  const progression = report.rows.find(row => row.id === 'progresjon');

  assert.equal(status.role, 'legacy_product_summary');
  assert.equal(status.anchorCount, 0);
  assert.deepEqual(status.legacyProductMechanics, ['subject_completion_snapshot']);
  assert.deepEqual(status.legacyProductBoundaries, []);

  assert.equal(role.role, 'knowledge_with_product_boundary');
  assert.deepEqual(role.legacyProductMechanics, ['badge_activity_progress']);
  assert.deepEqual(role.legacyProductBoundaries, ['nature_assignment_requires_scientific_entry']);

  assert.equal(progression.role, 'knowledge_with_product_boundary');
  assert.deepEqual(progression.legacyProductMechanics, ['integrated_progression_route', 'subject_inventory_snapshot']);
  assert.deepEqual(progression.legacyProductBoundaries, []);

  assert.equal(report.legacy.productMechanicCount, 4);
  assert.equal(report.legacy.productBoundaryCount, 1);
});
