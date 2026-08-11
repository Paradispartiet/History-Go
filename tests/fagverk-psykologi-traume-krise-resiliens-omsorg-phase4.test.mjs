import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiTraumeKriseResiliensOmsorgPhase4 } from '../scripts/audit-fagverk-psykologi-traume-krise-resiliens-omsorg-phase4.mjs';

test('Psykologi traume krise resiliens og omsorg er komplett sjette phase-4-kapittel', () => {
  const { report } = auditPsykologiTraumeKriseResiliensOmsorgPhase4();
  assert.equal(report.chapter.id, 'traume-krise-resiliens-og-omsorg');
  assert.equal(report.chapter.primaryDomainId, 'traume_krise_resiliens_omsorg');
  assert.equal(report.summary.emneCount, 7);
  assert.equal(report.summary.methodCount, 15);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 27);
  assert.equal(report.summary.sourceCount, 22);
  assert.equal(report.summary.externalSourceCount, 20);
  assert.equal(report.subject.registeredChapterCount, 6);
  assert.equal(report.subject.targetChapterCount, 6);
  assert.equal(report.subject.editorialStatus, 'complete');
  assert.deepEqual(report.runtimePlaceIds, ['22_juli_senteret','psykologisk_institutt_uio']);
  assert.deepEqual(report.traumaCaseNames, ['Potensielt traumatisk hendelse og varierende reaksjoner','Langtidsoppfølging etter 22. juli','Sorg, tap og prolonged grief disorder','Resiliens, sosial støtte og beskyttelsesfaktorer']);
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('sluttkapittelet har bindende vern mot klinisk overreach fra hendelse, risiko og resiliens', () => {
  const { report, brief, claimsDoc } = auditPsykologiTraumeKriseResiliensOmsorgPhase4();
  assert.equal(report.chapter.doNotDiagnosePeople, true);
  assert.equal(brief.safety.noIndividualTreatmentAdvice, true);
  assert.equal(brief.safety.noScreeningInterpretation, true);
  assert.equal(brief.safety.noTraumaInferenceFromCasualObservation, true);
  assert.equal(brief.safety.noExposureEqualsDisorder, true);
  assert.equal(brief.safety.noRiskFactorAsIndividualPrognosis, true);
  assert.equal(brief.safety.noResilienceTypingFromOutcome, true);
  assert.equal(claimsDoc.source_policy.noDiagnosisOfIndividuals, true);
  assert.equal(claimsDoc.source_policy.noRiskFactorAsIndividualPrognosis, true);
  assert.equal(claimsDoc.source_policy.noResilienceTypingFromOutcome, true);
});
