import test from 'node:test';
import assert from 'node:assert/strict';
import { auditPsykologiPsykiskHelsePhase4 } from '../scripts/audit-fagverk-psykologi-psykisk-helse-phase4.mjs';

test('Psykologi psykisk helse dekker første canonicale domene komplett', () => {
  const { report } = auditPsykologiPsykiskHelsePhase4();
  assert.equal(report.chapter.id, 'psykisk-helse-institusjoner-og-behandling');
  assert.equal(report.chapter.primaryDomainId, 'psykisk_helse_institusjoner_behandling');
  assert.equal(report.summary.emneCount, 12);
  assert.equal(report.summary.methodCount, 18);
  assert.equal(report.summary.moduleCount, 3);
  assert.equal(report.summary.sectionCount, 9);
  assert.equal(report.summary.paragraphCount, 27);
  assert.equal(report.gates.exactCanonicalEmneCoverage, true);
  assert.equal(report.gates.allMethodsCanonicalAndUsed, true);
});

test('alle fagavsnitt har claims og inspiserbare kilder', () => {
  const { report, claimsDoc } = auditPsykologiPsykiskHelsePhase4();
  assert.ok(report.summary.claimCount >= 24);
  assert.ok(report.summary.externalSourceCount >= 15);
  assert.equal(report.gates.paragraphClaimTraceComplete, true);
  assert.equal(report.gates.allClaimsSourceResolved, true);
  assert.equal(report.gates.currentLegalSourcesPresent, true);
  assert.ok(claimsDoc.sources.every((source) => source.source_location));
});

test('diagnose- og behandlingsrådvern er bindende', () => {
  const { report } = auditPsykologiPsykiskHelsePhase4();
  assert.equal(report.chapter.doNotDiagnosePeople, true);
  assert.equal(report.gates.doNotDiagnosePeopleGuardPresent, true);
  assert.equal(report.gates.noIndividualTreatmentAdviceGuardPresent, true);
});

test('kun materialiserte Psychology-steder brukes som runtime places', () => {
  const { report } = auditPsykologiPsykiskHelsePhase4();
  assert.deepEqual(report.runtimePlaceIds, ['psykologisk_institutt_uio']);
  assert.deepEqual(report.institutionCaseNames, [
    'Gaustad sykehus',
    'Dikemark sykehus',
    'Psykiatrisk avdeling, Vinderen'
  ]);
  assert.equal(report.gates.noInventedRuntimePlaces, true);
});

test('første Psykologi-kapittel forblir gyldig gjennom universitetsutvidelsen', () => {
  const { report } = auditPsykologiPsykiskHelsePhase4();
  assert.ok(['chapters_in_progress', 'complete', 'expanded_and_audited'].includes(report.subject.editorialStatus));
  if (report.subject.editorialStatus === 'expanded_and_audited') {
    assert.equal(report.subject.nextGate, 'university_matrix_topic_articles_concept_registry_and_methods');
  } else if (report.subject.editorialStatus === 'complete') {
    assert.equal(report.subject.nextGate, 'maintenance_source_refresh_and_place_case_expansion');
  } else {
    assert.ok(['remaining_domain_chapter_production', 'full_subject_audit'].includes(report.subject.nextGate));
  }
  assert.ok(report.subject.registeredChapterCount >= 1 && report.subject.registeredChapterCount <= 6);
  assert.equal(report.subject.targetChapterCount, 6);
  assert.equal(report.gates.registrySynchronized, true);
  assert.equal(report.gates.statusProgressionCompatible, true);
});
