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

let pendingEvent = null;
let baseAnswerCalls = 0;
let customHandlerCalls = 0;

function MockEventEngine() {}
MockEventEngine.prototype.getPendingEvent = function () {
  return pendingEvent ? { status: "pending", event: pendingEvent } : null;
};
MockEventEngine.prototype.answer = async function (eventId, choiceId) {
  baseAnswerCalls += 1;
  if (!pendingEvent || String(pendingEvent.id || "") !== String(eventId || "")) {
    return { ok: false, reason: "not_found" };
  }
  if (Array.isArray(pendingEvent.choices) && pendingEvent.choices.length) {
    const choice = pendingEvent.choices.find((candidate) => (
      candidate && String(candidate.id || "") === String(choiceId || "")
    ));
    if (!choice) return { ok: false, reason: "bad_choice" };
  }
  return { ok: true, effect: 0, feedback: "ok" };
};

const state = {};
const windowObject = {
  CivicationEventEngine: MockEventEngine,
  CivicationState: {
    getActivePosition: () => ({ career_id: "fixture", role_key: "fixture_role" }),
    getState: () => state,
    setState(next) { Object.assign(state, next || {}); }
  }
};
windowObject.window = windowObject;

const documentObject = {
  readyState: "complete",
  addEventListener() {}
};

const context = vm.createContext({
  window: windowObject,
  document: documentObject,
  console,
  Array,
  Object,
  String,
  Number,
  Promise,
  Set,
  Map
});

vm.runInContext(interactionSource, context, { filename: interactionPath });
vm.runInContext(directorSource, context, { filename: directorPath });

const director = windowObject.CivicationChoiceDirector;
assert(director, "CivicationChoiceDirector skal registreres");
assert.equal(director.version, 1);

director.registerHandler("fixture_handler", () => {
  customHandlerCalls += 1;
  return { handled: true };
}, 50);

const engine = new MockEventEngine();

(async () => {
  pendingEvent = {
    id: "bad_decision",
    interaction_mode: "decision",
    choices: [{ id: "A", label: "Bare ett valg" }]
  };
  let result = await engine.answer("bad_decision", "A");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "decision_requires_two_choices");
  assert.equal(result.interaction_mode, "decision");
  assert.equal(result.choice_director.blocked, true);
  assert.equal(baseAnswerCalls, 0, "ugyldig decision skal blokkeres før legacy svarmutasjon");

  pendingEvent = {
    id: "passive_info",
    interaction_mode: "info",
    choices: []
  };
  result = await engine.answer("passive_info", null);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "interaction_not_actionable");
  assert.equal(result.interaction_mode, "info");
  assert.equal(baseAnswerCalls, 0, "info skal ikke kunne løses via legacy answer");

  pendingEvent = {
    id: "ack_one",
    interaction_mode: "ack",
    choices: [{ id: "OK", label: "Bekreft" }]
  };
  result = await engine.answer("ack_one", "OK");
  assert.equal(result.ok, true);
  assert.equal(result.choice_director.blocked, false);
  assert.equal(result.choice_director.interaction_mode, "ack");
  assert.equal(result.choice_director.choice_id, "OK");
  assert.equal(baseAnswerCalls, 1);
  assert.equal(customHandlerCalls, 1, "reelt ack-valg skal gå gjennom handlerregisteret");

  result = await engine.answer("ack_one", "WRONG");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "bad_choice");
  assert.equal(baseAnswerCalls, 1, "feil ack-valg skal blokkeres før legacy answer");
  assert.equal(customHandlerCalls, 1);

  pendingEvent = {
    id: "task_without_choice",
    interaction_mode: "task",
    task_contract: {
      task_id: "deliver_fixture",
      completion_rule: "Lever et eksplisitt beslutningsgrunnlag"
    },
    choices: []
  };
  result = await engine.answer("task_without_choice", null);
  assert.equal(result.ok, true, "gyldig task uten choice skal beholde eksisterende task-svarsti");
  assert.equal(result.choice_director.interaction_mode, "task");
  assert.equal(result.choice_director.choice_id, null);
  assert.deepEqual(Array.from(result.choice_director.handler_results), []);
  assert.equal(baseAnswerCalls, 2);
  assert.equal(customHandlerCalls, 1, "choice-handlere skal ikke kjøres uten et reelt valg");

  pendingEvent = {
    id: "task_with_choices",
    interaction_mode: "task",
    task_contract: {
      task_id: "deliver_with_choice",
      completion_rule: "Lever med valgt strategi"
    },
    choices: [
      { id: "A", label: "Grundig" },
      { id: "B", label: "Raskt" }
    ]
  };
  result = await engine.answer("task_with_choices", "B");
  assert.equal(result.ok, true);
  assert.equal(result.choice_director.interaction_mode, "task");
  assert.equal(result.choice_director.choice_id, "B");
  assert.equal(baseAnswerCalls, 3);
  assert.equal(customHandlerCalls, 2);

  pendingEvent = {
    id: "unknown_mode",
    interaction_mode: "mystery",
    choices: [{ id: "A", label: "A" }, { id: "B", label: "B" }]
  };
  result = await engine.answer("unknown_mode", "A");
  assert.equal(result.ok, false);
  assert.equal(result.reason, "unknown_interaction_mode");
  assert.equal(baseAnswerCalls, 3);

  pendingEvent = {
    id: "other_pending_info",
    interaction_mode: "info",
    choices: []
  };
  result = await engine.answer("missing_event", null);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "not_found", "ID-mismatch skal fortsatt eies av underliggende EventEngine");
  assert.equal(baseAnswerCalls, 4);

  const inspected = director.validateAnswer({
    id: "decision_ok",
    interaction_mode: "decision",
    choices: [{ id: "A", label: "A" }, { id: "B", label: "B" }]
  }, "A");
  assert.equal(inspected.ok, true);
  assert.equal(inspected.interaction.mode, "decision");
  assert.equal(inspected.choice.id, "A");

  console.log("civication-choice-director-answer-boundary.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
