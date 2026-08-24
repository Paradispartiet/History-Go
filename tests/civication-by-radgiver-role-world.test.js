#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const rel = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(rel(p), 'utf8'));

const worldPath = 'data/Civication/roleWorlds/by/by_radgiver_plan.json';
const modelPath = 'data/Civication/roleModels/by/by_radgiver_plan.json';
const matrixPath = 'data/Civication/careerGameplayMatrix.json';
const themeBankPath = 'data/Civication/roleWorldThemeBank.json';
const registryPath = 'data/Civication/praksisfortellinger_registry.json';
const planPath = 'data/Civication/mailPlans/by/by_radgiver_plan_plan.json';
const jobPath = 'data/Civication/mailFamilies/by/job/by_radgiver_plan_job.json';
const peoplePath = 'data/Civication/mailFamilies/by/people/by_radgiver_plan_people.json';

const world = readJson(worldPath);
const model = readJson(modelPath);
const matrix = readJson(matrixPath);
const themeBank = readJson(themeBankPath);
const registry = readJson(registryPath);
const plan = readJson(planPath);
const job = readJson(jobPath);
const people = readJson(peoplePath);

assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.category, 'by');
assert.equal(world.role_scope, 'by_radgiver_plan');
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning', 'lunch', 'afternoon', 'evening']);
assert.equal(world.season.coverage.length, 56);
assert.deepEqual(world.theme_ids, themeBank.reference_profiles['by/by_radgiver_plan']);

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

const identifierFields = new Set(['id', 'mail_id', 'scene_id', 'scenario_id', 'story_id', 'thread_id', 'event_id', 'key']);
function collectDeclaredIdentifiers(value, out = new Set()) {
  if (Array.isArray(value)) {
    for (const item of value) collectDeclaredIdentifiers(item, out);
    return out;
  }
  if (!value || typeof value !== 'object') return out;
  for (const [key, item] of Object.entries(value)) {
    if (identifierFields.has(key) && (typeof item === 'string' || typeof item === 'number')) out.add(String(item));
    collectDeclaredIdentifiers(item, out);
  }
  return out;
}

const sourceIdentifierCache = new Map();
const materializationUse = new Map();
function verifyMaterializationRef(refString) {
  const hashIndex = String(refString).indexOf('#');
  assert.ok(hashIndex > 0 && hashIndex < String(refString).length - 1, `materialization ref must be file#id: ${refString}`);
  const filePath = String(refString).slice(0, hashIndex);
  const objectId = String(refString).slice(hashIndex + 1);
  assert.ok(fs.existsSync(rel(filePath)), `missing materialization file ${filePath}`);
  let declaredIds = sourceIdentifierCache.get(filePath);
  if (!declaredIds) {
    declaredIds = collectDeclaredIdentifiers(readJson(filePath));
    sourceIdentifierCache.set(filePath, declaredIds);
  }
  assert.ok(declaredIds.has(objectId), `missing materialization id ${objectId} in ${filePath}`);
  materializationUse.set(refString, (materializationUse.get(refString) || 0) + 1);
}

for (const beat of world.season.coverage) {
  assert.ok(Array.isArray(beat.materialization_refs) && beat.materialization_refs.length > 0);
  beat.materialization_refs.forEach(verifyMaterializationRef);
}
for (const aftermath of world.private_aftermath) aftermath.materialization_refs.forEach(verifyMaterializationRef);
for (const sourcePath of world.materialization.source_refs) {
  assert.ok(fs.existsSync(rel(sourcePath)), `missing Role World source ${sourcePath}`);
}
assert.ok(materializationUse.size >= 45, `expected broad By-rådgiver provenance, got ${materializationUse.size} unique refs`);
const seasonUse = new Map();
for (const beat of world.season.coverage) {
  for (const refString of beat.materialization_refs) seasonUse.set(refString, (seasonUse.get(refString) || 0) + 1);
}
assert.ok(Math.max(...seasonUse.values()) <= 4, 'no single authored source may carry more than four season beats');

