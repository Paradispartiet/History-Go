#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const lifePath = path.join(repoRoot, "js/Civication/systems/civicationLifeMailRuntime.js");
const workdayPath = path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js");
const loaderPath = path.join(repoRoot, "js/Civication/civicationShellLoader.js");
const lifeSource = fs.readFileSync(lifePath, "utf8");
const workdaySource = fs.readFileSync(workdayPath, "utf8");
const loaderSource = fs.readFileSync(loaderPath, "utf8");

assert.match(lifeSource, /SCENE_SOURCE_ADAPTER_NAME\s*=\s*"life"/);
assert.match(lifeSource, /SCENE_SOURCE_FORMAT\s*=\s*"life_mail_manifest_v1"/);
assert.match(lifeSource, /ANSWER_MIDDLEWARE_NAME\s*=\s*"life_mail_runtime"/);
assert.match(lifeSource, /ANSWER_MIDDLEWARE_PRIORITY\s*=\s*30/);
assert.match(lifeSource, /async function getSourceScenes\(context = \{\}\)/);
assert.match(workdaySource, /async function getSourceScenes\(name, context = \{\}\)/);

const catalogIndex = loaderSource.indexOf('"js/Civication/systems/civicationWorkdayMailBuilder.js"');
const lifeIndex = loaderSource.indexOf('"js/Civication/systems/civicationLifeMailRuntime.js"');
assert(catalogIndex >= 0 && lifeIndex >= 0 && catalogIndex < lifeIndex, "SceneCatalog skal lastes før Life i standardruntime");

