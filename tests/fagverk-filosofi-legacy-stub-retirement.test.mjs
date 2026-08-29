import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const SCRIPT = 'scripts/audit-fagverk-filosofi-legacy-stub.mjs';
const ARCHIVE = 'data/fag/filosofi/archive/merke_filosofi_legacy_20260829.html';
const COMPATIBILITY = 'data/fag/filosofi/merke_filosofi.html';
const TARGET = 'fagverk.html?subject=filosofi#fagverkIaProgresjon';

function audit() {
  const result = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Filosofi-stubben har ingen unik kunnskap eller runtime som må migreres', () => {
  const report = audit();
  assert.equal(report.subject, 'filosofi');
  assert.equal(report.legacy.sectionCount, 3);
  assert.equal(report.legacy.archiveLinkCount, 3);
  assert.equal(report.legacy.noIndependentRuntime, true);
  assert.equal(report.summary.uniqueKnowledgeMigrationRequired, false);
  assert.equal(report.summary.uniqueRuntimeMigrationRequired, false);
  assert.deepEqual(report.canonical.missingKnowledgeAnchors, []);
  assert.deepEqual(report.navigation.unknownArchiveLinks, []);
  assert.equal(report.summary.redirectReady, true);
});

test('Filosofi-stubbens kjerneområder er allerede canonicalt eid', () => {
  const report = audit();
  const found = report.canonical.knowledgeAnchors.map((row) => row.found);
  for (const expected of ['logikk', 'etikk', 'estetikk', 'vitenskapsfilosofi', 'eksistensialisme', 'fenomenologi']) {
    assert.ok(found.includes(expected), `Mangler canonical dekning for ${expected}`);
  }
  assert.equal(report.canonical.runtimeCounts.domainCount, 20);
  assert.equal(report.canonical.runtimeCounts.emneCount, 68);
  assert.equal(report.canonical.runtimeCounts.methodCount, 34);
  assert.equal(report.canonical.runtimeCounts.chapterCount, 20);
});

test('Eget faggrunnlag er produktkontrakt, ikke legacy-teori som skal kopieres', () => {
  const report = audit();
  assert.equal(report.legacy.productSummary.role, 'legacy_product_ownership_summary');
  assert.equal(report.legacy.productSummary.separateSubjectIdentity, true);
  assert.equal(report.legacy.productSummary.requiredManifestFieldsPresent, true);
  assert.equal(report.legacy.productSummary.migrateAsKnowledge, false);
});

test('Filosofi compatibility-ruten er ren og originalstubben er bevart', () => {
  const report = audit();
  assert.equal(report.navigation.target, TARGET);
  assert.equal(report.navigation.portalRoute, TARGET);
  assert.equal(report.navigation.portalRedirected, true);
  assert.equal(report.navigation.compatibilityRedirectPresent, true);
  assert.ok(fs.existsSync(ARCHIVE));
  const compatibility = fs.readFileSync(COMPATIBILITY, 'utf8');
  const archive = fs.readFileSync(ARCHIVE, 'utf8');
  assert.match(compatibility, /location\.replace/);
  assert.doesNotMatch(compatibility, /Kjerneområder|Eget faggrunnlag|argumentasjon, logikk og begrepsanalyse/);
  assert.match(archive, /Kjerneområder/);
  assert.match(archive, /Eget faggrunnlag/);
});
