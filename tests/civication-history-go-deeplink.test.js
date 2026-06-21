#!/usr/bin/env node
// Verifies CivicationHistoryGoDeepLink.resolve(): maps a normalized History Go task_payload
// to a real index.html route, and returns null for modes with no safe route (no dead links).

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const taskEnginePath = path.join(root, "js/Civication/core/civicationTaskEngine.js");
const deepLinkPath = path.join(root, "js/Civication/ui/CivicationHistoryGoDeepLink.js");

global.window = global;
global.document = undefined; // exercise the no-document guard
global.console = { ...console, warn() {} };
global.localStorage = (() => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(String(k)) ? m.get(String(k)) : null),
    setItem: (k, v) => m.set(String(k), String(v)),
    removeItem: (k) => m.delete(String(k)),
    clear: () => m.clear()
  };
})();

vm.runInThisContext(fs.readFileSync(taskEnginePath, "utf8"), { filename: taskEnginePath });
vm.runInThisContext(fs.readFileSync(deepLinkPath, "utf8"), { filename: deepLinkPath });

const DL = global.CivicationHistoryGoDeepLink;
const norm = global.CivicationTaskEngine.normalizeHistoryGoTaskPayload;

assert(DL && typeof DL.resolve === "function", "deep link module exposes resolve");

// place -> #/place/:id
{
  const link = DL.resolve(norm({ task_kind: "history_go_place", target_type: "place", place_id: "akershus_festning", completion_mode: "visit_place" }));
  assert.ok(link, "place resolves");
  assert.strictEqual(link.href, "index.html#/place/akershus_festning", "place href");
  assert.strictEqual(link.target_type, "place");
}

// knowledge with quiz -> #/quiz/:id
{
  const link = DL.resolve(norm({ task_kind: "history_go_knowledge", target_type: "knowledge", quiz_id: "quiz_oslo_1", completion_mode: "quiz_completed" }));
  assert.ok(link, "knowledge+quiz resolves");
  assert.strictEqual(link.href, "index.html#/quiz/quiz_oslo_1", "quiz href");
}

// person with quiz -> #/quiz/:id
{
  const link = DL.resolve(norm({ task_kind: "history_go_person", target_type: "person", person_id: "p1", quiz_id: "quiz_p1", completion_mode: "person_quiz" }));
  assert.ok(link, "person+quiz resolves");
  assert.strictEqual(link.href, "index.html#/quiz/quiz_p1", "person quiz href");
}

// unlock with required_kind place -> #/place/:id
{
  const link = DL.resolve(norm({ task_kind: "history_go_unlock", target_type: "unlock", unlock_id: "akershus_festning", required_kind: "place", completion_mode: "unlocked" }));
  assert.ok(link, "unlock(place) resolves");
  assert.strictEqual(link.href, "index.html#/place/akershus_festning", "unlock place href");
}

// id is URL-encoded
{
  const link = DL.resolve(norm({ task_kind: "history_go_place", target_type: "place", place_id: "a b/c", completion_mode: "visit_place" }));
  assert.strictEqual(link.href, "index.html#/place/a%20b%2Fc", "place id encoded");
}

// No safe route -> null (no dead links)
{
  // person without quiz (open_person has no route)
  assert.strictEqual(
    DL.resolve(norm({ task_kind: "history_go_person", target_type: "person", person_id: "p1", completion_mode: "open_person" })),
    null,
    "person without quiz -> null"
  );
  // knowledge without quiz (category only)
  assert.strictEqual(
    DL.resolve(norm({ task_kind: "history_go_knowledge", target_type: "knowledge", category_id: "historie", completion_mode: "read_leksikon" })),
    null,
    "knowledge category-only -> null"
  );
  // debate has no route
  assert.strictEqual(
    DL.resolve(norm({ task_kind: "history_go_debate", target_type: "debate", debate_id: "d1", completion_mode: "position_chosen" })),
    null,
    "debate -> null"
  );
  // junk
  assert.strictEqual(DL.resolve(null), null, "null payload -> null");
  assert.strictEqual(DL.resolve({}), null, "empty payload -> null");
}

console.log("civication history-go deeplink ok");
