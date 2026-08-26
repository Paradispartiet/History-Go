import test from 'node:test';
import assert from 'node:assert/strict';
import { auditFagverkTheoryQuality } from '../scripts/audit-fagverk-theory-quality.mjs';

const STRONG_FLOOR = new Set([
  'by','historie','kunst','litteratur','media','musikk','naeringsliv','natur',
  'politikk','psykologi','religion','scenekunst','sport','subkultur','vitenskap',
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
  assert.equal(r.summary.strong_structured_evidence, 19);
  assert.equal(r.historicalBaseline.strongStructuredEvidence, 18);
  assert.deepEqual(r.expansionProductionQueue, []);
});

test('bare ufullført Helse står i theory-reparasjonskø og completion-status forblir urørt', () => {
  const r = auditFagverkTheoryQuality();
  assert.deepEqual(r.repairQueue, ['helse']);
  assert.ok(r.subjects.every(s => s.parseFailureCount === 0));
  assert.equal(r.rules.noCompletionStatusChanges, true);
});
