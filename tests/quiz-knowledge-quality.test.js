const test = require("node:test");
const assert = require("node:assert/strict");

function createStorage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); }
  };
}

function loadQuality(seed = {}) {
  delete global.HGQuizKnowledgeQuality;
  delete global.__HG_QUIZ_KNOWLEDGE_QUALITY_INSTALLED__;
  delete global.HGQuizKnowledgeMemory;
  global.localStorage = createStorage(seed);
  const path = require.resolve("../js/quizKnowledgeQuality.js");
  delete require.cache[path];
  return require(path);
}

function bundleFixture() {
  return {
    schema: "hg_knowledge_memory_v1",
    bundle_id: "sted::set_1",
    target_id: "sted",
    subject_id: "by",
    set_id: "set_1",
    reading: { state: "collected" },
    knowledge_units: [
      {
        unit_id: "q1",
        kind: "knowledge",
        question_type: "fact",
        question: "Når åpnet bygget?",
        answer: "I 2020",
        text: "Når åpnet bygget?",
        emne_ids: ["em_by_historie"],
        concepts: ["åpning"],
        terms: ["hovedbibliotek"],
        assessment: { state: "mastered", correct: true }
      },
      {
        unit_id: "q2",
        kind: "knowledge",
        question_type: "fact",
        question: "Hva er fasitsvaret?",
        answer: "Et bibliotek",
        text: "Et bibliotek",
        emne_ids: [],
        concepts: [],
        terms: [],
        assessment: { state: "needs_review", correct: false }
      },
      {
        unit_id: "q3",
        kind: "knowledge",
        question_type: "fact",
        question: "Hva skjedde?",
        answer: "Bygget åpnet",
        text: "Bygget åpnet i 2020. Det ble Oslos nye hovedbibliotek.",
        emne_ids: ["em_by_historie"],
        concepts: ["offentlig institusjon"],
        terms: ["hovedbibliotek"],
        assessment: { state: "mastered", correct: true }
      }
    ],
    fun_facts: [
      { id: "fun_1", text: "Det ble Oslos nye hovedbibliotek." },
      { id: "fun_2", text: "Bygget har seks etasjer." }
    ],
    stories: [],
    indexes: {}
  };
}

test("forkaster kopier av spørsmål og fasitsvar", () => {
  const quality = loadQuality();
  const bundle = quality.sanitizeBundle(bundleFixture());

  assert.equal(bundle.knowledge_units.some((unit) => unit.source_question_id === "q1"), false);
  assert.equal(bundle.knowledge_units.some((unit) => unit.source_question_id === "q2"), false);
});

test("deler forklaringer i små selvstendige kunnskapspåstander", () => {
  const quality = loadQuality();
  const bundle = quality.sanitizeBundle(bundleFixture());
  const q3 = bundle.knowledge_units.filter((unit) => unit.source_question_id === "q3");

  assert.equal(q3.length, 2);
  assert.deepEqual(q3.map((unit) => unit.text), [
    "Bygget åpnet i 2020.",
    "Det ble Oslos nye hovedbibliotek."
  ]);
  assert.equal(q3[0].kind, "fact");
  assert.deepEqual(q3[0].concepts, ["offentlig institusjon"]);
  assert.deepEqual(q3[0].terms, ["hovedbibliotek"]);
  assert.equal("question" in q3[0], false);
  assert.equal("answer" in q3[0], false);
});

test("beholder funfacts separat uten å lagre samme påstand to ganger", () => {
  const quality = loadQuality();
  const bundle = quality.sanitizeBundle(bundleFixture());

  assert.deepEqual(bundle.fun_facts.map((row) => row.text), ["Bygget har seks etasjer."]);
});

test("beholder automatisk samlet-status og bygger nye indekser", () => {
  const quality = loadQuality();
  const bundle = quality.sanitizeBundle(bundleFixture());

  assert.equal(bundle.reading.state, "collected");
  assert.deepEqual(bundle.indexes.emne_ids, ["em_by_historie"]);
  assert.deepEqual(bundle.indexes.concepts, ["offentlig institusjon"]);
  assert.deepEqual(bundle.indexes.terms, ["hovedbibliotek"]);
  assert.equal(bundle.content_quality.automatic_storage, true);
});

test("renser allerede lagrede bundles uten å opprette parallelle datalag", () => {
  const memory = {
    schema: "hg_knowledge_memory_v1",
    bundles: { "sted::set_1": bundleFixture() },
    indexes: {}
  };
  const quality = loadQuality({
    hg_knowledge_memory_v1: JSON.stringify(memory)
  });

  const stored = quality.sanitizeStoredMemory();
  assert.ok(stored.bundles["sted::set_1"]);
  assert.equal("facts" in stored.bundles["sted::set_1"], false);
  assert.equal("fag_terms" in stored.bundles["sted::set_1"], false);
  assert.equal(stored.indexes.mastered.length, 2);
});
