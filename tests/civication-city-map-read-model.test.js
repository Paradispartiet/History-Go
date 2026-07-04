#!/usr/bin/env node
// tests/civication-city-map-read-model.test.js
//
// Statisk/headless sjekk av read-model-modulen for hele Civication-bykartet
// (js/Civication/map/CivicationCityMap.js).
//
// Testen:
//   - bruker ikke browser
//   - bruker ikke fetch
//   - krever ikke DOM
// Den evaluerer modulen i et minimalt window-sandbox (modulen auto-kjører ikke),
// sjekker at window.CivicationCityMap eksponeres, og kjører de rene
// merge-/indeksfunksjonene mot små fixtures.
//
// I tillegg kobles read-modellen mot de EKTE mappingfilene og buildingTypes.json
// for å bekrefte at hele det committede kartgrunnlaget flettes uten duplikater.
//
// Kjør:  node tests/civication-city-map-read-model.test.js

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const modulePath = path.join(repoRoot, "js/Civication/map/CivicationCityMap.js");

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

console.log("Civication bykart – read-model (CivicationCityMap)");

function loadApi() {
  const source = fs.readFileSync(modulePath, "utf8");
  const sandboxWindow = {};
  const context = { window: sandboxWindow, console: { warn() {} } };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "CivicationCityMap.js" });
  return sandboxWindow.CivicationCityMap;
}

check("modulfilen finnes", () => {
  assert.ok(fs.existsSync(modulePath), "forventet fil: js/Civication/map/CivicationCityMap.js");
});

check("modulen auto-kjører ikke og eksponerer forventet API", () => {
  const api = loadApi();
  assert.ok(api, "window.CivicationCityMap skal være satt etter load");
  const expected = [
    "load", "isLoaded", "get", "getByCivicationId", "all",
    "isGroundhopperPlace", "diagnostics",
    "mergeCityMap", "indexBuildingTypes", "perPlaceMappingFilesFromOverview", "normalizeEntry"
  ];
  for (const fn of expected) {
    assert.strictEqual(typeof api[fn], "function", `forventet funksjon: ${fn}`);
  }
  // Ingen fetch ved import: oppslag før load() gir tomt/kontrollert svar.
  assert.strictEqual(api.isLoaded(), false, "skal ikke være lastet uten load()");
  assert.strictEqual(api.get("hva_som_helst"), null, "get skal gi null før load()");
  assert.strictEqual(api.all().length, 0, "all() skal være tom før load()");
  assert.strictEqual(api.isGroundhopperPlace("x"), false, "isGroundhopperPlace skal gi false før load()");
});

check("perPlaceMappingFilesFromOverview henter distinkte stier i rekkefølge", () => {
  const api = loadApi();
  const files = api.perPlaceMappingFilesFromOverview({
    sourceFileMappings: {
      a: { perPlaceMappingFile: "one.json" },
      b: { needsPerPlaceMapping: true }, // uten sti -> hoppes over
      c: { perPlaceMappingFile: "two.json" },
      d: { perPlaceMappingFile: "one.json" } // duplikat -> hoppes over
    }
  });
  assert.strictEqual(files.length, 2);
  assert.strictEqual(files[0], "one.json");
  assert.strictEqual(files[1], "two.json");
});

