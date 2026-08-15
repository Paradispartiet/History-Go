#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const interactionPath = path.join(repoRoot, "js/Civication/systems/civicationSceneInteraction.js");
const learningPath = path.join(repoRoot, "js/Civication/systems/civicationJobLearningRuntime.js");
const directorPath = path.join(repoRoot, "js/Civication/systems/day/dayChoiceDirector.js");
const interactionSource = fs.readFileSync(interactionPath, "utf8");
const learningSource = fs.readFileSync(learningPath, "utf8");
const directorSource = fs.readFileSync(directorPath, "utf8");

let state = {};
let active = null;
let pendingEvent = null;
let failAnswer = false;
const order = [];

function plannedJobEvent(id) {
  return {
    id,
    interaction_mode: "decision",
    source_type: "planned",
    mail_type: "job",
    role_scope: "fixture_role_alpha",
    choices: [
      { id: "A", label: "A" },
      { id: "B", label: "B" }
    ]
  };
}

function MockEventEngine() {}
MockEventEngine.prototype.getPendingEvent = function () {
  return pendingEvent ? { status: "pending", event: pendingEvent } : null;
};
MockEventEngine.prototype.answer = async function () {
  order.push("base");
  if (failAnswer) return { ok: false, reason: "fixture_failure" };
  active = null;
  return { ok: true };
};
const baseAnswer = MockEventEngine.prototype.answer;

const windowObject = {
  CivicationEventEngine: MockEventEngine,
  CivicationCalendar: {
    getClock() { return { dayIndex: 7 }; }
  },
  CivicationState: {
    getState() { return state; },
    setState(patch) {
      if (patch?.job_learning_progress) order.push("learning_post");
      state = { ...state, ...(patch || {}) };
      return patch;
    },
    getActivePosition() { return active; }
  },
  addEventListener() {},
  dispatchEvent() { return true; }
};
windowObject.window = windowObject;

const context = vm.createContext({
  window: windowObject,
  document: { readyState: "complete", addEventListener() {} },
  console,
  Array,
  Object,
  String,
  Number,
  Promise,
  Set,
  Map,
  Date,
  Error,
  JSON,
  fetch: async () => ({ ok: false, json: async () => ({}) }),
  Event: class Event { constructor(type) { this.type = type; } }
});

vm.runInContext(learningSource, context, { filename: learningPath });

assert.equal(
  MockEventEngine.prototype.answer,
  baseAnswer,
  "JobLearning skal ikke lenger wrappe EventEngine.answer direkte"
);
assert.equal(typeof windowObject.CivicationJobLearningRuntime?.registerAnswerMiddleware, "function");
assert.equal(
  windowObject.__civicationChoiceAnswerMiddlewareQueue.filter((entry) => entry?.name === "job_learning_runtime").length,
  1,
  "JobLearning skal registreres nøyaktig én gang i deferred middleware-kø"
);
assert.equal(windowObject.__civicationChoiceAnswerMiddlewareQueue[0].priority, 60);

vm.runInContext(interactionSource, context, { filename: interactionPath });
vm.runInContext(directorSource, context, { filename: directorPath });

const director = windowObject.CivicationChoiceDirector;
assert(director, "ChoiceDirector skal være registrert");
assert.equal(windowObject.__civicationChoiceAnswerMiddlewareQueue.length, 0, "deferred JobLearning middleware skal adopteres");

director.registerAnswerMiddleware("job_eligibility_runtime", async (_ctx, next) => {
  order.push("eligibility_pre");
  const result = await next();
  order.push("eligibility_post");
  return result;
}, 50);

director.registerAnswerMiddleware("career_outcome_runtime", async (_ctx, next) => {
  order.push("outcome_pre");
  const result = await next();
  order.push("outcome_post");
  return result;
}, 70);

(async () => {
  // Deliberately use non-canonical fixture identifiers. Career Gameplay Matrix scans
  // test text for role evidence, and this architecture test must not count as such.
  active = { career_id: "fixture_alpha", role_id: "fixture_role_alpha", role_key: "fixture_scope_alpha", title: "Fixture Alpha" };
  pendingEvent = plannedJobEvent("learning_success");
  state = {};
  failAnswer = false;
  order.length = 0;

  const engine = new MockEventEngine();
  const success = await engine.answer("learning_success", "A");
  assert.equal(success.ok, true);
  assert.equal(active, null, "fixture inner chain skal ha nullstilt aktiv jobb");
  assert.equal(state.job_learning_progress?.fixture_role_alpha?.steps, 1, "JobLearning må bruke active captured før inner chain");
  assert.equal(state.job_learning_progress?.fixture_role_alpha?.last_updated_day, 7, "JobLearning bruker canonical calendar day");
  assert.deepEqual(order, [
    "eligibility_pre",
    "outcome_pre",
    "base",
    "outcome_post",
    "learning_post",
    "eligibility_post"
  ]);

  const middlewareOrder = Array.from(
    director.listAnswerMiddlewares(),
    (entry) => [String(entry.name), Number(entry.priority)]
  );
  assert.deepEqual(middlewareOrder, [
    ["choice_contract", 20],
    ["job_eligibility_runtime", 50],
    ["job_learning_runtime", 60],
    ["career_outcome_runtime", 70]
  ]);
  assert.equal(
    director.listAnswerMiddlewares().filter((entry) => entry.name === "job_learning_runtime").length,
    1,
    "JobLearning middleware-registrering skal være idempotent"
  );

  const beforeFailure = JSON.stringify(state);
  active = { career_id: "fixture_beta", role_id: "fixture_role_beta", role_key: "fixture_scope_beta", title: "Fixture Beta" };
  pendingEvent = plannedJobEvent("learning_failure");
  failAnswer = true;
  order.length = 0;

  const failed = await engine.answer("learning_failure", "B");
  assert.equal(failed.ok, false);
  assert.equal(failed.reason, "fixture_failure");
  assert.equal(JSON.stringify(state), beforeFailure, "feilet inner answer skal ikke skrive jobblæring");
  assert.deepEqual(order, [
    "eligibility_pre",
    "outcome_pre",
    "base",
    "outcome_post",
    "eligibility_post"
  ]);

  console.log("civication-choice-director-learning-middleware.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
