import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const mapSource = fs.readFileSync("js/map.js", "utf8");
const appSource = fs.readFileSync("js/app.js", "utf8");
const place = JSON.parse(fs.readFileSync("data/places/by/oslo/places/torggata.json", "utf8"));
const phase19 = JSON.parse(fs.readFileSync("reports/place-production/torggata-phase19-images-audit-v1.json", "utf8"));
const phase21 = JSON.parse(fs.readFileSync("reports/place-production/torggata-phase21-ui-qa-audit-v1.json", "utf8"));
const workcard = fs.readFileSync("reports/place-production/torggata-workcard-current.md", "utf8");

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
  vm.runInContext(mapSource, context, { filename: "map.js" });

  assert.doesNotThrow(() => window.HGMap.initMap({ containerId: "map" }));
  assert.equal(window.HGMap.getMap(), null);
  assert.equal(mapElement.dataset.mapUnavailable, "1");
  assert.equal(mapElement.attributes["aria-label"], "Kart utilgjengelig – innhold kan fortsatt brukes");
  assert.ok(warnings.some((line) => line.includes("fortsetter uten kart")));
});

test("index sanity accepts the explicit no-WebGL state but still rejects an unexplained missing map", () => {
  const start = appSource.indexOf("function assertCriticalIndexRuntime()");
  const end = appSource.indexOf("function markAppReady()", start);
  assert.ok(start >= 0 && end > start, "sanity function must remain extractable");

  const mapElement = { dataset: { mapUnavailable: "1" } };
  const window = {
    maplibregl: {},
    HGMap: { getMap() { return null; } },
    initLeftPanel() {},
    ViewportManager: { init() {} }
  };
  const document = {
    getElementById(id) {
      if (id === "map") return mapElement;
      if (["mapLayer", "nearbyList", "placeCard"].includes(id)) return {};
      return null;
    },
    querySelector(selector) {
      return [".app-shell", ".app-footer"].includes(selector) ? {} : null;
    }
  };
  const context = vm.createContext({ window, document, console });
  vm.runInContext(appSource.slice(start, end), context, { filename: "app-sanity.js" });

  assert.equal(context.assertCriticalIndexRuntime(), null);
  delete mapElement.dataset.mapUnavailable;
  const error = context.assertCriticalIndexRuntime();
  assert.ok(error instanceof Error);
  assert.match(error.message, /MAP – kartet ble ikke initialisert/);
});

test("Torggata phase 19 and 21 evidence preserves four content rounds plus a separate Badge", () => {
  assert.equal(place.category, "by");
  assert.equal(place.structures.length, 2);
  assert.deepEqual(Object.keys(phase19.rounds), ["people", "objects", "brands", "structures"]);
  assert.equal(phase19.rounds.structures.visible, 2);
  assert.equal(phase19.rounds.structures.preview_mode, "canonical_icon_and_count");
  assert.deepEqual(phase21.round_contract.content_rounds, ["people", "objects", "brands", "structures"]);
  assert.equal(phase21.round_contract.badge_separate, true);
  assert.ok(phase21.retained_ui_contracts.includes("four content rounds plus separate Badge"));
  assert.match(workcard, /fire innholdsrundinger: People, Objects, Brands og Structures/);
  assert.doesNotMatch(workcard, /tre innholdsrundinger|Structures\/Works er ikke valgt som canonical runding/);
});
