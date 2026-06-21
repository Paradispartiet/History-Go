#!/usr/bin/env node
// Verifies the Civication <- History Go completion bridge:
// reconcile-on-open matching, idempotency, evidence-only completion, test-mode isolation.
// See docs/CIVICATION_HISTORY_GO_COMPLETION_BRIDGE.md.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const taskEnginePath = path.join(root, "js/Civication/core/civicationTaskEngine.js");
const bridgePath = path.join(root, "js/Civication/systems/civicationHistoryGoTaskBridge.js");

function createLocalStorage() {
  const store = new Map();
  return {
    getItem(key) {
      key = String(key);
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    }
  };
}

// Minimal window/document shim with synchronous reconcile (no rAF/timeout).
function freshEnv() {
  const listeners = {};
  const dispatched = [];
  global.window = global;
  // Reset per-case globals so state (e.g. test-mode flag) doesn't leak between cases.
  global.CivicationState = undefined;
  global.localStorage = createLocalStorage();
  global.document = {
    readyState: "complete",
    addEventListener() {},
    visibilityState: "visible"
  };
  global.requestAnimationFrame = undefined;
  global.setTimeout = (fn) => fn();
  global.console = { ...console, warn() {}, error() {} };

  global.addEventListener = function (name, fn) {
    (listeners[name] = listeners[name] || []).push(fn);
  };
  global.dispatchEvent = function (evt) {
    dispatched.push(evt);
    (listeners[evt.type] || []).forEach((fn) => fn(evt));
    return true;
  };
  global.CustomEvent = class {
    constructor(type, init) {
      this.type = type;
      this.detail = (init && init.detail) || null;
    }
  };
  global.Event = class {
    constructor(type) {
      this.type = type;
    }
  };

  vm.runInThisContext(fs.readFileSync(taskEnginePath, "utf8"), { filename: taskEnginePath });
  vm.runInThisContext(fs.readFileSync(bridgePath, "utf8"), { filename: bridgePath });

  return { dispatched };
}

function seedOpenTask(payload, mailId = "mail_1") {
  const store = global.CivicationTaskEngine.getStore();
  const taskId = `task_${mailId}`;
  store.byId[taskId] = {
    id: taskId,
    mail_id: mailId,
    status: "open",
    task_payload: global.CivicationTaskEngine.normalizeHistoryGoTaskPayload(payload)
  };
  store.byMailId[mailId] = taskId;
  store.order = [taskId];
  global.CivicationTaskEngine.setStore(store);
  return taskId;
}

function getTask(taskId) {
  return global.CivicationTaskEngine.getTaskById(taskId);
}

function results() {
  return JSON.parse(global.localStorage.getItem("hg_civi_task_results_v1") || "{}");
}

// --- 1. Cross-page reconcile: visited place satisfies an open place task ---
{
  freshEnv();
  const taskId = seedOpenTask({
    task_kind: "history_go_place",
    target_type: "place",
    place_id: "akershus_festning",
    completion_mode: "visit_place"
  });
  global.localStorage.setItem("visited_places", JSON.stringify(["akershus_festning"]));

  const marked = global.CivicationHistoryGoTaskBridge.reconcile();
  assert.strictEqual(marked, 1, "one task marked");

  const task = getTask(taskId);
  assert.ok(task.history_go && task.history_go.completed_at, "history_go.completed_at set");
  assert.strictEqual(task.history_go.correct, true, "visit_place is correct");
  assert.strictEqual(task.history_go.completion_source, "visited_places", "source recorded");
  assert.strictEqual(task.status, "open", "status stays open (mail answer owns it)");
  assert.strictEqual(results()[taskId], 1, "result mirrored as 1");
}

// --- 2. Idempotency: second reconcile makes no change and no extra dispatch ---
{
  const env = freshEnv();
  const taskId = seedOpenTask({
    task_kind: "history_go_knowledge",
    target_type: "knowledge",
    quiz_id: "quiz_oslo_1",
    completion_mode: "correct_answer"
  });
  global.localStorage.setItem("hg_unlocks_v1", JSON.stringify({ byQuiz: { quiz_oslo_1: { quizId: "quiz_oslo_1" } } }));

  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 1, "first marks");
  const completedAt = getTask(taskId).history_go.completed_at;
  const dispatchCountAfterFirst = env.dispatched.filter((e) => e.type === "civi:taskHistoryGoCompleted").length;

  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 0, "second marks nothing");
  assert.strictEqual(getTask(taskId).history_go.completed_at, completedAt, "completed_at unchanged");
  const dispatchCountAfterSecond = env.dispatched.filter((e) => e.type === "civi:taskHistoryGoCompleted").length;
  assert.strictEqual(dispatchCountAfterSecond, dispatchCountAfterFirst, "no extra completion event");
}

