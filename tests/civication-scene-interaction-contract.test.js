const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const interactionPath = path.join(repoRoot, "js/Civication/systems/civicationSceneInteraction.js");
const workdayPath = path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js");
const loaderPath = path.join(repoRoot, "js/Civication/civicationShellLoader.js");
const taskGatePath = path.join(repoRoot, "js/Civication/systems/civicationDailyTaskGates.js");

const interactionSource = fs.readFileSync(interactionPath, "utf8");
const workdaySource = fs.readFileSync(workdayPath, "utf8");
const loaderSource = fs.readFileSync(loaderPath, "utf8");
const taskGateSource = fs.readFileSync(taskGatePath, "utf8");

const interactionNeedle = '"js/Civication/systems/civicationSceneInteraction.js"';
const runtimeNeedle = '"js/Civication/systems/civicationMailRuntime.js"';
const workdayNeedle = '"js/Civication/systems/civicationWorkdayMailBuilder.js"';
assert(loaderSource.includes(interactionNeedle), "SceneInteraction må være lastet i Civication-skallet");
assert(loaderSource.indexOf(interactionNeedle) < loaderSource.indexOf(runtimeNeedle));
assert(loaderSource.indexOf(interactionNeedle) < loaderSource.indexOf(workdayNeedle));
assert(taskGateSource.includes("CivicationSceneInteraction"), "Daily task gates skal bruke samme interaksjonskontrakt");

const active = {
  career_id: "fixture",
  role_id: "fixture_role",
  role_key: "fixture_role",
  title: "Fixture role",
  brand_id: "fixture_employer"
};
const state = {};
let sourceMode = "normal";
let legacyPackLoads = 0;
let legacyRoleLoads = 0;

function decision(id, count = 2, explicit) {
  const scene = {
    id,
    source_type: "planned",
    mail_type: "job",
    mail_family: "fixture_job",
    subject: id,
    choices: Array.from({ length: count }, (_, index) => ({
      id: String.fromCharCode(65 + index),
      label: `Valg ${index + 1}`
    }))
  };
  if (explicit) scene.interaction_mode = explicit;
  return scene;
}

const sourceSelector = async () => {
  if (sourceMode === "closed") {
    const closed = [];
    closed.__career_outcome_terminal_closed = true;
    return closed;
  }
  if (sourceMode === "empty") return [];
  if (sourceMode === "mixed") {
    return [
      decision("bad_decision", 1, "decision"),
      { id: "passive_info", source_type: "planned", mail_type: "knowledge", subject: "Info", choices: [] },
      { id: "ack_one", source_type: "planned", mail_type: "followup", subject: "Bekreft", choices: [{ id: "OK", label: "Bekreft" }] }
    ];
  }
  if (sourceMode === "suppressed") {
    return [
      decision("bad_decision", 1, "decision"),
      { id: "passive_info", source_type: "planned", mail_type: "knowledge", subject: "Info", choices: [] }
    ];
  }
  return [decision("valid_decision", 2)];
};

