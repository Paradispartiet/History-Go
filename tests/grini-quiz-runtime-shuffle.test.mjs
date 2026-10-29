import assert from "node:assert/strict";
import test from "node:test";
import { buildGriniStagingPreview, readStagingInputs } from "../scripts/prepare-grini-quiz-staging.mjs";
import "../js/quiz/answer-shuffle.js";

const { shuffleQuestion } = globalThis.HGQuizAnswerShuffle;
const candidate = buildGriniStagingPreview(await readStagingInputs());
const questions = candidate.sets.flatMap(set => set.questions);

function seededRng(seed) {
  let x = seed >>> 0 || 1;
  return () => {
    x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
    return (x >>> 0) / 2 ** 32;
  };
}

test("all 70 candidate answers remain correct under 32 real runtime permutations", () => {
  assert.equal(questions.length, 70);
  let movedCount = 0;
  for (const [index, q] of questions.entries()) {
    const immutable = JSON.stringify(q);
    const slots = new Set();
    for (let trial = 1; trial <= 32; trial += 1) {
      const displayed = shuffleQuestion(q, seededRng((index + 1) * 137 + trial * 1009));
      assert.deepEqual([...displayed.options].sort(), [...q.options].sort(), q.id);
      assert.equal(displayed.options[displayed.answerIndex], q.answer, q.id);
      assert.equal(displayed.options.length, q.options.length, q.id);
      slots.add(displayed.answerIndex);
      if (displayed.answerIndex !== q.answerIndex) movedCount++;
    }
    assert.deepEqual([...slots].sort(), [0, 1, 2],
      `runtime answer shuffle cannot reach every slot for ${q.id}`);
    assert.equal(JSON.stringify(q), immutable, `runtime shuffle mutated canonical question ${q.id}`);
    assert.equal(new Set(q.options).size, q.options.length,
      `ambiguous duplicate option text in ${q.id}`);
  }
  assert.ok(movedCount > 1000, `runtime unexpectedly leaves most answers in the source slot: ${movedCount}`);
});

test("normal opening and final method/theory bindings survive display shuffling", () => {
  assert.ok(candidate.sets.slice(0, 2).every(set => set.questions.every(q =>
    !q.method_id && !q.topic_hook_id && !q.theory_ref)), "opening theory/method regression");
  assert.ok(candidate.sets.at(-1).questions.some(q => q.topic_hook_id && q.theory_ref));
  assert.ok(candidate.sets.at(-1).questions.some(q => q.method_id));
  for (const set of candidate.sets) {
    const frozen = JSON.stringify(set.questions);
    set.questions.forEach((q, index) => shuffleQuestion(q, seededRng(index + set.order * 19)));
    assert.equal(JSON.stringify(set.questions), frozen);
  }
});
