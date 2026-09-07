import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import sharp from "sharp";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const place = read("data/places/by/oslo/places/radhusplassen.json");

test("Rådhusplassen har standardproduksjon og fire stedsspesifikke samlinger", () => {
  assert.equal(place.production_profile, "standard");
  assert.equal(place.profile_status, "confirmed");
  assert.equal(place.production_status, "complete");
  assert.equal(Object.hasOwn(place, "cardImage"), false, "canonical Place skal ikke ha cardImage");
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.deepEqual(place.related_people_ids, ["arnstein_arneberg", "magnus_poulsson"]);
  assert.equal(place.objects.length, 1);
  assert.equal(place.objects[0].id, "radhusplassen_trikkemastene");
  assert.equal(place.objects[0].placeSpecific, true);
  assert.ok(fs.existsSync(place.objects[0].image));
  assert.equal(place.structures.length, 1);
  assert.equal(place.structures[0].id, "radhusplassen_radhusbryggene");
  assert.ok(fs.existsSync(place.structures[0].image));
  const brands = read("data/brands/brands_by_place.json");
  assert.deepEqual(brands.radhusplassen, ["sporveien"]);
});

test("frontImage og QuizCard er separate lokale portrettflater", async () => {
  assert.equal(place.image, "bilder/places/radhusplassen.webp");
  assert.equal(place.frontImage, "bilder/places/radhusplassen_front_portrait.webp");
  assert.notEqual(place.image, place.frontImage);
  assert.ok(fs.existsSync(place.image));
  assert.ok(fs.existsSync(place.frontImage));
  const meta = await sharp(place.frontImage).metadata();
  assert.ok(meta.height > meta.width, `forventet portrett, fikk ${meta.width}x${meta.height}`);
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(place.frontImageMeta.outputDimensions, "900x1200");
  assert.ok(fs.existsSync("bilder/QuizCards/Rådhusplassen.webp"));
  const js = fs.readFileSync("js/ui/place-card.js", "utf8");
  assert.match(js, /radhusplassen:\s*["']bilder\/QuizCards\/Rådhusplassen\.webp["']/);
});

test("Rådhusplassen har canonical rich 5x7 med 21 fact, 7 context og 7 concept", () => {
  const quiz = read("data/quiz/by/radhusplassen_sets.json");
  assert.equal(quiz.targetId, "radhusplassen");
  assert.equal(quiz.categoryId, "by");
  assert.equal(quiz.size_class, "rich");
  assert.equal(quiz.sets.length, 5);
  for (const set of quiz.sets) assert.equal(set.questions.length, 7);
  const qs = quiz.sets.flatMap(set => set.questions);
  assert.equal(qs.length, 35);
  assert.deepEqual(quiz.profile_snapshot, place.quiz_profile);
  assert.equal(qs.filter(q => q.question_type === "fact").length, 21);
  assert.equal(qs.filter(q => q.question_type === "context").length, 7);
  assert.equal(qs.filter(q => q.question_type === "concept").length, 7);
  assert.ok(qs.slice(0, 28).every(q => !q.method_id && !q.thinker_id && !q.theory_ref));
  assert.ok(qs.slice(28).every(q => q.method_id && q.thinker_id && q.theory_ref));
  assert.ok(qs.every(q => q.knowledge_contract_version === 1 && q.knowledge_link_status === "linked"));
  assert.ok(qs.every(q => Array.isArray(q.source) && q.source.length >= 1 && q.source_origin === "external"));
  assert.equal(quiz.production_context.normal_opening_questions, 21);
  assert.equal(quiz.production_context.theory_start_phase, "final");
  assert.equal(quiz.production_context.method_start_phase, "final");
});

test("Stories, Leksikon, språk og Lesespor er komplette", () => {
  const stories = read("data/stories/stories_radhusplassen.json");
  assert.equal(stories.length, 2);
  assert.ok(stories.every(story => story.quality_profile === "episode_v1" && story.place_id === "radhusplassen"));
  assert.ok(stories.every(story => story.score.total >= 15));
  const leksikon = read("data/leksikon/places/oslo/by/leksikon_radhusplassen.json");
  assert.equal(leksikon.length, 1);
  assert.equal(leksikon[0].place_id, "radhusplassen");
  assert.equal(leksikon[0].chronology.length, 10);
  const language = read("data/leksikon/sprak/places/europe/norway/oslo/radhusplassen.json");
  assert.equal(language.place_id, "radhusplassen");
  assert.equal(language.entries.length, 6);
  const lesespor = read("data/lesespor/oslo/lesespor_oslo_by.json");
  const items = lesespor.items.filter(item => (item.place_ids || []).includes("radhusplassen"));
  assert.equal(items.length, 4);
  assert.ok(items.every(item => item.access === "open" && item.rights === "link_only" && item.curation_status === "approved"));
});

test("Fagverk v2 er bevart som full og kuratert", () => {
  const fagverk = place.fagverk;
  assert.equal(fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(fagverk.level, "full");
  assert.equal(fagverk.status, "curated");
  assert.ok(fagverk.article.length >= 5);
  assert.ok(fagverk.lenses.length >= 3);
  assert.ok(fagverk.guiding_questions.length >= 4);
  assert.ok(fagverk.concepts.length >= 6);
  assert.ok(fagverk.observable_traces.length >= 2);
  assert.ok(fagverk.source_urls.length >= 4);
});

test("produksjonsartefakt og 30 av 30-gate er fail-closed dokumentert", () => {
  const production = read("reports/place-production/radhusplassen-production-v1.json");
  assert.equal(production.status, "complete");
  assert.match(production.identity_boundary, /Oslo rådhus/);
  assert.deepEqual(production.collections.objects, ["radhusplassen_trikkemastene"]);
  assert.deepEqual(production.collections.brands, ["sporveien"]);
  assert.deepEqual(production.collections.structures, ["radhusplassen_radhusbryggene"]);
  assert.equal(production.quiz.questions, 35);
  const workcard = read("reports/place-production/radhusplassen-workcard-current.json");
  assert.equal(workcard.status, "complete");
  assert.equal(workcard.quality_gate, "30/30");
  assert.equal(workcard.identity_boundary_status, "PASS");
  assert.equal(workcard.quiz_profile.set_count, 5);
  assert.equal(workcard.quiz_profile.fact, 21);
  assert.equal(workcard.quiz_profile.context, 7);
  assert.equal(workcard.quiz_profile.concept, 7);
  assert.equal(workcard.quizcard_status.status, "PASS_CREATED");
  const audit = read("reports/place-production/radhusplassen-phase1-24-gate-audit-v1.json");
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
