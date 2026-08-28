import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const portal = JSON.parse(fs.readFileSync('data/fagverk/fagverk_portal.json', 'utf8'));

function audit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-historie-legacy-theory.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Historie-auditen dekker hele den gamle fullteoristrukturen', () => {
  const report = audit();
  assert.equal(report.subject, 'historie');
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

test('ankerfunn alene kan aldri auto-godkjenne redirect av gammel Historie-teori', () => {
  const report = audit();
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /explicit editorial adjudication/i);
  for (const row of report.rows.filter((item) => item.role === 'knowledge')) {
    assert.ok(['canonical_anchor_coverage_complete_claim_review_pending','canonical_anchor_gaps_manual_review_required'].includes(row.contentStatus));
  }
});

test('legacy produkttekst skilles fra Historie-kunnskapsseksjonene', () => {
  const report = audit();
  const contribution = report.rows.find((row) => row.id === 'bidrag');
  assert.equal(contribution.role, 'legacy_product_copy');
  assert.equal(contribution.contentStatus, 'legacy_product_copy_no_canonical_migration_required');
});

test('Historie badgePage forblir legacy til innholdsaudit og adjudisering er fullført', () => {
  const historie = portal.categories.find((item) => item.id === 'historie');
  assert.equal(historie.badgePage, 'data/fag/historie/merke_historie (1).html');
});
