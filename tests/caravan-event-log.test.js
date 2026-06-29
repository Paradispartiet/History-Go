const assert = require("assert");
const fs = require("fs");
const { JSDOM } = require("jsdom");

function load() {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/" });
  const { window } = dom;
  global.window = window;
  global.document = window.document;
  global.CustomEvent = window.CustomEvent;
  window.eval(fs.readFileSync("js/caravan-event-log.js", "utf8"));
  return window;
}

let window = load();
const api = window.HG_CARAVAN_EVENT_LOG;
assert.deepStrictEqual(api.getAll().entries, [], "empty localStorage starts with an empty log");
assert.strictEqual(api.setChoice("route_italia", "stage_1", "event_1", "all", "wait"), null, "all mode cannot be stored");
assert.strictEqual(api.setChoice("route_italia", "stage_1", "event_1", "hest", "wait").choice_id, "wait", "valid mode stores choice");
assert.strictEqual(api.getChoice("route_italia", "stage_1", "event_1", "hest").choice_id, "wait", "getChoice returns stored choice");
api.setChoice("route_italia", "stage_1", "event_1", "hest", "ferry");
assert.strictEqual(api.getChoice("route_italia", "stage_1", "event_1", "hest").choice_id, "ferry", "new choice overwrites same route/stage/event/mode");
assert.strictEqual(api.getRouteLog("route_italia", "hest").length, 1, "only one active choice is kept for same event/mode");
api.setChoice("route_italia", "stage_2", "event_2", "sykkel", "repair");
assert.deepStrictEqual(api.summary("route_italia", "all"), { route_id: "route_italia", mode: "all", choices: 2, stagesWithChoices: 2, eventsWithChoices: 2 }, "summary counts route choices across modes");
assert.strictEqual(api.clearChoice("route_italia", "stage_1", "event_1", "hest"), null, "clearChoice returns null");
assert.strictEqual(api.getChoice("route_italia", "stage_1", "event_1", "hest"), null, "clearChoice removes stored choice");

window.localStorage.setItem("HG_CARAVAN_EVENT_LOG_V1", "{bad json");
const warnings = [];
const originalWarn = console.warn;
console.warn = (...args) => warnings.push(args);
assert.deepStrictEqual(api.getAll().entries, [], "corrupt localStorage resets to an empty log");
console.warn = originalWarn;
assert(warnings.some((args) => String(args[0]) === "[HG_CARAVAN_EVENT_LOG]"), "corrupt localStorage logs prefixed warning");
assert.strictEqual(window.localStorage.getItem("HG_CARAVAN_EVENT_LOG_V1"), null, "corrupt localStorage key is removed");

console.log("PASS: caravan event log test completed.");
