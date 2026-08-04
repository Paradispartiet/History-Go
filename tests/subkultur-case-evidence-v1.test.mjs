import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSubkulturCaseEvidence, buildSubkulturCaseEvidenceReport } from '../scripts/audit-subkultur-case-evidence-v1.mjs';

test('andre casebatch materialiserer nitten validerte og to avviste cases uten å lukke de øvrige', () => {
  const report = auditSubkulturCaseEvidence();
  assert.equal(report.totals.profile_candidates, 50);
  assert.equal(report.totals.eligible_cases, 48);
  assert.equal(report.totals.validated_cases, 19);
  assert.equal(report.totals.rejected_cases, 2);
  assert.equal(report.totals.remaining_candidates, 29);
  assert.equal(report.status, 'PARTIAL_CASE_VALIDATION_READY');
});

test('hver validert case har miljønær og uavhengig inspectable kilde', () => {
  const report = buildSubkulturCaseEvidenceReport();
  assert.equal(report.totals.case_sources, 38);
  assert.equal(report.totals.environment_near_sources, 19);
  assert.equal(report.totals.independent_control_sources, 19);
  assert.ok(report.cases.every((entry) => entry.sources >= 2));
  assert.ok(report.cases.every((entry) => entry.environment_near_sources >= 1));
  assert.ok(report.cases.every((entry) => entry.independent_control_sources >= 1));
});

test('alle fem casekrav og etikkporten er eksplisitt bestått', () => {
  const report = buildSubkulturCaseEvidenceReport();
  assert.ok(report.cases.every((entry) => entry.requirements_passed === 5));
  assert.ok(report.cases.every((entry) => entry.ethics_status === 'PASS'));
  assert.deepEqual(report.integrity.failures, []);
});

test('casekildeporten forskutterer ikke runtime, quiz eller komplett profil', () => {
  const report = buildSubkulturCaseEvidenceReport();
  assert.deepEqual(report.status_guard, {
    navigation_status: 'planned',
    assessment_status: 'pending',
    editorial_status: 'not_started',
    next_gate: 'remaining_case_source_validation'
  });
  assert.equal(report.next_gate, 'remaining_case_source_validation');
});
