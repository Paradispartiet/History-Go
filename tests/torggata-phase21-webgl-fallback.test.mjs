import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync("js/map.js", "utf8");

test("MapLibre WebGL failure degrades the map without aborting app boot", () => {
  const mapElement = {
    dataset: {},
    attributes: {},
    setAttribute(name, value) { this.attributes[name] = value; }
  };
  const warnings = [];
  const window = {
    maplibregl: {
      Map: class { constructor() { throw new Error("Failed to initialize WebGL"); } },
      NavigationControl: class {}
    }
  };
  const context = vm.createContext({
    window,
    document: {
      getElementById(id) { return id === "map" ? mapElement : null; },
      querySelector() { return null; },
      createElement() { return { dataset: {}, setAttribute() {}, appendChild() {} }; },
      body: { appendChild() {} }
    },
    localStorage: { getItem() { return null; }, setItem() {} },
    console: { ...console, warn(...args) { warnings.push(args.map(String).join(" ")); } },
    setTimeout,
    clearTimeout
  });
  vm.runInContext(source, context, { filename: "map.js" });

  assert.doesNotThrow(() => window.HGMap.initMap({ containerId: "map" }));
  assert.equal(window.HGMap.getMap(), null);
  assert.equal(mapElement.dataset.mapUnavailable, "1");
  assert.equal(mapElement.attributes["aria-label"], "Kart utilgjengelig – innhold kan fortsatt brukes");
  assert.ok(warnings.some((line) => line.includes("fortsetter uten kart")));
});
