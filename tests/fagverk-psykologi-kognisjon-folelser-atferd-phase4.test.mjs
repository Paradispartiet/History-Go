import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiKognisjonFolelserAtferdPhase4 } from '../scripts/audit-fagverk-psykologi-kognisjon-folelser-atferd-phase4.mjs';

test('Psykologi kognisjon følelser og atferd forblir gyldig gjennom videre phase-4-produksjon', () => {
  const { report } = auditPsykologiKognisjonFolelserAtferdPhase4();
  assert.equal(report.chapter.id, 'kognisjon-folelser-og-atferd');
  assert.equal(report.chapter.primaryDomainId, 'kognisjon_folelser_atferd');
  assert.equal(report.summary.emneCount, 8);
  assert.equal(report.summary.methodCount, 17);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 27);
  assert.equal(report.summary.sourceCount, 21);
  assert.equal(report.summary.externalSourceCount, 20);
  assert.ok(report.subject.registeredChapterCount >= 4 && report.subject.registeredChapterCount <= 6);
  assert.equal(report.subject.targetChapterCount, 6);
  assert.deepEqual(report.runtimePlaceIds, ['psykologisk_institutt_uio']);
  assert.deepEqual(report.cognitionCaseNames, ['Oppmerksomhet og persepsjon','Heuristikker, framing og kognitive bias','Følelse og emosjonsregulering','Stress, vurdering og mestring']);
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('kognisjonskapittelet har bindende diagnose- og typestemplingsvern', () => {
  const { report, brief, claimsDoc } = auditPsykologiKognisjonFolelserAtferdPhase4();
  assert.equal(report.chapter.doNotDiagnosePeople, true);
  assert.equal(brief.safety.noIndividualTreatmentAdvice, true);
  assert.equal(brief.safety.noScreeningInterpretation, true);
  assert.equal(brief.safety.noCognitiveOrEmotionTypingFromCasualObservation, true);
  assert.equal(claimsDoc.source_policy.noDiagnosisOfIndividuals, true);
  assert.equal(claimsDoc.source_policy.noCognitiveOrEmotionTypingFromCasualObservation, true);
});
