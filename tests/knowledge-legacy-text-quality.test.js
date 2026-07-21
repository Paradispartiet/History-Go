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

function loadModules(seed = {}) {
  global.localStorage = createStorage(seed);
  delete global.HGQuizKnowledgeQuality;
  delete global.HGKnowledgeLegacyTextQuality;
  delete global.__HG_QUIZ_KNOWLEDGE_QUALITY_INSTALLED__;
  delete global.__HG_KNOWLEDGE_LEGACY_TEXT_QUALITY_INSTALLED__;
  delete global.saveKnowledgeFromQuiz;

  const qualityPath = require.resolve("../js/quizKnowledgeQuality.js");
  const legacyPath = require.resolve("../js/knowledgeLegacyTextQuality.js");
  delete require.cache[qualityPath];
  delete require.cache[legacyPath];
  require(qualityPath);
  return require(legacyPath);
}

test("fjerner spørsmålkopier og korte fasitsvar fra legacy-universet", () => {
  const api = loadModules();
  const cleaned = api.sanitizeLegacyUniverse({
    by: {
      historie: [
        { id: "q1", topic: "Når åpnet bygget?", text: "Når åpnet bygget?" },
        { id: "q2", topic: "Hva er bygget?", text: "Et bibliotek" },
        { id: "q3", topic: "Åpning", text: "Bygget åpnet i 2020." }
      ]
    }
  });

  assert.deepEqual(cleaned.by.historie.map((entry) => entry.text), ["Bygget åpnet i 2020."]);
});

test("deler legacy-forklaringer i små påstander og fjerner spørsmålstittelen", () => {
  const api = loadModules();
  const cleaned = api.sanitizeLegacyUniverse({
    by: {
      historie: [{
        id: "q1",
        topic: "Hva skjedde med biblioteket?",
        text: "Biblioteket åpnet i 2020. Bygget ble Oslos nye hovedbibliotek."
      }]
    }
  });

  assert.equal(cleaned.by.historie.length, 2);
  assert.deepEqual(cleaned.by.historie.map((entry) => entry.text), [
    "Biblioteket åpnet i 2020.",
    "Bygget ble Oslos nye hovedbibliotek."
  ]);
  assert.equal(cleaned.by.historie[0].topic, "Kunnskap");
});

test("renser V2-poster og bruker eksplisitte begreper uten tags", () => {
  const api = loadModules();
  const entries = [{
    id: "kv2_by_q1",
    subject_id: "by",
    topic: "Hva kjennetegner stedet?",
    text: "Stedet fungerer som sosial infrastruktur. Det gir gratis tilgang til møteplasser.",
    answer: "Sosial infrastruktur",
    concepts: ["fakta", "sted", "sosial infrastruktur"],
    source: { quiz_id: "q1", target_id: "sted" }
  }];
  const quizItem = {
    quiz_id: "q1",
    core_concepts: ["sosial infrastruktur", "møtested"],
    tags: ["fakta", "sted", "quiz"]
  };

  const cleaned = api.sanitizeV2Entries(entries, quizItem);
  assert.equal(cleaned.length, 2);
  assert.equal(cleaned[0].topic, "Kunnskap");
  assert.equal("answer" in cleaned[0], false);
  assert.deepEqual(cleaned[0].concepts, ["sosial infrastruktur", "møtested"]);
});

test("skriver begge eksisterende lagre selv om begge må endres", () => {
  const legacy = {
    by: { historie: [{ id: "q1", topic: "Hva er svaret?", text: "Et bibliotek" }] }
  };
  const v2 = [{
    id: "q2",
    subject_id: "by",
    topic: "Når åpnet det?",
    text: "Når åpnet det?",
    answer: "2020",
    source: { quiz_id: "q2", target_id: "sted" }
  }];
  const api = loadModules({
    knowledge_universe: JSON.stringify(legacy),
    hg_knowledge_entries_v2: JSON.stringify(v2)
  });

  const result = api.sanitizeStoredKnowledge();
  assert.deepEqual(result.legacy, {});
  assert.deepEqual(result.v2, []);
  assert.equal(global.localStorage.getItem("knowledge_universe"), "{}");
  assert.equal(global.localStorage.getItem("hg_knowledge_entries_v2"), "[]");
});
