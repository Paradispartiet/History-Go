#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const KEY = 'naeringsliv/administrasjonsmedarbeider';
const ROLE = 'administrasjonsmedarbeider';
const MODEL_PATH = 'data/Civication/roleModels/naeringsliv/okonomi_og_administrasjonsmedarbeider.json';
const PEOPLE_PATH = 'data/Civication/mailFamilies/naeringsliv/people/administrasjonsmedarbeider_people.json';
const PLAN_PATH = 'data/Civication/mailPlans/naeringsliv/administrasjonsmedarbeider_plan.json';
const WORLD_PATH = 'data/Civication/roleWorlds/naeringsliv/administrasjonsmedarbeider.json';
const FAMILY_ID = 'administrasjonsmedarbeider_profesjonelle_arbeidsrelasjoner';
const REMAINING_REALISM_DIMENSION = ['situated', 'reputation'].join('_');
const ACTOR_IDS = [
  'nora_administrasjonskoordinator',
  'marius_regnskapsmedarbeider_admin',
  'lea_innkjopskoordinator_admin',
  'eirik_driftskontakt_admin'
];
const MAIL_IDS = [
  'administrasjonsmedarbeider_people_nora_handoff_001',
  'administrasjonsmedarbeider_people_marius_documentation_001',
  'administrasjonsmedarbeider_people_lea_purchase_001',
  'administrasjonsmedarbeider_people_eirik_drift_001'
];

