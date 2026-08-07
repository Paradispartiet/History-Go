import test from 'node:test';
import assert from 'node:assert/strict';
import { auditLitteraturAssessment } from '../scripts/audit-litteratur-assessment-v1.mjs';

test('28 femtrinnsforløp materialiserer 140 spørsmål og dekker alle 168 artikler', () => {
  const report = auditLitteraturAssessment();
  assert.equal(report.pathways, 28);
  assert.equal(report.questions, 140);
  assert.equal(report.assessed_articles, 168);
  assert.equal(report.assessed_claims, 168);
});

test('vurderingslaget har bred og eksplisitt Knowledge-, begreps-, emne-, metode- og kildedekning', () => {
  const report = auditLitteraturAssessment();
  assert.ok(report.knowledge_units >= 168);
  assert.ok(report.concepts >= 450);
  assert.ok(report.emner >= 35);
  assert.ok(report.methods >= 35);
  assert.equal(report.sources, 384);
});

test('421 udokumenterte legacyspørsmål er radvurdert og sluttporten er vedlikehold', () => {
  const report = auditLitteraturAssessment();
  assert.equal(report.legacy_reviewed, 421);
  assert.equal(report.next_gate, 'maintenance_and_source_refresh');
});
