import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const EMNERS = 'data/fag/kunst/emner_kunst_canonical_v4_5.json';
const CHAPTER_MODULE = 'data/fagverk/kunst/publikum-og-offentlighet/01-grunnlag.json';
const AUDIT = 'scripts/audit-fagverk-kunst-legacy-theory.mjs';
const TARGET = 'em_kunst_offentlig_kunst_monumenter';

function runAudit(...args) {
  const result = spawnSync(process.execPath, [AUDIT, ...args], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return JSON.parse(result.stdout);
}

test('gatekunst materialiseres i eksisterende Offentlig kunst-emne uten nytt emne', () => {
  const emners = JSON.parse(fs.readFileSync(EMNERS, 'utf8'));
  assert.equal(emners.length, 21);
  const target = emners.find((item) => item.emne_id === TARGET);
  assert.ok(target, `${TARGET} mangler`);
  assert.match(target.definition, /gatekunst/i);
  assert.match(target.definition, /veggmaler/i);
  for (const term of ['gatekunst', 'veggmaleri', 'graffiti']) {
    assert.ok(target.keywords.includes(term), `Mangler keyword ${term}`);
    assert.ok(target.key_concepts.includes(term), `Mangler key concept ${term}`);
  }
  assert.ok(target.core_concepts.includes('gatekunst og veggmaleri'));
  for (const term of ['gatekunst', 'veggmaleri', 'graffiti', 'sjablong', 'midlertidig intervensjon']) {
    assert.ok(target.sub_concepts.includes(term), `Mangler sub concept ${term}`);
  }
  assert.equal(emners.some((item) => item.emne_id !== TARGET && /gatekunst/i.test(item.emne_id || '')), false);
});

test('Publikum og offentlighet eier et eksplisitt gatekunst-begrep', () => {
  const module = JSON.parse(fs.readFileSync(CHAPTER_MODULE, 'utf8'));
  const concept = module.concepts.find((item) => item.id === 'gatekunst');
  assert.ok(concept, 'Gatekunst-begrepet mangler i canonicalt kapittel');
  assert.equal(concept.term, 'Gatekunst');
  assert.match(concept.definition, /graffiti/i);
  assert.match(concept.definition, /sjablong/i);
  assert.match(concept.definition, /veggmaler/i);
  assert.match(concept.definition, /tillatelse/i);
  assert.match(concept.definition, /varighet/i);
});

test('legacy-auditen går fra ett gatekunst-gap til full knowledge-anchor-dekning', () => {
  const report = runAudit('--no-check-report');
  assert.equal(report.legacy.knowledgeSectionCount, 9);
  assert.equal(report.summary.anchorCompleteCount, 9);
  assert.equal(report.summary.manualReviewCount, 0);
  assert.deepEqual(report.summary.manualReview, []);
  assert.deepEqual(report.summary.uniqueMissingAnchorTerms, []);
  assert.equal(report.summary.productBoundaryCompleteCount, 1);
  assert.equal(report.summary.redirectReady, false, 'Innholdsmigrering skal ikke alene autorisere redirect');
  for (const id of ['felt', 'offentlig-rom']) {
    const row = report.rows.find((item) => item.id === id);
    assert.equal(row.anchorCoverage, 1, `${id} har fortsatt gatekunst-gap`);
    assert.deepEqual(row.missingAnchors, []);
  }
});

test('draft training extension blir ikke ny canonical fagkilde', () => {
  const manifest = JSON.parse(fs.readFileSync('data/fag/fag_manifest.json', 'utf8'));
  const manifestText = JSON.stringify(manifest.kunst);
  assert.doesNotMatch(manifestText, /emner_kunst_offentlig_kunst_training_v1/);
});
