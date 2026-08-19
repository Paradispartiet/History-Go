const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const workdayPath = path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js");
const workdaySource = fs.readFileSync(workdayPath, "utf8");

assert(workdaySource.includes("window.CivicationSceneCatalog = catalog"));
assert(workdaySource.includes("populateDailyExtraSlots"));
assert(workdaySource.includes("__civicationSceneDirectorCatalogPatched"));
assert(workdaySource.includes('consumer: "daily_mail_builder_extra_slots"'));

const active = {
  career_id: "fixture",
  role_id: "fixture_role",
  role_key: "fixture_role",
  title: "Fixture role",
  brand_id: "fixture_employer"
};

let state = {};
let sourceMode = "runtime";
let sourceCalls = 0;
const primary = {
  id: "primary_job",
  source_type: "planned",
  mail_type: "job",
  mail_family: "job_primary",
  phase: "intro",
  choices: [
    { id: "A", label: "A" },
    { id: "B", label: "B" }
  ]
};

const sourceSelector = async () => {
  sourceCalls += 1;
  if (sourceMode === "closed") {
    const closed = [];
    closed.__career_outcome_terminal_closed = true;
    return closed;
  }
  return [primary];
};

function mail(id, type, family) {
  return {
    id,
    mail_type: type,
    mail_family: family,
    phase: "intro",
    priority: 10,
    summary: id,
    choices: [
      { id: "A", label: `${id} A` },
      { id: "B", label: `${id} B` }
    ]
  };
}

function catalog(type, mails) {
  return {
    category: "fixture",
    role_scope: "fixture_role",
    mail_type: type,
    families: [{ id: `${type}_family`, mails }]
  };
}

const catalogs = {
  "data/Civication/mailFamilies/fixture/job/fixture_role_job.json": catalog("job", [
    mail("job_extra", "job", "job_extra")
  ]),
  "data/Civication/mailFamilies/fixture/micro/fixture_role_micro.json": catalog("micro", [
    mail("micro_one", "micro", "micro_choice")
  ]),
  "data/Civication/mailFamilies/fixture/knowledge/fixture_role_knowledge.json": catalog("knowledge", [
    mail("knowledge_one", "knowledge", "knowledge_ops")
  ]),
  "data/Civication/mailFamilies/fixture/people/fixture_role_people.json": catalog("people", [
    mail("people_one", "people", "people_ping")
  ]),
  "data/Civication/mailFamilies/fixture/conflict/fixture_role_conflict.json": catalog("conflict", [
    mail("conflict_one", "conflict", "conflict_case")
  ]),
  "data/Civication/mailFamilies/fixture/followup/fixture_role_followup.json": catalog("followup", [
    mail("followup_one", "followup", "followup_case")
  ]),
  "data/Civication/mailFamilies/fixture/consequence/fixture_role_consequence.json": catalog("consequence", [
    mail("consequence_one", "consequence", "consequence_case")
  ]),
  "data/Civication/mailPlans/fixture/fixture_role_plan.json": {
    id: "fixture_plan",
    sequence: [{ phase: "intro", allowed_families: ["job_primary"] }]
  }
};


const COMPILED_REGISTRY_PATH = "data/Civication/compiledSceneRegistryV1.json";
const fixtureEntries = Object.entries(catalogs)
  .filter(([sourcePath]) => sourcePath.includes("/mailFamilies/"))
  .flatMap(([sourcePath, value]) => (value.families || []).flatMap((family) => (family.mails || []).map((sourceMail) => ({
    id: sourceMail.id,
    category: value.category,
    role_scope: value.role_scope,
    mail_type: sourceMail.mail_type || value.mail_type || "job",
    source_path: sourcePath,
    compatibility_projection: {
      ...sourceMail,
      id: sourceMail.id,
      category: value.category,
      role_scope: sourceMail.role_scope || value.role_scope,
      mail_type: sourceMail.mail_type || value.mail_type || "job",
      mail_family: sourceMail.mail_family || family.id,
      choices: (sourceMail.choices || []).map((choice) => ({
        ...choice,
        id: String(choice.id || "").trim(),
        label: String(choice.label || choice.text || choice.id || "").trim(),
        effect: Number(choice.effect || 0),
        tags: Array.isArray(choice.tags) ? choice.tags.map((tag) => String(tag).trim()).filter(Boolean) : [],
        feedback: String(choice.feedback || "").trim()
      })),
      situation: Array.isArray(sourceMail.situation) ? sourceMail.situation : [sourceMail.summary].filter(Boolean),
      scene_catalog_source_path: sourcePath,
      scene_catalog_version: 1
    }
  }))));
