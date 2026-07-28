import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaturQuality } from '../scripts/audit-natur-subject-quality.mjs';

test('Natur-faget har unikt læringsinnhold, konkrete metoder og normal quizåpning', () => {
  const report = auditNaturQuality();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 35);
  assert.equal(report.summary.methodCount, 30);
  assert.equal(report.summary.uniqueDefinitions, 35);
  assert.equal(report.summary.uniqueWhyExplanations, 35);
  assert.equal(report.summary.uniqueQuestionSets, 35);
  assert.equal(report.summary.uniqueConflictSets, 35);
  assert.equal(report.summary.methodsWithProcedure, 30);
  assert.equal(report.summary.methodsWithLimitations, 30);
  assert.equal(report.summary.normalOpeningQuestions, 14);
});
