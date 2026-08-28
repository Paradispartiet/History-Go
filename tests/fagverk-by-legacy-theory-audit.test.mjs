import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const portal = JSON.parse(fs.readFileSync('data/fagverk/fagverk_portal.json', 'utf8'));

function audit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-by-legacy-theory.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('By-auditen dekker hele den gamle fullteoristrukturen', () => {
  const report = audit();
  assert.equal(report.subject, 'by');
  assert.equal(report.legacy.sectionCount, 11);
  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.deepEqual(report.rows.map((row) => row.id), [
    'felt','normativ','doxa','metode','materiell','sosial','geografisk','temporal','blindsoner','begreper','bidrag'
  ]);
});

test('By-merkesiden sammenlignes mot separat legacy teori og manifest-resolvert canonicalt korpus', () => {
  const report = audit();
  assert.ok(report.legacy.duplicateSectionCount >= 8, `For få dupliserte legacy-seksjoner: ${report.legacy.duplicateSectionCount}`);
  assert.ok(report.canonical.manifestFiles.includes('data/fag/by/pensum_by.json'));
  assert.ok(report.canonical.manifestFiles.includes('data/fag/by/emner_by.json'));
  assert.ok(report.canonical.manifestFiles.includes('data/fag/by/fagkart_by.json'));
  assert.ok(report.canonical.manifestFiles.includes('data/fag/by/methods_by.json'));
  assert.ok(report.canonical.corpusCharacterCount > 1000);
});

test('ankerfunn alene kan aldri auto-godkjenne redirect av gammel By-teori', () => {
  const report = audit();
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /sentence-level factual\/editorial equivalence/i);
  for (const row of report.rows.filter((item) => item.role === 'knowledge')) {
    assert.ok(['canonical_anchor_coverage_complete_claim_review_pending','canonical_anchor_gaps_manual_review_required'].includes(row.contentStatus));
  }
});

test('legacy produkttekst skilles fra kunnskapsseksjoner', () => {
  const report = audit();
  const contribution = report.rows.find((row) => row.id === 'bidrag');
  assert.equal(contribution.role, 'legacy_product_copy');
  assert.equal(contribution.contentStatus, 'legacy_product_copy_no_canonical_migration_required');
});

test('By badgePage forblir legacy til innholdsauditen er adjudisert', () => {
  const by = portal.categories.find((item) => item.id === 'by');
  assert.equal(by.badgePage, 'data/fag/by/merke_by.html');
});
