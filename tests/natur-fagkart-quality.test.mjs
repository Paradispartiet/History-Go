import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaturFagkartQuality } from '../scripts/audit-natur-fagkart-quality.mjs';

test('alle Natur-hooks og emnemappings har eget læringsfokus og gyldige referanser etter sluttfasen', () => {
  const report = auditNaturFagkartQuality();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.categoryCount, 12);
  assert.equal(report.summary.hookCount, 136);
  assert.equal(report.summary.uniqueFocusQuestions, 136);
  assert.equal(report.summary.uniqueQuestionMoveSets, 136);
  assert.equal(report.summary.uniqueRotationNotes, 136);
  assert.equal(report.summary.mappedEmneCount, 77);
  assert.equal(report.summary.uniqueMappingUseNotes, report.summary.mappingCount);
});
