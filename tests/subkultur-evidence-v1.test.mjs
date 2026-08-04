import test from 'node:test';
import assert from 'node:assert/strict';
import { auditEvidence, buildEvidenceReport } from '../scripts/audit-subkultur-evidence-v1.mjs';

test('alle 80 teoriobjekter er claim- og evidensklare', () => {
  const report = auditEvidence();
  assert.equal(report.counts.theories, 80);
  assert.equal(report.counts.evidence_ready_theories, 80);
  assert.equal(report.counts.claims, 160);
  assert.equal(report.counts.evidence_links, 320);
  assert.ok(report.per_domain.every((domain) => domain.theories === 10 && domain.claims === 20));
});

test('teori, emner, metoder, claims, kilder og lenker er referanseintegrerte', () => {
  const report = buildEvidenceReport();
  for (const [name, values] of Object.entries(report.integrity)) {
    assert.deepEqual(values, [], `${name} har avvik`);
  }
});

test('kilderegisteret er kuratert uten duplikatpadding', () => {
  const report = buildEvidenceReport();
  assert.ok(report.counts.sources >= 20);
  assert.deepEqual(report.integrity.duplicate_source_ids, []);
  assert.deepEqual(report.integrity.duplicate_source_urls, []);
  assert.deepEqual(report.integrity.unused_source_ids, []);
  assert.deepEqual(report.integrity.invalid_sources, []);
});

test('alle elleve teoriobjektkrav håndheves', () => {
  const report = buildEvidenceReport();
  assert.equal(report.policy.theory_object_requirement_count, 11);
  assert.deepEqual(report.integrity.invalid_theory_objects, []);
  assert.deepEqual(report.integrity.invalid_claims, []);
  assert.deepEqual(report.integrity.invalid_evidence_entries, []);
});

test('randsonedomenet krever etikk og caseporten krever stemmebalanse', () => {
  const report = buildEvidenceReport();
  const margins = report.per_domain.find((domain) => domain.id === 'sosiale_randsoner_omsorg_skadereduksjon');
  assert.equal(margins.ethics_required, 10);
  assert.equal(report.policy.case_environment_near_source_required, true);
  assert.equal(report.policy.case_independent_control_source_required, true);
  assert.equal(report.policy.vulnerable_people_minimize_identification, true);
});

test('teorievidens forblir gyldig etter ferdig materialisering', () => {
  const report = buildEvidenceReport();
  assert.equal(report.status, 'THEORY_EVIDENCE_READY_CASES_REQUIRED');
  assert.deepEqual(report.status_guard, {
    navigation_status: 'materialized',
    assessment_status: 'audited',
    editorial_status: 'complete',
    runtime_manifest_exists: true,
    registry_subject_exists: true
  });
  assert.equal(report.next_gate, 'chapter_and_case_profiles');
});
