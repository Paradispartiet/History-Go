import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const mapBundle = readFileSync(new URL("../js/map.js", import.meta.url), "utf8");
const mapViewBundle = readFileSync(new URL("../js/views/MapView.js", import.meta.url), "utf8");
const categoryFilterBundle = readFileSync(new URL("../dist/web/map-controls-runtime.js", import.meta.url), "utf8");

class FakeElement {
  constructor(name = "div") {
    this.name = name;
    this.dataset = {};
    this.style = {};
    this.attributes = {};
    this.listeners = new Map();
    this.children = [];
    this.classList = {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false
    };
  }
  addEventListener(name, fn) {
    const list = this.listeners.get(name) || [];
    list.push(fn);
    this.listeners.set(name, list);
  }
  removeEventListener(name, fn) {
    this.listeners.set(name, (this.listeners.get(name) || []).filter(item => item !== fn));
  }
  emit(name, event) {
    for (const fn of this.listeners.get(name) || []) fn(event);
  }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] || null; }
  querySelector(selector) {
    if (selector === ".hg-map-style-toggle") return this.children.find(el => el.className === "hg-map-style-toggle") || null;
    return null;
  }
  querySelectorAll(selector) {
    if (selector === ".hg-map-style-btn") return this.children;
    return [];
  }
  insertBefore(child) { this.children.push(child); }
  get firstChild() { return this.children[0] || null; }
  set innerHTML(value) {
    this._html = value;
    if (value.includes("hg-map-style-btn")) {
      this.children = ["standard", "satellite"].map(mode => {
        const button = new FakeElement("button");
        button.className = "hg-map-style-btn";
        button.dataset.mode = mode;
        button.closest = selector => selector === ".hg-map-style-btn" ? button : null;
        return button;
      });
    }
  }
  get innerHTML() { return this._html || ""; }
}

class FakeMap {
  constructor() {
    this.listeners = new Map();
    this.layers = new Map();
    this.sources = new Map();
    this.canvas = new FakeElement("canvas");
    this.styleReady = false;
    this.styleChanges = [];
    this.resizes = 0;
    this.zoom = 15;
  }
  on(name, layerOrCallback, callback) {
    if (typeof layerOrCallback !== "function") return;
    const list = this.listeners.get(name) || [];
    list.push(layerOrCallback);
    this.listeners.set(name, list);
  }
  off(name, layerOrCallback) {
    if (typeof layerOrCallback !== "function") return;
    this.listeners.set(name, (this.listeners.get(name) || []).filter(fn => fn !== layerOrCallback));
  }
  once(name, callback) {
    const wrapped = (...args) => { this.off(name, wrapped); callback(...args); };
    this.on(name, wrapped);
  }
  emit(name, event = {}) { for (const fn of [...(this.listeners.get(name) || [])]) fn(event); }
  isStyleLoaded() { return this.styleReady; }
  getStyle() { return { layers: [] }; }
  queryRenderedFeatures() { return []; }
  getLayer(id) { return this.layers.get(id) || null; }
  addLayer(layer) { this.layers.set(layer.id, layer); }
  removeLayer(id) { this.layers.delete(id); }
  moveLayer() {}
  getSource(id) { return this.sources.get(id) || null; }
  addSource(id, config) {
    this.sources.set(id, { ...config, setData(data) { this.data = data; } });
  }
  removeSource(id) { this.sources.delete(id); }
  addControl() {}
  getCanvas() { return this.canvas; }
  resize() { this.resizes += 1; }
  getZoom() { return this.zoom; }
  setStyle(url) {
    this.styleChanges.push(url);
    this.styleReady = false;
    this.layers.clear();
    this.sources.clear();
  }
  finishStyle({ initial = false } = {}) {
    this.styleReady = true;
    this.emit("style.load");
    if (initial) this.emit("load");
    this.emit("idle");
  }
}

