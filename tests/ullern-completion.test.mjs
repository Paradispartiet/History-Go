import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import sharp from "sharp";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const place = read("data/places/by/oslo/places/ullern.json");

test("Ullern fullproduksjon har fire canonical By-samlinger", async () => {
  assert.equal(place.production_profile, "standard");
  assert.equal(place.profile_status, "confirmed");
  assert.equal(place.production_status, "complete");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.deepEqual(place.related_people_ids, ["eilif_peterssen"]);
  assert.equal(place.objects[0].id, "ullern_alterbaldakin");
  assert.equal(place.structures[0].id, "ullern_kirke");
  assert.ok(fs.existsSync(place.objects[0].image));
  assert.ok(fs.existsSync(place.structures[0].image));
  assert.equal(place.cardImage, undefined);
  const meta = await sharp(place.frontImage).metadata();
  assert.ok(meta.height > meta.width);
});

test("Ullern quiz er rich 5x7 med 21/7/7", () => {
  const quiz = read("data/quiz/by/ullern_sets.json");
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(quiz.sets.length, 5);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 35);
  assert.equal(questions.filter(q => q.question_type === "fact").length, 21);
  assert.equal(questions.filter(q => q.question_type === "context").length, 7);
  assert.equal(questions.filter(q => q.question_type === "concept").length, 7);
  assert.deepEqual(quiz.profile_snapshot, place.quiz_profile);
  assert.ok(fs.existsSync(place.quizCardImage));
});

test("Ullern har Stories, kronologi, språk og Lesespor", () => {
  const stories = read("data/stories/stories_ullern.json");
  assert.equal(stories.length, 2);
  assert.ok(stories.every(row => row.quality_profile === "episode_v1" && row.score.total >= 15));
  const lex = read("data/leksikon/places/oslo/by/leksikon_ullern.json");
  assert.equal(lex[0].chronology.length, 10);
  const language = read("data/leksikon/sprak/places/europe/norway/oslo/ullern.json");
  assert.equal(language.entries.length, 6);
  const readings = read("data/lesespor/oslo/lesespor_oslo_by.json").items.filter(row => String(row.id).startsWith("lesespor_ullern_"));
  assert.equal(readings.length, 4);
  assert.ok(readings.every(row => row.access === "open" && row.rights === "link_only" && row.curation_status === "approved"));
});

test("Ullern Fagverk v2 er full og kuratert", () => {
  assert.equal(place.fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(place.fagverk.level, "full");
  assert.equal(place.fagverk.status, "curated");
  assert.ok(place.fagverk.lenses.length >= 5);
  assert.ok(place.fagverk.guiding_questions.length >= 6);
  assert.ok(place.fagverk.concepts.length >= 10);
  assert.ok(place.fagverk.observable_traces.length >= 3);
  assert.ok(place.fagverk.source_urls.length >= 5);
});

test("Ullern workcard og production packet lukker 30/30-kontrakten", () => {
  const workcard = read("reports/place-production/ullern-workcard-current.json");
  const production = read("data/places/production/ullern.json");
  assert.equal(workcard.status, "complete");
  assert.equal(workcard.quality_gate, "30/30_pending_ci");
  assert.deepEqual(workcard.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.equal(production.status, "ready_v4_2");
  assert.equal(production.quiz.totalQuestions, 35);
  assert.equal(production.quiz.fact, 21);
  assert.equal(production.quiz.context, 7);
  assert.equal(production.quiz.concept, 7);
});
