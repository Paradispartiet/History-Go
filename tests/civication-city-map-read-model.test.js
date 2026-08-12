#!/usr/bin/env node
// Statisk/headless kontrakt for hele Civication-bykartets read-model.
//
// History Go kan beskrive samme fysiske sted i flere faglige place-kilder.
// Civication skal likevel ha én runtime-kartnode per historyGoPlaceId. Read-modellen
// løser dette deterministisk med «første mapping i overview-rekkefølge vinner».
// Testen låser de fire kjente tverrfaglige aliasene og feiler på alle nye, slik at
// vi ikke forveksler legitim flerfaglighet med ukontrollert duplisering.

const fs = require("fs");
const path = require("path");
const vm = require("vm");
const assert = require("assert");

const repoRoot = path.resolve(__dirname, "..");
const modulePath = path.join(repoRoot, "js/Civication/map/CivicationCityMap.js");

let failures = 0;
function check(name, fn) {
  try { fn(); console.log("  ok  -", name); }
  catch (error) { failures += 1; console.error("FAIL  -", name); console.error("       ", error && error.message); }
}

function loadApi() {
  const source = fs.readFileSync(modulePath, "utf8");
  const sandboxWindow = {};
  const context = { window: sandboxWindow, console: { warn() {} } };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: "CivicationCityMap.js" });
  return sandboxWindow.CivicationCityMap;
}

console.log("Civication bykart – read-model (CivicationCityMap)");

check("modulen auto-kjører ikke og eksponerer forventet API", () => {
  assert.ok(fs.existsSync(modulePath));
  const api = loadApi();
  for (const fn of [
    "load", "isLoaded", "get", "getByCivicationId", "all",
    "isGroundhopperPlace", "diagnostics", "mergeCityMap",
    "indexBuildingTypes", "perPlaceMappingFilesFromOverview", "normalizeEntry"
  ]) {
    assert.strictEqual(typeof api[fn], "function", `forventet funksjon: ${fn}`);
  }
  assert.strictEqual(api.isLoaded(), false);
  assert.strictEqual(api.get("hva_som_helst"), null);
  assert.strictEqual(api.all().length, 0);
});

check("perPlaceMappingFilesFromOverview er stabil og dedupliserer stier", () => {
  const api = loadApi();
  const files = api.perPlaceMappingFilesFromOverview({
    sourceFileMappings: {
      a: { perPlaceMappingFile: "one.json" },
      b: { needsPerPlaceMapping: true },
      c: { perPlaceMappingFile: "two.json" },
      d: { perPlaceMappingFile: "one.json" }
    }
  });
  assert.deepStrictEqual(Array.from(files), ["one.json", "two.json"]);
});

check("mergeCityMap fletter, kobler byggtype og teller diagnostikk", () => {
  const api = loadApi();
  const buildingTypesData = { buildingTypes: {
    building_athletics_stadium: { id: "building_athletics_stadium", mapFunction: "sport_memory_place" },
    building_city_cathedral: { id: "building_city_cathedral", mapFunction: "institutional_place" }
  } };
  const fileA = { mappings: {
    map_bislett: {
      id: "map_bislett", historyGoPlaceId: "bislett", civicationPlaceId: "civi_sport_bislett",
      name: "Bislett", category: "sport", lat: 59.9, lon: 10.7, emne_ids: [],
      buildingTypeId: "building_athletics_stadium", mapRole: "athletics", visibleAs: "stadium",
      socialFunctions: ["sport"], phaseTypes: ["event_day"], groundhopperRelevant: true,
      needsVerification: false, needsEnrichment: true
    }
  } };
  const fileB = { mappings: {
    map_domkirke: {
      id: "map_domkirke", historyGoPlaceId: "oslo_domkirke", civicationPlaceId: "civi_historie_oslo_domkirke",
      name: "Oslo domkirke", category: "historie", lat: 59.91, lon: 10.74, emne_ids: ["em_x"],
      buildingTypeId: "building_city_cathedral", mapRole: "city_main_church", visibleAs: "church_landmark",
      socialFunctions: ["religion"], phaseTypes: ["ceremonial_day"], groundhopperRelevant: false,
      needsVerification: false
    },
    map_ukjent_bygg: {
      id: "map_ukjent_bygg", historyGoPlaceId: "sted_x", civicationPlaceId: "civi_x",
      name: "Sted X", category: "by", lat: 59.9, lon: 10.7, emne_ids: [],
      buildingTypeId: "building_finnes_ikke", mapRole: "r", visibleAs: "v",
      socialFunctions: ["a"], phaseTypes: ["b"], groundhopperRelevant: false, needsVerification: false
    },
    map_ugyldig: { id: "map_ugyldig" }
  } };

  const model = api.mergeCityMap({ mappingFiles: [fileA, fileB], buildingTypesData });
  assert.strictEqual(model.entries.length, 3);
  assert.strictEqual(model.diagnostics.skippedInvalid, 1);
  assert.strictEqual(model.diagnostics.groundhopperCount, 1);
  assert.strictEqual(model.diagnostics.needsEnrichmentCount, 1);
  assert.strictEqual(model.diagnostics.unknownBuildingTypeCount, 1);
  const bislett = model.byHistoryGoPlaceId.get("bislett");
  assert.strictEqual(bislett.mapFunction, "sport_memory_place");
  assert.strictEqual(model.byCivicationPlaceId.get("civi_sport_bislett"), bislett);
});

