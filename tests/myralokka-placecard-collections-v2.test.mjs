import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const load = file => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const id = "myralokka";
const sourcePath = "data/places/natur/oslo/places_oslo_natur_akerselvarute/myralokka.json";
const runtimePath = "data/runtime/place-open/myralokka.json";

test("Myraløkka does not surface park names, historic factories or agencies as canonical Brands", () => {
  const source = load(sourcePath);
  const runtime = load(runtimePath);
  const byPlace = load("data/brands/brands_by_place.json");
  const catalog = load("data/brands/brands_master.json");
  const brands = Array.isArray(catalog) ? catalog : catalog.brands;
  assert.equal(source.id, id);
  assert.equal(runtime.place.id, id);
  assert.deepEqual(source.brands, []);
  assert.deepEqual(runtime.place.brands, []);
  assert.deepEqual(runtime.brands, []);
  assert.deepEqual(byPlace[id] || [], []);
  assert.equal(brands.filter(b => Array.isArray(b.place_ids) && b.place_ids.includes(id)).length, 0);
  assert.equal(source.place_card_profile, undefined);
  assert.equal(runtime.place.place_card_profile, undefined);
  // Architect profiles belong primarily to Folketeateret. They appear here
  // solely through sourced work on Myragården, the housing beside the park.
  const expectedPeople = ["arne_eide", "christian_morgenstierne"];
  assert.deepEqual(runtime.people.map(person => person.id).sort(), expectedPeople);
  for (const person of runtime.people) {
    assert.equal(person.placeId, "folketeateret", "Do not move the architect's primary Place");
    assert.ok(person.places.includes(id), "Missing documented secondary place relation");
    assert.match(person.popupDesc, /Myragården/u);
    assert.match(person.popupDesc, /ikke parken eller Bentse teglverk/u);
    assert.ok(person.externalLinks.some(link => link.url === "https://oslobyleksikon.no/side/Arendalsgata"),
      "Missing specific Arendalsgata citation");
    assert.ok(person.imageMeta?.reviewStatus === "manually_approved", "Existing portrait provenance must be preserved");
  }
  // Interpretive store models are not authenticated physical Objects in the park.
  assert.equal(source.civication_store.length, 4);
  assert.ok(source.civication_store.every(p => p.kind === "physical_object"));
});

