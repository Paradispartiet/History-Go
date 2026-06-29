const assert = require("assert");
const fs = require("fs");
const { JSDOM } = require("jsdom");

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "https://example.test/" });
const { window } = dom;
global.window = window;
global.CustomEvent = window.CustomEvent;
global.console = console;
window.HG_CARAVAN = {
  routes: [{ id: "route_italia", title: "Italia" }],
  stages: [{ id: "stage_1", route_id: "route_italia", from_node: "oslo", to_node: "halden" }],
  nodes: [{ id: "oslo", title: "Oslo" }, { id: "halden", title: "Halden" }],
  events: [{ id: "event_1", title: "Sjøpassasje", choices: [{ id: "ferry", label: "Ta ferge" }] }],
  indexes: { nodesById: {} }
};
window.HG_CARAVAN.indexes.nodesById = Object.fromEntries(window.HG_CARAVAN.nodes.map((node) => [node.id, node]));
window.eval(fs.readFileSync("js/caravan-progress.js", "utf8"));
window.eval(fs.readFileSync("js/caravan-resources.js", "utf8"));
window.eval(fs.readFileSync("js/caravan-event-log.js", "utf8"));
window.eval(fs.readFileSync("js/caravan-consequences.js", "utf8"));
window.eval(fs.readFileSync("js/caravan-diary.js", "utf8"));

assert.deepStrictEqual(window.HG_CARAVAN_DIARY.getEntries("route_italia", "all"), [], "empty localStorage gives empty diary");
window.HG_CARAVAN_PROGRESS.setProgress("route_italia", "stage_1", "hest", "started");
window.HG_CARAVAN_EVENT_LOG.setChoice("route_italia", "stage_1", "event_1", "hest", "ferry");
window.HG_CARAVAN_RESOURCES.setResource("route_italia", "hest", "energi", 80);
window.localStorage.setItem("HG_CARAVAN_CONSEQUENCES_V1", JSON.stringify({ version: 1, applied: { route_italia: { stage_1: { event_1: { hest: { choice_id: "ferry", appliedAt: "2026-01-01T00:00:00.000Z", effects: { hvile: 10, energi: -5 } } } } } } }));

const hest = window.HG_CARAVAN_DIARY.getRouteDiary("route_italia", "hest");
assert(hest.some((entry) => entry.type === "progress" && entry.title.includes("Oslo → Halden")), "diary includes progress with stage title");
assert(hest.some((entry) => entry.type === "event_choice" && entry.title.includes("Sjøpassasje: Ta ferge")), "diary includes event choice");
assert(hest.some((entry) => entry.type === "consequence" && entry.title.includes("Konsekvens brukt")), "diary includes consequence");
assert(hest.some((entry) => entry.type === "resources" && entry.title.includes("Energi 80")), "diary includes resource status");
assert.strictEqual(window.HG_CARAVAN_DIARY.getRouteDiary("route_italia", "sykkel").length, 0, "mode filter only returns selected mode");
assert.strictEqual(window.HG_CARAVAN_DIARY.summary("route_italia", "all").eventChoices, 1, "summary counts all modes");
assert.strictEqual(window.HG_CARAVAN_DIARY.exportJson("route_italia", "hest").mode, "hest", "exportJson returns JSON object");

window.localStorage.setItem("HG_CARAVAN_PROGRESS_V1", "{bad json");
assert.doesNotThrow(() => window.HG_CARAVAN_DIARY.getEntries("route_italia", "all"), "corrupt module storage does not crash diary");
console.log("PASS: caravan diary test completed.");
