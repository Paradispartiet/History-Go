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
  assert.match(visitPatch, /ui\.visit\.enablePosition/);
  assert.match(visitPatch, /ui\.visit\.locationMissing/);
  const routeSource = read("js/routes.js");
  assert.match(routeSource, /Stedet mangler kartkoordinater\. Kan ikke vise gangrute/);
  assert.match(routeSource, /Kartet er ikke klart\. Prøv ruten igjen/);
  assert.match(routeSource, /Number\(place\?\.lon \?\? place\?\.lng\)/);
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


test("all four always-present footer actions respond before and after selection, using the live place", async () => {
  const dom = new JSDOM('<!doctype html><html><body>' +
    '<div id="placeCard" data-current-place-id=""><h2 id="pcTitle">Valgt sted</h2></div>' +
    '<div class="app-footer"><div class="app-actions">' +
    '<button id="pcQuiz">Quiz</button><button id="pcRoute">Rute</button>' +
    '<button id="pcObserve">Observer</button><button id="pcNote">Notat</button>' +
    '</div></div></body></html>', {
      url: "https://history-go.test/", runScripts: "outside-only"
    });
  try {
    const w = dom.window;
    const calls = { route: [], note: [], obs: [], quiz: [], mode: [], toast: [], drawer: 0 };
    w.tUI = (_key, fallback) => fallback;
    w.showToast = msg => calls.toast.push(msg);
    w.HGNearbyDrawer = { open: () => { calls.drawer++; } };
    w.setLeftPanelMode = mode => calls.mode.push(mode);
    w.renderLeftRoutesList = () => calls.mode.push("rendered");
    w.HGAppRouter = { navigate: hash => calls.quiz.push(hash) };
    w.HGObservations = { start: options => { calls.obs.push(options); return Promise.resolve(); } };
    w.handlePlaceNote = place => calls.note.push(place.id);
    w.showNavRouteToPlace = place => calls.route.push(place.id);
    const places = {
      torggata: {id:"torggata", name:"Torggata", category:"by"},
      stortorget: {id:"stortorget", name:"Stortorget", category:"historie"}
    };
    w.PLACES = Object.values(places);
    w.HGPlaceOpen = {getPlace: id => places[id]};
    const start = card.indexOf("// Read the current place at the time of each click");
    const end = card.indexOf("// PLACE CARD – bottom sheet bridge", start);
    assert.ok(start > 0 && end > start, "production footer controller extraction");
    const controller = card.slice(start, card.lastIndexOf("// ============================================================", end));
    w.eval(controller);

    const press = id => w.document.getElementById(id).click();
    press("pcQuiz"); press("pcNote"); press("pcObserve");
    assert.equal(calls.toast.length, 3, "no action is silently inert without a selected place");
    assert.ok(calls.toast.every(msg => /Velg et sted/.test(msg)));
    press("pcRoute");
    assert.equal(calls.drawer, 1, "Rute opens the real routes drawer even without a selected place");
    assert.ok(calls.mode.includes("routes"));

    w.document.getElementById("placeCard").dataset.currentPlaceId = "torggata";
    press("pcQuiz");
    assert.deepEqual(calls.quiz, ["#/quiz/torggata"]);
    press("pcNote");
    assert.deepEqual(calls.note, ["torggata"]);
    press("pcObserve");
    await Promise.resolve();
    assert.equal(calls.obs.length, 1);
    assert.equal(calls.obs[0].target.targetId, "torggata");
    assert.equal(calls.obs[0].lensId, "by_byliv");

    press("pcRoute");
    assert.ok(w.document.querySelector("#pcRouteMenu"), "route menu really opens");
    w.document.querySelector('[data-route-action="go"]').click();
    assert.deepEqual(calls.route, ["torggata"]);
    assert.equal(w.document.querySelector("#pcRouteMenu"), null, "route menu closes after navigation");

    // Switching place without re-rendering the footer must still target the new ID.
    w.document.getElementById("placeCard").dataset.currentPlaceId = "stortorget";
    press("pcQuiz"); press("pcNote"); press("pcObserve");
    assert.equal(calls.quiz.at(-1), "#/quiz/stortorget");
    assert.equal(calls.note.at(-1), "stortorget");
    assert.equal(calls.obs.at(-1).target.targetId, "stortorget");
    press("pcRoute");
    w.document.querySelector('[data-route-action="go"]').click();
    assert.equal(calls.route.at(-1), "stortorget");
    assert.equal(w.__HG_FOOTER_ACTIONS_BOUND__, true);
  } finally {
    dom.window.close();
  }
});

