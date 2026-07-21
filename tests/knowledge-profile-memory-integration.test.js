const test = require("node:test");
const assert = require("node:assert/strict");

function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return { getItem: (key) => values.has(key) ? values.get(key) : null, setItem: (key, value) => values.set(key, String(value)), removeItem: (key) => values.delete(key) };
}

function loadRuntime(seed = {}) {
  global.localStorage = storage(seed);
  global.addEventListener = () => {};
  global.dispatchEvent = () => true;
  global.PLACES = [{ id: "sted" }];
  global.PEOPLE = [];
  global.DataHub = {
    loadEmner: async () => [{ emne_id: "em_by_test", title: "Testemne", core_concepts: ["byrom"] }],
    loadFagManifest: async () => ({ by: {} })
  };
  global.DomainRegistry = { toRuntimeCategoryId: (value) => value };
  delete global.HGKnowledgeV2;
  delete global.HGQuizKnowledgeMemory;
  delete global.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__;
  delete global.__HG_KNOWLEDGE_MEMORY_BROWSER_INTEGRATION__;
  const runtimePath = require.resolve("../dist/web/knowledgeV2.js");
  delete require.cache[runtimePath];
  require(runtimePath);
  return global.HGKnowledgeV2;
}

test("buildProfile synkroniserer quizminne direkte til den kanoniske emner-kontrakten", async () => {
  const memory = {
    schema: "hg_knowledge_memory_v1",
    bundles: {
      "sted::set_1": {
        bundle_id: "sted::set_1",
        target_id: "sted",
        subject_id: "by",
        set_id: "set_1",
        collected_at: "2026-07-21T00:00:00.000Z",
        updated_at: "2026-07-21T00:00:00.000Z",
        reading: { state: "collected" },
        result: { correct: 1, total: 2 },
        knowledge_units: [
          { unit_id: "u1", text: "Første presise påstand.", topic: "Fakta", emne_ids: ["em_by_test"], concepts: ["byrom"], terms: [], tags: [], assessment: { state: "mastered", correct: true }, reading: { state: "collected" }, quality: { version: 3 } },
          { unit_id: "u2", text: "Andre presise påstand.", topic: "Fakta", emne_ids: ["em_by_test"], concepts: ["byrom"], terms: [], tags: [], assessment: { state: "needs_review", correct: false }, reading: { state: "collected" }, quality: { version: 3 } }
        ],
        fun_facts: [], stories: [], building_stories: [], conflicts: []
      }
    }
  };
  const api = loadRuntime({ hg_knowledge_memory_v1: JSON.stringify(memory) });
  const profile = await api.buildProfile({ subjectId: "by" });
  const subject = profile.subjects.by;
  assert.equal(subject.emners, undefined);
  assert.equal(subject.emner[0].knowledge_count, 2);
  assert.equal(subject.entries.length, 2);
  assert.equal(subject.entries.filter((entry) => entry.memory_evidence.assessment_state === "needs_review").length, 1);
  assert.equal(profile.quiz_memory.summary.bundle_count, 1);
});

test("gjentatt profilbygging er idempotent og øker ikke times_seen", async () => {
  const api = loadRuntime();
  const bundle = api.quizMemory.buildQuizKnowledgeBundle({ targetId: "sted", categoryId: "by", setId: "set_1", questions: [{ id: "q1", knowledge: "En stabil påstand.", emne_id: "em_by_test", categoryId: "by", targetId: "sted" }], result: { correct: 0, total: 1 } });
  api.quizMemory.saveBundle(bundle);
  await api.buildProfile({ subjectId: "by" });
  const first = api.getEntries()[0].times_seen;
  await api.buildProfile({ subjectId: "by" });
  assert.equal(api.getEntries()[0].times_seen, first);
});
