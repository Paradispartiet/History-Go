const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const workdayPath = fs.existsSync(path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js"))
  ? path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js")
  : "/tmp/civicationWorkdayMailBuilder.js";
const dailyPath = path.join(repoRoot, "js/Civication/systems/civicationDailyMailBuilder.js");

const workdaySource = fs.readFileSync(workdayPath, "utf8");
assert(workdaySource.includes("window.CivicationSceneDirector = director"));
assert(workdaySource.includes("runtime.makeCandidateMailsForActiveRole = director.getWorkCandidates"));
assert(workdaySource.includes('consumer: "workday_mail_builder"'));

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

const outcomeAwareSourceSelector = async () => {
  sourceCalls += 1;
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
  CivicationMailRuntime: runtimeApi
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
  assert.strictEqual(
    runtimeApi.makeCandidateMailsForActiveRole,
    director.getWorkCandidates,
    "legacy-API skal være en alias til SceneDirector, ikke en parallell selektor"
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

  const inspection = director.inspect();
  assert.equal(inspection.owner, "CivicationSceneDirector");
  assert.equal(
    inspection.source_adapter,
    "CivicationMailRuntime.makeCandidateMailsForActiveRole"
  );
  assert.deepEqual(
    Array.from(inspection.selection_trace, (row) => row.consumer),
    ["ownership_test", "primary_test", "workday_mail_builder", "workday_mail_builder"]
  );
  assert.equal(sourceCalls, 4, "hver Director-resolusjon skal bruke nøyaktig én kilde-seleksjon");

  console.log("civication-scene-director-ownership.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
