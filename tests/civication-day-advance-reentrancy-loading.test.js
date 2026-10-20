#!/usr/bin/env node
// The shared day cannot skip ahead during asynchronous queue delivery, or
// while Min dag has a mounted but not-yet-loaded Life Story.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.resolve(__dirname, "..");
function load(file) {
  vm.runInThisContext(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
}
async function main() {
  global.window = global;
  global.Event = class Event { constructor(type) { this.type = type; } };
  global.dispatchEvent = () => {};
  global.addEventListener = () => {};
  let phase = "day_end";
  let day = 2;
  let advanced = 0;
  let enqueued = 0;
  let unblock;
  global.CivicationCalendar = {
    DAY_PHASES: ["morning", "day_end"],
    getPhase: () => phase,
    getClock: () => ({ dayIndex: day }),
    advancePhase: () => {
      advanced++;
      if (phase === "day_end") { phase = "morning"; day++; }
      else phase = "day_end";
    }
  };
  global.CivicationState = { getActivePosition: () => null, getInbox: () => [] };
  global.CivicationDailyMailBuilder = {
    inspect: () => ({ runtime: { items: [] } }),
    enqueueNext: () => { enqueued++; return new Promise(resolve => { unblock = resolve; }); }
  };
  load("js/Civication/systems/day/dayProgressionController.js");
  const first = global.CivicationDayProgression.advancePhaseIfReady();
  assert.equal(advanced, 1, "first call commits one day rollover");
  assert.equal(day, 3);
  assert.equal(enqueued, 1, "new day's queue was requested");
  const duplicate = await global.CivicationDayProgression.advancePhaseIfReady();
  assert.deepEqual(duplicate, { advanced: false, reason: "advance_in_flight" });
  assert.equal(advanced, 1, "second click cannot skip to another phase");
  assert.equal(day, 3);
  unblock({ enqueued: true });
  assert.equal((await first).advanced, true);
  // The guard must release after the async work is complete.
  global.CivicationDailyMailBuilder.enqueueNext = async () => { enqueued++; };
  assert.equal((await global.CivicationDayProgression.advancePhaseIfReady()).advanced, true);
  assert.equal(advanced, 2);
  assert.equal(phase, "day_end");

  // A mounted Min dag is a blocker while its content/state loads, not an
  // absent story. A page without Min dag still supports the canonical day.
  let hasPanel = true;
  global.document = {
    readyState: "loading",
    addEventListener() {},
    getElementById(id) { return id === "civiLifestoryPanel" && hasPanel ? {} : null; }
  };
  global.location = { search: "" };
  global.localStorage = { getItem() { return null; }, setItem() {} };
  load("js/Civication/ui/CivicationLifestoryUI.js");
  assert.equal(global.CivicationLifestoryUI.getDaySyncState()?.dagFerdig, false,
    "an uninitialized but mounted story blocks rollover");
  assert.deepEqual(await global.CivicationDayProgression.advancePhaseIfReady(),
    { advanced: false, reason: "lifestory_day_incomplete" });
  assert.equal(advanced, 2, "loading gate prevents rolling a second day");
  hasPanel = false;
  assert.equal(global.CivicationLifestoryUI.getDaySyncState(), null,
    "pages without the story panel do not block day progression");
  assert.equal((await global.CivicationDayProgression.advancePhaseIfReady()).advanced, true);
  assert.equal(day, 4);
  console.log("civication day advance lock and Life Story loading gate ok");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
