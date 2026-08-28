// Permanent post-migration lock for the integrated Kunst badge route.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const ARCHIVE = 'data/fag/kunst/archive/merke_kunst_legacy_20260828.html';
const COMPATIBILITY = 'data/fag/kunst/merke_kunst (2).html';
const PROGRESS_ROUTE = 'fagverk.html?subject=kunst#fagverkIaProgresjon';
const CATEGORY_CONTRACT = 'data/categories/category_contract.json';

function adjudicationAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-kunst-legacy-adjudication.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Kunst-adjudiseringen avgjør ni kunnskapsseksjoner og én produktgrense', () => {
  const report = adjudicationAudit();
  assert.equal(report.subject, 'kunst');
  assert.equal(report.summary.legacySectionCount, 10);
  assert.equal(report.summary.knowledgeSectionCount, 9);
  assert.equal(report.summary.productBoundarySectionCount, 1);
  assert.equal(report.summary.adjudicatedKnowledgeCount, 9);
  assert.equal(report.summary.adjudicatedProductBoundaryCount, 1);
  assert.equal(report.summary.migratedSectionCount, 2);
  assert.equal(report.summary.supersededKnowledgeCount, 7);
});

test('bare felt og offentlig-rom er migrated_to_canonical etter #5461', () => {
  const report = adjudicationAudit();
  const migrated = report.rows.filter((row) => row.disposition === 'migrated_to_canonical');
  assert.deepEqual(migrated.map((row) => row.id).sort(), ['felt', 'offentlig-rom']);
  for (const row of migrated) {
    assert.ok(row.migrationRefs.includes('pr:#5461'));
    assert.ok(row.migrationRefs.includes('scripts/materialize-kunst-gatekunst-legacy-gap-v1.mjs'));
    assert.equal(row.anchorCoverage, 1);
  }
});

test('de øvrige syv Kunst-kunnskapsseksjonene eies av eksisterende canonicalt fagverk', () => {
  const report = adjudicationAudit();
  const expected = ['arbeid', 'begreper', 'historie', 'institusjoner', 'makt', 'metode', 'verk'];
  const superseded = report.rows.filter((row) => row.disposition === 'canonical_supersedes');
  assert.deepEqual(superseded.map((row) => row.id).sort(), expected.sort());
  for (const row of superseded) {
    assert.equal(row.anchorCoverage, 1);
    assert.ok(row.ownerFiles.length > 0);
    assert.deepEqual(row.migrationRefs, []);
    for (const owner of row.ownerFiles) assert.ok(fs.existsSync(owner), `Mangler canonical eier ${owner}`);
  }
});

test('Kunst/Scenekunst-avgrensningen er product boundary, ikke nytt kunstemne', () => {
  const report = adjudicationAudit();
  const boundary = report.rows.find((row) => row.id === 'avgrensning');
  assert.equal(boundary.role, 'product_boundary');
  assert.equal(boundary.disposition, 'canonical_product_boundary_supersedes');
  assert.deepEqual(boundary.ownerFiles, [CATEGORY_CONTRACT]);
  assert.deepEqual(boundary.migrationRefs, []);
  assert.equal(boundary.anchorCoverage, 1);
});

test('Kunst-adjudiseringen låser ferdig migrert portal, arkiv og compatibility-URL', () => {
  const report = adjudicationAudit();
  assert.equal(report.summary.redirectReady, true);
  assert.equal(report.summary.redirectTarget, PROGRESS_ROUTE);
  assert.equal(report.summary.portalRoute, PROGRESS_ROUTE);
  assert.equal(report.summary.portalRedirected, true);
  assert.equal(report.summary.legacyBadgeSourcePreserved, true);
  assert.equal(report.summary.compatibilityRedirectPresent, true);
  assert.equal(report.inputs.legacyArchive, ARCHIVE);
  assert.equal(report.inputs.compatibilityPage, COMPATIBILITY);

  assert.ok(fs.existsSync(ARCHIVE));
  const compatibility = fs.readFileSync(COMPATIBILITY, 'utf8');
  assert.match(compatibility, /location\.replace/);
  assert.match(compatibility, /subject=kunst#fagverkIaProgresjon/);
  assert.doesNotMatch(compatibility, /id="felt"|id="offentlig-rom"/);
});
