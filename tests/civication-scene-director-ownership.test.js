const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const workdayPath = fs.existsSync(path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js"))
  ? path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js")
  : "/tmp/civicationWorkdayMailBuilder.js";
const dailyPath = path.join(repoRoot, "js/Civication/systems/civicationDailyMailBuilder.js");
const loaderPath = path.join(repoRoot, "js/Civication/civicationShellLoader.js");

const workdaySource = fs.readFileSync(workdayPath, "utf8");
assert(workdaySource.includes("window.CivicationSceneDirector = director"));
assert(workdaySource.includes("runtime.makeCandidateMailsForActiveRole = director.getWorkCandidates"));
assert(workdaySource.includes('consumer: "workday_mail_builder"'));
assert(workdaySource.includes('consumer: "event_engine_build_mail_pool"'));
assert(workdaySource.includes("__civicationSceneDirectorBuildMailPoolPatched"));

// Loaderrekkefølgen er en del av cutover-kontrakten: Director skal fange den
// komplette, outcome-aware selektoren etter at CareerOutcomeRuntime er lastet,
// men før DailyMailBuilder begynner å bruke legacy-navnet som Director-alias.
if (fs.existsSync(loaderPath)) {
  const loaderSource = fs.readFileSync(loaderPath, "utf8");
  const runtimeIndex = loaderSource.indexOf('"js/Civication/systems/civicationMailRuntime.js"');
  const outcomeIndex = loaderSource.indexOf('"js/Civication/systems/civicationCareerOutcomeRuntime.js"');
  const workdayIndex = loaderSource.indexOf('"js/Civication/systems/civicationWorkdayMailBuilder.js"');
  const dailyIndex = loaderSource.indexOf('"js/Civication/systems/civicationDailyMailBuilder.js"');
  assert(runtimeIndex >= 0 && outcomeIndex >= 0 && workdayIndex >= 0 && dailyIndex >= 0);
  assert(runtimeIndex < outcomeIndex, "MailRuntime skal lastes før outcome-utvidelsen");
  assert(outcomeIndex < workdayIndex, "SceneDirector skal fange outcome-aware selektor");
  assert(workdayIndex < dailyIndex, "Director-alias skal finnes før DailyMailBuilder lastes");
}

// DailyMailBuilder beholder sitt gamle kall i denne fasen. Det er bevisst:
// WorkdayBuilder lastes først og gjør dette runtime-navnet til en alias til
// SceneDirector. Dermed endres ikke Daily-flyten samtidig som eierskapet samles.
if (fs.existsSync(dailyPath)) {
  const dailySource = fs.readFileSync(dailyPath, "utf8");
  assert(dailySource.includes("window.CivicationMailRuntime?.makeCandidateMailsForActiveRole"));
}

const active = {
  career_id: "fixture",
  role_id: "fixture_role",
  role_key: "fixture_role",
  title: "Fixture role",
  brand_id: "fixture_employer"
};
const state = {};
let sourceCalls = 0;
let sourceMode = "runtime";
let previousBuildCalls = 0;
let loadPackCalls = 0;
let roleBridgeCalls = 0;

const outcomeAwareSourceSelector = async () => {
  sourceCalls += 1;
  if (sourceMode === "error") throw new Error("fixture source failure");
  if (sourceMode === "closed") {
    const closed = [];
    closed.__career_outcome_terminal_closed = true;
    return closed;
  }
  if (sourceMode === "fallback") return [];
  return [
    {
      id: "fixture_knowledge_001",
      source_type: "planned",
      mail_type: "knowledge",
      mail_family: "fixture_knowledge",
      subject: "Kunnskap",
      summary: "Bruk riktig metode.",
      choices: [
        { id: "A", label: "Dokumenter" },
        { id: "B", label: "Gjett" }
      ],
      fixture_outcome_aware: true
    }
  ];
};

const runtimeApi = {
  makeCandidateMailsForActiveRole: outcomeAwareSourceSelector
};

function MockEventEngine() {}
MockEventEngine.prototype.buildMailPool = async function previousBuildMailPool() {
  previousBuildCalls += 1;
  return {
    role: "previous",
    tag_rules: { max_tags_per_choice: 1, memory_window: 1 },
    tracks: [],
    mails: [{ id: "previous_fallback" }]
  };
};
MockEventEngine.prototype.resolvePackFile = function resolvePackFile() {
  return "fixtureLegacy.json";
};
MockEventEngine.prototype.loadPack = async function loadPack(packFile) {
  loadPackCalls += 1;
  assert.equal(packFile, "fixtureLegacy.json");
  return {
    role: "fixture_legacy",
    tag_rules: { max_tags_per_choice: 3, memory_window: 7 },
    tracks: ["legacy_track"],
    mails: [{ id: "legacy_pack_001", source_type: "wrong_legacy_type" }]
  };
};

const windowObject = {
  DEBUG: false,
  CivicationState: {
    getState: () => state,
    getActivePosition: () => active
  },
  CivicationCareerRoleResolver: {
    resolveCareerRoleScope: () => "fixture_role"
  },
  CivicationWorkdayRuntime: {
    getEmployerId: () => "fixture_employer",
    getWorkdayDayIndex: () => 3
  },
  CivicationMailRuntime: runtimeApi,
  CivicationEventEngine: MockEventEngine,
  CiviRoleStoryletBridge: {
    makeCandidateMailsForActiveRole: async () => {
      roleBridgeCalls += 1;
      return [{ id: "legacy_role_001" }];
    }
  }
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
  Map
});

