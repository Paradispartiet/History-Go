import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiUtviklingOppvekstLaringPhase4 } from '../scripts/audit-fagverk-psykologi-utvikling-oppvekst-laring-phase4.mjs';

test('Psykologi utvikling oppvekst og læring forblir gyldig gjennom videre phase-4-produksjon', () => {
  const { report } = auditPsykologiUtviklingOppvekstLaringPhase4();
  assert.equal(report.chapter.id, 'utvikling-oppvekst-og-laring');
  assert.equal(report.chapter.primaryDomainId, 'utvikling_oppvekst_laring');
  assert.equal(report.summary.emneCount, 9);
  assert.equal(report.summary.methodCount, 18);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 27);
  assert.equal(report.summary.sourceCount, 19);
  assert.equal(report.summary.externalSourceCount, 18);
  assert.ok(report.subject.registeredChapterCount >= 3 && report.subject.registeredChapterCount <= 6);
  assert.equal(report.subject.targetChapterCount, 6);
  assert.deepEqual(report.runtimePlaceIds, ['psykologisk_institutt_uio']);
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('utviklingskapittelet har bindende diagnose- og utviklingsmerkingsvern', () => {
  const { report, brief, claimsDoc } = auditPsykologiUtviklingOppvekstLaringPhase4();
  assert.equal(report.chapter.doNotDiagnosePeople, true);
  assert.equal(brief.safety.noIndividualTreatmentAdvice, true);
  assert.equal(brief.safety.noScreeningInterpretation, true);
  assert.equal(brief.safety.noDevelopmentalLabelingFromCasualObservation, true);
  assert.equal(claimsDoc.source_policy.noDiagnosisOfIndividuals, true);
  assert.equal(claimsDoc.source_policy.noDevelopmentalLabelingFromCasualObservation, true);
});