const onAppOpenStart = lifeSource.indexOf("proto.onAppOpen = async function lifeRuntimeOnAppOpen");
const onAppOpenEnd = lifeSource.indexOf("    registerAnswerMiddleware();", onAppOpenStart);
assert(onAppOpenStart >= 0 && onAppOpenEnd > onAppOpenStart, "Life onAppOpen-wrapper mangler");
const onAppOpenSource = lifeSource.slice(onAppOpenStart, onAppOpenEnd);
assert.match(onAppOpenSource, /catalog\.getSourceScenes\(SCENE_SOURCE_ADAPTER_NAME/);
assert.doesNotMatch(onAppOpenSource, /makeNextLifeMail\s*\(/, "standard Life onAppOpen skal ikke kalle produsenten direkte");

const fixtureManifest = {
  packs: [{
    id: "fixture_life_pack",
    path: "data/Civication/lifeMails/fixture_life_pack.json",
    priority: 10,
    when: { no_active_job: true }
  }]
};

const fixturePack = {
  id: "fixture_life_pack",
  life_context: "fixture_life",
  families: [{
    id: "fixture_life_family",
    mails: [{
      id: "fixture_life_scene",
      subject: "En livssituasjon",
      summary: "Du må velge hvordan du håndterer situasjonen.",
      priority: 10,
      choices: [
        { id: "A", label: "Ta det rolig", effect: 1 },
        { id: "B", label: "Gjør noe annet", effect: 0 }
      ]
    }]
  }]
};

function createHarness({ lifeFirst = false } = {}) {
  let state = {};
  const enqueued = [];

  function MockEventEngine() {}
  MockEventEngine.prototype.buildMailPool = async () => ({ role: "legacy", tag_rules: {}, tracks: [], mails: [] });
  MockEventEngine.prototype.onAppOpen = async () => ({ enqueued: false, reason: "legacy" });
  MockEventEngine.prototype.getPendingEvent = () => null;
  MockEventEngine.prototype.getState = () => state;
  MockEventEngine.prototype.enqueueEvent = (event) => { enqueued.push(event); return event; };

  const documentObject = {
    readyState: lifeFirst ? "loading" : "complete",
    addEventListener: () => {}
  };

  const windowObject = {
    DEBUG: false,
    addEventListener: () => {},
    dispatchEvent: () => true,
    CivicationState: {
      getState: () => state,
      setState: (patch) => { state = { ...state, ...patch }; return state; },
      getActivePosition: () => null,
      getInbox: () => []
    },
    CivicationCalendar: { getPhase: () => "morning" },
    CivicationEventEngine: MockEventEngine,
    CivicationJsonStore: {
      fetchJson: async (sourcePath) => {
        if (sourcePath === "data/Civication/lifeMails/life_manifest.json") return fixtureManifest;
        if (sourcePath === "data/Civication/lifeMails/fixture_life_pack.json") return fixturePack;
        return null;
      }
    }
  };
  windowObject.window = windowObject;

  const context = vm.createContext({
    window: windowObject,
    document: documentObject,
    console,
    Date,
    Array,
    Object,
    String,
    Number,
    Promise,
    Set,
    Map,
    Math,
    Event: class Event { constructor(type) { this.type = type; } }
  });

  if (lifeFirst) {
    vm.runInContext(lifeSource, context, { filename: lifePath });
  } else {
    vm.runInContext(workdaySource, context, { filename: workdayPath });
    vm.runInContext(lifeSource, context, { filename: lifePath });
  }

  return {
    context,
    windowObject,
    MockEventEngine,
    enqueued,
    getState: () => state
  };
}

(async () => {
  const standard = createHarness();
  const { windowObject, MockEventEngine, enqueued } = standard;
  const catalog = windowObject.CivicationSceneCatalog;
  const life = windowObject.CivicationLifeMailRuntime;

  assert(catalog, "SceneCatalog skal finnes før Life i standardruntime");
  assert(life, "Life runtime skal eksponeres");
  assert.equal(catalog.getSourceAdapter("life"), life.sourceAdapter);

  const adapters = Array.from(catalog.listSourceAdapters(), (entry) => ({
    name: String(entry.name),
    source_format: String(entry.source_format),
    version: Number(entry.version)
  }));
  assert.deepEqual(adapters, [{ name: "life", source_format: "life_mail_manifest_v1", version: 1 }]);

  const direct = await life.makeNextLifeMail({ active: null, state: standard.getState() });
  const scenes = await catalog.getSourceScenes("life", {
    active: null,
    state: standard.getState(),
    consumer: "fixture"
  });
  assert.equal(scenes.length, 1);
  const scene = scenes[0];
  assert.equal(scene.id, direct.id, "adapter-cutover skal ikke endre valgt Life-scene");
  assert.equal(scene.subject, direct.subject);
  assert.deepEqual(Array.from(scene.choices, (choice) => String(choice.id)), Array.from(direct.choices, (choice) => String(choice.id)));
  assert.equal(scene.mail_class, "life");
  assert.equal(scene.source_type, "life");
  assert.equal(scene.scene_source_adapter, "life");
  assert.equal(scene.scene_source_format, "life_mail_manifest_v1");
  assert.equal(scene.scene_catalog_owner, "CivicationSceneCatalog");
  assert.equal(scene.scene_catalog_version, 1);

  assert.equal(life.registerSceneSourceAdapter(), true, "samme Life-produsent skal kunne registreres idempotent");
  assert.equal(catalog.listSourceAdapters().length, 1);
  assert.equal(catalog.inspect().compiled_registry_ready, false, "4G-B skal ikke smuginnføre compiled registry");

  const engine = new MockEventEngine();
  const result = await engine.onAppOpen();
  assert.equal(result?.enqueued, true);
  assert.equal(result?.type, "life");
  assert.equal(result?.source_adapter, "life");
  assert.equal(enqueued.length, 1);
  assert.equal(enqueued[0]?.id, "fixture_life_scene");
  assert.equal(enqueued[0]?.scene_source_adapter, "life");

  const deferred = createHarness({ lifeFirst: true });
  assert.equal(deferred.windowObject.CivicationSceneCatalog, undefined);
  assert(Array.isArray(deferred.windowObject.__civicationSceneSourceAdapterQueue));
  assert.equal(deferred.windowObject.__civicationSceneSourceAdapterQueue.length, 1);
  assert.equal(deferred.windowObject.__civicationSceneSourceAdapterQueue[0].name, "life");

  vm.runInContext(workdaySource, deferred.context, { filename: workdayPath });
  const deferredCatalog = deferred.windowObject.CivicationSceneCatalog;
  assert(deferredCatalog, "SceneCatalog skal adoptere deferred Life-adapter");
  assert.equal(deferredCatalog.getSourceAdapter("life"), deferred.windowObject.CivicationLifeMailRuntime.sourceAdapter);
  assert.equal(deferredCatalog.listSourceAdapters().length, 1);

  console.log("civication-scene-source-adapter-life.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
