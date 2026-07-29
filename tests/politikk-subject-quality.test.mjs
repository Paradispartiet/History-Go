import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPolitikkQuality } from '../scripts/audit-politikk-subject-quality.mjs';

test('Politikk-fagfilene består den permanente kvalitetskontrakten', () => {
  const report = auditPolitikkQuality();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.domainCount, 13);
  assert.equal(report.summary.emneCount, 123);
  assert.equal(report.summary.methodCount, 71);
  assert.equal(report.summary.mappingRowCount, 123);
  assert.equal(report.summary.hookCount, 152);
  assert.equal(report.summary.normalOpeningQuestions, 14);
  assert.equal(report.gates.completePensumCoverage, true);
  assert.equal(report.gates.completeMappingCoverage, true);
  assert.equal(report.gates.methodProceduresAndLimitations, true);
  assert.equal(report.gates.canonicalThinkerDisplayNames, true);
});
