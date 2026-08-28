import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const portal = JSON.parse(fs.readFileSync('data/fagverk/fagverk_portal.json', 'utf8'));

function adjudicationAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-historie-legacy-adjudication.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Historie-adjudiseringen avgjør alle ti kunnskapsseksjoner og pensjonerer produktteksten', () => {
  const report = adjudicationAudit();
  assert.equal(report.subject, 'historie');
  assert.equal(report.summary.legacySectionCount, 11);
  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.equal(report.summary.adjudicatedKnowledgeCount, 10);
  assert.equal(report.summary.migratedSectionCount, 0);
  assert.equal(report.summary.retiredProductCopyCount, 1);
  assert.equal(report.rows.filter((row) => row.role === 'knowledge').every((row) => row.disposition === 'canonical_supersedes'), true);
});

test('alle Historie-kunnskapsseksjoner har eksisterende canonicale eiere og full ankerdekning', () => {
  const report = adjudicationAudit();
  for (const row of report.rows.filter((item) => item.role === 'knowledge')) {
    assert.equal(row.anchorCoverage, 1, `${row.id} mangler full canonical ankerdekning`);
    assert.ok(row.ownerFiles.length > 0, `${row.id} mangler canonical eier`);
  }
  assert.ok(report.summary.canonicalOwnerFileCount >= 10);
});

test('legacy diskontinuitet adjudiseres til canonicalt Historisk tid og periodisering uten duplikatbegrep', () => {
  const report = adjudicationAudit();
  const concepts = report.rows.find((row) => row.id === 'begreper');
  assert.equal(concepts.disposition, 'canonical_supersedes');
  assert.ok(concepts.ownerFiles.includes('data/fag/historie/concepts_historie_canonical_v5_5.json'));
  assert.ok(concepts.ownerFiles.includes('data/fagverk/historie/historisk_tid_periodisering.json'));
  assert.match(concepts.rationale, /diskontinuitet/i);
  assert.match(concepts.rationale, /Brudd/);
});

test('Historie-adjudiseringen er redirect-klar, men kan ikke endre portalruten i samme tranche', () => {
  const report = adjudicationAudit();
  assert.equal(report.summary.anchorAuditRedirectReady, false, 'anker-auditen alene skal aldri godkjenne redirect');
  assert.equal(report.summary.redirectReady, true);
  assert.equal(report.summary.redirectTarget, 'fagverk.html?subject=historie#fagverkIaProgresjon');
  assert.equal(report.summary.portalStillLegacy, true);

  const historie = portal.categories.find((item) => item.id === 'historie');
  assert.equal(historie.badgePage, 'data/fag/historie/merke_historie (1).html');
});

test('Historie bidrag er eksplisitt gammel produkttekst, ikke canonical kunnskapsinnhold', () => {
  const report = adjudicationAudit();
  const contribution = report.rows.find((row) => row.id === 'bidrag');
  assert.equal(contribution.role, 'legacy_product_copy');
  assert.equal(contribution.disposition, 'retire_legacy_product_copy');
  assert.deepEqual(contribution.ownerFiles, []);
});
