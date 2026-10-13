#!/usr/bin/env node
// A1 regression: a real shell job role switch must not erase Min dag progress.
// Uses the production content, UI event, role resolver hook and localStorage.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const STORAGE_KEY = "civication_lifestory_v1";
const SCRIPTS = [
  "js/Civication/core/CivicationStorageAdapter.js",
  "js/Civication/core/civicationJsonStore.js",
  "js/Civication/lifestory/lifestoryContent.js",
  "js/Civication/lifestory/lifestoryState.js",
  "js/Civication/lifestory/lifestoryRunner.js",
  "js/Civication/lifestory/lifestoryEndings.js",
  "js/Civication/lifestory/lifestoryShellBridge.js",
  "js/Civication/ui/CivicationLifestoryActions.js",
  "js/Civication/ui/CivicationLifestoryUI.js"
];

async function waitUntil(check, label) {
  for (let attempt = 0; attempt < 150; attempt++) {
    if (check()) return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw new Error("Timed out waiting for " + label);
}

async function boot(previousSave = null, initialPosition = null) {
  const dom = new JSDOM(
    '<!doctype html><html><body><header id="civiLifestoryHeaderStatus"></header>'
    + '<section id="civiLifestoryPanel"></section></body></html>',
    { url: "https://example.test/Civication.html", runScripts: "outside-only" }
  );
  const { window } = dom;
  if (previousSave) window.localStorage.setItem(STORAGE_KEY, previousSave);
  window.fetch = async (resource) => {
    const relative = String(resource).replace(/^\.?\//, "");
    const absolute = path.join(ROOT, relative);
    if (!fs.existsSync(absolute)) return { ok: false, status: 404 };
    return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(absolute, "utf8")) };
  };
  let position = initialPosition;
  window.CivicationState = { getActivePosition: () => position };
  // The production content resolver translates this canonical career scope
  // through the actual lifestory manifest, not a test-only role mapping.
  window.CivicationCareerRoleResolver = { resolveCareerRoleScope: active => active.scope };
  for (const filename of SCRIPTS) {
    window.eval(fs.readFileSync(path.join(ROOT, filename), "utf8"));
  }

  const current = () => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  };
  const panel = window.document.getElementById("civiLifestoryPanel");
  await waitUntil(() => !!current() && !!panel.querySelector(".civi-lifestory-status-chip"), "Min dag startup");

  async function takeJob(scope) {
    position = { career_id: scope, role_key: scope, title: scope, scope };
    window.dispatchEvent(new window.Event("updateProfile"));
    await waitUntil(() => current()?.rolle === scope, "job role " + scope);
  }
  function choose() {
    const button = panel.querySelector("[data-lifestory-choice]");
    assert.ok(button, "current role has a playable choice");
    button.click();
    return current();
  }
  return { window, dom, current, panel, takeJob, choose };
}