function setup({ savedStyle = null, delayedPlaces = false } = {}) {
  const controls = new FakeElement("controls");
  const mapElement = new FakeElement("map");
  const placeCard = new FakeElement("placeCard");
  const main = new FakeMap();
  const loc = new Map();
  if (savedStyle) loc.set("hg_map_style_mode", savedStyle);
  const win = {
    console,
    fetch: async () => ({ ok: false, status: 404 }),
    maplibregl: {
      Map: class {
        constructor(options) {
          main.initialStyle = options.style;
          return main;
        }
      },
      NavigationControl: class {},
      Marker: class {
        setLngLat() { return this; }
        addTo() { return this; }
        remove() {}
      }
    },
    HG_MAPTILER_KEY: "testing-only",
    localStorage: {
      getItem: key => loc.get(key) ?? null,
      setItem: (key, value) => loc.set(key, String(value))
    },
    document: {
      getElementById(id) {
        return id === "map" ? mapElement : id === "placeCard" ? placeCard : null;
      },
      querySelector(selector) {
        if (selector === ".map-controls") return controls;
        if (selector === ".hg-map-style-toggle") return controls.querySelector(selector);
        return null;
      },
      createElement: name => new FakeElement(name),
      body: { classList: { add() {}, remove() {} } }
    },
    addEventListener() {},
    removeEventListener() {}
  };
  win.window = win;
  runInNewContext(mapBundle, win, { timeout: 1000 });
  const places = [
    { id: "park", name: "Park", category: "by", lat: 59.91, lon: 10.75, r: 100 }
  ];
  win.PLACES = places;
  win.HG_PLACES_READY = true;
  win.HGMap.initMap();
  if (!delayedPlaces) win.HGMap.setPlaces(places);
  main.finishStyle({ initial: true });
  if (delayedPlaces) win.HGMap.setPlaces(places);
  win.MAP = main;
  runInNewContext(mapViewBundle, win, { timeout: 1000 });
  return { win, main, controls };
}

test("mobile map style buttons respond once to a tap (click, no duplicate touchend)", () => {
  const { controls, main } = setup();
  const toggle = controls.querySelector(".hg-map-style-toggle");
  assert.ok(toggle, "style switch is mounted");
  assert.equal((toggle.listeners.get("click") || []).length, 1);
  assert.equal((toggle.listeners.get("touchend") || []).length, 0);
  const detailed = toggle.querySelectorAll(".hg-map-style-btn")[1];
  toggle.emit("click", { target: detailed, preventDefault() {}, stopPropagation() {} });
  assert.equal(main.styleChanges.length, 1);
  main.finishStyle();
  assert.ok(main.getLayer("hg-places-dots"), "dots restored after detailed style");
  assert.ok(main.getLayer("hg-places-hit"), "hit targets restored after detailed style");
});

test("rapid Kart/Detaljert presses honor the latest choice and restore dots", () => {
  const { controls, main, win } = setup();
  const toggle = controls.querySelector(".hg-map-style-toggle");
  const [standard, detailed] = toggle.querySelectorAll(".hg-map-style-btn");
  const press = target => toggle.emit("click", { target, preventDefault() {}, stopPropagation() {} });
  press(detailed);
  press(standard); // second press arrives while the detailed style is loading
  assert.equal(main.styleChanges.length, 1);
  main.finishStyle(); // queued standard style should now begin loading
  assert.equal(main.styleChanges.length, 2);
  main.finishStyle();
  assert.equal(win.localStorage.getItem("hg_map_style_mode"), "standard");
  assert.ok(main.getLayer("hg-places-dots"));
});

test("back from PlaceCard heals a source that has silently lost one marker layer", () => {
  const { win, main } = setup();
  assert.ok(main.getLayer("hg-places-dots"));
  main.removeLayer("hg-places-dots");
  assert.equal(main.getLayer("hg-places-dots"), null);
  win.HGMapView.showMap();
  assert.ok(main.getLayer("hg-places-dots"), "back navigation restores missing dots");
  assert.ok(main.getLayer("hg-places-hit"), "back navigation restores hit targets");
});

test("touchend plus click cannot open one map marker twice", () => {
  const { win, main } = setup();
  const opened = [];
  win.HGMap.setOnPlaceClick(id => opened.push(id));
  assert.equal((main.listeners.get("touchend") || []).length, 0);
  const event = {
    features: [{ layer: { id: "hg-places-hit" }, properties: { id: "park" } }],
    point: { x: 3, y: 4 },
    preventDefault() {},
    originalEvent: { preventDefault() {}, stopPropagation() {} }
  };
  main.emit("touchend", event);
  main.emit("click", event);
  assert.deepEqual(opened, ["park"]);
});

