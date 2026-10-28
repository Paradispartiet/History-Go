import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const id = "voldslokka_pumptrack";
const place = read("data/places/sport/oslo/voldslokka_pumptrack/voldslokka_pumptrack.json");
const production = read("data/places/production/voldslokka_pumptrack.json");
const quiz = read("data/quiz/sport/voldslokka_pumptrack_sets.json");
const card = read("data/quizcards/sport/voldslokka_pumptrack_quizcard_v1.json");
const quizManifest = read("data/quiz/manifest.json");
const cardManifest = read("data/quizcards/sport/manifest.json");
const questions = quiz.sets.flatMap((set) => set.questions);
const byId = new Map(questions.map((q) => [q.id, q]));

test("Voldsløkka: sted, Fagverk og historisk kildegrunnlag er avgrenset", () => {
  assert.equal(place.id, id);
  assert.equal(place.category, "sport");
  assert.ok(place.secondaryBadgeIds.includes("subkultur"));
  assert.equal(place.fagverk?.article?.length, 3);
  assert.equal(place.fagverk?.lenses?.length, 3);
  assert.equal(production.placeId, id);
  assert.equal(production.schemaVersion, "4.2");
  assert.equal(production.claims.length, 15);
  assert.ok(production.claims.every((c) => c.status === "verified" && c.sourceUrl?.startsWith("https://")));
  assert.match(place.desc, /Sagene IF/u);
  assert.match(place.popupDesc, /Betongpark\/Shapers/u);
  assert.match(place.popupDesc, /august 2026/u);
});

test("Voldsløkka: 3 × 7 kildeførte fullquizspørsmål med Knowledge-koblinger", () => {
  assert.equal(quiz.targetId, id);
  assert.deepEqual(quiz.sets.map((set) => set.questions.length), [7, 7, 7]);
  assert.equal(questions.length, 21);
  assert.equal(byId.size, 21);
  assert.equal(new Set(questions.map((q) => q.quiz_id)).size, 21);
  assert.ok(questions.every((q) => q.question_scope === "place" && q.targetId === id));
  assert.ok(questions.every((q) => q.options.length === 4 && q.options[q.answerIndex] === q.answer));
  assert.ok(questions.every((q) => q.source_urls?.length && q.source_urls.every((url) => url.startsWith("https://"))));
  assert.ok(questions.every((q) =>
    q.knowledge_link_status === "linked" &&
    typeof q.primary_knowledge_unit_id === "string" &&
    q.knowledge_unit_ids?.includes(q.primary_knowledge_unit_id)
  ));
  assert.equal(questions.filter((q) => /^(Når|Hvilket år|I hvilket år)\b/iu.test(q.question)).length, 0);
});

test("Voldsløkka: 10 QuizCard-spørsmål er identiske med fullquiz", () => {
  assert.equal(card.cards.length, 1);
  const subset = card.cards[0].questions;
  assert.equal(subset.length, 10);
  assert.equal(new Set(subset.map((q) => q.sourceQuestionId)).size, 10);
  for (const question of subset) {
    const original = byId.get(question.sourceQuestionId);
    assert.ok(original, question.sourceQuestionId);
    for (const field of ["question", "answer", "answerIndex", "quiz_id", "knowledge"]) {
      assert.deepEqual(question[field], original[field], field + ": " + question.id);
    }
    assert.deepEqual(question.options, original.options, question.id);
    assert.deepEqual(question.knowledge_unit_ids, original.knowledge_unit_ids, question.id);
    assert.equal(question.primary_knowledge_unit_id, original.primary_knowledge_unit_id);
  }
});

test("Voldsløkka: manifestene peker på de kanoniske quizfilene", () => {
  const refs = quizManifest.sets.filter((entry) => entry.targetId === id);
  assert.deepEqual(refs.map((entry) => entry.set_id).sort(), quiz.sets.map((set) => set.set_id).sort());
  assert.ok(cardManifest.collections.includes("voldslokka_pumptrack_quizcard_v1.json"));
});

// Fotorettigheter håndheves av eksisterende audit-place-images-port.
// Manglende lisensiert stedsfoto er ikke unntatt eller omklassifisert her.


test("Voldsløkka: lokal illustrasjon er merket og beholdes i canonical Place", () => {
  const expected = "bilder/places/oslo-aav-20261027/voldslokka_pumptrack_illustration.svg";
  assert.equal(place.image, expected);
  assert.equal(place.cardImage, expected);
  assert.equal(place.popupImage, expected);
  assert.match(place.imageCaption || "", /illustrasjon/u);
  assert.match(place.imageMeta?.assetType || "", /editorial_place_illustration/u);
  const svg = readFileSync(new URL("../" + expected, import.meta.url), "utf8");
  assert.ok(svg.startsWith("<svg "), "SVG må være en lokal tegningsfil");
  assert.match(svg, /ILLUSTRASJON/u);
  assert.ok(!svg.includes("<image"), "Ingen innlastede eksterne bilder");
});


test("Voldsløkka: regenerert quiz-kontekst speiler fullquizens 3×7-sett", () => {
  const context = read("data/quiz/production_context/sport/voldslokka_pumptrack.json");
  assert.equal(context.targetId, id);
  assert.equal(context.categoryId, "sport");
  assert.equal(context.source_review_status, "reviewed");
  assert.equal(context.claim_bank.length, 21);
  assert.equal(context.set_plan.length, 3);
  assert.equal(context.question_balance.total, questions.length);
  assert.equal(context.profile_decision.set_count, quiz.sets.length);
  assert.equal(context.profile_decision.questions_per_set, 7);
});
