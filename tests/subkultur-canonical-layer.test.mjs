import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSubkulturCanonicalLayer } from '../scripts/audit-subkultur-canonical-layer.mjs';

test('Subkultur materialiserer åtte domener med ti individuelle emner hver', () => {
  const report = auditSubkulturCanonicalLayer();
  assert.equal(report.status, 'PASSED_CANONICAL_LAYER_THEORY_PENDING');
  assert.equal(report.summary.domain_count, 8);
  assert.deepEqual(report.summary.hooks_per_domain, [10, 10, 10, 10, 10, 10, 10, 10]);
  assert.equal(report.summary.emne_count, 80);
  assert.equal(report.summary.unique_definition_count, 80);
  assert.equal(report.summary.unique_analytical_question_count, 80);
});

test('alle tidligere emne-ID-er er bevart og metode-/mappinglagene er komplette', () => {
  const report = auditSubkulturCanonicalLayer();
  assert.equal(report.summary.preserved_legacy_emne_count, 72);
  assert.equal(report.summary.new_emne_count, 8);
  assert.ok(report.summary.method_count >= 35 && report.summary.method_count <= 50);
  assert.equal(report.summary.mapping_count, 80);
});

test('canonical grunnlag forskutterer verken teori-evidens, kapitler eller ferdigstatus', () => {
  const report = auditSubkulturCanonicalLayer();
  assert.equal(report.summary.theory_objects_evidence_ready, 0);
  assert.equal(report.summary.chapters, 0);
  assert.equal(report.summary.navigation_status, 'planned');
  assert.equal(report.summary.assessment_status, 'pending');
  assert.equal(report.summary.editorial_status, 'not_started');
  assert.equal(report.next_gate, 'theory_claim_source_evidence_production');
});
