#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const interactionPath = path.join(repoRoot, "js/Civication/systems/civicationSceneInteraction.js");
const outcomePath = path.join(repoRoot, "js/Civication/systems/civicationCareerOutcomeRuntime.js");
const directorPath = path.join(repoRoot, "js/Civication/systems/day/dayChoiceDirector.js");
const interactionSource = fs.readFileSync(interactionPath, "utf8");
const outcomeSource = fs.readFileSync(outcomePath, "utf8");
const directorSource = fs.readFileSync(directorPath, "utf8");

let state = {};
let active = null;
let pendingEvent = null;
let failAnswer = false;
let updateProfileCount = 0;
const order = [];

function firedOutcome(id) {
  return {
    id,
    source_type: "role_outcome",
    mail_type: "job_outcome",
    mail_class: "career_outcome",
    role_scope: "fixture_scope_alpha",
    choices: [{ id: "A", label: "Registrer avslutningen" }],
    career_outcome_meta: {
      status: "FIRED",
      outcome: "fired",
      role_scope: "fixture_scope_alpha",
      role_plan_id: "fixture_plan_alpha",
      decided_at: "2026-08-15T12:00:00.000Z"
    }
  };
}

function MockEventEngine() {}
MockEventEngine.prototype.getPendingEvent = function () {
  return pendingEvent ? { status: "pending", event: pendingEvent } : null;
};
MockEventEngine.prototype.answer = async function () {
  order.push("base");
  if (failAnswer) return { ok: false, reason: "fixture_failure" };
  return { ok: true };
};
const baseAnswer = MockEventEngine.prototype.answer;

const windowObject = {
  CivicationEventEngine: MockEventEngine,
  CivicationState: {
    getState() { return state; },
    setState(patch) {
      if (patch?.stability === "FIRED" && !patch?.career_outcome_state) order.push("fired_pre");
      if (patch?.career_outcome_state) order.push("outcome_post");
      state = { ...state, ...(patch || {}) };
      return patch;
    },
    getActivePosition() { return active; },
    setActivePosition(next) { active = next; },
    appendJobHistoryEnded() {}
  },
  CivicationPsyche: {
    registerCollapse() {}
  },
  addEventListener() {},
  dispatchEvent(event) {
    if (event?.type === "updateProfile") updateProfileCount += 1;
    return true;
  }
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
  Event: class Event { constructor(type) { this.type = type; } }
});

vm.runInContext(outcomeSource, context, { filename: outcomePath });

assert.equal(
  MockEventEngine.prototype.answer,
  baseAnswer,
  "CareerOutcome skal ikke lenger wrappe EventEngine.answer direkte"
);
assert.equal(typeof windowObject.CivicationCareerOutcomeRuntime?.registerAnswerMiddleware, "function");
assert.equal(
  windowObject.__civicationChoiceAnswerMiddlewareQueue.filter((entry) => entry?.name === "career_outcome_runtime").length,
  1,
  "CareerOutcome skal registreres nøyaktig én gang i deferred middleware-kø"
);
assert.equal(windowObject.__civicationChoiceAnswerMiddlewareQueue[0].priority, 70);

vm.runInContext(interactionSource, context, { filename: interactionPath });
vm.runInContext(directorSource, context, { filename: directorPath });

const director = windowObject.CivicationChoiceDirector;
assert(director, "ChoiceDirector skal være registrert");
assert.equal(windowObject.__civicationChoiceAnswerMiddlewareQueue.length, 0, "deferred CareerOutcome middleware skal adopteres");

director.registerAnswerMiddleware("job_learning_runtime", async (_ctx, next) => {
  order.push("learning_pre");
  const result = await next();
  order.push("learning_post");
  return result;
}, 60);

director.registerAnswerMiddleware("mail_runtime", async (_ctx, next) => {
  order.push("mail_pre");
  assert.equal(state.stability, "FIRED", "FIRED stability skal være satt før priority 80 inner middleware");
  const result = await next();
  order.push("mail_post");
  return result;
}, 80);

(async () => {
  // Outcome mail uses the production shape: exactly one source-owned choice. Scene
  // Interaction therefore infers ack; the test adds no synthetic interaction mode.
  const originalConsumed = { fixture_marker: true };
  state = { consumed: originalConsumed, stability: "STABLE" };
  active = { career_id: "fixture_alpha", role_id: "fixture_role_alpha", title: "Fixture Alpha" };
  pendingEvent = firedOutcome("outcome_success");
  failAnswer = false;
  updateProfileCount = 0;
  order.length = 0;

  const engine = new MockEventEngine();
  const success = await engine.answer("outcome_success", "A");
  assert.equal(success.ok, true);
  assert.equal(success.choice_director?.interaction_mode, "ack", "one-choice outcome skal klassifiseres som ack");
  assert.equal(state.career_outcome_state?.status, "FIRED", "vellykket svar skal anvende terminal outcome-state");
  assert.equal(state.stability, "FIRED");
  assert.equal(active, null, "FIRED outcome skal fortsatt nullstille aktiv jobb");
  assert.notEqual(state.consumed, originalConsumed, "pre-answer FIRED skal klone consumed før inner chain");
  assert.equal(JSON.stringify(state.consumed), JSON.stringify({ fixture_marker: true }));
  assert.equal(updateProfileCount, 1, "vellykket outcome skal dispatch updateProfile én gang");
  assert.deepEqual(order, [
    "learning_pre",
    "fired_pre",
    "mail_pre",
    "base",
    "mail_post",
    "outcome_post",
    "learning_post"
  ]);

  const middlewareOrder = Array.from(
    director.listAnswerMiddlewares(),
    (entry) => [String(entry.name), Number(entry.priority)]
  );
  assert.deepEqual(middlewareOrder, [
    ["choice_contract", 20],
    ["job_learning_runtime", 60],
    ["career_outcome_runtime", 70],
    ["mail_runtime", 80]
  ]);
  assert.equal(
    director.listAnswerMiddlewares().filter((entry) => entry.name === "career_outcome_runtime").length,
    1,
    "CareerOutcome middleware-registrering skal være idempotent"
  );

  // Historical contract: FIRED pre-state is intentionally not rolled back when the
  // inner answer fails. Only applyOutcomeState/updateProfile are success-gated.
  const failureConsumed = { keep: "yes" };
  state = { consumed: failureConsumed, stability: "STABLE" };
  active = { career_id: "fixture_beta", role_id: "fixture_role_beta", title: "Fixture Beta" };
  pendingEvent = firedOutcome("outcome_failure");
  failAnswer = true;
  updateProfileCount = 0;
  order.length = 0;

  const failed = await engine.answer("outcome_failure", "A");
  assert.equal(failed.ok, false);
  assert.equal(failed.reason, "fixture_failure");
  assert.equal(state.stability, "FIRED", "feilet inner svar skal beholde historisk FIRED pre-state");
  assert.equal(state.career_outcome_state, undefined, "feilet inner svar skal ikke anvende terminal outcome-state");
  assert.notEqual(state.consumed, failureConsumed, "FIRED pre-state skal fortsatt klone consumed ved feilet svar");
  assert.equal(JSON.stringify(state.consumed), JSON.stringify({ keep: "yes" }));
  assert.notEqual(active, null, "uten applyOutcomeState skal feilet svar ikke nullstille aktiv jobb");
  assert.equal(updateProfileCount, 0, "feilet outcome skal ikke dispatch updateProfile");
  assert.deepEqual(order, [
    "learning_pre",
    "fired_pre",
    "mail_pre",
    "base",
    "mail_post",
    "learning_post"
  ]);

  console.log("civication-choice-director-career-outcome-middleware.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