catalogs[COMPILED_REGISTRY_PATH] = {
  schema: "compiled_scene_registry_v1",
  version: 1,
  registry_hash: "fixture_registry_hash",
  stats: { shadowed_duplicate_count: 0 },
  shadowed_duplicates: [],
  entries: fixtureEntries,
  role_index: { "fixture/fixture_role": fixtureEntries.map((entry) => entry.id) }
};

const underlyingCalls = [];
const store = {
  fetchJson: async (sourcePath) => {
    underlyingCalls.push(sourcePath);
    return catalogs[sourcePath] || null;
  }
};

function MockEventEngine() {}
MockEventEngine.prototype.buildMailPool = async function buildMailPool() {
  return { role: "legacy", tag_rules: {}, tracks: [], mails: [] };
};

const windowObject = {
  DEBUG: false,
  CivicationState: {
    getState: () => state,
    setState: (patch) => {
      state = { ...state, ...patch };
      return state;
    },
    getActivePosition: () => active
  },
  CivicationCareerRoleResolver: {
    resolveCareerRoleScope: () => "fixture_role"
  },
  CivicationWorkdayRuntime: {
    getEmployerId: () => "fixture_employer",
    getWorkdayDayIndex: () => 4
  },
  CivicationMailRuntime: {
    makeCandidateMailsForActiveRole: sourceSelector
  },
  CivicationEventEngine: MockEventEngine,
  CivicationJsonStore: store,
  CivicationCareerKnowledgeBridge: {
    decorateMail: async (sourceMail) => ({
      ...sourceMail,
      decorated_by_bridge: true
    })
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
  Map,
  Math
});
vm.runInContext(workdaySource, context, { filename: workdayPath });

function generated(id) {
  return {
    id,
    source_type: "daily_generated",
    mail_type: "phase",
    choices: [
      { id: "A", label: "A" },
      { id: "B", label: "B" }
    ]
  };
}

function row(phase, slot, event) {
  return { status: "queued", phase, slot, event };
}

let legacyCatalogValue = "unset";
let prewarmLegacyValue = "unset";
let startOptions = null;
const dailyBuilder = {
  buildQueue: async (activeArg, options = {}) => {
    legacyCatalogValue = await windowObject.CivicationJsonStore.fetchJson(
      "data/Civication/mailFamilies/fixture/micro/fixture_role_micro.json"
    );
    const candidates = await windowObject.CivicationMailRuntime.makeCandidateMailsForActiveRole(
      activeArg,
      state
    );
    const planned = candidates[0] || null;
    const rows = [];
    if (planned) {
      rows.push(row("forenoon", "primary_work_mail", {
        ...planned,
        daily_mail_meta: {
          advances_role_plan: true,
          source_mail_id: planned.id
        }
      }));
    }
    rows.push(row("forenoon", "small_choice", generated("g_small")));
    rows.push(row("forenoon", "operational_mail", generated("g_operational")));
    rows.push(row("forenoon", "people_ping", generated("g_people")));
    rows.push(row("workday", "main_delivery", generated("g_main")));
    rows.push(row("workday", "conflict_or_event", generated("g_conflict")));
    rows.push(row("workday", "analysis_followup", generated("g_followup")));
    rows.push(row("workday", "operational_batch", generated("g_batch")));
    return {
      version: 1,
      date: options.date || "2026-08-14",
      role_scope: "fixture_role",
      items: rows,
      delivered_ids: [],
      answered_ids: [],
      current_index: 0,
      runtime_instance_key: ""
    };
  },
  prewarm: async () => {
    prewarmLegacyValue = await windowObject.CivicationJsonStore.fetchJson(
      "data/Civication/mailFamilies/fixture/micro/fixture_role_micro.json"
    );
    return { warmed: true };
  },
  startToday: async (options) => {
    startOptions = options;
    return { ok: true, runtime: state.mail_day_runtime_v1 };
  },
  enqueueNext: async () => ({ enqueued: false, reason: "fixture" }),
  enqueuePhaseBundle: async () => ({ enqueued: false, reason: "fixture" }),
  inspect: () => ({ base: true })
};

windowObject.CivicationDailyMailBuilder = dailyBuilder;