function MockEventEngine() {}
MockEventEngine.prototype.buildMailPool = async function previousBuildMailPool() {
  return { role: "previous", tag_rules: {}, tracks: [], mails: [{ id: "previous" }] };
};
MockEventEngine.prototype.resolvePackFile = () => "legacy.json";
MockEventEngine.prototype.loadPack = async () => {
  legacyPackLoads += 1;
  return { role: "legacy", tag_rules: {}, tracks: [], mails: [{ id: "legacy_pack" }] };
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
    getWorkdayDayIndex: () => 1
  },
  CivicationMailRuntime: {
    makeCandidateMailsForActiveRole: sourceSelector
  },
  CivicationEventEngine: MockEventEngine,
  CiviRoleStoryletBridge: {
    makeCandidateMailsForActiveRole: async () => {
      legacyRoleLoads += 1;
      return [{ id: "legacy_role" }];
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

vm.runInContext(interactionSource, context, { filename: interactionPath });
const interaction = windowObject.CivicationSceneInteraction;
assert(interaction, "CivicationSceneInteraction skal registreres globalt");
assert.deepEqual(Array.from(interaction.modes), ["decision", "task", "ack", "info"]);

let result = interaction.classify(decision("d2", 2));
assert.equal(result.mode, "decision");
assert.equal(result.valid, true);
assert.equal(result.actionable, true);

result = interaction.classify(decision("d1", 1, "decision"));
assert.equal(result.mode, "decision", "eksplisitt decision skal aldri nedgraderes til ack");
assert.equal(result.valid, false);
assert.equal(result.block_reason, "decision_requires_two_choices");

result = interaction.classify({ id: "ack", choices: [{ id: "OK", label: "OK" }] });
assert.equal(result.mode, "ack");
assert.equal(result.actionable, true);

result = interaction.classify({ id: "info", choices: [] });
assert.equal(result.mode, "info");
assert.equal(result.valid, true);
assert.equal(result.passive, true);
assert.equal(result.actionable, false);

const taskScene = interaction.decorate({
  id: "task_gate",
  mail_type: "task_gate",
  task_gate_id: "main_delivery",
  task_required: true,
  task_payload: { expected_output: "Beslutningsgrunnlag med anbefaling og risiko" },
  choices: [{ id: "A", label: "Gjør" }, { id: "B", label: "Vent" }]
});
assert.equal(taskScene.interaction_mode, "task");
assert.equal(taskScene.interaction_valid, true);
assert.equal(taskScene.task_contract.task_id, "main_delivery");
assert.equal(taskScene.task_contract.completion_rule, "Beslutningsgrunnlag med anbefaling og risiko");

result = interaction.classify({ interaction_mode: "info", choices: [{ id: "A", label: "Feil" }] });
assert.equal(result.valid, false);
assert.equal(result.block_reason, "info_requires_zero_choices");

vm.runInContext(workdaySource, context, { filename: workdayPath });

(async () => {
  const director = windowObject.CivicationSceneDirector;
  const catalog = windowObject.CivicationSceneCatalog;
  assert(director && catalog);

  const flattened = catalog.flattenCatalog({
    category: "fixture",
    role_scope: "fixture_role",
    mail_type: "knowledge",
    families: [{
      id: "fixture_family",
      mails: [
        { id: "two", subject: "To", choices: [{ id: "A", label: "A" }, { id: "B", label: "B" }] },
        { id: "one", subject: "En", choices: [{ id: "OK", label: "OK" }] },
        { id: "zero", subject: "Null", choices: [] }
      ]
    }]
  }, "fixture.json");
  assert.deepEqual(Array.from(flattened, (mail) => mail.interaction_mode), ["decision", "ack", "info"]);
  assert.deepEqual(Array.from(flattened, (mail) => mail.interaction_valid), [true, true, true]);

  sourceMode = "normal";
  let candidates = await director.getWorkCandidates(active, state, { consumer: "interaction_normal" });
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].interaction_mode, "decision");
  assert.equal(candidates[0].interaction_actionable, true);

  sourceMode = "mixed";
  candidates = await director.getWorkCandidates(active, state, { consumer: "interaction_mixed" });
  assert.equal(candidates.length, 1);
  assert.equal(candidates[0].id, "ack_one");
  assert.equal(candidates[0].interaction_mode, "ack");
  assert.equal(candidates.__scene_interaction_blocked_count, 1);
  assert.equal(candidates.__scene_interaction_passive_count, 1);

  const engine = new MockEventEngine();
  sourceMode = "suppressed";
  const suppressedPack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(suppressedPack.mails.length, 0);
  assert.equal(suppressedPack.__legacy_fallback, false, "passiv/blokkert canonical kilde skal ikke erstattes med legacy gameplay");
  assert.equal(suppressedPack.__interaction_suppressed, true);
  assert.equal(legacyPackLoads, 0);
  assert.equal(legacyRoleLoads, 0);

  sourceMode = "empty";
  const fallbackPack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(fallbackPack.__legacy_fallback, true, "reelt tom canonical kilde kan fortsatt bruke eksisterende fallback i denne porten");
  assert.equal(legacyPackLoads, 1);
  assert.equal(legacyRoleLoads, 1);

  sourceMode = "closed";
  const closedPack = await engine.buildMailPool(active, state, "fixture_role");
  assert.equal(closedPack.__terminal_closed, true);
  assert.equal(closedPack.__legacy_fallback, false);

  console.log("civication-scene-interaction-contract.test.js: PASS");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});