assert.ok(world.recurring_people_archetypes.length >= 8);
const npcIds = new Set(world.recurring_people_archetypes.map((npc) => npc.id));
for (const id of ['elin_plansjef', 'ivar_utbygger', 'hanne_beboer', 'signe_byokolog', 'nora_planjuss', 'maja_utvalgssekretaer', 'venn', 'familie']) {
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
assert.equal(model.role_scope, 'by_radgiver_plan');
assert.equal(model.role_id, 'by_radgiver_plan');

const resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
assert.equal(resolver.resolveCareerRoleScope({ career_id: 'by', role_id: 'by_radgiver_plan' }), 'by_radgiver_plan');
assert.equal(resolver.resolveCareerRoleScope({ career_id: 'by', title: 'Arealplanlegger' }), 'by_radgiver_plan');
assert.equal(resolver.resolveCareerRoleScope({ career_id: 'by', title: 'Rådgiver (byutvikling)' }), 'by_radgiver_plan');

const role = registry.roles.find((entry) => entry.role_id === 'by_radgiver_plan');
assert.ok(role, 'Praksisfortellinger registry must include by_radgiver_plan');
assert.deepEqual(role.packages.map((pkg) => pkg.week), [1, 2]);
assert.deepEqual(role.packages.map((pkg) => [pkg.step_start, pkg.step_end]), [[13, 22], [23, 32]]);
for (const pkg of role.packages) {
  assert.equal(pkg.expected_job_threads, 5);
  assert.equal(pkg.expected_private_threads, 5);
  assert.equal(pkg.test_file, 'tests/civication-by-radgiver-role-world.test.js');
}
assert.equal(plan.sequence.length, 38, 'By-rådgiver plan should preserve 12 authored steps, two ten-step practice weeks, and six Role World realism steps');
for (const [pkgIndex, pkg] of role.packages.entries()) {
  const steps = plan.sequence.slice(pkg.step_start - 1, pkg.step_end);
  assert.equal(steps.length, 10);
  for (const [index, step] of steps.entries()) {
    const expectedType = index % 2 === 0 ? 'job' : 'people';
    const expectedFamily = expectedType === 'job' ? pkg.job_family : pkg.private_family;
    assert.equal(step.type, expectedType, `${pkg.package_id} step ${index + 1}: wrong type`);
    assert.deepEqual(step.allowed_families, [expectedFamily]);
    assert.deepEqual(step.fallback_types, []);
  }
}

const familyById = new Map([
  ...(job.families || []).map((family) => [family.id, family]),
  ...(people.families || []).map((family) => [family.id, family])
]);
const practiceMails = [];
for (const pkg of role.packages) {
  const jobFamily = familyById.get(pkg.job_family);
  const privateFamily = familyById.get(pkg.private_family);
  assert.ok(jobFamily && privateFamily, `${pkg.package_id}: missing practice family`);
  assert.equal(jobFamily.mails.length, 5);
  assert.equal(privateFamily.mails.length, 5);
  practiceMails.push(...jobFamily.mails, ...privateFamily.mails);
}
assert.equal(new Set(practiceMails.map((mail) => mail.id)).size, 20, 'practice mail ids must be unique');
for (const mail of practiceMails) {
  assert.equal(mail.planned_only, true, `${mail.id}: practice mail must stay plan-only`);
  assert.equal(mail.role_scope, 'by_radgiver_plan');
  assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id}: choices`);
  assert.ok(Array.isArray(mail.situation) && mail.situation.length >= 2, `${mail.id}: situation`);
}
const allChoiceText = JSON.stringify(practiceMails.map((mail) => mail.choices));
for (const signal of ['integrity', 'local_knowledge', 'traceability', 'manager_trust', 'legal_precision', 'political_readability', 'relationship_private', 'energy']) {
  assert.ok(allChoiceText.includes(signal), `practice packages must carry ${signal}`);
}

execFileSync(process.execPath, ['tests/civication-praksisfortellinger-registry-audit.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['scripts/audit-civication-career-gameplay.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' });

const careerWorld = (matrix.worlds || []).find((entry) => entry.key === 'by/by_radgiver_plan');
assert.ok(careerWorld, 'By-rådgiver must exist in Career Gameplay Matrix');
assert.equal(careerWorld.status, 'reference_complete');
assert.equal(careerWorld.audit.complete_components.length, 15);
assert.equal(careerWorld.audit.missing_components.length, 0);
assert.equal(careerWorld.audit.life_story_complete, true);
assert.deepEqual(careerWorld.audit.practice_weeks, ['1', '2']);

console.log('civication-by-radgiver-role-world.test.js: PASS');