const read = (rel) => JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8'));
const run = (script, args = []) => {
  const result = spawnSync(process.execPath, [script, ...args], { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) {
    process.stderr.write(result.stdout || '');
    process.stderr.write(result.stderr || '');
  }
  assert.equal(result.status, 0, `${script} ${args.join(' ')} must pass`);
};

run('scripts/audit-civication-career-gameplay.mjs', ['--check']);
run('scripts/audit-civication-role-world-rollout-readiness.mjs', ['--check']);

const sourceFirst = fs.readFileSync(path.join(ROOT, 'reports/CIVICATION_NAERINGSLIV_ADMINISTRASJONSMEDARBEIDER_PREREQUISITES_SOURCE_FIRST.md'), 'utf8');
assert.match(sourceFirst, /not.*Role World completion/i);
assert.ok(sourceFirst.includes(REMAINING_REALISM_DIMENSION), 'Source-first contract must name the one deferred realism dimension');
assert.match(sourceFirst, /fictional/i);
assert.match(sourceFirst, /20-step/i);

const model = read(MODEL_PATH);
assert.equal(model.category, 'naeringsliv');
assert.equal(model.role_id, 'naeringsliv_okonomi_og_administrasjonsmedarbeider');
assert.equal(model.related_people.length, 4);
assert.deepEqual(model.related_people.map((actor) => actor.id), ACTOR_IDS);
for (const actor of model.related_people) {
  assert.equal(actor.fictional_scenario_actor, true, `${actor.id}: must be explicitly fictional`);
  assert.equal(actor.canonical_person_ref, null, `${actor.id}: must not impersonate canonical People`);
  assert.ok(String(actor.role || '').length >= 8, `${actor.id}: typed professional role required`);
  assert.ok(String(actor.function || '').length >= 80, `${actor.id}: work function too shallow`);
  assert.ok(String(actor.authority_relation || '').length >= 90, `${actor.id}: authority relation too shallow`);
}
assert.ok((model.related_places || []).length >= 4, 'Existing concrete work surfaces must remain intact');
assert.ok((model.work_life?.workplaces || []).length >= 4, 'Existing workplace declarations must remain intact');
assert.ok((model.authority_boundary?.may || []).length >= 4, 'Existing positive authority contract must remain intact');
assert.ok((model.authority_boundary?.may_not || []).length >= 4, 'Existing forbidden authority contract must remain intact');

const catalog = read(PEOPLE_PATH);
const professionalFamilies = (catalog.families || []).filter((family) => family.id === FAMILY_ID);
assert.equal(professionalFamilies.length, 1, 'Exactly one professional relationship family must be materialized');
const family = professionalFamilies[0];
assert.deepEqual(family.fictional_scenario_actors, ACTOR_IDS);
assert.equal(family.mails.length, 4);
assert.deepEqual(family.mails.map((mail) => mail.id), MAIL_IDS);
assert.deepEqual(family.mails.map((mail) => mail.actor_id), ACTOR_IDS);
for (const mail of family.mails) {
  assert.equal(mail.mail_type, 'people');
  assert.equal(mail.role_scope, ROLE);
  assert.equal(mail.channel, 'work');
  assert.equal(mail.messageChannel, 'work');
  assert.equal(mail.mail_class, 'professional_message');
  assert.equal(mail.repeatable, false);
  assert.equal(mail.person_id, mail.actor_id, `${mail.id}: canonical person_id must bind the professional actor`);
  assert.equal(mail.people_ref, mail.actor_id, `${mail.id}: canonical people_ref must bind the professional actor`);
  assert.ok((model.work_life.workplaces || []).includes(mail.place_id), `${mail.id}: must use an existing role-owned work surface`);
  assert.equal(mail.work_context, undefined, `${mail.id}: ordinary People encounter must not fake persistent work-object context`);
  assert.ok(String(mail.summary || '').length >= 140, `${mail.id}: summary too shallow`);
  assert.ok(Array.isArray(mail.situation) && mail.situation.length >= 3, `${mail.id}: situation depth`);
  assert.ok(Array.isArray(mail.choices) && mail.choices.length >= 2, `${mail.id}: meaningful choices required`);
  for (const candidate of mail.choices) {
    assert.ok(String(candidate.feedback || '').length >= 90, `${mail.id}/${candidate.id}: feedback too shallow`);
    assert.ok(candidate.effects && Object.keys(candidate.effects).length >= 3, `${mail.id}/${candidate.id}: effects required`);
  }
}

const plan = read(PLAN_PATH);
assert.equal(plan.sequence.length, 20, 'The canonical two-week plan must remain exactly 20 steps');
assert.deepEqual(plan.sequence.map((step) => step.step), Array.from({ length: 20 }, (_, index) => index + 1));
assert.ok(plan.sequence.every((step) => !(step.allowed_families || []).includes(FAMILY_ID)), 'Prerequisite professional People material must not rewrite the existing practice plan');

const matrix = read('data/Civication/careerGameplayMatrix.json');
const world = matrix.worlds.find((row) => row.key === KEY);
assert.ok(world, 'Administrasjonsmedarbeider must remain in Career Gameplay Matrix');
assert.equal(world.status, 'playable');
assert.equal(world.audit.components.people.level, 'complete', 'Career People prerequisite must be closed');
assert.equal(world.audit.components.places.level, 'complete', 'Existing Places coverage must remain complete');
assert.equal(world.audit.components.day_one.level, 'complete');
assert.equal(world.audit.components.workday_loop.level, 'complete');
assert.equal(world.audit.components.mail.level, 'complete');
assert.equal(world.audit.components.knowledge.level, 'complete');
assert.equal(world.audit.components.authority.level, 'complete');
assert.equal(world.audit.runtime_gate, true, 'Completing People must reopen the existing career runtime gate');

const readiness = read('data/Civication/roleWorldRolloutReadiness.json');
const ready = readiness.roles.find((row) => row.key === KEY);
assert.ok(ready, 'Administrasjonsmedarbeider must remain classified by readiness');
assert.equal(ready.classification, 'rollout_ready');
assert.equal(ready.runtime_gate, true);
assert.equal(ready.dimensions.people_places_integrity.status, 'foundation_ready');
assert.equal(ready.cross_role.need, 'not_required_for_rollout');
assert.equal(readiness.gate.gate_pass, true);
assert.equal(readiness.gate.broad_rollout_allowed_now, true);

const roleWorldIndex = read('data/Civication/roleWorlds/index.json');
const roleWorldEntry = (roleWorldIndex.roles || []).find((row) => row.category === 'naeringsliv' && row.role_scope === ROLE);
const roleWorldExists = fs.existsSync(path.join(ROOT, WORLD_PATH));

if (!roleWorldExists) {
  assert.equal(ready.dimensions[REMAINING_REALISM_DIMENSION].status, 'needs_role_authored_work');
  assert.deepEqual(ready.authored_work_required, [REMAINING_REALISM_DIMENSION], 'Exactly one rollout-authored realism dimension must remain before Role World completion');
  assert.equal(ready.already_reference_or_pilot, false);
  assert.ok(readiness.first_wave_candidates.some((row) => row.key === KEY), 'Newly rollout-ready role must re-enter the controlled first wave');
  assert.ok((readiness.rollout_queue || []).some((row) => row.key === KEY), 'Prerequisite-complete role must remain in rollout queue until Role World completion');
  assert.match(readiness.gate.next_required_pr, /Role World rollout:/);
  assert.match(readiness.gate.next_required_pr, /administrasjonsmedarbeider/);
  assert.equal(roleWorldEntry, undefined, 'Prerequisite PR must not materialize Role World completion');
} else {
  const completedWorld = read(WORLD_PATH);
  assert.equal(completedWorld.status, 'role_world_complete', 'Existing Administrasjonsmedarbeider Role World must be complete');
  assert.equal(ready.dimensions[REMAINING_REALISM_DIMENSION].status, 'foundation_ready', 'Completed Role World must replace the deferred realism debt with authored standing evidence');
  assert.deepEqual(ready.authored_work_required, [], 'Completed Role World must leave no authored readiness debt for Administrasjonsmedarbeider');
  assert.equal(ready.already_reference_or_pilot, true, 'Completed Role World must be recognized by readiness');
  assert.ok(!(readiness.first_wave_candidates || []).some((row) => row.key === KEY), 'Completed Role World must leave the controlled first wave');
  assert.ok(!(readiness.rollout_queue || []).some((row) => row.key === KEY), 'Completed Role World must leave the rollout queue');
  assert.notEqual(readiness.gate.next_required_pr, 'Role World rollout: naeringsliv/administrasjonsmedarbeider', 'Completed Role World cannot remain the next required rollout');
  assert.deepEqual(roleWorldEntry, { category: 'naeringsliv', role_scope: ROLE, status: 'role_world_complete', path: WORLD_PATH });
}

const registry = read('data/Civication/compiledSceneRegistryV1.json');
for (const id of MAIL_IDS) {
  const entry = registry.entries.find((row) => row.id === id);
  assert.ok(entry, `${id}: professional People scene must compile into the existing Scene Pipeline`);
  assert.equal(entry.role_scope, ROLE);
  assert.equal(entry.compatibility_projection?.role_scope, ROLE);
  assert.equal(entry.compatibility_projection?.person_id, family.mails.find((mail) => mail.id === id).actor_id, `${id}: compiled People binding must preserve actor identity`);
  assert.ok((model.work_life.workplaces || []).includes(entry.compatibility_projection?.place_id), `${id}: compiled scene must preserve an existing work surface`);
  assert.equal(entry.compatibility_projection?.work_context, undefined, `${id}: compiled ordinary People scene must remain outside persistent work-object context`);
}

console.log(roleWorldExists
  ? 'PASS: Administrasjonsmedarbeider prerequisite foundations remain intact after Role World completion and readiness correctly removes the completed role from the rollout queue.'
  : 'PASS: Administrasjonsmedarbeider professional People prerequisite closes career People/Places integrity, preserves the two-week plan and authority, and makes the role rollout_ready with exactly one deferred realism dimension.');
