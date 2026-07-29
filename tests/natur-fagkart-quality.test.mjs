import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaturFagkartQuality } from '../scripts/audit-natur-fagkart-quality.mjs';

test('alle Natur-hooks og emnemappings har eget læringsfokus og gyldige referanser', () => {
  const report = auditNaturFagkartQuality();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.categoryCount, 11);
  assert.equal(report.summary.hookCount, 110);
  assert.equal(report.summary.uniqueFocusQuestions, 110);
  assert.equal(report.summary.uniqueQuestionMoveSets, 110);
  assert.equal(report.summary.uniqueRotationNotes, 110);
  assert.equal(report.summary.mappedEmneCount, 65);
  assert.equal(report.summary.uniqueMappingUseNotes, report.summary.mappingCount);
});
