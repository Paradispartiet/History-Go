import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const SCRIPT = 'scripts/audit-fagverk-psykologi-legacy-stub.mjs';
const ARCHIVE = 'data/fag/psykologi/archive/merke_psykologi_legacy_20260829.html';
const COMPATIBILITY = 'data/fag/psykologi/merke_psykologi (1).html';
const TARGET = 'fagverk.html?subject=psykologi#fagverkIaProgresjon';
const ORIGINAL_BLOB_SHA = 'c27f90e7d197f8a410d90cb5d31926a7922224dd';

function audit() {
  const result = spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Psykologi-stubben har ingen unik kunnskap eller runtime som må migreres', () => {
  const report = audit();
  assert.equal(report.subject, 'psykologi');
  assert.equal(report.legacy.sectionCount, 3);
  assert.equal(report.legacy.noIndependentRuntime, true);
  assert.equal(report.legacy.originalBlobSha, ORIGINAL_BLOB_SHA);
  assert.equal(report.legacy.archiveBlobSha, ORIGINAL_BLOB_SHA);
  assert.equal(report.legacy.archiveBlobMatchesOriginal, true);
  assert.equal(report.summary.uniqueKnowledgeMigrationRequired, false);
  assert.equal(report.summary.uniqueRuntimeMigrationRequired, false);
  assert.deepEqual(report.canonical.missingKnowledgeAnchors, []);
  assert.deepEqual(report.navigation.unknownArchiveLinks, []);
  assert.equal(report.summary.redirectReady, true);
});

test('Psykologi-stubbens faglige påstander er allerede canonicalt eid', () => {
  const report = audit();
  const found = report.canonical.knowledgeAnchors.map((row) => row.found);
  for (const expected of ['psykisk helse', 'normalitet', 'stigma', 'psykoanalyse', 'kognitiv psykologi', 'makt', 'omsorg']) {
    assert.ok(found.includes(expected), `Mangler canonical dekning for ${expected}`);
  }
  assert.equal(report.canonical.runtimeCounts.domainCount, 6);
  assert.equal(report.canonical.runtimeCounts.emneCount, 58);
  assert.equal(report.canonical.runtimeCounts.methodCount, 58);
  assert.ok(report.canonical.runtimeCounts.chapterCount > 0, 'Psykologi skal ha redigert lærestoff i Fagverket');
});

test('legacy Knowledge-lenken bevares som canonical funksjon i Fagverk Progresjon', () => {
  const report = audit();
  const product = report.legacy.productSummary;
  assert.equal(product.role, 'legacy_subject_knowledge_navigation');
  assert.equal(product.legacyKnowledgeRoute, '../knowledge/knowledge_psykologi.html');
  assert.equal(product.legacyKnowledgeRoutePresent, true);
  assert.equal(product.legacyKnowledgeTargetExists, true);
  assert.equal(product.legacyKnowledgeTargetCanonical, true);
  assert.equal(product.canonicalKnowledgeRoute, 'knowledge.html?subject=psykologi');
  assert.equal(product.subjectKnowledgeActionPresent, true);
  assert.equal(product.currentProgressEquivalent, true);
  assert.equal(product.migrateAsKnowledge, false);
  assert.equal(report.summary.legacyKnowledgeNavigationMigrated, true);
  assert.equal(report.navigation.globalProgressPage, 'emner.html');
  assert.equal(report.navigation.globalProgressExists, true);
  assert.equal(report.navigation.globalProgressLinked, true);
  assert.equal(report.navigation.canonicalKnowledgePage, 'knowledge.html');
  assert.equal(report.navigation.canonicalKnowledgeRoute, 'knowledge.html?subject=psykologi');
  assert.equal(report.navigation.subjectKnowledgeActionPresent, true);
});

test('Psykologi compatibility-ruten er ren og originalstubben er bevart', () => {
  const report = audit();
  assert.equal(report.navigation.target, TARGET);
  assert.equal(report.navigation.portalRoute, TARGET);
  assert.equal(report.navigation.portalRedirected, true);
  assert.equal(report.navigation.badgeIndexRedirected, true);
  assert.equal(report.navigation.compatibilityRedirectPresent, true);
  assert.ok(fs.existsSync(ARCHIVE));
  const compatibility = fs.readFileSync(COMPATIBILITY, 'utf8');
  const archive = fs.readFileSync(ARCHIVE, 'utf8');
  assert.match(compatibility, /location\.replace/);
  assert.doesNotMatch(compatibility, /Hva er dette feltet\?|Kobling til din kunnskap|psykoanalyse til kognitiv psykologi/);
  assert.match(archive, /Hva er dette feltet\?/);
  assert.match(archive, /Kobling til din kunnskap/);
  assert.match(archive, /knowledge_psykologi\.html/);
});
