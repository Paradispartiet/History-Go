const assert = require("assert");
const fs = require("fs");
const { JSDOM } = require("jsdom");

const dom = new JSDOM('<!doctype html><html><body><button id="btnKaravane">Karavane</button></body></html>', { url: "https://example.test/" });
const { window } = dom;
global.window = window;
global.document = window.document;
global.CustomEvent = window.CustomEvent;
global.console = console;
window.HG_CARAVAN = {
  routes: [{ id: "route_italia", title: "Italia" }],
  stages: [{ id: "stage_1", route_id: "route_italia", order: 1, from_node: "oslo", to_node: "roma", allowed_modes: ["til_fots", "hest", "sykkel"], approximate_distance_km: 10 }],
  nodes: [{ id: "oslo", title: "Oslo", lat: 59.9, lng: 10.7 }, { id: "roma", title: "Roma", lat: 41.9, lng: 12.5 }],
  indexes: { stagesByRoute: { route_italia: [{ id: "stage_1", route_id: "route_italia", order: 1, from_node: "oslo", to_node: "roma", allowed_modes: ["til_fots", "hest", "sykkel"], approximate_distance_km: 10 }] }, nodesById: {} }
};
window.HG_CARAVAN.indexes.nodesById = Object.fromEntries(window.HG_CARAVAN.nodes.map((node) => [node.id, node]));
window.eval(fs.readFileSync("js/caravan-progress.js", "utf8"));
window.eval(fs.readFileSync("js/ui/caravan-panel.js", "utf8"));

window.HG_CARAVAN_UI_DEBUG.open("route_italia");
window.HG_CARAVAN_UI_DEBUG.previewStage("stage_1");
assert([...document.querySelectorAll("[data-caravan-progress-status]")].every((btn) => btn.disabled), "all mode disables progress buttons");
assert(document.body.textContent.includes("Velg Til fots, Hest eller Sykkel for å lagre progresjon"), "all mode renders mode hint");
window.HG_CARAVAN_UI_DEBUG.setTravelMode("hest");
assert([...document.querySelectorAll("[data-caravan-progress-status]")].every((btn) => !btn.disabled), "hest mode enables progress buttons");
window.HG_CARAVAN_UI_DEBUG.setStageProgress("stage_1", "completed");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getStageProgress("stage_1").status, "completed", "debug API reads completed status");
assert(document.body.textContent.includes("Fullført"), "stage list or preview renders completed status");
assert(document.body.textContent.includes("1/1 etapper fullført"), "route summary renders selected-mode completion");
window.HG_CARAVAN_UI_DEBUG.clearStageProgress("stage_1");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getStageProgress("stage_1"), null, "debug API clears status");
console.log("PASS: caravan progress UI test completed.");
