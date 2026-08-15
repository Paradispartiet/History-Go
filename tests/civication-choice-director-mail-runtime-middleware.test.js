#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const interactionPath = path.join(repoRoot, "js/Civication/systems/civicationSceneInteraction.js");
const mailRuntimePath = path.join(repoRoot, "js/Civication/systems/civicationMailRuntime.js");
const directorPath = path.join(repoRoot, "js/Civication/systems/day/dayChoiceDirector.js");
const interactionSource = fs.readFileSync(interactionPath, "utf8");
const mailRuntimeSource = fs.readFileSync(mailRuntimePath, "utf8");
const directorSource = fs.readFileSync(directorPath, "utf8");

let state = {};
let active = null;
let pendingEvent = null;
let inbox = [];
let failAnswer = false;
let brandApplyCount = 0;
const order = [];

function plannedEvent(id) {
  return {
    id,
    source_type: "planned",
    mail_type: "job",
    mail_family: "fixture_family",
    role_scope: "fixture_scope",
    phase_tag: "afternoon",
    mail_plan_meta: {
      plan_id: "fixture_plan",
      step_index: 0,
      type: "job"
    },
    choices: [
      { id: "A", label: "Velg A", triggers_on_choice: "fixture_thread" },
      { id: "B", label: "Velg B" }
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
  return { ok: true };
};
const baseAnswer = MockEventEngine.prototype.answer;

async function fetchMock(url) {
  const value = String(url || "");
  if (value.endsWith("/job/fixture_scope_job.json")) {
    return {
      ok: true,
      async json() {
        return {
          mail_type: "job",
          role_scope: "fixture_scope",
          families: [
            {
              id: "fixture_family",
              mails: [],
              threads: [
                {
                  id: "fixture_thread",
                  source: "Fixture",
                  subject: "Oppfølging",
                  choices: [{ id: "T", label: "Fortsett" }]
                }
              ]
            }
          ]
        };
      }
    };
  }
  return { ok: false, async json() { return null; } };
}

const windowObject = {
  CivicationEventEngine: MockEventEngine,
  CivicationCalendar: {
    getPhase() { return "morning"; }
  },
  CivicationState: {
    getState() { return state; },
    setState(patch) {
      if (patch?.mail_runtime_v1) order.push("runtime_pre");
      state = { ...state, ...(patch || {}) };
      return patch;
    },
    getActivePosition() { return active; },
    getInbox() { return inbox; },
    setInbox(next) {
      inbox = Array.isArray(next) ? next : [];
      if (inbox[0]?.event?.id === "fixture_thread") order.push("thread_post");
    }
  },
  CivicationBrandJobState: {
    applyChoiceConsequences() {
      brandApplyCount += 1;
      order.push("brand_post");
      return { changed: true, fixture: "brand_consequence" };
    }
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
  fetch: fetchMock,
  Event: class Event { constructor(type) { this.type = type; } }
});

vm.runInContext(mailRuntimeSource, context, { filename: mailRuntimePath });

assert.equal(
  MockEventEngine.prototype.answer,
  baseAnswer,
  "MailRuntime skal ikke lenger wrappe EventEngine.answer direkte"
);
assert.equal(typeof windowObject.CivicationMailRuntime?.registerAnswerMiddleware, "function");
assert.equal(
  windowObject.__civicationChoiceAnswerMiddlewareQueue.filter((entry) => entry?.name === "mail_runtime").length,
  1,
  "MailRuntime skal registreres nøyaktig én gang i deferred middleware-kø"
);
assert.equal(windowObject.__civicationChoiceAnswerMiddlewareQueue[0].priority, 80);

vm.runInContext(interactionSource, context, { filename: interactionPath });
vm.runInContext(directorSource, context, { filename: directorPath });

const director = windowObject.CivicationChoiceDirector;
assert(director, "ChoiceDirector skal være registrert");
assert.equal(windowObject.__civicationChoiceAnswerMiddlewareQueue.length, 0, "deferred MailRuntime middleware skal adopteres");

director.registerAnswerMiddleware("career_outcome_runtime", async (_ctx, next) => {
  order.push("outcome_pre");
  const result = await next();
  order.push("outcome_post");
  return result;
}, 70);

director.registerAnswerMiddleware("day_patches", async (_ctx, next) => {
  order.push("day_pre");
  assert.equal(state.mail_runtime_v1?.step_index, 1, "MailRuntime state skal være skrevet før priority 90 inner middleware");
  const result = await next();
  order.push("day_post");
  return result;
}, 90);

function resetFor(event) {
  pendingEvent = event;
  inbox = [{ status: "pending", event }];
  state = {
    consumed: {},
    mail_runtime_v1: {
      version: 1,
      role_plan_id: "fixture_plan",
      role_scope: "fixture_scope",
      career_id: "fixture_category",
      step_index: 0,
      consumed_ids: [],
      history: []
    },
    mail_system: {
      role_plan_id: "fixture_plan",
      step_index: 0,
      consumed_mail_ids: [],
      history: []
    }
  };
  active = {
    career_id: "fixture_category",
    role_id: "fixture_role",
    role_key: "fixture_scope",
    title: "Fixture Scope"
  };
}

(async () => {
  resetFor(plannedEvent("mail_success"));
  failAnswer = false;
  brandApplyCount = 0;
  order.length = 0;

  const engine = new MockEventEngine();
  const success = await engine.answer("mail_success", "A");
  assert.equal(success.ok, true);
  assert.equal(success.choice_director?.interaction_mode, "decision");
  assert.equal(success.brand_consequence?.fixture, "brand_consequence", "brandkonsekvens skal fortsatt legges på vellykket resultat");
  assert.equal(brandApplyCount, 1);
  assert.equal(state.consumed?.mail_success, true, "planned mail skal markeres consumed før inner answer");
  assert.equal(state.mail_runtime_v1?.step_index, 1);
  assert.equal(state.mail_runtime_v1?.career_id, "fixture_category");
  assert.equal(state.mail_runtime_v1?.role_scope, "fixture_scope");
  assert.equal(inbox[0]?.event?.id, "fixture_thread", "triggered thread skal erstatte pending mail etter success");
  assert.equal(inbox[0]?.event?._triggered_by, "mail_success");
  assert.equal(inbox[0]?.event?._triggered_choice, "A");
  assert.equal(inbox[0]?.event?.phase_tag, "afternoon");
  assert.deepEqual(order, [
    "outcome_pre",
    "runtime_pre",
    "day_pre",
    "base",
    "day_post",
    "brand_post",
    "thread_post",
    "outcome_post"
  ]);

  const middlewareOrder = Array.from(
    director.listAnswerMiddlewares(),
    (entry) => [String(entry.name), Number(entry.priority)]
  );
  assert.deepEqual(middlewareOrder, [
    ["choice_contract", 20],
    ["career_outcome_runtime", 70],
    ["mail_runtime", 80],
    ["day_patches", 90]
  ]);
  assert.equal(
    director.listAnswerMiddlewares().filter((entry) => entry.name === "mail_runtime").length,
    1,
    "MailRuntime middleware-registrering skal være idempotent"
  );

  // Preserve historical no-rollback semantics: the pre-answer planned/thread state
  // remains advanced even if the inner answer reports failure. Post-success effects do not run.
  resetFor(plannedEvent("mail_failure"));
  failAnswer = true;
  brandApplyCount = 0;
  order.length = 0;

  const failed = await engine.answer("mail_failure", "A");
  assert.equal(failed.ok, false);
  assert.equal(failed.reason, "fixture_failure");
  assert.equal(state.consumed?.mail_failure, true, "feilet inner svar skal beholde historisk pre-answer consumed-state");
  assert.equal(state.mail_runtime_v1?.step_index, 1, "feilet inner svar skal beholde historisk pre-answer step advance");
  assert.equal(brandApplyCount, 0, "feilet svar skal ikke anvende brandkonsekvens");
  assert.equal(inbox[0]?.event?.id, "mail_failure", "feilet svar skal ikke enqueue triggered thread");
  assert.deepEqual(order, [
    "outcome_pre",
    "runtime_pre",
    "day_pre",
    "base",
    "day_post",
    "outcome_post"
  ]);

  console.log("civication-choice-director-mail-runtime-middleware.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
