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
  appendChild(child) { this.children.push(child); return child; }
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
    this.pendingTiles = false;
    this.styleChanges = [];
    this.nativeMarkers = [];
    this.resizes = 0;
    this.zoom = 15;
    this.boundsEmpty = false;
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
  isStyleLoaded() { return this.styleReady && !this.pendingTiles; }
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
  getBounds() { return { contains: () => !this.boundsEmpty }; }
  getCenter() { return { lng: 10.75, lat: 59.91 }; }
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

function setup({ savedStyle = null, delayedPlaces = false, pendingTiles = false, mobile = false, ipad = false, emptyBounds = false, skipStyleLoad = false } = {}) {
  const controls = new FakeElement("controls");
  const mapElement = new FakeElement("map");
  const placeCard = new FakeElement("placeCard");
  const main = new FakeMap();
  main.pendingTiles = pendingTiles;
  main.boundsEmpty = emptyBounds;
  const loc = new Map();
  if (savedStyle) loc.set("hg_map_style_mode", savedStyle);
  const win = {
    console,
    innerWidth: ipad ? 1366 : mobile ? 390 : 1440,
    navigator: { maxTouchPoints: ipad ? 5 : mobile ? 1 : 0 },
    matchMedia: query => ({ matches: mobile || (ipad && query.includes("pointer: coarse")) }),
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
        constructor(options) { this.element = options.element; this.removed = false; }
        setLngLat(coords) { this.coords = coords; this.setLngLatCount = (this.setLngLatCount || 0) + 1; return this; }
        addTo(map) { map.nativeMarkers.push(this); return this; }
        remove() { this.removed = true; }
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
  if (!skipStyleLoad) main.finishStyle({ initial: true });
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

test("first map paint restores dots even when MapLibre style.load fires before tiles finish", () => {
  const { win, main } = setup({ pendingTiles: true });
  assert.equal(main.isStyleLoaded(), false, "tiles still downloading after style.load");
  assert.ok(main.getSource("hg-places"), "place source created on first map load");
  assert.ok(main.getLayer("hg-places-dots"), "place dots created before full tile idle");
  assert.ok(main.getLayer("hg-places-hit"), "dots are tappable on first paint");
  assert.equal(main.styleChanges.length, 0, "no Kart/Detaljert click necessary");
  win.HGMapView.showMap();
  assert.ok(main.getLayer("hg-places-dots"), "mode switch preserves visible dots");
});

test("late place data still creates dots when style.load was already fired and tiles keep loading", () => {
  const { main } = setup({ pendingTiles: true, delayedPlaces: true });
  assert.equal(main.isStyleLoaded(), false);
  assert.ok(main.getLayer("hg-places-dots"), "late place data is drawn without a second style.load event");
  assert.ok(main.getSource("hg-places"));
  assert.equal(main.styleChanges.length, 0);
});

test("map control styling has a single CSS owner and keeps attribution visible", () => {
  const css = readFileSync(new URL("../css/map.css", import.meta.url), "utf8");
  const runtime = readFileSync(new URL("../dist/web/map-controls-runtime.js", import.meta.url), "utf8");
  assert.ok(css.includes("background: #050505"), "opaque controls");
  assert.ok(css.includes("body.hg-app.mode-map .map-controls"), "bottom dock in map mode");
  assert.ok(css.includes("maplibregl-ctrl-bottom-right"), "attribution remains visible");
  assert.equal(runtime.includes("hgMapControlsRuntimeStyle"), false, "no late competing style element");
});

test("main entry does not inject obsolete transparent map-control stylesheet", () => {
  const config = readFileSync(new URL("../js/config.js", import.meta.url), "utf8");
  const index = readFileSync(new URL("../index.html", import.meta.url), "utf8");
  const css = readFileSync(new URL("../css/map.css", import.meta.url), "utf8");
  assert.ok(!config.includes('link.href = "css/map-controls-flat.css"'),
    "old control CSS must not override the black map dock");
  assert.ok(!config.includes("ensureMapControlsStyles("),
    "legacy dynamic style owner must be removed");
  assert.ok(!index.includes('href="css/map-controls-flat.css"'));
  assert.ok(css.includes("body.hg-app .map-controls .hg-map-style-toggle"));
  assert.ok(css.includes("background: #050505"));
});

test("Oslo city map visibly renders both detail dots and hit targets at zoom 11", () => {
  const { main } = setup();
  main.zoom = 11;
  const detail = main.getLayer("hg-places-dots");
  const hit = main.getLayer("hg-places-hit");
  assert.ok(detail, "detail circle layer exists");
  assert.ok(hit, "touch hit target layer exists");
  assert.ok(detail.minzoom <= 11, "detail dots must not be gated above ordinary city zoom");
  assert.ok(hit.minzoom <= 11, "visible dots must be tappable at ordinary city zoom");
  const radius = detail.paint["circle-radius"];
  assert.equal(radius[0], "interpolate");
  assert.ok(radius[4][1] >= 3, "dots must be legible on a phone");
});

test("dedicated map mode hides ghost PlaceCard and keeps dock at screen bottom", () => {
  const css = readFileSync(new URL("../css/map.css", import.meta.url), "utf8");
  assert.ok(css.includes("body.hg-app.mode-map #placeCard"));
  assert.ok(css.includes("body.hg-app.map-only #placeCard"));
  assert.ok(css.includes("bottom: calc(8px + env(safe-area-inset-bottom, 0px)) !important"));
  assert.ok(css.includes("position: fixed !important"));
});

test("mobile native detail markers appear on the first view even without WebGL circles", () => {
  const { win, main } = setup({ mobile: true, pendingTiles: true });
  const native = main.nativeMarkers.filter(m => m.element.className === "hg-place-detail-marker" && !m.removed);
  assert.equal(native.length, 1, "detail place has an independent, visible HTML marker");
  assert.equal(native[0].element.style.pointerEvents, "auto");
  assert.equal(native[0].element.style.opacity, "1");
  const opened = [];
  win.HGMap.setOnPlaceClick(id => opened.push(id));
  native[0].element.emit("click", { preventDefault() {}, stopPropagation() {} });
  assert.deepEqual(opened, ["park"], "touching the native marker opens its PlaceCard");
  assert.ok(main.getLayer("hg-places-dots"), "normal vector dot layer also remains available");
});

test("cold mobile start draws HTML dots before style.load even with empty initial bounds", () => {
  const { main } = setup({ mobile: true, emptyBounds: true, skipStyleLoad: true });
  assert.equal(main.getLayer("hg-places-dots"), null, "WebGL style has not loaded");
  const native = main.nativeMarkers.filter(m => m.element.className === "hg-place-detail-marker" && !m.removed);
  assert.equal(native.length, 1, "HTML dot must not depend on style.load or initially wrong bounds");
  assert.equal(native[0].element.style.opacity, "1");
});

test("mobile dots stay mounted across resize and style changes without duplicate WebGL circles", () => {
  const { win, main, controls } = setup({ mobile: true, emptyBounds: true });
  const initial = main.nativeMarkers.find(m => m.element.className === "hg-place-detail-marker");
  assert.ok(initial && !initial.removed);
  assert.equal(main.getLayer("hg-places-dots")?.layout?.visibility, "none",
    "mobile detail dots must have one visible renderer, not flickering DOM and WebGL overlap");
  win.HGMap.resize();
  main.boundsEmpty = false;
  win.HGMap.resize();
  win.HGMap.refreshMarkers();
  assert.equal(initial.setLngLatCount, 1, "unchanged marker must never be repositioned repeatedly");
  assert.ok(!initial.removed, "resize preserves marker identity");

  const toggle = controls.querySelector(".hg-map-style-toggle");
  const detailed = toggle.querySelectorAll(".hg-map-style-btn")[1];
  toggle.emit("click", { target: detailed, preventDefault() {}, stopPropagation() {} });
  assert.ok(!initial.removed, "style switch does not remove HTML dot");
  main.finishStyle();
  assert.equal(main.getLayer("hg-places-dots")?.layout?.visibility, "none",
    "new MapLibre style also avoids double-rendering circles on mobile");
  assert.ok(!initial.removed, "style load does not recreate the native dot");
  assert.equal(main.nativeMarkers.filter(m => m.element.className === "hg-place-detail-marker").length, 1);
});

test("desktop retains vector circles as its single detail renderer", () => {
  const { main } = setup({ mobile: false });
  assert.equal(main.getLayer("hg-places-dots")?.layout?.visibility, "visible");
  assert.equal(main.nativeMarkers.filter(m => m.element.className === "hg-place-detail-marker").length, 0);
});

test("large landscape iPad uses native dots rather than invisible vector-only circles", () => {
  const { main } = setup({ ipad: true, skipStyleLoad: true });
  const marker = main.nativeMarkers.find(m => m.element.className === "hg-place-detail-marker" && !m.removed);
  assert.ok(marker, "iPad must show detail dot without waiting for style.load");
  main.finishStyle();
  assert.equal(main.getLayer("hg-places-dots")?.layout?.visibility, "none");
  assert.ok(!marker.removed);
});

test("phone and iPad dots shrink progressively during zoom without marker replacement", () => {
  for (const opts of [{ mobile: true }, { ipad: true }]) {
    const { main } = setup(opts);
    const marker = main.nativeMarkers.find(m => m.element.className === "hg-place-detail-marker" && !m.removed);
    assert.ok(marker);
    const sizes = [];
    for (const zoom of [10, 11, 12, 13, 14, 16]) {
      main.zoom = zoom;
      main.emit("zoom");
      sizes.push(Number(marker.element.style.width.replace("px", "")));
    }
    assert.ok(sizes.every((n, i) => i === 0 || n > sizes[i - 1]),
      "continuous zoom must increase diameter at every zoom stop");
    assert.ok(sizes[0] < 5 && sizes.at(-1) <= 8.5);
    assert.equal(marker.setLngLatCount, 1, "changing zoom must not relayout marker coordinates");
    assert.equal(main.nativeMarkers.filter(m => m.element.className === "hg-place-detail-marker").length, 1);
  }
});

test("iPad and phone carry native place names before style.load and after Detaljert", () => {
  for (const kind of [{ mobile: true }, { ipad: true }]) {
    const { main, controls } = setup({ ...kind, skipStyleLoad: true });
    const marker = main.nativeMarkers.find(m => m.element.className === "hg-place-detail-marker" && !m.removed);
    assert.ok(marker);
    const label = marker.element.children.find(c => c.className === "hg-place-detail-name");
    assert.ok(label, "place name is attached to the same native dot");
    assert.equal(label.textContent, "Park");
    assert.equal(label.style.display, "block", "name visible even before WebGL loads");
    main.finishStyle({ initial: true });
    assert.equal(main.getLayer("hg-places-label")?.layout?.visibility, "none",
      "avoid competing WebGL text and native name");
    const toggle = controls.querySelector(".hg-map-style-toggle");
    toggle.emit("click", { target: toggle.querySelectorAll(".hg-map-style-btn")[1],
      preventDefault() {}, stopPropagation() {} });
    main.finishStyle();
    assert.equal(label.style.display, "block");
    assert.strictEqual(marker.element.children.find(c => c.className === "hg-place-detail-name"), label,
      "style change retains the original name label");
    assert.equal(marker.element.children.filter(c => c.className === "hg-place-detail-name").length, 1);
    assert.ok(!marker.removed, "dot and name keep the same marker instance");
    main.zoom = 12;
    main.emit("zoom");
    assert.equal(label.style.display, "none", "names declutter at low zoom");
    main.zoom = 14;
    main.emit("zoom");
    assert.equal(label.style.display, "block", "name reappears without replacing the dot");
  }
});

test("desktop still renders WebGL place names without HTML marker duplication", () => {
  const { main } = setup({ mobile: false });
  assert.equal(main.getLayer("hg-places-label")?.layout?.visibility, "visible");
  assert.equal(main.nativeMarkers.filter(m => m.element.className === "hg-place-detail-marker").length, 0);
});
