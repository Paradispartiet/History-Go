import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const LEGACY_ROUTE = 'data/fag/musikk/merke_musikk (1).html';
const PROGRESS_ROUTE = 'fagverk.html?subject=musikk#fagverkIaProgresjon';
const CATEGORY_CONTRACT = 'data/categories/category_contract.json';
const EXPECTED_IDS = [
  'felt', 'musikalsk_form', 'utovelse', 'produksjon_teknologi',
  'sjangere_miljoer', 'scener_infrastruktur', 'musikk_samfunn', 'kjernebegreper'
];

function audit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-musikk-legacy-adjudication.mjs'], {
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Musikk-adjudiseringen avgjør alle åtte kunnskapsseksjoner uten innholdsmigrering', () => {
  const report = audit();
  assert.equal(report.schema, 'history_go_fagverk_musikk_legacy_adjudication_audit_v1');
  assert.equal(report.subject, 'musikk');
  assert.equal(report.summary.legacySectionCount, 8);
  assert.equal(report.summary.knowledgeSectionCount, 8);
  assert.equal(report.summary.adjudicatedKnowledgeCount, 8);
  assert.equal(report.summary.migratedSectionCount, 0);
  assert.equal(report.summary.canonicalSupersedesCount, 8);
  assert.deepEqual(report.rows.map(row => row.id), EXPECTED_IDS);
  assert.equal(report.rows.every(row => row.disposition === 'canonical_supersedes'), true);
  assert.equal(report.rows.every(row => row.anchorCoverage === 1), true);
});

test('Musikk knowledge-owners er begrenset til manifestkjerne og åtte registry-kapittelrøtter', () => {
  const report = audit();
  const allowed = new Set([
    ...report.inputs.manifestOwnerFiles,
    ...report.inputs.registryChapterOwnerFiles
  ]);
  assert.equal(report.inputs.manifestOwnerFiles.length, 4);
  assert.equal(report.inputs.registryChapterOwnerFiles.length, 8);
  assert.equal(report.summary.allowedKnowledgeOwnerFileCount, 12);
  assert.equal(report.summary.canonicalOwnerFileCount, 8);

  for (const row of report.rows) {
    assert.ok(row.ownerFiles.length > 0, `${row.id} mangler canonical eier`);
    assert.deepEqual(row.migrationRefs, [], `${row.id} skal ikke hevde migrering`);
    for (const file of row.ownerFiles) {
      assert.ok(allowed.has(file), `${row.id} peker utenfor tillatt owner-sett: ${file}`);
      assert.ok(fs.existsSync(file), `${row.id} peker til manglende canonical fil: ${file}`);
    }
  }
});

test('Musikk/Scenekunst-grensen holdes som produktgrense, ikke nytt musikkinnhold', () => {
  const report = audit();
  const performance = report.rows.find(row => row.id === 'utovelse');
  assert.deepEqual(performance.productMechanics, ['musikk_scenekunst_boundary']);
  assert.deepEqual(performance.boundaryFiles, [CATEGORY_CONTRACT]);
  assert.match(performance.rationale, /produktgrense/i);
  assert.match(performance.rationale, /Scenekunst/i);
  assert.equal(performance.ownerFiles.some(file => file === CATEGORY_CONTRACT), false);
});

test('secondary_badge_routing pensjoneres som produktmekanikk, ikke fagkunnskap', () => {
  const report = audit();
  const society = report.rows.find(row => row.id === 'musikk_samfunn');
  assert.deepEqual(society.productMechanics, ['secondary_badge_routing']);
  assert.deepEqual(society.boundaryFiles, [CATEGORY_CONTRACT]);
  assert.match(society.rationale, /produktmekanikk/i);
  assert.match(society.rationale, /Subkultur/i);
  assert.equal(report.summary.productBoundarySectionCount, 2);
  assert.equal(report.summary.productMechanicCount, 2);
});

test('Musikk-adjudiseringen er redirect-klar men portalruten er fortsatt legacy', () => {
  const report = audit();
  assert.equal(report.summary.anchorAuditRedirectReady, false);
  assert.equal(report.summary.redirectReady, true);
  assert.equal(report.summary.redirectTarget, PROGRESS_ROUTE);
  assert.equal(report.summary.portalRoute, LEGACY_ROUTE);
  assert.equal(report.summary.portalRedirected, false);
  assert.equal(report.summary.legacyBadgeSourcePreserved, true);
});
