const test = require("node:test");
const assert = require("node:assert/strict");

function loadBridge() {
  delete global.HGKnowledgeV2;
  delete global.HGQuizKnowledgeMemory;
  delete global.HGKnowledgeMemoryPageBridge;
  delete global.__HG_KNOWLEDGE_MEMORY_PAGE_BRIDGE__;
  const path = require.resolve("../js/knowledgeMemoryPageBridge.js");
  delete require.cache[path];
  return require(path);
}

function baseProfile() {
  return {
    schema: "history_go_knowledge_profile_v2",
    summary: {},
    concepts: [],
    subjects: {
      by: {
        subject_id: "by",
        label: "By",
        knowledge_count: 0,
        linked_count: 0,
        unresolved_count: 0,
        concepts: [],
        entries: [],
        emners: [{
          emne_id: "em_by_test",
          title: "Testemne",
          description: "",
          core_concepts: [],
          dimensions: [],
          knowledge_count: 0,
          entries: []
        }],
        course: null
      }
    }
  };
}

function memoryFixture() {
  return {
    schema: "hg_knowledge_memory_v1",
    bundles: {
      "sted::set_1": {
        bundle_id: "sted::set_1",
        target_id: "sted",
        subject_id: "by",
        set_id: "set_1",
        source_file: "data/quiz/by/sted_sets.json",
        collected_at: "2026-07-21T00:00:00.000Z",
        updated_at: "2026-07-21T00:00:00.000Z",
        reading: { state: "read" },
        result: { correct: 1, total: 2 },
        knowledge_units: [
          {
            unit_id: "q1",
            kind: "knowledge",
            text: "Et faktum som er knyttet til et emne.",
            topic: "Fakta",
            emne_ids: ["em_by_test"],
            concepts: ["byrom"],
            concept_focus: [],
            terms: [],
            assessment: { state: "mastered", correct: true },
            reading: { state: "read" }
          },
          {
            unit_id: "q2",
            kind: "analysis",
            text: "Et kunnskapspunkt som må repeteres.",
            topic: "Analyse",
            emne_ids: [],
            concepts: ["analyse"],
            concept_focus: [],
            terms: [],
            assessment: { state: "needs_review", correct: false },
            reading: { state: "read" }
          }
        ],
        fun_facts: [{ id: "f1", text: "En kuriositet." }],
        stories: [{ id: "s1", text: "En historie." }],
        building_stories: [],
        conflicts: []
      }
    }
  };
}

test("quizminnet flettes inn i fag, emner, begreper og sammendrag", () => {
  const bridge = loadBridge();
  const profile = bridge.mergeMemoryIntoProfile(baseProfile(), memoryFixture());
  const subject = profile.subjects.by;

  assert.equal(subject.knowledge_count, 4);
  assert.equal(subject.linked_count, 1);
  assert.equal(subject.unresolved_count, 3);
  assert.equal(subject.emners[0].knowledge_count, 1);
  assert.deepEqual(subject.concepts.map((row) => row.label).sort(), ["analyse", "byrom"]);
  assert.equal(profile.summary.knowledge_count, 4);
  assert.equal(profile.summary.concept_count, 2);
  assert.equal(profile.quiz_memory.summary.bundle_count, 1);
  assert.equal(profile.quiz_memory.summary.mastered_count, 1);
  assert.equal(profile.quiz_memory.summary.review_count, 1);
});

test("eksakt samme tekst fra samme fag og mål dedupliseres uten å miste minneevidens", () => {
  const bridge = loadBridge();
  const profile = baseProfile();
  profile.subjects.by.entries.push({
    id: "legacy",
    subject_id: "by",
    text: "Et faktum som er knyttet til et emne.",
    concepts: [],
    resolved_emne_ids: [],
    source: { target_id: "sted" }
  });

  const merged = bridge.mergeMemoryIntoProfile(profile, memoryFixture());
  const matching = merged.subjects.by.entries.filter((entry) => entry.text === "Et faktum som er knyttet til et emne.");

  assert.equal(matching.length, 1);
  assert.equal(matching[0].memory_evidence.assessment_state, "mastered");
  assert.deepEqual(matching[0].resolved_emne_ids, ["em_by_test"]);
  assert.deepEqual(matching[0].concepts, ["byrom"]);
});