check("duplikat historyGoPlaceId løses deterministisk med første mapping", () => {
  const api = loadApi();
  const makeFile = (civ, role) => ({ mappings: { m: {
    id: "m_" + civ, historyGoPlaceId: "sted", civicationPlaceId: civ,
    name: "S", category: "by", lat: 1, lon: 1, emne_ids: [], buildingTypeId: "b",
    mapRole: role, visibleAs: "v", socialFunctions: [role], phaseTypes: ["b"],
    groundhopperRelevant: false, needsVerification: false
  } } });
  const model = api.mergeCityMap({ mappingFiles: [makeFile("civ_1", "first"), makeFile("civ_2", "second")], buildingTypesData: {} });
  assert.strictEqual(model.entries.length, 1);
  assert.deepStrictEqual(Array.from(model.diagnostics.skippedDuplicateHistoryGoPlaceId), ["sted"]);
  assert.strictEqual(model.byHistoryGoPlaceId.get("sted").civicationPlaceId, "civ_1");
});

check("hele kartgrunnlaget har bare de fire eksplisitt kjente tverrfaglige aliasene", () => {
  const api = loadApi();
  const overview = JSON.parse(fs.readFileSync(path.join(repoRoot, "data/Civication/map/historyGoPlaceMapping.json"), "utf8"));
  const buildingTypesData = JSON.parse(fs.readFileSync(path.join(repoRoot, "data/Civication/map/buildingTypes.json"), "utf8"));
  const files = api.perPlaceMappingFilesFromOverview(overview);
  assert.ok(files.length >= 20, `forventet mange mappingfiler, fikk ${files.length}`);
  const mappingFiles = files.map((rel) => JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8")));

  const occurrences = new Map();
  for (let fileIndex = 0; fileIndex < mappingFiles.length; fileIndex += 1) {
    const mappings = mappingFiles[fileIndex] && mappingFiles[fileIndex].mappings || {};
    for (const raw of Object.values(mappings)) {
      if (!raw || !raw.historyGoPlaceId || !raw.civicationPlaceId) continue;
      const id = String(raw.historyGoPlaceId);
      const list = occurrences.get(id) || [];
      list.push({ file: files[fileIndex], civicationPlaceId: String(raw.civicationPlaceId), raw });
      occurrences.set(id, list);
    }
  }

  const expectedAliases = ["akerselva", "alnaelva", "nrk_huset_marienlyst", "nydalen"].sort();
  const sourceAliases = Array.from(occurrences.entries())
    .filter(([, list]) => list.length > 1)
    .map(([id]) => id)
    .sort();
  assert.deepStrictEqual(sourceAliases, expectedAliases,
    "nye eller bortfalte tverrfaglige historyGoPlaceId-aliaser må vurderes eksplisitt");

  const model = api.mergeCityMap({ mappingFiles, buildingTypesData });
  assert.strictEqual(model.diagnostics.skippedInvalid, 0, "ingen ugyldige poster i ekte data");
  assert.deepStrictEqual(
    Array.from(model.diagnostics.skippedDuplicateHistoryGoPlaceId).sort(),
    expectedAliases,
    "runtime-deduplisering skal samsvare eksakt med det godkjente alias-settet"
  );
  assert.strictEqual(model.diagnostics.skippedDuplicateCivicationPlaceId.length, 0,
    "civicationPlaceId skal alltid være globalt unik");
  assert.strictEqual(model.diagnostics.unknownBuildingTypeCount, 0,
    "alle buildingTypeId skal finnes i buildingTypes.json");

  for (const id of expectedAliases) {
    const first = occurrences.get(id)[0];
    const winner = model.byHistoryGoPlaceId.get(id);
    assert.ok(winner, `${id}: canonical runtime-node mangler`);
    assert.strictEqual(winner.civicationPlaceId, first.civicationPlaceId,
      `${id}: første mapping i overview-rekkefølge skal være deterministisk canonical node`);
  }

  assert.ok(model.entries.length >= 300, `forventet 300+ entries, fikk ${model.entries.length}`);
  assert.strictEqual(model.entries.length, model.byHistoryGoPlaceId.size);
  assert.ok(model.diagnostics.groundhopperCount > 0);
  console.log("       (fletter " + model.entries.length + " steder; fire eksplisitte tverrfaglige aliaser dedupliseres deterministisk)");
});

if (failures > 0) {
  console.error("\n" + failures + " sjekk(er) feilet.");
  process.exit(1);
}
console.log("\nAlle sjekker bestod.");