import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const portal = JSON.parse(fs.readFileSync('data/fagverk/fagverk_portal.json', 'utf8'));
const historicalTime = JSON.parse(fs.readFileSync('data/fagverk/historie/historisk_tid_periodisering/01-grunnlag.json', 'utf8'));
const legacyArchive = 'data/fag/historie/archive/merke_historie_full_teori_legacy_20260828.html';
const compatibilityPage = 'data/fag/historie/merke_historie (1).html';
const progressRoute = 'fagverk.html?subject=historie#fagverkIaProgresjon';

function audit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-historie-legacy-theory.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Historie-auditen dekker hele den arkiverte fullteoristrukturen', () => {
  const report = audit();
  assert.equal(report.subject, 'historie');
  assert.equal(report.legacy.badgePage, legacyArchive);
  assert.equal(report.legacy.sectionCount, 11);
  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.deepEqual(report.rows.map((row) => row.id), [
    'felt','normativ','doxa','metode','materiell','sosial','geografisk','temporal','blindsoner','begreper','bidrag'
  ]);
});

test('Historie-merkesiden sammenlignes mot det rike manifest- og registry-eide canonicale korpuset', () => {
  const report = audit();
  assert.ok(report.canonical.manifestFiles.includes('data/fag/historie/historiepensum_canonical_v4_5.json'));
  assert.ok(report.canonical.manifestFiles.includes('data/fag/historie/emner_historie_canonical_v4_5.json'));
  assert.ok(report.canonical.manifestFiles.includes('data/fag/historie/fagkart_historie_canonical_v4_5.json'));
  assert.ok(report.canonical.manifestFiles.includes('data/fag/historie/methods_historie_canonical_v4_5.json'));
  assert.ok(report.canonical.manifestFiles.includes('data/fag/historie/concepts_historie_canonical_v5_5.json'));
  assert.ok(report.canonical.manifestFiles.includes('data/fag/historie/claims_historie_canonical_v1.json'));
  assert.ok(report.canonical.corpusCharacterCount > 5000);
});

test('alle ti Historie-kunnskapsseksjoner har canonical ankerdekning etter redaksjonell synonymkontroll', () => {
  const report = audit();
  assert.equal(report.summary.anchorCompleteCount, 10);
  assert.equal(report.summary.manualReviewCount, 0);
  assert.deepEqual(report.summary.manualReview, []);
  assert.equal(report.rows.filter((row) => row.role === 'knowledge').every((row) => row.anchorCoverage === 1), true);
});

test('legacy diskontinuitet eies av det canonicale og operasjonaliserte Brudd-begrepet', () => {
  const report = audit();
  const conceptRow = report.rows.find((row) => row.id === 'begreper');
  const discontinuityAnchor = conceptRow.anchors.find((row) => row.alternatives.includes('diskontinuitet'));
  assert.deepEqual(discontinuityAnchor.alternatives, ['diskontinuitet', 'brudd']);
  assert.equal(discontinuityAnchor.found, 'brudd');

  const canonicalBreak = historicalTime.concepts.find((concept) => concept.id === 'brudd');
  assert.equal(canonicalBreak.term, 'Brudd');
  assert.match(canonicalBreak.definition, /Dokumenterbar endring/);
  const breakSection = historicalTime.sections.find((section) => section.id === 'brudd-kontinuitet');
  assert.equal(breakSection.title, '2. Brudd og kontinuitet samtidig');
  assert.match(breakSection.paragraphs.join(' '), /historiske brudd er sjelden totale/i);
});

test('ankerfunn alene kan aldri auto-godkjenne redirect av gammel Historie-teori', () => {
  const report = audit();
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /explicit editorial adjudication/i);
  for (const row of report.rows.filter((item) => item.role === 'knowledge')) {
    assert.equal(row.contentStatus, 'canonical_anchor_coverage_complete_claim_review_pending');
  }
});

test('legacy produkttekst skilles fra Historie-kunnskapsseksjonene', () => {
  const report = audit();
  const contribution = report.rows.find((row) => row.id === 'bidrag');
  assert.equal(contribution.role, 'legacy_product_copy');
  assert.equal(contribution.contentStatus, 'legacy_product_copy_no_canonical_migration_required');
});

test('Historie badgePage er migrert til Progresjon mens gammel URL er compatibility-redirect', () => {
  const historie = portal.categories.find((item) => item.id === 'historie');
  assert.equal(historie.badgePage, progressRoute);
  assert.ok(fs.existsSync(legacyArchive));
  assert.ok(fs.existsSync(compatibilityPage));
  const redirectHtml = fs.readFileSync(compatibilityPage, 'utf8');
  assert.match(redirectHtml, /location\.replace/);
  assert.match(redirectHtml, /subject=historie#fagverkIaProgresjon/);
});
