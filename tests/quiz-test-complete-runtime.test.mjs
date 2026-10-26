import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const QUIZ_SCRIPT = fs.readFileSync("js/quizzes.js", "utf8");

function createHarness({ testMode = true, answers = [0, 1] } = {}) {
  const storage = new Map();
  const scheduled = new Map();
  const awarded = [];
  const unlocks = [];
  const notifications = [];
  const events = [];
  let nextTimer = 0;

  const element = () => ({
    style: {},
    hidden: false,
    disabled: false,
    textContent: "",
    classList: { add() {}, remove() {}, contains() { return false; } },
    addEventListener() {}
  });
  const ids = [
    "quizModal", "quizTitle", "quizQuestion", "quizChoices",
    "quizProgress", "quizFeedback", "quizTestComplete",
    "quizSummaryModal", "quizSummaryTitle", "quizSummaryLead",
    "quizSummaryMeta", "quizSummaryPrimary", "quizSummarySecondary"
  ];
  const elements = new Map(ids.map((id) => [id, element()]));
  const choices = elements.get("quizChoices");
  Object.defineProperty(choices, "innerHTML", {
    set(html) {
      choices.buttons = Array.from(html.matchAll(/data-idx="(\d+)"/g), (match) => ({
        ...element(),
        dataset: { idx: match[1] }
      }));
    }
  });
  choices.querySelectorAll = () => choices.buttons || [];
  elements.get("quizSummaryModal").querySelector = (selector) => elements.get(selector.slice(1));

  const document = {
    baseURI: "https://example.test/",
    getElementById: (id) => elements.get(id) || null,
    querySelector: () => ({ style: {} }),
    querySelectorAll: () => [],
    addEventListener() {}
  };
  const questions = [
    { categoryId: "by", targetId: "place1", quiz_id: "first", question: "Første?", options: ["Ja", "Nei"], answerIndex: answers[0], core_concepts: ["first"] },
    { categoryId: "by", targetId: "place1", quiz_id: "second", question: "Andre?", options: ["Nei", "Ja"], answerIndex: answers[1], core_concepts: ["second"] }
  ];
  const window = {
    DEBUG: false,
    HGTestMode: { isEnabled: () => testMode },
    HGQuizAnswerShuffle: {
      shuffleQuestion: (q) => ({ options: q.options, answerIndex: q.answerIndex })
    },
    HGUnlocks: { recordFromQuiz: ({ quizId }) => unlocks.push(quizId) },
    addEventListener() {},
    dispatchEvent: (event) => events.push(event.type)
  };
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key)
  };
  const fetch = async (url) => ({
    ok: true,
    json: async () => String(url).includes("manifest.json")
      ? { files: [], sets: [{ targetId: "place1", file: "mock-sets.json", set_id: "set1", order: 1 }] }
      : { sets: [{ set_id: "set1", questions }] }
  });
  class CustomEvent {
    constructor(type, options) {
      this.type = type;
      this.detail = options?.detail;
    }
  }
  const context = {
    window,
    document,
    localStorage,
    fetch,
    URL,
    CustomEvent,
    Event: CustomEvent,
    console,
    setTimeout: (callback) => {
      const id = ++nextTimer;
      scheduled.set(id, callback);
      return id;
    },
    clearTimeout: (id) => scheduled.delete(id)
  };
  vm.runInNewContext(QUIZ_SCRIPT, context);
  window.QuizEngine.init({
    getPlaceById: (id) => ({ id, name: "Teststed" }),
    getPersonById: () => null,
    getVisited: () => ({ place1: true }),
    isTestMode: () => testMode,
    showToast: (message) => notifications.push(message),
    showRewardPlace: (place) => awarded.push(place.id),
    dispatchProfileUpdate() {}
  });

  return {
    window, elements, choices, storage, scheduled,
    awarded, unlocks, events, notifications,
    start: () => window.QuizEngine.start("place1")
  };
}

test("quiz completion button is visible and works in ordinary play", async () => {
  const h = createHarness({ testMode: false });
  await h.start();
  const button = h.elements.get("quizTestComplete");
  assert.equal(button.hidden, false);
  assert.equal(typeof button.onclick, "function");
  button.onclick();
  const progress = JSON.parse(h.storage.get("hg_quiz_sets_v1"));
  assert.equal(progress.set1.score, 2);
  assert.equal(progress.set1.total, 2);
  assert.deepEqual(h.unlocks, ["first", "second"]);
  assert.deepEqual(h.awarded, ["place1"]);
  assert.equal(button.onclick, null);
});

test("one click finishes a quiz with correct answers and normal rewards", async () => {
  const h = createHarness();
  await h.start();
  const button = h.elements.get("quizTestComplete");
  assert.equal(button.hidden, false);
  button.onclick();
  const progress = JSON.parse(h.storage.get("hg_quiz_sets_v1"));
  assert.equal(progress.set1.score, 2);
  assert.equal(progress.set1.total, 2);
  assert.equal(progress.set1.completed, true);
  const event = JSON.parse(h.storage.get("hg_learning_log_v1"))[0];
  assert.equal(event.correctCount, 2);
  assert.equal(event.correctAnswers.length, 2);
  assert.deepEqual(h.unlocks, ["first", "second"]);
  assert.deepEqual(h.awarded, ["place1"]);
  assert.equal(h.events.filter((name) => name === "hg:quizCompleted").length, 1);
  assert.equal(button.onclick, null);
});

test("test completion repairs previous wrong answers without duplicate right-answer hooks", async () => {
  const h = createHarness();
  await h.start();
  h.choices.buttons[1].onclick(); // Incorrect first answer; its feedback timer is pending.
  assert.equal(h.unlocks.length, 0);
  h.elements.get("quizTestComplete").onclick();
  const event = JSON.parse(h.storage.get("hg_learning_log_v1"))[0];
  assert.equal(event.correctCount, 2);
  assert.equal(event.correctAnswers.length, 2);
  assert.deepEqual(h.unlocks, ["first", "second"]);
  assert.equal(h.scheduled.size, 2); // Modal close and summary handoff; ordinary advance was canceled.
});

test("test completion refuses an invalid answer key without completing", async () => {
  const h = createHarness({ answers: [0, -1] });
  await h.start();
  h.elements.get("quizTestComplete").onclick();
  assert.equal(h.storage.has("hg_quiz_sets_v1"), false);
  assert.equal(h.unlocks.length, 0);
  assert.match(h.notifications.join(" "), /mangler gyldig fasit/);
});
