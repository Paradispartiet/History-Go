import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const SCRIPT = 'scripts/audit-fagverk-media-legacy-theory.mjs';
const LEGACY_BADGE = 'data/fag/media/merke_media.html';
const PORTAL = 'data/fagverk/fagverk_portal.json';
const REPORT = 'reports/fagverk/media-legacy-theory-audit.json';
const EXPECTED_IDS = [
  'felt', 'normativ', 'doxa', 'metode', 'materiell', 'sosial',
  'geografisk', 'temporal', 'blindsoner', 'begreper', 'bidrag'
];

function runAudit(...args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Media legacy-teori har deterministisk, fail-closed canonical coverage-audit', () => {
  const report = runAudit('--no-check-report');

  assert.equal(report.schema, 'history_go_fagverk_media_legacy_theory_audit_v1');
  assert.equal(report.subject, 'media');
  assert.equal(report.legacy.badgePage, LEGACY_BADGE);
  assert.equal(report.legacy.sectionCount, 11);
  assert.equal(report.legacy.knowledgeSectionCount, 10);
  assert.deepEqual(report.rows.map((row) => row.id), EXPECTED_IDS);

  assert.equal(report.summary.knowledgeSectionCount, 10);
  assert.equal(report.summary.anchorCompleteCount, 10);
  assert.equal(report.summary.manualReviewCount, 0);
  assert.deepEqual(report.summary.manualReview, []);
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /editorial adjudication/i);

  const knowledgeRows = report.rows.filter((row) => row.role === 'knowledge');
  assert.equal(knowledgeRows.length, 10);
  for (const row of knowledgeRows) {
    assert.ok(row.anchorCount > 0, `${row.id} mangler auditankere`);
    assert.equal(row.foundCount, row.anchorCount, `${row.id} mangler canonicalt eide ankere`);
    assert.equal(row.anchorCoverage, 1, `${row.id} skal ha full kandidatdekning`);
    assert.deepEqual(row.missingAnchors, [], `${row.id} skal ikke ha uavklarte ankerhull`);
  }
  assert.equal(report.rows.at(-1).id, 'bidrag');
  assert.equal(report.rows.at(-1).role, 'legacy_product_copy');
  assert.equal(report.rows.at(-1).anchorCount, 0);

  for (const required of [
    'data/fag/media/mediapensum_canonical_v4_5.json',
    'data/fag/media/emner_media_canonical_v4_5.json',
    'data/fag/media/fagkart_media_canonical_v4_5.json',
    'data/fag/media/methods_media_canonical_v4_5.json',
    'data/fag/media/emnemapping_media_canonical_v4_5.json'
  ]) {
    assert.ok(report.canonical.manifestFiles.includes(required), `Mangler manifest-eid canonical fil: ${required}`);
  }

  assert.equal(report.canonical.supplementFileCount, 5);
  assert.equal(report.canonical.manifestGraphFileCount, 10);
  assert.equal(report.canonical.registrySubjectPresent, true);
  assert.equal(report.canonical.registryChapterCount, 6);
  assert.equal(report.canonical.registryFileCount, 36);
  assert.ok(report.canonical.corpusCharacterCount >= 50000, 'Canonical Media-korpus er uventet lite');

  assert.equal(report.navigation.badgePage, LEGACY_BADGE);
  assert.equal(report.navigation.subjectPage, 'fagverk.html?subject=media');
  assert.equal(report.navigation.preRedirectLocked, true);
  const portal = JSON.parse(fs.readFileSync(PORTAL, 'utf8'));
  assert.equal(portal.categories.find((item) => item.id === 'media')?.badgePage, LEGACY_BADGE, 'Audit-tranchen må ikke redirecte Media');

  assert.ok(fs.existsSync(LEGACY_BADGE), 'Media fullteori må bevares uendret som auditkilde');
  const legacyHtml = fs.readFileSync(LEGACY_BADGE, 'utf8');
  assert.match(legacyHtml, /MEDIA – full teoretisk beskrivelse/);
  assert.match(legacyHtml, /id="felt"/);
  assert.match(legacyHtml, /id="bidrag"/);

  assert.deepEqual(JSON.parse(fs.readFileSync(REPORT, 'utf8')), report, 'Commitet Media-rapport må matche auditresultatet byte-for-semantikk');
});

test('Media legacy-auditen validerer også den committe rapporten i normal modus', () => {
  assert.deepEqual(runAudit(), JSON.parse(fs.readFileSync(REPORT, 'utf8')));
});
