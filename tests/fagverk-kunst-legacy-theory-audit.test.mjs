import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const SCRIPT = 'scripts/audit-fagverk-kunst-legacy-theory.mjs';
const REPORT = 'reports/fagverk/kunst-legacy-theory-audit.json';
const ARCHIVE = 'data/fag/kunst/archive/merke_kunst_legacy_20260828.html';
const COMPATIBILITY = 'data/fag/kunst/merke_kunst (2).html';
const CATEGORY_CONTRACT = 'data/categories/category_contract.json';
const EXPECTED_IDS = [
  'felt', 'verk', 'metode', 'institusjoner', 'offentlig-rom',
  'historie', 'arbeid', 'makt', 'begreper', 'avgrensning'
];

function runAudit(...args) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], { cwd: process.cwd(), encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('Kunst legacy-teori har deterministisk, fail-closed canonical coverage-audit', () => {
  const report = runAudit('--no-check-report');

  assert.equal(report.schema, 'history_go_fagverk_kunst_legacy_theory_audit_v1');
  assert.equal(report.subject, 'kunst');
  assert.equal(report.legacy.badgePage, ARCHIVE);
  assert.equal(report.legacy.sectionCount, 10);
  assert.equal(report.legacy.knowledgeSectionCount, 9);
  assert.equal(report.legacy.productBoundarySectionCount, 1);
  assert.deepEqual(report.rows.map((row) => row.id), EXPECTED_IDS);

  assert.equal(report.summary.knowledgeSectionCount, 9);
  assert.equal(report.summary.productBoundarySectionCount, 1);
  assert.equal(report.summary.productBoundaryCompleteCount, 1);
  assert.equal(report.summary.anchorCompleteCount, 9);
  assert.equal(report.summary.manualReviewCount, 0);
  assert.deepEqual(report.summary.manualReview, []);
  assert.deepEqual(report.summary.uniqueMissingAnchorTerms, []);
  assert.equal(report.summary.redirectReady, false);
  assert.match(report.summary.redirectBlockReason, /editorial adjudication/i);

  const knowledgeRows = report.rows.filter((row) => row.role === 'knowledge');
  assert.equal(knowledgeRows.length, 9);
  for (const row of knowledgeRows) {
    assert.ok(row.anchors.length > 0, `${row.id} mangler auditankere`);
    assert.equal(row.anchorCoverage, 1, `${row.id} har fortsatt canonicalt ankerhull`);
    assert.deepEqual(row.missingAnchors, [], `${row.id} har fortsatt manglende ankere`);
  }

  const boundary = report.rows.find((row) => row.id === 'avgrensning');
  assert.equal(boundary.role, 'product_boundary');
  assert.equal(boundary.ownerFile, CATEGORY_CONTRACT);
  assert.equal(boundary.anchorCoverage, 1);
  assert.equal(boundary.contentStatus, 'canonical_product_boundary_complete');

  for (const required of [
    'data/fag/kunst/kunstpensum_canonical_v4_5.json',
    'data/fag/kunst/emner_kunst_canonical_v4_5.json',
    'data/fag/kunst/fagkart_kunst_canonical_v4_5.json',
    'data/fag/kunst/methods_kunst_canonical_v4_5.json',
    'data/fag/kunst/emnemapping_kunst_canonical_v4_5.json'
  ]) {
    assert.ok(report.canonical.manifestFiles.includes(required), `Mangler manifest-eid canonical fil: ${required}`);
  }

  assert.equal(report.canonical.registryChapterCount, 6, 'Kunst skal ha seks registry-eide canonicale kapitler');
  assert.ok(report.canonical.registryFiles.length >= 24, 'Kunst-auditen må inkludere hele registry-eide kapittelgrafen');
  assert.equal(report.canonical.categoryBoundaryOwner, CATEGORY_CONTRACT);
  assert.ok(report.canonical.corpusCharacterCount >= 100000, 'Canonical Kunst-korpus er uventet lite');

  assert.ok(fs.existsSync(ARCHIVE), 'Kunst legacy-kilden må være bevart i arkiv');
  const compatibility = fs.readFileSync(COMPATIBILITY, 'utf8');
  assert.match(compatibility, /location\.replace/);
  assert.match(compatibility, /subject=kunst#fagverkIaProgresjon/);
  assert.doesNotMatch(compatibility, /id="felt"|id="offentlig-rom"/);

  assert.ok(fs.existsSync(REPORT), `${REPORT} må være innchecket som permanent deterministisk audit`);
  const committed = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
  assert.deepEqual(committed, report, `${REPORT} er ikke synkron med audit-scriptet`);
});

test('Kunst-auditen låser gatekunst, konservering og Scenekunst-grensen hos riktige canonicale eiere', () => {
  const report = runAudit('--no-check-report');
  const field = report.rows.find((row) => row.id === 'felt');
  const publicArt = report.rows.find((row) => row.id === 'offentlig-rom');
  const work = report.rows.find((row) => row.id === 'arbeid');
  const boundary = report.rows.find((row) => row.id === 'avgrensning');

  for (const row of [field, publicArt]) {
    const gatekunst = row.anchors.find((anchor) => anchor.alternatives.includes('gatekunst'));
    assert.equal(gatekunst.found, 'gatekunst');
    assert.deepEqual(row.missingAnchors, []);
  }
  assert.deepEqual(work.missingAnchors, []);
  const conservation = work.anchors.find((anchor) => anchor.alternatives.includes('konservering'));
  assert.equal(conservation.found, 'konservering');
  assert.deepEqual(boundary.missingAnchors, []);

  const emners = fs.readFileSync('data/fag/kunst/emner_kunst_canonical_v4_5.json', 'utf8');
  assert.match(emners, /gatekunst/);
  assert.match(emners, /konservering/);
  assert.match(emners, /konservering_og_materialhistorie/);

  const contract = JSON.parse(fs.readFileSync(CATEGORY_CONTRACT, 'utf8'));
  assert.match(contract.decisions.kunst, /Billedkunst|visuell kunst/);
  assert.match(contract.decisions.scenekunst, /Teater/);
  assert.match(contract.decisions.scenekunst, /dans/);
});
