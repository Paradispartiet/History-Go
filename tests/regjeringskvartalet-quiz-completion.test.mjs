import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const readJson = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const quiz = readJson('data/quiz/politikk/regjeringskvartalet_sets.json');
const brief = readJson('data/quiz/production_briefs/politikk/regjeringskvartalet.json');
const context = readJson('data/quiz/production_context/politikk/regjeringskvartalet.json');
const schema = readJson('data/quiz/regler/QUIZ_PACKAGE_SCHEMA_V1.json');
const questions = quiz.sets.flatMap(set => set.questions);

test('Regjeringskvartalet er major 10×7 med ti selvstendige sett', () => {
  assert.equal(quiz.production_context.profile, 'major_10x7');
  assert.equal(quiz.production_context.standard_version, '3.3');
  assert.equal(quiz.sets.length, 10);
  assert.ok(quiz.sets.every((set, index) => set.order === index + 1 && set.questions.length === 7));
  assert.equal(questions.length, 70);
  assert.equal(new Set(questions.map(question => question.id)).size, 70);
  assert.equal(new Set(questions.map(question => question.quiz_id)).size, 70);
  assert.equal(new Set(quiz.sets.map(set => set.title)).size, 10);
});

test('De 21 tidligere spørsmålene og primære Knowledge-ID-ene er bevart', () => {
  for (let index = 1; index <= 21; index += 1) {
    const question = questions.find(item => item.id === `regjeringskvartalet_quiz_${index}`);
    assert.ok(question, index);
    assert.match(question.primary_knowledge_unit_id, /^ku_/);
    assert.equal(question.knowledge_link_status, 'linked');
  }
  assert.deepEqual(
    quiz.sets[9].questions.map(question => question.id),
    Array.from({ length: 7 }, (_, index) => `regjeringskvartalet_quiz_${index + 15}`)
  );
  assert.equal(new Set(questions.map(question => question.primary_knowledge_unit_id)).size, 70);
});

test('Eksisterende-quiz-audit, profilbeslutning og holdback er maskinelt lagret', () => {
  for (const field of ['existing_quiz_audit', 'profile_decision', 'held_back_candidates']) {
    assert.ok(schema.production_context.required_fields.includes(field));
    assert.deepEqual(quiz.production_context[field], brief[field]);
    assert.deepEqual(context[field], brief[field]);
  }
  assert.deepEqual(brief.profile_decision, {
    profile: 'major',
    set_count: 10,
    questions_per_set: 7,
    justification: brief.profile_decision.justification
  });
  assert.match(brief.profile_decision.justification, /ti selvstendige kildebårne læringsjobber/);
  assert.equal(brief.existing_quiz_audit.active_before.historical_question_count, 5);
  assert.equal(brief.existing_quiz_audit.active_before.question_count, 21);
  assert.equal(brief.existing_quiz_audit.decisions.keep.length, 21);
  assert.equal(brief.held_back_candidates.length, 0);
});

test('Innholdsbalansen og den normale 2×7-åpningen er bevart', () => {
  const counts = questions.reduce((result, question) => {
    const family = question.question_type === 'concept'
      ? 'concept_theory'
      : ['analysis', 'context', 'comparison'].includes(question.question_type) ? 'context' : 'fact';
    result[family] += 1;
    return result;
  }, { fact: 0, context: 0, concept_theory: 0 });
  assert.deepEqual(counts, { fact: 39, context: 19, concept_theory: 12 });
  const opening = quiz.sets.slice(0, 2).flatMap(set => set.questions);
  assert.equal(opening.length, 14);
  assert.ok(opening.every(question => !question.method_id && !question.topic_hook_id && !question.theory_ref));
  assert.ok(quiz.sets.at(-1).questions.some(question => question.method_id));
  assert.ok(quiz.sets.at(-1).questions.some(question => question.theory_ref));
});

test('Kildegrunnlag, claimbank og deterministisk kontekst dekker alle 70 spørsmål én gang', () => {
  assert.equal(brief.claims.length, 70);
  assert.equal(context.claim_bank.length, 70);
  assert.equal(context.set_plan.length, 10);
  assert.ok(context.set_plan.every(set => set.claim_ids.length === 7));
  assert.deepEqual(
    context.set_plan.flatMap(set => set.claim_ids),
    questions.map(question => question.claim_id)
  );
  assert.ok(questions.every(question => question.source.every(sourceId => brief.sources[sourceId]?.review_status === 'reviewed')));
});
