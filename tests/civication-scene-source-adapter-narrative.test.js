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
  streams: [
    { id: "fixture_leisure_stream", path: "data/Civication/narratives/fixture_leisure.json" },
    { id: "fagarbeider_work_stream", path: "data/Civication/narratives/fixture_work.json" }
  ]
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
      id: "offshift_people",
      time_slot: ["people"],
      subject: "Supporterprat utenom jobb",
      situation: ["En venn vil snakke om helgens kamp."],
      choices: [{ id: "A", label: "Snakk med vennen", effect: 0 }]
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
    },
    {
      id: "supporter_people",
      time_slot: ["people", "leisure"],
      subject: "Supportersamtale som privat aktivitet",
      situation: ["En privat interesse er ikke en arbeidsordre."],
      choices: [{ id: "A", label: "Inviter", effect: 0 }]
    }
  ]
};

const fixtureWorkStream = {
  schema: "civication_narrative_stream_v1",
  id: "fagarbeider_work_stream",
  type: "work",
  applies_when: { role_scopes: ["fagarbeider"] },
  storylets: [{
    id: "shift_start_followup", time_slot: ["work"], subject: "Morgenstatus fra linja",
    situation: ["Målinger fra produksjonslinja."],
    choices: [{ id: "A", label: "Kontroller målingen", effect: 0 }]
  }]
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
  CivicationCareerRoleResolver: { resolveCareerRoleScope: (position) => position?.role_key || "fixture_role" },
  CivicationWorkdayRuntime: { getEmployerId: () => "fixture_employer", getWorkdayDayIndex: () => 1 },
  CivicationMailRuntime: { makeCandidateMailsForActiveRole: async () => [] },
  CivicationEventEngine: MockEventEngine,
  CivicationJsonStore: {
    fetchJson: async (sourcePath) => {
      if (sourcePath === "data/Civication/narratives/manifest.json") return fixtureManifest;
      if (sourcePath === "data/Civication/narratives/fixture_leisure.json") return fixtureStream;
      if (sourcePath === "data/Civication/narratives/fixture_work.json") return fixtureWorkStream;
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

  // A player may have old work streams in history after switching jobs.
  // Their authored progress survives, but the wrong industry's workday does not.
  const staleNarrative = {
    active_streams: ["fagarbeider_work_stream"], stream_progress: {}, flags: []
  };
  const afterJobChange = await source.sourceAdapter.getActivationSnapshot({
    active, state, narrativeState: staleNarrative
  });
  assert.equal(afterJobChange.candidate_stream_ids.includes("fagarbeider_work_stream"), false,
    "an earlier factory work stream must not be a museum/other role candidate");
  const leakedWork = await catalog.getSourceScenes("narrative", {
    mode: "slot", phaseId: "forenoon", active, state,
    narrativeState: staleNarrative,
    candidate_stream_ids: ["fagarbeider_work_stream"],
    used_storylet_keys: [], date: "2026-08-15", ordinal: 1
  });
  assert.equal(leakedWork.length, 0, "even stale candidate IDs cannot show factory work");
  const injectedWrongWork = await catalog.getSourceScenes("narrative", {
    mode: "opened_streams", opened_stream_ids: ["fagarbeider_work_stream"],
    active, state, narrativeState: staleNarrative,
    exclude_storylet_keys: [], date: "2026-08-15", ordinal: 2
  });
  assert.equal(injectedWrongWork.length, 0, "role change also guards same-day injection");
  // A private supporter/people story must never become operational work at a
  // museum simply because the player has the relevant private interest.
  const noLeisureAtWork = await catalog.getSourceScenes("narrative", {
    mode: "slot", phaseId: "forenoon", active, state,
    narrativeState: { active_streams: ["fixture_leisure_stream"], stream_progress: {}, flags: [] },
    candidate_stream_ids: ["fixture_leisure_stream"],
    used_storylet_keys: [], date: "2026-08-15", ordinal: 3
  });
  assert.equal(noLeisureAtWork.length, 0,
    "private people/leisure storylets cannot occupy an employment phase");
  const factoryActive = { ...active, role_key: "fagarbeider" };
  const factoryDay = await catalog.getSourceScenes("narrative", {
    mode: "slot", phaseId: "forenoon", active: factoryActive, state,
    narrativeState: { active_streams: ["fagarbeider_work_stream"], stream_progress: {}, flags: [] },
    candidate_stream_ids: ["fagarbeider_work_stream"],
    used_storylet_keys: [], date: "2026-08-15", ordinal: 4
  });
  assert.equal(factoryDay.length, 1, "legitimate work streams still play in their own job");
  assert.equal(factoryDay[0].narrative_stream_id, "fagarbeider_work_stream");
  const leisureDuringPaidWork = await catalog.getSourceScenes("narrative", {
    mode: "slot", phaseId: "forenoon", active, state,
    narrativeState: { active_streams: ["fixture_leisure_stream"], stream_progress: {}, flags: [] },
    candidate_stream_ids: ["fixture_leisure_stream"],
    used_storylet_keys: [], date: "2026-08-15", ordinal: 3
  });
  assert.equal(leisureDuringPaidWork.length, 0,
    "off-duty supporter/people scenes must not appear during paid work phases");

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
    // Earlier people-slot scene remains available as a private interaction,
    // but this assertion explicitly verifies the later leisure storylet.
    exclude_storylet_keys: ["fixture_leisure_stream::first", "fixture_leisure_stream::offshift_people"],
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
  assert.equal(catalog.inspect().compiled_registry_ready, true, "4H-B skal eksponere compiled registry uten å endre narrative-adaptereierskap");

  console.log("civication-scene-source-adapter-narrative.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
