import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaturFagkartQuality } from '../scripts/audit-natur-fagkart-quality.mjs';

test('alle Natur-hooks og emnemappings har eget læringsfokus og gyldige referanser', () => {
  const report = auditNaturFagkartQuality();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.categoryCount, 9);
  assert.equal(report.summary.hookCount, 90);
  assert.equal(report.summary.uniqueFocusQuestions, 90);
  assert.equal(report.summary.uniqueQuestionMoveSets, 90);
  assert.equal(report.summary.uniqueRotationNotes, 90);
  assert.equal(report.summary.mappedEmneCount, 53);
  assert.equal(report.summary.uniqueMappingUseNotes, report.summary.mappingCount);
});
