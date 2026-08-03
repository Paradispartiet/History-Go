import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFoundation, buildFoundationReport } from '../scripts/audit-subkultur-foundation-v1.mjs';

test('grunnlaget består av åtte kontraktsdomener med ti emner og hooks hver', () => {
  const report = auditFoundation();
  assert.equal(report.counts.domains, 8);
  assert.equal(report.counts.hooks, 80);
  assert.equal(report.counts.emner, 80);
  assert.equal(report.counts.mappings, 80);
  assert.ok(report.per_domain.every((domain) => domain.hooks === 10 && domain.emner === 10 && domain.mappings === 10));
});

test('35–50 operative metoder er unike og faktisk brukt', () => {
  const report = buildFoundationReport();
  assert.ok(report.counts.methods >= 35 && report.counts.methods <= 50);
  assert.ok(report.per_domain.every((domain) => domain.methods >= 5));
  assert.deepEqual(report.integrity.duplicate_method_ids, []);
  assert.deepEqual(report.integrity.non_unique_method_operations, []);
  assert.deepEqual(report.integrity.missing_method_ids, []);
  assert.deepEqual(report.integrity.unused_method_ids, []);
});

test('alle emner har individuelt faginnhold, mekanisme og begrensning', () => {
  const report = buildFoundationReport();
  assert.deepEqual(report.integrity.generic_definitions, []);
  assert.deepEqual(report.integrity.missing_definitions, []);
  assert.deepEqual(report.integrity.missing_mechanisms, []);
  assert.deepEqual(report.integrity.missing_limitations, []);
});

test('ID-migrasjonen bevarer 72 betydninger og legger bare til åtte godkjente ID-er', () => {
  const report = buildFoundationReport();
  assert.equal(report.counts.preserved_legacy_ids, 72);
  assert.equal(report.counts.retired_legacy_ids, 0);
  assert.equal(report.counts.new_emne_ids.length, 8);
  assert.ok(report.counts.active_external_emne_references > 0);
  assert.deepEqual(report.integrity.missing_legacy_emne_ids, []);
  assert.deepEqual(report.integrity.preserved_legacy_id_mismatch, []);
  assert.deepEqual(report.integrity.legacy_semantic_title_drift, []);
  assert.deepEqual(report.integrity.unexpected_new_emne_ids, []);
  assert.deepEqual(report.integrity.dangling_external_emne_ids, []);
  assert.deepEqual(report.integrity.referenced_retired_emne_ids, []);
});

test('grunnfilene kan ikke forskuttere runtime eller redaksjonell ferdigstatus', () => {
  const report = buildFoundationReport();
  assert.deepEqual(report.status_guard, {
    navigation_status: 'planned',
    assessment_status: 'pending',
    editorial_status: 'not_started',
    portal_subject_status: 'planned',
    registry_subject_exists: false
  });
  assert.equal(report.next_gate, 'theory_claim_source_evidence');
});
