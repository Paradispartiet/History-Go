#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const privatePath = path.join(repoRoot, "js/Civication/systems/civicationPrivatePhaseMailBuilder.js");
const workdayPath = path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js");
const dailyPath = path.join(repoRoot, "js/Civication/systems/civicationDailyMailBuilder.js");
const privateSource = fs.readFileSync(privatePath, "utf8");
const workdaySource = fs.readFileSync(workdayPath, "utf8");
const dailySource = fs.readFileSync(dailyPath, "utf8");

assert.match(privateSource, /SCENE_SOURCE_ADAPTER_NAME\s*=\s*"private"/);
assert.match(privateSource, /source_format:\s*SCENE_SOURCE_FORMAT/);
assert.match(workdaySource, /function registerSourceAdapter\(name, adapter\)/);
assert.match(workdaySource, /async function getSourceScenes\(name, context = \{\}\)/);
assert.doesNotMatch(dailySource, /window\.CivicationPrivatePhaseMailBuilder/, "Daily skal ikke kjenne private-produsenten direkte");
assert.match(dailySource, /sceneCatalog\.getSourceScenes\("private"/);

const fixtureFamily = {
  id: "fixture_private_afternoon",
  mails: [{
    id: "fixture_private_scene",
    topic: "rest",
    subject: "En rolig ettermiddag",
    summary: "Du velger hvordan ettermiddagen skal brukes.",
    choices: [
      { id: "A", label: "Ta en pause", effect: 1 },
      { id: "B", label: "Gå en tur", effect: 0 }
    ]
  }]
};

const active = {
  career_id: "fixture_career",
  role_id: "fixture_role",
  role_key: "fixture_role",
  title: "Fixture role",
  brand_id: "fixture_employer"
};

let state = {};
function MockEventEngine() {}
MockEventEngine.prototype.buildMailPool = async () => ({ role: "legacy", tag_rules: {}, tracks: [], mails: [] });

const windowObject = {
  DEBUG: false,
  CivicationState: {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; return state; },
    getActivePosition: () => active
  },
  CivicationCareerRoleResolver: { resolveCareerRoleScope: () => "fixture_role" },
  CivicationWorkdayRuntime: {
    getEmployerId: () => "fixture_employer",
    getWorkdayDayIndex: () => 1
  },
  CivicationMailRuntime: { makeCandidateMailsForActiveRole: async () => [] },
  CivicationEventEngine: MockEventEngine,
  CivicationJsonStore: {
    load: async (sourcePath) => sourcePath.endsWith("/afternoon.json") ? fixtureFamily : null,
    fetchJson: async () => null
  },
  CivicationProfileSignalBridge: { getSignals: async () => null }
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
  Promise,
  Set,
  Map,
  Math
});

// Production load order: Private is loaded before Workday/SceneCatalog.
vm.runInContext(privateSource, context, { filename: privatePath });
assert.equal(windowObject.CivicationSceneCatalog, undefined);
assert(Array.isArray(windowObject.__civicationSceneSourceAdapterQueue));
assert.equal(windowObject.__civicationSceneSourceAdapterQueue.length, 1);
assert.equal(windowObject.__civicationSceneSourceAdapterQueue[0].name, "private");

vm.runInContext(workdaySource, context, { filename: workdayPath });
const catalog = windowObject.CivicationSceneCatalog;
assert(catalog, "SceneCatalog skal opprettes av Workday-builderen");
assert.equal(typeof catalog.registerSourceAdapter, "function");
assert.equal(typeof catalog.getSourceScenes, "function");
assert.equal(catalog.getSourceAdapter("private"), windowObject.CivicationPrivatePhaseMailBuilder.sourceAdapter);

const adapters = Array.from(catalog.listSourceAdapters(), (entry) => ({
  name: String(entry.name),
  source_format: String(entry.source_format),
  version: Number(entry.version)
}));
assert.deepEqual(adapters, [{ name: "private", source_format: "private_phase_mail_families_v1", version: 1 }]);

(async () => {
  const direct = await windowObject.CivicationPrivatePhaseMailBuilder.buildPhaseMail("afternoon", active, { date: "2026-08-15" });
  const scenes = await catalog.getSourceScenes("private", {
    phaseId: "afternoon",
    active,
    date: "2026-08-15",
    consumer: "fixture"
  });
  assert.equal(scenes.length, 1);
  const scene = scenes[0];
  assert.equal(scene.id, direct.id, "adapter-cutover skal ikke endre valgt privat scene");
  assert.equal(scene.subject, direct.subject);
  assert.deepEqual(Array.from(scene.choices, (choice) => String(choice.id)), Array.from(direct.choices, (choice) => String(choice.id)));
  assert.equal(scene.channel, "private");
  assert.equal(scene.mail_class, "daily_private");
  assert.equal(scene.scene_source_adapter, "private");
  assert.equal(scene.scene_source_format, "private_phase_mail_families_v1");
  assert.equal(scene.scene_catalog_owner, "CivicationSceneCatalog");
  assert.equal(scene.scene_catalog_version, 1);

  // Re-registration of the same producer is idempotent and creates no parallel owner.
  assert.equal(windowObject.CivicationPrivatePhaseMailBuilder.registerSceneSourceAdapter(), true);
  assert.equal(catalog.listSourceAdapters().length, 1);
  assert.equal(catalog.inspect().compiled_registry_ready, false, "4G-A skal ikke smuginnføre compiled registry");

  console.log("civication-scene-source-adapter-private.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