test("restart after Detaljert uses reliable Kart base and still renders dots with late place data", () => {
  const { win, main } = setup({ savedStyle: "satellite", delayedPlaces: true });
  assert.match(main.initialStyle, /cartocdn\.com/, "initial map does not require remote detailed tiles");
  assert.equal(win.localStorage.getItem("hg_map_style_mode"), "standard");
  assert.ok(main.getSource("hg-places"), "places arrive after initial style load");
  assert.ok(main.getLayer("hg-places-dots"), "dots must show after startup");
  assert.ok(main.getLayer("hg-places-hit"), "markers remain tappable");
});

test("detailed map load failure automatically restores default map and place dots", () => {
  const { main, controls } = setup();
  const toggle = controls.querySelector(".hg-map-style-toggle");
  const detailed = toggle.querySelectorAll(".hg-map-style-btn")[1];
  toggle.emit("click", { target: detailed, preventDefault() {}, stopPropagation() {} });
  assert.equal(main.styleChanges.length, 1);
  main.emit("error", { error: new Error("Remote detailed style unavailable") });
  assert.equal(main.styleChanges.length, 2, "fall back to standard map on style load error");
  assert.match(main.styleChanges[1], /cartocdn\.com/);
  main.finishStyle();
  assert.ok(main.getLayer("hg-places-dots"), "dots restored after remote style failure");
  assert.ok(main.getLayer("hg-places-hit"), "hit layer restored after remote style failure");
});

function setupCategoryFilter({ saved = null, legacy = null } = {}) {
  const storage = new Map();
  if (saved) storage.set("hg_map_category_filters_v2", saved);
  if (legacy) storage.set("hg_map_category_filter_v1", legacy);
  const listeners = new Map();
  const calls = [];
  const win = {
    console,
    PLACES: [],
    CATEGORY_LIST: [
      { id: "by", name: "By" },
      { id: "historie", name: "Historie" }
    ],
    localStorage: {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: key => storage.delete(key)
    },
    HGMap: { setPlaces: rows => calls.push(rows.map(p => p.id)) },
    dispatchEvent() {},
    CustomEvent: class {},
    setInterval() { return 1; },
    clearInterval() {},
    addEventListener(name, cb) { listeners.set("window:" + name, cb); },
    document: {
      readyState: "loading",
      getElementById(id) { return id === "hgMapControlsRuntimeStyle" ? {} : null; },
      querySelector() { return null; },
      addEventListener(name, cb) { listeners.set("document:" + name, cb); }
    }
  };
  win.window = win;
  runInNewContext(categoryFilterBundle, win, { timeout: 1000 });
  listeners.get("document:DOMContentLoaded")();
  return { win, calls, storage };
}

test("fresh session ignores old single-category choices and shows ALL places", () => {
  const { win, calls, storage } = setupCategoryFilter({
    saved: JSON.stringify(["by"]),
    legacy: "by"
  });
  const places = [
    { id: "street", category: "by" },
    { id: "museum", category: "historie" }
  ];
  win.HGMap.setPlaces(places);
  assert.deepEqual(calls.at(-1), ["street", "museum"]);
  assert.deepEqual([...win.HGMapCategoryFilter.get()], []);
  assert.equal(storage.has("hg_map_category_filters_v2"), false);
  assert.equal(storage.has("hg_map_category_filter_v1"), false);
});

test("in-session category selection still works without hiding places after restart", () => {
  const { win, calls, storage } = setupCategoryFilter();
  const places = [
    { id: "street", category: "by" },
    { id: "museum", category: "historie" }
  ];
  win.HGMap.setPlaces(places);
  win.HGMapCategoryFilter.set("by");
  assert.deepEqual(calls.at(-1), ["street"]);
  assert.deepEqual([...win.HGMapCategoryFilter.get()], ["by"]);
  assert.equal(storage.has("hg_map_category_filters_v2"), false);
  win.HGMapCategoryFilter.showAll();
  assert.deepEqual(calls.at(-1), ["street", "museum"]);
});

test("category selection with zero matching places falls back to all dots", () => {
  const { win, calls } = setupCategoryFilter();
  const places = [
    { id: "museum", category: "historie" },
    { id: "monument", category: "historie" }
  ];
  win.HGMap.setPlaces(places);
  win.HGMapCategoryFilter.set("by");
  assert.deepEqual(calls.at(-1), ["museum", "monument"]);
  assert.deepEqual([...win.HGMapCategoryFilter.get()], []);
});
