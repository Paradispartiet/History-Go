#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
let state = { job_learning_progress: { role_a: { steps: 3 } }, social_standing: { by_audience: {} } };
global.window = global;
global.CivicationState = {
  getState: () => state,
  setState(patch) { state = { ...state, ...patch }; return state; }
};
vm.runInThisContext(fs.readFileSync(path.join(root, "js/Civication/systems/civicationSkills.js"), "utf8"));
const skills = global.CivicationSkills;
assert.strictEqual(skills.DEFINITIONS.length, 6, "six Skills are defined");
assert.strictEqual(skills.getViewModel(state).documented_count, 0, "unknown Skills are not fabricated");
assert(skills.getViewModel(state).skills.every(x => x.score === null && !x.measured));

const candidate = {
  source: "canonical_scene_choice",
  event_id: "scene_42",
  choice_id: "listen",
  activity_type: "listening_and_negotiating",
  skill_id: "social_awareness",
  delta: 2
};
assert.strictEqual(skills.practicePatch(state, { ...candidate, source: "history_go_quiz" }).applied, false);
assert.strictEqual(skills.practicePatch(state, { ...candidate, event_id: "" }).applied, false);
assert.strictEqual(skills.practicePatch(state, { ...candidate, choice_id: "" }).applied, false);
assert.strictEqual(skills.practicePatch(state, { ...candidate, skill_id: "money" }).applied, false);
assert.strictEqual(skills.practicePatch(state, { ...candidate, delta: 100 }).applied, false);
assert.strictEqual(skills.practicePatch(state, { ...candidate, activity_type: "" }).applied, false);

const bridgeHandlers = {};
global.CivicationChoiceDirector = {
  registerHandler(name, fn) { bridgeHandlers[name] = fn; return true; }
};
vm.runInThisContext(fs.readFileSync(path.join(root, "js/Civication/systems/civicationSkillsPracticeBridge.js"), "utf8"));
const bridge = bridgeHandlers.documented_skills_practice;
assert(bridge, "uses the canonical choice director");
const context = {
  eventId: "scene_42", choiceId: "listen", result: { ok: true },
  choice: { skills_practice: { skill_id: "social_awareness", delta: 2, activity_type: "listening_and_negotiating" } }
};
assert.strictEqual(bridge({ ...context, choice: {} }), null, "no implicit credits");
assert.strictEqual(bridge({ ...context, result: { ok: false } }), null, "failed choice gives no credit");
const first = bridge(context);
assert(first.applied);
assert.strictEqual(first.after, 2);
assert.strictEqual(skills.getViewModel(state).documented_count, 1);
assert.strictEqual(skills.getViewModel(state).skills.find(x => x.id === "social_awareness").score, 2);
assert.strictEqual(bridge(context).reason, "already_counted", "replaying the same choice is idempotent");
assert.strictEqual(bridge({ ...context, choiceId: "different" }).reason, "already_counted", "same event cannot earn again");
assert.strictEqual(state.job_learning_progress.role_a.steps, 3, "existing job learning untouched");
assert.deepStrictEqual(state.social_standing, { by_audience: {} }, "situated reputation untouched");

// Persisted JSON is sufficient to retain skills and dedup on a new page load.
const restored = JSON.parse(JSON.stringify(state));
assert.strictEqual(skills.practicePatch(restored, candidate).reason, "already_counted");
const nearCap = { skills_v1: { scores: { agency: 99 }, applied_event_ids: {} } };
const final = skills.practicePatch(nearCap, { ...candidate, skill_id: "agency", event_id: "new_scene", delta: 3 });
assert.strictEqual(final.after, 100, "score is clamped to 0–100");
assert.strictEqual(skills.render(), false, "no browser DOM required to compute Skills");
console.log("civication Skills evidence and replay checks ok");
