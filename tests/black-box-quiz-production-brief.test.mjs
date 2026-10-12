import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const json = rel => JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));

test("Black Box has reviewed source claims and a distinct registered 4×7 quiz", () => {
  const brief = json("data/quiz/production_briefs/scenekunst/black_box_teater.json");
  const production = json("data/places/production/black_box_teater.json");
  const quiz = json("data/quiz/scenekunst/black_box_teater_sets.json");
  const manifest = json("data/quiz/manifest.json");
  const fag = json("data/fag/fag_manifest.json");
  assert.equal(brief.categoryId, "scenekunst");
  assert.equal(brief.targetId, "black_box_teater");
  assert.equal(brief.status, "reviewed");
  assert.equal(brief.profile_decision.set_count, 4);
  assert.equal(brief.profile_decision.questions_per_set, 7);
  assert.equal(brief.claims.length, 28);
  assert.equal(new Set(brief.claims.map(c => c.claim_id)).size, 28);
  assert.deepEqual(brief.claims.map(c => c.order), Array.from({length:28},(_,i)=>i+1));
  assert.ok(brief.scope.site_boundary.includes("Aker Brygge"));
  assert.ok(brief.scope.site_boundary.includes("2004"));
  const canonical = new Map(production.claims.map(c => [c.id, c]));
  for (const c of brief.claims.filter(c => c.origin_place_claim_id)) {
    const original = canonical.get(c.origin_place_claim_id);
    assert.ok(original, c.origin_place_claim_id);
    assert.equal(c.statement, original.claim, c.claim_id);
    assert.ok(c.source_ids.some(id => brief.sources[id]?.url === original.sourceUrl), c.claim_id);
  }
  assert.ok(!brief.claims.some(c => c.origin_place_claim_id === "claim_blackbox_network_1991"));
  assert.ok(brief.held_back_candidates.some(note => note.includes("Nettverk for Scenekunst")));
  assert.deepEqual(quiz.sets.map(s => s.questions.length), [7, 7, 7, 7]);
  assert.deepEqual(quiz.sets.map(s => s.phase), ["opening", "middle", "bridge", "final"]);
  assert.ok(manifest.sets.some(s => s.targetId === "black_box_teater" && s.file === "data/quiz/scenekunst/black_box_teater_sets.json"));
  assert.ok(fag.scenekunst.quizProduction.targets.black_box_teater);
  const claims = new Map(brief.claims.map(c => [c.claim_id, c]));
  const questions = quiz.sets.flatMap(s => s.questions);
  assert.equal(questions.length, 28);
  assert.equal(new Set(questions.map(q => q.id)).size, 28);
  assert.equal(new Set(questions.map(q => q.quiz_id)).size, 28);
  const positions = [0, 0, 0];
  questions.forEach((q, i) => {
    assert.equal(q.answer, q.options[q.answerIndex], q.id);
    positions[q.answerIndex]++;
    assert.equal(q.targetId, "black_box_teater", q.id);
    assert.equal(q.categoryId, "scenekunst", q.id);
    assert.equal(q.claim_basis, claims.get(q.claim_id)?.statement, q.id);
    assert.deepEqual([...q.source].sort(), [...claims.get(q.claim_id).source_ids].sort(), q.id);
    assert.ok(q.question !== q.knowledge, q.id);
    if (i < 14) {
      assert.equal(q.question_layer, "normal_opening", q.id);
      assert.ok(["fact", "context"].includes(q.question_type), q.id);
      assert.ok(!q.topic_hook_id && !q.method_id, q.id);
    }
  });
  assert.deepEqual(positions, [10, 9, 9]);
  assert.ok(!questions.some(q => /hvilket år.*Nettverk for Scenekunst/iu.test(q.question)));
  assert.ok(quiz.sets[3].questions.some(q => q.topic_hook_id === "theory_scenekunst_historiografi_flyktig_hendelse"));
});

test("Black Box QuizCard references exactly ten live quiz questions", () => {
  const quiz = json("data/quiz/scenekunst/black_box_teater_sets.json");
  const card = json("data/quizcards/scenekunst/black_box_teater_quizkort_v1.json");
  const registry = json("data/quizcards/scenekunst/manifest.json");
  assert.ok(registry.collections.includes("black_box_teater_quizkort_v1.json"));
  const indexed = new Map(quiz.sets.flatMap(s => s.questions).map(q => [q.quiz_id, q]));
  assert.equal(card.cards.length, 1);
  const selected = card.cards[0];
  assert.equal(selected.targetId, "black_box_teater");
  assert.equal(selected.questionCount, 10);
  assert.equal(selected.questions.length, 10);
  assert.equal(selected.answerKey.length, 10);
  for (const q of selected.questions) {
    const source = indexed.get(q.sourceQuizId);
    assert.ok(source, q.sourceQuizId);
    assert.equal(q.question, source.question);
    assert.equal(q.answer, source.answer);
    assert.equal(q.answerIndex, source.answerIndex);
  }
});
