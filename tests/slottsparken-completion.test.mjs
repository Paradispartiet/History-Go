import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import sharp from "sharp";

const read = file => JSON.parse(fs.readFileSync(file, "utf8"));
const place = read("data/places/by/oslo/places/slottsparken.json");

test("Slottsparken har avgrenset standardproduksjon og fire dokumenterte samlinger", () => {
  assert.equal(place.production_profile, "standard");
  assert.equal(place.profile_status, "confirmed");
  assert.equal(place.production_status, "complete");
  assert.equal(Object.hasOwn(place, "cardImage"), false, "canonical Place skal ikke ha cardImage");
  assert.equal(place.lat, 59.9166);
  assert.equal(place.lon, 10.7278);
  assert.deepEqual(place.place_card_profile.collection_ids, ["people", "objects", "brands", "structures"]);
  assert.deepEqual(place.related_people_ids, ["hans_ditlev_franciscus_linstow"]);
  assert.deepEqual(place.objects.map(item => item.id), ["slottsparken_turdronningen", "slottsparken_kongespeilet"]);
  assert.ok(place.objects.every(item => item.placeSpecific && fs.existsSync(item.image)));
  assert.deepEqual(place.structures.map(item => item.id), ["slottsparken_vaktbygningen", "slottsparken_dronningparken_lysthus"]);
  assert.ok(place.structures.every(item => fs.existsSync(item.image)));
  const brands = read("data/brands/brands_by_place.json");
  assert.deepEqual(brands.slottsparken, ["sparebankstiftelsen_dnb"]);
  assert.ok(!brands.slottsparken.includes("lorry"));
});

