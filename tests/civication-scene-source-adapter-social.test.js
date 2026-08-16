#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const friendsPath = path.join(repoRoot, "js/Civication/systems/civicationFriendsEngine.js");
const workdayPath = path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js");
const socialPath = path.join(repoRoot, "js/Civication/systems/civicationSocialSceneSource.js");
const cityLayerPath = path.join(repoRoot, "js/Civication/ui/CivicationCityLayer.js");
const loaderPath = path.join(repoRoot, "js/Civication/civicationShellLoader.js");

const friendsSource = fs.readFileSync(friendsPath, "utf8");
const workdaySource = fs.readFileSync(workdayPath, "utf8");
const socialSource = fs.readFileSync(socialPath, "utf8");
const cityLayerSource = fs.readFileSync(cityLayerPath, "utf8");
const loaderSource = fs.readFileSync(loaderPath, "utf8");

assert.match(socialSource, /SCENE_SOURCE_ADAPTER_NAME\s*=\s*"social"/);
assert.match(socialSource, /SCENE_SOURCE_FORMAT\s*=\s*"civication_social_encounter_v1"/);
assert.match(socialSource, /catalog\.registerSourceAdapter\(SCENE_SOURCE_ADAPTER_NAME, sourceAdapter\)/);
assert.doesNotMatch(cityLayerSource, /CivicationSocialSceneSource/, "CityLayer skal konsumere social gjennom FriendsEngine-fasaden, ikke produsenten direkte");
assert.match(cityLayerSource, /eng\.getSocialEncountersForLocation/);

const workdayLoaderIndex = loaderSource.indexOf('"js/Civication/systems/civicationWorkdayMailBuilder.js"');
const socialLoaderIndex = loaderSource.indexOf('"js/Civication/systems/civicationSocialSceneSource.js"', workdayLoaderIndex);
const dailyLoaderIndex = loaderSource.indexOf('"js/Civication/systems/civicationDailyMailBuilder.js"', workdayLoaderIndex);
assert(workdayLoaderIndex >= 0, "Workday/SceneCatalog skal finnes i DAY_SCRIPTS");
assert(socialLoaderIndex > workdayLoaderIndex, "Social-adapteren skal lastes etter SceneCatalog");
assert(dailyLoaderIndex > socialLoaderIndex, "Social-adapteren skal være registrert før Daily fortsetter DAY-boot");

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, rel), "utf8"));
}

let state = {};
let cityLayerRerenders = 0;
function MockEventEngine() {}
MockEventEngine.prototype.buildMailPool = async () => ({ role: "legacy", tag_rules: {}, tracks: [], mails: [] });

const windowObject = {
  DEBUG: false,
  addEventListener() {},
  dispatchEvent() { return true; },
  CivicationState: {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; return state; },
    getActivePosition: () => null
  },
  CivicationCareerRoleResolver: { resolveCareerRoleScope: () => "" },
  CivicationWorkdayRuntime: {
    getEmployerId: () => "",
    getWorkdayDayIndex: () => 1
  },
  CivicationMailRuntime: { makeCandidateMailsForActiveRole: async () => [] },
  CivicationEventEngine: MockEventEngine,
  CivicationJsonStore: { fetchJson: async () => null },
  CivicationProfileSignalBridge: { getSignals: async () => null },
  CivicationCityLayer: { scheduleRender: () => { cityLayerRerenders += 1; } }
};
windowObject.window = windowObject;

const context = vm.createContext({
  window: windowObject,
  console,
  Date,
  Array,
  Object,
  String,
  Number,
  Boolean,
  Promise,
  Set,
  Map,
  Math,
  JSON,
  fetch: async () => { throw new Error("fetch should not be used in fixture"); }
});

vm.runInContext(friendsSource, context, { filename: friendsPath });
const engine = windowObject.CivicationFriendsEngine;
assert(engine, "FriendsEngine skal være lastet");

const locations = readJson("data/Civication/map/phaseLocations.json").phaseLocations;
const friends = readJson("data/Civication/map/friends.json").friends;
const snapshots = readJson("data/Civication/map/friendPhaseSnapshots.json").friendPhaseSnapshots;
const opts = { friends, snapshots, locations, dayIndex: 1 };

