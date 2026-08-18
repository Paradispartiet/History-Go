import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFagverkTheoryQuality } from '../scripts/audit-fagverk-theory-quality.mjs';

const STRONG_FLOOR = new Set([
  'by','historie','kunst','litteratur','media','musikk','naeringsliv','natur',
  'politikk','psykologi','sport','vitenskap','filosofi','teknologi'
]);
const INITIAL_REPAIR_QUEUE = new Set(['religion','scenekunst','subkultur','film_tv']);

test('Fagverk theory baseline dekker 17 toppfag og Teknologi nested', () => {
  const r = auditFagverkTheoryQuality();
  assert.equal(r.scope.topLevelSubjects, 17);
  assert.equal(r.scope.nestedSpecializations, 1);
  assert.equal(r.scope.totalAudited, 18);
  assert.equal(r.subjects.length, 18);
});

test('14 sterke theory/model-fag kan ikke regressere', () => {
  const r = auditFagverkTheoryQuality();
  const byId = new Map(r.subjects.map(s => [s.id, s]));
  for (const id of STRONG_FLOOR) assert.equal(byId.get(id)?.baseline, 'strong_structured_evidence', `${id} har theory-quality-regresjon`);
  assert.ok(r.summary.strong_structured_evidence >= STRONG_FLOOR.size);
  assert.equal(r.summary.theory_quality_gap, 0);
});

test('reparasjonskø kan bare krympe til alle fag er sterke', () => {
  const r = auditFagverkTheoryQuality();
  for (const id of r.repairQueue) assert.ok(INITIAL_REPAIR_QUEUE.has(id), `Nytt theory-quality-gap utenfor låst kø: ${id}`);
  assert.ok(r.subjects.every(s => s.parseFailureCount === 0));
  assert.equal(r.rules.noCompletionStatusChanges, true);
});
