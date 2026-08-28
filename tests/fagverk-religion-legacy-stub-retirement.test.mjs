import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const SCRIPT = 'scripts/audit-fagverk-religion-legacy-stub.mjs';
const ARCHIVE = 'data/fag/religion/archive/merke_religion_legacy_20260828.html';
const COMPATIBILITY = 'data/fag/religion/merke_religion.html';
const TARGET = 'fagverk.html?subject=religion#fagverkIaProgresjon';

function audit() {
  const result = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Religion-stubben har ingen unik kunnskap eller runtime som må migreres', () => {
  const report = audit();
  assert.equal(report.subject, 'religion');
  assert.equal(report.legacy.noIndependentRuntime, true);
  assert.equal(report.summary.uniqueKnowledgeMigrationRequired, false);
  assert.equal(report.summary.uniqueRuntimeMigrationRequired, false);
  assert.equal(report.summary.legacyProductSummaryRetired, true);
  assert.equal(report.canonical.missingDescriptiveAnchors.length, 0);
  assert.equal(report.navigation.unknownArchiveLinks.length, 0);
  assert.equal(report.summary.redirectReady, true);
});

test('Religion 4/8/8 behandles som legacy-produktoppsummering, ikke kunnskapsinnhold', () => {
  const report = audit();
  assert.equal(report.legacy.structureSummary.role, 'legacy_product_summary');
  assert.equal(report.legacy.structureSummary.present, true);
  assert.equal(report.legacy.structureSummary.migrateAsKnowledge, false);
  assert.ok(report.canonical.runtimeCounts.domainCount > 0);
  assert.ok(report.canonical.runtimeCounts.emneCount > 0);
  assert.ok(report.canonical.runtimeCounts.methodCount > 0);
});

test('Religion gamle URL er ren compatibility-redirect og original stub er arkivert', () => {
  const report = audit();
  assert.equal(report.navigation.target, TARGET);
  assert.equal(report.navigation.portalRoute, TARGET);
  assert.equal(report.navigation.portalRedirected, true);
  assert.equal(report.navigation.compatibilityRedirectPresent, true);

  assert.ok(fs.existsSync(ARCHIVE));
  const compatibility = fs.readFileSync(COMPATIBILITY, 'utf8');
  assert.match(compatibility, /location\.replace/);
  assert.match(compatibility, /subject=religion#fagverkIaProgresjon/);
  assert.doesNotMatch(compatibility, /Religionsfaget samler|kildebasert og respektfullt studieløp/);
});
