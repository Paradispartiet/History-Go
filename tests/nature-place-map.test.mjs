import test, { afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(__dirname, "../js/ui/nature-place-map.js"), "utf8");
const windows = new Set();

afterEach(() => {
  for (const window of windows) window.close();
  windows.clear();
});

function runtime() {
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
    on(name, fn) { if (name === "load") fn(); }
    remove() {}
    getLayer(id) { return this.options.style.layers.find(layer => layer.id === id) || null; }
    getLayoutProperty(id, prop) {
      if (prop !== "visibility") return undefined;
      return this.visibility.has(id)
        ? this.visibility.get(id)
        : (this.getLayer(id)?.layout?.visibility || "visible");
    }
    setLayoutProperty(id, prop, value) {
      if (prop === "visibility") this.visibility.set(id, value);
    }
  }
  class FakeMarker {
    setLngLat(value) { this.lngLat = value; return this; }
    addTo(map) { this.map = map; return this; }
    remove() {}
  }
  window.maplibregl = {
    Map: FakeMap,
    Marker: FakeMarker,
    NavigationControl: class NavigationControl {}
  };
  window.__natureMaps = maps;
  window.eval(source);
  return window;
}

test("nature map refuses ordinary places", () => {
  const window = runtime();
  assert.equal(window.HGNaturePlaceMap.open({ id: "oslo", name: "Oslo", category: "by", lat: 59.9, lon: 10.7 }), false);
  assert.equal(window.document.getElementById("hgNaturePlaceMap"), null);
  assert.equal(window.__natureMaps.length, 0);
});

test("nature map uses Kartverket toporaster and the national hiking-route WMS", () => {
  const window = runtime();
  const place = { id: "oyungen", name: "Øyungen", category: "natur", lat: 60.046, lon: 10.733 };
  assert.equal(window.HGNaturePlaceMap.open(place), true);
  assert.equal(window.__natureMaps.length, 1);
  const map = window.__natureMaps[0];
  assert.deepEqual(Array.from(map.options.center), [10.733, 60.046]);
  assert.match(map.options.style.sources.kartverket_turkart.tiles[0], /cache\.kartverket\.no\/v1\/wmts\/1\.0\.0\/toporaster\/default\/webmercator/);
  assert.match(map.options.style.sources.kartverket_turruter.tiles[0], /wms\.geonorge\.no\/skwms1\/wms\.friluftsruter/);
  assert.match(decodeURIComponent(map.options.style.sources.kartverket_turruter.tiles[0]), /Fotrute,Sykkelrute,Skiloype,AnnenRute,Friluftslivtilrettelegging/);
  assert.equal(window.document.getElementById("hgNaturePlaceMap").hidden, false);
});

test("nature map includes optional Naturbase vern and NiN layers", () => {
  const window = runtime();
  window.HGNaturePlaceMap.open({ id: "n", name: "Natursted", category: "natur", lat: 60, lon: 10 });
  const map = window.__natureMaps[0];
  assert.match(map.options.style.sources.naturbase_vern.tiles[0], /miljodirektoratet\.no\/arcgis\/services\/vern\/mapserver\/WMSServer/);
  assert.match(map.options.style.sources.naturbase_nin.tiles[0], /miljodirektoratet\.no\/arcgis\/services\/naturtyper_nin\/MapServer\/WMSServer/);
  assert.equal(map.getLayoutProperty("naturbase-vern", "visibility"), "none");
  assert.equal(map.getLayoutProperty("naturbase-nin", "visibility"), "none");
});

test("nature map never delegates to or manipulates the History GO main map", () => {
  const window = runtime();
  let mainMapCalls = 0;
  window.map = { flyTo() { mainMapCalls += 1; }, easeTo() { mainMapCalls += 1; } };
  assert.equal(window.HGNaturePlaceMap.open({ id: "n", name: "Natursted", category: "natur", lat: 60, lon: 10 }), true);
  assert.equal(mainMapCalls, 0);
});

test("nature map refuses places without coordinates instead of guessing", () => {
  const window = runtime();
  assert.equal(window.HGNaturePlaceMap.open({ id: "n", name: "Natursted", category: "natur" }), false);
  assert.equal(window.__natureMaps.length, 0);
});
