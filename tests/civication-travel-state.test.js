#!/usr/bin/env node
// Verifies the narrow CivicationTravelState skeleton.

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function createLocalStorage() {
  const store = new Map();
  const writes = [];
  return {
    writes,
    getItem(key) {
      key = String(key);
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      writes.push(String(key));
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
      writes.length = 0;
    }
  };
}

function createEventTarget() {
  const listeners = new Map();
  return {
    addEventListener(type, listener) {
      const key = String(type);
      if (!listeners.has(key)) listeners.set(key, []);
      listeners.get(key).push(listener);
    },
    removeEventListener(type, listener) {
      const list = listeners.get(String(type)) || [];
      const idx = list.indexOf(listener);
      if (idx >= 0) list.splice(idx, 1);
    },
    dispatchEvent(event) {
      const list = (listeners.get(String(event.type)) || []).slice();
      for (const listener of list) listener.call(global.window, event);
      return true;
    }
  };
}

class CustomEvent {
  constructor(type, init = {}) {
    this.type = type;
    this.detail = init.detail;
  }
}

const events = createEventTarget();
global.window = global;
global.addEventListener = events.addEventListener;
global.removeEventListener = events.removeEventListener;
global.dispatchEvent = events.dispatchEvent;
global.CustomEvent = CustomEvent;
global.localStorage = createLocalStorage();
global.console = { ...console, warn() {} };

vm.runInThisContext(read("js/Civication/core/CivicationStorageAdapter.js"), {
  filename: "js/Civication/core/CivicationStorageAdapter.js"
});
vm.runInThisContext(read("js/Civication/core/CivicationTravelState.js"), {
  filename: "js/Civication/core/CivicationTravelState.js"
});

const adapter = global.CivicationStorageAdapter;
const travel = global.CivicationTravelState;

assert(travel, "window.CivicationTravelState is exported");
assert.strictEqual(typeof travel.getState, "function", "getState API exists");

assert.deepStrictEqual(
  travel.getState(),
  {
    version: 1,
    currentLocation: null,
    currentDestination: null,
    activeTrip: null,
    pendingTravelRequest: null,
    travelLog: [],
    lastTravelAt: null,
    updatedAt: null
  },
  "default state has the expected shape"
);

const originalVisited = [{ id: "vigelandsparken" }];
const originalMerits = { historie: { points: 4 } };
const originalQuiz = { oslo_quiz: { completed: true } };
const originalCalendar = {
  dayIndex: 7,
  currentMinutes: 615,
  phase: "afternoon",
  shiftStartMinutes: 480
};

localStorage.setItem("visited_places", JSON.stringify(originalVisited));
localStorage.setItem("merits_by_category", JSON.stringify(originalMerits));
localStorage.setItem("quiz_progress", JSON.stringify(originalQuiz));
localStorage.setItem("hg_civi_calendar_v1", JSON.stringify(originalCalendar));
localStorage.writes.length = 0;

let updatedEvent = null;
let destinationEvent = null;
let profileEventCount = 0;
window.addEventListener("civi:travelStateUpdated", (event) => { updatedEvent = event.detail; });
window.addEventListener("civi:travelDestinationSet", (event) => { destinationEvent = event.detail; });
window.addEventListener("updateProfile", () => { profileEventCount += 1; });

window.dispatchEvent(new CustomEvent("civi:historyGoPlaceTravelRequested", {
  detail: {
    placeId: "akershus_festning",
    place: {
      id: "akershus_festning",
      name: "Akershus festning",
      category: "historie"
    },
    source: "CivicationHistoryGoPlaceLayer"
  }
}));

const state = travel.getState();
assert(state.pendingTravelRequest, "travel request creates pendingTravelRequest");
assert.strictEqual(state.pendingTravelRequest.placeId, "akershus_festning", "pendingTravelRequest keeps placeId");
assert.strictEqual(state.pendingTravelRequest.placeName, "Akershus festning", "pendingTravelRequest keeps placeName");
assert.strictEqual(state.pendingTravelRequest.origin, "history_go_place", "History Go menu payload sets origin");
assert.strictEqual(state.pendingTravelRequest.status, "pending", "pendingTravelRequest status is pending");
assert.strictEqual(state.pendingTravelRequest.phase, "afternoon", "calendar phase is read defensively");
assert.strictEqual(state.pendingTravelRequest.dayIndex, 7, "calendar dayIndex is read defensively");
assert.strictEqual(state.pendingTravelRequest.calendarMinute, 615, "calendar minute is read defensively");

assert(state.currentDestination, "travel request sets currentDestination");
assert.strictEqual(state.currentDestination.placeId, "akershus_festning", "currentDestination keeps placeId");
assert.strictEqual(state.currentDestination.status, "requested", "currentDestination status is requested");
assert.strictEqual(state.currentLocation, null, "travel request does not set currentLocation");
assert.strictEqual(state.activeTrip, null, "travel request does not start activeTrip");
assert.deepStrictEqual(state.travelLog, [], "travel request does not write travelLog by default");

assert.deepStrictEqual([...new Set(localStorage.writes)], ["hg_civi_travel_v1"], "travel request writes only hg_civi_travel_v1");
assert.deepStrictEqual(JSON.parse(localStorage.getItem("visited_places")), originalVisited, "visited_places is unchanged");
assert.deepStrictEqual(JSON.parse(localStorage.getItem("merits_by_category")), originalMerits, "merits_by_category is unchanged");
assert.deepStrictEqual(JSON.parse(localStorage.getItem("quiz_progress")), originalQuiz, "quiz_progress is unchanged");
assert.strictEqual(localStorage.getItem("hg_civi_calendar_v1"), JSON.stringify(originalCalendar), "calendar storage is not mutated");

assert(updatedEvent, "civi:travelStateUpdated is dispatched");
assert.strictEqual(updatedEvent.source, "CivicationTravelState", "updated event source is travel state");
assert.strictEqual(updatedEvent.reason, "historyGoPlaceTravelRequested", "updated event includes reason");
assert(destinationEvent, "civi:travelDestinationSet is dispatched");
assert.strictEqual(destinationEvent.destination.placeName, "Akershus festning", "destination event includes destination");
assert.strictEqual(destinationEvent.request.status, "pending", "destination event includes request");
assert.strictEqual(profileEventCount, 1, "updateProfile is dispatched");

assert.strictEqual(adapter.writeVisitedPlaces, undefined, "writeVisitedPlaces does not exist");
assert.strictEqual(adapter.writeMeritsByCategory, undefined, "writeMeritsByCategory does not exist");
assert.strictEqual(adapter.writeQuizProgress, undefined, "writeQuizProgress does not exist");

console.log("CivicationTravelState checks passed.");
