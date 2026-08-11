import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiSosialpsykologiNormalitetStigmaPhase4 } from '../scripts/audit-fagverk-psykologi-sosialpsykologi-normalitet-stigma-phase4.mjs';

test('Psykologi sosialpsykologi normalitet og stigma er komplett femte phase-4-kapittel', () => {
  const { report } = auditPsykologiSosialpsykologiNormalitetStigmaPhase4();
  assert.equal(report.chapter.id, 'sosialpsykologi-normalitet-og-stigma');
  assert.equal(report.chapter.primaryDomainId, 'sosialpsykologi_normalitet_stigma');
  assert.equal(report.summary.emneCount, 8);
  assert.equal(report.summary.methodCount, 15);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.summary.claimCount, 27);
  assert.equal(report.summary.sourceCount, 21);
  assert.equal(report.summary.externalSourceCount, 20);
  assert.equal(report.subject.registeredChapterCount, 5);
  assert.equal(report.subject.targetChapterCount, 6);
  assert.deepEqual(report.runtimePlaceIds, ['psykologisk_institutt_uio']);
  assert.deepEqual(report.socialCaseNames, ['Konformitet, normer og sosial påvirkning','Kategorisering, kontakt og fordommer','Diagnosemerking, stigma og diskriminering','Ensomhet, sosial isolasjon og tilhørighet']);
  assert.ok(Object.values(report.gates).every(Boolean));
});

test('sosialpsykologikapittelet har bindende diagnose- og gruppetypestemplingsvern', () => {
  const { report, brief, claimsDoc } = auditPsykologiSosialpsykologiNormalitetStigmaPhase4();
  assert.equal(report.chapter.doNotDiagnosePeople, true);
  assert.equal(brief.safety.noIndividualTreatmentAdvice, true);
  assert.equal(brief.safety.noScreeningInterpretation, true);
  assert.equal(brief.safety.noGroupOrStigmaTypingFromCasualObservation, true);
  assert.equal(claimsDoc.source_policy.noDiagnosisOfIndividuals, true);
  assert.equal(claimsDoc.source_policy.noGroupOrStigmaTypingFromCasualObservation, true);
});
