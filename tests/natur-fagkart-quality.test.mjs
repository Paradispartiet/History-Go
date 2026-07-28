import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaturFagkartQuality } from '../scripts/audit-natur-fagkart-quality.mjs';

test('alle Natur-hooks og emnemappings har eget læringsfokus og gyldige referanser', () => {
  const report = auditNaturFagkartQuality();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.categoryCount, 6);
  assert.equal(report.summary.hookCount, 60);
  assert.equal(report.summary.uniqueFocusQuestions, 60);
  assert.equal(report.summary.uniqueQuestionMoveSets, 60);
  assert.equal(report.summary.uniqueRotationNotes, 60);
  assert.equal(report.summary.mappedEmneCount, 35);
  assert.equal(report.summary.uniqueMappingUseNotes, report.summary.mappingCount);
});
