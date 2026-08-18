import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFagverkTheoryQuality } from '../scripts/audit-fagverk-theory-quality.mjs';

const STRONG_FLOOR = new Set([
  'by','historie','kunst','litteratur','media','musikk','naeringsliv','natur',
  'politikk','psykologi','religion','scenekunst','sport','subkultur','vitenskap',
  'filosofi','film_tv','teknologi'
]);

test('Fagverk theory baseline dekker 17 toppfag og Teknologi nested', () => {
  const r = auditFagverkTheoryQuality();
  assert.equal(r.scope.topLevelSubjects, 17);
  assert.equal(r.scope.nestedSpecializations, 1);
  assert.equal(r.scope.totalAudited, 18);
  assert.equal(r.subjects.length, 18);
});

test('alle 18 theory/model-profiler er låst sterke', () => {
  const r = auditFagverkTheoryQuality();
  const byId = new Map(r.subjects.map(s => [s.id, s]));
  for (const id of STRONG_FLOOR) assert.equal(byId.get(id)?.baseline, 'strong_structured_evidence', `${id} har theory-quality-regresjon`);
  assert.equal(r.summary.strong_structured_evidence, 18);
  assert.equal(r.summary.partial_structured_evidence, 0);
  assert.equal(r.summary.unstructured_theory_evidence, 0);
  assert.equal(r.summary.theory_quality_gap, 0);
});

test('reparasjonskø er tom og completion-status forblir urørt', () => {
  const r = auditFagverkTheoryQuality();
  assert.deepEqual(r.repairQueue, []);
  assert.ok(r.subjects.every(s => s.parseFailureCount === 0));
  assert.equal(r.rules.noCompletionStatusChanges, true);
});
