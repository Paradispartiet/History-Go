import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSubkulturQuizKnowledge } from '../scripts/audit-subkultur-quiz-knowledge-v1.mjs';

test('Subkultur har åtte komplette fagområdeforløp', () => {
  const report = auditSubkulturQuizKnowledge();
  assert.equal(report.pathways, 8);
  assert.equal(report.questions, 40);
  assert.equal(report.assessed_emner, 40);
});

test('alle aktive spørsmål er eksplisitt koblet til Knowledge', () => {
  const report = auditSubkulturQuizKnowledge();
  assert.ok(report.knowledge_units >= 40);
  assert.equal(report.subkultur_knowledge_failures, 0);
  assert.equal(report.subkultur_knowledge_warnings, 0);
});

test('legacyquiz har radbeslutning og er koblet ut av runtime', () => {
  const report = auditSubkulturQuizKnowledge();
  assert.equal(report.legacy_reviewed, 83);
  assert.equal(report.active_legacy, 0);
});

test('assessment flytter bare neste port og forskutterer ikke runtime', () => {
  const report = auditSubkulturQuizKnowledge();
  assert.equal(report.next_gate, 'runtime_materialization_and_final_gate');
});
