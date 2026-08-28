import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const LEGACY_ARCHIVE = 'data/fag/litteratur/archive/merke_litteratur_full_teori_legacy_20260828.html';
const COMPAT_ROUTE = 'data/fag/litteratur/merke_litteratur (1).html';
const PROGRESS_ROUTE = 'fagverk.html?subject=litteratur#fagverkIaProgresjon';
const LANGUAGE_HISTORY_OWNER = 'data/fag/litteratur/litteraturvitenskap_canonical_v1/foundation_texts/norsk_nordisk_samisk_minoritetslitteratur.json';

function adjudicationAudit() {
  const result = spawnSync(process.execPath, ['scripts/audit-fagverk-litteratur-legacy-adjudication.mjs'], {
    encoding: 'utf8'
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Litteratur-adjudiseringen avgjør alle ti kunnskapsseksjoner uten å kopiere legacy-prosa', () => {
  const report = adjudicationAudit();
  assert.equal(report.subject, 'litteratur');
  assert.equal(report.summary.legacySectionCount, 11);
  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.equal(report.summary.adjudicatedKnowledgeCount, 10);
  assert.equal(report.summary.migratedSectionCount, 0);
  assert.equal(report.summary.retiredProductCopyCount, 1);
  assert.equal(
    report.rows.filter((row) => row.role === 'knowledge').every((row) => row.disposition === 'canonical_supersedes'),
    true
  );
});

test('alle Litteratur-kunnskapsseksjoner har eksisterende canonicale eiere og full ankerdekning', () => {
  const report = adjudicationAudit();
  for (const row of report.rows.filter((item) => item.role === 'knowledge')) {
    assert.equal(row.anchorCoverage, 1, `${row.id} mangler full canonical ankerdekning`);
    assert.ok(row.ownerFiles.length > 0, `${row.id} mangler canonical eier`);
    for (const ownerFile of row.ownerFiles) {
      assert.ok(fs.existsSync(ownerFile), `${row.id} peker til manglende owner-fil: ${ownerFile}`);
    }
  }
  assert.ok(report.summary.canonicalOwnerFileCount >= 15, 'Litteratur-adjudiseringen har uventet få distinkte canonicale eierfiler');
});

test('legacy språkendring og språkhistorie adjudiseres til canonical historisk språkdekning', () => {
  const report = adjudicationAudit();
  const temporal = report.rows.find((row) => row.id === 'temporal');
  assert.equal(temporal.disposition, 'canonical_supersedes');
  assert.ok(temporal.ownerFiles.includes(LANGUAGE_HISTORY_OWNER));
  assert.match(temporal.rationale, /språkendring\/språkhistorie/i);
  assert.match(temporal.rationale, /målreisning/i);
  assert.match(temporal.rationale, /normering/i);
});

test('Litteratur-adjudiseringen holder den migrerte progresjonsruten fail-closed', () => {
  const report = adjudicationAudit();
  assert.equal(report.summary.anchorAuditRedirectReady, false, 'anker-auditen alene skal aldri godkjenne redirect');
  assert.equal(report.summary.redirectReady, true);
  assert.equal(report.summary.redirectTarget, PROGRESS_ROUTE);
  assert.equal(report.summary.portalRoute, PROGRESS_ROUTE);
  assert.equal(report.summary.portalRedirected, true);
  assert.equal(report.summary.legacyBadgeSourcePreserved, true);
  assert.equal(report.summary.compatibilityRedirectPresent, true);
  assert.equal(report.inputs.legacyBadgePage, LEGACY_ARCHIVE);
  assert.equal(report.inputs.compatibilityBadgePage, COMPAT_ROUTE);

  assert.ok(fs.existsSync(LEGACY_ARCHIVE));
  assert.ok(fs.existsSync(COMPAT_ROUTE));
  const compatHtml = fs.readFileSync(COMPAT_ROUTE, 'utf8');
  assert.match(compatHtml, /location\.replace/);
  assert.match(compatHtml, /subject=litteratur#fagverkIaProgresjon/);
});

test('Litteratur bidrag er gammel produkttekst og får ingen kunstig canonical eier', () => {
  const report = adjudicationAudit();
  const contribution = report.rows.find((row) => row.id === 'bidrag');
  assert.equal(contribution.role, 'legacy_product_copy');
  assert.equal(contribution.disposition, 'retire_legacy_product_copy');
  assert.deepEqual(contribution.ownerFiles, []);
});