async function main() {
  const app = await boot();
  assert.equal(app.current().rolle, "arbeidsledig", "fresh profile begins unemployed");
  let steps = 0;
  while (app.panel.querySelector("[data-lifestory-choice]")) {
    app.choose();
    assert.ok(++steps < 50, "unemployed first day terminates");
  }
  assert.ok(app.panel.querySelector("[data-lifestory-next-day]"), "player can complete day 1");
  app.panel.querySelector("[data-lifestory-next-day]").click();
  const unemployed = app.current();
  assert.equal(unemployed.dag, 2, "first role has real saved day progression");
  assert.equal(unemployed.livsdag, 2, "shared story lifetime counts day transition");
  assert.ok(unemployed.arkiv.length > 0, "previous choices are archived");
  const oldHistory = JSON.stringify(unemployed.arkiv);

  await app.takeJob("renholder");
  let switched = app.current();
  assert.equal(switched.rolle, "renholder");
  assert.equal(switched.dag, 1, "new job has its own chapter day");
  assert.equal(switched.livsdag, 2, "job change does not reset global lifetime");
  assert.equal(switched.rolleTilstander.arbeidsledig.dag, 2);
  assert.equal(JSON.stringify(switched.rolleTilstander.arbeidsledig.arkiv), oldHistory);

  app.choose();
  const cleanerHistory = JSON.stringify(app.current().arkiv);
  assert.ok(JSON.parse(cleanerHistory).length, "new job created its own story progress");

  await app.takeJob("ekspeditor");
  switched = app.current();
  assert.equal(switched.livsdag, 2, "second job switch is not an extra day");
  assert.equal(JSON.stringify(switched.rolleTilstander.renholder.arkiv), cleanerHistory);
  assert.equal(JSON.stringify(switched.rolleTilstander.arbeidsledig.arkiv), oldHistory);
  app.choose();
  const clerkHistory = JSON.stringify(app.current().arkiv);

  await app.takeJob("renholder");
  switched = app.current();
  assert.equal(switched.dag, 1, "returning to earlier job resumes local chapter day");
  assert.equal(JSON.stringify(switched.arkiv), cleanerHistory, "earlier job choices return");
  assert.equal(JSON.stringify(switched.rolleTilstander.ekspeditor.arkiv), clerkHistory);
  assert.equal(JSON.stringify(switched.rolleTilstander.arbeidsledig.arkiv), oldHistory);
  assert.deepEqual(switched.rolleBytter.map(event => event.til),
    ["renholder", "ekspeditor", "renholder"], "job transitions are recorded");
  assert.ok(!("renholder" in switched.rolleTilstander), "active role is stored only at the top level");
  assert.ok(Object.values(switched.rolleTilstander).every(snapshot => !("rolleTilstander" in snapshot)),
    "inactive snapshots are not recursively nested");

  const previous = app.window.localStorage.getItem(STORAGE_KEY);
  const savedTransitions = switched.rolleBytter.length;
  app.dom.window.close();
  const resumed = await boot(previous, { career_id: "renholder", role_key: "renholder", scope: "renholder" });
  await waitUntil(() => resumed.current()?.rolle === "renholder", "reload restores active role");
  assert.equal(resumed.current().rolleBytter.length, savedTransitions,
    "reload does not make a fake unemployed/job switch");
  assert.equal(JSON.stringify(resumed.current().arkiv), cleanerHistory, "reload preserves active progress");
  assert.equal(JSON.stringify(resumed.current().rolleTilstander.arbeidsledig.arkiv), oldHistory,
    "reload preserves the first role's entire archive");
  assert.equal(JSON.stringify(resumed.current().rolleTilstander.ekspeditor.arkiv), clerkHistory,
    "reload preserves third role's choices");
  resumed.dom.window.close();

  // Existing flat v2 saves migrate on first role change, without changing
  // the legacy STORAGE_KEY or losing archive, chapter and relationship fields.
  const State = require("../js/Civication/lifestory/lifestoryState.js");
  const legacy = { ...unemployed };
  delete legacy.livsdag;
  delete legacy.rolleTilstander;
  delete legacy.rolleBytter;
  legacy.kapittelArkiv = [{ tittel: "Tidligere kapittel", fraDag: 1, tilDag: 7 }];
  legacy.fortsettelseId = "old-chapter";
  legacy.fortsettelser = ["old-chapter"];
  const next = State.selectRole(legacy, {
    role: { id: "renholder", startState: { meters: {}, relasjoner: {} } },
    faser: [{ id: "morgen" }], threads: []
  });
  assert.equal(next.livsdag, 2);
  assert.equal(next.rolleTilstander.arbeidsledig.fortsettelseId, "old-chapter");
  assert.deepEqual(next.rolleTilstander.arbeidsledig.kapittelArkiv, legacy.kapittelArkiv);
  assert.deepEqual(next.rolleTilstander.arbeidsledig.relasjoner, legacy.relasjoner);
  console.log("civication lifestory job-role persistence ok (job changes, reload, legacy migration)");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
