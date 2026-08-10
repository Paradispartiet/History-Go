import test from 'node:test';
import assert from 'node:assert/strict';
import { auditKunstFeltInstitusjonPhase4 } from '../scripts/audit-fagverk-kunst-felt-institusjon-phase4.mjs';

test('Felt og institusjon er canonicalt materialisert 4/4', () => {
  const { report } = auditKunstFeltInstitusjonPhase4();
  assert.equal(report.subject.id, 'kunst');
  assert.equal(report.subject.editorialStatus, 'chapters_in_progress');
  assert.equal(report.subject.registeredChapterCount, 1);
  assert.equal(report.canonicalCoverage.ownerDomainId, 'felt_institusjon');
  assert.equal(report.canonicalCoverage.exactCoverage, '4/4');
  assert.equal(report.canonicalCoverage.remainingDomainCount, 5);
  assert.deepEqual(report.canonicalCoverage.requiredEmneIds, report.canonicalCoverage.coveredEmneIds);
});

test('kapittelet har full pedagogisk og evidensbasert pakke', () => {
  const { report } = auditKunstFeltInstitusjonPhase4();
  assert.deepEqual(report.summary, {
    moduleCount: 3,
    sectionCount: 9,
    paragraphCount: 27,
    conceptCount: 6,
    workedExampleCount: 3,
    misconceptionCount: 4,
    applicationTaskCount: 4,
    selfCheckCount: 6,
    methodCount: 9,
    sourceCount: 16,
    claimCount: 21,
    placeCaseCount: 4
  });
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Kunst står ærlig som uferdig etter første av seks domener', () => {
  const { report } = auditKunstFeltInstitusjonPhase4();
  assert.equal(report.subject.nextGate, 'remaining_domain_chapter_production');
  assert.equal(report.subject.canonicalDomainCount, 6);
  assert.equal(report.subject.canonicalEmneCount, 21);
  assert.equal(report.gates.incompleteSubjectStatusHonest, true);
});
