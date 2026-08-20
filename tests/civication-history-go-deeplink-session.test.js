#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const deepLinkPath = path.join(root, "js/Civication/ui/CivicationHistoryGoDeepLink.js");

global.window = global;
global.document = undefined;
global.location = { href: "https://example.test/Civication.html#inbox" };
global.localStorage = (() => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(String(k)) ? m.get(String(k)) : null),
    setItem: (k, v) => m.set(String(k), String(v)),
    removeItem: (k) => m.delete(String(k)),
    clear: () => m.clear()
  };
})();

vm.runInThisContext(fs.readFileSync(deepLinkPath, "utf8"), { filename: deepLinkPath });
const DL = global.CivicationHistoryGoDeepLink;
assert(DL, "deep link API exposed");

const task = {
  id: "task_1",
  mail_id: "mail_1",
  role_id: "reporter",
  role_label: "Reporter",
  task_payload: {
    task_kind: "history_go_knowledge",
    target_type: "knowledge",
    target_id: "quiz_press",
    quiz_id: "quiz_press",
    category_id: "media",
    emne_id: "kildekritikk",
    completion_mode: "quiz_completed",
    title: "Vurder kilden",
    description: "Bygg faglig grunnlag før du svarer."
  }
};

const session = DL.startSession(task);
assert(session, "session stored");
assert.strictEqual(session.task_id, "task_1");
assert.strictEqual(session.role_label, "Reporter");
assert.strictEqual(session.quiz_id, "quiz_press");
assert.strictEqual(session.return_href, "Civication.html#inbox");

const stored = JSON.parse(global.localStorage.getItem(DL.SESSION_KEY));
assert.strictEqual(stored.title, "Vurder kilden");
assert.strictEqual(stored.emne_id, "kildekritikk");

const link = DL.resolve(task.task_payload);
assert.strictEqual(link.href, "index.html#/quiz/quiz_press");

console.log("civication history-go deeplink session ok");