test("Myraløkka retains 42 stable quiz IDs, 40 linked Knowledge units and ten sourced QuizCard links", () => {
  const quiz = load("data/quiz/natur/myralokka_sets.json");
  const cards = load("data/quizcards/natur/topp10_natur_akerselva_v1_batch02.json");
  const card = cards.cards.find(c => c.targetId === id);
  const questions = quiz.sets.flatMap(s => s.questions);
  const originals = new Map(questions.map(q => [q.id, q]));
  assert.equal(quiz.sets.length, 6);
  assert.equal(questions.length, 42);
  assert.equal(originals.size, 42);
  assert.equal(questions.filter(q => q.knowledge_link_status === "linked" && q.primary_knowledge_unit_id).length, 42);
  const pending = questions.filter(q => q.knowledge_link_status === "editorial_review_required" && q.primary_knowledge_unit_id);
  assert.deepEqual(pending, [], "No active Myraløkka question may remain editorially unlinked");
  assert.equal(questions.filter(q => q.knowledge_link_evidence?.reviewedAt === "2026-11-16").length, 42);
  const canonicalKnowledge = load("data/knowledge/knowledge_units.generated.json").units;
  const unitsById = new Map(canonicalKnowledge.map(unit => [unit.knowledge_unit_id, unit]));
  const reviewQueue = load("data/knowledge/knowledge_emne_review_queue.generated.json").items;
  assert.deepEqual(reviewQueue.filter(item => item.target_id === id && item.file === "data/quiz/natur/myralokka_sets.json"), [],
    "Retired historical questions must not be counted as open in active Natur quiz");
  const preserved = load("data/knowledge/preserved_quiz_sources/myralokka_myragarden_legacy_20261116.json");
  assert.equal(preserved.status, "preserved_legacy_knowledge_only_not_playable");
  assert.deepEqual(preserved.questions.map(q => q.id), ["myralokka_s2_q5", "myralokka_s2_q6"]);
  for (const legacy of preserved.questions) {
    assert.ok(!originals.has(legacy.id), "Retired question is still playable");
    assert.ok(unitsById.has(legacy.primary_knowledge_unit_id), "Retired Knowledge memory disappeared");
  }
  const newIds = ["myralokka_s2_q5_natur_20261116", "myralokka_s2_q6_natur_20261116"];
  for (const qid of newIds) {
    const q = originals.get(qid);
    assert.ok(q, "Missing reviewed nature replacement");
    assert.equal(q.knowledge_link_status, "linked");
    assert.ok(q.source.some(source => source.includes("veiledere.nve.no")));
    assert.ok(q.primary_knowledge_unit_id);
    assert.ok(unitsById.has(q.primary_knowledge_unit_id));
    assert.equal(q.options[q.answerIndex], q.answer);
  }
  const expectedExplicitEmner = {
  "myralokka_s1_q1": [
    "em_natur_geologi_landskapsform"
  ],
  "myralokka_s1_q2": [
    "em_natur_gronnstruktur_korridorer",
    "em_natur_urban_okologi_byrom"
  ],
  "myralokka_s1_q3": [
    "em_natur_geologi_landskapsform"
  ],
  "myralokka_s1_q4": [
    "em_natur_urban_okologi_byrom",
    "em_natur_geologi_landskapsform"
  ],
  "myralokka_s1_q5": [
    "em_natur_urban_okologi_byrom"
  ],
  "myralokka_s1_q6": [
    "em_natur_arter_habitat_mangfold"
  ],
  "myralokka_s1_q7": [
    "em_natur_geologi_landskapsform",
    "em_natur_friluftsliv_helse"
  ],
  "myralokka_s6_q1": [
    "em_natur_geologi_landskapsform",
    "em_natur_urban_okologi_byrom"
  ],
  "myralokka_s6_q2": [
    "em_natur_gronnstruktur_korridorer"
  ],
  "myralokka_s6_q3": [
    "em_natur_elver_bekker_vassdrag"
  ],
  "myralokka_s6_q4": [
    "em_natur_arter_habitat_mangfold"
  ],
  "myralokka_s6_q5": [
    "em_natur_urban_okologi_byrom"
  ],
  "myralokka_s6_q6": [
    "em_natur_arter_habitat_mangfold"
  ],
  "myralokka_s6_q7": [
    "em_natur_urban_okologi_byrom",
    "em_natur_geologi_landskapsform"
  ]
};
  for (const [qid, expected] of Object.entries(expectedExplicitEmner)) {
    const q = originals.get(qid);
    assert.ok(q, "Missing editorially reviewed question " + qid);
    assert.deepEqual(q.emne_ids, expected);
    assert.equal(q.knowledge_link_evidence?.method, "explicit");
    assert.equal(q.knowledge_link_status, "linked");
    assert.ok(q.source.length > 0 && q.options[q.answerIndex] === q.answer);
  }
  assert.ok(!originals.get("myralokka_s1_q7").question.includes("observasjonsspørsmål"),
    "Generic meta-quiz prompt must be replaced by actual place observation");
  const reviewedSet5 = Array.from({ length: 7 }, (_, index) => `myralokka_s5_q${index + 1}`);
  const expectedEmner = {
    myralokka_s5_q1: ["em_natur_arter_habitat_mangfold"],
    myralokka_s5_q2: ["em_natur_arter_habitat_mangfold"],
    myralokka_s5_q3: ["em_natur_arter_habitat_mangfold"],
    myralokka_s5_q4: ["em_natur_urban_okologi_byrom"],
    myralokka_s5_q5: ["em_natur_urban_okologi_byrom"],
    myralokka_s5_q6: ["em_natur_jord_sediment_mikroliv", "em_natur_urban_okologi_byrom"],
    myralokka_s5_q7: ["em_natur_urban_okologi_byrom", "em_natur_geologi_landskapsform"]
  };
  for (const qid of reviewedSet5) {
    const row = originals.get(qid);
    assert.ok(row, `Missing reviewed set-5 question ${qid}`);
    assert.deepEqual(row.emne_ids, expectedEmner[qid],
      `Inaccurate Natur ownership for ${qid}`);
    assert.equal(row.knowledge_link_evidence?.method, "explicit");
    assert.equal(row.knowledge_link_evidence?.reviewedAt, "2026-11-16");
    assert.equal(row.options[row.answerIndex], row.answer);
    assert.equal(row.knowledge_link_status, "linked");
    assert.ok(row.primary_knowledge_unit_id);
    const unit = unitsById.get(row.primary_knowledge_unit_id);
    assert.ok(unit, `Missing generated Knowledge unit for ${qid}`);
    assert.deepEqual(unit.emne_ids, row.emne_ids,
      `Generated Knowledge emne drift for ${qid}`);
    assert.ok(row.source.length > 0);
    assert.ok(!row.emne_ids.includes("em_natur_dyreatferd_formering_tilpasning"));
  }
  const revisedConceptIds = Array.from({ length: 6 }, (_, index) => `myralokka_s6_q${index + 1}`);
  for (const questionId of revisedConceptIds) {
    const question = originals.get(questionId);
    assert.ok(question, `Missing revised concept question ${questionId}`);
    assert.match(question.question, /Myraløkk|Akerselva/u,
      `Concept prompt is not anchored to the actual place: ${questionId}`);
    assert.equal(question.options[question.answerIndex], question.answer);
    assert.equal(new Set(question.options).size, 3);
    assert.equal(question.knowledge_link_status, "linked");
    assert.ok(question.primary_knowledge_unit_id);
  }
  assert.equal(card?.questions.length, 10);
  assert.equal(card.questionCount, 10);
  assert.equal(card.questions.filter(q => /^(?:Når|Hvilket år)\b/u.test(q.question)).length, 1);
  for (const item of card.questions) {
    const original = originals.get(item.sourceQuestionId);
    assert.ok(original, `Missing original question ${item.sourceQuestionId}`);
    assert.equal(original.knowledge_link_status, "linked", `Unreviewed QuizCard source: ${item.sourceQuestionId}`);
    assert.equal(item.sourceQuizId, original.quiz_id);
    assert.equal(item.question, original.question);
    assert.deepEqual(item.options, original.options);
    assert.equal(item.answer, original.answer);
    assert.equal(item.answerIndex, original.answerIndex);
    assert.deepEqual(item.source_urls, original.source.filter(s => /^https?:\/\//u.test(s)));
    assert.deepEqual(item.source_refs, original.source);
  }
  assert.deepEqual(card.answerKey, card.questions.map(({ number, answer, answerIndex }) => ({ number, answer, answerIndex })));
});

test("Myraløkka preserves approved history, photo attribution, coordinates and runtime parity", () => {
  const source = load(sourcePath);
  const runtime = load(runtimePath);
  const packet = load("data/places/production/myralokka.json");
  for (const key of ["desc", "popupDesc", "image", "frontImage", "cardImage", "imageCredit", "imageLicense", "imageSourceUrl", "lat", "lon"]) {
    assert.deepEqual(runtime.place[key], source[key], `Mismatch in ${key}`);
  }
  assert.equal(packet.placeId, id);
  assert.equal(packet.status, "ready_v4_2");
  assert.equal(packet.claims.length, 26);
  assert.equal(source.imageLicense, "Public domain");
  assert.match(source.popupDesc, /Bentse teglverk/);
  assert.match(source.popupDesc, /Myrens Verksted/);
  const report = fs.readFileSync(path.join(root, "reports/place-production/myralokka-placecard-curation-v1.md"), "utf8");
  assert.match(report, /v1_candidate/);
});
