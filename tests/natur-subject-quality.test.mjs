import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaturQuality } from '../scripts/audit-natur-subject-quality.mjs';

test('Natur-faget har unikt læringsinnhold, konkrete metoder og normal quizåpning', () => {
  const report = auditNaturQuality();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 53);
  assert.equal(report.summary.methodCount, 39);
  assert.equal(report.summary.uniqueDefinitions, 53);
  assert.equal(report.summary.uniqueWhyExplanations, 53);
  assert.equal(report.summary.uniqueQuestionSets, 53);
  assert.equal(report.summary.uniqueConflictSets, 53);
  assert.equal(report.summary.methodsWithProcedure, 39);
  assert.equal(report.summary.methodsWithLimitations, 39);
  assert.equal(report.summary.normalOpeningQuestions, 14);
});
