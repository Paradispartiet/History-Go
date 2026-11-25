import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import vm from "node:vm";

const runtime = fs.readFileSync(new URL("../dist/web/fysen-map-layer.js", import.meta.url), "utf8");
const good = {
  schemaVersion: 1, source: "fysen-catalog", sourceCommit: "a".repeat(40),
  city: "Oslo", catalogCount: 2, restaurants: [
    { slug: "test-one-oslo", name: "Restaurant One", address: "Test gate 1", latitude: 59.91, longitude: 10.75 },
    { slug: "test-two-oslo", name: "Restaurant Two", address: "Test gate 2", latitude: 59.92, longitude: 10.76 }
  ]
};

function fixture(fetchImpl = async () => ({ ok: true, json: async () => good })) {
  const sources = new Map(), layers = new Map(), handlers = new Map(), requests = [], notices = [], events = [];
  const map = {
    getStyle: () => ({}), getSource: id => sources.get(id), getLayer: id => layers.get(id),
    addSource: (id, source) => sources.set(id, source), addLayer: layer => layers.set(layer.id, layer),
    removeLayer: id => layers.delete(id), removeSource: id => sources.delete(id),
    on: (event, handler) => handlers.set(event, handler), off: event => handlers.delete(event),
    queryRenderedFeatures: () => [], getZoom: () => 12, easeTo: () => {}
  };
  const window = { HGMap: { getMap: () => map }, showToast: value => notices.push(value),
    dispatchEvent: event => events.push(event.type) };
  vm.runInNewContext(runtime, {
    window, CustomEvent: class { constructor(type) { this.type = type; } },
    AbortController, console: { warn() {} },
    fetch: async (url, options) => { requests.push({ url, options }); return fetchImpl(url, options); }
  });
  return { api: window.HGFysenMap, map, sources, layers, handlers, requests, notices, events };
}

test("Fysen map is opt-in, restores after style changes, and removes only its own layers", async () => {
  const f = fixture();
  assert.equal(f.api.isEnabled(), false);
  assert.equal(f.requests.length, 0);
  f.layers.set("history-place-layer", { id: "history-place-layer" });
  assert.equal(await f.api.setEnabled(true), true);
  assert.equal(f.api.isEnabled(), true);
  assert.equal(f.requests.length, 1);
  const req = f.requests[0];
  assert.equal(req.url, "https://raw.githubusercontent.com/Paradispartiet/fysen/fysen-public-restaurant-map/restaurants.json");
  assert.equal(req.options.credentials, "omit");
  assert.equal(req.options.referrerPolicy, "no-referrer");
  assert.equal(f.sources.get("hg-fysen-restaurants").cluster, true);
  assert.equal(f.sources.get("hg-fysen-restaurants").data.features.length, 2);
  assert.equal(f.layers.has("hg-fysen-points"), true);
  f.sources.clear();
  f.layers.clear();
  f.handlers.get("style.load")();
  assert.equal(f.layers.has("hg-fysen-points"), true);
  f.layers.set("history-place-layer", { id: "history-place-layer" });
  assert.equal(await f.api.setEnabled(false), false);
  assert.equal(f.sources.size, 0);
  assert.deepEqual([...f.layers.keys()], ["history-place-layer"]);
  assert.equal(f.api.isEnabled(), false);
  assert.equal(await f.api.setEnabled(true), true);
  assert.equal(f.requests.length, 1, "Reuse only validated public catalog during the session");
});

test("invalid public catalog fails closed without hiding normal map", async () => {
  const f = fixture(async () => ({ ok: true, json: async () => ({
    ...good, restaurants: [{ ...good.restaurants[0], latitude: null }]
  }) }));
  assert.equal(await f.api.setEnabled(true), false);
  assert.equal(f.api.isEnabled(), false);
  assert.equal(f.sources.size, 0);
  assert.ok(f.notices.some(n => n.includes("ikke tilgjengelig")));
  assert.throws(() => f.api.parseCatalog({ ...good, restaurants: [good.restaurants[0], good.restaurants[0]] }));
  assert.throws(() => f.api.parseCatalog({ ...good, city: "Bergen" }));
  const parsed = f.api.parseCatalog(good);
  assert.equal(parsed.features[0].geometry.coordinates[0], 10.75);
  assert.equal(parsed.features[0].geometry.coordinates[1], 59.91);
});

test("switching back to historical badges cancels pending Fysen fetch", async () => {
  let resolve;
  const f = fixture(() => new Promise(r => { resolve = r; }));
  const pending = f.api.setEnabled(true);
  assert.equal(f.requests.length, 1);
  await f.api.setEnabled(false);
  assert.equal(f.requests[0].options.signal.aborted, true);
  resolve({ ok: true, json: async () => good });
  assert.equal(await pending, false);
  assert.equal(f.sources.size, 0);
});

test("map picker integration preserves canonical places and explicit Fysen opt-in", () => {
  const controls = fs.readFileSync(new URL("../js/map-controls-runtime.ts", import.meta.url), "utf8");
  const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
  assert.match(controls, /if \(win\.HGFysenMap && win\.HGFysenMap\.isEnabled\(\)\) return \[\]/);
  assert.match(controls, /win\.HGFysenMap\.decorateOptions\(options, trigger, logos, label\)/);
  assert.match(controls, /hg:fysen-map-change/);
  assert.match(html, /dist\/web\/fysen-map-layer\.js/);
});
