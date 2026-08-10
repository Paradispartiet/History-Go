import test from 'node:test';
import assert from 'node:assert/strict';
import { auditMediaMedieokonomiEierskapArbeidPhase4 } from '../scripts/audit-fagverk-media-medieokonomi-eierskap-arbeid-phase4.mjs';

test('Media Medieøkonomi, eierskap og arbeid dekker canonicalt 20/20 med claimspor', () => {
  const { report } = auditMediaMedieokonomiEierskapArbeidPhase4();
  assert.equal(report.canonicalCoverage.exactCoverage, '20/20');
  assert.equal(report.canonicalCoverage.coveredSubjectEmneCount, 120);
  assert.equal(report.canonicalCoverage.remainingDomainCount, 0);
  assert.deepEqual(report.summary, { moduleCount: 3, sectionCount: 9, paragraphCount: 27, conceptCount: 6, workedExampleCount: 3, misconceptionCount: 5, applicationTaskCount: 5, selfCheckCount: 7, methodCount: 19, sourceCount: 24, claimCount: 27, placeCaseCount: 4, criticalDistinctionCount: 30 });
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('Media går til complete først med seks kapitler og eksplisitt helhetsauditport', () => {
  const { report } = auditMediaMedieokonomiEierskapArbeidPhase4();
  assert.equal(report.subject.registeredChapterCount, 6);
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
});
