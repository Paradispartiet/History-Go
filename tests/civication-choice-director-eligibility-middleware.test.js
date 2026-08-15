#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const interactionPath = path.join(repoRoot, "js/Civication/systems/civicationSceneInteraction.js");
const eligibilityPath = path.join(repoRoot, "js/Civication/systems/civicationJobEligibilityRuntime.js");
const directorPath = path.join(repoRoot, "js/Civication/systems/day/dayChoiceDirector.js");
const interactionSource = fs.readFileSync(interactionPath, "utf8");
const eligibilitySource = fs.readFileSync(eligibilityPath, "utf8");
const directorSource = fs.readFileSync(directorPath, "utf8");

let state = {};
let active = null;
let pendingEvent = null;
let failAnswer = false;
const order = [];

function firedEvent(id) {
  return {
    id,
    interaction_mode: "decision",
    source_type: "role_outcome",
    mail_class: "career_outcome",
    mail_type: "job",
    career_outcome_meta: {
      status: "FIRED",
      decided_at: "2026-08-15T12:00:00.000Z"
    },
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
  if (pendingEvent?.career_outcome_meta?.status === "FIRED") active = null;
  return { ok: true };
};
const baseAnswer = MockEventEngine.prototype.answer;

const windowObject = {
  CivicationEventEngine: MockEventEngine,
  CivicationState: {
    getState() { return state; },
    setState(patch) {
      if (patch?.career_reentry_locks) order.push("eligibility_post");
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
  localStorage: { getItem() { return null; } },
  Event: class Event { constructor(type) { this.type = type; } }
});

vm.runInContext(eligibilitySource, context, { filename: eligibilityPath });

assert.equal(
  MockEventEngine.prototype.answer,
  baseAnswer,
  "JobEligibility skal ikke lenger wrappe EventEngine.answer direkte"
);
assert.equal(typeof windowObject.CivicationJobEligibilityRuntime?.registerAnswerMiddleware, "function");
assert.equal(
  windowObject.__civicationChoiceAnswerMiddlewareQueue.filter((entry) => entry?.name === "job_eligibility_runtime").length,
  1,
  "Eligibility skal registreres nøyaktig én gang i deferred middleware-kø"
);
assert.equal(windowObject.__civicationChoiceAnswerMiddlewareQueue[0].priority, 50);

vm.runInContext(interactionSource, context, { filename: interactionPath });
vm.runInContext(directorSource, context, { filename: directorPath });

const director = windowObject.CivicationChoiceDirector;
assert(director, "ChoiceDirector skal være registrert");
assert.equal(windowObject.__civicationChoiceAnswerMiddlewareQueue.length, 0, "deferred Eligibility middleware skal adopteres");

director.registerAnswerMiddleware("daily_mail_builder", async (_ctx, next) => {
  order.push("daily_pre");
  const result = await next();
  order.push("daily_post");
  return result;
}, 40);

director.registerAnswerMiddleware("job_learning_runtime", async (_ctx, next) => {
  order.push("learning_pre");
  const result = await next();
  order.push("learning_post");
  return result;
}, 60);

(async () => {
  // Keep these fixture identifiers deliberately outside canonical role IDs. The Career
  // Gameplay Matrix scans test text for role evidence; an architecture-ordering test
  // must not accidentally count as role-specific gameplay proof.
  active = { career_id: "fixture_alpha", role_id: "fixture_role_alpha", title: "Fixture Alpha" };
  pendingEvent = firedEvent("eligibility_success");
  state = {};
  failAnswer = false;
  order.length = 0;

  const engine = new MockEventEngine();
  const success = await engine.answer("eligibility_success", "A");
  assert.equal(success.ok, true);
  assert.equal(state.career_reentry_locks?.fixture_alpha?.status, "locked", "FIRED skal opprette reentry-lock");
  assert.equal(state.career_reentry_locks?.fixture_alpha?.fired_role_id, "fixture_role_alpha", "Eligibility må bruke activeBefore selv om inner chain nuller aktiv jobb");
  assert.equal(active, null, "fixture inner chain skal ha nullstilt aktiv jobb");
  assert.deepEqual(order, [
    "daily_pre",
    "learning_pre",
    "base",
    "learning_post",
    "eligibility_post",
    "daily_post"
  ]);

  const middlewareOrder = Array.from(
    director.listAnswerMiddlewares(),
    (entry) => [String(entry.name), Number(entry.priority)]
  );
  assert.deepEqual(middlewareOrder, [
    ["choice_contract", 20],
    ["daily_mail_builder", 40],
    ["job_eligibility_runtime", 50],
    ["job_learning_runtime", 60]
  ]);
  assert.equal(
    director.listAnswerMiddlewares().filter((entry) => entry.name === "job_eligibility_runtime").length,
    1,
    "Eligibility middleware-registrering skal være idempotent"
  );

  const beforeFailure = JSON.stringify(state);
  active = { career_id: "fixture_beta", role_id: "fixture_role_beta", title: "Fixture Beta" };
  pendingEvent = {
    id: "eligibility_failure",
    interaction_mode: "decision",
    source_type: "planned",
    mail_type: "job",
    choices: [
      { id: "A", label: "A" },
      { id: "B", label: "B" }
    ]
  };
  failAnswer = true;
  order.length = 0;

  const failed = await engine.answer("eligibility_failure", "A");
  assert.equal(failed.ok, false);
  assert.equal(failed.reason, "fixture_failure");
  assert.equal(JSON.stringify(state), beforeFailure, "feilet inner answer skal ikke endre reentry-lock state");
  assert.deepEqual(order, [
    "daily_pre",
    "learning_pre",
    "base",
    "learning_post",
    "daily_post"
  ]);

  console.log("civication-choice-director-eligibility-middleware.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
