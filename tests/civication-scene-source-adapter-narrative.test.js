#!/usr/bin/env node
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const narrativePath = path.join(repoRoot, "js/Civication/systems/civicationNarrativeSceneSource.js");
const workdayPath = path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js");
const dailyPath = path.join(repoRoot, "js/Civication/systems/civicationDailyMailBuilder.js");
const loaderPath = path.join(repoRoot, "js/Civication/civicationShellLoader.js");
const narrativeSource = fs.readFileSync(narrativePath, "utf8");
const workdaySource = fs.readFileSync(workdayPath, "utf8");
const dailySource = fs.readFileSync(dailyPath, "utf8");
const loaderSource = fs.readFileSync(loaderPath, "utf8");

assert.match(narrativeSource, /SCENE_SOURCE_ADAPTER_NAME\s*=\s*"narrative"/);
assert.match(narrativeSource, /SCENE_SOURCE_FORMAT\s*=\s*"civication_narrative_stream_v1"/);
assert.match(narrativeSource, /async function getActivationSnapshot\(context = \{\}\)/);
assert.match(narrativeSource, /async function getSourceScenes\(context = \{\}\)/);
assert.match(workdaySource, /async function getSourceScenes\(name, context = \{\}\)/);
assert.match(dailySource, /ANSWER_MIDDLEWARE_PRIORITY\s*=\s*40/);
assert.doesNotMatch(dailySource, /window\.CivicationNarrativeSceneSource/, "Daily skal ikke kjenne Narrative-produsenten direkte");

const catalogIndex = loaderSource.indexOf('"js/Civication/systems/civicationWorkdayMailBuilder.js"');
const narrativeIndex = loaderSource.indexOf('"js/Civication/systems/civicationNarrativeSceneSource.js"');
const dailyIndex = loaderSource.indexOf('"js/Civication/systems/civicationDailyMailBuilder.js"');
assert(catalogIndex >= 0 && narrativeIndex > catalogIndex && dailyIndex > narrativeIndex, "SceneCatalog -> Narrative -> Daily loaderrekkefølge skal være eksplisitt");

