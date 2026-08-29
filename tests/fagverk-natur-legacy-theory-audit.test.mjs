import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const LEGACY = 'data/fag/natur/merke_natur (1).html';
const IDS = ['merke-og-fag', 'status', 'fagomrader', 'arbeidsmate', 'kilder', 'progresjon'];

function run() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-natur-legacy-theory.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Natur legacy-side måles fail-closed mot canonicalt fagverk og produktkilder', () => {
  const report = run();
  assert.equal(report.schema, 'history_go_fagverk_natur_legacy_theory_audit_v1');
  assert.equal(report.subject, 'natur');
  assert.equal(report.legacy.badgePage, LEGACY);
  assert.equal(report.legacy.sectionCount, 6);
  assert.equal(report.legacy.knowledgeSectionCount, 5);
  assert.equal(report.legacy.productSummarySectionCount, 1);
  assert.deepEqual(report.rows.map(row => row.id), IDS);

  assert.ok(report.canonical.manifestSeedFiles.length >= 5);
  assert.ok(report.canonical.manifestGraphFileCount >= report.canonical.manifestSeedFiles.length);
  assert.equal(report.canonical.registryChapterCount, 12);
  assert.ok(report.canonical.registryGraphFileCount >= 12);
  assert.ok(report.canonical.corpusCharacterCount > 100000);
  assert.equal(report.canonical.badgeTierCount, 16);
  assert.ok(report.canonical.underbadgeCount > 50);
  assert.equal(report.canonical.categoryContractHasNatur, true);

  assert.equal(report.summary.knowledgeSectionCount, 5);
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /explicit editorial adjudication/i);
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

  assert.equal(role.role, 'knowledge_with_product_boundary');
  assert.deepEqual(role.legacyProductMechanics, ['badge_activity_progress']);
  assert.deepEqual(role.legacyProductBoundaries, ['nature_assignment_requires_scientific_entry']);

  assert.equal(progression.role, 'knowledge_with_product_boundary');
  assert.deepEqual(progression.legacyProductMechanics, ['integrated_progression_route', 'subject_inventory_snapshot']);
  assert.equal(report.legacy.productMechanicCount, 4);
  assert.equal(report.legacy.productBoundaryCount, 1);
});
