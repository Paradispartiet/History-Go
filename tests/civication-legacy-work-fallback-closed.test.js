const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const repoRoot = process.env.CIVICATION_TEST_REPO_ROOT || path.resolve(__dirname, "..");
const corePath = path.join(repoRoot, "js/Civication/core/civicationEventEngine.js");
const workdayPath = path.join(repoRoot, "js/Civication/systems/civicationWorkdayMailBuilder.js");
const policyPath = path.join(repoRoot, "data/Civication/scenePipelinePolicyV1.json");

const core = fs.readFileSync(corePath, "utf8");
const workday = fs.readFileSync(workdayPath, "utf8");
const policy = JSON.parse(fs.readFileSync(policyPath, "utf8"));

function sliceBetween(source, startMarker, endMarker, label) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start);
  assert(start >= 0 && end > start, `${label} mangler`);
  return source.slice(start, end);
}

const corePool = sliceBetween(core, "async buildMailPool(active, state, role_key) {", "// -------- event selection --------", "core buildMailPool");
const onAppOpen = sliceBetween(core, "async onAppOpen(opts = {}) {", "async enqueueImmediateFollowupEvent()", "onAppOpen");
const immediateFollowup = sliceBetween(core, "async enqueueImmediateFollowupEvent()", "registerChosenMail(eventObj)", "enqueueImmediateFollowupEvent");
const directorPack = sliceBetween(workday, "async function buildEventEnginePack", "function patchEventEngineCandidateOwner", "SceneDirector buildEventEnginePack");
const directorPatch = sliceBetween(workday, "function patchEventEngineCandidateOwner", "function ensureSceneDirector", "SceneDirector EventEngine patch");

for (const [label, source] of [["core pool", corePool], ["Director pack", directorPack]]) {
  assert(!source.includes("resolvePackFile"), `${label} kan ikke resolve legacy pack`);
  assert(!source.includes("loadPack"), `${label} kan ikke laste legacy pack`);
  assert(!source.includes("CiviRoleStoryletBridge"), `${label} kan ikke åpne RoleStorylet-fallback`);
  assert(!source.includes("legacy_pack"), `${label} kan ikke materialisere legacy_pack`);
}

assert(!directorPatch.includes("previousBuildMailPool"), "Director-feil kan ikke falle tilbake til gammel buildMailPool");
assert(directorPatch.includes("__scene_director_error: true"), "Director-feil skal være eksplisitt fail-closed");
assert(directorPatch.includes("mails: []"), "Director-feil skal gi tom gameplay-pool");
assert(!core.includes("makeGenericCareerEvent("), "syntetisk generisk karrieregameplay skal være fjernet");
assert(!onAppOpen.includes('type: "generic"'), "onAppOpen kan ikke lage generisk fallback-gameplay");
assert(!immediateFollowup.includes('type: "generic"'), "followup kan ikke lage generisk fallback-gameplay");
assert(onAppOpen.includes('"no_runtime_candidates"'), "tom canonical pool skal være eksplisitt no-op");
assert(immediateFollowup.includes('"no_runtime_candidates"'), "tom followup-pool skal være eksplisitt no-op");

const registryContract = policy.compiled_scene_registry_contract || {};
const fallbackPolicy = registryContract.legacy_fallback_policy || {};
assert.equal(registryContract.completed_phase, "4H-D");
assert.equal(registryContract.next_phase, "role_world_editorial_standardization");
assert.equal(fallbackPolicy.jobbmails_runtime_gameplay_allowed, false);
assert.equal(fallbackPolicy.legacy_pack_runtime_fallback_allowed, false);
assert.equal(fallbackPolicy.generic_career_mail_runtime_fallback_allowed, false);
assert.equal(fallbackPolicy.role_storylet_runtime_fallback_allowed, false);
assert.equal(fallbackPolicy.previous_build_mail_pool_runtime_fallback_allowed, false);
assert.equal(fallbackPolicy.scene_director_error_mode, "fail_closed_no_gameplay");

console.log("civication-legacy-work-fallback-closed.test.js: PASS");
