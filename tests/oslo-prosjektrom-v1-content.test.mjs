import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const place = read("data/places/kunst/oslo/places_kunst/oslo_prosjektrom.json");
const runtime = read("data/runtime/place-open/oslo_prosjektrom.json");
const registry = read("data/fagverk/fagverk_registry.json");
const quiz = read("data/quiz/kunst/oslo_prosjektrom_sets.json");
const manifest = read("data/quiz/manifest.json");
const cards = read("data/quizcards/kunst/oslo_prosjektrom_quizcard_v1.json");
const cardManifest = read("data/quizcards/kunst/manifest.json");
const production = read("data/places/production/oslo_prosjektrom.json");

test("canonical venue identity and source-backed narrative", () => {
  assert.equal(place.id, "oslo_prosjektrom");
  assert.equal(place.category, "kunst");
  assert.equal(place.address.street, "Platous gate");
  assert.equal(place.address.number, "18");
  assert.equal(place.year, 2006);
  assert.deepEqual(place.underbadge_ids, ["samtidskunst", "kunstinstitusjoner"]);
  assert(place.popupDesc.includes("Wenche Kvalstad Eckhoff"));
  assert(place.popupDesc.includes("Marte Dahl"));
  assert(place.popupDesc.includes("Kebreab Demeke"));
  assert(!/I History Go|quizprofil|adresseaudit|spørsmålene bør/i.test(place.popupDesc));
  assert.deepEqual(runtime.place.desc, place.desc);
  assert.deepEqual(runtime.place.popupDesc, place.popupDesc);
  assert.deepEqual(runtime.place.fagverk, place.fagverk);
});

test("Fagverk is a dedicated curated source-based learning page", () => {
  assert.equal(place.fagverk.schema, "history_go_place_fagverk_v2");
  assert.equal(place.fagverk.level, "standard");
  assert.equal(place.fagverk.status, "curated");
  assert.equal(place.fagverk.article.length, 3);
  assert.equal(place.fagverk.lenses.length, 3);
  assert(place.fagverk.source_urls.some((url) => url.includes("osloprosjektrom.blogspot.com")));
  assert(place.fagverk.chapter_ids.includes("felt-og-institusjon"));
  assert.equal(registry.placeLinks.oslo_prosjektrom.status, "curated");
});

test("fullquiz has 21 unique directly supported questions and manifest registration", () => {
  assert.equal(quiz.size_class, "narrow");
  assert.equal(quiz.sets.length, 3);
  assert(quiz.sets.every((set) => set.questions.length === 7));
  const qs = quiz.sets.flatMap((set) => set.questions);
  assert.equal(new Set(qs.map((q) => q.id)).size, 21);
  assert.equal(new Set(qs.map((q) => q.quiz_id)).size, 21);
  for (const q of qs) {
    assert.equal(q.targetId, "oslo_prosjektrom");
    assert.equal(q.answer, q.options[q.answerIndex]);
    assert.equal(q.options.length, 4);
    assert(q.source_urls.every((url) => url.startsWith("https://")));
    assert(q.explanation.length >= 55);
  }
  const entries = manifest.sets.filter((entry) => entry.targetId === "oslo_prosjektrom");
  assert.equal(entries.length, 3);
  assert.deepEqual(entries.map((entry) => entry.set_id), quiz.sets.map((set) => set.set_id));
});

test("QuizCard contains exactly ten identical fullquiz items", () => {
  const qs = quiz.sets.flatMap((set) => set.questions);
  const card = cards.cards[0];
  assert.equal(card.targetId, "oslo_prosjektrom");
  assert.equal(card.questionCount, 10);
  assert.equal(card.questions.length, 10);
  for (let i = 0; i < 10; i += 1) {
    for (const key of ["id", "quiz_id", "question", "options", "answer", "answerIndex"]) {
      assert.deepEqual(card.questions[i][key], qs[i][key], `Mismatch on question ${i+1}: ${key}`);
    }
  }
  assert(cardManifest.collections.includes("oslo_prosjektrom_quizcard_v1.json"));
});

test("4.2 source-review packet hashes exact published text and covers all sentences", () => {
  const digest = (value) => crypto.createHash("sha256").update(value).digest("hex");
  assert.equal(production.textHashes.desc, digest(place.desc));
  assert.equal(production.textHashes.popupDesc, digest(place.popupDesc));
  assert.equal(production.sentenceCoverage.desc.length, 2);
  assert.equal(production.sentenceCoverage.popupDesc.length, 12);
  const claimIDs = new Set(production.claims.map((claim) => claim.id));
  for (const coverage of [...production.sentenceCoverage.desc, ...production.sentenceCoverage.popupDesc]) {
    assert(coverage.claimIds.every((id) => claimIDs.has(id)));
  }
});

test("image-dependent v1 closeout remains an explicit blocker until rights and live app QA pass", () => {
  assert.equal(place.image, undefined, "Do not silently publish an unverified image");
  assert.equal(place.frontImage, undefined, "Do not silently publish an unverified portrait");
  assert.equal(cards.production_status, "pending_knowledge_generation");
});
