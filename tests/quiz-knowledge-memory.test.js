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

function loadApi() {
  global.localStorage = createStorage();
  global.addEventListener = () => {};
  global.PLACES = [];
  global.PEOPLE = [];
  delete global.HGKnowledgeV2;
  delete global.HGQuizKnowledgeMemory;
  delete global.__HG_KNOWLEDGE_V2_CAPTURE_INSTALLED__;

  const knowledgePath = require.resolve("../dist/web/knowledgeV2.js");
  delete require.cache[knowledgePath];
  require(knowledgePath);

  return global.HGKnowledgeV2.quizMemory;
}

function sampleInput() {
  return {
    targetId: "bispelokket",
    categoryId: "by",
    setId: "by_bispelokket_set_1",
    sourceFile: "data/quiz/by/bispelokket_sets.json",
    setData: {
      targetId: "bispelokket",
      categoryId: "by",
      fun_facts: [
        "Bispelokket førte svært store trafikkmengder gjennom sentrum.",
        { id: "fun_2", text: "Veisystemet lå over flere nivåer." }
      ],
      source_profile_extensions: {
        stories: [{ id: "story_1", title: "Lokket", text: "Bispelokket endret møtet mellom Gamlebyen og sentrum." }]
      },
      related_people: [{ id: "person_1", name: "En planlegger", description: "Arbeidet med trafikksystemet." }],
      related_events: [{ id: "event_1", title: "Riving", description: "Anlegget ble senere revet." }]
    },
    setBlock: {
      set_id: "by_bispelokket_set_1",
      title: "Bispelokket som trafikksystem"
    },
    questions: [
      {
        id: "q1",
        quiz_id: "by_bispelokket_set_1_q1",
        categoryId: "by",
        targetId: "bispelokket",
        question: "Hva var Bispelokket?",
        answer: "Et trafikkanlegg",
        knowledge: "Bispelokket var et stort planskilt trafikkanlegg.",
        trivia: "Anlegget ble et kjent bysymbol.",
        emne_id: "em_by_infrastruktur",
        related_emner: ["em_by_byutvikling"],
        core_concepts: ["trafikksystem", "planskilte kryss"],
        concept_focus: ["infrastruktur"],
        method_id: "met_stedsanalyse",
        source: [{ name: "Oslo byleksikon", type: "reference" }]
      },
      {
        id: "q2",
        quiz_id: "by_bispelokket_set_1_q2",
        categoryId: "by",
        targetId: "bispelokket",
        question: "Hva skjedde med anlegget?",
        answer: "Det ble revet",
        knowledge: "Rivingen åpnet området for en ny byutvikling.",
        trivia: ["Rivingen endret trafikkmønsteret.", "Området fikk nye forbindelser."],
        emne_id: "em_by_byutvikling",
        core_concepts: ["transformasjon"]
      }
    ],
    result: {
      correct: 1,
      total: 2,
      correctAnswers: [{ question: "Hva var Bispelokket?", answer: "Et trafikkanlegg" }]
    }
  };
}

test("bygger ett sammenhengende bundle fra spørsmål og toppnivåbanker", () => {
  const api = loadApi();
  const bundle = api.buildQuizKnowledgeBundle(sampleInput());

  assert.equal(bundle.bundle_id, "bispelokket::by_bispelokket_set_1");
  assert.equal(bundle.subject_id, "by");
  assert.equal(bundle.knowledge_units.length, 2);
  assert.equal(bundle.fun_facts.length, 5);
  assert.equal(bundle.stories.length, 1);
  assert.equal(bundle.people.length, 1);
  assert.equal(bundle.events.length, 1);
  assert.deepEqual(bundle.indexes.emne_ids, ["em_by_infrastruktur", "em_by_byutvikling"]);
  assert.ok(bundle.indexes.concepts.includes("trafikksystem"));
  assert.ok(bundle.indexes.methods.includes("met_stedsanalyse"));
  assert.ok(bundle.knowledge_units.every((unit) => !("question" in unit) && !("answer" in unit)));
});

