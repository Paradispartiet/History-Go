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
  events: [{ id: "event_1", route_id: "route_italia", stage_id: "stage_1", title: "Trelleborg → Rostock", event_type: "ferry", severity: "medium", applies_to_modes: ["hest", "sykkel"], prompt: "Planlegg passasje.", choices: [{ id: "wait", label: "Vent" }, { id: "ferry", label: "Ta ferge og planlegg dyretransport" }] }],
  indexes: { stagesByRoute: { route_italia: [{ id: "stage_1", route_id: "route_italia", order: 1, from_node: "oslo", to_node: "roma", allowed_modes: ["til_fots", "hest", "sykkel"], approximate_distance_km: 10 }] }, nodesById: {}, eventsByStage: { stage_1: [{ id: "event_1", route_id: "route_italia", stage_id: "stage_1", title: "Trelleborg → Rostock", event_type: "ferry", severity: "medium", applies_to_modes: ["hest", "sykkel"], prompt: "Planlegg passasje.", choices: [{ id: "wait", label: "Vent" }, { id: "ferry", label: "Ta ferge og planlegg dyretransport" }] }] }, eventsByRoute: { route_italia: [{ id: "event_1", route_id: "route_italia", stage_id: "stage_1", title: "Trelleborg → Rostock", event_type: "ferry", severity: "medium", applies_to_modes: ["hest", "sykkel"], prompt: "Planlegg passasje.", choices: [{ id: "wait", label: "Vent" }, { id: "ferry", label: "Ta ferge og planlegg dyretransport" }] }] } }
};
window.HG_CARAVAN.indexes.nodesById = Object.fromEntries(window.HG_CARAVAN.nodes.map((node) => [node.id, node]));
window.eval(fs.readFileSync("js/caravan-progress.js", "utf8"));
window.eval(fs.readFileSync("js/caravan-event-log.js", "utf8"));
window.eval(fs.readFileSync("js/ui/caravan-panel.js", "utf8"));

window.HG_CARAVAN_UI_DEBUG.open("route_italia");
window.HG_CARAVAN_UI_DEBUG.previewStage("stage_1");
assert([...document.querySelectorAll("[data-caravan-progress-status]")].every((btn) => btn.disabled), "all mode disables progress buttons");
assert(document.body.textContent.includes("Velg Til fots, Hest eller Sykkel for å lagre progresjon"), "all mode renders mode hint");
assert(document.body.textContent.includes("Velg Til fots, Hest eller Sykkel for å lagre valg"), "all mode renders event choice hint");
assert.strictEqual(document.querySelectorAll("button[data-caravan-event-choice]").length, 0, "all mode keeps event choices read-only");
window.HG_CARAVAN_UI_DEBUG.setTravelMode("hest");
assert([...document.querySelectorAll("[data-caravan-progress-status]")].every((btn) => !btn.disabled), "hest mode enables progress buttons");
assert(document.querySelectorAll("button[data-caravan-event-choice]").length >= 2, "hest mode makes event choices clickable");
window.HG_CARAVAN_UI_DEBUG.setEventChoice("event_1", "wait");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getEventChoice("event_1").choice_id, "wait", "debug API reads event choice");
assert(document.querySelector(".hg-caravan-event-choice.is-active"), "selected choice is visually marked");
assert(document.body.textContent.includes("1 valg"), "stage list shows logged choice count");
assert(document.body.textContent.includes("Italia: 1 valg logget"), "route list shows logged choice count");
assert(document.body.textContent.includes("Logg"), "log section is visible");
window.HG_CARAVAN_UI_DEBUG.setEventChoice("event_1", "ferry");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getEventChoice("event_1").choice_id, "ferry", "new choice overwrites old choice");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getRouteEventLog("route_italia", "hest").length, 1, "only one active event choice per event/mode is stored");
window.HG_CARAVAN_UI_DEBUG.clearEventChoice("event_1");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getEventChoice("event_1"), null, "debug API clears event choice");
window.HG_CARAVAN_UI_DEBUG.setStageProgress("stage_1", "completed");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getStageProgress("stage_1").status, "completed", "debug API reads completed status");
assert(document.body.textContent.includes("Fullført"), "stage list or preview renders completed status");
assert(document.body.textContent.includes("1/1 etapper fullført"), "route summary renders selected-mode completion");
window.HG_CARAVAN_UI_DEBUG.clearStageProgress("stage_1");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getStageProgress("stage_1"), null, "debug API clears status");
console.log("PASS: caravan progress UI test completed.");