check("mergeCityMap fletter, kobler byggtype og teller diagnostikk", () => {
  const api = loadApi();
  const buildingTypesData = {
    buildingTypes: {
      building_athletics_stadium: { id: "building_athletics_stadium", mapFunction: "sport_memory_place" },
      building_city_cathedral: { id: "building_city_cathedral", mapFunction: "institutional_place" }
    }
  };
  const fileA = {
    mappings: {
      map_bislett: {
        id: "map_bislett", historyGoPlaceId: "bislett", civicationPlaceId: "civi_sport_bislett",
        name: "Bislett", category: "sport", lat: 59.9, lon: 10.7, emne_ids: [],
        buildingTypeId: "building_athletics_stadium", mapRole: "athletics", visibleAs: "stadium",
        socialFunctions: ["sport"], phaseTypes: ["event_day"],
        groundhopperRelevant: true, needsVerification: false, needsEnrichment: true
      }
    }
  };
  const fileB = {
    mappings: {
      map_domkirke: {
        id: "map_domkirke", historyGoPlaceId: "oslo_domkirke", civicationPlaceId: "civi_historie_oslo_domkirke",
        name: "Oslo domkirke", category: "historie", lat: 59.91, lon: 10.74, emne_ids: ["em_x"],
        buildingTypeId: "building_city_cathedral", mapRole: "city_main_church", visibleAs: "church_landmark",
        socialFunctions: ["religion"], phaseTypes: ["ceremonial_day"],
        groundhopperRelevant: false, needsVerification: false
      },
      map_ukjent_bygg: {
        id: "map_ukjent_bygg", historyGoPlaceId: "sted_x", civicationPlaceId: "civi_x",
        name: "Sted X", category: "by", lat: 59.9, lon: 10.7, emne_ids: [],
        buildingTypeId: "building_finnes_ikke", mapRole: "r", visibleAs: "v",
        socialFunctions: ["a"], phaseTypes: ["b"], groundhopperRelevant: false, needsVerification: false
      },
      map_ugyldig: { id: "map_ugyldig" } // mangler historyGoPlaceId/civicationPlaceId -> skippes
    }
  };

  const model = api.mergeCityMap({ mappingFiles: [fileA, fileB], buildingTypesData });
  assert.strictEqual(model.entries.length, 3, "3 gyldige poster skal flettes");
  assert.strictEqual(model.diagnostics.skippedInvalid, 1, "1 ugyldig post skal telles");
  assert.strictEqual(model.diagnostics.groundhopperCount, 1);
  assert.strictEqual(model.diagnostics.needsEnrichmentCount, 1);
  assert.strictEqual(model.diagnostics.unknownBuildingTypeCount, 1, "ukjent buildingTypeId skal telles");

  const bislett = model.byHistoryGoPlaceId.get("bislett");
  assert.ok(bislett, "bislett skal være indeksert på historyGoPlaceId");
  assert.strictEqual(bislett.mapFunction, "sport_memory_place", "mapFunction skal komme fra byggtypen");
  assert.strictEqual(model.byCivicationPlaceId.get("civi_sport_bislett"), bislett, "indeksert på civicationPlaceId");
});

check("mergeCityMap hopper over duplikate id-er på tvers av filer", () => {
  const api = loadApi();
  const makeFile = (civ) => ({
    mappings: {
      m: {
        id: "m", historyGoPlaceId: "sted", civicationPlaceId: civ, name: "S", category: "by",
        lat: 1, lon: 1, emne_ids: [], buildingTypeId: "b", mapRole: "r", visibleAs: "v",
        socialFunctions: ["a"], phaseTypes: ["b"], groundhopperRelevant: false, needsVerification: false
      }
    }
  });
  // Samme historyGoPlaceId i to filer -> nummer to hoppes over.
  const model = api.mergeCityMap({ mappingFiles: [makeFile("civ_1"), makeFile("civ_2")], buildingTypesData: {} });
  assert.strictEqual(model.entries.length, 1);
  assert.strictEqual(model.diagnostics.skippedDuplicateHistoryGoPlaceId.length, 1);
  assert.strictEqual(model.diagnostics.skippedDuplicateHistoryGoPlaceId[0], "sted");
});

check("read-modellen fletter HELE det committede kartgrunnlaget uten duplikater", () => {
  const api = loadApi();
  const overview = JSON.parse(fs.readFileSync(
    path.join(repoRoot, "data/Civication/map/historyGoPlaceMapping.json"), "utf8"));
  const buildingTypesData = JSON.parse(fs.readFileSync(
    path.join(repoRoot, "data/Civication/map/buildingTypes.json"), "utf8"));

  const files = api.perPlaceMappingFilesFromOverview(overview);
  assert.ok(files.length >= 20, `forventet mange mappingfiler, fikk ${files.length}`);

  const mappingFiles = files.map((rel) =>
    JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8")));

  const model = api.mergeCityMap({ mappingFiles, buildingTypesData });

  // Ingen poster skal gå tapt til duplikat eller ugyldighet i det ekte grunnlaget.
  assert.strictEqual(model.diagnostics.skippedInvalid, 0, "ingen ugyldige poster i ekte data");
  assert.strictEqual(model.diagnostics.skippedDuplicateHistoryGoPlaceId.length, 0, "ingen duplikate historyGoPlaceId");
  assert.strictEqual(model.diagnostics.skippedDuplicateCivicationPlaceId.length, 0, "ingen duplikate civicationPlaceId");
  assert.strictEqual(model.diagnostics.unknownBuildingTypeCount, 0, "alle buildingTypeId skal finnes i buildingTypes.json");
  assert.ok(model.entries.length >= 300, `forventet 300+ entries, fikk ${model.entries.length}`);
  assert.strictEqual(model.entries.length, model.byHistoryGoPlaceId.size, "entries og index skal ha samme størrelse");
  assert.ok(model.diagnostics.groundhopperCount > 0, "minst ett groundhopper-relevant sted");

  console.log("       (fletter " + model.entries.length + " steder, " +
    model.diagnostics.groundhopperCount + " groundhopper, " +
    model.diagnostics.needsEnrichmentCount + " needsEnrichment)");
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");
