#!/usr/bin/env node
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repoRoot = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(repoRoot, file), "utf8");

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
    listeners,
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

function createDocument() {
  const elements = new Map();

  function makeElement(tagName, id) {
    return {
      id: id || "",
      tagName: String(tagName || "div").toUpperCase(),
      textContent: "",
      innerHTML: "",
      rel: "",
      href: "",
      src: "",
      onload: null,
      onerror: null,
      classList: { toggle() {} },
      appendChild(child) {
        if (typeof child.onload === "function") child.onload();
        return child;
      },
      querySelector() { return null; },
      querySelectorAll() { return []; },
      setAttribute(name, value) { this[name] = String(value); },
      getAttribute(name) { return this[name] || null; }
    };
  }

  const documentListeners = new Map();
  const document = {
    body: makeElement("body", "body"),
    head: makeElement("head", "head"),
    readyState: "complete",
    createElement(tagName) {
      return makeElement(tagName);
    },
    getElementById(id) {
      const key = String(id);
      if (!elements.has(key)) elements.set(key, makeElement("div", key));
      return elements.get(key);
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener(type, listener) {
      const key = String(type);
      if (!documentListeners.has(key)) documentListeners.set(key, []);
      documentListeners.get(key).push(listener);
    },
    dispatchEvent(event) {
      const list = (documentListeners.get(String(event.type)) || []).slice();
      for (const listener of list) listener.call(document, event);
      return true;
    }
  };

  return document;
}

class Event {
  constructor(type) {
    this.type = type;
  }
}

class CustomEvent extends Event {
  constructor(type, init = {}) {
    super(type);
    this.detail = init.detail;
  }
}

const events = createEventTarget();
global.window = global;
global.document = createDocument();
global.localStorage = createLocalStorage();
global.addEventListener = events.addEventListener;
global.removeEventListener = events.removeEventListener;
global.dispatchEvent = events.dispatchEvent;
global.Event = Event;
global.CustomEvent = CustomEvent;
global.setTimeout = function (fn) { fn(); return 0; };
global.console = { ...console, warn() {} };
global.getPCWallet = function () { return 0; };
global.CivicationMiniSectionsUI = { boot() {}, refresh() {} };
global.CivicationBrandJobUI = { boot() {}, refresh() {} };
global.CivicationState = {
  getState() { return {}; },
  getInbox() { return []; },
  getActivePosition() { return null; }
};
global.CivicationHome = { getState() { return { home: null }; } };
global.CivicationEventChannels = {
  splitInbox(inbox) { return { messages: inbox || [], unknown: [], workday: [], milestones: [], system: [] }; },
  classifyEvent() { return "message"; }
};

let destination = null;
global.CivicationTravelState = {
  getCurrentDestination() { return destination; }
};

vm.runInThisContext(read("js/Civication/ui/CivicationDashboardUI.js"), {
  filename: "js/Civication/ui/CivicationDashboardUI.js"
});

assert(events.listeners.has("civi:travelStateUpdated"), "dashboard listens to civi:travelStateUpdated");
assert(events.listeners.has("civi:travelDestinationSet"), "dashboard listens to civi:travelDestinationSet");

function renderAndReadFocus() {
  global.CivicationDashboardUI.render();
  return global.document.getElementById("civiDashFocus").textContent;
}

assert.strictEqual(renderAndReadFocus(), "Ingen åpne hendelser", "baseline focus is unchanged without inbox or travel");

destination = { placeId: "akershus_festning", placeName: "Akershus festning" };
assert.strictEqual(renderAndReadFocus(), "Mål: Akershus festning", "travel destination is fallback dashboard focus");

let inbox = [{ status: "pending", event: { id: "event-1", subject: "Svar på nabomelding", status: "pending" } }];
global.CivicationMailEngine = { getInbox() { return inbox; } };
assert.strictEqual(renderAndReadFocus(), "Svar på nabomelding", "pending inbox focus keeps priority over travel destination");

inbox = [];
destination = { placeId: "mangler_navn" };
window.dispatchEvent(new CustomEvent("civi:travelDestinationSet", { detail: { destination } }));
assert.strictEqual(
  global.document.getElementById("civiDashFocus").textContent,
  "Mål: mangler_navn",
  "travel destination event re-renders dashboard and falls back to placeId"
);

assert.deepStrictEqual(localStorage.writes, [], "dashboard travel focus test does not write storage keys");

console.log("PASS: Civication dashboard travel focus test completed.");
