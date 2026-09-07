import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import sharp from "sharp";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const place = read("data/places/by/oslo/places/radhusplassen.json");

test("Rådhusplassen har standardproduksjon og fire canonical By-samlinger", async () => {
  assert.equal(place.production_profile, "standard");
  assert.equal(place.profile_status, "confirmed");
  assert.equal(place.production_status, "complete");
  assert.equal(Object.hasOwn(place, "cardImage"), false);
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.deepEqual(place.related_people_ids, ["albert_nordengen"]);
  assert.equal(place.objects.length, 1);
  assert.equal(place.objects[0].id, "radhusplassen_tordenskioldstatuen");
  assert.equal(place.objects[0].placeSpecific, true);
  assert.equal(place.structures.length, 1);
  assert.equal(place.structures[0].id, "radhusplassen_honnorbrygga");
  assert.ok(fs.existsSync(place.image));
  assert.ok(fs.existsSync(place.frontImage));
  assert.ok(fs.existsSync(place.quizCardImage));
  assert.ok(fs.existsSync(place.objects[0].image));
  assert.ok(fs.existsSync(place.structures[0].image));
  const front = await sharp(place.frontImage).metadata();
  assert.ok(front.height > front.width);
  const brands = read("data/brands/brands_by_place.json");
  assert.deepEqual(brands.radhusplassen, ["sporveien"]);
});

test("Rådhusplassen quiz bevarer canonical rich 6x7 med 28/7/7 og sen teori", () => {
  const quiz = read("data/quiz/by/radhusplassen_sets.json");
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(quiz.targetId, "radhusplassen");
  assert.equal(quiz.categoryId, "by");
  assert.equal(quiz.size_class, "rich");
  assert.equal(quiz.sets.length, 6);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  assert.equal(questions.length, 42);
  assert.equal(questions.filter(q => q.question_type === "fact").length, 28);
  assert.equal(questions.filter(q => q.question_type === "context").length, 7);
  assert.equal(questions.filter(q => q.question_type === "concept").length, 7);
  assert.deepEqual(quiz.profile_snapshot, place.quiz_profile);
  assert.ok(questions.slice(0, 35).every(q => !q.method_id && !q.thinker_id && !q.theory_ref));
  assert.ok(questions.slice(35).every(q => q.method_id && q.thinker_id && q.theory_ref));
  assert.ok(questions.every(q => q.knowledge_contract_version === 1 && q.knowledge_link_status === "linked"));
  assert.ok(questions.every(q => Array.isArray(q.source) && q.source.length >= 1 && q.source_origin === "external"));
  assert.equal(quiz.production_context.normal_opening_questions, 28);
  assert.equal(quiz.production_context.theory_start_phase, "final");
  assert.equal(quiz.production_context.method_start_phase, "final");
});

test("Rådhusplassen har to Stories, ti kronologipunkter, språk og fire Lesespor", () => {
  const stories = read("data/stories/stories_radhusplassen.json");
  assert.equal(stories.length, 2);
  assert.ok(stories.every(row => row.quality_profile === "episode_v1" && row.place_id === "radhusplassen" && row.score.total >= 15));
  const lex = read("data/leksikon/places/oslo/by/leksikon_radhusplassen.json");
  assert.equal(lex.length, 1);
  assert.equal(lex[0].place_id, "radhusplassen");
  assert.equal(lex[0].chronology.length, 10);
  const legacy = read("data/leksikon/places/oslo/by/leksikon_oslo_by_batch1.json");
  assert.equal(legacy.some(row => row.place_id === "radhusplassen"), false);
  const language = read("data/leksikon/sprak/places/europe/norway/oslo/radhusplassen.json");
  assert.equal(language.entries.length, 6);
  const readings = read("data/lesespor/oslo/lesespor_oslo_by.json").items.filter(row => String(row.id).startsWith("lesespor_radhusplassen_"));
  assert.equal(readings.length, 4);
  assert.ok(readings.every(row => row.access === "open" && row.rights === "link_only" && row.curation_status === "approved"));
});

test("Rådhusplassen Fagverk v2 er full, kuratert og stedsspesifikt", () => {
  const fagverk = place.fagverk;
  assert.equal(fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(fagverk.level, "full");
  assert.equal(fagverk.status, "curated");
  assert.ok(fagverk.article.length >= 5);
  assert.ok(fagverk.lenses.length >= 5);
  assert.ok(fagverk.guiding_questions.length >= 6);
  assert.ok(fagverk.concepts.length >= 10);
  assert.ok(fagverk.observable_traces.length >= 3);
  assert.ok(fagverk.source_urls.length >= 5);
});

test("Rådhusplassen workcard og production packet lukker 30/30-kontrakten", () => {
  const workcard = read("reports/place-production/radhusplassen-workcard-current.json");
  const production = read("data/places/production/radhusplassen.json");
  const audit = read("reports/place-production/radhusplassen-phase1-24-gate-audit-v1.json");
  assert.equal(workcard.status, "complete");
  assert.equal(workcard.quality_gate, "30/30_pending_ci");
  assert.deepEqual(workcard.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.equal(production.status, "ready_v4_2");
  assert.equal(production.quiz.totalQuestions, 42);
  assert.equal(production.quiz.fact, 28);
  assert.equal(production.quiz.context, 7);
  assert.equal(production.quiz.concept, 7);
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});

test("koordinatkontrakten er bevart", () => {
  assert.equal(place.lat, 59.9109);
  assert.equal(place.lon, 10.7326);
  assert.equal(place.r, 220);
  assert.equal(place.coordStatus, "verified_geometry");
  assert.equal(place.coordSourceId, "oslo-kommune:fjordbyen:radhusplassen");
});
