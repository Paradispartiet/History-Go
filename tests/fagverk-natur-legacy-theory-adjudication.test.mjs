import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const TARGET = 'fagverk.html?subject=natur#fagverkIaProgresjon';
const ARCHIVE = 'data/fag/natur/archive/merke_natur_full_teori_legacy_20260829.html';
const COMPATIBILITY = 'data/fag/natur/merke_natur (1).html';

function run() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-natur-legacy-adjudication.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Natur-adjudiseringen avgjør fem kunnskapsseksjoner uten faglig migrering', () => {
  const report = run();
  assert.equal(report.schema, 'history_go_fagverk_natur_legacy_adjudication_audit_v1');
  assert.equal(report.subject, 'natur');
  assert.equal(report.summary.legacySectionCount, 6);
  assert.equal(report.summary.knowledgeSectionCount, 5);
  assert.equal(report.summary.adjudicatedKnowledgeCount, 5);
  assert.equal(report.summary.canonicalSupersedesCount, 5);
  assert.equal(report.summary.migratedKnowledgeSectionCount, 0);
  assert.equal(report.summary.retiredProductSummaryCount, 1);
  assert.equal(report.summary.anchorAuditRedirectReady, false);
  assert.equal(report.summary.redirectReady, true);
});

test('Natur-kunnskapseiere er begrenset til eksisterende canonical fagverk', () => {
  const report = run();
  const allowed = new Set([
    ...report.inputs.manifestOwnerFiles,
    ...report.inputs.registryChapterOwnerFiles
  ]);
  const knowledge = report.sections.filter(row => row.role !== 'legacy_product_summary');
  for (const row of knowledge) {
    assert.equal(row.disposition, 'canonical_supersedes');
    assert.equal(row.anchorCoverage, 1);
    assert.ok(row.ownerFiles.length > 0);
    assert.deepEqual(row.migrationRefs, []);
    for (const file of row.ownerFiles) {
      assert.ok(allowed.has(file), `${row.id} har owner utenfor canonical Natur-eierskap: ${file}`);
      assert.ok(fs.existsSync(file), `${row.id} peker til manglende ${file}`);
    }
  }
});

test('Natur-produktmekanikk beholdes eller pensjoneres uten å bli faginnhold', () => {
  const report = run();
  const byId = new Map(report.productMechanics.map(row => [row.id, row]));
  assert.equal(report.summary.productMechanicCount, 4);
  assert.equal(report.productMechanics.length, 4);
  assert.equal(byId.get('badge_activity_progress').disposition, 'canonical_product_state');
  assert.deepEqual(byId.get('badge_activity_progress').ownerFiles, [
    'data/badges/natur.json',
    'js/fagverk-subject-model.js',
    'js/fagverk-ia-v3-badge-progress.js'
  ]);
  assert.equal(byId.get('integrated_progression_route').disposition, 'canonical_progression_route');
  assert.deepEqual(byId.get('integrated_progression_route').ownerFiles, [
    'fagverk.html',
    'js/fagverk-ia-v3-badge-progress.js'
  ]);
  assert.equal(byId.get('subject_completion_snapshot').disposition, 'retire_legacy_snapshot');
  assert.equal(byId.get('subject_inventory_snapshot').disposition, 'retire_legacy_snapshot');
  assert.equal(report.summary.canonicalProductMechanicCount, 2);
  assert.equal(report.summary.retiredProductSnapshotCount, 2);
});

test('Natur-kategorigrensen er migrert til canonical category contract via #5496', () => {
  const report = run();
  assert.equal(report.summary.productBoundaryCount, 1);
  assert.equal(report.productBoundaries.length, 1);
  const boundary = report.productBoundaries[0];
  assert.equal(boundary.id, 'nature_assignment_requires_scientific_entry');
  assert.equal(boundary.disposition, 'migrated_to_canonical_product_contract');
  assert.deepEqual(boundary.ownerFiles, ['data/categories/category_contract.json']);
  assert.deepEqual(boundary.migrationRefs, [
    'data/categories/category_contract.json#decisions.natur',
    'PR #5496'
  ]);
  assert.equal(report.summary.migratedProductBoundaryCount, 1);

  const contract = JSON.parse(fs.readFileSync('data/categories/category_contract.json', 'utf8'));
  assert.equal(contract.version, '1.11');
  assert.ok(contract.updatedAt >= '2026-08-29', `Category contract predates Natur migration: ${contract.updatedAt}`);
  assert.match(contract.decisions.natur, /ikke bare/i);
  assert.match(contract.decisions.natur, /grønt/i);
  assert.match(contract.decisions.natur, /vakkert/i);
  assert.match(contract.decisions.natur, /naturfaglig inngang/i);
  assert.match(contract.decisions.natur, /dokumenterbar/i);
});

test('Natur-adjudiseringen låser arkiv, compatibility-URL og canonical Progresjon etter retirement', () => {
  const report = run();
  const compatibility = fs.readFileSync(COMPATIBILITY, 'utf8');
  assert.equal(report.inputs.legacyBadgePage, ARCHIVE);
  assert.equal(report.inputs.compatibilityBadgePage, COMPATIBILITY);
  assert.equal(report.summary.redirectTarget, TARGET);
  assert.equal(report.summary.portalRoute, TARGET);
  assert.equal(report.summary.portalRedirected, true);
  assert.equal(report.summary.legacyBadgeSourcePreserved, true);
  assert.equal(report.summary.compatibilityRedirectPresent, true);
  assert.equal(report.summary.redirectReady, true);
  assert.match(compatibility, /location\.replace/);
  assert.match(compatibility, /subject=natur#fagverkIaProgresjon/);
  assert.doesNotMatch(compatibility, /merke-blokk|Alle tolv Natur-områder|Natur blir ikke tildelt/i);
});
