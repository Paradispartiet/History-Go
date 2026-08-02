import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const quizPath = 'data/quiz/politikk/tinghuset_sets.json';
const manifest = readJson('data/quiz/manifest.json');
const quiz = readJson(quizPath);
const units = readJson('data/knowledge/knowledge_units.generated.json').units;
const questions = quiz.sets.flatMap(set => set.questions);
const tinghusetUnits = units.filter(unit =>
  (unit.quiz_refs || []).some(ref => ref.startsWith('politikk_tinghuset_'))
);
const report = fs.readFileSync('reports/place-production/tinghuset-politikk-v1.md', 'utf8');

test('Oslo tinghus quiz is loaded by the canonical quiz manifest', () => {
  const entries = manifest.sets.filter(entry => entry.targetId === 'tinghuset');
  assert.deepEqual(entries, [{ targetId: 'tinghuset', file: quizPath }]);
  assert.equal(quiz.targetId, 'tinghuset');
  assert.deepEqual(quiz.sets.map(set => set.questions.length), [7, 7, 7]);
});

test('all 21 questions have explicit canonical Knowledge links', () => {
  assert.equal(questions.length, 21);
  for (const question of questions) {
    assert.equal(question.knowledge_contract_version, 1, question.id);
    assert.equal(question.knowledge_link_status, 'linked', question.id);
    assert.match(question.primary_knowledge_unit_id, /^ku_politikk_/);
    assert.deepEqual(question.knowledge_unit_ids, [question.primary_knowledge_unit_id]);
    assert.match(question.emne_id, /^em_pol_/);
    assert.ok(question.concept_ids.length >= 2, question.id);
    assert.ok(question.concept_ids.every(id => /^co_politikk_/.test(id)), question.id);
    assert.ok(Array.isArray(question.term_ids), question.id);
  }
  assert.equal(new Set(questions.flatMap(question => question.concept_ids)).size, 37);
});

test('Knowledge registry has one reviewed source-backed unit per question', () => {
  const questionUnitIds = new Set(questions.map(question => question.primary_knowledge_unit_id));
  assert.equal(questionUnitIds.size, 21);
  assert.equal(tinghusetUnits.length, 21);
  assert.deepEqual(new Set(tinghusetUnits.map(unit => unit.knowledge_unit_id)), questionUnitIds);

  for (const unit of tinghusetUnits) {
    assert.equal(unit.subject_id, 'politikk', unit.knowledge_unit_id);
    assert.equal(unit.status, 'reviewed', unit.knowledge_unit_id);
    assert.deepEqual(unit.delivery_surfaces, ['quiz', 'knowledge_page']);
    assert.equal(unit.quiz_refs.length, 1, unit.knowledge_unit_id);
    assert.ok(unit.emne_ids.length >= 1, unit.knowledge_unit_id);
    assert.ok(unit.concept_ids.length >= 2, unit.knowledge_unit_id);
    assert.ok(unit.canonical_claim.length >= 30, unit.knowledge_unit_id);
    assert.ok(
      unit.sources.some(source => source.source_type !== 'history_go_quiz_source'),
      unit.knowledge_unit_id
    );
  }
});

test('Knowledge materialization does not alter quiz questions, answers, order or sources', () => {
  const stableQuizCore = quiz.sets.map(set => ({
    set_id: set.set_id,
    questions: set.questions.map(question => ({
      id: question.id,
      quiz_id: question.quiz_id,
      question: question.question,
      options: question.options,
      answer: question.answer,
      answerIndex: question.answerIndex,
      source: question.source,
      source_origin: question.source_origin,
      claim_basis: question.claim_basis,
      claim_id: question.claim_id
    }))
  }));
  const digest = crypto.createHash('sha256').update(JSON.stringify(stableQuizCore)).digest('hex');
  assert.equal(digest, '6d6b159d19099a9e37d1f0847c5a7ea9114deb1159ff22b798272bf8cc1780c2');
});

test('phase report keeps Knowledge complete while Brands remains open', () => {
  assert.match(report, /Status: \*\*PASS – fase 9\*\*/);
  assert.match(report, /nøyaktig 21 tinghus-enheter/);
  assert.match(report, /37 eksplisitte canonicale begreper/);
  assert.match(report, /Brands-rundingen fortsatt er åpen/);
  assert.match(report, /Status for samlet sted: \*\*under sanering – ikke produksjonsklart\*\*/);
});
