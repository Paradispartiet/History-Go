#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const interactionPath = path.join(repoRoot, "js/Civication/systems/civicationSceneInteraction.js");
const dailyPath = path.join(repoRoot, "js/Civication/systems/civicationDailyMailBuilder.js");
const directorPath = path.join(repoRoot, "js/Civication/systems/day/dayChoiceDirector.js");
const interactionSource = fs.readFileSync(interactionPath, "utf8");
const dailySource = fs.readFileSync(dailyPath, "utf8");
const directorSource = fs.readFileSync(directorPath, "utf8");

const runtimeKey = "mail_day_runtime_v1";
const order = [];
const resolved = [];
let failAnswer = false;
let pendingEvent = null;
const state = {};

function makeEvent(id) {
  return {
    id,
    interaction_mode: "decision",
    mail_class: "daily_workday",
    source_type: "daily_extra",
    mail_type: "job",
    role_scope: "fixture_role",
    phase_tag: "morning",
    choices: [
      { id: "A", label: "A" },
      { id: "B", label: "B" }
    ]
  };
}

function resetRuntime(event) {
  pendingEvent = event;
  state[runtimeKey] = {
    version: 1,
    date: "2026-08-15",
    role_scope: "fixture_role",
    current_index: 0,
    delivered_ids: [event.id],
    answered_ids: [],
    items: [
      {
        status: "delivered",
        phase: "morning",
        slot: "fixture",
        event
      }
    ]
  };
}

function MockEventEngine() {
  this.__civiSuppressImmediateFollowup = false;
}
MockEventEngine.prototype.getPendingEvent = function () {
  return pendingEvent ? { status: "pending", event: pendingEvent } : null;
};
MockEventEngine.prototype.getInbox = function () {
  return pendingEvent ? [{ status: "pending", event: pendingEvent }] : [];
};
MockEventEngine.prototype.onAppOpen = async function () {
  return { ok: true, source: "base_on_app_open" };
};
MockEventEngine.prototype.answer = async function (eventId, choiceId) {
  order.push("base");
  assert.equal(this.__civiSuppressImmediateFollowup, true, "Daily skal undertrykke immediate followup inne i inner chain");
  const runtime = state[runtimeKey];
  assert.equal(runtime.items[0].status, "answered", "Daily skal markere runtime før inner answer");
  assert.equal(runtime.items[0].choice_id, String(choiceId));
  assert(runtime.answered_ids.includes(String(eventId)));
  if (failAnswer) return { ok: false, reason: "fixture_failure" };
  return { ok: true, effect: 1 };
};

const baseAnswer = MockEventEngine.prototype.answer;
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

const windowObject = {
  CivicationEventEngine: MockEventEngine,
  CivicationState: {
    getActivePosition: () => ({ career_id: "fixture", role_key: "fixture_role", title: "Fixture" }),
    getState: () => state,
    setState(next) { Object.assign(state, next || {}); }
  },
  CivicationMailEngine: {
    markResolved(mailId, eventId, choiceId) {
      resolved.push([String(mailId), String(eventId), String(choiceId)]);
      order.push("daily_resolve");
      return { ok: true };
    }
  },
  __civicationChoiceAnswerMiddlewareQueue: deferredQueue,
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
  Event: class Event { constructor(type) { this.type = type; } }
});

resetRuntime(makeEvent("daily_success"));
vm.runInContext(dailySource, context, { filename: dailyPath });

assert.equal(
  MockEventEngine.prototype.answer,
  baseAnswer,
  "Daily skal ikke lenger wrappe EventEngine.answer direkte"
);
assert.equal(typeof windowObject.CivicationDailyMailBuilder?.registerAnswerMiddleware, "function");
assert.equal(
  windowObject.__civicationChoiceAnswerMiddlewareQueue.filter((entry) => entry?.name === "daily_mail_builder").length,
  1,
  "Daily skal registreres nøyaktig én gang i deferred middleware-kø"
);

