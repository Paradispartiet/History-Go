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
assert.strictEqual(typeof travel.completeCurrentTravel, "function", "completeCurrentTravel API exists");

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
let completedEvent = null;
let updatedEventCount = 0;
let profileEventCount = 0;
window.addEventListener("civi:travelStateUpdated", (event) => {
  updatedEvent = event.detail;
  updatedEventCount += 1;
});
window.addEventListener("civi:travelDestinationSet", (event) => { destinationEvent = event.detail; });
window.addEventListener("civi:travelCompleted", (event) => { completedEvent = event.detail; });
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

localStorage.writes.length = 0;
const updatedEventsBeforeCompletion = updatedEventCount;
const completedState = travel.completeCurrentTravel({ tripId: "trip-akershus-1" });

assert(completedState.currentLocation, "completion sets currentLocation");
assert.strictEqual(completedState.currentLocation.placeId, "akershus_festning", "currentLocation keeps destination placeId");
assert.strictEqual(completedState.currentLocation.status, "arrived", "currentLocation status is arrived");
assert.match(completedState.currentLocation.arrivedAt, /^\d{4}-\d{2}-\d{2}T/, "currentLocation has an ISO arrivedAt timestamp");
assert.strictEqual(completedState.currentDestination, null, "completion clears currentDestination");
assert.strictEqual(completedState.pendingTravelRequest, null, "completion clears pendingTravelRequest");
assert.strictEqual(completedState.activeTrip, null, "completion clears activeTrip");
assert.strictEqual(completedState.lastTravelAt, completedState.currentLocation.arrivedAt, "lastTravelAt records completion time");
assert.strictEqual(completedState.updatedAt, completedState.currentLocation.arrivedAt, "updatedAt records completion time");
assert.strictEqual(completedState.travelLog.length, 1, "completion appends one travelLog entry");
assert.strictEqual(completedState.travelLog[0].status, "completed", "travelLog entry is completed");
assert.strictEqual(completedState.travelLog[0].tripId, "trip-akershus-1", "travelLog entry keeps tripId");

assert(completedEvent, "civi:travelCompleted is dispatched");
assert.strictEqual(completedEvent.tripId, "trip-akershus-1", "completed event includes tripId");
assert.strictEqual(completedEvent.currentLocation.placeId, "akershus_festning", "completed event includes currentLocation");
assert.strictEqual(completedEvent.previousLocation, null, "completed event includes previousLocation");
assert.strictEqual(completedEvent.completedAt, completedState.currentLocation.arrivedAt, "completed event includes completion timestamp");
assert.strictEqual(completedEvent.source, "CivicationTravelState", "completed event identifies its source");
assert.strictEqual(updatedEventCount, updatedEventsBeforeCompletion + 1, "completion dispatches civi:travelStateUpdated");
assert.strictEqual(updatedEvent.reason, "completeCurrentTravel", "completion state event includes reason");
assert.strictEqual(profileEventCount, 2, "completion dispatches updateProfile");

assert.deepStrictEqual([...new Set(localStorage.writes)], ["hg_civi_travel_v1"], "completion writes only hg_civi_travel_v1");
assert.deepStrictEqual(JSON.parse(localStorage.getItem("visited_places")), originalVisited, "completion leaves visited_places unchanged");
assert.deepStrictEqual(JSON.parse(localStorage.getItem("merits_by_category")), originalMerits, "completion leaves merits_by_category unchanged");
assert.deepStrictEqual(JSON.parse(localStorage.getItem("quiz_progress")), originalQuiz, "completion leaves quiz_progress unchanged");
assert.strictEqual(localStorage.getItem("hg_civi_calendar_v1"), JSON.stringify(originalCalendar), "completion leaves calendar storage unchanged");

localStorage.removeItem("hg_civi_travel_v1");
localStorage.writes.length = 0;
completedEvent = null;
const noOpState = travel.completeCurrentTravel();
assert.deepStrictEqual(noOpState, travel.getState(), "completion without a destination is a stable no-op");
assert.strictEqual(completedEvent, null, "no-op completion does not dispatch civi:travelCompleted");
assert.deepStrictEqual(localStorage.writes, [], "no-op completion does not write storage");

assert.strictEqual(adapter.writeVisitedPlaces, undefined, "writeVisitedPlaces does not exist");
assert.strictEqual(adapter.writeMeritsByCategory, undefined, "writeMeritsByCategory does not exist");
assert.strictEqual(adapter.writeQuizProgress, undefined, "writeQuizProgress does not exist");

console.log("CivicationTravelState checks passed.");