vm.runInContext(workdaySource, context, { filename: workdayPath });

(async () => {
  const director = windowObject.CivicationSceneDirector;
  assert(director, "SceneDirector skal registreres globalt");
  assert.equal(director.version, 1);
  assert.equal(typeof director.getWorkCandidates, "function");
  assert.equal(typeof director.getPrimaryWorkScene, "function");
  assert.equal(typeof director.getEventEnginePack, "function");
  assert.strictEqual(
    runtimeApi.makeCandidateMailsForActiveRole,
    director.getWorkCandidates,
    "legacy-API skal være en alias til SceneDirector, ikke en parallell selektor"
  );
  assert.equal(
    MockEventEngine.prototype.__civicationSceneDirectorBuildMailPoolPatched,
    true,
    "EventEngines interne buildMailPool skal eies av SceneDirector"
  );

  const candidates = await director.getWorkCandidates(active, state, { consumer: "ownership_test" });
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].id, "fixture_knowledge_001");
  assert.equal(candidates[0].mail_type, "knowledge");
  assert.equal(candidates[0].fixture_outcome_aware, true, "outcome-aware kildeadapter skal bevares");

  const primary = await director.getPrimaryWorkScene(active, state, { consumer: "primary_test" });
  assert.equal(primary.id, "fixture_knowledge_001");

  const workdayCandidates = await windowObject.CivicationWorkdayMailBuilder.loadWorkdayCandidates(active, state);
  assert.equal(workdayCandidates.length, 1);
  assert.equal(workdayCandidates[0].id, "fixture_knowledge_001");

  const items = await windowObject.CivicationWorkdayMailBuilder.buildWorkdayItems(active, {
    state,
    date: "2026-08-14"
  });
  assert.equal(items.length, 1);
  assert.equal(items[0].phase, "forenoon");
  assert.equal(items[0].event.mail_class, "daily_workday");
  assert.equal(items[0].event.workday_day_index, 3);
  assert.equal(items[0].event.employer_id, "fixture_employer");

  const engine = new MockEventEngine();

  sourceMode = "runtime";
  const runtimePack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(runtimePack.__civication_scene_director, true);
  assert.equal(runtimePack.__legacy_fallback, false);
  assert.equal(runtimePack.__runtime_candidate_count, 1);
  assert.equal(runtimePack.mails.length, 1);
  assert.equal(runtimePack.mails[0].id, "fixture_knowledge_001");
  assert.equal(runtimePack.mails[0].source_type, "planned");
  assert.equal(previousBuildCalls, 0, "normal EventEngine-flyt skal ikke kalle gammel buildMailPool");
  assert.equal(loadPackCalls, 0, "legacy-pack skal ikke lastes når canonical kandidat finnes");

  sourceMode = "closed";
  const closedPack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(closedPack.__terminal_closed, true);
  assert.equal(closedPack.__legacy_fallback, false);
  assert.equal(closedPack.mails.length, 0);
  assert.equal(loadPackCalls, 0, "terminal karriere skal ikke åpne legacy-fallback");

  sourceMode = "fallback";
  const fallbackPack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(fallbackPack.__legacy_fallback, true);
  assert.equal(fallbackPack.__runtime_candidate_count, 0);
  assert.equal(fallbackPack.role, "fixture_legacy");
  assert.deepEqual(Array.from(fallbackPack.tracks), ["legacy_track"]);
  assert.deepEqual(
    Array.from(fallbackPack.mails, (mail) => `${mail.id}:${mail.source_type}`),
    ["legacy_role_001:role", "legacy_pack_001:legacy_pack"]
  );
  assert.equal(loadPackCalls, 1, "legacy-pack skal lastes nøyaktig én gang ved reelt innholdsgap");
  assert.equal(roleBridgeCalls, 1, "legacy role bridge skal bare kjøres i fallback");
  assert.equal(previousBuildCalls, 0, "canonical og legacy normalflyt skal begge eies av Director");

  const inspection = director.inspect();
  assert.equal(inspection.owner, "CivicationSceneDirector");
  assert.equal(
    inspection.source_adapter,
    "CivicationMailRuntime.makeCandidateMailsForActiveRole"
  );
  assert.equal(inspection.event_engine_candidate_owner, true);
  assert.deepEqual(
    Array.from(inspection.selection_trace, (row) => row.consumer),
    [
      "ownership_test",
      "primary_test",
      "workday_mail_builder",
      "workday_mail_builder",
      "event_engine_build_mail_pool",
      "event_engine_build_mail_pool",
      "event_engine_build_mail_pool"
    ]
  );
  assert.equal(sourceCalls, 7, "hver Director-resolusjon skal bruke nøyaktig én kildeseleksjon");

  sourceMode = "error";
  const failsafePack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(failsafePack.role, "previous");
  assert.equal(previousBuildCalls, 1, "forrige adapter brukes bare som eksplisitt feilsikring");
  assert.equal(sourceCalls, 8);

  console.log("civication-scene-director-ownership.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
