import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

function run() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-sport-legacy-adjudication.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Sport-adjudiseringen avgjør alle ti kunnskapsseksjoner og én produktseksjon', () => {
  const report = run();
  assert.equal(report.schema, 'history_go_fagverk_sport_legacy_adjudication_audit_v1');
  assert.equal(report.subject, 'sport');
  assert.equal(report.summary.legacySectionCount, 11);
  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.equal(report.summary.adjudicatedKnowledgeCount, 10);
  assert.equal(report.summary.migratedSectionCount, 1);
  assert.equal(report.summary.canonicalSupersedesCount, 9);
  assert.equal(report.summary.retiredProductCopyCount, 1);
  assert.equal(report.summary.rawAuditRedirectReady, false);
  assert.equal(report.summary.redirectReady, true);
});

test('bare sosial er migrated_to_canonical via den eksplisitte gapmigreringen i #5509', () => {
  const report = run();
  const migrated = report.rows.filter((row) => row.disposition === 'migrated_to_canonical');
  assert.deepEqual(migrated.map((row) => row.id), ['sosial']);
  assert.ok(migrated[0].ownerFiles.includes('data/fagverk/sport/inkludering-helse-lek-samfunn.json'));
  assert.ok(migrated[0].migrationRefs.includes('PR #5509'));
  assert.equal(migrated[0].anchorCoverage, 1);
});

test('de øvrige ni Sport-kunnskapsseksjonene eies av eksisterende canonicalt fagverk', () => {
  const report = run();
  const knowledge = report.rows.filter((row) => row.role === 'knowledge' && row.id !== 'sosial');
  assert.equal(knowledge.length, 9);
  assert.ok(knowledge.every((row) => row.disposition === 'canonical_supersedes'));
  assert.ok(knowledge.every((row) => row.ownerFiles.length > 0));
  assert.ok(knowledge.every((row) => row.migrationRefs.length === 0));
  assert.ok(knowledge.every((row) => row.anchorCoverage === 1));
});

test('bidrag pensjoneres som legacy-produkttekst uten kunstig kunnskapseier', () => {
  const report = run();
  const product = report.rows.find((row) => row.id === 'bidrag');
  assert.ok(product);
  assert.equal(product.role, 'legacy_product_copy');
  assert.equal(product.disposition, 'retire_legacy_product_copy');
  assert.deepEqual(product.ownerFiles, []);
  assert.deepEqual(product.migrationRefs, []);
});

test('adjudisering åpner retirement-gaten uten å endre aktiv Sport-rute i samme PR', () => {
  const report = run();
  assert.equal(report.summary.redirectTarget, 'fagverk.html?subject=sport#fagverkIaProgresjon');
  assert.equal(report.summary.portalRoute, 'data/fag/sport/merke_sport.html');
  assert.equal(report.summary.portalRedirected, false);
});