test("Events and Meet work for a selected place missing from the lightweight PLACES index", async () => {
  const dom = new JSDOM('<!doctype html><html><body>' +
    '<div id="placeCard" data-current-place-id="orphan"><h2 id="pcTitle">Historisk sted</h2>' +
    '<div id="pcEventsBox"></div></div>' +
    '<footer><div id="pcOnSiteFooter" hidden></div></footer></body></html>', {
      url: "https://history-go.test/", runScripts: "outside-only"
    });
  try {
    const w = dom.window;
    w.PLACES = [];
    w.HGPlaceOpen = {getPlace: id => id === "orphan" ? {id, name:"Historisk sted"} : null};
    w.HGEvents = {ready:true, getUpcomingByPlace: () => [{title:"Arrangement"}]};
    w.fetch = async () => ({ok:false});
    w.__events = []; w.__meet = [];
    w.showPlaceCardRoundPopup = value => w.__events.push(value);
    w.HG_SpotmeetingUI = {open: value => w.__meet.push(value)};
    w.eval(read("js/ui/place-onsite-surface.js"));
    w.document.dispatchEvent(new w.Event("DOMContentLoaded", {bubbles:true}));
    const events = w.document.querySelector('#pcOnSiteFooter [data-hg-onsite-action="events"]');
    const meet = w.document.querySelector('#pcOnSiteFooter [data-hg-onsite-action="meet"]');
    assert.ok(events && meet, "footer actions are present for hydrated orphan place");
    events.click(); meet.click();
    await Promise.resolve();
    assert.equal(w.__events.length, 1);
    assert.equal(w.__events[0].kind, "events");
    assert.equal(w.__meet[0].contextId, "orphan");
    w.document.getElementById("placeCard").dataset.currentPlaceId = "";
    w.HGPlaceOnSiteSurface.decorate(true);
    assert.equal(w.document.getElementById("pcOnSiteFooter").hidden, true);
  } finally {
    dom.window.close();
  }
});

test("collapsed PlaceCard thumbnail reopens the selected card through its real controller", () => {
  const dom = new JSDOM('<!doctype html><body>' +
    '<div id="placeCard" data-current-place-id="test-place"></div>' +
    '<button id="pcMini" type="button" aria-hidden="true"><img id="pcMiniImg" alt=""></button>' +
    '</body>', {url: "https://history-go.test/", runScripts: "outside-only"});
  try {
    const w = dom.window;
    const transitions = [];
    w.bottomSheetController = {
      hide: () => transitions.push("hide"),
      open: () => transitions.push("open"),
    };
    const start = card.indexOf("function setPlaceCardMiniVisible(on)");
    const end = card.indexOf('window.addEventListener("hg:langchange"', start);
    assert.ok(start !== -1 && end > start, "actual PlaceCard collapse controller found");
    w.eval(card.slice(start, end));
    w.initPlaceCardCollapse();
    w.collapsePlaceCard();
    const mini = w.document.getElementById("pcMini");
    assert.equal(w.isPlaceCardCollapsed(), true);
    assert.equal(mini.style.display, "block");
    assert.equal(mini.getAttribute("aria-hidden"), "false");
    mini.click();
    assert.equal(w.isPlaceCardCollapsed(), false);
    assert.equal(mini.style.display, "none");
    assert.equal(mini.getAttribute("aria-hidden"), "true");
    assert.deepEqual(transitions.slice(-2), ["hide", "open"]);
  } finally {
    dom.window.close();
  }
});
