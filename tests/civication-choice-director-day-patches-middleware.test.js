#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const sourcePath = path.join(repoRoot, "js/Civication/systems/day/dayPatches.js");
const source = fs.readFileSync(sourcePath, "utf8");

assert.doesNotMatch(source, /proto\.answer\s*=/, "dayPatches skal ikke tilordne EventEngine.answer direkte");
assert.match(source, /ANSWER_MIDDLEWARE_NAME\s*=\s*"day_patches"/);
assert.match(source, /ANSWER_MIDDLEWARE_PRIORITY\s*=\s*90/);
assert.match(source, /dayPatchesAnswerMiddleware\(ctx, proceed\)/);

let pendingEvent = null;
let active = { role_id: "fixture_role", career_id: "fixture_career" };
let inbox = [];
let onboardingPatch = null;
let phaseMutations = 0;
const dispatched = [];

function MockEventEngine() {}
MockEventEngine.prototype.answer = async function () { return { ok: true, base: true }; };
MockEventEngine.prototype.onAppOpen = async function () { return { enqueued: false }; };
const baseAnswer = MockEventEngine.prototype.answer;

const windowObject = {
  CivicationEventEngine: MockEventEngine,
  CivicationState: {
    getActivePosition() { return active; },
    getOnboardingState() { return { complete: false }; },
    setOnboardingState(_active, patch) { onboardingPatch = { ...(patch || {}) }; return onboardingPatch; }
  },
  CivicationCalendar: {
    getPhase() { return "morning"; },
    markDailyFlag() { phaseMutations += 1; },
    setPhase() { phaseMutations += 1; }
  },
  dispatchEvent(event) { dispatched.push(event?.type || ""); return true; },
  addEventListener() {}
};
windowObject.window = windowObject;
const context = vm.createContext({
  window: windowObject,
  document: { readyState: "complete", addEventListener() {} },
  console, Array, Object, String, Number, Promise, Date, Error, JSON,
  Event: class Event { constructor(type) { this.type = type; } }
});
vm.runInContext(source, context, { filename: sourcePath });

assert.equal(MockEventEngine.prototype.answer, baseAnswer, "dayPatches skal la original answer stå urørt");
const queue = windowObject.__civicationChoiceAnswerMiddlewareQueue;
assert(Array.isArray(queue));
const entries = queue.filter((entry) => entry?.name === "day_patches");
assert.equal(entries.length, 1);
assert.equal(entries[0].priority, 90);

function makeEngine() {
  const engine = new MockEventEngine();
  engine.getPendingEvent = () => pendingEvent ? { status: "pending", event: pendingEvent } : null;
  engine.getInbox = () => inbox;
  engine.setInbox = (next) => { inbox = Array.isArray(next) ? next : []; };
  engine.enqueueImmediateFollowupEvent = async () => ({ enqueued: true, original: true });
  return engine;
}

(async () => {
  pendingEvent = {
    id: "fixture_failure_event",
    phase_tag: "morning",
    choices: [{ id: "fixture_choice", label: "Fixture" }]
  };
  inbox = [{ status: "pending", event: pendingEvent }];
  phaseMutations = 0;
  const failedEngine = makeEngine();
  const originalFollowup = failedEngine.enqueueImmediateFollowupEvent;
  let sawSuppression = false;
  const failed = await entries[0].fn(
    { engine: failedEngine, eventId: pendingEvent.id, choiceId: "fixture_choice" },
    async () => {
      sawSuppression = failedEngine.enqueueImmediateFollowupEvent !== originalFollowup;
      const blocked = await failedEngine.enqueueImmediateFollowupEvent();
      assert.equal(blocked.reason, "day_phase_blocked");
      return { ok: false, reason: "fixture_failure" };
    }
  );
  assert.equal(sawSuppression, true);
  assert.equal(failedEngine.enqueueImmediateFollowupEvent, originalFollowup);
  assert.equal(failed.ok, false);
  assert.equal(phaseMutations, 0);
  assert.equal(inbox.length, 1);

  pendingEvent = {
    id: "fixture_onboarding_event",
    mail_class: "onboarding",
    onboarding_tag: "first_job_intro",
    phase_tag: "morning",
    choices: [{ id: "fixture_choice", label: "Fixture" }]
  };
  inbox = [{ status: "pending", event: pendingEvent }];
  onboardingPatch = null;
  const onboardingEngine = makeEngine();
  const onboardingFollowup = onboardingEngine.enqueueImmediateFollowupEvent;
  const success = await entries[0].fn(
    { engine: onboardingEngine, eventId: pendingEvent.id, choiceId: "fixture_choice" },
    async () => ({ ok: true, feedback: "fixture", effect: 1 })
  );
  assert.equal(success.ok, true);
  assert.deepEqual(onboardingPatch, { intro_done: true });
  assert.equal(inbox.length, 0);
  assert.equal(onboardingEngine.enqueueImmediateFollowupEvent, onboardingFollowup);
  assert(dispatched.includes("updateProfile"));

  console.log("civication-choice-director-day-patches-middleware.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
