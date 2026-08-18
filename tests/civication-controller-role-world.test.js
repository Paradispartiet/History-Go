#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');
const rel = (p) => path.join(ROOT, p);
const readJson = (p) => JSON.parse(fs.readFileSync(rel(p), 'utf8'));
const worldPath = 'data/Civication/roleWorlds/naeringsliv/controller.json';
const modelPath = 'data/Civication/roleModels/naeringsliv/controller.json';
const matrixPath = 'data/Civication/careerGameplayMatrix.json';
const themeBankPath = 'data/Civication/roleWorldThemeBank.json';
const manifestPath = 'data/Civication/lifestory/manifest.json';
const planPath = 'data/Civication/mailPlans/naeringsliv/controller_plan.json';
const world = readJson(worldPath);
const model = readJson(modelPath);
const matrix = readJson(matrixPath);
const themeBank = readJson(themeBankPath);
const manifest = readJson(manifestPath);
const plan = readJson(planPath);

assert.equal(world.schema, 'civication_role_world_v1');
assert.equal(world.category, 'naeringsliv');
assert.equal(world.role_scope, 'controller');
assert.equal(world.status, 'role_world_complete');
assert.equal(world.season.days, 14);
assert.deepEqual(world.season.day_phases, ['morning','lunch','afternoon','evening']);
assert.equal(world.season.coverage.length, 56);
assert.deepEqual(world.theme_ids, themeBank.reference_profiles['naeringsliv/controller']);

const coverage = new Map();
const summaries = new Set();
for (const beat of world.season.coverage) {
  const key = beat.day + '/' + beat.phase;
  assert.ok(!coverage.has(key), 'duplicate coverage ' + key);
  coverage.set(key, beat);
  assert.ok(String(beat.summary || '').trim().length >= 70, key + ': thin summary');
  assert.ok(!summaries.has(beat.summary), key + ': duplicate summary');
  summaries.add(beat.summary);
}
for (let day = 1; day <= 14; day += 1) for (const phase of ['morning','lunch','afternoon','evening']) assert.ok(coverage.has(day + '/' + phase));

const identifierFields = new Set(['id','mail_id','scene_id','scenario_id','story_id','thread_id','event_id','key']);
function collect(value, out = new Set()) {
  if (Array.isArray(value)) { for (const item of value) collect(item, out); return out; }
  if (!value || typeof value !== 'object') return out;
  for (const [key, item] of Object.entries(value)) {
    if (identifierFields.has(key) && (typeof item === 'string' || typeof item === 'number')) out.add(String(item));
    collect(item, out);
  }
  return out;
}
const cache = new Map();
const use = new Map();
function verifyRef(refString) {
  const i = String(refString).indexOf('#');
  assert.ok(i > 0 && i < String(refString).length - 1, 'materialization ref must be file#id: ' + refString);
  const file = String(refString).slice(0, i);
  const id = String(refString).slice(i + 1);
  assert.ok(fs.existsSync(rel(file)), 'missing file ' + file);
  let ids = cache.get(file);
  if (!ids) { ids = collect(readJson(file)); cache.set(file, ids); }
  assert.ok(ids.has(id), 'missing id ' + id + ' in ' + file);
  use.set(refString, (use.get(refString) || 0) + 1);
}
for (const beat of world.season.coverage) beat.materialization_refs.forEach(verifyRef);
for (const aftermath of world.private_aftermath) aftermath.materialization_refs.forEach(verifyRef);
assert.ok(use.size >= 45, 'expected broad Controller provenance, got ' + use.size);
const seasonUse = new Map();
for (const beat of world.season.coverage) for (const refString of beat.materialization_refs) seasonUse.set(refString, (seasonUse.get(refString) || 0) + 1);
assert.ok(Math.max(...seasonUse.values()) <= 4, 'no single source may carry more than four season beats');

assert.ok(world.recurring_people_archetypes.length >= 8);
const npcIds = new Set(world.recurring_people_archetypes.map((entry) => entry.id));
for (const id of ['ingrid_okonomisjef','marius_regnskap','driftsleder','revisor','markedssjef','innkjoper','venn','familie']) assert.ok(npcIds.has(id), 'missing NPC ' + id);
assert.ok(world.primary_threads.length >= 6);
for (const thread of world.primary_threads) {
  assert.ok(thread.beat_refs.length >= 5 && thread.beat_refs.length <= 10);
  const days = new Set();
  for (const ref of thread.beat_refs) { assert.ok(coverage.has(ref), 'missing beat ' + ref); days.add(Number(ref.split('/')[0])); }
  assert.ok(days.size >= 3, thread.id + ': must span at least three days');
}
const phaseOrder = new Map([['morning',0],['lunch',1],['afternoon',2],['evening',3]]);
const orderOf = (ref) => { const [day, phase] = ref.split('/'); return Number(day) * 10 + phaseOrder.get(phase); };
assert.ok(world.delayed_consequences.length >= 6);
for (const item of world.delayed_consequences) { assert.ok(coverage.has(item.setup_ref)); assert.ok(coverage.has(item.return_ref)); assert.ok(orderOf(item.return_ref) > orderOf(item.setup_ref)); }
assert.equal(world.materialization.no_new_runtime, true);

assert.equal(model.role_scope, 'controller');
assert.equal(model.role_id, 'naer_controller');
const resolver = require('../js/Civication/systems/civicationCareerRoleResolver.js');
assert.equal(resolver.resolveCareerRoleScope({ career_id: 'naeringsliv', role_id: 'naer_controller' }), 'controller');
assert.equal(resolver.resolveCareerRoleScope({ career_id: 'naeringsliv', title: 'Controller' }), 'controller');
assert.ok(plan.outcome_rules.mastery.length >= 3);
assert.ok(plan.outcome_rules.risk.length >= 3);

const life = manifest.roles.controller;
assert.ok(life);
assert.equal(life.role_scope, 'controller');
assert.equal(life.badge_id, 'naeringsliv');
const lifeApi = require('../js/Civication/lifestory/lifestoryContent.js');
lifeApi.buildContent({
  role: readJson(life.role),
  phaseDefinitions: readJson('data/Civication/lifestory/shared/phaseDefinitions.json'),
  roleThreads: readJson(life.threads),
  roleScenes: readJson(life.scenes),
  lifeThreads: readJson('data/Civication/lifestory/life/threads.json'),
  lifeScenes: readJson('data/Civication/lifestory/life/scenes.json')
});

execFileSync(process.execPath, ['tests/civication-controller-two-week-flow.test.js'], { cwd: ROOT, stdio: 'pipe' });
execFileSync(process.execPath, ['scripts/audit-civication-career-gameplay.mjs', '--check'], { cwd: ROOT, stdio: 'pipe' });
const career = matrix.worlds.find((entry) => entry.key === 'naeringsliv/controller');
assert.ok(career);
assert.equal(career.status, 'reference_complete');
assert.equal(career.audit.complete_components.length, 15);
assert.equal(career.audit.missing_components.length, 0);
assert.equal(career.audit.life_story_complete, true);
assert.deepEqual(career.audit.practice_weeks, ['1','2']);
console.log('civication-controller-role-world.test.js: PASS');
