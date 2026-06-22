#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repoRoot = path.resolve(__dirname, "..");
const store = {};

function load(rel) {
  vm.runInThisContext(fs.readFileSync(path.join(repoRoot, rel), "utf8"), { filename: rel });
}

function resetStore() {
  Object.keys(store).forEach((key) => delete store[key]);
}

function readJson(key, fallback) {
  try { return JSON.parse(store[key] || "") || fallback; } catch { return fallback; }
}

function writeJson(key, value) {
  store[key] = JSON.stringify(value);
}

global.window = {
  addEventListener() {},
  dispatchEvent() { return true; },
  localStorage: {
    getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; }
  },
  HGAha: { getProfileIdSync: () => "local-user" }
};
global.localStorage = global.window.localStorage;
global.document = {
  addEventListener() {},
  getElementById() { return null; },
  createElement() { return { setAttribute() {}, appendChild() {}, querySelectorAll: () => [], querySelector: () => null }; },
  body: { appendChild() {} }
};

load("js/hgSocialPrivacy.js");
load("js/knowledgeMatch.js");

function check(name, fn) {
  resetStore();
  fn();
  console.log(`✓ ${name}`);
}

check("privacy/report/block operations refresh HG_SOCIAL_INDEX", () => {
  const initialIndex = window.HG_SOCIAL_INDEX;
  window.savePrivacySettings("local-user", { visibleInMatchLists: true });
  assert.notStrictEqual(window.HG_SOCIAL_INDEX, initialIndex, "savePrivacySettings should replace the index object");
  assert.strictEqual(window.HG_SOCIAL_INDEX.privacySettings["local-user"].visibleInMatchLists, true);

  const afterPrivacy = window.HG_SOCIAL_INDEX;
  window.blockUser("local-user", "target-user");
  assert.notStrictEqual(window.HG_SOCIAL_INDEX, afterPrivacy, "blockUser should refresh index");
  assert.deepStrictEqual(window.HG_SOCIAL_INDEX.blocks["local-user"], ["target-user"]);

  const afterBlock = window.HG_SOCIAL_INDEX;
  const report = window.reportUser("local-user", "target-user", "Spam");
  assert.notStrictEqual(window.HG_SOCIAL_INDEX, afterBlock, "reportUser should refresh index");
  assert.strictEqual(window.HG_SOCIAL_INDEX.reports[0].status, "open");

  const afterReport = window.HG_SOCIAL_INDEX;
  window.resolveReport(report.reportId);
  assert.notStrictEqual(window.HG_SOCIAL_INDEX, afterReport, "resolveReport should refresh index");
  assert.strictEqual(window.HG_SOCIAL_INDEX.reports[0].status, "resolved");
});

check("upsertRelation preserves existing relation lists while adding new trust evidence", () => {
  writeJson("hg_public_profile_v1", { userId: "local-user", publicProfile: true });
  writeJson("hg_social_log_v1", {
    userId: "local-user",
    relations: [{
      userId: "friend-user",
      metAtSpots: ["old-spot"],
      sharedQuizzes: ["old-quiz"],
      sharedRoutes: ["old-route"],
      sharedObservations: ["old-observation"],
      repeatedMeetCount: 2
    }]
  });

  const route = window.createSharedRoute({ participants: ["friend-user"], spots: ["new-spot"] });
  window.completeSharedRoute(route.routeId);
  const quiz = window.startSharedQuiz({ placeId: "new-spot", participants: ["friend-user"] });
  window.completeSharedQuiz(quiz.sharedQuizId, { ok: true });
  window.createSharedObservation({ spotId: "new-spot", users: ["local-user", "friend-user"], observations: ["detail"] });

  const relation = readJson("hg_social_log_v1", {}).relations.find((row) => row.userId === "friend-user");
  assert.deepStrictEqual(relation.metAtSpots, ["old-spot"], "route/quiz/observation updates must not wipe metAtSpots");
  assert(relation.sharedRoutes.includes("old-route"));
  assert(relation.sharedRoutes.includes(route.routeId));
  assert(relation.sharedQuizzes.includes("old-quiz"));
  assert(relation.sharedQuizzes.includes(quiz.sharedQuizId));
  assert(relation.sharedObservations.includes("old-observation"));
  assert(relation.sharedObservations.some((id) => id.startsWith("obs-")));
  assert.strictEqual(relation.repeatedMeetCount, 2, "non-meet updates should not lower repeatedMeetCount");
});
