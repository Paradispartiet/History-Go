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
  badges: [{ id: "caravan_first_stage", title: "Første etappe", description: "Fullfør én etappe.", category: "progress", icon: "🏁", criteria_type: "completed_stage_count", criteria: { count: 1 }, visible: true, sort_order: 1 }, { id: "caravan_horse_started", title: "Hestekaravane startet", description: "Start med hest.", category: "mode", icon: "🐴", criteria_type: "started_stage_count", criteria: { mode: "hest", count: 1 }, visible: true, sort_order: 2 }, { id: "caravan_ferry_crossing", title: "Sjøpassasjen", description: "Logg ferry.", category: "event", icon: "⛴️", criteria_type: "event_type_choice_logged", criteria: { event_type: "ferry", count: 1 }, visible: true, sort_order: 3 }],
  events: [{ id: "event_1", route_id: "route_italia", stage_id: "stage_1", title: "Trelleborg → Rostock", event_type: "ferry", severity: "medium", applies_to_modes: ["hest", "sykkel"], prompt: "Planlegg passasje.", choices: [{ id: "wait", label: "Vent", resource_effects_by_mode: { hest: { hvile: 10, hestehelse: 5, energi: -5 } } }, { id: "ferry", label: "Ta ferge og planlegg dyretransport", resource_effects_by_mode: { hest: { hvile: 5, hestehelse: 3 } } }] }],
  indexes: { stagesByRoute: { route_italia: [{ id: "stage_1", route_id: "route_italia", order: 1, from_node: "oslo", to_node: "roma", allowed_modes: ["til_fots", "hest", "sykkel"], approximate_distance_km: 10 }] }, nodesById: {}, eventsByStage: { stage_1: [{ id: "event_1", route_id: "route_italia", stage_id: "stage_1", title: "Trelleborg → Rostock", event_type: "ferry", severity: "medium", applies_to_modes: ["hest", "sykkel"], prompt: "Planlegg passasje.", choices: [{ id: "wait", label: "Vent", resource_effects_by_mode: { hest: { hvile: 10, hestehelse: 5, energi: -5 } } }, { id: "ferry", label: "Ta ferge og planlegg dyretransport", resource_effects_by_mode: { hest: { hvile: 5, hestehelse: 3 } } }] }] }, badgesById: {}, badgesByCategory: {}, eventsById: {}, eventsByRoute: { route_italia: [{ id: "event_1", route_id: "route_italia", stage_id: "stage_1", title: "Trelleborg → Rostock", event_type: "ferry", severity: "medium", applies_to_modes: ["hest", "sykkel"], prompt: "Planlegg passasje.", choices: [{ id: "wait", label: "Vent", resource_effects_by_mode: { hest: { hvile: 10, hestehelse: 5, energi: -5 } } }, { id: "ferry", label: "Ta ferge og planlegg dyretransport", resource_effects_by_mode: { hest: { hvile: 5, hestehelse: 3 } } }] }] } }
};
window.HG_CARAVAN.indexes.nodesById = Object.fromEntries(window.HG_CARAVAN.nodes.map((node) => [node.id, node]));
window.HG_CARAVAN.indexes.eventsById = Object.fromEntries(window.HG_CARAVAN.events.map((event) => [event.id, event]));
window.HG_CARAVAN.indexes.badgesById = Object.fromEntries(window.HG_CARAVAN.badges.map((badge) => [badge.id, badge]));
window.eval(fs.readFileSync("js/caravan-progress.js", "utf8"));
window.eval(fs.readFileSync("js/caravan-resources.js", "utf8"));
window.eval(fs.readFileSync("js/caravan-event-log.js", "utf8"));
window.eval(fs.readFileSync("js/caravan-consequences.js", "utf8"));
window.eval(fs.readFileSync("js/caravan-diary.js", "utf8"));
window.eval(fs.readFileSync("js/caravan-badges.js", "utf8"));
window.eval(fs.readFileSync("js/ui/caravan-panel.js", "utf8"));