test("skiller mestret kunnskap fra kunnskap som trenger repetisjon", () => {
  const api = loadApi();
  const bundle = api.buildQuizKnowledgeBundle(sampleInput());

  assert.equal(bundle.knowledge_units[0].assessment.state, "mastered");
  assert.equal(bundle.knowledge_units[1].assessment.state, "needs_review");
  assert.equal(bundle.result.correct, 1);
  assert.equal(bundle.result.percent, 50);
});

test("støtter trivia som både tekst og liste uten å lagre tomme arrays", () => {
  const api = loadApi();
  const input = sampleInput();
  input.questions.push({
    id: "q3",
    quiz_id: "by_bispelokket_set_1_q3",
    question: "Tom trivia",
    answer: "Svar",
    knowledge: "Kunnskap om stedet.",
    trivia: []
  });

  const bundle = api.buildQuizKnowledgeBundle(input);
  const triviaTexts = bundle.fun_facts.map((row) => row.text);

  assert.ok(triviaTexts.includes("Anlegget ble et kjent bysymbol."));
  assert.ok(triviaTexts.includes("Rivingen endret trafikkmønsteret."));
  assert.ok(triviaTexts.includes("Området fikk nye forbindelser."));
  assert.equal(triviaTexts.includes(""), false);
});

test("forkaster spørsmål og fasitsvar og deler presise forklaringer", () => {
  const api = loadApi();
  const input = sampleInput();
  input.questions = [
    {
      id: "q1",
      question_type: "fact",
      question: "Når åpnet bygget?",
      answer: "I 2020",
      knowledge: "Når åpnet bygget?"
    },
    {
      id: "q2",
      question_type: "fact",
      question: "Hva er fasitsvaret?",
      answer: "Et bibliotek",
      explanation: "Et bibliotek"
    },
    {
      id: "q3",
      question_type: "fact",
      question: "Hva skjedde?",
      answer: "Bygget åpnet",
      knowledge_payload: {
        summary: "Bygget åpnet i 2020. Det ble Oslos nye hovedbibliotek."
      },
      core_concepts: ["offentlig institusjon"],
      terminology: ["hovedbibliotek"],
      term_ids: ["term_by_hovedbibliotek_test"],
      tags: ["oslo"]
    }
  ];
  input.result = { correct: 1, total: 3, correctAnswers: [{ question: "Hva skjedde?", answer: "Bygget åpnet" }] };

  const bundle = api.buildQuizKnowledgeBundle(input);
  assert.deepEqual(bundle.knowledge_units.map((unit) => unit.text), [
    "Bygget åpnet i 2020.",
    "Det ble Oslos nye hovedbibliotek."
  ]);
  assert.deepEqual(bundle.indexes.concepts, ["offentlig institusjon"]);
  assert.deepEqual(bundle.indexes.terms, ["hovedbibliotek"]);
  assert.equal(bundle.indexes.concepts.includes("oslo"), false);
  assert.equal(bundle.content_quality.canonical_builder, true);
});

test("lagrer bundles og bygger indekser for fag, sted, emner og repetisjon", () => {
  const api = loadApi();
  const bundle = api.buildQuizKnowledgeBundle(sampleInput());
  api.saveBundle(bundle);

  const memory = api.readMemory();
  assert.ok(memory.bundles[bundle.bundle_id]);
  assert.deepEqual(memory.indexes.by_subject.by, [bundle.bundle_id]);
  assert.deepEqual(memory.indexes.by_target.bispelokket, [bundle.bundle_id]);
  assert.deepEqual(memory.indexes.by_emne.em_by_infrastruktur, [bundle.bundle_id]);
  assert.equal(memory.indexes.mastered.length, 1);
  assert.equal(memory.indexes.needs_review.length, 1);
});

