import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const json = file => JSON.parse(fs.readFileSync(file, "utf8"));
const manifest = json("data/fag/fag_manifest.json");
const quiz = json("data/quiz/by/torggata_sets.json");
const brief = json("data/quiz/production_briefs/by/torggata.json");
const context = json("data/quiz/production_context/by/torggata.json");
const place = json("data/places/by/oslo/places/torggata.json");
const all = quiz.sets.flatMap(set => set.questions);

const isTheory = q => Boolean(q.topic_hook_id || q.thinker_id || q.theory_ref || q.work);
const family = q => q.method_id || isTheory(q) || q.question_type === "concept" ? "concept_theory" : q.question_type === "context" ? "context" : "fact";

test("Torggata fase 10 er manifest-loadet canonical quizProduction", () => {
  assert.deepEqual(manifest.by.quizProduction.targets.torggata, {
    source_brief: "../quiz/production_briefs/by/torggata.json",
    context_artifact: "../quiz/production_context/by/torggata.json",
    quiz_file: "../quiz/by/torggata_sets.json"
  });
  assert.equal(quiz.targetId, "torggata");
  assert.equal(quiz.categoryId, "by");
  assert.equal(quiz.production_context.standard_version, "3.3");
  assert.equal(quiz.production_context.profile, "rich_5x7");
});

test("Torggata har fem kildebårne sett med korrekt relativ progresjon og balanse", () => {
  assert.equal(quiz.sets.length, 5);
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening","middle","middle","bridge","final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(all.length, 35);
  const counts = all.reduce((acc, q) => { acc[family(q)] += 1; return acc; }, { fact:0, context:0, concept_theory:0 });
  assert.deepEqual(counts, { fact:19, context:9, concept_theory:7 });
});

test("de første 14 er normale spørsmål uten teori- eller metodeoverflate", () => {
  const opening = quiz.sets.slice(0, 2).flatMap(set => set.questions);
  assert.equal(opening.length, 14);
  for (const q of opening) {
    assert.ok(["fact","context"].includes(q.question_type), q.quiz_id);
    assert.equal(Boolean(q.method_id), false, q.quiz_id);
    assert.equal(isTheory(q), false, q.quiz_id);
    assert.doesNotMatch(q.question, /faglig lesning|mest presis|hvilken teoretiker|hvilken teori|fagplan|fagkart/i);
  }
});

test("alle spørsmål peker én-til-én til reviewet claim og ekstern source-id", () => {
  const claimById = new Map(brief.claims.map(claim => [claim.claim_id, claim]));
  assert.equal(claimById.size, 35);
  assert.equal(brief.status, "reviewed");
  for (const q of all) {
    const claim = claimById.get(q.claim_id);
    assert.ok(claim, q.quiz_id);
    assert.equal(q.claim_basis, claim.statement, q.quiz_id);
    assert.deepEqual(q.source, claim.source_ids, q.quiz_id);
    assert.ok(q.source.every(id => brief.sources[id]?.review_status === "reviewed"), q.quiz_id);
    assert.ok(q.source.every(id => !/emner_by|fagkart|generator/i.test(id)), q.quiz_id);
  }
});

test("sluttsettet har eksplisitt metode og ekte teoribinding uten forbudt teoriprompt", () => {
  const final = quiz.sets.at(-1).questions;
  assert.ok(final.some(q => q.method_id === "met_for_etter"));
  const theory = final.filter(isTheory);
  assert.equal(theory.length, 2);
  assert.deepEqual(theory.map(q => q.thinker_id), ["michel_de_certeau","gordon_cullen"]);
  for (const q of theory) {
    assert.equal(q.topic_hook_id, "byliv_opphold_vs_gjennomgang");
    assert.ok(q.theory_ref?.why_it_helps);
    assert.doesNotMatch(q.question, /hvilken teoretiker passer best|hvilken teori beskriver.*best|hvordan kan.*leses som|fagkart|topic hook/i);
  }
});

test("legacy-feil er eksplisitt holdt ute og fase 9 består", () => {
  assert.equal(Object.hasOwn(place, "tasks_profile"), false);
  assert.ok(brief.held_back_candidates.some(item => item.includes("fortrengning")));
  assert.ok(brief.held_back_candidates.some(item => item.includes("25-metersbasseng")));
  assert.equal(context.profile, "rich_5x7");
  assert.equal(context.claim_bank.length, 35);
});