window.HG_CARAVAN_UI_DEBUG.open("route_italia");
window.HG_CARAVAN_UI_DEBUG.previewStage("stage_1");
assert([...document.querySelectorAll("[data-caravan-progress-status]")].every((btn) => btn.disabled), "all mode disables progress buttons");
assert(document.body.textContent.includes("Velg Til fots, Hest eller Sykkel for å lagre progresjon"), "all mode renders mode hint");
assert(document.body.textContent.includes("Velg Til fots, Hest eller Sykkel for å lagre valg"), "all mode renders event choice hint");
assert(document.body.textContent.includes("Velg Til fots, Hest eller Sykkel for å se reisestatus"), "all mode hides resource controls behind mode hint");
assert(document.body.textContent.includes("Merker"), "badges section renders");
assert(document.body.textContent.includes("0/3 låst opp"), "badges section starts locked");
assert.strictEqual(document.querySelectorAll("[data-caravan-resource-adjust]").length, 0, "all mode has no resource buttons");
assert.strictEqual(document.querySelectorAll("button[data-caravan-event-choice]").length, 0, "all mode keeps event choices read-only");
window.HG_CARAVAN_UI_DEBUG.setTravelMode("hest");
assert([...document.querySelectorAll("[data-caravan-progress-status]")].every((btn) => !btn.disabled), "hest mode enables progress buttons");
assert(document.querySelectorAll("button[data-caravan-event-choice]").length >= 2, "hest mode makes event choices clickable");
assert(document.body.textContent.includes("Reisestatus — Hest"), "hest mode shows resource status");
assert(document.body.textContent.includes("Dagbok"), "diary section is visible");
assert(document.body.textContent.includes("Hestehelse"), "hest mode shows horse health");
assert(!document.body.textContent.includes("Sykkelstand"), "hest mode does not show bicycle condition");
window.HG_CARAVAN_UI_DEBUG.adjustResource("energi", -10);
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getResources().energi, 90, "debug API adjusts resources");
assert(window.HG_CARAVAN_UI_DEBUG.getDiary("route_italia", "hest").some((entry) => entry.type === "resources"), "diary includes resource status after resource write");
window.HG_CARAVAN_UI_DEBUG.setResource("energi", 999);
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getResources().energi, 100, "resource values clamp to 100");
window.HG_CARAVAN_UI_DEBUG.adjustResource("energi", -999);
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getResources().energi, 0, "resource values clamp to 0");
window.HG_CARAVAN_UI_DEBUG.resetResources();
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getResources().energi, 100, "reset restores resources to 100");
window.HG_CARAVAN_UI_DEBUG.setTravelMode("sykkel");
assert(document.body.textContent.includes("Sykkelstand"), "sykkel mode shows bicycle condition");
assert(!document.body.textContent.includes("Hestehelse"), "sykkel mode does not show horse health");
window.HG_CARAVAN_UI_DEBUG.setTravelMode("til_fots");
assert(document.body.textContent.includes("Reisestatus — Til fots"), "walking mode shows resource status");
assert(!document.body.textContent.includes("Hestehelse"), "walking mode does not show horse health");
assert(!document.body.textContent.includes("Sykkelstand"), "walking mode does not show bicycle condition");
window.HG_CARAVAN_UI_DEBUG.setTravelMode("hest");
window.HG_CARAVAN_UI_DEBUG.setEventChoice("event_1", "wait");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getEventChoice("event_1").choice_id, "wait", "debug API reads event choice");
assert(document.querySelector(".hg-caravan-event-choice.is-active"), "selected choice is visually marked");
assert(document.body.textContent.includes("+10 Hvile"), "selected mode shows resource effects");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getChoiceEffects("event_1", "wait").hvile, 10, "debug API reads choice effects");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.applyChoiceEffects("event_1", "wait").effects.hvile, 10, "debug API applies effects");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getResources().hvile, 100, "resource effects clamp at 100");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getResources().energi, 95, "negative resource effect is applied");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.applyChoiceEffects("event_1", "wait"), null, "same event/mode cannot apply twice");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getAppliedConsequence("event_1").choice_id, "wait", "debug API reads applied consequence");
assert(window.HG_CARAVAN_UI_DEBUG.getDiary("route_italia", "hest").some((entry) => entry.type === "consequence"), "diary includes applied consequences");
window.HG_CARAVAN_UI_DEBUG.clearAppliedConsequence("event_1");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getAppliedConsequence("event_1"), null, "debug API clears applied marker only");
assert(document.body.textContent.includes("1 valg"), "stage list shows logged choice count");
assert(document.body.textContent.includes("Italia: 1 valg logget"), "route list shows logged choice count");
assert(document.body.textContent.includes("Logg"), "log section is visible");
assert(window.HG_CARAVAN_UI_DEBUG.getDiary("route_italia", "hest").some((entry) => entry.type === "event_choice"), "diary includes event choices");
window.HG_CARAVAN_UI_DEBUG.setEventChoice("event_1", "ferry");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getEventChoice("event_1").choice_id, "ferry", "new choice overwrites old choice");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getRouteEventLog("route_italia", "hest").length, 1, "only one active event choice per event/mode is stored");
window.HG_CARAVAN_UI_DEBUG.clearEventChoice("event_1");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getEventChoice("event_1"), null, "debug API clears event choice");
window.HG_CARAVAN_UI_DEBUG.setStageProgress("stage_1", "completed");
assert(window.HG_CARAVAN_UI_DEBUG.getUnlockedBadges().caravan_first_stage, "debug API exposes first stage badge unlock");
assert(document.body.textContent.includes("Låst opp"), "badge unlocked state renders");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getStageProgress("stage_1").status, "completed", "debug API reads completed status");
assert(document.body.textContent.includes("Fullført"), "stage list or preview renders completed status");
assert(document.body.textContent.includes("1/1 etapper fullført"), "route summary renders selected-mode completion");
assert(window.HG_CARAVAN_UI_DEBUG.getDiary("route_italia", "hest").some((entry) => entry.type === "progress"), "diary includes stage progress");
assert(window.HG_CARAVAN_UI_DEBUG.getStageDiary("stage_1", "route_italia", "hest").some((entry) => entry.stage_id === "stage_1"), "stage diary includes selected stage entries");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.exportDiaryJson("route_italia", "hest").summary.route_id, "route_italia", "debug API exports diary JSON");
window.HG_CARAVAN_UI_DEBUG.clearStageProgress("stage_1");
assert.strictEqual(window.HG_CARAVAN_UI_DEBUG.getStageProgress("stage_1"), null, "debug API clears status");
console.log("PASS: caravan progress UI test completed.");