const buildQueueStart = dailySource.indexOf("async function buildQueue(active, options = {})");
const buildQueueEnd = dailySource.indexOf("  function getRuntime()", buildQueueStart);
assert(buildQueueStart >= 0 && buildQueueEnd > buildQueueStart, "Daily buildQueue mangler");
const buildQueueSource = dailySource.slice(buildQueueStart, buildQueueEnd);
assert.match(buildQueueSource, /getSourceAdapter\?\.\("narrative"\)/);
assert.match(buildQueueSource, /sceneCatalog\.getSourceScenes\("narrative"/);
assert.doesNotMatch(buildQueueSource, /loadNarrativeStreams\s*\(/, "normal dagskø skal ikke laste narrative-kilden direkte");
assert.doesNotMatch(buildQueueSource, /storyletsForSlot\s*\(/, "normal dagskø skal ikke eie storylet-seleksjonen direkte");
assert.doesNotMatch(buildQueueSource, /storyletToEvent\s*\(/, "normal dagskø skal ikke materialisere narrative-scenen direkte");

const injectionStart = dailySource.indexOf("async function findInjectableStoryletForOpenedStreams");
const injectionEnd = dailySource.indexOf("  function insertNarrativeStoryletAfterCurrent", injectionStart);
assert(injectionStart >= 0 && injectionEnd > injectionStart, "Narrative injection-funksjon mangler");
const injectionSource = dailySource.slice(injectionStart, injectionEnd);
assert.match(injectionSource, /sceneCatalog\.getSourceScenes\("narrative"/);
assert.doesNotMatch(injectionSource, /getAvailableNarrativeStreams\s*\(/, "same-day injection skal ikke lese narrative-kilden direkte");
assert.doesNotMatch(injectionSource, /storyletMatchesContext\s*\(/, "same-day injection skal ikke eie kilde-eligibility");

const fixtureManifest = {
  schema: "civication_narrative_manifest_v1",
  streams: [{ id: "fixture_leisure_stream", path: "data/Civication/narratives/fixture_leisure.json" }]
};
const fixtureStream = {
  schema: "civication_narrative_stream_v1",
  id: "fixture_leisure_stream",
  type: "leisure",
  title: "Fixture leisure",
  applies_when: { any_tags: ["fixture_interest"] },
  storylets: [
    {
      id: "first",
      time_slot: ["personal"],
      subject: "Første storylet",
      situation: ["En konkret privat situasjon."],
      choices: [
        { id: "A", label: "Velg A", effect: 1 },
        { id: "B", label: "Velg B", effect: 0 }
      ],
      opens_streams: ["fixture_leisure_stream"]
    },
    {
      id: "second",
      time_slot: ["leisure"],
      subject: "Andre storylet",
      situation: ["Situasjonen fortsetter."],
      choices: [
        { id: "A", label: "Fortsett", effect: 1 },
        { id: "B", label: "Avslutt", effect: 0 }
      ]
    }
  ]
};

const active = {
  career_id: "fixture_career",
  role_id: "fixture_role",
  role_key: "fixture_role",
  title: "Fixture role",
  brand_id: "fixture_employer",
  interests: ["fixture_interest"]
};
const state = { narrative_state_v1: { active_streams: [], stream_progress: {}, flags: [] } };

function MockEventEngine() {}
MockEventEngine.prototype.buildMailPool = async () => ({ role: "legacy", tag_rules: {}, tracks: [], mails: [] });

const windowObject = {
  DEBUG: false,
  CivicationState: {
    getState: () => state,
    getActivePosition: () => active
  },
  CivicationCareerRoleResolver: { resolveCareerRoleScope: () => "fixture_role" },
  CivicationWorkdayRuntime: { getEmployerId: () => "fixture_employer", getWorkdayDayIndex: () => 1 },
  CivicationMailRuntime: { makeCandidateMailsForActiveRole: async () => [] },
  CivicationEventEngine: MockEventEngine,
  CivicationJsonStore: {
    fetchJson: async (sourcePath) => {
      if (sourcePath === "data/Civication/narratives/manifest.json") return fixtureManifest;
      if (sourcePath === "data/Civication/narratives/fixture_leisure.json") return fixtureStream;
      return null;
    }
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

vm.runInContext(workdaySource, context, { filename: workdayPath });
vm.runInContext(narrativeSource, context, { filename: narrativePath });

(async () => {
  const catalog = windowObject.CivicationSceneCatalog;
  const source = windowObject.CivicationNarrativeSceneSource;
  assert(catalog, "SceneCatalog skal finnes");
  assert(source, "Narrative source skal eksponeres");
  assert.equal(catalog.getSourceAdapter("narrative"), source.sourceAdapter);

  const activation = await source.sourceAdapter.getActivationSnapshot({ active, state });
  assert.deepEqual(Array.from(activation.matched_stream_ids), ["fixture_leisure_stream"]);
  assert.deepEqual(Array.from(activation.candidate_stream_ids), ["fixture_leisure_stream"]);

  const narrativeState = {
    active_streams: activation.matched_stream_ids,
    stream_progress: {},
    flags: []
  };
  const scenes = await catalog.getSourceScenes("narrative", {
    mode: "slot",
    phaseId: "afternoon",
    phase: { id: "afternoon", label: "Ettermiddag" },
    slot: { slot: "friend_or_private_message", type: "people" },
    active,
    state,
    narrativeState,
    candidate_stream_ids: activation.candidate_stream_ids,
    used_storylet_keys: [],
    exclude_work_streams: true,
    date: "2026-08-15",
    ordinal: 7
  });
  assert(scenes.length >= 1);
  const scene = scenes[0];
  assert.equal(scene.id, "fixture_leisure_stream__first__2026-08-15__7");
  assert.equal(scene.subject, "Første storylet");
  assert.equal(scene.mail_class, "daily_private");
  assert.equal(scene.channel, "private");
  assert.equal(scene.narrative_stream_id, "fixture_leisure_stream");
  assert.equal(scene.narrative_storylet_id, "first");
  assert.deepEqual(Array.from(scene.choices, choice => String(choice.id)), ["A", "B"]);
  assert.equal(scene.scene_source_adapter, "narrative");
  assert.equal(scene.scene_source_format, "civication_narrative_stream_v1");
  assert.equal(scene.scene_catalog_owner, "CivicationSceneCatalog");
  assert.equal(scene.scene_catalog_version, 1);

  const injected = await catalog.getSourceScenes("narrative", {
    mode: "opened_streams",
    opened_stream_ids: ["fixture_leisure_stream"],
    exclude_storylet_keys: ["fixture_leisure_stream::first"],
    active,
    state,
    narrativeState,
    date: "2026-08-15",
    ordinal: 99
  });
  assert.equal(injected.length, 1);
  assert.equal(injected[0].narrative_storylet_id, "second");
  assert.deepEqual(Array.from(injected[0].narrative_source_meta.preferred_phases), ["evening"]);
  assert.equal(injected[0].phase_tag, "evening");
  assert.equal(injected[0].scene_source_adapter, "narrative");

  assert.equal(source.registerSceneSourceAdapter(), true, "samme narrative-produsent skal registreres idempotent");
  assert.equal(catalog.listSourceAdapters().filter(entry => entry.name === "narrative").length, 1);
  assert.equal(catalog.inspect().compiled_registry_ready, false, "4G-C skal ikke smuginnføre compiled registry");

  console.log("civication-scene-source-adapter-narrative.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
