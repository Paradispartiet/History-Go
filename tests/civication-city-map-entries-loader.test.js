#!/usr/bin/env node
// tests/civication-city-map-entries-loader.test.js
//
// Statisk/headless sjekk av loader-modulen for Civication city map entries.
//
// Testen:
//   - bruker ikke browser
//   - bruker ikke fetch
//   - krever ikke DOM
// Den leser loaderfilen som tekst, evaluerer den i et minimalt window-sandbox
// (ingen fetch/DOM-tilgang trengs siden modulen ikke auto-kjører), og sjekker
// at de forventede funksjonene eksponeres via window.CivicationCityMapEntriesLoader.
//
// Kjør:  node tests/civication-city-map-entries-loader.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const loaderPath = path.join(repoRoot, "js/Civication/map/loadCivicationCityMapEntries.js");

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log("  ok  -", name);
  } catch (e) {
    failures += 1;
    console.error("FAIL  -", name);
    console.error("       ", e && e.message);
  }
}

console.log("Civication city map entries – loader-modul");

let source = "";
check("loaderfilen finnes", () => {
  assert.ok(fs.existsSync(loaderPath), "forventet fil: js/Civication/map/loadCivicationCityMapEntries.js");
  source = fs.readFileSync(loaderPath, "utf8");
  assert.ok(source.length > 0, "loaderfilen skal ikke være tom");
});

check("filen refererer window.CivicationCityMapEntriesLoader", () => {
  assert.ok(
    /CivicationCityMapEntriesLoader/.test(source),
    "kildeteksten skal eksponere CivicationCityMapEntriesLoader"
  );
});

check("modulen auto-kjører ikke (ingen fetch/DOM ved load)", () => {
  // Minimalt sandbox: window uten fetch og uten document. Hvis modulen forsøkte
  // å fetche eller røre DOM ved load, ville evalueringen feile her.
  const sandboxWindow = {};
  const context = { window: sandboxWindow };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "loadCivicationCityMapEntries.js" });

  assert.ok(
    sandboxWindow.CivicationCityMapEntriesLoader,
    "window.CivicationCityMapEntriesLoader skal være satt etter load"
  );

  const api = sandboxWindow.CivicationCityMapEntriesLoader;
  const expected = [
    "loadCivicationCityMapEntries",
    "transformCivicationCityMapEntries",
    "extractCivicationBuildingTypeIds",
    "indexCivicationPlacesById"
  ];
  for (const fnName of expected) {
    assert.strictEqual(typeof api[fnName], "function", `forventet funksjon: ${fnName}`);
  }
});

check("rene transform-funksjoner virker uten fetch/DOM", () => {
  const sandboxWindow = {};
  const context = { window: sandboxWindow };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "loadCivicationCityMapEntries.js" });
  const api = sandboxWindow.CivicationCityMapEntriesLoader;

  // extractCivicationBuildingTypeIds støtter array-, objekt- og nøkkelform.
  const idsArray = api.extractCivicationBuildingTypeIds({ buildingTypes: [{ id: "kafe" }, { id: "torg" }] });
  assert.ok(idsArray.has("kafe") && idsArray.has("torg"), "array-form skal gi id-er");

  const idsKeyed = api.extractCivicationBuildingTypeIds({ buildingTypes: { kafe: {}, torg: {} } });
  assert.ok(idsKeyed.has("kafe") && idsKeyed.has("torg"), "nøkkelform skal gi id-er");

  // indexCivicationPlacesById ignorerer entries uten string id.
  const byId = api.indexCivicationPlacesById([{ id: "p1", name: "A" }, { name: "uten id" }, { id: 5 }]);
  assert.strictEqual(byId.size, 1, "kun entries med string id skal indekseres");
  assert.strictEqual(byId.get("p1").name, "A");
});

check("transform støtter andre kategorier via expectedSourceFile/expectedCategory", () => {
  const sandboxWindow = {};
  const context = { window: sandboxWindow };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "loadCivicationCityMapEntries.js" });
  const api = sandboxWindow.CivicationCityMapEntriesLoader;

  const historiePlace = {
    id: "sagene_skole",
    name: "Sagene skole",
    category: "historie",
    lat: 59.9368,
    lon: 10.7556,
    emne_ids: ["em_his_skole_folkedannelse"]
  };
  const historieMapping = {
    schema: "civication.historyGoPlaceMapping.historie.v1",
    version: 1,
    sourceFile: "places/historie/oslo/places_historie.json",
    mappings: {
      map_sagene_skole: {
        id: "map_sagene_skole",
        historyGoPlaceId: "sagene_skole",
        historyGoSourceFile: "places/historie/oslo/places_historie.json",
        civicationPlaceId: "civi_historie_sagene_skole",
        name: "Sagene skole",
        category: "historie",
        lat: 59.9368,
        lon: 10.7556,
        emne_ids: ["em_his_skole_folkedannelse"],
        buildingTypeId: "building_historic_public_school",
        mapRole: "worker_district_school_history",
        visibleAs: "historic_school",
        socialFunctions: ["education"],
        phaseTypes: ["school_commute"],
        groundhopperRelevant: false,
        needsVerification: false
      }
    }
  };
  const buildingTypes = { buildingTypes: { building_historic_public_school: { id: "building_historic_public_school" } } };

  // Med riktige expected*-verdier transformeres historie-mappingen.
  const result = api.transformCivicationCityMapEntries({
    mappingData: historieMapping,
    placesData: [historiePlace],
    buildingTypesData: buildingTypes,
    expectedSourceFile: "places/historie/oslo/places_historie.json",
    expectedCategory: "historie",
    mappingFileRel: "data/Civication/map/historyGoPlaceMapping.historie.json",
    placesFileRel: "data/places/historie/oslo/places_historie.json"
  });
  assert.strictEqual(result.entries.length, 1, "historie-mappingen skal gi 1 entry");
  assert.strictEqual(result.entries[0].category, "historie", "entry skal beholde kategorien");
  assert.strictEqual(
    result.entries[0].source.mappingFile,
    "data/Civication/map/historyGoPlaceMapping.historie.json",
    "source.mappingFile skal peke på historie-mappingfilen"
  );

  // Uten expected*-verdier skal by-defaulten fortsatt avvise historie-data.
  assert.throws(
    () => api.transformCivicationCityMapEntries({
      mappingData: historieMapping,
      placesData: [historiePlace],
      buildingTypesData: buildingTypes
    }),
    /sourceFile/,
    "by-default skal avvise historie-mapping uten expected*-overstyring"
  );
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
