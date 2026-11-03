import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import {createHash} from "node:crypto";

const read = async p => fs.readFile(new URL(`../${p}`, import.meta.url), "utf8");
const json = async p => JSON.parse(await read(p));
const hash = v => createHash("sha256").update(v).digest("hex");
const draftPath = "reports/place-production/grini-fangeleir-quiz-full-draft-2026-10-28.json";
const briefPath = "data/quiz/production_briefs/historie/grini_fangeleir.json";
const draft = await json(draftPath);
const brief = await json(briefPath);
const review = await json("reports/place-production/grini-fangeleir-quiz-source-review-2026-10-30.json");
const quiz = await json("data/quiz/historie/grini_fangeleir_sets.json");
const actual = quiz.sets.flatMap(s => s.questions);
const legacy = await json("data/knowledge/preserved_quiz_sources/grini_fangeleir_legacy_1x3.json");
const registry = await json("data/knowledge/knowledge_units.generated.json");
const units = new Map(registry.units.map(u => [u.knowledge_unit_id, u]));

test("every integrated Grini question matches the individually source-reviewed revision", async () => {
  assert.equal(review.draft_sha256, hash(await read(draftPath)), "draft changed after review");
  assert.equal(review.brief_sha256, hash(await read(briefPath)), "claim/source plan changed after review");
  const source = draft.sets.flatMap(s => s.questions);
  assert.equal(actual.length, 70);
  assert.equal(review.questions.length, 70);
  for (const [i, q] of source.entries()) {
    const row = review.questions[i];
    assert.equal(row.question_id, q.id);
    assert.equal(row.question_sha256, hash(JSON.stringify(q)), `stale review: ${q.id}`);
    assert.equal(row.verdict, "PASS_AI_SOURCE_REVIEW");
    assert.ok(row.review_note);
    for (const key of Object.keys(q).filter(k => !["source", "mapped_to_source_brief"].includes(k))) {
      assert.deepEqual(actual[i][key], q[key], `${q.id}: ${key}`);
    }
    assert.deepEqual(actual[i].source.map(id => brief.sources[id].url), q.source);
  }
});

test("Grini retains legacy Knowledge ownership and resolves all 70 new questions", () => {
  const activeIDs = new Set(actual.map(q => q.quiz_id));
  for (const q of legacy.questions) {
    const unit = units.get(q.primary_knowledge_unit_id);
    assert.ok(unit, `lost original unit ${q.primary_knowledge_unit_id}`);
    assert.equal(unit.canonical_claim, q.knowledge);
    assert.deepEqual(unit.concept_ids, q.concept_ids);
    assert.ok(unit.quiz_refs.includes(q.quiz_id));
    assert.ok(!activeIDs.has(q.quiz_id));
  }
  for (const q of actual) {
    assert.equal(q.knowledge_link_status, "linked");
    assert.ok(q.knowledge_unit_ids.includes(q.primary_knowledge_unit_id));
    assert.ok(q.knowledge_unit_ids.every(id => units.get(id)?.quiz_refs.includes(q.quiz_id)));
  }
});

test("the existing Grini QuizCard reuses ten actual fullquiz questions without a duplicate card", async () => {
  const manifest = await json("data/quizcards/historie/manifest.json");
  const files = (await fs.readdir(new URL("../data/quizcards/historie/", import.meta.url)))
    .filter(p => p.endsWith(".json") && p !== "manifest.json");
  const collections = await Promise.all(files.map(async p => ({file: p, data: await json(`data/quizcards/historie/${p}`)})));
  const owners = collections.filter(c => c.data.cards?.some(card => card.targetId === "grini_fangeleir"));
  assert.equal(owners.length, 1);
  assert.ok(manifest.collections.includes(owners[0].file));
  const cards = owners.flatMap(c => c.data.cards || []).filter(c => c.targetId === "grini_fangeleir");
  assert.equal(cards.length, 1);
  const card = cards[0];
  assert.equal(card.questions.length, 10);
  card.questions.forEach((q, i) => {
    assert.equal(q.number, i + 1);
    const original = actual.find(a => a.id === q.sourceQuestionId);
    assert.ok(original);
    for (const key of Object.keys(original)) assert.deepEqual(q[key], original[key]);
    assert.equal(card.answerKey[i].answer, original.answer);
  });
});