test("frontImage er et separat fysisk portrettasset og QuizCard er dedikert", async () => {
  assert.equal(place.image, "bilder/places/slottsparken.webp");
  assert.equal(place.frontImage, "bilder/places/slottsparken_front_portrait.webp");
  assert.notEqual(place.image, place.frontImage);
  assert.ok(fs.existsSync(place.image));
  assert.ok(fs.existsSync(place.frontImage));
  const meta = await sharp(place.frontImage).metadata();
  assert.deepEqual([meta.width, meta.height], [900, 1200]);
  assert.equal(place.frontImageMeta.orientation, "portrait");
  assert.equal(place.frontImageMeta.outputDimensions, "900x1200");
  assert.ok(fs.existsSync("bilder/QuizCards/Slottsparken.webp"));
  const js = fs.readFileSync("js/ui/place-card.js", "utf8");
  assert.match(js, /slottsparken:\s*["']bilder\/QuizCards\/Slottsparken\.webp["']/);
});

test("Slottsparken har canonical rich 5x7 med 21 fact, 7 context og 7 concept", () => {
  const quiz = read("data/quiz/by/slottsparken_sets.json");
  assert.equal(quiz.targetId, "slottsparken");
  assert.equal(quiz.categoryId, "by");
  assert.equal(quiz.size_class, "rich");
  assert.deepEqual(quiz.sets.map(set => set.phase), ["opening", "middle", "middle", "bridge", "final"]);
  assert.ok(quiz.sets.every(set => set.questions.length === 7));
  const questions = quiz.sets.flatMap(set => set.questions);
  assert.equal(questions.length, 35);
  assert.equal(questions.filter(q => q.question_type === "fact").length, 21);
  assert.equal(questions.filter(q => q.question_type === "context").length, 7);
  assert.equal(questions.filter(q => q.question_type === "concept").length, 7);
  assert.ok(questions.slice(0, 28).every(q => !q.method_id && !q.thinker_id && !q.theory_ref));
  assert.ok(questions.slice(28).every(q => q.method_id && q.thinker_id && q.theory_ref));
  assert.ok(questions.every(q => q.knowledge_contract_version === 1 && q.knowledge_link_status === "linked"));
  assert.ok(questions.every(q => q.source.length > 0 && q.source.every(sourceId => quiz.sources[sourceId])));
  const expectedSources = [
    ["park", "bylex"], ["bylex", "history"], ["history", "bylex"], ["queen", "queen_visit"], ["queen"], ["bylex"], ["queen_visit", "queen"],
    ["bylex", "history"], ["history", "bylex"], ["history", "bylex"], ["bylex"], ["bylex", "history"], ["history"], ["queen", "park"],
    ["bylex"], ["park", "bylex", "whyte"], ["park", "history"], ["park", "bylex"], ["bylex", "history"], ["bylex"], ["queen", "queen_visit"],
    ["park", "bylex"], ["park"], ["park", "bylex"], ["park", "bylex"], ["queen", "queen_visit"], ["bylex", "history"], ["park", "st_hanshaugen"],
    ["park", "queen"], ["park", "history"], ["history", "bylex"], ["bylex", "history"], ["queen", "queen_visit"], ["bylex"], ["park", "st_hanshaugen", "vigelandsparken"]
  ];
  assert.deepEqual(questions.map(q => q.source), expectedSources);
  const brief = read("data/quiz/production_briefs/by/slottsparken.json");
  assert.deepEqual(brief.claims.map(claim => claim.source_ids), expectedSources);
  assert.equal(quiz.production_context.normal_opening_questions, 21);
  assert.equal(quiz.production_context.theory_start_phase, "final");
  assert.equal(quiz.existing_quiz_audit.active_before.set_count, 6);
  assert.equal(quiz.existing_quiz_audit.active_before.question_count, 42);
});

test("Stories, Leksikon, språk og Lesespor er komplette", () => {
  const stories = read("data/stories/stories_slottsparken.json");
  assert.equal(stories.length, 2);
  assert.ok(stories.every(story => story.quality_profile === "episode_v1" && story.place_id === "slottsparken"));
  assert.ok(stories.every(story => story.score.total >= 15));
  const leksikon = read("data/leksikon/places/oslo/by/leksikon_slottsparken.json");
  assert.equal(leksikon.length, 1);
  assert.equal(leksikon[0].chronology.length, 14);
  const language = read("data/leksikon/sprak/places/europe/norway/oslo/slottsparken.json");
  assert.equal(language.entries.length, 6);
  const languageManifest = read("data/leksikon/sprak/manifest.json");
  assert.equal(languageManifest.place_files.slottsparken, "data/leksikon/sprak/places/europe/norway/oslo/slottsparken.json");
  const placeOpen = read("data/runtime/place-open/slottsparken.json");
  assert.equal(placeOpen.language.place_id, "slottsparken");
  const lesespor = read("data/lesespor/oslo/lesespor_oslo_by.json");
  const items = lesespor.items.filter(item => (item.place_ids || []).includes("slottsparken"));
  assert.equal(items.length, 4);
  assert.ok(items.every(item => item.access === "open" && item.rights === "link_only" && item.curation_status === "approved"));
});

test("Fagverk v2 er full, stedsspesifikt og kildebåret", () => {
  const fagverk = place.fagverk;
  assert.equal(fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(fagverk.level, "full");
  assert.equal(fagverk.status, "curated");
  assert.ok(fagverk.article.length >= 5);
  assert.ok(fagverk.emne_ids.length >= 3);
  assert.ok(fagverk.chapter_ids.length >= 1);
  assert.ok(fagverk.lenses.length >= 3 && fagverk.lenses.length <= 5);
  assert.ok(fagverk.guiding_questions.length >= 4 && fagverk.guiding_questions.length <= 6);
  assert.ok(fagverk.concepts.length >= 6);
  assert.ok(fagverk.observable_traces.length >= 2);
  assert.ok(fagverk.source_urls.length >= 4);
});

test("production artifact og 30 av 30-gate er fail-closed dokumentert", () => {
  const production = read("reports/place-production/slottsparken-production-v1.json");
  assert.equal(production.status, "complete");
  assert.deepEqual(production.collections.objects, ["slottsparken_turdronningen", "slottsparken_kongespeilet"]);
  assert.deepEqual(production.collections.brands, ["sparebankstiftelsen_dnb"]);
  assert.equal(production.quiz.questions, 35);
  const workcard = read("reports/place-production/slottsparken-workcard-current.json");
  assert.equal(workcard.status, "complete");
  assert.equal(workcard.quality_gate, "30/30");
  assert.equal(workcard.identity_boundary_status, "PASS");
  assert.equal(workcard.quiz_profile.set_count, 5);
  assert.deepEqual([workcard.quiz_profile.fact, workcard.quiz_profile.context, workcard.quiz_profile.concept], [21, 7, 7]);
  assert.equal(workcard.quizcard_status.status, "PASS_CREATED");
  assert.equal(workcard.rule_preflight.status, "PASS");
  const audit = read("reports/place-production/slottsparken-phase1-24-gate-audit-v1.json");
  assert.equal(audit.quality_score.total, 30);
  assert.equal(audit.quality_score.critical_findings, 0);
  assert.equal(audit.quality_score.unresolved_blockers, 0);
});