// Lås producer-ekvivalens før fasaden installeres.
const rawEncounter = engine.getSocialEncountersForLocation("leisure", "park", opts)[0];
assert(rawEncounter, "fixture skal gi et sosialt møte i park");
assert.equal(rawEncounter.friendId, "friend_demo_01");
assert.equal(rawEncounter.action, "approach");
assert.deepEqual(Array.from(rawEncounter.responseOptions), ["reply", "ignore", "decline"]);

// Standard 4G-D-rekkefølge: Workday oppretter Catalog før Social cutover.
vm.runInContext(workdaySource, context, { filename: workdayPath });
const catalog = windowObject.CivicationSceneCatalog;
assert(catalog, "SceneCatalog skal finnes før Social-adapteren lastes");
assert.equal(catalog.getSourceAdapter("social"), null);

vm.runInContext(socialSource, context, { filename: socialPath });
const social = windowObject.CivicationSocialSceneSource;
assert(social, "Social source adapter skal være lastet");
assert.equal(catalog.getSourceAdapter("social"), social.sourceAdapter);
assert.equal(cityLayerRerenders, 1, "cutover skal be eksisterende CityLayer rendere på nytt");

const adapters = Array.from(catalog.listSourceAdapters(), (entry) => ({
  name: String(entry.name),
  source_format: String(entry.source_format),
  version: Number(entry.version)
}));
assert.deepEqual(adapters, [{
  name: "social",
  source_format: "civication_social_encounter_v1",
  version: 1
}]);

const viaFacade = engine.getSocialEncountersForLocation("leisure", "park", opts);
assert.equal(viaFacade.length, 1);
const scene = viaFacade[0];
assert.equal(scene.friendId, rawEncounter.friendId, "cutover skal bevare valgt person");
assert.equal(scene.friendName, rawEncounter.friendName);
assert.equal(scene.locationId, rawEncounter.locationId);
assert.equal(scene.phase, rawEncounter.phase);
assert.equal(scene.action, rawEncounter.action);
assert.equal(scene.actionLabel, rawEncounter.actionLabel);
assert.deepEqual(Array.from(scene.responseOptions), Array.from(rawEncounter.responseOptions));
assert.equal(scene.scene_source_adapter, "social");
assert.equal(scene.scene_source_format, "civication_social_encounter_v1");
assert.equal(scene.scene_catalog_owner, "CivicationSceneCatalog");
assert.equal(scene.scene_catalog_version, 1);
assert.equal(engine.canApproachFriendAtLocation("friend_demo_01", "leisure", "park", opts), true);
assert.equal(engine.canApproachFriendAtLocation("friend_demo_02", "leisure", "park", opts), false);

(async () => {
  const fromCatalog = await catalog.getSourceScenes("social", {
    phase: "leisure",
    locationId: "park",
    options: opts,
    consumer: "regression"
  });
  assert.equal(fromCatalog.length, 1);
  assert.equal(fromCatalog[0].friendId, rawEncounter.friendId);
  assert.equal(fromCatalog[0].scene_source_adapter, "social");
  assert.equal(fromCatalog[0].scene_catalog_owner, "CivicationSceneCatalog");

  // Samme adapter kan registreres igjen uten et konkurrerende eierlag.
  assert.equal(social.registerSceneSourceAdapter(), true);
  assert.equal(catalog.listSourceAdapters().length, 1);
  assert.equal(catalog.inspect().compiled_registry_ready, false, "4G-D skal ikke smuginnføre compiled registry");
  const inspection = social.inspect();
  assert.equal(inspection.adapter_name, "social");
  assert.equal(inspection.source_format, "civication_social_encounter_v1");
  assert.equal(inspection.version, 1);
  assert.equal(inspection.registered, true);
  assert.equal(inspection.catalog_owner, "CivicationSceneCatalog");
  assert.equal(inspection.compiled_registry_ready, false);
  assert.equal(inspection.friends_engine_facade_installed, true);

  console.log("civication-scene-source-adapter-social.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
