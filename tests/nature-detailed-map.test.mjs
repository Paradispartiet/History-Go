import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "../js/ui/nature-detailed-map.js"), "utf8");
const windows = new Set();

afterEach(() => {
  for (const window of windows) window.close();
  windows.clear();
});

function makeRuntime() {
  const dom = new JSDOM("<!doctype html><head></head><body></body>", {
    url: "https://history-go.test/",
    runScripts: "outside-only"
  });
  const { window } = dom;
  windows.add(window);
  const maps = [];

  class FakeMap {
    constructor(options) {
      this.options = options;
      this.visibility = new Map();
      maps.push(this);
    }
    addControl() {}
    on(name, callback) { if (name === "load") callback(); }
    remove() {}
    getLayer(id) { return this.options.style.layers.find(layer => layer.id === id) || null; }
    getLayoutProperty(id, property) {
      if (property !== "visibility") return undefined;
      if (this.visibility.has(id)) return this.visibility.get(id);
      return this.getLayer(id)?.layout?.visibility || "visible";
    }
    setLayoutProperty(id, property, value) {
      if (property === "visibility") this.visibility.set(id, value);
    }
  }

  class FakeMarker {
    constructor(options) { this.options = options; }
    setLngLat(value) { this.lngLat = value; return this; }
    addTo(map) { this.map = map; return this; }
    remove() {}
  }

  window.maplibregl = {
    Map: FakeMap,
    Marker: FakeMarker,
    NavigationControl: class NavigationControl {}
  };
  window.__createdNatureMaps = maps;
  window.eval(source);
  return window;
}

test("ordinary places can never open the nature map", async () => {
  const window = makeRuntime();
  const ordinary = { id: "nationaltheatret", category: "scenekunst", lat: 59.914, lon: 10.734 };
  assert.equal(await window.HGNatureDetailedMap.openPlace(ordinary), false);
  assert.equal(window.__createdNatureMaps.length, 0);
  assert.equal(window.document.getElementById("hgNatureDetailedMap"), null);
});

test("nature places open an independent hiking map centered on canonical coordinates", async () => {
  const window = makeRuntime();
  let mainMapCalls = 0;
  window.map = {
    flyTo() { mainMapCalls += 1; },
    easeTo() { mainMapCalls += 1; },
    setCenter() { mainMapCalls += 1; }
  };
  const place = { id: "oyungen", name: "Øyungen", category: "natur", lat: 60.046, lon: 10.733 };

  assert.equal(await window.HGNatureDetailedMap.openPlace(place), true);
  assert.equal(window.__createdNatureMaps.length, 1);
  assert.deepEqual(Array.from(window.__createdNatureMaps[0].options.center), [10.733, 60.046]);
  assert.equal(mainMapCalls, 0);
  assert.equal(window.document.getElementById("hgNatureDetailedMap").hidden, false);
});

test("hiking map uses Kartverket toporaster and current Turrutebasen WMS", () => {
  const window = makeRuntime();
  const style = window.HGNatureDetailedMap.buildStyle();
  const base = style.sources.kartverket_turkart.tiles[0];
  const routes = decodeURIComponent(style.sources.kartverket_turruter.tiles[0]);

  assert.match(base, /cache\.kartverket\.no\/v1\/wmts\/1\.0\.0\/toporaster\/default\/webmercator/);
  assert.match(routes, /wms\.geonorge\.no\/skwms1\/wms\.friluftsruter2/);
  assert.match(routes, /LAYERS=Fotrute,Sykkelrute,Skiloype,AnnenRute/);
  assert.match(routes, /BBOX=\{bbox-epsg-3857\}/);
});

test("NiN nature types are an optional hidden overlay", () => {
  const window = makeRuntime();
  const style = window.HGNatureDetailedMap.buildStyle();
  const ninSource = decodeURIComponent(style.sources.naturbase_nin.tiles[0]);
  const ninLayer = style.layers.find(layer => layer.id === "naturbase-nin");

  assert.match(ninSource, /miljodirektoratet\.no\/arcgis\/services\/naturtyper_nin\/MapServer\/WMSServer/);
  assert.match(ninSource, /LAYERS=naturtyper_nin_alle/);
  assert.equal(ninLayer.layout.visibility, "none");
});

test("missing coordinates fail closed instead of guessing a map anchor", async () => {
  const window = makeRuntime();
  assert.equal(await window.HGNatureDetailedMap.openPlace({ id: "n", category: "natur" }), false);
  assert.equal(window.__createdNatureMaps.length, 0);
});

test("source code has no path that delegates to History GO main map", () => {
  assert.ok(!/window\.map|global\.map\.|flyTo\s*\(|easeTo\s*\(|setCenter\s*\(/.test(source));
});
