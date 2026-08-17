const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const rel = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(rel(p), "utf8"));

const worldPath = "data/Civication/roleWorlds/naeringsliv/ekspeditor.json";
const modelPath = "data/Civication/roleModels/naeringsliv/ekspeditor.json";
const legacyModelPath = "data/Civication/roleModels/naeringsliv/ekspeditor_butikkmedarbeider.json";
const manifestPath = "data/Civication/roleModels/manifest.json";
const matrixPath = "data/Civication/careerGameplayMatrix.json";

const world = readJson(worldPath);
const model = readJson(modelPath);
const manifest = readJson(manifestPath);
const matrix = readJson(matrixPath);

assert.equal(world.schema, "civication_role_world_v1");
assert.equal(world.category, "naeringsliv");
assert.equal(world.role_scope, "ekspeditor");
assert.equal(world.status, "role_world_complete");
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ["morning", "lunch", "afternoon", "evening"]);
assert.equal(world.season.coverage.length, 56);

const coverageByKey = new Map();
const summaries = new Set();
for (const beat of world.season.coverage) {
  const key = `${beat.day}/${beat.phase}`;
  assert.ok(!coverageByKey.has(key), `duplicate coverage beat ${key}`);
  coverageByKey.set(key, beat);
  assert.ok(String(beat.summary || "").trim().length >= 40, `${key}: summary too thin`);
  assert.ok(!summaries.has(beat.summary), `${key}: duplicate summary`);
  summaries.add(beat.summary);
}
for (let day = 1; day <= 14; day += 1) {
  for (const phase of ["morning", "lunch", "afternoon", "evening"]) {
    assert.ok(coverageByKey.has(`${day}/${phase}`), `missing coverage ${day}/${phase}`);
  }
}

function findObjectId(value, wanted) {
  if (Array.isArray(value)) return value.some((item) => findObjectId(item, wanted));
  if (!value || typeof value !== "object") return false;
  if (String(value.id || "") === wanted) return true;
  return Object.values(value).some((item) => findObjectId(item, wanted));
}

function verifyMaterializationRef(refString) {
  const [filePath, objectId] = String(refString).split("#");
  assert.ok(filePath && objectId, `materialization ref must be file#id: ${refString}`);
  assert.ok(fs.existsSync(rel(filePath)), `missing materialization file ${filePath}`);
  const json = readJson(filePath);
  assert.ok(findObjectId(json, objectId), `missing materialization id ${objectId} in ${filePath}`);
}

for (const beat of world.season.coverage) {
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length > 0);
  beat.materialization_refs.forEach(verifyMaterializationRef);
}
for (const aftermath of world.private_aftermath) {
  aftermath.materialization_refs.forEach(verifyMaterializationRef);
}
for (const sourcePath of world.materialization.source_refs) {
  assert.ok(fs.existsSync(rel(sourcePath)), `missing Role World source ${sourcePath}`);
}

assert.ok(world.recurring_people_archetypes.length >= 6);
const npcIds = new Set(world.recurring_people_archetypes.map((npc) => npc.id));
for (const id of ["lene_butikksjef", "amir_erfaren_kollega", "vikaren_ny", "stamkunden", "jonas_venn", "familien"]) {
  assert.ok(npcIds.has(id), `missing recurring archetype ${id}`);
}

assert.ok(world.primary_threads.length >= 5);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, `${thread.id}: invalid beat count`);
  const days = new Set();
  for (const beatRef of thread.beat_refs) {
    assert.ok(coverageByKey.has(beatRef), `${thread.id}: missing beat ${beatRef}`);
    days.add(Number(beatRef.split("/")[0]));
  }
  assert.ok(days.size >= 3, `${thread.id}: must develop over at least three days`);
}

assert.ok(world.delayed_consequences.length >= 5);
for (const consequence of world.delayed_consequences) {
  assert.ok(coverageByKey.has(consequence.setup_ref), `${consequence.id}: missing setup`);
  assert.ok(coverageByKey.has(consequence.return_ref), `${consequence.id}: missing return`);
  const setupDay = Number(consequence.setup_ref.split("/")[0]);
  const returnDay = Number(consequence.return_ref.split("/")[0]);
  assert.ok(returnDay > setupDay, `${consequence.id}: consequence must return on a later day`);
}

assert.equal(world.materialization.no_new_runtime, true);
assert.equal(model.role_scope, "ekspeditor");
assert.equal(model.role_id, "naer_ekspeditor");
assert.equal(model.mail_integration.role_scope, "ekspeditor");
assert.equal(model.mail_integration.mail_profile, "naer_ekspeditor");
assert.ok((model.related_places || []).includes("storgata_handelsmiljo"));
assert.ok((model.work_life?.places || []).includes("storgata_handelsmiljo"));
assert.ok((model.notes || []).some((note) => /CareerRoleResolver/.test(note)));

assert.ok(manifest.files.includes(modelPath), "canonical Ekspeditor roleModel must be in manifest");
assert.ok(!manifest.files.includes(legacyModelPath), "legacy Ekspeditor roleModel path must be removed from manifest");
assert.equal(fs.existsSync(rel(legacyModelPath)), false, "legacy Ekspeditor roleModel file must be removed");

const careerWorld = (matrix.worlds || []).find((entry) => entry.key === "naeringsliv/ekspeditor");
assert.ok(careerWorld, "Ekspeditor must exist in Career Gameplay Matrix");
assert.equal(careerWorld.status, "reference_complete");
assert.equal(careerWorld.audit.complete_components.length, 15);
assert.equal(careerWorld.audit.missing_components.length, 0);
assert.equal(careerWorld.audit.components.places.level, "complete");
assert.equal(careerWorld.audit.life_story_complete, true);

console.log("civication-ekspeditor-role-world.test.js: PASS");
