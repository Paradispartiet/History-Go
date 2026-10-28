import assert from "node:assert/strict";
import test from "node:test";
import {
  buildGriniStagingPreview,
  readStagingInputs
} from "../scripts/prepare-grini-quiz-staging.mjs";

const inputs = await readStagingInputs();
const source = inputs.draft.sets.flatMap(set => set.questions);
const oldQuestions = inputs.live.sets.flatMap(set => set.questions);

test("Grini 10x7 preview uses canonical phases, claim IDs and balanced answer slots", () => {
  const before = JSON.stringify(inputs);
  const result = buildGriniStagingPreview(inputs);
  const questions = result.sets.flatMap(set => set.questions);
  assert.equal(result.status, "STAGING_ONLY_NOT_ACTIVE");
  assert.equal(result.preflight.activation_allowed, false);
  assert.equal(result.preflight.production_context, "NOT_BUILT");
  assert.equal(result.preflight.knowledge_sync, "NOT_RUN");
  assert.equal(result.sets.length, 10);
  assert.equal(questions.length, 70);
  assert.deepEqual(result.sets.map(s => s.phase),
    ["opening", "middle", "middle", "middle", "middle", "middle", "middle", "bridge", "bridge", "final"]);
  assert.ok(result.sets.every((s, i) => s.order === i + 1 && s.level === i + 1 && s.questions.length === 7));
  assert.deepEqual(result.preflight.answer_slots, {"0": 24, "1": 24, "2": 22});
  assert.deepEqual(result.preflight.families, {fact: 41, context: 17, concept_theory: 12});
  assert.deepEqual(result.sets[0].questions[0].source,
    inputs.brief.claims[0].source_ids);
  assert.ok(result.sets.at(-1).questions.some(q => q.theory_ref));
  assert.ok(result.sets.slice(0, 2).every(s => s.questions.every(q =>
    !q.method_id && !q.topic_hook_id && !q.theory_ref)));
  assert.equal(JSON.stringify(inputs), before, "staging builder must not mutate its inputs");
});

test("the active 1x3 Quiz/Knowledge ownership is not reused or replaced by staging", () => {
  const candidate = buildGriniStagingPreview(inputs);
  const ids = new Set(candidate.sets.flatMap(s => s.questions).flatMap(q => [q.id, q.quiz_id]));
  const oldIds = oldQuestions.flatMap(q => [q.id, q.quiz_id]);
  assert.equal(oldQuestions.length, 3);
  for (const id of oldIds) assert.ok(!ids.has(id), `reused legacy ID: ${id}`);
  assert.deepEqual(candidate.preflight.retained_legacy_knowledge_ids,
    oldQuestions.map(q => q.primary_knowledge_unit_id));
  assert.ok(oldQuestions.every(q => q.knowledge_link_status === "linked"));
});

test("staging fails closed for bad answers, mismatched claims and altered phase plans", () => {
  const badAnswer = structuredClone(inputs);
  badAnswer.draft.sets[0].questions[0].answer = "NOT AN OPTION";
  assert.throws(() => buildGriniStagingPreview(badAnswer), /bad correct answer/);

  const badClaim = structuredClone(inputs);
  badClaim.brief.claims[0].statement = "UNREVIEWED EDIT";
  assert.throws(() => buildGriniStagingPreview(badClaim), /question\/claim mismatch/);

  const badFamily = structuredClone(inputs);
  badFamily.brief.claims[0].family = "analysis";
  assert.throws(() => buildGriniStagingPreview(badFamily), /canonical claim family mismatch/);

  const badBinding = structuredClone(inputs);
  badBinding.brief.claims[66].method_id = "met_nonsense";
  assert.throws(() => buildGriniStagingPreview(badBinding), /claim binding mismatch/);

  const badPhase = structuredClone(inputs);
  badPhase.draft.sets[2].phase = "bridge";
  assert.throws(() => buildGriniStagingPreview(badPhase), /set phase/);

  const badIdentity = structuredClone(inputs);
  badIdentity.draft.sets[0].questions[0].id = oldQuestions[0].id;
  assert.throws(() => buildGriniStagingPreview(badIdentity), /legacy identity collision/);

  const badSource = structuredClone(inputs);
  badSource.brief.sources.snl.review_status = "partial";
  assert.throws(() => buildGriniStagingPreview(badSource), /non-reviewed\/unknown claim source/);
});

test("all 70 draft source URLs are converted to reviewed source IDs without changing their order", () => {
  const preview = buildGriniStagingPreview(inputs);
  const questions = preview.sets.flatMap(s => s.questions);
  assert.equal(questions.length, source.length);
  questions.forEach((q, idx) => {
    const draftQ = source[idx];
    const claim = inputs.brief.claims[idx];
    assert.deepEqual(q.source, claim.source_ids);
    assert.deepEqual(q.source.map(id => preview.sources[id]), draftQ.source);
    assert.equal(q.claim_id, draftQ.claim_id);
    assert.equal(q.question, draftQ.question);
    assert.equal(q.answer, draftQ.answer);
  });
});

test("source answer positions do not expose a mechanical A-B-C key", () => {
  const key = source.map(q => q.answerIndex);
  const moduloThreeMatches = key.filter((index, n) => index === n % 3).length;
  assert.ok(moduloThreeMatches <= 35, `source key still predictable: ${moduloThreeMatches}/70 ABC matches`);
  const slotCounts = [0, 0, 0];
  key.forEach(index => slotCounts[index]++);
  assert.deepEqual(slotCounts, [24, 24, 22]);
  const repeatedABC = Array.from({length: key.length - 2}, (_, n) =>
    key[n] === 0 && key[n + 1] === 1 && key[n + 2] === 2).filter(Boolean).length;
  assert.ok(repeatedABC <= 4, `too many A-B-C three-question sequences: ${repeatedABC}`);
});

test("source-specific historical wording distinguishes the two postwar names and dates", () => {
  const q57 = source[56];
  const c57 = inputs.brief.claims[56];
  assert.match(q57.question, /fengselsvesenet overtok/);
  assert.match(q57.answer, /Ilebu fengsel/);
  assert.match(c57.statement, /Ihlen fangeleir/);
  assert.match(c57.statement, /Ilebu fengsel/);
  const q69 = source[68];
  const c69 = inputs.brief.claims[68];
  assert.match(c69.statement, /12\. juni 1941/);
  assert.match(c69.statement, /14\. juni 1941/);
  assert.match(q69.answer, /oppgi forskjellen/);
});
