import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const SCRIPT = 'scripts/audit-fagverk-litteratur-legacy-theory.mjs';
const REPORT = 'reports/fagverk/litteratur-legacy-theory-audit.json';
const LANGUAGE_HISTORY_OWNER = 'data/fag/litteratur/litteraturvitenskap_canonical_v1/foundation_texts/norsk_nordisk_samisk_minoritetslitteratur/03-sprak-sted-og-kanon.json';
const EXPECTED_IDS = [
  'felt', 'normativ', 'doxa', 'metode', 'materiell', 'sosial',
  'geografisk', 'temporal', 'blindsoner', 'begreper', 'bidrag'
];

function runAudit(...args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Litteratur legacy-teori har deterministisk, fail-closed canonical coverage-audit', () => {
  const report = runAudit('--no-check-report');

  assert.equal(report.schema, 'history_go_fagverk_litteratur_legacy_theory_audit_v1');
  assert.equal(report.subject, 'litteratur');
  assert.equal(report.legacy.badgePage, 'data/fag/litteratur/merke_litteratur (1).html');
  assert.equal(report.legacy.sectionCount, 11);
  assert.equal(report.legacy.knowledgeSectionCount, 10);
  assert.deepEqual(report.rows.map((row) => row.id), EXPECTED_IDS);

  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /editorial adjudication/i);
  assert.equal(report.summary.manualReviewCount, report.summary.manualReview.length);

  const knowledgeRows = report.rows.filter((row) => row.role === 'knowledge');
  assert.equal(knowledgeRows.length, 10);
  for (const row of knowledgeRows) {
    assert.ok(row.anchors.length > 0, `${row.id} mangler auditankere`);
    assert.ok(row.anchorCoverage >= 0 && row.anchorCoverage <= 1, `${row.id} har ugyldig dekning`);
  }
  assert.equal(report.rows.at(-1).id, 'bidrag');
  assert.equal(report.rows.at(-1).role, 'legacy_product_copy');

  for (const required of [
    'data/fag/litteratur/litteraturpensum_canonical_v4_5.json',
    'data/fag/litteratur/emner_litteratur_canonical_v4_5.json',
    'data/fag/litteratur/fagkart_litteratur_canonical_v4_5.json',
    'data/fag/litteratur/methods_litteratur_canonical_v4_5.json',
    'data/fag/litteratur/litteraturvitenskap_canonical_v1/index.json',
    'data/fag/litteratur/litteraturvitenskap_canonical_v1/coverage_contract_v1.json',
    'data/fag/litteratur/litteraturvitenskap_canonical_v1/topic_foundations_v1.json'
  ]) {
    assert.ok(report.canonical.manifestFiles.includes(required), `Mangler manifest-eid canonical fil: ${required}`);
  }

  assert.ok(report.canonical.manifestGraphFiles.length >= report.canonical.manifestFiles.length);
  assert.equal(report.canonical.registrySubjectPresent, false, 'Litteratur skal ikke late som det finnes et registry-subject når general-engine har chapterCount=0');
  assert.equal(report.canonical.registryChapterCount, 0);
  assert.deepEqual(report.canonical.registryFiles, []);
  assert.ok(report.canonical.corpusCharacterCount >= 50000, 'Canonical Litteratur-korpus er uventet lite');

  const temporal = report.rows.find((row) => row.id === 'temporal');
  assert.ok(temporal, 'Temporal legacy-seksjon mangler');
  const languageHistoryAnchor = temporal.anchors.at(-1);
  assert.ok(
    ['historiske og institusjonelle skriftspråk', 'målreisning', 'normering'].includes(languageHistoryAnchor.found),
    'Legacy språkendring/språkhistorie må bindes til eksplisitt canonical historisk språkdekning, ikke et generisk språkord'
  );
  const languageOwner = fs.readFileSync(LANGUAGE_HISTORY_OWNER, 'utf8');
  for (const phrase of ['historiske og institusjonelle skriftspråk', 'målreisning', 'normering']) {
    assert.ok(languageOwner.includes(phrase), `Canonical språk-/historieeier mangler dokumentert equivalence: ${phrase}`);
  }

  assert.ok(fs.existsSync(REPORT), `${REPORT} må være innchecket som permanent deterministisk audit`);
  const committed = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
  assert.deepEqual(committed, report, `${REPORT} er ikke synkron med audit-scriptet`);
});
