#!/usr/bin/env node
// Source-bound candidate contracts. Passing here does NOT certify QuizCard runtime,
// canonical Knowledge sync, Historie gate F or publication readiness.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = process.cwd();
const ID = 'minneparken_gamlebyen';
const load = (file) => JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
const brief = load(`data/quiz/production_briefs/historie/${ID}.json`);
const quiz = load(`data/quiz/historie/${ID}_sets.json`);
const card = load(`data/quizcards/historie/${ID}_quizcard_v1.json`);
const questions = quiz.sets.flatMap((set) => set.questions);
const claimById = new Map(brief.claims.map((claim) => [claim.claim_id, claim]));
const sourceIds = new Set(Object.keys(brief.sources));

test('Minneparken source brief defines 21 unique reviewed claims in 3x7 sequence', () => {
  assert.equal(brief.targetId, ID);
  assert.equal(brief.categoryId, 'historie');
  assert.equal(brief.claims.length, 21);
  assert.equal(new Set(brief.claims.map((claim) => claim.claim_id)).size, 21);
  assert.deepEqual(brief.claims.map((claim) => claim.order), Array.from({ length: 21 }, (_, i) => i + 1));
  assert.deepEqual(
    brief.claims.map((claim) => claim.planned_phase),
    [...Array(7).fill('opening'), ...Array(7).fill('bridge'), ...Array(7).fill('final')],
  );
  assert.ok(sourceIds.size >= 3);
  for (const claim of brief.claims) {
    assert.ok(claim.statement?.trim(), claim.claim_id);
    assert.ok(claim.source_ids.length > 0, claim.claim_id);
    assert.ok(claim.source_ids.every((id) => sourceIds.has(id)), claim.claim_id);
    assert.ok(claim.source_ids.every((id) => brief.sources[id].review_status === 'reviewed'), claim.claim_id);
  }
});

test('Minneparken quiz has 3x7 questions, source parity and balanced canonical answer slots', () => {
  assert.equal(quiz.targetId, ID);
  assert.equal(quiz.categoryId, 'historie');
  assert.deepEqual(quiz.sets.map((set) => set.phase), ['opening', 'bridge', 'final']);
  assert.deepEqual(quiz.sets.map((set) => set.questions.length), [7, 7, 7]);
  assert.equal(new Set(questions.map((q) => q.id)).size, 21);
  assert.equal(new Set(questions.map((q) => q.quiz_id)).size, 21);
  const correctSlots = [0, 0, 0, 0];
  for (const [i, q] of questions.entries()) {
    assert.equal(q.targetId, ID);
    assert.equal(q.placeId, ID);
    assert.equal(q.question_scope, 'place');
    assert.ok(q.question?.trim(), q.id);
    assert.ok(q.knowledge?.trim(), q.id);
    assert.equal(q.options.length, 4, q.id);
    assert.equal(new Set(q.options).size, 4, q.id);
    assert.equal(q.options[q.answerIndex], q.answer, q.id);
    correctSlots[q.answerIndex]++;
    assert.equal(q.claim_id, brief.claims[i].claim_id, q.id);
    assert.ok(claimById.has(q.claim_id), q.id);
    assert.ok(q.source.length > 0 && q.source.every((s) => sourceIds.has(s)), q.id);
    assert.deepEqual(q.source_urls, q.source.map((s) => brief.sources[s].url), q.id);
    if (i < 14) {
      assert.ok(!['concept', 'theory', 'definition', 'begrep'].includes(q.question_type), q.id);
      for (const field of ['method_id', 'topic_hook_id', 'thinker_id', 'theory_ref']) {
        assert.equal(q[field], undefined, `${q.id} must be a normal opening question`);
      }
    }
    if (q.knowledge_link_status === 'linked') {
      assert.ok(q.primary_knowledge_unit_id, `${q.id} linked without canonical Knowledge ID`);
      assert.ok(q.knowledge_unit_ids?.length > 0, `${q.id} linked without unit list`);
    }
  }
  assert.ok(correctSlots.every((n) => n >= 3), 'Canonical answer positions are overly concentrated');
  assert.ok(Math.max(...correctSlots) - Math.min(...correctSlots) <= 3);
});

test('Each Minneparken Knowledge source resolves to its reviewed external URL', () => {
  const reviewed = new Map(Object.entries(brief.sources));
  assert.equal(questions.length, 21);
  for (const q of questions) {
    assert.equal(q.sources?.length, q.source.length, `${q.id}: Knowledge source cardinality`);
    for (const [index, id] of q.source.entries()) {
      const canonical = reviewed.get(id);
      const source = q.sources[index];
      assert.equal(canonical?.review_status, 'reviewed', `${q.id}: source review`);
      assert.equal(source?.url, canonical?.url, `${q.id}: Knowledge source URL`);
      assert.equal(source?.url, q.source_urls[index], `${q.id}: quiz source URL`);
      assert.equal(source?.claim_basis, q.claim_basis, `${q.id}: source claim basis`);
      assert.equal(source?.source_id, `src_minneparken_${id}`);
      assert.ok(source?.title?.trim(), `${q.id}: source title missing`);
      assert.ok(source?.url?.startsWith('https://'), `${q.id}: source not HTTPS`);
    }
  }
});

