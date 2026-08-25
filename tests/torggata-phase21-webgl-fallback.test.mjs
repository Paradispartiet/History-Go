import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const mapSource = fs.readFileSync("js/map.js", "utf8");
const appSource = fs.readFileSync("js/app.js", "utf8");
const mapViewSource = fs.readFileSync("js/views/MapView.js", "utf8");
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
    maplibregl: window.maplibregl,
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

test("post-construction map failures remain fatal and are not mislabeled as WebGL fallback", () => {
  const mapElement = {
    dataset: {},
    setAttribute() {}
  };
  const window = {
    maplibregl: {
      Map: class {
        addControl() { throw new Error("Navigation control failed"); }
        on() {}
      },
      NavigationControl: class {}
    }
  };
  const context = vm.createContext({
    window,
    maplibregl: window.maplibregl,
    document: {
      getElementById(id) { return id === "map" ? mapElement : null; },
      querySelector() { return null; },
      createElement() { return { dataset: {}, setAttribute() {}, appendChild() {} }; },
      body: { appendChild() {} }
    },
    localStorage: { getItem() { return null; }, setItem() {} },
    console,
    setTimeout,
    clearTimeout
  });
  vm.runInContext(mapSource, context, { filename: "map.js" });

  assert.throws(
    () => window.HGMap.initMap({ containerId: "map" }),
    /Navigation control failed/
  );
  assert.equal(mapElement.dataset.mapUnavailable, undefined);
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
  assert.equal(error?.name, "Error");
  assert.match(String(error?.message), /MAP – kartet ble ikke initialisert/);
});

test("no-WebGL place routing opens Torggata directly instead of requiring map flyTo", () => {
  let openedPlace = null;
  const classNames = new Set();
  const window = {
    fetch() { throw new Error("not used"); },
    PLACES: [place],
    MAP: null,
    HGMap: {
      getMap() { return null; },
      resize() {}
    },
    openPlaceCard(nextPlace) { openedPlace = nextPlace; },
    setNearbyCollapsed() {},
    LayerManager: { setMode() {} }
  };
  const document = {
    body: {
      classList: {
        add(...names) { names.forEach((name) => classNames.add(name)); },
        remove(...names) { names.forEach((name) => classNames.delete(name)); }
      }
    },
    baseURI: "https://history-go.test/",
    getElementById() { return null; }
  };
  const context = vm.createContext({
    window,
    document,
    URL,
    Request,
    Response,
    Map,
    console
  });
  vm.runInContext(mapViewSource, context, { filename: "MapView.js" });

  assert.equal(window.HGMapView.openPlace("torggata"), true);
  assert.equal(openedPlace?.id, "torggata");
  assert.equal(classNames.has("hg-view-map"), true);
});

test("phase 19 remains historical while production re-QA records the final collection state", () => {
  assert.equal(place.category, "by");
  assert.deepEqual(Object.keys(phase19.rounds), ["people", "objects", "brands", "structures"]);
  assert.deepEqual(phase21.round_contract.content_rounds, ["people", "objects", "brands", "structures"]);
  assert.equal(phase21.round_contract.badge_separate, true);
  assert.deepEqual(place.round_profile.content_round_ids, ["people", "images", "brands", "related"]);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "objects"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(place, "structures"), false);
  assert.match(workcard, /People · Bilder · Brands · Relaterte steder/);
  assert.match(workcard, /GODKJENT ETTER PRODUKSJONS-RE-QA/);
  assert.match(workcard, /Torggata = SLUTTGODKJENT FOR CLOSEOUT-MERGE/);
});
