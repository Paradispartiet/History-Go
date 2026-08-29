import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const SCRIPT = 'scripts/audit-fagverk-musikk-legacy-theory.mjs';
const LEGACY_BADGE = 'data/fag/musikk/archive/merke_musikk_full_teori_legacy_20260829.html';
const COMPATIBILITY = 'data/fag/musikk/merke_musikk (1).html';
const TARGET = 'fagverk.html?subject=musikk#fagverkIaProgresjon';
const ORIGINAL_BLOB = '4332f0292777e82d1dddbc05d58ef4651ae88774';
const EXPECTED_IDS = [
  'felt', 'musikalsk_form', 'utovelse', 'produksjon_teknologi',
  'sjangere_miljoer', 'scener_infrastruktur', 'musikk_samfunn', 'kjernebegreper'
];
const EXPECTED_MANIFEST_FILES = [
  'data/fag/musikk/emner_musikk_canonical_v4_5.json',
  'data/fag/musikk/fagkart_musikk_canonical_v4_5.json',
  'data/fag/musikk/methods_musikk_canonical_v4_5.json',
  'data/fag/musikk/musikkpensum_canonical_v4_5.json'
];

function runAudit(...args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

function gitBlobSha(file) {
  const bytes = fs.readFileSync(file);
  return createHash('sha1').update(Buffer.from(`blob ${bytes.length}\0`)).update(bytes).digest('hex');
}

test('Musikk legacy-teori har 8/8 canonical dekning fra byte-identisk arkiv', () => {
  const report = runAudit('--no-check-report');
  assert.equal(report.schema, 'history_go_fagverk_musikk_legacy_theory_audit_v1');
  assert.equal(report.subject, 'musikk');
  assert.equal(report.legacy.badgePage, LEGACY_BADGE);
  assert.equal(report.legacy.compatibilityPage, COMPATIBILITY);
  assert.equal(report.legacy.sectionCount, 8);
  assert.equal(report.legacy.knowledgeSectionCount, 8);
  assert.equal(report.legacy.productMechanicCount, 1);
  assert.deepEqual(report.rows.map(row => row.id), EXPECTED_IDS);
  assert.equal(gitBlobSha(LEGACY_BADGE), ORIGINAL_BLOB, 'Musikk-arkivet må være byte-identisk med original legacy-blob');

  assert.equal(report.summary.knowledgeSectionCount, 8);
  assert.equal(report.summary.anchorCompleteCount, 8);
  assert.equal(report.summary.manualReviewCount, 0);
  assert.deepEqual(report.summary.manualReview, []);
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /adjudication gate/i);

  for (const row of report.rows) {
    assert.equal(row.role, 'knowledge');
    assert.ok(row.anchorCount > 0, `${row.id} mangler auditankere`);
    assert.equal(row.foundCount, row.anchorCount, `${row.id} mangler canonical dekning`);
    assert.equal(row.anchorCoverage, 1, `${row.id} skal ha full canonical dekning`);
    assert.deepEqual(row.missingAnchors, [], `${row.id} skal ikke ha uavklarte kunnskapsgap`);
  }
});

test('Musikk-equivalence måler hele canonicale eierflaten, ikke bare scientific package', () => {
  const report = runAudit('--no-check-report');
  assert.equal(report.canonical.authority, 'this_package');
  assert.deepEqual(report.canonical.manifestFiles, EXPECTED_MANIFEST_FILES);
  assert.equal(report.canonical.domainCount, 8);
  assert.equal(report.canonical.emneCount, 48);
  assert.equal(report.canonical.methodCount, 18);
  assert.equal(report.canonical.chapterCount, 8);
  assert.equal(report.canonical.chapterOwnedFileCount, 96);
  assert.equal(report.canonical.corpusCharacterCount, 1148237);
  assert.equal(report.canonical.scenekunstSeparateTopLevelSubject, true);
  assert.equal(report.canonical.performanceStudyInScope, true);
});

test('sekundærbadge-formuleringen forblir arkivert produktmekanikk, ikke faglig gap', () => {
  const report = runAudit('--no-check-report');
  const society = report.rows.find(row => row.id === 'musikk_samfunn');
  assert.deepEqual(society.legacyProductMechanics, ['secondary_badge_routing']);
  assert.equal(society.anchorCoverage, 1);
  for (const row of report.rows.filter(item => item.id !== 'musikk_samfunn')) {
    assert.deepEqual(row.legacyProductMechanics, [], `${row.id} skal ikke ha legacy produktmekanikk`);
  }
});

test('Musikk legacy-ruten er pensjonert og compatibility-wrapperen inneholder ikke teori', () => {
  const report = runAudit('--no-check-report');
  assert.equal(report.navigation.badgePage, TARGET);
  assert.equal(report.navigation.subjectPage, 'fagverk.html?subject=musikk');
  assert.equal(report.navigation.target, TARGET);
  assert.equal(report.navigation.portalRedirected, true);
  assert.equal(report.navigation.compatibilityRedirectPresent, true);
  assert.equal(report.navigation.routeRetired, true);

  assert.ok(fs.existsSync(LEGACY_BADGE));
  assert.ok(fs.existsSync(COMPATIBILITY));
  const archived = fs.readFileSync(LEGACY_BADGE, 'utf8');
  assert.match(archived, /<h2>1\. Felt<\/h2>/);
  assert.match(archived, /sekundærbadge/i);
  const compatibility = fs.readFileSync(COMPATIBILITY, 'utf8');
  assert.match(compatibility, /location\.replace/);
  assert.match(compatibility, /subject=musikk#fagverkIaProgresjon/);
  assert.doesNotMatch(compatibility, /merke-blokk|sekundærbadge|<h2>1\. Felt<\/h2>/i);

  const portal = JSON.parse(fs.readFileSync('data/fagverk/fagverk_portal.json', 'utf8'));
  assert.equal(portal.categories.find(item => item.id === 'musikk')?.badgePage, TARGET);
});
