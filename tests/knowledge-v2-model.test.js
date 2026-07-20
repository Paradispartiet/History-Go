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

function loadKnowledgeV2(seed = {}) {
  global.localStorage = createStorage(
    Object.fromEntries(Object.entries(seed).map(([key, value]) => [key, JSON.stringify(value)]))
  );
  global.addEventListener = () => {};
  global.DomainRegistry = null;
  global.PLACES = [{ id: "torggata" }];
  global.PEOPLE = [];
  global.saveKnowledgeFromQuiz = () => {};

  const path = require.resolve("../js/knowledgeV2.js");
  delete require.cache[path];
  return require(path);
}

test("normaliserer alle emne-aliaser som finnes i quiz og learning log", () => {
  const api = loadKnowledgeV2();
  assert.deepEqual(
    api.normalizeEmneIds({
      emne_id: "a",
      emne_ids: ["b"],
      related_emner: ["c"],
      related_emners: ["d"],
      relatedEmner: ["e"]
    }),
    ["a", "b", "c", "d", "e"]
  );
});

test("riktig quiz-svar oppretter canonical Knowledge-entry med fag og concepts", () => {
  const api = loadKnowledgeV2();
  const entry = api.captureQuizKnowledge({
    id: "torggata_gentrifisering",
    categoryId: "by",
    placeId: "torggata",
    related_emner: ["em_by_gentrifisering_eiendom"],
    core_concepts: ["gentrifisering", "planmakt"],
    dimension: "konflikt_forandring",
    topic: "Gentrifisering",
    knowledge: "Oppgradering av en gate kan endre både bruk, status og leienivå."
  });

  assert.equal(entry.schema, "history_go_knowledge_entry_v2");
  assert.equal(entry.subject_id, "by");
  assert.deepEqual(entry.emne_ids, ["em_by_gentrifisering_eiendom"]);
  assert.deepEqual(entry.concepts, ["gentrifisering", "planmakt"]);
  assert.equal(entry.source.place_id, "torggata");
  assert.equal(api.getEntries().length, 1);
});

test("samme kunnskapspunkt dedupliseres og bygger relasjon over tid", () => {
  const api = loadKnowledgeV2();
  const quiz = {
    id: "same_question",
    categoryId: "by",
    related_emner: ["em_by_test"],
    core_concepts: ["byrom"],
    knowledge: "Et byrom formes av bruk."
  };

  api.captureQuizKnowledge(quiz);
  api.captureQuizKnowledge(quiz);

  const rows = api.getEntries();
  assert.equal(rows.length, 1);
  assert.equal(rows[0].times_seen, 2);
});

test("learning log med related_emner kan reparere manglende emnekobling", () => {
  const api = loadKnowledgeV2({
    hg_learning_log_v1: [{
      type: "quiz_set_complete",
      categoryId: "by",
      parentTargetId: "torggata",
      related_emner: ["em_by_gentrifisering_eiendom"],
      concepts: ["gentrifisering"]
    }]
  });

  api.captureQuizKnowledge({
    id: "torggata_question",
    categoryId: "by",
    placeId: "torggata",
    core_concepts: ["gentrifisering"],
    knowledge: "Gentrifisering endrer hvem som har råd til å bruke et område."
  });

  const result = api.reconcileEntriesFromLearningLog();
  assert.equal(result.changed, 1);
  assert.deepEqual(api.getEntries()[0].emne_ids, ["em_by_gentrifisering_eiendom"]);
});

test("legacy knowledge bevares selv når emnekoblingen mangler", () => {
  const api = loadKnowledgeV2({
    knowledge_universe: {
      historie: {
        historisk: [{ id: "quiz_legacy_1", topic: "Et gammelt punkt", text: "Bevar meg." }]
      }
    }
  });

  const result = api.migrateLegacyKnowledge();
  assert.ok(result.total >= 1);
  const row = api.getEntries().find((entry) => entry.text === "Bevar meg.");
  assert.ok(row);
  assert.equal(row.subject_id, "historie");
  assert.equal(row.link_status, "legacy_unresolved");
});

test("buildProfile organiserer Knowledge etter fag og emne uten å gjøre observasjoner til Knowledge", async () => {
  const api = loadKnowledgeV2({
    hg_learning_log_v1: [{
      type: "observation",
      categoryId: "by",
      targetId: "torggata",
      selected: ["mye_folk"]
    }]
  });

  global.DataHub = {
    async loadFagManifest() { return { by: {} }; },
    async loadEmner() {
      return [{
        emne_id: "em_by_gentrifisering_eiendom",
        title: "Gentrifisering og eiendom",
        core_concepts: ["gentrifisering"]
      }];
    }
  };

  api.captureQuizKnowledge({
    id: "q1",
    categoryId: "by",
    core_concepts: ["gentrifisering"],
    knowledge: "Et kunnskapspunkt."
  });

  const profile = await api.buildProfile({ subjectId: "by" });
  assert.equal(profile.summary.knowledge_count, 1);
  assert.equal(profile.subjects.by.entries.length, 1);
  assert.equal(profile.subjects.by.emner[0].knowledge_count, 1);
});
