import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiFagtradisjonerPhase4 } from '../scripts/audit-fagverk-psykologi-fagtradisjoner-teori-phase4.mjs';

test('Psykologi fagtradisjoner og teori forblir gyldig gjennom videre phase-4-produksjon', () => {
  const { report } = auditPsykologiFagtradisjonerPhase4();
  assert.equal(report.summary.emneCount, 14);
  assert.equal(report.summary.methodCount, 18);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 27);
  assert.equal(report.summary.sourceCount, 21);
  assert.equal(report.summary.externalSourceCount, 20);
  assert.ok(report.subject.registeredChapterCount >= 2 && report.subject.registeredChapterCount <= 6);
  assert.equal(report.subject.targetChapterCount, 6);
  assert.ok(Object.values(report.gates).every(Boolean));
});
