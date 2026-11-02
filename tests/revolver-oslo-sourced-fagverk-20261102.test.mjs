import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const source = read("data/places/subkultur/oslo/places_subkultur/revolver_oslo.json");
const runtime = read("data/runtime/place-open/revolver_oslo.json");
const registry = read("data/fagverk/fagverk_registry.json");

test("Revolver identity, location and existing category are preserved", () => {
  assert.equal(source.id, "revolver_oslo");
  assert.equal(source.category, "musikk");
  assert(source.secondaryBadgeIds.includes("subkultur"));
  assert.equal(source.address.number, "32B");
  assert.equal(source.coordSourceId, "geonorge-adresser-v1:0301:14943:32B");
  assert.equal(source.lat, 59.91699988365845);
  assert.equal(source.lon, 10.749742822662785);
  assert.equal(source.year, 2007);
});
test("Revolver has sourced editorial history rather than production instructions", () => {
  assert(source.desc.includes("2007"));
  assert(source.desc.includes("Nordhagen"));
  assert(source.popupDesc.includes("Ball'Em Up"));
  assert(source.popupDesc.includes("26. mai 2021"));
  assert(!/I History Go|Spørsmål bør|quizprofil|metaformulering/i.test(source.popupDesc));
  const links = source.externalLinks.map((l) => l.url);
  assert(links.some((x) => x.includes("subjekt.no/2017/")));
  assert(links.some((x) => x.includes("osloworld.no/")));
  assert(links.some((x) => x.includes("oslonytt.com/")));
  assert(links.some((x) => x.includes("virksomhet.brreg.no/")));
});
test("Dedicated curated Fagverk and canonical chapters are registered", () => {
  const f = source.fagverk;
  assert.equal(f.schema, "history_go_place_fagverk_v2");
  assert.equal(f.status, "curated");
  assert.equal(f.article.length, 3);
  assert.equal(f.lenses.length, 3);
  assert(f.article.every((x) => x.length > 300));
  assert(f.source_urls.length >= 6);
  assert(f.chapter_ids.includes("historisk-musikkvitenskap-historiografi"));
  assert(f.chapter_ids.includes("institusjoner-okonomi-politikk-offentlighet"));
  const link = registry.placeLinks.revolver_oslo;
  assert.equal(link.sourceFile, "places/subkultur/oslo/places_subkultur/revolver_oslo.json");
  assert.equal(link.field, "fagverk");
  assert.equal(link.status, "curated");
});
test("Published Place-open content matches canonical data", () => {
  assert.equal(runtime.place.id, source.id);
  for(const key of ["desc", "popupDesc", "externalLinks", "fagverk"]) {
    assert.deepEqual(runtime.place[key], source[key]);
  }
});

test("Revolver fullquiz has five distinct six-question sets and registered IDs", () => {
  const quizFile = "data/quiz/musikk/revolver_oslo_sets_merged.json";
  const quiz = read(quizFile);
  const manifest = read("data/quiz/manifest.json");
  assert.equal(quiz.targetId, "revolver_oslo");
  assert.equal(quiz.categoryId, "musikk");
  assert.equal(quiz.sets.length, 5);
  assert(quiz.sets.every((set) => set.questions.length === 6));
  const qs = quiz.sets.flatMap((set) => set.questions);
  assert.equal(new Set(qs.map((q) => q.id)).size, 30);
  assert.equal(new Set(qs.map((q) => q.quiz_id)).size, 30);
  assert(qs.every((q) => q.source.some((url) => url.startsWith("https://"))));
  assert(qs.every((q) => q.answer === q.options[q.answerIndex]));
  assert(qs.every((q) => q.knowledge.length > 40));
  assert(qs.every((q) => q.placeId === "revolver_oslo" && q.categoryId === "musikk"));
  assert(!qs.some((q) => /History Go|plassfil|quizgenerator/i.test(q.question)));
  const entries = manifest.sets.filter((x) => x.targetId === "revolver_oslo");
  assert.equal(entries.length, 5);
  assert(entries.every((x) => x.file === quizFile));
  assert.deepEqual(entries.map((x) => x.set_id), quiz.sets.map((x) => x.set_id));
});
test("10 QuizCard questions preserve fullquiz question, options and answer keys", () => {
  const quiz = read("data/quiz/musikk/revolver_oslo_sets_merged.json");
  const qById = new Map(quiz.sets.flatMap((s) => s.questions).map((q) => [q.id,q]));
  const collection = read("data/quizcards/musikk/topp10_musikk_oslo_v1_batch01.json");
  const cards = collection.cards.filter((x) => x.targetId === "revolver_oslo");
  assert.equal(cards.length, 1);
  const card = cards[0];
  assert.equal(card.categoryId, "musikk");
  assert.equal(card.questionCount, 10);
  assert.equal(card.questions.length, 10);
  assert.equal(card.answerKey.length, 10);
  assert.equal(new Set(card.questions.map((x) => x.sourceQuestionId)).size, 10);
  for(const [i,q] of card.questions.entries()){
    const orig = qById.get(q.sourceQuestionId);
    assert(orig);
    assert.equal(q.question, orig.question);
    assert.deepEqual(q.options, orig.options);
    assert.equal(q.answer, orig.answer);
    assert.equal(q.answerIndex, orig.answerIndex);
    assert.equal(q.sourceQuizId, orig.quiz_id);
    assert.equal(card.answerKey[i].answer, q.answer);
  }
});

test("Revolver local licensed media and generated Knowledge IDs exist", () => {
  const files = [source.image,source.frontImage,source.cardImage];
  assert.equal(new Set(files).size, 3);
  for(const file of files) {
    assert(file.endsWith(".webp"));
    assert(fs.existsSync(file), "Missing local image: " + file);
    assert(fs.statSync(file).size > 10000, "Truncated local image: " + file);
    assert.equal(runtime.place[file === source.image ? "image" : file === source.frontImage ? "frontImage" : "cardImage"],file);
  }
  assert.equal(source.imageMeta.creator, "Ssu");
  assert.equal(source.frontImageMeta.license, "CC BY-SA 4.0");
  const quiz = read("data/quiz/musikk/revolver_oslo_sets_merged.json");
  assert.equal(quiz.status, "v1_candidate_pending_browser");
  for (const q of quiz.sets.flatMap(s => s.questions)) {
    assert.equal(q.knowledge_link_status, "linked", q.id);
    assert(q.primary_knowledge_unit_id?.startsWith("ku_"), q.id);
    assert(q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id), q.id);
    assert(q.concept_ids?.length > 0, q.id);
  }
});