// Mirrors the canonical SHA-256 / claim-splitting policy, so stale IDs cannot
// survive an editorial change to a Knowledge explanation.
const cleanKnowledge = (value) => String(value ?? '').trim();
const normalizeKnowledge = (value) => cleanKnowledge(value).toLowerCase().normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
const splitKnowledgeClaims = (value) => {
  const source = cleanKnowledge(value).replace(/\s+/g, ' ');
  if (!source) return [];
  const protectedText = source
    .replace(/\b(bl|ca|dvs|dr|f\.eks|mfl|mr|nr|osv|prof|st)\./gi, (match) => match.replace('.', '∯'))
    .replace(/(\d)\.(\d)/g, '$1∯$2');
  return protectedText.split(/(?<=[.!?])\s+(?=[A-ZÆØÅ0-9])/)
    .map((part) => part.replaceAll('∯', '.').trim())
    .filter((part) => part.length >= 12 && !part.endsWith('?'));
};
const canonicalPreviewId = (claim) => {
  const normalized = normalizeKnowledge(claim);
  const stem = normalized.replace(/\s+/g, '_').replace(/^_+|_+$/g, '').slice(0, 24) || 'item';
  const digest = createHash('sha256').update('historie\0' + normalized, 'utf8').digest('hex').slice(0, 10);
  return 'ku_historie_' + stem + '_' + digest;
};

test('Staged canonical Knowledge IDs remain deterministic and explicitly unactivated', () => {
  const allIds = new Set();
  for (const q of questions) {
    const expectedClaims = splitKnowledgeClaims(q.knowledge);
    const expectedIds = (expectedClaims.length ? expectedClaims : [q.knowledge]).map(canonicalPreviewId);
    assert.deepEqual(q.knowledge_unit_ids, expectedIds, q.id + ' stale canonical ID(s)');
    assert.equal(q.primary_knowledge_unit_id, expectedIds[0], q.id);
    assert.ok(['pending', 'linked'].includes(q.knowledge_link_status), q.id);
    expectedIds.forEach((id) => allIds.add(id));
  }
  assert.equal(allIds.size, 32, 'Source-reviewed candidate has 32 independently identified Knowledge claims');
});

test('Minneparken 10-question QuizCard has exact canonical quiz and answer-key parity', () => {
  assert.equal(card.categoryId, 'historie');
  assert.equal(card.cards.length, 1);
  const collection = card.cards[0];
  assert.equal(collection.targetId, ID);
  assert.equal(collection.questionCount, 10);
  assert.equal(collection.questions.length, 10);
  assert.equal(collection.answerKey.length, 10);
  assert.equal(new Set(collection.questions.map((q) => q.sourceQuestionId)).size, 10);
  for (const [i, q] of collection.questions.entries()) {
    const original = questions.find((candidate) => candidate.id === q.sourceQuestionId);
    assert.ok(original, q.sourceQuestionId);
    assert.equal(q.number, i + 1);
    assert.equal(q.sourceQuizId, original.quiz_id);
    for (const field of ['question', 'options', 'answer', 'answerIndex', 'knowledge', 'claim_id', 'source_urls', 'sources', 'primary_knowledge_unit_id', 'knowledge_unit_ids', 'knowledge_link_status', 'method_id', 'topic_hook_id', 'thinker_id', 'theory_ref', 'guidance_basis']) {
      assert.deepEqual(q[field], original[field], `QuizCard question ${i+1} mismatch in ${field}`);
    }
    assert.equal(collection.answerKey[i].number, i + 1);
    assert.equal(collection.answerKey[i].answer, q.answer);
    assert.equal(collection.answerKey[i].answerIndex, q.answerIndex);
  }
});


test('Minneparken release is fail-closed while canonical Knowledge or Historie gates are incomplete', () => {
  const quizManifest = load('data/quiz/manifest.json');
  const cardManifest = load('data/quizcards/historie/manifest.json');
  const history = load(`data/places/historie-production/${ID}.json`);
  const quizFile = `data/quiz/historie/${ID}_sets.json`;
  const cardFile = `${ID}_quizcard_v1.json`;
  const quizActive = (quizManifest.files || []).includes(quizFile) ||
    (quizManifest.sets || []).some((entry) => entry?.targetId === ID || entry?.file === quizFile);
  const cardActive = (cardManifest.collections || []).includes(cardFile);
  const hasKnowledge = questions.every((q) => q.knowledge_link_status === 'linked' &&
    q.primary_knowledge_unit_id &&
    q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id));
  const hasCardKnowledge = card.cards[0].questions.every((q) =>
    q.knowledge_link_status === 'linked' &&
    q.primary_knowledge_unit_id &&
    q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id));
  if (!hasKnowledge || !hasCardKnowledge) {
    assert.equal(quizActive, false, 'Do not activate fullquiz before all canonical Knowledge links exist');
    assert.equal(cardActive, false, 'Do not activate QuizCard before all canonical Knowledge links exist');
    assert.notEqual(history.gates?.G?.status, 'PASS', 'Gate G cannot pass without canonical Knowledge');
  }
  // Canonical Knowledge can be prepared before editorial approval. Runtime
  // manifest activation still requires explicit Historie gate G PASS.
  if (history.gates?.G?.status !== 'PASS' || history.status !== 'ready') {
    assert.equal(quizActive, false, 'Knowledge links alone do not authorize live Minneparken quiz');
    assert.equal(cardActive, false, 'Knowledge links alone do not authorize live Minneparken QuizCard');
  }
  if (history.status === 'ready') {
    for (const gate of ['F', 'G', 'H']) {
      assert.equal(history.gates?.[gate]?.status, 'PASS', `Historie ready requires gate ${gate} PASS`);
    }
    assert.equal(quizActive, true);
    assert.equal(cardActive, true);
  }
});
