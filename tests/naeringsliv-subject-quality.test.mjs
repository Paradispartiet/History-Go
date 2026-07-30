import test from 'node:test';
import assert from 'node:assert/strict';
import { auditNaeringslivQuality } from '../scripts/audit-naeringsliv-subject-quality.mjs';

test('Økonomi og næringsliv is materialized through its canonical academic and professional package', () => {
  const report = auditNaeringslivQuality();
  assert.equal(report.status, 'passed');
  assert.equal(report.summary.domainCount, 6);
  assert.equal(report.summary.emneCount, 38);
  assert.equal(report.summary.coreEmneCount, 36);
  assert.equal(report.summary.methodCount, 27);
  assert.equal(report.summary.academicTrackCount, 6);
  assert.equal(report.summary.professionalTrackCount, 5);
  assert.equal(report.summary.professionalModuleCount, 25);
  assert.equal(report.summary.totalLearningUnits, 61);
  assert.equal(report.summary.registeredChapterCount, 0);
});
