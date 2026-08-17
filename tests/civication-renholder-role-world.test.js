const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const rel = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(rel(p), 'utf8'));

const worldPath = 'data/Civication/roleWorlds/naeringsliv/renholder.json';
const modelPath = 'data/Civication/roleModels/naeringsliv/renholder.json';
const matrixPath = 'data/Civication/careerGameplayMatrix.json';
const themeBankPath = 'data/Civication/roleWorldThemeBank.json';

const world = readJson(worldPath);
const model = readJson(modelPath);
const matrix = readJson(matrixPath);
const themeBank = readJson(themeBankPath);

assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.category, 'naeringsliv');
assert.equal(world.role_scope, 'renholder');
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning', 'lunch', 'afternoon', 'evening']);
assert.equal(world.season.coverage.length, 56);
assert.deepEqual(world.theme_ids, themeBank.reference_profiles['naeringsliv/renholder']);

const coverageByKey = new Map();
const summaries = new Set();
for (const beat of world.season.coverage) {
  const key = `${beat.day}/${beat.phase}`;
  assert.ok(!coverageByKey.has(key), `duplicate coverage beat ${key}`);
  coverageByKey.set(key, beat);
  assert.ok(String(beat.summary || '').trim().length >= 70, `${key}: summary too thin`);
  assert.ok(!summaries.has(beat.summary), `${key}: duplicate summary`);
  summaries.add(beat.summary);
}
for (let day = 1; day <= 14; day += 1) {
  for (const phase of ['morning', 'lunch', 'afternoon', 'evening']) {
    assert.ok(coverageByKey.has(`${day}/${phase}`), `missing coverage ${day}/${phase}`);
  }
}

function findObjectId(value, wanted) {
  if (Array.isArray(value)) return value.some((item) => findObjectId(item, wanted));
  if (!value || typeof value !== 'object') return false;
  if (String(value.id || '') === wanted) return true;
  return Object.values(value).some((item) => findObjectId(item, wanted));
}

const materializationUse = new Map();
function verifyMaterializationRef(refString) {
  const [filePath, objectId] = String(refString).split('#');
  assert.ok(filePath && objectId, `materialization ref must be file#id: ${refString}`);
  assert.ok(fs.existsSync(rel(filePath)), `missing materialization file ${filePath}`);
  const source = readJson(filePath);
  assert.ok(findObjectId(source, objectId), `missing materialization id ${objectId} in ${filePath}`);
  materializationUse.set(refString, (materializationUse.get(refString) || 0) + 1);
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

assert.ok(materializationUse.size >= 30, `expected broad provenance, got ${materializationUse.size} unique refs`);
const seasonUse = new Map();
for (const beat of world.season.coverage) {
  for (const refString of beat.materialization_refs) {
    seasonUse.set(refString, (seasonUse.get(refString) || 0) + 1);
  }
}
assert.ok(Math.max(...seasonUse.values()) <= 4, 'no single authored source may carry more than four season beats');

assert.ok(world.recurring_people_archetypes.length >= 7);
const npcIds = new Set(world.recurring_people_archetypes.map((npc) => npc.id));
for (const id of ['kari_driftsleder', 'amina_erfaren_renholder', 'leo_ny_vikar', 'ole_verneombud', 'sindre_kontoransatt', 'grete_skadet_kollega', 'sara_privat']) {
  assert.ok(npcIds.has(id), `missing recurring archetype ${id}`);
}

assert.ok(world.primary_threads.length >= 6);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10, `${thread.id}: invalid beat count`);
  const days = new Set();
  for (const beatRef of thread.beat_refs) {
    assert.ok(coverageByKey.has(beatRef), `${thread.id}: missing beat ${beatRef}`);
    days.add(Number(beatRef.split('/')[0]));
  }
  assert.ok(days.size >= 3, `${thread.id}: must develop over at least three days`);
}

const phaseOrder = new Map([['morning', 0], ['lunch', 1], ['afternoon', 2], ['evening', 3]]);
const orderOf = (beatRef) => {
  const [day, phase] = beatRef.split('/');
  assert.ok(phaseOrder.has(phase), `unknown phase in ${beatRef}`);
  return Number(day) * 10 + phaseOrder.get(phase);
};
assert.ok(world.delayed_consequences.length >= 6);
for (const consequence of world.delayed_consequences) {
  assert.ok(coverageByKey.has(consequence.setup_ref), `${consequence.id}: missing setup`);
  assert.ok(coverageByKey.has(consequence.return_ref), `${consequence.id}: missing return`);
  assert.ok(orderOf(consequence.return_ref) > orderOf(consequence.setup_ref), `${consequence.id}: consequence must return later`);
}

assert.equal(world.materialization.no_new_runtime, true);
assert.equal(model.role_scope, 'renholder');
assert.equal(model.role_id, 'naer_renholder');
assert.equal(model.mail_integration.role_scope, 'renholder');
assert.equal(model.mail_integration.mail_profile, 'naer_renholder');
assert.equal(model.mail_integration.can_feed_mail_types.length, 9);
for (const mailType of ['job', 'people', 'conflict', 'story', 'event', 'micro', 'followup', 'knowledge', 'consequence']) {
  assert.ok(model.mail_integration.can_feed_mail_types.includes(mailType), `roleModel missing mail type ${mailType}`);
}
assert.ok(model.related_people.length >= 10);
assert.ok(model.related_places.length >= 8);
assert.ok(model.required_knowledge.people_connections.length >= 10);
assert.ok(model.required_knowledge.place_connections.length >= 8);
assert.ok(!(model.notes || []).some((note) => /uten Praksisfortellinger/i.test(note)), 'stale pre-practice note must be removed');

const resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
assert.equal(resolver.resolveCareerRoleScope({ career_id: 'naeringsliv', role_id: 'naer_renholder' }), 'renholder');
assert.equal(resolver.resolveCareerRoleScope({ career_id: 'naeringsliv', title: 'Renholder' }), 'renholder');

const careerWorld = (matrix.worlds || []).find((entry) => entry.key === 'naeringsliv/renholder');
assert.ok(careerWorld, 'Renholder must exist in Career Gameplay Matrix');
assert.equal(careerWorld.status, 'reference_complete');
assert.equal(careerWorld.audit.complete_components.length, 15);
assert.equal(careerWorld.audit.missing_components.length, 0);
assert.equal(careerWorld.audit.life_story_complete, true);
assert.deepEqual(careerWorld.audit.practice_weeks, [1, 2]);

console.log('civication-renholder-role-world.test.js: PASS');
