import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFagverkTheoryQuality } from '../scripts/audit-fagverk-theory-quality.mjs';

const STRONG_FLOOR = new Set([
  'by','historie','kunst','litteratur','media','musikk','naeringsliv','natur',
  'politikk','psykologi','helse','religion','scenekunst','sport','subkultur','vitenskap',
  'filosofi','film_tv','teknologi'
]);

test('Fagverk theory baseline dekker 19 toppfag og Teknologi nested', () => {
  const r = auditFagverkTheoryQuality();
  assert.equal(r.scope.topLevelSubjects, 19);
  assert.equal(r.scope.nestedSpecializations, 1);
  assert.equal(r.scope.totalAudited, 20);
  assert.equal(r.subjects.length, 20);
});

test('den historiske 18/18-baselinen forblir sterk under 19+1-utvidelsen', () => {
  const r = auditFagverkTheoryQuality();
  const byId = new Map(r.subjects.map(s => [s.id, s]));
  for (const id of STRONG_FLOOR) assert.equal(byId.get(id)?.baseline, 'strong_structured_evidence', `${id} har theory-quality-regresjon`);
  assert.equal(r.summary.strong_structured_evidence, 20);
  assert.equal(r.summary.unstructured_theory_evidence, 0);
  assert.equal(r.historicalBaseline.strongStructuredEvidence, 18);
  assert.deepEqual(r.expansionProductionQueue, []);
});

test('Helse-bindingene løser theory-reparasjonskøen uten å endre completion-status', () => {
  const r = auditFagverkTheoryQuality();
  assert.deepEqual(r.repairQueue, []);
  assert.ok(r.subjects.every(s => s.parseFailureCount === 0));
  assert.equal(r.rules.noCompletionStatusChanges, true);
});

test('Helse strict-bindingene telles som modeller og inspiserbare verk', () => {
  const r = auditFagverkTheoryQuality({ includeDiagnostics: true });
  const health = r.diagnostics.helse.metrics;
  assert.ok(health.structuredUnits >= 24);
  assert.ok(health.works >= 24);
  assert.ok(health.rivalOrLimitSignals >= 24);
  assert.ok(health.contentBindings >= 72);
});
