import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { audit } from '../scripts/audit-helse-medical-ethics-evidence-fulltext-v1.mjs';

const read = (file) => JSON.parse(fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8'));

test('første Helse-kapittel løser 32 briefclaims med fulltekst og gjensidig claimspor', () => {
  const report = audit();
  assert.deepEqual(report.counts, { domainsCovered: 1, targetDomains: 12, modules: 4, sections: 8, paragraphs: 32, verifiedClaims: 32, inspectableSources: 14, assessmentQuestions: 8, decisionScenarios: 6 });
  assert.ok(Object.values(report.gates).every(Boolean));
  assert.equal(report.six_part_quality_review.total, 29);
});

test('Helse er materialisert og audited uten prematur faglig completion', () => {
  const status = read('data/fagverk/subject_status.json').subjects.find((row) => row.id === 'helse');
  const registry = read('data/fagverk/fagverk_registry.json').subjects.helse;
  assert.deepEqual([status.navigationStatus, status.assessmentStatus, status.editorialStatus], ['materialized', 'audited', 'chapters_in_progress']);
  assert.equal(registry.chapters.filter((row) => row.id === 'medisinsk-etikk-evidens-og-ansvarlig-beslutning').length, 1);
  assert.equal(registry.editorialPlan.targetDomainCount, 12);
  assert.notEqual(status.editorialStatus, 'complete');
});

test('vurderingsoppgavene er generelle, kildebundne og svarteknisk konsistente', () => {
  const assessment = read('data/fagverk/helse/medisinsk-etikk-evidens-og-ansvarlig-beslutning/assessment.json');
  assert.equal(assessment.questions.length, 8);
  for (const row of assessment.questions) {
    assert.equal(row.answer, row.options[row.answerIndex]);
    assert.equal(row.safety_mode, 'general_non_individualizing');
    assert.ok(row.source.length >= 3);
  }
});
