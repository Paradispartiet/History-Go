#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const interactionPath = path.join(repoRoot, "js/Civication/systems/civicationSceneInteraction.js");
const directorPath = path.join(repoRoot, "js/Civication/systems/day/dayChoiceDirector.js");
const interactionSource = fs.readFileSync(interactionPath, "utf8");
const directorSource = fs.readFileSync(directorPath, "utf8");

const order = [];
let pendingEvent = {
  id: "middleware_decision",
  interaction_mode: "decision",
  mail_type: "job",
  choices: [
    { id: "A", label: "A" },
    { id: "B", label: "B" }
  ]
};

function MockEventEngine() {}
MockEventEngine.prototype.getPendingEvent = function () {
  return pendingEvent ? { status: "pending", event: pendingEvent } : null;
};
MockEventEngine.prototype.answer = async function (eventId, choiceId) {
  order.push("base");
  if (!pendingEvent || String(pendingEvent.id) !== String(eventId)) return { ok: false, reason: "not_found" };
  const choice = pendingEvent.choices.find((entry) => entry.id === choiceId);
  if (!choice) return { ok: false, reason: "bad_choice" };
  return { ok: true, effect: 0 };
};

const deferredQueue = [
  {
    name: "life_mail_runtime",
    priority: 30,
    fn: async (_ctx, next) => {
      order.push("life_pre");
      const result = await next();
      order.push("life_post");
      return result;
    }
  }
];

const state = {};
const windowObject = {
  CivicationEventEngine: MockEventEngine,
  CivicationState: {
    getActivePosition: () => ({ career_id: "fixture", role_key: "fixture_role" }),
    getState: () => state,
    setState(next) { Object.assign(state, next || {}); }
  },
  __civicationChoiceAnswerMiddlewareQueue: deferredQueue
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
  Error
});

vm.runInContext(interactionSource, context, { filename: interactionPath });
vm.runInContext(directorSource, context, { filename: directorPath });

const director = windowObject.CivicationChoiceDirector;
assert(director, "ChoiceDirector skal være registrert");
assert.equal(typeof director.registerAnswerMiddleware, "function");
assert.equal(windowObject.__civicationChoiceAnswerMiddlewareQueue.length, 0, "deferred middleware skal adopteres ved boot");

director.registerAnswerMiddleware("active_role_state_sync", async (_ctx, next) => {
  order.push("active_pre");
  const result = await next();
  order.push("active_post");
  return result;
}, 10);

director.registerHandler("fixture_handler", () => {
  order.push("handler");
  return { handled: true };
}, 50);

(async () => {
  const engine = new MockEventEngine();
  const result = await engine.answer("middleware_decision", "A");

  assert.equal(result.ok, true);
  assert.deepEqual(order, [
    "active_pre",
    "life_pre",
    "base",
    "life_post",
    "handler",
    "active_post"
  ]);

  assert.equal(result.choice_director.blocked, false);
  assert.equal(result.choice_director.interaction_mode, "decision");
  assert.equal(result.choice_director.choice_id, "A");

  const middlewares = Array.from(
    director.listAnswerMiddlewares(),
    (entry) => [String(entry.name), Number(entry.priority)]
  );
  assert.deepEqual(
    middlewares,
    [
      ["active_role_state_sync", 10],
      ["choice_contract", 20],
      ["life_mail_runtime", 30]
    ]
  );

  const duplicate = director.registerAnswerMiddleware("life_mail_runtime", async () => null, 999);
  assert.equal(duplicate, true);
  assert.equal(director.listAnswerMiddlewares().filter((entry) => entry.name === "life_mail_runtime").length, 1);

  pendingEvent = {
    id: "passive_info",
    interaction_mode: "info",
    choices: []
  };
  order.length = 0;
  const blocked = await engine.answer("passive_info", null);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, "interaction_not_actionable");
  assert.deepEqual(order, ["active_pre", "active_post"], "outer middleware skal se blokkert svar, inner middleware skal ikke kjøres");

  console.log("civication-choice-director-middleware-spine.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
