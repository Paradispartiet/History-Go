import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const SCRIPT = 'scripts/audit-fagverk-kunst-legacy-theory.mjs';
const REPORT = 'reports/fagverk/kunst-legacy-theory-audit.json';
const EXPECTED_IDS = [
  'felt', 'verk', 'metode', 'institusjoner', 'offentlig-rom',
  'historie', 'arbeid', 'makt', 'begreper', 'avgrensning'
];

function runAudit(...args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Kunst legacy-teori har deterministisk, fail-closed canonical coverage-audit', () => {
  const report = runAudit('--no-check-report');

  assert.equal(report.schema, 'history_go_fagverk_kunst_legacy_theory_audit_v1');
  assert.equal(report.subject, 'kunst');
  assert.equal(report.legacy.badgePage, 'data/fag/kunst/merke_kunst (2).html');
  assert.equal(report.legacy.sectionCount, 10);
  assert.equal(report.legacy.knowledgeSectionCount, 10);
  assert.deepEqual(report.rows.map((row) => row.id), EXPECTED_IDS);

  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /editorial adjudication/i);
  assert.equal(report.summary.manualReviewCount, report.summary.manualReview.length);

  for (const row of report.rows) {
    assert.equal(row.role, 'knowledge');
    assert.ok(row.anchors.length > 0, `${row.id} mangler auditankere`);
    assert.ok(row.anchorCoverage >= 0 && row.anchorCoverage <= 1, `${row.id} har ugyldig dekning`);
  }

  for (const required of [
    'data/fag/kunst/kunstpensum_canonical_v4_5.json',
    'data/fag/kunst/emner_kunst_canonical_v4_5.json',
    'data/fag/kunst/fagkart_kunst_canonical_v4_5.json',
    'data/fag/kunst/methods_kunst_canonical_v4_5.json',
    'data/fag/kunst/emnemapping_kunst_canonical_v4_5.json'
  ]) {
    assert.ok(report.canonical.manifestFiles.includes(required), `Mangler manifest-eid canonical fil: ${required}`);
  }

  assert.equal(report.canonical.registryChapterCount, 6, 'Kunst skal ha seks registry-eide canonicale kapitler');
  assert.ok(report.canonical.registryFiles.length >= 24, 'Kunst-auditen må inkludere hele registry-eide kapittelgrafen');
  assert.ok(report.canonical.corpusCharacterCount >= 100000, 'Canonical Kunst-korpus er uventet lite');

  assert.ok(fs.existsSync(REPORT), `${REPORT} må være innchecket som permanent deterministisk audit`);
  const committed = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
  assert.deepEqual(committed, report, `${REPORT} er ikke synkron med audit-scriptet`);
});
