import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";

const read = path => readFileSync(path, "utf8");
const app = read("js/app.js");
const card = read("js/ui/place-card.js");

test("canonical Note, Observation and Routes APIs load before place selection", () => {
  const after = (snippet, predecessor) => {
    const pos = app.indexOf(snippet);
    assert.ok(pos >= 0, "missing " + snippet);
    assert.ok(pos > app.indexOf(predecessor), snippet + " must follow " + predecessor);
    return pos;
  };
  const notes = after('loadScriptOnce("js/ui/interactions.js")', 'loadScriptOnce("js/state/persistence.js")');
  const observations = after('loadScriptOnce("js/observations.js")', 'loadScriptOnce("js/state/persistence.js")');
  const placeCard = app.indexOf('loadScriptOnce("js/ui/place-card.js?');
  const routerStart = app.indexOf('"HGAppRouter.start"');
  const routes = app.indexOf('loadScriptOnce("js/routes.js');
  assert.ok(notes < placeCard && observations < placeCard, "both actions available before PlaceCard binding");
  assert.ok(routes > placeCard && routes < routerStart, "Routes available before the first routed place");
  assert.equal((app.match(/loadScriptOnce\("js\/routes\.js/g) || []).length, 1, "one route-runtime load");
  assert.match(card, /function bindFooterActionsOnce\(\)/);
  assert.match(card, /function getFooterActionPlace\(\)/);
  assert.match(card, /document\.addEventListener\("click", \(e\) => \{/);
  assert.doesNotMatch(card, /btn(?:Quiz|Route|Note|Obs)\.onclick\s*=/);
  assert.match(card, /window\.handlePlaceNote\(place\)/);
  assert.match(card, /window\.HGObservations\.start\(\{/);
  assert.match(card, /window\.HGNearbyDrawer\?\.open\?\.\(\)/);
  assert.match(card, /window\.setLeftPanelMode\("routes"\)/);
  assert.match(card, /window\.HGAppRouter\.navigate\(next\)/);
  const visitPatch = read("js/ui/place-card-quizcards-patch.js");
  assert.match(visitPatch, /getPhysicalVisitGate\(runtime, place\)/);
  assert.match(visitPatch, /runtime\.HGPhysicalVisits/);
});

test("Notat executes the original private place-note save flow", () => {
  const dom = new JSDOM('<!doctype html><body><div id="placeCard"><p id="pcDesc"></p></div></body>', {
    url: "https://history-go.test/", runScripts: "outside-only"
  });
  try {
    const w = dom.window;
    w.userNotes = [];
    w.el = {btnSeeMap: null, btnExitMap: null};
    w.saveUserNotes = () => { w.__savedNotes = w.userNotes.slice(); };
    w.showToast = message => { w.__toast = message; };
    w.prompt = () => "Et faktisk observert forhold.";
    w.eval(read("js/ui/interactions.js"));
    assert.equal(typeof w.handlePlaceNote, "function");
    w.handlePlaceNote({ id: "torggata", name: "Torggata", category: "by" });
    assert.equal(w.__savedNotes.length, 1);
    assert.equal(w.__savedNotes[0].placeId, "torggata");
    assert.equal(w.__savedNotes[0].type, "place");
    assert.equal(w.__savedNotes[0].visibility, "private");
    assert.equal(w.__savedNotes[0].text, "Et faktisk observert forhold.");
    assert.match(w.__toast, /lagret/);
  } finally {
    dom.window.close();
  }
});

test("Observer opens real By-lens and records selected data in learning log", async () => {
  const dom = new JSDOM('<!doctype html><body></body>', {
    url: "https://history-go.test/", runScripts: "outside-only"
  });
  try {
    const w = dom.window;
    w.HG_I18N = { t: (_key, fallback) => fallback };
    const lenses = JSON.parse(read("data/observations/observations_by.json"));
    w.fetch = async () => ({ ok: true, json: async () => lenses });
    w.eval(read("js/observations.js"));
    assert.equal(typeof w.HGObservations?.start, "function");
    w.HGObservations.init({
      showToast: message => {w.__toast = message;},
      dispatchProfileUpdate: () => {}
    });
    await w.HGObservations.start({
      target: {targetId: "torggata", targetType: "place", subject_id: "by", categoryId: "by", title: "Torggata"},
      lensId: "by_byliv"
    });
    assert.equal(w.document.getElementById("obsModal")?.style.display, "flex");
    const chip = w.document.querySelector("#obsChips button[data-opt]");
    assert.ok(chip, "actual By-lens options rendered");
    const selected = chip.dataset.opt;
    chip.click();
    w.document.getElementById("obsSave").click();
    const entries = JSON.parse(w.localStorage.getItem("hg_learning_log_v1") || "[]");
    assert.equal(entries.length, 1);
    assert.equal(entries[0].targetId, "torggata");
    assert.equal(entries[0].type, "observation_done");
    assert.equal(entries[0].targetType, "place");
    assert.ok(entries[0].selected.includes(selected));
    assert.match(w.__toast, /lagret/);
  } finally {
    dom.window.close();
  }
});