(async () => {
  assert.equal(windowObject.CivicationSceneCatalog.version, 1);
  assert.equal(
    windowObject.CivicationDailyMailBuilder.__civicationSceneDirectorCatalogPatched,
    true
  );
  assert.equal(typeof windowObject.CivicationSceneDirector.getDailyCatalog, "function");
  assert.equal(typeof windowObject.CivicationSceneDirector.populateDailyExtraSlots, "function");

  const runtime = await windowObject.CivicationDailyMailBuilder.buildQueue(active, {
    date: "2026-08-14"
  });
  assert.equal(legacyCatalogValue, null, "Dailys gamle kataloglesing skal være undertrykt");
  assert.equal(runtime.__scene_director_daily_extras, true);
  assert.equal(runtime.daily_extra_owner, "CivicationSceneDirector");
  assert.equal(runtime.scene_catalog_version, 1);
  assert.equal(runtime.daily_extra_catalog_count, 7);

  const extras = runtime.items.filter((runtimeRow) => runtimeRow.event.source_type === "daily_extra");
  assert.equal(extras.length, 7);
  assert.equal(new Set(extras.map((runtimeRow) => runtimeRow.event.source_mail_id)).size, 7);
  assert(extras.every((runtimeRow) => runtimeRow.event.scene_catalog_owner === "CivicationSceneCatalog"));
  assert(extras.every((runtimeRow) => runtimeRow.event.decorated_by_bridge === true));
  assert(extras.every((runtimeRow) => runtimeRow.event.workday_day_index === 4));
  assert.equal(runtime.items[0].event.id, "primary_job");
  assert.deepEqual(
    extras.map((runtimeRow) => runtimeRow.event.mail_type).sort(),
    ["conflict", "consequence", "followup", "job", "knowledge", "micro", "people"].sort()
  );
  const operational = runtime.items.find((runtimeRow) => runtimeRow.slot === "operational_mail");
  const peoplePing = runtime.items.find((runtimeRow) => runtimeRow.slot === "people_ping");
  assert.equal(operational.event.mail_type, "knowledge", "operational_mail skal velge knowledge foran job når tidligere prioritet er utilgjengelig");
  assert.equal(peoplePing.event.mail_type, "people", "people_ping skal velge people når people finnes");

  const rebuilt = await windowObject.CivicationSceneDirector.populateDailyExtraSlots(active, state, runtime);
  const rebuiltExtras = rebuilt.items.filter((runtimeRow) => runtimeRow.event.source_type === "daily_extra");
  const rebuiltOperational = rebuilt.items.find((runtimeRow) => runtimeRow.slot === "operational_mail");
  const rebuiltPeoplePing = rebuilt.items.find((runtimeRow) => runtimeRow.slot === "people_ping");
  assert.equal(rebuiltOperational.event.mail_type, "knowledge", "rebuild skal ikke reservere knowledge-kilden som slotten selv skal erstatte");
  assert.equal(rebuiltPeoplePing.event.mail_type, "people", "rebuild skal ikke reservere people-kilden som slotten selv skal erstatte");
  assert.equal(
    new Set(rebuiltExtras.map((runtimeRow) => runtimeRow.event.source_mail_id)).size,
    rebuiltExtras.length,
    "rebuild skal bevare no-duplicate source-ID-garantien"
  );

  const microPath = "data/Civication/mailFamilies/fixture/micro/fixture_role_micro.json";
  assert.equal(
    underlyingCalls.filter((sourcePath) => sourcePath === microPath).length,
    0,
    "Etter 4H-B skal normal runtime aldri lese rå mailFamilies"
  );
  assert.equal(
    underlyingCalls.filter((sourcePath) => sourcePath === COMPILED_REGISTRY_PATH).length,
    1,
    "SceneCatalog skal lese det materialiserte registryet én gang"
  );

  const prewarm = await windowObject.CivicationDailyMailBuilder.prewarm(active);
  assert.equal(prewarmLegacyValue, null);
  assert.equal(prewarm.selection_owner, "CivicationSceneDirector");
  assert.equal(prewarm.scene_catalog.owner, "CivicationSceneCatalog");

  await windowObject.CivicationDailyMailBuilder.startToday({
    active,
    forceNew: true,
    enqueue: false
  });
  assert.equal(state.mail_day_runtime_v1.__scene_director_daily_extras, true);
  assert.equal(startOptions.forceNew, false, "Intern Daily-runtime skal gjenbruke Director-køen");

  sourceMode = "closed";
  const closed = await windowObject.CivicationDailyMailBuilder.buildQueue(active, {
    date: "2026-08-15"
  });
  assert.equal(closed.daily_extra_terminal_closed, true);
  assert.equal(closed.daily_extra_catalog_count, 0);
  assert.equal(
    closed.items.filter((runtimeRow) => runtimeRow.event.source_type === "daily_extra").length,
    0
  );

  const inspection = windowObject.CivicationSceneDirector.inspect();
  assert.equal(inspection.scene_catalog_owner, "CivicationSceneCatalog");
  assert.equal(inspection.daily_extra_slot_owner, true);
  assert.equal(inspection.scene_catalog.owner, "CivicationSceneCatalog");
  assert.equal(inspection.scene_catalog.source_format, "compiled_scene_registry_v1");
  assert.equal(inspection.scene_catalog.compiled_registry_ready, true);
  assert(sourceCalls >= 3);

  console.log("civication-scene-director-daily-catalog.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
