import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const portal = JSON.parse(fs.readFileSync('data/fagverk/fagverk_portal.json', 'utf8'));

function runJsonScript(script) {
  const result = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function audit() {
  return runJsonScript('scripts/audit-fagverk-by-legacy-theory.mjs');
}

function adjudicationAudit() {
  return runJsonScript('scripts/audit-fagverk-by-legacy-adjudication.mjs');
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

test('adjudiseringsgaten krever eksplisitt disposisjon og canonical eier for alle ti kunnskapsseksjoner', () => {
  const report = adjudicationAudit();
  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.equal(report.summary.adjudicatedKnowledgeCount, 10);
  assert.equal(report.rows.filter((row) => row.role === 'knowledge').every((row) => row.anchorCoverage === 1), true);
  assert.equal(report.rows.filter((row) => row.role === 'knowledge').every((row) => row.ownerFiles.length > 0), true);
});

test('den geografiske legacy-seksjonen er eksplisitt migrert til canonical By etter topografi/grunnforhold-gapet', () => {
  const report = adjudicationAudit();
  const geographic = report.rows.find((row) => row.id === 'geografisk');
  assert.equal(geographic.disposition, 'migrated_to_canonical');
  assert.ok(geographic.ownerFiles.includes('data/fagverk/by/arkitektur-type-skala-byform.json'));
  assert.ok(geographic.migrationRefs.includes('PR #5435'));
  assert.ok(geographic.migrationRefs.includes('data/fagverk/by/arkitektur-type-skala-byform/01-grunnlag.json'));
  assert.ok(geographic.migrationRefs.includes('data/fagverk/by/arkitektur-type-skala-byform/claims.json'));
});

test('adjudisering gjør innholdet redirect-klart uten å endre badgePage i samme tranche', () => {
  const report = adjudicationAudit();
  assert.equal(report.summary.anchorAuditRedirectReady, false, 'anker-auditen skal fortsatt ikke kunne auto-godkjenne redirect');
  assert.equal(report.summary.redirectReady, true);
  assert.equal(report.summary.redirectTarget, 'fagverk.html?subject=by#fagverkIaProgresjon');
  assert.equal(report.summary.portalStillLegacy, true);
  const contribution = report.rows.find((row) => row.id === 'bidrag');
  assert.equal(contribution.disposition, 'retire_legacy_product_copy');
});
