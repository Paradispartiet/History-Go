#!/usr/bin/env node
// A2: Life Story and Civication share ONE calendar rollover. The shell owns
// mail/weekly processing, the workday runtime owns completed shifts, and
// the role-local story only advances after the calendar has advanced.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");
const ROOT = path.join(__dirname, "..");
const LOAD = [
  "js/Civication/civicationV2Config.js",
  "js/Civication/core/CivicationStorageAdapter.js",
  "js/Civication/core/civicationJsonStore.js",
  "js/Civication/core/civicationCalendar.js",
  "js/Civication/systems/day/dayCalendarBridge.js",
  "js/Civication/lifestory/lifestoryContent.js",
  "js/Civication/lifestory/lifestoryState.js",
  "js/Civication/lifestory/lifestoryRunner.js",
  "js/Civication/lifestory/lifestoryEndings.js",
  "js/Civication/lifestory/lifestoryShellBridge.js",
  "js/Civication/ui/CivicationLifestoryActions.js",
  "js/Civication/ui/CivicationLifestoryUI.js",
  "js/Civication/systems/day/dayProgressionController.js",
  "js/Civication/systems/civicationWorkdayRuntime.js",
  "js/Civication/systems/civicationDayFlow.js"
];
const delay = () => new Promise(resolve => setTimeout(resolve, 0));
async function waitFor(fn, label) {
  for (let n = 0; n < 150; n++) {
    if (fn()) return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  throw new Error("Timed out: " + label);
}
async function start() {
  const dom = new JSDOM('<!doctype html><body>'
    + '<header id="civiLifestoryHeaderStatus"></header>'
    + '<section id="civiLifestoryPanel"></section></body>', {
    url: "https://example.test/Civication.html",
    runScripts: "outside-only"
  });
  const { window } = dom;
  window.fetch = async resource => {
    const file = path.join(ROOT, String(resource).replace(/^\.?\//, ""));
    if (!fs.existsSync(file)) return { ok: false, status: 404 };
    return { ok: true, status: 200, json: async () => JSON.parse(fs.readFileSync(file, "utf8")) };
  };

  let shellState = {};
  let activePosition = null;
  window.CivicationState = {
    getState: () => shellState,
    setState: patch => (shellState = { ...shellState, ...patch }),
    getActivePosition: () => activePosition,
    getInbox: () => []
  };
  const counters = { weeklySave: 0, weeklyFinalize: 0, enqueue: 0, workdayCompleted: 0 };
  window.saveDailySummaryToWeek = () => { counters.weeklySave++; };
  window.finalizeWeekIfNeeded = () => { counters.weeklyFinalize++; };
  window.CivicationDailyMailBuilder = {
    inspect: () => ({ runtime: { items: [] } }),
    enqueueNext: async () => { counters.enqueue++; }
  };
  window.CivicationMailEngine = { getInbox: () => [] };
  window.addEventListener("civi:workdayCompleted", () => { counters.workdayCompleted++; });
  for (const file of LOAD) window.eval(fs.readFileSync(path.join(ROOT, file), "utf8"));
  const panel = window.document.getElementById("civiLifestoryPanel");
  const current = () => JSON.parse(window.localStorage.getItem("civication_lifestory_v1"));
  const calendar = window.CivicationCalendar;
  await waitFor(() => panel.querySelector("[data-lifestory-choice]") && current(), "Life Story first scene");
  return {
    window, dom, panel, current, calendar, counters,
    setJob: pos => { activePosition = pos; }
  };
}
async function playDay(app) {
  let choices = 0;
  while (app.panel.querySelector("[data-lifestory-choice]")) {
    app.panel.querySelector("[data-lifestory-choice]").click();
    assert.ok(++choices < 50, "one story day terminates");
  }
  assert.equal(app.current().dagFerdig, true);
  return choices;
}
async function main() {
  const app = await start();
  const { calendar, counters, window, panel } = app;
  assert.equal(calendar.getClock().dayIndex, 1);
  assert.equal(app.current().kalenderDag, 1, "checkpoint initializes against shell calendar");

  // The mail day cannot roll over while a Life Story choice is incomplete.
  calendar.setPhase("day_end");
  const blocked = await window.CivicationDayProgression.advancePhaseIfReady();
  assert.deepEqual(blocked, { advanced: false, reason: "lifestory_day_incomplete" });
  assert.equal(calendar.getClock().dayIndex, 1);
  assert.equal(counters.weeklySave, 0);
  assert.equal(counters.enqueue, 0);

  calendar.setPhase("morning");
  await playDay(app);
  const archived = app.current().arkiv.length;
  assert.ok(archived > 0, "day one choices are stored");

  // Pressing the story next-day button cannot bypass required shell actions.
  panel.querySelector("[data-lifestory-next-day]").click();
  await delay();
  assert.equal(app.current().dag, 1);
  assert.equal(calendar.getClock().dayIndex, 1);
  assert.match(panel.textContent, /Fullfør dagens jobb/);

  // Finishing the shell day rolls the calendar and the story exactly once.
  calendar.setDailySummary({ choiceLog: [{ id: "daily-choice" }] });
  calendar.setPhase("day_end");
  panel.querySelector("[data-lifestory-next-day]").click();
  await waitFor(() => app.current().dag === 2, "single rollover");
  assert.equal(calendar.getClock().dayIndex, 2);
  assert.equal(app.current().kalenderDag, 2);
  assert.equal(app.current().livsdag, 2);
  assert.equal(app.current().arkiv.length, archived, "archived choices survived");
  assert.deepEqual({ ...counters }, {
    weeklySave: 1, weeklyFinalize: 1, enqueue: 1, workdayCompleted: 0
  }, "weekly review and inbox queue were emitted once; no fake workday");
  assert.equal(app.current().dagFerdig, false, "next Life Story day is playable");

  // An active employment position must still require a real workday.
  app.setJob({ career_id: "renholder", role_key: "renholder", brand_id: "test_brand" });
  const workday = window.CivicationWorkdayRuntime;
  const flow = window.CivicationDayFlow;
  assert.equal(workday.getWorkdayDayIndex(), 0);
  assert.equal(flow.getNextAction(flow.getFlowState()), "go_to_work");
  const started = flow.goToWork();
  assert.equal(started.ok, true);
  assert.equal(workday.getWorkdayDayIndex(), 0, "starting job does not award a workday");
  flow.finishWorkday();
  flow.finishWorkday();
  assert.equal(workday.getWorkdayDayIndex(), 1, "double completion is idempotent");
  assert.equal(counters.workdayCompleted, 1);
  assert.equal(calendar.getClock().dayIndex, 2, "finishing a shift is not a day rollover");
  assert.equal(app.current().dag, 2, "job workday does not start the next Life Story chapter");

  // In a new evening, shell's NextAction rollover also advances the story.
  await playDay(app);
  calendar.setPhase("day_end");
  const result = await window.CivicationDayProgression.advancePhaseIfReady();
  assert.equal(result.advanced, true);
  assert.equal(calendar.getClock().dayIndex, 3);
  assert.equal(app.current().dag, 3, "shell-only rollover synchronizes story");
  assert.equal(app.current().livsdag, 3);
  assert.equal(counters.weeklyFinalize, 2);
  assert.equal(counters.enqueue, 2);
  assert.equal(counters.workdayCompleted, 1);
  assert.equal(app.current().kalenderDag, 3);

  app.dom.window.close();
  console.log("civication lifestory day sync ok (shell blocks, calendar rolls once, workday idempotent)");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
