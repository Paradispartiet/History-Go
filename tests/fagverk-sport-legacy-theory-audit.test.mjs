import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const LEGACY = 'data/fag/sport/merke_sport.html';
const IDS = ['felt', 'normativ', 'doxa', 'metode', 'materiell', 'sosial', 'geografisk', 'temporal', 'blindsoner', 'begreper', 'bidrag'];
const MIN_CANONICAL_CORPUS_CHARS = 150000;

function run() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-sport-legacy-theory.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Sport legacy-teori rapporterer det ene reelle canonicale gapet uten å autorisere redirect', () => {
  const report = run();
  assert.equal(report.schema, 'history_go_fagverk_sport_legacy_theory_audit_v1');
  assert.equal(report.subject, 'sport');
  assert.equal(report.legacy.badgePage, LEGACY);
  assert.equal(report.legacy.sectionCount, 11);
  assert.equal(report.legacy.knowledgeSectionCount, 10);
  assert.deepEqual(report.rows.map((row) => row.id), IDS);

  assert.ok(report.canonical.manifestSeedFiles.length >= 4);
  assert.ok(report.canonical.manifestGraphFileCount >= report.canonical.manifestSeedFiles.length);
  assert.equal(report.canonical.registryChapterCount, 6);
  assert.ok(report.canonical.registryGraphFileCount >= 6);
  assert.equal(report.canonical.corpusTruncationFloor, MIN_CANONICAL_CORPUS_CHARS);
  assert.ok(report.canonical.corpusCharacterCount >= report.canonical.corpusTruncationFloor);

  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.equal(report.summary.anchorCompleteCount, 9);
  assert.equal(report.summary.manualReviewCount, 1);
  assert.deepEqual(report.summary.manualReview, ['sosial']);
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /explicit editorial adjudication/i);

  const social = report.rows.find((row) => row.id === 'sosial');
  assert.ok(social, 'Mangler sosial-seksjonen');
  assert.equal(social.anchorCount, 11);
  assert.equal(social.foundCount, 10);
  assert.equal(social.anchorCoverage, 0.909);
  assert.deepEqual(social.missingAnchors, [['ekskludering']]);
  assert.equal(social.contentStatus, 'canonical_anchor_gaps_manual_review_required');

  for (const row of report.rows.filter((item) => item.role === 'knowledge' && item.id !== 'sosial')) {
    assert.ok(row.anchorCount > 0, `${row.id} mangler ankere`);
    assert.equal(row.foundCount, row.anchorCount, `${row.id} mangler canonical dekning`);
    assert.equal(row.anchorCoverage, 1, `${row.id} skal ha full canonical dekning`);
    assert.deepEqual(row.missingAnchors, [], `${row.id} skal ikke ha uavklarte kunnskapsgap`);
  }

  const product = report.rows.find((row) => row.id === 'bidrag');
  assert.equal(product.role, 'legacy_product_copy');
  assert.equal(product.anchorCount, 0);

  assert.equal(report.navigation.badgePage, LEGACY);
  assert.equal(report.navigation.subjectPage, 'fagverk.html?subject=sport');
  assert.equal(report.navigation.preRedirectLocked, true);
});