// --- 3. Negative: place_quiz visited-but-not-quizzed -> correct:false ---
{
  freshEnv();
  const taskId = seedOpenTask({
    task_kind: "history_go_place",
    target_type: "place",
    place_id: "stortinget",
    quiz_id: "quiz_stortinget",
    completion_mode: "place_quiz"
  });
  global.localStorage.setItem("visited_places", JSON.stringify(["stortinget"]));
  // no unlock for quiz_stortinget

  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 1, "marked on visit");
  const task = getTask(taskId);
  assert.strictEqual(task.history_go.correct, false, "visited without quiz is correct:false");
  assert.strictEqual(results()[taskId], 0, "result mirrored as 0");
}

// --- 4. No false completion: task with no matching HG state stays open ---
{
  freshEnv();
  const taskId = seedOpenTask({
    task_kind: "history_go_place",
    target_type: "place",
    place_id: "akershus_festning",
    completion_mode: "visit_place"
  });
  // visited_places empty
  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 0, "nothing marked");
  assert.strictEqual(getTask(taskId).history_go, undefined, "no history_go written");
}

// --- 5. Debate: stays open without signal, completes once the debate log has a position ---
{
  freshEnv();
  const taskId = seedOpenTask({
    task_kind: "history_go_debate",
    target_type: "debate",
    debate_id: "debate_1",
    completion_mode: "position_chosen"
  });
  // no hg_debate_log_v1 yet
  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 0, "debate not satisfiable yet");
  assert.strictEqual(getTask(taskId).history_go, undefined, "debate stays open without signal");

  // participation without a position does not satisfy position_chosen
  global.localStorage.setItem("hg_debate_log_v1", JSON.stringify({ byId: { debate_1: { id: "debate_1", debateId: "debate_1", participated: true, position: null } } }));
  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 0, "participation alone != position_chosen");

  // now a position is recorded -> completes
  global.localStorage.setItem("hg_debate_log_v1", JSON.stringify({ byId: { debate_1: { id: "debate_1", debateId: "debate_1", participated: true, position: "industri" } } }));
  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 1, "position_chosen satisfied");
  const task = getTask(taskId);
  assert.strictEqual(task.history_go.correct, true, "debate position is correct");
  assert.strictEqual(task.history_go.completion_source, "debate_log", "source is debate_log");
}

// --- 6. Test mode: reconcile writes nothing ---
{
  freshEnv();
  const taskId = seedOpenTask({
    task_kind: "history_go_place",
    target_type: "place",
    place_id: "akershus_festning",
    completion_mode: "visit_place"
  });
  global.localStorage.setItem("visited_places", JSON.stringify(["akershus_festning"]));
  global.window.CivicationState = { isTestMode: () => true };

  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 0, "no-op in test mode");
  assert.strictEqual(getTask(taskId).history_go, undefined, "no write in test mode");
}

// --- 7. Ownership: bridge does not write hg_civi_tasks_v1 directly ---
{
  freshEnv();
  const src = fs.readFileSync(bridgePath, "utf8");
  assert.ok(
    !/localStorage\.setItem\(\s*["']hg_civi_tasks_v1/.test(src),
    "bridge never writes the task store directly"
  );
}

// --- 8. read_story: completes when a story for the place is logged ---
{
  freshEnv();
  const taskId = seedOpenTask({
    task_kind: "history_go_place",
    target_type: "place",
    place_id: "akershus_festning",
    completion_mode: "read_story"
  });
  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 0, "read_story not satisfiable yet");
  global.localStorage.setItem("hg_reads_v1", JSON.stringify({ stories: { s1: { id: "s1", placeId: "akershus_festning" } } }));
  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 1, "read_story satisfied by story for place");
  assert.strictEqual(getTask(taskId).history_go.completion_source, "reads_story", "source reads_story");
}

// --- 9. open_person: completes when the person is logged as opened ---
{
  freshEnv();
  const taskId = seedOpenTask({
    task_kind: "history_go_person",
    target_type: "person",
    person_id: "p1",
    completion_mode: "read_profile"
  });
  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 0, "person not opened yet");
  global.localStorage.setItem("hg_reads_v1", JSON.stringify({ persons: { p1: { id: "p1" } } }));
  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 1, "read_profile satisfied");
  assert.strictEqual(getTask(taskId).history_go.completion_source, "reads_person", "source reads_person");
}

// --- 10. read_leksikon: completes on emne match ---
{
  freshEnv();
  const taskId = seedOpenTask({
    task_kind: "history_go_knowledge",
    target_type: "knowledge",
    emne_id: "e1",
    completion_mode: "read_leksikon"
  });
  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 0, "leksikon not read yet");
  global.localStorage.setItem("hg_reads_v1", JSON.stringify({ leksikon: { lx1: { id: "lx1", emneId: "e1" } } }));
  assert.strictEqual(global.CivicationHistoryGoTaskBridge.reconcile(), 1, "read_leksikon satisfied by emne");
  assert.strictEqual(getTask(taskId).history_go.completion_source, "reads_leksikon", "source reads_leksikon");
}

console.log("civication history-go task bridge ok");
