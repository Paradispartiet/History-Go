import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaturQuality } from '../scripts/audit-natur-subject-quality.mjs';

test('Natur-faget har unikt læringsinnhold, konkrete metoder og normal quizåpning etter sluttfasen', () => {
  const report = auditNaturQuality();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.emneCount, 77);
  assert.equal(report.summary.methodCount, 51);
  assert.equal(report.summary.mappingCount, 77);
  assert.equal(report.summary.hookCount, 136);
  assert.equal(report.summary.uniqueDefinitions, 77);
  assert.equal(report.summary.uniqueWhyExplanations, 77);
  assert.equal(report.summary.uniqueQuestionSets, 77);
  assert.equal(report.summary.uniqueConflictSets, 77);
  assert.equal(report.summary.methodsWithProcedure, 51);
  assert.equal(report.summary.methodsWithLimitations, 51);
  assert.equal(report.summary.normalOpeningQuestions, 14);
});