vm.runInContext(interactionSource, context, { filename: interactionPath });
vm.runInContext(directorSource, context, { filename: directorPath });

const director = windowObject.CivicationChoiceDirector;
assert(director, "ChoiceDirector skal være registrert");
assert.equal(windowObject.__civicationChoiceAnswerMiddlewareQueue.length, 0, "deferred middleware skal adopteres ved Director-boot");

director.registerAnswerMiddleware("active_role_state_sync", async (_ctx, next) => {
  order.push("active_pre");
  const result = await next();
  order.push("active_post");
  return result;
}, 10);

director.registerAnswerMiddleware("legacy_inner_fixture", async (_ctx, next) => {
  order.push("inner50_pre");
  assert.equal(state[runtimeKey].items[0].status, "answered", "priority 50 skal ligge innenfor Daily 40");
  assert.equal(resolved.length, 0, "Daily skal ikke resolve inbox før inner chain har returnert");
  const result = await next();
  order.push("inner50_post");
  assert.equal(resolved.length, 0, "Daily post skal fortsatt vente til priority 50 har returnert");
  return result;
}, 50);

director.registerHandler("fixture_handler", () => {
  order.push("handler");
  return { handled: true };
}, 50);

(async () => {
  const engine = new MockEventEngine();
  const success = await engine.answer("daily_success", "A");

  assert.equal(success.ok, true);
  assert.equal(success.dailyRuntimeAnswered, true);
  assert.equal(success.choice_director?.interaction_mode, "decision");
  assert.equal(success.choice_director?.choice_id, "A");
  assert.equal(engine.__civiSuppressImmediateFollowup, false, "Daily skal gjenopprette suppress-flagget etter svar");
  assert.deepEqual(resolved, [["daily_success", "daily_success", "A"]]);
  assert.deepEqual(order, [
    "active_pre",
    "life_pre",
    "inner50_pre",
    "base",
    "inner50_post",
    "daily_resolve",
    "life_post",
    "handler",
    "active_post"
  ]);

  const middlewareOrder = Array.from(
    director.listAnswerMiddlewares(),
    (entry) => [String(entry.name), Number(entry.priority)]
  );
  assert.deepEqual(middlewareOrder, [
    ["active_role_state_sync", 10],
    ["choice_contract", 20],
    ["life_mail_runtime", 30],
    ["daily_mail_builder", 40],
    ["legacy_inner_fixture", 50]
  ]);
  assert.equal(
    director.listAnswerMiddlewares().filter((entry) => entry.name === "daily_mail_builder").length,
    1,
    "Daily middleware-registrering skal være idempotent"
  );

  order.length = 0;
  resolved.length = 0;
  failAnswer = true;
  resetRuntime(makeEvent("daily_failure"));

  const failed = await engine.answer("daily_failure", "B");
  assert.equal(failed.ok, false);
  assert.equal(failed.reason, "fixture_failure");
  assert.equal(failed.dailyRuntimeAnswered, undefined);
  assert.equal(engine.__civiSuppressImmediateFollowup, false, "suppress-flagget skal gjenopprettes også ved feil");
  assert.deepEqual(resolved, [], "feilet svar skal ikke resolve inbox-mailen");

  const rolledBack = state[runtimeKey];
  assert.equal(rolledBack.items[0].status, "delivered", "feilet svar skal rulle Daily-raden tilbake til delivered");
  assert.equal(rolledBack.items[0].choice_id, null);
  assert.equal(rolledBack.items[0].answered_at, null);
  assert(!rolledBack.answered_ids.includes("daily_failure"), "feilet svar skal fjernes fra answered_ids");
  assert.deepEqual(order, [
    "active_pre",
    "life_pre",
    "inner50_pre",
    "base",
    "inner50_post",
    "life_post",
    "active_post"
  ]);

  console.log("civication-choice-director-daily-middleware.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
