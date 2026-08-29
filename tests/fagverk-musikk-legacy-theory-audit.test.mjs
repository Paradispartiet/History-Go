import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const SCRIPT = 'scripts/audit-fagverk-musikk-legacy-theory.mjs';
const LEGACY_BADGE = 'data/fag/musikk/merke_musikk (1).html';
const EXPECTED_IDS = [
  'felt', 'musikalsk_form', 'utovelse', 'produksjon_teknologi',
  'sjangere_miljoer', 'scener_infrastruktur', 'musikk_samfunn', 'kjernebegreper'
];
const EXPECTED_MANIFEST_FILES = [
  'data/fag/musikk/emner_musikk_canonical_v4_5.json',
  'data/fag/musikk/fagkart_musikk_canonical_v4_5.json',
  'data/fag/musikk/methods_musikk_canonical_v4_5.json',
  'data/fag/musikk/musikkpensum_canonical_v4_5.json'
];

function runAudit(...args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Musikk legacy-teori har 8/8 canonical dekning og null kunnskapsgap', () => {
  const report = runAudit('--no-check-report');
  assert.equal(report.schema, 'history_go_fagverk_musikk_legacy_theory_audit_v1');
  assert.equal(report.subject, 'musikk');
  assert.equal(report.legacy.badgePage, LEGACY_BADGE);
  assert.equal(report.legacy.sectionCount, 8);
  assert.equal(report.legacy.knowledgeSectionCount, 8);
  assert.equal(report.legacy.productMechanicCount, 1);
  assert.deepEqual(report.rows.map(row => row.id), EXPECTED_IDS);

  assert.equal(report.summary.knowledgeSectionCount, 8);
  assert.equal(report.summary.anchorCompleteCount, 8);
  assert.equal(report.summary.manualReviewCount, 0);
  assert.deepEqual(report.summary.manualReview, []);
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /explicit editorial adjudication/i);

  for (const row of report.rows) {
    assert.equal(row.role, 'knowledge');
    assert.ok(row.anchorCount > 0, `${row.id} mangler auditankere`);
    assert.equal(row.foundCount, row.anchorCount, `${row.id} mangler canonical dekning`);
    assert.equal(row.anchorCoverage, 1, `${row.id} skal ha full canonical dekning`);
    assert.deepEqual(row.missingAnchors, [], `${row.id} skal ikke ha uavklarte kunnskapsgap`);
  }
});

test('Musikk-equivalence måler hele canonicale eierflaten, ikke bare scientific package', () => {
  const report = runAudit('--no-check-report');
  assert.equal(report.canonical.authority, 'this_package');
  assert.deepEqual(report.canonical.manifestFiles, EXPECTED_MANIFEST_FILES);
  assert.equal(report.canonical.domainCount, 8);
  assert.equal(report.canonical.emneCount, 48);
  assert.equal(report.canonical.methodCount, 18);
  assert.equal(report.canonical.chapterCount, 8);
  assert.equal(report.canonical.chapterOwnedFileCount, 96);
  assert.equal(report.canonical.corpusCharacterCount, 1148237);
  assert.equal(report.canonical.scenekunstSeparateTopLevelSubject, true);
  assert.equal(report.canonical.performanceStudyInScope, true);
});

test('sekundærbadge-formuleringen klassifiseres som legacy produktmekanikk, ikke faglig gap', () => {
  const report = runAudit('--no-check-report');
  const society = report.rows.find(row => row.id === 'musikk_samfunn');
  assert.deepEqual(society.legacyProductMechanics, ['secondary_badge_routing']);
  assert.equal(society.anchorCoverage, 1);
  for (const row of report.rows.filter(item => item.id !== 'musikk_samfunn')) {
    assert.deepEqual(row.legacyProductMechanics, [], `${row.id} skal ikke ha legacy produktmekanikk`);
  }
});

test('Musikk-audittranche er fortsatt fail-closed og endrer ikke portalruten', () => {
  const report = runAudit('--no-check-report');
  assert.equal(report.navigation.badgePage, LEGACY_BADGE);
  assert.equal(report.navigation.subjectPage, 'fagverk.html?subject=musikk');
  assert.equal(report.navigation.preRedirectLocked, true);
  assert.ok(fs.existsSync(LEGACY_BADGE));
  const portal = JSON.parse(fs.readFileSync('data/fagverk/fagverk_portal.json', 'utf8'));
  assert.equal(portal.categories.find(item => item.id === 'musikk')?.badgePage, LEGACY_BADGE);
});
