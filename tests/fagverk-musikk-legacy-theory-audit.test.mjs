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

function runAudit(...args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Musikk legacy-teori måles fail-closed mot canonical subject-, chapter- og boundary-eierskap', () => {
  const report = runAudit('--no-check-report');
  assert.equal(report.schema, 'history_go_fagverk_musikk_legacy_theory_audit_v1');
  assert.equal(report.subject, 'musikk');
  assert.equal(report.legacy.badgePage, LEGACY_BADGE);
  assert.equal(report.legacy.sectionCount, 8);
  assert.equal(report.legacy.knowledgeSectionCount, 8);
  assert.deepEqual(report.rows.map(row => row.id), EXPECTED_IDS);

  assert.equal(report.canonical.authority, 'this_package');
  assert.equal(report.canonical.domainCount, 8);
  assert.equal(report.canonical.emneCount, 48);
  assert.equal(report.canonical.methodCount, 18);
  assert.equal(report.canonical.chapterCount, 8);
  assert.ok(report.canonical.chapterOwnedFileCount >= 40, 'Musikk registry-kapitlene må eie en reell fulltekst/evidensgraf');
  assert.ok(report.canonical.corpusCharacterCount >= 100000, 'Canonical Musikk-korpus er uventet lite');
  assert.equal(report.canonical.scenekunstSeparateTopLevelSubject, true);
  assert.equal(report.canonical.performanceStudyInScope, true);

  assert.equal(report.summary.knowledgeSectionCount, 8);
  assert.equal(report.summary.manualReviewCount, report.summary.manualReview.length);
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /explicit editorial adjudication/i);
  for (const row of report.rows) {
    assert.equal(row.role, 'knowledge');
    assert.ok(row.anchorCount > 0, `${row.id} mangler auditankere`);
    assert.ok(row.foundCount >= 0 && row.foundCount <= row.anchorCount, `${row.id} har ugyldig ankertelling`);
    assert.ok(row.anchorCoverage >= 0 && row.anchorCoverage <= 1, `${row.id} har ugyldig dekning`);
  }

  assert.equal(report.navigation.badgePage, LEGACY_BADGE);
  assert.equal(report.navigation.subjectPage, 'fagverk.html?subject=musikk');
  assert.equal(report.navigation.preRedirectLocked, true);
  assert.ok(fs.existsSync(LEGACY_BADGE));
});
